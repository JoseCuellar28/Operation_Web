// Estado global de la aplicación
const appState = {
    connections: {
        db1: { connected: false, tables: [] },
        db2: { connected: false, tables: [] }
    },
    selectedTables: [],
    currentTable: null
};

// API Base URL
const API_BASE = 'http://localhost:5132/api/DatabaseExplorer';

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
});

function setupEventListeners() {
    // Toggle de autenticación Windows
    document.getElementById('db1-windows-auth').addEventListener('change', function () {
        toggleCredentials('db1', this.checked);
    });

    document.getElementById('db2-windows-auth').addEventListener('change', function () {
        toggleCredentials('db2', this.checked);
    });

    // Cambios en el servidor para actualizar visibilidad del puerto
    document.getElementById('db1-server').addEventListener('input', function () {
        const useWindowsAuth = document.getElementById('db1-windows-auth').checked;
        toggleCredentials('db1', useWindowsAuth);
    });

    document.getElementById('db2-server').addEventListener('input', function () {
        const useWindowsAuth = document.getElementById('db2-windows-auth').checked;
        toggleCredentials('db2', useWindowsAuth);
    });

    // Búsqueda de tablas
    document.getElementById('table-search').addEventListener('input', function () {
        filterTables(this.value);
    });

    // Inicializar estado de credenciales
    toggleCredentials('db1', document.getElementById('db1-windows-auth').checked);
    toggleCredentials('db2', document.getElementById('db2-windows-auth').checked);
}

function toggleCredentials(dbId, useWindowsAuth) {
    const credentialsDiv = document.getElementById(`${dbId}-credentials`);
    const portDiv = document.querySelector(`#${dbId}-form .mb-2:has(#${dbId}-port)`);

    credentialsDiv.style.display = useWindowsAuth ? 'none' : 'block';

    // Para instancias nombradas (como SQLEXPRESS), nunca mostrar el puerto
    const server = document.getElementById(`${dbId}-server`).value;
    const isNamedInstance = server.includes('\\');

    if (portDiv) {
        if (isNamedInstance) {
            portDiv.style.display = 'none';  // Ocultar puerto para instancias nombradas
        } else {
            portDiv.style.display = 'block';
        }
    }
}

function getConnectionData(dbId) {
    console.log('=== RECOPILANDO DATOS DE CONEXIÓN ===');
    console.log('dbId:', dbId);

    const useWindowsAuthElement = document.getElementById(`${dbId}-windows-auth`);
    const serverElement = document.getElementById(`${dbId}-server`);
    const portElement = document.getElementById(`${dbId}-port`);
    const databaseElement = document.getElementById(`${dbId}-database`);
    const usernameElement = document.getElementById(`${dbId}-username`);
    const passwordElement = document.getElementById(`${dbId}-password`);

    console.log('Elementos encontrados:');
    console.log('- useWindowsAuthElement:', useWindowsAuthElement);
    console.log('- serverElement:', serverElement);
    console.log('- portElement:', portElement);
    console.log('- databaseElement:', databaseElement);
    console.log('- usernameElement:', usernameElement);
    console.log('- passwordElement:', passwordElement);

    if (!useWindowsAuthElement || !serverElement || !databaseElement) {
        console.error('ERROR: Elementos requeridos no encontrados');
        return null;
    }

    const useWindowsAuth = useWindowsAuthElement.checked;
    const server = serverElement.value;
    const portValue = portElement ? portElement.value : '';

    // Logs removidos por seguridad

    // Para instancias nombradas (como SQLEXPRESS), nunca usar puerto
    const isNamedInstance = server.includes('\\');
    const shouldIncludePort = !isNamedInstance;

    console.log('- isNamedInstance:', isNamedInstance);
    console.log('- shouldIncludePort:', shouldIncludePort);

    const connectionData = {
        server: server,
        database: databaseElement.value,
        useWindowsAuth: useWindowsAuth,
        username: useWindowsAuth ? '' : (usernameElement ? usernameElement.value : ''),
        password: useWindowsAuth ? '' : (passwordElement ? passwordElement.value : '')
    };

    // Solo incluir puerto si es necesario
    if (shouldIncludePort && portValue) {
        connectionData.port = parseInt(portValue) || 1433;
        console.log('- puerto incluido:', connectionData.port);
    }

    // console.log('Datos finales de conexión:', connectionData); // Removido por seguridad

    return connectionData;
}

