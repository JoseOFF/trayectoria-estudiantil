const express = require('express');
const router = express.Router();
const invitadoController = require('../controllers/invitado.controller');
const { verifyToken, authorize, authenticate } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y rol de Administrador
router.use(authenticate);
router.use(authorize('Administrador'));

/**
 * GET /api/invitados
 * Obtener lista de todos los usuarios invitados
 */
router.get('/', invitadoController.getAll);

/**
 * GET /api/invitados/:id/permisos
 * Obtener permisos de un invitado específico
 */
router.get('/:id/permisos', invitadoController.getPermisos);

/**
 * PUT /api/invitados/:id/licenciaturas
 * Actualizar licenciaturas permitidas
 * Body: { licenciaturas: [1, 2, 3] }
 */
router.put('/:id/licenciaturas', invitadoController.updateLicenciaturas);

/**
 * PUT /api/invitados/:id/secciones
 * Actualizar secciones permitidas (FASE 2)
 * Body: { secciones: ["datos_personales", "datos_salud"] }
 */
router.put('/:id/secciones', invitadoController.updateSecciones);

/**
 * DELETE /api/invitados/:id/permisos
 * Eliminar permisos de un invitado
 */
router.delete('/:id/permisos', invitadoController.deletePermisos);

module.exports = router;