import pymssql

server = '100.112.55.58'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'

try:
    conn = pymssql.connect(server, user, password, database)
    cursor = conn.cursor(as_dict=True)
    
    cursor.execute("SELECT Id, DNI, Role FROM Users WHERE DNI = '99887766'")
    row = cursor.fetchone()
    
    if row:
        print(f"User Found: {row}")
    else:
        print("User not found")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
