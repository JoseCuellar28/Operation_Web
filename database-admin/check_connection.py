import sys
from db_config import get_connection

def check():
    print("Connecting to database...")
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT @@VERSION")
                row = cur.fetchone()
                print("Connection successful!")
                print(f"Server Version: {row[0]}")
                return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    success = check()
    sys.exit(0 if success else 1)
