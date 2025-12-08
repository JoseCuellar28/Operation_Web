

import pytds

def list_users():
    try:
        # Credenciales directas (como en check_db_users.py)
        server = '100.112.55.58'
        database = 'DB_Operation'
        user = 'sa'
        password = 'Joarcu28'
        port = 1433

        print(f"Conectando a {server}:{port}...")

        with pytds.connect(
            server=server,
            user=user,
            password=password,
            database=database,
            port=port,
            autocommit=True
        ) as conn:
            cursor = conn.cursor()

            print("\n" + "="*120)
            print(f"{'DNI / USERNAME':<15} | {'NOMBRE COMPLETO':<35} | {'ROL (DB)':<15} | {'CARGO (Personal)':<25} | {'TIPO':<15}")
            print("="*120)


            # Query with correct column names
            query = """
            SELECT 
                u.DNI,
                u.Role,
                CASE WHEN p.Inspector IS NOT NULL THEN p.Inspector ELSE 'Usuario Sin Perfil' END as NombreCompleto,
                p.Tipo,
                p.Categoria
            FROM Users u
            LEFT JOIN Personal p ON u.DNI = p.DNI
            ORDER BY u.DNI
            """
            
            cursor.execute(query)
            rows = cursor.fetchall()

            for row in rows:
                dni = row[0] if row[0] else "N/A"
                rol_db = row[1] if row[1] else "(Derivado)"
                nombre = row[2] if row[2] else "N/A"
                tipo = row[3] if row[3] else ""
                categoria = row[4] if row[4] else ""

                # Simulate Derivation Logic for display
                derived_role = rol_db
                if rol_db == "(Derivado)" or rol_db in ["USER", "User"]:
                    if tipo and "GERENTE" in tipo.upper(): derived_role = "Manager (Est)"
                    elif tipo and ("JEFE" in tipo.upper() or "COORDINADOR" in tipo.upper() or "RESIDENTE" in tipo.upper()): derived_role = "ProjectAdmin (Est)"
                    elif tipo and "SUPERVISOR" in tipo.upper(): derived_role = "Supervisor (Est)"
                    elif tipo and any(x in tipo.upper() for x in ["OPERARIO", "CHOFER", "TECNICO", "PRACTICANTE"]): derived_role = "Field (Est)"
                    else: derived_role = "User (Est)"

                print(f"{dni:<15} | {nombre[:35]:<35} | {derived_role:<20} | {tipo[:25]:<25}")

            print("="*120)
            print("* (Est) = Estimado/Derivado automáticamente si no hay rol explícito en Users.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users()
