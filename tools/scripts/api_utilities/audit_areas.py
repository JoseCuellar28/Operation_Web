
import pymssql
import re

# Configuration
SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def audit_areas():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE)
        cursor = conn.cursor()
        
        # Query based on reference manual
        query = """
        SELECT DISTINCT Area 
        FROM Personal 
        WHERE Area IS NOT NULL 
        AND Area NOT IN (SELECT Nombre FROM Proyectos)
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        missing_areas = [row[0] for row in rows]
        count = len(missing_areas)
        
        print(f"Audit Result: Found {count} new areas to sync.")
        
        # Security Check: Special Characters
        unsafe_areas = []
        safe_pattern = re.compile(r'^[a-zA-Z0-9\s\-_\.]+$')
        
        for area in missing_areas:
            if not safe_pattern.match(str(area)):
                unsafe_areas.append(area)
                
        if unsafe_areas:
            print("SECURITY WARNING: The following areas contain special characters:")
            for area in unsafe_areas:
                print(f" - {area}")
        else:
            print("Security Check: OK (No special characters detected in new areas).")
            
        conn.close()

    except Exception as e:
        print(f"AUDIT FAILED: {str(e)}")

if __name__ == "__main__":
    audit_areas()
