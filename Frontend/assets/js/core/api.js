// ============================================
// API - COMUNICACIÓN CON EL BACKEND
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const API = (() => {
    // URL base de la API
    // Detectar automáticamente la URL base según el hostname
    const BASE_URL = (() => {
        const hostname = window.location.hostname;
        
        // Si estamos en localhost, usar localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }

        // Si estamos en una IP de red local (192.168.x.x), usar esa IP con puerto
        if (hostname.match(/^192\.168\.\d+\.\d+$/)) {
            return `http://${hostname}:3000/api`;
        }
        
        // Cloudflare maneja el proxy automáticamente, no necesitamos puerto
        return '/api';
        
    })();
    
    /**
     * Obtener el token de autenticación del localStorage
     */
    const getToken = () => {
        return localStorage.getItem('token');
    };
    
    /**
     * Obtener headers por defecto para las peticiones
     */
    const getHeaders = () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    };
    
    /**
     * Manejo de errores de la API
     */
    const handleError = async (response) => {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                success: false,
                message: 'Error en la comunicación con el servidor'
            }));
            
            // Si el token expiró, redirigir al login
            if (response.status === 401 && error.code === 'TOKEN_EXPIRED') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '#/login';
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
            }
            
            throw new Error(error.message || 'Error en la petición');
        }
        
        return response.json();
    };
    
    /**
     * Realizar petición GET
     */
    const get = async (endpoint) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: getHeaders()
            });
            
            return await handleError(response);
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    };
    
    /**
     * Realizar petición POST
     */
    const post = async (endpoint, data) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await handleError(response);
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    };
    
    /**
     * Realizar petición PUT
     */
    const put = async (endpoint, data) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await handleError(response);
        } catch (error) {
            console.error('Error en PUT:', error);
            throw error;
        }
    };

    /**
     * Realizar petición PATCH
     */
    const patch = async (endpoint, data) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await handleError(response);
        } catch (error) {
            console.error('Error en PATCH:', error);
            throw error;
        }
    };
    
    /**
     * Realizar petición DELETE
     */
    const del = async (endpoint) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            return await handleError(response);
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    };
    
    /**
     * Subir archivo (multipart/form-data)
     */
    const uploadFile = async (endpoint, formData) => {
        try {
            const headers = {};
            const token = getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            // NO incluir Content-Type, el navegador lo configura automáticamente con boundary
            
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            return await handleError(response);
        } catch (error) {
            console.error('Error al subir archivo:', error);
            throw error;
        }
    };
    
    // Exponer métodos públicos
    return {
        get,
        post,
        put,
        patch,
        delete: del,
        uploadFile,
        BASE_URL
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.API = API;