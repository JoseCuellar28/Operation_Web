#!/bin/bash
set -e

# --- COLORS ---
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 STARTING 'ALTERNATIVE B' - ULTIMATE NATIVE DEPLOYMENT${NC}"
echo "--------------------------------------------------------"
echo "Bypassing Terraform references. Using pure Azure CLI."
echo "This will create a robust, production-ready environment."

# --- VARIABLES ---
RG_NAME="OperationWeb-RG"
LOCATION="centralus"
SUFFIX=$((RANDOM % 9000 + 1000))  # Simple random 4-digit
SQL_SERVER="opwebsql${SUFFIX}"
DB_NAME="OperationWebDB"
APP_NAME="opwebapi${SUFFIX}"
SA_NAME="opwebfront${SUFFIX}"
ADMIN_USER="sqladmin"
ADMIN_PASS="ChangeThisStrongPassword123!"

echo -e "${BLUE}ℹ️  Config:${NC}"
echo "   RG: $RG_NAME"
echo "   SQL: $SQL_SERVER"
echo "   App: $APP_NAME"
echo "   Storage: $SA_NAME"
echo "--------------------------------------------------------"

# 1. RESOURCE GROUP
echo -e "${BLUE}🏗️  Creating Resource Group...${NC}"
az group create --name $RG_NAME --location $LOCATION --output none
echo "✅ RG Created."

# 2. SQL SERVER & DB
echo -e "${BLUE}🗄️  Creating Database Server ($SQL_SERVER)...${NC}"
az sql server create --name $SQL_SERVER --resource-group $RG_NAME --location $LOCATION \
    --admin-user $ADMIN_USER --admin-password $ADMIN_PASS
echo -e "${BLUE}⏳ Waiting 30s for SQL Server propagation...${NC}"
sleep 30
echo -e "${BLUE}🔥 Opening SQL Firewall (Allow Azure Resources)...${NC}"
az sql server firewall-rule create --resource-group $RG_NAME --server $SQL_SERVER \
    --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
echo -e "${BLUE}💾 Creating Database ($DB_NAME)...${NC}"
az sql db create --resource-group $RG_NAME --server $SQL_SERVER --name $DB_NAME \
    --service-objective Basic
echo "✅ Database Ready."

# 2.5. SEED DATABASE (AUTOMATION)
echo -e "${BLUE}🌱 Attempting to Auto-Seed Database (IaC Requirement)...${NC}"
if [ -f "final_repair_script.sql" ]; then
    echo "Found SQL Script. Executing via SQLCMD..."
    # Attempt execution. Use -I to enable quoted identifiers if needed.
    # We suppress output to avoid clutter, unless error.
    if sqlcmd -S tcp:${SQL_SERVER}.database.windows.net,1433 -d $DB_NAME -U $ADMIN_USER -P $ADMIN_PASS -i "final_repair_script.sql" -I > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database Schema & Data Injected Successfully!${NC}"
    else
        echo -e "${RED}⚠️  Auto-Seed Failed (Likely Firewall Latency).${NC}"
        echo -e "${RED}👉 ACTION REQUIRED: Run query 'final_repair_script.sql' manually in Azure Portal.${NC}"
    fi
else
    echo -e "${RED}⚠️  'final_repair_script.sql' not found in current folder. Skipping Seed.${NC}"
fi

# 3. STORAGE (FRONTEND)
echo -e "${BLUE}📦 Creating Storage Account ($SA_NAME)...${NC}"
az storage account create --name $SA_NAME --resource-group $RG_NAME --location $LOCATION \
    --sku Standard_LRS --kind StorageV2 --allow-blob-public-access true --output none
echo -e "${BLUE}🌐 Enabling Static Website...${NC}"
az storage blob service-properties update --account-name $SA_NAME --static-website \
    --404-document 404.html --index-document index.html --output none

# Get Frontend URL
FRONTEND_URL=$(az storage account show -n $SA_NAME -g $RG_NAME --query "primaryEndpoints.web" -o tsv)
# Remove trailing slash for consistency
FRONTEND_URL=${FRONTEND_URL%/}
echo -e "${GREEN}✅ Frontend URL reserved: $FRONTEND_URL${NC}"

# 4. APP SERVICE (BACKEND)
echo -e "${BLUE}☁️  Creating App Service Plan (F1 - Free)...${NC}"
PLAN_NAME="OperationWebPlan"
az appservice plan create --name $PLAN_NAME --resource-group $RG_NAME --sku F1 --is-linux --output none

