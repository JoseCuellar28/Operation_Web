using Microsoft.EntityFrameworkCore;
using OperationWeb.DataAccess;
using OperationWeb.DataAccess.Interfaces;
using OperationWeb.Business.Interfaces;
using OperationWeb.Business;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure Entity Framework
builder.Services.AddDbContext<OperationWebDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
