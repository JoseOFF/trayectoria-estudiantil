// ============================================
// CONTROLADOR DE USUARIOS - MEJORADO
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const Usuario = require('../models/usuario.model');
const { pool } = require('../config/database');
const {
    hashContrasena,
    CORREO_SISTEMA,
    LARGO_NOMBRE_USUARIO,
    mensajeDuplicado,
    nombreUsuarioDesde
} = require('../utils/usuariosHelper');

// ============================================
// OBTENER TODOS LOS USUARIOS
// ============================================
const getAll = async (req, res) => {
    try {
        const { rol, activo, search, limit, offset } = req.query;
        
        const filters = {
            id_rol: rol ? parseInt(rol) : undefined,
            activo: activo !== undefined ? activo === 'true' : undefined,
            search: search || undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0
        };
        
        const usuarios = await Usuario.getAll(filters);
        
        // Contar total de usuarios (para paginación)
        // El usuario interno "Sistema" no se cuenta (tampoco aparece en la lista)
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM usuarios WHERE correo <> ?',
            [CORREO_SISTEMA]
        );
        
        res.json({
            success: true,
            data: {
                usuarios,
                total: countResult[0].total,
                limit: filters.limit,
                offset: filters.offset
            }
        });
        
    } catch (error) {
        console.error('- Error en getAll:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================
// OBTENER USUARIO POR ID
// ============================================
const getById = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { id } = req.params;
        
        const usuario = await Usuario.findById(parseInt(id));
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Obtener permisos del usuario
        const permisos = await Usuario.getPermissions(usuario.id_usuario);
        
        // ============================================
        //  OBTENER DATOS ESPECÍFICOS SEGÚN EL ROL
        // ============================================
        let datosEspecificos = null;
        
        // SI ES DOCENTE - Obtener sus datos y licenciaturas
        if (usuario.nombre_rol === 'Docente') {
            const [docentes] = await connection.execute(
                `SELECT 
                    d.id_docente,
                    d.nombre_completo,
                    d.area_asignada,
                    d.id_plantel,
                    p.nombre_plantel
                FROM docentes d
                LEFT JOIN planteles p ON d.id_plantel = p.id_plantel
                WHERE d.id_usuario = ?`,
                [usuario.id_usuario]
            );
            
            if (docentes.length > 0) {
                const docente = docentes[0];
                
                // Obtener licenciaturas asignadas
                const [licenciaturas] = await connection.execute(
                    `SELECT dl.id_licenciatura
                    FROM docente_licenciatura dl
                    WHERE dl.id_docente = ?`,
                    [docente.id_docente]
                );
                
                datosEspecificos = {
                    tipo: 'docente',
                    nombre_completo: docente.nombre_completo,
                    area_asignada: docente.area_asignada,
                    id_plantel: docente.id_plantel,
                    nombre_plantel: docente.nombre_plantel,
                    licenciaturas: licenciaturas.map(l => l.id_licenciatura)
                };
            }
        }
        
        // SI ES ALUMNO - Obtener sus datos
        else if (usuario.nombre_rol === 'Alumno') {
            const [alumnos] = await connection.execute(
                `SELECT 
                    a.id_alumno,
                    a.nombre_completo,
                    a.curp,
                    a.fecha_nacimiento,
                    a.id_licenciatura,
                    a.generacion,
                    a.correo_personal,
                    l.nombre_licenciatura
                FROM alumnos a
                LEFT JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
                WHERE a.id_usuario = ?`,
                [usuario.id_usuario]
            );
            
            if (alumnos.length > 0) {
                const alumno = alumnos[0];
                
                datosEspecificos = {
                    tipo: 'alumno',
                    nombre_completo: alumno.nombre_completo,
                    curp: alumno.curp,
                    fecha_nacimiento: alumno.fecha_nacimiento,
                    id_licenciatura: alumno.id_licenciatura,
                    nombre_licenciatura: alumno.nombre_licenciatura,
                    generacion: alumno.generacion,
                    correo_personal: alumno.correo_personal
                };
            }
        }
        
        // SI ES ADMINISTRADOR - Solo nombre completo
        else if (usuario.nombre_rol === 'Administrador') {
            datosEspecificos = {
                tipo: 'administrador',
                nombre_completo: usuario.nombre_usuario
            };
        }
        
        connection.release();
        
        res.json({
            success: true,
            data: {
                ...usuario,
                datosEspecificos,
                permisos: permisos.map(p => ({
                    id_permiso: p.id_permiso,
                    nombre_permiso: p.nombre_permiso,
                    descripcion: p.descripcion
                }))
            }
        });
        
    } catch (error) {
        console.error('- Error en getById:', error.message);
        connection.release();
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario'
        });
    }
};

