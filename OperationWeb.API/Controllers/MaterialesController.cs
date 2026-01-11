using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Entities;
using System;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialesController : ControllerBase
    {
        private readonly OperationWebDbContext _context;

        public MaterialesController(OperationWebDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var materiales = await _context.Materiales
                    .FromSqlRaw("SELECT * FROM Opera_Main.dbo.CATALOGO_MATERIALES ORDER BY nombre")
                    .ToListAsync();
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
                var material = await _context.Materiales
                    .FromSqlRaw("SELECT * FROM Opera_Main.dbo.CATALOGO_MATERIALES WHERE id_material = {0}", id)
                    .FirstOrDefaultAsync();

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
                // Generate ID if not provided (though usually frontend shouldn't provider it for creation, backend handles it)
                if (material.Id == Guid.Empty)
                {
                    material.Id = Guid.NewGuid();
                }

                var sql = @"
                    INSERT INTO Opera_Main.dbo.CATALOGO_MATERIALES 
                    (id_material, nombre, tipo, unidad_medida, costo_unitario, id_gesproyec, categoria) 
                    VALUES ({0}, {1}, {2}, {3}, {4}, {5}, {6})";

                await _context.Database.ExecuteSqlRawAsync(sql,
                    material.Id,
                    material.Nombre ?? "",
                    material.Tipo ?? "MATERIAL",
                    material.UnidadMedida ?? "UND",
                    material.CostoUnitario,
                    material.IdGesproyec ?? "",
                    material.Categoria ?? "GENERAL");

                return Ok(new { message = "Material creado exitosamente", id = material.Id });
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
                if (id == Guid.Empty) return BadRequest("ID inválido");

                var sql = @"
                    UPDATE Opera_Main.dbo.CATALOGO_MATERIALES 
                    SET nombre = {0}, tipo = {1}, unidad_medida = {2}, costo_unitario = {3}, 
                        id_gesproyec = {4}, categoria = {5}
                    WHERE id_material = {6}";

                var result = await _context.Database.ExecuteSqlRawAsync(sql,
                    material.Nombre ?? "",
                    material.Tipo ?? "MATERIAL",
                    material.UnidadMedida ?? "UND",
                    material.CostoUnitario,
                    material.IdGesproyec ?? "",
                    material.Categoria ?? "GENERAL",
                    id);

                if (result == 0) return NotFound("Material no encontrado");

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
                // Assuming ID is passed as string in URL, but Binder handles Guid conversion
                if (id == Guid.Empty) return BadRequest("ID inválido");

                // Warning: Hard Delete. Ensure this is desired logic or switch to soft delete if Activo column exists (it doesn't appear to based on schema inspection)
                var sql = "DELETE FROM Opera_Main.dbo.CATALOGO_MATERIALES WHERE id_material = {0}";
                
                var result = await _context.Database.ExecuteSqlRawAsync(sql, id);

                if (result == 0) return NotFound("Material no encontrado");

                return Ok(new { message = "Material eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar material", error = ex.Message });
            }
        }
    }
}
