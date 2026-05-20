import React, { useState } from 'react';
import '../styles/CRMHCFMaster.css';

const CRMHCFMaster = () => {
  const [activeSubModule, setActiveSubModule] = useState('crm-hcf-master');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Submenu items matching admin.html structure
  const subMenuItems = [
    { id: 'crm-hcf-master', icon: '🏥', label: 'HCF Master — 360° View' },
    { id: 'crm-approval', icon: '✅', label: 'Approval Pipeline' },
    { id: 'crm-renewal', icon: '🔄', label: 'Renewal Management' },
    { id: 'crm-deregister', icon: '🚫', label: 'De-register / Closure' },
    { id: 'crm-support', icon: '🎧', label: 'Customer Support' }
  ];

  // Content configuration for each submenu item
  const getSubModuleContent = () => {
    const configs = {
      'crm-hcf-master': {
        title: 'HCF Master 360° View',
        description: 'Complete healthcare facility overview & master data management',
        infoText: 'Healthcare Facility Master 360° View: Comprehensive view of all HCF details including facility info, certifications, compliance status, and operational metrics. Manage facility master data, update certifications, and track compliance requirements.',
        stats: [
          { label: 'Total HCFs', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Inactive', value: 0, className: 'creg-red' },
          { label: 'Pending Approval', value: 0, className: 'creg-yellow' }
        ],
        columns: ['Facility ID', 'HCF Name', 'Type', 'Location', 'Contact', 'Beds', 'Status', 'License Expiry', 'Certification', 'Actions'],
        tableId: 'hcf360Table'
      },
      'crm-approval': {
        title: 'Approval Pipeline',
        description: 'Review and approve new HCF registrations and amendments',
        infoText: 'Approval Pipeline: Track HCF registration applications and amendments through approval workflow. Review documentation, verify compliance, and approve or reject requests. Manage approval status and maintain audit trail.',
        stats: [
          { label: 'Pending', value: 0, className: 'creg-yellow' },
          { label: 'Under Review', value: 0, className: 'creg-yellow' },
          { label: 'Approved', value: 0, className: 'creg-green' },
          { label: 'Rejected', value: 0, className: 'creg-red' }
        ],
        columns: ['Application ID', 'HCF Name', 'Type', 'Submitted Date', 'Reviewer', 'Status', 'Comments', 'Actions'],
        tableId: 'approvalTable'
      },
      'crm-renewal': {
        title: 'Renewal Management',
        description: 'Manage HCF license and certification renewals',
        infoText: 'Renewal Management: Track license renewal deadlines, manage certification renewals, and monitor compliance status. Generate renewal reminders and maintain renewal documents. Ensure continuous regulatory compliance.',
        stats: [
          { label: 'Total', value: 0, className: '' },
          { label: 'Due Soon', value: 0, className: 'creg-yellow' },
          { label: 'Overdue', value: 0, className: 'creg-red' },
          { label: 'Renewed', value: 0, className: 'creg-green' }
        ],
        columns: ['Facility ID', 'HCF Name', 'License Type', 'Current Expiry', 'Renewal Date', 'Status', 'Days Remaining', 'Actions'],
        tableId: 'renewalTable'
      },
      'crm-deregister': {
        title: 'De-register / Closure',
        description: 'Manage HCF de-registration and facility closure processes',
        infoText: 'De-register / Closure: Manage HCF de-registration, facility closures, and operational cessation. Track closure documentation, final compliance checks, and archive records. Maintain historical data for audit purposes.',
        stats: [
          { label: 'Active Closures', value: 0, className: 'creg-yellow' },
          { label: 'Completed', value: 0, className: 'creg-green' },
          { label: 'De-registered', value: 0, className: '' },
          { label: 'Archived', value: 0, className: '' }
        ],
        columns: ['Facility ID', 'HCF Name', 'Closure Date', 'Reason', 'Status', 'Final Audit', 'Archived', 'Actions'],
        tableId: 'deregTable'
      },
      'crm-support': {
        title: 'Customer Support',
        description: 'HCF customer support tickets and query management',
        infoText: 'Customer Support: Manage HCF customer queries, support tickets, and escalations. Track issue resolution, maintain SLA compliance, and monitor customer satisfaction. Provide timely support for operational issues.',
        stats: [
          { label: 'Total Tickets', value: 0, className: '' },
          { label: 'Open', value: 0, className: 'creg-red' },
          { label: 'In Progress', value: 0, className: 'creg-yellow' },
          { label: 'Resolved', value: 0, className: 'creg-green' }
        ],
        columns: ['Ticket ID', 'HCF Name', 'Issue Type', 'Priority', 'Assigned To', 'Status', 'Created Date', 'Actions'],
        tableId: 'supportTable'
      }
    };
    return configs[activeSubModule] || configs['crm-hcf-master'];
  };

  const content = getSubModuleContent();

  return (
    <div style={{ display: 'flex', gap: '16px', minHeight: 'calc(100vh - 100px)' }}>
      {/* Submenu Sidebar */}
      <div className="submenu-sidebar">
        <div className="submenu-header">CRM — HCF</div>
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
                        <option>Approved</option>
                        <option>Rejected</option>
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

export default CRMHCFMaster;
