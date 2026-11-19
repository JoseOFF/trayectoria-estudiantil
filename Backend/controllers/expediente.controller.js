// ============================================
// CONTROLADOR DE EXPEDIENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');
const Alumno = require('../models/alumno.model');

// ============================================
// ACTUALIZAR DATOS PERSONALES DEL ALUMNO
// ============================================
const actualizarDatosPersonales = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            celular,
            telefono_emergencia,
            correo_personal,
            estado_civil
        } = req.body;
        
        // Verificar que el alumno existe
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // Actualizar datos
        await pool.execute(
            `UPDATE alumnos 
            SET celular = ?,
                telefono_emergencia = ?,
                correo_personal = ?,
                estado_civil = ?
            WHERE id_alumno = ?`,
            [celular, telefono_emergencia, correo_personal, estado_civil, parseInt(id)]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'alumnos', ?, 'UPDATE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify({ celular, telefono_emergencia, correo_personal, estado_civil })
            ]
        );
        
        console.log(`Datos personales actualizados - Alumno ID: ${id} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Datos actualizados correctamente'
        });
        
    } catch (error) {
        console.error('- Error en actualizarDatosPersonales:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar datos personales'
        });
    }
};

// ============================================
// REGISTRAR CALIFICACIÓN DE SEMESTRE
// ============================================
const registrarCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_semestre, promedio } = req.body;
        
        // Validaciones
        if (!numero_semestre || !promedio) {
            return res.status(400).json({
                success: false,
                message: 'Número de semestre y promedio son requeridos'
            });
        }
        
        if (promedio < 0 || promedio > 10) {
            return res.status(400).json({
                success: false,
                message: 'El promedio debe estar entre 0 y 10'
            });
        }
        
        // Verificar que el alumno existe
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // Verificar si ya existe una calificación para ese semestre
        const [existente] = await pool.execute(
            'SELECT id_semestre_promedio FROM semestre_promedio WHERE id_alumno = ? AND numero_semestre = ?',
            [parseInt(id), parseInt(numero_semestre)]
        );
        
        if (existente.length > 0) {
            // Actualizar calificación existente
            await pool.execute(
                'UPDATE semestre_promedio SET promedio = ? WHERE id_alumno = ? AND numero_semestre = ?',
                [parseFloat(promedio), parseInt(id), parseInt(numero_semestre)]
            );
        } else {
            // Insertar nueva calificación
            await pool.execute(
                'INSERT INTO semestre_promedio (id_alumno, numero_semestre, promedio) VALUES (?, ?, ?)',
                [parseInt(id), parseInt(numero_semestre), parseFloat(promedio)]
            );
        }
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'semestre_promedio', ?, 'INSERT', ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify({ numero_semestre, promedio })
            ]
        );
        
        console.log(`Calificación registrada - Alumno ID: ${id}, Semestre: ${numero_semestre}, Promedio: ${promedio}`);
        
        res.json({
            success: true,
            message: 'Calificación registrada correctamente'
        });
        
    } catch (error) {
        console.error('- Error en registrarCalificacion:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al registrar calificación'
        });
    }
};


// ============================================
// CONTROLADOR: ELIMINAR CALIFICACIÓN
// ============================================
const eliminarCalificacion = async (req, res) => {
    try {
        const { id, numero_semestre } = req.params;
        
        // Verificar que el alumno existe
        const [alumno] = await pool.execute(
            'SELECT id_alumno, nombre_completo FROM alumnos WHERE id_alumno = ?',
            [parseInt(id)]
        );
        
        if (alumno.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // Verificar que existe la calificación
        const [calificacion] = await pool.execute(
            'SELECT * FROM semestre_promedio WHERE id_alumno = ? AND numero_semestre = ?',
            [parseInt(id), parseInt(numero_semestre)]
        );
        
        if (calificacion.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Calificación no encontrada'
            });
        }
        
        // Eliminar la calificación
        await pool.execute(
            'DELETE FROM semestre_promedio WHERE id_alumno = ? AND numero_semestre = ?',
            [parseInt(id), parseInt(numero_semestre)]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'semestre_promedio', ?, 'DELETE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify(calificacion[0])
            ]
        );
        
        console.log(`Calificación eliminada - Alumno: ${alumno[0].nombre_completo} (${id}), Semestre: ${numero_semestre} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Calificación eliminada correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar calificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la calificación',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// REGISTRAR INCIDENTE
// ============================================
const registrarIncidente = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            tipo_incidente, 
            fecha_incidente, 
            descripcion,
            estado_incidente,    
            id_docente          
        } = req.body;
        
        // Validaciones
        if (!tipo_incidente || !fecha_incidente || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de incidente, fecha y descripción son requeridos'
            });
        }
        
        // Verificar que el alumno existe
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // Validar estado si viene
        const estadoFinal = estado_incidente || 'Abierto';
        const estadosValidos = ['Abierto', 'En seguimiento', 'Resuelto', 'Cerrado'];
        if (!estadosValidos.includes(estadoFinal)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }
        
        // Procesar id_docente (puede ser null)
        const docenteFinal = id_docente && id_docente !== '' ? parseInt(id_docente) : null;
        
        // Insertar incidente
        const [result] = await pool.execute(
            `INSERT INTO incidentes 
            (id_alumno, id_docente, tipo_incidente, fecha_incidente, descripcion, estado_incidente)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                parseInt(id),
                docenteFinal,
                tipo_incidente,
                fecha_incidente,
                descripcion,
                estadoFinal
            ]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'incidentes', ?, 'INSERT', ?)`,
            [
                req.user.id_usuario,
                result.insertId,
                JSON.stringify({ 
                    id_alumno: id, 
                    tipo_incidente, 
                    fecha_incidente, 
                    descripcion,
                    estado_incidente: estadoFinal,
                    id_docente: docenteFinal
                })
            ]
        );
        
        console.log(`Incidente registrado - Alumno ID: ${id}, Tipo: ${tipo_incidente}, Estado: ${estadoFinal}`);
        
        res.json({
            success: true,
            message: 'Incidente registrado correctamente',
            data: {
                id_incidente: result.insertId
            }
        });
        
    } catch (error) {
        console.error('Error en registrarIncidente:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al registrar incidente'
        });
    }
}; 

