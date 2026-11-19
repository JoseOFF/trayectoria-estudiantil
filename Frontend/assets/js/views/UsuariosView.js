// ============================================
// VISTA DE GESTIÓN DE USUARIOS - MEJORADA
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const UsuariosView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let usuarios = [];
    let roles = [];
    let filtros = {
        search: '',
        rol: '',
        activo: ''
    };
    
    let paginacionUsuarios = {
        currentPage: 1,
        limit: 40,  // Puedes ajustar este valor
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
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2><i class="bi bi-people me-2"></i>Gestión de Usuarios</h2>
                                <p class="text-muted mb-0">Administra los usuarios del sistema</p>
                            </div>
                            <button class="btn btn-primary" id="btn-nuevo-usuario">
                                <i class="bi bi-plus-circle me-2"></i>Nuevo Usuario
                            </button>
                        </div>
                        
                        <!-- Filtros -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="bi bi-search"></i>
                                            </span>
                                            <input 
                                                type="text" 
                                                class="form-control" 
                                                id="search-input"
                                                placeholder="Buscar por nombre o correo..."
                                            >
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <select class="form-select" id="filter-rol">
                                            <option value="">Todos los roles</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <select class="form-select" id="filter-activo">
                                            <option value="">Todos los estados</option>
                                            <option value="true">Activos</option>
                                            <option value="false">Inactivos</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-secondary w-100" id="btn-limpiar-filtros">
                                            <i class="bi bi-x-circle me-2"></i>Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de usuarios -->
                        <div class="card">
                            <div class="card-body">
                                <div id="loading-table" class="text-center py-5 d-none">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                    <p class="mt-2 text-muted">Cargando usuarios...</p>
                                </div>
                                
                                <div id="usuarios-table"></div>

                                <div id="usuarios-pagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal mejorado para crear/editar usuario -->
            <div class="modal fade" id="modalUsuario" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalUsuarioTitle">Nuevo Usuario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-usuario">
                                <input type="hidden" id="usuario-id">
                                
                                <!-- CAMPOS BÁSICOS DEL USUARIO -->
                                <div class="border-bottom pb-3 mb-3">
                                    <h6 class="text-primary"><i class="bi bi-person-badge me-2"></i>Información de Cuenta</h6>
                                    
                                    <div class="mb-3">
                                        <label for="usuario-rol" class="form-label">Rol *</label>
                                        <select class="form-select" id="usuario-rol" required>
                                            <option value="">Selecciona un rol</option>
                                        </select>
                                        <small class="text-muted">Selecciona el rol para mostrar campos adicionales</small>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="usuario-correo" class="form-label">Correo Electrónico *</label>
                                        <input 
                                            type="email" 
                                            class="form-control" 
                                            id="usuario-correo"
                                            required
                                        >
                                    </div>
                                    
                                    <div class="mb-3" id="password-group">
                                        <label for="usuario-password" class="form-label">Contraseña *</label>
                                        <input 
                                            type="password" 
                                            class="form-control" 
                                            id="usuario-password"
                                            minlength="6"
                                        >
                                        <small class="text-muted">Mínimo 6 caracteres</small>
                                    </div>
                                    
                                    <div class="form-check">
                                        <input 
                                            class="form-check-input" 
                                            type="checkbox" 
                                            id="usuario-activo"
                                            checked
                                        >
                                        <label class="form-check-label" for="usuario-activo">
                                            Usuario activo
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- CAMPOS ADICIONALES SEGÚN EL ROL -->
                                <div id="campos-rol-especificos"></div>
                                
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-guardar-usuario">
                                <i class="bi bi-save me-2"></i>Guardar
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
        await cargarRoles();
        await cargarUsuarios();
        
        // Inicializar eventos
        initEvents();
    };
    
    /**
     * Cargar roles desde la API
     */
    const cargarRoles = async () => {
        try {
            const response = await API.get('/usuarios/roles');
            
            if (response.success) {
                roles = response.data;
                
                // Llenar select de filtros
                const filterRol = document.getElementById('filter-rol');
                roles.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id_rol;
                    option.textContent = rol.nombre_rol;
                    filterRol.appendChild(option);
                });
                
                // Llenar select del modal
                const usuarioRol = document.getElementById('usuario-rol');
                roles.forEach(rol => {
                    const option = document.createElement('option');
                    option.value = rol.id_rol;
                    option.textContent = rol.nombre_rol;
                    usuarioRol.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar roles:', error);
            Alert.error('Error al cargar los roles');
        }
    };
    
    /**
     * Cargar usuarios desde la API
     */
    const cargarUsuarios = async (page = 1) => {
        const loadingTable = document.getElementById('loading-table');
        const tableContainer = document.getElementById('usuarios-table');
        
        try {
            loadingTable.classList.remove('d-none');
            tableContainer.innerHTML = '';
            
            // Construir query params
            const params = new URLSearchParams();
            if (filtros.search) params.append('search', filtros.search);
            if (filtros.rol) params.append('rol', filtros.rol);
            if (filtros.activo) params.append('activo', filtros.activo);

            // Paginación
            params.append('limit', paginacionUsuarios.limit);
            params.append('offset', (page - 1) * paginacionUsuarios.limit);
            
            const response = await API.get(`/usuarios?${params.toString()}`);
            
            if (response.success) {
                usuarios = response.data.usuarios;
                
                paginacionUsuarios.total = response.data.total || response.total || usuarios.length;
                paginacionUsuarios.currentPage = page;
                paginacionUsuarios.totalPages = Math.ceil(paginacionUsuarios.total / paginacionUsuarios.limit);

                renderTabla(usuarios);
                renderPaginacionUsuarios();
            }
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            Alert.error('Error al cargar los usuarios');
            tableContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar usuarios. ${esc(error.message)}
                </div>
            `;
        } finally {
            loadingTable.classList.add('d-none');
        }
    };
    
    /**
     * Renderizar tabla de usuarios
     */
    const renderTabla = (data) => {
        const tableContainer = document.getElementById('usuarios-table');
        
        if (data.length === 0) {
            tableContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-2">No se encontraron usuarios</p>
                </div>
            `;
            return;
        }
        
        tableContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Fecha Registro</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(usuario => `
                            <tr>
                                <td>${usuario.id_usuario}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar bg-primary text-white rounded-circle me-2" 
                                             style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                            ${esc(usuario.nombre_usuario.charAt(0).toUpperCase())}
                                        </div>
                                        ${esc(usuario.nombre_usuario)}
                                    </div>
                                </td>
                                <td>${esc(usuario.correo)}</td>
                                <td>
                                    <span class="badge ${getRoleBadgeClass(usuario.nombre_rol)}">
                                        ${esc(usuario.nombre_rol)}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${usuario.activo ? 'bg-success' : 'bg-danger'}">
                                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>${new Date(usuario.fecha_registro).toLocaleDateString('es-MX')}</td>

                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-primary btn-edit" 
                                            data-id="${usuario.id_usuario}"
                                            title="Editar"
                                        >
                                            <i class="bi bi-pencil"></i>
                                        </button>

                                        <!-- NUEVO: Dropdown para gestión de contraseña -->
                                        <div class="btn-group btn-group-sm" role="group">
                                            <button type="button" class="btn btn-outline-warning dropdown-toggle" 
                                                    data-bs-toggle="dropdown" 
                                                    title="Gestión de Contraseña">
                                                <i class="bi bi-key"></i>
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li>
                                                    <a class="dropdown-item" href="#" 
                                                    data-accion="PasswordManager.mostrarModalReset" data-args="${Acciones.args(usuario.id_usuario, usuario.nombre_usuario, usuario.correo)}">
                                                        <i class="bi bi-arrow-clockwise me-2"></i>Resetear Contraseña
                                                    </a>
                                                </li>
                                                <li>
                                                    <a class="dropdown-item" href="#" 
                                                    data-accion="PasswordManager.mostrarModalCambiar" data-args="${Acciones.args(usuario.id_usuario, usuario.nombre_usuario, usuario.correo)}">
                                                        <i class="bi bi-shield-lock me-2"></i>Cambiar Contraseña
                                                    </a>
                                                </li>
                                                <li><hr class="dropdown-divider"></li>
                                                <li>
                                                    <a class="dropdown-item" href="#" 
                                                    data-accion="PasswordManager.verHistorial" data-args="${Acciones.args(usuario.id_usuario, usuario.nombre_usuario)}">
                                                        <i class="bi bi-clock-history me-2"></i>Ver Historial
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>

                                        <button 
                                            class="btn btn-outline-${usuario.activo ? 'warning' : 'success'} btn-toggle" 
                                            data-id="${usuario.id_usuario}"
                                            data-activo="${usuario.activo}"
                                            title="${usuario.activo ? 'Desactivar' : 'Activar'}"
                                        >
                                            <i class="bi bi-${usuario.activo ? 'x-circle' : 'check-circle'}"></i>
                                        </button>

                                        <button 
                                            class="btn btn-outline-danger btn-delete" 
                                            data-id="${usuario.id_usuario}"
                                            title="Eliminar"
                                        >
                                            <i class="bi bi-trash"></i>
                                        </button>

                                    </div>
                                </td>

                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Agregar eventos a los botones
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editarUsuario(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => toggleUsuario(btn.dataset.id, btn.dataset.activo === 'true'));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => eliminarUsuario(btn.dataset.id));
        });
    };


    /**
     * Renderizar controles de paginación para usuarios
     */
    const renderPaginacionUsuarios = () => {
        const container = document.getElementById('usuarios-pagination');
        
        if (!container) {
            console.warn('Contenedor usuarios-pagination no encontrado');
            return;
        }
                
        // Si no hay datos o solo una página, no mostrar paginación
        if (paginacionUsuarios.total === 0 || paginacionUsuarios.totalPages <= 1) {
            container.innerHTML = paginacionUsuarios.total === 0 ? '' : 
                '<small class="text-muted">Mostrando todos los usuarios</small>';
            return;
        }
        
        // Verificar que Pagination esté disponible
        if (typeof Pagination === 'undefined') {
            console.error('Pagination component not loaded!');
            return;
        }
        
        // Calcular información de paginación
        const paginationInfo = Pagination.calculatePagination(
            paginacionUsuarios.total,
            paginacionUsuarios.limit,
            paginacionUsuarios.currentPage
        );
        
        // Renderizar información de registros
        const recordsInfo = Pagination.renderRecordsInfo(paginationInfo);
        
        // Renderizar controles de paginación
        const paginationHTML = Pagination.render({
            currentPage: paginacionUsuarios.currentPage,
            totalPages: paginacionUsuarios.totalPages,
            containerId: 'usuarios-pagination'
        });
        
        // Insertar HTML
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                <div>${recordsInfo}</div>
                <div>${paginationHTML}</div>
            </div>
        `;
        
        // Inicializar eventos de paginación
        Pagination.initEvents('usuarios-pagination', (page) => {
            cargarUsuarios(page);
        });
    };
    
    /**
     * Obtener clase de badge según el rol
     */
    const getRoleBadgeClass = (rol) => {
        switch(rol) {
            case 'Administrador': return 'bg-danger';
            case 'Docente': return 'bg-primary';
            case 'Alumno': return 'bg-info';
            default: return 'bg-secondary';
        }
    };
    
    /**
     * Inicializar eventos
     */
    const initEvents = () => {
        // Botón nuevo usuario
        document.getElementById('btn-nuevo-usuario').addEventListener('click', abrirModalNuevo);
        
        // Búsqueda
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            filtros.search = e.target.value;
            debounce(() => cargarUsuarios(1), 500)();
        });
        
        // Filtro por rol
        document.getElementById('filter-rol').addEventListener('change', (e) => {
            filtros.rol = e.target.value;
            cargarUsuarios(1);
        });
        
        // Filtro por estado
        document.getElementById('filter-activo').addEventListener('change', (e) => {
            filtros.activo = e.target.value;
            cargarUsuarios(1);
        });
        
        // Limpiar filtros
        document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
            filtros = { search: '', rol: '', activo: '' };
            document.getElementById('search-input').value = '';
            document.getElementById('filter-rol').value = '';
            document.getElementById('filter-activo').value = '';
            cargarUsuarios(1);
        });
        
        // Guardar usuario
        document.getElementById('btn-guardar-usuario').addEventListener('click', guardarUsuario);
        
        //  NUEVO: Evento para cambiar campos según el rol
        document.getElementById('usuario-rol').addEventListener('change', (e) => {
            const rolId = parseInt(e.target.value);
            const rolNombre = e.target.options[e.target.selectedIndex].text;
            mostrarCamposRol(rolId, rolNombre);
        });
    };
    
    /**
     *  NUEVA FUNCIÓN: Mostrar campos adicionales según el rol
     */
    const mostrarCamposRol = async (rolId, rolNombre) => {
        const container = document.getElementById('campos-rol-especificos');
        
        // Limpiar campos anteriores
        container.innerHTML = '';
        
        if (!rolId) return;
        
        // ROL DOCENTE
        if (rolNombre === 'Docente') {
            container.innerHTML = `
                <div class="border-bottom pb-3 mb-3">
                    <h6 class="text-success"><i class="bi bi-person-workspace me-2"></i>Información del Docente</h6>
                    
                    <div class="mb-3">
                        <label for="docente-nombre" class="form-label">Nombre Completo *</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="docente-nombre"
                            required
                            placeholder="Nombre(s) Apellido Paterno Apellido Materno"
                        >
                    </div>
                    
                    <div class="mb-3">
                        <label for="docente-area" class="form-label">Área Asignada</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="docente-area"
                            placeholder="Ej: Matemáticas, Español, etc."
                        >
                    </div>
                    
                    <div class="mb-3">
                        <label for="docente-plantel" class="form-label">Plantel</label>
                        <select class="form-select" id="docente-plantel">
                            <option value="">Selecciona un plantel</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Licenciaturas Asignadas</label>
                        <div id="docente-licenciaturas" class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                            <div class="text-center text-muted py-2">
                                <small>Cargando...</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Cargar planteles
            await cargarPlanteles();
            
            // Cargar licenciaturas para checkboxes
            await cargarLicenciaturasCheckbox();
        }
        
        // ROL ALUMNO
        else if (rolNombre === 'Alumno') {
            container.innerHTML = `
                <div class="border-bottom pb-3 mb-3">
                    <h6 class="text-info"><i class="bi bi-mortarboard me-2"></i>Información del Alumno</h6>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="alumno-nombre" class="form-label">Nombre Completo *</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="alumno-nombre"
                                required
                                placeholder="Nombre(s) Apellido Paterno Apellido Materno"
                            >
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="alumno-curp" class="form-label">CURP *</label>
                            <input 
                                type="text" 
                                class="form-control text-uppercase" 
                                id="alumno-curp"
                                required
                                maxlength="18"
                                placeholder="AAAA001122HQTXXX01"
                            >
                            <small class="text-muted">18 caracteres</small>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="alumno-fecha-nacimiento" class="form-label">Fecha de Nacimiento *</label>
                            <input 
                                type="date" 
                                class="form-control" 
                                id="alumno-fecha-nacimiento"
                                required
                            >
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="alumno-licenciatura" class="form-label">Licenciatura *</label>
                            <select class="form-select" id="alumno-licenciatura" required>
                                <option value="">Selecciona una licenciatura</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label for="alumno-generacion" class="form-label">Generación *</label>
                            <input 
                                type="number" 
                                class="form-control" 
                                id="alumno-generacion"
                                required
                                min="2000"
                                max="2100"
                                placeholder="2024"
                            >
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="alumno-correo-personal" class="form-label">Correo Personal</label>
                        <input 
                            type="email" 
                            class="form-control" 
                            id="alumno-correo-personal"
                            placeholder="alumno@ejemplo.com"
                        >
                    </div>
                </div>
            `;
            
            // Cargar licenciaturas
            await cargarLicenciaturasSelect();
        }
        
        // ROL ADMINISTRADOR - Sin campos adicionales
        else if (rolNombre === 'Administrador') {
            container.innerHTML = `
                <div class="border-bottom pb-3 mb-3">
                    <h6 class="text-danger"><i class="bi bi-shield-check me-2"></i>Información del Administrador</h6>
                    
                    <div class="mb-3">
                        <label for="admin-nombre" class="form-label">Nombre Completo *</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="admin-nombre"
                            required
                            placeholder="Nombre(s) Apellido Paterno Apellido Materno"
                        >
                    </div>
                    
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Los administradores tienen acceso completo al sistema.
                    </div>
                </div>
            `;
        }

        else if (rolNombre === 'Invitado') {
        container.innerHTML = `
            <div class="border-bottom pb-3 mb-3">
                <h6 class="text-warning"><i class="bi bi-person-badge me-2"></i>Información del Usuario Invitado</h6>
                
                <div class="mb-3">
                    <label for="invitado-nombre" class="form-label">Nombre Completo *</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        id="invitado-nombre"
                        required
                        placeholder="Nombre(s) Apellido Paterno Apellido Materno"
                    >
                </div>
                
                <div class="alert alert-info mb-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Los usuarios invitados tienen acceso limitado a licenciaturas y secciones específicas.
                </div>
                
                <!-- Licenciaturas Permitidas -->
                <div class="mb-3">
                    <label class="form-label">
                        Licenciaturas Permitidas *
                        <small class="text-muted">(Selecciona al menos una)</small>
                    </label>
                    <div id="invitado-licenciaturas" class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
                        <div class="text-center text-muted py-2">
                            <small>Cargando licenciaturas...</small>
                        </div>
                    </div>
                </div>
                
                <!-- Secciones Permitidas -->
                <div class="mb-3">
                    <label class="form-label">
                        Secciones Permitidas
                        <small class="text-muted">(Sin selección = acceso a todas las secciones)</small>
                    </label>
                    <div id="invitado-secciones" class="border rounded p-3" style="max-height: 250px; overflow-y: auto;">
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="datos_personales" id="sec-datos-personales">
                            <label class="form-check-label" for="sec-datos-personales">
                                Datos Personales
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="datos_salud" id="sec-datos-salud">
                            <label class="form-check-label" for="sec-datos-salud">
                                Datos de Salud
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="datos_familiares" id="sec-datos-familiares">
                            <label class="form-check-label" for="sec-datos-familiares">
                                Datos Familiares
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="datos_socioeconomicos" id="sec-datos-socioeconomicos">
                            <label class="form-check-label" for="sec-datos-socioeconomicos">
                                Datos Socioeconómicos
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="datos_academicos" id="sec-datos-academicos">
                            <label class="form-check-label" for="sec-datos-academicos">
                                Datos Académicos
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="practicas_profesionales" id="sec-practicas">
                            <label class="form-check-label" for="sec-practicas">
                                Prácticas Profesionales
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="certificaciones" id="sec-certificaciones">
                            <label class="form-check-label" for="sec-certificaciones">
                                Certificaciones y Cursos
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="habilidades" id="sec-habilidades">
                            <label class="form-check-label" for="sec-habilidades">
                                Habilidades y Competencias
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="documentos" id="sec-documentos">
                            <label class="form-check-label" for="sec-documentos">
                                Documentos
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input seccion-checkbox" type="checkbox" value="incidentes" id="sec-incidentes">
                            <label class="form-check-label" for="sec-incidentes">
                                Incidentes
                            </label>
                        </div

                    </div>
                    <small class="text-muted d-block mt-2">
                        Si no seleccionas ninguna sección, el invitado tendrá acceso a todas las secciones de los alumnos de las licenciaturas permitidas.
                    </small>
                </div>
            </div>
        `;
        
        // Cargar licenciaturas para el invitado
        await cargarLicenciaturasInvitado();
    }

    };
    
    /**
     *  NUEVA FUNCIÓN: Cargar planteles
     */
    const cargarPlanteles = async () => {
        try {
            const response = await API.get('/docentes/planteles');
            
            if (response.success) {
                const select = document.getElementById('docente-plantel');
                response.data.forEach(plantel => {
                    const option = document.createElement('option');
                    option.value = plantel.id_plantel;
                    option.textContent = plantel.nombre_plantel;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar planteles:', error);
        }
    };
    
    /**
     *  Cargar licenciaturas 
     */
    const cargarLicenciaturasCheckbox = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            
            if (response.success) {
                const container = document.getElementById('docente-licenciaturas');
                container.innerHTML = '';
                
                response.data.forEach(lic => {
                    const div = document.createElement('div');
                    div.className = 'form-check';
                    div.innerHTML = `
                        <input 
                            class="form-check-input licenciatura-checkbox" 
                            type="checkbox" 
                            value="${lic.id_licenciatura}" 
                            id="lic-${lic.id_licenciatura}"
                        >
                        <label class="form-check-label" for="lic-${lic.id_licenciatura}">
                            ${esc(lic.nombre_licenciatura)}
                        </label>
                    `;
                    container.appendChild(div);
                });
            }
        } catch (error) {
            console.error('Error al cargar licenciaturas:', error);
        }
    };
    
    /**
     *  Cargar licenciaturas
     */
    const cargarLicenciaturasSelect = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            
            if (response.success) {
                const select = document.getElementById('alumno-licenciatura');
                response.data.forEach(lic => {
                    const option = document.createElement('option');
                    option.value = lic.id_licenciatura;
                    option.textContent = lic.nombre_licenciatura;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar licenciaturas:', error);
        }
    };

    /**
     * Cargar licenciaturas para usuario invitado
     */
    const cargarLicenciaturasInvitado = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            
            if (response.success) {
                const container = document.getElementById('invitado-licenciaturas');
                container.innerHTML = '';
                
                response.data.forEach(lic => {
                    const div = document.createElement('div');
                    div.className = 'form-check';
                    div.innerHTML = `
                        <input 
                            class="form-check-input licenciatura-invitado-checkbox" 
                            type="checkbox" 
                            value="${lic.id_licenciatura}" 
                            id="inv-lic-${lic.id_licenciatura}"
                        >
                        <label class="form-check-label" for="inv-lic-${lic.id_licenciatura}">
                            ${esc(lic.nombre_licenciatura)}
                        </label>
                    `;
                    container.appendChild(div);
                });
            }
        } catch (error) {
            console.error('Error al cargar licenciaturas para invitado:', error);
            const container = document.getElementById('invitado-licenciaturas');
            container.innerHTML = `
                <div class="alert alert-danger mb-0">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar licenciaturas
                </div>
            `;
        }
    };
    
    /**
     * Debounce para búsqueda
     */
    let debounceTimer;
    const debounce = (callback, time) => {
        return (...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => callback(...args), time);
        };
    };
    
    /**
     * Abrir modal para nuevo usuario
     */
    const abrirModalNuevo = () => {
        document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
        document.getElementById('password-group').style.display = 'block';
        document.getElementById('usuario-password').required = true;
        document.getElementById('usuario-activo').checked = true;
        
        // Limpiar campos adicionales
        document.getElementById('campos-rol-especificos').innerHTML = '';
        
        const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
        modal.show();
    };

    
    /**
     * Editar usuario
     */
/**
 * Editar usuario - VERSIÓN CORREGIDA
 */
const editarUsuario = async (id) => {
    try {
        State.setLoading(true);
        
        const response = await API.get(`/usuarios/${id}`);
        
        if (response.success) {
            const usuario = response.data;
            
            // Configurar título y campos básicos
            document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';
            document.getElementById('usuario-id').value = usuario.id_usuario;
            document.getElementById('usuario-correo').value = usuario.correo;
            document.getElementById('usuario-rol').value = usuario.id_rol;
            document.getElementById('usuario-activo').checked = usuario.activo;
            
            // Ocultar campo de contraseña al editar
            document.getElementById('password-group').style.display = 'none';
            document.getElementById('usuario-password').required = false;

            if (usuario.nombre_rol === 'Invitado') {
                try {
                    const permisosResponse = await API.get(`/invitados/${id}/permisos`);
                    
                    if (permisosResponse.success) {
                        // Agregar permisos a datosEspecificos
                        usuario.datosEspecificos = {
                            tipo: 'invitado',
                            nombre_completo: usuario.nombre_usuario,
                            licenciaturas_permitidas: permisosResponse.data.licenciaturas_permitidas,
                            secciones_permitidas: permisosResponse.data.secciones_permitidas
                        };
                    }
                } catch (error) {
                    console.error('Error al cargar permisos del invitado:', error);
                }
            }
            
            // ============================================
            // GENERAR CAMPOS ESPECÍFICOS DEL ROL
            // ============================================
            await mostrarCamposRol(usuario.id_rol, usuario.nombre_rol);
            
            // ============================================
            // ESPERAR A QUE LOS CAMPOS SE GENEREN EN EL DOM
            // ============================================
            setTimeout(() => {
                rellenarCamposEspecificos(usuario);
            }, 100); // Esperar 100ms a que el DOM se actualice
            
            // Abrir modal
            const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
            modal.show();
        }
        
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        Alert.error('Error al cargar los datos del usuario');
    } finally {
        State.setLoading(false);
    }
};

/**
 * Rellenar campos específicos del rol
 * 
 */
const rellenarCamposEspecificos = (usuario) => {
    if (!usuario.datosEspecificos) return;
    
    const datos = usuario.datosEspecificos;
    
    try {
        // ============================================
        // DOCENTE - Rellenar campos
        // ============================================
        if (datos.tipo === 'docente') {
            const nombreInput = document.getElementById('docente-nombre');
            const areaInput = document.getElementById('docente-area');
            const plantelSelect = document.getElementById('docente-plantel');
            
            if (nombreInput) nombreInput.value = datos.nombre_completo || '';
            if (areaInput) areaInput.value = datos.area_asignada || '';
            if (plantelSelect && datos.id_plantel) {
                plantelSelect.value = datos.id_plantel;
            }
            
            // Marcar licenciaturas asignadas
            if (datos.licenciaturas && datos.licenciaturas.length > 0) {
                datos.licenciaturas.forEach(id_lic => {
                    const checkbox = document.querySelector(`.licenciatura-checkbox[value="${id_lic}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        }
        
        // ============================================
        // ALUMNO - Rellenar campos
        // ============================================
        else if (datos.tipo === 'alumno') {
            const nombreInput = document.getElementById('alumno-nombre');
            const curpInput = document.getElementById('alumno-curp');
            const fechaInput = document.getElementById('alumno-fecha-nacimiento');
            const licenciaturaSelect = document.getElementById('alumno-licenciatura');
            const generacionInput = document.getElementById('alumno-generacion');
            const correoPersonalInput = document.getElementById('alumno-correo-personal');
            
            if (nombreInput) nombreInput.value = datos.nombre_completo || '';
            if (curpInput) curpInput.value = datos.curp || '';
            
            if (fechaInput && datos.fecha_nacimiento) {
                // Convertir fecha a formato YYYY-MM-DD para el input
                const fecha = new Date(datos.fecha_nacimiento);
                const fechaFormato = fecha.toISOString().split('T')[0];
                fechaInput.value = fechaFormato;
            }
            
            if (licenciaturaSelect && datos.id_licenciatura) {
                licenciaturaSelect.value = datos.id_licenciatura;
            }
            
            if (generacionInput) generacionInput.value = datos.generacion || '';
            if (correoPersonalInput) correoPersonalInput.value = datos.correo_personal || '';
        }
        
        // ============================================
        // ADMINISTRADOR - Rellenar campo
        // ============================================
        else if (datos.tipo === 'administrador') {
            const nombreInput = document.getElementById('admin-nombre');
            if (nombreInput) nombreInput.value = datos.nombre_completo || '';
        }

        else if (datos.tipo === 'invitado') {
            const nombreInput = document.getElementById('invitado-nombre');
            if (nombreInput) nombreInput.value = datos.nombre_completo || '';
            
            // Marcar licenciaturas permitidas
            if (datos.licenciaturas_permitidas && datos.licenciaturas_permitidas.length > 0) {
                datos.licenciaturas_permitidas.forEach(id_lic => {
                    const checkbox = document.querySelector(`.licenciatura-invitado-checkbox[value="${id_lic}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            
            // Marcar secciones permitidas (si hay alguna configurada)
            if (datos.secciones_permitidas && datos.secciones_permitidas.length > 0) {
                datos.secciones_permitidas.forEach(seccion => {
                    const checkbox = document.querySelector(`.seccion-checkbox[value="${seccion}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            // Si secciones_permitidas es null o vacío, no se marca nada (acceso a todo)
        }

        
    } catch (error) {
        console.error('Error al rellenar campos específicos:', error);
        // No mostrar error al usuario, solo loguear
    }
};
    
    /**
     *  MODIFICAR FUNCIÓN: Guardar usuario con datos adicionales
     */
    const guardarUsuario = async () => {
        const form = document.getElementById('form-usuario');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const id = document.getElementById('usuario-id').value;
        const rolId = parseInt(document.getElementById('usuario-rol').value);
        const rolNombre = document.getElementById('usuario-rol').options[document.getElementById('usuario-rol').selectedIndex].text;
        
        // Datos básicos del usuario
        const datos = {
            correo: document.getElementById('usuario-correo').value,
            id_rol: rolId,
            activo: document.getElementById('usuario-activo').checked
        };
        
        // Solo incluir contraseña si es nuevo usuario
        const password = document.getElementById('usuario-password').value;
        if (!id && password) {
            datos.contrasena = password;
        }
        
        //  AGREGAR DATOS SEGÚN EL ROL
        if (rolNombre === 'Docente') {
            const nombreDocente = document.getElementById('docente-nombre')?.value;
            if (!nombreDocente) {
                Alert.error('El nombre del docente es requerido');
                return;
            }
            
            datos.tipo_usuario = 'docente';
            datos.datos_adicionales = {
                nombre_completo: nombreDocente,
                area_asignada: document.getElementById('docente-area')?.value || null,
                id_plantel: parseInt(document.getElementById('docente-plantel')?.value) || null,
                licenciaturas: Array.from(document.querySelectorAll('.licenciatura-checkbox:checked'))
                    .map(cb => parseInt(cb.value))
            };
            datos.nombre_usuario = nombreDocente;
        } 
        else if (rolNombre === 'Alumno') {
            const nombreAlumno = document.getElementById('alumno-nombre')?.value;
            const curp = document.getElementById('alumno-curp')?.value;
            const fechaNac = document.getElementById('alumno-fecha-nacimiento')?.value;
            const licenciatura = document.getElementById('alumno-licenciatura')?.value;
            const generacion = document.getElementById('alumno-generacion')?.value;
            
            if (!nombreAlumno || !curp || !fechaNac || !licenciatura || !generacion) {
                Alert.error('Todos los campos del alumno son requeridos');
                return;
            }
            
            datos.tipo_usuario = 'alumno';
            datos.datos_adicionales = {
                nombre_completo: nombreAlumno,
                curp: curp.toUpperCase(),
                fecha_nacimiento: fechaNac,
                id_licenciatura: parseInt(licenciatura),
                generacion: parseInt(generacion),
                correo_personal: document.getElementById('alumno-correo-personal')?.value || null
            };
            datos.nombre_usuario = nombreAlumno;
        } 

        else if (rolNombre === 'Administrador') {
            const nombreAdmin = document.getElementById('admin-nombre')?.value;
            if (!nombreAdmin) {
                Alert.error('El nombre del administrador es requerido');
                return;
            }
            datos.nombre_usuario = nombreAdmin;
        }

        else if (rolNombre === 'Invitado') {
            const nombreInvitado = document.getElementById('invitado-nombre')?.value;
            
            if (!nombreInvitado) {
                Alert.error('El nombre del usuario invitado es requerido');
                return;
            }
            
            // Obtener licenciaturas seleccionadas
            const licenciaturasPermitidas = Array.from(
                document.querySelectorAll('.licenciatura-invitado-checkbox:checked')
            ).map(cb => parseInt(cb.value));
            
            if (licenciaturasPermitidas.length === 0) {
                Alert.error('Debes seleccionar al menos una licenciatura para el usuario invitado');
                return;
            }
            
            // Obtener secciones seleccionadas (puede estar vacío = acceso a todo)
            const seccionesSeleccionadas = Array.from(
                document.querySelectorAll('.seccion-checkbox:checked')
            ).map(cb => cb.value);
            
            datos.tipo_usuario = 'Invitado';
            datos.nombre_usuario = nombreInvitado;
            datos.licenciaturas_permitidas = licenciaturasPermitidas;
            
            // Solo enviar secciones si hay alguna seleccionada
            // Si está vacío, el backend interpretará como "acceso a todas las secciones"
            if (seccionesSeleccionadas.length > 0) {
                datos.secciones_permitidas = seccionesSeleccionadas;
            } else {
                datos.secciones_permitidas = null;
            }
        }

        
        try {
            State.setLoading(true);
            
            let response;
            if (id) {
                // Actualizar
                response = await API.put(`/usuarios/${id}`, datos);
            } else {
                // Crear
                response = await API.post('/usuarios', datos);
            }
            
            if (response.success) {
                Alert.success(response.message);
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalUsuario'));
                modal.hide();
                
                // Recargar tabla
                await cargarUsuarios(1);
            }
            
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            Alert.error(error.message || 'Error al guardar el usuario');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Activar/Desactivar usuario
     */
    const toggleUsuario = async (id, activo) => {
        try {
            // Asegurar que activo sea boolean
            const activoActual = Boolean(activo);
            
            // Determinar la acción y el nuevo estado
            const accion = activoActual ? 'desactivar' : 'activar';
            const estadoNuevo = !activoActual;
            
            // Confirmar acción
            const confirmed = confirm(
                `¿Estás seguro de ${accion} este usuario?\n\n${
                    estadoNuevo 
                        ? 'El usuario podrá acceder al sistema' 
                        : 'El usuario NO podrá acceder al sistema'
                }`
            );
            
            if (!confirmed) return;
            
            State.setLoading(true);
            
            const response = await API.patch(`/usuarios/${id}/toggle`, {
                activo: estadoNuevo
            });
            
            if (response.success) {
                // Mostrar mensaje personalizado
                const mensajePersonalizado = estadoNuevo 
                    ? ' Usuario activado correctamente. Ahora puede acceder al sistema.' 
                    : ' Usuario desactivado correctamente. Ya no puede acceder al sistema.';
                
                Alert.success(mensajePersonalizado);
                await cargarUsuarios(1);
            }
            
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Alert.error(error.message || 'Error al cambiar el estado del usuario');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Eliminar usuario
     */
    const eliminarUsuario = async (id) => {
        try {
            // Obtener información del usuario para mostrar advertencias específicas
            const usuario = usuarios.find(u => u.id_usuario === parseInt(id));
            
            if (!usuario) {
                Alert.error('Usuario no encontrado');
                return;
            }
            
            // Mensaje de advertencia según el rol
            let advertenciaEspecifica = '';
            if (usuario.nombre_rol === 'Alumno') {
                advertenciaEspecifica = '\nESTO ELIMINARÁ:\n' +
                                    '• Todo el expediente del alumno\n' +
                                    '• Documentos, calificaciones e incidentes\n' +
                                    '• Datos personales, familiares y de salud\n' +
                                    '• Historial académico completo';
            } else if (usuario.nombre_rol === 'Docente') {
                advertenciaEspecifica = '\nESTO ELIMINARÁ:\n' +
                                    '• El perfil del docente\n' +
                                    '• Licenciaturas asignadas\n' +
                                    '• Referencias en incidentes reportados';
            } else {
                advertenciaEspecifica = '\nESTO ELIMINARÁ:\n' +
                                    '• La cuenta de administrador\n' +
                                    '• Todos los permisos asociados';
            }
            
            // Primera confirmación con advertencia
            const confirmacion1 = confirm(
                `ELIMINACIÓN PERMANENTE DE USUARIO\n\n` +
                `Usuario: ${esc(usuario.nombre_usuario)}\n` +
                `Correo: ${esc(usuario.correo)}\n` +
                `Rol: ${esc(usuario.nombre_rol)}\n` +
                advertenciaEspecifica + '\n\n' +
                `- Esta acción NO SE PUEDE DESHACER\n\n` +
                `Si solo quieres desactivarlo temporalmente, usa el botón Activar/Desactivar.\n\n` +
                `¿Estás ABSOLUTAMENTE SEGURO de eliminar permanentemente este usuario?`
            );
            
            if (!confirmacion1) {
                return;
            }
            
            // Segunda confirmación requiriendo escribir texto
            const confirmacionFinal = prompt(
                `CONFIRMACIÓN FINAL\n\n` +
                `Para confirmar la eliminación permanente de:\n` +
                `${esc(usuario.nombre_usuario)} (${esc(usuario.correo)})\n\n` +
                `Escribe la palabra: ELIMINAR`
            );
            
            if (confirmacionFinal !== 'ELIMINAR') {
                Alert.warning('Eliminación cancelada. Debes escribir exactamente "ELIMINAR" para confirmar.');
                return;
            }
            
            // Realizar la eliminación permanente
            State.setLoading(true);
            
            const response = await API.delete(`/usuarios/${id}/permanent`);
            
            if (response.success) {
                Alert.success(response.message);
                await cargarUsuarios(1);
            }
            
        } catch (error) {
            console.error('Error al eliminar usuario permanentemente:', error);
            Alert.error(error.message || 'Error al eliminar el usuario permanentemente');
        } finally {
            State.setLoading(false);
        }
    };
    
    // Exponer métodos públicos
    return {
        render
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.UsuariosView = UsuariosView;