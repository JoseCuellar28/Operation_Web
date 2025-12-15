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
// Load .env file (Safe execution)
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
var allowedOrigins = corsSection.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:8000", "http://localhost:8080" };
var allowAnyOriginInDev = corsSection.GetValue<bool>("AllowAnyOriginInDev");
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevFrontend", policy =>
    {
        if (allowAnyOriginInDev)
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
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

// Non-blocking initialization to prevent Azure 504 Gateway Timeout
Task.Run(async () =>
{
    try
    {
        // Wait 5 seconds to ensure app is fully up
        await Task.Delay(5000); 

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<OperationWebDbContext>();
            try
            {
                await db.Database.EnsureCreatedAsync();

                // Evolutionary DB Update: Ensure UserAccessConfigs table exists without wiping data
                try 
                {
                    Console.WriteLine("[DEBUG] ATTEMPTING TO CREATE UserAccessConfigs TABLE...");
                    // Debug Schema
                    // var currentSchema = await db.Database.SqlQueryRaw<string>("SELECT SCHEMA_NAME()").FirstOrDefaultAsync();
                    // Console.WriteLine($"[DEBUG] DEFAULT SCHEMA: {currentSchema}");

                    await db.Database.ExecuteSqlRawAsync(@"
                     IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserAccessConfigs')
                     CREATE TABLE UserAccessConfigs (
                         Id INT IDENTITY(1,1) PRIMARY KEY,
                         UserId INT NOT NULL,
                         AccessWeb BIT NOT NULL DEFAULT 1,
                         AccessApp BIT NOT NULL DEFAULT 1,
                         LastUpdated DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                         -- FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
                     );");
                     Console.WriteLine("[DEBUG] UserAccessConfigs creation logic finished.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[WARNING] Failed to ensure UserAccessConfigs table: {ex.Message} - {ex.InnerException?.Message}");
                    // app.Logger.LogError(ex, "Failed to create table");
                }

                // Ensure Roles exist
                var adminRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRole == null)
                {
                    adminRole = new OperationWeb.DataAccess.Entities.Role { Name = "Admin", Description = "Administrador" };
                    await db.Roles.AddAsync(adminRole);
                    await db.SaveChangesAsync();
                }

                var userRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Usuario");
                if (userRole == null)
                {
                    userRole = new OperationWeb.DataAccess.Entities.Role { Name = "Usuario", Description = "Usuario estándar" };
                    await db.Roles.AddAsync(userRole);
                    await db.SaveChangesAsync();
                }

                async Task<int> EnsureUserAsync(string dni, string email)
                {
                    try
                    {
                        var existing = await db.Users.FirstOrDefaultAsync(u => u.DNI == dni);
                        if (existing != null) 
                        {
                            if (string.IsNullOrEmpty(existing.Role))
                            {
                                existing.Role = "USER";
                                await db.SaveChangesAsync();
                            }
                            return existing.Id;
                        }
                        var hash = BCrypt.Net.BCrypt.HashPassword("Prueba123");
                        var u = new OperationWeb.DataAccess.Entities.User
                        {
                            DNI = dni,
                            PasswordHash = hash,
                            Email = email,
                            Role = "USER",
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        await db.Users.AddAsync(u);
                        await db.SaveChangesAsync();
                        return u.Id;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error creating user {dni}: {ex.Message}");
                        return 0;
                    }
                }
                
                async Task EnsureUserRoleAsync(int userId, int roleId)
                {
                    if (userId == 0) return;
                    var exists = await db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
                    if (exists) return;
                    await db.UserRoles.AddAsync(new OperationWeb.DataAccess.Entities.UserRole { UserId = userId, RoleId = roleId });
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARNING] Database initialization failed: {ex.Message}");
                // Swallow exception to allow app to start
            }
        }
    }
    catch (Exception ex)
    {
         Console.WriteLine($"Critical error in background startup logic: {ex.Message}");
    }
});

app.Logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
app.Logger.LogInformation("DB provider: {Provider}", useSql ? "SqlServer" : "InMemory");
app.Logger.LogInformation("Listening on: {Urls}", builder.Configuration["Urls"] ?? "http://localhost:5132");

app.Run();

public partial class Program { }
