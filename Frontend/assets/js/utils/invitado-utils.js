// ============================================
// UTILIDADES PARA MANEJO DE PERMISOS DE INVITADO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const InvitadoUtils = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    
    /**
     * Mapeo de tabs a nombres de secciones del backend
     */
    const SECCION_MAPPING = {
    'datos-personales': 'datos_personales',
    'academico': 'datos_academicos',
    'salud': 'datos_salud',
    'familiares': 'datos_familiares',
    'incidentes': 'incidentes',
    'desempeno': 'datos_academicos', // usa datos_academicos
    'habilidades': 'habilidades',
    'certificaciones': 'certificaciones',
    'socioeconomicos': 'datos_socioeconomicos',
    'becas': 'datos_socioeconomicos',  // usa datos_socioeconomicos
    'movilidad': 'datos_academicos',    // usa datos_academicos
    'practicas': 'practicas_profesionales'
    };

    /**
     * Verificar si el usuario invitado tiene permiso para ver una sección
     * @param {string} seccionTab - ID del tab (ej: 'datos-personales')
     * @param {object} expediente - Objeto expediente con _secciones_permitidas
     * @returns {boolean}
     */
    const tienePermisoSeccion = (seccionTab, expediente) => {
        // Si no es invitado, tiene todos los permisos
        if (!expediente._es_invitado) {
            return true;
        }
        
        // Si no hay control de secciones (null), tiene acceso a todo
        if (!expediente._secciones_permitidas) {
            return true;
        }
        
        // Obtener el nombre de la sección del backend
        const seccionBackend = SECCION_MAPPING[seccionTab];
        
        // Verificar si está en la lista de secciones permitidas
        return expediente._secciones_permitidas.includes(seccionBackend);
    };

    /**
     * Renderizar mensaje de "Sin permiso"
     * @param {string} nombreSeccion - Nombre amigable de la sección
     * @returns {string} HTML del mensaje
     */
    const renderSinPermiso = (nombreSeccion) => {
        return `
            <div class="col-12">
                <div class="alert alert-warning d-flex align-items-center" role="alert">
                    <i class="bi bi-shield-lock-fill fs-4 me-3"></i>
                    <div>
                        <h5 class="alert-heading mb-1">Acceso Restringido</h5>
                        <p class="mb-0">
                            No tiene permiso para ver la sección <strong>${esc(nombreSeccion)}</strong>.
                            <br>
                            <small class="text-muted">Contacte al administrador si necesita acceso a esta información.</small>
                        </p>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Deshabilitar todos los botones de edición en un contenedor
     * Aplica disabled a botones y agrega tooltip
     * @param {string} containerSelector - Selector del contenedor
     */
    const deshabilitarBotonesEdicion = (containerSelector) => {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        // Deshabilitar todos los botones que no sean de vista
        const botones = container.querySelectorAll('button:not([data-readonly])');
        botones.forEach(btn => {
            // Solo deshabilitar botones de edición/crear/eliminar
            const tieneIconoEdicion = btn.querySelector('.bi-pencil, .bi-plus, .bi-trash, .bi-save, .bi-upload');
            const textoBoton = btn.textContent.toLowerCase();
            const esBotonEdicion = tieneIconoEdicion || 
                                  textoBoton.includes('editar') || 
                                  textoBoton.includes('agregar') || 
                                  textoBoton.includes('guardar') ||
                                  textoBoton.includes('eliminar') ||
                                  textoBoton.includes('subir');
            
            if (esBotonEdicion) {
                btn.disabled = true;
                btn.classList.add('disabled');
                btn.title = 'Solo tienes permiso de lectura';
                btn.style.cursor = 'not-allowed';
                
                // Agregar badge de "Solo lectura"
                if (!btn.querySelector('.badge-readonly')) {
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-secondary badge-readonly ms-1';
                    badge.innerHTML = '<i class="bi bi-eye-fill"></i>';
                    badge.title = 'Solo lectura';
                    btn.appendChild(badge);
                }
            }
        });
        
        // Deshabilitar inputs de archivos
        const inputsFile = container.querySelectorAll('input[type="file"]');
        inputsFile.forEach(input => {
            input.disabled = true;
            input.style.cursor = 'not-allowed';
        });
    };

    /**
     * Agregar indicador de "Solo lectura" al header de una card
     * @param {string} cardSelector - Selector de la card
     */
    const agregarIndicadorSoloLectura = (cardSelector) => {
        const card = document.querySelector(cardSelector);
        if (!card) return;
        
        const cardHeader = card.querySelector('.card-header');
        if (cardHeader && !cardHeader.querySelector('.badge-solo-lectura')) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-warning text-dark ms-2 badge-solo-lectura';
            badge.innerHTML = '<i class="bi bi-eye-fill me-1"></i>Solo Lectura';
            cardHeader.appendChild(badge);
        }
    };

    // ============================================
    // EXPORTAR UTILIDADES (Patrón del proyecto)
    // ============================================
    return {
        tienePermisoSeccion,
        renderSinPermiso,
        deshabilitarBotonesEdicion,
        agregarIndicadorSoloLectura,
        SECCION_MAPPING
    };

})();