async function testConnection(dbId) {
    console.log('🔥🔥🔥 BOTÓN CLICKEADO - FUNCIÓN TESTCONNECTION EJECUTADA 🔥🔥🔥');
    console.log('=== INICIO PRUEBA CONEXIÓN ===');
    console.log('dbId:', dbId);
    console.log('Timestamp:', new Date().toISOString());

    const statusIndicator = document.getElementById(`${dbId}-status`);
    const loadTablesBtn = document.getElementById(`${dbId}-load-tables`);

    console.log('statusIndicator:', statusIndicator);
    console.log('loadTablesBtn:', loadTablesBtn);

    try {
        // Cambiar estado a "probando"
        statusIndicator.className = 'status-indicator status-testing';
        console.log('Estado cambiado a testing');

        const connectionData = getConnectionData(dbId);
        // console.log('Datos de conexión:', connectionData); // Removido por seguridad

        const url = `${API_BASE}/test-connection`;
        console.log('URL completa:', url);

        console.log('Iniciando fetch...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(connectionData)
        });

        console.log('Response recibida:', response);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        const result = await response.json();
        console.log('Result parseado:', result);

        if (result.success) {
            statusIndicator.className = 'status-indicator status-connected';
            loadTablesBtn.disabled = false;
            appState.connections[dbId].connected = true;

            showAlert('success', `Conexión exitosa a ${connectionData.database}`,
                `Servidor: ${result.serverVersion}`);
        } else {
            statusIndicator.className = 'status-indicator status-disconnected';
            loadTablesBtn.disabled = true;
            appState.connections[dbId].connected = false;

            showAlert('danger', 'Error de conexión', result.message);
        }
    } catch (error) {
        console.error('=== ERROR EN TESTCONNECTION ===');
        console.error('Error completo:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);

        statusIndicator.className = 'status-indicator status-disconnected';
        loadTablesBtn.disabled = true;
        appState.connections[dbId].connected = false;

        showAlert('danger', 'Error de conexión', `Error: ${error.message}`);
    }
    console.log('=== FIN PRUEBA CONEXIÓN ===');
}

async function loadTables(dbId) {
    try {
        const connectionData = getConnectionData(dbId);

        const response = await fetch(`${API_BASE}/get-tables`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(connectionData)
        });

        const result = await response.json();

        if (result.success) {
            appState.connections[dbId].tables = result.tables;
            displayTables(dbId, result.tables);
            showAlert('success', 'Tablas cargadas', `Se encontraron ${result.tables.length} tablas`);
        } else {
            showAlert('danger', 'Error al cargar tablas', result.message);
        }
    } catch (error) {
        showAlert('danger', 'Error al cargar tablas', `Error: ${error.message}`);
    }
}

function displayTables(dbId, tables) {
    const tablesList = document.getElementById(`${dbId}-tables-list`);

    if (tables.length === 0) {
        tablesList.innerHTML = DOMPurify.sanitize('<p class="text-muted">No se encontraron tablas</p>');
        return;
    }

    const groupedTables = tables.reduce((acc, table) => {
        if (!acc[table.schema]) {
            acc[table.schema] = [];
        }
        acc[table.schema].push(table);
        return acc;
    }, {});

    let html = '';
    Object.keys(groupedTables).forEach(schema => {
        html += `<div class="mb-2">
                    <h6 class="text-primary">${schema}</h6>`;

        groupedTables[schema].forEach(table => {
            html += `<div class="table-item" data-db="${dbId}" data-schema="${table.schema}" data-table="${table.name}" onclick="selectTable('${dbId}', '${table.schema}', '${table.name}')">
                        <i class="fas fa-table"></i> ${table.name}
                        <button class="btn btn-sm btn-outline-primary float-end" onclick="event.stopPropagation(); addToReplication('${dbId}', '${table.schema}', '${table.name}')">
                            <i class="fas fa-plus"></i>
                        </button>
                     </div>`;
        });

        html += '</div>';
    });

    tablesList.innerHTML = DOMPurify.sanitize(html);
}

