import React, { useState, useEffect } from 'react';
import '../styles/CRMHCFMaster.css';
import Pagination from '../components/Pagination';

// ─── Helpers ────────────────────────────────────────────────────────────────

const inputStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  padding: '8px 12px',
  width: '100%',
  fontSize: 13,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };

const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' };

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};

const modalBox = (w = 700) => ({
  background: '#fff', borderRadius: 10, padding: 28, width: '100%', maxWidth: w,
  maxHeight: '90vh', overflowY: 'auto', position: 'relative',
});

const badgeStyle = (color) => ({
  display: 'inline-flex', 
  alignItems: 'center',
  gap: 5,
  padding: '6px 14px', 
  borderRadius: 20, 
  fontSize: 11,
  fontWeight: 700, 
  background: `linear-gradient(145deg, ${color.bg}, ${color.bgDark || color.bg})`, 
  color: color.text,
  border: `1px solid ${color.border || color.text}20`,
  boxShadow: `0 2px 4px ${color.text}15`,
  letterSpacing: '0.02em',
  textTransform: 'capitalize',
});

const STATUS_COLORS = {
  Active:        { bg: '#d1fae5', bgDark: '#a7f3d0', text: '#065f46', border: '#34d399', icon: '✓' },
  Pending:       { bg: '#fef3c7', bgDark: '#fde68a', text: '#92400e', border: '#fbbf24', icon: '⏳' },
  Approved:      { bg: '#d1fae5', bgDark: '#a7f3d0', text: '#065f46', border: '#34d399', icon: '✓' },
  Rejected:      { bg: '#fee2e2', bgDark: '#fecaca', text: '#991b1b', border: '#f87171', icon: '✗' },
  Suspended:     { bg: '#fce7f3', bgDark: '#fbcfe8', text: '#9d174d', border: '#f472b6', icon: '⏸' },
  Closed:        { bg: '#f1f5f9', bgDark: '#e2e8f0', text: '#475569', border: '#94a3b8', icon: '●' },
  Defaulter:     { bg: '#fee2e2', bgDark: '#fecaca', text: '#991b1b', border: '#f87171', icon: '!' },
  Deregistered:  { bg: '#e5e7eb', bgDark: '#d1d5db', text: '#374151', border: '#6b7280', icon: '○' },
  'Slow Payer':  { bg: '#fef3c7', bgDark: '#fde68a', text: '#92400e', border: '#fbbf24', icon: '⏳' },
  'Late Payer':  { bg: '#ffedd5', bgDark: '#fed7aa', text: '#9a3412', border: '#fb923c', icon: '⚠' },
  Open:          { bg: '#dbeafe', bgDark: '#bfdbfe', text: '#1e40af', border: '#60a5fa', icon: '○' },
  'In Progress': { bg: '#fef3c7', bgDark: '#fde68a', text: '#92400e', border: '#fbbf24', icon: '◐' },
  Resolved:      { bg: '#d1fae5', bgDark: '#a7f3d0', text: '#065f46', border: '#34d399', icon: '✓' },
  Critical:      { bg: '#fee2e2', bgDark: '#fecaca', text: '#991b1b', border: '#f87171', icon: '!!' },
  High:          { bg: '#ffedd5', bgDark: '#fed7aa', text: '#9a3412', border: '#fb923c', icon: '!' },
  Medium:        { bg: '#fef9c3', bgDark: '#fef08a', text: '#713f12', border: '#facc15', icon: '●' },
  Low:           { bg: '#d1fae5', bgDark: '#a7f3d0', text: '#065f46', border: '#34d399', icon: '○' },
};

function StatusBadge({ value }) {
  const c = STATUS_COLORS[value] || { bg: '#f1f5f9', bgDark: '#e2e8f0', text: '#475569', border: '#94a3b8', icon: '●' };
  return (
    <span style={badgeStyle(c)}>
      <span style={{ fontSize: 10, opacity: 0.8 }}>{c.icon}</span>
      {value}
    </span>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color, color: '#fff', border: 'none', borderRadius: 5,
        padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 4,
      }}
    >{label}</button>
  );
}