// ============================================
// CREAR USUARIO CON REGISTRO EN TABLA ESPECÍFICA
// ============================================
const create = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { nombre_usuario, correo, contrasena, id_rol, tipo_usuario, datos_adicionales } = req.body;
        
        // Validaciones básicas
        if (!nombre_usuario || !correo || !contrasena || !id_rol) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Todos los campos básicos son requeridos'
            });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }
        
        // Validar longitud de contraseña
        if (contrasena.length < 6) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // La columna nombre_usuario admite 50 caracteres
        if (nombreUsuarioDesde(nombre_usuario).length < String(nombre_usuario).trim().length) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `El nombre no puede tener más de ${LARGO_NOMBRE_USUARIO} caracteres`
            });
        }

        // Los invitados necesitan al menos una licenciatura. Se valida ANTES
        // de guardar nada, para no dejar usuarios creados a medias.
        const esInvitado = tipo_usuario === 'Invitado';
        const { licenciaturas_permitidas, secciones_permitidas } = req.body;

        if (esInvitado && (!Array.isArray(licenciaturas_permitidas) || licenciaturas_permitidas.length === 0)) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Los usuarios invitados requieren al menos una licenciatura permitida'
            });
        }

        // Verificar que el correo no exista
        const [existeCorreo] = await connection.execute(
            'SELECT id_usuario FROM usuarios WHERE correo = ?',
            [correo]
        );
        
        if (existeCorreo.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }
        
        // 1. Crear usuario en la tabla usuarios
        const hashedPassword = await hashContrasena(contrasena);
        
        const [resultUsuario] = await connection.execute(
            `INSERT INTO usuarios (nombre_usuario, correo, contrasena, id_rol, activo, fecha_registro)
             VALUES (?, ?, ?, ?, TRUE, NOW())`,
            [nombreUsuarioDesde(nombre_usuario), correo, hashedPassword, parseInt(id_rol)]
        );
        
        const id_usuario = resultUsuario.insertId;
        
        // 2. Crear registro en tabla específica según el tipo de usuario
        if (tipo_usuario === 'docente' && datos_adicionales) {
            const { nombre_completo, area_asignada, id_plantel, licenciaturas } = datos_adicionales;
            
            // Insertar docente
            const [resultDocente] = await connection.execute(
                `INSERT INTO docentes (id_usuario, nombre_completo, area_asignada, id_plantel, activo, fecha_registro)
                 VALUES (?, ?, ?, ?, TRUE, NOW())`,
                [id_usuario, nombre_completo, area_asignada || null, id_plantel || null]
            );
            
            const id_docente = resultDocente.insertId;
            
            // Asignar licenciaturas si hay
            if (licenciaturas && licenciaturas.length > 0) {
                // parseInt: el valor viene del body y se inserta directo en el SQL
                const valuesLic = licenciaturas.map(id_lic =>
                    `(${id_docente}, ${parseInt(id_lic, 10)}, CURDATE(), NOW())`
                ).join(',');

                await connection.execute(
                    `INSERT INTO docente_licenciatura (id_docente, id_licenciatura, fecha_asignacion, fecha_registro)
                     VALUES ${valuesLic}`
                );
            }
            
            console.log(`Docente creado: ${nombre_completo} (ID: ${id_docente})`);
        }
        else if (tipo_usuario === 'alumno' && datos_adicionales) {
            const { nombre_completo, curp, fecha_nacimiento, id_licenciatura, generacion, correo_personal } = datos_adicionales;
            
            // Validar que el CURP no exista
            const [existeCurp] = await connection.execute(
                'SELECT id_alumno FROM alumnos WHERE curp = ?',
                [curp]
            );
            
            if (existeCurp.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: 'El CURP ya está registrado'
                });
            }
            
            // Generar matrícula
            const matricula = await generarMatricula(connection, id_licenciatura, generacion);
            
            // Generar correo institucional
            const correo_institucional = correo;
            
            // Insertar alumno
            const [resultAlumno] = await connection.execute(
                `INSERT INTO alumnos (
                    id_usuario, id_licenciatura, nombre_completo, curp, 
                    fecha_nacimiento, correo_institucional, correo_personal, 
                    matricula, generacion, semestre_actual, status_alumno, fecha_registro
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Activo', NOW())`,
                [
                    id_usuario, 
                    id_licenciatura, 
                    nombre_completo, 
                    curp, 
                    fecha_nacimiento, 
                    correo_institucional, 
                    correo_personal || null,
                    matricula,
                    generacion
                ]
            );
            
            const id_alumno = resultAlumno.insertId;
            
            console.log(`Alumno creado: ${nombre_completo} (Matrícula: ${matricula})`);
            // Verificar sincronización de correos
            const [verificar] = await connection.execute(
                `SELECT u.correo as correo_usuario, a.correo_institucional as correo_alumno
                FROM usuarios u
                INNER JOIN alumnos a ON u.id_usuario = a.id_usuario
                WHERE u.id_usuario = ?`,
                [id_usuario]
            );

            if (verificar[0].correo_usuario !== verificar[0].correo_alumno) {
                // Si no coinciden, forzar sincronización
                await connection.execute(
                    'UPDATE alumnos SET correo_institucional = ? WHERE id_usuario = ?',
                    [verificar[0].correo_usuario, id_usuario]
                );
                console.warn(`Correo sincronizado para usuario ${id_usuario}`);
            }
        }
        
        // Registrar en auditoría
        await connection.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'usuarios', ?, 'INSERT', ?)`,
            [
                req.user.id_usuario,
                id_usuario,
                JSON.stringify({ nombre_usuario, correo, id_rol, tipo_usuario })
            ]
        );
        
        // Si es invitado, crear sus permisos DENTRO de la misma transacción:
        // si algo falla, se deshace todo (usuario y permisos) en el catch.
        if (esInvitado) {
            const secciones = Array.isArray(secciones_permitidas) && secciones_permitidas.length > 0
                ? secciones_permitidas
                : null;

            await connection.execute(
                `INSERT INTO permisos_invitado
                (id_usuario, licenciaturas_permitidas, secciones_permitidas)
                VALUES (?, ?, ?)`,
                [
                    id_usuario,
                    JSON.stringify(licenciaturas_permitidas.map(id_lic => parseInt(id_lic, 10))),
                    secciones ? JSON.stringify(secciones) : null
                ]
            );

            console.log(`Permisos de invitado creados para usuario ${id_usuario}`);
        }

        await connection.commit();
        
        console.log(`Usuario creado exitosamente: ${correo} por ${req.user.correo}`);
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                id_usuario,
                nombre_usuario,
                correo,
                tipo_usuario
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('- Error en create:', error);

        // Dato repetido: decir exactamente qué campo (nombre, correo, CURP...)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: mensajeDuplicado(error)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};


/**
 *  FUNCIÓN AUXILIAR: Generar matrícula automática
 */
const generarMatricula = async (connection, id_licenciatura, generacion) => {
    // Obtener el código de la licenciatura
    const [licenciatura] = await connection.execute(
        'SELECT nombre_licenciatura FROM licenciaturas WHERE id_licenciatura = ?',
        [id_licenciatura]
    );
    
    if (licenciatura.length === 0) {
        throw new Error('Licenciatura no encontrada');
    }
    
    // Crear código de licenciatura (primeras 3 letras)
    const nombreLic = licenciatura[0].nombre_licenciatura;
    const palabras = nombreLic.split(' ');
    let codigoLic = '';
    
    // Tomar las primeras letras de cada palabra importante
    for (const palabra of palabras) {
        if (!['de', 'en', 'y', 'la', 'el'].includes(palabra.toLowerCase())) {
            codigoLic += palabra[0];
            if (codigoLic.length >= 3) break;
        }
    }
    
    codigoLic = codigoLic.toUpperCase().padEnd(3, 'X');
    
    // Obtener el último número de matrícula para esta licenciatura y generación
    const [ultimaMatricula] = await connection.execute(
        `SELECT matricula FROM alumnos 
         WHERE id_licenciatura = ? AND generacion = ? 
         ORDER BY id_alumno DESC LIMIT 1`,
        [id_licenciatura, generacion]
    );
    
    let numeroConsecutivo = 1;
    if (ultimaMatricula.length > 0) {
        const ultimoNumero = parseInt(ultimaMatricula[0].matricula.slice(-4));
        numeroConsecutivo = ultimoNumero + 1;
    }
    
    // Formato: AÑOCODIGONUMERO (ej: 2024EPR0001)
    const matricula = `${generacion}${codigoLic}${numeroConsecutivo.toString().padStart(4, '0')}`;
    
    return matricula;
};

// ============================================
// ACTUALIZAR USUARIO
// ============================================
const update = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { 
            nombre_usuario, 
            correo, 
            id_rol, 
            activo, 
            tipo_usuario, 
            datos_adicionales 
        } = req.body;
        
        // Verificar que el usuario existe
        const usuarioExistente = await Usuario.findById(parseInt(id));
        
        if (!usuarioExistente) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Validaciones básicas
        if (!nombre_usuario || !correo) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Nombre y correo son requeridos'
            });
        }
        
        // No permitir que un usuario se desactive a sí mismo
        if (req.user.id_usuario === parseInt(id) && activo === false) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No puedes desactivar tu propia cuenta'
            });
        }
        
        // 1. Actualizar tabla usuarios
        await connection.execute(
            `UPDATE usuarios 
             SET nombre_usuario = ?, correo = ?, activo = ?
             WHERE id_usuario = ?`,
            [nombreUsuarioDesde(nombre_usuario), correo, activo !== undefined ? activo : true, parseInt(id)]
        );
        
        // Si se cambia el rol, actualizarlo también
        if (id_rol !== undefined) {
            await connection.execute(
                'UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?',
                [parseInt(id_rol), parseInt(id)]
            );
        }
        
        // 2. Actualizar datos específicos según el tipo de usuario
        if (tipo_usuario === 'docente' && datos_adicionales) {
            const { nombre_completo, area_asignada, id_plantel, licenciaturas } = datos_adicionales;
            
            // Verificar que existe el docente
            const [docente] = await connection.execute(
                'SELECT id_docente FROM docentes WHERE id_usuario = ?',
                [parseInt(id)]
            );
            
            if (docente.length > 0) {
                const id_docente = docente[0].id_docente;
                
                // Actualizar datos del docente
                await connection.execute(
                    `UPDATE docentes 
                     SET nombre_completo = ?, area_asignada = ?, id_plantel = ?
                     WHERE id_docente = ?`,
                    [
                        nombre_completo,
                        area_asignada || null,
                        id_plantel ? parseInt(id_plantel) : null,
                        id_docente
                    ]
                );
                
                // Actualizar licenciaturas
                if (licenciaturas !== undefined) {
                    // Eliminar licenciaturas anteriores
                    await connection.execute(
                        'DELETE FROM docente_licenciatura WHERE id_docente = ?',
                        [id_docente]
                    );
                    
                    // Insertar nuevas licenciaturas
                    if (licenciaturas.length > 0) {
                        const valuesLic = licenciaturas.map(id_lic => 
                            `(${id_docente}, ${parseInt(id_lic)}, CURDATE(), NOW())`
                        ).join(',');
                        
                        await connection.execute(
                            `INSERT INTO docente_licenciatura (id_docente, id_licenciatura, fecha_asignacion, fecha_registro)
                             VALUES ${valuesLic}`
                        );
                    }
                }
                
                console.log(`Docente actualizado: ${nombre_completo} (ID: ${id_docente})`);
            }
        }
        else if (tipo_usuario === 'alumno' && datos_adicionales) {
            const { 
                nombre_completo, 
                curp, 
                fecha_nacimiento, 
                id_licenciatura, 
                generacion, 
                correo_personal 
            } = datos_adicionales;
            
            // Verificar que existe el alumno
            const [alumno] = await connection.execute(
                'SELECT id_alumno FROM alumnos WHERE id_usuario = ?',
                [parseInt(id)]
            );
            
            if (alumno.length > 0) {
                const id_alumno = alumno[0].id_alumno;
                
                // Actualizar datos del alumno
                await connection.execute(
                    `UPDATE alumnos 
                     SET nombre_completo = ?, 
                         curp = ?, 
                         fecha_nacimiento = ?, 
                         id_licenciatura = ?, 
                         generacion = ?, 
                         correo_personal = ?
                     WHERE id_alumno = ?`,
                    [
                        nombre_completo,
                        curp.toUpperCase(),
                        fecha_nacimiento,
                        parseInt(id_licenciatura),
                        parseInt(generacion),
                        correo_personal || null,
                        id_alumno
                    ]
                );
                
                console.log(`Alumno actualizado: ${nombre_completo} (ID: ${id_alumno})`);
            }
            

        }
        else if (tipo_usuario === 'administrador' && datos_adicionales) {
            // Para administradores, solo se actualiza nombre_usuario que ya se hizo arriba
            console.log(`Administrador actualizado: ${nombre_usuario}`);
        }
        else if (tipo_usuario === 'Invitado') {
            const { licenciaturas_permitidas, secciones_permitidas } = req.body;
            
            console.log(`Actualizando permisos de invitado para usuario ${id}`);
            
            // Verificar que se proporcionen licenciaturas
            if (!licenciaturas_permitidas || !Array.isArray(licenciaturas_permitidas) || licenciaturas_permitidas.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Los usuarios invitados requieren al menos una licenciatura permitida'
                });
            }
            
            // Verificar si ya existen permisos para este usuario
            const [permisosExistentes] = await connection.execute(
                'SELECT id_permiso FROM permisos_invitado WHERE id_usuario = ?',
                [parseInt(id)]
            );
            
            if (permisosExistentes.length > 0) {
                // ACTUALIZAR permisos existentes
                await connection.execute(
                    `UPDATE permisos_invitado 
                     SET licenciaturas_permitidas = ?,
                         secciones_permitidas = ?,
                         fecha_modificacion = CURRENT_TIMESTAMP
                     WHERE id_usuario = ?`,
                    [
                        JSON.stringify(licenciaturas_permitidas),
                        secciones_permitidas ? JSON.stringify(secciones_permitidas) : null,
                        parseInt(id)
                    ]
                );
                console.log(`Permisos de invitado ACTUALIZADOS para usuario ${id}`);
            } else {
                // CREAR permisos nuevos (por si acaso no existían)
                await connection.execute(
                    `INSERT INTO permisos_invitado (id_usuario, licenciaturas_permitidas, secciones_permitidas)
                     VALUES (?, ?, ?)`,
                    [
                        parseInt(id),
                        JSON.stringify(licenciaturas_permitidas),
                        secciones_permitidas ? JSON.stringify(secciones_permitidas) : null
                    ]
                );
                console.log(`Permisos de invitado CREADOS para usuario ${id}`);
            }
        }

        
        
        // Commit de la transacción
        await connection.commit();
        
        // Obtener usuario actualizado
        const usuarioActualizado = await Usuario.findById(parseInt(id));
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores, datos_nuevos)
            VALUES (?, 'usuarios', ?, 'UPDATE', ?, ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify(usuarioExistente),
                JSON.stringify(req.body)
            ]
        );
        
        console.log(`Usuario actualizado: ${correo} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: usuarioActualizado
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error en update:', error.message);

        // Dato repetido: decir exactamente qué campo
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: mensajeDuplicado(error)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

