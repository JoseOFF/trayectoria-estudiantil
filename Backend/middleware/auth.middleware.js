// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { verifyToken } = require('../config/auth');
const { pool } = require('../config/database');
const Usuario = require('../models/usuario.model');
const invitadoModel = require('../models/invitado.model');

// ============================================
// VERIFICAR TOKEN JWT
// ============================================
/**
 * Middleware que verifica que el usuario esté autenticado
 * Extrae el token del header Authorization y lo verifica
 */
const authenticate = async (req, res, next) => {
    try {
        // Extraer token del header
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido',
                code: 'NO_TOKEN'
            });
        }
        
        // El formato esperado es: "Bearer TOKEN"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use: Bearer TOKEN',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }
        
        const token = parts[1];
        
        // Verificar token
        const decoded = verifyToken(token);
        
        // Verificar que el usuario todavía existe y está activo
        const usuario = await Usuario.findById(decoded.id_usuario);
        
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado',
                code: 'USER_NOT_FOUND'
            });
        }
        
        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario desactivado',
                code: 'USER_INACTIVE'
            });
        }
        
        // Datos ACTUALES de la base de datos (no los del token): si un administrador
        // cambia el rol de alguien, el cambio aplica en su siguiente petición
        req.user = {
            id_usuario: usuario.id_usuario,
            id_rol: usuario.id_rol,
            nombre_rol: usuario.nombre_rol,
            rol: usuario.nombre_rol,
            correo: usuario.correo,
            nombre_usuario: usuario.nombre_usuario
        };
        
        // Continuar con el siguiente middleware/controlador
        next();
        
    } catch (error) {
        console.error('- Error en authenticate:', error.message);
        
        if (error.message === 'Token expirado') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.message === 'Token inválido') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

// ============================================
// VERIFICAR ROL DEL USUARIO
// ============================================
/**
 * Middleware que verifica que el usuario tenga uno de los roles permitidos
 * @param {Array} rolesPermitidos - Array de nombres de roles permitidos
 */
const authorize = (...rolesPermitidos) => {
    return (req, res, next) => {
        try {
            // Verificar que req.user exista (debe pasar por authenticate primero)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            
            // Verificar si el rol del usuario está en los roles permitidos
            if (!rolesPermitidos.includes(req.user.nombre_rol)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso',
                    code: 'FORBIDDEN'
                });
            }
            
            // Usuario tiene el rol necesario
            next();
            
        } catch (error) {
            console.error('- Error en authorize:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
};

// ============================================
// VERIFICAR PERMISO ESPECÍFICO
// ============================================
/**
 * Middleware que verifica que el usuario tenga un permiso específico
 * @param {String} permisoRequerido - Nombre del permiso requerido
 */
const checkPermission = (permisoRequerido) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            
            // Verificar si el usuario tiene el permiso
            const tienePermiso = await Usuario.hasPermission(
                req.user.id_usuario, 
                permisoRequerido
            );
            
            if (!tienePermiso) {
                return res.status(403).json({
                    success: false,
                    message: `Requiere permiso: ${permisoRequerido}`,
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('- Error en checkPermission:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos'
            });
        }
    };
};

// ============================================
// MIDDLEWARE OPCIONAL DE AUTENTICACIÓN
// ============================================
/**
 * Similar a authenticate pero no falla si no hay token
 * Útil para rutas que pueden funcionar con o sin autenticación
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            // No hay token, continuar sin usuario
            req.user = null;
            return next();
        }
        
        const parts = authHeader.split(' ');
        
        if (parts.length === 2 && parts[0] === 'Bearer') {
            const token = parts[1];
            
            try {
                const decoded = verifyToken(token);
                req.user = decoded;
            } catch (error) {
                // Token inválido, continuar sin usuario
                req.user = null;
            }
        }
        
        next();
        
    } catch (error) {
        console.error('- Error en optionalAuth:', error.message);
        req.user = null;
        next();
    }
};


/**
 * Middleware para verificar permisos de licenciatura de invitados
 * Agrega los permisos del invitado a req.permisosInvitado
 */
