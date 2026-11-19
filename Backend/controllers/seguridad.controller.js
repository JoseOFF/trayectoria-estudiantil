// ============================================
// CONTROLADOR DE SEGURIDAD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Seguridad = require('../models/seguridad.model');

// ============================================
// ROLES Y PERMISOS
// ============================================

/**
 * Obtener todos los roles
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await Seguridad.getAllRoles();
        
        res.json({
            success: true,
            data: roles
        });
        
    } catch (error) {
        console.error('- Error al obtener roles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los roles',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtener un rol por ID
 */
const getRolById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rol = await Seguridad.getRolById(parseInt(id));
        
        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: rol
        });
        
    } catch (error) {
        console.error('- Error al obtener rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el rol',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtener todos los permisos
 */
const getAllPermisos = async (req, res) => {
    try {
        const permisos = await Seguridad.getAllPermisos();
        
        res.json({
            success: true,
            data: permisos
        });
        
    } catch (error) {
        console.error('- Error al obtener permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los permisos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Asignar permiso a un rol
 */
const asignarPermiso = async (req, res) => {
    try {
        const { id_rol, id_permiso } = req.body;
        
        if (!id_rol || !id_permiso) {
            return res.status(400).json({
                success: false,
                message: 'ID de rol y permiso son requeridos'
            });
        }
        
        await Seguridad.asignarPermiso(id_rol, id_permiso);
        
        res.json({
            success: true,
            message: 'Permiso asignado exitosamente'
        });
        
    } catch (error) {
        console.error('- Error al asignar permiso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar el permiso',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Remover permiso de un rol
 */
const removerPermiso = async (req, res) => {
    try {
        const { id_rol, id_permiso } = req.body;
        
        if (!id_rol || !id_permiso) {
            return res.status(400).json({
                success: false,
                message: 'ID de rol y permiso son requeridos'
            });
        }
        
        await Seguridad.removerPermiso(id_rol, id_permiso);
        
        res.json({
            success: true,
            message: 'Permiso removido exitosamente'
        });
        
    } catch (error) {
        console.error('- Error al remover permiso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al remover el permiso',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// AUDITORÍA
// ============================================

/**
 * Obtener historial de cambios
 */
const getHistorialCambios = async (req, res) => {
    try {
        const filters = {
            id_usuario: req.query.id_usuario,
            tabla: req.query.tabla,
            tipo_operacion: req.query.tipo_operacion,
            fecha_desde: req.query.fecha_desde,
            fecha_hasta: req.query.fecha_hasta,
            limit: req.query.limit || 50,
            offset: req.query.offset || 0
        };
        
        const result = await Seguridad.getHistorialCambios(filters);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('- Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de cambios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtener estadísticas de auditoría
 */
const getEstadisticasAuditoria = async (req, res) => {
    try {
        const estadisticas = await Seguridad.getEstadisticasAuditoria();
        
        res.json({
            success: true,
            data: estadisticas
        });
        
    } catch (error) {
        console.error('- Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas de auditoría',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtener tablas disponibles
 */
const getTablasDisponibles = async (req, res) => {
    try {
        const tablas = await Seguridad.getTablasDisponibles();
        
        res.json({
            success: true,
            data: tablas
        });
        
    } catch (error) {
        console.error('- Error al obtener tablas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las tablas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Obtener configuración de seguridad
 */
const getConfiguracion = async (req, res) => {
    try {
        const config = await Seguridad.getConfiguracionSeguridad();
        
        res.json({
            success: true,
            data: config
        });
        
    } catch (error) {
        console.error('- Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la configuración',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


/**
 * Ejecutar backup manual del sistema
 */
const ejecutarBackupManual = async (req, res) => {
    try {
        console.log('- Iniciando backup manual del sistema...');
        
        const { exec } = require('child_process');
        const path = require('path');
        
        // Ruta al script de backup: BACKUP_SCRIPT del .env (no viene en el repositorio)
        const backupScript = process.env.BACKUP_SCRIPT;
        
        // Verificar que está configurado y que existe el script
        const fs = require('fs');
        if (!backupScript || !fs.existsSync(backupScript)) {
            console.error(`- Script de backup no encontrado: ${backupScript}`);
            return res.status(500).json({
                success: false,
                message: 'Respaldo manual no configurado: revisa BACKUP_SCRIPT en el .env del servidor'
            });
        }
        
        // Obtener información del usuario que ejecuta el backup
        const usuarioId = req.user.id_usuario;
        const usuarioNombre = req.user.nombre_usuario;
        
        console.log(`- Backup solicitado por: ${usuarioNombre} (ID: ${usuarioId})`);
        
        // Ejecutar el script de backup (tipo "manual")
        const comando = `bash "${backupScript}" manual`;
        
        console.log(`- Ejecutando comando: ${comando}`);
        
        // Ejecutar de forma asíncrona
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error(`- Error al ejecutar backup: ${error.message}`);
                console.error(`- stderr: ${stderr}`);
                return;
            }
            
            console.log('- Backup manual completado exitosamente');
            console.log(`- stdout: ${stdout}`);
            
            // Registrar en auditoría (opcional)
            // Puedes agregar registro a la tabla de auditoría si lo deseas
        });
        
        // Responder inmediatamente (el backup se ejecuta en segundo plano)
        res.json({
            success: true,
            message: 'Backup iniciado correctamente. Recibirás una notificación por correo cuando finalice.',
            data: {
                iniciado_por: usuarioNombre,
                fecha_hora: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('- Error al ejecutar backup manual:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar el backup del sistema',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// EXPORTAR CONTROLADOR
// ============================================
module.exports = {
    // Roles y Permisos
    getAllRoles,
    getRolById,
    getAllPermisos,
    asignarPermiso,
    removerPermiso,
    
    // Auditoría
    getHistorialCambios,
    getEstadisticasAuditoria,
    getTablasDisponibles,
    
    // Configuración
    getConfiguracion,

    // Backup Manual
    ejecutarBackupManual
};