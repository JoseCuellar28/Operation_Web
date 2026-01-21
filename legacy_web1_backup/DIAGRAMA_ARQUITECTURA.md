# Diagrama de Arquitectura: Operation Web

Copia y pega este código en cualquier visor de Markdown compatible con Mermaid (como GitHub) o usa [Mermaid Live Editor](https://mermaid.live).

```mermaid
graph TD
    %% --- Estilos ---
    classDef azure fill:#0078d4,color:white,stroke:#004387,stroke-width:2px;
    classDef client fill:#333,color:white,stroke:black,stroke-width:2px;
    classDef devops fill:#ea4c89,color:white,stroke:#b22c5e,stroke-width:2px;

    %% --- Nodos ---
    subgraph Client_Side [Cliente]
        Browser[👤 Navegador Web / Móvil]:::client
    end

    subgraph Azure_Cloud [☁️ Microsoft Azure Environment]
        style Azure_Cloud fill:#f4f9fd,stroke:#0078d4,stroke-dasharray: 5 5

        subgraph Frontier [Capa Frontend (Static)]
            Storage[📦 Azure Storage Account<br/>Static Website ($web)]:::azure
            JS[Pages: .js / .html]
        end

        subgraph Backend [Capa Backend (Compute)]
            AppPlan[🏗️ App Service Plan<br/>(Linux B1/F1)]:::azure
            WebApp[🚀 Azure Web App<br/>(.NET 8 Docker Container)]:::azure
        end

        subgraph Persistence [Capa de Datos]
            SQL[🗄️ Azure SQL Database<br/>(PaaS)]:::azure
            Firewall[🛡️ Azure SQL Firewall]:::azure
        end
    end

    subgraph DevOps_Pipeline [⚙️ DevOps & CI/CD]
        GitHub[🐱 GitHub Repository]:::devops
        Actions[⚡ GitHub Actions<br/>(Build & Test)]:::devops
        GHCR[🐳 GitHub Container Registry]:::devops
    end

    %% --- Conexiones Flujo Usuario ---
    Browser -->|1. HTTPS Request (Frontend)| Storage
    Storage -->|2. Return HTML/JS| Browser
    Browser -->|3. API Calls (JSON/REST)| WebApp
    WebApp -->|4. Query (EF Core)| Firewall
    Firewall -->|5. Allow Internal Azure IP| SQL

    %% --- Conexiones Flujo Despliegue ---
    GitHub -->|Push Main| Actions
    Actions -->|docker push| GHCR
    GHCR -.->|docker pull (Deployment)| WebApp
```
