// ============================================
// AUTH - GESTIÓN DE AUTENTICACIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Auth = (() => {
    /**
     * Iniciar sesión
     */
    const login = async (email, password) => {
        try {
            const response = await API.post('/auth/login', { email, password });
            
            if (response.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.usuario));
                
                return response;
            }
            
            throw new Error(response.message);
        } catch (error) {
            throw error;
        }
    };
    
    /**
     * Cerrar sesión
     */
    const logout = async () => {
        try {
            // Intentar cerrar sesión en el servidor
            await API.post('/auth/logout').catch(() => {
                // Ignorar errores, eliminar datos locales de todos modos
            });
            
            // Limpiar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Redirigir al login
            window.location.href = '#/login';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Limpiar de todos modos
            localStorage.clear();
            window.location.href = '#/login';
        }
    };
    
    /**
     * Verificar si el usuario está autenticado
     */
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    };
    
    /**
     * Obtener usuario actual
     */
    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error al parsear usuario:', error);
            return null;
        }
    };
    
    /**
     * Verificar token con el servidor
     */
    const verifyToken = async () => {
        try {
            const response = await API.get('/auth/verify');
            
            if (response.success) {
                // Actualizar datos del usuario
                localStorage.setItem('user', JSON.stringify(response.data.usuario));
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al verificar token:', error);
            return false;
        }
    };
    
    /**
     * Renovar token
     */
    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                throw new Error('No hay refresh token');
            }
            
            const response = await API.post('/auth/refresh', { refreshToken });
            
            if (response.success) {
                localStorage.setItem('token', response.data.token);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al renovar token:', error);
            return false;
        }
    };
    
    /**
     * Cambiar contraseña
     */
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await API.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            return response;
        } catch (error) {
            throw error;
        }
    };
    
    /**
     * Verificar si el usuario tiene un rol específico
     */
    const hasRole = (roleName) => {
        const user = getCurrentUser();
        if (!user || !user.rol) return false;
        return user.rol.nombre_rol === roleName;
    };
    
    /**
     * Verificar si el usuario tiene un permiso específico
     */
    const hasPermission = (permissionName) => {
        const user = getCurrentUser();
        if (!user || !user.permisos) return false;
        return user.permisos.includes(permissionName);
    };
    
    /**
     * Verificar si el usuario es administrador
     */
    const isAdmin = () => {
        return hasRole('Administrador');
    };
    
    /**
     * Verificar si el usuario es docente
     */
    const isDocente = () => {
        return hasRole('Docente');
    };
    
    /**
     * Verificar si el usuario es alumno
     */
    const isAlumno = () => {
        return hasRole('Alumno');
    };

    /**
     * Verificar si el usuario es invitado
     */
    const isInvitado = () => {
        const user = getCurrentUser();
        return user && user.rol && user.rol.nombre_rol === 'Invitado';
    };
    
    // Exponer métodos públicos
    return {
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        verifyToken,
        refreshToken,
        changePassword,
        hasRole,
        hasPermission,
        isAdmin,
        isDocente,
        isInvitado,
        isAlumno
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.Auth = Auth;