#!/bin/bash
set -e

# Navbar color for outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 STARTING MANUAL FRONTEND DEPLOYMENT${NC}"
echo "--------------------------------------------"

# 1. Get API Config (Dynamic)
echo "🔍 Getting Azure API URL from Terraform..."
cd infrastructure/terraform
API_URL=$(terraform output -raw api_url 2>/dev/null || echo "")
cd ../../

if [ -z "$API_URL" ]; then
    echo -e "${RED}⚠️  Terraform output missing. Using detected Live Infrastructure...${NC}"
    # Fallback to the live API from the screenshot
    API_URL="https://operationweb-api-583a48e0.azurewebsites.net"
fi

if [ -z "$API_URL" ]; then
    echo -e "${RED}❌ Could not determine API URL.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using Dynamic API: $API_URL${NC}"

# 2. INJECT URL INTO FILES (Universal Patch)
echo "--------------------------------------------"
echo "🔥 Injecting API URL into ALL frontend code..."

# Define the strings we want to replace
OLD_AZURE="https://operationweb-api-815a0eaa.azurewebsites.net"
OLD_LOCAL="http://localhost:5132"

# Find all JS and HTML files and replace both strings
# We use find to be comprehensive
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i.bak "s|$OLD_AZURE|$API_URL|g"
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i.bak "s|$OLD_LOCAL|$API_URL|g"

# Cleanup backup files
find frontend/Modelo_Funcional -name "*.bak" -delete

echo "✅ All files patched with $API_URL"

# 2b. GENERATE CONFIG.JS (As backup)
echo "⚙️  Generating config.js..."
CONFIG_PATH="frontend/Modelo_Funcional/config.js"

cat > $CONFIG_PATH <<EOF
window.APP_CONFIG = {
    API_URL: '$API_URL'
};
console.log('✅ Azure Production Configuration Loaded (Auto-Generated)');
EOF

echo -e "${GREEN}✅ Generated $CONFIG_PATH${NC}"
cat $CONFIG_PATH

# 3. UPLOAD TO AZURE STORAGE
echo "--------------------------------------------"
echo "☁️  Uploading to Azure Storage..."

# Navigate to Terraform to get outputs
cd infrastructure/terraform

# Try to get outputs from Terraform
SA_NAME=$(terraform output -raw storage_account_name 2>/dev/null || echo "")
SA_KEY=$(terraform output -raw storage_account_key 2>/dev/null || echo "")

# FALLBACK: If Terraform fails, use the EXISTING infrastructure (from Screenshot)
if [ -z "$SA_NAME" ]; then
    echo -e "${RED}⚠️  Terraform local state not found. Switching to Smart Discovery...${NC}"
    
    # Authenticated Fallback (Targeting the 583a48e0 deployment)
    SA_NAME="opwebfront583a48e0"
    RG_NAME="OperationWeb-RG"
    
    echo "🔍 Fetching keys for existing storage: $SA_NAME..."
    SA_KEY=$(az storage account keys list -g $RG_NAME -n $SA_NAME --query "[0].value" -o tsv)
    
    if [ -z "$SA_KEY" ]; then
        echo -e "${RED}❌ Failed to get Storage Key. Are you logged in to az?${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Recovered Access to: $SA_NAME${NC}"
fi

if [ -z "$SA_NAME" ] || [ -z "$SA_KEY" ]; then
    echo -e "${RED}❌ Could not determine Storage Account. Deployment aborted.${NC}"
    exit 1
fi

echo "Target: $SA_NAME"

# Switch back to root
cd ../../

# Upload everything in Modelo_Funcional
# We use 'az storage blob upload-batch'
# 3. UPLOAD TO AZURE STORAGE (Fresh Container)
echo "--------------------------------------------"
echo "☁️  Uploading files to NEW Azure Storage..."
az storage blob upload-batch \
    --account-name $SA_NAME \
    --account-key $SA_KEY \
    --destination "\$web" \
    --source "frontend/Modelo_Funcional"

echo "--------------------------------------------"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESS!${NC}"
FRONTEND_URL=$(cd infrastructure/terraform && terraform output -raw frontend_url)
echo "Your Operation Smart Platform is live at:"
echo "$FRONTEND_URL"
echo "--------------------------------------------"
