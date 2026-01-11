using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiagnosticController : ControllerBase
    {
        private readonly OperationWebDbContext _context;

        public DiagnosticController(OperationWebDbContext context)
        {
            _context = context;
        }

        [HttpGet("databases")]
        public async Task<IActionResult> GetDatabases()
        {
            try
            {
                var dbNames = new List<string>();
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')";
                    _context.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            dbNames.Add(result.GetString(0));
                        }
                    }
                }
                return Ok(new { Status = "Connected", Databases = dbNames });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = ex.Message });
            }
        }

        [HttpGet("check-operation-db")]
        public async Task<IActionResult> CheckOperationDb()
        {
            // Try to query BD_Operation assuming it's on the same server
            try
            {
                var count = -1;
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    // Check if Personal table exists in BD_Operation
                    command.CommandText = "SELECT COUNT(*) FROM BD_Operation.dbo.Personal";
                    _context.Database.OpenConnection();
                    var result = command.ExecuteScalar();
                    count = (int)result;
                }
                return Ok(new { Status = "Success", Database = "BD_Operation", Table = "Personal", RowCount = count });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Status = "Failed", Message = ex.Message, Note = "Could not query BD_Operation.dbo.Personal. Check if DB exists and permissions." });
            }
        }

        [HttpGet("check-opera-main")]
        public async Task<IActionResult> CheckOperaMain()
        {
            try
            {
                var tables = new List<string>();
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    // Check tables in Opera_Main
                    command.CommandText = "SELECT TABLE_NAME FROM Opera_Main.INFORMATION_SCHEMA.TABLES";
                    _context.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            tables.Add(result.GetString(0));
                        }
                    }
                }
                return Ok(new { Status = "Success", Database = "Opera_Main", Tables = tables });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Status = "Failed", Message = ex.Message, Note = "Could not query Opera_Main." });
            }
        }
        [HttpGet("inspect-vehiculos")]
        public async Task<IActionResult> InspectVehiculos()
        {
            try
            {
                var columns = new List<string>();
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                        FROM Opera_Main.INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'VEHICULOS'";
                    _context.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            columns.Add($"{result.GetString(0)} ({result.GetString(1)}, {result.GetString(2)})");
                        }
                    }
                }
                return Ok(new { Status = "Success", Columns = columns });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Status = "Failed", Message = ex.Message });
            }
        }

        [HttpGet("inspect-materiales")]
        public async Task<IActionResult> InspectMateriales()
        {
            try
            {
                var columns = new List<string>();
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
                        FROM Opera_Main.INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'CATALOGO_MATERIALES'";
                    _context.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            columns.Add($"{result.GetString(0)} ({result.GetString(1)}, {result.GetString(2)})");
                        }
                    }
                }
                return Ok(new { Status = "Success", Columns = columns });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Status = "Failed", Message = ex.Message });
            }
        }

        [HttpGet("inspect-schema")]
        public async Task<IActionResult> InspectSchema()
        {
            try
            {
                var tables = new List<object>();
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT 
                            t.TABLE_NAME,
                            c.COLUMN_NAME,
                            c.DATA_TYPE,
                            c.IS_NULLABLE
                        FROM DB_Operation.INFORMATION_SCHEMA.TABLES t
                        JOIN DB_Operation.INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
                        WHERE t.TABLE_TYPE = 'BASE TABLE'
                        ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION";
                    
                    _context.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        string currentTable = "";
                        var columns = new List<object>();
                        
                        while (result.Read())
                        {
                            var tableName = result.GetString(0);
                            if (tableName != currentTable)
                            {
                                if (currentTable != "")
                                {
                                    tables.Add(new { Table = currentTable, Columns = columns });
                                }
                                currentTable = tableName;
                                columns = new List<object>();
                            }
                            
                            columns.Add(new {
                                Column = result.GetString(1),
                                Type = result.GetString(2),
                                Nullable = result.GetString(3)
                            });
                        }
                        if (currentTable != "") tables.Add(new { Table = currentTable, Columns = columns });
                    }
                }
                return Ok(new { Status = "Success", Tables = tables });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Status = "Failed", Message = ex.Message });
            }
        }
    }
}
