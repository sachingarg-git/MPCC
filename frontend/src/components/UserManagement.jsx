import { useState, useEffect } from 'react'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    username: '',
    password: '',
    designation: '',
    roleId: '',
    isActive: true,
    isEmailEnabled: true
  })

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError('Error fetching users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/roles')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
    } catch (err) {
      setError('Error fetching roles: ' + err.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.roleId) {
      setError('Please fill all required fields')
      return
    }

    try {
      // Auto-generate username from email if not provided
      const username = formData.username || formData.email.split('@')[0];
      const submitData = { ...formData, username };

      const method = editingUser ? 'PUT' : 'POST'
      const url = editingUser
        ? `http://localhost:8080/api/users/${editingUser.UserID}`
        : 'http://localhost:8080/api/users'

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save user')
      }

      setSuccess(editingUser ? 'User updated successfully' : 'User created successfully')
      resetForm()
      fetchUsers()
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobileNo: '',
      username: '',
      password: '',
      designation: '',
      roleId: '',
      isActive: true,
      isEmailEnabled: true
    })
    setEditingUser(null)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      mobileNo: user.MobileNo || '',
      username: user.Username,
      password: '',
      designation: user.Designation || '',
      roleId: user.RoleID,
      isActive: user.IsActive === 1 || user.IsActive === true,
      isEmailEnabled: user.IsEmailEnabled === 1 || user.IsEmailEnabled === true
    })
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete user')
        setSuccess('User deleted successfully')
        fetchUsers()
      } catch (err) {
        setError('Error deleting user: ' + err.message)
      }
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const searchMatch =
      user.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Username.toLowerCase().includes(searchTerm.toLowerCase())

    const roleMatch = filterRole ? user.RoleID === parseInt(filterRole) : true
    const isActive = user.IsActive === 1 || user.IsActive === true
    const statusMatch = filterStatus ?
      (filterStatus === 'active' ? isActive : !isActive) :
      true

    return searchMatch && roleMatch && statusMatch
  })

  const activeCount = users.filter(u => u.IsActive === 1 || u.IsActive === true).length
  const inactiveCount = users.filter(u => u.IsActive === 0 || u.IsActive === false).length

  return (
    <div style={{ padding: '20px', background: '#f8f9fa' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px' }}>👥</div>
          <div>
            <h1 style={{ margin: '0', fontSize: '28px', color: '#1e293b', fontWeight: '700' }}>
              User Management
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
              Manage system users, access levels, sessions and security settings.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5b21b6' }}>{users.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Total Users</div>
          </div>
          <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>{activeCount}</div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '5px' }}>Active</div>
          </div>
          <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{inactiveCount}</div>
            <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '5px' }}>Inactive</div>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5b21b6' }}>{roles.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Total Roles</div>
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

      {/* Filter and Add Button */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, email or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role.RoleID} value={role.RoleID}>
              {role.RoleName}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '13px'
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
          + Add User
        </button>
      </div>

      {/* Add/Edit User Form */}
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
            {editingUser ? 'Edit User' : 'Add New User'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                value={formData.lastName}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <input
                type="tel"
                name="mobileNo"
                placeholder="Mobile No"
                value={formData.mobileNo}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
              />
              <input
                type={editingUser ? 'password' : 'password'}
                name="password"
                placeholder={editingUser ? 'Leave blank to keep password' : 'Password *'}
                value={formData.password}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                required={!editingUser}
              />
              {/* Username is auto-generated from email - hidden for now */}
              <input
                type="text"
                name="username"
                value={formData.email.split('@')[0] || formData.username}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <input
                type="text"
                name="designation"
                placeholder="Designation"
                value={formData.designation}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
              />
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}
                required
              >
                <option value="">Select Role *</option>
                {roles.map(role => (
                  <option key={role.RoleID} value={role.RoleID}>
                    {role.RoleName}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    name="isEmailEnabled"
                    checked={formData.isEmailEnabled}
                    onChange={handleInputChange}
                  />
                  Email
                </label>
              </div>
            </div>

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
                {editingUser ? 'Update User' : 'Create User'}
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

      {/* Users Table */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No users found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Mobile</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Designation</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.UserID} style={{ borderBottom: '1px solid #e2e8f0', '&:hover': { background: '#f8f9fa' } }}>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{index + 1}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>
                    {user.FirstName} {user.LastName}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{user.Email}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{user.MobileNo || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>
                    <span style={{ background: '#e9d5ff', color: '#6b21a8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {user.RoleName}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#1e293b' }}>{user.Designation || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span style={{
                      background: (user.IsActive === 1 || user.IsActive === true) ? '#dcfce7' : '#fee2e2',
                      color: (user.IsActive === 1 || user.IsActive === true) ? '#15803d' : '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {(user.IsActive === 1 || user.IsActive === true) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        background: '#ede9fe',
                        color: '#6b21a8',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '5px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.UserID)}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default UserManagement
