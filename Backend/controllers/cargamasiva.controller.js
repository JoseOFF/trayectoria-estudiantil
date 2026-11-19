// Backend/controllers/cargaMasiva.controller.js
const ExcelJS = require('exceljs');
const { pool } = require('../config/database');
const { mensajeDuplicado, hashContrasena } = require('../utils/usuariosHelper');

const cargaMasivaController = {
    
    /**
     * Procesa archivo Excel con formato simplificado
     * 
     * Formato del Excel (en orden):
     * - Columna A: Nombre
     * - Columna B: Apellido Paterno
     * - Columna C: Apellido Materno
     * - Columna D: CURP
     * - Columna E: Semestre
     * - Columna F: Correo Institucional
     * 
     * Parámetros adicionales:
     * - req.body.id_licenciatura: ID de la licenciatura a asignar (viene del selector del frontend)
     */
    async procesarCargaMasiva(req, res) {
        const connection = await pool.getConnection();
        
        try {
            // Validar que se subió un archivo
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ningún archivo Excel'
                });
            }
            
            // Obtener id_licenciatura del formulario (viene del selector del frontend)
            const id_licenciatura = parseInt(req.body.id_licenciatura);
            
            if (!id_licenciatura || isNaN(id_licenciatura)) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe seleccionar una licenciatura'
                });
            }
            
            // Verificar que la licenciatura existe
            const [licenciaturas] = await connection.execute(
                'SELECT id_licenciatura, nombre_licenciatura FROM licenciaturas WHERE id_licenciatura = ?',
                [id_licenciatura]
            );
            
            if (licenciaturas.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La licenciatura seleccionada no existe'
                });
            }
            
            const generacion_defecto = 2025; // Año fijo por ahora
            
            console.log('Configuración de carga:');
            console.log(`   - Licenciatura: ${licenciaturas[0].nombre_licenciatura} (ID: ${id_licenciatura})`);
            console.log(`   - Generación: ${generacion_defecto}`);
            console.log(`   - Usuario: ${req.user.nombre_usuario}`);
            
            // Leer el archivo Excel
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(req.file.buffer);
            const worksheet = workbook.getWorksheet(1);
            
            if (!worksheet) {
                return res.status(400).json({
                    success: false,
                    message: 'El archivo Excel está vacío o no tiene hojas'
                });
            }
            
            await connection.beginTransaction();
            
            // Arrays para resultados
            const resultados = {
                exitosos: [],
                fallidos: [],
                total: 0
            };
            
            // Obtener el ID del rol "Alumno"
            const [roles] = await connection.execute(
                'SELECT id_rol FROM roles WHERE nombre_rol = ?',
                ['Alumno']
            );
            
            if (roles.length === 0) {
                throw new Error('No se encontró el rol de Alumno en el sistema');
            }
            
            const id_rol_alumno = roles[0].id_rol;
            
            // Procesar cada fila (empezando desde fila 2, la 1 es encabezado)
            const filas = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Saltar encabezado
                    const nombre = row.getCell(1).value;
                    const apellido_paterno = row.getCell(2).value;
                    const apellido_materno = row.getCell(3).value;
                    const curp = row.getCell(4).value;
                    const semestre = row.getCell(5).value;
                    const correo_institucional = row.getCell(6).value;
                    
                    // Solo agregar si al menos hay algún dato (ignorar filas vacías)
                    if (nombre || apellido_paterno || apellido_materno || curp || semestre || correo_institucional) {
                        filas.push({
                            numero: rowNumber,
                            nombre,
                            apellido_paterno,
                            apellido_materno,
                            curp,
                            semestre,
                            correo_institucional
                        });
                    }
                }
            });
            
            resultados.total = filas.length;
            console.log(`Total de filas a procesar: ${filas.length}`);
            
            if (filas.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El archivo Excel no contiene datos para procesar'
                });
            }
            
            // Procesar cada alumno
            for (const fila of filas) {
                try {
                    console.log(`\nProcesando fila ${fila.numero}...`);
                    
                    // Validar datos obligatorios
                    if (!fila.nombre || !fila.apellido_paterno || !fila.apellido_materno || 
                        !fila.curp || !fila.semestre || !fila.correo_institucional) {
                        throw new Error('Faltan datos obligatorios');
                    }
                    
                    // Construir nombre completo
                    const nombre_completo = `${String(fila.nombre).trim()} ${String(fila.apellido_paterno).trim()} ${String(fila.apellido_materno).trim()}`;
                    
                    // Normalizar datos
                    const curp = String(fila.curp).toUpperCase().trim();
                    const correo_institucional = String(fila.correo_institucional).toLowerCase().trim();
                    const semestre = parseInt(fila.semestre);
                    
                    // Validar CURP (18 caracteres)
                    if (curp.length !== 18) {
                        throw new Error(`CURP inválido: debe tener 18 caracteres (tiene ${curp.length})`);
                    }
                    
                    // Validar formato de correo
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(correo_institucional)) {
                        throw new Error('Correo institucional con formato inválido');
                    }
                    
                    // Validar semestre
                    if (isNaN(semestre) || semestre < 1 || semestre > 10) {
                        throw new Error('Semestre inválido (debe ser entre 1 y 10)');
                    }
                    
                    // Extraer fecha de nacimiento del CURP (posiciones 4-9: AAMMDD)
                    let fecha_nacimiento = null;
                    try {
                        const anio = curp.substring(4, 6);
                        const mes = curp.substring(6, 8);
                        const dia = curp.substring(8, 10);
                        
                        // Determinar siglo (00-24 = 2000s, 25-99 = 1900s)
                        const anioCompleto = parseInt(anio) <= 24 ? `20${anio}` : `19${anio}`;
                        
                        fecha_nacimiento = `${anioCompleto}-${mes}-${dia}`;
                        
                        // Validar que la fecha sea válida
                        const fechaObj = new Date(fecha_nacimiento);
                        if (isNaN(fechaObj.getTime())) {
                            throw new Error('Fecha inválida en CURP');
                        }
                    } catch (error) {
                        console.warn(`No se pudo extraer fecha de nacimiento del CURP: ${error.message}`);
                        fecha_nacimiento = null;
                    }
                    
                    // Verificar si el CURP ya existe
                    const [existeCurp] = await connection.execute(
                        'SELECT id_alumno, nombre_completo FROM alumnos WHERE curp = ?',
                        [curp]
                    );
                    
                    if (existeCurp.length > 0) {
                        throw new Error(`CURP ya registrado (alumno: ${existeCurp[0].nombre_completo})`);
                    }
                    
                    // Verificar si el correo ya existe
                    const [existeCorreo] = await connection.execute(
                        'SELECT id_usuario, nombre_usuario FROM usuarios WHERE correo = ?',
                        [correo_institucional]
                    );
                    
                    if (existeCorreo.length > 0) {
                        throw new Error(`Correo ya registrado (usuario: ${existeCorreo[0].nombre_usuario})`);
                    }
                    
                    // Generar matrícula automática
                    const [lastMatricula] = await connection.execute(
                        'SELECT MAX(CAST(SUBSTRING(matricula, 5) AS UNSIGNED)) as last_num FROM alumnos WHERE matricula LIKE ?',
                        [`${generacion_defecto}%`]
                    );
                    const siguiente_numero = (lastMatricula[0]?.last_num || 0) + 1;
                    const matricula = `${generacion_defecto}${String(siguiente_numero).padStart(4, '0')}`;
                    
                    console.log(`Matrícula generada: ${matricula}`);
                    
                    // Crear contraseña temporal
                    const contrasena_temporal = `Alumno${generacion_defecto}!`;
                    const hash = await hashContrasena(contrasena_temporal);
                    
                    // Insertar usuario
                    const [resultUsuario] = await connection.execute(
                        `INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
                         VALUES (?, ?, ?, ?, TRUE)`,
                        [id_rol_alumno, nombre_completo, correo_institucional, hash]
                    );
                    
                    const id_usuario = resultUsuario.insertId;
                    console.log(`Usuario creado (ID: ${id_usuario})`);
                    
                    // Insertar alumno
                    const [resultAlumno] = await connection.execute(
                        `INSERT INTO alumnos (
                            id_usuario,
                            id_licenciatura,
                            nombre_completo,
                            curp,
                            fecha_nacimiento,
                            correo_institucional,
                            matricula,
                            semestre_actual,
                            generacion,
                            status_alumno
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo')`,
                        [
                            id_usuario,
                            id_licenciatura,
                            nombre_completo,
                            curp,
                            fecha_nacimiento,
                            correo_institucional,
                            matricula,
                            semestre,
                            generacion_defecto
                        ]
                    );
                    
                    const id_alumno = resultAlumno.insertId;
                    console.log(`Alumno creado (ID: ${id_alumno})`);
                    
                    // Registrar en auditoría
                    await connection.execute(
                        `INSERT INTO historial_cambios 
                        (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
                        VALUES (?, 'alumnos', ?, 'INSERT', ?)`,
                        [
                            req.user.id_usuario,
                            id_alumno,
                            JSON.stringify({
                                nombre_completo,
                                curp,
                                matricula,
                                semestre,
                                correo_institucional,
                                licenciatura: licenciaturas[0].nombre_licenciatura,
                                creado_por_carga_masiva: true,
                                fecha_carga: new Date().toISOString()
                            })
                        ]
                    );
                    
                    // Agregar a exitosos
                    resultados.exitosos.push({
                        fila: fila.numero,
                        nombre: nombre_completo,
                        matricula,
                        correo: correo_institucional,
                        contrasena_temporal
                    });
                    
                    console.log(`Fila ${fila.numero} procesada exitosamente`);
                    
                } catch (error) {
                    // Agregar a fallidos
                    const nombre_fallido = fila.nombre 
                        ? `${fila.nombre} ${fila.apellido_paterno || ''} ${fila.apellido_materno || ''}`.trim()
                        : 'Sin nombre';
                    
                    // Los errores propios (validaciones de arriba) se muestran tal cual.
                    // Los de la base de datos (traen error.code) no deben llegar crudos:
                    // un dato repetido se traduce al campo; el resto, mensaje genérico.
                    let motivo = error.message;
                    if (error.code === 'ER_DUP_ENTRY') {
                        motivo = mensajeDuplicado(error);
                    } else if (error.code) {
                        motivo = 'Error al guardar el registro en la base de datos';
                    }

                    resultados.fallidos.push({
                        fila: fila.numero,
                        nombre: nombre_fallido,
                        error: motivo
                    });
                    
                    console.error(`Error en fila ${fila.numero}: ${error.message}`);
                }
            }
            
            // Commit si hubo al menos un registro exitoso
            if (resultados.exitosos.length > 0) {
                await connection.commit();
                console.log(`\nTransacción confirmada: ${resultados.exitosos.length} alumnos registrados`);
            } else {
                await connection.rollback();
                console.log('\nTransacción revertida: no hubo registros exitosos');
            }
            
            // Generar resumen
            const resumen = {
                total: resultados.total,
                exitosos: resultados.exitosos.length,
                fallidos: resultados.fallidos.length,
                porcentaje_exito: resultados.total > 0 
                    ? ((resultados.exitosos.length / resultados.total) * 100).toFixed(2) 
                    : 0,
                licenciatura: licenciaturas[0].nombre_licenciatura
            };
            
            console.log('\nResumen final:');
            console.log(`   Total: ${resumen.total}`);
            console.log(`   Exitosos: ${resumen.exitosos}`);
            console.log(`   Fallidos: ${resumen.fallidos}`);
            console.log(`   Éxito: ${resumen.porcentaje_exito}%`);
            console.log(`   Licenciatura: ${resumen.licenciatura}`);
            
            res.json({
                success: resultados.exitosos.length > 0,
                message: `Proceso completado: ${resumen.exitosos} de ${resumen.total} alumnos registrados exitosamente en ${resumen.licenciatura}`,
                resumen,
                detalles: resultados
            });
            
        } catch (error) {
            await connection.rollback();
            console.error('Error crítico en carga masiva:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la carga masiva',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            connection.release();
        }
    },
    
    /**
     * Descarga plantilla Excel simplificada
     */
    async descargarPlantilla(req, res) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Alumnos');
            
            // Definir columnas según el formato real
            worksheet.columns = [
                { header: 'Nombre', key: 'nombre', width: 25 },
                { header: 'Apellido Paterno', key: 'apellido_paterno', width: 25 },
                { header: 'Apellido Materno', key: 'apellido_materno', width: 25 },
                { header: 'CURP', key: 'curp', width: 20 },
                { header: 'Semestre', key: 'semestre', width: 12 },
                { header: 'Correo Institucional', key: 'correo_institucional', width: 40 }
            ];
            
            // Estilo para encabezados
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
            
            // Agregar filas de ejemplo
            worksheet.addRow({
                nombre: 'Juan Carlos',
                apellido_paterno: 'Pérez',
                apellido_materno: 'García',
                curp: 'AAAA040315HMCXXX01',
                semestre: 1,
                correo_institucional: 'juan.perez@example.com'
            });
            
            worksheet.addRow({
                nombre: 'María Fernanda',
                apellido_paterno: 'López',
                apellido_materno: 'Martínez',
                curp: 'BBBB050620MQTXXX02',
                semestre: 1,
                correo_institucional: 'maria.lopez@example.com'
            });
            
            worksheet.addRow({
                nombre: 'José Luis',
                apellido_paterno: 'Hernández',
                apellido_materno: 'Ramírez',
                curp: 'CCCC041125HMCXXX03',
                semestre: 1,
                correo_institucional: 'jose.hernandez@example.com'
            });
            
            // Agregar hoja de instrucciones
            const instructionsSheet = workbook.addWorksheet('Instrucciones');
            instructionsSheet.getColumn(1).width = 80;
            
            instructionsSheet.addRow(['INSTRUCCIONES PARA CARGA MASIVA DE ALUMNOS']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['FORMATO DEL ARCHIVO (columnas en este orden):']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['Columna A: Nombre (solo el/los nombre(s) del alumno)']);
            instructionsSheet.addRow(['Columna B: Apellido Paterno']);
            instructionsSheet.addRow(['Columna C: Apellido Materno']);
            instructionsSheet.addRow(['Columna D: CURP (18 caracteres, se convertirá a mayúsculas)']);
            instructionsSheet.addRow(['Columna E: Semestre (número del 1 al 10)']);
            instructionsSheet.addRow(['Columna F: Correo Institucional (será el usuario para acceder al sistema)']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['IMPORTANTE:']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['Todos los campos son OBLIGATORIOS']);
            instructionsSheet.addRow(['La primera fila debe contener los encabezados (no la borres)']);
            instructionsSheet.addRow(['El CURP debe tener exactamente 18 caracteres']);
            instructionsSheet.addRow(['No pueden existir CURPs duplicados']);
            instructionsSheet.addRow(['No pueden existir correos duplicados']);
            instructionsSheet.addRow(['El correo debe tener formato válido (ejemplo@dominio.com)']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['DATOS GENERADOS AUTOMÁTICAMENTE:']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['• Contraseña temporal: ENI2025! (los alumnos deben cambiarla al ingresar)']);
            instructionsSheet.addRow(['• Matrícula: Se genera automáticamente (formato: 2025XXXX)']);
            instructionsSheet.addRow(['• Fecha de nacimiento: Se extrae del CURP automáticamente']);
            instructionsSheet.addRow(['• Generación: 2025 (los alumnos pueden editarla en su portal)']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['NOTA: Los alumnos podrán editar su matrícula y generación desde su portal.']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['EJEMPLO DE CURP VÁLIDO:']);
            instructionsSheet.addRow(['AAAA040315HMCXXX01']);
            instructionsSheet.addRow(['  ││││││']);
            instructionsSheet.addRow(['  │││└└└─ Fecha: 04-03-15 (15 de marzo de 2004)']);
            instructionsSheet.addRow(['  └└└──── Iniciales: Pérez García Juan']);
            instructionsSheet.addRow([]);
            instructionsSheet.addRow(['¿DUDAS? Contacta al administrador del sistema.']);
            
            instructionsSheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF0000FF' } };
            
            // Enviar archivo
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=plantilla_carga_alumnos.xlsx'
            );
            
            await workbook.xlsx.write(res);
            res.end();
            
        } catch (error) {
            console.error('Error al generar plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar plantilla',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = cargaMasivaController;