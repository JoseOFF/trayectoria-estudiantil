// ============================================
// VISTA DE GESTIÓN DE DOCENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const DocentesView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let docentes = [];
    let licenciaturas = [];
    let planteles = [];
    let areas = [];
    let filtros = {
        search: '',
        activo: '',
        area: '',
        id_plantel: ''
    };

    let paginacionDocentes = {
        currentPage: 1,
        limit: 35,  // Puedes ajustar este valor
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
                                <h2><i class="bi bi-person-badge me-2"></i>Gestión de Docentes</h2>
                                <p class="text-muted mb-0">Administra los docentes del sistema</p>
                            </div>
                            <button class="btn btn-primary" id="btn-nuevo-docente">
                                <i class="bi bi-plus-circle me-2"></i>Nuevo Docente
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
                                                value="${esc(filtros.search)}"
                                            >
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <select class="form-select" id="filter-activo">
                                            <option value="">Todos los estados</option>
                                            <option value="true" ${filtros.activo === 'true' ? 'selected' : ''}>Activos</option>
                                            <option value="false" ${filtros.activo === 'false' ? 'selected' : ''}>Inactivos</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <select class="form-select" id="filter-area">
                                            <option value="">Todas las áreas</option>
                                            <!-- Se llenarán dinámicamente -->
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-secondary w-100" id="btn-limpiar-filtros">
                                            <i class="bi bi-x-circle me-1"></i>Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de docentes -->
                        <div class="card">
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Correo</th>
                                                <th>Área</th>
                                                <th>Plantel</th>
                                                <th>Licenciaturas</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="docentes-tbody">
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
                                
                                <!-- Paginación -->
                                <div id="docentes-pagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal de Nuevo/Editar Docente -->
            <div class="modal fade" id="modalDocente" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalDocenteTitle">Nuevo Docente</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-docente">
                                <input type="hidden" id="docente-id">
                                
                                <div class="row g-3">
                                    <div class="col-md-12">
                                        <label for="docente-nombre" class="form-label">
                                            Nombre Completo <span class="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="docente-nombre" 
                                            required
                                        >
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label for="docente-correo" class="form-label">
                                            Correo Electrónico <span class="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="email" 
                                            class="form-control" 
                                            id="docente-correo" 
                                            required
                                        >
                                    </div>
                                    
                                    <div class="col-md-6" id="password-container">
                                        <label for="docente-password" class="form-label">
                                            Contraseña <span class="text-danger">*</span>
                                        </label>
                                        <input 
                                            type="password" 
                                            class="form-control" 
                                            id="docente-password" 
                                            minlength="6"
                                        >
                                        <small class="text-muted">Mínimo 6 caracteres</small>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label for="docente-area" class="form-label">
                                            Área Asignada
                                        </label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="docente-area"
                                            list="areas-list"
                                        >
                                        <datalist id="areas-list">
                                            <!-- Se llenarán dinámicamente -->
                                        </datalist>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label for="docente-plantel" class="form-label">
                                            Plantel
                                        </label>
                                        <select class="form-select" id="docente-plantel">
                                            <option value="">Seleccionar plantel...</option>
                                            <!-- Se llenarán dinámicamente -->
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-12">
                                        <label class="form-label">Licenciaturas Asignadas</label>
                                        <div id="licenciaturas-checkboxes" class="border rounded p-3">
                                            <!-- Se llenarán dinámicamente -->
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-12" id="activo-container" style="display: none;">
                                        <div class="form-check form-switch">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                id="docente-activo"
                                                checked
                                            >
                                            <label class="form-check-label" for="docente-activo">
                                                Docente Activo
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-guardar-docente">
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
        await cargarDatosIniciales();
        await cargarDocentes();
        
        // Inicializar event listeners
        initEventListeners();
    };
    
    /**
     * Cargar datos iniciales (licenciaturas, planteles, áreas)
     */
    const cargarDatosIniciales = async () => {
        try {
            // Cargar licenciaturas
            const licResponse = await API.get('/alumnos/licenciaturas');
            if (licResponse.success) {
                licenciaturas = licResponse.data;
            }
            
            // Cargar planteles
            const plantelesResponse = await API.get('/docentes/planteles');
            if (plantelesResponse.success) {
                planteles = plantelesResponse.data;
                cargarSelectPlanteles();
            }
            
            // Cargar áreas
            const areasResponse = await API.get('/docentes/areas');
            if (areasResponse.success) {
                areas = areasResponse.data;
                cargarSelectAreas();
            }
            
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
        }
    };
    
    /**
     * Cargar select de planteles
     */
    const cargarSelectPlanteles = () => {
        const selectPlantel = document.getElementById('docente-plantel');
        if (!selectPlantel) return;
        
        planteles.forEach(plantel => {
            const option = document.createElement('option');
            option.value = plantel.id_plantel;
            option.textContent = plantel.nombre_plantel;
            selectPlantel.appendChild(option);
        });
    };
    
    /**
     * Cargar select de áreas
     */
    const cargarSelectAreas = () => {
        const selectArea = document.getElementById('filter-area');
        const dataList = document.getElementById('areas-list');
        
        if (selectArea) {
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                selectArea.appendChild(option);
            });
        }
        
        if (dataList) {
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                dataList.appendChild(option);
            });
        }
    };
    
    /**
     * Cargar checkboxes de licenciaturas
     */
    const cargarLicenciaturasCheckboxes = (licenciaturasSeleccionadas = []) => {
        const container = document.getElementById('licenciaturas-checkboxes');
        if (!container) return;
        
        container.innerHTML = licenciaturas.map(lic => `
            <div class="form-check">
                <input 
                    class="form-check-input licenciatura-checkbox" 
                    type="checkbox" 
                    value="${lic.id_licenciatura}"
                    id="lic-${lic.id_licenciatura}"
                    ${licenciaturasSeleccionadas.includes(lic.id_licenciatura) ? 'checked' : ''}
                >
                <label class="form-check-label" for="lic-${lic.id_licenciatura}">
                    ${esc(lic.nombre_licenciatura)}
                </label>
            </div>
        `).join('');
    };
    
    /**
     * Cargar lista de docentes
     */
    const cargarDocentes = async (page = 1) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (filtros.search) queryParams.append('search', filtros.search);
            if (filtros.activo) queryParams.append('activo', filtros.activo);
            if (filtros.area) queryParams.append('area', filtros.area);
            if (filtros.id_plantel) queryParams.append('id_plantel', filtros.id_plantel);
            
            
            queryParams.append('limit', paginacionDocentes.limit);
            queryParams.append('offset', (page - 1) * paginacionDocentes.limit);

            const response = await API.get(`/docentes?${queryParams.toString()}`);
            
            if (response.success) {
                docentes = response.data.docentes;
                
                paginacionDocentes.total = response.data.total || response.total || docentes.length;
                paginacionDocentes.currentPage = page;
                paginacionDocentes.totalPages = Math.ceil(paginacionDocentes.total / paginacionDocentes.limit);

                renderDocentes();
                renderPaginacionDocentes();
            }
            
        } catch (error) {
            console.error('Error al cargar docentes:', error);
            Alert.error('Error al cargar la lista de docentes');
        }
    };
    

    /**
     * Renderizar tabla de docentes
     */
