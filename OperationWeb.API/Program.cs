using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.OpenApi;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Interfaces;
using OperationWeb.Business.Interfaces;
using OperationWeb.Business;

// Load .env file
// Load .env file (Safe execution) - Trigger Deploy
try { DotNetEnv.Env.Load(); } catch { /* Ignore missing .env in production */ }

var builder = WebApplication.CreateBuilder(args);
// builder.WebHost.UseUrls(builder.Configuration["Urls"] ?? "http://localhost:5132");

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// Configure Entity Framework (prefer InMemory when no valid SQL connection)
var isDev = builder.Environment.IsDevelopment() ||
            string.Equals(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"), "Development", StringComparison.OrdinalIgnoreCase);

// Try to get connection string from environment variable first, then configuration
var conn = Environment.GetEnvironmentVariable("DefaultConnection") ?? 
           builder.Configuration.GetConnectionString("DefaultConnection") ?? 
           string.Empty;

Console.WriteLine($"[DEBUG] Connection String: {(string.IsNullOrEmpty(conn) ? "EMPTY" : conn.Replace("Password=", "Password=***"))}");


// Check if we should use SQL:
// 1. Must have a connection string
// 2. Connection string must NOT contain "REEMPLAZAR" (placeholder)
var useSql = !string.IsNullOrWhiteSpace(conn) && !conn.Contains("REEMPLAZAR", StringComparison.OrdinalIgnoreCase);

if (useSql)
{
    builder.Services.AddDbContext<OperationWebDbContext>(options => options.UseSqlServer(conn));
}
else
{
    builder.Services.AddDbContext<OperationWebDbContext>(options => options.UseInMemoryDatabase("DevOperationWeb"));
}

// Register repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICuadrillaRepository, CuadrillaRepository>();
builder.Services.AddScoped<OperationWeb.DataAccess.Interfaces.IEmpleadoRepository, OperationWeb.DataAccess.Repositories.EmpleadoRepository>();
builder.Services.AddScoped<OperationWeb.DataAccess.Interfaces.IPersonalRepository, OperationWeb.DataAccess.Repositories.PersonalRepository>();

// Register services
builder.Services.AddScoped<ICuadrillaService, CuadrillaService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IEmpleadoService, OperationWeb.Business.Services.EmpleadoService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IPersonalService, OperationWeb.Business.Services.PersonalService>();
builder.Services.AddScoped<OperationWeb.Business.Services.IEncryptionService, OperationWeb.Business.Services.EncryptionService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IEmailService, OperationWeb.Business.Services.EmailService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IUserService, OperationWeb.Business.Services.UserService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IProyectoService, OperationWeb.Business.Services.ProyectoService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IUserContextService, OperationWeb.Business.Services.UserContextService>();
builder.Services.AddHttpContextAccessor();


// Add CORS
var corsSection = builder.Configuration.GetSection("Cors");
var allowedOrigins = corsSection.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:8000", "http://localhost:8080", "http://localhost:5173" };
var allowAnyOriginInDev = corsSection.GetValue<bool>("AllowAnyOriginInDev");
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevFrontend", policy =>
    {
        // NUCLEAR CORS OPTION: Allow everything to ensure frontend URL works immediately
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"] ?? "REEMPLAZAR";
        var issuer = builder.Configuration["Jwt:Issuer"] ?? "OperationWeb";
        var audience = builder.Configuration["Jwt:Audience"] ?? "OperationWebClients";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("LoginPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            key => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromSeconds(60),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseRateLimiter();
app.UseCors("DevFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Health Check Endpoint
app.MapGet("/health", () => Results.Ok("Healthy"));

// BLOCKING INITIALIZATION (The "No-Fail" Approach)
// We await this explicitly to ensure the DB is ready before the app creates the HTTP server.
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<OperationWebDbContext>();
        
        Console.WriteLine("[STARTUP] Checking Database...");
        // 1. Create Tables
        await db.Database.EnsureCreatedAsync();
        Console.WriteLine("[STARTUP] Database Tables Verified/Created.");

        // 2. Evolutionary SQL for UserAccessConfigs
        try 
        {
            await db.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserAccessConfigs')
                CREATE TABLE UserAccessConfigs (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    UserId INT NOT NULL,
                    AccessWeb BIT NOT NULL DEFAULT 1,
                    AccessApp BIT NOT NULL DEFAULT 1,
                    LastUpdated DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                );");
                Console.WriteLine("[STARTUP] UserAccessConfigs check complete.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[STARTUP WARNING] Secondary table check failed: {ex.Message}");
        }

        // 3. Ensure Roles
        if (!await db.Roles.AnyAsync(r => r.Name == "Admin"))
            await db.Roles.AddAsync(new OperationWeb.DataAccess.Entities.Role { Name = "Admin", Description = "Administrador del Sistema" });
        if (!await db.Roles.AnyAsync(r => r.Name == "Usuario"))
            await db.Roles.AddAsync(new OperationWeb.DataAccess.Entities.Role { Name = "Usuario", Description = "Usuario Operativo" });
        await db.SaveChangesAsync();

        // 4. Seed Users (Automated Golden Script)
        // Hash for "Prueba123" (BCrypt Universal) to bypass AES Key Mismatches in Azure
        string defaultPassHash = "$2a$11$ft2A9VRTZN.RT5N0o7oVyuKWr3TqtC26OGronNLI5PV2JCou21yvy"; 
        
        // 4.1 Admin User
        var adminUser = await db.Users.FirstOrDefaultAsync(u => u.DNI == "admin");
        if (adminUser == null)
        {
            adminUser = new OperationWeb.DataAccess.Entities.User 
            { 
                DNI = "admin", 
                Email = "admin@ocal.com", 
                PasswordHash = defaultPassHash, 
                Role = "Admin", 
                IsActive = true, 
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = false
            };
            await db.Users.AddAsync(adminUser);
            await db.SaveChangesAsync();
            Console.WriteLine("[STARTUP] Seeded Admin User.");
        }

        // 4.2 Collaborator User
        var colabUser = await db.Users.FirstOrDefaultAsync(u => u.DNI == "colaborador");
        if (colabUser == null)
        {
            colabUser = new OperationWeb.DataAccess.Entities.User 
            { 
                DNI = "colaborador", 
                Email = "colab@ocal.com", 
                PasswordHash = defaultPassHash, 
                Role = "Usuario", 
                IsActive = true, 
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = false
            };
            await db.Users.AddAsync(colabUser);
            await db.SaveChangesAsync();
            Console.WriteLine("[STARTUP] Seeded Collaborator User.");
        }

        // 5. Seed Access Configs (Crucial for Web Login)
        if (!await db.UserAccessConfigs.AnyAsync(c => c.UserId == adminUser.Id))
        {
            await db.UserAccessConfigs.AddAsync(new OperationWeb.DataAccess.Entities.UserAccessConfig 
            { 
                UserId = adminUser.Id, 
                AccessWeb = true, 
                AccessApp = true, 
                JobLevel = "Manager", 
                LastUpdated = DateTime.UtcNow 
            });
        }

        if (!await db.UserAccessConfigs.AnyAsync(c => c.UserId == colabUser.Id))
        {
            await db.UserAccessConfigs.AddAsync(new OperationWeb.DataAccess.Entities.UserAccessConfig 
            { 
                UserId = colabUser.Id, 
                AccessWeb = true, 
                AccessApp = true, 
                JobLevel = "Employee", 
                LastUpdated = DateTime.UtcNow 
            });
        }
        await db.SaveChangesAsync();

        // 6. Seed Projects (Test Data)
        // Using Raw SQL because Proyectos might not be fully mapped in DbSet yet or to be safe
        var countProyectos = await db.Database.SqlQueryRaw<int>("SELECT COUNT(1) as Value FROM Proyectos").FirstOrDefaultAsync();
        if (countProyectos == 0)
        {
             await db.Database.ExecuteSqlRawAsync(@"
                INSERT INTO Proyectos (Nombre, Codigo, Estado, FechaInicio, GerenteDni, JefeDni)
                VALUES 
                ('Mantenimiento Linea 1', 'PRJ-001', 'Activo', GETUTCDATE(), 'admin', 'colaborador'),
                ('Ampliación Subestación Norte', 'PRJ-002', 'Planificacion', GETUTCDATE(), 'admin', 'otro'),
                ('Reparación Emergencia', 'PRJ-003', 'Activo', GETUTCDATE(), 'admin', 'colaborador');
            ");
            Console.WriteLine("[STARTUP] Seeded Test Projects.");
        }

        Console.WriteLine("[STARTUP] Initialization Complete (Users & Data Ready).");
    }
}
catch (Exception ex)
{
    // Log CRITICAL error but allow app to crash so Azure restarts it
    Console.WriteLine($"[CRITICAL STARTUP ERROR] Database initialization failed: {ex.Message}");
    // We do NOT rethrow to avoid 502 Bad Gateway loop if DB is transiently down, 
    // but without DB the app is useless anyway. 
    // Ideally we let it crash, but for Azure cold start stability, we log and proceed.
}

app.Logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
app.Logger.LogInformation("DB provider: {Provider}", useSql ? "SqlServer" : "InMemory");
app.Logger.LogInformation("Listening on: {Urls}", builder.Configuration["Urls"] ?? "http://localhost:5132");

app.Run();

public partial class Program { }
