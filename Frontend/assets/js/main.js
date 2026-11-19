// ============================================
// MAIN - INICIALIZACIÓN DE LA APLICACIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

(async () => {
    console.log('Inicializando aplicación...');
    
    /**
     * Verificar autenticación al cargar la app
     */
    const checkAuth = async () => {
        if (Auth.isAuthenticated()) {
            try {
                // Verificar que el token sea válido
                const isValid = await Auth.verifyToken();
                
                if (!isValid) {
                    console.log('Token inválido, limpiando sesión');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    return false;
                }
                
                // Actualizar estado con el usuario
                const user = Auth.getCurrentUser();
                State.setUser(user);
                
                console.log('Usuario autenticado:', user.nombre_usuario);
                return true;
                
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                return false;
            }
        }
        
        return false;
    };
    
    /**
     * Inicializar la aplicación
     */
    const init = async () => {
        try {
            // Datos de la institución (login y pie de página) antes de dibujar
            await Config.cargar();
            const { nombre } = Config.getInstitucion();
            if (nombre) console.log(`%c${nombre}`, 'color: #764ba2; font-size: 14px;');

            // Verificar autenticación
            const isAuthenticated = await checkAuth();
            
            // Inicializar router
            Router.init();
            
            // Si está autenticado y está en la raíz, redirigir al dashboard
            if (isAuthenticated && window.location.hash === '') {
                Router.navigate('/dashboard');
            }
            
            // Si no está autenticado y no está en login, redirigir
            if (!isAuthenticated && !window.location.hash.includes('login')) {
                Router.navigate('/login');
            }
            
            console.log('Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar aplicación:', error);
            Alert.error('Error al iniciar la aplicación');
        }
    };
    
    /**
     * Manejar errores globales
     */
    window.addEventListener('error', (event) => {
        console.error('Error global:', event.error);
    });
    
    /**
     * Manejar promesas rechazadas
     */
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promesa rechazada:', event.reason);
    });
    
    /**
     * Mensaje de bienvenida en consola
     */
    console.log('%cTrayectoria Estudiantil', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cVersión 1.0.0', 'color: #666; font-size: 12px;');
    console.log('%c ADVERTENCIA: No pegues código de fuentes desconocidas aquí', 'color: red; font-size: 16px; font-weight: bold;');
    
    // Inicializar aplicación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();