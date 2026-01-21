
import pymssql
import json

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'

TARGETS = [
    {'db': 'DB_Operation', 'table': 'PROYECTOS', 'column': 'GerenteDni'},
    {'db': 'DB_Operation', 'table': 'PROYECTOS', 'column': 'JefeDni'}
]

def inspect_constraints():
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD)
        cursor = conn.cursor(as_dict=True)
        report = []
        
        for t in TARGETS:
            print(f"Checking {t['db']}.{t['table']}.{t['column']}...")
            
            # 1. Indexes
            query_idx = f"""
            SELECT 
                ind.name as IndexName
            FROM {t['db']}.sys.indexes ind
            INNER JOIN {t['db']}.sys.index_columns ic ON ind.object_id = ic.object_id and ind.index_id = ic.index_id
            INNER JOIN {t['db']}.sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id
            INNER JOIN {t['db']}.sys.tables tb ON ind.object_id = tb.object_id
            WHERE tb.name = '{t['table']}' AND col.name = '{t['column']}'
            """
            cursor.execute(query_idx)
            indexes = cursor.fetchall()
            
            # 2. Defaults
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
