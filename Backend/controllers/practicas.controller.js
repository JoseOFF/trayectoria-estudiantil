// ============================================
// CONTROLADOR DE PRÁCTICAS PROFESIONALES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');

// ============================================
// OBTENER TODAS LAS PRÁCTICAS DE UN ALUMNO
// ============================================
const obtenerPracticasAlumno = async (req, res) => {
    try {
        const { id } = req.params; // id_alumno
        
        const [practicas] = await pool.execute(
            `SELECT 
                p.*,
                DATEDIFF(p.fecha_fin, p.fecha_inicio) as dias_practica
            FROM practicas_profesionales p
            WHERE p.id_alumno = ?
            ORDER BY p.fecha_inicio DESC`,
            [id]
        );
        
        res.json({
            success: true,
            data: practicas
        });
        
    } catch (error) {
        console.error('Error al obtener prácticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener prácticas profesionales'
        });
    }
};

// ============================================
// OBTENER UNA PRÁCTICA POR ID
// ============================================
const obtenerPracticaPorId = async (req, res) => {
    try {
        const { id } = req.params; // id_practica
        
        const [practica] = await pool.execute(
            `SELECT * FROM practicas_profesionales WHERE id_practica = ?`,
            [id]
        );
        
        if (practica.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Práctica no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: practica[0]
        });
        
    } catch (error) {
        console.error('Error al obtener práctica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la práctica'
        });
    }
};

// ============================================
// REGISTRAR NUEVA PRÁCTICA
// ============================================
const registrarPractica = async (req, res) => {
    try {
        const { id } = req.params; // id_alumno
        const id_usuario = req.user.id_usuario;
        
        const {
            periodo_escolar,
            semestre_cursado,
            nombre_escuela,
            cct_escuela,
            nivel_educativo,
            municipio,
            estado,
            fecha_inicio,
            fecha_fin,
            horas_totales,
            habilidades_desarrolladas,
            calificacion_obtenida,
            sigue_orientacion_reglamento,
            tutor_asignado,
            tiene_incidentes,
            relato_incidentes,
            observaciones,
            situacion
        } = req.body;
        
        // Validaciones
        if (!periodo_escolar || !semestre_cursado || !nombre_escuela || !cct_escuela || 
            !nivel_educativo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }
        
        // Validar que fecha_fin sea mayor que fecha_inicio
        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            });
        }
        
        // Insertar nueva práctica
        const [result] = await pool.execute(
            `INSERT INTO practicas_profesionales (
                id_alumno, periodo_escolar, semestre_cursado,
                nombre_escuela, cct_escuela, nivel_educativo,
                municipio, estado,
                fecha_inicio, fecha_fin, horas_totales,
                habilidades_desarrolladas, calificacion_obtenida,
                sigue_orientacion_reglamento, tutor_asignado,
                tiene_incidentes, relato_incidentes, observaciones, situacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, periodo_escolar, semestre_cursado,
                nombre_escuela, cct_escuela, nivel_educativo,
                municipio || 'No especificado',
                estado || 'No especificado',
                fecha_inicio, fecha_fin, horas_totales || null,
                habilidades_desarrolladas || null,
                calificacion_obtenida || null,
                sigue_orientacion_reglamento !== false, // Default true
                tutor_asignado || null,
                tiene_incidentes || false,
                relato_incidentes || null,
                observaciones || null,
                situacion || 'En curso'
            ]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'practicas_profesionales', ?, 'INSERT', ?)`,
            [id_usuario, result.insertId, JSON.stringify(req.body)]
        );
        
        console.log(`Práctica registrada: ${nombre_escuela} - Alumno ID: ${id}`);
        
        res.status(201).json({
            success: true,
            message: 'Práctica profesional registrada correctamente',
            data: {
                id_practica: result.insertId
            }
        });
        
    } catch (error) {
        console.error('Error al registrar práctica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar la práctica profesional',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ACTUALIZAR PRÁCTICA EXISTENTE
// ============================================
const actualizarPractica = async (req, res) => {
    try {
        const { id } = req.params; // id_practica
        const id_usuario = req.user.id_usuario;
        
        const {
            periodo_escolar, semestre_cursado,
            nombre_escuela, cct_escuela, nivel_educativo,
            municipio, estado,
            fecha_inicio, fecha_fin, horas_totales,
            habilidades_desarrolladas, calificacion_obtenida,
            sigue_orientacion_reglamento, tutor_asignado,
            tiene_incidentes, relato_incidentes, observaciones,
            situacion
        } = req.body;
        
        // Verificar que existe
        const [existente] = await pool.execute(
            'SELECT id_practica FROM practicas_profesionales WHERE id_practica = ?',
            [id]
        );
        
        if (existente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Práctica no encontrada'
            });
        }
        
        // Actualizar
        await pool.execute(
            `UPDATE practicas_profesionales SET
                periodo_escolar = ?, semestre_cursado = ?,
                nombre_escuela = ?, cct_escuela = ?, nivel_educativo = ?,
                municipio = ?, estado = ?,
                fecha_inicio = ?, fecha_fin = ?, horas_totales = ?,
                habilidades_desarrolladas = ?, calificacion_obtenida = ?,
                sigue_orientacion_reglamento = ?, tutor_asignado = ?,
                tiene_incidentes = ?, relato_incidentes = ?, observaciones = ?,
                situacion = ?
            WHERE id_practica = ?`,
            [
                periodo_escolar, semestre_cursado,
                nombre_escuela, cct_escuela, nivel_educativo,
                municipio, estado,
                fecha_inicio, fecha_fin, horas_totales,
                habilidades_desarrolladas, calificacion_obtenida,
                sigue_orientacion_reglamento, tutor_asignado,
                tiene_incidentes, relato_incidentes, observaciones,
                situacion,
                id
            ]
        );
        
        // Auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'practicas_profesionales', ?, 'UPDATE', ?)`,
            [id_usuario, id, JSON.stringify(req.body)]
        );
        
        console.log(`Práctica actualizada: ID ${id}`);
        
        res.json({
            success: true,
            message: 'Práctica actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar práctica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la práctica'
        });
    }
};

// ============================================
// ELIMINAR PRÁCTICA
// ============================================
const eliminarPractica = async (req, res) => {
    try {
        const { id } = req.params; // id_practica
        const id_usuario = req.user.id_usuario;
        
        // Verificar que existe
        const [existente] = await pool.execute(
            'SELECT * FROM practicas_profesionales WHERE id_practica = ?',
            [id]
        );
        
        if (existente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Práctica no encontrada'
            });
        }
        
        // Auditoría antes de eliminar
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'practicas_profesionales', ?, 'DELETE', ?)`,
            [id_usuario, id, JSON.stringify(existente[0])]
        );
        
        // Eliminar
        await pool.execute(
            'DELETE FROM practicas_profesionales WHERE id_practica = ?',
            [id]
        );
        
        console.log(`Práctica eliminada: ID ${id}`);
        
        res.json({
            success: true,
            message: 'Práctica eliminada correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar práctica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la práctica'
        });
    }
};

// ============================================
// EXPORTAR CONTROLADOR
// ============================================
module.exports = {
    obtenerPracticasAlumno,
    obtenerPracticaPorId,
    registrarPractica,
    actualizarPractica,
    eliminarPractica
};