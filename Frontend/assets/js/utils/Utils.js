// ============================================
// UTILIDADES GLOBALES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Utils = (() => {
    /**
     * Escapar texto para insertarlo dentro de HTML (innerHTML o plantillas).
     * Convierte los caracteres especiales en entidades para que el navegador
     * los muestre como letras y no los interprete como etiquetas o atributos.
     * Sirve igual entre etiquetas que dentro de atributos: value="${...}".
     * @param {*} valor - Texto a escapar (null o undefined regresan '')
     * @returns {string} Texto seguro para HTML
     */
    const ENTIDADES_HTML = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    const escapeHtml = (valor) => {
        if (valor === null || valor === undefined) return '';
        return String(valor).replace(/[&<>"']/g, (caracter) => ENTIDADES_HTML[caracter]);
    };

    /**
     * Mostrar mensaje toast/notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en milisegundos (default: 3000)
     */
    const showToast = (message, type = 'info', duration = 3000) => {
        // Si existe Alert, usarlo
        if (window.Alert) {
            Alert.show(message, type);
            return;
        }
        
        // Crear contenedor si no existe
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // Mapear tipos a clases de Bootstrap
        const typeMap = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        
        const iconMap = {
            'success': 'check-circle-fill',
            'error': 'exclamation-triangle-fill',
            'warning': 'exclamation-circle-fill',
            'info': 'info-circle-fill'
        };
        
        const bgClass = typeMap[type] || 'info';
        const icon = iconMap[type] || 'info-circle-fill';
        
        // Crear toast
        const toast = document.createElement('div');
        toast.className = `alert alert-${bgClass} alert-dismissible fade show d-flex align-items-center mb-2`;
        toast.role = 'alert';
        toast.style.cssText = `
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        toast.innerHTML = `
            <i class="bi bi-${icon} me-2"></i>
            <div class="flex-grow-1">${escapeHtml(message)}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        container.appendChild(toast);
        
        // Auto-cerrar después de duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                // Eliminar contenedor si está vacío
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, duration);
    };
    
    /**
     * Formatear fecha a formato legible
     * @param {string|Date} date - Fecha a formatear
     * @param {boolean} includeTime - Incluir hora (default: false)
     * @returns {string} Fecha formateada
     */
    const formatDate = (date, includeTime = false) => {
        if (!date) return '-';
        
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString('es-MX', options);
    };
    
    /**
     * Formatear número con separadores de miles
     * @param {number} number - Número a formatear
     * @param {number} decimals - Cantidad de decimales (default: 2)
     * @returns {string} Número formateado
     */
    const formatNumber = (number, decimals = 2) => {
        if (isNaN(number)) return '-';
        
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    };
    
    /**
     * Formatear moneda (pesos mexicanos)
     * @param {number} amount - Cantidad a formatear
     * @returns {string} Cantidad formateada con símbolo de moneda
     */
    const formatCurrency = (amount) => {
        if (isNaN(amount)) return '-';
        
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };
    
    /**
     * Validar CURP mexicano
     * @param {string} curp - CURP a validar
     * @returns {boolean} True si es válido
     */
    const validateCURP = (curp) => {
        if (!curp || curp.length !== 18) return false;
        
        const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
        return regex.test(curp.toUpperCase());
    };
    
    /**
     * Validar email
     * @param {string} email - Email a validar
     * @returns {boolean} True si es válido
     */
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };
    
    /**
     * Capitalizar primera letra de cada palabra
     * @param {string} str - String a capitalizar
     * @returns {string} String capitalizado
     */
    const capitalizeWords = (str) => {
        if (!str) return '';
        
        return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };
    
    /**
     * Generar color aleatorio para avatares
     * @param {string} text - Texto para generar color consistente
     * @returns {string} Color en formato hex
     */
    const getColorFromText = (text) => {
        if (!text) return '#6c757d';
        
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#0d6efd', '#6610f2', '#6f42c1', '#d63384', 
            '#dc3545', '#fd7e14', '#ffc107', '#198754', 
            '#20c997', '#0dcaf0'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    };
    
    /**
     * Debounce function para optimizar búsquedas
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función debounced
     */
    const debounce = (func, wait = 300) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    /**
     * Confirmar acción con modal
     * @param {string} message - Mensaje de confirmación
     * @param {string} title - Título del modal
     * @returns {Promise<boolean>} True si confirma
     */
    const confirm = (message, title = 'Confirmar acción') => {
        return new Promise((resolve) => {
            // Usar confirm nativo si no hay Bootstrap
            if (typeof bootstrap === 'undefined') {
                resolve(window.confirm(message));
                return;
            }
            
            // Crear modal de confirmación
            const modalId = 'modal-confirm-' + Date.now();
            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${escapeHtml(title)}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${escapeHtml(message)}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="btn-confirm-action">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            const modalElement = document.getElementById(modalId);
            const modal = new bootstrap.Modal(modalElement);
            
            document.getElementById('btn-confirm-action').addEventListener('click', () => {
                modal.hide();
                resolve(true);
            });
            
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                resolve(false);
            });
            
            modal.show();
        });
    };
    
    /**
     * Sacar el nombre del archivo del encabezado Content-Disposition.
     * Express (res.download) lo manda así:
     *   attachment; filename="foto pr.png"
     *   attachment; filename="inscripci?n.pdf"; filename*=UTF-8''inscripci%C3%B3n.pdf
     * Se prefiere filename* (trae acentos); si no, se toma lo que hay DENTRO de
     * las comillas de filename. (La expresión vieja se llevaba la comilla de
     * cierre y el navegador la cambiaba por "_": "foto pr.png_".)
     * @param {string|null} contentDisposition - Valor del encabezado
     * @param {string} respaldo - Nombre a usar si no se puede leer
     * @returns {string} Nombre del archivo
     */
    const nombreArchivoDescarga = (contentDisposition, respaldo = 'documento') => {
        if (!contentDisposition) return respaldo;

        const conAcentos = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
        if (conAcentos) {
            try {
                return decodeURIComponent(conAcentos[1].trim());
            } catch (e) {
                // Codificación inválida: se intenta con filename normal
            }
        }

        // Dentro de las comillas, Express escapa \" y \\ : se quitan esas barras
        const entreComillas = /filename\s*=\s*"((?:[^"\\]|\\.)*)"/i.exec(contentDisposition);
        if (entreComillas && entreComillas[1]) return entreComillas[1].replace(/\\(.)/g, '$1');

        const sinComillas = /filename\s*=\s*([^;\s]+)/i.exec(contentDisposition);
        if (sinComillas) return sinComillas[1];

        return respaldo;
    };

    /**
     * Descargar archivo desde blob
     * @param {Blob} blob - Datos del archivo
     * @param {string} filename - Nombre del archivo
     */
    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    
    // Exponer métodos públicos
    return {
        escapeHtml,
        showToast,
        formatDate,
        formatNumber,
        formatCurrency,
        validateCURP,
        validateEmail,
        capitalizeWords,
        getColorFromText,
        debounce,
        confirm,
        nombreArchivoDescarga,
        downloadBlob
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Utils = Utils;

// ============================================
// AGREGAR ESTILOS DE ANIMACIÓN
// ============================================
if (!document.getElementById('utils-styles')) {
    const style = document.createElement('style');
    style.id = 'utils-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}