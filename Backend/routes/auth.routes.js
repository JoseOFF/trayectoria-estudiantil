// ============================================
// RUTAS DE AUTENTICACIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ============================================
// LÍMITE DE INTENTOS DE INICIO DE SESIÓN
// ============================================
// Cuenta solo los intentos FALLIDOS, por IP + correo: frena a quien prueba
// contraseñas contra una cuenta sin bloquear a los demás alumnos que
// comparten la misma red (y la misma IP pública) de la escuela.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,        // ventana de 15 minutos
    limit: 10,                       // 10 intentos fallidos por ventana
    skipSuccessfulRequests: true,    // los logins correctos no cuentan
    keyGenerator: (req) => `${req.ip}|${String(req.body?.email || '').toLowerCase().trim()}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos fallidos. Espera 15 minutos e intenta de nuevo.'
    }
});

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Público (con límite de intentos fallidos)
 * @body    { email, password }
 */
router.post('/login', loginLimiter, authController.login);

// Nota: no existe registro público. Los usuarios los crea un Administrador
// desde el módulo de Usuarios (POST /api/usuarios), que exige ese rol.

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token de acceso
 * @access  Público
 * @body    { refreshToken }
 */
router.post('/refresh', authController.refresh);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token y obtener datos del usuario
 * @access  Privado
 * @header  Authorization: Bearer TOKEN
 */
router.get('/verify', authenticate, authController.verify);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Privado
 * @header  Authorization: Bearer TOKEN
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (eliminar token del cliente)
 * @access  Privado
 * @header  Authorization: Bearer TOKEN
 */
router.post('/logout', authenticate, authController.logout);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

// ============================================
// DOCUMENTACIÓN DE LAS RUTAS
// ============================================

/*
BASE URL: /api/auth

ENDPOINTS:

1. POST /login
   - Descripción: Iniciar sesión en el sistema
   - Body: {
       "email": "usuario@ejemplo.com",
       "password": "contraseña123"
     }
   - Respuesta exitosa (200): {
       "success": true,
       "message": "Login exitoso",
       "data": {
         "usuario": {
           "id_usuario": 1,
           "nombre_usuario": "Juan Pérez",
           "correo": "juan@ejemplo.com",
           "rol": {
             "id_rol": 1,
             "nombre_rol": "Administrador",
             "descripcion": "Acceso total al sistema"
           },
           "permisos": ["VER_EXPEDIENTE", "EDITAR_EXPEDIENTE", ...]
         },
         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
         "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
       }
     }

2. GET /verify
   - Descripción: Verificar si el token es válido y obtener datos del usuario
   - Headers: {
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
     }
   - Respuesta exitosa (200): {
       "success": true,
       "message": "Token válido",
       "data": {
         "usuario": { ... }
       }
     }

3. POST /refresh
   - Descripción: Renovar el token de acceso usando el refresh token
   - Body: {
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
     }
   - Respuesta exitosa (200): {
       "success": true,
       "message": "Token renovado",
       "data": {
         "token": "nuevo_token_aqui"
       }
     }

4. POST /change-password
   - Descripción: Cambiar la contraseña del usuario autenticado
   - Headers: {
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
     }
   - Body: {
       "currentPassword": "contraseña_actual",
       "newPassword": "nueva_contraseña"
     }
   - Respuesta exitosa (200): {
       "success": true,
       "message": "Contraseña actualizada exitosamente"
     }

5. POST /logout
   - Descripción: Cerrar sesión (el cliente debe eliminar el token)
   - Headers: {
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
     }
   - Respuesta exitosa (200): {
       "success": true,
       "message": "Sesión cerrada exitosamente"
     }

CÓDIGOS DE ERROR COMUNES:
- 400: Bad Request (datos faltantes o inválidos)
- 401: Unauthorized (token inválido o expirado)
- 403: Forbidden (usuario desactivado)
- 500: Internal Server Error
*/