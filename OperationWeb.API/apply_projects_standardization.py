
import pymssql

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'

def run_project_fix():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, autocommit=True)
        cursor = conn.cursor()
        
        print("Starting PROYECTOS Standardization...")

        # 1. Alter GerenteDni
        print("[1/2] Altering DB_Operation.dbo.PROYECTOS.GerenteDni to NVARCHAR(80)...")
        cursor.execute("ALTER TABLE DB_Operation.dbo.PROYECTOS ALTER COLUMN GerenteDni NVARCHAR(80) NULL")

        # 2. Alter JefeDni
        print("[2/2] Altering DB_Operation.dbo.PROYECTOS.JefeDni to NVARCHAR(80)...")
        cursor.execute("ALTER TABLE DB_Operation.dbo.PROYECTOS ALTER COLUMN JefeDni NVARCHAR(80) NULL")

        print("SUCCESS: PROYECTOS Table standardized.")
        conn.close()

    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    run_project_fix()
