// ============================================
// CONTROLADOR DE DOCUMENTOS
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const { pool } = require('../config/database');
const Alumno = require('../models/alumno.model');
const path = require('path');
const fs = require('fs');

// Tipos de documento permitidos. Es la misma lista que el Frontend recibe
// en GET /documentos/tipos, y la única que se acepta al subir un archivo.
const TIPOS_DOCUMENTO = [
    'Acta de Nacimiento',
    'CURP',
    'Certificado de Estudios',
    'Comprobante de Domicilio',
    'INE',
    'Fotografía',
    'Constancia Médica',
    'Comprobante de Pago',
    'Constancia de Servicio Social',
    'Título',
    'Cédula Profesional',
    'Otro'
];

// ============================================
// SUBIR DOCUMENTO
// ============================================
const subirDocumento = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que se subió un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ningún archivo'
            });
        }

        // Validar el tipo de documento contra la lista permitida.
        // Si no viene, se guarda como 'Otro' (igual que antes).
        // multer ya guardó el archivo en disco, por eso se borra si se rechaza.
        const tipo_documento = req.body.tipo_documento ? String(req.body.tipo_documento).trim() : 'Otro';

        if (!TIPOS_DOCUMENTO.includes(tipo_documento)) {
            fs.unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: 'Tipo de documento no válido'
            });
        }

        // Verificar que el alumno existe
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            // Eliminar archivo subido si el alumno no existe
            fs.unlinkSync(req.file.path);
            
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        
        // Calcular tamaño en MB
        const tamanoMB = (req.file.size / (1024 * 1024)).toFixed(2);
        
        // Insertar en base de datos
        const [result] = await pool.execute(
            `INSERT INTO documentos 
            (id_alumno, tipo_documento, nombre_archivo, tipo_mime, ruta_archivo, tamano_mb, subido_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                parseInt(id),
                tipo_documento,
                req.file.originalname,
                req.file.mimetype,  // ← NUEVO
                req.file.path,
                parseFloat(tamanoMB),
                req.user.id_usuario
            ]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'documentos', ?, 'INSERT', ?)`,
            [
                req.user.id_usuario,
                result.insertId,
                JSON.stringify({
                    id_alumno: id,
                    tipo_documento,
                    nombre_archivo: req.file.originalname,
                    tamano_mb: tamanoMB
                })
            ]
        );
        
        console.log(`Documento subido - Alumno ID: ${id}, Archivo: ${req.file.originalname}`);
        
        res.json({
            success: true,
            message: 'Documento subido correctamente',
            data: {
                id_documento: result.insertId,
                nombre_archivo: req.file.originalname,
                tipo_documento,
                tamano_mb: parseFloat(tamanoMB)
            }
        });
        
    } catch (error) {
        console.error('- Error en subirDocumento:', error.message);
        
        // Eliminar archivo si hubo error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al subir documento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// LISTAR DOCUMENTOS DEL ALUMNO
// ============================================
const listarDocumentos = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.query;
        
        // Verificar que el alumno existe
        const alumno = await Alumno.findById(parseInt(id));
        
        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        // ============================================
        //  VERIFICACIÓN DE PERMISOS PARA INVITADOS
        // ============================================
        if (req.user.rol === 'Invitado') {
            // req.permisosInvitado viene del middleware checkInvitadoLicenciatura
            if (!req.permisosInvitado || !req.permisosInvitado.licenciaturas_permitidas) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario invitado sin permisos asignados'
                });
            }
            
            // Verificar que el alumno pertenezca a una licenciatura permitida
            if (!req.permisosInvitado.licenciaturas_permitidas.includes(alumno.id_licenciatura)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para ver documentos de este alumno'
                });
            }
            
            console.log(`Invitado ${req.user.correo} accediendo a documentos del alumno ${alumno.matricula}`);
        }
        
        // Construir query
        let query = `
            SELECT 
                d.id_documento,
                d.tipo_documento,
                d.nombre_archivo,
                d.tipo_mime,
                d.fecha_subida,
                d.tamano_mb,
                u.nombre_usuario as subido_por_nombre
            FROM documentos d
            LEFT JOIN usuarios u ON d.subido_por = u.id_usuario
            WHERE d.id_alumno = ?
        `;
        
        const params = [parseInt(id)];
        
        // Filtrar por tipo si se especifica
        if (tipo) {
            query += ` AND d.tipo_documento = ?`;
            params.push(tipo);
        }
        
        query += ` ORDER BY d.fecha_subida DESC`;
        
        const [documentos] = await pool.execute(query, params);
        
        res.json({
            success: true,
            data: {
                alumno: {
                    id_alumno: alumno.id_alumno,
                    nombre_completo: alumno.nombre_completo,
                    matricula: alumno.matricula
                },
                documentos,
                total: documentos.length
            }
        });
        
    } catch (error) {
        console.error('- Error en listarDocumentos:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al listar documentos'
        });
    }
};





