// ============================================
// COMPONENTE SIDEBAR
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Sidebar = (() => {
    // Escapa el texto que viene de la base antes de insertarlo en el HTML
    const esc = Utils.escapeHtml;

    /**
     * Obtener menú según el rol del usuario
     */
    const getMenuItems = () => {
        const user = Auth.getCurrentUser();
        
        // Menú base para todos los usuarios
        const baseMenu = [
            {
                icon: 'bi-speedometer2',
                label: 'Dashboard',
                route: '/dashboard'
            }
        ];
        
        // Menú para administradores
        if (Auth.isAdmin()) {
            return [
                ...baseMenu,
                {
                    icon: 'bi-people',
                    label: 'Alumnos',
                    route: '/alumnos'
                },
                {
                    icon: 'bi-clipboard-check',
                    label: 'Seguimiento',
                    route: '/completitud'
                },
                {
                    icon: 'bi-person-badge',
                    label: 'Docentes',
                    route: '/docentes'
                },
                {
                    label: 'Invitados',
                    icon: 'bi-person-badge',
                    route: '/invitados',
                },
                {
                    icon: 'bi-person-gear',
                    label: 'Usuarios',
                    route: '/usuarios'
                },
                {
                    icon: 'bi-file-earmark-spreadsheet',
                    label: 'Carga Masiva',
                    route: '/carga-masiva'
                },
                {
                    icon: 'bi-shield-lock',
                    label: 'Seguridad',
                    route: '/seguridad'
                },
                {
                    icon: 'bi-bar-chart',
                    label: 'Reportes',
                    route: '/reportes'
                }
            ];
        }
        
        // Menú para docentes
        if (Auth.isDocente()) {
            return [
                ...baseMenu,
                {
                    icon: 'bi-people',
                    label: 'Mis Alumnos',
                    route: '/alumnos'
                },
                {
                    icon: 'bi-clipboard-check',
                    label: 'Seguimiento',
                    route: '/completitud'
                },
                {
                    icon: 'bi-bar-chart',
                    label: 'Reportes',
                    route: '/reportes'
                }
            ];
        }
        
        // Menú para alumnos
        if (Auth.isAlumno()) {
            return [
                ...baseMenu,
                {
                    icon: 'bi-person-circle',
                    label: 'Mi Portal',
                    route: '/portal-alumno'
                }
            ];
        }
        
        return baseMenu;
    };
    
    /**
     * Renderizar sidebar
     */
    const render = () => {
        const user = Auth.getCurrentUser();
        const menuItems = getMenuItems();
        const currentRoute = Router.getCurrentRoute();
        
        if (!user) return '';
        
        return `
            <aside class="sidebar">
                <!-- Header del sidebar -->
                <div class="sidebar-header">
                    <h4 class="mb-0">
                        <i class="bi bi-mortarboard-fill me-2"></i>
                        Trayectoria
                    </h4>
                    <small class="text-white-50">Estudiantil</small>
                </div>
                
                <!-- Menú de navegación -->
                <ul class="sidebar-menu">
                    ${menuItems.map(item => `
                        <li>
                            <a href="#${item.route}" 
                               class="${currentRoute === item.route ? 'active' : ''}"
                               data-route="${item.route}">
                                <i class="bi ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
                
                <!-- Información del usuario (móvil) -->
                <div class="sidebar-footer d-md-none p-3 text-white-50">
                    <small>
                        ${esc(user.nombre_usuario)}<br>
                        ${esc(user.rol.nombre_rol)}
                    </small>
                </div>
            </aside>
        `;
    };
    
    /**
     * Inicializar eventos del sidebar
     */
    const initEvents = () => {
        // Marcar link activo al hacer clic
        const links = document.querySelectorAll('.sidebar-menu a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remover clase active de todos
                links.forEach(l => l.classList.remove('active'));
                
                // Agregar clase active al clickeado
                e.currentTarget.classList.add('active');
                
                // Cerrar sidebar en móvil
                if (window.innerWidth < 768) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) {
                        sidebar.classList.remove('show');
                    }
                }
            });
        });
        
        // Cerrar sidebar al hacer clic fuera (móvil)
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                const sidebar = document.querySelector('.sidebar');
                const toggleBtn = document.getElementById('toggle-sidebar');
                
                if (sidebar && 
                    sidebar.classList.contains('show') && 
                    !sidebar.contains(e.target) && 
                    e.target !== toggleBtn &&
                    !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    };
    
    // Exponer métodos públicos
    return {
        render,
        initEvents
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Sidebar = Sidebar;