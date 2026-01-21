import pymssql
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/Users/josearbildocuellar/Github/Operation_Web-1/OperationWeb.API/.env')

def get_db_connection():
    server = '100.112.55.58'
    database = 'DB_Operation'
    username = 'app_user'
    password = 'joarcu$2025'
    
    return pymssql.connect(server, username, password, database)

def analyze_projects():
    conn = get_db_connection()
    cursor = conn.cursor()

    print("--- Analyzing Project Status Logic ---")

    # 1. Get Active Counts per Area from Personal
    sql_personal = """
    SELECT 
        Area,
        COUNT(*) as Total,
        SUM(CASE WHEN FechaCese IS NULL OR FechaCese > GETDATE() THEN 1 ELSE 0 END) as ActiveCount
    FROM Personal
    WHERE Area IS NOT NULL AND Area != ''
    GROUP BY Area
    """
    cursor.execute(sql_personal)
    areas_stats = {}
    for row in cursor.fetchall():
        # row: (Area, Total, ActiveCount)
        area = row[0]
        total = row[1]
        active_count = row[2]
        
        areas_stats[area] = {
            'Total': total,
            'ActiveCount': active_count,
            'ExpectedStatus': 'Activo' if active_count > 0 else 'Inactivo'
        }

    # 2. Get Current Projects
    sql_proyectos = "SELECT Nombre, Estado FROM Proyectos"
    cursor.execute(sql_proyectos)
    
    print(f"{'PROJECT':<40} | {'CURRENT':<10} | {'EXPECTED':<10} | {'ACTIVE EMPL':<12} | {'MATCH?'}")
    print("-" * 100)

    mismatch_count = 0
    total_projects = 0

    for row in cursor.fetchall():
        total_projects += 1
        project_name = row[0]
        current_status = row[1]
        
        if project_name in areas_stats:
            stats = areas_stats[project_name]
            expected = stats['ExpectedStatus']
            active_count = stats['ActiveCount']
            
            match = "OK" if current_status == expected else "MISMATCH"
            if match == "MISMATCH":
                mismatch_count += 1
                
            print(f"{project_name:<40} | {current_status:<10} | {expected:<10} | {active_count:<12} | {match}")
        else:
            print(f"{project_name:<40} | {current_status:<10} | {'Inactivo':<10} | {'0 (No Area)':<12} | {'CHECK'}")

    print("-" * 100)
    print(f"Total Projects: {total_projects}")
    print(f"Mismatches found: {mismatch_count}")

    conn.close()

if __name__ == "__main__":
    try:
        analyze_projects()
    except Exception as e:
        print(f"Error: {e}")
