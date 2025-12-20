
import pytds

def promote_user():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        target_dni = '41007510' # Jose Arbildo
        source_admin_dni = '10103488' # Luis Villagomez (Existing Admin)

        print(f"Conectando a {server}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()


            # 1. Get Password Hash from Source Admin
            print(f"Obteniendo hash de contraseña de {source_admin_dni}...")
            cursor.execute("SELECT PasswordHash FROM Users WHERE DNI = %s", (source_admin_dni,))
            source_user = cursor.fetchone()
            
            if not source_user:
                print("Error: No se encontró al admin origen.")
                return

            password_hash = source_user[0]
            print("Hash obtenido.")

            # 2. Get Personal Info for Target
            print(f"Obteniendo datos personales de {target_dni}...")
            cursor.execute("SELECT Inspector, Email FROM Personal WHERE DNI = %s", (target_dni,))
            personal = cursor.fetchone()
            
            if not personal:
                print("Error: No se encontró al personal destino.")
                return

            inspector_name = personal[0]
            email = personal[1] if personal[1] else f"{target_dni}@operationsmart.com"

            # 3. Insert or Update User
            print(f"Promoviendo a {inspector_name} ({target_dni}) a ADMIN...")
            
            # Check if user exists
            cursor.execute("SELECT DNI FROM Users WHERE DNI = %s", (target_dni,))
            if cursor.fetchone():
                # Update
                cursor.execute("""
                    UPDATE Users 
                    SET Role = 'Admin', PasswordHash = %s, IsActive = 1
                    WHERE DNI = %s
                """, (password_hash, target_dni))
                print("Usuario actualizado a Admin.")
            else:
                # Insert - Removed Nombre/Apellidos as they don't exist in Users
                cursor.execute("""
                    INSERT INTO Users (DNI, Email, PasswordHash, Role, IsActive, CreatedAt)
                    VALUES (%s, %s, %s, 'Admin', 1, GETDATE())
                """, (target_dni, email, password_hash))
                print("Usuario creado como Admin.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    promote_user()
