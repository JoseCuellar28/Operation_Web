
import pandas as pd

# Data mimicking Calidda format
data = {
    'SOLICITUD': ['10203040', '10203041', '10203042', '10203043'],
    'CLIENTE': ['Juan Pérez', 'Maria Lopez', 'Carlos Ruiz', 'Ana Gomez'],
    'DIRECCION': ['Av. Javier Prado 123', 'Jr. Union 456', '', 'Calle 7 890'], # One empty address to test validation
    'DISTRITO': ['San Borja', 'Lima', 'Miraflores', 'Surco'],
    'ESTADO': ['PENDIENTE', 'URGENTE', 'NORMAL', 'PRIORITARIO'],
    'TIPO DE HAB': ['Instalación', 'Mantenimiento', 'Instalación', 'Habilitación'],
    'COMENTARIO': ['Llamar antes', 'Perro bravo', '', 'Casa esquina']
}

df = pd.DataFrame(data)
df.to_excel('test_orders.xlsx', index=False)
print("test_orders.xlsx created")
