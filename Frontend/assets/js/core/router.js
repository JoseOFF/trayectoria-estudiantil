// ============================================
// ROUTER - SISTEMA DE RUTAS SPA
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Router = (() => {
    // Definición de rutas
    const routes = {
        '/': 'LoginView',
        '/login': 'LoginView',
        '/dashboard': 'DashboardView',
        '/usuarios': 'UsuariosView',
        '/invitados': 'InvitadosView',
        '/alumnos': 'AlumnoView',
        '/alumno/:id': 'AlumnoDetailView',
        '/expediente/:id': 'ExpedienteView',
        '/documentos/:id': 'DocumentosView',
        '/reportes': 'ReportesView',
        '/docentes': 'DocentesView',
        '/seguridad': 'SeguridadView',
        '/portal-alumno': 'PortalAlumnoView',
        '/perfil': 'PerfilView',
        '/carga-masiva': 'CargaMasivaView',
        '/completitud': 'CompletitudView'
    };
    
    // Rutas que requieren autenticación
    const protectedRoutes = [
        '/dashboard',
        '/usuarios',
        '/invitados',
        '/alumnos',
        '/alumno/:id',
        '/expediente/:id',
        '/documentos/:id',
        '/reportes',
        '/docentes',
        '/seguridad',
        '/portal-alumno',
        '/perfil',
        '/carga-masiva',
        '/completitud'
    ];
    
    /**
     * Obtener la ruta actual del hash
     */
    const getCurrentRoute = () => {
        return window.location.hash.slice(1) || '/';
    };
    
    /**
     * Verificar si una ruta requiere autenticación
     */
    const isProtectedRoute = (route) => {
        // Verificar ruta exacta
        if (protectedRoutes.includes(route)) {
            return true;
        }
        
        // Verificar rutas con parámetros
        return protectedRoutes.some(protectedRoute => {
            const regex = new RegExp('^' + protectedRoute.replace(/:\w+/g, '\\w+') + '$');
            return regex.test(route);
        });
    };
    
    /**
     * Extraer parámetros de la URL
     */
    const extractParams = (route, pattern) => {
        const params = {};
        const routeParts = route.split('/');
        const patternParts = pattern.split('/');
        
        patternParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.slice(1);
                params[paramName] = routeParts[index];
            }
        });
        
        return params;
    };
    
    /**
     * Encontrar la vista correspondiente a una ruta
     */
    const findView = (route) => {
        // Buscar coincidencia exacta
        if (routes[route]) {
            return { view: routes[route], params: {} };
        }
        
        // Buscar coincidencia con parámetros
        for (const [pattern, view] of Object.entries(routes)) {
            if (pattern.includes(':')) {
                const regex = new RegExp('^' + pattern.replace(/:\w+/g, '(\\w+)') + '$');
                if (regex.test(route)) {
                    const params = extractParams(route, pattern);
                    return { view, params };
                }
            }
        }
        
        return null;
    };
    
    /**
     * Cargar y renderizar una vista
     */
    const loadView = async (route) => {
        State.setLoading(true);
        
        try {
            // Verificar autenticación para rutas protegidas
            if (isProtectedRoute(route) && !Auth.isAuthenticated()) {
                console.log('- Ruta protegida, redirigiendo al login');
                navigate('/login');
                return;
            }
            
            // Si está autenticado y trata de ir al login, redirigir al dashboard
            if (route === '/login' && Auth.isAuthenticated()) {
                console.log('Usuario autenticado, redirigiendo al dashboard');
                navigate('/dashboard');
                return;
            }
            
            // Encontrar la vista
            const viewData = findView(route);
            
            if (!viewData) {
                console.error('- Vista no encontrada para la ruta:', route);
                document.getElementById('app').innerHTML = `
                    <div class="container mt-5">
                        <div class="alert alert-danger">
                            <h4>Error 404</h4>
                            <p>Página no encontrada</p>
                            <a href="#/dashboard" class="btn btn-primary">Ir al Dashboard</a>
                        </div>
                    </div>
                `;
                State.setLoading(false);
                return;
            }
            
            // Verificar que la vista exista
            if (!window[viewData.view]) {
                console.error('- Vista no implementada:', viewData.view);
                State.setLoading(false);
                return;
            }
            
            // Renderizar la vista
            console.log('Cargando vista:', viewData.view);
            await window[viewData.view].render(viewData.params);
            
            State.setCurrentView(viewData.view);
            
        } catch (error) {
            console.error('- Error al cargar vista:', error);
            Alert.show('Error al cargar la página', 'danger');
        } finally {
            State.setLoading(false);
        }
    };
    
    /**
     * Navegar a una ruta
     */
    const navigate = (route) => {
        window.location.hash = route;
    };
    
    /**
     * Volver atrás
     */
    const goBack = () => {
        window.history.back();
    };
    
    /**
     * Inicializar el router
     */
    const init = () => {
        // Manejar cambios en el hash
        window.addEventListener('hashchange', () => {
            const route = getCurrentRoute();
            loadView(route);
        });
        
        // Cargar ruta inicial
        const initialRoute = getCurrentRoute();
        loadView(initialRoute);
        
        console.log('Router inicializado');
    };
    
    /**
     * Registrar una nueva ruta
     */
    const registerRoute = (path, viewName) => {
        routes[path] = viewName;
    };
    
    // Exponer métodos públicos
    return {
        init,
        navigate,
        goBack,
        getCurrentRoute,
        registerRoute
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Router = Router;