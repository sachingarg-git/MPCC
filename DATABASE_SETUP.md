# MPCC Database Setup Guide

## Users Table Schema

The authentication system requires a `Users` table in your MSSQL database. Use the following SQL script to create it:

```sql
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    UserName VARCHAR(100) NOT NULL,
    Role VARCHAR(50) DEFAULT 'admin',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
```

## Adding Test Users

After creating the table, insert test users for authentication. Password hashing is recommended for production:

### Option 1: Plain Text Passwords (For Testing Only)

```sql
INSERT INTO Users (Email, Password, UserName, Role, IsActive)
VALUES 
    ('admin@mpccharidwar.in', 'password123', 'admin', 'admin', 1),
    ('manager@mpccharidwar.in', 'manager@123', 'manager', 'manager', 1),
    ('user@mpccharidwar.in', 'user@123', 'user', 'user', 1);
```

### Option 2: Using bcrypt Hashing (Recommended for Production)

You can hash passwords using bcrypt before inserting. Here's a Node.js script to generate hashes:

```javascript
const bcrypt = require('bcrypt');

// Generate hash for "password123"
bcrypt.hash('password123', 10).then(hash => {
  console.log('Hashed password:', hash);
  // Use this hash in INSERT statement
});
```

Example with hashed password:

```sql
INSERT INTO Users (Email, Password, UserName, Role, IsActive)
VALUES 
    ('admin@mpccharidwar.in', '$2b$10$...', 'admin', 'admin', 1);
```

## Login Credentials for Testing

After inserting the test users above, you can login using:

- **Email:** admin@mpccharidwar.in
- **Password:** password123

## Backend Authentication Endpoint

The login API endpoint is: `POST /api/auth/login`

Request body:
```json
{
  "email": "admin@mpccharidwar.in",
  "password": "password123"
}
```

Success response (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "userId": 1,
    "email": "admin@mpccharidwar.in",
    "username": "admin",
    "role": "admin"
  }
}
```

Error response (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

This will install bcrypt and other dependencies.

### 2. Database Setup

Run the SQL script above to create the Users table and insert test users.

### 3. Environment Variables

Ensure your `.env` file in the backend folder contains:

```
PORT=5060
DB_HOST=your-database-host
DB_PORT=1433
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_ENCRYPT=false
NODE_ENV=development
```

### 4. Start the Backend

```bash
npm start
```

### 5. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5065` and login with your credentials.

## Security Notes

1. **Password Hashing:** The backend supports both bcrypt hashed and plain text passwords for backwards compatibility. Always use bcrypt for production.

2. **Password Validation:** The backend automatically tries bcrypt comparison first, then falls back to plain text comparison if hashing fails.

3. **Environment Variables:** Never commit `.env` files with database credentials. Keep them in `.gitignore`.

4. **HTTPS:** Use HTTPS in production to protect credentials in transit.

5. **Session Management:** Currently, user info is stored in localStorage. Consider implementing:
   - JWT tokens for stateless authentication
   - Session tokens for server-side session management
   - Token expiration and refresh mechanisms

## Troubleshooting

### "Database not ready" error

- Ensure database is running and accessible
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in `.env`
- Verify Users table exists in the database

### "Invalid email or password" error

- Double-check email and password in Users table
- Ensure email addresses are exactly matching (case-sensitive)
- Verify the user's IsActive column is set to 1

### "Network error" on frontend

- Ensure backend is running on port 5060
- Check CORS is enabled (it is in server.js)
- Verify Vite proxy is configured correctly (see vite.config.js)

## Next Steps

After successful login setup, consider implementing:

1. **User Roles & Permissions:** Different access levels for admin, manager, and user roles
2. **JWT Tokens:** For secure, stateless authentication
3. **Password Reset:** Functionality for users to reset forgotten passwords
4. **Logout:** Clear localStorage and reset auth state
5. **Auto-logout:** Session timeout after inactivity
6. **Two-Factor Authentication:** Additional security layer for admin accounts
