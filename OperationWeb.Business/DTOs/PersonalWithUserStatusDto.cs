using OperationWeb.Core.Entities;

namespace OperationWeb.Business.DTOs
{
    public class PersonalWithUserStatusDto : Personal
    {
        public bool HasUser { get; set; }
        public bool UserIsActive { get; set; }
    }
}
