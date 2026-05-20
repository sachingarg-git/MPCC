import React, { useState, useEffect } from 'react';
import '../styles/CustomerPortal.css';

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [customerData, setCustomerData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      // Get customer info (you can modify this to get from session/auth)
      const customerId = localStorage.getItem('customerId') || 1;

      const [customerRes, subRes, pickupRes, invoiceRes] = await Promise.all([
        fetch(`/api/customers/${customerId}`),
        fetch(`/api/customers/${customerId}/subscriptions`),
        fetch(`/api/customers/${customerId}/pickups`),
        fetch(`/api/customers/${customerId}/invoices`)
      ]);

      if (customerRes.ok) {
        setCustomerData(await customerRes.json());
      }
      if (subRes.ok) {
        setSubscriptions(await subRes.json());
      }
      if (pickupRes.ok) {
        setPickups(await pickupRes.json());
      }
      if (invoiceRes.ok) {
        setInvoices(await invoiceRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading customer data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="customer-portal">
      <div className="portal-header">
        <h1>Customer Portal</h1>
        <p>Manage your biomedical waste collection services</p>
      </div>

      <div className="portal-container">
        {/* Sidebar Navigation */}
        <div className="portal-sidebar">
          <div className="customer-info">
            <h3>{customerData?.InstitutionName}</h3>
            <p className="contact">{customerData?.ContactPerson}</p>
            <p className="email">{customerData?.Email}</p>
            <p className="mobile">{customerData?.MobileNo}</p>
          </div>

          <nav className="portal-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              📋 Subscriptions
            </button>
            <button
              className={`nav-item ${activeTab === 'pickups' ? 'active' : ''}`}
              onClick={() => setActiveTab('pickups')}
            >
              🚚 Pickups
            </button>
            <button
              className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              💳 Invoices
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="portal-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Dashboard Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-icon">📦</div>
                  <div className="card-content">
                    <h4>Active Subscriptions</h4>
                    <p className="card-value">{subscriptions.length}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon">🚚</div>
                  <div className="card-content">
                    <h4>Total Pickups</h4>
                    <p className="card-value">{pickups.length}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon">📄</div>
                  <div className="card-content">
                    <h4>Pending Invoices</h4>
                    <p className="card-value">
                      {invoices.filter(inv => inv.PaymentStatus === 'Pending').length}
                    </p>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <h4>Total Due</h4>
                    <p className="card-value">
                      ₹{invoices.reduce((sum, inv) => sum + (inv.BalanceAmount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="customer-details">
                <h3>Your Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Institution Name:</label>
                    <p>{customerData?.InstitutionName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Contact Person:</label>
                    <p>{customerData?.ContactPerson}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <p>{customerData?.Email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Mobile:</label>
                    <p>{customerData?.MobileNo}</p>
                  </div>
                  <div className="detail-item">
                    <label>Zone:</label>
                    <p>{customerData?.Zone}</p>
                  </div>
                  <div className="detail-item">
                    <label>Route:</label>
                    <p>{customerData?.Route}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="tab-content">
              <h2>Active Subscriptions</h2>
              <div className="subscriptions-list">
                {subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <div key={sub.SubscriptionID} className="subscription-card">
                      <div className="sub-header">
                        <h4>Service Plan Subscription</h4>
                        <span className="status active">Active</span>
                      </div>
                      <div className="sub-details">
                        <div className="detail-row">
                          <label>Plan ID:</label>
                          <span>{sub.PlanID}</span>
                        </div>
                        <div className="detail-row">
                          <label>Start Date:</label>
                          <span>{new Date(sub.StartDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <label>End Date:</label>
                          <span>{new Date(sub.EndDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <label>Monthly Charges:</label>
                          <span className="amount">₹{sub.MonthlyCharges}</span>
                        </div>
                        <div className="detail-row">
                          <label>Payment Frequency:</label>
                          <span>{sub.PaymentFrequency}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No active subscriptions</p>
                )}
              </div>
            </div>
          )}

          {/* Pickups Tab */}
          {activeTab === 'pickups' && (
            <div className="tab-content">
              <h2>Pickup History</h2>
              <div className="pickups-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Yellow Bags</th>
                      <th>Red Bags</th>
                      <th>Weight (KG)</th>
                      <th>Driver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickups.length > 0 ? (
                      pickups.map((pickup) => (
                        <tr key={pickup.PickupID}>
                          <td>{new Date(pickup.PickupDate).toLocaleDateString()}</td>
                          <td>{pickup.YellowBagCount}</td>
                          <td>{pickup.RedBagCount}</td>
                          <td>{pickup.WeightCollected}</td>
                          <td>{pickup.DriverName}</td>
                          <td className={`status ${pickup.Status?.toLowerCase()}`}>{pickup.Status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">No pickups scheduled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="tab-content">
              <h2>Invoices & Payments</h2>
              <div className="invoices-list">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div key={invoice.InvoiceID} className="invoice-card">
                      <div className="inv-header">
                        <div>
                          <h4>{invoice.InvoiceNumber}</h4>
                          <p className="inv-date">{new Date(invoice.InvoiceDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`status ${invoice.PaymentStatus?.toLowerCase()}`}>
                          {invoice.PaymentStatus}
                        </span>
                      </div>
                      <div className="inv-details">
                        <div className="detail-row">
                          <label>Total Amount:</label>
                          <span className="amount">₹{invoice.TotalAmount}</span>
                        </div>
                        <div className="detail-row">
                          <label>Paid Amount:</label>
                          <span className="amount paid">₹{invoice.PaidAmount}</span>
                        </div>
                        <div className="detail-row">
                          <label>Balance:</label>
                          <span className="amount due">₹{invoice.BalanceAmount}</span>
                        </div>
                        <div className="detail-row">
                          <label>Due Date:</label>
                          <span>{new Date(invoice.DueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="btn-primary">View Invoice</button>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No invoices</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
