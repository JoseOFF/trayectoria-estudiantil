// ============================================
// VISTA DE REPORTES MEJORADA
// ============================================

const ReportesView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let licenciaturas = [];
    let generaciones = [];
    let filtros = {
        licenciatura: '',
        generacion: '',
        status: '',
        semestre: ''
    };
    
    // Configuración de campos disponibles por categoría
    const camposDisponibles = {
        basicos: [
            { id: 'matricula', label: 'Matrícula', seleccionado: true, obligatorio: true },
            { id: 'nombre_completo', label: 'Nombre Completo', seleccionado: true, obligatorio: true },
            { id: 'curp', label: 'CURP', seleccionado: true },
            { id: 'fecha_nacimiento', label: 'Fecha de Nacimiento', seleccionado: false },
            { id: 'edad', label: 'Edad', seleccionado: true },
            { id: 'correo_institucional', label: 'Correo Institucional', seleccionado: true },
            { id: 'correo_personal', label: 'Correo Personal', seleccionado: false },
            { id: 'celular', label: 'Celular', seleccionado: true },
            { id: 'telefono_emergencia', label: 'Teléfono Emergencia', seleccionado: false },
            { id: 'estado_civil', label: 'Estado Civil', seleccionado: false },
            { id: 'domicilio_completo', label: 'Domicilio Completo', seleccionado: false },
            { id: 'municipio', label: 'Municipio', seleccionado: false },
            { id: 'estado', label: 'Estado', seleccionado: false }
        ],
        academicos: [
            { id: 'nombre_licenciatura', label: 'Licenciatura', seleccionado: true },
            { id: 'semestre_actual', label: 'Semestre Actual', seleccionado: true },
            { id: 'generacion', label: 'Generación', seleccionado: true },
            { id: 'status_alumno', label: 'Status', seleccionado: true },
            { id: 'promedio_general', label: 'Promedio General', seleccionado: false },
            { id: 'situacion_academica', label: 'Situación Académica', seleccionado: false },
            { id: 'escuela_procedencia', label: 'Escuela de Procedencia', seleccionado: false },
            { id: 'promedio_media_superior', label: 'Promedio Nivel Medio', seleccionado: false }
        ],
        salud: [
            { id: 'tipo_sangre', label: 'Tipo de Sangre', seleccionado: false },
            { id: 'afiliacion_seguro_medico', label: 'Afiliación Seguro', seleccionado: false },
            { id: 'numero_seguro_social', label: 'NSS', seleccionado: false },
            { id: 'alergias', label: 'Alergias', seleccionado: false },
            { id: 'tiene_enfermedad', label: 'Tiene Enfermedad', seleccionado: false },
            { id: 'nombre_enfermedad', label: 'Nombre Enfermedad', seleccionado: false }
        ],
        socioeconomicos: [
            
            { id: 'recursos_economicos', label: 'Recursos Económicos', seleccionado: false },
            { id: 'dependencia_economica', label: 'Dependencia Económica', seleccionado: false },
            { id: 'alguien_depende_ti', label: '¿Alguien depende de ti?', seleccionado: false },
            { id: 'trabaja', label: '¿Trabaja?', seleccionado: false },
            { id: 'lugar_trabajo', label: 'Lugar de Trabajo', seleccionado: false },
            { id: 'horario_trabajo', label: 'Horario de Trabajo', seleccionado: false },
            { id: 'renta_fuera_domicilio', label: '¿Renta fuera del domicilio?', seleccionado: false }
        ],
        practicas: [
            { id: 'total_practicas', label: 'Total de Prácticas Realizadas', seleccionado: false },
            { id: 'practica_periodo', label: 'Periodo Escolar', seleccionado: false },
            { id: 'practica_nombre_escuela', label: 'Nombre de la Escuela', seleccionado: false },
            { id: 'practica_cct', label: 'CCT de la Escuela', seleccionado: false },
            { id: 'practica_direccion', label: 'Dirección (Municipio, Estado)', seleccionado: false },
            { id: 'practica_fecha_inicio', label: 'Fecha de Inicio', seleccionado: false },
            { id: 'practica_fecha_fin', label: 'Fecha de Fin', seleccionado: false },
            { id: 'practica_horas', label: 'Horas de Práctica', seleccionado: false },
            { id: 'practica_nivel_educativo', label: 'Nivel Educativo', seleccionado: false },
            { id: 'practica_situacion', label: 'Situación de la Práctica', seleccionado: false }
        ],
        incidentes: [
            { id: 'total_incidentes', label: 'Total de Incidentes', seleccionado: false },
            { id: 'incidentes_abiertos', label: 'Incidentes Abiertos', seleccionado: false }
        ]
    };
    
    // Estado de campos seleccionados
    let camposSeleccionados = obtenerCamposSeleccionados();
    
    /**
     * Obtener lista de campos seleccionados
     */
    function obtenerCamposSeleccionados() {
        const seleccionados = [];
        Object.values(camposDisponibles).forEach(categoria => {
            categoria.forEach(campo => {
                if (campo.seleccionado) {
                    seleccionados.push(campo.id);
                }
            });
        });
        return seleccionados;
    }
    
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
                            <h2><i class="bi bi-file-earmark-bar-graph me-2"></i>Reportes Personalizados</h2>
                            <p class="text-muted mb-0">Genera reportes personalizados seleccionando los campos que necesitas</p>
                        </div>
                        
                        <!-- Tabs de Navegación -->
                        <ul class="nav nav-tabs mb-4" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="personalizado-tab" data-bs-toggle="tab" 
                                    data-bs-target="#personalizado" type="button">
                                    <i class="bi bi-sliders me-2"></i>Reporte Personalizado
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="rapidos-tab" data-bs-toggle="tab" 
                                    data-bs-target="#rapidos" type="button">
                                    <i class="bi bi-lightning-fill me-2"></i>Reportes Rápidos
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="expediente-tab" data-bs-toggle="tab" 
                                    data-bs-target="#expediente" type="button">
                                    <i class="bi bi-file-person me-2"></i>Expediente Individual
                                </button>
                            </li>
                        </ul>
                        
                        <!-- Contenido de Tabs -->
                        <div class="tab-content">
                            <!-- Tab 1: Reporte Personalizado -->
                            <div class="tab-pane fade show active" id="personalizado" role="tabpanel">
                                ${renderReportePersonalizado()}
                            </div>
                            
                            <!-- Tab 2: Reportes Rápidos -->
                            <div class="tab-pane fade" id="rapidos" role="tabpanel">
                                ${renderReportesRapidos()}
                            </div>
                            
                            <!-- Tab 3: Expediente Individual -->
                            <div class="tab-pane fade" id="expediente" role="tabpanel">
                                ${renderExpedienteIndividual()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar
        await cargarCatalogos();
        inicializarEventos();
    };
    
    /**
     * Renderizar sección de reporte personalizado
     */
    const renderReportePersonalizado = () => {
        return `
            <div class="row">
                <!-- Columna Izquierda: Configuración -->
                <div class="col-lg-4">
                    <div class="card sticky-top" style="top: 20px;">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0"><i class="bi bi-gear-fill me-2"></i>Configuración del Reporte</h6>
                        </div>
                        <div class="card-body">
                            <!-- Filtros -->
                            <div class="mb-4">
                                <h6 class="text-primary mb-3">
                                    <i class="bi bi-funnel me-2"></i>Filtros
                                </h6>
                                
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Licenciatura</label>
                                    <select class="form-select form-select-sm" id="filter-licenciatura">
                                        <option value="">Todas</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Generación</label>
                                    <select class="form-select form-select-sm" id="filter-generacion">
                                        <option value="">Todas</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Status</label>
                                    <select class="form-select form-select-sm" id="filter-status">
                                        <option value="">Todos</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Egresado">Egresado</option>
                                        <option value="Baja">Baja</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label small fw-semibold">Semestre</label>
                                    <select class="form-select form-select-sm" id="filter-semestre">
                                        <option value="">Todos</option>
                                        ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}">${s}°</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <!-- Selector de Campos -->
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="text-primary mb-0">
                                        <i class="bi bi-check2-square me-2"></i>Campos a Incluir
                                    </h6>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary btn-sm" data-accion="ReportesView.seleccionarTodosCampos">
                                            <i class="bi bi-check-all"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary btn-sm" data-accion="ReportesView.limpiarCampos">
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Acordeón de categorías -->
                                <div class="accordion accordion-flush" id="camposAccordion">
                                    ${renderCategoriasCampos()}
                                </div>
                            </div>
                            
                            <hr>
                            
                            <!-- Botones de Acción -->
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" data-accion="ReportesView.generarVistaPrevia">
                                    <i class="bi bi-eye-fill me-2"></i>Vista Previa
                                </button>
                                <button class="btn btn-success" data-accion="ReportesView.descargarPersonalizadoExcel">
                                    <i class="bi bi-file-earmark-excel me-2"></i>Descargar Excel
                                </button>
                                <button class="btn btn-danger" data-accion="ReportesView.descargarPersonalizadoPDF">
                                    <i class="bi bi-file-pdf me-2"></i>Descargar PDF
                                </button>
                            </div>
                            
                            <!-- Contador de registros -->
                            <div class="alert alert-info mt-3 mb-0 small">
                                <i class="bi bi-info-circle me-2"></i>
                                <span id="contador-registros">Campos seleccionados: ${camposSeleccionados.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Columna Derecha: Vista Previa -->
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-table me-2"></i>Vista Previa del Reporte</h6>
                        </div>
                        <div class="card-body">
                            <div id="vista-previa-container">
                                <div class="text-center text-muted py-5">
                                    <i class="bi bi-eye-slash display-1"></i>
                                    <p class="mt-3">Haz clic en "Vista Previa" para visualizar los datos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Renderizar categorías de campos
     */
    const renderCategoriasCampos = () => {
        const categorias = [
            { key: 'basicos', label: 'Datos Básicos', icon: 'person-fill' },
            { key: 'academicos', label: 'Datos Académicos', icon: 'book-fill' },
            { key: 'salud', label: 'Datos de Salud', icon: 'heart-pulse-fill' },
            { key: 'socioeconomicos', label: 'Datos Socioeconómicos', icon: 'cash-coin' },
            { key: 'practicas', label: 'Prácticas Profesionales', icon: 'briefcase-fill' },
            { key: 'incidentes', label: 'Incidentes', icon: 'exclamation-triangle-fill' }
        ];
        
        return categorias.map((cat, index) => `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" 
                        data-bs-toggle="collapse" data-bs-target="#collapse${cat.key}">
                        <i class="bi bi-${cat.icon} me-2"></i>${esc(cat.label)}
                        <span class="badge bg-primary ms-auto me-2" id="badge-${cat.key}">
                            ${camposDisponibles[cat.key].filter(c => c.seleccionado).length}
                        </span>
                    </button>
                </h2>
                <div id="collapse${cat.key}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                    data-bs-parent="#camposAccordion">
                    <div class="accordion-body">
                        ${camposDisponibles[cat.key].map(campo => `
                            <div class="form-check mb-2">
                                <input class="form-check-input campo-checkbox" type="checkbox" 
                                    value="${campo.id}" id="check-${campo.id}"
                                    ${campo.seleccionado ? 'checked' : ''}
                                    ${campo.obligatorio ? 'disabled' : ''}
                                    data-categoria="${cat.key}">
                                <label class="form-check-label small" for="check-${campo.id}">
                                    ${esc(campo.label)}
                                    ${campo.obligatorio ? '<span class="badge bg-secondary ms-1">Obligatorio</span>' : ''}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    };
    
    /**
     * Renderizar reportes rápidos
     */
    const renderReportesRapidos = () => {
        return `
            <div class="row">
                <!-- Lista Completa -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100 border-primary">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                                    <i class="bi bi-people-fill text-primary fs-3"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-1">Lista Completa de Alumnos</h5>
                                    <p class="text-muted mb-0 small">Datos básicos y académicos</p>
                                </div>
                            </div>
                            
                            <p class="card-text">Genera una lista con los datos esenciales de todos los alumnos registrados.</p>
                            
                            <div class="d-flex gap-2 mt-3">
                                <button class="btn btn-outline-success btn-sm flex-fill" 
                                    data-accion="ReportesView.descargarListaCompletaExcel">
                                    <i class="bi bi-file-excel me-2"></i>Excel
                                </button>
                                <button class="btn btn-outline-danger btn-sm flex-fill" 
                                    data-accion="ReportesView.descargarListaCompletaPDF">
                                    <i class="bi bi-file-pdf me-2"></i>PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Estadísticas -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100 border-success">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                                    <i class="bi bi-graph-up text-success fs-3"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-1">Estadísticas Generales</h5>
                                    <p class="text-muted mb-0 small">Análisis y métricas</p>
                                </div>
                            </div>
                            
                            <p class="card-text">Reporte con estadísticas, gráficas y análisis de la población estudiantil.</p>
                            
                            <div class="d-flex gap-2 mt-3">
                                <button class="btn btn-outline-danger btn-sm w-100" 
                                    data-accion="ReportesView.descargarEstadisticasPDF">
                                    <i class="bi bi-file-pdf me-2"></i>Descargar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Alumnos en Riesgo -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100 border-warning">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                                    <i class="bi bi-exclamation-triangle-fill text-warning fs-3"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-1">Alumnos en Riesgo</h5>
                                    <p class="text-muted mb-0 small">Seguimiento académico</p>
                                </div>
                            </div>
                            
                            <p class="card-text">Lista de alumnos con bajo rendimiento o situación académica irregular.</p>
                            
                            <div class="d-flex gap-2 mt-3">
                                <button class="btn btn-outline-success btn-sm flex-fill" 
                                    data-accion="ReportesView.descargarAlumnosRiesgoExcel">
                                    <i class="bi bi-file-excel me-2"></i>Excel
                                </button>
                                <button class="btn btn-outline-danger btn-sm flex-fill" 
                                    data-accion="ReportesView.descargarAlumnosRiesgoPDF">
                                    <i class="bi bi-file-pdf me-2"></i>PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Expedientes Incompletos -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100 border-danger">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
                                    <i class="bi bi-file-earmark-x-fill text-danger fs-3"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-1">Expedientes Incompletos</h5>
                                    <p class="text-muted mb-0 small">Control de documentación</p>
                                </div>
                            </div>
                            
                            <p class="card-text">Alumnos con información faltante en su expediente estudiantil.</p>
                            
                            <div class="d-flex gap-2 mt-3">
                                <button class="btn btn-outline-success btn-sm flex-fill" 
                                    data-accion="ReportesView.descargarExpedientesIncompletosExcel">
                                    <i class="bi bi-file-excel me-2"></i>Excel
                                </button>
                                <button class="btn btn-outline-danger btn-sm flex-fill" 
                                    data-accion="ReportesView.descargarExpedientesIncompletosPDF">
                                    <i class="bi bi-file-pdf me-2"></i>PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Renderizar expediente individual
     */
    const renderExpedienteIndividual = () => {
        return `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body p-5">
                            <div class="text-center mb-4">
                                <div class="bg-info bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                                    <i class="bi bi-file-person-fill text-info" style="font-size: 3rem;"></i>
                                </div>
                                <h3 class="card-title">Expediente Individual Completo</h3>
                                <p class="text-muted">Genera el expediente completo de un alumno específico</p>
                            </div>
                            
                            <div class="mb-4">
                                <label class="form-label fw-semibold">Buscar Alumno por Matrícula</label>
                                <div class="input-group input-group-lg">
                                    <span class="input-group-text">
                                        <i class="bi bi-search"></i>
                                    </span>
                                    <input type="text" class="form-control" id="buscar-matricula" 
                                        placeholder="Ej: 2024001" autocomplete="off">
                                    <button class="btn btn-primary px-4" data-accion="ReportesView.buscarYGenerarExpediente">
                                        <i class="bi bi-file-pdf me-2"></i>Generar Expediente
                                    </button>
                                </div>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Ingresa la matrícula del alumno y se generará un PDF con toda su información
                                </div>
                            </div>
                            
                            <div class="alert alert-info">
                                <h6 class="alert-heading">
                                    <i class="bi bi-info-circle-fill me-2"></i>El expediente incluye:
                                </h6>
                                <ul class="mb-0 small">
                                    <li>Datos personales y de contacto</li>
                                    <li>Información académica completa</li>
                                    <li>Datos de salud</li>
                                    <li>Información socioeconómica</li>
                                    <li>Historial de prácticas profesionales</li>
                                    <li>Familiares y tutores</li>
                                    <li>Registro de incidentes</li>
                                    <li>Documentos adjuntos</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    /**
     * Inicializar eventos
     */
    const inicializarEventos = () => {
        // Evento de cambio en filtros
        ['filter-licenciatura', 'filter-generacion', 'filter-status', 'filter-semestre'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    const filterName = id.replace('filter-', '');
                    filtros[filterName] = e.target.value;
                    actualizarContador();
                });
            }
        });
        
        // Eventos de checkboxes
        document.querySelectorAll('.campo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const categoria = e.target.dataset.categoria;
                const campoId = e.target.value;
                const campo = camposDisponibles[categoria].find(c => c.id === campoId);
                
                if (campo && !campo.obligatorio) {
                    campo.seleccionado = e.target.checked;
                    camposSeleccionados = obtenerCamposSeleccionados();
                    actualizarContador();
                    actualizarBadgeCategoria(categoria);
                }
            });
        });
    };
    
    /**
     * Actualizar badge de categoría
     */
    const actualizarBadgeCategoria = (categoria) => {
        const badge = document.getElementById(`badge-${categoria}`);
        if (badge) {
            const count = camposDisponibles[categoria].filter(c => c.seleccionado).length;
            badge.textContent = count;
        }
    };
    
    /**
     * Actualizar contador
     */
    const actualizarContador = async () => {
        const contador = document.getElementById('contador-registros');
        if (contador) {
            contador.textContent = `Campos seleccionados: ${camposSeleccionados.length}`;
        }
    };
    
    /**
     * Cargar catálogos
     */
    const cargarCatalogos = async () => {
        try {
            // Cargar licenciaturas - RUTA CORREGIDA
            const responseLic = await API.get('/alumnos/licenciaturas');
            if (responseLic.success) {
                licenciaturas = responseLic.data;
                const selectLic = document.getElementById('filter-licenciatura');
                if (selectLic) {
                    licenciaturas.forEach(lic => {
                        selectLic.innerHTML += `<option value="${lic.id_licenciatura}">${esc(lic.nombre_licenciatura)}</option>`;
                    });
                }
            }
            
            // Cargar generaciones - RUTA CORREGIDA
            const responseGen = await API.get('/alumnos/generaciones');
            if (responseGen.success) {
                generaciones = responseGen.data;
                const selectGen = document.getElementById('filter-generacion');
                if (selectGen) {
                    generaciones.forEach(gen => {
                        selectGen.innerHTML += `<option value="${esc(gen)}">${esc(gen)}</option>`;
                    });
                }
            }
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
        }
    };
    
    /**
     * Generar vista previa
     */
    const generarVistaPrevia = async () => {
        try {
            if (camposSeleccionados.length === 0) {
                Alert.warning('Debes seleccionar al menos un campo');
                return;
            }
            
            Alert.info('Cargando vista previa...');
            
            const queryParams = construirQueryParams();
            const campos = camposSeleccionados.join(',');
            
            const response = await API.get(`/reportes/personalizado/preview?campos=${campos}${queryParams ? '&' + queryParams : ''}`);
            
            if (response.success && response.data.length > 0) {
                renderizarTablaPrevia(response.data);
                Alert.success(`Se encontraron ${response.data.length} registros`);
            } else {
                document.getElementById('vista-previa-container').innerHTML = `
                    <div class="text-center text-muted py-5">
                        <i class="bi bi-inbox display-1"></i>
                        <p class="mt-3">No se encontraron registros con los filtros seleccionados</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error en vista previa:', error);
            Alert.error('Error al generar vista previa');
        }
    };
    
    /**
     * Renderizar tabla de vista previa
     */
    const renderizarTablaPrevia = (datos) => {
    const container = document.getElementById('vista-previa-container');
    
    // Obtener headers dinámicos
    const headers = obtenerHeadersTabla();
    
    // SIN div table-responsive, tabla directa
    let html = `
        <table class="table table-sm table-hover table-bordered mb-0">
            <thead class="table-primary">
                <tr>
                    ${headers.map(h => `<th class="text-nowrap">${esc(h.label)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    // Limitar a 50 registros en vista previa
    const datosLimitados = datos.slice(0, 50);
        datosLimitados.forEach(alumno => {
            html += '<tr>';
            headers.forEach(header => {
                const valor = alumno[header.id] !== null && alumno[header.id] !== undefined 
                    ? alumno[header.id] 
                    : '-';
                html += `<td class="text-nowrap">${esc(valor)}</td>`;
            });
            html += '</tr>';
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        if (datos.length > 50) {
            html += `
                <div class="alert alert-info m-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Mostrando 50 de ${datos.length} registros. Descarga el reporte completo para ver todos los datos.
                </div>
            `;
        }
        
        container.innerHTML = html;        
    };
    
    /**
     * Obtener headers de la tabla según campos seleccionados
     */
    const obtenerHeadersTabla = () => {
        const headers = [];
        Object.values(camposDisponibles).forEach(categoria => {
            categoria.forEach(campo => {
                if (camposSeleccionados.includes(campo.id)) {
                    headers.push({ id: campo.id, label: campo.label });
                }
            });
        });
        return headers;
    };
    
    /**
     * Construir query params
     */
    const construirQueryParams = () => {
        const params = [];
        if (filtros.licenciatura) params.push(`licenciatura=${filtros.licenciatura}`);
        if (filtros.generacion) params.push(`generacion=${filtros.generacion}`);
        if (filtros.status) params.push(`status=${filtros.status}`);
        if (filtros.semestre) params.push(`semestre=${filtros.semestre}`);
        return params.join('&');
    };
    
    /**
     * Seleccionar todos los campos
     */
    const seleccionarTodosCampos = () => {
        Object.values(camposDisponibles).forEach(categoria => {
            categoria.forEach(campo => {
                if (!campo.obligatorio) {
                    campo.seleccionado = true;
                    const checkbox = document.getElementById(`check-${campo.id}`);
                    if (checkbox) checkbox.checked = true;
                }
            });
        });
        
        // Actualizar badges
        Object.keys(camposDisponibles).forEach(cat => actualizarBadgeCategoria(cat));
        
        camposSeleccionados = obtenerCamposSeleccionados();
        actualizarContador();
        Alert.success('Todos los campos seleccionados');
    };
    
    /**
     * Limpiar campos (excepto obligatorios)
     */
    const limpiarCampos = () => {
        Object.values(camposDisponibles).forEach(categoria => {
            categoria.forEach(campo => {
                if (!campo.obligatorio) {
                    campo.seleccionado = false;
                    const checkbox = document.getElementById(`check-${campo.id}`);
                    if (checkbox) checkbox.checked = false;
                }
            });
        });
        
        // Actualizar badges
        Object.keys(camposDisponibles).forEach(cat => actualizarBadgeCategoria(cat));
        
        camposSeleccionados = obtenerCamposSeleccionados();
        actualizarContador();
        Alert.info('Campos limpiados (obligatorios mantenidos)');
    };
    
    /**
     * Descargar reporte personalizado en Excel
     */
    const descargarPersonalizadoExcel = async () => {
        try {
            if (camposSeleccionados.length === 0) {
                Alert.warning('Debes seleccionar al menos un campo');
                return;
            }
            
            Alert.info('Generando reporte Excel personalizado...');
            
            const queryParams = construirQueryParams();
            const campos = camposSeleccionados.join(',');
            const url = `${API.BASE_URL}/reportes/personalizado/excel?campos=${campos}${queryParams ? '&' + queryParams : ''}`;
            
            await descargarArchivo(url, 'Reporte_Personalizado.xlsx');
        } catch (error) {
            console.error('Error al descargar Excel:', error);
            Alert.error('Error al generar el reporte Excel');
        }
    };
    
    /**
     * Descargar reporte personalizado en PDF
     */
    const descargarPersonalizadoPDF = async () => {
        try {
            if (camposSeleccionados.length === 0) {
                Alert.warning('Debes seleccionar al menos un campo');
                return;
            }
            
            Alert.info('Generando reporte PDF personalizado...');
            
            const queryParams = construirQueryParams();
            const campos = camposSeleccionados.join(',');
            const url = `${API.BASE_URL}/reportes/personalizado/pdf?campos=${campos}${queryParams ? '&' + queryParams : ''}`;
            
            await descargarArchivo(url, 'Reporte_Personalizado.pdf');
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            Alert.error('Error al generar el reporte PDF');
        }
    };
    
    /**
     * Reportes rápidos
     */
    const descargarListaCompletaExcel = async () => {
        try {
            Alert.info('Generando lista completa...');
            const url = `${API.BASE_URL}/reportes/lista-completa/excel`;
            await descargarArchivo(url, 'Lista_Completa_Alumnos.xlsx');
        } catch (error) {
            Alert.error('Error al generar el reporte');
        }
    };
    
    const descargarListaCompletaPDF = async () => {
        try {
            Alert.info('Generando lista completa...');
            const url = `${API.BASE_URL}/reportes/lista-completa/pdf`;
            await descargarArchivo(url, 'Lista_Completa_Alumnos.pdf');
        } catch (error) {
            Alert.error('Error al generar el reporte');
        }
    };
    
    const descargarAlumnosRiesgoExcel = async () => {
        try {
            Alert.info('Generando reporte de alumnos en riesgo...');
            const url = `${API.BASE_URL}/reportes/alumnos-riesgo/excel`;
            await descargarArchivo(url, 'Alumnos_en_Riesgo.xlsx');
        } catch (error) {
            Alert.error('Error al generar el reporte');
        }
    };
    
    const descargarAlumnosRiesgoPDF = async () => {
        try {
            Alert.info('Generando reporte de alumnos en riesgo...');
            const url = `${API.BASE_URL}/reportes/alumnos-riesgo/pdf`;
            await descargarArchivo(url, 'Alumnos_en_Riesgo.pdf');
        } catch (error) {
            Alert.error('Error al generar el reporte');
        }
    };
    
    const descargarExpedientesIncompletosExcel = async () => {
        try {
            Alert.info('Generando reporte de expedientes incompletos...');
            const url = `${API.BASE_URL}/reportes/expedientes-incompletos/excel`;
            await descargarArchivo(url, 'Expedientes_Incompletos.xlsx');
        } catch (error) {
            Alert.error('Error al generar el reporte');
        }
    };
    
    const descargarExpedientesIncompletosPDF = async () => {
        try {
            Alert.info('Generando reporte de expedientes incompletos...');
            const url = `${API.BASE_URL}/reportes/expedientes-incompletos/pdf`;
            await descargarArchivo(url, 'Expedientes_Incompletos.pdf');
        } catch (error) {
            Alert.error('Error al generar el reporte');
        }
    };
    
    const descargarEstadisticasPDF = async () => {
        try {
            Alert.info('Generando reporte de estadísticas...');
            const queryParams = filtros.licenciatura ? `?licenciatura=${filtros.licenciatura}` : '';
            const url = `${API.BASE_URL}/reportes/estadisticas/pdf${queryParams}`;
            await descargarArchivo(url, 'Estadisticas.pdf');
        } catch (error) {
            Alert.error('Error al generar el reporte de estadísticas');
        }
    };
    
    /**
     * Buscar y generar expediente individual
     */
    const buscarYGenerarExpediente = async () => {
        try {
            const matricula = document.getElementById('buscar-matricula').value.trim();
            
            if (!matricula) {
                Alert.warning('Por favor ingresa una matrícula');
                return;
            }
            
            Alert.info('Buscando alumno...');
            
            const response = await API.get(`/alumnos?search=${encodeURIComponent(matricula)}&limit=1`);
            
            if (response.success && response.data.alumnos.length > 0) {
                const alumno = response.data.alumnos[0];
                Alert.info('Generando expediente...');
                
                const url = `${API.BASE_URL}/reportes/expediente/${alumno.id_alumno}/pdf`;
                await descargarArchivo(url, `Expediente_${alumno.matricula}.pdf`);
                
                document.getElementById('buscar-matricula').value = '';
            } else {
                Alert.error('No se encontró ningún alumno con esa matrícula');
            }
        } catch (error) {
            console.error('Error al buscar alumno:', error);
            Alert.error('Error al buscar el alumno');
        }
    };
    
    /**
     * Función auxiliar para descargar archivos
     */
    const descargarArchivo = async (url, filename) => {
        const token = localStorage.getItem('token');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al descargar el archivo');
        }
        
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        
        Alert.success('Reporte descargado correctamente');
    };

    
    // Exponer métodos públicos
    return {
        render,
        generarVistaPrevia,
        seleccionarTodosCampos,
        limpiarCampos,
        descargarPersonalizadoExcel,
        descargarPersonalizadoPDF,
        descargarListaCompletaExcel,
        descargarListaCompletaPDF,
        descargarAlumnosRiesgoExcel,
        descargarAlumnosRiesgoPDF,
        descargarExpedientesIncompletosExcel,
        descargarExpedientesIncompletosPDF,
        descargarEstadisticasPDF,
        buscarYGenerarExpediente
    };
})();

window.ReportesView = ReportesView;