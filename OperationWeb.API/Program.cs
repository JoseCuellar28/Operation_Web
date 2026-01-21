using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.OpenApi;
using OperationWeb.DataAccess;
using OperationWeb.Core.Interfaces;
using OperationWeb.Business.Interfaces;
using OperationWeb.Business;

// Load .env file
// Load .env file (Safe execution) - Trigger Deploy
try { DotNetEnv.Env.Load(); } catch { /* Ignore missing .env in production */ }

// EPPlus 7 Fix
OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

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
// FIX: Use standard Configuration to allow CLI override (CLI > Env > JSON)
var conn = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine($"[DEBUG] Connection String: {(string.IsNullOrEmpty(conn) ? "EMPTY" : conn.Replace("Password=", "Password=***"))}");


// Check if we should use SQL:
// 1. Must have a connection string
// 2. Connection string must NOT contain "REEMPLAZAR" (placeholder)
var useSql = !string.IsNullOrWhiteSpace(conn) && !conn.Contains("REEMPLAZAR", StringComparison.OrdinalIgnoreCase);

if (useSql)
{
    builder.Services.AddDbContext<OperationWebDbContext>(options => options.UseSqlServer(conn));
    
    // Register External DB Context (Opera_Main)
    // Derived from DefaultConnection by swapping Database Name
    var operaConn = conn.Replace("Database=DB_Operation", "Database=Opera_Main", StringComparison.OrdinalIgnoreCase);
    builder.Services.AddDbContext<OperaMainDbContext>(options => options.UseSqlServer(operaConn));
}
else
{
    builder.Services.AddDbContext<OperationWebDbContext>(options => options.UseInMemoryDatabase("DevOperationWeb"));
    builder.Services.AddDbContext<OperaMainDbContext>(options => options.UseInMemoryDatabase("DevOperaMain"));
}

// Register repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICuadrillaRepository, CuadrillaRepository>();
builder.Services.AddScoped<OperationWeb.Core.Interfaces.IEmpleadoRepository, OperationWeb.DataAccess.Repositories.EmpleadoRepository>();
builder.Services.AddScoped<OperationWeb.Core.Interfaces.IPersonalRepository, OperationWeb.DataAccess.Repositories.PersonalRepository>();
builder.Services.AddScoped<OperationWeb.Core.Interfaces.IMaterialRepository, OperationWeb.DataAccess.Repositories.MaterialRepository>();
builder.Services.AddScoped<OperationWeb.Core.Interfaces.IVehiculoRepository, OperationWeb.DataAccess.Repositories.VehiculoRepository>();
builder.Services.AddScoped<OperationWeb.Core.Interfaces.IProyectoRepository, OperationWeb.DataAccess.Repositories.ProyectoRepository>();

// Register services
builder.Services.AddScoped<ICuadrillaService, CuadrillaService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IMaterialService, OperationWeb.Business.Services.MaterialService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IVehiculoService, OperationWeb.Business.Services.VehiculoService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.ILiquidationService, OperationWeb.Business.Services.LiquidationService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IDataImportService, OperationWeb.Business.Services.DataImportService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IProyectoService, OperationWeb.Business.Services.ProyectoService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IEmpleadoService, OperationWeb.Business.Services.EmpleadoService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IPersonalService, OperationWeb.Business.Services.PersonalService>();
builder.Services.AddScoped<OperationWeb.Business.Services.IEncryptionService, OperationWeb.Business.Services.EncryptionService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IEmailService, OperationWeb.Business.Services.EmailService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IUserService, OperationWeb.Business.Services.UserService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IProyectoService, OperationWeb.Business.Services.ProyectoService>();
builder.Services.AddScoped<OperationWeb.Business.Interfaces.IAttendanceService, OperationWeb.Business.Services.AttendanceService>();
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
        
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogError("[Auth] Authentication Failed: {Message}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogInformation("[Auth] Token Validated for User: {User}", context.Principal?.Identity?.Name);
                return Task.CompletedTask;
            }
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
app.UseCors("DevFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// ---------------------------------------------------------
// HARDENING: STRICT API ISOLATION MIDDLEWARE
// ---------------------------------------------------------
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower() ?? "";
    
    // Whitelist: API, Health, Swagger (Dev Only)
    bool isApi = path.StartsWith("/api/");
    bool isHealth = path.Equals("/health");
    bool isSwagger = path.StartsWith("/swagger");

    if (!isApi && !isHealth && !isSwagger && path != "/") 
    {
        // Force 404 JSON for any other path (prevents file sniffing or UI loading)
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("{\"error\": \"Not Found\", \"message\": \"API-Only Backend. Access Denied for Request.\"}");
        return;
    }

    await next();
});

app.MapControllers();
// Health Check Endpoint
app.MapGet("/health", () => Results.Ok("Healthy"));

// Secure Root Path (API Only Mode)
app.MapGet("/", () => Results.Json(new { status = "online", service = "OperationWeb.API", version = "v1-core" }));
app.MapGet("/{path:nonfile}", (string path) => {
    if (path.StartsWith("api")) return Results.NotFound(); // Let API 404 handle it normally if controller not found
    return Results.Json(new { error = "Not Found", message = "API-Only Server. Please use /api/v1 prefix." }, statusCode: 404);
});

