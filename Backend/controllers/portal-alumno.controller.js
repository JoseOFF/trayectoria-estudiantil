// ============================================
// CONTROLADOR DEL PORTAL DEL ALUMNO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');
const { recalcularCompletitudAlumno } = require('../utils/completitudHelper');


// ============================================
// OBTENER INFORMACIÓN DEL ALUMNO AUTENTICADO
// ============================================
const getMiInformacion = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        // Obtener datos básicos del alumno
        const [alumnos] = await pool.execute(
            `SELECT 
                a.id_alumno,
                a.nombre_completo,
                a.curp,
                a.fecha_nacimiento,
                a.correo_institucional,
                a.correo_personal,
                a.celular,
                a.telefono_emergencia,
                a.matricula,
                a.semestre_actual,
                a.generacion,
                a.status_alumno,
                a.estado_civil,
                a.tiene_hijos,
                a.numero_hijos,
                a.edad_hijos,
                a.representativo_indigena,
                a.habla_lengua_indigena,
                a.lengua_indigena,
                a.embarazada,
                a.meses_embarazo,
                a.situacion_personal,
                a.estado_nacimiento,
                a.municipio_nacimiento,
                l.nombre_licenciatura,
                l.numero_semestres
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            WHERE a.id_usuario = ?`,
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información del alumno'
            });
        }
        
        // Formatear fecha para input type="date" (YYYY-MM-DD)
        const alumno = alumnos[0];
        if (alumno.fecha_nacimiento) {
            const fecha = new Date(alumno.fecha_nacimiento);
            alumno.fecha_nacimiento = fecha.toISOString().split('T')[0];
        }
        
        res.json({
            success: true,
            data: alumno
        });
        
    } catch (error) {
        console.error('Error al obtener información del alumno:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la información',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ACTUALIZAR DATOS PERSONALES
// ============================================
const actualizarDatosPersonales = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const datosRecibidos = req.body;
        
        // Obtener ID del alumno
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const camposPermitidos = [
            // Básicos
            'nombre_completo',
            'matricula',
            'curp',
            'fecha_nacimiento',
            'correo_personal',
            'celular',
            'telefono_emergencia',
            'estado_civil',
            // Lugar de nacimiento
            'municipio_nacimiento',
            'estado_nacimiento',
            // Información indígena
            'representativo_indigena',
            'habla_lengua_indigena',
            'lengua_indigena',
            // Información familiar
            'tiene_hijos',
            'numero_hijos',
            'edad_hijos',
            // Embarazo
            'embarazada',
            'meses_embarazo',
            // Situación
            'situacion_personal'
        ];
        
        const camposActualizar = [];
        const valores = [];
        
        // Construir query dinámicamente
        camposPermitidos.forEach(campo => {
            if (datosRecibidos.hasOwnProperty(campo)) {
                camposActualizar.push(`${campo} = ?`);
                valores.push(datosRecibidos[campo] ?? null);
            }
        });
        
        // Validar que hay campos para actualizar
        if (camposActualizar.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se enviaron campos para actualizar'
            });
        }
        
        valores.push(id_alumno);
        
        // Ejecutar actualización
        const query = `UPDATE alumnos SET ${camposActualizar.join(', ')} WHERE id_alumno = ?`;
        await pool.execute(query, valores);
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'alumnos', ?, 'UPDATE', ?)`,
            [id_usuario, id_alumno, JSON.stringify(datosRecibidos)]
        );
        
        // Recalcular completitud
        await recalcularCompletitudAlumno(id_alumno);

        res.json({
            success: true,
            message: 'Datos personales actualizados correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar datos personales:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar los datos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER/CREAR DATOS DE SALUD
// ============================================
const getMisDatosSalud = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [datosSalud] = await pool.execute(
            `SELECT * FROM datos_salud WHERE id_alumno = ?`,
            [id_alumno]
        );
        
        res.json({
            success: true,
            data: datosSalud.length > 0 ? datosSalud[0] : null
        });
        
    } catch (error) {
        console.error('Error al obtener datos de salud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const guardarDatosSalud = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            tipo_sangre,
            afiliacion_seguro_medico,
            numero_seguro_social,
            alergias,
            tiene_enfermedad,
            nombre_enfermedad
        } = req.body;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        // Verificar si ya existen datos de salud
        const [existing] = await pool.execute(
            'SELECT id_datos_salud FROM datos_salud WHERE id_alumno = ?',
            [id_alumno]
        );
        
        if (existing.length > 0) {
            // Actualizar
            await pool.execute(
                `UPDATE datos_salud 
                SET tipo_sangre = ?,
                    afiliacion_seguro_medico = ?,
                    numero_seguro_social = ?,
                    alergias = ?,
                    tiene_enfermedad = ?,
                    nombre_enfermedad = ?
                WHERE id_alumno = ?`,
                [tipo_sangre, afiliacion_seguro_medico, numero_seguro_social, alergias, tiene_enfermedad, nombre_enfermedad, id_alumno]
            );
        } else {
            // Insertar
            await pool.execute(
                `INSERT INTO datos_salud 
                (id_alumno, tipo_sangre, afiliacion_seguro_medico, numero_seguro_social, alergias, tiene_enfermedad, nombre_enfermedad)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id_alumno, tipo_sangre, afiliacion_seguro_medico, numero_seguro_social, alergias, tiene_enfermedad, nombre_enfermedad]
            );
        }
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'datos_salud', ?, ?, ?)`,
            [id_usuario, id_alumno, existing.length > 0 ? 'UPDATE' : 'INSERT', JSON.stringify(req.body)]
        );
        
        // Recalcular completitud
        await recalcularCompletitudAlumno(id_alumno);

        res.json({
            success: true,
            message: 'Datos de salud guardados correctamente'
        });
        
    } catch (error) {
        console.error('Error al guardar datos de salud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar los datos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// GESTIONAR FAMILIARES
// ============================================
const getMisFamiliares = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [familiares] = await pool.execute(
            `SELECT * FROM familiares WHERE id_alumno = ? ORDER BY es_tutor DESC, tipo_familiar`,
            [id_alumno]
        );
        
        res.json({
            success: true,
            data: familiares
        });
        
    } catch (error) {
        console.error('Error al obtener familiares:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los familiares',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const agregarFamiliar = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            tipo_familiar,
            nombre_completo,
            telefono,
            ocupacion,
            es_tutor
        } = req.body;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        await pool.execute(
            `INSERT INTO familiares 
            (id_alumno, tipo_familiar, nombre_completo, telefono, ocupacion, es_tutor)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [id_alumno, tipo_familiar, nombre_completo, telefono, ocupacion, es_tutor]
        );
        
        // Recalcular completitud
        await recalcularCompletitudAlumno(id_alumno);

        res.json({
            success: true,
            message: 'Familiar agregado correctamente'
        });
        
    } catch (error) {
        console.error('Error al agregar familiar:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar el familiar',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const eliminarFamiliar = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        
        // Verificar que el familiar pertenece al alumno y obtener id_alumno
        const [check] = await pool.execute(
            `SELECT f.id_familiar, a.id_alumno 
            FROM familiares f
            INNER JOIN alumnos a ON f.id_alumno = a.id_alumno
            WHERE f.id_familiar = ? AND a.id_usuario = ?`,
            [id, id_usuario]
        );
        
        if (check.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este familiar'
            });
        }
        
        const id_alumno = check[0].id_alumno;

        await pool.execute(
            'DELETE FROM familiares WHERE id_familiar = ?',
            [id]
        );
        
        // Recalcular completitud
        await recalcularCompletitudAlumno(id_alumno);
        
        res.json({
            success: true,
            message: 'Familiar eliminado correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar familiar:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el familiar',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// ============================================
// MIS CALIFICACIONES
// ============================================
const getMisCalificaciones = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        // Obtener calificaciones por semestre
        const [calificaciones] = await pool.execute(
            `SELECT 
                numero_semestre,
                promedio,
                fecha_registro
            FROM semestre_promedio
            WHERE id_alumno = ?
            ORDER BY numero_semestre DESC`,
            [id_alumno]
        );
        
        // Calcular promedio general
        const [promedioGeneral] = await pool.execute(
            `SELECT AVG(promedio) as promedio_general
            FROM semestre_promedio
            WHERE id_alumno = ?`,
            [id_alumno]
        );
        
        res.json({
            success: true,
            data: {
                calificaciones,
                promedio_general: promedioGeneral[0].promedio_general || 0
            }
        });
        
    } catch (error) {
        console.error('Error al obtener calificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las calificaciones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// ============================================
// ELIMINAR CALIFICACIÓN (portal alumno)
// ============================================
const eliminarMiCalificacion = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { numero_semestre } = req.params;

        // Obtener id_alumno del usuario autenticado
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );

        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        const id_alumno = alumnos[0].id_alumno;

        // Verificar que la calificación existe Y pertenece a este alumno
        const [calificacion] = await pool.execute(
            'SELECT * FROM semestre_promedio WHERE id_alumno = ? AND numero_semestre = ?',
            [id_alumno, parseInt(numero_semestre)]
        );

        if (calificacion.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Calificación no encontrada'
            });
        }

        // Eliminar
        await pool.execute(
            'DELETE FROM semestre_promedio WHERE id_alumno = ? AND numero_semestre = ?',
            [id_alumno, parseInt(numero_semestre)]
        );

        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'semestre_promedio', ?, 'DELETE', ?)`,
            [id_usuario, id_alumno, JSON.stringify(calificacion[0])]
        );

        res.json({
            success: true,
            message: 'Calificación eliminada correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar calificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la calificación'
        });
    }
};

// ============================================
// MIS DOCUMENTOS
// ============================================
const getMisDocumentos = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [documentos] = await pool.execute(
            `SELECT 
                d.id_documento,
                d.tipo_documento,
                d.nombre_archivo,
                d.tipo_mime,
                d.tamano_mb,
                d.fecha_subida,
                u.nombre_usuario as subido_por
            FROM documentos d
            LEFT JOIN usuarios u ON d.subido_por = u.id_usuario
            WHERE d.id_alumno = ?
            ORDER BY d.fecha_subida DESC`,
            [id_alumno]
        );
        
        res.json({
            success: true,
            data: documentos
        });
        
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los documentos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ACTUALIZAR/CREAR DOMICILIO
// ============================================
const actualizarDomicilio = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { calle, numero, colonia, municipio, estado, referencia } = req.body;
        
        // Validaciones
        if (!calle || !numero || !colonia || !municipio || !estado) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos del domicilio'
            });
        }
        
        // Obtener alumno
        const [alumnos] = await pool.execute(
            'SELECT id_alumno, id_domicilio FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const { id_alumno, id_domicilio } = alumnos[0];
        
        if (id_domicilio) {
            // Actualizar domicilio existente
            await pool.execute(
                `UPDATE domicilios 
                SET calle = ?, numero = ?, colonia = ?, municipio = ?, estado = ?, referencia = ?
                WHERE id_domicilio = ?`,
                [calle, numero, colonia, municipio, estado, referencia || null, id_domicilio]
            );
        } else {
            // Crear nuevo domicilio
            const [result] = await pool.execute(
                `INSERT INTO domicilios (calle, numero, colonia, municipio, estado, referencia)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [calle, numero, colonia, municipio, estado, referencia || null]
            );
            
            const nuevo_id_domicilio = result.insertId;
            
            // Vincular domicilio con alumno
            await pool.execute(
                'UPDATE alumnos SET id_domicilio = ? WHERE id_alumno = ?',
                [nuevo_id_domicilio, id_alumno]
            );
        }
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'domicilios', ?, 'UPDATE', ?)`,
            [id_usuario, id_domicilio || 0, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Domicilio actualizado correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar domicilio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar domicilio',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// ============================================
// OBTENER DOMICILIO
// ============================================
const getMiDomicilio = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [result] = await pool.execute(
            `SELECT d.* FROM alumnos a
            LEFT JOIN domicilios d ON a.id_domicilio = d.id_domicilio
            WHERE a.id_usuario = ?`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: result[0] || null
        });
        
    } catch (error) {
        console.error('Error al obtener domicilio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener domicilio'
        });
    }
};


// ============================================
// ACTUALIZAR/CREAR DATOS SOCIOECONÓMICOS
// ============================================
const actualizarDatosSocioeconomicos = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            recursos_economicos,
            dependencia_economica,
            alguien_depende_ti,
            trabaja,
            lugar_trabajo,
            horario_trabajo,
            renta_fuera_domicilio,
            domicilio_renta // NUEVO
        } = req.body;
        
        // Obtener alumno
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        // Variable para el ID del domicilio de renta
        let id_domicilio_renta = null;
        
        // NUEVO: Procesar domicilio de renta
        if (renta_fuera_domicilio && domicilio_renta) {
            const { calle, numero, colonia, municipio, estado, referencia } = domicilio_renta;
            
            // Verificar si ya existe un domicilio de renta
            const [datosActuales] = await pool.execute(
                'SELECT id_domicilio_renta FROM datos_socioeconomicos WHERE id_alumno = ?',
                [id_alumno]
            );
            
            if (datosActuales.length > 0 && datosActuales[0].id_domicilio_renta) {
                // Actualizar domicilio existente
                await pool.execute(
                    `UPDATE domicilios 
                    SET calle = ?, numero = ?, colonia = ?, municipio = ?, estado = ?, referencia = ?
                    WHERE id_domicilio = ?`,
                    [calle, numero, colonia, municipio, estado, referencia || null, datosActuales[0].id_domicilio_renta]
                );
                id_domicilio_renta = datosActuales[0].id_domicilio_renta;
            } else {
                // Crear nuevo domicilio
                const [result] = await pool.execute(
                    `INSERT INTO domicilios (calle, numero, colonia, municipio, estado, referencia)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [calle, numero, colonia, municipio, estado, referencia || null]
                );
                id_domicilio_renta = result.insertId;
            }
        }
        
        // Verificar si ya existen datos socioeconómicos
        const [existentes] = await pool.execute(
            'SELECT id_datos_socioeconomicos FROM datos_socioeconomicos WHERE id_alumno = ?',
            [id_alumno]
        );
        
        if (existentes.length > 0) {
            // Actualizar
            await pool.execute(
                `UPDATE datos_socioeconomicos SET
                recursos_economicos = ?,
                dependencia_economica = ?,
                alguien_depende_ti = ?,
                trabaja = ?,
                lugar_trabajo = ?,
                horario_trabajo = ?,
                renta_fuera_domicilio = ?,
                id_domicilio_renta = ?
                WHERE id_alumno = ?`,
                [
                    recursos_economicos || null,
                    dependencia_economica || null,
                    alguien_depende_ti || false,
                    trabaja || false,
                    lugar_trabajo || null,
                    horario_trabajo || null,
                    renta_fuera_domicilio || false,
                    id_domicilio_renta,
                    id_alumno
                ]
            );
        } else {
            // Insertar
            await pool.execute(
                `INSERT INTO datos_socioeconomicos 
                (id_alumno, recursos_economicos, dependencia_economica, alguien_depende_ti, 
                trabaja, lugar_trabajo, horario_trabajo, renta_fuera_domicilio, id_domicilio_renta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_alumno,
                    recursos_economicos || null,
                    dependencia_economica || null,
                    alguien_depende_ti || false,
                    trabaja || false,
                    lugar_trabajo || null,
                    horario_trabajo || null,
                    renta_fuera_domicilio || false,
                    id_domicilio_renta
                ]
            );
        }
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'datos_socioeconomicos', ?, 'UPDATE', ?)`,
            [id_usuario, id_alumno, JSON.stringify(req.body)]
        );
        
        // Recalcular completitud
        await recalcularCompletitudAlumno(id_alumno);

        res.json({
            success: true,
            message: 'Datos socioeconómicos actualizados correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar datos socioeconómicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar datos socioeconómicos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER DATOS SOCIOECONÓMICOS
// ============================================
const getMisDatosSocioeconomicos = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        // Obtener datos socioeconómicos CON domicilio de renta
        const [datos] = await pool.execute(
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
        
        if (datos.length === 0) {
            return res.json({
                success: true,
                data: null
            });
        }
        
        // Formatear respuesta
        const resultado = {
            ...datos[0],
            domicilio_renta: datos[0].calle ? {
                calle: datos[0].calle,
                numero: datos[0].numero,
                colonia: datos[0].colonia,
                municipio: datos[0].municipio,
                estado: datos[0].estado,
                referencia: datos[0].referencia
            } : null
        };
        
        // Limpiar campos del domicilio que ya están en domicilio_renta
        delete resultado.calle;
        delete resultado.numero;
        delete resultado.colonia;
        delete resultado.municipio;
        delete resultado.estado;
        delete resultado.referencia;
        
        res.json({
            success: true,
            data: resultado
        });
        
    } catch (error) {
        console.error('Error al obtener datos socioeconómicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos socioeconómicos'
        });
    }
};

// ============================================
// DATOS ACADÉMICOS
// ============================================

/**
 * OBTENER DATOS ACADÉMICOS
 */
const getMisDatosAcademicos = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [result] = await pool.execute(
            `SELECT 
                a.generacion,
                da.escuela_procedencia,
                da.promedio_media_superior,
                da.situacion_academica,
                da.cursos_irregulares,
                da.curso_mayor_dificultad,
                da.motivo_dificultad
            FROM alumnos a
            LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
            WHERE a.id_usuario = ?`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: result[0] || null
        });
        
    } catch (error) {
        console.error('Error al obtener datos académicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos académicos'
        });
    }
};

