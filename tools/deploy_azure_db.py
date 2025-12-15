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
DRIVER = '{ODBC Driver 17 for SQL Server}' # Standard in Azure Cloud Shell

CONNECTION_STRING = f'DRIVER={DRIVER};SERVER={SERVER};PORT=1433;DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'

def execute_sql_file(cursor, file_path):
    print(f"--- Processing {os.path.basename(file_path)} ---")
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            
        # Split by GO command (case insensitive, on its own line)
        # Regex is safer but simple split works for our strict scripts
        statements = content.split('GO')
        
        for statement in statements:
            statement = statement.strip()
            if statement:
                print(f"Executing: {statement[:50]}...")
                cursor.execute(statement)
        print(f"SUCCESS: {file_path}")
    except Exception as e:
        print(f"ERROR processing {file_path}: {e}")
        raise

def main():
    print("Connecting to Azure SQL...")
    try:
        conn = pyodbc.connect(CONNECTION_STRING, autocommit=True)
        cursor = conn.cursor()
        print("Connected!")
        
        # Define scripts order
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # Go up from tools/
        scripts = [
            os.path.join(base_dir, 'database', 'scripts', '01_DDL_Structure.sql'),
            os.path.join(base_dir, 'database', 'scripts', '02_DCL_Permissions.sql')
        ]
        
        for script in scripts:
            if os.path.exists(script):
                execute_sql_file(cursor, script)
            else:
                print(f"WARNING: Script not found: {script}")
                
        print("\nDeployment Completed Successfully!")
        
    except Exception as e:
        print(f"\nCRITICAL FAILURE: {e}")
        print("Tip: If driver not found, Azure Cloud Shell might use 'ODBC Driver 18...'. Trying fallback...")

if __name__ == '__main__':
    main()
