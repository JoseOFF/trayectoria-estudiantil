// ============================================
// MODELO DE COMPLETITUD DE EXPEDIENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');

// ============================================
// OBTENER COMPLETITUD DE UN ALUMNO
// ============================================
const getByAlumno = async (id_alumno) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                c.*,
                a.matricula,
                a.nombre_completo,
                l.nombre_licenciatura,
                a.semestre_actual,
                a.generacion
            FROM completitud_expediente c
            INNER JOIN alumnos a ON c.id_alumno = a.id_alumno
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            WHERE c.id_alumno = ?`,
            [id_alumno]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error en getByAlumno:', error.message);
        throw error;
    }
};

// ============================================
// CALCULAR COMPLETITUD DE UN ALUMNO
// ============================================
const calcular = async (id_alumno) => {
    try {
        // Llamar al procedimiento almacenado
        await pool.execute(
            'CALL sp_calcular_completitud_expediente(?)',
            [id_alumno]
        );
        
        // Retornar el resultado actualizado
        return await getByAlumno(id_alumno);
    } catch (error) {
        console.error('Error en calcular:', error.message);
        throw error;
    }
};

// ============================================
// RECALCULAR TODAS LAS COMPLETITUDES
// ============================================
const recalcularTodas = async () => {
    try {
        const [result] = await pool.execute('CALL sp_recalcular_todas_completitudes()');
        return result;
    } catch (error) {
        console.error('Error en recalcularTodas:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER REPORTE COMPLETO DE COMPLETITUD
// ============================================
const getReporte = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                v.*
            FROM vista_seguimiento_completitud v
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtro por licenciatura
        if (filters.id_licenciatura) {
            query += ` AND v.id_alumno IN (
                SELECT id_alumno FROM alumnos WHERE id_licenciatura = ?
            )`;
            params.push(filters.id_licenciatura);
        }
        
        // Filtro por múltiples licenciaturas (para docentes e invitados)
        if (filters.licenciaturas && filters.licenciaturas.length > 0) {
            const placeholders = filters.licenciaturas.map(() => '?').join(',');
            query += ` AND v.id_alumno IN (
                SELECT id_alumno FROM alumnos WHERE id_licenciatura IN (${placeholders})
            )`;
            params.push(...filters.licenciaturas);
        }
        
        // Filtro por generación
        if (filters.generacion) {
            query += ` AND v.generacion = ?`;
            params.push(filters.generacion);
        }
        
        if (filters.semestre) {
            query += ' AND semestre_actual = ?';
            params.push(parseInt(filters.semestre));  // parseInt importante: la vista usa INT
        }
        
        // Filtro por nivel de completitud
        if (filters.nivel_completitud) {
            query += ` AND v.nivel_completitud = ?`;
            params.push(filters.nivel_completitud);
        }
        
        // Filtro por prioridad
        if (filters.prioridad) {
            query += ` AND v.prioridad = ?`;
            params.push(filters.prioridad);
        }
        
        // Filtro por porcentaje mínimo
        if (filters.porcentaje_min !== undefined) {
            query += ` AND v.porcentaje_completitud >= ?`;
            params.push(parseFloat(filters.porcentaje_min));
        }
        
        // Filtro por porcentaje máximo
        if (filters.porcentaje_max !== undefined) {
            query += ` AND v.porcentaje_completitud <= ?`;
            params.push(parseFloat(filters.porcentaje_max));
        }
        
        // Búsqueda por nombre o matrícula
        if (filters.search) {
            query += ` AND (
                v.nombre_completo LIKE ? OR 
                v.matricula LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        // Ordenamiento: el nombre de la columna NO puede ir como parámetro "?",
        // así que solo se aceptan columnas de esta lista. Cualquier otro valor
        // (por ejemplo, texto SQL enviado en la URL) se ignora.
        const COLUMNAS_ORDENABLES = [
            'id_alumno', 'matricula', 'nombre_completo', 'nombre_licenciatura',
            'semestre_actual', 'generacion', 'porcentaje_completitud',
            'nivel_completitud', 'prioridad', 'secciones_pendientes', 'fecha_calculo'
        ];
        const orderBy = COLUMNAS_ORDENABLES.includes(filters.order_by)
            ? filters.order_by
            : 'porcentaje_completitud';
        const orderDir = filters.order_dir === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY v.${orderBy} ${orderDir}`;
        
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
        console.error('Error en getReporte:', error.message);
        throw error;
    }
};

// ============================================
// OBTENER ESTADÍSTICAS DE COMPLETITUD
// ============================================
const getEstadisticas = async (filters = {}) => {
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        // Filtro por licenciatura
        if (filters.id_licenciatura) {
            whereClause += ` AND v.id_alumno IN (
                SELECT id_alumno FROM alumnos WHERE id_licenciatura = ?
            )`;
            params.push(filters.id_licenciatura);
        }
        
        // Filtro por múltiples licenciaturas
        if (filters.licenciaturas && filters.licenciaturas.length > 0) {
            const placeholders = filters.licenciaturas.map(() => '?').join(',');
            whereClause += ` AND v.id_alumno IN (
                SELECT id_alumno FROM alumnos WHERE id_licenciatura IN (${placeholders})
            )`;
            params.push(...filters.licenciaturas);
        }
        
        // Filtro por generación
        if (filters.generacion) {
            whereClause += ` AND v.generacion = ?`;
            params.push(filters.generacion);
        }
        
        // Estadísticas generales
        const [estadisticas] = await pool.execute(
            `SELECT 
                COUNT(*) as total_alumnos,
                ROUND(AVG(porcentaje_completitud), 2) as promedio_completitud,
                SUM(CASE WHEN prioridad = 'Completo' COLLATE utf8mb4_unicode_ci THEN 1 ELSE 0 END) as completos,
                SUM(CASE WHEN prioridad = 'Falta Poco' COLLATE utf8mb4_unicode_ci THEN 1 ELSE 0 END) as falta_poco,
                SUM(CASE WHEN prioridad = 'Urgente' COLLATE utf8mb4_unicode_ci THEN 1 ELSE 0 END) as urgentes,
                SUM(CASE WHEN prioridad = 'Sin Iniciar' COLLATE utf8mb4_unicode_ci THEN 1 ELSE 0 END) as sin_iniciar
            FROM vista_seguimiento_completitud v
            ${whereClause}`,
            params
        );
        
        // Distribución por nivel
        const [porNivel] = await pool.execute(
            `SELECT 
                nivel_completitud,
                COUNT(*) as cantidad,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM vista_seguimiento_completitud v2 ${whereClause})), 2) as porcentaje
            FROM vista_seguimiento_completitud v
            ${whereClause}
            GROUP BY nivel_completitud
            ORDER BY FIELD(nivel_completitud, 'Completo', 'Casi Completo', 'En Progreso', 'Iniciado', 'Vacío')`,
            [...params, ...params]
        );
        
        // Distribución por prioridad
        const [porPrioridad] = await pool.execute(
            `SELECT 
                prioridad,
                COUNT(*) as cantidad
            FROM vista_seguimiento_completitud v
            ${whereClause}
            GROUP BY prioridad
            ORDER BY FIELD(prioridad, 'Completo', 'Falta Poco', 'Urgente', 'Sin Iniciar')`,
            params
        );
        
        // Secciones más incompletas
        const [seccionesIncompletas] = await pool.execute(
            `SELECT 
                'Datos Personales' as seccion,
                SUM(CASE WHEN datos_personales < 100 THEN 1 ELSE 0 END) as cantidad
            FROM vista_seguimiento_completitud v ${whereClause}
            UNION ALL
            SELECT 'Datos de Salud', SUM(CASE WHEN datos_salud < 100 THEN 1 ELSE 0 END)
            FROM vista_seguimiento_completitud v ${whereClause}
            UNION ALL
            SELECT 'Datos Académicos', SUM(CASE WHEN datos_academicos < 100 THEN 1 ELSE 0 END)
            FROM vista_seguimiento_completitud v ${whereClause}
            UNION ALL
            SELECT 'Datos Socioeconómicos', SUM(CASE WHEN datos_socioeconomicos < 100 THEN 1 ELSE 0 END)
            FROM vista_seguimiento_completitud v ${whereClause}
            UNION ALL
            SELECT 'Familiares', SUM(CASE WHEN familiares < 100 THEN 1 ELSE 0 END)
            FROM vista_seguimiento_completitud v ${whereClause}
            UNION ALL
            SELECT 'Documentos', SUM(CASE WHEN documentos < 100 THEN 1 ELSE 0 END)
            FROM vista_seguimiento_completitud v ${whereClause}
            UNION ALL
            SELECT 'Habilidades', SUM(CASE WHEN habilidades < 100 THEN 1 ELSE 0 END)
            FROM vista_seguimiento_completitud v ${whereClause}
            ORDER BY cantidad DESC`,
            [...params, ...params, ...params, ...params, ...params, ...params, ...params]
        );
        
        // Estadísticas por licenciatura
        const [porLicenciatura] = await pool.execute(
            `SELECT 
                v.nombre_licenciatura,
                COUNT(*) as total_alumnos,
                ROUND(AVG(v.porcentaje_completitud), 2) as promedio_completitud,
                SUM(CASE WHEN v.prioridad = 'Completo' COLLATE utf8mb4_unicode_ci THEN 1 ELSE 0 END) as completos,
                SUM(CASE WHEN v.prioridad = 'Urgente' COLLATE utf8mb4_unicode_ci THEN 1 ELSE 0 END) as urgentes
            FROM vista_seguimiento_completitud v
            ${whereClause}
            GROUP BY v.nombre_licenciatura
            ORDER BY promedio_completitud DESC`,
            params
        );
        
        return {
            resumen: estadisticas[0],
            por_nivel: porNivel,
            por_prioridad: porPrioridad,
            secciones_incompletas: seccionesIncompletas,
            por_licenciatura: porLicenciatura
        };
    } catch (error) {
        console.error('Error en getEstadisticas:', error.message);
        throw error;
    }
};




// ============================================
// CONTAR TOTAL DE REGISTROS (PARA PAGINACIÓN)
// ============================================
const count = async (filters = {}) => {
    try {
        let query = `
            SELECT COUNT(*) as total
            FROM vista_seguimiento_completitud v
            WHERE 1=1
        `;
        
        const params = [];
        
        // Aplicar los mismos filtros que en getReporte
        if (filters.id_licenciatura) {
            query += ` AND v.id_alumno IN (
                SELECT id_alumno FROM alumnos WHERE id_licenciatura = ?
            )`;
            params.push(filters.id_licenciatura);
        }
        
        if (filters.licenciaturas && filters.licenciaturas.length > 0) {
            const placeholders = filters.licenciaturas.map(() => '?').join(',');
            query += ` AND v.id_alumno IN (
                SELECT id_alumno FROM alumnos WHERE id_licenciatura IN (${placeholders})
            )`;
            params.push(...filters.licenciaturas);
        }
        
        if (filters.generacion) {
            query += ` AND v.generacion = ?`;
            params.push(filters.generacion);
        }
        
        if (filters.nivel_completitud) {
            query += ` AND v.nivel_completitud = ?`;
            params.push(filters.nivel_completitud);
        }
        
        if (filters.prioridad) {
            query += ` AND v.prioridad = ?`;
            params.push(filters.prioridad);
        }
        
        if (filters.search) {
            query += ` AND (v.nombre_completo LIKE ? OR v.matricula LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    } catch (error) {
        console.error('Error en count:', error.message);
        throw error;
    }
};

// ============================================
// EXPORTAR FUNCIONES
// ============================================
module.exports = {
    getByAlumno,
    calcular,
    recalcularTodas,
    getReporte,
    getEstadisticas,
    count
};