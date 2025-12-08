/**
 * UI Components Library
 * Reusable components built with Tailwind CSS for OperationSmart
 */

const UIComponents = {
    /**
     * Configuration Tab Content
     * Returns the HTML string for the system configuration form
     */
    getConfiguracionContent: function () {
        return `
            <div class="max-w-4xl mx-auto p-6 space-y-8">
                <!-- Header -->
                <div class="flex flex-col space-y-2">
                    <h2 class="text-2xl font-bold tracking-tight text-primary">Configuración de Sistema</h2>
                    <p class="text-muted-foreground">Administra las configuraciones globales y parámetros de correo.</p>
                </div>

                <!-- Card Container -->
                <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div class="flex flex-col space-y-1.5 p-6 border-b">
                        <h3 class="text-lg font-semibold leading-none tracking-tight">Configuración SMTP</h3>
                        <p class="text-sm text-muted-foreground">Parámetros para el envío de correos electrónicos del sistema.</p>
                    </div>
                    
                    <div class="p-6 pt-0 mt-6">
                        <form onsubmit="event.preventDefault(); guardarConfiguracion();" class="space-y-6">
                            
                            <div class="grid gap-4 md:grid-cols-2">
                                <!-- SMTP Host -->
                                <div class="space-y-2">
                                    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="smtp-host">
                                        Servidor SMTP (Host)
                                    </label>
                                    <input 
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                        id="smtp-host" 
                                        placeholder="smtp.gmail.com" 
                                        type="text"
                                    >
                                </div>

                                <!-- SMTP Port -->
                                <div class="space-y-2">
                                    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="smtp-port">
                                        Puerto SMTP
                                    </label>
                                    <input 
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                        id="smtp-port" 
                                        placeholder="587" 
                                        type="number"
                                    >
                                </div>
                            </div>

                            <div class="grid gap-4 md:grid-cols-2">
                                <!-- SMTP User -->
                                <div class="space-y-2">
                                    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="smtp-user">
                                        Usuario SMTP
                                    </label>
                                    <input 
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                        id="smtp-user" 
                                        placeholder="tu-email@gmail.com" 
                                        type="text"
                                    >
                                </div>

                                <!-- SMTP Password -->
                                <div class="space-y-2">
                                    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="smtp-password">
                                        Contraseña SMTP
                                    </label>
                                    <input 
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                        id="smtp-password" 
                                        placeholder="********" 
                                        type="password"
                                    >
                                    <p class="text-[0.8rem] text-muted-foreground">Dejar en blanco para mantener la actual.</p>
                                </div>
                            </div>

                            <!-- From Email -->
                            <div class="space-y-2">
                                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="smtp-from">
                                    Email Remitente (From)
                                </label>
                                <input 
                                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                    id="smtp-from" 
                                    placeholder="no-reply@tu-dominio.com" 
                                    type="email"
                                >
                            </div>

                            <!-- Actions -->
                            <div class="flex items-center justify-end gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onclick="probarEmail()" 
                                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                >
                                    <i class="fas fa-paper-plane mr-2"></i> Probar Conexión
                                </button>
                                <button 
                                    type="submit" 
                                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    <i class="fas fa-save mr-2"></i> Guardar Configuración
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Collaborators Table Content
     * Returns the HTML string for the collaborators table
     */
    getColaboradoresTableContent: function () {
        return `
            <div class="w-full space-y-4 p-6">
                <!-- Header Actions -->
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div class="relative w-full sm:w-72">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                        <input 
                            type="text" 
                            id="buscarColaboradores" 
                            onkeyup="window.filtrarColaboradores()"
                            placeholder="Buscar por DNI, Nombre..." 
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                    </div>
                    <div class="w-full sm:w-48">
                        <select id="filtroEstadoColaboradores" onchange="window.filtrarColaboradores()" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <option value="activos" selected>Ver Activos</option>
                            <option value="cesados">Ver Cesados</option>
                            <option value="todos">Ver Todos</option>
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="descargarPlantillaColaboradores()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-download mr-2"></i> Plantilla
                        </button>
                        <button onclick="window.dashboard.abrirModalCargaMasiva()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-upload mr-2"></i> Cargar
                        </button>
                        <button onclick="abrirModalCrearColaborador()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <i class="fas fa-plus mr-2"></i> Nuevo
                        </button>
                        <button onclick="window.dashboard.sincronizarProyectos()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
                            <i class="fas fa-sync-alt mr-2"></i> Sincronizar
                        </button>
                        <button onclick="limpiarFiltrosColaboradores()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" title="Limpiar Filtros">
                            <i class="fas fa-filter-circle-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Table Container -->
                <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm" id="tablaColaboradores">
                            <thead class="bg-muted/50">
                                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground w-[100px]" onclick="ordenarTablaColaboradores(0)">
                                        DNI <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground min-w-[200px]" onclick="ordenarTablaColaboradores(1)">
                                        NOMBRE <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">TELÉFONO</th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">ÁREA</th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">PUESTO</th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground w-[100px]" onclick="ordenarTablaColaboradores(5)">
                                        ESTADO <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">FECHAS</th>
                                    <th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[120px]">ACCIONES</th>
                                </tr>
                                <!-- Filtros Row -->
                                <tr class="border-b bg-muted/20">
                                    <td class="p-2"><input type="text" class="colaboradores-filter-input flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs" placeholder="Filtrar DNI..." onkeyup="filtrarPorColumnaColaboradores(0, this.value)"></td>
                                    <td class="p-2"><input type="text" class="colaboradores-filter-input flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs" placeholder="Filtrar nombre..." onkeyup="filtrarPorColumnaColaboradores(1, this.value)"></td>
                                    <td class="p-2"><input type="text" class="colaboradores-filter-input flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs" placeholder="Filtrar..." onkeyup="filtrarPorColumnaColaboradores(2, this.value)"></td>
                                    <td class="p-2"><input type="text" class="colaboradores-filter-input flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs" placeholder="Filtrar área..." onkeyup="filtrarPorColumnaColaboradores(3, this.value)"></td>
                                    <td class="p-2"><input type="text" class="colaboradores-filter-input flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs" placeholder="Filtrar puesto..." onkeyup="filtrarPorColumnaColaboradores(4, this.value)"></td>
                                    <td class="p-2"></td>
                                    <td class="p-2"></td>
                                    <td class="p-2"></td>
                                </tr>
                            </thead>
                            <tbody id="colaboradores-tbody">
                                <!-- Rows will be injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between px-2">
                    <div class="text-sm text-muted-foreground" id="contador-colaboradores">
                        Cargando...
                    </div>
                    <div class="flex items-center space-x-2" id="pagination-numbers">
                        <!-- Pagination buttons will be injected here -->
                    </div>
                    <div class="hidden" id="total-records">0</div>
                </div>
            </div>
        `;
    },

    /**
     * Generates a table row for a collaborator
     * @param {Object} empleado - Employee data
     */
    getColaboradorRow: function (empleado) {
        // Logic for status style based on FechaCese
        let statusClass = "bg-slate-100 text-slate-800";
        let statusText = "Sin Estado";

        const now = new Date();
        const fechaCese = empleado.fechaCese ? new Date(empleado.fechaCese) : null;
        // Check if ceased: FechaCese exists AND is in the past (or today)
        // User query: fechacese IS NULL OR fechacese > GETDATE() -> Active
        // So: fechacese != NULL AND fechacese <= GETDATE() -> Ceased
        const isCesado = fechaCese && fechaCese <= now;

        if (isCesado) {
            statusClass = "bg-red-100 text-red-800";
            statusText = "Cesado";
        } else if (empleado.hasUser && !empleado.userIsActive) {
            statusClass = "bg-yellow-100 text-yellow-800";
            statusText = "Usuario Inactivo";
        } else {
            statusClass = "bg-green-100 text-green-800";
            statusText = "Activo";
        }

        // Action Buttons
        const toggleBtn = empleado.hasUser ? `
            <button onclick="toggleUsuario('${empleado.dni}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="${empleado.userIsActive ? 'Desactivar Usuario' : 'Activar Usuario'}">
                <i class="fas fa-power-off" style="color: ${empleado.userIsActive ? '#10b981' : '#ef4444'};"></i>
            </button>
        ` : '';

        const cesarBtn = !isCesado ? `
            <button onclick="cesarColaborador('${empleado.dni}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Cesar Colaborador">
                <i class="fas fa-user-times text-destructive"></i>
            </button>
        ` : '';

        return `
            <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td class="p-4 align-middle font-medium whitespace-nowrap">${empleado.dni || ''}</td>
                <td class="p-4 align-middle font-medium whitespace-nowrap">${empleado.inspector || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${empleado.telefono || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${empleado.area || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${empleado.tipo || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="p-4 align-middle text-xs text-muted-foreground whitespace-nowrap">
                    <div>Inicio: ${empleado.fechaInicio ? new Date(empleado.fechaInicio).toLocaleDateString() : '-'}</div>
                    <div>Fin: ${empleado.fechaCese ? new Date(empleado.fechaCese).toLocaleDateString() : '-'}</div>
                </td>
                <td class="p-4 align-middle text-center whitespace-nowrap">
                    <div class="flex justify-center gap-1">
                        <button onclick="verEmpleado('${empleado.dni || ''}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Ver">
                            <i class="fas fa-eye text-blue-600"></i>
                        </button>
                        <button onclick="editarEmpleado('${empleado.dni || ''}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Editar">
                            <i class="fas fa-edit text-orange-600"></i>
                        </button>
                        ${toggleBtn}
                        ${cesarBtn}
                        <button onclick="eliminarEmpleado('${empleado.dni || ''}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Eliminar">
                            <i class="fas fa-trash text-destructive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Collaborator Form
     * Returns the HTML string for the collaborator form (Create/Edit)
     */
    getColaboradorForm: function (data = {}) {
        const isEdit = !!data.dni;
        return `
            <form id="form-colaborador" onsubmit="event.preventDefault(); window.dashboard.guardarColaborador('${isEdit ? 'edit' : 'create'}')" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="colab-dni">DNI *</label>
                        <input type="text" id="colab-dni" name="DNI" value="${data.dni || ''}" ${isEdit ? 'readonly' : ''} required pattern="[0-9]{8}" title="8 dígitos numéricos"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="colab-nombre">Nombre Completo *</label>
                        <input type="text" id="colab-nombre" name="Inspector" value="${data.inspector || ''}" required
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="colab-telefono">Teléfono</label>
                        <input type="tel" id="colab-telefono" name="Telefono" value="${data.telefono || ''}"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="colab-distrito">Distrito</label>
                        <input type="text" id="colab-distrito" name="Distrito" value="${data.distrito || ''}"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="colab-puesto">Puesto</label>
                        <select id="colab-puesto" name="Tipo" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="OPERARIO" ${data.tipo === 'OPERARIO' ? 'selected' : ''}>OPERARIO</option>
                            <option value="CHOFER" ${data.tipo === 'CHOFER' ? 'selected' : ''}>CHOFER</option>
                            <option value="INSPECTOR" ${data.tipo === 'INSPECTOR' ? 'selected' : ''}>INSPECTOR</option>
                            <option value="SUPERVISOR" ${data.tipo === 'SUPERVISOR' ? 'selected' : ''}>SUPERVISOR</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="colab-estado">Estado</label>
                        <select id="colab-estado" name="Estado" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="ACTIVO" ${(!data.estado || data.estado === 'ACTIVO' || data.estado === 'Activo') ? 'selected' : ''}>ACTIVO</option>
                            <option value="INACTIVO" ${(data.estado === 'INACTIVO' || data.estado === 'Inactivo') ? 'selected' : ''}>INACTIVO</option>
                            <option value="CESADO" ${(data.estado === 'CESADO' || data.estado === 'Cesado') ? 'selected' : ''}>CESADO</option>
                        </select>
                    </div>
                </div>
                <!-- Hidden fields -->
                <input type="hidden" name="FechaInicio" value="${data.fechaInicio || new Date().toISOString().split('T')[0]}">
            </form>
        `;
    },

    /**
     * Modal Template
     */
    getModalTemplate: function (id, title, content, footer = '') {
        return `
            <div id="${id}" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none" aria-hidden="true">
                <div class="bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 transform transition-all duration-300 scale-95 opacity-0" role="dialog" aria-modal="true">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-lg font-semibold leading-none tracking-tight">${title}</h3>
                        <button onclick="window.dashboard.closeModal('${id}')" class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <i class="fas fa-times h-4 w-4"></i>
                            <span class="sr-only">Close</span>
                        </button>
                    </div>
                    <!-- Body -->
                    <div class="p-6">
                        ${content}
                    </div>
                    <!-- Footer -->
                    ${footer ? `<div class="flex items-center justify-end p-6 border-t gap-2">${footer}</div>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Original Collaborator Modal (Restored)
     */
    /**
     * Original Collaborator Modal (Restored with Exact Fields)
     */
    getOriginalColaboradorModal: function (data = {}) {
        const isEdit = !!(data.dni || data.DNI);

        // Helper to get value case-insensitively
        const getVal = (key) => data[key] || data[key.charAt(0).toUpperCase() + key.slice(1)] || '';

        const inspector = getVal('inspector');
        const foto = getVal('foto');
        const firma = getVal('firma');
        const telefono = getVal('telefono');
        // Email Logic: Email -> EmailPersonal (Handle 'No Aplica')
        let emailVal = getVal('email');
        if (!emailVal || emailVal.toString().toLowerCase() === 'no aplica') {
            emailVal = getVal('emailPersonal');
        }
        const email = emailVal || '';

        const fechaNacimientoRaw = getVal('fechaNacimiento');
        const fechaNacimiento = fechaNacimientoRaw ? new Date(fechaNacimientoRaw).toISOString().split('T')[0] : '';

        const codigoEmpleado = getVal('codigoEmpleado');
        const jefeInmediato = getVal('jefeInmediato');
        const dni = getVal('dni') || getVal('DNI'); // DNI is special
        const distrito = getVal('distrito');
        const tipo = getVal('tipo');
        const estado = getVal('estado');
        const fechaInicioRaw = getVal('fechaInicio');
        const fechaInicio = fechaInicioRaw ? new Date(fechaInicioRaw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        return `
            <div id="modal-colaborador" class="modal-overlay">
                <div class="modal-colaborador-container">
                    <div class="modal-colaborador-header">
                        <h3 id="modal-colaborador-title">${isEdit ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h3>
                        <button type="button" class="btn-close-modal" onclick="window.dashboard.closeModal('modal-colaborador')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-colaborador-body">
                        <div class="colaborador-grid">
                            <!-- Left Column: Profile -->
                            <div class="colaborador-profile">
                                <div class="profile-photo-container">
                                    <div class="profile-photo">
                                        <img id="colab-foto-preview" src="${foto || 'img/placeholder-user.png'}" alt="Perfil"
                                            onerror="this.onerror=null; this.src='img/placeholder-user.png';">
                                    </div>
                                    <label for="colab-foto-input" class="btn-camera">
                                        <i class="fas fa-camera"></i>
                                        <input type="file" id="colab-foto-input" accept="image/*" class="hidden" style="display:none"
                                            onchange="window.previewImage(this, 'colab-foto-preview')">
                                    </label>
                                </div>
                                <h4 id="colab-nombre-completo">${inspector || 'Nombre Apellido'}</h4>
                                <p id="colab-puesto-display" class="text-muted">${tipo || 'Puesto'}</p>

                                <div class="contact-info">
                                    <div class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        <span id="colab-telefono-display">${telefono || '-'}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-envelope"></i>
                                        <span id="colab-email-display">${email || '-'}</span>
                                    </div>
                                </div>

                                <div class="signature-section">
                                    <p>Firma</p>
                                    <div class="signature-box">
                                        <img id="colab-firma-preview" src="${firma || ''}" alt="Firma" style="${firma ? '' : 'display:none;'}">
                                        <div id="signature-placeholder" style="${firma ? 'display:none;' : ''}">
                                            <i class="fas fa-upload"></i>
                                            <span>Click para cargar</span>
                                        </div>
                                        <input type="file" id="colab-firma-input" accept="image/*" class="hidden" style="display:none"
                                            onchange="window.previewImage(this, 'colab-firma-preview', 'signature-placeholder')">
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column: Form -->
                            <div class="colaborador-form">
                                <h3>Información Personal y Laboral</h3>
                                <form id="form-colaborador" onsubmit="event.preventDefault(); window.dashboard.guardarColaborador('${isEdit ? 'edit' : 'create'}')">
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Nombre</label>
                                            <input type="text" id="colab-nombre" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Apellido Paterno</label>
                                            <input type="text" id="colab-apellido-paterno" class="form-control">
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Apellido Materno</label>
                                            <input type="text" id="colab-apellido-materno" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Fecha de Nacimiento</label>
                                            <input type="date" id="colab-fecha-nacimiento" name="FechaNacimiento" value="${fechaNacimiento}" class="form-control">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" id="colab-email" name="Email" value="${email}" class="form-control">
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Teléfono</label>
                                            <input type="tel" id="colab-telefono" name="Telefono" value="${telefono}" class="form-control">
                                        </div>
                                        <div class="form-group">
                                            <label>Código de Empleado</label>
                                            <input type="text" id="colab-codigo" name="CodigoEmpleado" value="${codigoEmpleado}" class="form-control">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Tipo de Documento</label>
                                            <select id="colab-tipo-doc" class="form-select">
                                                <option value="DNI">DNI</option>
                                                <option value="CE">CE</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Número de Documento</label>
                                            <input type="text" id="colab-num-doc" name="DNI" value="${dni}" class="form-control" ${isEdit ? 'readonly' : ''} required>
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Unidad</label>
                                            <select id="colab-unidad" name="Area" class="form-select">
                                                <option value="Proyecto Inspecciones de SST - Luz del Sur">Proyecto Inspecciones de SST - Luz del Sur</option>
                                                <option value="Otro Proyecto">Otro Proyecto</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Área</label>
                                            <select id="colab-area" name="DetalleCebe" class="form-select">
                                                <option value="Operaciones">Operaciones</option>
                                                <option value="Administración">Administración</option>
                                                <option value="Ventas">Ventas</option>
                                                <option value="Recursos Humanos">Recursos Humanos</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>Puesto/Posición</label>
                                        <select id="colab-puesto" name="Tipo" class="form-select">
                                            <option value="Representante" ${tipo === 'Representante' ? 'selected' : ''}>Representante</option>
                                            <option value="Supervisor" ${tipo === 'Supervisor' ? 'selected' : ''}>Supervisor</option>
                                            <option value="Gerente" ${tipo === 'Gerente' ? 'selected' : ''}>Gerente</option>
                                            <option value="Asistente" ${tipo === 'Asistente' ? 'selected' : ''}>Asistente</option>
                                            <option value="OPERARIO" ${tipo === 'OPERARIO' ? 'selected' : ''}>OPERARIO</option>
                                            <option value="CHOFER" ${tipo === 'CHOFER' ? 'selected' : ''}>CHOFER</option>
                                            <option value="INSPECTOR" ${tipo === 'INSPECTOR' ? 'selected' : ''}>INSPECTOR</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label>Jefe Inmediato</label>
                                        <input type="text" id="colab-jefe" name="JefeInmediato" value="${jefeInmediato}" class="form-control">
                                    </div>

                                    <!-- Hidden fields -->
                                    <input type="hidden" name="Estado" value="${estado || 'ACTIVO'}">
                                    <input type="hidden" name="FechaInicio" value="${fechaInicio}">
                                </form>
                            </div>
                        </div>

                        <!-- Create User Section -->
                        <div id="section-crear-usuario" style="display: none; border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
                            <h4>Crear Usuario de Sistema</h4>
                            <div class="row" style="display: flex; gap: 20px;">
                                <div class="col-md-4" style="flex: 1;">
                                    <label class="form-label" style="display: block; margin-bottom: 6px; font-size: 0.875rem; font-weight: 500; color: #334155;">Usuario (DNI)</label>
                                    <input type="text" class="form-control" id="crear-usuario-dni" readonly>
                                </div>
                                <div class="col-md-6" style="flex: 1;">
                                    <label class="form-label" style="display: block; margin-bottom: 6px; font-size: 0.875rem; font-weight: 500; color: #334155;">Rol Sugerido</label>
                                    <select class="form-select" id="crear-usuario-rol">
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="PROJECT_ADMIN">PROJECT ADMIN</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="SUPERVISOR">SUPERVISOR</option>
                                        <option value="USER">USER</option>
                                        <option value="FIELD">FIELD</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mt-2" style="margin-top: 12px; display: flex; gap: 20px;">
                                <div class="col-md-6" style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <input type="checkbox" id="crear-usuario-access-web" checked>
                                        <label for="crear-usuario-access-web" style="font-size: 0.875rem; color: #334155;">Acceso Web</label>
                                    </div>
                                </div>
                                <div class="col-md-6" style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <input type="checkbox" id="crear-usuario-access-app" checked>
                                        <label for="crear-usuario-access-app" style="font-size: 0.875rem; color: #334155;">Acceso App Móvil</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-2" style="margin-top: 12px;">
                                <div class="col-12">
                                    <small class="text-muted">La contraseña será generada automáticamente y enviada al correo del colaborador.</small>
                                </div>
                            </div>
                            <div class="mt-3 text-end" style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 12px;">
                                <button type="button" class="btn-cancel" onclick="window.toggleCrearUsuario()">Cancelar</button>
                                <button type="button" class="btn-save" onclick="window.confirmarCrearUsuario()">Confirmar Creación</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-colaborador-footer">
                        <button type="button" class="btn-secondary" onclick="window.toggleCrearUsuario()" 
                            style="margin-right: auto; background-color: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                            Crear Usuario
                        </button>
                        <button type="button" class="btn-cancel" onclick="window.dashboard.closeModal('modal-colaborador')">Cancelar</button>
                        <button type="button" class="btn-save" onclick="document.getElementById('form-colaborador').dispatchEvent(new Event('submit'))">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Excel Upload Modal
     */
    getExcelUploadModal: function () {
        return `
            <div id="modal-carga-masiva" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" style="display:none;">
                <div class="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-lg font-semibold">Carga Masiva de Colaboradores</h3>
                        <button onclick="window.dashboard.cerrarModalCargaMasiva()" class="text-muted-foreground hover:text-foreground">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Body -->
                    <div class="p-6 space-y-6 overflow-y-auto">
                        <!-- File Input -->
                        <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer" onclick="document.getElementById('input-excel-modal').click()">
                            <input type="file" id="input-excel-modal" accept=".xlsx, .xls" class="hidden" onchange="window.dashboard.handleFileUpload(this)">
                            <div class="flex flex-col items-center gap-2">
                                <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                    <i class="fas fa-file-excel text-2xl"></i>
                                </div>
                                <p class="font-medium">Click para seleccionar archivo Excel</p>
                                <p class="text-sm text-muted-foreground" id="nombre-archivo-modal">Ningún archivo seleccionado</p>
                            </div>
                        </div>

                        <!-- Sheet Selector (Hidden initially) -->
                        <div id="selector-hojas-container" class="hidden space-y-3">
                            <label class="text-sm font-medium">Seleccionar Hoja</label>
                            <select id="select-hoja-excel" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onchange="window.dashboard.handleSheetChange()">
                                <option value="">Seleccione una hoja...</option>
                            </select>
                            <p class="text-xs text-muted-foreground">
                                <i class="fas fa-info-circle mr-1"></i>
                                <span id="info-hojas">0 hojas detectadas</span>
                            </p>
                        </div>

                        <!-- Column Mapping / Preview (Hidden initially) -->
                        <div id="preview-columnas-container" class="hidden space-y-4">
                            <div class="flex items-center justify-between">
                                <h4 class="text-sm font-semibold">Columnas Detectadas</h4>
                                <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full" id="contador-registros-preview">0 registros</span>
                            </div>
                            
                            <div class="border rounded-md p-4 bg-muted/30 max-h-40 overflow-y-auto">
                                <div id="lista-columnas-preview" class="grid grid-cols-2 gap-2 text-sm">
                                    <!-- Checkboxes injected here -->
                                </div>
                            </div>
                            
                            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                Asegúrese de que el Excel tenga las columnas: <strong>DNI, NOMBRE, TELEFONO, DISTRITO, PUESTO, ESTADO</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-end p-6 border-t gap-2 bg-muted/10">
                        <button onclick="window.dashboard.cerrarModalCargaMasiva()" class="px-4 py-2 border rounded-md hover:bg-accent">Cancelar</button>
                        <button id="btn-procesar-carga" onclick="window.dashboard.procesarCargaMasiva()" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <i class="fas fa-check mr-2"></i> Procesar Carga
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    getDashboardContent: function () {
        return `
            <div class="w-full p-6 space-y-6">
                <!-- Page Header -->
                <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p class="text-muted-foreground mt-1">Vista general del sistema</p>
                    </div>
                    <div class="w-full sm:w-64">
                        <select id="filtro-division-dashboard" onchange="window.dashboard.filtrarDashboard()" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <option value="">Todas las Divisiones</option>
                        </select>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Card 1: Colaboradores -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Colaboradores Activos</p>
                                <h3 class="text-2xl font-bold mt-2" id="kpi-colaboradores">0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <i class="fas fa-users text-blue-600 text-xl"></i>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-4">
                            <span id="kpi-colaboradores-change" class="text-green-600">+0%</span> vs mes anterior
                        </p>
                    </div>

                    <!-- Card 2: Proyectos -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Proyectos Activos</p>
                                <h3 class="text-2xl font-bold mt-2" id="kpi-proyectos">0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <i class="fas fa-project-diagram text-green-600 text-xl"></i>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-4">
                            <span id="kpi-proyectos-change" class="text-green-600">+0%</span> vs mes anterior
                        </p>
                    </div>

                    <!-- Card 3: Vehículos -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Vehículos Disponibles</p>
                                <h3 class="text-2xl font-bold mt-2" id="kpi-vehiculos">0</h3>
                            </div>
                            <div class="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <i class="fas fa-truck text-purple-600 text-xl"></i>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-4">
                            <span id="kpi-vehiculos-status" class="text-muted-foreground">Estado actual</span>
                        </p>
                    </div>

                    <!-- Card 4: Asistencia -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Asistencia Hoy</p>
                                <h3 class="text-2xl font-bold mt-2" id="kpi-asistencia">0%</h3>
                            </div>
                            <div class="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <i class="fas fa-user-check text-orange-600 text-xl"></i>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-4">
                            <span id="kpi-asistencia-count">0/0</span> presentes
                        </p>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Chart 1: Proyectos Activos por Área (Headcount) -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 class="font-semibold mb-4">Colaboradores por Proyecto (Área)</h3>
                        <div class="h-64">
                            <canvas id="chart-proyectos-division"></canvas>
                        </div>
                    </div>

                    <!-- Chart 2: Colaboradores por Tipo -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 class="font-semibold mb-4">Colaboradores por Tipo</h3>
                        <div class="h-64">
                            <canvas id="chart-colaboradores-tipo"></canvas>
                        </div>
                    </div>

                    <!-- Chart 3: Estado de Vehículos -->
                    <div class="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 class="font-semibold mb-4">Estado de Vehículos</h3>
                        <div class="h-64">
                            <canvas id="chart-vehiculos-estado"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="rounded-lg border bg-card shadow-sm">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-semibold">Actividad Reciente</h3>
                    </div>
                    <div class="p-6">
                        <div id="recent-activity" class="space-y-3">
                            <p class="text-sm text-muted-foreground">Cargando actividad...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Projects Table Content
     */
    getProyectosTableContent: function () {
        return `
            <div class="w-full space-y-4 p-6">
                <!-- Header Actions -->
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div class="relative w-full sm:w-72">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                        <input 
                            type="text" 
                            id="buscarProyectos" 
                            onkeyup="filtrarProyectos()" 
                            placeholder="Buscar por Proyecto o Cliente..." 
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                        >
                    </div>
                    <div class="flex gap-2">
                        <button onclick="descargarPlantillaProyectos()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-download mr-2"></i> Plantilla
                        </button>
                        <button onclick="document.getElementById('input-carga-proyectos').click()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-upload mr-2"></i> Cargar
                        </button>
                        <button onclick="abrirModalCrearProyecto()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <i class="fas fa-plus mr-2"></i> Nuevo
                        </button>
                        <button onclick="limpiarFiltrosProyectos()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" title="Limpiar Filtros">
                            <i class="fas fa-filter-circle-xmark"></i>
                        </button>
                    </div>
                    <input type="file" id="input-carga-proyectos" accept=".xlsx, .xls" style="display: none;" onchange="procesarArchivoProyectos(this)">
                </div>

                <!-- Table Container -->
                <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm" id="tablaProyectos">
                            <thead>
                                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground w-[100px]" onclick="ordenarTablaProyectos('id')">
                                        ID <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaProyectos('nombre')">
                                        Nombre Proyecto <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaProyectos('cliente')">
                                        Cliente <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaProyectos('fechaInicio')">
                                        Inicio <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaProyectos('fechaFin')">
                                        Fin <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaProyectos('estado')">
                                        Estado <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaProyectos('presupuesto')">
                                        Presupuesto <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Acciones</th>
                                </tr>
                                <!-- Filter Row -->
                                <tr class="border-b bg-muted/30">
                                    <td class="p-2"><input type="text" class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaProyectos(0, this.value)"></td>
                                    <td class="p-2"><input type="text" class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Nombre..." onkeyup="filtrarPorColumnaProyectos(1, this.value)"></td>
                                    <td class="p-2"><input type="text" class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Cliente..." onkeyup="filtrarPorColumnaProyectos(2, this.value)"></td>
                                    <td class="p-2"><input type="text" class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Inicio..." onkeyup="filtrarPorColumnaProyectos(3, this.value)"></td>
                                    <td class="p-2"><input type="text" class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Fin..." onkeyup="filtrarPorColumnaProyectos(4, this.value)"></td>
                                    <td class="p-2">
                                        <select class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" onchange="filtrarPorColumnaProyectos(5, this.value)">
                                            <option value="">Todos</option>
                                            <option value="activos">Activos</option>
                                            <option value="finalizados">Cesados</option>
                                        </select>
                                    </td>
                                    <td class="p-2"><input type="text" class="proyectos-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Presup..." onkeyup="filtrarPorColumnaProyectos(6, this.value)"></td>
                                    <td class="p-2"></td>
                                </tr>
                            </thead>
                            <tbody id="proyectos-tbody">
                                <!-- Rows will be injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between px-2">
                    <div class="text-sm text-muted-foreground">
                        Mostrando <span id="contador-proyectos">0</span> proyectos
                    </div>
                    <div class="flex items-center space-x-2" id="paginacion-proyectos">
                        <!-- Pagination buttons -->
                    </div>
                </div>
            </div>

            <!-- Modal Crear/Editar Proyecto -->
            <div id="modal-proyecto" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
                <div class="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between p-6 border-b">
                        <h2 class="text-lg font-semibold" id="modal-proyecto-titulo">Nuevo Proyecto</h2>
                        <button onclick="window.dashboard.closeModal('modal-proyecto')" class="text-muted-foreground hover:text-foreground">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="form-proyecto" class="space-y-4">
                            <input type="hidden" id="proyecto-id-hidden">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">ID Proyecto</label>
                                    <input type="text" id="proyecto-id" name="id" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Nombre Proyecto</label>
                                    <input type="text" id="proyecto-nombre" name="nombre" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Cliente</label>
                                    <input type="text" id="proyecto-cliente" name="cliente" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Estado</label>
                                    <select id="proyecto-estado" name="estado" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="En Curso">En Curso</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Finalizado">Finalizado</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Fecha Inicio</label>
                                    <input type="date" id="proyecto-inicio" name="fechaInicio" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Fecha Fin</label>
                                    <input type="date" id="proyecto-fin" name="fechaFin" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Presupuesto</label>
                                    <input type="number" id="proyecto-presupuesto" name="presupuesto" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" step="0.01">
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Descripción</label>
                                <textarea id="proyecto-descripcion" name="descripcion" class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="flex items-center justify-end gap-2 p-6 border-t bg-muted/50">
                        <button type="button" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" onclick="window.dashboard.closeModal('modal-proyecto')">
                            Cancelar
                        </button>
                        <button type="button" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" onclick="guardarProyecto()">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    getProyectoRow: function (proyecto) {
        let statusClass = 'bg-gray-100 text-gray-800';
        const estado = (proyecto.estado || '').toLowerCase();

        if (estado.includes('cancelado') || estado.includes('inactivo')) statusClass = 'bg-red-100 text-red-800';
        else if (estado.includes('pendiente')) statusClass = 'bg-yellow-100 text-yellow-800';
        else if (estado.includes('finalizado')) statusClass = 'bg-blue-100 text-blue-800';
        else if (estado.includes('curso') || estado.includes('activo')) statusClass = 'bg-green-100 text-green-800';

        const presupuesto = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(proyecto.presupuesto || 0);

        return `
            <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td class="p-4 align-middle font-medium whitespace-nowrap">${proyecto.id || ''}</td>
                <td class="p-4 align-middle font-medium whitespace-nowrap">${proyecto.nombre || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${proyecto.cliente || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : '-'}</td>
                <td class="p-4 align-middle whitespace-nowrap">${proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString() : '-'}</td>
                <td class="p-4 align-middle whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        ${proyecto.estado || 'Desconocido'}
                    </span>
                </td>
                <td class="p-4 align-middle whitespace-nowrap">${presupuesto}</td>
                <td class="p-4 align-middle text-center whitespace-nowrap">
                    <div class="flex justify-center gap-1">
                        <button onclick="window.dashboard.abrirModalAsignacion('${proyecto.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Asignar Líderes">
                            <i class="fas fa-user-cog text-purple-600"></i>
                        </button>
                        <button onclick="verProyecto('${proyecto.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Ver">
                            <i class="fas fa-eye text-blue-600"></i>
                        </button>
                        <button onclick="editarProyecto('${proyecto.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Editar">
                            <i class="fas fa-edit text-orange-600"></i>
                        </button>
                        <button onclick="eliminarProyecto('${proyecto.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Eliminar">
                            <i class="fas fa-trash text-destructive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    getModalAsignacionContent: function () {
        return `
            <div id="modal-asignacion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden">
                <div class="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Asignar Líderes de Proyecto</h3>
                        <button onclick="window.dashboard.cerrarModalAsignacion()" class="text-muted-foreground hover:text-foreground">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        <input type="hidden" id="asignacion-proyecto-id">
                        <div class="space-y-2">
                            <label class="text-sm font-medium">Gerente de División</label>
                            <select id="select-gerente" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <option value="">Seleccione un Gerente...</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium">Jefe / Coordinador</label>
                            <select id="select-jefe" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <option value="">Seleccione un Jefe...</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-4">
                        <button onclick="window.dashboard.cerrarModalAsignacion()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            Cancelar
                        </button>
                        <button onclick="window.dashboard.guardarAsignacion()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            Guardar Asignación
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Cuadrillas Table Content
     */
    getCuadrillasTableContent: function () {
        return `
            <div class="w-full space-y-4 p-6">
                <!-- Header Actions -->
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div class="relative w-full sm:w-72">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                        <input 
                            type="text" 
                            id="buscarCuadrillas" 
                            onkeyup="filtrarCuadrillas()" 
                            placeholder="Buscar por Nombre o Supervisor..." 
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                        >
                    </div>
                    <div class="flex gap-2">
                        <button onclick="descargarPlantillaCuadrillas()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-download mr-2"></i> Plantilla
                        </button>
                        <button onclick="document.getElementById('input-carga-cuadrillas').click()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-upload mr-2"></i> Cargar
                        </button>
                        <button onclick="abrirModalCrearCuadrilla()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <i class="fas fa-plus mr-2"></i> Nuevo
                        </button>
                        <button onclick="limpiarFiltrosCuadrillas()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" title="Limpiar Filtros">
                            <i class="fas fa-filter-circle-xmark"></i>
                        </button>
                    </div>
                    <input type="file" id="input-carga-cuadrillas" accept=".xlsx, .xls" style="display: none;" onchange="procesarArchivoCuadrillas(this)">
                </div>

                <!-- Table Container -->
                <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm" id="tablaCuadrillas">
                            <thead>
                                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground w-[100px]" onclick="ordenarTablaCuadrillas('id')">
                                        ID <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaCuadrillas('nombre')">
                                        Nombre Cuadrilla <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaCuadrillas('supervisor')">
                                        Supervisor <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaCuadrillas('especialidad')">
                                        Especialidad <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaCuadrillas('miembros')">
                                        Miembros <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaCuadrillas('proyecto')">
                                        Proyecto Asignado <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaCuadrillas('estado')">
                                        Estado <i class="fas fa-sort ml-1 text-xs"></i>
                                    </th>
                                    <th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Acciones</th>
                                </tr>
                                <!-- Filter Row -->
                                <tr class="border-b bg-muted/30">
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar ID..." onkeyup="filtrarPorColumnaCuadrillas(0, this.value)"></td>
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Nombre..." onkeyup="filtrarPorColumnaCuadrillas(1, this.value)"></td>
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Supervisor..." onkeyup="filtrarPorColumnaCuadrillas(2, this.value)"></td>
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Esp..." onkeyup="filtrarPorColumnaCuadrillas(3, this.value)"></td>
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Miembros..." onkeyup="filtrarPorColumnaCuadrillas(4, this.value)"></td>
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Proyecto..." onkeyup="filtrarPorColumnaCuadrillas(5, this.value)"></td>
                                    <td class="p-2"><input type="text" class="cuadrillas-filter-input w-full px-2 py-1 text-xs border rounded" placeholder="Filtrar Estado..." onkeyup="filtrarPorColumnaCuadrillas(6, this.value)"></td>
                                    <td class="p-2"></td>
                                </tr>
                            </thead>
                            <tbody id="cuadrillas-tbody">
                                <!-- Rows will be injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between px-2">
                    <div class="text-sm text-muted-foreground">
                        Mostrando <span id="contador-cuadrillas">0</span> cuadrillas
                    </div>
                    <div class="flex items-center space-x-2" id="paginacion-cuadrillas">
                        <!-- Pagination buttons -->
                    </div>
                </div>
            </div>

            <!-- Modal Crear/Editar Cuadrilla -->
            <div id="modal-cuadrilla" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
                <div class="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex items-center justify-between p-6 border-b">
                        <h2 class="text-lg font-semibold" id="modal-cuadrilla-titulo">Nueva Cuadrilla</h2>
                        <button onclick="window.dashboard.closeModal('modal-cuadrilla')" class="text-muted-foreground hover:text-foreground">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="form-cuadrilla" class="space-y-4">
                            <input type="hidden" id="cuadrilla-id-hidden">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">ID Cuadrilla</label>
                                    <input type="text" id="cuadrilla-id" name="id" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Nombre Cuadrilla</label>
                                    <input type="text" id="cuadrilla-nombre" name="nombre" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Supervisor</label>
                                    <input type="text" id="cuadrilla-supervisor" name="supervisor" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Especialidad</label>
                                    <input type="text" id="cuadrilla-especialidad" name="especialidad" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Proyecto Asignado</label>
                                    <input type="text" id="cuadrilla-proyecto" name="proyecto" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Estado</label>
                                    <select id="cuadrilla-estado" name="estado" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="Activa">Activa</option>
                                        <option value="Inactiva">Inactiva</option>
                                        <option value="En Descanso">En Descanso</option>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Número de Miembros</label>
                                    <input type="number" id="cuadrilla-miembros" name="miembros" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="flex items-center justify-end gap-2 p-6 border-t bg-muted/50">
                        <button type="button" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" onclick="window.dashboard.closeModal('modal-cuadrilla')">
                            Cancelar
                        </button>
                        <button type="button" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" onclick="guardarCuadrilla()">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    getCuadrillaRow: function (cuadrilla) {
        let statusClass = 'bg-gray-100 text-gray-800';
        const estado = (cuadrilla.estado || '').toLowerCase();

        if (estado.includes('activa')) statusClass = 'bg-green-100 text-green-800';
        else if (estado.includes('inactiva')) statusClass = 'bg-red-100 text-red-800';
        else if (estado.includes('descanso')) statusClass = 'bg-yellow-100 text-yellow-800';

        return `
            <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td class="p-4 align-middle font-medium whitespace-nowrap">${cuadrilla.id || ''}</td>
                <td class="p-4 align-middle font-medium whitespace-nowrap">${cuadrilla.nombre || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${cuadrilla.supervisor || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap">${cuadrilla.especialidad || ''}</td>
                <td class="p-4 align-middle whitespace-nowrap text-center">${cuadrilla.miembros || 0}</td>
                <td class="p-4 align-middle whitespace-nowrap">${cuadrilla.proyecto || '-'}</td>
                <td class="p-4 align-middle whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        ${cuadrilla.estado || 'Desconocido'}
                    </span>
                </td>
                <td class="p-4 align-middle text-center whitespace-nowrap">
                    <div class="flex justify-center gap-1">
                        <button onclick="verCuadrilla('${cuadrilla.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Ver">
                            <i class="fas fa-eye text-blue-600"></i>
                        </button>
                        <button onclick="editarCuadrilla('${cuadrilla.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Editar">
                            <i class="fas fa-edit text-orange-600"></i>
                        </button>
                        <button onclick="eliminarCuadrilla('${cuadrilla.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" title="Eliminar">
                            <i class="fas fa-trash text-destructive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Gestión Operativa (Excel Viewer) Content
     */
    getMaterialesTableContent: function () {
        return `
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 class="text-2xl font-bold tracking-tight">Gestión de Materiales (Stock)</h2>
                    <button onclick="abrirModalCrearMaterial()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        <i class="fas fa-plus mr-2"></i> Nuevo Material
                    </button>
                </div>

                <div class="rounded-md border bg-card text-card-foreground shadow-sm">
                    <div class="p-6 space-y-4">
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div class="relative flex-1">
                                <i class="fas fa-search absolute left-2 top-2.5 text-muted-foreground"></i>
                                <input type="text" id="buscarMateriales" placeholder="Buscar materiales..." class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            </div>
                            <button onclick="limpiarFiltrosMateriales()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                <i class="fas fa-eraser mr-2"></i> Limpiar
                            </button>
                        </div>

                        <div class="rounded-md border overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-muted/50">
                                        <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('id')">
                                                ID <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('nombre')">
                                                Material <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('categoria')">
                                                Categoría <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('stock')">
                                                Stock <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('unidad')">
                                                Unidad <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('precio')">
                                                Precio <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onclick="ordenarTablaMateriales('proveedor')">
                                                Proveedor <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                                        </tr>
                                        <tr class="border-b bg-muted/20">
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('id', this.value)"></td>
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('nombre', this.value)"></td>
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('categoria', this.value)"></td>
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('stock', this.value)"></td>
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('unidad', this.value)"></td>
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('precio', this.value)"></td>
                                            <td class="p-2"><input type="text" class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs materiales-filter-input" placeholder="Filtrar..." onkeyup="filtrarPorColumnaMateriales('proveedor', this.value)"></td>
                                            <td class="p-2"></td>
                                        </tr>
                                    </thead>
                                    <tbody id="tabla-materiales-body">
                                        <!-- Rows generated by JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="flex items-center justify-between px-2">
                            <div class="text-sm text-muted-foreground">
                                Mostrando <span id="contador-materiales">0</span> materiales
                            </div>
                            <div class="flex items-center space-x-2" id="paginacion-materiales">
                                <!-- Pagination generated by JS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Crear/Editar Material -->
            <div id="modal-crear-material" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden">
                <div class="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
                    <div class="flex justify-between items-center border-b pb-4">
                        <h3 class="text-lg font-semibold" id="modal-material-titulo">Nuevo Material</h3>
                        <button onclick="document.getElementById('modal-crear-material').classList.add('hidden')" class="text-muted-foreground hover:text-foreground">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="form-crear-material" onsubmit="event.preventDefault(); guardarMaterial();" class="space-y-4">
                        <input type="hidden" id="material-id">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Nombre Material</label>
                                <input type="text" id="material-nombre" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Categoría</label>
                                <select id="material-categoria" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">Seleccionar...</option>
                                    <option value="EPP">EPP</option>
                                    <option value="HERRAMIENTAS">Herramientas</option>
                                    <option value="INSUMOS">Insumos</option>
                                    <option value="REPUESTOS">Repuestos</option>
                                    <option value="OTROS">Otros</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Stock</label>
                                <input type="number" id="material-stock" required min="0" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Unidad</label>
                                <select id="material-unidad" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="UND">Unidad (UND)</option>
                                    <option value="KG">Kilogramo (KG)</option>
                                    <option value="M">Metro (M)</option>
                                    <option value="L">Litro (L)</option>
                                    <option value="CAJA">Caja</option>
                                </select>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Precio Unitario</label>
                                <input type="number" id="material-precio" required min="0" step="0.01" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Proveedor</label>
                                <input type="text" id="material-proveedor" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            </div>
                        </div>
                        <div class="flex justify-end space-x-2 pt-4 border-t">
                            <button type="button" onclick="document.getElementById('modal-crear-material').classList.add('hidden')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Cancelar
                            </button>
                            <button type="submit" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    getMaterialRow: function (material) {
        let stockClass = "bg-green-100 text-green-800";
        if (material.stock < 10) stockClass = "bg-red-100 text-red-800";
        else if (material.stock < 50) stockClass = "bg-yellow-100 text-yellow-800";

        return `
            <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td class="p-4 align-middle font-medium">${material.id}</td>
                <td class="p-4 align-middle">${material.nombre}</td>
                <td class="p-4 align-middle">
                    <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        ${material.categoria}
                    </span>
                </td>
                <td class="p-4 align-middle">
                    <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${stockClass}">
                        ${material.stock}
                    </span>
                </td>
                <td class="p-4 align-middle">${material.unidad}</td>
                <td class="p-4 align-middle">S/ ${parseFloat(material.precio).toFixed(2)}</td>
                <td class="p-4 align-middle text-muted-foreground">${material.proveedor || '-'}</td>
                <td class="p-4 align-middle text-right">
                    <button onclick="editarMaterial('${material.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-blue-500">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarMaterial('${material.id}')" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    getDatosGeneralesContent: function () {
        return `
            <div class="w-full space-y-4 p-6">
                <!-- Header Actions -->
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div class="flex items-center gap-4 w-full sm:w-auto">
                        <div class="relative">
                            <input 
                                type="file" 
                                id="input-excel-operativa" 
                                accept=".xlsx, .xls" 
                                class="hidden" 
                                onchange="procesarArchivoExcel(this)"
                            >
                            <label 
                                for="input-excel-operativa" 
                                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                            >
                                <i class="fas fa-file-excel mr-2"></i> Seleccionar Archivo
                            </label>
                        </div>
                        <span id="nombre-archivo-operativa" class="text-sm text-muted-foreground italic">Ningún archivo seleccionado</span>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="limpiarDatosOperativos()" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <i class="fas fa-trash-alt mr-2"></i> Limpiar Vista
                        </button>
                    </div>
                </div>

                <!-- Info Banner -->
                <div id="info-operativa" class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-4 hidden" role="alert">
                    <span class="block sm:inline"><i class="fas fa-info-circle mr-2"></i> <span id="info-texto-operativa"></span></span>
                </div>

                <!-- Table Container -->
                <div class="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div class="overflow-x-auto max-h-[70vh]">
                        <table class="w-full text-sm" id="tablaOperativa">
                            <thead id="thead-operativa" class="bg-muted/50 sticky top-0 z-10">
                                <!-- Headers will be injected here -->
                            </thead>
                            <tbody id="tbody-operativa">
                                <tr>
                                    <td colspan="100%" class="text-center p-8 text-muted-foreground">
                                        <div class="flex flex-col items-center justify-center">
                                            <i class="fas fa-file-import text-4xl mb-4 opacity-20"></i>
                                            <p>Cargue un archivo Excel para visualizar los datos</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between px-2 mt-4 hidden" id="paginacion-container-operativa">
                    <div class="text-sm text-muted-foreground">
                        Mostrando <span id="contador-operativa">0</span> registros
                    </div>
                    <div class="flex items-center space-x-2" id="paginacion-operativa">
                        <!-- Pagination buttons -->
                    </div>
                </div>
            </div>
        `;
    }
};

// Expose to global scope

// Expose to global scope
window.UIComponents = UIComponents;

// Global Logout Function
window.logout = function () {
    console.log("Cerrando sesión...");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
};
