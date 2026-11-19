// ============================================
// CONTROLADOR DE ALUMNOS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Alumno = require('../models/alumno.model');
const { hashContrasena } = require('../utils/usuariosHelper');
const { pool } = require('../config/database');

// ============================================
// OBTENER TODOS LOS ALUMNOS
// ============================================
// ============================================
// OBTENER TODOS LOS ALUMNOS (CON FILTRO POR DOCENTE)
// ============================================

const getAll = async (req, res) => {
    try {
        const {
            licenciatura,
            generacion,
            status,
            semestre,
            search,
            limit,
            offset
        } = req.query;
        
        const filters = {
            id_licenciatura: licenciatura ? parseInt(licenciatura) : undefined,
            generacion: generacion ? parseInt(generacion) : undefined,
            status: status || undefined,
            semestre: semestre ? parseInt(semestre) : undefined,
            search: search || undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0
        };
        
        // ============================================
        //   FILTRADO POR ROL INVITADO
        // ============================================
        if (req.user.rol === 'Invitado') {
            // req.permisosInvitado viene del middleware checkInvitadoLicenciatura
            if (!req.permisosInvitado || !req.permisosInvitado.licenciaturas_permitidas) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario invitado sin permisos asignados'
                });
            }

            // Agregar filtro de licenciaturas permitidas
            filters.licenciaturas_invitado = req.permisosInvitado.licenciaturas_permitidas;
        }
        // ============================================
        //  FILTRADO POR ROL: SI ES DOCENTE, SOLO VE SUS LICENCIATURAS
        // ============================================
        else if (req.user.rol === 'Docente') {
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
                        alumnos: [],
                        total: 0,
                        limit: filters.limit,
                        offset: filters.offset
                    },
                    message: 'No tienes licenciaturas asignadas. Contacta al administrador.'
                });
            }
            
            //  Aplicar el filtro de licenciaturas del docente
            if (filters.id_licenciatura) {
                // Verificar que el docente tenga acceso a esa licenciatura
                if (!idsLicenciaturas.includes(filters.id_licenciatura)) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver alumnos de esa licenciatura'
                    });
                }
            } else {
                // Si no hay filtro específico, mostrar alumnos de todas las licenciaturas del docente
                filters.licenciaturas_docente = idsLicenciaturas;
            }
        }
        
        // Obtener alumnos con los filtros aplicados
        const alumnos = await Alumno.getAll(filters);
        const total = await Alumno.count(filters);
        
        res.json({
            success: true,
            data: {
                alumnos,
                total,
                limit: filters.limit,
                offset: filters.offset
            }
        });
        
    } catch (error) {
        console.error('Error en getAll:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alumnos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER ALUMNO POR ID
// ============================================
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // ============================================
        // VERIFICAR PERMISOS DE INVITADO
        // ============================================
        if (req.user.rol === 'Invitado') {
            if (!req.permisosInvitado || !req.permisosInvitado.licenciaturas_permitidas) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario invitado sin permisos asignados'
                });
            }

            // Verificar que el alumno pertenece a una licenciatura permitida
            if (!req.permisosInvitado.licenciaturas_permitidas.includes(alumno.id_licenciatura)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para ver este alumno'
                });
            }
        }
        
        res.json({
            success: true,
            data: alumno
        });
        
    } catch (error) {
        console.error('Error en getById:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alumno'
        });
    }
};

