import pymssql

server = '100.112.55.58'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'

try:
    conn = pymssql.connect(server, user, password, database)
    cursor = conn.cursor(as_dict=True)
    
    cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Personal'")
    rows = cursor.fetchall()
    
    print("Columns in Personal table:")
    for row in rows:
        print(row['COLUMN_NAME'])
        
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