async function selectTable(dbId, schema, tableName) {
    // Remover selección anterior
    document.querySelectorAll('.table-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Seleccionar tabla actual
    const tableItem = document.querySelector(`[data-db="${dbId}"][data-schema="${schema}"][data-table="${tableName}"]`);
    if (tableItem) {
        tableItem.classList.add('selected');
    }

    appState.currentTable = { dbId, schema, tableName };

    try {
        const connectionData = getConnectionData(dbId);

        // Obtener estructura de la tabla
        const structureResponse = await fetch(`${API_BASE}/get-table-structure`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                connection: connectionData,
                schema: schema,
                tableName: tableName
            })
        });

        const structureResult = await structureResponse.json();

        if (structureResult.success) {
            displayTableDetails(dbId, schema, tableName, structureResult.columns);
        }

        // Obtener datos de muestra
        const sampleResponse = await fetch(`${API_BASE}/get-sample-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                connection: connectionData,
                schema: schema,
                tableName: tableName,
                rowCount: 5
            })
        });

        const sampleResult = await sampleResponse.json();

        if (sampleResult.success) {
            displaySampleData(sampleResult.data);
        }

    } catch (error) {
        showAlert('danger', 'Error al cargar detalles', `Error: ${error.message}`);
    }
}

function displayTableDetails(dbId, schema, tableName, columns) {
    const detailsDiv = document.getElementById('table-details');

    let html = `
        <h6><i class="fas fa-table"></i> ${schema}.${tableName}</h6>
        <p class="text-muted">Base de Datos: ${dbId.toUpperCase()}</p>
        
        <h6 class="mt-3">Columnas (${columns.length})</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Nulo</th>
                        <th>PK</th>
                    </tr>
                </thead>
                <tbody>`;

    columns.forEach(column => {
        const dataTypeDisplay = column.maxLength ?
            `${column.dataType}(${column.maxLength})` :
            column.dataType;

        html += `<tr>
                    <td class="column-info">${column.name}</td>
                    <td class="column-info">${dataTypeDisplay}</td>
                    <td class="${column.isNullable ? 'nullable' : 'not-nullable'}">
                        ${column.isNullable ? 'SÍ' : 'NO'}
                    </td>
                    <td class="${column.isPrimaryKey ? 'primary-key' : ''}">
                        ${column.isPrimaryKey ? '<i class="fas fa-key"></i>' : ''}
                    </td>
                 </tr>`;
    });

    html += `</tbody></table></div>`;

    detailsDiv.innerHTML = DOMPurify.sanitize(html);
}

function displaySampleData(data) {
    if (data.length === 0) return;

    const detailsDiv = document.getElementById('table-details');
    const currentContent = detailsDiv.innerHTML;

    let html = `<h6 class="mt-3">Datos de Muestra</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-striped">
                        <thead><tr>`;

    // Headers
    Object.keys(data[0]).forEach(key => {
        html += `<th>${key}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Data rows
    data.forEach(row => {
        html += '<tr>';
        Object.values(row).forEach(value => {
            const displayValue = value === null ? '<em>NULL</em>' :
                typeof value === 'string' && value.length > 50 ?
                    value.substring(0, 50) + '...' : value;
            html += `<td>${displayValue}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';

    detailsDiv.innerHTML = DOMPurify.sanitize(currentContent) + html;
}

function addToReplication(dbId, schema, tableName) {
    const tableKey = `${dbId}.${schema}.${tableName}`;

    if (!appState.selectedTables.find(t => t.key === tableKey)) {
        appState.selectedTables.push({
            key: tableKey,
            dbId: dbId,
            schema: schema,
            tableName: tableName
        });

        updateSelectedTablesDisplay();
        showAlert('success', 'Tabla agregada', `${schema}.${tableName} agregada para replicación`);
    } else {
        showAlert('warning', 'Tabla ya seleccionada', `${schema}.${tableName} ya está en la lista`);
    }
}

function removeFromReplication(tableKey) {
    appState.selectedTables = appState.selectedTables.filter(t => t.key !== tableKey);
    updateSelectedTablesDisplay();
}

function updateSelectedTablesDisplay() {
    const selectedDiv = document.getElementById('selected-tables');
    const generateBtn = document.getElementById('generate-code-btn');

    if (appState.selectedTables.length === 0) {
        selectedDiv.innerHTML = DOMPurify.sanitize('<p class="text-muted">No hay tablas seleccionadas</p>');
        generateBtn.disabled = true;
        return;
    }

    let html = '<div class="list-group list-group-flush">';
    appState.selectedTables.forEach(table => {
        html += `<div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${table.schema}.${table.tableName}</strong>
                        <br><small class="text-muted">${table.dbId.toUpperCase()}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromReplication('${table.key}')">
                        <i class="fas fa-times"></i>
                    </button>
                 </div>`;
    });
    html += '</div>';

    selectedDiv.innerHTML = DOMPurify.sanitize(html);
    generateBtn.disabled = false;
}

function filterTables(searchTerm) {
    const tableItems = document.querySelectorAll('.table-item');

    tableItems.forEach(item => {
        const tableName = item.textContent.toLowerCase();
        if (tableName.includes(searchTerm.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

async function generateReplicationCode() {
    if (appState.selectedTables.length === 0) {
        showAlert('warning', 'Sin tablas seleccionadas', 'Selecciona al menos una tabla para generar el código de replicación');
        return;
    }

    try {
        // Generar código de replicación completo: Base 1 → Base 2
        const code = await generateEntitiesAndDbContext();

        // Mostrar el código generado en un modal o nueva ventana
        showGeneratedCode(code);

    } catch (error) {
        showAlert('danger', 'Error al generar código de replicación', `Error: ${error.message}`);
    }
}

async function generateEntitiesAndDbContext() {
    let code = {
        entities: [],
        dbContext: '',
        appsettings: '',
        replicationService: ''
    };

    // Generar entidades para cada tabla seleccionada
    for (const table of appState.selectedTables) {
        const connectionData = getConnectionData(table.dbId);

        const structureResponse = await fetch(`${API_BASE}/get-table-structure`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                connection: connectionData,
                schema: table.schema,
                tableName: table.tableName
            })
        });

        const structureResult = await structureResponse.json();

        if (structureResult.success) {
            const entityCode = generateEntityClass(table.tableName, structureResult.columns);
            code.entities.push({
                name: table.tableName,
                code: entityCode
            });
        }
    }

    // Generar DbContext
    code.dbContext = generateDbContextClass();

    // Generar configuración de appsettings
    code.appsettings = generateAppSettingsConfig();

    // Generar servicio de replicación
    code.replicationService = generateReplicationService();

    return code;
}

function generateEntityClass(tableName, columns) {
    const className = toPascalCase(tableName);

    let code = `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OperationWeb.API.Models
{
    [Table("${tableName}")]
    public class ${className}
    {`;

    columns.forEach(column => {
        const propertyName = toPascalCase(column.name);
        const csharpType = mapSqlTypeToCSharp(column.dataType, column.isNullable);

        code += `\n        `;

        if (column.isPrimaryKey) {
            code += `[Key]\n        `;
        }

        if (column.name !== propertyName) {
            code += `[Column("${column.name}")]\n        `;
        }

        if (column.maxLength && (column.dataType === 'varchar' || column.dataType === 'nvarchar')) {
            code += `[MaxLength(${column.maxLength})]\n        `;
        }

        code += `public ${csharpType} ${propertyName} { get; set; }`;
    });

    code += `\n    }\n}`;

    return code;
}

function generateDbContextClass() {
    const entityNames = appState.selectedTables.map(t => toPascalCase(t.tableName));

    let code = `using Microsoft.EntityFrameworkCore;
using OperationWeb.API.Models;

namespace OperationWeb.API.Data
{
    public class ReplicationDbContext : DbContext
    {
        public ReplicationDbContext(DbContextOptions<ReplicationDbContext> options) : base(options)
        {
        }

`;

    entityNames.forEach(entityName => {
        code += `        public DbSet<${entityName}> ${entityName}s { get; set; }\n`;
    });

    code += `
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configuraciones adicionales si son necesarias
        }
    }
}`;

    return code;
}

function generateAppSettingsConfig() {
    const db1Connection = getConnectionData('db1');
    const db2Connection = getConnectionData('db2');

    return `{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\mssqllocaldb;Database=OperationWebDb;Trusted_Connection=true;MultipleActiveResultSets=true",
    "Database1Connection": "Server=${db1Connection.server},${db1Connection.port};Database=${db1Connection.database};${db1Connection.useWindowsAuth ? 'Trusted_Connection=true' : `User Id=${db1Connection.username};Password=${db1Connection.password}`};MultipleActiveResultSets=true",
    "Database2Connection": "Server=${db2Connection.server},${db2Connection.port};Database=${db2Connection.database};${db2Connection.useWindowsAuth ? 'Trusted_Connection=true' : `User Id=${db2Connection.username};Password=${db2Connection.password}`};MultipleActiveResultSets=true"
  }
}`;
}

function generateReplicationService() {
    const tableNames = appState.selectedTables.map(t => t.tableName);

    return `using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace OperationWeb.API.Services
{
    public interface IReplicationService
    {
        Task<bool> ReplicateTablesAsync();
        Task<bool> ReplicateTableAsync(string tableName);
    }

    public class ReplicationService : IReplicationService
    {
        private readonly ReplicationDbContext _sourceContext;
        private readonly ReplicationDbContext _destinationContext;
        private readonly ILogger<ReplicationService> _logger;

        public ReplicationService(
            ReplicationDbContext sourceContext,
            ReplicationDbContext destinationContext,
            ILogger<ReplicationService> logger)
        {
            _sourceContext = sourceContext;
            _destinationContext = destinationContext;
            _logger = logger;
        }

        public async Task<bool> ReplicateTablesAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando replicación de tablas desde Base 1 hacia Base 2");
                
${tableNames.map(tableName => `                // Replicar tabla ${tableName}
                await ReplicateTableAsync("${tableName}");`).join('\n')}
                
                _logger.LogInformation("Replicación completada exitosamente");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la replicación de tablas");
                return false;
            }
        }

        public async Task<bool> ReplicateTableAsync(string tableName)
        {
            try
            {
                _logger.LogInformation($"Replicando tabla: {tableName}");
                
                // Implementar lógica específica de replicación por tabla
                // Esto dependerá de la estrategia de replicación (incremental, completa, etc.)
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error replicando tabla {tableName}");
                return false;
            }
        }
    }
}`;
}

function mapSqlTypeToCSharp(sqlType, isNullable) {
    const typeMap = {
        'int': 'int',
        'bigint': 'long',
        'smallint': 'short',
        'tinyint': 'byte',
        'bit': 'bool',
        'decimal': 'decimal',
        'numeric': 'decimal',
        'money': 'decimal',
        'smallmoney': 'decimal',
        'float': 'double',
        'real': 'float',
        'datetime': 'DateTime',
        'datetime2': 'DateTime',
        'smalldatetime': 'DateTime',
        'date': 'DateTime',
        'time': 'TimeSpan',
        'char': 'string',
        'varchar': 'string',
        'text': 'string',
        'nchar': 'string',
        'nvarchar': 'string',
        'ntext': 'string',
        'uniqueidentifier': 'Guid',
        'varbinary': 'byte[]',
        'image': 'byte[]'
    };

    let csharpType = typeMap[sqlType.toLowerCase()] || 'object';

    if (isNullable && csharpType !== 'string' && csharpType !== 'byte[]') {
        csharpType += '?';
    }

    return csharpType;
}

function toPascalCase(str) {
    return str.replace(/(?:^|_)([a-z])/g, (match, letter) => letter.toUpperCase());
}

function showGeneratedCode(code) {
    // Crear modal para mostrar el código generado
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = DOMPurify.sanitize(`
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Código de Replicación Generado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs" id="code-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="entities-tab" data-bs-toggle="tab" data-bs-target="#entities" type="button">
                                Entidades
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="dbcontext-tab" data-bs-toggle="tab" data-bs-target="#dbcontext" type="button">
                                DbContext
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="appsettings-tab" data-bs-toggle="tab" data-bs-target="#appsettings" type="button">
                                AppSettings
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="replication-tab" data-bs-toggle="tab" data-bs-target="#replication" type="button">
                                Servicio Replicación
                            </button>
                        </li>
                    </ul>
                    <div class="tab-content" id="code-tab-content">
                        <div class="tab-pane fade show active" id="entities" role="tabpanel">
                            ${generateEntitiesTabContent(code.entities)}
                        </div>
                        <div class="tab-pane fade" id="dbcontext" role="tabpanel">
                            <pre><code>${code.dbContext}</code></pre>
                        </div>
                        <div class="tab-pane fade" id="appsettings" role="tabpanel">
                            <pre><code>${code.appsettings}</code></pre>
                        </div>
                        <div class="tab-pane fade" id="replication" role="tabpanel">
                            <pre><code>${code.replicationService}</code></pre>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" onclick="downloadCode()">Descargar Código</button>
                </div>
            </div>
        </div>
    `);

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal cuando se cierre
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function generateEntitiesTabContent(entities) {
    let content = '<div class="accordion" id="entities-accordion">';

    entities.forEach((entity, index) => {
        content += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="entity-${index}-header">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#entity-${index}" aria-expanded="${index === 0}">
                        ${entity.name}.cs
                    </button>
                </h2>
                <div id="entity-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#entities-accordion">
                    <div class="accordion-body">
                        <pre><code>${entity.code}</code></pre>
                    </div>
                </div>
            </div>
        `;
    });

    content += '</div>';
    return content;
}

