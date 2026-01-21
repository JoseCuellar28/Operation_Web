import pytds
from dotenv import load_dotenv
import os

load_dotenv('etl-service/.env')

try:
    conn = pytds.connect(
        server=os.getenv('DB_SERVER'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=1433
    )
    cursor = conn.cursor()
    cursor.execute("SELECT DNI, Inspector, Email, EmailPersonal FROM Personal WHERE DNI = '41007510'")
    row = cursor.fetchone()
    if row:
        print(f"Personal encontrado:")
        print(f"  DNI: {row[0]}")
        print(f"  Nombre: {row[1]}")
        print(f"  Email: {row[2]}")
        print(f"  EmailPersonal: {row[3]}")
    else:
        print("No se encontró el DNI 41007510 en Personal")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
