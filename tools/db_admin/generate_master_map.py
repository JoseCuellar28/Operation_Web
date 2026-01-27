import pymssql
import os

# Configuration (Toshiba)
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'
DATABASES = ['DB_Operation', 'Opera_Main']

def get_constraints(cursor, db_name):
    """Fetches PK and FK constraints for the database."""
    query = """
    SELECT 
        tc.TABLE_NAME, 
        kcu.COLUMN_NAME, 
        tc.CONSTRAINT_TYPE
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
    WHERE tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'FOREIGN KEY')
    """
    cursor.execute(f"USE {db_name}")
    cursor.execute(query)
    constraints = {}
    for row in cursor.fetchall():
        table = row[0]
        col = row[1]
        ctype = row[2]
        if table not in constraints:
            constraints[table] = {}
        constraints[table][col] = 'PK' if ctype == 'PRIMARY KEY' else 'FK'
    return constraints

def generate_map():
    print("Generating Master Data Map...")
    conn = None
    output_md = "# 🗺️ MAPA MAESTRO DE DATOS\n\nFecha de Auditoría: 2026-01-27\nServidor: Toshiba (100.125.169.14)\n\n"
    
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, autocommit=True)
        cursor = conn.cursor()

        for db in DATABASES:
            print(f"Processing {db}...")
            output_md += f"# Base de Datos: `{db}`\n\n"
            
            # Get Constraints map
            constraints_map = get_constraints(cursor, db)
            
            # Master Query (User provided + extra checks logic implied)
            query = """
            SELECT 
                TABLE_SCHEMA,
                TABLE_NAME, 
                COLUMN_NAME, 
                DATA_TYPE, 
                CHARACTER_MAXIMUM_LENGTH, 
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
            """
            cursor.execute(f"USE {db}")
            cursor.execute(query)
            columns = cursor.fetchall()
            
            # Group by Table
            tables = {}
            for col in columns:
                schema, table, col_name, dtype, length, nullable = col
                full_table_name = f"{schema}.{table}"
                if full_table_name not in tables:
                    tables[full_table_name] = []
                tables[full_table_name].append({
                    'name': col_name,
                    'type': dtype,
                    'length': str(length) if length is not None else '',
                    'nullable': nullable
                })
            
            # Index
            output_md += "## Índice de Tablas\n"
            for t_name in tables.keys():
                output_md += f"- [{t_name}](#{t_name.replace('.', '').lower()})\n"
            output_md += "\n"
            
            # Details
            output_md += "## Detalle de Tablas\n\n"
            for t_name, cols in tables.items():
                simple_table_name = t_name.split('.')[1]
                output_md += f"### {t_name}\n"
                output_md += "| Columna | Tipo | Longitud | Nullable | Key |\n"
                output_md += "| :--- | :--- | :--- | :--- | :---: |\n"
                
                table_constraints = constraints_map.get(simple_table_name, {})
                
                for col in cols:
                    key_badge = ""
                    if col['name'] in table_constraints:
                        k_type = table_constraints[col['name']]
                        key_badge = "🔑 PK" if k_type == 'PK' else "🔗 FK"
                    
                    output_md += f"| `{col['name']}` | `{col['type']}` | {col['length']} | {col['nullable']} | {key_badge} |\n"
                output_md += "\n---\n\n"

        # Save to file
        with open('docs/MAPA_MAESTRO_DATOS.md', 'w') as f:
            f.write(output_md)
        print("Success! docs/MAPA_MAESTRO_DATOS.md generated.")

    except Exception as e:
        print(f"Critical Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    generate_map()
