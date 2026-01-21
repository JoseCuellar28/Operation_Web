import pytds

try:
    print("Intentando conectar...")
    conn = pytds.connect(
        server='100.112.55.58',
        user='sa',
        password='Joarcu28',
        database='DB_Operation',
        port=1433,
        timeout=10
    )
    print("✅ Conexión exitosa!")
    
    cur = conn.cursor()
    cur.execute("SELECT name FROM sys.server_principals WHERE type = 'S' AND name = 'app_user'")
    result = cur.fetchone()
    
    if result:
        print(f"✅ Usuario 'app_user' EXISTE como login")
    else:
        print(f"❌ Usuario 'app_user' NO EXISTE como login")
    
    cur.execute("SELECT name FROM sys.database_principals WHERE name = 'app_user'")
    result = cur.fetchone()
    
    if result:
        print(f"✅ Usuario 'app_user' EXISTE en la base de datos")
    else:
        print(f"❌ Usuario 'app_user' NO EXISTE en la base de datos")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
