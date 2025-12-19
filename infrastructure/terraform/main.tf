# Azure Provider configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "OperationWeb-RG"
  location = "West US 2"
}

# Azure SQL Server
resource "azurerm_mssql_server" "sqlserver" {
  name                         = "operationweb-sql-server"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "ChangeThisStrongPassword123!"
}

# Azure SQL Database
resource "azurerm_mssql_database" "sqldb" {
  name      = "OperationWebDB"
  server_id = azurerm_mssql_server.sqlserver.id
  sku_name  = "Basic"
}

# App Service Plan
resource "azurerm_service_plan" "appserviceplan" {
  name                = "operationweb-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# Web App for Containers (Docker)
resource "azurerm_linux_web_app" "webapp" {
  name                = "operationweb-api"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.appserviceplan.location
  service_plan_id     = azurerm_service_plan.appserviceplan.id

  site_config {
    # Using specific Docker settings for Linux App Service
    always_on = true 
    
    application_stack {
        docker_image     = "ghcr.io/josecuellar28/operationweb-api"
        docker_image_tag = "latest"
    }
  }

  app_settings = {
    "DefaultConnection" = "Server=tcp:${azurerm_mssql_server.sqlserver.fully_qualified_domain_name},1433;Initial Catalog=OperationWebDB;Persist Security Info=False;User ID=sqladmin;Password=ChangeThisStrongPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }

  # CRITICAL FIX: Wait for Firewall Rule BEFORE starting App to prevent connection errors on first boot
  depends_on = [
    azurerm_mssql_firewall_rule.allow_azure_services
  ]
}

resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sqlserver.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Frontend Hosting (Static Website)
resource "azurerm_storage_account" "frontend_storage" {
  name                     = "operationwebfrontend"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}

output "frontend_url" {
  value = azurerm_storage_account.frontend_storage.primary_web_endpoint
}
