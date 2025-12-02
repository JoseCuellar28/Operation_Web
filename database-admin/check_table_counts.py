import pytds
import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

def get_db_connection():
    try:
        server = os.getenv('DB_SERVER')
        database = os.getenv('DB_NAME')
        username = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        
        conn = pytds.connect(
            server=server,
            database=database,
            user=username,
            password=password,
            port=1433,
            autocommit=True
        )
        return conn
    except Exception as e:
        logger.error(f"Error conectando a la base de datos: {e}")
        return None

def check_table_counts():
    conn = get_db_connection()
    if not conn:
        return

    try:
        cursor = conn.cursor()
        
        # Query to get all user tables
        cursor.execute("SELECT name FROM sys.tables ORDER BY name")
        tables = [row[0] for row in cursor.fetchall()]
        
        print("\n--- Estado de Tablas (SQL Server) ---")
        print(f"{'Tabla':<30} | {'Registros':<10}")
        print("-" * 45)
        
        populated_tables = []
        empty_tables = []
        
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM [{table}]")
                count = cursor.fetchone()[0]
                print(f"{table:<30} | {count:<10}")
                
                if count > 0:
                    populated_tables.append(table)
                else:
                    empty_tables.append(table)
            except Exception as ex:
                print(f"{table:<30} | Error: {ex}")

        print("\n--- Resumen ---")
        print(f"Tablas pobladas: {len(populated_tables)}")
        print(f"Tablas vacías: {len(empty_tables)}")
        
    except Exception as e:
        logger.error(f"Error consultando tablas: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_table_counts()
