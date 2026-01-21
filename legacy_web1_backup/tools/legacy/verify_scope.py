
import pytds

def verify_scope():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433
        
        users_to_check = ['41007510', '71098053']

        print(f"Connecting to {server}...")
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()
            
            print("\n" + "="*80)
            print(f"{'DNI':<10} | {'NOMBRE':<30} | {'ROL (DB)':<10} | {'DIVISIÓN':<20} | {'TIPO':<15}")
            print("="*80)

            for dni in users_to_check:
                # Get User Role
                cursor.execute("SELECT Role FROM Users WHERE DNI = %s", (dni,))
                u_row = cursor.fetchone()
                role_db = u_row[0] if u_row else "No Login"
                
                # Get Personal Scope
                cursor.execute("SELECT Inspector, Division, Tipo FROM Personal WHERE DNI = %s", (dni,))
                p_row = cursor.fetchone()
                
                if p_row:
                    nombre = p_row[0][:30]
                    division = p_row[1] if p_row[1] else "TODAS (o N/A)"
                    tipo = p_row[2]
                else:
                    nombre = "No Encontrado"
                    division = "-"
                    tipo = "-"

                print(f"{dni:<10} | {nombre:<30} | {role_db:<10} | {division:<20} | {tipo:<15}")

            print("="*80)

    except Exception as e:
        print(f"Error: {e}")
        
if __name__ == "__main__":
    verify_scope()
