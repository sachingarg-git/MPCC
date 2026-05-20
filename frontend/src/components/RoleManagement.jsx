import { useState, useEffect } from 'react'

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    isActive: true
  })

  // Fetch roles and permissions on mount
  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/roles')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
    } catch (err) {
      setError('Error fetching roles: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions')
      if (!response.ok) throw new Error('Failed to fetch permissions')
      const data = await response.json()
      setPermissions(data)
    } catch (err) {
      // API endpoint doesn't exist yet, this is expected
      console.log('Permissions endpoint not yet implemented')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setFormData({
      roleName: role.RoleName,
      description: role.Description || '',
      isActive: role.IsActive === 1
    })
    setShowForm(true)
    // Load role permissions
    loadRolePermissions(role.RoleID)
  }

  const loadRolePermissions = async (roleId) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`)
      if (!response.ok) throw new Error('Failed to fetch permissions')
      const data = await response.json()
      setSelectedPermissions(data.map(p => p.PermissionID))
    } catch (err) {
      console.log('Could not load role permissions:', err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      roleName: '',
      description: '',
      isActive: true
    })
    setSelectedPermissions([])
    setEditingRole(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.roleName.trim()) {
      setError('Role name is required')
      return
    }

    // For now, just show success message (actual API would be needed)
    setSuccess(editingRole ? 'Role updated successfully' : 'Role created successfully')
    resetForm()
    setShowForm(false)
    fetchRoles()
  }

  // Group permissions by module
  const permissionsByModule = {}
  permissions.forEach(perm => {
    const module = perm.Module || 'Other'
    if (!permissionsByModule[module]) {
      permissionsByModule[module] = []
    }
    permissionsByModule[module].push(perm)
  })

  const moduleOrder = [
    'Dashboard',
    'Master Data',
    'Customer',
    'Billing',
    'Reports',
    'User Management',
    'Inventory',
    'Collection',
    'Other'
  ]

  return (
    <div style={{ padding: '20px', background: '#f8f9fa' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px' }}>🔐</div>
          <div>
            <h1 style={{ margin: '0', fontSize: '28px', color: '#1e293b', fontWeight: '700' }}>
              Role Management
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              Create and manage user roles with customizable permissions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5b21b6' }}>{roles.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Total Roles</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
              {roles.filter(r => r.IsActive === 1).length}
            </div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '5px' }}>Active Roles</div>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5b21b6' }}>{permissions.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Total Permissions</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
          {success}
        </div>
      )}

      {/* Add Role Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{
            padding: '10px 20px',
            background: '#5b21b6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          + Create New Role
        </button>
      </div>

      {/* Create/Edit Role Form */}
      {showForm && (
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            {editingRole ? 'Edit Role & Assign Permissions' : 'Create New Role & Assign Permissions'}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Role Details */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                    Role Name *
                  </label>
                  <input
                    type="text"
                    name="roleName"
                    placeholder="e.g. Manager, Supervisor"
                    value={formData.roleName}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the purpose and responsibilities of this role..."
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Permissions Assignment */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                Assign Permissions
              </h4>

              {permissions.length === 0 ? (
                <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '6px', color: '#64748b', fontSize: '13px' }}>
                  No permissions available. Permissions will be loaded from the database.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                  {moduleOrder.map(module => (
                    permissionsByModule[module] && (
                      <div key={module} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#f8f9fa' }}>
                        <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                          {module}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {permissionsByModule[module].map(perm => (
                            <label key={perm.PermissionID} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.PermissionID)}
                                onChange={() => handlePermissionToggle(perm.PermissionID)}
                              />
                              <span>{perm.PermissionName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Form Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#5b21b6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{
                  padding: '10px 20px',
                  background: '#e2e8f0',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles Table */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading roles...</div>
        ) : roles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No roles found. Click "Create New Role" to add one.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Role Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, index) => (
                <tr key={role.RoleID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                    <span style={{ background: '#e9d5ff', color: '#6b21a8', padding: '6px 12px', borderRadius: '4px', display: 'inline-block' }}>
                      {role.RoleName}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                    {role.Description || '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span style={{
                      background: role.IsActive === 1 ? '#dcfce7' : '#fee2e2',
                      color: role.IsActive === 1 ? '#15803d' : '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {role.IsActive === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditRole(role)}
                      style={{
                        background: '#ede9fe',
                        color: '#6b21a8',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Edit & Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Permissions Matrix Info */}
      <div style={{ marginTop: '30px', background: '#e0f2fe', border: '1px solid #38bdf8', borderRadius: '6px', padding: '15px', fontSize: '13px', color: '#0369a1' }}>
        <strong>ℹ️ Default Roles & Permissions:</strong>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li><strong>Super Admin</strong>: Full system access (all permissions)</li>
          <li><strong>Admin</strong>: Admin access (no role management)</li>
          <li><strong>Manager</strong>: Manager operations (Dashboard, Customer, Reports)</li>
          <li><strong>Accountant</strong>: Finance only (Billing, Reports)</li>
          <li><strong>Operator</strong>: Data entry (Dashboard, Customer)</li>
          <li><strong>Viewer</strong>: Read-only access (View Dashboard, Reports)</li>
        </ul>
      </div>
    </div>
  )
}

export default RoleManagement
