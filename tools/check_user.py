
import pyodbc

# Hardcoded connection string for reliability in this script
DB_CONN_STR = "Driver={ODBC Driver 17 for SQL Server};Server=127.0.0.1,1433;Database=OperationWebDB;Uid=sa;Pwd=ChangeThisStrongPassword123!;"

try:
    conn = pyodbc.connect(DB_CONN_STR)
    cursor = conn.cursor()
    
    print("--- Searching for User 41007510 ---")
    cursor.execute("SELECT Id, DNI, Email, PasswordHash, Role FROM Users WHERE DNI = '41007510'")
    user = cursor.fetchone()
    
    if user:
        print(f"FOUND: ID={user[0]}, DNI={user[1]}, Email={user[2]}, Role={user[4]}")
        print(f"Hash ({len(user[3])} chars): {user[3][:25]}...")
    else:
        print("NOT FOUND: User 41007510 does not exist in the database.")
        
    print("\n--- All Users in DB ---")
    cursor.execute("SELECT DNI, Role FROM Users")
    for row in cursor.fetchall():
        print(f"DNI: {row[0].strip()} | Role: {row[1]}")
        
except Exception as e:
    print(f"Error: {e}")
