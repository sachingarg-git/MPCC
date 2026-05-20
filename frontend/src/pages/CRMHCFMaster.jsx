import React, { useState } from 'react';
import '../styles/CRMHCFMaster.css';

const CRMHCFMaster = () => {
  const [activeTab, setActiveTab] = useState('hcf360');
  const [filters, setFilters] = useState({});

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const getTabContent = () => {
    switch(activeTab) {
      case 'hcf360':
        return {
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
        };
      case 'approval':
        return {
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
        };
      case 'renewal':
        return {
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
        };
      case 'deregister':
        return {
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
        };
      case 'support':
        return {
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
        };
      default:
        return {};
    }
  };

  const content = getTabContent();

  return (
    <div className="section">
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

      {/* Navigation Tabs for Sub-modules */}
      <div className="module-tabs">
        <button
          className={`tab-button ${activeTab === 'hcf360' ? 'active' : ''}`}
          onClick={() => setActiveTab('hcf360')}
        >
          👁️ HCF Master 360° View
        </button>
        <button
          className={`tab-button ${activeTab === 'approval' ? 'active' : ''}`}
          onClick={() => setActiveTab('approval')}
        >
          ✅ Approval Pipeline
        </button>
        <button
          className={`tab-button ${activeTab === 'renewal' ? 'active' : ''}`}
          onClick={() => setActiveTab('renewal')}
        >
          🔄 Renewal Management
        </button>
        <button
          className={`tab-button ${activeTab === 'deregister' ? 'active' : ''}`}
          onClick={() => setActiveTab('deregister')}
        >
          🚫 De-register / Closure
        </button>
        <button
          className={`tab-button ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          🎧 Customer Support
        </button>
      </div>
    </div>
  );
};

export default CRMHCFMaster;
