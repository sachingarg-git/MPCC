import { memo } from 'react'

const ServicePlanForm = memo(({ formData, handleInputChange, getAutoCode }) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Basic Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Plan Code</label>
            <input
              type="text"
              value={getAutoCode()}
              readOnly
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', background: '#f1f5f9' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Plan Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g. Standard Hospital Plan"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Category <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              name="category"
              value={formData.category || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select Category</option>
              <option value="Yellow Bag">Yellow Bag</option>
              <option value="Red Bag">Red Bag</option>
              <option value="Multi-Category">Multi-Category</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Sub-Category</label>
            <select
              name="subCategory"
              value={formData.subCategory || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select Sub-Category</option>
              <option value="Anatomical Waste">Anatomical Waste</option>
              <option value="Cytotoxic Waste">Cytotoxic Waste</option>
              <option value="Sharps">Sharps</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Zone <span style={{ color: '#dc2626' }}>*</span></label>
            <select
              name="zone"
              value={formData.zone || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select Zone</option>
              <option value="Haridwar North">Haridwar North</option>
              <option value="Haridwar South">Haridwar South</option>
              <option value="Rishikesh Zone">Rishikesh Zone</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Route</label>
            <select
              name="route"
              value={formData.route || ''}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            >
              <option value="">Select Route</option>
              <option value="Daily Route A">Daily Route A</option>
              <option value="City Route B">City Route B</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Plan description..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Pricing Configuration</div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Pricing Type</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
              <input
                type="radio"
                name="pricingType"
                value="fixed"
                checked={formData.pricingType === 'fixed'}
                onChange={handleInputChange}
              />
              Fixed Monthly
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
              <input
                type="radio"
                name="pricingType"
                value="perbed"
                checked={formData.pricingType === 'perbed'}
                onChange={handleInputChange}
              />
              Per Bed
            </label>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Monthly Charges (₹) <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="number"
              name="monthlyCharges"
              value={formData.monthlyCharges || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Registration Charges (₹)</label>
            <input
              type="number"
              name="registrationCharges"
              value={formData.registrationCharges || ''}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Consulting Fees (₹)</label>
          <input
            type="number"
            name="consultingFees"
            value={formData.consultingFees || ''}
            onChange={handleInputChange}
            placeholder="0.00"
            min="0"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Status</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleInputChange}
            />
            Active
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault || false}
              onChange={handleInputChange}
            />
            Set as Default Plan
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '400', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isPopular"
              checked={formData.isPopular || false}
              onChange={handleInputChange}
            />
            Mark as Popular
          </label>
        </div>
      </div>
    </div>
  )
})

ServicePlanForm.displayName = 'ServicePlanForm'

export default ServicePlanForm
