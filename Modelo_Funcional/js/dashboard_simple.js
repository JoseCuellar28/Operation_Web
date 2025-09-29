// Dashboard Manager Class
class DashboardManager {
    constructor() {
        this.currentPage = null;
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        console.log('[INIT] Iniciando dashboard...');
        
        // Verificar elementos críticos
        const mainContent = document.querySelector('.main-content');
        const navItems = document.querySelectorAll('.nav-item');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        console.log('[INIT] Elementos encontrados:', {
            mainContent: !!mainContent,
            navItems: navItems.length,
            sidebarToggle: !!sidebarToggle
        });
        
        this.setupEventListeners();
        this.setupNavigation();
        this.setupSidebarToggle();
        
        // Cargar página por defecto
        this.loadPage('datos-generales');
        
        console.log('[INIT] Dashboard inicializado correctamente');
    }

    setupEventListeners() {
        console.log('[EVENTS] Configurando event listeners...');
        
        // Event listeners para secciones colapsables
        const sectionHeaders = document.querySelectorAll('.nav-section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.getAttribute('data-section');
                this.toggleSection(section);
            });
        });

        console.log('[EVENTS] Event listeners configurados');
    }

    setupNavigation() {
        console.log('[NAV] Configurando navegación...');
        
        const navItems = document.querySelectorAll('.nav-item');
        console.log('[NAV] Elementos de navegación encontrados:', navItems.length);
        
        navItems.forEach(item => {
            item.classList.remove('active');
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = item.getAttribute('data-page');
                console.log('[NAV] Clic en:', pageName);
                this.loadPage(pageName);
            });
        });
        
        console.log('[NAV] Navegación configurada');
    }

    setupSidebarToggle() {
        console.log('[TOGGLE] Configurando toggle del sidebar...');
        
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                console.log('[TOGGLE] Botón toggle clickeado');
                this.toggleSidebar();
            });
        }
        
        // Restaurar estado del sidebar desde localStorage
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            this.collapseSidebar();
        }
        
        console.log('[TOGGLE] Toggle del sidebar configurado');
    }

    toggleSidebar() {
        console.log('[TOGGLE] Alternando sidebar...');
        
        if (this.sidebarCollapsed) {
            this.expandSidebar();
        } else {
            this.collapseSidebar();
        }
    }

    collapseSidebar() {
        console.log('[TOGGLE] Colapsando sidebar...');
        
        const sidebar = document.querySelector('.dashboard-sidebar');
        const toggle = document.getElementById('sidebarToggle');
        
        if (sidebar && toggle) {
            sidebar.classList.add('sidebar-collapsed');
            toggle.querySelector('i').classList.remove('fa-chevron-left');
            toggle.querySelector('i').classList.add('fa-chevron-right');
            
            this.sidebarCollapsed = true;
            localStorage.setItem('sidebarCollapsed', 'true');
            
            console.log('[TOGGLE] Sidebar colapsado');
        }
    }

    expandSidebar() {
        console.log('[TOGGLE] Expandiendo sidebar...');
        
        const sidebar = document.querySelector('.dashboard-sidebar');
        const toggle = document.getElementById('sidebarToggle');
        
        if (sidebar && toggle) {
            sidebar.classList.remove('sidebar-collapsed');
            toggle.querySelector('i').classList.remove('fa-chevron-right');
            toggle.querySelector('i').classList.add('fa-chevron-left');
            
            this.sidebarCollapsed = false;
            localStorage.setItem('sidebarCollapsed', 'false');
            
            console.log('[TOGGLE] Sidebar expandido');
        }
    }

    toggleSection(sectionName) {
        console.log('[SECTION] Alternando sección:', sectionName);
        
        const section = document.getElementById(`${sectionName}-section`);
        const header = document.querySelector(`[data-section="${sectionName}"]`);
        const icon = header.querySelector('.section-icon');
        
        if (section && header && icon) {
            const isCollapsed = section.classList.contains('collapsed');
            
            if (isCollapsed) {
                // Expandir sección
                section.classList.remove('collapsed');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                console.log('[SECTION] Sección expandida:', sectionName);
            } else {
                // Colapsar sección
                section.classList.add('collapsed');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
                console.log('[SECTION] Sección colapsada:', sectionName);
            }
        }
    }

    loadPage(pageName) {
        console.log('[PAGE] Cargando página:', pageName);
        
        // Remover clase active de todos los items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Agregar clase active al item seleccionado
        const activeItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        this.currentPage = pageName;
        this.loadPageContent(pageName);
        
        // Inicializar funcionalidad específica después de cargar el contenido
        if (pageName === 'gestion-materiales') {
            setTimeout(() => {
                inicializarMateriales();
            }, 100);
        }
        
        if (pageName === 'colaboradores') {
            setTimeout(() => {
                inicializarColaboradores();
            }, 100);
        }
        
        if (pageName === 'gestion-vehiculos') {
            setTimeout(() => {
                inicializarVehiculos();
            }, 100);
        }
        
        if (pageName === 'creacion-proyectos') {
            setTimeout(() => {
                inicializarProyectos();
            }, 100);
        }
        
        if (pageName === 'gestion-cuadrillas') {
            setTimeout(() => {
                inicializarCuadrillas();
            }, 100);
        }
        
        console.log('[PAGE] Página cargada:', pageName);
    }

    loadPageContent(pageName) {
        console.log('[CONTENT] Cargando contenido para:', pageName);

        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('[CONTENT] No se encontró main-content');
            return;
        }

        // Contenido específico para cada página
        let content = '';

        switch (pageName) {
            case 'datos-generales':
                content = this.getDatosGeneralesContent();
                break;
            case 'colaboradores':
                content = this.getColaboradoresContent();
                break;
            case 'creacion-proyectos':
                content = this.getCreacionProyectosContent();
                break;
            case 'gestion-materiales':
                content = this.getGestionMaterialesContent();
                break;
            case 'gestion-vehiculos':
                content = this.getGestionVehiculosContent();
                break;
            case 'gestion-cuadrillas':
                content = this.getGestionCuadrillasContent();
                break;
            default:
                content = this.getWelcomeContent();
        }

        mainContent.innerHTML = content;
        console.log('[CONTENT] Contenido cargado para:', pageName);
    }

    getDatosGeneralesContent() {
        return `
            <style>
                .gestion-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: white;
                    padding: 20px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin: 0;
                    overflow-x: auto;
                    position: relative;
                    min-width: 0;
                }
                
                .gestion-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .gestion-titulo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e3a8a;
                    margin: 0;
                }
                
                .gestion-upload-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                
                .gestion-file-input-wrapper {
                    position: relative;
                    overflow: hidden;
                    display: inline-block;
                }
                
                .gestion-file-input {
                    position: absolute;
                    left: -9999px;
                    opacity: 0;
                }
                
                .gestion-file-label {
                    background-color: #10b981;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.3s ease;
                    border: none;
                }
                
                .gestion-file-label:hover {
                    background-color: #059669;
                }
                
                .gestion-file-name {
                    font-size: 14px;
                    color: #6b7280;
                    font-style: italic;
                }
                
                .gestion-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .gestion-info {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                
                .gestion-buttons {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .column-indicator, .row-indicator {
                    background-color: #f3f4f6;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #374151;
                    font-weight: 500;
                    border: 1px solid #e5e7eb;
                }
                
                .column-indicator i, .row-indicator i {
                    margin-right: 5px;
                    color: #6b7280;
                }
                
                .gestion-scroll-info {
                    background-color: #dbeafe;
                    border: 1px solid #93c5fd;
                    border-radius: 6px;
                    padding: 8px 12px;
                    margin-bottom: 10px;
                    color: #1e40af;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .gestion-scroll-info i {
                    color: #3b82f6;
                }
                
                .sheet-selector {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .sheet-selector-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    font-weight: 600;
                    color: #374151;
                    font-size: 14px;
                }
                
                .sheet-selector-header i {
                    color: #6b7280;
                }
                
                .sheet-select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #374151;
                    background-color: white;
                    cursor: pointer;
                    transition: border-color 0.2s ease;
                    margin-bottom: 10px;
                }
                
                .sheet-select:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .sheet-select:hover {
                    border-color: #9ca3af;
                }
                
                .sheet-info {
                    display: flex;
                    justify-content: flex-end;
                }
                
                .sheet-count {
                    background-color: #f3f4f6;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 500;
                }
                
                .sheet-count i {
                    margin-right: 4px;
                    color: #9ca3af;
                }
                
                /* Estilos responsive */
                @media (max-width: 768px) {
                    .gestion-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .gestion-info {
                        justify-content: center;
                        margin-bottom: 10px;
                    }
                    
                    .gestion-buttons {
                        justify-content: center;
                    }
                    
                    .gestion-table-container {
                        max-height: 400px;
                    }
                    
                    .gestion-table th,
                    .gestion-table td {
                        min-width: 100px;
                        font-size: 12px;
                        padding: 8px 12px;
                    }
                }
                
                .gestion-btn {
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    color: #374151;
                    cursor: pointer;
                    font-size: 14px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                }
                
                .gestion-btn:hover {
                    background-color: #f3f4f6;
                    border-color: #9ca3af;
                }
                
                .gestion-btn-primary {
                    background-color: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }
                
                .gestion-btn-primary:hover {
                    background-color: #2563eb;
                    border-color: #2563eb;
                }
                
                .gestion-btn-success {
                    background-color: #10b981;
                    color: white;
                    border-color: #10b981;
                }
                
                .gestion-btn-success:hover {
                    background-color: #059669;
                    border-color: #059669;
                }
                
                .gestion-table-container {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow-x: auto;
                    overflow-y: auto;
                    margin-top: 20px;
                    max-height: 600px;
                    border: 1px solid #e5e7eb;
                }
                
                .gestion-table {
                    width: max-content;
                    min-width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                    table-layout: auto;
                }
                
                .gestion-table th {
                    background-color: #f8fafc;
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 2px solid #e5e7eb;
                    border-right: 1px solid #e5e7eb;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    min-width: 120px;
                }
                
                .gestion-table th:last-child {
                    border-right: none;
                }
                
                .gestion-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e5e7eb;
                    border-right: 1px solid #e5e7eb;
                    color: #374151;
                    white-space: nowrap;
                    min-width: 120px;
                    max-width: 250px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .gestion-table td:last-child {
                    border-right: none;
                }
                
                .gestion-table td:hover {
                    overflow: visible;
                    white-space: normal;
                    word-wrap: break-word;
                    position: relative;
                    z-index: 5;
                }
                
                .gestion-table tbody tr:hover {
                    background-color: #f9fafb;
                }
                
                .gestion-table tbody tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                
                .gestion-table tbody tr:nth-child(even):hover {
                    background-color: #f3f4f6;
                }
                
                .gestion-status-activo {
                    color: #059669;
                    font-weight: 500;
                }
                
                .gestion-status-inactivo {
                    color: #dc2626;
                    font-weight: 500;
                }
                
                .gestion-empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #6b7280;
                }
                
                .gestion-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    color: #d1d5db;
                }
                
                .gestion-empty-text {
                    font-size: 18px;
                    margin-bottom: 8px;
                }
                
                .gestion-empty-subtext {
                    font-size: 14px;
                }
                
                .gestion-loading {
                    text-align: center;
                    padding: 40px;
                    color: #6b7280;
                }
                
                .gestion-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f4f6;
                    border-radius: 50%;
                    border-top-color: #3b82f6;
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 10px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .gestion-error {
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    display: none;
                }
                
                .gestion-success {
                    background-color: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #059669;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .gestion-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .gestion-upload-section {
                        justify-content: center;
                    }
                    
                    .gestion-actions {
                        justify-content: center;
                    }
                    
                    .gestion-table-container {
                        overflow-x: auto;
                    }
                }
            </style>
            
            <div class="gestion-container">
                <div class="gestion-header">
                    <h1 class="gestion-titulo">Gestión de Operaciones Diarias</h1>
                    <div class="gestion-upload-section">
                        <div class="gestion-file-input-wrapper">
                            <input type="file" id="gestionFileInput" class="gestion-file-input" accept=".xlsx,.xls,.csv" onchange="handleFileUpload(this)">
                            <label for="gestionFileInput" class="gestion-file-label">
                                <i class="fas fa-upload"></i>
                                Cargar datos desde
                            </label>
                        </div>
                        <span id="gestionFileName" class="gestion-file-name">Ningún archivo seleccionado</span>
                    </div>
                </div>
                
                <div id="sheetSelector" class="sheet-selector" style="display: none;">
                    <div class="sheet-selector-header">
                        <i class="fas fa-layer-group"></i>
                        <span>Seleccionar Hoja de Excel:</span>
                    </div>
                    <select id="sheetSelect" class="sheet-select" onchange="handleSheetChange()">
                        <option value="">Selecciona una hoja...</option>
                    </select>
                    <div class="sheet-info">
                        <span id="sheetCount" class="sheet-count">
                            <i class="fas fa-file-alt"></i> Hojas disponibles: 0
                        </span>
                    </div>
                </div>
                
                <div id="gestionError" class="gestion-error"></div>
                <div id="gestionSuccess" class="gestion-success"></div>
                
                <div class="gestion-actions">
                    <div class="gestion-info">
                        <span id="columnCount" class="column-indicator">
                            <i class="fas fa-columns"></i> Columnas: 0
                        </span>
                        <span id="rowCount" class="row-indicator">
                            <i class="fas fa-list"></i> Filas: 0
                        </span>
                    </div>
                    <div class="gestion-buttons">
                        <button class="gestion-btn gestion-btn-primary" onclick="compartirConBD()">
                            <i class="fas fa-database"></i>
                            Compartir con BD
                        </button>
                        <button class="gestion-btn" onclick="seleccionarColumnas()">
                            <i class="fas fa-columns"></i>
                            Seleccionar Columnas
                        </button>
                        <button class="gestion-btn" onclick="exportarDatos()">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                        <button class="gestion-btn" onclick="filtrarDatos()">
                            <i class="fas fa-filter"></i>
                            Filtrar
                        </button>

                    </div>
                </div>
                
                <div class="gestion-scroll-info" id="scrollInfo" style="display: none;">
                    <i class="fas fa-info-circle"></i>
                    <span>Desliza horizontalmente para ver todas las columnas</span>
                </div>
                
                <div id="gestionTableContainer" class="gestion-table-container">
                    <div class="gestion-empty-state">
                        <div class="gestion-empty-icon">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <div class="gestion-empty-text">No hay datos cargados</div>
                        <div class="gestion-empty-subtext">Selecciona un archivo Excel para comenzar</div>
                    </div>
                </div>
            </div>
        `;
    }

    getCreacionProyectosContent() {
        return `
            <style>
                .proyectos-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: white;
                    padding: 30px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin: 0;
                    overflow-x: auto;
                    position: relative;
                    min-width: 0;
                }
                
                .proyectos-titulo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e3a8a;
                    text-transform: uppercase;
                    margin-bottom: 50px;
                    margin-top: 40px;
                    text-align: center;
                }
                
                .proyectos-botones {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 40px;
                    margin-top: 30px;
                    flex-wrap: wrap;
                }
                
                .proyectos-btn-descargar {
                    background-color: #1e3a8a;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .proyectos-btn-descargar:hover {
                    background-color: #1e40af;
                }
                
                .proyectos-btn-cargar {
                    background-color: #ef4444;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .proyectos-btn-cargar:hover {
                    background-color: #dc2626;
                }
                
                .proyectos-btn-crear {
                    background-color: #ffffff;
                    color: #1e3a8a;
                    border: 2px solid #1e3a8a;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .proyectos-btn-crear:hover {
                    background-color: #f3f4f6;
                }
                
                .proyectos-btn-limpiar {
                    background-color: #6b7280;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .proyectos-btn-limpiar:hover {
                    background-color: #4b5563;
                }
                
                .proyectos-table {
                    width: 100%;
                    min-width: 100%;
                    border-collapse: collapse;
                    background-color: white;
                    table-layout: auto;
                    margin: 0;
                    padding: 0;
                }
                
                .proyectos-table th {
                    background-color: white;
                    color: #374151;
                    font-weight: 600;
                    padding: 12px 8px;
                    text-align: left;
                    border-bottom: 2px solid #e5e7eb;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .proyectos-table td {
                    padding: 12px 8px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #374151;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .proyectos-table tbody tr:hover {
                    background-color: white;
                }
                
                .proyectos-acciones {
                    display: flex;
                    gap: 8px;
                }
                
                .proyectos-btn-ver, .proyectos-btn-editar {
                    color: #3b82f6;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .proyectos-btn-eliminar {
                    color: #ef4444;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .proyectos-btn-ver:hover, .proyectos-btn-editar:hover {
                    background-color: #f0f9ff;
                    border-radius: 4px;
                }
                
                .proyectos-btn-eliminar:hover {
                    background-color: #fef2f2;
                    border-radius: 4px;
                }
                
                .proyectos-icon {
                    width: 20px;
                    height: 20px;
                }
                
                .proyectos-sortable {
                    cursor: pointer;
                    user-select: none;
                }
                
                .proyectos-sortable:hover {
                    background-color: white;
                }
                
                .proyectos-sortable.asc::after {
                    content: ' ▲';
                    color: #1e3a8a;
                }
                
                .proyectos-sortable.desc::after {
                    content: ' ▼';
                    color: #1e3a8a;
                }
                
                .proyectos-filter-row {
                    background: white;
                    border-bottom: 2px solid #e2e8f0;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
                }
                
                .proyectos-filter-input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 14px;
                    background-color: white;
                }
                
                .proyectos-filter-input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                }
                
                .proyectos-search-container {
                    margin-bottom: 20px;
                }
                
                .proyectos-search-input {
                    width: 100%;
                    max-width: 400px;
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 16px;
                    background-color: white;
                    transition: border-color 0.3s;
                }
                
                .proyectos-search-input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                }
            </style>
            
            <div class="proyectos-container">
                <h1 class="proyectos-titulo">GESTIÓN DE PROYECTOS</h1>
                
                <div class="proyectos-botones">
                    <button class="proyectos-btn-descargar" onclick="descargarPlantillaProyectos()">
                        <i class="fas fa-download"></i> Descargar Archivo
                    </button>
                    <button class="proyectos-btn-cargar" onclick="guardarPlantillaProyectos()">
                        <i class="fas fa-upload"></i> Cargar Archivo
                    </button>
                    <button class="proyectos-btn-crear" onclick="mostrarModalNuevoProyecto()">
                        <i class="fas fa-plus"></i> Crear Nuevo
                    </button>
                    <button class="proyectos-btn-limpiar" onclick="limpiarFiltrosProyectos()">
                        <i class="fas fa-filter"></i> Limpiar Filtros
                    </button>
                </div>
                
                <div class="proyectos-search-container">
                    <input type="text" id="buscarProyectos" class="proyectos-search-input" placeholder="Buscar en todos los proyectos...">
                </div>
                
                <table class="proyectos-table" id="tablaProyectosMinimalista">
                    <thead>
                        <tr>
                            <th class="proyectos-sortable" data-sort="0" onclick="ordenarTablaProyectos(0)">ID Proyecto</th>
                            <th class="proyectos-sortable" data-sort="1" onclick="ordenarTablaProyectos(1)">Nombre Proyecto</th>
                            <th class="proyectos-sortable" data-sort="2" onclick="ordenarTablaProyectos(2)">Cliente</th>
                            <th class="proyectos-sortable" data-sort="3" onclick="ordenarTablaProyectos(3)">Fecha Inicio</th>
                            <th class="proyectos-sortable" data-sort="4" onclick="ordenarTablaProyectos(4)">Fecha Fin</th>
                            <th class="proyectos-sortable" data-sort="5" onclick="ordenarTablaProyectos(5)">Estado</th>
                            <th class="proyectos-sortable" data-sort="6" onclick="ordenarTablaProyectos(6)">Presupuesto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="proyectos-filter-row">
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaProyectos(0, this.value)"></td>
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar nombre..." onkeyup="filtrarPorColumnaProyectos(1, this.value)"></td>
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar cliente..." onkeyup="filtrarPorColumnaProyectos(2, this.value)"></td>
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar fecha..." onkeyup="filtrarPorColumnaProyectos(3, this.value)"></td>
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar fecha..." onkeyup="filtrarPorColumnaProyectos(4, this.value)"></td>
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar estado..." onkeyup="filtrarPorColumnaProyectos(5, this.value)"></td>
                            <td><input type="text" class="proyectos-filter-input" placeholder="Filtrar presupuesto..." onkeyup="filtrarPorColumnaProyectos(6, this.value)"></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>P001</td>
                            <td>Proyecto A</td>
                            <td>Cliente A</td>
                            <td>2024-01-15</td>
                            <td>2024-06-30</td>
                            <td>En Progreso</td>
                            <td>$50,000</td>
                            <td>
                                <div class="proyectos-acciones">
                                    <button class="proyectos-btn-ver" onclick="verProyecto('P001')">
                                        <i class="fas fa-eye proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-editar" onclick="editarProyecto('P001')">
                                        <i class="fas fa-edit proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-eliminar" onclick="eliminarProyecto('P001')">
                                        <i class="fas fa-trash proyectos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>P002</td>
                            <td>Proyecto B</td>
                            <td>Cliente B</td>
                            <td>2024-02-01</td>
                            <td>2024-08-15</td>
                            <td>Planificado</td>
                            <td>$75,000</td>
                            <td>
                                <div class="proyectos-acciones">
                                    <button class="proyectos-btn-ver" onclick="verProyecto('P002')">
                                        <i class="fas fa-eye proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-editar" onclick="editarProyecto('P002')">
                                        <i class="fas fa-edit proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-eliminar" onclick="eliminarProyecto('P002')">
                                        <i class="fas fa-trash proyectos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>P003</td>
                            <td>Proyecto C</td>
                            <td>Cliente C</td>
                            <td>2024-03-10</td>
                            <td>2024-09-30</td>
                            <td>Completado</td>
                            <td>$120,000</td>
                            <td>
                                <div class="proyectos-acciones">
                                    <button class="proyectos-btn-ver" onclick="verProyecto('P003')">
                                        <i class="fas fa-eye proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-editar" onclick="editarProyecto('P003')">
                                        <i class="fas fa-edit proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-eliminar" onclick="eliminarProyecto('P003')">
                                        <i class="fas fa-trash proyectos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>P004</td>
                            <td>Proyecto D</td>
                            <td>Cliente D</td>
                            <td>2024-04-05</td>
                            <td>2024-10-20</td>
                            <td>En Progreso</td>
                            <td>$90,000</td>
                            <td>
                                <div class="proyectos-acciones">
                                    <button class="proyectos-btn-ver" onclick="verProyecto('P004')">
                                        <i class="fas fa-eye proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-editar" onclick="editarProyecto('P004')">
                                        <i class="fas fa-edit proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-eliminar" onclick="eliminarProyecto('P004')">
                                        <i class="fas fa-trash proyectos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>P005</td>
                            <td>Proyecto E</td>
                            <td>Cliente E</td>
                            <td>2024-05-20</td>
                            <td>2024-12-15</td>
                            <td>Planificado</td>
                            <td>$200,000</td>
                            <td>
                                <div class="proyectos-acciones">
                                    <button class="proyectos-btn-ver" onclick="verProyecto('P005')">
                                        <i class="fas fa-eye proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-editar" onclick="editarProyecto('P005')">
                                        <i class="fas fa-edit proyectos-icon"></i>
                                    </button>
                                    <button class="proyectos-btn-eliminar" onclick="eliminarProyecto('P005')">
                                        <i class="fas fa-trash proyectos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getColaboradoresContent() {
        return `
            <style>
                                        .colaboradores-container {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: white;
                            padding: 30px;
                            width: 100%;
                            max-width: 100%;
                            box-sizing: border-box;
                            margin: 0;
                            overflow-x: auto;
                            position: relative;
                            min-width: 0;
                        }
                        
                        .colaboradores-titulo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #1e3a8a;
                            text-transform: uppercase;
                            margin-bottom: 50px;
                            margin-top: 40px;
                            text-align: center;
                        }
                
                .colaboradores-botones {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 40px;
                    margin-top: 30px;
                    flex-wrap: wrap;
                }
                
                                        .colaboradores-btn-descargar {
                            background-color: #1e3a8a;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .colaboradores-btn-descargar:hover {
                            background-color: #1e40af;
                        }
                        
                        .colaboradores-btn-cargar {
                            background-color: #ef4444;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .colaboradores-btn-cargar:hover {
                            background-color: #dc2626;
                        }
                        
                        .colaboradores-btn-crear {
                            background-color: #ffffff;
                            color: #1e3a8a;
                            border: 2px solid #1e3a8a;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .colaboradores-btn-crear:hover {
                            background-color: #f3f4f6;
                        }
                        
                        .colaboradores-btn-limpiar {
                            background-color: #6b7280;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .colaboradores-btn-limpiar:hover {
                            background-color: #4b5563;
                        }
                
                .colaboradores-search-container {
                    margin-bottom: 20px;
                }
                
                                        .colaboradores-search-input {
                            width: 100%;
                            max-width: 400px;
                            padding: 12px 16px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 16px;
                            background-color: white;
                            transition: border-color 0.3s;
                        }
                        
                        .colaboradores-search-input:focus {
                            outline: none;
                            border-color: #1e3a8a;
                            box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                        }
                
                                        .colaboradores-table {
                            width: 100%;
                            min-width: 100%;
                            border-collapse: collapse;
                            background-color: white;
                            table-layout: auto;
                            margin: 0;
                            padding: 0;
                        }
                        
                        .colaboradores-table th {
                            background-color: white;
                            color: #374151;
                            font-weight: 600;
                            padding: 12px 8px;
                            text-align: left;
                            border-bottom: 2px solid #e5e7eb;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                
                                        .colaboradores-table td {
                            padding: 12px 8px;
                            border-bottom: 1px solid #e5e7eb;
                            color: #374151;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .colaboradores-table tbody tr:hover {
                            background-color: white;
                        }
                
                .colaboradores-acciones {
                    display: flex;
                    gap: 8px;
                }
                
                .colaboradores-btn-ver, .colaboradores-btn-editar {
                    color: #3b82f6;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .colaboradores-btn-eliminar {
                    color: #ef4444;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .colaboradores-btn-ver:hover, .colaboradores-btn-editar:hover {
                    background-color: #f0f9ff;
                    border-radius: 4px;
                }
                
                .colaboradores-btn-eliminar:hover {
                    background-color: #fef2f2;
                    border-radius: 4px;
                }
                
                .colaboradores-icon {
                    width: 20px;
                    height: 20px;
                }
                
                .colaboradores-sortable {
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.3s ease;
                }
                
                .colaboradores-sortable:hover {
                    background: linear-gradient(135deg, #334155 0%, #475569 100%);
                }
                
                .colaboradores-sortable.asc::after {
                    content: ' ▲';
                    color: #60a5fa;
                    font-weight: bold;
                }
                
                .colaboradores-sortable.desc::after {
                    content: ' ▼';
                    color: #60a5fa;
                    font-weight: bold;
                }
                
                .colaboradores-filter-row {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .colaboradores-filter-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    background-color: white;
                    transition: all 0.3s ease;
                }
                
                .colaboradores-filter-input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                    transform: translateY(-1px);
                }
            </style>
            
            <div class="colaboradores-container">
                <h1 class="colaboradores-titulo">GESTIÓN DE COLABORADORES</h1>
                
                <div class="colaboradores-botones">
                    <button class="colaboradores-btn-descargar" onclick="descargarPlantillaColaboradores()">
                        <i class="fas fa-download"></i> Descargar Archivo
                    </button>
                    <button class="colaboradores-btn-cargar" onclick="guardarPlantillaColaboradores()">
                        <i class="fas fa-upload"></i> Cargar Archivo
                    </button>
                    <button class="colaboradores-btn-crear" onclick="mostrarModalNuevoColaborador()">
                        <i class="fas fa-plus"></i> Crear Nuevo
                    </button>
                    <button class="colaboradores-btn-limpiar" onclick="limpiarFiltrosColaboradores()">
                        <i class="fas fa-filter"></i> Limpiar Filtros
                    </button>
                </div>
                
                <div class="colaboradores-search-container">
                    <input type="text" id="buscarColaboradores" class="colaboradores-search-input" placeholder="Buscar en todos los colaboradores...">
                </div>
                
                <table class="colaboradores-table" id="tablaColaboradoresMinimalista">
                    <thead>
                        <tr>
                            <th class="colaboradores-sortable" data-sort="0" onclick="ordenarTablaColaboradores(0)">ID Colaborador</th>
                            <th class="colaboradores-sortable" data-sort="1" onclick="ordenarTablaColaboradores(1)">Nombre Completo</th>
                            <th class="colaboradores-sortable" data-sort="2" onclick="ordenarTablaColaboradores(2)">Cargo</th>
                            <th class="colaboradores-sortable" data-sort="3" onclick="ordenarTablaColaboradores(3)">Departamento</th>
                            <th class="colaboradores-sortable" data-sort="4" onclick="ordenarTablaColaboradores(4)">Email</th>
                            <th class="colaboradores-sortable" data-sort="5" onclick="ordenarTablaColaboradores(5)">Teléfono</th>
                            <th class="colaboradores-sortable" data-sort="6" onclick="ordenarTablaColaboradores(6)">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="colaboradores-filter-row">
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaColaboradores(0, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar nombre..." onkeyup="filtrarPorColumnaColaboradores(1, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar cargo..." onkeyup="filtrarPorColumnaColaboradores(2, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar departamento..." onkeyup="filtrarPorColumnaColaboradores(3, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar email..." onkeyup="filtrarPorColumnaColaboradores(4, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar teléfono..." onkeyup="filtrarPorColumnaColaboradores(5, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar estado..." onkeyup="filtrarPorColumnaColaboradores(6, this.value)"></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>C001</td>
                            <td>Juan Pérez</td>
                            <td>Ingeniero Civil</td>
                            <td>Construcción</td>
                            <td>juan.perez@empresa.com</td>
                            <td>+1 555-0101</td>
                            <td>Activo</td>
                            <td>
                                <div class="colaboradores-acciones">
                                    <button class="colaboradores-btn-ver" onclick="verColaborador('C001')">
                                        <i class="fas fa-eye colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-editar" onclick="editarColaborador('C001')">
                                        <i class="fas fa-edit colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-eliminar" onclick="eliminarColaborador('C001')">
                                        <i class="fas fa-trash colaboradores-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C002</td>
                            <td>María García</td>
                            <td>Arquitecta</td>
                            <td>Diseño</td>
                            <td>maria.garcia@empresa.com</td>
                            <td>+1 555-0102</td>
                            <td>Activo</td>
                            <td>
                                <div class="colaboradores-acciones">
                                    <button class="colaboradores-btn-ver" onclick="verColaborador('C002')">
                                        <i class="fas fa-eye colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-editar" onclick="editarColaborador('C002')">
                                        <i class="fas fa-edit colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-eliminar" onclick="eliminarColaborador('C002')">
                                        <i class="fas fa-trash colaboradores-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C003</td>
                            <td>Carlos López</td>
                            <td>Supervisor</td>
                            <td>Operaciones</td>
                            <td>carlos.lopez@empresa.com</td>
                            <td>+1 555-0103</td>
                            <td>Activo</td>
                            <td>
                                <div class="colaboradores-acciones">
                                    <button class="colaboradores-btn-ver" onclick="verColaborador('C003')">
                                        <i class="fas fa-eye colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-editar" onclick="editarColaborador('C003')">
                                        <i class="fas fa-edit colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-eliminar" onclick="eliminarColaborador('C003')">
                                        <i class="fas fa-trash colaboradores-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C004</td>
                            <td>Ana Rodríguez</td>
                            <td>Contadora</td>
                            <td>Finanzas</td>
                            <td>ana.rodriguez@empresa.com</td>
                            <td>+1 555-0104</td>
                            <td>Activo</td>
                            <td>
                                <div class="colaboradores-acciones">
                                    <button class="colaboradores-btn-ver" onclick="verColaborador('C004')">
                                        <i class="fas fa-eye colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-editar" onclick="editarColaborador('C004')">
                                        <i class="fas fa-edit colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-eliminar" onclick="eliminarColaborador('C004')">
                                        <i class="fas fa-trash colaboradores-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C005</td>
                            <td>Luis Martínez</td>
                            <td>Operador</td>
                            <td>Logística</td>
                            <td>luis.martinez@empresa.com</td>
                            <td>+1 555-0105</td>
                            <td>Inactivo</td>
                            <td>
                                <div class="colaboradores-acciones">
                                    <button class="colaboradores-btn-ver" onclick="verColaborador('C005')">
                                        <i class="fas fa-eye colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-editar" onclick="editarColaborador('C005')">
                                        <i class="fas fa-edit colaboradores-icon"></i>
                                    </button>
                                    <button class="colaboradores-btn-eliminar" onclick="eliminarColaborador('C005')">
                                        <i class="fas fa-trash colaboradores-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getGestionMaterialesContent() {
        return `
        <style>
                                .materiales-container {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: white;
                        padding: 30px;
                        width: 100%;
                        max-width: 100%;
                        box-sizing: border-box;
                        margin: 0;
                        overflow-x: auto;
                        position: relative;
                        min-width: 0;
                    }
                    
                    .materiales-titulo {
                        font-size: 28px;
                        font-weight: bold;
                        color: #1e3a8a;
                        text-transform: uppercase;
                        margin-bottom: 50px;
                        margin-top: 40px;
                        text-align: center;
                    }
            
            .materiales-botones {
                display: flex;
                gap: 20px;
                margin-bottom: 30px;
                margin-top: 20px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
                                .materiales-btn-descargar {
                        background-color: #1e3a8a;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                    }
                    .materiales-btn-descargar:hover {
                        background-color: #1e40af;
                    }
                    
                    .materiales-btn-cargar {
                        background-color: #ef4444;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                    }
                    .materiales-btn-cargar:hover {
                        background-color: #dc2626;
                    }
                    
                    .materiales-btn-crear {
                        background-color: #ffffff;
                        color: #1e3a8a;
                        border: 2px solid #1e3a8a;
                        padding: 12px 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                    }
                    .materiales-btn-crear:hover {
                        background-color: #f3f4f6;
                    }
                    
                    .materiales-btn-limpiar {
                        background-color: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                    }
                    .materiales-btn-limpiar:hover {
                        background-color: #4b5563;
                    }
            
            .materiales-search-container {
                margin-bottom: 25px;
                text-align: center;
            }
            
                                .materiales-search-input {
                        width: 100%;
                        max-width: 500px;
                        padding: 12px 16px;
                        border: 1px solid #d1d5db;
                        border-radius: 4px;
                        font-size: 16px;
                        background: white;
                    }
                    
                    .materiales-search-input:focus {
                        outline: none;
                        border-color: #1e3a8a;
                    }
            
                                .materiales-table {
                        width: 100%;
                        min-width: 100%;
                        border-collapse: collapse;
                        background-color: white;
                        table-layout: auto;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .materiales-table th {
                        background: white;
                        color: #374151;
                        font-weight: 600;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                        text-transform: uppercase;
                        border: 1px solid #d1d5db;
                    }
            
                                .materiales-table td {
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        color: #374151;
                        font-size: 14px;
                    }
                    
                    .materiales-table tbody tr:hover {
                        background-color: #f9fafb;
                    }
            
            .materiales-acciones {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .materiales-btn-ver, .materiales-btn-editar {
                color: #3b82f6;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.3s ease;
            }
            
            .materiales-btn-eliminar {
                color: #ef4444;
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.3s ease;
            }
            
                                .materiales-btn-ver:hover, .materiales-btn-editar:hover {
                        background-color: #f0f9ff;
                        border-radius: 4px;
                    }
                    
                    .materiales-btn-eliminar:hover {
                        background-color: #fef2f2;
                        border-radius: 4px;
                    }
            
            .materiales-icon {
                width: 18px;
                height: 18px;
            }
            
            .materiales-sortable {
                cursor: pointer;
                user-select: none;
                transition: all 0.3s ease;
            }
            
            .materiales-sortable:hover {
                background: linear-gradient(135deg, #334155 0%, #475569 100%);
            }
            
            .materiales-sortable.asc::after {
                content: ' ▲';
                color: #60a5fa;
                font-weight: bold;
            }
            
            .materiales-sortable.desc::after {
                content: ' ▼';
                color: #60a5fa;
                font-weight: bold;
            }
            
            .materiales-filter-row {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-bottom: 2px solid #e2e8f0;
            }
            
            .materiales-filter-input {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                background-color: white;
                transition: all 0.3s ease;
            }
            
            .materiales-filter-input:focus {
                outline: none;
                border-color: #1e3a8a;
                box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                transform: translateY(-1px);
            }
        </style>
        
        <div class="materiales-container">
            <h1 class="materiales-titulo">Gestión de Materiales</h1>
            
            <div class="materiales-botones">
                <button class="materiales-btn-descargar" onclick="descargarPlantillaMateriales()">
                    <i class="fas fa-download"></i> Descargar Archivo
                </button>
                <button class="materiales-btn-cargar" onclick="guardarPlantillaMateriales()">
                    <i class="fas fa-upload"></i> Cargar Archivo
                </button>
                <button class="materiales-btn-crear" onclick="mostrarModalNuevoMaterial()">
                    <i class="fas fa-plus"></i> Crear Nuevo
                </button>
                <button class="materiales-btn-limpiar" onclick="limpiarFiltrosMateriales()">
                    <i class="fas fa-filter"></i> Limpiar Filtros
                </button>
            </div>
            
            <div class="materiales-search-container">
                <input type="text" id="buscarMateriales" class="materiales-search-input" placeholder="🔍 Buscar en todos los materiales...">
            </div>
            
            <table class="materiales-table" id="tablaMaterialesMinimalista">
                <thead>
                    <tr>
                        <th class="materiales-sortable" data-sort="0" onclick="ordenarTablaMateriales(0)">ID Material</th>
                        <th class="materiales-sortable" data-sort="1" onclick="ordenarTablaMateriales(1)">Nombre Material</th>
                        <th class="materiales-sortable" data-sort="2" onclick="ordenarTablaMateriales(2)">Categoría</th>
                        <th class="materiales-sortable" data-sort="3" onclick="ordenarTablaMateriales(3)">Stock en Almacén</th>
                        <th class="materiales-sortable" data-sort="4" onclick="ordenarTablaMateriales(4)">Unidad</th>
                        <th class="materiales-sortable" data-sort="5" onclick="ordenarTablaMateriales(5)">Precio</th>
                        <th class="materiales-sortable" data-sort="6" onclick="ordenarTablaMateriales(6)">Proveedor</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="materiales-filter-row">
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaMateriales(0, this.value)"></td>
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar nombre..." onkeyup="filtrarPorColumnaMateriales(1, this.value)"></td>
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar categoría..." onkeyup="filtrarPorColumnaMateriales(2, this.value)"></td>
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar stock en almacén..." onkeyup="filtrarPorColumnaMateriales(3, this.value)"></td>
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar unidad..." onkeyup="filtrarPorColumnaMateriales(4, this.value)"></td>
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar precio..." onkeyup="filtrarPorColumnaMateriales(5, this.value)"></td>
                        <td><input type="text" class="materiales-filter-input" placeholder="Filtrar proveedor..." onkeyup="filtrarPorColumnaMateriales(6, this.value)"></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>M001</td>
                        <td>Cemento Portland</td>
                        <td>Construcción</td>
                        <td>150</td>
                        <td>Bolsas</td>
                        <td>$12.50</td>
                        <td>Proveedor A</td>
                        <td>
                            <div class="materiales-acciones">
                                <button class="materiales-btn-ver" onclick="verMaterial('M001')">
                                    <i class="fas fa-eye materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-editar" onclick="editarMaterial('M001')">
                                    <i class="fas fa-edit materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-eliminar" onclick="eliminarMaterial('M001')">
                                    <i class="fas fa-trash materiales-icon"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>M002</td>
                        <td>Varilla de Acero</td>
                        <td>Construcción</td>
                        <td>75</td>
                        <td>Unidades</td>
                        <td>$8.75</td>
                        <td>Proveedor B</td>
                        <td>
                            <div class="materiales-acciones">
                                <button class="materiales-btn-ver" onclick="verMaterial('M002')">
                                    <i class="fas fa-eye materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-editar" onclick="editarMaterial('M002')">
                                    <i class="fas fa-edit materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-eliminar" onclick="eliminarMaterial('M002')">
                                    <i class="fas fa-trash materiales-icon"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>M003</td>
                        <td>Pintura Blanca</td>
                        <td>Acabados</td>
                        <td>45</td>
                        <td>Galones</td>
                        <td>$25.00</td>
                        <td>Proveedor C</td>
                        <td>
                            <div class="materiales-acciones">
                                <button class="materiales-btn-ver" onclick="verMaterial('M003')">
                                    <i class="fas fa-eye materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-editar" onclick="editarMaterial('M003')">
                                    <i class="fas fa-edit materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-eliminar" onclick="eliminarMaterial('M003')">
                                    <i class="fas fa-trash materiales-icon"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>M004</td>
                        <td>Ladrillos</td>
                        <td>Construcción</td>
                        <td>2000</td>
                        <td>Unidades</td>
                        <td>$0.85</td>
                        <td>Proveedor A</td>
                        <td>
                            <div class="materiales-acciones">
                                <button class="materiales-btn-ver" onclick="verMaterial('M004')">
                                    <i class="fas fa-eye materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-editar" onclick="editarMaterial('M004')">
                                    <i class="fas fa-edit materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-eliminar" onclick="eliminarMaterial('M004')">
                                    <i class="fas fa-trash materiales-icon"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>M005</td>
                        <td>Arena Fina</td>
                        <td>Construcción</td>
                        <td>300</td>
                        <td>Metros³</td>
                        <td>$45.00</td>
                        <td>Proveedor D</td>
                        <td>
                            <div class="materiales-acciones">
                                <button class="materiales-btn-ver" onclick="verMaterial('M005')">
                                    <i class="fas fa-eye materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-editar" onclick="editarMaterial('M005')">
                                    <i class="fas fa-edit materiales-icon"></i>
                                </button>
                                <button class="materiales-btn-eliminar" onclick="eliminarMaterial('M005')">
                                    <i class="fas fa-trash materiales-icon"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;
    }

    getGestionVehiculosContent() {
        return `
            <style>
                                        .vehiculos-container {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: white;
                            padding: 30px;
                            width: 100%;
                            max-width: 100%;
                            box-sizing: border-box;
                            margin: 0;
                            overflow-x: auto;
                            position: relative;
                            min-width: 0;
                        }
                        
                        .vehiculos-titulo {
                            font-size: 28px;
                            font-weight: bold;
                            color: #1e3a8a;
                            text-transform: uppercase;
                            margin-bottom: 50px;
                            margin-top: 40px;
                            text-align: center;
                        }
                
                .vehiculos-botones {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                                        .vehiculos-btn-descargar {
                            background-color: #1e3a8a;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .vehiculos-btn-descargar:hover {
                            background-color: #1e40af;
                        }
                        
                        .vehiculos-btn-cargar {
                            background-color: #ef4444;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .vehiculos-btn-cargar:hover {
                            background-color: #dc2626;
                        }
                        
                        .vehiculos-btn-crear {
                            background-color: #ffffff;
                            color: #1e3a8a;
                            border: 2px solid #1e3a8a;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .vehiculos-btn-crear:hover {
                            background-color: #f3f4f6;
                        }
                        
                        .vehiculos-btn-limpiar {
                            background-color: #6b7280;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .vehiculos-btn-limpiar:hover {
                            background-color: #4b5563;
                        }
                
                .vehiculos-search-container {
                    margin-bottom: 25px;
                    text-align: center;
                }
                
                                        .vehiculos-search-input {
                            width: 100%;
                            max-width: 500px;
                            padding: 12px 16px;
                            border: 1px solid #d1d5db;
                            border-radius: 4px;
                            font-size: 16px;
                            background: white;
                        }
                        
                        .vehiculos-search-input:focus {
                            outline: none;
                            border-color: #1e3a8a;
                        }
                
                                        .vehiculos-table {
                            width: 100%;
                            min-width: 100%;
                            border-collapse: collapse;
                            background-color: white;
                            table-layout: auto;
                            margin: 0;
                            padding: 0;
                        }
                        
                        .vehiculos-table th {
                            background: white;
                            color: #374151;
                            font-weight: 600;
                            padding: 12px;
                            text-align: left;
                            font-size: 14px;
                            text-transform: uppercase;
                            border: 1px solid #d1d5db;
                        }
                
                                        .vehiculos-table td {
                            padding: 12px;
                            border: 1px solid #d1d5db;
                            color: #374151;
                            font-size: 14px;
                        }
                        
                        .vehiculos-table tbody tr:hover {
                            background-color: #f9fafb;
                        }
                
                .vehiculos-acciones {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                .vehiculos-btn-ver, .vehiculos-btn-editar {
                    color: #3b82f6;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                
                .vehiculos-btn-eliminar {
                    color: #ef4444;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                
                .vehiculos-btn-ver:hover, .vehiculos-btn-editar:hover {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    transform: scale(1.1);
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
                }
                
                .vehiculos-btn-eliminar:hover {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    transform: scale(1.1);
                    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
                }
                
                .vehiculos-icon {
                    width: 18px;
                    height: 18px;
                }
                
                .vehiculos-sortable {
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.3s ease;
                }
                
                .vehiculos-sortable:hover {
                    background: linear-gradient(135deg, #334155 0%, #475569 100%);
                }
                
                .vehiculos-sortable.asc::after {
                    content: ' ▲';
                    color: #60a5fa;
                    font-weight: bold;
                }
                
                .vehiculos-sortable.desc::after {
                    content: ' ▼';
                    color: #60a5fa;
                    font-weight: bold;
                }
                
                .vehiculos-filter-row {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .vehiculos-filter-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    background-color: white;
                    transition: all 0.3s ease;
                }
                
                .vehiculos-filter-input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                    transform: translateY(-1px);
                }
            </style>
            
            <div class="vehiculos-container">
                <h1 class="vehiculos-titulo">Gestión de Vehículos</h1>
                
                <div class="vehiculos-botones">
                    <button class="vehiculos-btn-descargar" onclick="descargarPlantillaVehiculos()">
                        <i class="fas fa-download"></i> Descargar Archivo
                    </button>
                    <button class="vehiculos-btn-cargar" onclick="guardarPlantillaVehiculos()">
                        <i class="fas fa-upload"></i> Cargar Archivo
                    </button>
                    <button class="vehiculos-btn-crear" onclick="mostrarModalNuevoVehiculo()">
                        <i class="fas fa-plus"></i> Crear Nuevo
                    </button>
                    <button class="vehiculos-btn-limpiar" onclick="limpiarFiltrosVehiculos()">
                        <i class="fas fa-filter"></i> Limpiar Filtros
                    </button>
                </div>
                
                <div class="vehiculos-search-container">
                    <input type="text" id="buscarVehiculos" class="vehiculos-search-input" placeholder="🔍 Buscar en todos los vehículos...">
                </div>
                
                <table class="vehiculos-table" id="tablaVehiculosMinimalista">
                    <thead>
                        <tr>
                            <th class="vehiculos-sortable" data-sort="0" onclick="ordenarTablaVehiculos(0)">ID Vehículo</th>
                            <th class="vehiculos-sortable" data-sort="1" onclick="ordenarTablaVehiculos(1)">Placa</th>
                            <th class="vehiculos-sortable" data-sort="2" onclick="ordenarTablaVehiculos(2)">Marca</th>
                            <th class="vehiculos-sortable" data-sort="3" onclick="ordenarTablaVehiculos(3)">Modelo</th>
                            <th class="vehiculos-sortable" data-sort="4" onclick="ordenarTablaVehiculos(4)">Año</th>
                            <th class="vehiculos-sortable" data-sort="5" onclick="ordenarTablaVehiculos(5)">Tipo</th>
                            <th class="vehiculos-sortable" data-sort="6" onclick="ordenarTablaVehiculos(6)">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="vehiculos-filter-row">
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaVehiculos(0, this.value)"></td>
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar placa..." onkeyup="filtrarPorColumnaVehiculos(1, this.value)"></td>
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar marca..." onkeyup="filtrarPorColumnaVehiculos(2, this.value)"></td>
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar modelo..." onkeyup="filtrarPorColumnaVehiculos(3, this.value)"></td>
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar año..." onkeyup="filtrarPorColumnaVehiculos(4, this.value)"></td>
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar tipo..." onkeyup="filtrarPorColumnaVehiculos(5, this.value)"></td>
                            <td><input type="text" class="vehiculos-filter-input" placeholder="Filtrar estado..." onkeyup="filtrarPorColumnaVehiculos(6, this.value)"></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>V001</td>
                            <td>ABC-123</td>
                            <td>Toyota</td>
                            <td>Hilux</td>
                            <td>2022</td>
                            <td>Pickup</td>
                            <td>Disponible</td>
                            <td>
                                <div class="vehiculos-acciones">
                                    <button class="vehiculos-btn-ver" onclick="verVehiculo('V001')">
                                        <i class="fas fa-eye vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-editar" onclick="editarVehiculo('V001')">
                                        <i class="fas fa-edit vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-eliminar" onclick="eliminarVehiculo('V001')">
                                        <i class="fas fa-trash vehiculos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>V002</td>
                            <td>XYZ-789</td>
                            <td>Ford</td>
                            <td>Ranger</td>
                            <td>2021</td>
                            <td>Pickup</td>
                            <td>En Mantenimiento</td>
                            <td>
                                <div class="vehiculos-acciones">
                                    <button class="vehiculos-btn-ver" onclick="verVehiculo('V002')">
                                        <i class="fas fa-eye vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-editar" onclick="editarVehiculo('V002')">
                                        <i class="fas fa-edit vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-eliminar" onclick="eliminarVehiculo('V002')">
                                        <i class="fas fa-trash vehiculos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>V003</td>
                            <td>DEF-456</td>
                            <td>Chevrolet</td>
                            <td>Colorado</td>
                            <td>2023</td>
                            <td>Pickup</td>
                            <td>Disponible</td>
                            <td>
                                <div class="vehiculos-acciones">
                                    <button class="vehiculos-btn-ver" onclick="verVehiculo('V003')">
                                        <i class="fas fa-eye vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-editar" onclick="editarVehiculo('V003')">
                                        <i class="fas fa-edit vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-eliminar" onclick="eliminarVehiculo('V003')">
                                        <i class="fas fa-trash vehiculos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>V004</td>
                            <td>GHI-789</td>
                            <td>Nissan</td>
                            <td>Frontier</td>
                            <td>2020</td>
                            <td>Pickup</td>
                            <td>En Uso</td>
                            <td>
                                <div class="vehiculos-acciones">
                                    <button class="vehiculos-btn-ver" onclick="verVehiculo('V004')">
                                        <i class="fas fa-eye vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-editar" onclick="editarVehiculo('V004')">
                                        <i class="fas fa-edit vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-eliminar" onclick="eliminarVehiculo('V004')">
                                        <i class="fas fa-trash vehiculos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>V005</td>
                            <td>JKL-012</td>
                            <td>Mitsubishi</td>
                            <td>L200</td>
                            <td>2021</td>
                            <td>Pickup</td>
                            <td>Disponible</td>
                            <td>
                                <div class="vehiculos-acciones">
                                    <button class="vehiculos-btn-ver" onclick="verVehiculo('V005')">
                                        <i class="fas fa-eye vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-editar" onclick="editarVehiculo('V005')">
                                        <i class="fas fa-edit vehiculos-icon"></i>
                                    </button>
                                    <button class="vehiculos-btn-eliminar" onclick="eliminarVehiculo('V005')">
                                        <i class="fas fa-trash vehiculos-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getGestionCuadrillasContent() {
        return `
            <style>
                .cuadrillas-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: white;
                    padding: 30px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin: 0;
                    overflow-x: auto;
                    position: relative;
                    min-width: 0;
                }
                
                .cuadrillas-titulo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e3a8a;
                    text-transform: uppercase;
                    margin-bottom: 50px;
                    margin-top: 40px;
                    text-align: center;
                }
                
                .cuadrillas-botones {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .cuadrillas-btn-descargar {
                    background-color: #1e3a8a;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .cuadrillas-btn-descargar:hover {
                    background-color: #1e40af;
                }
                
                .cuadrillas-btn-cargar {
                    background-color: #ef4444;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .cuadrillas-btn-cargar:hover {
                    background-color: #dc2626;
                }
                
                .cuadrillas-btn-crear {
                    background-color: #ffffff;
                    color: #1e3a8a;
                    border: 2px solid #1e3a8a;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .cuadrillas-btn-crear:hover {
                    background-color: #f3f4f6;
                }
                
                .cuadrillas-btn-limpiar {
                    background-color: #6b7280;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .cuadrillas-btn-limpiar:hover {
                    background-color: #4b5563;
                }
                
                .cuadrillas-search-container {
                    margin-bottom: 25px;
                    text-align: center;
                }
                
                .cuadrillas-search-input {
                    width: 100%;
                    max-width: 500px;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 16px;
                    background: white;
                }
                
                .cuadrillas-search-input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                }
                
                .cuadrillas-table {
                    width: 100%;
                    min-width: 100%;
                    border-collapse: collapse;
                    background-color: white;
                    table-layout: auto;
                    margin: 0;
                    padding: 0;
                }
                
                .cuadrillas-table th {
                    background: white;
                    color: #374151;
                    font-weight: 600;
                    padding: 12px;
                    text-align: left;
                    font-size: 14px;
                    text-transform: uppercase;
                    border: 1px solid #d1d5db;
                }
                
                .cuadrillas-table td {
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    color: #374151;
                    font-size: 14px;
                }
                
                .cuadrillas-table tbody tr:hover {
                    background-color: #f9fafb;
                }
                
                .cuadrillas-acciones {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                .cuadrillas-btn-ver, .cuadrillas-btn-editar {
                    color: #3b82f6;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                
                .cuadrillas-btn-eliminar {
                    color: #ef4444;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                
                .cuadrillas-btn-ver:hover, .cuadrillas-btn-editar:hover {
                    background-color: #f0f9ff;
                    border-radius: 4px;
                }
                
                .cuadrillas-btn-eliminar:hover {
                    background-color: #fef2f2;
                    border-radius: 4px;
                }
                
                .cuadrillas-icon {
                    width: 18px;
                    height: 18px;
                }
                
                .cuadrillas-sortable {
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.3s ease;
                }
                
                .cuadrillas-sortable:hover {
                    background-color: #f9fafb;
                }
                
                .cuadrillas-sortable.asc::after {
                    content: ' ▲';
                    color: #60a5fa;
                    font-weight: bold;
                }
                
                .cuadrillas-sortable.desc::after {
                    content: ' ▼';
                    color: #60a5fa;
                    font-weight: bold;
                }
                
                .cuadrillas-filter-row {
                    background-color: #f9fafb;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .cuadrillas-filter-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    background-color: white;
                    transition: all 0.3s ease;
                }
                
                .cuadrillas-filter-input:focus {
                    outline: none;
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
                    transform: translateY(-1px);
                }
            </style>
            
            <div class="cuadrillas-container">
                <h1 class="cuadrillas-titulo">Gestión de Cuadrillas</h1>
                
                <div class="cuadrillas-botones">
                    <button class="cuadrillas-btn-descargar" onclick="descargarPlantillaCuadrillas()">
                        <i class="fas fa-download"></i> Descargar Archivo
                    </button>
                    <button class="cuadrillas-btn-cargar" onclick="guardarPlantillaCuadrillas()">
                        <i class="fas fa-upload"></i> Cargar Archivo
                    </button>
                    <button class="cuadrillas-btn-crear" onclick="mostrarModalNuevaCuadrilla()">
                        <i class="fas fa-plus"></i> Crear Nuevo
                    </button>
                    <button class="cuadrillas-btn-limpiar" onclick="limpiarFiltrosCuadrillas()">
                        <i class="fas fa-filter"></i> Limpiar Filtros
                    </button>
                </div>
                
                <div class="cuadrillas-search-container">
                    <input type="text" id="buscarCuadrillas" class="cuadrillas-search-input" placeholder="🔍 Buscar en todas las cuadrillas...">
                </div>
                
                <table class="cuadrillas-table" id="tablaCuadrillasMinimalista">
                    <thead>
                        <tr>
                            <th class="cuadrillas-sortable" data-sort="0" onclick="ordenarTablaCuadrillas(0)">ID Cuadrilla</th>
                            <th class="cuadrillas-sortable" data-sort="1" onclick="ordenarTablaCuadrillas(1)">Nombre Cuadrilla</th>
                            <th class="cuadrillas-sortable" data-sort="2" onclick="ordenarTablaCuadrillas(2)">Supervisor</th>
                            <th class="cuadrillas-sortable" data-sort="3" onclick="ordenarTablaCuadrillas(3)">Especialidad</th>
                            <th class="cuadrillas-sortable" data-sort="4" onclick="ordenarTablaCuadrillas(4)">Miembros</th>
                            <th class="cuadrillas-sortable" data-sort="5" onclick="ordenarTablaCuadrillas(5)">Proyecto Asignado</th>
                            <th class="cuadrillas-sortable" data-sort="6" onclick="ordenarTablaCuadrillas(6)">Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="cuadrillas-filter-row">
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaCuadrillas(0, this.value)"></td>
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar nombre..." onkeyup="filtrarPorColumnaCuadrillas(1, this.value)"></td>
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar supervisor..." onkeyup="filtrarPorColumnaCuadrillas(2, this.value)"></td>
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar especialidad..." onkeyup="filtrarPorColumnaCuadrillas(3, this.value)"></td>
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar miembros..." onkeyup="filtrarPorColumnaCuadrillas(4, this.value)"></td>
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar proyecto..." onkeyup="filtrarPorColumnaCuadrillas(5, this.value)"></td>
                            <td><input type="text" class="cuadrillas-filter-input" placeholder="Filtrar estado..." onkeyup="filtrarPorColumnaCuadrillas(6, this.value)"></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>C001</td>
                            <td>Cuadrilla Alfa</td>
                            <td>Juan Pérez</td>
                            <td>Construcción</td>
                            <td>8</td>
                            <td>Proyecto Centro Comercial</td>
                            <td>Activa</td>
                            <td>
                                <div class="cuadrillas-acciones">
                                    <button class="cuadrillas-btn-ver" onclick="verCuadrilla('C001')">
                                        <i class="fas fa-eye cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-editar" onclick="editarCuadrilla('C001')">
                                        <i class="fas fa-edit cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-eliminar" onclick="eliminarCuadrilla('C001')">
                                        <i class="fas fa-trash cuadrillas-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C002</td>
                            <td>Cuadrilla Beta</td>
                            <td>María García</td>
                            <td>Electricidad</td>
                            <td>6</td>
                            <td>Proyecto Residencial Norte</td>
                            <td>Activa</td>
                            <td>
                                <div class="cuadrillas-acciones">
                                    <button class="cuadrillas-btn-ver" onclick="verCuadrilla('C002')">
                                        <i class="fas fa-eye cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-editar" onclick="editarCuadrilla('C002')">
                                        <i class="fas fa-edit cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-eliminar" onclick="eliminarCuadrilla('C002')">
                                        <i class="fas fa-trash cuadrillas-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C003</td>
                            <td>Cuadrilla Gamma</td>
                            <td>Carlos López</td>
                            <td>Plomería</td>
                            <td>5</td>
                            <td>Proyecto Hospital Municipal</td>
                            <td>En Descanso</td>
                            <td>
                                <div class="cuadrillas-acciones">
                                    <button class="cuadrillas-btn-ver" onclick="verCuadrilla('C003')">
                                        <i class="fas fa-eye cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-editar" onclick="editarCuadrilla('C003')">
                                        <i class="fas fa-edit cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-eliminar" onclick="eliminarCuadrilla('C003')">
                                        <i class="fas fa-trash cuadrillas-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C004</td>
                            <td>Cuadrilla Delta</td>
                            <td>Ana Rodríguez</td>
                            <td>Pintura</td>
                            <td>4</td>
                            <td>Proyecto Escuela Primaria</td>
                            <td>Activa</td>
                            <td>
                                <div class="cuadrillas-acciones">
                                    <button class="cuadrillas-btn-ver" onclick="verCuadrilla('C004')">
                                        <i class="fas fa-eye cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-editar" onclick="editarCuadrilla('C004')">
                                        <i class="fas fa-edit cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-eliminar" onclick="eliminarCuadrilla('C004')">
                                        <i class="fas fa-trash cuadrillas-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>C005</td>
                            <td>Cuadrilla Épsilon</td>
                            <td>Luis Martínez</td>
                            <td>Mecánica</td>
                            <td>7</td>
                            <td>Proyecto Centro Deportivo</td>
                            <td>Activa</td>
                            <td>
                                <div class="cuadrillas-acciones">
                                    <button class="cuadrillas-btn-ver" onclick="verCuadrilla('C005')">
                                        <i class="fas fa-eye cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-editar" onclick="editarCuadrilla('C005')">
                                        <i class="fas fa-edit cuadrillas-icon"></i>
                                    </button>
                                    <button class="cuadrillas-btn-eliminar" onclick="eliminarCuadrilla('C005')">
                                        <i class="fas fa-trash cuadrillas-icon"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getWelcomeContent() {
        return `
            <div style="padding: 20px; text-align: center;">
                <h1>Bienvenido</h1>
                <p>Selecciona una opción del menú lateral para comenzar</p>
            </div>
        `;
    }
}

// Variables globales para el estado de la tabla de materiales
let ordenActualMateriales = {};
let filtrosActualesMateriales = {};

// Función para limpiar filtros de materiales
function limpiarFiltrosMateriales() {
    const filterInputs = document.querySelectorAll('.materiales-filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    const buscarInput = document.getElementById('buscarMateriales');
    if (buscarInput) {
        buscarInput.value = '';
    }
    
    const filas = document.querySelectorAll('#tablaMaterialesMinimalista tbody tr');
    filas.forEach(fila => {
        fila.style.display = 'table-row';
    });
    
    filtrosActualesMateriales = {};
    console.log('🧹 Filtros limpiados');
}

// Función para ordenar tabla de materiales
function ordenarTablaMateriales(columna) {
    const tabla = document.getElementById('tablaMaterialesMinimalista');
    if (!tabla) {
        console.log('❌ Tabla no encontrada');
        return;
    }
    
    const tbody = tabla.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    const direccion = ordenActualMateriales[columna] === 'asc' ? 'desc' : 'asc';
    
    Object.keys(ordenActualMateriales).forEach(col => {
        ordenActualMateriales[col] = '';
    });
    ordenActualMateriales[columna] = direccion;
    
    filas.sort((a, b) => {
        const valorA = a.cells[columna].textContent.trim();
        const valorB = b.cells[columna].textContent.trim();
        
        if (direccion === 'asc') {
            return valorA.localeCompare(valorB);
        } else {
            return valorB.localeCompare(valorA);
        }
    });
    
    filas.forEach(fila => {
        tbody.appendChild(fila);
    });
    
    actualizarIconosOrdenamientoMateriales();
    console.log('📊 Tabla ordenada por columna:', columna, 'dirección:', direccion);
}

// Función para actualizar iconos de ordenamiento de materiales
function actualizarIconosOrdenamientoMateriales() {
    const headers = document.querySelectorAll('.materiales-sortable');
    headers.forEach((header, index) => {
        const columna = header.getAttribute('data-sort');
        
        if (ordenActualMateriales[columna] === 'asc') {
            header.classList.add('asc');
            header.classList.remove('desc');
        } else if (ordenActualMateriales[columna] === 'desc') {
            header.classList.add('desc');
            header.classList.remove('asc');
        } else {
            header.classList.remove('asc', 'desc');
        }
    });
}

// Función para filtrar por columna en materiales
function filtrarPorColumnaMateriales(columna, valor) {
    filtrosActualesMateriales[columna] = valor.toLowerCase();
    aplicarFiltrosMateriales();
}

// Función para aplicar todos los filtros de materiales
function aplicarFiltrosMateriales() {
    const filas = document.querySelectorAll('#tablaMaterialesMinimalista tbody tr');
    const buscarInput = document.getElementById('buscarMateriales');
    const busquedaGlobal = buscarInput ? buscarInput.value.toLowerCase() : '';
    
    filas.forEach(fila => {
        let mostrarFila = true;
        
        // Aplicar filtros por columna
        Object.keys(filtrosActualesMateriales).forEach(columna => {
            const valorFiltro = filtrosActualesMateriales[columna];
            if (valorFiltro) {
                const valorCelda = fila.cells[columna].textContent.toLowerCase();
                if (!valorCelda.includes(valorFiltro)) {
                    mostrarFila = false;
                }
            }
        });
        
        // Aplicar búsqueda global
        if (busquedaGlobal && mostrarFila) {
            const textoFila = fila.textContent.toLowerCase();
            if (!textoFila.includes(busquedaGlobal)) {
                mostrarFila = false;
            }
        }
        
        fila.style.display = mostrarFila ? 'table-row' : 'none';
    });
    
    const filasVisibles = document.querySelectorAll('#tablaMaterialesMinimalista tbody tr[style="display: table-row;"]').length;
    console.log('🔍 Búsqueda aplicada:', busquedaGlobal);
    console.log('📊 Filas visibles:', filasVisibles);
}

// Inicializar funcionalidad de materiales cuando se carga la página
function inicializarMateriales() {
    console.log('🚀 Inicializando funcionalidad de materiales...');
    
    const tabla = document.getElementById('tablaMaterialesMinimalista');
    if (!tabla) {
        console.log('❌ Tabla no encontrada, reintentando...');
        return false;
    }
    
    const headers = document.querySelectorAll('.materiales-sortable');
    console.log('📋 Headers encontrados:', headers.length);
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            ordenarTablaMateriales(index);
        });
    });
    
    const buscarInput = document.getElementById('buscarMateriales');
    if (buscarInput) {
        console.log('✅ Campo de búsqueda encontrado:', buscarInput);
        buscarInput.addEventListener('input', (e) => {
            console.log('🔍 Búsqueda iniciada:', e.target.value);
            aplicarFiltrosMateriales();
        });
        console.log('✅ Event listener agregado al campo de búsqueda');
    } else {
        console.log('❌ Campo de búsqueda NO encontrado');
        return false;
    }
    
    const filterInputs = document.querySelectorAll('.materiales-filter-input');
    console.log('🔍 Filtros encontrados:', filterInputs.length);
    filterInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            filtrarPorColumnaMateriales(index, e.target.value);
        });
    });
    
    console.log('✅ Funcionalidad de materiales inicializada correctamente');
    return true;
}

// Funciones de acción para materiales
function descargarPlantillaMateriales() {
    alert('Función: Descargar plantilla de materiales');
}

function guardarPlantillaMateriales() {
    alert('Función: Guardar plantilla de materiales');
}

function mostrarModalNuevoMaterial() {
    const modalHTML = `
        <div class="modal-overlay" id="modalNuevoMaterial" style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0, 0, 0, 0.5) !important; display: flex !important; justify-content: center !important; align-items: center !important; z-index: 99999 !important;">
            <div class="modal-container" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; position: relative;">
                <!-- Header del Modal -->
                <div class="modal-header" style="padding: 24px 32px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="modal-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">NUEVO MATERIAL</h2>
                    <button class="modal-close" onclick="cerrarModalNuevoMaterial()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 6px; transition: all 0.3s ease;">&times;</button>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="modal-content" style="padding: 24px 32px; display: flex; gap: 32px;">
                    <!-- Sección Izquierda - Imagen -->
                    <div class="modal-left-section" style="flex: 0 0 200px;">
                        <div class="image-placeholder" style="width: 200px; height: 200px; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb; margin-bottom: 16px;">
                            <div class="image-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
                                <i class="fas fa-box" style="font-size: 32px; color: white;"></i>
                            </div>
                            <div class="image-text" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6b7280; text-align: center;">Imagen del Material</div>
                        </div>
                        <div class="info-box" style="background: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.4;">La imagen se habilitará después de guardar</p>
                        </div>
                    </div>
                    
                    <!-- Sección Derecha - Formulario -->
                    <div class="modal-right-section" style="flex: 1;">
                        <!-- Información del Material -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Información del Material</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Nombre del Material</label>
                                <input type="text" class="form-input" placeholder="Ingrese el nombre del material" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Código del Material</label>
                                <input type="text" class="form-input" placeholder="Ingrese el código del material" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Descripción</label>
                            <textarea class="form-textarea" placeholder="Ingrese una descripción detallada del material" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; min-height: 80px; resize: vertical; transition: border-color 0.3s ease; box-sizing: border-box;"></textarea>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Unidad de Medida</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="unidad">Unidad</option>
                                    <option value="kilogramo">Kilogramo</option>
                                    <option value="metro">Metro</option>
                                    <option value="litro">Litro</option>
                                    <option value="pieza">Pieza</option>
                                    <option value="caja">Caja</option>
                                    <option value="rollo">Rollo</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Categoría</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="materia-prima">Materia Prima</option>
                                    <option value="insumo">Insumo</option>
                                    <option value="producto-terminado">Producto Terminado</option>
                                    <option value="herramienta">Herramienta</option>
                                    <option value="equipo">Equipo</option>
                                    <option value="consumible">Consumible</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Detalles Adicionales -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Detalles Adicionales</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Fecha de Ingreso</label>
                                <input type="date" class="form-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Proveedor (Opcional)</label>
                                <input type="text" class="form-input" placeholder="Nombre del proveedor" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Número de Lote (Opcional)</label>
                            <input type="text" class="form-input" placeholder="Número de lote del material" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                        </div>
                    </div>
                </div>
                
                <!-- Footer del Modal -->
                <div class="modal-footer" style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn-secondary" onclick="cerrarModalNuevoMaterial()" style="padding: 12px 24px; background: white; border: 2px solid #6b7280; color: #6b7280; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                    <button class="btn-primary" onclick="guardarNuevoMaterial()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Guardar Nuevo Material</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de nuevo material creado');
}

function verMaterial(id) {
    alert('Ver material: ' + id);
}

function editarMaterial(id) {
    alert('Editar material: ' + id);
}

function eliminarMaterial(id) {
    if (confirm('¿Estás seguro de que quieres eliminar el material ' + id + '?')) {
        alert('Material eliminado: ' + id);
    }
}

// ================================================================================
// FUNCIONES PARA COLABORADORES
// ================================================================================

// Variables globales para colaboradores
let ordenActualColaboradores = {};
let filtrosActualesColaboradores = {};

function limpiarFiltrosColaboradores() {
    console.log('[COLABORADORES] Limpiando filtros...');
    
    // Limpiar inputs de filtro
    const filterInputs = document.querySelectorAll('.colaboradores-filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    // Limpiar búsqueda global
    const searchInput = document.getElementById('buscarColaboradores');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Limpiar variables
    filtrosActualesColaboradores = {};
    
    // Mostrar todas las filas
    const rows = document.querySelectorAll('#tablaColaboradoresMinimalista tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
    
    console.log('[COLABORADORES] Filtros limpiados');
}

function ordenarTablaColaboradores(columna) {
    console.log('[COLABORADORES] Ordenando por columna:', columna);
    
    const tabla = document.getElementById('tablaColaboradoresMinimalista');
    const tbody = tabla.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    // Cambiar orden
    if (ordenActualColaboradores[columna] === 'asc') {
        ordenActualColaboradores[columna] = 'desc';
    } else {
        ordenActualColaboradores[columna] = 'asc';
    }
    
    // Ordenar filas
    filas.sort((a, b) => {
        const valorA = a.cells[getColumnaIndex(columna)].textContent.trim();
        const valorB = b.cells[getColumnaIndex(columna)].textContent.trim();
        
        let comparacion = 0;
        if (valorA < valorB) comparacion = -1;
        if (valorA > valorB) comparacion = 1;
        
        return ordenActualColaboradores[columna] === 'asc' ? comparacion : -comparacion;
    });
    
    // Reinsertar filas ordenadas
    filas.forEach(fila => tbody.appendChild(fila));
    
    // Actualizar iconos
    actualizarIconosOrdenamientoColaboradores();
    
    console.log('[COLABORADORES] Tabla ordenada');
}

function actualizarIconosOrdenamientoColaboradores() {
    const headers = document.querySelectorAll('.colaboradores-sortable');
    headers.forEach(header => {
        const columna = header.getAttribute('data-sort');
        const icon = header.querySelector('.colaboradores-sort-icon');
        
        if (ordenActualColaboradores[columna]) {
            icon.textContent = ordenActualColaboradores[columna] === 'asc' ? '↑' : '↓';
        } else {
            icon.textContent = '↕';
        }
    });
}

function filtrarPorColumnaColaboradores(columna, valor) {
    console.log('[COLABORADORES] Filtrando columna:', columna, 'valor:', valor);
    filtrosActualesColaboradores[columna] = valor.toLowerCase();
    aplicarFiltrosColaboradores();
}

function aplicarFiltrosColaboradores() {
    console.log('[COLABORADORES] Aplicando filtros...');
    
    const tabla = document.getElementById('tablaColaboradoresMinimalista');
    const filas = tabla.querySelectorAll('tbody tr');
    
    filas.forEach(fila => {
        let mostrar = true;
        
        // Aplicar filtros por columna
        Object.keys(filtrosActualesColaboradores).forEach(columna => {
            const valorFiltro = filtrosActualesColaboradores[columna];
            if (valorFiltro) {
                const valorCelda = fila.cells[getColumnaIndex(columna)].textContent.toLowerCase();
                if (!valorCelda.includes(valorFiltro)) {
                    mostrar = false;
                }
            }
        });
        
        // Aplicar búsqueda global
        const searchInput = document.getElementById('buscarColaboradores');
        if (searchInput && searchInput.value.trim()) {
            const busqueda = searchInput.value.toLowerCase();
            const textoFila = Array.from(fila.cells).map(celda => celda.textContent).join(' ').toLowerCase();
            if (!textoFila.includes(busqueda)) {
                mostrar = false;
            }
        }
        
        fila.style.display = mostrar ? '' : 'none';
    });
    
    console.log('[COLABORADORES] Filtros aplicados');
}

function getColumnaIndex(columna) {
    const columnas = {
        'codigo': 0,
        'nombre': 1,
        'cargo': 2,
        'departamento': 3,
        'email': 4,
        'telefono': 5,
        'estado': 6,
        'fecha_ingreso': 7,
        'supervisor': 8
    };
    return columnas[columna] || 0;
}

function inicializarColaboradores() {
    console.log('[COLABORADORES] Inicializando funcionalidad...');
    
    // Event listeners para ordenamiento
    const sortableHeaders = document.querySelectorAll('.colaboradores-sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const columna = header.getAttribute('data-sort');
            ordenarTablaColaboradores(columna);
        });
    });
    
    // Event listeners para filtros por columna
    const filterInputs = document.querySelectorAll('.colaboradores-filter-input');
    filterInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const columna = e.target.getAttribute('data-filter');
            const valor = e.target.value;
            filtrarPorColumnaColaboradores(columna, valor);
        });
    });
    
    // Event listener para búsqueda global
    const searchInput = document.getElementById('buscarColaboradores');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            aplicarFiltrosColaboradores();
        });
    }
    
    console.log('[COLABORADORES] Funcionalidad inicializada');
}

// Funciones de acción para colaboradores
function descargarPlantillaColaboradores() {
    console.log('[COLABORADORES] Descargando plantilla...');
    alert('Función de descarga de plantilla para colaboradores');
}

function guardarPlantillaColaboradores() {
    console.log('[COLABORADORES] Guardando plantilla...');
    alert('Función de guardado de plantilla para colaboradores');
}

function mostrarModalNuevoColaborador() {
    const modalHTML = `
        <div class="modal-overlay" id="modalNuevoColaborador" style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0, 0, 0, 0.5) !important; display: flex !important; justify-content: center !important; align-items: center !important; z-index: 99999 !important;">
            <div class="modal-container" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; position: relative;">
                <!-- Header del Modal -->
                <div class="modal-header" style="padding: 24px 32px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="modal-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">NUEVO COLABORADOR</h2>
                    <button class="modal-close" onclick="cerrarModalNuevoColaborador()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 6px; transition: all 0.3s ease;">&times;</button>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="modal-content" style="padding: 24px 32px; display: flex; gap: 32px;">
                    <!-- Sección Izquierda - Imagen -->
                    <div class="modal-left-section" style="flex: 0 0 200px;">
                        <div class="image-placeholder" style="width: 200px; height: 200px; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb; margin-bottom: 16px;">
                            <div class="image-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
                                <i class="fas fa-user" style="font-size: 32px; color: white;"></i>
                            </div>
                            <div class="image-text" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6b7280; text-align: center;">Foto del Colaborador</div>
                        </div>
                        <div class="info-box" style="background: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.4;">La foto se habilitará después de guardar</p>
                        </div>
                    </div>
                    
                    <!-- Sección Derecha - Formulario -->
                    <div class="modal-right-section" style="flex: 1;">
                        <!-- Información Personal -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Información Personal</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Nombre</label>
                                <input type="text" class="form-input" placeholder="Ingrese el nombre" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Apellido Paterno</label>
                                <input type="text" class="form-input" placeholder="Ingrese el apellido paterno" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Apellido Materno</label>
                                <input type="text" class="form-input" placeholder="Ingrese el apellido materno" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Email</label>
                                <input type="email" class="form-input" placeholder="Ingrese el email" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <!-- Información Laboral -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Información Laboral</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Cargo</label>
                                <input type="text" class="form-input" placeholder="Ingrese el cargo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Departamento</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="construccion">Construcción</option>
                                    <option value="diseno">Diseño</option>
                                    <option value="operaciones">Operaciones</option>
                                    <option value="finanzas">Finanzas</option>
                                    <option value="recursos-humanos">Recursos Humanos</option>
                                    <option value="tecnologia">Tecnología</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Teléfono</label>
                                <input type="tel" class="form-input" placeholder="Ingrese el teléfono" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Estado</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                    <option value="vacaciones">Vacaciones</option>
                                    <option value="licencia">Licencia</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer del Modal -->
                <div class="modal-footer" style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn-secondary" onclick="cerrarModalNuevoColaborador()" style="padding: 12px 24px; background: white; border: 2px solid #6b7280; color: #6b7280; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                    <button class="btn-primary" onclick="guardarNuevoColaborador()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Guardar Nuevo Colaborador</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de nuevo colaborador creado');
}

function verColaborador(id) {
    console.log('[COLABORADORES] Viendo colaborador:', id);
    alert(`Viendo detalles del colaborador: ${id}`);
}

function editarColaborador(id) {
    console.log('[COLABORADORES] Editando colaborador:', id);
    alert(`Editando colaborador: ${id}`);
}

function eliminarColaborador(id) {
    console.log('[COLABORADORES] Eliminando colaborador:', id);
    if (confirm(`¿Estás seguro de que quieres eliminar el colaborador ${id}?`)) {
        alert(`Colaborador ${id} eliminado`);
    }
}

// Variables globales para el estado de la tabla de vehículos
let ordenActualVehiculos = {};
let filtrosActualesVehiculos = {};

// Función para limpiar filtros de vehículos
function limpiarFiltrosVehiculos() {
    const filterInputs = document.querySelectorAll('.vehiculos-filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    const buscarInput = document.getElementById('buscarVehiculos');
    if (buscarInput) {
        buscarInput.value = '';
    }
    
    const filas = document.querySelectorAll('#tablaVehiculosMinimalista tbody tr');
    filas.forEach(fila => {
        fila.style.display = 'table-row';
    });
    
    filtrosActualesVehiculos = {};
    console.log('🧹 Filtros de vehículos limpiados');
}

// Función para ordenar tabla de vehículos
function ordenarTablaVehiculos(columna) {
    const tabla = document.getElementById('tablaVehiculosMinimalista');
    if (!tabla) {
        console.log('❌ Tabla de vehículos no encontrada');
        return;
    }
    
    const tbody = tabla.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    const direccion = ordenActualVehiculos[columna] === 'asc' ? 'desc' : 'asc';
    
    Object.keys(ordenActualVehiculos).forEach(col => {
        ordenActualVehiculos[col] = '';
    });
    ordenActualVehiculos[columna] = direccion;
    
    filas.sort((a, b) => {
        const valorA = a.cells[columna].textContent.trim();
        const valorB = b.cells[columna].textContent.trim();
        
        if (direccion === 'asc') {
            return valorA.localeCompare(valorB);
        } else {
            return valorB.localeCompare(valorA);
        }
    });
    
    filas.forEach(fila => {
        tbody.appendChild(fila);
    });
    
    actualizarIconosOrdenamientoVehiculos();
    console.log('📊 Tabla de vehículos ordenada por columna:', columna, 'dirección:', direccion);
}

// Función para actualizar iconos de ordenamiento de vehículos
function actualizarIconosOrdenamientoVehiculos() {
    const headers = document.querySelectorAll('.vehiculos-sortable');
    headers.forEach((header, index) => {
        const columna = header.getAttribute('data-sort');
        
        if (ordenActualVehiculos[columna] === 'asc') {
            header.classList.add('asc');
            header.classList.remove('desc');
        } else if (ordenActualVehiculos[columna] === 'desc') {
            header.classList.add('desc');
            header.classList.remove('asc');
        } else {
            header.classList.remove('asc', 'desc');
        }
    });
}

// Función para filtrar por columna en vehículos
function filtrarPorColumnaVehiculos(columna, valor) {
    filtrosActualesVehiculos[columna] = valor.toLowerCase();
    aplicarFiltrosVehiculos();
}

// Función para aplicar filtros de vehículos
function aplicarFiltrosVehiculos() {
    const tabla = document.getElementById('tablaVehiculosMinimalista');
    if (!tabla) return;
    
    const filas = tabla.querySelectorAll('tbody tr');
    
    filas.forEach(fila => {
        let mostrar = true;
        
        Object.keys(filtrosActualesVehiculos).forEach(columna => {
            const valorFiltro = filtrosActualesVehiculos[columna];
            if (valorFiltro) {
                const indiceColumna = getColumnaIndexVehiculos(columna);
                if (indiceColumna !== -1) {
                    const valorCelda = fila.cells[indiceColumna].textContent.toLowerCase();
                    if (!valorCelda.includes(valorFiltro)) {
                        mostrar = false;
                    }
                }
            }
        });
        
        fila.style.display = mostrar ? 'table-row' : 'none';
    });
    
    console.log('🔍 Filtros de vehículos aplicados');
}

// Función para obtener índice de columna en vehículos
function getColumnaIndexVehiculos(columna) {
    const headers = document.querySelectorAll('.vehiculos-sortable');
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].getAttribute('data-sort') === columna) {
            return i;
        }
    }
    return -1;
}

// Función para inicializar funcionalidad de vehículos
function inicializarVehiculos() {
    console.log('🚗 Inicializando funcionalidad de vehículos...');
    
    // Configurar ordenamiento
    const sortableHeaders = document.querySelectorAll('.vehiculos-sortable');
    sortableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            const columna = header.getAttribute('data-sort');
            ordenarTablaVehiculos(index);
        });
    });
    
    // Configurar filtros por columna
    const filterInputs = document.querySelectorAll('.vehiculos-filter-input');
    filterInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const columna = e.target.getAttribute('data-filter');
            const valor = e.target.value;
            filtrarPorColumnaVehiculos(columna, valor);
        });
    });
    
    // Configurar búsqueda global
    const buscarInput = document.getElementById('buscarVehiculos');
    if (buscarInput) {
        buscarInput.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filas = document.querySelectorAll('#tablaVehiculosMinimalista tbody tr');
            
            filas.forEach(fila => {
                const texto = fila.textContent.toLowerCase();
                fila.style.display = texto.includes(termino) ? 'table-row' : 'none';
            });
        });
    }
    
    console.log('✅ Funcionalidad de vehículos inicializada');
}

// Funciones de acción para vehículos
function descargarPlantillaVehiculos() {
    alert('📥 Descargando plantilla de vehículos...');
    console.log('📥 Descarga de plantilla de vehículos');
}

function guardarPlantillaVehiculos() {
    alert('📤 Cargando archivo de vehículos...');
    console.log('📤 Carga de archivo de vehículos');
}

function mostrarModalNuevoVehiculo() {
    const modalHTML = `
        <div class="modal-overlay" id="modalNuevoVehiculo" style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0, 0, 0, 0.5) !important; display: flex !important; justify-content: center !important; align-items: center !important; z-index: 99999 !important;">
            <div class="modal-container" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; position: relative;">
                <!-- Header del Modal -->
                <div class="modal-header" style="padding: 24px 32px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="modal-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">NUEVO VEHÍCULO</h2>
                    <button class="modal-close" onclick="cerrarModalNuevoVehiculo()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 6px; transition: all 0.3s ease;">&times;</button>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="modal-content" style="padding: 24px 32px; display: flex; gap: 32px;">
                    <!-- Sección Izquierda - Imagen -->
                    <div class="modal-left-section" style="flex: 0 0 200px;">
                        <div class="image-placeholder" style="width: 200px; height: 200px; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb; margin-bottom: 16px;">
                            <div class="image-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
                                <i class="fas fa-truck" style="font-size: 32px; color: white;"></i>
                            </div>
                            <div class="image-text" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6b7280; text-align: center;">Imagen del Vehículo</div>
                        </div>
                        <div class="info-box" style="background: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.4;">La imagen se habilitará después de guardar</p>
                        </div>
                    </div>
                    
                    <!-- Sección Derecha - Formulario -->
                    <div class="modal-right-section" style="flex: 1;">
                        <!-- Información del Vehículo -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Información del Vehículo</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Placa</label>
                                <input type="text" class="form-input" placeholder="Ingrese la placa del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">ID Vehículo</label>
                                <input type="text" class="form-input" placeholder="Ingrese el ID del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Marca</label>
                                <input type="text" class="form-input" placeholder="Ingrese la marca del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Modelo</label>
                                <input type="text" class="form-input" placeholder="Ingrese el modelo del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Año</label>
                                <input type="number" class="form-input" placeholder="Ingrese el año del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Tipo de Vehículo</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="camion">Camión</option>
                                    <option value="camioneta">Camioneta</option>
                                    <option value="automovil">Automóvil</option>
                                    <option value="moto">Motocicleta</option>
                                    <option value="maquinaria">Maquinaria Pesada</option>
                                    <option value="trailer">Trailer</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Detalles Adicionales -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Detalles Adicionales</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Estado</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="disponible">Disponible</option>
                                    <option value="en-mantenimiento">En Mantenimiento</option>
                                    <option value="en-uso">En Uso</option>
                                    <option value="fuera-de-servicio">Fuera de Servicio</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Color</label>
                                <input type="text" class="form-input" placeholder="Ingrese el color del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Capacidad (kg)</label>
                                <input type="number" class="form-input" placeholder="Ingrese la capacidad en kg" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Combustible</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="gasolina">Gasolina</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electrico">Eléctrico</option>
                                    <option value="hibrido">Híbrido</option>
                                    <option value="gnv">GNV</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Descripción</label>
                            <textarea class="form-textarea" placeholder="Ingrese una descripción detallada del vehículo" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; min-height: 80px; resize: vertical; transition: border-color 0.3s ease; box-sizing: border-box;"></textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Footer del Modal -->
                <div class="modal-footer" style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn-secondary" onclick="cerrarModalNuevoVehiculo()" style="padding: 12px 24px; background: white; border: 2px solid #6b7280; color: #6b7280; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                    <button class="btn-primary" onclick="guardarNuevoVehiculo()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Guardar Nuevo Vehículo</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de nuevo vehículo creado');
}

