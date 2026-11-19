// ============================================
// MÓDULO DE SELECTORES ESTADO-MUNICIPIO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

class EstadoMunicipioSelector {
    /**
     * Constructor del selector dinámico estado-municipio
     * @param {string} estadoSelectId - ID del select de estado
     * @param {string} municipioSelectId - ID del select de municipio
     * @param {object} estadosMunicipios - Objeto con los datos de estados y municipios
     */
    constructor(estadoSelectId, municipioSelectId, estadosMunicipios) {
        this.estadoSelect = document.getElementById(estadoSelectId);
        this.municipioSelect = document.getElementById(municipioSelectId);
        this.estados = estadosMunicipios;
        
        if (!this.estadoSelect || !this.municipioSelect) {
            console.error('No se encontraron los selects de estado o municipio');
            return;
        }
        
        this.inicializar();
    }
    
    /**
     * Inicializar el selector
     */
    inicializar() {
        // Poblar select de estados
        this.poblarEstados();
        
        // Event listener para cambio de estado
        this.estadoSelect.addEventListener('change', (e) => {
            this.poblarMunicipios(e.target.value);
        });
    }
    
    /**
     * Poblar el select de estados
     */
    poblarEstados() {
        // Limpiar opciones existentes (excepto la primera opción vacía)
        this.estadoSelect.innerHTML = '<option value="">Seleccionar estado...</option>';
        
        // Agregar todos los estados
        Object.keys(this.estados).sort().forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            this.estadoSelect.appendChild(option);
        });
    }
    
    /**
     * Poblar el select de municipios según el estado seleccionado
     * @param {string} estado - Estado seleccionado
     */
    poblarMunicipios(estado) {
        // Limpiar select de municipios
        this.municipioSelect.innerHTML = '<option value="">Seleccionar municipio...</option>';
        
        // Si no hay estado seleccionado, deshabilitar municipios
        if (!estado) {
            this.municipioSelect.disabled = true;
            return;
        }
        
        // Habilitar select de municipios
        this.municipioSelect.disabled = false;
        
        // Obtener municipios del estado
        const municipios = this.estados[estado] || [];
        
        // Agregar municipios al select
        municipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio;
            option.textContent = municipio;
            this.municipioSelect.appendChild(option);
        });
    }
    
    /**
     * Establecer valores seleccionados (para edición)
     * @param {string} estado - Estado a seleccionar
     * @param {string} municipio - Municipio a seleccionar
     */
    setValues(estado, municipio) {
        if (estado) {
            // Seleccionar estado
            this.estadoSelect.value = estado;
            
            // Poblar y seleccionar municipio
            if (municipio) {
                this.poblarMunicipios(estado);
                // Pequeño delay para asegurar que el select se ha poblado
                setTimeout(() => {
                    this.municipioSelect.value = municipio;
                }, 50);
            }
        }
    }
    
    /**
     * Obtener valores seleccionados
     * @returns {object} Objeto con estado y municipio
     */
    getValues() {
        return {
            estado: this.estadoSelect.value,
            municipio: this.municipioSelect.value
        };
    }
    
    /**
     * Resetear selectores
     */
    reset() {
        this.estadoSelect.value = '';
        this.municipioSelect.value = '';
        this.municipioSelect.disabled = true;
        this.municipioSelect.innerHTML = '<option value="">Seleccionar municipio...</option>';
    }
    
    /**
     * Validar que ambos campos estén seleccionados
     * @returns {boolean} True si ambos están seleccionados
     */
    validate() {
        const estado = this.estadoSelect.value;
        const municipio = this.municipioSelect.value;
        
        if (!estado) {
            this.estadoSelect.classList.add('is-invalid');
            return false;
        } else {
            this.estadoSelect.classList.remove('is-invalid');
        }
        
        if (!municipio) {
            this.municipioSelect.classList.add('is-invalid');
            return false;
        } else {
            this.municipioSelect.classList.remove('is-invalid');
        }
        
        return true;
    }
    
    /**
     * Limpiar mensajes de validación
     */
    clearValidation() {
        this.estadoSelect.classList.remove('is-invalid');
        this.municipioSelect.classList.remove('is-invalid');
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstadoMunicipioSelector;
}