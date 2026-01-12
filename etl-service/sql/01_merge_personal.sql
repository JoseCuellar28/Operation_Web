SET NOCOUNT ON;
IF OBJECT_ID('tempdb..#MergeOutput') IS NOT NULL DROP TABLE #MergeOutput;

CREATE TABLE #MergeOutput (
    ActionType NVARCHAR(10),
    DNI NVARCHAR(20),
    Periodo NVARCHAR(20),
    Situacion NVARCHAR(50),
    Motivo NVARCHAR(255),
    FechaEvento DATE
);

MERGE INTO Personal AS Target
USING (
    SELECT 
        DNI,
        Inspector,
        SedeTrabajo AS Distrito,
        TipoTrabajador AS Tipo,
        Situacion AS Estado,
        FechaIngreso AS FechaInicio,
        FechaCese,
        CodigoEmpleado,
        Categoria,
        Division,
        LineaNegocio,
        Area,
        Seccion,
        DetalleCebe,
        CodigoCebe,
        MotivoCeseDesc,
        Comentario,
        FechaNacimiento,
        Sexo,
        Edad,
        Permanencia,
        Email,
        EmailPersonal,
        JefeInmediato,
        Telefono,
        JefeInmediato,
        Telefono,
        FotoUrl,
        FirmaUrl,
        Periodo
    FROM Personal_Staging
    WHERE DNI IS NOT NULL
) AS Source
ON (Target.DNI = Source.DNI)

WHEN MATCHED AND (
    -- Solo actualizar si hay cambios reales en los datos
    ISNULL(Target.Inspector, '') <> ISNULL(Source.Inspector, '') OR
    ISNULL(Target.Distrito, '') <> ISNULL(Source.Distrito, '') OR
    ISNULL(Target.Tipo, '') <> ISNULL(Source.Tipo, '') OR
    ISNULL(Target.Estado, '') <> ISNULL(Source.Estado, '') OR
    ISNULL(Target.FechaInicio, '1900-01-01') <> ISNULL(Source.FechaInicio, '1900-01-01') OR
    ISNULL(Target.FechaCese, '1900-01-01') <> ISNULL(Source.FechaCese, '1900-01-01') OR
    ISNULL(Target.CodigoEmpleado, '') <> ISNULL(Source.CodigoEmpleado, '') OR
    ISNULL(Target.Categoria, '') <> ISNULL(Source.Categoria, '') OR
    ISNULL(Target.Division, '') <> ISNULL(Source.Division, '') OR
    ISNULL(Target.LineaNegocio, '') <> ISNULL(Source.LineaNegocio, '') OR
    ISNULL(Target.Area, '') <> ISNULL(Source.Area, '') OR
    ISNULL(Target.Seccion, '') <> ISNULL(Source.Seccion, '') OR
    ISNULL(Target.DetalleCebe, '') <> ISNULL(Source.DetalleCebe, '') OR
    ISNULL(Target.CodigoCebe, '') <> ISNULL(Source.CodigoCebe, '') OR
    ISNULL(Target.MotivoCeseDesc, '') <> ISNULL(Source.MotivoCeseDesc, '') OR
    ISNULL(Target.Comentario, '') <> ISNULL(Source.Comentario, '') OR
    ISNULL(Target.FechaNacimiento, '1900-01-01') <> ISNULL(Source.FechaNacimiento, '1900-01-01') OR
    ISNULL(Target.Sexo, '') <> ISNULL(Source.Sexo, '') OR
    ISNULL(Target.Edad, 0) <> ISNULL(Source.Edad, 0) OR
    ISNULL(Target.Permanencia, 0) <> ISNULL(Source.Permanencia, 0) OR
    ISNULL(Target.Email, '') <> ISNULL(Source.Email, '') OR
    ISNULL(Target.EmailPersonal, '') <> ISNULL(Source.EmailPersonal, '') OR
    ISNULL(Target.JefeInmediato, '') <> ISNULL(Source.JefeInmediato, '') OR
    ISNULL(Target.JefeInmediato, '') <> ISNULL(Source.JefeInmediato, '') OR
    ISNULL(Target.Telefono, '') <> ISNULL(Source.Telefono, '') OR
    ISNULL(Target.FotoUrl, '') <> ISNULL(Source.FotoUrl, '') OR
    ISNULL(Target.FirmaUrl, '') <> ISNULL(Source.FirmaUrl, '')
) THEN
    UPDATE SET
        Target.Inspector = Source.Inspector,
        Target.Distrito = Source.Distrito,
        Target.Tipo = Source.Tipo,
        Target.Estado = Source.Estado,
        Target.FechaInicio = Source.FechaInicio,
        Target.FechaCese = Source.FechaCese,
        Target.CodigoEmpleado = Source.CodigoEmpleado,
        Target.Categoria = Source.Categoria,
        Target.Division = Source.Division,
        Target.LineaNegocio = Source.LineaNegocio,
        Target.Area = Source.Area,
        Target.Seccion = Source.Seccion,
        Target.DetalleCebe = Source.DetalleCebe,
        Target.CodigoCebe = Source.CodigoCebe,
        Target.MotivoCeseDesc = Source.MotivoCeseDesc,
        Target.Comentario = Source.Comentario,
        Target.FechaNacimiento = Source.FechaNacimiento,
        Target.Sexo = Source.Sexo,
        Target.Edad = Source.Edad,
        Target.Permanencia = Source.Permanencia,
        Target.Email = Source.Email,
        Target.EmailPersonal = Source.EmailPersonal,
        Target.JefeInmediato = Source.JefeInmediato,
        Target.Telefono = Source.Telefono,
        Target.JefeInmediato = Source.JefeInmediato,
        Target.Telefono = Source.Telefono,
        Target.FotoUrl = Source.FotoUrl,
        Target.FirmaUrl = Source.FirmaUrl,
        Target.FechaModificacion = GETDATE()

