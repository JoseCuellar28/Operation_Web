using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Xunit;
using OperationWeb.API;
using OperationWeb.Business.Interfaces;
using Moq;
using System.Threading.Tasks;

namespace OperationWeb.Tests
{
    public class AttendanceSmokeTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public AttendanceSmokeTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task CheckIn_ShouldReturn200_WhenValidRequest_WithMock()
        {
            // Arrange
            var mockService = new Mock<IAttendanceService>();
            mockService.Setup(s => s.CheckInAsync(
                It.IsAny<string>(), 
                It.IsAny<double>(), 
                It.IsAny<double>(), 
                It.IsAny<string>(), 
                It.IsAny<bool>())
            ).ReturnsAsync((true, "Asistencia registrada correctamente", "presente"));

            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    // Mock Authentication
                    services.AddAuthentication("Test")
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
                    
                    // Mock AttendanceService
                    services.AddScoped<IAttendanceService>(_ => mockService.Object);
                });
            }).CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Test");

            var request = new
            {
                latitude = -12.0,
                longitude = -77.0,
                address = "Mock Address",
                health_status = "saludable"
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/v1/attendance/checkin", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<CheckInResponse>();
            Assert.NotNull(result);
            Assert.Equal("Asistencia registrada correctamente", result.message);
            Assert.Equal("presente", result.status);
        }

        public class CheckInResponse
        {
            public string message { get; set; }
            public string status { get; set; }
        }
    }

    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(Microsoft.Extensions.Options.IOptionsMonitor<AuthenticationSchemeOptions> options, 
            Microsoft.Extensions.Logging.ILoggerFactory logger, System.Text.Encodings.Web.UrlEncoder encoder) 
            : base(options, logger, encoder) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new[] { 
                new Claim(ClaimTypes.Name, "TestUser"),
                new Claim(ClaimTypes.NameIdentifier, "41007510"), 
                new Claim("sub", "41007510") 
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