// ============================================
// DESCARGAR DOCUMENTO
// ============================================
const descargarDocumento = async (req, res) => {
    try {
        const { id, id_documento } = req.params;
        
        // Buscar documento
        const [documentos] = await pool.execute(
            `SELECT * FROM documentos 
            WHERE id_documento = ? AND id_alumno = ?`,
            [parseInt(id_documento), parseInt(id)]
        );
        
        if (documentos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        const documento = documentos[0];
        
        // Verificar que el archivo existe
        if (!fs.existsSync(documento.ruta_archivo)) {
            return res.status(404).json({
                success: false,
                message: 'El archivo no existe en el servidor'
            });
        }
        
        // Descargar archivo
        res.download(documento.ruta_archivo, documento.nombre_archivo, (err) => {
            if (err) {
                console.error('- Error al descargar:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error al descargar el archivo'
                    });
                }
            } else {
                console.log(`Documento descargado - ID: ${id_documento} por ${req.user.correo}`);
            }
        });
        
    } catch (error) {
        console.error('- Error en descargarDocumento:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al descargar documento'
        });
    }
};

// ============================================
// PREVISUALIZAR DOCUMENTO
// ============================================
const previsualizarDocumento = async (req, res) => {
    try {
        const { id, id_documento } = req.params;
        
        const [documentos] = await pool.execute(
            `SELECT * FROM documentos 
            WHERE id_documento = ? AND id_alumno = ?`,
            [parseInt(id_documento), parseInt(id)]
        );
        
        if (documentos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        const documento = documentos[0];
        
        if (!fs.existsSync(documento.ruta_archivo)) {
            return res.status(404).json({
                success: false,
                message: 'El archivo no existe en el servidor'
            });
        }
        
        res.setHeader('Content-Type', documento.tipo_mime || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento.nombre_archivo)}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        res.sendFile(path.resolve(documento.ruta_archivo), (err) => {
            if (err) {
                console.error('- Error al previsualizar:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error al previsualizar el archivo'
                    });
                }
            } else {
                console.log(`Documento previsualizado - ID: ${id_documento}`);
            }
        });
        
    } catch (error) {
        console.error('- Error en previsualizarDocumento:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al previsualizar documento'
        });
    }
};



// ============================================
// ELIMINAR DOCUMENTO
// ============================================
const eliminarDocumento = async (req, res) => {
    try {
        const { id, id_documento } = req.params;
        
        // Buscar documento
        const [documentos] = await pool.execute(
            `SELECT * FROM documentos 
            WHERE id_documento = ? AND id_alumno = ?`,
            [parseInt(id_documento), parseInt(id)]
        );
        
        if (documentos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        const documento = documentos[0];
        
        // Eliminar archivo físico si existe
        if (fs.existsSync(documento.ruta_archivo)) {
            fs.unlinkSync(documento.ruta_archivo);
        }
        
        // Eliminar de base de datos
        await pool.execute(
            'DELETE FROM documentos WHERE id_documento = ?',
            [parseInt(id_documento)]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'documentos', ?, 'DELETE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id_documento),
                JSON.stringify({
                    id_alumno: id,
                    nombre_archivo: documento.nombre_archivo,
                    tipo_documento: documento.tipo_documento
                })
            ]
        );
        
        console.log(`Documento eliminado - ID: ${id_documento} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Documento eliminado correctamente'
        });
        
    } catch (error) {
        console.error('- Error en eliminarDocumento:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar documento'
        });
    }
};

// ============================================
// OBTENER TIPOS DE DOCUMENTOS
// ============================================
const getTiposDocumentos = async (req, res) => {
    try {
        res.json({
            success: true,
            data: TIPOS_DOCUMENTO
        });
        
    } catch (error) {
        console.error('- Error en getTiposDocumentos:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de documentos'
        });
    }
};

// ============================================
// EXPORTAR CONTROLADORES
// ============================================

module.exports = {
    subirDocumento,
    listarDocumentos,
    descargarDocumento,
    eliminarDocumento,
    previsualizarDocumento,
    getTiposDocumentos
};