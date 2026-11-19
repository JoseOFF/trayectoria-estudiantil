// ============================================
// MIDDLEWARE DE SUBIDA DE ARCHIVOS (MULTER)
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// CONFIGURACIÓN DE ALMACENAMIENTO
// ============================================

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Carpeta uploads creada');
}

// Tipos de archivo permitidos y la extensión con la que se guardan.
// La extensión sale de esta lista, NUNCA del nombre que envía el usuario
// (si no, alguien podría subir "ataque.html" declarándolo como PDF).
const EXTENSIONES_PERMITIDAS = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
};

// La columna documentos.nombre_archivo es VARCHAR(100)
const LARGO_NOMBRE_ARCHIVO = 100;
// Parte del nombre original que se usa en el archivo guardado en disco.
// Se limita porque la ruta completa se guarda en documentos.ruta_archivo (VARCHAR 255)
const LARGO_NOMBRE_EN_DISCO = 60;

/**
 * Corrige y recorta el nombre original que envía el navegador.
 *
 * 1. Acentos: multer 1.4.5 lee el nombre como latin1 aunque el navegador lo
 *    manda en UTF-8, y "presentación" llega como "presentaciÃ³n". Se vuelven a
 *    leer los mismos bytes como UTF-8. Si el nombre ya trae caracteres fuera de
 *    latin1 (ya venía bien) o el resultado no es UTF-8 válido, se deja igual.
 * 2. Largo: si pasa de 100 caracteres se recorta, conservando la extensión.
 */
const normalizarNombreOriginal = (nombre) => {
    let resultado = String(nombre || 'archivo');

    if (!/[^\u0000-ÿ]/.test(resultado)) {
        const comoUtf8 = Buffer.from(resultado, 'latin1').toString('utf8');
        if (!comoUtf8.includes('�')) {
            resultado = comoUtf8;
        }
    }

    resultado = resultado.trim() || 'archivo';

    if (resultado.length > LARGO_NOMBRE_ARCHIVO) {
        let ext = path.extname(resultado);
        if (ext.length > 10) ext = ''; // una "extensión" tan larga no es real
        const base = resultado.slice(0, resultado.length - ext.length);
        resultado = base.slice(0, LARGO_NOMBRE_ARCHIVO - ext.length).trimEnd() + ext;
    }

    return resultado;
};

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guardar en subcarpeta por alumno. Solo se acepta un número entero
        // (verificarAccesoAlumno ya lo validó; aquí se revisa de nuevo por seguridad)
        const valor = String(req.params.id ?? '');
        if (!/^\d+$/.test(valor)) {
            return cb(new Error('Identificador de alumno inválido'));
        }
        const alumnoDir = path.join(uploadsDir, `alumno_${parseInt(valor, 10)}`);

        if (!fs.existsSync(alumnoDir)) {
            fs.mkdirSync(alumnoDir, { recursive: true });
        }

        cb(null, alumnoDir);
    },
    filename: (req, file, cb) => {
        // Nombre único: nombreoriginal_timestamp_aleatorio + extensión según el tipo
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const ext = EXTENSIONES_PERMITIDAS[file.mimetype];
        const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
        
        // Sanitizar nombre del archivo (remover caracteres especiales)
        const sanitizedName = nameWithoutExt
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^a-zA-Z0-9_-]/g, '_') // Reemplazar caracteres especiales
            .slice(0, LARGO_NOMBRE_EN_DISCO); // Ruta corta: cabe en ruta_archivo
        
        cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
    }
});

// ============================================
// FILTRO DE ARCHIVOS PERMITIDOS
// ============================================

const fileFilter = (req, file, cb) => {
    // multer llama a fileFilter ANTES de guardar, y este mismo objeto termina
    // como req.file: el nombre corregido llega al disco y a la base de datos.
    file.originalname = normalizarNombreOriginal(file.originalname);

    if (Object.prototype.hasOwnProperty.call(EXTENSIONES_PERMITIDAS, file.mimetype)) {
        cb(null, true); // Aceptar archivo
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten PDF, imágenes, Word y Excel.`), false);
    }
};

// ============================================
// CONFIGURACIÓN DE MULTER
// ============================================

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB por defecto
    }
});

// ============================================
// MIDDLEWARE PARA MANEJO DE ERRORES DE MULTER
// ============================================

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Error de Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 10MB.'
            });
        }
        
        return res.status(400).json({
            success: false,
            message: `Error al subir archivo: ${err.message}`
        });
    } else if (err) {
        // Error personalizado (del fileFilter)
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    next();
};

// ============================================
// EXPORTAR CONFIGURACIÓN
// ============================================

module.exports = {
    upload,
    handleMulterError
};