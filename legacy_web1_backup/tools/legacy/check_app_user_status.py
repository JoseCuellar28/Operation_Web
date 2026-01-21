import pytds

print("="*80)
print("VERIFICACIÓN DE ESTADO DE app_user (usando sa)")
print("="*80)

try:
    # Conectar como sa
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
    
    # Verificar login de app_user
    print("\n" + "="*80)
    print("ESTADO DEL LOGIN app_user")
    print("="*80)
    
    cur.execute("""
        SELECT 
            name,
            type_desc,
            is_disabled,
            create_date,
            modify_date,
            default_database_name
        FROM sys.server_principals
        WHERE name = 'app_user'
    """)
    
    login_info = cur.fetchone()
    
    if login_info:
        name, type_desc, is_disabled, create_date, modify_date, default_db = login_info
        print(f"\n📋 Información del Login:")
        print(f"  Nombre: {name}")
        print(f"  Tipo: {type_desc}")
        print(f"  Deshabilitado: {'❌ SÍ' if is_disabled else '✅ NO'}")
        print(f"  Creado: {create_date}")
        print(f"  Modificado: {modify_date}")
        print(f"  Base de datos predeterminada: {default_db}")
        
        if is_disabled:
            print("\n⚠️  EL LOGIN ESTÁ DESHABILITADO")
            print("\n💡 Para habilitarlo, ejecuta:")
            print("   ALTER LOGIN app_user ENABLE;")
    else:
        print("\n❌ El login 'app_user' NO EXISTE en el servidor")
        print("\n💡 Para crearlo, ejecuta:")
        print("""
   CREATE LOGIN app_user WITH PASSWORD = 'Joarcu$2025';
   USE DB_Operation;
   CREATE USER app_user FOR LOGIN app_user;
   ALTER ROLE db_datareader ADD MEMBER app_user;
   ALTER ROLE db_datawriter ADD MEMBER app_user;
        """)
    
    # Verificar usuario en la base de datos
    print("\n" + "="*80)
    print("ESTADO DEL USUARIO EN LA BASE DE DATOS")
    print("="*80)
    
    cur.execute("""
        SELECT 
            name,
            type_desc,
            create_date
        FROM sys.database_principals
        WHERE name = 'app_user'
    """)
    
    user_info = cur.fetchone()
    
    if user_info:
        name, type_desc, create_date = user_info
        print(f"\n📋 Información del Usuario:")
        print(f"  Nombre: {name}")
        print(f"  Tipo: {type_desc}")
        print(f"  Creado: {create_date}")
        
        # Ver roles
        cur.execute("""
            SELECT r.name
            FROM sys.database_role_members rm
            JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
            JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
            WHERE u.name = 'app_user'
            ORDER BY r.name
        """)
        
        roles = cur.fetchall()
        if roles:
            print(f"\n  Roles asignados:")
            for row in roles:
                print(f"    • {row[0]}")
        else:
            print(f"\n  ⚠️  No tiene roles asignados")
    else:
        print("\n❌ El usuario 'app_user' NO EXISTE en la base de datos")
    
    # Intentar resetear la contraseña
    print("\n" + "="*80)
    print("SOLUCIÓN PROPUESTA")
    print("="*80)
    
    if login_info:
        print("\n💡 El login existe. Posibles problemas:")
        print("  1. Contraseña incorrecta")
        print("  2. Login deshabilitado")
        print("  3. Permisos de conexión")
        
        print("\n🔧 Para resetear la contraseña, ejecuta:")
        print("   ALTER LOGIN app_user WITH PASSWORD = 'Joarcu$2025';")
        
        if is_disabled:
            print("\n🔧 Para habilitar el login, ejecuta:")
            print("   ALTER LOGIN app_user ENABLE;")
        
        # Intentar resetear la contraseña automáticamente
        try:
            print("\n🔄 Intentando resetear la contraseña...")
            cur.execute("ALTER LOGIN app_user WITH PASSWORD = 'Joarcu$2025'")
            print("✅ Contraseña reseteada exitosamente")
            
            if is_disabled:
                print("\n🔄 Intentando habilitar el login...")
                cur.execute("ALTER LOGIN app_user ENABLE")
                print("✅ Login habilitado exitosamente")
            
            print("\n✅ Ahora intenta conectarte nuevamente con app_user")
            
        except Exception as e:
            print(f"\n❌ Error al resetear: {e}")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
