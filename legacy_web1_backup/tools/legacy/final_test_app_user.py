import pytds

print("="*80)
print("RESETEAR CONTRASEÑA Y VERIFICAR app_user")
print("="*80)

# Primero resetear con sa
try:
    conn = pytds.connect(
        server='100.112.55.58',
        user='sa',
        password='Joarcu28',
        database='DB_Operation',
        port=1433,
        timeout=10
    )
    print("\n✅ Conectado como sa")
    
    cur = conn.cursor()
    
    print("\n🔄 Reseteando contraseña de app_user a 'joarcu$2025'...")
    cur.execute("ALTER LOGIN app_user WITH PASSWORD = 'joarcu$2025'")
    print("✅ Contraseña reseteada exitosamente")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error al resetear: {e}")
    exit(1)

# Ahora probar conexión con app_user
print("\n" + "="*80)
print("PROBANDO CONEXIÓN CON app_user")
print("="*80)

try:
    conn = pytds.connect(
        server='100.112.55.58',
        user='app_user',
        password='joarcu$2025',
        database='DB_Operation',
        port=1433,
        timeout=10
    )
    print("\n✅ ¡CONEXIÓN EXITOSA con app_user!")
    
    cur = conn.cursor()
    
    # Verificar roles
    cur.execute("""
        SELECT r.name
        FROM sys.database_role_members rm
        JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
        JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
        WHERE u.name = 'app_user'
        ORDER BY r.name
    """)
    
    print("\n📋 Roles asignados:")
    for row in cur.fetchall():
        print(f"  • {row[0]}")
    
    # Probar SELECT
    cur.execute("SELECT COUNT(*) FROM Personal")
    count = cur.fetchone()[0]
    print(f"\n✅ Puede leer datos: {count} registros en Personal")
    
    conn.close()
    
    print("\n" + "="*80)
    print("RESULTADO")
    print("="*80)
    print("✅ app_user funciona correctamente")
    print("✅ Contraseña: joarcu$2025")
    print("✅ Puede reemplazar 'sa' en appsettings.json")
    
except Exception as e:
    print(f"\n❌ Error de conexión: {type(e).__name__}: {e}")
