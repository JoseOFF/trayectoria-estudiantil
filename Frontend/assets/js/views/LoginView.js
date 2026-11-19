// ============================================
// VISTA DE LOGIN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const LoginView = (() => {
    /**
     * Renderizar la vista
     */
    const render = () => {
        const app = document.getElementById('app');
        // Nombre de la escuela desde el .env del Backend (si no hay, no se muestra)
        const { nombre: nombreInstitucion } = Config.getInstitucion();

        app.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <!-- Lado izquierdo - Información -->
                    <div class="login-left">
                        <h1><i class="bi bi-mortarboard-fill"></i> Trayectoria Estudiantil</h1>
                        ${nombreInstitucion ? `<p>${Utils.escapeHtml(nombreInstitucion)}</p>` : ''}
                        <p>Gestión integral de expedientes estudiantiles. Accede a tu cuenta para administrar información académica, personal y documentación de alumnos.</p>
                    </div>
                    
                    <!-- Lado derecho - Formulario -->
                    <div class="login-right">
                        <form id="login-form" class="login-form">
                            <h2>Iniciar Sesión</h2>
                            <p>Ingresa tus credenciales para continuar</p>
                            
                            <div class="form-floating">
                                <input 
                                    type="email" 
                                    class="form-control" 
                                    id="email" 
                                    placeholder="correo@ejemplo.com"
                                    required
                                >
                                <label for="email">
                                    <i class="bi bi-envelope me-2"></i>Correo Electrónico
                                </label>
                            </div>
                            
                            <div class="form-floating">
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    id="password" 
                                    placeholder="Contraseña"
                                    required
                                >
                                <label for="password">
                                    <i class="bi bi-lock me-2"></i>Contraseña
                                </label>
                            </div>
                            
                            <div class="form-check mb-3">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    id="remember"
                                >
                                <label class="form-check-label" for="remember">
                                    Recordar mi sesión
                                </label>
                            </div>
                            
                            <button 
                                type="submit" 
                                class="btn btn-login"
                                id="btn-login"
                            >
                                <i class="bi bi-box-arrow-in-right me-2"></i>
                                Iniciar Sesión
                            </button>
                            
                            <div class="text-center mt-3">
                                <small class="text-muted">
                                    ¿Olvidaste tu contraseña? Contacta al administrador
                                </small>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar eventos
        initEvents();
    };
    
    /**
     * Inicializar eventos
     */
    const initEvents = () => {
        const form = document.getElementById('login-form');
        
        form.addEventListener('submit', handleLogin);
        
        // Auto-focus en el campo de email
        document.getElementById('email').focus();
    };
    
    /**
     * Manejar inicio de sesión
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const btnLogin = document.getElementById('btn-login');
        
        // Validaciones básicas
        if (!email || !password) {
            Alert.warning('Por favor completa todos los campos');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.warning('Por favor ingresa un correo válido');
            return;
        }
        
        try {
            // Deshabilitar botón y mostrar loading
            btnLogin.disabled = true;
            btnLogin.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2"></span>
                Iniciando sesión...
            `;
            
            // Llamar a la API
            const response = await Auth.login(email, password);
            
            if (response.success) {
                Alert.success('¡Bienvenido! Redirigiendo...');
                
                // Redirigir al dashboard después de un breve delay
                setTimeout(() => {
                    Router.navigate('/dashboard');
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            Alert.error(error.message || 'Error al iniciar sesión. Verifica tus credenciales');
            
            // Restaurar botón
            btnLogin.disabled = false;
            btnLogin.innerHTML = `
                <i class="bi bi-box-arrow-in-right me-2"></i>
                Iniciar Sesión
            `;
            
            // Limpiar contraseña por seguridad
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    };
    
    // Exponer métodos públicos
    return {
        render
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.LoginView = LoginView;