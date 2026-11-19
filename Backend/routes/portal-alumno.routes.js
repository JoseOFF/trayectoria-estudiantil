// ============================================
// RUTAS DEL PORTAL DEL ALUMNO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const router = express.Router();
const portalAlumnoController = require('../controllers/portal-alumno.controller');
const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN COMO ALUMNO
// ============================================
router.use(authenticate);
router.use(authorize('Alumno'));

// ============================================
// RUTAS DE INFORMACIÓN PERSONAL
// ============================================

/**
 * @route   GET /api/portal-alumno/mi-informacion
 * @desc    Obtener información básica del alumno autenticado
 * @access  Privado (Alumno)
 */
router.get(
    '/mi-informacion',
    portalAlumnoController.getMiInformacion
);

/**
 * @route   PUT /api/portal-alumno/datos-personales
 * @desc    Actualizar datos personales del alumno
 * @access  Privado (Alumno)
 * @body    { correo_personal, celular, telefono_emergencia, estado_civil, tiene_hijos, numero_hijos }
 */
router.put(
    '/datos-personales',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarDatosPersonales
);

// ============================================
// RUTAS DE DATOS DE SALUD
// ============================================

/**
 * @route   GET /api/portal-alumno/datos-salud
 * @desc    Obtener datos de salud del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/datos-salud',
    portalAlumnoController.getMisDatosSalud
);

/**
 * @route   POST /api/portal-alumno/datos-salud
 * @desc    Guardar/actualizar datos de salud
 * @access  Privado (Alumno)
 * @body    { tipo_sangre, afiliacion_seguro_medico, alergias, tiene_enfermedad, nombre_enfermedad }
 */
router.post(
    '/datos-salud',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.guardarDatosSalud
);

// ============================================
// RUTAS DE FAMILIARES
// ============================================

/**
 * @route   GET /api/portal-alumno/familiares
 * @desc    Obtener lista de familiares
 * @access  Privado (Alumno)
 */
router.get(
    '/familiares',
    portalAlumnoController.getMisFamiliares
);

/**
 * @route   POST /api/portal-alumno/familiares
 * @desc    Agregar un familiar
 * @access  Privado (Alumno)
 * @body    { tipo_familiar, nombre_completo, telefono, ocupacion, es_tutor }
 */
router.post(
    '/familiares',
    checkPermission('CREAR_EXPEDIENTE'),
    portalAlumnoController.agregarFamiliar
);

/**
 * @route   DELETE /api/portal-alumno/familiares/:id
 * @desc    Eliminar un familiar
 * @access  Privado (Alumno)
 */
router.delete(
    '/familiares/:id',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.eliminarFamiliar
);

// ============================================
// RUTAS DE CALIFICACIONES
// ============================================

/**
 * @route   GET /api/portal-alumno/calificaciones
 * @desc    Obtener historial de calificaciones
 * @access  Privado (Alumno)
 */
router.get(
    '/calificaciones',
    portalAlumnoController.getMisCalificaciones
);

router.delete(
    '/calificaciones/:numero_semestre',
    checkPermission('ELIMINAR_EXPEDIENTE'),
    portalAlumnoController.eliminarMiCalificacion
);

// ============================================
// RUTAS DE DOCUMENTOS
// ============================================

/**
 * @route   GET /api/portal-alumno/documentos
 * @desc    Obtener lista de documentos del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/documentos',
    portalAlumnoController.getMisDocumentos
);

// ============================================
// RUTAS DE DOMICILIO
// ============================================

/**
 * @route   GET /api/portal-alumno/domicilio
 * @desc    Obtener domicilio del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/domicilio',
    portalAlumnoController.getMiDomicilio
);

/**
 * @route   PUT /api/portal-alumno/domicilio
 * @desc    Actualizar domicilio del alumno
 * @access  Privado (Alumno)
 */
router.put(
    '/domicilio',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarDomicilio
);

// ============================================
// RUTAS DE DATOS SOCIOECONÓMICOS
// ============================================

/**
 * @route   GET /api/portal-alumno/datos-socioeconomicos
 * @desc    Obtener datos socioeconómicos del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/datos-socioeconomicos',
    portalAlumnoController.getMisDatosSocioeconomicos
);

/**
 * @route   PUT /api/portal-alumno/datos-socioeconomicos
 * @desc    Actualizar datos socioeconómicos
 * @access  Privado (Alumno)
 */
router.put(
    '/datos-socioeconomicos',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarDatosSocioeconomicos
);



// ============================================
// RUTAS DE DATOS ACADÉMICOS
// ============================================

/**
 * @route   GET /api/portal-alumno/datos-academicos
 * @desc    Obtener datos académicos del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/datos-academicos',
    portalAlumnoController.getMisDatosAcademicos
);

/**
 * @route   PUT /api/portal-alumno/datos-academicos
 * @desc    Actualizar datos académicos
 * @access  Privado (Alumno)
 */
router.put(
    '/datos-academicos',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarDatosAcademicos
);

// ============================================
// RUTAS DE DESEMPEÑO ACADÉMICO
// ============================================

