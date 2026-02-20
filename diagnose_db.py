import pyodbc
import sys

# Connection String details from appsettings.json
server = '100.125.169.14'
database = 'DB_Operation'
username = 'SA'
password = 'YourStrong(!)Password'
driver = '{ODBC Driver 17 for SQL Server}'

def check_db():
    print(f"Connecting to {server}...")
    try:
        # Check available drivers
        drivers = pyodbc.drivers()
        print(f"Drivers avaiable: {drivers}")
        if 'ODBC Driver 17 for SQL Server' not in drivers:
             driver_use = drivers[0] if drivers else None
             if not driver_use:
                 print("No ODBC drivers found.")
                 return
             print(f"Fallback driver: {driver_use}")
        else:
            driver_use = 'ODBC Driver 17 for SQL Server'

        conn_str = f'DRIVER={{{driver_use}}};SERVER={server};DATABASE={database};UID={username};PWD={password};TrustServerCertificate=yes;'
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        print(f"Connected to {database}.")
        
        # Check Table
        print("Checking for table 'Dispositivos_Vinculados'...")
        cursor.execute("SELECT TABLE_CATALOG, TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Dispositivos_Vinculados'")
        row = cursor.fetchone()
        
        if row:
            print(f"✅ FOUND TABLE: {row.TABLE_CATALOG}.{row.TABLE_SCHEMA}.{row.TABLE_NAME}")
        else:
            print("❌ TABLE NOT FOUND in INFORMATION_SCHEMA.")
            
            # List all tables to see what IS there
            print("Listing top 10 tables:")
            cursor.execute("SELECT TOP 10 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES")
            for r in cursor.fetchall():
                print(f" - {r.TABLE_NAME}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
