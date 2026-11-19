const Validators = (() => {
    
    // ============================================
    // EXPRESIONES REGULARES
    // ============================================
    
    const REGEX = {
        // Solo letras (español con acentos y ñ)
        soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
        
        // Solo números
        soloNumeros: /^[0-9]+$/,
        
        // CURP (18 caracteres)
        curp: /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/,
        
        // Email
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        
        // Teléfono (10 dígitos)
        telefono: /^[0-9]{10}$/,
        
        // Matrícula (letras y números)
        matricula: /^[A-Z0-9]+$/,
        
        // Nombres con apóstrofes y guiones
        nombreCompleto: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'\-\s]+$/,
        
        // Números decimales (promedio)
        decimal: /^[0-9]+(\.[0-9]{1,2})?$/,
        
        // Solo letras y números (sin espacios)
        alfanumerico: /^[a-zA-Z0-9]+$/
    };
    
    // ============================================
    // MENSAJES DE ERROR
    // ============================================
    
    const MENSAJES = {
        requerido: 'Este campo es requerido',
        soloLetras: 'Solo se permiten letras',
        soloNumeros: 'Solo se permiten números',
        curpInvalido: 'CURP inválido. Formato: XXXX000000HXXXXX00',
        emailInvalido: 'Correo electrónico inválido',
        telefonoInvalido: 'Teléfono debe tener 10 dígitos',
        longitudMinima: (min) => `Mínimo ${min} caracteres`,
        longitudMaxima: (max) => `Máximo ${max} caracteres`,
        rangoInvalido: (min, max) => `Debe estar entre ${min} y ${max}`,
        decimalInvalido: 'Número decimal inválido',
        fechaInvalida: 'Fecha inválida',
        menorEdad: 'Debe ser mayor de edad',
        nombreInvalido: 'Nombre inválido'
    };
    
    // ============================================
    // FUNCIONES DE VALIDACIÓN
    // ============================================
    
    /**
     * Validar que campo no esté vacío
     */
    const esRequerido = (valor) => {
        return valor !== null && valor !== undefined && valor.toString().trim() !== '';
    };
    
    /**
     * Validar solo letras
     */
    const validarSoloLetras = (valor) => {
        if (!valor) return true; // Si está vacío, que lo maneje esRequerido
        return REGEX.soloLetras.test(valor);
    };
    
    /**
     * Validar solo números
     */
    const validarSoloNumeros = (valor) => {
        if (!valor) return true;
        return REGEX.soloNumeros.test(valor);
    };
    
    /**
     * Validar CURP
     */
    const validarCURP = (curp) => {
        if (!curp) return true;
        return REGEX.curp.test(curp.toUpperCase());
    };
    
    /**
     * Validar email
     */
    const validarEmail = (email) => {
        if (!email) return true;
        return REGEX.email.test(email);
    };
    
    /**
     * Validar teléfono
     */
    const validarTelefono = (telefono) => {
        if (!telefono) return true;
        return REGEX.telefono.test(telefono.replace(/\s/g, ''));
    };
    
    /**
     * Validar longitud mínima
     */
    const validarLongitudMinima = (valor, min) => {
        if (!valor) return true;
        return valor.toString().length >= min;
    };
    
    /**
     * Validar longitud máxima
     */
    const validarLongitudMaxima = (valor, max) => {
        if (!valor) return true;
        return valor.toString().length <= max;
    };
    
    /**
     * Validar rango numérico
     */
    const validarRango = (valor, min, max) => {
        if (!valor) return true;
        const num = parseFloat(valor);
        return num >= min && num <= max;
    };
    
    /**
     * Validar número decimal
     */
    const validarDecimal = (valor) => {
        if (!valor) return true;
        return REGEX.decimal.test(valor);
    };
    
    /**
     * Validar fecha
     */
    const validarFecha = (fecha) => {
        if (!fecha) return true;
        const date = new Date(fecha);
        return date instanceof Date && !isNaN(date);
    };
    
    /**
     * Validar edad mínima
     */
    const validarEdadMinima = (fechaNacimiento, edadMinima = 18) => {
        if (!fechaNacimiento) return true;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        const edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            return edad - 1 >= edadMinima;
        }
        return edad >= edadMinima;
    };
    
    /**
     * Validar nombre completo
     */
    const validarNombreCompleto = (nombre) => {
        if (!nombre) return true;
        return REGEX.nombreCompleto.test(nombre) && nombre.trim().split(/\s+/).length >= 2;
    };
    
    /**
     * Validar matrícula
     */
    const validarMatricula = (matricula) => {
        if (!matricula) return true;
        return REGEX.matricula.test(matricula.toUpperCase());
    };
    
    // ============================================
    // APLICAR VALIDACIONES A UN CAMPO
    // ============================================
    
    /**
     * Validar un campo con múltiples reglas
     * @param {*} valor - Valor del campo
     * @param {Array} reglas - Array de reglas de validación
     * @returns {Object} { valido: boolean, mensaje: string }
     */
    const validarCampo = (valor, reglas) => {
        for (let regla of reglas) {
            const { tipo, params } = regla;
            
            let esValido = true;
            let mensaje = '';
            
            switch(tipo) {
                case 'requerido':
                    esValido = esRequerido(valor);
                    mensaje = MENSAJES.requerido;
                    break;
                    
                case 'soloLetras':
                    esValido = validarSoloLetras(valor);
                    mensaje = MENSAJES.soloLetras;
                    break;
                    
                case 'soloNumeros':
                    esValido = validarSoloNumeros(valor);
                    mensaje = MENSAJES.soloNumeros;
                    break;
                    
                case 'curp':
                    esValido = validarCURP(valor);
                    mensaje = MENSAJES.curpInvalido;
                    break;
                    
                case 'email':
                    esValido = validarEmail(valor);
                    mensaje = MENSAJES.emailInvalido;
                    break;
                    
                case 'telefono':
                    esValido = validarTelefono(valor);
                    mensaje = MENSAJES.telefonoInvalido;
                    break;
                    
                case 'minLength':
                    esValido = validarLongitudMinima(valor, params.min);
                    mensaje = MENSAJES.longitudMinima(params.min);
                    break;
                    
                case 'maxLength':
                    esValido = validarLongitudMaxima(valor, params.max);
                    mensaje = MENSAJES.longitudMaxima(params.max);
                    break;
                    
                case 'rango':
                    esValido = validarRango(valor, params.min, params.max);
                    mensaje = MENSAJES.rangoInvalido(params.min, params.max);
                    break;
                    
                case 'decimal':
                    esValido = validarDecimal(valor);
                    mensaje = MENSAJES.decimalInvalido;
                    break;
                    
                case 'fecha':
                    esValido = validarFecha(valor);
                    mensaje = MENSAJES.fechaInvalida;
                    break;
                    
                case 'edadMinima':
                    esValido = validarEdadMinima(valor, params.edad);
                    mensaje = MENSAJES.menorEdad;
                    break;
                    
                case 'nombreCompleto':
                    esValido = validarNombreCompleto(valor);
                    mensaje = MENSAJES.nombreInvalido;
                    break;
                    
                case 'matricula':
                    esValido = validarMatricula(valor);
                    mensaje = 'Matrícula inválida';
                    break;
            }
            
            if (!esValido) {
                return { valido: false, mensaje };
            }
        }
        
        return { valido: true, mensaje: '' };
    };
    
    // ============================================
    // APLICAR VALIDACIONES EN TIEMPO REAL
    // ============================================
    
    /**
     * Agregar validación en tiempo real a un input
     * @param {HTMLElement} input - Elemento input
     * @param {Array} reglas - Reglas de validación
     */
    const aplicarValidacionTiempoReal = (input, reglas) => {
        if (!input) return;
        
        // Crear elemento para mostrar errores
        let errorDiv = input.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        }
        
        // Función de validación
        const validar = () => {
            const valor = input.value;
            const resultado = validarCampo(valor, reglas);
            
            if (!resultado.valido) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                errorDiv.textContent = resultado.mensaje;
            } else if (valor !== '') {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                errorDiv.textContent = '';
            } else {
                input.classList.remove('is-invalid', 'is-valid');
                errorDiv.textContent = '';
            }
            
            return resultado.valido;
        };
        
        // Event listeners
        input.addEventListener('blur', validar);
        input.addEventListener('input', () => {
            // Solo validar si ya mostró error antes
            if (input.classList.contains('is-invalid')) {
                validar();
            }
        });
        
        // Devolver función de validación para uso posterior
        input.validar = validar;
    };
    
    // ============================================
    // RESTRICCIÓN DE ENTRADA (input restriction)
    // ============================================
    
    /**
     * Restringir entrada en tiempo real
     * @param {HTMLElement} input - Elemento input
     * @param {string} tipo - Tipo de restricción
     */
    const restringirEntrada = (input, tipo) => {
        if (!input) return;
        
        input.addEventListener('keypress', (e) => {
            let permitir = true;
            const char = String.fromCharCode(e.which || e.keyCode);
            
            switch(tipo) {
                case 'soloNumeros':
                    permitir = /[0-9]/.test(char);
                    break;
                    
                case 'soloLetras':
                    permitir = /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(char);
                    break;
                    
                case 'decimal':
                    permitir = /[0-9.]/.test(char);
                    // Solo permitir un punto
                    if (char === '.' && input.value.includes('.')) {
                        permitir = false;
                    }
                    break;
                    
                case 'telefono':
                    permitir = /[0-9]/.test(char);
                    // Limitar a 10 dígitos
                    if (input.value.length >= 10) {
                        permitir = false;
                    }
                    break;
                    
                case 'curp':
                    permitir = /[A-Z0-9]/.test(char.toUpperCase());
                    // Limitar a 18 caracteres
                    if (input.value.length >= 18) {
                        permitir = false;
                    }
                    break;
            }
            
            if (!permitir) {
                e.preventDefault();
            }
        });
        
        // Auto-mayúsculas para CURP y matrícula
        if (tipo === 'curp' || tipo === 'matricula') {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    };
    
    // ============================================
    // VALIDAR FORMULARIO COMPLETO
    // ============================================
    
    /**
     * Validar todos los campos de un formulario
     * @param {HTMLFormElement} formulario - Formulario a validar
     * @returns {boolean} - true si todo es válido
     */
    const validarFormulario = (formulario) => {
        if (!formulario) return false;
        
        let todosValidos = true;
        const inputs = formulario.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.validar && typeof input.validar === 'function') {
                const esValido = input.validar();
                if (!esValido) {
                    todosValidos = false;
                }
            }
        });
        
        // Scroll al primer error
        if (!todosValidos) {
            const primerError = formulario.querySelector('.is-invalid');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerError.focus();
            }
        }
        
        return todosValidos;
    };
    
    // ============================================
    // CONFIGURACIÓN RÁPIDA
    // ============================================
    
    /**
     * Configurar validaciones para campos comunes
     * @param {string} selector - Selector CSS o ID del campo
     * @param {string} tipoValidacion - Tipo de validación predefinido
     */
    const configurarCampo = (selector, tipoValidacion) => {
        const input = document.querySelector(selector);
        if (!input) return;
        
        const configuraciones = {
            'nombre': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'soloLetras' },
                    { tipo: 'minLength', params: { min: 2 } },
                    { tipo: 'maxLength', params: { max: 100 } }
                ],
                restriccion: 'soloLetras'
            },
            'nombreCompleto': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'nombreCompleto' },
                    { tipo: 'minLength', params: { min: 5 } }
                ],
                restriccion: 'soloLetras'
            },
            'curp': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'curp' }
                ],
                restriccion: 'curp'
            },
            'email': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'email' }
                ]
            },
            'telefono': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'telefono' }
                ],
                restriccion: 'telefono'
            },
            'edad': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'soloNumeros' },
                    { tipo: 'rango', params: { min: 0, max: 120 } }
                ],
                restriccion: 'soloNumeros'
            },
            'promedio': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'decimal' },
                    { tipo: 'rango', params: { min: 0, max: 10 } }
                ],
                restriccion: 'decimal'
            },
            'semestre': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'soloNumeros' },
                    { tipo: 'rango', params: { min: 1, max: 12 } }
                ],
                restriccion: 'soloNumeros'
            },
            'matricula': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'matricula' }
                ],
                restriccion: 'matricula'
            },
            'fechaNacimiento': {
                reglas: [
                    { tipo: 'requerido' },
                    { tipo: 'fecha' },
                    { tipo: 'edadMinima', params: { edad: 18 } }
                ]
            }
        };
        
        const config = configuraciones[tipoValidacion];
        if (config) {
            aplicarValidacionTiempoReal(input, config.reglas);
            if (config.restriccion) {
                restringirEntrada(input, config.restriccion);
            }
        }
    };
    
    // ============================================
    // EXPORTAR FUNCIONES
    // ============================================
    
    return {
        // Validaciones individuales
        validarCampo,
        validarFormulario,
        
        // Configuración
        aplicarValidacionTiempoReal,
        restringirEntrada,
        configurarCampo,
        
        // Validadores específicos
        esRequerido,
        validarSoloLetras,
        validarSoloNumeros,
        validarCURP,
        validarEmail,
        validarTelefono,
        validarNombreCompleto,
        validarDecimal,
        validarFecha,
        validarEdadMinima,
        
        // Constantes
        REGEX,
        MENSAJES
    };
})();