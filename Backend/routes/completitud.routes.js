// ============================================
// RUTAS DE COMPLETITUD DE EXPEDIENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const completitudController = require('../controllers/completitud.controller');
const { authenticate, authorize, verificarAccesoAlumno } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE COMPLETITUD
// ============================================

// Obtener reporte completo de completitud (con filtros)
// Solo Administrador y Docente (el controlador filtra al docente por sus licenciaturas)
router.get(
    '/reporte',
    authorize('Administrador', 'Docente'),
    completitudController.getReporte
);

// Obtener estadísticas de completitud
router.get(
    '/estadisticas',
    authorize('Administrador', 'Docente'),
    completitudController.getEstadisticas
);

// Recalcular todas las completitudes (solo administrador)
router.post(
    '/recalcular-todas',
    authorize('Administrador'),
    completitudController.recalcularTodas
    );

// Obtener completitud de un alumno específico
router.get(
    '/alumno/:id_alumno',
    verificarAccesoAlumno('id_alumno'),
    completitudController.getByAlumno
);

// Calcular/Recalcular completitud de un alumno específico
router.post(
    '/calcular/:id_alumno',
    authorize('Administrador', 'Docente'),
    verificarAccesoAlumno('id_alumno'),
    completitudController.calcular
);

// Obtener secciones faltantes de un alumno (para portal del alumno)
router.get(
    '/alumno/:id_alumno/faltantes',
    verificarAccesoAlumno('id_alumno'),
    completitudController.getSeccionesFaltantes
);

// ============================================
// EXPORTAR ROUTER
// ============================================
module.exports = router;