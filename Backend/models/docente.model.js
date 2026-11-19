// ============================================
// MODELO DE DOCENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');
const { CORREO_SISTEMA, errorDuplicado, nombreUsuarioDesde, hashContrasena } = require('../utils/usuariosHelper');

// ============================================
// OBTENER TODOS LOS DOCENTES
// ============================================
const getAll = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                d.id_docente,
                d.id_usuario,
                d.nombre_completo,
                d.area_asignada,
                d.activo,
                d.fecha_registro,
                u.correo,
                p.nombre_plantel,
                p.id_plantel,
                -- Licenciaturas asignadas
                GROUP_CONCAT(
                    DISTINCT l.nombre_licenciatura 
                    ORDER BY l.nombre_licenciatura 
                    SEPARATOR ', '
                ) as licenciaturas_asignadas,
                GROUP_CONCAT(
                    DISTINCT l.id_licenciatura 
                    ORDER BY l.nombre_licenciatura
                ) as ids_licenciaturas
            FROM docentes d
            INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
            LEFT JOIN planteles p ON d.id_plantel = p.id_plantel
            LEFT JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
            LEFT JOIN licenciaturas l ON dl.id_licenciatura = l.id_licenciatura
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtro por estado activo
        if (filters.activo !== undefined) {
            query += ` AND d.activo = ?`;
            params.push(filters.activo);
        }
        
        // Filtro por área asignada
        if (filters.area) {
            query += ` AND d.area_asignada LIKE ?`;
            params.push(`%${filters.area}%`);
        }
        
        // Filtro por plantel
        if (filters.id_plantel) {
            query += ` AND d.id_plantel = ?`;
            params.push(filters.id_plantel);
        }
        
        // Búsqueda por nombre o correo
        if (filters.search) {
            query += ` AND (d.nombre_completo LIKE ? OR u.correo LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        query += ` GROUP BY d.id_docente, d.id_usuario, d.nombre_completo, 
                   d.area_asignada, d.activo, d.fecha_registro, 
                   u.correo, p.nombre_plantel, p.id_plantel`;
        
        query += ` ORDER BY d.nombre_completo ASC`;
        
        // Paginación
        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(filters.limit));
            
            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(parseInt(filters.offset));
            }
        }
        
        const [docentes] = await pool.execute(query, params);
        
        // Contar total sin paginación
        let countQuery = `
            SELECT COUNT(DISTINCT d.id_docente) as total
            FROM docentes d
            INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
            WHERE 1=1
        `;
        
        const countParams = [];
        
        if (filters.activo !== undefined) {
            countQuery += ` AND d.activo = ?`;
            countParams.push(filters.activo);
        }
        
        if (filters.area) {
            countQuery += ` AND d.area_asignada LIKE ?`;
            countParams.push(`%${filters.area}%`);
        }
        
        if (filters.id_plantel) {
            countQuery += ` AND d.id_plantel = ?`;
            countParams.push(filters.id_plantel);
        }
        
        if (filters.search) {
            countQuery += ` AND (d.nombre_completo LIKE ? OR u.correo LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            countParams.push(searchTerm, searchTerm);
        }
        
        const [countResult] = await pool.execute(countQuery, countParams);
        
        return {
            docentes,
            total: countResult[0].total,
            limit: parseInt(filters.limit) || null,
            offset: parseInt(filters.offset) || 0
        };
        
    } catch (error) {
        console.error('- Error en getAll:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER DOCENTE POR ID
// ============================================
const findById = async (id_docente) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                d.id_docente,
                d.id_usuario,
                d.nombre_completo,
                d.area_asignada,
                d.activo,
                d.fecha_registro,
                d.id_plantel,
                u.correo,
                u.nombre_usuario,
                p.nombre_plantel
            FROM docentes d
            INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
            LEFT JOIN planteles p ON d.id_plantel = p.id_plantel
            WHERE d.id_docente = ?`,
            [id_docente]
        );
        
        if (rows.length === 0) return null;
        
        const docente = rows[0];
        
        // Obtener licenciaturas asignadas
        const [licenciaturas] = await pool.execute(
            `SELECT 
                l.id_licenciatura,
                l.nombre_licenciatura,
                dl.fecha_asignacion
            FROM docente_licenciatura dl
            INNER JOIN licenciaturas l ON dl.id_licenciatura = l.id_licenciatura
            WHERE dl.id_docente = ?
            ORDER BY l.nombre_licenciatura`,
            [id_docente]
        );
        
        docente.licenciaturas = licenciaturas;
        
        return docente;
        
    } catch (error) {
        console.error('- Error en findById:', error.message);
        throw error;
    }
};

// ============================================
// CREAR NUEVO DOCENTE
// ============================================
const create = async (docenteData) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { nombre_completo, correo, contrasena, area_asignada, id_plantel, licenciaturas } = docenteData;
        
        // 1. Crear usuario con rol de Docente (id_rol = 2)
        const hashedPassword = await hashContrasena(contrasena);
        
        const [usuarioResult] = await connection.execute(
            `INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
            VALUES (2, ?, ?, ?, TRUE)`,
            // nombre_usuario = nombre del docente (antes se guardaba el correo)
            [nombreUsuarioDesde(nombre_completo), correo, hashedPassword]
        );
        
        const id_usuario = usuarioResult.insertId;
        
        // 2. Crear docente
        const [docenteResult] = await connection.execute(
            `INSERT INTO docentes (id_usuario, id_plantel, nombre_completo, area_asignada, activo)
            VALUES (?, ?, ?, ?, TRUE)`,
            [id_usuario, id_plantel || null, nombre_completo, area_asignada || null]
        );
        
        const id_docente = docenteResult.insertId;
        
        // 3. Asignar licenciaturas si se proporcionaron
        if (licenciaturas && Array.isArray(licenciaturas) && licenciaturas.length > 0) {
            for (const id_licenciatura of licenciaturas) {
                await connection.execute(
                    `INSERT INTO docente_licenciatura (id_docente, id_licenciatura, fecha_asignacion)
                    VALUES (?, ?, CURDATE())`,
                    [id_docente, id_licenciatura]
                );
            }
        }
        
        await connection.commit();
        connection.release();
        
        return await findById(id_docente);
        
    } catch (error) {
        await connection.rollback();
        connection.release();
        
        console.error('- Error en create:', error.message);
        
        // Dato repetido: el error dice qué campo (nombre o correo)
        if (error.code === 'ER_DUP_ENTRY') {
            throw errorDuplicado(error);
        }
        
        throw error;
    }
};

// ============================================
// ACTUALIZAR DOCENTE
// ============================================
const update = async (id_docente, docenteData) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { nombre_completo, correo, area_asignada, id_plantel, activo, licenciaturas } = docenteData;
        
        // 1. Obtener id_usuario del docente
        const [docente] = await connection.execute(
            'SELECT id_usuario FROM docentes WHERE id_docente = ?',
            [id_docente]
        );
        
        if (docente.length === 0) {
            throw new Error('Docente no encontrado');
        }
        
        const id_usuario = docente[0].id_usuario;
        
        // 2. Actualizar usuario
        await connection.execute(
            `UPDATE usuarios 
            SET correo = ?, nombre_usuario = ?
            WHERE id_usuario = ?`,
            [correo, nombreUsuarioDesde(nombre_completo), id_usuario]
        );
        
        // 3. Actualizar docente
        await connection.execute(
            `UPDATE docentes 
            SET nombre_completo = ?,
                area_asignada = ?,
                id_plantel = ?,
                activo = ?
            WHERE id_docente = ?`,
            [nombre_completo, area_asignada, id_plantel, activo, id_docente]
        );
        
        // 4. Actualizar licenciaturas si se proporcionaron
        if (licenciaturas && Array.isArray(licenciaturas)) {
            // Eliminar asignaciones anteriores
            await connection.execute(
                'DELETE FROM docente_licenciatura WHERE id_docente = ?',
                [id_docente]
            );
            
            // Insertar nuevas asignaciones
            for (const id_licenciatura of licenciaturas) {
                await connection.execute(
                    `INSERT INTO docente_licenciatura (id_docente, id_licenciatura, fecha_asignacion)
                    VALUES (?, ?, CURDATE())`,
                    [id_docente, id_licenciatura]
                );
            }
        }
        
        await connection.commit();
        connection.release();
        
        return await findById(id_docente);
        
    } catch (error) {
        await connection.rollback();
        connection.release();
        
        console.error('- Error en update:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            throw errorDuplicado(error);
        }

        throw error;
    }
};

// ============================================
// ACTIVAR/DESACTIVAR DOCENTE
// ============================================
const toggleActive = async (id_docente, activo) => {
    try {
        // Validar parámetros
        if (!id_docente) {
            throw new Error('ID de docente es requerido');
        }
        
        if (activo === undefined || activo === null) {
            throw new Error('Estado activo es requerido');
        }
        
        
        // 1. Actualizar docente
        const [resultDocente] = await pool.execute(
            `UPDATE docentes SET activo = ? WHERE id_docente = ?`,
            [activo, id_docente]
        );
        

        
        if (resultDocente.affectedRows === 0) {
            throw new Error('Docente no encontrado');
        }
        
        // 2. Actualizar usuario asociado
        const [resultUsuario] = await pool.execute(
            `UPDATE usuarios u
             INNER JOIN docentes d ON u.id_usuario = d.id_usuario
             SET u.activo = ?
             WHERE d.id_docente = ?`,
            [activo, id_docente]
        );
        
        
        // 3. Obtener y retornar el docente actualizado
        const docenteActualizado = await findById(id_docente);
        

        
        return docenteActualizado;
        
    } catch (error) {
        console.error('ERROR en toggleActive (MODEL):');
        console.error('   - Mensaje:', error.message);
        console.error('   - Stack:', error.stack);
  
        throw error;
    }
};

// ============================================
// ELIMINAR DOCENTE (SOFT DELETE)
// ============================================
const remove = async (id_docente) => {
    try {
        // Desactivar en lugar de eliminar
        await pool.execute(
            `UPDATE docentes SET activo = FALSE WHERE id_docente = ?`,
            [id_docente]
        );
        
        // Desactivar usuario asociado
        await pool.execute(
            `UPDATE usuarios u
            INNER JOIN docentes d ON u.id_usuario = d.id_usuario
            SET u.activo = FALSE
            WHERE d.id_docente = ?`,
            [id_docente]
        );
        
        return true;
        
    } catch (error) {
        console.error('- Error en remove:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER ÁREAS DISPONIBLES
// ============================================
const getAreas = async () => {
    try {
        const [rows] = await pool.execute(
            `SELECT DISTINCT area_asignada 
            FROM docentes 
            WHERE area_asignada IS NOT NULL 
            ORDER BY area_asignada`
        );
        
        return rows.map(row => row.area_asignada);
        
    } catch (error) {
        console.error('- Error en getAreas:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER PLANTELES
// ============================================
const getPlanteles = async () => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                id_plantel,
                nombre_plantel,
                telefono,
                correo
            FROM planteles
            ORDER BY nombre_plantel`
        );
        
        return rows;
        
    } catch (error) {
        console.error('- Error en getPlanteles:', error.message);
        throw error;
    }
};


