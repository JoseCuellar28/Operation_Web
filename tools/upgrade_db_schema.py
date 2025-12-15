
import pytds
import sys

def upgrade_schema():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        print(f"Upgrading Schema on {server}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()

            # Check if columns exist
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserAccessConfigs' AND COLUMN_NAME = 'JobLevel'")
            if not cursor.fetchone():
                print("Adding JobLevel column...")
                cursor.execute("ALTER TABLE UserAccessConfigs ADD JobLevel NVARCHAR(50) NULL")
            else:
                print("JobLevel column already exists.")

            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserAccessConfigs' AND COLUMN_NAME = 'ProjectScope'")
            if not cursor.fetchone():
                print("Adding ProjectScope column...")
                cursor.execute("ALTER TABLE UserAccessConfigs ADD ProjectScope NVARCHAR(100) NULL")
            else:
                print("ProjectScope column already exists.")

            print("Schema upgrade complete.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upgrade_schema()
