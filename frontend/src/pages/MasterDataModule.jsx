import React, { useState, useCallback, useEffect } from 'react';
import '../styles/MasterDataModule.css';

const MasterDataModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('routes');
  const [filters, setFilters] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Submenu items matching admin.html structure
  const subMenuItems = [
    { id: 'routes', icon: '🛣️', label: 'Route Master' },
    { id: 'serviceplans', icon: '📋', label: 'Service Plan Master' },
    { id: 'paymentfreqs', icon: '💳', label: 'Payment Frequency' },
    { id: 'kits', icon: '🧰', label: 'Kit Master' },
    { id: 'wastecategories', icon: '🗑️', label: 'Waste Category' },
    { id: 'vehicles', icon: '🚗', label: 'Vehicle Master' },
    { id: 'vendors', icon: '🏪', label: 'Vendor Master' },
    { id: 'rawmaterials', icon: '🧪', label: 'Raw Materials / Items' }
  ];

  // Content configuration for each submenu item
  const getSubModuleContent = () => {
    const configs = {
      'routes': {
        title: 'Route Master',
        description: 'Manage collection routes and driver assignments',
        icon: '🛣️',
        infoText: 'Create and manage biomedical waste collection routes. Assign drivers, set collection schedules, and track route efficiency. Each route can have primary and secondary drivers.',
        stats: [
          { label: 'Total Routes', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Inactive', value: 0, className: 'creg-red' },
          { label: 'Under Maintenance', value: 0, className: 'creg-yellow' }
        ],
        columns: ['Route Code', 'Route Name', 'Type', 'Primary Driver', 'Secondary Driver', 'Status', 'Created Date', 'Actions'],
        tableId: 'tbl-routes'
      },
      'serviceplans': {
        title: 'Service Plan Master',
        description: 'Configure service plans with pricing and collection details',
        icon: '📋',
        infoText: 'Define biomedical waste management service plans with categories, zones, pricing, and features. Configure monthly charges, registration fees, and consulting charges.',
        stats: [
          { label: 'Total Plans', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Inactive', value: 0, className: 'creg-red' },
          { label: 'Discontinued', value: 0, className: 'creg-yellow' }
        ],
        columns: ['Plan Code', 'Plan Name', 'Category', 'Zone', 'Monthly Rate', 'Registration Fee', 'Status', 'Actions'],
        tableId: 'tbl-serviceplans'
      },
      'paymentfreqs': {
        title: 'Payment Frequency',
        description: 'Define payment frequency options and discount structures',
        icon: '💳',
        infoText: 'Configure payment frequency options (Monthly, Quarterly, etc.) with discount percentages and conditions. Manage billing cycles and payment grace periods.',
        stats: [
          { label: 'Total Frequencies', value: 0, className: '' },
          { label: 'Monthly', value: 0, className: '' },
          { label: 'Quarterly+', value: 0, className: 'creg-green' },
          { label: 'With Discounts', value: 0, className: 'creg-yellow' }
        ],
        columns: ['Frequency Name', 'Months', 'Discount Amount', 'Discount %', 'Description', 'Status', 'Actions'],
        tableId: 'tbl-paymentfreqs'
      },
      'kits': {
        title: 'Kit Master',
        description: 'Manage waste collection kit configurations and pricing',
        icon: '🧰',
        infoText: 'Configure biomedical waste collection kits with items, quantities, and pricing. Track kit inventory and manage kit-to-customer assignments.',
        stats: [
          { label: 'Total Kits', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'In Stock', value: 0, className: 'creg-green' },
          { label: 'Low Stock', value: 0, className: 'creg-yellow' }
        ],
        columns: ['Kit Code', 'Kit Name', 'Type', 'Items Count', 'Unit Price', 'Status', 'Stock Level', 'Actions'],
        tableId: 'tbl-kits'
      },
      'wastecategories': {
        title: 'Waste Category',
        description: 'Define waste categories and classification rules',
        icon: '🗑️',
        infoText: 'Manage biomedical waste categories (Yellow, Red, Green, Black) with classification rules, handling procedures, and regulatory requirements.',
        stats: [
          { label: 'Total Categories', value: 0, className: '' },
          { label: 'Yellow Waste', value: 0, className: 'creg-yellow' },
          { label: 'Red Waste', value: 0, className: 'creg-red' },
          { label: 'Green Waste', value: 0, className: 'creg-green' }
        ],
        columns: ['Category Code', 'Category Name', 'Color', 'Waste Type', 'Handling Procedure', 'Hazard Level', 'Status', 'Actions'],
        tableId: 'tbl-wastecategories'
      },
      'vehicles': {
        title: 'Vehicle Master',
        description: 'Manage collection vehicles and maintenance schedules',
        icon: '🚗',
        infoText: 'Track biomedical waste collection vehicles, maintenance schedules, registration details, and compliance certifications. Monitor vehicle health and assign to routes.',
        stats: [
          { label: 'Total Vehicles', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Under Maintenance', value: 0, className: 'creg-yellow' },
          { label: 'Retired', value: 0, className: 'creg-red' }
        ],
        columns: ['Vehicle ID', 'Registration No.', 'Type', 'Make/Model', 'Capacity', 'Status', 'Last Service', 'Actions'],
        tableId: 'tbl-vehicles'
      },
      'vendors': {
        title: 'Vendor Master',
        description: 'Manage suppliers and service vendors',
        icon: '🏪',
        infoText: 'Maintain vendor database for kits, equipment, and services. Track vendor contact info, pricing, delivery schedules, and payment terms.',
        stats: [
          { label: 'Total Vendors', value: 0, className: '' },
          { label: 'Active', value: 0, className: 'creg-green' },
          { label: 'Preferred', value: 0, className: 'creg-green' },
          { label: 'Inactive', value: 0, className: 'creg-red' }
        ],
        columns: ['Vendor Code', 'Vendor Name', 'Category', 'Contact Person', 'Email', 'Rating', 'Status', 'Actions'],
        tableId: 'tbl-vendors'
      },
      'rawmaterials': {
        title: 'Raw Materials / Items',
        description: 'Manage inventory items and raw materials',
        icon: '🧪',
        infoText: 'Track raw materials, consumables, and spare parts inventory. Manage stock levels, reorder points, and supplier information.',
        stats: [
          { label: 'Total Items', value: 0, className: '' },
          { label: 'In Stock', value: 0, className: 'creg-green' },
          { label: 'Low Stock', value: 0, className: 'creg-yellow' },
          { label: 'Out of Stock', value: 0, className: 'creg-red' }
        ],
        columns: ['Item Code', 'Item Name', 'Category', 'Unit Price', 'Stock Qty', 'Reorder Level', 'Supplier', 'Actions'],
        tableId: 'tbl-rawmaterials'
      }
    };
    return configs[activeSubModule] || configs['routes'];
  };

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/${activeSubModule}`);
      if (!response.ok) throw new Error(`Failed to fetch ${activeSubModule}`);
      const result = await response.json();
      setData(result || []);
      setMessage({ type: '', text: '' });
    } catch (err) {
      setMessage({ type: 'error', text: `Error loading data: ${err.message}` });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeSubModule]);

  useEffect(() => {
    fetchData();
  }, [activeSubModule, fetchData]);

  const content = getSubModuleContent();

  return (
    <div style={{ display: 'flex', gap: '16px', minHeight: 'calc(100vh - 100px)' }}>
      {/* Submenu Sidebar */}
      <div className="submenu-sidebar">
        <div className="submenu-header">Master Data</div>
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
            <button className="btn btn-primary">+ Add {content.title.split(' ')[0]}</button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px',
            background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: message.type === 'error' ? '#991b1b' : '#065f46',
            fontSize: '13px'
          }}>
            {message.text}
          </div>
        )}

        {/* Info Box */}
        <div className="info-box">
          <span className="info-icon">{content.icon}</span>
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Loading data...
          </div>
        ) : (
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
                          <option>Inactive</option>
                        </select>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr key={idx}>
                      {content.columns.map((col, colIdx) => (
                        <td key={colIdx}>{row[col] || '—'}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={content.columns.length} style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDataModule;