// ============================================
// OBTENER EXPEDIENTE COMPLETO
// ============================================
const getExpediente = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el alumno existe primero
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // ============================================
        //  VERIFICAR PERMISOS DE INVITADO (Licenciatura)
        // ============================================
        if (req.user.rol === 'Invitado') {
            if (!req.permisosInvitado || !req.permisosInvitado.licenciaturas_permitidas) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario invitado sin permisos asignados'
                });
            }

            // Verificar que el alumno pertenece a una licenciatura permitida
            if (!req.permisosInvitado.licenciaturas_permitidas.includes(alumno.id_licenciatura)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para ver el expediente de este alumno'
                });
            }
        }
        
        // Obtener expediente completo
        let expediente = await Alumno.getExpedienteCompleto(parseInt(id));
        
        // Si no hay datos personales, el procedimiento falló
        if (!expediente.datos_personales) {
            console.log('No se obtuvieron datos personales del expediente');
            // Aún así, devolver lo que se pueda
            return res.json({
                success: true,
                message: 'Expediente con datos incompletos',
                data: expediente
            });
        }
        
        // ============================================
        //  FILTRAR DATOS SEGÚN SECCIONES PERMITIDAS (FASE 2)
        // ============================================
        if (req.user.rol === 'Invitado' && req.permisosInvitado) {
            // Importar la función de filtrado (debe estar en auth.middleware)
            const { filtrarDatosSegunPermisos } = require('../middleware/auth.middleware');
            
            // Filtrar expediente según permisos de sección
            expediente = filtrarDatosSegunPermisos(expediente, req.permisosInvitado);
            
            console.log(`Expediente filtrado para invitado: ${req.user.correo}`);
        }
        
        res.json({
            success: true,
            data: expediente
        });
        
    } catch (error) {
        console.error('Error en getExpediente:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al obtener expediente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// CREAR ALUMNO (Con usuario automático)
// ============================================
const create = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const {
            nombre_completo,
            curp,
            fecha_nacimiento,
            correo_institucional,
            correo_personal,
            id_licenciatura,
            generacion
        } = req.body;
        
        // Validaciones
        if (!nombre_completo || !curp || !fecha_nacimiento || !id_licenciatura) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: nombre_completo, curp, fecha_nacimiento, id_licenciatura'
            });
        }
        
        // Validar formato de CURP (18 caracteres)
        if (curp.length !== 18) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El CURP debe tener 18 caracteres'
            });
        }
        
        // Verificar que el CURP no exista
        const [existeCurp] = await connection.execute(
            'SELECT id_alumno FROM alumnos WHERE curp = ?',
            [curp.toUpperCase()]
        );
        
        if (existeCurp.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'El CURP ya está registrado'
            });
        }

        const [existeCorreo] = await connection.execute(
            'SELECT id_usuario FROM usuarios WHERE correo = ?',
            [correo_institucional]
        );
        if (existeCorreo.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({
                success: false,
                message: 'El correo institucional ya está registrado'
            });
        }

        
        // Generar matrícula
        const anio = generacion || new Date().getFullYear();
        const [lastMatricula] = await connection.execute(
            'SELECT MAX(CAST(SUBSTRING(matricula, 5) AS UNSIGNED)) as last_num FROM alumnos WHERE matricula LIKE ?',
            [`${anio}%`]
        );
        const siguiente_numero = (lastMatricula[0]?.last_num || 0) + 1;
        const matricula = `${anio}${String(siguiente_numero).padStart(4, '0')}`;
        
        // PASO 2: Crear usuario automáticamente
        const contrasena_temporal = `Alumno${anio}!`; // Contraseña temporal
        const hash = await hashContrasena(contrasena_temporal);
        
        // Obtener ID del rol "Alumno" (generalmente es 3)
        const [roles] = await connection.execute(
            'SELECT id_rol FROM roles WHERE nombre_rol = ?',
            ['Alumno']
        );
        
        if (roles.length === 0) {
            await connection.rollback();
            return res.status(500).json({
                success: false,
                message: 'No se encontró el rol de Alumno en el sistema'
            });
        }
        
        const id_rol_alumno = roles[0].id_rol;
        
        // Insertar usuario
        const [resultUsuario] = await connection.execute(
            `INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
             VALUES (?, ?, ?, ?, TRUE)`,
            [id_rol_alumno, nombre_completo, correo_institucional, hash]
        );
        
        const id_usuario = resultUsuario.insertId;
        
        // PASO 3: Crear alumno vinculado al usuario
        const [resultAlumno] = await connection.execute(
            `INSERT INTO alumnos (
                id_usuario,
                id_licenciatura,
                nombre_completo,
                curp,
                fecha_nacimiento,
                correo_institucional,
                correo_personal,
                matricula,
                semestre_actual,
                generacion,
                status_alumno
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'Activo')`,
            [
                id_usuario,
                parseInt(id_licenciatura),
                nombre_completo,
                curp.toUpperCase(),
                fecha_nacimiento,
                correo_institucional,
                correo_personal || null,
                matricula,
                anio
            ]
        );
        
        const id_alumno = resultAlumno.insertId;
        
        // Registrar en auditoría
        await connection.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'alumnos', ?, 'INSERT', ?)`,
            [
                req.user.id_usuario,
                id_alumno,
                JSON.stringify({ nombre_completo, curp: curp.toUpperCase(), matricula })
            ]
        );
        
        await connection.commit();
        connection.release();
        
        console.log(`Alumno y usuario creados: ${matricula} - ${correo_institucional}`);
        
        res.status(201).json({
            success: true,
            message: 'Alumno registrado exitosamente',
            data: {
                id_alumno,
                id_usuario,
                matricula,
                correo_institucional,
                contrasena_temporal // Enviar la contraseña temporal para que se la den al alumno
            }
        });
        
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error en create:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error al crear alumno',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ACTUALIZAR ALUMNO
// ============================================
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const alumnoData = req.body;
        
        // Verificar que el alumno existe
        const alumnoExistente = await Alumno.findById(parseInt(id));
        
        if (!alumnoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // Si se está actualizando el CURP, verificar que no exista
        if (alumnoData.curp && alumnoData.curp !== alumnoExistente.curp) {
            const existeCurp = await Alumno.findByCurp(alumnoData.curp);
            if (existeCurp) {
                return res.status(409).json({
                    success: false,
                    message: 'El CURP ya está registrado'
                });
            }
        }
        
        // Actualizar alumno
        const alumnoActualizado = await Alumno.update(parseInt(id), alumnoData);
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores, datos_nuevos)
            VALUES (?, 'alumnos', ?, 'UPDATE', ?, ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify(alumnoExistente),
                JSON.stringify(alumnoData)
            ]
        );
        
        console.log(`Alumno actualizado: ${alumnoExistente.matricula} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Alumno actualizado exitosamente',
            data: alumnoActualizado
        });
        
    } catch (error) {
        console.error('Error en update:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar alumno'
        });
    }
};

