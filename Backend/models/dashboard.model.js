// ============================================
// MODELO DE DASHBOARD - ADAPTADO A LA BD REAL
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');

// ============================================
// OBTENER ESTADÍSTICAS GENERALES
// ============================================
const getEstadisticasGenerales = async (id_rol, id_usuario) => {
    try {
        const rolNombre = await getRolNombre(id_rol);
        
        if (rolNombre === 'Administrador') {
            return await getEstadisticasAdmin();
        } else if (rolNombre === 'Docente') {
            return await getEstadisticasDocente(id_usuario);
        } else if (rolNombre === 'Invitado') {
            return await getEstadisticasInvitado(id_usuario);
        } else {
            return await getEstadisticasAlumno(id_usuario);
        }
        
    } catch (error) {
        console.error('- Error en getEstadisticasGenerales:', error);
        throw error;
    }
};

// Obtener nombre del rol
const getRolNombre = async (id_rol) => {
    const [rows] = await pool.execute(
        'SELECT nombre_rol FROM roles WHERE id_rol = ?',
        [id_rol]
    );
    return rows[0]?.nombre_rol;
};

// ============================================
// ESTADÍSTICAS PARA ADMINISTRADOR - OPCIÓN A
// ============================================
const getEstadisticasAdmin = async () => {
    try {
        // 1. Total de alumnos activos
        const [totalAlumnos] = await pool.execute(
            'SELECT COUNT(*) as total FROM alumnos WHERE status_alumno = "Activo"'
        );
        
        // 2. Total de usuarios activos en el sistema
        const [totalUsuarios] = await pool.execute(
            'SELECT COUNT(*) as total FROM usuarios WHERE activo = true'
        );
        
        // 3. Total de documentos en el sistema
        const [totalDocumentos] = await pool.execute(
            'SELECT COUNT(*) as total FROM documentos'
        );
        
        // 4. Alumnos en riesgo académico (promedio < 8.0)
        const [alumnosRiesgo] = await pool.execute(`
            SELECT COUNT(DISTINCT a.id_alumno) as total
            FROM alumnos a
            INNER JOIN semestre_promedio sp ON a.id_alumno = sp.id_alumno
            WHERE sp.promedio < 8.0
            AND a.status_alumno = 'Activo'
        `);
        
        // Alumnos por status (para gráficos adicionales)
        const [porStatus] = await pool.execute(`
            SELECT 
                status_alumno,
                COUNT(*) as cantidad
            FROM alumnos
            GROUP BY status_alumno
        `);
        
        return {
            total_alumnos: totalAlumnos[0].total,
            total_usuarios_activos: totalUsuarios[0].total,
            total_documentos: totalDocumentos[0].total,
            alumnos_riesgo: alumnosRiesgo[0].total,
            por_status: porStatus
        };
        
    } catch (error) {
        console.error('- Error en getEstadisticasAdmin:', error);
        throw error;
    }
};

// ============================================
// ESTADÍSTICAS PARA DOCENTE
// ============================================
const getEstadisticasDocente = async (id_usuario) => {
    try {
        // PASO 1: Obtener las licenciaturas asignadas al docente
        const [licenciaturasDocente] = await pool.execute(
            `SELECT DISTINCT dl.id_licenciatura
             FROM docentes d
             INNER JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
             WHERE d.id_usuario = ?`,
            [id_usuario]
        );
        
        const idsLicenciaturas = licenciaturasDocente.map(l => l.id_licenciatura);
        
        // Si el docente no tiene licenciaturas asignadas, retornar estadísticas vacías
        if (idsLicenciaturas.length === 0) {
            return {
                total_alumnos: 0,
                alumnos_activos: 0,
                alumnos_riesgo: 0,
                total_documentos: 0,
                por_status: [],
                por_semestre: [],
                mensaje: 'No tienes licenciaturas asignadas. Contacta al administrador.'
            };
        }
        
        // PASO 2: Construir el filtro WHERE con las licenciaturas del docente
        const placeholders = idsLicenciaturas.map(() => '?').join(',');
        const whereLicenciaturas = `WHERE a.id_licenciatura IN (${placeholders})`;
        
        // PASO 3: Obtener estadísticas SOLO de alumnos de esas licenciaturas
        
        // 1. Total de alumnos de las licenciaturas del docente
        const [totalAlumnos] = await pool.execute(
            `SELECT COUNT(*) as total 
             FROM alumnos a 
             ${whereLicenciaturas}`,
            idsLicenciaturas
        );
        
        // 2. Alumnos activos
        const [alumnosActivos] = await pool.execute(
            `SELECT COUNT(*) as total 
             FROM alumnos a 
             ${whereLicenciaturas}
             AND a.status_alumno = 'Activo'`,
            idsLicenciaturas
        );
        
        // 3. Alumnos en riesgo académico (promedio < 8.0)
        const [alumnosRiesgo] = await pool.execute(
            `SELECT COUNT(DISTINCT a.id_alumno) as total
             FROM alumnos a
             INNER JOIN semestre_promedio sp ON a.id_alumno = sp.id_alumno
             ${whereLicenciaturas}
             AND sp.promedio < 8.0
             AND a.status_alumno = 'Activo'`,
            idsLicenciaturas
        );
        
        // 4. Total de documentos de alumnos de esas licenciaturas
        const [totalDocumentos] = await pool.execute(
            `SELECT COUNT(*) as total
             FROM documentos d
             INNER JOIN alumnos a ON d.id_alumno = a.id_alumno
             ${whereLicenciaturas}`,
            idsLicenciaturas
        );
        
        // 5. Distribución por status
        const [porStatus] = await pool.execute(
            `SELECT 
                a.status_alumno,
                COUNT(*) as cantidad
             FROM alumnos a
             ${whereLicenciaturas}
             GROUP BY a.status_alumno`,
            idsLicenciaturas
        );
        
        // 6. Distribución por semestre
        const [porSemestre] = await pool.execute(
            `SELECT 
                a.semestre_actual,
                COUNT(*) as cantidad
             FROM alumnos a
             ${whereLicenciaturas}
             AND a.status_alumno = 'Activo'
             GROUP BY a.semestre_actual
             ORDER BY a.semestre_actual`,
            idsLicenciaturas
        );
        
        // 7. Nombres de las licenciaturas asignadas (para mostrar al docente)
        const [nombresLicenciaturas] = await pool.execute(
            `SELECT nombre_licenciatura
             FROM licenciaturas
             WHERE id_licenciatura IN (${placeholders})
             ORDER BY nombre_licenciatura`,
            idsLicenciaturas
        );
        
        return {
            total_alumnos: totalAlumnos[0].total,
            alumnos_activos: alumnosActivos[0].total,
            alumnos_riesgo: alumnosRiesgo[0].total,
            total_documentos: totalDocumentos[0].total,
            por_status: porStatus,
            por_semestre: porSemestre,
            licenciaturas_asignadas: nombresLicenciaturas.map(l => l.nombre_licenciatura)
        };
        
    } catch (error) {
        console.error('- Error en getEstadisticasDocente:', error);
        throw error;
    }
};

