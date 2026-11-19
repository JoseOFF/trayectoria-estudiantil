// ============================================
// RUTAS DE EXPEDIENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expediente.controller');
const { authenticate, authorize, checkPermission, checkInvitadoLicenciatura, verificarAccesoAlumno } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE EDICIÓN DE EXPEDIENTE
// ============================================

/**
 * @route   PUT /api/expedientes/:id/datos-personales
 * @desc    Actualizar datos personales de contacto del alumno
 * @access  Privado (Administrador, Docente)
 * @body    { celular, telefono_emergencia, correo_personal, estado_civil }
 */
router.put(
    '/:id/datos-personales',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.actualizarDatosPersonales
);

/**
 * @route   POST /api/expedientes/:id/calificaciones
 * @desc    Registrar calificación de semestre
 * @access   (Administrador, Docente, Alumno)
 * @body    { numero_semestre, promedio }
 */
router.post(
    '/:id/calificaciones',
    authorize('Administrador', 'Docente', 'Alumno'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.registrarCalificacion
);


/**
 * @route   DELETE /api/expedientes/:id/calificaciones/:numero_semestre
 * @desc    Eliminar calificación de un semestre específico
 * @access  Privado (Administrador, Docente)
 */
router.delete(
    '/:id/calificaciones/:numero_semestre',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.eliminarCalificacion
);

/**
 * @route   POST /api/expedientes/:id/incidentes
 * @desc    Registrar nuevo incidente
 * @access  Privado (Administrador, Docente)
 * @body    { tipo_incidente, fecha_incidente, descripcion }
 */
router.post(
    '/:id/incidentes',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.registrarIncidente
);

/**
 * @route   PATCH /api/expedientes/:id/incidentes/:id_incidente
 * @desc    Actualizar estado de un incidente
 * @access  Privado (Administrador, Docente)
 * @body    { estado: 'Abierto' | 'En seguimiento' | 'Resuelto' | 'Cerrado' }
 */
router.patch(
    '/:id/incidentes/:id_incidente',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.actualizarEstadoIncidente
);

/**
 * @route   PUT /api/expedientes/:id/incidentes/:id_incidente
 * @desc    Actualizar incidente (estado y docente asignado)
 * @access  Privado (Administrador, Docente)
 * @body    { estado_incidente?: string, id_docente?: number }
 */
router.put(
    '/:id/incidentes/:id_incidente',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.actualizarIncidente
);


/**
 * @route   DELETE /api/expedientes/:id/incidentes/:id_incidente
 * @desc    Eliminar incidente
 * @access  Privado (Administrador, Docente)
 */
router.delete(
    '/:id/incidentes/:id_incidente',
    authorize('Administrador', 'Docente'),
    checkPermission('ELIMINAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.eliminarIncidente
);

/**
 * @route   GET /api/expedientes/docentes
 * @desc    Obtener lista de docentes activos
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/docentes',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    expedienteController.getDocentes
);




// ============================================
// RUTAS DE BECAS (EXPEDIENTE)
// ============================================

/**
 * @route   GET /api/expedientes/:id/becas
 * @desc    Obtener becas del alumno
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/:id/becas',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,  
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.getBecas
);

/**
 * @route   POST /api/expedientes/:id/becas
 * @desc    Agregar beca al alumno
 * @access  Privado (Administrador, Docente)
 * @body    { nombre_beca, fecha_inicio, fecha_fin, activa }
 */
router.post(
    '/:id/becas',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.agregarBeca
);

/**
 * @route   PUT /api/expedientes/:id/becas/:id_beca
 * @desc    Actualizar beca
 * @access  Privado (Administrador, Docente)
 * @body    { nombre_beca, fecha_inicio, fecha_fin, activa }
 */
router.put(
    '/:id/becas/:id_beca',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.actualizarBeca
);

/**
 * @route   DELETE /api/expedientes/:id/becas/:id_beca
 * @desc    Eliminar beca
 * @access  Privado (Administrador, Docente)
 */
router.delete(
    '/:id/becas/:id_beca',
    authorize('Administrador', 'Docente'),
    checkPermission('ELIMINAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.eliminarBeca
);

// ============================================
// RUTAS DE MOVILIDAD ACADÉMICA (EXPEDIENTE)
// ============================================

/**
 * @route   GET /api/expedientes/:id/movilidad
 * @desc    Obtener movilidades del alumno
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/:id/movilidad',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.getMovilidades
);

/**
 * @route   POST /api/expedientes/:id/movilidad
 * @desc    Agregar movilidad al alumno
 * @access  Privado (Administrador, Docente)
 * @body    { nombre_programa, lugar, fecha_inicio, fecha_fin, relato_experiencia }
 */
router.post(
    '/:id/movilidad',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.agregarMovilidad
);

/**
 * @route   PUT /api/expedientes/:id/movilidad/:id_movilidad
 * @desc    Actualizar movilidad
 * @access  Privado (Administrador, Docente)
 * @body    { nombre_programa, lugar, fecha_inicio, fecha_fin, relato_experiencia }
 */
router.put(
    '/:id/movilidad/:id_movilidad',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.actualizarMovilidad
);

/**
 * @route   DELETE /api/expedientes/:id/movilidad/:id_movilidad
 * @desc    Eliminar movilidad
 * @access  Privado (Administrador, Docente)
 */
router.delete(
    '/:id/movilidad/:id_movilidad',
    authorize('Administrador', 'Docente'),
    checkPermission('ELIMINAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.eliminarMovilidad
);

// ============================================
// RUTAS DE PRÁCTICAS PROFESIONALES (EXPEDIENTE)
// ============================================

/**
 * @route   GET /api/expedientes/:id/practicas
 * @desc    Obtener prácticas profesionales del alumno
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/:id/practicas',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.getPracticas
);

/**
 * @route   POST /api/expedientes/:id/practicas
 * @desc    Guardar/actualizar prácticas profesionales
 * @access  Privado (Administrador, Docente)
 * @body    { habilidades_practicas, sigue_orientacion_reglamento, tiene_incidentes, relato_incidentes }
 */
router.post(
    '/:id/practicas',
    authorize('Administrador', 'Docente'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    expedienteController.guardarPracticas
);


// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;