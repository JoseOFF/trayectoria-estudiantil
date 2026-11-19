// ============================================
// VISTA DE COMPLETITUD DE EXPEDIENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const CompletitudView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let completitudData = [];
    let estadisticas = null;
    let filtros = {
        search: '',
        licenciatura: '',
        generacion: '',
        semestre: '', 
        prioridad: '',
        nivel: ''
    };
    let paginacion = {
        currentPage: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    };
    
    /**
     * Renderizar la vista completa
     */
    const render = async () => {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-container">
                ${Sidebar.render()}
                
                <div class="main-content">
                    ${Navbar.render()}
                    
                    <div class="content-area">
                        <div class="container-fluid py-4">
                            <!-- Header -->
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2>
                                        <i class="bi bi-clipboard-check text-primary me-2"></i>
                                        Seguimiento de Completitud
                                    </h2>
                                    <p class="text-muted mb-0">
                                        Monitoreo exhaustivo del progreso de expedientes estudiantiles
                                    </p>
                                </div>
                                ${Auth.isAdmin() ? `
                                    <button class="btn btn-primary" id="btn-recalcular-todas">
                                        <i class="bi bi-arrow-clockwise me-2"></i>
                                        Recalcular Todo
                                    </button>
                                ` : ''}
                            </div>
                            
                            <!-- Estadísticas Generales -->
                            <div class="row mb-4" id="stats-cards">
                                <div class="col-12 text-center py-3">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando estadísticas...</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Filtros -->
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row g-3">
                                        <!-- Búsqueda -->
                                        <div class="col-md-4">
                                            <div class="input-group">
                                                <span class="input-group-text">
                                                    <i class="bi bi-search"></i>
                                                </span>
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    id="filter-search" 
                                                    placeholder="Buscar por nombre o matrícula..."
                                                >
                                            </div>
                                        </div>
                                        
                                        <!-- Licenciatura -->
                                        <div class="col-md-2">
                                            <select class="form-select" id="filter-licenciatura">
                                                <option value="">Todas las licenciaturas</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Generación -->
                                        <div class="col-md-2">
                                            <select class="form-select" id="filter-generacion">
                                                <option value="">Todas las generaciones</option>
                                            </select>
                                        </div>

                                        <!-- Semestre -->
                                        <div class="col-md-2">
                                            <select class="form-select" id="filter-semestre">
                                                <option value="">Todos los semestres</option>
                                                <option value="1">1° Semestre</option>
                                                <option value="2">2° Semestre</option>
                                                <option value="3">3° Semestre</option>
                                                <option value="4">4° Semestre</option>
                                                <option value="5">5° Semestre</option>
                                                <option value="6">6° Semestre</option>
                                                <option value="7">7° Semestre</option>
                                                <option value="8">8° Semestre</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Prioridad -->
                                        <div class="col-md-2">
                                            <select class="form-select" id="filter-prioridad">
                                                <option value="">Todas las prioridades</option>
                                                <option value="Urgente"> Urgente (< 60%)</option>
                                                <option value="Falta Poco"> Falta Poco (60-99%)</option>
                                                <option value="Completo"> Completo (100%)</option>
                                                <option value="Sin Iniciar"> Sin Iniciar (0%)</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Botones -->
                                        <div class="col-md-2">
                                            <button class="btn btn-outline-secondary w-100" id="btn-limpiar-filtros">
                                                <i class="bi bi-x-circle me-1"></i>Limpiar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Tabla de Completitud -->
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">
                                        <i class="bi bi-table me-2"></i>
                                        Reporte de Completitud
                                    </h5>
                                </div>
                                <div class="card-body">
                                    <div id="tabla-container">
                                        <div class="text-center py-4">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Cargando datos...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Paginación -->
                                <div class="card-footer">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-muted" id="pagination-info">
                                            Mostrando 0 de 0 alumnos
                                        </div>
                                        <nav>
                                            <ul class="pagination mb-0" id="pagination-controls">
                                                <!-- Se genera dinámicamente -->
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Cargar datos iniciales
        await Promise.all([
            cargarEstadisticas(),
            cargarLicenciaturas(),
            cargarGeneraciones(),
            cargarReporte()
        ]);
        
        // Inicializar eventos
        initEventListeners();
    };
    
    /**
     * Cargar estadísticas generales
     */
    const cargarEstadisticas = async () => {
        try {
            const response = await API.get('/completitud/estadisticas');
            
            if (response.success) {
                estadisticas = response.data;
                renderEstadisticas();
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            Alert.error('Error al cargar estadísticas');
        }
    };
    
    /**
     * Renderizar tarjetas de estadísticas
     */
    const renderEstadisticas = () => {
        if (!estadisticas) return;
        
        const container = document.getElementById('stats-cards');
        const { resumen } = estadisticas;
        
        const porcentajeCompletos = resumen.total_alumnos > 0 
            ? ((resumen.completos / resumen.total_alumnos) * 100).toFixed(1) 
            : 0;
        
        container.innerHTML = `
            <!-- Total Alumnos -->
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card border-primary">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Total Alumnos</h6>
                                <h3 class="mb-0">${resumen.total_alumnos || 0}</h3>
                            </div>
                            <div class="text-primary">
                                <i class="bi bi-people-fill" style="font-size: 2rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Promedio de Completitud -->
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card border-info">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Promedio General</h6>
                                <h3 class="mb-0">${resumen.promedio_completitud || 0}%</h3>
                            </div>
                            <div class="text-info">
                                <i class="bi bi-graph-up" style="font-size: 2rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Completos -->
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card border-success">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Completos</h6>
                                <h3 class="mb-0">${resumen.completos || 0}</h3>
                                <small class="text-success">${porcentajeCompletos}%</small>
                            </div>
                            <div class="text-success">
                                <i class="bi bi-check-circle-fill" style="font-size: 2rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Urgentes -->
            <div class="col-md-3 col-sm-6 mb-3">
                <div class="card border-danger">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1">Urgentes</h6>
                                <h3 class="mb-0">${resumen.urgentes || 0}</h3>
                                <small class="text-danger">Requieren atención</small>
                            </div>
                            <div class="text-danger">
                                <i class="bi bi-exclamation-triangle-fill" style="font-size: 2rem;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Cargar licenciaturas para filtro
     */
    const cargarLicenciaturas = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            if (response.success) {
                const select = document.getElementById('filter-licenciatura');
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
     * Cargar generaciones para filtro
     */
    const cargarGeneraciones = async () => {
        try {
            const response = await API.get('/alumnos/generaciones');
            if (response.success) {
                const select = document.getElementById('filter-generacion');
                response.data.forEach(gen => {
                    const option = document.createElement('option');
                    option.value = gen;
                    option.textContent = gen;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar generaciones:', error);
        }
    };
    
    /**
     * Cargar reporte de completitud
     */
    const cargarReporte = async () => {
        const container = document.getElementById('tabla-container');
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando datos...</span>
                </div>
            </div>
        `;
        
        try {
            const params = new URLSearchParams({
                limit: paginacion.limit,
                offset: (paginacion.currentPage - 1) * paginacion.limit,
                order_by: 'porcentaje_completitud',
                order_dir: 'asc'
            });
            
            if (filtros.search) params.append('search', filtros.search);
            if (filtros.licenciatura) params.append('licenciatura', filtros.licenciatura);
            if (filtros.generacion) params.append('generacion', filtros.generacion);
            if (filtros.semestre) params.append('semestre', filtros.semestre);
            if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
            
            const response = await API.get(`/completitud/reporte?${params}`);
            
            if (response.success) {
                completitudData = response.data.reporte;
                paginacion.total = response.data.total;
                paginacion.totalPages = Math.ceil(paginacion.total / paginacion.limit);
                
                renderTabla();
                renderPaginacion();
            }
        } catch (error) {
            console.error('Error al cargar reporte:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar los datos
                </div>
            `;
        }
    };
    
    /**
     * Renderizar tabla de completitud
     */
    const renderTabla = () => {
        const container = document.getElementById('tabla-container');
        
        if (completitudData.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    No se encontraron resultados
                </div>
            `;
            return;
        }
        
        const tabla = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Matrícula</th>
                            <th>Nombre</th>
                            <th>Licenciatura</th>
                            <th>Sem.</th>
                            <th>Gen.</th>
                            <th>Completitud</th>
                            <th>Nivel</th>
                            <th>Prioridad</th>
                            <th>Secciones Pendientes</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${completitudData.map(alumno => `
                            <tr>
                                <td><strong>${esc(alumno.matricula)}</strong></td>
                                <td>${esc(alumno.nombre_completo)}</td>
                                <td><small>${esc(alumno.nombre_licenciatura)}</small></td>
                                <td class="text-center">${esc(alumno.semestre_actual)}°</td>
                                <td class="text-center">${esc(alumno.generacion)}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="progress flex-grow-1 me-2" style="height: 20px;">
                                            <div 
                                                class="progress-bar ${getColorCompletitud(alumno.porcentaje_completitud)}" 
                                                style="width: ${alumno.porcentaje_completitud}%"
                                            >
                                                ${alumno.porcentaje_completitud}%
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge ${getBadgeNivel(alumno.nivel_completitud)}">
                                        ${esc(alumno.nivel_completitud)}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${getBadgePrioridad(alumno.prioridad)}">
                                        ${getPrioridadIcon(alumno.prioridad)} ${esc(alumno.prioridad)}
                                    </span>
                                </td>
                                <td class="text-center">
                                    ${alumno.secciones_pendientes > 0 
                                        ? `<span class="badge bg-warning">${alumno.secciones_pendientes}</span>`
                                        : '<i class="bi bi-check-lg text-success" title="Sin pendientes"></i>'}
                                </td>
                                <td>
                                    <button 
                                        class="btn btn-sm btn-outline-primary btn-ver-detalle" 
                                        data-id="${alumno.id_alumno}"
                                        title="Ver detalle"
                                    >
                                        <i class="bi bi-eye"></i>
                                    </button>
                                    <button 
                                        class="btn btn-sm btn-outline-secondary btn-recalcular" 
                                        data-id="${alumno.id_alumno}"
                                        title="Recalcular"
                                    >
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tabla;
        
        // Event listeners para botones de acción
        document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                mostrarDetalle(id);
            });
        });
        
        document.querySelectorAll('.btn-recalcular').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                await recalcularAlumno(id);
            });
        });
    };
    
    /**
     * Renderizar paginación
     */
    const renderPaginacion = () => {
        const info = document.getElementById('pagination-info');
        const controls = document.getElementById('pagination-controls');
        
        const start = (paginacion.currentPage - 1) * paginacion.limit + 1;
        const end = Math.min(paginacion.currentPage * paginacion.limit, paginacion.total);
        
        info.textContent = `Mostrando ${start}-${end} de ${paginacion.total} alumnos`;
        
        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <li class="page-item ${paginacion.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${paginacion.currentPage - 1}">Anterior</a>
            </li>
        `;
        
        // Números de página
        for (let i = 1; i <= paginacion.totalPages; i++) {
            if (
                i === 1 ||
                i === paginacion.totalPages ||
                (i >= paginacion.currentPage - 2 && i <= paginacion.currentPage + 2)
            ) {
                paginationHTML += `
                    <li class="page-item ${i === paginacion.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === paginacion.currentPage - 3 || i === paginacion.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        // Botón siguiente
        paginationHTML += `
            <li class="page-item ${paginacion.currentPage === paginacion.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${paginacion.currentPage + 1}">Siguiente</a>
            </li>
        `;
        
        controls.innerHTML = paginationHTML;
        
        // Event listeners
        controls.querySelectorAll('a.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== paginacion.currentPage) {
                    paginacion.currentPage = page;
                    cargarReporte();
                }
            });
        });
    };
    
    /**
     * Mostrar detalle de completitud de un alumno
     */
    const mostrarDetalle = (id_alumno) => {
        // Navegar al expediente del alumno
        Router.navigate(`/expediente/${id_alumno}`);
    };
    
    /**
     * Recalcular completitud de un alumno
     */
    const recalcularAlumno = async (id_alumno) => {
        try {
            Alert.info('Recalculando completitud...');
            
            const response = await API.post(`/completitud/calcular/${id_alumno}`);
            
            if (response.success) {
                Alert.success('Completitud recalculada exitosamente');
                await cargarReporte();
                await cargarEstadisticas();
            }
        } catch (error) {
            console.error('Error al recalcular:', error);
            Alert.error('Error al recalcular completitud');
        }
    };
    
    /**
     * Recalcular todas las completitudes (solo admin)
     */
    const recalcularTodas = async () => {
        const confirmado = await Alert.confirm(
            '¿Estás seguro?',
            'Esto recalculará la completitud de TODOS los alumnos. Puede tardar varios segundos.'
        );
        
        if (!confirmado) return;
        
        try {
            Alert.info('Recalculando todas las completitudes...');
            
            const response = await API.post('/completitud/recalcular-todas');
            
            if (response.success) {
                Alert.success('Todas las completitudes han sido recalculadas');
                await cargarReporte();
                await cargarEstadisticas();
            }
        } catch (error) {
            console.error('Error al recalcular todas:', error);
            Alert.error('Error al recalcular completitudes');
        }
    };
    
    /**
     * Inicializar event listeners
     */
    const initEventListeners = () => {
        // Filtros
        document.getElementById('filter-search')?.addEventListener('input', debounce((e) => {
            filtros.search = e.target.value;
            paginacion.currentPage = 1;
            cargarReporte();
        }, 500));
        
        document.getElementById('filter-licenciatura')?.addEventListener('change', (e) => {
            filtros.licenciatura = e.target.value;
            paginacion.currentPage = 1;
            cargarReporte();
        });
        
        document.getElementById('filter-generacion')?.addEventListener('change', (e) => {
            filtros.generacion = e.target.value;
            paginacion.currentPage = 1;
            cargarReporte();
        });

        document.getElementById('filter-semestre')?.addEventListener('change', (e) => {
            filtros.semestre = e.target.value;
            paginacion.currentPage = 1;
            cargarReporte();
        });
                
        document.getElementById('filter-prioridad')?.addEventListener('change', (e) => {
            filtros.prioridad = e.target.value;
            paginacion.currentPage = 1;
            cargarReporte();
        });
        
        // Limpiar filtros
        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            filtros = {
                search: '',
                licenciatura: '',
                generacion: '',
                semestre: '',
                prioridad: ''
            };
            document.getElementById('filter-search').value = '';
            document.getElementById('filter-licenciatura').value = '';
            document.getElementById('filter-generacion').value = '';
            document.getElementById('filter-semestre').value = '';
            document.getElementById('filter-prioridad').value = '';
            paginacion.currentPage = 1;
            cargarReporte();
        });
        
        // Recalcular todas (solo admin)
        document.getElementById('btn-recalcular-todas')?.addEventListener('click', recalcularTodas);
    };
    
    /**
     * Utilidades de colores y badges
     */
    const getColorCompletitud = (porcentaje) => {
        if (porcentaje >= 100) return 'bg-success';
        if (porcentaje >= 60) return 'bg-warning';
        if (porcentaje > 0) return 'bg-danger';
        return 'bg-secondary';
    };
    
    const getBadgeNivel = (nivel) => {
        const badges = {
            'Completo': 'bg-success',
            'Casi Completo': 'bg-warning',
            'En Progreso': 'bg-info',
            'Iniciado': 'bg-primary',
            'Vacío': 'bg-secondary'
        };
        return badges[nivel] || 'bg-secondary';
    };
    
    const getBadgePrioridad = (prioridad) => {
        const badges = {
            'Completo': 'bg-success',
            'Falta Poco': 'bg-warning',
            'Urgente': 'bg-danger',
            'Sin Iniciar': 'bg-secondary'
        };
        return badges[prioridad] || 'bg-secondary';
    };
    
    const getPrioridadIcon = (prioridad) => {
        const icons = {
            'Completo': '',
            'Falta Poco': '',
            'Urgente': '',
            'Sin Iniciar': ''
        };
        return icons[prioridad] || '';
    };
    
    /**
     * Debounce helper
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    /**
     * Exponer funciones públicas
     */
    return {
        render
    };
})();


// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================

window.CompletitudView = CompletitudView;