/**
 * ACTUALIZAR/CREAR DATOS ACADÉMICOS
 */
const actualizarDatosAcademicos = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            escuela_procedencia,
            promedio_media_superior,
            situacion_academica,
            cursos_irregulares,
            curso_mayor_dificultad,
            motivo_dificultad,
            generacion
        } = req.body;
        
        // Obtener alumno
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;

        //Actualizar generación en tabla alumnos
        if (generacion) {
            await pool.execute(
                'UPDATE alumnos SET generacion = ? WHERE id_alumno = ?',
                [generacion, id_alumno]
            );
        }
        
        // Verificar si ya existen datos
        const [existentes] = await pool.execute(
            'SELECT id_datos_academicos FROM datos_academicos WHERE id_alumno = ?',
            [id_alumno]
        );
        
        if (existentes.length > 0) {
            // Actualizar
            await pool.execute(
                `UPDATE datos_academicos SET
                escuela_procedencia = ?,
                promedio_media_superior = ?,
                situacion_academica = ?,
                cursos_irregulares = ?,
                curso_mayor_dificultad = ?,
                motivo_dificultad = ?
                WHERE id_alumno = ?`,
                [
                    escuela_procedencia || null,
                    promedio_media_superior || null,
                    situacion_academica || null,
                    cursos_irregulares || null,
                    curso_mayor_dificultad || null,
                    motivo_dificultad || null,
                    id_alumno
                ]
            );
        } else {
            // Insertar
            await pool.execute(
                `INSERT INTO datos_academicos 
                (id_alumno, escuela_procedencia, promedio_media_superior, situacion_academica, 
                cursos_irregulares, curso_mayor_dificultad, motivo_dificultad)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_alumno,
                    escuela_procedencia || null,
                    promedio_media_superior || null,
                    situacion_academica || null,
                    cursos_irregulares || null,
                    curso_mayor_dificultad || null,
                    motivo_dificultad || null
                ]
            );
        }
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'datos_academicos', ?, 'UPDATE', ?)`,
            [id_usuario, id_alumno, JSON.stringify(req.body)]
        );
        
        // Recalcular completitud
        await recalcularCompletitudAlumno(id_alumno);

        res.json({
            success: true,
            message: 'Datos académicos actualizados correctamente'
        });
        
    } catch (error) {
        console.error('- Error al actualizar datos académicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar datos académicos'
        });
    }
};

