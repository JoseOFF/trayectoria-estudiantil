// ============================================
// VISTA DE SEGURIDAD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const SeguridadView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let roles = [];
    let permisos = [];
    let historial = [];
    let tablas = [];
    let filtrosAuditoria = {
        tabla: '',
        tipo_operacion: '',
        fecha_desde: '',
        fecha_hasta: ''
    };

    let paginacionAuditoria = {
        currentPage: 1,
        limit: 20,  // Registros por página
        total: 0,
        totalPages: 0
    };
    
    /**
     * Renderizar la vista
     */
    const render = async () => {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-container">
                ${Sidebar.render()}
                
                <div class="main-content">
                    ${Navbar.render()}
                    
                    <div class="content-area">
                        <!-- Header -->
                        <div class="mb-4">
                            <h2><i class="bi bi-shield-lock me-2"></i>Seguridad del Sistema</h2>
                            <p class="text-muted mb-0">Gestión de roles, permisos y auditoría</p>
                        </div>
                        
                        <!-- Tabs de navegación -->
                        <ul class="nav nav-tabs mb-4" id="seguridad-tabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button 
                                    class="nav-link active" 
                                    id="roles-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#roles-panel" 
                                    type="button"
                                >
                                    <i class="bi bi-person-badge me-2"></i>Roles y Permisos
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button 
                                    class="nav-link" 
                                    id="auditoria-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#auditoria-panel" 
                                    type="button"
                                >
                                    <i class="bi bi-clock-history me-2"></i>Auditoría
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button 
                                    class="nav-link" 
                                    id="estadisticas-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#estadisticas-panel" 
                                    type="button"
                                >
                                    <i class="bi bi-graph-up me-2"></i>Estadísticas
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button 
                                    class="nav-link" 
                                    id="respaldos-tab" 
                                    data-bs-toggle="tab" 
                                    data-bs-target="#respaldos-panel" 
                                    type="button"
                                >
                                    <i class="bi bi-database me-2"></i>Respaldos
                                </button>
                            </li>
                        </ul>
                        
                        <!-- Contenido de los tabs -->
                        <div class="tab-content" id="seguridad-tab-content">
                            <!-- Panel de Roles y Permisos -->
                            <div class="tab-pane fade show active" id="roles-panel" role="tabpanel">
                                ${renderRolesPanel()}
                            </div>
                            
                            <!-- Panel de Auditoría -->
                            <div class="tab-pane fade" id="auditoria-panel" role="tabpanel">
                                ${renderAuditoriaPanel()}
                            </div>
                            
                            <!-- Panel de Estadísticas -->
                            <div class="tab-pane fade" id="estadisticas-panel" role="tabpanel">
                                ${renderEstadisticasPanel()}
                            </div>

                            <!-- Panel de Respaldos -->
                            <div class="tab-pane fade" id="respaldos-panel" role="tabpanel">
                                ${renderRespaldosPanel()}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal de Gestión de Permisos -->
            <div class="modal fade" id="modalPermisos" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalPermisosTitle">Gestionar Permisos</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="rol-id">
                            <h6 id="rol-nombre-display" class="mb-3"></h6>
                            
                            <div class="row" id="permisos-grid">
                                <!-- Se llenarán dinámicamente -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal de Detalle de Cambio -->
            <div class="modal fade" id="modalDetalleCambio" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalle del Cambio</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="detalle-cambio-content">
                            <!-- Se llenará dinámicamente -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar componentes
        Navbar.initEvents();
        Sidebar.initEvents();
        
        // Cargar datos
        await cargarDatosIniciales();
        
        // Inicializar event listeners
        initEventListeners();
    };
    
    /**
     * Renderizar panel de roles
     */
    const renderRolesPanel = () => {
        return `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Roles del Sistema</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Rol</th>
                                            <th>Descripción</th>
                                            <th>Permisos</th>
                                            <th>Usuarios</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="roles-tbody">
                                        <tr>
                                            <td colspan="5" class="text-center">
                                                <div class="spinner-border text-primary" role="status">
                                                    <span class="visually-hidden">Cargando...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Renderizar panel de auditoría
     */
    const renderAuditoriaPanel = () => {
        return `
            <!-- Filtros -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Tabla</label>
                            <select class="form-select" id="filter-tabla">
                                <option value="">Todas las tablas</option>
                                <!-- Se llenarán dinámicamente -->
                            </select>
                        </div>
                        
                        <div class="col-md-3">
                            <label class="form-label">Operación</label>
                            <select class="form-select" id="filter-operacion">
                                <option value="">Todas las operaciones</option>
                                <option value="INSERT">INSERT</option>
                                <option value="UPDATE">UPDATE</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        
                        <div class="col-md-2">
                            <label class="form-label">Fecha Desde</label>
                            <input type="date" class="form-control" id="filter-fecha-desde">
                        </div>
                        
                        <div class="col-md-2">
                            <label class="form-label">Fecha Hasta</label>
                            <input type="date" class="form-control" id="filter-fecha-hasta">
                        </div>
                        
                        <div class="col-md-2 d-flex align-items-end">
                            <button class="btn btn-primary w-100" id="btn-buscar-auditoria">
                                <i class="bi bi-search me-2"></i>Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tabla de historial -->
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Historial de Cambios</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Tabla</th>
                                    <th>Operación</th>
                                    <th>Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="auditoria-tbody">
                                <tr>
                                    <td colspan="7" class="text-center">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="pagination-auditoria" class="mt-3"></div>
                </div>
                
            </div>
            
        `;
    };
    
    /**
     * Renderizar panel de estadísticas
     */
    const renderEstadisticasPanel = () => {
        return `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Cambios por Tipo de Operación</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chart-operaciones" height="200"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Top 10 Tablas Más Modificadas</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chart-tablas" height="200"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-12 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Actividad de los Últimos 7 Días</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chart-actividad" height="100"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Usuarios Más Activos</h6>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Correo</th>
                                            <th>Rol</th>
                                            <th>Total de Cambios</th>
                                        </tr>
                                    </thead>
                                    <tbody id="usuarios-activos-tbody">
                                        <!-- Se llenará dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const renderRespaldosPanel = () => {

        return `
        <!-- Panel de Respaldos -->
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">
                        <i class="bi bi-database me-2"></i>Gestión de Respaldos del Sistema
                    </h5>
                    
                    <!-- Información sobre respaldos automáticos -->
                    <div class="alert alert-info mb-4">
                        <h6 class="alert-heading">
                            <i class="bi bi-info-circle me-2"></i>Respaldos Automáticos Configurados
                        </h6>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <p class="mb-2">
                                    <strong><i class="bi bi-calendar-week me-2"></i>Respaldos Semanales:</strong>
                                    <br>
                                    <small class="text-muted">Cada domingo a las 2:00 AM (mantiene últimas 5 semanas)</small>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-2">
                                    <strong><i class="bi bi-calendar-month me-2"></i>Respaldos Mensuales:</strong>
                                    <br>
                                    <small class="text-muted">Día 1 de cada mes a las 3:00 AM (mantiene últimos 7 meses)</small>
                                </p>
                            </div>
                        </div>
                        <hr>
                        <p class="mb-0">
                            <i class="bi bi-shield-check me-2"></i>
                            <small>Los respaldos automáticos incluyen la base de datos completa y todos los archivos subidos. 
                            Recibirás notificaciones por correo electrónico cuando se completen.</small>
                        </p>
                    </div>
                    
                    <!-- Backup Manual -->
                    <div class="card border-primary">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0">
                                <i class="bi bi-hand-thumbs-up me-2"></i>Respaldo Manual
                            </h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-3">
                                Utiliza esta opción para crear un respaldo completo del sistema en cualquier momento.
                                <strong>Es recomendable crear un backup manual antes de:</strong>
                            </p>
                            
                            <ul class="mb-4">
                                <li>Importar alumnos masivamente</li>
                                <li>Realizar cambios importantes en configuración</li>
                                <li>Antes de actualizaciones del semestre</li>
                                <li>Cualquier operación que modifique datos importantes</li>
                            </ul>
                            
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                <small>
                                    El proceso de respaldo puede tardar unos minutos dependiendo de la cantidad de datos.
                                    Recibirás una notificación por correo cuando finalice.
                                </small>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button 
                                    class="btn btn-primary btn-lg" 
                                    id="btn-ejecutar-backup"
                                    data-accion="SeguridadView.ejecutarBackupManual"
                                >
                                    <i class="bi bi-database-add me-2"></i>
                                    Ejecutar Respaldo Ahora
                                </button>
                            </div>
                            
                            <div id="backup-status" class="mt-3" style="display: none;">
                                <!-- Aquí se mostrará el estado del backup -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información adicional -->
                    <div class="card mt-4 border-secondary">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="bi bi-info-circle me-2"></i>Información de Almacenamiento
                            </h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2">
                                <strong>Ubicación de respaldos:</strong> 
                                la carpeta que define el script de respaldo del servidor
                            </p>
                            <p class="mb-2">
                                <strong>Respaldos manuales:</strong> 
                                <small class="text-muted">Se mantienen por 90 días en la carpeta <code>manual/</code></small>
                            </p>
                            <p class="mb-0">
                                <strong>Contenido del respaldo:</strong>
                            </p>
                            <ul class="mb-0">
                                <li>Base de datos completa (estructura y datos)</li>
                                <li>Documentos y archivos subidos por usuarios</li>
                                <li>Verificación de integridad (checksums MD5)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Cargar datos iniciales
     */
    const cargarDatosIniciales = async () => {
        try {
            // Cargar roles
            const rolesResponse = await API.get('/seguridad/roles');
            if (rolesResponse.success) {
                roles = rolesResponse.data;
                renderRoles();
            }
            
            // Cargar permisos
            const permisosResponse = await API.get('/seguridad/permisos');
            if (permisosResponse.success) {
                permisos = permisosResponse.data;
            }
            
            // Cargar tablas disponibles
            const tablasResponse = await API.get('/seguridad/auditoria/tablas');
            if (tablasResponse.success) {
                tablas = tablasResponse.data;
                cargarSelectTablas();
            }
            
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            Alert.error('Error al cargar los datos');
        }
    };
    
    /**
     * Renderizar tabla de roles
     */
    const renderRoles = () => {
        const tbody = document.getElementById('roles-tbody');
        
        if (!tbody) return;
        
        tbody.innerHTML = roles.map(rol => `
            <tr>
                <td><strong>${esc(rol.nombre_rol)}</strong></td>
                <td>${rol.descripcion ? esc(rol.descripcion) : '<span class="text-muted">Sin descripción</span>'}</td>
                <td>
                    <span class="badge bg-primary">${rol.total_permisos} permiso${rol.total_permisos !== 1 ? 's' : ''}</span>
                </td>
                <td>
                    <span class="badge bg-info">${rol.total_usuarios} usuario${rol.total_usuarios !== 1 ? 's' : ''}</span>
                </td>
                <td>
                    <button 
                        class="btn btn-sm btn-outline-primary btn-gestionar-permisos"
                        data-id="${rol.id_rol}"
                        data-nombre="${esc(rol.nombre_rol)}"
                    >
                        <i class="bi bi-gear me-1"></i>Gestionar Permisos
                    </button>
                </td>
            </tr>
        `).join('');
    };
    
    /**
     * Abrir modal para gestionar permisos
     */
    const abrirModalPermisos = async (id_rol, nombre_rol) => {
        try {
            // Cargar permisos del rol
            const response = await API.get(`/seguridad/roles/${id_rol}`);
            
            if (response.success) {
                const rol = response.data;
                const permisosRol = rol.permisos.map(p => p.id_permiso);
                
                document.getElementById('rol-id').value = id_rol;
                document.getElementById('rol-nombre-display').textContent = `Rol: ${nombre_rol}`;
                
                const grid = document.getElementById('permisos-grid');
                grid.innerHTML = permisos.map(permiso => `
                    <div class="col-md-6 mb-3">
                        <div class="form-check form-switch">
                            <input 
                                class="form-check-input permiso-checkbox" 
                                type="checkbox" 
                                value="${permiso.id_permiso}"
                                id="permiso-${permiso.id_permiso}"
                                ${permisosRol.includes(permiso.id_permiso) ? 'checked' : ''}
                                data-id-rol="${id_rol}"
                            >
                            <label class="form-check-label" for="permiso-${permiso.id_permiso}">
                                <strong>${esc(permiso.nombre_permiso)}</strong>
                                <br>
                                <small class="text-muted">${esc(permiso.descripcion)}</small>
                            </label>
                        </div>
                    </div>
                `).join('');
                
                const modal = new bootstrap.Modal(document.getElementById('modalPermisos'));
                modal.show();
            }
            
        } catch (error) {
            console.error('Error al cargar permisos:', error);
            Alert.error('Error al cargar los permisos del rol');
        }
    };
    
    /**
     * Toggle permiso
     */
    const togglePermiso = async (id_rol, id_permiso, asignar) => {
        try {
            const endpoint = asignar ? '/seguridad/permisos/asignar' : '/seguridad/permisos/remover';
            
            const response = await API.post(endpoint, {
                id_rol: parseInt(id_rol),
                id_permiso: parseInt(id_permiso)
            });
            
            if (response.success) {
                Alert.success(response.message);
                // Recargar roles
                const rolesResponse = await API.get('/seguridad/roles');
                if (rolesResponse.success) {
                    roles = rolesResponse.data;
                    renderRoles();
                }
            }
            
        } catch (error) {
            console.error('Error al modificar permiso:', error);
            Alert.error('Error al modificar el permiso');
        }
    };
    
    /**
     * Cargar select de tablas
     */
    const cargarSelectTablas = () => {
        const select = document.getElementById('filter-tabla');
        if (!select) return;
        
        tablas.forEach(tabla => {
            const option = document.createElement('option');
            option.value = tabla;
            option.textContent = tabla;
            select.appendChild(option);
        });
    };
    
    /**
     * Cargar historial de auditoría
     */
    const cargarHistorialAuditoria = async (page = 1) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (filtrosAuditoria.tabla) queryParams.append('tabla', filtrosAuditoria.tabla);
            if (filtrosAuditoria.tipo_operacion) queryParams.append('tipo_operacion', filtrosAuditoria.tipo_operacion);
            if (filtrosAuditoria.fecha_desde) queryParams.append('fecha_desde', filtrosAuditoria.fecha_desde);
            if (filtrosAuditoria.fecha_hasta) queryParams.append('fecha_hasta', filtrosAuditoria.fecha_hasta);
            
            queryParams.append('limit', paginacionAuditoria.limit);
            queryParams.append('offset', (page - 1) * paginacionAuditoria.limit);
            
            const response = await API.get(`/seguridad/auditoria/historial?${queryParams.toString()}`);
            
            if (response.success) {
                historial = response.data.historial;

                paginacionAuditoria.total = response.data.total;
                paginacionAuditoria.currentPage = page;
                paginacionAuditoria.totalPages = Math.ceil(response.data.total / paginacionAuditoria.limit);
                
                renderHistorial();
                renderPaginacionAuditoria();
            }
            
        } catch (error) {
            console.error('Error al cargar historial:', error);
            Alert.error('Error al cargar el historial de auditoría');
        }
    };
    
    /**
     * Renderizar historial
     */
    const renderHistorial = () => {
        const tbody = document.getElementById('auditoria-tbody');
        
        if (!tbody) return;
        
        if (historial.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No se encontraron registros
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = historial.map(item => `
            <tr>
                <td><small>${formatearFecha(item.fecha_cambio)}</small></td>
                <td>${esc(item.nombre_usuario)}</td>
                <td><span class="badge bg-secondary">${esc(item.nombre_rol)}</span></td>
                <td><code>${esc(item.tabla_afectada)}</code></td>
                <td>
                    <span class="badge bg-${getColorOperacion(item.tipo_operacion)}">
                        ${esc(item.tipo_operacion)}
                    </span>
                </td>
                <td><code>#${item.id_registro_afectado}</code></td>
                <td>
                    <button 
                        class="btn btn-sm btn-outline-info btn-ver-detalle"
                        data-item='${esc(JSON.stringify(item))}'
                    >
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    };


    /**
     * Renderizar controles de paginación para auditoría
     */
    const renderPaginacionAuditoria = () => {
        const container = document.getElementById('pagination-auditoria');
        
        if (!container) return;
        
        // Si no hay datos, limpiar paginación
        if (paginacionAuditoria.total === 0) {
            container.innerHTML = '';
            return;
        }
        
        // Calcular información de paginación
        const paginationInfo = Pagination.calculatePagination(
            paginacionAuditoria.total,
            paginacionAuditoria.limit,
            paginacionAuditoria.currentPage
        );
        
        // Renderizar información de registros
        const recordsInfo = Pagination.renderRecordsInfo(paginationInfo);
        
        // Renderizar controles de paginación
        const paginationHTML = Pagination.render({
            currentPage: paginacionAuditoria.currentPage,
            totalPages: paginacionAuditoria.totalPages,
            containerId: 'pagination-auditoria'
        });
        
        // Insertar HTML
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                <div>${recordsInfo}</div>
                <div>${paginationHTML}</div>
            </div>
        `;
        
        // Inicializar eventos de paginación
        Pagination.initEvents('pagination-auditoria', (page) => {
            cargarHistorialAuditoria(page);
        });
    };
    
    /**
     * Ver detalle de cambio
     */
    const verDetalleCambio = (item) => {
        const content = document.getElementById('detalle-cambio-content');
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Información del Cambio</h6>
                    <table class="table table-sm">
                        <tr>
                            <th>Usuario:</th>
                            <td>${esc(item.nombre_usuario)} (${esc(item.nombre_rol)})</td>
                        </tr>
                        <tr>
                            <th>Tabla:</th>
                            <td><code>${esc(item.tabla_afectada)}</code></td>
                        </tr>
                        <tr>
                            <th>Operación:</th>
                            <td><span class="badge bg-${getColorOperacion(item.tipo_operacion)}">${esc(item.tipo_operacion)}</span></td>
                        </tr>
                        <tr>
                            <th>Registro:</th>
                            <td><code>#${item.id_registro_afectado}</code></td>
                        </tr>
                        <tr>
                            <th>Fecha:</th>
                            <td>${formatearFechaCompleta(item.fecha_cambio)}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="col-md-6">
                    <h6>Datos Anteriores</h6>
                    <pre class="bg-light p-3 rounded"><code>${esc(item.datos_anteriores || 'N/A')}</code></pre>
                    
                    <h6 class="mt-3">Datos Nuevos</h6>
                    <pre class="bg-light p-3 rounded"><code>${esc(item.datos_nuevos || 'N/A')}</code></pre>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('modalDetalleCambio'));
        modal.show();
    };
    
    /**
     * Cargar estadísticas
     */
    const cargarEstadisticas = async () => {
        try {
            const response = await API.get('/seguridad/auditoria/estadisticas');
            
            if (response.success) {
                renderEstadisticas(response.data);
            }
            
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    /**
     * Ejecutar backup manual del sistema
     */
    const ejecutarBackupManual = async () => {
        // Confirmar acción
        const confirmacion = await Swal.fire({
            title: '¿Ejecutar Respaldo Manual?',
            html: `
                <p>Se creará un respaldo completo del sistema incluyendo:</p>
                <ul class="text-start">
                    <li>Base de datos completa</li>
                    <li>Todos los documentos y archivos</li>
                </ul>
                <p class="text-muted">Este proceso puede tardar unos minutos.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-check-circle me-2"></i>Sí, Ejecutar Respaldo',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const response = await API.post('/seguridad/backup/ejecutar');
                    return response;
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${esc(error.message)}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
        
        if (confirmacion.isConfirmed) {
            const result = confirmacion.value;
            
            // Mostrar resultado
            await Swal.fire({
                title: '¡Respaldo Iniciado!',
                html: `
                    <div class="text-start">
                        <p><strong>Estado:</strong> En proceso</p>
                        <p><strong>Iniciado por:</strong> ${result.data?.iniciado_por || 'Sistema'}</p>
                        <p><strong>Fecha/Hora:</strong> ${Utils.formatDate(result.data?.fecha_hora, true)}</p>
                    </div>
                    <div class="alert alert-info mt-3">
                        <i class="bi bi-envelope me-2"></i>
                        Recibirás una notificación por correo electrónico cuando el respaldo finalice.
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Entendido'
            });
            
            // Mostrar estado en la página
            const statusDiv = document.getElementById('backup-status');
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.innerHTML = `
                    <div class="alert alert-success">
                        <div class="d-flex align-items-center">
                            <div class="spinner-border spinner-border-sm me-3" role="status">
                                <span class="visually-hidden">Procesando...</span>
                            </div>
                            <div>
                                <strong>Respaldo en proceso...</strong>
                                <br>
                                <small>Iniciado el ${Utils.formatDate(new Date(), true)}</small>
                            </div>
                        </div>
                    </div>
                `;
                
                // Ocultar el mensaje después de 1 minuto
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 60000);
            }
        }
    };
    
    /**
     * Renderizar estadísticas
     */
    const renderEstadisticas = (data) => {
        // Gráfico de operaciones
        const ctxOps = document.getElementById('chart-operaciones');
        if (ctxOps) {
            new Chart(ctxOps, {
                type: 'pie',
                data: {
                    labels: data.por_operacion.map(item => item.tipo_operacion),
                    datasets: [{
                        data: data.por_operacion.map(item => item.cantidad),
                        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
        
        // Gráfico de tablas
        const ctxTablas = document.getElementById('chart-tablas');
        if (ctxTablas) {
            new Chart(ctxTablas, {
                type: 'bar',
                data: {
                    labels: data.por_tabla.map(item => item.tabla_afectada),
                    datasets: [{
                        label: 'Cambios',
                        data: data.por_tabla.map(item => item.cantidad),
                        backgroundColor: 'rgba(102, 126, 234, 0.7)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
        
        // Gráfico de actividad
        const ctxActividad = document.getElementById('chart-actividad');
        if (ctxActividad && data.cambios_recientes) {
            new Chart(ctxActividad, {
                type: 'line',
                data: {
                    labels: data.cambios_recientes.map(item => item.fecha),
                    datasets: [{
                        label: 'Cambios por día',
                        data: data.cambios_recientes.map(item => item.cantidad),
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
        
        // Usuarios activos
        const tbody = document.getElementById('usuarios-activos-tbody');
        if (tbody) {
            tbody.innerHTML = data.usuarios_activos.map(user => `
                <tr>
                    <td>${esc(user.nombre_usuario)}</td>
                    <td>${esc(user.correo)}</td>
                    <td><span class="badge bg-secondary">${esc(user.nombre_rol)}</span></td>
                    <td><strong>${user.total_cambios}</strong></td>
                </tr>
            `).join('');
        }
    };
    
    /**
     * Helpers
     */
    const getColorOperacion = (operacion) => {
        const colores = {
            'INSERT': 'success',
            'UPDATE': 'warning',
            'DELETE': 'danger'
        };
        return colores[operacion] || 'secondary';
    };
    
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const formatearFechaCompleta = (fecha) => {
        return new Date(fecha).toLocaleString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    
    /**
     * Inicializar event listeners
     */
    const initEventListeners = () => {
        // Gestionar permisos
        document.getElementById('roles-tbody')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-gestionar-permisos');
            if (btn) {
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                abrirModalPermisos(id, nombre);
            }
        });
        
        // Toggle permisos
        document.getElementById('permisos-grid')?.addEventListener('change', (e) => {
            if (e.target.classList.contains('permiso-checkbox')) {
                const id_rol = e.target.dataset.idRol;
                const id_permiso = e.target.value;
                const asignar = e.target.checked;
                togglePermiso(id_rol, id_permiso, asignar);
            }
        });
        
        // Filtros de auditoría
        document.getElementById('btn-buscar-auditoria')?.addEventListener('click', () => {
            filtrosAuditoria.tabla = document.getElementById('filter-tabla').value;
            filtrosAuditoria.tipo_operacion = document.getElementById('filter-operacion').value;
            filtrosAuditoria.fecha_desde = document.getElementById('filter-fecha-desde').value;
            filtrosAuditoria.fecha_hasta = document.getElementById('filter-fecha-hasta').value;
            cargarHistorialAuditoria(1);
        });
        
        // Ver detalle de cambio
        document.getElementById('auditoria-tbody')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-ver-detalle');
            if (btn) {
                const item = JSON.parse(btn.dataset.item);
                verDetalleCambio(item);
            }
        });
        
        // Cargar historial al cambiar a tab de auditoría
        document.getElementById('auditoria-tab')?.addEventListener('shown.bs.tab', () => {
            cargarHistorialAuditoria();
        });
        
        // Cargar estadísticas al cambiar a tab de estadísticas
        document.getElementById('estadisticas-tab')?.addEventListener('shown.bs.tab', () => {
            cargarEstadisticas();
        });
    };
    
    // Exponer métodos públicos
    return {
        render,
        ejecutarBackupManual
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.SeguridadView = SeguridadView;