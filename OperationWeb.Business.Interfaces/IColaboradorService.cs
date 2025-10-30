using OperationWeb.DataAccess.Entities;

namespace OperationWeb.Business.Interfaces
{
    public interface IColaboradorService
    {
        Task<IEnumerable<Colaborador>> GetAllColaboradoresAsync();
        Task<Colaborador?> GetColaboradorByIdAsync(int id);
        Task<IEnumerable<Colaborador>> GetColaboradoresByEstadoAsync(string estado);
        Task<IEnumerable<Colaborador>> GetColaboradoresByCargoAsync(string cargo);
        Task<IEnumerable<Colaborador>> GetColaboradoresDisponiblesAsync();
        Task<Colaborador> CreateColaboradorAsync(Colaborador colaborador);
        Task<Colaborador> UpdateColaboradorAsync(Colaborador colaborador);
        Task<bool> DeleteColaboradorAsync(int id);
        Task<IEnumerable<Cuadrilla>> GetCuadrillasByColaboradorAsync(int colaboradorId);
        Task<bool> ValidarDocumentoUnicoAsync(string documento, int? colaboradorId = null);
        Task<bool> ValidarEmailUnicoAsync(string email, int? colaboradorId = null);
    }
}