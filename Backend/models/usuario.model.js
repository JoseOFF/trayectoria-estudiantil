// ============================================
// MODELO DE USUARIO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { CORREO_SISTEMA, hashContrasena } = require('../utils/usuariosHelper');

// ============================================
// BUSCAR USUARIO POR ID
// ============================================
const findById = async (id_usuario) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                u.id_usuario,
                u.id_rol,
                u.nombre_usuario,
                u.correo,
                u.activo,
                u.fecha_registro,
                r.nombre_rol,
                r.descripcion as descripcion_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?`,
            [id_usuario]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error en findById:', error.message);
        throw error;
    }
};

// ============================================
// BUSCAR USUARIO POR EMAIL
// ============================================
const findByEmail = async (correo) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                u.id_usuario,
                u.id_rol,
                u.nombre_usuario,
                u.correo,
                u.contrasena,
                u.activo,
                u.fecha_registro,
                r.nombre_rol,
                r.descripcion as descripcion_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.correo = ?`,
            [correo]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error en findByEmail:', error.message);
        throw error;
    }
};

// ============================================
// BUSCAR USUARIO POR NOMBRE DE USUARIO
// ============================================
const findByUsername = async (nombre_usuario) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                u.id_usuario,
                u.id_rol,
                u.nombre_usuario,
                u.correo,
                u.contrasena,
                u.activo,
                u.fecha_registro,
                r.nombre_rol,
                r.descripcion as descripcion_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.nombre_usuario = ?`,
            [nombre_usuario]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error en findByUsername:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER PERMISOS DEL USUARIO
// ============================================
const getPermissions = async (id_usuario) => {
    try {
        const [rows] = await pool.execute(
            `SELECT DISTINCT
                p.id_permiso,
                p.nombre_permiso,
                p.descripcion
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            INNER JOIN rol_permiso rp ON r.id_rol = rp.id_rol
            INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
            WHERE u.id_usuario = ?`,
            [id_usuario]
        );
        
        return rows;
    } catch (error) {
        console.error('Error en getPermissions:', error.message);
        throw error;
    }
};

// ============================================
// CREAR NUEVO USUARIO
// ============================================
const create = async (userData) => {
    try {
        const { id_rol, nombre_usuario, correo, contrasena } = userData;
        
        // Encriptar contraseña
        const hashedPassword = await hashContrasena(contrasena);
        
        const [result] = await pool.execute(
            `INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
            VALUES (?, ?, ?, ?, TRUE)`,
            [id_rol, nombre_usuario, correo, hashedPassword]
        );
        
        return {
            id_usuario: result.insertId,
            ...userData,
            contrasena: undefined
        };
    } catch (error) {
        console.error('Error en create:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('correo')) {
                throw new Error('El correo ya está registrado');
            }
            if (error.message.includes('nombre_usuario')) {
                throw new Error('El nombre de usuario ya está registrado');
            }
        }
        
        throw error;
    }
};

// ============================================
// ACTUALIZAR USUARIO
// ============================================
const update = async (id_usuario, userData) => {
    try {
        const { nombre_usuario, correo, activo } = userData;
        
        await pool.execute(
            `UPDATE usuarios 
            SET nombre_usuario = ?, correo = ?, activo = ?
            WHERE id_usuario = ?`,
            [nombre_usuario, correo, activo, id_usuario]
        );
        
        return await findById(id_usuario);
    } catch (error) {
        console.error('Error en update:', error.message);
        throw error;
    }
};

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
const changePassword = async (id_usuario, newPassword) => {
    try {
        // Encriptar nueva contraseña
        const hashedPassword = await hashContrasena(newPassword);
        
        await pool.execute(
            `UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?`,
            [hashedPassword, id_usuario]
        );
        
        return true;
    } catch (error) {
        console.error('Error en changePassword:', error.message);
        throw error;
    }
};

// ============================================
// VERIFICAR CONTRASEÑA
// ============================================
const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error en verifyPassword:', error.message);
        throw error;
    }
};

// ============================================
// ACTIVAR/DESACTIVAR USUARIO
// ============================================
const toggleActive = async (id_usuario, activo) => {
    try {
        await pool.execute(
            `UPDATE usuarios SET activo = ? WHERE id_usuario = ?`,
            [activo, id_usuario]
        );
        
        return await findById(id_usuario);
    } catch (error) {
        console.error('Error en toggleActive:', error.message);
        throw error;
    }
};

// ============================================
// ELIMINAR USUARIO (SOFT DELETE)
// ============================================
const remove = async (id_usuario) => {
    try {
        // En lugar de eliminar, desactivamos el usuario
        await pool.execute(
            `UPDATE usuarios SET activo = FALSE WHERE id_usuario = ?`,
            [id_usuario]
        );
        
        return true;
    } catch (error) {
        console.error('Error en remove:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER TODOS LOS USUARIOS
// ============================================
const getAll = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                u.id_usuario,
                u.id_rol,
                u.nombre_usuario,
                u.correo,
                u.activo,
                u.fecha_registro,
                r.nombre_rol,
                r.descripcion as descripcion_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.correo <> ?
        `;

        // El usuario interno "Sistema" no se muestra en la lista
        const params = [CORREO_SISTEMA];
        
        // Filtro por rol
        if (filters.id_rol) {
            query += ` AND u.id_rol = ?`;
            params.push(filters.id_rol);
        }
        
        // Filtro por estado activo
        if (filters.activo !== undefined) {
            query += ` AND u.activo = ?`;
            params.push(filters.activo);
        }
        
        // Búsqueda por nombre o correo
        if (filters.search) {
            query += ` AND (u.nombre_usuario LIKE ? OR u.correo LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        
        query += ` ORDER BY u.fecha_registro DESC`;
        
        // Paginación
        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(filters.limit));
            
            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(parseInt(filters.offset));
            }
        }
        
        const [rows] = await pool.execute(query, params);

        // Convertir activo a boolean explícitamente
        const usuariosConvertidos = rows.map(usuario => ({
            ...usuario,
            activo: Boolean(usuario.activo)
        }));

        return usuariosConvertidos;
    } catch (error) {
        console.error('Error en getAll:', error.message);
        throw error;
    }
};

// ============================================
// VERIFICAR SI EL USUARIO TIENE UN PERMISO
// ============================================
const hasPermission = async (id_usuario, nombre_permiso) => {
    try {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as tiene_permiso
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            INNER JOIN rol_permiso rp ON r.id_rol = rp.id_rol
            INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
            WHERE u.id_usuario = ? AND p.nombre_permiso = ?`,
            [id_usuario, nombre_permiso]
        );
        
        return rows[0].tiene_permiso > 0;
    } catch (error) {
        console.error('Error en hasPermission:', error.message);
        throw error;
    }
};

