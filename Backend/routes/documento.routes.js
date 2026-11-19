// ============================================
// RUTAS DE DOCUMENTOS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documento.controller');
const { authenticate, authorize, checkPermission, checkInvitadoLicenciatura, checkInvitadoSeccion, verificarAccesoAlumno } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authenticate);

// ============================================
// RUTAS DE DOCUMENTOS
// ============================================

/**
 * @route   GET /api/documentos/tipos
 * @desc    Obtener lista de tipos de documentos disponibles
 * @access  Privado
 */
router.get(
    '/tipos',
    documentoController.getTiposDocumentos
);

/**
 * @route   GET /api/documentos/alumno/:id
 * @desc    Listar todos los documentos de un alumno
 * @access  Privado (Administrador, Docente)
 * @query   ?tipo=TipoDocumento (opcional)
 */
router.get(
    '/alumno/:id',
    authorize('Administrador', 'Docente', 'Alumno', 'Invitado'),
    checkInvitadoLicenciatura,
    checkInvitadoSeccion('documentos'),
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    documentoController.listarDocumentos
);

/**
 * @route   POST /api/documentos/alumno/:id
 * @desc    Subir un documento para un alumno
 * @access  Privado (Administrador, Docente)
 * @body    FormData { file, tipo_documento }
 */
router.post(
    '/alumno/:id',
    authorize('Administrador', 'Docente', 'Alumno'),
    checkPermission('EDITAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),   // antes de multer: si no hay acceso, no se escribe nada
    upload.single('file'),
    handleMulterError,
    documentoController.subirDocumento
);



/**
 * @route   GET /api/documentos/alumno/:id/descargar/:id_documento
 * @desc    Descargar un documento específico
 * @access  Privado (Administrador, Docente)
 */
router.get(
    '/alumno/:id/descargar/:id_documento',
    authorize('Administrador', 'Docente', 'Alumno', 'Invitado'),
    checkInvitadoLicenciatura,
    checkInvitadoSeccion('documentos'),
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    documentoController.descargarDocumento
);

/**
 * @route   GET /api/documentos/alumno/:id/preview/:id_documento
 * @desc    Previsualizar un documento específico en el navegador
 * @access  Privado (Administrador, Docente, Alumno)
 */
router.get(
    '/alumno/:id/preview/:id_documento',
    authorize('Administrador', 'Docente', 'Alumno', 'Invitado'),
    checkInvitadoLicenciatura,
    checkInvitadoSeccion('documentos'),
    checkPermission('VER_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    documentoController.previsualizarDocumento
);


/**
 * @route   DELETE /api/documentos/alumno/:id/:id_documento
 * @desc    Eliminar un documento
 * @access  (Administrador, Docente, Alumno)
 */
router.delete(
    '/alumno/:id/:id_documento',
    authorize('Administrador', 'Docente', 'Alumno'),
    checkPermission('ELIMINAR_EXPEDIENTE'),
    verificarAccesoAlumno('id'),
    documentoController.eliminarDocumento
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;