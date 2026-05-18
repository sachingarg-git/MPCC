import { useState, useEffect } from 'react'
import '../assets/landing.css'

const MPCC_RATE_CHART = [
  { code:'R01', name:'Hospital 1–10 beds', unit:'per month', rate:2500 },
  { code:'R02', name:'Hospital 11–20 beds', unit:'per month', rate:3500 },
  { code:'R03', name:'Hospital 21+ beds', unit:'per bed/day×30', rate:7, perBed:true },
  { code:'R04', name:'Pathology Lab', unit:'per month', rate:1500 },
  { code:'R05', name:'Diagnostic Centre', unit:'per month', rate:2000 },
  { code:'R06', name:'General Clinic', unit:'per month', rate:550 },
  { code:'R07', name:'Polyclinic', unit:'per month', rate:1200 },
  { code:'R08', name:'Dental Clinic', unit:'per chair/month', rate:300 },
  { code:'R09', name:'Veterinary Clinic', unit:'per month', rate:800 },
  { code:'R10', name:'Veterinary Hospital', unit:'per month', rate:1500 },
  { code:'R11', name:'Blood Bank', unit:'per month', rate:5000 },
  { code:'R12', name:'School / Inst. Clinic', unit:'per month', rate:600 },
  { code:'R13', name:'Pharma Company', unit:'per month', rate:3000 },
  { code:'R14', name:'Medical Store', unit:'per month', rate:550 },
  { code:'R15', name:'Health Camp (single)', unit:'per camp', rate:2000 },
  { code:'R16', name:'Nursing Home <10 beds', unit:'per month', rate:2500 },
  { code:'R17', name:'Nursing Home 11–20', unit:'per month', rate:3500 },
  { code:'R18', name:'Nursing Home 21+', unit:'per bed/day×30', rate:7, perBed:true },
  { code:'R19', name:'Research Lab', unit:'per month', rate:4000 },
]

const SUB_DATA = {
  hosp:   ['Govt. Hospital','Private Hospital','Nursing Home','Maternity Centre','Orthopaedic Centre','Eye Hospital','ENT Hospital','Multispecialty'],
  path:   ['Pathology Lab','Diagnostic Centre','X-Ray Centre','Ultrasound Centre','MRI / CT Centre','Blood Testing Lab'],
  clinic: ['General Clinic','Polyclinic','Ayurveda Clinic','Homeopathic Clinic','Physiotherapy Centre','Cosmetic Clinic'],
  dental: ['Single Chair','2–5 Chairs','6–10 Chairs','>10 Chairs'],
  vet:    ['Veterinary Clinic','Veterinary Hospital','Pet Clinic','Animal Shelter'],
  blood:  ['Blood Bank'],
  inst:   ['School Health Clinic','College Medical Centre','Corporate Clinic'],
  pharma: ['Pharma Company','Manufacturing Unit'],
  medstore:['Medical Store / Pharmacy'],
  camp:   ['Health Camp (one-day)','Health Camp (multi-day)'],
}

const PLAN_SUGGESTIONS = {
  hosp:'R01', path:'R04', clinic:'R06', dental:'R08', vet:'R09',
  blood:'R11', inst:'R12', pharma:'R13', medstore:'R14', camp:'R15',
}

function fmt(n){ return '₹'+n.toLocaleString('en-IN') }

function calcBedFee(beds){
  if(beds<=0) return 0
  if(beds<=10) return 2500
  if(beds<=20) return 3500
  return beds*7*30
}