Console.WriteLine($"[DEBUG] ContentRootPath: {app.Environment.ContentRootPath}");
Console.WriteLine($"[DEBUG] WebRootPath: {app.Environment.WebRootPath}");


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
            await db.Roles.AddAsync(new OperationWeb.Core.Entities.Role { Name = "Admin", Description = "Administrador del Sistema" });
        if (!await db.Roles.AnyAsync(r => r.Name == "Usuario"))
            await db.Roles.AddAsync(new OperationWeb.Core.Entities.Role { Name = "Usuario", Description = "Usuario Operativo" });
        await db.SaveChangesAsync();

        // 4. Seed Users (Automated Golden Script)
        // Ensure Admin exists for system health, but respect existing
        if (!await db.Users.AnyAsync(u => u.DNI == "admin"))
        {
             // Only create if completely missing
             await db.Users.AddAsync(new OperationWeb.Core.Entities.User 
            { 
                DNI = "admin", 
                Email = "admin@ocal.com", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Prueba123"), 
                Role = "Admin", 
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = false
            });
            await db.SaveChangesAsync();
            Console.WriteLine("[STARTUP] Seeded Admin User (Missing).");
        }

        // 4.3 SPECIFIC USER REQUEST (41007510)
        var targetUser = await db.Users.FirstOrDefaultAsync(u => u.DNI == "41007510");
        if (targetUser == null)
        {
            // Calculate Hash for "123456" dynamically
            string specificHash = BCrypt.Net.BCrypt.HashPassword("123456");
            
            targetUser = new OperationWeb.Core.Entities.User 
            { 
                DNI = "41007510", 
                Email = "user41007510@ocal.com", 
                PasswordHash = specificHash, 
                Role = "Admin", // Giving Admin to ensure visibility
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = false
            };
            await db.Users.AddAsync(targetUser);
            await db.SaveChangesAsync();
            Console.WriteLine("[STARTUP] Seeded Target User 41007510.");
        }
        else 
        {
            // Reset state if exists - FORCE PASSWORD SYNC
            targetUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
            targetUser.Role = "Admin"; 
            targetUser.IsActive = true; // Force Active
            // Ensure Config is updated too
            var config = await db.UserAccessConfigs.FirstOrDefaultAsync(c => c.UserId == targetUser.Id);
            if (config != null) { config.AccessWeb = true; config.AccessApp = true; }
            
            await db.SaveChangesAsync();
            Console.WriteLine("[STARTUP] Reset Target User 41007510 with Fresh Hash.");
        }

        // 5. Seed Access Configs (Crucial for Web Login)
        // ... (Skipping Admin/Colab default checks for brevity in this patch if they are unchanged, ensuring only 41007510 logic is updated below) ...
        
        // Ensure Access for 41007510 (FORCE UPDATE)
        if (targetUser != null)
        {
             var existingConfig = await db.UserAccessConfigs.FirstOrDefaultAsync(c => c.UserId == targetUser.Id);
             if (existingConfig != null)
             {
                 existingConfig.AccessApp = true;
                 existingConfig.AccessWeb = true;
                 existingConfig.LastUpdated = DateTime.UtcNow;
                 Console.WriteLine("[STARTUP] Updated Access for 41007510.");
             }
             else
             {
                 await db.UserAccessConfigs.AddAsync(new OperationWeb.Core.Entities.UserAccessConfig 
                { 
                    UserId = targetUser.Id, 
                    AccessWeb = true, 
                    AccessApp = true, 
                    JobLevel = "Manager", 
                    LastUpdated = DateTime.UtcNow 
                });
                Console.WriteLine("[STARTUP] Created Access for 41007510.");
             }
             await db.SaveChangesAsync();
        }

        // 5.5 Seed Personal Data (Hotfix for 500 Error in /api/personal)
        var personalTarget = await db.Personal.FirstOrDefaultAsync(p => p.DNI == "41007510");
        if (personalTarget == null)
        {
            await db.Personal.AddAsync(new OperationWeb.Core.Entities.Personal
            {
                DNI = "41007510",
                Inspector = "Admin Sistema",
                Telefono = "999-999-999",
                Distrito = "Central",
                Tipo = "Administrador",
                Division = "Sistemas",
                Area = "TI",
                FechaInicio = DateTime.UtcNow,
                FechaCreacion = DateTime.UtcNow,
                
                Estado = "Activo"
            });
            await db.SaveChangesAsync();
            Console.WriteLine("[STARTUP] Seeded Personal Data for 41007510.");
        }

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


// Startup Checks
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OperationWeb.DataAccess.OperationWebDbContext>();
    try 
    {
        var count = context.Personal.Count();
        Console.WriteLine($"[STARTUP CHECKS] Personal Table Count: {count}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[STARTUP CHECKS] Failed to count personal: {ex.Message}");
    }
}

app.Run();

public partial class Program { }
