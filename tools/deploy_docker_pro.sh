#!/bin/bash
set -e

# --- COLORS ---
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 STARTING 'DEPLOY PRO' - TRUE DOCKER DEPLOYMENT${NC}"
echo "--------------------------------------------------------"
echo "This script deploys the production architecture using the"
echo "Docker Image directly from GitHub Container Registry."
echo "--------------------------------------------------------"

# --- CREDENTIALS INPUT ---
echo -e "${YELLOW}🔑 GITHUB REGISTRY CREDENTIALS REQUIRED${NC}"
echo "Azure needs permission to pull the image from ghcr.io."
echo "If your package is public, you can leave PASSWORD blank."
echo "--------------------------------------------------------"
read -p "GitHub Username: " DOCKER_USER
read -s -p "GitHub PAT (Personal Access Token): " DOCKER_PASS
echo ""
echo "--------------------------------------------------------"

# --- VARIABLES ---
RG_NAME="OperationWeb-PRO-RG"  # Distinct RG name to avoid conflict/confusion
LOCATION="centralus"
SUFFIX=$((RANDOM % 9000 + 1000))
SQL_SERVER="opwebsqlpro${SUFFIX}"
DB_NAME="OperationWebDB"
APP_NAME="opwebapipro${SUFFIX}"
SA_NAME="opwebfrontpro${SUFFIX}"
ADMIN_USER="sqladmin"
ADMIN_PASS="ChangeThisStrongPassword123!"
IMAGE_NAME="ghcr.io/josecuellar28/operationweb-api:latest"

echo -e "${BLUE}ℹ️  Config:${NC}"
echo "   RG: $RG_NAME"
echo "   SQL: $SQL_SERVER"
echo "   App: $APP_NAME (Docker)"
echo "   Image: $IMAGE_NAME"
echo "--------------------------------------------------------"

# 1. RESOURCE GROUP
echo -e "${BLUE}🏗️  Creating Resource Group...${NC}"
az group create --name $RG_NAME --location $LOCATION --output none

# 2. SQL SERVER & DB
echo -e "${BLUE}🗄️  Creating Database Server ($SQL_SERVER)...${NC}"
az sql server create --name $SQL_SERVER --resource-group $RG_NAME --location $LOCATION \
    --admin-user $ADMIN_USER --admin-password $ADMIN_PASS --output none

echo -e "${BLUE}🔥 Opening SQL Firewall (Allow Azure Resources)...${NC}"
az sql server firewall-rule create --resource-group $RG_NAME --server $SQL_SERVER \
    --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 --output none

echo -e "${BLUE}💾 Creating Database ($DB_NAME)...${NC}"
az sql db create --resource-group $RG_NAME --server $SQL_SERVER --name $DB_NAME \
    --service-objective Basic --output none

# 2.5. SEED DATABASE (AUTOMATION)
echo -e "${BLUE}🌱 Attempting to Auto-Seed Database...${NC}"
if [ -f "final_repair_script.sql" ]; then
    if sqlcmd -S tcp:${SQL_SERVER}.database.windows.net,1433 -d $DB_NAME -U $ADMIN_USER -P $ADMIN_PASS -i "final_repair_script.sql" -I > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database Schema & Data Injected Successfully!${NC}"
    else
        echo -e "${RED}⚠️  Auto-Seed Failed (Firewall/Tool Missing).${NC}"
        echo -e "${RED}👉 Run 'final_repair_script.sql' manually in Portal.${NC}"
    fi
else
    echo -e "${RED}⚠️  'final_repair_script.sql' not found.${NC}"
fi

# 3. STORAGE (FRONTEND)
echo -e "${BLUE}📦 Creating Storage Account ($SA_NAME)...${NC}"
az storage account create --name $SA_NAME --resource-group $RG_NAME --location $LOCATION \
    --sku Standard_LRS --kind StorageV2 --allow-blob-public-access true --output none
az storage blob service-properties update --account-name $SA_NAME --static-website \
    --404-document 404.html --index-document index.html --output none

FRONTEND_URL=$(az storage account show -n $SA_NAME -g $RG_NAME --query "primaryEndpoints.web" -o tsv)
FRONTEND_URL=${FRONTEND_URL%/}

# 4. APP SERVICE (DOCKER)
echo -e "${BLUE}☁️  Creating App Service Plan (Linux/Container)...${NC}"
PLAN_NAME="OperationWebPlanPro"
az appservice plan create --name $PLAN_NAME --resource-group $RG_NAME --sku B1 --is-linux --output none

echo -e "${BLUE}🚀 Creating Web App Container ($APP_NAME)...${NC}"
# Logic: Create with Container, configuring Registry Auth
if [ -z "$DOCKER_PASS" ]; then
    # Public Access
    az webapp create --resource-group $RG_NAME --plan $PLAN_NAME --name $APP_NAME \
        --deployment-container-image-name $IMAGE_NAME --output none
else
    # Private Access (Authenticated)
    az webapp create --resource-group $RG_NAME --plan $PLAN_NAME --name $APP_NAME \
        --deployment-container-image-name $IMAGE_NAME \
        --docker-registry-server-url "https://ghcr.io" \
        --docker-registry-server-user "$DOCKER_USER" \
        --docker-registry-server-password "$DOCKER_PASS" --output none
fi

# Construct Connection String
CONN_STR="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Initial Catalog=${DB_NAME};Persist Security Info=False;User ID=${ADMIN_USER};Password=${ADMIN_PASS};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

echo -e "${BLUE}⚙️  Configuring App Settings...${NC}"
az webapp config appsettings set --resource-group $RG_NAME --name $APP_NAME --settings \
    "DefaultConnection=$CONN_STR" \
    "ASPNETCORE_ENVIRONMENT=Production" \
    "WEBSITES_PORT=80" \
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false" --output none

# 5. FRONTEND PATCH & UPLOAD
echo -e "${BLUE}🩹 Patching & Uploading Frontend...${NC}"
API_URL="https://${APP_NAME}.azurewebsites.net"
OLD_AZURE="https://operationweb-api-815a0eaa.azurewebsites.net"
OLD_LOCAL="http://localhost:5132"

find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i.bak "s|$OLD_AZURE|$API_URL|g"
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i.bak "s|$OLD_LOCAL|$API_URL|g"
find frontend/Modelo_Funcional -name "*.bak" -delete
echo "window.APP_CONFIG = { API_URL: '$API_URL' };" > frontend/Modelo_Funcional/config.js

az storage blob upload-batch --account-name $SA_NAME --destination "\$web" --source "frontend/Modelo_Funcional" --overwrite --output none

echo "--------------------------------------------------------"
echo -e "${GREEN}✅✅✅ DEPLOYMENT 'PRO' COMPLETE! ✅✅✅${NC}"
echo "--------------------------------------------------------"
echo -e "🌍 FRONTEND:  $FRONTEND_URL"
echo -e "🔌 BACKEND:   $API_URL"
echo -e "🐳 IMAGE:     $IMAGE_NAME"
echo "--------------------------------------------------------"