export default function LandingPage(){
  // Landing form
  const [instName, setInstName] = useState('')
  const [mobile, setMobile]     = useState('')
  const [email, setEmail]       = useState('')
  const [zone, setZone]         = useState('')
  const [route, setRoute]       = useState('')

  // View: 'landing' | 'wizard' | 'thankyou'
  const [view, setView] = useState('landing')
  const [step, setStep] = useState(1)
  const [s3tab, setS3tab] = useState('plan')

  // Wizard selections
  const [cat, setCat]       = useState(null) // {label, key}
  const [subCat, setSubCat] = useState(null)
  const [planCode, setPlan] = useState(null)
  const [beds, setBeds]     = useState(0)
  const [kit, setKit]       = useState({name:'Small Kit', price:1397})
  const [consulting, setConsulting] = useState(false)
  const [compliance, setCompliance] = useState(false)
  const [tcChecked, setTcChecked]   = useState(false)
  const [tcOpen, setTcOpen]         = useState(false)

  // Payment modal
  const [payOpen, setPayOpen]   = useState(false)
  const [payTab, setPayTab]     = useState('upi')
  const [chqNo, setChqNo]       = useState('')
  const [chqBank, setChqBank]   = useState('')
  const [chqDate, setChqDate]   = useState('')
  const [chqBranch, setChqBranch] = useState('')
  const [chqIfsc, setChqIfsc]   = useState('')

  // Thank-you
  const [tyData, setTyData] = useState(null)

  const sugPlanCode = cat ? PLAN_SUGGESTIONS[cat.key] : null
  const sugPlan = sugPlanCode ? MPCC_RATE_CHART.find(r=>r.code===sugPlanCode) : null
  const selPlan = planCode ? MPCC_RATE_CHART.find(r=>r.code===planCode) : sugPlan

  function getRegFee(){
    if(!selPlan) return 2500
    if(selPlan.rate >= 5000) return 5000
    if(selPlan.rate >= 2000) return 3500
    return 2500
  }
  function getSvcFee(){
    if(!selPlan) return 0
    if(selPlan.perBed) return calcBedFee(beds)
    return selPlan.rate
  }
  function calcTotal(){
    const reg = getRegFee()
    const svc = getSvcFee()
    const kitP = kit.price
    const con = consulting ? 2000 : 0
    const com = compliance ? 2000 : 0
    const sub = reg + svc + kitP + con + com
    const cgst = Math.round(sub * 0.09)
    const sgst = cgst
    return { reg, svc, kitP, con, com, sub, cgst, sgst, total: sub+cgst+sgst }
  }
  const totals = calcTotal()

  function startWizard(e){
    e.preventDefault()
    if(!instName||!mobile||!email||!zone||!route) return
    setView('wizard'); setStep(1)
  }

  function wizNext(){
    if(step===1 && !cat) return
    if(step===2 && !subCat) return
    if(step===4){ setPayOpen(true); return }
    setStep(s=>s+1)
  }
  function wizBack(){
    if(step===1){ setView('landing'); return }
    setStep(s=>s-1)
  }

  function stepLabel(){
    if(step===4) return 'Proceed to Pay'
    return 'Continue'
  }
  function canNext(){
    if(step===1) return !!cat
    if(step===2) return !!subCat
    if(step===3) return true
    if(step===4) return tcChecked
    return false
  }

  function selectCategory(label, key){
    setCat({label,key}); setSubCat(null); setPlan(null)
  }
  function selectSubCat(label){ setSubCat(label) }

  function simulatePay(){
    const num = Math.floor(10000+Math.random()*90000)
    const tid = Math.floor(100000000+Math.random()*900000000)
    setPayOpen(false)
    const cid = `MPCC-2026-${String(num).padStart(5,'0')}`
    const uname = `mpcc_user_${String(num).padStart(5,'0')}`
    const pass = `Mpcc@${new Date().getFullYear()}!`
    const data = {
      instName,mobile,email,zone,route,
      cat:cat?.label,subCat,plan:selPlan?.name,kit:kit.name,beds,
      consulting,compliance,
      regFee:totals.reg,svcFee:totals.svc,total:totals.total,
      txnId:`TXN${tid}`,cid,uname,pass,
      payMode:payTab,ts:new Date().toISOString(),
    }
    try{ localStorage.setItem('mpcc_reg_'+Date.now(), JSON.stringify(data)) }catch(e){}
    setTyData(data); setView('thankyou')
  }
  function submitChequePayment(){
    if(!chqNo||!chqBank||!chqDate){ alert('Please fill all required cheque fields.'); return }
    simulatePay()
  }

  // ─── Landing View ───────────────────────────────────
  if(view==='landing') return (
    <div className="min-h-screen hero-bg flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">M</div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MPCC</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Home</a>
              <a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">About</a>
              <a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-2">
              <a href="/admin" style={{display:'inline-flex',alignItems:'center',gap:'5px',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'#fff',fontSize:'12px',fontWeight:'700',padding:'7px 14px',borderRadius:'10px',textDecoration:'none',boxShadow:'0 2px 8px rgba(91,33,182,.25)'}}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Customer Portal
              </a>
              <a href="/admin" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:shadow-lg transition-all cursor-pointer">Admin Login</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Government Registered Facility
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-3">
                Professional biomedical waste
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent block">management services</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                Trusted by <strong className="text-slate-700">500+ healthcare institutions</strong> across Uttarakhand for safe, compliant, and reliable biomedical waste disposal.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white rounded-xl shadow p-3 text-center"><div className="text-xl font-black text-blue-600">500<span className="text-blue-400">+</span></div><div className="text-xs text-slate-400 font-medium mt-0.5">Clients</div></div>
                <div className="bg-white rounded-xl shadow p-3 text-center"><div className="text-xl font-black text-orange-500">4.8<span className="text-orange-400 text-sm">/5</span></div><div className="text-xs text-slate-400 font-medium mt-0.5">Rating</div></div>
                <div className="bg-white rounded-xl shadow p-3 text-center"><div className="text-xl font-black text-emerald-600">10<span className="text-emerald-400">+</span></div><div className="text-xs text-slate-400 font-medium mt-0.5">Years</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">✓ 100% Compliant</span>
                <span className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">⟳ 24/7 Support</span>
                <span className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">★ Govt. Registered</span>
                <span className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">♻ Eco Friendly</span>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100" style={{boxShadow:'0 20px 50px rgba(37,99,235,.12)'}}>
                <div className="wizard-banner px-5 py-2.5 flex items-center justify-center gap-5 flex-wrap">
                  <span className="text-white text-xs font-semibold">✓ Safe Disposal</span>
                  <span className="text-white text-xs font-semibold">✓ Free Pickup</span>
                  <span className="text-white text-xs font-semibold">✓ Compliance</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 text-center mb-0.5">Get Started with MPCC</h2>
                  <p className="text-slate-400 text-xs text-center mb-4">Quick &amp; easy registration</p>
                  <form onSubmit={startWizard}>
                    <div className="mb-3">
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Institution Name *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </span>
                        <input value={instName} onChange={e=>setInstName(e.target.value)} type="text" required placeholder="Enter institution name" className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Mobile *</label>
                        <input value={mobile} onChange={e=>setMobile(e.target.value)} type="tel" required placeholder="Mobile number" className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"/>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Email *</label>
                        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="Email address" className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Zone *</label>
                        <select value={zone} onChange={e=>setZone(e.target.value)} required className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-500 bg-white">
                          <option value="">Select Zone</option>
                          <option>Roorkee</option><option>Haridwar</option><option>Rishikesh</option><option>Dehradun</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Route *</label>
                        <select value={route} onChange={e=>setRoute(e.target.value)} required className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-500 bg-white">
                          <option value="">Select Route</option>
                          <option>Fatehpur Route</option><option>Jwalapur Route</option><option>Kankhal Route</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg">
                      Continue to Register
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Thank-You View ──────────────────────────────────
  if(view==='thankyou') return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg px-4 py-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-center relative overflow-hidden">
            <div className="absolute top-2 left-4 w-14 h-14 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-2 right-6 w-9 h-9 bg-white/10 rounded-full"></div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 success-ring shadow-lg">
              <svg className="w-9 h-9 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Payment Successful!</h2>
            <p className="text-emerald-100 text-sm">Registration confirmed. Welcome to MPCC!</p>
          </div>
          <div className="p-5 space-y-3.5">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-blue-700 text-sm">Your Login Credentials</span>
                <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Sent to Email</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100">
                  <div><div className="text-xs text-slate-400 font-semibold">Customer ID</div><div className="font-black text-slate-800 text-base">{tyData?.cid}</div></div>
                </div>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100">
                  <div><div className="text-xs text-slate-400 font-semibold">Username</div><div className="font-bold text-slate-700 text-sm">{tyData?.uname}</div></div>
                </div>
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100">
                  <div><div className="text-xs text-slate-400 font-semibold">Password</div><div className="font-bold text-slate-700 tracking-widest text-sm">{tyData?.pass}</div></div>
                </div>
              </div>
            </div>
            <div className="border-2 border-slate-100 rounded-xl p-3.5">
              <h3 className="font-bold text-slate-700 text-xs mb-2.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                What Happens Next?
              </h3>
              <div className="space-y-2">
                {['Your account has been created and verified.','MPCC team will contact you within 24 hours.','Collection kit will be dispatched within 3 working days.','First waste pickup scheduled as per your route.'].map((t,i)=>(
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">{i+1}</div>
                    <span className="text-slate-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-slate-100 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400">Transaction ID</div>
                <div className="font-bold text-slate-700 text-xs mt-1">{tyData?.txnId}</div>
              </div>
              <div className="border-2 border-slate-100 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400">Amount Paid</div>
                <div className="font-black text-emerald-600 text-sm mt-1">{fmt(tyData?.total||0)}</div>
              </div>
            </div>
            <button onClick={()=>{setView('landing');setStep(1);setCat(null);setSubCat(null);setPlan(null);setBeds(0);setKit({name:'Small Kit',price:1397});setConsulting(false);setCompliance(false);setTcChecked(false)}} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2">
              Register Another Institution
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Wizard View ────────────────────────────────────
  const stepTitles = ['Select Category','Select Sub-Category','Plan & Kit','Review & Confirm']
  const subItems = cat ? (SUB_DATA[cat.key]||[]) : []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 sm:px-6 pt-3 pb-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={wizBack} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 text-xs font-semibold transition-colors group">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back
            </button>
            <div className="flex-1 text-center"><span className="text-sm font-bold text-slate-700">{stepTitles[step-1]}</span></div>
            <div className="text-xs font-semibold text-slate-400">{step}/4</div>
          </div>
          <div className="flex items-center gap-0">
            {[1,2,3,4].map((n,i)=>(
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-400 ${step>=n?'bg-blue-600 text-white shadow shadow-blue-200':'bg-slate-200 text-slate-400'}`}>{n}</div>
                  <span className={`text-xs font-semibold mt-1 hidden sm:block ${step>=n?'text-blue-600':'text-slate-400'}`}>{['Category','Sub-Cat','Plan & Kit','Confirm'][i]}</span>
                </div>
                {i<3 && <div className={`prog-line mx-1 sm:mx-2 mt-0 sm:-mt-4 ${step>n?'done':''}`}></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-3 sm:px-5 py-3 overflow-y-auto">
        <div className="max-w-3xl mx-auto">

          {/* Step 1 */}
          {step===1 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <div><h2 className="text-base font-bold text-slate-800">Select Facility Category</h2><p className="text-slate-400 text-xs">Choose the type of your healthcare institution</p></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  {label:'Hospital',key:'hosp',sub:'Nursing Home',bg:'linear-gradient(135deg,#2563eb,#3b82f6)',icon:<path d="M19 2H5a2 2 0 00-2 2v18l4-2 4 2 4-2 4 2V4a2 2 0 00-2-2zM9 13H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2z"/>},
                  {label:'Pathology',key:'path',sub:'Lab / Diagnostic',bg:'linear-gradient(135deg,#e11d48,#f43f5e)',icon:<path d="M7 2v11h3v9l7-12h-4l4-8z"/>},
                  {label:'Clinic',key:'clinic',sub:'General / Poly',bg:'linear-gradient(135deg,#7c3aed,#8b5cf6)',icon:<path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 11h-3v3h-2v-3H8v-2h3V8h2v3h3v2z"/>},
                  {label:'Dental',key:'dental',sub:'Per chair/month',bg:'linear-gradient(135deg,#059669,#10b981)',icon:<path d="M12 1C8.5 1 7 3.5 7 3.5S3 3 3 7c0 3.9 2 6.5 2 6.5l1 7.5c.3 1.1 1.5 2 2.5 2s2-.5 2.5-1.5L12 19l1 2.5c.5 1 1.5 1.5 2.5 1.5s2.2-.9 2.5-2l1-7.5S21 10.9 21 7c0-4-4-3.5-4-3.5S15.5 1 12 1z"/>},
                  {label:'Veterinary',key:'vet',sub:'Clinic / Hospital',bg:'linear-gradient(135deg,#dc2626,#ef4444)',icon:<path d="M4.5 11c.83 0 1.5-.67 1.5-1.5v-4C6 4.67 5.33 4 4.5 4S3 4.67 3 5.5v4c0 .83.67 1.5 1.5 1.5zm4 1c.83 0 1.5-.67 1.5-1.5v-6C10 3.67 9.33 3 8.5 3S7 3.67 7 4.5v6c0 .83.67 1.5 1.5 1.5zm7 0c.83 0 1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5S14 3.67 14 4.5v6c0 .83.67 1.5 1.5 1.5zm4-1c.83 0 1.5-.67 1.5-1.5v-4c0-.83-.67-1.5-1.5-1.5S18 4.67 18 5.5v4c0 .83.67 1.5 1.5 1.5zM17 14H7c-1.1 0-2 .9-2 2 0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.1-.9-2-2-2z"/>},
                  {label:'Blood Bank',key:'blood',sub:'₹5,000/month',bg:'linear-gradient(135deg,#d97706,#f59e0b)',icon:<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>},
                  {label:'School/Inst.',key:'inst',sub:'Medical clinic',bg:'linear-gradient(135deg,#0891b2,#06b6d4)',icon:<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>},
                  {label:'Pharma',key:'pharma',sub:'Company / Store',bg:'linear-gradient(135deg,#9333ea,#a855f7)',icon:<path d="M6.5 10h-2v5h2v-5zm5 0h-2v5h2v-5zm8.5 7H2v2h18v-2zm-3.5-7h-2v5h2v-5zM11.5 1L2 6v2h18V6l-8.5-5z"/>},
                  {label:'Medical Store',key:'medstore',sub:'₹550/month',bg:'linear-gradient(135deg,#16a34a,#22c55e)',icon:<path d="M20 4H4v2l8 5 8-5V4zm0 4.236l-8 5-8-5V20h16V8.236z"/>},
                  {label:'Health Camp',key:'camp',sub:'₹2,000/camp',bg:'linear-gradient(135deg,#0284c7,#38bdf8)',icon:<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>},
                ].map(c=>(
                  <div key={c.key} className={`cat-card p-3 text-center ${cat?.key===c.key?'selected':''}`} onClick={()=>selectCategory(c.label,c.key)}>
                    <div className="cat-icon-wrap" style={{background:c.bg}}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">{c.icon}</svg>
                    </div>
                    <div className="font-semibold text-slate-700 text-xs leading-tight">{c.label}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
              {cat && (
                <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span className="text-blue-700 text-xs font-semibold">{cat.label} selected</span>
                  <span className="ml-auto text-xs text-blue-500">Click Continue →</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step===2 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>
                </div>
                <div><h2 className="text-base font-bold text-slate-800">Select Sub-Category</h2><p className="text-slate-400 text-xs">Choose specific type under {cat?.label}</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subItems.map(s=>(
                  <div key={s} className={`sub-item p-3 flex items-center gap-3 ${subCat===s?'selected':''}`} onClick={()=>selectSubCat(s)}>
                    <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></div>
                    <span className="font-semibold text-slate-700 text-sm">{s}</span>
                    {subCat===s && <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step===3 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3 bg-white rounded-xl border border-slate-100 shadow-sm p-1.5">
                {['plan','beds','kit','addons'].map((t,i)=>(
                  <button key={t} className={`inner-tab flex-1 ${s3tab===t?'active':''}`} onClick={()=>setS3tab(t)}>
                    {['📋 Plan','🛏️ Beds','📦 Kit','➕ Add-ons'][i]}
                  </button>
                ))}
              </div>

              {s3tab==='plan' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested Plan</p>
                  {sugPlan && (
                    <div className={`plan-card p-4 flex items-center gap-3 mb-3 ${!planCode?'selected':''}`} style={{background:'#eff6ff',borderColor:'#2563eb'}} onClick={()=>setPlan(null)}>
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div></div>
                      <div className="flex-1"><div className="font-bold text-slate-700 text-sm">{sugPlan.name}</div><div className="text-slate-400 text-xs">{sugPlan.unit}</div></div>
                      <div className="text-right shrink-0"><div className="text-lg font-black text-blue-600">{fmt(sugPlan.rate)}{sugPlan.perBed?'/bed/day':''}</div><div className="text-xs text-emerald-600 font-semibold">✓ Recommended</div></div>
                    </div>
                  )}
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-3">All Plans</p>
                  <div className="space-y-2" style={{maxHeight:'200px',overflowY:'auto',paddingRight:'4px'}}>
                    {MPCC_RATE_CHART.map(r=>(
                      <div key={r.code} className={`plan-card p-3 flex items-center gap-3 ${planCode===r.code?'selected':''}`} onClick={()=>setPlan(r.code)}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${planCode===r.code?'border-blue-500':'border-slate-300'}`}>
                          {planCode===r.code && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                        <div className="flex-1 text-xs"><span className="font-semibold text-slate-700">{r.code}</span> — {r.name}</div>
                        <div className="text-xs font-bold text-blue-700 shrink-0">{fmt(r.rate)}{r.perBed?'/bed/day':''}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <svg className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <div><div className="text-xs font-bold text-orange-700">One-Time Registration Fee: {fmt(getRegFee())}</div><div className="text-xs text-slate-500 mt-0.5">Non-refundable. CPCB onboarding & documentation included.</div></div>
                  </div>
                  <button className="mt-4 w-full inner-tab active py-2.5 text-sm" onClick={()=>setS3tab('beds')}>Next: Set Bed Count →</button>
                </div>
              )}

              {s3tab==='beds' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
                    </div>
                    <div><div className="font-bold text-slate-700 text-sm">Bed Capacity</div><div className="text-xs text-slate-400">Enter number of beds for auto-calculation</div></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className={`rounded-xl p-2.5 text-center border-2 transition-all ${beds>=1&&beds<=10?'border-blue-400 bg-blue-50':'border-slate-200 bg-slate-50'}`}>
                      <div className="text-xs font-bold text-blue-600">1–10 Beds</div><div className="text-base font-black text-slate-700 mt-0.5">₹2,500</div><div className="text-xs text-slate-400">/month</div>
                    </div>
                    <div className={`rounded-xl p-2.5 text-center border-2 transition-all ${beds>=11&&beds<=20?'border-purple-400 bg-purple-50':'border-slate-200 bg-slate-50'}`}>
                      <div className="text-xs font-bold text-purple-600">11–20 Beds</div><div className="text-base font-black text-slate-700 mt-0.5">₹3,500</div><div className="text-xs text-slate-400">/month</div>
                    </div>
                    <div className={`rounded-xl p-2.5 text-center border-2 transition-all ${beds>20?'border-orange-400 bg-orange-50':'border-slate-200 bg-slate-50'}`}>
                      <div className="text-xs font-bold text-orange-600">21+ Beds</div><div className="text-base font-black text-slate-700 mt-0.5">₹7/bed</div><div className="text-xs text-slate-400">/day × 30</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 gap-3">
                    <button className="step-btn" onClick={()=>setBeds(b=>Math.max(0,b-10))}><span className="text-xs font-black leading-none">−10</span></button>
                    <button className="step-btn" onClick={()=>setBeds(b=>Math.max(0,b-1))}>−</button>
                    <div className="text-center flex-1">
                      <input type="number" min="1" max="500" value={beds||''} onChange={e=>setBeds(Math.max(0,parseInt(e.target.value)||0))} className="text-4xl font-black text-slate-800 text-center w-24 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-600 pb-1"/>
                      <div className="text-xs text-slate-400 font-medium mt-1">Total Beds</div>
                    </div>
                    <button className="step-btn" onClick={()=>setBeds(b=>b+1)}>+</button>
                    <button className="step-btn" onClick={()=>setBeds(b=>b+10)}><span className="text-xs font-black leading-none">+10</span></button>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100 flex items-center justify-between mb-4">
                    <div><div className="text-xs text-slate-500 font-semibold">Calculated Monthly Service Fee</div><div className="text-xs text-slate-400">{beds<=0?'Enter beds above':beds<=10?'Slab 1 (1-10 beds)':beds<=20?'Slab 2 (11-20 beds)':'Slab 3 (21+ beds @ ₹7/bed/day)'}</div></div>
                    <div className="text-2xl font-black text-blue-700">{fmt(calcBedFee(beds))}</div>
                  </div>
                  <button className="w-full inner-tab active py-2.5 text-sm" onClick={()=>setS3tab('kit')}>Next: Choose Kit →</button>
                </div>
              )}

              {s3tab==='kit' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Collection Kit</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {name:'Small Kit',price:1397,label:'Clinics, pharmacies',color:'from-blue-400 to-blue-600',textColor:'text-emerald-600'},
                      {name:'Medium Kit',price:2500,label:'Hospitals, nursing homes',color:'from-purple-500 to-purple-600',textColor:'text-purple-600',badge:'Popular'},
                      {name:'Large Kit',price:4200,label:'Large hospitals',color:'from-orange-400 to-orange-500',textColor:'text-orange-500'},
                      {name:'Enterprise Kit',price:7500,label:'Research centers',color:'from-slate-700 to-slate-800',textColor:'text-slate-700',badge:'Premium'},
                    ].map(k=>(
                      <div key={k.name} className={`kit-card p-4 relative ${kit.name===k.name?'selected':''}`} onClick={()=>setKit({name:k.name,price:k.price})}>
                        {k.badge && <div className="absolute top-2 left-2 text-xs bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded-full">{k.badge}</div>}
                        {kit.name===k.name && <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>}
                        <div className={`w-9 h-9 bg-gradient-to-br ${k.color} rounded-xl flex items-center justify-center mb-3 shadow ${k.badge?'mt-5':''}`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        </div>
                        <div className="font-bold text-slate-700 text-sm">{k.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 mb-2">{k.label}</div>
                        <div className={`text-lg font-black ${k.textColor}`}>{fmt(k.price)}</div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full inner-tab active py-2.5 text-sm" onClick={()=>setS3tab('addons')}>Next: Add-ons →</button>
                </div>
              )}

              {s3tab==='addons' && (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 sm:p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Optional Add-ons</p>
                  <label className="flex items-center justify-between p-3.5 border-2 border-slate-100 rounded-xl mb-2.5 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
                      <div><div className="font-semibold text-slate-700 text-sm">Consulting Fees</div><div className="text-xs text-slate-400">Professional advisory services</div></div>
                    </div>
                    <div className="flex items-center gap-3"><div className="font-black text-slate-700 text-sm">₹2,000</div><input type="checkbox" checked={consulting} onChange={e=>setConsulting(e.target.checked)} className="w-4 h-4 accent-blue-600"/></div>
                  </label>
                  <label className="flex items-center justify-between p-3.5 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-purple-200 hover:bg-purple-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                      <div><div className="font-semibold text-slate-700 text-sm">Compliance Consultancy</div><div className="text-xs text-slate-400">CPCB documentation guidance</div></div>
                    </div>
                    <div className="flex items-center gap-3"><div className="font-black text-slate-700 text-sm">₹2,000</div><input type="checkbox" checked={compliance} onChange={e=>setCompliance(e.target.checked)} className="w-4 h-4 accent-purple-600"/></div>
                  </label>
                  <div className="mt-4 bg-slate-900 rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-3"><span className="font-bold text-sm">Order Summary</span><span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Live</span></div>
                    <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                      <div className="flex justify-between"><span>Registration (one-time)</span><span className="text-white font-semibold">{fmt(totals.reg)}</span></div>
                      {totals.svc>0 && <div className="flex justify-between"><span>Service ({selPlan?.name})</span><span className="text-white font-semibold">{fmt(totals.svc)}</span></div>}
                      <div className="flex justify-between"><span>Kit ({kit.name})</span><span className="text-white font-semibold">{fmt(kit.price)}</span></div>
                      {consulting && <div className="flex justify-between"><span>Consulting</span><span className="text-white font-semibold">₹2,000</span></div>}
                      {compliance && <div className="flex justify-between"><span>Compliance</span><span className="text-white font-semibold">₹2,000</span></div>}
                    </div>
                    <div className="border-t border-slate-700 pt-2.5 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-white font-semibold">{fmt(totals.sub)}</span></div>
                      <div className="flex justify-between text-slate-400"><span>CGST 9%</span><span className="text-white font-semibold">{fmt(totals.cgst)}</span></div>
                      <div className="flex justify-between text-slate-400"><span>SGST 9%</span><span className="text-white font-semibold">{fmt(totals.sgst)}</span></div>
                    </div>
                    <div className="border-t border-slate-600 pt-2.5 mt-1 flex justify-between items-center">
                      <span className="font-bold text-sm">Total Payable</span>
                      <span className="text-2xl font-black text-cyan-400">{fmt(totals.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 */}
          {step===4 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 text-center">
                <h2 className="text-base font-bold text-slate-800">Review & Confirm</h2>
                <p className="text-xs text-slate-400">Verify details before payment</p>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-2 border-slate-100 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-2.5"><span className="font-bold text-slate-700 text-xs">Institution Details</span></div>
                    <div className="space-y-1.5 text-xs">
                      {[['Name',instName],['Mobile',mobile],['Email',email],['Category',cat?.label||'—'],['Sub-Cat',subCat||'—'],['Zone',zone],['Route',route]].map(([k,v])=>(
                        <div key={k} className="flex gap-2"><span className="text-slate-400 w-16 shrink-0">{k}</span><span className="font-semibold text-slate-700 truncate">{v}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="border-2 border-slate-100 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-2.5"><span className="font-bold text-slate-700 text-xs">Service Details</span></div>
                    <div className="space-y-1.5 text-xs">
                      {[['Plan',selPlan?.name||'—'],['Kit',kit.name],['Beds',beds||'N/A'],['Consulting',consulting?'Added':'Not added'],['Compliance',compliance?'Added':'Not added']].map(([k,v])=>(
                        <div key={k} className="flex gap-2"><span className="text-slate-400 w-20 shrink-0">{k}</span><span className="font-semibold text-slate-700">{v}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-3"><span className="font-bold text-sm">Payment Summary</span></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs mb-3">
                    <div className="flex justify-between"><span className="text-slate-400">Reg. Fee</span><span className="font-semibold">{fmt(totals.reg)}</span></div>
                    {totals.svc>0 && <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="font-semibold">{fmt(totals.svc)}</span></div>}
                    <div className="flex justify-between"><span className="text-slate-400">Kit</span><span className="font-semibold">{fmt(kit.price)}</span></div>
                    {consulting && <div className="flex justify-between"><span className="text-slate-400">Consulting</span><span className="font-semibold">₹2,000</span></div>}
                    {compliance && <div className="flex justify-between"><span className="text-slate-400">Compliance</span><span className="font-semibold">₹2,000</span></div>}
                  </div>
                  <div className="border-t border-slate-700 pt-2.5 grid grid-cols-3 gap-2 text-xs mb-2.5">
                    <div><div className="text-slate-400">Subtotal</div><div className="font-bold">{fmt(totals.sub)}</div></div>
                    <div><div className="text-slate-400">CGST 9%</div><div className="font-bold">{fmt(totals.cgst)}</div></div>
                    <div><div className="text-slate-400">SGST 9%</div><div className="font-bold">{fmt(totals.sgst)}</div></div>
                  </div>
                  <div className="border-t border-slate-600 pt-2.5 flex justify-between items-center">
                    <span className="font-bold text-sm">Total Payable <span className="text-xs text-slate-400 font-normal">(GST incl.)</span></span>
                    <span className="font-black text-2xl text-cyan-400">{fmt(totals.total)}</span>
                  </div>
                </div>
                <div className="border-2 border-slate-100 rounded-xl overflow-hidden">
                  <button onClick={()=>setTcOpen(o=>!o)} className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-slate-50 transition-colors">
                    <span className="text-blue-600 font-semibold text-xs flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 2H5a2 2 0 00-2 2v18l4-2 4 2 4-2 4 2V4a2 2 0 00-2-2z"/></svg>
                      Terms & Conditions
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${tcOpen?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {tcOpen && <div className="px-3.5 pb-3 text-xs text-slate-500 leading-relaxed">By registering with MPCC, you agree to comply with all applicable biomedical waste management regulations under the Bio-Medical Waste Management Rules, 2016. MPCC reserves the right to modify service terms with prior notice. All fees are non-refundable post service initiation.</div>}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={tcChecked} onChange={e=>setTcChecked(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
                  <span className="text-xs text-slate-600">I have read and agree to the <a href="#" className="text-blue-600 font-semibold hover:underline">Terms &amp; Conditions</a></span>
                </label>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,.06)]">
        <div className="max-w-3xl mx-auto flex gap-3">
          {step>1 && (
            <button onClick={wizBack} className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 font-semibold px-5 py-3 rounded-2xl hover:border-blue-300 hover:text-blue-600 transition-all text-sm shrink-0 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back
            </button>
          )}
          <button onClick={wizNext} disabled={!canNext()} className={`flex-1 flex items-center justify-center gap-2 ${canNext()?'btn-primary':'btn-disabled cursor-not-allowed'} font-bold py-3 rounded-2xl text-sm transition-all shadow-sm`}>
            {stepLabel()}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="modal-bg absolute inset-0" onClick={()=>setPayOpen(false)}></div>
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] overflow-y-auto">
            <div className="bg-slate-800 text-white px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">M</div><span className="font-semibold text-sm">MPCC Registration</span></div>
              <button onClick={()=>setPayOpen(false)} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="bg-slate-700 text-white px-4 py-3 text-center">
              <div className="text-xs text-slate-400">Total Amount</div>
              <div className="text-2xl font-black text-cyan-400">{fmt(totals.total)}</div>
              <div className="text-xs text-slate-400 mt-0.5">{email}</div>
            </div>
            <div className="flex border-b border-slate-200">
              {['upi','qr','card','emi','cheque'].map(t=>(
                <button key={t} className={`pay-tab ${payTab===t?'active':''}`} onClick={()=>setPayTab(t)}>{t==='cheque'?'🏦 Cheque':t.toUpperCase()}</button>
              ))}
            </div>

            {payTab==='upi' && (
              <div className="p-5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Enter UPI ID</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="yourname@upi" className="flex-1 px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/>
                  <button onClick={simulatePay} className="btn-primary text-white px-4 py-3 rounded-xl text-sm font-semibold">Verify</button>
                </div>
                <div className="text-xs text-slate-400 text-center mb-3">Or pay using</div>
                <div className="grid grid-cols-4 gap-2">
                  {[['G','GPay','from-blue-500 to-cyan-400'],['P','PhonePe','from-purple-500 to-indigo-500'],['P','Paytm','from-blue-400 to-blue-600'],['A','Amazon','from-orange-400 to-red-400']].map(([l,n,g])=>(
                    <button key={n} onClick={simulatePay} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 border border-slate-100">
                      <div className={`w-8 h-8 bg-gradient-to-br ${g} rounded-lg flex items-center justify-center text-white text-xs font-black`}>{l}</div>
                      <span className="text-xs text-slate-500">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {payTab==='qr' && (
              <div className="p-5 text-center">
                <p className="text-sm text-slate-500 mb-3">Scan using any UPI App</p>
                <div className="w-36 h-36 bg-slate-100 border-2 border-slate-200 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <div className="text-slate-400 text-sm">QR Code</div>
                </div>
                <button onClick={simulatePay} className="btn-primary text-white w-full py-3 rounded-2xl font-bold text-sm">Simulate Payment</button>
              </div>
            )}

            {payTab==='card' && (
              <div className="p-5">
                <div className="space-y-3">
                  <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Card Number</label><input type="text" placeholder="4111 1111 1111 1111" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Expiry</label><input type="text" placeholder="MM / YY" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div>
                    <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">CVV</label><input type="text" placeholder="• • •" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div>
                  </div>
                  <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Name on Card</label><input type="text" placeholder="Full name" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"/></div>
                  <button onClick={simulatePay} className="btn-primary w-full text-white font-bold py-3.5 rounded-2xl text-sm">Pay Now</button>
                </div>
              </div>
            )}

            {payTab==='emi' && (
              <div className="p-5">
                <div className="space-y-3 mb-4">
                  <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-xl cursor-pointer"><div className="font-semibold text-slate-700 text-sm">3 Months EMI</div><div className="text-xs text-slate-400 mt-0.5">₹4,628/month · 0% interest</div></div>
                  <div className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"><div className="font-semibold text-slate-700 text-sm">6 Months EMI</div><div className="text-xs text-slate-400 mt-0.5">₹2,314/month · 1.5% interest</div></div>
                  <div className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"><div className="font-semibold text-slate-700 text-sm">12 Months EMI</div><div className="text-xs text-slate-400 mt-0.5">₹1,157/month · 2% interest</div></div>
                </div>
                <button onClick={simulatePay} className="btn-primary w-full text-white font-bold py-3.5 rounded-2xl text-sm">Proceed with EMI</button>
              </div>
            )}

            {payTab==='cheque' && (
              <div className="p-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-3 items-start">
                  <span style={{fontSize:'18px'}}>🏦</span>
                  <div className="text-xs text-amber-800"><strong>Pay by Cheque:</strong> Your account will be activated within 2-3 working days after cheque clearance.</div>
                </div>
                <div className="space-y-3">
                  <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Cheque Number *</label><input value={chqNo} onChange={e=>setChqNo(e.target.value)} type="text" placeholder="6-digit cheque number" maxLength="6" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Bank Name *</label><input value={chqBank} onChange={e=>setChqBank(e.target.value)} type="text" placeholder="e.g. HDFC Bank" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"/></div>
                    <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Cheque Date *</label><input value={chqDate} onChange={e=>setChqDate(e.target.value)} type="date" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"/></div>
                  </div>
                  <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">Branch Name</label><input value={chqBranch} onChange={e=>setChqBranch(e.target.value)} type="text" placeholder="e.g. Haridwar Main Branch" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"/></div>
                  <div><label className="text-xs font-bold text-slate-400 mb-1.5 block">IFSC Code</label><input value={chqIfsc} onChange={e=>setChqIfsc(e.target.value.toUpperCase())} type="text" placeholder="e.g. HDFC0001234" maxLength="11" className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"/></div>
                  <div className="bg-slate-800 rounded-xl p-4">
                    <div className="text-xs font-bold text-slate-300 mb-2">Payable to:</div>
                    <div className="text-sm font-bold text-white">Medical Pollution Control Committee</div>
                    <div className="text-xs text-slate-400 mt-1">Account No: 12345678901234 | IFSC: SBIN0001234</div>
                    <div className="text-xs text-slate-400">Bank: State Bank of India, Haridwar</div>
                  </div>
                  <button onClick={submitChequePayment} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white" style={{background:'linear-gradient(135deg,#d97706,#b45309)'}}>
                    🏦 Submit Cheque Details
                  </button>
                </div>
              </div>
            )}

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              <span className="text-xs text-slate-400">Secured by <strong className="text-slate-600">Razorpay</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
