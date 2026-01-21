
import pymssql

# Configuration matches discovered credentials
SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def certify_instance():
    try:
        print(f"Connecting to {SERVER} / {DATABASE}...")
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor()
        
        # Verify Table Access and Count
        query = "SELECT COUNT(*) FROM dbo.Personal"
        cursor.execute(query)
        count = cursor.fetchone()[0]
        
        print(f"Connection Successful.")
        print(f"Host: {SERVER}")
        print(f"Catalog: {DATABASE}")
        print(f"Table: dbo.Personal")
        print(f"Record Count: {count}")
        
        conn.close()

    except Exception as e:
        print(f"CERTIFICATION FAILED: {str(e)}")

if __name__ == "__main__":
    certify_instance()
