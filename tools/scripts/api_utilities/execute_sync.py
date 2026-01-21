
import pymssql

# Configuration
SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USER = 'SA'
PASSWORD = 'Joarcu28'

def execute_sync():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE, autocommit=True)
        cursor = conn.cursor()
        
        print("Executing Projects Synchronization...")
        
        # SQL from reference manual
        # Using GETUTCDATE() for standard UTC time instead of local GETDATE() if preferred, 
        # but manual said GETDATE(). Sticking to GETDATE() or SYSDATETIME().
        query = """
        INSERT INTO Proyectos (Nombre, Estado, FechaSincronizacion)
        SELECT DISTINCT Area, 'ACTIVO', GETDATE()
        FROM Personal
        WHERE Area IS NOT NULL 
        AND Area NOT IN (SELECT Nombre FROM Proyectos)
        """
        # Note: Manual said FechaCreacion, but schema audit showed FechaSincronizacion might be more appropriate or checking if FechaCreacion exists.
        # Let's check physical schema of Proyectos again from report?
        # Report says: FechaInicio, FechaFin, FechaSincronizacion. It does NOT show FechaCreacion for PROYECTOS in DB_Operation. 
        # Wait, let me double check PHYSICAL_SCHEMA_REPORT.json.
        
        cursor.execute(query)
        rows_affected = cursor.rowcount
        
        print(f"Transaction Complete. {rows_affected} registro afectado.")
        
        conn.close()

    except Exception as e:
        print(f"EXECUTION FAILED: {str(e)}")

# Double check schema before running?
# The manual said: INSERT INTO Proyectos (Nombre, Estado, FechaCreacion)
# My physical audit said: 
# "PROYECTOS": [ Id, Nombre, Cliente, Estado, FechaInicio, FechaFin, Presupuesto, FechaSincronizacion, Division, GerenteDni, JefeDni ]
# It does NOT have FechaCreacion. It has FechaSincronizacion. 
# I will use FechaSincronizacion to avoid "Invalid Column Name" error.
# The user manual might be slightly outdated compared to physical schema, or I need to follow physical reality.
# "Strict Sync" rule implies following Physical Reality.

if __name__ == "__main__":
    execute_sync()
