using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using OperationWeb.Core.Entities;
using System;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialesController : ControllerBase
    {
        private readonly IMaterialService _service;

        public MaterialesController(IMaterialService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var materiales = await _service.GetAllAsync();
                return Ok(materiales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno", error = ex.ToString() });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var material = await _service.GetByIdAsync(id);
                if (material == null) return NotFound("Material no encontrado");
                return Ok(material);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno", error = ex.ToString() });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Material material)
        {
            try
            {
                var created = await _service.CreateAsync(material);
                return Ok(new { message = "Material creado exitosamente", id = created.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear material", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Material material)
        {
            try
            {
                if (id != material.Id) return BadRequest("ID no coincide");
                
                // Check existence first
                var exists = await _service.GetByIdAsync(id);
                if (exists == null) return NotFound("Material no encontrado");

                await _service.UpdateAsync(material);
                return Ok(new { message = "Material actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar material", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                // Check existence first
                var exists = await _service.GetByIdAsync(id);
                if (exists == null) return NotFound("Material no encontrado");

                await _service.DeleteAsync(id);
                return Ok(new { message = "Material eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar material", error = ex.Message });
            }
        }
    }
}
