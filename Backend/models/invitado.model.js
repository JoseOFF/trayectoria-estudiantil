const { pool } = require('../config/database');

/**
 * Obtener permisos de un usuario invitado
 * @param {number} id_usuario - ID del usuario invitado
 * @returns {Object|null} Permisos del invitado o null si no tiene
 */
const getPermisosInvitado = async (id_usuario) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                id_permiso,
                id_usuario,
                licenciaturas_permitidas,
                secciones_permitidas,
                fecha_asignacion,
                fecha_modificacion
            FROM permisos_invitado
            WHERE id_usuario = ?`,
            [id_usuario]
        );

        if (rows.length === 0) {
            return null;
        }

        // Parsear JSON a arrays
        const permisos = rows[0];
        permisos.licenciaturas_permitidas = JSON.parse(permisos.licenciaturas_permitidas || '[]');
        permisos.secciones_permitidas = permisos.secciones_permitidas 
            ? JSON.parse(permisos.secciones_permitidas) 
            : null;

        return permisos;
    } catch (error) {
        console.error('Error al obtener permisos de invitado:', error);
        throw error;
    }
};

/**
 * Crear permisos para un usuario invitado
 * @param {number} id_usuario - ID del usuario
 * @param {Array} licenciaturas - Array de IDs de licenciaturas
 * @param {Array|null} secciones - Array de nombres de secciones (opcional)
 * @returns {Object} Resultado de la inserción
 */
const crearPermisosInvitado = async (id_usuario, licenciaturas = [], secciones = null) => {
    try {
        const [result] = await pool.query(
            `INSERT INTO permisos_invitado 
            (id_usuario, licenciaturas_permitidas, secciones_permitidas)
            VALUES (?, ?, ?)`,
            [
                id_usuario,
                JSON.stringify(licenciaturas),
                secciones ? JSON.stringify(secciones) : null
            ]
        );

        return {
            id_permiso: result.insertId,
            id_usuario,
            licenciaturas_permitidas: licenciaturas,
            secciones_permitidas: secciones
        };
    } catch (error) {
        console.error('Error al crear permisos de invitado:', error);
        throw error;
    }
};

/**
 * Actualizar licenciaturas permitidas para un invitado
 * @param {number} id_usuario - ID del usuario
 * @param {Array} licenciaturas - Array de IDs de licenciaturas
 * @returns {boolean} true si se actualizó correctamente
 */
const actualizarPermisosLicenciaturas = async (id_usuario, licenciaturas) => {
    try {
        const [result] = await pool.query(
            `UPDATE permisos_invitado 
            SET licenciaturas_permitidas = ?,
                fecha_modificacion = CURRENT_TIMESTAMP
            WHERE id_usuario = ?`,
            [JSON.stringify(licenciaturas), id_usuario]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar licenciaturas de invitado:', error);
        throw error;
    }
};

/**
 * Actualizar secciones permitidas para un invitado (FASE 2)
 * @param {number} id_usuario - ID del usuario
 * @param {Array|null} secciones - Array de nombres de secciones
 * @returns {boolean} true si se actualizó correctamente
 */
const actualizarPermisosSecciones = async (id_usuario, secciones) => {
    try {
        const [result] = await pool.query(
            `UPDATE permisos_invitado 
            SET secciones_permitidas = ?,
                fecha_modificacion = CURRENT_TIMESTAMP
            WHERE id_usuario = ?`,
            [secciones ? JSON.stringify(secciones) : null, id_usuario]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar secciones de invitado:', error);
        throw error;
    }
};

/**
 * Eliminar permisos de un invitado
 * @param {number} id_usuario - ID del usuario
 * @returns {boolean} true si se eliminó correctamente
 */
const eliminarPermisosInvitado = async (id_usuario) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM permisos_invitado WHERE id_usuario = ?',
            [id_usuario]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al eliminar permisos de invitado:', error);
        throw error;
    }
};

/**
 * Listar todos los usuarios invitados con sus permisos
 * @returns {Array} Lista de invitados con permisos
 */
const listarInvitados = async () => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                u.id_usuario,
                u.nombre_usuario,
                u.correo,
                u.activo,
                pi.id_permiso,
                pi.licenciaturas_permitidas,
                pi.secciones_permitidas,
                pi.fecha_asignacion,
                pi.fecha_modificacion
            FROM usuarios u
            INNER JOIN permisos_invitado pi ON u.id_usuario = pi.id_usuario
            WHERE u.id_rol = (SELECT id_rol FROM roles WHERE nombre_rol = 'Invitado')
            ORDER BY u.nombre_usuario`
        );

        // Parsear JSON
        return rows.map(invitado => ({
            ...invitado,
            licenciaturas_permitidas: JSON.parse(invitado.licenciaturas_permitidas || '[]'),
            secciones_permitidas: invitado.secciones_permitidas 
                ? JSON.parse(invitado.secciones_permitidas) 
                : null
        }));
    } catch (error) {
        console.error('Error al listar invitados:', error);
        throw error;
    }
};

module.exports = {
    getPermisosInvitado,
    crearPermisosInvitado,
    actualizarPermisosLicenciaturas,
    actualizarPermisosSecciones,
    eliminarPermisosInvitado,
    listarInvitados
};