/**
 * @route   GET /api/portal-alumno/desempeno
 * @desc    Obtener desempeño académico del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/desempeno',
    portalAlumnoController.getMiDesempeno
);

/**
 * @route   PUT /api/portal-alumno/desempeno
 * @desc    Actualizar desempeño académico
 * @access  Privado (Alumno)
 */
router.put(
    '/desempeno',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarDesempeno
);

// ============================================
// RUTAS DE CERTIFICACIONES
// ============================================

/**
 * @route   GET /api/portal-alumno/certificaciones
 * @desc    Obtener certificaciones del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/certificaciones',
    portalAlumnoController.getMisCertificaciones
);

/**
 * @route   POST /api/portal-alumno/certificaciones
 * @desc    Agregar certificación
 * @access  Privado (Alumno)
 */
router.post(
    '/certificaciones',
    checkPermission('CREAR_EXPEDIENTE'),
    portalAlumnoController.agregarCertificacion
);

/**
 * @route   DELETE /api/portal-alumno/certificaciones/:id
 * @desc    Eliminar certificación
 * @access  Privado (Alumno)
 */
router.delete(
    '/certificaciones/:id',
    checkPermission('ELIMINAR_EXPEDIENTE'),
    portalAlumnoController.eliminarCertificacion
);

// ============================================
// RUTAS DE HABILIDADES
// ============================================

/**
 * @route   GET /api/portal-alumno/habilidades
 * @desc    Obtener habilidades del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/habilidades',
    portalAlumnoController.getMisHabilidades
);

/**
 * @route   POST /api/portal-alumno/habilidades
 * @desc    Agregar habilidad
 * @access  Privado (Alumno)
 */
router.post(
    '/habilidades',
    checkPermission('CREAR_EXPEDIENTE'),
    portalAlumnoController.agregarHabilidad
);

/**
 * @route   DELETE /api/portal-alumno/habilidades/:id
 * @desc    Eliminar habilidad
 * @access  Privado (Alumno)
 */
router.delete(
    '/habilidades/:id',
    checkPermission('ELIMINAR_EXPEDIENTE'),
    portalAlumnoController.eliminarHabilidad
);


// ============================================
// RUTAS DE BECAS
// ============================================

/**
 * @route   GET /api/portal-alumno/becas
 * @desc    Obtener becas del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/becas',
    portalAlumnoController.getMisBecas
);

/**
 * @route   POST /api/portal-alumno/becas
 * @desc    Agregar beca
 * @access  Privado (Alumno)
 */
router.post(
    '/becas',
    checkPermission('CREAR_EXPEDIENTE'),
    portalAlumnoController.agregarBeca
);

/**
 * @route   PUT /api/portal-alumno/becas/:id
 * @desc    Actualizar beca
 * @access  Privado (Alumno)
 */
router.put(
    '/becas/:id',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarBeca
);

/**
 * @route   DELETE /api/portal-alumno/becas/:id
 * @desc    Eliminar beca
 * @access  Privado (Alumno)
 */
router.delete(
    '/becas/:id',
    checkPermission('ELIMINAR_EXPEDIENTE'),
    portalAlumnoController.eliminarBeca
);

// ============================================
// RUTAS DE MOVILIDAD ACADÉMICA
// ============================================

/**
 * @route   GET /api/portal-alumno/movilidad
 * @desc    Obtener movilidades académicas del alumno
 * @access  Privado (Alumno)
 */
router.get(
    '/movilidad',
    portalAlumnoController.getMisMovilidades
);

/**
 * @route   POST /api/portal-alumno/movilidad
 * @desc    Agregar movilidad académica
 * @access  Privado (Alumno)
 */
router.post(
    '/movilidad',
    checkPermission('CREAR_EXPEDIENTE'),
    portalAlumnoController.agregarMovilidad
);

/**
 * @route   PUT /api/portal-alumno/movilidad/:id
 * @desc    Actualizar movilidad académica
 * @access  Privado (Alumno)
 */
router.put(
    '/movilidad/:id',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.actualizarMovilidad
);

/**
 * @route   DELETE /api/portal-alumno/movilidad/:id
 * @desc    Eliminar movilidad académica
 * @access  Privado (Alumno)
 */
router.delete(
    '/movilidad/:id',
    checkPermission('ELIMINAR_EXPEDIENTE'),
    portalAlumnoController.eliminarMovilidad
);

// ============================================
// RUTAS DE PRÁCTICAS PROFESIONALES
// ============================================

/**
 * @route   GET /api/portal-alumno/practicas
 * @desc    Obtener datos de prácticas profesionales
 * @access  Privado (Alumno)
 */
router.get(
    '/practicas',
    portalAlumnoController.getMisPracticas
);

/**
 * @route   POST /api/portal-alumno/practicas
 * @desc    Guardar/actualizar prácticas profesionales
 * @access  Privado (Alumno)
 */
router.post(
    '/practicas',
    checkPermission('EDITAR_EXPEDIENTE'),
    portalAlumnoController.guardarPracticas
);



// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

