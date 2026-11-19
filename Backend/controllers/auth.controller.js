// ============================================
// CONTROLADOR DE AUTENTICACIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Usuario = require('../models/usuario.model');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/auth');

// ============================================
// LOGIN - INICIAR SESIÓN
// ============================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validar que vengan los datos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }
        
        // Buscar usuario por email
        const usuario = await Usuario.findByEmail(email);
        
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Verificar contraseña
        const passwordMatch = await Usuario.verifyPassword(password, usuario.contrasena);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar que el usuario esté activo. Va DESPUÉS de la contraseña para que
        // este mensaje solo lo vea el dueño de la cuenta y no revele qué correos existen
        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario desactivado. Contacta al administrador'
            });
        }
        
        // Obtener permisos del usuario
        const permisos = await Usuario.getPermissions(usuario.id_usuario);
        
        // Preparar datos para el token
        const tokenPayload = {
            id_usuario: usuario.id_usuario,
            id_rol: usuario.id_rol,
            nombre_rol: usuario.nombre_rol,
            correo: usuario.correo,
            nombre_usuario: usuario.nombre_usuario
        };
        
        // Generar tokens
        const token = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken({ id_usuario: usuario.id_usuario });
        
        // Preparar respuesta (sin contraseña)
        const usuarioResponse = {
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            correo: usuario.correo,
            rol: {
                id_rol: usuario.id_rol,
                nombre_rol: usuario.nombre_rol,
                descripcion: usuario.descripcion_rol
            },
            permisos: permisos.map(p => p.nombre_permiso),
            fecha_registro: usuario.fecha_registro
        };
        
        // Log del login
        console.log(`Login exitoso: ${usuario.correo} (${usuario.nombre_rol})`);
        
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: usuarioResponse,
                token,
                refreshToken
            }
        });
        
    } catch (error) {
        console.error('- Error en login:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// VERIFY - VERIFICAR TOKEN
// ============================================
const verify = async (req, res) => {
    try {
        // El middleware de autenticación ya verificó el token
        // y agregó los datos del usuario en req.user
        
        const usuario = await Usuario.findById(req.user.id_usuario);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario desactivado'
            });
        }
        
        // Obtener permisos
        const permisos = await Usuario.getPermissions(usuario.id_usuario);
        
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre_usuario: usuario.nombre_usuario,
                    correo: usuario.correo,
                    rol: {
                        id_rol: usuario.id_rol,
                        nombre_rol: usuario.nombre_rol,
                        descripcion: usuario.descripcion_rol
                    },
                    permisos: permisos.map(p => p.nombre_permiso)
                }
            }
        });
        
    } catch (error) {
        console.error('- Error en verify:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al verificar token'
        });
    }
};

// ============================================
// REFRESH - RENOVAR TOKEN
// ============================================
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }
        
        // Verificar refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Buscar usuario
        const usuario = await Usuario.findById(decoded.id_usuario);
        
        if (!usuario || !usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario no encontrado o desactivado'
            });
        }
        
        // Generar nuevo token
        const tokenPayload = {
            id_usuario: usuario.id_usuario,
            id_rol: usuario.id_rol,
            nombre_rol: usuario.nombre_rol,
            correo: usuario.correo,
            nombre_usuario: usuario.nombre_usuario
        };
        
        const newToken = generateToken(tokenPayload);
        
        res.json({
            success: true,
            message: 'Token renovado',
            data: {
                token: newToken
            }
        });
        
    } catch (error) {
        console.error('- Error en refresh:', error.message);
        res.status(401).json({
            success: false,
            message: 'Refresh token inválido o expirado'
        });
    }
};

// ============================================
// CHANGE PASSWORD - CAMBIAR CONTRASEÑA
// ============================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const id_usuario = req.user.id_usuario; // Del middleware de autenticación
        
        // Validar datos
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva son requeridas'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Buscar usuario
        const usuario = await Usuario.findByEmail(req.user.correo);
        
        // Verificar contraseña actual
        const passwordMatch = await Usuario.verifyPassword(currentPassword, usuario.contrasena);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }
        
        // Cambiar contraseña
        await Usuario.changePassword(id_usuario, newPassword);
        
        console.log(`Contraseña cambiada: ${usuario.correo}`);
        
        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
        
    } catch (error) {
        console.error('- Error en changePassword:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña'
        });
    }
};

// ============================================
// LOGOUT - CERRAR SESIÓN
// ============================================
const logout = async (req, res) => {
    try {
        // En JWT no hay logout del lado del servidor
        // El cliente debe eliminar el token
        
        console.log(`Logout: ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
        
    } catch (error) {
        console.error('- Error en logout:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión'
        });
    }
};

// ============================================
// EXPORTAR CONTROLADORES
// ============================================

module.exports = {
    login,
    verify,
    refresh,
    changePassword,
    logout
};