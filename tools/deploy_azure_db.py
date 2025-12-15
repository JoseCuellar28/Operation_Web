import sys
import subprocess
import os

# Auto-install dependency if missing
try:
    import pyodbc
except ImportError:
    print("Installing missing dependency: pyodbc...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "pyodbc"])
        print("Dependency installed. Restarting script to load new components...")
        # Restart the current process to load the new package
        os.execv(sys.executable, [sys.executable] + sys.argv)
    except Exception as e:
        print(f"FAILED to auto-install pyodbc: {e}")
        print("Please run: pip install pyodbc")
        sys.exit(1)

# Configuration
SERVER = 'operationweb-sql-server.database.windows.net'
DATABASE = 'OperationWebDB'
USERNAME = 'sqladmin'
PASSWORD = 'ChangeThisStrongPassword123!'

def get_connection_string(driver):
    # Driver 18 requires strict encryption settings
    param_extra = ";Encrypt=yes;TrustServerCertificate=yes" if "18" in driver else ""
    return f'DRIVER={driver};SERVER={SERVER};PORT=1433;DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}{param_extra}'

def execute_sql_file(cursor, file_path):
    print(f"--- Processing {os.path.basename(file_path)} ---")
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            
        # Split by GO command (simple implementation)
        statements = content.split('GO')
        
        for statement in statements:
            statement = statement.strip()
            if statement:
                # print(f"Executing: {statement[:50]}...") # Verbose
                cursor.execute(statement)
        print(f"SUCCESS: {file_path}")
    except Exception as e:
        print(f"ERROR processing {file_path}: {e}")
        raise

def main():
    print("Connecting to Azure SQL...")
    
    # Try common Azure drivers in order
    drivers = [
        '{ODBC Driver 18 for SQL Server}',
        '{ODBC Driver 17 for SQL Server}',
        '{ODBC Driver 13 for SQL Server}'
    ]
    
    conn = None
    for driver in drivers:
        try:
            print(f"Attempting connection with: {driver}")
            conn_str = get_connection_string(driver)
            conn = pyodbc.connect(conn_str, autocommit=True)
            print("Connected!")
            break
        except Exception as e:
            print(f"Driver {driver} failed: {e}")
            
    if not conn:
        print("\nCRITICAL FAILURE: Could not connect with any available ODBC driver.")
        return

    try:
        cursor = conn.cursor()
        
        # Define scripts order
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        scripts = [
            os.path.join(base_dir, 'database', 'scripts', '01_DDL_Structure.sql'),
            os.path.join(base_dir, 'database', 'scripts', '02_DCL_Permissions.sql'),
            os.path.join(base_dir, 'database', 'scripts', '03_DML_Seed_Admin.sql')
        ]
        
        for script in scripts:
            if os.path.exists(script):
                execute_sql_file(cursor, script)
            else:
                print(f"WARNING: Script not found: {script}")
                
        print("\nDeployment Completed Successfully!")
        
    except Exception as e:
        print(f"\nRuntime Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    main()
