# User Management Module - Complete Setup Guide

## Overview
The User Management module has been fully implemented with:
- Role-based access control (RBAC)
- User CRUD operations (Create, Read, Update, Delete)
- Dynamic role assignment with permissions
- Professional table view with search and filtering
- Role-wise permissions matrix

## Database Schema

### Tables Created
1. **Roles** - Stores all user roles
2. **Permissions** - Stores all system permissions
3. **RolePermissions** - Maps roles to permissions
4. **Users** - Enhanced user table with all required fields

### User Table Fields
```sql
- UserID (INT) - Primary Key
- FirstName (VARCHAR) - User first name
- LastName (VARCHAR) - User last name
- Email (VARCHAR) - Unique email address
- MobileNo (VARCHAR) - Contact number
- Username (VARCHAR) - Unique username
- Password (VARCHAR) - Encrypted password
- Designation (VARCHAR) - Job title
- RoleID (INT) - Foreign key to Roles table
- IsActive (BIT) - Enable/Disable flag
- IsEmailEnabled (BIT) - Email notification flag
- CreatedAt (DATETIME) - Creation timestamp
- UpdatedAt (DATETIME) - Last update timestamp
- CreatedBy (INT) - User who created record
- UpdatedBy (INT) - User who last updated record
```

### Default Roles Included
1. **Super Admin** - Full system access
2. **Admin** - Administrative access (no role management)
3. **Manager** - Manager level operations
4. **Accountant** - Finance & billing only
5. **Operator** - Data entry & operations
6. **Viewer** - Read-only access

## Setup Instructions

### Step 1: Run Database Schema Script
Execute the SQL script to create all tables:

```bash
# Run in SQL Server Management Studio:
# Open file: DATABASE_USER_MANAGEMENT.sql
# Execute all queries
```

This will create:
- Roles table with 6 default roles
- Permissions table with 14 permissions
- RolePermissions mapping
- Enhanced Users table

### Step 2: Verify Database Creation
Check if tables were created successfully:

```sql
SELECT COUNT(*) FROM Roles;
SELECT COUNT(*) FROM Permissions;
SELECT COUNT(*) FROM Users;
```

Expected results:
- Roles: 6
- Permissions: 14
- Users: 1 (admin user)

### Step 3: Backend API Endpoints

The following endpoints are now available:

#### Get All Roles
```
GET /api/roles
Response: Array of roles with IDs, names, descriptions
```

#### Get All Users
```
GET /api/users
Response: Array of users with role information
```

#### Get Single User
```
GET /api/users/:userId
Response: Single user object
```

#### Create User
```
POST /api/users
Headers: Content-Type: application/json
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobileNo": "9876543210",
  "username": "johndoe",
  "password": "securepassword",
  "designation": "Manager",
  "roleId": 3,
  "isActive": true,
  "isEmailEnabled": true
}
Response: { "message": "User created successfully", "userId": 2, ... }
```

#### Update User
```
PUT /api/users/:userId
Headers: Content-Type: application/json
Body: Same as Create (excluding userId)
Response: { "message": "User updated successfully" }
```

#### Delete User (Soft Delete)
```
DELETE /api/users/:userId
Response: { "message": "User deleted successfully" }
```

#### Get Role Permissions
```
GET /api/roles/:roleId/permissions
Response: Array of permissions for the role
```

### Step 4: Frontend Integration

#### User Management Component Features

**Add User Form**
- First Name (required)
- Last Name (required)
- Email (required, unique)
- Mobile No
- Username (required, unique)
- Password (required)
- Designation
- Role Dropdown (required)
- Active/Inactive toggle
- Email notifications toggle

**User Table Display**
- User count (total, active, inactive, total roles)
- Search by name, email, or username
- Filter by role
- Filter by status
- Edit/Delete actions
- Status badges (Active/Inactive)
- Role badges

**Design Features**
- Professional dark theme integration
- Responsive grid layout
- Color-coded status indicators
- Smooth transitions
- Modal forms for add/edit

## User Management Flow

### Adding a New User
1. Click "User Mgmt" in sidebar
2. Click "+ Add User" button
3. Fill in required fields
4. Select role from dropdown
5. Set Active/Email flags
6. Click "Create User"
7. User appears in table

### Editing a User
1. Click "Edit" button on user row
2. Form fills with current data
3. Modify fields as needed
4. Click "Update User"
5. Changes reflected in table

### Deleting a User
1. Click "Delete" button on user row
2. Confirm deletion
3. User marked as inactive (soft delete)
4. User still visible but marked as Inactive

