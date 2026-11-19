// ============================================
// COMPONENTE DE ALERTAS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Alert = (() => {
    // Los mensajes pueden traer datos escritos por usuarios (nombres, respuestas
    // del servidor), por eso se escapan antes de insertarlos como HTML.
    const esc = (valor) => Utils.escapeHtml(valor);

    /**
     * Crear contenedor de alertas si no existe
     */
    const ensureContainer = () => {
        let container = document.getElementById('alert-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'alert-container';
            container.className = 'alert-container';
            document.body.appendChild(container);
        }
        
        return container;
    };
    
    /**
     * Obtener icono según el tipo de alerta
     */
    const getIcon = (type) => {
        const icons = {
            success: 'bi-check-circle-fill',
            danger: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        
        return icons[type] || icons.info;
    };
    
    /**
     * Mostrar alerta
     */
    const show = (message, type = 'info', duration = 5000) => {
        const container = ensureContainer();
        
        // Crear elemento de alerta
        const alert = document.createElement('div');
        alert.className = `custom-alert alert-${type}`;
        alert.innerHTML = `
            <i class="bi ${getIcon(type)}"></i>
            <div class="flex-grow-1">${esc(message)}</div>
            <button type="button" class="btn-close btn-close-sm ms-2" aria-label="Cerrar"></button>
        `;
        
        // Agregar al contenedor
        container.appendChild(alert);
        
        // Botón para cerrar manualmente
        const closeBtn = alert.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            removeAlert(alert);
        });
        
        // Auto-cerrar después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                removeAlert(alert);
            }, duration);
        }
        
        return alert;
    };
    
    /**
     * Remover alerta con animación
     */
    const removeAlert = (alert) => {
        alert.style.animation = 'slideOut 0.3s ease';
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    };
    
    /**
     * Mostrar alerta de éxito
     */
    const success = (message, duration) => {
        return show(message, 'success', duration);
    };
    
    /**
     * Mostrar alerta de error
     */
    const error = (message, duration) => {
        return show(message, 'danger', duration);
    };
    
    /**
     * Mostrar alerta de advertencia
     */
    const warning = (message, duration) => {
        return show(message, 'warning', duration);
    };
    
    /**
     * Mostrar alerta de información
     */
    const info = (message, duration) => {
        return show(message, 'info', duration);
    };
    
    /**
     * Limpiar todas las alertas
     */
    const clearAll = () => {
        const container = document.getElementById('alert-container');
        if (container) {
            container.innerHTML = '';
        }
    };

    /**
     * Mostrar diálogo de confirmación personalizado
     * @param {string} title - Título del diálogo
     * @param {string} message - Mensaje de confirmación
     * @param {object} options - Opciones adicionales
     * @returns {Promise<boolean>} true si confirma, false si cancela
     */
    const confirm = (title, message, options = {}) => {
        return new Promise((resolve) => {
            // Opciones por defecto
            const {
                confirmText = 'Confirmar',
                cancelText = 'Cancelar',
                confirmClass = 'btn-danger',
                cancelClass = 'btn-secondary'
            } = options;

            // Crear overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-backdrop fade show';
            overlay.style.zIndex = '1055';
            
            // Crear modal
            const modal = document.createElement('div');
            modal.className = 'modal fade show';
            modal.style.display = 'block';
            modal.style.zIndex = '1056';
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-exclamation-triangle text-warning me-2"></i>
                                ${esc(title)}
                            </h5>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0">${esc(message)}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn ${esc(cancelClass)}" data-action="cancel">
                                ${esc(cancelText)}
                            </button>
                            <button type="button" class="btn ${esc(confirmClass)}" data-action="confirm">
                                ${esc(confirmText)}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar al DOM
            document.body.appendChild(overlay);
            document.body.appendChild(modal);
            document.body.classList.add('modal-open');
            
            // Función para cerrar el modal
            const closeModal = (confirmed) => {
                modal.classList.remove('show');
                overlay.classList.remove('show');
                
                setTimeout(() => {
                    document.body.removeChild(modal);
                    document.body.removeChild(overlay);
                    document.body.classList.remove('modal-open');
                    resolve(confirmed);
                }, 150);
            };
            
            // Event listeners
            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                closeModal(true);
            });
            
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                closeModal(false);
            });
            
            overlay.addEventListener('click', () => {
                closeModal(false);
            });
            
            // Cerrar con ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeModal(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    };
    
    // Exponer métodos públicos
    return {
        show,
        success,
        error,
        warning,
        info,
        clearAll,
        confirm
    };
})();

// Agregar animación de salida al CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Alert = Alert;