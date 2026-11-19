// ============================================
// RUTAS DE DOCENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docente.controller');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE CONSULTA
// ============================================

/**
 * @route   GET /api/docentes
 * @desc    Obtener todos los docentes con filtros opcionales
 * @access  Privado (Administrador)
 * @query   ?activo=true&area=texto&id_plantel=1&search=texto&limit=50&offset=0
 */
router.get(
    '/',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.getAll
);

/**
 * @route   GET /api/docentes/areas
 * @desc    Obtener lista de áreas disponibles
 * @access  Privado (Administrador)
 */
router.get(
    '/areas',
    authorize('Administrador'),
    docenteController.getAreas
);

/**
 * @route   GET /api/docentes/planteles
 * @desc    Obtener lista de planteles
 * @access  Privado (Administrador)
 */
router.get(
    '/planteles',
    authorize('Administrador'),
    docenteController.getPlanteles
);

/**
 * @route   GET /api/docentes/:id
 * @desc    Obtener un docente por ID
 * @access  Privado (Administrador)
 */
router.get(
    '/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.getById
);

// ============================================
// RUTAS DE MODIFICACIÓN
// ============================================

/**
 * @route   POST /api/docentes
 * @desc    Crear nuevo docente
 * @access  Privado (Administrador)
 * @body    { nombre_completo, correo, contrasena, area_asignada, id_plantel, licenciaturas }
 */
router.post(
    '/',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.create
);

/**
 * @route   PUT /api/docentes/:id
 * @desc    Actualizar docente
 * @access  Privado (Administrador)
 * @body    { nombre_completo, correo, area_asignada, id_plantel, activo, licenciaturas }
 */
router.put(
    '/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.update
);

/**
 * @route   PATCH /api/docentes/:id/toggle
 * @desc    Activar/Desactivar docente
 * @access  Privado (Administrador)
 * @body    { activo: true/false }
 */
router.patch(
    '/:id/toggle',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.toggleActive
);


/**
 * @route   DELETE /api/docentes/:id/permanent
 * @desc    Eliminar docente permanentemente (hard delete)
 * @access  Privado (Solo Administrador)
 * @warning Esta acción es IRREVERSIBLE
 */
router.delete(
    '/:id/permanent',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.deletePermanently
);

/**
 * @route   DELETE /api/docentes/:id
 * @desc    Eliminar docente (soft delete)
 * @access  Privado (Administrador)
 */
router.delete(
    '/:id',
    authorize('Administrador'),
    checkPermission('GESTIONAR_USUARIOS'),
    docenteController.remove
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

// ============================================
// DOCUMENTACIÓN DE LAS RUTAS
// ============================================

/*
BASE URL: /api/docentes

ENDPOINTS:

1. GET /
   - Descripción: Obtener lista de docentes con filtros opcionales
   - Query params:
     * activo: Filtrar por estado (ej: ?activo=true)
     * area: Filtrar por área (ej: ?area=Matemáticas)
     * id_plantel: Filtrar por plantel (ej: ?id_plantel=1)
     * search: Buscar por nombre o correo (ej: ?search=juan)
     * limit: Límite de resultados (ej: ?limit=20)
     * offset: Offset para paginación (ej: ?offset=0)
   - Respuesta: {
       "success": true,
       "data": {
         "docentes": [...],
         "total": 25,
         "limit": 50,
         "offset": 0
       }
     }

2. GET /areas
   - Descripción: Obtener lista de áreas únicas
   - Respuesta: {
       "success": true,
       "data": ["Matemáticas", "Español", "Ciencias", ...]
     }

3. GET /planteles
   - Descripción: Obtener lista de planteles disponibles
   - Respuesta: {
       "success": true,
       "data": [
         {
           "id_plantel": 1,
           "nombre_plantel": "...",
           "telefono": "...",
           "correo": "..."
         }
       ]
     }

4. GET /:id
   - Descripción: Obtener un docente específico con sus licenciaturas
   - Respuesta: {
       "success": true,
       "data": {
         "id_docente": 1,
         "nombre_completo": "...",
         "correo": "...",
         "area_asignada": "...",
         "licenciaturas": [...]
       }
     }

5. POST /
   - Descripción: Crear nuevo docente
   - Body: {
       "nombre_completo": "Juan Pérez García",
       "correo": "juan.docente@example.com",
       "contrasena": "password123",
       "area_asignada": "Matemáticas",
       "id_plantel": 1,
       "licenciaturas": [1, 3]
     }
   - Respuesta: {
       "success": true,
       "message": "Docente creado exitosamente",
       "data": { ... }
     }

6. PUT /:id
   - Descripción: Actualizar datos del docente
   - Body: {
       "nombre_completo": "Juan Pérez García",
       "correo": "juan.nuevo@example.com",
       "area_asignada": "Ciencias",
       "id_plantel": 1,
       "activo": true,
       "licenciaturas": [1, 2]
     }
   - Respuesta: {
       "success": true,
       "message": "Docente actualizado exitosamente",
       "data": { ... }
     }

7. PATCH /:id/toggle
   - Descripción: Activar/Desactivar docente
   - Body: { "activo": false }
   - Respuesta: {
       "success": true,
       "message": "Docente desactivado exitosamente"
     }

8. DELETE /:id
   - Descripción: Eliminar docente (desactivación)
   - Respuesta: {
       "success": true,
       "message": "Docente eliminado exitosamente"
     }
*/