// ============================================
// RUTAS DE ALUMNOS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumno.controller');
const { authenticate, authorize, checkPermission, checkInvitadoLicenciatura, verificarAccesoAlumno } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE CONSULTA
// ============================================

/**
 * @route   GET /api/alumnos
 * @desc    Obtener todos los alumnos con filtros opcionales
 * @access  Privado (Administrador, Docente)
 * @query   ?licenciatura=1&generacion=2024&status=Activo&semestre=1&search=texto&limit=50&offset=0
 */
router.get(
    '/',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    alumnoController.getAll
);

/**
 * @route   GET /api/alumnos/licenciaturas
 * @desc    Obtener lista de licenciaturas activas
 * @access  Privado
 */
router.get(
    '/licenciaturas',
    alumnoController.getLicenciaturas
);

/**
 * @route   GET /api/alumnos/generaciones
 * @desc    Obtener lista de generaciones disponibles
 * @access  Privado
 */
router.get(
    '/generaciones',
    alumnoController.getGeneraciones
);

/**
 * @route   GET /api/alumnos/estadisticas
 * @desc    Obtener estadísticas de alumnos
 * @access  Privado (Administrador, Docente)
 * @query   ?licenciatura=1
 */
router.get(
    '/estadisticas',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,
    alumnoController.getEstadisticas
);

/**
 * @route   GET /api/alumnos/:id
 * @desc    Obtener un alumno por ID
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/:id',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    alumnoController.getById
);

/**
 * @route   GET /api/alumnos/:id/expediente
 * @desc    Obtener expediente completo del alumno
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/:id/expediente',
    authorize('Administrador', 'Docente', 'Invitado'), 
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    alumnoController.getExpediente
);

// ============================================
// RUTAS DE MODIFICACIÓN
// ============================================

/**
 * @route   POST /api/alumnos
 * @desc    Crear nuevo alumno
 * @access  Privado (Administrador, Docente)
 * @body    { nombre_completo, curp, fecha_nacimiento, correo_personal, id_licenciatura, generacion }
 */
router.post(
    '/',
    authorize('Administrador', 'Docente'),
    checkPermission('CREAR_EXPEDIENTE'),
    alumnoController.create
);

/**
 * @route   PUT /api/alumnos/:id
 * @desc    Actualizar datos del alumno
 * @access  Privado (Administrador, Docente)
 * @body    { nombre_completo, curp, fecha_nacimiento, correo_personal, celular, etc. }
 */
router.put(
    '/:id',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    alumnoController.update
);

/**
 * @route   PATCH /api/alumnos/:id/status
 * @desc    Cambiar status del alumno
 * @access  Privado (Administrador)
 * @body    { status: 'Activo' | 'Egresado' | 'Baja temporal' | 'Baja definitiva' }
 */
router.patch(
    '/:id/status',
    authorize('Administrador'),
    verificarAccesoAlumno('id'),
    alumnoController.cambiarStatus
);


// ============================================
// RUTAS DE GESTIÓN MASIVA DE GENERACIONES
// ============================================

/**
 * @route   POST /api/alumnos/promover-semestre
 * @desc    Promover múltiples alumnos al siguiente semestre
 * @access  Privado (Administrador)
 * @body    { ids_alumnos: [1, 2, 3...] }
 */
router.post(
    '/promover-semestre',
    authorize('Administrador'),
    checkPermission('EDITAR_EXPEDIENTE'),
    alumnoController.promoverSemestre
);

/**
 * @route   POST /api/alumnos/cambiar-status-masivo
 * @desc    Cambiar status de múltiples alumnos
 * @access  Privado (Administrador)
 * @body    { ids_alumnos: [1, 2, 3...], nuevo_status: 'Egresado' }
 */
router.post(
    '/cambiar-status-masivo',
    authorize('Administrador'),
    checkPermission('EDITAR_EXPEDIENTE'),
    alumnoController.cambiarStatusMasivo
);

/**
 * @route   POST /api/alumnos/graduar-generacion
 * @desc    Graduar una generación completa
 * @access  Privado (Administrador)
 * @body    { generacion: 2024, id_licenciatura: 1 }
 */
router.post(
    '/graduar-generacion',
    authorize('Administrador'),
    checkPermission('EDITAR_EXPEDIENTE'),
    alumnoController.graduarGeneracion
);



// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

