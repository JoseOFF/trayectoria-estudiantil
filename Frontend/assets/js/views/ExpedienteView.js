// ============================================
// VISTA DE EXPEDIENTE COMPLETO CON EDICIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const ExpedienteView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let expediente = null;
    let idAlumno = null;
    
    /**
     * Renderizar la vista
     */
    const render = async (params) => {
        idAlumno = params.id;
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-container">
                ${Sidebar.render()}
                
                <div class="main-content">
                    ${Navbar.render()}
                    
                    <div class="content-area">
                        <!-- Loading -->
                        <div id="loading-expediente" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-2 text-muted">Cargando expediente...</p>
                        </div>
                        
                        <!-- Contenedor del expediente -->
                        <div id="expediente-content" class="d-none">
                            <!-- Header con información básica -->
                            <div class="card mb-4" id="header-info">
                                <!-- Se carga dinámicamente -->
                            </div>
                            
                            <!-- Tabs de navegación -->
                            <ul class="nav nav-tabs mb-4" id="expediente-tabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="datos-personales-tab" data-bs-toggle="tab" 
                                            data-bs-target="#datos-personales" type="button" role="tab">
                                        <i class="bi bi-person-fill me-2"></i>Datos Personales
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="academico-tab" data-bs-toggle="tab" 
                                            data-bs-target="#academico" type="button" role="tab">
                                        <i class="bi bi-book-fill me-2"></i>Académico
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="familiares-tab" data-bs-toggle="tab" 
                                            data-bs-target="#familiares" type="button" role="tab">
                                        <i class="bi bi-people-fill me-2"></i>Familiares
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="incidentes-tab" data-bs-toggle="tab" 
                                            data-bs-target="#incidentes" type="button" role="tab">
                                        <i class="bi bi-exclamation-triangle-fill me-2"></i>Incidentes
                                    </button>
                                </li>


                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="becas-tab" data-bs-toggle="tab" 
                                            data-bs-target="#becas" type="button" role="tab">
                                        <i class="bi bi-currency-dollar me-2"></i>Becas
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="movilidad-tab" data-bs-toggle="tab" 
                                            data-bs-target="#movilidad" type="button" role="tab">
                                        <i class="bi bi-airplane me-2"></i>Movilidad
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="practicas-tab" data-bs-toggle="tab" 
                                            data-bs-target="#practicas" type="button" role="tab">
                                        <i class="bi bi-briefcase me-2"></i>Prácticas
                                    </button>
                                </li>


                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="salud-tab" data-bs-toggle="tab" 
                                            data-bs-target="#salud" type="button" role="tab">
                                        <i class="bi bi-heart-pulse me-2"></i>Salud
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="desempeno-tab" data-bs-toggle="tab" 
                                            data-bs-target="#desempeno" type="button" role="tab">
                                        <i class="bi bi-trophy-fill me-2"></i>Desempeño
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="habilidades-tab" data-bs-toggle="tab" 
                                            data-bs-target="#habilidades" type="button" role="tab">
                                        <i class="bi bi-gear-fill me-2"></i>Habilidades
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="certificaciones-tab" data-bs-toggle="tab" 
                                            data-bs-target="#certificaciones" type="button" role="tab">
                                        <i class="bi bi-award-fill me-2"></i>Certificaciones
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="socioeconomicos-tab" data-bs-toggle="tab" 
                                            data-bs-target="#socioeconomicos" type="button" role="tab">
                                        <i class="bi bi-wallet2 me-2"></i>Socioeconómicos
                                    </button>
                                </li>



                            </ul>
                            
                            <!-- Contenido de las tabs -->
                            <div class="tab-content" id="expediente-tab-content">
                                <!-- Datos Personales -->
                                <div class="tab-pane fade show active" id="datos-personales" role="tabpanel">
                                    <div class="row" id="datos-personales-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>
                                
                                <!-- Académico -->
                                <div class="tab-pane fade" id="academico" role="tabpanel">
                                    <div id="academico-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>
                                
                                <!-- Familiares -->
                                <div class="tab-pane fade" id="familiares" role="tabpanel">
                                    <div id="familiares-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>
                                
                                <!-- Incidentes -->
                                <div class="tab-pane fade" id="incidentes" role="tabpanel">
                                    <div id="incidentes-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Tab Salud -->
                                <div class="tab-pane fade" id="salud" role="tabpanel">
                                    <div class="row" id="salud-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Tab Desempeño -->
                                <div class="tab-pane fade" id="desempeno" role="tabpanel">
                                    <div class="row" id="desempeno-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Tab Habilidades -->
                                <div class="tab-pane fade" id="habilidades" role="tabpanel">
                                    <div class="row" id="habilidades-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Tab Certificaciones -->
                                <div class="tab-pane fade" id="certificaciones" role="tabpanel">
                                    <div class="row" id="certificaciones-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Tab Socioeconómicos -->
                                <div class="tab-pane fade" id="socioeconomicos" role="tabpanel">
                                    <div class="row" id="socioeconomicos-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Becas -->
                                <div class="tab-pane fade" id="becas" role="tabpanel">
                                    <div id="becas-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Movilidad -->
                                <div class="tab-pane fade" id="movilidad" role="tabpanel">
                                    <div id="movilidad-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>

                                <!-- Prácticas -->
                                <div class="tab-pane fade" id="practicas" role="tabpanel">
                                    <div id="practicas-content">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${renderModals()}
        `;
        
        // Inicializar componentes
        Navbar.initEvents();
        Sidebar.initEvents();
        
        // Cargar expediente
        await cargarExpediente();
    };
    
    /**
     * Renderizar todos los modales
     */
    const renderModals = () => {
        return `
            <!-- Modal Editar Datos Personales -->
            <div class="modal fade" id="modalEditarPersonales" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Datos de Contacto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-datos-personales">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Celular</label>
                                        <input type="tel" class="form-control" id="edit-celular" maxlength="10">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Teléfono de Emergencia</label>
                                        <input type="tel" class="form-control" id="edit-tel-emergencia" maxlength="10">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Correo Personal</label>
                                        <input type="email" class="form-control" id="edit-correo-personal">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Estado Civil</label>
                                        <select class="form-select" id="edit-estado-civil">
                                            <option value="">Seleccionar</option>
                                            <option value="Soltero">Soltero(a)</option>
                                            <option value="Casado">Casado(a)</option>
                                            <option value="Unión libre">Unión libre</option>
                                            <option value="Divorciado">Divorciado(a)</option>
                                            <option value="Viudo">Viudo(a)</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" data-accion="ExpedienteView.guardarDatosPersonales">
                                <i class="bi bi-save me-2"></i>Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal Agregar Calificación -->
            <div class="modal fade" id="modalCalificacion" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Registrar Calificación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-calificacion">
                                <div class="mb-3">
                                    <label class="form-label">Semestre *</label>
                                    <select class="form-select" id="cal-semestre" required>
                                        <option value="">Seleccionar</option>
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
                                <div class="mb-3">
                                    <label class="form-label">Promedio *</label>
                                    <input type="number" class="form-control" id="cal-promedio" 
                                        min="0" max="10" step="0.1" required>
                                    <small class="text-muted">Valor entre 0 y 10</small>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" data-accion="ExpedienteView.guardarCalificacion">
                                <i class="bi bi-save me-2"></i>Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
        `;
    };
    /**
     * Cargar expediente completo
     */
    const cargarExpediente = async () => {
        try {
            const response = await API.get(`/alumnos/${idAlumno}/expediente`);
            
            if (response.success) {
                expediente = response.data;
                
                // Ocultar loading y mostrar contenido
                document.getElementById('loading-expediente').classList.add('d-none');
                document.getElementById('expediente-content').classList.remove('d-none');
                
                
                // Renderizar secciones
                renderHeader();

                // ========================================
            // VERIFICAR PERMISOS PARA CADA SECCIÓN
            // ========================================
            if (InvitadoUtils.tienePermisoSeccion('datos-personales', expediente)) {
                renderDatosPersonales();
            } else {
                document.getElementById('datos-personales-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Datos Personales');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('academico', expediente)) {
                renderAcademico();
            } else {
                document.getElementById('academico-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Información Académica');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('familiares', expediente)) {
                renderFamiliares();
            } else {
                document.getElementById('familiares-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Familiares');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('incidentes', expediente)) {
                renderIncidentes();
            } else {
                document.getElementById('incidentes-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Incidentes');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('salud', expediente)) {
                renderSalud();
            } else {
                document.getElementById('salud-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Datos de Salud');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('desempeno', expediente)) {
                renderDesempeno();
            } else {
                document.getElementById('desempeno-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Desempeño Académico');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('habilidades', expediente)) {
                renderHabilidades();
            } else {
                document.getElementById('habilidades-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Habilidades');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('certificaciones', expediente)) {
                renderCertificaciones();
            } else {
                document.getElementById('certificaciones-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Certificaciones');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('socioeconomicos', expediente)) {
                renderSocioeconomicos();
            } else {
                document.getElementById('socioeconomicos-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Datos Socioeconómicos');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('becas', expediente)) {
                renderBecas();
            } else {
                document.getElementById('becas-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Becas');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('movilidad', expediente)) {
                renderMovilidad();
            } else {
                document.getElementById('movilidad-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Movilidad Académica');
            }
            
            if (InvitadoUtils.tienePermisoSeccion('practicas', expediente)) {
                renderPracticasExpediente();
            } else {
                document.getElementById('practicas-content').innerHTML = 
                    InvitadoUtils.renderSinPermiso('Prácticas Profesionales');
            }

            // ========================================
            // DESHABILITAR BOTONES SI ES INVITADO
            // ========================================
            if (expediente._es_invitado) {
                setTimeout(() => {
                    InvitadoUtils.deshabilitarBotonesEdicion('#expediente-content');
                }, 100);
            }

                
            }
            
        } catch (error) {
            console.error('Error al cargar expediente:', error);
            document.getElementById('loading-expediente').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar el expediente: ${esc(error.message)}
                </div>
                <button class="btn btn-primary" data-accion="Router.goBack">
                    <i class="bi bi-arrow-left me-2"></i>Volver
                </button>
            `;
        }
    };
    
    /**
     * Renderizar header con información básica
     */
    const renderHeader = () => {
        const datos = expediente.datos_personales;
        
        document.getElementById('header-info').innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-auto">
                        <div class="avatar bg-primary text-white rounded-circle" 
                             style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                            ${esc(datos.nombre_completo.charAt(0).toUpperCase())}
                        </div>
                    </div>
                    <div class="col">
                        <h3 class="mb-1">${esc(datos.nombre_completo)}</h3>
                        <div class="d-flex gap-3 flex-wrap">
                            <span class="badge bg-primary">${esc(datos.matricula || 'Sin matrícula')}</span>
                            <span class="badge bg-info">${esc(datos.nombre_licenciatura)}</span>
                            <span class="badge bg-secondary">Semestre ${esc(datos.semestre_actual)}°</span>
                            <span class="badge ${getStatusBadgeClass(datos.estado_expediente)}">
                                Expediente: ${esc(datos.estado_expediente)}
                            </span>
                        </div>
                        <div class="mt-2 text-muted">
                            <i class="bi bi-envelope me-1"></i> ${esc(datos.correo_institucional)}
                            ${datos.correo_personal ? ` | <i class="bi bi-envelope-fill me-1"></i> ${esc(datos.correo_personal)}` : ''}
                            ${datos.celular ? ` | <i class="bi bi-phone me-1"></i> ${esc(datos.celular)}` : ''}
                        </div>
                    </div>
                <div class="col-auto">
                    <div class="d-flex gap-2">
                        <button class="btn btn-danger btn-sm" data-accion="ExpedienteView.descargarExpedientePDF">
                            <i class="bi bi-file-pdf me-1"></i>Descargar PDF
                        </button>
                        <button class="btn btn-outline-primary btn-sm" data-accion="Router.navigate" data-args="${Acciones.args(`/documentos/${datos.id_alumno}`)}">
                            <i class="bi bi-file-earmark-text me-1"></i>Documentos
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" data-accion="Router.goBack">
                            <i class="bi bi-arrow-left me-1"></i>Volver
                        </button>
                    </div>
                </div>
                <!-- Barra de progreso del expediente -->
                <div class="mt-3">
                    <div class="d-flex justify-content-between mb-1">
                        <small class="text-muted">Completitud del expediente</small>
                        <small class="text-muted">${datos.porcentaje_completitud}%</small>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar ${datos.porcentaje_completitud === 100 ? 'bg-success' : 'bg-warning'}" 
                             role="progressbar" 
                             style="width: ${datos.porcentaje_completitud}%" 
                             aria-valuenow="${datos.porcentaje_completitud}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Renderizar datos personales
     */
    const renderDatosPersonales = () => {
        const datos = expediente.datos_personales;
        
        document.getElementById('datos-personales-content').innerHTML = `
            <div class="col-12 mb-3">
                <button class="btn btn-primary btn-sm" data-accion="ExpedienteView.abrirModalPersonales">
                    <i class="bi bi-pencil me-2"></i>Editar Datos de Contacto
                </button>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-person-badge me-2"></i>Información Personal</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <tbody>
                                <tr>
                                    <th style="width: 40%">CURP:</th>
                                    <td>${esc(datos.curp)}</td>
                                </tr>
                                <tr>
                                    <th>Fecha de Nacimiento:</th>
                                    <td>${formatDate(datos.fecha_nacimiento)} (${datos.edad || calcularEdad(datos.fecha_nacimiento)} años)</td>
                                </tr>
                                <tr>
                                    <th>Estado Civil:</th>
                                    <td>${esc(datos.estado_civil || 'No especificado')}</td>
                                </tr>
                                <tr>
                                    <th>Municipio Nacimiento:</th>
                                    <td>${esc(datos.municipio_nacimiento || datos.lugar_nacimiento_municipio || 'No especificado')}</td>
                                </tr>
                                <tr>
                                    <th>Estado Nacimiento:</th>
                                    <td>${esc(datos.estado_nacimiento || datos.lugar_nacimiento_estado || 'No especificado')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-telephone me-2"></i>Contacto</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <tbody>
                                <tr>
                                    <th style="width: 40%">Correo Institucional:</th>
                                    <td>${esc(datos.correo_institucional)}</td>
                                </tr>
                                <tr>
                                    <th>Correo Personal:</th>
                                    <td>${esc(datos.correo_personal || 'No registrado')}</td>
                                </tr>
                                <tr>
                                    <th>Celular:</th>
                                    <td>${esc(datos.celular || 'No registrado')}</td>
                                </tr>
                                <tr>
                                    <th>Teléfono Emergencia:</th>
                                    <td>${esc(datos.telefono_emergencia || 'No registrado')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-geo-alt me-2"></i>Domicilio</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <tbody>
                                <tr>
                                    <th style="width: 40%">Domicilio:</th>
                                    <td>${esc(datos.domicilio_completo || construirDomicilio(datos) || 'No registrado')}</td>
                                </tr>
                                <tr>
                                    <th>Municipio:</th>
                                    <td>${esc(datos.municipio || datos.domicilio_municipio || 'No registrado')}</td>
                                </tr>
                                <tr>
                                    <th>Estado:</th>
                                    <td>${esc(datos.estado || datos.domicilio_estado || 'No registrado')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Información Adicional</h6>
                    </div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <tbody>
                                <tr>
                                    <th style="width: 40%">Representante Indígena:</th>
                                    <td>${datos.representativo_indigena ? 'Sí' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Habla Lengua Indígena:</th>
                                    <td>${datos.habla_lengua_indigena ? `Sí (${esc(datos.lengua_indigena || 'No especificada')})` : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Tiene Hijos:</th>
                                    <td>${datos.tiene_hijos ? `Sí (${esc(datos.numero_hijos)})` : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Embarazada:</th>
                                    <td>${datos.embarazada ? 'Sí' : 'No'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
    };
    
    /**
     * Renderizar información académica
     */
    const renderAcademico = () => {
            const academico = expediente.rendimiento_academico;
            const promedios = expediente.promedios_semestre;
            
            // Calcular promedio general si no viene del backend
            let promedioGeneral = 'N/A';
            if (promedios && promedios.length > 0) {
                const suma = promedios.reduce((acc, p) => acc + parseFloat(p.promedio), 0);
                promedioGeneral = (suma / promedios.length).toFixed(2);
            } else if (academico && academico.promedio_general) {
                promedioGeneral = academico.promedio_general;
            }
            
            let academicoHTML = '';
            
            if (academico) {
                academicoHTML = `
                    <div class="card mb-3">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-mortarboard me-2"></i>Rendimiento Académico</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h2 class="text-primary mb-0">${promedioGeneral}</h2>
                                        <small class="text-muted">Promedio General</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="mb-0">${esc(academico.promedio_media_superior || academico.promedio_medio_superior || 'N/A')}</h4>
                                        <small class="text-muted">Promedio Media Superior</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <span class="badge ${academico.situacion_academica === 'Regular' ? 'bg-success' : 'bg-warning'} fs-6">
                                            ${esc(academico.situacion_academica || 'No especificado')}
                                        </span>
                                        <br><small class="text-muted">Situación</small>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-md-12">
                                    <p class="mb-1"><strong>Escuela de Procedencia:</strong> ${esc(academico.escuela_procedencia || 'No registrada')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Promedios por semestre
            let promediosHTML = '';
            const puedeEliminar = Auth.isAdmin() || Auth.isDocente();
            if (promedios && promedios.length > 0) {
            promediosHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Historial de Promedios</h6>
                        <button class="btn btn-primary btn-sm" data-accion="ExpedienteView.abrirModalCalificacion">
                            <i class="bi bi-plus-circle me-2"></i>Agregar Calificación
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm table-striped">
                                <thead>
                                    <tr>
                                        <th>Semestre</th>
                                        <th>Promedio</th>
                                        <th>Fecha Registro</th>
                                        ${puedeEliminar ? '<th class="text-center">Acciones</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${promedios.map(p => `
                                        <tr>
                                            <td>${esc(p.numero_semestre)}°</td>
                                            <td>
                                                <strong class="${p.promedio >= 8 ? 'text-success' : p.promedio >= 7 ? 'text-warning' : 'text-danger'}">
                                                    ${esc(p.promedio)}
                                                </strong>
                                            </td>
                                            <td>${formatDate(p.fecha_registro)}</td>
                                            ${puedeEliminar ? `
                                                <td class="text-center">
                                                    <button 
                                                        class="btn btn-sm btn-outline-danger" 
                                                        data-accion="ExpedienteView.eliminarCalificacion" data-args="${Acciones.args(p.numero_semestre)}"
                                                        title="Eliminar calificación"
                                                    >
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            ` : ''}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            promediosHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Historial de Promedios</h6>
                        <button class="btn btn-primary btn-sm" data-accion="ExpedienteView.abrirModalCalificacion">
                            <i class="bi bi-plus-circle me-2"></i>Agregar Calificación
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info mb-0">
                            <i class="bi bi-info-circle me-2"></i>
                            No hay calificaciones registradas por semestre
                        </div>
                    </div>
                </div>
            `;
        }
        // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
            document.getElementById('academico-content').innerHTML = academicoHTML + promediosHTML;
        };
    
    /**
     * Renderizar familiares
     */
    const renderFamiliares = () => {
        const familiares = expediente.familiares;
        
        let content = '';
        
        if (familiares && familiares.length > 0) {
            content = `
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="bi bi-people me-2"></i>Contactos Familiares</h6>
                    </div>
                    <div class="card-body">
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
                                    ${familiares.map(f => `
                                        <tr>
                                            <td><span class="badge bg-primary">${esc(f.tipo_familiar || 'Familiar')}</span></td>
                                            <td>${esc(f.nombre_completo || f.nombre)}</td>
                                            <td>${esc(f.telefono || 'No registrado')}</td>
                                            <td>${esc(f.ocupacion || 'No registrada')}</td>
                                            <td>
                                                ${f.es_tutor ? '<i class="bi bi-check-circle-fill text-success"></i> Sí' : '<i class="bi bi-x-circle-fill text-muted"></i> No'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No hay contactos familiares registrados
                </div>
            `;
        }
        
        document.getElementById('familiares-content').innerHTML = content;
    };
    
    /**
     * Renderizar incidentes
     */
    const renderIncidentes = () => {
        const incidentes = expediente.incidentes;
        
        let content = '';
        
        if (incidentes && incidentes.length > 0) {
            content = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Registro de Incidentes</h6>
                        <button class="btn btn-primary btn-sm" data-accion="ExpedienteView.abrirModalIncidente">
                            <i class="bi bi-plus-circle me-2"></i>Nuevo Incidente
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Docente Asignado</th>
                                        <th width="120">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${incidentes.map(i => `
                                        <tr>
                                            <td>
                                                <small>${Utils.formatDate(i.fecha_incidente)}</small>
                                            </td>
                                            <td>
                                                <span class="badge bg-info">${esc(i.tipo_incidente)}</span>
                                            </td>
                                            <td>
                                                <small>${esc(i.descripcion.length > 50 ? i.descripcion.substring(0, 50) + '...' : i.descripcion)}</small>
                                            </td>
                                            <td>
                                                <span class="badge bg-${getEstadoBadgeClass(i.estado_incidente)}">
                                                    ${esc(i.estado_incidente || 'Abierto')}
                                                </span>
                                            </td>
                                            <td>
                                                <small>${(i.reportado_por || i.nombre_docente) ? esc(i.reportado_por || i.nombre_docente) : '<em class="text-muted">Sin asignar</em>'}</small>
                                            </td>
                                            <td>
                                                <div class="btn-group btn-group-sm" role="group">
                                                    <button 
                                                        class="btn btn-outline-primary" 
                                                        data-accion="ExpedienteView.abrirModalGestionIncidente" data-args="${Acciones.args(i.id_incidente, i.estado_incidente || 'Abierto', i.id_docente || null)}"
                                                        title="Gestionar incidente">
                                                        <i class="bi bi-gear"></i>
                                                    </button>
                                                    <button 
                                                        class="btn btn-outline-danger" 
                                                        data-accion="ExpedienteView.eliminarIncidente" data-args="${Acciones.args(i.id_incidente)}"
                                                        title="Eliminar incidente">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Registro de Incidentes</h6>
                        <button class="btn btn-primary btn-sm" data-accion="ExpedienteView.abrirModalIncidente">
                            <i class="bi bi-plus-circle me-2"></i>Nuevo Incidente
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-success mb-0">
                            <i class="bi bi-check-circle me-2"></i>
                            No hay incidentes registrados
                        </div>
                    </div>
                </div>
            `;
        }
        // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
        document.getElementById('incidentes-content').innerHTML = content;
    };
    
    /**
     * Abrir modal para editar datos personales
     */
    const abrirModalPersonales = () => {
        const datos = expediente.datos_personales;
        
        // Cargar datos actuales
        document.getElementById('edit-celular').value = datos.celular || '';
        document.getElementById('edit-tel-emergencia').value = datos.telefono_emergencia || '';
        document.getElementById('edit-correo-personal').value = datos.correo_personal || '';
        document.getElementById('edit-estado-civil').value = datos.estado_civil || '';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalEditarPersonales'));
        modal.show();
    };
    
    /**
     * Guardar datos personales editados
     */
    
    const guardarDatosPersonales = async () => {
        try {
            const datos = {
                celular: document.getElementById('edit-celular').value,
                telefono_emergencia: document.getElementById('edit-tel-emergencia').value,
                correo_personal: document.getElementById('edit-correo-personal').value,
                estado_civil: document.getElementById('edit-estado-civil').value
            };
            
            const response = await API.put(`/expedientes/${idAlumno}/datos-personales`, datos);
            
            if (response.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarPersonales'));
                modal.hide();
                
                // Mostrar notificación
                showNotification('Datos actualizados correctamente', 'success');
                
                // Recargar expediente
                await cargarExpediente();
            }
            
        } catch (error) {
            console.error('Error al guardar datos:', error);
            showNotification('Error al guardar los datos: ' + error.message, 'error');
        }
    };
    
    /**
     * Abrir modal para agregar calificación
     */
    const abrirModalCalificacion = () => {
        // Limpiar formulario
        document.getElementById('form-calificacion').reset();
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalCalificacion'));
        modal.show();
    };
    
    /**
     * Guardar nueva calificación
     */
    const guardarCalificacion = async () => {
        try {
            const form = document.getElementById('form-calificacion');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const datos = {
                numero_semestre: parseInt(document.getElementById('cal-semestre').value),
                promedio: parseFloat(document.getElementById('cal-promedio').value)
            };
            
            const response = await API.post(`/expedientes/${idAlumno}/calificaciones`, datos);
            
            if (response.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalCalificacion'));
                modal.hide();
                
                // Mostrar notificación
                showNotification('Calificación registrada correctamente', 'success');
                
                // Recargar expediente
                await cargarExpediente();
            }
            
        } catch (error) {
            console.error('Error al guardar calificación:', error);
            showNotification('Error al guardar la calificación: ' + error.message, 'error');
        }
    };
    
    /**
     * Abrir modal para agregar incidente
     */
    const abrirModalIncidente = async () => {
        try {
            // Cargar lista de docentes
            const response = await API.get('/expedientes/docentes');
            
            if (!response.success) {
                Alert.error('Error al cargar lista de docentes');
                return;
            }
            
            const docentes = response.data;
            
            // Limpiar formulario si existe
            const formExistente = document.getElementById('form-incidente');
            if (formExistente) {
                formExistente.reset();
            }
            
            // Establecer fecha actual por defecto
            const today = new Date().toISOString().split('T')[0];
            
            // Crear modal dinámicamente con los campos nuevos
            const modalHTML = `
                <div class="modal fade" id="modalIncidenteNuevo" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title">
                                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                    Registrar Nuevo Incidente
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="form-incidente-nuevo">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label"><strong>Tipo de Incidente</strong> *</label>
                                            <select class="form-select" id="inc-tipo-nuevo" required>
                                                <option value="">Seleccionar tipo...</option>
                                                <option value="Académico"> Académico</option>
                                                <option value="Disciplinario"> Disciplinario</option>
                                                <option value="Salud"> Salud</option>
                                                <option value="Asistencia"> Asistencia</option>
                                                <option value="Conductual"> Conductual</option>
                                                <option value="Otro"> Otro</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label"><strong>Fecha del Incidente</strong> *</label>
                                            <input type="date" class="form-control" id="inc-fecha-nuevo" 
                                                value="${today}" max="${today}" required>
                                            <small class="text-muted">La fecha no puede ser futura</small>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label"><strong>Estado Inicial</strong></label>
                                            <select class="form-select" id="inc-estado-nuevo">
                                                <option value="Abierto" selected> Abierto</option>
                                                <option value="En seguimiento"> En seguimiento</option>
                                                <option value="Resuelto"> Resuelto</option>
                                                <option value="Cerrado"> Cerrado</option>
                                            </select>
                                            <small class="text-muted">Por defecto: Abierto</small>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label"><strong>Docente Responsable</strong></label>
                                            <select class="form-select" id="inc-docente-nuevo">
                                                <option value="">Sin asignar (Por el momento)</option>
                                                ${docentes.map(d => `
                                                    <option value="${d.id_docente}">
                                                        ${esc(d.nombre_completo)}${esc(d.area_asignada ? ' - ' + d.area_asignada : '')}
                                                    </option>
                                                `).join('')}
                                            </select>
                                            <small class="text-muted">Opcional: Asignar responsable del seguimiento</small>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label"><strong>Descripción del Incidente</strong> *</label>
                                        <textarea class="form-control" id="inc-descripcion-nuevo" rows="4" 
                                                placeholder="Describe detalladamente el incidente..." required></textarea>
                                        <small class="text-muted">Proporciona todos los detalles relevantes</small>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-circle me-2"></i>Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" data-accion="ExpedienteView.guardarIncidenteNuevo">
                                    <i class="bi bi-save me-2"></i>Registrar Incidente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remover modal anterior si existe
            const oldModal = document.getElementById('modalIncidenteNuevo');
            if (oldModal) oldModal.remove();
            
            // Agregar nuevo modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalIncidenteNuevo'));
            modal.show();
            
        } catch (error) {
            console.error('Error al abrir modal de incidente:', error);
            Alert.error('Error al cargar el formulario');
        }
    };
    
    /**
     * Guardar nuevo incidente
     */
    const guardarIncidente = async () => {
        try {
            const form = document.getElementById('form-incidente');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const datos = {
                tipo_incidente: document.getElementById('inc-tipo').value,
                fecha_incidente: document.getElementById('inc-fecha').value,
                descripcion: document.getElementById('inc-descripcion').value
            };
            
            const response = await API.post(`/expedientes/${idAlumno}/incidentes`, datos);
            
            if (response.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalIncidente'));
                modal.hide();
                
                // Mostrar notificación
                showNotification('Incidente registrado correctamente', 'success');
                
                // Recargar expediente
                await cargarExpediente();
            }
            
        } catch (error) {
            console.error('Error al guardar incidente:', error);
            showNotification('Error al guardar el incidente: ' + error.message, 'error');
        }
    };
    
    /**
     * Formatear fecha
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    /**
     * Calcular edad a partir de fecha de nacimiento
     */
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };
    
    /**
     * Construir domicilio completo
     */
    const construirDomicilio = (datos) => {
        const partes = [];
        if (datos.domicilio_calle) partes.push(datos.domicilio_calle);
        if (datos.domicilio_numero) partes.push(datos.domicilio_numero);
        if (datos.domicilio_colonia) partes.push(datos.domicilio_colonia);
        return partes.length > 0 ? partes.join(', ') : null;
    };
    
    /**
     * Obtener clase de badge según el status
     */
    const getStatusBadgeClass = (status) => {
        if (!status) return 'bg-secondary';
        return status === 'COMPLETO' || status === 'Completo' ? 'bg-success' : 'bg-warning';
    };
    
    /**
     * Mostrar notificación
     */
    const showNotification = (message, type = 'info') => {
        // Crear elemento de notificación
        const notificationHTML = `
            <div class="alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${esc(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Insertar en el body
        const temp = document.createElement('div');
        temp.innerHTML = notificationHTML;
        document.body.appendChild(temp.firstElementChild);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert');
            if (alerts.length > 0) {
                alerts[alerts.length - 1].remove();
            }
        }, 5000);
    };


    /**
     * Descargar expediente en PDF
     */
    const descargarExpedientePDF = async () => {
        try {
            Alert.info('Generando expediente en PDF...');
            
            const token = localStorage.getItem('token');
            const url = `${API.BASE_URL}/reportes/expediente/${idAlumno}/pdf`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el PDF');
            }
            
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Expediente_${expediente.datos_personales.matricula}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
            
            Alert.success('Expediente descargado correctamente');
            
        } catch (error) {
            console.error('Error al descargar expediente:', error);
            Alert.error('Error al generar el expediente en PDF');
        }
    };

    /**
     * Helper: Formatear fecha local
     */
    const formatDateLocal = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    /**
     * Guardar nuevo incidente - MEJORADO
     */
    const guardarIncidenteNuevo = async () => {
        try {
            const form = document.getElementById('form-incidente-nuevo');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const tipo_incidente = document.getElementById('inc-tipo-nuevo').value;
            const fecha_incidente = document.getElementById('inc-fecha-nuevo').value;
            const descripcion = document.getElementById('inc-descripcion-nuevo').value;
            const estado_incidente = document.getElementById('inc-estado-nuevo').value;
            const id_docente = document.getElementById('inc-docente-nuevo').value;
            
            const datos = {
                tipo_incidente,
                fecha_incidente,
                descripcion,
                estado_incidente
            };
            
            // Solo agregar id_docente si tiene valor
            if (id_docente && id_docente !== '') {
                datos.id_docente = parseInt(id_docente);
            }
            
            const response = await API.post(`/expedientes/${idAlumno}/incidentes`, datos);
            
            if (response.success) {
                Alert.success('Incidente registrado correctamente');
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalIncidenteNuevo'));
                if (modal) {
                    modal.hide();
                    // Remover modal del DOM
                    document.getElementById('modalIncidenteNuevo').remove();
                }
                
                // Recargar expediente
                await cargarExpediente();
            } else {
                Alert.error(response.message || 'Error al registrar incidente');
            }
            
        } catch (error) {
            console.error('Error al guardar incidente:', error);
            Alert.error('Error al registrar el incidente');
        }
    };

    
    // ============================================
    // FUNCION PARA ESTADO DE INCIDENTE
    // ============================================
    const getEstadoBadgeClass = (estado) => {
        const clases = {
            'Abierto': 'danger',
            'En seguimiento': 'warning',
            'Resuelto': 'info',
            'Cerrado': 'success'
        };
        return clases[estado] || 'secondary';
    };

    
    // ============================================
    // FUNCION PARA MODAL DE GESTIONAR INCIDENTE
    // ============================================
    const abrirModalGestionIncidente = async (id_incidente, estado_actual, id_docente_actual) => {
        // Cargar lista de docentes
        try {
            const response = await API.get('/expedientes/docentes');
            
            if (!response.success) {
                Alert.error('Error al cargar lista de docentes');
                return;
            }
            
            const docentes = response.data;
            
            // Crear contenido del modal
            const modalContent = `
                <div class="mb-3">
                    <label class="form-label"><strong>Estado del Incidente</strong></label>
                    <select class="form-select" id="gestion-estado">
                        <option value="Abierto" ${estado_actual === 'Abierto' ? 'selected' : ''}>Abierto</option>
                        <option value="En seguimiento" ${estado_actual === 'En seguimiento' ? 'selected' : ''}>En seguimiento</option>
                        <option value="Resuelto" ${estado_actual === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                        <option value="Cerrado" ${estado_actual === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                    </select>
                    <small class="text-muted">Cambia el estado según el progreso del incidente</small>
                </div>
                
                <div class="mb-3">
                    <label class="form-label"><strong>Docente Asignado</strong></label>
                    <select class="form-select" id="gestion-docente">
                        <option value="">Sin asignar</option>
                        ${docentes.map(d => `
                            <option value="${d.id_docente}" ${id_docente_actual == d.id_docente ? 'selected' : ''}>
                                ${esc(d.nombre_completo)}${esc(d.area_asignada ? ' - ' + d.area_asignada : '')}
                            </option>
                        `).join('')}
                    </select>
                    <small class="text-muted">Asigna un docente responsable del seguimiento</small>
                </div>
            `;
            
            // Crear modal dinámicamente
            const modalHtml = `
                <div class="modal fade" id="modalGestionIncidente" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-gear me-2"></i>Gestionar Incidente
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${modalContent}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Cancelar
                                </button>
                                <button type="button" class="btn btn-primary" data-accion="ExpedienteView.guardarGestionIncidente" data-args="${Acciones.args(id_incidente)}">
                                    <i class="bi bi-save me-2"></i>Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remover modal anterior si existe
            const oldModal = document.getElementById('modalGestionIncidente');
            if (oldModal) oldModal.remove();
            
            // Agregar nuevo modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalGestionIncidente'));
            modal.show();
            
        } catch (error) {
            console.error('Error al abrir modal de gestión:', error);
            Alert.error('Error al cargar el formulario de gestión');
        }
    };


    // ============================================
    // FUNCION PARA GUARDAR GESTION DE INCIDENTE
    // ============================================
const guardarGestionIncidente = async (id_incidente) => {
    try {
        const estado_incidente = document.getElementById('gestion-estado').value;
        const id_docente = document.getElementById('gestion-docente').value;
        
        const data = {
            estado_incidente: estado_incidente
        };
        
        if (id_docente && id_docente !== '') {
            data.id_docente = parseInt(id_docente);
        } else {
            data.id_docente = null;
        }
        
        console.log('Enviando datos:', data);
        
        const response = await API.put(
            `/expedientes/${expediente.datos_personales.id_alumno}/incidentes/${id_incidente}`,
            data
        );
        
        if (response.success) {
            Alert.success('Incidente actualizado correctamente');
            
            // CERRAR MODAL CORRECTAMENTE
            const modalElement = document.getElementById('modalGestionIncidente');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
                
                // Limpiar después del cierre
                modalElement.addEventListener('hidden.bs.modal', function () {
                    modalElement.remove();
                    // Limpiar backdrops
                    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style.removeProperty('overflow');
                    document.body.style.removeProperty('padding-right');
                }, { once: true });
            }
            
            // Recargar expediente
            await cargarExpediente();
        } else {
            Alert.error(response.message || 'Error al actualizar incidente');
        }
        
    } catch (error) {
        console.error('Error al guardar gestión de incidente:', error);
        Alert.error('Error al actualizar el incidente: ' + error.message);
    }
};

// ============================================
// ELIMINAR INCIDENTE
// ============================================

const eliminarIncidente = async (idIncidente) => {
    const confirmado = confirm(
        '¿Estás seguro de eliminar este incidente?\n\n' +
        'Esta acción no se puede deshacer.'
    );
    
    if (!confirmado) return;
    
    try {
        const response = await API.delete(`/expedientes/${idAlumno}/incidentes/${idIncidente}`);
        
        if (response.success) {
            Alert.success('Incidente eliminado correctamente');
            
            // Recargar expediente para actualizar la vista
            await cargarExpediente();
        }
        
    } catch (error) {
        console.error('Error al eliminar incidente:', error);
        Alert.error('Error al eliminar el incidente');
    }
};





/**
 * 1. RENDERIZAR DATOS DE SALUD
 */
const renderSalud = () => {
    const salud = expediente.datos_salud;
    
    if (!salud) {
        document.getElementById('salud-content').innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No hay datos de salud registrados
                </div>
            </div>
        `;
        return;
    }
    
    document.getElementById('salud-content').innerHTML = `
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-heart-pulse me-2"></i>Datos de Salud</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="mb-3">
                                <label class="text-muted small">Tipo de Sangre</label>
                                <div class="fw-bold fs-5 text-danger">${esc(salud.tipo_sangre || 'No especificado')}</div>
                            </div>
                        </div>
                        <div class="col-md-9">
                            <div class="mb-3">
                                <label class="text-muted small">Afiliación de Seguro Médico</label>
                                <div class="fw-bold">${esc(salud.afiliacion_seguro_medico || 'No especificado')}</div>
                            </div>

                            <div class="mb-3">
                                <label class="text-muted small">Número de Seguro Social (NSS)</label>
                                <div class="fw-bold">${esc(salud.numero_seguro_social || 'No registrado')}</div>
                            </div>
                        </div>
                    </div>
                    
                    <hr>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="text-muted small">Alergias</label>
                                <div>${esc(salud.alergias || 'Ninguna')}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="text-muted small">Enfermedades Crónicas</label>
                                <div>
                                    ${salud.tiene_enfermedad ? 
                                        `<span class="badge bg-warning">Sí: ${esc(salud.nombre_enfermedad)}</span>` : 
                                        '<span class="badge bg-success">No</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
   // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};

/**
 *  RENDERIZAR DESEMPEÑO ACADÉMICO
 */
const renderDesempeno = () => {
    const desempeno = expediente.desempeno_academico;
    
    if (!desempeno) {
        document.getElementById('desempeno-content').innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No hay datos de desempeño registrados
                </div>
            </div>
        `;
        return;
    }
    
    document.getElementById('desempeno-content').innerHTML = `
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-people-fill me-2"></i>Actividades Extracurriculares</h6>
                </div>
                <div class="card-body">
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <th style="width: 40%">Club Inscrito:</th>
                                <td>${esc(desempeno.club_inscrito || 'Ninguno')}</td>
                            </tr>
                            <tr>
                                <th>Eventos Participados:</th>
                                <td>${esc(desempeno.eventos_participados || 'Ninguno')}</td>
                            </tr>
                            <tr>
                                <th>Participó como Ponente:</th>
                                <td>
                                    ${desempeno.participo_como_ponente ? 
                                        '<span class="badge bg-success">Sí</span>' : 
                                        '<span class="badge bg-secondary">No</span>'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-globe-americas me-2"></i>Interés en Intercambio</h6>
                </div>
                <div class="card-body">
                    <p>${esc(desempeno.interes_intercambio || 'No ha expresado interés')}</p>
                </div>
            </div>
        </div>
    `;
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};

/**
 *  RENDERIZAR HABILIDADES
 */
const renderHabilidades = () => {
    const habilidades = expediente.habilidades || [];
    
    if (habilidades.length === 0) {
        document.getElementById('habilidades-content').innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay habilidades registradas
                </div>
            </div>
        `;
        return;
    }
    
    const habilidadesHTML = habilidades.map(h => {
        const nivelColor = {
            'Básico': 'secondary',
            'Intermedio': 'primary',
            'Avanzado': 'success',
            'Experto': 'warning'
        };
        
        return `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">${esc(h.nombre_habilidad)}</h6>
                                <small class="text-muted">${esc(h.actitud_habilidad || 'Sin descripción')}</small>
                            </div>
                            <span class="badge bg-${nivelColor[h.nivel] || 'secondary'}">
                                ${esc(h.nivel || 'No especificado')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('habilidades-content').innerHTML = `
        <div class="col-12 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi bi-gear-fill me-2"></i>
                    Habilidades Registradas (${habilidades.length})
                </h5>
            </div>
        </div>
        ${habilidadesHTML}
    `;
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};

/**
 *  RENDERIZAR CERTIFICACIONES
 */
const renderCertificaciones = () => {
    const certificaciones = expediente.certificaciones || [];
    
    if (certificaciones.length === 0) {
        document.getElementById('certificaciones-content').innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay certificaciones registradas
                </div>
            </div>
        `;
        return;
    }
    
    const certificacionesHTML = certificaciones.map(cert => {
        // Calcular estado de la certificación
        let estadoBadge = '';
        let estadoColor = '';
        
        if (!cert.fecha_vencimiento) {
            estadoBadge = 'Sin vencimiento';
            estadoColor = 'secondary';
        } else {
            const hoy = new Date();
            const vencimiento = new Date(cert.fecha_vencimiento);
            
            if (vencimiento < hoy) {
                estadoBadge = 'Vencida';
                estadoColor = 'danger';
            } else {
                const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 90) {
                    estadoBadge = `Por vencer (${diasRestantes} días)`;
                    estadoColor = 'warning';
                } else {
                    estadoBadge = 'Vigente';
                    estadoColor = 'success';
                }
            }
        }
        
        return `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0">${esc(cert.nombre_certificacion)}</h6>
                            <span class="badge bg-${estadoColor}">${estadoBadge}</span>
                        </div>
                        <p class="text-muted small mb-2">
                            <i class="bi bi-building me-1"></i>
                            ${esc(cert.institucion_emisora || 'No especificada')}
                        </p>
                        <div class="small">
                            <div><strong>Obtenida:</strong> ${formatDate(cert.fecha_obtencion)}</div>
                            ${cert.fecha_vencimiento ? 
                                `<div><strong>Vence:</strong> ${formatDate(cert.fecha_vencimiento)}</div>` : 
                                ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('certificaciones-content').innerHTML = `
        <div class="col-12 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi bi-award-fill me-2"></i>
                    Certificaciones (${certificaciones.length})
                </h5>
            </div>
        </div>
        ${certificacionesHTML}
    `;
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};

/**
 *  RENDERIZAR DATOS SOCIOECONÓMICOS
 */
const renderSocioeconomicos = () => {
    const socio = expediente.datos_socioeconomicos;
    
    if (!socio) {
        document.getElementById('socioeconomicos-content').innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    No hay datos socioeconómicos registrados
                </div>
            </div>
        `;
        return;
    }
    
    document.getElementById('socioeconomicos-content').innerHTML = `
        <div class="col-md-6">
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-wallet2 me-2"></i>Situación Económica</h6>
                </div>
                <div class="card-body">
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <th style="width: 50%">Recursos Económicos:</th>
                                <td>${esc(socio.recursos_economicos || 'No especificado')}</td>
                            </tr>
                            <tr>
                                <th>Dependencia Económica:</th>
                                <td>${esc(socio.dependencia_economica || 'No especificado')}</td>
                            </tr>
                            <tr>
                                <th>Alguien Depende de Ti:</th>
                                <td>
                                    ${socio.alguien_depende_ti ? 
                                        '<span class="badge bg-warning">Sí</span>' : 
                                        '<span class="badge bg-success">No</span>'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-briefcase-fill me-2"></i>Situación Laboral</h6>
                </div>
                <div class="card-body">
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <th style="width: 50%">Trabaja:</th>
                                <td>
                                    ${socio.trabaja ? 
                                        '<span class="badge bg-primary">Sí</span>' : 
                                        '<span class="badge bg-secondary">No</span>'}
                                </td>
                            </tr>
                            ${socio.trabaja ? `
                            <tr>
                                <th>Lugar de Trabajo:</th>
                                <td>${esc(socio.lugar_trabajo || 'No especificado')}</td>
                            </tr>
                            <tr>
                                <th>Horario de Trabajo:</th>
                                <td>${esc(socio.horario_trabajo || 'No especificado')}</td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-house-door-fill me-2"></i>Vivienda</h6>
                </div>
                <div class="card-body">
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <th style="width: 50%">Renta Fuera del Domicilio:</th>
                                <td>
                                    ${socio.renta_fuera_domicilio ? 
                                        '<span class="badge bg-info">Sí</span>' : 
                                        '<span class="badge bg-secondary">No</span>'}
                                </td>
                            </tr>
                            ${socio.renta_fuera_domicilio && socio.domicilio_renta ? `
                            <tr>
                                <th>Domicilio de Renta:</th>
                                <td>
                                    ${esc(socio.domicilio_renta.calle || '')} 
                                    ${esc(socio.domicilio_renta.numero || '')}<br>
                                    ${esc(socio.domicilio_renta.colonia || '')}, 
                                    ${esc(socio.domicilio_renta.municipio || '')}, 
                                    ${esc(socio.domicilio_renta.estado || '')}
                                </td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};





// ============================================
// RENDER: BECAS
// ============================================

const renderBecas = async () => {
    try {
        const response = await API.get(`/expedientes/${idAlumno}/becas`);
        
        if (response.success) {
            const becas = response.data;
            
            let html = `
                <div class="card">
                    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="bi bi-currency-dollar me-2"></i>Becas</h5>
                        <button class="btn btn-light btn-sm" data-accion="ExpedienteView.mostrarModalBeca">
                            <i class="bi bi-plus-circle me-1"></i>Agregar Beca
                        </button>
                    </div>
                    <div class="card-body">
            `;
            
            if (becas.length === 0) {
                html += `
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay becas registradas
                    </div>
                `;
            } else {
                html += '<div class="row">';
                becas.forEach(beca => {
                    html += `
                        <div class="col-md-6 mb-3">
                            <div class="card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <h6 class="card-title">
                                                ${esc(beca.nombre_beca)}
                                                ${beca.activa ? '<span class="badge bg-success ms-2">Activa</span>' : '<span class="badge bg-secondary ms-2">Inactiva</span>'}
                                            </h6>
                                            <p class="card-text small mb-1">
                                                <strong>Inicio:</strong> ${beca.fecha_inicio ? new Date(beca.fecha_inicio).toLocaleDateString('es-MX') : 'No especificado'}
                                            </p>
                                            <p class="card-text small mb-0">
                                                <strong>Fin:</strong> ${beca.fecha_fin ? new Date(beca.fecha_fin).toLocaleDateString('es-MX') : 'No especificado'}
                                            </p>
                                        </div>
                                        <div class="btn-group-vertical">
                                            <button class="btn btn-sm btn-outline-primary" data-accion="ExpedienteView.editarBeca" data-args="${Acciones.args(beca.id_beca)}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" data-accion="ExpedienteView.eliminarBeca" data-args="${Acciones.args(beca.id_beca)}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            html += `
                    </div>
                </div>
                
                <!-- Modal Beca -->
                <div class="modal fade" id="modalBeca" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-success text-white">
                                <h5 class="modal-title" id="modal-beca-title">Agregar Beca</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="form-beca">
                                    <input type="hidden" id="beca-id">
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Nombre de la Beca *</label>
                                        <input type="text" class="form-control" id="beca-nombre" required>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Fecha de Inicio</label>
                                            <input type="date" class="form-control" id="beca-fecha-inicio">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Fecha de Fin</label>
                                            <input type="date" class="form-control" id="beca-fecha-fin">
                                        </div>
                                    </div>
                                    
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="beca-activa" checked>
                                        <label class="form-check-label" for="beca-activa">
                                            Beca actualmente activa
                                        </label>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-success" data-accion="ExpedienteView.guardarBeca">
                                    <i class="bi bi-save me-1"></i>Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('becas-content').innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error al cargar becas:', error);
        document.getElementById('becas-content').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error al cargar las becas
            </div>
        `;
    }
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};

// ============================================
// RENDER: MOVILIDAD
// ============================================

const renderMovilidad = async () => {
    try {
        const response = await API.get(`/expedientes/${idAlumno}/movilidad`);
        
        if (response.success) {
            const movilidades = response.data;
            
            let html = `
                <div class="card">
                    <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="bi bi-airplane me-2"></i>Movilidad Académica</h5>
                        <button class="btn btn-light btn-sm" data-accion="ExpedienteView.mostrarModalMovilidad">
                            <i class="bi bi-plus-circle me-1"></i>Agregar Movilidad
                        </button>
                    </div>
                    <div class="card-body">
            `;
            
            if (movilidades.length === 0) {
                html += `
                    <div class="alert alert-info mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay movilidades registradas
                    </div>
                `;
            } else {
                movilidades.forEach(m => {
                    html += `
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <h5 class="card-title">
                                            <i class="bi bi-airplane text-info me-2"></i>
                                            ${esc(m.nombre_programa)}
                                        </h5>
                                        ${m.lugar ? `<p class="mb-1"><strong>Lugar:</strong> ${esc(m.lugar)}</p>` : ''}
                                        <p class="mb-1">
                                            <strong>Periodo:</strong> 
                                            ${m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString('es-MX') : '?'} - 
                                            ${m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString('es-MX') : '?'}
                                        </p>
                                        ${m.relato_experiencia ? `
                                            <div class="mt-2">
                                                <strong>Experiencia:</strong>
                                                <p class="text-muted small">${esc(m.relato_experiencia)}</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="btn-group-vertical">
                                        <button class="btn btn-sm btn-outline-primary" data-accion="ExpedienteView.editarMovilidad" data-args="${Acciones.args(m.id_movilidad)}">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" data-accion="ExpedienteView.eliminarMovilidad" data-args="${Acciones.args(m.id_movilidad)}">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += `
                    </div>
                </div>
                
                <!-- Modal Movilidad -->
                <div class="modal fade" id="modalMovilidad" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-info text-white">
                                <h5 class="modal-title" id="modal-movilidad-title">Agregar Movilidad</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="form-movilidad">
                                    <input type="hidden" id="movilidad-id">
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Nombre del Programa *</label>
                                        <input type="text" class="form-control" id="movilidad-nombre" required>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Lugar</label>
                                        <input type="text" class="form-control" id="movilidad-lugar">
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Fecha de Inicio</label>
                                            <input type="date" class="form-control" id="movilidad-fecha-inicio">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Fecha de Fin</label>
                                            <input type="date" class="form-control" id="movilidad-fecha-fin">
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Relato de Experiencia</label>
                                        <textarea class="form-control" id="movilidad-relato" rows="4"></textarea>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-info" data-accion="ExpedienteView.guardarMovilidad">
                                    <i class="bi bi-save me-1"></i>Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('movilidad-content').innerHTML = html;
        }
        
    } catch (error) {
        console.error('Error al cargar movilidades:', error);
        document.getElementById('movilidad-content').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error al cargar las movilidades
            </div>
        `;
    }
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};


// ============================================
// RENDER: PRÁCTICAS PROFESIONALES (CON HISTORIAL)
// ============================================

const renderPracticasExpediente = async () => {
    const container = document.getElementById('practicas-content');
    
    // Mostrar loading inicial
    container.innerHTML = `
        <div class="text-center py-5" id="loading-practicas-expediente">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando prácticas...</p>
        </div>
    `;
    
    try {
        const response = await API.get(`/practicas/alumno/${idAlumno}`);
        
        if (response.success) {
            const practicas = response.data;
            
            let html = `
                <div class="card">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-briefcase me-2"></i>
                           Escuela de  Prácticas Profesionales - Historial Completo
                        </h5>
                        <button class="btn btn-light btn-sm" data-accion="ExpedienteView.abrirModalPracticaExpediente">
                            <i class="bi bi-plus-circle me-2"></i>Agregar Práctica
                        </button>
                    </div>
                    <div class="card-body">
            `;
            
            if (practicas.length === 0) {
                html += `
                    <div class="text-center py-5">
                        <i class="bi bi-briefcase fs-1 text-muted"></i>
                        <p class="text-muted mt-3">No hay prácticas profesionales registradas</p>
                        <button class="btn btn-primary" data-accion="ExpedienteView.abrirModalPracticaExpediente">
                            <i class="bi bi-plus-circle me-2"></i>Registrar Primera Práctica
                        </button>
                    </div>
                `;
            } else {
                html += `
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Periodo</th>
                                    <th>Escuela</th>
                                    <th>Nivel</th>
                                    <th>Ubicación</th>
                                    <th>Fechas</th>
                                    <th>Horas</th>
                                    <th>Estado</th>
                                    <th width="120">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                practicas.forEach(p => {
                    const fechaInicio = p.fecha_inicio ? 
                        new Date(p.fecha_inicio).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : 
                        'N/A';
                    const fechaFin = p.fecha_fin ? 
                        new Date(p.fecha_fin).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : 
                        'Actual';
                    
                    // Badge según situación
                    let badgeSituacion = '';
                    switch(p.situacion) {
                        case 'En curso':
                            badgeSituacion = '<span class="badge bg-success">En curso</span>';
                            break;
                        case 'Completada':
                            badgeSituacion = '<span class="badge bg-primary">Completada</span>';
                            break;
                        case 'Cancelada':
                            badgeSituacion = '<span class="badge bg-danger">Cancelada</span>';
                            break;
                        default:
                            badgeSituacion = '<span class="badge bg-secondary">N/A</span>';
                    }
                    
                    html += `
                        <tr>
                            <td><strong>${esc(p.periodo_escolar || 'N/A')}</strong><br><small class="text-muted">Sem ${esc(p.semestre_cursado)}°</small></td>
                            <td>
                                ${esc(p.nombre_escuela || 'N/A')}<br>
                                <small class="text-muted">CCT: ${esc(p.cct_escuela || 'N/A')}</small>
                            </td>
                            <td><span class="badge bg-info">${esc(p.nivel_educativo || 'N/A')}</span></td>
                            <td><small>${esc(p.municipio || '')}, ${esc(p.estado || '')}</small></td>
                            <td>
                                <small class="text-muted">
                                    ${fechaInicio} - ${fechaFin}
                                </small>
                            </td>
                            <td>${esc(p.horas_totales || 0)} hrs${p.calificacion_obtenida ? `<br><small>Cal: ${esc(p.calificacion_obtenida)}</small>` : ''}</td>
                            <td>${badgeSituacion}</td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" 
                                            data-accion="ExpedienteView.editarPracticaExpediente" data-args="${Acciones.args(p.id_practica)}" 
                                            title="Editar">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" 
                                            data-accion="ExpedienteView.eliminarPracticaExpediente" data-args="${Acciones.args(p.id_practica)}" 
                                            title="Eliminar">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                    
                    // Fila expandible con detalles
                    if (p.habilidades_desarrolladas || p.tutor_asignado || p.observaciones) {
                        html += `
                            <tr class="table-light">
                                <td colspan="8">
                                    <small>
                                        ${p.tutor_asignado ? `<strong>Tutor:</strong> ${esc(p.tutor_asignado)}` : ''}
                                        ${p.habilidades_desarrolladas ? `<br><strong>Habilidades:</strong> ${esc(p.habilidades_desarrolladas)}` : ''}
                                        ${p.observaciones ? `<br><strong>Observaciones:</strong> ${esc(p.observaciones)}` : ''}
                                    </small>
                                </td>
                            </tr>
                        `;
                    }
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
                
                ${renderModalPracticaExpediente()}
            `;
            
            container.innerHTML = html;
            
            // Event listeners del modal
            initPracticasEventListeners();
        }
        
    } catch (error) {
        console.error('Error al cargar prácticas profesionales:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error al cargar el historial de prácticas: ${esc(error.message)}
            </div>
        `;
    }
    // Deshabilitar botones al final
        if (expediente._es_invitado) {
            setTimeout(() => {
                InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
            }, 50);
        }
};




// ============================================
// RENDER MODAL DE PRÁCTICAS
// ============================================

const renderModalPracticaExpediente = () => {
    return `
        <div class="modal fade" id="modalPracticaExpediente" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="modalPracticaExpedienteTitle">Nueva Práctica Profesional</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-practica-expediente">
                            <input type="hidden" id="practica-expediente-id">
                            
                            <!-- Sección 1: Periodo y Semestre -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-calendar-event me-2"></i>Periodo Escolar</h6>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-expediente-periodo" class="form-label">Periodo Escolar *</label>
                                        <input type="text" class="form-control" id="practica-expediente-periodo" required
                                               placeholder="Ej: 2024-A, 2024-B">
                                        <small class="text-muted">Formato: AÑO-PERIODO (A=Enero-Junio, B=Agosto-Diciembre)</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-expediente-semestre" class="form-label">Semestre Cursado *</label>
                                        <input type="number" class="form-control" id="practica-expediente-semestre" required
                                               min="1" max="8" placeholder="Ej: 6">
                                    </div>
                                </div>
                            </div>

                            <!-- Sección 2: Escuela de Práctica -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-building me-2"></i>Escuela de Práctica</h6>
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label for="practica-expediente-escuela" class="form-label">Nombre de la Escuela *</label>
                                        <input type="text" class="form-control" id="practica-expediente-escuela" required
                                               placeholder="Nombre completo de la escuela">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-cct" class="form-label">CCT *</label>
                                        <input type="text" class="form-control" id="practica-expediente-cct" required
                                               placeholder="Clave de Centro de Trabajo" maxlength="15">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-nivel" class="form-label">Nivel Educativo *</label>
                                        <select class="form-select" id="practica-expediente-nivel" required>
                                            <option value="">Selecciona...</option>
                                            <option value="Preescolar">Preescolar</option>
                                            <option value="Primaria">Primaria</option>
                                            <option value="Secundaria">Secundaria</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-estado" class="form-label">Estado *</label>
                                        <select class="form-select" id="practica-expediente-estado" required>
                                            <option value="">Seleccionar estado...</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-municipio" class="form-label">Municipio *</label>
                                        <select class="form-select" id="practica-expediente-municipio" required disabled>
                                            <option value="">Seleccionar municipio...</option>
                                        </select>
                                    </div>

                                </div>
                            </div>

                            <!-- Sección 3: Periodo de Práctica -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-calendar-range me-2"></i>Periodo de Práctica</h6>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-fecha-inicio" class="form-label">Fecha de Inicio *</label>
                                        <input type="date" class="form-control" id="practica-expediente-fecha-inicio" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-fecha-fin" class="form-label">Fecha de Fin *</label>
                                        <input type="date" class="form-control" id="practica-expediente-fecha-fin" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-expediente-horas" class="form-label">Horas Totales</label>
                                        <input type="number" class="form-control" id="practica-expediente-horas"
                                               min="0" placeholder="Horas realizadas">
                                    </div>
                                </div>
                            </div>

                            <!-- Sección 4: Evaluación -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-clipboard-check me-2"></i>Evaluación</h6>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-expediente-tutor" class="form-label">Tutor Asignado</label>
                                        <input type="text" class="form-control" id="practica-expediente-tutor"
                                               placeholder="Nombre del tutor en la escuela">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="practica-expediente-calificacion" class="form-label">Calificación</label>
                                        <input type="number" class="form-control" id="practica-expediente-calificacion"
                                               min="0" max="10" step="0.1" placeholder="0-10">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="practica-expediente-situacion" class="form-label">Situación *</label>
                                        <select class="form-select" id="practica-expediente-situacion" required>
                                            <option value="En curso">En curso</option>
                                            <option value="Completada">Completada</option>
                                            <option value="Cancelada">Cancelada</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="practica-expediente-habilidades" class="form-label">Habilidades Desarrolladas</label>
                                    <textarea class="form-control" id="practica-expediente-habilidades" rows="3"
                                              placeholder="Describe las habilidades desarrolladas..."></textarea>
                                </div>
                            </div>

                            <!-- Sección 5: Seguimiento -->
                            <div class="mb-4">
                                <h6 class="text-primary"><i class="bi bi-clipboard-data me-2"></i>Seguimiento</h6>
                                
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="practica-expediente-reglamento">
                                    <label class="form-check-label" for="practica-expediente-reglamento">
                                        Sigue la orientación del reglamento
                                    </label>
                                </div>
                                
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="practica-expediente-incidentes">
                                    <label class="form-check-label" for="practica-expediente-incidentes">
                                        Tiene incidentes reportados
                                    </label>
                                </div>
                                
                                <div id="relato-incidentes-container-expediente" style="display: none;">
                                    <label for="practica-expediente-relato-incidentes" class="form-label">Relato de Incidentes</label>
                                    <textarea class="form-control" id="practica-expediente-relato-incidentes" rows="3"
                                              placeholder="Describe los incidentes ocurridos..."></textarea>
                                </div>
                                
                                <div class="mb-3 mt-3">
                                    <label for="practica-expediente-observaciones" class="form-label">Observaciones Generales</label>
                                    <textarea class="form-control" id="practica-expediente-observaciones" rows="3"
                                              placeholder="Observaciones adicionales..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-accion="ExpedienteView.guardarPracticaExpediente">
                            <i class="bi bi-save me-1"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    if (expediente._es_invitado) {
        setTimeout(() => {
            InvitadoUtils.deshabilitarBotonesEdicion('#datos-personales-content');
        }, 50);
    }
};


// ============================================
// EVENT LISTENERS DEL MODAL DE PRÁCTICAS
// ============================================

const initPracticasEventListeners = () => {
    // Mostrar/ocultar relato de incidentes
    const checkIncidentes = document.getElementById('practica-expediente-incidentes');
    if (checkIncidentes) {
        checkIncidentes.addEventListener('change', (e) => {
            document.getElementById('relato-incidentes-container-expediente').style.display = 
                e.target.checked ? 'block' : 'none';
        });
    }
};

// ============================================
// ABRIR MODAL PARA NUEVA PRÁCTICA
// ============================================

const abrirModalPracticaExpediente = () => {
    document.getElementById('modalPracticaExpedienteTitle').textContent = 'Nueva Práctica Profesional';
    document.getElementById('form-practica-expediente').reset();
    document.getElementById('practica-expediente-id').value = '';
    document.getElementById('practica-expediente-situacion').value = 'En curso';
    document.getElementById('relato-incidentes-container-expediente').style.display = 'none';
    if (!window.selectorPracticaExpediente) {
        window.selectorPracticaExpediente = new EstadoMunicipioSelector(
            'practica-expediente-estado',
            'practica-expediente-municipio',
            ESTADOS_MUNICIPIOS
        );
    } else {
        // Si ya existe, solo resetear
        window.selectorPracticaExpediente.reset();
    }

    const modal = new bootstrap.Modal(document.getElementById('modalPracticaExpediente'));
    modal.show();
};

// ============================================
// EDITAR PRÁCTICA EXISTENTE
// ============================================

const editarPracticaExpediente = async (id) => {
    try {
        const response = await API.get(`/practicas/${id}`);
        
        if (response.success) {
            const p = response.data;
            
            document.getElementById('modalPracticaExpedienteTitle').textContent = 'Editar Práctica Profesional';
            document.getElementById('practica-expediente-id').value = p.id_practica;
            document.getElementById('practica-expediente-periodo').value = p.periodo_escolar;
            document.getElementById('practica-expediente-semestre').value = p.semestre_cursado;
            document.getElementById('practica-expediente-escuela').value = p.nombre_escuela;
            document.getElementById('practica-expediente-cct').value = p.cct_escuela;
            document.getElementById('practica-expediente-nivel').value = p.nivel_educativo;
            

            // Inicializar el selector si no existe
            if (!window.selectorPracticaExpediente) {
                window.selectorPracticaExpediente = new EstadoMunicipioSelector(
                    'practica-expediente-estado',
                    'practica-expediente-municipio',
                    ESTADOS_MUNICIPIOS
                );
            }
            
            // Usar setValues() en lugar de .value directamente
            if (p.estado && p.municipio) {
                window.selectorPracticaExpediente.setValues(p.estado, p.municipio);
            }

            document.getElementById('practica-expediente-estado').value = p.estado;
            
            // ? IMPORTANTE: Usar split para formatear fechas correctamente
            document.getElementById('practica-expediente-fecha-inicio').value = 
                p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '';
            document.getElementById('practica-expediente-fecha-fin').value = 
                p.fecha_fin ? p.fecha_fin.split('T')[0] : '';
            
            document.getElementById('practica-expediente-horas').value = p.horas_totales || '';
            document.getElementById('practica-expediente-tutor').value = p.tutor_asignado || '';
            document.getElementById('practica-expediente-calificacion').value = p.calificacion_obtenida || '';
            document.getElementById('practica-expediente-situacion').value = p.situacion;
            document.getElementById('practica-expediente-habilidades').value = p.habilidades_desarrolladas || '';
            document.getElementById('practica-expediente-observaciones').value = p.observaciones || '';
            document.getElementById('practica-expediente-reglamento').checked = p.sigue_orientacion_reglamento;
            document.getElementById('practica-expediente-incidentes').checked = p.tiene_incidentes;
            document.getElementById('practica-expediente-relato-incidentes').value = p.relato_incidentes || '';
            
            if (p.tiene_incidentes) {
                document.getElementById('relato-incidentes-container-expediente').style.display = 'block';
            }
            
            const modal = new bootstrap.Modal(document.getElementById('modalPracticaExpediente'));
            modal.show();
        }
        
    } catch (error) {
        console.error('Error al cargar práctica:', error);
        Alert.error('Error al cargar los datos de la práctica');
    }
};

// ============================================
// GUARDAR PRÁCTICA
// ============================================

const guardarPracticaExpediente = async () => {
    const form = document.getElementById('form-practica-expediente');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('practica-expediente-id').value;
    let valoresPracticaExpediente;

    if (window.selectorPracticaExpediente) {
        // Si el selector existe, usar getValues()
        valoresPracticaExpediente = window.selectorPracticaExpediente.getValues();
    } else {
        // Si no existe, obtener valores directamente de los selects
        valoresPracticaExpediente = {
            estado: document.getElementById('practica-expediente-estado').value,
            municipio: document.getElementById('practica-expediente-municipio').value
        };
    }

    
    const datos = {
        periodo_escolar: document.getElementById('practica-expediente-periodo').value,
        semestre_cursado: parseInt(document.getElementById('practica-expediente-semestre').value),
        nombre_escuela: document.getElementById('practica-expediente-escuela').value,
        cct_escuela: document.getElementById('practica-expediente-cct').value.toUpperCase(),
        nivel_educativo: document.getElementById('practica-expediente-nivel').value,

        municipio: valoresPracticaExpediente.municipio,
        estado: valoresPracticaExpediente.estado,
        

        fecha_inicio: document.getElementById('practica-expediente-fecha-inicio').value,
        fecha_fin: document.getElementById('practica-expediente-fecha-fin').value,
        horas_totales: document.getElementById('practica-expediente-horas').value || null,
        tutor_asignado: document.getElementById('practica-expediente-tutor').value || null,
        calificacion_obtenida: document.getElementById('practica-expediente-calificacion').value || null,
        situacion: document.getElementById('practica-expediente-situacion').value,
        habilidades_desarrolladas: document.getElementById('practica-expediente-habilidades').value || null,
        observaciones: document.getElementById('practica-expediente-observaciones').value || null,
        sigue_orientacion_reglamento: document.getElementById('practica-expediente-reglamento').checked,
        tiene_incidentes: document.getElementById('practica-expediente-incidentes').checked,
        relato_incidentes: document.getElementById('practica-expediente-relato-incidentes').value || null
    };

    // Validaciones
    if (!datos.municipio || !datos.estado) {
        Alert.error('Por favor selecciona estado y municipio');
        return;
    }
    
    try {
        let response;
        if (id) {
            // Actualizar
            response = await API.put(`/practicas/${id}`, datos);
        } else {
            // Crear
            response = await API.post(`/practicas/alumno/${idAlumno}`, datos);
        }
        
        if (response.success) {
            Alert.success(response.message || (id ? 'Práctica actualizada correctamente' : 'Práctica registrada correctamente'));
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPracticaExpediente'));
            modal.hide();
            
            await renderPracticasExpediente();
        }
        
    } catch (error) {
        console.error('Error al guardar práctica:', error);
        Alert.error(error.message || 'Error al guardar la práctica');
    }
};

// ============================================
// ELIMINAR PRÁCTICA
// ============================================

const eliminarPracticaExpediente = async (id) => {
    const confirmado = await confirm(
        '¿Eliminar práctica profesional?',
        'Esta acción no se puede deshacer'
    );
    
    if (!confirmado) return;
    
    try {
        const response = await API.delete(`/practicas/${id}`);
        
        if (response.success) {
            Alert.success('Práctica eliminada correctamente');
            await renderPracticasExpediente();
        }
        
    } catch (error) {
        console.error('Error al eliminar práctica:', error);
        Alert.error('Error al eliminar la práctica');
    }
};






// ============================================
// FUNCIONES DE MANEJO: PRÁCTICAS PROFESIONALES
// ============================================

const mostrarModalPractica = (id = null) => {
    // Limpiar formulario
    document.getElementById('form-practica').reset();

    if (!window.selectorPractica) {
        window.selectorPractica = new EstadoMunicipioSelector(
            'practica-estado',
            'practica-municipio',
            ESTADOS_MUNICIPIOS
        );
    } else {
        window.selectorPractica.reset();
    }

    document.getElementById('practica-id').value = '';
    document.getElementById('modal-practica-title').textContent = 'Agregar Práctica Profesional';
    
    if (id) {
        // Modo edición
        document.getElementById('modal-practica-title').textContent = 'Editar Práctica Profesional';
        cargarDatosPractica(id);
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalPractica'));
    modal.show();
};



const editarPractica = (id) => {
    mostrarModalPractica(id);
};

const eliminarPractica = async (id) => {
    const confirmado = await confirm(
        '¿Eliminar práctica profesional?',
        'Esta acción no se puede deshacer'
    );
    
    if (!confirmado) return;
    
    try {
        const response = await API.delete(`/practicas/${id}`);
        
        if (response.success) {
            Alert.success('Práctica eliminada correctamente');
            await renderPracticasExpediente();
        }
        
    } catch (error) {
        console.error('Error al eliminar práctica:', error);
        Alert.error('Error al eliminar la práctica');
    }
};


const cargarPracticasExpediente = async (idAlumno) => {
    try {
        document.getElementById('loading-practicas-expediente').classList.remove('d-none');
        
        // Usar la ruta de prácticas que devuelve el historial completo
        const response = await API.get(`/practicas/alumno/${idAlumno}`);
        
        if (response.success && response.data.length > 0) {
            const practicas = response.data;
            
            let html = `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Periodo</th>
                                <th>Semestre</th>
                                <th>Escuela</th>
                                <th>Nivel</th>
                                <th>Ubicación</th>
                                <th>Fechas</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            practicas.forEach(p => {
                const fechaInicio = p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-MX') : '-';
                const fechaFin = p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-MX') : '-';
                
                html += `
                    <tr>
                        <td><strong>${esc(p.periodo_escolar)}</strong></td>
                        <td class="text-center">${esc(p.semestre_cursado)}°</td>
                        <td>
                            ${esc(p.nombre_escuela)}<br>
                            <small class="text-muted">CCT: ${esc(p.cct_escuela)}</small>
                        </td>
                        <td><span class="badge bg-info">${esc(p.nivel_educativo)}</span></td>
                        <td>
                            <small>${esc(p.municipio)}, ${esc(p.estado)}</small>
                        </td>
                        <td>
                            <small>
                                ${fechaInicio}<br>
                                ${fechaFin}
                            </small>
                        </td>
                        <td>
                            <span class="badge bg-${getEstadoBadgeClassP(p.situacion)}">
                                ${esc(p.situacion)}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" 
                                        data-accion="ExpedienteView.editarPracticaExpediente" data-args="${Acciones.args(p.id_practica)}"
                                        title="Editar">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" 
                                        data-accion="ExpedienteView.eliminarPracticaExpediente" data-args="${Acciones.args(p.id_practica)}"
                                        title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('practicas-table-expediente').innerHTML = html;
        } else {
            document.getElementById('practicas-table-expediente').innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox display-1 text-muted"></i>
                    <p class="mt-3 text-muted">No hay prácticas profesionales registradas</p>
                    <button class="btn btn-primary mt-2" data-accion="ExpedienteView.nuevaPracticaExpediente">
                        <i class="bi bi-plus-circle me-2"></i>Registrar Primera Práctica
                    </button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar prácticas:', error);
        Alert.error('Error al cargar las prácticas profesionales');
    } finally {
        document.getElementById('loading-practicas-expediente').classList.add('d-none');
    }
};

// Función para mostrar modal de nueva práctica
const nuevaPracticaExpediente = () => {
    // Limpiar formulario
    document.getElementById('form-practica-expediente').reset();
    document.getElementById('practica-expediente-id').value = '';
    document.getElementById('modalPracticaExpedienteTitle').textContent = 'Nueva Práctica Profesional';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalPracticaExpediente'));
    modal.show();
};




// Función auxiliar para el badge de estado
const getEstadoBadgeClassP = (estado) => {
    const clases = {
        'En curso': 'warning',
        'Completada': 'success',
        'Cancelada': 'danger'
    };
    return clases[estado] || 'secondary';
};




// ============================================
// FUNCIONES DE MANEJO: BECAS
// ============================================

const mostrarModalBeca = async (id = null) => {
    // Limpiar formulario
    document.getElementById('form-beca').reset();
    document.getElementById('beca-id').value = '';
    document.getElementById('modal-beca-title').textContent = 'Agregar Beca';
    
    if (id) {
        // Modo edición
        document.getElementById('modal-beca-title').textContent = 'Editar Beca';
        
        try {
            const response = await API.get(`/expedientes/${idAlumno}/becas`);
            if (response.success) {
                const beca = response.data.find(b => b.id_beca === id);
                if (beca) {
                    document.getElementById('beca-id').value = beca.id_beca;
                    document.getElementById('beca-nombre').value = beca.nombre_beca;
                    document.getElementById('beca-fecha-inicio').value = beca.fecha_inicio ? beca.fecha_inicio.split('T')[0] : '';
                    document.getElementById('beca-fecha-fin').value = beca.fecha_fin ? beca.fecha_fin.split('T')[0] : '';
                    document.getElementById('beca-activa').checked = beca.activa;
                }
            }
        } catch (error) {
            console.error('Error al cargar beca:', error);
        }
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalBeca'));
    modal.show();
};

const guardarBeca = async () => {
    try {
        const id = document.getElementById('beca-id').value;
        const data = {
            nombre_beca: document.getElementById('beca-nombre').value,
            fecha_inicio: document.getElementById('beca-fecha-inicio').value || null,
            fecha_fin: document.getElementById('beca-fecha-fin').value || null,
            activa: document.getElementById('beca-activa').checked
        };
        
        if (!data.nombre_beca) {
            Alert.warning('El nombre de la beca es requerido');
            return;
        }
        
        let response;
        if (id) {
            response = await API.put(`/expedientes/${idAlumno}/becas/${id}`, data);
        } else {
            response = await API.post(`/expedientes/${idAlumno}/becas`, data);
        }
        
        if (response.success) {
            Alert.success(id ? 'Beca actualizada' : 'Beca agregada');
            bootstrap.Modal.getInstance(document.getElementById('modalBeca')).hide();
            await renderBecas();
        }
        
    } catch (error) {
        console.error('Error al guardar beca:', error);
        Alert.error('Error al guardar la beca');
    }
};

const editarBeca = (id) => {
    mostrarModalBeca(id);
};

const eliminarBeca = async (id) => {
    const confirmado = await confirm(
        '¿Eliminar beca?',
        'Esta acción no se puede deshacer'
    );
    
    if (!confirmado) return;
    
    try {
        const response = await API.delete(`/expedientes/${idAlumno}/becas/${id}`);
        
        if (response.success) {
            Alert.success('Beca eliminada');
            await renderBecas();
        }
        
    } catch (error) {
        console.error('Error al eliminar beca:', error);
        Alert.error('Error al eliminar la beca');
    }
};

// ============================================
// FUNCIONES DE MANEJO: MOVILIDAD
// ============================================

const mostrarModalMovilidad = async (id = null) => {
    // Limpiar formulario
    document.getElementById('form-movilidad').reset();
    document.getElementById('movilidad-id').value = '';
    document.getElementById('modal-movilidad-title').textContent = 'Agregar Movilidad';
    
    if (id) {
        // Modo edición
        document.getElementById('modal-movilidad-title').textContent = 'Editar Movilidad';
        
        try {
            const response = await API.get(`/expedientes/${idAlumno}/movilidad`);
            if (response.success) {
                const movilidad = response.data.find(m => m.id_movilidad === id);
                if (movilidad) {
                    document.getElementById('movilidad-id').value = movilidad.id_movilidad;
                    document.getElementById('movilidad-nombre').value = movilidad.nombre_programa;
                    document.getElementById('movilidad-lugar').value = movilidad.lugar || '';
                    document.getElementById('movilidad-fecha-inicio').value = movilidad.fecha_inicio ? movilidad.fecha_inicio.split('T')[0] : '';
                    document.getElementById('movilidad-fecha-fin').value = movilidad.fecha_fin ? movilidad.fecha_fin.split('T')[0] : '';
                    document.getElementById('movilidad-relato').value = movilidad.relato_experiencia || '';
                }
            }
        } catch (error) {
            console.error('Error al cargar movilidad:', error);
        }
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalMovilidad'));
    modal.show();
};

const guardarMovilidad = async () => {
    try {
        const id = document.getElementById('movilidad-id').value;
        const data = {
            nombre_programa: document.getElementById('movilidad-nombre').value,
            lugar: document.getElementById('movilidad-lugar').value || null,
            fecha_inicio: document.getElementById('movilidad-fecha-inicio').value || null,
            fecha_fin: document.getElementById('movilidad-fecha-fin').value || null,
            relato_experiencia: document.getElementById('movilidad-relato').value || null
        };
        
        if (!data.nombre_programa) {
            Alert.warning('El nombre del programa es requerido');
            return;
        }
        
        let response;
        if (id) {
            response = await API.put(`/expedientes/${idAlumno}/movilidad/${id}`, data);
        } else {
            response = await API.post(`/expedientes/${idAlumno}/movilidad`, data);
        }
        
        if (response.success) {
            Alert.success(id ? 'Movilidad actualizada' : 'Movilidad agregada');
            bootstrap.Modal.getInstance(document.getElementById('modalMovilidad')).hide();
            await renderMovilidad();
        }
        
    } catch (error) {
        console.error('Error al guardar movilidad:', error);
        Alert.error('Error al guardar la movilidad');
    }
};

const editarMovilidad = (id) => {
    mostrarModalMovilidad(id);
};

const eliminarMovilidad = async (id) => {
    const confirmado = await confirm(
        '¿Eliminar movilidad?',
        'Esta acción no se puede deshacer'
    );
    
    if (!confirmado) return;
    
    try {
        const response = await API.delete(`/expedientes/${idAlumno}/movilidad/${id}`);
        
        if (response.success) {
            Alert.success('Movilidad eliminada');
            await renderMovilidad();
        }
        
    } catch (error) {
        console.error('Error al eliminar movilidad:', error);
        Alert.error('Error al eliminar la movilidad');
    }
};

// ============================================
// FUNCIONES DE MANEJO: PRÁCTICAS
// ============================================

const guardarPracticas = async () => {
    try {
        const data = {
            habilidades_practicas: document.getElementById('practicas-habilidades').value || null,
            sigue_orientacion_reglamento: document.getElementById('practicas-reglamento').checked,
            tiene_incidentes: document.getElementById('practicas-incidentes').checked,
            relato_incidentes: document.getElementById('practicas-relato').value || null
        };
        
        const response = await API.post(`/expedientes/${idAlumno}/practicas`, data);
        
        if (response.success) {
            Alert.success('Información guardada correctamente');
        }
        
    } catch (error) {
        console.error('Error al guardar prácticas:', error);
        Alert.error('Error al guardar');
    }
};



/**
 * Eliminar calificación de un semestre
 */
const eliminarCalificacion = async (numeroSemestre) => {
    try {
        // Confirmación
        const confirmacion = confirm(
            `¿Estás seguro de eliminar la calificación del semestre ${numeroSemestre}°?\n\n` +
            'Esta acción no se puede deshacer.'
        );
        
        if (!confirmacion) {
            return;
        }
        
        State.setLoading(true);
        
        const response = await API.delete(`/expedientes/${idAlumno}/calificaciones/${numeroSemestre}`);
        
        if (response.success) {
            Alert.success('Calificación eliminada correctamente');
            
            // Recargar el expediente para reflejar los cambios
            await cargarExpediente();
        }
        
    } catch (error) {
        console.error('Error al eliminar calificación:', error);
        Alert.error(error.message || 'Error al eliminar la calificación');
    } finally {
        State.setLoading(false);
    }
};

    // Exponer métodos públicos
    return {
        render,
        abrirModalPersonales,
        guardarDatosPersonales,
        abrirModalCalificacion,
        guardarCalificacion,
        abrirModalIncidente,
        guardarIncidente: guardarIncidenteNuevo,
        guardarIncidenteNuevo,
        eliminarIncidente,
        descargarExpedientePDF,
        abrirModalGestionIncidente,
        guardarGestionIncidente,
        mostrarModalBeca,
        guardarBeca,
        editarBeca,
        eliminarBeca,
        eliminarCalificacion,
        
        mostrarModalMovilidad,
        guardarMovilidad,
        editarMovilidad,
        eliminarMovilidad,
        
        abrirModalPracticaExpediente,
        editarPracticaExpediente,
        guardarPracticaExpediente,
        eliminarPracticaExpediente
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.ExpedienteView = ExpedienteView;