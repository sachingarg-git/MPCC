-- User Management Database Schema

-- Create Roles Table
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Create Permissions Table
CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    PermissionName VARCHAR(100) NOT NULL UNIQUE,
    Module VARCHAR(100),
    SubModule VARCHAR(100),
    Description VARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Role Permissions Mapping Table
CREATE TABLE RolePermissions (
    RolePermissionID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT NOT NULL FOREIGN KEY REFERENCES Roles(RoleID),
    PermissionID INT NOT NULL FOREIGN KEY REFERENCES Permissions(PermissionID),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Drop existing Users table if exists and recreate with all fields
IF OBJECT_ID('Users', 'U') IS NOT NULL
    DROP TABLE Users;

-- Create Enhanced Users Table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    MobileNo VARCHAR(20),
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Designation VARCHAR(100),
    RoleID INT NOT NULL FOREIGN KEY REFERENCES Roles(RoleID),
    IsActive BIT DEFAULT 1,
    IsEmailEnabled BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy INT,
    UpdatedBy INT
);

-- Insert Default Roles
INSERT INTO Roles (RoleName, Description, IsActive)
VALUES
    ('Super Admin', 'Full system access with all permissions', 1),
    ('Admin', 'Administrative access with user and role management', 1),
    ('Manager', 'Manager level access with operational modules', 1),
    ('Accountant', 'Finance and billing module access only', 1),
    ('Operator', 'Data entry and operations only', 1),
    ('Viewer', 'Read-only access to reports and dashboards', 1);

-- Insert Sample Permissions
INSERT INTO Permissions (PermissionName, Module, SubModule, Description)
VALUES
    ('View Dashboard', 'Dashboard', NULL, 'View dashboard'),
    ('Manage Master Data', 'Master Data', 'Route Master', 'Manage routes'),
    ('Manage Master Data', 'Master Data', 'Service Plan', 'Manage service plans'),
    ('Manage Master Data', 'Master Data', 'Kit Master', 'Manage kits'),
    ('Manage Master Data', 'Master Data', 'Vehicle Master', 'Manage vehicles'),
    ('Manage Master Data', 'Master Data', 'Vendor Master', 'Manage vendors'),
    ('Manage Customers', 'Customer', NULL, 'Create, update, delete customers'),
    ('View Reports', 'Reports', NULL, 'View all reports'),
    ('Manage Users', 'User Management', NULL, 'Create, update, delete users'),
    ('Manage Roles', 'User Management', 'Roles & Permissions', 'Manage roles and permissions'),
    ('View Billing', 'Billing', NULL, 'View billing information'),
    ('Manage Collection', 'Collection', NULL, 'Manage collections'),
    ('View Inventory', 'Inventory', NULL, 'View inventory'),
    ('Export Data', 'Reports', NULL, 'Export reports to Excel');

-- Insert Admin User (this will be updated to use the new schema)
INSERT INTO Users (FirstName, LastName, Email, MobileNo, Username, Password, Designation, RoleID, IsActive, IsEmailEnabled)
VALUES ('Admin', 'User', 'admin@mpccharidwar.in', '9876543210', 'admin', 'password123', 'Administrator', 1, 1, 1);

-- Assign All Permissions to Super Admin Role
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 1, PermissionID FROM Permissions;

-- Assign Common Permissions to Admin Role
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 2, PermissionID FROM Permissions
WHERE PermissionName NOT LIKE '%Roles%' AND PermissionName NOT LIKE '%Users%';

-- Assign Operational Permissions to Manager Role
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 3, PermissionID FROM Permissions
WHERE Module IN ('Dashboard', 'Customer', 'Collection', 'Inventory', 'Reports');

-- Assign Finance Permissions to Accountant Role
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 4, PermissionID FROM Permissions
WHERE Module IN ('Billing', 'Reports', 'Dashboard');

-- Assign Limited Permissions to Operator Role
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 5, PermissionID FROM Permissions
WHERE Module IN ('Dashboard', 'Customer') AND SubModule IS NULL;

-- Assign View-Only Permissions to Viewer Role
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 6, PermissionID FROM Permissions
WHERE PermissionName LIKE '%View%' OR PermissionName LIKE '%Dashboard%';

-- Create Index for faster queries
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_username ON Users(Username);
CREATE INDEX idx_users_roleid ON Users(RoleID);
CREATE INDEX idx_roles_active ON Roles(IsActive);
CREATE INDEX idx_rolepermissions_roleid ON RolePermissions(RoleID);
