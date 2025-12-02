import pytds
from dotenv import load_dotenv
import os

load_dotenv('etl-service/.env')

create_table_sql = """
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PasswordResetTokens' AND xtype='U')
BEGIN
    CREATE TABLE PasswordResetTokens (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        DNI NVARCHAR(40) NOT NULL,
        Token NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        IsUsed BIT NOT NULL DEFAULT 0,
        UsedAt DATETIME2 NULL
    );
    
    CREATE INDEX IX_PasswordResetTokens_DNI ON PasswordResetTokens(DNI);
    CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);
    
    PRINT 'Table PasswordResetTokens created successfully';
END
ELSE
BEGIN
    PRINT 'Table PasswordResetTokens already exists';
END
"""

try:
    conn = pytds.connect(
        server=os.getenv('DB_SERVER'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=1433
    )
    cursor = conn.cursor()
    cursor.execute(create_table_sql)
    conn.commit()
    print("Database schema updated successfully")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
