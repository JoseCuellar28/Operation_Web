#!/bin/bash
set -e

# Navbar color for outputs
GREEN='\033[0;32m'
NC='\033[0m' # No Color

STORAGE_NAME="operationwebfront$(date +%s)" # Unique name
RG_NAME="OperationWeb-RG"

echo -e "${GREEN}🚀 STARTING FRONTEND DEPLOYMENT (Manual Mode)${NC}"
echo "--------------------------------------------"
echo "Creating Storage Account: $STORAGE_NAME"

# 1. Create Storage Account
az storage account create \
    --name $STORAGE_NAME \
    --resource-group $RG_NAME \
    --location westus2 \
    --sku Standard_LRS \
    --kind StorageV2

# 2. Enable Static Website
echo -e "${GREEN}🌍 Enabling Static Website...${NC}"
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
