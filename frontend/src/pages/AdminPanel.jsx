import { useState, useCallback, useEffect } from 'react'
import '../styles/AdminPanel.css'
import UserManagement from '../components/UserManagement'
import RoleManagement from '../components/RoleManagement'
import ServicePlanForm from '../components/ServicePlanForm'
import CustomerModule from './CustomerModule'
import CRMHCFMaster from './CRMHCFMaster'
import MasterDataModule from './MasterDataModule'

// ─── Dashboard Panel ──────────────────────────────────────────────────────────
function DashboardPanel() {
  const [stats, setStats] = useState({
    registrations: [], servicePlans: [], kits: [], categories: [],
    routes: [], zones: [], rawMaterials: []
  })
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/customer-registrations').then(r=>r.json()).catch(()=>({data:[]})),
      fetch('/api/serviceplans').then(r=>r.json()).catch(()=>[]),
      fetch('/api/kits').then(r=>r.json()).catch(()=>[]),
      fetch('/api/categories').then(r=>r.json()).catch(()=>[]),
      fetch('/api/routes').then(r=>r.json()).catch(()=>[]),
      fetch('/api/zones').then(r=>r.json()).catch(()=>[]),
      fetch('/api/rawmaterials').then(r=>r.json()).catch(()=>[]),
    ]).then(([regs, plans, kits, cats, routes, zones, rms]) => {
      setStats({
        registrations: regs?.data || [],
        servicePlans: Array.isArray(plans) ? plans : [],
        kits: Array.isArray(kits) ? kits : [],
        categories: Array.isArray(cats) ? cats : [],
        routes: Array.isArray(routes) ? routes : [],
        zones: Array.isArray(zones) ? zones : [],
        rawMaterials: Array.isArray(rms) ? rms : [],
      })
      setLoading(false)
    })
  }, [])

  const regs = stats.registrations
  const pending  = regs.filter(r => r.Status === 'Pending').length
  const approved = regs.filter(r => r.Status === 'Approved' || r.Status === 'Active').length
  const rejected = regs.filter(r => r.Status === 'Rejected' || r.Status === 'Inactive').length
  const todayRegs = regs.filter(r => r.CreatedAt && new Date(r.CreatedAt).toDateString() === today.toDateString()).length
  const totalRevenue = regs.reduce((sum, r) => sum + (Number(r.TotalAmount) || 0), 0)
  const activeZones = stats.zones.filter(z => z.IsActive === 1 || z.IsActive === true).length
  const activeRoutes = stats.routes.filter(r => r.IsActive === 1 || r.IsActive === true || r.Status === 'Active').length
  const activePlans = stats.servicePlans.filter(p => p.IsActive === 1 || p.IsActive === true).length
  const activeKits  = stats.kits.filter(k => k.IsActive === 1 || k.IsActive === true).length

  const card = (icon, label, value, sub, color, bg) => (
    <div key={label} style={{background:'#fff', border:`1px solid ${bg}`, borderRadius:'14px', padding:'20px 22px', display:'flex', alignItems:'flex-start', gap:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
      <div style={{width:'48px', height:'48px', borderRadius:'12px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0}}>{icon}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:'26px', fontWeight:'800', color, lineHeight:1, marginBottom:'4px'}}>{loading ? '…' : value}</div>
        <div style={{fontSize:'13px', fontWeight:'600', color:'#1e293b', marginBottom:'2px'}}>{label}</div>
        {sub && <div style={{fontSize:'11px', color:'#94a3b8'}}>{sub}</div>}
      </div>
    </div>
  )

  const recentRegs = [...regs].sort((a,b) => new Date(b.CreatedAt||0) - new Date(a.CreatedAt||0)).slice(0,6)

  return (
    <div style={{minHeight:'100%'}}>
      {/* Header */}
      <div style={{marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px'}}>
        <div>
          <h1 style={{fontSize:'26px', fontWeight:'800', color:'#1e293b', margin:'0 0 4px 0'}}>Dashboard</h1>
          <p style={{fontSize:'13px', color:'#94a3b8', margin:0}}>{dateStr}</p>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <div style={{background:'#d1fae5', border:'1px solid #a7f3d0', borderRadius:'8px', padding:'6px 14px', fontSize:'12px', fontWeight:'700', color:'#065f46', display:'flex', alignItems:'center', gap:'6px'}}>
            <span style={{width:'7px', height:'7px', borderRadius:'50%', background:'#10b981', display:'inline-block'}}></span> System Online
          </div>
        </div>
      </div>

      {/* ── Row 1: Customer Stats ── */}
      <div style={{marginBottom:'8px', fontSize:'11px', fontWeight:'800', color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.1em'}}>👥 Customer Overview</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px', marginBottom:'24px'}}>
        {card('📋', 'Total Registrations', regs.length,      `${todayRegs} registered today`,  '#1d4ed8', '#dbeafe')}
        {card('✅', 'Approved / Active',   approved,          `${Math.round(regs.length?approved/regs.length*100:0)}% approval rate`, '#065f46', '#d1fae5')}
        {card('⏳', 'Pending Review',      pending,           'Awaiting approval',               '#92400e', '#fef3c7')}
        {card('💰', 'Total Revenue',       `₹${totalRevenue.toLocaleString('en-IN')}`, `from ${regs.filter(r=>r.TotalAmount>0).length} paid registrations`, '#7c3aed', '#ede9fe')}
      </div>

      {/* ── Row 2: Master Data Stats ── */}
      <div style={{marginBottom:'8px', fontSize:'11px', fontWeight:'800', color:'#0891b2', textTransform:'uppercase', letterSpacing:'0.1em'}}>📋 Master Data Overview</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px', marginBottom:'24px'}}>
        {card('🗺️', 'Zones',          `${activeZones} / ${stats.zones.length}`,         'Active / Total',           '#0891b2', '#cffafe')}
        {card('🛣️', 'Routes',         `${activeRoutes} / ${stats.routes.length}`,        'Active / Total',           '#0369a1', '#dbeafe')}
        {card('📦', 'Service Plans',  `${activePlans} / ${stats.servicePlans.length}`,  'Active / Total',           '#7c3aed', '#ede9fe')}
        {card('🧰', 'Kits',           `${activeKits} / ${stats.kits.length}`,            'Active / Total',           '#15803d', '#dcfce7')}
      </div>

      {/* ── Row 3: CRM-HCF Stats ── */}
      <div style={{marginBottom:'8px', fontSize:'11px', fontWeight:'800', color:'#b45309', textTransform:'uppercase', letterSpacing:'0.1em'}}>🏥 CRM / HCF Overview</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'14px', marginBottom:'24px'}}>
        {card('🏷️', 'Categories',    stats.categories.length,  'HCF facility categories',  '#b45309', '#fef3c7')}
        {card('🧪', 'Raw Materials', stats.rawMaterials.length,'In materials master',       '#0f766e', '#ccfbf1')}
        {card('🏢', 'HCF Registered', regs.length,             'Across all zones',          '#1d4ed8', '#dbeafe')}
        {card('📅', 'This Month',    regs.filter(r => r.CreatedAt && new Date(r.CreatedAt).getMonth()===today.getMonth() && new Date(r.CreatedAt).getFullYear()===today.getFullYear()).length, 'New registrations', '#7c3aed', '#ede9fe')}
      </div>

      {/* ── Bottom Row: Recent + Status breakdown ── */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>

        {/* Recent Registrations */}
        <div style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:'14px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontSize:'14px', fontWeight:'700', color:'#1e293b'}}>🕒 Recent Registrations</div>
            <span style={{fontSize:'11px', color:'#94a3b8', fontWeight:'600'}}>{regs.length} total</span>
          </div>
          <div style={{padding:'8px 0'}}>
            {loading ? (
              <div style={{textAlign:'center', padding:'30px', color:'#94a3b8', fontSize:'13px'}}>Loading…</div>
            ) : recentRegs.length === 0 ? (
              <div style={{textAlign:'center', padding:'30px', color:'#94a3b8', fontSize:'13px'}}>No registrations yet</div>
            ) : recentRegs.map((r, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px 20px', borderBottom: i < recentRegs.length-1 ? '1px solid #f8fafc' : 'none'}}>
                <div style={{width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#dbeafe,#ede9fe)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0}}>🏥</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:'13px', fontWeight:'700', color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.InstitutionName || 'N/A'}</div>
                  <div style={{fontSize:'11px', color:'#94a3b8'}}>{r.CustomerID || r.RegistrationCode} · {r.Zone || '—'}</div>
                </div>
                <span style={{fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'20px', flexShrink:0,
                  background: r.Status==='Approved'||r.Status==='Active' ? '#d1fae5' : r.Status==='Pending' ? '#fef3c7' : '#fee2e2',
                  color:       r.Status==='Approved'||r.Status==='Active' ? '#065f46' : r.Status==='Pending' ? '#92400e' : '#7f1d1d'
                }}>{r.Status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown + Quick Links */}
        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          {/* Status Donut-style breakdown */}
          <div style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'14px', fontWeight:'700', color:'#1e293b', marginBottom:'14px'}}>📊 Registration Status</div>
            {[['Approved / Active', approved, '#10b981', '#d1fae5'], ['Pending', pending, '#f59e0b', '#fef3c7'], ['Rejected / Inactive', rejected, '#ef4444', '#fee2e2']].map(([label, val, color, bg]) => {
              const pct = regs.length ? Math.round(val / regs.length * 100) : 0
              return (
                <div key={label} style={{marginBottom:'10px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'600', color:'#475569', marginBottom:'5px'}}>
                    <span>{label}</span><span style={{color}}>{val} ({pct}%)</span>
                  </div>
                  <div style={{height:'8px', background:'#f1f5f9', borderRadius:'4px', overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${pct}%`, background:color, borderRadius:'4px', transition:'width 0.6s ease'}}></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Links */}
          <div style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:'14px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:'14px', fontWeight:'700', color:'#1e293b', marginBottom:'14px'}}>⚡ Quick Summary</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {[
                ['🗺️', 'Zones',     stats.zones.length,         '#cffafe', '#0891b2'],
                ['🛣️', 'Routes',    stats.routes.length,        '#dbeafe', '#1d4ed8'],
                ['📦', 'Plans',     stats.servicePlans.length,  '#ede9fe', '#7c3aed'],
                ['🧰', 'Kits',      stats.kits.length,          '#dcfce7', '#15803d'],
                ['🏷️', 'Categories',stats.categories.length,   '#fef3c7', '#b45309'],
                ['🧪', 'Materials', stats.rawMaterials.length,  '#ccfbf1', '#0f766e'],
              ].map(([ic, lbl, val, bg, col]) => (
                <div key={lbl} style={{background:bg, borderRadius:'10px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{fontSize:'18px'}}>{ic}</span>
                  <div>
                    <div style={{fontSize:'16px', fontWeight:'800', color:col, lineHeight:1}}>{val}</div>
                    <div style={{fontSize:'11px', color:'#475569', fontWeight:'500'}}>{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

// Separate Form Components to prevent focus loss
const RouteFormComponent = ({ formData, handleInputChange, getAutoCode }) => (
  <div style={{ padding: '20px' }}>
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Route Information</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route Code</label>
          <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route Type <span style={{ color: '#dc2626' }}>*</span></label>
          <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
            <option value="">Select Type</option>
            <option value="Daily">Daily</option>
            <option value="City">City</option>
            <option value="Weekly">Weekly</option>
            <option value="On-Demand">On-Demand</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route Name <span style={{ color: '#dc2626' }}>*</span></label>
        <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Haridwar North Route" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Primary Driver</label>
          <input type="text" name="primaryDriver" value={formData.primaryDriver || ''} onChange={handleInputChange} placeholder="Driver name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Secondary Driver</label>
          <input type="text" name="secondaryDriver" value={formData.secondaryDriver || ''} onChange={handleInputChange} placeholder="Driver name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>
    </div>
    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Status</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
        <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} />
        <span>Active</span>
      </label>
    </div>
  </div>
)

const PaymentFreqFormComponent = ({ formData, handleInputChange }) => (
  <div style={{ padding: '20px' }}>
    <div style={{ background: '#cffafe', border: '1px solid #06b6d4', borderRadius: '6px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#0891b2' }}>
      ℹ️ Discount Amount and Discount Percentage are mutually exclusive — fill only one.
    </div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Frequency Details</div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Frequency Name <span style={{ color: '#dc2626' }}>*</span></label>
        <input type="text" name="frequencyName" value={formData.frequencyName || ''} onChange={handleInputChange} placeholder="e.g. Annual Plan" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Frequency (Months) <span style={{ color: '#dc2626' }}>*</span></label>
        <input type="number" name="months" value={formData.months || ''} onChange={handleInputChange} placeholder="e.g. 12" min="1" max="60" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Discount Amount (₹)</label>
          <input type="number" name="discountAmt" value={formData.discountAmt || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Discount Percentage (%)</label>
          <input type="number" name="discountPct" value={formData.discountPct || ''} onChange={handleInputChange} placeholder="0.00" min="0" max="100" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Description</label>
        <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Optional notes about this frequency..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
      </div>
    </div>
    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Status</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
        <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} />
        <span>Active</span>
      </label>
    </div>
  </div>
)

// ✨ Note: The remaining form components (ServicePlanForm, KitForm, WasteCategoryForm, VehicleForm, VendorForm, RawMaterialsForm)
// are still defined as inline functions within AdminPanel to avoid breaking the current structure.
// They can be refactored to separate components similarly if needed for better performance.

export default function AdminPanel({ user, onLogout }) {
  // Main navigation state
  const [activeMainNav, setActiveMainNav] = useState('dashboard')
  const [expandedMainNav, setExpandedMainNav] = useState('masterdata')

  // Master Data subsection state
  const [activeSection, setActiveSection] = useState('routes')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [kitItems, setKitItems] = useState([{ id: 1, item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }])

  // Data state
  const [routes, setRoutes] = useState([])
  const [servicePlans, setServicePlans] = useState([])
  const [paymentFreqs, setPaymentFreqs] = useState([])
  const [kits, setKits] = useState([])
  const [wasteCategories, setWasteCategories] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vendors, setVendors] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])

  // UI State for messages
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Fetch data from API based on active section
  const fetchData = async () => {
    try {
      setLoading(true)
      const endpoint = `/api/${activeSection}`
      const response = await fetch(`${endpoint}`)
      if (!response.ok) throw new Error(`Failed to fetch ${activeSection}`)
      const data = await response.json()

      switch (activeSection) {
        case 'routes':
          setRoutes(data)
          break
        case 'serviceplans':
          setServicePlans(data)
          break
        case 'paymentfreqs':
          setPaymentFreqs(data)
          break
        case 'kits':
          setKits(data)
          break
        case 'wastecategories':
          setWasteCategories(data)
          break
        case 'vehicles':
          setVehicles(data)
          break
        case 'vendors':
          setVendors(data)
          break
        case 'rawmaterials':
          setRawMaterials(data)
          break
        default:
          break
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setMessage({ type: 'error', text: `Error loading data: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Load data when section changes
  useEffect(() => {
    fetchData()
  }, [activeSection])

  const getAutoCode = () => {
    const codes = {
      routes: `RTE-${String(routes.length + 1).padStart(3, '0')}`,
      serviceplans: `PLAN-${String(servicePlans.length + 1).padStart(3, '0')}`,
      kits: `KIT-${String(kits.length + 1).padStart(3, '0')}`,
      wastecategories: `WC-${String(wasteCategories.length + 1).padStart(3, '0')}`,
      vehicles: `VEH-${String(vehicles.length + 1).padStart(3, '0')}`,
      vendors: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      rawmaterials: `ITM-${String(rawMaterials.length + 1).padStart(3, '0')}`
    }
    return codes[activeSection] || 'AUTO'
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      let body = {}
      let endpoint = `/api/${activeSection}`
      let method = 'POST'

      // Build request body based on section
      if (activeSection === 'routes') {
        body = {
          routeCode: formData.code || getAutoCode(),
          routeName: formData.name,
          routeType: formData.type,
          primaryDriver: formData.primaryDriver,
          secondaryDriver: formData.secondaryDriver
        }
        if (editingId) {
          endpoint = `/api/routes/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'serviceplans') {
        body = {
          planCode: formData.code || getAutoCode(),
          name: formData.name,
          category: formData.category,
          subCategory: formData.subCategory,
          zone: formData.zone,
          route: formData.route,
          description: formData.description,
          pricingType: formData.pricingType,
          monthlyCharges: parseFloat(formData.monthlyCharges) || 0,
          registrationCharges: parseFloat(formData.registrationCharges) || 0,
          consultingFees: parseFloat(formData.consultingFees) || 0
        }
        if (editingId) {
          endpoint = `/api/serviceplans/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'paymentfreqs') {
        body = {
          frequencyCode: formData.code || getAutoCode(),
          frequencyName: formData.frequencyName,
          months: parseInt(formData.months),
          discountAmt: parseFloat(formData.discountAmt) || 0,
          discountPct: parseFloat(formData.discountPct) || 0,
          description: formData.description
        }
        if (editingId) {
          endpoint = `/api/paymentfreqs/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'kits') {
        body = {
          kitCode: formData.code || getAutoCode(),
          name: formData.name,
          type: formData.type,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          costPrice: parseFloat(formData.costPrice) || 0,
          description: formData.description,
          items: kitItems
        }
        if (editingId) {
          endpoint = `/api/kits/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'wastecategories') {
        body = {
          categoryCode: formData.code || getAutoCode(),
          name: formData.name,
          bagColor: formData.bagColor,
          colorCode: formData.colorCode,
          bmwSchedule: formData.bmwSchedule,
          hazardLevel: formData.hazardLevel,
          maxStorageDays: parseInt(formData.maxStorageDays) || 0,
          unitOfMeasurement: formData.unitOfMeasurement,
          description: formData.description,
          handlingInstructions: formData.handlingInstructions,
          storageRequirements: formData.storageRequirements,
          treatmentMethod: formData.treatmentMethod,
          disposalMethod: formData.disposalMethod,
          requiresAutoclave: formData.requiresAutoclave || false,
          requiresIncineration: formData.requiresIncineration || false,
          trackingRequired: formData.trackingRequired || false
        }
        if (editingId) {
          endpoint = `/api/wastecategories/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'vehicles') {
        body = {
          vehicleCode: formData.code || getAutoCode(),
          vehicleName: formData.name,
          category: formData.category,
          registrationNo: formData.registrationNo,
          manufacturer: formData.manufacturer,
          yearOfMfg: parseInt(formData.yearOfMfg) || new Date().getFullYear(),
          fuelType: formData.fuelType
        }
        if (editingId) {
          endpoint = `/api/vehicles/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'vendors') {
        body = {
          vendorCode: formData.code || getAutoCode(),
          name: formData.name,
          type: formData.type,
          contactPerson: formData.contactPerson,
          mobile: formData.mobile,
          email: formData.email,
          website: formData.website,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
        if (editingId) {
          endpoint = `/api/vendors/${editingId}`
          method = 'PUT'
        }
      } else if (activeSection === 'rawmaterials') {
        body = {
          materialCode: formData.code || getAutoCode(),
          materialName: formData.name,
          type: formData.type,
          hsn: formData.hsn,
          description: formData.description,
          unitOfMeasurement: formData.unitOfMeasurement
        }
        if (editingId) {
          endpoint = `/api/rawmaterials/${editingId}`
          method = 'PUT'
        }
      }

      // Make API call
      const response = await fetch(`${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      // Success message
      setMessage({
        type: 'success',
        text: editingId ? 'Record updated successfully!' : 'Record created successfully!'
      })

      // Reset form and reload data
      setShowModal(false)
      setFormData({})
      setEditingId(null)
      setKitItems([{ id: 1, item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }])
      fetchData()

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = () => {
    setEditingId(null)
    setFormData({})
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  const handleEdit = (item) => {
    setEditingId(item.id || item.RouteID || item.PlanID || item.FrequencyID || item.KitID || item.CategoryID || item.VehicleID || item.VendorID || item.MaterialID)
    setFormData(item)
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeSection.slice(0, -1)}?`)) {
      return
    }

    try {
      setLoading(true)
      const itemId = item.id || item.RouteID || item.PlanID || item.FrequencyID || item.KitID || item.CategoryID || item.VehicleID || item.VendorID || item.MaterialID
      let endpoint = ''

      switch (activeSection) {
        case 'routes':
          endpoint = `/api/routes/${itemId}`
          break
        case 'serviceplans':
          endpoint = `/api/serviceplans/${itemId}`
          break
        case 'paymentfreqs':
          endpoint = `/api/paymentfreqs/${itemId}`
          break
        case 'kits':
          endpoint = `/api/kits/${itemId}`
          break
        case 'wastecategories':
          endpoint = `/api/wastecategories/${itemId}`
          break
        case 'vehicles':
          endpoint = `/api/vehicles/${itemId}`
          break
        case 'vendors':
          endpoint = `/api/vendors/${itemId}`
          break
        case 'rawmaterials':
          endpoint = `/api/rawmaterials/${itemId}`
          break
        default:
          return
      }

      const response = await fetch(`${endpoint}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }

      setMessage({ type: 'success', text: 'Record deleted successfully!' })
      fetchData()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Delete error:', err)
      setMessage({ type: 'error', text: `Error: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({})
    setEditingId(null)
    setKitItems([{ id: 1, item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }])
  }



  // KIT MASTER FORM
  const KitForm = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Kit Information</div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Kit Name <span style={{ color: '#dc2626' }}>*</span></label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Hospital Standard Kit" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Kit Type <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Type</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Big">Big</option>
              <option value="Hospital">Hospital</option>
              <option value="Clinic">Clinic</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Selling Price (₹)</label>
            <input type="number" name="sellingPrice" value={formData.sellingPrice || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Cost Price (₹)</label>
            <input type="number" name="costPrice" value={formData.costPrice || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Status</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer', marginTop: '8px' }}>
              <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} />
              <span>Active</span>
            </label>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Description / Best For</label>
          <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Who is this kit best suited for?" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Kit Items</div>
          <button onClick={() => setKitItems([...kitItems, { id: Date.now(), item: '', hsn: '', qty: 1, unit: 'Pcs', rate: 0 }])} style={{ padding: '6px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add Item</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Item Name</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>HSN/SAC</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>QTY</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Unit</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Rate (₹)</th>
              <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Amount</th>
              <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {kitItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px' }}><input type="text" placeholder="Item name" style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} /></td>
                <td style={{ padding: '8px' }}><input type="text" placeholder="HSN" style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} /></td>
                <td style={{ padding: '8px' }}><input type="number" placeholder="1" min="1" style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} /></td>
                <td style={{ padding: '8px' }}><select style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }}><option>Pcs</option><option>Box</option><option>Kg</option><option>Litre</option></select></td>
                <td style={{ padding: '8px' }}><input type="number" placeholder="0" min="0" style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} /></td>
                <td style={{ padding: '8px', fontWeight: '600' }}>₹0.00</td>
                <td style={{ padding: '8px', textAlign: 'center' }}><button onClick={() => setKitItems(kitItems.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px' }}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}><span>Sub Total</span><span style={{ fontWeight: '600' }}>₹0.00</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}><span>CGST 9%</span><span style={{ fontWeight: '600' }}>₹0.00</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}><span>SGST 9%</span><span style={{ fontWeight: '600' }}>₹0.00</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}><span>Grand Total</span><span>₹0.00</span></div>
        </div>
      </div>
    </div>
  )

  // WASTE CATEGORY FORM
  const WasteCategoryForm = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Basic Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Category Code <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" value={getAutoCode()} readOnly placeholder="e.g. WC-001" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Category Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Yellow Bag Waste" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Bag Color</label>
            <input type="text" name="bagColor" value={formData.bagColor || ''} onChange={handleInputChange} placeholder="e.g. Yellow" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Color Code</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" name="colorCode" value={formData.colorCode || '#FFD700'} onChange={handleInputChange} style={{ width: '44px', height: '36px', padding: '2px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
              <input type="text" name="colorHex" value={formData.colorHex || '#FFD700'} onChange={handleInputChange} placeholder="#FFD700" style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>BMW Rules Schedule</label>
            <select name="bmwSchedule" value={formData.bmwSchedule || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Schedule</option>
              <option value="Schedule I">Schedule I</option>
              <option value="Schedule II">Schedule II</option>
              <option value="Schedule III">Schedule III</option>
              <option value="Schedule IV">Schedule IV</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Hazard Level</label>
            <select name="hazardLevel" value={formData.hazardLevel || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Max Storage Days</label>
            <input type="number" name="maxStorageDays" value={formData.maxStorageDays || ''} onChange={handleInputChange} placeholder="e.g. 48" min="1" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Unit of Measurement</label>
            <select name="unitOfMeasurement" value={formData.unitOfMeasurement || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Unit</option>
              <option value="Kg">Kg</option>
              <option value="Litre">Litre</option>
              <option value="Pcs">Pcs</option>
              <option value="Bags">Bags</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Handling & Disposal</div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Describe this waste category..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Handling Instructions</label>
          <textarea name="handlingInstructions" value={formData.handlingInstructions || ''} onChange={handleInputChange} placeholder="How should this waste be handled?" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Storage Requirements</label>
          <textarea name="storageRequirements" value={formData.storageRequirements || ''} onChange={handleInputChange} placeholder="Storage conditions..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Treatment Method</label>
            <input type="text" name="treatmentMethod" value={formData.treatmentMethod || ''} onChange={handleInputChange} placeholder="e.g. Autoclaving" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Disposal Method</label>
            <input type="text" name="disposalMethod" value={formData.disposalMethod || ''} onChange={handleInputChange} placeholder="e.g. Incineration" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Compliance & Status</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="requiresAutoclave" checked={formData.requiresAutoclave || false} onChange={handleInputChange} />
            Requires Autoclave
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="requiresIncineration" checked={formData.requiresIncineration || false} onChange={handleInputChange} />
            Requires Incineration
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="trackingRequired" checked={formData.trackingRequired || false} onChange={handleInputChange} />
            Tracking Required
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="isActive" checked={formData.isActive === true} onChange={handleInputChange} defaultChecked />
            Active
          </label>
        </div>
      </div>
    </div>
  )

  // VENDOR MASTER FORM
  const VendorForm = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Basic Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vendor Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vendor Type <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Type</option>
              <option value="Material Supplier">Material Supplier</option>
              <option value="Service Vendor">Service Vendor</option>
              <option value="Transporter">Transporter</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vendor Name <span style={{ color: '#dc2626' }}>*</span></label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Full vendor / company name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Contact Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Contact Person</label>
            <input type="text" name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} placeholder="Name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Mobile</label>
            <input type="text" name="mobile" value={formData.mobile || ''} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Email</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="email@vendor.com" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Website</label>
            <input type="url" name="website" value={formData.website || ''} onChange={handleInputChange} placeholder="https://..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Address</div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Address Line 1</label>
          <input type="text" name="addressLine1" value={formData.addressLine1 || ''} onChange={handleInputChange} placeholder="Street, Building, Area" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Address Line 2</label>
          <input type="text" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleInputChange} placeholder="Landmark (optional)" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>City</label>
            <input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} placeholder="City" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>State</label>
            <select name="state" value={formData.state || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select State</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Delhi">Delhi</option>
              <option value="Haryana">Haryana</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Pincode</label>
          <input type="text" name="pincode" value={formData.pincode || ''} onChange={handleInputChange} placeholder="XXXXXX" maxLength="6" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Tax & Registration</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>GST Number</label>
            <input type="text" name="gstNumber" value={formData.gstNumber || ''} onChange={handleInputChange} placeholder="GSTIN" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>PAN Number</label>
            <input type="text" name="panNumber" value={formData.panNumber || ''} onChange={handleInputChange} placeholder="PAN" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>TAN Number</label>
            <input type="text" name="tanNumber" value={formData.tanNumber || ''} onChange={handleInputChange} placeholder="TAN" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Registration Cert. No.</label>
            <input type="text" name="registrationCertNo" value={formData.registrationCertNo || ''} onChange={handleInputChange} placeholder="Reg. No." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Banking Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Bank Name</label>
            <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} placeholder="e.g. SBI" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Account Number</label>
            <input type="text" name="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} placeholder="A/C No." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>IFSC Code</label>
            <input type="text" name="ifscCode" value={formData.ifscCode || ''} onChange={handleInputChange} placeholder="IFSC" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Branch Name</label>
            <input type="text" name="branchName" value={formData.branchName || ''} onChange={handleInputChange} placeholder="Branch" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Payment Terms</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Payment Terms</label>
            <select name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Terms</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 60">Net 60</option>
              <option value="Advance">Advance</option>
              <option value="Immediate">Immediate</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Credit Period (Days)</label>
            <input type="number" name="creditPeriod" value={formData.creditPeriod || ''} onChange={handleInputChange} placeholder="30" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Credit Limit (₹)</label>
          <input type="number" name="creditLimit" value={formData.creditLimit || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Status</div>
        <select name="status" value={formData.status || 'Active'} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Blacklisted">Blacklisted</option>
        </select>
      </div>
    </div>
  )

  // RAW MATERIALS FORM
  const RawMaterialsForm = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Basic Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Item Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Item Type <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="type" value={formData.type || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Type</option>
              <option value="Polybag">Polybag</option>
              <option value="Container">Container</option>
              <option value="Bin">Bin</option>
              <option value="Chemical">Chemical</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Item Name <span style={{ color: '#dc2626' }}>*</span></label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Yellow Polybag 30L" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Brief description..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Brand</label>
            <input type="text" name="brand" value={formData.brand || ''} onChange={handleInputChange} placeholder="Brand name" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Manufacturer</label>
            <input type="text" name="manufacturer" value={formData.manufacturer || ''} onChange={handleInputChange} placeholder="Manufacturer" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>HSN Code</label>
          <input type="text" name="hsn" value={formData.hsn || ''} onChange={handleInputChange} placeholder="HSN / SAC Code" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Inventory Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Unit of Measurement <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="unitOfMeasurement" value={formData.unitOfMeasurement || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Unit</option>
              <option value="Pcs">Pcs</option>
              <option value="Box">Box</option>
              <option value="Kg">Kg</option>
              <option value="Litre">Litre</option>
              <option value="Roll">Roll</option>
              <option value="Bundle">Bundle</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Current Stock</label>
            <input type="number" name="currentStock" value={formData.currentStock || ''} onChange={handleInputChange} placeholder="0" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Reorder Level</label>
            <input type="number" name="reorderLevel" value={formData.reorderLevel || ''} onChange={handleInputChange} placeholder="50" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Min Order Qty</label>
            <input type="number" name="minOrderQty" value={formData.minOrderQty || ''} onChange={handleInputChange} placeholder="10" min="1" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Max Stock Level</label>
            <input type="number" name="maxStockLevel" value={formData.maxStockLevel || ''} onChange={handleInputChange} placeholder="500" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Storage Location</label>
            <select name="storageLocation" value={formData.storageLocation || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Location</option>
              <option value="Warehouse A">Warehouse A</option>
              <option value="Warehouse B">Warehouse B</option>
              <option value="Storeroom 1">Storeroom 1</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Pricing & Vendor</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Purchase Cost (₹)</label>
            <input type="number" name="purchaseCost" value={formData.purchaseCost || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Selling Price (₹)</label>
            <input type="number" name="sellingPrice" value={formData.sellingPrice || ''} onChange={handleInputChange} placeholder="0.00" min="0" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Preferred Vendor</label>
          <select name="preferredVendor" value={formData.preferredVendor || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
            <option value="">Select Vendor</option>
            <option value="MedSupply India">MedSupply India</option>
            <option value="BioWaste Supplies Co.">BioWaste Supplies Co.</option>
            <option value="Green Pack Ltd.">Green Pack Ltd.</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Status & Flags</div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Status</label>
          <select name="status" value={formData.status || 'Active'} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="isPerishable" checked={formData.isPerishable || false} onChange={handleInputChange} />
            Perishable
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="isHazardous" checked={formData.isHazardous || false} onChange={handleInputChange} />
            Hazardous
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="isDiscontinued" checked={formData.isDiscontinued || false} onChange={handleInputChange} />
            Discontinued
          </label>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Notes</label>
          <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="Any special notes..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
        </div>
      </div>
    </div>
  )

  // VEHICLE MASTER FORM
  const VehicleForm = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Basic Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Category <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="category" value={formData.category || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select</option>
              <option value="Mini Truck">Mini Truck</option>
              <option value="Tempo">Tempo</option>
              <option value="Van">Van</option>
              <option value="Three-Wheeler">Three-Wheeler</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Name / Make <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Tata Ace" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Model</label>
            <input type="text" name="model" value={formData.model || ''} onChange={handleInputChange} placeholder="e.g. Gold 2023" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Registration Number <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="registrationNo" value={formData.registrationNo || ''} onChange={handleInputChange} placeholder="e.g. UK07AB1234" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Chassis Number</label>
            <input type="text" name="chassisNo" value={formData.chassisNo || ''} onChange={handleInputChange} placeholder="Chassis No." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Fuel Type <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="fuelType" value={formData.fuelType || ''} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="">Select Fuel Type</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="LPG">LPG</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Vehicle Status</label>
            <select name="vehicleStatus" value={formData.vehicleStatus || 'Active'} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Options</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="gpsEnabled" checked={formData.gpsEnabled || false} onChange={handleInputChange} />
            GPS Enabled
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input type="checkbox" name="isActiveVehicle" checked={formData.isActiveVehicle !== false} onChange={handleInputChange} defaultChecked />
            Active Vehicle
          </label>
        </div>
      </div>
    </div>
  )

  // Transform API response to display format
  const transformDataForDisplay = (data) => {
    if (!Array.isArray(data)) return []

    return data.map(item => {
      const transformed = {
        id: item.id || item.RouteID || item.PlanID || item.FrequencyID || item.KitID || item.CategoryID || item.VehicleID || item.VendorID || item.MaterialID,
        code: item.code || item.RouteCode || item.PlanCode || item.FrequencyCode || item.KitCode || item.CategoryCode || item.VehicleCode || item.VendorCode || item.MaterialCode,
        name: item.name || item.RouteName || item.PlanName || item.FrequencyName || item.KitName || item.VehicleName || item.MaterialName,
        type: item.type || item.RouteType || item.VehicleCategory,
        category: item.category || item.VehicleCategory,
        hazardLevel: item.hazardLevel || item.HazardLevel,
        status: item.status || (item.IsActive || item.isActive ? 'Active' : 'Inactive'),
        isActive: item.IsActive !== undefined ? item.IsActive : (item.isActive !== undefined ? item.isActive : true),
        // Preserve original data
        ...item
      }
      return transformed
    })
  }

  // Get the current data for the active section
  const getCurrentData = () => {
    const dataMap = {
      routes: transformDataForDisplay(routes),
      serviceplans: transformDataForDisplay(servicePlans),
      paymentfreqs: transformDataForDisplay(paymentFreqs),
      kits: transformDataForDisplay(kits),
      wastecategories: transformDataForDisplay(wasteCategories),
      vehicles: transformDataForDisplay(vehicles),
      vendors: transformDataForDisplay(vendors),
      rawmaterials: transformDataForDisplay(rawMaterials)
    }
    return dataMap[activeSection] || []
  }

  const currentData = getCurrentData()

  // Main navigation items
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'masterdata', label: 'Master Data', icon: '📋' },
    { id: 'customer', label: 'Customer', icon: '👥' },
    { id: 'crmhcf', label: 'CRM-HCF', icon: '💼' },
    { id: 'gpsdata', label: 'GPS Data', icon: '📍' },
    { id: 'liaison', label: 'Liaison', icon: '🤝' },
    { id: 'paysched', label: 'Pay Sched', icon: '📅' },
    { id: 'procurement', label: 'Procurement', icon: '🛒' },
    { id: 'collection', label: 'Collection', icon: '🎁' },
    { id: 'fleetmgmt', label: 'Fleet Mgmt', icon: '🚚' },
    { id: 'plantops', label: 'Plant Ops', icon: '🏭' },
    { id: 'billing', label: 'Billing', icon: '💰' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'accounts', label: 'Accounts', icon: '💳' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'hrhrm', label: 'HR/HRM', icon: '👔' },
    { id: 'usermgmt', label: 'User Mgmt', icon: '🔐' },
    { id: 'rolemgmt', label: 'Role Mgmt', icon: '🛡️' }
  ]


  const sw = sidebarCollapsed ? '64px' : '210px'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: sw, minWidth: sw, background: '#fff',
        borderRight: '1px solid #e2e8f0',
        paddingTop: '0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        overflowY: 'auto', overflowX: 'hidden',
        maxHeight: '100vh', flexShrink: 0,
        transition: 'width 0.25s ease, min-width 0.25s ease',
        display: 'flex', flexDirection: 'column'
      }}>

        {/* Top bar: logo + toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? '16px 0' : '16px 14px 16px 18px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0
        }}>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0', letterSpacing: '-0.3px' }}>MPCC</h2>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>Waste Management</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(p => !p)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '8px',
              width: '34px', height: '34px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: '#475569', flexShrink: 0,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            {sidebarCollapsed ? '▶' : '☰'}
          </button>
        </div>

        {/* Main Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '10px 8px', flex: 1 }}>
          {mainNavItems.map(item => {
            const isActive = activeMainNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMainNav(item.id); setShowModal(false) }}
                title={sidebarCollapsed ? item.label : ''}
                style={{
                  width: '100%',
                  padding: sidebarCollapsed ? '10px 0' : '10px 12px',
                  background: isActive ? '#ede9fe' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#5b21b6' : '#1e293b',
                  cursor: 'pointer',
                  textAlign: sidebarCollapsed ? 'center' : 'left',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px 16px', flexShrink: 0 }}>
          <button
            onClick={onLogout}
            title={sidebarCollapsed ? 'Logout' : ''}
            style={{
              width: '100%',
              padding: sidebarCollapsed ? '10px 0' : '10px 12px',
              background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px',
              fontSize: '13px', fontWeight: '700', color: '#dc2626',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', minWidth: 0 }}>
        {/* User Management Section */}
        {activeMainNav === 'usermgmt' ? (
          <UserManagement />
        ) : activeMainNav === 'rolemgmt' ? (
          <RoleManagement />
        ) : activeMainNav === 'masterdata' ? (
          <MasterDataModule />
        ) : activeMainNav === 'customer' ? (
          <CustomerModule />
        ) : activeMainNav === 'crmhcf' ? (
          <CRMHCFMaster />
        ) : activeMainNav === 'dashboard' ? (
          <DashboardPanel />
        ) : (
          /* Other Main Navigation Sections - Coming Soon */
          <div style={{ background: '#fff', borderRadius: '8px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {mainNavItems.find(item => item.id === activeMainNav)?.icon}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' }}>
              {mainNavItems.find(item => item.id === activeMainNav)?.label}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              This section is coming soon. We're building comprehensive management tools for this module.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0' }}>
                {activeSection === 'routes' && 'Route Master'}
                {activeSection === 'serviceplans' && 'Service Plan'}
                {activeSection === 'paymentfreqs' && 'Payment Frequency'}
                {activeSection === 'kits' && 'Kit Master'}
                {activeSection === 'wastecategories' && 'Waste Category'}
                {activeSection === 'vehicles' && 'Vehicle Master'}
                {activeSection === 'vendors' && 'Vendor Master'}
                {activeSection === 'rawmaterials' && 'Raw Materials'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            {/* Form Content */}
            {activeSection === 'routes' && <RouteFormComponent formData={formData} handleInputChange={handleInputChange} getAutoCode={getAutoCode} />}
            {activeSection === 'serviceplans' && <ServicePlanForm formData={formData} handleInputChange={handleInputChange} getAutoCode={getAutoCode} />}
            {activeSection === 'paymentfreqs' && <PaymentFreqFormComponent formData={formData} handleInputChange={handleInputChange} />}
            {activeSection === 'kits' && <KitForm />}
            {activeSection === 'wastecategories' && <WasteCategoryForm />}
            {activeSection === 'vehicles' && <VehicleForm />}
            {activeSection === 'vendors' && <VendorForm />}
            {activeSection === 'rawmaterials' && <RawMaterialsForm />}

            {/* Form Actions */}
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: '#fff' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: loading ? '#cbd5e1' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
