#!/bin/bash
set -e

# Navbar color for outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

STORAGE_NAME="operationwebfront$(date +%s)" # Unique name
RG_NAME="OperationWeb-RG"

echo -e "${GREEN}🚀 STARTING FRONTEND DEPLOYMENT (Manual Mode)${NC}"
echo "--------------------------------------------"
echo -e "${GREEN}🔍 Finding Storage Account created by Terraform...${NC}"

# Find account starting with "opwebfront" in the Resource Group
STORAGE_NAME=$(az storage account list -g $RG_NAME --query "[?starts_with(name, 'opwebfront')].name" -o tsv)

if [ -z "$STORAGE_NAME" ]; then
    echo -e "${RED}❌ No Storage Account found! Did you run 'terraform apply'?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Account: $STORAGE_NAME${NC}"

# 2. Enable Static Website (Idempotent - ensures it's on)
echo -e "${GREEN}🌍 Ensuring Static Website is enabled...${NC}"
az storage blob service-properties update \
    --account-name $STORAGE_NAME \
    --static-website \
    --404-document index.html \
    --index-document index.html

# 3. Upload Content
echo -e "${GREEN}📤 Uploading Files...${NC}"
az storage blob upload-batch \
    -d '$web' \
    -s frontend/Modelo_Funcional \
    --account-name $STORAGE_NAME

# 4. Get URL
URL=$(az storage account show -n $STORAGE_NAME -g $RG_NAME --query "primaryEndpoints.web" --output tsv)

echo "--------------------------------------------"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESS!${NC}"
echo "Your Hacking Playground is live at:"
echo "$URL"
echo "--------------------------------------------"
