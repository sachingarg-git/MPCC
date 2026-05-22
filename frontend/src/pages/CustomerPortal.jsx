import { useState, useEffect } from 'react'

// ─── color tokens ────────────────────────────────────────────────────────────
const C = {
  purpleDark: '#1e1b4b',
  purple:     '#3730a3',
  purple2:    '#5b21b6',
  purple3:    '#7c3aed',
  purple4:    '#a855f7',
  purpleLight:'#ede9fe',
  purpleLighter:'#f5f3ff',
  purpleBorder:'#c4b5fd',
  slate:      '#64748b',
  slateLight: '#94a3b8',
  slateBg:    '#f1f5f9',
  border:     '#e2e8f0',
  text:       '#1e293b',
  green:      '#15803d',
  greenBg:    '#dcfce7',
  greenBorder:'#86efac',
  yellow:     '#92400e',
  yellowBg:   '#fef3c7',
  yellowBorder:'#fbbf24',
  red:        '#dc2626',
  redBg:      '#fee2e2',
  redBorder:  '#fca5a5',
  blue:       '#1d4ed8',
  blueBg:     '#dbeafe',
}

function Badge({ color, children }) {
  const map = {
    green:  { bg: C.greenBg,    text: C.green },
    yellow: { bg: C.yellowBg,   text: C.yellow },
    red:    { bg: C.redBg,      text: C.red },
    blue:   { bg: C.blueBg,     text: C.blue },
    purple: { bg: C.purpleLight,text: C.purple2 },
  }
  const s = map[color] || map.purple
  return (
    <span style={{
      display:'inline-block', borderRadius:20, padding:'3px 10px',
      fontSize:11, fontWeight:700, whiteSpace:'nowrap',
      background:s.bg, color:s.text
    }}>{children}</span>
  )
}

// ─── LOGIN VIEW ───────────────────────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [customerId, setCustomerId] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (!customerId.trim() || !pin.trim()) {
      setError('Please enter both Member ID and PIN.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customerId.trim(), pin: pin.trim() })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('portalUser', JSON.stringify(data.customer))
        onLogin(data.customer)
      } else {
        setError(data.message || 'Invalid credentials.')
      }
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh',
      background:'linear-gradient(135deg,#1e1b4b 0%,#3730a3 40%,#5b21b6 100%)',
      padding:20, fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif"
    }}>
      <div style={{
        background:'#fff', borderRadius:24, padding:'40px 36px',
        width:'100%', maxWidth:420,
        boxShadow:'0 32px 80px rgba(0,0,0,.28)'
      }}>
        {/* Logo + Title */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize:32, marginBottom:14,
            boxShadow:'0 8px 24px rgba(91,33,182,.4)'
          }}>🏥</div>
          <h1 style={{fontSize:22, fontWeight:800, color:C.purpleDark, margin:'0 0 4px'}}>MPCC Member Portal</h1>
          <p style={{fontSize:12, color:C.slate, margin:0}}>Biomedical Waste Management · Self Service</p>
        </div>

        {/* Login divider label */}
        <div style={{
          display:'flex', alignItems:'center', gap:10, marginBottom:22
        }}>
          <div style={{flex:1, height:1, background:C.border}} />
          <span style={{fontSize:11, fontWeight:700, color:C.slate, letterSpacing:1, textTransform:'uppercase'}}>Member Login</span>
          <div style={{flex:1, height:1, background:C.border}} />
        </div>

        <form onSubmit={handleLogin}>
          <label style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, display:'block'}}>Member ID</label>
          <input
            style={{
              width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
              padding:'11px 14px', fontSize:14, color:C.text, outline:'none',
              marginBottom:16, boxSizing:'border-box', transition:'border-color .2s', fontFamily:'inherit'
            }}
            type="text" placeholder="e.g. MPCC-UK-0001"
            value={customerId} onChange={e => setCustomerId(e.target.value)}
          />
          <label style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, display:'block'}}>6-Digit PIN</label>
          <input
            style={{
              width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
              padding:'11px 14px', fontSize:14, color:C.text, outline:'none',
              marginBottom:16, boxSizing:'border-box', transition:'border-color .2s',
              letterSpacing:6, fontFamily:'inherit'
            }}
            type="password" placeholder="● ● ● ● ● ●"
            maxLength={6} value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g,''))}
          />
          {error && (
            <div style={{
              background:C.redBg, border:`1.5px solid ${C.redBorder}`, borderRadius:10,
              padding:'10px 14px', fontSize:12, color:C.red, marginBottom:16, fontWeight:600
            }}>⚠️ {error}</div>
          )}
          <button type="submit" disabled={loading} style={{
            width:'100%', padding:13, border:'none', borderRadius:12,
            background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
            color:'#fff', fontSize:15, fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow:'0 6px 20px rgba(91,33,182,.35)',
              transition:'transform .15s,box-shadow .15s', marginTop:4,
              opacity: loading ? .7 : 1, fontFamily:'inherit'
            }}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
            <div style={{textAlign:'center', fontSize:11, color:C.slateLight, marginTop:16}}>
              Contact MPCC admin if you don&apos;t have portal access
            </div>
          </form>

        <div style={{
          textAlign:'center', fontSize:11, color:C.slateLight, marginTop:20,
          borderTop:`1px solid ${C.slateBg}`, paddingTop:16
        }}>
          MPCC Haridwar · Biomedical Waste Management
        </div>
      </div>
    </div>
  )
}

// ─── DOCUMENT TYPES (same as admin panel) ────────────────────────────────────
const DOC_TYPES = [
  { key: 'Aadhaar Card',                icon: '🪪', color: '#2563eb', bg: '#dbeafe' },
  { key: 'PAN Card',                    icon: '💳', color: '#7c3aed', bg: '#ede9fe' },
  { key: 'GST Certificate',             icon: '📋', color: '#0891b2', bg: '#e0f2fe' },
  { key: 'BMW Authorization',           icon: '🏥', color: '#16a34a', bg: '#dcfce7' },
  { key: 'PCB Authorization',           icon: '🏭', color: '#d97706', bg: '#fef3c7' },
  { key: 'Cancelled Cheque',            icon: '🏦', color: '#64748b', bg: '#f1f5f9' },
  { key: 'Facility Photo (Display Board)', icon: '📷', color: '#0891b2', bg: '#e0f2fe' },
  { key: 'Letterhead',                  icon: '📄', color: '#7c3aed', bg: '#ede9fe' },
  { key: 'MoU Copy',                    icon: '📝', color: '#dc2626', bg: '#fee2e2' },
  { key: 'Agreement Copy',              icon: '📃', color: '#16a34a', bg: '#dcfce7' },
  { key: 'NOC (CMO/RO Consent)',        icon: '✅', color: '#2563eb', bg: '#dbeafe' },
]

