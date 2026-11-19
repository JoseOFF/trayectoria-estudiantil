// ============================================
// COMPONENTE DE PAGINACIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Pagination = (() => {
    
    /**
     * Renderizar controles de paginación
     * @param {Object} config - Configuración de paginación
     * @param {number} config.currentPage - Página actual (1-based)
     * @param {number} config.totalPages - Total de páginas
     * @param {Function} config.onPageChange - Callback cuando cambia la página
     * @param {string} config.containerId - ID del contenedor donde se renderizará
     * @returns {string} HTML del componente de paginación
     */
    const render = (config) => {
        const { currentPage, totalPages, onPageChange, containerId } = config;
        
        // Si no hay páginas o solo hay una página, no mostrar paginación
        if (totalPages <= 1) {
            return '';
        }
        
        const pages = generatePageNumbers(currentPage, totalPages);
        
        return `
            <nav aria-label="Navegación de páginas" class="mt-4">
                <div class="pagination-info mb-2 text-muted small">
                    Página ${currentPage} de ${totalPages}
                </div>
                <ul class="pagination pagination-sm justify-content-center mb-0">
                    <!-- Botón Anterior -->
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Anterior">
                            <i class="bi bi-chevron-left"></i>
                        </a>
                    </li>
                    
                    ${pages.map(page => {
                        if (page === '...') {
                            return `
                                <li class="page-item disabled">
                                    <span class="page-link">...</span>
                                </li>
                            `;
                        }
                        
                        return `
                            <li class="page-item ${page === currentPage ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${page}">
                                    ${page}
                                </a>
                            </li>
                        `;
                    }).join('')}
                    
                    <!-- Botón Siguiente -->
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Siguiente">
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        `;
    };
    
    /**
     * Generar números de página para mostrar
     * Algoritmo: Mostrar primera, última, página actual y páginas cercanas
     * @param {number} current - Página actual
     * @param {number} total - Total de páginas
     * @returns {Array} Array de números de página o '...'
     */
    const generatePageNumbers = (current, total) => {
        const pages = [];
        const delta = 2; // Número de páginas a mostrar a cada lado de la actual
        
        // Si el total de páginas es pequeño, mostrar todas
        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
            return pages;
        }
        
        // Siempre mostrar la primera página
        pages.push(1);
        
        // Calcular rango de páginas a mostrar
        let start = Math.max(2, current - delta);
        let end = Math.min(total - 1, current + delta);
        
        // Ajustar si estamos cerca del inicio
        if (current <= delta + 2) {
            end = Math.min(total - 1, 2 * delta + 2);
        }
        
        // Ajustar si estamos cerca del final
        if (current >= total - delta - 1) {
            start = Math.max(2, total - 2 * delta - 1);
        }
        
        // Agregar puntos suspensivos si hay gap después de la primera página
        if (start > 2) {
            pages.push('...');
        }
        
        // Agregar páginas del rango
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        // Agregar puntos suspensivos si hay gap antes de la última página
        if (end < total - 1) {
            pages.push('...');
        }
        
        // Siempre mostrar la última página
        pages.push(total);
        
        return pages;
    };
    
    /**
     * Inicializar eventos de paginación en un contenedor
     * @param {string} containerId - ID del contenedor
     * @param {Function} onPageChange - Callback cuando cambia la página
     */
    const initEvents = (containerId, onPageChange) => {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.warn(`Contenedor de paginación '${containerId}' no encontrado`);
            return;
        }
        
        // Remover listeners anteriores si existen
        const oldListener = container._paginationListener;
        if (oldListener) {
            container.removeEventListener('click', oldListener);
        }
        
        // Crear nuevo listener
        const listener = (e) => {
            const pageLink = e.target.closest('.page-link');
            
            if (!pageLink) return;
            
            e.preventDefault();
            
            // Verificar si el item está deshabilitado
            if (pageLink.closest('.page-item').classList.contains('disabled')) {
                return;
            }
            
            // Verificar si el item está activo (página actual)
            if (pageLink.closest('.page-item').classList.contains('active')) {
                return;
            }
            
            const page = parseInt(pageLink.dataset.page);
            
            if (!isNaN(page) && page > 0) {
                onPageChange(page);
            }
        };
        
        // Guardar referencia al listener para poder removerlo después
        container._paginationListener = listener;
        
        // Agregar listener
        container.addEventListener('click', listener);
    };
    
    /**
     * Calcular información de paginación
     * @param {number} total - Total de registros
     * @param {number} limit - Registros por página
     * @param {number} currentPage - Página actual (1-based)
     * @returns {Object} Información de paginación
     */
    const calculatePagination = (total, limit, currentPage = 1) => {
        const totalPages = Math.ceil(total / limit);
        const offset = (currentPage - 1) * limit;
        
        return {
            currentPage: Math.max(1, Math.min(currentPage, totalPages || 1)),
            totalPages: totalPages || 1,
            limit,
            offset,
            total,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
            startRecord: total === 0 ? 0 : offset + 1,
            endRecord: Math.min(offset + limit, total)
        };
    };
    
    /**
     * Renderizar información de registros
     * @param {Object} info - Información de paginación
     * @returns {string} HTML con información de registros
     */
    const renderRecordsInfo = (info) => {
        if (info.total === 0) {
            return '<small class="text-muted">No hay registros</small>';
        }
        
        return `
            <small class="text-muted">
                Mostrando ${info.startRecord} - ${info.endRecord} de ${info.total} registros
            </small>
        `;
    };
    
    // Exponer métodos públicos
    return {
        render,
        initEvents,
        calculatePagination,
        renderRecordsInfo,
        generatePageNumbers
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Pagination = Pagination;