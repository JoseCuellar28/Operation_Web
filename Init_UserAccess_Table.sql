IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAccessConfigs')
BEGIN
    CREATE TABLE UserAccessConfigs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        AccessWeb BIT NOT NULL DEFAULT 1,
        AccessApp BIT NOT NULL DEFAULT 1,
        LastUpdated DATETIME DEFAULT GETUTCDATE(),
        CONSTRAINT FK_UserAccessConfigs_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END

-- Backfill missing users so they don't get locked out
INSERT INTO UserAccessConfigs (UserId, AccessWeb, AccessApp, LastUpdated)
SELECT Id, 1, 1, GETUTCDATE()
FROM Users u
WHERE NOT EXISTS (SELECT 1 FROM UserAccessConfigs c WHERE c.UserId = u.Id);
