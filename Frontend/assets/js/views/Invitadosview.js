// ============================================
// VISTA DE GESTIÓN DE INVITADOS - CORREGIDA
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const InvitadosView = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    // ============================================
    // RENDERIZAR VISTA COMPLETA
    // ============================================
    const render = async () => {
        const app = document.getElementById('app');
        
        // Inyectar HTML
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
                                    <h2 class="mb-1">
                                        <i class="bi bi-person-badge text-primary me-2"></i>
                                        Gestión de Usuarios Invitados
                                    </h2>
                                    <p class="text-muted mb-0">Administrar usuarios invitados con permisos personalizados</p>
                                </div>
                                <button class="btn btn-primary" id="btnNuevoInvitado">
                                    <i class="bi bi-plus-circle me-2"></i>
                                    Nuevo Invitado
                                </button>
                            </div>

                            <!-- Filtros y búsqueda -->
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="input-group">
                                                <span class="input-group-text">
                                                    <i class="bi bi-search"></i>
                                                </span>
                                                <input type="text" 
                                                       class="form-control" 
                                                       id="searchInvitado" 
                                                       placeholder="Buscar por nombre o correo...">
                                            </div>
                                        </div>
                                        <div class="col-md-6 text-end">
                                            <span class="badge bg-info fs-6" id="totalInvitados">0 invitados</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Lista de invitados -->
                            <div id="listaInvitados">
                                <div class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                    <p class="mt-3 text-muted">Cargando invitados...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: Crear/Editar Invitado -->
            <div class="modal fade" id="modalInvitado" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="modalInvitadoTitle">
                                <i class="bi bi-person-plus-fill me-2"></i>
                                Nuevo Usuario Invitado
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formInvitado">
                                <input type="hidden" id="invitadoId">
                                <input type="hidden" id="modoEdicion" value="false">

                                <!-- Datos básicos -->
                                <div class="mb-4">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="bi bi-person me-2"></i>Datos del Usuario
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Nombre Completo *</label>
                                            <input type="text" 
                                                   class="form-control" 
                                                   id="nombreInvitado" 
                                                   required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Correo Electrónico *</label>
                                            <input type="email" 
                                                   class="form-control" 
                                                   id="correoInvitado" 
                                                   required>
                                        </div>
                                        <div class="col-12" id="divPassword">
                                            <label class="form-label">Contraseña *</label>
                                            <input type="password" 
                                                   class="form-control" 
                                                   id="passwordInvitado" 
                                                   required
                                                   minlength="6">
                                            <small class="text-muted">Mínimo 6 caracteres</small>
                                        </div>
                                    </div>
                                </div>

                                <!-- Licenciaturas -->
                                <div class="mb-4">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="bi bi-mortarboard me-2"></i>Licenciaturas Permitidas *
                                    </h6>
                                    <small class="text-muted d-block mb-2">Selecciona al menos una licenciatura</small>
                                    <div id="licenciaturasCheckboxes" class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
                                        <div class="text-center text-muted py-2">
                                            <small>Cargando licenciaturas...</small>
                                        </div>
                                    </div>
                                </div>

                                <!-- Secciones -->
                                <div class="mb-3">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="bi bi-layout-text-sidebar me-2"></i>Secciones Permitidas
                                    </h6>
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" 
                                               type="checkbox" 
                                               id="todasSecciones" 
                                               checked>
                                        <label class="form-check-label" for="todasSecciones">
                                            <strong>Todas las secciones</strong>
                                            <small class="d-block text-muted">
                                                Si se desmarca, podrás seleccionar secciones específicas
                                            </small>
                                        </label>
                                    </div>
                                    <div id="seccionesCheckboxes" style="display: none;"></div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btnGuardarInvitado">
                                <i class="bi bi-save me-2"></i>Guardar Invitado
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Cargar datos dinámicamente
        await cargarLicenciaturas();
        await cargarSecciones();
        await cargarInvitados();
        
        // Inicializar event listeners
        initEventListeners();
    };

    // ============================================
    // CARGAR DATOS
    // ============================================
    const cargarLicenciaturas = async () => {
        try {
            const response = await API.get('/alumnos/licenciaturas');
            const container = document.getElementById('licenciaturasCheckboxes');
            
            if (response.data && response.data.length > 0) {
                container.innerHTML = response.data.map(lic => `
                    <div class="form-check">
                        <input class="form-check-input lic-checkbox" 
                               type="checkbox" 
                               value="${lic.id_licenciatura}" 
                               id="lic_${lic.id_licenciatura}">
                        <label class="form-check-label" for="lic_${lic.id_licenciatura}">
                            ${esc(lic.nombre_licenciatura)}
                        </label>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<small class="text-muted">No hay licenciaturas disponibles</small>';
            }
        } catch (error) {
            console.error('Error al cargar licenciaturas:', error);
            document.getElementById('licenciaturasCheckboxes').innerHTML = 
                '<small class="text-danger">Error al cargar licenciaturas</small>';
        }
    };

    const cargarSecciones = async () => {
        const container = document.getElementById('seccionesCheckboxes');
        
        const secciones = [
            { value: 'datos_personales', label: 'Datos Personales' },
            { value: 'datos_salud', label: 'Datos de Salud' },
            { value: 'datos_familiares', label: 'Datos Familiares' },
            { value: 'datos_socioeconomicos', label: 'Datos Socioeconómicos' },
            { value: 'datos_academicos', label: 'Datos Académicos' },
            { value: 'practicas_profesionales', label: 'Prácticas Profesionales' },
            { value: 'certificaciones', label: 'Certificaciones' },
            { value: 'habilidades', label: 'Habilidades' },
            { value: 'documentos', label: 'Documentos' },
            { value: 'incidentes', label: 'Incidentes' }
        ];
        
        container.innerHTML = secciones.map(sec => `
            <div class="form-check">
                <input class="form-check-input seccion-checkbox" 
                       type="checkbox" 
                       value="${sec.value}" 
                       id="sec_${sec.value}">
                <label class="form-check-label" for="sec_${sec.value}">
                    ${esc(sec.label)}
                </label>
            </div>
        `).join('');
    };

    const cargarInvitados = async () => {
        try {
            const response = await API.get('/invitados');
            const container = document.getElementById('listaInvitados');
            const totalBadge = document.getElementById('totalInvitados');
            
            if (!response.data || response.data.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-info text-center">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay usuarios invitados registrados.
                        <br><small>Haz clic en "Nuevo Invitado" para crear uno.</small>
                    </div>
                `;
                totalBadge.textContent = '0 invitados';
                return;
            }
            
            totalBadge.textContent = `${response.data.length} invitado${response.data.length > 1 ? 's' : ''}`;

            container.innerHTML = response.data.map(inv => `
                <div class="card mb-3 invitado-card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-4">
                                <h5 class="mb-1">${esc(inv.nombre_usuario || 'Sin nombre')}</h5>
                                <small class="text-muted">${esc(inv.correo)}</small>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">Licenciaturas</small>
                                ${formatLicenciaturas(inv.licenciaturas_permitidas)}
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted d-block">Secciones</small>
                                ${formatSecciones(inv.secciones_permitidas)}
                            </div>
                            <div class="col-md-2 text-end">
                                <span class="badge ${inv.activo ? 'bg-success' : 'bg-secondary'} me-2">
                                    ${inv.activo ? 'Activo' : 'Inactivo'}
                                </span>
                                <button class="btn btn-sm btn-outline-primary me-1" 
                                        data-accion="InvitadosView.editarInvitado" data-args="${Acciones.args(inv.id_usuario)}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" 
                                        data-accion="InvitadosView.eliminarInvitado"
                                        data-args="${Acciones.args(inv.id_usuario, inv.nombre_usuario || 'Sin nombre')}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error al cargar invitados:', error);
            document.getElementById('listaInvitados').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error al cargar lista de invitados: ${esc(error.message)}
                </div>
            `;
        }
    };

    // ============================================
    // FORMATEO
    // ============================================
    const formatLicenciaturas = (licenciaturas) => {
        if (!licenciaturas || licenciaturas.length === 0) {
            return '<span class="badge bg-warning">Sin licenciaturas</span>';
        }
        return `<span class="badge bg-info">${licenciaturas.length} licenciatura${licenciaturas.length > 1 ? 's' : ''}</span>`;
    };

    const formatSecciones = (secciones) => {
        if (!secciones || secciones.length === 0) {
            return '<span class="badge bg-success">Todas</span>';
        }
        return `<span class="badge bg-info">${secciones.length} sección${secciones.length > 1 ? 'es' : ''}</span>`;
    };

    // ============================================
    // EVENT LISTENERS
    // ============================================
    const initEventListeners = () => {
        // Botón nuevo invitado
        document.getElementById('btnNuevoInvitado')?.addEventListener('click', () => {
            abrirModalNuevo();
        });

        // Botón guardar invitado
        document.getElementById('btnGuardarInvitado')?.addEventListener('click', () => {
            guardarInvitado();
        });

        // Toggle secciones
        document.getElementById('todasSecciones')?.addEventListener('change', (e) => {
            const seccionesDiv = document.getElementById('seccionesCheckboxes');
            if (seccionesDiv) {
                seccionesDiv.style.display = e.target.checked ? 'none' : 'block';
            }
        });

        // Búsqueda
        document.getElementById('searchInvitado')?.addEventListener('input', (e) => {
            filtrarInvitados(e.target.value);
        });
    };

    // ============================================
    // MODAL NUEVO/EDITAR
    // ============================================
    const abrirModalNuevo = () => {
        document.getElementById('modalInvitadoTitle').innerHTML = `
            <i class="bi bi-person-plus-fill me-2"></i>Nuevo Usuario Invitado
        `;
        document.getElementById('formInvitado').reset();
        document.getElementById('invitadoId').value = '';
        document.getElementById('modoEdicion').value = 'false';
        document.getElementById('divPassword').style.display = 'block';
        document.getElementById('passwordInvitado').required = true;
        document.getElementById('todasSecciones').checked = true;
        document.getElementById('seccionesCheckboxes').style.display = 'none';

        const modal = new bootstrap.Modal(document.getElementById('modalInvitado'));
        modal.show();
    };

    const editarInvitado = async (id) => {
        try {
            // Obtener permisos
            const response = await API.get(`/invitados/${id}/permisos`);
            const permisos = response.data;

            // Obtener datos del usuario
            const userResponse = await API.get(`/usuarios/${id}`);
            const usuario = userResponse.data;

            document.getElementById('modalInvitadoTitle').innerHTML = `
                <i class="bi bi-pencil-fill me-2"></i>Editar Usuario Invitado
            `;
            document.getElementById('invitadoId').value = id;
            document.getElementById('modoEdicion').value = 'true';
            document.getElementById('nombreInvitado').value = usuario.nombre_usuario || '';
            document.getElementById('correoInvitado').value = usuario.correo || '';
            document.getElementById('divPassword').style.display = 'none';
            document.getElementById('passwordInvitado').required = false;

            // Marcar licenciaturas
            document.querySelectorAll('.lic-checkbox').forEach(checkbox => {
                checkbox.checked = permisos.licenciaturas_permitidas?.includes(parseInt(checkbox.value));
            });

            // Configurar secciones
            if (permisos.secciones_permitidas && permisos.secciones_permitidas.length > 0) {
                document.getElementById('todasSecciones').checked = false;
                document.getElementById('seccionesCheckboxes').style.display = 'block';
                
                document.querySelectorAll('.seccion-checkbox').forEach(checkbox => {
                    checkbox.checked = permisos.secciones_permitidas.includes(checkbox.value);
                });
            } else {
                document.getElementById('todasSecciones').checked = true;
                document.getElementById('seccionesCheckboxes').style.display = 'none';
            }

            const modal = new bootstrap.Modal(document.getElementById('modalInvitado'));
            modal.show();

        } catch (error) {
            console.error('Error al cargar datos del invitado:', error);
            Alert.error('Error al cargar datos del invitado');
        }
    };

    // ============================================
    // GUARDAR
    // ============================================
    const guardarInvitado = async () => {
        try {
            const btnGuardar = document.getElementById('btnGuardarInvitado');
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

            const id = document.getElementById('invitadoId').value;
            const modoEdicion = document.getElementById('modoEdicion').value === 'true';
            const nombre = document.getElementById('nombreInvitado').value.trim();
            const correo = document.getElementById('correoInvitado').value.trim();
            const password = document.getElementById('passwordInvitado').value;

            // Validar
            if (!nombre || !correo) {
                Alert.error('Completa todos los campos obligatorios');
                return;
            }

            // Obtener licenciaturas seleccionadas
            const licenciaturas = Array.from(document.querySelectorAll('.lic-checkbox:checked'))
                .map(cb => parseInt(cb.value));

            if (licenciaturas.length === 0) {
                Alert.error('Debes seleccionar al menos una licenciatura');
                return;
            }

            // Obtener secciones (si aplica)
            let secciones = null;
            if (!document.getElementById('todasSecciones').checked) {
                secciones = Array.from(document.querySelectorAll('.seccion-checkbox:checked'))
                    .map(cb => cb.value);
                
                if (secciones.length === 0) {
                    secciones = null; // Si no hay ninguna seleccionada, usar null (todas)
                }
            }

            if (modoEdicion) {
                // Actualizar usuario existente
                await API.put(`/usuarios/${id}`, {
                    nombre_usuario: nombre,
                    correo: correo,
                    id_rol: 4, // ID del rol Invitado
                    activo: true,
                    tipo_usuario: 'Invitado',
                    licenciaturas_permitidas: licenciaturas,
                    secciones_permitidas: secciones
                });

                Alert.success('Invitado actualizado correctamente');
            } else {
                // Crear nuevo invitado
                if (!password || password.length < 6) {
                    Alert.error('La contraseña debe tener al menos 6 caracteres');
                    return;
                }

                await API.post('/usuarios', {
                    nombre_usuario: nombre,
                    correo: correo,
                    contrasena: password,
                    id_rol: 4, // ID del rol Invitado
                    tipo_usuario: 'Invitado',
                    licenciaturas_permitidas: licenciaturas,
                    secciones_permitidas: secciones
                });

                Alert.success('Invitado creado correctamente');
            }

            bootstrap.Modal.getInstance(document.getElementById('modalInvitado')).hide();
            await cargarInvitados();

        } catch (error) {
            console.error('Error al guardar invitado:', error);
            Alert.error(error.response?.data?.message || 'Error al guardar invitado');
        } finally {
            const btnGuardar = document.getElementById('btnGuardarInvitado');
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Invitado';
        }
    };

    // ============================================
    // ELIMINAR
    // ============================================
    const eliminarInvitado = async (id, nombre) => {
        const confirmar = await Alert.confirm(
            '¿Eliminar invitado?',
            `¿Estás seguro de eliminar al usuario invitado "${nombre}"? Esta acción no se puede deshacer.`
        );

        if (!confirmar) return;

        try {
            await API.delete(`/usuarios/${id}/permanent`);
            Alert.success('Invitado eliminado correctamente');
            await cargarInvitados();
        } catch (error) {
            console.error('Error al eliminar invitado:', error);
            Alert.error('Error al eliminar invitado');
        }
    };

    // ============================================
    // FILTRAR
    // ============================================
    const filtrarInvitados = (termino) => {
        const cards = document.querySelectorAll('.invitado-card');
        termino = termino.toLowerCase();

        cards.forEach(card => {
            const texto = card.textContent.toLowerCase();
            card.style.display = texto.includes(termino) ? 'block' : 'none';
        });
    };

    // Exponer métodos públicos
    return {
        render,
        editarInvitado,
        eliminarInvitado
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.InvitadosView = InvitadosView;