function Toast({ toast }) {
  if (!toast.msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: toast.type === 'success' ? '#065f46' : '#991b1b',
      color: '#fff', padding: '12px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>{toast.msg}</div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>×</button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required }) {
  return (
    <Field label={label + (required ? ' *' : '')}>
      <input type={type} value={value} onChange={onChange} style={inputStyle} required={required} />
    </Field>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <Field label={label + (required ? ' *' : '')}>
      <select value={value} onChange={onChange} style={inputStyle} required={required}>
        <option value="">-- Select --</option>
        {options.map(o => (
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

function Textarea({ label, value, onChange, required }) {
  return (
    <Field label={label + (required ? ' *' : '')}>
      <textarea value={value} onChange={onChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} required={required} />
    </Field>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null; // Invalid date
  const diff = d - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Component ──────────────────────────────────────────────────────────

const CRMHCFMaster = ({ user }) => {
  const [activeSubModule, setActiveSubModule] = useState('crm-hcf-master');
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Shared dropdown data
  const [zones, setZones] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [servicePlans, setServicePlans] = useState([]);
  const [hcfMaster, setHcfMaster] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [z, r, c, sp, hcf] = await Promise.all([
          fetch('/api/zones').then(x => x.json()).catch(() => []),
          fetch('/api/routes').then(x => x.json()).catch(() => []),
          fetch('/api/categories').then(x => x.json()).catch(() => []),
          fetch('/api/serviceplans').then(x => x.json()).catch(() => []),
          fetch('/api/hcf-master').then(x => x.json()).catch(() => ({ data: [] })),
        ]);
        setZones(Array.isArray(z) ? z : []);
        setRoutes(Array.isArray(r) ? r : []);
        setCategories(Array.isArray(c) ? c : []);
        setServicePlans(Array.isArray(sp) ? sp : []);
        setHcfMaster(Array.isArray(hcf) ? hcf : (hcf.data || []));
      } catch { /* silent */ }
    };
    loadDropdowns();
  }, []);

  const refreshHcfMaster = async () => {
    try {
      const json = await fetch('/api/hcf-master').then(x => x.json());
      setHcfMaster(Array.isArray(json) ? json : (json.data || []));
    } catch { /* silent */ }
  };

  const subMenuItems = [
    { id: 'crm-hcf-master', icon: '🏥', label: 'HCF Master — 360° View' },
    { id: 'crm-approval',   icon: '✅', label: 'Approval Pipeline' },
    { id: 'crm-renewal',    icon: '🔄', label: 'Renewal Management' },
    { id: 'crm-deregister', icon: '🚫', label: 'De-register / Closure' },
    { id: 'crm-support',    icon: '🎧', label: 'Customer Support' },
  ];

  const renderSubModule = () => {
    const props = { zones, routes, categories, servicePlans, hcfMaster, refreshHcfMaster, showToast, user };
    switch (activeSubModule) {
      case 'crm-hcf-master':  return <HCFMasterModule {...props} />;
      case 'crm-approval':    return <ApprovalPipelineModule {...props} />;
      case 'crm-renewal':     return <RenewalModule {...props} />;
      case 'crm-deregister':  return <DeregisterModule {...props} />;
      case 'crm-support':     return <SupportModule {...props} />;
      default:                return null;
    }
  };

  return (
    <div className="crm-hcf-wrapper">
      <Toast toast={toast} />

      {/* Sidebar */}
      <div className={`submenu-sidebar${sidebarCollapsed ? ' collapsed' : ''}`} style={{
        width: sidebarCollapsed ? 60 : 240,
        minWidth: sidebarCollapsed ? 60 : 240,
        transition: 'all 0.3s ease',
      }}>
        <div className="submenu-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? '16px 8px' : '16px 18px',
        }}>
          {!sidebarCollapsed && <span>CRM / HCF</span>}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#a5b4fc',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>
        {subMenuItems.map(item => (
          <button
            key={item.id}
            className={`submenu-item${activeSubModule === item.id ? ' active' : ''}`}
            onClick={() => setActiveSubModule(item.id)}
            style={{
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px 8px' : '12px 18px',
            }}
            title={sidebarCollapsed ? item.label : ''}
          >
            <span className="submenu-icon" style={{ 
              marginRight: sidebarCollapsed ? 0 : 12,
              fontSize: sidebarCollapsed ? 20 : 18,
            }}>{item.icon}</span>
            {!sidebarCollapsed && <span className="submenu-label">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="submenu-content">
        {renderSubModule()}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HCF MASTER MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const HCFMasterModule = ({ zones, routes, categories, servicePlans, showToast, hcfMaster, refreshHcfMaster }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({});

  // Column filter configuration
  const columnFilterConfig = [
    { key: 'RegistrationID', type: 'text', placeholder: 'ID...' },
    { key: 'InstitutionName', type: 'text', placeholder: 'Name...' },
    { key: 'Category', type: 'text', placeholder: 'Category...' },
    { key: 'Zone', type: 'text', placeholder: 'Zone...' },
    { key: 'Route', type: 'text', placeholder: 'Route...' },
    { key: 'ContactPerson', type: 'text', placeholder: 'Contact...' },
    { key: 'Mobile', type: 'text', placeholder: 'Mobile...' },
    { key: 'Status', type: 'select', options: ['All', 'Active', 'Pending', 'Suspended', 'Late Payer', 'Slow Payer', 'Defaulter', 'Deregistered'] },
    { key: 'CreatedAt', type: 'date', placeholder: 'Reg Date' },
    { key: 'RenewalDate', type: 'date', placeholder: 'Renewal' },
    { key: 'Outstanding', type: 'text', placeholder: 'Amt...' },
    { key: 'Docs', type: 'none' },
    { key: 'Actions', type: 'none' }
  ];

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Apply column filters
  const applyColumnFilters = (data) => {
    if (!data || data.length === 0) return [];
    return data.filter(item => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if (!value || value === '' || value === 'All') return true;
        const itemValue = item[key];
        // Date filtering
        if (key === 'CreatedAt' || key === 'RenewalDate') {
          if (!itemValue) return false;
          const itemDate = new Date(itemValue).toISOString().split('T')[0];
          return itemDate === value;
        }
        // Text filtering
        if (itemValue === null || itemValue === undefined) return false;
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  };

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [show360Modal, setShow360Modal] = useState(false);
  const [view360Row, setView360Row] = useState(null);

  // Re-registration Modal
  const [showReregModal, setShowReregModal] = useState(false);
  const [reregRow, setReregRow] = useState(null);
  const [reregForm, setReregForm] = useState({
    ContractStartDate: new Date().toISOString().split('T')[0],
    ContractDuration: '12',
    BillingCycle: 'Monthly',
    PaymentMode: 'Online',
    RegFee: '',
    SvcFee: '',
    MoUReSigned: true,
    GenerateCertificate: true,
    Remarks: ''
  });
  const [savingRereg, setSavingRereg] = useState(false);

  const blankForm = {
    InstitutionName: '', Category: '', NumberOfBeds: '', BmwRegNo: '',
    FullAddress: '', Zone: '', Route: '', Pincode: '',
    ContactPerson: '', Designation: '', Mobile: '', Email: '', AlternateMobile: '', Website: '',
    PanNumber: '', GstNumber: '', GpsLatitude: '', GpsLongitude: '',
    SelectedPlan: '', BillingCycle: 'Monthly',
  };
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  // Documents Modal State
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsRow, setDocsRow] = useState(null);
  const [docsData, setDocsData] = useState([]);
  const [loadingDocsData, setLoadingDocsData] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hcf-master');
      const json = await res.json();
      setData(Array.isArray(json) ? json : (json.data || []));
    } catch { showToast('Failed to load HCF data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Open Documents Modal
  const openDocsModal = async (row) => {
    setDocsRow(row);
    setShowDocsModal(true);
    setLoadingDocsData(true);
    try {
      const res = await fetch(`/api/hcf-documents?registrationId=${row.RegistrationID}`);
      const json = await res.json();
      setDocsData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load documents', 'error'); }
    finally { setLoadingDocsData(false); }
  };

  // First apply search bar filters
  const searchFiltered = data.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || (r.InstitutionName || '').toLowerCase().includes(q) || String(r.RegistrationID || '').includes(q) || (r.Mobile || '').includes(q);
    const matchZ = !filterZone || r.Zone === filterZone;
    const matchS = !filterStatus || r.Status === filterStatus;
    const matchC = !filterCategory || r.Category === filterCategory;
    return matchQ && matchZ && matchS && matchC;
  });
  
  // Then apply column filters
  const filtered = applyColumnFilters(searchFiltered);

  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const stats = {
    total:        data.length,
    active:       data.filter(r => r.Status === 'Active').length,
    latePayer:    data.filter(r => r.Status === 'Late Payer').length,
    slowPayer:    data.filter(r => r.Status === 'Slow Payer').length,
    defaulter:    data.filter(r => r.Status === 'Defaulter').length,
    suspended:    data.filter(r => r.Status === 'Suspended').length,
    renewal:      data.filter(r => r.CreatedAt && new Date(r.CreatedAt) < elevenMonthsAgo).length,
    closed:       data.filter(r => r.Status === 'Closed').length,
    deregistered: data.filter(r => r.Status === 'Deregistered').length,
  };

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = showEditModal;
      const url = isEdit ? `/api/customer-registrations/${editRow.RegistrationID}` : '/api/customer-registrations';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      showToast(isEdit ? 'HCF updated' : 'HCF created');
      setShowNewModal(false);
      setShowEditModal(false);
      setForm(blankForm);
      load();
      refreshHcfMaster();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setForm({
      InstitutionName: row.InstitutionName || '', Category: row.Category || '',
      NumberOfBeds: row.NumberOfBeds || '', BmwRegNo: row.BmwRegNo || '',
      FullAddress: row.FullAddress || '', Zone: row.Zone || '', Route: row.Route || '', Pincode: row.Pincode || '',
      ContactPerson: row.ContactPerson || '', Designation: row.Designation || '',
      Mobile: row.Mobile || '', Email: row.Email || '', AlternateMobile: row.AlternateMobile || '',
      Website: row.Website || '', PanNumber: row.PanNumber || '', GstNumber: row.GstNumber || '',
      GpsLatitude: row.GpsLatitude || '', GpsLongitude: row.GpsLongitude || '',
      SelectedPlan: row.SelectedPlan || '', BillingCycle: row.BillingCycle || 'Monthly',
    });
    setShowEditModal(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete HCF: ${row.InstitutionName}?`)) return;
    try {
      await fetch(`/api/customer-registrations/${row.RegistrationID}`, { method: 'DELETE' });
      showToast('Deleted');
      load();
      refreshHcfMaster();
    } catch { showToast('Delete failed', 'error'); }
  };

  const openReregModal = (row) => {
    setReregRow(row);
    setReregForm({
      ContractStartDate: new Date().toISOString().split('T')[0],
      ContractDuration: '12',
      BillingCycle: row.BillingCycle || 'Monthly',
      PaymentMode: row.PaymentModePreference || 'Online',
      RegFee: '',
      SvcFee: row.SvcFee || '',
      MoUReSigned: true,
      GenerateCertificate: true,
      Remarks: ''
    });
    setShowReregModal(true);
  };

  const handleReregSubmit = async (e) => {
    e.preventDefault();
    if (!reregRow) return;
    setSavingRereg(true);
    try {
      const res = await fetch(`/api/hcf-master/${reregRow.RegistrationID}/reactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reregForm)
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      showToast('HCF re-registered successfully!', 'success');
      setShowReregModal(false);
      setReregRow(null);
      load();
      refreshHcfMaster();
    } catch { showToast('Re-registration failed', 'error'); }
    finally { setSavingRereg(false); }
  };

  const HCFForm = () => (
    <form onSubmit={handleSave}>
      <div style={formGrid}>
        <Input label="Institution Name" value={form.InstitutionName} onChange={f('InstitutionName')} required />
        <Select label="Category / Type" value={form.Category} onChange={f('Category')} required
          options={categories.map(c => ({ value: c.CategoryName || c, label: c.CategoryName || c }))} />
        <Input label="Number of Beds" value={form.NumberOfBeds} onChange={f('NumberOfBeds')} type="number" />
        <Input label="BMW Reg No" value={form.BmwRegNo} onChange={f('BmwRegNo')} />
        <div style={{ gridColumn: '1/-1' }}>
          <Textarea label="Full Address" value={form.FullAddress} onChange={f('FullAddress')} required />
        </div>
        <Select label="Zone" value={form.Zone} onChange={f('Zone')} required
          options={zones.map(z => ({ value: z.ZoneName || z, label: z.ZoneName || z }))} />
        <Select label="Route" value={form.Route} onChange={f('Route')}
          options={routes.map(r => ({ value: r.RouteName || r, label: r.RouteName || r }))} />
        <Input label="Pincode" value={form.Pincode} onChange={f('Pincode')} />
        <Input label="Contact Person" value={form.ContactPerson} onChange={f('ContactPerson')} required />
        <Input label="Designation" value={form.Designation} onChange={f('Designation')} />
        <Input label="Mobile" value={form.Mobile} onChange={f('Mobile')} required />
        <Input label="Email" value={form.Email} onChange={f('Email')} type="email" />
        <Input label="Alternate Mobile" value={form.AlternateMobile} onChange={f('AlternateMobile')} />
        <Input label="Website" value={form.Website} onChange={f('Website')} />
        <Input label="PAN Number" value={form.PanNumber} onChange={f('PanNumber')} />
        <Input label="GST Number" value={form.GstNumber} onChange={f('GstNumber')} />
        <Input label="GPS Latitude" value={form.GpsLatitude} onChange={f('GpsLatitude')} />
        <Input label="GPS Longitude" value={form.GpsLongitude} onChange={f('GpsLongitude')} />
        <Select label="Selected Plan" value={form.SelectedPlan} onChange={f('SelectedPlan')}
          options={servicePlans.map(sp => ({ value: sp.PlanName || sp, label: sp.PlanName || sp }))} />
        <Select label="Billing Cycle" value={form.BillingCycle} onChange={f('BillingCycle')}
          options={['Monthly', 'Quarterly', 'Annual']} />
      </div>
      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-export" onClick={() => { setShowNewModal(false); setShowEditModal(false); setForm(blankForm); }}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );

  return (
    <div style={{ background:'#f8fafc', minHeight:'100%', padding:'0 0 24px' }}>
      {/* Premium Header */}
      <div style={{ 
        background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)',
        borderRadius:20, padding:'24px 28px', marginBottom:24,
        boxShadow:'0 10px 40px rgba(49,46,129,0.3)',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:0, right:0, width:200, height:200, background:'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', transform:'translate(30%,-30%)' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ 
              width:56, height:56, borderRadius:16, 
              background:'linear-gradient(135deg,#a855f7,#7c3aed)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 8px 24px rgba(168,85,247,0.4)'
            }}>
              <span style={{ fontSize:28 }}>🏥</span>
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:26, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>HCF Master — 360° View</h1>
              <p style={{ margin:'6px 0 0', fontSize:14, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>Complete healthcare facility overview & master data management</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button style={{ 
              background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)',
              border:'1.5px solid rgba(255,255,255,0.2)', color:'#fff', 
              borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8, transition:'all 0.2s'
            }}>
              <span>🔍</span> Duplicate Check
            </button>
            <button style={{ 
              background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)',
              border:'1.5px solid rgba(255,255,255,0.2)', color:'#fff', 
              borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8, transition:'all 0.2s'
            }}>
              <span>📥</span> Export
            </button>
            <button onClick={() => { setForm(blankForm); setShowNewModal(true); }} style={{ 
              background:'linear-gradient(135deg,#22c55e,#16a34a)',
              border:'none', color:'#fff', 
              borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:800, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8, 
              boxShadow:'0 4px 15px rgba(34,197,94,0.4)', transition:'all 0.2s'
            }}>
              <span style={{ fontSize:16 }}>＋</span> New HCF
            </button>
          </div>
        </div>
      </div>

      {/* Premium KPI Cards - Glass Morphism Design */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:14, marginBottom:28 }}>
        {[
          { bg:'linear-gradient(145deg,#667eea,#764ba2)', icon:'📊', val:stats.total, lbl:'Total HCFs', accent:'#a78bfa' },
          { bg:'linear-gradient(145deg,#11998e,#38ef7d)', icon:'✅', val:stats.active, lbl:'Active', accent:'#6ee7b7' },
          { bg:'linear-gradient(145deg,#f2994a,#f2c94c)', icon:'⏳', val:stats.slowPayer, lbl:'Slow Payer', accent:'#fcd34d' },
          { bg:'linear-gradient(145deg,#eb5757,#f2994a)', icon:'⚠️', val:stats.latePayer, lbl:'Late Payer', accent:'#fca5a5' },
          { bg:'linear-gradient(145deg,#c62828,#ef5350)', icon:'🚫', val:stats.defaulter, lbl:'Defaulter', accent:'#f87171' },
          { bg:'linear-gradient(145deg,#7c3aed,#a855f7)', icon:'⏸️', val:stats.suspended, lbl:'Suspended', accent:'#c4b5fd' },
          { bg:'linear-gradient(145deg,#0891b2,#22d3ee)', icon:'🔄', val:stats.renewal, lbl:'Renewal Due', accent:'#67e8f9' },
          { bg:'linear-gradient(145deg,#374151,#6b7280)', icon:'📴', val:stats.deregistered, lbl:'Deregistered', accent:'#9ca3af' },
        ].map((k, i) => (
          <div key={k.lbl} style={{ 
            background: k.bg, 
            borderRadius: 20, 
            padding: '20px 16px', 
            textAlign: 'center', 
            color: '#fff',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            cursor: 'pointer', 
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative', 
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 60px -15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
          }}>
            {/* Decorative elements */}
            <div style={{ 
              position:'absolute', top:-30, right:-30, 
              width:100, height:100, 
              background:`radial-gradient(circle, ${k.accent}40 0%, transparent 70%)`,
              borderRadius:'50%'
            }} />
            <div style={{ 
              position:'absolute', bottom:-20, left:-20, 
              width:60, height:60, 
              background:`radial-gradient(circle, ${k.accent}30 0%, transparent 70%)`,
              borderRadius:'50%'
            }} />
            
            {/* Icon */}
            <div style={{ 
              fontSize: 24, 
              marginBottom: 8,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              position: 'relative', zIndex: 1
            }}>{k.icon}</div>
            
            {/* Value */}
            <div style={{ 
              fontSize: 32, 
              fontWeight: 900, 
              lineHeight: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              position: 'relative', zIndex: 1,
              fontFamily: "'Inter', system-ui, sans-serif"
            }}>{k.val}</div>
            
            {/* Label */}
            <div style={{ 
              fontSize: 11, 
              opacity: 0.95, 
              marginTop: 8, 
              fontWeight: 700, 
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              position: 'relative', zIndex: 1
            }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Premium Filter Bar */}
      <div style={{
        display:'flex', gap:12, marginBottom:20, alignItems:'center',
        background:'#fff', border:'1px solid #e2e8f0',
        borderRadius:16, padding:'14px 20px',
        boxShadow:'0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{ 
          display:'flex', alignItems:'center', gap:10, flex:2, 
          background:'#f8fafc', borderRadius:10, padding:'10px 14px', border:'1.5px solid #e2e8f0'
        }}>
          <span style={{ fontSize:18, opacity:0.5 }}>🔍</span>
          <input placeholder="Search HCF name / mobile / ID..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border:'none', background:'transparent', fontSize:14, fontWeight:500, color:'#1e293b', flex:1, outline:'none', fontFamily:'inherit' }} />
        </div>
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
          style={{ 
            border:'1.5px solid #e2e8f0', borderRadius:10, padding:'12px 16px', fontSize:13, fontWeight:600, 
            color:'#4c1d95', background:'#f5f3ff', cursor:'pointer', minWidth:130
          }}>
          <option value="">🌐 All Zones</option>
          {zones.map(z => <option key={z.ZoneName || z} value={z.ZoneName || z}>{z.ZoneName || z}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ 
            border:'1.5px solid #e2e8f0', borderRadius:10, padding:'12px 16px', fontSize:13, fontWeight:600, 
            color:'#374151', background:'#fff', cursor:'pointer', minWidth:130
          }}>
          <option value="">📋 All Status</option>
          {['Active','Late Payer','Slow Payer','Disputed','Defaulter','Suspended','Closed','Deregistered'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ 
            border:'1.5px solid #e2e8f0', borderRadius:10, padding:'12px 16px', fontSize:13, fontWeight:600, 
            color:'#374151', background:'#fff', cursor:'pointer', minWidth:150
          }}>
          <option value="">🏥 All Categories</option>
          {['Hospital (Nursing Home)','Hospital','Clinic','Nursing Home','Diagnostic','Pharmacy'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filterZone || filterStatus || filterCategory) && (
          <button onClick={() => { setSearch(''); setFilterZone(''); setFilterStatus(''); setFilterCategory(''); }}
            style={{ 
              background:'linear-gradient(135deg,#fee2e2,#fecaca)', color:'#dc2626', 
              border:'1.5px solid #fca5a5', borderRadius:10, padding:'12px 18px', 
              fontSize:12, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap'
            }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table info bar */}
      <div style={{ 
        display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, padding:'0 4px'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ 
            fontSize:13, color:'#64748b', fontWeight:600,
            background:'#f8fafc', padding:'8px 16px', borderRadius:10, border:'1px solid #e2e8f0'
          }}>
            Showing <strong style={{ color:'#6366f1', fontSize:15 }}>{filtered.length}</strong> of <strong style={{ color:'#6366f1', fontSize:15 }}>{data.length}</strong> HCFs
          </span>
        </div>
        <span style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic', fontWeight:500 }}>
          💡 Click row header to sort · Hover row to highlight
        </span>
      </div>

      {/* Premium Table - Enterprise Design */}
      <div style={{ 
        background:'#fff', 
        borderRadius:20, 
        border:'1px solid #e2e8f0', 
        overflow:'hidden', 
        boxShadow:'0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
      }}>
        {loading ? <div style={{ padding:80, textAlign:'center', color:'#94a3b8', fontSize:14 }}>
          <div style={{ fontSize:40, marginBottom:16 }}>⏳</div>
          Loading data...
        </div> : (
          <div style={{ overflowX:'auto', scrollbarWidth:'none', msOverflowStyle:'none' }} className="hide-scrollbar">
            <table style={{ width:'100%', minWidth:1400, borderCollapse:'separate', borderSpacing:0 }}>
              <colgroup>
                <col style={{ width:60 }} />
                <col style={{ width:200 }} />
                <col style={{ width:150 }} />
                <col style={{ width:90 }} />
                <col style={{ width:100 }} />
                <col style={{ width:130 }} />
                <col style={{ width:130 }} />
                <col style={{ width:110 }} />
                <col style={{ width:100 }} />
                <col style={{ width:105 }} />
                <col style={{ width:100 }} />
                <col style={{ width:60 }} />
                <col style={{ width:160 }} />
              </colgroup>
              <thead>
                <tr>
                  {['#','Institution Name','Category','Zone','Route','Contact Person','Mobile','Status','Reg. Date','Renewal Date','Outstanding','Docs','Actions'].map((h, i) => (
                    <th key={h} style={{ 
                      padding:'18px 14px', 
                      textAlign:'left', 
                      fontWeight:700, 
                      color:'#475569', 
                      fontSize:11, 
                      textTransform:'uppercase', 
                      letterSpacing:'0.08em',
                      borderBottom:'2px solid #e2e8f0',
                      background:'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                      position:'sticky',
                      top:0,
                      zIndex:10
                    }}>{h}</th>
                  ))}
                </tr>
                {/* Column Filter Row */}
                <tr className="filter-row" style={{ background:'#f8fafc' }}>
                  {columnFilterConfig.map((cfg) => (
                    <th key={cfg.key} style={{ padding:'8px 6px', borderBottom:'1px solid #e2e8f0' }}>
                      {cfg.type === 'none' ? null : cfg.type === 'select' ? (
                        <select
                          value={columnFilters[cfg.key] || ''}
                          onChange={(e) => handleColumnFilterChange(cfg.key, e.target.value)}
                          style={{ width:'100%', padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:4, fontSize:11, background:'#fff' }}
                        >
                          {cfg.options.map(opt => <option key={opt} value={opt === 'All' ? '' : opt}>{opt}</option>)}
                        </select>
                      ) : cfg.type === 'date' ? (
                        <input
                          type="date"
                          value={columnFilters[cfg.key] || ''}
                          onChange={(e) => handleColumnFilterChange(cfg.key, e.target.value)}
                          style={{ width:'100%', padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:4, fontSize:11, background:'#fff' }}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={cfg.placeholder}
                          value={columnFilters[cfg.key] || ''}
                          onChange={(e) => handleColumnFilterChange(cfg.key, e.target.value)}
                          style={{ width:'100%', padding:'6px 8px', border:'1px solid #e2e8f0', borderRadius:4, fontSize:11 }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} style={{ padding:80, textAlign:'center', color:'#94a3b8' }}>
                    <div style={{ fontSize:48, marginBottom:16, opacity:0.5 }}>📋</div>
                    <div style={{ fontSize:15, fontWeight:600 }}>No records found</div>
                    <div style={{ fontSize:13, marginTop:4 }}>Try adjusting your search or filters</div>
                  </td></tr>
                ) : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, idx) => (
                  <tr key={row.RegistrationID} style={{ 
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    borderBottom:'1px solid #f1f5f9',
                    transition:'all 0.25s ease'
                  }} 
                  onMouseEnter={e => {
                    e.currentTarget.style.background='linear-gradient(90deg, #f0f9ff 0%, #eff6ff 50%, #f0f9ff 100%)';
                    e.currentTarget.style.boxShadow='inset 4px 0 0 #6366f1';
                  }} 
                  onMouseLeave={e => {
                    e.currentTarget.style.background=idx % 2 === 0 ? '#fff' : '#fafbfc';
                    e.currentTarget.style.boxShadow='none';
                  }}>
                    {/* ID */}
                    <td style={{ padding:'16px 14px' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        background:'linear-gradient(145deg,#6366f1,#8b5cf6)',
                        color:'#fff', fontWeight:800, fontSize:12, borderRadius:10,
                        width:38, height:38, boxShadow:'0 4px 12px rgba(99,102,241,0.35)'
                      }}>{row.RegistrationID}</span>
                    </td>
                    
                    {/* Institution Name */}
                    <td style={{ padding:'16px 14px' }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:3 }}>{row.InstitutionName}</div>
                      {row.FullAddress && <div style={{ fontSize:11, color:'#64748b', maxWidth:180, lineHeight:1.4 }}>
                        📍 {row.FullAddress.substring(0, 35)}...
                      </div>}
                    </td>
                    
                    {/* Category */}
                    <td style={{ padding:'16px 14px' }}>
                      <span style={{ 
                        background:'linear-gradient(145deg,#f1f5f9,#e2e8f0)', 
                        color:'#374151', fontSize:11, fontWeight:700, 
                        borderRadius:8, padding:'7px 12px', display:'inline-block',
                        border:'1px solid #e2e8f0'
                      }}>{row.Category || '—'}</span>
                    </td>
                    
                    {/* Zone */}
                    <td style={{ padding:'16px 14px' }}>
                      <span style={{ 
                        background:'linear-gradient(145deg,#ede9fe,#ddd6fe)', 
                        color:'#5b21b6', 
                        fontSize:11, fontWeight:800, borderRadius:8, padding:'7px 12px', display:'inline-block',
                        border:'1px solid #c4b5fd'
                      }}>{row.Zone || '—'}</span>
                    </td>
                    
                    {/* Route */}
                    <td style={{ padding:'16px 14px' }}>
                      <span style={{ 
                        background:'linear-gradient(145deg,#dbeafe,#bfdbfe)', 
                        color:'#1e40af', 
                        fontSize:11, fontWeight:800, borderRadius:8, padding:'7px 12px', display:'inline-block',
                        border:'1px solid #93c5fd'
                      }}>{row.Route || '—'}</span>
                    </td>
                    
                    {/* Contact Person */}
                    <td style={{ padding:'16px 14px', color:'#1e293b', fontWeight:600, fontSize:13 }}>
                      {row.ContactPerson || <span style={{ color:'#cbd5e1' }}>—</span>}
                    </td>
                    
                    {/* Mobile */}
                    <td style={{ padding:'16px 14px' }}>
                      {row.Mobile ? (
                        <a href={`tel:${row.Mobile}`} style={{ 
                          color:'#2563eb', fontWeight:700, textDecoration:'none', fontSize:13,
                          display:'inline-flex', alignItems:'center', gap:4
                        }}>
                          <span style={{ fontSize:12 }}>📞</span> {row.Mobile}
                        </a>
                      ) : <span style={{ color:'#cbd5e1' }}>—</span>}
                    </td>
                    
                    {/* Status */}
                    <td style={{ padding:'16px 14px' }}><StatusBadge value={row.Status || 'Pending'} /></td>
                    
                    {/* Reg Date */}
                    <td style={{ padding:'16px 14px', color:'#475569', fontWeight:600, fontSize:12 }}>
                      {formatDate(row.CreatedAt) || <span style={{ color:'#cbd5e1' }}>—</span>}
                    </td>
                    
                    {/* Renewal Date */}
                    <td style={{ padding:'16px 14px', color:'#475569', fontWeight:600, fontSize:12 }}>
                      {formatDate(row.RenewalDate) || <span style={{ color:'#cbd5e1' }}>—</span>}
                    </td>
                    
                    {/* Outstanding */}
                    <td style={{ padding:'16px 14px' }}>
                      {row.Outstanding ? (
                        <span style={{ 
                          color:'#dc2626', fontWeight:800, fontSize:13,
                          background:'#fef2f2', padding:'6px 10px', borderRadius:8,
                          border:'1px solid #fecaca', display:'inline-block'
                        }}>₹{Number(row.Outstanding).toLocaleString('en-IN')}</span>
                      ) : <span style={{ color:'#cbd5e1', fontSize:13 }}>—</span>}
                    </td>
                    
                    {/* Docs */}
                    <td style={{ padding:'16px 14px' }}>
                      <button 
                      onClick={() => openDocsModal(row)}
                      style={{
                        background:'linear-gradient(145deg,#f5f3ff,#ede9fe)', border:'1px solid #c4b5fd',
                        borderRadius:8, padding:'8px 10px', fontSize:13, color:'#6d28d9', cursor:'pointer', fontWeight:700,
                        transition:'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                      title="View Documents"
                      >📁</button>
                    </td>
                    
                    {/* Actions */}
                    <td style={{ padding:'16px 14px' }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'nowrap' }}>
                        <button onClick={() => { setView360Row(row); setShow360Modal(true); }}
                          style={{
                            background:'linear-gradient(145deg,#6366f1,#4f46e5)', color:'#fff', border:'none',
                            borderRadius:10, padding:'9px 14px', fontSize:11, fontWeight:700, cursor:'pointer',
                            boxShadow:'0 2px 8px rgba(99,102,241,0.3)'
                          }}>360°</button>
                        {row.Status === 'Deregistered' ? (
                          <button onClick={() => openReregModal(row)} style={{
                            background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', border:'none',
                            borderRadius:8, padding:'8px 10px', fontSize:10, fontWeight:700, cursor:'pointer'
                          }}>🔄 Re-reg</button>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(row)} style={{
                              background:'#f0f9ff', color:'#0284c7', border:'1px solid #bae6fd',
                              borderRadius:8, padding:'8px 10px', fontSize:12, fontWeight:700, cursor:'pointer'
                            }}>✏️</button>
                            <button onClick={() => handleDelete(row)} style={{
                              background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                              borderRadius:8, padding:'8px 10px', fontSize:12, fontWeight:700, cursor:'pointer'
                            }}>🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* New HCF Modal */}
      {showNewModal && (
        <div style={modalOverlay}>
          <div style={modalBox(800)}>
            <ModalHeader title="New HCF Registration" onClose={() => setShowNewModal(false)} />
            <HCFForm />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={modalOverlay}>
          <div style={modalBox(800)}>
            <ModalHeader title={`Edit HCF: ${editRow?.InstitutionName}`} onClose={() => setShowEditModal(false)} />
            <HCFForm />
          </div>
        </div>
      )}

      {/* Re-registration Modal */}
      {showReregModal && reregRow && (
        <div style={modalOverlay}>
          <div style={modalBox(600)}>
            <div style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', padding:'18px 24px', borderRadius:'16px 16px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h2 style={{ margin:0, color:'#fff', fontSize:18, fontWeight:800 }}>🔄 Re-register HCF</h2>
                <div style={{ color:'rgba(255,255,255,0.8)', fontSize:12, marginTop:4 }}>{reregRow.InstitutionName}</div>
              </div>
              <button onClick={() => setShowReregModal(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, width:32, height:32, fontSize:18, cursor:'pointer', color:'#fff' }}>×</button>
            </div>
            <form onSubmit={handleReregSubmit} style={{ padding:24 }}>
              <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:10, padding:14, marginBottom:20, fontSize:13 }}>
                <strong>⚠️ Re-registration Notice:</strong> This HCF was previously deregistered. Complete this form to reactivate the account with a new contract.
              </div>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Contract Start Date *</label>
                  <input type="date" value={reregForm.ContractStartDate} onChange={e => setReregForm(p => ({ ...p, ContractStartDate: e.target.value }))} required
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Contract Duration *</label>
                  <select value={reregForm.ContractDuration} onChange={e => setReregForm(p => ({ ...p, ContractDuration: e.target.value }))} required
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13 }}>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Billing Cycle</label>
                  <select value={reregForm.BillingCycle} onChange={e => setReregForm(p => ({ ...p, BillingCycle: e.target.value }))}
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13 }}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Payment Mode</label>
                  <select value={reregForm.PaymentMode} onChange={e => setReregForm(p => ({ ...p, PaymentMode: e.target.value }))}
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13 }}>
                    <option value="Online">Online</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Re-registration Fee (₹)</label>
                  <input type="number" value={reregForm.RegFee} onChange={e => setReregForm(p => ({ ...p, RegFee: e.target.value }))} placeholder="0"
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Service Fee (₹)</label>
                  <input type="number" value={reregForm.SvcFee} onChange={e => setReregForm(p => ({ ...p, SvcFee: e.target.value }))} placeholder="0"
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13 }} />
                </div>
              </div>

              <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:12 }}>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <input type="checkbox" checked={reregForm.MoUReSigned} onChange={e => setReregForm(p => ({ ...p, MoUReSigned: e.target.checked }))}
                    style={{ width:18, height:18, accentColor:'#16a34a' }} />
                  <span style={{ fontSize:13, fontWeight:600 }}>✍️ MoU Re-signed</span>
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <input type="checkbox" checked={reregForm.GenerateCertificate} onChange={e => setReregForm(p => ({ ...p, GenerateCertificate: e.target.checked }))}
                    style={{ width:18, height:18, accentColor:'#16a34a' }} />
                  <span style={{ fontSize:13, fontWeight:600 }}>📜 Generate New Certificate</span>
                </label>
              </div>

              <div style={{ marginTop:20 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, marginBottom:4, color:'#374151' }}>Remarks / Notes</label>
                <textarea value={reregForm.Remarks} onChange={e => setReregForm(p => ({ ...p, Remarks: e.target.value }))} rows={3} placeholder="Any additional notes about re-registration..."
                  style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:13, resize:'vertical' }} />
              </div>

              <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowReregModal(false)} style={{ padding:'10px 20px', border:'1.5px solid #d1d5db', borderRadius:8, background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingRereg} style={{ padding:'10px 24px', border:'none', borderRadius:8, background:'linear-gradient(135deg,#16a34a,#22c55e)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity: savingRereg ? 0.6 : 1 }}>
                  {savingRereg ? 'Processing...' : '🔄 Re-register & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 360° Modal */}
      {show360Modal && view360Row && (
        <HCF360Modal row={view360Row} zones={zones} onClose={() => setShow360Modal(false)} showToast={showToast} />
      )}

      {/* Documents Modal */}
      {showDocsModal && docsRow && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0, 
          background:'rgba(15,23,42,0.7)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
        }} onClick={() => setShowDocsModal(false)}>
          <div style={{
            background:'#fff', borderRadius:16, width:'90%', maxWidth:700, maxHeight:'85vh',
            overflow:'hidden', boxShadow:'0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'20px 24px',
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <div>
                <h2 style={{ margin:0, color:'#fff', fontSize:18, fontWeight:700, display:'flex', alignItems:'center', gap:10 }}>
                  📁 Documents
                </h2>
                <p style={{ margin:'4px 0 0', color:'rgba(255,255,255,0.7)', fontSize:13 }}>
                  {docsRow.InstitutionName} (ID: {docsRow.RegistrationID})
                </p>
              </div>
              <button onClick={() => setShowDocsModal(false)} style={{
                background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', width:36, height:36,
                borderRadius:8, fontSize:18, cursor:'pointer'
              }}>×</button>
            </div>

            {/* Content */}
            <div style={{ padding:24, maxHeight:'calc(85vh - 80px)', overflowY:'auto' }}>
              {loadingDocsData ? (
                <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
                  Loading documents...
                </div>
              ) : (() => {
                const ALL_DOC_TYPES = [
                  { key: 'Aadhaar Card',                   icon: '🪪', color: '#2563eb', bg: '#dbeafe' },
                  { key: 'PAN Card',                       icon: '💳', color: '#7c3aed', bg: '#ede9fe' },
                  { key: 'GST Certificate',                icon: '📋', color: '#0891b2', bg: '#e0f2fe' },
                  { key: 'BMW Authorization',              icon: '🏥', color: '#16a34a', bg: '#dcfce7' },
                  { key: 'PCB Authorization',              icon: '🏭', color: '#d97706', bg: '#fef3c7' },
                  { key: 'Cancelled Cheque',               icon: '🏦', color: '#64748b', bg: '#f1f5f9' },
                  { key: 'Facility Photo (Display Board)', icon: '📷', color: '#0891b2', bg: '#e0f2fe' },
                  { key: 'Letterhead',                     icon: '📄', color: '#7c3aed', bg: '#ede9fe' },
                  { key: 'MoU Copy',                       icon: '📝', color: '#dc2626', bg: '#fee2e2' },
                  { key: 'Agreement Copy',                 icon: '📃', color: '#16a34a', bg: '#dcfce7' },
                  { key: 'NOC (CMO/RO Consent)',           icon: '✅', color: '#2563eb', bg: '#dbeafe' },
                ];
                const docMap = {};
                docsData.forEach(d => { docMap[d.DocumentType] = d; });
                const uploadedCount = docsData.filter(d => d.FilePath).length;

                return (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                      <div style={{ fontSize:13, color:'#64748b' }}>
                        <span style={{ fontWeight:700, color:'#1e293b' }}>{uploadedCount}</span> of {ALL_DOC_TYPES.length} documents uploaded
                      </div>
                      <button onClick={() => { setShowDocsModal(false); setView360Row(docsRow); setShow360Modal(true); }}
                        style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        📤 Upload Documents
                      </button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
                      {ALL_DOC_TYPES.map(dt => {
                        const d = docMap[dt.key];
                        const isUploaded = d && d.FilePath;
                        const statusInfo = !isUploaded 
                          ? { label: 'Not Uploaded', color: '#dc2626', bg: '#fee2e2' }
                          : (d.DocStatus || '').toLowerCase() === 'expired'
                            ? { label: 'Expired', color: '#dc2626', bg: '#fee2e2' }
                            : (d.DocStatus || '').toLowerCase() === 'expiring'
                              ? { label: 'Expiring', color: '#d97706', bg: '#fef3c7' }
                              : { label: 'Valid', color: '#15803d', bg: '#dcfce7' };
                        return (
                          <div key={dt.key} style={{
                            background: isUploaded ? `linear-gradient(135deg,${dt.bg},#fff)` : '#fff',
                            border: isUploaded ? `1.5px solid ${dt.color}44` : '1.5px dashed #e2e8f0',
                            borderRadius:12, padding:14
                          }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                              <div style={{ 
                                width:36, height:36, borderRadius:8, 
                                background: isUploaded ? `linear-gradient(135deg,${dt.color},${dt.color}bb)` : '#f1f5f9',
                                display:'flex', alignItems:'center', justifyContent:'center', fontSize:16
                              }}>{dt.icon}</div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:12, fontWeight:700, color:'#1e293b', lineHeight:1.3 }}>{dt.key}</div>
                              </div>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                              <span style={{ 
                                fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, 
                                background:statusInfo.bg, color:statusInfo.color 
                              }}>
                                {statusInfo.label === 'Valid' ? '✓ ' : ''}{statusInfo.label}
                              </span>
                              {isUploaded && (
                                <button onClick={() => window.open(d.FilePath, '_blank')}
                                  style={{
                                    background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none',
                                    borderRadius:6, padding:'4px 10px', fontSize:10, fontWeight:600, cursor:'pointer'
                                  }}>👁️ View</button>
                              )}
                            </div>
                            {isUploaded && d.ExpiryDate && (
                              <div style={{ fontSize:10, color:'#d97706', fontWeight:600, marginTop:6 }}>
                                Expiry: {new Date(d.ExpiryDate).toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 360° View Modal ─────────────────────────────────────────────────────────

const HCF360Modal = ({ row, onClose, showToast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lifecycleState, setLifecycleState] = useState(row.LifecycleState || 'Active');
  const [savingState, setSavingState] = useState(false);
  const [notes, setNotes] = useState(row.Notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactForm, setContactForm] = useState({ ContactName: '', Designation: '', Mobile: '', Email: '', IsPrimary: false });
  const [savingContact, setSavingContact] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const [complaints360, setComplaints360] = useState([]);
  const [loadingComplaints360, setLoadingComplaints360] = useState(false);
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ Type: '', Description: '', Priority: 'Medium', AssignedTo: '' });
  const [savingComplaint, setSavingComplaint] = useState(false);

  // Payment History state
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ InvoiceNo: '', InvoiceDate: '', InvoiceAmount: '', PaidAmount: '', PaymentDate: '', PaymentMode: '', TransactionRef: '', BankName: '', Status: 'Paid', Remarks: '' });
  const [savingPayment, setSavingPayment] = useState(false);

  // Pickups state
  const [pickups, setPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(false);
  const [pickupSummary, setPickupSummary] = useState({});

  // Certificates state
  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    // Load payment summary, pickup summary, and contacts on mount for overview
    loadPaymentSummary();
    loadPickupSummary();
    loadContacts();
  }, []);

  useEffect(() => {
    if (activeTab === 'documents') loadDocs();
    if (activeTab === 'contacts') loadContacts();
    if (activeTab === 'complaints') loadComplaints();
    if (activeTab === 'payments') { loadPayments(); loadPaymentSummary(); }
    if (activeTab === 'pickups') { loadPickups(); loadPickupSummary(); }
    if (activeTab === 'certificates') loadCertificates();
  }, [activeTab]);

  const loadCertificates = async () => {
    setLoadingCerts(true);
    try {
      const res = await fetch(`/api/hcf-certificates/${row.RegistrationID}`);
      const json = await res.json();
      setCertificates(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load certificates', 'error'); }
    finally { setLoadingCerts(false); }
  };

  const generateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await fetch('/api/hcf-certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: row.RegistrationID })
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Certificate generated successfully!');
      loadCertificates();
    } catch { showToast('Failed to generate certificate', 'error'); }
    finally { setGeneratingCert(false); }
  };

  const revokeCertificate = async (certId) => {
    if (!window.confirm('Revoke this certificate?')) return;
    try {
      await fetch(`/api/hcf-certificates/${certId}/revoke`, { method: 'PUT' });
      showToast('Certificate revoked');
      loadCertificates();
    } catch { showToast('Failed to revoke certificate', 'error'); }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/hcf-payments/${row.RegistrationID}`);
      const json = await res.json();
      setPayments(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load payments', 'error'); }
    finally { setLoadingPayments(false); }
  };

  const loadPaymentSummary = async () => {
    try {
      const res = await fetch(`/api/hcf-payments-summary/${row.RegistrationID}`);
      const json = await res.json();
      setPaymentSummary(json || {});
    } catch {}
  };

  const loadPickups = async () => {
    setLoadingPickups(true);
    try {
      const res = await fetch(`/api/hcf-pickups/${row.RegistrationID}`);
      const json = await res.json();
      setPickups(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load pickups', 'error'); }
    finally { setLoadingPickups(false); }
  };

  const loadPickupSummary = async () => {
    try {
      const res = await fetch(`/api/hcf-pickups-summary/${row.RegistrationID}`);
      const json = await res.json();
      setPickupSummary(json || {});
    } catch {}
  };

  const loadComplaints = async () => {
    setLoadingComplaints360(true);
    try {
      const res = await fetch(`/api/portal/complaints/${row.RegistrationID}`);
      const json = await res.json();
      setComplaints360(Array.isArray(json) ? json : []);
    } catch {}
    finally { setLoadingComplaints360(false); }
  };

  const addPayment = async () => {
    if (!paymentForm.PaidAmount || !paymentForm.PaymentDate) {
      showToast('Paid Amount and Payment Date are required', 'error');
      return;
    }
    setSavingPayment(true);
    try {
      await fetch('/api/hcf-payments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentForm, RegistrationID: row.RegistrationID }),
      });
      showToast('Payment recorded');
      setPaymentForm({ InvoiceNo: '', InvoiceDate: '', InvoiceAmount: '', PaidAmount: '', PaymentDate: '', PaymentMode: '', TransactionRef: '', BankName: '', Status: 'Paid', Remarks: '' });
      setShowAddPayment(false);
      loadPayments();
      loadPaymentSummary();
    } catch { showToast('Save failed', 'error'); }
    finally { setSavingPayment(false); }
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await fetch(`/api/hcf-payments/${id}`, { method: 'DELETE' });
      showToast('Payment deleted');
      loadPayments();
      loadPaymentSummary();
    } catch { showToast('Delete failed', 'error'); }
  };

  const loadDocs = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/hcf-documents?registrationId=${row.RegistrationID}`);
      const json = await res.json();
      setDocs(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load documents', 'error'); }
    finally { setLoadingDocs(false); }
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch(`/api/hcf-contacts?registrationId=${row.RegistrationID}`);
      const json = await res.json();
      setContacts(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load contacts', 'error'); }
    finally { setLoadingContacts(false); }
  };

  const saveLifecycleState = async () => {
    setSavingState(true);
    try {
      await fetch(`/api/hcf-master/${row.RegistrationID}/state`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: lifecycleState }),
      });
      showToast('Lifecycle state updated');
    } catch { showToast('Save failed', 'error'); }
    finally { setSavingState(false); }
  };

  const addDoc = async (e) => {
    e.preventDefault();
    setSavingDoc(true);
    try {
      await fetch('/api/hcf-documents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...docForm, RegistrationID: row.RegistrationID }),
      });
      showToast('Document added');
      setDocForm({ DocumentType: '', Version: '', ExpiryDate: '', UploadedBy: '', Remarks: '' });
      loadDocs();
    } catch { showToast('Save failed', 'error'); }
    finally { setSavingDoc(false); }
  };

  const uploadDocFile = async (docType, file) => {
    if (!file) return;
    setUploadingDocType(docType);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('registrationId', row.RegistrationID);
      fd.append('documentType', docType);
      fd.append('version', 'v1');
      fd.append('uploadedBy', 'Admin');
      fd.append('uploadSource', 'Admin');
      const res = await fetch('/api/hcf-documents/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { showToast(`${docType} uploaded`); loadDocs(); }
      else showToast('Upload failed: ' + (data.error || ''), 'error');
    } catch { showToast('Upload error', 'error'); }
    finally { setUploadingDocType(null); }
  };

  const deleteDoc = async (id) => {
    if (!window.confirm('Delete document?')) return;
    try {
      await fetch(`/api/hcf-documents/${id}`, { method: 'DELETE' });
      showToast('Deleted');
      loadDocs();
    } catch { showToast('Delete failed', 'error'); }
  };

  const addContact = async () => {
    if (!contactForm.ContactName || !contactForm.Mobile) { showToast('Name and Mobile are required', 'error'); return; }
    setSavingContact(true);
    try {
      await fetch('/api/hcf-contacts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, RegistrationID: row.RegistrationID }),
      });
      showToast('Contact added');
      setContactForm({ ContactName: '', Designation: '', Mobile: '', Email: '', IsPrimary: false });
      setShowAddContact(false);
      loadContacts();
    } catch { showToast('Save failed', 'error'); }
    finally { setSavingContact(false); }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Delete contact?')) return;
    try {
      await fetch(`/api/hcf-contacts/${id}`, { method: 'DELETE' });
      showToast('Deleted');
      loadContacts();
    } catch { showToast('Delete failed', 'error'); }
  };

  const addComplaint = async () => {
    if (!complaintForm.Type || !complaintForm.Description) {
      showToast('Type and Description are required', 'error');
      return;
    }
    setSavingComplaint(true);
    try {
      const payload = {
        ...complaintForm,
        RegistrationID: row.RegistrationID,
        Status: 'Pending',
        CreatedAt: new Date().toISOString()
      };
      await fetch('/api/portal/complaints', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showToast('Complaint submitted');
      setComplaintForm({ Type: '', Description: '', Priority: 'Medium', AssignedTo: '' });
      setShowAddComplaint(false);
      loadComplaints();
    } catch { showToast('Save failed', 'error'); }
    finally { setSavingComplaint(false); }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch(`/api/hcf-master/${row.RegistrationID}/notes`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      showToast('Notes saved');
    } catch { showToast('Save failed', 'error'); }
    finally { setSavingNotes(false); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'pickups', label: 'Pickups', icon: '🚛' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'certificates', label: 'Certificates', icon: '📜' },
    { id: 'complaints', label: 'Complaints', icon: '⚠️' },
    { id: 'contacts', label: 'Contacts', icon: '👤' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
  ];

  const docTypes = ['Aadhaar Card', 'PAN Card', 'GST Certificate', 'BMW Authorization', 'PCB Authorization', 'Cancelled Cheque', 'Facility Photo (Display Board)', 'Letterhead', 'MoU Copy', 'Agreement Copy', 'NOC (CMO/RO Consent)'];

  // Calculate overdue days
  const calculateOverdueDays = () => {
    const lastPaymentDate = paymentSummary.LastPaymentDate;
    if (!lastPaymentDate) return 0;
    const daysSince = Math.floor((new Date() - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24));
    return daysSince > 30 ? daysSince - 30 : 0;
  };

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox(1100), padding:0, overflow:'hidden', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', maxHeight:'90vh' }}>

        {/* ── Modal Header ── */}
        <div style={{
          background:'linear-gradient(135deg,#312e81 0%,#5b21b6 100%)',
          padding:'16px 24px', position:'relative', flexShrink:0
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              width:48, height:48, borderRadius:12, background:'rgba(255,255,255,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0
            }}>🏥</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff', lineHeight:1.2 }}>{row.InstitutionName}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 }}>
                {row.CustomerID || row.RegistrationID} &nbsp;·&nbsp; {row.Zone || '—'} Zone &nbsp;·&nbsp;
                <span style={{ 
                  background: row.Status === 'Active' ? '#22c55e' 
                    : row.Status === 'Deregistered' ? '#64748b'
                    : row.Status === 'Late Payer' ? '#ea580c'
                    : row.Status === 'Slow Payer' ? '#ca8a04'
                    : row.Status === 'Defaulter' ? '#dc2626'
                    : row.Status === 'Suspended' ? '#dc2626'
                    : '#fbbf24', 
                  padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:'#fff' 
                }}>{row.Status || 'Pending'}</span>
              </div>
            </div>
            <button onClick={onClose} style={{
              background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:36, height:36,
              fontSize:20, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'
            }}>×</button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid #e2e8f0', background:'#fff', flexShrink:0, overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding:'12px 18px', border:'none', borderBottom: activeTab === t.id ? '3px solid #5b21b6' : '3px solid transparent',
              cursor:'pointer', fontWeight:600, fontSize:13, background:'transparent',
              color: activeTab === t.id ? '#5b21b6' : '#64748b', transition:'all 0.15s', whiteSpace:'nowrap',
              display:'flex', alignItems:'center', gap:6
            }}><span>{t.icon}</span> {t.label}</button>
          ))}
        </div>

        {/* ── Tab body ── */}
        <div style={{ padding:20, flex:1, overflowY:'auto' }}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Left Column - Registration Details */}
            <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                📋 REGISTRATION DETAILS
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 20px' }}>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>HCF ID:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.CustomerID || row.RegistrationID}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Reg. Date:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.RegistrationDate ? new Date(row.RegistrationDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Category:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.Category || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Sub-Category:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.SubCategory || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Beds:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.NumberOfBeds || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Service Plan:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.SelectedPlan || '—'} — ₹{row.TotalAmount?.toLocaleString('en-IN') || '0'}/mo</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Zone:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.Zone || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Route:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.Route || '—'}</div></div>
              </div>
              <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Full Address:</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{row.Address || '—'}, {row.City || ''} — {row.Pincode || ''}, {row.State || ''}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 20px', marginTop:14, paddingTop:12, borderTop:'1px solid #e2e8f0' }}>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>PAN:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.PAN || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>GST:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.GST || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Aadhar No.:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.Aadhaar || '—'}</div></div>
                <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>BMW Reg.:</div><div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{row.BMWAuth || '—'}</div></div>
              </div>
            </div>

            {/* Right Column - Snapshots */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Financial Snapshot */}
              <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#16a34a', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                  💰 FINANCIAL SNAPSHOT
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 20px' }}>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Total Billed (YTD)</div><div style={{ fontSize:18, fontWeight:800, color:'#16a34a' }}>₹{(paymentSummary.TotalInvoiced || 0).toLocaleString('en-IN')}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Outstanding</div><div style={{ fontSize:18, fontWeight:800, color:'#dc2626' }}>₹{(paymentSummary.Outstanding || 0).toLocaleString('en-IN')}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Last Payment</div><div style={{ fontSize:14, fontWeight:700, color:'#16a34a' }}>₹{(paymentSummary.TotalPaid ? Math.round(paymentSummary.TotalPaid / (paymentSummary.TotalPayments || 1)) : 0).toLocaleString('en-IN')} — {paymentSummary.LastPaymentDate ? new Date(paymentSummary.LastPaymentDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : '—'}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Payment Mode</div><div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{row.PaymentModePref || 'NEFT/Online'}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Advance Balance</div><div style={{ fontSize:14, fontWeight:700, color:'#16a34a' }}>₹{(row.AdvanceBalance || 0).toLocaleString('en-IN')}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Overdue Days</div><div style={{ fontSize:14, fontWeight:800, color: calculateOverdueDays() > 0 ? '#dc2626' : '#16a34a' }}>{calculateOverdueDays()} days</div></div>
                </div>
              </div>

              {/* Collection Snapshot */}
              <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#0891b2', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                  🚛 COLLECTION SNAPSHOT
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 20px' }}>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Total Pickups (YTD)</div><div style={{ fontSize:22, fontWeight:800, color:'#0891b2' }}>{pickupSummary.TotalPickups || 0}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Missed Pickups</div><div style={{ fontSize:22, fontWeight:800, color:'#dc2626' }}>{pickupSummary.MissedPickups || 0}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Last Pickup</div><div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{pickupSummary.LastPickupDate ? new Date(pickupSummary.LastPickupDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</div></div>
                  <div><div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>Avg Waste/Visit</div><div style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{pickupSummary.AvgWasteKg?.toFixed(1) || '0'} kg</div></div>
                </div>
              </div>

              {/* Lifecycle State */}
              <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#5b21b6', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                  🔄 LIFECYCLE STATE
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <select value={lifecycleState} onChange={e => setLifecycleState(e.target.value)}
                    style={{ flex:1, border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, fontWeight:600 }}>
                    {['Active', 'Late Payer', 'Slow Payer', 'Disputed', 'Defaulter', 'Suspended', 'Closed'].map(s =>
                      <option key={s} value={s}>{s === lifecycleState ? '✓ ' : ''}{s}</option>)}
                  </select>
                  <button onClick={saveLifecycleState} disabled={savingState} style={{
                    background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer'
                  }}>{savingState ? '...' : 'Save'}</button>
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:8 }}>⚡ Auto-recomputed nightly from outstanding + overdue days</div>
              </div>
            </div>
          </div>

          {/* Contact Persons Table - Full Width */}
          <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:16, marginTop:20 }}>
            <div style={{ fontSize:13, fontWeight:800, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              👤 Contact Persons
            </div>
            {loadingContacts ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:20 }}>Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:20 }}>No contact persons added yet</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:'1.5px solid #e2e8f0' }}>
                    <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:11, textTransform:'uppercase' }}>Name</th>
                    <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:11, textTransform:'uppercase' }}>Designation</th>
                    <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:11, textTransform:'uppercase' }}>Mobile</th>
                    <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:11, textTransform:'uppercase' }}>Email</th>
                    <th style={{ padding:'12px 10px', textAlign:'center', fontWeight:700, color:'#64748b', fontSize:11, textTransform:'uppercase' }}>Primary</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.ContactID} style={{ borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'12px 10px', fontWeight:600, color:'#3b82f6' }}>{c.ContactName || '—'}</td>
                      <td style={{ padding:'12px 10px', color:'#374151' }}>{c.Designation || '—'}</td>
                      <td style={{ padding:'12px 10px', color:'#374151' }}>{c.Mobile || '—'}</td>
                      <td style={{ padding:'12px 10px', color:'#374151' }}>{c.Email || '—'}</td>
                      <td style={{ padding:'12px 10px', textAlign:'center' }}>
                        {c.IsPrimary && <span style={{ background:'#dcfce7', color:'#15803d', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>Primary</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#1e293b' }}>Payment History</h3>
              <button onClick={() => setShowAddPayment(true)} style={{
                background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer'
              }}>+ Record Payment</button>
            </div>

            {/* Add Payment Form */}
            {showAddPayment && (
              <div style={{ background:'#f5f3ff', border:'1.5px solid #c4b5fd', borderRadius:12, padding:16, marginBottom:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:12 }}>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Invoice No</label>
                    <input value={paymentForm.InvoiceNo} onChange={e => setPaymentForm(p=>({...p,InvoiceNo:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Amount *</label>
                    <input type="number" value={paymentForm.PaidAmount} onChange={e => setPaymentForm(p=>({...p,PaidAmount:e.target.value,InvoiceAmount:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Mode</label>
                    <select value={paymentForm.PaymentMode} onChange={e => setPaymentForm(p=>({...p,PaymentMode:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }}>
                      <option value="">Select</option><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="NEFT">NEFT</option><option value="Cheque">Cheque</option>
                    </select></div>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Ref/Cheque No</label>
                    <input value={paymentForm.TransactionRef} onChange={e => setPaymentForm(p=>({...p,TransactionRef:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                </div>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <button onClick={() => setShowAddPayment(false)} style={{ background:'#fff', color:'#64748b', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                  <button onClick={addPayment} disabled={savingPayment} style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>{savingPayment ? '...' : 'Save'}</button>
                </div>
              </div>
            )}

            {/* Payments Table */}
            {loadingPayments ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</div>
            ) : payments.length === 0 ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40, background:'#f8fafc', borderRadius:12, border:'1.5px dashed #e2e8f0' }}>No payment records found</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
                <thead><tr style={{ background:'#f8fafc', borderBottom:'1.5px solid #e2e8f0' }}>
                  <th style={{ padding:'14px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:12 }}>Date</th>
                  <th style={{ padding:'14px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:12 }}>Invoice No.</th>
                  <th style={{ padding:'14px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:12 }}>Amount</th>
                  <th style={{ padding:'14px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:12 }}>Mode</th>
                  <th style={{ padding:'14px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:12 }}>Ref/Cheque No.</th>
                  <th style={{ padding:'14px 12px', textAlign:'center', fontWeight:700, color:'#374151', fontSize:12 }}>Status</th>
                  <th style={{ padding:'14px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:12 }}>Recorded By</th>
                </tr></thead>
                <tbody>
                  {payments.map(p => {
                    const statusColors = { Paid:{bg:'#dcfce7',c:'#15803d',label:'Cleared'}, Partial:{bg:'#fef3c7',c:'#92400e',label:'Partial'}, Pending:{bg:'#fee2e2',c:'#dc2626',label:'Overdue'}, Bounced:{bg:'#fee2e2',c:'#dc2626',label:'Bounced'} };
                    const sc = statusColors[p.Status] || statusColors.Pending;
                    return (
                      <tr key={p.PaymentID} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'14px 12px', fontWeight:600, color:'#1e293b' }}>{p.PaymentDate ? new Date(p.PaymentDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</td>
                        <td style={{ padding:'14px 12px', color:'#374151', fontWeight:500 }}>{p.InvoiceNo || '—'}</td>
                        <td style={{ padding:'14px 12px', fontWeight:700, color:'#16a34a' }}>₹{(p.PaidAmount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding:'14px 12px', color:'#374151' }}>{p.PaymentMode || '—'}</td>
                        <td style={{ padding:'14px 12px' }}>
                          {p.TransactionRef ? (
                            <span style={{ background:'#d0f5f5', color:'#0891b2', padding:'4px 10px', borderRadius:6, fontWeight:600, fontSize:12 }}>{p.TransactionRef}</span>
                          ) : '—'}
                        </td>
                        <td style={{ padding:'14px 12px', textAlign:'center' }}><span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:sc.bg, color:sc.c }}>{sc.label}</span></td>
                        <td style={{ padding:'14px 12px', color:'#374151' }}>{p.RecordedBy || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pickups Tab */}
        {activeTab === 'pickups' && (
          <div>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#1e293b' }}>Pickup / Collection History</h3>
              <span style={{ fontSize:12, color:'#64748b' }}>Showing last 30 visits</span>
            </div>

            {/* Pickups Table */}
            {loadingPickups ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</div>
            ) : pickups.length === 0 ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40, background:'#f8fafc', borderRadius:12, border:'1.5px dashed #e2e8f0' }}>No pickup records found</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, background:'#fff' }}>
                <thead><tr style={{ background:'#f8fafc', borderBottom:'1.5px solid #e2e8f0' }}>
                  <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b' }}>DATE</th>
                  <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b' }}>DRIVER</th>
                  <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b' }}>VEHICLE</th>
                  <th style={{ padding:'12px 10px', textAlign:'left', fontWeight:700, color:'#64748b' }}>WASTE (KG)</th>
                  <th style={{ padding:'12px 10px', textAlign:'center', fontWeight:700, color:'#64748b' }}>YELLOW BAG</th>
                  <th style={{ padding:'12px 10px', textAlign:'center', fontWeight:700, color:'#64748b' }}>RED BAG</th>
                  <th style={{ padding:'12px 10px', textAlign:'center', fontWeight:700, color:'#64748b' }}>SHARP</th>
                  <th style={{ padding:'12px 10px', textAlign:'center', fontWeight:700, color:'#64748b' }}>STATUS</th>
                  <th style={{ padding:'12px 10px', textAlign:'center', fontWeight:700, color:'#64748b' }}>GPS</th>
                </tr></thead>
                <tbody>
                  {pickups.map(p => {
                    const statusColors = { Collected:{bg:'#dcfce7',c:'#15803d'}, Missed:{bg:'#fee2e2',c:'#dc2626'}, Scheduled:{bg:'#dbeafe',c:'#1d4ed8'} };
                    const sc = statusColors[p.Status] || statusColors.Collected;
                    return (
                      <tr key={p.PickupID} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'12px 10px', fontWeight:600, color:'#1e293b' }}>{p.PickupDate ? new Date(p.PickupDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</td>
                        <td style={{ padding:'12px 10px', color:'#64748b' }}>{p.DriverName || '—'}</td>
                        <td style={{ padding:'12px 10px', color:'#64748b' }}>{p.VehicleNo || '—'}</td>
                        <td style={{ padding:'12px 10px', fontWeight:700, color:'#1e293b' }}>{p.WasteKg ? `${p.WasteKg} kg` : '—'}</td>
                        <td style={{ padding:'12px 10px', textAlign:'center', color:'#64748b' }}>{p.YellowBag || '—'}</td>
                        <td style={{ padding:'12px 10px', textAlign:'center', color:'#64748b' }}>{p.RedBag || '—'}</td>
                        <td style={{ padding:'12px 10px', textAlign:'center', color:'#64748b' }}>{p.SharpContainer || '—'}</td>
                        <td style={{ padding:'12px 10px', textAlign:'center' }}><span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:sc.bg, color:sc.c }}>{p.Status}</span></td>
                        <td style={{ padding:'12px 10px', textAlign:'center' }}>{p.GPSLat ? '📍' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (() => {
          const ALL_DOC_TYPES = [
            { key: 'Aadhaar Card',                   icon: '🪪', color: '#2563eb', bg: '#dbeafe' },
            { key: 'PAN Card',                       icon: '💳', color: '#7c3aed', bg: '#ede9fe' },
            { key: 'GST Certificate',                icon: '📋', color: '#0891b2', bg: '#e0f2fe' },
            { key: 'BMW Authorization',              icon: '🏥', color: '#16a34a', bg: '#dcfce7' },
            { key: 'PCB Authorization',              icon: '🏭', color: '#d97706', bg: '#fef3c7' },
            { key: 'Cancelled Cheque',               icon: '🏦', color: '#64748b', bg: '#f1f5f9' },
            { key: 'Facility Photo (Display Board)', icon: '📷', color: '#0891b2', bg: '#e0f2fe' },
            { key: 'Letterhead',                     icon: '📄', color: '#7c3aed', bg: '#ede9fe' },
            { key: 'MoU Copy',                       icon: '📝', color: '#dc2626', bg: '#fee2e2' },
            { key: 'Agreement Copy',                 icon: '📃', color: '#16a34a', bg: '#dcfce7' },
            { key: 'NOC (CMO/RO Consent)',           icon: '✅', color: '#2563eb', bg: '#dbeafe' },
          ];
          const docMap = {};
          docs.forEach(d => { docMap[d.DocumentType] = d; });

          function docStatus(d) {
            if (!d || !d.FilePath) return { label: 'Not Uploaded', color: '#dc2626', bg: '#fee2e2' };
            const st = (d.DocStatus || 'Valid').toLowerCase();
            if (st === 'expired')  return { label: 'Expired',  color: '#dc2626', bg: '#fee2e2' };
            if (st === 'expiring') return { label: 'Expiring', color: '#d97706', bg: '#fef3c7' };
            return { label: 'Valid', color: '#15803d', bg: '#dcfce7' };
          }

          return (
            <div>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#1e293b' }}>📁 Document Repository</h3>
                <button style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>📤 Upload Document</button>
              </div>

              {loadingDocs ? (
                <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
                  {ALL_DOC_TYPES.map(dt => {
                    const d = docMap[dt.key];
                    const sb = docStatus(d);
                    const isUp = uploadingDocType === dt.key;
                    const inputId = `adm-doc-${dt.key.replace(/\s+/g,'-')}`;
                    return (
                      <div key={dt.key} style={{
                        background: d?.FilePath ? `linear-gradient(135deg,${dt.bg},#fff)` : '#fff',
                        border: d?.FilePath ? `1.5px solid ${dt.color}44` : '1.5px dashed #e2e8f0',
                        borderRadius:12, padding:14
                      }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                          <div style={{ width:36, height:36, borderRadius:8, background: d?.FilePath ? `linear-gradient(135deg,${dt.color},${dt.color}bb)` : '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{dt.icon}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:'#1e293b', lineHeight:1.3 }}>{dt.key}</div>
                            {d?.FilePath && <div style={{ fontSize:10, color:'#64748b' }}>Version: {d.Version || 'v1'}</div>}
                          </div>
                        </div>
                        {d?.FilePath && (
                          <>
                            <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Uploaded: {d.CreatedAt ? new Date(d.CreatedAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'} by {d.UploadedBy || 'Admin'}</div>
                            {d.ExpiryDate && <div style={{ fontSize:10, color:'#d97706', fontWeight:600, marginBottom:4 }}>Expiry: {new Date(d.ExpiryDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>}
                          </>
                        )}
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:sb.bg, color:sb.color }}>
                            {sb.label === 'Valid' ? '✓ ' : ''}{sb.label}
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:6 }}>
                          {d?.FilePath && (
                            <a href={d.FilePath} target="_blank" rel="noreferrer" style={{ flex:1, textAlign:'center', padding:'6px 0', fontSize:11, fontWeight:700, background:'#fff', color:dt.color, border:`1.5px solid ${dt.color}`, borderRadius:6, textDecoration:'none' }}>👁 View</a>
                          )}
                          <label htmlFor={inputId} style={{ flex:1, textAlign:'center', padding:'6px 0', fontSize:11, fontWeight:700, background: d?.FilePath ? '#f1f5f9' : `linear-gradient(135deg,${dt.color},${dt.color}bb)`, color: d?.FilePath ? '#64748b' : '#fff', borderRadius:6, cursor:'pointer', display:'block' }}>
                            {isUp ? '⏳' : d?.FilePath ? '🔄 Update' : '📤 Click to Upload'}
                            <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }} disabled={isUp} onChange={e => { if (e.target.files[0]) uploadDocFile(dt.key, e.target.files[0]); e.target.value = ''; }} />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#1e293b' }}>📜 Certificates & Authorizations</h3>
              <button onClick={generateCertificate} disabled={generatingCert} style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer', opacity: generatingCert ? 0.6 : 1 }}>
                {generatingCert ? '⏳ Generating...' : '📜 Generate New Certificate'}
              </button>
            </div>

            {loadingCerts ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading certificates...</div>
            ) : certificates.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📜</div>
                <div style={{ fontSize:14, fontWeight:600 }}>No certificates generated yet</div>
                <div style={{ fontSize:12, marginTop:4 }}>Click "Generate New Certificate" to create one</div>
              </div>
            ) : (
              <div style={{ display:'grid', gap:12 }}>
                {certificates.map(cert => {
                  const isActive = cert.Status === 'Active';
                  const isExpired = cert.ValidTill && new Date(cert.ValidTill) < new Date();
                  const daysLeft = cert.ValidTill ? Math.ceil((new Date(cert.ValidTill) - new Date()) / (1000*60*60*24)) : null;
                  
                  return (
                    <div key={cert.CertificateID} style={{ 
                      background: isActive ? (isExpired ? '#fef2f2' : '#f0fdf4') : '#f8fafc',
                      border: `1.5px solid ${isActive ? (isExpired ? '#fca5a5' : '#86efac') : '#e2e8f0'}`,
                      borderRadius:12, padding:16, display:'flex', alignItems:'center', gap:16
                    }}>
                      <div style={{ 
                        width:56, height:56, borderRadius:12, 
                        background: isActive ? (isExpired ? 'linear-gradient(135deg,#dc2626,#ef4444)' : 'linear-gradient(135deg,#22c55e,#16a34a)') : '#94a3b8',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, color:'#fff'
                      }}>📜</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:800, color:'#1e293b' }}>{cert.CertificateCode}</div>
                        <div style={{ display:'flex', gap:16, marginTop:6, fontSize:12, color:'#64748b' }}>
                          <span>📅 Issued: {cert.IssueDate ? new Date(cert.IssueDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</span>
                          <span>⏰ Valid Till: {cert.ValidTill ? new Date(cert.ValidTill).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</span>
                        </div>
                        <div style={{ marginTop:8 }}>
                          <span style={{ 
                            padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700,
                            background: isActive ? (isExpired ? '#fee2e2' : '#dcfce7') : '#f1f5f9',
                            color: isActive ? (isExpired ? '#dc2626' : '#15803d') : '#64748b',
                            border: `1px solid ${isActive ? (isExpired ? '#fca5a5' : '#86efac') : '#e2e8f0'}`
                          }}>
                            {cert.Status === 'Revoked' ? '❌ Revoked' : isExpired ? '⚠️ Expired' : `✅ Active ${daysLeft !== null ? `(${daysLeft} days left)` : ''}`}
                          </span>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        <button style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          📥 Download
                        </button>
                        {isActive && !isExpired && (
                          <button onClick={() => revokeCertificate(cert.CertificateID)} style={{ background:'#fff', color:'#dc2626', border:'1.5px solid #fca5a5', borderRadius:8, padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                            ❌ Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MoU Section */}
            <div style={{ marginTop:24, paddingTop:20, borderTop:'1.5px solid #e2e8f0' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:'#1e293b' }}>✍️ Memorandum of Understanding (MoU)</h4>
              </div>
              <div style={{ 
                background: row.MoUReSigned ? '#f0fdf4' : '#fef3c7',
                border: `1.5px solid ${row.MoUReSigned ? '#86efac' : '#fcd34d'}`,
                borderRadius:12, padding:16, display:'flex', alignItems:'center', gap:16
              }}>
                <div style={{ 
                  width:48, height:48, borderRadius:10, 
                  background: row.MoUReSigned ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'#fff'
                }}>✍️</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>
                    {row.MoUReSigned ? '✅ MoU Signed & Active' : '⚠️ MoU Signature Required'}
                  </div>
                  <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>
                    {row.MoUReSigned 
                      ? 'The Memorandum of Understanding has been signed and is currently active.' 
                      : 'Please ensure the MoU is signed during the next renewal or re-registration.'}
                  </div>
                </div>
                <button style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  📤 Upload MoU Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#1e293b' }}>Complaint & Service Request Log</h3>
              <button onClick={() => setShowAddComplaint(true)} style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ New Complaint</button>
            </div>

            {/* Add Complaint Form */}
            {showAddComplaint && (
              <div style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:12, padding:20, marginBottom:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr 1fr 1fr', gap:14, marginBottom:16 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Type *</label>
                    <select value={complaintForm.Type} onChange={e => setComplaintForm(p=>({...p,Type:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, boxSizing:'border-box', background:'#fff' }}>
                      <option value="">Select</option>
                      <option value="Missed Pickup">Missed Pickup</option>
                      <option value="Invoice Dispute">Invoice Dispute</option>
                      <option value="Service Issue">Service Issue</option>
                      <option value="Billing Query">Billing Query</option>
                      <option value="Document Request">Document Request</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Description *</label>
                    <input value={complaintForm.Description} onChange={e => setComplaintForm(p=>({...p,Description:e.target.value}))} placeholder="Enter complaint details..." style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Priority</label>
                    <select value={complaintForm.Priority} onChange={e => setComplaintForm(p=>({...p,Priority:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, boxSizing:'border-box', background:'#fff' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Assign To</label>
                    <select value={complaintForm.AssignedTo || ''} onChange={e => setComplaintForm(p=>({...p,AssignedTo:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:13, boxSizing:'border-box', background:'#fff' }}>
                      <option value="">Select</option>
                      <option value="Transport">Transport</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Operations">Operations</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                  <button onClick={() => setShowAddComplaint(false)} style={{ background:'#fff', color:'#374151', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                  <button onClick={addComplaint} disabled={savingComplaint} style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer' }}>{savingComplaint ? '...' : 'Submit'}</button>
                </div>
              </div>
            )}

            {/* Complaints Table - only show when has complaints */}
            {loadingComplaints360 ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</div>
            ) : complaints360.length > 0 && (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, background:'#fff' }}>
                <thead><tr style={{ borderBottom:'2px solid #e2e8f0' }}>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Date</th>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Type</th>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Description</th>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Priority</th>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Assigned To</th>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Status</th>
                  <th style={{ padding:'14px 16px', textAlign:'left', fontWeight:700, color:'#64748b', fontSize:12, textTransform:'uppercase', letterSpacing:'0.5px' }}>Resolved On</th>
                </tr></thead>
                <tbody>
                  {complaints360.map(c => {
                    const statusColors = { Open:{bg:'#dbeafe',c:'#1d4ed8'}, 'In Progress':{bg:'#fef3c7',c:'#92400e'}, Resolved:{bg:'#dcfce7',c:'#15803d'}, Closed:{bg:'#f1f5f9',c:'#64748b'}, Pending:{bg:'#fef3c7',c:'#d97706'} };
                    const sc = statusColors[c.Status] || statusColors.Pending;
                    const priColors = { High:{bg:'#fee2e2',c:'#dc2626'}, Medium:{bg:'#fef3c7',c:'#d97706'}, Low:{bg:'#dcfce7',c:'#15803d'} };
                    const pc = priColors[c.Priority] || priColors.Medium;
                    return (
                      <tr key={c.TicketID || c.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'16px', color:'#374151', fontWeight:500 }}>{c.CreatedAt ? new Date(c.CreatedAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</td>
                        <td style={{ padding:'16px', color:'#374151', fontWeight:500 }}>{c.Category || c.Type || '—'}</td>
                        <td style={{ padding:'16px', color:'#374151' }}>{c.Description || c.Subject || '—'}</td>
                        <td style={{ padding:'16px' }}><span style={{ fontSize:12, fontWeight:600, padding:'4px 14px', borderRadius:20, background:pc.bg, color:pc.c }}>{c.Priority}</span></td>
                        <td style={{ padding:'16px', color:'#374151' }}>{c.AssignedTo || '—'}</td>
                        <td style={{ padding:'16px' }}><span style={{ fontSize:12, fontWeight:600, padding:'4px 14px', borderRadius:20, background:sc.bg, color:sc.c }}>{c.Status}</span></td>
                        <td style={{ padding:'16px', color:'#374151' }}>{c.ResolvedAt ? new Date(c.ResolvedAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#1e293b' }}>Contact Persons</h3>
              <button onClick={() => setShowAddContact(true)} style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add Contact</button>
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <div style={{ background:'#f5f3ff', border:'1.5px solid #c4b5fd', borderRadius:12, padding:16, marginBottom:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:12 }}>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Name *</label>
                    <input value={contactForm.ContactName} onChange={e => setContactForm(p=>({...p,ContactName:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Designation</label>
                    <input value={contactForm.Designation} onChange={e => setContactForm(p=>({...p,Designation:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Mobile *</label>
                    <input value={contactForm.Mobile} onChange={e => setContactForm(p=>({...p,Mobile:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                  <div><label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:4 }}>Email</label>
                    <input type="email" value={contactForm.Email} onChange={e => setContactForm(p=>({...p,Email:e.target.value}))} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, boxSizing:'border-box' }} /></div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <input type="checkbox" id="isPrimaryContact" checked={contactForm.IsPrimary} onChange={e => setContactForm(p=>({...p,IsPrimary:e.target.checked}))} />
                  <label htmlFor="isPrimaryContact" style={{ fontSize:12, color:'#374151' }}>Mark as Primary Contact</label>
                </div>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <button onClick={() => { setShowAddContact(false); setContactForm({ ContactName:'', Designation:'', Mobile:'', Email:'', IsPrimary:false }); }} style={{ background:'#fff', color:'#64748b', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                  <button onClick={addContact} disabled={savingContact} style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>{savingContact ? '...' : 'Save'}</button>
                </div>
              </div>
            )}

            {/* Contact Cards */}
            {loadingContacts ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40 }}>Loading...</div>
            ) : contacts.length === 0 ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:40, background:'#f8fafc', borderRadius:12, border:'1.5px dashed #e2e8f0' }}>No contact persons added</div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {contacts.map(c => {
                  const initials = (c.ContactName || '?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                  const colors = ['#7c3aed','#0891b2','#16a34a','#d97706','#dc2626'];
                  const col = colors[c.ContactID % colors.length];
                  return (
                    <div key={c.ContactID} style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, padding:16, position:'relative' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:col, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16 }}>{initials}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:800, fontSize:14, color:'#1e293b' }}>{c.ContactName}</div>
                          <div style={{ fontSize:12, color:'#64748b' }}>{c.Designation || '—'}</div>
                        </div>
                        {c.IsPrimary && <span style={{ fontSize:10, fontWeight:700, background:'#0891b2', color:'#fff', padding:'3px 10px', borderRadius:20 }}>Primary</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#475569', marginBottom:4 }}>📱 {c.Mobile || '—'}</div>
                      <div style={{ fontSize:12, color:'#475569', marginBottom:12 }}>✉️ {c.Email || '—'}</div>
                      <div style={{ display:'flex', gap:8 }}>
                        {c.Mobile && <a href={`https://wa.me/91${c.Mobile.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ flex:1, textAlign:'center', padding:'8px 0', fontSize:11, fontWeight:700, background:'#dcfce7', color:'#15803d', borderRadius:8, textDecoration:'none' }}>💬 WhatsApp</a>}
                        {c.Email && <a href={`mailto:${c.Email}`} style={{ flex:1, textAlign:'center', padding:'8px 0', fontSize:11, fontWeight:700, background:'#dbeafe', color:'#1d4ed8', borderRadius:8, textDecoration:'none' }}>📧 Email</a>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div style={{ padding:'8px 0' }}>
            {[
              { date: row.CreatedAt, label: 'HCF Registered', desc: `Registration ID: ${row.RegistrationID}`, icon:'📝' },
              { date: row.RegistrationDate, label: 'Registration Confirmed', desc: 'Official registration date recorded', icon:'✅' },
              row.Zone && { date: row.CreatedAt, label: 'Zone Assigned', desc: `Zone: ${row.Zone}`, icon:'📍' },
              row.Route && { date: row.CreatedAt, label: 'Route Assigned', desc: `Route: ${row.Route}`, icon:'🛣️' },
              row.SelectedPlan && { date: row.CreatedAt, label: 'Service Plan Selected', desc: `Plan: ${row.SelectedPlan}`, icon:'📋' },
            ].filter(Boolean).map((item, i, arr) => (
              <div key={i} style={{ display:'flex', gap:14, marginBottom:i < arr.length-1 ? 0 : 0 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:24 }}>
                  <div style={{ width:24, height:24, background:'#5b21b6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{item.icon}</div>
                  {i < arr.length-1 && <div style={{ width:2, flex:1, background:'#e2e8f0', minHeight:40 }} />}
                </div>
                <div style={{ paddingBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'#94a3b8', marginBottom:2 }}>{item.date ? new Date(item.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        </div>{/* end tab body */}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1.5px solid #e2e8f0', background:'#f8fafc', flexShrink:0 }}>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ background:'#fff', color:'#374151', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Close</button>
            <button style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer' }}>🚫 De-register</button>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <a href={`https://wa.me/91${row.Mobile?.replace(/\D/g,'') || ''}`} target="_blank" rel="noreferrer" style={{ background:'#dcfce7', color:'#15803d', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>💬 WhatsApp</a>
            <button onClick={saveNotes} disabled={savingNotes} style={{ background:'#5b21b6', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer' }}>💾 Save Notes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. APPROVAL PIPELINE MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const APPROVAL_STAGES = ['RM Raises', 'Branch Head', 'Reg. Dept', 'Accounts', 'Material', 'Transport', 'RM Welcome'];
const STAGE_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#14b8a6', '#7c3aed'];

const ApprovalPipelineModule = ({ zones, categories, hcfMaster, showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionRow, setActionRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionForm, setActionForm] = useState({ action: '', remarks: '' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const blankForm = { RegistrationID: '', FacilityName: '', Zone: '', Category: '', RaisedBy: '', MonthlyAmount: '', Remarks: '' };
  const [form, setForm] = useState(blankForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hcf-approvals');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load approvals', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stageCount = (stage) => data.filter(d => d.CurrentStage === stage).length;

  const handleHCFSelect = (regId) => {
    const hcf = hcfMaster.find(h => String(h.RegistrationID) === String(regId));
    setForm(p => ({
      ...p, RegistrationID: regId,
      FacilityName: hcf?.InstitutionName || '',
      Zone: hcf?.Zone || '',
      Category: hcf?.Category || '',
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hcf-approvals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast('Application submitted');
      setShowNewModal(false);
      setForm(blankForm);
      load();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleAction = async (action) => {
    setSaving(true);
    try {
      await fetch(`/api/hcf-approvals/${actionRow.ApprovalID}/action`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: actionForm.remarks, stage: actionRow.CurrentStage }),
      });
      showToast(`Action: ${action}`);
      setShowActionModal(false);
      setActionForm({ action: '', remarks: '' });
      load();
    } catch { showToast('Action failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete application for ${row.FacilityName}?`)) return;
    try {
      await fetch(`/api/hcf-approvals/${row.ApprovalID}`, { method: 'DELETE' });
      showToast('Deleted');
      load();
    } catch { showToast('Delete failed', 'error'); }
  };

  const DOC_CHECKLIST = ['Aadhaar', 'PAN', 'GST', 'BMW Auth', 'Facility Photo', 'PCB Auth', 'MoU Copy', 'Agreement Copy'];

  return (
    <div>
      <div className="page-header">
        <div><h1>✅ Registration Approval Pipeline</h1><p>RM → Branch Head → Registration Dept → Accounts → Material → Transport → RM Welcome</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: '#fef3c7', border: '1.5px solid #fbbf24', color: '#92400e', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>⏳ Pending</button>
          <button style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📋 All</button>
          <button className="btn btn-primary" onClick={() => { setForm(blankForm); setShowNewModal(true); }}>＋ New Application</button>
        </div>
      </div>

      {/* Pipeline Stage Summary — icon + color border */}
      {(() => {
        const STAGE_META = [
          { icon:'👤', bg:'#ede9fe', border:'#7c3aed', color:'#5b21b6' },
          { icon:'🏢', bg:'#fef3c7', border:'#fbbf24', color:'#92400e' },
          { icon:'📋', bg:'#f0fdf4', border:'#86efac', color:'#15803d' },
          { icon:'💰', bg:'#dbeafe', border:'#93c5fd', color:'#1d4ed8' },
          { icon:'📦', bg:'#f0fdf4', border:'#86efac', color:'#15803d' },
          { icon:'🚛', bg:'#fce7f3', border:'#f9a8d4', color:'#9d174d' },
          { icon:'🎉', bg:'#dcfce7', border:'#4ade80', color:'#15803d' },
        ];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 18 }}>
            {APPROVAL_STAGES.map((stage, i) => (
              <div key={stage} style={{ textAlign: 'center' }}>
                <div style={{ background: STAGE_META[i].bg, borderRadius: 10, padding: '10px 6px', border: `2px solid ${STAGE_META[i].border}` }}>
                  <div style={{ fontSize: 20 }}>{STAGE_META[i].icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: STAGE_META[i].color, marginTop: 4 }}>{stage}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: STAGE_META[i].color }}>{stageCount(stage)}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="table-wrap" style={{ borderRadius: '12px 12px 0 0' }}>
        {loading ? <div className="no-data">Loading...</div> : data.length === 0
          ? <div className="no-data">No applications found</div>
          : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(row => {
              const stageIdx = APPROVAL_STAGES.indexOf(row.CurrentStage);
              const STAGE_FILLS = ['#7c3aed','#fbbf24','#86efac','#93c5fd','#86efac','#f9a8d4','#4ade80'];
              const stageLabels = ['RM','BH','Reg','Acc','Mat','Trns','Done'];
              return (
                <div key={row.ApprovalID} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', padding: 16, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{row.FacilityName}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {[row.ApprovalID, row.Zone && `${row.Zone} Zone`, row.Category, row.RaisedBy && `Raised by: ${row.RaisedBy}`].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge value={row.Status || 'Pending'} />
                      <span style={{ fontSize: 11, color: '#64748b' }}>{row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString('en-IN') : ''}</span>
                      <button onClick={() => { setActionRow(row); setActionForm({ action: '', remarks: '' }); setShowActionModal(true); }}
                        style={{ background: '#5b21b6', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Review &amp; Act</button>
                      <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                    </div>
                  </div>
                  {/* Pipeline Progress Bar */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', gap: 0 }}>
                      {APPROVAL_STAGES.map((_, i) => (
                        <div key={i} style={{
                          flex: 1, height: 6,
                          background: i < stageIdx ? '#7c3aed' : i === stageIdx ? STAGE_FILLS[i] : '#e2e8f0',
                          borderRadius: i === 0 ? '3px 0 0 3px' : i === APPROVAL_STAGES.length - 1 ? '0 3px 3px 0' : 0,
                        }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: '#94a3b8' }}>
                      {stageLabels.map((lbl, i) => (
                        <span key={i} style={{ color: i < stageIdx ? '#7c3aed' : i === stageIdx ? '#d97706' : undefined, fontWeight: i <= stageIdx ? 700 : undefined }}>
                          {lbl}{i < stageIdx ? ' ✓' : i === stageIdx ? ' ●' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
        }
      </div>
      {data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
        />
      )}

      {/* New Application Modal */}
      {showNewModal && (
        <div style={modalOverlay}>
          <div style={modalBox(700)}>
            <ModalHeader title="New Approval Application" onClose={() => setShowNewModal(false)} />
            <form onSubmit={handleSave}>
              <div style={formGrid}>
                <Field label="Registration ID *">
                  <select value={form.RegistrationID} onChange={e => handleHCFSelect(e.target.value)} style={inputStyle} required>
                    <option value="">-- Select HCF --</option>
                    {hcfMaster.map(h => <option key={h.RegistrationID} value={h.RegistrationID}>{h.RegistrationID} — {h.InstitutionName}</option>)}
                  </select>
                </Field>
                <Input label="Facility Name" value={form.FacilityName} onChange={e => setForm(p => ({ ...p, FacilityName: e.target.value }))} />
                <Input label="Zone" value={form.Zone} onChange={e => setForm(p => ({ ...p, Zone: e.target.value }))} />
                <Input label="Category" value={form.Category} onChange={e => setForm(p => ({ ...p, Category: e.target.value }))} />
                <Input label="Raised By" value={form.RaisedBy} onChange={e => setForm(p => ({ ...p, RaisedBy: e.target.value }))} />
                <Input label="Monthly Amount" value={form.MonthlyAmount} onChange={e => setForm(p => ({ ...p, MonthlyAmount: e.target.value }))} type="number" />
                <div style={{ gridColumn: '1/-1' }}>
                  <Textarea label="Remarks" value={form.Remarks} onChange={e => setForm(p => ({ ...p, Remarks: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-export" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && actionRow && (
        <div style={modalOverlay}>
          <div style={modalBox(600)}>
            <ModalHeader title="Review & Act" onClose={() => setShowActionModal(false)} />
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: '#94a3b8', fontWeight: 600 }}>Facility: </span>{actionRow.FacilityName}</div>
                <div><span style={{ color: '#94a3b8', fontWeight: 600 }}>Zone: </span>{actionRow.Zone}</div>
                <div><span style={{ color: '#94a3b8', fontWeight: 600 }}>Category: </span>{actionRow.Category}</div>
                <div><span style={{ color: '#94a3b8', fontWeight: 600 }}>Stage: </span>{actionRow.CurrentStage}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#1e293b' }}>Document Checklist</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {DOC_CHECKLIST.map(doc => (
                  <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                    <input type="checkbox" /> {doc}
                  </label>
                ))}
              </div>
            </div>
            <Textarea label="Remarks" value={actionForm.remarks} onChange={e => setActionForm(p => ({ ...p, remarks: e.target.value }))} />
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => setShowActionModal(false)}>Cancel</button>
              <button className="btn" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => handleAction('Send Back')} disabled={saving}>Send Back</button>
              <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleAction('Reject')} disabled={saving}>Reject</button>
              <button className="btn btn-primary" onClick={() => handleAction('Approve & Forward')} disabled={saving}>Approve &amp; Forward</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. RENEWAL MANAGEMENT MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const RenewalModule = ({ hcfMaster, refreshHcfMaster, showToast }) => {
  const data = hcfMaster || [];  // Use hcfMaster data directly
  const [bucketTab, setBucketTab] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyHCF, setHistoryHCF] = useState(null);
  const [renewalHistory, setRenewalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHCF, setSelectedHCF] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({});

  // Column filter configuration for Renewal table
  const columnFilterConfig = [
    { key: 'select', type: 'none' },
    { key: 'RegistrationID', type: 'text', placeholder: 'ID...' },
    { key: 'InstitutionName', type: 'text', placeholder: 'HCF Name...' },
    { key: 'Zone', type: 'text', placeholder: 'Zone...' },
    { key: 'Category', type: 'text', placeholder: 'Category...' },
    { key: 'RenewalDate', type: 'date', placeholder: 'Renewal Date' },
    { key: 'AutoRenew', type: 'select', options: ['All', 'Yes', 'No'] },
    { key: 'LastReminded', type: 'date', placeholder: 'Reminded' },
    { key: 'State', type: 'none' },
    { key: 'Actions', type: 'none' }
  ];

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Apply column filters
  const applyColumnFilters = (data) => {
    if (!data || data.length === 0) return [];
    return data.filter(item => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if (!value || value === '' || value === 'All') return true;
        const itemValue = item[key];
        // Date filtering
        if (key === 'RenewalDate' || key === 'LastReminded') {
          if (!itemValue) return false;
          const itemDate = new Date(itemValue).toISOString().split('T')[0];
          return itemDate === value;
        }
        // Boolean/Auto-renew filtering
        if (key === 'AutoRenew') {
          if (value === 'Yes') return !!itemValue;
          if (value === 'No') return !itemValue;
          return true;
        }
        // Text filtering
        if (itemValue === null || itemValue === undefined) return false;
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  };

  const [renewalForm, setRenewalForm] = useState({ 
    newRenewalDate: '', 
    mouSigned: false, 
    autoRenew: false,
    renewalNotes: '',
    renewalPeriod: '12', // months
    generateCertificate: true
  });

  const blankForm = { RegistrationID: '', FacilityName: '', Zone: '', RenewalDate: '', Location: '' };
  const [form, setForm] = useState(blankForm);

  // Generate HCF ID in MPCC-ZONE-0001 format
  const formatHcfId = (row) => {
    const zone = (row.Zone || 'XX').substring(0, 3).toUpperCase();
    const num = String(row.RegistrationID || 1).padStart(4, '0');
    return `MPCC-${zone}-${num}`;
  };

  // First filter by bucket tab
  const bucketFiltered = data.filter(r => {
    if (bucketTab === 'all') return true;
    const days = daysUntil(r.RenewalDate);
    if (days === null) return false;
    if (bucketTab === '60') return days <= 60 && days > 30;
    if (bucketTab === '30') return days <= 30 && days > 15;
    if (bucketTab === '15') return days <= 15 && days > 7;
    if (bucketTab === '7')  return days <= 7;
    return true;
  });
  
  // Then apply column filters
  const filtered = applyColumnFilters(bucketFiltered);

  // State determination based on payment/renewal behavior
  const getState = (row) => {
    const days = daysUntil(row.RenewalDate);
    if (row.Status === 'Renewed') return { label: 'Renewed', bg: '#dcfce7', color: '#15803d' };
    if (row.LatePayer || (days !== null && days < -30)) return { label: 'Late Payer', bg: '#fef3c7', color: '#92400e' };
    if (row.Status === 'Inactive' || row.Status === 'Deregistered') return { label: 'Inactive', bg: '#fee2e2', color: '#dc2626' };
    return { label: 'Active', bg: '#dcfce7', color: '#15803d' };
  };

  const handleHCFSelect = (regId) => {
    const hcf = hcfMaster.find(h => String(h.RegistrationID) === String(regId));
    setForm(p => ({ 
      ...p, 
      RegistrationID: regId, 
      FacilityName: hcf?.InstitutionName || '', 
      Zone: hcf?.Zone || '',
      Location: hcf?.Area || hcf?.City || ''
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hcf-renewals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast('Renewal added');
      setShowNewModal(false);
      setForm(blankForm);
      refreshHcfMaster();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleRemind = async (row) => {
    try {
      const res = await fetch(`/api/hcf-master/${row.RegistrationID}/remind`, { method: 'PUT' });
      const data = await res.json();
      if (data.emailSent) {
        showToast(`✅ Reminder sent to ${data.facilityName} via email`);
      } else {
        showToast(`⚠️ Reminder logged for ${data.facilityName}${data.emailError ? ' (email: ' + data.emailError + ')' : ''}`);
      }
      refreshHcfMaster();
    } catch { showToast('Failed to send reminder', 'error'); }
  };

  const handleSendAllReminders = async () => {
    if (!window.confirm(`Send reminders to ${filtered.length} HCFs with upcoming renewals?`)) return;
    try {
      let sent = 0, failed = 0;
      for (const row of filtered) {
        try {
          const res = await fetch(`/api/hcf-master/${row.RegistrationID}/remind`, { method: 'PUT' });
          const data = await res.json();
          if (data.emailSent) sent++;
          else failed++;
        } catch { failed++; }
      }
      showToast(`📧 Reminders: ${sent} sent, ${failed} pending email config`);
      refreshHcfMaster();
    } catch { showToast('Failed to send reminders', 'error'); }
  };

  const openHistory = async (row) => {
    setHistoryHCF(row);
    setRenewalHistory([]);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/hcf-renewal-history/${row.RegistrationID}`);
      const json = await res.json();
      setRenewalHistory(Array.isArray(json) ? json : []);
    } catch { setRenewalHistory([]); }
    finally { setLoadingHistory(false); }
  };

  const handleRenew = async (row) => {
    // Open renewal modal with HCF details
    setSelectedHCF(row);
    const currentDate = row.RenewalDate ? new Date(row.RenewalDate) : new Date();
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setRenewalForm({
      newRenewalDate: newDate.toISOString().split('T')[0],
      mouSigned: false,
      autoRenew: row.AutoRenew || false,
      renewalNotes: '',
      renewalPeriod: '12',
      generateCertificate: true
    });
    setShowRenewModal(true);
  };

  const processRenewal = async () => {
    if (!selectedHCF) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hcf-master/${selectedHCF.RegistrationID}/renew`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newRenewalDate: renewalForm.newRenewalDate,
          mouSigned: renewalForm.mouSigned,
          autoRenew: renewalForm.autoRenew,
          renewalNotes: renewalForm.renewalNotes,
          generateCertificate: renewalForm.generateCertificate
        })
      });
      const data = await res.json();
      showToast(`Renewal processed successfully!${data.certificateId ? ' Certificate generated.' : ''}`);
      setShowRenewModal(false);
      setSelectedHCF(null);
      refreshHcfMaster();
    } catch { showToast('Renewal failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleToggleAuto = async (row) => {
    try {
      await fetch(`/api/hcf-master/${row.RegistrationID}/auto-renew`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AutoRenew: !row.AutoRenew }),
      });
      showToast('Auto-renew updated');
      refreshHcfMaster();
    } catch { showToast('Failed', 'error'); }
  };

  const handleNextStep = () => {
    if (selectedRows.length === 0) {
      showToast('Please select at least one renewal to proceed', 'error');
      return;
    }
    showToast(`Processing ${selectedRows.length} selected renewals...`);
    // Add workflow logic here
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔄</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Renewal Management</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Auto-renewal tracking — 60 / 30 / 15 / 7 day reminders, MoU re-sign, one-click extension</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSendAllReminders} style={{ 
            background: '#fff', border: '2px solid #e2e8f0', color: '#374151', 
            borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <span style={{ fontSize: 16 }}>📤</span> Send All Reminders
          </button>
          <button onClick={() => { setForm(blankForm); setShowNewModal(true); }} style={{ 
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', 
            border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, 
            fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
          }}>
            + Add Renewal
          </button>
        </div>
      </div>

      {/* 5 Gradient Bucket Cards - All + 4 time-based */}
      {(() => {
        const cntAll = data.length;
        const cnt60 = data.filter(r => { const d = daysUntil(r.RenewalDate); return d !== null && d <= 60 && d > 30; }).length;
        const cnt30 = data.filter(r => { const d = daysUntil(r.RenewalDate); return d !== null && d <= 30 && d > 15; }).length;
        const cnt15 = data.filter(r => { const d = daysUntil(r.RenewalDate); return d !== null && d <= 15 && d > 7; }).length;
        const cnt7  = data.filter(r => { const d = daysUntil(r.RenewalDate); return d !== null && d <= 7; }).length;
        const buckets = [
          { id:'all', cnt: cntAll, label:'All HCFs', sub:'Total Registered', bg:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', border:'#7dd3fc', numColor:'#0284c7', textColor:'#0284c7', subColor:'#0369a1' },
          { id:'60', cnt: cnt60, label:'Expiring in 60 days', sub:'Early Reminder', bg:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'#86efac', numColor:'#15803d', textColor:'#15803d', subColor:'#16a34a' },
          { id:'30', cnt: cnt30, label:'Expiring in 30 days', sub:'Action Needed',  bg:'linear-gradient(135deg,#fefce8,#fef9c3)', border:'#fde047', numColor:'#ca8a04', textColor:'#ca8a04', subColor:'#a16207' },
          { id:'15', cnt: cnt15, label:'Expiring in 15 days', sub:'Urgent',         bg:'linear-gradient(135deg,#fff7ed,#ffedd5)', border:'#fdba74', numColor:'#ea580c', textColor:'#ea580c', subColor:'#c2410c' },
          { id:'7',  cnt: cnt7,  label:'Expiring in 7 days',  sub:'Critical',       bg:'linear-gradient(135deg,#fef2f2,#fee2e2)', border:'#fca5a5', numColor:'#dc2626', textColor:'#dc2626', subColor:'#b91c1c' },
        ];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
            {buckets.map(b => (
              <div key={b.id} onClick={() => setBucketTab(bucketTab === b.id ? 'all' : b.id)}
                style={{ 
                  background: b.bg, borderRadius: 14, padding: '18px 16px', 
                  border: `2.5px solid ${bucketTab === b.id ? b.numColor : b.border}`, 
                  cursor: 'pointer', textAlign: 'center', 
                  boxShadow: bucketTab === b.id ? `0 0 0 3px ${b.border}44` : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: b.numColor, lineHeight: 1 }}>{b.cnt}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: b.textColor, marginTop: 6 }}>{b.label}</div>
                <div style={{ fontSize: 11, color: b.subColor, marginTop: 2 }}>{b.sub}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Table */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 420px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>HCF ID</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Facility Name</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zone</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Renewal Date</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Days Left</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto-Renew</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MoU Re-sign</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Reminded</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b', borderBottom: '1.5px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
                {/* Column Filter Row */}
                <tr className="filter-row" style={{ background: '#fafafa' }}>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="text" placeholder="ID..." value={columnFilters.RegistrationID || ''} onChange={e => handleColumnFilterChange('RegistrationID', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }} />
                  </th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="text" placeholder="Name..." value={columnFilters.InstitutionName || ''} onChange={e => handleColumnFilterChange('InstitutionName', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }} />
                  </th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="text" placeholder="Zone..." value={columnFilters.Zone || ''} onChange={e => handleColumnFilterChange('Zone', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }} />
                  </th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="date" value={columnFilters.RenewalDate || ''} onChange={e => handleColumnFilterChange('RenewalDate', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }} />
                  </th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}></th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}>
                    <select value={columnFilters.AutoRenew || ''} onChange={e => handleColumnFilterChange('AutoRenew', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11, background: '#fff' }}>
                      <option value="">All</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}></th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}>
                    <input type="date" value={columnFilters.LastReminded || ''} onChange={e => handleColumnFilterChange('LastReminded', e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }} />
                  </th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}></th>
                  <th style={{ padding: '8px 6px', borderBottom: '1px solid #e2e8f0' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No renewal records</td></tr>
                ) : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(row => {
                  const days = daysUntil(row.RenewalDate);
                  const state = getState(row);
                  // Days left badge colors
                  let daysBg, daysColor;
                  if (days === null) { daysBg = '#f1f5f9'; daysColor = '#94a3b8'; }
                  else if (days < 0) { daysBg = '#fee2e2'; daysColor = '#dc2626'; }
                  else if (days <= 7) { daysBg = '#fef3c7'; daysColor = '#b45309'; }
                  else if (days <= 15) { daysBg = '#dcfce7'; daysColor = '#15803d'; }
                  else if (days <= 30) { daysBg = '#fef3c7'; daysColor = '#ca8a04'; }
                  else { daysBg = '#dcfce7'; daysColor = '#15803d'; }

                  return (
                    <tr key={row.RegistrationID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#3b82f6', fontSize: 12 }}>
                        {formatHcfId(row)}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{row.InstitutionName || row.FacilityName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{row.Area || row.City || row.Location || ''}</div>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: '#374151' }}>{row.Zone}</td>
                      <td style={{ padding: '14px 12px', color: '#374151', fontWeight: 500 }}>
                        {formatDate(row.RenewalDate) || <span style={{color:'#94a3b8'}}>Not Set</span>}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          background: daysBg, color: daysColor, borderRadius: 8, 
                          padding: '5px 12px', fontSize: 12, fontWeight: 700,
                          display: 'inline-block', minWidth: 60
                        }}>
                          {days === null ? '—' : days < 0 ? `${Math.abs(days)} overdue` : `${days} days`}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={!!row.AutoRenew} 
                            onChange={() => handleToggleAuto(row)} 
                            style={{ 
                              width: 18, height: 18, accentColor: '#3b82f6', cursor: 'pointer',
                              borderRadius: 4
                            }} 
                          />
                          <span style={{ 
                            fontSize: 12, 
                            color: row.AutoRenew ? '#1d4ed8' : '#94a3b8', 
                            fontWeight: 600 
                          }}>
                            {row.AutoRenew ? 'ON' : 'OFF'}
                          </span>
                        </label>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          background: row.MoUReSigned ? '#dcfce7' : '#fef3c7', 
                          color: row.MoUReSigned ? '#15803d' : '#b45309', 
                          borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                          border: row.MoUReSigned ? '1px solid #86efac' : '1px solid #fcd34d'
                        }}>
                          {row.MoUReSigned ? 'Done' : 'Required'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#374151', fontSize: 12 }}>
                        {row.LastReminded ? new Date(row.LastReminded).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <span style={{ 
                          background: state.bg, color: state.color, 
                          borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700,
                          border: `1px solid ${state.color}33`
                        }}>
                          {state.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button onClick={() => handleRenew(row)} style={{ 
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                            color: '#fff', border: 'none', borderRadius: 8, 
                            padding: '8px 14px', fontSize: 12, fontWeight: 700, 
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                            boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)'
                          }}>
                            <span style={{ fontSize: 12 }}>⚡</span> Renew
                          </button>
                          <button onClick={() => openHistory(row)} style={{ 
                            background: '#f0fdf4', 
                            color: '#15803d', border: '1.5px solid #86efac', borderRadius: 8, 
                            padding: '8px 12px', fontSize: 12, fontWeight: 700, 
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5
                          }}>
                            <span style={{ fontSize: 12 }}>📜</span>
                          </button>
                          <button onClick={() => handleRemind(row)} style={{ 
                            background: '#f5f3ff', 
                            color: '#7c3aed', border: '1.5px solid #c4b5fd', borderRadius: 8, 
                            padding: '8px 14px', fontSize: 12, fontWeight: 700, 
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5
                          }}>
                            <span style={{ fontSize: 12 }}>📤</span> Remind
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* Footer with Cancel and Next Step */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', marginTop: 16, borderTop: '1px solid #e2e8f0'
      }}>
        <button style={{ 
          background: '#fff', border: '1.5px solid #e2e8f0', color: '#dc2626', 
          borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, 
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span>✕</span> Cancel
        </button>
        <button onClick={handleNextStep} style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', 
          border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, 
          fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        }}>
          Next Step →
        </button>
      </div>

      {/* New Renewal Modal */}
      {showNewModal && (
        <div style={modalOverlay}>
          <div style={modalBox(560)}>
            <ModalHeader title="Add Renewal" onClose={() => setShowNewModal(false)} />
            <form onSubmit={handleSave}>
              <div style={formGrid}>
                <Field label="HCF *">
                  <select value={form.RegistrationID} onChange={e => handleHCFSelect(e.target.value)} style={inputStyle} required>
                    <option value="">-- Select HCF --</option>
                    {hcfMaster.map(h => <option key={h.RegistrationID} value={h.RegistrationID}>{h.InstitutionName}</option>)}
                  </select>
                </Field>
                <Input label="Facility Name" value={form.FacilityName} onChange={e => setForm(p => ({ ...p, FacilityName: e.target.value }))} />
                <Input label="Zone" value={form.Zone} onChange={e => setForm(p => ({ ...p, Zone: e.target.value }))} />
                <Input label="Location" value={form.Location} onChange={e => setForm(p => ({ ...p, Location: e.target.value }))} />
                <Input label="Renewal Date" type="date" value={form.RenewalDate} onChange={e => setForm(p => ({ ...p, RenewalDate: e.target.value }))} required />
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-export" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renewal Process Modal */}
      {showRenewModal && selectedHCF && (
        <div style={modalOverlay}>
          <div style={modalBox(600)}>
            <ModalHeader title="Process Renewal" onClose={() => { setShowRenewModal(false); setSelectedHCF(null); }} />
            <div style={{ padding: 20 }}>
              {/* HCF Info Header */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: '#22c55e', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏥</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d' }}>{selectedHCF.InstitutionName || selectedHCF.FacilityName}</div>
                    <div style={{ fontSize: 12, color: '#166534' }}>{formatHcfId(selectedHCF)} · {selectedHCF.Zone} Zone</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid #86efac' }}>
                  <div><span style={{ fontSize: 11, color: '#166534' }}>Current Renewal Date:</span><div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{selectedHCF.RenewalDate ? new Date(selectedHCF.RenewalDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : '—'}</div></div>
                  <div><span style={{ fontSize: 11, color: '#166534' }}>Status:</span><div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{selectedHCF.Status || 'Active'}</div></div>
                </div>
              </div>

              {/* Renewal Form */}
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>New Renewal Date *</label>
                    <input type="date" value={renewalForm.newRenewalDate} onChange={e => setRenewalForm(p => ({...p, newRenewalDate: e.target.value}))} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Renewal Period</label>
                    <select value={renewalForm.renewalPeriod} onChange={e => setRenewalForm(p => ({...p, renewalPeriod: e.target.value}))} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', background: '#fff' }}>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months (1 Year)</option>
                      <option value="24">24 Months (2 Years)</option>
                      <option value="36">36 Months (3 Years)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={renewalForm.mouSigned} onChange={e => setRenewalForm(p => ({...p, mouSigned: e.target.checked}))} style={{ width: 18, height: 18, accentColor: '#22c55e' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>MoU Re-signed</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={renewalForm.autoRenew} onChange={e => setRenewalForm(p => ({...p, autoRenew: e.target.checked}))} style={{ width: 18, height: 18, accentColor: '#3b82f6' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Enable Auto-Renew</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={renewalForm.generateCertificate} onChange={e => setRenewalForm(p => ({...p, generateCertificate: e.target.checked}))} style={{ width: 18, height: 18, accentColor: '#7c3aed' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>📜 Generate New Certificate</span>
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Renewal Notes</label>
                  <textarea value={renewalForm.renewalNotes} onChange={e => setRenewalForm(p => ({...p, renewalNotes: e.target.value}))} placeholder="Add any notes about this renewal..." rows={3} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => { setShowRenewModal(false); setSelectedHCF(null); }} style={{ background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={processRenewal} disabled={saving} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)' }}>{saving ? 'Processing...' : '✓ Process Renewal'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renewal History Modal */}
      {showHistoryModal && historyHCF && (
        <div style={modalOverlay}>
          <div style={modalBox(600)}>
            <ModalHeader title={`Renewal History — ${historyHCF.InstitutionName || historyHCF.FacilityName}`} onClose={() => { setShowHistoryModal(false); setHistoryHCF(null); }} />
            <div style={{ padding: 20, maxHeight: 500, overflowY: 'auto' }}>
              {/* HCF Info Header */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: '#22c55e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>{historyHCF.InstitutionName || historyHCF.FacilityName}</div>
                    <div style={{ fontSize: 11, color: '#166534' }}>{formatHcfId(historyHCF)} · {historyHCF.Zone} Zone</div>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1e293b' }}>
                📜 Renewal & Re-registration History
              </div>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Loading history...</div>
              ) : renewalHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#64748b', background: '#f8fafc', borderRadius: 8 }}>
                  No renewal history yet. History will be recorded when renewals are processed.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {renewalHistory.map((h, idx) => {
                    const isRereg = h.Action === 'Re-registration';
                    return (
                      <div key={h.HistoryID || idx} style={{
                        background: isRereg ? '#f0fdf4' : '#fff',
                        border: `1.5px solid ${isRereg ? '#86efac' : '#e2e8f0'}`,
                        borderRadius: 10, padding: 14,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ 
                            background: isRereg ? '#22c55e' : '#3b82f6',
                            color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6
                          }}>
                            {h.Action || 'Renewal'}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {h.CreatedAt ? new Date(h.CreatedAt).toLocaleString('en-IN') : '—'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                          {h.PreviousRenewalDate && (
                            <div>
                              <span style={{ color: '#64748b' }}>Previous:</span>
                              <span style={{ fontWeight: 600, marginLeft: 6, color: '#374151' }}>
                                {new Date(h.PreviousRenewalDate).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          )}
                          <div>
                            <span style={{ color: '#64748b' }}>New Date:</span>
                            <span style={{ fontWeight: 600, marginLeft: 6, color: '#15803d' }}>
                              {h.NewRenewalDate ? new Date(h.NewRenewalDate).toLocaleDateString('en-IN') : '—'}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>MoU Signed:</span>
                            <span style={{ fontWeight: 600, marginLeft: 6, color: h.MoUSigned ? '#15803d' : '#dc2626' }}>
                              {h.MoUSigned ? '✓ Yes' : '✗ No'}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Certificate:</span>
                            <span style={{ fontWeight: 600, marginLeft: 6, color: h.CertificateGenerated ? '#7c3aed' : '#64748b' }}>
                              {h.CertificateGenerated ? '📜 Generated' : '—'}
                            </span>
                          </div>
                        </div>
                        {h.Remarks && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontStyle: 'italic', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                            💬 {h.Remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DE-REGISTRATION / CLOSURE MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const DEREG_STAGES = ['Awaiting Accounts', 'Awaiting Transport', 'Awaiting HOD', 'Final Approved'];
const DEREG_STAGE_COLORS = ['#f59e0b', '#0ea5e9', '#7c3aed', '#10b981'];

const DeregisterModule = ({ hcfMaster, showToast, user }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({});

  // Column filter configuration
  const columnFilterConfig = [
    { key: 'hcfId', label: 'HCF ID', type: 'text' },
    { key: 'facilityName', label: 'Facility Name', type: 'text' },
    { key: 'zone', label: 'Zone', type: 'text' },
    { key: 'closureDate', label: 'Closure Date', type: 'date' },
    { key: 'reason', label: 'Reason', type: 'text' },
    { key: 'outstanding', label: 'Outstanding', type: 'text' },
    { key: 'kitReturned', label: 'Kit Returned', type: 'select', options: ['Pending', 'Returned'] },
    { key: 'stage', label: 'Stage', type: 'select', options: ['Awaiting Accounts', 'Awaiting Transport', 'Awaiting HOD', 'Final Approved', 'Completed', 'Rejected'] },
  ];

  // Handle column filter change
  const handleColumnFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Apply column filters to data
  const applyColumnFilters = (dataToFilter) => {
    return dataToFilter.filter(row => {
      const zone = (row.Zone || row.HCFZone || 'XX').substring(0, 3).toUpperCase();
      const hcfId = `MPCC-${zone}-${String(row.RegistrationID || row.DeregID).padStart(4, '0')}`;
      const closureDate = row.CreatedAt ? new Date(row.CreatedAt).toISOString().split('T')[0] : '';
      
      for (const filter of columnFilterConfig) {
        const filterValue = columnFilters[filter.key];
        if (!filterValue) continue;
        
        let cellValue = '';
        switch (filter.key) {
          case 'hcfId': cellValue = hcfId; break;
          case 'facilityName': cellValue = row.FacilityName || row.InstitutionName || ''; break;
          case 'zone': cellValue = row.Zone || row.HCFZone || ''; break;
          case 'closureDate': cellValue = closureDate; break;
          case 'reason': cellValue = row.Reason || ''; break;
          case 'outstanding': cellValue = String(row.Outstanding || 0); break;
          case 'kitReturned': cellValue = row.KitReturned ? 'Returned' : 'Pending'; break;
          case 'stage': cellValue = row.Stage || 'Pending'; break;
          default: cellValue = '';
        }
        
        if (filter.type === 'date') {
          if (filterValue && cellValue !== filterValue) return false;
        } else if (filter.type === 'select') {
          if (filterValue && cellValue !== filterValue) return false;
        } else {
          if (!cellValue.toLowerCase().includes(filterValue.toLowerCase())) return false;
        }
      }
      return true;
    });
  };

  const blankForm = { RegistrationID: '', FacilityName: '', Zone: '', Reason: '', Outstanding: '' };
  const [form, setForm] = useState(blankForm);
  const [detailRemarks, setDetailRemarks] = useState('');
  const [checklist, setChecklist] = useState({
    LetterheadReceived: false, CertReturned: false, AgreementReturned: false,
    OutstandingCleared: false, KitReturned: false, HologramClosed: false,
  });

  // View toggle for role users (queue vs history)
  const [viewMode, setViewMode] = useState('queue'); // 'queue' or 'history'
  
  // History tracking
  const [detailTab, setDetailTab] = useState('checklist'); // 'checklist' or 'history'
  const [stageHistory, setStageHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Role-based stage mapping
  const ROLE_STAGE_MAP = {
    'Accounts': 'Awaiting Accounts',
    'Accountant': 'Awaiting Accounts',
    'Transport': 'Awaiting Transport',
    'HOD': 'Awaiting HOD',
    'Director': 'Final Approved',
  };
  const STAGE_ORDER = ['Awaiting Accounts', 'Awaiting Transport', 'Awaiting HOD', 'Final Approved', 'Completed', 'Rejected'];
  const userRole = user?.roleName || 'Admin';
  const isAdmin = ['Admin', 'SuperAdmin', 'Super Admin', 'admin', 'superadmin'].includes(userRole);
  const userStage = ROLE_STAGE_MAP[userRole];
  const userStageIndex = STAGE_ORDER.indexOf(userStage);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hcf-deregistrations');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };
  
  const loadHistory = async (deregId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/hcf-deregistrations/${deregId}/history`);
      const json = await res.json();
      setStageHistory(Array.isArray(json) ? json : []);
    } catch { setStageHistory([]); }
    finally { setLoadingHistory(false); }
  };

  useEffect(() => { load(); }, []);

  // Filter data based on user role and view mode
  const getFilteredData = () => {
    if (isAdmin) return data;
    if (viewMode === 'queue') {
      return data.filter(d => d.Stage === userStage);
    } else {
      // History: requests that have passed user's stage
      return data.filter(d => {
        const stageIdx = STAGE_ORDER.indexOf(d.Stage);
        return stageIdx > userStageIndex || d.Stage === 'Completed' || d.Stage === 'Rejected';
      });
    }
  };
  const filteredData = applyColumnFilters(getFilteredData());

  const stageCount = (stage) => data.filter(d => d.Stage === stage).length;
  const queueCount = data.filter(d => d.Stage === userStage).length;
  const historyCount = data.filter(d => {
    const stageIdx = STAGE_ORDER.indexOf(d.Stage);
    return stageIdx > userStageIndex || d.Stage === 'Completed' || d.Stage === 'Rejected';
  }).length;

  const handleHCFSelect = (regId) => {
    const hcf = hcfMaster.find(h => String(h.RegistrationID) === String(regId));
    setForm(p => ({ ...p, RegistrationID: regId, FacilityName: hcf?.InstitutionName || '', Zone: hcf?.Zone || '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hcf-deregistrations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast('Closure request created');
      setShowNewModal(false);
      setForm(blankForm);
      load();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const openDetail = (row) => {
    setDetailRow(row);
    setDetailRemarks(row.Remarks || '');
    setChecklist({
      LetterheadReceived: !!row.LetterheadReceived,
      CertReturned: !!row.CertReturned,
      AgreementReturned: !!row.AgreementReturned,
      OutstandingCleared: !!row.OutstandingCleared,
      KitReturned: !!row.KitReturned,
      HologramClosed: !!row.HologramClosed,
    });
    setDetailTab('checklist');
    setStageHistory([]);
    loadHistory(row.DeregID);
    setShowDetailModal(true);
  };

  const handleChecklistSave = async () => {
    try {
      await fetch(`/api/hcf-deregistrations/${detailRow.DeregID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checklist, Remarks: detailRemarks }),
      });
      showToast('Checklist updated');
      load();
    } catch { showToast('Save failed', 'error'); }
  };

  const handleAction = async (action) => {
    setActionSaving(true);
    try {
      await fetch(`/api/hcf-deregistrations/${detailRow.DeregID}/action`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          remarks: detailRemarks,
          actionBy: user?.name || user?.username || 'Admin',
          actionByRole: userRole
        }),
      });
      showToast(`Action: ${action}`);
      setShowDetailModal(false);
      load();
    } catch { showToast('Action failed', 'error'); }
    finally { setActionSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete closure request for ${row.FacilityName}?`)) return;
    try {
      await fetch(`/api/hcf-deregistrations/${row.DeregID}`, { method: 'DELETE' });
      showToast('Deleted');
      load();
    } catch { showToast('Delete failed', 'error'); }
  };

  const CHECKLIST_ITEMS = [
    { key: 'LetterheadReceived', label: 'HCF Letterhead Received' },
    { key: 'CertReturned', label: 'Certificate Returned' },
    { key: 'AgreementReturned', label: 'Agreement Returned' },
    { key: 'OutstandingCleared', label: 'Outstanding Cleared' },
    { key: 'KitReturned', label: 'Kit Returned' },
    { key: 'HologramClosed', label: 'Hologram Closed' },
  ];

  const stageIndex = (stage) => DEREG_STAGES.indexOf(stage);

  // Role descriptions
  const ROLE_DESCRIPTIONS = {
    'Accounts': 'Verify outstanding payments are cleared before proceeding',
    'Transport': 'Ensure kit and vehicle are recalled from facility',
    'HOD': 'Review and sign-off on closure request',
    'Director': 'Final approval for deregistration',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🚫 De-registration / Closure Workflow</h1>
          {isAdmin ? (
            <p>HCF closure pipeline — Accounts → Transport → HOD → Dr. Sir (Final Approval)</p>
          ) : (
            <p style={{ color: '#7c3aed', fontWeight: 600 }}>
              📋 {userRole} Dashboard — {ROLE_DESCRIPTIONS[userRole] || 'Review and approve closure requests'}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isAdmin && (
            <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              👤 Logged in as: {userRole}
            </span>
          )}
          {isAdmin && (
            <button onClick={() => { setForm(blankForm); setShowNewModal(true); }} style={{ background: '#fee2e2', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🚫 New Closure Request</button>
          )}
        </div>
      </div>

      {/* Stage Summary — show all for admin, highlight current stage for role users */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 18 }}>
        {[
          { stage:'Awaiting Accounts',  bg:'#fef2f2', border:'#fca5a5', numColor:'#dc2626', icon:'💰', sub:'Zero-outstanding check' },
          { stage:'Awaiting Transport', bg:'#fff7ed', border:'#fdba74', numColor:'#ea580c', icon:'🚛', sub:'Kit & vehicle recall' },
          { stage:'Awaiting HOD',       bg:'#fefce8', border:'#fde047', numColor:'#ca8a04', icon:'🏢', sub:'HOD sign-off' },
          { stage:'Final Approved',     bg:'#f5f3ff', border:'#c4b5fd', numColor:'#5b21b6', icon:'👨‍⚕️', sub:'Director sign-off' },
          ...(isAdmin ? [
            { stage:'Completed',        bg:'#dcfce7', border:'#86efac', numColor:'#15803d', icon:'✅', sub:'Fully deregistered' },
            { stage:'Rejected',         bg:'#fee2e2', border:'#fca5a5', numColor:'#dc2626', icon:'❌', sub:'Request rejected' },
          ] : []),
        ].map(s => {
          const isMyStage = !isAdmin && s.stage === userStage;
          return (
            <div key={s.stage} style={{ 
              background: s.bg, borderRadius: 12, padding: 14, 
              border: isMyStage ? `3px solid ${s.numColor}` : `2px solid ${s.border}`, 
              textAlign: 'center',
              opacity: (!isAdmin && !isMyStage) ? 0.5 : 1,
              transform: isMyStage ? 'scale(1.02)' : 'none',
              boxShadow: isMyStage ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.numColor }}>{stageCount(s.stage)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.numColor, marginTop: 4 }}>{s.icon} {s.stage}</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{s.sub}</div>
              {isMyStage && <div style={{ fontSize: 9, color: '#15803d', marginTop: 4, fontWeight: 700 }}>← YOUR QUEUE</div>}
            </div>
          );
        })}
      </div>

      {/* View Mode Tabs - only for role users */}
      {!isAdmin && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
          <button 
            onClick={() => setViewMode('queue')}
            style={{ 
              padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: '2px solid #7c3aed', borderRadius: '8px 0 0 8px',
              background: viewMode === 'queue' ? '#7c3aed' : '#fff',
              color: viewMode === 'queue' ? '#fff' : '#7c3aed',
            }}
          >
            📋 My Queue ({queueCount})
          </button>
          <button 
            onClick={() => setViewMode('history')}
            style={{ 
              padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: '2px solid #7c3aed', borderLeft: 'none', borderRadius: '0 8px 8px 0',
              background: viewMode === 'history' ? '#7c3aed' : '#fff',
              color: viewMode === 'history' ? '#fff' : '#7c3aed',
            }}
          >
            📜 My History ({historyCount})
          </button>
        </div>
      )}

      <div className="table-wrap" style={{ overflowX: 'auto' }}>
        {loading ? <div className="no-data">Loading...</div> : (
          <table style={{ minWidth: 1200 }}>
            <thead>
              <tr>
                <th>HCF ID</th><th>Facility Name</th><th>Zone</th><th>Closure Request Date</th>
                <th>Reason</th><th>Outstanding</th><th>Kit Returned</th><th>Current Stage</th><th>Actions</th>
              </tr>
              <tr className="filter-row">
                {columnFilterConfig.map(filter => (
                  <th key={filter.key} style={{ padding: '4px 6px' }}>
                    {filter.type === 'select' ? (
                      <select
                        value={columnFilters[filter.key] || ''}
                        onChange={(e) => handleColumnFilterChange(filter.key, e.target.value)}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4 }}
                      >
                        <option value="">All</option>
                        {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : filter.type === 'date' ? (
                      <input
                        type="date"
                        value={columnFilters[filter.key] || ''}
                        onChange={(e) => handleColumnFilterChange(filter.key, e.target.value)}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4 }}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Search...`}
                        value={columnFilters[filter.key] || ''}
                        onChange={(e) => handleColumnFilterChange(filter.key, e.target.value)}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4 }}
                      />
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? <tr><td colSpan={9} className="no-data">{isAdmin ? 'No closure requests' : (viewMode === 'queue' ? 'No requests pending your approval' : 'No history yet')}</td></tr>
                : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(row => {
                  const stageColors = { 'Awaiting Accounts': '#dc2626', 'Awaiting Transport': '#ea580c', 'Awaiting HOD': '#ca8a04', 'Final Approved': '#5b21b6', 'Completed': '#15803d', 'Rejected': '#dc2626' };
                  const stageBg = { 'Awaiting Accounts': '#fef3c7', 'Awaiting Transport': '#ffedd5', 'Awaiting HOD': '#fefce8', 'Final Approved': '#f5f3ff', 'Completed': '#dcfce7', 'Rejected': '#fee2e2' };
                  const zone = (row.Zone || row.HCFZone || 'XX').substring(0, 3).toUpperCase();
                  const hcfId = `MPCC-${zone}-${String(row.RegistrationID || row.DeregID).padStart(4, '0')}`;
                  return (
                    <tr key={row.DeregID}>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>{hcfId}</td>
                      <td>
                        <strong>{row.FacilityName || row.InstitutionName || '—'}</strong>
                        {(row.ContactPerson || row.Mobile) && <><br /><span style={{ fontSize: 10, color: '#64748b' }}>{row.ContactPerson} {row.Mobile && `• ${row.Mobile}`}</span></>}
                      </td>
                      <td><span style={{ background:'#ede9fe', color:'#4c1d95', fontSize:12, fontWeight:700, borderRadius:6, padding:'3px 8px' }}>{row.Zone || row.HCFZone || '—'}</span></td>
                      <td>{row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td>{row.Reason || '—'}</td>
                      <td style={{ color: (row.Outstanding > 0) ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                        ₹{Number(row.Outstanding || 0).toLocaleString('en-IN')}
                        <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 4 }}>{row.Outstanding > 0 ? '(Pending)' : '(Clear)'}</span>
                      </td>
                      <td>
                        <span style={{ background: row.KitReturned ? '#dcfce7' : '#fef3c7', color: row.KitReturned ? '#15803d' : '#92400e', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                          {row.KitReturned ? 'Returned' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: stageBg[row.Stage] || '#f1f5f9', color: stageColors[row.Stage] || '#475569', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>
                          {row.Stage || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openDetail(row)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginRight: 4 }}>Review</button>
                        <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* New Closure Modal */}
      {showNewModal && (
        <div style={modalOverlay}>
          <div style={modalBox(560)}>
            <ModalHeader title="New Closure Request" onClose={() => setShowNewModal(false)} />
            <form onSubmit={handleSave}>
              <div style={formGrid}>
                <Field label="HCF *">
                  <select value={form.RegistrationID} onChange={e => handleHCFSelect(e.target.value)} style={inputStyle} required>
                    <option value="">-- Select HCF --</option>
                    {hcfMaster.map(h => <option key={h.RegistrationID} value={h.RegistrationID}>{h.InstitutionName}</option>)}
                  </select>
                </Field>
                <Input label="Facility Name" value={form.FacilityName} onChange={e => setForm(p => ({ ...p, FacilityName: e.target.value }))} />
                <Input label="Zone" value={form.Zone} onChange={e => setForm(p => ({ ...p, Zone: e.target.value }))} />
                <Input label="Outstanding Amount (₹)" value={form.Outstanding} onChange={e => setForm(p => ({ ...p, Outstanding: e.target.value }))} type="number" />
                <div style={{ gridColumn: '1/-1' }}>
                  <Textarea label="Reason for Closure" value={form.Reason} onChange={e => setForm(p => ({ ...p, Reason: e.target.value }))} required />
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-export" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailRow && (
        <div style={modalOverlay}>
          <div style={modalBox(680)}>
            <ModalHeader title={`Closure Details — ${detailRow.FacilityName}`} onClose={() => setShowDetailModal(false)} />

            {/* 4-step stepper */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              {DEREG_STAGES.map((stage, i) => {
                const current = stageIndex(detailRow.Stage);
                const done = i <= current;
                return (
                  <React.Fragment key={stage}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                        background: done ? DEREG_STAGE_COLORS[i] : '#e2e8f0',
                        color: done ? '#fff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13,
                      }}>{i + 1}</div>
                      <div style={{ fontSize: 11, color: done ? '#1e293b' : '#94a3b8', fontWeight: done ? 700 : 400 }}>{stage}</div>
                    </div>
                    {i < DEREG_STAGES.length - 1 && (
                      <div style={{ height: 2, flex: 0.5, background: i < stageIndex(detailRow.Stage) ? '#10b981' : '#e2e8f0' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Tabs for Checklist / History */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
              <button 
                onClick={() => setDetailTab('checklist')}
                style={{ 
                  padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: '2px solid #10b981', borderRadius: '6px 0 0 6px',
                  background: detailTab === 'checklist' ? '#10b981' : '#fff',
                  color: detailTab === 'checklist' ? '#fff' : '#10b981',
                }}
              >
                📋 Checklist
              </button>
              <button 
                onClick={() => setDetailTab('history')}
                style={{ 
                  padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: '2px solid #10b981', borderLeft: 'none', borderRadius: '0 6px 6px 0',
                  background: detailTab === 'history' ? '#10b981' : '#fff',
                  color: detailTab === 'history' ? '#fff' : '#10b981',
                }}
              >
                📜 History ({stageHistory.length})
              </button>
            </div>

            {/* Checklist Tab */}
            {detailTab === 'checklist' && (
              <>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#1e293b' }}>Closure Checklist</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {CHECKLIST_ITEMS.map(item => (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <input type="checkbox" checked={checklist[item.key]}
                          onChange={e => setChecklist(p => ({ ...p, [item.key]: e.target.checked }))} 
                          disabled={!isAdmin && detailRow?.Stage !== userStage} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  {(isAdmin || detailRow?.Stage === userStage) && (
                    <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleChecklistSave}>Save Checklist</button>
                  )}
                </div>

                <Textarea label="Remarks" value={detailRemarks} onChange={e => setDetailRemarks(e.target.value)} />

                {/* Action Buttons - only show if user can approve this stage */}
                {(isAdmin || detailRow?.Stage === userStage) ? (
                  <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleAction('Reject')} disabled={actionSaving}>Reject</button>
                    <button className="btn btn-primary" onClick={() => handleAction('Approve & Forward')} disabled={actionSaving}>Approve &amp; Forward</button>
                  </div>
                ) : (
                  <div style={{ marginTop: 20, padding: 16, background: '#fef3c7', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                      ⏳ This request is currently at: <strong>{detailRow?.Stage}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>
                      You can only approve requests in your queue ({userStage})
                    </div>
                  </div>
                )}
              </>
            )}

            {/* History Tab */}
            {detailTab === 'history' && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, maxHeight: 400, overflowY: 'auto' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1e293b' }}>
                  📜 Stage Transition History
                </div>
                {loadingHistory ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>Loading history...</div>
                ) : stageHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#64748b', background: '#fff', borderRadius: 8 }}>
                    No history records yet. History will be recorded as stages are approved/rejected.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stageHistory.map((h, idx) => {
                      const isReactivation = h.Action === 'Reactivation';
                      const isReject = h.Action === 'Reject';
                      return (
                        <div key={h.HistoryID || idx} style={{
                          background: isReactivation ? '#dcfce7' : isReject ? '#fee2e2' : '#fff',
                          border: `1px solid ${isReactivation ? '#86efac' : isReject ? '#fca5a5' : '#e2e8f0'}`,
                          borderRadius: 8, padding: 12,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ 
                              background: isReactivation ? '#10b981' : isReject ? '#ef4444' : '#3b82f6',
                              color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4
                            }}>
                              {h.Action || 'Stage Change'}
                            </span>
                            <span style={{ fontSize: 11, color: '#64748b' }}>
                              {h.CreatedAt ? new Date(h.CreatedAt).toLocaleString('en-IN') : '—'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                              {h.PreviousStage || 'Start'}
                            </span>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>→</span>
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                              {h.NewStage}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#475569' }}>
                            <strong>By:</strong> {h.ActionBy || 'System'} ({h.ActionByRole || 'Admin'})
                          </div>
                          {h.Remarks && (
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                              💬 {h.Remarks}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CUSTOMER SUPPORT MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const TICKET_CATEGORIES = ['Vehicle/Pickup', 'Billing/Payment', 'Kit/Equipment', 'Extra Pickup', 'Training/Compliance', 'Portal/Tech', 'Other'];
const TICKET_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const ASSIGNED_OPTIONS = ['Support Team', 'Route Manager', 'Branch Manager'];

const SupportModule = ({ hcfMaster, showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column filters state
  const [columnFilters, setColumnFilters] = useState({});

  // Column filter configuration
  const columnFilterConfig = [
    { key: 'ticketCode', label: 'Ticket Code', type: 'text' },
    { key: 'hcfName', label: 'HCF Name', type: 'text' },
    { key: 'zone', label: 'Zone', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Vehicle / Pickup', 'Billing / Payment', 'Kit / Equipment', 'Extra Pickup', 'Training / Compliance', 'Portal / Tech', 'Bill Not Received', 'Other'] },
    { key: 'priority', label: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'] },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'assignedTo', label: 'Assigned To', type: 'text' },
  ];

  // Handle column filter change
  const handleColumnFilterChange = (key, value) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Apply column filters to data
  const applyColumnFilters = (dataToFilter) => {
    return dataToFilter.filter(row => {
      const dueDate = row.DueDate ? new Date(row.DueDate).toISOString().split('T')[0] : '';
      
      for (const filter of columnFilterConfig) {
        const filterValue = columnFilters[filter.key];
        if (!filterValue) continue;
        
        let cellValue = '';
        switch (filter.key) {
          case 'ticketCode': cellValue = row.TicketCode || ''; break;
          case 'hcfName': cellValue = row.HCFName || ''; break;
          case 'zone': cellValue = row.Zone || ''; break;
          case 'category': cellValue = row.Category || ''; break;
          case 'priority': cellValue = row.Priority || ''; break;
          case 'subject': cellValue = row.Subject || ''; break;
          case 'status': cellValue = row.Status || ''; break;
          case 'dueDate': cellValue = dueDate; break;
          case 'assignedTo': cellValue = row.AssignedTo || ''; break;
          default: cellValue = '';
        }
        
        if (filter.type === 'date') {
          if (filterValue && cellValue !== filterValue) return false;
        } else if (filter.type === 'select') {
          if (filterValue && cellValue !== filterValue) return false;
        } else {
          if (!cellValue.toLowerCase().includes(filterValue.toLowerCase())) return false;
        }
      }
      return true;
    });
  };

  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  const adminUser = (() => { try { return JSON.parse(localStorage.getItem('adminUser') || '{}'); } catch { return {}; } })();
  const currentAdminName = adminUser.username || adminUser.name || adminUser.email || 'Admin';

  const blankForm = {
    RegistrationID: '', HCFName: '', Zone: '', Route: '', Category: '',
    Priority: 'Medium', Subject: '', Description: '', AssignedTo: 'Support Team', DueDate: '',
  };
  const [form, setForm] = useState(blankForm);

  const blankEditForm = { Status: '', Resolution: '', AssignedTo: '' };
  const [editForm, setEditForm] = useState(blankEditForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support-tickets');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load tickets', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = applyColumnFilters(data.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || (r.Subject || '').toLowerCase().includes(q) || (r.HCFName || '').toLowerCase().includes(q);
    const matchS = !filterStatus || r.Status === filterStatus;
    const matchC = !filterCategory || r.Category === filterCategory;
    const matchP = !filterPriority || r.Priority === filterPriority;
    return matchQ && matchS && matchC && matchP;
  }));

  const kpis = [
    { label: 'Open Tickets', val: data.filter(d => d.Status === 'Open').length, color: '#2563eb' },
    { label: 'In Progress', val: data.filter(d => d.Status === 'In Progress').length, color: '#f59e0b' },
    { label: 'Resolved', val: data.filter(d => d.Status === 'Resolved').length, color: '#10b981' },
    { label: 'Critical Priority', val: data.filter(d => d.Priority === 'Critical').length, color: '#dc2626' },
    { label: 'High Priority', val: data.filter(d => d.Priority === 'High').length, color: '#ea580c' },
    { label: 'Closed', val: data.filter(d => d.Status === 'Closed').length, color: '#64748b' },
  ];

  const handleHCFSelect = (regId) => {
    const hcf = hcfMaster.find(h => String(h.RegistrationID) === String(regId));
    setForm(p => ({ ...p, RegistrationID: regId, HCFName: hcf?.InstitutionName || '', Zone: hcf?.Zone || '', Route: hcf?.Route || '' }));
  };

  const openViewModal = async (row) => {
    setViewRow(row);
    setUpdateStatus(row.Status || 'Open');
    setUpdateNote('');
    setShowViewModal(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/support-tickets/${row.TicketID}/history`);
      const json = await res.json();
      setTicketHistory(Array.isArray(json) ? json : []);
    } catch { setTicketHistory([]); }
    finally { setLoadingHistory(false); }
  };

  const handleUpdateTicket = async () => {
    if (!viewRow) return;
    setSavingUpdate(true);
    try {
      await fetch(`/api/support-tickets/${viewRow.TicketID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          assignedTo: viewRow.AssignedTo,
          updatedBy: currentAdminName,
          notes: updateNote,
        }),
      });
      showToast('Ticket updated');
      setUpdateNote('');
      // Refresh history + list
      const [hist, list] = await Promise.all([
        fetch(`/api/support-tickets/${viewRow.TicketID}/history`).then(r => r.json()),
        fetch('/api/support-tickets').then(r => r.json()),
      ]);
      setTicketHistory(Array.isArray(hist) ? hist : []);
      setData(Array.isArray(list) ? list : []);
      setViewRow(prev => ({ ...prev, Status: updateStatus }));
    } catch { showToast('Update failed', 'error'); }
    finally { setSavingUpdate(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast('Ticket created');
      setShowNewModal(false);
      setForm(blankForm);
      load();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setEditForm({ Status: row.Status || '', Resolution: row.Resolution || '', AssignedTo: row.AssignedTo || '' });
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/support-tickets/${editRow.TicketID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm),
      });
      showToast('Ticket updated');
      setShowEditModal(false);
      load();
    } catch { showToast('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ticket: ${row.Subject}?`)) return;
    try {
      await fetch(`/api/support-tickets/${row.TicketID}`, { method: 'DELETE' });
      showToast('Deleted');
      load();
    } catch { showToast('Delete failed', 'error'); }
  };

  const PRIORITY_DOT = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' };

  return (
    <div>
      <div className="page-header">
        <div><h1>🎧 Customer Support Panel</h1><p>Manage tickets, complaints &amp; service requests raised by HCF members · SLA-bound · Real-time status</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff7ed', border: '1.5px solid #fdba74', borderRadius: 9, padding: '8px 14px', textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#c2410c' }}>↗ Customer Portal</a>
          <button onClick={() => { setForm(blankForm); setShowNewModal(true); }} style={{ background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>＋ New Ticket</button>
        </div>
      </div>

      {/* KPI Strip — Left-border cards matching admin.html */}
      {(() => {
        const kpiDefs = [
          { id:'sup-kpi-open',       icon:'🔴', borderColor:'#dc2626', iconBg:'#fef2f2', val: data.filter(d=>d.Status==='Open').length,          valColor:'#dc2626', lbl:'Open Tickets' },
          { id:'sup-kpi-inprogress', icon:'⏳', borderColor:'#f59e0b', iconBg:'#fffbeb', val: data.filter(d=>d.Status==='In Progress').length,     valColor:'#d97706', lbl:'In Progress' },
          { id:'sup-kpi-resolved',   icon:'✅', borderColor:'#16a34a', iconBg:'#f0fdf4', val: data.filter(d=>d.Status==='Resolved').length,        valColor:'#16a34a', lbl:'Resolved (MTD)' },
          { id:'sup-kpi-sla',        icon:'⚡', borderColor:'#7c3aed', iconBg:'#f5f3ff', val: '—',                                                  valColor:'#7c3aed', lbl:'SLA Compliance' },
          { id:'sup-kpi-avg',        icon:'🕐', borderColor:'#0891b2', iconBg:'#ecfeff', val: '—',                                                  valColor:'#0e7490', lbl:'Avg Response' },
          { id:'sup-kpi-csat',       icon:'⭐', borderColor:'#ec4899', iconBg:'#fdf2f8', val: '—',                                                  valColor:'#be185d', lbl:'CSAT Score' },
        ];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(148px,1fr))', gap: 12, marginBottom: 20 }}>
            {kpiDefs.map(k => (
              <div key={k.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0', borderLeft: `4px solid ${k.borderColor}`, boxShadow: '0 2px 6px rgba(0,0,0,.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{k.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: k.valColor, lineHeight: 1.1 }}>{k.val}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{k.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Branch Manager Alert Banner */}
      {data.some(d => d.Priority === 'Critical' || d.Status === 'Escalated') && (
        <div style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🚨</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Branch Manager Alert Required</div>
            <div style={{ fontSize: 11, color: '#c4b5fd' }}>
              {data.filter(d => d.Priority === 'Critical').length} Critical tickets — Branch Manager must be notified
            </div>
          </div>
          <button style={{ background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            📣 Notify Branch Manager
          </button>
        </div>
      )}

      {/* Filter Bar — Compact single row */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: 160, border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <option value="">All Categories</option>
          <option value="Vehicle / Pickup">Vehicle / Pickup</option>
          <option value="Billing / Payment">Billing / Payment</option>
          <option value="Kit / Equipment">Kit / Equipment</option>
          <option value="Extra Pickup">Extra Pickup</option>
          <option value="Training / Compliance">Training</option>
          <option value="Portal / Tech">Portal / Tech</option>
          <option value="Other">Other</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', fontSize: 12, background: '#fff', cursor: 'pointer' }}>
          <option value="">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📥 Export</button>
      </div>

      <div className="table-wrap">
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Ticket Code</th><th>HCF Name</th><th>Zone</th><th>Category</th>
                <th>Priority</th><th>Subject</th><th>Status</th><th>Due Date</th><th>Assigned To</th><th>Actions</th>
              </tr>
              <tr className="filter-row">
                {columnFilterConfig.map(filter => (
                  <th key={filter.key} style={{ padding: '4px 6px' }}>
                    {filter.type === 'select' ? (
                      <select
                        value={columnFilters[filter.key] || ''}
                        onChange={(e) => handleColumnFilterChange(filter.key, e.target.value)}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4 }}
                      >
                        <option value="">All</option>
                        {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : filter.type === 'date' ? (
                      <input
                        type="date"
                        value={columnFilters[filter.key] || ''}
                        onChange={(e) => handleColumnFilterChange(filter.key, e.target.value)}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4 }}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Search...`}
                        value={columnFilters[filter.key] || ''}
                        onChange={(e) => handleColumnFilterChange(filter.key, e.target.value)}
                        style={{ width: '100%', padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 4 }}
                      />
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={10} className="no-data">No tickets found</td></tr>
                : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(row => (
                  <tr key={row.TicketID}>
                    <td style={{ fontWeight: 700, color: '#7c3aed' }}>{row.TicketCode}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.HCFName}</td>
                    <td>{row.Zone}</td>
                    <td>{row.Category}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_DOT[row.Priority] || '#94a3b8', flexShrink: 0 }} />
                        <StatusBadge value={row.Priority} />
                      </span>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.Subject}</td>
                    <td><StatusBadge value={row.Status} /></td>
                    <td>{row.DueDate ? new Date(row.DueDate).toLocaleDateString() : '—'}</td>
                    <td>{row.AssignedTo}</td>
                    <td>
                      <ActionBtn label="👁 View" color="#0ea5e9" onClick={() => openViewModal(row)} />
                      <ActionBtn label="✏️" color="#2563eb" onClick={() => handleEdit(row)} />
                      <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox(580), overflow: 'hidden', padding: 0 }}>
            <div style={{ background: 'linear-gradient(135deg,#0f172a,#0c4a6e)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, color: '#7dd3fc', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 3 }}>Customer Support · MPCC</div>
                <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>Create New Support Ticket</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)', color: '#fff', width: 34, height: 34, borderRadius: '50%', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto' }}>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="🏥 HCF / Member *">
                  <select value={form.RegistrationID} onChange={e => handleHCFSelect(e.target.value)} style={inputStyle} required>
                    <option value="">— Select Member —</option>
                    {hcfMaster.map(h => <option key={h.RegistrationID} value={h.RegistrationID}>{h.InstitutionName} ({h.RegistrationID})</option>)}
                  </select>
                </Field>
                <div style={formGrid}>
                  <Field label="📋 Category">
                    <select value={form.Category} onChange={e => setForm(p => ({ ...p, Category: e.target.value }))} style={inputStyle} required>
                      <option value="Vehicle / Pickup">Vehicle / Pickup</option>
                      <option value="Billing / Payment">Billing / Payment</option>
                      <option value="Kit / Equipment">Kit / Equipment</option>
                      <option value="Extra Pickup">Extra Pickup</option>
                      <option value="Training / Compliance">Training / Compliance</option>
                      <option value="Portal / Tech">Portal / Tech</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="⚡ Priority">
                    <select value={form.Priority} onChange={e => setForm(p => ({ ...p, Priority: e.target.value }))} style={inputStyle}>
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🟠 High</option>
                      <option value="Critical">🔴 Critical</option>
                    </select>
                  </Field>
                </div>
                <Field label="📝 Subject">
                  <input type="text" value={form.Subject} onChange={e => setForm(p => ({ ...p, Subject: e.target.value }))} placeholder="Brief description of the issue..." style={inputStyle} required />
                </Field>
                <Field label="📄 Description">
                  <textarea value={form.Description} onChange={e => setForm(p => ({ ...p, Description: e.target.value }))} rows={3} placeholder="Detailed description..." style={{ ...inputStyle, resize: 'vertical' }} required />
                </Field>
                <Field label="👤 Assigned To">
                  <select value={form.AssignedTo} onChange={e => setForm(p => ({ ...p, AssignedTo: e.target.value }))} style={inputStyle}>
                    <optgroup label="── Support Team ──">
                      <option>Arvind Sharma</option>
                      <option>Priya Negi</option>
                      <option>Rajesh Gupta</option>
                      <option>Sunil Rawat</option>
                    </optgroup>
                    <optgroup label="── Route Managers ──">
                      <option>Ravi Sharma (RM)</option>
                      <option>Ankit Verma (RM)</option>
                      <option>Deepak Negi (RM)</option>
                      <option>Sumit Rana (RM)</option>
                    </optgroup>
                    <optgroup label="── Branch Managers ──">
                      <option>Rajesh Kumar (BM)</option>
                      <option>Priya Sharma (BM)</option>
                      <option>Suresh Negi (BM)</option>
                    </optgroup>
                  </select>
                </Field>
                <Field label="📅 Due Date">
                  <input type="date" value={form.DueDate} onChange={e => setForm(p => ({ ...p, DueDate: e.target.value }))} style={inputStyle} />
                </Field>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#475569' }} onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Ticket'}</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal — with Update & History */}
      {showViewModal && viewRow && (() => {
        const STATUS_COLORS = { Open:'#2563eb', 'In Progress':'#d97706', Resolved:'#16a34a', Closed:'#64748b', Escalated:'#dc2626' };
        const sc = STATUS_COLORS[viewRow.Status] || '#2563eb';
        return (
          <div style={modalOverlay}>
            <div style={{ ...modalBox(720), maxHeight:'90vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:0 }}>
              {/* Header */}
              <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:'14px 14px 0 0', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontFamily:'monospace', fontSize:12, color:'#94a3b8', marginBottom:4 }}>{viewRow.TicketCode}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{viewRow.Subject || viewRow.Category}</div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginTop:3 }}>{viewRow.HCFName} · {viewRow.Category}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:`${sc}22`, color:sc, border:`1.5px solid ${sc}44` }}>{viewRow.Status}</span>
                  <span style={{ fontSize:11, color:'#64748b' }}>
                    {viewRow.Priority === 'Critical' || viewRow.Priority === 'High' ? '🔴' : viewRow.Priority === 'Medium' ? '🟡' : '🟢'} {viewRow.Priority}
                  </span>
                  <button onClick={() => setShowViewModal(false)} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
                </div>
              </div>

              <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
                {/* Details grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
                  {[
                    ['HCF Name', viewRow.HCFName], ['Zone / Route', `${viewRow.Zone||'—'} / ${viewRow.Route||'—'}`],
                    ['Assigned To', viewRow.AssignedTo], ['Due Date', viewRow.DueDate ? new Date(viewRow.DueDate).toLocaleDateString('en-IN') : '—'],
                    ['Created', viewRow.CreatedAt ? new Date(viewRow.CreatedAt).toLocaleDateString('en-IN') : '—'],
                    ['Last Updated', viewRow.UpdatedAt ? new Date(viewRow.UpdatedAt).toLocaleDateString('en-IN') : '—'],
                  ].map(([lbl,val]) => (
                    <div key={lbl} style={{ borderBottom:'1px solid #f1f5f9', paddingBottom:8 }}>
                      <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>{lbl}</div>
                      <div style={{ fontSize:13, color:'#1e293b', fontWeight:600, marginTop:2 }}>{val||'—'}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <div style={{ fontSize:11, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>Description</div>
                  <div style={{ fontSize:13, color:'#475569', background:'#f8fafc', borderRadius:8, padding:'10px 14px', lineHeight:1.6 }}>{viewRow.Description||'—'}</div>
                </div>

                {viewRow.Resolution && (
                  <div>
                    <div style={{ fontSize:11, color:'#15803d', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>Resolution</div>
                    <div style={{ fontSize:13, color:'#065f46', background:'#dcfce7', borderRadius:8, padding:'10px 14px' }}>{viewRow.Resolution}</div>
                  </div>
                )}

                {/* ─── Update Action Panel ─── */}
                <div style={{ background:'#f5f3ff', border:'1.5px solid #c4b5fd', borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'#5b21b6', marginBottom:12 }}>✏️ Update Ticket</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>Change Status</label>
                      <select value={updateStatus} onChange={e => setUpdateStatus(e.target.value)} style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13 }}>
                        {['Open','In Progress','Resolved','Closed','Escalated'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>Updated By</label>
                      <input value={currentAdminName} readOnly style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, background:'#f8fafc', color:'#5b21b6', fontWeight:700, boxSizing:'border-box' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>Update Notes / Remarks</label>
                    <textarea
                      value={updateNote}
                      onChange={e => setUpdateNote(e.target.value)}
                      placeholder="Add update notes, action taken, or resolution details..."
                      rows={3}
                      style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 10px', fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}
                    />
                  </div>
                  <button onClick={handleUpdateTicket} disabled={savingUpdate} style={{
                    padding:'9px 24px', background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff',
                    border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor: savingUpdate ? 'not-allowed' : 'pointer',
                    opacity: savingUpdate ? .7 : 1
                  }}>{savingUpdate ? '⏳ Saving...' : '💾 Save Update'}</button>
                </div>

                {/* ─── Update History Timeline ─── */}
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#1e293b', marginBottom:12 }}>🕐 Update History</div>
                  {loadingHistory ? (
                    <div style={{ color:'#94a3b8', fontSize:12, textAlign:'center', padding:20 }}>Loading history...</div>
                  ) : ticketHistory.length === 0 ? (
                    <div style={{ color:'#94a3b8', fontSize:12, textAlign:'center', padding:'16px', background:'#f8fafc', borderRadius:8, border:'1.5px dashed #e2e8f0' }}>No updates recorded yet</div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                      {ticketHistory.map((h, i) => {
                        const isAdmin = h.Source === 'Admin';
                        const statusChanged = h.OldStatus !== h.NewStatus;
                        return (
                          <div key={h.UpdateID} style={{ display:'flex', gap:12, paddingBottom:14 }}>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                              <div style={{ width:32, height:32, borderRadius:'50%', background: isAdmin ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : 'linear-gradient(135deg,#0891b2,#0e7490)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700 }}>
                                {isAdmin ? '👤' : '🏥'}
                              </div>
                              {i < ticketHistory.length - 1 && <div style={{ width:2, flex:1, background:'#e2e8f0', margin:'4px 0' }} />}
                            </div>
                            <div style={{ flex:1, paddingTop:4 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                                <span style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>{h.UpdatedBy}</span>
                                <span style={{ fontSize:10, color:'#94a3b8' }}>{isAdmin ? 'Admin' : 'Customer'}</span>
                                {statusChanged && (
                                  <span style={{ fontSize:10, fontWeight:700 }}>
                                    <span style={{ color:'#dc2626' }}>{h.OldStatus}</span>
                                    <span style={{ color:'#94a3b8', margin:'0 4px' }}>→</span>
                                    <span style={{ color:'#16a34a' }}>{h.NewStatus}</span>
                                  </span>
                                )}
                              </div>
                              {h.Notes && <div style={{ fontSize:12, color:'#475569', background:'#f8fafc', borderRadius:6, padding:'6px 10px', marginBottom:4 }}>{h.Notes}</div>}
                              <div style={{ fontSize:10, color:'#94a3b8' }}>{h.CreatedAt ? new Date(h.CreatedAt).toLocaleString('en-IN') : ''}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ textAlign:'right' }}>
                  <button className="btn btn-export" onClick={() => setShowViewModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Modal */}
      {showEditModal && editRow && (
        <div style={modalOverlay}>
          <div style={modalBox(500)}>
            <ModalHeader title={`Update Ticket — ${editRow.TicketCode}`} onClose={() => setShowEditModal(false)} />
            <form onSubmit={handleEditSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Select label="Status" value={editForm.Status} onChange={e => setEditForm(p => ({ ...p, Status: e.target.value }))} required options={TICKET_STATUSES} />
                <Select label="Assigned To" value={editForm.AssignedTo} onChange={e => setEditForm(p => ({ ...p, AssignedTo: e.target.value }))} options={ASSIGNED_OPTIONS} />
                <Textarea label="Resolution" value={editForm.Resolution} onChange={e => setEditForm(p => ({ ...p, Resolution: e.target.value }))} />
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-export" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMHCFMaster;
