
import pymssql

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'
DATABASE = 'Opera_Main'

def run_view_fix():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE, autocommit=True)
        cursor = conn.cursor()
        
        print(f"Connected to {DATABASE}. Creating View...")
        
        view_sql = """
        CREATE OR ALTER VIEW dbo.v_Global_Personal AS
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

        print("SUCCESS: View v_Global_Personal created.")
        conn.close()

    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    run_view_fix()
