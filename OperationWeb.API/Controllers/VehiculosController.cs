using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using System;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiculosController : ControllerBase
    {
        private readonly IVehiculoService _service;

        public VehiculosController(IVehiculoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try 
            {
                var vehicles = await _service.GetAllAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error querying vehicles: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var vehicle = await _service.GetByIdAsync(id);
                if (vehicle == null) return NotFound();
                return Ok(vehicle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error finding vehicle: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(Vehiculo vehicle)
        {
            try
            {
                var created = await _service.CreateAsync(vehicle);
                return CreatedAtAction(nameof(GetById), new { id = created.Placa }, created);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating vehicle: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Vehiculo vehicle)
        {
            try
            {
                if (id != vehicle.Placa) return BadRequest("La placa no coincide");

                // Check existence implicitly or inside UpdateAsync
                var exists = await _service.GetByIdAsync(id);
                if (exists == null) return NotFound();

                await _service.UpdateAsync(vehicle);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating vehicle: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var exists = await _service.GetByIdAsync(id);
                if (exists == null) return NotFound();

                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting vehicle: {ex.Message}");
            }
        }

        [HttpGet("operativos")]
        public async Task<IActionResult> GetOperativos()
        {
            try
            {
                var vehicles = await _service.GetOperativosAsync();
                // Map to Web 2.1 expected format if needed, but Service returns Entity
                // Web 2.1 expected: { id, plate, model, status, type, volumen }
                // We'll keep returning Entity. Frontend Mapper should handle it or we map here.
                // Keeping clean: Return Entity.
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error querying active vehicles: {ex.Message}");
            }
        }
    }
}
