using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseExplorerController : ControllerBase
    {
        private readonly ILogger<DatabaseExplorerController> _logger;
        private readonly IConfiguration _configuration;

        public DatabaseExplorerController(ILogger<DatabaseExplorerController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Prueba la conexión a una base de datos SQL Server
        /// </summary>
        [HttpPost("test-connection")]
        public async Task<ActionResult> TestConnection([FromBody] ConnectionRequest request)
        {
            try
            {
                // LOG: Datos recibidos del botón
                _logger.LogInformation("=== DATOS RECIBIDOS DEL BOTÓN ===");
                _logger.LogInformation($"Server: {request.Server}");
                _logger.LogInformation($"Database: {request.Database}");
                _logger.LogInformation($"UseWindowsAuth: {request.UseWindowsAuth}");
                _logger.LogInformation($"Username: {request.Username}");
                _logger.LogInformation($"Password: {(string.IsNullOrEmpty(request.Password) ? "VACÍO" : "***PRESENTE***")}");
                _logger.LogInformation($"Port: {request.Port}");
                
                var connectionString = BuildConnectionString(request);
                _logger.LogInformation($"Connection String: {connectionString}");
                
                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                
                var result = new
                {
                    success = true,
                    message = "Conexión exitosa",
                    serverVersion = connection.ServerVersion,
                    database = connection.Database,
                    timestamp = DateTime.UtcNow
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al conectar con la base de datos");
                return BadRequest(new { 
                    success = false, 
                    message = $"Error de conexión: {ex.Message}" 
                });
            }
        }

        /// <summary>
        /// Obtiene la lista de tablas de una base de datos
        /// </summary>
        [HttpPost("get-tables")]
        public async Task<ActionResult> GetTables([FromBody] ConnectionRequest request)
        {
            try
            {
                var connectionString = BuildConnectionString(request);
                var tables = new List<TableInfo>();

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var query = @"
                    SELECT 
                        t.TABLE_SCHEMA,
                        t.TABLE_NAME,
                        t.TABLE_TYPE
                    FROM INFORMATION_SCHEMA.TABLES t
                    WHERE t.TABLE_TYPE = 'BASE TABLE'
                    ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME";

                using var command = new SqlCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    tables.Add(new TableInfo
                    {
                        Schema = reader.GetString("TABLE_SCHEMA"),
                        Name = reader.GetString("TABLE_NAME"),
                        Type = reader.GetString("TABLE_TYPE")
                    });
                }

                return Ok(new { success = true, tables });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las tablas");
                return BadRequest(new { 
                    success = false, 
                    message = $"Error: {ex.Message}" 
                });
            }
        }

        /// <summary>
        /// Obtiene la estructura de una tabla específica
        /// </summary>
        [HttpPost("get-table-structure")]
        public async Task<ActionResult> GetTableStructure([FromBody] TableStructureRequest request)
        {
            try
            {
                var connectionString = BuildConnectionString(request.Connection);
                var columns = new List<ColumnInfo>();

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var query = @"
                    SELECT 
                        c.COLUMN_NAME,
                        c.DATA_TYPE,
                        c.IS_NULLABLE,
                        c.COLUMN_DEFAULT,
                        c.CHARACTER_MAXIMUM_LENGTH,
                        c.NUMERIC_PRECISION,
                        c.NUMERIC_SCALE,
                        CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IS_PRIMARY_KEY
                    FROM INFORMATION_SCHEMA.COLUMNS c
                    LEFT JOIN (
                        SELECT ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
                        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
                            ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
                            AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
                    ) pk ON c.TABLE_SCHEMA = pk.TABLE_SCHEMA 
                         AND c.TABLE_NAME = pk.TABLE_NAME 
                         AND c.COLUMN_NAME = pk.COLUMN_NAME
                    WHERE c.TABLE_SCHEMA = @schema AND c.TABLE_NAME = @tableName
                    ORDER BY c.ORDINAL_POSITION";

                using var command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@schema", request.Schema);
                command.Parameters.AddWithValue("@tableName", request.TableName);
                
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    columns.Add(new ColumnInfo
                    {
                        Name = reader.GetString("COLUMN_NAME"),
                        DataType = reader.GetString("DATA_TYPE"),
                        IsNullable = reader.GetString("IS_NULLABLE") == "YES",
                        DefaultValue = reader.IsDBNull("COLUMN_DEFAULT") ? null : reader.GetString("COLUMN_DEFAULT"),
                        MaxLength = reader.IsDBNull("CHARACTER_MAXIMUM_LENGTH") ? null : reader.GetInt32("CHARACTER_MAXIMUM_LENGTH"),
                        Precision = reader.IsDBNull("NUMERIC_PRECISION") ? null : reader.GetByte("NUMERIC_PRECISION"),
                        Scale = reader.IsDBNull("NUMERIC_SCALE") ? null : reader.GetInt32("NUMERIC_SCALE"),
                        IsPrimaryKey = reader.GetInt32("IS_PRIMARY_KEY") == 1
                    });
                }

                return Ok(new { success = true, columns });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la estructura de la tabla");
                return BadRequest(new { 
                    success = false, 
                    message = $"Error: {ex.Message}" 
                });
            }
        }

        /// <summary>
        /// Obtiene datos de muestra de una tabla
        /// </summary>
        [HttpPost("get-sample-data")]
        public async Task<ActionResult> GetSampleData([FromBody] SampleDataRequest request)
        {
            try
            {
                var connectionString = BuildConnectionString(request.Connection);
                var data = new List<Dictionary<string, object>>();

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var query = $"SELECT TOP {request.RowCount} * FROM [{request.Schema}].[{request.TableName}]";

                using var command = new SqlCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>();
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    }
                    data.Add(row);
                }

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener datos de muestra");
                return BadRequest(new { 
                    success = false, 
                    message = $"Error: {ex.Message}" 
                });
            }
        }

        private string BuildConnectionString(ConnectionRequest request)
        {
            // Para instancias nombradas (como SQLEXPRESS), no usar puerto
            var dataSource = request.Server.Contains("\\") ? request.Server : $"{request.Server},{request.Port}";
            
            var builder = new SqlConnectionStringBuilder
            {
                DataSource = dataSource,
                InitialCatalog = request.Database,
                ConnectTimeout = 30,
                TrustServerCertificate = true,  // Confía en el certificado del servidor como en SSMS
                Encrypt = false  // Desactivar encriptación temporalmente para solucionar error 4060
            };

            if (request.UseWindowsAuth)
            {
                builder.IntegratedSecurity = true;
            }
            else
            {
                builder.UserID = request.Username;
                builder.Password = request.Password;
            }

            return builder.ConnectionString;
        }
    }

    public class ConnectionRequest
    {
        public string Server { get; set; } = "";
        public string Database { get; set; } = "";
        public int Port { get; set; } = 1433;
        public bool UseWindowsAuth { get; set; } = true;
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class TableStructureRequest
    {
        public ConnectionRequest Connection { get; set; } = new();
        public string Schema { get; set; } = "";
        public string TableName { get; set; } = "";
    }

    public class SampleDataRequest
    {
        public ConnectionRequest Connection { get; set; } = new();
        public string Schema { get; set; } = "";
        public string TableName { get; set; } = "";
        public int RowCount { get; set; } = 10;
    }

    public class TableInfo
    {
        public string Schema { get; set; } = "";
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
    }

    public class ColumnInfo
    {
        public string Name { get; set; } = "";
        public string DataType { get; set; } = "";
        public bool IsNullable { get; set; }
        public string? DefaultValue { get; set; }
        public int? MaxLength { get; set; }
        public byte? Precision { get; set; }
        public int? Scale { get; set; }
        public bool IsPrimaryKey { get; set; }
    }
}