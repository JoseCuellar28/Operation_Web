import sys
from db_config import get_connection
from tabulate import tabulate

def list_tables():
    print("Fetching tables...")
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        t.TABLE_SCHEMA,
                        t.TABLE_NAME,
                        t.TABLE_TYPE
                    FROM INFORMATION_SCHEMA.TABLES t
                    ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME
                """)
                rows = cur.fetchall()
                
                if not rows:
                    print("No tables found.")
                    return

                headers = ["Schema", "Table Name", "Type"]
                print(tabulate(rows, headers=headers, tablefmt="grid"))
                return True
    except Exception as e:
        print(f"Error listing tables: {e}")
        return False

if __name__ == "__main__":
    list_tables()
