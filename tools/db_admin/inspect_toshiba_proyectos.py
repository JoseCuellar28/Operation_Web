import pymssql
import json
import os

# Configuration from appsettings.json
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'
DATABASES = ['DB_Operation', 'Opera_Main']

def get_table_info(cursor, db_name, table_name):
    print(f"\n--- Inspecting {db_name}.dbo.{table_name} ---")
    try:
        # Switch database context
        cursor.execute(f"USE {db_name}")
        
        # Query column metadata
        query = f"""
        SELECT 
            c.COLUMN_NAME, 
            c.DATA_TYPE, 
            c.CHARACTER_MAXIMUM_LENGTH, 
            c.IS_NULLABLE,
            tc.CONSTRAINT_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
            ON c.TABLE_NAME = kcu.TABLE_NAME 
            AND c.COLUMN_NAME = kcu.COLUMN_NAME
        LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
            ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        WHERE c.TABLE_NAME = '{table_name}'
        ORDER BY c.ORDINAL_POSITION
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        if not rows:
            print(f"Table '{table_name}' not found in {db_name} or permission denied.")
            return

        print(f"{'COLUMN':<25} {'TYPE':<15} {'LENGTH':<10} {'NULLABLE':<10} {'CONSTRAINT'}")
        print("-" * 75)
        for row in rows:
            col_name = row[0]
            dtype = row[1]
            length = str(row[2]) if row[2] else 'NULL'
            nullable = row[3]
            constraint = row[4] if row[4] else ''
            print(f"{col_name:<25} {dtype:<15} {length:<10} {nullable:<10} {constraint}")
            
    except Exception as e:
        print(f"Error inspecting {db_name}: {e}")

def main():
    conn = None
    try:
        print(f"Connecting to {SERVER} as {USER}...")
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, autocommit=True)
        cursor = conn.cursor()



        for db in DATABASES:
            get_table_info(cursor, db, 'Proyectos')
            
        get_table_info(cursor, 'DB_Operation', 'PersonalProyectos')



        for db in DATABASES:
            get_table_info(cursor, db, 'Proyectos')

        # DISCOVERY EXTRA: Search for similar tables in BOTH databases
        for db in DATABASES:
            print(f"\n--- Deep Search in {db} for '%Proyect%' ---")
            cursor.execute(f"USE {db}")
            cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Proyect%'")
            tables = cursor.fetchall()
            if tables:
                print("Found potential matches:")
                for t in tables:
                    print(f" - {t[0]}")
            else:
                print(f"No tables found matching '%Proyect%' in {db}.")



    except Exception as e:
        print(f"\nCRITICAL ERROR: Could not connect or execute queries.\nDetails: {e}")
    finally:
        if conn:
            conn.close()
            print("\nConnection closed.")

if __name__ == "__main__":
    main()