function verVehiculo(id) {
    alert(`👁️ Viendo vehículo: ${id}`);
    console.log('👁️ Ver vehículo:', id);
}

function editarVehiculo(id) {
    alert(`✏️ Editando vehículo: ${id}`);
    console.log('✏️ Editar vehículo:', id);
}

function eliminarVehiculo(id) {
    if (confirm(`🗑️ ¿Estás seguro de que quieres eliminar el vehículo ${id}?`)) {
        alert(`🗑️ Vehículo ${id} eliminado`);
        console.log('🗑️ Eliminar vehículo:', id);
    }
}

// Variables globales para el estado de la tabla de proyectos
let ordenActualProyectos = {};
let filtrosActualesProyectos = {};

// Función para limpiar filtros de proyectos
function limpiarFiltrosProyectos() {
    const filterInputs = document.querySelectorAll('.proyectos-filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    const buscarInput = document.getElementById('buscarProyectos');
    if (buscarInput) {
        buscarInput.value = '';
    }
    
    const filas = document.querySelectorAll('#tablaProyectosMinimalista tbody tr');
    filas.forEach(fila => {
        fila.style.display = 'table-row';
    });
    
    filtrosActualesProyectos = {};
    console.log('🧹 Filtros de proyectos limpiados');
}

// Función para ordenar tabla de proyectos
function ordenarTablaProyectos(columna) {
    const tabla = document.getElementById('tablaProyectosMinimalista');
    if (!tabla) {
        console.log('❌ Tabla de proyectos no encontrada');
        return;
    }
    
    const tbody = tabla.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    const direccion = ordenActualProyectos[columna] === 'asc' ? 'desc' : 'asc';
    
    Object.keys(ordenActualProyectos).forEach(col => {
        ordenActualProyectos[col] = '';
    });
    ordenActualProyectos[columna] = direccion;
    
    filas.sort((a, b) => {
        const valorA = a.cells[columna].textContent.trim();
        const valorB = b.cells[columna].textContent.trim();
        
        if (direccion === 'asc') {
            return valorA.localeCompare(valorB);
        } else {
            return valorB.localeCompare(valorA);
        }
    });
    
    filas.forEach(fila => {
        tbody.appendChild(fila);
    });
    
    actualizarIconosOrdenamientoProyectos();
    console.log('📊 Tabla de proyectos ordenada por columna:', columna, 'dirección:', direccion);
}

// Función para actualizar iconos de ordenamiento de proyectos
function actualizarIconosOrdenamientoProyectos() {
    const headers = document.querySelectorAll('.proyectos-sortable');
    headers.forEach((header, index) => {
        const columna = header.getAttribute('data-sort');
        
        if (ordenActualProyectos[columna] === 'asc') {
            header.classList.add('asc');
            header.classList.remove('desc');
        } else if (ordenActualProyectos[columna] === 'desc') {
            header.classList.add('desc');
            header.classList.remove('asc');
        } else {
            header.classList.remove('asc', 'desc');
        }
    });
}

// Función para filtrar por columna en proyectos
function filtrarPorColumnaProyectos(columna, valor) {
    filtrosActualesProyectos[columna] = valor.toLowerCase();
    aplicarFiltrosProyectos();
}

// Función para aplicar filtros de proyectos
function aplicarFiltrosProyectos() {
    const filas = document.querySelectorAll('#tablaProyectosMinimalista tbody tr');
    
    filas.forEach(fila => {
        let mostrar = true;
        
        Object.keys(filtrosActualesProyectos).forEach(columna => {
            const valorFiltro = filtrosActualesProyectos[columna];
            if (valorFiltro) {
                const celda = fila.cells[parseInt(columna)];
                if (celda) {
                    const valorCelda = celda.textContent.toLowerCase();
                    if (!valorCelda.includes(valorFiltro)) {
                        mostrar = false;
                    }
                }
            }
        });
        
        fila.style.display = mostrar ? 'table-row' : 'none';
    });
    
    console.log('🔍 Filtros de proyectos aplicados');
}

// Función para obtener índice de columna en proyectos
function getColumnaIndexProyectos(columna) {
    const headers = document.querySelectorAll('.proyectos-sortable');
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].getAttribute('data-sort') === columna) {
            return i;
        }
    }
    return -1;
}

