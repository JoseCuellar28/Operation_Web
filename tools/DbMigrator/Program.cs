using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;

class Program
{
    static void Main()
    {
        string baseConn = "Server=localhost;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;";
        
        try
        {
            Console.WriteLine("=== DIAGNOSTICO DE BASE DE DATOS ===");
            using (SqlConnection connection = new SqlConnection(baseConn))
            {
                connection.Open();
                Console.WriteLine("[v] Conexion Exitosa al Servidor SQL (localhost)");

                // List Databases
                Console.WriteLine("\n[ Bases de Datos Disponibles ]");
                List<string> dbs = new List<string>();
                string sqlDbs = "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')";
                using (SqlCommand cmd = new SqlCommand(sqlDbs, connection))
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string dbName = reader.GetString(0);
                        dbs.Add(dbName);
                        Console.WriteLine($" - {dbName}");
                    }
                }

                // Check BD_Operation
                CheckDatabase(connection, "BD_Operation", new[] { "Personal", "Cargo" });

                // Check Opera_Main
                CheckDatabase(connection, "Opera_Main", new[] { "Vehiculos", "Materiales", "Proyectos" });
                
                // Check OperationWebDB (Current dev)
                CheckDatabase(connection, "OperationWebDB", new[] { "Vehiculos", "Personal" });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[x] Error Fatal: {ex.Message}");
        }
    }

    static void CheckDatabase(SqlConnection conn, string dbName, string[] tablesTocheck)
    {
        Console.WriteLine($"\nAnalyzing ({dbName})...");
        try
        {
            conn.ChangeDatabase(dbName);
            Console.WriteLine($" [v] Connected to {dbName}");
            
            foreach (var table in tablesTocheck)
            {
                string sql = $"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{table}'";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    int exists = (int)cmd.ExecuteScalar();
                    if (exists > 0)
                    {
                        // Count rows
                        string countSql = $"SELECT COUNT(*) FROM {table}";
                        using (SqlCommand countCmd = new SqlCommand(countSql, conn))
                        {
                            try 
                            { 
                                int rows = (int)countCmd.ExecuteScalar();
                                Console.WriteLine($"   - Table '{table}': FOUND ({rows} rows)");
                            }
                            catch
                            {
                                Console.WriteLine($"   - Table '{table}': FOUND (Error counting rows)");
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine($"   - Table '{table}': NOT FOUND");
                    }
                }
            }
        }
        catch (Exception)
        {
             Console.WriteLine($" [!] Could not connect to {dbName} (Database might not exist)");
        }
    }
}
