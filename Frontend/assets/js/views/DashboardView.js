// ============================================
// VISTA DE DASHBOARD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const DashboardView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let chartInstances = {}; // Para mantener referencias a los gráficos
    
    /**
     * Renderizar la vista
     */
    const render = async () => {
        const app = document.getElementById('app');
        const user = Auth.getCurrentUser();
        
        app.innerHTML = `
            <div class="dashboard-container">
                ${Sidebar.render()}
                
                <div class="main-content">
                    ${Navbar.render()}
                    
                    <div class="content-area">
                        <!-- Header -->
                        <div class="mb-4">
                            <h2>¡Bienvenido, ${esc(user.nombre_usuario)}!</h2>
                            <p class="text-muted">
                                <i class="bi bi-calendar-event me-1"></i>
                                ${obtenerFechaActual()}
                            </p>
                        </div>
                        
                        <!-- Alertas -->
                        <div id="alertas-container" class="mb-4"></div>
                        
                        <!-- Tarjetas de estadísticas -->
                        <div class="row mb-4" id="stats-cards">
                            <!-- Se cargarán dinámicamente -->
                        </div>
                        
                        <!-- Accesos rápidos -->
                        <div class="mb-4" id="quick-actions">
                            <!-- Se cargarán dinámicamente -->
                        </div>
                        
                        <!-- Contenido principal según rol -->
                        <div class="row" id="contenido-principal">
                            ${Auth.isAdmin() || Auth.isDocente() ? 
                                renderContenidoAdminDocente() : 
                                Auth.isInvitado() ? 
                                    renderContenidoInvitado() : 
                                    renderContenidoAlumno()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Cargar datos dinámicamente
        await cargarDatos();
        
        // Inicializar event listeners
        initEventListeners();
    };
    
    /**
     * Renderizar contenido para Admin/Docente
     */
    const renderContenidoAdminDocente = () => {
        return `
            <!-- Columna izquierda: Gráficos -->
            <div class="col-lg-8">
                <!-- Gráfico de alumnos por semestre -->
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-bar-chart me-2"></i>
                            Distribución de Alumnos por Semestre
                        </h5>
                    </div>
                    <div class="card-body">
                        <canvas id="chart-semestres" height="80"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de rendimiento -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-pie-chart me-2"></i>
                            Rendimiento Académico General
                        </h5>
                    </div>
                    <div class="card-body">
                        <canvas id="chart-rendimiento" height="80"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Columna derecha: Actividad reciente -->
            <div class="col-lg-4">
                <!-- Actividad reciente -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-clock-history me-2"></i>
                            Actividad Reciente
                        </h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush" id="actividad-reciente">
                            <div class="text-center p-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Últimos alumnos registrados -->
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="bi bi-person-plus me-2"></i>
                            Últimos Registros
                        </h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush" id="ultimos-registros">
                            <div class="text-center p-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Renderizar contenido para Alumno
     */
const renderContenidoAlumno = () => {
    return `
        <!-- Contenedor del expediente del alumno -->
        <div class="col-12">
            <!-- Loading inicial -->
            <div id="loading-expediente-alumno" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando tu expediente...</span>
                </div>
                <p class="mt-2 text-muted">Cargando tu información...</p>
            </div>
            
            <!-- Contenedor del expediente -->
            <div id="expediente-alumno-content" class="d-none">
                <!-- Tarjetas de estadísticas -->
                <div id="stats-alumno"></div>
                
                <!-- Datos Personales y Académicos -->
                <div id="datos-personales-content" class="mb-4"></div>
                
                <!-- Calificaciones y Documentos -->
                <div class="row">
                    <div class="col-lg-6 mb-4">
                        <div id="calificaciones-content"></div>
                    </div>
                    <div class="col-lg-6 mb-4">
                        <div id="documentos-content"></div>
                    </div>
                </div>
                
                <!-- Acceso rápido -->
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="mb-3">
                            <i class="bi bi-lightning me-2"></i>Accesos Rápidos
                        </h5>
                        <div class="row">
                            <div class="col-md-3 col-6 mb-3">
                                <a href="#/portal-alumno" class="btn btn-outline-primary w-100">
                                    <i class="bi bi-person-circle d-block mb-2" style="font-size: 2rem;"></i>
                                    <small>Mi Portal</small>
                                </a>
                            </div>
                            <div class="col-md-3 col-6 mb-3">
                                <a href="#/portal-alumno" class="btn btn-outline-success w-100">
                                    <i class="bi bi-clipboard-data d-block mb-2" style="font-size: 2rem;"></i>
                                    <small>Calificaciones</small>
                                </a>
                            </div>
                            <div class="col-md-3 col-6 mb-3">
                                <a href="#/portal-alumno" class="btn btn-outline-info w-100">
                                    <i class="bi bi-cloud-upload d-block mb-2" style="font-size: 2rem;"></i>
                                    <small>Documentos</small>
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
                ${Footer.render({ showFullInfo: true })}
            </div>
        </div>
    `;
};


const renderContenidoInvitado = () => {
    return `
        <!-- Contenedor para información adicional de invitados -->
        <div class="col-12" id="contenido-invitado">
            <!-- El contenido se muestra en stats-cards y quick-actions -->
            <!-- Aquí podemos agregar contenido adicional si es necesario -->
        </div>
    `;
};



    /**
     * Cargar expediente del alumno autenticado
     */
const cargarExpedienteAlumno = async () => {
    try {
        // Obtener información del alumno
        const perfil = await API.get('/portal-alumno/mi-informacion');
        const alumno = perfil.data;
        
        // Ocultar loading
        document.getElementById('loading-expediente-alumno').classList.add('d-none');
        document.getElementById('expediente-alumno-content').classList.remove('d-none');
        
        // Renderizar todas las secciones
        await renderResumenExpediente(alumno);
        await renderDatosPersonalesAlumno(alumno);
        await renderCalificacionesAlumno(alumno.id_alumno);
        await renderDocumentosAlumno(alumno.id_alumno);
        
    } catch (error) {
        console.error('Error al cargar expediente:', error);
        document.getElementById('loading-expediente-alumno').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error al cargar tu información: ${esc(error.message)}
            </div>
        `;
    }
};



/**
 * Renderizar calificaciones
 */
const renderCalificacionesAlumno = async (idAlumno) => {
    try {
        const response = await API.get('/portal-alumno/calificaciones');
        const calificaciones = response.data.calificaciones || [];
        const promedioGeneral = parseFloat(response.data.promedio_general) || 0;
        
        let html = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-warning">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-clipboard-data me-2"></i>Mis Calificaciones
                        </h5>
                        <a href="#/portal-alumno" class="btn btn-sm btn-light">
                            <i class="bi bi-plus-circle me-1"></i>Agregar
                        </a>
                    </div>
                </div>
                <div class="card-body">
        `;
        
        if (calificaciones.length === 0) {
            html += `
                <div class="text-center py-4">
                    <i class="bi bi-clipboard-x fs-1 text-muted"></i>
                    <p class="text-muted mt-3">No hay calificaciones registradas</p>
                    <a href="#/portal-alumno" class="btn btn-warning">
                        Ir a Mi Portal
                    </a>
                </div>
            `;
        } else {
            html += `
                <!-- Promedio -->
                <div class="alert alert-warning mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <span><strong>Promedio General:</strong></span>
                        <h3 class="mb-0">${promedioGeneral.toFixed(2)}</h3>
                    </div>
                </div>
                
                <!-- Gráfica simple de barras -->
                <div class="mb-3">
                    <canvas id="chart-calificaciones-alumno" height="150"></canvas>
                </div>
                
                <!-- Tabla resumen -->
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead class="table-warning">
                            <tr>
                                <th>Semestre</th>
                                <th>Promedio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calificaciones.slice(0, 5).map(cal => {
                                const promedio = parseFloat(cal.promedio) || 0;
                                return `
                                <tr>
                                    <td><strong>${cal.numero_semestre}°</strong></td>
                                    <td>
                                        <span class="badge ${promedio >= 8 ? 'bg-success' : promedio >= 7 ? 'bg-info' : 'bg-danger'}">
                                            ${promedio.toFixed(2)}
                                        </span>
                                    </td>
                                    <td>
                                        ${promedio >= 6 ? '<span class="text-success"><i class="bi bi-check-circle"></i> Aprobado</span>' : '<span class="text-danger"><i class="bi bi-x-circle"></i> Reprobado</span>'}
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${calificaciones.length > 5 ? `
                <div class="text-center">
                    <a href="#/portal-alumno" class="btn btn-sm btn-outline-warning">
                        Ver Todas (${calificaciones.length})
                    </a>
                </div>
                ` : ''}
            `;
            
            // Crear gráfica
            setTimeout(() => {
                crearGraficaCalificaciones(calificaciones);
            }, 100);
        }
        
        html += `
                </div>
            </div>
        `;
        
        document.getElementById('calificaciones-content').innerHTML = html;
        
    } catch (error) {
        console.error('Error al cargar calificaciones:', error);
    }
};



/**
 * Crear gráfica de calificaciones
 */
const crearGraficaCalificaciones = (calificaciones) => {
    const ctx = document.getElementById('chart-calificaciones-alumno');
    if (!ctx) return;
    
    // Destruir gráfica anterior si existe
    if (chartInstances.calificacionesAlumno) {
        chartInstances.calificacionesAlumno.destroy();
    }
    
    // Ordenar por semestre
    const ordenadas = [...calificaciones].sort((a, b) => a.numero_semestre - b.numero_semestre);
    
    chartInstances.calificacionesAlumno = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ordenadas.map(c => `Sem ${c.numero_semestre}`),
            datasets: [{
                label: 'Promedio',
                data: ordenadas.map(c => parseFloat(c.promedio)),
                backgroundColor: ordenadas.map(c => {
                    const p = parseFloat(c.promedio);
                    return p >= 8 ? 'rgba(40, 167, 69, 0.8)' : p >= 7 ? 'rgba(255, 193, 7, 0.8)' : 'rgba(220, 53, 69, 0.8)';
                }),
                borderColor: ordenadas.map(c => {
                    const p = parseFloat(c.promedio);
                    return p >= 8 ? 'rgb(40, 167, 69)' : p >= 7 ? 'rgb(255, 193, 7)' : 'rgb(220, 53, 69)';
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};




/**
 * Renderizar documentos
 */
const renderDocumentosAlumno = async (idAlumno) => {
    try {
        const response = await API.get(`/documentos/alumno/${idAlumno}`);
        const documentos = response.data?.documentos || [];
        
        let html = `
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-info text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-file-earmark-text me-2"></i>Mis Documentos
                        </h5>
                        <a href="#/portal-alumno" class="btn btn-sm btn-light">
                            <i class="bi bi-cloud-upload me-1"></i>Subir
                        </a>
                    </div>
                </div>
                <div class="card-body">
        `;
        
        if (documentos.length === 0) {
            html += `
                <div class="text-center py-4">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-3">No hay documentos subidos</p>
                    <a href="#/portal-alumno" class="btn btn-info">
                        Subir Documentos
                    </a>
                </div>
            `;
        } else {
            // Agrupar por tipo
            const agrupados = documentos.reduce((acc, doc) => {
                const tipo = doc.tipo_documento || 'Otros';
                if (!acc[tipo]) acc[tipo] = 0;
                acc[tipo]++;
                return acc;
            }, {});
            
            html += `
                <div class="row mb-3">
                    ${Object.entries(agrupados).slice(0, 4).map(([tipo, cantidad]) => `
                        <div class="col-6 mb-2">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-folder2 text-info me-2"></i>
                                <div>
                                    <small class="text-muted">${esc(tipo)}</small>
                                    <br>
                                    <strong>${cantidad}</strong>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="alert alert-info mb-3">
                    <strong>Total:</strong> ${documentos.length} documento(s) subido(s)
                </div>
                
                <div class="text-center">
                    <a href="#/portal-alumno" class="btn btn-outline-info">
                        Ver Todos los Documentos
                    </a>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        document.getElementById('documentos-content').innerHTML = html;
        
    } catch (error) {
        console.error('Error al cargar documentos:', error);
    }
};

/**
 * Renderizar datos personales y académicos
 */
const renderDatosPersonalesAlumno = async (alumno) => {
    try {
        // Obtener datos de salud
        let datosSalud = null;
        try {
            const responseSalud = await API.get('/portal-alumno/datos-salud');
            datosSalud = responseSalud.data;
        } catch (e) {
            console.log('No hay datos de salud');
        }
        
        const html = `
            <div class="row">
                <!-- Información Personal -->
                <div class="col-lg-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">
                                <i class="bi bi-person-circle me-2"></i>Información Personal
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted">CURP</small>
                                    <p class="fw-bold mb-0">${esc(alumno.curp)}</p>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Fecha de Nacimiento</small>
                                    <p class="fw-bold mb-0">${new Date(alumno.fecha_nacimiento).toLocaleDateString('es-MX')}</p>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted">Teléfono</small>
                                    <p class="fw-bold mb-0">${esc(alumno.celular || 'No registrado')}</p>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Correo Personal</small>
                                    <p class="fw-bold mb-0 text-truncate">${esc(alumno.correo_personal || 'No registrado')}</p>
                                </div>
                            </div>
                            
                            ${datosSalud ? `
                            <hr>
                            <h6 class="text-muted mb-3">Datos de Salud</h6>
                            <div class="row mb-2">
                                <div class="col-6">
                                    <small class="text-muted">Tipo de Sangre</small>
                                    <p class="fw-bold mb-0">${esc(datosSalud.tipo_sangre || 'No registrado')}</p>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Seguro Médico</small>
                                    <p class="fw-bold mb-0">${esc(datosSalud.afiliacion_seguro_medico || 'No registrado')}</p>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="mt-3">
                                <a href="#/portal-alumno" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-pencil me-1"></i>Actualizar Información
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Información Académica -->
                <div class="col-lg-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0">
                                <i class="bi bi-mortarboard me-2"></i>Información Académica
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-12">
                                    <small class="text-muted">Licenciatura</small>
                                    <p class="fw-bold mb-0">${esc(alumno.nombre_licenciatura)}</p>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted">Matrícula</small>
                                    <p class="fw-bold mb-0">${esc(alumno.matricula)}</p>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Generación</small>
                                    <p class="fw-bold mb-0">${esc(alumno.generacion)}</p>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted">Semestre</small>
                                    <p class="fw-bold mb-0">${esc(alumno.semestre_actual)}°</p>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">Status</small>
                                    <p class="mb-0">
                                        <span class="badge ${alumno.status_alumno === 'Activo' ? 'bg-success' : 'bg-secondary'}">
                                            ${esc(alumno.status_alumno)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-12">
                                    <small class="text-muted">Correo Institucional</small>
                                    <p class="fw-bold mb-0">${esc(alumno.correo_institucional || 'No asignado')}</p>
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <a href="#/portal-alumno" class="btn btn-sm btn-outline-success">
                                    <i class="bi bi-pencil me-1"></i>Ver Mi Portal
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('datos-personales-content').innerHTML = html;
        
    } catch (error) {
        console.error('Error al cargar datos personales:', error);
    }
};



/**
 * Renderizar resumen del expediente con tarjetas de estadísticas
 */
const renderResumenExpediente = async (alumno) => {
    try {
        // Obtener calificaciones
        const calificaciones = await API.get('/portal-alumno/calificaciones');
        const promedioGeneral = parseFloat(calificaciones.data.promedio_general) || 0;
        
        // Obtener documentos
        const documentos = await API.get(`/documentos/alumno/${alumno.id_alumno}`);
        const totalDocs = documentos.data?.documentos?.length || 0;
        
        // Obtener familiares
        const familiares = await API.get('/portal-alumno/familiares');
        const totalFamiliares = familiares.data?.length || 0;
        
        const html = `
            <div class="row mb-4">
                <!-- Tarjeta: Promedio General -->
                <div class="col-md-3 mb-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="bi bi-star-fill text-warning" style="font-size: 2rem;"></i>
                            </div>
                            <h3 class="mb-1 fw-bold ${promedioGeneral >= 8 ? 'text-success' : promedioGeneral >= 7 ? 'text-warning' : 'text-danger'}">
                                ${promedioGeneral.toFixed(2)}
                            </h3>
                            <p class="text-muted mb-0 small">Promedio General</p>
                        </div>
                    </div>
                </div>
                
                <!-- Tarjeta: Semestre -->
                <div class="col-md-3 mb-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="bi bi-calendar-check text-primary" style="font-size: 2rem;"></i>
                            </div>
                            <h3 class="mb-1 fw-bold">${esc(alumno.semestre_actual)}°</h3>
                            <p class="text-muted mb-0 small">Semestre Actual</p>
                        </div>
                    </div>
                </div>
                
                <!-- Tarjeta: Documentos -->
                <div class="col-md-3 mb-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="bi bi-file-earmark-text text-info" style="font-size: 2rem;"></i>
                            </div>
                            <h3 class="mb-1 fw-bold">${totalDocs}</h3>
                            <p class="text-muted mb-0 small">Documentos Subidos</p>
                        </div>
                    </div>
                </div>
                
                <!-- Tarjeta: Familiares -->
                <div class="col-md-3 mb-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="bi bi-people text-success" style="font-size: 2rem;"></i>
                            </div>
                            <h3 class="mb-1 fw-bold">${totalFamiliares}</h3>
                            <p class="text-muted mb-0 small">Contactos Familiares</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('stats-alumno').innerHTML = html;
        
    } catch (error) {
        console.error('Error al cargar resumen:', error);
    }
};

    /**
     * Renderizar header del expediente
     */
    const renderHeaderExpediente = (alumno) => {
        const headerHtml = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar bg-primary text-white rounded-circle" 
                            style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                            ${esc(alumno.nombre_completo.charAt(0).toUpperCase())}
                        </div>
                    </div>
                    <div class="col">
                        <h3 class="mb-1">${esc(alumno.nombre_completo)}</h3>
                        <div class="d-flex gap-3 flex-wrap">
                            <span class="badge bg-primary">${esc(alumno.matricula || 'Sin matrícula')}</span>
                            <span class="badge bg-info">${esc(alumno.nombre_licenciatura)}</span>
                            <span class="badge bg-secondary">Semestre ${esc(alumno.semestre_actual)}°</span>
                            <span class="badge bg-success">Generación ${esc(alumno.generacion)}</span>
                        </div>
                        <div class="mt-2 text-muted small">
                            <i class="bi bi-envelope me-1"></i> ${esc(alumno.correo_institucional)}
                            ${alumno.correo_personal ? ` | <i class="bi bi-envelope-fill me-1"></i> ${esc(alumno.correo_personal)}` : ''}
                            ${alumno.celular ? ` | <i class="bi bi-phone me-1"></i> ${esc(alumno.celular)}` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('header-expediente-alumno').innerHTML = headerHtml;
    };

    /**
     * Cargar datos personales
     */
    const cargarDatosPersonalesAlumno = async (alumno) => {
        const html = `
            <h5 class="mb-3"><i class="bi bi-person-fill me-2"></i>Información Personal</h5>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">CURP</label>
                    <p class="fw-bold">${esc(alumno.curp || 'No registrado')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Fecha de Nacimiento</label>
                    <p class="fw-bold">${alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-MX') : 'No registrado'}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Correo Institucional</label>
                    <p class="fw-bold">${esc(alumno.correo_institucional)}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Correo Personal</label>
                    <p class="fw-bold">${esc(alumno.correo_personal || 'No registrado')}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Celular</label>
                    <p class="fw-bold">${esc(alumno.celular || 'No registrado')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Teléfono de Emergencia</label>
                    <p class="fw-bold">${esc(alumno.telefono_emergencia || 'No registrado')}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Estado Civil</label>
                    <p class="fw-bold">${esc(alumno.estado_civil || 'No registrado')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Status</label>
                    <span class="badge ${alumno.status_alumno === 'Activo' ? 'bg-success' : 'bg-secondary'}">${esc(alumno.status_alumno)}</span>
                </div>
            </div>
            
            <div class="alert alert-info mt-3">
                <i class="bi bi-info-circle me-2"></i>
                Para actualizar tu información personal, ve a la sección <strong>Mi Portal</strong>.
            </div>
        `;
        
        document.getElementById('datos-personales-content').innerHTML = html;
    };

    /**
     * Cargar datos académicos
     */
    const cargarDatosAcademicosAlumno = async (alumno) => {
        const html = `
            <h5 class="mb-3"><i class="bi bi-mortarboard-fill me-2"></i>Información Académica</h5>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Licenciatura</label>
                    <p class="fw-bold">${esc(alumno.nombre_licenciatura)}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Matrícula</label>
                    <p class="fw-bold">${esc(alumno.matricula)}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Semestre Actual</label>
                    <p class="fw-bold">${esc(alumno.semestre_actual)}°</p>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label text-muted small">Generación</label>
                    <p class="fw-bold">${esc(alumno.generacion)}</p>
                </div>
            </div>
            
            <div class="alert alert-primary mt-3">
                <i class="bi bi-info-circle me-2"></i>
                Aquí podrás ver tus calificaciones y datos académicos próximamente.
            </div>
        `;
        
        document.getElementById('academico-content').innerHTML = html;
    };

    /**
     * Cargar datos de salud
     */
    const cargarDatosSaludAlumno = async () => {
        try {
            const response = await API.get('/portal-alumno/datos-salud');
            
            if (response.success && response.data) {
                const salud = response.data;
                const html = `
                    <h5 class="mb-3"><i class="bi bi-heart-pulse-fill me-2"></i>Información de Salud</h5>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small">Tipo de Sangre</label>
                            <p class="fw-bold">${esc(salud.tipo_sangre || 'No registrado')}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small">Seguro Médico</label>
                            <p class="fw-bold">${esc(salud.afiliacion_seguro_medico || 'No registrado')}</p>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label text-muted small">Alergias</label>
                            <p class="fw-bold">${esc(salud.alergias || 'Ninguna')}</p>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small">¿Padece alguna enfermedad?</label>
                            <p class="fw-bold">${salud.tiene_enfermedad ? 'Sí' : 'No'}</p>
                        </div>
                        ${salud.tiene_enfermedad ? `
                        <div class="col-md-6 mb-3">
                            <label class="form-label text-muted small">Enfermedad</label>
                            <p class="fw-bold">${esc(salud.nombre_enfermedad || 'No especificado')}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="alert alert-info mt-3">
                        <i class="bi bi-info-circle me-2"></i>
                        Para actualizar tu información de salud, ve a la sección <strong>Mi Portal</strong>.
                    </div>
                `;
                document.getElementById('salud-content').innerHTML = html;
            } else {
                document.getElementById('salud-content').innerHTML = `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        No has registrado información de salud. Ve a <strong>Mi Portal</strong> para completarla.
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error al cargar datos de salud:', error);
            document.getElementById('salud-content').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle me-2"></i>
                    Error al cargar datos de salud
                </div>
            `;
        }
    };

    /**
     * Cargar familiares
     */
    const cargarFamiliaresAlumno = async () => {
        try {
            const response = await API.get('/portal-alumno/familiares');
            
            if (response.success && response.data.length > 0) {
                const html = `
                    <h5 class="mb-3"><i class="bi bi-people-fill me-2"></i>Familiares Registrados</h5>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Nombre</th>
                                    <th>Teléfono</th>
                                    <th>Ocupación</th>
                                    <th>Tutor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${response.data.map(fam => `
                                    <tr>
                                        <td><span class="badge bg-info">${esc(fam.tipo_familiar)}</span></td>
                                        <td>${esc(fam.nombre_completo)}</td>
                                        <td>${esc(fam.telefono || 'N/A')}</td>
                                        <td>${esc(fam.ocupacion || 'N/A')}</td>
                                        <td>
                                            ${fam.es_tutor ? '<i class="bi bi-check-circle-fill text-success"></i>' : '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="alert alert-info mt-3">
                        <i class="bi bi-info-circle me-2"></i>
                        Para actualizar información de familiares, ve a la sección <strong>Mi Portal</strong>.
                    </div>
                `;
                document.getElementById('familiares-content').innerHTML = html;
            } else {
                document.getElementById('familiares-content').innerHTML = `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        No has registrado familiares. Ve a <strong>Mi Portal</strong> para agregarlos.
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error al cargar familiares:', error);
            document.getElementById('familiares-content').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle me-2"></i>
                    Error al cargar familiares
                </div>
            `;
        }
    };

    /**
     * Cargar documentos
     */
    const cargarDocumentosAlumno = async () => {
        const html = `
            <h5 class="mb-3"><i class="bi bi-file-earmark-text-fill me-2"></i>Mis Documentos</h5>
            
            <div class="alert alert-primary">
                <i class="bi bi-info-circle me-2"></i>
                La gestión de documentos estará disponible próximamente.
            </div>
            
            <div class="list-group">
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Acta de Nacimiento</h6>
                        <small class="text-muted">Pendiente</small>
                    </div>
                </div>
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">CURP</h6>
                        <small class="text-muted">Pendiente</small>
                    </div>
                </div>
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Certificado de Bachillerato</h6>
                        <small class="text-muted">Pendiente</small>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('documentos-content').innerHTML = html;
    };

        /**
         * Cargar todos los datos del dashboard
         */
        const cargarDatos = async () => {
            try {
                State.setLoading(true);
                
                if (Auth.isAdmin() || Auth.isDocente()) {
                    // Cargar estadísticas
                    await cargarEstadisticas();
                    
                    // Cargar alertas y actividad
                    await cargarAlertas();
                    await cargarActividadReciente();
                    await cargarGraficos();
                    
                } else if (Auth.isAlumno()) {
                    await cargarExpedienteAlumno();
                } else if (Auth.isInvitado()) {
                    const response = await API.get('/dashboard/estadisticas');
                    if (response.success) {
                        renderEstadisticas(response.data);
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
                Alert.error('Error al cargar los datos del dashboard');
                const spinner = document.querySelector('.spinner-border');
                if (spinner && spinner.parentElement) {
                    spinner.parentElement.style.display = 'none';
                }
            } finally {
                State.setLoading(false);
            }
        };
        
        /**
         * Cargar estadísticas según el rol
         */
        const cargarEstadisticas = async () => {
            try {
                const response = await API.get('/dashboard/estadisticas');
                
                if (response.success) {
                    renderEstadisticas(response.data);
                }
                
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
            }
        };
    


    /**
     * Renderizar tarjetas de estadísticas 
     */
    const renderEstadisticas = (data) => {
        const statsContainer = document.getElementById('stats-cards');
        
        if (Auth.isAdmin()) {
            // ============================================
            // DASHBOARD ADMINISTRADOR - OPCIÓN A
            // ============================================
            statsContainer.innerHTML = `
                <!-- Tarjeta 1: Total de Alumnos -->
                <div class="col-md-3">
                    <div class="card bg-primary text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">Total Alumnos</h6>
                                    <h2 class="mb-0">${data.total_alumnos || 0}</h2>
                                </div>
                                <i class="bi bi-people fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tarjeta 2: Usuarios Activos -->
                <div class="col-md-3">
                    <div class="card bg-info text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">Usuarios Activos</h6>
                                    <h2 class="mb-0">${data.total_usuarios_activos || 0}</h2>
                                </div>
                                <i class="bi bi-person-check fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tarjeta 3: Total Documentos -->
                <div class="col-md-3">
                    <div class="card bg-success text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">Total Documentos</h6>
                                    <h2 class="mb-0">${data.total_documentos || 0}</h2>
                                </div>
                                <i class="bi bi-file-earmark fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tarjeta 4: Alumnos en Riesgo -->
                <div class="col-md-3">
                    <div class="card bg-danger text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">En Riesgo</h6>
                                    <h2 class="mb-0">${data.alumnos_riesgo || 0}</h2>
                                </div>
                                <i class="bi bi-exclamation-triangle fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (Auth.isDocente()) {
            // ============================================
            // DASHBOARD DOCENTE (Sin cambios)
            // ============================================
            statsContainer.innerHTML = `
                <div class="col-md-3">
                    <div class="card bg-primary text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">Mis Alumnos</h6>
                                    <h2 class="mb-0">${data.total_alumnos || 0}</h2>
                                </div>
                                <i class="bi bi-people fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card bg-success text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">Regulares</h6>
                                    <h2 class="mb-0">${data.alumnos_regulares || 0}</h2>
                                </div>
                                <i class="bi bi-check-circle fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card bg-warning text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">En Riesgo</h6>
                                    <h2 class="mb-0">${data.alumnos_riesgo || 0}</h2>
                                </div>
                                <i class="bi bi-exclamation-triangle fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card bg-info text-white stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="card-title mb-0">Docs. Pendientes</h6>
                                    <h2 class="mb-0">${data.documentos_pendientes || 0}</h2>
                                </div>
                                <i class="bi bi-file-earmark-text fs-1 opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }else if (Auth.getCurrentUser().rol.nombre_rol === 'Invitado') {
        statsContainer.innerHTML = `
            <!-- Tarjeta 1: Total de Alumnos Visible -->
            <div class="col-md-4">
                <div class="card bg-info text-white stat-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-0">Alumnos Visibles</h6>
                                <h2 class="mb-0">${data.total_alumnos || 0}</h2>
                                <small>En ${data.total_licenciaturas || 0} licenciatura(s)</small>
                            </div>
                            <i class="bi bi-people fs-1 opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tarjeta 2: Licenciaturas Permitidas -->
            <div class="col-md-4">
                <div class="card bg-primary text-white stat-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-0">Licenciaturas</h6>
                                <h2 class="mb-0">${data.total_licenciaturas || 0}</h2>
                                <small>Con acceso asignado</small>
                            </div>
                            <i class="bi bi-mortarboard fs-1 opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tarjeta 3: Nivel de Acceso -->
            <div class="col-md-4">
                <div class="card bg-warning text-white stat-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-0">Nivel de Acceso</h6>
                                <h2 class="mb-0">${data.secciones_permitidas ? data.secciones_permitidas.length : 'Total'}</h2>
                                <small>${data.secciones_permitidas ? 'Sección(es)' : 'Todas las secciones'}</small>
                            </div>
                            <i class="bi bi-shield-check fs-1 opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Renderizar información adicional para invitado
        renderInfoInvitado(data);
    }

    };


    /**
     * Renderizar información adicional para usuario invitado
     */
    const renderInfoInvitado = (data) => {
        const quickActionsContainer = document.getElementById('quick-actions');
        
        quickActionsContainer.innerHTML = `
            <div class="row">
                <!-- Información de Permisos -->
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0"><i class="bi bi-shield-lock me-2"></i>Tus Permisos</h5>
                        </div>
                        <div class="card-body">
                            <h6 class="text-muted mb-3">Licenciaturas con Acceso:</h6>
                            ${data.por_licenciatura ? data.por_licenciatura.map(lic => `
                                <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                    <span><i class="bi bi-mortarboard-fill text-primary me-2"></i>${esc(lic.nombre_licenciatura)}</span>
                                    <span class="badge bg-primary">${lic.total} alumno(s)</span>
                                </div>
                            `).join('') : '<p class="text-muted">No hay licenciaturas asignadas</p>'}
                            
                            ${data.secciones_permitidas ? `
                                <hr>
                                <h6 class="text-muted mb-3">Secciones Permitidas:</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${data.secciones_permitidas.map(seccion => `
                                        <span class="badge bg-success">${esc(formatearSeccion(seccion))}</span>
                                    `).join('')}
                                </div>
                            ` : `
                                <hr>
                                <div class="alert alert-info mb-0">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Tienes acceso a <strong>todas las secciones</strong> de los expedientes.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                
                <!-- Distribución de Alumnos -->
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Distribución de Alumnos</h5>
                        </div>
                        <div class="card-body">
                            <h6 class="text-muted mb-3">Por Status:</h6>
                            ${data.por_status ? data.por_status.map(status => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${esc(status.status_alumno)}</span>
                                    <span class="badge ${getStatusBadgeClass(status.status_alumno)}">${status.total}</span>
                                </div>
                            `).join('') : '<p class="text-muted">No hay datos disponibles</p>'}
                            
                            ${data.por_generacion && data.por_generacion.length > 0 ? `
                                <hr>
                                <h6 class="text-muted mb-3">Por Generación:</h6>
                                ${data.por_generacion.map(gen => `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span>Generación ${esc(gen.generacion)}</span>
                                        <span class="badge bg-secondary">${gen.total}</span>
                                    </div>
                                `).join('')}
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Acceso Rápido a Alumnos -->
            <div class="card mt-4">
                <div class="card-header">
                    <h5 class="mb-0"><i class="bi bi-people me-2"></i>Acceso Rápido</h5>
                </div>
                <div class="card-body">

                    <div class="d-grid gap-2 d-md-flex">

                        <button class="btn btn-primary" data-accion="Router.navigate" data-args="${Acciones.args('/alumnos')}">
                            <i class="bi bi-person-lines-fill me-2"></i>Ver Alumnos
                        </button>
                        

                    </div>
                    <div class="alert alert-warning mt-3 mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Acceso de Solo Lectura:</strong> Como usuario invitado, puedes consultar información pero no realizar modificaciones.
                    </div>

                </div>
            </div>
        `;
    };
    
    /**
     * Cargar accesos rápidos según el rol
     */
    const cargarAccesosRapidos = () => {
        const quickActionsContainer = document.getElementById('quick-actions');
        
        if (!quickActionsContainer) return;
        
        if (Auth.isAdmin()) {
            quickActionsContainer.innerHTML = `
                <div class="d-flex gap-2 flex-wrap">
                    <a href="#/alumnos" class="btn btn-primary" data-action="nuevo-alumno">
                        <i class="bi bi-plus-circle me-2"></i>Nuevo Alumno
                    </a>
                    <a href="#/alumnos" class="btn btn-outline-primary">
                        <i class="bi bi-people me-2"></i>Ver Alumnos
                    </a>
                    <a href="#/usuarios" class="btn btn-outline-primary">
                        <i class="bi bi-person-gear me-2"></i>Gestionar Usuarios
                    </a>
                    <a href="#/reportes" class="btn btn-outline-primary">
                        <i class="bi bi-bar-chart me-2"></i>Generar Reportes
                    </a>
                </div>
            `;
        } else if (Auth.isDocente()) {
            quickActionsContainer.innerHTML = `
                <div class="d-flex gap-2 flex-wrap">
                    <a href="#/alumnos" class="btn btn-primary">
                        <i class="bi bi-people me-2"></i>Mis Alumnos
                    </a>
                    <a href="#/alumnos" class="btn btn-outline-primary">
                        <i class="bi bi-plus-circle me-2"></i>Registrar Alumno
                    </a>
                    <a href="#/reportes" class="btn btn-outline-primary">
                        <i class="bi bi-bar-chart me-2"></i>Generar Reportes
                    </a>
                </div>
            `;
        }
    };
    
    
    /**
     * Cargar alertas y notificaciones
     */
    const cargarAlertas = async () => {
        try {
            const response = await API.get('/dashboard/alertas');
            
            if (response.success && response.data.length > 0) {
                renderAlertas(response.data);
            }
            
        } catch (error) {
            console.error('Error al cargar alertas:', error);
        }
    };
    
    /**
     * Renderizar alertas
     */
    const renderAlertas = (alertas) => {
        const alertasContainer = document.getElementById('alertas-container');
        
        alertasContainer.innerHTML = alertas.map(alerta => `
            <div class="alert alert-${alerta.tipo} alert-dismissible fade show" role="alert">
                <i class="bi bi-${alerta.tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                <strong>${esc(alerta.titulo)}:</strong> ${esc(alerta.mensaje)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `).join('');
    };
    
    /**
     * Cargar actividad reciente
     */
    const cargarActividadReciente = async () => {
        try {
            const response = await API.get('/dashboard/actividad?limite=5');
            
            if (response.success) {
                renderActividadReciente(response.data);
            }
            
        } catch (error) {
            console.error('Error al cargar actividad reciente:', error);
        }
    };
    
    /**
     * Renderizar actividad reciente
     */
    const renderActividadReciente = (data) => {
        const actividadContainer = document.getElementById('actividad-reciente');
        const registrosContainer = document.getElementById('ultimos-registros');
        
        if (data.documentos_recientes && data.documentos_recientes.length > 0) {
            actividadContainer.innerHTML = data.documentos_recientes.map(doc => `
                <div class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">
                            <i class="bi bi-file-earmark-text me-2 text-primary"></i>
                            ${esc(doc.nombre_archivo)}
                        </h6>
                        <small class="text-muted">${formatearFecha(doc.fecha_subida)}</small>
                    </div>
                    <p class="mb-1 small text-muted">
                        Alumno: ${esc(doc.alumno)}
                    </p>
                </div>
            `).join('');
        } else {
            actividadContainer.innerHTML = `
                <div class="list-group-item text-center text-muted py-4">
                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                    Sin actividad reciente
                </div>
            `;
        }
        
        if (data.alumnos_recientes && data.alumnos_recientes.length > 0) {
            registrosContainer.innerHTML = data.alumnos_recientes.map(alumno => `
                <a href="#/alumno/${alumno.id_alumno}" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">
                            <i class="bi bi-person-circle me-2 text-success"></i>
                            ${esc(alumno.nombre_completo)}
                        </h6>
                        <small class="text-muted">${formatearFecha(alumno.fecha_inscripcion)}</small>
                    </div>
                    <p class="mb-1 small text-muted">
                        Matrícula: ${esc(alumno.matricula)}
                    </p>
                </a>
            `).join('');
        } else {
            registrosContainer.innerHTML = `
                <div class="list-group-item text-center text-muted py-4">
                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                    Sin registros recientes
                </div>
            `;
        }
    };
    
    /**
     * Cargar gráficos
     */
    const cargarGraficos = async () => {
        try {
            // Cargar datos para gráfico de semestres
            const semestreResponse = await API.get('/dashboard/graficos?tipo=alumnos_por_semestre');
            if (semestreResponse.success) {
                renderGraficoSemestres(semestreResponse.data);
            }
            
            // Cargar datos para gráfico de rendimiento
            const rendimientoResponse = await API.get('/dashboard/graficos?tipo=rendimiento_general');
            if (rendimientoResponse.success) {
                renderGraficoRendimiento(rendimientoResponse.data);
            }
            
        } catch (error) {
            console.error('Error al cargar gráficos:', error);
        }
    };
    
    /**
     * Renderizar gráfico de alumnos por semestre
     */
    const renderGraficoSemestres = (data) => {
        const ctx = document.getElementById('chart-semestres');
        
        if (!ctx) return;
        
        // Destruir gráfico anterior si existe
        if (chartInstances.semestres) {
            chartInstances.semestres.destroy();
        }
        
        chartInstances.semestres = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => `Semestre ${item.semestre_actual}`),
                datasets: [{
                    label: 'Número de Alumnos',
                    data: data.map(item => item.cantidad),
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Alumnos: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    };
    
    /**
     * Renderizar gráfico de rendimiento
     */
    const renderGraficoRendimiento = (data) => {
        const ctx = document.getElementById('chart-rendimiento');
        
        if (!ctx) return;
        
        // Destruir gráfico anterior si existe
        if (chartInstances.rendimiento) {
            chartInstances.rendimiento.destroy();
        }
        
        const colores = {
            'Excelente': 'rgba(40, 167, 69, 0.8)',
            'Bueno': 'rgba(23, 162, 184, 0.8)',
            'Regular': 'rgba(255, 193, 7, 0.8)',
            'En Riesgo': 'rgba(220, 53, 69, 0.8)'
        };
        
        chartInstances.rendimiento = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.categoria),
                datasets: [{
                    data: data.map(item => item.cantidad),
                    backgroundColor: data.map(item => colores[item.categoria] || 'rgba(108, 117, 125, 0.8)'),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const porcentaje = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${porcentaje}%)`;
                            }
                        }
                    }
                }
            }
        });
    };
    
    /**
     * Obtener fecha actual formateada
     */
    const obtenerFechaActual = () => {
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date().toLocaleDateString('es-MX', opciones);
    };
    
    /**
     * Formatear fecha
     */
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        // Validar que la fecha sea válida
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        const ahora = new Date();
        const diff = ahora - date;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);
        
        if (minutos < 1) return 'Hace un momento';
        if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
        if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
        if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
        
        return date.toLocaleDateString('es-MX', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
    };



    /**
     * Formatear nombre de sección para mostrar
     */
    const formatearSeccion = (seccion) => {
        const nombres = {
            'datos_personales': 'Datos Personales',
            'datos_salud': 'Datos de Salud',
            'datos_familiares': 'Datos Familiares',
            'datos_socioeconomicos': 'Datos Socioeconómicos',
            'datos_academicos': 'Datos Académicos',
            'practicas_profesionales': 'Prácticas Profesionales',
            'certificaciones': 'Certificaciones',
            'habilidades': 'Habilidades',
            'documentos': 'Documentos'
        };
        return nombres[seccion] || seccion;
    };

    /**
     * Obtener clase de badge según el status
     */
    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'Activo': return 'bg-success';
            case 'Inactivo': return 'bg-secondary';
            case 'Baja': return 'bg-danger';
            case 'Egresado': return 'bg-info';
            default: return 'bg-secondary';
        }
    };
    
    /**
     * Inicializar event listeners
     */
    const initEventListeners = () => {
        // Aquí puedes agregar listeners para botones específicos si es necesario
    };
    
    /**
     * Limpiar al salir de la vista
     */
    const destroy = () => {
        // Destruir gráficos para liberar memoria
        Object.values(chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        chartInstances = {};
    };
    
    // Exponer métodos públicos
    return {
        render,
        destroy
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.DashboardView = DashboardView;