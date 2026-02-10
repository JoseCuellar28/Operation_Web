using OfficeOpenXml;
using OperationWeb.Business.Interfaces;
using OperationWeb.Business.Interfaces.DTOs;
using OperationWeb.Core.Entities;
using OperationWeb.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace OperationWeb.Business.Services
{
    public class DataImportService : IDataImportService
    {
        private readonly IPersonalRepository _personalRepository;

        public DataImportService(IPersonalRepository personalRepository)
        {
            _personalRepository = personalRepository;
        }

        public async Task<(int Processed, int Errors, List<string> ErrorLog)> ImportPersonalAsync(Stream excelStream)
        {
            var processedCount = 0;
            var errorCount = 0;
            var errorLog = new List<string>();

            using (var package = new ExcelPackage(excelStream))
            {
                var worksheet = package.Workbook.Worksheets[0]; // Assume first sheet
                var rowCount = worksheet.Dimension.Rows;

                // Loop starts at 2 to skip header
                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        var dni = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        if (string.IsNullOrEmpty(dni)) continue; // Skip empty rows

                        var importDto = new PersonalImportDto
                        {
                            Dni = dni,
                            NombreCompleto = worksheet.Cells[row, 2].Value?.ToString()?.ToUpper() ?? "",
                            Distrito = worksheet.Cells[row, 3].Value?.ToString() ?? "",
                            Tipo = worksheet.Cells[row, 4].Value?.ToString() ?? "OPERATIVO",
                            Estado = worksheet.Cells[row, 5].Value?.ToString() ?? "ACTIVO",
                            FechaIngreso = ParseDate(worksheet.Cells[row, 6].Value),
                            FechaCese = ParseNullableDate(worksheet.Cells[row, 7].Value),
                            FechaNacimiento = ParseDate(worksheet.Cells[row, 8].Value),
                            Division = worksheet.Cells[row, 9].Value?.ToString() ?? "",
                            Area = worksheet.Cells[row, 10].Value?.ToString() ?? "",
                            Cargo = worksheet.Cells[row, 11].Value?.ToString() ?? "",
                            CodigoEmpleado = worksheet.Cells[row, 12].Value?.ToString() ?? "",
                            CodigoCebe = worksheet.Cells[row, 13].Value?.ToString() ?? "",
                            Email = worksheet.Cells[row, 14].Value?.ToString() ?? "",
                            Telefono = worksheet.Cells[row, 16].Value?.ToString() ?? ""
                        };

                        await ProcessUpsertAsync(importDto);
                        processedCount++;
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        errorLog.Add($"Row {row}: {ex.Message}");
                    }
                }
            }

            return (processedCount, errorCount, errorLog);
        }

        private async Task ProcessUpsertAsync(PersonalImportDto dto)
        {
            var existing = await _personalRepository.GetByDNIAsync(dto.Dni);

            if (existing == null)
            {
                // INSERT
                var newEntity = new Personal
                {
                    DNI = dto.Dni,
                    Inspector = dto.NombreCompleto,
                    Distrito = dto.Distrito,
                    Tipo = dto.Tipo,
                    Estado = dto.Estado,
                    FechaInicio = dto.FechaIngreso,
                    FechaCese = dto.FechaCese,
                    FechaNacimiento = dto.FechaNacimiento,
                    Division = dto.Division,
                    Area = dto.Area,
                    Categoria = dto.Cargo,
                    CodigoEmpleado = dto.CodigoEmpleado,
                    CodigoCebe = dto.CodigoCebe,
                    Email = dto.Email,
                    Telefono = dto.Telefono,
                    UsuarioCreacion = "IMPORT_EXCEL",
                    FechaCreacion = DateTime.Now
                };
                await _personalRepository.AddAsync(newEntity);
                await _personalRepository.AddAsync(newEntity);

            }
            else
            {
                // UPDATE
                existing.Inspector = dto.NombreCompleto;
                existing.Distrito = dto.Distrito;
                existing.Tipo = dto.Tipo;
                existing.Estado = dto.Estado;
                existing.FechaInicio = dto.FechaIngreso;
                existing.FechaCese = dto.FechaCese;
                existing.Division = dto.Division;
                existing.Area = dto.Area;
                existing.Categoria = dto.Cargo;
                existing.CodigoCebe = dto.CodigoCebe;
                existing.UsuarioModificacion = "IMPORT_EXCEL";
                existing.FechaModificacion = DateTime.Now;
                
                await _personalRepository.UpdateAsync(existing);

            }
        }

        private DateTime ParseDate(object value)
        {
            if (value is DateTime dt) return dt;
            if (DateTime.TryParse(value?.ToString(), out var result)) return result;
            return DateTime.MinValue;
        }

        private DateTime? ParseNullableDate(object value)
        {
            if (value is DateTime dt) return dt;
            if (DateTime.TryParse(value?.ToString(), out var result)) return result;
            return null;
        }
    }
}
