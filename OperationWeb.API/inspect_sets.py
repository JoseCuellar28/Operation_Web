
import pymssql

SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def inspect_sets():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor()
        
        # Get Personal Areas
        cursor.execute("SELECT DISTINCT Area FROM Personal WHERE Area IS NOT NULL")
        personal_areas = set(row[0] for row in cursor.fetchall())
        
        # Get Project Names
        cursor.execute("SELECT DISTINCT Nombre FROM Proyectos")
        project_names = set(row[0] for row in cursor.fetchall())
        
        missing = personal_areas - project_names
        
        print(f"Personal Areas Count: {len(personal_areas)}")
        print(f"Project Names Count: {len(project_names)}")
        print(f"Missing in Proyectos: {missing}")
        
        conn.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    inspect_sets()