// Función para inicializar funcionalidad de proyectos
function inicializarProyectos() {
    console.log('📋 Inicializando funcionalidad de proyectos...');
    
    // Configurar ordenamiento
    const sortableHeaders = document.querySelectorAll('.proyectos-sortable');
    sortableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            const columna = header.getAttribute('data-sort');
            ordenarTablaProyectos(index);
        });
    });
    
    // Configurar filtros por columna
    const filterInputs = document.querySelectorAll('.proyectos-filter-input');
    filterInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const columna = e.target.getAttribute('data-filter');
            const valor = e.target.value;
            filtrarPorColumnaProyectos(columna, valor);
        });
    });
    
    // Configurar búsqueda global
    const buscarInput = document.getElementById('buscarProyectos');
    if (buscarInput) {
        buscarInput.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filas = document.querySelectorAll('#tablaProyectosMinimalista tbody tr');
            
            filas.forEach(fila => {
                const texto = fila.textContent.toLowerCase();
                fila.style.display = texto.includes(termino) ? 'table-row' : 'none';
            });
        });
    }
    
    console.log('✅ Funcionalidad de proyectos inicializada');
}

// Funciones de acción para proyectos
function descargarPlantillaProyectos() {
    alert('📥 Descargando plantilla de proyectos...');
    console.log('📥 Descarga de plantilla de proyectos');
}

