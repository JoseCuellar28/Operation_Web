import pytds
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

def check_admin_personal():
    try:
        conn = pytds.connect(
            server=os.getenv('DB_SERVER'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=1433
        )
        cursor = conn.cursor()
        cursor.execute("SELECT DNI, Inspector FROM Personal")
        rows = cursor.fetchall()
        print(f"Total registros: {len(rows)}")
        for row in rows:
            print(f"Registro: {row}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_admin_personal()
