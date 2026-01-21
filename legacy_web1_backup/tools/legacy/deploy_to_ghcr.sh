#!/bin/bash
set -e

echo "=========================================="
echo "🚀 DEPLOYING TO GHCR (MANUAL)"
echo "=========================================="

IMAGE_NAME="ghcr.io/josecuellar28/operationweb-api:latest"

# 1. Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    exit 1
fi

echo "✅ Docker found."

# 2. Login (User interaction involved if not logged in)
echo "🔑 Logging into GitHub Container Registry..."
echo "   (If prompted, use your GitHub Username and PAT)"
docker login ghcr.io

# 3. Build x64 Image (for Azure Linux App Service)
echo "🔨 Building Docker Image (amd64)..."
docker build --platform linux/amd64 -t $IMAGE_NAME -f Dockerfile .

# 4. Push
echo "⬆️ Pushing to GHCR..."
docker push $IMAGE_NAME

echo "=========================================="
echo "✅ DEPLOY SUCCESSFUL!"
echo "=========================================="
echo "👉 Now restart your Azure App Service to pull the new image."
