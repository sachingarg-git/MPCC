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
    await ensureTablesExist();
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    setTimeout(initializePool, 5000);
  }
}

// Auto-create required tables if they don't exist
async function ensureTablesExist() {
  try {
    // CustomerRegistrations first (no FK dependencies)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CustomerRegistrations' AND xtype='U')
      CREATE TABLE CustomerRegistrations (
        RegistrationID INT PRIMARY KEY IDENTITY(1,1),
        RegistrationCode NVARCHAR(50) UNIQUE NOT NULL,
        InstitutionName NVARCHAR(255) NOT NULL,
        InstitutionType NVARCHAR(100),
        NumberOfBeds INT,
        BMWRegNo NVARCHAR(50),
        FullAddress NVARCHAR(MAX),
        Zone NVARCHAR(100),
        Pincode NVARCHAR(10),
        ContactPerson NVARCHAR(100),
        Designation NVARCHAR(100),
        Mobile NVARCHAR(20),
        Email NVARCHAR(100),
        AlternateMobile NVARCHAR(20),
        Website NVARCHAR(255),
        PANNumber NVARCHAR(50),
        GSTNumber NVARCHAR(50),
        GPSLatitude DECIMAL(10,8),
        GPSLongitude DECIMAL(11,8),
        GPSAddress NVARCHAR(MAX),
        SelectedPlan NVARCHAR(100),
        BillingCycle NVARCHAR(50),
        ContractStartDate DATETIME,
        ContractDuration INT,
        PaymentModePref NVARCHAR(100),
        PaymentMethod NVARCHAR(50),
        Status NVARCHAR(50) DEFAULT 'Pending',
        RegistrationDate DATETIME DEFAULT GETDATE(),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('✓ CustomerRegistrations table ready');

    // ── Migrate: add columns that may not exist in older CustomerRegistrations tables ──
    const crMigrations = [
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='Category')
         ALTER TABLE CustomerRegistrations ADD Category NVARCHAR(100) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='SubCategory')
         ALTER TABLE CustomerRegistrations ADD SubCategory NVARCHAR(100) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='Route')
         ALTER TABLE CustomerRegistrations ADD Route NVARCHAR(100) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='Kit')
         ALTER TABLE CustomerRegistrations ADD Kit NVARCHAR(100) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='Consulting')
         ALTER TABLE CustomerRegistrations ADD Consulting NVARCHAR(50) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='Compliance')
         ALTER TABLE CustomerRegistrations ADD Compliance NVARCHAR(50) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='CustomerID')
         ALTER TABLE CustomerRegistrations ADD CustomerID NVARCHAR(30) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='TxnID')
         ALTER TABLE CustomerRegistrations ADD TxnID NVARCHAR(50) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='RegFee')
         ALTER TABLE CustomerRegistrations ADD RegFee DECIMAL(12,2) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='SvcFee')
         ALTER TABLE CustomerRegistrations ADD SvcFee DECIMAL(12,2) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='TotalAmount')
         ALTER TABLE CustomerRegistrations ADD TotalAmount DECIMAL(12,2) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='PayMode')
         ALTER TABLE CustomerRegistrations ADD PayMode NVARCHAR(50) NULL`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='PortalEnabled')
         ALTER TABLE CustomerRegistrations ADD PortalEnabled BIT DEFAULT 0`,
      `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('CustomerRegistrations') AND name='PortalPin')
         ALTER TABLE CustomerRegistrations ADD PortalPin NVARCHAR(10) NULL`,
    ];
    for (const q of crMigrations) {
      try { await pool.request().query(q); } catch(e) { console.warn('CR migration warn:', e.message); }
    }
    console.log('✓ CustomerRegistrations columns migrated');

    // HCFDocuments
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HCFDocuments' AND xtype='U')
        CREATE TABLE HCFDocuments (
          DocID INT PRIMARY KEY IDENTITY(1,1),
          RegistrationID INT,
          DocumentType NVARCHAR(100),
          Version NVARCHAR(50),
          ExpiryDate DATE NULL,
          UploadedBy NVARCHAR(100),
          Remarks NVARCHAR(500),
          CreatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✓ HCFDocuments table ready');
    } catch(e) { console.warn('HCFDocuments init warn:', e.message); }

    // HCFContacts
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HCFContacts' AND xtype='U')
        CREATE TABLE HCFContacts (
          ContactID INT PRIMARY KEY IDENTITY(1,1),
          RegistrationID INT,
          ContactName NVARCHAR(100),
          Designation NVARCHAR(100),
          Mobile NVARCHAR(20),
          Email NVARCHAR(100),
          IsPrimary BIT DEFAULT 0,
          CreatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✓ HCFContacts table ready');
    } catch(e) { console.warn('HCFContacts init warn:', e.message); }

    // HCFApprovals
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HCFApprovals' AND xtype='U')
        CREATE TABLE HCFApprovals (
          ApprovalID INT PRIMARY KEY IDENTITY(1,1),
          RegistrationID INT,
          FacilityName NVARCHAR(255),
          Zone NVARCHAR(100),
          Category NVARCHAR(100),
          CurrentStage NVARCHAR(100) DEFAULT 'RM Raises',
          Status NVARCHAR(50) DEFAULT 'Pending',
          RaisedBy NVARCHAR(100),
          MonthlyAmount DECIMAL(12,2) DEFAULT 0,
          Remarks NVARCHAR(1000),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✓ HCFApprovals table ready');
    } catch(e) { console.warn('HCFApprovals init warn:', e.message); }

    // HCFRenewals
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HCFRenewals' AND xtype='U')
        CREATE TABLE HCFRenewals (
          RenewalID INT PRIMARY KEY IDENTITY(1,1),
          RegistrationID INT,
          FacilityName NVARCHAR(255),
          Zone NVARCHAR(100),
          RenewalDate DATE NULL,
          AutoRenew BIT DEFAULT 0,
          MoUReSigned BIT DEFAULT 0,
          LastReminded DATETIME NULL,
          Status NVARCHAR(50) DEFAULT 'Pending',
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✓ HCFRenewals table ready');
    } catch(e) { console.warn('HCFRenewals init warn:', e.message); }

    // HCFDeregistrations
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HCFDeregistrations' AND xtype='U')
        CREATE TABLE HCFDeregistrations (
          DeregID INT PRIMARY KEY IDENTITY(1,1),
          RegistrationID INT,
          FacilityName NVARCHAR(255),
          Zone NVARCHAR(100),
          Reason NVARCHAR(500),
          Stage NVARCHAR(100) DEFAULT 'Awaiting Accounts',
          LetterheadReceived BIT DEFAULT 0,
          CertReturned BIT DEFAULT 0,
          AgreementReturned BIT DEFAULT 0,
          OutstandingCleared BIT DEFAULT 0,
          KitReturned BIT DEFAULT 0,
          HologramClosed BIT DEFAULT 0,
          Outstanding DECIMAL(12,2) DEFAULT 0,
          Remarks NVARCHAR(1000),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✓ HCFDeregistrations table ready');
    } catch(e) { console.warn('HCFDeregistrations init warn:', e.message); }

    // HCFSupportTickets
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HCFSupportTickets' AND xtype='U')
        CREATE TABLE HCFSupportTickets (
          TicketID INT PRIMARY KEY IDENTITY(1,1),
          TicketCode NVARCHAR(30),
          RegistrationID INT,
          HCFName NVARCHAR(255),
          Zone NVARCHAR(100),
          Route NVARCHAR(100),
          Category NVARCHAR(100),
          Priority NVARCHAR(50) DEFAULT 'Medium',
          Subject NVARCHAR(255),
          Description NVARCHAR(MAX),
          AssignedTo NVARCHAR(100),
          Status NVARCHAR(50) DEFAULT 'Open',
          DueDate DATE NULL,
          Resolution NVARCHAR(MAX),
          NotifyBM BIT DEFAULT 0,
          BMName NVARCHAR(100),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE()
        )
      `);
      console.log('✓ HCFSupportTickets table ready');
    } catch(e) { console.warn('HCFSupportTickets init warn:', e.message); }

    // Certificates — no FK to Customers, linked to CustomerRegistrations
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Certificates' AND xtype='U')
      CREATE TABLE Certificates (
        CertificateID INT PRIMARY KEY IDENTITY(1,1),
        CertificateCode NVARCHAR(50) UNIQUE NOT NULL,
        CertificateType NVARCHAR(50) NOT NULL,
        RegistrationID INT NULL,
        FacilityName NVARCHAR(255) NULL,
        IssueDate DATETIME NOT NULL,
        ValidTill DATETIME NOT NULL,
        Notes NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'Active',
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);
    // Migration: add RegistrationID/FacilityName columns if table already existed with old schema
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('Certificates') AND name='RegistrationID')
        ALTER TABLE Certificates ADD RegistrationID INT NULL;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('Certificates') AND name='FacilityName')
        ALTER TABLE Certificates ADD FacilityName NVARCHAR(255) NULL;
    `);
    // Drop old CustomerID FK constraint if present and make column nullable
    try {
      const fkRes = await pool.request().query(`
        SELECT TOP 1 fk.name AS FKName FROM sys.foreign_keys fk
        JOIN sys.foreign_key_columns fkc ON fk.object_id=fkc.constraint_object_id
        JOIN sys.columns c ON fkc.parent_object_id=c.object_id AND fkc.parent_column_id=c.column_id
        WHERE fk.parent_object_id=OBJECT_ID('Certificates') AND c.name='CustomerID'
      `);
      if (fkRes.recordset.length > 0) {
        await pool.request().query(`ALTER TABLE Certificates DROP CONSTRAINT ${fkRes.recordset[0].FKName}`);
      }
      const colRes = await pool.request().query(`
        SELECT is_nullable FROM sys.columns WHERE object_id=OBJECT_ID('Certificates') AND name='CustomerID'
      `);
      if (colRes.recordset.length > 0 && colRes.recordset[0].is_nullable === false) {
        await pool.request().query(`ALTER TABLE Certificates ALTER COLUMN CustomerID INT NULL`);
      }
    } catch(e) { /* already nullable or no FK */ }
    console.log('✓ Certificates table ready');

    // ServiceRequests — linked to CustomerRegistrations
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ServiceRequests' AND xtype='U')
      CREATE TABLE ServiceRequests (
        RequestID INT PRIMARY KEY IDENTITY(1,1),
        RequestCode NVARCHAR(50) UNIQUE NOT NULL,
        RequestType NVARCHAR(100) NOT NULL,
        RegistrationID INT NULL,
        FacilityName NVARCHAR(255) NULL,
        AssignedToUserID INT,
        ScheduledDate DATETIME,
        Description NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'Open',
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ServiceRequests') AND name='RegistrationID')
        ALTER TABLE ServiceRequests ADD RegistrationID INT NULL;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('ServiceRequests') AND name='FacilityName')
        ALTER TABLE ServiceRequests ADD FacilityName NVARCHAR(255) NULL;
    `);
    try {
      const fkRes2 = await pool.request().query(`
        SELECT TOP 1 fk.name AS FKName FROM sys.foreign_keys fk
        JOIN sys.foreign_key_columns fkc ON fk.object_id=fkc.constraint_object_id
        JOIN sys.columns c ON fkc.parent_object_id=c.object_id AND fkc.parent_column_id=c.column_id
        WHERE fk.parent_object_id=OBJECT_ID('ServiceRequests') AND c.name='CustomerID'
      `);
      if (fkRes2.recordset.length > 0) {
        await pool.request().query(`ALTER TABLE ServiceRequests DROP CONSTRAINT ${fkRes2.recordset[0].FKName}`);
      }
    } catch(e) {}
    // Make CustomerID nullable so old rows still work without FK
    try {
      const srColRes = await pool.request().query(`
        SELECT is_nullable FROM sys.columns
        WHERE object_id=OBJECT_ID('ServiceRequests') AND name='CustomerID'
      `);
      if (srColRes.recordset.length > 0 && srColRes.recordset[0].is_nullable === false) {
        await pool.request().query(`ALTER TABLE ServiceRequests ALTER COLUMN CustomerID INT NULL`);
      }
    } catch(e) {}
    console.log('✓ ServiceRequests table ready');

    // CustomerMOU — linked to CustomerRegistrations
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CustomerMOU' AND xtype='U')
      CREATE TABLE CustomerMOU (
        MOUID INT PRIMARY KEY IDENTITY(1,1),
        MOUCode NVARCHAR(50) UNIQUE NOT NULL,
        RegistrationID INT NULL,
        FacilityName NVARCHAR(255) NULL,
        StartDate DATETIME NOT NULL,
        EndDate DATETIME NOT NULL,
        ContractValue DECIMAL(12,2) DEFAULT 0,
        TermsConditions NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'Active',
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomerMOU') AND name='RegistrationID')
        ALTER TABLE CustomerMOU ADD RegistrationID INT NULL;
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('CustomerMOU') AND name='FacilityName')
        ALTER TABLE CustomerMOU ADD FacilityName NVARCHAR(255) NULL;
    `);
    try {
      const fkRes3 = await pool.request().query(`
        SELECT TOP 1 fk.name AS FKName FROM sys.foreign_keys fk
        JOIN sys.foreign_key_columns fkc ON fk.object_id=fkc.constraint_object_id
        JOIN sys.columns c ON fkc.parent_object_id=c.object_id AND fkc.parent_column_id=c.column_id
        WHERE fk.parent_object_id=OBJECT_ID('CustomerMOU') AND c.name='CustomerID'
      `);
      if (fkRes3.recordset.length > 0) {
        await pool.request().query(`ALTER TABLE CustomerMOU DROP CONSTRAINT ${fkRes3.recordset[0].FKName}`);
      }
    } catch(e) {}
    // Make CustomerID nullable so old rows still work without FK
    try {
      const mouColRes = await pool.request().query(`
        SELECT is_nullable FROM sys.columns
        WHERE object_id=OBJECT_ID('CustomerMOU') AND name='CustomerID'
      `);
      if (mouColRes.recordset.length > 0 && mouColRes.recordset[0].is_nullable === false) {
        await pool.request().query(`ALTER TABLE CustomerMOU ALTER COLUMN CustomerID INT NULL`);
      }
    } catch(e) {}
    console.log('✓ CustomerMOU table ready');

    // FailedRegistrations
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FailedRegistrations' AND xtype='U')
      CREATE TABLE FailedRegistrations (
        FailureID INT PRIMARY KEY IDENTITY(1,1),
        FailureCode NVARCHAR(50) UNIQUE NOT NULL,
        FacilityName NVARCHAR(255) NOT NULL,
        ContactPerson NVARCHAR(100),
        Mobile NVARCHAR(20) NOT NULL,
        PlanName NVARCHAR(100),
        Amount DECIMAL(12,2) DEFAULT 0,
        ErrorCode NVARCHAR(50),
        FailureReason NVARCHAR(MAX),
        AttemptedDate DATETIME DEFAULT GETDATE(),
        Status NVARCHAR(50) DEFAULT 'Failed',
        ChequeNo NVARCHAR(50),
        ChequeAmount DECIMAL(12,2) DEFAULT 0,
        BankName NVARCHAR(100),
        ChequeDate DATETIME,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('✓ FailedRegistrations table ready');

    // ServiceRequestFollowUps — audit trail for every SR status change / note
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ServiceRequestFollowUps' AND xtype='U')
      CREATE TABLE ServiceRequestFollowUps (
        FollowUpID     INT PRIMARY KEY IDENTITY(1,1),
        RequestID      INT NOT NULL,
        StatusChanged  NVARCHAR(50),
        Note           NVARCHAR(MAX),
        UpdatedByUserID INT NULL,
        UpdatedByName  NVARCHAR(150),
        CreatedAt      DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('✓ ServiceRequestFollowUps table ready');

    // CategoryMaster — service plan categories
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CategoryMaster' AND xtype='U')
      CREATE TABLE CategoryMaster (
        CategoryID   INT PRIMARY KEY IDENTITY(1,1),
        CategoryName NVARCHAR(200) NOT NULL,
        IsActive     BIT DEFAULT 1,
        CreatedAt    DATETIME DEFAULT GETDATE(),
        UpdatedAt    DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('✓ CategoryMaster table ready');

    // SubCategoryMaster — children of CategoryMaster
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SubCategoryMaster' AND xtype='U')
      CREATE TABLE SubCategoryMaster (
        SubCategoryID   INT PRIMARY KEY IDENTITY(1,1),
        CategoryID      INT NOT NULL,
        SubCategoryName NVARCHAR(200) NOT NULL,
        IsActive        BIT DEFAULT 1,
        CreatedAt       DATETIME DEFAULT GETDATE(),
        UpdatedAt       DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('✓ SubCategoryMaster table ready');

    // ZoneMaster — service zones / operational areas
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ZoneMaster' AND xtype='U')
      CREATE TABLE ZoneMaster (
        ZoneID      INT PRIMARY KEY IDENTITY(1,1),
        ZoneCode    NVARCHAR(50),
        ZoneName    NVARCHAR(200) NOT NULL,
        ZoneType    NVARCHAR(100),
        Description NVARCHAR(MAX),
        IsActive    BIT DEFAULT 1,
        CreatedAt   DATETIME DEFAULT GETDATE(),
        UpdatedAt   DATETIME DEFAULT GETDATE()
      );
    `);
    console.log('✓ ZoneMaster table ready');

    // Add FacilityTypes column to ServicePlans if missing
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ServicePlans') AND name = 'FacilityTypes')
        ALTER TABLE ServicePlans ADD FacilityTypes NVARCHAR(200) NULL
      `);
    } catch(e) { /* column may already exist */ }

    // ServicePlanItems — materials included in a plan
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ServicePlanItems' AND xtype='U')
      CREATE TABLE ServicePlanItems (
        ItemID       INT PRIMARY KEY IDENTITY(1,1),
        PlanID       INT NOT NULL,
        MaterialID   INT,
        MaterialName NVARCHAR(200),
        UOM          NVARCHAR(50),
        QtyPerVisit  DECIMAL(10,2) DEFAULT 1,
        Notes        NVARCHAR(500),
        CreatedAt    DATETIME DEFAULT GETDATE()
      );
    `);

    // KitMaster table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='KitMaster' AND xtype='U')
      CREATE TABLE KitMaster (
        KitID        INT PRIMARY KEY IDENTITY(1,1),
        KitCode      NVARCHAR(50),
        KitName      NVARCHAR(200) NOT NULL,
        KitType      NVARCHAR(100),
        SellingPrice DECIMAL(10,2) DEFAULT 0,
        CostPrice    DECIMAL(10,2) DEFAULT 0,
        Description  NVARCHAR(MAX),
        IsPopular    BIT DEFAULT 0,
        IsActive     BIT DEFAULT 1,
        CreatedAt    DATETIME DEFAULT GETDATE(),
        UpdatedAt    DATETIME DEFAULT GETDATE()
      );
    `);
    // Add columns if missing (for existing DB)
    try {
      await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('KitMaster') AND name='SellingPrice') ALTER TABLE KitMaster ADD SellingPrice DECIMAL(10,2) NULL`);
      await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('KitMaster') AND name='CostPrice') ALTER TABLE KitMaster ADD CostPrice DECIMAL(10,2) NULL`);
      await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id=OBJECT_ID('KitMaster') AND name='IsPopular') ALTER TABLE KitMaster ADD IsPopular BIT DEFAULT 0`);
      // Patch NULL prices to 0 for pre-existing rows
      await pool.request().query(`UPDATE KitMaster SET SellingPrice=0 WHERE SellingPrice IS NULL`);
      await pool.request().query(`UPDATE KitMaster SET CostPrice=0 WHERE CostPrice IS NULL`);
      await pool.request().query(`UPDATE KitMaster SET IsPopular=0 WHERE IsPopular IS NULL`);
    } catch(e) { console.log('KitMaster migration note:', e.message); }

    // KitItems table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='KitItems' AND xtype='U')
      CREATE TABLE KitItems (
        ItemID    INT PRIMARY KEY IDENTITY(1,1),
        KitID     INT NOT NULL,
        ItemName  NVARCHAR(200),
        HSNCode   NVARCHAR(50),
        Qty       DECIMAL(10,2) DEFAULT 1,
        Unit      NVARCHAR(20) DEFAULT 'Pcs',
        Rate      DECIMAL(10,2) DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
      );
    `);

  } catch (err) {
    console.error('Table init error:', err.message);
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

// NOTE: /api/categories and /api/subcategories are defined in the CATEGORY MASTER ENDPOINTS section below

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
    const { routeName, routeType, primaryDriver, secondaryDriver } = req.body;
    if (!routeName || !routeType) {
      return res.status(400).json({ error: 'Route Name and Type are required' });
    }
    // Generate code server-side using MAX(RouteID) to avoid duplicate key on soft-deleted rows
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(RouteID),0)+1 AS NextID FROM Routes`);
    const nextId = maxRes.recordset[0].NextID;
    const routeCode = `RTE-${String(nextId).padStart(3,'0')}`;
    const result = await pool.request()
      .input('routeCode', sql.VarChar, routeCode)
      .input('routeName', sql.VarChar, routeName)
      .input('routeType', sql.VarChar, routeType)
      .input('primaryDriver', sql.VarChar, primaryDriver || null)
      .input('secondaryDriver', sql.VarChar, secondaryDriver || null)
      .query(`INSERT INTO Routes (RouteCode, RouteName, RouteType, PrimaryDriver, SecondaryDriver, IsActive)
              VALUES (@routeCode, @routeName, @routeType, @primaryDriver, @secondaryDriver, 1);
              SELECT SCOPE_IDENTITY() as RouteID`);
    res.status(201).json({ message: 'Route created', routeId: result.recordset[0].RouteID, routeCode });
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

// ===== ZONE MASTER ENDPOINTS =====
app.get('/api/zones', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request().query('SELECT * FROM ZoneMaster ORDER BY ZoneName');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/zones', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { zoneName, zoneType, description, isActive } = req.body;
    if (!zoneName) return res.status(400).json({ error: 'Zone Name is required' });
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(ZoneID),0)+1 AS NextID FROM ZoneMaster`);
    const zoneCode = `ZNE-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
    const result = await pool.request()
      .input('zoneCode', sql.VarChar, zoneCode)
      .input('zoneName', sql.NVarChar, zoneName)
      .input('zoneType', sql.VarChar, zoneType || null)
      .input('description', sql.NVarChar, description || null)
      .input('isActive', sql.Bit, isActive !== false ? 1 : 0)
      .query(`INSERT INTO ZoneMaster (ZoneCode, ZoneName, ZoneType, Description, IsActive)
              VALUES (@zoneCode, @zoneName, @zoneType, @description, @isActive);
              SELECT SCOPE_IDENTITY() as ZoneID`);
    res.status(201).json({ message: 'Zone created', zoneId: result.recordset[0].ZoneID, zoneCode });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/zones/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { zoneName, zoneType, description, isActive } = req.body;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('zoneName', sql.NVarChar, zoneName)
      .input('zoneType', sql.VarChar, zoneType || null)
      .input('description', sql.NVarChar, description || null)
      .input('isActive', sql.Bit, isActive ? 1 : 0)
      .query(`UPDATE ZoneMaster SET ZoneName=@zoneName, ZoneType=@zoneType, Description=@description, IsActive=@isActive, UpdatedAt=GETDATE() WHERE ZoneID=@id`);
    res.json({ message: 'Zone updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/zones/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('UPDATE ZoneMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE ZoneID=@id');
    res.json({ message: 'Zone deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== SERVICE PLANS ENDPOINTS =====
app.get('/api/serviceplans', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request().query('SELECT * FROM ServicePlans WHERE IsActive = 1 ORDER BY PlanName');
    const plans = result.recordset;
    // Attach items to each plan
    const itemsResult = await pool.request().query('SELECT * FROM ServicePlanItems ORDER BY ItemID');
    const allItems = itemsResult.recordset;
    const plansWithItems = plans.map(p => ({
      ...p,
      PlanItems: allItems.filter(i => i.PlanID === p.PlanID)
    }));
    res.json(plansWithItems);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/serviceplans', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { name, category, subCategory, zone, route, description, pricingType, monthlyCharges, registrationCharges, consultingFees, isActive, facilityTypes, planItems } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Plan Name and Category are required' });
    }
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(PlanID),0)+1 AS NextID FROM ServicePlans`);
    const planCode = `PLAN-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
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
      .input('facilityTypes', sql.VarChar, facilityTypes || null)
      .query(`INSERT INTO ServicePlans (PlanCode, PlanName, Category, SubCategory, Zone, Route, Description, PricingType, MonthlyCharges, RegistrationCharges, ConsultingFees, IsActive, FacilityTypes)
              VALUES (@planCode, @planName, @category, @subCategory, @zone, @route, @description, @pricingType, @monthlyCharges, @registrationCharges, @consultingFees, @isActive, @facilityTypes);
              SELECT SCOPE_IDENTITY() as PlanID`);
    res.status(201).json({ message: 'Service Plan created', planId: result.recordset[0].PlanID, planCode });
    // Insert plan items
    if (Array.isArray(planItems) && planItems.length > 0) {
      const newPlanId = result.recordset[0].PlanID;
      for (const item of planItems) {
        if (!item.materialName && !item.materialId) continue;
        await pool.request()
          .input('planId', sql.Int, newPlanId)
          .input('materialId', sql.Int, item.materialId || null)
          .input('materialName', sql.NVarChar, item.materialName || '')
          .input('uom', sql.VarChar, item.uom || 'Pcs')
          .input('qty', sql.Decimal(10,2), parseFloat(item.qty) || 1)
          .input('notes', sql.NVarChar, item.notes || null)
          .query(`INSERT INTO ServicePlanItems (PlanID, MaterialID, MaterialName, UOM, QtyPerVisit, Notes) VALUES (@planId, @materialId, @materialName, @uom, @qty, @notes)`);
      }
    }
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/serviceplans/:planId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { planCode, name, category, subCategory, zone, route, description, pricingType, monthlyCharges, registrationCharges, consultingFees, isActive, facilityTypes, planItems } = req.body;
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
      .input('facilityTypes', sql.VarChar, facilityTypes || null)
      .query(`UPDATE ServicePlans SET PlanCode=@planCode, PlanName=@planName, Category=@category, SubCategory=@subCategory,
              Zone=@zone, Route=@route, Description=@description, PricingType=@pricingType, MonthlyCharges=@monthlyCharges,
              RegistrationCharges=@registrationCharges, ConsultingFees=@consultingFees, IsActive=@isActive, FacilityTypes=@facilityTypes, UpdatedAt=GETDATE()
              WHERE PlanID=@planId`);
    // Sync plan items — delete old and re-insert
    await pool.request().input('planId', sql.Int, req.params.planId).query('DELETE FROM ServicePlanItems WHERE PlanID=@planId');
    if (Array.isArray(planItems) && planItems.length > 0) {
      for (const item of planItems) {
        if (!item.materialName && !item.materialId) continue;
        await pool.request()
          .input('planId', sql.Int, req.params.planId)
          .input('materialId', sql.Int, item.materialId || null)
          .input('materialName', sql.NVarChar, item.materialName || '')
          .input('uom', sql.VarChar, item.uom || 'Pcs')
          .input('qty', sql.Decimal(10,2), parseFloat(item.qty) || 1)
          .input('notes', sql.NVarChar, item.notes || null)
          .query(`INSERT INTO ServicePlanItems (PlanID, MaterialID, MaterialName, UOM, QtyPerVisit, Notes) VALUES (@planId, @materialId, @materialName, @uom, @qty, @notes)`);
      }
    }
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
    const { frequencyName, months, discountAmt, discountPct, description } = req.body;
    if (!frequencyName || !months) {
      return res.status(400).json({ error: 'Frequency Name and Months are required' });
    }
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(FrequencyID),0)+1 AS NextID FROM PaymentFrequency`);
    const frequencyCode = `FREQ-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
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
    res.status(201).json({ message: 'Payment Frequency created', frequencyId: result.recordset[0].FrequencyID, frequencyCode });
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
    const kitsResult = await pool.request().query(`
      SELECT KitID, KitCode, KitName, KitType,
        ISNULL(SellingPrice, 0) AS SellingPrice,
        ISNULL(CostPrice, 0)    AS CostPrice,
        ISNULL(IsPopular, 0)    AS IsPopular,
        IsActive, Description, CreatedAt, UpdatedAt
      FROM KitMaster WHERE IsActive = 1 ORDER BY KitName`);
    const kits = kitsResult.recordset;
    let allItems = [];
    try {
      const itemsResult = await pool.request().query('SELECT * FROM KitItems ORDER BY ItemID');
      allItems = itemsResult.recordset;
    } catch(e) {}
    const kitsWithItems = kits.map(k => ({
      ...k,
      KitItems: allItems.filter(i => i.KitID === k.KitID)
    }));
    res.json(kitsWithItems);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kits', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { name, type, sellingPrice, costPrice, description, isPopular, items, isActive } = req.body;
    if (!name) return res.status(400).json({ error: 'Kit Name is required' });
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(KitID),0)+1 AS NextID FROM KitMaster`);
    const kitCode = `KIT-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
    const result = await pool.request()
      .input('kitCode', sql.VarChar, kitCode)
      .input('kitName', sql.VarChar, name)
      .input('kitType', sql.VarChar, type || null)
      .input('sellingPrice', sql.Decimal(10,2), parseFloat(sellingPrice) || 0)
      .input('costPrice', sql.Decimal(10,2), parseFloat(costPrice) || 0)
      .input('description', sql.Text, description || null)
      .input('isPopular', sql.Bit, isPopular ? 1 : 0)
      .input('isActive', sql.Bit, isActive !== false ? 1 : 0)
      .query(`INSERT INTO KitMaster (KitCode, KitName, KitType, SellingPrice, CostPrice, Description, IsPopular, IsActive)
              VALUES (@kitCode, @kitName, @kitType, @sellingPrice, @costPrice, @description, @isPopular, @isActive);
              SELECT SCOPE_IDENTITY() as KitID`);
    const newKitId = result.recordset[0].KitID;
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.item && !item.ItemName) continue;
        await pool.request()
          .input('kitId', sql.Int, newKitId)
          .input('itemName', sql.NVarChar, item.item || item.ItemName || '')
          .input('hsnCode', sql.VarChar, item.hsn || item.HSNCode || null)
          .input('qty', sql.Decimal(10,2), parseFloat(item.qty || item.Qty) || 1)
          .input('unit', sql.VarChar, item.unit || item.Unit || 'Pcs')
          .input('rate', sql.Decimal(10,2), parseFloat(item.rate || item.Rate) || 0)
          .query(`INSERT INTO KitItems (KitID, ItemName, HSNCode, Qty, Unit, Rate) VALUES (@kitId, @itemName, @hsnCode, @qty, @unit, @rate)`);
      }
    }
    res.status(201).json({ message: 'Kit created', kitId: newKitId, kitCode });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/kits/:kitId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { kitCode, name, type, sellingPrice, costPrice, description, isPopular, items, isActive } = req.body;
    await pool.request()
      .input('kitId', sql.Int, req.params.kitId)
      .input('kitCode', sql.VarChar, kitCode)
      .input('kitName', sql.VarChar, name)
      .input('kitType', sql.VarChar, type || null)
      .input('sellingPrice', sql.Decimal(10,2), parseFloat(sellingPrice) || 0)
      .input('costPrice', sql.Decimal(10,2), parseFloat(costPrice) || 0)
      .input('description', sql.Text, description || null)
      .input('isPopular', sql.Bit, isPopular ? 1 : 0)
      .input('isActive', sql.Bit, isActive ? 1 : 0)
      .query(`UPDATE KitMaster SET KitCode=@kitCode, KitName=@kitName, KitType=@kitType,
              SellingPrice=@sellingPrice, CostPrice=@costPrice, Description=@description,
              IsPopular=@isPopular, IsActive=@isActive, UpdatedAt=GETDATE() WHERE KitID=@kitId`);
    // Sync items
    await pool.request().input('kitId', sql.Int, req.params.kitId).query('DELETE FROM KitItems WHERE KitID=@kitId');
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.item && !item.ItemName) continue;
        await pool.request()
          .input('kitId', sql.Int, req.params.kitId)
          .input('itemName', sql.NVarChar, item.item || item.ItemName || '')
          .input('hsnCode', sql.VarChar, item.hsn || item.HSNCode || null)
          .input('qty', sql.Decimal(10,2), parseFloat(item.qty || item.Qty) || 1)
          .input('unit', sql.VarChar, item.unit || item.Unit || 'Pcs')
          .input('rate', sql.Decimal(10,2), parseFloat(item.rate || item.Rate) || 0)
          .query(`INSERT INTO KitItems (KitID, ItemName, HSNCode, Qty, Unit, Rate) VALUES (@kitId, @itemName, @hsnCode, @qty, @unit, @rate)`);
      }
    }
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
    const { name, bagColor, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category Name is required' });
    }
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(CategoryID),0)+1 AS NextID FROM WasteCategory`);
    const categoryCode = `WC-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
    const result = await pool.request()
      .input('categoryCode', sql.VarChar, categoryCode)
      .input('categoryName', sql.VarChar, name)
      .input('bagColor', sql.VarChar, bagColor || null)
      .input('description', sql.Text, description || null)
      .query(`INSERT INTO WasteCategory (CategoryCode, CategoryName, BagColor, Description, IsActive)
              VALUES (@categoryCode, @categoryName, @bagColor, @description, 1);
              SELECT SCOPE_IDENTITY() as CategoryID`);
    res.status(201).json({ message: 'Waste Category created', categoryId: result.recordset[0].CategoryID, categoryCode });
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
    const { vehicleType, registrationNo, manufacturer, model, purchaseDate, gpsEnabled } = req.body;
    if (!registrationNo) {
      return res.status(400).json({ error: 'Registration No is required' });
    }
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(VehicleID),0)+1 AS NextID FROM VehicleMaster`);
    const vehicleCode = `VEH-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
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
    res.status(201).json({ message: 'Vehicle created', vehicleId: result.recordset[0].VehicleID, vehicleCode });
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
    const { type, name, contactPerson, mobile, email, city, state } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Vendor Name is required' });
    }
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(VendorID),0)+1 AS NextID FROM VendorMaster`);
    const vendorCode = `VND-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
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
    res.status(201).json({ message: 'Vendor created', vendorId: result.recordset[0].VendorID, vendorCode });
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
    const { type, name, description, brand, hsnCode, uom, unitPrice } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Material Name is required' });
    }
    const maxRes = await pool.request().query(`SELECT ISNULL(MAX(MaterialID),0)+1 AS NextID FROM RawMaterials`);
    const materialCode = `ITM-${String(maxRes.recordset[0].NextID).padStart(3,'0')}`;
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
    res.status(201).json({ message: 'Raw Material created', materialId: result.recordset[0].MaterialID, materialCode });
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

// ===== CUSTOMER PORTAL ENDPOINTS =====

// Get all customer registrations
app.get('/api/customers', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query(`SELECT * FROM Customers WHERE IsActive=1 ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
app.get('/api/customers/:customerId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('customerId', sql.Int, req.params.customerId)
      .query('SELECT * FROM Customers WHERE CustomerID=@customerId');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Register new customer
app.post('/api/customers', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { InstitutionName, ContactPerson, Email, MobileNo, Address, Zone, Route, ServicePlan } = req.body;

    const result = await pool.request()
      .input('institutionName', sql.VarChar, InstitutionName)
      .input('contactPerson', sql.VarChar, ContactPerson)
      .input('email', sql.VarChar, Email)
      .input('mobileNo', sql.VarChar, MobileNo)
      .input('address', sql.VarChar, Address)
      .input('zone', sql.VarChar, Zone)
      .input('route', sql.VarChar, Route)
      .input('servicePlan', sql.VarChar, ServicePlan)
      .query(`INSERT INTO Customers (InstitutionName, ContactPerson, Email, MobileNo, Address, Zone, Route, ServicePlan, IsActive, CreatedAt, UpdatedAt)
              VALUES (@institutionName, @contactPerson, @email, @mobileNo, @address, @zone, @route, @servicePlan, 1, GETDATE(), GETDATE())
              SELECT SCOPE_IDENTITY() as CustomerID`);

    res.json({ message: 'Customer registered successfully', CustomerID: result.recordset[0].CustomerID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer service subscriptions
app.get('/api/customers/:customerId/subscriptions', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('customerId', sql.Int, req.params.customerId)
      .query(`SELECT * FROM CustomerSubscriptions WHERE CustomerID=@customerId AND IsActive=1 ORDER BY StartDate DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create customer subscription
app.post('/api/customers/:customerId/subscriptions', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { PlanID, StartDate, EndDate, MonthlyCharges, PaymentFrequency } = req.body;

    const result = await pool.request()
      .input('customerId', sql.Int, req.params.customerId)
      .input('planId', sql.Int, PlanID)
      .input('startDate', sql.DateTime, StartDate)
      .input('endDate', sql.DateTime, EndDate)
      .input('monthlyCharges', sql.Decimal(10, 2), MonthlyCharges)
      .input('paymentFrequency', sql.VarChar, PaymentFrequency)
      .query(`INSERT INTO CustomerSubscriptions (CustomerID, PlanID, StartDate, EndDate, MonthlyCharges, PaymentFrequency, IsActive, CreatedAt)
              VALUES (@customerId, @planId, @startDate, @endDate, @monthlyCharges, @paymentFrequency, 1, GETDATE())
              SELECT SCOPE_IDENTITY() as SubscriptionID`);

    res.json({ message: 'Subscription created successfully', SubscriptionID: result.recordset[0].SubscriptionID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer pickups/collections
app.get('/api/customers/:customerId/pickups', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('customerId', sql.Int, req.params.customerId)
      .query(`SELECT * FROM Pickups WHERE CustomerID=@customerId ORDER BY PickupDate DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer invoices
app.get('/api/customers/:customerId/invoices', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('customerId', sql.Int, req.params.customerId)
      .query(`SELECT * FROM Invoices WHERE CustomerID=@customerId ORDER BY InvoiceDate DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SERVICE REQUESTS ENDPOINTS
// ============================================
app.get('/api/service-requests', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query(`SELECT sr.*,
                ISNULL(sr.FacilityName, cr.InstitutionName) AS CustomerName,
                u.Username as AssignedUserName
              FROM ServiceRequests sr
              LEFT JOIN CustomerRegistrations cr ON sr.RegistrationID = cr.RegistrationID
              LEFT JOIN Users u ON sr.AssignedToUserID = u.UserID
              ORDER BY sr.CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/service-requests', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { requestType, registrationId, facilityName, assignedToUserID, scheduledDate, description, status } = req.body;

    let resolvedFacilityName = facilityName;
    if (registrationId) {
      const regResult = await pool.request()
        .input('regID', sql.Int, registrationId)
        .query(`SELECT InstitutionName FROM CustomerRegistrations WHERE RegistrationID = @regID`);
      if (regResult.recordset.length > 0) resolvedFacilityName = regResult.recordset[0].InstitutionName;
    }

    const requestCode = 'SR-' + Date.now();
    const result = await pool.request()
      .input('requestCode', sql.NVarChar, requestCode)
      .input('requestType', sql.NVarChar, requestType)
      .input('registrationID', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, resolvedFacilityName || null)
      .input('assignedToUserID', sql.Int, assignedToUserID || null)
      .input('scheduledDate', sql.DateTime, scheduledDate || null)
      .input('description', sql.NVarChar, description)
      .input('status', sql.NVarChar, status || 'Open')
      .query(`INSERT INTO ServiceRequests (RequestCode, RequestType, RegistrationID, FacilityName, AssignedToUserID, ScheduledDate, Description, Status, CreatedAt)
              VALUES (@requestCode, @requestType, @registrationID, @facilityName, @assignedToUserID, @scheduledDate, @description, @status, GETDATE())
              SELECT SCOPE_IDENTITY() as RequestID`);

    res.json({ message: 'Service request created', RequestID: result.recordset[0].RequestID, RequestCode: requestCode });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/service-requests/:requestId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { requestType, registrationId, facilityName, assignedToUserID, scheduledDate, description, status } = req.body;

    await pool.request()
      .input('requestID', sql.Int, req.params.requestId)
      .input('requestType', sql.NVarChar, requestType)
      .input('registrationID', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, facilityName || null)
      .input('assignedToUserID', sql.Int, assignedToUserID || null)
      .input('scheduledDate', sql.DateTime, scheduledDate || null)
      .input('description', sql.NVarChar, description)
      .input('status', sql.NVarChar, status)
      .query(`UPDATE ServiceRequests SET RequestType=@requestType, RegistrationID=@registrationID,
              FacilityName=@facilityName, AssignedToUserID=@assignedToUserID, ScheduledDate=@scheduledDate,
              Description=@description, Status=@status, UpdatedAt=GETDATE() WHERE RequestID=@requestID`);

    res.json({ message: 'Service request updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/service-requests/:requestId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });

    await pool.request()
      .input('requestID', sql.Int, req.params.requestId)
      .query(`DELETE FROM ServiceRequests WHERE RequestID=@requestID`);

    res.json({ message: 'Service request deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SERVICE REQUEST FOLLOW-UP ENDPOINTS
// ============================================

// GET all follow-ups for a service request
app.get('/api/service-requests/:requestId/followups', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('requestID', sql.Int, req.params.requestId)
      .query(`SELECT * FROM ServiceRequestFollowUps
              WHERE RequestID = @requestID
              ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Followup fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST a new follow-up (also updates parent SR status)
app.post('/api/service-requests/:requestId/followups', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { statusChanged, note, updatedByUserID, updatedByName } = req.body;
    const requestId = req.params.requestId;

    // Insert follow-up record
    const result = await pool.request()
      .input('requestID',      sql.Int,      requestId)
      .input('statusChanged',  sql.NVarChar,  statusChanged || null)
      .input('note',           sql.NVarChar,  note || null)
      .input('updatedByUserID',sql.Int,       updatedByUserID || null)
      .input('updatedByName',  sql.NVarChar,  updatedByName || null)
      .query(`INSERT INTO ServiceRequestFollowUps
                (RequestID, StatusChanged, Note, UpdatedByUserID, UpdatedByName, CreatedAt)
              VALUES
                (@requestID, @statusChanged, @note, @updatedByUserID, @updatedByName, GETDATE());
              SELECT SCOPE_IDENTITY() AS FollowUpID`);

    // Update parent SR status + UpdatedAt
    if (statusChanged) {
      await pool.request()
        .input('requestID', sql.Int,     requestId)
        .input('status',    sql.NVarChar, statusChanged)
        .query(`UPDATE ServiceRequests SET Status=@status, UpdatedAt=GETDATE() WHERE RequestID=@requestID`);
    } else {
      await pool.request()
        .input('requestID', sql.Int, requestId)
        .query(`UPDATE ServiceRequests SET UpdatedAt=GETDATE() WHERE RequestID=@requestID`);
    }

    res.json({ message: 'Follow-up saved', FollowUpID: result.recordset[0].FollowUpID });
  } catch (err) {
    console.error('Followup save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CUSTOMER MOU ENDPOINTS
// ============================================
app.get('/api/customer-mou', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query(`SELECT cm.*,
                ISNULL(cm.FacilityName, cr.InstitutionName) AS CustomerName
              FROM CustomerMOU cm
              LEFT JOIN CustomerRegistrations cr ON cm.RegistrationID = cr.RegistrationID
              ORDER BY cm.CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer-mou', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, facilityName, startDate, endDate, contractValue, termsConditions, status } = req.body;

    let resolvedFacilityName = facilityName;
    if (registrationId) {
      const regResult = await pool.request()
        .input('regID', sql.Int, registrationId)
        .query(`SELECT InstitutionName FROM CustomerRegistrations WHERE RegistrationID = @regID`);
      if (regResult.recordset.length > 0) resolvedFacilityName = regResult.recordset[0].InstitutionName;
    }

    const mouCode = 'MOU-' + Date.now();
    const result = await pool.request()
      .input('mouCode', sql.NVarChar, mouCode)
      .input('registrationID', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, resolvedFacilityName || null)
      .input('startDate', sql.DateTime, startDate)
      .input('endDate', sql.DateTime, endDate)
      .input('contractValue', sql.Decimal(12, 2), contractValue || 0)
      .input('termsConditions', sql.NVarChar, termsConditions)
      .input('status', sql.NVarChar, status || 'Active')
      .query(`INSERT INTO CustomerMOU (MOUCode, RegistrationID, FacilityName, StartDate, EndDate, ContractValue, TermsConditions, Status, CreatedAt)
              VALUES (@mouCode, @registrationID, @facilityName, @startDate, @endDate, @contractValue, @termsConditions, @status, GETDATE())
              SELECT SCOPE_IDENTITY() as MOUID`);

    res.json({ message: 'MOU created', MOUID: result.recordset[0].MOUID, MOUCode: mouCode });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customer-mou/:mouId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, facilityName, startDate, endDate, contractValue, termsConditions, status } = req.body;

    await pool.request()
      .input('mouID', sql.Int, req.params.mouId)
      .input('registrationID', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, facilityName || null)
      .input('startDate', sql.DateTime, startDate)
      .input('endDate', sql.DateTime, endDate)
      .input('contractValue', sql.Decimal(12, 2), contractValue || 0)
      .input('termsConditions', sql.NVarChar, termsConditions)
      .input('status', sql.NVarChar, status)
      .query(`UPDATE CustomerMOU SET RegistrationID=@registrationID, FacilityName=@facilityName,
              StartDate=@startDate, EndDate=@endDate, ContractValue=@contractValue,
              TermsConditions=@termsConditions, Status=@status, UpdatedAt=GETDATE() WHERE MOUID=@mouID`);

    res.json({ message: 'MOU updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customer-mou/:mouId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });

    await pool.request()
      .input('mouID', sql.Int, req.params.mouId)
      .query(`DELETE FROM CustomerMOU WHERE MOUID=@mouID`);

    res.json({ message: 'MOU deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// FAILED REGISTRATIONS ENDPOINTS
// ============================================
app.get('/api/failed-registrations', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query(`SELECT * FROM FailedRegistrations ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/failed-registrations', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { customerID, facilityName, contactPerson, mobile, planName, amount, errorCode, failureReason, attemptedDate, status, chequeNo, chequeAmount, bankName, chequeDate } = req.body;

    const failureCode = 'FAIL-' + Date.now();
    const result = await pool.request()
      .input('failureCode', sql.NVarChar, failureCode)
      .input('customerID', sql.Int, customerID || null)
      .input('facilityName', sql.NVarChar, facilityName)
      .input('contactPerson', sql.NVarChar, contactPerson)
      .input('mobile', sql.NVarChar, mobile)
      .input('planName', sql.NVarChar, planName)
      .input('amount', sql.Decimal(10, 2), amount || 0)
      .input('errorCode', sql.NVarChar, errorCode)
      .input('failureReason', sql.NVarChar, failureReason)
      .input('attemptedDate', sql.DateTime, attemptedDate || new Date())
      .input('status', sql.NVarChar, status || 'Failed')
      .input('chequeNo', sql.NVarChar, chequeNo)
      .input('chequeAmount', sql.Decimal(10, 2), chequeAmount || 0)
      .input('bankName', sql.NVarChar, bankName)
      .input('chequeDate', sql.DateTime, chequeDate || null)
      .query(`INSERT INTO FailedRegistrations (FailureCode, CustomerID, FacilityName, ContactPerson, Mobile, PlanName, Amount,
              ErrorCode, FailureReason, AttemptedDate, Status, ChequeNo, ChequeAmount, BankName, ChequeDate, CreatedAt)
              VALUES (@failureCode, @customerID, @facilityName, @contactPerson, @mobile, @planName, @amount, @errorCode,
              @failureReason, @attemptedDate, @status, @chequeNo, @chequeAmount, @bankName, @chequeDate, GETDATE())
              SELECT SCOPE_IDENTITY() as FailureID`);

    res.json({ message: 'Failed registration recorded', FailureID: result.recordset[0].FailureID });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/failed-registrations/:failureId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { customerID, facilityName, contactPerson, mobile, planName, amount, errorCode, failureReason, status, chequeNo, chequeAmount, bankName, chequeDate } = req.body;

    await pool.request()
      .input('failureID', sql.Int, req.params.failureId)
      .input('customerID', sql.Int, customerID || null)
      .input('facilityName', sql.NVarChar, facilityName)
      .input('contactPerson', sql.NVarChar, contactPerson)
      .input('mobile', sql.NVarChar, mobile)
      .input('planName', sql.NVarChar, planName)
      .input('amount', sql.Decimal(10, 2), amount || 0)
      .input('errorCode', sql.NVarChar, errorCode)
      .input('failureReason', sql.NVarChar, failureReason)
      .input('status', sql.NVarChar, status)
      .input('chequeNo', sql.NVarChar, chequeNo)
      .input('chequeAmount', sql.Decimal(10, 2), chequeAmount || 0)
      .input('bankName', sql.NVarChar, bankName)
      .input('chequeDate', sql.DateTime, chequeDate || null)
      .query(`UPDATE FailedRegistrations SET CustomerID=@customerID, FacilityName=@facilityName,
              ContactPerson=@contactPerson, Mobile=@mobile, PlanName=@planName, Amount=@amount, ErrorCode=@errorCode,
              FailureReason=@failureReason, Status=@status, ChequeNo=@chequeNo, ChequeAmount=@chequeAmount,
              BankName=@bankName, ChequeDate=@chequeDate, UpdatedAt=GETDATE() WHERE FailureID=@failureID`);

    res.json({ message: 'Failed registration updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/failed-registrations/:failureId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });

    await pool.request()
      .input('failureID', sql.Int, req.params.failureId)
      .query(`DELETE FROM FailedRegistrations WHERE FailureID=@failureID`);

    res.json({ message: 'Failed registration deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CERTIFICATES ENDPOINTS
// ============================================
app.get('/api/certificates', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query(`SELECT cert.*,
                ISNULL(cert.FacilityName, cr.InstitutionName) AS CustomerName,
                cr.InstitutionType, cr.Zone, cr.Mobile AS RegMobile,
                cr.ContactPerson AS RegContact
              FROM Certificates cert
              LEFT JOIN CustomerRegistrations cr ON cert.RegistrationID = cr.RegistrationID
              ORDER BY cert.CreatedAt DESC`);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/certificates', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { certificateType, registrationId, facilityName, issueDate, validTill, notes, status } = req.body;

    if (!registrationId && !facilityName) {
      return res.status(400).json({ error: 'Registration or facility name required' });
    }

    const certificateCode = 'CERT-' + Date.now();

    // Get facility name from CustomerRegistrations if registrationId is provided
    let resolvedFacilityName = facilityName;
    if (registrationId) {
      const regResult = await pool.request()
        .input('regID', sql.Int, registrationId)
        .query(`SELECT InstitutionName FROM CustomerRegistrations WHERE RegistrationID = @regID`);
      if (regResult.recordset.length > 0) {
        resolvedFacilityName = regResult.recordset[0].InstitutionName;
      }
    }

    const result = await pool.request()
      .input('certificateCode', sql.NVarChar, certificateCode)
      .input('certificateType', sql.NVarChar, certificateType)
      .input('registrationID', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, resolvedFacilityName || null)
      .input('issueDate', sql.DateTime, issueDate)
      .input('validTill', sql.DateTime, validTill)
      .input('notes', sql.NVarChar, notes || null)
      .input('status', sql.NVarChar, status || 'Active')
      .query(`INSERT INTO Certificates (CertificateCode, CertificateType, RegistrationID, FacilityName, IssueDate, ValidTill, Notes, Status, CreatedAt)
              VALUES (@certificateCode, @certificateType, @registrationID, @facilityName, @issueDate, @validTill, @notes, @status, GETDATE())
              SELECT SCOPE_IDENTITY() as CertificateID`);

    res.json({ message: 'Certificate created', CertificateID: result.recordset[0].CertificateID, CertificateCode: certificateCode });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/certificates/:certificateId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { certificateType, issueDate, validTill, notes, status } = req.body;

    await pool.request()
      .input('certificateID', sql.Int, req.params.certificateId)
      .input('certificateType', sql.NVarChar, certificateType)
      .input('issueDate', sql.DateTime, issueDate)
      .input('validTill', sql.DateTime, validTill)
      .input('notes', sql.NVarChar, notes || null)
      .input('status', sql.NVarChar, status)
      .query(`UPDATE Certificates SET CertificateType=@certificateType, IssueDate=@issueDate,
              ValidTill=@validTill, Notes=@notes, Status=@status, UpdatedAt=GETDATE()
              WHERE CertificateID=@certificateID`);

    res.json({ message: 'Certificate updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/certificates/:certificateId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });

    await pool.request()
      .input('certificateID', sql.Int, req.params.certificateId)
      .query(`DELETE FROM Certificates WHERE CertificateID=@certificateID`);

    res.json({ message: 'Certificate deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CUSTOMER REGISTRATIONS ENDPOINTS
// ============================================
app.get('/api/customer-registrations', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .query(`SELECT * FROM CustomerRegistrations
              ORDER BY CreatedAt DESC`);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer-registrations', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });

    const {
      institutionName, institutionType, numberOfBeds, bmwRegNo, fullAddress, zone, pincode,
      contactPerson, designation, mobile, email, alternateMobile, website,
      panNumber, gstNumber,
      gpsLatitude, gpsLongitude, gpsAddress,
      selectedPlan, billingCycle, contractStartDate, contractDuration, paymentModePref,
      paymentMethod, documents,
      // new fields from landing page wizard
      category, subCategory, route, kit, consulting, compliance,
      customerId, txnId, regFee, svcFee, totalAmount, payMode
    } = req.body;

    const registrationCode = customerId || ('REG-' + Date.now());

    const result = await pool.request()
      .input('registrationCode', sql.NVarChar, registrationCode)
      .input('institutionName', sql.NVarChar, institutionName)
      .input('institutionType', sql.NVarChar, institutionType || null)
      .input('numberOfBeds', sql.Int, numberOfBeds || null)
      .input('bmwRegNo', sql.NVarChar, bmwRegNo || null)
      .input('fullAddress', sql.NVarChar, fullAddress || null)
      .input('zone', sql.NVarChar, zone || null)
      .input('pincode', sql.NVarChar, pincode || null)
      .input('contactPerson', sql.NVarChar, contactPerson || null)
      .input('designation', sql.NVarChar, designation || null)
      .input('mobile', sql.NVarChar, mobile || null)
      .input('email', sql.NVarChar, email || null)
      .input('alternateMobile', sql.NVarChar, alternateMobile || null)
      .input('website', sql.NVarChar, website || null)
      .input('panNumber', sql.NVarChar, panNumber || null)
      .input('gstNumber', sql.NVarChar, gstNumber || null)
      .input('gpsLatitude', sql.Decimal(10, 8), gpsLatitude || null)
      .input('gpsLongitude', sql.Decimal(11, 8), gpsLongitude || null)
      .input('gpsAddress', sql.NVarChar, gpsAddress || null)
      .input('selectedPlan', sql.NVarChar, selectedPlan || null)
      .input('billingCycle', sql.NVarChar, billingCycle || null)
      .input('contractStartDate', sql.DateTime, contractStartDate || null)
      .input('contractDuration', sql.Int, contractDuration || null)
      .input('paymentModePreference', sql.NVarChar, paymentModePref || null)
      .input('paymentMethod', sql.NVarChar, paymentMethod || null)
      .input('category', sql.NVarChar, category || null)
      .input('subCategory', sql.NVarChar, subCategory || null)
      .input('route', sql.NVarChar, route || null)
      .input('kit', sql.NVarChar, kit || null)
      .input('consulting', sql.NVarChar, consulting != null ? String(consulting) : null)
      .input('compliance', sql.NVarChar, compliance != null ? String(compliance) : null)
      .input('customerId', sql.NVarChar, customerId || null)
      .input('txnId', sql.NVarChar, txnId || null)
      .input('regFee', sql.Decimal(12,2), regFee || null)
      .input('svcFee', sql.Decimal(12,2), svcFee || null)
      .input('totalAmount', sql.Decimal(12,2), totalAmount || null)
      .input('payMode', sql.NVarChar, payMode || null)
      .input('status', sql.NVarChar, 'Pending')
      .query(`INSERT INTO CustomerRegistrations
              (RegistrationCode, InstitutionName, InstitutionType, NumberOfBeds, BMWRegNo, FullAddress, Zone, Pincode,
               ContactPerson, Designation, Mobile, Email, AlternateMobile, Website, PANNumber, GSTNumber,
               GPSLatitude, GPSLongitude, GPSAddress, SelectedPlan, BillingCycle, ContractStartDate,
               ContractDuration, PaymentModePreference, PaymentMethod,
               Category, SubCategory, Route, Kit, Consulting, Compliance,
               CustomerID, TxnID, RegFee, SvcFee, TotalAmount, PayMode,
               Status, CreatedAt)
              VALUES (@registrationCode, @institutionName, @institutionType, @numberOfBeds, @bmwRegNo, @fullAddress, @zone, @pincode,
                      @contactPerson, @designation, @mobile, @email, @alternateMobile, @website, @panNumber, @gstNumber,
                      @gpsLatitude, @gpsLongitude, @gpsAddress, @selectedPlan, @billingCycle, @contractStartDate,
                      @contractDuration, @paymentModePreference, @paymentMethod,
                      @category, @subCategory, @route, @kit, @consulting, @compliance,
                      @customerId, @txnId, @regFee, @svcFee, @totalAmount, @payMode,
                      @status, GETDATE())
              SELECT SCOPE_IDENTITY() as RegistrationID`);

    const registrationId = result.recordset[0].RegistrationID;
    res.json({ message: 'Registration created', RegistrationID: registrationId, RegistrationCode: registrationCode });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customer-registrations/:registrationId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { status, approvedBy } = req.body;

    const query = approvedBy
      ? `UPDATE CustomerRegistrations SET Status=@status, ApprovedBy=@approvedBy, ApprovedDate=GETDATE(), UpdatedAt=GETDATE() WHERE RegistrationID=@registrationID`
      : `UPDATE CustomerRegistrations SET Status=@status, UpdatedAt=GETDATE() WHERE RegistrationID=@registrationID`;

    const request = pool.request()
      .input('registrationID', sql.Int, req.params.registrationId)
      .input('status', sql.NVarChar, status);

    if (approvedBy) {
      request.input('approvedBy', sql.Int, approvedBy);
    }

    await request.query(query);
    res.json({ message: 'Registration updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customer-registrations/:registrationId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });

    await pool.request()
      .input('registrationID', sql.Int, req.params.registrationId)
      .query(`DELETE FROM CustomerRegistrationDocuments WHERE RegistrationID=@registrationID;
              DELETE FROM CustomerRegistrations WHERE RegistrationID=@registrationID`);

    res.json({ message: 'Registration deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HCF MASTER ENDPOINTS
// ============================================

// GET /api/hcf-master — list CustomerRegistrations with doc/contact counts
app.get('/api/hcf-master', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request().query(`
      SELECT cr.*,
        (SELECT COUNT(*) FROM HCFDocuments d WHERE d.RegistrationID = cr.RegistrationID) AS DocCount,
        (SELECT COUNT(*) FROM HCFContacts c WHERE c.RegistrationID = cr.RegistrationID) AS ContactCount
      FROM CustomerRegistrations cr
      ORDER BY cr.CreatedAt DESC
    `);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error('HCF Master fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-master/:id/state — update lifecycle state
app.put('/api/hcf-master/:id/state', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { state } = req.body;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('state', sql.NVarChar, state)
      .query(`UPDATE CustomerRegistrations SET Status=@state, UpdatedAt=GETDATE() WHERE RegistrationID=@id`);
    res.json({ message: 'State updated' });
  } catch (err) {
    console.error('HCF state update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HCF DOCUMENTS ENDPOINTS
// ============================================

// GET /api/hcf-documents?registrationId=X
app.get('/api/hcf-documents', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId } = req.query;
    let query = `SELECT * FROM HCFDocuments`;
    const req2 = pool.request();
    if (registrationId) {
      query += ` WHERE RegistrationID=@registrationId`;
      req2.input('registrationId', sql.Int, parseInt(registrationId));
    }
    query += ` ORDER BY CreatedAt DESC`;
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('HCF Documents fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hcf-documents
app.post('/api/hcf-documents', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, documentType, version, expiryDate, uploadedBy, remarks } = req.body;
    const result = await pool.request()
      .input('registrationId', sql.Int, registrationId || null)
      .input('documentType', sql.NVarChar, documentType || null)
      .input('version', sql.NVarChar, version || null)
      .input('expiryDate', sql.Date, expiryDate || null)
      .input('uploadedBy', sql.NVarChar, uploadedBy || null)
      .input('remarks', sql.NVarChar, remarks || null)
      .query(`INSERT INTO HCFDocuments (RegistrationID, DocumentType, Version, ExpiryDate, UploadedBy, Remarks, CreatedAt)
              VALUES (@registrationId, @documentType, @version, @expiryDate, @uploadedBy, @remarks, GETDATE());
              SELECT SCOPE_IDENTITY() AS DocID`);
    res.status(201).json({ message: 'Document added', docId: result.recordset[0].DocID });
  } catch (err) {
    console.error('HCF Document insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hcf-documents/:docId
app.delete('/api/hcf-documents/:docId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('docId', sql.Int, req.params.docId)
      .query(`DELETE FROM HCFDocuments WHERE DocID=@docId`);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    console.error('HCF Document delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HCF CONTACTS ENDPOINTS
// ============================================

// GET /api/hcf-contacts?registrationId=X
app.get('/api/hcf-contacts', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId } = req.query;
    let query = `SELECT * FROM HCFContacts`;
    const req2 = pool.request();
    if (registrationId) {
      query += ` WHERE RegistrationID=@registrationId`;
      req2.input('registrationId', sql.Int, parseInt(registrationId));
    }
    query += ` ORDER BY IsPrimary DESC, CreatedAt DESC`;
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('HCF Contacts fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hcf-contacts
app.post('/api/hcf-contacts', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, contactName, designation, mobile, email, isPrimary } = req.body;
    const result = await pool.request()
      .input('registrationId', sql.Int, registrationId || null)
      .input('contactName', sql.NVarChar, contactName || null)
      .input('designation', sql.NVarChar, designation || null)
      .input('mobile', sql.NVarChar, mobile || null)
      .input('email', sql.NVarChar, email || null)
      .input('isPrimary', sql.Bit, isPrimary ? 1 : 0)
      .query(`INSERT INTO HCFContacts (RegistrationID, ContactName, Designation, Mobile, Email, IsPrimary, CreatedAt)
              VALUES (@registrationId, @contactName, @designation, @mobile, @email, @isPrimary, GETDATE());
              SELECT SCOPE_IDENTITY() AS ContactID`);
    res.status(201).json({ message: 'Contact added', contactId: result.recordset[0].ContactID });
  } catch (err) {
    console.error('HCF Contact insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hcf-contacts/:contactId
app.delete('/api/hcf-contacts/:contactId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('contactId', sql.Int, req.params.contactId)
      .query(`DELETE FROM HCFContacts WHERE ContactID=@contactId`);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    console.error('HCF Contact delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HCF APPROVALS ENDPOINTS
// ============================================

const APPROVAL_STAGES = ['RM Raises', 'Branch Head', 'Reg. Dept', 'Accounts', 'Material', 'Transport', 'RM Welcome'];

// GET /api/hcf-approvals
app.get('/api/hcf-approvals', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request().query(`SELECT * FROM HCFApprovals ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('HCF Approvals fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hcf-approvals
app.post('/api/hcf-approvals', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, facilityName, zone, category, raisedBy, monthlyAmount } = req.body;
    const result = await pool.request()
      .input('registrationId', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, facilityName || null)
      .input('zone', sql.NVarChar, zone || null)
      .input('category', sql.NVarChar, category || null)
      .input('raisedBy', sql.NVarChar, raisedBy || null)
      .input('monthlyAmount', sql.Decimal(12,2), monthlyAmount || 0)
      .query(`INSERT INTO HCFApprovals (RegistrationID, FacilityName, Zone, Category, RaisedBy, MonthlyAmount, CurrentStage, Status, CreatedAt, UpdatedAt)
              VALUES (@registrationId, @facilityName, @zone, @category, @raisedBy, @monthlyAmount, 'RM Raises', 'Pending', GETDATE(), GETDATE());
              SELECT SCOPE_IDENTITY() AS ApprovalID`);
    res.status(201).json({ message: 'Approval created', approvalId: result.recordset[0].ApprovalID });
  } catch (err) {
    console.error('HCF Approval insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-approvals/:id/action
app.put('/api/hcf-approvals/:id/action', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { action, remarks, stage } = req.body;
    const approvalId = req.params.id;

    if (action === 'approve') {
      // Get current stage and advance to next
      const current = await pool.request()
        .input('id', sql.Int, approvalId)
        .query(`SELECT CurrentStage FROM HCFApprovals WHERE ApprovalID=@id`);
      if (current.recordset.length === 0) return res.status(404).json({ error: 'Approval not found' });
      const currentStage = current.recordset[0].CurrentStage;
      const currentIdx = APPROVAL_STAGES.indexOf(currentStage);
      const nextStage = currentIdx >= 0 && currentIdx < APPROVAL_STAGES.length - 1
        ? APPROVAL_STAGES[currentIdx + 1]
        : currentStage;
      const newStatus = currentIdx >= APPROVAL_STAGES.length - 1 ? 'Approved' : 'Pending';
      await pool.request()
        .input('id', sql.Int, approvalId)
        .input('nextStage', sql.NVarChar, nextStage)
        .input('status', sql.NVarChar, newStatus)
        .input('remarks', sql.NVarChar, remarks || null)
        .query(`UPDATE HCFApprovals SET CurrentStage=@nextStage, Status=@status, Remarks=@remarks, UpdatedAt=GETDATE() WHERE ApprovalID=@id`);
    } else if (action === 'reject') {
      await pool.request()
        .input('id', sql.Int, approvalId)
        .input('remarks', sql.NVarChar, remarks || null)
        .query(`UPDATE HCFApprovals SET Status='Rejected', Remarks=@remarks, UpdatedAt=GETDATE() WHERE ApprovalID=@id`);
    } else if (action === 'sendback') {
      await pool.request()
        .input('id', sql.Int, approvalId)
        .input('remarks', sql.NVarChar, remarks || null)
        .query(`UPDATE HCFApprovals SET Status='Sent Back', Remarks=@remarks, UpdatedAt=GETDATE() WHERE ApprovalID=@id`);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use approve, reject, or sendback' });
    }

    res.json({ message: `Approval action '${action}' applied` });
  } catch (err) {
    console.error('HCF Approval action error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hcf-approvals/:id
app.delete('/api/hcf-approvals/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`DELETE FROM HCFApprovals WHERE ApprovalID=@id`);
    res.json({ message: 'Approval deleted' });
  } catch (err) {
    console.error('HCF Approval delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HCF RENEWALS ENDPOINTS
// ============================================

// GET /api/hcf-renewals
app.get('/api/hcf-renewals', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request().query(`SELECT * FROM HCFRenewals ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('HCF Renewals fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hcf-renewals
app.post('/api/hcf-renewals', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, facilityName, zone, renewalDate } = req.body;
    const result = await pool.request()
      .input('registrationId', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, facilityName || null)
      .input('zone', sql.NVarChar, zone || null)
      .input('renewalDate', sql.Date, renewalDate || null)
      .query(`INSERT INTO HCFRenewals (RegistrationID, FacilityName, Zone, RenewalDate, Status, CreatedAt, UpdatedAt)
              VALUES (@registrationId, @facilityName, @zone, @renewalDate, 'Pending', GETDATE(), GETDATE());
              SELECT SCOPE_IDENTITY() AS RenewalID`);
    res.status(201).json({ message: 'Renewal created', renewalId: result.recordset[0].RenewalID });
  } catch (err) {
    console.error('HCF Renewal insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-renewals/:id/remind — set LastReminded=GETDATE()
app.put('/api/hcf-renewals/:id/remind', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`UPDATE HCFRenewals SET LastReminded=GETDATE(), UpdatedAt=GETDATE() WHERE RenewalID=@id`);
    res.json({ message: 'Reminder sent' });
  } catch (err) {
    console.error('HCF Renewal remind error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-renewals/:id/renew — set Status='Renewed', advance RenewalDate by +1 year
app.put('/api/hcf-renewals/:id/renew', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`UPDATE HCFRenewals SET Status='Renewed', RenewalDate=DATEADD(year,1,RenewalDate), UpdatedAt=GETDATE() WHERE RenewalID=@id`);
    res.json({ message: 'Renewal completed' });
  } catch (err) {
    console.error('HCF Renewal renew error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-renewals/:id — update fields
app.put('/api/hcf-renewals/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { autoRenew, mouReSigned, renewalDate } = req.body;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('autoRenew', sql.Bit, autoRenew ? 1 : 0)
      .input('mouReSigned', sql.Bit, mouReSigned ? 1 : 0)
      .input('renewalDate', sql.Date, renewalDate || null)
      .query(`UPDATE HCFRenewals SET AutoRenew=@autoRenew, MoUReSigned=@mouReSigned, RenewalDate=@renewalDate, UpdatedAt=GETDATE() WHERE RenewalID=@id`);
    res.json({ message: 'Renewal updated' });
  } catch (err) {
    console.error('HCF Renewal update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hcf-renewals/:id
app.delete('/api/hcf-renewals/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`DELETE FROM HCFRenewals WHERE RenewalID=@id`);
    res.json({ message: 'Renewal deleted' });
  } catch (err) {
    console.error('HCF Renewal delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HCF DEREGISTRATIONS ENDPOINTS
// ============================================

// GET /api/hcf-deregistrations
app.get('/api/hcf-deregistrations', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request().query(`SELECT * FROM HCFDeregistrations ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('HCF Deregistrations fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hcf-deregistrations
app.post('/api/hcf-deregistrations', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { registrationId, facilityName, zone, reason, outstanding } = req.body;
    const result = await pool.request()
      .input('registrationId', sql.Int, registrationId || null)
      .input('facilityName', sql.NVarChar, facilityName || null)
      .input('zone', sql.NVarChar, zone || null)
      .input('reason', sql.NVarChar, reason || null)
      .input('outstanding', sql.Decimal(12,2), outstanding || 0)
      .query(`INSERT INTO HCFDeregistrations (RegistrationID, FacilityName, Zone, Reason, Outstanding, Stage, CreatedAt, UpdatedAt)
              VALUES (@registrationId, @facilityName, @zone, @reason, @outstanding, 'Awaiting Accounts', GETDATE(), GETDATE());
              SELECT SCOPE_IDENTITY() AS DeregID`);
    res.status(201).json({ message: 'Deregistration created', deregId: result.recordset[0].DeregID });
  } catch (err) {
    console.error('HCF Deregistration insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hcf-deregistrations/:id
app.get('/api/hcf-deregistrations/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT * FROM HCFDeregistrations WHERE DeregID=@id`);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Deregistration not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('HCF Deregistration fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-deregistrations/:id — update checklist fields + stage + remarks
app.put('/api/hcf-deregistrations/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const {
      stage, remarks,
      letterheadReceived, certReturned, agreementReturned,
      outstandingCleared, kitReturned, hologramClosed, outstanding
    } = req.body;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('stage', sql.NVarChar, stage || null)
      .input('remarks', sql.NVarChar, remarks || null)
      .input('letterheadReceived', sql.Bit, letterheadReceived ? 1 : 0)
      .input('certReturned', sql.Bit, certReturned ? 1 : 0)
      .input('agreementReturned', sql.Bit, agreementReturned ? 1 : 0)
      .input('outstandingCleared', sql.Bit, outstandingCleared ? 1 : 0)
      .input('kitReturned', sql.Bit, kitReturned ? 1 : 0)
      .input('hologramClosed', sql.Bit, hologramClosed ? 1 : 0)
      .input('outstanding', sql.Decimal(12,2), outstanding || 0)
      .query(`UPDATE HCFDeregistrations SET
                Stage=ISNULL(@stage, Stage),
                Remarks=ISNULL(@remarks, Remarks),
                LetterheadReceived=@letterheadReceived,
                CertReturned=@certReturned,
                AgreementReturned=@agreementReturned,
                OutstandingCleared=@outstandingCleared,
                KitReturned=@kitReturned,
                HologramClosed=@hologramClosed,
                Outstanding=@outstanding,
                UpdatedAt=GETDATE()
              WHERE DeregID=@id`);
    res.json({ message: 'Deregistration updated' });
  } catch (err) {
    console.error('HCF Deregistration update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hcf-deregistrations/:id/action — approve or reject
app.put('/api/hcf-deregistrations/:id/action', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { action, remarks } = req.body;
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Invalid action. Use approve or reject' });
    }
    const newStage = action === 'approve' ? 'Approved' : 'Rejected';
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('stage', sql.NVarChar, newStage)
      .input('remarks', sql.NVarChar, remarks || null)
      .query(`UPDATE HCFDeregistrations SET Stage=@stage, Remarks=ISNULL(@remarks, Remarks), UpdatedAt=GETDATE() WHERE DeregID=@id`);
    res.json({ message: `Deregistration ${action}d` });
  } catch (err) {
    console.error('HCF Deregistration action error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hcf-deregistrations/:id
app.delete('/api/hcf-deregistrations/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`DELETE FROM HCFDeregistrations WHERE DeregID=@id`);
    res.json({ message: 'Deregistration deleted' });
  } catch (err) {
    console.error('HCF Deregistration delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SUPPORT TICKETS ENDPOINTS
// ============================================

// GET /api/support-tickets
app.get('/api/support-tickets', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { status, category, priority } = req.query;
    let query = `SELECT * FROM HCFSupportTickets WHERE 1=1`;
    const req2 = pool.request();
    if (status) { query += ` AND Status=@status`; req2.input('status', sql.NVarChar, status); }
    if (category) { query += ` AND Category=@category`; req2.input('category', sql.NVarChar, category); }
    if (priority) { query += ` AND Priority=@priority`; req2.input('priority', sql.NVarChar, priority); }
    query += ` ORDER BY CreatedAt DESC`;
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Support Tickets fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/support-tickets
app.post('/api/support-tickets', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const {
      registrationId, hcfName, zone, route, category, priority,
      subject, description, assignedTo, dueDate, notifyBM, bmName
    } = req.body;
    const ticketCode = 'TKT-' + Date.now();
    const result = await pool.request()
      .input('ticketCode', sql.NVarChar, ticketCode)
      .input('registrationId', sql.Int, registrationId || null)
      .input('hcfName', sql.NVarChar, hcfName || null)
      .input('zone', sql.NVarChar, zone || null)
      .input('route', sql.NVarChar, route || null)
      .input('category', sql.NVarChar, category || null)
      .input('priority', sql.NVarChar, priority || 'Medium')
      .input('subject', sql.NVarChar, subject || null)
      .input('description', sql.NVarChar, description || null)
      .input('assignedTo', sql.NVarChar, assignedTo || null)
      .input('dueDate', sql.Date, dueDate || null)
      .input('notifyBM', sql.Bit, notifyBM ? 1 : 0)
      .input('bmName', sql.NVarChar, bmName || null)
      .query(`INSERT INTO HCFSupportTickets
                (TicketCode, RegistrationID, HCFName, Zone, Route, Category, Priority, Subject, Description,
                 AssignedTo, Status, DueDate, NotifyBM, BMName, CreatedAt, UpdatedAt)
              VALUES
                (@ticketCode, @registrationId, @hcfName, @zone, @route, @category, @priority, @subject, @description,
                 @assignedTo, 'Open', @dueDate, @notifyBM, @bmName, GETDATE(), GETDATE());
              SELECT SCOPE_IDENTITY() AS TicketID`);
    res.status(201).json({ message: 'Ticket created', ticketId: result.recordset[0].TicketID, ticketCode });
  } catch (err) {
    console.error('Support Ticket insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/support-tickets/:id
app.put('/api/support-tickets/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { status, resolution, assignedTo, priority } = req.body;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar, status || null)
      .input('resolution', sql.NVarChar, resolution || null)
      .input('assignedTo', sql.NVarChar, assignedTo || null)
      .input('priority', sql.NVarChar, priority || null)
      .query(`UPDATE HCFSupportTickets SET
                Status=ISNULL(@status, Status),
                Resolution=ISNULL(@resolution, Resolution),
                AssignedTo=ISNULL(@assignedTo, AssignedTo),
                Priority=ISNULL(@priority, Priority),
                UpdatedAt=GETDATE()
              WHERE TicketID=@id`);
    res.json({ message: 'Ticket updated' });
  } catch (err) {
    console.error('Support Ticket update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/support-tickets/:id
app.delete('/api/support-tickets/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`DELETE FROM HCFSupportTickets WHERE TicketID=@id`);
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    console.error('Support Ticket delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CATEGORY MASTER ENDPOINTS
// ============================================

// GET /api/categories — returns categories with their sub-categories as nested array
app.get('/api/categories', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const catRes = await pool.request()
      .query(`SELECT * FROM CategoryMaster WHERE IsActive=1 ORDER BY CategoryName`);
    const subRes = await pool.request()
      .query(`SELECT * FROM SubCategoryMaster WHERE IsActive=1 ORDER BY SubCategoryName`);
    const categories = catRes.recordset.map(cat => ({
      ...cat,
      SubCategories: subRes.recordset.filter(s => s.CategoryID === cat.CategoryID)
    }));
    res.json(categories);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subcategories?categoryId=X — filtered sub-categories for a given category
app.get('/api/subcategories', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { categoryId } = req.query;
    let query = `SELECT * FROM SubCategoryMaster WHERE IsActive=1`;
    if (categoryId) query += ` AND CategoryID=@categoryId`;
    query += ` ORDER BY SubCategoryName`;
    const req2 = pool.request();
    if (categoryId) req2.input('categoryId', sql.Int, parseInt(categoryId));
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories — create category + optional sub-categories in one call
app.post('/api/categories', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { categoryName, subCategories } = req.body;
    if (!categoryName) return res.status(400).json({ error: 'Category Name is required' });

    const catResult = await pool.request()
      .input('categoryName', sql.NVarChar, categoryName)
      .query(`INSERT INTO CategoryMaster (CategoryName, IsActive, CreatedAt, UpdatedAt)
              VALUES (@categoryName, 1, GETDATE(), GETDATE());
              SELECT SCOPE_IDENTITY() AS CategoryID`);
    const newCategoryId = catResult.recordset[0].CategoryID;

    if (Array.isArray(subCategories) && subCategories.length > 0) {
      for (const sub of subCategories) {
        const subName = typeof sub === 'string' ? sub.trim() : (sub.name || '').trim();
        if (!subName) continue;
        await pool.request()
          .input('categoryId', sql.Int, newCategoryId)
          .input('subCategoryName', sql.NVarChar, subName)
          .query(`INSERT INTO SubCategoryMaster (CategoryID, SubCategoryName, IsActive, CreatedAt, UpdatedAt)
                  VALUES (@categoryId, @subCategoryName, 1, GETDATE(), GETDATE())`);
      }
    }

    res.status(201).json({ message: 'Category created', CategoryID: newCategoryId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id — update category name; replace sub-categories
app.put('/api/categories/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { categoryName, subCategories } = req.body;
    const categoryId = parseInt(req.params.id);

    await pool.request()
      .input('categoryId', sql.Int, categoryId)
      .input('categoryName', sql.NVarChar, categoryName)
      .query(`UPDATE CategoryMaster SET CategoryName=@categoryName, UpdatedAt=GETDATE() WHERE CategoryID=@categoryId`);

    // Soft-delete all existing sub-categories, then insert the new list
    await pool.request()
      .input('categoryId', sql.Int, categoryId)
      .query(`UPDATE SubCategoryMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE CategoryID=@categoryId`);

    if (Array.isArray(subCategories) && subCategories.length > 0) {
      for (const sub of subCategories) {
        const subName = typeof sub === 'string' ? sub.trim() : (sub.name || '').trim();
        if (!subName) continue;
        await pool.request()
          .input('categoryId', sql.Int, categoryId)
          .input('subCategoryName', sql.NVarChar, subName)
          .query(`INSERT INTO SubCategoryMaster (CategoryID, SubCategoryName, IsActive, CreatedAt, UpdatedAt)
                  VALUES (@categoryId, @subCategoryName, 1, GETDATE(), GETDATE())`);
      }
    }

    res.json({ message: 'Category updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id — soft delete category + sub-categories
app.delete('/api/categories/:id', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const categoryId = parseInt(req.params.id);
    await pool.request()
      .input('categoryId', sql.Int, categoryId)
      .query(`UPDATE SubCategoryMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE CategoryID=@categoryId;
              UPDATE CategoryMaster SET IsActive=0, UpdatedAt=GETDATE() WHERE CategoryID=@categoryId`);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Explicit OPTIONS handler for CORS preflight requests
app.options('*', cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// CUSTOMER PORTAL ENDPOINTS
// ============================================

// PUT /api/customer-registrations/:id/enable-portal
app.put('/api/customer-registrations/:id/enable-portal', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { pin } = req.body;
    if (!pin || pin.length !== 6) return res.status(400).json({ error: 'PIN must be exactly 6 digits' });
    const result = await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .input('pin', sql.NVarChar, pin)
      .query(`UPDATE CustomerRegistrations SET PortalEnabled=1, PortalPin=@pin, UpdatedAt=GETDATE() WHERE RegistrationID=@id;
              SELECT CustomerID FROM CustomerRegistrations WHERE RegistrationID=@id`);
    const customerId = result.recordset[0] ? result.recordset[0].CustomerID : null;
    res.json({ success: true, message: 'Portal access enabled', customerId, pin });
  } catch (err) {
    console.error('Enable portal error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/portal/login
app.post('/api/portal/login', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { customerId, pin } = req.body;
    if (!customerId || !pin) return res.status(400).json({ error: 'CustomerID and PIN required' });
    const result = await pool.request()
      .input('customerId', sql.NVarChar, customerId.trim())
      .input('pin', sql.NVarChar, pin.trim())
      .query(`SELECT RegistrationID, InstitutionName, CustomerID, Zone, Route, Mobile, Email, ContactPerson, Status, PortalEnabled, CreatedAt
              FROM CustomerRegistrations
              WHERE CustomerID=@customerId AND PortalEnabled=1 AND PortalPin=@pin`);
    if (!result.recordset.length) {
      return res.status(401).json({ success: false, message: 'Invalid Member ID or PIN, or portal not enabled' });
    }
    res.json({ success: true, customer: result.recordset[0] });
  } catch (err) {
    console.error('Portal login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portal/customer/:registrationId
app.get('/api/portal/customer/:registrationId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('id', sql.Int, parseInt(req.params.registrationId))
      .query(`SELECT * FROM CustomerRegistrations WHERE RegistrationID=@id`);
    if (!result.recordset.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Portal customer fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portal/pickups/:registrationId
app.get('/api/portal/pickups/:registrationId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    // Try HCFDocuments first for pickup data
    let pickups = [];
    try {
      const result = await pool.request()
        .input('id', sql.Int, parseInt(req.params.registrationId))
        .query(`SELECT * FROM HCFDocuments WHERE RegistrationID=@id ORDER BY CreatedAt DESC`);
      pickups = result.recordset;
    } catch(e) {}
    // Return mock data if empty so portal always shows something
    if (!pickups.length) {
      pickups = [
        { id: 1, date: '2026-05-02', status: 'Collected', driver: 'Raju Kumar', vehicle: 'UK-14-1234', manifest: 'MNF-2026-0501', totalKg: 4.8, yellowBag: 2, redBag: 1, sharps: 1 },
        { id: 2, date: '2026-04-18', status: 'Missed', driver: null, vehicle: null, manifest: null, totalKg: 0, yellowBag: 0, redBag: 0, sharps: 0 },
        { id: 3, date: '2026-04-25', status: 'Collected', driver: 'Mohan Singh', vehicle: 'UK-14-5678', manifest: 'MNF-2026-0445', totalKg: 3.9, yellowBag: 2, redBag: 1, sharps: 0 },
      ];
    }
    res.json(pickups);
  } catch (err) {
    console.error('Portal pickups error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portal/bills/:registrationId
app.get('/api/portal/bills/:registrationId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    // Return mock billing data (no billing table exists yet)
    const bills = [
      { id: 1, month: 'May 2026', invoiceNo: 'INV-2026-0512', dueDate: '2026-05-10', amount: 2950, status: 'Overdue' },
      { id: 2, month: 'Apr 2026', invoiceNo: 'INV-2026-0412', dueDate: '2026-04-10', amount: 2950, status: 'Overdue' },
      { id: 3, month: 'Mar 2026', invoiceNo: 'INV-2026-0310', dueDate: '2026-03-10', amount: 2950, status: 'Paid', paidDate: '2026-03-08' },
      { id: 4, month: 'Feb 2026', invoiceNo: 'INV-2026-0210', dueDate: '2026-02-10', amount: 2950, status: 'Paid', paidDate: '2026-02-12' },
    ];
    res.json(bills);
  } catch (err) {
    console.error('Portal bills error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portal/tickets/:registrationId
app.get('/api/portal/tickets/:registrationId', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const result = await pool.request()
      .input('id', sql.Int, parseInt(req.params.registrationId))
      .query(`SELECT * FROM HCFSupportTickets WHERE RegistrationID=@id ORDER BY CreatedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Portal tickets error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/portal/tickets
app.post('/api/portal/tickets', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database not ready' });
    const { RegistrationID, HCFName, Category, Priority, Subject, Description, AssignedTo } = req.body;
    const ticketCode = 'TKT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000);
    const result = await pool.request()
      .input('regId', sql.Int, RegistrationID || null)
      .input('hcfName', sql.NVarChar, HCFName || null)
      .input('category', sql.NVarChar, Category || null)
      .input('priority', sql.NVarChar, Priority || 'Medium')
      .input('subject', sql.NVarChar, Subject || null)
      .input('description', sql.NVarChar, Description || null)
      .input('assignedTo', sql.NVarChar, AssignedTo || 'Support Team')
      .input('ticketCode', sql.NVarChar, ticketCode)
      .query(`INSERT INTO HCFSupportTickets (RegistrationID, HCFName, Category, Priority, Subject, Description, AssignedTo, TicketCode, Status, CreatedAt)
              VALUES (@regId, @hcfName, @category, @priority, @subject, @description, @assignedTo, @ticketCode, 'Open', GETDATE());
              SELECT SCOPE_IDENTITY() AS TicketID`);
    const newId = result.recordset[0].TicketID;
    res.json({ success: true, ticketId: newId, ticketCode });
  } catch (err) {
    console.error('Portal ticket create error:', err);
    res.status(500).json({ error: err.message });
  }
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
