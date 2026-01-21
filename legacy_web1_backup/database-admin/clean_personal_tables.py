import pytds
import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

def get_db_connection():
    try:
        server = os.getenv('DB_SERVER')
        database = os.getenv('DB_NAME')
        username = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        
        # Conexión usando python-tds
        conn = pytds.connect(
            server=server,
            database=database,
            user=username,
            password=password,
            port=1433,
            autocommit=False
        )
        return conn
    except Exception as e:
        logger.error(f"Error conectando a la base de datos: {e}")
        raise

def clean_tables():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        logger.info("Iniciando limpieza de tablas de Personal...")

        # Orden importante por Foreign Keys
        tables_to_clean = [
            "Personal_EventoLaboral", # Depende de Personal
            "Users", # Depende de Personal (FK_Users_Personal_DNI)
            "Personal",
            "Historial_Cargas_Personal" # Independiente (log)
        ]

        for table in tables_to_clean:
            logging.info(f"Limpiando tabla: {table}")
            if table == "Historial_Cargas_Personal":
                query = f"DELETE FROM {table}"
            else:
                # Excluir al usuario Admin (DNI 10103488) para evitar conflicto FK con Users
                query = f"DELETE FROM {table} WHERE DNI != '10103488'"
            
            logging.info(f"Sending query {query}")
            cursor.execute(query)
            logging.info(f"Tabla {table} limpiada.")

        conn.commit()
        logger.info("Limpieza completada exitosamente.")

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error durante la limpieza: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    clean_tables()
