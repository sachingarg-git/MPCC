import React, { useState, useEffect } from 'react';
import '../styles/CRMHCFMaster.css';

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
  display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11,
  fontWeight: 700, background: color.bg, color: color.text,
});

const STATUS_COLORS = {
  Active:     { bg: '#d1fae5', text: '#065f46' },
  Pending:    { bg: '#fef3c7', text: '#92400e' },
  Approved:   { bg: '#d1fae5', text: '#065f46' },
  Rejected:   { bg: '#fee2e2', text: '#991b1b' },
  Suspended:  { bg: '#fee2e2', text: '#991b1b' },
  Closed:     { bg: '#f1f5f9', text: '#475569' },
  Defaulter:  { bg: '#fee2e2', text: '#991b1b' },
  Open:       { bg: '#dbeafe', text: '#1e40af' },
  'In Progress': { bg: '#fef3c7', text: '#92400e' },
  Resolved:   { bg: '#d1fae5', text: '#065f46' },
  Critical:   { bg: '#fee2e2', text: '#991b1b' },
  High:       { bg: '#ffedd5', text: '#9a3412' },
  Medium:     { bg: '#fef9c3', text: '#713f12' },
  Low:        { bg: '#d1fae5', text: '#065f46' },
};

function StatusBadge({ value }) {
  const c = STATUS_COLORS[value] || { bg: '#f1f5f9', text: '#475569' };
  return <span style={badgeStyle(c)}>{value}</span>;
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
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Main Component ──────────────────────────────────────────────────────────

const CRMHCFMaster = () => {
  const [activeSubModule, setActiveSubModule] = useState('crm-hcf-master');
  const [toast, setToast] = useState({ msg: '', type: 'success' });

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
          fetch('/api/hcf-master').then(x => x.json()).catch(() => []),
        ]);
        setZones(Array.isArray(z) ? z : []);
        setRoutes(Array.isArray(r) ? r : []);
        setCategories(Array.isArray(c) ? c : []);
        setServicePlans(Array.isArray(sp) ? sp : []);
        setHcfMaster(Array.isArray(hcf) ? hcf : []);
      } catch { /* silent */ }
    };
    loadDropdowns();
  }, []);

  const refreshHcfMaster = async () => {
    try {
      const data = await fetch('/api/hcf-master').then(x => x.json());
      setHcfMaster(Array.isArray(data) ? data : []);
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
    const props = { zones, routes, categories, servicePlans, hcfMaster, refreshHcfMaster, showToast };
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
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <Toast toast={toast} />

      {/* Sidebar */}
      <div className="submenu-sidebar">
        <div className="submenu-header">CRM / HCF</div>
        {subMenuItems.map(item => (
          <button
            key={item.id}
            className={`submenu-item${activeSubModule === item.id ? ' active' : ''}`}
            onClick={() => setActiveSubModule(item.id)}
          >
            <span className="submenu-icon">{item.icon}</span>
            <span className="submenu-label">{item.label}</span>
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

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [show360Modal, setShow360Modal] = useState(false);
  const [view360Row, setView360Row] = useState(null);

  const blankForm = {
    InstitutionName: '', Category: '', NumberOfBeds: '', BmwRegNo: '',
    FullAddress: '', Zone: '', Route: '', Pincode: '',
    ContactPerson: '', Designation: '', Mobile: '', Email: '', AlternateMobile: '', Website: '',
    PanNumber: '', GstNumber: '', GpsLatitude: '', GpsLongitude: '',
    SelectedPlan: '', BillingCycle: 'Monthly',
  };
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hcf-master');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load HCF data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || (r.InstitutionName || '').toLowerCase().includes(q) || String(r.RegistrationID || '').includes(q);
    const matchZ = !filterZone || r.Zone === filterZone;
    const matchS = !filterStatus || r.Status === filterStatus;
    return matchQ && matchZ && matchS;
  });

  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const stats = {
    total: data.length,
    active: data.filter(r => r.Status === 'Active').length,
    pending: data.filter(r => r.Status === 'Pending').length,
    renewal: data.filter(r => r.CreatedAt && new Date(r.CreatedAt) < elevenMonthsAgo).length,
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
    <div>
      <div className="page-header">
        <div>
          <h1>HCF Master — 360° View</h1>
          <p>Complete healthcare facility overview &amp; master data management</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-export">📤 Export</button>
          <button className="btn btn-primary" onClick={() => { setForm(blankForm); setShowNewModal(true); }}>+ New HCF</button>
        </div>
      </div>

      <div className="creg-stats">
        <div className="creg-stat"><span className="creg-stat-val">{stats.total}</span><span className="creg-stat-lbl">Total HCFs</span></div>
        <div className="creg-stat creg-green"><span className="creg-stat-val">{stats.active}</span><span className="creg-stat-lbl">Active</span></div>
        <div className="creg-stat creg-yellow"><span className="creg-stat-val">{stats.pending}</span><span className="creg-stat-lbl">Pending</span></div>
        <div className="creg-stat creg-red"><span className="creg-stat-val">{stats.renewal}</span><span className="creg-stat-lbl">Renewal Due</span></div>
      </div>

      {/* Filter row */}
      <div className="filter-row" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }} />
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }}>
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.ZoneName || z} value={z.ZoneName || z}>{z.ZoneName || z}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: 160 }}>
          <option value="">All Status</option>
          {['Active', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>HCF ID</th><th>Institution Name</th><th>Category</th><th>Zone</th>
                <th>Route</th><th>Mobile</th><th>Plan</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="no-data">No records found</td></tr>
              ) : filtered.map(row => (
                <tr key={row.RegistrationID}>
                  <td>{row.RegistrationID}</td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.InstitutionName}</td>
                  <td>{row.Category}</td>
                  <td>{row.Zone}</td>
                  <td>{row.Route}</td>
                  <td>{row.Mobile}</td>
                  <td>{row.SelectedPlan}</td>
                  <td><StatusBadge value={row.Status} /></td>
                  <td>
                    <ActionBtn label="360°" color="#7c3aed" onClick={() => { setView360Row(row); setShow360Modal(true); }} />
                    <ActionBtn label="✏️" color="#2563eb" onClick={() => handleEdit(row)} />
                    <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* 360° Modal */}
      {show360Modal && view360Row && (
        <HCF360Modal row={view360Row} zones={zones} onClose={() => setShow360Modal(false)} showToast={showToast} />
      )}
    </div>
  );
};

