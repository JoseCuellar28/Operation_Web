import pytds
from dotenv import load_dotenv
import os

load_dotenv('etl-service/.env')

def check_settings():
    try:
        conn = pytds.connect(
            server=os.getenv('DB_SERVER'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=1433
        )
        cursor = conn.cursor()
        cursor.execute("SELECT [Key], [Value] FROM SystemSettings WHERE [Key] LIKE 'Smtp%' OR [Key] = 'FromEmail'")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} email settings:")
        for row in rows:
            print(f"  {row[0]}: {row[1]}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_settings()