// ============================================
// ESTADÍSTICAS PARA ALUMNO
// ============================================
const getEstadisticasAlumno = async (id_usuario) => {
    try {
        return {
            mensaje: 'Bienvenido al Sistema de Expedientes',
            tipo: 'alumno'
        };
        
    } catch (error) {
        console.error('- Error en getEstadisticasAlumno:', error);
        throw error;
    }
};

// ============================================
// OBTENER ACTIVIDAD RECIENTE
// ============================================
const getActividadReciente = async (id_rol, id_usuario, limite = 10) => {
    try {
        // Obtener últimos documentos subidos
        const [documentos] = await pool.execute(`
            SELECT 
                d.id_documento,
                d.nombre_archivo,
                d.fecha_subida,
                a.nombre_completo as alumno,
                u.nombre_usuario as subido_por
            FROM documentos d
            INNER JOIN alumnos a ON d.id_alumno = a.id_alumno
            LEFT JOIN usuarios u ON d.subido_por = u.id_usuario
            ORDER BY d.fecha_subida DESC
            LIMIT ?
        `, [limite]);
        
        // Obtener últimos alumnos registrados
        const [alumnos] = await pool.execute(`
            SELECT 
                id_alumno,
                nombre_completo,
                matricula,
                fecha_registro as fecha_inscripcion
            FROM alumnos
            ORDER BY fecha_registro DESC
            LIMIT ?
        `, [limite]);
        
        return {
            documentos_recientes: documentos,
            alumnos_recientes: alumnos
        };
        
    } catch (error) {
        console.error('- Error en getActividadReciente:', error);
        throw error;
    }
};

// ============================================
// OBTENER DATOS PARA GRÁFICOS
// ============================================
const getAlumnosPorSemestre = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                semestre_actual,
                COUNT(*) as cantidad
            FROM alumnos
            WHERE status_alumno = 'Activo'
            GROUP BY semestre_actual
            ORDER BY semestre_actual
        `);
        
        return rows;
        
    } catch (error) {
        console.error('- Error en getAlumnosPorSemestre:', error);
        throw error;
    }
};

const getAlumnosPorStatus = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                status_alumno,
                COUNT(*) as cantidad
            FROM alumnos
            GROUP BY status_alumno
        `);
        
        return rows;
        
    } catch (error) {
        console.error('- Error en getAlumnosPorStatus:', error);
        throw error;
    }
};

const getRendimientoGeneral = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                CASE 
                    WHEN sp.promedio >= 9.0 THEN 'Excelente'
                    WHEN sp.promedio >= 8.0 THEN 'Bueno'
                    WHEN sp.promedio >= 7.0 THEN 'Regular'
                    ELSE 'En Riesgo'
                END as categoria,
                COUNT(DISTINCT a.id_alumno) as cantidad
            FROM alumnos a
            INNER JOIN semestre_promedio sp ON a.id_alumno = sp.id_alumno
            WHERE a.status_alumno = 'Activo'
            GROUP BY categoria
        `);
        
        return rows;
        
    } catch (error) {
        console.error('- Error en getRendimientoGeneral:', error);
        throw error;
    }
};

const getAlumnosPorGeneracion = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                generacion,
                COUNT(*) as cantidad
            FROM alumnos
            WHERE status_alumno = 'Activo'
            GROUP BY generacion
            ORDER BY generacion DESC
            LIMIT 5
        `);
        
        return rows;
        
    } catch (error) {
        console.error('- Error en getAlumnosPorGeneracion:', error);
        throw error;
    }
};

