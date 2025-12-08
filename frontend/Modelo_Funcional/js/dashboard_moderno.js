/**
 * Dashboard Moderno - Logic
 * Replicates the functionality of the Next.js model using Vanilla JS + Tailwind
 */

let API_NET = localStorage.getItem('api_net') || 'http://localhost:5132';
let API_FASE4 = localStorage.getItem('api_fase4') || 'http://localhost:5051';

// Auto-fix for bad configuration
if (API_NET.includes('mock') || !API_NET.startsWith('http')) {
    console.warn('[CONFIG] Detectada configuración API inválida. Restableciendo a valores por defecto.');
    API_NET = 'http://localhost:5132';
    localStorage.removeItem('api_net');
}
if (API_FASE4.includes('mock')) {
    API_FASE4 = 'http://localhost:5051';
    localStorage.removeItem('api_fase4');
}

class ModernDashboard {
    constructor() {
        this.sidebarCollapsed = false;
        this.currentSection = null;
        this.expandedItems = [];
        this.charts = {};
        this.apiBaseUrl = API_NET; // Fix: Initialize apiBaseUrl

        // Collaborators State
        this.todosLosEmpleados = [];
        this.empleadosFiltrados = [];
        this.paginaActualEmpleados = 1;
        this.empleadosPorPagina = 25;

        // Projects State
        this.todosLosProyectos = [];
        this.proyectosFiltrados = [];
        this.paginaActualProyectos = 1;
        this.proyectosPorPagina = 25;

        // Cuadrillas State
        this.todasLasCuadrillas = [];
        this.cuadrillasFiltradas = [];
        this.paginaActualCuadrillas = 1;
        this.cuadrillasPorPagina = 25;

        // Gestión Operativa State
        this.datosOperativos = [];
        this.columnasOperativas = [];
        this.paginaActualOperativa = 1;
        this.operativaPorPagina = 50;

        // Gestión de Materiales State
        this.materiales = [];
        this.materialesFiltrados = [];
        this.paginaActualMateriales = 1;
        this.materialesPorPagina = 25;
        this.materialesPorPagina = 25;
        this.columnFiltersMateriales = {};
        this.ordenActualMateriales = { col: 'id', dir: 'asc' };

        // Chart Interaction State
        this.selectedAreaFilter = null;

        this.menuItems = [
            {
                label: "Dashboard",
                icon: "fa-tachometer-alt",
                children: [
                    { label: "Vista General", icon: "fa-chart-bar", page: "dashboard" }
                ],
            },
            {
                label: "Seguridad (HSE)",
                icon: "fa-shield-alt",
                children: [
                    { label: "Dashboard HSE", icon: "fa-hard-hat", page: "hse_dashboard.html", external: true }
                ]
            },
            {
                label: "Operaciones Diarias",
                icon: "fa-clipboard-list",
                children: [
                    { label: "Gestión Operativa", icon: "fa-chart-bar", page: "datos-generales" },
                    { label: "Gestión de Cuadrillas", icon: "fa-users", page: "gestion-cuadrillas" },
                    { label: "Gestión de Stock", icon: "fa-boxes", page: "gestion-stock" },
                ],
            },
            {
                label: "Seguimiento",
                icon: "fa-eye",
                children: [
                    { label: "Seguimiento de Proyectos", icon: "fa-project-diagram", page: "seguimiento-proyectos" },
                    { label: "Asistencia", icon: "fa-user-check", page: "asistencia" },
                    { label: "Control Vehicular", icon: "fa-car", page: "control-vehicular" },
                    { label: "Reportes / Registros", icon: "fa-file-alt", page: "reportes-registros" },
                ],
            },
            {
                label: "Configuración",
                icon: "fa-cog",
                children: [
                    { label: "Crea tus Colaboradores", icon: "fa-user-plus", page: "colaboradores" },
                    { label: "Crea tus Proyectos", icon: "fa-map-marker-alt", page: "creacion-proyectos" },
                    { label: "Crea tus Vehículos", icon: "fa-truck", page: "gestion-vehiculos" },
                    { label: "Crea tus Materiales", icon: "fa-tools", page: "gestion-materiales" },
                    { label: "Gestión de Formatos", icon: "fa-file-contract", page: "gestion-formatos" },
                    { label: "Configuración de Sistema", icon: "fa-sliders-h", page: "configuracion-sistema" },
                ],
            },
        ];

        // RBAC: Filter menu items based on Role
        const role = (localStorage.getItem('role') || 'User').toUpperCase();

        // Helper to check if role is in a list
        // FIX: Allow access if User is ADMIN OR if User's role is in the allowed list
        const hasRole = (roles) => role === 'ADMIN' || roles.includes(role);

        // Define permissions per menu page/section
        // If a page is NOT listed, it is assumed public (or handled by parent)
        const permissions = {
            // Operaciones
            'datos-generales': ['PROJECTADMIN', 'PROJECT_ADMIN', 'SUPERVISOR'],
            'gestion-cuadrillas': ['PROJECTADMIN', 'PROJECT_ADMIN'],
            'gestion-stock': ['PROJECTADMIN', 'PROJECT_ADMIN', 'SUPERVISOR'],

            // Seguimiento
            'seguimiento-proyectos': ['MANAGER', 'PROJECTADMIN', 'PROJECT_ADMIN'],
            'asistencia': ['MANAGER', 'PROJECTADMIN', 'PROJECT_ADMIN'],
            'control-vehicular': ['PROJECTADMIN', 'PROJECT_ADMIN'],
            'reportes-registros': ['MANAGER', 'PROJECTADMIN', 'PROJECT_ADMIN'],

            // Configuración
            'colaboradores': ['PROJECTADMIN', 'PROJECT_ADMIN'],
            'creacion-proyectos': [], // Admin Only (default restriction)
            'gestion-vehiculos': ['PROJECTADMIN', 'PROJECT_ADMIN'],
            'gestion-materiales': ['PROJECTADMIN', 'PROJECT_ADMIN'],
            'gestion-formatos': [], // Admin Only
            'configuracion-sistema': [] // Admin Only
        };

        // Filter Logic
        this.menuItems = this.menuItems.map(section => {
            // 1. Check Top-Level Permissions (e.g. Configuración itself)
            if (section.label === 'Configuración' && !hasRole(['PROJECTADMIN', 'PROJECT_ADMIN'])) {
                // If not Admin or ProjectAdmin, hide entire Config section
                return null;
            }

            // 2. Filter Children
            if (section.children) {
                const filteredChildren = section.children.filter(child => {
                    const requiredRoles = permissions[child.page];
                    // If permissions defined, check them. If undefined, assume permitted (e.g. Dashboard)
                    // Note: 'hasRole' includes ADMIN check implicitly
                    return requiredRoles ? hasRole(requiredRoles) : true;
                });

                if (filteredChildren.length === 0) return null; // Hide section if no children visible

                return { ...section, children: filteredChildren };
            }

            return section;
        }).filter(item => item !== null);

        // Special Case: Supervisor permissions for Operaciones
        if (role === 'SUPERVISOR') {
            // Ensure Operaciones is visible but maybe strictly filtered?
            // The logic above handles it via 'permissions' map.
        }

        // Special Case: Manager permissions
        if (role === 'MANAGER') {
            // Manager sees Dashboard + Seguimiento
            // Already handled by Permissions map.
        }

        this.init();
    }

    async init() {
        this.renderSidebar();
        this.setupEventListeners();
        await this.loadMetadata(); // New: Fetch metadata dynamically
        // Load default page
        this.loadPage('dashboard', 'Dashboard');
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        const logoContainer = document.getElementById('logo-container');
        const userInfoContainer = document.getElementById('user-info-container');
        const toggleIcon = document.querySelector('#sidebar-toggle i');

        if (this.sidebarCollapsed) {
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-20');
            logoContainer.classList.add('hidden');
            userInfoContainer.classList.add('hidden');
            toggleIcon.classList.remove('fa-chevron-left');
            toggleIcon.classList.add('fa-chevron-right');

            // Collapse all menus when sidebar collapses
            this.expandedItems = [];
            this.renderSidebar();
        } else {
            sidebar.classList.remove('w-20');
            sidebar.classList.add('w-64');
            logoContainer.classList.remove('hidden');
            userInfoContainer.classList.remove('hidden');
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-left');
            this.renderSidebar();
        }
    }

    toggleExpand(label) {
        if (this.sidebarCollapsed) return;

        const index = this.expandedItems.indexOf(label);
        if (index === -1) {
            this.expandedItems.push(label);
        } else {
            this.expandedItems.splice(index, 1);
        }
        this.renderSidebar();
    }

    async loadMetadata() {
        try {
            const r = await fetch(`${this.apiBaseUrl}/api/personal/metadata`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (r.ok) {
                this.metadata = await r.json();
                console.log('Metadata cargada:', this.metadata);
            }
        } catch (e) {
            console.error('Error cargando metadata:', e);
            // Fallback empty
            this.metadata = { divisiones: [], areas: [], cargos: [] };
        }
    }

    renderSidebar() {
        const nav = document.getElementById('sidebar-nav');
        nav.innerHTML = '';

        this.menuItems.forEach(item => {
            const isExpanded = this.expandedItems.includes(item.label);
            const itemDiv = document.createElement('div');

            // Parent Item
            const button = document.createElement('button');
            button.className = `w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isExpanded
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                }`;
            button.onclick = () => this.toggleExpand(item.label);

            if (this.sidebarCollapsed) {
                button.innerHTML = `<i class="fas ${item.icon} text-xl mx-auto"></i>`;
                button.title = item.label;
            } else {
                button.innerHTML = `
                    <div class="flex items-center gap-3">
                        <i class="fas ${item.icon} w-5 text-center"></i>
                        <span class="font-medium">${item.label}</span>
                    </div>
                    <i class="fas fa-chevron-down transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                `;
            }
            itemDiv.appendChild(button);

            // Children
            if (!this.sidebarCollapsed && isExpanded && item.children) {
                const subMenu = document.createElement('div');
                subMenu.className = "mt-1 ml-4 space-y-1 border-l border-border pl-4";

                item.children.forEach(child => {
                    const childBtn = document.createElement('button');
                    childBtn.className = "w-full text-left px-3 py-2 rounded text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150 flex items-center gap-2";
                    childBtn.innerHTML = `
                        <i class="fas ${child.icon} w-4 text-center text-xs opacity-70"></i>
                        <span>${child.label}</span>
                    `;
                    childBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (child.external) {
                            window.location.href = child.page;
                        } else {
                            this.loadPage(child.page, child.label);
                        }
                    };
                    subMenu.appendChild(childBtn);
                });
                itemDiv.appendChild(subMenu);
            }

            nav.appendChild(itemDiv);
        });
    }

