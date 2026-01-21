import pyodbc
import os

# Connection string
conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=100.112.55.58,1433;DATABASE=DB_Operation;UID=app_user;PWD=joarcu$2025;TrustServerCertificate=yes;"

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    print("--- Users and Roles ---")
    query = """
    SELECT u.Id, u.DNI, u.Email, u.Role, r.Name as RoleTable_Name
    FROM Users u
    LEFT JOIN UserRoles ur ON u.Id = ur.UserId
    LEFT JOIN Roles r ON ur.RoleId = r.Id
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    
    for row in rows:
        print(f"ID: {row.Id}, DNI: {row.DNI}, Email: {row.Email}, User.Role: {row.Role}, RoleTable.Name: {row.RoleTable_Name}")

    conn.close()

except Exception as e:
    print(f"Error: {e}")