// ============================================
// ACTUALIZAR ESTADO DE INCIDENTE
// ============================================
const actualizarEstadoIncidente = async (req, res) => {
    try {
        const { id, id_incidente } = req.params;
        const { estado } = req.body;
        
        // Validar estado
        const estadosValidos = ['Abierto', 'En seguimiento', 'Resuelto', 'Cerrado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }
        
        // Actualizar estado - CORREGIDO: estado_incidente en lugar de estado
        await pool.execute(
            'UPDATE incidentes SET estado_incidente = ? WHERE id_incidente = ? AND id_alumno = ?',
            [estado, parseInt(id_incidente), parseInt(id)]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'incidentes', ?, 'UPDATE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id_incidente),
                JSON.stringify({ estado_incidente: estado })
            ]
        );
        
        res.json({
            success: true,
            message: 'Estado del incidente actualizado correctamente'
        });
        
    } catch (error) {
        console.error('Error en actualizarEstadoIncidente:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado del incidente'
        });
    }
};

/**
 * ACTUALIZAR INCIDENTE (Estado y Docente Asignado)
 */
const actualizarIncidente = async (req, res) => {
    try {
        const { id, id_incidente } = req.params;
        const { estado_incidente, id_docente } = req.body;
        
        // Validar que al menos uno de los campos esté presente
        if (!estado_incidente && !id_docente) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos el estado o el docente asignado'
            });
        }
        
        // Validar estado si viene
        if (estado_incidente) {
            const estadosValidos = ['Abierto', 'En seguimiento', 'Resuelto', 'Cerrado'];
            if (!estadosValidos.includes(estado_incidente)) {
                return res.status(400).json({
                    success: false,
                    message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
                });
            }
        }
        
        // Construir query dinámicamente según los campos a actualizar
        let campos = [];
        let valores = [];
        
        if (estado_incidente) {
            campos.push('estado_incidente = ?');
            valores.push(estado_incidente);
        }
        
        if (id_docente !== undefined) {
            campos.push('id_docente = ?');
            valores.push(id_docente === '' || id_docente === null ? null : parseInt(id_docente));
        }
        
        // Agregar condiciones WHERE
        valores.push(parseInt(id_incidente), parseInt(id));
        
        // Actualizar incidente
        await pool.execute(
            `UPDATE incidentes SET ${campos.join(', ')} 
             WHERE id_incidente = ? AND id_alumno = ?`,
            valores
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'incidentes', ?, 'UPDATE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id_incidente),
                JSON.stringify({ estado_incidente, id_docente })
            ]
        );
        
        console.log(`Incidente actualizado - ID: ${id_incidente}`);
        
        res.json({
            success: true,
            message: 'Incidente actualizado correctamente'
        });
        
    } catch (error) {
        console.error('- Error en actualizarIncidente:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar incidente'
        });
    }
};

