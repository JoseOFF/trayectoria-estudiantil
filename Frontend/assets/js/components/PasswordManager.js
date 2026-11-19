// ============================================
// COMPONENTE: GESTIÓN DE CONTRASEÑAS
// ============================================

const PasswordManager = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    
    /**
     * Mostrar modal para resetear contraseña
     */
    const mostrarModalReset = (idUsuario, nombreUsuario, correo) => {
        const modalHtml = `
            <div class="modal fade" id="modalResetPassword" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title">
                                <i class="bi bi-key me-2"></i>Resetear Contraseña
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                <strong>Atención:</strong> Esta acción generará una contraseña temporal aleatoria.
                            </div>
                            
                            <p class="mb-3">
                                <strong>Usuario:</strong> ${esc(nombreUsuario)}<br>
                                <strong>Correo:</strong> ${esc(correo)}
                            </p>
                            
                            <div class="form-text">
                                Se generará una contraseña temporal de 8 caracteres que deberás
                                entregar al usuario de forma segura. El usuario podrá cambiarla
                                después desde su perfil.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-warning" 
                                    data-accion="PasswordManager.confirmarReset" data-args="${Acciones.args(idUsuario)}">
                                <i class="bi bi-arrow-clockwise me-2"></i>Generar Contraseña Temporal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalResetPassword');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalResetPassword'));
        modal.show();
    };
    
    /**
     * Confirmar reset de contraseña
     */
    const confirmarReset = async (idUsuario) => {
        try {
            State.setLoading(true);
            
            const response = await API.post(`/usuarios/${idUsuario}/reset-password`, {});
            
            if (response.success) {
                // Cerrar modal de confirmación
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalResetPassword'));
                modal.hide();
                
                // Mostrar contraseña temporal
                mostrarContrasenaTemporal(
                    response.data.usuario,
                    response.data.correo,
                    response.data.temporal_password
                );
            }
            
        } catch (error) {
            console.error('Error al resetear contraseña:', error);
            Alert.error(error.message || 'Error al resetear la contraseña');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Mostrar contraseña temporal generada
     */
    const mostrarContrasenaTemporal = (usuario, correo, password) => {
        const modalHtml = `
            <div class="modal fade" id="modalPasswordTemporal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-check-circle me-2"></i>Contraseña Temporal Generada
                            </h5>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                <strong>¡IMPORTANTE!</strong> Copia esta contraseña ahora. No podrás verla de nuevo.
                            </div>
                            
                            <p class="mb-3">
                                <strong>Usuario:</strong> ${esc(usuario)}<br>
                                <strong>Correo:</strong> ${esc(correo)}
                            </p>
                            
                            <div class="card bg-light">
                                <div class="card-body">
                                    <label class="form-label fw-bold">Contraseña Temporal:</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control form-control-lg text-center fw-bold" 
                                               id="temporal-password" value="${esc(password)}" readonly>
                                        <button class="btn btn-outline-primary" type="button" 
                                                data-accion="PasswordManager.copiarPassword">
                                            <i class="bi bi-clipboard"></i> Copiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-info mt-3">
                                <i class="bi bi-info-circle me-2"></i>
                                Entrega esta contraseña al usuario de forma segura. 
                                Recomendamos que la cambie en su próximo inicio de sesión.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                                <i class="bi bi-check2 me-2"></i>He copiado la contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalPasswordTemporal');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalPasswordTemporal'));
        modal.show();
    };
    
    /**
     * Copiar contraseña al portapapeles
     */
    const copiarPassword = () => {
        const input = document.getElementById('temporal-password');
        input.select();
        document.execCommand('copy');
        
        Alert.success('Contraseña copiada al portapapeles');
    };
    
    /**
     * Mostrar modal para cambiar contraseña manualmente
     */
    const mostrarModalCambiar = (idUsuario, nombreUsuario, correo) => {
        const modalHtml = `
            <div class="modal fade" id="modalChangePassword" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-shield-lock me-2"></i>Cambiar Contraseña
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="form-change-password">
                            <div class="modal-body">
                                <p class="mb-3">
                                    <strong>Usuario:</strong> ${esc(nombreUsuario)}<br>
                                    <strong>Correo:</strong> ${esc(correo)}
                                </p>
                                
                                <!-- Nueva Contraseña -->
                                <div class="mb-3">
                                    <label for="new-password" class="form-label">Nueva Contraseña *</label>
                                    <div class="input-group">
                                        <input type="password" 
                                            class="form-control" 
                                            id="new-password" 
                                            name="new-password"
                                            required 
                                            minlength="6"
                                            placeholder="Mínimo 6 caracteres">

                                        <button class="btn btn-outline-secondary" 
                                                type="button"
                                                id="btn-toggle-new"
                                                title="Mostrar/Ocultar">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        
                                    </div>
                                    <div class="form-text">
                                        Mínimo 6 caracteres. Recomendado: incluir mayúsculas, minúsculas y números.
                                    </div>
                                </div>
                                
                                <!-- Confirmar Contraseña -->
                                <div class="mb-3">
                                    <label for="confirm-password" class="form-label">Confirmar Contraseña *</label>
                                    <div class="input-group">
                                        <input type="password" 
                                            class="form-control" 
                                            id="confirm-password" 
                                            name="confirm-password"
                                            required 
                                            minlength="6"
                                            placeholder="Repetir contraseña">
                                        <button class="btn btn-outline-secondary" 
                                                type="button"
                                                id="btn-toggle-confirm"
                                                title="Mostrar/Ocultar">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    El usuario recibirá esta nueva contraseña y podrá cambiarla desde su perfil.
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check2 me-2"></i>Cambiar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalChangePassword');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalChangePassword'));
        modal.show();
        
        document.getElementById('modalChangePassword').addEventListener('shown.bs.modal', function onModalShown() {
            
            // 1. Configurar toggle de contraseñas
            const btnToggleNew = document.getElementById('btn-toggle-new');
            const btnToggleConfirm = document.getElementById('btn-toggle-confirm');
            
            if (btnToggleNew) {
                btnToggleNew.addEventListener('click', () => {
                    togglePasswordByButton('new-password', 'btn-toggle-new');
                });
            }
            
            if (btnToggleConfirm) {
                btnToggleConfirm.addEventListener('click', () => {
                    togglePasswordByButton('confirm-password', 'btn-toggle-confirm');
                });
            }
            
            const form = document.getElementById('form-change-password');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    
                    // Llamar a confirmarCambio
                    confirmarCambio(idUsuario);
                });
            }
            
            
            // Remover este listener después de configurar (solo ejecutar una vez)
            this.removeEventListener('shown.bs.modal', onModalShown);
        });
        
    };


// ============================================
//  togglePasswordByButton
// ============================================
const togglePasswordByButton = (inputId, buttonId) => {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (!input) {
        return;
    }
    
    if (!button) {
        return;
    }
    
    const icon = button.querySelector('i');
    
    if (!icon) {
        return;
    }
    
    // Toggle
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
};

    
    /**
     * Confirmar cambio de contraseña
     */
const confirmarCambio = async (idUsuario) => {
    try {
        
        // IMPORTANTE: NO usar await aquí, obtener valores inmediatamente
        
        // Método 1: Obtener por querySelector (más robusto)
        const form = document.getElementById('form-change-password');
        
        if (!form) {
            Alert.error('Error: Formulario no encontrado');
            return;
        }
        
        // Método 2: Usar FormData para obtener valores
        const formData = new FormData(form);
        
        // Si FormData no funciona porque los inputs no tienen name, obtener directamente
        let newPassword = formData.get('new-password');
        let confirmPassword = formData.get('confirm-password');
        
        
        // Si FormData no funciona, obtener por querySelector
        if (!newPassword || !confirmPassword) {
            
            const inputNew = form.querySelector('#new-password');
            const inputConfirm = form.querySelector('#confirm-password');
            
            if (inputNew) {
                // Probar múltiples formas de obtener el valor
                newPassword = inputNew.value || 
                             inputNew.getAttribute('value') || 
                             inputNew.textContent || 
                             '';
            }
            
            if (inputConfirm) {
                confirmPassword = inputConfirm.value || 
                                 inputConfirm.getAttribute('value') || 
                                 inputConfirm.textContent || 
                                 '';
                                 
            }
        }
        

        
        // Convertir a string si son null/undefined
        newPassword = String(newPassword || '');
        confirmPassword = String(confirmPassword || '');
        
        // Eliminar espacios
        const newPasswordTrimmed = newPassword.trim();
        const confirmPasswordTrimmed = confirmPassword.trim();
        
        console.log('Trimmed lengths:', newPasswordTrimmed.length, confirmPasswordTrimmed.length);
        
        // Validar que no estén vacíos
        if (!newPasswordTrimmed || !confirmPasswordTrimmed) {
            Alert.error('Por favor completa ambos campos de contraseña');
            
            // Resaltar campos
            const inputNew = form.querySelector('#new-password');
            const inputConfirm = form.querySelector('#confirm-password');
            
            if (!newPasswordTrimmed && inputNew) {
                inputNew.classList.add('is-invalid');
                inputNew.focus();
            }
            if (!confirmPasswordTrimmed && inputConfirm) {
                inputConfirm.classList.add('is-invalid');
            }
            return;
        }
        
        // Limpiar errores visuales
        const inputNew = form.querySelector('#new-password');
        const inputConfirm = form.querySelector('#confirm-password');
        
        if (inputNew) inputNew.classList.remove('is-invalid');
        if (inputConfirm) inputConfirm.classList.remove('is-invalid');
        
        // Validar longitud
        if (newPasswordTrimmed.length < 6) {
            Alert.error(`La contraseña debe tener al menos 6 caracteres (tiene ${newPasswordTrimmed.length})`);
            if (inputNew) {
                inputNew.classList.add('is-invalid');
                inputNew.focus();
            }
            return;
        }
        
        // Validar coincidencia
        if (newPasswordTrimmed !== confirmPasswordTrimmed) {
            Alert.error('Las contraseñas no coinciden');
            if (inputConfirm) {
                inputConfirm.classList.add('is-invalid');
                inputConfirm.focus();
            }
            return;
        }
        

        
        State.setLoading(true);
        
        const response = await API.put(`/usuarios/${idUsuario}/change-password`, {
            newPassword: newPasswordTrimmed
        });
        
        
        if (response.success) {
            Alert.success('Contraseña cambiada correctamente');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalChangePassword'));
            if (modal) {
                modal.hide();
            }
        }
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        Alert.error(error.message || 'Error al cambiar la contraseña');
    } finally {
        State.setLoading(false);
    }
};
    
    /**
     * Toggle visibilidad de contraseña
     */
    const togglePasswordVisibility = (inputId) => {
        const input = document.getElementById(inputId);
        
        if (!input) {
            console.error('Input no encontrado:', inputId);
            return;
        }
        
        // Buscar el botón - probamos varias formas
        let button = null;
        let icon = null;
        
        // Método 1: Buscar en el input-group
        const inputGroup = input.closest('.input-group');
        if (inputGroup) {
            button = inputGroup.querySelector('button[type="button"]');
        }
        
        // Método 2: Si no encontró, buscar el siguiente hermano
        if (!button) {
            button = input.nextElementSibling;
        }
        
        // Método 3: Si no encontró, buscar en el padre
        if (!button && input.parentElement) {
            button = input.parentElement.querySelector('button');
        }
        
        if (!button) {
            console.error('Botón no encontrado para:', inputId);
            return;
        }
        
        // Buscar el ícono dentro del botón
        icon = button.querySelector('i');
        
        if (!icon) {
            console.error('Ícono no encontrado en botón');
            return;
        }
        
        // Toggle del tipo de input y del ícono
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
            console.log('Contraseña visible');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
            console.log('Contraseña oculta');
        }
    };
    
    /**
     * Ver historial de cambios de contraseña
     */
    const verHistorial = async (idUsuario, nombreUsuario) => {
        try {
            State.setLoading(true);
            
            const response = await API.get(`/usuarios/${idUsuario}/password-history`);
            
            if (response.success) {
                mostrarModalHistorial(nombreUsuario, response.data);
            }
            
        } catch (error) {
            console.error('Error al obtener historial:', error);
            Alert.error('Error al obtener el historial');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Mostrar modal con historial
     */
    const mostrarModalHistorial = (nombreUsuario, historial) => {
        let historialHtml = '';
        
        if (historial.length === 0) {
            historialHtml = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-1"></i>
                    <p class="mt-2">No hay cambios de contraseña registrados</p>
                </div>
            `;
        } else {
            historialHtml = `
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Acción</th>
                                <th>Realizado por</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historial.map(item => {
                                const datos = JSON.parse(item.datos_nuevos);
                                const fecha = new Date(item.fecha_cambio).toLocaleString('es-MX');
                                const badge = item.tipo_operacion === 'PASSWORD_RESET' 
                                    ? '<span class="badge bg-warning">Reset</span>'
                                    : '<span class="badge bg-primary">Cambio</span>';
                                
                                return `
                                    <tr>
                                        <td><small>${fecha}</small></td>
                                        <td>${badge}<br><small class="text-muted">${esc(datos.accion)}</small></td>
                                        <td>${esc(item.realizado_por)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        const modalHtml = `
            <div class="modal fade" id="modalHistorialPassword" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-clock-history me-2"></i>Historial de Cambios de Contraseña
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-3"><strong>Usuario:</strong> ${esc(nombreUsuario)}</p>
                            ${historialHtml}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalHistorialPassword');
        if (modalAnterior) {
            modalAnterior.remove();
        }
        
        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalHistorialPassword'));
        modal.show();
    };
    
    // Exponer métodos públicos
    return {
        mostrarModalReset,
        confirmarReset,
        copiarPassword,
        mostrarModalCambiar,
        togglePasswordByButton,
        togglePasswordVisibility,
        verHistorial
    };
})();

// Exportar para uso global
window.PasswordManager = PasswordManager;