// ============================================
// CAMBIAR STATUS DEL ALUMNO
// ============================================
const cambiarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validar status
        const statusValidos = ['Activo', 'Egresado', 'Baja temporal', 'Baja definitiva'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status inválido. Debe ser uno de: ${statusValidos.join(', ')}`
            });
        }
        
        const resultado = await Alumno.cambiarStatus(
            parseInt(id),
            status,
            req.user.id_usuario
        );
        
        console.log(`Status cambiado de alumno ID ${id} a "${status}" por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: resultado
        });
        
    } catch (error) {
        console.error('Error en cambiarStatus:', error.message);
        // El procedimiento almacenado devuelve mensajes pensados para el usuario;
        // un error de la base de datos (trae error.code) no debe llegar crudo
        res.status(500).json({
            success: false,
            message: (!error.code && error.message) || 'Error al cambiar status del alumno'
        });
    }
};

// ============================================
// OBTENER ESTADÍSTICAS
// ============================================
const getEstadisticas = async (req, res) => {
    try {
        const { licenciatura } = req.query;
        let idsLicenciaturas = null;
        
        // ============================================
        // FILTRADO POR ROL: SI ES DOCENTE, SOLO SUS LICENCIATURAS
        // ============================================

        if (req.user.rol === 'Invitado') {
            // req.permisosInvitado viene del middleware checkInvitadoLicenciatura
            if (!req.permisosInvitado || !req.permisosInvitado.licenciaturas_permitidas) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario invitado sin permisos asignados'
                });
            }
            
            idsLicenciaturas = req.permisosInvitado.licenciaturas_permitidas;
            
            // Si hay un filtro de licenciatura específico, verificar que tenga permiso
            if (licenciatura) {
                const licId = parseInt(licenciatura);
                if (!idsLicenciaturas.includes(licId)) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver estadísticas de esa licenciatura'
                    });
                }
                idsLicenciaturas = [licId];
            }
            
            // Si el invitado no tiene licenciaturas asignadas
            if (idsLicenciaturas.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        total: 0,
                        por_licenciatura: [],
                        por_status: [],
                        por_semestre: []
                    }
                });
            }
        }else if (req.user.rol === 'Docente') {
            // Obtener las licenciaturas asignadas al docente
            const [licenciaturasDocente] = await pool.execute(
                `SELECT DISTINCT dl.id_licenciatura
                 FROM docentes d
                 INNER JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
                 WHERE d.id_usuario = ?`,
                [req.user.id_usuario]
            );
            
            idsLicenciaturas = licenciaturasDocente.map(l => l.id_licenciatura);
            
            // Si hay un filtro de licenciatura específico, verificar permisos
            if (licenciatura) {
                const licId = parseInt(licenciatura);
                if (!idsLicenciaturas.includes(licId)) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver estadísticas de esa licenciatura'
                    });
                }
                // Usar solo la licenciatura filtrada
                idsLicenciaturas = [licId];
            }
            
            // Si el docente no tiene licenciaturas, retornar estadísticas vacías
            if (idsLicenciaturas.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        total: 0,
                        por_licenciatura: [],
                        por_status: [],
                        por_semestre: []
                    }
                });
            }
        } else {
            // Para administradores, si hay filtro de licenciatura usarlo
            if (licenciatura) {
                idsLicenciaturas = [parseInt(licenciatura)];
            }
        }
        
        // Construir el filtro de licenciaturas
        let whereLicenciatura = '';
        let params = [];
        
        if (idsLicenciaturas && idsLicenciaturas.length > 0) {
            const placeholders = idsLicenciaturas.map(() => '?').join(',');
            whereLicenciatura = ` AND a.id_licenciatura IN (${placeholders})`;
            params = idsLicenciaturas;
        }
        
        // Total de alumnos
        const [totalResult] = await pool.execute(
            `SELECT COUNT(*) as total 
             FROM alumnos a 
             WHERE 1=1 ${whereLicenciatura}`,
            params
        );
        
        // Por licenciatura
        const [porLicenciatura] = await pool.execute(
            `SELECT 
                l.nombre_licenciatura,
                COUNT(a.id_alumno) as cantidad
             FROM alumnos a
             INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
             WHERE 1=1 ${whereLicenciatura}
             GROUP BY l.id_licenciatura, l.nombre_licenciatura
             ORDER BY l.nombre_licenciatura`,
            params
        );
        
        // Por status
        const [porStatus] = await pool.execute(
            `SELECT 
                a.status_alumno,
                COUNT(*) as cantidad
             FROM alumnos a
             WHERE 1=1 ${whereLicenciatura}
             GROUP BY a.status_alumno
             ORDER BY cantidad DESC`,
            params
        );
        
        // Por semestre
        const [porSemestre] = await pool.execute(
            `SELECT 
                a.semestre_actual,
                COUNT(*) as cantidad
             FROM alumnos a
             WHERE a.semestre_actual IS NOT NULL ${whereLicenciatura}
             GROUP BY a.semestre_actual
             ORDER BY a.semestre_actual`,
            params
        );
        
        const estadisticas = {
            total: totalResult[0].total,
            por_licenciatura: porLicenciatura,
            por_status: porStatus,
            por_semestre: porSemestre
        };
        
        res.json({
            success: true,
            data: estadisticas
        });
        
    } catch (error) {
        console.error('Error en getEstadisticas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};

// ============================================
// OBTENER GENERACIONES DISPONIBLES
// ============================================
const getGeneraciones = async (req, res) => {
    try {
        const generaciones = await Alumno.getGeneraciones();
        
        res.json({
            success: true,
            data: generaciones
        });
        
    } catch (error) {
        console.error('Error en getGeneraciones:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener generaciones'
        });
    }
};

// ============================================
// OBTENER LICENCIATURAS
// ============================================
const getLicenciaturas = async (req, res) => {
    try {
        let query = `
            SELECT 
                l.id_licenciatura, 
                l.nombre_licenciatura, 
                l.numero_semestres, 
                l.activa 
            FROM licenciaturas l
            WHERE l.activa = TRUE
        `;
        
        const params = [];
        
        // ============================================
        // - SI ES DOCENTE, SOLO VER SUS LICENCIATURAS ASIGNADAS
        // ============================================
        if (req.user.rol === 'Docente') {
            query = `
                SELECT DISTINCT
                    l.id_licenciatura, 
                    l.nombre_licenciatura, 
                    l.numero_semestres, 
                    l.activa 
                FROM licenciaturas l
                INNER JOIN docente_licenciatura dl ON l.id_licenciatura = dl.id_licenciatura
                INNER JOIN docentes d ON dl.id_docente = d.id_docente
                WHERE l.activa = TRUE
                  AND d.id_usuario = ?
            `;
            params.push(req.user.id_usuario);
        }
        
        query += ` ORDER BY l.nombre_licenciatura`;
        
        const [licenciaturas] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: licenciaturas
        });
        
    } catch (error) {
        console.error('- Error en getLicenciaturas:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener licenciaturas'
        });
    }
};



