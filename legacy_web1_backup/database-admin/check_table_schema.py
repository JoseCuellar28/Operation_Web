import pytds
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

def check_schema():
    try:
        conn = pytds.connect(
            server=os.getenv('DB_SERVER'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=1433
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Historial_Cargas_Personal'
        """)
        columns = cursor.fetchall()
        print("Columnas en Historial_Cargas_Personal:")
        for col in columns:
            print(f"- {col[0]} ({col[1]})")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
