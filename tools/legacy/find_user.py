
import pytds

def find_user():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433


        print(f"Buscando 'Jose Arbildo' en {server}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()



            print("\n--- Búsqueda en Personal (Inspector) ---")
            # Search Personal directly
            query = """
            SELECT DNI, Inspector, Tipo, Categoria
            FROM Personal
            WHERE Inspector LIKE '%JOSE%' AND (Inspector LIKE '%ARBILDO%' OR Inspector LIKE '%CUELLAR%')
            """
            cursor.execute(query)
            matches = cursor.fetchall()
            
            if matches:
                for m in matches:
                    print(f"PERSONAL ENCONTRADO: DNI={m[0]}, Inspector={m[1]}, Tipo={m[2]}")
            else:
                print("No se encontró personal coincidente.")
            
            print("\n--- Admins Existentes ---")
            cursor.execute("""
                SELECT u.DNI, u.Role, p.Inspector 
                FROM Users u 
                LEFT JOIN Personal p ON u.DNI = p.DNI
                WHERE u.Role IN ('SuperAdmin', 'Admin', 'ADMIN')
            """)
            admins = cursor.fetchall()
            for a in admins: print(f"Admin: DNI={a[0]}, Rol={a[1]}, Nombre={a[2]}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_user()
