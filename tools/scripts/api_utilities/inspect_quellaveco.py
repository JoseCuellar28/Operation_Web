
import pymssql

SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def inspect_quellaveco():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor(as_dict=True)
        
        query = "SELECT Id, Nombre FROM Proyectos WHERE Nombre LIKE '%QUELLAVECO%'"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print(f"Project candidates for 'QUELLAVECO':")
        for r in rows:
            print(r)
            
        conn.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    inspect_quellaveco()
