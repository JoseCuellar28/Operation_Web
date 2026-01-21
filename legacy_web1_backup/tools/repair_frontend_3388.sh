#!/bin/bash
set -e

# --- COLORS ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚑 STARTING FRONTEND REPAIR FOR DEPLOYMENT 3388${NC}"
echo "--------------------------------------------------------"

# 1. IDENTIFY RESOURCES
# We know the ID is 3388 based on the context, but let's be safe or just hardcode it for speed.
BACKEND_URL="https://opwebapi3388.azurewebsites.net"
FRONTEND_STORAGE="opwebfront3388"

echo -e "${BLUE}🎯 Target Backend: $BACKEND_URL${NC}"
echo -e "${BLUE}🎯 Target Storage: $FRONTEND_STORAGE${NC}"

# 2. CREATE CONFIG.JS
echo -e "${BLUE}⚙️  Generating config.js...${NC}"
echo "window.APP_CONFIG = { API_URL: '$BACKEND_URL' };" > frontend/Modelo_Funcional/config.js

# 3. PATCH JAVASCRIPT FILES (Force update hardcoded fallbacks)
echo -e "${BLUE}🩹 Patching JS files...${NC}"

# Replace any old Azure URL with the new one in all files
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i "s|https://opwebapi[0-9]*.azurewebsites.net|$BACKEND_URL|g"

# Also ensure localhost is replaced just in case
find frontend/Modelo_Funcional -type f \( -name "*.js" -o -name "*.html" \) -print0 | xargs -0 sed -i "s|http://localhost:5132|$BACKEND_URL|g"

# 4. UPLOAD TO STORAGE
echo -e "${BLUE}⬆️  Uploading Corrected Frontend to Azure...${NC}"
# We ignore the error if the container explicitly exists, the command handles overwrite
az storage blob upload-batch --account-name $FRONTEND_STORAGE --destination "\$web" --source "frontend/Modelo_Funcional" --overwrite

echo "--------------------------------------------------------"
echo -e "${GREEN}✅ FRONTEND REPAIRED!${NC}"
echo "--------------------------------------------------------"
echo "Instructions for User:"
echo "1. Clear Browser Cache (Ctrl + Shift + R)"
echo "2. Login again."
