// ============================================
// MODELO DE SEGURIDAD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');

// ============================================
// ROLES Y PERMISOS
// ============================================

/**
 * Obtener todos los roles con sus permisos
 */
const getAllRoles = async () => {
    try {
        const [roles] = await pool.execute(`
            SELECT 
                r.id_rol,
                r.nombre_rol,
                r.descripcion,
                r.fecha_creacion,
                COUNT(DISTINCT rp.id_permiso) as total_permisos,
                COUNT(DISTINCT u.id_usuario) as total_usuarios
            FROM roles r
            LEFT JOIN rol_permiso rp ON r.id_rol = rp.id_rol
            LEFT JOIN usuarios u ON r.id_rol = u.id_rol
            GROUP BY r.id_rol, r.nombre_rol, r.descripcion, r.fecha_creacion
            ORDER BY r.nombre_rol
        `);
        
        return roles;
        
    } catch (error) {
        console.error('- Error en getAllRoles:', error);
        throw error;
    }
};

/**
 * Obtener un rol con sus permisos detallados
 */
const getRolById = async (id_rol) => {
    try {
        // Obtener datos del rol
        const [roles] = await pool.execute(
            `SELECT 
                id_rol,
                nombre_rol,
                descripcion,
                fecha_creacion
            FROM roles 
            WHERE id_rol = ?`,
            [id_rol]
        );
        
        if (roles.length === 0) return null;
        
        const rol = roles[0];
        
        // Obtener permisos del rol
        const [permisos] = await pool.execute(
            `SELECT 
                p.id_permiso,
                p.nombre_permiso,
                p.descripcion,
                rp.fecha_asignacion
            FROM permisos p
            INNER JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
            WHERE rp.id_rol = ?
            ORDER BY p.nombre_permiso`,
            [id_rol]
        );
        
        rol.permisos = permisos;
        
        return rol;
        
    } catch (error) {
        console.error('- Error en getRolById:', error);
        throw error;
    }
};

/**
 * Obtener todos los permisos disponibles
 */
const getAllPermisos = async () => {
    try {
        const [permisos] = await pool.execute(`
            SELECT 
                id_permiso,
                nombre_permiso,
                descripcion,
                fecha_creacion
            FROM permisos
            ORDER BY nombre_permiso
        `);
        
        return permisos;
        
    } catch (error) {
        console.error('- Error en getAllPermisos:', error);
        throw error;
    }
};

/**
 * Asignar permiso a un rol
 */
const asignarPermiso = async (id_rol, id_permiso) => {
    try {
        await pool.execute(
            `INSERT INTO rol_permiso (id_rol, id_permiso)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE id_rol = id_rol`,
            [id_rol, id_permiso]
        );
        
        return true;
        
    } catch (error) {
        console.error('- Error en asignarPermiso:', error);
        throw error;
    }
};

/**
 * Remover permiso de un rol
 */
const removerPermiso = async (id_rol, id_permiso) => {
    try {
        await pool.execute(
            `DELETE FROM rol_permiso 
            WHERE id_rol = ? AND id_permiso = ?`,
            [id_rol, id_permiso]
        );
        
        return true;
        
    } catch (error) {
        console.error('- Error en removerPermiso:', error);
        throw error;
    }
};

// ============================================
// AUDITORÍA
// ============================================

/**
 * Obtener historial de cambios con filtros
 */
