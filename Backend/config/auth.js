// ============================================
// CONFIGURACIÓN DE AUTENTICACIÓN JWT
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================
// CONFIGURACIÓN DE JWT
// ============================================

// JWT_SECRET es obligatorio: con un secreto conocido cualquiera podría
// fabricar tokens válidos, así que no se deja ningún valor por defecto.
if (!process.env.JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET. Revisa el archivo .env');
}

const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
};

// ============================================
// GENERAR TOKEN DE ACCESO
// ============================================
/**
 * Genera un token JWT para el usuario
 * @param {Object} payload - Datos a incluir en el token
 * @returns {String} Token JWT
 */
const generateToken = (payload) => {
    try {
        // Crear token con los datos del usuario
        const token = jwt.sign(
            payload,
            JWT_CONFIG.secret,
            {
                expiresIn: JWT_CONFIG.expiresIn,
                issuer: 'sistema-expedientes',
                audience: 'expedientes-users'
            }
        );
        
        return token;
    } catch (error) {
        console.error('Error al generar token:', error.message);
        throw new Error('Error al generar token de autenticación');
    }
};

// ============================================
// GENERAR REFRESH TOKEN
// ============================================
/**
 * Genera un refresh token para renovar el token de acceso
 * @param {Object} payload - Datos a incluir en el token
 * @returns {String} Refresh token
 */
const generateRefreshToken = (payload) => {
    try {
        const refreshToken = jwt.sign(
            payload,
            JWT_CONFIG.secret,
            {
                expiresIn: JWT_CONFIG.refreshExpiresIn,
                issuer: 'sistema-expedientes',
                audience: 'expedientes-users-refresh'
            }
        );
        
        return refreshToken;
    } catch (error) {
        console.error('Error al generar refresh token:', error.message);
        throw new Error('Error al generar refresh token');
    }
};

// ============================================
// VERIFICAR TOKEN
// ============================================
/**
 * Verifica y decodifica un token JWT
 * @param {String} token - Token a verificar
 * @returns {Object} Datos decodificados del token
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret, {
            issuer: 'sistema-expedientes',
            audience: 'expedientes-users'
        });
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        } else {
            throw new Error('Error al verificar token');
        }
    }
};

// ============================================
// VERIFICAR REFRESH TOKEN
// ============================================
/**
 * Verifica un refresh token
 * @param {String} refreshToken - Refresh token a verificar
 * @returns {Object} Datos decodificados del token
 */
const verifyRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, JWT_CONFIG.secret, {
            issuer: 'sistema-expedientes',
            audience: 'expedientes-users-refresh'
        });
        
        return decoded;
    } catch (error) {
        throw new Error('Refresh token inválido o expirado');
    }
};

// ============================================
// DECODIFICAR TOKEN SIN VERIFICAR
// ============================================
/**
 * Decodifica un token sin verificar su firma (útil para debugging)
 * @param {String} token - Token a decodificar
 * @returns {Object} Datos decodificados
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Error al decodificar token:', error.message);
        return null;
    }
};

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    JWT_CONFIG,
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    decodeToken
};