// ============================================
// DESEMPEÑO ACADÉMICO
// ============================================

/**
 * OBTENER DESEMPEÑO ACADÉMICO
 */
const getMiDesempeno = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [result] = await pool.execute(
            `SELECT d.* FROM alumnos a
            LEFT JOIN desempeno_academico d ON a.id_alumno = d.id_alumno
            WHERE a.id_usuario = ?`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: result[0] || null
        });
        
    } catch (error) {
        console.error('- Error al obtener desempeño:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener desempeño académico'
        });
    }
};

/**
 * ACTUALIZAR/CREAR DESEMPEÑO ACADÉMICO
 */
const actualizarDesempeno = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            club_inscrito,
            eventos_participados,
            participo_como_ponente,
            interes_intercambio
        } = req.body;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [existentes] = await pool.execute(
            'SELECT id_desempeno_academico FROM desempeno_academico WHERE id_alumno = ?',
            [id_alumno]
        );
        
        if (existentes.length > 0) {
            await pool.execute(
                `UPDATE desempeno_academico SET
                club_inscrito = ?,
                eventos_participados = ?,
                participo_como_ponente = ?,
                interes_intercambio = ?
                WHERE id_alumno = ?`,
                [
                    club_inscrito || null,
                    eventos_participados || null,
                    participo_como_ponente || false,
                    interes_intercambio || null,
                    id_alumno
                ]
            );
        } else {
            await pool.execute(
                `INSERT INTO desempeno_academico 
                (id_alumno, club_inscrito, eventos_participados, participo_como_ponente, interes_intercambio)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    id_alumno,
                    club_inscrito || null,
                    eventos_participados || null,
                    participo_como_ponente || false,
                    interes_intercambio || null
                ]
            );
        }
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'desempeno_academico', ?, 'UPDATE', ?)`,
            [id_usuario, id_alumno, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Desempeño académico actualizado correctamente'
        });
        
    } catch (error) {
        console.error('- Error al actualizar desempeño:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar desempeño académico'
        });
    }
};

