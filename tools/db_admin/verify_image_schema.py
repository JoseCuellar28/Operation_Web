import pymssql
import json
from datetime import datetime

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'
DATABASES = ['DB_Operation', 'Opera_Main']

def execute_query(cursor, query, description):
    """Execute a query and return results with description"""
    print(f"\n{'='*80}")
    print(f"QUERY: {description}")
    print(f"{'='*80}")
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        
        results = {
            'description': description,
            'columns': columns,
            'rows': rows,
            'row_count': len(rows),
            'status': 'SUCCESS'
        }
        
        # Print results
        if columns:
            print(f"\n{' | '.join(columns)}")
            print("-" * 80)
            for row in rows:
                print(f"{' | '.join(str(val) for val in row)}")
        print(f"\nTotal rows: {len(rows)}")
        
        return results
    except Exception as e:
        print(f"ERROR: {e}")
        return {
            'description': description,
            'error': str(e),
            'status': 'ERROR'
        }

def main():
    conn = None
    all_results = []
    
    try:
        print(f"Connecting to {SERVER} as {USER}...")
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, autocommit=True)
        cursor = conn.cursor()
        
        # QUERY 1: Verificar esquema de photo_url en DB_Operation.COLABORADORES
        cursor.execute("USE DB_Operation")
        query1 = """
        SELECT 
            c.COLUMN_NAME, 
            c.DATA_TYPE, 
            c.CHARACTER_MAXIMUM_LENGTH, 
            c.IS_NULLABLE,
            c.COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS c
        WHERE c.TABLE_NAME = 'COLABORADORES' 
        AND c.COLUMN_NAME = 'photo_url'
        """
        result1 = execute_query(cursor, query1, "1. Esquema de photo_url en DB_Operation.COLABORADORES")
        all_results.append(result1)
        
        # QUERY 2: Verificar esquema de photo_url en Opera_Main.COLABORADORES
        cursor.execute("USE Opera_Main")
        query2 = """
        SELECT 
            c.COLUMN_NAME, 
            c.DATA_TYPE, 
            c.CHARACTER_MAXIMUM_LENGTH, 
            c.IS_NULLABLE,
            c.COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS c
        WHERE c.TABLE_NAME = 'COLABORADORES' 
        AND c.COLUMN_NAME = 'photo_url'
        """
        result2 = execute_query(cursor, query2, "2. Esquema de photo_url en Opera_Main.COLABORADORES")
        all_results.append(result2)
        
        # QUERY 3: Contar registros con photo_url en DB_Operation
        cursor.execute("USE DB_Operation")
        query3 = """
        SELECT 
            COUNT(*) as total_records,
            COUNT(photo_url) as records_with_photo,
            COUNT(*) - COUNT(photo_url) as records_without_photo,
            CAST(COUNT(photo_url) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) as percentage_with_photo
        FROM COLABORADORES
        """
        result3 = execute_query(cursor, query3, "3. Estadísticas de photo_url en DB_Operation.COLABORADORES")
        all_results.append(result3)
        
        # QUERY 4: Contar registros con photo_url en Opera_Main
        cursor.execute("USE Opera_Main")
        query4 = """
        SELECT 
            COUNT(*) as total_records,
            COUNT(photo_url) as records_with_photo,
            COUNT(*) - COUNT(photo_url) as records_without_photo,
            CAST(COUNT(photo_url) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) as percentage_with_photo
        FROM COLABORADORES
        """
        result4 = execute_query(cursor, query4, "4. Estadísticas de photo_url en Opera_Main.COLABORADORES")
        all_results.append(result4)
        
        # QUERY 5: Muestras de photo_url (primeros 10 registros no nulos)
        cursor.execute("USE DB_Operation")
        query5 = """
        SELECT TOP 10
            id,
            dni,
            nombre,
            photo_url,
            LEN(photo_url) as url_length
        FROM COLABORADORES
        WHERE photo_url IS NOT NULL
        ORDER BY id
        """
        result5 = execute_query(cursor, query5, "5. Muestra de registros con photo_url en DB_Operation.COLABORADORES")
        all_results.append(result5)
        
        # Save results to JSON
        output_file = 'verification_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'server': SERVER,
                'databases': DATABASES,
                'results': all_results
            }, f, indent=2, default=str)
        
        print(f"\n\n{'='*80}")
        print(f"Results saved to: {output_file}")
        print(f"{'='*80}")
        
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
    finally:
        if conn:
            conn.close()
            print("\nConnection closed.")

if __name__ == "__main__":
    main()
