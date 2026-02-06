#!/usr/bin/env python3
"""
Inspect Personal table to see available job positions (Tipo column)
"""
import pyodbc
import sys

# Connection string
SERVER = '100.125.169.14'
DATABASE = 'DB_Operation'
USERNAME = 'sa'
PASSWORD = 'Joarcu28'

def inspect_personal_tipos():
    """Query distinct values from Personal.Tipo column"""
    try:
        conn_str = (
            f'DRIVER={{ODBC Driver 17 for SQL Server}};'
            f'SERVER={SERVER};'
            f'DATABASE={DATABASE};'
            f'UID={USERNAME};'
            f'PWD={PASSWORD};'
            f'TrustServerCertificate=yes;'
        )
        
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        print(f"✅ Connected to {DATABASE} on {SERVER}\n")
        
        # Get distinct Tipo values with counts
        query = """
        SELECT 
            Tipo,
            COUNT(*) as Count
        FROM dbo.Personal
        WHERE Tipo IS NOT NULL
        GROUP BY Tipo
        ORDER BY Count DESC
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print("=" * 60)
        print("VALORES DISPONIBLES EN COLUMNA 'Tipo' (Cargos/Puestos)")
        print("=" * 60)
        print(f"{'Tipo':<30} {'Cantidad':<10}")
        print("-" * 60)
        
        for row in rows:
            tipo = row.Tipo if row.Tipo else "(NULL)"
            count = row.Count
            print(f"{tipo:<30} {count:<10}")
        
        print("-" * 60)
        print(f"Total de tipos distintos: {len(rows)}\n")
        
        # Also check total records
        cursor.execute("SELECT COUNT(*) FROM dbo.Personal")
        total = cursor.fetchone()[0]
        print(f"Total de registros en Personal: {total}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    inspect_personal_tipos()
