
import pytds

def cleanup_admins():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433
        
        super_admin_dni = '41007510'

        print(f"Connecting to {server}...")
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()
            
            # 1. Find other admins
            print("Identifying other Admins...")
            cursor.execute("""
                SELECT DNI, Role 
                FROM Users 
                WHERE Role IN ('Admin', 'SuperAdmin', 'ADMIN') 
                AND DNI != %s
            """, (super_admin_dni,))
            
            others = cursor.fetchall()
            
            if not others:
                print("No other admins found. You are the only one.")
            else:
                for u in others:
                    target_dni = u[0]
                    role = u[1]
                    print(f"Demoting {target_dni} (Role: {role}) to 'User'...")
                    
                    cursor.execute("""
                        UPDATE Users 
                        SET Role = 'User' 
                        WHERE DNI = %s
                    """, (target_dni,))
                    
                print("All other admins have been demoted to 'User'.")

            # 2. Verify Sole Admin
            print("\n--- FINAL ADMIN LIST ---")
            cursor.execute("SELECT DNI, Role, IsActive FROM Users WHERE Role IN ('Admin', 'SuperAdmin', 'ADMIN')")
            for row in cursor.fetchall():
                print(f"User: {row[0]}, Role: {row[1]}, Active: {row[2]}")

    except Exception as e:
        print(f"Error: {e}")
        
if __name__ == "__main__":
    cleanup_admins()
