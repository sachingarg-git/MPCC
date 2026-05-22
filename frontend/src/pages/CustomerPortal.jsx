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
  const [activeTab, setActiveTab] = useState('password')
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

  const tabs = [
    { id: 'otp',      label: '📱 OTP Login' },
    { id: 'email',    label: '📧 Email' },
    { id: 'password', label: '🔐 Password' },
  ]

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
        <div style={{textAlign:'center', marginBottom:28}}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize:32, marginBottom:12,
            boxShadow:'0 8px 24px rgba(91,33,182,.4)'
          }}>🏥</div>
          <h1 style={{fontSize:20, fontWeight:800, color:C.purpleDark, margin:0}}>MPCC Member Portal</h1>
          <p style={{fontSize:12, color:C.slate, marginTop:4, margin:'4px 0 0'}}>Biomedical Waste Management · Self Service</p>
        </div>

        <div style={{
          display:'flex', background:C.slateBg, borderRadius:12,
          padding:4, marginBottom:24
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex:1, padding:9, textAlign:'center', fontSize:12,
              fontWeight: activeTab===t.id ? 700 : 600,
              color: activeTab===t.id ? C.purple2 : C.slate,
              borderRadius:8, cursor:'pointer', border:'none',
              background: activeTab===t.id ? '#fff' : 'transparent',
              boxShadow: activeTab===t.id ? '0 2px 8px rgba(0,0,0,.1)' : 'none',
              transition:'all .2s', fontFamily:'inherit'
            }}>{t.label}</button>
          ))}
        </div>

        {activeTab === 'otp' && (
          <div>
            <label style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, display:'block'}}>Registered Mobile Number</label>
            <div style={{position:'relative', marginBottom:14}}>
              <input style={{
                width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
                padding:'11px 100px 11px 14px', fontSize:14, color:C.text, outline:'none',
                boxSizing:'border-box', fontFamily:'inherit'
              }} type="tel" placeholder="10-digit mobile number" maxLength={10} />
              <button style={{
                position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
                background:C.purple2, color:'#fff', border:'none', borderRadius:7,
                padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit'
              }}>Send OTP</button>
            </div>
            <div style={{textAlign:'center', fontSize:12, color:C.slate, padding:'20px 0'}}>
              OTP login coming soon. Use Password tab to login.
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div>
            <label style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, display:'block'}}>Registered Email Address</label>
            <input style={{
              width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
              padding:'11px 14px', fontSize:14, color:C.text, outline:'none',
              marginBottom:14, boxSizing:'border-box', fontFamily:'inherit'
            }} type="email" placeholder="your@hospital.com" />
            <div style={{textAlign:'center', fontSize:12, color:C.slate, padding:'20px 0'}}>
              Email OTP login coming soon. Use Password tab to login.
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleLogin}>
            <label style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, display:'block'}}>Member ID</label>
            <input
              style={{
                width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
                padding:'11px 14px', fontSize:14, color:C.text, outline:'none',
                marginBottom:14, boxSizing:'border-box', transition:'border-color .2s', fontFamily:'inherit'
              }}
              type="text" placeholder="e.g. MPCC-UK-0001"
              value={customerId} onChange={e => setCustomerId(e.target.value)}
            />
            <label style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, display:'block'}}>6-Digit PIN</label>
            <input
              style={{
                width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10,
                padding:'11px 14px', fontSize:14, color:C.text, outline:'none',
                marginBottom:14, boxSizing:'border-box', transition:'border-color .2s',
                letterSpacing:4, fontFamily:'inherit'
              }}
              type="password" placeholder="● ● ● ● ● ●"
              maxLength={6} value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g,''))}
            />
            {error && (
              <div style={{
                background:C.redBg, border:`1.5px solid ${C.redBorder}`, borderRadius:10,
                padding:'10px 14px', fontSize:12, color:C.red, marginBottom:14, fontWeight:600
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
        )}

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

// ─── PORTAL VIEW ──────────────────────────────────────────────────────────────
function PortalView({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [pickups, setPickups] = useState([])
  const [bills, setBills] = useState([])
  const [tickets, setTickets] = useState([])
  const [pickupFilter, setPickupFilter] = useState('all')
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [complaintType, setComplaintType] = useState(null)
  const [complaintDesc, setComplaintDesc] = useState('')
  const [complaintDate, setComplaintDate] = useState('')
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [toast, setToast] = useState(null)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900)

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const id = user.RegistrationID
    fetch(`/api/portal/pickups/${id}`).then(r => r.json()).then(d => setPickups(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/bills/${id}`).then(r => r.json()).then(d => setBills(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`/api/portal/tickets/${id}`).then(r => r.json()).then(d => setTickets(Array.isArray(d) ? d : [])).catch(() => {})
  }, [user.RegistrationID])

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

  // CERTIFICATES
  const certs = [
    { icon:'🏅', name:'MPCC Membership Certificate', meta:`Valid: 12 Jan 2024 – 11 Jan 2027 · Cert No: MPCC-UK-CERT-${String(user.RegistrationID||1).padStart(4,'0')}`, badge:'green', badgeText:'Valid' },
    { icon:'📋', name:'BMW Manifest Summary (Annual)', meta:'FY 2025-26 · Total: 198 kg · 47 visits', badge:'blue', badgeText:'Annual Report' },
    { icon:'📝', name:'MoU Copy', meta:'Signed: 12 Jan 2024 · Valid till: 11 Jan 2027', badge:'green', badgeText:'Active' },
    { icon:'📊', name:'Annual Return Extract (CPCB)', meta:'FY 2024-25 · Submitted to CPCB', badge:'purple', badgeText:'Compliance' },
  ]

  const sectionCerts = (
    <div>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:18, fontWeight:800, color:C.purpleDark, margin:0}}>📄 My Certificates &amp; Documents</h2>
        <p style={{fontSize:12, color:C.slate, marginTop:3, marginBottom:0}}>Membership cert, manifests, MoU, annual return</p>
      </div>
      {certs.map((c, i) => (
        <div key={i} style={{
          background:'linear-gradient(135deg,#f5f3ff,#ede9fe)',
          borderRadius:14, padding:16, border:`1.5px solid ${C.purpleBorder}`,
          marginBottom:10, display:'flex', alignItems:'center', gap:14
        }}>
          <div style={{
            width:48, height:48, borderRadius:12, flexShrink:0,
            background:'linear-gradient(135deg,#5b21b6,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22
          }}>{c.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:700, color:C.purpleDark}}>{c.name}</div>
            <div style={{fontSize:11, color:C.slate, marginTop:3}}>{c.meta}</div>
            <div style={{marginTop:6}}><Badge color={c.badge}>{c.badgeText}</Badge></div>
          </div>
          <button onClick={() => showToast('Document download coming soon')} style={{
            background:C.purple2, color:'#fff', border:'none', borderRadius:8,
            padding:'7px 12px', fontSize:11, fontWeight:700, cursor:'pointer',
            whiteSpace:'nowrap', fontFamily:'inherit'
          }}>📥 PDF</button>
        </div>
      ))}
    </div>
  )

  // SUPPORT
  const sectionComplaints = (
    <div>
      <div style={{marginBottom:16}}>
        <h2 style={{fontSize:18, fontWeight:800, color:C.purpleDark, margin:0}}>📣 Support &amp; Complaints</h2>
        <p style={{fontSize:12, color:C.slate, marginTop:3, marginBottom:0}}>All tickets are reviewed by MPCC support team within 24 hours</p>
      </div>

      <button onClick={() => setShowComplaintModal(true)} style={{
        width:'100%', marginBottom:14, padding:'10px 18px', fontSize:13,
        fontWeight:700, border:'none', borderRadius:10, cursor:'pointer',
        background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff',
        boxShadow:'0 4px 12px rgba(91,33,182,.3)', fontFamily:'inherit'
      }}>＋ Raise New Complaint / Request</button>

      <div style={{
        background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:14,
        padding:'14px 16px', marginBottom:14, display:'flex',
        alignItems:'center', gap:12, flexWrap:'wrap'
      }}>
        <div style={{fontSize:20}}>🎧</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12, fontWeight:700, color:'#fff', marginBottom:2}}>MPCC Customer Support</div>
          <div style={{fontSize:11, color:'#94a3b8'}}>All tickets handled by MPCC Haridwar support team · Response within 24h</div>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {[{val:'24h', lbl:'SLA', color:'#22d3ee'}, {val:'92%', lbl:'On-Time', color:'#22c55e'}].map((s,i) => (
            <div key={i} style={{background:'rgba(255,255,255,.1)', borderRadius:8, padding:'6px 10px', textAlign:'center'}}>
              <div style={{fontSize:14, fontWeight:800, color:s.color}}>{s.val}</div>
              <div style={{fontSize:9, color:'#94a3b8', fontWeight:600}}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)', marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
          <div style={{fontSize:14, fontWeight:800, color:C.purpleDark}}>⏳ Open / Active</div>
          <span style={{background:'#fef2f2', color:C.red, border:`1px solid #fecaca`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700}}>
            {openTickets.length} Open
          </span>
        </div>
        {openTickets.length > 0 ? openTickets.map((t, i) => (
          <div key={i} style={{borderRadius:10, overflow:'hidden', marginBottom:8, border:`1px solid ${C.border}`, padding:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                  <span style={{fontSize:10, fontWeight:700, color:'#0e7490', fontFamily:'monospace', background:'#ecfeff', borderRadius:4, padding:'1px 6px'}}>
                    {t.TicketCode || `TKT-${t.TicketID}`}
                  </span>
                  <span style={{background:'#fff7ed', color:'#ea580c', border:'1px solid #fdba74', borderRadius:20, padding:'1px 8px', fontSize:10, fontWeight:700}}>
                    {t.Priority || 'Medium'}
                  </span>
                </div>
                <div style={{fontSize:13, fontWeight:700, color:C.text}}>{t.Subject || t.Category}</div>
                <div style={{fontSize:11, color:C.slate, marginTop:3}}>
                  {t.Category} · Raised: {t.CreatedAt ? new Date(t.CreatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : 'N/A'}
                </div>
                {t.AssignedTo && <div style={{fontSize:11, color:C.slate}}>👤 Assigned: {t.AssignedTo}</div>}
              </div>
              <Badge color="yellow">{t.Status}</Badge>
            </div>
          </div>
        )) : (
          <div style={{textAlign:'center', padding:20, color:C.slate, fontSize:12}}>No open tickets. 🎉</div>
        )}
      </div>

      <div style={{background:'#fff', borderRadius:16, padding:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
          <div style={{fontSize:14, fontWeight:800, color:C.purpleDark}}>✅ Resolved / Closed</div>
          <span style={{background:'#f0fdf4', color:C.green, border:`1px solid #bbf7d0`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700}}>
            {resolvedTickets.length} Resolved
          </span>
        </div>
        {resolvedTickets.length > 0 ? resolvedTickets.map((t, i) => (
          <div key={i} style={{padding:12, border:`1px solid ${C.border}`, borderRadius:10, marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:3}}>
                  <span style={{fontSize:10, fontWeight:700, color:'#0e7490', fontFamily:'monospace', background:'#ecfeff', borderRadius:4, padding:'1px 6px'}}>
                    {t.TicketCode || `TKT-${t.TicketID}`}
                  </span>
                </div>
                <div style={{fontSize:13, fontWeight:700, color:C.text}}>{t.Subject || t.Category}</div>
                <div style={{fontSize:11, color:C.slate, marginTop:3}}>
                  {t.Category} · Raised: {t.CreatedAt ? new Date(t.CreatedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : 'N/A'}
                </div>
              </div>
              <Badge color="green">{t.Status}</Badge>
            </div>
            {t.Resolution && (
              <div style={{fontSize:11, color:C.slate, marginTop:5, background:'#f0fdf4', borderRadius:8, padding:'7px 10px'}}>
                ✅ {t.Resolution}
              </div>
            )}
          </div>
        )) : (
          <div style={{textAlign:'center', padding:20, color:C.slate, fontSize:12}}>No resolved tickets yet.</div>
        )}
      </div>
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
