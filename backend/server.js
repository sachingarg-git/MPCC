const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5060;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database configuration
const sqlConfig = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  encrypt: false,
  trustServerCertificate: true,
  connectionTimeout: 15000,
  requestTimeout: 15000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

// Initialize database connection pool
async function initializePool() {
  try {
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log('✓ Database connected successfully');
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    setTimeout(initializePool, 5000);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const { email, username, password } = req.body;
    const credential = email || username;
    const credentialType = email ? 'email' : 'username';

    console.log('Login attempt:', { credential, credentialType, passwordLength: password?.length });

    if (!credential || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    // Query Users table - try to find by email or username
    const result = await pool
      .request()
      .input('credential', sql.VarChar, credential)
      .query(`SELECT UserID, Email, Password, Username, RoleID FROM Users WHERE Email = @credential OR Username = @credential`);

    console.log('Query result rows:', result.recordset.length);

    if (result.recordset.length === 0) {
      console.log('User not found with', credentialType + ':', credential);
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const user = result.recordset[0];
    console.log('User found:', { userId: user.UserID, email: user.Email, storedPassword: user.Password });

    // Compare password - check if password is hashed or plain text
    let passwordMatch = false;
    const storedPassword = user.Password.trim();

    // Check if password is bcrypt hashed (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

    if (isBcryptHash) {
      // Password is hashed, use bcrypt comparison
      try {
        console.log('Using bcrypt comparison for hashed password...');
        passwordMatch = await bcrypt.compare(password, storedPassword);
        console.log('Bcrypt match result:', passwordMatch);
      } catch (e) {
        console.error('Bcrypt comparison error:', e.message);
        passwordMatch = false;
      }
    } else {
      // Password is plain text, do direct comparison
      console.log('Using plain text comparison...');
      console.log('Input password length:', password.length, 'value:', JSON.stringify(password));
      console.log('Stored password length:', storedPassword.length, 'value:', JSON.stringify(storedPassword));
      console.log('Character by character comparison:');
      for (let i = 0; i < Math.max(password.length, storedPassword.length); i++) {
        const inputChar = password[i];
        const storedChar = storedPassword[i];
        console.log(`  [${i}] input: '${inputChar}' (${inputChar ? inputChar.charCodeAt(0) : 'undefined'}) vs stored: '${storedChar}' (${storedChar ? storedChar.charCodeAt(0) : 'undefined'})`);
      }
      passwordMatch = password === storedPassword;
      console.log('Plain text match result:', passwordMatch);
    }

    if (!passwordMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);
    // Return user info without password
    res.json({
      message: 'Login successful',
      user: {
        userId: user.UserID,
        email: user.Email,
        username: user.Username,
        roleId: user.RoleID
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customers (landing page registrations)
app.get('/api/customers', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }
    const result = await pool
      .request()
      .query('SELECT TOP 100 * FROM Customers ORDER BY CreatedAt DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create customer (from landing page registration)
app.post('/api/customers', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const {
      custId,
      instName,
      mobile,
      email,
      zone,
      route,
      category,
      subCategory,
      planCode,
      beds,
      kit,
      consulting,
      compliance,
      totalAmount,
      txnId,
    } = req.body;

    const result = await pool
      .request()
      .input('custId', sql.VarChar, custId)
      .input('instName', sql.VarChar, instName)
      .input('mobile', sql.VarChar, mobile)
      .input('email', sql.VarChar, email)
      .input('zone', sql.VarChar, zone)
      .input('route', sql.VarChar, route)
      .input('category', sql.VarChar, category)
      .input('subCategory', sql.VarChar, subCategory)
      .input('planCode', sql.VarChar, planCode)
      .input('beds', sql.Int, beds || 0)
      .input('kit', sql.Bit, kit ? 1 : 0)
      .input('consulting', sql.Bit, consulting ? 1 : 0)
      .input('compliance', sql.Bit, compliance ? 1 : 0)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount)
      .input('txnId', sql.VarChar, txnId)
      .query(`
        INSERT INTO Customers
        (CustID, InstName, Mobile, Email, Zone, Route, Category, SubCategory,
         PlanCode, Beds, Kit, Consulting, Compliance, TotalAmount, TxnID, Status, CreatedAt)
        VALUES
        (@custId, @instName, @mobile, @email, @zone, @route, @category, @subCategory,
         @planCode, @beds, @kit, @consulting, @compliance, @totalAmount, @txnId, 'Active', GETDATE())
      `);

    res.status(201).json({
      message: 'Customer registered successfully',
      custId,
      data: result,
    });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get rate chart (MPCC pricing)
app.get('/api/rate-chart', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }
    const result = await pool
      .request()
      .query('SELECT * FROM MPCCRateChart ORDER BY Code');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }
    const result = await pool
      .request()
      .query('SELECT * FROM Categories ORDER BY SortOrder');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get sub-categories by category
app.get('/api/subcategories/:categoryId', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }
    const result = await pool
      .request()
      .input('categoryId', sql.VarChar, req.params.categoryId)
      .query('SELECT * FROM SubCategories WHERE CategoryID = @categoryId ORDER BY Name');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====
console.log('Registering user management endpoints...');

// Get all roles
console.log('Registering GET /api/roles');
app.get('/api/roles', async (req, res) => {
  console.log('GET /api/roles handler called!');
  try {
    if (!pool) {
      console.log('Pool not ready');
      return res.status(503).json({ error: 'Database not ready' });
    }
    console.log('Querying roles from database...');
    const result = await pool
      .request()
      .query('SELECT RoleID, RoleName, Description, IsActive FROM Roles WHERE IsActive = 1 ORDER BY RoleName');
    console.log('Roles query result:', result.recordset.length, 'rows');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all users with role information
app.get('/api/users', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }
    const result = await pool
      .request()
      .query(`
        SELECT
          u.UserID,
          u.FirstName,
          u.LastName,
          u.Email,
          u.MobileNo,
          u.Username,
          u.Designation,
          u.IsActive,
          u.IsEmailEnabled,
          u.CreatedAt,
          r.RoleName,
          r.RoleID
        FROM Users u
        LEFT JOIN Roles r ON u.RoleID = r.RoleID
        ORDER BY u.CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }
    const result = await pool
      .request()
      .input('userId', sql.Int, req.params.userId)
      .query(`
        SELECT
          u.UserID,
          u.FirstName,
          u.LastName,
          u.Email,
          u.MobileNo,
          u.Username,
          u.Designation,
          u.IsActive,
          u.IsEmailEnabled,
          u.RoleID,
          r.RoleName
        FROM Users u
        LEFT JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const {
      firstName,
      lastName,
      email,
      mobileNo,
      username,
      password,
      designation,
      roleId,
      isActive,
      isEmailEnabled
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password || !roleId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool
      .request()
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('email', sql.VarChar, email)
      .input('mobileNo', sql.VarChar, mobileNo || null)
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .input('designation', sql.VarChar, designation || null)
      .input('roleId', sql.Int, roleId)
      .input('isActive', sql.Bit, isActive !== false ? 1 : 0)
      .input('isEmailEnabled', sql.Bit, isEmailEnabled !== false ? 1 : 0)
      .query(`
        INSERT INTO Users (FirstName, LastName, Email, MobileNo, Username, Password, Designation, RoleID, IsActive, IsEmailEnabled, CreatedAt)
        VALUES (@firstName, @lastName, @email, @mobileNo, @username, @password, @designation, @roleId, @isActive, @isEmailEnabled, GETDATE())
        SELECT @@IDENTITY as UserID
      `);

    const userId = result.recordset[0].UserID;

    res.status(201).json({
      message: 'User created successfully',
      userId: userId,
      user: {
        userID: userId,
        firstName,
        lastName,
        email,
        username,
        roleId
      }
    });
  } catch (err) {
    console.error('Insert error:', err);
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email or Username already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const {
      firstName,
      lastName,
      email,
      mobileNo,
      designation,
      roleId,
      isActive,
      isEmailEnabled
    } = req.body;

    const result = await pool
      .request()
      .input('userId', sql.Int, req.params.userId)
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('email', sql.VarChar, email)
      .input('mobileNo', sql.VarChar, mobileNo || null)
      .input('designation', sql.VarChar, designation || null)
      .input('roleId', sql.Int, roleId)
      .input('isActive', sql.Bit, isActive !== false ? 1 : 0)
      .input('isEmailEnabled', sql.Bit, isEmailEnabled !== false ? 1 : 0)
      .query(`
        UPDATE Users SET
          FirstName = @firstName,
          LastName = @lastName,
          Email = @email,
          MobileNo = @mobileNo,
          Designation = @designation,
          RoleID = @roleId,
          IsActive = @isActive,
          IsEmailEnabled = @isEmailEnabled,
          UpdatedAt = GETDATE()
        WHERE UserID = @userId
      `);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (soft delete - set IsActive to 0)
app.delete('/api/users/:userId', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const result = await pool
      .request()
      .input('userId', sql.Int, req.params.userId)
      .query('UPDATE Users SET IsActive = 0, UpdatedAt = GETDATE() WHERE UserID = @userId');

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get role permissions
app.get('/api/roles/:roleId/permissions', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const result = await pool
      .request()
      .input('roleId', sql.Int, req.params.roleId)
      .query(`
        SELECT DISTINCT
          p.PermissionID,
          p.PermissionName,
          p.Module,
          p.SubModule,
          p.Description
        FROM Permissions p
        INNER JOIN RolePermissions rp ON p.PermissionID = rp.PermissionID
        WHERE rp.RoleID = @roleId
        ORDER BY p.Module, p.SubModule, p.PermissionName
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== MASTER DATA ENDPOINTS =====

// ===== ROUTES ENDPOINTS =====
app.get('/api/routes', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM Routes WHERE IsActive = 1 ORDER BY RouteName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/routes', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { routeCode, routeName, routeType, primaryDriver, secondaryDriver } = req.body;
    if (!routeCode || !routeName || !routeType) {
      return res.status(400).json({ error: 'Route Code, Name, and Type are required' });
    }
    const result = await pool.request()
      .input('routeCode', sql.VarChar, routeCode)
      .input('routeName', sql.VarChar, routeName)
      .input('routeType', sql.VarChar, routeType)
      .input('primaryDriver', sql.VarChar, primaryDriver || null)
      .input('secondaryDriver', sql.VarChar, secondaryDriver || null)
      .query(`INSERT INTO Routes (RouteCode, RouteName, RouteType, PrimaryDriver, SecondaryDriver, IsActive)
              VALUES (@routeCode, @routeName, @routeType, @primaryDriver, @secondaryDriver, 1);
              SELECT SCOPE_IDENTITY() as RouteID`);
    res.status(201).json({ message: 'Route created', routeId: result.recordset[0].RouteID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/routes/:routeId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { routeCode, routeName, routeType, primaryDriver, secondaryDriver } = req.body;
    await pool.request()
      .input('routeId', sql.Int, req.params.routeId)
      .input('routeCode', sql.VarChar, routeCode)
      .input('routeName', sql.VarChar, routeName)
      .input('routeType', sql.VarChar, routeType)
      .input('primaryDriver', sql.VarChar, primaryDriver || null)
      .input('secondaryDriver', sql.VarChar, secondaryDriver || null)
      .query(`UPDATE Routes SET RouteCode=@routeCode, RouteName=@routeName, RouteType=@routeType,
              PrimaryDriver=@primaryDriver, SecondaryDriver=@secondaryDriver, UpdatedAt=GETDATE()
              WHERE RouteID=@routeId`);
    res.json({ message: 'Route updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/routes/:routeId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('routeId', sql.Int, req.params.routeId)
      .query('UPDATE Routes SET IsActive=0, UpdatedAt=GETDATE() WHERE RouteID=@routeId');
    res.json({ message: 'Route deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== SERVICE PLANS ENDPOINTS =====
app.get('/api/serviceplans', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM ServicePlans WHERE IsActive = 1 ORDER BY PlanName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/serviceplans', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { planCode, name, category, subCategory, zone, route, description, pricingType, monthlyCharges, registrationCharges, consultingFees, isActive } = req.body;
    if (!planCode || !name || !category) {
      return res.status(400).json({ error: 'Plan Code, Name, and Category are required' });
    }
    const result = await pool.request()
      .input('planCode', sql.VarChar, planCode)
      .input('planName', sql.VarChar, name)
      .input('category', sql.VarChar, category)
      .input('subCategory', sql.VarChar, subCategory || null)
      .input('zone', sql.VarChar, zone || null)
      .input('route', sql.VarChar, route || null)
      .input('description', sql.Text, description || null)
      .input('pricingType', sql.VarChar, pricingType || 'fixed')
      .input('monthlyCharges', sql.Decimal(10,2), monthlyCharges || 0)
      .input('registrationCharges', sql.Decimal(10,2), registrationCharges || 0)
      .input('consultingFees', sql.Decimal(10,2), consultingFees || 0)
      .input('isActive', sql.Bit, isActive ? 1 : 0)
      .query(`INSERT INTO ServicePlans (PlanCode, PlanName, Category, SubCategory, Zone, Route, Description, PricingType, MonthlyCharges, RegistrationCharges, ConsultingFees, IsActive)
              VALUES (@planCode, @planName, @category, @subCategory, @zone, @route, @description, @pricingType, @monthlyCharges, @registrationCharges, @consultingFees, @isActive);
              SELECT SCOPE_IDENTITY() as PlanID`);
    res.status(201).json({ message: 'Service Plan created', planId: result.recordset[0].PlanID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/serviceplans/:planId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { planCode, name, category, subCategory, zone, route, description, pricingType, monthlyCharges, registrationCharges, consultingFees, isActive } = req.body;
    await pool.request()
      .input('planId', sql.Int, req.params.planId)
      .input('planCode', sql.VarChar, planCode)
      .input('planName', sql.VarChar, name)
      .input('category', sql.VarChar, category)
      .input('subCategory', sql.VarChar, subCategory || null)
      .input('zone', sql.VarChar, zone || null)
      .input('route', sql.VarChar, route || null)
      .input('description', sql.Text, description || null)
      .input('pricingType', sql.VarChar, pricingType || 'fixed')
      .input('monthlyCharges', sql.Decimal(10,2), monthlyCharges || 0)
      .input('registrationCharges', sql.Decimal(10,2), registrationCharges || 0)
      .input('consultingFees', sql.Decimal(10,2), consultingFees || 0)
      .input('isActive', sql.Bit, isActive ? 1 : 0)
      .query(`UPDATE ServicePlans SET PlanCode=@planCode, PlanName=@planName, Category=@category, SubCategory=@subCategory,
              Zone=@zone, Route=@route, Description=@description, PricingType=@pricingType, MonthlyCharges=@monthlyCharges,
              RegistrationCharges=@registrationCharges, ConsultingFees=@consultingFees, IsActive=@isActive, UpdatedAt=GETDATE()
              WHERE PlanID=@planId`);
    res.json({ message: 'Service Plan updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/serviceplans/:planId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('planId', sql.Int, req.params.planId)
      .query('UPDATE ServicePlans SET IsActive=0, UpdatedAt=GETDATE() WHERE PlanID=@planId');
    res.json({ message: 'Service Plan deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== PAYMENT FREQUENCY ENDPOINTS =====
app.get('/api/paymentfreqs', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM PaymentFrequency WHERE IsActive = 1 ORDER BY FrequencyName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/paymentfreqs', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { frequencyCode, frequencyName, months, discountAmt, discountPct, description } = req.body;
    if (!frequencyCode || !frequencyName || !months) {
      return res.status(400).json({ error: 'Frequency Code, Name, and Months are required' });
    }
    const result = await pool.request()
      .input('frequencyCode', sql.VarChar, frequencyCode)
      .input('frequencyName', sql.VarChar, frequencyName)
      .input('months', sql.Int, months)
      .input('discountAmt', sql.Decimal(10,2), discountAmt || 0)
      .input('discountPct', sql.Decimal(5,2), discountPct || 0)
      .input('description', sql.Text, description || null)
      .query(`INSERT INTO PaymentFrequency (FrequencyCode, FrequencyName, Months, DiscountAmount, DiscountPercentage, Description, IsActive)
              VALUES (@frequencyCode, @frequencyName, @months, @discountAmt, @discountPct, @description, 1);
              SELECT SCOPE_IDENTITY() as FrequencyID`);
    res.status(201).json({ message: 'Payment Frequency created', frequencyId: result.recordset[0].FrequencyID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/paymentfreqs/:freqId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { frequencyCode, frequencyName, months, discountAmt, discountPct, description } = req.body;
    await pool.request()
      .input('freqId', sql.Int, req.params.freqId)
      .input('frequencyCode', sql.VarChar, frequencyCode)
      .input('frequencyName', sql.VarChar, frequencyName)
      .input('months', sql.Int, months)
      .input('discountAmt', sql.Decimal(10,2), discountAmt || 0)
      .input('discountPct', sql.Decimal(5,2), discountPct || 0)
      .input('description', sql.Text, description || null)
      .query(`UPDATE PaymentFrequency SET FrequencyCode=@frequencyCode, FrequencyName=@frequencyName, Months=@months,
              DiscountAmount=@discountAmt, DiscountPercentage=@discountPct, Description=@description, UpdatedAt=GETDATE()
              WHERE FrequencyID=@freqId`);
    res.json({ message: 'Payment Frequency updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/paymentfreqs/:freqId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('freqId', sql.Int, req.params.freqId)
      .query('UPDATE PaymentFrequency SET IsActive=0, UpdatedAt=GETDATE() WHERE FrequencyID=@freqId');
    res.json({ message: 'Payment Frequency deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== KIT MASTER ENDPOINTS =====
app.get('/api/kits', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM KitMaster WHERE IsActive = 1 ORDER BY KitName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kits', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { kitCode, name, type, description, items } = req.body;
    if (!kitCode || !name) {
      return res.status(400).json({ error: 'Kit Code and Name are required' });
    }
    const result = await pool.request()
      .input('kitCode', sql.VarChar, kitCode)
      .input('kitName', sql.VarChar, name)
      .input('kitType', sql.VarChar, type || null)
      .input('description', sql.Text, description || null)
      .query(`INSERT INTO KitMaster (KitCode, KitName, KitType, Description, IsActive)
              VALUES (@kitCode, @kitName, @kitType, @description, 1);
              SELECT SCOPE_IDENTITY() as KitID`);
    res.status(201).json({ message: 'Kit created', kitId: result.recordset[0].KitID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/kits/:kitId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { kitCode, name, type, description } = req.body;
    await pool.request()
      .input('kitId', sql.Int, req.params.kitId)
      .input('kitCode', sql.VarChar, kitCode)
      .input('kitName', sql.VarChar, name)
      .input('kitType', sql.VarChar, type || null)
      .input('description', sql.Text, description || null)
      .query(`UPDATE KitMaster SET KitCode=@kitCode, KitName=@kitName, KitType=@kitType,
              Description=@description, UpdatedAt=GETDATE() WHERE KitID=@kitId`);
    res.json({ message: 'Kit updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/kits/:kitId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('kitId', sql.Int, req.params.kitId)
      .query('UPDATE KitMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE KitID=@kitId');
    res.json({ message: 'Kit deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== WASTE CATEGORY ENDPOINTS =====
app.get('/api/wastecategories', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM WasteCategory WHERE IsActive = 1 ORDER BY CategoryName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wastecategories', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { categoryCode, name, bagColor, description } = req.body;
    if (!categoryCode || !name) {
      return res.status(400).json({ error: 'Category Code and Name are required' });
    }
    const result = await pool.request()
      .input('categoryCode', sql.VarChar, categoryCode)
      .input('categoryName', sql.VarChar, name)
      .input('bagColor', sql.VarChar, bagColor || null)
      .input('description', sql.Text, description || null)
      .query(`INSERT INTO WasteCategory (CategoryCode, CategoryName, BagColor, Description, IsActive)
              VALUES (@categoryCode, @categoryName, @bagColor, @description, 1);
              SELECT SCOPE_IDENTITY() as CategoryID`);
    res.status(201).json({ message: 'Waste Category created', categoryId: result.recordset[0].CategoryID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/wastecategories/:categoryId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { categoryCode, name, bagColor, description } = req.body;
    await pool.request()
      .input('categoryId', sql.Int, req.params.categoryId)
      .input('categoryCode', sql.VarChar, categoryCode)
      .input('categoryName', sql.VarChar, name)
      .input('bagColor', sql.VarChar, bagColor || null)
      .input('description', sql.Text, description || null)
      .query(`UPDATE WasteCategory SET CategoryCode=@categoryCode, CategoryName=@categoryName, BagColor=@bagColor,
              Description=@description, UpdatedAt=GETDATE() WHERE CategoryID=@categoryId`);
    res.json({ message: 'Waste Category updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wastecategories/:categoryId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('categoryId', sql.Int, req.params.categoryId)
      .query('UPDATE WasteCategory SET IsActive=0, UpdatedAt=GETDATE() WHERE CategoryID=@categoryId');
    res.json({ message: 'Waste Category deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== VEHICLE MASTER ENDPOINTS =====
app.get('/api/vehicles', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM VehicleMaster WHERE IsActive = 1 ORDER BY VehicleCode');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { vehicleCode, vehicleType, registrationNo, manufacturer, model, purchaseDate, gpsEnabled } = req.body;
    if (!vehicleCode || !registrationNo) {
      return res.status(400).json({ error: 'Vehicle Code and Registration No are required' });
    }
    const result = await pool.request()
      .input('vehicleCode', sql.VarChar, vehicleCode)
      .input('vehicleType', sql.VarChar, vehicleType || null)
      .input('registrationNo', sql.VarChar, registrationNo)
      .input('manufacturer', sql.VarChar, manufacturer || null)
      .input('model', sql.VarChar, model || null)
      .input('purchaseDate', sql.Date, purchaseDate || null)
      .input('gpsEnabled', sql.Bit, gpsEnabled ? 1 : 0)
      .query(`INSERT INTO VehicleMaster (VehicleCode, VehicleType, RegistrationNo, Manufacturer, Model, PurchaseDate, GPSEnabled, IsActive)
              VALUES (@vehicleCode, @vehicleType, @registrationNo, @manufacturer, @model, @purchaseDate, @gpsEnabled, 1);
              SELECT SCOPE_IDENTITY() as VehicleID`);
    res.status(201).json({ message: 'Vehicle created', vehicleId: result.recordset[0].VehicleID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehicles/:vehicleId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { vehicleCode, vehicleType, registrationNo, manufacturer, model, purchaseDate, gpsEnabled } = req.body;
    await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .input('vehicleCode', sql.VarChar, vehicleCode)
      .input('vehicleType', sql.VarChar, vehicleType || null)
      .input('registrationNo', sql.VarChar, registrationNo)
      .input('manufacturer', sql.VarChar, manufacturer || null)
      .input('model', sql.VarChar, model || null)
      .input('purchaseDate', sql.Date, purchaseDate || null)
      .input('gpsEnabled', sql.Bit, gpsEnabled ? 1 : 0)
      .query(`UPDATE VehicleMaster SET VehicleCode=@vehicleCode, VehicleType=@vehicleType, RegistrationNo=@registrationNo,
              Manufacturer=@manufacturer, Model=@model, PurchaseDate=@purchaseDate, GPSEnabled=@gpsEnabled, UpdatedAt=GETDATE()
              WHERE VehicleID=@vehicleId`);
    res.json({ message: 'Vehicle updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:vehicleId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('vehicleId', sql.Int, req.params.vehicleId)
      .query('UPDATE VehicleMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE VehicleID=@vehicleId');
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== VENDOR MASTER ENDPOINTS =====
app.get('/api/vendors', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM VendorMaster WHERE IsActive = 1 ORDER BY VendorName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { vendorCode, type, name, contactPerson, mobile, email, city, state } = req.body;
    if (!vendorCode || !name) {
      return res.status(400).json({ error: 'Vendor Code and Name are required' });
    }
    const result = await pool.request()
      .input('vendorCode', sql.VarChar, vendorCode)
      .input('vendorType', sql.VarChar, type || null)
      .input('vendorName', sql.VarChar, name)
      .input('contactPerson', sql.VarChar, contactPerson || null)
      .input('mobile', sql.VarChar, mobile || null)
      .input('email', sql.VarChar, email || null)
      .input('city', sql.VarChar, city || null)
      .input('state', sql.VarChar, state || null)
      .query(`INSERT INTO VendorMaster (VendorCode, VendorType, VendorName, ContactPerson, Mobile, Email, City, State, IsActive)
              VALUES (@vendorCode, @vendorType, @vendorName, @contactPerson, @mobile, @email, @city, @state, 1);
              SELECT SCOPE_IDENTITY() as VendorID`);
    res.status(201).json({ message: 'Vendor created', vendorId: result.recordset[0].VendorID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vendors/:vendorId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { vendorCode, type, name, contactPerson, mobile, email, city, state } = req.body;
    await pool.request()
      .input('vendorId', sql.Int, req.params.vendorId)
      .input('vendorCode', sql.VarChar, vendorCode)
      .input('vendorType', sql.VarChar, type || null)
      .input('vendorName', sql.VarChar, name)
      .input('contactPerson', sql.VarChar, contactPerson || null)
      .input('mobile', sql.VarChar, mobile || null)
      .input('email', sql.VarChar, email || null)
      .input('city', sql.VarChar, city || null)
      .input('state', sql.VarChar, state || null)
      .query(`UPDATE VendorMaster SET VendorCode=@vendorCode, VendorType=@vendorType, VendorName=@vendorName,
              ContactPerson=@contactPerson, Mobile=@mobile, Email=@email, City=@city, State=@state, UpdatedAt=GETDATE()
              WHERE VendorID=@vendorId`);
    res.json({ message: 'Vendor updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vendors/:vendorId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('vendorId', sql.Int, req.params.vendorId)
      .query('UPDATE VendorMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE VendorID=@vendorId');
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== RAW MATERIALS ENDPOINTS =====
app.get('/api/rawmaterials', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query('SELECT * FROM RawMaterials WHERE IsActive = 1 ORDER BY MaterialName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rawmaterials', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { materialCode, type, name, description, brand, hsnCode, uom, unitPrice } = req.body;
    if (!materialCode || !name) {
      return res.status(400).json({ error: 'Material Code and Name are required' });
    }
    const result = await pool.request()
      .input('materialCode', sql.VarChar, materialCode)
      .input('materialType', sql.VarChar, type || null)
      .input('materialName', sql.VarChar, name)
      .input('description', sql.Text, description || null)
      .input('brand', sql.VarChar, brand || null)
      .input('hsnCode', sql.VarChar, hsnCode || null)
      .input('uom', sql.VarChar, uom || 'Pcs')
      .input('unitPrice', sql.Decimal(10,2), unitPrice || 0)
      .query(`INSERT INTO RawMaterials (MaterialCode, MaterialType, MaterialName, Description, Brand, HSNCode, UOM, UnitPrice, IsActive)
              VALUES (@materialCode, @materialType, @materialName, @description, @brand, @hsnCode, @uom, @unitPrice, 1);
              SELECT SCOPE_IDENTITY() as MaterialID`);
    res.status(201).json({ message: 'Raw Material created', materialId: result.recordset[0].MaterialID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rawmaterials/:materialId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { materialCode, type, name, description, brand, hsnCode, uom, unitPrice } = req.body;
    await pool.request()
      .input('materialId', sql.Int, req.params.materialId)
      .input('materialCode', sql.VarChar, materialCode)
      .input('materialType', sql.VarChar, type || null)
      .input('materialName', sql.VarChar, name)
      .input('description', sql.Text, description || null)
      .input('brand', sql.VarChar, brand || null)
      .input('hsnCode', sql.VarChar, hsnCode || null)
      .input('uom', sql.VarChar, uom || 'Pcs')
      .input('unitPrice', sql.Decimal(10,2), unitPrice || 0)
      .query(`UPDATE RawMaterials SET MaterialCode=@materialCode, MaterialType=@materialType, MaterialName=@materialName,
              Description=@description, Brand=@brand, HSNCode=@hsnCode, UOM=@uom, UnitPrice=@unitPrice, UpdatedAt=GETDATE()
              WHERE MaterialID=@materialId`);
    res.json({ message: 'Raw Material updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rawmaterials/:materialId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('materialId', sql.Int, req.params.materialId)
      .query('UPDATE RawMaterials SET IsActive=0, UpdatedAt=GETDATE() WHERE MaterialID=@materialId');
    res.json({ message: 'Raw Material deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  await initializePool();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  if (pool) {
    await pool.close();
  }
  process.exit(0);
});
