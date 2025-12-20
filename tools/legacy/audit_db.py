
import pytds
import sys

def audit_database():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        print(f"Auditing Database {database} on {server}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()

            print("\n--- Listing All Tables ---")
            cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME")
            tables = cursor.fetchall()
            for t in tables:
                print(f"- {t[0]}")

            print("\n--- Inspecting 'Proyectos' or 'Projects' Table Structure ---")
            project_table = next((t[0] for t in tables if 'proyect' in t[0].lower() or 'project' in t[0].lower()), None)
            
            if project_table:
                print(f"Found potential project table: {project_table}")
                cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{project_table}'")
                cols = cursor.fetchall()
                for c in cols:
                    print(f"  {c[0]} ({c[1]})")
            else:
                print("No obvious Projects/Proyectos table found.")

            print("\n--- Inspecting 'UserAccessConfigs' or similar Table Structure ---")
            config_table = next((t[0] for t in tables if 'config' in t[0].lower() or 'access' in t[0].lower()), None)
             
            if config_table:
                 print(f"Found potential config table: {config_table}")
                 cursor.execute(f"SELECT TOP 5 * FROM {config_table}")
                 rows = cursor.fetchall()
                 if rows:
                     for r in rows: print(r)
                 else:
                     print("(Empty table)")

            print("\n--- Analyzing 'Division' Consistency in Personal Table ---")
            # Check if Division column exists first
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Personal' AND COLUMN_NAME = 'Division'")
            if cursor.fetchone():
                cursor.execute("SELECT DISTINCT Division, COUNT(*) FROM Personal GROUP BY Division ORDER BY Division")
                divisions = cursor.fetchall()
                print("Distinct Division values:")
                for d in divisions:
                    print(f"  '{d[0]}' (Count: {d[1]})")
            else:
                print("'Division' column not found in Personal table.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    audit_database()