    loadPage(pageName, pageTitle) {
        console.log(`Loading page: ${pageName}`);

        // Update Header
        document.getElementById('page-title').textContent = pageTitle;

        // Update Content
        const mainContent = document.getElementById('main-content');
        let content = '';

        if (typeof UIComponents !== 'undefined') {
            if (pageName === 'colaboradores' && UIComponents.getColaboradoresTableContent) {
                content = UIComponents.getColaboradoresTableContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th'],
                    ADD_ATTR: ['class', 'id', 'style', 'onclick', 'onkeyup', 'onchange', 'title', 'placeholder', 'type', 'value', 'name', 'data-state']
                });

                // Initialize logic for collaborators
                setTimeout(() => {
                    this.cargarEmpleados();

                    // Add event listeners AFTER DOMPurify (it strips inline handlers)
                    const searchInput = document.getElementById('buscarColaboradores');
                    if (searchInput) {
                        searchInput.addEventListener('keyup', () => window.filtrarColaboradores());
                    }

                    const filterInputs = document.querySelectorAll('.colaboradores-filter-input');
                    filterInputs.forEach((input, index) => {
                        input.addEventListener('keyup', () => window.filtrarPorColumnaColaboradores(index, input.value));
                    });
                }, 100);
                return; // Exit early as we handled innerHTML
            } else if (pageName === 'configuracion-sistema' && UIComponents.getConfiguracionContent) {
                content = UIComponents.getConfiguracionContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th', 'form', 'label'],
                    ADD_ATTR: ['class', 'id', 'style', 'onclick', 'title', 'placeholder', 'type', 'value', 'name', 'data-state', 'onsubmit']
                });

                setTimeout(() => {
                    this.cargarConfiguracion();
                }, 100);
                return;
            } else if (pageName === 'dashboard' && UIComponents.getDashboardContent) {
                content = UIComponents.getDashboardContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'div', 'span', 'canvas', 'h1', 'h2', 'h3', 'p', 'i', 'select', 'option'],
                    ADD_ATTR: ['class', 'id', 'style', 'onchange', 'value']
                });

                setTimeout(() => {
                    this.cargarDashboard();
                }, 100);
                return;
            } else if (pageName === 'creacion-proyectos' && UIComponents.getProyectosTableContent) {
                content = UIComponents.getProyectosTableContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th', 'form', 'label', 'select', 'option', 'textarea'],
                    ADD_ATTR: ['class', 'id', 'style', 'onclick', 'onkeyup', 'onchange', 'title', 'placeholder', 'type', 'value', 'name', 'data-state', 'required', 'step', 'accept']
                });

                // Inject Modal
                if (UIComponents.getModalProyectoContent) {
                    const modalDiv = document.createElement('div');
                    modalDiv.innerHTML = DOMPurify.sanitize(UIComponents.getModalProyectoContent(), {
                        ADD_TAGS: ['div', 'h2', 'button', 'i', 'form', 'input', 'label', 'select', 'option', 'textarea'],
                        ADD_ATTR: ['class', 'id', 'style', 'onclick', 'type', 'name', 'required', 'step', 'value']
                    });
                    mainContent.appendChild(modalDiv.firstElementChild);
                }

                if (UIComponents.getModalAsignacionContent) {
                    const modalAsignacionDiv = document.createElement('div');
                    modalAsignacionDiv.innerHTML = DOMPurify.sanitize(UIComponents.getModalAsignacionContent(), {
                        ADD_TAGS: ['div', 'h3', 'button', 'i', 'label', 'input', 'select', 'option'],
                        ADD_ATTR: ['class', 'id', 'style', 'onclick', 'type', 'value']
                    });
                    document.body.appendChild(modalAsignacionDiv.firstElementChild);
                }

                setTimeout(() => {
                    this.cargarProyectos();

                    // Event Listeners
                    const searchInput = document.getElementById('buscarProyectos');
                    if (searchInput) {
                        searchInput.addEventListener('keyup', () => window.filtrarProyectos());
                    }

                    const filterInputs = document.querySelectorAll('.proyectos-filter-input');
                    filterInputs.forEach((input, index) => {
                        input.addEventListener('keyup', () => window.filtrarPorColumnaProyectos(index, input.value));
                    });
                }, 100);
                return;
            } else if (pageName === 'gestion-cuadrillas' && UIComponents.getCuadrillasTableContent) {
                content = UIComponents.getCuadrillasTableContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th', 'form', 'label', 'select', 'option', 'textarea'],
                    ADD_ATTR: ['class', 'id', 'style', 'onclick', 'onkeyup', 'onchange', 'title', 'placeholder', 'type', 'value', 'name', 'data-state', 'required', 'step', 'accept', 'min']
                });

                // Inject Modal
                if (UIComponents.getModalCuadrillaContent) {
                    const modalDiv = document.createElement('div');
                    modalDiv.innerHTML = DOMPurify.sanitize(UIComponents.getModalCuadrillaContent(), {
                        ADD_TAGS: ['div', 'h2', 'button', 'i', 'form', 'input', 'label', 'select', 'option', 'textarea'],
                        ADD_ATTR: ['class', 'id', 'style', 'onclick', 'type', 'name', 'required', 'step', 'value', 'min']
                    });
                    mainContent.appendChild(modalDiv.firstElementChild);
                }

                setTimeout(() => {
                    this.cargarCuadrillas();

                    // Event Listeners
                    const searchInput = document.getElementById('buscarCuadrillas');
                    if (searchInput) {
                        searchInput.addEventListener('keyup', () => window.filtrarCuadrillas());
                    }

                    const filterInputs = document.querySelectorAll('.cuadrillas-filter-input');
                    filterInputs.forEach((input, index) => {
                        input.addEventListener('keyup', () => window.filtrarPorColumnaCuadrillas(index, input.value));
                    });
                }, 100);
                return;
            } else if (pageName === 'gestion-materiales' && UIComponents.getMaterialesTableContent) {
                content = UIComponents.getMaterialesTableContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th', 'label', 'select', 'option', 'form'],
                    ADD_ATTR: ['class', 'id', 'style', 'onclick', 'onkeyup', 'onchange', 'type', 'value', 'name', 'placeholder', 'required', 'min', 'step', 'onsubmit']
                });

                setTimeout(() => {
                    this.cargarMateriales();

                    // Event Listeners
                    const searchInput = document.getElementById('buscarMateriales');
                    if (searchInput) {
                        searchInput.addEventListener('keyup', () => window.filtrarMateriales());
                    }

                    const filterInputs = document.querySelectorAll('.materiales-filter-input');
                    filterInputs.forEach((input, index) => {
                        // Map index to column name
                        const cols = ['id', 'nombre', 'categoria', 'stock', 'unidad', 'precio', 'proveedor'];
                        input.addEventListener('keyup', () => window.filtrarPorColumnaMateriales(cols[index], input.value));
                    });
                }, 100);
                return;
            } else if (pageName === 'datos-generales' && UIComponents.getDatosGeneralesContent) {
                content = UIComponents.getDatosGeneralesContent();
                mainContent.innerHTML = DOMPurify.sanitize(content, {
                    ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th', 'label'],
                    ADD_ATTR: ['class', 'id', 'style', 'onclick', 'onchange', 'type', 'accept', 'for']
                });
                return;
            } else {
                content = this.getPlaceholderContent(pageTitle);
            }
        } else {
            content = `<div class="p-4 text-destructive">Error: UIComponents not loaded</div>`;
        }

        // This part is only for non-special pages
        if (pageName !== 'colaboradores' && pageName !== 'configuracion-sistema') {
            mainContent.innerHTML = DOMPurify.sanitize(content, {
                ADD_TAGS: ['style', 'tr', 'td', 'span', 'button', 'i', 'div', 'input', 'table', 'thead', 'tbody', 'th'],
                ADD_ATTR: ['class', 'id', 'style', 'onclick', 'title', 'placeholder', 'type', 'value', 'name', 'data-state']
            });
        }
    }

    getPlaceholderContent(title) {
        return `
            <div class="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <i class="fas fa-tools text-4xl mb-4 opacity-20"></i>
                <h2 class="text-xl font-semibold mb-2">Página en Construcción</h2>
                <p>El módulo "${title}" estará disponible pronto.</p>
            </div>
        `;
    }

    loadMockCollaborators() {
        // Temporary mock loader to show UI immediately
        const tbody = document.getElementById('colaboradores-tbody');
        if (tbody && (!tbody.children.length || tbody.children[0].innerText.includes('Cargando'))) {
            const mockData = Array.from({ length: 10 }, (_, i) => ({
                dni: `100000${i}`,
                inspector: `COLABORADOR EJEMPLO ${i + 1}`,
                telefono: '999888777',
                distrito: 'LIMA',
                tipo: i % 2 === 0 ? 'CHOFER' : 'INSPECTOR',
                estado: i % 3 === 0 ? 'Inactivo' : 'Activo',
                fechaInicio: '2025-01-01',
                hasUser: i % 2 === 0,
                userIsActive: true
            }));

            this.todosLosEmpleados = mockData;
            this.finalizarCargaEmpleados('Mock');
        }
    }

    // --- Collaborators Logic ---

    // --- Dashboard Logic ---

    async cargarDashboard() {
        console.log('[DASHBOARD] Cargando datos...');
        try {
            const jwt = localStorage.getItem('jwt') || '';
            const headers = { 'Accept': 'application/json', 'Authorization': jwt ? `Bearer ${jwt}` : '' };

            // Fetch data in parallel
            const [colaboradores, proyectos, vehiculos] = await Promise.all([
                fetch(`${API_NET}/api/personal`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
                fetch(`${API_NET}/api/proyectos`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
                fetch(`${API_NET}/api/vehiculos`, { headers }).then(r => r.ok ? r.json() : []).catch(() => [])
            ]);

            // Store raw data for filtering
            this.dashboardData = { colaboradores, proyectos, vehiculos };

            // Initialize Filters
            this.cargarFiltroDivisiones(proyectos);

            // Initial Render (will use default 'all' filter)
            this.filtrarDashboard();

        } catch (error) {
            console.error('[DASHBOARD] Error cargando dashboard:', error);
        }
    }

    cargarFiltroDivisiones(proyectos) {
        const select = document.getElementById('filtro-division-dashboard');
        if (!select) return;

        // Extract unique divisions
        const divisiones = [...new Set(proyectos.map(p => p.division || p.Division).filter(d => d))].sort();

        // Preserve current selection if any
        const currentVal = select.value;

        select.innerHTML = '<option value="">Todas las Divisiones</option>';
        divisiones.forEach(div => {
            const option = document.createElement('option');
            option.value = div;
            option.textContent = div;
            select.appendChild(option);
        });

        if (currentVal && divisiones.includes(currentVal)) {
            select.value = currentVal;
        }
    }

    filtrarDashboard() {
        if (!this.dashboardData) return;

        const select = document.getElementById('filtro-division-dashboard');
        const divisionFilter = select ? select.value : '';

        let { colaboradores, proyectos, vehiculos } = this.dashboardData;

        // Filter by Division
        if (divisionFilter) {
            // Filter Projects
            proyectos = proyectos.filter(p => (p.division || p.Division) === divisionFilter);

            // Filter Collaborators
            colaboradores = colaboradores.filter(c => {
                // Let's stick to strict Division first, but log if mismatch
                return (c.division || c.Division) === divisionFilter;
            });
        }

        this.actualizarKPIs(colaboradores, proyectos, vehiculos);
        this.renderizarGraficos(colaboradores, proyectos, vehiculos);
        this.actualizarActividadReciente();
    }

    actualizarKPIs(colaboradores, proyectos, vehiculos) {
        // Colaboradores - Consideramos activos si FechaCese es nula o futura
        const now = new Date();
        const activos = colaboradores.filter(c => {
            const fechaCese = c.fechaCese || c.FechaCese ? new Date(c.fechaCese || c.FechaCese) : null;
            // Active if no FechaCese OR FechaCese is in the future
            return !fechaCese || fechaCese > now;
        }).length;

        const kpiColab = document.getElementById('kpi-colaboradores');
        if (kpiColab) kpiColab.textContent = activos;

        // Proyectos
        const proyActivos = proyectos.filter(p => p.estado === 'En Curso' || p.estado === 'Activo').length;
        const kpiProy = document.getElementById('kpi-proyectos');
        if (kpiProy) kpiProy.textContent = proyActivos;

        // Vehículos
        const vehDisponibles = vehiculos.filter(v => v.estado === 'Disponible' || v.estado === 'Operativo').length;
        const kpiVeh = document.getElementById('kpi-vehiculos');
        if (kpiVeh) kpiVeh.textContent = vehDisponibles;

        const kpiVehStatus = document.getElementById('kpi-vehiculos-status');
        if (kpiVehStatus) kpiVehStatus.textContent = `${vehDisponibles} de ${vehiculos.length} operativos`;

        // Asistencia (Mock por ahora)
        const kpiAsist = document.getElementById('kpi-asistencia');
        const kpiAsistCount = document.getElementById('kpi-asistencia-count');
        if (kpiAsist) kpiAsist.textContent = '85%';
        if (kpiAsistCount) kpiAsistCount.textContent = `${Math.round(activos * 0.85)}/${activos} presentes`;
    }

    renderizarGraficos(colaboradores, proyectos, vehiculos) {
        if (typeof Chart === 'undefined') return;

        // Render Projects Chart (Headcount per Area)
        this.renderProjectsChart(colaboradores, proyectos);

        // Render Collaborators Type Chart (Initial render with all active collaborators)
        this.renderTypeChart(colaboradores);

        // Chart 3: Estado de Vehículos
        const ctx2 = document.getElementById('chart-vehiculos-estado');
        if (ctx2) {
            // Robust cleanup: Check if a chart instance exists on this canvas
            const existingChart = Chart.getChart('chart-vehiculos-estado');
            if (existingChart) {
                existingChart.destroy();
            } else {
                // Fallback: Check global instances
                Object.values(Chart.instances).forEach(instance => {
                    if (instance.canvas === ctx2) {
                        instance.destroy();
                    }
                });
            }
            // The `this.charts['vehiculos-estado']` fallback is removed as `Chart.getChart` is the robust method.

            const estados = {};
            vehiculos.forEach(v => {
                const estado = v.estado || 'Desconocido';
                estados[estado] = (estados[estado] || 0) + 1;
            });

            this.charts['vehiculos-estado'] = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(estados),
                    datasets: [{
                        data: Object.values(estados),
                        backgroundColor: [
                            'rgb(34, 197, 94)',
                            'rgb(239, 68, 68)',
                            'rgb(234, 179, 8)',
                            'rgb(100, 116, 139)'
                        ],
                        borderColor: [
                            'rgb(34, 197, 94)',
                            'rgb(239, 68, 68)',
                            'rgb(234, 179, 8)',
                            'rgb(100, 116, 139)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }
    }

    renderProjectsChart(colaboradores, proyectos) {
        const ctxProy = document.getElementById('chart-proyectos-division');
        if (!ctxProy) return;

        // Robust cleanup: Check if a chart instance exists on this canvas
        const existingChart = Chart.getChart(ctxProy);
        if (existingChart) {
            existingChart.destroy();
        } else {
            // Fallback: Check global instances
            Object.values(Chart.instances).forEach(instance => {
                if (instance.canvas === ctxProy) {
                    instance.destroy();
                }
            });
        }

        // 1. Get Active Projects Names (Areas)
        const activeProjectNames = proyectos
            .filter(p => p.estado === 'En Curso' || p.estado === 'Activo')
            .map(p => (p.nombre || '').toUpperCase().trim());

        // 2. Count Active Collaborators per Area
        const headcountByArea = {};
        activeProjectNames.forEach(name => {
            headcountByArea[name] = 0;
        });

        const now = new Date();
        colaboradores.forEach(c => {
            const fechaCese = c.fechaCese || c.FechaCese ? new Date(c.fechaCese || c.FechaCese) : null;
            const isActive = !fechaCese || fechaCese > now;

            if (isActive) {
                const area = (c.area || c.Area || '').toUpperCase().trim();
                if (activeProjectNames.includes(area)) {
                    headcountByArea[area] = (headcountByArea[area] || 0) + 1;
                }
            }
        });

        const sortedEntries = Object.entries(headcountByArea).sort(([, a], [, b]) => b - a);
        const labels = sortedEntries.map(([k]) => k);
        const data = sortedEntries.map(([, v]) => v);

        this.charts['proyectos-division'] = new Chart(ctxProy, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Colaboradores Activos',
                    data: data,
                    backgroundColor: labels.map(l => l === this.selectedAreaFilter ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.5)'),
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (context) => ` ${context.raw} Colaboradores` }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } }
                },
                onClick: (evt, elements, chart) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = chart.data.labels[index];

                        // Defer update to avoid destroying chart while handling event
                        requestAnimationFrame(() => {
                            // Toggle Filter
                            if (this.selectedAreaFilter === label) {
                                this.selectedAreaFilter = null; // Clear if clicked again
                            } else {
                                this.selectedAreaFilter = label;
                            }

                            // Re-render this chart to update selection highlight
                            this.renderProjectsChart(colaboradores, proyectos);

                            // Update Type Chart
                            this.renderTypeChart(colaboradores);
                        });
                    }
                }
            }
        });
    }

    renderTypeChart(colaboradores) {
        const ctx1 = document.getElementById('chart-colaboradores-tipo');
        if (!ctx1) return;

        const existingChart = Chart.getChart(ctx1);
        if (existingChart) existingChart.destroy();
        else if (this.charts['colaboradores-tipo']) this.charts['colaboradores-tipo'].destroy();

        const now = new Date();

        // Filter Active Collaborators
        let colaboradoresActivos = colaboradores.filter(c => {
            const fechaCese = c.fechaCese || c.FechaCese ? new Date(c.fechaCese || c.FechaCese) : null;
            return !fechaCese || fechaCese > now;
        });

        // Apply Area Filter if selected
        if (this.selectedAreaFilter) {
            colaboradoresActivos = colaboradoresActivos.filter(c => {
                const area = (c.area || c.Area || '').toUpperCase().trim();
                return area === this.selectedAreaFilter;
            });
        }

        const tipos = {};
        colaboradoresActivos.forEach(c => {
            const tipo = c.tipo || 'Sin Asignar';
            tipos[tipo] = (tipos[tipo] || 0) + 1;
        });

        this.charts['colaboradores-tipo'] = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: Object.keys(tipos),
                datasets: [{
                    label: this.selectedAreaFilter ? `Colaboradores en ${this.selectedAreaFilter}` : 'Colaboradores Activos',
                    data: Object.values(tipos),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (context) => ` ${context.raw} Colaboradores` }
                    },
                    title: {
                        display: !!this.selectedAreaFilter,
                        text: this.selectedAreaFilter ? `Filtrado por: ${this.selectedAreaFilter}` : ''
                    }
                }
            }
        });
    }

    actualizarActividadReciente() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        const activities = [
            { icon: 'fa-user-plus', color: 'text-blue-600', text: 'Nuevo colaborador registrado', time: 'Hace 2 horas' },
            { icon: 'fa-check-circle', color: 'text-green-600', text: 'Proyecto "Mantenimiento Norte" completado', time: 'Hace 5 horas' },
            { icon: 'fa-exclamation-triangle', color: 'text-yellow-600', text: 'Alerta de stock bajo: Cascos de seguridad', time: 'Hace 1 día' }
        ];

        container.innerHTML = activities.map(a => `
            <div class="flex items-start space-x-3">
                <div class="mt-1"><i class="fas ${a.icon} ${a.color}"></i></div>
                <div>
                    <p class="text-sm font-medium text-foreground">${a.text}</p>
                    <p class="text-xs text-muted-foreground">${a.time}</p>
                </div>
            </div>
        `).join('');
    }

    // --- Collaborators Logic ---

    async cargarEmpleados() {
        const tbody = document.getElementById('colaboradores-tbody');
        const counter = document.getElementById('contador-colaboradores');

        if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4">Cargando datos...</td></tr>';
        if (counter) counter.textContent = 'Cargando...';

        try {
            // Try .NET API
            const fuentesNet = [`${API_NET}/api/personal`];
            for (let url of fuentesNet) {
                url = `${url}?t=${Date.now()}`;
                try {
                    console.log('[EMPLEADOS] Cargando datos (API .NET):', url);
                    const jwt = localStorage.getItem('jwt') || '';
                    const headers = { 'Accept': 'application/json', 'Authorization': jwt ? `Bearer ${jwt}` : '' };

                    const response = await fetch(url, { headers, cache: 'no-cache' });

                    if (response.ok) {
                        const empleados = await response.json();

                        // Accept empty array as valid response
                        if (Array.isArray(empleados)) {
                            if (empleados.length > 0) {
                                console.log('[DEBUG] Primer empleado recibido:', empleados[0]);
                                console.log('[DEBUG] Area del primer empleado:', empleados[0].area, empleados[0].Area);
                            }
                            this.todosLosEmpleados = empleados.map(e => ({
                                dni: e.dni || '',
                                inspector: e.inspector || '',
                                telefono: e.telefono || '',
                                distrito: e.distrito || '',
                                tipo: e.tipo || '',
                                estado: e.estado || '',
                                fechaInicio: e.fechaInicio || null,
                                fechaCese: e.fechaCese || null,
                                fechaCreacion: e.fechaCreacion || null,
                                hasUser: e.hasUser || false,
                                userIsActive: e.userIsActive || false,
                                // Added fields
                                email: e.email || e.Email || '',
                                emailPersonal: e.emailPersonal || e.EmailPersonal || '',
                                fechaNacimiento: e.fechaNacimiento || e.FechaNacimiento || null,
                                codigoEmpleado: e.codigoEmpleado || e.CodigoEmpleado || '',
                                jefeInmediato: e.jefeInmediato || e.JefeInmediato || '',
                                area: e.area || e.Area || '',
                                detalleCebe: e.detalleCebe || e.DetalleCebe || '',
                                foto: e.foto || e.Foto || '',
                                firma: e.firma || e.Firma || ''
                            }));

                            // Calculate Counts
                            const now = new Date();
                            const total = this.todosLosEmpleados.length;
                            const cesados = this.todosLosEmpleados.filter(e => e.fechaCese && new Date(e.fechaCese) <= now).length;
                            const activos = total - cesados;

                            if (counter) {
                                counter.innerHTML = `<span class="text-green-600">Activos: ${activos}</span> | <span class="text-red-600">Cesados: ${cesados}</span> | Total: ${total}`;
                            }

                            this.finalizarCargaEmpleados('API .NET');
                            // Trigger initial filter to respect default "Activos" selection
                            this.filtrarColaboradores();
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('[EMPLEADOS] API .NET no disponible', e);
                }
            }

            // Only fallback to Mock Data if ALL APIs failed (network error or non-200)
            console.log('[EMPLEADOS] APIs fallaron, usando datos de prueba');
            this.loadMockCollaborators();

        } catch (error) {
            console.error('[EMPLEADOS] Error fatal:', error);
            this.loadMockCollaborators();
        }
    }

    finalizarCargaEmpleados(origen) {
        console.log(`[EMPLEADOS] Carga finalizada desde: ${origen}`);
        // No need to call render directly here as filtrarColaboradores will do it

        // Show notification
        const msg = origen === 'Mock'
            ? '⚠️ Conexión fallida. Mostrando datos de prueba.'
            : '✅ Conexión exitosa. Datos actualizados.';

        // Use existing notification system if available, or simple alert/console
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(msg, origen === 'Mock' ? 'warning' : 'success');
        } else {
            // Create a simple toast if not exists
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white ${origen === 'Mock' ? 'bg-yellow-600' : 'bg-green-600'} transition-opacity duration-500`;
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }
    }

    mostrarEmpleadosPaginados() {
        const inicio = (this.paginaActualEmpleados - 1) * this.empleadosPorPagina;
        const fin = inicio + this.empleadosPorPagina;
        const empleadosPagina = this.empleadosFiltrados.slice(inicio, fin);

        this.renderTablaEmpleados(empleadosPagina);
        this.updatePaginationControls();
    }

    renderTablaEmpleados(empleados) {
        const tbody = document.getElementById('colaboradores-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted-foreground">No se encontraron resultados</td></tr>';
            return;
        }

        let allRowsHtml = '';
        empleados.forEach(emp => {
            if (UIComponents.getColaboradorRow) {
                allRowsHtml += UIComponents.getColaboradorRow(emp);
            }
        });

        // Wrap in table structure to prevent DOMPurify from stripping tr/td tags
        const wrappedHtml = `<table><tbody>${allRowsHtml}</tbody></table>`;
        const sanitizedWrapped = DOMPurify.sanitize(wrappedHtml, {
            ADD_TAGS: ['tr', 'td', 'span', 'button', 'i', 'div'],
            ADD_ATTR: ['class', 'id', 'style', 'onclick', 'title', 'data-state']
        });

        // Extract the rows from the sanitized table
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedWrapped;
        const sanitizedRows = tempDiv.querySelector('tbody') ? tempDiv.querySelector('tbody').innerHTML : '';

        tbody.innerHTML = sanitizedRows;

        const counter = document.getElementById('contador-colaboradores');
        if (counter) {
            counter.textContent = `Mostrando ${Math.min(this.empleadosFiltrados.length, (this.paginaActualEmpleados - 1) * this.empleadosPorPagina + 1)} - ${Math.min(this.empleadosFiltrados.length, this.paginaActualEmpleados * this.empleadosPorPagina)} de ${this.empleadosFiltrados.length} registros`;
        }

        const totalRecords = document.getElementById('total-records');
        if (totalRecords) {
            totalRecords.textContent = this.empleadosFiltrados.length;
        }
    }

    updatePaginationControls() {
        const container = document.getElementById('pagination-numbers');
        if (!container) return;

        const totalPages = Math.ceil(this.empleadosFiltrados.length / this.empleadosPorPagina);
        let html = '';

        // Previous
        html += `
            <button onclick="window.dashboard.changePage(${this.paginaActualEmpleados - 1})" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                ${this.paginaActualEmpleados === 1 ? 'disabled style="opacity:0.5"' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page Numbers (Simplified)
        html += `<span class="text-sm mx-2">Página ${this.paginaActualEmpleados} de ${totalPages}</span>`;

        // Next
        html += `
            <button onclick="window.dashboard.changePage(${this.paginaActualEmpleados + 1})" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                ${this.paginaActualEmpleados >= totalPages ? 'disabled style="opacity:0.5"' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    changePage(newPage) {
        const totalPages = Math.ceil(this.empleadosFiltrados.length / this.empleadosPorPagina);
        if (newPage < 1 || newPage > totalPages) return;

        this.paginaActualEmpleados = newPage;
        this.mostrarEmpleadosPaginados();
    }

    // --- Search and Filter Logic ---

    filtrarColaboradores(termino) {
        // 1. Get Status Filter
        const statusSelect = document.getElementById('filtroEstadoColaboradores');
        const statusFilter = statusSelect ? statusSelect.value : 'activos'; // Default to 'activos'

        // 2. Get Search Term (if not provided as arg, try getting from input)
        if (termino === undefined) {
            const searchInput = document.getElementById('buscarColaboradores');
            termino = searchInput ? searchInput.value : '';
        }

        // 3. Filter
        const lower = termino ? termino.toLowerCase().trim() : '';
        const now = new Date();

        this.empleadosFiltrados = this.todosLosEmpleados.filter(e => {
            // A. Status Filter
            let matchesStatus = true;
            const fechaCese = e.fechaCese ? new Date(e.fechaCese) : null;
            const isCesado = fechaCese && fechaCese <= now;

            if (statusFilter === 'activos') {
                matchesStatus = !isCesado;
            } else if (statusFilter === 'cesados') {
                matchesStatus = isCesado;
            }
            // 'todos' -> matchesStatus = true

            if (!matchesStatus) return false;

            // B. Text Search
            if (!lower) return true;

            return (
                (e.dni && e.dni.toLowerCase().includes(lower)) ||
                (e.inspector && e.inspector.toLowerCase().includes(lower)) ||
                (e.telefono && e.telefono.toLowerCase().includes(lower)) ||
                (e.distrito && e.distrito.toLowerCase().includes(lower)) ||
                (e.tipo && e.tipo.toLowerCase().includes(lower))
            );
        });

        this.paginaActualEmpleados = 1;
        this.mostrarEmpleadosPaginados();
    }

    ordenarTablaColaboradores(columna) {
        const columnMap = ['dni', 'inspector', 'telefono', 'distrito', 'tipo', 'estado', 'fechaInicio', 'fechaCese'];
        const field = columnMap[columna];
        if (!field) return;

        // Toggle sort direction
        if (!this.sortColumn || this.sortColumn !== field) {
            this.sortColumn = field;
            this.sortDirection = 'asc';
        } else {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        }

        this.empleadosFiltrados.sort((a, b) => {
            let valA = a[field] || '';
            let valB = b[field] || '';

            // Handle dates
            if (field.includes('fecha') || field.includes('Fecha')) {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.mostrarEmpleadosPaginados();
    }

    filtrarPorColumnaColaboradores(columna, valor) {
        // This is a more advanced filter that works per column
        // Store column filters
        if (!this.columnFilters) this.columnFilters = {};

        if (!valor || valor.trim() === '') {
            delete this.columnFilters[columna];
        } else {
            this.columnFilters[columna] = valor.toLowerCase();
        }

        // Apply all column filters
        // Apply all column filters
        const columnMap = ['dni', 'inspector', 'telefono', 'area', 'tipo', 'estado', 'fechaInicio', 'fechaCese', 'fechaCreacion'];

        // Get Status Filter
        const statusSelect = document.getElementById('filtroEstadoColaboradores');
        const statusFilter = statusSelect ? statusSelect.value : 'activos';
        const now = new Date();

        this.empleadosFiltrados = this.todosLosEmpleados.filter(e => {
            // 1. Apply Status Filter
            let matchesStatus = true;
            const fechaCese = e.fechaCese ? new Date(e.fechaCese) : null;
            const isCesado = fechaCese && fechaCese <= now;

            if (statusFilter === 'activos') {
                matchesStatus = !isCesado;
            } else if (statusFilter === 'cesados') {
                matchesStatus = isCesado;
            }
            if (!matchesStatus) return false;

            // 2. Apply Column Filters
            for (let col in this.columnFilters) {
                const field = columnMap[col];
                const filterValue = this.columnFilters[col];
                const fieldValue = (e[field] || '').toString().toLowerCase();

                if (!fieldValue.includes(filterValue)) {
                    return false;
                }
            }
            return true;
        });

        this.paginaActualEmpleados = 1;
        this.mostrarEmpleadosPaginados();
    }

    // --- Configuration Logic ---


    async cargarConfiguracion() {
        console.log('[CONFIG] Cargando configuración...');
        try {
            const response = await fetch(`${API_NET}/api/SystemSettings`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error('Error al cargar configuración');

            const settings = await response.json();
            console.log('[CONFIG] Configuración recibida:', settings);

            // Map settings to inputs
            const mapping = {
                'SmtpHost': 'smtp-server',
                'SmtpPort': 'smtp-port',
                'SmtpUser': 'smtp-user',
                'SmtpPassword': 'smtp-password',
                'FromEmail': 'smtp-from',
                'AdminEmail': 'admin-email'
            };

            settings.forEach(setting => {
                const inputId = mapping[setting.key]; // Note: API returns 'key' (lowercase) or 'Key' depending on serializer? C# uses PascalCase but JSON usually camelCase. Let's check response structure if possible, but usually it's camelCase by default in .NET Core unless configured otherwise. Controller returns anonymous object with Key property.
                // Actually controller returns: { Key, Value, Description, UpdatedAt }
                // JSON serializer usually keeps PascalCase if not configured, or camelCase. Let's assume camelCase 'key' or PascalCase 'Key'.
                // Safe bet: check both or normalize.

                const key = setting.key || setting.Key;
                const value = setting.value || setting.Value;

                const targetId = mapping[key];
                if (targetId) {
                    const input = document.getElementById(targetId);
                    if (input) {
                        input.value = value === '********' ? '' : value; // Don't show masked password
                        if (value === '********') input.placeholder = '********';
                    }
                }
            });

        } catch (error) {
            console.error('[CONFIG] Error:', error);
            // alert('Error al cargar la configuración del sistema');
        }
    }

    async guardarConfiguracion() {
        console.log('[CONFIG] Guardando configuración...');
        const btn = document.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }

        try {
            const updates = [];
            const inputs = [
                { key: 'SmtpHost', id: 'smtp-host' },
                { key: 'SmtpPort', id: 'smtp-port' },
                { key: 'SmtpUser', id: 'smtp-user' },
                { key: 'SmtpPassword', id: 'smtp-password' },
                { key: 'FromEmail', id: 'smtp-from' }
            ];

            inputs.forEach(item => {
                const input = document.getElementById(item.id);
                if (input && input.value) {
                    updates.push({
                        Key: item.key,
                        Value: input.value,
                        Description: 'Updated via Modern Dashboard'
                    });
                }
            });

            const response = await fetch(`${API_NET}/api/SystemSettings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Error al guardar configuración');

            alert('Configuración guardada exitosamente');
            this.cargarConfiguracion(); // Reload to show updated state

        } catch (error) {
            console.error('[CONFIG] Error:', error);
            alert('Error al guardar la configuración');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            }
        }
    }

    async probarEmail() {
        const email = prompt("Ingrese un correo para enviar la prueba:");
        if (!email) return;

        try {
            const response = await fetch(`${API_NET}/api/SystemSettings/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
                body: JSON.stringify({ ToEmail: email })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al enviar correo');
            }

            alert('Correo de prueba enviado exitosamente');

        } catch (error) {
            console.error('[CONFIG] Error prueba email:', error);
            alert('Error al enviar correo de prueba: ' + error.message);
        }
    }
    // --- Carga Masiva Logic (New) ---

    abrirModalCargaMasiva() {
        // Remove existing modal if any
        const existingModal = document.getElementById('modal-carga-masiva');
        if (existingModal) existingModal.remove();

        // Inject new modal
        const modalHtml = UIComponents.getExcelUploadModal();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = document.getElementById('modal-carga-masiva');
        if (modal) {
            modal.style.display = 'flex';
            // Reset state
            this.currentWorkbook = null;
            this.currentSheetData = null;
        }
    }

    cerrarModalCargaMasiva() {
        const modal = document.getElementById('modal-carga-masiva');
        if (modal) modal.remove();
    }

    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const nombreArchivo = document.getElementById('nombre-archivo-modal');
        if (nombreArchivo) nombreArchivo.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                this.detectExcelSheets(data);
            } catch (error) {
                console.error('Error leyendo archivo:', error);
                alert('Error al leer el archivo Excel');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    detectExcelSheets(data) {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            this.currentWorkbook = workbook;

            const sheetNames = workbook.SheetNames;
            const select = document.getElementById('select-hoja-excel');
            const info = document.getElementById('info-hojas');
            const container = document.getElementById('selector-hojas-container');

            if (select && sheetNames.length > 0) {
                select.innerHTML = '<option value="">Seleccione una hoja...</option>';
                sheetNames.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    select.appendChild(option);
                });

                if (info) info.textContent = `${sheetNames.length} hojas detectadas`;
                if (container) container.classList.remove('hidden');
            } else {
                alert('No se encontraron hojas en el archivo Excel');
            }
        } catch (error) {
            console.error('Error procesando Excel:', error);
            alert('Error al procesar el archivo Excel');
        }
    }

    handleSheetChange() {
        const select = document.getElementById('select-hoja-excel');
        const sheetName = select.value;
        if (!sheetName || !this.currentWorkbook) return;

        const worksheet = this.currentWorkbook.Sheets[sheetName];

        // User requested mapping from B4:AA4
        // range: 3 means start at row 4 (0-indexed)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 3 });

        if (jsonData.length === 0) {
            alert('La hoja seleccionada está vacía o no tiene datos en el rango esperado (desde fila 4)');
            return;
        }

        // Headers are now the first row of the returned data
        // We need columns B to AA (Indices 1 to 26)
        const rawHeaders = jsonData[0];

        // Slice from index 1 (Column B) to 27 (Column AA + 1)
        const headers = rawHeaders.slice(1, 27).map(h => h ? String(h).trim() : `Columna ${Math.random().toString(36).substr(2, 5)}`);

        console.log('Headers detectados:', headers); // DEBUG
        this.currentSheetHeaders = headers;

        // Data is the rest
        this.currentSheetData = jsonData.slice(1).map(row => {
            // Also slice the row data
            const rowData = row.slice(1, 27);
            let obj = {};
            headers.forEach((col, index) => {
                obj[col] = rowData[index] !== undefined ? rowData[index] : '';
            });
            return obj;
        });

        this.renderColumnPreview(headers);

        // Enable Process button
        const btn = document.getElementById('btn-procesar-carga');
        if (btn) btn.disabled = false;
    }

    renderColumnPreview(headers) {
        const container = document.getElementById('preview-columnas-container');
        const list = document.getElementById('lista-columnas-preview');
        const counter = document.getElementById('contador-registros-preview');

        if (container) container.classList.remove('hidden');
        if (counter) counter.textContent = `${this.currentSheetData.length} registros`;

        if (list) {
            list.innerHTML = headers.map(header => `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-check-circle text-green-500 text-xs"></i>
                    <span class="truncate" title="${header}">${header}</span>
                </div>
            `).join('');
        }
    }

    async procesarCargaMasiva() {
        if (!this.currentSheetData || this.currentSheetData.length === 0) return;

        const btn = document.getElementById('btn-procesar-carga');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Procesando...';
        }

        let successCount = 0;
        let errorCount = 0;
        let insertedCount = 0;
        let updatedCount = 0;

        try {
            let isFirst = true;
            for (const row of this.currentSheetData) {
                if (isFirst) {
                    console.log('Primera fila raw:', row); // DEBUG
                    isFirst = false;
                }
                // Map columns loosely to support variations
                // Map columns loosely to support variations
                // Helper to convert Excel date (serial or string) to JS Date
                const excelDateToJSDate = (serial) => {
                    if (!serial) return null;
                    // If it's a number (Excel serial date)
                    // Excel base date: Dec 30 1899 (usually). JS base date: Jan 1 1970.
                    // Difference is 25569 days.
                    // 86400 seconds/day * 1000 ms/second
                    if (typeof serial === 'number') {
                        // Adjust for Excel leap year bug (1900 is not leap year) if needed, but usually negligible for modern dates
                        const utc_days = Math.floor(serial - 25569);
                        const utc_value = utc_days * 86400;
                        const date_info = new Date(utc_value * 1000);

                        // Adjust for timezone offset to get the correct local date
                        // The above gives UTC date. If we want "00:00:00" local time:
                        const fractional_day = serial - Math.floor(serial) + 0.0000001;
                        const total_seconds = Math.floor(86400 * fractional_day);
                        const seconds = total_seconds % 60;
                        const minutes = Math.floor(total_seconds / 60) % 60;
                        const hours = Math.floor(total_seconds / (60 * 60));

                        // Create date using local time components to avoid timezone shifts
                        return new Date(date_info.getUTCFullYear(), date_info.getUTCMonth(), date_info.getUTCDate(), hours, minutes, seconds);
                    }

                    // If it's already a string, try parsing it
                    const d = new Date(serial);
                    return isNaN(d.getTime()) ? null : d;
                };

                const personal = {
                    DNI: row['DNI'] || row['dni'] || row['CODIGO SAP'] || '',
                    Nombre: row['TRABAJADOR'] || row['trabajador'] || row['NOMBRE'] || row['nombre'] || row['Inspector'] || '',
                    Telefono: String(row['TELEFONO'] || row['telefono'] || ''),
                    Distrito: row['DISTRITO'] || row['distrito'] || row['SEDE DE TRABAJO'] || '',
                    Tipo: row['CATEGORIA / GRUPO OCUPACIONAL'] || row['PUESTO'] || row['puesto'] || row['cargo'] || 'OPERARIO',
                    Estado: row['SITUACION'] || row['ESTADO'] || row['estado'] || 'ACTIVO',

                    // Fix: Use helper for dates
                    FechaInicio: excelDateToJSDate(row['FECHA DE INGRESO'] || row['FECHA DE INGRESO '] || row['FECHA_INICIO']) || new Date(),
                    FechaCese: excelDateToJSDate(row['FECHA DE CESE']),

                    Email: row['CORREO CORPORATIVO'] || row['EMAIL'] || '',
                    EmailPersonal: row['CORREO PERSONAL'] || row['EMAIL_PERSONAL'] || '',
                    CodigoEmpleado: row['CODIGO SAP'] || '',

                    // New mapped fields
                    Area: row['AREA-PROYECTO'] || row['Area'] || '',
                    Seccion: row['SECCION-SERVICIO'] || row['Seccion'] || '',
                    Division: row['DIVISION'] || row['Division'] || '',
                    LineaNegocio: row['LINEA DE NEGOCIO'] || row['LineaNegocio'] || '',
                    CodigoCebe: row['COD CEBE / ELEMENTO PEP'] || '',
                    DetalleCebe: row['DET CEBE / ELEMENTO PEP'] || '',

                    // Fix: Use helper for dates
                    FechaNacimiento: excelDateToJSDate(row['FECHA DE NACIMIENTO'] || row['FECHA DE NACIMIENTO ']),

                    Sexo: row['SEXO'] || '',
                    Edad: row['EDAD'] ? parseInt(row['EDAD']) : null,
                    Permanencia: row['PERMANENCIA'] ? parseFloat(row['PERMANENCIA']) : null,
                    JefeInmediato: row['JEFE INMEDIATO'] || '',
                    MotivoCeseDesc: row['MOTIVO DE CESE'] || '',
                    Comentario: row['COMENTARIO'] || ''
                };

                // Split Name if needed
                if (!personal.Inspector && personal.Nombre) {
                    personal.Inspector = personal.Nombre;
                }

                if (!personal.DNI) {
                    // console.warn('Fila sin DNI ignorada:', row); // Reduce noise
                    continue;
                }

                try {
                    // Try POST
                    const response = await fetch(`${API_NET}/api/personal`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(personal)
                    });

                    if (response.ok) {
                        successCount++;
                        insertedCount++;
                    } else {
                        const errorText = await response.text();
                        console.error(`Error POST DNI ${personal.DNI}:`, errorText); // DEBUG
                        // alert(`Error al cargar DNI ${personal.DNI}: ${errorText}`); // Optional: Uncomment if needed for debugging

                        // If failed, try PUT (Update)
                        const putRes = await fetch(`${API_NET}/api/personal/${personal.DNI}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(personal)
                        });

                        if (putRes.ok) {
                            successCount++;
                            updatedCount++;
                        } else {
                            const putError = await putRes.text();
                            console.error(`Error PUT DNI ${personal.DNI}:`, putError); // DEBUG
                            errorCount++;
                        }
                    }
                } catch (err) {
                    console.error(`Error procesando DNI ${personal.DNI}:`, err);
                    errorCount++;
                }
            }

            // Register History
            try {
                const history = {
                    Archivo: document.getElementById('nombre-archivo-modal')?.textContent || 'Carga Masiva',
                    Hoja: document.getElementById('select-hoja-excel')?.value || 'Desconocida',
                    Periodo: new Date().toISOString().slice(0, 7).replace('-', ''), // YYYYMM
                    FilasProcesadas: this.currentSheetData.length,
                    InsertadosSnapshot: insertedCount,
                    ActualizadosSnapshot: updatedCount,
                    Duplicados: 0,
                    EventosGenerados: successCount,
                    Usuario: 'Usuario Web'
                };
                await fetch(`${API_NET}/api/personal/history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(history)
                });
            } catch (e) {
                console.error('Error registrando historial:', e);
            }

            alert(`Carga completada.\n✅ Insertados: ${insertedCount}\n🔄 Actualizados: ${updatedCount}\n❌ Fallidos: ${errorCount}`);
            this.cerrarModalCargaMasiva();
            this.cargarEmpleados();

        } catch (error) {
            console.error('Error fatal en carga masiva:', error);
            alert('Error al procesar la carga masiva');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check mr-2"></i> Procesar Carga';
            }
        }
    }
    // --- Modal & CRUD Logic ---

    openModal(modalId) {
        // The original modal CSS handles display via class, but we might need to ensure it's in the DOM
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove(); // Remove completely to reset state next time
        }
    }

    abrirModalCrearColaborador() {
        this.closeModal('modal-colaborador'); // Ensure cleanup
        const modalHtml = UIComponents.getOriginalColaboradorModal({});
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    editarEmpleado(dni) {
        const emp = this.todosLosEmpleados.find(e => e.dni === String(dni));
        if (!emp) return alert('Colaborador no encontrado');

        this.closeModal('modal-colaborador');
        const modalHtml = UIComponents.getOriginalColaboradorModal(emp);
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Populate split name fields
        if (emp.inspector) {
            const parsed = this.parseFullName(emp.inspector);
            const nombreInput = document.getElementById('colab-nombre');
            if (nombreInput) nombreInput.value = parsed.nombres;
            const paternoInput = document.getElementById('colab-apellido-paterno');
            if (paternoInput) paternoInput.value = parsed.paterno;
            const maternoInput = document.getElementById('colab-apellido-materno');
            if (maternoInput) maternoInput.value = parsed.materno;
        }

        // Populate Selects with dynamic metadata (Corrected Mapping)
        // metadata.divisiones contains DB 'Area' (UI Unidad)
        // metadata.areas contains DB 'DetalleCebe' (UI Area)
        // metadata.cargos contains DB 'Tipo' (UI Puesto)

        this.populateSelect('colab-unidad', this.metadata?.divisiones, emp.area);
        this.populateSelect('colab-area', this.metadata?.areas, emp.detalleCebe);
        this.populateSelect('colab-puesto', this.metadata?.cargos, emp.tipo);

        // Ensure current values are selected even if not in metadata
        if (emp.area && !this.metadata?.divisiones?.includes(emp.area)) {
            this.addOption('colab-unidad', emp.area);
        }
        this.setSelectValue('colab-unidad', emp.area);

        if (emp.detalleCebe && !this.metadata?.areas?.includes(emp.detalleCebe)) {
            this.addOption('colab-area', emp.detalleCebe);
        }
        this.setSelectValue('colab-area', emp.detalleCebe);

        if (emp.tipo && !this.metadata?.cargos?.includes(emp.tipo)) {
            this.addOption('colab-puesto', emp.tipo);
        }
        this.setSelectValue('colab-puesto', emp.tipo);
    }

    verEmpleado(dni) {
        const emp = this.todosLosEmpleados.find(e => e.dni === String(dni));
        if (!emp) return alert('Colaborador no encontrado');

        this.closeModal('modal-colaborador');
        let modalHtml = UIComponents.getOriginalColaboradorModal(emp);

        // Disable inputs for view mode
        modalHtml = modalHtml.replace(/<input/g, '<input disabled').replace(/<select/g, '<select disabled');
        // Hide save button
        modalHtml = modalHtml.replace(/<button.*btn-save.*<\/button>/, '');

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Populate split name fields (disabled)
        if (emp.inspector) {
            const parsed = this.parseFullName(emp.inspector);
            const nombreInput = document.getElementById('colab-nombre');
            if (nombreInput) nombreInput.value = parsed.nombres;
            const paternoInput = document.getElementById('colab-apellido-paterno');
            if (paternoInput) paternoInput.value = parsed.paterno;
            const maternoInput = document.getElementById('colab-apellido-materno');
            if (maternoInput) maternoInput.value = parsed.materno;
        }

        this.setSelectValue('colab-unidad', emp.area);
        this.setSelectValue('colab-area', emp.detalleCebe);
    }

    async guardarColaborador(mode) {
        const form = document.getElementById('form-colaborador');
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Construct Full Name (Inspector)
        const nombre = document.getElementById('colab-nombre')?.value || '';
        const paterno = document.getElementById('colab-apellido-paterno')?.value || '';
        const materno = document.getElementById('colab-apellido-materno')?.value || '';

        // Only update Inspector if fields are present
        if (nombre || paterno) {
            data.Inspector = `${paterno} ${materno} ${nombre}`.trim().replace(/\s+/g, ' ');
        }

        // Map UI fields back to API fields if needed
        data.Division = document.getElementById('colab-unidad')?.value || '';
        data.Area = document.getElementById('colab-area')?.value || '';
        data.Categoria = document.getElementById('colab-puesto')?.value || '';



        // Validate
        if (!data.DNI) return alert('El DNI es obligatorio');
        if (!data.Inspector) return alert('El Nombre es obligatorio');

        try {
            const url = `${API_NET}/api/personal${mode === 'edit' ? '/' + data.DNI : ''}`;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Error al guardar');
            }

            alert(`Colaborador ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente`);
            this.closeModal('modal-colaborador');
            this.cargarEmpleados(); // Refresh

        } catch (error) {
            console.error('[CRUD] Error:', error);
            alert('Error: ' + error.message);
        }
    }

    // --- Helpers ---

    parseFullName(fullName) {
        if (!fullName) return { paterno: '', materno: '', nombres: '' };

        const tokens = fullName.trim().split(/\s+/);
        const connectors = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'SAN', 'SANTA', 'Y', 'VAN', 'VON', 'DA', 'DI'];

        let paterno = '';
        let materno = '';
        let nombres = '';
        let i = 0;

        // 1. Extract Paternal Surname
        if (i < tokens.length) {
            paterno = tokens[i]; i++;
            while (i < tokens.length && connectors.includes(tokens[i].toUpperCase())) {
                paterno += ' ' + tokens[i]; i++;
            }
            // Check if next token is part of surname (e.g. "De La Cruz")
            // The previous logic was: if token is connector, append next.
            // New logic: if current token is connector, append it.
            // Wait, "De La Cruz".
            // i=0: "De" (connector).
            // Logic should be: if token is connector, take it AND the next one.
            // Or: accumulate tokens as long as they look like a surname prefix.

            // Let's use a simpler heuristic closer to the original:
            // If the *current* token is a connector, append it and the next one.
            // But "De La Cruz" -> "De" is connector. "La" is connector. "Cruz" is not.
        }

        // Let's use the subagent's proposed logic but verify it.
        // Subagent logic:
        // paterno = tokens[i]; i++;
        // while (connectors.includes(tokens[i])) { paterno += ' ' + tokens[i]; i++; }
        // This assumes the connector FOLLOWS the name? No.
        // "De La Cruz".
        // i=0. paterno="De".
        // i=1. "La" is connector. paterno="De La".
        // i=2. "Cruz" is NOT connector. Loop ends.
        // Result: "De La". Wrong. "Cruz" should be part of it.

        // Correct Logic for "De La Cruz":
        // Start with empty.
        // While token is connector, append.
        // Append the first non-connector.

        // Let's rewrite it properly.

        i = 0;
        paterno = '';
        while (i < tokens.length) {
            const token = tokens[i];
            if (paterno.length > 0) paterno += ' ';
            paterno += token;
            i++;
            if (!connectors.includes(token.toUpperCase())) break;
        }

        materno = '';
        while (i < tokens.length) {
            const token = tokens[i];
            if (materno.length > 0) materno += ' ';
            materno += token;
            i++;
            if (!connectors.includes(token.toUpperCase())) break;
        }

        nombres = tokens.slice(i).join(' ');

        return { paterno, materno, nombres };
    }

    populateSelect(id, items, selectedValue) {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '<option value="">-- Seleccione --</option>'; // Reset
        if (items && Array.isArray(items)) {
            items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                select.appendChild(opt);
            });
        }
    }

    addOption(id, value) {
        const select = document.getElementById(id);
        if (!select) return;
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        select.appendChild(opt);
    }

    setSelectValue(id, value) {
        const select = document.getElementById(id);
        if (!select || !value) return;

        let found = false;
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === value) {
                select.selectedIndex = i;
                found = true;
                break;
            }
        }

        if (!found) {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            select.add(option);
            select.value = value;
        }
    }

    async eliminarEmpleado(dni) {
        if (!confirm(`¿Estás seguro de eliminar al colaborador con DNI ${dni}? Esta acción no se puede deshacer.`)) return;

        try {
            const response = await fetch(`${API_NET}/api/personal/${dni}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error al eliminar');

            alert('Colaborador eliminado exitosamente');
            this.cargarEmpleados();

        } catch (error) {
            console.error('[CRUD] Error delete:', error);
            alert('Error al eliminar: ' + error.message);
        }
    }

    async cesarColaborador(dni) {
        if (!confirm(`¿Estás seguro de CESAR al colaborador con DNI ${dni}?`)) return;

        try {
            const response = await fetch(`${API_NET}/api/personal/${dni}/terminate`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Error al cesar');

            alert('Colaborador cesado exitosamente');
            this.cargarEmpleados();

        } catch (error) {
            console.error('[CRUD] Error terminate:', error);
            alert('Error al cesar: ' + error.message);
        }
    }
    // --- Gestión Operativa Logic ---

    procesarArchivoExcel(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        const nombreArchivo = document.getElementById('nombre-archivo-operativa');
        const infoBanner = document.getElementById('info-operativa');
        const infoTexto = document.getElementById('info-texto-operativa');

        if (nombreArchivo) nombreArchivo.textContent = file.name;
        if (infoBanner) infoBanner.classList.add('hidden');

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    throw new Error('El archivo está vacío');
                }

                // First row is header
                this.columnasOperativas = jsonData[0];
                // Rest is data, convert to objects
                this.datosOperativos = jsonData.slice(1).map(row => {
                    let obj = {};
                    this.columnasOperativas.forEach((col, index) => {
                        obj[col] = row[index] || '';
                    });
                    return obj;
                });

                this.paginaActualOperativa = 1;
                this.renderizarTablaOperativa();

                if (infoBanner && infoTexto) {
                    infoTexto.textContent = `Archivo cargado exitosamente: ${this.datosOperativos.length} registros encontrados.`;
                    infoBanner.classList.remove('hidden');
                }

            } catch (error) {
                console.error('[OPERATIVA] Error procesando Excel:', error);
                alert('Error al procesar el archivo Excel. Asegúrese de que sea un formato válido.');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    renderizarTablaOperativa() {
        const thead = document.getElementById('thead-operativa');
        const tbody = document.getElementById('tbody-operativa');
        const counter = document.getElementById('contador-operativa');
        const paginationContainer = document.getElementById('paginacion-container-operativa');
        const pagination = document.getElementById('paginacion-operativa');

        if (!thead || !tbody) return;

        // Render Headers
        if (this.columnasOperativas.length > 0) {
            thead.innerHTML = `
                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    ${this.columnasOperativas.map(col => `
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                            ${col}
                        </th>
                    `).join('')}
                </tr>
            `;
        } else {
            thead.innerHTML = '';
        }

        // Pagination Logic
        const total = this.datosOperativos.length;
        const start = (this.paginaActualOperativa - 1) * this.operativaPorPagina;
        const end = start + this.operativaPorPagina;
        const paginatedItems = this.datosOperativos.slice(start, end);

        if (counter) counter.textContent = total;
        if (paginationContainer) paginationContainer.classList.remove('hidden');

        // Render Rows
        if (paginatedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center p-8 text-muted-foreground">No hay datos para mostrar</td></tr>';
        } else {
            tbody.innerHTML = paginatedItems.map(row => `
                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    ${this.columnasOperativas.map(col => `
                        <td class="p-4 align-middle whitespace-nowrap">${row[col] || ''}</td>
                    `).join('')}
                </tr>
            `).join('');
        }

        // Render Pagination
        if (pagination) {
            const totalPages = Math.ceil(total / this.operativaPorPagina);
            let paginationHTML = '';

            if (totalPages > 1) {
                paginationHTML += `
                    <button onclick="cambiarPaginaOperativa(${this.paginaActualOperativa - 1})" ${this.paginaActualOperativa === 1 ? 'disabled' : ''} class="px-2 py-1 border rounded disabled:opacity-50">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="text-sm">Pág ${this.paginaActualOperativa} de ${totalPages}</span>
                    <button onclick="cambiarPaginaOperativa(${this.paginaActualOperativa + 1})" ${this.paginaActualOperativa === totalPages ? 'disabled' : ''} class="px-2 py-1 border rounded disabled:opacity-50">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                `;
            }
            pagination.innerHTML = paginationHTML;
        }
    }

    cambiarPaginaOperativa(page) {
        if (page < 1 || page > Math.ceil(this.datosOperativos.length / this.operativaPorPagina)) return;
        this.paginaActualOperativa = page;
        this.renderizarTablaOperativa();
    }

    limpiarDatosOperativos() {
        this.datosOperativos = [];
        this.columnasOperativas = [];
        this.paginaActualOperativa = 1;

        const input = document.getElementById('input-excel-operativa');
        const nombreArchivo = document.getElementById('nombre-archivo-operativa');
        const infoBanner = document.getElementById('info-operativa');
        const tbody = document.getElementById('tbody-operativa');
        const thead = document.getElementById('thead-operativa');
        const paginationContainer = document.getElementById('paginacion-container-operativa');

        if (input) input.value = '';
        if (nombreArchivo) nombreArchivo.textContent = 'Ningún archivo seleccionado';
        if (infoBanner) infoBanner.classList.add('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');

        if (thead) thead.innerHTML = '';
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100%" class="text-center p-8 text-muted-foreground">
                        <div class="flex flex-col items-center justify-center">
                            <i class="fas fa-file-import text-4xl mb-4 opacity-20"></i>
                            <p>Cargue un archivo Excel para visualizar los datos</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    // --- Gestión de Materiales Logic ---

    async cargarMateriales() {
        try {
            // Mock Data disabled to reflect empty DB state
            /*
            const mockMateriales = [
                { id: 'MAT-001', nombre: 'Casco de Seguridad', categoria: 'EPP', stock: 150, unidad: 'UND', precio: 45.00, proveedor: 'Seguridad Industrial SAC' },
                { id: 'MAT-002', nombre: 'Chaleco Reflectivo', categoria: 'EPP', stock: 8, unidad: 'UND', precio: 35.50, proveedor: 'Textiles Perú' },
                { id: 'MAT-003', nombre: 'Guantes de Cuero', categoria: 'EPP', stock: 200, unidad: 'PAR', precio: 12.00, proveedor: 'Seguridad Industrial SAC' },
                { id: 'MAT-004', nombre: 'Martillo Hidráulico', categoria: 'HERRAMIENTAS', stock: 5, unidad: 'UND', precio: 1200.00, proveedor: 'Maquinarias S.A.' },
                { id: 'MAT-005', nombre: 'Cemento Sol', categoria: 'INSUMOS', stock: 45, unidad: 'BOLSA', precio: 28.50, proveedor: 'Constructoras Unidas' },
                { id: 'MAT-006', nombre: 'Cable Eléctrico #12', categoria: 'INSUMOS', stock: 500, unidad: 'M', precio: 2.50, proveedor: 'Electricidad Total' },
                { id: 'MAT-007', nombre: 'Llave Inglesa', categoria: 'HERRAMIENTAS', stock: 12, unidad: 'UND', precio: 55.00, proveedor: 'Ferretería Central' },
                { id: 'MAT-008', nombre: 'Botas de Seguridad', categoria: 'EPP', stock: 30, unidad: 'PAR', precio: 85.00, proveedor: 'Calzado Industrial' },
                { id: 'MAT-009', nombre: 'Lija de Agua', categoria: 'INSUMOS', stock: 100, unidad: 'HOJA', precio: 1.50, proveedor: 'Ferretería Central' },
                { id: 'MAT-010', nombre: 'Taladro Percutor', categoria: 'HERRAMIENTAS', stock: 3, unidad: 'UND', precio: 450.00, proveedor: 'Maquinarias S.A.' }
            ];
            */
            const mockMateriales = [];

            this.materiales = mockMateriales;
            this.materialesFiltrados = [...this.materiales];
            this.renderizarTablaMateriales();
            this.actualizarContadorMateriales();

        } catch (error) {
            console.error('Error cargando materiales:', error);
            alert('Error al cargar la lista de materiales');
        }
    }

    renderizarTablaMateriales() {
        const tbody = document.getElementById('tabla-materiales-body');
        const paginationContainer = document.getElementById('paginacion-materiales');

        if (!tbody) return;

        tbody.innerHTML = '';

        const start = (this.paginaActualMateriales - 1) * this.materialesPorPagina;
        const end = start + this.materialesPorPagina;
        const paginatedItems = this.materialesFiltrados.slice(start, end);

        if (paginatedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted-foreground">No se encontraron materiales</td></tr>';
            return;
        }

        paginatedItems.forEach(material => {
            tbody.innerHTML += UIComponents.getMaterialRow(material);
        });

        this.renderizarPaginacionMateriales(paginationContainer);
    }

    renderizarPaginacionMateriales(container) {
        if (!container) return;

        const totalPages = Math.ceil(this.materialesFiltrados.length / this.materialesPorPagina);

        let html = `
            <button onclick="cambiarPaginaMateriales(${this.paginaActualMateriales - 1})" ${this.paginaActualMateriales === 1 ? 'disabled' : ''} class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="text-sm font-medium">Página ${this.paginaActualMateriales} de ${totalPages || 1}</span>
            <button onclick="cambiarPaginaMateriales(${this.paginaActualMateriales + 1})" ${this.paginaActualMateriales >= totalPages ? 'disabled' : ''} class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    }

    actualizarContadorMateriales() {
        const contador = document.getElementById('contador-materiales');
        if (contador) contador.textContent = this.materialesFiltrados.length;
    }

    filtrarMateriales() {
        const searchTerm = document.getElementById('buscarMateriales')?.value.toLowerCase() || '';

        this.materialesFiltrados = this.materiales.filter(material => {
            const matchesSearch = Object.values(material).some(val =>
                String(val).toLowerCase().includes(searchTerm)
            );

            const matchesColumns = Object.keys(this.columnFiltersMateriales).every(key => {
                const filterVal = this.columnFiltersMateriales[key].toLowerCase();
                return String(material[key]).toLowerCase().includes(filterVal);
            });

            return matchesSearch && matchesColumns;
        });

        this.paginaActualMateriales = 1;
        this.renderizarTablaMateriales();
        this.actualizarContadorMateriales();
    }

    filtrarPorColumnaMateriales(col, val) {
        if (val) {
            this.columnFiltersMateriales[col] = val;
        } else {
            delete this.columnFiltersMateriales[col];
        }
        this.filtrarMateriales();
    }

    ordenarTablaMateriales(key) {
        if (this.ordenActualMateriales.col === key) {
            this.ordenActualMateriales.dir = this.ordenActualMateriales.dir === 'asc' ? 'desc' : 'asc';
        } else {
            this.ordenActualMateriales = { col: key, dir: 'asc' };
        }

        this.materialesFiltrados.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return this.ordenActualMateriales.dir === 'asc' ? -1 : 1;
            if (valA > valB) return this.ordenActualMateriales.dir === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderizarTablaMateriales();
    }

    cambiarPaginaMateriales(page) {
        const totalPages = Math.ceil(this.materialesFiltrados.length / this.materialesPorPagina);
        if (page < 1 || page > totalPages) return;

        this.paginaActualMateriales = page;
        this.renderizarTablaMateriales();
    }

    abrirModalCrearMaterial() {
        const modal = document.getElementById('modal-crear-material');
        const form = document.getElementById('form-crear-material');
        const titulo = document.getElementById('modal-material-titulo');

        if (modal && form) {
            form.reset();
            document.getElementById('material-id').value = '';
            titulo.textContent = 'Nuevo Material';
            modal.classList.remove('hidden');
        }
    }

    guardarMaterial() {
        const id = document.getElementById('material-id').value;
        const nombre = document.getElementById('material-nombre').value;
        const categoria = document.getElementById('material-categoria').value;
        const stock = parseInt(document.getElementById('material-stock').value);
        const unidad = document.getElementById('material-unidad').value;
        const precio = parseFloat(document.getElementById('material-precio').value);
        const proveedor = document.getElementById('material-proveedor').value;

        if (!nombre || !categoria || isNaN(stock) || !unidad || isNaN(precio)) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        if (id) {
            // Edit
            const index = this.materiales.findIndex(m => m.id === id);
            if (index !== -1) {
                this.materiales[index] = { ...this.materiales[index], nombre, categoria, stock, unidad, precio, proveedor };
                alert('Material actualizado exitosamente');
            }
        } else {
            // Create
            const newId = `MAT-${String(this.materiales.length + 1).padStart(3, '0')}`;
            this.materiales.push({ id: newId, nombre, categoria, stock, unidad, precio, proveedor });
            alert('Material creado exitosamente');
        }

        document.getElementById('modal-crear-material').classList.add('hidden');
        this.filtrarMateriales(); // Re-render
    }

    editarMaterial(id) {
        const material = this.materiales.find(m => m.id === id);
        if (!material) return;

        const modal = document.getElementById('modal-crear-material');
        const titulo = document.getElementById('modal-material-titulo');

        document.getElementById('material-id').value = material.id;
        document.getElementById('material-nombre').value = material.nombre;
        document.getElementById('material-categoria').value = material.categoria;
        document.getElementById('material-stock').value = material.stock;
        document.getElementById('material-unidad').value = material.unidad;
        document.getElementById('material-precio').value = material.precio;
        document.getElementById('material-proveedor').value = material.proveedor || '';

        titulo.textContent = 'Editar Material';
        modal.classList.remove('hidden');
    }

    eliminarMaterial(id) {
        if (confirm('¿Está seguro de eliminar este material?')) {
            this.materiales = this.materiales.filter(m => m.id !== id);
            this.filtrarMateriales();
            alert('Material eliminado exitosamente');
        }
    }

    limpiarFiltrosMateriales() {
        document.getElementById('buscarMateriales').value = '';
        document.querySelectorAll('.materiales-filter-input').forEach(i => i.value = '');
        this.columnFiltersMateriales = {};
        this.filtrarMateriales();
    }
    // --- Gestión Operativa Logic ---

    procesarArchivoExcel(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        const nombreArchivo = document.getElementById('nombre-archivo-operativa');
        const infoBanner = document.getElementById('info-operativa');
        const infoTexto = document.getElementById('info-texto-operativa');

        if (nombreArchivo) nombreArchivo.textContent = file.name;
        if (infoBanner) infoBanner.classList.add('hidden');

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    throw new Error('El archivo está vacío');
                }

                // First row is header
                this.columnasOperativas = jsonData[0];
                // Rest is data, convert to objects
                this.datosOperativos = jsonData.slice(1).map(row => {
                    let obj = {};
                    this.columnasOperativas.forEach((col, index) => {
                        obj[col] = row[index] || '';
                    });
                    return obj;
                });

                this.paginaActualOperativa = 1;
                this.renderizarTablaOperativa();

                if (infoBanner && infoTexto) {
                    infoTexto.textContent = `Archivo cargado exitosamente: ${this.datosOperativos.length} registros encontrados.`;
                    infoBanner.classList.remove('hidden');
                }

            } catch (error) {
                console.error('[OPERATIVA] Error procesando Excel:', error);
                alert('Error al procesar el archivo Excel. Asegúrese de que sea un formato válido.');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    renderizarTablaOperativa() {
        const thead = document.getElementById('thead-operativa');
        const tbody = document.getElementById('tbody-operativa');
        const counter = document.getElementById('contador-operativa');
        const paginationContainer = document.getElementById('paginacion-container-operativa');
        const pagination = document.getElementById('paginacion-operativa');

        if (!thead || !tbody) return;

        // Render Headers
        if (this.columnasOperativas.length > 0) {
            thead.innerHTML = `
                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    ${this.columnasOperativas.map(col => `
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                            ${col}
                        </th>
                    `).join('')
                }
                </tr>
                `;
        } else {
            thead.innerHTML = '';
        }

        // Pagination Logic
        const total = this.datosOperativos.length;
        const start = (this.paginaActualOperativa - 1) * this.operativaPorPagina;
        const end = start + this.operativaPorPagina;
        const paginatedItems = this.datosOperativos.slice(start, end);

        if (counter) counter.textContent = total;
        if (paginationContainer) paginationContainer.classList.remove('hidden');

        // Render Rows
        if (paginatedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="text-center p-8 text-muted-foreground">No hay datos para mostrar</td></tr>';
        } else {
            tbody.innerHTML = paginatedItems.map(row => `
                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    ${this.columnasOperativas.map(col => `
                        <td class="p-4 align-middle whitespace-nowrap">${row[col] || ''}</td>
                    `).join('')
                }
                </tr>
                `).join('');
        }

        // Render Pagination
        if (pagination) {
            const totalPages = Math.ceil(total / this.operativaPorPagina);
            let paginationHTML = '';

            if (totalPages > 1) {
                paginationHTML += `
                <button onclick="cambiarPaginaOperativa(${this.paginaActualOperativa - 1})" ${this.paginaActualOperativa === 1 ? 'disabled' : ''} class="px-2 py-1 border rounded disabled:opacity-50">
                    <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="text-sm">Pág ${this.paginaActualOperativa} de ${totalPages}</span>
                    <button onclick="cambiarPaginaOperativa(${this.paginaActualOperativa + 1})" ${this.paginaActualOperativa === totalPages ? 'disabled' : ''} class="px-2 py-1 border rounded disabled:opacity-50">
                        <i class="fas fa-chevron-right"></i>
                    </button>
            `;
            }
            pagination.innerHTML = paginationHTML;
        }
    }

    cambiarPaginaOperativa(page) {
        if (page < 1 || page > Math.ceil(this.datosOperativos.length / this.operativaPorPagina)) return;
        this.paginaActualOperativa = page;
        this.renderizarTablaOperativa();
    }

    limpiarDatosOperativos() {
        this.datosOperativos = [];
        this.columnasOperativas = [];
        this.paginaActualOperativa = 1;

        const input = document.getElementById('input-excel-operativa');
        const nombreArchivo = document.getElementById('nombre-archivo-operativa');
        const infoBanner = document.getElementById('info-operativa');
        const tbody = document.getElementById('tbody-operativa');
        const thead = document.getElementById('thead-operativa');
        const paginationContainer = document.getElementById('paginacion-container-operativa');

        if (input) input.value = '';
        if (nombreArchivo) nombreArchivo.textContent = 'Ningún archivo seleccionado';
        if (infoBanner) infoBanner.classList.add('hidden');
        if (paginationContainer) paginationContainer.classList.add('hidden');

        if (thead) thead.innerHTML = '';
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                <td colspan="100%" class="text-center p-8 text-muted-foreground">
                    <div class="flex flex-col items-center justify-center">
                        <i class="fas fa-file-import text-4xl mb-4 opacity-20"></i>
                        <p>Cargue un archivo Excel para visualizar los datos</p>
                    </div>
                </td>
                </tr>
                `;
        }
    }

    // --- Projects Logic ---

    async cargarProyectos() {
        const tbody = document.getElementById('proyectos-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Cargando proyectos...</td></tr>';

        try {
            const jwt = localStorage.getItem('jwt') || '';
            const headers = { 'Accept': 'application/json', 'Authorization': jwt ? `Bearer ${jwt}` : '' };

            const response = await fetch(`${API_NET}/api/proyectos?t=${Date.now()}`, { headers });
            if (response.ok) {
                this.todosLosProyectos = await response.json();
                this.proyectosFiltrados = [...this.todosLosProyectos];
                this.renderTablaProyectos();
            } else {
                console.error('[PROYECTOS] Error cargando proyectos:', response.statusText);
                if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-red-500">Error al cargar proyectos</td></tr>';
            }
        } catch (error) {
            console.error('[PROYECTOS] Error de red:', error);
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-red-500">Error de conexión</td></tr>';
        }
    }

    renderTablaProyectos() {
        const tbody = document.getElementById('proyectos-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.proyectosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted-foreground">No hay proyectos registrados. Pulse "Sincronizar" para importar desde Personal.</td></tr>';
            return;
        }

        let allRowsHtml = '';
        this.proyectosFiltrados.forEach(p => {
            if (UIComponents.getProyectoRow) {
                allRowsHtml += UIComponents.getProyectoRow(p);
            }
        });

        // Wrap in table structure to prevent DOMPurify from stripping tr/td tags
        const wrappedHtml = `<table><tbody>${allRowsHtml}</tbody></table>`;
        const sanitizedWrapped = DOMPurify.sanitize(wrappedHtml, {
            ADD_TAGS: ['tr', 'td', 'span', 'button', 'i', 'div'],
            ADD_ATTR: ['class', 'id', 'style', 'onclick', 'title', 'data-state']
        });

        // Extract the rows from the sanitized table
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedWrapped;
        const sanitizedRows = tempDiv.querySelector('tbody') ? tempDiv.querySelector('tbody').innerHTML : '';

        tbody.innerHTML = sanitizedRows;
    }

    async sincronizarProyectos() {
        if (!confirm('¿Está seguro de sincronizar los proyectos desde la base de datos de Personal? Esto creará nuevos proyectos basados en las Áreas existentes.')) {
            return;
        }

        const btn = document.querySelector('button[onclick="window.dashboard.sincronizarProyectos()"]');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sincronizando...';
        }

        try {
            const jwt = localStorage.getItem('jwt') || '';
            const headers = { 'Accept': 'application/json', 'Authorization': jwt ? `Bearer ${jwt}` : '' };

            const response = await fetch(`${API_NET}/api/proyectos/sync`, {
                method: 'POST',
                headers: headers
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                this.cargarProyectos(); // Reload table
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('[PROYECTOS] Error:', error);
            alert('Error de conexión al sincronizar.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }

    filtrarProyectos() {
        const termino = document.getElementById('buscarProyectos')?.value.toLowerCase() || '';
        this.proyectosFiltrados = this.todosLosProyectos.filter(p =>
            p.nombre.toLowerCase().includes(termino) ||
            (p.cliente && p.cliente.toLowerCase().includes(termino))
        );
        this.renderTablaProyectos();
    }

    filtrarPorColumnaProyectos(index, valor) {
        if (!valor) {
            this.proyectosFiltrados = [...this.todosLosProyectos];
        } else {
            valor = valor.toLowerCase();
            this.proyectosFiltrados = this.todosLosProyectos.filter(p => {
                if (index === 0) return p.id.toString().includes(valor);
                if (index === 1) return p.nombre.toLowerCase().includes(valor);
                if (index === 2) return (p.cliente || '').toLowerCase().includes(valor);
                // Index 3 (Inicio) and 4 (Fin) are dates, skipping simple text match for now or implementing date logic later
                if (index === 5) {
                    const estado = (p.estado || '').toLowerCase();
                    if (valor === 'activos') {
                        return estado === 'en curso' || estado === 'activo';
                    } else if (valor === 'finalizados') {
                        return estado === 'finalizado' || estado === 'suspendido' || estado === 'cancelado';
                    }
                    return estado.includes(valor);
                }
                if (index === 6) return (p.presupuesto || '').toString().includes(valor);
                return true;
            });
        }
        this.renderTablaProyectos();
    }

    async abrirModalAsignacion(idProyecto) {
        document.getElementById('asignacion-proyecto-id').value = idProyecto;

        // Load potential leaders (Managers and Coordinators/Supervisors)
        await this.cargarPosiblesLideres();

        // Try to pre-select existing values if we had them in the project object (requires updating getProyectos to return them)
        // For now, we just open the modal.

        document.getElementById('modal-asignacion').classList.remove('hidden');
    }

    cerrarModalAsignacion() {
        document.getElementById('modal-asignacion').classList.add('hidden');
        document.getElementById('select-gerente').value = '';
        document.getElementById('select-jefe').value = '';
    }

    async cargarPosiblesLideres() {
        try {
            const jwt = localStorage.getItem('jwt');
            const response = await fetch(`${API_NET}/api/personal`, {
                headers: { 'Authorization': `Bearer ${jwt}` }
            });

            if (response.ok) {
                const personal = await response.json();

                // Filter for Gerentes
                const gerentes = personal.filter(p => (p.categoria || '').toLowerCase().includes('gerente'));
                const selectGerente = document.getElementById('select-gerente');
                selectGerente.innerHTML = '<option value="">Seleccione un Gerente...</option>';
                gerentes.forEach(g => {
                    selectGerente.innerHTML += `<option value="${g.dni}">${g.nombre} ${g.apellidoPaterno}</option>`;
                });

                // Filter for Jefes/Coordinadores/Supervisores
                const jefes = personal.filter(p => {
                    const cat = (p.categoria || '').toLowerCase();
                    return cat.includes('jefe') || cat.includes('coordinador') || cat.includes('supervisor');
                });
                const selectJefe = document.getElementById('select-jefe');
                selectJefe.innerHTML = '<option value="">Seleccione un Jefe...</option>';
                jefes.forEach(j => {
                    selectJefe.innerHTML += `<option value="${j.dni}">${j.nombre} ${j.apellidoPaterno}</option>`;
                });
            }
        } catch (error) {
            console.error('Error cargando líderes:', error);
        }
    }

    async guardarAsignacion() {
        const idProyecto = document.getElementById('asignacion-proyecto-id').value;
        const gerenteDni = document.getElementById('select-gerente').value;
        const jefeDni = document.getElementById('select-jefe').value;

        try {
            const jwt = localStorage.getItem('jwt');
            const response = await fetch(`${API_NET}/api/proyectos/${idProyecto}/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ gerenteDni, jefeDni })
            });

            if (response.ok) {
                alert('Asignación guardada correctamente.');
                this.cerrarModalAsignacion();
                this.cargarProyectos(); // Refresh table
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error guardando asignación:', error);
            alert('Error de conexión.');
        }
    }

    ordenarTablaProyectos(columna) {
        // Simple sort implementation
        this.proyectosFiltrados.sort((a, b) => {
            let valA = a[columna] || '';
            let valB = b[columna] || '';

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });
        this.renderTablaProyectos();
    }
}

// Global Helpers
window.previewImage = (input, imgId, placeholderId = null) => {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById(imgId);
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
            }
            if (placeholderId) {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) placeholder.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }
};

// --- User Activation Logic ---
window.toggleCrearUsuario = () => {
    const section = document.getElementById('section-crear-usuario');
    if (!section) return;

    if (section.style.display === 'none') {
        section.style.display = 'block';

        // Populate DNI
        const dniInput = document.getElementById('colab-num-doc');
        const codigoInput = document.getElementById('colab-codigo');
        const dni = dniInput?.value || codigoInput?.value;

        const usuarioDniInput = document.getElementById('crear-usuario-dni');
        if (usuarioDniInput) usuarioDniInput.value = dni || '';

        // Suggest Role based on Puesto
        const puestoSelect = document.getElementById('colab-puesto');
        let puesto = '';
        if (puestoSelect && puestoSelect.selectedIndex >= 0) {
            puesto = puestoSelect.options[puestoSelect.selectedIndex].text.toUpperCase();
        } else if (puestoSelect) {
            puesto = puestoSelect.value.toUpperCase();
        }

        let role = 'USER';
        if (puesto.includes('GERENTE') || puesto.includes('SUB GERENTE')) role = 'ADMIN';
        else if (puesto.includes('JEFE') || puesto.includes('COORDINADOR')) role = 'MANAGER';
        else if (puesto.includes('SUPERVISOR')) role = 'SUPERVISOR';
        else if (puesto.includes('OPERARIO') || puesto.includes('CHOFER')) role = 'FIELD';

        const roleSelect = document.getElementById('crear-usuario-rol');
        if (roleSelect) roleSelect.value = role;
    } else {
        section.style.display = 'none';
    }
};

window.confirmarCrearUsuario = async () => {
    const dni = document.getElementById('crear-usuario-dni')?.value;
    const rol = document.getElementById('crear-usuario-rol')?.value;
    const accessWeb = document.getElementById('crear-usuario-access-web')?.checked ?? true;
    const accessApp = document.getElementById('crear-usuario-access-app')?.checked ?? true;

    if (!dni) {
        alert("Error: No hay DNI seleccionado.");
        return;
    }

    try {
        const response = await fetch(`${API_NET}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                DNI: dni,
                Password: "", // Empty password triggers auto-generation in backend
                Role: rol,
                AccessWeb: accessWeb,
                AccessApp: accessApp
            })
        });

        if (response.ok) {
            const data = await response.json();
            let msg = "Usuario creado exitosamente.";
            if (data.tempPassword) {
                msg += "\n\nCONTRASEÑA TEMPORAL: " + data.tempPassword + "\n\n(Se ha enviado un correo con las credenciales. Si no lo recibe, use esta contraseña temporal)";
            } else {
                msg += " Las credenciales han sido enviadas al correo.";
            }
            alert(msg);
            window.toggleCrearUsuario(); // Hide form
        } else {
            const text = await response.text();
            alert("Error al crear usuario: " + text);
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Error de conexión al crear usuario.");
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ModernDashboard();
});

// Global Bridge Functions
window.filtrarColaboradores = () => {
    const input = document.getElementById('buscarColaboradores');
    if (input && window.dashboard) {
        window.dashboard.filtrarColaboradores(input.value);
    }
};

window.guardarConfiguracion = () => {
    if (window.dashboard) window.dashboard.guardarConfiguracion();
};

window.probarEmail = () => {
    if (window.dashboard) window.dashboard.probarEmail();
};

window.procesarArchivoColaboradores = (input) => {
    if (window.dashboard) window.dashboard.procesarArchivoColaboradores(input);
};

window.descargarPlantillaColaboradores = () => {
    // Simple CSV export of current data
    if (!window.dashboard) return;
    const data = window.dashboard.todosLosEmpleados.map(e => ({
        DNI: e.dni,
        NOMBRE: e.inspector,
        TELEFONO: e.telefono,
        DISTRITO: e.distrito,
        PUESTO: e.tipo,
        ESTADO: e.estado
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Colaboradores");
    XLSX.writeFile(wb, "plantilla_colaboradores.xlsx");
};

window.abrirModalCrearColaborador = () => {
    if (window.dashboard) window.dashboard.abrirModalCrearColaborador();
};

window.limpiarFiltrosColaboradores = () => {
    const input = document.getElementById('buscarColaboradores');
    if (input) {
        input.value = '';
        window.filtrarColaboradores();
    }
    // Clear column filters
    if (window.dashboard) {
        window.dashboard.columnFilters = {};
        window.dashboard.empleadosFiltrados = [...window.dashboard.todosLosEmpleados];
        window.dashboard.changePage(1);
    }
    // Clear all column filter inputs
    const filterInputs = document.querySelectorAll('.colaboradores-filter-input');
    filterInputs.forEach(input => input.value = '');
};


window.descargarPlantillaColaboradores = () => {
    if (window.dashboard) window.dashboard.descargarPlantillaColaboradores();
};

window.abrirModalCrearColaborador = () => {
    if (window.dashboard) window.dashboard.abrirModalCrearColaborador();
};

window.limpiarFiltrosColaboradores = () => {
    if (window.dashboard) window.dashboard.limpiarFiltrosColaboradores();
};

window.ordenarTablaColaboradores = (columna) => {
    if (window.dashboard) window.dashboard.ordenarTablaColaboradores(columna);
};

window.filtrarPorColumnaColaboradores = (columna, valor) => {
    if (window.dashboard) window.dashboard.filtrarPorColumnaColaboradores(columna, valor);
};

window.verEmpleado = (id) => {
    if (window.dashboard) window.dashboard.verEmpleado(id);
};

window.editarEmpleado = (id) => {
    if (window.dashboard) window.dashboard.editarEmpleado(id);
};

window.eliminarEmpleado = (id) => {
    if (window.dashboard) window.dashboard.eliminarEmpleado(id);
};

window.cesarColaborador = (id) => {
    if (window.dashboard) window.dashboard.cesarColaborador(id);
};

window.toggleUsuario = (id) => {
    if (window.dashboard) window.dashboard.toggleUsuario(id);
};

window.filtrarProyectos = () => window.dashboard.filtrarProyectos();
window.filtrarPorColumnaProyectos = (col, val) => window.dashboard.filtrarPorColumnaProyectos(col, val);
window.ordenarTablaProyectos = (key) => window.dashboard.ordenarTablaProyectos(key);
window.cambiarPaginaProyectos = (page) => window.dashboard.cambiarPaginaProyectos(page);
window.abrirModalCrearProyecto = () => window.dashboard.abrirModalCrearProyecto();
window.guardarProyecto = () => window.dashboard.guardarProyecto();
window.editarProyecto = (id) => window.dashboard.editarProyecto(id);
window.eliminarProyecto = (id) => window.dashboard.eliminarProyecto(id);
window.verProyecto = (id) => window.dashboard.verProyecto(id);
window.limpiarFiltrosProyectos = () => window.dashboard.limpiarFiltrosProyectos();
window.descargarPlantillaProyectos = () => window.dashboard.descargarPlantillaProyectos();
window.procesarArchivoProyectos = (input) => window.dashboard.procesarArchivoProyectos(input);

window.filtrarCuadrillas = () => window.dashboard.filtrarCuadrillas();
window.filtrarPorColumnaCuadrillas = (col, val) => window.dashboard.filtrarPorColumnaCuadrillas(col, val);
window.ordenarTablaCuadrillas = (key) => window.dashboard.ordenarTablaCuadrillas(key);
window.cambiarPaginaCuadrillas = (page) => window.dashboard.cambiarPaginaCuadrillas(page);
window.abrirModalCrearCuadrilla = () => window.dashboard.abrirModalCrearCuadrilla();
window.guardarCuadrilla = () => window.dashboard.guardarCuadrilla();
window.editarCuadrilla = (id) => window.dashboard.editarCuadrilla(id);
window.eliminarCuadrilla = (id) => window.dashboard.eliminarCuadrilla(id);
window.verCuadrilla = (id) => window.dashboard.verCuadrilla(id);
window.limpiarFiltrosCuadrillas = () => {
    document.getElementById('buscarCuadrillas').value = '';
    document.querySelectorAll('.cuadrillas-filter-input').forEach(i => i.value = '');
    window.dashboard.filtrarCuadrillas();
};
window.descargarPlantillaCuadrillas = () => alert('Descargar plantilla no implementado');
window.procesarArchivoCuadrillas = () => alert('Carga masiva no implementada');

window.procesarArchivoExcel = (input) => window.dashboard.procesarArchivoExcel(input);
window.cambiarPaginaOperativa = (page) => window.dashboard.cambiarPaginaOperativa(page);
window.limpiarDatosOperativos = () => window.dashboard.limpiarDatosOperativos();

window.filtrarMateriales = () => window.dashboard.filtrarMateriales();
window.filtrarPorColumnaMateriales = (col, val) => window.dashboard.filtrarPorColumnaMateriales(col, val);
window.ordenarTablaMateriales = (key) => window.dashboard.ordenarTablaMateriales(key);
window.cambiarPaginaMateriales = (page) => window.dashboard.cambiarPaginaMateriales(page);
window.abrirModalCrearMaterial = () => window.dashboard.abrirModalCrearMaterial();
window.guardarMaterial = () => window.dashboard.guardarMaterial();
window.editarMaterial = (id) => window.dashboard.editarMaterial(id);
window.eliminarMaterial = (id) => window.dashboard.eliminarMaterial(id);
window.limpiarFiltrosMateriales = () => window.dashboard.limpiarFiltrosMateriales();

// Logout function
window.logout = () => {
    // Clear localStorage
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('api_net');
    localStorage.removeItem('api_fase4');

    // Redirect to index.html (main page)
    window.location.href = 'index.html';
};

// Initialize dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ModernDashboard();
});
