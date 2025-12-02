import pymssql
import os

# DB Config (Hardcoded for now as per run_tests.py)
DB_SERVER = '100.112.55.58'
DB_USER = 'sa'
DB_PASS = 'Joarcu28'
DB_NAME = 'DB_Operation'

def reset_database():
    print(f"Connecting to {DB_SERVER}...")
    try:
        conn = pymssql.connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME)
        conn.autocommit(True)
        cursor = conn.cursor()

        print("Disabling constraints...")
        cursor.execute("EXEC sp_msforeachtable \"ALTER TABLE ? NOCHECK CONSTRAINT all\"")

        print("Deleting data from all tables...")
        # Get all user tables
        cursor.execute("SELECT name FROM sys.tables WHERE type = 'U'")
        tables = [row[0] for row in cursor.fetchall()]

        for table in tables:
            # Skip migration history table if it exists (usually __EFMigrationsHistory)
            if table == "__EFMigrationsHistory":
                continue
                
            print(f"Clearing {table}...")
            try:
                # Try TRUNCATE first (faster, resets identity)
                cursor.execute(f"TRUNCATE TABLE [{table}]")
            except:
                # Fallback to DELETE if TRUNCATE fails (e.g. FKs even with check constraints disabled sometimes)
                cursor.execute(f"DELETE FROM [{table}]")
                # Reseed identity if needed
                try:
                    cursor.execute(f"DBCC CHECKIDENT ('[{table}]', RESEED, 0)")
                except:
                    pass # Table might not have identity

        print("Re-enabling constraints...")
        cursor.execute("EXEC sp_msforeachtable \"ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all\"")

        print("✅ Database reset successfully!")
        conn.close()

    except Exception as e:
        print(f"❌ Error resetting database: {e}")

if __name__ == "__main__":
    reset_database()
