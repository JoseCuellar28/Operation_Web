
import pyodbc
from datetime import datetime

# Connection string
conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=OperationWebDB;UID=sa;PWD=YourStrong!Passw0rd;TrustServerCertificate=yes;"

def create_table():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Check if table exists
        cursor.execute("IF OBJECT_ID('Vehiculos', 'U') IS NOT NULL SELECT 1 ELSE SELECT 0")
        exists = cursor.fetchone()[0]

        if exists:
            print("Table 'Vehiculos' already exists.")
        else:
            print("Creating table 'Vehiculos'...")
            cursor.execute("""
                CREATE TABLE Vehiculos (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Placa NVARCHAR(20) NOT NULL,
                    Marca NVARCHAR(100) NOT NULL,
                    TipoActivo NVARCHAR(50) NOT NULL,
                    MaxVolumen NVARCHAR(50),
                    Estado NVARCHAR(20) NOT NULL DEFAULT 'OPERATIVO',
                    Activo BIT NOT NULL DEFAULT 1,
                    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                );
                
                CREATE UNIQUE INDEX IX_Vehiculos_Placa ON Vehiculos(Placa);
            """)
            conn.commit()
            print("Table 'Vehiculos' created successfully.")

        # Insert generic data as confirmed by user "crea una copia fiel" (faithful copy needs data to see)
        # Check if empty
        cursor.execute("SELECT COUNT(*) FROM Vehiculos")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("Seeding initial data...")
            cursor.execute("""
                INSERT INTO Vehiculos (Placa, Marca, TipoActivo, MaxVolumen, Estado) VALUES
                ('ABC-123', 'Toyota Hilux', 'CAMIONETA', 'ALTO', 'OPERATIVO'),
                ('XYZ-987', 'Nissan Frontier', 'CAMIONETA', 'ALTO', 'TALLER'),
                ('MOTO-01', 'Honda 150', 'MOTO', 'BAJO', 'OPERATIVO');
            """)
            conn.commit()
            print("Initial data seeded.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_table()
