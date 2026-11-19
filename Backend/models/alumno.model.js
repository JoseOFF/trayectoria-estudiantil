// ============================================
// MODELO DE ALUMNO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');

// ============================================
// OBTENER TODOS LOS ALUMNOS
// ============================================
const getAll = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                a.id_alumno,
                a.matricula,
                a.nombre_completo,
                a.curp,
                a.fecha_nacimiento,
                a.correo_institucional,
                a.correo_personal,
                a.celular,
                a.semestre_actual,
                a.generacion,
                a.status_alumno,
                l.nombre_licenciatura,
                l.id_licenciatura,
                a.fecha_registro
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            WHERE 1=1
        `;
        
        const params = [];
        
        // ============================================
        // Filtro por múltiples licenciaturas (para INVITADOS)
        // ============================================
        if (filters.licenciaturas_invitado && filters.licenciaturas_invitado.length > 0) {
            const placeholders = filters.licenciaturas_invitado.map(() => '?').join(',');
            query += ` AND a.id_licenciatura IN (${placeholders})`;
            params.push(...filters.licenciaturas_invitado);
        }
        // ============================================
        // Filtro por múltiples licenciaturas (para DOCENTES)
        // ============================================
        else if (filters.licenciaturas_docente && filters.licenciaturas_docente.length > 0) {
            const placeholders = filters.licenciaturas_docente.map(() => '?').join(',');
            query += ` AND a.id_licenciatura IN (${placeholders})`;
            params.push(...filters.licenciaturas_docente);
        }
        // Filtro por una sola licenciatura (para filtros del usuario)
        else if (filters.id_licenciatura) {
            query += ` AND a.id_licenciatura = ?`;
            params.push(filters.id_licenciatura);
        }
        
        // Filtro por generación
        if (filters.generacion) {
            query += ` AND a.generacion = ?`;
            params.push(filters.generacion);
        }
        
        // Filtro por status
        if (filters.status) {
            query += ` AND a.status_alumno = ?`;
            params.push(filters.status);
        }
        
        // Filtro por semestre
        if (filters.semestre) {
            query += ` AND a.semestre_actual = ?`;
            params.push(filters.semestre);
        }
        
        // Búsqueda por nombre, matrícula o CURP
        if (filters.search) {
            query += ` AND (
                a.nombre_completo LIKE ? OR 
                a.matricula LIKE ? OR 
                a.curp LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY a.fecha_registro DESC`;
        
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
        return rows;
    } catch (error) {
        console.error('- Error en getAll:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER ALUMNO POR ID
// ============================================
const findById = async (id_alumno) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                a.*,
                l.nombre_licenciatura,
                l.numero_semestres,
                u.correo as correo_usuario,
                u.activo as cuenta_activa
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
            WHERE a.id_alumno = ?`,
            [id_alumno]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('- Error en findById:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER ALUMNO POR MATRÍCULA
// ============================================
const findByMatricula = async (matricula) => {
    try {
        const [rows] = await pool.execute(
            `SELECT * FROM alumnos WHERE matricula = ?`,
            [matricula]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('- Error en findByMatricula:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER ALUMNO POR CURP
// ============================================
const findByCurp = async (curp) => {
    try {
        const [rows] = await pool.execute(
            `SELECT * FROM alumnos WHERE curp = ?`,
            [curp]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('- Error en findByCurp:', error.message);
        throw error;
    }
};

// ============================================
// CREAR ALUMNO (usando procedimiento almacenado)
// ============================================
const create = async (alumnoData) => {
    try {
        const {
            nombre_completo,
            curp,
            fecha_nacimiento,
            correo_personal,
            id_licenciatura,
            generacion
        } = alumnoData;
        
        // Llamar al procedimiento almacenado sp_registrar_alumno
        const [result] = await pool.execute(
            `CALL sp_registrar_alumno(?, ?, ?, ?, ?, ?, @resultado, @id_alumno, @matricula)`,
            [
                nombre_completo,
                curp,
                fecha_nacimiento,
                correo_personal,
                id_licenciatura,
                generacion || new Date().getFullYear()
            ]
        );
        
        // Obtener los valores de salida
        const [output] = await pool.execute(
            'SELECT @resultado as resultado, @id_alumno as id_alumno, @matricula as matricula'
        );
        
        if (output[0].resultado.includes('ERROR')) {
            throw new Error(output[0].resultado);
        }
        
        return {
            id_alumno: output[0].id_alumno,
            matricula: output[0].matricula,
            mensaje: output[0].resultado
        };
        
    } catch (error) {
        console.error('- Error en create:', error.message);
        
        if (error.message.includes('Duplicate entry')) {
            if (error.message.includes('curp')) {
                throw new Error('El CURP ya está registrado');
            }
            if (error.message.includes('matricula')) {
                throw new Error('La matrícula ya está registrada');
            }
        }
        
        throw error;
    }
};

// ============================================
// ACTUALIZAR DATOS BÁSICOS DEL ALUMNO
// ============================================
const update = async (id_alumno, alumnoData) => {
    try {
        const {
            nombre_completo,
            curp,
            fecha_nacimiento,
            correo_personal,
            celular,
            telefono_emergencia,
            estado_civil,
            semestre_actual,
            id_licenciatura,
            generacion,
            status_alumno
        } = alumnoData;
        
        await pool.execute(
            `UPDATE alumnos SET 
                nombre_completo = ?,
                curp = ?,
                fecha_nacimiento = ?,
                correo_personal = ?,
                celular = ?,
                telefono_emergencia = ?,
                estado_civil = ?,
                semestre_actual = ?,
                id_licenciatura = ?,
                generacion = ?,
                status_alumno = ?
            WHERE id_alumno = ?`,
            [
                nombre_completo,
                curp,
                fecha_nacimiento,
                correo_personal,
                celular,
                telefono_emergencia,
                estado_civil,
                semestre_actual,
                id_licenciatura,
                generacion,
                status_alumno,
                id_alumno
            ]
        );
        
        return await findById(id_alumno);
        
    } catch (error) {
        console.error('- Error en update:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER EXPEDIENTE COMPLETO
// ============================================
// ============================================
// OBTENER EXPEDIENTE COMPLETO
// ============================================
const getExpedienteCompleto = async (id_alumno) => {
    try {
        // Usar el procedimiento almacenado sp_reporte_completo_alumno
        const [results] = await pool.query(
            `CALL sp_reporte_completo_alumno(?)`,
            [id_alumno]
        );
        
        // El procedimiento devuelve múltiples result sets
        // results[0] = datos personales
        // results[1] = rendimiento académico  
        // results[2] = promedios por semestre
        // results[3] = familiares
        // results[4] = incidentes
        // results[5] = metadata (ignorar)
        
        // ============================================
        // CONSULTAS ADICIONALES PARA DATOS FALTANTES
        // ============================================
        
        // 1. Datos de Salud
        const [datosSalud] = await pool.execute(
            `SELECT * FROM datos_salud WHERE id_alumno = ?`,
            [id_alumno]
        );
        
        // 2. Datos Socioeconómicos (con domicilio de renta)
        const [datosSocioeconomicos] = await pool.execute(
            `SELECT 
                dse.*,
                d.calle,
                d.numero,
                d.colonia,
                d.municipio,
                d.estado,
                d.referencia
            FROM datos_socioeconomicos dse
            LEFT JOIN domicilios d ON dse.id_domicilio_renta = d.id_domicilio
            WHERE dse.id_alumno = ?`,
            [id_alumno]
        );
        
        // Formatear domicilio de renta
        let socioeconomicos = null;
        if (datosSocioeconomicos.length > 0) {
            socioeconomicos = {
                ...datosSocioeconomicos[0],
                domicilio_renta: datosSocioeconomicos[0].calle ? {
                    calle: datosSocioeconomicos[0].calle,
                    numero: datosSocioeconomicos[0].numero,
                    colonia: datosSocioeconomicos[0].colonia,
                    municipio: datosSocioeconomicos[0].municipio,
                    estado: datosSocioeconomicos[0].estado,
                    referencia: datosSocioeconomicos[0].referencia
                } : null
            };
            
            // Limpiar campos duplicados
            delete socioeconomicos.calle;
            delete socioeconomicos.numero;
            delete socioeconomicos.colonia;
            delete socioeconomicos.municipio;
            delete socioeconomicos.estado;
            delete socioeconomicos.referencia;
        }
        
        // 3. Desempeño Académico
        const [desempeno] = await pool.execute(
            `SELECT * FROM desempeno_academico WHERE id_alumno = ?`,
            [id_alumno]
        );
        
        // 4. Habilidades
        const [habilidades] = await pool.execute(
            `SELECT * FROM alumno_habilidad WHERE id_alumno = ? ORDER BY fecha_registro DESC`,
            [id_alumno]
        );
        
        // 5. Certificaciones
        const [certificaciones] = await pool.execute(
            `SELECT * FROM certificaciones WHERE id_alumno = ? ORDER BY fecha_obtencion DESC`,
            [id_alumno]
        );
        
        // ============================================
        // RETORNAR EXPEDIENTE COMPLETO CON TODOS LOS DATOS
        // ============================================
        return {
            datos_personales: results[0] && results[0][0] ? results[0][0] : null,
            rendimiento_academico: results[1] && results[1][0] ? results[1][0] : null,
            promedios_semestre: results[2] || [],
            familiares: results[3] || [],
            incidentes: results[4] || [],
            // NUEVOS DATOS AGREGADOS
            datos_salud: datosSalud.length > 0 ? datosSalud[0] : null,
            datos_socioeconomicos: socioeconomicos,
            desempeno_academico: desempeno.length > 0 ? desempeno[0] : null,
            habilidades: habilidades,
            certificaciones: certificaciones
        };
        
    } catch (error) {
        console.error('- Error en getExpedienteCompleto:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER ESTADÍSTICAS DE ALUMNOS
// ============================================
const getEstadisticas = async (id_licenciatura) => {
    try {
        // Contar total de alumnos
        let query = 'SELECT COUNT(*) as total FROM alumnos';
        const params = [];
        
        if (id_licenciatura) {
            query += ' WHERE id_licenciatura = ?';
            params.push(id_licenciatura);
        }
        
        const [total] = await pool.execute(query, params);
        
        // Contar por status
        let statusQuery = `
            SELECT 
                status_alumno,
                COUNT(*) as cantidad
            FROM alumnos
        `;
        
        if (id_licenciatura) {
            statusQuery += ' WHERE id_licenciatura = ?';
        }
        
        statusQuery += ' GROUP BY status_alumno';
        
        const [porStatus] = await pool.execute(statusQuery, params);
        
        // Contar por semestre
        let semestreQuery = `
            SELECT 
                semestre_actual,
                COUNT(*) as cantidad
            FROM alumnos
        `;
        
        if (id_licenciatura) {
            semestreQuery += ' WHERE id_licenciatura = ?';
        }
        
        semestreQuery += ' GROUP BY semestre_actual ORDER BY semestre_actual';
        
        const [porSemestre] = await pool.execute(semestreQuery, params);
        
        return {
            total: total[0].total,
            por_status: porStatus,
            por_semestre: porSemestre
        };
        
    } catch (error) {
        console.error('- Error en getEstadisticas:', error.message);
        throw error;
    }
};

// ============================================
// CAMBIAR STATUS DEL ALUMNO
// ============================================
const cambiarStatus = async (id_alumno, nuevo_status, id_usuario) => {
    try {
        // Usar procedimiento almacenado sp_cambiar_status_alumno
        const [result] = await pool.execute(
            `CALL sp_cambiar_status_alumno(?, ?, ?, @resultado)`,
            [id_alumno, nuevo_status, id_usuario]
        );
        
        const [output] = await pool.execute('SELECT @resultado as resultado');
        
        if (output[0].resultado.includes('ERROR')) {
            throw new Error(output[0].resultado);
        }
        
        return output[0].resultado;
        
    } catch (error) {
        console.error('- Error en cambiarStatus:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER GENERACIONES DISPONIBLES
// ============================================
const getGeneraciones = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT generacion
            FROM alumnos
            ORDER BY generacion DESC
        `);
        
        return rows.map(r => r.generacion);
    } catch (error) {
        console.error('- Error en getGeneraciones:', error.message);
        throw error;
    }
};

// ============================================
// CONTAR TOTAL DE ALUMNOS
// ============================================
const count = async (filters = {}) => {
    try {
        let query = `
            SELECT COUNT(*) as total
            FROM alumnos a
            WHERE 1=1
        `;
        
        const params = [];
        
        // AGREGAR ESTE BLOQUE NUEVO (después del WHERE 1=1):
        
        // Filtro por múltiples licenciaturas (para INVITADOS)
        if (filters.licenciaturas_invitado && filters.licenciaturas_invitado.length > 0) {
            const placeholders = filters.licenciaturas_invitado.map(() => '?').join(',');
            query += ` AND a.id_licenciatura IN (${placeholders})`;
            params.push(...filters.licenciaturas_invitado);
        }
        // Filtro por múltiples licenciaturas (para DOCENTES)
        else if (filters.licenciaturas_docente && filters.licenciaturas_docente.length > 0) {
            const placeholders = filters.licenciaturas_docente.map(() => '?').join(',');
            query += ` AND a.id_licenciatura IN (${placeholders})`;
            params.push(...filters.licenciaturas_docente);
        }
        // Filtro por una sola licenciatura
        else if (filters.id_licenciatura) {
            query += ` AND a.id_licenciatura = ?`;
            params.push(filters.id_licenciatura);
        }
        
        // Filtro por generación
        if (filters.generacion) {
            query += ` AND a.generacion = ?`;
            params.push(filters.generacion);
        }
        
        // Filtro por status
        if (filters.status) {
            query += ` AND a.status_alumno = ?`;
            params.push(filters.status);
        }
        
        // Filtro por semestre
        if (filters.semestre) {
            query += ` AND a.semestre_actual = ?`;
            params.push(filters.semestre);
        }
        
        // Búsqueda por nombre, matrícula o CURP
        if (filters.search) {
            query += ` AND (
                a.nombre_completo LIKE ? OR 
                a.matricula LIKE ? OR 
                a.curp LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows[0].total;
        
    } catch (error) {
        console.error('- Error en count:', error.message);
        throw error;
    }
};

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    getAll,
    findById,
    findByMatricula,
    findByCurp,
    create,
    update,
    getExpedienteCompleto,
    getEstadisticas,
    cambiarStatus,
    getGeneraciones,
    count
};