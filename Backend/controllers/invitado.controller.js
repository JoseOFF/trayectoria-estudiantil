const invitadoModel = require('../models/invitado.model');

/**
 * Obtener todos los usuarios invitados
 */
const getAll = async (req, res) => {
    try {
        const invitados = await invitadoModel.listarInvitados();
        
        res.json({
            success: true,
            data: invitados
        });
    } catch (error) {
        console.error('Error al obtener invitados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener lista de invitados',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtener permisos de un invitado específico
 */
const getPermisos = async (req, res) => {
    try {
        const { id } = req.params;
        const permisos = await invitadoModel.getPermisosInvitado(id);

        if (!permisos) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron permisos para este usuario'
            });
        }

        res.json({
            success: true,
            data: permisos
        });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener permisos del invitado',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Actualizar licenciaturas permitidas de un invitado
 */
const updateLicenciaturas = async (req, res) => {
    try {
        const { id } = req.params;
        const { licenciaturas } = req.body;

        // Validar que licenciaturas sea un array
        if (!Array.isArray(licenciaturas)) {
            return res.status(400).json({
                success: false,
                message: 'El campo licenciaturas debe ser un array'
            });
        }

        const actualizado = await invitadoModel.actualizarPermisosLicenciaturas(id, licenciaturas);

        if (!actualizado) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron permisos para este usuario'
            });
        }

        res.json({
            success: true,
            message: 'Licenciaturas actualizadas correctamente',
            data: { licenciaturas }
        });
    } catch (error) {
        console.error('Error al actualizar licenciaturas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar licenciaturas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Actualizar secciones permitidas de un invitado
 */
const updateSecciones = async (req, res) => {
    try {
        const { id } = req.params;
        const { secciones } = req.body;

        // Validar que secciones sea un array o null
        if (secciones !== null && !Array.isArray(secciones)) {
            return res.status(400).json({
                success: false,
                message: 'El campo secciones debe ser un array o null'
            });
        }

        const actualizado = await invitadoModel.actualizarPermisosSecciones(id, secciones);

        if (!actualizado) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron permisos para este usuario'
            });
        }

        res.json({
            success: true,
            message: 'Secciones actualizadas correctamente',
            data: { secciones }
        });
    } catch (error) {
        console.error('Error al actualizar secciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar secciones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Eliminar permisos de un invitado
 */
const deletePermisos = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await invitadoModel.eliminarPermisosInvitado(id);

        if (!eliminado) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron permisos para este usuario'
            });
        }

        res.json({
            success: true,
            message: 'Permisos de invitado eliminados correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar permisos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAll,
    getPermisos,
    updateLicenciaturas,
    updateSecciones,
    deletePermisos
};