function guardarPlantillaProyectos() {
    alert('📤 Cargando archivo de proyectos...');
    console.log('📤 Carga de archivo de proyectos');
}

function mostrarModalNuevoProyecto() {
    const modalHTML = `
        <div class="modal-overlay" id="modalNuevoProyecto" style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0, 0, 0, 0.5) !important; display: flex !important; justify-content: center !important; align-items: center !important; z-index: 99999 !important;">
            <div class="modal-container" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; position: relative;">
                <!-- Header del Modal -->
                <div class="modal-header" style="padding: 24px 32px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="modal-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">NUEVO PROYECTO</h2>
                    <button class="modal-close" onclick="cerrarModalNuevoProyecto()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 6px; transition: all 0.3s ease;">&times;</button>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="modal-content" style="padding: 24px 32px; display: flex; gap: 32px;">
                    <!-- Sección Izquierda - Imagen -->
                    <div class="modal-left-section" style="flex: 0 0 200px;">
                        <div class="image-placeholder" style="width: 200px; height: 200px; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb; margin-bottom: 16px;">
                            <div class="image-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
                                <i class="fas fa-project-diagram" style="font-size: 32px; color: white;"></i>
                            </div>
                            <div class="image-text" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6b7280; text-align: center;">Logo del Proyecto</div>
                        </div>
                        <div class="info-box" style="background: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.4;">El logo se habilitará después de guardar</p>
                        </div>
                    </div>
                    
                    <!-- Sección Derecha - Formulario -->
                    <div class="modal-right-section" style="flex: 1;">
                        <!-- Información del Proyecto -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Información del Proyecto</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Nombre del Proyecto</label>
                                <input type="text" class="form-input" placeholder="Ingrese el nombre del proyecto" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Cliente</label>
                                <input type="text" class="form-input" placeholder="Ingrese el nombre del cliente" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Descripción</label>
                            <textarea class="form-textarea" placeholder="Ingrese una descripción detallada del proyecto" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; min-height: 80px; resize: vertical; transition: border-color 0.3s ease; box-sizing: border-box;"></textarea>
                        </div>
                        
                        <!-- Fechas y Estado -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Fechas y Estado</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Fecha de Inicio</label>
                                <input type="date" class="form-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Fecha de Fin</label>
                                <input type="date" class="form-input" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Estado</label>
                                <select class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="">Seleccione</option>
                                    <option value="planificado">Planificado</option>
                                    <option value="en-progreso">En Progreso</option>
                                    <option value="completado">Completado</option>
                                    <option value="suspendido">Suspendido</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Presupuesto</label>
                                <input type="number" class="form-input" placeholder="Ingrese el presupuesto" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer del Modal -->
                <div class="modal-footer" style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn-secondary" onclick="cerrarModalNuevoProyecto()" style="padding: 12px 24px; background: white; border: 2px solid #6b7280; color: #6b7280; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                    <button class="btn-primary" onclick="guardarNuevoProyecto()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Guardar Nuevo Proyecto</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de nuevo proyecto creado');
}

function verProyecto(id) {
    alert(`👁️ Viendo proyecto: ${id}`);
    console.log('👁️ Ver proyecto:', id);
}

function editarProyecto(id) {
    alert(`✏️ Editando proyecto: ${id}`);
    console.log('✏️ Editar proyecto:', id);
}

function eliminarProyecto(id) {
    if (confirm(`🗑️ ¿Estás seguro de que quieres eliminar el proyecto ${id}?`)) {
        alert(`🗑️ Proyecto ${id} eliminado`);
        console.log('🗑️ Eliminar proyecto:', id);
    }
}

// Variables globales para el estado de la tabla de cuadrillas
let ordenActualCuadrillas = {};
let filtrosActualesCuadrillas = {};

// Función para limpiar filtros de cuadrillas
function limpiarFiltrosCuadrillas() {
    const filterInputs = document.querySelectorAll('.cuadrillas-filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    const buscarInput = document.getElementById('buscarCuadrillas');
    if (buscarInput) {
        buscarInput.value = '';
    }
    
    const filas = document.querySelectorAll('#tablaCuadrillasMinimalista tbody tr');
    filas.forEach(fila => {
        fila.style.display = 'table-row';
    });
    
    filtrosActualesCuadrillas = {};
    console.log('🧹 Filtros de cuadrillas limpiados');
}

// Función para ordenar tabla de cuadrillas
function ordenarTablaCuadrillas(columna) {
    const tabla = document.getElementById('tablaCuadrillasMinimalista');
    if (!tabla) {
        console.log('❌ Tabla de cuadrillas no encontrada');
        return;
    }
    
    const tbody = tabla.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    const direccion = ordenActualCuadrillas[columna] === 'asc' ? 'desc' : 'asc';
    
    Object.keys(ordenActualCuadrillas).forEach(col => {
        ordenActualCuadrillas[col] = '';
    });
    ordenActualCuadrillas[columna] = direccion;
    
    filas.sort((a, b) => {
        const valorA = a.cells[columna].textContent.trim();
        const valorB = b.cells[columna].textContent.trim();
        
        if (direccion === 'asc') {
            return valorA.localeCompare(valorB);
        } else {
            return valorB.localeCompare(valorA);
        }
    });
    
    filas.forEach(fila => {
        tbody.appendChild(fila);
    });
    
    actualizarIconosOrdenamientoCuadrillas();
    console.log('📊 Tabla de cuadrillas ordenada por columna:', columna, 'dirección:', direccion);
}

// Función para actualizar iconos de ordenamiento de cuadrillas
function actualizarIconosOrdenamientoCuadrillas() {
    const headers = document.querySelectorAll('.cuadrillas-sortable');
    headers.forEach((header, index) => {
        const columna = header.getAttribute('data-sort');
        
        if (ordenActualCuadrillas[columna] === 'asc') {
            header.classList.add('asc');
            header.classList.remove('desc');
        } else if (ordenActualCuadrillas[columna] === 'desc') {
            header.classList.add('desc');
            header.classList.remove('asc');
        } else {
            header.classList.remove('asc', 'desc');
        }
    });
}

// Función para filtrar por columna en cuadrillas
function filtrarPorColumnaCuadrillas(columna, valor) {
    filtrosActualesCuadrillas[columna] = valor.toLowerCase();
    aplicarFiltrosCuadrillas();
}

// Función para aplicar filtros de cuadrillas
function aplicarFiltrosCuadrillas() {
    const filas = document.querySelectorAll('#tablaCuadrillasMinimalista tbody tr');
    
    filas.forEach(fila => {
        if (fila.classList.contains('cuadrillas-filter-row')) {
            return; // Saltar la fila de filtros
        }
        
        let mostrar = true;
        
        Object.keys(filtrosActualesCuadrillas).forEach(columna => {
            const valor = filtrosActualesCuadrillas[columna];
            if (valor && valor.trim() !== '') {
                const celda = fila.cells[parseInt(columna)];
                if (celda) {
                    const contenido = celda.textContent.toLowerCase();
                    if (!contenido.includes(valor)) {
                        mostrar = false;
                    }
                }
            }
        });
        
        fila.style.display = mostrar ? 'table-row' : 'none';
    });
    
    console.log('🔍 Filtros de cuadrillas aplicados');
}

// Función para obtener índice de columna por nombre
function getColumnaIndexCuadrillas(columna) {
    const headers = document.querySelectorAll('#tablaCuadrillasMinimalista th');
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent.toLowerCase().includes(columna.toLowerCase())) {
            return i;
        }
    }
    return -1;
}

// Función para inicializar cuadrillas
function inicializarCuadrillas() {
    console.log('🚀 Inicializando cuadrillas...');
    
    // Configurar búsqueda global
    const buscarInput = document.getElementById('buscarCuadrillas');
    if (buscarInput) {
        buscarInput.addEventListener('input', function() {
            const valor = this.value.toLowerCase();
            const filas = document.querySelectorAll('#tablaCuadrillasMinimalista tbody tr');
            
            filas.forEach(fila => {
                if (fila.classList.contains('cuadrillas-filter-row')) {
                    return; // Saltar la fila de filtros
                }
                
                const celdas = fila.querySelectorAll('td');
                let mostrar = false;
                
                celdas.forEach(celda => {
                    if (celda.textContent.toLowerCase().includes(valor)) {
                        mostrar = true;
                    }
                });
                
                fila.style.display = mostrar ? 'table-row' : 'none';
            });
            
            console.log('🔍 Búsqueda global de cuadrillas:', valor);
        });
    }
    
    console.log('✅ Cuadrillas inicializadas correctamente');
}

// Función para descargar plantilla de cuadrillas
function descargarPlantillaCuadrillas() {
    console.log('📥 Descargando plantilla de cuadrillas...');
    alert('Descargando plantilla de cuadrillas...');
}

// Función para guardar plantilla de cuadrillas
function guardarPlantillaCuadrillas() {
    console.log('📤 Guardando plantilla de cuadrillas...');
    alert('Guardando plantilla de cuadrillas...');
}

// Función para mostrar modal de nueva cuadrilla
function mostrarModalNuevaCuadrilla() {
    console.log('➕ Mostrando modal de nueva cuadrilla...');
    alert('Mostrando modal de nueva cuadrilla...');
}

// Función para ver cuadrilla
function verCuadrilla(id) {
    console.log('[CUADRILLAS] Viendo cuadrilla:', id);
    alert(`Viendo cuadrilla: ${id}`);
}

// Función para editar cuadrilla
function editarCuadrilla(id) {
    console.log('[CUADRILLAS] Editando cuadrilla:', id);
    alert(`Editando cuadrilla: ${id}`);
}

// Función para eliminar cuadrilla
function eliminarCuadrilla(id) {
    console.log('[CUADRILLAS] Eliminando cuadrilla:', id);
    if (confirm(`¿Estás seguro de que quieres eliminar la cuadrilla ${id}?`)) {
        alert(`Cuadrilla ${id} eliminada`);
    }
}

// Función para cerrar modal de nuevo material
function cerrarModalNuevoMaterial() {
    const modal = document.getElementById('modalNuevoMaterial');
    if (modal) {
        modal.remove();
        console.log('Modal de nuevo material cerrado');
    }
}

// Función para guardar nuevo material
function guardarNuevoMaterial() {
    const modal = document.getElementById('modalNuevoMaterial');
    if (!modal) {
        alert('Error: No se puede encontrar el modal. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener elementos del formulario con validación
    const nombreInput = modal.querySelector('input[placeholder="Ingrese el nombre del material"]');
    const codigoInput = modal.querySelector('input[placeholder="Ingrese el código del material"]');
    const descripcionInput = modal.querySelector('textarea');
    const unidadSelect = modal.querySelector('select:nth-of-type(1)');
    const categoriaSelect = modal.querySelector('select:nth-of-type(2)');
    const fechaInput = modal.querySelector('input[type="date"]');
    const proveedorInput = modal.querySelector('input[placeholder="Nombre del proveedor"]');
    const loteInput = modal.querySelector('input[placeholder="Número de lote del material"]');
    
    // Verificar que los elementos existen
    if (!nombreInput || !codigoInput) {
        alert('Error: No se pueden encontrar los campos del formulario. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener valores
    const nombre = nombreInput.value;
    const codigo = codigoInput.value;
    const descripcion = descripcionInput ? descripcionInput.value : '';
    const unidad = unidadSelect ? unidadSelect.value : '';
    const categoria = categoriaSelect ? categoriaSelect.value : '';
    const fecha = fechaInput ? fechaInput.value : '';
    const proveedor = proveedorInput ? proveedorInput.value : '';
    const lote = loteInput ? loteInput.value : '';
    
    // Validar campos obligatorios
    if (!nombre || !codigo) {
        alert('Por favor complete los campos obligatorios: Nombre del Material y Código del Material');
        return;
    }
    
    // Generar ID único
    const nuevoId = 'M' + (Math.floor(Math.random() * 900) + 100);
    
    // Generar precio aleatorio para demostración
    const precio = '$' + (Math.random() * 50 + 5).toFixed(2);
    
    // Generar stock aleatorio para demostración
    const stock = Math.floor(Math.random() * 200) + 10;
    
    // Crear nueva fila para la tabla (coincide con las columnas de la tabla)
    const nuevaFila = `
        <tr>
            <td>${nuevoId}</td>
            <td>${nombre}</td>
            <td>${categoria || 'Sin especificar'}</td>
            <td>${stock}</td>
            <td>${unidad || 'Sin especificar'}</td>
            <td>${precio}</td>
            <td>${proveedor || 'N/A'}</td>
            <td>
                <div class="materiales-acciones">
                    <button class="materiales-btn-ver" onclick="verMaterial('${nuevoId}')">
                        <i class="fas fa-eye materiales-icon"></i>
                    </button>
                    <button class="materiales-btn-editar" onclick="editarMaterial('${nuevoId}')">
                        <i class="fas fa-edit materiales-icon"></i>
                    </button>
                    <button class="materiales-btn-eliminar" onclick="eliminarMaterial('${nuevoId}')">
                        <i class="fas fa-trash materiales-icon"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    
    // Agregar la nueva fila a la tabla
    const tabla = document.getElementById('tablaMaterialesMinimalista');
    const tbody = tabla.querySelector('tbody');
    const filaFiltros = tbody.querySelector('.materiales-filter-row');
    
    // Insertar después de la fila de filtros
    if (filaFiltros) {
        filaFiltros.insertAdjacentHTML('afterend', nuevaFila);
    } else {
        tbody.insertAdjacentHTML('beforeend', nuevaFila);
    }
    
    // Limpiar formulario con validación
    if (nombreInput) nombreInput.value = '';
    if (codigoInput) codigoInput.value = '';
    if (descripcionInput) descripcionInput.value = '';
    if (unidadSelect) unidadSelect.value = '';
    if (categoriaSelect) categoriaSelect.value = '';
    if (fechaInput) fechaInput.value = '';
    if (proveedorInput) proveedorInput.value = '';
    if (loteInput) loteInput.value = '';
    
    alert('Nuevo material guardado exitosamente');
    cerrarModalNuevoMaterial();
}

