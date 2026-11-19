// ============================================
// RUTAS DE SEGURIDAD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const seguridadController = require('../controllers/seguridad.controller');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE ROLES Y PERMISOS
// ============================================

/**
 * @route   GET /api/seguridad/roles
 * @desc    Obtener todos los roles
 * @access  Privado (Administrador)
 */
router.get(
    '/roles',
    authorize('Administrador'),
    checkPermission('GESTIONAR_ROLES'),
    seguridadController.getAllRoles
);

/**
 * @route   GET /api/seguridad/roles/:id
 * @desc    Obtener un rol por ID con sus permisos
 * @access  Privado (Administrador)
 */
router.get(
    '/roles/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_ROLES'),
    seguridadController.getRolById
);

/**
 * @route   GET /api/seguridad/permisos
 * @desc    Obtener todos los permisos disponibles
 * @access  Privado (Administrador)
 */
router.get(
    '/permisos',
    authorize('Administrador'),
    checkPermission('GESTIONAR_ROLES'),
    seguridadController.getAllPermisos
);

/**
 * @route   POST /api/seguridad/permisos/asignar
 * @desc    Asignar permiso a un rol
 * @access  Privado (Administrador)
 * @body    { id_rol, id_permiso }
 */
router.post(
    '/permisos/asignar',
    authorize('Administrador'),
    checkPermission('GESTIONAR_ROLES'),
    seguridadController.asignarPermiso
);

/**
 * @route   POST /api/seguridad/permisos/remover
 * @desc    Remover permiso de un rol
 * @access  Privado (Administrador)
 * @body    { id_rol, id_permiso }
 */
router.post(
    '/permisos/remover',
    authorize('Administrador'),
    checkPermission('GESTIONAR_ROLES'),
    seguridadController.removerPermiso
);

// ============================================
// RUTAS DE AUDITORÍA
// ============================================

/**
 * @route   GET /api/seguridad/auditoria/historial
 * @desc    Obtener historial de cambios con filtros
 * @access  Privado (Administrador)
 * @query   ?id_usuario=1&tabla=alumnos&tipo_operacion=UPDATE&fecha_desde=2024-01-01&fecha_hasta=2024-12-31&limit=50&offset=0
 */
router.get(
    '/auditoria/historial',
    authorize('Administrador'),
    checkPermission('VER_HISTORIAL'),
    seguridadController.getHistorialCambios
);

/**
 * @route   GET /api/seguridad/auditoria/estadisticas
 * @desc    Obtener estadísticas de auditoría
 * @access  Privado (Administrador)
 */
router.get(
    '/auditoria/estadisticas',
    authorize('Administrador'),
    checkPermission('VER_HISTORIAL'),
    seguridadController.getEstadisticasAuditoria
);

/**
 * @route   GET /api/seguridad/auditoria/tablas
 * @desc    Obtener lista de tablas disponibles para filtrar
 * @access  Privado (Administrador)
 */
router.get(
    '/auditoria/tablas',
    authorize('Administrador'),
    checkPermission('VER_HISTORIAL'),
    seguridadController.getTablasDisponibles
);

// ============================================
// RUTAS DE CONFIGURACIÓN
// ============================================

/**
 * @route   GET /api/seguridad/configuracion
 * @desc    Obtener configuración de seguridad del sistema
 * @access  Privado (Administrador)
 */
router.get(
    '/configuracion',
    authorize('Administrador'),
    seguridadController.getConfiguracion
);

/**
 * @route   POST /api/seguridad/backup/ejecutar
 * @desc    Ejecutar backup manual del sistema
 * @access  Privado (Administrador únicamente)
 */
router.post(
    '/backup/ejecutar',
    authorize('Administrador'),
    seguridadController.ejecutarBackupManual
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;