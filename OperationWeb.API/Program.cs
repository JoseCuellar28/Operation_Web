using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Interfaces;
using OperationWeb.Business.Interfaces;
using OperationWeb.Business;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

// Configure Entity Framework
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<OperationWebDbContext>(options =>
        options.UseInMemoryDatabase("DevOperationWeb"));
}
else
{
    builder.Services.AddDbContext<OperationWebDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// Register repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICuadrillaRepository, CuadrillaRepository>();
builder.Services.AddScoped<IColaboradorRepository, ColaboradorRepository>();
builder.Services.AddScoped<OperationWeb.DataAccess.Repositories.IEmpleadoRepository, OperationWeb.DataAccess.Repositories.EmpleadoRepository>();

// Register services
builder.Services.AddScoped<ICuadrillaService, CuadrillaService>();
builder.Services.AddScoped<IColaboradorService, ColaboradorService>();
builder.Services.AddScoped<OperationWeb.Business.Services.IEmpleadoService, OperationWeb.Business.Services.EmpleadoService>();

// Add CORS
var corsSection = builder.Configuration.GetSection("Cors");
var allowedOrigins = corsSection.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:8000" };
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
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseRateLimiter();
app.UseCors("DevFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OperationWebDbContext>();
    await db.Database.EnsureCreatedAsync();

    if (!await db.Roles.AnyAsync())
    {
        await db.Roles.AddRangeAsync(
            new OperationWeb.DataAccess.Entities.Role { Name = "Admin", Description = "Administrador" },
            new OperationWeb.DataAccess.Entities.Role { Name = "Usuario", Description = "Usuario estándar" }
        );
        await db.SaveChangesAsync();
    }

    var adminRole = await db.Roles.FirstAsync(r => r.Name == "Admin");
    var userRole = await db.Roles.FirstAsync(r => r.Name == "Usuario");

    async Task<int> EnsureUserAsync(string username, string email, string fullName, string? company)
    {
        var existing = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (existing != null) return existing.Id;
        var hash = BCrypt.Net.BCrypt.HashPassword("Prueba123");
        var u = new OperationWeb.DataAccess.Entities.User
        {
            Username = username,
            PasswordHash = hash,
            Email = email,
            FullName = fullName,
            Company = company,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await db.Users.AddAsync(u);
        await db.SaveChangesAsync();
        return u.Id;
    }

    var joseId = await EnsureUserAsync("jose.arbildo", "jose.arbildo@example.local", "Jose Arbildo Cuellar", "Ferreyros");
    var edwardId = await EnsureUserAsync("edward.vega", "edward.vega@example.local", "Edward Vega Vergara", "Siderperu");
    var ederId = await EnsureUserAsync("eder.torres", "eder.torres@example.local", "Eder Torres Gonzales", "V&V");

    async Task EnsureUserRoleAsync(int userId, int roleId)
    {
        var exists = await db.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
        if (exists) return;
        await db.UserRoles.AddAsync(new OperationWeb.DataAccess.Entities.UserRole { UserId = userId, RoleId = roleId });
        await db.SaveChangesAsync();
    }

    await EnsureUserRoleAsync(joseId, adminRole.Id);
    await EnsureUserRoleAsync(edwardId, userRole.Id);
    await EnsureUserRoleAsync(ederId, userRole.Id);
}

app.Run();
