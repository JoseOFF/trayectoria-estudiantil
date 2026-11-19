// ============================================
// VISTA DE CARGA MASIVA
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const CargaMasivaView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let archivo = null;
    let licenciaturas = [];
    
    /**
     * Renderizar la vista
     */
    const render = async (params = {}) => {
        const appElement = document.getElementById('app');
        
        appElement.innerHTML = `
            <div class="container-fluid py-4">
                <!-- Encabezado -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2><i class="bi bi-file-earmark-spreadsheet me-2"></i>Carga Masiva de Alumnos</h2>
                        <p class="text-muted mb-0">Importar múltiples alumnos desde archivo Excel</p>
                    </div>
                    <button class="btn btn-outline-secondary" data-accion="Router.goBack">
                        <i class="bi bi-arrow-left me-2"></i>Regresar
                    </button>
                </div>

                <div class="row">
                    <!-- Columna izquierda: Formulario de carga -->
                    <div class="col-lg-6 mb-4">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="bi bi-upload me-2"></i>Subir Archivo Excel</h5>
                            </div>
                            <div class="card-body">
                                <!-- Paso 1: Descargar plantilla -->
                                <div class="alert alert-info">
                                    <h6 class="alert-heading"><i class="bi bi-info-circle me-2"></i>Paso 1: Descargar Plantilla</h6>
                                    <p class="mb-2">Descarga la plantilla de Excel con el formato correcto y las instrucciones.</p>
                                    <button id="btn-descargar-plantilla" class="btn btn-sm btn-info">
                                        <i class="bi bi-download me-2"></i>Descargar Plantilla Excel
                                    </button>
                                </div>

                                <!-- Paso 2: Completar plantilla -->
                                <div class="alert alert-warning">
                                    <h6 class="alert-heading"><i class="bi bi-pencil me-2"></i>Paso 2: Completar Datos</h6>
                                    <p class="mb-0">Completa la plantilla con los datos de los alumnos siguiendo las instrucciones incluidas.</p>
                                </div>

                                <!-- Paso 3: Seleccionar licenciatura y subir archivo -->
                                <div class="alert alert-success">
                                    <h6 class="alert-heading"><i class="bi bi-cloud-upload me-2"></i>Paso 3: Seleccionar Licenciatura y Subir</h6>
                                    
                                    <!-- Selector de licenciatura -->
                                    <div class="mb-3">
                                        <label for="select-licenciatura" class="form-label fw-bold">
                                            <i class="bi bi-mortarboard me-1"></i>Licenciatura *
                                        </label>
                                        <select class="form-select" id="select-licenciatura" required>
                                            <option value="">-- Selecciona una licenciatura --</option>
                                        </select>
                                        <div class="form-text">
                                            Todos los alumnos del archivo se asignarán a esta licenciatura
                                        </div>
                                    </div>
                                    
                                    <!-- Selector de archivo -->
                                    <div class="mb-3">
                                        <label for="archivo-excel" class="form-label fw-bold">
                                            <i class="bi bi-file-earmark-excel me-1"></i>Archivo Excel *
                                        </label>
                                        <input 
                                            type="file" 
                                            class="form-control" 
                                            id="archivo-excel"
                                            accept=".xlsx,.xls"
                                            disabled
                                        >
                                        <div class="form-text">
                                            Solo archivos .xlsx o .xls (máximo 10MB)
                                        </div>
                                    </div>
                                    
                                    <!-- Información del archivo seleccionado -->
                                    <div id="archivo-info" class="alert alert-secondary d-none">
                                        <strong>Archivo:</strong> <span id="nombre-archivo"></span><br>
                                        <strong>Tamaño:</strong> <span id="tamano-archivo"></span><br>
                                        <strong>Licenciatura:</strong> <span id="licenciatura-seleccionada"></span>
                                    </div>
                                    
                                    <!-- Botón procesar -->
                                    <button id="btn-procesar" class="btn btn-success w-100" disabled>
                                        <i class="bi bi-check-circle me-2"></i>Procesar Carga Masiva
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Indicaciones importantes -->
                        <div class="card shadow-sm mt-4">
                            <div class="card-header bg-warning text-dark">
                                <h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Indicaciones Importantes</h6>
                            </div>
                            <div class="card-body">
                                <ul class="mb-0 small">
                                    <li>Todos los campos del Excel son obligatorios</li>
                                    <li>El CURP debe tener exactamente 18 caracteres</li>
                                    <li>Los correos institucionales deben ser únicos</li>
                                    <li>El correo será el usuario para acceder al sistema</li>
                                    <li>La contraseña temporal será: <code>ENI2025!</code></li>
                                    <li>La matrícula y generación se generan automáticamente</li>
                                    <li>Los alumnos podrán editar su matrícula y generación desde su portal</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Columna derecha: Resultados -->
                    <div class="col-lg-6">
                        <div class="card shadow-sm">
                            <div class="card-header bg-secondary text-white">
                                <h5 class="mb-0"><i class="bi bi-clipboard-data me-2"></i>Resultados del Proceso</h5>
                            </div>
                            <div class="card-body">
                                <div id="resultados-container">
                                    <div class="text-center text-muted py-5">
                                        <i class="bi bi-hourglass-split" style="font-size: 3rem;"></i>
                                        <p class="mt-3">Los resultados aparecerán aquí después de procesar el archivo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar después de renderizar
        await init();
    };
    
    /**
     * Inicializar la vista
     */
    const init = async () => {
        await cargarLicenciaturas();
        attachEventListeners();
    };
    
    /**
     * Cargar licenciaturas disponibles
     */
    const cargarLicenciaturas = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            
            if (response.success && response.data) {
                licenciaturas = response.data;
                
                const select = document.getElementById('select-licenciatura');
                
                licenciaturas.forEach(lic => {
                    const option = document.createElement('option');
                    option.value = lic.id_licenciatura;
                    option.textContent = lic.nombre_licenciatura;
                    select.appendChild(option);
                });
                
                console.log('Licenciaturas cargadas:', licenciaturas.length);
            } else {
                Alert.show('Error al cargar las licenciaturas', 'danger');
            }
        } catch (error) {
            console.error('Error al cargar licenciaturas:', error);
            Alert.show('Error al cargar las licenciaturas disponibles', 'danger');
        }
    };
    
    /**
     * Adjuntar event listeners
     */
    const attachEventListeners = () => {
        // Botón descargar plantilla
        const btnDescargarPlantilla = document.getElementById('btn-descargar-plantilla');
        if (btnDescargarPlantilla) {
            btnDescargarPlantilla.addEventListener('click', descargarPlantilla);
        }
        
        // Selector de licenciatura
        const selectLicenciatura = document.getElementById('select-licenciatura');
        if (selectLicenciatura) {
            selectLicenciatura.addEventListener('change', handleLicenciaturaChange);
        }
        
        // Input de archivo
        const inputArchivo = document.getElementById('archivo-excel');
        if (inputArchivo) {
            inputArchivo.addEventListener('change', handleArchivoSeleccionado);
        }
        
        // Botón procesar
        const btnProcesar = document.getElementById('btn-procesar');
        if (btnProcesar) {
            btnProcesar.addEventListener('click', procesarCargaMasiva);
        }
    };
    
    /**
     * Manejar cambio de licenciatura
     */
    const handleLicenciaturaChange = (e) => {
        const licenciaturaId = e.target.value;
        const inputArchivo = document.getElementById('archivo-excel');
        
        if (licenciaturaId) {
            // Habilitar selector de archivo
            inputArchivo.disabled = false;
            
            // Actualizar info si ya hay archivo seleccionado
            if (archivo) {
                actualizarInfoArchivo();
            }
        } else {
            // Deshabilitar selector de archivo
            inputArchivo.disabled = true;
            inputArchivo.value = '';
            archivo = null;
            document.getElementById('archivo-info').classList.add('d-none');
            document.getElementById('btn-procesar').disabled = true;
        }
    };
    
    /**
     * Manejar selección de archivo
     */
    const handleArchivoSeleccionado = (e) => {
        const archivoSeleccionado = e.target.files[0];
        
        if (!archivoSeleccionado) {
            archivo = null;
            document.getElementById('btn-procesar').disabled = true;
            document.getElementById('archivo-info').classList.add('d-none');
            return;
        }
        
        // Validar tipo de archivo
        const extensionesPermitidas = ['.xlsx', '.xls'];
        const extension = archivoSeleccionado.name.substring(archivoSeleccionado.name.lastIndexOf('.')).toLowerCase();
        
        if (!extensionesPermitidas.includes(extension)) {
            Alert.show('Solo se permiten archivos Excel (.xlsx, .xls)', 'danger');
            e.target.value = '';
            return;
        }
        
        // Validar tamaño (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (archivoSeleccionado.size > maxSize) {
            Alert.show('El archivo no debe superar los 10MB', 'danger');
            e.target.value = '';
            return;
        }
        
        archivo = archivoSeleccionado;
        actualizarInfoArchivo();
    };
    
    /**
     * Actualizar información del archivo
     */
    const actualizarInfoArchivo = () => {
        const selectLicenciatura = document.getElementById('select-licenciatura');
        const licenciaturaId = selectLicenciatura.value;
        
        if (!archivo || !licenciaturaId) {
            document.getElementById('btn-procesar').disabled = true;
            return;
        }
        
        const licenciatura = licenciaturas.find(l => l.id_licenciatura == licenciaturaId);
        
        // Mostrar información del archivo
        document.getElementById('nombre-archivo').textContent = archivo.name;
        document.getElementById('tamano-archivo').textContent = formatearTamano(archivo.size);
        document.getElementById('licenciatura-seleccionada').textContent = licenciatura ? licenciatura.nombre_licenciatura : 'No seleccionada';
        document.getElementById('archivo-info').classList.remove('d-none');
        document.getElementById('btn-procesar').disabled = false;
    };
    
    /**
     * Formatear tamaño de archivo
     */
    const formatearTamano = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    
    /**
     * Descargar plantilla Excel
     */
    const descargarPlantilla = async () => {
        const btn = document.getElementById('btn-descargar-plantilla');
        const textOriginal = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Descargando...';
            
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API.BASE_URL}/cargamasiva/plantilla`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al descargar la plantilla');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_carga_alumnos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            Alert.show('Plantilla descargada exitosamente', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            Alert.show('Error al descargar la plantilla', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = textOriginal;
        }
    };
    
    /**
     * Procesar carga masiva
     */
    const procesarCargaMasiva = async () => {
        const selectLicenciatura = document.getElementById('select-licenciatura');
        const licenciaturaId = selectLicenciatura.value;
        
        if (!licenciaturaId) {
            Alert.show('Por favor selecciona una licenciatura', 'warning');
            return;
        }
        
        if (!archivo) {
            Alert.show('Por favor selecciona un archivo Excel', 'warning');
            return;
        }
        
        const btn = document.getElementById('btn-procesar');
        const textOriginal = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
            
            // Mostrar mensaje de procesamiento
            mostrarProcesamientoEnCurso();
            
            const formData = new FormData();
            formData.append('archivo', archivo);
            formData.append('id_licenciatura', licenciaturaId);
            
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API.BASE_URL}/cargamasiva/procesar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                Alert.show(data.message, 'success');
                mostrarResultados(data);
                
                // Limpiar formulario
                document.getElementById('archivo-excel').value = '';
                document.getElementById('select-licenciatura').value = '';
                document.getElementById('archivo-info').classList.add('d-none');
                document.getElementById('archivo-excel').disabled = true;
                archivo = null;
            } else {
                Alert.show(data.message || 'Error al procesar el archivo', 'danger');
                if (data.detalles) {
                    mostrarResultados(data);
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            Alert.show('Error al procesar la carga masiva', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = textOriginal;
        }
    };
    
    /**
     * Mostrar procesamiento en curso
     */
    const mostrarProcesamientoEnCurso = () => {
        const container = document.getElementById('resultados-container');
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Procesando...</span>
                </div>
                <h5>Procesando archivo...</h5>
                <p class="text-muted">Por favor espera mientras se procesan los registros</p>
            </div>
        `;
    };
    
    /**
     * Mostrar resultados del proceso
     */
    const mostrarResultados = (data) => {
        const container = document.getElementById('resultados-container');
        const { resumen, detalles } = data;
        
        // Construir HTML de resultados
        let html = `
            <!-- Resumen general -->
            <div class="alert ${resumen.exitosos > 0 ? 'alert-success' : 'alert-danger'}">
                <h5 class="alert-heading"><i class="bi bi-clipboard-check me-2"></i>Resumen del Proceso</h5>
                <hr>
                <div class="row text-center">
                    <div class="col-4">
                        <h3 class="mb-0">${resumen.total}</h3>
                        <small>Total</small>
                    </div>
                    <div class="col-4">
                        <h3 class="mb-0 text-success">${resumen.exitosos}</h3>
                        <small>Exitosos</small>
                    </div>
                    <div class="col-4">
                        <h3 class="mb-0 text-danger">${resumen.fallidos}</h3>
                        <small>Fallidos</small>
                    </div>
                </div>
                <hr>
                <p class="mb-0">
                    <strong>Porcentaje de éxito:</strong> ${resumen.porcentaje_exito}%<br>
                    <strong>Licenciatura:</strong> ${esc(resumen.licenciatura)}
                </p>
            </div>
        `;
        
        // Registros exitosos
        if (detalles.exitosos.length > 0) {
            html += `
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0">
                            <i class="bi bi-check-circle me-2"></i>
                            Alumnos Registrados Exitosamente (${detalles.exitosos.length})
                        </h6>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                            <table class="table table-hover table-sm mb-0">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>Fila</th>
                                        <th>Nombre</th>
                                        <th>Matrícula</th>
                                        <th>Correo</th>
                                        <th>Contraseña</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${detalles.exitosos.map(item => `
                                        <tr>
                                            <td>${item.fila}</td>
                                            <td>${esc(item.nombre)}</td>
                                            <td><span class="badge bg-primary">${esc(item.matricula)}</span></td>
                                            <td class="small">${esc(item.correo)}</td>
                                            <td><code>${esc(item.contrasena_temporal)}</code></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Registros fallidos
        if (detalles.fallidos.length > 0) {
            html += `
                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <h6 class="mb-0">
                            <i class="bi bi-x-circle me-2"></i>
                            Registros con Errores (${detalles.fallidos.length})
                        </h6>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                            <table class="table table-hover table-sm mb-0">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>Fila</th>
                                        <th>Nombre</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${detalles.fallidos.map(item => `
                                        <tr>
                                            <td>${item.fila}</td>
                                            <td>${esc(item.nombre)}</td>
                                            <td class="text-danger small">${esc(item.error)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    };
    
    // Exponer métodos públicos
    return {
        render
    };
})();

// ============================================
// REGISTRAR EN WINDOW
// ============================================
window.CargaMasivaView = CargaMasivaView;