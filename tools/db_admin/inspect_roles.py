import pymssql

server = '100.125.169.14'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'

try:
    conn = pymssql.connect(server, user, password, database)
    cursor = conn.cursor(as_dict=True)
    
    cursor.execute("SELECT * FROM Roles")
    rows = cursor.fetchall()
    
    print("Roles in DB:")
    for row in rows:
        print(row)
        
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
