import os
import pytds
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('etl-service/.env')

def check_database_users():
    # Usar credenciales de appsettings.json temporalmente
    server = '100.112.55.58'
    database = 'DB_Operation'
    user = 'sa'
    password = 'Joarcu28'
    port = 1433
    
    print(f"Conectando a {server}:{port} como {user}...")
    
    try:
        with pytds.connect(
            server=server,
            user=user,
            password=password,
            database=database,
            port=port,
            autocommit=True
        ) as conn:
            cur = conn.cursor()
            
            print("\n" + "="*80)
            print("USUARIOS DE SQL SERVER")
            print("="*80)
            
            # Listar todos los logins del servidor
            cur.execute("""
                SELECT 
                    name,
                    type_desc,
                    create_date,
                    is_disabled
                FROM sys.server_principals
                WHERE type IN ('S', 'U')  -- S = SQL Login, U = Windows Login
                AND name NOT LIKE '##%'   -- Excluir usuarios del sistema
                ORDER BY name
            """)
            
            print("\n📋 Logins del Servidor:")
            print("-" * 80)
            print(f"{'Nombre':<30} {'Tipo':<20} {'Creado':<20} {'Deshabilitado'}")
            print("-" * 80)
            
            logins = []
            for row in cur.fetchall():
                name, type_desc, create_date, is_disabled = row
                logins.append(name)
                status = "❌ Sí" if is_disabled else "✅ No"
                print(f"{name:<30} {type_desc:<20} {str(create_date):<20} {status}")
            
            # Verificar si app_user existe
            app_user_exists = 'app_user' in logins
            
            print("\n" + "="*80)
            print("USUARIOS DE LA BASE DE DATOS")
            print("="*80)
            
            # Listar usuarios de la base de datos actual
            cur.execute("""
                SELECT 
                    dp.name AS user_name,
                    dp.type_desc,
                    dp.create_date,
                    ISNULL(sp.name, 'Sin Login') AS login_name
                FROM sys.database_principals dp
                LEFT JOIN sys.server_principals sp ON dp.sid = sp.sid
                WHERE dp.type IN ('S', 'U')
                AND dp.name NOT IN ('guest', 'INFORMATION_SCHEMA', 'sys', 'dbo')
                ORDER BY dp.name
            """)
            
            print("\n📋 Usuarios de la Base de Datos:")
            print("-" * 80)
            print(f"{'Usuario DB':<30} {'Tipo':<20} {'Login Asociado':<30}")
            print("-" * 80)
            
            db_users = []
            for row in cur.fetchall():
                user_name, type_desc, create_date, login_name = row
                db_users.append(user_name)
                print(f"{user_name:<30} {type_desc:<20} {login_name:<30}")
            
            # Verificar permisos de app_user si existe
            if 'app_user' in db_users:
                print("\n" + "="*80)
                print("PERMISOS DE app_user")
                print("="*80)
                
                cur.execute("""
                    SELECT 
                        dp.class_desc,
                        dp.permission_name,
                        dp.state_desc,
                        OBJECT_NAME(dp.major_id) AS object_name
                    FROM sys.database_permissions dp
                    JOIN sys.database_principals u ON dp.grantee_principal_id = u.principal_id
                    WHERE u.name = 'app_user'
                    ORDER BY dp.class_desc, dp.permission_name
                """)
                
                print("\n📋 Permisos Directos:")
                print("-" * 80)
                print(f"{'Clase':<30} {'Permiso':<30} {'Estado':<15} {'Objeto'}")
                print("-" * 80)
                
                permissions = cur.fetchall()
                if permissions:
                    for row in permissions:
                        class_desc, perm_name, state_desc, obj_name = row
                        obj_name = obj_name or 'N/A'
                        print(f"{class_desc:<30} {perm_name:<30} {state_desc:<15} {obj_name}")
                else:
                    print("⚠️  No tiene permisos directos asignados")
                
                # Verificar roles
                cur.execute("""
                    SELECT r.name
                    FROM sys.database_role_members rm
                    JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
                    JOIN sys.database_principals u ON rm.member_principal_id = u.principal_id
                    WHERE u.name = 'app_user'
                """)
                
                print("\n📋 Roles Asignados:")
                print("-" * 80)
                roles = cur.fetchall()
                if roles:
                    for row in roles:
                        print(f"  • {row[0]}")
                else:
                    print("⚠️  No tiene roles asignados")
            
            # Resumen
            print("\n" + "="*80)
            print("RESUMEN")
            print("="*80)
            
            if app_user_exists:
                print("✅ Login 'app_user' EXISTE en el servidor")
            else:
                print("❌ Login 'app_user' NO EXISTE en el servidor")
            
            if 'app_user' in db_users:
                print("✅ Usuario 'app_user' EXISTE en la base de datos")
            else:
                print("❌ Usuario 'app_user' NO EXISTE en la base de datos")
            
            print("\n📌 Recomendación:")
            if not app_user_exists:
                print("""
Para crear el usuario app_user con permisos limitados:

1. Crear Login en el servidor:
   CREATE LOGIN app_user WITH PASSWORD = 'ContraseñaSegura123!';

2. Crear Usuario en la base de datos:
   USE DB_Operation;
   CREATE USER app_user FOR LOGIN app_user;

3. Asignar permisos (solo lo necesario):
   -- Lectura y escritura en tablas
   ALTER ROLE db_datareader ADD MEMBER app_user;
   ALTER ROLE db_datawriter ADD MEMBER app_user;
   
   -- Ejecutar stored procedures (si los hay)
   GRANT EXECUTE TO app_user;

4. Actualizar appsettings.json para usar app_user en lugar de sa
                """)
            else:
                print("✅ El usuario app_user ya existe. Verifica los permisos arriba.")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    check_database_users()
