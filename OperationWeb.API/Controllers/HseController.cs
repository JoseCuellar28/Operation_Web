using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace OperationWeb.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HseController : ControllerBase
    {
        private readonly OperationWebDbContext _db;

        public HseController(OperationWebDbContext db)
        {
            _db = db;
        }

        // --- DASHBOARD KPIS ---
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTime.UtcNow.Date;
            var monthStart = new DateTime(today.Year, today.Month, 1);

            var totalInspections = await _db.HseInspections.CountAsync(i => i.Date >= monthStart);
            var openIncidents = await _db.HseIncidents.CountAsync(i => i.Status == "Open" || i.Status == "Investigating");
            var ppeDeliveries = await _db.HsePpeDeliveries.CountAsync(i => i.Date >= monthStart);
            
            // Calculate Safe Days (Days since last incident)
            var lastIncident = await _db.HseIncidents.OrderByDescending(i => i.Date).FirstOrDefaultAsync();
            var safeDays = lastIncident == null ? 0 : (today - lastIncident.Date).Days;

            return Ok(new 
            {
                TotalInspections = totalInspections,
                OpenIncidents = openIncidents,
                PpeDeliveries = ppeDeliveries,
                SafeDays = safeDays
            });
        }

        // --- INSPECTIONS ---
        [HttpPost("inspections")]
        public async Task<IActionResult> CreateInspection([FromBody] HseInspection inspection)
        {
            inspection.Date = DateTime.UtcNow;
            inspection.CreatedAt = DateTime.UtcNow;
            inspection.Status = "Submitted";
            
            _db.HseInspections.Add(inspection);
            await _db.SaveChangesAsync();
            return Ok(inspection);
        }

        [HttpGet("inspections")]
        public async Task<IActionResult> GetInspections()
        {
            // Managers see all, others might be limited (TODO rule)
            var list = await _db.HseInspections.OrderByDescending(i => i.Date).Take(50).ToListAsync();
            return Ok(list);
        }

        // --- PPE DELIVERY ---
        [HttpPost("ppe")]
        public async Task<IActionResult> RecordPpe([FromBody] HsePpeDelivery ppe)
        {
            ppe.Date = DateTime.UtcNow;
            ppe.CreatedAt = DateTime.UtcNow;
            _db.HsePpeDeliveries.Add(ppe);
            await _db.SaveChangesAsync();
            return Ok(ppe);
        }

        // --- INCIDENTS ---
        [HttpPost("incidents")]
        public async Task<IActionResult> ReportIncident([FromBody] HseIncident incident)
        {
            incident.Date = DateTime.UtcNow;
            incident.CreatedAt = DateTime.UtcNow;
            incident.Status = "Open";
            _db.HseIncidents.Add(incident);
            await _db.SaveChangesAsync();
            return Ok(incident);
        }
    }
}
