import React, { useState } from 'react';
import '../styles/CustomerModule.css';

const CustomerModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('customer-reg');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
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
        columns: ['Customer', 'Member ID', 'Service Plan', 'Status', 'Validity', 'Actions'],
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

  return (
    <div style={{ display: 'flex', gap: '16px', minHeight: 'calc(100vh - 100px)' }}>
      {/* Submenu Sidebar */}
      <div className="submenu-sidebar">
        <div className="submenu-header">Customer</div>
        {subMenuItems.map(item => (
          <button
            key={item.id}
            className={`submenu-item ${activeSubModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveSubModule(item.id)}
          >
            <span className="submenu-icon">{item.icon}</span>
            <span className="submenu-label">{item.label}</span>
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
            <button className="btn btn-primary">+ New {content.title.split(' ')[0]}</button>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <span className="info-icon">🔑</span>
          <div className="info-text">
            <strong>{content.title}:</strong> {content.infoText}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="creg-stats">
          {content.stats && content.stats.map((stat, idx) => (
            <div key={idx} className={`creg-stat ${stat.className}`}>
              <span className="creg-stat-val">{stat.value}</span>
              <span className="creg-stat-lbl">{stat.label}</span>
            </div>
          ))}
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
              <tr>
                <td colSpan={content.columns.length} style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                  No data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerModule;
