
import pymssql

# Configuration
SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def run_expansion():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE, autocommit=True)
        cursor = conn.cursor()
        
        print("Starting Personal Table Expansion...")

        # 1. FechaNacimiento -> DATE
        print("[1/3] Altering FechaNacimiento to DATE...")
        cursor.execute("ALTER TABLE dbo.Personal ALTER COLUMN FechaNacimiento DATE NULL")

        # 2. FotoUrl -> NVARCHAR(MAX)
        print("[2/3] Altering FotoUrl to NVARCHAR(MAX)...")
        cursor.execute("ALTER TABLE dbo.Personal ALTER COLUMN FotoUrl NVARCHAR(MAX) NULL")

        # 3. FirmaUrl -> NVARCHAR(MAX)
        print("[3/3] Altering FirmaUrl to NVARCHAR(MAX)...")
        cursor.execute("ALTER TABLE dbo.Personal ALTER COLUMN FirmaUrl NVARCHAR(MAX) NULL")

        print("SUCCESS: Personal Table Expanded to High Capacity.")
        conn.close()

    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    run_expansion()
