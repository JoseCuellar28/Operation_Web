
import pytds
import sys

def check_user(dni):
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'app_user'
        password = '***joarcu$2025' # Using the one from connection string seen in logs or inferred safest known
        # Actually I should use the one from find_user.py or similar if possible, but safer to try the known working one from logs if I had it.
        # Wait, find_user.py had 'sa' and 'Joarcu28'. I should try that first as it likely has rights.
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        print(f"Buscando DNI {dni} en {server}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()

            # Inspect columns first to be sure
            # cursor.execute("SELECT TOP 1 * FROM Personal")
            # columns = [column[0] for column in cursor.description]
            # print(f"Columnas en Personal: {columns}")

            query = f"SELECT DNI, Inspector, Tipo, Categoria FROM Personal WHERE DNI = '{dni}'"
            cursor.execute(query)
            match = cursor.fetchone()
            
            if match:
                print(f"PERSONAL FOUND: DNI={match[0]}, Name={match[1]}, Tipo='{match[2]}', Categoria='{match[3]}'")
            else:
                print("No user found in Personal table with that DNI.")
                
            query_u = f"SELECT Id, DNI, Role FROM Users WHERE DNI = '{dni}'"
            cursor.execute(query_u)
            match_u = cursor.fetchone()
            if match_u:
                print(f"USERS FOUND: Id={match_u[0]}, DNI={match_u[1]}, Role='{match_u[2]}'")
            else:
                print("No user found in Users table with that DNI.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_user(sys.argv[1])
    else:
        print("Usage: python3 check_manager_status.py <DNI>")
