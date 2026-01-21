import os
import sys
import pytds

# Configuration
SERVER = 'OCA-LENOVO\\SQLEXPRESS' # Using the server name from API config
DATABASE = 'DB_Operation' # From etl-service .env
USER = 'sa'
PASSWORD = 'Joarcu28' # From etl-service .env

def list_tables():
    print(f"Connecting to {SERVER}...")
    try:
        # Note: pytds might need the port if the browser service isn't reachable, 
        # but let's try with the instance name first.
        # If that fails, we might need to assume a port or use a different library.
        # However, pytds usually expects (server, port) or just server if default.
        # For named instances, it's tricky with pytds. 
        # Let's try passing the full name as server.
        
        with pytds.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'")
                rows = cur.fetchall()
                print("\nTables found:")
                for schema, name in rows:
                    print(f"- {schema}.{name}")
                return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    list_tables()