/**
 * Eliminar usuario permanentemente de la base de datos
 * Maneja diferentes tipos de usuarios: Alumno, Docente, Administrador
 * PRECAUCIÓN: Esta acción es IRREVERSIBLE
 */
const deletePermanently = async (id_usuario) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        console.log('═══════════════════════════════════════');
        console.log('ELIMINACIÓN PERMANENTE DE USUARIO');
        console.log('ID Usuario:', id_usuario);
        
        // 1. Obtener información del usuario
        const [usuario] = await connection.execute(
            `SELECT u.*, r.nombre_rol 
             FROM usuarios u 
             INNER JOIN roles r ON u.id_rol = r.id_rol
             WHERE u.id_usuario = ?`,
            [id_usuario]
        );
        
        if (usuario.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        
        const rol = usuario[0].nombre_rol;
        console.log('Rol del usuario:', rol);
        
        // 2. Obtener o crear usuario "Sistema" para reasignar referencias
        let [usuarioSistema] = await connection.execute(
            'SELECT id_usuario FROM usuarios WHERE correo = ?',
            [CORREO_SISTEMA]
        );
        
        let id_usuario_sistema;
        
        if (usuarioSistema.length === 0) {
            const hashedPassword = await hashContrasena('SISTEMA_NO_ACCESO');
            
            const [result] = await connection.execute(
                `INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
                 VALUES (1, 'Sistema', ?, ?, FALSE)`,
                [CORREO_SISTEMA, hashedPassword]
            );
            id_usuario_sistema = result.insertId;
            console.log('Usuario sistema creado');
        } else {
            id_usuario_sistema = usuarioSistema[0].id_usuario;
        }
        
        // 3. REASIGNAR referencias según el tipo de usuario
        
        // 3.1 Actualizar documentos subidos por este usuario
        await connection.execute(
            'UPDATE documentos SET subido_por = NULL WHERE subido_por = ?',
            [id_usuario]
        );
        console.log('Referencias en documentos actualizadas');
        
        // 3.2 Reasignar historial de cambios al usuario sistema
        await connection.execute(
            `UPDATE historial_cambios 
             SET id_usuario = ?,
                 datos_nuevos = JSON_SET(
                     COALESCE(datos_nuevos, '{}'), 
                     '$.usuario_original_eliminado', 
                     ?,
                     '$.fecha_eliminacion',
                     NOW()
                 )
             WHERE id_usuario = ?`,
            [id_usuario_sistema, id_usuario, id_usuario]
        );
        console.log('Historial de cambios reasignado');
        
        // 4. ELIMINAR según el tipo de usuario
        
        if (rol === 'Alumno') {
            console.log('Eliminando ALUMNO y todas sus referencias...');
            
            // Obtener id_alumno
            const [alumno] = await connection.execute(
                'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
                [id_usuario]
            );
            
            if (alumno.length > 0) {
                const id_alumno = alumno[0].id_alumno;
                
                // Las tablas con ON DELETE CASCADE se eliminarán automáticamente:
                // - datos_salud, familiares, datos_socioeconomicos, becas
                // - datos_academicos, semestre_promedio, desempeno_academico
                // - alumno_habilidad, certificaciones, movilidad_academica
                // - practicas_profesionales, incidentes, documentos
                
                // Eliminar alumno (esto eliminará todo en cascada)
                await connection.execute(
                    'DELETE FROM alumnos WHERE id_alumno = ?',
                    [id_alumno]
                );
                
                console.log('Alumno eliminado (con cascada)');
            }
        } 
        else if (rol === 'Docente') {
            console.log('Eliminando DOCENTE y todas sus referencias...');
            
            // Obtener id_docente
            const [docente] = await connection.execute(
                'SELECT id_docente FROM docentes WHERE id_usuario = ?',
                [id_usuario]
            );
            
            if (docente.length > 0) {
                const id_docente = docente[0].id_docente;
                
                // Actualizar incidentes reportados por este docente
                await connection.execute(
                    'UPDATE incidentes SET id_docente = NULL WHERE id_docente = ?',
                    [id_docente]
                );
                
                // Eliminar relaciones de licenciaturas
                await connection.execute(
                    'DELETE FROM docente_licenciatura WHERE id_docente = ?',
                    [id_docente]
                );
                
                // Eliminar docente
                await connection.execute(
                    'DELETE FROM docentes WHERE id_docente = ?',
                    [id_docente]
                );
                
                console.log('Docente eliminado');
            }
        }
        else {
            console.log('Eliminando ADMINISTRADOR...');
            // Los administradores no tienen tablas adicionales
        }
        
        // 5. Finalmente, eliminar el usuario
        await connection.execute(
            'DELETE FROM usuarios WHERE id_usuario = ?',
            [id_usuario]
        );
        
        await connection.commit();
        connection.release();
        
        console.log(`Usuario eliminado permanentemente - ID: ${id_usuario}, Rol: ${rol}`);
        console.log('═══════════════════════════════════════');
        
        return true;
        
    } catch (error) {
        await connection.rollback();
        connection.release();
        
        console.error('- Error en deletePermanently:', error.message);
        console.log('═══════════════════════════════════════');
        throw error;
    }
};


// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    findById,
    findByEmail,
    findByUsername,
    getPermissions,
    create,
    update,
    changePassword,
    verifyPassword,
    toggleActive,
    remove,
    getAll,
    deletePermanently,
    hasPermission
};