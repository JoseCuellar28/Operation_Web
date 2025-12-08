
import pytds

def inspect_schema():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433


        print(f"Conectando a {server}...")
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()
            
            print("\nSAMPLE: Personal")
            cursor.execute("SELECT TOP 5 DNI, Inspector, Tipo, Categoria FROM Personal")
            for row in cursor.fetchall():
                print(row)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_schema()
