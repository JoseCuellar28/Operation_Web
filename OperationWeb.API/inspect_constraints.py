
import pymssql
import json

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'

TARGETS = [
    {'db': 'Opera_Main', 'table': 'COLABORADORES', 'column': 'dni'},
    {'db': 'Opera_Main', 'table': 'ASISTENCIA_DIARIA', 'column': 'dni_colaborador'}
]

def inspect_constraints():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD)
        cursor = conn.cursor(as_dict=True)
        
        report = []
        
        for t in TARGETS:
            print(f"Checking {t['table']}.{t['column']}...")
            query = f"""
            SELECT 
                t.name as TableName,
                ind.name as IndexName,
                ind.is_primary_key,
                ind.is_unique
            FROM {t['db']}.sys.indexes ind
            INNER JOIN {t['db']}.sys.index_columns ic ON  ind.object_id = ic.object_id and ind.index_id = ic.index_id
            INNER JOIN {t['db']}.sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id
            INNER JOIN {t['db']}.sys.tables t ON ind.object_id = t.object_id
            WHERE t.name = '{t['table']}' AND col.name = '{t['column']}'
            """
            cursor.execute(query)
            indexes = cursor.fetchall()
            
            # Check for Default Constraints
            query_def = f"""
            SELECT 
                dc.name as ConstraintName
            FROM {t['db']}.sys.default_constraints dc
            INNER JOIN {t['db']}.sys.columns c ON dc.parent_column_id = c.column_id AND dc.parent_object_id = c.object_id
            INNER JOIN {t['db']}.sys.tables t ON dc.parent_object_id = t.object_id
            WHERE t.name = '{t['table']}' AND c.name = '{t['column']}'
            """
            cursor.execute(query_def)
            defaults = cursor.fetchall()

            report.append({
                'table': t['table'],
                'column': t['column'],
                'indexes': indexes,
                'defaults': defaults
            })
            
        print(json.dumps(report, indent=2))
        conn.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    inspect_constraints()