/**
 * Renderizar tabla de docentes
 * Reemplazar la función renderDocentes en Frontend/assets/js/views/DocentesView.js
 */
    const renderDocentes = () => {
        const tbody = document.getElementById('docentes-tbody');
        
        if (docentes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        No se encontraron docentes
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = docentes.map(docente => {
            // CONVERTIR EXPLÍCITAMENTE A BOOLEAN
            // MySQL devuelve 0/1, JavaScript puede interpretar como number o boolean
            const estaActivo = Boolean(docente.activo);
            
            return `
                <tr>
                    <td>
                        <strong>${esc(docente.nombre_completo)}</strong>
                    </td>
                    <td>${esc(docente.correo)}</td>
                    <td>${docente.area_asignada ? esc(docente.area_asignada) : '<span class="text-muted">Sin asignar</span>'}</td>
                    <td>${docente.nombre_plantel ? esc(docente.nombre_plantel) : '<span class="text-muted">Sin asignar</span>'}</td>
                    <td>
                        ${docente.licenciaturas_asignadas 
                            ? `<small>${esc(docente.licenciaturas_asignadas)}</small>` 
                            : '<span class="text-muted">Ninguna</span>'}
                    </td>
                    <td>
                        <span class="badge bg-${estaActivo ? 'success' : 'secondary'}">
                            ${estaActivo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button 
                                class="btn btn-outline-primary btn-editar-docente" 
                                data-id="${docente.id_docente}"
                                title="Editar"
                            >
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button 
                                class="btn btn-outline-${estaActivo ? 'warning' : 'success'} btn-toggle-docente" 
                                data-id="${docente.id_docente}"
                                data-activo="${estaActivo}"
                                title="${estaActivo ? 'Desactivar' : 'Activar'}"
                            >
                                <i class="bi bi-${estaActivo ? 'x-circle' : 'check-circle'}"></i>
                            </button>
                            <button 
                                class="btn btn-outline-danger btn-eliminar-docente" 
                                data-id="${docente.id_docente}"
                                title="Eliminar Permanentemente"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };




    /**
     * Renderizar controles de paginación para docentes
     */
    const renderPaginacionDocentes = () => {
        const container = document.getElementById('docentes-pagination');
        
        if (!container) {
            console.warn('Contenedor docentes-pagination no encontrado');
            return;
        }
        
        
        // Si no hay datos o solo una página, no mostrar paginación
        if (paginacionDocentes.total === 0 || paginacionDocentes.totalPages <= 1) {
            container.innerHTML = paginacionDocentes.total === 0 ? '' : 
                '<small class="text-muted">Mostrando todos los docentes</small>';
            return;
        }
        
        // Verificar que Pagination esté disponible
        if (typeof Pagination === 'undefined') {
            console.error('Pagination component not loaded!');
            return;
        }
        
        // Calcular información de paginación
        const paginationInfo = Pagination.calculatePagination(
            paginacionDocentes.total,
            paginacionDocentes.limit,
            paginacionDocentes.currentPage
        );
        
        // Renderizar información de registros
        const recordsInfo = Pagination.renderRecordsInfo(paginationInfo);
        
        // Renderizar controles de paginación
        const paginationHTML = Pagination.render({
            currentPage: paginacionDocentes.currentPage,
            totalPages: paginacionDocentes.totalPages,
            containerId: 'docentes-pagination'
        });
        
        // Insertar HTML
        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                <div>${recordsInfo}</div>
                <div>${paginationHTML}</div>
            </div>
        `;
        
        // Inicializar eventos de paginación
        Pagination.initEvents('docentes-pagination', (page) => {
            cargarDocentes(page);
        });
    };
    
    /**
     * Abrir modal para nuevo docente
     */
    const abrirModalNuevo = () => {
        document.getElementById('modalDocenteTitle').textContent = 'Nuevo Docente';
        document.getElementById('form-docente').reset();
        document.getElementById('docente-id').value = '';
        document.getElementById('password-container').style.display = 'block';
        document.getElementById('docente-password').required = true;
        document.getElementById('activo-container').style.display = 'none';
        
        cargarLicenciaturasCheckboxes();
        
        const modal = new bootstrap.Modal(document.getElementById('modalDocente'));
        modal.show();
    };
    
    /**
     * Abrir modal para editar docente
     */
    const abrirModalEditar = async (id_docente) => {
        try {
            const response = await API.get(`/docentes/${id_docente}`);
            
            if (response.success) {
                const docente = response.data;
                
                document.getElementById('modalDocenteTitle').textContent = 'Editar Docente';
                document.getElementById('docente-id').value = docente.id_docente;
                document.getElementById('docente-nombre').value = docente.nombre_completo;
                document.getElementById('docente-correo').value = docente.correo;
                document.getElementById('docente-area').value = docente.area_asignada || '';
                document.getElementById('docente-plantel').value = docente.id_plantel || '';
                document.getElementById('docente-activo').checked = docente.activo;
                
                document.getElementById('password-container').style.display = 'none';
                document.getElementById('docente-password').required = false;
                document.getElementById('activo-container').style.display = 'block';
                
                const licenciaturasIds = docente.licenciaturas.map(l => l.id_licenciatura);
                cargarLicenciaturasCheckboxes(licenciaturasIds);
                
                const modal = new bootstrap.Modal(document.getElementById('modalDocente'));
                modal.show();
            }
            
        } catch (error) {
            console.error('Error al cargar docente:', error);
            Alert.error('Error al cargar los datos del docente');
        }
    };
    
    /**
     * Guardar docente (crear o actualizar)
     */
    const guardarDocente = async () => {
        try {
            const id = document.getElementById('docente-id').value;
            const isEdit = !!id;
            
            // Obtener licenciaturas seleccionadas
            const licenciaturasSeleccionadas = Array.from(
                document.querySelectorAll('.licenciatura-checkbox:checked')
            ).map(cb => parseInt(cb.value));
            
            const data = {
                nombre_completo: document.getElementById('docente-nombre').value,
                correo: document.getElementById('docente-correo').value,
                area_asignada: document.getElementById('docente-area').value || null,
                id_plantel: document.getElementById('docente-plantel').value || null,
                licenciaturas: licenciaturasSeleccionadas
            };
            
            if (isEdit) {
                data.activo = document.getElementById('docente-activo').checked;
            } else {
                data.contrasena = document.getElementById('docente-password').value;
            }
            
            // Validaciones
            if (!data.nombre_completo || !data.correo) {
                Alert.warning('Por favor completa los campos requeridos');
                return;
            }
            
            if (!isEdit && (!data.contrasena || data.contrasena.length < 6)) {
                Alert.warning('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            let response;
            if (isEdit) {
                response = await API.put(`/docentes/${id}`, data);
            } else {
                response = await API.post('/docentes', data);
            }
            
            if (response.success) {
                Alert.success(response.message);
                bootstrap.Modal.getInstance(document.getElementById('modalDocente')).hide();
                await cargarDocentes(1);
            }
            
        } catch (error) {
            console.error('Error al guardar docente:', error);
            Alert.error(error.message || 'Error al guardar el docente');
        }
    };
    
    /**
     * Activar/Desactivar docente
     */
    const toggleDocente = async (id_docente, activo) => {
        try {
            // Determinar la acción basándose en el estado ACTUAL
            const accion = activo ? 'desactivar' : 'activar';
            const estadoNuevo = !activo;
            

            
            // Confirmar acción
            const confirmado = confirm(
                `¿Estás seguro de ${accion} este docente?\n\n${
                    estadoNuevo 
                        ? 'El docente podrá acceder al sistema' 
                        : 'El docente NO podrá acceder al sistema'
                }`
            );
            
            if (!confirmado) {
    ;
                return;
            }
            
            
            // Construir la URL y el body
            const url = `/docentes/${id_docente}/toggle`;
            const body = { activo: estadoNuevo };
            

            
            // Realizar petición al backend
            const response = await API.patch(url, body);
            

            
            if (response.success) {
                // Mostrar mensaje personalizado basado en la acción realizada
                const mensajePersonalizado = estadoNuevo 
                    ? ' Docente activado correctamente. Ahora puede acceder al sistema.' 
                    : ' Docente desactivado correctamente. Ya no puede acceder al sistema.';
                
                Alert.success(mensajePersonalizado);
                
                await cargarDocentes(1);
            } else {
                console.warn('Respuesta no exitosa:', response);
            }
            
            console.log('═══════════════════════════════════════');
            
        } catch (error) {
            console.error('ERROR en toggleDocente (frontend):');
            console.error('   - Mensaje:', error.message);
            console.error('   - Error completo:', error);
            console.error('   - Stack:', error.stack);
            
            Alert.error(error.message || 'Error al cambiar el estado del docente');
        }
    };

    
    
    /**
     * Eliminar docente
     */
    const eliminarDocente = async (id_docente) => {
        try {
            // Mostrar una advertencia más severa para eliminación permanente
            const confirmacion = confirm(
                'ADVERTENCIA: ELIMINACIÓN PERMANENTE\n\n' +
                '¿Estás ABSOLUTAMENTE SEGURO de que deseas eliminar este docente?\n\n' +
                'Esta acción:\n' +
                '• Eliminará el docente de forma PERMANENTE\n' +
                '• Eliminará su usuario asociado\n' +
                '• NO se puede deshacer\n\n' +
                'Si solo quieres desactivarlo temporalmente, usa el botón de Activar/Desactivar (ícono de círculo).\n\n' +
                'Escribe "CONFIRMAR" para continuar o presiona Cancelar.'
            );
            
            if (!confirmacion) {
                return;
            }
            
            // Segunda confirmación para mayor seguridad
            const confirmacionFinal = prompt(
                'Para confirmar la eliminación permanente, escribe la palabra: ELIMINAR'
            );
            
            if (confirmacionFinal !== 'ELIMINAR') {
                Alert.warning('Eliminación cancelada. Debes escribir exactamente "ELIMINAR" para confirmar.');
                return;
            }
            
            // Realizar la eliminación permanente
            const response = await API.delete(`/docentes/${id_docente}/permanent`);
            
            if (response.success) {
                Alert.success(response.message);
                await cargarDocentes(1);
            }
            
        } catch (error) {
            console.error('Error al eliminar docente permanentemente:', error);
            Alert.error(error.message || 'Error al eliminar el docente permanentemente');
        }
    };
    
    /**
     * Inicializar event listeners
     */
    const initEventListeners = () => {
        // Botón nuevo docente
        document.getElementById('btn-nuevo-docente')?.addEventListener('click', abrirModalNuevo);
        
        // Guardar docente
        document.getElementById('btn-guardar-docente')?.addEventListener('click', guardarDocente);
        
        // Filtros
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            filtros.search = e.target.value;
            cargarDocentes(1);
        });
        
        document.getElementById('filter-activo')?.addEventListener('change', (e) => {
            filtros.activo = e.target.value;
            cargarDocentes(1);
        });
        
        document.getElementById('filter-area')?.addEventListener('change', (e) => {
            filtros.area = e.target.value;
            cargarDocentes(1);
        });
        
        // Limpiar filtros
        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            filtros = { search: '', activo: '', area: '', id_plantel: '' };
            document.getElementById('search-input').value = '';
            document.getElementById('filter-activo').value = '';
            document.getElementById('filter-area').value = '';
            cargarDocentes(1);
        });
        
        // Botones de acción (usar delegación de eventos)
        document.getElementById('docentes-tbody')?.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const id = parseInt(target.dataset.id);
            
            if (target.classList.contains('btn-editar-docente')) {
                abrirModalEditar(id);
            } else if (target.classList.contains('btn-toggle-docente')) {
                const activo = target.dataset.activo === 'true';
                toggleDocente(id, activo);
            } else if (target.classList.contains('btn-eliminar-docente')) {
                eliminarDocente(id);
            }
        });
    };
    
    // Exponer métodos públicos
    return {
        render
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.DocentesView = DocentesView;