WHEN NOT MATCHED BY TARGET THEN
    INSERT (
        DNI, 
        Inspector, 
        Distrito, 
        Tipo, 
        Estado, 
        FechaInicio, 
        FechaCese,
        CodigoEmpleado,
        Categoria,
        Division,
        LineaNegocio,
        Area,
        Seccion,
        DetalleCebe,
        CodigoCebe,
        MotivoCeseDesc,
        Comentario,
        FechaNacimiento,
        Sexo,
        Edad,
        Permanencia,
        Email,
        EmailPersonal,
        JefeInmediato,
        Telefono,
        FechaCreacion,
        Telefono,
        FotoUrl,
        FirmaUrl,
        FechaCreacion,
        UsuarioCreacion
    )
    VALUES (
        Source.DNI,
        Source.Inspector,
        Source.Distrito,
        Source.Tipo,
        Source.Estado,
        Source.FechaInicio,
        Source.FechaCese,
        Source.CodigoEmpleado,
        Source.Categoria,
        Source.Division,
        Source.LineaNegocio,
        Source.Area,
        Source.Seccion,
        Source.DetalleCebe,
        Source.CodigoCebe,
        Source.MotivoCeseDesc,
        Source.Comentario,
        Source.FechaNacimiento,
        Source.Sexo,
        Source.Edad,
        Source.Permanencia,
        Source.Email,
        Source.EmailPersonal,
        Source.JefeInmediato,
        Source.Telefono,
        Source.FotoUrl,
        Source.FirmaUrl,
        GETDATE(),
        'ETL_SERVICE'
    )

OUTPUT 
    $action, 
    Inserted.DNI, 
    Source.Periodo, 
    Inserted.Estado, 
    Inserted.MotivoCeseDesc, 
    GETDATE()
INTO #MergeOutput (ActionType, DNI, Periodo, Situacion, Motivo, FechaEvento);

-- Insertar en Historial
INSERT INTO Personal_EventoLaboral (
    DNI, 
    TipoEvento, 
    Motivo, 
    FechaEvento, 
    Periodo, 
    FechaCreacion, 
    UsuarioCreacion
)
SELECT 
    DNI,
    CASE 
        WHEN ActionType = 'INSERT' THEN 'Alta'
        WHEN ActionType = 'UPDATE' THEN 'Cambio'
    END,
    Motivo,
    FechaEvento,
    Periodo,
    GETDATE(),
    'ETL_SERVICE'
FROM #MergeOutput AS MO
WHERE NOT EXISTS (
    SELECT 1 FROM Personal_EventoLaboral PEL
    WHERE PEL.DNI = MO.DNI
    AND PEL.TipoEvento = CASE WHEN MO.ActionType = 'INSERT' THEN 'Alta' ELSE 'Cambio' END
    AND PEL.FechaEvento = MO.FechaEvento
    AND (PEL.Periodo = MO.Periodo OR (PEL.Periodo IS NULL AND MO.Periodo IS NULL))
);

-- Retornar conteos
SELECT 
    ISNULL(SUM(CASE WHEN ActionType = 'INSERT' THEN 1 ELSE 0 END), 0) as Inserted,
    ISNULL(SUM(CASE WHEN ActionType = 'UPDATE' THEN 1 ELSE 0 END), 0) as Updated
FROM #MergeOutput;

GO

DROP TABLE #MergeOutput;

-- =======================================================================================
-- SEGUNDA ETAPA: SINCRONIZACIÓN AUTOMÁTICA HACIA Opera_Main.dbo.COLABORADORES
-- =======================================================================================
-- NOTA: Se asume que Opera_Main está en la misma instancia o vinculado.
-- Si hay restricciones de base de datos cruzada, esto requerirá permisos adicionales.

MERGE INTO Opera_Main.dbo.COLABORADORES AS Target
USING (
    SELECT 
        DNI,
        Inspector as nombre,
        Tipo as rol,
        FotoUrl as photo_url,
        Telefono as phone,
        CASE WHEN Estado = 'Cesado' THEN 'Retirado' ELSE Estado END as estado_operativo, -- Mapeo simple
        CASE WHEN Estado = 'Cesado' THEN 0 ELSE 1 END as active
    FROM dbo.Personal
    WHERE DNI IS NOT NULL
) AS Source
ON (Target.dni = Source.DNI)

WHEN MATCHED THEN
    UPDATE SET
        Target.nombre = Source.nombre,
        Target.rol = Source.rol,
        Target.photo_url = Source.photo_url,
        Target.phone = Source.phone,
        Target.estado_operativo = Source.estado_operativo,
        Target.active = Source.active,
        Target.updated_at = GETDATE()

WHEN NOT MATCHED BY TARGET THEN
    INSERT (dni, nombre, rol, photo_url, phone, estado_operativo, active, created_at, updated_at)
    VALUES (Source.DNI, Source.nombre, Source.rol, Source.photo_url, Source.phone, Source.estado_operativo, Source.active, GETDATE(), GETDATE());

