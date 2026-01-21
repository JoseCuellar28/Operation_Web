
import pymssql
import json

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'

def check_view_locations():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD)
        cursor = conn.cursor(as_dict=True)
        results = {}

        databases = ['DB_Operation', 'Opera_Main']
        object_name = 'v_Global_Personal'

        for db in databases:
            print(f"Checking {db}...")
            query = f"""
            SELECT TOP 1 1 as Found
            FROM {db}.sys.views 
            WHERE name = '{object_name}'
            """
            cursor.execute(query)
            row = cursor.fetchone()
            results[db] = True if row else False

        print(json.dumps(results, indent=2))
        conn.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_view_locations()
