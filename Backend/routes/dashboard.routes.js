// ============================================
// RUTAS DE DASHBOARD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE ESTADÍSTICAS
// ============================================

/**
 * @route   GET /api/dashboard/estadisticas
 * @desc    Obtener estadísticas generales del dashboard según el rol
 * @access  Privado (Todos los roles)
 */
router.get(
    '/estadisticas',
    dashboardController.getEstadisticasGenerales
);

/**
 * @route   GET /api/dashboard/actividad
 * @desc    Obtener actividad reciente del sistema
 * @access  Privado (Administrador, Docente)
 * @query   ?limite=10
 */
router.get(
    '/actividad',
    authorize('Administrador', 'Docente'),
    dashboardController.getActividadReciente
);

/**
 * @route   GET /api/dashboard/graficos
 * @desc    Obtener datos para gráficos del dashboard
 * @access  Privado (Administrador, Docente)
 * @query   ?tipo=alumnos_por_semestre
 */
router.get(
    '/graficos',
    authorize('Administrador', 'Docente'),
    dashboardController.getGraficos
);

/**
 * @route   GET /api/dashboard/alertas
 * @desc    Obtener alertas y notificaciones
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/alertas',
    authorize('Administrador', 'Docente'),
    dashboardController.getAlertas
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;