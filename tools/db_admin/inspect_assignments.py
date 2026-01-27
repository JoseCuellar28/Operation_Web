import pymssql
import os

# Configuration (Toshiba)
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'
DATABASE = 'DB_Operation'

def inspect_assignments():
    print(f"\n--- Inspecting dbo.PersonalProyectos (Assignments) on {SERVER} ---")
    conn = None
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor(as_dict=True)
        
        # Query first 10 assignments
        query = """
        SELECT TOP 10 
            Id, 
            ProyectoId, 
            DNI, 
            FechaAsignacion, 
            EsActivo, 
            RolEnProyecto 
        FROM dbo.PersonalProyectos
        ORDER BY FechaAsignacion DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        if not rows:
            print("No assignments found in dbo.PersonalProyectos.")
            return

        print(f"{'ID':<5} {'PROY_ID':<10} {'DNI':<15} {'ACTIVE':<10} {'ROLE':<15} {'ASSIGNED_DATE'}")
        print("-" * 80)
        for row in rows:
            print(f"{row['Id']:<5} {row['ProyectoId']:<10} {row['DNI']:<15} {row['EsActivo']:<10} {str(row['RolEnProyecto']):<15} {row['FechaAsignacion']}")
            
    except Exception as e:
        print(f"Error querying PersonalProyectos: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    inspect_assignments()
