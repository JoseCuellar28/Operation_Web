import pandas as pd
file_path = "/Users/josearbildocuellar/Github/Operation_Web-1/etl-service/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx"
sheet = "ENE 25"
try:
    df = pd.read_excel(file_path, sheet_name=sheet, header=None, nrows=10)
    print(df.to_string())
except Exception as e:
    print(e)
