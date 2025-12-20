
import pytds
import os
import sys

# DB Config (Hardcoded or Env - using hardcoded for reliability in this env as seen in reset_password.py)
SERVER = '100.112.55.58'
DATABASE = 'DB_Operation'
USER = 'sa'
PASSWORD = 'Joarcu28'
PORT = 1433

MIGRATION_FILE = '/Users/josearbildocuellar/Github/Operation_Web-1/database-admin/migrations/Init_HSE_Module.sql'

def apply_migration():
    print(f"Applying migration from {MIGRATION_FILE}...")
    
    try:
        with open(MIGRATION_FILE, 'r') as f:
            sql_script = f.read()

        # Split by GO if necessary, but pytds usually handles blocks if no GO.
        # This script doesn't use GO, just IF NOT EXISTS blocks.
        
        with pytds.connect(server=SERVER, user=USER, password=PASSWORD, database=DATABASE, port=PORT, autocommit=True) as conn:
            cursor = conn.cursor()
            cursor.execute(sql_script)
            print("Migration executed successfully.")

            # Verify creation
            cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('HSE_Inspections', 'HSE_Incidents', 'HSE_PPE_Delivery')")
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Verified Tables: {tables}")

    except Exception as e:
        print(f"Error executing migration: {e}")

if __name__ == "__main__":
    apply_migration()
