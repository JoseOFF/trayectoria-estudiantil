// ============================================
// COMPONENTE NAVBAR - CON CAMBIO DE CONTRASEÑA
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Navbar = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    /**
     * Renderizar navbar
     */
    const render = () => {
        const user = Auth.getCurrentUser();
        
        if (!user) return '';
        
        const html = `
            <nav class="navbar-top">
                <div class="d-flex align-items-center">
                    <button class="btn btn-link text-dark d-md-none me-3" id="toggle-sidebar">
                        <i class="bi bi-list fs-4"></i>
                    </button>
                    <h5 class="mb-0">Sistema de Expedientes Estudiantiles</h5>
                </div>
                
                <div class="d-flex align-items-center gap-3">
                    
                    
                    <!-- Usuario -->
                    <div class="dropdown">
                        <button 
                            class="btn btn-link text-dark d-flex align-items-center gap-2" 
                            type="button" 
                            id="usuario-dropdown"
                            data-bs-toggle="dropdown"
                        >
                            <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                 style="width: 35px; height: 35px;">
                                ${esc(user.nombre_usuario.charAt(0).toUpperCase())}
                            </div>
                            <div class="d-none d-md-block text-start">
                                <div class="fw-semibold small">${esc(user.nombre_usuario)}</div>
                                <div class="text-muted" style="font-size: 0.75rem;">${esc(user.rol.nombre_rol)}</div>
                            </div>
                            <i class="bi bi-chevron-down"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">

                            <li>
                                <button type="button" class="dropdown-item" id="btn-change-password">
                                    <i class="bi bi-key me-2"></i>Cambiar Contraseña
                                </button>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <button type="button" class="dropdown-item text-danger" id="logout-link">
                                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Modal para cambiar contraseña -->
            <div class="modal fade" id="modalCambiarContrasena" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-key me-2"></i>Cambiar Contraseña
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="form-cambiar-contrasena">
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    <strong>Requisitos:</strong> Mínimo 6 caracteres
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Contraseña Actual *</label>
                                    <input type="password" class="form-control" id="current-password" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Nueva Contraseña *</label>
                                    <input type="password" class="form-control" id="new-password" required minlength="6">
                                    <div class="form-text" id="password-strength"></div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Confirmar Nueva Contraseña *</label>
                                    <input type="password" class="form-control" id="confirm-password" required minlength="6">
                                    <div class="form-text" id="password-match"></div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btn-save-password">
                                <i class="bi bi-check-circle me-2"></i>Cambiar Contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // AUTO-INICIALIZAR después de un delay pequeño
        setTimeout(() => {
            console.log('[Navbar] Auto-inicializando eventos...');
            initEvents();
        }, 150);
        
        return html;
    };
    
    /**
     * Inicializar eventos
     */
    const initEvents = () => {
        console.log('[Navbar] Inicializando eventos...');
        
        // Toggle sidebar
        const toggleBtn = document.getElementById('toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                document.querySelector('.sidebar')?.classList.toggle('show');
            };
        }
        
        // Logout
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.onclick = async (e) => {
                e.preventDefault();
                if (confirm('¿Cerrar sesión?')) {
                    await Auth.logout();
                }
            };
        }
        
        // Botón cambiar contraseña
        const btnChangePass = document.getElementById('btn-change-password');
        if (btnChangePass) {
            btnChangePass.onclick = (e) => {
                e.preventDefault();
                console.log('[Navbar] Abriendo modal...');
                openModal();
            };
        } else {
            console.error('- Botón cambiar contraseña NO encontrado');
        }
        
        // Inicializar validaciones del modal
        initModalValidations();
        
        // Botón guardar contraseña
        const btnSave = document.getElementById('btn-save-password');
        if (btnSave) {
            btnSave.onclick = (e) => {
                e.preventDefault();
                handleSavePassword();
            };
        }
        
        console.log('[Navbar] Eventos inicializados correctamente');
    };
    
    /**
     * Abrir modal
     */
    const openModal = () => {
        const modalEl = document.getElementById('modalCambiarContrasena');
        if (!modalEl) {
            console.error('- Modal no encontrado');
            alert('Error: No se pudo abrir el modal');
            return;
        }
        
        // Limpiar formulario
        document.getElementById('form-cambiar-contrasena')?.reset();
        document.getElementById('password-strength').textContent = '';
        document.getElementById('password-match').textContent = '';
        
        // Abrir modal
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        console.log('Modal abierto');
    };
    
    /**
     * Inicializar validaciones
     */
    const initModalValidations = () => {
        // Validar fortaleza
        const newPass = document.getElementById('new-password');
        if (newPass) {
            newPass.oninput = () => {
                const val = newPass.value;
                const strengthDiv = document.getElementById('password-strength');
                
                if (val.length === 0) {
                    strengthDiv.textContent = '';
                    return;
                }
                
                let strength = 0;
                if (val.length >= 6) strength++;
                if (val.length >= 8) strength++;
                if (/[A-Z]/.test(val)) strength++;
                if (/[a-z]/.test(val)) strength++;
                if (/[0-9]/.test(val)) strength++;
                if (/[^A-Za-z0-9]/.test(val)) strength++;
                
                if (strength <= 2) {
                    strengthDiv.textContent = 'Débil';
                    strengthDiv.className = 'form-text text-danger';
                } else if (strength <= 4) {
                    strengthDiv.textContent = 'Media';
                    strengthDiv.className = 'form-text text-warning';
                } else {
                    strengthDiv.textContent = 'Fuerte';
                    strengthDiv.className = 'form-text text-success';
                }
            };
        }
        
        // Validar coincidencia
        const confirmPass = document.getElementById('confirm-password');
        if (confirmPass) {
            confirmPass.oninput = () => {
                const newVal = document.getElementById('new-password').value;
                const confirmVal = confirmPass.value;
                const matchDiv = document.getElementById('password-match');
                
                if (confirmVal.length === 0) {
                    matchDiv.textContent = '';
                    return;
                }
                
                if (newVal === confirmVal) {
                    matchDiv.textContent = ' Coinciden';
                    matchDiv.className = 'form-text text-success';
                } else {
                    matchDiv.textContent = '- No coinciden';
                    matchDiv.className = 'form-text text-danger';
                }
            };
        }
        
    };
    
    /**
     * Guardar contraseña
     */
    const handleSavePassword = async () => {
        console.log('Guardando contraseña...');
        
        const current = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;
        
        // Validaciones
        if (!current || !newPass || !confirm) {
            alert('Completa todos los campos');
            return;
        }
        
        if (newPass.length < 6) {
            alert('La nueva contraseña debe tener mínimo 6 caracteres');
            return;
        }
        
        if (newPass !== confirm) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (current === newPass) {
            alert('La nueva contraseña debe ser diferente a la actual');
            return;
        }
        
        // Deshabilitar botón
        const btn = document.getElementById('btn-save-password');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        
        try {
            console.log('Enviando al servidor...');
            
            const response = await API.post('/auth/change-password', {
                currentPassword: current,
                newPassword: newPass
            });
            
            console.log('Respuesta:', response);
            
            if (response.success) {
                // Cerrar modal
                const modalEl = document.getElementById('modalCambiarContrasena');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                
                // Limpiar
                document.getElementById('form-cambiar-contrasena').reset();
                
                alert(' Contraseña actualizada exitosamente');
            } else {
                throw new Error(response.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('- Error:', error);
            
            let msg = 'Error al cambiar la contraseña';
            if (error.message) {
                if (error.message.includes('incorrecta') || error.message.includes('incorrect') || error.message.includes('401')) {
                    msg = 'La contraseña actual es incorrecta';
                } else {
                    msg = error.message;
                }
            }
            
            alert('- ' + msg);
        } finally {
            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Cambiar Contraseña';
        }
    };
    
    // Exponer métodos
    return {
        render,
        initEvents
    };
})();

// Exportar globalmente
window.Navbar = Navbar;