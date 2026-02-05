import pymssql
import json
from datetime import datetime
from collections import defaultdict

# Configuration
SERVER = '100.125.169.14'
USER = 'SA'
PASSWORD = 'Joarcu28'
DATABASES = ['DB_Operation', 'Opera_Main']

def get_all_tables(cursor, db_name):
    """Get all tables in a database"""
    print(f"\n{'='*80}")
    print(f"TABLES IN {db_name}")
    print(f"{'='*80}")
    
    cursor.execute(f"USE {db_name}")
    query = """
    SELECT 
        TABLE_SCHEMA,
        TABLE_NAME,
        TABLE_TYPE
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
    """
    cursor.execute(query)
    tables = cursor.fetchall()
    
    print(f"\n{'SCHEMA':<20} {'TABLE_NAME':<40} {'TYPE':<15}")
    print("-" * 80)
    for table in tables:
        print(f"{table[0]:<20} {table[1]:<40} {table[2]:<15}")
    
    print(f"\nTotal tables: {len(tables)}")
    return tables

def get_table_columns(cursor, db_name, table_name):
    """Get all columns for a table"""
    cursor.execute(f"USE {db_name}")
    query = f"""
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = '{table_name}'
    ORDER BY ORDINAL_POSITION
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_foreign_keys(cursor, db_name):
    """Get all foreign key relationships in a database"""
    print(f"\n{'='*80}")
    print(f"FOREIGN KEYS IN {db_name}")
    print(f"{'='*80}")
    
    cursor.execute(f"USE {db_name}")
    query = """
    SELECT 
        fk.name AS FK_NAME,
        tp.name AS PARENT_TABLE,
        cp.name AS PARENT_COLUMN,
        tr.name AS REFERENCED_TABLE,
        cr.name AS REFERENCED_COLUMN
    FROM sys.foreign_keys AS fk
    INNER JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.tables AS tp ON fkc.parent_object_id = tp.object_id
    INNER JOIN sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
    INNER JOIN sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
    INNER JOIN sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
    ORDER BY tp.name, fk.name
    """
    cursor.execute(query)
    fks = cursor.fetchall()
    
    print(f"\n{'PARENT_TABLE':<30} {'PARENT_COLUMN':<20} {'REFERENCED_TABLE':<30} {'REFERENCED_COLUMN':<20}")
    print("-" * 100)
    for fk in fks:
        print(f"{fk[1]:<30} {fk[2]:<20} {fk[3]:<30} {fk[4]:<20}")
    
    print(f"\nTotal foreign keys: {len(fks)}")
    return fks

def find_personal_references(cursor, db_name):
    """Find all tables that reference Personal table (by DNI or other fields)"""
    print(f"\n{'='*80}")
    print(f"SEARCHING FOR PERSONAL REFERENCES IN {db_name}")
    print(f"{'='*80}")
    
    cursor.execute(f"USE {db_name}")
    
    # Search for columns named DNI, PersonalId, etc.
    query = """
    SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE COLUMN_NAME LIKE '%DNI%' 
       OR COLUMN_NAME LIKE '%Personal%'
       OR COLUMN_NAME LIKE '%Inspector%'
    ORDER BY TABLE_NAME, COLUMN_NAME
    """
    cursor.execute(query)
    refs = cursor.fetchall()
    
    print(f"\n{'TABLE_NAME':<40} {'COLUMN_NAME':<30} {'DATA_TYPE':<15} {'LENGTH':<10}")
    print("-" * 100)
    for ref in refs:
        length = str(ref[3]) if ref[3] else 'N/A'
        print(f"{ref[0]:<40} {ref[1]:<30} {ref[2]:<15} {length:<10}")
    
    print(f"\nTotal potential references: {len(refs)}")
    return refs

def get_table_row_counts(cursor, db_name, tables):
    """Get row counts for all tables"""
    print(f"\n{'='*80}")
    print(f"ROW COUNTS IN {db_name}")
    print(f"{'='*80}")
    
    cursor.execute(f"USE {db_name}")
    counts = []
    
    print(f"\n{'TABLE_NAME':<40} {'ROW_COUNT':<15}")
    print("-" * 60)
    
    for table in tables:
        table_name = table[1]
        try:
            cursor.execute(f"SELECT COUNT(*) FROM [{table_name}]")
            count = cursor.fetchone()[0]
            counts.append((table_name, count))
            print(f"{table_name:<40} {count:<15,}")
        except Exception as e:
            print(f"{table_name:<40} ERROR: {str(e)[:30]}")
            counts.append((table_name, -1))
    
    return counts

def main():
    conn = None
    audit_results = {
        'timestamp': datetime.now().isoformat(),
        'server': SERVER,
        'databases': {}
    }
    
    try:
        print(f"Connecting to {SERVER} as {USER}...")
        conn = pymssql.connect(server=SERVER, user=USER, password=PASSWORD, autocommit=True)
        cursor = conn.cursor()
        
        for db_name in DATABASES:
            print(f"\n\n{'#'*80}")
            print(f"# AUDITING DATABASE: {db_name}")
            print(f"{'#'*80}")
            
            db_audit = {}
            
            # Get all tables
            tables = get_all_tables(cursor, db_name)
            db_audit['tables'] = [{'schema': t[0], 'name': t[1], 'type': t[2]} for t in tables]
            
            # Get foreign keys
            fks = get_foreign_keys(cursor, db_name)
            db_audit['foreign_keys'] = [
                {
                    'fk_name': fk[0],
                    'parent_table': fk[1],
                    'parent_column': fk[2],
                    'referenced_table': fk[3],
                    'referenced_column': fk[4]
                } for fk in fks
            ]
            
            # Find Personal references
            refs = find_personal_references(cursor, db_name)
            db_audit['personal_references'] = [
                {
                    'table': ref[0],
                    'column': ref[1],
                    'data_type': ref[2],
                    'length': ref[3]
                } for ref in refs
            ]
            
            # Get row counts
            counts = get_table_row_counts(cursor, db_name, tables)
            db_audit['row_counts'] = [{'table': c[0], 'count': c[1]} for c in counts]
            
            audit_results['databases'][db_name] = db_audit
        
        # Save results
        output_file = 'database_audit_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(audit_results, f, indent=2, default=str)
        
        print(f"\n\n{'='*80}")
        print(f"AUDIT COMPLETE - Results saved to: {output_file}")
        print(f"{'='*80}")
        
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
    finally:
        if conn:
            conn.close()
            print("\nConnection closed.")

if __name__ == "__main__":
    main()
