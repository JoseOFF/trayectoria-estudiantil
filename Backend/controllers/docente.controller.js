// ============================================
// CONTROLADOR DE DOCENTES
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Docente = require('../models/docente.model');

// ============================================
// OBTENER TODOS LOS DOCENTES
// ============================================
const getAll = async (req, res) => {
    try {
        const filters = {
            activo: req.query.activo !== undefined 
                ? req.query.activo === 'true'
                : undefined,
            area: req.query.area,
            id_plantel: req.query.id_plantel,
            search: req.query.search,
            limit: req.query.limit || 50,
            offset: req.query.offset || 0
        };
        
        const result = await Docente.getAll(filters);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('- Error al obtener docentes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la lista de docentes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER DOCENTE POR ID
// ============================================
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const docente = await Docente.findById(parseInt(id));
        
        if (!docente) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: docente
        });
        
    } catch (error) {
        console.error('- Error al obtener docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el docente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// CREAR NUEVO DOCENTE
// ============================================
const create = async (req, res) => {
    try {
        const { nombre_completo, correo, contrasena, area_asignada, id_plantel, licenciaturas } = req.body;
        
        // Validaciones
        if (!nombre_completo || !correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Nombre completo, correo y contraseña son requeridos'
            });
        }
        
        if (contrasena.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        const docenteData = {
            nombre_completo,
            correo,
            contrasena,
            area_asignada,
            id_plantel,
            licenciaturas
        };
        
        const docente = await Docente.create(docenteData);
        
        res.status(201).json({
            success: true,
            message: 'Docente creado exitosamente',
            data: docente
        });
        
    } catch (error) {
        console.error('- Error al crear docente:', error);
        
        // Dato repetido (nombre o correo): el modelo marca el error con status 409
        if (error.status === 409) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear el docente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ACTUALIZAR DOCENTE
// ============================================
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, correo, area_asignada, id_plantel, activo, licenciaturas } = req.body;
        
        // Validaciones
        if (!nombre_completo || !correo) {
            return res.status(400).json({
                success: false,
                message: 'Nombre completo y correo son requeridos'
            });
        }
        
        const docenteData = {
            nombre_completo,
            correo,
            area_asignada,
            id_plantel,
            activo,
            licenciaturas
        };
        
        const docente = await Docente.update(parseInt(id), docenteData);
        
        res.json({
            success: true,
            message: 'Docente actualizado exitosamente',
            data: docente
        });
        
    } catch (error) {
        console.error('- Error al actualizar docente:', error);
        
        if (error.message === 'Docente no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.status === 409) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar el docente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ACTIVAR/DESACTIVAR DOCENTE
// ============================================
const toggleActive = async (req, res) => {
    
    try {
        
        const { id } = req.params;
        const { activo } = req.body;
        
        
        // Validación
        if (activo === undefined) {
            return res.status(400).json({
                success: false,
                message: 'El campo activo es requerido'
            });
        }
        
        
        const docente = await Docente.toggleActive(parseInt(id), activo);
        
        
        const mensaje = `Docente ${activo ? 'activado' : 'desactivado'} exitosamente`;
        
        res.json({
            success: true,
            message: mensaje,
            data: docente
        });
        
        
    } catch (error) {
        console.error('ERROR en toggleActive (CONTROLLER):');
        console.error('   - Mensaje:', error.message);
        console.error('   - Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del docente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// ELIMINAR DOCENTE
// ============================================
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Docente.remove(parseInt(id));
        
        res.json({
            success: true,
            message: 'Docente eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('- Error al eliminar docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el docente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER ÁREAS
// ============================================
const getAreas = async (req, res) => {
    try {
        const areas = await Docente.getAreas();
        
        res.json({
            success: true,
            data: areas
        });
        
    } catch (error) {
        console.error('- Error al obtener áreas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las áreas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER PLANTELES
// ============================================
const getPlanteles = async (req, res) => {
    try {
        const planteles = await Docente.getPlanteles();
        
        res.json({
            success: true,
            data: planteles
        });
        
    } catch (error) {
        console.error('- Error al obtener planteles:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los planteles',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// ============================================
// ELIMINAR DOCENTE PERMANENTEMENTE (HARD DELETE)
// ============================================
const deletePermanently = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener información del docente antes de eliminar (para auditoría)
        const docente = await Docente.findById(parseInt(id));
        
        if (!docente) {
            return res.status(404).json({
                success: false,
                message: 'Docente no encontrado'
            });
        }
        
        // Eliminar permanentemente
        await Docente.deletePermanently(parseInt(id));
        
        // Registrar en auditoría si tienes la tabla de historial_cambios
        try {
            await pool.execute(
                `INSERT INTO historial_cambios 
                (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
                VALUES (?, 'docentes', ?, 'DELETE_PERMANENT', ?)`,
                [
                    req.user.id_usuario,
                    parseInt(id),
                    JSON.stringify({
                        nombre_completo: docente.nombre_completo,
                        correo: docente.correo,
                        area_asignada: docente.area_asignada
                    })
                ]
            );
        } catch (auditError) {
            console.warn('No se pudo registrar en auditoría:', auditError.message);
        }
        
        console.log(`Docente eliminado PERMANENTEMENTE - ID: ${id} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Docente eliminado permanentemente de la base de datos'
        });
        
    } catch (error) {
        console.error('- Error al eliminar docente permanentemente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el docente permanentemente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// EXPORTAR CONTROLADOR
// ============================================
module.exports = {
    getAll,
    getById,
    create,
    update,
    toggleActive,
    remove,
    getAreas,
    deletePermanently,
    getPlanteles
};