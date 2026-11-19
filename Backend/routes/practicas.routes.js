// ============================================
// RUTAS DE PRÁCTICAS PROFESIONALES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const practicasController = require('../controllers/practicas.controller');
const { authenticate, authorize, checkPermission, checkInvitadoLicenciatura, verificarAccesoAlumno, verificarAccesoAlumnoDeRegistro } = require('../middleware/auth.middleware');

// En /alumno/:id el parámetro es el id del ALUMNO; en /:id es el id de la PRÁCTICA
const accesoPorPractica = verificarAccesoAlumnoDeRegistro('practicas_profesionales', 'id_practica', 'id');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE CONSULTA
// ============================================

/**
 * @route   GET /api/practicas/alumno/:id
 * @desc    Obtener TODAS las prácticas de un alumno (historial completo)
 * @access  Privado (Administrador, Docente, Alumno)
 */
router.get(
    '/alumno/:id',
    authorize('Administrador', 'Docente', 'Alumno', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    practicasController.obtenerPracticasAlumno
);

/**
 * @route   GET /api/practicas/:id
 * @desc    Obtener una práctica específica por ID
 * @access  Privado (Administrador, Docente, Alumno)
 */
router.get(
    '/:id',
    authorize('Administrador', 'Docente', 'Alumno', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    accesoPorPractica,
    practicasController.obtenerPracticaPorId
);

// ============================================
// RUTAS DE MODIFICACIÓN
// ============================================

/**
 * @route   POST /api/practicas/alumno/:id
 * @desc    Registrar nueva práctica para un alumno
 * @access  Privado (Administrador, Docente, Alumno)
 */
router.post(
    '/alumno/:id',
    authorize('Administrador', 'Docente', 'Alumno'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    practicasController.registrarPractica
);

/**
 * @route   PUT /api/practicas/:id
 * @desc    Actualizar una práctica existente
 * @access  Privado (Administrador, Docente, Alumno)
 */
router.put(
    '/:id',
    authorize('Administrador', 'Docente', 'Alumno'),
    checkPermission('EDITAR_EXPEDIENTE'),
    accesoPorPractica,
    practicasController.actualizarPractica
);

/**
 * @route   DELETE /api/practicas/:id
 * @desc    Eliminar una práctica
 * @access  Privado (Administrador, Docente)
 */
router.delete(
    '/:id',
    authorize('Administrador', 'Docente', 'Alumno'),
    checkPermission('ELIMINAR_EXPEDIENTE'),
    accesoPorPractica,
    practicasController.eliminarPractica
);

// ============================================
// EXPORTAR ROUTER
// ============================================
module.exports = router;