// ─── 360° View Modal ─────────────────────────────────────────────────────────

const HCF360Modal = ({ row, onClose, showToast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lifecycleState, setLifecycleState] = useState(row.LifecycleState || 'Active');
  const [savingState, setSavingState] = useState(false);

  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docForm, setDocForm] = useState({ DocumentType: '', Version: '', ExpiryDate: '', UploadedBy: '', Remarks: '' });
  const [savingDoc, setSavingDoc] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactForm, setContactForm] = useState({ ContactName: '', Designation: '', Mobile: '', Email: '', IsPrimary: false });
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    if (activeTab === 'documents') loadDocs();
    if (activeTab === 'contacts') loadContacts();
  }, [activeTab]);

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

  const deleteDoc = async (id) => {
    if (!window.confirm('Delete document?')) return;
    try {
      await fetch(`/api/hcf-documents/${id}`, { method: 'DELETE' });
      showToast('Deleted');
      loadDocs();
    } catch { showToast('Delete failed', 'error'); }
  };

  const addContact = async (e) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      await fetch('/api/hcf-contacts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, RegistrationID: row.RegistrationID }),
      });
      showToast('Contact added');
      setContactForm({ ContactName: '', Designation: '', Mobile: '', Email: '', IsPrimary: false });
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'complaints', label: 'Complaints' },
  ];

  const overviewFields = [
    ['Registration ID', row.RegistrationID], ['Customer ID', row.CustomerID],
    ['Institution Name', row.InstitutionName], ['Category', row.Category],
    ['Zone', row.Zone], ['Route', row.Route],
    ['Mobile', row.Mobile], ['Email', row.Email],
    ['Contact Person', row.ContactPerson], ['Number of Beds', row.NumberOfBeds],
    ['Selected Plan', row.SelectedPlan], ['Total Amount', row.TotalAmount],
    ['Status', row.Status], ['Created At', row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : '—'],
    ['Registration Date', row.RegistrationDate ? new Date(row.RegistrationDate).toLocaleDateString() : '—'],
  ];

  const docTypes = ['Aadhaar', 'PAN', 'GST', 'BMW Auth', 'PCB Auth', 'Cancelled Cheque', 'Facility Photo', 'MoU Copy', 'Agreement Copy'];

  return (
    <div style={modalOverlay}>
      <div style={modalBox(900)}>
        <ModalHeader title={`360° View — ${row.InstitutionName}`} onClose={onClose} />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e2e8f0', marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '8px 16px', border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
              background: activeTab === t.id ? '#7c3aed' : 'transparent',
              color: activeTab === t.id ? '#fff' : '#64748b',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 20 }}>
              {overviewFields.map(([lbl, val]) => (
                <div key={lbl} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lbl}</div>
                  <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500, marginTop: 2 }}>{val || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Lifecycle State:</label>
              <select value={lifecycleState} onChange={e => setLifecycleState(e.target.value)} style={{ ...inputStyle, maxWidth: 220 }}>
                {['Active', 'Late Payer', 'Slow Payer', 'Disputed', 'Defaulter', 'Suspended', 'Closed'].map(s =>
                  <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn btn-primary" onClick={saveLifecycleState} disabled={savingState}>
                {savingState ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div>
            <form onSubmit={addDoc} style={{ ...formGrid, marginBottom: 20 }}>
              <Select label="Document Type" value={docForm.DocumentType}
                onChange={e => setDocForm(p => ({ ...p, DocumentType: e.target.value }))}
                required options={docTypes} />
              <Input label="Version" value={docForm.Version}
                onChange={e => setDocForm(p => ({ ...p, Version: e.target.value }))} />
              <Input label="Expiry Date" type="date" value={docForm.ExpiryDate}
                onChange={e => setDocForm(p => ({ ...p, ExpiryDate: e.target.value }))} />
              <Input label="Uploaded By" value={docForm.UploadedBy}
                onChange={e => setDocForm(p => ({ ...p, UploadedBy: e.target.value }))} />
              <div style={{ gridColumn: '1/-1' }}>
                <Textarea label="Remarks" value={docForm.Remarks}
                  onChange={e => setDocForm(p => ({ ...p, Remarks: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1', textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary" disabled={savingDoc}>{savingDoc ? 'Adding...' : 'Add Document'}</button>
              </div>
            </form>
            <div className="table-wrap">
              {loadingDocs ? <div className="no-data">Loading...</div> : (
                <table>
                  <thead><tr><th>Type</th><th>Version</th><th>Expiry</th><th>Uploaded By</th><th>Remarks</th><th>Action</th></tr></thead>
                  <tbody>
                    {docs.length === 0
                      ? <tr><td colSpan={6} className="no-data">No documents uploaded</td></tr>
                      : docs.map(d => (
                        <tr key={d.DocumentID}>
                          <td>{d.DocumentType}</td><td>{d.Version}</td>
                          <td>{d.ExpiryDate ? new Date(d.ExpiryDate).toLocaleDateString() : '—'}</td>
                          <td>{d.UploadedBy}</td><td>{d.Remarks}</td>
                          <td><ActionBtn label="🗑" color="#ef4444" onClick={() => deleteDoc(d.DocumentID)} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div>
            <form onSubmit={addContact} style={{ ...formGrid, marginBottom: 20 }}>
              <Input label="Contact Name" value={contactForm.ContactName} required
                onChange={e => setContactForm(p => ({ ...p, ContactName: e.target.value }))} />
              <Input label="Designation" value={contactForm.Designation}
                onChange={e => setContactForm(p => ({ ...p, Designation: e.target.value }))} />
              <Input label="Mobile" value={contactForm.Mobile} required
                onChange={e => setContactForm(p => ({ ...p, Mobile: e.target.value }))} />
              <Input label="Email" value={contactForm.Email} type="email"
                onChange={e => setContactForm(p => ({ ...p, Email: e.target.value }))} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1/-1' }}>
                <input type="checkbox" id="isPrimary" checked={contactForm.IsPrimary}
                  onChange={e => setContactForm(p => ({ ...p, IsPrimary: e.target.checked }))} />
                <label htmlFor="isPrimary" style={{ fontSize: 13, fontWeight: 600 }}>Primary Contact</label>
              </div>
              <div style={{ gridColumn: '1/-1', textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary" disabled={savingContact}>{savingContact ? 'Adding...' : 'Add Contact'}</button>
              </div>
            </form>
            {loadingContacts ? <div className="no-data">Loading...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
                {contacts.length === 0 ? <div className="no-data">No contacts on file</div>
                  : contacts.map(c => (
                    <div key={c.ContactID} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>
                        {c.ContactName}
                        {c.IsPrimary && <span style={{ ...badgeStyle({ bg: '#dbeafe', text: '#1e40af' }), marginLeft: 8 }}>Primary</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{c.Designation}</div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>📱 {c.Mobile}</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>✉️ {c.Email}</div>
                      <div style={{ marginTop: 10 }}>
                        <ActionBtn label="🗑 Delete" color="#ef4444" onClick={() => deleteContact(c.ContactID)} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div style={{ padding: '8px 0' }}>
            {[
              { date: row.CreatedAt, label: 'HCF Registered', desc: `Registration ID: ${row.RegistrationID}` },
              { date: row.RegistrationDate, label: 'Registration Confirmed', desc: 'Registration date recorded' },
              row.Zone && { date: row.CreatedAt, label: 'Zone Assigned', desc: `Zone: ${row.Zone}` },
              row.SelectedPlan && { date: row.CreatedAt, label: 'Service Plan Selected', desc: `Plan: ${row.SelectedPlan}` },
              { date: row.CreatedAt, label: 'Status Set', desc: `Current status: ${row.Status || 'Pending'}` },
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 12, height: 12, background: '#7c3aed', borderRadius: '50%', flexShrink: 0, marginTop: 2 }} />
                  {i < 4 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', margin: '4px 0' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Complaints */}
        {activeTab === 'complaints' && (
          <div className="no-data" style={{ padding: 40 }}>No complaints recorded</div>
        )}
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
        <div><h1>Approval Pipeline</h1><p>Review and approve new HCF registrations</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-export">📤 Export</button>
          <button className="btn btn-primary" onClick={() => { setForm(blankForm); setShowNewModal(true); }}>+ New Application</button>
        </div>
      </div>

      {/* Pipeline stage KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
        {APPROVAL_STAGES.map((stage, i) => (
          <div key={stage} style={{ background: STAGE_COLORS[i], borderRadius: 8, padding: '12px 8px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{stageCount(stage)}</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>{stage}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr><th>ID</th><th>Facility Name</th><th>Zone</th><th>Category</th><th>Current Stage</th><th>Status</th><th>Raised By</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.length === 0 ? <tr><td colSpan={9} className="no-data">No applications found</td></tr>
                : data.map(row => (
                  <tr key={row.ApprovalID}>
                    <td>{row.ApprovalID}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.FacilityName}</td>
                    <td>{row.Zone}</td><td>{row.Category}</td><td>{row.CurrentStage}</td>
                    <td><StatusBadge value={row.Status} /></td>
                    <td>{row.RaisedBy}</td>
                    <td>{row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <ActionBtn label="Review & Act" color="#7c3aed" onClick={() => { setActionRow(row); setActionForm({ action: '', remarks: '' }); setShowActionModal(true); }} />
                      <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

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

const RenewalModule = ({ hcfMaster, showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bucketTab, setBucketTab] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const blankForm = { RegistrationID: '', FacilityName: '', Zone: '', RenewalDate: '' };
  const [form, setForm] = useState(blankForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hcf-renewals');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load renewals', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const today = new Date();

  const filtered = data.filter(r => {
    if (bucketTab === 'all') return true;
    const days = daysUntil(r.RenewalDate);
    if (days === null) return false;
    if (bucketTab === '60') return days <= 60 && days > 30;
    if (bucketTab === '30') return days <= 30 && days > 15;
    if (bucketTab === '15') return days <= 15 && days > 7;
    if (bucketTab === '7')  return days <= 7;
    return true;
  });

  const stats = {
    total:   data.length,
    due30:   data.filter(r => { const d = daysUntil(r.RenewalDate); return d !== null && d <= 30 && d >= 0; }).length,
    overdue: data.filter(r => { const d = daysUntil(r.RenewalDate); return d !== null && d < 0; }).length,
    renewed: data.filter(r => r.Status === 'Renewed').length,
  };

  const handleHCFSelect = (regId) => {
    const hcf = hcfMaster.find(h => String(h.RegistrationID) === String(regId));
    setForm(p => ({ ...p, RegistrationID: regId, FacilityName: hcf?.InstitutionName || '', Zone: hcf?.Zone || '' }));
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
      load();
    } catch { showToast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleRemind = async (row) => {
    try {
      await fetch(`/api/hcf-renewals/${row.RenewalID}/remind`, { method: 'PUT' });
      showToast('Reminder sent');
      load();
    } catch { showToast('Failed to send reminder', 'error'); }
  };

  const handleRenew = async (row) => {
    if (!window.confirm(`Mark ${row.FacilityName} as Renewed?`)) return;
    try {
      await fetch(`/api/hcf-renewals/${row.RenewalID}/renew`, { method: 'PUT' });
      showToast('Marked as Renewed');
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleToggleAuto = async (row) => {
    try {
      await fetch(`/api/hcf-renewals/${row.RenewalID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AutoRenew: !row.AutoRenew }),
      });
      showToast('Auto-renew updated');
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete renewal for ${row.FacilityName}?`)) return;
    try {
      await fetch(`/api/hcf-renewals/${row.RenewalID}`, { method: 'DELETE' });
      showToast('Deleted');
      load();
    } catch { showToast('Delete failed', 'error'); }
  };

  const BUCKETS = [
    { id: 'all', label: 'All' },
    { id: '60', label: '60 Days' },
    { id: '30', label: '30 Days' },
    { id: '15', label: '15 Days' },
    { id: '7', label: '7 Days' },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Renewal Management</h1><p>Track and manage HCF renewals</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-export">📤 Export</button>
          <button className="btn btn-primary" onClick={() => { setForm(blankForm); setShowNewModal(true); }}>+ Add Renewal</button>
        </div>
      </div>

      <div className="creg-stats">
        <div className="creg-stat"><span className="creg-stat-val">{stats.total}</span><span className="creg-stat-lbl">Total Renewals</span></div>
        <div className="creg-stat creg-yellow"><span className="creg-stat-val">{stats.due30}</span><span className="creg-stat-lbl">Due in 30 Days</span></div>
        <div className="creg-stat creg-red"><span className="creg-stat-val">{stats.overdue}</span><span className="creg-stat-lbl">Overdue</span></div>
        <div className="creg-stat creg-green"><span className="creg-stat-val">{stats.renewed}</span><span className="creg-stat-lbl">Renewed</span></div>
      </div>

      {/* Bucket tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {BUCKETS.map(b => (
          <button key={b.id} onClick={() => setBucketTab(b.id)} style={{
            padding: '6px 16px', border: '1px solid #e2e8f0', borderRadius: 20, cursor: 'pointer',
            fontWeight: 600, fontSize: 12,
            background: bucketTab === b.id ? '#7c3aed' : '#fff',
            color: bucketTab === b.id ? '#fff' : '#475569',
          }}>{b.label}</button>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>HCF ID</th><th>Facility Name</th><th>Zone</th><th>Renewal Date</th>
                <th>Days Left</th><th>Auto-Renew</th><th>MoU Re-signed</th><th>Last Reminded</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={10} className="no-data">No renewal records</td></tr>
                : filtered.map(row => {
                  const days = daysUntil(row.RenewalDate);
                  const daysColor = days === null ? '#94a3b8' : days < 0 ? '#ef4444' : days <= 15 ? '#f59e0b' : '#10b981';
                  return (
                    <tr key={row.RenewalID}>
                      <td>{row.RegistrationID}</td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.FacilityName}</td>
                      <td>{row.Zone}</td>
                      <td>{row.RenewalDate ? new Date(row.RenewalDate).toLocaleDateString() : '—'}</td>
                      <td><span style={{ fontWeight: 700, color: daysColor }}>{days === null ? '—' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}</span></td>
                      <td>
                        <input type="checkbox" checked={!!row.AutoRenew} onChange={() => handleToggleAuto(row)} />
                      </td>
                      <td><StatusBadge value={row.MoUReSigned ? 'Yes' : 'No'} /></td>
                      <td>{row.LastReminded ? new Date(row.LastReminded).toLocaleDateString() : '—'}</td>
                      <td><StatusBadge value={row.Status || 'Pending'} /></td>
                      <td>
                        <ActionBtn label="🔔 Remind" color="#f59e0b" onClick={() => handleRemind(row)} />
                        <ActionBtn label="✅ Renew" color="#10b981" onClick={() => handleRenew(row)} />
                        <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
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
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DE-REGISTRATION / CLOSURE MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const DEREG_STAGES = ['Awaiting Accounts', 'Awaiting Transport', 'Awaiting HOD', 'Final Approved'];
const DEREG_STAGE_COLORS = ['#f59e0b', '#0ea5e9', '#7c3aed', '#10b981'];

const DeregisterModule = ({ hcfMaster, showToast }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);

  const blankForm = { RegistrationID: '', FacilityName: '', Zone: '', Reason: '', Outstanding: '' };
  const [form, setForm] = useState(blankForm);
  const [detailRemarks, setDetailRemarks] = useState('');
  const [checklist, setChecklist] = useState({
    LetterheadReceived: false, CertReturned: false, AgreementReturned: false,
    OutstandingCleared: false, KitReturned: false, HologramClosed: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hcf-deregistrations');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stageCount = (stage) => data.filter(d => d.Stage === stage).length;

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
        body: JSON.stringify({ action, remarks: detailRemarks }),
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

  return (
    <div>
      <div className="page-header">
        <div><h1>De-registration / Closure</h1><p>Manage HCF closure requests and deregistration process</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-export">📤 Export</button>
          <button className="btn btn-primary" onClick={() => { setForm(blankForm); setShowNewModal(true); }}>+ New Closure Request</button>
        </div>
      </div>

      {/* Stage KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {DEREG_STAGES.map((stage, i) => (
          <div key={stage} style={{ background: DEREG_STAGE_COLORS[i], borderRadius: 8, padding: 16, color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{stageCount(stage)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{stage}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr><th>Case ID</th><th>Facility Name</th><th>Zone</th><th>Request Date</th><th>Reason</th><th>Outstanding</th><th>Stage</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.length === 0 ? <tr><td colSpan={8} className="no-data">No closure requests</td></tr>
                : data.map(row => (
                  <tr key={row.DeregID}>
                    <td>{row.DeregID}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.FacilityName}</td>
                    <td>{row.Zone}</td>
                    <td>{row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : '—'}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.Reason}</td>
                    <td>₹{row.Outstanding || 0}</td>
                    <td>
                      <span style={{ ...badgeStyle({ bg: DEREG_STAGE_COLORS[stageIndex(row.Stage)] || '#e2e8f0', text: '#fff' }) }}>{row.Stage || 'Pending'}</span>
                    </td>
                    <td>
                      <ActionBtn label="📋 Details" color="#7c3aed" onClick={() => openDetail(row)} />
                      <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
          <div style={modalBox(620)}>
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

            {/* Checklist */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#1e293b' }}>Closure Checklist</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {CHECKLIST_ITEMS.map(item => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checklist[item.key]}
                      onChange={e => setChecklist(p => ({ ...p, [item.key]: e.target.checked }))} />
                    {item.label}
                  </label>
                ))}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleChecklistSave}>Save Checklist</button>
            </div>

            <Textarea label="Remarks" value={detailRemarks} onChange={e => setDetailRemarks(e.target.value)} />

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={() => handleAction('Reject')} disabled={actionSaving}>Reject</button>
              <button className="btn btn-primary" onClick={() => handleAction('Approve & Forward')} disabled={actionSaving}>Approve &amp; Forward</button>
            </div>
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

  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);

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

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || (r.Subject || '').toLowerCase().includes(q) || (r.HCFName || '').toLowerCase().includes(q);
    const matchS = !filterStatus || r.Status === filterStatus;
    const matchC = !filterCategory || r.Category === filterCategory;
    const matchP = !filterPriority || r.Priority === filterPriority;
    return matchQ && matchS && matchC && matchP;
  });

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
        <div><h1>Customer Support Tickets</h1><p>Track and resolve HCF support requests</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-export">📤 Export</button>
          <button className="btn btn-primary" onClick={() => { setForm(blankForm); setShowNewModal(true); }}>+ New Ticket</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: kpi.color }}>{kpi.val}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Search subject or HCF name..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: 160 }}>
          <option value="">All Status</option>
          {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }}>
          <option value="">All Categories</option>
          {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...inputStyle, maxWidth: 160 }}>
          <option value="">All Priority</option>
          {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Ticket Code</th><th>HCF Name</th><th>Zone</th><th>Category</th>
                <th>Priority</th><th>Subject</th><th>Status</th><th>Due Date</th><th>Assigned To</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={10} className="no-data">No tickets found</td></tr>
                : filtered.map(row => (
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
                      <ActionBtn label="👁 View" color="#0ea5e9" onClick={() => { setViewRow(row); setShowViewModal(true); }} />
                      <ActionBtn label="✏️" color="#2563eb" onClick={() => handleEdit(row)} />
                      <ActionBtn label="🗑" color="#ef4444" onClick={() => handleDelete(row)} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div style={modalOverlay}>
          <div style={modalBox(740)}>
            <ModalHeader title="New Support Ticket" onClose={() => setShowNewModal(false)} />
            <form onSubmit={handleSave}>
              <div style={formGrid}>
                <Field label="HCF / Member *">
                  <select value={form.RegistrationID} onChange={e => handleHCFSelect(e.target.value)} style={inputStyle} required>
                    <option value="">-- Select HCF --</option>
                    {hcfMaster.map(h => <option key={h.RegistrationID} value={h.RegistrationID}>{h.InstitutionName}</option>)}
                  </select>
                </Field>
                <Input label="Zone (auto-filled)" value={form.Zone} onChange={e => setForm(p => ({ ...p, Zone: e.target.value }))} />
                <Select label="Category" value={form.Category} onChange={e => setForm(p => ({ ...p, Category: e.target.value }))} required options={TICKET_CATEGORIES} />
                <Select label="Priority" value={form.Priority} onChange={e => setForm(p => ({ ...p, Priority: e.target.value }))} required options={TICKET_PRIORITIES} />
                <div style={{ gridColumn: '1/-1' }}>
                  <Input label="Subject" value={form.Subject} onChange={e => setForm(p => ({ ...p, Subject: e.target.value }))} required />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Textarea label="Description" value={form.Description} onChange={e => setForm(p => ({ ...p, Description: e.target.value }))} required />
                </div>
                <Select label="Assigned To" value={form.AssignedTo} onChange={e => setForm(p => ({ ...p, AssignedTo: e.target.value }))} options={ASSIGNED_OPTIONS} />
                <Input label="Due Date" type="date" value={form.DueDate} onChange={e => setForm(p => ({ ...p, DueDate: e.target.value }))} />
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-export" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewRow && (
        <div style={modalOverlay}>
          <div style={modalBox(600)}>
            <ModalHeader title={`Ticket — ${viewRow.TicketCode}`} onClose={() => setShowViewModal(false)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 16 }}>
              {[
                ['Ticket Code', viewRow.TicketCode], ['HCF Name', viewRow.HCFName],
                ['Zone', viewRow.Zone], ['Route', viewRow.Route],
                ['Category', viewRow.Category], ['Priority', viewRow.Priority],
                ['Status', viewRow.Status], ['Assigned To', viewRow.AssignedTo],
                ['Due Date', viewRow.DueDate ? new Date(viewRow.DueDate).toLocaleDateString() : '—'],
                ['Created', viewRow.CreatedAt ? new Date(viewRow.CreatedAt).toLocaleDateString() : '—'],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{lbl}</div>
                  <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500, marginTop: 2 }}>{val || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>SUBJECT</div>
              <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{viewRow.Subject}</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>DESCRIPTION</div>
              <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', borderRadius: 6, padding: 12 }}>{viewRow.Description}</div>
            </div>
            {viewRow.Resolution && (
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>RESOLUTION</div>
                <div style={{ fontSize: 13, color: '#065f46', background: '#d1fae5', borderRadius: 6, padding: 12 }}>{viewRow.Resolution}</div>
              </div>
            )}
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button className="btn btn-export" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
