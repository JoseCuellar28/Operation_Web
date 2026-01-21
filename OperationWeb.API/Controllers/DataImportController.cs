using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OperationWeb.Business.Interfaces;
using System;
using System.IO;
using System.Threading.Tasks;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/import")]
    public class DataImportController : ControllerBase
    {
        private readonly IDataImportService _importService;

        public DataImportController(IDataImportService importService)
        {
            _importService = importService;
        }

        [HttpPost("personal")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportPersonal(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Only .xlsx files are supported.");

            try
            {
                using var stream = file.OpenReadStream();
                var (processed, errors, log) = await _importService.ImportPersonalAsync(stream);

                return Ok(new
                {
                    message = "Import completed",
                    processedCount = processed,
                    errorCount = errors,
                    errorLog = log
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Critical error during import", error = ex.Message });
            }
        }
    }
}
