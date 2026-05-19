-- Customer Portal Tables for MPCC System
-- Execute this script to create customer-related tables

-- ===== CUSTOMERS TABLE =====
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY IDENTITY(1,1),
    InstitutionName VARCHAR(200) NOT NULL,
    ContactPerson VARCHAR(100),
    Email VARCHAR(100),
    MobileNo VARCHAR(20),
    Address VARCHAR(300),
    Zone VARCHAR(100),
    Route VARCHAR(100),
    ServicePlan VARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== CUSTOMER SUBSCRIPTIONS TABLE =====
CREATE TABLE CustomerSubscriptions (
    SubscriptionID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT NOT NULL,
    PlanID INT,
    StartDate DATETIME,
    EndDate DATETIME,
    MonthlyCharges DECIMAL(10, 2),
    PaymentFrequency VARCHAR(50), -- Monthly, Quarterly, Half-Yearly, Yearly
    RegistrationCharges DECIMAL(10, 2),
    ConsultingFees DECIMAL(10, 2),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (PlanID) REFERENCES ServicePlans(PlanID)
);

-- ===== PICKUPS/COLLECTIONS TABLE =====
CREATE TABLE Pickups (
    PickupID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT NOT NULL,
    PickupDate DATETIME,
    YellowBagCount INT DEFAULT 0,
    RedBagCount INT DEFAULT 0,
    GreenBagCount INT DEFAULT 0,
    BlackBagCount INT DEFAULT 0,
    WeightCollected DECIMAL(10, 2), -- In KG
    VehicleAssigned VARCHAR(100),
    DriverName VARCHAR(100),
    Status VARCHAR(50), -- Pending, Completed, Cancelled
    Notes TEXT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- ===== INVOICES TABLE =====
CREATE TABLE Invoices (
    InvoiceID INT PRIMARY KEY IDENTITY(1,1),
    InvoiceNumber VARCHAR(50) UNIQUE NOT NULL,
    CustomerID INT NOT NULL,
    SubscriptionID INT,
    InvoiceDate DATETIME DEFAULT GETDATE(),
    DueDate DATETIME,
    MonthlyCharges DECIMAL(10, 2),
    RegistrationCharges DECIMAL(10, 2),
    ConsultingFees DECIMAL(10, 2),
    PickupCharges DECIMAL(10, 2),
    TotalAmount DECIMAL(12, 2),
    PaidAmount DECIMAL(12, 2) DEFAULT 0,
    BalanceAmount DECIMAL(12, 2),
    PaymentStatus VARCHAR(50), -- Pending, Partial, Paid
    PaymentDate DATETIME,
    PaymentMethod VARCHAR(50), -- Cash, Cheque, Online, etc.
    Notes TEXT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (SubscriptionID) REFERENCES CustomerSubscriptions(SubscriptionID)
);

-- ===== PAYMENTS TABLE =====
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    InvoiceID INT NOT NULL,
    CustomerID INT NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentAmount DECIMAL(12, 2),
    PaymentMethod VARCHAR(50), -- Cash, Cheque, Online Transfer, etc.
    ReferenceNo VARCHAR(100), -- Cheque No, Transaction ID, etc.
    BankName VARCHAR(100),
    Notes TEXT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_customers_active ON Customers(IsActive);
CREATE INDEX idx_customers_email ON Customers(Email);
CREATE INDEX idx_subscriptions_customer ON CustomerSubscriptions(CustomerID);
CREATE INDEX idx_pickups_customer ON Pickups(CustomerID);
CREATE INDEX idx_invoices_customer ON Invoices(CustomerID);
CREATE INDEX idx_invoices_status ON Invoices(PaymentStatus);
CREATE INDEX idx_payments_invoice ON Payments(InvoiceID);

-- ===== INSERT SAMPLE DATA =====

-- Sample Customer
INSERT INTO Customers (InstitutionName, ContactPerson, Email, MobileNo, Address, Zone, Route, ServicePlan, IsActive)
VALUES ('City Medical Hospital', 'Dr. Ramesh Kumar', 'contact@cityhospital.in', '9876543210', 'Haridwar Road, Sector-5', 'Haridwar North', 'Daily Route A', 'Standard Plan', 1);

-- Sample Subscription
INSERT INTO CustomerSubscriptions (CustomerID, PlanID, StartDate, EndDate, MonthlyCharges, PaymentFrequency, RegistrationCharges, ConsultingFees, IsActive)
VALUES (1, 1, '2026-01-01', '2026-12-31', 5000, 'Monthly', 1000, 500, 1);

-- Sample Pickup
INSERT INTO Pickups (CustomerID, PickupDate, YellowBagCount, RedBagCount, WeightCollected, VehicleAssigned, DriverName, Status, IsActive)
VALUES (1, '2026-05-19', 10, 5, 45.5, 'VEH-001', 'Raj Kumar', 'Completed', 1);

-- Sample Invoice
INSERT INTO Invoices (InvoiceNumber, CustomerID, SubscriptionID, InvoiceDate, DueDate, MonthlyCharges, RegistrationCharges, ConsultingFees, PickupCharges, TotalAmount, PaidAmount, BalanceAmount, PaymentStatus)
VALUES ('INV-2026-001', 1, 1, '2026-05-01', '2026-05-15', 5000, 0, 0, 0, 5000, 5000, 0, 'Paid');

-- Sample Payment
INSERT INTO Payments (InvoiceID, CustomerID, PaymentDate, PaymentAmount, PaymentMethod, ReferenceNo, BankName, IsActive)
VALUES (1, 1, '2026-05-10', 5000, 'Online Transfer', 'TXN123456789', 'HDFC Bank', 1);

PRINT 'Customer Portal tables created successfully!';
