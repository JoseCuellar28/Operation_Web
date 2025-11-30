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
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(builder.Configuration["Urls"] ?? "http://localhost:5132");

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

try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<OperationWebDbContext>();
        await db.Database.EnsureCreatedAsync();

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
                    // Ensure Role is set (fix for existing users with null/empty role)
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
                    Role = "USER", // Default role for seeding
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await db.Users.AddAsync(u);
                await db.SaveChangesAsync();
                return u.Id;
            }
            catch (Exception ex)
            {
                app.Logger.LogError(ex, "Error creating user {DNI}", dni);
                throw;
            }
        }

        var joseId = await EnsureUserAsync("10103488", "jose.arbildo@example.local");
        // var edwardId = await EnsureUserAsync("87654321", "edward.vega@example.local"); // Commented out as they might not exist
        // var ederId = await EnsureUserAsync("11223344", "eder.torres@example.local");

        async Task EnsureUserRoleAsync(int userId, int roleId)
        {
            var exists = await db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
            if (exists) return;
            await db.UserRoles.AddAsync(new OperationWeb.DataAccess.Entities.UserRole { UserId = userId, RoleId = roleId });
            await db.SaveChangesAsync();
        }

        await EnsureUserRoleAsync(joseId, adminRole.Id);
        // Update Jose to be Admin in Role column too
        var jose = await db.Users.FindAsync(joseId);
        if (jose != null) { jose.Role = "ADMIN"; await db.SaveChangesAsync(); }
        // await EnsureUserRoleAsync(edwardId, userRole.Id);
        // await EnsureUserRoleAsync(ederId, userRole.Id);
    }
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Error inicializando la base de datos");
}

app.Logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
app.Logger.LogInformation("DB provider: {Provider}", useSql ? "SqlServer" : "InMemory");
app.Logger.LogInformation("Listening on: {Urls}", builder.Configuration["Urls"] ?? "http://localhost:5132");

app.Run();

public partial class Program { }
