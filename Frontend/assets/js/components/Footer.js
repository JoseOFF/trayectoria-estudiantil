// ============================================
// COMPONENTE FOOTER - CON INFORMACIÓN DE SOPORTE
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Footer = (() => {
    /**
     * Renderizar footer
     * @param {Object} options - Opciones de configuración
     * @param {Boolean} options.showFullInfo - Mostrar información completa o versión simplificada
     */
    const render = (options = {}) => {
        const { showFullInfo = true } = options;
        
        const currentYear = new Date().getFullYear();

        // Datos de la escuela desde el .env del Backend (core/config.js).
        // Cada dato se escapa; si no está configurado, su línea no aparece.
        const esc = Utils.escapeHtml;
        const inst = Config.getInstitucion();
        const nombreCorto = inst.nombre || 'Sistema de Expedientes';
        const telefonoEnlace = inst.telefono ? inst.telefono.replace(/[^\d+]/g, '') : '';
        const lineaCorreo = inst.correo ? `
                                        <p class="mb-2 small">
                                            <i class="bi bi-envelope-fill me-2"></i>
                                            <a href="mailto:${esc(inst.correo)}">${esc(inst.correo)}</a>
                                        </p>` : '';
        const lineaTelefono = inst.telefono ? `
                                        <p class="mb-2 small">
                                            <i class="bi bi-telephone-fill me-2"></i>
                                            <a href="tel:${esc(telefonoEnlace)}">${esc(inst.telefono)}</a>
                                        </p>` : '';
        const lineaHorario = inst.horario ? `
                                        <p class="mb-0 small text-muted">
                                            <i class="bi bi-clock-fill me-2"></i>
                                            ${esc(inst.horario)}
                                        </p>` : '';
        const hayContacto = inst.correo || inst.telefono || inst.horario;

        // Footer completo (para dashboard y portal)
        if (showFullInfo) {
            return `
                <footer class="app-footer mt-5">
                    <div class="container-fluid">
                        <!-- Sección principal -->
                        <div class="row py-4">
                            <!-- Información de la institución -->
                            <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
                                <h5 class="footer-title">
                                    <i class="bi bi-building me-2"></i>
                                    ${esc(nombreCorto)}
                                </h5>
                                <p class="text-muted small mb-2">
                                    Sistema de Gestión de Expedientes Estudiantiles
                                </p>
                                ${inst.ubicacion ? `
                                <p class="text-muted small mb-0">
                                    <i class="bi bi-geo-alt-fill me-2"></i>
                                    ${esc(inst.ubicacion)}
                                </p>` : ''}
                            </div>
                            
                            <!-- Enlaces rápidos -->
                            <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
                                <h6 class="footer-subtitle">Enlaces Rápidos</h6>
                                <ul class="footer-links">
                                    <li>
                                        <a href="#/dashboard">
                                            <i class="bi bi-house-door me-2"></i>Inicio
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#/portal-alumno">
                                            <i class="bi bi-person-circle me-2"></i>Mi Portal
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            
                            <!-- Soporte técnico (solo si hay algún dato de contacto) -->
                            ${hayContacto ? `
                            <div class="col-lg-4 col-md-12">
                                <div class="footer-support-card">
                                    <h6 class="footer-subtitle text-primary">
                                        <i class="bi bi-headset me-2"></i>
                                        ¿Necesitas Ayuda?
                                    </h6>
                                    <p class="small text-muted mb-3">
                                        ¿Encontraste un error o tienes dudas? Contáctanos:
                                    </p>

                                    <!-- Información de contacto -->
                                    <div class="footer-contact-info mt-3">${lineaCorreo}${lineaTelefono}${lineaHorario}
                                    </div>
                                </div>
                            </div>` : ''}
                        </div>
                        
                        <!-- Línea divisora -->
                        <hr class="footer-divider">
                        
                        <!-- Footer inferior -->
                        <div class="row py-3">
                            <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
                                <p class="footer-copyright mb-0">
                                    © ${currentYear} <strong>${esc(nombreCorto)}</strong> - Todos los derechos reservados
                                </p>
                            </div>
                            <div class="col-md-6 text-center text-md-end">
                                <p class="footer-version mb-0">
                                    <span class="badge bg-secondary">
                                        <i class="bi bi-code-square me-1"></i>
                                        Versión 1.0.0
                                    </span>
                                    <span class="badge bg-success ms-2">
                                        <i class="bi bi-shield-check me-1"></i>
                                        Sistema Seguro
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            `;
        }
        
        // Footer simplificado (para otras vistas)
        return `
            <footer class="app-footer-simple mt-4 py-3">
                <div class="container-fluid">
                    <div class="row align-items-center">
                        <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
                            <p class="mb-0 small text-muted">
                                © ${currentYear} ${esc(nombreCorto)} - Sistema de Expedientes
                            </p>
                        </div>
                        <div class="col-md-6 text-center text-md-end">
                            ${inst.correo ? `
                            <a href="mailto:${esc(inst.correo)}?subject=Reporte%20de%20Error"
                               class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-bug me-1"></i>
                                Reportar Error
                            </a>` : ''}
                        </div>
                    </div>
                </div>
            </footer>
        `;
    };
    
    // Exponer métodos públicos
    return {
        render
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Footer = Footer;