// ============================================
// CONTROLADOR DE COMPLETITUD DE EXPEDIENTES - CORREGIDO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Completitud = require('../models/completitud.model');
const { pool } = require('../config/database');

// ============================================
// OBTENER COMPLETITUD DE UN ALUMNO
// ============================================
const getByAlumno = async (req, res) => {
    try {
        const { id_alumno } = req.params;
        
        const completitud = await Completitud.getByAlumno(id_alumno);
        
        if (!completitud) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información de completitud para este alumno'
            });
        }
        
        res.json({
            success: true,
            data: completitud
        });
        
    } catch (error) {
        console.error('Error en getByAlumno:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener completitud del alumno',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// CALCULAR/RECALCULAR COMPLETITUD DE UN ALUMNO
// ============================================
const calcular = async (req, res) => {
    try {
        const { id_alumno } = req.params;
        
        const completitud = await Completitud.calcular(id_alumno);
        
        if (!completitud) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo calcular la completitud. Verifica que el alumno exista.'
            });
        }
        
        res.json({
            success: true,
            message: 'Completitud calculada exitosamente',
            data: completitud
        });
        
    } catch (error) {
        console.error('Error en calcular:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al calcular completitud',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// RECALCULAR COMPLETITUD DE TODOS LOS ALUMNOS
// ============================================
const recalcularTodas = async (req, res) => {
    try {
        // Solo administradores pueden ejecutar esto
        if (req.user.id_rol !== 1) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }
        
        await Completitud.recalcularTodas();
        
        res.json({
            success: true,
            message: 'Todas las completitudes han sido recalculadas exitosamente'
        });
        
    } catch (error) {
        console.error('Error en recalcularTodas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al recalcular completitudes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER REPORTE DE COMPLETITUD
// ============================================
const getReporte = async (req, res) => {
    try {
        const {
            licenciatura,
            generacion,
            nivel_completitud,
            prioridad,
            porcentaje_min,
            porcentaje_max,
            search,
            limit,
            offset,
            order_by,
            order_dir
        } = req.query;
        
        const filters = {
            id_licenciatura: licenciatura ? parseInt(licenciatura) : undefined,
            generacion: generacion ? parseInt(generacion) : undefined,
            semestre: req.query.semestre ? parseInt(req.query.semestre) : undefined,
            nivel_completitud: nivel_completitud || undefined,
            prioridad: prioridad || undefined,
            porcentaje_min: porcentaje_min ? parseFloat(porcentaje_min) : undefined,
            porcentaje_max: porcentaje_max ? parseFloat(porcentaje_max) : undefined,
            search: search || undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
            order_by: order_by || 'porcentaje_completitud',
            order_dir: order_dir || 'asc'
        };
        
        // ============================================
        // FILTRADO POR ROL: SI ES DOCENTE, SOLO VE SUS LICENCIATURAS
        // ============================================
        if (req.user.rol === 'Docente') {
            // Obtener las licenciaturas asignadas al docente
            const [licenciaturasDocente] = await pool.execute(
                `SELECT DISTINCT dl.id_licenciatura
                 FROM docentes d
                 INNER JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
                 WHERE d.id_usuario = ?`,
                [req.user.id_usuario]
            );
            
            // Extraer solo los IDs de licenciaturas
            const idsLicenciaturas = licenciaturasDocente.map(l => l.id_licenciatura);
            
            // Si el docente no tiene licenciaturas asignadas, retornar lista vacía
            if (idsLicenciaturas.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        reporte: [],
                        total: 0,
                        limit: filters.limit,
                        offset: filters.offset
                    },
                    message: 'No tienes licenciaturas asignadas. Contacta al administrador.'
                });
            }
            
            // Aplicar el filtro de licenciaturas del docente
            if (filters.id_licenciatura) {
                // Verificar que el docente tenga acceso a esa licenciatura
                if (!idsLicenciaturas.includes(filters.id_licenciatura)) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver completitud de esa licenciatura'
                    });
                }
            } else {
                // Si no hay filtro específico, mostrar datos de todas las licenciaturas del docente
                filters.licenciaturas = idsLicenciaturas;
            }
        }
        
        const [reporte, total] = await Promise.all([
            Completitud.getReporte(filters),
            Completitud.count(filters)
        ]);
        
        res.json({
            success: true,
            data: {
                reporte,
                total,
                limit: filters.limit,
                offset: filters.offset
            }
        });
        
    } catch (error) {
        console.error('Error en getReporte:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de completitud',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER ESTADÍSTICAS DE COMPLETITUD
// ============================================
const getEstadisticas = async (req, res) => {
    try {
        const { licenciatura, generacion } = req.query;
        
        const filters = {
            id_licenciatura: licenciatura ? parseInt(licenciatura) : undefined,
            generacion: generacion ? parseInt(generacion) : undefined
        };
        
        // ============================================
        // FILTRADO POR ROL: SI ES DOCENTE, SOLO VE SUS LICENCIATURAS
        // ============================================
        if (req.user.rol === 'Docente') {
            // Obtener las licenciaturas asignadas al docente
            const [licenciaturasDocente] = await pool.execute(
                `SELECT DISTINCT dl.id_licenciatura
                 FROM docentes d
                 INNER JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
                 WHERE d.id_usuario = ?`,
                [req.user.id_usuario]
            );
            
            // Extraer solo los IDs de licenciaturas
            const idsLicenciaturas = licenciaturasDocente.map(l => l.id_licenciatura);
            
            // Si el docente no tiene licenciaturas asignadas, retornar estadísticas vacías
            if (idsLicenciaturas.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        resumen: {
                            total_alumnos: 0,
                            promedio_completitud: 0,
                            completos: 0,
                            falta_poco: 0,
                            urgentes: 0,
                            sin_iniciar: 0
                        },
                        por_nivel: [],
                        por_prioridad: [],
                        secciones_incompletas: [],
                        por_licenciatura: []
                    }
                });
            }
            
            // Aplicar el filtro de licenciaturas del docente
            if (filters.id_licenciatura) {
                // Verificar que el docente tenga acceso a esa licenciatura
                const licId = parseInt(filters.id_licenciatura);
                if (!idsLicenciaturas.includes(licId)) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver estadísticas de esa licenciatura'
                    });
                }
            } else {
                // Si no hay filtro específico, mostrar estadísticas de todas las licenciaturas del docente
                filters.licenciaturas = idsLicenciaturas;
            }
        }
        
        const estadisticas = await Completitud.getEstadisticas(filters);
        
        res.json({
            success: true,
            data: estadisticas
        });
        
    } catch (error) {
        console.error('Error en getEstadisticas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de completitud',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



// ============================================
// OBTENER SECCIONES FALTANTES DE UN ALUMNO (PARA PORTAL)
// ============================================
const getSeccionesFaltantes = async (req, res) => {
    try {
        const { id_alumno } = req.params;
        
        // Verificar que el alumno esté accediendo a su propia información
        // o que sea admin/docente
        if (req.user.rol === 'Alumno') {
            // Obtener id_alumno del usuario actual
            const [alumnoActual] = await pool.execute(
                'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
                [req.user.id_usuario]
            );
            
            if (!alumnoActual[0] || alumnoActual[0].id_alumno !== parseInt(id_alumno)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver esta información'
                });
            }
        }
        
        // Obtener completitud del alumno
        const completitud = await Completitud.getByAlumno(id_alumno);
        
        if (!completitud) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información de completitud'
            });
        }
        
        // Construir array de secciones faltantes con requisitos
        const secciones = [];
        
        // 1. Datos Personales
        if (completitud.completitud_datos_personales < 100) {
            const [alumno] = await pool.execute(
                'SELECT * FROM alumnos WHERE id_alumno = ?',
                [id_alumno]
            );
            const a = alumno[0];
            
            const faltantes = [];
            if (!a.curp) faltantes.push('CURP');
            if (!a.fecha_nacimiento) faltantes.push('Fecha de nacimiento');
            if (!a.correo_institucional) faltantes.push('Correo institucional');
            if (!a.celular) faltantes.push('Celular');
            if (!a.estado_civil) faltantes.push('Estado civil');
            if (!a.id_domicilio) faltantes.push('Domicilio completo');
            if (!a.correo_personal) faltantes.push('Correo personal');
            if (!a.telefono_emergencia) faltantes.push('Teléfono de emergencia');
            
            secciones.push({
                nombre: 'Datos Personales',
                porcentaje: completitud.completitud_datos_personales,
                icono: 'person-circle',
                color: 'primary',
                faltantes: faltantes,
                accion: 'Completa tu información personal en la sección "Mis Datos"'
            });
        }
        
        // 2. Datos de Salud
        if (completitud.completitud_datos_salud < 100) {
            secciones.push({
                nombre: 'Datos de Salud',
                porcentaje: completitud.completitud_datos_salud,
                icono: 'heart-pulse',
                color: 'danger',
                faltantes: ['Información médica y de salud'],
                accion: 'Registra tu tipo de sangre, seguro médico y condiciones de salud'
            });
        }
        
        // 3. Datos Académicos
        if (completitud.completitud_datos_academicos < 100) {
            secciones.push({
                nombre: 'Datos Académicos',
                porcentaje: completitud.completitud_datos_academicos,
                icono: 'book',
                color: 'info',
                faltantes: ['Información académica previa'],
                accion: 'Registra tu escuela de procedencia y promedio'
            });
        }
        
        // 4. Datos Socioeconómicos
        if (completitud.completitud_datos_socioeconomicos < 100) {
            secciones.push({
                nombre: 'Datos Socioeconómicos',
                porcentaje: completitud.completitud_datos_socioeconomicos,
                icono: 'cash-coin',
                color: 'warning',
                faltantes: ['Situación económica familiar'],
                accion: 'Completa tu información socioeconómica'
            });
        }
        
        // 5. Familiares
        if (completitud.completitud_familiares < 100) {
            const [familiares] = await pool.execute(
                'SELECT COUNT(*) as total FROM familiares WHERE id_alumno = ?',
                [id_alumno]
            );
            
            const totalFamiliares = familiares[0].total;
            const faltantes = [];
            
            if (totalFamiliares === 0) {
                faltantes.push('Registra al menos 2 familiares (padre, madre o tutores)');
            } else if (totalFamiliares === 1) {
                faltantes.push('Registra 1 familiar más para completar al 100%');
            }
            
            secciones.push({
                nombre: 'Familiares',
                porcentaje: completitud.completitud_familiares,
                icono: 'people',
                color: 'success',
                faltantes: faltantes,
                accion: 'Registra mínimo 2 familiares o tutores'
            });
        }
        
        // 6. Documentos
        if (completitud.completitud_documentos < 100) {
            const [docs] = await pool.execute(
                'SELECT COUNT(*) as total FROM documentos WHERE id_alumno = ?',
                [id_alumno]
            );
            
            const totalDocs = docs[0].total;
            const faltantes = [];
            
            if (totalDocs === 0) {
                faltantes.push('Sube al menos 5 documentos oficiales');
            } else if (totalDocs < 5) {
                faltantes.push(`Te faltan ${5 - totalDocs} documentos para completar al 100%`);
            }
            
            secciones.push({
                nombre: 'Documentos',
                porcentaje: completitud.completitud_documentos,
                icono: 'file-earmark-text',
                color: 'secondary',
                faltantes: faltantes,
                accion: 'Sube mínimo 5 documentos (acta, CURP, comprobantes, etc.)'
            });
        }
        
        // 7. Habilidades
        if (completitud.completitud_habilidades < 100) {
            const [habs] = await pool.execute(
                'SELECT COUNT(*) as total FROM alumno_habilidad WHERE id_alumno = ?',
                [id_alumno]
            );
            
            const totalHabs = habs[0].total;
            const faltantes = [];
            
            if (totalHabs === 0) {
                faltantes.push('Registra al menos 3 habilidades');
            } else if (totalHabs < 3) {
                faltantes.push(`Te faltan ${3 - totalHabs} habilidades para completar al 100%`);
            }
            
            secciones.push({
                nombre: 'Habilidades',
                porcentaje: completitud.completitud_habilidades,
                icono: 'star',
                color: 'primary',
                faltantes: faltantes,
                accion: 'Registra mínimo 3 habilidades personales'
            });
        }
        
        res.json({
            success: true,
            data: {
                porcentaje_total: completitud.porcentaje_total,
                nivel_completitud: completitud.nivel_completitud,
                secciones_faltantes: secciones,
                secciones_completas: 7 - secciones.length
            }
        });
        
    } catch (error) {
        console.error('Error en getSeccionesFaltantes:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener secciones faltantes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// EXPORTAR CONTROLADORES
// ============================================
module.exports = {
    getByAlumno,
    calcular,
    recalcularTodas,
    getReporte,
    getEstadisticas,
    getSeccionesFaltantes
};