// Función para cerrar modal de nuevo vehículo
function cerrarModalNuevoVehiculo() {
    const modal = document.getElementById('modalNuevoVehiculo');
    if (modal) {
        modal.remove();
        console.log('Modal de nuevo vehículo cerrado');
    }
}

// Función para guardar nuevo vehículo
function guardarNuevoVehiculo() {
    const modal = document.getElementById('modalNuevoVehiculo');
    if (!modal) {
        alert('Error: No se puede encontrar el modal. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener elementos del formulario con validación
    const placaInput = modal.querySelector('input[placeholder="Ingrese la placa del vehículo"]');
    const idInput = modal.querySelector('input[placeholder="Ingrese el ID del vehículo"]');
    const marcaInput = modal.querySelector('input[placeholder="Ingrese la marca del vehículo"]');
    const modeloInput = modal.querySelector('input[placeholder="Ingrese el modelo del vehículo"]');
    const añoInput = modal.querySelector('input[placeholder="Ingrese el año del vehículo"]');
    const tipoSelect = modal.querySelector('select:nth-of-type(1)');
    const estadoSelect = modal.querySelector('select:nth-of-type(2)');
    const colorInput = modal.querySelector('input[placeholder="Ingrese el color del vehículo"]');
    const capacidadInput = modal.querySelector('input[placeholder="Ingrese la capacidad en kg"]');
    const combustibleSelect = modal.querySelector('select:nth-of-type(3)');
    const descripcionInput = modal.querySelector('textarea');
    
    // Verificar que los elementos existen
    if (!placaInput || !marcaInput || !modeloInput) {
        alert('Error: No se pueden encontrar los campos del formulario. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener valores
    const placa = placaInput.value;
    const id = idInput ? idInput.value : '';
    const marca = marcaInput.value;
    const modelo = modeloInput.value;
    const año = añoInput ? añoInput.value : '';
    const tipo = tipoSelect ? tipoSelect.value : '';
    const estado = estadoSelect ? estadoSelect.value : '';
    const color = colorInput ? colorInput.value : '';
    const capacidad = capacidadInput ? capacidadInput.value : '';
    const combustible = combustibleSelect ? combustibleSelect.value : '';
    const descripcion = descripcionInput ? descripcionInput.value : '';
    
    // Validar campos obligatorios
    if (!placa || !marca || !modelo) {
        alert('Por favor complete los campos obligatorios: Placa, Marca y Modelo');
        return;
    }
    
    // Generar ID único si no se proporcionó
    const nuevoId = id || 'V' + (Math.floor(Math.random() * 900) + 100);
    
    // Crear nueva fila para la tabla (coincide con las columnas de la tabla)
    const nuevaFila = `
        <tr>
            <td>${nuevoId}</td>
            <td>${placa}</td>
            <td>${marca}</td>
            <td>${modelo}</td>
            <td>${año || 'N/A'}</td>
            <td>${tipo || 'Sin especificar'}</td>
            <td>${estado || 'Disponible'}</td>
            <td>
                <div class="vehiculos-acciones">
                    <button class="vehiculos-btn-ver" onclick="verVehiculo('${nuevoId}')">
                        <i class="fas fa-eye vehiculos-icon"></i>
                    </button>
                    <button class="vehiculos-btn-editar" onclick="editarVehiculo('${nuevoId}')">
                        <i class="fas fa-edit vehiculos-icon"></i>
                    </button>
                    <button class="vehiculos-btn-eliminar" onclick="eliminarVehiculo('${nuevoId}')">
                        <i class="fas fa-trash vehiculos-icon"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    
    // Agregar la nueva fila a la tabla
    const tabla = document.getElementById('tablaVehiculosMinimalista');
    const tbody = tabla.querySelector('tbody');
    const filaFiltros = tbody.querySelector('.vehiculos-filter-row');
    
    // Insertar después de la fila de filtros
    if (filaFiltros) {
        filaFiltros.insertAdjacentHTML('afterend', nuevaFila);
    } else {
        tbody.insertAdjacentHTML('beforeend', nuevaFila);
    }
    
    // Limpiar formulario con validación
    if (placaInput) placaInput.value = '';
    if (idInput) idInput.value = '';
    if (marcaInput) marcaInput.value = '';
    if (modeloInput) modeloInput.value = '';
    if (añoInput) añoInput.value = '';
    if (tipoSelect) tipoSelect.value = '';
    if (estadoSelect) estadoSelect.value = '';
    if (colorInput) colorInput.value = '';
    if (capacidadInput) capacidadInput.value = '';
    if (combustibleSelect) combustibleSelect.value = '';
    if (descripcionInput) descripcionInput.value = '';
    
    alert('Nuevo vehículo guardado exitosamente');
    cerrarModalNuevoVehiculo();
}

// Función para cerrar modal de nuevo colaborador
function cerrarModalNuevoColaborador() {
    const modal = document.getElementById('modalNuevoColaborador');
    if (modal) {
        modal.remove();
        console.log('Modal de nuevo colaborador cerrado');
    }
}

// Función para guardar nuevo colaborador
function guardarNuevoColaborador() {
    const modal = document.getElementById('modalNuevoColaborador');
    if (!modal) {
        alert('Error: No se puede encontrar el modal. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener elementos del formulario con validación
    const nombreInput = modal.querySelector('input[placeholder="Ingrese el nombre"]');
    const apellidoPaternoInput = modal.querySelector('input[placeholder="Ingrese el apellido paterno"]');
    const apellidoMaternoInput = modal.querySelector('input[placeholder="Ingrese el apellido materno"]');
    const emailInput = modal.querySelector('input[placeholder="Ingrese el email"]');
    const cargoInput = modal.querySelector('input[placeholder="Ingrese el cargo"]');
    const departamentoSelect = modal.querySelector('select:nth-of-type(1)');
    const telefonoInput = modal.querySelector('input[placeholder="Ingrese el teléfono"]');
    const estadoSelect = modal.querySelector('select:nth-of-type(2)');
    
    // Verificar que los elementos existen
    if (!nombreInput || !apellidoPaternoInput || !emailInput) {
        alert('Error: No se pueden encontrar los campos del formulario. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener valores
    const nombre = nombreInput.value;
    const apellidoPaterno = apellidoPaternoInput.value;
    const apellidoMaterno = apellidoMaternoInput ? apellidoMaternoInput.value : '';
    const email = emailInput.value;
    const cargo = cargoInput ? cargoInput.value : '';
    const departamento = departamentoSelect ? departamentoSelect.value : '';
    const telefono = telefonoInput ? telefonoInput.value : '';
    const estado = estadoSelect ? estadoSelect.value : '';
    
    // Validar campos obligatorios
    if (!nombre || !apellidoPaterno || !email) {
        alert('Por favor complete los campos obligatorios: Nombre, Apellido Paterno y Email');
        return;
    }
    
    // Generar ID único
    const nuevoId = 'C' + (Math.floor(Math.random() * 900) + 100);
    
    // Crear nombre completo
    const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
    
    // Crear nueva fila para la tabla (coincide con las columnas de la tabla)
    const nuevaFila = `
        <tr>
            <td>${nuevoId}</td>
            <td>${nombreCompleto}</td>
            <td>${cargo || 'Sin especificar'}</td>
            <td>${departamento || 'Sin especificar'}</td>
            <td>${email}</td>
            <td>${telefono || 'N/A'}</td>
            <td>${estado || 'Activo'}</td>
            <td>
                <div class="colaboradores-acciones">
                    <button class="colaboradores-btn-ver" onclick="verColaborador('${nuevoId}')">
                        <i class="fas fa-eye colaboradores-icon"></i>
                    </button>
                    <button class="colaboradores-btn-editar" onclick="editarColaborador('${nuevoId}')">
                        <i class="fas fa-edit colaboradores-icon"></i>
                    </button>
                    <button class="colaboradores-btn-eliminar" onclick="eliminarColaborador('${nuevoId}')">
                        <i class="fas fa-trash colaboradores-icon"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    
    // Agregar la nueva fila a la tabla
    const tabla = document.getElementById('tablaColaboradoresMinimalista');
    const tbody = tabla.querySelector('tbody');
    const filaFiltros = tbody.querySelector('.colaboradores-filter-row');
    
    // Insertar después de la fila de filtros
    if (filaFiltros) {
        filaFiltros.insertAdjacentHTML('afterend', nuevaFila);
    } else {
        tbody.insertAdjacentHTML('beforeend', nuevaFila);
    }
    
    // Limpiar formulario con validación
    if (nombreInput) nombreInput.value = '';
    if (apellidoPaternoInput) apellidoPaternoInput.value = '';
    if (apellidoMaternoInput) apellidoMaternoInput.value = '';
    if (emailInput) emailInput.value = '';
    if (cargoInput) cargoInput.value = '';
    if (departamentoSelect) departamentoSelect.value = '';
    if (telefonoInput) telefonoInput.value = '';
    if (estadoSelect) estadoSelect.value = '';
    
    alert('Nuevo colaborador guardado exitosamente');
    cerrarModalNuevoColaborador();
}

// Función para cerrar modal de nuevo proyecto
function cerrarModalNuevoProyecto() {
    const modal = document.getElementById('modalNuevoProyecto');
    if (modal) {
        modal.remove();
        console.log('Modal de nuevo proyecto cerrado');
    }
}

// Función para guardar nuevo proyecto
function guardarNuevoProyecto() {
    const modal = document.getElementById('modalNuevoProyecto');
    if (!modal) {
        alert('Error: No se puede encontrar el modal. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener elementos del formulario con validación
    const nombreInput = modal.querySelector('input[placeholder="Ingrese el nombre del proyecto"]');
    const clienteInput = modal.querySelector('input[placeholder="Ingrese el nombre del cliente"]');
    const descripcionInput = modal.querySelector('textarea');
    const fechaInicioInput = modal.querySelector('input[type="date"]:nth-of-type(1)');
    const fechaFinInput = modal.querySelector('input[type="date"]:nth-of-type(2)');
    const estadoSelect = modal.querySelector('select');
    const presupuestoInput = modal.querySelector('input[type="number"]');
    
    // Verificar que los elementos existen
    if (!nombreInput || !clienteInput) {
        alert('Error: No se pueden encontrar los campos del formulario. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener valores
    const nombre = nombreInput.value;
    const cliente = clienteInput.value;
    const descripcion = descripcionInput ? descripcionInput.value : '';
    const fechaInicio = fechaInicioInput ? fechaInicioInput.value : '';
    const fechaFin = fechaFinInput ? fechaFinInput.value : '';
    const estado = estadoSelect ? estadoSelect.value : '';
    const presupuesto = presupuestoInput ? presupuestoInput.value : '';
    
    // Validar campos obligatorios
    if (!nombre || !cliente) {
        alert('Por favor complete los campos obligatorios: Nombre del Proyecto y Cliente');
        return;
    }
    
    // Generar ID único
    const nuevoId = 'P' + (Math.floor(Math.random() * 900) + 100);
    
    // Formatear presupuesto
    const presupuestoFormateado = presupuesto ? `$${parseInt(presupuesto).toLocaleString()}` : 'N/A';
    
    // Crear nueva fila para la tabla (coincide con las columnas de la tabla)
    const nuevaFila = `
        <tr>
            <td>${nuevoId}</td>
            <td>${nombre}</td>
            <td>${cliente}</td>
            <td>${fechaInicio || 'N/A'}</td>
            <td>${fechaFin || 'N/A'}</td>
            <td>${estado || 'Planificado'}</td>
            <td>${presupuestoFormateado}</td>
            <td>
                <div class="proyectos-acciones">
                    <button class="proyectos-btn-ver" onclick="verProyecto('${nuevoId}')">
                        <i class="fas fa-eye proyectos-icon"></i>
                    </button>
                    <button class="proyectos-btn-editar" onclick="editarProyecto('${nuevoId}')">
                        <i class="fas fa-edit proyectos-icon"></i>
                    </button>
                    <button class="proyectos-btn-eliminar" onclick="eliminarProyecto('${nuevoId}')">
                        <i class="fas fa-trash proyectos-icon"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    
    // Agregar la nueva fila a la tabla
    const tabla = document.getElementById('tablaProyectosMinimalista');
    const tbody = tabla.querySelector('tbody');
    const filaFiltros = tbody.querySelector('.proyectos-filter-row');
    
    // Insertar después de la fila de filtros
    if (filaFiltros) {
        filaFiltros.insertAdjacentHTML('afterend', nuevaFila);
    } else {
        tbody.insertAdjacentHTML('beforeend', nuevaFila);
    }
    
    // Limpiar formulario con validación
    if (nombreInput) nombreInput.value = '';
    if (clienteInput) clienteInput.value = '';
    if (descripcionInput) descripcionInput.value = '';
    if (fechaInicioInput) fechaInicioInput.value = '';
    if (fechaFinInput) fechaFinInput.value = '';
    if (estadoSelect) estadoSelect.value = '';
    if (presupuestoInput) presupuestoInput.value = '';
    
    alert('Nuevo proyecto guardado exitosamente');
    cerrarModalNuevoProyecto();
}

// ================================================================================
// FUNCIONES PARA GESTIÓN DE OPERACIONES DIARIAS (EXCEL)
// ================================================================================

// Variables globales para almacenar los datos del Excel
let gestionData = [];
let gestionHeaders = [];
let currentFile = null;
let availableSheets = [];
let currentSheetData = {};

// Función para manejar la carga de archivos
function handleFileUpload(input) {
    const file = input.files[0];
    const fileNameSpan = document.getElementById('gestionFileName');
    const errorDiv = document.getElementById('gestionError');
    const successDiv = document.getElementById('gestionSuccess');
    
    // Ocultar mensajes previos
    hideMessage(errorDiv);
    hideMessage(successDiv);
    
    if (!file) {
        fileNameSpan.textContent = 'Ningún archivo seleccionado';
        return;
    }
    
    // Validar tipo de archivo
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
        showMessage(errorDiv, 'Tipo de archivo no válido. Por favor seleccione un archivo Excel (.xlsx, .xls) o CSV (.csv)');
        fileNameSpan.textContent = 'Ningún archivo seleccionado';
        input.value = '';
        return;
    }
    
    fileNameSpan.textContent = file.name;
    currentFile = file;
    
    // Mostrar estado de carga
    showLoadingState();
    
    // Procesar archivo
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (fileExtension === '.csv') {
                processCSVData(e.target.result);
                hideSheetSelector(); // CSV no tiene múltiples hojas
                showMessage(successDiv, `Archivo "${file.name}" cargado exitosamente. ${gestionData.length} registros encontrados.`);
            } else {
                // Para Excel, primero detectamos las hojas disponibles
                detectExcelSheets(e.target.result);
            }
        } catch (error) {
            console.error('Error procesando archivo:', error);
            showMessage(errorDiv, 'Error al procesar el archivo. Verifique que el formato sea correcto.');
            gestionData = [];
            gestionHeaders = [];
            availableSheets = [];
            hideSheetSelector();
            showEmptyState();
        }
    };
    
    reader.onerror = function() {
        showMessage(errorDiv, 'Error al leer el archivo. Intente nuevamente.');
        showEmptyState();
    };
    
    if (fileExtension === '.csv') {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

// Función para procesar datos CSV
function processCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        throw new Error('Archivo CSV vacío');
    }
    
    // Primera línea como headers
    gestionHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    // Procesar datos
    gestionData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
        if (values.length === gestionHeaders.length) {
            const row = {};
            gestionHeaders.forEach((header, index) => {
                row[header] = values[index];
            });
            gestionData.push(row);
        }
    }
    
    renderDataTable();
}

// Función para procesar datos Excel (simulada - en producción usaría una librería como SheetJS)
function processExcelData(arrayBuffer) {
    // Para esta demo, simularemos datos de Excel con datos de ejemplo
    // En producción, usarías una librería como SheetJS para leer archivos Excel reales
    
    gestionHeaders = [
        'Tipo de Documento',
        'Número de Documento', 
        'Nombre de Documento',
        'Apellido Paterno',
        'Apellido Materno',
        'Nombres',
        'Email',
        'Teléfono',
        'Distrito'
    ];
    
    gestionData = [
        {
            'Tipo de Documento': 'DNI',
            'Número de Documento': '76679701',
            'Nombre de Documento': 'Valenzuela',
            'Apellido Paterno': 'Lizarraburu',
            'Apellido Materno': 'Sebastián',
            'Nombres': 'svalenzuela@gmail.com',
            'Email': '978547320',
            'Teléfono': 'Santa Anita',
            'Distrito': 'Santa Anita'
        },
        {
            'Tipo de Documento': 'C.E.',
            'Número de Documento': '46679722',
            'Nombre de Documento': 'Avellaneda',
            'Apellido Paterno': 'Colmenares',
            'Apellido Materno': 'Santiago',
            'Nombres': 'scolmenares@gmail.com',
            'Email': '956899445',
            'Teléfono': 'Ventanilla',
            'Distrito': 'Ventanilla'
        },
        {
            'Tipo de Documento': 'DNI',
            'Número de Documento': '76679701',
            'Nombre de Documento': 'Valenzuela',
            'Apellido Paterno': 'Lizarraburu',
            'Apellido Materno': 'Sebastián',
            'Nombres': 'svalenzuela@gmail.com',
            'Email': '978547320',
            'Teléfono': 'Comas',
            'Distrito': 'Comas'
        },
        {
            'Tipo de Documento': 'C.E.',
            'Número de Documento': '46679722',
            'Nombre de Documento': 'Avellaneda',
            'Apellido Paterno': 'Colmenares',
            'Apellido Materno': 'Santiago',
            'Nombres': 'scolmenares@gmail.com',
            'Email': '956899445',
            'Teléfono': 'San Borja',
            'Distrito': 'San Borja'
        },
        {
            'Tipo de Documento': 'DNI',
            'Número de Documento': '76679701',
            'Nombre de Documento': 'Valenzuela',
            'Apellido Paterno': 'Lizarraburu',
            'Apellido Materno': 'Sebastián',
            'Nombres': 'svalenzuela@gmail.com',
            'Email': '978547320',
            'Teléfono': 'Santa Anita',
            'Distrito': 'Santa Anita'
        },
        {
            'Tipo de Documento': 'C.E.',
            'Número de Documento': '46679722',
            'Nombre de Documento': 'Avellaneda',
            'Apellido Paterno': 'Colmenares',
            'Apellido Materno': 'Santiago',
            'Nombres': 'scolmenares@gmail.com',
            'Email': '956899445',
            'Teléfono': 'Ventanilla',
            'Distrito': 'Ventanilla'
        },
        {
            'Tipo de Documento': 'DNI',
            'Número de Documento': '76679701',
            'Nombre de Documento': 'Valenzuela',
            'Apellido Paterno': 'Lizarraburu',
            'Apellido Materno': 'Sebastián',
            'Nombres': 'svalenzuela@gmail.com',
            'Email': '978547320',
            'Teléfono': 'Comas',
            'Distrito': 'Comas'
        },
        {
            'Tipo de Documento': 'C.E.',
            'Número de Documento': '46679722',
            'Nombre de Documento': 'Avellaneda',
            'Apellido Paterno': 'Colmenares',
            'Apellido Materno': 'Santiago',
            'Nombres': 'scolmenares@gmail.com',
            'Email': '956899445',
            'Teléfono': 'San Borja',
            'Distrito': 'San Borja'
        },
        {
            'Tipo de Documento': 'DNI',
            'Número de Documento': '76679701',
            'Nombre de Documento': 'Valenzuela',
            'Apellido Paterno': 'Lizarraburu',
            'Apellido Materno': 'Sebastián',
            'Nombres': 'svalenzuela@gmail.com',
            'Email': '978547320',
            'Teléfono': 'Santa Anita',
            'Distrito': 'Santa Anita'
        }
    ];
    
    renderDataTable();
}

// Función para renderizar la tabla de datos
function renderDataTable() {
    const container = document.getElementById('gestionTableContainer');
    
    if (!gestionData || gestionData.length === 0) {
        showEmptyState();
        return;
    }
    
    // Usar columnas seleccionadas o todas las columnas si no hay selección
    const columnsToShow = selectedColumns && selectedColumns.length > 0 ? 
        gestionHeaders.filter(header => selectedColumns.includes(header)) : 
        gestionHeaders;
    
    let tableHTML = `
        <table class="gestion-table">
            <thead>
                <tr>
    `;
    
    // Agregar headers de columnas seleccionadas
    columnsToShow.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    
    tableHTML += `
                </tr>
            </thead>
            <tbody>
    `;
    
    // Agregar filas de datos solo para columnas seleccionadas
    gestionData.forEach((row, index) => {
        tableHTML += `<tr>`;
        columnsToShow.forEach(header => {
            let cellValue = row[header] || '';
            
            // Aplicar estilos especiales según el contenido
            if (header.toLowerCase().includes('email') && cellValue.includes('@')) {
                cellValue = `<span style="color: #3b82f6;">${cellValue}</span>`;
            } else if (header.toLowerCase().includes('documento') && cellValue.includes('DNI')) {
                cellValue = `<span style="color: #059669; font-weight: 500;">${cellValue}</span>`;
            } else if (header.toLowerCase().includes('documento') && cellValue.includes('C.E.')) {
                cellValue = `<span style="color: #dc2626; font-weight: 500;">${cellValue}</span>`;
            }
            
            tableHTML += `<td>${cellValue}</td>`;
        });
        tableHTML += `</tr>`;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
    
    // Actualizar contadores
    updateDataCounters(columnsToShow);
    
    // Mostrar mensaje de scroll si hay muchas columnas
    const scrollInfo = document.getElementById('scrollInfo');
    if (scrollInfo && columnsToShow && columnsToShow.length > 6) {
        scrollInfo.style.display = 'flex';
    } else if (scrollInfo) {
        scrollInfo.style.display = 'none';
    }
    
    // Mostrar u ocultar botón de mapa automáticamente
    mostrarOcultarBotonMapa();
}

// Función para actualizar los contadores de datos
function updateDataCounters(columnsToShow = null) {
    const columnCountElement = document.getElementById('columnCount');
    const rowCountElement = document.getElementById('rowCount');
    
    if (columnCountElement && rowCountElement) {
        const columnCount = columnsToShow ? columnsToShow.length : (gestionHeaders ? gestionHeaders.length : 0);
        const rowCount = gestionData ? gestionData.length : 0;
        
        columnCountElement.innerHTML = `<i class="fas fa-columns"></i> Columnas: ${columnCount}`;
        rowCountElement.innerHTML = `<i class="fas fa-list"></i> Filas: ${rowCount}`;
    }
}

// Función para mostrar estado vacío
function showEmptyState() {
    const container = document.getElementById('gestionTableContainer');
    container.innerHTML = `
        <div class="gestion-empty-state">
            <div class="gestion-empty-icon">
                <i class="fas fa-file-excel"></i>
            </div>
            <div class="gestion-empty-text">No hay datos cargados</div>
            <div class="gestion-empty-subtext">Selecciona un archivo Excel para comenzar</div>
        </div>
    `;
    
    // Resetear contadores
    const columnCountElement = document.getElementById('columnCount');
    const rowCountElement = document.getElementById('rowCount');
    
    if (columnCountElement && rowCountElement) {
        columnCountElement.innerHTML = `<i class="fas fa-columns"></i> Columnas: 0`;
        rowCountElement.innerHTML = `<i class="fas fa-list"></i> Filas: 0`;
    }
    
    // Ocultar mensaje de scroll
    const scrollInfo = document.getElementById('scrollInfo');
    if (scrollInfo) {
        scrollInfo.style.display = 'none';
    }
}

// Función para mostrar estado de carga
function showLoadingState() {
    const container = document.getElementById('gestionTableContainer');
    container.innerHTML = `
        <div class="gestion-loading">
            <div class="gestion-spinner"></div>
            Procesando archivo...
        </div>
    `;
}

// Funciones para mostrar/ocultar mensajes
function showMessage(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        hideMessage(element);
    }, 5000);
}

function hideMessage(element) {
    element.style.display = 'none';
}

// Funciones para los botones de acción
function compartirConBD() {
    const successDiv = document.getElementById('gestionSuccess');
    
    if (!gestionData || gestionData.length === 0) {
        const errorDiv = document.getElementById('gestionError');
        showMessage(errorDiv, 'No hay datos para compartir. Cargue un archivo primero.');
        return;
    }
    
    // Simular proceso de compartir con base de datos
    showMessage(successDiv, `Datos compartidos exitosamente con la base de datos. ${gestionData.length} registros procesados.`);
    console.log('Datos compartidos con BD:', gestionData);
}

function seleccionarColumnas() {
    console.log('🔍 [COLUMNAS] Función seleccionarColumnas() ejecutada');
    console.log('📊 [COLUMNAS] Datos disponibles:', gestionData ? gestionData.length : 0, 'filas');
    
    if (!gestionData || gestionData.length === 0) {
        alert('⚠️ No hay datos cargados. Por favor, carga un archivo primero.');
        console.log('❌ [COLUMNAS] No hay datos disponibles');
        return;
    }
    
    console.log('✅ [COLUMNAS] Datos encontrados, mostrando selector de columnas...');
    mostrarSelectorColumnas();
}

function exportarDatos() {
    if (!gestionData || gestionData.length === 0) {
        const errorDiv = document.getElementById('gestionError');
        showMessage(errorDiv, 'No hay datos para exportar. Cargue un archivo primero.');
        return;
    }
    
    // Crear CSV para exportar
    let csvContent = gestionHeaders.join(',') + '\n';
    gestionData.forEach(row => {
        const values = gestionHeaders.map(header => `"${row[header] || ''}"`);
        csvContent += values.join(',') + '\n';
    });
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gestion_operaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const successDiv = document.getElementById('gestionSuccess');
    showMessage(successDiv, 'Datos exportados exitosamente.');
}

function filtrarDatos() {
    if (!gestionData || gestionData.length === 0) {
        const errorDiv = document.getElementById('gestionError');
        showMessage(errorDiv, 'No hay datos para filtrar. Cargue un archivo primero.');
        return;
    }
    
    const filtro = prompt('Ingrese el texto a buscar en todos los campos:');
    if (!filtro) return;
    
    const datosFiltrados = gestionData.filter(row => {
        return gestionHeaders.some(header => {
            const valor = row[header] || '';
            return valor.toLowerCase().includes(filtro.toLowerCase());
        });
    });
    
    // Temporalmente mostrar datos filtrados
    const datosOriginales = [...gestionData];
    gestionData = datosFiltrados;
    renderDataTable();
    
    const successDiv = document.getElementById('gestionSuccess');
    showMessage(successDiv, `Filtro aplicado. Mostrando ${datosFiltrados.length} de ${datosOriginales.length} registros.`);
    
    // Restaurar datos originales después de 10 segundos
    setTimeout(() => {
        gestionData = datosOriginales;
        renderDataTable();
        const infoDiv = document.getElementById('gestionSuccess');
        showMessage(infoDiv, 'Filtro removido. Mostrando todos los registros.');
    }, 10000);
}

// ================================================================================
// FUNCIONES PARA MANEJO DE HOJAS DE EXCEL
// ================================================================================

// Función para detectar hojas disponibles en un archivo Excel
function detectExcelSheets(arrayBuffer) {
    try {
        // Leer el archivo Excel usando SheetJS
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Obtener nombres de todas las hojas
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
            hideSheetSelector();
            showEmptyState();
            const errorDiv = document.getElementById('gestionError');
            showMessage(errorDiv, 'No se encontraron hojas válidas en el archivo.');
            return;
        }
        
        // Procesar cada hoja y extraer sus datos
        availableSheets = [];
        currentSheetData = {};
        
        sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            
            // Obtener el rango de la hoja para asegurar que capturemos todas las columnas
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
            
            // Usar sheet_to_json con defval para mantener celdas vacías
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '', // Valor por defecto para celdas vacías
                range: range // Usar el rango completo de la hoja
            });
            
            if (jsonData.length > 0) {
                // La primera fila contiene los headers
                let headers = jsonData[0] || [];
                
                // Asegurar que tenemos todos los headers hasta la última columna con datos
                const maxColumns = Math.max(...jsonData.map(row => row.length));
                while (headers.length < maxColumns) {
                    headers.push(`Columna ${headers.length + 1}`);
                }
                
                // Filtrar headers vacíos al final y reemplazar con nombres por defecto
                headers = headers.map((header, index) => {
                    if (!header || header.toString().trim() === '') {
                        return `Columna ${index + 1}`;
                    }
                    return header.toString().trim();
                });
                
                const dataRows = jsonData.slice(1);
                
                // Convertir filas a objetos usando los headers
                const data = dataRows.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = (row[index] !== undefined && row[index] !== null) ? row[index].toString() : '';
                    });
                    return obj;
                }).filter(row => {
                    // Filtrar filas completamente vacías
                    return Object.values(row).some(value => value !== '');
                });
                
                console.log(`Hoja "${sheetName}": ${headers.length} columnas detectadas:`, headers);
                
                availableSheets.push({ name: sheetName, data: { headers, data } });
                currentSheetData[sheetName] = { headers, data };
            }
        });
        
        if (availableSheets.length > 1) {
            showSheetSelector();
            populateSheetSelector();
            
            const successDiv = document.getElementById('gestionSuccess');
            showMessage(successDiv, `Archivo cargado exitosamente. ${availableSheets.length} hojas detectadas. Selecciona una hoja para continuar.`);
        } else if (availableSheets.length === 1) {
            // Solo una hoja, cargar automáticamente
            hideSheetSelector();
            loadSheetData(availableSheets[0].name);
        } else {
            hideSheetSelector();
            showEmptyState();
            const errorDiv = document.getElementById('gestionError');
            showMessage(errorDiv, 'No se encontraron hojas con datos válidos en el archivo.');
        }
        
    } catch (error) {
        console.error('Error al procesar archivo Excel:', error);
        hideSheetSelector();
        showEmptyState();
        const errorDiv = document.getElementById('gestionError');
        showMessage(errorDiv, 'Error al procesar el archivo Excel. Verifica que el archivo no esté corrupto.');
    }
}

// Función para generar datos de ejemplo para diferentes hojas
function generateSampleData(sheetName) {
    switch(sheetName) {
        case 'Hoja1':
            return {
                headers: ['Tipo de Documento', 'Número de Documento', 'Nombres', 'Apellidos', 'Email', 'Teléfono', 'Distrito'],
                data: [
                    {
                        'Tipo de Documento': 'DNI',
                        'Número de Documento': '76679701',
                        'Nombres': 'Sebastián',
                        'Apellidos': 'Valenzuela Lizarraburu',
                        'Email': 'svalenzuela@gmail.com',
                        'Teléfono': '978547320',
                        'Distrito': 'Santa Anita'
                    },
                    {
                        'Tipo de Documento': 'C.E.',
                        'Número de Documento': '46679722',
                        'Nombres': 'Santiago',
                        'Apellidos': 'Avellaneda Colmenares',
                        'Email': 'scolmenares@gmail.com',
                        'Teléfono': '956899445',
                        'Distrito': 'Ventanilla'
                    }
                ]
            };
        case 'Empleados':
            return {
                headers: ['ID', 'Nombre Completo', 'Cargo', 'Departamento', 'Fecha Ingreso', 'Salario', 'Estado'],
                data: [
                    {
                        'ID': 'EMP001',
                        'Nombre Completo': 'María García López',
                        'Cargo': 'Analista de Sistemas',
                        'Departamento': 'Tecnología',
                        'Fecha Ingreso': '2023-01-15',
                        'Salario': 'S/. 4,500',
                        'Estado': 'Activo'
                    },
                    {
                        'ID': 'EMP002',
                        'Nombre Completo': 'Carlos Rodríguez Pérez',
                        'Cargo': 'Supervisor de Operaciones',
                        'Departamento': 'Operaciones',
                        'Fecha Ingreso': '2022-08-20',
                        'Salario': 'S/. 5,200',
                        'Estado': 'Activo'
                    },
                    {
                        'ID': 'EMP003',
                        'Nombre Completo': 'Ana Martínez Silva',
                        'Cargo': 'Coordinadora de Recursos Humanos',
                        'Departamento': 'RRHH',
                        'Fecha Ingreso': '2021-11-10',
                        'Salario': 'S/. 4,800',
                        'Estado': 'Activo'
                    }
                ]
            };
        case 'Departamentos':
            return {
                headers: ['Código', 'Nombre Departamento', 'Jefe de Departamento', 'Presupuesto', 'Empleados', 'Ubicación'],
                data: [
                    {
                        'Código': 'TECH',
                        'Nombre Departamento': 'Tecnología',
                        'Jefe de Departamento': 'Luis Fernández',
                        'Presupuesto': 'S/. 150,000',
                        'Empleados': '12',
                        'Ubicación': 'Piso 3'
                    },
                    {
                        'Código': 'OPS',
                        'Nombre Departamento': 'Operaciones',
                        'Jefe de Departamento': 'Carmen Vega',
                        'Presupuesto': 'S/. 200,000',
                        'Empleados': '18',
                        'Ubicación': 'Piso 1'
                    },
                    {
                        'Código': 'RRHH',
                        'Nombre Departamento': 'Recursos Humanos',
                        'Jefe de Departamento': 'Roberto Castillo',
                        'Presupuesto': 'S/. 80,000',
                        'Empleados': '6',
                        'Ubicación': 'Piso 2'
                    }
                ]
            };
        case 'Proyectos':
            return {
                headers: ['ID Proyecto', 'Nombre Proyecto', 'Cliente', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Presupuesto', 'Responsable'],
                data: [
                    {
                        'ID Proyecto': 'PRY001',
                        'Nombre Proyecto': 'Sistema de Gestión Operativa',
                        'Cliente': 'Empresa ABC',
                        'Fecha Inicio': '2024-01-01',
                        'Fecha Fin': '2024-06-30',
                        'Estado': 'En Progreso',
                        'Presupuesto': 'S/. 50,000',
                        'Responsable': 'María García'
                    },
                    {
                        'ID Proyecto': 'PRY002',
                        'Nombre Proyecto': 'Automatización de Procesos',
                        'Cliente': 'Corporación XYZ',
                        'Fecha Inicio': '2024-02-15',
                        'Fecha Fin': '2024-08-15',
                        'Estado': 'Planificación',
                        'Presupuesto': 'S/. 75,000',
                        'Responsable': 'Carlos Rodríguez'
                    }
                ]
            };
        default:
            return { headers: [], data: [] };
    }
}

// Función para mostrar el selector de hojas
function showSheetSelector() {
    const sheetSelector = document.getElementById('sheetSelector');
    if (sheetSelector) {
        sheetSelector.style.display = 'block';
    }
}

// Función para ocultar el selector de hojas
function hideSheetSelector() {
    const sheetSelector = document.getElementById('sheetSelector');
    if (sheetSelector) {
        sheetSelector.style.display = 'none';
    }
}

// Función para poblar el selector de hojas
function populateSheetSelector() {
    const sheetSelect = document.getElementById('sheetSelect');
    const sheetCount = document.getElementById('sheetCount');
    
    if (sheetSelect && sheetCount) {
        // Limpiar opciones existentes
        sheetSelect.innerHTML = '<option value="">Selecciona una hoja...</option>';
        
        // Agregar opciones para cada hoja
        availableSheets.forEach(sheet => {
            const option = document.createElement('option');
            option.value = sheet.name;
            option.textContent = sheet.name;
            sheetSelect.appendChild(option);
        });
        
        // Actualizar contador
        sheetCount.innerHTML = `<i class="fas fa-file-alt"></i> Hojas disponibles: ${availableSheets.length}`;
    }
}

// Función para manejar el cambio de hoja seleccionada
function handleSheetChange() {
    const sheetSelect = document.getElementById('sheetSelect');
    const selectedSheet = sheetSelect.value;
    
    if (selectedSheet) {
        loadSheetData(selectedSheet);
    } else {
        showEmptyState();
    }
}

// Función para cargar datos de una hoja específica
function loadSheetData(sheetName) {
    const sheetData = currentSheetData[sheetName];
    
    if (sheetData) {
        gestionHeaders = sheetData.headers;
        gestionData = sheetData.data;
        
        renderDataTable();
        
        const successDiv = document.getElementById('gestionSuccess');
        showMessage(successDiv, `Hoja "${sheetName}" cargada exitosamente. ${gestionData.length} registros encontrados.`);
    } else {
        const errorDiv = document.getElementById('gestionError');
        showMessage(errorDiv, `Error al cargar la hoja "${sheetName}".`);
        showEmptyState();
    }
}

// Variables para selección de columnas
let selectedColumns = [];
let allColumns = [];

// Función para mostrar el modal de selección de columnas
function mostrarSelectorColumnas() {
    if (!gestionHeaders || gestionHeaders.length === 0) {
        alert('No hay datos cargados. Por favor, carga un archivo primero.');
        return;
    }

    // Inicializar columnas disponibles y seleccionadas
    allColumns = [...gestionHeaders];
    if (selectedColumns.length === 0) {
        selectedColumns = [...gestionHeaders];
    }

    const modalHTML = `
        <div class="modal-overlay" id="modalSelectorColumnas" style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0, 0, 0, 0.5) !important; display: flex !important; justify-content: center !important; align-items: center !important; z-index: 99999 !important;">
            <div class="modal-container" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative;">
                <!-- Header del Modal -->
                <div class="modal-header" style="padding: 24px 32px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="modal-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">SELECCIONAR COLUMNAS</h2>
                    <button class="modal-close" onclick="cerrarSelectorColumnas()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 6px; transition: all 0.3s ease;">&times;</button>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="modal-content" style="padding: 24px 32px;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <button onclick="seleccionarTodasColumnas()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">Seleccionar Todas</button>
                            <button onclick="deseleccionarTodasColumnas()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">Deseleccionar Todas</button>
                        </div>
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                            Selecciona las columnas que deseas mostrar en la tabla:
                        </div>
                    </div>
                    
                    <div id="columnasContainer" style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        ${generateColumnCheckboxes()}
                    </div>
                    
                    <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 14px; color: #374151;">
                        <strong>Columnas seleccionadas:</strong> <span id="contadorColumnas">${selectedColumns.length}</span> de ${allColumns.length}
                    </div>
                </div>
                
                <!-- Footer del Modal -->
                <div class="modal-footer" style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn-secondary" onclick="cerrarSelectorColumnas()" style="padding: 12px 24px; background: white; border: 2px solid #6b7280; color: #6b7280; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                    <button class="btn-primary" onclick="aplicarSeleccionColumnas()" style="padding: 12px 24px; background: #1e3a8a; color: white; border: none; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Aplicar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de selector de columnas creado');
}

// Función para generar checkboxes de columnas
function generateColumnCheckboxes() {
    return allColumns.map(column => {
        const isChecked = selectedColumns.includes(column);
        return `
            <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                <input type="checkbox" id="col_${column}" ${isChecked ? 'checked' : ''} onchange="toggleColumn('${column}')" style="margin-right: 12px; transform: scale(1.2);">
                <label for="col_${column}" style="flex: 1; cursor: pointer; font-size: 14px; color: #374151;">${column}</label>
            </div>
        `;
    }).join('');
}

// Función para alternar selección de columna
function toggleColumn(columnName) {
    const index = selectedColumns.indexOf(columnName);
    if (index > -1) {
        selectedColumns.splice(index, 1);
    } else {
        selectedColumns.push(columnName);
    }
    updateColumnCounter();
}

// Función para seleccionar todas las columnas
function seleccionarTodasColumnas() {
    selectedColumns = [...allColumns];
    updateColumnCheckboxes();
    updateColumnCounter();
}

// Función para deseleccionar todas las columnas
function deseleccionarTodasColumnas() {
    selectedColumns = [];
    updateColumnCheckboxes();
    updateColumnCounter();
}

// Función para actualizar checkboxes
function updateColumnCheckboxes() {
    allColumns.forEach(column => {
        const checkbox = document.getElementById(`col_${column}`);
        if (checkbox) {
            checkbox.checked = selectedColumns.includes(column);
        }
    });
}

// Función para actualizar contador
function updateColumnCounter() {
    const contador = document.getElementById('contadorColumnas');
    if (contador) {
        contador.textContent = selectedColumns.length;
    }
}

// Función para aplicar selección de columnas
function aplicarSeleccionColumnas() {
    if (selectedColumns.length === 0) {
        alert('Debes seleccionar al menos una columna.');
        return;
    }

    // Actualizar headers globales
    gestionHeaders = [...selectedColumns];
    
    // Re-renderizar tabla con columnas seleccionadas
    renderDataTable();
    
    // Detectar columnas geográficas y mostrar/ocultar botón de mapa
    detectarColumnasGeograficas();
    
    // Cerrar modal
    cerrarSelectorColumnas();
    
    console.log('Columnas aplicadas:', selectedColumns);
}

// Variables para funcionalidad de mapas
let columnasGeograficas = [];
let tieneUbicacionesGeograficas = false;

// Función para detectar columnas con datos geográficos
function detectarColumnasGeograficas() {
    columnasGeograficas = [];
    tieneUbicacionesGeograficas = false;
    
    // Función para normalizar texto (quitar acentos y convertir a minúsculas)
    function normalizeText(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
    }
    
    // Palabras clave para identificar columnas geográficas
    const palabrasClaveGeo = [
        'latitud', 'latitude', 'lat',
        'longitud', 'longitude', 'lng', 'lon',
        'direccion', 'address', 'ubicacion', 'location',
        'coordenada', 'coordinate', 'coord',
        'ciudad', 'city', 'municipio',
        'departamento', 'estado', 'state', 'provincia',
        'pais', 'country', 'region',
        'zona', 'sector', 'barrio', 'neighborhood',
        'gps', 'geolocation', 'geolocalizacion'
    ];
    
    // Revisar cada columna seleccionada
    selectedColumns.forEach(columna => {
        const nombreColumnaNormalizado = normalizeText(columna);
        
        // Verificar si el nombre de la columna contiene palabras clave geográficas
        const esGeografica = palabrasClaveGeo.some(palabra => 
            nombreColumnaNormalizado.includes(palabra)
        );
        
        if (esGeografica) {
            columnasGeograficas.push(columna);
            tieneUbicacionesGeograficas = true;
        }
    });
    
    // Si hay datos geográficos, verificar también el contenido de las columnas
    if (!tieneUbicacionesGeograficas && gestionData.length > 0) {
        selectedColumns.forEach(columna => {
            const indiceColumna = gestionHeaders.indexOf(columna);
            if (indiceColumna !== -1 && verificarContenidoGeografico(columna, indiceColumna)) {
                columnasGeograficas.push(columna);
                tieneUbicacionesGeograficas = true;
            }
        });
    }
    
    // Mostrar u ocultar botón de mapa
    mostrarOcultarBotonMapa();
    
    console.log('🗺️ Columnas seleccionadas:', selectedColumns);
    console.log('🗺️ Columnas geográficas detectadas:', columnasGeograficas);
    console.log('🗺️ Tiene ubicaciones geográficas:', tieneUbicacionesGeograficas);
}

// Función para verificar si el contenido de una columna es geográfico
function verificarContenidoGeografico(nombreColumna, indiceColumna) {
    if (gestionData.length === 0) return false;
    
    // Tomar una muestra de los primeros 10 registros para análisis
    const muestra = gestionData.slice(0, Math.min(10, gestionData.length));
    let contadorCoincidencias = 0;
    
    muestra.forEach(fila => {
        const valor = fila[indiceColumna];
        if (valor && typeof valor === 'string') {
            const valorLimpio = valor.trim();
            
            // Verificar patrón de coordenadas separadas por coma (ej: -12.1353,-76.9408)
            const patronCoordenadasComa = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
            
            // Verificar patrón de coordenadas individuales (ej: -74.123456)
            const patronCoordenadas = /^-?\d+\.?\d*$/;
            
            // Verificar patrones de direcciones (contiene números y letras)
            const patronDireccion = /\d+.*[a-zA-Z]|[a-zA-Z].*\d+/;
            
            // Verificar si es un par de coordenadas separadas por coma
            if (patronCoordenadasComa.test(valorLimpio)) {
                const coordenadas = valorLimpio.split(',');
                if (coordenadas.length === 2) {
                    const lat = parseFloat(coordenadas[0]);
                    const lng = parseFloat(coordenadas[1]);
                    
                    // Verificar rangos válidos de latitud y longitud
                    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        contadorCoincidencias++;
                    }
                }
            }
            // Verificar si parece una coordenada individual
            else if (patronCoordenadas.test(valorLimpio)) {
                const numero = parseFloat(valorLimpio);
                // Rangos típicos de latitud (-90 a 90) y longitud (-180 a 180)
                if ((numero >= -90 && numero <= 90) || (numero >= -180 && numero <= 180)) {
                    contadorCoincidencias++;
                }
            }
            // Verificar si parece una dirección
            else if (patronDireccion.test(valorLimpio) && valorLimpio.length > 5) {
                contadorCoincidencias++;
            }
        }
    });
    
    // Si al menos el 50% de la muestra parece geográfica, considerarla como tal
    const porcentajeCoincidencias = contadorCoincidencias / muestra.length;
    console.log(`🔍 Verificando contenido de "${nombreColumna}": ${contadorCoincidencias}/${muestra.length} coincidencias (${(porcentajeCoincidencias * 100).toFixed(1)}%)`);
    
    return porcentajeCoincidencias >= 0.5;
}

// Función para mostrar u ocultar el botón de mapa
function mostrarOcultarBotonMapa() {
    let botonMapa = document.getElementById('btn-ver-mapa');
    
    // Siempre mostrar el botón si hay datos cargados
    if (gestionData.length > 0 && gestionHeaders.length > 0) {
        // Si no existe el botón, crearlo
        if (!botonMapa) {
            crearBotonMapa();
        } else {
            // Si existe, mostrarlo
            botonMapa.style.display = 'inline-block';
        }
    } else {
        // Si no hay datos, ocultar el botón
        if (botonMapa) {
            botonMapa.style.display = 'none';
        }
    }
}

// Función para crear el botón "Ver en Mapa"
function crearBotonMapa() {
    const contenedorBotones = document.querySelector('.gestion-buttons');
    if (!contenedorBotones) return;
    
    const botonMapa = document.createElement('button');
    botonMapa.id = 'btn-ver-mapa';
    botonMapa.className = 'gestion-btn gestion-btn-success';
    botonMapa.innerHTML = '<i class="fas fa-map-marked-alt"></i> Ver en Mapa';
    botonMapa.onclick = abrirModalMapa;
    
    contenedorBotones.appendChild(botonMapa);
    console.log('🗺️ Botón "Ver en Mapa" creado');
}

// Variables para el mapa
let mapaInstancia = null;
let marcadoresGrupo = null;

// Variables para el modo de dibujo
let modoDibujoActivo = false;
let trazoDibujo = null;
let puntosSeleccionados = [];
let marcadoresSeleccionados = [];

// Función para abrir el modal de mapa
function abrirModalMapa() {
    if (gestionData.length === 0 || gestionHeaders.length === 0) {
        alert('No hay datos cargados para mostrar en el mapa.');
        return;
    }
    
    const modal = document.getElementById('modal-mapa');
    if (!modal) {
        alert('Error: No se encontró el modal de mapa.');
        return;
    }
    
    // Crear selector de columnas para ubicación
    crearSelectorColumnasUbicacion();
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    console.log('🗺️ Modal de mapa abierto');
}

// Función para crear el selector de columnas de ubicación
function crearSelectorColumnasUbicacion() {
    const selector = document.getElementById('selector-columna-geo');
    if (!selector) return;
    
    // Limpiar opciones existentes
    selector.innerHTML = '<option value="">-- Selecciona una columna --</option>';
    
    // Agregar todas las columnas disponibles
    gestionHeaders.forEach(columna => {
        const option = document.createElement('option');
        option.value = columna;
        option.textContent = columna;
        selector.appendChild(option);
    });
    
    console.log('🗺️ Selector de columnas creado con', gestionHeaders.length, 'columnas');
}

// Función para cargar el mapa con la columna seleccionada
function cargarMapaConColumna() {
    const selector = document.getElementById('selector-columna-geo');
    const columnaSeleccionada = selector.value;
    
    if (!columnaSeleccionada) {
        alert('Por favor selecciona una columna que contenga información de ubicación.');
        return;
    }
    
    // Inicializar mapa directamente con la columna seleccionada
    
    // Inicializar mapa con la columna seleccionada
    setTimeout(() => {
        inicializarMapaConColumna(columnaSeleccionada);
    }, 100);
    
    console.log('🗺️ Cargando mapa con columna:', columnaSeleccionada);
}

// Función para cerrar el modal de mapa
function cerrarModalMapa() {
    const modal = document.getElementById('modal-mapa');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Ocultar estadísticas del mapa
    const stats = document.querySelector('.mapa-stats');
    if (stats) {
        stats.style.display = 'none';
    }
    
    // Limpiar instancia del mapa
    if (mapaInstancia) {
        mapaInstancia.remove();
        mapaInstancia = null;
        marcadoresGrupo = null;
    }
    
    console.log('🗺️ Modal de mapa cerrado');
}

// Función para inicializar el mapa
function inicializarMapa() {
    const contenedorMapa = document.getElementById('mapa-container');
    if (!contenedorMapa) return;
    
    // Limpiar mapa anterior si existe
    if (mapaInstancia) {
        mapaInstancia.remove();
    }
    
    // Crear nueva instancia del mapa centrado en Colombia
    mapaInstancia = L.map('mapa-container').setView([4.5709, -74.2973], 6);
    
    // Agregar capa de tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapaInstancia);
    
    // Crear grupo de marcadores
    marcadoresGrupo = L.layerGroup().addTo(mapaInstancia);
    
    // Procesar y agregar marcadores
    procesarDatosGeograficos();
    
    console.log('🗺️ Mapa inicializado');
}

// Función para inicializar el mapa con una columna específica seleccionada por el usuario
function inicializarMapaConColumna(columnaSeleccionada) {
    const contenedorMapa = document.getElementById('mapa-container');
    if (!contenedorMapa) return;
    
    // Limpiar mapa anterior si existe
    if (mapaInstancia) {
        mapaInstancia.remove();
    }
    
    // Crear nueva instancia del mapa centrado en Colombia
    mapaInstancia = L.map('mapa-container').setView([4.5709, -74.2973], 6);
    
    // Agregar capa de tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapaInstancia);
    
    // Crear grupo de marcadores
    marcadoresGrupo = L.layerGroup().addTo(mapaInstancia);
    
    // Procesar y agregar marcadores con la columna seleccionada
    procesarDatosGeograficosConColumna(columnaSeleccionada);
    
    console.log('🗺️ Mapa inicializado con columna:', columnaSeleccionada);
}

// Función para procesar datos geográficos y crear marcadores
function procesarDatosGeograficos() {
    if (!gestionData || gestionData.length === 0) {
        return;
    }
    
    let puntosValidos = 0;
    const bounds = L.latLngBounds();
    
    // Identificar índices de columnas geográficas
    const indicesColumnas = {};
    columnasGeograficas.forEach(columna => {
        const indice = gestionHeaders.indexOf(columna);
        if (indice !== -1) {
            indicesColumnas[columna] = indice;
        }
    });
    
    // Set para evitar marcadores duplicados
    const posicionesExistentes = new Set();
    
    // Procesar cada fila de datos
    gestionData.forEach((fila, indiceFila) => {
        const coordenadas = extraerCoordenadas(fila, indicesColumnas);
        
        if (coordenadas.lat !== null && coordenadas.lng !== null) {
            const posKey = `${coordenadas.lat},${coordenadas.lng}`;
            
            // Solo crear marcador si la posición no existe
            if (!posicionesExistentes.has(posKey)) {
                posicionesExistentes.add(posKey);
                
                // Crear marcador
                const marcador = L.marker([coordenadas.lat, coordenadas.lng])
                    .addTo(marcadoresGrupo);
                
                // Crear contenido del popup
                const contenidoPopup = crearContenidoPopup(fila, indiceFila + 1);
                marcador.bindPopup(contenidoPopup);
                
                // Agregar a bounds para centrar el mapa
                bounds.extend([coordenadas.lat, coordenadas.lng]);
                puntosValidos++;
            } else {
                console.log(`⚠️ Marcador duplicado evitado en posición [${coordenadas.lat}, ${coordenadas.lng}] - Fila ${indiceFila + 1}`);
            }
        }
    });
    
    // Centrar mapa en todos los marcadores si hay puntos válidos
    if (puntosValidos > 0) {
        mapaInstancia.fitBounds(bounds, { padding: [20, 20] });
    }
    
    console.log(`🗺️ ${puntosValidos} puntos procesados y agregados al mapa`);
}

// Función para procesar datos geográficos con una columna específica
function procesarDatosGeograficosConColumna(columnaSeleccionada) {
    if (!gestionData || gestionData.length === 0) {
        return;
    }
    
    let puntosValidos = 0;
    const bounds = L.latLngBounds();
    const indiceColumna = gestionHeaders.indexOf(columnaSeleccionada);
    
    if (indiceColumna === -1) {
        alert('Error: No se encontró la columna seleccionada.');
        return;
    }
    
    // Set para evitar marcadores duplicados
    const posicionesExistentes = new Set();
    
    // Procesar cada fila de datos
    gestionData.forEach((fila, indiceFila) => {
        const valorUbicacion = fila[columnaSeleccionada];
        const coordenadas = extraerCoordenadasDeTexto(valorUbicacion);
        
        if (coordenadas.lat !== null && coordenadas.lng !== null) {
            const posKey = `${coordenadas.lat},${coordenadas.lng}`;
            
            // Solo crear marcador si la posición no existe
            if (!posicionesExistentes.has(posKey)) {
                posicionesExistentes.add(posKey);
                
                // Crear marcador
                const marcador = L.marker([coordenadas.lat, coordenadas.lng])
                    .addTo(marcadoresGrupo);
                
                // Crear contenido del popup
                const contenidoPopup = crearContenidoPopupConUbicacion(fila, indiceFila + 1, columnaSeleccionada, valorUbicacion);
                marcador.bindPopup(contenidoPopup);
                
                // Agregar a bounds para centrar el mapa
                bounds.extend([coordenadas.lat, coordenadas.lng]);
                puntosValidos++;
            } else {
                console.log(`⚠️ Marcador duplicado evitado en posición [${coordenadas.lat}, ${coordenadas.lng}] - Fila ${indiceFila + 1} (Columna: ${columnaSeleccionada})`);
            }
        }
    });
    
    // Centrar mapa en todos los marcadores si hay puntos válidos
    if (puntosValidos > 0) {
        mapaInstancia.fitBounds(bounds, { padding: [20, 20] });
    } else {
        alert(`No se encontraron coordenadas válidas en la columna "${columnaSeleccionada}". 
        
Formatos soportados:
• Latitud, Longitud (ej: 4.5709, -74.2973)
• Latitud,Longitud (ej: 4.5709,-74.2973)
• Coordenadas separadas por espacios (ej: 4.5709 -74.2973)`);
    }
    
    console.log(`🗺️ ${puntosValidos} puntos procesados de la columna "${columnaSeleccionada}"`);
}

// Función para extraer coordenadas de una fila
function extraerCoordenadas(fila, indicesColumnas) {
    let lat = null;
    let lng = null;
    
    // Buscar latitud y longitud en las columnas detectadas
    Object.keys(indicesColumnas).forEach(nombreColumna => {
        const indice = indicesColumnas[nombreColumna];
        const valor = fila[indice];
        
        if (valor && typeof valor === 'string') {
            const valorLimpio = valor.trim();
            const numero = parseFloat(valorLimpio);
            
            if (!isNaN(numero)) {
                const nombreLower = nombreColumna.toLowerCase();
                
                // Detectar latitud
                if (nombreLower.includes('lat') && numero >= -90 && numero <= 90) {
                    lat = numero;
                }
                
                // Detectar longitud
                if ((nombreLower.includes('lng') || nombreLower.includes('lon') || nombreLower.includes('longitud')) 
                    && numero >= -180 && numero <= 180) {
                    lng = numero;
                }
            }
        }
    });
    
    return { lat, lng };
}

// Función para extraer coordenadas de un texto
function extraerCoordenadasDeTexto(texto) {
    if (!texto || typeof texto !== 'string') {
        return { lat: null, lng: null };
    }
    
    const textoLimpio = texto.trim();
    
    // Patrones para diferentes formatos de coordenadas
    const patrones = [
        // Formato: "latitud, longitud" o "latitud,longitud"
        /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
        // Formato: "latitud longitud" (separado por espacio)
        /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/,
        // Formato: "lat:latitud lng:longitud" o "lat:latitud lon:longitud"
        /lat:\s*(-?\d+\.?\d*)\s+l(?:ng|on):\s*(-?\d+\.?\d*)/i,
        // Formato: "latitud;longitud"
        /^(-?\d+\.?\d*)\s*;\s*(-?\d+\.?\d*)$/
    ];
    
    for (const patron of patrones) {
        const coincidencia = textoLimpio.match(patron);
        if (coincidencia) {
            const lat = parseFloat(coincidencia[1]);
            const lng = parseFloat(coincidencia[2]);
            
            // Validar rangos de coordenadas
            if (!isNaN(lat) && !isNaN(lng) && 
                lat >= -90 && lat <= 90 && 
                lng >= -180 && lng <= 180) {
                return { lat, lng };
            }
        }
    }
    
    return { lat: null, lng: null };
}

// Función para crear contenido del popup con información de ubicación
function crearContenidoPopupConUbicacion(fila, numeroFila, columnaUbicacion, valorUbicacion) {
    let contenido = `<div style="max-width: 250px;">
        <h4 style="margin: 0 0 10px 0; color: #059669;">Registro #${numeroFila}</h4>
        <p style="margin: 5px 0; font-size: 12px; background: #f0f9ff; padding: 5px; border-radius: 4px;">
            <strong>📍 ${columnaUbicacion}:</strong><br>${valorUbicacion}
        </p>`;
    
    // Mostrar información de las primeras 4 columnas (excluyendo la de ubicación si está entre ellas)
    let columnasAMostrar = 0;
    const maxColumnas = 4;
    
    for (let i = 0; i < gestionHeaders.length && columnasAMostrar < maxColumnas; i++) {
        const nombreColumna = gestionHeaders[i];
        
        // Saltar la columna de ubicación si ya la mostramos arriba
        if (nombreColumna === columnaUbicacion) continue;
        
        const valor = fila[i] || 'N/A';
        contenido += `<p style="margin: 5px 0; font-size: 12px;">
            <strong>${nombreColumna}:</strong> ${valor}
        </p>`;
        columnasAMostrar++;
    }
    
    const columnasRestantes = gestionHeaders.length - columnasAMostrar - 1; // -1 por la columna de ubicación
    if (columnasRestantes > 0) {
        contenido += `<p style="margin: 5px 0; font-size: 11px; color: #666; font-style: italic;">
            ... y ${columnasRestantes} columnas más
        </p>`;
    }
    
    contenido += '</div>';
    return contenido;
}

// Función para crear contenido del popup
function crearContenidoPopup(fila, numeroFila) {
    let contenido = `<div style="max-width: 250px;"><h4 style="margin: 0 0 10px 0; color: #059669;">Registro #${numeroFila}</h4>`;
    
    // Mostrar información de las primeras 5 columnas o todas si son menos
    const columnasAMostrar = Math.min(5, gestionHeaders.length);
    
    for (let i = 0; i < columnasAMostrar; i++) {
        const nombreColumna = gestionHeaders[i];
        const valor = fila[i] || 'N/A';
        
        contenido += `<p style="margin: 5px 0; font-size: 12px;">
            <strong>${nombreColumna}:</strong> ${valor}
        </p>`;
    }
    
    if (gestionHeaders.length > 5) {
        contenido += `<p style="margin: 5px 0; font-size: 11px; color: #666; font-style: italic;">
            ... y ${gestionHeaders.length - 5} columnas más
        </p>`;
    }
    
    contenido += '</div>';
    return contenido;
}

// Función para centrar el mapa
function centrarMapa() {
    if (!mapaInstancia || !marcadoresGrupo) return;
    
    const marcadores = marcadoresGrupo.getLayers();
    if (marcadores.length === 0) return;
    
    const bounds = L.latLngBounds();
    marcadores.forEach(marcador => {
        bounds.extend(marcador.getLatLng());
    });
    
    mapaInstancia.fitBounds(bounds, { padding: [20, 20] });
    console.log('🗺️ Mapa centrado en todos los marcadores');
}

// Función para exportar ubicaciones
function exportarUbicaciones() {
    if (!gestionData || gestionData.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }
    
    // Crear datos para exportar solo con columnas geográficas
    const datosExportar = [];
    const encabezados = ['Registro', ...columnasGeograficas];
    datosExportar.push(encabezados);
    
    gestionData.forEach((fila, indice) => {
        const filaExportar = [indice + 1];
        
        columnasGeograficas.forEach(columna => {
            const indiceColumna = gestionHeaders.indexOf(columna);
            const valor = indiceColumna !== -1 ? fila[indiceColumna] : 'N/A';
            filaExportar.push(valor);
        });
        
        datosExportar.push(filaExportar);
    });
    
    // Convertir a CSV
    const csvContent = datosExportar.map(fila => 
        fila.map(campo => `"${campo}"`).join(',')
    ).join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ubicaciones_geograficas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('🗺️ Ubicaciones exportadas a CSV');
}





// Función para cerrar modal de selector de columnas
function cerrarSelectorColumnas() {
    const modal = document.getElementById('modalSelectorColumnas');
    if (modal) {
        modal.remove();
        console.log('Modal de selector de columnas cerrado');
    }
}

// ========== FUNCIONES PARA MODO DE DIBUJO ==========

// Función para activar/desactivar el modo de dibujo
function toggleModoDibujo() {
    if (!mapaInstancia) {
        alert('Primero debes cargar el mapa.');
        return;
    }
    
    const botonModo = document.getElementById('btn-modo-dibujo');
    const botonLimpiar = document.getElementById('btn-limpiar-seleccion');
    
    if (modoDibujoActivo) {
        // Desactivar modo de dibujo
        desactivarModoDibujo();
        botonModo.innerHTML = '<i class="fas fa-pencil-alt"></i> Modo Dibujo';
        botonModo.classList.remove('btn-mapa-primary');
        botonModo.classList.add('btn-mapa-secondary');
        botonLimpiar.style.display = 'none';
        console.log('🎨 Modo de dibujo desactivado');
    } else {
        // Activar modo de dibujo
        activarModoDibujo();
        botonModo.innerHTML = '<i class="fas fa-stop"></i> Detener Dibujo';
        botonModo.classList.remove('btn-mapa-secondary');
        botonModo.classList.add('btn-mapa-primary');
        botonLimpiar.style.display = 'inline-block';
        console.log('🎨 Modo de dibujo activado');
    }
}

// Función para activar el modo de dibujo
function activarModoDibujo() {
    modoDibujoActivo = true;
    
    // Cambiar cursor del mapa
    mapaInstancia.getContainer().style.cursor = 'crosshair';
    
    // Agregar eventos de dibujo
    mapaInstancia.on('mousedown', iniciarDibujo);
    mapaInstancia.on('mousemove', continuarDibujo);
    mapaInstancia.on('mouseup', finalizarDibujo);
    
    // Deshabilitar interacciones del mapa durante el dibujo
    mapaInstancia.dragging.disable();
    mapaInstancia.touchZoom.disable();
    mapaInstancia.doubleClickZoom.disable();
    mapaInstancia.scrollWheelZoom.disable();
    mapaInstancia.boxZoom.disable();
    mapaInstancia.keyboard.disable();
    
    console.log('🎨 Eventos de dibujo configurados');
}

// Función para desactivar el modo de dibujo
function desactivarModoDibujo() {
    modoDibujoActivo = false;
    
    // Restaurar cursor del mapa
    mapaInstancia.getContainer().style.cursor = '';
    
    // Remover eventos de dibujo
    mapaInstancia.off('mousedown', iniciarDibujo);
    mapaInstancia.off('mousemove', continuarDibujo);
    mapaInstancia.off('mouseup', finalizarDibujo);
    
    // Rehabilitar interacciones del mapa
    mapaInstancia.dragging.enable();
    mapaInstancia.touchZoom.enable();
    mapaInstancia.doubleClickZoom.enable();
    mapaInstancia.scrollWheelZoom.enable();
    mapaInstancia.boxZoom.enable();
    mapaInstancia.keyboard.enable();
    
    console.log('🎨 Eventos de dibujo removidos');
}

// Variables para el dibujo
let dibujando = false;
let puntosTrazo = [];

// Función para iniciar el dibujo
function iniciarDibujo(e) {
    if (!modoDibujoActivo) return;
    
    dibujando = true;
    puntosTrazo = [e.latlng];
    
    // Crear polyline inicial
    trazoDibujo = L.polyline(puntosTrazo, {
        color: '#ff0000',
        weight: 3,
        opacity: 0.8
    }).addTo(mapaInstancia);
    
    console.log('🎨 Iniciando dibujo en:', e.latlng);
}

// Función para continuar el dibujo
function continuarDibujo(e) {
    if (!modoDibujoActivo || !dibujando || !trazoDibujo) return;
    
    puntosTrazo.push(e.latlng);
    trazoDibujo.setLatLngs(puntosTrazo);
}

// Función para finalizar el dibujo
function finalizarDibujo(e) {
    if (!modoDibujoActivo || !dibujando) return;
    
    dibujando = false;
    
    if (puntosTrazo.length > 2) {
        // Crear una copia del trazo para cerrar el polígono sin modificar el original
        const puntosPoligono = [...puntosTrazo, puntosTrazo[0]];
        trazoDibujo.setLatLngs(puntosPoligono);
        
        // Seleccionar puntos dentro del área dibujada (usar el trazo original sin duplicar)
        seleccionarPuntosEnArea();
    } else {
        // Si el trazo es muy corto, eliminarlo
        if (trazoDibujo) {
            mapaInstancia.removeLayer(trazoDibujo);
            trazoDibujo = null;
        }
    }
    
    console.log('🎨 Dibujo finalizado con', puntosTrazo.length, 'puntos');
}

// Función para seleccionar puntos dentro del área dibujada
function seleccionarPuntosEnArea() {
    if (!trazoDibujo || !marcadoresGrupo) return;
    
    // Limpiar selección anterior
    limpiarSeleccionAnterior();
    
    const marcadores = marcadoresGrupo.getLayers();
    let puntosSeleccionadosCount = 0;
    
    console.log(`🔍 DEBUG: Iniciando selección con ${marcadores.length} marcadores totales`);
    console.log(`🔍 DEBUG: Polígono tiene ${puntosTrazo.length} puntos:`, puntosTrazo);
    
    // Verificar si hay marcadores duplicados
    const posicionesUnicas = new Set();
    const marcadoresDuplicados = [];
    marcadores.forEach((marcador, index) => {
        const pos = marcador.getLatLng();
        const posKey = `${pos.lat},${pos.lng}`;
        if (posicionesUnicas.has(posKey)) {
            marcadoresDuplicados.push({index, posicion: posKey});
        } else {
            posicionesUnicas.add(posKey);
        }
    });
    
    if (marcadoresDuplicados.length > 0) {
        console.log(`⚠️ DEBUG: Se encontraron ${marcadoresDuplicados.length} marcadores duplicados:`, marcadoresDuplicados);
    }
    console.log(`🔍 DEBUG: Posiciones únicas: ${posicionesUnicas.size}`);
    
    // Usar Set para contar solo posiciones únicas seleccionadas
    const posicionesSeleccionadas = new Set();
    
    marcadores.forEach((marcador, index) => {
        const posicion = marcador.getLatLng();
        const posKey = `${posicion.lat},${posicion.lng}`;
        const dentroDelPoligono = puntoEnPoligono(posicion, puntosTrazo);
        
        console.log(`🔍 DEBUG: Marcador ${index + 1} en posición [${posicion.lat}, ${posicion.lng}] - Dentro: ${dentroDelPoligono}`);
        
        // Verificar si el punto está dentro del polígono dibujado
        if (dentroDelPoligono) {
            // Guardar el icono original si no está guardado
            if (!marcador._iconoOriginal) {
                // Obtener el icono actual del marcador
                const iconoActual = marcador.options.icon;
                if (iconoActual) {
                    marcador._iconoOriginal = iconoActual;
                } else {
                    // Si no tiene icono personalizado, crear uno por defecto
                    marcador._iconoOriginal = new L.Icon.Default();
                }
                console.log(`💾 DEBUG: Icono original guardado para marcador ${index + 1}`);
            }
            
            // Crear icono rojo para marcador seleccionado usando divIcon con CSS
            const iconoSeleccionado = L.divIcon({
                className: 'custom-marker-selected',
                html: '<div style="background-color: #ff0000; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>',
                iconSize: [25, 25],
                iconAnchor: [12, 24],
                popupAnchor: [0, -24]
            });
            
            marcador.setIcon(iconoSeleccionado);
            marcadoresSeleccionados.push(marcador);
            
            // Solo contar posiciones únicas
            if (!posicionesSeleccionadas.has(posKey)) {
                posicionesSeleccionadas.add(posKey);
                puntosSeleccionadosCount++;
                console.log(`✅ DEBUG: Marcador ${index + 1} SELECCIONADO - Nueva posición única (Total únicas: ${puntosSeleccionadosCount})`);
            } else {
                console.log(`⚠️ DEBUG: Marcador ${index + 1} SELECCIONADO - Posición duplicada (no se cuenta)`);
            }
        }
    });
    
    console.log(`🎯 RESULTADO: ${puntosSeleccionadosCount} puntos seleccionados dentro del área dibujada`);
    console.log(`🎯 DEBUG: Marcadores seleccionados:`, marcadoresSeleccionados.length);
    
    // Mostrar mensaje con el resultado
    if (puntosSeleccionadosCount > 0) {
        alert(`✅ Se han seleccionado ${puntosSeleccionadosCount} puntos dentro del área dibujada.`);
    } else {
        alert('❌ No se encontraron puntos dentro del área dibujada.');
    }
}

// Función para verificar si un punto está dentro de un polígono (algoritmo ray casting)
function puntoEnPoligono(punto, poligono) {
    const x = punto.lat;
    const y = punto.lng;
    let dentro = false;
    
    for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
        const xi = poligono[i].lat;
        const yi = poligono[i].lng;
        const xj = poligono[j].lat;
        const yj = poligono[j].lng;
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            dentro = !dentro;
        }
    }
    
    return dentro;
}

// Función para limpiar la selección anterior
function limpiarSeleccionAnterior() {
    console.log(`🔄 DEBUG: Restaurando ${marcadoresSeleccionados.length} marcadores seleccionados`);
    
    // Restaurar el icono original de los marcadores seleccionados
    marcadoresSeleccionados.forEach((marcador, index) => {
        if (marcador._iconoOriginal) {
            marcador.setIcon(marcador._iconoOriginal);
            console.log(`✅ DEBUG: Icono original restaurado para marcador ${index + 1}`);
        } else {
            // Si no hay icono original guardado, usar el icono por defecto de Leaflet
            marcador.setIcon(new L.Icon.Default());
            console.log(`⚠️ DEBUG: Usando icono por defecto para marcador ${index + 1} (no había original)`);
        }
    });
    
    marcadoresSeleccionados = [];
    console.log(`🔄 DEBUG: Selección anterior limpiada completamente`);
}

// Función para limpiar la selección y el trazo
function limpiarSeleccion() {
    // Limpiar selección de marcadores
    limpiarSeleccionAnterior();
    
    // Remover el trazo del mapa de forma más robusta
    if (trazoDibujo) {
        try {
            mapaInstancia.removeLayer(trazoDibujo);
        } catch (e) {
            console.warn('Error al remover trazo:', e);
        }
        trazoDibujo = null;
    }
    
    // Limpiar variables de dibujo
    puntosTrazo = [];
    puntosSeleccionados = [];
    dibujando = false;
    
    // Forzar redibujado del mapa para asegurar limpieza visual
    if (mapaInstancia) {
        mapaInstancia.invalidateSize();
    }
    
    console.log('🧹 Selección y trazo limpiados completamente');
    alert('✅ Selección limpiada correctamente.');
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOM] DOM cargado, inicializando dashboard...');
    new DashboardManager();
});