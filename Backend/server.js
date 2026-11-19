// ============================================
// SERVIDOR PRINCIPAL - SISTEMA DE EXPEDIENTES ESTUDIANTILES
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { pool, testConnection, closePool } = require('./config/database');

// ============================================
// INICIALIZAR EXPRESS
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CONFIGURAR TRUST PROXY (para Cloudflare Tunnel)
// ============================================
app.set('trust proxy', [
    'loopback',           // Localhost (127.0.0.1)
    'linklocal',          // Red local (169.254.0.0/16)
    '173.245.48.0/20',    // Cloudflare
    '103.21.244.0/22',    // Cloudflare
    '103.22.200.0/22',    // Cloudflare
    '103.31.4.0/22',      // Cloudflare
    '141.101.64.0/18',    // Cloudflare
    '108.162.192.0/18',   // Cloudflare
    '190.93.240.0/20',    // Cloudflare
    '188.114.96.0/20',    // Cloudflare
    '197.234.240.0/22',   // Cloudflare
    '198.41.128.0/17',    // Cloudflare
    '162.158.0.0/15',     // Cloudflare
    '104.16.0.0/13',      // Cloudflare
    '104.24.0.0/14',      // Cloudflare
    '172.64.0.0/13',      // Cloudflare
    '131.0.72.0/22'       // Cloudflare
]);

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet - Encabezados HTTP de seguridad
// La política de contenido (CSP) está ajustada a lo que usa el Frontend
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // Scripts: los nuestros y las librerías de jsDelivr (Bootstrap, Chart.js, SweetAlert2)
            scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
            // Prohíbe JavaScript dentro de atributos HTML (onclick=, onerror=...).
            // Los botones usan data-accion (ver Frontend/assets/js/core/acciones.js)
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
            fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'data:'],
            // blob: para las vistas previas de documentos que se generan en el navegador
            imgSrc: ["'self'", 'data:', 'blob:'],
            frameSrc: ["'self'", 'blob:'],
            connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
            objectSrc: ["'none'"],
            frameAncestors: ["'self'"],
            // La red local usa http://192.168.x.x: no forzar HTTPS
            upgradeInsecureRequests: null
        }
    }
}));

// CORS - Permitir peticiones desde el frontend
const corsOptions = {
    origin: process.env.CORS_ORIGIN.split(','), // Permite múltiples orígenes
    credentials: true, // Permite envío de cookies
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - Limitar peticiones por IP
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 peticiones
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.'
    },
    standardHeaders: true, // Retorna info en headers `RateLimit-*`
    legacyHeaders: false // Deshabilita headers `X-RateLimit-*`
});

// Aplicar rate limiting a todas las rutas de API
app.use('/api/', limiter);

// ============================================
// MIDDLEWARES DE PARSEO
// ============================================

// Parsear JSON en el body de las peticiones
app.use(express.json({ limit: '10mb' }));

// Parsear datos de formularios
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// MIDDLEWARE DE LOGGING
// ============================================

// Morgan - Logger de peticiones HTTP (método, ruta, código de respuesta y tiempo)
const logFormat = process.env.LOG_LEVEL || 'dev';
app.use(morgan(logFormat));

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND
// ============================================
const path = require('path');

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../Frontend')));






	
// ============================================
// RUTA DE PRUEBA / HEALTH CHECK
// ============================================

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API del Sistema de Expedientes Estudiantiles',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        institution: process.env.INSTITUTION_NAME,
        // Datos públicos de contacto para el login y el pie de página.
        // Las variables que no estén en el .env llegan como null y no se muestran
        institucion: {
            nombre: process.env.INSTITUTION_NAME || null,
            ubicacion: process.env.INSTITUTION_LOCATION || null,
            correo: process.env.INSTITUTION_EMAIL || null,
            telefono: process.env.INSTITUTION_PHONE || null,
            horario: process.env.INSTITUTION_HOURS || null
        }
    });
});

// Comprueba de verdad la base de datos para que un monitor detecte caídas
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            success: true,
            message: 'Servidor funcionando correctamente',
            database: 'connected',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Sin conexión a la base de datos',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});



// ============================================
// LOG DETALLADO DE PETICIONES (solo en desarrollo)
// ============================================
// En producción NO se registra el body: contiene contraseñas y datos
// personales de los alumnos (CURP, salud, domicilios...).
const CAMPOS_SENSIBLES = /pass|contras|token|secret/i;

