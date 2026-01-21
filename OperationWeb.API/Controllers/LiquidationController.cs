using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using System;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LiquidationController : ControllerBase
    {
        private readonly ILiquidationService _service;

        public LiquidationController(ILiquidationService service)
        {
            _service = service;
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            try
            {
                var result = await _service.GetPendingLiquidationsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving liquidations", error = ex.Message });
            }
        }

        [HttpGet("{otCode}")]
        public async Task<IActionResult> GetByOt(string otCode)
        {
            try
            {
                var result = await _service.GetLiquidationByOtAsync(otCode);
                if (result == null) return NotFound("Liquidación no encontrada para la OT especificada.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving liquidation", error = ex.Message });
            }
        }
    }
}
