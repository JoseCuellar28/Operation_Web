import pandas as pd
import os

file_path = '/Users/josearbildocuellar/Github/Operation_Web-1/etl-service/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

try:
    df = pd.read_excel(file_path, header=3)
    print("Columns found:", df.columns.tolist())
    
    date_cols = ['AREA-PROYECTO']
    
    for col in date_cols:
        if col in df.columns:
            print(f"\n--- Inspecting {col} ---")
            sample = df[col].dropna().head(5)
            print(sample)
            print("Data Types:", sample.apply(type).unique())
        else:
            print(f"\nColumn {col} not found in Excel.")

            
except Exception as e:
    print(f"Error reading Excel: {e}")
