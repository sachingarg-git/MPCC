-- Master Data Tables for MPCC System
-- Execute this script to create all master data tables

-- ===== ROUTE MASTER TABLE =====
CREATE TABLE Routes (
    RouteID INT PRIMARY KEY IDENTITY(1,1),
    RouteCode VARCHAR(20) UNIQUE NOT NULL,
    RouteName VARCHAR(100) NOT NULL,
    RouteType VARCHAR(50) NOT NULL, -- Daily, City, Weekly, On-Demand
    PrimaryDriver VARCHAR(100),
    SecondaryDriver VARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== SERVICE PLAN TABLE =====
CREATE TABLE ServicePlans (
    PlanID INT PRIMARY KEY IDENTITY(1,1),
    PlanCode VARCHAR(20) UNIQUE NOT NULL,
    PlanName VARCHAR(100) NOT NULL,
    Category VARCHAR(100), -- Yellow Bag, Red Bag, Multi-Category
    SubCategory VARCHAR(100), -- Anatomical Waste, Cytotoxic Waste, Sharps
    Zone VARCHAR(100), -- Haridwar North, Haridwar South, Rishikesh Zone
    Route VARCHAR(100),
    Description TEXT,
    PricingType VARCHAR(20), -- fixed, perbed
    MonthlyCharges DECIMAL(10, 2),
    RegistrationCharges DECIMAL(10, 2),
    ConsultingFees DECIMAL(10, 2),
    IsActive BIT DEFAULT 1,
    IsDefault BIT DEFAULT 0,
    IsPopular BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== PAYMENT FREQUENCY TABLE =====
CREATE TABLE PaymentFrequency (
    FrequencyID INT PRIMARY KEY IDENTITY(1,1),
    FrequencyCode VARCHAR(20) UNIQUE NOT NULL,
    FrequencyName VARCHAR(100) NOT NULL,
    Months INT NOT NULL, -- Number of months
    DiscountAmount DECIMAL(10, 2),
    DiscountPercentage DECIMAL(5, 2),
    Description TEXT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== KIT MASTER TABLE =====
CREATE TABLE KitMaster (
    KitID INT PRIMARY KEY IDENTITY(1,1),
    KitCode VARCHAR(20) UNIQUE NOT NULL,
    KitName VARCHAR(100) NOT NULL,
    KitType VARCHAR(100), -- Hospital, Clinic, Lab, etc.
    Description TEXT,
    TotalPrice DECIMAL(10, 2),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== KIT ITEMS TABLE (for items in each kit) =====
CREATE TABLE KitItems (
    ItemID INT PRIMARY KEY IDENTITY(1,1),
    KitID INT NOT NULL,
    ItemName VARCHAR(100) NOT NULL,
    HSNCode VARCHAR(20),
    Quantity INT,
    Unit VARCHAR(20), -- Pcs, Box, Ltr, etc.
    Rate DECIMAL(10, 2),
    FOREIGN KEY (KitID) REFERENCES KitMaster(KitID)
);

-- ===== WASTE CATEGORY TABLE =====
CREATE TABLE WasteCategory (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryCode VARCHAR(20) UNIQUE NOT NULL,
    CategoryName VARCHAR(100) NOT NULL,
    BagColor VARCHAR(50), -- Yellow, Red, Green, Black, etc.
    Description TEXT,
    HandlingInstructions TEXT,
    StorageRequirements TEXT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== VEHICLE MASTER TABLE =====
CREATE TABLE VehicleMaster (
    VehicleID INT PRIMARY KEY IDENTITY(1,1),
    VehicleCode VARCHAR(20) UNIQUE NOT NULL,
    VehicleType VARCHAR(100), -- Ambulance, Van, Truck, etc.
    RegistrationNo VARCHAR(20) UNIQUE NOT NULL,
    ChassisNo VARCHAR(50),
    EngineNo VARCHAR(50),
    ManufacturingYear INT,
    Capacity INT, -- In liters or kg
    FuelType VARCHAR(50), -- Petrol, Diesel, CNG, Electric
    Manufacturer VARCHAR(100),
    Model VARCHAR(100),
    PurchaseDate DATE,
    InspectionDueDate DATE,
    PermitDueDate DATE,
    InsuranceExpiryDate DATE,
    RouteAssigned INT,
    Driver VARCHAR(100),
    GPSEnabled BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    VehicleStatus VARCHAR(50), -- Active, Under Maintenance, Retired, Sold
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (RouteAssigned) REFERENCES Routes(RouteID)
);

-- ===== VENDOR MASTER TABLE =====
CREATE TABLE VendorMaster (
    VendorID INT PRIMARY KEY IDENTITY(1,1),
    VendorCode VARCHAR(20) UNIQUE NOT NULL,
    VendorType VARCHAR(100), -- Material Supplier, Service Vendor, Transporter
    VendorName VARCHAR(100) NOT NULL,
    ContactPerson VARCHAR(100),
    Mobile VARCHAR(20),
    Email VARCHAR(100),
    Website VARCHAR(200),
    AddressLine1 VARCHAR(200),
    AddressLine2 VARCHAR(200),
    City VARCHAR(100),
    State VARCHAR(100),
    Pincode VARCHAR(10),
    GSTNumber VARCHAR(20),
    PANNumber VARCHAR(20),
    TANNumber VARCHAR(20),
    RegistrationCertNo VARCHAR(50),
    BankName VARCHAR(100),
    AccountNumber VARCHAR(50),
    IFSCCode VARCHAR(20),
    BranchName VARCHAR(100),
    PaymentTerms VARCHAR(100),
    CreditPeriodDays INT,
    CreditLimit DECIMAL(12, 2),
    VendorStatus VARCHAR(50), -- Active, Inactive, Blacklisted
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== RAW MATERIALS TABLE =====
CREATE TABLE RawMaterials (
    MaterialID INT PRIMARY KEY IDENTITY(1,1),
    MaterialCode VARCHAR(20) UNIQUE NOT NULL,
    MaterialType VARCHAR(100), -- Polybag, Container, Bin, Chemical, Equipment, Other
    MaterialName VARCHAR(100) NOT NULL,
    Description TEXT,
    Brand VARCHAR(100),
    Manufacturer VARCHAR(100),
    HSNCode VARCHAR(20),
    UOM VARCHAR(20), -- Unit of Measure (Pcs, Kg, Ltr, etc.)
    MinStockLevel INT,
    MaxStockLevel INT,
    ReorderQty INT,
    UnitPrice DECIMAL(10, 2),
    Supplier VARCHAR(100),
    SupplierCode VARCHAR(20),
    LeadTimeDays INT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_routes_active ON Routes(IsActive);
CREATE INDEX idx_serviceplans_active ON ServicePlans(IsActive);
CREATE INDEX idx_paymentfreq_active ON PaymentFrequency(IsActive);
CREATE INDEX idx_kit_active ON KitMaster(IsActive);
CREATE INDEX idx_wastecategory_active ON WasteCategory(IsActive);
CREATE INDEX idx_vehicle_active ON VehicleMaster(IsActive);
CREATE INDEX idx_vendor_active ON VendorMaster(IsActive);
CREATE INDEX idx_materials_active ON RawMaterials(IsActive);

-- ===== INSERT SAMPLE DATA =====

-- Sample Routes
INSERT INTO Routes (RouteCode, RouteName, RouteType, PrimaryDriver, SecondaryDriver, IsActive)
VALUES
('RTE-001', 'Daily Route A', 'Daily', 'Raj Kumar', 'Arjun Singh', 1),
('RTE-002', 'Daily Route B', 'Daily', 'Vikram Singh', 'Anil Kumar', 1),
('RTE-003', 'City Zone', 'City', 'Rohan Sharma', 'Deepak Patel', 1);

-- Sample Service Plans
INSERT INTO ServicePlans (PlanCode, PlanName, Category, SubCategory, Zone, Route, PricingType, MonthlyCharges, RegistrationCharges, ConsultingFees, IsActive, IsDefault)
VALUES
('PLAN-001', 'Standard Plan', 'Yellow Bag', 'Anatomical Waste', 'Haridwar North', 'Daily Route A', 'fixed', 5000, 1000, 500, 1, 1);

-- Sample Payment Frequencies
INSERT INTO PaymentFrequency (FrequencyCode, FrequencyName, Months, DiscountPercentage, IsActive)
VALUES
('FREQ-001', 'Annual Plan', 12, 10, 1),
('FREQ-002', 'Half Yearly', 6, 5, 1),
('FREQ-003', 'Quarterly', 3, 2, 1),
('FREQ-004', 'Monthly', 1, 0, 1);

-- Sample Waste Categories
INSERT INTO WasteCategory (CategoryCode, CategoryName, BagColor, IsActive)
VALUES
('CAT-001', 'Anatomical Waste', 'Yellow', 1),
('CAT-002', 'Cytotoxic Waste', 'Red', 1),
('CAT-003', 'Sharps', 'Red', 1);

PRINT 'Master Data tables created successfully!';