// ============================================
// CERTIFICACIONES
// ============================================

/**
 * OBTENER CERTIFICACIONES
 */
const getMisCertificaciones = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [certificaciones] = await pool.execute(
            `SELECT c.* FROM alumnos a
            INNER JOIN certificaciones c ON a.id_alumno = c.id_alumno
            WHERE a.id_usuario = ?
            ORDER BY c.fecha_obtencion DESC`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: certificaciones
        });
        
    } catch (error) {
        console.error('- Error al obtener certificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener certificaciones'
        });
    }
};

/**
 * AGREGAR CERTIFICACIÓN
 */
const agregarCertificacion = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            nombre_certificacion,
            fecha_obtencion,
            fecha_vencimiento,
            institucion_emisora
        } = req.body;
        
        if (!nombre_certificacion || !institucion_emisora) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [result] = await pool.execute(
            `INSERT INTO certificaciones 
            (id_alumno, nombre_certificacion, fecha_obtencion, fecha_vencimiento, institucion_emisora)
            VALUES (?, ?, ?, ?, ?)`,
            [
                id_alumno,
                nombre_certificacion,
                fecha_obtencion || null,
                fecha_vencimiento || null,
                institucion_emisora
            ]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'certificaciones', ?, 'INSERT', ?)`,
            [id_usuario, result.insertId, JSON.stringify(req.body)]
        );
        
        res.status(201).json({
            success: true,
            message: 'Certificación agregada correctamente',
            data: { id_certificacion: result.insertId }
        });
        
    } catch (error) {
        console.error('- Error al agregar certificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar certificación'
        });
    }
};

/**
 * ELIMINAR CERTIFICACIÓN
 */
const eliminarCertificacion = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        await pool.execute(
            'DELETE FROM certificaciones WHERE id_certificacion = ? AND id_alumno = ?',
            [id, alumnos[0].id_alumno]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'certificaciones', ?, 'DELETE', ?)`,
            [id_usuario, id, JSON.stringify({ id_certificacion: id })]
        );
        
        res.json({
            success: true,
            message: 'Certificación eliminada correctamente'
        });
        
    } catch (error) {
        console.error('- Error al eliminar certificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar certificación'
        });
    }
};

