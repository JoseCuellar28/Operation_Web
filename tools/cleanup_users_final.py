
import pytds

def cleanup_users():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433
        
        # IDs to KEEP
        keep_ids = [1002, 1006]
        keep_ids_str = ",".join(map(str, keep_ids))

        print(f"Connecting to {server}...")
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()
            
            print(f"Keeping Users IDs: {keep_ids}")
            
            # 1. Preview deletion
            print("\nPreview users to DELETE:")
            cursor.execute(f"SELECT Id, DNI, Role FROM Users WHERE Id NOT IN ({keep_ids_str})")
            rows = cursor.fetchall()
            if not rows:
                print("No users to delete.")
                return

            for row in rows:
                print(f" - Delete: ID={row[0]}, DNI={row[1]}, Role={row[2]}")

            # 2. Perform Deletion (Dependencies first)
            print("\nDeleting dependencies...")
            
            # UserRoles
            cursor.execute(f"DELETE FROM UserRoles WHERE UserId NOT IN ({keep_ids_str})")
            print(f"Cleaned UserRoles.")

            # UserAccessConfigs
            # Check if table exists first? Previous context said it might not exist.
            try:
                cursor.execute(f"DELETE FROM UserAccessConfigs WHERE UserId NOT IN ({keep_ids_str})")
                print(f"Cleaned UserAccessConfigs.")
            except:
                print("UserAccessConfigs table not found or error (skipping).")

            # UserActivations
            try:
                 cursor.execute(f"DELETE FROM UserActivations WHERE UserId NOT IN ({keep_ids_str})")
                 print(f"Cleaned UserActivations.")
            except:
                 pass
            
            # 3. Delete Users
            print("Deleting Users...")
            cursor.execute(f"DELETE FROM Users WHERE Id NOT IN ({keep_ids_str})")
            print(f"Deleted {cursor.rowcount} users from Users table.")

            # 4. Verify
            print("\n--- FINAL USER LIST ---")
            cursor.execute("SELECT Id, DNI, Role FROM Users")
            for row in cursor.fetchall():
                print(f"ID={row[0]}, DNI={row[1]}, Role={row[2]}")

    except Exception as e:
        print(f"Error: {e}")
        
if __name__ == "__main__":
    cleanup_users()
