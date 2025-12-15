
import pytds
import sys
import datetime

def seed_manager():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        target_dni = '71098053'
        
        print(f"Seeding Manager Role for {target_dni} on {server}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()

            # Get User Id
            cursor.execute(f"SELECT Id FROM Users WHERE DNI = '{target_dni}'")
            row = cursor.fetchone()
            if not row:
                print("User not found!")
                return
            user_id = row[0]
            print(f"User ID found: {user_id}")

            # Upsert into UserAccessConfigs
            # Check if exists
            cursor.execute(f"SELECT Id FROM UserAccessConfigs WHERE UserId = {user_id}")
            config_row = cursor.fetchone()

            if config_row:
                print("Updating existing config...")
                cursor.execute(f"UPDATE UserAccessConfigs SET JobLevel = 'Manager', LastUpdated = CURRENT_TIMESTAMP WHERE Id = {config_row[0]}")
            else:
                print("Inserting new config...")
                cursor.execute(f"INSERT INTO UserAccessConfigs (UserId, AccessWeb, AccessApp, JobLevel, LastUpdated) VALUES ({user_id}, 1, 1, 'Manager', CURRENT_TIMESTAMP)")
            
            print("Seed complete.")
            
            # Verify
            cursor.execute(f"SELECT * FROM UserAccessConfigs WHERE UserId = {user_id}")
            print("Current Config:", cursor.fetchone())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed_manager()
