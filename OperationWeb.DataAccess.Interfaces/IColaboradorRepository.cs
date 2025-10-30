using OperationWeb.DataAccess.Entities;

namespace OperationWeb.DataAccess.Interfaces
{
    public interface IColaboradorRepository : IRepository<Colaborador>
    {
        Task<IEnumerable<Colaborador>> GetColaboradoresByEstadoAsync(string estado);
        Task<IEnumerable<Colaborador>> GetColaboradoresByCargoAsync(string cargo);
        Task<IEnumerable<Colaborador>> GetColaboradoresDisponiblesAsync();
        Task<IEnumerable<Cuadrilla>> GetCuadrillasByColaboradorAsync(int colaboradorId);
        Task<Colaborador?> GetByDocumentoAsync(string documento);
        Task<Colaborador?> GetByEmailAsync(string email);
    }
}