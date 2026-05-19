const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5060;

// Middleware
app.use(cors());
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

    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query Users table
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT UserID, Email, Password, UserName, Role FROM Users WHERE Email = @email');

    console.log('Query result rows:', result.recordset.length);

    if (result.recordset.length === 0) {
      console.log('User not found with email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
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
        username: user.UserName,
        role: user.Role
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
