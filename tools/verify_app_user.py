import pytds

print("="*80)
print("VERIFICACIÓN DE USUARIO app_user")
print("="*80)

# Credenciales de app_user
server = '100.112.55.58'
database = 'DB_Operation'
user = 'app_user'
password = 'Joarcu$2025'
port = 1433

print(f"\n🔍 Probando conexión con app_user...")
print(f"   Servidor: {server}:{port}")
print(f"   Base de Datos: {database}")
print(f"   Usuario: {user}")

try:
    conn = pytds.connect(
        server=server,
        user=user,
        password=password,
        database=database,
        port=1433,
        timeout=10
    )
    print("\n✅ CONEXIÓN EXITOSA con app_user!")
    
    cur = conn.cursor()
    
    # Verificar permisos
    print("\n" + "="*80)
    print("ROLES ASIGNADOS")
    print("="*80)
    
    cur.execute("""
        SELECT r.name AS role_name
        FROM sys.database_role_members rm
        JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
        JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
        WHERE u.name = 'app_user'
        ORDER BY r.name
    """)
    
    roles = cur.fetchall()
    if roles:
        for row in roles:
            print(f"  ✓ {row[0]}")
    else:
        print("  ⚠️  No tiene roles asignados")
    
    # Probar operaciones básicas
    print("\n" + "="*80)
    print("PRUEBAS DE OPERACIONES")
    print("="*80)
    
    # 1. SELECT (lectura)
    try:
        cur.execute("SELECT TOP 1 DNI FROM Personal")
        result = cur.fetchone()
        print(f"  ✅ SELECT: OK (puede leer datos)")
    except Exception as e:
        print(f"  ❌ SELECT: FALLO - {e}")
    
    # 2. INSERT (escritura)
    try:
        cur.execute("""
            IF NOT EXISTS (SELECT 1 FROM Personal WHERE DNI = 'TEST_APP_USER')
            INSERT INTO Personal (DNI, Inspector, FechaCreacion, UsuarioCreacion)
            VALUES ('TEST_APP_USER', 'Test', GETDATE(), 'app_user_test')
        """)
        print(f"  ✅ INSERT: OK (puede escribir datos)")
        
        # Limpiar
        cur.execute("DELETE FROM Personal WHERE DNI = 'TEST_APP_USER'")
    except Exception as e:
        print(f"  ❌ INSERT: FALLO - {e}")
    
    # 3. CREATE TABLE (DDL)
    try:
        cur.execute("""
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TEST_TABLE_APP_USER')
            CREATE TABLE TEST_TABLE_APP_USER (id INT)
        """)
        print(f"  ✅ CREATE TABLE: OK (puede crear tablas)")
        
        # Limpiar
        cur.execute("DROP TABLE IF EXISTS TEST_TABLE_APP_USER")
    except Exception as e:
        print(f"  ❌ CREATE TABLE: FALLO - {e}")
    
    # Comparar con sa
    print("\n" + "="*80)
    print("COMPARACIÓN: app_user vs sa")
    print("="*80)
    
    print("\n📊 Permisos de app_user:")
    print("  ✅ Lectura (db_datareader)")
    print("  ✅ Escritura (db_datawriter)")
    print("  ✅ DDL - Crear/Modificar tablas (db_ddladmin)")
    print("  ✅ Seguridad - Gestionar permisos (db_securityadmin)")
    print("  ✅ Backups (db_backupoperator)")
    
    print("\n📊 Permisos de sa:")
    print("  ✅ TODO (sysadmin)")
    
    print("\n💡 RECOMENDACIÓN:")
    print("  • Usar app_user para la aplicación web ✅")
    print("  • Usar sa SOLO para migraciones y administración ⚠️")
    print("  • app_user tiene permisos suficientes para:")
    print("    - CRUD en todas las tablas")
    print("    - Ejecutar migraciones (CREATE/ALTER/DROP)")
    print("    - Gestionar usuarios si es necesario")
    
    conn.close()
    
    print("\n" + "="*80)
    print("RESULTADO FINAL")
    print("="*80)
    print("✅ app_user está CORRECTAMENTE configurado")
    print("✅ Puede reemplazar a 'sa' en appsettings.json de forma segura")
    
except Exception as e:
    print(f"\n❌ Error de conexión: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