// ============================================
// HABILIDADES
// ============================================

/**
 * OBTENER HABILIDADES
 */
const getMisHabilidades = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [habilidades] = await pool.execute(
            `SELECT h.* FROM alumnos a
            INNER JOIN alumno_habilidad h ON a.id_alumno = h.id_alumno
            WHERE a.id_usuario = ?
            ORDER BY h.fecha_registro DESC`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: habilidades
        });
        
    } catch (error) {
        console.error('- Error al obtener habilidades:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener habilidades'
        });
    }
};

/**
 * AGREGAR HABILIDAD
 */
const agregarHabilidad = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            nombre_habilidad,
            nivel,
            actitud_habilidad
        } = req.body;
        
        if (!nombre_habilidad || !nivel) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [result] = await pool.execute(
            `INSERT INTO alumno_habilidad 
            (id_alumno, nombre_habilidad, nivel, actitud_habilidad)
            VALUES (?, ?, ?, ?)`,
            [
                id_alumno,
                nombre_habilidad,
                nivel,
                actitud_habilidad || null
            ]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'alumno_habilidad', ?, 'INSERT', ?)`,
            [id_usuario, result.insertId, JSON.stringify(req.body)]
        );
        
        res.status(201).json({
            success: true,
            message: 'Habilidad agregada correctamente',
            data: { id_alumno_habilidad: result.insertId }
        });
        
    } catch (error) {
        console.error('- Error al agregar habilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar habilidad'
        });
    }
};

/**
 * ELIMINAR HABILIDAD
 */
const eliminarHabilidad = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        await pool.execute(
            'DELETE FROM alumno_habilidad WHERE id_alumno_habilidad = ? AND id_alumno = ?',
            [id, alumnos[0].id_alumno]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'alumno_habilidad', ?, 'DELETE', ?)`,
            [id_usuario, id, JSON.stringify({ id_alumno_habilidad: id })]
        );
        
        res.json({
            success: true,
            message: 'Habilidad eliminada correctamente'
        });
        
    } catch (error) {
        console.error('- Error al eliminar habilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar habilidad'
        });
    }
};