// ============================================
// ELIMINACION DEFINITIVA DE UN DOCENTE
// ============================================
const deletePermanently = async (id_docente) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Obtener id_usuario asociado antes de eliminar
        const [docente] = await connection.execute(
            'SELECT id_usuario FROM docentes WHERE id_docente = ?',
            [id_docente]
        );
        
        if (docente.length === 0) {
            throw new Error('Docente no encontrado');
        }
        
        const id_usuario = docente[0].id_usuario;
        
        // 2. OBTENER O CREAR USUARIO "SISTEMA" PARA AUDITORÍA
        let [usuarioSistema] = await connection.execute(
            'SELECT id_usuario FROM usuarios WHERE correo = ?',
            [CORREO_SISTEMA]
        );
        
        let id_usuario_sistema;
        
        if (usuarioSistema.length === 0) {
            // Crear usuario sistema si no existe
            const [result] = await connection.execute(
                `INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
                 VALUES (1, 'Sistema', ?, 'N/A', FALSE)`,
                [CORREO_SISTEMA]
            );
            id_usuario_sistema = result.insertId;
            console.log('Usuario sistema creado para auditoría');
        } else {
            id_usuario_sistema = usuarioSistema[0].id_usuario;
        }
        
        // 3. ACTUALIZAR REFERENCIAS en otras tablas ANTES de eliminar
        
        // 3.1 Actualizar documentos que fueron subidos por este usuario
        await connection.execute(
            'UPDATE documentos SET subido_por = NULL WHERE subido_por = ?',
            [id_usuario]
        );
        
        // 3.2 Actualizar incidentes reportados por este docente
        await connection.execute(
            'UPDATE incidentes SET id_docente = NULL WHERE id_docente = ?',
            [id_docente]
        );
        
        // 3.3 Reasignar registros de historial_cambios al usuario sistema
        // Y marcar que el usuario original fue eliminado
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
        
        // 3. Eliminar relaciones de licenciaturas
        await connection.execute(
            'DELETE FROM docente_licenciatura WHERE id_docente = ?',
            [id_docente]
        );
        
        // 4. Eliminar el docente
        await connection.execute(
            'DELETE FROM docentes WHERE id_docente = ?',
            [id_docente]
        );
        
        // 5. Finalmente, eliminar el usuario asociado
        await connection.execute(
            'DELETE FROM usuarios WHERE id_usuario = ?',
            [id_usuario]
        );
        
        await connection.commit();
        connection.release();
        
        console.log(`Docente y usuario eliminados permanentemente - ID Docente: ${id_docente}, ID Usuario: ${id_usuario}`);
        
        return true;
        
    } catch (error) {
        await connection.rollback();
        connection.release();
        
        console.error('- Error en deletePermanently:', error.message);
        throw error;
    }
};




// ============================================
// EXPORTAR MODELO
// ============================================
module.exports = {
    getAll,
    findById,
    create,
    update,
    toggleActive,
    remove,
    getAreas,
    deletePermanently,
    getPlanteles
};