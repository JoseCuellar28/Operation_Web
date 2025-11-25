import sys
from db_config import get_connection
from tabulate import tabulate

def get_schema_details():
    print("Fetching schema details...")
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Get all tables first
                cur.execute("""
                    SELECT TABLE_SCHEMA, TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE'
                    ORDER BY TABLE_SCHEMA, TABLE_NAME
                """)
                tables = cur.fetchall()

                if not tables:
                    print("No tables found.")
                    return

                for schema, table in tables:
                    print(f"\n### Table: {schema}.{table}")
                    
                    # Get columns for this table
                    cur.execute("""
                        SELECT 
                            COLUMN_NAME, 
                            DATA_TYPE, 
                            CHARACTER_MAXIMUM_LENGTH, 
                            IS_NULLABLE,
                            COLUMN_DEFAULT
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
                        ORDER BY ORDINAL_POSITION
                    """, (schema, table))
                    
                    columns = cur.fetchall()
                    headers = ["Column", "Type", "Max Length", "Nullable", "Default"]
                    print(tabulate(columns, headers=headers, tablefmt="github"))
                    
                return True
    except Exception as e:
        print(f"Error fetching schema: {e}")
        return False

if __name__ == "__main__":
    get_schema_details()