// Copia el objeto reemplazando por *** los campos sensibles,
// también dentro de objetos y listas anidados
const ocultarSensibles = (valor) => {
    if (Array.isArray(valor)) return valor.map(ocultarSensibles);
    if (valor && typeof valor === 'object') {
        return Object.fromEntries(
            Object.entries(valor).map(([clave, v]) =>
                [clave, CAMPOS_SENSIBLES.test(clave) ? '***' : ocultarSensibles(v)])
        );
    }
    return valor;
};

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        // Solo logear body para peticiones que no sean GET
        if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
            console.log('Body:', JSON.stringify(ocultarSensibles(req.body), null, 2));
        }

        // Si hay query params, mostrarlos
        if (Object.keys(req.query || {}).length > 0) {
            console.log('Query:', JSON.stringify(ocultarSensibles(req.query), null, 2));
        }

        next();
    });
}

// ============================================
// IMPORTAR Y USAR RUTAS
// ============================================

// Rutas de autenticación
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Rutas de usuarios
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);

// Rutas de alumnos
const alumnoRoutes = require('./routes/alumno.routes');
app.use('/api/alumnos', alumnoRoutes);

// Rutas de expedientes
const expedienteRoutes = require('./routes/expediente.routes');
app.use('/api/expedientes', expedienteRoutes);

// RUta de documentos
const documentoRoutes = require('./routes/documento.routes');
app.use('/api/documentos', documentoRoutes);

// Rutas de reportes
const reporteRoutes = require('./routes/reporte.routes');
app.use('/api/reportes', reporteRoutes);

// Rutas de dashboard
const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

// Rutas de docentes
const docenteRoutes = require('./routes/docente.routes');
app.use('/api/docentes', docenteRoutes);

// Rutas de seguridad
const seguridadRoutes = require('./routes/seguridad.routes');
app.use('/api/seguridad', seguridadRoutes);

// Rutas del portal del alumno
const portalAlumnoRoutes = require('./routes/portal-alumno.routes');
app.use('/api/portal-alumno', portalAlumnoRoutes);

// Rutas de prácticas profesionales
const practicasRoutes = require('./routes/practicas.routes');
app.use('/api/practicas', practicasRoutes);

// Rutas de invitados
const invitadoRoutes = require('./routes/invitado.routes');
app.use('/api/invitados', invitadoRoutes);

// Rutas de carga masiva
const cargamasivaRoutes = require('./routes/cargamasiva.routes');
app.use('/api/cargamasiva', cargamasivaRoutes);

// Rutas de completitud
const completitudRoutes = require('./routes/completitud.routes');
app.use('/api/completitud', completitudRoutes);

console.log('Rutas registradas correctamente');




// ============================================
// CATCH-ALL PARA SPA
// ============================================
app.get('*', (req, res, next) => {
    // Si la petición es a /api/*, dejar que pase
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Para cualquier otra ruta, servir index.html
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});




// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// ============================================

app.use((error, req, res, next) => {
    console.error('Error capturado:', error);
    
    // Error de validación
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: error.errors
        });
    }
    
    // Error de base de datos
    if (error.code && error.code.startsWith('ER_')) {
        return res.status(500).json({
            success: false,
            message: 'Error en la base de datos',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
    
    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
    
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado'
        });
    }
    
    // Error genérico
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
});

// ============================================
// FUNCIÓN PARA INICIAR EL SERVIDOR
// ============================================

const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        console.log('\nVerificando conexión a la base de datos...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('\nNo se pudo conectar a la base de datos');
            console.error('Verifica tu configuración en el archivo .env');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n============================================');
            console.log('  SISTEMA DE EXPEDIENTES ESTUDIANTILES');
            if (process.env.INSTITUTION_NAME) console.log(`  ${process.env.INSTITUTION_NAME}`);
            console.log('============================================\n');
            console.log(`Servidor corriendo en: http://localhost:${PORT}`);
            console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Iniciado: ${new Date().toLocaleString('es-MX')}`);
            console.log('\nRutas disponibles:');
            console.log(`   GET  http://localhost:${PORT}/`);
            console.log(`   GET  http://localhost:${PORT}/api/health`);
            console.log('\nEsperando peticiones...\n');
        });

    } catch (error) {
        console.error('\nError al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

// ============================================
// MANEJO DE CIERRE GRACEFUL
// ============================================

// Capturar CTRL+C
process.on('SIGINT', async () => {
    console.log('\n\n  Recibida señal de interrupción (CTRL+C)');
    console.log('Cerrando servidor de manera segura...');
    
    await closePool();
    
    console.log('Servidor cerrado correctamente');
    process.exit(0);
});

// Capturar errores no manejados
process.on('unhandledRejection', (error) => {
    console.error('Promesa rechazada no manejada:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error);
    process.exit(1);
});

// ============================================
// INICIAR SERVIDOR
// ============================================

startServer();

// ============================================
// EXPORTAR APP (para testing)
// ============================================

module.exports = app;
