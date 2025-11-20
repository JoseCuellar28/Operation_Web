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
        this.expandAllSections();
        
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

    expandAllSections() {
        console.log('[SECTIONS] Expandiendo todas las secciones por defecto...');
        
        const sections = ['operaciones-diarias', 'seguimiento', 'configuracion'];
        
        sections.forEach(sectionName => {
            const section = document.getElementById(`${sectionName}-section`);
            const header = document.querySelector(`[data-section="${sectionName}"]`);
            const icon = header?.querySelector('.section-icon');
            
            if (section && header && icon) {
                // Asegurar que la sección esté expandida
                section.classList.remove('collapsed');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                console.log('[SECTIONS] Sección expandida:', sectionName);
            }
        });
        
        console.log('[SECTIONS] Todas las secciones expandidas');
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
        
        // Cargar datos específicos según la página
        if (pageName === 'colaboradores') {
            // Usar setTimeout para asegurar que el DOM esté listo
            setTimeout(() => {
                cargarEmpleados();
            }, 100);
        }
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
                
                <!-- Controles de paginación ultra-modernos -->
                <div class="ultra-modern-pagination" id="paginacion-empleados">
                    <div class="pagination-glass-container">
                        <!-- Información de resultados con icono -->
                        <div class="results-info">
                            <div class="results-badge">
                                <svg class="results-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span id="total-empleados" class="results-count">0 empleados</span>
                            </div>
                        </div>
                        
                        <!-- Controles principales con diseño glassmorphism -->
                        <div class="pagination-core">
                            <button id="btn-anterior-empleados" class="nav-btn nav-btn-prev" onclick="paginaAnteriorEmpleados()" title="Página anterior" disabled>
                                <div class="btn-content">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M15 18l-6-6 6-6"></path>
                                    </svg>
                                </div>
                            </button>
                            
                            <div id="numeros-pagina-empleados" class="page-numbers-container">
                                <!-- Se generará dinámicamente -->
                            </div>
                            
                            <button id="btn-siguiente-empleados" class="nav-btn nav-btn-next" onclick="paginaSiguienteEmpleados()" title="Página siguiente" disabled>
                                <div class="btn-content">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M9 18l6-6-6-6"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>
                        
                        <!-- Navegación rápida elegante -->
                        <div class="quick-nav">
                            <div class="page-jump-container">
                                <label class="jump-label">Página</label>
                                <div class="input-wrapper">
                                    <input type="number" id="input-pagina-empleados" class="page-input-ultra" min="1" max="1" value="1" onkeypress="if(event.key==='Enter') irAPaginaEmpleados()">
                                    <span class="input-divider">/</span>
                                    <span id="info-pagina-empleados" class="total-pages">1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                            padding-bottom: 50px;
                            width: 100%;
                            max-width: 100%;
                            box-sizing: border-box;
                            margin: 0;
                            overflow-x: auto;
                            position: relative;
                            min-width: 0;
                            min-height: 100vh;
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
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    margin-top: 30px;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                .colaboradores-botones-left {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                .colaboradores-counter {
                    display: flex;
                    align-items: center;
                }
                .colaboradores-counter-badge {
                    background-color: #e5f3ff;
                    color: #1e40af;
                    border: 1px solid #bfdbfe;
                    padding: 8px 12px;
                    border-radius: 18px;
                    font-weight: 600;
                    font-size: 13px;
                }
                .upload-status-badge {
                    background-color: #fef3c7;
                    color: #92400e;
                    border: 1px solid #fcd34d;
                    padding: 6px 10px;
                    border-radius: 16px;
                    font-weight: 600;
                    font-size: 12px;
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
                
                .estado-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .estado-badge.activo {
                    background-color: #dcfce7;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }
                
                .estado-badge.inactivo {
                    background-color: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
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
                /* Paginación mejorada */
                .pagination-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 16px;
                }
                .pagination-info { display: flex; gap: 12px; align-items: center; }
                .pagination-controls { display: flex; gap: 8px; align-items: center; }
                .pagination-numbers { display: flex; gap: 6px; align-items: center; }
                .pagination-number { padding: 4px 8px; border-radius: 6px; border: 1px solid #e5e7eb; cursor: pointer; }
                .pagination-number.active { background: #e5f3ff; color: #1e3a8a; border-color: #bfdbfe; font-weight: 600; }
                .upload-form-grid { display: grid; grid-template-columns: 160px 160px 180px 120px; gap: 8px; align-items: center; }
                .upload-input { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; }
            </style>
            
            <div class="colaboradores-container">
                <h1 class="colaboradores-titulo">GESTIÓN DE COLABORADORES</h1>
                
                <div class="colaboradores-botones">
                    <div class="colaboradores-botones-left">
                        <button class="colaboradores-btn-descargar" onclick="descargarPlantillaColaboradores()">
                            <i class="fas fa-download"></i> Descargar Archivo
                        </button>
                        <button class="colaboradores-btn-cargar" onclick="guardarPlantillaColaboradores()">
                            <i class="fas fa-upload"></i> Cargar Archivo
                        </button>
                        <button class="colaboradores-btn-crear" onclick="mostrarModalNuevoEmpleado()">
                            <i class="fas fa-plus"></i> Crear Nuevo
                        </button>
                        <button class="colaboradores-btn-limpiar" onclick="limpiarFiltrosColaboradores()">
                            <i class="fas fa-filter"></i> Limpiar Filtros
                        </button>
                    </div>
                    <div class="upload-form-grid">
                        <input id="inputHojaExcel" class="upload-input" type="text" placeholder="Hoja (opcional)">
                        <input id="inputHeaderRow" class="upload-input" type="number" placeholder="Fila encabezado (-1)" value="-1">
                        <input id="inputUsecols" class="upload-input" type="text" placeholder="Columnas (ej. B:AA)">
                        <select id="selectPageSize" class="upload-input" onchange="setPageSize(this.value)">
                            <option value="25" selected>25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="colaboradores-counter">
                        <span id="contador-colaboradores" class="colaboradores-counter-badge">Mostrando 0 de 0</span>
                    </div>
                </div>
                
                <div class="colaboradores-search-container">
                    <input type="text" id="buscarColaboradores" class="colaboradores-search-input" placeholder="Buscar en todos los colaboradores...">
                </div>
                
                <table class="colaboradores-table" id="tablaColaboradoresMinimalista">
                    <thead>
                        <tr>
                            <th class="colaboradores-sortable" data-sort="0" onclick="ordenarTablaColaboradores(0)">DNI</th>
                            <th class="colaboradores-sortable" data-sort="1" onclick="ordenarTablaColaboradores(1)">Inspector</th>
                            <th class="colaboradores-sortable" data-sort="2" onclick="ordenarTablaColaboradores(2)">Teléfono</th>
                            <th class="colaboradores-sortable" data-sort="3" onclick="ordenarTablaColaboradores(3)">Distrito</th>
                            <th class="colaboradores-sortable" data-sort="4" onclick="ordenarTablaColaboradores(4)">Tipo</th>
                            <th class="colaboradores-sortable" data-sort="5" onclick="ordenarTablaColaboradores(5)">Estado</th>
                            <th class="colaboradores-sortable" data-sort="6" onclick="ordenarTablaColaboradores(6)">Fecha Inicio</th>
                            <th class="colaboradores-sortable" data-sort="7" onclick="ordenarTablaColaboradores(7)">Fecha Cese</th>
                            <th class="colaboradores-sortable" data-sort="8" onclick="ordenarTablaColaboradores(8)">Fecha Creación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="colaboradores-tbody">
                        <tr class="colaboradores-filter-row">
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar DNI..." onkeyup="filtrarPorColumnaColaboradores(0, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar inspector..." onkeyup="filtrarPorColumnaColaboradores(1, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar teléfono..." onkeyup="filtrarPorColumnaColaboradores(2, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar distrito..." onkeyup="filtrarPorColumnaColaboradores(3, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar tipo..." onkeyup="filtrarPorColumnaColaboradores(4, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar estado..." onkeyup="filtrarPorColumnaColaboradores(5, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar fecha inicio..." onkeyup="filtrarPorColumnaColaboradores(6, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar fecha cese..." onkeyup="filtrarPorColumnaColaboradores(7, this.value)"></td>
                            <td><input type="text" class="colaboradores-filter-input" placeholder="Filtrar fecha creación..." onkeyup="filtrarPorColumnaColaboradores(8, this.value)"></td>
                            <td></td>
                        </tr>
                        <!-- Los datos se cargarán dinámicamente desde la API -->
                    </tbody>
                </table>
                
                <!-- Controles de paginación -->
                <div class="pagination-container" id="paginacion-empleados">
                    <div class="pagination-info">
                        <span id="info-pagina-empleados">Página 1 de 1</span>
                        <span id="total-empleados">Total: 0 empleados</span>
                    </div>
                    <div class="pagination-controls">
                        <button id="btn-anterior-empleados" class="pagination-btn" onclick="paginaAnteriorEmpleados()" disabled>
                            ← Anterior
                        </button>
                        
                        <!-- Selector numérico de páginas -->
                        <div class="pagination-numbers" id="pagination-numbers">
                            <!-- Se generará dinámicamente -->
                        </div>
                        
                        <button id="btn-siguiente-empleados" class="pagination-btn" onclick="paginaSiguienteEmpleados()" disabled>
                            Siguiente →
                        </button>
                    </div>
                    <div class="pagination-jump">
                        <span>Ir a página:</span>
                        <input type="number" id="input-pagina-empleados" min="1" max="1" value="1" onkeypress="if(event.key==='Enter') irAPaginaEmpleados()">
                        <button class="pagination-btn-small" onclick="irAPaginaEmpleados()">Ir</button>
                    </div>
                </div>
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
    actualizarContadorColaboradores();
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
    const colIndex = parseInt(columna, 10);
    filas.sort((a, b) => {
        const valorA = a.cells[colIndex].textContent.trim();
        const valorB = b.cells[colIndex].textContent.trim();
        
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
    const searchInput = document.getElementById('buscarColaboradores');
    const busqueda = (searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '');
    const filtros = filtrosActualesColaboradores || {};
    const fieldMap = { 0:'dni', 1:'inspector', 2:'telefono', 3:'distrito', 4:'tipo', 5:'estado', 6:'fechaInicio', 7:'fechaCese', 8:'fechaCreacion' };
    empleadosFiltrados = todosLosEmpleados.filter(emp => {
        let ok = true;
        for (const idx of Object.keys(filtros)) {
            const val = (filtros[idx] || '').toLowerCase();
            if (!val) continue;
            const key = fieldMap[idx];
            const raw = emp[key];
            const cell = (raw == null ? '' : raw).toString().toLowerCase();
            if (!cell.includes(val)) { ok = false; break; }
        }
        if (ok && busqueda) {
            const rowText = [emp.dni, emp.inspector, emp.telefono, emp.distrito, emp.tipo, emp.estado, emp.fechaInicio, emp.fechaCese, emp.fechaCreacion]
                .map(x => (x||'').toString().toLowerCase()).join(' ');
            if (!rowText.includes(busqueda)) ok = false;
        }
        return ok;
    });
    paginaActualEmpleados = 1;
    mostrarEmpleadosPaginados();
    actualizarControlesPaginacion();
    actualizarContadorColaboradores();
}

function getColumnaIndex(columna) {
    if (typeof columna === 'number') return columna;
    const columnas = {
        'dni': 0,
        'inspector': 1,
        'telefono': 2,
        'distrito': 3,
        'tipo': 4,
        'estado': 5,
        'fecha_inicio': 6,
        'fecha_cese': 7,
        'fecha_creacion': 8
    };
    return columnas[columna] ?? 0;
}

function inicializarColaboradores() {
    console.log('[EMPLEADOS] Inicializando funcionalidad...');
    
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
    
    // Cargar datos de empleados desde la API
    cargarEmpleados();
    
    console.log('[EMPLEADOS] Funcionalidad inicializada');
}

// Variables globales para paginación de empleados
let todosLosEmpleados = [];
let empleadosFiltrados = [];
let paginaActualEmpleados = 1;
let empleadosPorPagina = 25;
let totalEmpleadosAll = 0;
let empleadosPagina = [];

// Función para cargar empleados desde la API
async function cargarEmpleados() {
    try {
        const fuentesFase4 = [
            'http://localhost:5051/api/personal',
            'http://127.0.0.1:5051/api/personal'
        ];
        for (let url of fuentesFase4) {
            url = `${url}?limit=2000&offset=0&order_by=FechaCreacion&order_dir=DESC&t=${Date.now()}`;
            try {
                console.log('[EMPLEADOS] Cargando datos (Fase4):', url);
                const alt = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-cache' });
                if (!alt.ok) { continue; }
                const payload = await alt.json();
                const rows = Array.isArray(payload.data) ? payload.data : [];
                if (rows.length > 0) {
                    const mapped = rows.map(r => ({
                        dni: r.dni || '',
                        inspector: r.inspector || '',
                        telefono: r.telefono || '',
                        distrito: r.distrito || '',
                        tipo: r.tipo || '',
                        estado: (r.estado || ''),
                        fechaInicio: r.fechainicio || null,
                        fechaCese: r.fechacese || null,
                        fechaCreacion: r.fechacreacion || null
                    }));
                    todosLosEmpleados = mapped;
                    empleadosFiltrados = [...todosLosEmpleados];
                    paginaActualEmpleados = 1;
                    mostrarEmpleadosPaginados();
                    actualizarControlesPaginacion();
                    console.log('[EMPLEADOS] Datos cargados desde Fase4');
                    return;
                }
            } catch (e) {
                console.warn('[EMPLEADOS] Fase4 no disponible en', url, e);
            }
        }
        const fuentesNet = [
            'http://localhost:5132/api/empleados',
            'http://127.0.0.1:5132/api/empleados'
        ];
        for (let url of fuentesNet) {
            url = `${url}?t=${Date.now()}`;
            try {
                console.log('[EMPLEADOS] Cargando datos (API .NET):', url);
                const response = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-cache' });
                if (!response.ok) { continue; }
                const empleados = await response.json();
                if (Array.isArray(empleados) && empleados.length > 0) {
                    const mapped = empleados.map(e => ({
                        dni: e.numeroDocumento || '',
                        inspector: e.nombreCompleto || '',
                        telefono: e.telefono || '',
                        distrito: e.distrito || '',
                        tipo: e.cargo || '',
                        estado: (e.activo ? 'Activo' : 'Inactivo'),
                        fechaInicio: e.fechaInicio || null,
                        fechaCese: e.fechaCese || null,
                        fechaCreacion: e.fechaCreacion || null
                    }));
                    todosLosEmpleados = mapped;
                    empleadosFiltrados = [...todosLosEmpleados];
                    paginaActualEmpleados = 1;
                    mostrarEmpleadosPaginados();
                    actualizarControlesPaginacion();
                    console.log('[EMPLEADOS] Datos cargados desde API .NET');
                    return;
                }
            } catch (e) {
                console.warn('[EMPLEADOS] API .NET no disponible en', url, e);
            }
        }
        console.log('[EMPLEADOS] Mostrando datos de prueba');
        mostrarDatosPrueba();
    } catch (error) {
        console.error('[EMPLEADOS] Error al cargar datos:', error);
        mostrarDatosPrueba();
    }
}

// Función para mostrar datos de prueba
function mostrarDatosPrueba() {
    const empleadosPrueba = [
        {
            idEmpleado: 1,
            codigoEmpleado: "EMP001",
            numeroDocumento: "12345678",
            nombreCompleto: "Juan Carlos Pérez García",
            email: "juan.perez@empresa.com",
            telefono: "+1 555-0123",
            usuarioActivo: 'S',
            fechaCreacion: "2024-01-15T10:30:00"
        },
        {
            idEmpleado: 2,
            codigoEmpleado: "EMP002",
            numeroDocumento: "87654321",
            nombreCompleto: "María Elena Rodríguez López",
            email: "maria.rodriguez@empresa.com",
            telefono: "+1 555-0124",
            usuarioActivo: 'S',
            fechaCreacion: "2024-01-20T14:15:00"
        },
        {
            idEmpleado: 3,
            codigoEmpleado: "EMP003",
            numeroDocumento: "11223344",
            nombreCompleto: "Carlos Alberto Mendoza Silva",
            email: "carlos.mendoza@empresa.com",
            telefono: "+1 555-0125",
            usuarioActivo: 'N',
            fechaCreacion: "2024-02-01T09:45:00"
        }
    ];
    
    // Para datos de prueba, también usar paginación
    todosLosEmpleados = empleadosPrueba;
    paginaActualEmpleados = 1;
    mostrarEmpleadosPaginados();
    actualizarControlesPaginacion();
    console.log('[EMPLEADOS] Datos de prueba cargados exitosamente');
}

// Función para mostrar empleados paginados
function mostrarEmpleadosPaginados() {
    const inicio = (paginaActualEmpleados - 1) * empleadosPorPagina;
    const fin = inicio + empleadosPorPagina;
    const base = Array.isArray(empleadosFiltrados) && empleadosFiltrados.length >= 0 ? empleadosFiltrados : todosLosEmpleados;
    const empleadosPagina = base.slice(inicio, fin);
    
    mostrarEmpleadosEnTabla(empleadosPagina);
}

// Función para actualizar los controles de paginación
function actualizarControlesPaginacion() {
    const base = Array.isArray(empleadosFiltrados) && empleadosFiltrados.length >= 0 ? empleadosFiltrados : todosLosEmpleados;
    const totalPaginas = Math.ceil(base.length / empleadosPorPagina);
    
    // Actualizar información de página
    const infoPagina = document.getElementById('info-pagina-empleados');
    if (infoPagina) {
        infoPagina.textContent = `Página ${paginaActualEmpleados} de ${totalPaginas}`;
    }
    
    // Actualizar total de empleados
    const totalEmpleados = document.getElementById('total-empleados');
    if (totalEmpleados) {
        totalEmpleados.textContent = `Total: ${base.length} empleados`;
    }
    
    // Generar números de página
    generarNumerosPagina(totalPaginas);
    
    // Actualizar campo de entrada de página
    const inputPagina = document.getElementById('input-pagina-empleados');
    if (inputPagina) {
        inputPagina.max = totalPaginas;
        inputPagina.value = paginaActualEmpleados;
    }
    
    // Actualizar botones de navegación
    const btnAnterior = document.getElementById('btn-anterior-empleados');
    const btnSiguiente = document.getElementById('btn-siguiente-empleados');
    
    if (btnAnterior) {
        btnAnterior.disabled = paginaActualEmpleados <= 1;
    }
    
    if (btnSiguiente) {
        btnSiguiente.disabled = paginaActualEmpleados >= totalPaginas;
    }
    
    // Mostrar/ocultar controles de paginación si no hay empleados
    const paginacionContainer = document.getElementById('paginacion-empleados');
    if (paginacionContainer) {
        paginacionContainer.style.display = todosLosEmpleados.length > 0 ? 'flex' : 'none';
    }
}

// Función para ir a la página anterior
function paginaAnteriorEmpleados() {
    if (paginaActualEmpleados > 1) {
        paginaActualEmpleados--;
        cargarPaginaEmpleados(paginaActualEmpleados);
    }
}

// Función para ir a la página siguiente
function paginaSiguienteEmpleados() {
    const totalPaginas = Math.ceil((totalEmpleadosAll || 0) / empleadosPorPagina);
    if (paginaActualEmpleados < totalPaginas) {
        paginaActualEmpleados++;
        cargarPaginaEmpleados(paginaActualEmpleados);
    }
}

// Función para generar números de página
function generarNumerosPagina(totalPaginas) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    if (!paginationNumbers) return;
    
    paginationNumbers.innerHTML = '';
    
    if (totalPaginas <= 1) return;
    
    // Lógica para mostrar números de página con elipsis
    const maxVisible = 7; // Máximo de números visibles
    let startPage = 1;
    let endPage = totalPaginas;
    
    if (totalPaginas > maxVisible) {
        const halfVisible = Math.floor(maxVisible / 2);
        
        if (paginaActualEmpleados <= halfVisible + 1) {
            // Cerca del inicio
            endPage = maxVisible - 1;
        } else if (paginaActualEmpleados >= totalPaginas - halfVisible) {
            // Cerca del final
            startPage = totalPaginas - maxVisible + 2;
        } else {
            // En el medio
            startPage = paginaActualEmpleados - halfVisible + 1;
            endPage = paginaActualEmpleados + halfVisible - 1;
        }
    }
    
    // Agregar primera página si no está visible
    if (startPage > 1) {
        agregarNumeroPagina(1);
        if (startPage > 2) {
            agregarElipsis();
        }
    }
    
    // Agregar páginas visibles
    for (let i = startPage; i <= endPage; i++) {
        agregarNumeroPagina(i);
    }
    
    // Agregar última página si no está visible
    if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
            agregarElipsis();
        }
        agregarNumeroPagina(totalPaginas);
}
}

// Función auxiliar para agregar un número de página
function agregarNumeroPagina(numeroPagina) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const span = document.createElement('span');
    span.className = 'pagination-number';
    span.textContent = numeroPagina;
    span.onclick = () => irAPaginaEspecifica(numeroPagina);
    
    if (numeroPagina === paginaActualEmpleados) {
        span.classList.add('active');
    }
    
    paginationNumbers.appendChild(span);
}

// Función auxiliar para agregar elipsis
function agregarElipsis() {
    const paginationNumbers = document.getElementById('pagination-numbers');
    if (!paginationNumbers) return;
    const span = document.createElement('span');
    span.className = 'pagination-ellipsis';
    span.textContent = '...';
    paginationNumbers.appendChild(span);
}

// Función para ir a una página específica
function irAPaginaEspecifica(numeroPagina) {
    const totalPaginas = Math.ceil((totalEmpleadosAll || 0) / empleadosPorPagina);
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
        paginaActualEmpleados = numeroPagina;
        cargarPaginaEmpleados(paginaActualEmpleados);
    }
}

// Función para ir a página desde el input
function irAPaginaEmpleados() {
    const inputPagina = document.getElementById('input-pagina-empleados');
    if (inputPagina) {
        const numeroPagina = parseInt(inputPagina.value);
        if (!isNaN(numeroPagina)) {
            irAPaginaEspecifica(numeroPagina);
        }
    }
}

// Función para mostrar empleados en la tabla
function mostrarEmpleadosEnTabla(empleados) {
    const tbody = document.getElementById('colaboradores-tbody');
    if (!tbody) {
        console.error('[EMPLEADOS] No se encontró el tbody de la tabla');
        return;
    }
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (!empleados || empleados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: #6b7280;">No hay colaboradores registrados</td></tr>';
        return;
    }
    
    // Agregar filas de empleados
    empleados.forEach(empleado => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${empleado.dni || ''}</td>
            <td>${empleado.inspector || ''}</td>
            <td>${empleado.telefono || ''}</td>
            <td>${empleado.distrito || ''}</td>
            <td>${empleado.tipo || ''}</td>
            <td>
                <span class="estado-badge ${((empleado.estado || '').toLowerCase() === 'activo') ? 'activo' : ((empleado.estado || '').toLowerCase() === 'inactivo' ? 'inactivo' : 'neutro')}">
                    ${((empleado.estado || '').toLowerCase() === 'activo') ? 'Activo' : ((empleado.estado || '').toLowerCase() === 'inactivo' ? 'Inactivo' : 'Sin estado')}
                </span>
            </td>
            <td>${empleado.fechaInicio ? new Date(empleado.fechaInicio).toLocaleDateString() : ''}</td>
            <td>${empleado.fechaCese ? new Date(empleado.fechaCese).toLocaleDateString() : ''}</td>
            <td>${empleado.fechaCreacion ? new Date(empleado.fechaCreacion).toLocaleDateString() : ''}</td>
            <td>
                <div class="colaboradores-acciones">
                    <button class="colaboradores-btn-ver" onclick="verEmpleado('${empleado.dni || ''}'))" title="Ver colaborador">
                        <i class="fas fa-eye colaboradores-icon"></i>
                    </button>
                    <button class="colaboradores-btn-editar" onclick="editarEmpleado('${empleado.dni || ''}')" title="Editar colaborador">
                        <i class="fas fa-edit colaboradores-icon"></i>
                    </button>
                    <button class="colaboradores-btn-eliminar" onclick="eliminarEmpleado('${empleado.dni || ''}')" title="Eliminar colaborador">
                        <i class="fas fa-trash colaboradores-icon"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    console.log(`[EMPLEADOS] Se mostraron ${empleados.length} empleados en la tabla`);
    actualizarContadorColaboradores();
}

function actualizarContadorColaboradores() {
    const el = document.getElementById('contador-colaboradores');
    if (!el) return;
    const total = todosLosEmpleados.length;
    const filteredTotal = (Array.isArray(empleadosFiltrados) ? empleadosFiltrados.length : total);
    const searchInput = document.getElementById('buscarColaboradores');
    const hasSearch = !!(searchInput && searchInput.value && searchInput.value.trim());
    const hasFilters = Object.values(filtrosActualesColaboradores || {}).some(v => v);
    if (hasSearch || hasFilters) {
        el.textContent = `Coincidencias: ${filteredTotal} de ${total}`;
    } else {
        el.textContent = `Total: ${total} colaboradores`;
    }
}

// Función para mostrar mensajes de error
function mostrarMensajeError(mensaje) {
    const tbody = document.getElementById('colaboradores-tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #dc2626; background-color: #fef2f2;">${mensaje}</td></tr>`;
    }
}

// Funciones de acción para colaboradores
function descargarPlantillaColaboradores() {
    console.log('[COLABORADORES] Descargando plantilla...');
    const headers = ['DNI','Inspector','Telefono','Distrito','Tipo','Estado','FechaInicio','FechaCese'];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_colaboradores.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function guardarPlantillaColaboradores() {
    console.log('[COLABORADORES] Guardando plantilla...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xlsm,.xls';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = async (e) => {
        const file = e.target.files[0];
        try { input.remove(); } catch (e) {}
        if (!file) return;
        const statusEl = document.getElementById('upload-status');
        const btn = document.querySelector('.colaboradores-btn-cargar');
        if (statusEl) statusEl.textContent = 'Procesando archivo...';
        if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
        const form = new FormData();
        form.append('file', file);
        const hoja = document.getElementById('inputHojaExcel') ? document.getElementById('inputHojaExcel').value : '';
        const headerRow = document.getElementById('inputHeaderRow') ? document.getElementById('inputHeaderRow').value : '-1';
        const usecols = document.getElementById('inputUsecols') ? document.getElementById('inputUsecols').value : '';
        form.append('hoja', hoja);
        form.append('header_row', headerRow);
        form.append('usecols', usecols);
        try {
            let resPrev = await fetch('http://localhost:5051/api/preview-excel', { method: 'POST', body: form });
            if (!resPrev.ok) {
                resPrev = await fetch('http://127.0.0.1:5051/api/preview-excel', { method: 'POST', body: form });
            }
            const prev = await resPrev.json();
            if (resPrev.ok && prev.success) {
                window.__ultimoFormDataExcel = form;
                abrirModalPreview(prev);
                if (statusEl) statusEl.textContent = '';
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
                return;
            }
            let res = await fetch('http://localhost:5051/api/upload-excel', { method: 'POST', body: form });
            if (!res.ok) {
                res = await fetch('http://127.0.0.1:5051/api/upload-excel', { method: 'POST', body: form });
            }
            const data = await res.json();
            if (res.ok && data.success) {
                const stg = (data.staging && typeof data.staging.inserted === 'number') ? data.staging.inserted : 0;
                const ins = (data.snapshot && typeof data.snapshot.inserted === 'number') ? data.snapshot.inserted : 0;
                const upd = (data.snapshot && typeof data.snapshot.updated === 'number') ? data.snapshot.updated : 0;
                let msg = `Procesado: Únicos ${data.resumen.colaboradores_unicos}, Staging +${stg}, Snapshot +${ins}/~${upd}`;
                if (data.errors) {
                    const parts = [];
                    if (data.errors.staging) parts.push(`Staging: ${data.errors.staging}`);
                    if (data.errors.snapshot) parts.push(`Snapshot: ${data.errors.snapshot}`);
                    if (data.errors.audit) parts.push(`Audit: ${data.errors.audit}`);
                    if (parts.length) msg += ` (Errores: ${parts.join('; ')})`;
                }
                if (statusEl) statusEl.textContent = msg;
                cargarEmpleados();
            } else {
                if (statusEl) statusEl.textContent = `Error: ${data.message || 'desconocido'}`;
            }
        } catch (err) {
            if (statusEl) statusEl.textContent = `Error de conexión: ${err.message}`;
        }
        setTimeout(() => { if (statusEl) statusEl.textContent = ''; if (btn) { btn.disabled = false; btn.style.opacity = '1'; } }, 5000);
    };
    input.click();
}

function abrirModalPreview(prev) {
    const overlay = document.getElementById('preview-modal');
    const sum = document.getElementById('preview-summary');
    const thead = document.getElementById('preview-thead');
    const tbody = document.getElementById('preview-tbody');
    if (!overlay || !sum || !thead || !tbody) return;
    sum.innerHTML = '';
    thead.innerHTML = '';
    tbody.innerHTML = '';
    const chips = [
        `Filas: ${prev.rows ? prev.rows.length : 0}`,
        `Campos: ${prev.columns ? prev.columns.length : 0}`,
        `Únicos: ${prev.resumen && prev.resumen.colaboradores_unicos ? prev.resumen.colaboradores_unicos : 0}`
    ];
    chips.forEach(t => { const s = document.createElement('span'); s.className = 'chip'; s.textContent = t; sum.appendChild(s); });
    if (Array.isArray(prev.columns)) {
        const tr = document.createElement('tr');
        prev.columns.forEach(c => { const th = document.createElement('th'); th.textContent = c; tr.appendChild(th); });
        thead.appendChild(tr);
    }
    if (Array.isArray(prev.rows)) {
        prev.rows.forEach(r => { const tr = document.createElement('tr'); (prev.columns||[]).forEach(c => { const td = document.createElement('td'); td.textContent = r[c] == null ? '' : String(r[c]); tr.appendChild(td); }); tbody.appendChild(tr); });
    }
    overlay.style.display = 'flex';
}

function cerrarModalPreview() { const overlay = document.getElementById('preview-modal'); if (overlay) overlay.style.display = 'none'; }

async function confirmarCargaExcel() {
    const overlay = document.getElementById('preview-modal');
    const statusEl = document.getElementById('upload-status');
    const form = window.__ultimoFormDataExcel;
    if (!form) { cerrarModalPreview(); return; }
    try {
        let res = await fetch('http://localhost:5051/api/upload-excel', { method: 'POST', body: form });
        if (!res.ok) { res = await fetch('http://127.0.0.1:5051/api/upload-excel', { method: 'POST', body: form }); }
        const data = await res.json();
        const stg = (data.staging && typeof data.staging.inserted === 'number') ? data.staging.inserted : 0;
        const ins = (data.snapshot && typeof data.snapshot.inserted === 'number') ? data.snapshot.inserted : 0;
        const upd = (data.snapshot && typeof data.snapshot.updated === 'number') ? data.snapshot.updated : 0;
        let msg = `Procesado: Únicos ${data.resumen && data.resumen.colaboradores_unicos ? data.resumen.colaboradores_unicos : 0}, Staging +${stg}, Snapshot +${ins}/~${upd}`;
        if (data.errors) {
            const parts = [];
            if (data.errors.staging) parts.push(`Staging: ${data.errors.staging}`);
            if (data.errors.snapshot) parts.push(`Snapshot: ${data.errors.snapshot}`);
            if (data.errors.audit) parts.push(`Audit: ${data.errors.audit}`);
            if (parts.length) msg += ` (Errores: ${parts.join('; ')})`;
        }
        if (statusEl) statusEl.textContent = msg;
        cerrarModalPreview();
        cargarEmpleados();
    } catch (e) {
        if (statusEl) statusEl.textContent = `Error de conexión: ${e.message}`;
        cerrarModalPreview();
    }
    window.__ultimoFormDataExcel = null;
}

function mostrarModalNuevoEmpleado() {
    const modalHTML = `
        <div class="modal-overlay" id="modalNuevoEmpleado" style="position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-color: rgba(0, 0, 0, 0.5) !important; display: flex !important; justify-content: center !important; align-items: center !important; z-index: 99999 !important;">
            <div class="modal-container" style="background: white; border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; position: relative;">
                <!-- Header del Modal -->
                <div class="modal-header" style="padding: 24px 32px 16px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="modal-title" style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">NUEVO EMPLEADO</h2>
                    <button class="modal-close" onclick="cerrarModalNuevoEmpleado()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 6px; transition: all 0.3s ease;">&times;</button>
                </div>
                
                <!-- Contenido del Modal -->
                <div class="modal-content" style="padding: 24px 32px; display: flex; gap: 32px;">
                    <!-- Sección Izquierda - Imagen -->
                    <div class="modal-left-section" style="flex: 0 0 200px;">
                        <div class="image-placeholder" style="width: 200px; height: 200px; border: 2px dashed #d1d5db; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb; margin-bottom: 16px;">
                            <div class="image-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
                                <i class="fas fa-user" style="font-size: 32px; color: white;"></i>
                            </div>
                            <div class="image-text" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6b7280; text-align: center;">Foto del Empleado</div>
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
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Código Empleado *</label>
                                <input type="text" id="codigo" class="form-input" placeholder="Ej: EMP001" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Número de Documento *</label>
                                <input type="text" id="numeroDocumento" class="form-input" placeholder="Ej: 12345678" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Nombre Completo *</label>
                                <input type="text" id="nombreCompleto" class="form-input" placeholder="Ej: Juan Carlos Pérez García" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Email *</label>
                                <input type="email" id="email" class="form-input" placeholder="ejemplo@empresa.com" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Teléfono</label>
                                <input type="tel" id="telefono" class="form-input" placeholder="+1 555-0123" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                        </div>
                        
                        <!-- Información Laboral -->
                        <div class="section-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 18px; font-weight: 600; color: #1e3a8a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Información Laboral</div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Empresa ID</label>
                                <input type="number" id="empresaId" class="form-input" placeholder="1" value="1" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; transition: border-color 0.3s ease; box-sizing: border-box;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">Estado</label>
                                <select id="activo" class="form-select" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: white; transition: border-color 0.3s ease; box-sizing: border-box;">
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer del Modal -->
                <div class="modal-footer" style="padding: 16px 32px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn-secondary" onclick="cerrarModalNuevoEmpleado()" style="padding: 12px 24px; background: white; border: 2px solid #6b7280; color: #6b7280; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Cancelar</button>
                    <button class="btn-primary" onclick="guardarNuevoEmpleado()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">Guardar Nuevo Empleado</button>
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

// Funciones para empleados
function verEmpleado(id) {
    console.log('[EMPLEADOS] Viendo empleado:', id);
    alert(`Viendo detalles del empleado: ${id}`);
}

async function editarEmpleado(id) {
    console.log('[EMPLEADOS] Editando empleado:', id);
    try {
        const response = await fetch(`http://localhost:5132/api/empleados/${id}`);
        if (response.ok) {
            const empleado = await response.json();
            console.log('[EMPLEADOS] Datos del empleado:', empleado);
            alert(`Editando empleado: ${empleado.nombreCompleto || id}`);
        } else {
            alert('Error al cargar los datos del empleado');
        }
    } catch (error) {
        console.error('[EMPLEADOS] Error al cargar empleado:', error);
        alert('Error al cargar los datos del empleado');
    }
}

async function eliminarEmpleado(id) {
    console.log('[EMPLEADOS] Eliminando empleado:', id);
    if (confirm(`¿Estás seguro de que quieres eliminar el empleado ${id}?`)) {
        try {
            const response = await fetch(`http://localhost:5132/api/empleados/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert(`Empleado ${id} eliminado correctamente`);
                // Recargar la tabla
                cargarEmpleados();
            } else {
                alert('Error al eliminar el empleado');
            }
        } catch (error) {
            console.error('[EMPLEADOS] Error al eliminar empleado:', error);
            alert('Error al eliminar el empleado');
        }
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

// Función para cerrar modal de nuevo empleado
function cerrarModalNuevoEmpleado() {
    const modal = document.getElementById('modalNuevoEmpleado');
    if (modal) {
        modal.remove();
        console.log('Modal de nuevo empleado cerrado');
    }
}

// Función para guardar nuevo empleado
async function guardarNuevoEmpleado() {
    const modal = document.getElementById('modalNuevoEmpleado');
    if (!modal) {
        alert('Error: No se puede encontrar el modal. Por favor, recargue la página e intente nuevamente.');
        return;
    }
    
    // Obtener valores de los campos
    const codigo = document.getElementById('codigo').value.trim();
    const numeroDocumento = document.getElementById('numeroDocumento').value.trim();
    const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const empresaId = parseInt(document.getElementById('empresaId').value);
    const activo = document.getElementById('activo').value === 'true';
    
    // Validar campos obligatorios
    if (!codigo || !numeroDocumento || !nombreCompleto || !email) {
        alert('Por favor complete los campos obligatorios: Código, Número de Documento, Nombre Completo y Email');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor ingrese un email válido');
        return;
    }
    
    // Crear objeto empleado
    const empleado = {
        codigo: codigo,
        numeroDocumento: numeroDocumento,
        nombreCompleto: nombreCompleto,
        email: email,
        telefono: telefono || null,
        empresaId: empresaId,
        activo: activo
    };
    
    try {
        // Enviar datos a la API
        const response = await fetch('http://localhost:5132/api/empleados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(empleado)
        });
        
        if (response.ok) {
            const nuevoEmpleado = await response.json();
            alert('Empleado creado exitosamente');
            cerrarModalNuevoEmpleado();
            // Recargar la tabla de empleados
            cargarEmpleados();
        } else {
            const errorData = await response.json();
            alert(`Error al crear empleado: ${errorData.message || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error al crear empleado:', error);
        // Simular guardado exitoso para demostración
        alert('Empleado creado exitosamente (modo demostración - sin conexión a BD)');
        cerrarModalNuevoEmpleado();
        // Recargar la tabla con datos de prueba
        mostrarDatosPrueba();
    }
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
async function compartirConBD() {
    const successDiv = document.getElementById('gestionSuccess');
    const errorDiv = document.getElementById('gestionError');
    
    if (!gestionData || gestionData.length === 0) {
        showMessage(errorDiv, 'No hay datos para compartir. Cargue un archivo primero.');
        return;
    }
    
    try {
        // Mostrar estado de carga
        showMessage(successDiv, 'Enviando datos a la base de datos...');
        
        // Preparar datos para enviar al backend
        const requestData = {
            headers: gestionHeaders,
            data: gestionData,
            fileName: currentFile,
            sheetName: currentSheetData ? currentSheetData.name : 'Sheet1'
        };
        
        // Realizar llamada al backend
        const response = await fetch('http://localhost:5132/api/OperacionesDiarias/compartir-excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage(successDiv, `✅ ${result.message}`);
            console.log('✅ Datos compartidos exitosamente con BD:', result);
        } else {
            throw new Error(result.message || 'Error desconocido del servidor');
        }
        
    } catch (error) {
        console.error('❌ Error al compartir con BD:', error);
        showMessage(errorDiv, `❌ Error al conectar con la base de datos: ${error.message}`);
    }
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
let asignaciones = [];

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
    
    // Crear selector de columnas para ubicación con detección automática
    crearSelectorColumnasUbicacionMejorado();
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Auto-detectar y cargar mapa si hay columnas geográficas
    autoDetectarYCargarMapa();
    
    console.log('🗺️ Modal de mapa abierto con', gestionData.length, 'registros');
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
    const contenedorMapa = document.getElementById('mapa-leaflet');
    if (!contenedorMapa) return;
    
    // Limpiar mapa anterior si existe
    if (mapaInstancia) {
        mapaInstancia.remove();
    }
    
    // Crear nueva instancia del mapa centrado en Colombia
    mapaInstancia = L.map('mapa-leaflet').setView([4.5709, -74.2973], 6);
    
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
    const contenedorMapa = document.getElementById('mapa-leaflet');
    if (!contenedorMapa) return;
    
    // Limpiar mapa anterior si existe
    if (mapaInstancia) {
        mapaInstancia.remove();
    }
    
    // Crear nueva instancia del mapa centrado en Colombia
    mapaInstancia = L.map('mapa-leaflet').setView([4.5709, -74.2973], 6);
    
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
    
    // Mostrar menú desplegable con el resultado
    if (puntosSeleccionadosCount > 0) {
        mostrarMenuPuntosSeleccionados(puntosSeleccionadosCount);
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

// ========================================
// FUNCIONES PARA MENÚ DE PUNTOS SELECCIONADOS
// ========================================

// Función para mostrar el menú de puntos seleccionados
function mostrarMenuPuntosSeleccionados() {
    const menu = document.getElementById('menu-lateral-puntos');
    const contador = document.getElementById('contador-puntos');
    const cantidadPuntos = marcadoresSeleccionados.length;
    
    if (menu && contador) {
        contador.textContent = cantidadPuntos;
        menu.style.display = 'flex'; // Cambiar a flex para el diseño lateral
        console.log(`📋 Menú lateral de puntos seleccionados mostrado con ${cantidadPuntos} puntos`);
    } else {
        console.error('❌ No se encontró el menú de puntos seleccionados en el DOM');
        // Fallback al alert original
        alert(`✅ Se han seleccionado ${cantidadPuntos} puntos.`);
    }
}

// Función para cerrar el menú de puntos seleccionados
function cerrarMenuPuntos() {
    const menu = document.getElementById('menu-lateral-puntos');
    if (menu) {
        menu.style.display = 'none';
        console.log('📋 Menú lateral de puntos seleccionados cerrado');
    }
}

// Función para asignar cuadrilla a los puntos seleccionados
function asignarCuadrilla() {
    console.log('🔧 asignarCuadrilla() llamada - Marcadores:', marcadoresSeleccionados.length);
    
    if (marcadoresSeleccionados.length === 0) {
        alert('❌ No hay puntos seleccionados.\n\nPara usar esta función:\n1. Dibuja un área en el mapa\n2. Selecciona puntos dentro del área\n3. Usa este botón para asignar cuadrillas');
        return;
    }
    
    try {
        mostrarListaCuadrillas();
        console.log('✅ Lista de cuadrillas mostrada correctamente');
    } catch (error) {
        console.error('❌ Error al mostrar lista de cuadrillas:', error);
        alert('❌ Error al mostrar la lista de cuadrillas. Revisa la consola para más detalles.');
    }
}

// Función para programar tarea en los puntos seleccionados
function programarTarea() {
    console.log('📅 programarTarea() llamada - Marcadores:', marcadoresSeleccionados.length);
    
    if (marcadoresSeleccionados.length === 0) {
        alert('❌ No hay puntos seleccionados.\n\nPara usar esta función:\n1. Dibuja un área en el mapa\n2. Selecciona puntos dentro del área\n3. Usa este botón para programar tareas');
        return;
    }
    
    // Por ahora, mostrar un mensaje simple
    alert(`📅 Función "Programar Tarea" en desarrollo.\nPuntos seleccionados: ${marcadoresSeleccionados.length}`);
    console.log('📅 Programar tarea - Puntos seleccionados:', marcadoresSeleccionados.length);
}

// Función para mostrar lista de cuadrillas
function mostrarListaCuadrillas() {
    const listaCuadrillas = document.querySelector('.lista-cuadrillas');
    
    if (listaCuadrillas) {
        listaCuadrillas.style.display = 'flex';
        console.log('✅ Lista de cuadrillas mostrada - Menú principal permanece visible');
    }
}

// Función para mostrar lista de efectivos policiales
function mostrarListaEfectivos() {
    const listaEfectivos = document.querySelector('#lista-efectivos');
    
    if (!listaEfectivos) {
        console.error('❌ No se encontró el elemento #lista-efectivos');
        return;
    }
    
    // Mostrar lista de efectivos sin ocultar el menú principal
    listaEfectivos.style.display = 'flex';
    console.log('✅ Lista de efectivos mostrada - Menú principal permanece visible');
}

// Función para cerrar lista de cuadrillas
function cerrarListaCuadrillas() {
    const listaCuadrillas = document.querySelector('.lista-cuadrillas');
    
    if (listaCuadrillas) {
        listaCuadrillas.style.display = 'none';
        console.log('✅ Lista de cuadrillas cerrada - Menú principal permanece visible');
    }
}

// Función para cerrar lista de efectivos
function cerrarListaEfectivos() {
    const listaEfectivos = document.querySelector('#lista-efectivos');
    
    if (listaEfectivos) {
        listaEfectivos.style.display = 'none';
        console.log('✅ Lista de efectivos cerrada - Menú principal permanece visible');
    }
}

// Función para seleccionar cuadrilla específica
function seleccionarCuadrilla(nombre, detalle) {
    if (marcadoresSeleccionados.length === 0) {
        return;
    }
    
    // Aquí se implementaría la lógica para asignar la cuadrilla específica
    console.log(`Cuadrilla asignada: ${nombre} - ${detalle} - Puntos: ${marcadoresSeleccionados.length}`);
    alert(`✅ Cuadrilla "${nombre}" asignada a ${marcadoresSeleccionados.length} puntos seleccionados.`);
    
    // Volver al menú principal en lugar de cerrar todo
    cerrarListaCuadrillas();
}

// Función de retry logic para asignación de efectivos
async function seleccionarEfectivoConReintento(nombre, detalle, maxIntentos = 3) {
    console.log(`🔄 Iniciando asignación con retry logic - Máximo ${maxIntentos} intentos`);
    
    for (let intento = 1; intento <= maxIntentos; intento++) {
        console.log(`🔄 Intento ${intento} de ${maxIntentos} para asignar efectivo: ${nombre}`);
        
        try {
            // Verificar estado antes del intento
            if (!marcadoresSeleccionados || marcadoresSeleccionados.length === 0) {
                console.log(`⚠️ Intento ${intento}: No hay marcadores seleccionados`);
                
                if (intento < maxIntentos) {
                    console.log(`⏳ Esperando 500ms antes del siguiente intento...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                } else {
                    console.log(`❌ Todos los intentos fallaron - No hay marcadores seleccionados`);
                    alert('Error: No se pudo completar la asignación después de varios intentos.\n\nPor favor:\n1. Selecciona un punto en el mapa\n2. Verifica que aparezca el contador de puntos seleccionados\n3. Intenta nuevamente');
                    return false;
                }
            }
            
            // Intentar la asignación
            const resultado = seleccionarEfectivo(nombre, detalle);
            
            if (resultado !== false) {
                console.log(`✅ Asignación exitosa en intento ${intento}`);
                return true;
            } else {
                console.log(`❌ Intento ${intento} falló`);
                if (intento < maxIntentos) {
                    console.log(`⏳ Esperando 1000ms antes del siguiente intento...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
        } catch (error) {
            console.error(`❌ Error en intento ${intento}:`, error);
            if (intento < maxIntentos) {
                console.log(`⏳ Esperando 1000ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    console.log(`❌ Todos los ${maxIntentos} intentos fallaron`);
    alert(`Error: No se pudo completar la asignación después de ${maxIntentos} intentos.\n\nPor favor, recarga la página e intenta nuevamente.`);
    return false;
}

// Función para seleccionar efectivo específico
function seleccionarEfectivo(nombre, detalle) {
    console.log('🔍 DEBUG - seleccionarEfectivo() iniciada');
    console.log('🔍 DEBUG - Parámetros recibidos:', { nombre, detalle });
    
    // VALIDACIÓN ROBUSTA - Verificar que marcadoresSeleccionados esté inicializado y tenga elementos
    if (!marcadoresSeleccionados) {
        console.error('❌ CRÍTICO - marcadoresSeleccionados no está inicializado');
        marcadoresSeleccionados = []; // Inicializar si no existe
        alert('Error del sistema: Array de marcadores no inicializado. Por favor, recarga la página e intenta nuevamente.');
        return false;
    }
    
    console.log('🔍 DEBUG - marcadoresSeleccionados.length:', marcadoresSeleccionados.length);
    console.log('🔍 DEBUG - marcadoresSeleccionados:', marcadoresSeleccionados);
    console.log('🔍 DEBUG - asignaciones.length antes:', asignaciones.length);
    
    if (marcadoresSeleccionados.length === 0) {
        console.log('❌ DEBUG - No hay marcadores seleccionados, saliendo de la función');
        alert('Por favor, selecciona al menos un punto en el mapa antes de asignar efectivos.\n\nPasos:\n1. Haz clic en un punto del mapa\n2. Verifica que aparezca el menú de puntos seleccionados\n3. Luego selecciona el efectivo');
        return false;
    }
    
    // Verificar que asignaciones esté inicializado
    if (!asignaciones) {
        console.error('❌ CRÍTICO - asignaciones no está inicializado');
        asignaciones = [];
        console.log('✅ asignaciones inicializado como array vacío');
    }
    
    console.log(`🚔 Asignando efectivo: ${nombre} - ${detalle} a ${marcadoresSeleccionados.length} puntos`);
    
    let asignacionesCreadas = 0;
    let asignacionesActualizadas = 0;
    
    // Implementar la lógica real de asignación de efectivos
    marcadoresSeleccionados.forEach((marcador, index) => {
        console.log(`🔍 DEBUG - Procesando marcador ${index + 1}:`, marcador);
        console.log(`🔍 DEBUG - marcador._leaflet_id:`, marcador._leaflet_id);
        console.log(`🔍 DEBUG - marcador.puntoData:`, marcador.puntoData);
        
        // Buscar si ya existe una asignación para este punto
        const asignacionExistente = asignaciones.find(asig => 
            asig.puntoId === marcador._leaflet_id
        );
        
        console.log(`🔍 DEBUG - Asignación existente encontrada:`, asignacionExistente);
        
        if (asignacionExistente) {
            // Si ya existe, agregar o actualizar el efectivo individual
            asignacionExistente.efectivo = {
                nombre: nombre,
                detalle: detalle,
                tipoPersonal: 'Efectivo Policial'
            };
            asignacionExistente.fechaAsignacion = new Date().toISOString();
            asignacionesActualizadas++;
            console.log(`✅ Efectivo actualizado en punto existente: ${asignacionExistente.puntoNombre}`);
        } else {
            // Crear nueva asignación
            const nuevaAsignacion = {
                puntoId: marcador._leaflet_id,
                puntoNombre: marcador.puntoData ? marcador.puntoData.nombre : `Punto ${marcador._leaflet_id}`,
                coordenadas: {
                    lat: marcador.puntoData ? marcador.puntoData.lat : marcador.getLatLng().lat,
                    lng: marcador.puntoData ? marcador.puntoData.lng : marcador.getLatLng().lng
                },
                efectivo: {
                    nombre: nombre,
                    detalle: detalle,
                    tipoPersonal: 'Efectivo Policial'
                },
                fechaAsignacion: new Date().toISOString()
            };
            
            console.log(`🔍 DEBUG - Nueva asignación creada:`, nuevaAsignacion);
            asignaciones.push(nuevaAsignacion);
            asignacionesCreadas++;
            console.log(`✅ Nueva asignación creada para punto: ${nuevaAsignacion.puntoNombre}`);
        }
    });
    
    console.log('🔍 DEBUG - asignaciones.length después:', asignaciones.length);
    console.log('🔍 DEBUG - Asignaciones creadas:', asignacionesCreadas);
    console.log('🔍 DEBUG - Asignaciones actualizadas:', asignacionesActualizadas);
    console.log('📋 Estado actual de asignaciones después de agregar efectivo:', asignaciones);
    
    // Verificar que las asignaciones se guardaron correctamente
    const asignacionesDelEfectivo = asignaciones.filter(asig => 
        asig.efectivo && asig.efectivo.nombre === nombre
    );
    console.log(`🔍 DEBUG - Asignaciones encontradas para ${nombre}:`, asignacionesDelEfectivo.length);
    
    // Mostrar confirmación
    mostrarNotificacion(`Efectivo "${nombre}" asignado a ${marcadoresSeleccionados.length} puntos seleccionados`, 'success');
    
    // Volver al menú principal en lugar de cerrar todo
    cerrarListaEfectivos();
    
    console.log('🔍 DEBUG - seleccionarEfectivo() completada');
}

// Función para asignar efectivo policial (nueva función)
function asignarEfectivoPolicial() {
    if (marcadoresSeleccionados.length === 0) {
        return;
    }
    
    mostrarListaEfectivos();
}

// ========== NUEVAS FUNCIONALIDADES MEJORADAS ==========

// Función mejorada para crear selector de columnas con detección automática
function crearSelectorColumnasUbicacionMejorado() {
    console.log('🔍 Iniciando crearSelectorColumnasUbicacionMejorado...');
    console.log('📊 Headers disponibles:', gestionHeaders);
    
    const selector = document.getElementById('selector-columna-geo');
    console.log('🎯 Selector encontrado:', selector);
    
    if (!selector) {
        console.error('❌ No se encontró el selector con ID selector-columna-geo');
        return;
    }
    
    // Limpiar opciones existentes
    selector.innerHTML = '<option value="">-- Selecciona una columna --</option>';
    console.log('🧹 Selector limpiado');
    
    // Buscar columnas que puedan contener información geográfica
    const columnasGeo = gestionHeaders.filter(header => 
        header.toLowerCase().includes('distrito') ||
        header.toLowerCase().includes('ubicacion') ||
        header.toLowerCase().includes('ubicación') ||
        header.toLowerCase().includes('direccion') ||
        header.toLowerCase().includes('dirección') ||
        header.toLowerCase().includes('zona') ||
        header.toLowerCase().includes('coordenada') ||
        header.toLowerCase().includes('lugar') ||
        header.toLowerCase().includes('localidad')
    );
    
    // Agregar todas las columnas disponibles, marcando las geográficas
    console.log('📝 Agregando columnas al selector...');
    gestionHeaders.forEach((columna, index) => {
        const option = document.createElement('option');
        option.value = columna;
        const esGeo = columnasGeo.includes(columna);
        option.textContent = esGeo ? `🗺️ ${columna} (Detectada)` : columna;
        if (esGeo) {
            option.style.fontWeight = 'bold';
            option.style.color = '#059669';
        }
        selector.appendChild(option);
        console.log(`✅ Columna ${index + 1} agregada: ${columna} (Geo: ${esGeo})`);
    });
    
    console.log('🗺️ Selector mejorado creado. Total columnas:', gestionHeaders.length);
    console.log('🎯 Columnas geográficas detectadas:', columnasGeo.length, columnasGeo);
    console.log('📋 Opciones en selector:', selector.children.length);
    
    // Si hay columnas geográficas, seleccionar la primera automáticamente
    if (columnasGeo.length > 0) {
        selector.value = columnasGeo[0];
        mostrarNotificacion(`Columna geográfica detectada automáticamente: ${columnasGeo[0]}`, 'success');
    }
}

// Función para auto-detectar y cargar mapa
function autoDetectarYCargarMapa() {
    console.log('🔍 Iniciando auto-detección de columnas geográficas...');
    
    // Buscar columnas geográficas directamente
    const columnasGeo = gestionHeaders.filter(header => 
        header.toLowerCase().includes('distrito') ||
        header.toLowerCase().includes('ubicacion') ||
        header.toLowerCase().includes('ubicación') ||
        header.toLowerCase().includes('direccion') ||
        header.toLowerCase().includes('dirección') ||
        header.toLowerCase().includes('zona') ||
        header.toLowerCase().includes('coordenada') ||
        header.toLowerCase().includes('lugar') ||
        header.toLowerCase().includes('localidad')
    );
    
    console.log('🗺️ Columnas geográficas encontradas:', columnasGeo);
    
    if (columnasGeo.length > 0) {
        const columnaSeleccionada = columnasGeo[0];
        console.log('✅ Cargando mapa automáticamente con columna:', columnaSeleccionada);
        
        // Cargar el mapa automáticamente con un pequeño delay
        setTimeout(() => {
            inicializarMapaConDatosMejorado(columnaSeleccionada);
        }, 300);
    } else {
        console.log('⚠️ No se encontraron columnas geográficas automáticamente');
        mostrarNotificacion('No se detectaron columnas geográficas automáticamente. Selecciona una columna manualmente.', 'warning');
    }
}

// Función mejorada para inicializar el mapa con datos
function inicializarMapaConDatosMejorado(columnaSeleccionada) {
    console.log('🗺️ Iniciando inicializarMapaConDatosMejorado con columna:', columnaSeleccionada);
    console.log('📊 Datos disponibles:', gestionData.length, 'registros');
    console.log('📋 Headers disponibles:', gestionHeaders);
    
    if (!columnaSeleccionada) {
        console.error('❌ No se proporcionó columna seleccionada');
        mostrarNotificacion('Por favor selecciona una columna geográfica', 'warning');
        return;
    }
    
    const contenedorMapa = document.getElementById('mapa-container');
    const contenedorLeaflet = document.getElementById('mapa-leaflet');
    
    console.log('🎯 Contenedor mapa-container:', contenedorMapa);
    console.log('🎯 Contenedor mapa-leaflet:', contenedorLeaflet);
    
    if (!contenedorMapa || !contenedorLeaflet) {
        console.error('❌ No se encontró el contenedor del mapa');
        console.error('❌ mapa-container:', !!contenedorMapa);
        console.error('❌ mapa-leaflet:', !!contenedorLeaflet);
        return;
    }
    
    // Limpiar mapa anterior si existe
    if (mapaInstancia) {
        console.log('🧹 Limpiando mapa anterior');
        try {
            mapaInstancia.remove();
        } catch (error) {
            console.log('⚠️ Error al limpiar mapa anterior:', error);
        }
    }
    
    // Crear nueva instancia del mapa centrado en Perú
    console.log('🗺️ Creando nueva instancia del mapa en mapa-leaflet');
    try {
        mapaInstancia = L.map('mapa-leaflet').setView([-12.0464, -77.0428], 11);
        console.log('✅ Mapa creado exitosamente:', mapaInstancia);
    } catch (error) {
        console.error('❌ Error al crear mapa:', error);
        return;
    }
    
    // Agregar capa de tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapaInstancia);
    
    // Crear grupo de marcadores
    marcadoresGrupo = L.layerGroup().addTo(mapaInstancia);
    
    // Procesar y agregar marcadores usando la función original que funciona
    procesarDatosGeograficosConColumna(columnaSeleccionada);
    
    console.log('✅ Mapa mejorado inicializado con columna:', columnaSeleccionada);
}

// Función para procesar datos de operaciones de forma mejorada
function procesarDatosOperacionesMejorado(datos, headers, columnaGeo) {
    console.log('📊 Procesando datos de operaciones...');
    console.log('📋 Columna geográfica:', columnaGeo);
    console.log('📋 Headers:', headers);
    
    const indiceColumna = headers.indexOf(columnaGeo);
    console.log('📍 Índice de columna geográfica:', indiceColumna);
    
    if (indiceColumna === -1) {
        console.error('❌ Columna geográfica no encontrada en headers');
        mostrarNotificacion('Error: Columna geográfica no encontrada', 'error');
        return;
    }
    
    // Crear puntos basados en los datos
    crearPuntosDesdeOperacionesMejorado(datos, headers, indiceColumna, columnaGeo);
    
    mostrarNotificacion(`Mapa cargado con ${datos.length} registros de operaciones`, 'success');
}

// Función para crear puntos desde operaciones de forma mejorada
function crearPuntosDesdeOperacionesMejorado(datos, headers, indiceColumna, columnaGeo) {
    console.log('📍 Creando puntos desde operaciones...');
    console.log('📊 Total de datos:', datos.length);
    console.log('📍 Índice de columna:', indiceColumna);
    
    let puntosCreados = 0;
    
    datos.forEach((fila, index) => {
        const ubicacion = fila[indiceColumna];
        console.log(`📍 Fila ${index + 1}: ubicación = "${ubicacion}"`);
        
        if (!ubicacion || ubicacion.trim() === '') {
            console.log(`⚠️ Fila ${index + 1}: ubicación vacía, saltando...`);
            return;
        }
        
        // Generar coordenadas basadas en la ubicación
        const coordenadas = generarCoordenadasPorUbicacionMejorado(ubicacion);
        console.log(`📍 Fila ${index + 1}: coordenadas generadas:`, coordenadas);
        
        // Crear información del punto con todos los datos originales
        const punto = {
            lat: coordenadas.lat,
            lng: coordenadas.lng,
            nombre: `Operación ${index + 1}`,
            ubicacion: ubicacion,
            datosOriginales: fila.join(' | '),
            indiceOriginal: index,
            headers: headers
        };
        
        // Agregar punto al mapa
        agregarPuntoAlMapaMejorado(punto);
        puntosCreados++;
        console.log(`✅ Punto ${puntosCreados} agregado al mapa`);
    });
    
    console.log(`📍 ${puntosCreados} puntos creados en el mapa`);
    
    // Si no se crearon puntos, crear puntos de ejemplo
    if (puntosCreados === 0) {
        console.log('⚠️ No se crearon puntos, creando puntos de ejemplo...');
        crearPuntosEjemploOperacionesMejorado(datos);
    }
}

// Función para generar coordenadas por ubicación de forma mejorada
function generarCoordenadasPorUbicacionMejorado(ubicacion) {
    // Primero, verificar si la ubicación contiene coordenadas reales (formato: lat,lng)
    const coordenadasRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (coordenadasRegex.test(ubicacion.trim())) {
        const [lat, lng] = ubicacion.trim().split(',').map(coord => parseFloat(coord));
        if (!isNaN(lat) && !isNaN(lng)) {
            console.log('📍 Coordenadas reales detectadas:', lat, lng);
            return { lat: lat, lng: lng };
        }
    }
    
    // Si no son coordenadas reales, buscar por nombre de distrito
    const ubicacionLower = ubicacion.toLowerCase();
    
    // Coordenadas base para diferentes distritos de Lima
    const coordenadasBase = {
        'miraflores': { lat: -12.1197, lng: -77.0282 },
        'san isidro': { lat: -12.0969, lng: -77.0378 },
        'barranco': { lat: -12.1404, lng: -77.0200 },
        'surco': { lat: -12.1391, lng: -77.0056 },
        'la molina': { lat: -12.0792, lng: -76.9447 },
        'san borja': { lat: -12.1115, lng: -77.0095 },
        'lima': { lat: -12.0464, lng: -77.0428 },
        'callao': { lat: -12.0566, lng: -77.1181 },
        'chorrillos': { lat: -12.1684, lng: -77.0130 },
        'villa maria': { lat: -12.0719, lng: -77.0139 },
        'villa el salvador': { lat: -12.2039, lng: -76.9358 },
        'san juan de miraflores': { lat: -12.1562, lng: -76.9734 }
    };
    
    // Buscar coincidencia en las coordenadas base
    for (const [distrito, coords] of Object.entries(coordenadasBase)) {
        if (ubicacionLower.includes(distrito)) {
            // Agregar variación aleatoria pequeña para evitar superposición
            console.log('📍 Distrito detectado:', distrito);
            return {
                lat: coords.lat + (Math.random() - 0.5) * 0.01,
                lng: coords.lng + (Math.random() - 0.5) * 0.01
            };
        }
    }
    
    // Si no se encuentra, usar coordenadas base de Lima con variación
    console.log('📍 Usando coordenadas por defecto para:', ubicacion);
    return {
        lat: -12.0464 + (Math.random() - 0.5) * 0.1,
        lng: -77.0428 + (Math.random() - 0.5) * 0.1
    };
}

// Función para agregar punto al mapa de forma mejorada
function agregarPuntoAlMapaMejorado(punto) {
    console.log('🗺️ Agregando punto al mapa:', punto);
    
    if (!mapaInstancia) {
        console.error('❌ mapaInstancia no está definida');
        return null;
    }
    
    if (!punto.lat || !punto.lng) {
        console.error('❌ Coordenadas inválidas:', punto.lat, punto.lng);
        return null;
    }
    
    try {
        console.log('🔧 Creando marcador en coordenadas:', [punto.lat, punto.lng]);
        const marcador = L.marker([punto.lat, punto.lng]);
        console.log('🔧 Marcador creado:', marcador);
        
        console.log('🔧 Agregando marcador al mapa...');
        marcador.addTo(mapaInstancia);
        console.log('🔧 Marcador agregado al mapa');
        
        console.log('🔧 Configurando popup...');
        marcador.bindPopup(`
                <div style="max-width: 300px;">
                    <strong>${punto.nombre}</strong><br>
                    <strong>Ubicación:</strong> ${punto.ubicacion}<br>
                    <hr style="margin: 8px 0;">
                    <small><strong>Datos:</strong><br>${punto.datosOriginales}</small>
                </div>
            `);

        marcador.puntoData = punto;
        marcador.indice = Date.now() + Math.random(); // Índice único
        
        marcador.on('click', function() {
            seleccionarMarcadorMejorado(this);
        });
        
        console.log('✅ Punto mejorado agregado exitosamente:', punto.nombre, 'en', punto.ubicacion);
        console.log('✅ Marcador final:', marcador);
        
        return marcador;
    } catch (error) {
        console.error('❌ Error al agregar marcador:', error);
        return null;
    }
}

// Función para seleccionar marcador de forma mejorada
function seleccionarMarcadorMejorado(marcador) {
    console.log('🎯 Marcador clickeado:', marcador);
    
    // Buscar si el marcador ya está seleccionado
    const index = marcadoresSeleccionados.findIndex(m => m.indice === marcador.indice);
    
    if (index === -1) {
        // Agregar a seleccionados
        marcadoresSeleccionados.push(marcador);
        
        // Cambiar icono a rojo (seleccionado)
        marcador.setIcon(L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }));
        
        console.log('✅ Marcador seleccionado');
    } else {
        // Quitar de seleccionados
        marcadoresSeleccionados.splice(index, 1);
        
        // Cambiar icono a azul (no seleccionado)
        marcador.setIcon(L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }));
        
        console.log('❌ Marcador deseleccionado');
    }
    
    // Actualizar contador y mostrar/ocultar menú
    actualizarContadorPuntos();
    
    if (marcadoresSeleccionados.length > 0) {
        mostrarMenuPuntosSeleccionados();
    } else {
        cerrarMenuPuntos();
    }
    
    console.log('🎯 Total seleccionados:', marcadoresSeleccionados.length);
}

// Función para actualizar el contador de puntos seleccionados
function actualizarContadorPuntos() {
    const contador = document.getElementById('contador-puntos');
    if (contador) {
        contador.textContent = marcadoresSeleccionados.length;
        console.log('📊 Contador actualizado:', marcadoresSeleccionados.length);
    }
}

// Función para crear puntos de ejemplo mejorados
function crearPuntosEjemploOperacionesMejorado(datos) {
    const puntosEjemplo = [
        { lat: -12.0464, lng: -77.0428, nombre: 'Operación Centro', ubicacion: 'Lima Centro' },
        { lat: -12.1197, lng: -77.0282, nombre: 'Operación Miraflores', ubicacion: 'Miraflores' },
        { lat: -12.0969, lng: -77.0378, nombre: 'Operación San Isidro', ubicacion: 'San Isidro' },
        { lat: -12.1404, lng: -77.0200, nombre: 'Operación Barranco', ubicacion: 'Barranco' },
        { lat: -12.1391, lng: -77.0056, nombre: 'Operación Surco', ubicacion: 'Santiago de Surco' }
    ];
    
    puntosEjemplo.forEach((punto, index) => {
        if (index < datos.length) {
            punto.datosOriginales = datos[index].join(' | ');
            punto.indiceOriginal = index;
        }
        agregarPuntoAlMapaMejorado(punto);
    });
    
    mostrarNotificacion('Se crearon puntos de ejemplo basados en ubicaciones de Lima', 'info');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Colores según el tipo
    const colores = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6',
        'warning': '#f59e0b'
    };
    
    notificacion.style.backgroundColor = colores[tipo] || colores.info;
    notificacion.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Agregar estilos CSS para las animaciones de notificación
if (!document.getElementById('notificacion-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notificacion-styles';
    styles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styles);
}

// ========================================
// FUNCIONES DE SELECCIÓN MÚLTIPLE MEJORADAS
// ========================================

// Funciones de asignación con selectores simples
function asignarCuadrillaSelect(select) {
    const valor = select.value;
    if (!valor) return;
    
    const [nombre, detalle] = valor.split('|');
    asignarCuadrillaEspecifica(nombre, detalle);
    
    // Resetear el selector
    select.value = '';
}

function asignarEfectivoSelect(select) {
    const valor = select.value;
    if (!valor) return;
    
    const [nombre, detalle] = valor.split('|');
    asignarEfectivoEspecifico(nombre, detalle);
    
    // Resetear el selector
    select.value = '';
}

// Nuevas funciones para selección múltiple de efectivos
function asignarEfectivosSeleccionados() {
    console.log('👮 Función asignarEfectivosSeleccionados llamada');
    
    if (marcadoresSeleccionados.length === 0) {
        alert('Por favor, selecciona al menos un punto en el mapa primero.');
        return;
    }

    const checkboxes = document.querySelectorAll('#efectivos-checkboxes input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Por favor, selecciona al menos un efectivo policial.');
        return;
    }

    let efectivosAsignados = 0;
    
    checkboxes.forEach(checkbox => {
        const valor = checkbox.value;
        const [nombre, detalle] = valor.split('|');
        
        // Asignar este efectivo a todos los puntos seleccionados
        marcadoresSeleccionados.forEach(marcador => {
            // Verificar si ya existe una asignación para este punto
            const asignacionExistente = asignaciones.find(asig => 
                asig.puntoId === marcador._leaflet_id
            );

            if (asignacionExistente) {
                // Si ya existe, agregar el efectivo a la lista
                if (!asignacionExistente.efectivos) {
                    asignacionExistente.efectivos = [];
                }
                
                // Verificar si este efectivo ya está asignado a este punto
                const efectivoExistente = asignacionExistente.efectivos.find(ef => ef.nombre === nombre);
                if (!efectivoExistente) {
                    asignacionExistente.efectivos.push({
                        nombre: nombre,
                        detalle: detalle,
                        tipoPersonal: 'Efectivo Policial'
                    });
                    efectivosAsignados++;
                }
            } else {
                // Crear nueva asignación
                const nuevaAsignacion = {
                    puntoId: marcador._leaflet_id,
                    puntoNombre: marcador.puntoData ? marcador.puntoData.nombre : `Punto ${marcador._leaflet_id}`,
                    coordenadas: {
                        lat: marcador.puntoData ? marcador.puntoData.lat : marcador.getLatLng().lat,
                        lng: marcador.puntoData ? marcador.puntoData.lng : marcador.getLatLng().lng
                    },
                    efectivos: [{
                        nombre: nombre,
                        detalle: detalle,
                        tipoPersonal: 'Efectivo Policial'
                    }],
                    fechaAsignacion: new Date().toISOString()
                };
                
                asignaciones.push(nuevaAsignacion);
                efectivosAsignados++;
            }
        });
    });

    console.log('📋 Asignaciones después de agregar efectivos múltiples:', asignaciones);
    
    // Mostrar mensaje de confirmación
    mostrarNotificacion(`✅ Se han asignado ${checkboxes.length} efectivos a ${marcadoresSeleccionados.length} puntos. Total de asignaciones: ${efectivosAsignados}`, 'success');

    // Limpiar selecciones
    limpiarSeleccionEfectivos();
}

function limpiarSeleccionEfectivos() {
    const checkboxes = document.querySelectorAll('#efectivos-checkboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    console.log('🗑️ Selección de efectivos limpiada');
}

function asignarCuadrillaEspecifica(nombre, detalle) {
    console.log('🔧 Función asignarCuadrillaEspecifica llamada:', nombre, detalle);
    console.log('📍 Marcadores seleccionados:', marcadoresSeleccionados.length);
    
    if (marcadoresSeleccionados.length === 0) {
        alert('Por favor, selecciona al menos un punto en el mapa primero.');
        console.log('❌ No hay marcadores seleccionados');
        return;
    }
    
    // Crear asignación para cada punto seleccionado
    marcadoresSeleccionados.forEach(marcador => {
        const asignacionExistente = asignaciones.find(a => a.puntoId === marcador.indice);
        
        if (asignacionExistente) {
            asignacionExistente.cuadrilla = { nombre, detalle };
            asignacionExistente.fechaAsignacion = new Date().toLocaleString();
        } else {
            const nuevaAsignacion = {
                id: asignaciones.length + 1,
                puntoId: marcador.indice,
                puntoNombre: marcador.puntoData ? marcador.puntoData.nombre : `Punto ${marcador.indice + 1}`,
                coordenadas: marcador.puntoData ? `${marcador.puntoData.lat}, ${marcador.puntoData.lng}` : `${marcador.getLatLng().lat}, ${marcador.getLatLng().lng}`,
                cuadrilla: { nombre, detalle },
                efectivo: null,
                fechaAsignacion: new Date().toLocaleString(),
                estado: 'Asignado'
            };
            asignaciones.push(nuevaAsignacion);
        }
    });
    
    console.log(`Cuadrilla ${nombre} asignada a ${marcadoresSeleccionados.length} puntos`);
    console.log('📋 Asignaciones después de agregar cuadrilla:', asignaciones);
    mostrarNotificacion(`Cuadrilla "${nombre}" asignada a ${marcadoresSeleccionados.length} puntos seleccionados`, 'success');
}

function asignarEfectivoEspecifico(nombre, detalle) {
    if (marcadoresSeleccionados.length === 0) {
        alert('Por favor, selecciona al menos un punto en el mapa primero.');
        return;
    }
    
    // Crear asignación para cada punto seleccionado
    marcadoresSeleccionados.forEach(marcador => {
        const asignacionExistente = asignaciones.find(a => a.puntoId === marcador.indice);
        
        if (asignacionExistente) {
            asignacionExistente.efectivo = { nombre, detalle };
            asignacionExistente.fechaAsignacion = new Date().toLocaleString();
        } else {
            const nuevaAsignacion = {
                id: asignaciones.length + 1,
                puntoId: marcador.indice,
                puntoNombre: marcador.puntoData ? marcador.puntoData.nombre : `Punto ${marcador.indice + 1}`,
                coordenadas: marcador.puntoData ? `${marcador.puntoData.lat}, ${marcador.puntoData.lng}` : `${marcador.getLatLng().lat}, ${marcador.getLatLng().lng}`,
                cuadrilla: null,
                efectivo: { nombre, detalle },
                fechaAsignacion: new Date().toLocaleString(),
                estado: 'Asignado'
            };
            asignaciones.push(nuevaAsignacion);
        }
    });
    
    console.log(`Efectivo ${nombre} asignado a ${marcadoresSeleccionados.length} puntos`);
    console.log('📋 Asignaciones después de agregar efectivo:', asignaciones);
    mostrarNotificacion(`Efectivo "${nombre}" asignado a ${marcadoresSeleccionados.length} puntos seleccionados`, 'success');
}

function guardarAsignacion() {
    console.log('💾 Iniciando proceso de guardado de asignaciones...');
    
    try {
        // Verificar si hay puntos seleccionados
        if (!marcadoresSeleccionados || marcadoresSeleccionados.length === 0) {
            console.log('❌ No hay puntos seleccionados');
            mostrarNotificacion('No hay puntos seleccionados para guardar asignación', 'error');
            alert('Por favor, selecciona al menos un punto en el mapa antes de guardar la asignación.');
            return;
        }
        
        // Verificar que el array de asignaciones existe
        if (!asignaciones || !Array.isArray(asignaciones)) {
            console.log('❌ Array de asignaciones no válido');
            mostrarNotificacion('Error en el sistema de asignaciones', 'error');
            alert('Error en el sistema. Por favor, recarga la página e inténtalo de nuevo.');
            return;
        }
        
        // Filtrar solo las asignaciones de los puntos actualmente seleccionados
        const asignacionesActuales = asignaciones.filter(asig => 
            asig && marcadoresSeleccionados.some(marcador => marcador && marcador.id === asig.puntoId)
        );
        
        // Verificar si hay asignaciones realizadas para los puntos seleccionados
        if (asignacionesActuales.length === 0) {
            console.log('❌ No hay asignaciones realizadas para los puntos seleccionados');
            mostrarNotificacion('No hay asignaciones para los puntos seleccionados', 'error');
            alert('Por favor, asigna cuadrillas o efectivos a los puntos seleccionados antes de guardar.');
            return;
        }
        
        console.log('✅ Validaciones pasadas, procediendo a guardar...');
        console.log(`📊 Puntos seleccionados: ${marcadoresSeleccionados.length}`);
        console.log(`📊 Asignaciones actuales: ${asignacionesActuales.length}`);
        
        // Simular guardado de asignaciones
        const timestamp = new Date().toLocaleString();
        const datosGuardado = {
            fecha: timestamp,
            totalPuntos: marcadoresSeleccionados.length,
            totalAsignaciones: asignacionesActuales.length,
            asignaciones: asignacionesActuales.map(asig => ({
                id: asig.id || 'sin-id',
                puntoId: asig.puntoId || 0,
                puntoNombre: asig.puntoNombre || 'Punto sin nombre',
                coordenadas: asig.coordenadas || { lat: 0, lng: 0 },
                cuadrilla: asig.cuadrilla || null,
                efectivo: asig.efectivo || null,
                efectivos: asig.efectivos || [],
                fechaAsignacion: asig.fechaAsignacion || timestamp,
                estado: asig.estado || 'activo'
            }))
        };
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('asignaciones_guardadas', JSON.stringify(datosGuardado));
        console.log('✅ Asignaciones guardadas en localStorage:', datosGuardado);
        
        // Calcular estadísticas globales correctamente
        const todosLosCuadrillas = new Set();
        const todosLosEfectivos = new Set();
        const puntosConAsignaciones = new Set();
        
        // Procesar todas las asignaciones para obtener estadísticas precisas
        asignacionesActuales.forEach(asig => {
            if (!asig) return;
            
            // Contar puntos únicos
            puntosConAsignaciones.add(asig.puntoId);
            
            // Contar cuadrillas únicas
            if (asig.cuadrilla && asig.cuadrilla.nombre) {
                todosLosCuadrillas.add(asig.cuadrilla.nombre);
            }
            
            // Contar efectivos individuales únicos
            if (asig.efectivo && asig.efectivo.nombre) {
                todosLosEfectivos.add(asig.efectivo.nombre);
            }
            
            // Contar múltiples efectivos únicos
            if (asig.efectivos && Array.isArray(asig.efectivos) && asig.efectivos.length > 0) {
                asig.efectivos.forEach(ef => {
                    if (ef && ef.nombre) {
                        todosLosEfectivos.add(ef.nombre);
                    }
                });
            }
        });
        
        // Debug: Mostrar el estado de las asignaciones
        console.log('🔍 DEBUG - Asignaciones actuales:', asignacionesActuales);
        console.log('🔍 DEBUG - Puntos con asignaciones:', Array.from(puntosConAsignaciones));
        console.log('🔍 DEBUG - Cuadrillas únicas:', Array.from(todosLosCuadrillas));
        console.log('🔍 DEBUG - Efectivos únicos:', Array.from(todosLosEfectivos));

        // Crear lista compacta de recursos asignados
        let listaRecursos = [];
        
        if (todosLosCuadrillas.size > 0) {
            listaRecursos.push(`👥 <strong>Cuadrillas:</strong> ${Array.from(todosLosCuadrillas).join(', ')}`);
        }
        
        if (todosLosEfectivos.size > 0) {
            listaRecursos.push(`🚔 <strong>Efectivos:</strong> ${Array.from(todosLosEfectivos).join(', ')}`);
        }
        
        if (listaRecursos.length === 0) {
            listaRecursos.push(`⚠️ <em>No se encontraron recursos asignados</em>`);
        }
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`Asignaciones guardadas exitosamente: ${puntosConAsignaciones.size} puntos con recursos asignados`, 'success');
        
        // Mostrar confirmación ejecutiva y compacta
        const contenidoModal = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 36px; margin-bottom: 8px;">✅</div>
                <div style="font-size: 16px; color: #16a34a; font-weight: bold;">Asignaciones Completadas</div>
                <div style="font-size: 12px; color: #666; margin-top: 3px;">${timestamp}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
                <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; text-align: center; border-left: 3px solid #3b82f6;">
                    <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${marcadoresSeleccionados.length}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📍 Puntos</div>
                </div>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center; border-left: 3px solid #16a34a;">
                    <div style="font-size: 20px; font-weight: bold; color: #15803d;">${puntosConAsignaciones.size}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">✅ Asignados</div>
                </div>
                <div style="background: #fefce8; padding: 12px; border-radius: 8px; text-align: center; border-left: 3px solid #eab308;">
                    <div style="font-size: 20px; font-weight: bold; color: #a16207;">${todosLosCuadrillas.size}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">👥 Cuadrillas</div>
                </div>
                <div style="background: #fef2f2; padding: 12px; border-radius: 8px; text-align: center; border-left: 3px solid #ef4444;">
                    <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${todosLosEfectivos.size}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">🚔 Efectivos</div>
                </div>
            </div>
            
            ${listaRecursos.length > 0 ? `
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 13px; font-weight: bold; color: #475569; margin-bottom: 8px;">🎯 Recursos Asignados:</div>
                ${listaRecursos.map(recurso => `<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${recurso}</div>`).join('')}
            </div>
            ` : ''}
            
            <div style="text-align: center; padding: 10px; background: #dcfce7; border-radius: 6px; border: 1px solid #16a34a;">
                <div style="color: #16a34a; font-weight: bold; font-size: 13px;">
                    💾 Guardado en sistema local
                </div>
            </div>
        `;
        
        // Llamar al modal con validación adicional
        if (typeof mostrarModalCentrado === 'function') {
            mostrarModalCentrado('Confirmación de Asignaciones', contenidoModal);
        } else {
            console.error('❌ Función mostrarModalCentrado no disponible');
            alert('Asignaciones guardadas correctamente, pero no se puede mostrar el modal de confirmación.');
        }
        
    } catch (error) {
        console.error('❌ Error al guardar asignaciones:', error);
        console.error('❌ Stack trace:', error.stack);
        mostrarNotificacion('Error al guardar asignaciones', 'error');
        alert(`Error al guardar las asignaciones: ${error.message}. Por favor, inténtalo de nuevo.`);
    }
}

// Función para mostrar modal centrado
function mostrarModalCentrado(titulo, contenido) {
    // Crear overlay del modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Crear contenido del modal
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">${titulo}</div>
            <div class="modal-body">${contenido}</div>
            <button class="modal-close-btn" onclick="cerrarModal(this)">✅ Completar y Continuar</button>
        </div>
    `;
    
    // Agregar al body
    document.body.appendChild(overlay);
    
    // Cerrar modal al hacer click en el overlay
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            cerrarModal(overlay.querySelector('.modal-close-btn'));
        }
    });
}

// Función para cerrar modal
function cerrarModal(boton) {
    const overlay = boton.closest('.modal-overlay');
    if (overlay) {
        overlay.remove();
        
        // Verificar si el modal era de confirmación de asignaciones
        const modalHeader = overlay.querySelector('.modal-header');
        if (modalHeader && modalHeader.textContent.includes('Confirmación de Asignaciones')) {
            console.log('🧹 Limpiando mapa después de guardar asignaciones...');
            
            // Limpiar selecciones y regresar al mapa limpio
            limpiarMapaDespuesDeGuardar();
        }
    }
}

// Nueva función para limpiar el mapa después de guardar
function limpiarMapaDespuesDeGuardar() {
    try {
        console.log('🔄 Iniciando limpieza del mapa...');
        
        // Limpiar arrays de selección
        if (typeof marcadoresSeleccionados !== 'undefined') {
            marcadoresSeleccionados.length = 0;
            console.log('✅ marcadoresSeleccionados limpiado');
        }
        
        if (typeof puntosSeleccionados !== 'undefined') {
            puntosSeleccionados.length = 0;
            console.log('✅ puntosSeleccionados limpiado');
        }
        
        // Limpiar selección visual en el mapa
        if (typeof limpiarSeleccion === 'function') {
            limpiarSeleccion();
            console.log('✅ Selección visual limpiada');
        }
        
        // Desactivar modo de dibujo si está activo
        if (typeof modoDibujoActivo !== 'undefined' && modoDibujoActivo) {
            if (typeof desactivarModoDibujo === 'function') {
                desactivarModoDibujo();
                console.log('✅ Modo de dibujo desactivado');
            }
        }
        
        // Limpiar variables de dibujo adicionales
        if (typeof puntosTrazo !== 'undefined') {
            puntosTrazo.length = 0;
            console.log('✅ puntosTrazo limpiado');
        }
        
        if (typeof dibujando !== 'undefined') {
            dibujando = false;
            console.log('✅ Estado de dibujo reiniciado');
        }
        
        // Cerrar cualquier menú o panel abierto
        if (typeof cerrarMenuPuntos === 'function') {
            cerrarMenuPuntos();
            console.log('✅ Menús cerrados');
        }
        
        // Cerrar listas de cuadrillas y efectivos si están abiertas
        if (typeof cerrarListaCuadrillas === 'function') {
            cerrarListaCuadrillas();
        }
        
        if (typeof cerrarListaEfectivos === 'function') {
            cerrarListaEfectivos();
        }
        
        // Mostrar notificación de que el mapa está listo para nuevas asignaciones
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion('Mapa limpio y listo para nuevas asignaciones', 'info');
        }
        
        console.log('🎯 Limpieza del mapa completada - Listo para nuevas asignaciones');
        
    } catch (error) {
        console.error('❌ Error al limpiar el mapa:', error);
        // Intentar limpieza básica como fallback
        if (typeof marcadoresSeleccionados !== 'undefined') {
            marcadoresSeleccionados.length = 0;
        }
        if (typeof puntosSeleccionados !== 'undefined') {
            puntosSeleccionados.length = 0;
        }
    }
}

// Función para cargar asignaciones guardadas desde localStorage
function cargarAsignacionesGuardadas() {
    try {
        console.log('📂 Cargando asignaciones guardadas desde localStorage...');
        
        const asignacionesGuardadas = localStorage.getItem('asignaciones_guardadas');
        
        if (asignacionesGuardadas) {
            const datos = JSON.parse(asignacionesGuardadas);
            console.log('✅ Asignaciones encontradas en localStorage:', datos);
            
            // Verificar que los datos tienen la estructura esperada
            if (datos && datos.asignaciones && Array.isArray(datos.asignaciones)) {
                // Cargar las asignaciones al array global
                if (typeof asignaciones !== 'undefined') {
                    // Agregar las asignaciones guardadas al array existente
                    datos.asignaciones.forEach(asignacion => {
                        // Verificar que no exista ya una asignación para el mismo punto
                        const existeAsignacion = asignaciones.find(a => a && a.puntoId === asignacion.puntoId);
                        if (!existeAsignacion) {
                            asignaciones.push(asignacion);
                        }
                    });
                    
                    console.log(`✅ ${datos.asignaciones.length} asignaciones cargadas al sistema`);
                    console.log(`📊 Total de asignaciones en memoria: ${asignaciones.length}`);
                    
                    // Mostrar notificación de carga exitosa
                    // if (typeof mostrarNotificacion === 'function') {
                    //     mostrarNotificacion(`${datos.asignaciones.length} asignaciones cargadas desde sesión anterior`, 'success');
                    // }
                } else {
                    console.warn('⚠️ Array de asignaciones no está disponible');
                }
            } else {
                console.warn('⚠️ Datos de localStorage no tienen la estructura esperada');
            }
        } else {
            console.log('ℹ️ No hay asignaciones guardadas en localStorage');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar asignaciones guardadas:', error);
        // Limpiar localStorage si hay datos corruptos
        try {
            localStorage.removeItem('asignaciones_guardadas');
            console.log('🧹 localStorage limpiado debido a datos corruptos');
        } catch (cleanupError) {
            console.error('❌ Error al limpiar localStorage:', cleanupError);
        }
    }
}

// Función para verificar asignaciones en localStorage (para debugging)
function verificarAsignacionesGuardadas() {
    try {
        const asignacionesGuardadas = localStorage.getItem('asignaciones_guardadas');
        if (asignacionesGuardadas) {
            const datos = JSON.parse(asignacionesGuardadas);
            console.log('🔍 Asignaciones en localStorage:', datos);
            return datos;
        } else {
            console.log('🔍 No hay asignaciones en localStorage');
            return null;
        }
    } catch (error) {
        console.error('❌ Error al verificar localStorage:', error);
        return null;
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOM] DOM cargado, inicializando dashboard...');
    
    // INICIALIZACIÓN GARANTIZADA DE ARRAYS CRÍTICOS
    console.log('🔧 Inicializando arrays críticos del sistema...');
    
    // Verificar e inicializar marcadoresSeleccionados
    if (typeof marcadoresSeleccionados === 'undefined' || !Array.isArray(marcadoresSeleccionados)) {
        window.marcadoresSeleccionados = [];
        console.log('✅ marcadoresSeleccionados inicializado como array vacío');
    } else {
        console.log('✅ marcadoresSeleccionados ya está inicializado:', marcadoresSeleccionados.length, 'elementos');
    }
    
    // Verificar e inicializar asignaciones
    if (typeof asignaciones === 'undefined' || !Array.isArray(asignaciones)) {
        window.asignaciones = [];
        console.log('✅ asignaciones inicializado como array vacío');
    } else {
        console.log('✅ asignaciones ya está inicializado:', asignaciones.length, 'elementos');
    }
    
    // Verificar e inicializar puntosSeleccionados
    if (typeof puntosSeleccionados === 'undefined' || !Array.isArray(puntosSeleccionados)) {
        window.puntosSeleccionados = [];
        console.log('✅ puntosSeleccionados inicializado como array vacío');
    } else {
        console.log('✅ puntosSeleccionados ya está inicializado:', puntosSeleccionados.length, 'elementos');
    }
    
    console.log('🎯 Inicialización de arrays críticos completada');
    
    // Cargar asignaciones guardadas desde localStorage
    cargarAsignacionesGuardadas();
    
    new DashboardManager();
});

// ==========================================
// SCRIPT DE PRUEBA SISTEMÁTICA DE EFECTIVOS
// ==========================================

class TestEfectivos {
    constructor() {
        this.resultados = [];
        this.testActual = 0;
        this.totalTests = 10;
    }

    async iniciarTestCompleto() {
        console.log('🧪 INICIANDO TEST SISTEMÁTICO DE EFECTIVOS POLICIALES');
        console.log('📅 Fecha y hora:', new Date().toLocaleString());
        console.log('🎯 Objetivo: Identificar por qué las asignaciones no funcionan en el primer intento');
        console.log('📊 Total de pruebas:', this.totalTests);
        console.log('=' .repeat(80));

        for (let i = 1; i <= this.totalTests; i++) {
            await this.realizarTest(i);
            await this.esperar(1500); // Esperar 1.5 segundos entre tests
        }

        this.mostrarResumenFinal();
        return this.resultados;
    }

    async realizarTest(numeroTest) {
        this.testActual = numeroTest;
        console.log(`\n🧪 TEST ${numeroTest}/${this.totalTests} - INICIANDO`);
        console.log(`⏰ Hora: ${new Date().toLocaleTimeString()}`);

        const testData = {
            numero: numeroTest,
            timestamp: new Date().toISOString(),
            efectivo: `Oficial Test ${numeroTest}`,
            detalle: `Prueba ${numeroTest} - ${new Date().toLocaleTimeString()}`,
            puntosSeleccionados: [],
            asignacionesAntes: 0,
            asignacionesDespues: 0,
            exito: false,
            intentos: 1,
            errores: [],
            logs: []
        };

        try {
            // Paso 1: Verificar estado inicial
            testData.logs.push('📋 Verificando estado inicial...');
            testData.asignacionesAntes = window.asignaciones ? window.asignaciones.length : 0;
            testData.logs.push(`📊 Asignaciones antes: ${testData.asignacionesAntes}`);

            // Paso 2: Verificar marcadores seleccionados
            if (!window.marcadoresSeleccionados || window.marcadoresSeleccionados.length === 0) {
                testData.logs.push('⚠️ Simulando selección de marcador...');
                // Simular marcador seleccionado para la prueba
                window.marcadoresSeleccionados = [{
                    id: `test_marker_${numeroTest}`,
                    puntoData: {
                        lat: 40.7128 + (numeroTest * 0.001),
                        lng: -74.0060 + (numeroTest * 0.001)
                    },
                    tipo: 'test'
                }];
                testData.logs.push('✅ Marcador de prueba creado');
            }

            testData.puntosSeleccionados = [...window.marcadoresSeleccionados];
            testData.logs.push(`📍 Puntos seleccionados: ${testData.puntosSeleccionados.length}`);

            // Paso 3: Ejecutar función de asignación
            const efectivoNombre = `Oficial García Test ${numeroTest}`;
            const efectivoDetalle = `Sargento - Prueba ${numeroTest}`;

            testData.logs.push(`👮 Ejecutando seleccionarEfectivo con: ${efectivoNombre}`);

            // Capturar el estado antes de la ejecución
            const marcadoresAntes = window.marcadoresSeleccionados.length;
            
            // Ejecutar la función
            if (typeof window.seleccionarEfectivo === 'function') {
                await window.seleccionarEfectivo(efectivoNombre, efectivoDetalle);
                testData.logs.push('✅ Función seleccionarEfectivo ejecutada');
            } else {
                testData.errores.push('❌ Función seleccionarEfectivo no encontrada');
            }

            // Paso 4: Verificar resultado después de un breve delay
            await this.esperar(300);
            
            testData.asignacionesDespues = window.asignaciones ? window.asignaciones.length : 0;
            const diferencia = testData.asignacionesDespues - testData.asignacionesAntes;
            testData.exito = diferencia > 0;

            testData.logs.push(`📊 Asignaciones después: ${testData.asignacionesDespues}`);
            testData.logs.push(`📈 Diferencia: +${diferencia}`);

            if (testData.exito) {
                console.log(`✅ TEST ${numeroTest}: Asignación exitosa (+${diferencia})`);
                testData.logs.push('🎉 Asignación completada exitosamente');
            } else {
                console.log(`❌ TEST ${numeroTest}: Asignación falló (sin cambios)`);
                testData.logs.push('💥 Asignación falló - no se detectaron cambios');
                
                // Intentar diagnosticar el problema
                if (window.marcadoresSeleccionados.length === 0) {
                    testData.errores.push('❌ marcadoresSeleccionados está vacío');
                }
                if (!window.asignaciones) {
                    testData.errores.push('❌ Array asignaciones no existe');
                }
            }

        } catch (error) {
            testData.errores.push(`❌ Error general: ${error.message}`);
            testData.exito = false;
            console.error(`❌ Error en TEST ${numeroTest}:`, error);
        }

        this.resultados.push(testData);
        this.mostrarResultadoTest(testData);
    }

    mostrarResultadoTest(testData) {
        const icon = testData.exito ? '✅' : '❌';
        const estado = testData.exito ? 'ÉXITO' : 'FALLO';
        
        console.log(`\n${icon} RESULTADO TEST ${testData.numero}:`);
        console.log(`📊 Estado: ${estado}`);
        console.log(`👮 Efectivo: ${testData.efectivo}`);
        console.log(`📍 Puntos: ${testData.puntosSeleccionados.length}`);
        console.log(`📈 Asignaciones: ${testData.asignacionesAntes} → ${testData.asignacionesDespues}`);
        
        if (testData.errores.length > 0) {
            console.log('🚨 Errores detectados:');
            testData.errores.forEach(error => console.log(`   ${error}`));
        }
    }

    mostrarResumenFinal() {
        const exitosos = this.resultados.filter(t => t.exito).length;
        const fallidos = this.resultados.filter(t => !t.exito).length;
        const tasaExito = (exitosos / this.resultados.length * 100).toFixed(1);

        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMEN FINAL DEL TEST SISTEMÁTICO');
        console.log('='.repeat(80));
        console.log(`✅ Tests exitosos: ${exitosos}/${this.totalTests}`);
        console.log(`❌ Tests fallidos: ${fallidos}/${this.totalTests}`);
        console.log(`📈 Tasa de éxito: ${tasaExito}%`);
        console.log(`⏰ Hora de finalización: ${new Date().toLocaleTimeString()}`);

        // Análisis de patrones
        this.analizarPatrones();
        
        // Recomendaciones
        this.generarRecomendaciones(tasaExito);
        
        // Mostrar detalles de cada test
        console.log('\n📋 DETALLE DE TODOS LOS TESTS:');
        this.resultados.forEach((test, index) => {
            const icon = test.exito ? '✅' : '❌';
            console.log(`Test ${index + 1}: ${icon} ${test.efectivo} (${test.puntosSeleccionados.length} puntos) - ${test.asignacionesDespues - test.asignacionesAntes} asignaciones`);
        });
    }

    analizarPatrones() {
        console.log('\n🔍 ANÁLISIS DE PATRONES:');
        
        // Analizar errores comunes
        const erroresComunes = {};
        this.resultados.forEach(test => {
            test.errores.forEach(error => {
                erroresComunes[error] = (erroresComunes[error] || 0) + 1;
            });
        });

        if (Object.keys(erroresComunes).length > 0) {
            console.log('🚨 Errores más frecuentes:');
            Object.entries(erroresComunes)
                .sort(([,a], [,b]) => b - a)
                .forEach(([error, count]) => {
                    console.log(`   ${error} (${count} veces)`);
                });
        }

        // Analizar distribución temporal
        const fallosEnPrimerosTres = this.resultados.slice(0, 3).filter(t => !t.exito).length;
        const fallosEnUltimosTres = this.resultados.slice(-3).filter(t => !t.exito).length;
        
        console.log(`📊 Fallos en primeros 3 tests: ${fallosEnPrimerosTres}/3`);
        console.log(`📊 Fallos en últimos 3 tests: ${fallosEnUltimosTres}/3`);
        
        if (fallosEnPrimerosTres > fallosEnUltimosTres) {
            console.log('🔍 PATRÓN DETECTADO: Mayor tasa de fallo en tests iniciales');
            console.log('💡 Posible causa: Inicialización de estado o condiciones de carrera');
        }
    }

    generarRecomendaciones(tasaExito) {
        console.log('\n💡 RECOMENDACIONES BASADAS EN RESULTADOS:');
        
        if (tasaExito < 50) {
            console.log('🔧 CRÍTICO: Tasa de éxito muy baja (<50%)');
            console.log('   - Revisar completamente la lógica de seleccionarEfectivo()');
            console.log('   - Verificar inicialización de marcadoresSeleccionados');
            console.log('   - Implementar validaciones robustas');
            console.log('   - Considerar refactorización completa');
        } else if (tasaExito < 80) {
            console.log('⚠️ MODERADO: Tasa de éxito mejorable (50-80%)');
            console.log('   - Investigar condiciones de carrera específicas');
            console.log('   - Añadir delays o callbacks apropiados');
            console.log('   - Mejorar manejo de errores y validaciones');
            console.log('   - Implementar retry logic');
        } else {
            console.log('✅ BUENO: Tasa de éxito aceptable (>80%)');
            console.log('   - Monitorear comportamiento en uso real');
            console.log('   - Considerar optimizaciones menores');
            console.log('   - Documentar comportamiento esperado');
        }
        
        console.log('\n🔧 ACCIONES ESPECÍFICAS RECOMENDADAS:');
        console.log('   1. Verificar que marcadoresSeleccionados se inicialice correctamente');
        console.log('   2. Añadir validaciones antes de ejecutar asignaciones');
        console.log('   3. Implementar logging más detallado en producción');
        console.log('   4. Considerar usar async/await para operaciones asíncronas');
        console.log('   5. Añadir confirmación visual inmediata al usuario');
    }

    async esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función global para ejecutar el test desde la consola
window.ejecutarTestEfectivos = async function() {
    console.log('🚀 Iniciando test sistemático de efectivos...');
    const test = new TestEfectivos();
    const resultados = await test.iniciarTestCompleto();
    console.log('🏁 Test completado. Resultados disponibles en la variable de retorno.');
    return resultados;
};

// Función para ejecutar un test rápido (3 pruebas)
window.testRapidoEfectivos = async function() {
    console.log('⚡ Iniciando test rápido (3 pruebas)...');
    const test = new TestEfectivos();
    test.totalTests = 3;
    const resultados = await test.iniciarTestCompleto();
    return resultados;
};

// Función de prueba simple para verificar las mejoras
window.probarMejorasEfectivos = function() {
    console.log('🧪 PROBANDO MEJORAS DE ASIGNACIÓN DE EFECTIVOS');
    console.log('='.repeat(50));
    
    // Verificar inicialización de arrays
    console.log('1. Verificando inicialización de arrays:');
    console.log('   - marcadoresSeleccionados:', Array.isArray(marcadoresSeleccionados) ? '✅ Inicializado' : '❌ No inicializado');
    console.log('   - asignaciones:', Array.isArray(asignaciones) ? '✅ Inicializado' : '❌ No inicializado');
    console.log('   - puntosSeleccionados:', Array.isArray(puntosSeleccionados) ? '✅ Inicializado' : '❌ No inicializado');
    
    // Verificar estado actual
    console.log('\n2. Estado actual:');
    console.log('   - marcadoresSeleccionados.length:', marcadoresSeleccionados.length);
    console.log('   - asignaciones.length:', asignaciones.length);
    
    // Probar validación robusta
    console.log('\n3. Probando validación robusta:');
    const resultado = seleccionarEfectivo('Oficial Test', 'Prueba de validación');
    console.log('   - Resultado de prueba sin marcadores:', resultado === false ? '✅ Validación funcionando' : '❌ Validación falló');
    
    console.log('\n4. Funciones disponibles:');
    console.log('   - seleccionarEfectivoConReintento() : Función con retry logic');
    console.log('   - ejecutarTestEfectivos() : Test completo (10 pruebas)');
    console.log('   - testRapidoEfectivos() : Test rápido (3 pruebas)');
    
    console.log('\n✅ Verificación de mejoras completada');
    console.log('💡 Para probar asignación real: selecciona un punto en el mapa primero');
    
    return {
        arraysInicializados: Array.isArray(marcadoresSeleccionados) && Array.isArray(asignaciones),
        validacionFunciona: resultado === false,
        marcadoresCount: marcadoresSeleccionados.length,
        asignacionesCount: asignaciones.length
    };
};

console.log('🧪 Sistema de pruebas de efectivos cargado.');
console.log('📋 Comandos disponibles:');
console.log('   - probarMejorasEfectivos()     : Verificar mejoras implementadas');
console.log('   - ejecutarTestEfectivos()     : Test completo (10 pruebas)');
console.log('   - testRapidoEfectivos()       : Test rápido (3 pruebas)');
console.log('   - verificarAsignacionesGuardadas() : Ver asignaciones en localStorage');
console.log('   - cargarAsignacionesGuardadas()    : Recargar asignaciones desde localStorage');
console.log('   - limpiarMapaDespuesDeGuardar()    : Limpiar mapa manualmente');