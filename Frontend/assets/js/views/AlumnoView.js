// ============================================
// VISTA DE GESTIÓN DE ALUMNOS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const AlumnoView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let alumnos = [];
    let licenciaturas = [];
    let generaciones = [];
    let filtros = {
        search: '',
        licenciatura: '',
        generacion: '',
        status: 'Activo',
        semestre: ''
    };

    let paginacionAlumnos = {
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
                                <h2><i class="bi bi-people-fill me-2"></i>Gestión de Alumnos</h2>
                                <p class="text-muted mb-0">Administra los expedientes estudiantiles</p>
                            </div>
                            <button class="btn btn-primary" id="btn-nuevo-alumno">
                                <i class="bi bi-plus-circle me-2"></i>Nuevo Alumno
                            </button>
                            <button class="btn btn-success" id="btn-acciones-masivas" style="display: none;">
                                <i class="bi bi-gear-fill me-2"></i>Acciones Masivas
                            </button>
                        </div>
                        
                        <!-- Estadísticas -->
                        <div class="row mb-4" id="stats-cards">
                            <div class="col-md-3">
                                <div class="card bg-primary text-white">
                                    <div class="card-body">
                                        <h6>Total Alumnos</h6>
                                        <h3 id="stat-total">0</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card bg-success text-white">
                                    <div class="card-body">
                                        <h6>Activos</h6>
                                        <h3 id="stat-activos">0</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card bg-info text-white">
                                    <div class="card-body">
                                        <h6>Egresados</h6>
                                        <h3 id="stat-egresados">0</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card bg-warning text-white">
                                    <div class="card-body">
                                        <h6>Baja</h6>
                                        <h3 id="stat-baja">0</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Filtros -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="bi bi-search"></i>
                                            </span>
                                            <input 
                                                type="text" 
                                                class="form-control" 
                                                id="search-input"
                                                placeholder="Buscar por nombre, matrícula o CURP..."
                                            >
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <select class="form-select" id="filter-licenciatura">
                                            <option value="">Todas las licenciaturas</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <select class="form-select" id="filter-generacion">
                                            <option value="">Todas las generaciones</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <select class="form-select" id="filter-status">
                                            <option value="">Todos los status</option>
                                            <option value="Activo" selected>Activos</option>
                                            <option value="Egresado">Egresados</option>
                                            <option value="Baja temporal">Baja temporal</option>
                                            <option value="Baja definitiva">Baja definitiva</option>
                                        </select>
                                    </div>
                                    <div class="col-md-1">
                                        <select class="form-select" id="filter-semestre">
                                            <option value="">Semestre</option>
                                            <option value="1">1°</option>
                                            <option value="2">2°</option>
                                            <option value="3">3°</option>
                                            <option value="4">4°</option>
                                            <option value="5">5°</option>
                                            <option value="6">6°</option>
                                            <option value="7">7°</option>
                                            <option value="8">8°</option>
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
                        
                        <!-- Tabla de alumnos -->
                        <div class="card">
                            <div class="card-body">
                                <div id="loading-table" class="text-center py-5 d-none">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                    <p class="mt-2 text-muted">Cargando alumnos...</p>
                                </div>
                                
                                <div id="alumnos-table"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para crear/editar alumno -->
            <div class="modal fade" id="modalAlumno" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalAlumnoTitle">Nuevo Alumno</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-alumno">
                                <input type="hidden" id="alumno-id">
                                
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

                                
                                <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="alumno-correo-institucional" class="form-label">
                                        Correo Institucional *
                                    </label>
                                    <input 
                                        type="email" 
                                        class="form-control" 
                                        id="alumno-correo-institucional"
                                        required
                                        placeholder="juan.perez@example.com"
                                    >
                                    <small class="text-muted"> 
                                        Será usado para iniciar sesión
                                    </small>
                                </div>


                                
                                
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label for="alumno-correo" class="form-label">Correo Personal</label>
                                        <input 
                                            type="email" 
                                            class="form-control" 
                                            id="alumno-correo"
                                            placeholder="alumno@ejemplo.com"
                                        >
                                    </div>
                                </div>
                                
                                <div id="campos-adicionales" class="d-none">
                                    <hr>
                                    <h6 class="mb-3">Información Adicional</h6>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="alumno-celular" class="form-label">Celular</label>
                                            <input 
                                                type="tel" 
                                                class="form-control" 
                                                id="alumno-celular"
                                                placeholder="5551234567"
                                            >
                                        </div>
                                        
                                        <div class="col-md-6 mb-3">
                                            <label for="alumno-telefono-emergencia" class="form-label">Teléfono de Emergencia</label>
                                            <input 
                                                type="tel" 
                                                class="form-control" 
                                                id="alumno-telefono-emergencia"
                                                placeholder="5559876543"
                                            >
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="alumno-estado-civil" class="form-label">Estado Civil</label>
                                            <select class="form-select" id="alumno-estado-civil">
                                                <option value="">Seleccionar</option>
                                                <option value="Soltero">Soltero(a)</option>
                                                <option value="Casado">Casado(a)</option>
                                                <option value="Unión libre">Unión libre</option>
                                                <option value="Divorciado">Divorciado(a)</option>
                                                <option value="Viudo">Viudo(a)</option>
                                            </select>
                                        </div>
                                        
                                        <div class="col-md-3 mb-3">
                                            <label for="alumno-semestre" class="form-label">Semestre</label>
                                            <input 
                                                type="number" 
                                                class="form-control" 
                                                id="alumno-semestre"
                                                min="1"
                                                max="8"
                                                placeholder="1"
                                            >
                                        </div>
                                        
                                        <div class="col-md-3 mb-3">
                                            <label for="alumno-status" class="form-label">Status</label>
                                            <select class="form-select" id="alumno-status">
                                                <option value="Activo">Activo</option>
                                                <option value="Egresado">Egresado</option>
                                                <option value="Baja temporal">Baja temporal</option>
                                                <option value="Baja definitiva">Baja definitiva</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-guardar-alumno">
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
        await cargarLicenciaturas();
        await cargarGeneraciones();
        await cargarEstadisticas();
        await cargarAlumnos();
        
        // Inicializar eventos
        initEvents();
    };
    
    /**
     * Cargar licenciaturas
     */
    const cargarLicenciaturas = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            
            if (response.success) {
                licenciaturas = response.data;
                
                // Llenar select de filtros
                const filterLic = document.getElementById('filter-licenciatura');
                licenciaturas.forEach(lic => {
                    const option = document.createElement('option');
                    option.value = lic.id_licenciatura;
                    option.textContent = lic.nombre_licenciatura;
                    filterLic.appendChild(option);
                });
                
                // Llenar select del modal
                const alumnoLic = document.getElementById('alumno-licenciatura');
                licenciaturas.forEach(lic => {
                    const option = document.createElement('option');
                    option.value = lic.id_licenciatura;
                    option.textContent = lic.nombre_licenciatura;
                    alumnoLic.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar licenciaturas:', error);
        }
    };
    
    /**
     * Cargar generaciones
     */
    const cargarGeneraciones = async () => {
        try {
            const response = await API.get('/alumnos/generaciones');
            
            if (response.success) {
                generaciones = response.data;
                
                const filterGen = document.getElementById('filter-generacion');
                generaciones.forEach(gen => {
                    const option = document.createElement('option');
                    option.value = gen;
                    option.textContent = gen;
                    filterGen.appendChild(option);
                });
                
                // Establecer año actual como valor por defecto en el modal
                document.getElementById('alumno-generacion').value = new Date().getFullYear();
            }
        } catch (error) {
            console.error('Error al cargar generaciones:', error);
        }
    };
    
    /**
     * Cargar estadísticas
     */
    const cargarEstadisticas = async () => {
        try {
            const response = await API.get('/alumnos/estadisticas');
            
            if (response.success) {
                const stats = response.data;
                
                document.getElementById('stat-total').textContent = stats.total;
                
                // Contar por status
                const activos = stats.por_status.find(s => s.status_alumno === 'Activo')?.cantidad || 0;
                const egresados = stats.por_status.find(s => s.status_alumno === 'Egresado')?.cantidad || 0;
                const bajas = stats.por_status.filter(s => s.status_alumno.includes('Baja')).reduce((sum, s) => sum + s.cantidad, 0);
                
                document.getElementById('stat-activos').textContent = activos;
                document.getElementById('stat-egresados').textContent = egresados;
                document.getElementById('stat-baja').textContent = bajas;
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };
    
    /**
     * Cargar alumnos
     */
    const cargarAlumnos = async (page = 1) => {
        const loadingTable = document.getElementById('loading-table');
        const tableContainer = document.getElementById('alumnos-table');
        
        try {
            loadingTable.classList.remove('d-none');
            tableContainer.innerHTML = '';
            
            // Construir query params
            const params = new URLSearchParams();
            if (filtros.search) params.append('search', filtros.search);
            if (filtros.licenciatura) params.append('licenciatura', filtros.licenciatura);
            if (filtros.generacion) params.append('generacion', filtros.generacion);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.semestre) params.append('semestre', filtros.semestre);

            params.append('limit', paginacionAlumnos.limit);
            params.append('offset', (page - 1) * paginacionAlumnos.limit);
            
            const response = await API.get(`/alumnos?${params.toString()}`);
            
            if (response.success) {
                alumnos = response.data.alumnos;

                paginacionAlumnos.total = response.data.total || response.total || alumnos.length;
                paginacionAlumnos.currentPage = page;
                paginacionAlumnos.totalPages = Math.ceil(paginacionAlumnos.total / paginacionAlumnos.limit);
                
                renderTabla(alumnos);
                renderPaginacionAlumnos();
            }
            
        } catch (error) {
            console.error('Error al cargar alumnos:', error);
            Alert.error('Error al cargar los alumnos');
            tableContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar alumnos. ${esc(error.message)}
                </div>
            `;
        } finally {
            loadingTable.classList.add('d-none');
        }
    };
    
    /**
     * Renderizar tabla de alumnos
     */
    const renderTabla = (data) => {
        const tableContainer = document.getElementById('alumnos-table');
        
        if (data.length === 0) {
            tableContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-2">No se encontraron alumnos</p>
                </div>
            `;
            const paginationContainer = document.getElementById('alumnos-pagination');
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        
        tableContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th width="50">
                                <input type="checkbox" class="form-check-input" id="select-all-alumnos">
                            </th>
                            <th>Matrícula</th>
                            <th>Nombre</th>
                            <th>CURP</th>
                            <th>Licenciatura</th>
                            <th>Generación</th>
                            <th>Semestre</th>
                            <th>Status</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(alumno => `
                            <tr>
                                <td>
                                    <input type="checkbox" class="form-check-input alumno-checkbox" 
                                        value="${alumno.id_alumno}">
                                </td>
                                <td><strong>${esc(alumno.matricula)}</strong></td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar bg-info text-white rounded-circle me-2" 
                                             style="width: 32px; height: 32px; display: flex; align-items-center; justify-content: center; font-size: 14px;">
                                            ${esc(alumno.nombre_completo.charAt(0).toUpperCase())}
                                        </div>
                                        ${esc(alumno.nombre_completo)}
                                    </div>
                                </td>
                                <td><small>${esc(alumno.curp)}</small></td>
                                <td><small>${esc(alumno.nombre_licenciatura)}</small></td>
                                <td>${esc(alumno.generacion)}</td>
                                <td>${esc(alumno.semestre_actual)}°</td>
                                <td>
                                    <span class="badge ${getStatusBadgeClass(alumno.status_alumno)}">
                                        ${esc(alumno.status_alumno)}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-info btn-ver" 
                                            data-id="${alumno.id_alumno}"
                                            title="Ver expediente"
                                        >
                                            <i class="bi bi-folder"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-success btn-docs" 
                                            data-id="${alumno.id_alumno}"
                                            title="Documentos"
                                        >
                                            <i class="bi bi-file-earmark-text"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-primary btn-edit" 
                                            data-id="${alumno.id_alumno}"
                                            title="Editar"
                                        >
                                        
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div id="alumnos-pagination"></div>
        `;
        
        
        document.getElementById('select-all-alumnos')?.addEventListener('change', (e) => {
            document.querySelectorAll('.alumno-checkbox').forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            actualizarBotonAccionesMasivas();
        });
        
        document.querySelectorAll('.alumno-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', actualizarBotonAccionesMasivas);
        });
        
        // Agregar eventos a los botones
        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', () => verExpediente(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editarAlumno(btn.dataset.id));
        });
        document.querySelectorAll('.btn-docs').forEach(btn => {
        btn.addEventListener('click', () => Router.navigate(`/documentos/${btn.dataset.id}`));
        });
    };



    /**
     * Renderizar controles de paginación para alumnos
     */
    const renderPaginacionAlumnos = () => {
        const container = document.getElementById('alumnos-pagination');
        
        if (!container) {
            console.warn('Contenedor alumnos-pagination no encontrado');
            return;
        }
                
        // Si no hay datos o solo una página, no mostrar paginación
        if (paginacionAlumnos.total === 0 || paginacionAlumnos.totalPages <= 1) {
            container.innerHTML = paginacionAlumnos.total === 0 ? '' : 
                '<small class="text-muted">Mostrando todos los alumnos</small>';
            return;
        }
        
        // Verificar que Pagination esté disponible
        if (typeof Pagination === 'undefined') {
            console.error('Pagination component not loaded!');
            return;
        }
        
        // Calcular información de paginación
        const paginationInfo = Pagination.calculatePagination(
            paginacionAlumnos.total,
            paginacionAlumnos.limit,
            paginacionAlumnos.currentPage
        );
        
        // Renderizar información de registros
        const recordsInfo = Pagination.renderRecordsInfo(paginationInfo);
        
        // Renderizar controles de paginación
        const paginationHTML = Pagination.render({
            currentPage: paginacionAlumnos.currentPage,
            totalPages: paginacionAlumnos.totalPages,
            containerId: 'alumnos-pagination'
        });
        
        // Insertar HTML
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                <div>${recordsInfo}</div>
                <div>${paginationHTML}</div>
            </div>
        `;
        
        // Inicializar eventos de paginación
        Pagination.initEvents('alumnos-pagination', (page) => {
            cargarAlumnos(page);
        });
    };



    
    /**
     * Obtener clase de badge según el status
     */
    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'Activo': return 'bg-success';
            case 'Egresado': return 'bg-info';
            case 'Baja temporal': return 'bg-warning';
            case 'Baja definitiva': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };
    
    /**
     * Inicializar eventos
     */
    const initEvents = () => {
        // Botón nuevo alumno
        document.getElementById('btn-nuevo-alumno').addEventListener('click', abrirModalNuevo);
        
        // Búsqueda
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            filtros.search = e.target.value;
            debounce(() => cargarAlumnos(), 500)();
        });
        
        // Filtros
        document.getElementById('filter-licenciatura').addEventListener('change', (e) => {
            filtros.licenciatura = e.target.value;
            cargarAlumnos(1);
            cargarEstadisticas();
        });
        
        document.getElementById('filter-generacion').addEventListener('change', (e) => {
            filtros.generacion = e.target.value;
            cargarAlumnos(1);
        });
        
        document.getElementById('filter-status').addEventListener('change', (e) => {
            filtros.status = e.target.value;
            cargarAlumnos(1);
        });
        
        document.getElementById('filter-semestre').addEventListener('change', (e) => {
            filtros.semestre = e.target.value;
            cargarAlumnos(1);
        });
        
        // Limpiar filtros
        document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
            filtros = { search: '', licenciatura: '', generacion: '', status: '', semestre: '' };
            document.getElementById('search-input').value = '';
            document.getElementById('filter-licenciatura').value = '';
            document.getElementById('filter-generacion').value = '';
            document.getElementById('filter-status').value = '';
            document.getElementById('filter-semestre').value = '';
            cargarAlumnos(1);
            cargarEstadisticas();
        });
        
        // Guardar alumno
        document.getElementById('btn-guardar-alumno').addEventListener('click', guardarAlumno);
        
        // Convertir CURP a mayúsculas automáticamente
        document.getElementById('alumno-curp').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        document.getElementById('btn-acciones-masivas')?.addEventListener('click', mostrarModalAccionesMasivas);
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
     * Abrir modal para nuevo alumno
     */
    const abrirModalNuevo = () => {
        document.getElementById('modalAlumnoTitle').textContent = 'Nuevo Alumno';
        document.getElementById('form-alumno').reset();
        document.getElementById('alumno-id').value = '';
        document.getElementById('alumno-generacion').value = new Date().getFullYear();
        document.getElementById('campos-adicionales').classList.add('d-none');
        document.getElementById('alumno-correo-institucional').required = true;

        const modal = new bootstrap.Modal(document.getElementById('modalAlumno'));
        modal.show();
    };
    
    /**
     * Editar alumno
     */
    const editarAlumno = async (id) => {
        try {
            State.setLoading(true);
            
            const response = await API.get(`/alumnos/${id}`);
            
            if (response.success) {
                const alumno = response.data;
                
                document.getElementById('modalAlumnoTitle').textContent = 'Editar Alumno';
                document.getElementById('alumno-id').value = alumno.id_alumno;
                document.getElementById('alumno-nombre').value = alumno.nombre_completo;
                document.getElementById('alumno-curp').value = alumno.curp;
                
                // FIX: Formatear fecha de nacimiento al formato YYYY-MM-DD
                if (alumno.fecha_nacimiento) {
                    // Convertir la fecha al formato correcto
                    const fecha = new Date(alumno.fecha_nacimiento);
                    const fechaFormateada = fecha.toISOString().split('T')[0];
                    document.getElementById('alumno-fecha-nacimiento').value = fechaFormateada;
                } else {
                    document.getElementById('alumno-fecha-nacimiento').value = '';
                }
                
                document.getElementById('alumno-licenciatura').value = alumno.id_licenciatura;
                document.getElementById('alumno-generacion').value = alumno.generacion;
                document.getElementById('alumno-correo').value = alumno.correo_personal || '';
                
                document.getElementById('alumno-correo-institucional').value = alumno.correo_institucional || '';
                document.getElementById('alumno-correo-institucional').required = false;
                document.getElementById('alumno-correo-institucional').readOnly  = true;

                // Campos adicionales
                document.getElementById('alumno-celular').value = alumno.celular || '';
                document.getElementById('alumno-telefono-emergencia').value = alumno.telefono_emergencia || '';
                document.getElementById('alumno-estado-civil').value = alumno.estado_civil || '';
                document.getElementById('alumno-semestre').value = alumno.semestre_actual || '';
                document.getElementById('alumno-status').value = alumno.status_alumno || 'Activo';
                
                // Mostrar campos adicionales al editar
                document.getElementById('campos-adicionales').classList.remove('d-none');
                
                const modal = new bootstrap.Modal(document.getElementById('modalAlumno'));
                modal.show();
            }
            
        } catch (error) {
            console.error('Error al cargar alumno:', error);
            Alert.error('Error al cargar los datos del alumno');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Guardar alumno (crear o actualizar)
     */
    const guardarAlumno = async () => {
        const form = document.getElementById('form-alumno');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const id = document.getElementById('alumno-id').value;
        const datos = {
            nombre_completo: document.getElementById('alumno-nombre').value,
            curp: document.getElementById('alumno-curp').value.toUpperCase(),
            fecha_nacimiento: document.getElementById('alumno-fecha-nacimiento').value,
            id_licenciatura: parseInt(document.getElementById('alumno-licenciatura').value),
            generacion: parseInt(document.getElementById('alumno-generacion').value),
            correo_personal: document.getElementById('alumno-correo').value || null
        };

        if (!id) {
            datos.correo_institucional = document.getElementById('alumno-correo-institucional').value;
        }
        
        // Si es edición, incluir campos adicionales
        if (id) {
            datos.celular = document.getElementById('alumno-celular').value || null;
            datos.telefono_emergencia = document.getElementById('alumno-telefono-emergencia').value || null;
            datos.estado_civil = document.getElementById('alumno-estado-civil').value || null;
            datos.semestre_actual = parseInt(document.getElementById('alumno-semestre').value) || null;
            datos.status_alumno = document.getElementById('alumno-status').value;
        }
        
        try {
            State.setLoading(true);
            
            let response;
            if (id) {
                // Actualizar
                response = await API.put(`/alumnos/${id}`, datos);
            } else {
                // Crear
                response = await API.post('/alumnos', datos);

                if (response.success && response.data?.contrasena_temporal) {
                    Alert.success(
                        `Alumno creado exitosamente.\n\n` +
                        `Correo: ${response.data.correo_institucional}\n` +
                        `Contraseña temporal: ${response.data.contrasena_temporal}\n\n` +
                        `Por favor, entregar estas credenciales al alumno.`,
                        5000
                    );
                }
            }
            
            if (response.success) {
                Alert.success(response.message);
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalAlumno'));
                modal.hide();
                
                // Recargar tabla y estadísticas
                await cargarAlumnos(1);
                await cargarEstadisticas();
            }
            
        } catch (error) {
            console.error('Error al guardar alumno:', error);
            Alert.error(error.message || 'Error al guardar el alumno');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Ver expediente completo
     */
    const verExpediente = (id) => {
        // TODO: Implementar vista de expediente completo
        Router.navigate(`/expediente/${id}`);
    };



    // ============================================
    // ACTUALIZAR BOTÓN DE ACCIONES MASIVAS
    // ============================================

    const actualizarBotonAccionesMasivas = () => {
        const checkboxes = document.querySelectorAll('.alumno-checkbox:checked');
        const btnAccionesMasivas = document.getElementById('btn-acciones-masivas');
        
        if (checkboxes.length > 0) {
            btnAccionesMasivas.style.display = 'block';
            btnAccionesMasivas.textContent = `Acciones Masivas (${checkboxes.length})`;
        } else {
            btnAccionesMasivas.style.display = 'none';
        }
    };

    // ============================================
    // OBTENER IDS SELECCIONADOS
    // ============================================

    const getIdsSeleccionados = () => {
        const checkboxes = document.querySelectorAll('.alumno-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.value));
    };

    // ============================================
    // MOSTRAR MODAL DE ACCIONES MASIVAS
    // ============================================

    const mostrarModalAccionesMasivas = () => {
        const idsSeleccionados = getIdsSeleccionados();
        
        if (idsSeleccionados.length === 0) {
            Alert.warning('Selecciona al menos un alumno');
            return;
        }
        
        const modalHtml = `
            <div class="modal fade" id="modalAccionesMasivas" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">Acciones Masivas</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>${idsSeleccionados.length} alumnos seleccionados</strong></p>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" data-accion="AlumnoView.promoverSemestreSeleccionados">
                                    <i class="bi bi-arrow-up-circle me-2"></i>
                                    Promover al Siguiente Semestre
                                </button>
                                
                                <hr>
                                
                                <button class="btn btn-info" data-accion="AlumnoView.cambiarStatusSeleccionados" data-args="${Acciones.args('Egresado')}">
                                    <i class="bi bi-mortarboard me-2"></i>
                                    Marcar como Egresados
                                </button>
                                
                                <button class="btn btn-warning" data-accion="AlumnoView.cambiarStatusSeleccionados" data-args="${Acciones.args('Baja temporal')}">
                                    <i class="bi bi-pause-circle me-2"></i>
                                    Marcar como Baja Temporal
                                </button>
                                
                                <button class="btn btn-danger" data-accion="AlumnoView.cambiarStatusSeleccionados" data-args="${Acciones.args('Baja definitiva')}">
                                    <i class="bi bi-x-circle me-2"></i>
                                    Marcar como Baja Definitiva
                                </button>
                                
                                <button class="btn btn-success" data-accion="AlumnoView.cambiarStatusSeleccionados" data-args="${Acciones.args('Activo')}">
                                    <i class="bi bi-check-circle me-2"></i>
                                    Marcar como Activo
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalAccionesMasivas');
        if (modalAnterior) modalAnterior.remove();
        
        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalAccionesMasivas'));
        modal.show();
    };

    // ============================================
    // PROMOVER SEMESTRE SELECCIONADOS
    // ============================================

    const promoverSemestreSeleccionados = async () => {
        const idsSeleccionados = getIdsSeleccionados();
        
        const confirmado = confirm(
            `¿Estás seguro de promover ${idsSeleccionados.length} alumnos al siguiente semestre?\n\n` +
            'Los alumnos que ya completaron todos los semestres serán marcados como Egresados.'
        );
        
        if (!confirmado) return;
        
        try {
            State.setLoading(true);
            
            const response = await API.post('/alumnos/promover-semestre', {
                ids_alumnos: idsSeleccionados
            });
            
            if (response.success) {
                Alert.success(response.message);
                
                // Cerrar modal
                bootstrap.Modal.getInstance(document.getElementById('modalAccionesMasivas')).hide();
                
                // Recargar alumnos
                await cargarAlumnos(1);
                await cargarEstadisticas();
            }
            
        } catch (error) {
            console.error('Error al promover:', error);
            Alert.error('Error al promover los alumnos');
        } finally {
            State.setLoading(false);
        }
    };

    // ============================================
    // CAMBIAR STATUS SELECCIONADOS
    // ============================================

    const cambiarStatusSeleccionados = async (nuevoStatus) => {
        const idsSeleccionados = getIdsSeleccionados();
        
        const confirmado = confirm(
            `¿Estás seguro de cambiar el status de ${idsSeleccionados.length} alumnos a "${nuevoStatus}"?`
        );
        
        if (!confirmado) return;
        
        try {
            State.setLoading(true);
            
            const response = await API.post('/alumnos/cambiar-status-masivo', {
                ids_alumnos: idsSeleccionados,
                nuevo_status: nuevoStatus
            });
            
            if (response.success) {
                Alert.success(response.message);
                
                // Cerrar modal
                bootstrap.Modal.getInstance(document.getElementById('modalAccionesMasivas')).hide();
                
                // Recargar alumnos
                await cargarAlumnos(1);
                await cargarEstadisticas();
            }
            
        } catch (error) {
            console.error('Error al cambiar status:', error);
            Alert.error('Error al cambiar el status');
        } finally {
            State.setLoading(false);
        }
    };


    
    // Exponer métodos públicos
    return {
        render,
        verExpediente,
        promoverSemestreSeleccionados,
        cambiarStatusSeleccionados
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.AlumnoView = AlumnoView;