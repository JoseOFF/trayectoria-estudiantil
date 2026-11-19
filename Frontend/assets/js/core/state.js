// ============================================
// STATE - MANEJO DE ESTADO GLOBAL
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const State = (() => {
    // Estado global de la aplicación
    let state = {
        user: null,
        licenciaturas: [],
        loading: false,
        currentView: null
    };
    
    // Suscriptores (listeners) para cambios de estado
    const subscribers = [];
    
    /**
     * Obtener estado completo
     */
    const getState = () => {
        return { ...state };
    };
    
    /**
     * Actualizar estado
     */
    const setState = (updates) => {
        state = {
            ...state,
            ...updates
        };
        
        // Notificar a todos los suscriptores
        notifySubscribers();
    };
    
    /**
     * Suscribirse a cambios de estado
     */
    const subscribe = (callback) => {
        subscribers.push(callback);
        
        // Retornar función para desuscribirse
        return () => {
            const index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        };
    };
    
    /**
     * Notificar a todos los suscriptores
     */
    const notifySubscribers = () => {
        subscribers.forEach(callback => {
            callback(state);
        });
    };
    
    /**
     * Establecer usuario actual
     */
    const setUser = (user) => {
        setState({ user });
    };
    
    /**
     * Obtener usuario actual
     */
    const getUser = () => {
        return state.user;
    };
    
    /**
     * Establecer licenciaturas
     */
    const setLicenciaturas = (licenciaturas) => {
        setState({ licenciaturas });
    };
    
    /**
     * Obtener licenciaturas
     */
    const getLicenciaturas = () => {
        return state.licenciaturas;
    };
    
    /**
     * Mostrar/ocultar loading
     */
    const setLoading = (loading) => {
        setState({ loading });
        
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            if (loading) {
                loadingEl.classList.remove('d-none');
            } else {
                loadingEl.classList.add('d-none');
            }
        }
    };
    
    /**
     * Establecer vista actual
     */
    const setCurrentView = (view) => {
        setState({ currentView: view });
    };
    
    /**
     * Limpiar estado (al cerrar sesión)
     */
    const clearState = () => {
        state = {
            user: null,
            licenciaturas: [],
            loading: false,
            currentView: null
        };
        notifySubscribers();
    };
    
    // Exponer métodos públicos
    return {
        getState,
        setState,
        subscribe,
        setUser,
        getUser,
        setLicenciaturas,
        getLicenciaturas,
        setLoading,
        setCurrentView,
        clearState
    };
})();

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
window.State = State;