// ============================================
// OBTENER LISTA DE DOCENTES
// ============================================
const getDocentes = async (req, res) => {
    try {
        const [docentes] = await pool.execute(`
            SELECT 
                d.id_docente,
                d.nombre_completo,
                d.area_asignada
            FROM docentes d
            WHERE d.activo = TRUE
            ORDER BY d.nombre_completo ASC
        `);
        
        res.json({
            success: true,
            data: docentes
        });
        
    } catch (error) {
        console.error('- Error en getDocentes:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener lista de docentes'
        });
    }
};




// ============================================
// BECAS - EXPEDIENTE
// ============================================

/**
 * OBTENER BECAS DEL ALUMNO
 */
const getBecas = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [becas] = await pool.execute(
            'SELECT * FROM becas WHERE id_alumno = ? ORDER BY activa DESC, fecha_inicio DESC',
            [id]
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
        const { id } = req.params;
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
        
        const [result] = await pool.execute(
            `INSERT INTO becas 
            (id_alumno, nombre_beca, fecha_inicio, fecha_fin, activa)
            VALUES (?, ?, ?, ?, ?)`,
            [
                id,
                nombre_beca,
                fecha_inicio || null,
                fecha_fin || null,
                activa !== undefined ? activa : true
            ]
        );
        
        // Auditoría
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
        const { id, id_beca } = req.params;
        const id_usuario = req.user.id_usuario;
        const {
            nombre_beca,
            fecha_inicio,
            fecha_fin,
            activa
        } = req.body;
        
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
                id_beca,
                id
            ]
        );
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'becas', ?, 'UPDATE', ?)`,
            [id_usuario, id_beca, JSON.stringify(req.body)]
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
        const { id, id_beca } = req.params;
        const id_usuario = req.user.id_usuario;
        
        await pool.execute(
            'DELETE FROM becas WHERE id_beca = ? AND id_alumno = ?',
            [id_beca, id]
        );
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'becas', ?, 'DELETE', ?)`,
            [id_usuario, id_beca, JSON.stringify({ id_beca, id_alumno: id })]
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
// MOVILIDAD ACADÉMICA - EXPEDIENTE
// ============================================

/**
 * OBTENER MOVILIDADES
 */
const getMovilidades = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [movilidades] = await pool.execute(
            'SELECT * FROM movilidad_academica WHERE id_alumno = ? ORDER BY fecha_inicio DESC',
            [id]
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
        const { id } = req.params;
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
        
        const [result] = await pool.execute(
            `INSERT INTO movilidad_academica 
            (id_alumno, nombre_programa, lugar, fecha_inicio, fecha_fin, relato_experiencia)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                nombre_programa,
                lugar || null,
                fecha_inicio || null,
                fecha_fin || null,
                relato_experiencia || null
            ]
        );
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'movilidad_academica', ?, 'INSERT', ?)`,
            [id_usuario, result.insertId, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Movilidad agregada correctamente',
            data: { id_movilidad: result.insertId }
        });
        
    } catch (error) {
        console.error('Error al agregar movilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar movilidad'
        });
    }
};

/**
 * ACTUALIZAR MOVILIDAD
 */
