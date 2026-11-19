// ============================================
// RUTAS DE REPORTES MEJORADAS
// Sistema de Gestión de Expedientes Estudiantiles
// Con soporte para reportes personalizados
// ============================================

const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const { authenticate, authorize, checkPermission, checkInvitadoLicenciatura, verificarAccesoAlumno } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE REPORTES PERSONALIZADOS
// ============================================

/**
 * @route   GET /api/reportes/personalizado/preview
 * @desc    Vista previa de reporte personalizado (máximo 100 registros)
 * @access  Privado (Administrador, Docente)
 * @query   ?campos=matricula,nombre_completo,edad&licenciatura=1&generacion=2024
 */
router.get(
    '/personalizado/preview',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarVistaPrevia
);

/**
 * @route   GET /api/reportes/personalizado/excel
 * @desc    Generar reporte personalizado en Excel
 * @access  Privado (Administrador, Docente)
 * @query   ?campos=matricula,nombre_completo,edad&licenciatura=1&generacion=2024
 */
router.get(
    '/personalizado/excel',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarPersonalizadoExcel
);

/**
 * @route   GET /api/reportes/personalizado/pdf
 * @desc    Generar reporte personalizado en PDF
 * @access  Privado (Administrador, Docente)
 * @query   ?campos=matricula,nombre_completo,edad&licenciatura=1&generacion=2024
 */
router.get(
    '/personalizado/pdf',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarPersonalizadoPDF
);

// ============================================
// RUTAS DE REPORTES RÁPIDOS
// ============================================

/**
 * @route   GET /api/reportes/lista-completa/excel
 * @desc    Lista completa de alumnos en Excel
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/lista-completa/excel',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarListaCompletaExcel
);

/**
 * @route   GET /api/reportes/lista-completa/pdf
 * @desc    Lista completa de alumnos en PDF
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/lista-completa/pdf',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarListaCompletaPDF
);

/**
 * @route   GET /api/reportes/alumnos-riesgo/excel
 * @desc    Reporte de alumnos en riesgo en Excel
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/alumnos-riesgo/excel',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarAlumnosRiesgoExcel
);

/**
 * @route   GET /api/reportes/alumnos-riesgo/pdf
 * @desc    Reporte de alumnos en riesgo en PDF
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/alumnos-riesgo/pdf',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarAlumnosRiesgoPDF
);

/**
 * @route   GET /api/reportes/expedientes-incompletos/excel
 * @desc    Reporte de expedientes incompletos en Excel
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/expedientes-incompletos/excel',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarExpedientesIncompletosExcel
);

/**
 * @route   GET /api/reportes/expedientes-incompletos/pdf
 * @desc    Reporte de expedientes incompletos en PDF
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/expedientes-incompletos/pdf',
    authorize('Administrador', 'Docente'),
    checkPermission('VER_EXPEDIENTE'),
    reporteController.generarExpedientesIncompletosPDF
);

/**
 * @route   GET /api/reportes/estadisticas/pdf
 * @desc    Generar reporte de estadísticas en PDF
 * @access  Privado (Administrador, Docente)
 * @query   ?licenciatura=1
 */
router.get(
    '/estadisticas/pdf',
    authorize('Administrador', 'Docente'),
    reporteController.generarEstadisticasPDF
);

// ============================================
// RUTAS DE EXPEDIENTE INDIVIDUAL (Mantener)
// ============================================

/**
 * @route   GET /api/reportes/expediente/:id/pdf
 * @desc    Generar reporte completo de expediente en PDF
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/expediente/:id/pdf',
    authorize('Administrador', 'Docente', 'Invitado'),
    checkInvitadoLicenciatura,
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    reporteController.generarExpedientePDF
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;