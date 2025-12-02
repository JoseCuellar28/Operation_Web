import pandas as pd
import sys

file_path = "/Users/josearbildocuellar/Github/Operation_Web-1/etl-service/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx"

try:
    # Read the first few rows to find the header
    # User previously mentioned row 4 (index 3)
    df = pd.read_excel(file_path, header=3) 
    print("Headers found in row 4:")
    for col in df.columns:
        print(f"- {col}")
except Exception as e:
    print(f"Error reading Excel: {e}")