// ============================================
// OBTENER ALERTAS
// ============================================
const getAlertas = async (id_rol, id_usuario) => {
    try {
        const alertas = [];
        
        // Alumnos con bajo rendimiento
        const [alumnosBajoRendimiento] = await pool.execute(`
            SELECT 
                a.nombre_completo,
                a.matricula,
                sp.promedio
            FROM alumnos a
            INNER JOIN semestre_promedio sp ON a.id_alumno = sp.id_alumno
            WHERE sp.promedio < 7.0
            AND a.status_alumno = 'Activo'
            LIMIT 5
        `);
        
        if (alumnosBajoRendimiento.length > 0) {
            alertas.push({
                tipo: 'warning',
                titulo: 'Alumnos en riesgo',
                mensaje: `${alumnosBajoRendimiento.length} alumno(s) con promedio menor a 7.0`,
                datos: alumnosBajoRendimiento
            });
        }
        
        // Incidentes abiertos (si existe la tabla)
        try {
            const [incidentesAbiertos] = await pool.execute(`
                SELECT COUNT(*) as total
                FROM incidentes
                WHERE estado_incidente = 'Abierto'
            `);
            
            if (incidentesAbiertos[0].total > 0) {
                alertas.push({
                    tipo: 'warning',
                    titulo: 'Incidentes abiertos',
                    mensaje: `${incidentesAbiertos[0].total} incidente(s) pendiente(s) de atención`
                });
            }
        } catch (err) {
            console.log('Tabla incidentes no disponible');
        }
        
        return alertas;
        
    } catch (error) {
        console.error('- Error en getAlertas:', error);
        throw error;
    }
};



const getEstadisticasInvitado = async (id_usuario) => {
    try {
        // Obtener permisos del invitado
        const invitadoModel = require('./invitado.model');
        const permisos = await invitadoModel.getPermisosInvitado(id_usuario);
        
        if (!permisos) {
            return {
                total_alumnos: 0,
                total_licenciaturas: 0,
                mensaje: 'No tiene permisos asignados'
            };
        }
        
        const licenciaturasPermitidas = permisos.licenciaturas_permitidas;
        
        // Total de alumnos en las licenciaturas permitidas
        const placeholders = licenciaturasPermitidas.map(() => '?').join(',');
        const [totalAlumnos] = await pool.execute(
            `SELECT COUNT(*) as total 
             FROM alumnos 
             WHERE id_licenciatura IN (${placeholders}) 
             AND status_alumno = "Activo"`,
            licenciaturasPermitidas
        );
        
        // Alumnos por licenciatura (solo las permitidas)
        const [alumnosPorLicenciatura] = await pool.execute(
            `SELECT 
                l.nombre_licenciatura,
                COUNT(a.id_alumno) as total
             FROM licenciaturas l
             LEFT JOIN alumnos a ON l.id_licenciatura = a.id_licenciatura 
                AND a.status_alumno = "Activo"
             WHERE l.id_licenciatura IN (${placeholders})
             GROUP BY l.id_licenciatura, l.nombre_licenciatura
             ORDER BY total DESC`,
            licenciaturasPermitidas
        );
        
        // Alumnos por status (solo de las licenciaturas permitidas)
        const [alumnosPorStatus] = await pool.execute(
            `SELECT 
                status_alumno,
                COUNT(*) as total
             FROM alumnos
             WHERE id_licenciatura IN (${placeholders})
             GROUP BY status_alumno
             ORDER BY total DESC`,
            licenciaturasPermitidas
        );
        
        // Distribución por generación
        const [alumnosPorGeneracion] = await pool.execute(
            `SELECT 
                generacion,
                COUNT(*) as total
             FROM alumnos
             WHERE id_licenciatura IN (${placeholders})
             AND status_alumno = "Activo"
             GROUP BY generacion
             ORDER BY generacion DESC
             LIMIT 5`,
            licenciaturasPermitidas
        );
        
        return {
            total_alumnos: totalAlumnos[0].total,
            total_licenciaturas: licenciaturasPermitidas.length,
            licenciaturas_permitidas: permisos.licenciaturas_permitidas,
            secciones_permitidas: permisos.secciones_permitidas,
            por_licenciatura: alumnosPorLicenciatura,
            por_status: alumnosPorStatus,
            por_generacion: alumnosPorGeneracion
        };
        
    } catch (error) {
        console.error('- Error en getEstadisticasInvitado:', error);
        throw error;
    }
};
// ============================================
// EXPORTAR MODELO
// ============================================
module.exports = {
    getEstadisticasGenerales,
    getActividadReciente,
    getAlumnosPorSemestre,
    getAlumnosPorStatus,
    getRendimientoGeneral,
    getAlumnosPorGeneracion,
    getEstadisticasInvitado,
    getAlertas
};