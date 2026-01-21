import pandas as pd
import random

# Create dummy data
data = []
for i in range(10):
    dni = f"1000000{i}" + "X" * 10 # Make it longer than normal but within 80
    data.append({
        "DNI": dni,
        "Inspector": f"Colaborador Test {i}",
        "Telefono": f"90000000{i}",
        "Distrito": "Lima",
        "Tipo": "Tecnico",
        "Division": "Operaciones",
        "Area": "Mantenimiento",
        "Estado": "Activo",
        "FotoUrl": "",
        "DetalleCebe": "CEBE-001"
    })

df = pd.DataFrame(data)

# Save to Excel
df.to_excel("test_personal.xlsx", index=False)
print("Created test_personal.xlsx")
