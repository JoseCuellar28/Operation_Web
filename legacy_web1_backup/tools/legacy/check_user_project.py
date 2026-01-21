
import pytds
import sys

def check_user_project(dni):
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        print(f"Checking Proyectos for DNI {dni}...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()

            query = f"SELECT * FROM Proyectos WHERE GerenteDni = '{dni}' OR JefeDni = '{dni}'"
            cursor.execute(query)
            projects = cursor.fetchall()
            
            if projects:
                for p in projects:
                    print(f"FOUND IN PROJECT: Id={p[0]}, Nombre={p[1]}, Division={p[8]}, RoleMatch={'Gerente' if p[9] == dni else 'Jefe'}")
            else:
                print("User NOT found in Proyectos table as Gerente or Jefe.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_user_project(sys.argv[1])
    else:
        print("Usage: python3 check_user_project.py <DNI>")
