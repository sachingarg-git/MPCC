import React, { useState } from 'react';
import '../styles/CRMHCFMaster.css';

const CRMHCFMaster = () => {
  const [activeSubModule, setActiveSubModule] = useState('hcfMaster');
  const [filterData, setFilterData] = useState({
    hcfId: '',
    hcfName: '',
    category: '',
    status: 'All'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getSubModuleContent = () => {
    switch(activeSubModule) {
      case 'hcfMaster':
        return {
          title: 'HCF Master — 360° View',
          description: 'Comprehensive view of all Healthcare Facilities',
          info: 'HCF Master — 360° View: Complete profile of all registered Healthcare Facilities. Monitor services, compliance, performance metrics. Update contact details, service plans, compliance status. Track operational efficiency and service quality.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'ACTIVE', value: 0, color: '#4caf50' },
            { label: 'PENDING', value: 0, color: '#ff9800' },
            { label: 'INACTIVE', value: 0, color: '#f44336' }
          ],
          columns: ['HCF ID', 'HCF NAME', 'CATEGORY', 'SUB-CATEGORY', 'BEDS', 'LOCATION', 'ZONE', 'CONTACT', 'MOBILE', 'EMAIL', 'SERVICE PLAN', 'COMPLIANCE', 'RATING', 'STATUS', 'ACTION']
        };
      case 'approval':
        return {
          title: 'Approval Pipeline',
          description: 'Manage HCF approvals and compliance verification',
          info: 'Track all pending HCF approvals. Review documents, verify compliance requirements. Approve or request modifications. Ensure all healthcare facilities meet regulatory standards before activation.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'PENDING', value: 0, color: '#2196f3' },
            { label: 'APPROVED', value: 0, color: '#4caf50' },
            { label: 'REJECTED', value: 0, color: '#f44336' }
          ],
          columns: ['APPROVAL ID', 'HCF NAME', 'APPLICATION DATE', 'CATEGORY', 'BEDS', 'COMPLIANCE STATUS', 'DOCUMENT STATUS', 'ASSIGNED TO', 'STATUS', 'ACTION']
        };
      case 'renewal':
        return {
          title: 'Renewal Management',
          description: 'Manage contract and compliance renewals',
          info: 'Track renewal schedules for all HCFs. Monitor certifications, licenses, and service contracts. Send renewal reminders. Process renewal applications and update active status.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'ACTIVE', value: 0, color: '#4caf50' },
            { label: 'DUE FOR RENEWAL', value: 0, color: '#ff9800' },
            { label: 'EXPIRED', value: 0, color: '#f44336' }
          ],
          columns: ['RENEWAL ID', 'HCF NAME', 'RENEWAL TYPE', 'LAST RENEWAL', 'DUE DATE', 'DAYS REMAINING', 'DOCUMENTS REQUIRED', 'STATUS', 'ACTION']
        };
      case 'deregister':
        return {
          title: 'De-register / Closure',
          description: 'Process HCF deregistration and closure requests',
          info: 'Manage HCF closure and deregistration process. Archive records, process final settlements, and update status. Ensure all compliance requirements are met before closure.',
          stats: [
            { label: 'TOTAL REQUESTS', value: 0, color: '#999' },
            { label: 'PENDING', value: 0, color: '#2196f3' },
            { label: 'APPROVED', value: 0, color: '#4caf50' },
            { label: 'REJECTED', value: 0, color: '#f44336' }
          ],
          columns: ['REQUEST ID', 'HCF NAME', 'REQUEST DATE', 'REASON', 'LAST SERVICE DATE', 'OUTSTANDING DUES', 'APPROVAL STATUS', 'ACTION']
        };
      case 'support':
        return {
          title: 'Customer Support',
          description: 'HCF support and helpdesk management',
          info: 'Manage support tickets and HCF queries. Track issue resolution. Provide timely assistance to healthcare facilities. Monitor support quality and response time.',
          stats: [
            { label: 'TOTAL TICKETS', value: 0, color: '#999' },
            { label: 'OPEN', value: 0, color: '#2196f3' },
            { label: 'IN PROGRESS', value: 0, color: '#ff9800' },
            { label: 'RESOLVED', value: 0, color: '#4caf50' }
          ],
          columns: ['TICKET ID', 'HCF NAME', 'SUBJECT', 'PRIORITY', 'CREATED DATE', 'ASSIGNED TO', 'CATEGORY', 'STATUS', 'ACTION']
        };
      default:
        return null;
    }
  };

  const content = getSubModuleContent();

  return (
    <div className="crm-hcf-module">
      <div className="module-header">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </div>

      <div className="module-container">
        {/* Sidebar */}
        <div className="module-sidebar">
          <div className="sidebar-category">CRM — HCF MASTER</div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSubModule === 'hcfMaster' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('hcfMaster')}
            >
              🏥 HCF Master — 360° View
            </button>
            <button
              className={`nav-item ${activeSubModule === 'approval' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('approval')}
            >
              ✅ Approval Pipeline
            </button>
            <button
              className={`nav-item ${activeSubModule === 'renewal' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('renewal')}
            >
              🔄 Renewal Management
            </button>
            <button
              className={`nav-item ${activeSubModule === 'deregister' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('deregister')}
            >
              🚪 De-register / Closure
            </button>
            <button
              className={`nav-item ${activeSubModule === 'support' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('support')}
            >
              💬 Customer Support
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="module-content">
          {/* Info Box */}
          <div className="info-box">
            <span className="info-icon">ℹ️</span>
            <div className="info-text">
              <strong>{content.title}:</strong> {content.info}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            {content.stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="table-section">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {content.columns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                  <tr className="filter-row">
                    {content.columns.map((col, idx) => (
                      <th key={idx} className="filter-header">
                        {idx === 0 && (
                          <input
                            type="text"
                            placeholder="ID"
                            name="hcfId"
                            value={filterData.hcfId}
                            onChange={handleFilterChange}
                            className="filter-input"
                          />
                        )}
                        {idx === 1 && (
                          <input
                            type="text"
                            placeholder="Name"
                            name="hcfName"
                            value={filterData.hcfName}
                            onChange={handleFilterChange}
                            className="filter-input"
                          />
                        )}
                        {idx === 2 && (
                          <input
                            type="text"
                            placeholder="Category"
                            name="category"
                            value={filterData.category}
                            onChange={handleFilterChange}
                            className="filter-input"
                          />
                        )}
                        {idx === content.columns.length - 1 && (
                          <select
                            name="status"
                            value={filterData.status}
                            onChange={handleFilterChange}
                            className="filter-input"
                          >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={content.columns.length} className="no-data">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-cancel">✕ Cancel</button>
            <button className="btn-next">Next Step →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMHCFMaster;