const getHistorialCambios = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                hc.id_historial,
                hc.tabla_afectada,
                hc.id_registro_afectado,
                hc.tipo_operacion,
                hc.datos_anteriores,
                hc.datos_nuevos,
                hc.fecha_cambio,
                u.nombre_usuario,
                u.correo,
                r.nombre_rol
            FROM historial_cambios hc
            INNER JOIN usuarios u ON hc.id_usuario = u.id_usuario
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtro por usuario
        if (filters.id_usuario) {
            query += ` AND hc.id_usuario = ?`;
            params.push(filters.id_usuario);
        }
        
        // Filtro por tabla
        if (filters.tabla) {
            query += ` AND hc.tabla_afectada = ?`;
            params.push(filters.tabla);
        }
        
        // Filtro por tipo de operación
        if (filters.tipo_operacion) {
            query += ` AND hc.tipo_operacion = ?`;
            params.push(filters.tipo_operacion);
        }
        
        // Filtro por fecha desde
        if (filters.fecha_desde) {
            query += ` AND hc.fecha_cambio >= ?`;
            params.push(filters.fecha_desde);
        }
        
        // Filtro por fecha hasta
        if (filters.fecha_hasta) {
            query += ` AND hc.fecha_cambio <= ?`;
            params.push(filters.fecha_hasta);
        }
        
        query += ` ORDER BY hc.fecha_cambio DESC`;
        
        // Paginación
        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(filters.limit));
            
            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(parseInt(filters.offset));
            }
        }
        
        const [historial] = await pool.execute(query, params);
        
        // Contar total
        let countQuery = `
            SELECT COUNT(*) as total
            FROM historial_cambios hc
            WHERE 1=1
        `;
        
        const countParams = [];
        
        if (filters.id_usuario) {
            countQuery += ` AND hc.id_usuario = ?`;
            countParams.push(filters.id_usuario);
        }
        
        if (filters.tabla) {
            countQuery += ` AND hc.tabla_afectada = ?`;
            countParams.push(filters.tabla);
        }
        
        if (filters.tipo_operacion) {
            countQuery += ` AND hc.tipo_operacion = ?`;
            countParams.push(filters.tipo_operacion);
        }
        
        if (filters.fecha_desde) {
            countQuery += ` AND hc.fecha_cambio >= ?`;
            countParams.push(filters.fecha_desde);
        }
        
        if (filters.fecha_hasta) {
            countQuery += ` AND hc.fecha_cambio <= ?`;
            countParams.push(filters.fecha_hasta);
        }
        
        const [countResult] = await pool.execute(countQuery, countParams);
        
        return {
            historial,
            total: countResult[0].total,
            limit: parseInt(filters.limit) || null,
            offset: parseInt(filters.offset) || 0
        };
        
    } catch (error) {
        console.error('- Error en getHistorialCambios:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas de auditoría
 */
const getEstadisticasAuditoria = async () => {
    try {
        // Total de cambios por tipo de operación
        const [porOperacion] = await pool.execute(`
            SELECT 
                tipo_operacion,
                COUNT(*) as cantidad
            FROM historial_cambios
            GROUP BY tipo_operacion
            ORDER BY cantidad DESC
        `);
        
        // Total de cambios por tabla
        const [porTabla] = await pool.execute(`
            SELECT 
                tabla_afectada,
                COUNT(*) as cantidad
            FROM historial_cambios
            GROUP BY tabla_afectada
            ORDER BY cantidad DESC
            LIMIT 10
        `);
        
        // Usuarios más activos
        const [usuariosActivos] = await pool.execute(`
            SELECT 
                u.nombre_usuario,
                u.correo,
                r.nombre_rol,
                COUNT(hc.id_historial) as total_cambios
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN historial_cambios hc ON u.id_usuario = hc.id_usuario
            GROUP BY u.id_usuario, u.nombre_usuario, u.correo, r.nombre_rol
            HAVING total_cambios > 0
            ORDER BY total_cambios DESC
            LIMIT 10
        `);
        
        // Cambios recientes (últimos 7 días)
        const [cambiosRecientes] = await pool.execute(`
            SELECT 
                DATE(fecha_cambio) as fecha,
                COUNT(*) as cantidad
            FROM historial_cambios
            WHERE fecha_cambio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(fecha_cambio)
            ORDER BY fecha
        `);
        
        return {
            por_operacion: porOperacion,
            por_tabla: porTabla,
            usuarios_activos: usuariosActivos,
            cambios_recientes: cambiosRecientes
        };
        
    } catch (error) {
        console.error('- Error en getEstadisticasAuditoria:', error);
        throw error;
    }
};

/**
 * Obtener tablas disponibles para filtrar
 */
const getTablasDisponibles = async () => {
    try {
        const [tablas] = await pool.execute(`
            SELECT DISTINCT tabla_afectada
            FROM historial_cambios
            ORDER BY tabla_afectada
        `);
        
        return tablas.map(t => t.tabla_afectada);
        
    } catch (error) {
        console.error('- Error en getTablasDisponibles:', error);
        throw error;
    }
};

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

/**
 * Obtener configuración de seguridad del sistema
 */
const getConfiguracionSeguridad = async () => {
    try {
        // Total de usuarios activos
        const [totalUsuarios] = await pool.execute(
            'SELECT COUNT(*) as total FROM usuarios WHERE activo = TRUE'
        );
        
        // Total de usuarios por rol
        const [usuariosPorRol] = await pool.execute(`
            SELECT 
                r.nombre_rol,
                COUNT(u.id_usuario) as cantidad
            FROM roles r
            LEFT JOIN usuarios u ON r.id_rol = u.id_rol AND u.activo = TRUE
            GROUP BY r.id_rol, r.nombre_rol
            ORDER BY cantidad DESC
        `);
        
        // Últimos inicios de sesión (si tienes tabla de sesiones)
        // Por ahora retornamos info básica
        
        return {
            total_usuarios_activos: totalUsuarios[0].total,
            usuarios_por_rol: usuariosPorRol,
            fecha_consulta: new Date()
        };
        
    } catch (error) {
        console.error('- Error en getConfiguracionSeguridad:', error);
        throw error;
    }
};

// ============================================
// EXPORTAR MODELO
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
    getConfiguracionSeguridad
};