// ============================================
// RUTAS DE CARGA MASIVA
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cargaMasivaController = require('../controllers/cargamasiva.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// ============================================
// CONFIGURACIÓN DE MULTER
// ============================================

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
        }
    }
});

// ============================================
// RUTAS
// ============================================

/**
 * @route   POST /api/carga-masiva/procesar
 * @desc    Procesa archivo Excel y crea alumnos masivamente
 * @access  Privado (Administrador)
 */
router.post(
    '/procesar',
    authenticate,
    authorize('Administrador'),
    upload.single('archivo'),
    cargaMasivaController.procesarCargaMasiva
);

/**
 * @route   GET /api/carga-masiva/plantilla
 * @desc    Descarga plantilla Excel de ejemplo
 * @access  Privado (Administrador)
 */
router.get(
    '/plantilla',
    authenticate,
    authorize('Administrador'),
    cargaMasivaController.descargarPlantilla
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;