const actualizarMovilidad = async (req, res) => {
    try {
        const { id, id_movilidad } = req.params;
        const id_usuario = req.user.id_usuario;
        const {
            nombre_programa,
            lugar,
            fecha_inicio,
            fecha_fin,
            relato_experiencia
        } = req.body;
        
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
                id_movilidad,
                id
            ]
        );
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'movilidad_academica', ?, 'UPDATE', ?)`,
            [id_usuario, id_movilidad, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Movilidad actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar movilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar movilidad'
        });
    }
};

/**
 * ELIMINAR MOVILIDAD
 */
const eliminarMovilidad = async (req, res) => {
    try {
        const { id, id_movilidad } = req.params;
        const id_usuario = req.user.id_usuario;
        
        await pool.execute(
            'DELETE FROM movilidad_academica WHERE id_movilidad = ? AND id_alumno = ?',
            [id_movilidad, id]
        );
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'movilidad_academica', ?, 'DELETE', ?)`,
            [id_usuario, id_movilidad, JSON.stringify({ id_movilidad, id_alumno: id })]
        );
        
        res.json({
            success: true,
            message: 'Movilidad eliminada correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar movilidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar movilidad'
        });
    }
};

// ============================================
// PRÁCTICAS PROFESIONALES - EXPEDIENTE
// ============================================

/**
 * OBTENER PRÁCTICAS
 */
const getPracticas = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [practicas] = await pool.execute(
            'SELECT * FROM practicas_profesionales WHERE id_alumno = ?',
            [id]
        );
        
        res.json({
            success: true,
            data: practicas.length > 0 ? practicas[0] : null
        });
        
    } catch (error) {
        console.error('Error al obtener prácticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener prácticas'
        });
    }
};

/**
 * GUARDAR/ACTUALIZAR PRÁCTICAS
 */
const guardarPracticas = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id_usuario;
        const {
            habilidades_practicas,
            sigue_orientacion_reglamento,
            tiene_incidentes,
            relato_incidentes
        } = req.body;
        
        // Verificar si ya existe
        const [existentes] = await pool.execute(
            'SELECT id_practicas_profesionales FROM practicas_profesionales WHERE id_alumno = ?',
            [id]
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
                    id
                ]
            );
        } else {
            // Insertar
            await pool.execute(
                `INSERT INTO practicas_profesionales 
                (id_alumno, habilidades_practicas, sigue_orientacion_reglamento, tiene_incidentes, relato_incidentes)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    id,
                    habilidades_practicas || null,
                    sigue_orientacion_reglamento || false,
                    tiene_incidentes || false,
                    relato_incidentes || null
                ]
            );
        }
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'practicas_profesionales', ?, 'UPDATE', ?)`,
            [id_usuario, id, JSON.stringify(req.body)]
        );
        
        res.json({
            success: true,
            message: 'Prácticas guardadas correctamente'
        });
        
    } catch (error) {
        console.error('Error al guardar prácticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar prácticas'
        });
    }
};




// ============================================
// ELIMINAR INCIDENTE
// ============================================

const eliminarIncidente = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { id, id_incidente } = req.params; // id = id_alumno, id_incidente = id del incidente
        const id_usuario = req.user.id_usuario;
        
        // Verificar que el incidente existe y pertenece al alumno
        const [incidenteExistente] = await connection.query(
            'SELECT id_alumno FROM incidentes WHERE id_incidente = ?',
            [id_incidente]
        );
        
        if (incidenteExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Incidente no encontrado'
            });
        }
        
        if (incidenteExistente[0].id_alumno !== parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'El incidente no pertenece a este alumno'
            });
        }
        
        // Eliminar el incidente
        await connection.query(
            'DELETE FROM incidentes WHERE id_incidente = ?',
            [id_incidente]
        );
        
        // Registrar en auditoría
        await connection.query(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'incidentes', ?, 'DELETE', ?)`,
            [id_usuario, id_incidente, JSON.stringify(incidenteExistente[0])]
        );
        
        console.log(`Incidente eliminado: ID ${id_incidente} - Alumno ID: ${id}`);
        
        res.json({
            success: true,
            message: 'Incidente eliminado correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar incidente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el incidente',
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
    actualizarDatosPersonales,
    registrarCalificacion,
    eliminarCalificacion,
    registrarIncidente,
    actualizarEstadoIncidente,
    actualizarIncidente,
    eliminarIncidente,
    getDocentes,
    getBecas,
    agregarBeca,
    actualizarBeca,
    eliminarBeca,
    
    getMovilidades,
    agregarMovilidad,
    actualizarMovilidad,
    eliminarMovilidad,
    
    getPracticas,
    guardarPracticas
};