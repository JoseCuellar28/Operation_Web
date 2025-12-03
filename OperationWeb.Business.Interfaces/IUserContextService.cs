namespace OperationWeb.Business.Interfaces
{
    public interface IUserContextService
    {
        string? GetUserDni();
        string? GetUserRole();
        string? GetUserDivision();
        string? GetUserArea();
        string? GetUserLevel();
    }
}
