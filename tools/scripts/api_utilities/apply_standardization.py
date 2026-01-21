
import pymssql
import time

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'

def run_migration():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, autocommit=True)
        cursor = conn.cursor()
        
        print("Starting Normalization Protocol...")

        # 1. Handle COLABORADORES (Has Index)
        print("[1/5] Dropping Index on COLABORADORES...")
        # Find exact name just in case, though usually static in dev, but safer to use the one found or generic drop if exists
        idx_name = "UQ__COLABORA__D87608A7DFE40C10" 
        try:
            cursor.execute(f"ALTER TABLE Opera_Main.dbo.COLABORADORES DROP CONSTRAINT {idx_name}")
        except Exception as e:
            print(f"Index drop warning (might not exist): {e}")

        print("[2/5] Altering COLABORADORES.dni to NVARCHAR(80)...")
        cursor.execute("ALTER TABLE Opera_Main.dbo.COLABORADORES ALTER COLUMN dni NVARCHAR(80) NOT NULL")

        print("[3/5] Recreating Unique Index on COLABORADORES...")
        cursor.execute("CREATE UNIQUE INDEX UQ_COLABORADORES_dni ON Opera_Main.dbo.COLABORADORES(dni)")

        # 2. Handle ASISTENCIA_DIARIA (No Index)
        print("[4/5] Altering ASISTENCIA_DIARIA.dni_colaborador to NVARCHAR(80)...")
        cursor.execute("ALTER TABLE Opera_Main.dbo.ASISTENCIA_DIARIA ALTER COLUMN dni_colaborador NVARCHAR(80) NULL")

        # 3. Create Master View
        print("[5/5] Creating View v_Global_Personal...")
        view_sql = """
        CREATE OR ALTER VIEW Opera_Main.dbo.v_Global_Personal AS
        SELECT 
            DNI,
            Inspector as NombreCompleto,
            Tipo as Cargo,
            Area,
            Division,
            Email,
            Telefono,
            Estado
        FROM DB_Operation.dbo.Personal
        """
        cursor.execute(view_sql)

        print("SUCCESS: Normalization Complete.")
        conn.close()

    except Exception as e:
        print(f"CRITICAL FAILURE: {str(e)}")

if __name__ == "__main__":
    run_migration()