### Filtering and Searching
1. Use search box for name/email/username
2. Use role dropdown to filter by role
3. Use status dropdown to show active/inactive
4. Combinations of filters work together

## Default Test User

After running the database script:
- **Email**: admin@mpccharidwar.in
- **Username**: admin
- **Password**: password123
- **Role**: Super Admin
- **Status**: Active

## Password Management

### Plain Text (Current Testing)
Passwords are stored in plain text for easy testing:
```
Direct string comparison in database
No hashing applied
```

### Production Implementation (Recommended)
For production, passwords should be hashed:
```
Use bcrypt hashing before storage
Compare hashed passwords with bcrypt.compare()
Update backend login endpoint to hash passwords
```

### Implementing Password Hashing
1. Update user creation endpoint:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
// Store hashedPassword in database
```

2. Update user authentication:
```javascript
const passwordMatch = await bcrypt.compare(inputPassword, storedHashedPassword);
```

## Role-Based Permissions

### Super Admin
- All permissions
- Full system access
- User and role management
- All module access

### Admin
- All permissions except role management
- Create/update/delete users
- Access to most modules
- Cannot modify role permissions

### Manager
- Dashboard, Customer, Collection, Inventory, Reports
- View and operational access
- No user or system management

### Accountant
- Billing, Finance modules
- Reports and dashboards
- View-only on other modules

### Operator
- Dashboard access
- Customer management
- Data entry operations
- Limited reporting

### Viewer
- Read-only access
- View dashboards
- View reports
- No edit/delete permissions

## Navigation Design Updates

The navigation has been integrated with:
- Professional color scheme
- Role-based icons
- Clear visual hierarchy
- Collapsible submenus
- Active state indicators

## API Response Examples

### Success Response
```json
{
  "message": "User created successfully",
  "userId": 2,
  "user": {
    "userID": 2,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "roleId": 3
  }
}
```

### Error Response
```json
{
  "error": "Email or Username already exists"
}
```

## Security Recommendations

1. **Password Hashing**: Implement bcrypt hashing
2. **JWT Tokens**: Add JWT for session management
3. **Rate Limiting**: Limit login attempts
4. **Audit Logs**: Log all user actions
5. **Two-Factor Auth**: Add 2FA for enhanced security
6. **HTTPS Only**: Force HTTPS in production
7. **Database Encryption**: Encrypt sensitive data

## Future Enhancements

1. **Email Notifications**: Send welcome emails to new users
2. **Password Reset**: Implement forgot password flow
3. **Session Management**: Add session timeout and refresh
4. **Audit Trail**: Log all user management actions
5. **User Profiles**: Extended user profile information
6. **Department Assignment**: Organize users by departments
7. **Batch Import**: Import users from CSV/Excel
8. **Activity Logs**: Track user activities

## Testing Checklist

- [ ] Create new user with all roles
- [ ] Edit existing user details
- [ ] Delete user (soft delete)
- [ ] Search users by name/email/username
- [ ] Filter by role and status
- [ ] Verify role dropdown shows all roles
- [ ] Test form validation (required fields)
- [ ] Test unique email/username constraints
- [ ] Verify status badges display correctly
- [ ] Test active/email toggles
- [ ] Verify permissions load for roles

## Troubleshooting

### Users table not showing data
- Check database connection in backend
- Verify backend is running on port 5001
- Check browser console for API errors

### Cannot create user
- Verify all required fields are filled
- Check for unique email/username violations
- Check backend logs for specific errors

### Permissions not loading
- Verify RolePermissions table is populated
- Check roleId exists in Roles table
- Verify backend API response

## Files Modified/Created

### New Files
- `/components/UserManagement.jsx` - Complete user management component
- `/DATABASE_USER_MANAGEMENT.sql` - Database schema script
- `/USER_MANAGEMENT_SETUP.md` - This documentation

### Modified Files
- `/backend/server.js` - Added user management API endpoints
- `/pages/AdminPanel.jsx` - Integrated UserManagement component

### Database
- Users table (enhanced schema)
- Roles table (with 6 default roles)
- Permissions table (with 14 permissions)
- RolePermissions table (mapping)

## Deployment Checklist

Before deploying to production:

- [ ] Run DATABASE_USER_MANAGEMENT.sql
- [ ] Update passwords to use bcrypt hashing
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up audit logging
- [ ] Configure email notifications
- [ ] Test all role permissions
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Document all roles and permissions
- [ ] Train administrators on user management

## Support & Questions

For issues or questions about user management:
1. Check the troubleshooting section
2. Review API response format
3. Verify database schema is correct
4. Check backend and frontend logs
5. Verify all endpoints are accessible

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2026-05-19
**Version**: 1.0
