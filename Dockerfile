# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore
# Copy csproj and restore
COPY OperationWeb.API/*.csproj ./OperationWeb.API/
COPY OperationWeb.Business/*.csproj ./OperationWeb.Business/

COPY OperationWeb.Business.Interfaces/*.csproj ./OperationWeb.Business.Interfaces/
COPY OperationWeb.DataAccess/*.csproj ./OperationWeb.DataAccess/
COPY OperationWeb.DataAccess.Entities/*.csproj ./OperationWeb.DataAccess.Entities/
COPY OperationWeb.DataAccess.Interfaces/*.csproj ./OperationWeb.DataAccess.Interfaces/

COPY OperationWeb.Tests/*.csproj ./OperationWeb.Tests/

# Restore all projects to ensure graph is complete
RUN dotnet restore ./OperationWeb.API/OperationWeb.API.csproj

# Copy everything else and build
COPY . .
RUN dotnet publish ./OperationWeb.API/OperationWeb.API.csproj -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port
# Expose port 80 (Standard for Web Apps)
EXPOSE 80
ENV ASPNETCORE_HTTP_PORTS=80

ENTRYPOINT ["dotnet", "OperationWeb.API.dll"]
