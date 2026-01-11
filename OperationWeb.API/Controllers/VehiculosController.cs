using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiculosController : ControllerBase
    {
        private readonly OperationWebDbContext _context;

        public VehiculosController(OperationWebDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try 
            {
                // Raw SQL for Cross-Database Query
                var vehicles = await _context.Vehiculos
                    .FromSqlRaw("SELECT * FROM Opera_Main.dbo.VEHICULOS ORDER BY placa")
                    .ToListAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error querying external DB: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            // Parameterized query for safety
            var vehicle = await _context.Vehiculos
                .FromSqlRaw("SELECT * FROM Opera_Main.dbo.VEHICULOS WHERE placa = {0}", id)
                .FirstOrDefaultAsync();

            if (vehicle == null) return NotFound();
            return Ok(vehicle);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Vehiculo vehicle)
        {
            try
            {
                // Manual SQL for Insert
               var sql = @"
                    INSERT INTO Opera_Main.dbo.VEHICULOS (placa, marca, tipo_activo, max_volumen, estado) 
                    VALUES ({0}, {1}, {2}, {3}, {4})";
                
                await _context.Database.ExecuteSqlRawAsync(sql, 
                    vehicle.Placa ?? "", 
                    vehicle.Marca ?? "", 
                    vehicle.TipoActivo ?? "", 
                    vehicle.MaxVolumen ?? "BAJO", 
                    vehicle.Estado ?? "OPERATIVO");

                return CreatedAtAction(nameof(GetById), new { id = vehicle.Placa }, vehicle);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating vehicle: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Vehiculo vehicle)
        {
            if (id != vehicle.Placa) return BadRequest("La placa no coincide");

            var sql = @"
                UPDATE Opera_Main.dbo.VEHICULOS 
                SET marca = {0}, tipo_activo = {1}, max_volumen = {2}, estado = {3}
                WHERE placa = {4}";

            var rows = await _context.Database.ExecuteSqlRawAsync(sql,
                vehicle.Marca,
                vehicle.TipoActivo,
                vehicle.MaxVolumen,
                vehicle.Estado,
                id);

            if (rows == 0) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var sql = "DELETE FROM Opera_Main.dbo.VEHICULOS WHERE placa = {0}";
            var rows = await _context.Database.ExecuteSqlRawAsync(sql, id);
            
            if (rows == 0) return NotFound();
            return NoContent();
        }
    }
}
