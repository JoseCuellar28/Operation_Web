import pymssql
import os

server = '100.125.169.14'
user = 'sa'
password = 'Joarcu28'
database = 'DB_Operation'

try:
    conn = pymssql.connect(server, user, password, database)
    cursor = conn.cursor()
    
    with open('/Users/josearbildocuellar/Github/Operation_Web-1/etl-service/sql/03_create_system_settings.sql', 'r') as f:
        sql_script = f.read()
        
    # Split by GO if necessary, but pymssql might handle it or we can just execute the block if it's simple
    # The script has a GO at the end, let's remove it
    sql_script = sql_script.replace('GO', '')
    
    cursor.execute(sql_script)
    conn.commit()
    print("Migration executed successfully.")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
