using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace OperationWeb.Business.Interfaces
{
    public interface IDataImportService
    {
        Task<(int Processed, int Errors, List<string> ErrorLog)> ImportPersonalAsync(Stream excelStream);
    }
}