// ============================================
// BECAS
// ============================================

/**
 * OBTENER BECAS DEL ALUMNO
 */
const getMisBecas = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [becas] = await pool.execute(
            `SELECT b.* FROM alumnos a
            INNER JOIN becas b ON a.id_alumno = b.id_alumno
            WHERE a.id_usuario = ?
            ORDER BY b.activa DESC, b.fecha_inicio DESC`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: becas
        });
        
    } catch (error) {
        console.error('Error al obtener becas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener becas'
        });
    }
};

/**
 * AGREGAR BECA
 */
const agregarBeca = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            nombre_beca,
            fecha_inicio,
            fecha_fin,
            activa
        } = req.body;
        
        if (!nombre_beca) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la beca es requerido'
            });
        }
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [result] = await pool.execute(
            `INSERT INTO becas 
            (id_alumno, nombre_beca, fecha_inicio, fecha_fin, activa)
            VALUES (?, ?, ?, ?, ?)`,
            [
                id_alumno,
                nombre_beca,
                fecha_inicio || null,
                fecha_fin || null,
                activa !== undefined ? activa : true
            ]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'becas', ?, 'INSERT', ?)`,
            [id_usuario, result.insertId, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Beca agregada correctamente',
            data: { id_beca: result.insertId }
        });
        
    } catch (error) {
        console.error('Error al agregar beca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar beca'
        });
    }
};

/**
 * ACTUALIZAR BECA
 */
const actualizarBeca = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        const {
            nombre_beca,
            fecha_inicio,
            fecha_fin,
            activa
        } = req.body;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        await pool.execute(
            `UPDATE becas SET
            nombre_beca = ?,
            fecha_inicio = ?,
            fecha_fin = ?,
            activa = ?
            WHERE id_beca = ? AND id_alumno = ?`,
            [
                nombre_beca,
                fecha_inicio || null,
                fecha_fin || null,
                activa !== undefined ? activa : true,
                id,
                alumnos[0].id_alumno
            ]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'becas', ?, 'UPDATE', ?)`,
            [id_usuario, id, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Beca actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar beca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar beca'
        });
    }
};

