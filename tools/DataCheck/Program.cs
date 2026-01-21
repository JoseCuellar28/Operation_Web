using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.Core.Entities;

namespace DataCheck
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Starting Data Check...");

            var connStr = "Server=100.125.169.14;Database=DB_Operation;User Id=SA;Password=YourStrong(!)Password;MultipleActiveResultSets=true;Encrypt=True;TrustServerCertificate=True;";
            var operaConnStr = connStr.Replace("Database=DB_Operation", "Database=Opera_Main");

            // Check DB_Operation.Personal
            var optionsBuilder = new DbContextOptionsBuilder<OperationWebDbContext>();
            optionsBuilder.UseSqlServer(connStr);
            using (var context = new OperationWebDbContext(optionsBuilder.Options))
            {
                try
                {
                    Console.WriteLine("Checking DB_Operation...");
                    if (context.Database.CanConnect())
                    {
                        var personalCount = context.Personal.Count();
                        Console.WriteLine($"[SUCCESS] DB_Operation.Personal Count: {personalCount}");
                        
                        if(personalCount > 0)
                        {
                            var first = context.Personal.First();
                            Console.WriteLine($"First Personal: {first.DNI} - {first.Inspector}");
                        }
                    }
                    else
                    {
                        Console.WriteLine("[ERROR] Cannot connect to DB_Operation");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] DB_Operation check failed: {ex.Message}");
                }
            }

            // Check Opera_Main.Colaboradores
            var optionsBuilder2 = new DbContextOptionsBuilder<OperaMainDbContext>();
            optionsBuilder2.UseSqlServer(operaConnStr);
            using (var context2 = new OperaMainDbContext(optionsBuilder2.Options))
            {
                try
                {
                    Console.WriteLine("Checking Opera_Main...");
                     if (context2.Database.CanConnect())
                    {
                        var colabCount = context2.Colaboradores.Count();
                        Console.WriteLine($"[SUCCESS] Opera_Main.COLABORADORES Count: {colabCount}");
                         if(colabCount > 0)
                        {
                            var first = context2.Colaboradores.First();
                            Console.WriteLine($"First Colaborador: {first.DNI} - {first.Nombre}");
                        }
                    }
                     else
                    {
                        Console.WriteLine("[ERROR] Cannot connect to Opera_Main");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Opera_Main check failed: {ex.Message}");
                }
            }
        }
    }
}
