// ============================================
// VISTA DE DOCUMENTOS DEL ALUMNO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const DocumentosView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    let documentos = [];
    let tiposDocumentos = [];
    let idAlumno = null;
    let alumnoInfo = null;
    
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
                        <div id="loading-documentos" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-2 text-muted">Cargando documentos...</p>
                        </div>
                        
                        <!-- Contenedor de documentos -->
                        <div id="documentos-content" class="d-none">
                            <!-- Header -->
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2><i class="bi bi-file-earmark-text me-2"></i>Documentos del Alumno</h2>
                                    <p class="text-muted mb-0" id="alumno-nombre">Cargando...</p>
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-secondary" data-accion="Router.goBack">
                                        <i class="bi bi-arrow-left me-2"></i>Volver
                                    </button>
                                    <button class="btn btn-primary" id="btn-subir-documento">
                                        <i class="bi bi-cloud-upload me-2"></i>Subir Documento
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Filtros -->
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <select class="form-select" id="filter-tipo">
                                                <option value="">Todos los tipos</option>
                                            </select>
                                        </div>
                                        <div class="col-md-8">
                                            <div class="input-group">
                                                <span class="input-group-text">
                                                    <i class="bi bi-search"></i>
                                                </span>
                                                <input 
                                                    type="text" 
                                                    class="form-control" 
                                                    id="search-input"
                                                    placeholder="Buscar por nombre de archivo..."
                                                >
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Lista de documentos -->
                            <div id="documentos-lista"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal Subir Documento -->
            <div class="modal fade" id="modalSubirDocumento" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Subir Documento</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-subir-documento">
                                <div class="mb-3">
                                    <label for="doc-tipo" class="form-label">Tipo de Documento *</label>
                                    <select class="form-select" id="doc-tipo" required>
                                        <option value="">Seleccionar tipo</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="doc-archivo" class="form-label">Archivo *</label>
                                    <input 
                                        type="file" 
                                        class="form-control" 
                                        id="doc-archivo" 
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                    >
                                    <small class="text-muted">
                                        Formatos permitidos: PDF, JPG, PNG, DOC, DOCX, (Max. 10MB)
                                    </small>
                                </div>
                                
                                <div id="preview-file" class="d-none">
                                    <div class="alert alert-info">
                                        <i class="bi bi-file-earmark me-2"></i>
                                        <span id="preview-filename"></span>
                                        <br>
                                        <small id="preview-filesize"></small>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-guardar-documento">
                                <i class="bi bi-cloud-upload me-2"></i>Subir
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
        await cargarTiposDocumentos();
        await cargarDocumentos();
        
        // Inicializar eventos
        initEvents();
    };
    
    /**
     * Cargar tipos de documentos
     */
    const cargarTiposDocumentos = async () => {
        try {
            const response = await API.get('/documentos/tipos');
            
            if (response.success) {
                tiposDocumentos = response.data;
                
                // Llenar select de filtros
                const filterTipo = document.getElementById('filter-tipo');
                tiposDocumentos.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo;
                    option.textContent = tipo;
                    filterTipo.appendChild(option);
                });
                
                // Llenar select del modal
                const docTipo = document.getElementById('doc-tipo');
                tiposDocumentos.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo;
                    option.textContent = tipo;
                    docTipo.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar tipos de documentos:', error);
        }
    };
    
    /**
     * Cargar documentos del alumno
     */
    const cargarDocumentos = async () => {
        try {
            const response = await API.get(`/documentos/alumno/${idAlumno}`);
            
            if (response.success) {
                documentos = response.data.documentos;
                alumnoInfo = response.data.alumno;
                
                // Ocultar loading y mostrar contenido
                document.getElementById('loading-documentos').classList.add('d-none');
                document.getElementById('documentos-content').classList.remove('d-none');
                
                // Actualizar nombre del alumno
                document.getElementById('alumno-nombre').textContent = 
                    `${alumnoInfo.nombre_completo} - ${alumnoInfo.matricula}`;
                
                // Renderizar documentos
                renderDocumentos(documentos);
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error);
            document.getElementById('loading-documentos').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar documentos: ${esc(error.message)}
                </div>
                <button class="btn btn-primary" data-accion="Router.goBack">
                    <i class="bi bi-arrow-left me-2"></i>Volver
                </button>
            `;
        }
    };
    
    /**
     * Renderizar lista de documentos
     */
    const renderDocumentos = (docs) => {
        const container = document.getElementById('documentos-lista');
        
        if (docs.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="text-muted mt-3 mb-0">No hay documentos registrados</p>
                        <button class="btn btn-primary mt-3" data-accion="DocumentosView.abrirModalSubir">
                            <i class="bi bi-cloud-upload me-2"></i>Subir primer documento
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Agrupar por tipo
        const grouped = docs.reduce((acc, doc) => {
            if (!acc[doc.tipo_documento]) {
                acc[doc.tipo_documento] = [];
            }
            acc[doc.tipo_documento].push(doc);
            return acc;
        }, {});
        
        let html = '';
        
        Object.keys(grouped).forEach(tipo => {
            html += `
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">
                            <i class="bi bi-folder me-2"></i>${esc(tipo)}
                            <span class="badge bg-primary ms-2">${grouped[tipo].length}</span>
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            ${grouped[tipo].map(doc => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center flex-grow-1">
                                        <i class="bi ${getIconoArchivo(doc.nombre_archivo)} fs-4 me-3 text-primary"></i>
                                        <div>
                                            <div class="fw-semibold">${esc(doc.nombre_archivo)}</div>
                                            <small class="text-muted">
                                                <i class="bi bi-calendar me-1"></i>${formatDate(doc.fecha_subida)}
                                                | <i class="bi bi-hdd me-1"></i>${esc(doc.tamano_mb)} MB
                                                ${doc.subido_por_nombre ? `| <i class="bi bi-person me-1"></i>${esc(doc.subido_por_nombre)}` : ''}
                                            </small>
                                        </div>
                                    </div>
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-info btn-preview"
                                            data-id="${doc.id_documento}"
                                            data-nombre="${esc(doc.nombre_archivo)}"
                                            data-tipo="${esc(doc.tipo_mime)}"
                                            title="Previsualizar"
                                        >
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-primary btn-descargar"
                                            data-id="${doc.id_documento}"
                                            title="Descargar"
                                        >
                                            <i class="bi bi-download"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-danger btn-eliminar"
                                            data-id="${doc.id_documento}"
                                            data-nombre="${esc(doc.nombre_archivo)}"
                                            title="Eliminar"
                                        >
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        //previsualizar un Documento
        container.innerHTML = html;
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', () => previsualizarDocumento(
                btn.dataset.id, 
                btn.dataset.nombre,
                btn.dataset.tipo
            ));
        });

        // Agregar eventos
        document.querySelectorAll('.btn-descargar').forEach(btn => {
            btn.addEventListener('click', () => descargarDocumento(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarDocumento(btn.dataset.id, btn.dataset.nombre));
        });
    };
    
    /**
     * Inicializar eventos
     */
    const initEvents = () => {
        // Botón subir documento
        document.getElementById('btn-subir-documento').addEventListener('click', abrirModalSubir);
        
        // Botón guardar documento
        document.getElementById('btn-guardar-documento').addEventListener('click', subirDocumento);
        
        // Preview del archivo seleccionado
        document.getElementById('doc-archivo').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const preview = document.getElementById('preview-file');
                const filename = document.getElementById('preview-filename');
                const filesize = document.getElementById('preview-filesize');
                
                filename.textContent = file.name;
                filesize.textContent = `Tamaño: ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
                preview.classList.remove('d-none');
            }
        });
        
        // Filtro por tipo
        document.getElementById('filter-tipo').addEventListener('change', filtrarDocumentos);
        
        // Búsqueda
        document.getElementById('search-input').addEventListener('input', filtrarDocumentos);
    };
    
    /**
     * Abrir modal para subir documento
     */
    const abrirModalSubir = () => {
        document.getElementById('form-subir-documento').reset();
        document.getElementById('preview-file').classList.add('d-none');
        
        const modal = new bootstrap.Modal(document.getElementById('modalSubirDocumento'));
        modal.show();
    };
    
    /**
     * Subir documento
     */
    const subirDocumento = async () => {
        const form = document.getElementById('form-subir-documento');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const tipo = document.getElementById('doc-tipo').value;
        const archivo = document.getElementById('doc-archivo').files[0];
        
        if (!archivo) {
            Alert.warning('Por favor selecciona un archivo');
            return;
        }
        
        // Validar tamaño (10MB)
        if (archivo.size > 10 * 1024 * 1024) {
            Alert.error('El archivo es demasiado grande. Máximo 10MB.');
            return;
        }
        
        try {
            State.setLoading(true);
            
            // Crear FormData
            const formData = new FormData();
            formData.append('file', archivo);
            formData.append('tipo_documento', tipo);
            
            // Subir documento
            const response = await API.uploadFile(`/documentos/alumno/${idAlumno}`, formData);
            
            if (response.success) {
                Alert.success(response.message);
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalSubirDocumento'));
                modal.hide();
                
                // Recargar documentos
                await cargarDocumentos();
            }
            
        } catch (error) {
            console.error('Error al subir documento:', error);
            Alert.error(error.message || 'Error al subir el documento');
        } finally {
            State.setLoading(false);
        }
    };
    
/**
 * Previsualizar documento
 */
const previsualizarDocumento = async (idDocumento, nombreArchivo, tipoMime) => {
    try {
        // Verificar si el tipo MIME existe
        if (!tipoMime || tipoMime === 'undefined' || tipoMime === 'null') {
            Alert.warning(
                `El documento "${nombreArchivo}" no tiene información de tipo de archivo. ` +
                `Puedes intentar descargarlo en su lugar.`
            );
            
            const confirmacion = confirm('¿Deseas descargar el archivo?');
            if (confirmacion) {
                await descargarDocumento(idDocumento);
            }
            return;
        }
        
        // Verificar qué tipo de archivo es
        const tipoMimeLower = tipoMime.toLowerCase();
        const esPrevisualizable = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'text/plain',
            'text/html'
        ].includes(tipoMimeLower);
        
        if (!esPrevisualizable) {
            // Si no es previsualizable directamente, mostrar un mensaje y ofrecer descargar
            const confirmacion = confirm(
                `El archivo "${nombreArchivo}" (${tipoMime}) no se puede previsualizar directamente en el navegador.\n\n` +
                `¿Deseas descargarlo?`
            );
            
            if (confirmacion) {
                await descargarDocumento(idDocumento);
            }
            return;
        }
        
        // Mostrar mensaje de carga
        Alert.info('Cargando previsualización...');
        
        // Construir la URL para previsualización
        const token = localStorage.getItem('token');
        const url = `${API.BASE_URL}/documentos/alumno/${idAlumno}/preview/${idDocumento}`;
        
        // Obtener el documento usando fetch
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener el documento');
        }
        
        // Convertir la respuesta a blob
        const blob = await response.blob();
        
        // Crear una URL temporal del blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Abrir en nueva pestaña
        const newWindow = window.open(blobUrl, '_blank');
        
        // Si el navegador bloqueó la ventana emergente
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            Alert.warning('Por favor, permite las ventanas emergentes para previsualizar documentos');
            // Liberar el blob
            window.URL.revokeObjectURL(blobUrl);
            
            // Ofrecer descargar en su lugar
            const confirmacion = confirm('¿Deseas descargar el archivo en su lugar?');
            if (confirmacion) {
                await descargarDocumento(idDocumento);
            }
            return;
        }
        
        // Limpiar la URL del blob después de que se cargue la ventana
        // Esperamos un poco más de tiempo para asegurar que el contenido se cargue
        newWindow.addEventListener('load', () => {
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                console.log('Blob URL limpiado');
            }, 2000);
        });
        
        // También limpiar después de un tiempo por si no se dispara el evento load
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 10000);
        
        Alert.success('Previsualización abierta en nueva pestaña');
        
    } catch (error) {
        console.error('Error al previsualizar documento:', error);
        Alert.error('Error al previsualizar el documento. Intenta descargarlo.');
    }
};



    /**
     * Descargar documento
     */
    const descargarDocumento = async (idDocumento) => {
        try {
            // Crear un enlace temporal para descargar
            const token = localStorage.getItem('token');
            const url = `${API.BASE_URL}/documentos/alumno/${idAlumno}/descargar/${idDocumento}`;
            
            // Hacer petición con fetch para incluir headers
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al descargar el documento');
            }
            
            // Obtener el blob del archivo
            const blob = await response.blob();
            
            // Obtener el nombre del archivo del header Content-Disposition
            const filename = Utils.nombreArchivoDescarga(
                response.headers.get('Content-Disposition'),
                'documento'
            );
            
            // Crear un link temporal y simular click
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Liberar el objeto URL
            window.URL.revokeObjectURL(link.href);
            
            Alert.success('Documento descargado correctamente');
            
        } catch (error) {
            console.error('Error al descargar documento:', error);
            Alert.error('Error al descargar el documento');
        }
    };
    
    /**
     * Eliminar documento
     */
    const eliminarDocumento = async (idDocumento, nombreArchivo) => {
        const confirmed = confirm(`¿Estás seguro de que deseas eliminar el documento "${nombreArchivo}"?\n\nEsta acción no se puede deshacer.`);
        if (!confirmed) return;
        
        try {
            State.setLoading(true);
            
            const response = await API.delete(`/documentos/alumno/${idAlumno}/${idDocumento}`);
            
            if (response.success) {
                Alert.success(response.message);
                await cargarDocumentos();
            }
            
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            Alert.error(error.message || 'Error al eliminar el documento');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Filtrar documentos
     */
    const filtrarDocumentos = () => {
        const tipo = document.getElementById('filter-tipo').value;
        const search = document.getElementById('search-input').value.toLowerCase();
        
        let filtered = [...documentos];
        
        // Filtrar por tipo
        if (tipo) {
            filtered = filtered.filter(doc => doc.tipo_documento === tipo);
        }
        
        // Filtrar por búsqueda
        if (search) {
            filtered = filtered.filter(doc => 
                doc.nombre_archivo.toLowerCase().includes(search) ||
                doc.tipo_documento.toLowerCase().includes(search)
            );
        }
        
        renderDocumentos(filtered);
    };
    
    /**
     * Obtener icono según tipo de archivo
     */
    const getIconoArchivo = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        
        switch(ext) {
            case 'pdf':
                return 'bi-file-earmark-pdf-fill text-danger';
            case 'doc':
            case 'docx':
                return 'bi-file-earmark-word-fill text-primary';
            case 'xls':
            case 'xlsx':
                return 'bi-file-earmark-excel-fill text-success';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'bi-file-earmark-image-fill text-info';
            default:
                return 'bi-file-earmark-fill';
        }
    };
    
    /**
     * Formatear fecha
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Exponer métodos públicos
    return {
        render,
        abrirModalSubir
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.DocumentosView = DocumentosView;