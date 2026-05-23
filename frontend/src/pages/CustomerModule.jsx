import React, { useState, useEffect } from 'react';
import '../styles/CustomerModule.css';

const CustomerModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('customer-reg');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({});

  // Dropdown data states
  const [customers, setCustomers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [zones, setZones] = useState([]);
  // Real registered facilities from CustomerRegistrations (used in Certificate/ServiceReq/MOU dropdowns)
  const [allRegistrations, setAllRegistrations] = useState([]);

  // Table data states
  const [customerRegistrations, setCustomerRegistrations] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [mouRecords, setMouRecords] = useState([]);
  const [failedRegistrations, setFailedRegistrations] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Certificate table data
  const [certificates, setCertificates] = useState([]);
  const [certDuplicateWarning, setCertDuplicateWarning] = useState('');

  // View / Edit modals
  const [showViewRegModal, setShowViewRegModal] = useState(false);
  const [viewRegData, setViewRegData] = useState(null);
  const [showViewCertModal, setShowViewCertModal] = useState(false);
  const [viewCertData, setViewCertData] = useState(null);
  const [editingRegistration, setEditingRegistration] = useState(false);
  const [editingRegistrationId, setEditingRegistrationId] = useState(null);

  // Customer Registration Wizard State
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    // Step 1: Institution Details
    institutionName: '',
    institutionType: '',
    numberOfBeds: '',
    bmwRegNo: '',
    fullAddress: '',
    zone: '',
    pincode: '',
    // Contact Details
    contactPerson: '',
    designation: '',
    mobile: '',
    email: '',
    alternateMobile: '',
    website: '',
    // Legal & Tax
    panNumber: '',
    gstNumber: '',
    // GPS & Photos
    gpsLatitude: '',
    gpsLongitude: '',
    gpsAddress: '',
    photos: [],
    // Step 2: Service Plan
    selectedPlan: '',
    billingCycle: 'Monthly',
    contractStartDate: '',
    contractDuration: '',
    paymentModePref: 'Online (UPI/Gateway)',
    // Step 3: Documents
    documents: {},
    // Step 4: Payment
    paymentMethod: 'online'
  });
  const [gpsPhotos, setGpsPhotos] = useState([]);

  // Certificate Generation Modal State
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState({
    certificateNo: 'CERT-AUTO',
    certificateType: '',
    registrationId: '',     // RegistrationID from CustomerRegistrations
    customerFacility: '',   // display name (InstitutionName)
    issueDate: '',
    validTill: '',
    notes: '',
    status: 'Active'
  });

  // Service Request Follow-up Modal State
  const [showFollowupModal, setShowFollowupModal]       = useState(false);
  const [followupSR, setFollowupSR]                     = useState(null);
  const [followupHistory, setFollowupHistory]           = useState([]);
  const [followupLoading, setFollowupLoading]           = useState(false);
  const [followupSaving, setFollowupSaving]             = useState(false);
  const [followupForm, setFollowupForm]                 = useState({ status: '', note: '' });

  // Service Request Modal State
  const [showServiceReqModal, setShowServiceReqModal] = useState(false);
  const [serviceReqData, setServiceReqData] = useState({
    requestId: 'SR-AUTO',
    requestType: '',
    registrationId: '',
    customerFacility: '',
    assignedTo: '',
    scheduledDate: '',
    description: '',
    status: 'Open'
  });

  // Customer MOU Modal State
  const [showMouModal, setShowMouModal]     = useState(false);
  const [showViewMouModal, setShowViewMouModal] = useState(false);
  const [viewMouData, setViewMouData]       = useState(null);
  const [editingMou, setEditingMou]         = useState(false);
  const [editingMouId, setEditingMouId]     = useState(null);
  const [mouData, setMouData] = useState({
    mouNumber: 'MOU-AUTO',
    registrationId: '',
    customer: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    termsConditions: '',
    status: 'Active'
  });

  // Failed Registration Modal State
  const [showFailedRegModal, setShowFailedRegModal] = useState(false);
  const [failedRegData, setFailedRegData] = useState({
    registrationId: 'REG-AUTO',
    facilityName: '',
    contactPerson: '',
    mobile: '',
    planName: '',
    amount: '',
    errorCode: '',
    failureReason: '',
    attemptedDate: '',
    status: 'Failed',
    chequeNo: '',
    chequeAmount: '',
    bankName: '',
    chequeDate: ''
  });

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoadingData(true);

        // Fetch customers (legacy - kept for backward compat)
        const customersRes = await fetch('/api/customers');
        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(Array.isArray(customersData) ? customersData : customersData.data || []);
        }

        // Fetch CustomerRegistrations for dropdown (real registered facilities)
        const regsRes = await fetch('/api/customer-registrations');
        if (regsRes.ok) {
          const regsData = await regsRes.json();
          const regs = Array.isArray(regsData) ? regsData : regsData.data || [];
          setAllRegistrations(regs);
        }

        // Fetch staff/users for "Assigned To" dropdown
        const staffRes = await fetch('/api/users');
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffMembers(Array.isArray(staffData) ? staffData : staffData.data || []);
        }

        // Set zones
        setZones([
          'Haridwar Zone A',
          'Haridwar Zone B',
          'Rishikesh Zone',
          'Roorkee Zone',
          'Dehradun Zone'
        ]);

        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        setLoadingData(false);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch table data based on active submenu
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoadingData(true);

        if (activeSubModule === 'customer-reg') {
          const res = await fetch('/api/customer-registrations');
          if (res.ok) {
            const data = await res.json();
            setCustomerRegistrations(Array.isArray(data) ? data : data.data || []);
          }
        } else if (activeSubModule === 'servicereq') {
          const res = await fetch('/api/service-requests');
          if (res.ok) {
            const data = await res.json();
            setServiceRequests(Array.isArray(data) ? data : data.data || []);
          }
        } else if (activeSubModule === 'mou') {
          const res = await fetch('/api/customer-mou');
          if (res.ok) {
            const data = await res.json();
            setMouRecords(Array.isArray(data) ? data : data.data || []);
          }
        } else if (activeSubModule === 'failed-reg') {
          const res = await fetch('/api/failed-registrations');
          if (res.ok) {
            const data = await res.json();
            setFailedRegistrations(Array.isArray(data) ? data : data.data || []);
          }
        } else if (activeSubModule === 'certificate') {
          const res = await fetch('/api/certificates');
          if (res.ok) {
            const data = await res.json();
            setCertificates(Array.isArray(data) ? data : data.data || []);
          }
        }

        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching table data:', error);
        setLoadingData(false);
      }
    };

    fetchTableData();
  }, [activeSubModule]);

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Wizard Form Handlers
  const handleWizardInputChange = (e) => {
    const { name, value } = e.target;
    setWizardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectPlan = (planId, planName, price) => {
    setWizardData(prev => ({
      ...prev,
      selectedPlan: planName
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.slice(0, 5 - gpsPhotos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGpsPhotos(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setGpsPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const navigateStep = (direction) => {
    const newStep = currentStep + direction;
    if (newStep >= 1 && newStep <= 4) {
      setCurrentStep(newStep);
    }
  };

  const handleWizardSubmit = async () => {
    // Validate required fields - only institution name required
    if (!wizardData.institutionName) {
      alert('Please fill in the Institution Name');
      setCurrentStep(1);
      return;
    }

    try {
      const isEdit = editingRegistration && editingRegistrationId;
      const url = isEdit
        ? `/api/customer-registrations/${editingRegistrationId}`
        : '/api/customer-registrations';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          institutionName: wizardData.institutionName,
          institutionType: wizardData.institutionType,
          numberOfBeds: wizardData.numberOfBeds ? parseInt(wizardData.numberOfBeds) : null,
          bmwRegNo: wizardData.bmwRegNo,
          fullAddress: wizardData.fullAddress,
          zone: wizardData.zone,
          pincode: wizardData.pincode,
          contactPerson: wizardData.contactPerson,
          designation: wizardData.designation,
          mobile: wizardData.mobile,
          email: wizardData.email,
          alternateMobile: wizardData.alternateMobile,
          website: wizardData.website,
          panNumber: wizardData.panNumber,
          gstNumber: wizardData.gstNumber,
          gpsLatitude: wizardData.gpsLatitude ? parseFloat(wizardData.gpsLatitude) : null,
          gpsLongitude: wizardData.gpsLongitude ? parseFloat(wizardData.gpsLongitude) : null,
          gpsAddress: wizardData.gpsAddress,
          selectedPlan: wizardData.selectedPlan,
          billingCycle: wizardData.billingCycle,
          contractStartDate: wizardData.contractStartDate,
          contractDuration: wizardData.contractDuration ? parseInt(wizardData.contractDuration) : null,
          paymentModePref: wizardData.paymentModePref,
          paymentMethod: wizardData.paymentMethod,
          documents: wizardData.documents
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(isEdit
          ? '✅ Registration updated successfully!'
          : '✅ Customer registration submitted successfully!\nRegistration Code: ' + result.RegistrationCode
        );
        setShowWizardModal(false);
        setEditingRegistration(false);
        setEditingRegistrationId(null);

        // Refresh registrations table AND dropdown list
        const refreshRes = await fetch('/api/customer-registrations');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const regs = Array.isArray(data) ? data : data.data || [];
          setCustomerRegistrations(regs);
          setAllRegistrations(regs); // keep dropdown in sync
        }

        resetWizard();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + (error.message || 'Registration failed'));
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('❌ Error submitting registration: ' + error.message);
    }
  };

  const resetWizard = () => {
    setEditingRegistration(false);
    setEditingRegistrationId(null);
    setCurrentStep(1);
    setWizardData({
      institutionName: '',
      institutionType: '',
      numberOfBeds: '',
      bmwRegNo: '',
      fullAddress: '',
      zone: '',
      pincode: '',
      contactPerson: '',
      designation: '',
      mobile: '',
      email: '',
      alternateMobile: '',
      website: '',
      panNumber: '',
      gstNumber: '',
      gpsLatitude: '',
      gpsLongitude: '',
      gpsAddress: '',
      photos: [],
      selectedPlan: '',
      billingCycle: 'Monthly',
      contractStartDate: '',
      contractDuration: '',
      paymentModePref: 'Online (UPI/Gateway)',
      documents: {},
      paymentMethod: 'online'
    });
    setGpsPhotos([]);
  };

  // Certificate Generation Handlers
  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData(prev => {
      const updated = { ...prev, [name]: value };

      // When registration dropdown changes — set both id and display name
      if (name === 'registrationId') {
        const selectedReg = allRegistrations.find(r => String(r.RegistrationID) === String(value));
        updated.customerFacility = selectedReg ? selectedReg.InstitutionName : '';
        // Duplicate check by RegistrationID
        const existing = certificates.find(
          c => String(c.RegistrationID) === String(value) && c.Status === 'Active'
        );
        if (existing && value) {
          setCertDuplicateWarning(`⚠️ Certificate Already Created for "${updated.customerFacility}" — Cert No: ${existing.CertificateCode}, Valid Till: ${existing.ValidTill ? new Date(existing.ValidTill).toLocaleDateString() : 'N/A'}`);
        } else {
          setCertDuplicateWarning('');
        }
      }

      // Auto-calculate validTill when issueDate or certificateType changes
      if ((name === 'issueDate' || name === 'certificateType') && updated.issueDate && updated.certificateType) {
        const issueDate = new Date(updated.issueDate);
        const validTill = new Date(issueDate);
        if (updated.certificateType === 'Annual' || updated.certificateType === 'Renewal') {
          validTill.setFullYear(validTill.getFullYear() + 1);
          validTill.setDate(validTill.getDate() - 1);
        } else if (updated.certificateType === 'Compliance') {
          validTill.setMonth(validTill.getMonth() + 6);
          validTill.setDate(validTill.getDate() - 1);
        }
        updated.validTill = validTill.toISOString().split('T')[0];
      }

      return updated;
    });
  };

  const handleCertificateSubmit = async () => {
    if (!certificateData.certificateType || !certificateData.registrationId) {
      alert('Please select a Customer/Facility and Certificate Type');
      return;
    }
    if (!certificateData.issueDate) {
      alert('Please select an Issue Date');
      return;
    }

    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          certificateType: certificateData.certificateType,
          registrationId: parseInt(certificateData.registrationId),
          facilityName: certificateData.customerFacility,
          issueDate: certificateData.issueDate,
          validTill: certificateData.validTill,
          notes: certificateData.notes,
          status: certificateData.status
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Certificate generated successfully!\nCertificate Code: ' + result.CertificateCode);
        setShowCertificateModal(false);
        setCertDuplicateWarning('');
        setCertificateData({
          certificateNo: 'CERT-AUTO',
          certificateType: '',
          customerFacility: '',
          issueDate: '',
          validTill: '',
          notes: '',
          status: 'Active'
        });
        // Refresh certificates table
        const refreshRes = await fetch('/api/certificates');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setCertificates(Array.isArray(data) ? data : data.data || []);
        }
      } else {
        const err = await response.json();
        alert('❌ Error generating certificate: ' + (err.message || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error submitting certificate:', error);
      alert('❌ Error generating certificate: ' + error.message);
    }
  };

  const resetCertificateForm = () => {
    setCertificateData({
      certificateNo: 'CERT-AUTO',
      certificateType: '',
      registrationId: '',
      customerFacility: '',
      issueDate: '',
      validTill: '',
      notes: '',
      status: 'Active'
    });
    setCertDuplicateWarning('');
  };

  // Certificate action handlers
  const handleViewCertificate = (cert) => {
    setViewCertData(cert);
    setShowViewCertModal(true);
  };

  const handlePrintCertificate = (cert) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const issueDate = cert.IssueDate ? new Date(cert.IssueDate).toLocaleDateString('en-IN', {day:'2-digit',month:'long',year:'numeric'}) : 'N/A';
    const validTill = cert.ValidTill ? new Date(cert.ValidTill).toLocaleDateString('en-IN', {day:'2-digit',month:'long',year:'numeric'}) : 'N/A';
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Certificate - ${cert.CertificateCode}</title>
    <style>
      body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; background: #fff; }
      .cert-outer { border: 8px double #1a4a8a; padding: 6px; max-width: 780px; margin: 0 auto; }
      .cert-inner { border: 3px solid #1a4a8a; padding: 40px; position: relative; min-height: 900px; }
      .cert-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 80px; color: rgba(26,74,138,0.07); font-weight: 900; white-space: nowrap; pointer-events: none; }
      .cert-header { text-align: center; margin-bottom: 30px; }
      .cert-header img { height: 70px; }
      .cert-org { font-size: 24px; font-weight: 900; color: #1a4a8a; letter-spacing: 2px; }
      .cert-suborg { font-size: 13px; color: #444; margin-top: 4px; }
      .cert-divider { border: none; border-top: 3px solid #1a4a8a; margin: 20px 0; }
      .cert-title { text-align: center; font-size: 28px; font-weight: 900; color: #1a4a8a; letter-spacing: 4px; text-transform: uppercase; margin: 20px 0; }
      .cert-subtitle { text-align: center; font-size: 14px; color: #555; margin-bottom: 30px; font-style: italic; }
      .cert-body { font-size: 15px; color: #333; line-height: 2; text-align: justify; margin-bottom: 30px; }
      .cert-highlight { font-size: 22px; font-weight: 700; color: #1a4a8a; text-align: center; margin: 20px 0; }
      .cert-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
      .cert-table td { padding: 10px 16px; border: 1px solid #c0c8d8; }
      .cert-table td:first-child { background: #e8edf5; font-weight: 700; color: #1a4a8a; width: 40%; }
      .cert-footer { display: flex; justify-content: space-between; margin-top: 60px; align-items: flex-end; }
      .cert-seal { text-align: center; }
      .cert-seal-circle { width: 100px; height: 100px; border: 3px double #1a4a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #1a4a8a; text-align: center; padding: 10px; line-height: 1.3; margin: 0 auto; }
      .cert-sign { text-align: center; }
      .cert-sign-line { border-top: 2px solid #333; width: 180px; margin: 0 auto 6px; padding-top: 6px; }
      .cert-validity { background: #e8edf5; border: 2px solid #1a4a8a; border-radius: 8px; padding: 16px 24px; text-align: center; margin: 20px 0; }
      .cert-no { background: #1a4a8a; color: white; padding: 6px 16px; border-radius: 4px; font-size: 13px; font-weight: 700; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <div class="cert-outer"><div class="cert-inner">
      <div class="cert-watermark">MPCC</div>
      <div class="cert-header">
        <div class="cert-org">MPCC – MEDICAL POLLUTION CONTROL COMMITTEE</div>
        <div class="cert-suborg">Biomedical Waste Management Authority — Haridwar, Uttarakhand</div>
        <div style="margin-top:10px;"><span class="cert-no">${cert.CertificateCode}</span></div>
      </div>
      <hr class="cert-divider"/>
      <div class="cert-title">Certificate of Compliance</div>
      <div class="cert-subtitle">Biomedical Waste (Management & Handling) Rules — ${cert.CertificateType || 'Annual'} Certificate</div>
      <div class="cert-body">
        This is to certify that <strong>${cert.CustomerName || 'N/A'}</strong> has fulfilled all the requisite conditions and requirements as prescribed under the Biomedical Waste Management Rules and is hereby authorized to generate, collect, and hand over biomedical waste to MPCC for safe disposal in accordance with the applicable regulations.
      </div>
      <table class="cert-table">
        <tr><td>Certificate Number</td><td>${cert.CertificateCode}</td></tr>
        <tr><td>Certificate Type</td><td>${cert.CertificateType || 'N/A'}</td></tr>
        <tr><td>Issued To (Facility)</td><td>${cert.CustomerName || 'N/A'}</td></tr>
        <tr><td>Issue Date</td><td>${issueDate}</td></tr>
        <tr><td>Valid Till</td><td>${validTill}</td></tr>
        <tr><td>Status</td><td>${cert.Status || 'Active'}</td></tr>
        ${cert.Notes ? `<tr><td>Notes</td><td>${cert.Notes}</td></tr>` : ''}
      </table>
      <div class="cert-validity">
        <strong>Validity Period:</strong> ${issueDate} &nbsp;→&nbsp; ${validTill}
      </div>
      <div class="cert-footer">
        <div class="cert-sign">
          <div class="cert-sign-line">Authorized Signatory</div>
          <div style="font-size:13px;font-weight:700;color:#1a4a8a;">Director, MPCC</div>
        </div>
        <div class="cert-seal">
          <div class="cert-seal-circle">MPCC<br/>OFFICIAL<br/>SEAL</div>
        </div>
        <div class="cert-sign">
          <div class="cert-sign-line">Compliance Officer</div>
          <div style="font-size:13px;font-weight:700;color:#1a4a8a;">MPCC, Haridwar</div>
        </div>
      </div>
    </div></div>
    <script>window.onload=function(){window.print();}</script>
    </body></html>`);
    printWindow.document.close();
  };

  const handleDeleteCertificate = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/certificates/${certId}`, { method: 'DELETE' });
      if (res.ok) {
        setCertificates(prev => prev.filter(c => c.CertificateID !== certId));
        alert('✅ Certificate deleted successfully.');
      } else {
        alert('❌ Error deleting certificate.');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Customer Registration action handlers
  const handleViewRegistration = (reg) => {
    setViewRegData(reg);
    setShowViewRegModal(true);
  };

  const handleEditRegistration = (reg) => {
    setEditingRegistration(true);
    setEditingRegistrationId(reg.RegistrationID);
    setWizardData({
      institutionName: reg.InstitutionName || '',
      institutionType: reg.InstitutionType || '',
      numberOfBeds: reg.NumberOfBeds || '',
      bmwRegNo: reg.BMWRegNo || '',
      fullAddress: reg.FullAddress || '',
      zone: reg.Zone || '',
      pincode: reg.Pincode || '',
      contactPerson: reg.ContactPerson || '',
      designation: reg.Designation || '',
      mobile: reg.Mobile || '',
      email: reg.Email || '',
      alternateMobile: reg.AlternateMobile || '',
      website: reg.Website || '',
      panNumber: reg.PANNumber || '',
      gstNumber: reg.GSTNumber || '',
      gpsLatitude: reg.GPSLatitude || '',
      gpsLongitude: reg.GPSLongitude || '',
      gpsAddress: reg.GPSAddress || '',
      photos: [],
      selectedPlan: reg.SelectedPlan || '',
      billingCycle: reg.BillingCycle || 'Monthly',
      contractStartDate: reg.ContractStartDate ? reg.ContractStartDate.split('T')[0] : '',
      contractDuration: reg.ContractDuration || '',
      paymentModePref: reg.PaymentModePref || 'Online (UPI/Gateway)',
      documents: {},
      paymentMethod: 'online'
    });
    setCurrentStep(1);
    setGpsPhotos([]);
    setShowWizardModal(true);
  };

  const handleDeleteRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/customer-registrations/${regId}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomerRegistrations(prev => prev.filter(r => r.RegistrationID !== regId));
        alert('✅ Registration deleted successfully.');
      } else {
        alert('❌ Error deleting registration.');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleApproveRegistration = async (reg) => {
    if (!window.confirm(`Approve registration for "${reg.InstitutionName}"?`)) return;
    try {
      const res = await fetch(`/api/customer-registrations/${reg.RegistrationID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        setCustomerRegistrations(prev => prev.map(r => r.RegistrationID === reg.RegistrationID ? { ...r, Status: 'Approved' } : r));
        alert('✅ Registration approved successfully!');
      } else {
        alert('❌ Error approving registration.');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // ── Enable Portal Modal State ──────────────────────────────────────────────
  const [showEnablePortalModal, setShowEnablePortalModal] = React.useState(false);
  const [portalTargetReg, setPortalTargetReg] = React.useState(null);
  const [portalPinInput, setPortalPinInput] = React.useState('');
  const [portalEnableMsg, setPortalEnableMsg] = React.useState('');
  const [portalEnableLoading, setPortalEnableLoading] = React.useState(false);

  const handleEnablePortal = (reg) => {
    setPortalTargetReg(reg);
    setPortalPinInput('');
    setPortalEnableMsg('');
    setShowEnablePortalModal(true);
  };

  const submitEnablePortal = async () => {
    if (!portalPinInput || portalPinInput.length !== 6) {
      setPortalEnableMsg('PIN must be exactly 6 digits.');
      return;
    }
    setPortalEnableLoading(true);
    try {
      const res = await fetch(`/api/customer-registrations/${portalTargetReg.RegistrationID}/enable-portal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: portalPinInput })
      });
      const data = await res.json();
      if (data.success) {
        let msg = `✅ Portal enabled! Member ID: ${data.customerId || portalTargetReg.CustomerID} · PIN: ${data.pin}`;
        if (data.emailSent) {
          msg += `\n📧 Credentials sent to ${portalTargetReg.Email}`;
        } else if (data.emailError) {
          msg += `\n⚠️ Email not sent: ${data.emailError}`;
        }
        setPortalEnableMsg(msg);
        // Update local state to show portal enabled
        setCustomerRegistrations(prev => prev.map(r => 
          r.RegistrationID === portalTargetReg.RegistrationID ? { ...r, PortalEnabled: true } : r
        ));
      } else {
        setPortalEnableMsg('❌ ' + (data.error || 'Failed to enable portal.'));
      }
    } catch (err) {
      setPortalEnableMsg('❌ Error: ' + err.message);
    }
    setPortalEnableLoading(false);
  };

  // Service Request Handlers
  const handleServiceReqInputChange = (e) => {
    const { name, value } = e.target;
    setServiceReqData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'registrationId') {
        const selectedReg = allRegistrations.find(r => String(r.RegistrationID) === String(value));
        updated.customerFacility = selectedReg ? selectedReg.InstitutionName : '';
      }
      return updated;
    });
  };

  const handleServiceReqSubmit = async () => {
    if (!serviceReqData.requestType || !serviceReqData.registrationId) {
      alert('Please fill in Request Type and select a Customer/Facility');
      return;
    }

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestType: serviceReqData.requestType,
          registrationId: parseInt(serviceReqData.registrationId),
          facilityName: serviceReqData.customerFacility,
          assignedToUserID: serviceReqData.assignedTo ? parseInt(serviceReqData.assignedTo) : null,
          scheduledDate: serviceReqData.scheduledDate || null,
          description: serviceReqData.description,
          status: serviceReqData.status
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Service request created successfully!');
        setShowServiceReqModal(false);

        // Refresh service requests table
        const refreshRes = await fetch('/api/service-requests');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setServiceRequests(Array.isArray(data) ? data : data.data || []);
        }

        setServiceReqData({
          requestId: 'SR-AUTO',
          requestType: '',
          registrationId: '',
          customerFacility: '',
          assignedTo: '',
          scheduledDate: '',
          description: '',
          status: 'Open'
        });
      } else {
        const error = await response.json();
        alert('Error creating service request: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      alert('Error creating service request: ' + error.message);
    }
  };

  // ── Follow-up handlers ──────────────────────────────────────────────
  const openFollowupModal = async (sr) => {
    setFollowupSR(sr);
    setFollowupForm({ status: sr.Status || 'Open', note: '' });
    setShowFollowupModal(true);
    setFollowupLoading(true);
    try {
      const res = await fetch(`/api/service-requests/${sr.RequestID}/followups`);
      if (res.ok) setFollowupHistory(await res.json());
      else setFollowupHistory([]);
    } catch { setFollowupHistory([]); }
    setFollowupLoading(false);
  };

  const handleFollowupSubmit = async () => {
    if (!followupForm.note.trim() && !followupForm.status) {
      alert('Please add a note or change the status before saving.');
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    setFollowupSaving(true);
    try {
      const res = await fetch(`/api/service-requests/${followupSR.RequestID}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusChanged: followupForm.status || followupSR.Status,
          note:          followupForm.note,
          updatedByUserID: currentUser.userId || currentUser.UserID || null,
          updatedByName:   currentUser.username || currentUser.name || currentUser.Username || 'Unknown'
        })
      });
      if (res.ok) {
        // Refresh history
        const hRes = await fetch(`/api/service-requests/${followupSR.RequestID}/followups`);
        if (hRes.ok) setFollowupHistory(await hRes.json());
        // Update parent SR status in local state
        setServiceRequests(prev => prev.map(r =>
          r.RequestID === followupSR.RequestID
            ? { ...r, Status: followupForm.status || r.Status, UpdatedAt: new Date().toISOString() }
            : r
        ));
        setFollowupSR(prev => ({ ...prev, Status: followupForm.status || prev.Status }));
        setFollowupForm(prev => ({ ...prev, note: '' }));
      } else {
        const err = await res.json();
        alert('Error saving follow-up: ' + (err.error || err.message));
      }
    } catch (e) { alert('Error: ' + e.message); }
    setFollowupSaving(false);
  };
  // ────────────────────────────────────────────────────────────────────

  // Customer MOU Handlers
  const handleMouInputChange = (e) => {
    const { name, value } = e.target;
    setMouData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'registrationId') {
        const selectedReg = allRegistrations.find(r => String(r.RegistrationID) === String(value));
        updated.customer = selectedReg ? selectedReg.InstitutionName : '';
      }
      return updated;
    });
  };

  const handleMouSubmit = async () => {
    if (!mouData.registrationId || !mouData.startDate || !mouData.endDate) {
      alert('Please select a Customer/Facility, Start Date, and End Date');
      return;
    }

    try {
      const response = await fetch('/api/customer-mou', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationId: parseInt(mouData.registrationId),
          facilityName: mouData.customer,
          startDate: mouData.startDate,
          endDate: mouData.endDate,
          contractValue: mouData.contractValue ? parseFloat(mouData.contractValue) : 0,
          termsConditions: mouData.termsConditions,
          status: mouData.status
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('MOU created successfully!');
        setShowMouModal(false);

        // Refresh MOUs table
        const refreshRes = await fetch('/api/customer-mou');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setMouRecords(Array.isArray(data) ? data : data.data || []);
        }

        setMouData({
          mouNumber: 'MOU-AUTO',
          registrationId: '',
          customer: '',
          startDate: '',
          endDate: '',
          contractValue: '',
          termsConditions: '',
          status: 'Active'
        });
      } else {
        const error = await response.json();
        alert('Error creating MOU: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting MOU:', error);
      alert('Error creating MOU: ' + error.message);
    }
  };

  // ── MOU View / Edit / Delete handlers ────────────────────────────
  const handleViewMou = (mou) => {
    setViewMouData(mou);
    setShowViewMouModal(true);
  };

  const handleEditMou = (mou) => {
    setEditingMou(true);
    setEditingMouId(mou.MOUID);
    setMouData({
      mouNumber: mou.MOUCode,
      registrationId: mou.RegistrationID || '',
      customer: mou.CustomerName || mou.FacilityName || '',
      startDate: mou.StartDate ? mou.StartDate.split('T')[0] : '',
      endDate:   mou.EndDate   ? mou.EndDate.split('T')[0]   : '',
      contractValue:  mou.ContractValue || '',
      termsConditions: mou.TermsConditions || '',
      status: mou.Status || 'Active'
    });
    setShowMouModal(true);
  };

  const handleDeleteMou = async (mouId) => {
    if (!window.confirm('Are you sure you want to delete this MOU? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/customer-mou/${mouId}`, { method: 'DELETE' });
      if (res.ok) {
        setMouRecords(prev => prev.filter(m => m.MOUID !== mouId));
      } else {
        alert('Error deleting MOU.');
      }
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleMouUpdate = async () => {
    if (!mouData.registrationId || !mouData.startDate || !mouData.endDate) {
      alert('Please select a Customer/Facility, Start Date, and End Date');
      return;
    }
    try {
      const res = await fetch(`/api/customer-mou/${editingMouId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId:  parseInt(mouData.registrationId),
          facilityName:    mouData.customer,
          startDate:       mouData.startDate,
          endDate:         mouData.endDate,
          contractValue:   mouData.contractValue ? parseFloat(mouData.contractValue) : 0,
          termsConditions: mouData.termsConditions,
          status:          mouData.status
        })
      });
      if (res.ok) {
        const refreshRes = await fetch('/api/customer-mou');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setMouRecords(Array.isArray(data) ? data : data.data || []);
        }
        setShowMouModal(false);
        setEditingMou(false);
        setEditingMouId(null);
        setMouData({ mouNumber:'MOU-AUTO', registrationId:'', customer:'', startDate:'', endDate:'', contractValue:'', termsConditions:'', status:'Active' });
      } else {
        const err = await res.json();
        alert('Error updating MOU: ' + (err.message || err.error));
      }
    } catch (e) { alert('Error: ' + e.message); }
  };
  // ─────────────────────────────────────────────────────────────────

  // Failed Registration Handlers
  const handleFailedRegInputChange = (e) => {
    const { name, value } = e.target;
    setFailedRegData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFailedRegSubmit = async () => {
    if (!failedRegData.facilityName || !failedRegData.mobile) {
      alert('Please fill in Facility Name and Mobile Number');
      return;
    }

    try {
      const response = await fetch('/api/failed-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityName: failedRegData.facilityName,
          contactPerson: failedRegData.contactPerson,
          mobile: failedRegData.mobile,
          planName: failedRegData.planName,
          amount: failedRegData.amount ? parseFloat(failedRegData.amount) : 0,
          errorCode: failedRegData.errorCode,
          failureReason: failedRegData.failureReason,
          attemptedDate: failedRegData.attemptedDate || new Date().toISOString(),
          status: 'Failed',
          chequeNo: failedRegData.chequeNo,
          chequeAmount: failedRegData.chequeAmount ? parseFloat(failedRegData.chequeAmount) : 0,
          bankName: failedRegData.bankName,
          chequeDate: failedRegData.chequeDate || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Payment retry details saved successfully!');
        setShowFailedRegModal(false);

        // Refresh failed registrations table
        const refreshRes = await fetch('/api/failed-registrations');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setFailedRegistrations(data.data || []);
        }

        setFailedRegData({
          registrationId: 'REG-AUTO',
          facilityName: '',
          contactPerson: '',
          mobile: '',
          planName: '',
          amount: '',
          errorCode: '',
          failureReason: '',
          attemptedDate: '',
          status: 'Failed',
          chequeNo: '',
          chequeAmount: '',
          bankName: '',
          chequeDate: ''
        });
      } else {
        const error = await response.json();
        alert('Error saving failure details: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting failed registration:', error);
      alert('Error saving failure details: ' + error.message);
    }
  };

  // Submenu items matching admin.html structure
  const subMenuItems = [
    { id: 'customer-reg', icon: '👥', label: 'Customer Registration' },
    { id: 'certificate', icon: '📜', label: 'Certificate Generation' },
    { id: 'servicereq', icon: '🔧', label: 'Service Requests' },
    { id: 'mou', icon: '📝', label: 'Customer MOU' },
    { id: 'failed-reg', icon: '⚠️', label: 'Failed Registrations' }
  ];

  // Content configuration for each submenu item
  const getSubModuleContent = () => {
    const configs = {
      'customer-reg': {
        title: 'Customer Registration',
        description: 'Customers registered via landing page — review, verify & approve',
        infoText: 'Customer Login Portal: Customers can login at mpccharidwar.in/portal using credentials sent via SMS/Email on registration approval. If login not working: (1) Check customer status is "Approved" below. (2) Click Actions – Resend Credentials from the customer row. (3) Ensure mobile/email is correct in profile.',
        stats: [
          { label: 'Total', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Pending', value: 0, className: 'creg-yellow' },
          { label: 'Inactive', value: 0, className: 'creg-red' }
        ],
        columns: ['Member ID', 'Institution Name', 'Category', 'Sub-Category', 'Zone', 'Route', 'Mobile', 'Email', 'Service Plan', 'Beds', 'Kit', 'Consulting', 'Compliance', 'Reg. Date', 'Status', 'QR Code', 'Actions'],
        tableId: 'custRegTable'
      },
      'certificate': {
        title: 'Certificate Generation',
        description: 'Generate BMW compliance certificates for registered customers',
        infoText: 'Generate and manage biomedical waste management certificates for customers. Issue certificates for regulatory compliance.',
        stats: [
          { label: 'Issued', value: 0, className: '' },
          { label: 'Pending', value: 0, className: 'creg-yellow' },
          { label: 'Expiring Soon', value: 0, className: 'creg-red' },
          { label: 'Total Members', value: 0, className: '' }
        ],
        columns: ['Certificate No.', 'Customer / Facility', 'Type', 'Issue Date', 'Valid Till', 'Status', 'Actions'],
        tableId: 'certTable'
      },
      'servicereq': {
        title: 'Service Requests',
        description: 'Track customer service requests and follow-ups',
        infoText: 'Manage all service requests from customers. Track status, assign to staff, and follow up for resolution.',
        stats: [
          { label: 'Total', value: 0, className: '' },
          { label: 'Pending', value: 0, className: 'creg-yellow' },
          { label: 'In Progress', value: 0, className: 'creg-yellow' },
          { label: 'Completed', value: 0, className: 'creg-green' }
        ],
        columns: ['Request ID', 'Customer', 'Request Type', 'Assigned To', 'Request Date', 'Last Follow-up', 'Status', 'Actions'],
        tableId: 'tbl-servicereq'
      },
      'mou': {
        title: 'Customer MOU',
        description: 'Memoranda of Understanding — A4 format preview & print',
        infoText: 'Manage customer MOUs. Preview in A4 format, print, and send to customers. Track MOU status and expiry.',
        stats: [
          { label: 'Total', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Under Review', value: 0, className: 'creg-yellow' },
          { label: 'Expired', value: 0, className: 'creg-red' }
        ],
        columns: ['MOU Number', 'Customer', 'Service Plan', 'Start Date', 'End Date', 'Contract Value', 'Status', 'Actions'],
        tableId: 'tbl-mou'
      },
      'failed-reg': {
        title: 'Failed Registrations',
        description: 'Review and manage registration failures and errors',
        infoText: 'Track failed customer registrations due to incomplete submissions, validation errors, or technical issues. Review failure reasons and take corrective action.',
        stats: [
          { label: 'Total Failed', value: 0, className: '' },
          { label: 'Pending Review', value: 0, className: 'creg-yellow' },
          { label: 'Resolved', value: 0, className: 'creg-green' },
          { label: 'Archived', value: 0, className: '' }
        ],
        columns: ['Registration ID', 'Institution Name', 'Failure Date', 'Failure Reason', 'Contact', 'Status', 'Actions'],
        tableId: 'tbl-failed'
      }
    };
    return configs[activeSubModule] || configs['customer-reg'];
  };

  const content = getSubModuleContent();

  const formStyles = {
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    rowCol1: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    field: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '6px'
    },
    input: {
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    },
    select: {
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      cursor: 'pointer'
    },
    textarea: {
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '13px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    }
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            {/* Institution Information */}
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Institution Information</div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Institution Name <span style={{color:'#ef4444'}}>*</span></label>
                  <input
                    type="text"
                    name="institutionName"
                    value={wizardData.institutionName}
                    onChange={handleWizardInputChange}
                    placeholder="Full legal name of institution"
                    style={formStyles.input}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Institution Type <span style={{color:'#ef4444'}}>*</span></label>
                  <select name="institutionType" value={wizardData.institutionType} onChange={handleWizardInputChange} style={formStyles.select}>
                    <option>-- Select --</option>
                    <option>Government Hospital</option>
                    <option>Private Hospital</option>
                    <option>Nursing Home</option>
                    <option>Clinic</option>
                    <option>Diagnostic Centre</option>
                    <option>Blood Bank</option>
                    <option>Pharmacy</option>
                    <option>Medical College</option>
                  </select>
                </div>
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Number of Beds</label>
                  <input
                    type="number"
                    name="numberOfBeds"
                    value={wizardData.numberOfBeds}
                    onChange={handleWizardInputChange}
                    placeholder="e.g. 50"
                    min="0"
                    style={formStyles.input}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>PCPNDT / BMW Reg. No.</label>
                  <input
                    type="text"
                    name="bmwRegNo"
                    value={wizardData.bmwRegNo}
                    onChange={handleWizardInputChange}
                    placeholder="Registration number"
                    style={formStyles.input}
                  />
                </div>
              </div>
              <div style={formStyles.rowCol1}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Full Address <span style={{color:'#ef4444'}}>*</span></label>
                  <textarea
                    name="fullAddress"
                    value={wizardData.fullAddress}
                    onChange={handleWizardInputChange}
                    placeholder="Street, Area, City, State, Pincode"
                    rows="2"
                    style={{...formStyles.textarea, minHeight: '80px'}}
                  />
                </div>
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Zone <span style={{color:'#ef4444'}}>*</span></label>
                  <select name="zone" value={wizardData.zone} onChange={handleWizardInputChange} style={formStyles.select}>
                    <option>-- Select Zone --</option>
                    {zones.map((zone, idx) => (
                      <option key={idx} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={wizardData.pincode}
                    onChange={handleWizardInputChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    style={formStyles.input}
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Contact Details</div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Contact Person <span style={{color:'#ef4444'}}>*</span></label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={wizardData.contactPerson}
                    onChange={handleWizardInputChange}
                    placeholder="Name of authorised person"
                    style={formStyles.input}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={wizardData.designation}
                    onChange={handleWizardInputChange}
                    placeholder="e.g. Medical Superintendent"
                    style={formStyles.input}
                  />
                </div>
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Mobile <span style={{color:'#ef4444'}}>*</span></label>
                  <input
                    type="tel"
                    name="mobile"
                    value={wizardData.mobile}
                    onChange={handleWizardInputChange}
                    placeholder="10-digit mobile"
                    maxLength="10"
                    style={formStyles.input}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Email <span style={{color:'#ef4444'}}>*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={wizardData.email}
                    onChange={handleWizardInputChange}
                    placeholder="official@hospital.in"
                    style={formStyles.input}
                  />
                </div>
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Alternate Mobile</label>
                  <input
                    type="tel"
                    name="alternateMobile"
                    value={wizardData.alternateMobile}
                    onChange={handleWizardInputChange}
                    placeholder="Optional"
                    maxLength="10"
                    style={formStyles.input}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={wizardData.website}
                    onChange={handleWizardInputChange}
                    placeholder="https://hospital.in (optional)"
                    style={formStyles.input}
                  />
                </div>
              </div>
            </div>

            {/* Legal & Tax */}
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Legal & Tax</div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={wizardData.panNumber}
                    onChange={handleWizardInputChange}
                    placeholder="AAAAA9999A"
                    maxLength="10"
                    style={{...formStyles.input, textTransform:'uppercase'}}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={wizardData.gstNumber}
                    onChange={handleWizardInputChange}
                    placeholder="15-digit GSTIN"
                    maxLength="15"
                    style={{...formStyles.input, textTransform:'uppercase'}}
                  />
                </div>
              </div>
            </div>

            {/* GPS & Photos */}
            <div style={{marginTop:'14px', border:'2px solid #c4b5fd', borderRadius:'12px', padding:'16px'}}>
              <div style={{fontSize:'14px', fontWeight:'700', color:'#5b21b6', display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
                📍 GPS Location & Facility Photos <span style={{background:'#fee2e2', color:'#b91c1c', borderRadius:'20px', padding:'2px 8px', fontSize:'10px', fontWeight:'700'}}>Required</span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>GPS Latitude</label>
                  <input
                    type="text"
                    name="gpsLatitude"
                    value={wizardData.gpsLatitude}
                    onChange={handleWizardInputChange}
                    placeholder="Auto-filled by GPS"
                    readOnly
                    style={{...formStyles.input, background:'#f8fafc'}}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>GPS Longitude</label>
                  <input
                    type="text"
                    name="gpsLongitude"
                    value={wizardData.gpsLongitude}
                    onChange={handleWizardInputChange}
                    placeholder="Auto-filled by GPS"
                    readOnly
                    style={{...formStyles.input, background:'#f8fafc'}}
                  />
                </div>
              </div>
              <div style={formStyles.field}>
                <label style={formStyles.label}>Address (Auto-detected)</label>
                <input
                  type="text"
                  name="gpsAddress"
                  value={wizardData.gpsAddress}
                  onChange={handleWizardInputChange}
                  placeholder="Will be filled after GPS capture"
                  readOnly
                  style={{...formStyles.input, background:'#f8fafc', marginBottom:'12px'}}
                />
              </div>
              <div style={{display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap'}}>
                <button type="button" style={{background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'12px', fontWeight:'700', cursor:'pointer'}}>
                  📍 Capture GPS Now
                </button>
                <button type="button" style={{background:'#f1f5f9', color:'#374151', border:'1.5px solid #e2e8f0', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', fontWeight:'700', cursor:'pointer'}}>
                  ✏️ Enter Manually
                </button>
              </div>
              {/* Facility Photos */}
              <div style={{fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'6px'}}>📷 Facility Photos</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'8px'}}>
                <div onClick={() => document.getElementById('photo-input').click()} style={{border:'1.5px dashed #cbd5e1', borderRadius:'10px', padding:'14px', textAlign:'center', cursor:'pointer'}}>
                  <div style={{fontSize:'24px', marginBottom:'4px'}}>🏥</div>
                  <div style={{fontSize:'11px', fontWeight:'700', color:'#475569'}}>Front View *</div>
                </div>
                <div onClick={() => document.getElementById('photo-input').click()} style={{border:'1.5px dashed #cbd5e1', borderRadius:'10px', padding:'14px', textAlign:'center', cursor:'pointer'}}>
                  <div style={{fontSize:'24px', marginBottom:'4px'}}>🪧</div>
                  <div style={{fontSize:'11px', fontWeight:'700', color:'#475569'}}>Name Board *</div>
                </div>
                <div onClick={() => document.getElementById('photo-input').click()} style={{border:'1.5px dashed #cbd5e1', borderRadius:'10px', padding:'14px', textAlign:'center', cursor:'pointer'}}>
                  <div style={{fontSize:'24px', marginBottom:'4px'}}>🚪</div>
                  <div style={{fontSize:'11px', fontWeight:'700', color:'#475569'}}>Entry Gate</div>
                </div>
              </div>
              <input
                type="file"
                id="photo-input"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{display:'none'}}
              />
              {gpsPhotos.length > 0 && (
                <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'8px'}}>
                  {gpsPhotos.map((photo, idx) => (
                    <div key={idx} style={{position:'relative', display:'inline-block'}}>
                      <img src={photo} alt={`photo-${idx}`} style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover', border:'2px solid #c4b5fd'}} />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        style={{position:'absolute', top:'-5px', right:'-5px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'50%', width:'17px', height:'17px', fontSize:'9px', cursor:'pointer', fontWeight:'700'}}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Select Service Plan</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
                {[
                  {id: 1, name: 'PLN-001 — Basic Hospital Plan', desc: 'Biomedical Waste • Daily Collection', price: '₹2,500', tags: ['Yellow Bag', 'Red Container', 'GST 18%']},
                  {id: 2, name: 'PLN-002 — Clinic Standard', desc: 'Sharps Waste • Alt. Days Collection', price: '₹1,200', tags: ['Yellow Bag', 'GST 18%']},
                  {id: 3, name: 'PLN-003 — Diagnostic Lab Plan', desc: 'Chemical Waste • Weekly Collection', price: '₹3,800', tags: ['Autoclave Bag', 'Chemical Kit', 'GST 18%']}
                ].map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id, plan.name, plan.price)}
                    style={{
                      border: wizardData.selectedPlan === plan.name ? '2px solid #7c3aed' : '2px solid #e2e8f0',
                      borderRadius:'12px',
                      padding:'16px',
                      cursor:'pointer',
                      transition:'all .2s',
                      background: wizardData.selectedPlan === plan.name ? '#ede9fe' : '#fff'
                    }}
                  >
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <div>
                        <div style={{fontWeight:'700', color:'#1e293b'}}>{plan.name}</div>
                        <div style={{fontSize:'12px', color:'#64748b', marginTop:'2px'}}>{plan.desc}</div>
                      </div>
                      <div style={{fontSize:'18px', fontWeight:'800', color:'#7c3aed'}}>{plan.price}<span style={{fontSize:'11px', fontWeight:'500'}}>/mo</span></div>
                    </div>
                    <div style={{marginTop:'10px', display:'flex', gap:'6px', flexWrap:'wrap'}}>
                      {plan.tags.map((tag, idx) => (
                        <span key={idx} style={{background:'#ede9fe', color:'#7c3aed', fontSize:'10px', padding:'2px 8px', borderRadius:'20px'}}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:'#f8fafc', borderRadius:'8px', padding:'12px 16px', border:'1px solid #e2e8f0'}}>
                <div style={{fontSize:'12px', color:'#64748b'}}>
                  {wizardData.selectedPlan ? `Selected: ${wizardData.selectedPlan}` : 'No plan selected. Click a plan above to select.'}
                </div>
              </div>
            </div>

            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Billing Preference</div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Billing Cycle</label>
                  <select name="billingCycle" value={wizardData.billingCycle} onChange={handleWizardInputChange} style={formStyles.select}>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Half-Yearly</option>
                    <option>Annual</option>
                  </select>
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Contract Start Date</label>
                  <input
                    type="date"
                    name="contractStartDate"
                    value={wizardData.contractStartDate}
                    onChange={handleWizardInputChange}
                    style={formStyles.input}
                  />
                </div>
              </div>
              <div style={formStyles.row}>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Contract Duration (months)</label>
                  <input
                    type="number"
                    name="contractDuration"
                    value={wizardData.contractDuration}
                    onChange={handleWizardInputChange}
                    placeholder="12"
                    min="1"
                    style={formStyles.input}
                  />
                </div>
                <div style={formStyles.field}>
                  <label style={formStyles.label}>Payment Mode Preference</label>
                  <select name="paymentModePref" value={wizardData.paymentModePref} onChange={handleWizardInputChange} style={formStyles.select}>
                    <option>Online (UPI/Gateway)</option>
                    <option>NEFT / RTGS</option>
                    <option>Cheque (HO submission only)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Required Documents</div>
              <div style={{background:'#dbeafe', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', fontSize:'12px', color:'#1e40af', display:'flex', alignItems:'center', gap:'6px'}}>
                <span>ℹ️</span> All documents are mandatory for registration approval. Accepted formats: PDF, JPG, PNG (max 5MB each).
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                {[
                  {icon: '📄', title: 'Registration Certificate', desc: 'Hospital/Clinic Reg. Certificate'},
                  {icon: '🏢', title: 'PCB / BMW Authorization', desc: 'Pollution Control Board Authorization'},
                  {icon: '📋', title: 'PAN Card', desc: 'Institution / Owner PAN Card'},
                  {icon: '🏦', title: 'Cancelled Cheque', desc: 'Bank account verification'},
                  {icon: '📸', title: 'Facility Photograph', desc: 'Front view of the facility'},
                  {icon: '🪪', title: 'Aadhar Card *', desc: 'Front & Back — Authorised Contact Person'}
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => document.getElementById(`doc-input-${idx}`).click()}
                    style={{border:'1.5px dashed #cbd5e1', borderRadius:'10px', padding:'14px', textAlign:'center', cursor:'pointer'}}
                  >
                    <div style={{fontSize:'24px', marginBottom:'4px'}}>{doc.icon}</div>
                    <div style={{fontSize:'12px', fontWeight:'700', color:'#475569'}}>{doc.title}</div>
                    <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'2px'}}>{doc.desc}</div>
                    <input
                      type="file"
                      id={`doc-input-${idx}`}
                      accept=".pdf,.jpg,.png"
                      style={{display:'none'}}
                    />
                    <div style={{marginTop:'8px', fontSize:'11px', color:'#7c3aed', fontWeight:'600'}}>📁 Click to upload</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>QR Code for Attendance</div>
              <div style={{background:'#f0fdf4', borderRadius:'10px', padding:'14px 16px', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'80px', height:'80px', background:'#e2e8f0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px'}}>📲</div>
                <div>
                  <div style={{fontWeight:'700', color:'#065f46', fontSize:'14px'}}>Attendance QR Code</div>
                  <div style={{fontSize:'12px', color:'#047857', marginTop:'2px'}}>A unique QR code will be generated on registration completion.</div>
                  <div style={{fontSize:'12px', color:'#047857', marginTop:'2px'}}>Print and affix at the facility entrance for driver scan.</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div style={formStyles.section}>
              <div style={formStyles.sectionTitle}>Payment Summary</div>
              <div style={{background:'#fef3c7', borderRadius:'10px', padding:'12px 16px', border:'1.5px solid #fbbf24', marginBottom:'14px', display:'flex', alignItems:'flex-start', gap:'10px'}}>
                <span style={{fontSize:'18px'}}>⚠️</span>
                <div style={{fontSize:'12px', color:'#92400e', fontWeight:'600'}}>6-Month Advance Payment is MANDATORY at registration. Account will be activated only after advance receipt.</div>
              </div>
              <div style={{background:'#f8fafc', borderRadius:'10px', padding:'16px', border:'1px solid #e2e8f0', marginBottom:'16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px'}}>
                  <span style={{color:'#64748b'}}>Selected Plan:</span>
                  <span style={{fontWeight:'600'}}>{wizardData.selectedPlan || 'PLN-001 — Basic Hospital Plan'}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px'}}>
                  <span style={{color:'#64748b'}}>Monthly Rate (incl. GST):</span>
                  <span style={{fontWeight:'600'}}>₹2,950.00</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px', background:'#ede9fe', padding:'6px 10px', borderRadius:'6px', margin:'0 -4px 8px'}}>
                  <span style={{color:'#5b21b6', fontWeight:'700'}}>6-Month Advance (Mandatory):</span>
                  <span style={{fontWeight:'800', color:'#5b21b6'}}>₹17,700.00</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'13px'}}>
                  <span style={{color:'#64748b'}}>Security Deposit:</span>
                  <span style={{fontWeight:'600'}}>₹0.00</span>
                </div>
                <div style={{height:'1px', background:'#e2e8f0', margin:'10px 0'}}></div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'16px', fontWeight:'800'}}>
                  <span>Total Payable at Registration:</span>
                  <span style={{color:'#7c3aed'}}>₹17,700.00</span>
                </div>
              </div>

              <div style={formStyles.sectionTitle}>Payment Method</div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <label style={{display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', border:'2px solid #e2e8f0', borderRadius:'10px', cursor:'pointer'}}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={wizardData.paymentMethod === 'online'}
                    onChange={handleWizardInputChange}
                  />
                  <div>
                    <div style={{fontWeight:'700', fontSize:'13px'}}>💳 Online Payment (Gateway)</div>
                    <div style={{fontSize:'11px', color:'#64748b'}}>Credit/Debit Card, UPI, Net Banking</div>
                  </div>
                </label>
                <label style={{display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', border:'2px solid #e2e8f0', borderRadius:'10px', cursor:'pointer'}}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="neft"
                    checked={wizardData.paymentMethod === 'neft'}
                    onChange={handleWizardInputChange}
                  />
                  <div>
                    <div style={{fontWeight:'700', fontSize:'13px'}}>🏛️ NEFT / RTGS Transfer</div>
                    <div style={{fontSize:'11px', color:'#64748b'}}>Transfer to MPCC bank account. Share UTR after transfer.</div>
                  </div>
                </label>
              </div>

              {wizardData.paymentMethod === 'neft' && (
                <div style={{marginTop:'12px', background:'#dbeafe', borderRadius:'10px', padding:'14px', border:'1px solid #bfdbfe'}}>
                  <div style={{fontSize:'12px', fontWeight:'700', color:'#1e40af', marginBottom:'8px'}}>🏛️ MPCC Bank Details</div>
                  <div style={{fontSize:'12px', color:'#1e40af', lineHeight:'1.8'}}>
                    <strong>Account Name:</strong> Medical Pollution Control Committee<br/>
                    <strong>Account No:</strong> 12345678901234<br/>
                    <strong>IFSC:</strong> SBIN0001234<br/>
                    <strong>Bank:</strong> State Bank of India, Haridwar Branch
                  </div>
                  <div style={{marginTop:'10px'}}>
                    <label style={{fontSize:'12px', fontWeight:'700', color:'#1e40af'}}>UTR / Reference No. <span style={{color:'#ef4444'}}>*</span></label>
                    <input
                      type="text"
                      placeholder="Enter UTR number after transfer"
                      style={{width:'100%', marginTop:'4px', border:'1.5px solid #93c5fd', borderRadius:'6px', padding:'6px 10px', fontSize:'12px'}}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: 'calc(100vh - 100px)', position: 'relative' }}>
      {/* Submenu Sidebar */}
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
          {!sidebarCollapsed && <span>Customer</span>}
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
            className={`submenu-item ${activeSubModule === item.id ? 'active' : ''}`}
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

      {/* Main Content Area */}
      <div className="submenu-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-export">📋 Export</button>
            {activeSubModule === 'customer-reg' && (
              <button className="btn btn-primary" onClick={() => { resetWizard(); setShowWizardModal(true); }}>
                + New {content.title.split(' ')[0]}
              </button>
            )}
            {activeSubModule === 'certificate' && (
              <button className="btn btn-primary" onClick={() => { resetCertificateForm(); setShowCertificateModal(true); }}>
                + New {content.title.split(' ')[0]}
              </button>
            )}
            {activeSubModule === 'servicereq' && (
              <button className="btn btn-primary" onClick={() => { setServiceReqData({...serviceReqData, requestId: 'SR-AUTO'}); setShowServiceReqModal(true); }}>
                + New {content.title.split(' ')[0]}
              </button>
            )}
            {activeSubModule === 'mou' && (
              <button className="btn btn-primary" onClick={() => { setMouData({...mouData, mouNumber: 'MOU-AUTO'}); setShowMouModal(true); }}>
                + New {content.title.split(' ')[0]}
              </button>
            )}
            {activeSubModule === 'failed-reg' && (
              <button className="btn btn-primary" onClick={() => { setFailedRegData({...failedRegData, registrationId: 'REG-AUTO'}); setShowFailedRegModal(true); }}>
                + New {content.title.split(' ')[0]}
              </button>
            )}
            {activeSubModule !== 'customer-reg' && activeSubModule !== 'certificate' && activeSubModule !== 'servicereq' && activeSubModule !== 'mou' && activeSubModule !== 'failed-reg' && (
              <button className="btn btn-primary">+ New {content.title.split(' ')[0]}</button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <span className="info-icon">🔑</span>
          <div className="info-text">
            <strong>{content.title}:</strong> {content.infoText}
          </div>
        </div>

        {/* Statistics Cards - Dynamic from real data */}
        <div className="creg-stats">
          {activeSubModule === 'customer-reg' && (
            <>
              <div className="creg-stat"><span className="creg-stat-val">{customerRegistrations.length}</span><span className="creg-stat-lbl">Total</span></div>
              <div className="creg-stat creg-green"><span className="creg-stat-val">{customerRegistrations.filter(r => r.Status === 'Approved' || r.Status === 'Active').length}</span><span className="creg-stat-lbl">Active</span></div>
              <div className="creg-stat creg-yellow"><span className="creg-stat-val">{customerRegistrations.filter(r => r.Status === 'Pending').length}</span><span className="creg-stat-lbl">Pending</span></div>
              <div className="creg-stat creg-red"><span className="creg-stat-val">{customerRegistrations.filter(r => r.Status === 'Rejected' || r.Status === 'Inactive').length}</span><span className="creg-stat-lbl">Inactive</span></div>
            </>
          )}
          {activeSubModule === 'servicereq' && (
            <>
              <div className="creg-stat"><span className="creg-stat-val">{serviceRequests.length}</span><span className="creg-stat-lbl">Total</span></div>
              <div className="creg-stat creg-yellow"><span className="creg-stat-val">{serviceRequests.filter(r => r.Status === 'Pending').length}</span><span className="creg-stat-lbl">Pending</span></div>
              <div className="creg-stat creg-yellow"><span className="creg-stat-val">{serviceRequests.filter(r => r.Status === 'In Progress').length}</span><span className="creg-stat-lbl">In Progress</span></div>
              <div className="creg-stat creg-green"><span className="creg-stat-val">{serviceRequests.filter(r => r.Status === 'Completed').length}</span><span className="creg-stat-lbl">Completed</span></div>
            </>
          )}
          {activeSubModule === 'mou' && (
            <>
              <div className="creg-stat"><span className="creg-stat-val">{mouRecords.length}</span><span className="creg-stat-lbl">Total</span></div>
              <div className="creg-stat creg-green"><span className="creg-stat-val">{mouRecords.filter(r => r.Status === 'Active').length}</span><span className="creg-stat-lbl">Active</span></div>
              <div className="creg-stat creg-yellow"><span className="creg-stat-val">{mouRecords.filter(r => r.Status === 'Under Review').length}</span><span className="creg-stat-lbl">Under Review</span></div>
              <div className="creg-stat creg-red"><span className="creg-stat-val">{mouRecords.filter(r => r.Status === 'Expired').length}</span><span className="creg-stat-lbl">Expired</span></div>
            </>
          )}
          {activeSubModule === 'failed-reg' && (
            <>
              <div className="creg-stat"><span className="creg-stat-val">{failedRegistrations.length}</span><span className="creg-stat-lbl">Total Failed</span></div>
              <div className="creg-stat creg-yellow"><span className="creg-stat-val">{failedRegistrations.filter(r => r.Status === 'Failed').length}</span><span className="creg-stat-lbl">Pending Review</span></div>
              <div className="creg-stat creg-green"><span className="creg-stat-val">{failedRegistrations.filter(r => r.Status === 'Resolved').length}</span><span className="creg-stat-lbl">Resolved</span></div>
              <div className="creg-stat"><span className="creg-stat-val">{failedRegistrations.filter(r => r.Status === 'Abandoned').length}</span><span className="creg-stat-lbl">Archived</span></div>
            </>
          )}
          {activeSubModule === 'certificate' && (
            <>
              <div className="creg-stat"><span className="creg-stat-val">{certificates.filter(c => c.Status === 'Active').length}</span><span className="creg-stat-lbl">Issued</span></div>
              <div className="creg-stat creg-yellow"><span className="creg-stat-val">{certificates.filter(c => c.Status === 'Pending').length}</span><span className="creg-stat-lbl">Pending</span></div>
              <div className="creg-stat creg-red"><span className="creg-stat-val">{certificates.filter(c => {
                if (!c.ValidTill) return false;
                const diff = (new Date(c.ValidTill) - new Date()) / (1000*60*60*24);
                return diff <= 30 && diff > 0;
              }).length}</span><span className="creg-stat-lbl">Expiring Soon</span></div>
              <div className="creg-stat"><span className="creg-stat-val">{customers.length}</span><span className="creg-stat-lbl">Total Members</span></div>
            </>
          )}
        </div>

        {/* Row count */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>
            Showing <strong style={{ color:'#1e293b' }}>
              {activeSubModule==='customer-reg' ? customerRegistrations.length
               : activeSubModule==='certificate' ? certificates.length
               : activeSubModule==='servicereq' ? serviceRequests.length
               : activeSubModule==='mou' ? mouRecords.length
               : failedRegistrations.length}
            </strong> records
          </span>
        </div>

        {/* Table Section */}
        <div className="table-wrap">
          <table id={content.tableId} style={{minWidth: '1400px'}}>
            <thead>
              <tr>
                {content.columns && content.columns.map((col, idx) => (
                  <th key={idx} style={{whiteSpace: 'nowrap'}}>{col}</th>
                ))}
              </tr>
              <tr className="filter-row">
                {content.columns && content.columns.map((col, idx) => (
                  <th key={idx}>
                    {idx < 3 ? (
                      <input
                        type="text"
                        placeholder={`${col.slice(0, 10)}...`}
                        onChange={(e) => handleFilterChange(e, col)}
                      />
                    ) : idx === content.columns.length - 2 ? (
                      <select onChange={(e) => handleFilterChange(e, col)}>
                        <option>All</option>
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Inactive</option>
                      </select>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSubModule === 'customer-reg' && customerRegistrations.length > 0 ? (
                customerRegistrations.map((reg, idx) => (
                  <tr key={idx}>
                    <td><span style={{display:'inline-block',background:'linear-gradient(135deg,#5b21b6,#7c3aed)',color:'#fff',fontWeight:800,fontSize:12,borderRadius:6,padding:'3px 9px'}}>{reg.CustomerID || reg.RegistrationCode || 'N/A'}</span></td>
                    <td style={{fontWeight:800,color:'#0f172a'}}>{reg.InstitutionName}</td>
                    <td><span style={{background:'#e2e8f0',color:'#1e293b',fontSize:11,fontWeight:700,borderRadius:5,padding:'3px 8px'}}>{reg.Category || reg.InstitutionType || 'N/A'}</span></td>
                    <td style={{fontWeight:600}}>{reg.SubCategory || '—'}</td>
                    <td><span style={{background:'#ede9fe',color:'#4c1d95',fontSize:11,fontWeight:800,borderRadius:5,padding:'3px 8px'}}>{reg.Zone || '—'}</span></td>
                    <td><span style={{background:'#dbeafe',color:'#1e40af',fontSize:11,fontWeight:800,borderRadius:5,padding:'3px 8px'}}>{reg.Route || '—'}</span></td>
                    <td style={{fontWeight:800,color:'#1d4ed8'}}>{reg.Mobile || '—'}</td>
                    <td style={{fontWeight:600,color:'#0f172a'}}>{reg.Email || '—'}</td>
                    <td style={{fontWeight:700}}>{reg.SelectedPlan || '—'}</td>
                    <td style={{fontWeight:700,textAlign:'center'}}>{reg.NumberOfBeds || 0}</td>
                    <td style={{fontWeight:600}}>{reg.Kit || '—'}</td>
                    <td style={{fontWeight:600}}>{reg.Consulting || '—'}</td>
                    <td style={{fontWeight:600}}>{reg.Compliance || '—'}</td>
                    <td style={{fontWeight:700,color:'#374151'}}>{reg.RegistrationDate ? new Date(reg.RegistrationDate).toLocaleDateString('en-IN') : (reg.CreatedAt ? new Date(reg.CreatedAt).toLocaleDateString('en-IN') : '—')}</td>
                    <td><span style={{padding:'4px 10px',borderRadius:20,fontWeight:800,fontSize:11, background:reg.Status==='Approved'?'#d1fae5':reg.Status==='Pending'?'#fef3c7':'#fee2e2', color:reg.Status==='Approved'?'#065f46':reg.Status==='Pending'?'#92400e':'#7f1d1d'}}>{reg.Status}</span></td>
                    <td style={{fontWeight:600,color:'#94a3b8',textAlign:'center'}}>—</td>
                    <td style={{whiteSpace:'nowrap'}}>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={() => handleViewRegistration(reg)} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>👁 View</button>
                        <button onClick={() => handleEditRegistration(reg)} style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>✏ Edit</button>
                        {reg.Status === 'Pending' && (
                          <button onClick={() => handleApproveRegistration(reg)} style={{background:'linear-gradient(135deg,#16a34a,#22c55e)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>✓ Approve</button>
                        )}
                        <button onClick={() => handleEnablePortal(reg)} style={{background:reg.PortalEnabled?'linear-gradient(135deg,#16a34a,#15803d)':'linear-gradient(135deg,#5b21b6,#7c3aed)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>🔐 {reg.PortalEnabled?'✓':'Portal'}</button>
                        <button onClick={() => handleDeleteRegistration(reg.RegistrationID)} style={{background:'linear-gradient(135deg,#dc2626,#ef4444)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 9px',borderRadius:6}}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : activeSubModule === 'certificate' && certificates.length > 0 ? (
                certificates.map((cert, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight:'600', color:'#1a4a8a'}}>{cert.CertificateCode}</td>
                    <td>{cert.CustomerName}</td>
                    <td>
                      <span style={{padding:'3px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:'700',
                        background: cert.CertificateType === 'Annual' ? '#dbeafe' : cert.CertificateType === 'Renewal' ? '#d1fae5' : '#fef3c7',
                        color: cert.CertificateType === 'Annual' ? '#1d4ed8' : cert.CertificateType === 'Renewal' ? '#065f46' : '#92400e'
                      }}>{cert.CertificateType}</span>
                    </td>
                    <td>{cert.IssueDate ? new Date(cert.IssueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{cert.ValidTill ? new Date(cert.ValidTill).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span style={{padding:'4px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600',
                        background: cert.Status === 'Active' ? '#d1fae5' : cert.Status === 'Expired' ? '#fee2e2' : '#fef3c7',
                        color: cert.Status === 'Active' ? '#065f46' : cert.Status === 'Expired' ? '#7f1d1d' : '#92400e'
                      }}>{cert.Status}</span>
                    </td>
                    <td style={{textAlign:'center', whiteSpace:'nowrap'}}>
                        <button onClick={() => handleViewCertificate(cert)} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>👁 View</button>
                        <button onClick={() => handlePrintCertificate(cert)} style={{background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>🖨 Print</button>
                        <button onClick={() => handleDeleteCertificate(cert.CertificateID)} style={{background:'linear-gradient(135deg,#dc2626,#ef4444)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 9px',borderRadius:6}}>🗑</button>
                    </td>
                  </tr>
                ))
              ) : activeSubModule === 'servicereq' && serviceRequests.length > 0 ? (
                serviceRequests.map((req, idx) => (
                  <tr key={idx}
                      onClick={() => openFollowupModal(req)}
                      style={{cursor:'pointer', transition:'background 0.15s'}}>
                    <td style={{color:'#7c3aed', fontWeight:'600'}}>{req.RequestCode}</td>
                    <td>{req.CustomerName}</td>
                    <td>{req.RequestType}</td>
                    <td>{req.AssignedUserName || <span style={{color:'#94a3b8'}}>Unassigned</span>}</td>
                    <td>{req.CreatedAt ? new Date(req.CreatedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>{req.UpdatedAt ? new Date(req.UpdatedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span style={{
                        background: req.Status==='Completed'?'#dcfce7':req.Status==='In Progress'?'#dbeafe':req.Status==='Cancelled'?'#fee2e2':'#fef9c3',
                        color:      req.Status==='Completed'?'#15803d':req.Status==='In Progress'?'#1d4ed8':req.Status==='Cancelled'?'#dc2626':'#92400e',
                        padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700'
                      }}>{req.Status}</span>
                    </td>
                    <td style={{textAlign:'center'}} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openFollowupModal(req)} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 11px',borderRadius:6}}>Follow-up</button>
                    </td>
                  </tr>
                ))
              ) : activeSubModule === 'mou' && mouRecords.length > 0 ? (
                mouRecords.map((mou, idx) => (
                  <tr key={idx} style={{transition:'background 0.15s'}}>
                    <td style={{fontWeight:'600', color:'#7c3aed'}}>{mou.MOUCode}</td>
                    <td>{mou.CustomerName}</td>
                    <td>--</td>
                    <td>{mou.StartDate ? new Date(mou.StartDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>{mou.EndDate ? new Date(mou.EndDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td style={{fontWeight:'600'}}>₹{Number(mou.ContractValue || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{
                        background: mou.Status==='Active'?'#dcfce7':mou.Status==='Expired'?'#fee2e2':mou.Status==='Terminated'?'#fef3c7':'#dbeafe',
                        color:      mou.Status==='Active'?'#15803d':mou.Status==='Expired'?'#dc2626':mou.Status==='Terminated'?'#92400e':'#1d4ed8',
                        padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700'
                      }}>{mou.Status}</span>
                    </td>
                    <td style={{textAlign:'center', whiteSpace:'nowrap'}}>
                        <button onClick={() => handleViewMou(mou)} style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>👁 View</button>
                        <button onClick={() => handleEditMou(mou)} style={{background:'linear-gradient(135deg,#0369a1,#0ea5e9)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 10px',borderRadius:6}}>✏ Edit</button>
                        <button onClick={() => handleDeleteMou(mou.MOUID)} style={{background:'linear-gradient(135deg,#dc2626,#ef4444)',border:'none',color:'#fff',cursor:'pointer',fontSize:'11px',fontWeight:800,padding:'5px 9px',borderRadius:6}}>🗑</button>
                    </td>
                  </tr>
                ))
              ) : activeSubModule === 'failed-reg' && failedRegistrations.length > 0 ? (
                failedRegistrations.map((reg, idx) => (
                  <tr key={idx}>
                    <td>{reg.FailureCode}</td>
                    <td>{reg.FacilityName}</td>
                    <td>{reg.AttemptedDate ? new Date(reg.AttemptedDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{reg.FailureReason}</td>
                    <td>{reg.Mobile}</td>
                    <td>{reg.Status}</td>
                    <td style={{textAlign: 'center'}}>
                      <button style={{background:'none', border:'none', color:'#7c3aed', cursor:'pointer', fontSize:'12px'}}>Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={content.columns.length} style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                    {loadingData ? (
                      <span>⏳ Loading data from database...</span>
                    ) : (
                      <div>
                        <div style={{fontSize: '24px', marginBottom: '8px'}}>📭</div>
                        <div style={{fontWeight: '600', color: '#64748b', marginBottom: '8px'}}>No records found</div>
                        <button
                          onClick={() => setActiveSubModule(prev => { const t = prev; setActiveSubModule('_'); setTimeout(() => setActiveSubModule(t), 100); return prev; })}
                          style={{background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer'}}
                        >
                          🔄 Refresh Data
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Registration Wizard Modal */}
      {showWizardModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={() => setShowWizardModal(false)}>
          <div style={{background:'white', borderRadius:'12px', maxWidth:'820px', width:'96vw', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #e2e8f0', padding:'20px 24px'}}>
              <div style={{width:'48px', height:'48px', background:'#dbeafe', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>🏥</div>
              <div>
                <h3 style={{margin:'0 0 4px 0', fontSize:'18px', fontWeight:'700'}}>{editingRegistration ? '✏️ Edit Registration' : 'Customer Registration'}</h3>
                <p style={{margin:0, fontSize:'13px', color:'#64748b'}}>Step {currentStep} of 4 — {['Institution Details', 'Service Plan', 'Documents & QR', 'Payment'][currentStep-1]}</p>
              </div>
              <button onClick={() => setShowWizardModal(false)} style={{marginLeft:'auto', background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#94a3b8'}}>×</button>
            </div>

            {/* Step Progress Bar */}
            <div style={{display:'flex', gap:0, borderBottom:'1px solid #e2e8f0', padding:'0 24px'}}>
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  style={{
                    flex:1,
                    textAlign:'center',
                    padding:'10px 4px',
                    borderBottom:`3px solid ${currentStep === step ? '#3b82f6' : step < currentStep ? '#10b981' : '#e2e8f0'}`,
                    fontSize:'12px',
                    fontWeight: currentStep === step ? '700' : '600',
                    color: currentStep === step ? '#3b82f6' : step < currentStep ? '#10b981' : '#94a3b8',
                    cursor:'pointer'
                  }}
                >
                  {step === 1 && '① Institution'}
                  {step === 2 && '② Service Plan'}
                  {step === 3 && '③ Documents'}
                  {step === 4 && '④ Payment'}
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div style={{flex:1, overflow:'auto', padding:'20px 24px'}}>
              {renderWizardStep()}
            </div>

            {/* Modal Footer */}
            <div style={{display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid #e2e8f0', padding:'16px 24px', background:'#f8fafc'}}>
              {currentStep > 1 && (
                <button onClick={() => navigateStep(-1)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>
                  ← Back
                </button>
              )}
              <button onClick={() => setShowWizardModal(false)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>
                ✕ Cancel
              </button>
              <div style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                {currentStep < 4 && (
                  <button onClick={() => navigateStep(1)} style={{background:'#7c3aed', color:'white', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>
                    Next Step →
                  </button>
                )}
                {currentStep === 4 && (
                  <button onClick={handleWizardSubmit} style={{background:'linear-gradient(135deg,#059669,#047857)', color:'white', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>
                    {editingRegistration ? '💾 Save Changes' : '✅ Complete Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Generation Modal */}
      {showCertificateModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={() => setShowCertificateModal(false)}>
          <div style={{background:'white', borderRadius:'12px', maxWidth:'580px', width:'96vw', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #e2e8f0', padding:'20px 24px'}}>
              <div style={{width:'48px', height:'48px', background:'#dbeafe', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>📜</div>
              <div>
                <h3 style={{margin:'0 0 4px 0', fontSize:'18px', fontWeight:'700'}}>Certificate Generation</h3>
                <p style={{margin:0, fontSize:'13px', color:'#64748b'}}>Generate BMW compliance certificates for registered customers</p>
              </div>
              <button onClick={() => setShowCertificateModal(false)} style={{marginLeft:'auto', background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#94a3b8'}}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{flex:1, overflow:'auto', padding:'20px 24px'}}>

              {/* Duplicate Warning */}
              {certDuplicateWarning && (
                <div style={{background:'#fef3c7', border:'2px solid #f59e0b', borderRadius:'8px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'flex-start', gap:'10px'}}>
                  <span style={{fontSize:'20px'}}>⚠️</span>
                  <div>
                    <div style={{fontWeight:'700', color:'#92400e', fontSize:'13px'}}>Certificate Already Created!</div>
                    <div style={{fontSize:'12px', color:'#78350f', marginTop:'2px'}}>{certDuplicateWarning}</div>
                  </div>
                </div>
              )}

              {/* Certificate Details Section */}
              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Certificate Details</div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Certificate No.</label>
                    <input
                      type="text"
                      name="certificateNo"
                      value={certificateData.certificateNo}
                      readOnly
                      style={{...formStyles.input, background:'#f8fafc', color:'#7c3aed', fontWeight:'700'}}
                    />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Certificate Type <span style={{color:'#ef4444'}}>*</span></label>
                    <select name="certificateType" value={certificateData.certificateType} onChange={handleCertificateInputChange} style={formStyles.select}>
                      <option value="">Select Type</option>
                      <option value="Annual">Annual (+1 Year)</option>
                      <option value="Renewal">Renewal (+1 Year)</option>
                      <option value="Compliance">Compliance (+6 Months)</option>
                    </select>
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Customer / Facility <span style={{color:'#ef4444'}}>*</span></label>
                    <select name="registrationId" value={certificateData.registrationId} onChange={handleCertificateInputChange} style={formStyles.select}>
                      <option value="">{allRegistrations.length === 0 ? '⏳ Loading registered facilities...' : '— Select Registered Facility —'}</option>
                      {allRegistrations.map((reg) => (
                        <option key={reg.RegistrationID} value={reg.RegistrationID}>
                          {reg.InstitutionName}{reg.Zone ? ` (${reg.Zone})` : ''}
                        </option>
                      ))}
                    </select>
                    {allRegistrations.length === 0 && (
                      <span style={{fontSize:'11px', color:'#ef4444', marginTop:'4px'}}>
                        No facilities registered yet. Add one via Customer Registration first.
                      </span>
                    )}
                    {certificateData.customerFacility && (
                      <span style={{fontSize:'11px', color:'#059669', marginTop:'4px'}}>
                        ✅ Selected: {certificateData.customerFacility}
                      </span>
                    )}
                  </div>
                </div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Issue Date <span style={{color:'#ef4444'}}>*</span></label>
                    <input
                      type="date"
                      name="issueDate"
                      value={certificateData.issueDate}
                      onChange={handleCertificateInputChange}
                      style={formStyles.input}
                    />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Valid Till <span style={{color:'#64748b', fontSize:'11px', fontWeight:'400'}}>(auto-calculated)</span></label>
                    <input
                      type="date"
                      name="validTill"
                      value={certificateData.validTill}
                      readOnly
                      style={{...formStyles.input, background:'#f0fdf4', color:'#065f46', fontWeight:'600', cursor:'not-allowed'}}
                    />
                    {certificateData.issueDate && certificateData.certificateType && (
                      <span style={{fontSize:'11px', color:'#059669', marginTop:'4px'}}>
                        ✅ Auto-set: {certificateData.certificateType === 'Compliance' ? '6 months' : '1 year'} from issue date
                      </span>
                    )}
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Notes</label>
                    <textarea
                      name="notes"
                      value={certificateData.notes}
                      onChange={handleCertificateInputChange}
                      placeholder="Additional notes..."
                      style={{...formStyles.textarea, minHeight:'80px'}}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Status</div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Certificate Status</label>
                    <select name="status" value={certificateData.status} onChange={handleCertificateInputChange} style={formStyles.select}>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Revoked">Revoked</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid #e2e8f0', padding:'16px 24px', background:'#f8fafc'}}>
              <button onClick={() => setShowCertificateModal(false)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>
                ✕ Cancel
              </button>
              <div style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                <button onClick={() => { resetCertificateForm(); }} style={{background:'#f1f5f9', color:'#1e293b', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>
                  🔄 Reset
                </button>
                <button onClick={handleCertificateSubmit} style={{background:'#7c3aed', color:'white', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>
                  ✅ Generate Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Request Modal */}
      {showServiceReqModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={() => setShowServiceReqModal(false)}>
          <div style={{background:'white', borderRadius:'12px', maxWidth:'580px', width:'96vw', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #e2e8f0', padding:'20px 24px'}}>
              <div style={{width:'48px', height:'48px', background:'#dbeafe', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>🔧</div>
              <div>
                <h3 style={{margin:'0 0 4px 0', fontSize:'18px', fontWeight:'700'}}>Service Request</h3>
                <p style={{margin:0, fontSize:'13px', color:'#64748b'}}>Create a new service request for customer</p>
              </div>
              <button onClick={() => setShowServiceReqModal(false)} style={{marginLeft:'auto', background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#94a3b8'}}>×</button>
            </div>
            <div style={{flex:1, overflow:'auto', padding:'20px 24px'}}>
              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Request Details</div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Request ID</label>
                    <input type="text" name="requestId" value={serviceReqData.requestId} readOnly style={{...formStyles.input, background:'#f8fafc'}} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Request Type <span style={{color:'#ef4444'}}>*</span></label>
                    <select name="requestType" value={serviceReqData.requestType} onChange={handleServiceReqInputChange} style={formStyles.select}>
                      <option value="">Select Type</option>
                      <option>Extra Pickup</option>
                      <option>Kit Replacement</option>
                      <option>Training</option>
                      <option>Audit</option>
                      <option>Complaint</option>
                    </select>
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Customer / Facility <span style={{color:'#ef4444'}}>*</span></label>
                    <select name="registrationId" value={serviceReqData.registrationId} onChange={handleServiceReqInputChange} style={formStyles.select}>
                      <option value="">{allRegistrations.length === 0 ? '⏳ Loading...' : '— Select Registered Facility —'}</option>
                      {allRegistrations.map((reg) => (
                        <option key={reg.RegistrationID} value={reg.RegistrationID}>
                          {reg.InstitutionName}{reg.Zone ? ` (${reg.Zone})` : ''}
                        </option>
                      ))}
                    </select>
                    {serviceReqData.customerFacility && (
                      <span style={{fontSize:'11px', color:'#059669', marginTop:'4px'}}>✅ {serviceReqData.customerFacility}</span>
                    )}
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Assigned To</label>
                    <select name="assignedTo" value={serviceReqData.assignedTo} onChange={handleServiceReqInputChange} style={formStyles.select}>
                      <option value="">Unassigned</option>
                      {staffMembers.map((staff, idx) => (
                        <option key={idx} value={staff.UserID}>{staff.Username}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Scheduled Date</label>
                    <input type="date" name="scheduledDate" value={serviceReqData.scheduledDate} onChange={handleServiceReqInputChange} style={formStyles.input} />
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Description</label>
                    <textarea name="description" value={serviceReqData.description} onChange={handleServiceReqInputChange} placeholder="Describe the service request..." style={{...formStyles.textarea, minHeight:'80px'}} />
                  </div>
                </div>
              </div>
              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Status</div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Request Status</label>
                    <select name="status" value={serviceReqData.status} onChange={handleServiceReqInputChange} style={formStyles.select}>
                      <option>Open</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid #e2e8f0', padding:'16px 24px', background:'#f8fafc'}}>
              <button onClick={() => setShowServiceReqModal(false)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>✕ Cancel</button>
              <div style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                <button onClick={handleServiceReqSubmit} style={{background:'#7c3aed', color:'white', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>✅ Create Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer MOU Modal */}
      {showMouModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={() => { setShowMouModal(false); setEditingMou(false); setEditingMouId(null); }}>
          <div style={{background:'white', borderRadius:'12px', maxWidth:'580px', width:'96vw', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #e2e8f0', padding:'20px 24px'}}>
              <div style={{width:'48px', height:'48px', background: editingMou ? '#dbeafe' : '#dcfce7', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>{editingMou ? '✏️' : '📝'}</div>
              <div>
                <h3 style={{margin:'0 0 4px 0', fontSize:'18px', fontWeight:'700'}}>{editingMou ? 'Edit MOU' : 'Create Customer MOU'}</h3>
                <p style={{margin:0, fontSize:'13px', color:'#64748b'}}>{editingMou ? `Editing: ${mouData.mouNumber}` : 'New Memorandum of Understanding'}</p>
              </div>
              <button onClick={() => { setShowMouModal(false); setEditingMou(false); setEditingMouId(null); }} style={{marginLeft:'auto', background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#94a3b8'}}>×</button>
            </div>
            <div style={{flex:1, overflow:'auto', padding:'20px 24px'}}>
              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>MOU Details</div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>MOU Number</label>
                    <input type="text" name="mouNumber" value={mouData.mouNumber} readOnly style={{...formStyles.input, background:'#f8fafc'}} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Customer / Facility <span style={{color:'#ef4444'}}>*</span></label>
                    <select name="registrationId" value={mouData.registrationId} onChange={handleMouInputChange} style={formStyles.select}>
                      <option value="">{allRegistrations.length === 0 ? '⏳ Loading...' : '— Select Registered Facility —'}</option>
                      {allRegistrations.map((reg) => (
                        <option key={reg.RegistrationID} value={reg.RegistrationID}>
                          {reg.InstitutionName}{reg.Zone ? ` (${reg.Zone})` : ''}
                        </option>
                      ))}
                    </select>
                    {mouData.customer && (
                      <span style={{fontSize:'11px', color:'#059669', marginTop:'4px'}}>✅ {mouData.customer}</span>
                    )}
                  </div>
                </div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Start Date <span style={{color:'#ef4444'}}>*</span></label>
                    <input type="date" name="startDate" value={mouData.startDate} onChange={handleMouInputChange} style={formStyles.input} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>End Date <span style={{color:'#ef4444'}}>*</span></label>
                    <input type="date" name="endDate" value={mouData.endDate} onChange={handleMouInputChange} style={formStyles.input} />
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Contract Value (₹)</label>
                    <input type="number" name="contractValue" value={mouData.contractValue} onChange={handleMouInputChange} placeholder="0.00" min="0" style={formStyles.input} />
                  </div>
                </div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Terms & Conditions</label>
                    <textarea name="termsConditions" value={mouData.termsConditions} onChange={handleMouInputChange} placeholder="MOU terms and conditions..." style={{...formStyles.textarea, minHeight:'100px'}} />
                  </div>
                </div>
              </div>
              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Status</div>
                <div style={formStyles.rowCol1}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>MOU Status</label>
                    <select name="status" value={mouData.status} onChange={handleMouInputChange} style={formStyles.select}>
                      <option>Active</option>
                      <option>Under Review</option>
                      <option>Expired</option>
                      <option>Terminated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid #e2e8f0', padding:'16px 24px', background:'#f8fafc'}}>
              <button onClick={() => { setShowMouModal(false); setEditingMou(false); setEditingMouId(null); }} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>✕ Cancel</button>
              <div style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                <button onClick={editingMou ? handleMouUpdate : handleMouSubmit} style={{background:'#7c3aed', color:'white', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>
                  {editingMou ? '💾 Update MOU' : '✅ Create MOU'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ VIEW MOU MODAL ════ */}
      {showViewMouModal && viewMouData && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(15,23,42,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1100,padding:'16px'}}
             onClick={() => setShowViewMouModal(false)}>
          <div style={{background:'#fff',borderRadius:'14px',width:'100%',maxWidth:'600px',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 25px 50px rgba(0,0,0,0.25)',overflow:'hidden'}}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{background:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)',padding:'20px 24px',display:'flex',alignItems:'center',gap:'14px'}}>
              <div style={{width:'48px',height:'48px',background:'rgba(255,255,255,0.15)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>📝</div>
              <div style={{flex:1}}>
                <div style={{color:'#fff',fontWeight:'700',fontSize:'18px'}}>{viewMouData.MOUCode}</div>
                <div style={{color:'rgba(255,255,255,0.75)',fontSize:'12px',marginTop:'2px'}}>{viewMouData.CustomerName}</div>
              </div>
              <span style={{background:'rgba(255,255,255,0.2)',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'4px 12px',borderRadius:'20px',flexShrink:0}}>{viewMouData.Status}</span>
              <button onClick={() => setShowViewMouModal(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',fontSize:'20px',cursor:'pointer',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:'8px'}}>×</button>
            </div>

            {/* Body */}
            <div style={{flex:1,overflow:'auto',padding:'24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'16px'}}>
                {[
                  ['MOU Number',      viewMouData.MOUCode],
                  ['Customer / Facility', viewMouData.CustomerName],
                  ['Start Date',      viewMouData.StartDate ? new Date(viewMouData.StartDate).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '—'],
                  ['End Date',        viewMouData.EndDate   ? new Date(viewMouData.EndDate).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})   : '—'],
                  ['Contract Value',  '₹' + Number(viewMouData.ContractValue||0).toLocaleString('en-IN')],
                  ['Status',          viewMouData.Status],
                  ['Created',         viewMouData.CreatedAt ? new Date(viewMouData.CreatedAt).toLocaleDateString('en-IN') : '—'],
                  ['Last Updated',    viewMouData.UpdatedAt ? new Date(viewMouData.UpdatedAt).toLocaleDateString('en-IN') : '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'12px 14px'}}>
                    <div style={{fontSize:'11px',color:'#94a3b8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>{label}</div>
                    <div style={{fontSize:'14px',color:'#1e293b',fontWeight:'700'}}>{value || '—'}</div>
                  </div>
                ))}
              </div>
              {viewMouData.TermsConditions && (
                <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'8px',padding:'14px'}}>
                  <div style={{fontSize:'11px',color:'#92400e',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px'}}>📋 Terms & Conditions</div>
                  <div style={{fontSize:'13px',color:'#78350f',lineHeight:'1.6',whiteSpace:'pre-wrap'}}>{viewMouData.TermsConditions}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{borderTop:'1px solid #e2e8f0',padding:'14px 24px',display:'flex',gap:'10px',justifyContent:'flex-end',background:'#f8fafc'}}>
              <button onClick={() => { setShowViewMouModal(false); handleEditMou(viewMouData); }} style={{background:'#dbeafe',color:'#1d4ed8',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>✏️ Edit MOU</button>
              <button onClick={() => setShowViewMouModal(false)} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:'#475569'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Registration Modal */}
      {showFailedRegModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={() => setShowFailedRegModal(false)}>
          <div style={{background:'white', borderRadius:'12px', maxWidth:'620px', width:'96vw', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #e2e8f0', padding:'20px 24px'}}>
              <div style={{width:'48px', height:'48px', background:'#fee2e2', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>⚠️</div>
              <div>
                <h3 style={{margin:'0 0 4px 0', fontSize:'18px', fontWeight:'700'}}>Payment Retry</h3>
                <p style={{margin:0, fontSize:'13px', color:'#64748b'}}>Resolve failed registration with cheque or retry payment</p>
              </div>
              <button onClick={() => setShowFailedRegModal(false)} style={{marginLeft:'auto', background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#94a3b8'}}>×</button>
            </div>
            <div style={{flex:1, overflow:'auto', padding:'20px 24px'}}>
              <div style={{background:'#fef3c7', borderRadius:'8px', padding:'12px 16px', marginBottom:'16px', fontSize:'12px', color:'#92400e', display:'flex', alignItems:'flex-start', gap:'8px'}}>
                <span style={{marginTop:'2px'}}>⚠️</span>
                <div>Once cheque details are saved, Accounts team will mark it as Cleared after bank clearance. Registration will complete automatically.</div>
              </div>

              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Registration Details</div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Registration ID</label>
                    <input type="text" name="registrationId" value={failedRegData.registrationId} readOnly style={{...formStyles.input, background:'#f8fafc'}} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Facility Name <span style={{color:'#ef4444'}}>*</span></label>
                    <input type="text" name="facilityName" value={failedRegData.facilityName} onChange={handleFailedRegInputChange} placeholder="Facility name" style={formStyles.input} />
                  </div>
                </div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Contact Person</label>
                    <input type="text" name="contactPerson" value={failedRegData.contactPerson} onChange={handleFailedRegInputChange} placeholder="Contact person name" style={formStyles.input} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Mobile <span style={{color:'#ef4444'}}>*</span></label>
                    <input type="tel" name="mobile" value={failedRegData.mobile} onChange={handleFailedRegInputChange} placeholder="10-digit mobile" maxLength="10" style={formStyles.input} />
                  </div>
                </div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Plan Name</label>
                    <input type="text" name="planName" value={failedRegData.planName} onChange={handleFailedRegInputChange} placeholder="Service plan" style={formStyles.input} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Amount (₹)</label>
                    <input type="number" name="amount" value={failedRegData.amount} onChange={handleFailedRegInputChange} placeholder="0.00" min="0" style={formStyles.input} />
                  </div>
                </div>
              </div>

              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Failure Details</div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Error Code</label>
                    <input type="text" name="errorCode" value={failedRegData.errorCode} onChange={handleFailedRegInputChange} placeholder="e.g. ERR_CARD_DECLINED" style={formStyles.input} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Failure Reason</label>
                    <input type="text" name="failureReason" value={failedRegData.failureReason} onChange={handleFailedRegInputChange} placeholder="Reason for failure" style={formStyles.input} />
                  </div>
                </div>
              </div>

              <div style={formStyles.section}>
                <div style={formStyles.sectionTitle}>Cheque Details</div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Cheque Number</label>
                    <input type="text" name="chequeNo" value={failedRegData.chequeNo} onChange={handleFailedRegInputChange} placeholder="6-digit cheque number" maxLength="6" style={formStyles.input} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Cheque Amount (₹)</label>
                    <input type="number" name="chequeAmount" value={failedRegData.chequeAmount} onChange={handleFailedRegInputChange} placeholder="0.00" min="0" style={formStyles.input} />
                  </div>
                </div>
                <div style={formStyles.row}>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Bank Name</label>
                    <input type="text" name="bankName" value={failedRegData.bankName} onChange={handleFailedRegInputChange} placeholder="e.g. HDFC Bank" style={formStyles.input} />
                  </div>
                  <div style={formStyles.field}>
                    <label style={formStyles.label}>Cheque Date</label>
                    <input type="date" name="chequeDate" value={failedRegData.chequeDate} onChange={handleFailedRegInputChange} style={formStyles.input} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'12px', borderTop:'1px solid #e2e8f0', padding:'16px 24px', background:'#f8fafc'}}>
              <button onClick={() => setShowFailedRegModal(false)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>✕ Cancel</button>
              <div style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                <button onClick={handleFailedRegSubmit} style={{background:'#10b981', color:'white', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>🏦 Save Cheque Details</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Registration Modal */}
      {showViewRegModal && viewRegData && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}} onClick={() => setShowViewRegModal(false)}>
          <div style={{background:'white', borderRadius:'14px', maxWidth:'720px', width:'96vw', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 25px 50px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', alignItems:'center', gap:'14px', borderBottom:'1px solid #e2e8f0', padding:'18px 24px', background:'linear-gradient(135deg,#ede9fe,#dbeafe)', borderRadius:'14px 14px 0 0'}}>
              <div style={{width:'48px', height:'48px', background:'#7c3aed', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', color:'#fff'}}>🏥</div>
              <div>
                <h3 style={{margin:'0 0 2px 0', fontSize:'17px', fontWeight:'800', color:'#1e293b'}}>{viewRegData.InstitutionName}</h3>
                <div style={{display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
                  <span style={{background:'#7c3aed', color:'#fff', fontSize:'11px', fontWeight:'700', padding:'2px 10px', borderRadius:'20px'}}>{viewRegData.CustomerID || viewRegData.RegistrationCode}</span>
                  <span style={{background: viewRegData.Status === 'Approved' ? '#d1fae5' : viewRegData.Status === 'Pending' ? '#fef3c7' : '#fee2e2', color: viewRegData.Status === 'Approved' ? '#065f46' : viewRegData.Status === 'Pending' ? '#92400e' : '#7f1d1d', fontSize:'11px', fontWeight:'700', padding:'2px 10px', borderRadius:'20px'}}>{viewRegData.Status}</span>
                </div>
              </div>
              <button onClick={() => setShowViewRegModal(false)} style={{marginLeft:'auto', background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'#64748b'}}>×</button>
            </div>
            <div style={{flex:1, overflow:'auto', padding:'20px 24px'}}>
              {[
                { section: '🏢 Institution Info', fields: [
                  ['Customer ID', viewRegData.CustomerID], ['Category', viewRegData.Category || viewRegData.InstitutionType],
                  ['Sub-Category', viewRegData.SubCategory], ['No. of Beds', viewRegData.NumberOfBeds],
                  ['BMW Reg No.', viewRegData.BMWRegNo], ['Zone', viewRegData.Zone],
                  ['Route', viewRegData.Route], ['Pincode', viewRegData.Pincode]
                ]},
                { section: '📍 Address', fields: [['Full Address', viewRegData.FullAddress]] },
                { section: '👤 Contact Details', fields: [
                  ['Contact Person', viewRegData.ContactPerson], ['Designation', viewRegData.Designation],
                  ['Mobile', viewRegData.Mobile], ['Email', viewRegData.Email],
                  ['Alt. Mobile', viewRegData.AlternateMobile], ['Website', viewRegData.Website]
                ]},
                { section: '📋 Legal & Tax', fields: [
                  ['PAN Number', viewRegData.PANNumber], ['GST Number', viewRegData.GSTNumber]
                ]},
                { section: '📦 Service & Kit', fields: [
                  ['Selected Plan', viewRegData.SelectedPlan], ['Kit', viewRegData.Kit],
                  ['Consulting', viewRegData.Consulting], ['Compliance', viewRegData.Compliance],
                  ['Billing Cycle', viewRegData.BillingCycle]
                ]},
                { section: '💳 Payment Info', fields: [
                  ['Transaction ID', viewRegData.TxnID], ['Pay Mode', viewRegData.PayMode],
                  ['Reg. Fee', viewRegData.RegFee ? '₹' + Number(viewRegData.RegFee).toLocaleString('en-IN') : null],
                  ['Service Fee', viewRegData.SvcFee ? '₹' + Number(viewRegData.SvcFee).toLocaleString('en-IN') : null],
                  ['Total Amount', viewRegData.TotalAmount ? '₹' + Number(viewRegData.TotalAmount).toLocaleString('en-IN') : null],
                  ['Reg. Date', viewRegData.RegistrationDate ? new Date(viewRegData.RegistrationDate).toLocaleDateString() : (viewRegData.CreatedAt ? new Date(viewRegData.CreatedAt).toLocaleDateString() : 'N/A')]
                ]}
              ].map((group, gi) => (
                <div key={gi} style={{marginBottom:'18px'}}>
                  <div style={{fontSize:'12px', fontWeight:'800', color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px', paddingBottom:'6px', borderBottom:'1px solid #e2e8f0'}}>{group.section}</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                    {group.fields.filter(([,v]) => v).map(([label, value], fi) => (
                      <div key={fi} style={{background:'#f8fafc', borderRadius:'8px', padding:'8px 12px'}}>
                        <div style={{fontSize:'11px', color:'#94a3b8', fontWeight:'600', marginBottom:'2px'}}>{label}</div>
                        <div style={{fontSize:'13px', color:'#1e293b', fontWeight:'600'}}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{borderTop:'1px solid #e2e8f0', padding:'14px 24px', display:'flex', gap:'10px', justifyContent:'flex-end', background:'#f8fafc', borderRadius:'0 0 14px 14px'}}>
              <button onClick={() => { setShowViewRegModal(false); handleEditRegistration(viewRegData); }} style={{background:'#7c3aed', color:'white', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>✏️ Edit Registration</button>
              <button onClick={() => setShowViewRegModal(false)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {showViewCertModal && viewCertData && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}} onClick={() => setShowViewCertModal(false)}>
          <div style={{background:'white', borderRadius:'14px', maxWidth:'680px', width:'96vw', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 25px 50px rgba(0,0,0,0.2)'}} onClick={e => e.stopPropagation()}>
            {/* Certificate Preview Header */}
            <div style={{background:'linear-gradient(135deg,#1a4a8a,#2563eb)', borderRadius:'14px 14px 0 0', padding:'24px', color:'#fff', textAlign:'center', position:'relative'}}>
              <div style={{fontSize:'13px', fontWeight:'700', letterSpacing:'3px', opacity:0.8, marginBottom:'8px'}}>MPCC — MEDICAL POLLUTION CONTROL COMMITTEE</div>
              <div style={{fontSize:'22px', fontWeight:'900', letterSpacing:'4px'}}>CERTIFICATE OF COMPLIANCE</div>
              <div style={{fontSize:'12px', opacity:0.75, marginTop:'6px'}}>Biomedical Waste Management Authority — Haridwar, Uttarakhand</div>
              <span style={{position:'absolute', top:'14px', right:'14px', background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px'}}>{viewCertData.CertificateCode}</span>
              <button onClick={() => setShowViewCertModal(false)} style={{position:'absolute', top:'10px', left:'14px', background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'rgba(255,255,255,0.8)'}}>×</button>
            </div>
            {/* Certificate Body */}
            <div style={{padding:'24px', flex:1, overflow:'auto'}}>
              <div style={{border:'2px solid #c0c8d8', borderRadius:'10px', padding:'20px', background:'#f8fafc'}}>
                <div style={{fontSize:'13px', color:'#475569', marginBottom:'16px', textAlign:'center', fontStyle:'italic'}}>
                  This is to certify that the following facility has fulfilled all requisite conditions under the Biomedical Waste Management Rules.
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                  {[
                    ['Issued To', viewCertData.CustomerName],
                    ['Certificate Type', viewCertData.CertificateType],
                    ['Certificate No.', viewCertData.CertificateCode],
                    ['Status', viewCertData.Status],
                    ['Issue Date', viewCertData.IssueDate ? new Date(viewCertData.IssueDate).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : 'N/A'],
                    ['Valid Till', viewCertData.ValidTill ? new Date(viewCertData.ValidTill).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : 'N/A'],
                  ].map(([label, value], idx) => (
                    <div key={idx} style={{background:'white', borderRadius:'8px', padding:'12px 14px', border:'1px solid #e2e8f0'}}>
                      <div style={{fontSize:'11px', color:'#94a3b8', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px'}}>{label}</div>
                      <div style={{fontSize:'14px', color:'#1e293b', fontWeight:'700'}}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
                {viewCertData.Notes && (
                  <div style={{marginTop:'14px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'8px', padding:'12px 14px'}}>
                    <div style={{fontSize:'11px', color:'#92400e', fontWeight:'700', marginBottom:'4px'}}>NOTES</div>
                    <div style={{fontSize:'13px', color:'#78350f'}}>{viewCertData.Notes}</div>
                  </div>
                )}
                <div style={{marginTop:'20px', background:'linear-gradient(135deg,#ede9fe,#dbeafe)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
                  <div style={{fontSize:'12px', color:'#4338ca', fontWeight:'600'}}>Validity Period</div>
                  <div style={{fontSize:'15px', color:'#1e1b4b', fontWeight:'800', marginTop:'4px'}}>
                    {viewCertData.IssueDate ? new Date(viewCertData.IssueDate).toLocaleDateString() : '—'}
                    {' '}&nbsp;→&nbsp;{' '}
                    {viewCertData.ValidTill ? new Date(viewCertData.ValidTill).toLocaleDateString() : '—'}
                  </div>
                </div>
              </div>
            </div>
            <div style={{borderTop:'1px solid #e2e8f0', padding:'14px 24px', display:'flex', gap:'10px', justifyContent:'flex-end', background:'#f8fafc', borderRadius:'0 0 14px 14px'}}>
              <button onClick={() => handlePrintCertificate(viewCertData)} style={{background:'#059669', color:'white', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer'}}>🖨️ Print Certificate</button>
              <button onClick={() => setShowViewCertModal(false)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', color:'#475569'}}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* ════════════════════════════════════════════════════════════
          SERVICE REQUEST FOLLOW-UP MODAL
          ════════════════════════════════════════════════════════════ */}
      {showFollowupModal && followupSR && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(15,23,42,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1100,padding:'16px'}}
             onClick={() => setShowFollowupModal(false)}>
          <div style={{background:'#fff',borderRadius:'14px',width:'100%',maxWidth:'960px',maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 25px 50px rgba(0,0,0,0.25)',overflow:'hidden'}}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{background:'linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)',padding:'18px 24px',display:'flex',alignItems:'center',gap:'14px',flexShrink:0}}>
              <div style={{width:'44px',height:'44px',background:'rgba(255,255,255,0.15)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',flexShrink:0}}>🔧</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:'#fff',fontWeight:'700',fontSize:'17px',letterSpacing:'0.01em'}}>{followupSR.RequestCode}</div>
                <div style={{color:'rgba(255,255,255,0.75)',fontSize:'12px',marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {followupSR.CustomerName} &nbsp;·&nbsp; {followupSR.RequestType}
                </div>
              </div>
              <span style={{background:'rgba(255,255,255,0.2)',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'4px 12px',borderRadius:'20px',whiteSpace:'nowrap',flexShrink:0}}>
                {followupSR.Status}
              </span>
              <button onClick={() => setShowFollowupModal(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>×</button>
            </div>

            {/* Body — 3 columns */}
            <div style={{display:'grid',gridTemplateColumns:'220px 1fr 1fr',flex:1,overflow:'hidden',minHeight:0}}>

              {/* ── Col 1: SR Info card ── */}
              <div style={{borderRight:'1px solid #e2e8f0',padding:'20px 16px',overflowY:'auto',background:'#f8fafc'}}>
                <div style={{fontSize:'11px',fontWeight:'700',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'14px'}}>Request Details</div>
                {[
                  ['Request ID',  followupSR.RequestCode],
                  ['Customer',    followupSR.CustomerName],
                  ['Type',        followupSR.RequestType],
                  ['Assigned To', followupSR.AssignedUserName || '—'],
                  ['Scheduled',   followupSR.ScheduledDate ? new Date(followupSR.ScheduledDate).toLocaleDateString('en-IN') : '—'],
                  ['Created',     followupSR.CreatedAt ? new Date(followupSR.CreatedAt).toLocaleDateString('en-IN') : '—'],
                  ['Last Update', followupSR.UpdatedAt ? new Date(followupSR.UpdatedAt).toLocaleDateString('en-IN') : '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{marginBottom:'12px'}}>
                    <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
                    <div style={{fontSize:'13px',color:'#1e293b',fontWeight:'600',marginTop:'2px',wordBreak:'break-word'}}>{val}</div>
                  </div>
                ))}
                {followupSR.Description && (
                  <div style={{marginTop:'4px'}}>
                    <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.05em'}}>Description</div>
                    <div style={{fontSize:'12px',color:'#475569',marginTop:'4px',lineHeight:'1.5',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'6px',padding:'8px'}}>{followupSR.Description}</div>
                  </div>
                )}
              </div>

              {/* ── Col 2: Add Follow-up form ── */}
              <div style={{borderRight:'1px solid #e2e8f0',padding:'20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'16px'}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1e293b',borderBottom:'2px solid #ede9fe',paddingBottom:'8px'}}>➕ Add Follow-up</div>

                {/* Status change */}
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Update Status</label>
                  <select value={followupForm.status}
                          onChange={e => setFollowupForm(p => ({...p, status: e.target.value}))}
                          style={{width:'100%',padding:'9px 12px',border:'2px solid #e2e8f0',borderRadius:'8px',fontSize:'13px',fontWeight:'600',color:'#1e293b',background:'#fff',cursor:'pointer'}}>
                    <option value="Open">🟡 Open</option>
                    <option value="In Progress">🔵 In Progress</option>
                    <option value="Pending">⏳ Pending</option>
                    <option value="Resolved">✅ Resolved</option>
                    <option value="Completed">🏁 Completed</option>
                    <option value="Cancelled">❌ Cancelled</option>
                  </select>
                </div>

                {/* Note / Remark */}
                <div style={{flex:1}}>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Remark / Note <span style={{color:'#ef4444'}}>*</span></label>
                  <textarea value={followupForm.note}
                            onChange={e => setFollowupForm(p => ({...p, note: e.target.value}))}
                            placeholder="Write your follow-up note, action taken, next steps..."
                            style={{width:'100%',minHeight:'140px',padding:'10px 12px',border:'2px solid #e2e8f0',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',lineHeight:'1.5',resize:'vertical',boxSizing:'border-box',outline:'none',transition:'border-color 0.15s'}}
                            onFocus={e => e.target.style.borderColor='#7c3aed'}
                            onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                </div>

                {/* Updated By (auto) */}
                <div>
                  <label style={{display:'block',fontSize:'12px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Updated By</label>
                  <div style={{padding:'9px 12px',background:'#f1f5f9',borderRadius:'8px',fontSize:'13px',color:'#475569',fontWeight:'600',display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{width:'28px',height:'28px',background:'#7c3aed',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:'700',flexShrink:0}}>
                      {(JSON.parse(localStorage.getItem('adminUser')||'{}').username||'U')[0].toUpperCase()}
                    </span>
                    {JSON.parse(localStorage.getItem('adminUser')||'{}').username ||
                     JSON.parse(localStorage.getItem('adminUser')||'{}').name || 'Current User'}
                    <span style={{marginLeft:'auto',fontSize:'10px',color:'#94a3b8'}}>auto</span>
                  </div>
                </div>

                {/* Submit */}
                <button onClick={handleFollowupSubmit}
                        disabled={followupSaving}
                        style={{background: followupSaving?'#a78bfa':'#7c3aed',color:'#fff',border:'none',borderRadius:'8px',padding:'11px',fontSize:'13px',fontWeight:'700',cursor:followupSaving?'not-allowed':'pointer',transition:'background 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  {followupSaving ? '⏳ Saving…' : '💾 Save Follow-up'}
                </button>
              </div>

              {/* ── Col 3: History timeline ── */}
              <div style={{padding:'20px',overflowY:'auto'}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1e293b',borderBottom:'2px solid #ede9fe',paddingBottom:'8px',marginBottom:'16px'}}>
                  🕐 Update History
                  <span style={{marginLeft:'8px',background:'#ede9fe',color:'#7c3aed',fontSize:'11px',fontWeight:'700',padding:'2px 8px',borderRadius:'20px'}}>
                    {followupHistory.length}
                  </span>
                </div>

                {followupLoading ? (
                  <div style={{textAlign:'center',color:'#94a3b8',padding:'30px 0',fontSize:'13px'}}>Loading history…</div>
                ) : followupHistory.length === 0 ? (
                  <div style={{textAlign:'center',color:'#94a3b8',padding:'30px 0'}}>
                    <div style={{fontSize:'32px',marginBottom:'8px'}}>📋</div>
                    <div style={{fontSize:'13px'}}>No follow-ups yet.<br/>Add the first one!</div>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
                    {followupHistory.map((fup, idx) => {
                      const statusColors = {
                        'Completed':  {bg:'#dcfce7',color:'#15803d'},
                        'In Progress':{bg:'#dbeafe',color:'#1d4ed8'},
                        'Cancelled':  {bg:'#fee2e2',color:'#dc2626'},
                        'Resolved':   {bg:'#d1fae5',color:'#065f46'},
                        'Pending':    {bg:'#fef9c3',color:'#92400e'},
                        'Open':       {bg:'#fef9c3',color:'#92400e'},
                      };
                      const sc = statusColors[fup.StatusChanged] || {bg:'#f1f5f9',color:'#475569'};
                      return (
                        <div key={fup.FollowUpID} style={{display:'flex',gap:'12px',paddingBottom:'16px',position:'relative'}}>
                          {/* Timeline line */}
                          {idx < followupHistory.length-1 && (
                            <div style={{position:'absolute',left:'15px',top:'32px',bottom:0,width:'2px',background:'#e2e8f0'}} />
                          )}
                          {/* Dot */}
                          <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:'700',flexShrink:0,zIndex:1,marginTop:'2px'}}>
                            {(fup.UpdatedByName||'?')[0].toUpperCase()}
                          </div>
                          {/* Card */}
                          <div style={{flex:1,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'10px 12px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'6px'}}>
                              <span style={{fontSize:'12px',fontWeight:'700',color:'#1e293b'}}>{fup.UpdatedByName || 'Unknown'}</span>
                              {fup.StatusChanged && (
                                <span style={{...sc,fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'20px'}}>
                                  → {fup.StatusChanged}
                                </span>
                              )}
                              <span style={{marginLeft:'auto',fontSize:'10px',color:'#94a3b8',whiteSpace:'nowrap'}}>
                                {new Date(fup.CreatedAt).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                              </span>
                            </div>
                            {fup.Note && (
                              <div style={{fontSize:'12px',color:'#475569',lineHeight:'1.5',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'6px',padding:'8px'}}>{fup.Note}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{borderTop:'1px solid #e2e8f0',padding:'12px 20px',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <span style={{fontSize:'12px',color:'#94a3b8'}}>Click any row in the table to open follow-up panel</span>
              <button onClick={() => setShowFollowupModal(false)} style={{background:'#e2e8f0',border:'none',borderRadius:'8px',padding:'8px 20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:'#475569'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Enable Portal Modal */}
      {showEnablePortalModal && portalTargetReg && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000}} onClick={() => setShowEnablePortalModal(false)}>
          <div style={{background:'white',borderRadius:'16px',width:'96vw',maxWidth:'420px',boxShadow:'0 25px 50px rgba(0,0,0,0.2)',overflow:'hidden'}} onClick={e => e.stopPropagation()}>
            <div style={{background:'linear-gradient(135deg,#5b21b6,#7c3aed)',padding:'20px 24px',color:'#fff'}}>
              <div style={{fontSize:'16px',fontWeight:'800',marginBottom:'4px'}}>🔐 Enable Member Portal</div>
              <div style={{fontSize:'12px',opacity:.8}}>{portalTargetReg.InstitutionName}</div>
            </div>
            <div style={{padding:'20px 24px'}}>
              <div style={{background:'#f5f3ff',borderRadius:'10px',padding:'12px 14px',marginBottom:'16px',fontSize:'12px',color:'#5b21b6',fontWeight:'600'}}>
                Member ID: <strong>{portalTargetReg.CustomerID || `REG-${portalTargetReg.RegistrationID}`}</strong>
              </div>
              <label style={{fontSize:'12px',fontWeight:'700',color:'#374151',display:'block',marginBottom:'6px'}}>Set 6-Digit Portal PIN</label>
              <input
                type="text"
                maxLength={6}
                value={portalPinInput}
                onChange={e => setPortalPinInput(e.target.value.replace(/\D/g,''))}
                placeholder="e.g. 123456"
                style={{width:'100%',border:'1.5px solid #e2e8f0',borderRadius:'10px',padding:'11px 14px',fontSize:'18px',letterSpacing:'8px',textAlign:'center',outline:'none',boxSizing:'border-box',fontFamily:'monospace'}}
              />
              <div style={{fontSize:'11px',color:'#94a3b8',marginTop:'6px',marginBottom:'16px'}}>Customer will use this PIN to login at /portal</div>
              {portalEnableMsg && (
                <div style={{
                  background: portalEnableMsg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
                  border: `1px solid ${portalEnableMsg.startsWith('✅') ? '#86efac' : '#fca5a5'}`,
                  color: portalEnableMsg.startsWith('✅') ? '#15803d' : '#dc2626',
                  borderRadius:'10px',padding:'10px 14px',fontSize:'12px',fontWeight:'600',marginBottom:'14px'
                }}>{portalEnableMsg}</div>
              )}
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={() => setShowEnablePortalModal(false)} style={{flex:1,padding:'10px',fontSize:'13px',fontWeight:'700',background:'#f1f5f9',border:'none',borderRadius:'10px',cursor:'pointer',color:'#475569'}}>Close</button>
                {!portalEnableMsg.startsWith('✅') && (
                  <button onClick={submitEnablePortal} disabled={portalEnableLoading} style={{flex:2,padding:'10px',fontSize:'13px',fontWeight:'700',background:'linear-gradient(135deg,#5b21b6,#7c3aed)',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',opacity:portalEnableLoading?.7:1}}>
                    {portalEnableLoading ? 'Enabling...' : '🔐 Enable Portal Access'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerModule;
