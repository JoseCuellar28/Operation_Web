# Fase 4 Standalone: Carga de Personas a SQL Server

## Requisitos
- Python 3.9+
- Acceso a SQL Server 2022 (puerto `1433`)
- IP/host de la BD accesible (ej. Tailscale `100.112.55.58`)

## Instalación
- `cd fase4-standalone`
- `python3 -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`

## Configuración
- Copia `./.env.example` a `./.env` y completa:
```
DB_TYPE=sqlserver_pytds
DB_SERVER=100.112.55.58
DB_PORT=1433
DB_NAME=DB_Operation
DB_USER=sa
DB_PASSWORD=TuPassword
```

## Scripts SQL
- Copia los archivos de `fase4/sql/*.sql` a `fase4-standalone/sql/`
- Despliegue:
```
python lib/db_tools.py deploy
```

## Uso por CLI
- Análisis de Excel:
```
python lib/db_tools.py analyze --archivo "/ruta/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx" --hoja "ENE 25" --header_row 3 --usecols "B:AA"
```
- Cargar a `Personal_Staging`:
```
python lib/db_tools.py load_staging --archivo "/ruta/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx" --hoja "ENE 25" --header_row 3 --usecols "B:AA"
```
- MERGE al snapshot `Personal`:
```
python lib/db_tools.py merge_snapshot --archivo "/ruta/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx" --hoja "ENE 25" --header_row 3 --usecols "B:AA"
```
- Auditoría del lote:
```
python lib/db_tools.py audit --archivo "/ruta/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx" --hoja "ENE 25" --header_row 3 --usecols "B:AA"
```
- Verificación de conexión y tablas:
```
python lib/db_tools.py test
python lib/db_tools.py tables
```

## Servicio HTTP (Opcional)
- Iniciar servicio:
```
python server.py
```
- Endpoints:
  - `GET /api/health`
  - `GET /api/tables`
  - `POST /api/deploy-sql`
  - `POST /api/analyze` body:
```
{"archivo":"/ruta/BD COLABORADORES OCA GLOBAL 2025. (1).xlsx","hoja":"ENE 25","header_row":3,"usecols":"B:AA"}
```
  - `POST /api/load-staging` body igual al anterior
  - `POST /api/merge-snapshot` body igual al anterior
  - `POST /api/audit` body igual al anterior

## Notas de calidad de datos
- `DNI` se normaliza (elimina sufijo `.0` y caracteres no numéricos) para evitar duplicados.
- El snapshot `dbo.Personal` deduplica por `DNI`, actualizando estados por mes.
- Fechas (`FechaInicio`, `FechaCese`) se transforman a `DATE` en la inserción.

## Flujo recomendado por mes
1. `analyze` → validar conteos y mapeo
2. `load-staging` → persistir filas normalizadas
3. `merge-snapshot` → actualizar `dbo.Personal`
4. `audit` → registrar en `dbo.Historial_Cargas_Personal`