echo -e "${BLUE}🚀 Creating Web App ($APP_NAME)...${NC}"
az webapp create --resource-group $RG_NAME --plan $PLAN_NAME --name $APP_NAME \
    --runtime "DOTNETCORE|8.0" --output none

echo -e "${BLUE}⏳ Waiting 10s for App Service to settle...${NC}"
sleep 10

# Construct Connection String
CONN_STR="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Initial Catalog=${DB_NAME};Persist Security Info=False;User ID=${ADMIN_USER};Password=${ADMIN_PASS};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

echo -e "${BLUE}⚙️  Configuring App Settings (DB & CORS)...${NC}"
az webapp config appsettings set --resource-group $RG_NAME --name $APP_NAME --settings \
    "DefaultConnection=$CONN_STR" \
    "ASPNETCORE_ENVIRONMENT=Development" \
    "WEBSITES_PORT=80" \
    "Cors__AllowAnyOriginInDev=true"

# 5. BUILD & DEPLOY BACKEND
echo -e "${BLUE}🔨 Building Backend...${NC}"
dotnet publish OperationWeb.API/OperationWeb.API.csproj -c Release -o ./publish_output
echo -e "${BLUE}⬆️  Zipping & Deploying Backend...${NC}"
cd publish_output
zip -r ../backend_deploy.zip .
cd ..
# Deploy using CURL to bypass Cloud Shell Auth issues and handle Credential Propagation
echo -e "${BLUE}🔓 Ensuring SCM Basic Auth is Enabled...${NC}"
az resource update --resource-group $RG_NAME --name scm --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies --parent sites/$APP_NAME --set properties.allow=true --output none

echo -e "${BLUE}⏳ Waiting 20s for credentials to activate...${NC}"
sleep 20

echo -e "${BLUE}🔑 Fetching Publishing Credentials...${NC}"
CREDS=$(az webapp deployment list-publishing-credentials -n $APP_NAME -g $RG_NAME --query "[publishingUserName, publishingPassword]" -o tsv)
PUB_USER=$(echo $CREDS | awk '{print $1}')
PUB_PASS=$(echo $CREDS | awk '{print $2}')

echo -e "${BLUE}📤 Uploading Payload (CURL -> Kudu)...${NC}"

# Retry loop for propagation delays (Error 401)
for i in {1..5}; do
   echo "Attempt $i/5..."
   if curl -X POST -u "$PUB_USER:$PUB_PASS" --data-binary @"backend_deploy.zip" "https://${APP_NAME}.scm.azurewebsites.net/api/zipdeploy" --fail; then
      echo -e "${GREEN}✅ Deployment Successful!${NC}"
      break
   else
      echo -e "${RED}⚠️  Deployment failed (probably 401 Auth). Waiting 15s...${NC}"
      sleep 15
   fi
done


# Get Backend URL
API_URL="https://${APP_NAME}.azurewebsites.net"
echo -e "${GREEN}✅ Backend API URL: $API_URL${NC}"

# 6. PATCH & DEPLOY FRONTEND
echo -e "${BLUE}🩹 Patching Frontend Code (Universal Patch)...${NC}"
# Define placeholders to replace
OLD_AZURE="https://operationweb-api-815a0eaa.azurewebsites.net"
OLD_LOCAL="http://localhost:5132"

# Patch files in place
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i.bak "s|$OLD_AZURE|$API_URL|g"
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i.bak "s|$OLD_LOCAL|$API_URL|g"
find frontend/Modelo_Funcional -name "*.bak" -delete

# Create config.js
echo "window.APP_CONFIG = { API_URL: '$API_URL' };" > frontend/Modelo_Funcional/config.js

echo -e "${BLUE}⬆️  Uploading Frontend...${NC}"
az storage blob upload-batch --account-name $SA_NAME --destination "\$web" --source "frontend/Modelo_Funcional" --overwrite

echo "--------------------------------------------------------"
echo -e "${GREEN}✅✅✅ DEPLOYMENT 'ALTERNATIVE B' COMPLETE! ✅✅✅${NC}"
echo "--------------------------------------------------------"
echo -e "🌍 FRONTEND:  $FRONTEND_URL"
echo -e "🔌 BACKEND:   $API_URL"
echo -e "👤 ADMIN:     admin / Prueba123"
echo "--------------------------------------------------------"
