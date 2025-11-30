import pymssql

server = '100.112.55.58'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'

try:
    conn = pymssql.connect(server, user, password, database)
    cursor = conn.cursor()
    
    cursor.execute("UPDATE Users SET Role = 'Admin' WHERE DNI = '99887766'")
    conn.commit()
    
    print("User role updated to Admin successfully.")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
