// ============================================
// CONTROLADOR DE DASHBOARD
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const dashboardModel = require('../models/dashboard.model');

// ============================================
// OBTENER ESTADÍSTICAS GENERALES DEL DASHBOARD
// ============================================
const getEstadisticasGenerales = async (req, res) => {
    try {
        const usuario = req.user; // Del middleware de autenticación (req.user, NO req.usuario)
        
        // Obtener estadísticas según el rol del usuario
        const estadisticas = await dashboardModel.getEstadisticasGenerales(
            usuario.id_rol,
            usuario.id_usuario
        );
        
        res.json({
            success: true,
            data: estadisticas
        });
        
    } catch (error) {
        console.error('- Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER ACTIVIDAD RECIENTE
// ============================================
const getActividadReciente = async (req, res) => {
    try {
        const usuario = req.user;
        const limite = parseInt(req.query.limite) || 10;
        
        const actividad = await dashboardModel.getActividadReciente(
            usuario.id_rol,
            usuario.id_usuario,
            limite
        );
        
        res.json({
            success: true,
            data: actividad
        });
        
    } catch (error) {
        console.error('- Error al obtener actividad reciente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la actividad reciente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER DATOS PARA GRÁFICOS
// ============================================
const getGraficos = async (req, res) => {
    try {
        const usuario = req.user;
        const tipo = req.query.tipo; // 'alumnos_por_semestre', 'rendimiento', etc.
        
        let datos;
        
        switch(tipo) {
            case 'alumnos_por_semestre':
                datos = await dashboardModel.getAlumnosPorSemestre();
                break;
                
            case 'alumnos_por_status':
                datos = await dashboardModel.getAlumnosPorStatus();
                break;
                
            case 'rendimiento_general':
                datos = await dashboardModel.getRendimientoGeneral();
                break;
                
            case 'alumnos_por_generacion':
                datos = await dashboardModel.getAlumnosPorGeneracion();
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de gráfico no válido'
                });
        }
        
        res.json({
            success: true,
            data: datos
        });
        
    } catch (error) {
        console.error('- Error al obtener datos para gráficos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener datos para gráficos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER ALERTAS Y NOTIFICACIONES
// ============================================
const getAlertas = async (req, res) => {
    try {
        const usuario = req.user;
        
        const alertas = await dashboardModel.getAlertas(
            usuario.id_rol,
            usuario.id_usuario
        );
        
        res.json({
            success: true,
            data: alertas
        });
        
    } catch (error) {
        console.error('- Error al obtener alertas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alertas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// EXPORTAR CONTROLADOR
// ============================================
module.exports = {
    getEstadisticasGenerales,
    getActividadReciente,
    getGraficos,
    getAlertas
};