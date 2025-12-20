#!/bin/bash
set -e

# --- COLORS ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 STARTING QUICK CODE DEPLOY (PRESERVING DB)${NC}"
echo "--------------------------------------------------------"

# 1. FIND RESOURCES
echo -e "${BLUE}🔍 Locating App Service...${NC}"
APP_NAME=$(az webapp list --query "[?contains(name, 'opwebapi')].name" -o tsv | head -n 1)
RG_NAME=$(az webapp list --query "[?name=='$APP_NAME'].resourceGroup" -o tsv)

if [ -z "$APP_NAME" ]; then
    echo "❌ No App Service found!"
    exit 1
fi

echo "   App: $APP_NAME"
echo "   RG:  $RG_NAME"

# 2. BUILD
echo -e "${BLUE}🔨 Building Backend (.NET 8.0)...${NC}"
rm -rf publish_output
dotnet publish OperationWeb.API/OperationWeb.API.csproj -c Release -o ./publish_output

echo -e "${BLUE}📦 Zipping...${NC}"
cd publish_output
zip -r ../backend_deploy.zip .
cd ..

# 3. GET CREDENTIALS & DEPLOY
echo -e "${BLUE}🔑 Fetching Credentials...${NC}"
CREDS=$(az webapp deployment list-publishing-credentials -n $APP_NAME -g $RG_NAME --query "[publishingUserName, publishingPassword]" -o tsv)
PUB_USER=$(echo $CREDS | awk '{print $1}')
PUB_PASS=$(echo $CREDS | awk '{print $2}')

echo -e "${BLUE}📤 Uploading to Azure (CURL)...${NC}"
curl -X POST -u "$PUB_USER:$PUB_PASS" --data-binary @"backend_deploy.zip" "https://${APP_NAME}.scm.azurewebsites.net/api/zipdeploy" --fail

echo "--------------------------------------------------------"
echo -e "${GREEN}✅ CODE UPDATED SUCCESSFULLY!${NC}"
echo "--------------------------------------------------------"
echo "Wait 15 seconds and try the URL again."