function showAlert(type, title, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = DOMPurify.sanitize(DOMPurify).sanitize(`
        <strong>${title}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Función para descargar el código generado
function downloadCode() {
    if (appState.selectedTables.length === 0) {
        showAlert('warning', 'Advertencia', 'No hay tablas seleccionadas para generar código.');
        return;
    }

    try {
        // Generar el código
        const code = generateReplicationCode();

        // Crear un archivo ZIP con todos los archivos
        const zip = new JSZip();

        // Agregar entidades
        code.entities.forEach(entity => {
            zip.file(`Entities/${entity.name}.cs`, entity.code);
        });

        // Agregar DbContext
        zip.file('Data/ReplicationDbContext.cs', code.dbContext);

        // Agregar appsettings
        zip.file('appsettings.json', code.appsettings);

        // Agregar servicio de replicación
        zip.file('Services/ReplicationService.cs', code.replicationService);

        // Agregar archivo README con instrucciones
        const readme = `# Código de Replicación Generado

## Archivos Incluidos:
- **Entities/**: Entidades generadas para las tablas seleccionadas
- **Data/ReplicationDbContext.cs**: Contexto de Entity Framework
- **Services/ReplicationService.cs**: Servicio de replicación
- **appsettings.json**: Configuración de conexiones

## Instrucciones de Instalación:
1. Copiar las entidades a tu proyecto en la carpeta correspondiente
2. Agregar el DbContext a tu proyecto
3. Configurar las cadenas de conexión en appsettings.json
4. Registrar los servicios en Program.cs o Startup.cs
5. Implementar el servicio de replicación según tus necesidades

## Tablas Incluidas:
${appState.selectedTables.map(table => `- ${table.name}`).join('\n')}

Generado el: ${new Date().toLocaleString()}
`;

        zip.file('README.md', readme);

        // Generar y descargar el ZIP
        zip.generateAsync({ type: "blob" }).then(function (content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `replication-code-${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showAlert('success', 'Éxito', 'Código descargado correctamente como archivo ZIP.');
        });

    } catch (error) {
        console.error('Error al generar código:', error);
        showAlert('danger', 'Error', 'Error al generar el código para descarga.');
    }
}