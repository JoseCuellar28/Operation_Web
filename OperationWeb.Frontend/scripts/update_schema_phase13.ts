import sql from 'mssql';
import { getConnection } from '../src/connections/sql';

async function updateSchemaPhase13() {
    console.log('Connecting to database for Phase 13 Logistics...');
    let pool;
    try {
        pool = await getConnection();

        // 1. Alter CATALOGO_MATERIALES add id_gesproyec
        console.log('1. Altering CATALOGO_MATERIALES...');
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CATALOGO_MATERIALES') AND name = 'id_gesproyec')
                BEGIN
                    ALTER TABLE CATALOGO_MATERIALES ADD id_gesproyec NVARCHAR(50) NULL;
                    PRINT 'Columna id_gesproyec agregada.';
                END
            `);
        } catch (e) {
            console.log('Error altering CATALOGO_MATERIALES (might exist)', e);
        }

        // 2. STOCK_ALMACEN (Warehouse Inventory)
        console.log('2. Creating STOCK_ALMACEN...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCK_ALMACEN')
            BEGIN
                CREATE TABLE STOCK_ALMACEN (
                    id_almacen NVARCHAR(50) NOT NULL DEFAULT 'MAIN',
                    id_material UNIQUEIDENTIFIER NOT NULL,
                    cantidad DECIMAL(10, 2) NOT NULL DEFAULT 0,
                    ultima_actualizacion DATETIME DEFAULT GETDATE(),
                    PRIMARY KEY (id_almacen, id_material),
                    FOREIGN KEY (id_material) REFERENCES CATALOGO_MATERIALES(id_material)
                );
            END
        `);

        // 3. STOCK_CUADRILLA (Technical Location Inventory)
        console.log('3. Creating STOCK_CUADRILLA...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCK_CUADRILLA')
            BEGIN
                CREATE TABLE STOCK_CUADRILLA (
                    id_cuadrilla INT NOT NULL, -- Links to CUADRILLA_DIARIA or generic entity
                    id_material UNIQUEIDENTIFIER NOT NULL,
                    cantidad DECIMAL(10, 2) NOT NULL DEFAULT 0,
                    ultima_actualizacion DATETIME DEFAULT GETDATE(),
                    PRIMARY KEY (id_cuadrilla, id_material),
                    -- We don't FK id_cuadrilla strictly to CUADRILLA_DIARIA because custody might persist beyond a day?
                    -- For now, let's link to the Daily Crew concept or just keep it loose to allow "Placa" or "DNI" as keys?
                    -- The requirement says: Technician(DNI) and Vehicle(Placa) are independent warehouses.
                    -- So sticking to 'id_cuadrilla' might be limiting if we want DNI/Placa specific.
                    -- Let's use a generic 'custodio_id' and 'tipo_custodio'.
                );
                DROP TABLE STOCK_CUADRILLA; -- Oops, let me redefine.
            END
        `);

        // Redefine STOCK_CUSTODIA (More flexible)
        console.log('3b. Creating STOCK_CUSTODIA (More flexible)...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'STOCK_CUSTODIA')
            BEGIN
                CREATE TABLE STOCK_CUSTODIA (
                    custodio_id NVARCHAR(50) NOT NULL, -- DNI or Placa
                    tipo_custodio NVARCHAR(20) NOT NULL CHECK (tipo_custodio IN ('TECNICO', 'VEHICULO')),
                    id_material UNIQUEIDENTIFIER NOT NULL,
                    cantidad DECIMAL(10, 2) NOT NULL DEFAULT 0,
                    ultima_actualizacion DATETIME DEFAULT GETDATE(),
                    PRIMARY KEY (custodio_id, id_material),
                    FOREIGN KEY (id_material) REFERENCES CATALOGO_MATERIALES(id_material)
                );
            END
        `);

        // 4. MOVIMIENTOS_ALMACEN (Transaction Log)
        console.log('4. Creating MOVIMIENTOS_ALMACEN...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MOVIMIENTOS_ALMACEN')
            BEGIN
                CREATE TABLE MOVIMIENTOS_ALMACEN (
                    id_movimiento INT IDENTITY(1,1) PRIMARY KEY,
                    fecha DATETIME DEFAULT GETDATE(),
                    tipo_movimiento NVARCHAR(50) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA_COMPRA', 'SALIDA_DESPACHO', 'RETORNO_CHATARRA', 'DEVOLUCION_BUEN_ESTADO')),
                    id_material UNIQUEIDENTIFIER NOT NULL,
                    cantidad DECIMAL(10, 2) NOT NULL,
                    origen NVARCHAR(100) NULL, -- 'Proveedor X' or 'Almacen Main'
                    destino NVARCHAR(100) NULL, -- 'Almacen Main' or 'Placa ABC-123'
                    usuario_responsable NVARCHAR(100) NOT NULL, -- Who did the action
                    documento_ref NVARCHAR(100) NULL, -- 'GR-001' or 'Despacho #123'
                    FOREIGN KEY (id_material) REFERENCES CATALOGO_MATERIALES(id_material)
                );
            END
        `);

        console.log('✅ Phase 13 Schema Updated Successfully.');

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        // if (pool) await pool.close(); // Keep pool open usually fine in scripts that exit, but let's be clean if possible.
        process.exit();
    }
}

updateSchemaPhase13();
