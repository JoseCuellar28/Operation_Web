import pymssql
import os

server = '100.125.169.14'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'

try:
    conn = pymssql.connect(server, user, password, database)
    cursor = conn.cursor(as_dict=True)
    
    print(f"--- Schema Inspection for Table: Proyectos ---")
    
    # Get Columns and Types
    query = """
    SELECT 
        c.COLUMN_NAME, 
        c.DATA_TYPE, 
        c.CHARACTER_MAXIMUM_LENGTH, 
        c.IS_NULLABLE 
    FROM INFORMATION_SCHEMA.COLUMNS c
    WHERE c.TABLE_NAME = 'Proyectos'
    ORDER BY c.ORDINAL_POSITION
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    
    if not rows:
        print("Table 'Proyectos' not found.")
    else:
        print("| Column Name | Type | Max Length | Nullable |")
        print("| :--- | :--- | :--- | :--- |")
        for row in rows:
            print(f"| {row['COLUMN_NAME']} | {row['DATA_TYPE']} | {row['CHARACTER_MAXIMUM_LENGTH']} | {row['IS_NULLABLE']} |")

except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
