import pytds
import os

# CREDENTIALS FROM etl-service/.env
server = '100.112.55.58'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'
port = 1433

os.environ['DB_TRUST_CERT'] = 'true'

print(f"Connecting to {server}:{port} as {user}...")

try:
    with pytds.connect(
        server=server,
        user=user,
        password=password,
        database=database,
        port=port,
        autocommit=True,
        cafile=None,
        validate_host=False
    ) as conn:
        print("Connected.")
        with conn.cursor() as cur:
            # Drop if partially exists
            cur.execute("IF OBJECT_ID('UserAccessConfigs', 'U') IS NOT NULL DROP TABLE UserAccessConfigs;")
            
            # Create WITHOUT FK
            sql = """
            CREATE TABLE UserAccessConfigs (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId INT NOT NULL,
                AccessWeb BIT NOT NULL DEFAULT 1,
                AccessApp BIT NOT NULL DEFAULT 1,
                LastUpdated DATETIME DEFAULT GETUTCDATE()
                -- REMOVED CONSTRAINT FK_UserAccessConfigs_Users
            );
            """
            print("Executing CREATE TABLE...")
            cur.execute(sql)
            
            # Backfill
            print("Executing Backfill...")
            backfill = """
            INSERT INTO UserAccessConfigs (UserId, AccessWeb, AccessApp, LastUpdated)
            SELECT Id, 1, 1, GETUTCDATE()
            FROM Users u;
            """
            cur.execute(backfill)
            print("SQL executed successfully.")
                
            # Verify
            cur.execute("SELECT COUNT(*) FROM UserAccessConfigs")
            count = cur.fetchone()[0]
            print(f"UserAccessConfigs Rows: {count}")
            
            # Check permissions
            # Grant Select to app_user just in case
            try:
                cur.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON UserAccessConfigs TO app_user;")
                print("Granted permissions to app_user.")
            except Exception as e:
                print(f"Permission grant warning: {e}")
            
except Exception as e:
    print(f"Error: {e}")