// ============================================
// ACTIVAR/DESACTIVAR USUARIO
// ============================================
const toggleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        
        // Validar
        if (activo === undefined) {
            return res.status(400).json({
                success: false,
                message: 'El campo "activo" es requerido'
            });
        }
        
        // No permitir que un usuario se desactive a sí mismo
        if (req.user.id_usuario === parseInt(id) && activo === false) {
            return res.status(400).json({
                success: false,
                message: 'No puedes desactivar tu propia cuenta'
            });
        }
        
        const usuario = await Usuario.toggleActive(parseInt(id), activo);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'usuarios', ?, 'UPDATE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify({ activo })
            ]
        );
        
        const accion = activo ? 'activado' : 'desactivado';
        console.log(`Usuario ${accion}: ${usuario.correo} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: `Usuario ${accion} exitosamente`,
            data: usuario
        });
        
    } catch (error) {
        console.error('- Error en toggleActive:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado del usuario'
        });
    }
};

// ============================================
// ELIMINAR USUARIO (SOFT DELETE)
// ============================================
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        
        // No permitir que un usuario se elimine a sí mismo
        if (req.user.id_usuario === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }
        
        const usuario = await Usuario.findById(parseInt(id));
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        await Usuario.remove(parseInt(id));
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
            VALUES (?, 'usuarios', ?, 'DELETE', ?)`,
            [
                req.user.id_usuario,
                parseInt(id),
                JSON.stringify(usuario)
            ]
        );
        
        console.log(`Usuario eliminado: ${usuario.correo} por ${req.user.correo}`);
        
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('- Error en remove:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
};

