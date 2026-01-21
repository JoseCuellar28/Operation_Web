
import pymssql

SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def inspect_recent():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor(as_dict=True)
        
        # Check for projects created in last 1 hour (UTC diff might apply, so generous window)
        query = """
        SELECT Id, Nombre, Estado, FechaSincronizacion
        FROM Proyectos
        WHERE FechaSincronizacion > DATEADD(hour, -1, GETDATE())
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print(f"Found {len(rows)} recently synced projects:")
        for r in rows:
            print(r)
            
        conn.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    inspect_recent()