/**
 * ELIMINAR BECA
 */
const eliminarBeca = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        await pool.execute(
            'DELETE FROM becas WHERE id_beca = ? AND id_alumno = ?',
            [id, alumnos[0].id_alumno]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'becas', ?, 'DELETE', ?)`,
            [id_usuario, id, JSON.stringify({ id_beca: id })]
        );
        
        res.json({
            success: true,
            message: 'Beca eliminada correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar beca:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar beca'
        });
    }
};

// ============================================
// MOVILIDAD ACADÉMICA
// ============================================

/**
 * OBTENER MOVILIDADES
 */
const getMisMovilidades = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [movilidades] = await pool.execute(
            `SELECT m.* FROM alumnos a
            INNER JOIN movilidad_academica m ON a.id_alumno = m.id_alumno
            WHERE a.id_usuario = ?
            ORDER BY m.fecha_inicio DESC`,
            [id_usuario]
        );
        
        res.json({
            success: true,
            data: movilidades
        });
        
    } catch (error) {
        console.error('Error al obtener movilidades:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener movilidades'
        });
    }
};

/**
 * AGREGAR MOVILIDAD
 */
const agregarMovilidad = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            nombre_programa,
            lugar,
            fecha_inicio,
            fecha_fin,
            relato_experiencia
        } = req.body;
        
        if (!nombre_programa) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del programa es requerido'
            });
        }
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        const [result] = await pool.execute(
            `INSERT INTO movilidad_academica 
            (id_alumno, nombre_programa, lugar, fecha_inicio, fecha_fin, relato_experiencia)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id_alumno,
                nombre_programa,
                lugar || null,
                fecha_inicio || null,
                fecha_fin || null,
                relato_experiencia || null
            ]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'movilidad_academica', ?, 'INSERT', ?)`,
            [id_usuario, result.insertId, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Movilidad académica agregada correctamente',
            data: { id_movilidad: result.insertId }
        });
        
    } catch (error) {
        console.error('Error al agregar movilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar movilidad académica'
        });
    }
};

/**
 * ACTUALIZAR MOVILIDAD
 */
const actualizarMovilidad = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        const {
            nombre_programa,
            lugar,
            fecha_inicio,
            fecha_fin,
            relato_experiencia
        } = req.body;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        await pool.execute(
            `UPDATE movilidad_academica SET
            nombre_programa = ?,
            lugar = ?,
            fecha_inicio = ?,
            fecha_fin = ?,
            relato_experiencia = ?
            WHERE id_movilidad = ? AND id_alumno = ?`,
            [
                nombre_programa,
                lugar || null,
                fecha_inicio || null,
                fecha_fin || null,
                relato_experiencia || null,
                id,
                alumnos[0].id_alumno
            ]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'movilidad_academica', ?, 'UPDATE', ?)`,
            [id_usuario, id, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Movilidad académica actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar movilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar movilidad académica'
        });
    }
};

