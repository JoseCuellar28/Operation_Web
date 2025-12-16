#!/bin/bash
set -e

# Navbar color for outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 STARTING CLEAN SLATE REDEPLOYMENT${NC}"
echo "--------------------------------------------"
echo "1. Checking if Terraform is installed..."

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not found in PATH.${NC}"
    echo "Trying common locations..."
    if [ -f "/opt/homebrew/bin/terraform" ]; then
        ALIAS_TF="/opt/homebrew/bin/terraform"
    elif [ -f "/usr/local/bin/terraform" ]; then
        ALIAS_TF="/usr/local/bin/terraform"
    else
        echo -e "${RED}❌ Could not find Terraform. Please install it or check your path.${NC}"
        exit 1
    fi
else
    ALIAS_TF="terraform"
fi

echo -e "${GREEN}✅ Found Terraform at: $ALIAS_TF${NC}"

# Navigate to Infrastructure
cd "$(dirname "$0")/../infrastructure/terraform"

echo "--------------------------------------------"
echo -e "${RED}⚠️  WARNING: THIS WILL DELETE ALL AZURE RESOURCES AND DATA! ⚠️${NC}"
echo "Use Ctrl+C to cancel within 5 seconds..."
sleep 5
echo "Proceeding..."

echo "--------------------------------------------"
echo -e "${GREEN}🔥 PHASE 1: DESTRUCTION (The Purge)${NC}"
$ALIAS_TF destroy -auto-approve

echo "--------------------------------------------"
echo -e "${GREEN}✨ PHASE 2: REBIRTH (Deployment)${NC}"
$ALIAS_TF apply -auto-approve

echo "--------------------------------------------"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "Your infrastructure has been recreated with B1 Plan and Always On."
echo "The App Service will now start and AUTOMATICALLY create the database."
echo "--------------------------------------------"
echo "Next steps:"
echo "1. Wait 2-3 minutes for the container to start."
echo "2. Check https://operationweb-api.azurewebsites.net/health"
