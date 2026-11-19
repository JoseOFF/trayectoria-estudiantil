// ============================================
// RUTAS DE USUARIOS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE CONSULTA
// ============================================

/**
 * @route   GET /api/usuarios
 * @desc    Obtener todos los usuarios (con filtros opcionales)
 * @access  Privado (Administrador)
 * @query   ?rol=1&activo=true&search=texto&limit=50&offset=0
 */
router.get(
    '/',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.getAll
);

/**
 * @route   GET /api/usuarios/roles
 * @desc    Obtener lista de roles disponibles
 * @access  Privado (Administrador)
 */
router.get(
    '/roles',
    authorize('Administrador'),
    usuarioController.getRoles
);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener un usuario por ID
 * @access  Privado (Administrador)
 */
router.get(
    '/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.getById
);

// ============================================
// RUTAS DE MODIFICACIÓN
// ============================================

/**
 * @route   POST /api/usuarios
 * @desc    Crear nuevo usuario
 * @access  Privado (Administrador)
 * @body    { nombre_usuario, correo, contrasena, id_rol }
 */
router.post(
    '/',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.create
);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar usuario
 * @access  Privado (Administrador)
 * @body    { nombre_usuario, correo, id_rol, activo }
 */
router.put(
    '/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.update
);

/**
 * @route   PATCH /api/usuarios/:id/toggle
 * @desc    Activar/Desactivar usuario
 * @access  Privado (Administrador)
 * @body    { activo: true/false }
 */
router.patch(
    '/:id/toggle',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.toggleActive
);

/**
 * @route   DELETE /api/usuarios/:id/permanent
 * @desc    Eliminar usuario permanentemente (hard delete)
 * @access  Privado (Solo Administrador)
 * @warning Esta acción es IRREVERSIBLE y elimina también:
 *          - Si es Alumno: Todo su expediente, documentos, calificaciones, etc.
 *          - Si es Docente: Sus licenciaturas asignadas y referencias
 *          - Historial de cambios se reasigna al usuario "Sistema"
 */
router.delete(
    '/:id/permanent',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.deletePermanently
);



/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Eliminar usuario (soft delete)
 * @access  Privado (Administrador)
 */
router.delete(
    '/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.remove
);



// ============================================
// RUTAS DE GESTIÓN DE CONTRASEÑAS (ADMINISTRADOR)
// ============================================

/**
 * @route   POST /api/usuarios/:id/reset-password
 * @desc    Resetear contraseña (genera contraseña temporal)
 * @access  Privado (Administrador)
 */
router.post(
    '/:id/reset-password',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.resetPassword
);

/**
 * @route   PUT /api/usuarios/:id/change-password
 * @desc    Cambiar contraseña (establecer nueva contraseña)
 * @access  Privado (Administrador)
 */
router.put(
    '/:id/change-password',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.changeUserPassword
);

/**
 * @route   GET /api/usuarios/:id/password-history
 * @desc    Obtener historial de cambios de contraseña
 * @access  Privado (Administrador)
 */
router.get(
    '/:id/password-history',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    usuarioController.getPasswordHistory
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

// ============================================
// DOCUMENTACIÓN DE LAS RUTAS
// ============================================

/*
BASE URL: /api/usuarios

ENDPOINTS:

1. GET /
   - Descripción: Obtener lista de usuarios con filtros opcionales
   - Query params:
     * rol: Filtrar por ID de rol (ej: ?rol=1)
     * activo: Filtrar por estado (ej: ?activo=true)
     * search: Buscar por nombre o correo (ej: ?search=juan)
     * limit: Límite de resultados (ej: ?limit=20)
     * offset: Offset para paginación (ej: ?offset=0)
   - Respuesta: {
       "success": true,
       "data": {
         "usuarios": [...],
         "total": 50,
         "limit": 50,
         "offset": 0
       }
     }

2. GET /roles
   - Descripción: Obtener lista de roles disponibles
   - Respuesta: {
       "success": true,
       "data": [
         { "id_rol": 1, "nombre_rol": "Administrador", "descripcion": "..." },
         { "id_rol": 2, "nombre_rol": "Docente", "descripcion": "..." }
       ]
     }

3. GET /:id
   - Descripción: Obtener un usuario específico con sus permisos
   - Respuesta: {
       "success": true,
       "data": {
         "id_usuario": 1,
         "nombre_usuario": "...",
         "correo": "...",
         "rol": {...},
         "permisos": [...]
       }
     }

4. POST /
   - Descripción: Crear nuevo usuario
   - Body: {
       "nombre_usuario": "Juan Pérez",
       "correo": "juan@ejemplo.com",
       "contrasena": "password123",
       "id_rol": 2
     }
   - Respuesta: {
       "success": true,
       "message": "Usuario creado exitosamente",
       "data": { ... }
     }

5. PUT /:id
   - Descripción: Actualizar datos del usuario
   - Body: {
       "nombre_usuario": "Juan Pérez García",
       "correo": "juan.nuevo@ejemplo.com",
       "id_rol": 2,
       "activo": true
     }
   - Respuesta: {
       "success": true,
       "message": "Usuario actualizado exitosamente",
       "data": { ... }
     }

6. PATCH /:id/toggle
   - Descripción: Activar o desactivar usuario
   - Body: {
       "activo": false
     }
   - Respuesta: {
       "success": true,
       "message": "Usuario desactivado exitosamente",
       "data": { ... }
     }

7. DELETE /:id
   - Descripción: Eliminar usuario (desactivación permanente)
   - Respuesta: {
       "success": true,
       "message": "Usuario eliminado exitosamente"
     }

PERMISOS REQUERIDOS:
- Rol: Administrador
- Permiso: GESTIONAR_USUARIOS

CÓDIGOS DE ERROR:
- 400: Datos inválidos
- 401: No autenticado
- 403: Sin permisos
- 404: Usuario no encontrado
- 409: Email o usuario ya existe
- 500: Error del servidor
*/