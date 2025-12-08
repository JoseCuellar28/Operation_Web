-- HSE Module Migration: Inspections, PPE, Incidents

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'HSE_Inspections')
BEGIN
    CREATE TABLE HSE_Inspections (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        InspectorDNI NVARCHAR(20) NOT NULL, -- DNI of the person doing the inspection
        Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        Type NVARCHAR(50) NOT NULL, -- 'Vehicular', 'Site', 'Office'
        ReferenceId NVARCHAR(100), -- Vehicle Plate or Site Name
        Status NVARCHAR(20) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Flagged'
        Score DECIMAL(5,2) DEFAULT 0,
        Comments NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'HSE_InspectionItems')
BEGIN
    CREATE TABLE HSE_InspectionItems (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        InspectionId INT NOT NULL,
        Question NVARCHAR(255) NOT NULL,
        IsCompliant BIT NOT NULL, -- 1 = Pass, 0 = Fail
        Observation NVARCHAR(MAX),
        Severity NVARCHAR(20) DEFAULT 'Low', -- 'Low', 'Medium', 'High' (Critical)
        FOREIGN KEY (InspectionId) REFERENCES HSE_Inspections(Id) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'HSE_Incidents')
BEGIN
    CREATE TABLE HSE_Incidents (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ReporterDNI NVARCHAR(20) NOT NULL,
        Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        Description NVARCHAR(MAX) NOT NULL,
        Location NVARCHAR(100),
        Severity NVARCHAR(20) NOT NULL, -- 'NearMiss', 'Minor', 'Major', 'Critical'
        Status NVARCHAR(20) DEFAULT 'Open', -- 'Open', 'Investigating', 'Closed'
        ActionTaken NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'HSE_PPE_Delivery')
BEGIN
    CREATE TABLE HSE_PPE_Delivery (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        WorkerDNI NVARCHAR(20) NOT NULL,
        DelivererDNI NVARCHAR(20) NOT NULL,
        Date DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ItemsJson NVARCHAR(MAX) NOT NULL, -- JSON array of items: [{"item": "Helmet", "qty": 1}]
        SignatureMetadata NVARCHAR(MAX), -- Placeholder for signature URL or base64
        Comments NVARCHAR(MAX),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
