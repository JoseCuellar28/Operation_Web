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
            <div style="padding: 20px;">
                <h1>Gestión Operativa</h1>
                <p>Contenido de gestión operativa aquí...</p>
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

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOM] DOM cargado, inicializando dashboard...');
    new DashboardManager();
}); 