/**
 * Gestión de Trabajos - Tablero Kanban
 * OCA OperationSmart
 */

class GestionTrabajos {
    constructor() {
        this.trabajos = [];
        this.init();
    }

    /**
     * Inicializa la gestión de trabajos
     */
    init() {
        console.log('🚀 Inicializando Gestión de Trabajos...');
        this.cargarTrabajos();
    }

    /**
     * Carga los datos de trabajos desde el archivo JSON
     */
    async cargarTrabajos() {
        try {
            console.log('📂 Cargando datos de trabajos...');
            
            const response = await fetch(`${window.location.origin}/mock_data/trabajos.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.trabajos = await response.json();
            console.log('✅ Datos de trabajos cargados:', this.trabajos);
            
            this.renderizarTablero();
            
        } catch (error) {
            console.error('❌ Error al cargar trabajos:', error);
            this.mostrarError('Error al cargar los datos de trabajos');
        }
    }

    /**
     * Renderiza el tablero Kanban con los trabajos
     */
    renderizarTablero() {
        console.log('🎨 Renderizando tablero Kanban...');
        
        // Limpiar columnas existentes
        this.limpiarColumnas();
        
        // Iterar sobre los trabajos y crear tarjetas
        this.trabajos.forEach(trabajo => {
            this.crearTarjetaTrabajo(trabajo);
        });
        
        console.log('✅ Tablero Kanban renderizado');
    }

    /**
     * Limpia el contenido de todas las columnas
     */
    limpiarColumnas() {
        const columnas = [
            'columna-por-asignar',
            'columna-en-progreso', 
            'columna-finalizados'
        ];
        
        columnas.forEach(idColumna => {
            const columna = document.getElementById(idColumna);
            if (columna) {
                columna.innerHTML = DOMPurify.sanitize(DOMPurify).sanitize('';
            }
        });
    }

    /**
     * Crea una tarjeta de trabajo y la inserta en la columna correspondiente
     * @param {Object} trabajo - Objeto con los datos del trabajo
     */
    crearTarjetaTrabajo(trabajo) {
        console.log('📋 Creando tarjeta para trabajo:', trabajo);
        
        // Crear elemento de tarjeta
        const tarjeta = document.createElement('div');
        tarjeta.className = 'card kanban-card mb-2';
        tarjeta.setAttribute('data-trabajo-id', trabajo.id);
        
        // Contenido de la tarjeta
        tarjeta.innerHTML = DOMPurify.sanitize(DOMPurify).sanitize(`
            <div class="card-body p-3">
                <h6 class="card-title mb-2">${trabajo.titulo}</h6>
                <p class="card-text small text-muted mb-2">${trabajo.descripcion}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${trabajo.prioridad}</span>
                    <small class="text-muted">${trabajo.fecha}</small>
                </div>
            </div>
        `;
        
        // Determinar la columna destino basada en el estado
        const columnaDestino = this.obtenerColumnaPorEstado(trabajo.estado);
        
        if (columnaDestino) {
            columnaDestino.appendChild(tarjeta);
            console.log(`✅ Tarjeta insertada en columna: ${trabajo.estado}`);
        } else {
            console.warn(`⚠️ Estado no reconocido: ${trabajo.estado}`);
        }
    }

    /**
     * Obtiene la columna correspondiente según el estado del trabajo
     * @param {string} estado - Estado del trabajo
     * @returns {HTMLElement|null} Elemento de la columna o null si no se encuentra
     */
    obtenerColumnaPorEstado(estado) {
        const normalizar = (s) => (s || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
        const key = normalizar(estado);
        const mapeoEstados = {
            'por asignar': 'columna-por-asignar',
            'en progreso': 'columna-en-progreso',
            'finalizados': 'columna-finalizados'
        };
        const idColumna = mapeoEstados[key];
        return idColumna ? document.getElementById(idColumna) : null;
    }

    /**
     * Muestra un mensaje de error en el tablero
     * @param {string} mensaje - Mensaje de error a mostrar
     */
    mostrarError(mensaje) {
        const columnas = [
            'columna-por-asignar',
            'columna-en-progreso',
            'columna-finalizados'
        ];
        
        columnas.forEach(idColumna => {
            const columna = document.getElementById(idColumna);
            if (columna) {
                columna.innerHTML = DOMPurify.sanitize(DOMPurify).sanitize(`
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${mensaje}
                    </div>
                `;
            }
        });
    }
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM cargado, iniciando Gestión de Trabajos...');
    new GestionTrabajos();
});