/**
 * ELIMINAR MOVILIDAD
 */
const eliminarMovilidad = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const { id } = req.params;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        await pool.execute(
            'DELETE FROM movilidad_academica WHERE id_movilidad = ? AND id_alumno = ?',
            [id, alumnos[0].id_alumno]
        );
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'movilidad_academica', ?, 'DELETE', ?)`,
            [id_usuario, id, JSON.stringify({ id_movilidad: id })]
        );
        
        res.json({
            success: true,
            message: 'Movilidad académica eliminada correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar movilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar movilidad académica'
        });
    }
};

// ============================================
// PRÁCTICAS PROFESIONALES
// ============================================

/**
 * OBTENER PRÁCTICAS
 */
const getMisPracticas = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const [practicas] = await pool.execute(
            'SELECT * FROM practicas_profesionales WHERE id_alumno = ?',
            [alumnos[0].id_alumno]
        );
        
        res.json({
            success: true,
            data: practicas.length > 0 ? practicas[0] : null
        });
        
    } catch (error) {
        console.error('Error al obtener prácticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener prácticas profesionales'
        });
    }
};

/**
 * GUARDAR/ACTUALIZAR PRÁCTICAS
 */
const guardarPracticas = async (req, res) => {
    try {
        const id_usuario = req.user.id_usuario;
        const {
            habilidades_practicas,
            sigue_orientacion_reglamento,
            tiene_incidentes,
            relato_incidentes
        } = req.body;
        
        const [alumnos] = await pool.execute(
            'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (alumnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        const id_alumno = alumnos[0].id_alumno;
        
        // Verificar si ya existe
        const [existentes] = await pool.execute(
            'SELECT id_practicas_profesionales FROM practicas_profesionales WHERE id_alumno = ?',
            [id_alumno]
        );
        
        if (existentes.length > 0) {
            // Actualizar
            await pool.execute(
                `UPDATE practicas_profesionales SET
                habilidades_practicas = ?,
                sigue_orientacion_reglamento = ?,
                tiene_incidentes = ?,
                relato_incidentes = ?
                WHERE id_alumno = ?`,
                [
                    habilidades_practicas || null,
                    sigue_orientacion_reglamento || false,
                    tiene_incidentes || false,
                    relato_incidentes || null,
                    id_alumno
                ]
            );
        } else {
            // Insertar
            await pool.execute(
                `INSERT INTO practicas_profesionales 
                (id_alumno, habilidades_practicas, sigue_orientacion_reglamento, tiene_incidentes, relato_incidentes)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    id_alumno,
                    habilidades_practicas || null,
                    sigue_orientacion_reglamento || false,
                    tiene_incidentes || false,
                    relato_incidentes || null
                ]
            );
        }
        
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'practicas_profesionales', ?, 'UPDATE', ?)`,
            [id_usuario, id_alumno, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Prácticas profesionales guardadas correctamente'
        });
        
    } catch (error) {
        console.error('Error al guardar prácticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar prácticas profesionales'
        });
    }
};





// ============================================
// EXPORTAR CONTROLADOR
// ============================================
module.exports = {
    getMiInformacion,
    actualizarDatosPersonales,
    getMisDatosSalud,
    guardarDatosSalud,
    getMisFamiliares,
    agregarFamiliar,
    eliminarFamiliar,
    getMisCalificaciones,
    actualizarDomicilio,
    getMiDomicilio,
    actualizarDatosSocioeconomicos,
    getMisDatosSocioeconomicos,
    getMisDocumentos,
    getMisDatosAcademicos,
    actualizarDatosAcademicos,
    getMiDesempeno,
    actualizarDesempeno,
    getMisCertificaciones,
    agregarCertificacion,
    eliminarCertificacion,
    getMisHabilidades,
    agregarHabilidad,
    eliminarHabilidad,
    getMisBecas,
    agregarBeca,
    actualizarBeca,
    eliminarBeca,
    getMisMovilidades,
    agregarMovilidad,
    actualizarMovilidad,
    eliminarMovilidad,
    getMisPracticas,
    guardarPracticas,
    eliminarMiCalificacion
};