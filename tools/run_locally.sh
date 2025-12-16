#!/bin/bash
cd "$(dirname "$0")/.."

echo "🚀 Building Docker image locally..."
docker build -t operation-web-local .

echo "✅ Build Complete."
echo "🚀 Running container on http://localhost:8080 ..."
echo "⚠️  HARD FORCING PORT 80. Press Ctrl+C to stop."

# Running as a single line to avoid syntax errors
docker run --rm -p 8080:80 -e 'Urls=http://+:80' -e 'ASPNETCORE_URLS=http://+:80' -e 'DOTNET_URLS=http://+:80' -e 'DefaultConnection=Server=tcp:operationweb-sql-server.database.windows.net,1433;Initial Catalog=OperationWebDB;Persist Security Info=False;User ID=sqladmin;Password=ChangeThisStrongPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;' operation-web-local
