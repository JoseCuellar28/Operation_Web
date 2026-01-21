
import pymssql
import json

# Configuration
SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

TARGET_TABLE = 'Personal'
TARGET_COLUMNS = ['FechaNacimiento', 'FotoUrl', 'FirmaUrl', 'DNI']

def inspect_personal_extension():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor(as_dict=True)
        
        print(f"Inspecting {TARGET_TABLE} columns...")
        
        query = f"""
        SELECT 
            c.name as column_name,
            t.name as data_type,
            c.max_length,
            c.is_nullable
        FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE object_id = OBJECT_ID('{TARGET_TABLE}')
        AND c.name IN ({','.join(["'" + col + "'" for col in TARGET_COLUMNS])})
        """
        cursor.execute(query)
        columns = cursor.fetchall()
        
        print(json.dumps(columns, indent=2))
        conn.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    inspect_personal_extension()
