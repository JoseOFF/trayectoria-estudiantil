// ============================================
// HELPER: Recálculo automático de completitud
// Backend/utils/completitudHelper.js
// ============================================

const { pool } = require('../config/database');

/**
 * Recalcular completitud de un alumno específico
 * Se llama automáticamente después de operaciones de INSERT/UPDATE/DELETE
 * en tablas relacionadas con el expediente
 * 
 * @param {number} id_alumno - ID del alumno
 * @returns {Promise<void>}
 */
const recalcularCompletitudAlumno = async (id_alumno) => {
    try {
        // Validar que id_alumno sea válido
        if (!id_alumno || isNaN(id_alumno)) {
            console.warn('ID de alumno inválido para recálculo:', id_alumno);
            return;
        }

        // Llamar al procedimiento almacenado
        await pool.execute('CALL sp_calcular_completitud_expediente(?)', [id_alumno]);
        
        console.log(`Completitud recalculada para alumno ${id_alumno}`);
        
    } catch (error) {
        // No lanzar error para no interrumpir la operación principal
        console.error(`Error al recalcular completitud del alumno ${id_alumno}:`, error.message);
    }
};

/**
 * Recalcular completitud de múltiples alumnos
 * Útil para operaciones masivas
 * 
 * @param {number[]} ids_alumnos - Array de IDs de alumnos
 * @returns {Promise<void>}
 */
const recalcularCompletitudMasiva = async (ids_alumnos) => {
    try {
        if (!Array.isArray(ids_alumnos) || ids_alumnos.length === 0) {
            return;
        }

        // Recalcular en paralelo (máximo 10 a la vez para no saturar)
        const batchSize = 10;
        for (let i = 0; i < ids_alumnos.length; i += batchSize) {
            const batch = ids_alumnos.slice(i, i + batchSize);
            await Promise.all(batch.map(id => recalcularCompletitudAlumno(id)));
        }

        console.log(`Completitud recalculada para ${ids_alumnos.length} alumnos`);
        
    } catch (error) {
        console.error('Error en recálculo masivo:', error.message);
    }
};

module.exports = {
    recalcularCompletitudAlumno,
    recalcularCompletitudMasiva
};