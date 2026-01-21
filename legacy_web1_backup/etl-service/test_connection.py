import os
import sys
from dotenv import load_dotenv
import pytds

def test_connection():
    load_dotenv()
    
    server = os.getenv('DB_SERVER')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    database = os.getenv('DB_NAME')
    port = int(os.getenv('DB_PORT', '1433'))
    
    print(f"Testing connection to {server}:{port} as {user}...")
    
    try:
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                row = cur.fetchone()
                print(f"Connection successful! Result: {row}")
                return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
