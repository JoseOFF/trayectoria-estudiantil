/**
 * =============================================
 * PORTAL DE ALUMNO
 * =============================================
 */

// Escapa el texto que viene de la base antes de insertarlo en el HTML.
// Está fuera del módulo porque muchas funciones de este archivo son globales.
const escPortal = (valor) => Utils.escapeHtml(valor);

const PortalAlumnoView = (() => {
    let alumnoData = null;
    
    // ============================================
    // FUNCIÓN PARA RENDERIZAR WIDGET DE COMPLETITUD
    // ============================================
    const renderCompletitudExpediente = async (idAlumno) => {
        try {
            const response = await API.get(`/completitud/alumno/${idAlumno}/faltantes`);
            
            if (!response.success) {
                return '';
            }
            
            const { porcentaje_total, nivel_completitud, secciones_faltantes, secciones_completas } = response.data;
            
            // Si el expediente está completo, mostrar mensaje de éxito
            if (secciones_faltantes.length === 0) {
                return `
                    <div class="alert alert-success border-0 shadow-sm">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0">
                                <i class="bi bi-check-circle-fill fs-1"></i>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <h5 class="alert-heading mb-1">¡Expediente Completo!</h5>
                                <p class="mb-0">Tu expediente está completo al <strong>${porcentaje_total}%</strong>. Todas las secciones obligatorias han sido llenadas correctamente.</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            const getProgressColor = (porcentaje) => {
                if (porcentaje >= 80) return 'success';
                if (porcentaje >= 60) return 'warning';
                return 'danger';
            };
            
            const progressColor = getProgressColor(porcentaje_total);
            
            return `
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <div class="d-flex justify-content-between align-items-center text-white">
                            <h5 class="mb-0">
                                <i class="bi bi-clipboard-check me-2"></i>
                                Completitud de tu Expediente
                            </h5>
                            <span class="badge bg-light text-primary fs-6">${porcentaje_total}%</span>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div class="mb-4">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Progreso general</span>
                                <span class="fw-bold">${secciones_completas} de 7 secciones completas</span>
                            </div>
                            <div class="progress" style="height: 25px;">
                                <div class="progress-bar bg-${progressColor} progress-bar-striped progress-bar-animated" 
                                     role="progressbar" 
                                     style="width: ${porcentaje_total}%">
                                    ${porcentaje_total}%
                                </div>
                            </div>
                            <small class="text-muted">Nivel: <strong>${escPortal(nivel_completitud)}</strong></small>
                        </div>
                        
                        <div class="alert alert-${progressColor === 'danger' ? 'warning' : 'info'} border-0">
                            <i class="bi bi-info-circle me-2"></i>
                            ${porcentaje_total < 60 
                                ? 'Tu expediente necesita atención urgente.' 
                                : porcentaje_total < 100 
                                    ? '¡Casi terminas! Solo faltan algunas secciones.' 
                                    : '¡Excelente trabajo!'
                            }
                        </div>
                        
                        <div class="secciones-faltantes">
                            <h6 class="text-muted mb-3">
                                <i class="bi bi-list-check me-2"></i>
                                Secciones pendientes (${secciones_faltantes.length})
                            </h6>
                            
                            ${secciones_faltantes.map(seccion => `
                                <div class="card mb-3 border-start border-${seccion.color} border-4">
                                    <div class="card-body py-3">
                                        <div class="d-flex align-items-start">
                                            <div class="flex-shrink-0">
                                                <div class="bg-${seccion.color} bg-opacity-10 text-${seccion.color} rounded-circle d-flex align-items-center justify-content-center" 
                                                     style="width: 45px; height: 45px;">
                                                    <i class="bi bi-${seccion.icono} fs-5"></i>
                                                </div>
                                            </div>
                                            
                                            <div class="flex-grow-1 ms-3">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 class="mb-0">${escPortal(seccion.nombre)}</h6>
                                                    <span class="badge bg-${seccion.color}">${seccion.porcentaje}%</span>
                                                </div>
                                                
                                                ${seccion.faltantes.length > 0 ? `
                                                    <div class="mb-2">
                                                        <small class="text-muted d-block mb-1">
                                                            <i class="bi bi-exclamation-circle me-1"></i>
                                                            Falta:
                                                        </small>
                                                        <ul class="mb-0 ps-3 small">
                                                            ${seccion.faltantes.map(item => `
                                                                <li class="text-danger">${escPortal(item)}</li>
                                                            `).join('')}
                                                        </ul>
                                                    </div>
                                                ` : ''}
                                                
                                                <p class="mb-0 small text-muted">
                                                    <i class="bi bi-arrow-right-circle me-1"></i>
                                                    ${escPortal(seccion.accion)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error al cargar completitud:', error);
            return '';
        }
    };

    const render = async () => {
        try {
            const app = document.getElementById('app');
            
            app.innerHTML = `
                <div class="dashboard-container">
                    ${Sidebar.render()}
                    
                    <div class="main-content">
                        ${Navbar.render()}
                        
                        <div class="content-area">
                            <div id="portal-alumno-container">
                                <div class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                    <p class="mt-3 text-muted">Cargando tu portal...</p>
                                </div>
                            </div>
                            ${Footer.render({ showFullInfo: true })}
                        </div>
                    </div>
                </div>
            `;
            
            await cargarDatosAlumno();
            renderPortalCompleto();
            initEventListeners();
            await cargarDatosPersonales();
            
        } catch (error) {
            console.error('Error al cargar portal del alumno:', error);
            const container = document.getElementById('portal-alumno-container');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error al cargar el portal: ${escPortal(error.message)}
                    </div>
                `;
            }
        }
    };
    
    const cargarDatosAlumno = async () => {
        const response = await API.get('/portal-alumno/mi-informacion');
        if (!response.success) {
            throw new Error(response.message || 'Error al cargar datos del alumno');
        }
        alumnoData = response.data;
        
    };
    
    /**
     * Tabs con sintaxis correcta
     */
    const renderPortalCompleto = () => {
        document.getElementById('portal-alumno-container').innerHTML = `
            <div class="container-fluid">
                <!-- Encabezado -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-primary">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-2 text-center">
                                        <div class="avatar-circle bg-primary text-white">
                                            <i class="bi bi-person-fill fs-1"></i>
                                        </div>
                                    </div>
                                    <div class="col-md-10">
                                        <h3 class="mb-1">${escPortal(alumnoData.nombre_completo)}</h3>
                                        <p class="text-muted mb-2">
                                            <i class="bi bi-mortarboard-fill me-2"></i>
                                            Matrícula: <strong>${escPortal(alumnoData.matricula)}</strong> | 
                                            Semestre: <strong>${escPortal(alumnoData.semestre_actual || 'N/A')}°</strong> | 
                                            Generación: <strong>${escPortal(alumnoData.generacion || 'N/A')}</strong>
                                        </p>
                                        <p class="text-muted mb-2">
                                            <i class="bi bi-building me-2"></i>
                                            ${escPortal(alumnoData.nombre_licenciatura)}
                                        </p>
                                        <span class="badge bg-success">
                                            <i class="bi bi-circle-fill me-1"></i>${escPortal(alumnoData.status_alumno || 'Activo')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Widget de Completitud -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div id="widget-completitud">
                            <div class="text-center py-3">
                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                <small class="text-muted ms-2">Cargando completitud...</small>
                            </div>
                        </div>
                    </div>
                </div>

                
                <ul class="nav nav-tabs mb-4" id="portalTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="personal-tab" data-bs-toggle="tab" 
                                data-bs-target="#personal" type="button" role="tab">
                            <i class="bi bi-person-vcard me-2"></i>Datos Personales
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="domicilio-tab" data-bs-toggle="tab" 
                                data-bs-target="#domicilio" type="button" role="tab">
                            <i class="bi bi-house-door-fill me-2"></i>Domicilio
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="salud-tab" data-bs-toggle="tab" 
                                data-bs-target="#salud" type="button" role="tab">
                            <i class="bi bi-heart-pulse me-2"></i>Salud
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="familiares-tab" data-bs-toggle="tab" 
                                data-bs-target="#familiares" type="button" role="tab">
                            <i class="bi bi-people-fill me-2"></i>Familiares
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="academico-tab" data-bs-toggle="tab" 
                                data-bs-target="#academico" type="button" role="tab">
                            <i class="bi bi-book-fill me-2"></i>Académico
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="desempeno-tab" data-bs-toggle="tab" 
                                data-bs-target="#desempeno" type="button" role="tab">
                            <i class="bi bi-trophy-fill me-2"></i>Desempeño
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="certificaciones-tab" data-bs-toggle="tab" 
                                data-bs-target="#certificaciones" type="button" role="tab">
                            <i class="bi bi-award-fill me-2"></i>Certificaciones
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="habilidades-tab" data-bs-toggle="tab" 
                                data-bs-target="#habilidades" type="button" role="tab">
                            <i class="bi bi-gear-fill me-2"></i>Habilidades
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="socioeconomicos-tab" data-bs-toggle="tab" 
                                data-bs-target="#socioeconomicos" type="button" role="tab">
                            <i class="bi bi-wallet2 me-2"></i>Socioeconómicos
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
                            <i class="bi bi-airplane me-2"></i>Movilidad Académica
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="practicas-tab" data-bs-toggle="tab" 
                                data-bs-target="#practicas" type="button" role="tab">
                            <i class="bi bi-briefcase me-2"></i>Prácticas Profesionales
                        </button>
                    </li>

                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="calificaciones-tab" data-bs-toggle="tab" 
                                data-bs-target="#calificaciones" type="button" role="tab">
                            <i class="bi bi-clipboard-data me-2"></i>Calificaciones
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="documentos-tab" data-bs-toggle="tab" 
                                data-bs-target="#documentos" type="button" role="tab">
                            <i class="bi bi-file-earmark-text me-2"></i>Documentos
                        </button>
                    </li>
                </ul>
                
                <div class="tab-content" id="portalTabsContent">
                    <div class="tab-pane fade show active" id="personal" role="tabpanel">
                        ${renderTabDatosPersonales()}
                    </div>
                    <div class="tab-pane fade" id="domicilio" role="tabpanel">
                        ${renderTabDomicilio()}
                    </div>
                    <div class="tab-pane fade" id="salud" role="tabpanel">
                        ${renderTabSalud()}
                    </div>
                    <div class="tab-pane fade" id="familiares" role="tabpanel">
                        ${renderTabFamiliares()}
                    </div>
                    <div class="tab-pane fade" id="academico" role="tabpanel">
                        ${renderTabDatosAcademicos()}
                    </div>
                    <div class="tab-pane fade" id="desempeno" role="tabpanel">
                        ${renderTabDesempeno()}
                    </div>
                    <div class="tab-pane fade" id="certificaciones" role="tabpanel">
                        ${renderTabCertificaciones()}
                    </div>
                    <div class="tab-pane fade" id="habilidades" role="tabpanel">
                        ${renderTabHabilidades()}
                    </div>
                    <div class="tab-pane fade" id="socioeconomicos" role="tabpanel">
                        ${renderTabDatosSocioeconomicos()}
                    </div>
                    <div class="tab-pane fade" id="calificaciones" role="tabpanel">
                        ${renderTabCalificaciones()}
                    </div>
                    <div class="tab-pane fade" id="documentos" role="tabpanel">
                        ${renderTabDocumentos()}
                    </div>

                    <!-- Tab Becas -->
                    <div class="tab-pane fade" id="becas" role="tabpanel">
                        ${renderTabBecas()}
                    </div>

                    <!-- Tab Movilidad -->
                    <div class="tab-pane fade" id="movilidad" role="tabpanel">
                        ${renderTabMovilidad()}
                    </div>

                    <!-- Tab Prácticas -->
                    <div class="tab-pane fade" id="practicas" role="tabpanel">
                        ${renderTabPracticas()}
                    </div>
                </div>
            </div>
            
            ${renderModalFamiliar()}
        `;

        // Cargar widget de completitud
        (async () => {
            try {
                const widgetHtml = await renderCompletitudExpediente(alumnoData.id_alumno);
                const container = document.getElementById('widget-completitud');
                if (container && widgetHtml) {
                    container.innerHTML = widgetHtml;
                }
            } catch (error) {
                console.error('Error al cargar widget de completitud:', error);
            }
        })();
    };
    
    /**
     *  CORREGIDO: Datos Personales con TODOS los campos
     */
    const renderTabDatosPersonales = () => {
        return `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0"><i class="bi bi-person-fill me-2"></i>Datos Personales</h5>
                </div>
                <div class="card-body">
                    <form id="form-datos-personales">
                        
                        <!-- INFORMACIÓN BÁSICA -->
                        <h6 class="border-bottom pb-2 mb-3 text-primary">
                            <i class="bi bi-info-circle me-2"></i>Información Básica
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Nombre Completo *</label>
                                <input type="text" class="form-control" id="nombre_completo" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Matrícula *</label>
                                <input type="text" class="form-control" id="matricula" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">CURP *</label>
                                <input type="text" class="form-control text-uppercase" id="curp" maxlength="18" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Fecha de Nacimiento *</label>
                                <input type="date" class="form-control" id="fecha_nacimiento" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Estado Civil</label>
                                <select class="form-select" id="estado_civil">
                                    <option value="">Seleccionar...</option>
                                    <option value="Soltero/a">Soltero/a</option>
                                    <option value="Casado/a">Casado/a</option>
                                    <option value="Unión libre">Unión libre</option>
                                    <option value="Divorciado/a">Divorciado/a</option>
                                    <option value="Viudo/a">Viudo/a</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Correo Personal</label>
                                <input type="email" class="form-control" id="correo_personal">
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Celular</label>
                                <input type="tel" class="form-control" id="celular" maxlength="10">
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Teléfono de Emergencia</label>
                                <input type="tel" class="form-control" id="telefono_emergencia" maxlength="10">
                            </div>
                        </div>
                        
                        <!--  LUGAR DE NACIMIENTO -->
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-primary">
                            <i class="bi bi-geo-alt-fill me-2"></i>Lugar de Nacimiento
                        </h6>
                        


                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Estado de Nacimiento *</label>
                                <select class="form-select" id="estado_nacimiento" required>
                                    <option value="">Seleccionar estado...</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Municipio de Nacimiento *</label>
                                <select class="form-select" id="municipio_nacimiento" required disabled>
                                    <option value="">Seleccionar municipio...</option>
                                </select>
                            </div>
                        </div>
                        


                        <!-- INFORMACIÓN INDÍGENA -->
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-primary">
                            <i class="bi bi-people-fill me-2"></i>Información Indígena
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="representativo_indigena">
                                    <label class="form-check-label" for="representativo_indigena">
                                        ¿Eres representante indígena?
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="habla_lengua_indigena">
                                    <label class="form-check-label" for="habla_lengua_indigena">
                                        ¿Hablas alguna lengua indígena?
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row" id="grupo_lengua_indigena" style="display:none;">
                            <div class="col-md-12 mb-3">
                                <label class="form-label">¿Qué lengua indígena hablas?</label>
                                <input type="text" class="form-control" id="lengua_indigena" 
                                       placeholder="Ej: Náhuatl, Maya, Zapoteco, etc.">
                            </div>
                        </div>
                        
                        <!-- INFORMACIÓN FAMILIAR -->
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-primary">
                            <i class="bi bi-house-heart-fill me-2"></i>Información Familiar
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="tiene_hijos">
                                    <label class="form-check-label" for="tiene_hijos">
                                        ¿Tienes hijos?
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row" id="grupo_hijos" style="display:none;">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Número de Hijos</label>
                                <input type="number" class="form-control" id="numero_hijos" min="0" max="20">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Edad de los Hijos</label>
                                <input type="text" class="form-control" id="edad_hijos" 
                                       placeholder="Ej: 5, 8, 12 años">
                            </div>
                        </div>
                        
                        <!-- INFORMACIÓN DE EMBARAZO -->
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-primary">
                            <i class="bi bi-heart-pulse-fill me-2"></i>Información de Embarazo
                        </h6>
                        
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            Esta sección es opcional y solo aplica si corresponde
                        </div>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="embarazada">
                                    <label class="form-check-label" for="embarazada">
                                        ¿Estás embarazada actualmente?
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row" id="grupo_embarazo" style="display:none;">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Meses de Embarazo</label>
                                <input type="number" class="form-control" id="meses_embarazo" min="1" max="9">
                            </div>
                        </div>
                        
                        <!-- SITUACIÓN PERSONAL -->
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-primary">
                            <i class="bi bi-chat-left-text-fill me-2"></i>Situación Personal
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label class="form-label">Describe tu situación personal (opcional)</label>
                                <textarea class="form-control" id="situacion_personal" rows="4"
                                          placeholder="Puedes compartir información relevante sobre tu situación personal..."></textarea>
                            </div>
                        </div>
                        
                        <div class="text-end mt-4">
                            <button type="button" class="btn btn-primary" id="btn-guardar-datos-personales">
                                <i class="bi bi-save me-2"></i>Guardar Datos Personales
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    };
    
    /**
     *  CORREGIDO: Cargar TODOS los datos personales
     */
    const cargarDatosPersonales = async () => {
        try {
            const datos = alumnoData;
            
            if (datos) {
                // Básicos
                document.getElementById('nombre_completo').value = datos.nombre_completo || '';
                document.getElementById('matricula').value = datos.matricula || '';
                document.getElementById('curp').value = datos.curp || '';
                document.getElementById('fecha_nacimiento').value = datos.fecha_nacimiento || '';
                document.getElementById('estado_civil').value = datos.estado_civil || '';
                document.getElementById('correo_personal').value = datos.correo_personal || '';
                document.getElementById('celular').value = datos.celular || '';
                document.getElementById('telefono_emergencia').value = datos.telefono_emergencia || '';
                
                //  LUGAR DE NACIMIENTO
                document.getElementById('municipio_nacimiento').value = datos.municipio_nacimiento || '';
                document.getElementById('estado_nacimiento').value = datos.estado_nacimiento || '';
                
                // Indígena
                document.getElementById('representativo_indigena').checked = datos.representativo_indigena || false;
                document.getElementById('habla_lengua_indigena').checked = datos.habla_lengua_indigena || false;
                document.getElementById('lengua_indigena').value = datos.lengua_indigena || '';
                
                if (datos.habla_lengua_indigena) {
                    document.getElementById('grupo_lengua_indigena').style.display = 'block';
                }
                
                // Hijos
                document.getElementById('tiene_hijos').checked = datos.tiene_hijos || false;
                document.getElementById('numero_hijos').value = datos.numero_hijos || '';
                document.getElementById('edad_hijos').value = datos.edad_hijos || '';
                
                if (datos.tiene_hijos) {
                    document.getElementById('grupo_hijos').style.display = 'block';
                }
                
                // Embarazo
                document.getElementById('embarazada').checked = datos.embarazada || false;
                document.getElementById('meses_embarazo').value = datos.meses_embarazo || '';
                
                if (datos.embarazada) {
                    document.getElementById('grupo_embarazo').style.display = 'block';
                }
                
                // Situación personal
                document.getElementById('situacion_personal').value = datos.situacion_personal || '';
            }
            
            // Event listeners condicionales
            document.getElementById('habla_lengua_indigena').addEventListener('change', (e) => {
                document.getElementById('grupo_lengua_indigena').style.display = 
                    e.target.checked ? 'block' : 'none';
            });
            
            document.getElementById('tiene_hijos').addEventListener('change', (e) => {
                document.getElementById('grupo_hijos').style.display = 
                    e.target.checked ? 'block' : 'none';
            });
            
            document.getElementById('embarazada').addEventListener('change', (e) => {
                document.getElementById('grupo_embarazo').style.display = 
                    e.target.checked ? 'block' : 'none';
            });

            const selectorNacimiento = new EstadoMunicipioSelector(
                'estado_nacimiento',
                'municipio_nacimiento',
                ESTADOS_MUNICIPIOS
            );

             // Establecer valores si existen
            if (datos.estado_nacimiento && datos.municipio_nacimiento) {
                selectorNacimiento.setValues(
                    datos.estado_nacimiento,
                    datos.municipio_nacimiento
                );
            }
            // Guardar referencia para usar en guardar
            window.selectorNacimiento = selectorNacimiento;
            
            // Guardar
            document.getElementById('btn-guardar-datos-personales').addEventListener('click', guardarDatosPersonales);
            
        } catch (error) {
            console.error('Error al cargar datos personales:', error);
        }
    };
    
    /**
     *  CORREGIDO: Guardar TODOS los datos personales
     */
    const guardarDatosPersonales = async () => {
        try {
            const datos = {
                nombre_completo: document.getElementById('nombre_completo').value,
                matricula: document.getElementById('matricula').value,
                curp: document.getElementById('curp').value.toUpperCase(),
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
                estado_civil: document.getElementById('estado_civil').value || null,
                correo_personal: document.getElementById('correo_personal').value || null,
                celular: document.getElementById('celular').value || null,
                telefono_emergencia: document.getElementById('telefono_emergencia').value || null,
                municipio_nacimiento: document.getElementById('municipio_nacimiento').value || null,
                estado_nacimiento: document.getElementById('estado_nacimiento').value || null,
                representativo_indigena: document.getElementById('representativo_indigena').checked,
                habla_lengua_indigena: document.getElementById('habla_lengua_indigena').checked,
                lengua_indigena: document.getElementById('lengua_indigena').value || null,
                tiene_hijos: document.getElementById('tiene_hijos').checked,
                numero_hijos: document.getElementById('numero_hijos').value || null,
                edad_hijos: document.getElementById('edad_hijos').value || null,
                embarazada: document.getElementById('embarazada').checked,
                meses_embarazo: document.getElementById('meses_embarazo').value || null,
                situacion_personal: document.getElementById('situacion_personal').value || null
            };
            
            const response = await API.put('/portal-alumno/datos-personales', datos);
            
            if (response.success) {
                Alert.success('Datos personales actualizados correctamente');
                await cargarDatosAlumno();
            }
            
        } catch (error) {
            console.error('Error al guardar datos personales:', error);
            Alert.error('Error al guardar los datos personales');
        }
    };
    
    // ============================================
    // RESTO DE FUNCIONES (mantener como están)
    // ============================================
    
    const renderTabDomicilio = () => {
        return `
            <div class="card">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0"><i class="bi bi-house-door-fill me-2"></i>Domicilio</h5>
                </div>
                <div class="card-body">
                    <form id="form-domicilio">
                        <div class="row">
                            <div class="col-md-8 mb-3">
                                <label class="form-label">Calle *</label>
                                <input type="text" class="form-control" id="dom_calle" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Número *</label>
                                <input type="text" class="form-control" id="dom_numero" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Colonia *</label>
                                <input type="text" class="form-control" id="dom_colonia" required>
                            </div>


                            
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Estado *</label>
                                <select class="form-select" id="dom_estado" required>
                                    <option value="">Seleccionar estado...</option>
                                </select>
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Municipio *</label>
                                <select class="form-select" id="dom_municipio" required disabled>
                                    <option value="">Seleccionar municipio...</option>
                                </select>
                            </div>

                        </div>
                        
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label class="form-label">Referencia (Opcional)</label>
                                <textarea class="form-control" id="dom_referencia" rows="2"></textarea>
                            </div>
                        </div>
                        
                        <div class="text-end mt-3">
                            <button type="button" class="btn btn-info text-white" id="btn-guardar-domicilio">
                                <i class="bi bi-save me-2"></i>Guardar Domicilio
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    };
    
    const cargarDomicilio = async () => {
        try {

            const selectorDomicilio = new EstadoMunicipioSelector(
                'dom_estado',
                'dom_municipio',
                ESTADOS_MUNICIPIOS
            );
            
            window.selectorDomicilio = selectorDomicilio;
            const response = await API.get('/portal-alumno/domicilio');
            
            if (response.success && response.data) {
                const dom = response.data;
                document.getElementById('dom_calle').value = dom.calle || '';
                document.getElementById('dom_numero').value = dom.numero || '';
                document.getElementById('dom_colonia').value = dom.colonia || '';
                document.getElementById('dom_referencia').value = dom.referencia || '';
                if (dom.estado && dom.municipio) {
                    selectorDomicilio.setValues(dom.estado, dom.municipio);
                }
            }
            
            document.getElementById('btn-guardar-domicilio')?.addEventListener('click', guardarDomicilio);
            
        } catch (error) {
            console.error('Error al cargar domicilio:', error);
        }
    };
    
    const guardarDomicilio = async () => {
        try {

            const valoresDomicilio = window.selectorDomicilio.getValues();
            
            const datos = {
                calle: document.getElementById('dom_calle').value,
                numero: document.getElementById('dom_numero').value,
                colonia: document.getElementById('dom_colonia').value,
                municipio: valoresDomicilio.municipio,
                estado: valoresDomicilio.estado,
                referencia: document.getElementById('dom_referencia').value || null
            };
            
            if (!datos.calle || !datos.numero || !datos.colonia || !datos.municipio || !datos.estado) {
                Alert.error('Por favor completa todos los campos requeridos');
                return;
            }
            
            const response = await API.put('/portal-alumno/domicilio', datos);
            
            if (response.success) {
                Alert.success('Domicilio actualizado correctamente');
            }
            
        } catch (error) {
            console.error('Error al guardar domicilio:', error);
            Alert.error('Error al guardar el domicilio');
        }
    };
    
    const renderTabDatosSocioeconomicos = () => {
        return `
            <div class="card">
                <div class="card-header bg-warning">
                    <h5 class="mb-0"><i class="bi bi-wallet2 me-2"></i>Datos Socioeconómicos</h5>
                </div>
                <div class="card-body">
                    <form id="form-socioeconomicos">
                        <h6 class="border-bottom pb-2 mb-3 text-warning">
                            <i class="bi bi-cash-stack me-2"></i>Situación Económica
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label class="form-label">¿Con cuántos recursos económicos cuentas? *</label>
                                <select class="form-select" id="se_recursos_economicos" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Suficiente">Suficiente</option>
                                    <option value="Insuficiente">Insuficiente</option>
                                </select>
                                <small class="text-muted">
                                    Suficiente: Cubres todas tus necesidades básicas. 
                                    Insuficiente: Te es difícil cubrir tus necesidades básicas.
                                </small>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">¿De quién dependes económicamente?</label>
                                <input type="text" class="form-control" id="se_dependencia_economica">
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="form-check form-switch mt-4">
                                    <input class="form-check-input" type="checkbox" id="se_alguien_depende_ti">
                                    <label class="form-check-label">¿Alguien depende de ti?</label>
                                </div>
                            </div>
                        </div>
                        
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-warning">
                            <i class="bi bi-briefcase-fill me-2"></i>Situación Laboral
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="se_trabaja">
                                    <label class="form-check-label">¿Trabajas actualmente?</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row" id="grupo_trabajo" style="display:none;">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Lugar de Trabajo</label>
                                <input type="text" class="form-control" id="se_lugar_trabajo">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Horario de Trabajo</label>
                                <input type="text" class="form-control" id="se_horario_trabajo">
                            </div>
                        </div>
                        
                        <h6 class="border-bottom pb-2 mb-3 mt-4 text-warning">
                            <i class="bi bi-house-fill me-2"></i>Vivienda
                        </h6>
                        
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="se_renta_fuera">
                                    <label class="form-check-label">¿Rentas fuera del domicilio familiar?</label>
                                </div>
                            </div>
                        </div>




                        <div id="grupo_domicilio_renta" style="display:none;">
                            <div class="card bg-light mb-3">
                                <div class="card-body">
                                    <h6 class="card-title text-warning">
                                        <i class="bi bi-geo-alt me-2"></i>Domicilio Donde Rentas
                                    </h6>
                                    
                                    <div class="row">
                                        <div class="col-md-8 mb-3">
                                            <label class="form-label">Calle *</label>
                                            <input type="text" class="form-control" id="renta_calle"
                                                placeholder="Nombre de la calle">
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">Número *</label>
                                            <input type="text" class="form-control" id="renta_numero"
                                                placeholder="Ej: 123">
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Colonia *</label>
                                            <input type="text" class="form-control" id="renta_colonia"
                                                placeholder="Nombre de la colonia">
                                        </div>


                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Estado *</label>
                                            <select class="form-select" id="renta_estado" required>
                                                <option value="">Seleccionar estado...</option>
                                            </select>
                                        </div>
                                        
                                    </div>
                                    
                                    <div class="row">

                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Municipio *</label>
                                            <select class="form-select" id="renta_municipio" required disabled>
                                                <option value="">Seleccionar municipio...</option>
                                            </select>
                                        </div>

                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">Referencia</label>
                                            <input type="text" class="form-control" id="renta_referencia"
                                                placeholder="Cerca de...">
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>


                        



                        
                        <div class="text-end mt-3">
                            <button type="button" class="btn btn-warning" id="btn-guardar-socioeconomicos">
                                <i class="bi bi-save me-2"></i>Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    };
    
    const cargarDatosSocioeconomicos = async () => {
        try {
            const selectorRenta = new EstadoMunicipioSelector(
                'renta_estado',
                'renta_municipio',
                ESTADOS_MUNICIPIOS
            );
            
            window.selectorRenta = selectorRenta;

            const response = await API.get('/portal-alumno/datos-socioeconomicos');
            
            if (response.success && response.data) {
                const datos = response.data;
                document.getElementById('se_recursos_economicos').value = datos.recursos_economicos || '';
                document.getElementById('se_dependencia_economica').value = datos.dependencia_economica || '';
                document.getElementById('se_alguien_depende_ti').checked = datos.alguien_depende_ti || false;
                document.getElementById('se_trabaja').checked = datos.trabaja || false;
                document.getElementById('se_lugar_trabajo').value = datos.lugar_trabajo || '';
                document.getElementById('se_horario_trabajo').value = datos.horario_trabajo || '';
                document.getElementById('se_renta_fuera').checked = datos.renta_fuera_domicilio || false;
                
                if (datos.trabaja) {
                    document.getElementById('grupo_trabajo').style.display = 'block';
                }
                if (datos.renta_fuera_domicilio) {
                document.getElementById('grupo_domicilio_renta').style.display = 'block';
                
                // Si hay domicilio de renta, cargarlo
                if (datos.domicilio_renta) {
                    document.getElementById('renta_calle').value = datos.domicilio_renta.calle || '';
                    document.getElementById('renta_numero').value = datos.domicilio_renta.numero || '';
                    document.getElementById('renta_colonia').value = datos.domicilio_renta.colonia || '';
                    document.getElementById('renta_referencia').value = datos.domicilio_renta.referencia || '';
                    if (datos.domicilio_renta.estado && datos.domicilio_renta.municipio) {
                        selectorRenta.setValues(
                            datos.domicilio_renta.estado,
                            datos.domicilio_renta.municipio
                        );
                    }
                }
            }
            
            }
            
            document.getElementById('se_trabaja')?.addEventListener('change', (e) => {
                document.getElementById('grupo_trabajo').style.display = e.target.checked ? 'block' : 'none';
            });

            
              document.getElementById('se_renta_fuera')?.addEventListener('change', (e) => {
                document.getElementById('grupo_domicilio_renta').style.display = 
                    e.target.checked ? 'block' : 'none';
                    
                // Limpiar campos si se desmarca
                if (!e.target.checked) {
                    document.getElementById('renta_calle').value = '';
                    document.getElementById('renta_numero').value = '';
                    document.getElementById('renta_colonia').value = '';
                    document.getElementById('renta_municipio').value = '';
                    document.getElementById('renta_estado').value = '';
                    document.getElementById('renta_referencia').value = '';
                }
            });
            
            document.getElementById('btn-guardar-socioeconomicos')?.addEventListener('click', guardarDatosSocioeconomicos);
            
        } catch (error) {
            console.error('Error al cargar datos socioeconómicos:', error);
        }
    };
    
    const guardarDatosSocioeconomicos = async () => {
        try {
            State.setLoading(true);
            
            // Obtener el valor del checkbox de renta fuera
            const renta_fuera = document.getElementById('se_renta_fuera').checked;
            
            // Preparar datos básicos
            const datos = {
                recursos_economicos: document.getElementById('se_recursos_economicos').value || null,
                dependencia_economica: document.getElementById('se_dependencia_economica').value || null,
                alguien_depende_ti: document.getElementById('se_alguien_depende_ti').checked,
                trabaja: document.getElementById('se_trabaja').checked,
                lugar_trabajo: document.getElementById('se_lugar_trabajo').value || null,
                horario_trabajo: document.getElementById('se_horario_trabajo').value || null,
                renta_fuera_domicilio: renta_fuera
            };
            
            // Si renta fuera, agregar domicilio de renta
            if (renta_fuera) {
                const valoresRenta = window.selectorRenta.getValues();

                const calle = document.getElementById('renta_calle').value;
                const numero = document.getElementById('renta_numero').value;
                const colonia = document.getElementById('renta_colonia').value;
                
                // Validar campos requeridos
                if (!calle || !numero || !colonia || !valoresRenta.municipio || !valoresRenta.estado) {
                    Alert.error('Por favor completa todos los campos del domicilio de renta');
                    State.setLoading(false);
                    return;
                }
                
                datos.domicilio_renta = {
                    calle: calle,
                    numero: numero,
                    colonia: colonia,
                    municipio: valoresRenta.municipio,
                    estado: valoresRenta.estado,
                    referencia: document.getElementById('renta_referencia').value || null
                };
            }
            
            const response = await API.put('/portal-alumno/datos-socioeconomicos', datos);
            
            if (response.success) {
                Alert.success('Datos socioeconómicos actualizados correctamente');
            }
            
        } catch (error) {
            console.error('Error al guardar datos socioeconómicos:', error);
            Alert.error(error.message || 'Error al guardar los datos');
        } finally {
            State.setLoading(false);
        }
    };

// ============================================
// TAB: DATOS ACADÉMICOS
// ============================================

const renderTabDatosAcademicos = () => {
    return `
        <div class="card">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0"><i class="bi bi-book-fill me-2"></i>Datos Académicos</h5>
            </div>
            <div class="card-body">
                <form id="form-academico">

                    <h6 class="border-bottom pb-2 mb-3 text-success">
                        <i class="bi bi-calendar-check me-2"></i>Información de Generación
                    </h6>
                    
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        La generación indica el año en que ingresaste a la institución.
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Generación *</label>
                            <input type="number" class="form-control" id="acad_generacion" 
                                   min="2000" max="2030" placeholder="2024" required>
                            <div class="form-text">Año de ingreso a la Normal</div>
                        </div>
                    </div>
                
                    <h6 class="border-bottom pb-2 mb-3 text-success">
                        <i class="bi bi-building me-2"></i>Escuela de Procedencia
                    </h6>
                    
                    <div class="row">
                        <div class="col-md-8 mb-3">
                            <label class="form-label">Escuela de Procedencia</label>
                            <input type="text" class="form-control" id="acad_escuela_procedencia"
                                   placeholder="Nombre de la preparatoria o bachillerato">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Promedio de Media Superior</label>
                            <input type="number" class="form-control" id="acad_promedio" 
                                   min="0" max="10" step="0.01" placeholder="8.5">
                        </div>
                    </div>
                    
                    <h6 class="border-bottom pb-2 mb-3 mt-4 text-success">
                        <i class="bi bi-clipboard-check me-2"></i>Situación Académica
                    </h6>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">Situación Académica</label>
                            <select class="form-select" id="acad_situacion">
                                <option value="">Seleccionar...</option>
                                <option value="Regular">Regular</option>
                                <option value="Irregular">Irregular</option>
                                <option value="Recursando">Recursando</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">¿Tienes cursos irregulares?</label>
                            <textarea class="form-control" id="acad_cursos_irregulares" rows="2"
                                      placeholder="Lista los cursos si aplica"></textarea>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Curso de Mayor Dificultad</label>
                            <input type="text" class="form-control" id="acad_curso_dificultad"
                                   placeholder="Ej: Matemáticas, Física, etc.">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Motivo de la Dificultad</label>
                            <input type="text" class="form-control" id="acad_motivo_dificultad"
                                   placeholder="Ej: Complejidad del tema, falta de tiempo">
                        </div>
                    </div>
                    
                    <div class="text-end mt-3">
                        <button type="button" class="btn btn-success" id="btn-guardar-academico">
                            <i class="bi bi-save me-2"></i>Guardar Datos Académicos
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const cargarDatosAcademicos = async () => {
    try {
        const response = await API.get('/portal-alumno/datos-academicos');
        
        if (response.success && response.data) {
            const datos = response.data;
            document.getElementById('acad_generacion').value = datos.generacion || '';
            document.getElementById('acad_escuela_procedencia').value = datos.escuela_procedencia || '';
            document.getElementById('acad_promedio').value = datos.promedio_media_superior || '';
            document.getElementById('acad_situacion').value = datos.situacion_academica || '';
            document.getElementById('acad_cursos_irregulares').value = datos.cursos_irregulares || '';
            document.getElementById('acad_curso_dificultad').value = datos.curso_mayor_dificultad || '';
            document.getElementById('acad_motivo_dificultad').value = datos.motivo_dificultad || '';
        }
        
        document.getElementById('btn-guardar-academico')?.addEventListener('click', guardarDatosAcademicos);
        
    } catch (error) {
        console.error('Error al cargar datos académicos:', error);
    }
};

const guardarDatosAcademicos = async () => {
    try {
        const datos = {
            generacion: document.getElementById('acad_generacion').value || null,
            escuela_procedencia: document.getElementById('acad_escuela_procedencia').value || null,
            promedio_media_superior: document.getElementById('acad_promedio').value || null,
            situacion_academica: document.getElementById('acad_situacion').value || null,
            cursos_irregulares: document.getElementById('acad_cursos_irregulares').value || null,
            curso_mayor_dificultad: document.getElementById('acad_curso_dificultad').value || null,
            motivo_dificultad: document.getElementById('acad_motivo_dificultad').value || null
        };
        
        const response = await API.put('/portal-alumno/datos-academicos', datos);
        
        if (response.success) {
            Alert.success('Datos académicos actualizados correctamente');
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al guardar datos académicos');
    }
};

// ============================================
// TAB: DESEMPEÑO ACADÉMICO
// ============================================

const renderTabDesempeno = () => {
    return `
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0"><i class="bi bi-trophy-fill me-2"></i>Desempeño y Participación</h5>
            </div>
            <div class="card-body">
                <form id="form-desempeno">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Club en el que estás inscrito</label>
                            <input type="text" class="form-control" id="desp_club"
                                   placeholder="Ej: Club de robótica, deportivo, etc.">
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="form-check form-switch mt-4">
                                <input class="form-check-input" type="checkbox" id="desp_ponente">
                                <label class="form-check-label">¿Has participado como ponente?</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">Eventos en los que has participado</label>
                            <textarea class="form-control" id="desp_eventos" rows="3"
                                      placeholder="Describe los eventos académicos, culturales o deportivos..."></textarea>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">¿Te interesa participar en un intercambio académico?</label>
                            <textarea class="form-control" id="desp_intercambio" rows="2"
                                      placeholder="Describe tu interés y destinos preferidos..."></textarea>
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        Esta información nos ayuda a identificar oportunidades para tu desarrollo.
                    </div>
                    
                    <div class="text-end mt-3">
                        <button type="button" class="btn btn-primary" id="btn-guardar-desempeno">
                            <i class="bi bi-save me-2"></i>Guardar Desempeño
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const cargarDesempeno = async () => {
    try {
        const response = await API.get('/portal-alumno/desempeno');
        
        if (response.success && response.data) {
            const datos = response.data;
            document.getElementById('desp_club').value = datos.club_inscrito || '';
            document.getElementById('desp_eventos').value = datos.eventos_participados || '';
            document.getElementById('desp_ponente').checked = datos.participo_como_ponente || false;
            document.getElementById('desp_intercambio').value = datos.interes_intercambio || '';
        }
        
        document.getElementById('btn-guardar-desempeno')?.addEventListener('click', guardarDesempeno);
        
    } catch (error) {
        console.error('Error al cargar desempeño:', error);
    }
};

const guardarDesempeno = async () => {
    try {
        const datos = {
            club_inscrito: document.getElementById('desp_club').value || null,
            eventos_participados: document.getElementById('desp_eventos').value || null,
            participo_como_ponente: document.getElementById('desp_ponente').checked,
            interes_intercambio: document.getElementById('desp_intercambio').value || null
        };
        
        const response = await API.put('/portal-alumno/desempeno', datos);
        
        if (response.success) {
            Alert.success('Desempeño actualizado correctamente');
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al guardar desempeño');
    }
};

// ============================================
// TAB: CERTIFICACIONES
// ============================================

const renderTabCertificaciones = () => {
    return `
        <div class="card">
            <div class="card-header bg-warning d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-award-fill me-2"></i>Certificaciones</h5>
                <button class="btn btn-dark btn-sm" id="btn-nueva-certificacion">
                    <i class="bi bi-plus-circle me-1"></i>Agregar
                </button>
            </div>
            <div class="card-body">
                <div id="certificaciones-container">
                    <div class="text-center py-4">
                        <div class="spinner-border text-warning" role="status"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Certificación -->
        <div class="modal fade" id="modalCertificacion" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title">Agregar Certificación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-certificacion">
                            <div class="mb-3">
                                <label class="form-label">Nombre de la Certificación *</label>
                                <input type="text" class="form-control" id="cert_nombre" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Institución Emisora *</label>
                                <input type="text" class="form-control" id="cert_institucion" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Fecha de Obtención</label>
                                    <input type="date" class="form-control" id="cert_fecha_obtencion">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Fecha de Vencimiento</label>
                                    <input type="date" class="form-control" id="cert_fecha_vencimiento">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-warning" id="btn-guardar-certificacion">
                            <i class="bi bi-save me-2"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const cargarCertificaciones = async () => {
    try {
        const response = await API.get('/portal-alumno/certificaciones');
        renderCertificaciones(response.data || []);
        
        document.getElementById('btn-nueva-certificacion')?.addEventListener('click', () => {
            document.getElementById('form-certificacion').reset();
            const modal = new bootstrap.Modal(document.getElementById('modalCertificacion'));
            modal.show();
        });
        
        document.getElementById('btn-guardar-certificacion')?.addEventListener('click', agregarCertificacion);
        
    } catch (error) {
        console.error('Error:', error);
    }
};

const renderCertificaciones = (certificaciones) => {
    const container = document.getElementById('certificaciones-container');
    
    if (certificaciones.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-award fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay certificaciones registradas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-warning">
                    <tr>
                        <th>Certificación</th>
                        <th>Institución</th>
                        <th>Fecha Obtención</th>
                        <th>Vencimiento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${certificaciones.map(cert => `
                        <tr>
                            <td><strong>${escPortal(cert.nombre_certificacion)}</strong></td>
                            <td>${escPortal(cert.institucion_emisora)}</td>
                            <td>${cert.fecha_obtencion ? new Date(cert.fecha_obtencion).toLocaleDateString('es-MX') : '-'}</td>
                            <td>${cert.fecha_vencimiento ? new Date(cert.fecha_vencimiento).toLocaleDateString('es-MX') : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-eliminar-cert" data-id="${cert.id_certificacion}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Event listeners para eliminar
    document.querySelectorAll('.btn-eliminar-cert').forEach(btn => {
        btn.addEventListener('click', () => eliminarCertificacion(btn.dataset.id));
    });
};

const agregarCertificacion = async () => {
    try {
        const datos = {
            nombre_certificacion: document.getElementById('cert_nombre').value,
            institucion_emisora: document.getElementById('cert_institucion').value,
            fecha_obtencion: document.getElementById('cert_fecha_obtencion').value || null,
            fecha_vencimiento: document.getElementById('cert_fecha_vencimiento').value || null
        };
        
        if (!datos.nombre_certificacion || !datos.institucion_emisora) {
            Alert.error('Completa los campos requeridos');
            return;
        }
        
        const response = await API.post('/portal-alumno/certificaciones', datos);
        
        if (response.success) {
            Alert.success('Certificación agregada correctamente');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCertificacion'));
            modal.hide();
            await cargarCertificaciones();
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al agregar certificación');
    }
};

const eliminarCertificacion = async (id) => {
    if (!confirm('¿Eliminar esta certificación?')) return;
    
    try {
        const response = await API.delete(`/portal-alumno/certificaciones/${id}`);
        
        if (response.success) {
            Alert.success('Certificación eliminada');
            await cargarCertificaciones();
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al eliminar');
    }
};

// ============================================
// TAB: HABILIDADES
// ============================================

const renderTabHabilidades = () => {
    return `
        <div class="card">
            <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-gear-fill me-2"></i>Habilidades</h5>
                <button class="btn btn-light btn-sm" id="btn-nueva-habilidad">
                    <i class="bi bi-plus-circle me-1"></i>Agregar
                </button>
            </div>
            <div class="card-body">
                <div id="habilidades-container">
                    <div class="text-center py-4">
                        <div class="spinner-border text-info" role="status"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Habilidad -->
        <div class="modal fade" id="modalHabilidad" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">Agregar Habilidad</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-habilidad">
                            <div class="mb-3">
                                <label class="form-label">Nombre de la Habilidad *</label>
                                <input type="text" class="form-control" id="hab_nombre" required
                                       placeholder="Ej: Lectura y comprensión lectora, Hablar frente a grupo, Canto">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nivel *</label>
                                <select class="form-select" id="hab_nivel" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Básico">Básico</option>
                                    <option value="Intermedio">Intermedio</option>
                                    <option value="Avanzado">Avanzado</option>
                                    <option value="Experto">Experto</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Actitud hacia esta habilidad</label>
                                <input type="text" class="form-control" id="hab_actitud"
                                       placeholder="Ej: Me apasiona, Quiero mejorar">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-info text-white" id="btn-guardar-habilidad">
                            <i class="bi bi-save me-2"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const cargarHabilidades = async () => {
    try {
        const response = await API.get('/portal-alumno/habilidades');
        renderHabilidades(response.data || []);
        
        document.getElementById('btn-nueva-habilidad')?.addEventListener('click', () => {
            document.getElementById('form-habilidad').reset();
            const modal = new bootstrap.Modal(document.getElementById('modalHabilidad'));
            modal.show();
        });
        
        document.getElementById('btn-guardar-habilidad')?.addEventListener('click', agregarHabilidad);
        
    } catch (error) {
        console.error('Error:', error);
    }
};

const renderHabilidades = (habilidades) => {
    const container = document.getElementById('habilidades-container');
    
    if (habilidades.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-gear fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay habilidades registradas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${habilidades.map(hab => `
                <div class="col-md-6 mb-3">
                    <div class="card h-100 border-info">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="mb-0">${escPortal(hab.nombre_habilidad)}</h6>
                                <span class="badge bg-info">${escPortal(hab.nivel)}</span>
                            </div>
                            ${hab.actitud_habilidad ? `<p class="text-muted small mb-2">${escPortal(hab.actitud_habilidad)}</p>` : ''}
                            <button class="btn btn-sm btn-danger btn-eliminar-hab" data-id="${hab.id_alumno_habilidad}">
                                <i class="bi bi-trash me-1"></i>Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.querySelectorAll('.btn-eliminar-hab').forEach(btn => {
        btn.addEventListener('click', () => eliminarHabilidad(btn.dataset.id));
    });
};

const agregarHabilidad = async () => {
    try {
        const datos = {
            nombre_habilidad: document.getElementById('hab_nombre').value,
            nivel: document.getElementById('hab_nivel').value,
            actitud_habilidad: document.getElementById('hab_actitud').value || null
        };
        
        if (!datos.nombre_habilidad || !datos.nivel) {
            Alert.error('Completa los campos requeridos');
            return;
        }
        
        const response = await API.post('/portal-alumno/habilidades', datos);
        
        if (response.success) {
            Alert.success('Habilidad agregada correctamente');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalHabilidad'));
            modal.hide();
            await cargarHabilidades();
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al agregar habilidad');
    }
};

const eliminarHabilidad = async (id) => {
    if (!confirm('¿Eliminar esta habilidad?')) return;
    
    try {
        const response = await API.delete(`/portal-alumno/habilidades/${id}`);
        
        if (response.success) {
            Alert.success('Habilidad eliminada');
            await cargarHabilidades();
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al eliminar');
    }
};


// ============================================
// TAB: SALUD
// ============================================

const renderTabSalud = () => {
    return `
        <div class="card">
            <div class="card-header bg-danger text-white">
                <h5 class="mb-0">
                    <i class="bi bi-heart-pulse me-2"></i>Información de Salud
                </h5>
            </div>
            <div class="card-body">
                <form id="form-datos-salud">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Tipo de Sangre</label>
                            <select class="form-select" id="tipo_sangre">
                                <option value="">Seleccionar...</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Afiliación a Seguro Médico</label>
                            <input type="text" class="form-control" id="afiliacion_seguro_medico" 
                                placeholder="IMSS, ISSSTE, etc.">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Número de Seguro Social (NSS)</label>
                            <input type="text" class="form-control" id="numero_seguro_social"
                                placeholder="46127209461" maxlength="11"
                                pattern="[0-9]{11}"
                                title="El NSS debe tener 11 dígitos">
                            <small class="text-muted">11 dígitos del IMSS</small>
                        </div>

                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Alergias</label>
                        <textarea class="form-control" id="alergias" rows="3" 
                                placeholder="Describe alergias conocidas o escribe 'Ninguna'"></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="tiene_enfermedad">
                                <label class="form-check-label" for="tiene_enfermedad">
                                    ¿Padeces alguna enfermedad crónica?
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row" id="grupo_enfermedad" style="display:none;">
                        <div class="col-md-12 mb-3">
                            <label class="form-label">¿Qué enfermedad?</label>
                            <input type="text" class="form-control" id="nombre_enfermedad"
                                   placeholder="Describe la enfermedad">
                        </div>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        Esta información es confidencial y solo se usará en caso de emergencia.
                    </div>
                    
                    <div class="text-end">
                        <button type="submit" class="btn btn-danger">
                            <i class="bi bi-save me-2"></i>Guardar Información de Salud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const cargarDatosSalud = async () => {
    try {
        const response = await API.get('/portal-alumno/datos-salud');
        const datos = response.data;
        
        if (datos) {
            document.getElementById('tipo_sangre').value = datos.tipo_sangre || '';
            document.getElementById('afiliacion_seguro_medico').value = datos.afiliacion_seguro_medico || '';
            document.getElementById('numero_seguro_social').value = datos.numero_seguro_social || '';
            document.getElementById('alergias').value = datos.alergias || '';
            document.getElementById('tiene_enfermedad').checked = datos.tiene_enfermedad || false;
            document.getElementById('nombre_enfermedad').value = datos.nombre_enfermedad || '';
            
            // Mostrar campo de enfermedad si aplica
            if (datos.tiene_enfermedad) {
                document.getElementById('grupo_enfermedad').style.display = 'block';
            }
        }
        
        // Event listener para mostrar/ocultar campo de enfermedad
        document.getElementById('tiene_enfermedad')?.addEventListener('change', (e) => {
            document.getElementById('grupo_enfermedad').style.display = 
                e.target.checked ? 'block' : 'none';
        });
        
        // Event listener para guardar
        document.getElementById('form-datos-salud')?.addEventListener('submit', guardarDatosSalud);
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al cargar datos de salud');
    }
};

const guardarDatosSalud = async (e) => {
    e.preventDefault();
    
    const datos = {
        tipo_sangre: document.getElementById('tipo_sangre').value || null,
        afiliacion_seguro_medico: document.getElementById('afiliacion_seguro_medico').value || null,
        numero_seguro_social: document.getElementById('numero_seguro_social').value || null,
        alergias: document.getElementById('alergias').value || null,
        tiene_enfermedad: document.getElementById('tiene_enfermedad').checked,
        nombre_enfermedad: document.getElementById('nombre_enfermedad').value || null
    };
    
    try {
        const response = await API.post('/portal-alumno/datos-salud', datos);
        
        if (response.success) {
            Alert.success('Datos de salud actualizados correctamente');
        }
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al guardar datos de salud');
    }
};

// ============================================
// TAB: FAMILIARES
// ============================================

const renderTabFamiliares = () => {
    return `
        <div class="card">
            <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi bi-people-fill me-2"></i>Familiares y Tutores
                </h5>
                <button class="btn btn-light btn-sm" id="btn-nuevo-familiar">
                    <i class="bi bi-plus-circle me-1"></i>Agregar Familiar
                </button>
            </div>
            <div class="card-body">
                <div id="familiares-container">
                    <div class="text-center py-4">
                        <div class="spinner-border text-info" role="status"></div>
                        <p class="mt-2 text-muted">Cargando familiares...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderModalFamiliar = () => {
    return `
        <div class="modal fade" id="modalFamiliar" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-person-plus me-2"></i>Agregar Familiar
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-familiar">
                            <div class="mb-3">
                                <label class="form-label">Tipo de Familiar</label>
                                <select class="form-select" id="tipo_familiar" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Padre">Padre</option>
                                    <option value="Madre">Madre</option>
                                    <option value="Hermano/a">Hermano/a</option>
                                    <option value="Abuelo/a">Abuelo/a</option>
                                    <option value="Tío/a">Tío/a</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nombre Completo</label>
                                <input type="text" class="form-control" id="nombre_familiar" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Teléfono</label>
                                <input type="tel" class="form-control" id="telefono_familiar" maxlength="10">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Ocupación</label>
                                <input type="text" class="form-control" id="ocupacion_familiar">
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="es_tutor">
                                <label class="form-check-label" for="es_tutor">
                                    Es tutor legal
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-info" id="btn-guardar-familiar">
                            <i class="bi bi-save me-2"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const cargarFamiliares = async () => {
    try {
        const response = await API.get('/portal-alumno/familiares');
        renderFamiliares(response.data || []);
        
        // Event listener para botón nuevo familiar
        document.getElementById('btn-nuevo-familiar')?.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('modalFamiliar'));
            modal.show();
        });
        
        // Event listener para guardar familiar
        document.getElementById('btn-guardar-familiar')?.addEventListener('click', agregarFamiliar);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('familiares-container').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar familiares: ${escPortal(error.message)}
            </div>
        `;
    }
};

const renderFamiliares = (familiares) => {
    const container = document.getElementById('familiares-container');
    
    if (familiares.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-people fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay familiares registrados</p>
                <button class="btn btn-info" id="btn-nuevo-familiar-empty">
                    <i class="bi bi-plus-circle me-2"></i>Agregar Primer Familiar
                </button>
            </div>
        `;
        
        // Event listener para el botón en vista vacía
        document.getElementById('btn-nuevo-familiar-empty')?.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('modalFamiliar'));
            modal.show();
        });
        
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${familiares.map(f => `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="mb-0">${escPortal(f.nombre_completo)}</h6>
                                ${f.es_tutor ? '<span class="badge bg-warning">Tutor</span>' : ''}
                            </div>
                            <p class="text-muted mb-1">
                                <i class="bi bi-tag me-2"></i>${escPortal(f.tipo_familiar)}
                            </p>
                            <p class="text-muted mb-1">
                                <i class="bi bi-telephone me-2"></i>${escPortal(f.telefono || 'No especificado')}
                            </p>
                            <p class="text-muted mb-0">
                                <i class="bi bi-briefcase me-2"></i>${escPortal(f.ocupacion || 'No especificado')}
                            </p>
                            <div class="mt-3">
                                <button class="btn btn-sm btn-danger btn-eliminar-familiar" 
                                        data-id="${f.id_familiar}">
                                    <i class="bi bi-trash me-1"></i>Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Event listeners para eliminar
    document.querySelectorAll('.btn-eliminar-familiar').forEach(btn => {
        btn.addEventListener('click', () => eliminarFamiliar(btn.dataset.id));
    });
};

const agregarFamiliar = async () => {
    const datos = {
        tipo_familiar: document.getElementById('tipo_familiar').value,
        nombre_completo: document.getElementById('nombre_familiar').value,
        telefono: document.getElementById('telefono_familiar').value,
        ocupacion: document.getElementById('ocupacion_familiar').value,
        es_tutor: document.getElementById('es_tutor').checked
    };
    
    if (!datos.tipo_familiar || !datos.nombre_completo) {
        Alert.error('Completa los campos obligatorios');
        return;
    }
    
    try {
        const response = await API.post('/portal-alumno/familiares', datos);
        
        if (response.success) {
            Alert.success('Familiar agregado correctamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalFamiliar'));
            modal.hide();
            
            // Limpiar formulario
            document.getElementById('form-familiar').reset();
            
            // Recargar lista
            await cargarFamiliares();
        }
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al agregar familiar');
    }
};

const eliminarFamiliar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este familiar?')) return;
    
    try {
        const response = await API.delete(`/portal-alumno/familiares/${id}`);
        
        if (response.success) {
            Alert.success('Familiar eliminado correctamente');
            await cargarFamiliares();
        }
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al eliminar familiar');
    }
};

// ============================================
// TAB: CALIFICACIONES
// ============================================

const renderTabCalificaciones = () => {
    return `
        <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi bi-clipboard-data me-2"></i>Historial de Calificaciones
                </h5>
                <button class="btn btn-light btn-sm" data-accion="PortalAlumnoView.mostrarModalCalificacion">
                    <i class="bi bi-plus-circle me-1"></i>Agregar Calificación
                </button>
            </div>
            <div class="card-body">
                <div id="calificaciones-container">
                    <div class="text-center py-4">
                        <div class="spinner-border text-success" role="status"></div>
                        <p class="mt-2 text-muted">Cargando calificaciones...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Agregar Calificación -->
        <div class="modal fade" id="modalAgregarCalificacion" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">Agregar Calificación</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-calificacion">
                            <div class="mb-3">
                                <label class="form-label">Semestre *</label>
                                <input type="number" class="form-control" id="calif_semestre" 
                                       min="1" max="12" required placeholder="Ej: 1">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Promedio *</label>
                                <input type="number" class="form-control" id="calif_promedio" 
                                       min="0" max="10" step="0.01" required placeholder="Ej: 9.5">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success" data-accion="PortalAlumnoView.guardarCalificacion">
                            <i class="bi bi-check-circle me-1"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const agregarCalificacion = async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Agregar Calificación',
        html: `
            <div class="text-start mb-3">
                <label class="form-label">Semestre *</label>
                <input type="number" id="semestre" class="form-control" min="1" max="12" required>
            </div>
            <div class="text-start mb-3">
                <label class="form-label">Promedio *</label>
                <input type="number" id="promedio" class="form-control" min="0" max="10" step="0.01" required>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const semestre = document.getElementById('semestre').value;
            const promedio = document.getElementById('promedio').value;
            
            if (!semestre || !promedio) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }
            
            if (promedio < 0 || promedio > 10) {
                Swal.showValidationMessage('El promedio debe estar entre 0 y 10');
                return false;
            }
            
            return { semestre, promedio };
        }
    });
    
    if (formValues) {
        try {
            State.setLoading(true);
            
            const perfil = await API.get('/portal-alumno/perfil');
            const idAlumno = perfil.data.id_alumno;
            
            const response = await API.post(
                `/expedientes/${idAlumno}/calificaciones`,
                {
                    numero_semestre: parseInt(formValues.semestre),
                    promedio: parseFloat(formValues.promedio)
                }
            );
            
            if (response.success) {
                Alert.success('Calificación guardada correctamente');
                await cargarCalificaciones();
            }
        } catch (error) {
            Alert.error(error.message || 'Error al guardar la calificación');
        } finally {
            State.setLoading(false);
        }
    }
};

const renderCalificaciones = (data) => {
    const container = document.getElementById('calificaciones-container');
    const calificaciones = data.calificaciones || [];
    
    // FIX: Validar que promedio_general sea un número válido
    let promedioGeneral = parseFloat(data.promedio_general) || 0;
    
    if (calificaciones.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-clipboard-x fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay calificaciones registradas aún</p>
                <button class="btn btn-success" data-accion="PortalAlumnoView.mostrarModalCalificacion">
                    <i class="bi bi-plus-circle me-1"></i>Agregar Primera Calificación
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <!-- Promedio General -->
        <div class="alert alert-success text-center mb-4">
            <h4 class="mb-1">
                <i class="bi bi-star-fill me-2"></i>Promedio General
            </h4>
            <h2 class="mb-0">${promedioGeneral.toFixed(2)}</h2>
        </div>
        
        <!-- Tabla de Calificaciones -->
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-success">
                    <tr>
                        <th>Semestre</th>
                        <th>Promedio</th>
                        <th>Fecha de Registro</th>
                        <th>Estado</th>
                        <th class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${calificaciones.map(cal => {
                        const promedio = parseFloat(cal.promedio) || 0;
                        return `
                        <tr>
                            <td><strong>Semestre ${cal.numero_semestre}°</strong></td>
                            <td>
                                <span class="badge ${promedio >= 8 ? 'bg-success' : promedio >= 7 ? 'bg-warning' : 'bg-danger'}">
                                    ${promedio.toFixed(2)}
                                </span>
                            </td>
                            <td><small>${new Date(cal.fecha_registro).toLocaleDateString('es-MX')}</small></td>
                            <td>
                                ${promedio >= 6 
                                    ? '<span class="badge bg-success">Aprobado</span>' 
                                    : '<span class="badge bg-danger">Reprobado</span>'}
                            </td>
                            <td class="text-center">
                                <button class="btn btn-danger btn-sm" 
                                        data-accion="PortalAlumnoView.eliminarCalificacion" data-args="${Acciones.args(cal.numero_semestre)}"
                                        title="Eliminar calificación del semestre ${cal.numero_semestre}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const mostrarModalCalificacion = () => {
    // Limpiar formulario
    document.getElementById('form-calificacion').reset();
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarCalificacion'));
    modal.show();
};

const guardarCalificacion = async () => {
    try {
        const semestre = document.getElementById('calif_semestre').value;
        const promedio = document.getElementById('calif_promedio').value;
        
        // Validar
        if (!semestre || !promedio) {
            Alert.error('Todos los campos son obligatorios');
            return;
        }
        
        if (promedio < 0 || promedio > 10) {
            Alert.error('El promedio debe estar entre 0 y 10');
            return;
        }
        
        State.setLoading(true);
        
        // Obtener ID del alumno
        const perfil = await API.get('/portal-alumno/mi-informacion');
        const idAlumno = perfil.data.id_alumno;
        
        // Guardar calificación
        const response = await API.post(
            `/expedientes/${idAlumno}/calificaciones`,
            {
                numero_semestre: parseInt(semestre),
                promedio: parseFloat(promedio)
            }
        );
        
        if (response.success) {
            Alert.success('Calificación guardada correctamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarCalificacion'));
            modal.hide();
            
            // Recargar calificaciones
            await cargarCalificaciones();
        }
        
    } catch (error) {
        console.error('Error al guardar calificación:', error);
        Alert.error(error.message || 'Error al guardar la calificación');
    } finally {
        State.setLoading(false);
    }
};



const eliminarCalificacion = async (numero_semestre) => {
    // Confirmación antes de eliminar
    const confirmado = await Alert.confirm(
        '¿Eliminar calificación?',
        `¿Estás seguro de eliminar el promedio del Semestre ${numero_semestre}°? Esta acción no se puede deshacer.`
    );

    if (!confirmado) return;

    try {
        State.setLoading(true);

        const response = await API.delete(`/portal-alumno/calificaciones/${numero_semestre}`);

        if (response.success) {
            Alert.success('Calificación eliminada correctamente');
            await cargarCalificaciones(); // refresca la tabla
        }
    } catch (error) {
        console.error('Error al eliminar calificación:', error);
        Alert.error(error.message || 'Error al eliminar la calificación');
    } finally {
        State.setLoading(false);
    }
};


// ============================================
// TAB: DOCUMENTOS
// ============================================

const renderTabDocumentos = () => {
    return `
        <!-- Contenedor donde se cargará DocumentosView completo -->
        <div id="documentos-view-container"></div>
    `;
};

const cargarDocumentos = async () => {
    try {
        State.setLoading(true);
        
        // 1. Obtener información del alumno actual
        const perfil = await API.get('/portal-alumno/mi-informacion');
        const idAlumno = perfil.data.id_alumno;
        
        // 2. Cargar la interfaz de DocumentosView
        await cargarInterfazDocumentos(idAlumno);
        
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        document.getElementById('documentos-view-container').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-x-circle me-2"></i>
                Error al cargar documentos: ${escPortal(error.message)}
            </div>
        `;
    } finally {
        State.setLoading(false);
    }
};

const renderDocumentos = (documentos) => {
    const container = document.getElementById('documentos-container');
    
    if (documentos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-file-earmark-x fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay documentos disponibles</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-warning">
                    <tr>
                        <th><i class="bi bi-file-earmark-text me-2"></i>Documento</th>
                        <th>Tipo</th>
                        <th>Tamaño</th>
                        <th>Fecha</th>
                        <th>Subido por</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${documentos.map(doc => `
                        <tr>
                            <td>
                                <i class="bi bi-file-earmark-pdf text-danger me-2"></i>
                                ${escPortal(doc.nombre_archivo)}
                            </td>
                            <td><span class="badge bg-info">${escPortal(doc.tipo_documento)}</span></td>
                            <td><small>${doc.tamano_mb ? formatearTamaño(doc.tamano_mb) : '0 KB'}</small></td>
                            <td><small>${new Date(doc.fecha_subida).toLocaleDateString('es-MX')}</small></td>
                            <td><small>${escPortal(doc.subido_por || 'Sistema')}</small></td>
                            <td>
                                <button class="btn btn-sm btn-primary btn-descargar-doc" data-id="${doc.id}">
                                    <i class="bi bi-download"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Event listeners para descargar
    document.querySelectorAll('.btn-descargar-doc').forEach(btn => {
        btn.addEventListener('click', () => descargarDocumento(btn.dataset.id));
    });
};

const descargarDocumento = async (id) => {
    try {
        const response = await fetch(`${API.baseURL}/documentos/${id}/descargar`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Error al descargar documento');
        
        // Obtener el blob del archivo
        const blob = await response.blob();
        
        // Crear URL temporal y descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Alert.success('Documento descargado correctamente');
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al descargar documento');
    }
};

/**
 * Cargar interfaz completa de DocumentosView
 */
const cargarInterfazDocumentos = async (idAlumno) => {
    const container = document.getElementById('documentos-view-container');
    
    // Renderizar estructura
    container.innerHTML = `
        <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi bi-file-earmark-text me-2"></i>Mis Documentos
                </h5>
                <button class="btn btn-light btn-sm" id="btn-subir-doc-portal">
                    <i class="bi bi-cloud-upload me-1"></i>Subir Documento
                </button>
            </div>
            <div class="card-body">
                <!-- Loading -->
                <div id="loading-docs" class="text-center py-4">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2 text-muted">Cargando documentos...</p>
                </div>
                
                <!-- Lista de documentos -->
                <div id="lista-documentos" class="d-none"></div>
            </div>
        </div>
        
        <!-- Modal Subir Documento -->
        <div class="modal fade" id="modalSubirDocPortal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Subir Documento</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-subir-doc-portal">
                            <div class="mb-3">
                                <label class="form-label">Tipo de Documento *</label>
                                <select class="form-select" id="doc_tipo_portal" required>
                                    <option value="">Seleccionar...</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Archivo *</label>
                                <input 
                                    type="file" 
                                    class="form-control" 
                                    id="doc_archivo_portal"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    required
                                >
                                <small class="text-muted">
                                    Formatos: PDF, JPG, PNG, DOC, DOCX (Max. 10MB)
                                </small>
                            </div>
                            <div id="preview-doc-portal" class="d-none">
                                <div class="alert alert-info">
                                    <i class="bi bi-file-earmark me-2"></i>
                                    <span id="preview-nombre-portal"></span>
                                    <br>
                                    <small id="preview-tamaño-portal"></small>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="btn-guardar-doc-portal">
                            <i class="bi bi-cloud-upload me-1"></i>Subir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Cargar tipos de documentos y documentos
    await cargarTiposDocumentosPortal();
    await cargarListaDocumentosPortal(idAlumno);
    
    // Inicializar eventos
    initEventosDocumentosPortal(idAlumno);
};


/**
 * Cargar lista de documentos
 */
const cargarListaDocumentosPortal = async (idAlumno) => {
    try {
        const response = await API.get(`/documentos/alumno/${idAlumno}`);
        
        document.getElementById('loading-docs').classList.add('d-none');
        document.getElementById('lista-documentos').classList.remove('d-none');
        
        // FIX: La respuesta puede venir en response.data o directamente
        let documentos = [];
        
        if (response.success && response.data) {
            // Los documentos vienen dentro de response.data.documentos
            documentos = Array.isArray(response.data.documentos) 
            ? response.data.documentos 
            : (Array.isArray(response.data) ? response.data : []);
        } else if (Array.isArray(response)) {
            // Si viene directamente como array
            documentos = response;
        }
        
        console.log('Documentos cargados:', documentos); // Debug
        
        renderDocumentosPortal(documentos, idAlumno);
        
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        document.getElementById('loading-docs').classList.add('d-none');
        document.getElementById('lista-documentos').classList.remove('d-none');
        document.getElementById('lista-documentos').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-x-circle me-2"></i>
                Error al cargar documentos: ${escPortal(error.message)}
            </div>
        `;
    }
};

/**
 * Renderizar documentos
 */
const renderDocumentosPortal = (documentos, idAlumno) => {
    const container = document.getElementById('lista-documentos');
    
    if (!Array.isArray(documentos)) {
        console.error('documentos no es un array:', documentos);
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error al procesar los documentos. Por favor, recarga la página.
            </div>
        `;
        return;
    }
    
    if (documentos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay documentos subidos</p>
                <button class="btn btn-primary" id="btn-subir-primero">
                    <i class="bi bi-cloud-upload me-1"></i>Subir Primer Documento
                </button>
            </div>
        `;
        
        document.getElementById('btn-subir-primero')?.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('modalSubirDocPortal'));
            modal.show();
        });
        return;
    }
    
    // Agrupar por tipo
    const agrupados = documentos.reduce((acc, doc) => {
        const tipo = doc.tipo_documento || 'Sin clasificar';
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(doc);
        return acc;
    }, {});
    
    const baseURL = API.BASE_URL || '/api';

    let html = '<div class="accordion" id="accordionDocs">';
    
    Object.entries(agrupados).forEach(([tipo, docs], index) => {
        html += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#collapse${index}">
                        <i class="bi bi-folder2-open me-2"></i>
                        <strong>${escPortal(tipo)}</strong>
                        <span class="badge bg-primary ms-2">${docs.length}</span>
                    </button>
                </h2>
                <div id="collapse${index}" 
                     class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                     data-bs-parent="#accordionDocs">
                    <div class="accordion-body">
                        <div class="list-group">
                            ${docs.map(doc => `
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="bi ${getIconoArchivo(doc.nombre_archivo)} me-2 text-primary"></i>
                                            <strong>${escPortal(doc.nombre_archivo)}</strong>
                                            <br>
                                            <small class="text-muted">
                                                <i class="bi bi-calendar3 me-1"></i>
                                                ${new Date(doc.fecha_subida).toLocaleDateString('es-MX')}
                                                <span class="mx-2">•</span>
                                                ${formatearTamaño(doc.tamano_mb)}
                                            </small>
                                        </div>
                                        <div class="btn-group btn-group-sm">

                                            <button class="btn btn-outline-success" 
                                                    data-accion="PortalAlumnoView.descargarDocumentoPortal" data-args="${Acciones.args(idAlumno, doc.id_documento)}"
                                                    title="Descargar">
                                                <i class="bi bi-download"></i>
                                            </button>
                                            <button class="btn btn-outline-danger" 
                                                    data-accion="PortalAlumnoView.eliminarDocumentoPortal" data-args="${Acciones.args(idAlumno, doc.id_documento)}"
                                                    title="Eliminar">
                                                <i class="bi bi-trash"></i>
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <div class="alert alert-info mt-3 mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Total:</strong> ${documentos.length} documento(s)
        </div>
    `;
    
    container.innerHTML = html;
};



/**
 * Cargar tipos de documentos
 */
const cargarTiposDocumentosPortal = async () => {
    try {
        const response = await API.get('/documentos/tipos');
        const select = document.getElementById('doc_tipo_portal');
        
        if (response.success && response.data) {
            select.innerHTML = '<option value="">Seleccionar...</option>' +
                response.data.map(tipo => `<option value="${escPortal(tipo)}">${escPortal(tipo)}</option>`).join('');
        }
    } catch (error) {
        console.error('Error al cargar tipos:', error);
    }
};



/**
 * Helpers
 */
const getIconoArchivo = (nombreArchivo) => {
    const ext = nombreArchivo.split('.').pop().toLowerCase();
    const iconos = {
        'pdf': 'bi-file-pdf-fill text-danger',
        'jpg': 'bi-file-image-fill',
        'jpeg': 'bi-file-image-fill',
        'png': 'bi-file-image-fill',
        'doc': 'bi-file-word-fill text-primary',
        'docx': 'bi-file-word-fill text-primary'
    };
    return iconos[ext] || 'bi-file-earmark-fill';
};


const formatearTamaño = (mb) => {
    const tamaño = parseFloat(mb);
    
    // Si es NaN, null, undefined, o 0
    if (!tamaño || isNaN(tamaño)) {
        return '0 KB';
    }
    
    // Si es menor a 1 MB, mostrar en KB
    if (tamaño < 1) {
        return (tamaño * 1024).toFixed(2) + ' KB';
    }

    // Mostrar en MB
    return tamaño.toFixed(2) + ' MB';
};




/**
 * Inicializar eventos
 */
const initEventosDocumentosPortal = (idAlumno) => {
    // Botón subir
    document.getElementById('btn-subir-doc-portal')?.addEventListener('click', () => {
        document.getElementById('form-subir-doc-portal').reset();
        document.getElementById('preview-doc-portal').classList.add('d-none');
        const modal = new bootstrap.Modal(document.getElementById('modalSubirDocPortal'));
        modal.show();
    });
    
    // Preview archivo
    document.getElementById('doc_archivo_portal')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('preview-nombre-portal').textContent = file.name;
            document.getElementById('preview-tamaño-portal').textContent = 
                `Tamaño: ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
            document.getElementById('preview-doc-portal').classList.remove('d-none');
        }
    });
    
    // Botón guardar
    document.getElementById('btn-guardar-doc-portal')?.addEventListener('click', () => {
        subirDocumentoPortal(idAlumno);
    });
};




/**
 * Subir documento
 */
const subirDocumentoPortal = async (idAlumno) => {
    try {
        const form = document.getElementById('form-subir-doc-portal');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const tipo = document.getElementById('doc_tipo_portal').value;
        const archivo = document.getElementById('doc_archivo_portal').files[0];
        
        if (!archivo) {
            Alert.error('Selecciona un archivo');
            return;
        }
        
        if (archivo.size > 10 * 1024 * 1024) {
            Alert.error('El archivo no debe superar los 10MB');
            return;
        }
        
        State.setLoading(true);
        
        const formData = new FormData();
        formData.append('file', archivo);
        formData.append('tipo_documento', tipo);
        
        const response = await API.uploadFile(`/documentos/alumno/${idAlumno}`, formData);
        
        if (response.success) {
            Alert.success('Documento subido correctamente');
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSubirDocPortal'));
            modal.hide();
            
            // Recargar documentos
            await cargarListaDocumentosPortal(idAlumno);
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error(error.message || 'Error al subir documento');
    } finally {
        State.setLoading(false);
    }
};


/**
 * Eliminar documento
 */
const eliminarDocumentoPortal = async (idAlumno, idDocumento) => {
    
    const confirmar = confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.');
    
    if (!confirmar) return;
    
    try {
        State.setLoading(true);
        
        const response = await API.delete(`/documentos/alumno/${idAlumno}/${idDocumento}`);
        
        if (response.success) {
            Alert.success('Documento eliminado correctamente');
            await cargarListaDocumentosPortal(idAlumno);
        }
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al eliminar documento');
    } finally {
        State.setLoading(false);
    }
};

const descargarDocumentoPortal = async (idAlumno, idDocumento) => {
    try {
        const token = localStorage.getItem('token');
        const url = `${API.BASE_URL || '/api'}/documentos/alumno/${idAlumno}/descargar/${idDocumento}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al descargar');
        }
        
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        // Nombre real del archivo (antes se guardaba como "documento_5", sin extensión)
        link.download = Utils.nombreArchivoDescarga(
            response.headers.get('Content-Disposition'),
            `documento_${idDocumento}`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        
    } catch (error) {
        console.error('Error:', error);
        Alert.error('Error al descargar el documento');
    }
};

const cargarCalificaciones = async () => {
    try {
        const response = await API.get('/portal-alumno/calificaciones');
        renderCalificaciones(response.data);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('calificaciones-container').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-x-circle me-2"></i>
                Error al cargar calificaciones: ${escPortal(error.message)}
            </div>
        `;
    }
};


// ============================================
// TAB: BECAS
// ============================================

const renderTabBecas = () => {
    return `
        <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-currency-dollar me-2"></i>Becas</h5>
                <button class="btn btn-light btn-sm" id="btn-nueva-beca">
                    <i class="bi bi-plus-circle me-1"></i>Agregar Beca
                </button>
            </div>
            <div class="card-body">
                <div id="becas-container">
                    <div class="text-center py-4">
                        <div class="spinner-border text-success" role="status"></div>
                        <p class="mt-2">Cargando becas...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Beca -->
        <div class="modal fade" id="modalBeca" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <span id="modal-beca-title">Agregar Beca</span>
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-beca">
                            <input type="hidden" id="beca-id">
                            
                            <div class="mb-3">
                                <label class="form-label">Nombre de la Beca *</label>
                                <input type="text" class="form-control" id="beca-nombre" required 
                                       placeholder="Ej: Beca Benito Juárez">
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
                            
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="beca-activa" checked>
                                <label class="form-check-label" for="beca-activa">
                                    Beca actualmente activa
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success" id="btn-guardar-beca">
                            <i class="bi bi-save me-1"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ============================================
// TAB: MOVILIDAD ACADÉMICA
// ============================================

const renderTabMovilidad = () => {
    return `
        <div class="card">
            <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-airplane me-2"></i>Movilidad Académica</h5>
                <button class="btn btn-light btn-sm" id="btn-nueva-movilidad">
                    <i class="bi bi-plus-circle me-1"></i>Agregar Movilidad
                </button>
            </div>
            <div class="card-body">
                <div id="movilidad-container">
                    <div class="text-center py-4">
                        <div class="spinner-border text-info" role="status"></div>
                        <p class="mt-2">Cargando movilidades...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Movilidad -->
        <div class="modal fade" id="modalMovilidad" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <span id="modal-movilidad-title">Agregar Movilidad Académica</span>
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-movilidad">
                            <input type="hidden" id="movilidad-id">
                            
                            <div class="mb-3">
                                <label class="form-label">Nombre del Programa *</label>
                                <input type="text" class="form-control" id="movilidad-nombre" required 
                                       placeholder="Ej: Intercambio en España">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Lugar</label>
                                <input type="text" class="form-control" id="movilidad-lugar" 
                                       placeholder="Ej: Madrid, España">
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
                                <label class="form-label">Relato de tu Experiencia</label>
                                <textarea class="form-control" id="movilidad-relato" rows="4"
                                          placeholder="Describe tu experiencia durante la movilidad académica..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-info" id="btn-guardar-movilidad">
                            <i class="bi bi-save me-1"></i>Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// ============================================
// TAB: PRÁCTICAS PROFESIONALES
// ============================================

const renderTabPracticas = () => {
    return `
        <div class="container-fluid py-4">
            <div class="row">
                <div class="col-12">
                    <!-- Encabezado -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 class="mb-1">
                                <i class="bi bi-briefcase me-2"></i>
                               Escuela de  Prácticas Profesionales
                            </h4>
                            <p class="text-muted mb-0">Historial completo de prácticas por periodo escolar</p>
                        </div>
                        <button class="btn btn-primary" id="btn-nueva-practica">
                            <i class="bi bi-plus-circle me-2"></i>Registrar Escuela de Práctica
                        </button>
                    </div>

                    <!-- Tabla de prácticas -->
                    <div class="card">
                        <div class="card-body">
                            <div id="loading-practicas" class="text-center py-5 d-none">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                <p class="mt-2 text-muted">Cargando prácticas...</p>
                            </div>
                            
                            <div id="practicas-table"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para agregar/editar práctica -->
        <div class="modal fade" id="modalPractica" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalPracticaTitle">Nueva Escuela de Práctica</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="form-practica">
                            <input type="hidden" id="practica-id">
                            
                            <!-- Sección 1: Periodo y Semestre -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-calendar-event me-2"></i>Periodo Escolar</h6>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-periodo" class="form-label">Periodo Escolar *</label>
                                        <input type="text" class="form-control" id="practica-periodo" required
                                               placeholder="Ej: 2024-A, 2024-B">
                                        <small class="text-muted">Formato: AÑO-PERIODO (A=Enero-Junio, B=Agosto-Diciembre)</small>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-semestre" class="form-label">Semestre Cursado *</label>
                                        <input type="number" class="form-control" id="practica-semestre" required
                                               min="1" max="8" placeholder="Ej: 6">
                                    </div>
                                </div>
                            </div>

                            <!-- Sección 2: Escuela de Práctica -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-building me-2"></i>Escuela de Práctica</h6>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-escuela" class="form-label">Nombre de la Escuela *</label>
                                        <input type="text" class="form-control" id="practica-escuela" required
                                               placeholder="Ej: Jardín de Niños Benito Juárez">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-cct" class="form-label">CCT (Clave de Centro de Trabajo) *</label>
                                        <input type="text" class="form-control" id="practica-cct" required
                                               maxlength="15" placeholder="Ej: 15EJN0001A">
                                        <small class="text-muted">15 caracteres</small>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-nivel" class="form-label">Nivel Educativo *</label>
                                        <select class="form-select" id="practica-nivel" required>
                                            <option value="">Seleccionar...</option>
                                            <option value="Preescolar">Preescolar</option>
                                            <option value="Primaria">Primaria</option>
                                            <option value="Secundaria">Secundaria</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label for="practica-estado" class="form-label">Estado *</label>
                                        <select class="form-select" id="practica-estado" required>
                                            <option value="">Seleccionar estado...</option>
                                        </select>
                                    </div>

                                    <div class="col-md-4 mb-3">
                                        <label for="practica-municipio" class="form-label">Municipio *</label>
                                        <select class="form-select" id="practica-municipio" required disabled>
                                            <option value="">Seleccionar municipio...</option>
                                        </select>
                                    </div>

                                </div>
                            </div>

                            <!-- Sección 3: Duración y Desempeño -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-clock-history me-2"></i>Duración y Desempeño</h6>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-fecha-inicio" class="form-label">Fecha de Inicio *</label>
                                        <input type="date" class="form-control" id="practica-fecha-inicio" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-fecha-fin" class="form-label">Fecha de Fin *</label>
                                        <input type="date" class="form-control" id="practica-fecha-fin" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="practica-horas" class="form-label">Horas Totales</label>
                                        <input type="number" class="form-control" id="practica-horas"
                                               min="0" placeholder="Ej: 150">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="practica-tutor" class="form-label">Tutor Asignado</label>
                                        <input type="text" class="form-control" id="practica-tutor"
                                               placeholder="Ej: Profra. María López García">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="practica-calificacion" class="form-label">Calificación</label>
                                        <input type="number" class="form-control" id="practica-calificacion"
                                               min="0" max="10" step="0.1" placeholder="Ej: 9.5">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="practica-estado-select" class="form-label">Estado</label>
                                        <select class="form-select" id="practica-estado-select">
                                            <option value="En curso">En curso</option>
                                            <option value="Completada">Completada</option>
                                            <option value="Cancelada">Cancelada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Sección 4: Habilidades y Observaciones -->
                            <div class="border-bottom pb-3 mb-4">
                                <h6 class="text-primary"><i class="bi bi-star me-2"></i>Habilidades y Observaciones</h6>
                                <div class="mb-3">
                                    <label for="practica-habilidades" class="form-label">Habilidades Desarrolladas</label>
                                    <textarea class="form-control" id="practica-habilidades" rows="3"
                                              placeholder="Ej: Planeación didáctica, manejo de grupo, evaluación formativa..."></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="practica-observaciones" class="form-label">Observaciones</label>
                                    <textarea class="form-control" id="practica-observaciones" rows="2"
                                              placeholder="Comentarios adicionales..."></textarea>
                                </div>
                            </div>

                            <!-- Sección 5: Incidentes -->
                            <div>
                                <h6 class="text-primary"><i class="bi bi-exclamation-triangle me-2"></i>Seguimiento</h6>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="practica-reglamento" checked>
                                    <label class="form-check-label" for="practica-reglamento">
                                        Siguió las orientaciones del reglamento de prácticas
                                    </label>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="practica-incidentes">
                                    <label class="form-check-label" for="practica-incidentes">
                                        Tuvo incidentes durante las prácticas
                                    </label>
                                </div>
                                <div id="relato-incidentes-container" style="display: none;">
                                    <label class="form-label">Relato de Incidentes</label>
                                    <textarea class="form-control" id="practica-relato-incidentes" rows="3"
                                              placeholder="Describe los incidentes que ocurrieron..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="btn-guardar-practica">
                            <i class="bi bi-save me-2"></i>Guardar Práctica
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};




// ============================================
// FUNCIONES DE CARGA: BECAS
// ============================================

const cargarBecas = async () => {
    try {
        const response = await API.get('/portal-alumno/becas');
        
        if (response.success) {
            const becas = response.data;
            
            if (becas.length === 0) {
                document.getElementById('becas-container').innerHTML = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        No tienes becas registradas. Haz clic en "Agregar Beca" para registrar una.
                    </div>
                `;
            } else {
                const becasHTML = becas.map(b => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h5 class="card-title mb-2">
                                        ${escPortal(b.nombre_beca)}
                                        ${b.activa ? '<span class="badge bg-success ms-2">Activa</span>' : '<span class="badge bg-secondary ms-2">Inactiva</span>'}
                                    </h5>
                                    <p class="card-text mb-1">
                                        <strong>Inicio:</strong> ${b.fecha_inicio ? new Date(b.fecha_inicio).toLocaleDateString('es-MX') : 'No especificado'}
                                    </p>
                                    <p class="card-text">
                                        <strong>Fin:</strong> ${b.fecha_fin ? new Date(b.fecha_fin).toLocaleDateString('es-MX') : 'No especificado'}
                                    </p>
                                </div>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary" data-accion="PortalAlumnoView.editarBeca" data-args="${Acciones.args(b.id_beca)}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" data-accion="PortalAlumnoView.eliminarBeca" data-args="${Acciones.args(b.id_beca)}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                document.getElementById('becas-container').innerHTML = becasHTML;
            }
        }
        
        // Event listeners para botones
        document.getElementById('btn-nueva-beca')?.addEventListener('click', mostrarModalBeca);
        document.getElementById('btn-guardar-beca')?.addEventListener('click', guardarBeca);
        
    } catch (error) {
        console.error('Error al cargar becas:', error);
        Alert.error('Error al cargar becas');
    }
};

// ============================================
// FUNCIONES DE CARGA: MOVILIDAD
// ============================================

const cargarMovilidades = async () => {
    try {
        const response = await API.get('/portal-alumno/movilidad');
        
        if (response.success) {
            const movilidades = response.data;
            
            if (movilidades.length === 0) {
                document.getElementById('movilidad-container').innerHTML = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        No tienes movilidades registradas. Haz clic en "Agregar Movilidad" para registrar una.
                    </div>
                `;
            } else {
                const movilidadesHTML = movilidades.map(m => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <h5 class="card-title mb-2">
                                        <i class="bi bi-airplane text-info me-2"></i>
                                        ${escPortal(m.nombre_programa)}
                                    </h5>
                                    ${m.lugar ? `<p class="card-text mb-1"><strong>Lugar:</strong> ${escPortal(m.lugar)}</p>` : ''}
                                    <p class="card-text mb-1">
                                        <strong>Periodo:</strong> 
                                        ${m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString('es-MX') : '?'} - 
                                        ${m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString('es-MX') : '?'}
                                    </p>
                                    ${m.relato_experiencia ? `
                                        <p class="card-text mt-2">
                                            <strong>Experiencia:</strong><br>
                                            ${escPortal(m.relato_experiencia)}
                                        </p>
                                    ` : ''}
                                </div>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary" data-accion="PortalAlumnoView.editarMovilidad" data-args="${Acciones.args(m.id_movilidad)}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" data-accion="PortalAlumnoView.eliminarMovilidad" data-args="${Acciones.args(m.id_movilidad)}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                document.getElementById('movilidad-container').innerHTML = movilidadesHTML;
            }
        }
        
        // Event listeners
        document.getElementById('btn-nueva-movilidad')?.addEventListener('click', mostrarModalMovilidad);
        document.getElementById('btn-guardar-movilidad')?.addEventListener('click', guardarMovilidad);
        
    } catch (error) {
        console.error('Error al cargar movilidades:', error);
        Alert.error('Error al cargar movilidades');
    }
};

// ============================================
// FUNCIONES DE CARGA: PRÁCTICAS
// ============================================

const cargarPracticasAlumno = async () => {
    try {
        document.getElementById('loading-practicas')?.classList.remove('d-none');
        
        const response = await API.get(`/practicas/alumno/${alumnoData.id_alumno}`);
        
        if (response.success) {
            renderTablaPracticas(response.data);
        }
        
    } catch (error) {
        console.error('Error al cargar prácticas:', error);
        document.getElementById('practicas-table').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar el historial de prácticas: ${escPortal(error.message)}
            </div>
        `;
    } finally {
        document.getElementById('loading-practicas')?.classList.add('d-none');
    }
};

// Alias para compatibilidad con el event listener existente
const cargarPracticas = cargarPracticasAlumno;  



// ============================================
// RENDERIZAR TABLA DE PRÁCTICAS
// ============================================
const renderTablaPracticas = (practicas) => {
    const container = document.getElementById('practicas-table');
    
    if (practicas.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-briefcase fs-1 text-muted"></i>
                <p class="text-muted mt-3">No hay prácticas registradas</p>
                <button class="btn btn-primary" data-accion="PortalAlumnoView.abrirModalPractica">
                    <i class="bi bi-plus-circle me-2"></i>Registrar Primera Escuela de Práctica
                </button>
            </div>
        `;
        return;
    }
    
    //  VERSIÓN RESPONSIVE: Tabla en escritorio, Cards en móvil
    container.innerHTML = `
        <!-- VERSIÓN MÓVIL (Cards) -->
        <div class="d-md-none">
            ${practicas.map(p => `
                <div class="card mb-3 shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">${escPortal(p.nombre_escuela)}</h6>
                                <small>${escPortal(p.periodo_escolar)} - Semestre ${escPortal(p.semestre_cursado)}°</small>
                            </div>
                            <span class="badge bg-${getEstadoBadgeClass(p.situacion)}">
                                ${escPortal(p.situacion)}
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row g-2">
                            <div class="col-6">
                                <small class="text-muted">CCT:</small><br>
                                <strong>${escPortal(p.cct_escuela)}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Nivel:</small><br>
                                <span class="badge bg-info">${escPortal(p.nivel_educativo)}</span>
                            </div>
                            <div class="col-12 mt-2">
                                <small class="text-muted">Ubicación:</small><br>
                                <span>${escPortal(p.municipio)}, ${escPortal(p.estado)}</span>
                            </div>
                            <div class="col-6 mt-2">
                                <small class="text-muted">Inicio:</small><br>
                                ${formatearFecha(p.fecha_inicio)}
                            </div>
                            <div class="col-6 mt-2">
                                <small class="text-muted">Fin:</small><br>
                                ${formatearFecha(p.fecha_fin)}
                            </div>
                            ${p.calificacion_obtenida ? `
                                <div class="col-12 mt-2">
                                    <small class="text-muted">Calificación:</small><br>
                                    <strong>${escPortal(p.calificacion_obtenida)}</strong>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-footer bg-light">
                        <div class="btn-group btn-group-sm w-100">
                            <button class="btn btn-outline-primary" 
                                    data-accion="PortalAlumnoView.editarPractica" data-args="${Acciones.args(p.id_practica)}"
                                    title="Editar">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-outline-danger" 
                                    data-accion="PortalAlumnoView.eliminarPractica" data-args="${Acciones.args(p.id_practica)}"
                                    title="Eliminar">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!--  VERSIÓN ESCRITORIO (Tabla) -->
        <div class="d-none d-md-block">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Periodo</th>
                            <th>Sem.</th>
                            <th>Escuela</th>
                            <th>Nivel</th>
                            <th>Ubicación</th>
                            <th>Fechas</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${practicas.map(p => `
                            <tr>
                                <td><strong>${escPortal(p.periodo_escolar)}</strong></td>
                                <td class="text-center">${escPortal(p.semestre_cursado)}°</td>
                                <td>
                                    ${escPortal(p.nombre_escuela)}<br>
                                    <small class="text-muted">CCT: ${escPortal(p.cct_escuela)}</small>
                                </td>
                                <td><span class="badge bg-info">${escPortal(p.nivel_educativo)}</span></td>
                                <td><small>${escPortal(p.municipio)}, ${escPortal(p.estado)}</small></td>
                                <td>
                                    <small>
                                        ${formatearFecha(p.fecha_inicio)}<br>
                                        ${formatearFecha(p.fecha_fin)}
                                    </small>
                                </td>
                                <td>
                                    <span class="badge bg-${getEstadoBadgeClass(p.situacion)}">
                                        ${escPortal(p.situacion)}
                                    </span>
                                    ${p.calificacion_obtenida ? `<br><small>Cal: ${escPortal(p.calificacion_obtenida)}</small>` : ''}
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" 
                                                data-accion="PortalAlumnoView.editarPractica" data-args="${Acciones.args(p.id_practica)}"
                                                title="Editar">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" 
                                                data-accion="PortalAlumnoView.eliminarPractica" data-args="${Acciones.args(p.id_practica)}"
                                                title="Eliminar">
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
        
        <div class="alert alert-info mt-3 mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Total:</strong> ${practicas.length} práctica(s) profesional(es)
        </div>
    `;
};

// ============================================
// ABRIR MODAL PARA NUEVA PRÁCTICA
// ============================================
const abrirModalPractica = () => {
    document.getElementById('modalPracticaTitle').textContent = 'Nueva Práctica Profesional';
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
    document.getElementById('relato-incidentes-container').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('modalPractica'));
    modal.show();
};

// ============================================
// EDITAR PRÁCTICA EXISTENTE
// ============================================
const editarPractica = async (id) => {
    try {
        State.setLoading(true);
        
        const response = await API.get(`/practicas/${id}`);
        
        if (response.success) {
            const p = response.data;
            
            document.getElementById('modalPracticaTitle').textContent = 'Editar Práctica Profesional';
            document.getElementById('practica-id').value = p.id_practica;
            document.getElementById('practica-periodo').value = p.periodo_escolar;
            document.getElementById('practica-semestre').value = p.semestre_cursado;
            document.getElementById('practica-escuela').value = p.nombre_escuela;
            document.getElementById('practica-cct').value = p.cct_escuela;
            document.getElementById('practica-nivel').value = p.nivel_educativo;

            if (!window.selectorPractica) {
                window.selectorPractica = new EstadoMunicipioSelector(
                    'practica-estado',
                    'practica-municipio',
                    ESTADOS_MUNICIPIOS
                );
            }
            
            if (p.estado && p.municipio) {
                window.selectorPractica.setValues(p.estado, p.municipio);
            }

            document.getElementById('practica-fecha-inicio').value = p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '';
            document.getElementById('practica-fecha-fin').value = p.fecha_fin ? p.fecha_fin.split('T')[0] : '';

            document.getElementById('practica-horas').value = p.horas_totales || '';
            document.getElementById('practica-tutor').value = p.tutor_asignado || '';
            document.getElementById('practica-calificacion').value = p.calificacion_obtenida || '';
            
            document.getElementById('practica-estado-select').value = p.situacion || 'En curso';
            
            document.getElementById('practica-habilidades').value = p.habilidades_desarrolladas || '';
            document.getElementById('practica-observaciones').value = p.observaciones || '';
            document.getElementById('practica-reglamento').checked = p.sigue_orientacion_reglamento || false;
            document.getElementById('practica-incidentes').checked = p.tiene_incidentes || false;
            document.getElementById('practica-relato-incidentes').value = p.relato_incidentes || '';
            
            if (p.tiene_incidentes) {
                document.getElementById('relato-incidentes-container').style.display = 'block';
            } else {
                document.getElementById('relato-incidentes-container').style.display = 'none';
            }
            
            const modal = new bootstrap.Modal(document.getElementById('modalPractica'));
            modal.show();
        }
        
    } catch (error) {
        console.error('Error al cargar práctica:', error);
        Alert.error('Error al cargar los datos de la práctica');
    } finally {
        State.setLoading(false);
    }
};


// ============================================
// GUARDAR PRÁCTICA
// ============================================
const guardarPractica = async () => {
    const form = document.getElementById('form-practica');
    const valoresPractica = window.selectorPractica.getValues();
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('practica-id').value;
    const datos = {
        periodo_escolar: document.getElementById('practica-periodo').value,
        semestre_cursado: parseInt(document.getElementById('practica-semestre').value),
        nombre_escuela: document.getElementById('practica-escuela').value,
        cct_escuela: document.getElementById('practica-cct').value.toUpperCase(),
        nivel_educativo: document.getElementById('practica-nivel').value,

        municipio: valoresPractica.municipio,
        estado: valoresPractica.estado,
        
        fecha_inicio: document.getElementById('practica-fecha-inicio').value,
        fecha_fin: document.getElementById('practica-fecha-fin').value,
        horas_totales: document.getElementById('practica-horas').value || null,
        tutor_asignado: document.getElementById('practica-tutor').value || null,
        calificacion_obtenida: document.getElementById('practica-calificacion').value || null,
        situacion: document.getElementById('practica-estado-select').value,
        habilidades_desarrolladas: document.getElementById('practica-habilidades').value || null,
        observaciones: document.getElementById('practica-observaciones').value || null,
        sigue_orientacion_reglamento: document.getElementById('practica-reglamento').checked,
        tiene_incidentes: document.getElementById('practica-incidentes').checked,
        relato_incidentes: document.getElementById('practica-relato-incidentes').value || null
    };
    
    // Validaciones
    if (!datos.municipio || !datos.estado) {
        Alert.error('Por favor selecciona estado y municipio');
        return;
    }
        
    try {
        State.setLoading(true);
        
        let response;
        if (id) {
            // Actualizar
            response = await API.put(`/practicas/${id}`, datos);
        } else {
            // Crear
            response = await API.post(`/practicas/alumno/${alumnoData.id_alumno}`, datos);
        }
        
        if (response.success) {
            Alert.success(response.message);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPractica'));
            modal.hide();
            
            await cargarPracticasAlumno();
        }
        
    } catch (error) {
        console.error('Error al guardar práctica:', error);
        Alert.error(error.message || 'Error al guardar la práctica');
    } finally {
        State.setLoading(false);
    }
};

// ============================================
// ELIMINAR PRÁCTICA
// ============================================
const eliminarPractica = async (id) => {
    const confirmed = confirm('¿Estás seguro de eliminar esta práctica? Esta acción no se puede deshacer.');
    
    if (!confirmed) return;
    
    try {
        State.setLoading(true);
        
        const response = await API.delete(`/practicas/${id}`);
        
        if (response.success) {
            Alert.success('Práctica eliminada correctamente');
            await cargarPracticasAlumno();
        }
        
    } catch (error) {
        console.error('Error al eliminar práctica:', error);
        Alert.error('Error al eliminar la práctica');
    } finally {
        State.setLoading(false);
    }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================
const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getEstadoBadgeClass = (estado) => {
    const clases = {
        'En curso': 'warning',
        'Completada': 'success',
        'Cancelada': 'danger'
    };
    return clases[estado] || 'secondary';
};




// ============================================
// MANEJO DE BECAS
// ============================================

const mostrarModalBeca = (id = null) => {
    // Limpiar formulario
    document.getElementById('form-beca').reset();
    document.getElementById('beca-id').value = '';
    document.getElementById('modal-beca-title').textContent = 'Agregar Beca';
    
    if (id) {
        // Modo edición - cargar datos
        document.getElementById('modal-beca-title').textContent = 'Editar Beca';
        cargarDatosBeca(id);
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalBeca'));
    modal.show();
};

const cargarDatosBeca = async (id) => {
    try {
        const response = await API.get('/portal-alumno/becas');
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
            // Actualizar
            response = await API.put(`/portal-alumno/becas/${id}`, data);
        } else {
            // Crear
            response = await API.post('/portal-alumno/becas', data);
        }
        
        if (response.success) {
            Alert.success(id ? 'Beca actualizada correctamente' : 'Beca agregada correctamente');
            bootstrap.Modal.getInstance(document.getElementById('modalBeca')).hide();
            await cargarBecas();
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
        const response = await API.delete(`/portal-alumno/becas/${id}`);
        
        if (response.success) {
            Alert.success('Beca eliminada correctamente');
            await cargarBecas();
        }
        
    } catch (error) {
        console.error('Error al eliminar beca:', error);
        Alert.error('Error al eliminar la beca');
    }
};

// ============================================
// MANEJO DE MOVILIDAD
// ============================================

const mostrarModalMovilidad = (id = null) => {
    // Limpiar formulario
    document.getElementById('form-movilidad').reset();
    document.getElementById('movilidad-id').value = '';
    document.getElementById('modal-movilidad-title').textContent = 'Agregar Movilidad Académica';
    
    if (id) {
        // Modo edición
        document.getElementById('modal-movilidad-title').textContent = 'Editar Movilidad Académica';
        cargarDatosMovilidad(id);
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalMovilidad'));
    modal.show();
};

const cargarDatosMovilidad = async (id) => {
    try {
        const response = await API.get('/portal-alumno/movilidad');
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
            // Actualizar
            response = await API.put(`/portal-alumno/movilidad/${id}`, data);
        } else {
            // Crear
            response = await API.post('/portal-alumno/movilidad', data);
        }
        
        if (response.success) {
            Alert.success(id ? 'Movilidad actualizada correctamente' : 'Movilidad agregada correctamente');
            bootstrap.Modal.getInstance(document.getElementById('modalMovilidad')).hide();
            await cargarMovilidades();
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
        const response = await API.delete(`/portal-alumno/movilidad/${id}`);
        
        if (response.success) {
            Alert.success('Movilidad eliminada correctamente');
            await cargarMovilidades();
        }
        
    } catch (error) {
        console.error('Error al eliminar movilidad:', error);
        Alert.error('Error al eliminar la movilidad');
    }
};






    
    const initEventListeners = () => {
        document.getElementById('domicilio-tab')?.addEventListener('shown.bs.tab', cargarDomicilio);
        document.getElementById('socioeconomicos-tab')?.addEventListener('shown.bs.tab', cargarDatosSocioeconomicos);
        document.getElementById('salud-tab')?.addEventListener('shown.bs.tab', cargarDatosSalud);
        document.getElementById('familiares-tab')?.addEventListener('shown.bs.tab', cargarFamiliares);
        document.getElementById('calificaciones-tab')?.addEventListener('shown.bs.tab', cargarCalificaciones);
        document.getElementById('documentos-tab')?.addEventListener('shown.bs.tab', cargarDocumentos);
        document.getElementById('academico-tab')?.addEventListener('shown.bs.tab', cargarDatosAcademicos);
        document.getElementById('desempeno-tab')?.addEventListener('shown.bs.tab', cargarDesempeno);
        document.getElementById('certificaciones-tab')?.addEventListener('shown.bs.tab', cargarCertificaciones);
        document.getElementById('habilidades-tab')?.addEventListener('shown.bs.tab', cargarHabilidades);
        document.getElementById('becas-tab')?.addEventListener('shown.bs.tab', cargarBecas);
        document.getElementById('movilidad-tab')?.addEventListener('shown.bs.tab', cargarMovilidades);
        document.getElementById('practicas-tab')?.addEventListener('shown.bs.tab', cargarPracticas);
        document.getElementById('btn-nueva-practica')?.addEventListener('click', abrirModalPractica);
        document.getElementById('btn-guardar-practica')?.addEventListener('click', guardarPractica);
        // Mostrar/ocultar relato de incidentes
        document.getElementById('practica-incidentes')?.addEventListener('change', (e) => {
            document.getElementById('relato-incidentes-container').style.display = 
                e.target.checked ? 'block' : 'none';
        });
    };
    
    return {
        render,
        descargarDocumento,
        agregarCalificacion,
         // Calificaciones
        mostrarModalCalificacion,
        guardarCalificacion,
        // Documentos
        eliminarDocumentoPortal,
        descargarDocumentoPortal,
        editarBeca,
        eliminarBeca,
        editarMovilidad,
        eliminarMovilidad,
        abrirModalPractica,
        editarPractica,
        eliminarPractica,
        eliminarCalificacion
    };
})();

window.PortalAlumnoView = PortalAlumnoView;