
import pymssql
import json
import sys

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'

TARGETS = [
    {
        'database': 'DB_Operation',
        'tables': ['Users', 'PersonalStaging', 'SystemSettings', 'Personal', 'PROYECTOS', 'Proyectos', 'Projects']
    },
    {
        'database': 'Opera_Main',
        'tables': ['ORDENES_TRABAJO', 'LOTE_VALORIZACION', 'ASISTENCIA_DIARIA', 'COSTOS_CIERRE', 'LIQUIDACIONES_CUADRILLA', 'COLABORADORES', 'Personal']
    }
]

def audit_db():
    results = {}
    
    try:
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD)
        cursor = conn.cursor(as_dict=True)
        
        for target in TARGETS:
            db_name = target['database']
            results[db_name] = {}
            
            print(f"Scanning {db_name}...")
            
            for table in target['tables']:
                try:
                    query = f"""
                    SELECT 
                        c.name as column_name,
                        t.name as data_type,
                        c.max_length,
                        c.is_nullable
                    FROM {db_name}.sys.columns c
                    JOIN {db_name}.sys.types t ON c.user_type_id = t.user_type_id
                    JOIN {db_name}.sys.tables tb ON c.object_id = tb.object_id
                    WHERE tb.name = '{table}'
                    ORDER BY c.column_id
                    """
                    cursor.execute(query)
                    columns = cursor.fetchall()
                    
                    if not columns:
                        results[db_name][table] = "NOT_FOUND"
                    else:
                        results[db_name][table] = columns
                        
                except Exception as e:
                    results[db_name][table] = f"ERROR: {str(e)}"
        
        conn.close()
        
        # Save Report
        with open('PHYSICAL_SCHEMA_REPORT.json', 'w') as f:
            json.dump(results, f, indent=2)
            
        print("Audit Complete. Report saved to PHYSICAL_SCHEMA_REPORT.json")

    except Exception as e:
        print(f"Connection Failed: {str(e)}")

if __name__ == "__main__":
    audit_db()
