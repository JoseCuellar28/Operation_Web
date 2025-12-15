
import pytds
import sys

def check_project_divisions():
    try:
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        print(f"Checking Proyectos Divisions...")
        
        with pytds.connect(server=server, user=user, password=password, database=database, port=port, autocommit=True) as conn:
            cursor = conn.cursor()

            cursor.execute("SELECT DISTINCT Division, COUNT(*) FROM Proyectos GROUP BY Division")
            rows = cursor.fetchall()
            print("Distinct Division values in Proyectos:")
            for r in rows:
                print(f"  '{r[0]}' (Count: {r[1]})")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_project_divisions()
