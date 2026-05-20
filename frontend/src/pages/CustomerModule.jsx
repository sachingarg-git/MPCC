import React, { useState } from 'react';
import '../styles/CustomerModule.css';

const CustomerModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('registration');
  const [filterData, setFilterData] = useState({
    memberId: '',
    institutionName: '',
    category: '',
    zone: '',
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
      case 'registration':
        return {
          title: 'Customer Registration',
          description: 'Customers registered via landing page — review, verify & approve',
          info: 'Customer Login Portal: Customers can login at mpccharidwar.in/portal using credentials sent via SMS/Email on registration approval. If login not working: (1) Check customer status is "Approved" below. (2) Click Actions – Resend Credentials from the customer row. (3) Ensure mobile/email is correct in profile.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'ACTIVE', value: 0, color: '#4caf50' },
            { label: 'PENDING', value: 0, color: '#ff9800' },
            { label: 'INACTIVE', value: 0, color: '#f44336' }
          ],
          columns: ['MEMBER ID', 'INSTITUTION NAME', 'CATEGORY', 'SUB-CATEGORY', 'ZONE', 'ROUTE', 'MOBILE', 'EMAIL', 'SERVICE PLAN', 'BEDS', 'KIT', 'CONSULTING', 'COMPLIANCE', 'REG. DATE', 'STATUS', 'QR CODE', 'ACTION']
        };
      case 'certificate':
        return {
          title: 'Certificate Generation',
          description: 'Generate and manage customer certificates',
          info: 'Generate compliance certificates for customers. Ensure all required documents are submitted before certificate generation.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'GENERATED', value: 0, color: '#4caf50' },
            { label: 'PENDING', value: 0, color: '#ff9800' },
            { label: 'EXPIRED', value: 0, color: '#f44336' }
          ],
          columns: ['CERTIFICATE ID', 'INSTITUTION NAME', 'CERTIFICATE TYPE', 'ISSUE DATE', 'EXPIRY DATE', 'STATUS', 'ACTION']
        };
      case 'requests':
        return {
          title: 'Service Requests',
          description: 'Manage customer service requests and complaints',
          info: 'Track and manage all service requests from customers. Ensure timely resolution and follow-up.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'OPEN', value: 0, color: '#2196f3' },
            { label: 'IN PROGRESS', value: 0, color: '#ff9800' },
            { label: 'CLOSED', value: 0, color: '#4caf50' }
          ],
          columns: ['REQUEST ID', 'INSTITUTION NAME', 'TYPE', 'SUBJECT', 'PRIORITY', 'REQUESTED DATE', 'DUE DATE', 'STATUS', 'ASSIGNED TO', 'ACTION']
        };
      case 'mou':
        return {
          title: 'Customer MOU',
          description: 'Memorandum of Understanding management',
          info: 'Upload and track MOU documents for customers. Ensure all agreements are properly documented.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'ACTIVE', value: 0, color: '#4caf50' },
            { label: 'EXPIRING SOON', value: 0, color: '#ff9800' },
            { label: 'EXPIRED', value: 0, color: '#f44336' }
          ],
          columns: ['MOU ID', 'INSTITUTION NAME', 'SIGNED DATE', 'VALID FROM', 'VALID TO', 'STATUS', 'DOCUMENT', 'ACTION']
        };
      case 'failed':
        return {
          title: 'Failed Registrations',
          description: 'Review and reprocess failed customer registrations',
          info: 'Manage registrations that failed validation. Review reasons and reprocess or contact customers.',
          stats: [
            { label: 'TOTAL', value: 0, color: '#999' },
            { label: 'PENDING REVIEW', value: 0, color: '#2196f3' },
            { label: 'REPROCESSED', value: 0, color: '#4caf50' },
            { label: 'REJECTED', value: 0, color: '#f44336' }
          ],
          columns: ['REGISTRATION ID', 'INSTITUTION NAME', 'FAILURE REASON', 'FAILED DATE', 'CONTACT PERSON', 'MOBILE', 'EMAIL', 'ACTION']
        };
      default:
        return null;
    }
  };

  const content = getSubModuleContent();

  return (
    <div className="customer-module">
      <div className="module-header">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </div>

      <div className="module-container">
        {/* Sidebar */}
        <div className="module-sidebar">
          <div className="sidebar-category">CUSTOMER</div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSubModule === 'registration' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('registration')}
            >
              👤 Customer Registration
            </button>
            <button
              className={`nav-item ${activeSubModule === 'certificate' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('certificate')}
            >
              📜 Certificate Generation
            </button>
            <button
              className={`nav-item ${activeSubModule === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('requests')}
            >
              📋 Service Requests
            </button>
            <button
              className={`nav-item ${activeSubModule === 'mou' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('mou')}
            >
              📄 Customer MOU
            </button>
            <button
              className={`nav-item ${activeSubModule === 'failed' ? 'active' : ''}`}
              onClick={() => setActiveSubModule('failed')}
            >
              ⚠️ Failed Registrations
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
                            placeholder="Membe"
                            name="memberId"
                            value={filterData.memberId}
                            onChange={handleFilterChange}
                            className="filter-input"
                          />
                        )}
                        {idx === 1 && (
                          <input
                            type="text"
                            placeholder="Name"
                            name="institutionName"
                            value={filterData.institutionName}
                            onChange={handleFilterChange}
                            className="filter-input"
                          />
                        )}
                        {idx === 2 && (
                          <input
                            type="text"
                            placeholder="Catego"
                            name="category"
                            value={filterData.category}
                            onChange={handleFilterChange}
                            className="filter-input"
                          />
                        )}
                        {idx === 4 && (
                          <input
                            type="text"
                            placeholder="Zo"
                            name="zone"
                            value={filterData.zone}
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

export default CustomerModule;