const checkInvitadoLicenciatura = async (req, res, next) => {
    try {
        // Solo aplicar a usuarios con rol Invitado
        if (req.user.rol !== 'Invitado') {
            return next();
        }

        // Obtener permisos del invitado
        const permisos = await invitadoModel.getPermisosInvitado(req.user.id_usuario);

        if (!permisos) {
            return res.status(403).json({
                success: false,
                message: 'Usuario invitado sin permisos asignados'
            });
        }

        // Verificar que tenga al menos una licenciatura asignada
        if (!permisos.licenciaturas_permitidas || permisos.licenciaturas_permitidas.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Usuario invitado sin licenciaturas asignadas'
            });
        }

        // Agregar permisos al request para usarlos en el controlador
        req.permisosInvitado = permisos;
        next();
    } catch (error) {
        console.error('Error en checkInvitadoLicenciatura:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar permisos de invitado',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Middleware para verificar si el usuario invitado tiene acceso a una sección específica (FASE 2)
 * @param {string} seccion - Nombre de la sección a verificar
 */
const checkInvitadoSeccion = (seccion) => {
    return async (req, res, next) => {
        try {
            // Solo aplicar a usuarios con rol Invitado
            if (req.user.rol !== 'Invitado') {
                return next();
            }

            // Obtener permisos si no están ya en el request
            if (!req.permisosInvitado) {
                const permisos = await invitadoModel.getPermisosInvitado(req.user.id_usuario);
                if (!permisos) {
                    return res.status(403).json({
                        success: false,
                        message: 'Usuario invitado sin permisos asignados'
                    });
                }
                req.permisosInvitado = permisos;
            }

            // Si secciones_permitidas es null, significa que tiene acceso a todo (configuración inicial)
            if (req.permisosInvitado.secciones_permitidas === null) {
                return next();
            }

            // Verificar si la sección está permitida
            if (!req.permisosInvitado.secciones_permitidas.includes(seccion)) {
                return res.status(403).json({
                    success: false,
                    message: `No tiene permiso para acceder a la sección: ${seccion}`
                });
            }

            next();
        } catch (error) {
            console.error('Error en checkInvitadoSeccion:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar permisos de sección',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};


// ============================================
// VERIFICAR ACCESO A UN ALUMNO ESPECÍFICO
// ============================================
/**
 * Comprueba que el usuario pueda acceder al alumno indicado en la URL.
 * Evita que alguien cambie el número de la URL para ver datos de otro alumno.
 *   - Administrador: cualquier alumno
 *   - Alumno: solo su propio registro
 *   - Docente: solo alumnos de sus licenciaturas asignadas
 *   - Invitado: solo alumnos de sus licenciaturas permitidas
 * Debe ir DESPUÉS de authenticate y ANTES de multer o del controlador.
 * @param {string} nombreParam - Nombre del parámetro de la URL con el id del alumno
 */
const ES_ENTERO = /^\d+$/;

const responderSinAcceso = (res) => res.status(403).json({
    success: false,
    message: 'No tienes acceso a la información de este alumno',
    code: 'FORBIDDEN'
});

/**
 * Regla común: ¿el usuario de la petición puede acceder a este alumno?
 * (El Administrador se resuelve antes de llamar a esta función)
 */
const puedeAccederAlumno = async (req, idAlumno) => {
    const rol = req.user.nombre_rol;
    const [filas] = await pool.execute(
        'SELECT id_usuario, id_licenciatura FROM alumnos WHERE id_alumno = ?',
        [idAlumno]
    );
    const alumno = filas[0];
    if (!alumno) return false;

    if (rol === 'Alumno') {
        return Number(alumno.id_usuario) === Number(req.user.id_usuario);
    }
    if (rol === 'Docente') {
        const [asignada] = await pool.execute(
            `SELECT 1
             FROM docentes d
             INNER JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
             WHERE d.id_usuario = ? AND dl.id_licenciatura = ?
             LIMIT 1`,
            [req.user.id_usuario, alumno.id_licenciatura]
        );
        return asignada.length > 0;
    }
    if (rol === 'Invitado') {
        const permisos = req.permisosInvitado
            || await invitadoModel.getPermisosInvitado(req.user.id_usuario);
        const licenciaturas = (permisos && permisos.licenciaturas_permitidas) || [];
        return licenciaturas.map(Number).includes(Number(alumno.id_licenciatura));
    }
    return false;
};

/**
 * Para rutas donde el parámetro de la URL ES el id del alumno
 * Ej.: /api/documentos/alumno/:id  ->  verificarAccesoAlumno('id')
 */
const verificarAccesoAlumno = (nombreParam = 'id') => {
    return async (req, res, next) => {
        try {
            // Solo se aceptan números enteros: bloquea rutas como "1/../../Frontend"
            const valor = String(req.params[nombreParam] ?? '');
            if (!ES_ENTERO.test(valor)) {
                return res.status(400).json({
                    success: false,
                    message: 'Identificador de alumno inválido'
                });
            }

            if (req.user.nombre_rol === 'Administrador') {
                return next();
            }

            // Misma respuesta si el alumno no existe o no es accesible:
            // así no se puede averiguar qué números de alumno existen
            if (!(await puedeAccederAlumno(req, parseInt(valor, 10)))) {
                return responderSinAcceso(res);
            }

            next();
        } catch (error) {
            console.error('Error en verificarAccesoAlumno:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar acceso al alumno'
            });
        }
    };
};

/**
 * Para rutas donde el parámetro es el id de OTRO registro que pertenece a un
 * alumno (una práctica, por ejemplo): busca primero a qué alumno pertenece.
 * Ej.: /api/practicas/:id  ->  verificarAccesoAlumnoDeRegistro('practicas_profesionales', 'id_practica')
 * @param {string} tabla - Tabla del registro (valor fijo del código, nunca del usuario)
 * @param {string} columnaId - Columna de la llave primaria (valor fijo del código)
 * @param {string} nombreParam - Nombre del parámetro de la URL
 */
const verificarAccesoAlumnoDeRegistro = (tabla, columnaId, nombreParam = 'id') => {
    return async (req, res, next) => {
        try {
            const valor = String(req.params[nombreParam] ?? '');
            if (!ES_ENTERO.test(valor)) {
                return res.status(400).json({
                    success: false,
                    message: 'Identificador inválido'
                });
            }

            if (req.user.nombre_rol === 'Administrador') {
                return next();
            }

            const [filas] = await pool.execute(
                `SELECT id_alumno FROM ${tabla} WHERE ${columnaId} = ?`,
                [parseInt(valor, 10)]
            );
            if (filas.length === 0 || !(await puedeAccederAlumno(req, filas[0].id_alumno))) {
                return responderSinAcceso(res);
            }

            next();
        } catch (error) {
            console.error('Error en verificarAccesoAlumnoDeRegistro:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar acceso al alumno'
            });
        }
    };
};

/**
 * Helper para filtrar datos del expediente según permisos de sección
 */
const filtrarDatosSegunPermisos = (expediente, permisos) => {
    // Si no hay control de secciones (NULL), devolver todo
    if (!permisos.secciones_permitidas) {
        return expediente;
    }

    const seccionesPermitidas = permisos.secciones_permitidas;
    
    // ============================================
    // CREAR EXPEDIENTE FILTRADO CON ESTRUCTURA ORIGINAL
    // ============================================
    const expedienteFiltrado = {};

    // ============================================
    // DATOS PERSONALES - SIEMPRE incluir información básica
    // El header del expediente necesita estos datos siempre
    // ============================================
    if (expediente.datos_personales) {
        // Siempre incluir datos básicos para el header
        expedienteFiltrado.datos_personales = {
            id_alumno: expediente.datos_personales.id_alumno,
            matricula: expediente.datos_personales.matricula,
            nombre_completo: expediente.datos_personales.nombre_completo,
            id_licenciatura: expediente.datos_personales.id_licenciatura,
            nombre_licenciatura: expediente.datos_personales.nombre_licenciatura,
            generacion: expediente.datos_personales.generacion,
            semestre_actual: expediente.datos_personales.semestre_actual,
            status_alumno: expediente.datos_personales.status_alumno,
            estado_expediente: expediente.datos_personales.estado_expediente,
            porcentaje_completitud: expediente.datos_personales.porcentaje_completitud,
            correo_institucional: expediente.datos_personales.correo_institucional,
            numero_semestres: expediente.datos_personales.numero_semestres
        };

        // Si tiene permiso de datos_personales, agregar los campos adicionales
        if (seccionesPermitidas.includes('datos_personales')) {
            expedienteFiltrado.datos_personales = {
                ...expedienteFiltrado.datos_personales,
                curp: expediente.datos_personales.curp,
                fecha_nacimiento: expediente.datos_personales.fecha_nacimiento,
                edad: expediente.datos_personales.edad,
                estado_civil: expediente.datos_personales.estado_civil,
                celular: expediente.datos_personales.celular,
                telefono_emergencia: expediente.datos_personales.telefono_emergencia,
                correo_personal: expediente.datos_personales.correo_personal,
                municipio_nacimiento: expediente.datos_personales.municipio_nacimiento,
                estado_nacimiento: expediente.datos_personales.estado_nacimiento,
                representativo_indigena: expediente.datos_personales.representativo_indigena,
                habla_lengua_indigena: expediente.datos_personales.habla_lengua_indigena,
                lengua_indigena: expediente.datos_personales.lengua_indigena,
                tiene_hijos: expediente.datos_personales.tiene_hijos,
                numero_hijos: expediente.datos_personales.numero_hijos,
                edad_hijos: expediente.datos_personales.edad_hijos,
                embarazada: expediente.datos_personales.embarazada,
                meses_embarazo: expediente.datos_personales.meses_embarazo,
                situacion_personal: expediente.datos_personales.situacion_personal,
                // Domicilio
                id_domicilio: expediente.datos_personales.id_domicilio,
                domicilio_calle: expediente.datos_personales.domicilio_calle,
                domicilio_numero: expediente.datos_personales.domicilio_numero,
                domicilio_colonia: expediente.datos_personales.domicilio_colonia,
                domicilio_municipio: expediente.datos_personales.domicilio_municipio,
                domicilio_estado: expediente.datos_personales.domicilio_estado,
                domicilio_referencia: expediente.datos_personales.domicilio_referencia,
                domicilio_completo: expediente.datos_personales.domicilio_completo
            };
        }
    }

    // ============================================
    // DATOS ACADÉMICOS (rendimiento y promedios)
    // ============================================
    if (seccionesPermitidas.includes('datos_academicos')) {
        expedienteFiltrado.rendimiento_academico = expediente.rendimiento_academico || null;
        expedienteFiltrado.promedios_semestre = expediente.promedios_semestre || [];
    } else {
        // Siempre incluir estructura vacía para evitar errores
        expedienteFiltrado.rendimiento_academico = null;
        expedienteFiltrado.promedios_semestre = [];
    }

    // ============================================
    // DATOS DE SALUD
    // ============================================
    if (seccionesPermitidas.includes('datos_salud')) {
        expedienteFiltrado.datos_salud = expediente.datos_salud || null;
    } else {
        expedienteFiltrado.datos_salud = null;
    }

    // ============================================
    // DATOS SOCIOECONÓMICOS
    // ============================================
    if (seccionesPermitidas.includes('datos_socioeconomicos')) {
        expedienteFiltrado.datos_socioeconomicos = expediente.datos_socioeconomicos || null;
    } else {
        expedienteFiltrado.datos_socioeconomicos = null;
    }

    // ============================================
    // DATOS FAMILIARES
    // ============================================
    if (seccionesPermitidas.includes('datos_familiares')) {
        expedienteFiltrado.familiares = expediente.familiares || [];
    } else {
        expedienteFiltrado.familiares = [];
    }

    // ============================================
    // INCIDENTES
    // ============================================
    if (seccionesPermitidas.includes('incidentes')) {
        expedienteFiltrado.incidentes = expediente.incidentes || [];
    } else {
        expedienteFiltrado.incidentes = [];
    }

    // ============================================
    // DESEMPEÑO ACADÉMICO
    // ============================================
    if (seccionesPermitidas.includes('desempeno_academico') || seccionesPermitidas.includes('datos_academicos')) {
        expedienteFiltrado.desempeno_academico = expediente.desempeno_academico || null;
    } else {
        expedienteFiltrado.desempeno_academico = null;
    }

    // ============================================
    // HABILIDADES
    // ============================================
    if (seccionesPermitidas.includes('habilidades')) {
        expedienteFiltrado.habilidades = expediente.habilidades || [];
    } else {
        expedienteFiltrado.habilidades = [];
    }

    // ============================================
    // CERTIFICACIONES
    // ============================================
    if (seccionesPermitidas.includes('certificaciones')) {
        expedienteFiltrado.certificaciones = expediente.certificaciones || [];
    } else {
        expedienteFiltrado.certificaciones = [];
    }

    // ============================================
    // PRÁCTICAS PROFESIONALES
    // ============================================
    if (seccionesPermitidas.includes('practicas_profesionales')) {
        expedienteFiltrado.practicas_profesionales = expediente.practicas_profesionales || [];
    } else {
        expedienteFiltrado.practicas_profesionales = [];
    }

    // ============================================
    // DOCUMENTOS
    // ============================================
    if (seccionesPermitidas.includes('documentos')) {
        expedienteFiltrado.documentos = expediente.documentos || [];
    } else {
        expedienteFiltrado.documentos = [];
    }

    // ============================================
    // BECAS
    // ============================================
    if (seccionesPermitidas.includes('becas') || seccionesPermitidas.includes('datos_socioeconomicos')) {
        expedienteFiltrado.becas = expediente.becas || [];
    } else {
        expedienteFiltrado.becas = [];
    }

    // ============================================
    // MOVILIDAD
    // ============================================
    if (seccionesPermitidas.includes('movilidad') || seccionesPermitidas.includes('datos_academicos')) {
        expedienteFiltrado.movilidad = expediente.movilidad || [];
    } else {
        expedienteFiltrado.movilidad = [];
    }

    // ============================================
    // AGREGAR INDICADOR DE SECCIONES PERMITIDAS
    // (Útil para el frontend para saber qué tabs mostrar)
    // ============================================
    expedienteFiltrado._secciones_permitidas = seccionesPermitidas;
    expedienteFiltrado._es_invitado = true;

    return expedienteFiltrado;
};

module.exports = { filtrarDatosSegunPermisos };




// ============================================
// EXPORTAR MIDDLEWARES
// ============================================

module.exports = {
    authenticate,
    authorize,
    checkPermission,
    optionalAuth,
    checkInvitadoLicenciatura,
    checkInvitadoSeccion,
    verificarAccesoAlumno,
    verificarAccesoAlumnoDeRegistro,
    filtrarDatosSegunPermisos
};