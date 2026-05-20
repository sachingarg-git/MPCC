import { memo, useState, useEffect } from 'react'

const inp = {
  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
  borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box'
}
const lbl = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#1e293b', marginBottom: '6px'
}

const ServicePlanForm = memo(({ formData, handleInputChange, getAutoCode, planItems, setPlanItems }) => {
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [routes, setRoutes] = useState([])
  const [apiZones, setApiZones] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])

  // Load categories, routes, and zones on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))

    fetch('/api/routes')
      .then(r => r.json())
      .then(data => setRoutes(Array.isArray(data) ? data : []))
      .catch(() => setRoutes([]))

    fetch('/api/zones')
      .then(r => r.json())
      .then(data => setApiZones(Array.isArray(data) ? data : []))
      .catch(() => setApiZones([]))

    fetch('/api/rawmaterials')
      .then(r => r.json())
      .then(data => setRawMaterials(Array.isArray(data) ? data : []))
      .catch(() => setRawMaterials([]))
  }, [])

  // Filter sub-categories whenever the selected category changes
  useEffect(() => {
    if (!formData.category) {
      setSubCategories([])
      return
    }
    // Try to match by CategoryID (numeric) or CategoryName (string)
    const matched = categories.find(
      c => String(c.CategoryID) === String(formData.category) ||
           c.CategoryName === formData.category
    )
    setSubCategories(matched ? matched.SubCategories || [] : [])
  }, [formData.category, categories])

  return (
    <div style={{ padding: '20px' }}>

      {/* ── Basic Information ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Basic Information</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={lbl}>Plan Code</label>
            <input type="text" value={getAutoCode()} readOnly style={{ ...inp, background: '#f1f5f9' }} />
          </div>
          <div>
            <label style={lbl}>Plan Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange}
              placeholder="e.g. Standard Hospital Plan" style={inp} />
          </div>
        </div>

        {/* Category + Sub-Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={lbl}>Category <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="category" value={formData.category || ''} onChange={handleInputChange} style={inp}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.CategoryID} value={cat.CategoryName}>{cat.CategoryName}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                ⚠ No categories found — add them in Category Master first
              </div>
            )}
          </div>
          <div>
            <label style={lbl}>Sub-Category</label>
            <select name="subCategory" value={formData.subCategory || ''} onChange={handleInputChange}
              style={{ ...inp, opacity: subCategories.length === 0 ? 0.6 : 1 }}
              disabled={subCategories.length === 0}>
              <option value="">{formData.category ? 'Select Sub-Category' : 'Select Category first'}</option>
              {subCategories.map(sub => (
                <option key={sub.SubCategoryID} value={sub.SubCategoryName}>{sub.SubCategoryName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone + Route */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={lbl}>Zone <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="zone" value={formData.zone || ''} onChange={handleInputChange} style={inp}>
              <option value="">Select Zone</option>
              {apiZones.map(z => (
                <option key={z.ZoneID} value={z.ZoneName}>{z.ZoneName}{z.ZoneType ? ` (${z.ZoneType})` : ''}</option>
              ))}
              {apiZones.length === 0 && (
                <option disabled>⚠ No zones found — add them in Zone Master first</option>
              )}
            </select>
          </div>
          <div>
            <label style={lbl}>Route</label>
            <select name="route" value={formData.route || ''} onChange={handleInputChange} style={inp}>
              <option value="">Select Route</option>
              {routes.map(r => (
                <option key={r.RouteID} value={r.RouteID}>
                  {r.RouteName} {r.RouteType ? `(${r.RouteType})` : ''}
                </option>
              ))}
            </select>
            {routes.length === 0 && (
              <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                ⚠ No routes found — add them in Route Master first
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={lbl}>Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleInputChange}
            placeholder="Plan description..."
            style={{ ...inp, minHeight: '80px', fontFamily: 'inherit' }} />
        </div>

        {/* Applicable Facility Types */}
        <div style={{ marginTop: '15px' }}>
          <label style={lbl}>Applicable Facility Types</label>
          <select name="facilityTypes" value={formData.facilityTypes || ''} onChange={handleInputChange} style={inp}>
            <option value="">All Facility Types</option>
            <option value="All">All</option>
            <option value="Hospital Only">Hospital Only</option>
            <option value="Clinic Only">Clinic Only</option>
            <option value="Diagnostic Lab">Diagnostic Lab</option>
            <option value="Dental Clinic">Dental Clinic</option>
            <option value="Nursing Home">Nursing Home</option>
            <option value="Pathology Lab">Pathology Lab</option>
            <option value="Veterinary">Veterinary</option>
            <option value="Blood Bank">Blood Bank</option>
          </select>
        </div>
      </div>

      {/* ── Pricing Configuration ── */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Pricing Configuration</div>
        <div style={{ marginBottom: '15px' }}>
          <label style={lbl}>Pricing Type</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="pricingType" value="fixed" checked={formData.pricingType === 'fixed'} onChange={handleInputChange} />
              Fixed Monthly
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="pricingType" value="perbed" checked={formData.pricingType === 'perbed'} onChange={handleInputChange} />
              Per Bed
            </label>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={lbl}>Monthly Charges (₹) <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="number" name="monthlyCharges" value={formData.monthlyCharges || ''} onChange={handleInputChange}
              placeholder="0.00" min="0" style={inp} />
          </div>
          <div>
            <label style={lbl}>Registration Charges (₹)</label>
            <input type="number" name="registrationCharges" value={formData.registrationCharges || ''} onChange={handleInputChange}
              placeholder="0.00" min="0" style={inp} />
          </div>
        </div>
        <div>
          <label style={lbl}>Consulting Fees (₹)</label>
          <input type="number" name="consultingFees" value={formData.consultingFees || ''} onChange={handleInputChange}
            placeholder="0.00" min="0" style={inp} />
        </div>
      </div>

      {/* ── Plan Materials / Items ── */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Plan Materials / Items</div>
          <button type="button"
            onClick={() => setPlanItems && setPlanItems(prev => [...prev, { id: Date.now(), materialId: '', materialName: '', uom: 'Pcs', qty: 1, notes: '' }])}
            style={{ background: '#ede9fe', border: 'none', color: '#7c3aed', fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>
            + Add Material
          </button>
        </div>
        {(!planItems || planItems.length === 0) && (
          <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#94a3b8', border: '1px dashed #e2e8f0' }}>
            No materials added. Click "+ Add Material" to include items in this plan.
          </div>
        )}
        {planItems && planItems.length > 0 && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>Item</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '80px' }}>UOM</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0', width: '80px' }}>Qty/Visit</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>Notes</th>
                  <th style={{ width: '32px', borderBottom: '1px solid #e2e8f0' }}></th>
                </tr>
              </thead>
              <tbody>
                {planItems.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx < planItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '6px 8px' }}>
                      <select
                        value={item.materialId || ''}
                        onChange={e => {
                          const mat = rawMaterials.find(m => String(m.MaterialID) === e.target.value);
                          setPlanItems && setPlanItems(prev => prev.map(pi => pi.id === item.id
                            ? { ...pi, materialId: e.target.value, materialName: mat ? mat.MaterialName : '', uom: mat ? (mat.UOM || 'Pcs') : pi.uom }
                            : pi
                          ));
                        }}
                        style={{ ...inp, padding: '5px 8px', fontSize: '12px' }}>
                        <option value="">Select Item</option>
                        {rawMaterials.map(m => (
                          <option key={m.MaterialID} value={m.MaterialID}>{m.MaterialName}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="text" value={item.uom || 'Pcs'} readOnly
                        style={{ ...inp, padding: '5px 8px', fontSize: '12px', background: '#f8fafc', width: '100%' }} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="number" value={item.qty || 1} min="1"
                        onChange={e => setPlanItems && setPlanItems(prev => prev.map(pi => pi.id === item.id ? { ...pi, qty: e.target.value } : pi))}
                        style={{ ...inp, padding: '5px 8px', fontSize: '12px', width: '100%' }} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="text" value={item.notes || ''} placeholder="Optional"
                        onChange={e => setPlanItems && setPlanItems(prev => prev.map(pi => pi.id === item.id ? { ...pi, notes: e.target.value } : pi))}
                        style={{ ...inp, padding: '5px 8px', fontSize: '12px', width: '100%' }} />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <button type="button"
                        onClick={() => setPlanItems && setPlanItems(prev => prev.filter(pi => pi.id !== item.id))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Status ── */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Status</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleInputChange} />
            Active
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" name="isDefault" checked={formData.isDefault || false} onChange={handleInputChange} />
            Set as Default Plan
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" name="isPopular" checked={formData.isPopular || false} onChange={handleInputChange} />
            Mark as Popular
          </label>
        </div>
      </div>

    </div>
  )
})

ServicePlanForm.displayName = 'ServicePlanForm'
export default ServicePlanForm