// ============================================
// OBTENER ROLES DISPONIBLES
// ============================================
const getRoles = async (req, res) => {
    try {
        const [roles] = await pool.execute(
            'SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY id_rol'
        );
        
        res.json({
            success: true,
            data: roles
        });
        
    } catch (error) {
        console.error('- Error en getRoles:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener roles'
        });
    }
};

// ============================================
// ELIMINAR USUARIO PERMANENTEMENTE (HARD DELETE)
// ============================================

const deletePermanently = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('═══════════════════════════════════════');
        console.log('CONTROLLER: deletePermanently');
        console.log('   - ID Usuario:', id);
        console.log('   - Usuario que elimina:', req.user.correo);
        
        // No permitir que un usuario se elimine a sí mismo
        if (req.user.id_usuario === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }
        
        // Obtener información del usuario antes de eliminar
        const usuario = await Usuario.findById(parseInt(id));
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        console.log('   - Usuario a eliminar:', usuario.correo, `(${usuario.nombre_rol})`);
        
        // Eliminar permanentemente
        await Usuario.deletePermanently(parseInt(id));
        
        // Registrar en auditoría
        try {
            await pool.execute(
                `INSERT INTO historial_cambios 
                (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_anteriores)
                VALUES (?, 'usuarios', ?, 'DELETE_PERMANENT', ?)`,
                [
                    req.user.id_usuario,
                    parseInt(id),
                    JSON.stringify({
                        nombre_usuario: usuario.nombre_usuario,
                        correo: usuario.correo,
                        rol: usuario.nombre_rol
                    })
                ]
            );
        } catch (auditError) {
            console.warn('No se pudo registrar en auditoría:', auditError.message);
        }
        
        console.log(`Usuario ${usuario.correo} eliminado PERMANENTEMENTE por ${req.user.correo}`);
        console.log('═══════════════════════════════════════');
        
        res.json({
            success: true,
            message: 'Usuario eliminado permanentemente de la base de datos'
        });
        
    } catch (error) {
        console.error('- ERROR en deletePermanently (controller):', error);
        console.log('═══════════════════════════════════════');
        
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el usuario permanentemente',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};



// ============================================
// RESETEAR CONTRASEÑA (Genera contraseña temporal)
// ============================================
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const id_admin = req.user.id_usuario; // Usuario admin que hace el cambio
        
        // Verificar que el usuario existe
        const [usuarios] = await pool.execute(
            `SELECT u.id_usuario, u.nombre_usuario, u.correo, r.nombre_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?`,
            [id]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const usuario = usuarios[0];
        
        // Generar contraseña temporal (8 caracteres alfanuméricos)
        const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
        
        // Encriptar contraseña temporal
        const hashedPassword = await hashContrasena(tempPassword);
        
        // Actualizar contraseña
        await pool.execute(
            `UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?`,
            [hashedPassword, id]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'usuarios', ?, 'PASSWORD_RESET', ?)`,
            [
                id_admin,
                id,
                JSON.stringify({
                    accion: 'Reset de contraseña',
                    usuario_afectado: usuario.nombre_usuario,
                    correo: usuario.correo,
                    rol: usuario.nombre_rol,
                    resetear_por: req.user.nombre_usuario
                })
            ]
        );
        
        console.log(`Contraseña reseteada para usuario ${usuario.nombre_usuario} por ${req.user.nombre_usuario}`);
        
        res.json({
            success: true,
            message: 'Contraseña reseteada correctamente',
            data: {
                usuario: usuario.nombre_usuario,
                correo: usuario.correo,
                temporal_password: tempPassword,
                nota: 'Guarda esta contraseña temporal y entrégala al usuario de forma segura'
            }
        });
        
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al resetear la contraseña'
        });
    }
};

// ============================================
// CAMBIAR CONTRASEÑA (Admin establece nueva contraseña)
// ============================================
const changeUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const id_admin = req.user.id_usuario;
        
        // Validar nueva contraseña
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Verificar que el usuario existe
        const [usuarios] = await pool.execute(
            `SELECT u.id_usuario, u.nombre_usuario, u.correo, r.nombre_rol
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?`,
            [id]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const usuario = usuarios[0];
        
        // Encriptar nueva contraseña
        const hashedPassword = await hashContrasena(newPassword);
        
        // Actualizar contraseña
        await pool.execute(
            `UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?`,
            [hashedPassword, id]
        );
        
        // Registrar en auditoría
        await pool.execute(
            `INSERT INTO historial_cambios 
            (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
            VALUES (?, 'usuarios', ?, 'PASSWORD_CHANGE', ?)`,
            [
                id_admin,
                id,
                JSON.stringify({
                    accion: 'Cambio de contraseña por administrador',
                    usuario_afectado: usuario.nombre_usuario,
                    correo: usuario.correo,
                    rol: usuario.nombre_rol,
                    cambiado_por: req.user.nombre_usuario
                })
            ]
        );
        
        console.log(`Contraseña cambiada para usuario ${usuario.nombre_usuario} por ${req.user.nombre_usuario}`);
        
        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente',
            data: {
                usuario: usuario.nombre_usuario,
                correo: usuario.correo
            }
        });
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar la contraseña'
        });
    }
};

// ============================================
// OBTENER HISTORIAL DE CAMBIOS DE CONTRASEÑA
// ============================================
const getPasswordHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [historial] = await pool.execute(
            `SELECT 
                hc.id_historial,
                hc.tipo_operacion,
                hc.datos_nuevos,
                hc.fecha_cambio,
                u.nombre_usuario as realizado_por,
                u.correo as correo_admin
            FROM historial_cambios hc
            INNER JOIN usuarios u ON hc.id_usuario = u.id_usuario
            WHERE hc.tabla_afectada = 'usuarios'
            AND hc.id_registro_afectado = ?
            AND hc.tipo_operacion IN ('PASSWORD_RESET', 'PASSWORD_CHANGE')
            ORDER BY hc.fecha_cambio DESC
            LIMIT 20`,
            [id]
        );
        
        res.json({
            success: true,
            data: historial
        });
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial'
        });
    }
};


// ============================================
// EXPORTAR CONTROLADORES
// ============================================

module.exports = {
    getAll,
    getById,
    create,
    update,
    toggleActive,
    remove,
    deletePermanently,
    getRoles,
    resetPassword,
    changeUserPassword,
    getPasswordHistory
};