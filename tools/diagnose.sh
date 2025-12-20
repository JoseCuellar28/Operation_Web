#!/bin/bash
# Herramienta de Diagnóstico para Operation Web

echo "🔍 Iniciando Diagnóstico de Salud..."
APP_NAME=$(az webapp list --query "[?contains(name, 'opwebapi')].name" -o tsv | head -n 1)

if [ -z "$APP_NAME" ]; then
    echo "❌ No se encontró ninguna Web App (Backend). ¿Se borró el grupo de recursos?"
    exit 1
fi

echo "✅ Web App Detectada: $APP_NAME"
RG_NAME=$(az webapp list --query "[?name=='$APP_NAME'].resourceGroup" -o tsv)
echo "✅ Resource Group: $RG_NAME"

echo "---------------------------------------------------"
echo "📜 Últimos 20 Logs de Error (Docker/Application)..."
echo "---------------------------------------------------"
az webapp log tail --name $APP_NAME --resource-group $RG_NAME --lines 20

echo "---------------------------------------------------"
echo "🌐 Prueba de Conectividad (CURL local)..."
echo "---------------------------------------------------"
curl -v "https://$APP_NAME.azurewebsites.net/health"

echo "---------------------------------------------------"
echo "📋 Estado de Base de Datos (Connection Strings)..."
az webapp config connection-string list --name $APP_NAME --resource-group $RG_NAME