// ─── PORTAL VIEW ──────────────────────────────────────────────────────────────
function PortalView({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [pickups, setPickups] = useState([])
  const [bills, setBills] = useState([])
  const [tickets, setTickets] = useState([])
  const [docs, setDocs] = useState([])
  const [uploadingDoc, setUploadingDoc] = useState(null)  // docType being uploaded
  const [contacts, setContacts] = useState([])
  const [profileHistory, setProfileHistory] = useState([])
  const [profileForm, setProfileForm] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [newContact, setNewContact] = useState({ contactName:'', designation:'', mobile:'', email:'', isPrimary: false })
  const [savingContact, setSavingContact] = useState(false)
  const [profileAttachment, setProfileAttachment] = useState(null)
  const [pickupFilter, setPickupFilter] = useState('all')
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [complaintType, setComplaintType] = useState(null)
  const [complaintDesc, setComplaintDesc] = useState('')
  const [complaintDate, setComplaintDate] = useState('')
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [viewTicket, setViewTicket] = useState(null)
  const [ticketHistory, setTicketHistory] = useState([])
  const [loadingTicketHistory, setLoadingTicketHistory] = useState(false)
  const [ticketNote, setTicketNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [toast, setToast] = useState(null)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900)

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const [fullProfile, setFullProfile] = useState(user)

  useEffect(() => {
    const id = user.RegistrationID
    fetch(`/api/portal/pickups/${id}`).then(r => r.json()).then(d => setPickups(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/bills/${id}`).then(r => r.json()).then(d => setBills(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/tickets/${id}`).then(r => r.json()).then(d => setTickets(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/documents/${id}`).then(r => r.json()).then(d => setDocs(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/contacts/${id}`).then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/profile-history/${id}`).then(r => r.json()).then(d => setProfileHistory(Array.isArray(d) ? d : [])).catch(() => {})

    // Always fetch fresh full profile from DB (login may have cached partial data)
    fetch(`/api/portal/profile/${id}`)
      .then(r => r.json())
      .then(p => {
        if (p && p.RegistrationID) {
          setFullProfile(p)
          // Update localStorage with fresh full data
          localStorage.setItem('portalUser', JSON.stringify(p))
          setProfileForm({
            FullAddress:      p.FullAddress      || '',
            Pincode:          p.Pincode          || '',
            PANNumber:        p.PANNumber        || '',
            GSTNumber:        p.GSTNumber        || '',
            BMWRegNo:         p.BMWRegNo         || '',
            GPSLatitude:      p.GPSLatitude      || '',
            GPSLongitude:     p.GPSLongitude     || '',
            Website:          p.Website          || '',
            AlternateMobile:  p.AlternateMobile  || '',
            ContactPerson:    p.ContactPerson    || '',
            Designation:      p.Designation      || '',
            NumberOfBeds:     p.NumberOfBeds     || '',
            remarks: ''
          })
        }
      })
      .catch(() => {
        // Fallback to user data from localStorage if fetch fails
        setProfileForm({
          FullAddress:      user.FullAddress      || '',
          Pincode:          user.Pincode          || '',
          PANNumber:        user.PANNumber        || '',
          GSTNumber:        user.GSTNumber        || '',
          BMWRegNo:         user.BMWRegNo         || '',
          GPSLatitude:      user.GPSLatitude      || '',
          GPSLongitude:     user.GPSLongitude     || '',
          Website:          user.Website          || '',
          AlternateMobile:  user.AlternateMobile  || '',
          ContactPerson:    user.ContactPerson    || '',
          Designation:      user.Designation      || '',
          NumberOfBeds:     user.NumberOfBeds     || '',
          remarks: ''
        })
      })
  }, [user.RegistrationID])

  function reloadDocs() {
    fetch(`/api/portal/documents/${user.RegistrationID}`)
      .then(r => r.json()).then(d => setDocs(Array.isArray(d) ? d : [])).catch(() => {})
  }

  function reloadContacts() {
    fetch(`/api/portal/contacts/${user.RegistrationID}`)
      .then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : [])).catch(() => {})
  }

  function reloadHistory() {
    fetch(`/api/portal/profile-history/${user.RegistrationID}`)
      .then(r => r.json()).then(d => setProfileHistory(Array.isArray(d) ? d : [])).catch(() => {})
  }

  async function saveProfile() {
    setSavingProfile(true)
    try {
      const fd = new FormData()
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v || ''))
      if (profileAttachment) fd.append('attachment', profileAttachment)
      const res = await fetch(`/api/portal/profile/${user.RegistrationID}`, { method: 'PUT', body: fd })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Profile updated successfully')
        setProfileAttachment(null)
        reloadHistory()
        // Refresh fullProfile so read-only banner shows latest values
        fetch(`/api/portal/profile/${user.RegistrationID}`)
          .then(r => r.json()).then(p => { if (p && p.RegistrationID) { setFullProfile(p); localStorage.setItem('portalUser', JSON.stringify(p)) } }).catch(() => {})
      } else {
        showToast('❌ Update failed')
      }
    } catch {
      showToast('❌ Connection error')
    }
    setSavingProfile(false)
  }

  async function addContact() {
    if (!newContact.contactName || !newContact.mobile) { showToast('Name and mobile are required'); return }
    setSavingContact(true)
    try {
      const res = await fetch('/api/portal/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newContact, registrationId: user.RegistrationID })
      })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Contact added')
        setNewContact({ contactName:'', designation:'', mobile:'', email:'', isPrimary: false })
        setShowAddContactModal(false)
        reloadContacts()
      }
    } catch { showToast('❌ Error adding contact') }
    setSavingContact(false)
  }

  async function deleteContact(id) {
    try {
      await fetch(`/api/portal/contacts/${id}`, { method: 'DELETE' })
      showToast('Contact removed')
      reloadContacts()
    } catch { showToast('Error removing contact') }
  }

  async function openTicketDetail(ticket) {
    setViewTicket(ticket)
    setTicketNote('')
    setLoadingTicketHistory(true)
    try {
      const res = await fetch(`/api/support-tickets/${ticket.TicketID}/history`)
      const data = await res.json()
      setTicketHistory(Array.isArray(data) ? data : [])
    } catch { setTicketHistory([]) }
    finally { setLoadingTicketHistory(false) }
  }

  async function addTicketNote() {
    if (!ticketNote.trim() || !viewTicket) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/support-tickets/${viewTicket.TicketID}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy: fullProfile.InstitutionName || user.InstitutionName || 'Customer', notes: ticketNote, source: 'Customer' })
      })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Note added')
        setTicketNote('')
        // Reload history
        const h = await fetch(`/api/support-tickets/${viewTicket.TicketID}/history`).then(r => r.json())
        setTicketHistory(Array.isArray(h) ? h : [])
      }
    } catch { showToast('❌ Error adding note') }
    setSavingNote(false)
  }

  async function handleDocUpload(docType, file) {
    if (!file) return
    setUploadingDoc(docType)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('registrationId', user.RegistrationID)
      fd.append('documentType', docType)
      fd.append('version', 'v1')
      fd.append('uploadSource', 'Customer')
      const res = await fetch('/api/portal/documents/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        showToast(`✅ ${docType} uploaded successfully`)
        reloadDocs()
      } else {
        showToast(`❌ Upload failed: ${data.error || 'Unknown error'}`)
      }
    } catch {
      showToast('❌ Connection error during upload')
    }
    setUploadingDoc(null)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function submitComplaint() {
    if (!complaintType || !complaintDesc.trim()) {
      showToast('Please select a category and describe the issue')
      return
    }
    setSubmittingTicket(true)
    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RegistrationID: user.RegistrationID,
          HCFName: user.InstitutionName,
          Category: complaintType,
          Priority: 'Medium',
          Subject: complaintType,
          Description: complaintDesc + (complaintDate ? ` | Callback date: ${complaintDate}` : ''),
          AssignedTo: 'Support Team'
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`✅ Ticket ${data.ticketCode} raised successfully`)
        setShowComplaintModal(false)
        setComplaintType(null)
        setComplaintDesc('')
        setComplaintDate('')
        fetch(`/api/portal/tickets/${user.RegistrationID}`).then(r => r.json()).then(d => setTickets(Array.isArray(d) ? d : [])).catch(() => {})
      } else {
        showToast('Failed to raise ticket. Try again.')
      }
    } catch {
      showToast('Connection error. Try again.')
    }
    setSubmittingTicket(false)
  }

  const navItems = [
    { id: 'dashboard',  icon: '🏠', label: 'Home' },
    { id: 'profile',    icon: '🏢', label: 'Profile' },
    { id: 'pickups',    icon: '🚛', label: 'Pickups' },
    { id: 'bills',      icon: '💳', label: 'Bills' },
    { id: 'certs',      icon: '📄', label: 'Docs' },
    { id: 'complaints', icon: '📣', label: 'Support' },
    { id: 'renewal',    icon: '🔄', label: 'Renew' },
  ]

  const openTickets = tickets.filter(t => t.Status === 'Open' || t.Status === 'In Progress')
  const resolvedTickets = tickets.filter(t => t.Status === 'Resolved' || t.Status === 'Closed')
  const outstandingBills = bills.filter(b => b.status === 'Overdue')
  const outstandingTotal = outstandingBills.reduce((a, b) => a + (b.amount || 0), 0)
  const avatarLetter = (user.InstitutionName || user.ContactPerson || 'M')[0].toUpperCase()

  // TOP NAV
  const topNav = (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, height:60, zIndex:100,
      background:'linear-gradient(135deg,#1e1b4b,#3730a3)',
      display:'flex', alignItems:'center', padding:'0 20px', gap:14,
      boxShadow:'0 2px 16px rgba(0,0,0,.2)'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{
          width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.15)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0
        }}>🏥</div>
        <div>
          <div style={{fontSize:16, fontWeight:800, color:'#fff', whiteSpace:'nowrap'}}>MPCC Member Portal</div>
          <div style={{fontSize:10, fontWeight:500, color:'#a5b4fc', marginTop:1}}>Medical Waste Compliance &amp; Collection</div>
        </div>
      </div>
      <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:10}}>
        <span style={{
          background:'rgba(255,255,255,.12)', borderRadius:20,
          padding:'5px 12px', fontSize:11, color:'#c4b5fd', fontWeight:600
        }}>{user.CustomerID || 'MEMBER'}</span>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'linear-gradient(135deg,#7c3aed,#a855f7)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer',
          border:'2px solid rgba(255,255,255,.2)'
        }}>{avatarLetter}</div>
        <button onClick={onLogout} style={{
          background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
          color:'#fff', borderRadius:8, padding:'6px 12px', fontSize:11,
          fontWeight:600, cursor:'pointer', fontFamily:'inherit'
        }}>Logout</button>
      </div>
    </nav>
  )

  // SIDEBAR
  const sidebar = isDesktop && (
    <aside style={{
      display:'flex', flexDirection:'column',
      position:'fixed', top:60, left:0, bottom:0, width:230,
      background:'#fff', borderRight:`1px solid ${C.border}`,
      zIndex:90, overflowY:'auto', overflowX:'hidden',
      padding:'16px 0', boxShadow:'2px 0 12px rgba(0,0,0,.04)'
    }}>
      <div style={{padding:'14px 18px 16px', borderBottom:`1px solid ${C.slateBg}`, marginBottom:8}}>
        <div style={{fontSize:13, fontWeight:800, color:C.purpleDark, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
          {user.InstitutionName || 'Member'}
        </div>
        <div style={{fontSize:10, color:C.purple3, fontWeight:700, marginTop:3, fontFamily:'monospace'}}>
          {user.CustomerID || `REG-${user.RegistrationID}`}
        </div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:4,
          background:C.greenBg, color:C.green,
          borderRadius:20, padding:'3px 10px', fontSize:10, fontWeight:700, marginTop:6
        }}>● Active Member</div>
      </div>

      <div style={{fontSize:9, fontWeight:800, color:C.slateLight, textTransform:'uppercase', letterSpacing:1, padding:'8px 18px 4px'}}>
        Navigation
      </div>

      {[
        { id:'dashboard',  icon:'🏠', label:'Dashboard' },
        { id:'profile',    icon:'🏢', label:'My Profile' },
        { id:'pickups',    icon:'🚛', label:'Pickups & Manifests' },
        { id:'bills',      icon:'💳', label:'Bills & Payments', badge: outstandingBills.length || null, badgeColor:'#ef4444' },
        { id:'certs',      icon:'📄', label:'Certificates & Docs' },
        { id:'complaints', icon:'📣', label:'Support & Complaints', badge: openTickets.length || null, badgeColor:'#f59e0b' },
        { id:'renewal',    icon:'🔄', label:'Renewal & Compliance' },
      ].map(item => (
        <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 18px', cursor:'pointer',
          fontSize:13, fontWeight: activeSection===item.id ? 700 : 600,
          color: activeSection===item.id ? C.purple2 : '#475569',
          border:'none', background: activeSection===item.id ? C.purpleLight : 'transparent',
          width:'100%', textAlign:'left', transition:'background .15s,color .15s',
          position:'relative', whiteSpace:'nowrap', fontFamily:'inherit'
        }}>
          {activeSection===item.id && (
            <div style={{
              position:'absolute', left:0, top:0, bottom:0, width:3,
              background:C.purple3, borderRadius:'0 2px 2px 0'
            }}/>
          )}
          <span style={{fontSize:18, flexShrink:0, width:24, textAlign:'center'}}>{item.icon}</span>
          <span style={{flex:1}}>{item.label}</span>
          {item.badge ? (
            <span style={{
              background: item.badgeColor, color:'#fff', borderRadius:10,
              fontSize:9, fontWeight:800, padding:'2px 6px', minWidth:18, textAlign:'center'
            }}>{item.badge}</span>
          ) : null}
        </button>
      ))}

      <div style={{height:1, background:C.slateBg, margin:'8px 16px'}}/>
      <div style={{fontSize:9, fontWeight:800, color:C.slateLight, textTransform:'uppercase', letterSpacing:1, padding:'8px 18px 4px'}}>
        Quick Actions
      </div>
      <button onClick={() => setActiveSection('bills')} style={{
        display:'flex', alignItems:'center', gap:10, padding:'10px 18px',
        cursor:'pointer', fontSize:13, fontWeight:600, color:'#475569',
        border:'none', background:'transparent', width:'100%', textAlign:'left', fontFamily:'inherit'
      }}>
        <span style={{fontSize:18, width:24, textAlign:'center'}}>💰</span> Pay Outstanding
      </button>
      <button onClick={() => setShowComplaintModal(true)} style={{
        display:'flex', alignItems:'center', gap:10, padding:'10px 18px',
        cursor:'pointer', fontSize:13, fontWeight:600, color:'#475569',
        border:'none', background:'transparent', width:'100%', textAlign:'left', fontFamily:'inherit'
      }}>
        <span style={{fontSize:18, width:24, textAlign:'center'}}>➕</span> Raise Complaint
      </button>

      <div style={{height:1, background:C.slateBg, margin:'8px 16px'}}/>

      <div style={{
        padding:'12px 16px', margin:'4px 10px',
        background:'linear-gradient(135deg,#f5f3ff,#ede9fe)',
        borderRadius:12, border:`1px solid ${C.purpleBorder}`
      }}>
        <div style={{fontSize:10, fontWeight:800, color:C.purple2, textTransform:'uppercase', letterSpacing:.5, marginBottom:6}}>📋 Compliance Status</div>
        <div style={{fontSize:11, color:'#374151', marginBottom:4, display:'flex', justifyContent:'space-between'}}>
          <span>PCB Authorization</span><span style={{color:C.green, fontWeight:700}}>✓ Valid</span>
        </div>
        <div style={{fontSize:11, color:'#374151', marginBottom:4, display:'flex', justifyContent:'space-between'}}>
          <span>Membership</span><span style={{color:C.green, fontWeight:700}}>✓ Valid</span>
        </div>
        <div style={{fontSize:11, color:'#374151', display:'flex', justifyContent:'space-between'}}>
          <span>Annual Return</span><span style={{color:'#f59e0b', fontWeight:700}}>⚠ Due</span>
        </div>
      </div>

      <div style={{marginTop:'auto', padding:'12px 16px 6px', fontSize:10, color:C.slateLight, textAlign:'center'}}>
        MPCC Haridwar · Wizone IT Network<br />Support: +91-XXXXX-XXXXX
      </div>
    </aside>
  )

  // BOTTOM NAV
  const bottomNav = !isDesktop && (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0, height:62, zIndex:100,
      background:'#fff', borderTop:`1px solid ${C.border}`,
      display:'flex', alignItems:'stretch',
      boxShadow:'0 -4px 20px rgba(0,0,0,.08)'
    }}>
      {navItems.map(item => (
        <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', gap:3, cursor:'pointer',
          fontSize:10, fontWeight:600,
          color: activeSection===item.id ? C.purple2 : C.slateLight,
          transition:'all .15s', border:'none', background:'transparent',
          padding:'6px 2px', position:'relative', fontFamily:'inherit',
          borderTop: activeSection===item.id ? `2px solid ${C.purple2}` : '2px solid transparent'
        }}>
          {item.id==='bills' && outstandingBills.length > 0 && (
            <span style={{
              position:'absolute', top:6, right:'calc(50% - 14px)',
              background:'#ef4444', color:'#fff', borderRadius:10,
              fontSize:9, fontWeight:800, padding:'1px 5px', minWidth:16, textAlign:'center'
            }}>{outstandingBills.length}</span>
          )}
          {item.id==='complaints' && openTickets.length > 0 && (
            <span style={{
              position:'absolute', top:6, right:'calc(50% - 14px)',
              background:'#ef4444', color:'#fff', borderRadius:10,
              fontSize:9, fontWeight:800, padding:'1px 5px', minWidth:16, textAlign:'center'
            }}>{openTickets.length}</span>
          )}
          <span style={{fontSize:20, lineHeight:1}}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )

  // DASHBOARD
  const sectionDashboard = (
    <div>
      <div style={{
        background:'linear-gradient(135deg,#1e1b4b,#5b21b6)',
        borderRadius:18, padding:20, marginBottom:16, color:'#fff',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{position:'absolute', right:-10, bottom:-15, fontSize:80, opacity:.12, userSelect:'none'}}>🏥</div>
        <h2 style={{fontSize:17, fontWeight:800, margin:0}}>Good day, {user.InstitutionName || 'Member'} 👋</h2>
        <p style={{fontSize:12, opacity:.8, marginTop:4, marginBottom:0}}>
          MPCC Membership — {user.Zone || 'Zone'} · Active Member
        </p>
        <div style={{
          display:'inline-block', background:'rgba(255,255,255,.15)',
          borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, marginTop:10
        }}>{user.CustomerID || `REG-${user.RegistrationID}`}</div>
      </div>

      {outstandingTotal > 0 && (
        <div style={{
          background:C.redBg, border:`1.5px solid ${C.redBorder}`, borderRadius:12,
          padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center',
          gap:10, fontSize:12, fontWeight:600, color:C.red
        }}>
          <span>⚠️</span>
          <div>
            <strong>Payment Due:</strong> ₹{outstandingTotal.toLocaleString('en-IN')} outstanding —{' '}
            <span onClick={() => setActiveSection('bills')} style={{cursor:'pointer', textDecoration:'underline'}}>Pay Now</span>
          </div>
        </div>
      )}
      <div style={{
        background:C.greenBg, border:`1.5px solid ${C.greenBorder}`, borderRadius:12,
        padding:'12px 14px', marginBottom:12, display:'flex', alignItems:'center',
        gap:10, fontSize:12, fontWeight:600, color:C.green
      }}>
        <span>✅</span>
        <div><strong>Last Pickup:</strong> 02 May 2026 · 4.8 kg collected by Raju Kumar</div>
      </div>

      <div style={{display:'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : '1fr 1fr', gap:10, marginBottom:14}}>
        {[
          { icon:'🚛', val: pickups.filter(p => p.status==='Collected').length || 47, lbl:'Pickups (This Year)' },
          { icon:'💰', val:`₹${outstandingTotal > 0 ? outstandingTotal.toLocaleString('en-IN') : '5,900'}`, lbl:'Outstanding Amount', color:C.red },
          { icon:'♻️', val:'198 kg', lbl:'Total Waste (YTD)' },
          { icon:'📋', val: openTickets.length || 0, lbl:'Open Complaints', color: openTickets.length > 0 ? '#f59e0b' : undefined },
        ].map((k, i) => (
          <div key={i} style={{background:'#fff', borderRadius:14, padding:14, boxShadow:'0 2px 10px rgba(0,0,0,.06)'}}>
            <div style={{fontSize:24, marginBottom:6}}>{k.icon}</div>
            <div style={{fontSize:22, fontWeight:800, color: k.color || C.purpleDark}}>{k.val}</div>
            <div style={{fontSize:10, color:C.slate, marginTop:3}}>{k.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)', marginBottom:14}}>
        <div style={{fontSize:14, fontWeight:800, color:C.purpleDark, marginBottom:14}}>⚡ Quick Actions</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {[
            { label:'💳 Pay Bill',        fn: () => setActiveSection('bills'),    primary:true },
            { label:'📣 Raise Complaint', fn: () => setShowComplaintModal(true), primary:false },
            { label:'📄 My Certificates', fn: () => setActiveSection('certs'),   primary:false },
            { label:'🚛 Pickup History',  fn: () => setActiveSection('pickups'), primary:false },
          ].map((a, i) => (
            <button key={i} onClick={a.fn} style={{
              border: a.primary ? 'none' : `1.5px solid ${C.purpleBorder}`,
              borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:700,
              cursor:'pointer', transition:'all .15s',
              background: a.primary ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : C.purpleLighter,
              color: a.primary ? '#fff' : C.purple2,
              boxShadow: a.primary ? '0 4px 12px rgba(91,33,182,.3)' : 'none',
              fontFamily:'inherit'
            }}>{a.label}</button>
          ))}
        </div>
      </div>

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
          <div style={{fontSize:14, fontWeight:800, color:C.purpleDark}}>🚛 Recent Pickups</div>
          <button onClick={() => setActiveSection('pickups')} style={{
            background:C.purpleLighter, border:`1.5px solid ${C.purpleBorder}`,
            color:C.purple2, borderRadius:8, padding:'7px 14px', fontSize:12,
            fontWeight:700, cursor:'pointer', fontFamily:'inherit'
          }}>View All</button>
        </div>
        {(pickups.length > 0 ? pickups.slice(0,2) : [
          { date:'2026-05-02', status:'Collected', driver:'Raju Kumar', vehicle:'UK-14-1234', totalKg:4.8, yellowBag:2, redBag:1, sharps:1 },
          { date:'2026-04-25', status:'Collected', driver:'Mohan Singh', vehicle:'UK-14-5678', totalKg:3.9, yellowBag:2, redBag:1, sharps:0 },
        ]).map((p, i) => (
          <div key={i} style={{
            background:'#fff', borderRadius:14, padding:14, marginBottom:10,
            border:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,.05)'
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
              <div style={{fontSize:13, fontWeight:700, color:C.purpleDark}}>
                {p.date ? new Date(p.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : p.date}
              </div>
              <Badge color={p.status==='Collected'?'green':p.status==='Missed'?'red':'yellow'}>{p.status}</Badge>
            </div>
            {p.driver && <div style={{fontSize:12, color:C.slate}}>Driver: {p.driver} · Vehicle: {p.vehicle}</div>}
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:8}}>
              {p.totalKg > 0 && <span style={{background:C.purpleLighter, borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:C.purple2}}>{p.totalKg} kg Total</span>}
              {p.yellowBag > 0 && <span style={{background:C.purpleLighter, borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:C.purple2}}>Yellow Bag ×{p.yellowBag}</span>}
              {p.redBag > 0 && <span style={{background:C.purpleLighter, borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:C.purple2}}>Red ×{p.redBag}</span>}
              {p.sharps > 0 && <span style={{background:C.purpleLighter, borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:C.purple2}}>Sharps ×{p.sharps}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // PICKUPS
  const filteredPickups = pickups.filter(p => {
    if (pickupFilter === 'all') return true
    if (pickupFilter === 'collected') return p.status === 'Collected'
    if (pickupFilter === 'missed') return p.status === 'Missed'
    if (pickupFilter === 'month') {
      const d = new Date(p.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  const sectionPickups = (
    <div>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:18, fontWeight:800, color:C.purpleDark, margin:0}}>🚛 My Pickups &amp; Manifests</h2>
        <p style={{fontSize:12, color:C.slate, marginTop:3, marginBottom:0}}>Full collection history with Form-2 manifest download</p>
      </div>
      <div style={{display:'flex', gap:8, marginBottom:14, overflowX:'auto', paddingBottom:4}}>
        {[
          { id:'all',       label:'All' },
          { id:'collected', label:'✅ Collected' },
          { id:'missed',    label:'❌ Missed' },
          { id:'month',     label:'📅 This Month' },
        ].map(f => (
          <button key={f.id} onClick={() => setPickupFilter(f.id)} style={{
            background: pickupFilter===f.id ? C.purple2 : '#fff',
            border:`1.5px solid ${pickupFilter===f.id ? C.purple2 : C.border}`,
            borderRadius:20, padding:'6px 14px', fontSize:11, fontWeight:600,
            color: pickupFilter===f.id ? '#fff' : C.slate,
            cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontFamily:'inherit'
          }}>{f.label}</button>
        ))}
      </div>

      {filteredPickups.map((p, i) => (
        <div key={i} style={{
          background:'#fff', borderRadius:14, padding:14, marginBottom:10,
          border:`1px solid ${C.border}`, boxShadow:'0 1px 6px rgba(0,0,0,.05)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:C.purpleDark}}>
                {p.date ? new Date(p.date).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'short',year:'numeric'}) : 'N/A'}
              </div>
              <div style={{fontSize:11, color:C.slate, marginTop:2}}>
                {p.manifest ? `Manifest No: ${p.manifest} · Driver: ${p.driver}` : 'Scheduled pickup — no visit recorded'}
              </div>
            </div>
            <Badge color={p.status==='Collected'?'green':p.status==='Missed'?'red':'yellow'}>{p.status}</Badge>
          </div>
          {p.status === 'Missed' && (
            <div style={{marginTop:8, fontSize:12, color:C.red}}>Vehicle did not arrive on scheduled date</div>
          )}
          {p.status === 'Collected' && (
            <>
              <div style={{height:1, background:C.slateBg, margin:'10px 0'}}/>
              <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, textAlign:'center', fontSize:11}}>
                <div><div style={{fontSize:16, fontWeight:800, color:C.purple2}}>{p.totalKg}</div><div style={{color:C.slate}}>kg Total</div></div>
                <div><div style={{fontSize:16, fontWeight:800, color:'#f59e0b'}}>{p.yellowBag}</div><div style={{color:C.slate}}>Yellow</div></div>
                <div><div style={{fontSize:16, fontWeight:800, color:C.red}}>{p.redBag}</div><div style={{color:C.slate}}>Red</div></div>
                <div><div style={{fontSize:16, fontWeight:800, color:C.slate}}>{p.sharps}</div><div style={{color:C.slate}}>Sharps</div></div>
              </div>
              <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap'}}>
                <button onClick={() => showToast('Manifest download will be available soon')} style={{background:C.purpleLight, border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:C.purple2, cursor:'pointer', fontFamily:'inherit'}}>📄 Form-2 Manifest</button>
                <button onClick={() => showToast('Photo proof coming soon')} style={{background:'#f0fdf4', border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:C.green, cursor:'pointer', fontFamily:'inherit'}}>📸 Photo Proof</button>
                <button onClick={() => showToast('GPS tracking coming soon')} style={{background:C.blueBg, border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:C.blue, cursor:'pointer', fontFamily:'inherit'}}>📍 GPS</button>
              </div>
            </>
          )}
          {p.status === 'Missed' && (
            <button onClick={() => setShowComplaintModal(true)} style={{background:C.redBg, border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:C.red, cursor:'pointer', marginTop:8, fontFamily:'inherit'}}>
              📣 Raise Complaint
            </button>
          )}
        </div>
      ))}
      {filteredPickups.length === 0 && (
        <div style={{textAlign:'center', padding:40, color:C.slate, fontSize:13}}>
          No pickups found for selected filter.
        </div>
      )}
    </div>
  )

  // BILLS
  const sectionBills = (
    <div>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:18, fontWeight:800, color:C.purpleDark, margin:0}}>💰 My Bills &amp; Payments</h2>
        <p style={{fontSize:12, color:C.slate, marginTop:3, marginBottom:0}}>Outstanding amount, full payment history, click to pay</p>
      </div>

      {outstandingTotal > 0 ? (
        <div style={{
          background:'linear-gradient(135deg,#fef3c7,#fffbeb)',
          borderRadius:16, padding:18, marginBottom:14,
          border:`2px solid ${C.yellowBorder}`
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:C.yellow}}>Total Outstanding</div>
              <div style={{fontSize:32, fontWeight:800, color:C.yellow}}>₹{outstandingTotal.toLocaleString('en-IN')}</div>
              <div style={{fontSize:11, color:'#b45309', marginTop:2}}>{outstandingBills.length} invoices overdue</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11, color:C.yellow}}>Member ID</div>
              <div style={{fontSize:13, fontWeight:700, color:C.yellow}}>{user.CustomerID || `REG-${user.RegistrationID}`}</div>
            </div>
          </div>
          <button onClick={() => showToast('Payment gateway integration coming soon')} style={{
            width:'100%', padding:14, border:'none', borderRadius:12,
            background:'linear-gradient(135deg,#2563eb,#1d4ed8)',
            color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 6px 20px rgba(37,99,235,.35)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            fontFamily:'inherit'
          }}>
            <span>💳</span> Pay Now via Razorpay · UPI / Card / Net Banking
          </button>
          <div style={{fontSize:10, color:C.yellow, textAlign:'center', marginTop:8}}>
            🔒 Secure payment · Receipt auto-sent via WhatsApp &amp; Email
          </div>
        </div>
      ) : (
        <div style={{
          background:C.greenBg, border:`1.5px solid ${C.greenBorder}`, borderRadius:12,
          padding:'12px 14px', marginBottom:14, display:'flex', alignItems:'center',
          gap:10, fontSize:12, fontWeight:600, color:C.green
        }}>
          <span>✅</span><div><strong>All Paid Up!</strong> No outstanding amount. Next due: 01 Jun 2026</div>
        </div>
      )}

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
        <div style={{fontSize:14, fontWeight:800, color:C.purpleDark, marginBottom:14}}>📋 Invoice History</div>
        {(bills.length > 0 ? bills : [
          { month:'May 2026', invoiceNo:'INV-2026-0512', dueDate:'2026-05-10', amount:2950, status:'Overdue' },
          { month:'Apr 2026', invoiceNo:'INV-2026-0412', dueDate:'2026-04-10', amount:2950, status:'Overdue' },
          { month:'Mar 2026', invoiceNo:'INV-2026-0310', dueDate:'2026-03-10', amount:2950, status:'Paid', paidDate:'2026-03-08' },
          { month:'Feb 2026', invoiceNo:'INV-2026-0210', dueDate:'2026-02-10', amount:2950, status:'Paid', paidDate:'2026-02-12' },
        ]).map((b, i, arr) => (
          <div key={i} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'12px 0',
            borderBottom: i < arr.length-1 ? `1px solid ${C.slateBg}` : 'none'
          }}>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:C.text}}>{b.month}</div>
              <div style={{fontSize:11, color:C.slate}}>
                {b.invoiceNo} · {b.status==='Paid' && b.paidDate
                  ? `Paid: ${new Date(b.paidDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}`
                  : `Due: ${new Date(b.dueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}`}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:14, fontWeight:800, color:C.text}}>₹{(b.amount||0).toLocaleString('en-IN')}</div>
              <Badge color={b.status==='Paid'?'green':'red'}>{b.status}</Badge>
            </div>
          </div>
        ))}
        <button onClick={() => showToast('Download feature coming soon')} style={{
          width:'100%', marginTop:10, padding:'10px 18px', fontSize:13, fontWeight:700,
          background:C.purpleLighter, border:`1.5px solid ${C.purpleBorder}`, color:C.purple2,
          borderRadius:10, cursor:'pointer', fontFamily:'inherit'
        }}>📥 Download All Invoices</button>
      </div>
    </div>
  )

  // CERTIFICATES & DOCUMENTS (real data from DB)
  const docMap = {}
  docs.forEach(d => { docMap[d.DocumentType] = d })

  function statusBadge(d) {
    if (!d) return { label: 'Not Uploaded', color: C.slate, bg: C.slateBg }
    const st = (d.DocStatus || 'Valid').toLowerCase()
    if (st === 'expired')  return { label: 'Expired',   color: C.red,    bg: C.redBg }
    if (st === 'expiring') return { label: 'Expiring',  color: C.yellow, bg: C.yellowBg }
    return { label: 'Valid', color: C.green, bg: C.greenBg }
  }

  const sectionCerts = (
    <div>
      <div style={{marginBottom:20, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
        <div>
          <h2 style={{fontSize:18, fontWeight:800, color:C.purpleDark, margin:0}}>📁 My Documents</h2>
          <p style={{fontSize:12, color:C.slate, marginTop:3, marginBottom:0}}>Upload &amp; manage your compliance documents. Visible to MPCC admin in real-time.</p>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <span style={{fontSize:11, color:C.slate, alignSelf:'center'}}>{docs.length}/{DOC_TYPES.length} uploaded</span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12}}>
        {DOC_TYPES.map(dt => {
          const d = docMap[dt.key]
          const sb = statusBadge(d)
          const isUploading = uploadingDoc === dt.key
          const inputId = `doc-upload-${dt.key.replace(/\s+/g,'-')}`
          return (
            <div key={dt.key} style={{
              background: d ? `linear-gradient(135deg,${dt.bg},#fff)` : '#fff',
              border: d ? `1.5px solid ${dt.color}33` : `1.5px dashed ${C.border}`,
              borderRadius:14, padding:14, position:'relative', transition:'all .2s'
            }}>
              {/* Header */}
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background: d ? `linear-gradient(135deg,${dt.color},${dt.color}cc)` : C.slateBg,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18
                }}>{dt.icon}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:700, color:C.purpleDark, lineHeight:1.3}}>{dt.key}</div>
                  {d && <div style={{fontSize:10, color:C.slate, marginTop:2}}>
                    {d.Version || 'v1'} · {d.UpdatedAt || d.CreatedAt ? new Date(d.UpdatedAt || d.CreatedAt).toLocaleDateString('en-IN') : ''}
                  </div>}
                </div>
                <span style={{
                  fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
                  background: sb.bg, color: sb.color, whiteSpace:'nowrap'
                }}>{sb.label}</span>
              </div>

              {/* File name if uploaded */}
              {d && d.FileName && (
                <div style={{
                  fontSize:10, color:C.slate, background:C.slateBg, borderRadius:6,
                  padding:'4px 8px', marginBottom:8, overflow:'hidden',
                  textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>📎 {d.FileName}</div>
              )}

              {/* Expiry */}
              {d && d.ExpiryDate && (
                <div style={{fontSize:10, color:C.slate, marginBottom:8}}>
                  Expiry: {new Date(d.ExpiryDate).toLocaleDateString('en-IN')}
                </div>
              )}

              {/* Actions */}
              <div style={{display:'flex', gap:6}}>
                {d && d.FilePath && (
                  <a href={d.FilePath} target="_blank" rel="noreferrer" style={{
                    flex:1, textAlign:'center', padding:'6px 0', fontSize:11, fontWeight:700,
                    background:'#fff', color:dt.color, border:`1.5px solid ${dt.color}`,
                    borderRadius:7, textDecoration:'none', cursor:'pointer'
                  }}>👁 View</a>
                )}
                <label htmlFor={inputId} style={{
                  flex:1, textAlign:'center', padding:'6px 0', fontSize:11, fontWeight:700,
                  background: isUploading ? C.slateBg : `linear-gradient(135deg,${dt.color},${dt.color}cc)`,
                  color: isUploading ? C.slate : '#fff',
                  borderRadius:7, cursor: isUploading ? 'not-allowed' : 'pointer',
                  border:'none', display:'block'
                }}>
                  {isUploading ? '⏳ Uploading...' : d ? '🔄 Update' : '⬆ Upload'}
                  <input id={inputId} type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{display:'none'}}
                    disabled={isUploading}
                    onChange={e => { if (e.target.files[0]) handleDocUpload(dt.key, e.target.files[0]); e.target.value = '' }}
                  />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop:20, padding:12, background:C.purpleLighter, borderRadius:12,
        fontSize:11, color:C.slate, display:'flex', gap:16, flexWrap:'wrap'
      }}>
        <span>✅ <strong>Valid</strong> — document accepted</span>
        <span>⚠️ <strong>Expiring</strong> — renewal needed soon</span>
        <span>❌ <strong>Expired</strong> — upload updated doc</span>
        <span>📤 <strong>Upload</strong> — PDF, JPG, PNG (max 10 MB)</span>
      </div>
    </div>
  )

  // SUPPORT
  const TicketCard = ({ t, onView }) => {
    const STATUS_C = { Open:'#2563eb', 'In Progress':'#d97706', Resolved:'#16a34a', Closed:'#64748b', Escalated:'#dc2626' }
    const sc = STATUS_C[t.Status] || '#2563eb'
    return (
      <div style={{ border:`1.5px solid ${C.border}`, borderRadius:12, padding:14, marginBottom:10, background:'#fff', cursor:'pointer' }}
        onClick={() => onView(t)}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#0e7490', fontFamily:'monospace', background:'#ecfeff', borderRadius:4, padding:'2px 7px' }}>
                {t.TicketCode || `TKT-${t.TicketID}`}
              </span>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:`${sc}18`, color:sc, border:`1px solid ${sc}33` }}>{t.Status}</span>
              <span style={{ fontSize:10, color:'#64748b' }}>{t.Priority}</span>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:C.purpleDark }}>{t.Subject || t.Category}</div>
            <div style={{ fontSize:11, color:C.slate, marginTop:3 }}>
              {t.Category} · {t.CreatedAt ? new Date(t.CreatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : ''}
              {t.AssignedTo && ` · 👤 ${t.AssignedTo}`}
            </div>
          </div>
          <button style={{ background:C.purpleLighter, color:C.purple2, border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>👁 View</button>
        </div>
        {t.Resolution && (
          <div style={{ fontSize:11, color:C.green, marginTop:8, background:C.greenBg, borderRadius:7, padding:'6px 10px' }}>✅ {t.Resolution}</div>
        )}
      </div>
    )
  }

  const sectionComplaints = (
    <div>
      <div style={{ marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:C.purpleDark, margin:0 }}>📣 Support &amp; Complaints</h2>
          <p style={{ fontSize:12, color:C.slate, marginTop:3, marginBottom:0 }}>All tickets reviewed by MPCC support team · Click any ticket to view details &amp; add notes</p>
        </div>
        <button onClick={() => setShowComplaintModal(true)} style={{
          padding:'9px 18px', fontSize:12, fontWeight:700, border:'none', borderRadius:10, cursor:'pointer',
          background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', fontFamily:'inherit'
        }}>＋ New Complaint</button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[
          { lbl:'Total', val:tickets.length, bg:'#ede9fe', c:C.purple2 },
          { lbl:'Open', val:openTickets.length, bg:'#fef2f2', c:'#dc2626' },
          { lbl:'Resolved', val:resolvedTickets.length, bg:'#dcfce7', c:C.green },
        ].map(k => (
          <div key={k.lbl} style={{ background:k.bg, borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800, color:k.c }}>{k.val}</div>
            <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginTop:2 }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* All Tickets */}
      {tickets.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:C.slate, background:'#fff', borderRadius:16, fontSize:13 }}>
          No tickets raised yet. 🎉 Click "New Complaint" to get support.
        </div>
      ) : (
        <div>
          {openTickets.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:800, color:C.slate, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>⏳ Open / In Progress</div>
              {openTickets.map(t => <TicketCard key={t.TicketID} t={t} onView={openTicketDetail} />)}
            </div>
          )}
          {resolvedTickets.length > 0 && (
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:C.slate, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>✅ Resolved / Closed</div>
              {resolvedTickets.map(t => <TicketCard key={t.TicketID} t={t} onView={openTicketDetail} />)}
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {viewTicket && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,.25)' }}>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:'20px 20px 0 0', padding:'18px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:10, fontFamily:'monospace', color:'#94a3b8', marginBottom:4 }}>{viewTicket.TicketCode}</div>
                <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>{viewTicket.Subject || viewTicket.Category}</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{viewTicket.Category} · {viewTicket.Status}</div>
              </div>
              <button onClick={() => setViewTicket(null)} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'#fff', borderRadius:8, width:32, height:32, fontSize:16, cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:14 }}>
              {/* Details */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['Status', viewTicket.Status], ['Priority', viewTicket.Priority],
                  ['Assigned To', viewTicket.AssignedTo || 'Support Team'],
                  ['Raised On', viewTicket.CreatedAt ? new Date(viewTicket.CreatedAt).toLocaleDateString('en-IN') : '—'],
                ].map(([l,v]) => (
                  <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, textTransform:'uppercase' }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1e293b', marginTop:2 }}>{v||'—'}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:11, color:'#94a3b8', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>Description</div>
                <div style={{ fontSize:12, color:'#475569', background:'#f8fafc', borderRadius:8, padding:'10px 12px' }}>{viewTicket.Description||'—'}</div>
              </div>
              {viewTicket.Resolution && (
                <div style={{ background:C.greenBg, borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:11, color:C.green, fontWeight:700, marginBottom:4 }}>RESOLUTION</div>
                  <div style={{ fontSize:12, color:C.green }}>{viewTicket.Resolution}</div>
                </div>
              )}

              {/* Add Note */}
              <div style={{ background:C.purpleLighter, border:`1.5px solid ${C.purpleBorder}`, borderRadius:12, padding:14 }}>
                <div style={{ fontSize:12, fontWeight:800, color:C.purple2, marginBottom:10 }}>💬 Add Note / Follow-up</div>
                <textarea value={ticketNote} onChange={e => setTicketNote(e.target.value)}
                  placeholder="Add your note, additional info, or follow-up question..."
                  rows={3} style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'8px 10px', fontSize:12, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}
                />
                <button onClick={addTicketNote} disabled={savingNote || !ticketNote.trim()} style={{
                  marginTop:8, padding:'7px 18px', background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
                  color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700,
                  cursor: savingNote ? 'not-allowed' : 'pointer', opacity: savingNote ? .7 : 1, fontFamily:'inherit'
                }}>{savingNote ? '⏳ Sending...' : '📤 Send Note'}</button>
              </div>

              {/* History Timeline */}
              <div>
                <div style={{ fontSize:12, fontWeight:800, color:'#1e293b', marginBottom:12 }}>🕐 Update History</div>
                {loadingTicketHistory ? (
                  <div style={{ textAlign:'center', color:C.slate, padding:20, fontSize:12 }}>Loading...</div>
                ) : ticketHistory.length === 0 ? (
                  <div style={{ textAlign:'center', color:C.slate, fontSize:12, background:'#f8fafc', borderRadius:8, padding:16, border:`1.5px dashed ${C.border}` }}>No updates yet</div>
                ) : (
                  <div>
                    {ticketHistory.map((h, i) => {
                      const isAdmin = h.Source === 'Admin'
                      const statusChanged = h.OldStatus !== h.NewStatus
                      return (
                        <div key={h.UpdateID} style={{ display:'flex', gap:10, paddingBottom:12 }}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background: isAdmin ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : 'linear-gradient(135deg,#0891b2,#0e7490)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12 }}>
                              {isAdmin ? '👤' : '🏥'}
                            </div>
                            {i < ticketHistory.length-1 && <div style={{ width:2, flex:1, background:C.border, margin:'4px 0' }} />}
                          </div>
                          <div style={{ flex:1, paddingTop:3 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:3 }}>
                              <span style={{ fontSize:11, fontWeight:700, color:'#1e293b' }}>{h.UpdatedBy}</span>
                              <span style={{ fontSize:10, color:'#94a3b8' }}>{isAdmin ? '· Admin' : '· You'}</span>
                              {statusChanged && (
                                <span style={{ fontSize:10 }}>
                                  <span style={{ color:'#dc2626' }}>{h.OldStatus}</span>
                                  <span style={{ color:'#94a3b8', margin:'0 3px' }}>→</span>
                                  <span style={{ color:'#16a34a' }}>{h.NewStatus}</span>
                                </span>
                              )}
                            </div>
                            {h.Notes && <div style={{ fontSize:11, color:'#475569', background:'#f8fafc', borderRadius:6, padding:'5px 8px', marginBottom:3 }}>{h.Notes}</div>}
                            <div style={{ fontSize:10, color:'#94a3b8' }}>{h.CreatedAt ? new Date(h.CreatedAt).toLocaleString('en-IN') : ''}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // RENEWAL
  const sectionRenewal = (
    <div>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:18, fontWeight:800, color:C.purpleDark, margin:0}}>🔄 Renewal &amp; Compliance</h2>
        <p style={{fontSize:12, color:C.slate, marginTop:3, marginBottom:0}}>Plan management, compliance status, upgrades</p>
      </div>

      <div style={{
        background:'linear-gradient(135deg,#1e1b4b,#4c1d95)',
        borderRadius:16, padding:18, color:'#fff', marginBottom:14
      }}>
        <div style={{fontSize:11, opacity:.7, marginBottom:6}}>CURRENT PLAN</div>
        <div style={{fontSize:18, fontWeight:800, marginBottom:4}}>
          {user.SelectedPlan || 'Standard Plan'}
        </div>
        <div style={{fontSize:13, opacity:.8}}>Monthly Collection · Active Membership</div>
        <div style={{display:'flex', gap:10, marginTop:14, flexWrap:'wrap'}}>
          {[
            { label:'Valid Till', val:'11 Jan 2027' },
            { label:'Member Since', val: user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '12 Jan 2024' },
            { label:'Days Left', val:'249' },
          ].map((item, i) => (
            <div key={i} style={{background:'rgba(255,255,255,.12)', borderRadius:10, padding:'8px 12px', fontSize:11}}>
              <div style={{opacity:.7}}>{item.label}</div>
              <div style={{fontWeight:700, fontSize:13}}>{item.val}</div>
            </div>
          ))}
        </div>
        <button onClick={() => showToast('Plan upgrade request sent to MPCC team')} style={{
          marginTop:14, padding:'10px 18px', fontSize:13, fontWeight:700,
          background:'rgba(255,255,255,.2)', color:'#fff',
          border:'1.5px solid rgba(255,255,255,.3)', borderRadius:10,
          cursor:'pointer', fontFamily:'inherit'
        }}>🔄 Renew / Upgrade Plan</button>
      </div>

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)', marginBottom:14}}>
        <div style={{fontSize:14, fontWeight:800, color:C.purpleDark, marginBottom:14}}>⬆️ Upgrade Options</div>
        <div style={{background:'#f0fdf4', borderRadius:12, padding:14, border:`1.5px solid ${C.greenBorder}`}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:C.green}}>Premium Hospital Plan</div>
              <div style={{fontSize:11, color:C.slate, marginTop:3}}>Daily + Emergency pickup · Compliance support included</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:15, fontWeight:800, color:C.green}}>₹3,800</div>
              <div style={{fontSize:10, color:C.slate}}>/month + GST</div>
            </div>
          </div>
          <button onClick={() => showToast('Upgrade request sent to MPCC team')} style={{
            marginTop:10, padding:'7px 14px', fontSize:12, borderRadius:8,
            background:'#16a34a', color:'#fff', border:'none', cursor:'pointer',
            fontWeight:700, fontFamily:'inherit'
          }}>Request Upgrade</button>
        </div>
      </div>

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
        <div style={{fontSize:14, fontWeight:800, color:C.purpleDark}}>🏛️ Compliance Dashboard</div>
        <div style={{fontSize:11, color:C.slate, marginTop:2, marginBottom:14}}>MPCC manages your compliance — your status below</div>
        {[
          { icon:'🏛️', name:'PCB / BMW Authorization', status:'Expires: 31 Dec 2026 · Managed by MPCC', badge:'green', badgeText:'Valid' },
          { icon:'📋', name:'NOC — CMO / RO Consent', status:'Last renewed: 12 Jan 2024', badge:'green', badgeText:'Valid' },
          { icon:'📊', name:'Annual Return (CPCB)', status:'FY 2024-25 submitted · FY 2025-26 due Jun 2026', badge:'yellow', badgeText:'Due Soon' },
          { icon:'🪪', name:'MPCC Membership Certificate', status:'Valid till 11 Jan 2027', badge:'green', badgeText:'Valid' },
        ].map((c, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:12, padding:12,
            background:'#f8fafc', borderRadius:12, marginBottom:8,
            border:`1px solid ${C.border}`
          }}>
            <div style={{fontSize:22, flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12, fontWeight:700, color:C.text}}>{c.name}</div>
              <div style={{fontSize:11, color:C.slate, marginTop:2}}>{c.status}</div>
            </div>
            <Badge color={c.badge}>{c.badgeText}</Badge>
          </div>
        ))}
        <div style={{background:C.purpleLight, borderRadius:10, padding:'10px 12px', marginTop:8, fontSize:11, color:C.purple2, fontWeight:600}}>
          🎯 MPCC takes care of your compliance renewals — you&apos;ll be notified before any expiry.
        </div>
      </div>
    </div>
  )

  // COMPLAINT MODAL
  const complaintCategories = [
    { id:'Bill Not Received',    icon:'🧾', label:'Bill Not Received' },
    { id:"Vehicle Didn't Come", icon:'🚛', label:"Vehicle Didn't Come" },
    { id:'Kit Replacement',      icon:'📦', label:'Kit Replacement' },
    { id:'Extra Pickup',         icon:'➕', label:'Extra Pickup' },
    { id:'Training Request',     icon:'🎓', label:'Training Request' },
    { id:'Other Issue',          icon:'💬', label:'Other Issue' },
  ]

  const complaintModal = showComplaintModal && (
    <div
      style={{
        position:'fixed', inset:0, background:'rgba(15,23,42,.6)',
        zIndex:500, display:'flex',
        alignItems: isDesktop ? 'center' : 'flex-end', justifyContent:'center',
        padding:0
      }}
      onClick={e => { if(e.target === e.currentTarget) setShowComplaintModal(false) }}
    >
      <div style={{
        background:'#fff',
        borderRadius: isDesktop ? 20 : '24px 24px 0 0',
        width:'100%', maxWidth: isDesktop ? 560 : 480,
        maxHeight:'90vh', overflowY:'auto', padding:20,
        boxShadow:'0 -8px 40px rgba(0,0,0,.15)'
      }}>
        {!isDesktop && <div style={{width:40, height:4, background:C.border, borderRadius:2, margin:'0 auto 16px'}}/>}
        <div style={{fontSize:16, fontWeight:800, color:C.purpleDark, marginBottom:16}}>📣 Raise a Complaint / Request</div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:8}}>Select Category</div>
          <div style={{display:'grid', gridTemplateColumns: isDesktop ? 'repeat(3,1fr)' : '1fr 1fr', gap:10}}>
            {complaintCategories.map(ct => (
              <div key={ct.id} onClick={() => setComplaintType(ct.id)} style={{
                background: complaintType===ct.id ? C.purpleLight : '#f8fafc',
                borderRadius:12, padding:14,
                border:`1.5px solid ${complaintType===ct.id ? C.purple3 : C.border}`,
                cursor:'pointer', textAlign:'center', transition:'all .15s'
              }}>
                <div style={{fontSize:24, marginBottom:6}}>{ct.icon}</div>
                <div style={{fontSize:11, fontWeight:700, color:'#374151'}}>{ct.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <label style={{fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6}}>Describe your issue</label>
          <textarea
            style={{
              width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
              padding:'10px 12px', fontSize:13, outline:'none', resize:'vertical',
              boxSizing:'border-box', fontFamily:'inherit'
            }}
            rows={3} placeholder="Please describe the issue in detail..."
            value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)}
          />
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6}}>Preferred Callback Date (optional)</label>
          <input
            type="date"
            style={{width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10, padding:'10px 12px', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit'}}
            value={complaintDate} onChange={e => setComplaintDate(e.target.value)}
          />
        </div>
        <div style={{background:C.purpleLight, borderRadius:10, padding:'10px 12px', marginBottom:14, fontSize:11, color:C.purple2, fontWeight:600}}>
          ⚡ SLA: Vehicle issues — 24 hrs · Billing — 48 hrs · Kit replacement — 72 hrs
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={() => setShowComplaintModal(false)} style={{
            flex:1, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer',
            background:C.purpleLighter, border:`1.5px solid ${C.purpleBorder}`,
            color:C.purple2, borderRadius:10, fontFamily:'inherit'
          }}>Cancel</button>
          <button onClick={submitComplaint} disabled={submittingTicket} style={{
            flex:2, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer',
            background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff',
            border:'none', borderRadius:10, opacity: submittingTicket ? .7 : 1, fontFamily:'inherit'
          }}>{submittingTicket ? 'Submitting...' : '📣 Submit Complaint'}</button>
        </div>
      </div>
    </div>
  )

  // COMPANY PROFILE SECTION
  const sectionProfile = (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:C.purpleDark, margin:0 }}>🏢 My Company Profile</h2>
        <p style={{ fontSize:12, color:C.slate, marginTop:3, marginBottom:0 }}>Update your company details — changes are reflected in admin panel in real-time</p>
      </div>

      {/* Registration details (read-only) */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#3730a3)', borderRadius:16, padding:20, color:'#fff', marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', opacity:.7, marginBottom:12 }}>Registration Info (Read-only)</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
          {[
            ['Member ID',      fullProfile.CustomerID || fullProfile.RegistrationCode || fullProfile.CustomerID],
            ['Institution',    fullProfile.InstitutionName],
            ['Category',       fullProfile.Category || fullProfile.InstitutionType],
            ['Sub-Category',   fullProfile.SubCategory],
            ['Zone',           fullProfile.Zone],
            ['Route',          fullProfile.Route],
            ['Service Plan',   fullProfile.SelectedPlan],
            ['Mobile',         fullProfile.Mobile],
            ['Email',          fullProfile.Email],
            ['BMW Reg No',     fullProfile.BMWRegNo],
            ['Status',         fullProfile.Status],
            ['Reg Date',       fullProfile.RegistrationDate ? new Date(fullProfile.RegistrationDate).toLocaleDateString('en-IN') : fullProfile.CreatedAt ? new Date(fullProfile.CreatedAt).toLocaleDateString('en-IN') : '—'],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize:10, opacity:.7, marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:13, fontWeight:700 }}>{val || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable fields */}
      <div style={{ background:'#fff', borderRadius:16, padding:20, border:`1.5px solid ${C.border}`, marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.purpleDark, marginBottom:16 }}>📝 Update Details</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
          {[
            { key:'FullAddress',     label:'Full Address',        placeholder:'Near Clock Tower, Haridwar' },
            { key:'Pincode',         label:'Pincode',             placeholder:'249407' },
            { key:'PANNumber',       label:'PAN Number',          placeholder:'ABCDE1234F' },
            { key:'GSTNumber',       label:'GST Number',          placeholder:'09ABCDE1234F1Z5' },
            { key:'BMWRegNo',        label:'BMW Reg No',          placeholder:'UK-BMW-2024-0001' },
            { key:'NumberOfBeds',    label:'Number of Beds',      placeholder:'120', type:'number' },
            { key:'ContactPerson',   label:'Primary Contact Name', placeholder:'Dr. Ramesh Kumar' },
            { key:'Designation',     label:'Designation',         placeholder:'Director' },
            { key:'AlternateMobile', label:'Alternate Mobile',    placeholder:'98765-00000' },
            { key:'Website',         label:'Website',             placeholder:'https://hospital.com' },
            { key:'GPSLatitude',     label:'GPS Latitude',        placeholder:'29.9457' },
            { key:'GPSLongitude',    label:'GPS Longitude',       placeholder:'78.1642' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>{f.label}</label>
              <input
                type={f.type || 'text'}
                value={profileForm[f.key] || ''}
                onChange={e => setProfileForm(p => ({...p, [f.key]: e.target.value}))}
                placeholder={f.placeholder}
                style={{
                  width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8,
                  padding:'9px 12px', fontSize:13, color:C.text, outline:'none',
                  boxSizing:'border-box', fontFamily:'inherit'
                }}
              />
            </div>
          ))}
        </div>

        {/* Remarks */}
        <div style={{ marginTop:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>Remarks / Reason for Update</label>
          <textarea
            value={profileForm.remarks || ''}
            onChange={e => setProfileForm(p => ({...p, remarks: e.target.value}))}
            placeholder="E.g. Updated new address after relocation"
            rows={2}
            style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:13, color:C.text, outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'inherit' }}
          />
        </div>

        {/* Attachment */}
        <div style={{ marginTop:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>Supporting Document (optional)</label>
          <label style={{
            display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer',
            background:C.purpleLighter, border:`1.5px dashed ${C.purpleBorder}`, borderRadius:8,
            padding:'8px 16px', fontSize:12, fontWeight:600, color:C.purple2
          }}>
            📎 {profileAttachment ? profileAttachment.name : 'Attach file (PDF/JPG/PNG)'}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }}
              onChange={e => setProfileAttachment(e.target.files[0] || null)} />
          </label>
          {profileAttachment && (
            <button onClick={() => setProfileAttachment(null)} style={{ marginLeft:8, background:'none', border:'none', color:C.red, cursor:'pointer', fontSize:12 }}>✕ Remove</button>
          )}
        </div>

        <button onClick={saveProfile} disabled={savingProfile} style={{
          marginTop:20, padding:'10px 28px', background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
          color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700,
          cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? .7 : 1,
          fontFamily:'inherit'
        }}>{savingProfile ? '⏳ Saving...' : '💾 Save Profile'}</button>
      </div>

      {/* Contact Persons */}
      <div style={{ background:'#fff', borderRadius:16, padding:20, border:`1.5px solid ${C.border}`, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.purpleDark }}>👤 Contact Persons</div>
          <button onClick={() => setShowAddContactModal(true)} style={{
            background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:'none',
            borderRadius:8, padding:'6px 14px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit'
          }}>+ Add Contact</button>
        </div>
        {contacts.length === 0 ? (
          <div style={{ textAlign:'center', color:C.slate, padding:'20px 0', fontSize:12 }}>No contacts added yet</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
            {contacts.map(c => {
              const initials = (c.ContactName || '?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
              const cols = [C.purple2, C.blue, '#0891b2', C.green]
              const col = cols[c.ContactID % cols.length]
              return (
                <div key={c.ContactID} style={{ border:`1.5px solid ${C.border}`, borderRadius:12, padding:14, position:'relative' }}>
                  <button onClick={() => deleteContact(c.ContactID)} style={{
                    position:'absolute', top:8, right:8, background:C.redBg, color:C.red,
                    border:'none', borderRadius:5, width:24, height:24, fontSize:11, cursor:'pointer', fontWeight:700
                  }}>✕</button>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${col},${col}cc)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15 }}>{initials}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.purpleDark }}>{c.ContactName}</div>
                      <div style={{ fontSize:11, color:C.slate }}>{c.Designation || ''}</div>
                      {c.IsPrimary && <span style={{ fontSize:10, fontWeight:700, background:'#dbeafe', color:'#1d4ed8', padding:'1px 7px', borderRadius:20 }}>Primary</span>}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:C.slate }}>📱 {c.Mobile || '—'}</div>
                  <div style={{ fontSize:11, color:C.slate }}>✉️ {c.Email || '—'}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Update History */}
      <div style={{ background:'#fff', borderRadius:16, padding:20, border:`1.5px solid ${C.border}` }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.purpleDark, marginBottom:16 }}>🕐 Update History</div>
        {profileHistory.length === 0 ? (
          <div style={{ textAlign:'center', color:C.slate, padding:'20px 0', fontSize:12 }}>No updates recorded yet</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {profileHistory.map((h, i) => (
              <div key={h.HistoryID} style={{ display:'flex', gap:14, paddingBottom:16 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:10, height:10, background:C.purple3, borderRadius:'50%', flexShrink:0, marginTop:3 }} />
                  {i < profileHistory.length-1 && <div style={{ width:2, flex:1, background:C.border, margin:'4px 0' }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.purpleDark }}>{h.FieldChanged}</div>
                  <div style={{ fontSize:11, color:C.slate, marginTop:1 }}>{h.Remarks}</div>
                  <div style={{ fontSize:10, color:C.slateLight, marginTop:2 }}>{h.CreatedAt ? new Date(h.CreatedAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}</div>
                  {h.AttachmentPath && (
                    <a href={h.AttachmentPath} target="_blank" rel="noreferrer" style={{ fontSize:10, color:C.purple2, fontWeight:600 }}>📎 {h.AttachmentName || 'Attachment'}</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:420, boxShadow:'0 24px 60px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.purpleDark, marginBottom:20 }}>Add Contact Person</div>
            {[
              { key:'contactName', label:'Name *', placeholder:'Dr. Ramesh Kumar' },
              { key:'designation', label:'Designation', placeholder:'Director' },
              { key:'mobile',      label:'Mobile *', placeholder:'98765-43210' },
              { key:'email',       label:'Email', placeholder:'dr@hospital.com' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:700, color:'#374151', display:'block', marginBottom:5 }}>{f.label}</label>
                <input value={newContact[f.key] || ''} onChange={e => setNewContact(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:8, padding:'9px 12px', fontSize:13, boxSizing:'border-box', fontFamily:'inherit' }}
                />
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <input type="checkbox" id="portalIsPrimary" checked={newContact.isPrimary}
                onChange={e => setNewContact(p=>({...p,isPrimary:e.target.checked}))} />
              <label htmlFor="portalIsPrimary" style={{ fontSize:12, fontWeight:600 }}>Mark as Primary Contact</label>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowAddContactModal(false)} style={{ flex:1, padding:'10px 0', background:'#f1f5f9', color:C.slate, border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={addContact} disabled={savingContact} style={{ flex:1, padding:'10px 0', background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{savingContact ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // TOAST
  const toastEl = toast && (
    <div style={{
      position:'fixed', bottom: isDesktop ? 24 : 74, left:'50%', transform:'translateX(-50%)',
      background:'#1e1b4b', color:'#fff', borderRadius:12, padding:'10px 20px',
      fontSize:13, fontWeight:600, zIndex:9999, pointerEvents:'none', whiteSpace:'nowrap',
      boxShadow:'0 8px 24px rgba(0,0,0,.2)'
    }}>{toast}</div>
  )

  const sections = {
    dashboard:  sectionDashboard,
    profile:    sectionProfile,
    pickups:    sectionPickups,
    bills:      sectionBills,
    certs:      sectionCerts,
    complaints: sectionComplaints,
    renewal:    sectionRenewal,
  }

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif", background:'#f5f3ff', color:C.text, minHeight:'100vh'}}>
      {topNav}
      {sidebar}
      <div style={{
        marginTop:60,
        marginBottom: isDesktop ? 0 : 62,
        marginLeft: isDesktop ? 230 : 0,
        padding: isDesktop ? '28px 36px' : 16,
        minHeight: isDesktop ? 'calc(100vh - 60px)' : 'calc(100vh - 122px)',
        background:'#f5f3ff', boxSizing:'border-box'
      }}>
        {sections[activeSection] || sectionDashboard}
      </div>
      {bottomNav}
      {complaintModal}
      {toastEl}
    </div>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function CustomerPortal() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('portalUser')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  function handleLogin(customer) { setUser(customer) }
  function handleLogout() {
    localStorage.removeItem('portalUser')
    setUser(null)
  }

  if (!user) return <LoginView onLogin={handleLogin} />
  return <PortalView user={user} onLogout={handleLogout} />
}