// ============================================
// PROMOVER ALUMNOS AL SIGUIENTE SEMESTRE
// ============================================

const promoverSemestre = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { ids_alumnos } = req.body;
        const id_usuario = req.user.id_usuario;
        
        if (!ids_alumnos || !Array.isArray(ids_alumnos) || ids_alumnos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una lista de IDs de alumnos'
            });
        }
        
        await connection.beginTransaction();
        
        let promovidos = 0;
        let graduados = 0;
        const errores = [];
        
        for (const id_alumno of ids_alumnos) {
            try {
                // Obtener información del alumno
                const [alumno] = await connection.query(
                    `SELECT a.semestre_actual, a.nombre_completo, l.numero_semestres 
                     FROM alumnos a 
                     INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura 
                     WHERE a.id_alumno = ? AND a.status_alumno = 'Activo'`,
                    [id_alumno]
                );
                
                if (alumno.length === 0) {
                    errores.push(`Alumno ID ${id_alumno}: No encontrado o no está activo`);
                    continue;
                }
                
                const semestreActual = alumno[0].semestre_actual;
                const numeroSemestres = alumno[0].numero_semestres;
                
                // Si ya completó todos los semestres, marcar como egresado
                if (semestreActual >= numeroSemestres) {
                    await connection.query(
                        'UPDATE alumnos SET status_alumno = ? WHERE id_alumno = ?',
                        ['Egresado', id_alumno]
                    );
                    graduados++;
                } else {
                    // Promover al siguiente semestre
                    await connection.query(
                        'UPDATE alumnos SET semestre_actual = semestre_actual + 1 WHERE id_alumno = ?',
                        [id_alumno]
                    );
                    promovidos++;
                }
                
                // Registrar en auditoría
                await connection.query(
                    `INSERT INTO historial_cambios 
                    (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
                    VALUES (?, 'alumnos', ?, 'UPDATE', ?)`,
                    [id_usuario, id_alumno, `Promovido de semestre ${semestreActual}`]
                );
                
            } catch (error) {
                errores.push(`Alumno ID ${id_alumno}: ${error.message}`);
            }
        }
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `Proceso completado: ${promovidos} promovidos, ${graduados} graduados`,
            data: {
                promovidos,
                graduados,
                errores: errores.length > 0 ? errores : undefined
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error al promover semestre:', error);
        res.status(500).json({
            success: false,
            message: 'Error al promover alumnos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

// ============================================
// CAMBIAR STATUS MASIVO
// ============================================

const cambiarStatusMasivo = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { ids_alumnos, nuevo_status } = req.body;
        const id_usuario = req.user.id_usuario;
        
        // Validar datos
        if (!ids_alumnos || !Array.isArray(ids_alumnos) || ids_alumnos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una lista de IDs de alumnos'
            });
        }
        
        const statusValidos = ['Activo', 'Egresado', 'Baja temporal', 'Baja definitiva'];
        if (!statusValidos.includes(nuevo_status)) {
            return res.status(400).json({
                success: false,
                message: 'Status no válido. Use: Activo, Egresado, Baja temporal o Baja definitiva'
            });
        }
        
        await connection.beginTransaction();
        
        // Actualizar status de todos los alumnos seleccionados
        const placeholders = ids_alumnos.map(() => '?').join(',');
        const [result] = await connection.query(
            `UPDATE alumnos SET status_alumno = ? WHERE id_alumno IN (${placeholders})`,
            [nuevo_status, ...ids_alumnos]
        );
        
        // Registrar en auditoría
        for (const id_alumno of ids_alumnos) {
            await connection.query(
                `INSERT INTO historial_cambios 
                (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
                VALUES (?, 'alumnos', ?, 'UPDATE', ?)`,
                [id_usuario, id_alumno, `Status cambiado a: ${nuevo_status}`]
            );
        }
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `${result.affectedRows} alumnos actualizados a "${nuevo_status}"`,
            data: {
                actualizados: result.affectedRows
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error al cambiar status masivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

// ============================================
// GRADUAR GENERACIÓN COMPLETA
// ============================================

const graduarGeneracion = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { generacion, id_licenciatura } = req.body;
        const id_usuario = req.user.id_usuario;
        
        if (!generacion) {
            return res.status(400).json({
                success: false,
                message: 'Debe especificar la generación'
            });
        }
        
        await connection.beginTransaction();
        
        // Construir query base
        let query = `
            UPDATE alumnos 
            SET status_alumno = 'Egresado' 
            WHERE generacion = ? 
            AND status_alumno = 'Activo'
        `;
        
        const params = [generacion];
        
        // Agregar filtro de licenciatura si se especifica
        if (id_licenciatura) {
            query += ' AND id_licenciatura = ?';
            params.push(id_licenciatura);
        }
        
        const [result] = await connection.query(query, params);
        
        // Registrar en auditoría
        await connection.query(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'alumnos', 0, 'UPDATE', ?)`,
            [
                id_usuario, 
                `Graduación masiva - Generación ${generacion}${id_licenciatura ? ` - Licenciatura ${id_licenciatura}` : ' - Todas las licenciaturas'}`
            ]
        );
        
        await connection.commit();
        
        res.json({
            success: true,
            message: `Graduación completada: ${result.affectedRows} alumnos marcados como Egresados`,
            data: {
                graduados: result.affectedRows,
                generacion,
                licenciatura: id_licenciatura || 'Todas'
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error al graduar generación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al graduar la generación',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

// ============================================
// EXPORTAR CONTROLADORES
// ============================================

module.exports = {
    getAll,
    getById,
    getExpediente,
    create,
    update,
    cambiarStatus,
    getEstadisticas,
    getGeneraciones,
    getLicenciaturas,
    promoverSemestre,
    cambiarStatusMasivo,
    graduarGeneracion
};