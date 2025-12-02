import pytds
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

def check_users():
    try:
        conn = pytds.connect(
            server=os.getenv('DB_SERVER'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=1433
        )
        cursor = conn.cursor()
        cursor.execute("SELECT Id, DNI, Role, Email FROM Users")
        users = cursor.fetchall()
        print("Usuarios existentes:")
        for u in users:
            print(f"ID: {u[0]}, DNI: {u[1]}, Role: {u[2]}, Email: {u[3]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
