// ============================================
// CONTROLADOR DE REPORTES COMPLETO
// Sistema de Gestión de Expedientes Estudiantiles
// Incluye funciones antiguas Y nuevas
// ============================================

const { pool } = require('../config/database');
const Alumno = require('../models/alumno.model');
const PDFGenerator = require('../utils/pdfGenerator');
const ExcelGenerator = require('../utils/excelGenerator');

function convertirBooleano(valor) {
    if (valor === null || valor === undefined) return '-';
    return valor === 1 || valor === true || valor === '1' ? 'Sí' : 'No';
}


// ============================================
// CONFIGURACIÓN DE CAMPOS DISPONIBLES
// ============================================
const camposDisponibles = {
    // Campos básicos
    matricula: 'a.matricula',
    nombre_completo: 'a.nombre_completo',
    curp: 'a.curp',
    fecha_nacimiento: 'a.fecha_nacimiento',
    edad: 'TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE())',
    correo_institucional: 'a.correo_institucional',
    correo_personal: 'a.correo_personal',
    celular: 'a.celular',
    telefono_emergencia: 'a.telefono_emergencia',
    estado_civil: 'a.estado_civil',
    domicilio_completo: 'CONCAT_WS(", ", d.calle, d.numero, d.colonia)',
    municipio: 'd.municipio',
    estado: 'd.estado',
    
    // Campos académicos
    nombre_licenciatura: 'l.nombre_licenciatura',
    semestre_actual: 'a.semestre_actual',
    generacion: 'a.generacion',
    status_alumno: 'a.status_alumno',
    promedio_general: '(SELECT ROUND(AVG(promedio), 2) FROM semestre_promedio sp WHERE sp.id_alumno = a.id_alumno)',
    situacion_academica: 'da.situacion_academica',
    escuela_procedencia: 'da.escuela_procedencia',
    promedio_media_superior: 'da.promedio_media_superior',
    
    // Campos de salud
    tipo_sangre: 'ds.tipo_sangre',
    afiliacion_seguro_medico: 'ds.afiliacion_seguro_medico',
    numero_seguro_social: 'ds.numero_seguro_social',
    alergias: 'ds.alergias',
    tiene_enfermedad: 'ds.tiene_enfermedad',  // Se convertirá a Sí/No
    nombre_enfermedad: 'ds.nombre_enfermedad',
    
    //  Campos socioeconómicos CORREGIDOS
    recursos_economicos: 'dse.recursos_economicos',
    dependencia_economica: 'dse.dependencia_economica',
    alguien_depende_ti: 'dse.alguien_depende_ti',  // Se convertirá a Sí/No
    trabaja: 'dse.trabaja',  // Se convertirá a Sí/No
    lugar_trabajo: 'dse.lugar_trabajo',
    horario_trabajo: 'dse.horario_trabajo',
    renta_fuera_domicilio: 'dse.renta_fuera_domicilio',  // Se convertirá a Sí/No
    
    // Campos de prácticas profesionales - MODIFICADO PARA MÚLTIPLES PRÁCTICAS
    total_practicas: '(SELECT COUNT(*) FROM practicas_profesionales pp WHERE pp.id_alumno = a.id_alumno)',
    practica_periodo: 'pp.periodo_escolar',
    practica_nombre_escuela: 'pp.nombre_escuela',
    practica_cct: 'pp.cct_escuela',
    practica_direccion: 'CONCAT(pp.municipio, ", ", pp.estado)',
    practica_fecha_inicio: 'pp.fecha_inicio',
    practica_fecha_fin: 'pp.fecha_fin',
    practica_horas: 'pp.horas_totales',
    practica_nivel_educativo: 'pp.nivel_educativo',
    practica_situacion: 'pp.situacion',
    
    // Campos de incidentes
    total_incidentes: '(SELECT COUNT(*) FROM incidentes i WHERE i.id_alumno = a.id_alumno)',
    incidentes_abiertos: "(SELECT COUNT(*) FROM incidentes i WHERE i.id_alumno = a.id_alumno AND i.estado_incidente = 'Abierto')"
};

const camposBooleanos = [
    'tiene_enfermedad',
    'alguien_depende_ti',
    'trabaja',
    'renta_fuera_domicilio'
];


// ============================================
// REPORTE DE EXPEDIENTE COMPLETO (PDF) - ANTIGUA
// ============================================
const generarExpedientePDF = async (req, res) => {
    try {
        const { id } = req.params;
        
        const expediente = await Alumno.getExpedienteCompleto(parseInt(id));
        
        if (!expediente.datos_personales) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }
        

        if (req.user.rol === 'Invitado') {
            const alumno = await Alumno.findById(parseInt(id));
            
            // Verificar licenciatura
            if (!req.permisosInvitado || !req.permisosInvitado.licenciaturas_permitidas) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario invitado sin permisos asignados'
                });
            }

            if (!req.permisosInvitado.licenciaturas_permitidas.includes(alumno.id_licenciatura)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permiso para ver el expediente de este alumno'
                });
            }
            
            // Filtrar por secciones
            const { filtrarDatosSegunPermisos } = require('../middleware/auth.middleware');
            expediente = filtrarDatosSegunPermisos(expediente, req.permisosInvitado);
            
            console.log(`PDF de expediente filtrado para invitado: ${req.user.correo}`);
        }
        
        const datos = expediente.datos_personales;
        
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Expediente_${datos.matricula}.pdf"`);
        
        doc.pipe(res);
        
        pdfGen.addHeader(
            'EXPEDIENTE ESTUDIANTIL',
            `${datos.nombre_completo} - ${datos.matricula}`
        );
        
        // ============================================
        // 1. DATOS PERSONALES
        // ============================================
        pdfGen.addSection('DATOS PERSONALES', '');
        pdfGen.addKeyValuePairs({
            'Nombre Completo': datos.nombre_completo,
            'CURP': datos.curp,
            'Matrícula': datos.matricula,
            'Fecha de Nacimiento': formatDate(datos.fecha_nacimiento),
            'Edad': datos.edad || 'N/A',
            'Estado Civil': datos.estado_civil || 'No especificado',
            'Correo Institucional': datos.correo_institucional,
            'Correo Personal': datos.correo_personal || 'No registrado',
            'Celular': datos.celular || 'No registrado',
            'Teléfono Emergencia': datos.telefono_emergencia || 'No registrado'
        }, 2);
        
        // ============================================
        // 2. INFORMACIÓN ACADÉMICA
        // ============================================
        pdfGen.addSection('INFORMACIÓN ACADÉMICA', '');
        const rendimiento = expediente.rendimiento_academico;
        if (rendimiento) {
            pdfGen.addKeyValuePairs({
                'Licenciatura': datos.nombre_licenciatura,
                'Semestre Actual': `${datos.semestre_actual}°`,
                'Generación': datos.generacion,
                'Status': datos.status_alumno,
                'Promedio General': rendimiento.promedio_general || 'N/A',
                'Situación Académica': rendimiento.situacion_academica || 'N/A',
                'Escuela de Procedencia': rendimiento.escuela_procedencia || 'N/A',
                'Promedio Media Superior': rendimiento.promedio_media_superior || 'N/A'
            }, 2);
        }
        
        // ============================================
        // 3. HISTORIAL DE PROMEDIOS
        // ============================================
        if (expediente.promedios_semestre && expediente.promedios_semestre.length > 0) {
            pdfGen.addSection('HISTORIAL DE PROMEDIOS', '');
            const promediosData = expediente.promedios_semestre.map(p => {
                const promedio = parseFloat(p.promedio);
                const promedioStr = !isNaN(promedio) && promedio !== null 
                    ? promedio.toFixed(2) 
                    : 'N/A';
                
                return [
                    `Semestre ${p.numero_semestre}°`,
                    promedioStr,
                    formatDate(p.fecha_registro)
                ];
            });
            pdfGen.addTable(['Semestre', 'Promedio', 'Fecha Registro'], promediosData);
        }
        
        // ============================================
        // 4. DATOS DE SALUD
        // ============================================
        if (expediente.datos_salud) {
            pdfGen.addSection('INFORMACIÓN DE SALUD', '');
            const salud = expediente.datos_salud;
            pdfGen.addKeyValuePairs({
                'Tipo de Sangre': salud.tipo_sangre || 'N/A',
                'Número de Seguro Social': salud.numero_seguro_social || 'N/A',
                'Afiliación Seguro Médico': salud.afiliacion_seguro_medico || 'N/A',
                'Alergias': salud.alergias || 'Ninguna registrada',
                'Tiene Enfermedad': convertirBooleano(salud.tiene_enfermedad),
                'Nombre de Enfermedad': salud.nombre_enfermedad || 'N/A',
                'Toma Medicamentos': convertirBooleano(salud.toma_medicamentos),
                'Medicamentos': salud.medicamentos || 'N/A'
            }, 2);
        }
        
        // ============================================
        // 5. DATOS SOCIOECONÓMICOS
        // ============================================
        if (expediente.datos_socioeconomicos) {
            pdfGen.addSection('INFORMACIÓN SOCIOECONÓMICA', '');
            const socio = expediente.datos_socioeconomicos;
            pdfGen.addKeyValuePairs({
                'Recursos Económicos': socio.recursos_economicos || 'N/A',
                'Dependencia Económica': socio.dependencia_economica || 'N/A',
                'Alguien Depende de Ti': convertirBooleano(socio.alguien_depende_ti),
                'Número de Dependientes': socio.numero_dependientes || 'N/A',
                'Trabaja': convertirBooleano(socio.trabaja),
                'Lugar de Trabajo': socio.lugar_trabajo || 'N/A',
                'Horario de Trabajo': socio.horario_trabajo || 'N/A',
                'Renta Fuera de Domicilio': convertirBooleano(socio.renta_fuera_domicilio)
            }, 2);
            
            // Domicilio de renta si aplica
            if (socio.domicilio_renta) {
                const dom = socio.domicilio_renta;
                pdfGen.addKeyValuePairs({
                    'Domicilio de Renta': `${dom.calle || ''} ${dom.numero || ''}, ${dom.colonia || ''}, ${dom.municipio || ''}, ${dom.estado || ''}`
                }, 1);
            }
        }
        
        // ============================================
        // 6. FAMILIARES Y TUTORES
        // ============================================
        if (expediente.familiares && expediente.familiares.length > 0) {
            pdfGen.addSection('FAMILIARES Y TUTORES', '');
            expediente.familiares.forEach(fam => {
                doc.fontSize(11)
                   .fillColor('#333333')
                   .text(`${fam.tipo_familiar}: ${fam.nombre_completo}`, 50, doc.y);
                
                doc.fontSize(9)
                   .fillColor('#666666')
                   .text(`Teléfono: ${fam.telefono || 'N/A'} | Ocupación: ${fam.ocupacion || 'N/A'}`, 50, doc.y);
                
                if (fam.es_tutor) {
                    doc.fontSize(9)
                       .fillColor('#0d6efd')
                       .text('Tutor Asignado', 50, doc.y);
                }
                
                doc.moveDown(1);
            });
        }
        
        // ============================================
        // 7. HABILIDADES
        // ============================================
        if (expediente.habilidades && expediente.habilidades.length > 0) {
            pdfGen.addSection('HABILIDADES Y COMPETENCIAS', '');
            expediente.habilidades.forEach(hab => {
                doc.fontSize(10)
                    .fillColor('#333333')
                    .text(`• ${hab.nombre_habilidad}`, 50, doc.y);
                
                if (hab.descripcion) {
                    doc.fontSize(9)
                        .fillColor('#666666')
                        .text(`  ${hab.descripcion}`, 50, doc.y);
                }
                
                doc.fontSize(8)
                    .fillColor('#999999')
                    .text(`  Nivel: ${hab.nivel_dominio || 'N/A'}`, 50, doc.y);
                
                doc.moveDown(0.5);
            });
        }
        
        // ============================================
        // 8. CERTIFICACIONES
        // ============================================
        if (expediente.certificaciones && expediente.certificaciones.length > 0) {
            pdfGen.addSection('CERTIFICACIONES', '');
            expediente.certificaciones.forEach(cert => {
                doc.fontSize(10)
                    .fillColor('#333333')
                    .text(`${cert.nombre_certificacion}`, 50, doc.y);
                
                doc.fontSize(9)
                    .fillColor('#666666')
                    .text(`Institución: ${cert.institucion_emisora || 'N/A'}`, 50, doc.y);
                
                doc.fontSize(9)
                    .text(`Fecha: ${formatDate(cert.fecha_obtencion)} | Vigencia: ${cert.vigencia || 'N/A'}`, 50, doc.y);
                
                if (cert.descripcion) {
                    doc.fontSize(9)
                        .text(`${cert.descripcion}`, 50, doc.y);
                }
                
                doc.moveDown(1);
            });
        }
        
        // ============================================
        // 9. INCIDENTES
        // ============================================
        if (expediente.incidentes && expediente.incidentes.length > 0) {
            pdfGen.addSection('INCIDENTES REGISTRADOS', '');
            expediente.incidentes.forEach(inc => {
                doc.fontSize(11)
                    .fillColor('#dc3545')
                    .text(`${inc.tipo_incidente}`, 50, doc.y);
                
                doc.fontSize(9)
                    .fillColor('#666666')
                    .text(`Fecha: ${formatDate(inc.fecha_incidente)} | Estado: ${inc.estado_incidente}`, 50, doc.y);
                
                doc.fontSize(10)
                    .fillColor('#333333')
                    .text(inc.descripcion, 50, doc.y + 5, { align: 'justify' });
                
                doc.moveDown(1.5);
            });
        }
        
        pdfGen.finalize();
        
        console.log(`Expediente PDF generado - Alumno ID: ${id}`);
        
    } catch (error) {
        console.error('Error en generarExpedientePDF:', error.message);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte de expediente'
            });
        }
    }
};


function procesarResultados(resultados) {
    return resultados.map(fila => {
        const filaProcessada = { ...fila };
        
        // Convertir campos booleanos 0/1 a Sí/No
        camposBooleanos.forEach(campo => {
            if (campo in filaProcessada) {
                filaProcessada[campo] = convertirBooleano(filaProcessada[campo]);
            }
        });
        
        // Formatear valores null
        Object.keys(filaProcessada).forEach(key => {
            if (filaProcessada[key] === null || filaProcessada[key] === undefined) {
                filaProcessada[key] = '-';
            }
        });
        
        return filaProcessada;
    });
}

// ============================================
// LISTA DE ALUMNOS (EXCEL) - ANTIGUA
// ============================================
const generarListaAlumnosExcel = async (req, res) => {
    try {
        const { licenciatura, generacion, status, semestre } = req.query;
        
        const filters = {
            id_licenciatura: licenciatura ? parseInt(licenciatura) : undefined,
            generacion: generacion ? parseInt(generacion) : undefined,
            status: status || undefined,
            semestre: semestre ? parseInt(semestre) : undefined
        };
        
        const alumnos = await Alumno.getAll(filters);
        
        const excelGen = new ExcelGenerator();
        const workbook = excelGen.createWorkbook();
        const worksheet = workbook.addWorksheet('Alumnos');
        
        worksheet.columns = [
            { header: 'Matrícula', key: 'matricula', width: 15 },
            { header: 'Nombre Completo', key: 'nombre_completo', width: 40 },
            { header: 'CURP', key: 'curp', width: 20 },
            { header: 'Licenciatura', key: 'nombre_licenciatura', width: 30 },
            { header: 'Semestre', key: 'semestre_actual', width: 10 },
            { header: 'Generación', key: 'generacion', width: 12 },
            { header: 'Status', key: 'status_alumno', width: 12 },
            { header: 'Correo', key: 'correo_institucional', width: 35 }
        ];
        
        alumnos.forEach(alumno => {
            worksheet.addRow(alumno);
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Lista_Alumnos.xlsx"');
        
        await workbook.xlsx.write(res);
        res.end();
        
        console.log('Lista de alumnos Excel generada');
        
    } catch (error) {
        console.error('Error en generarListaAlumnosExcel:', error);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte Excel'
            });
        }
    }
};

// ============================================
// LISTA DE ALUMNOS (PDF) - ANTIGUA
// ============================================
const generarListaAlumnosPDF = async (req, res) => {
    try {
        const { licenciatura, generacion, status, semestre } = req.query;
        
        const filters = {
            id_licenciatura: licenciatura ? parseInt(licenciatura) : undefined,
            generacion: generacion ? parseInt(generacion) : undefined,
            status: status || undefined,
            semestre: semestre ? parseInt(semestre) : undefined
        };
        
        const alumnos = await Alumno.getAll(filters);
        
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Lista_Alumnos.pdf"');
        
        doc.pipe(res);
        
        pdfGen.addHeader('LISTA DE ALUMNOS');
        
        const tableData = alumnos.map(alumno => [
            alumno.matricula,
            alumno.nombre_completo,
            alumno.nombre_licenciatura,
            `${alumno.semestre_actual}°`,
            alumno.status_alumno
        ]);
        
        pdfGen.addTable(
            ['Matrícula', 'Nombre', 'Licenciatura', 'Sem.', 'Status'],
            tableData
        );
        
        pdfGen.finalize();
        
        console.log('Lista de alumnos PDF generada');
        
    } catch (error) {
        console.error('Error en generarListaAlumnosPDF:', error);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte PDF'
            });
        }
    }
};

// ============================================
// ESTADÍSTICAS (PDF) - ANTIGUA
// ============================================
const generarEstadisticasPDF = async (req, res) => {
    try {
        const usuario = req.user; // Del middleware de autenticación
        const dashboardModel = require('../models/dashboard.model');
        
        // Obtener nombre del rol
        const [roles] = await pool.execute(
            'SELECT nombre_rol FROM roles WHERE id_rol = ?',
            [usuario.id_rol]
        );
        const rolNombre = roles[0]?.nombre_rol;
        
        // Obtener estadísticas según el rol
        let estadisticas;
        if (rolNombre === 'Administrador') {
            // Admin: estadísticas generales de todo
            const [totalAlumnos] = await pool.execute(
                'SELECT COUNT(*) as total FROM alumnos'
            );
            const [alumnosActivos] = await pool.execute(
                'SELECT COUNT(*) as total FROM alumnos WHERE status_alumno = "Activo"'
            );
            const [alumnosEgresados] = await pool.execute(
                'SELECT COUNT(*) as total FROM alumnos WHERE status_alumno = "Egresado"'
            );
            const [promedioGeneral] = await pool.execute(`
                SELECT ROUND(AVG(promedio), 2) as promedio
                FROM semestre_promedio
            `);
            const [porLicenciatura] = await pool.execute(`
                SELECT 
                    l.nombre_licenciatura,
                    COUNT(a.id_alumno) as total
                FROM licenciaturas l
                LEFT JOIN alumnos a ON l.id_licenciatura = a.id_licenciatura
                GROUP BY l.id_licenciatura, l.nombre_licenciatura
                ORDER BY total DESC
            `);
            
            estadisticas = {
                total_alumnos: totalAlumnos[0].total,
                alumnos_activos: alumnosActivos[0].total,
                alumnos_egresados: alumnosEgresados[0].total,
                promedio_general: promedioGeneral[0].promedio || 0,
                por_licenciatura: porLicenciatura
            };
            
        } else if (rolNombre === 'Docente') {
            // Docente: solo sus licenciaturas asignadas
            const [licenciaturasDocente] = await pool.execute(
                `SELECT DISTINCT dl.id_licenciatura
                 FROM docentes d
                 INNER JOIN docente_licenciatura dl ON d.id_docente = dl.id_docente
                 WHERE d.id_usuario = ?`,
                [usuario.id_usuario]
            );
            
            const idsLicenciaturas = licenciaturasDocente.map(l => l.id_licenciatura);
            
            if (idsLicenciaturas.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No tienes licenciaturas asignadas'
                });
            }
            
            const placeholders = idsLicenciaturas.map(() => '?').join(',');
            
            const [totalAlumnos] = await pool.execute(
                `SELECT COUNT(*) as total 
                 FROM alumnos 
                 WHERE id_licenciatura IN (${placeholders})`,
                idsLicenciaturas
            );
            const [alumnosActivos] = await pool.execute(
                `SELECT COUNT(*) as total 
                 FROM alumnos 
                 WHERE id_licenciatura IN (${placeholders}) 
                 AND status_alumno = "Activo"`,
                idsLicenciaturas
            );
            const [alumnosEgresados] = await pool.execute(
                `SELECT COUNT(*) as total 
                 FROM alumnos 
                 WHERE id_licenciatura IN (${placeholders}) 
                 AND status_alumno = "Egresado"`,
                idsLicenciaturas
            );
            const [promedioGeneral] = await pool.execute(`
                SELECT ROUND(AVG(sp.promedio), 2) as promedio
                FROM semestre_promedio sp
                INNER JOIN alumnos a ON sp.id_alumno = a.id_alumno
                WHERE a.id_licenciatura IN (${placeholders})
            `, idsLicenciaturas);
            const [porLicenciatura] = await pool.execute(`
                SELECT 
                    l.nombre_licenciatura,
                    COUNT(a.id_alumno) as total
                FROM licenciaturas l
                LEFT JOIN alumnos a ON l.id_licenciatura = a.id_licenciatura
                WHERE l.id_licenciatura IN (${placeholders})
                GROUP BY l.id_licenciatura, l.nombre_licenciatura
                ORDER BY total DESC
            `, idsLicenciaturas);
            
            estadisticas = {
                total_alumnos: totalAlumnos[0].total,
                alumnos_activos: alumnosActivos[0].total,
                alumnos_egresados: alumnosEgresados[0].total,
                promedio_general: promedioGeneral[0].promedio || 0,
                por_licenciatura: porLicenciatura
            };
        } else {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para generar este reporte'
            });
        }
        
        // Generar PDF
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Estadisticas.pdf"');
        
        doc.pipe(res);
        
        pdfGen.addHeader('ESTADÍSTICAS INSTITUCIONALES');
        
        pdfGen.addSection('RESUMEN GENERAL', '');
        pdfGen.addKeyValuePairs({
            'Total de Alumnos': estadisticas.total_alumnos,
            'Alumnos Activos': estadisticas.alumnos_activos,
            'Alumnos Egresados': estadisticas.alumnos_egresados,
            'Promedio General': estadisticas.promedio_general
        }, 2);
        
        if (estadisticas.por_licenciatura && estadisticas.por_licenciatura.length > 0) {
            pdfGen.addSection('DISTRIBUCIÓN POR LICENCIATURA', '');
            const licData = estadisticas.por_licenciatura.map(lic => [
                lic.nombre_licenciatura,
                lic.total.toString()
            ]);
            pdfGen.addTable(['Licenciatura', 'Total'], licData);
        }
        
        pdfGen.finalize();
        
    } catch (error) {
        console.error('Error en generarEstadisticasPDF:', error);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error al generar estadísticas'
            });
        }
    }
};

// ============================================
// FUNCIONES NUEVAS (REPORTES PERSONALIZADOS)
// ============================================

// ============================================
// REPORTE PERSONALIZADO - VISTA PREVIA
// ============================================
const generarVistaPrevia = async (req, res) => {
    try {
        const { campos } = req.query;
        
        if (!campos) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debes especificar los campos a incluir' 
            });
        }
        
        const camposArray = campos.split(',');
        const { selectClause, joinClause, tienePracticas } = construirConsultaDinamica(camposArray);
        
        // Construir filtros
        let whereClause = 'WHERE 1=1';
        const params = [];

        
        
        if (req.query.licenciatura) {
            // Si el usuario seleccionó una licenciatura específica
            whereClause += ' AND a.id_licenciatura = ?';
            params.push(req.query.licenciatura);
        } else if (req.user.nombre_rol === 'Docente') {
            // Si es docente y NO seleccionó licenciatura, filtrar por SUS licenciaturas
            const licenciaturasDocente = await obtenerLicenciaturasDocente(req.user.id_usuario);
            
            if (licenciaturasDocente.length > 0) {
                const placeholders = licenciaturasDocente.map(() => '?').join(',');
                whereClause += ` AND a.id_licenciatura IN (${placeholders})`;
                params.push(...licenciaturasDocente);
            } else {
                // Si no tiene licenciaturas asignadas, no mostrar nada
                whereClause += ' AND 1=0';
            }
        }
        
        if (req.query.generacion) {
            whereClause += ' AND a.generacion = ?';
            params.push(req.query.generacion);
        }
        
        if (req.query.status) {
            whereClause += ' AND a.status_alumno = ?';
            params.push(req.query.status);
        }
        
        if (req.query.semestre) {
            whereClause += ' AND a.semestre_actual = ?';
            params.push(req.query.semestre);
        }
        // Agregar ORDER BY si incluye prácticas
        let orderClause = '';
        if (tienePracticas) {
            orderClause = ' ORDER BY a.matricula, pp.periodo_escolar DESC, pp.fecha_inicio DESC';
        }

        // Ejecutar consulta
        const query = `
            SELECT ${selectClause}
            FROM alumnos a
            ${joinClause}
            ${whereClause}
            ${orderClause} 
            LIMIT 100
        `;
        
        
        const [resultados] = await pool.query(query, params);
        
        // Procesar resultados (convertir 0/1 a Sí/No)
        const resultadosProcesados = procesarResultados(resultados);
        
        res.json({ 
            success: true, 
            data: resultadosProcesados
        });
        
    } catch (error) {
        console.error('Error en generarVistaPrevia:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al generar vista previa',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// ============================================
// REPORTE PERSONALIZADO - EXCEL
// ============================================
const generarPersonalizadoExcel = async (req, res) => {
    try {
        const { campos } = req.query;
        
        if (!campos) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debes especificar los campos a incluir' 
            });
        }
        
        const camposArray = campos.split(',');
        const { selectClause, joinClause, tienePracticas } = construirConsultaDinamica(camposArray);
        
        //  FIX: Asegurar que joins nunca sea undefined
        const joins = joinClause || 'INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura';
        
        // Construir filtros
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (req.query.licenciatura) {
            whereClause += ' AND a.id_licenciatura = ?';
            params.push(req.query.licenciatura);
        } else if (req.user.nombre_rol === 'Docente') {
            const licenciaturasDocente = await obtenerLicenciaturasDocente(req.user.id_usuario);
            
            if (licenciaturasDocente.length > 0) {
                const placeholders = licenciaturasDocente.map(() => '?').join(',');
                whereClause += ` AND a.id_licenciatura IN (${placeholders})`;
                params.push(...licenciaturasDocente);
            } else {
                whereClause += ' AND 1=0';
            }
        }
        
        if (req.query.generacion) {
            whereClause += ' AND a.generacion = ?';
            params.push(req.query.generacion);
        }
        
        if (req.query.status) {
            whereClause += ' AND a.status_alumno = ?';
            params.push(req.query.status);
        }
        
        if (req.query.semestre) {
            whereClause += ' AND a.semestre_actual = ?';
            params.push(req.query.semestre);
        }
        // Agregar ORDER BY si incluye prácticas para mantener orden cronológico
        let orderClause = '';
        if (tienePracticas) {
            orderClause = ' ORDER BY a.matricula, pp.periodo_escolar DESC, pp.fecha_inicio DESC';
        }
        // Ejecutar consulta
        const query = `
            SELECT ${selectClause}
            FROM alumnos a
            ${joins}
            ${whereClause}
            ${orderClause}
        `;
        
        
        const [resultados] = await pool.execute(query, params);
        
        if (resultados.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No se encontraron registros' 
            });
        }
        
        //  Procesar resultados (convertir 0/1 a Sí/No)
        const resultadosProcesados = procesarResultados(resultados);
        
        // Obtener headers dinámicos
        const headers = camposArray.map(campo => {
            const campoInfo = obtenerLabelCampo(campo);
            return campoInfo.label;
        });
        
        //  USAR TU IMPLEMENTACIÓN DE ExcelGenerator
        const excelGen = new ExcelGenerator();
        excelGen.createWorkbook('Reporte Personalizado'); // ← Método correcto
        
        const ws = excelGen.worksheet;
        
        // Agregar encabezado institucional
        excelGen.addHeader('REPORTE PERSONALIZADO DE ALUMNOS');
        
        // Agregar información de filtros (si hay)
        let currentRow = 4;
        if (req.query.licenciatura || req.query.generacion || req.query.status || req.query.semestre) {
            const filtrosCell = ws.getCell(`A${currentRow}`);
            filtrosCell.value = 'Filtros aplicados:';
            filtrosCell.font = { bold: true };
            currentRow++;
            
            if (req.query.licenciatura) {
                ws.getCell(`A${currentRow}`).value = `- Licenciatura: ${req.query.licenciatura}`;
                currentRow++;
            }
            if (req.query.generacion) {
                ws.getCell(`A${currentRow}`).value = `- Generación: ${req.query.generacion}`;
                currentRow++;
            }
            if (req.query.status) {
                ws.getCell(`A${currentRow}`).value = `- Status: ${req.query.status}`;
                currentRow++;
            }
            if (req.query.semestre) {
                ws.getCell(`A${currentRow}`).value = `- Semestre: ${req.query.semestre}`;
                currentRow++;
            }
            currentRow++; // Espacio
        }
        
        // Headers de datos
        const headerRow = ws.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0d6efd' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // Agregar datos
        resultadosProcesados.forEach(alumno => {
            const rowData = camposArray.map(campo => {
                const valor = alumno[campo];
                return valor !== null && valor !== undefined ? valor : '-';
            });
            ws.addRow(rowData);
        });
        
        // Ajustar anchos de columna
        ws.columns.forEach((column, index) => {
            // Verificar que el header existe antes de acceder
            if (!headers[index]) {
                return; // Saltar columnas sin header (como id_alumno)
            }
            
            let maxLength = headers[index].length;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 10;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });
        
        // Configurar response
        const fileName = `Reporte_Personalizado_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        await excelGen.workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error en generarPersonalizadoExcel:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: 'Error al generar reporte Excel',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

// ============================================
// REPORTE PERSONALIZADO - PDF
// ============================================
const generarPersonalizadoPDF = async (req, res) => {
    try {
        const { campos } = req.query;
        
        if (!campos) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debes especificar los campos a incluir' 
            });
        }
        
        const camposArray = campos.split(',');
        const { selectClause, joinClause, tienePracticas } = construirConsultaDinamica(camposArray);
        
        //  FIX: Asegurar que joins nunca sea undefined
        const joins = joinClause || 'INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura';
        
        // Construir filtros
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (req.query.licenciatura) {
            whereClause += ' AND a.id_licenciatura = ?';
            params.push(req.query.licenciatura);
        } else if (req.user.nombre_rol === 'Docente') {
            const licenciaturasDocente = await obtenerLicenciaturasDocente(req.user.id_usuario);
            
            if (licenciaturasDocente.length > 0) {
                const placeholders = licenciaturasDocente.map(() => '?').join(',');
                whereClause += ` AND a.id_licenciatura IN (${placeholders})`;
                params.push(...licenciaturasDocente);
            } else {
                whereClause += ' AND 1=0';
            }
        }

        
        if (req.query.generacion) {
            whereClause += ' AND a.generacion = ?';
            params.push(req.query.generacion);
        }
        
        if (req.query.status) {
            whereClause += ' AND a.status_alumno = ?';
            params.push(req.query.status);
        }
        
        if (req.query.semestre) {
            whereClause += ' AND a.semestre_actual = ?';
            params.push(req.query.semestre);
        }
        
        // Agregar ORDER BY si incluye prácticas
        let orderClause = '';
        if (tienePracticas) {
            orderClause = ' ORDER BY a.matricula, pp.periodo_escolar DESC, pp.fecha_inicio DESC';
        }
        // Ejecutar consulta
        const query = `
            SELECT ${selectClause}
            FROM alumnos a
            ${joins}
            ${whereClause}
            ${orderClause}
        `;
        
        
        const [resultados] = await pool.execute(query, params);
        
        if (resultados.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No se encontraron registros' 
            });
        }
        
        //  Procesar resultados (convertir 0/1 a Sí/No)
        const resultadosProcesados = procesarResultados(resultados);
        
        // Obtener headers dinámicos
        const headers = camposArray.map(campo => {
            const campoInfo = obtenerLabelCampo(campo);
            return campoInfo.label;
        });
        
        // Preparar datos para PDF
        const rows = resultadosProcesados.map(alumno => {
            return camposArray.map(campo => {
                const valor = alumno[campo];
                // Truncar valores muy largos para PDF
                const valorStr = valor !== null && valor !== undefined ? String(valor) : '-';
                return valorStr.length > 50 ? valorStr.substring(0, 47) + '...' : valorStr;
            });
        });
        
        //  USAR TU IMPLEMENTACIÓN DE PDFGenerator
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument(); // ← Método correcto
        
        // Configurar response
        const fileName = `Reporte_Personalizado_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        doc.pipe(res);
        
        // Agregar encabezado
        pdfGen.addHeader('REPORTE PERSONALIZADO DE ALUMNOS', 'Sistema de Expedientes Estudiantiles'); // ← Método correcto
        
        // Información de filtros aplicados
        if (req.query.licenciatura || req.query.generacion || req.query.status || req.query.semestre) {
            doc.fontSize(10);
            doc.text('Filtros aplicados:', { underline: true });
            if (req.query.licenciatura) doc.text(`  - Licenciatura: ${req.query.licenciatura}`);
            if (req.query.generacion) doc.text(`  - Generación: ${req.query.generacion}`);
            if (req.query.status) doc.text(`  - Status: ${req.query.status}`);
            if (req.query.semestre) doc.text(`  - Semestre: ${req.query.semestre}`);
            doc.moveDown();
        }
        
        // Total de registros
        doc.fontSize(10);
        doc.text(`Total de registros: ${resultadosProcesados.length}`, { align: 'right' });
        doc.moveDown();
        
        // Ajustar columnas según cantidad de campos
        const columnWidths = headers.map(() => {
            const numColumns = headers.length;
            if (numColumns <= 3) return 150;
            if (numColumns <= 5) return 100;
            if (numColumns <= 8) return 70;
            return 50;
        });
        
        // Agregar tabla
        pdfGen.addTable(headers, rows, { columnWidths }); // ← Método correcto
        
        // Finalizar PDF
        pdfGen.finalize(); // ← Método correcto
        
    } catch (error) {
        console.error('Error en generarPersonalizadoPDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: 'Error al generar reporte PDF',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

// ============================================
// LISTA COMPLETA - EXCEL
// ============================================
const generarListaCompletaExcel = async (req, res) => {
    try {
        const { whereClause, params } = await construirFiltroLicenciaturas(req);
        
        const query = `
            SELECT 
                a.matricula,
                a.nombre_completo,
                a.curp,
                l.nombre_licenciatura,
                a.semestre_actual,
                a.generacion,
                a.status_alumno,
                a.correo_institucional,
                a.celular,
                TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) as edad
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            WHERE 1=1${whereClause}
            ORDER BY a.nombre_completo
        `;
        
        const [alumnos] = await pool.execute(query, params);
        
        const excelGen = new ExcelGenerator();
        const workbook = excelGen.createWorkbook();
        const worksheet = workbook.addWorksheet('Lista Completa');
        
        worksheet.columns = [
            { header: 'Matrícula', key: 'matricula', width: 15 },
            { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
            { header: 'CURP', key: 'curp', width: 20 },
            { header: 'Licenciatura', key: 'nombre_licenciatura', width: 30 },
            { header: 'Semestre', key: 'semestre_actual', width: 10 },
            { header: 'Generación', key: 'generacion', width: 12 },
            { header: 'Status', key: 'status_alumno', width: 12 },
            { header: 'Correo', key: 'correo_institucional', width: 30 },
            { header: 'Celular', key: 'celular', width: 15 },
            { header: 'Edad', key: 'edad', width: 10 }
        ];
        
        alumnos.forEach(alumno => worksheet.addRow(alumno));
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Lista_Completa_Alumnos.xlsx"');
        
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error en generarListaCompletaExcel:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    }
};

// ============================================
// LISTA COMPLETA - PDF
// ============================================
const generarListaCompletaPDF = async (req, res) => {
    try {
        const { whereClause, params } = await construirFiltroLicenciaturas(req);
        
        const query = `
            SELECT 
                a.matricula,
                a.nombre_completo,
                l.nombre_licenciatura,
                a.semestre_actual,
                a.status_alumno
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            WHERE 1=1${whereClause}
            ORDER BY a.nombre_completo
        `;
        
        const [alumnos] = await pool.execute(query, params);
        
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Lista_Completa_Alumnos.pdf"');
        
        doc.pipe(res);
        
        pdfGen.addHeader('LISTA COMPLETA DE ALUMNOS');
        
        const tableData = {
            headers: ['Matrícula', 'Nombre', 'Licenciatura', 'Sem.', 'Status'],
            rows: alumnos.map(a => [
                a.matricula,
                a.nombre_completo,
                a.nombre_licenciatura,
                a.semestre_actual + '°',
                a.status_alumno
            ])
        };
        
        pdfGen.addTable(tableData.headers, tableData.rows);
        pdfGen.finalize();
        
    } catch (error) {
        console.error('Error en generarListaCompletaPDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    }
};

// ============================================
// ALUMNOS EN RIESGO - EXCEL
// ============================================
const generarAlumnosRiesgoExcel = async (req, res) => {
    try {
        const { whereClause, params } = await construirFiltroLicenciaturas(req);
        
        const query = `
            SELECT 
                a.matricula,
                a.nombre_completo,
                l.nombre_licenciatura,
                a.semestre_actual,
                ROUND((SELECT AVG(promedio) FROM semestre_promedio sp WHERE sp.id_alumno = a.id_alumno), 2) AS promedio_general,
                da.situacion_academica,
                COUNT(DISTINCT i.id_incidente) AS incidentes_abiertos
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
            LEFT JOIN incidentes i ON a.id_alumno = i.id_alumno AND i.estado_incidente = 'Abierto'
            WHERE (SELECT AVG(promedio) FROM semestre_promedio sp WHERE sp.id_alumno = a.id_alumno) < 7.0
            OR da.situacion_academica = 'Irregular'
            OR EXISTS (SELECT 1 FROM incidentes WHERE id_alumno = a.id_alumno AND estado_incidente = 'Abierto')
            GROUP BY a.id_alumno
            ORDER BY promedio_general ASC, incidentes_abiertos DESC
        `;
        
        const [alumnos] = await pool.execute(query, params);
        
        const excelGen = new ExcelGenerator();
        const workbook = excelGen.createWorkbook();
        const worksheet = workbook.addWorksheet('Alumnos en Riesgo');
        
        worksheet.columns = [
            { header: 'Matrícula', key: 'matricula', width: 15 },
            { header: 'Nombre', key: 'nombre_completo', width: 35 },
            { header: 'Licenciatura', key: 'nombre_licenciatura', width: 30 },
            { header: 'Semestre', key: 'semestre_actual', width: 10 },
            { header: 'Promedio', key: 'promedio_general', width: 12 },
            { header: 'Situación', key: 'situacion_academica', width: 20 }
        ];
        
        alumnos.forEach(alumno => worksheet.addRow(alumno));
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Alumnos_en_Riesgo.xlsx"');
        
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error en generarAlumnosRiesgoExcel:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    }
};

// ============================================
// ALUMNOS EN RIESGO - PDF
// ============================================
const generarAlumnosRiesgoPDF = async (req, res) => {
    try {
        const { whereClause, params } = await construirFiltroLicenciaturas(req);
        
        const query = `
            SELECT 
                a.matricula,
                a.nombre_completo,
                l.nombre_licenciatura,
                a.semestre_actual,
                ROUND((SELECT AVG(promedio) FROM semestre_promedio sp WHERE sp.id_alumno = a.id_alumno), 2) AS promedio_general,
                da.situacion_academica,
                COUNT(DISTINCT i.id_incidente) AS incidentes_abiertos
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
            LEFT JOIN incidentes i ON a.id_alumno = i.id_alumno AND i.estado_incidente = 'Abierto'
            WHERE (SELECT AVG(promedio) FROM semestre_promedio sp WHERE sp.id_alumno = a.id_alumno) < 7.0
            OR da.situacion_academica = 'Irregular'
            OR EXISTS (SELECT 1 FROM incidentes WHERE id_alumno = a.id_alumno AND estado_incidente = 'Abierto')
            GROUP BY a.id_alumno
            ORDER BY promedio_general ASC, incidentes_abiertos DESC
        `;
        
        const [alumnos] = await pool.execute(query, params);
        
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Alumnos_en_Riesgo.pdf"');
        
        doc.pipe(res);
        
        pdfGen.addHeader('ALUMNOS EN RIESGO ACADÉMICO');
        
        const tableData = {
            headers: ['Matrícula', 'Nombre', 'Sem.', 'Promedio', 'Situación'],
            rows: alumnos.map(a => [
                a.matricula,
                a.nombre_completo,
                a.semestre_actual,
                a.promedio_general || 'N/A',
                a.situacion_academica || 'N/A'
            ])
        };
        
        pdfGen.addTable(tableData.headers, tableData.rows);
        pdfGen.finalize();
        
    } catch (error) {
        console.error('Error en generarAlumnosRiesgoPDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    }
};

// ============================================
// EXPEDIENTES INCOMPLETOS - EXCEL
// ============================================
const generarExpedientesIncompletosExcel = async (req, res) => {
    try {
        const { whereClause, params } = await construirFiltroLicenciaturas(req);
        
        const query = `
            SELECT 
                a.id_alumno,
                a.matricula,
                a.nombre_completo,
                l.nombre_licenciatura,
                a.correo_institucional,
                CASE WHEN ds.id_datos_salud IS NULL THEN 'Falta' ELSE 'Completo' END AS datos_salud,
                CASE WHEN da.id_datos_academicos IS NULL THEN 'Falta' ELSE 'Completo' END AS datos_academicos,
                CASE WHEN dse.id_datos_socioeconomicos IS NULL THEN 'Falta' ELSE 'Completo' END AS datos_socioeconomicos,
                CASE WHEN EXISTS (SELECT 1 FROM familiares f WHERE f.id_alumno = a.id_alumno) 
                     THEN 'Completo' ELSE 'Falta' END AS datos_familiares,
                CASE WHEN EXISTS (SELECT 1 FROM documentos doc WHERE doc.id_alumno = a.id_alumno) 
                     THEN 'Completo' ELSE 'Falta' END AS documentos
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            LEFT JOIN datos_salud ds ON a.id_alumno = ds.id_alumno
            LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
            LEFT JOIN datos_socioeconomicos dse ON a.id_alumno = dse.id_alumno
            WHERE (ds.id_datos_salud IS NULL 
               OR da.id_datos_academicos IS NULL 
               OR dse.id_datos_socioeconomicos IS NULL
               OR NOT EXISTS (SELECT 1 FROM familiares f WHERE f.id_alumno = a.id_alumno)
               OR NOT EXISTS (SELECT 1 FROM documentos doc WHERE doc.id_alumno = a.id_alumno))
            ${whereClause}
            ORDER BY a.nombre_completo
        `;
        
        const [alumnos] = await pool.execute(query, params);
        
        const excelGen = new ExcelGenerator();
        const workbook = excelGen.createWorkbook();
        const worksheet = workbook.addWorksheet('Expedientes Incompletos');
        
        worksheet.columns = [
            { header: 'Matrícula', key: 'matricula', width: 15 },
            { header: 'Nombre', key: 'nombre_completo', width: 35 },
            { header: 'Licenciatura', key: 'nombre_licenciatura', width: 30 },
            { header: 'Correo', key: 'correo_institucional', width: 30 },
            { header: 'Salud', key: 'datos_salud', width: 12 },
            { header: 'Académicos', key: 'datos_academicos', width: 12 },
            { header: 'Socioeconómicos', key: 'datos_socioeconomicos', width: 15 },
            { header: 'Familiares', key: 'datos_familiares', width: 12 },
            { header: 'Documentos', key: 'documentos', width: 12 }
        ];
        
        alumnos.forEach(alumno => worksheet.addRow(alumno));
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Expedientes_Incompletos.xlsx"');
        
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error en generarExpedientesIncompletosExcel:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error al generar reporte' });
        }
    }
};

// ============================================
// EXPEDIENTES INCOMPLETOS - PDF
// ============================================
const generarExpedientesIncompletosPDF = async (req, res) => {
    try {
        // NUEVO: Obtener filtro de licenciaturas
        const { whereClause, params } = await construirFiltroLicenciaturas(req);
        
        const query = `
            SELECT 
                a.matricula,
                a.nombre_completo,
                l.nombre_licenciatura,
                CASE WHEN ds.id_datos_salud IS NULL THEN 'Falta' ELSE 'OK' END AS salud,
                CASE WHEN da.id_datos_academicos IS NULL THEN 'Falta' ELSE 'OK' END AS academicos,
                CASE WHEN dse.id_datos_socioeconomicos IS NULL THEN 'Falta' ELSE 'OK' END AS socioeconomicos,
                CASE WHEN EXISTS (SELECT 1 FROM familiares f WHERE f.id_alumno = a.id_alumno) 
                     THEN 'OK' ELSE 'Falta' END AS familiares,
                CASE WHEN EXISTS (SELECT 1 FROM documentos doc WHERE doc.id_alumno = a.id_alumno) 
                     THEN 'OK' ELSE 'Falta' END AS documentos
            FROM alumnos a
            INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
            LEFT JOIN datos_salud ds ON a.id_alumno = ds.id_alumno
            LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
            LEFT JOIN datos_socioeconomicos dse ON a.id_alumno = dse.id_alumno
            WHERE (ds.id_datos_salud IS NULL 
               OR da.id_datos_academicos IS NULL 
               OR dse.id_datos_socioeconomicos IS NULL
               OR NOT EXISTS (SELECT 1 FROM familiares f WHERE f.id_alumno = a.id_alumno)
               OR NOT EXISTS (SELECT 1 FROM documentos doc WHERE doc.id_alumno = a.id_alumno))
            ${whereClause}
            ORDER BY a.nombre_completo
        `;
        
        const [alumnos] = await pool.execute(query, params);
        
        const pdfGen = new PDFGenerator();
        const doc = pdfGen.createDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Expedientes_Incompletos.pdf"');
        
        doc.pipe(res);
        
        pdfGen.addHeader('EXPEDIENTES INCOMPLETOS');
        
        const tableData = {
            headers: ['Matrícula', 'Nombre', 'Licenciatura', 'Salud', 'Acad.', 'Socioec.', 'Fam.', 'Docs'],
            rows: alumnos.map(a => [
                a.matricula,
                a.nombre_completo,
                a.nombre_licenciatura,
                a.salud,
                a.academicos,
                a.socioeconomicos,
                a.familiares,
                a.documentos
            ])
        };
        
        pdfGen.addTable(tableData.headers, tableData.rows);
        pdfGen.finalize();
        
    } catch (error) {
        console.error('Error en generarExpedientesIncompletosPDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                message: 'Error al generar reporte' 
            });
        }
    }
};

/**
 * Determinar si la consulta incluye campos de prácticas profesionales
 */
const incluyeCamposPracticas = (camposArray) => {
    const camposPracticas = [
        'practica_periodo',
        'practica_nombre_escuela',
        'practica_cct',
        'practica_direccion',
        'practica_fecha_inicio',
        'practica_fecha_fin',
        'practica_horas',
        'practica_nivel_educativo',
        'practica_situacion'
    ];
    
    return camposArray.some(campo => camposPracticas.includes(campo));
};


// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Construir consulta dinámica según campos seleccionados
 * MODIFICADO: Ahora maneja relaciones 1:N con prácticas profesionales
 */
const construirConsultaDinamica = (camposArray) => {
    const selectFields = [];
    const tablesUsed = new Set(['alumnos', 'licenciaturas']);
    
    // Verificar si se incluyen campos de prácticas
    const tienePracticas = incluyeCamposPracticas(camposArray);
    
    // Construir SELECT
    camposArray.forEach(campo => {
        if (camposDisponibles[campo]) {
            selectFields.push(`${camposDisponibles[campo]} AS ${campo}`);
            
            // Detectar tablas necesarias
            if (campo.includes('salud') || campo.includes('sangre') || campo.includes('seguro') || campo.includes('alergia') || campo.includes('enfermedad')) {
                tablesUsed.add('datos_salud');
            }
            if (campo.includes('academicos') || campo.includes('escuela_procedencia') || campo.includes('promedio_media') || campo.includes('certificado')) {
                tablesUsed.add('datos_academicos');
            }
            if (campo.includes('socioeconomicos') || campo.includes('recursos') || campo.includes('trabajo') || campo.includes('depende') || campo.includes('renta')) {
                tablesUsed.add('datos_socioeconomicos');
            }
            if (campo.includes('domicilio') || campo.includes('municipio') || campo.includes('estado') || campo.includes('calle') || campo.includes('colonia')) {
                tablesUsed.add('domicilio');
            }
        }
    });
    
    // Si no se seleccionó nada, incluir campos básicos
    if (selectFields.length === 0) {
        selectFields.push(
            'a.matricula AS matricula',
            'a.nombre_completo AS nombre_completo',
            'l.nombre_licenciatura AS nombre_licenciatura'
        );
    }
    
    // Agregar id_alumno siempre (necesario para agrupación)
    selectFields.unshift('a.id_alumno');
    
    // CORRECCIÓN: NO incluir SELECT aquí (se agrega en las funciones que lo usan)
    const selectClause = selectFields.join(', ');
    
    // Construir JOINS
    let joinClause = 'INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura';
    
    // Si se incluyen campos de prácticas, hacer LEFT JOIN con la tabla
    if (tienePracticas) {
        tablesUsed.add('practicas_profesionales');
        joinClause += ' LEFT JOIN practicas_profesionales pp ON pp.id_alumno = a.id_alumno';
    }
    
    if (tablesUsed.has('datos_salud')) {
        joinClause += ' LEFT JOIN datos_salud ds ON a.id_alumno = ds.id_alumno';
    }
    if (tablesUsed.has('datos_academicos')) {
        joinClause += ' LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno';
    }
    if (tablesUsed.has('datos_socioeconomicos')) {
        joinClause += ' LEFT JOIN datos_socioeconomicos dse ON a.id_alumno = dse.id_alumno';
    }
    if (tablesUsed.has('domicilio')) {
        joinClause += ' LEFT JOIN (SELECT id_alumno, calle, numero, colonia, municipio, estado FROM alumnos) d ON a.id_alumno = d.id_alumno';
    }
    
    return { selectClause, joinClause, tienePracticas };
};


function obtenerHeadersLegibles(camposArray) {
    const labels = {
        // Básicos
        matricula: 'Matrícula',
        nombre_completo: 'Nombre Completo',
        curp: 'CURP',
        fecha_nacimiento: 'Fecha de Nacimiento',
        edad: 'Edad',
        correo_institucional: 'Correo Institucional',
        correo_personal: 'Correo Personal',
        celular: 'Celular',
        telefono_emergencia: 'Teléfono Emergencia',
        estado_civil: 'Estado Civil',
        
        // Académicos
        nombre_licenciatura: 'Licenciatura',
        semestre_actual: 'Semestre',
        generacion: 'Generación',
        status_alumno: 'Status',
        promedio_general: 'Promedio',
        situacion_academica: 'Situación Académica',
        escuela_procedencia: 'Escuela de Procedencia',
        promedio_media_superior: 'Promedio Nivel Medio',
        
        // Salud
        tipo_sangre: 'Tipo de Sangre',
        afiliacion_seguro_medico: 'Afiliación Seguro',
        numero_seguro_social: 'NSS',
        alergias: 'Alergias',
        tiene_enfermedad: 'Tiene Enfermedad',
        nombre_enfermedad: 'Enfermedad',
        
        //  SOCIOECONÓMICOS CORREGIDOS
        recursos_economicos: 'Recursos Económicos',
        dependencia_economica: 'Dependencia Económica',
        alguien_depende_ti: 'Alguien Depende de Ti',
        trabaja: 'Trabaja',
        lugar_trabajo: 'Lugar de Trabajo',
        horario_trabajo: 'Horario de Trabajo',
        renta_fuera_domicilio: 'Renta Fuera de Domicilio',
        
        // Becas
        recibe_beca: 'Recibe Beca',
        nombre_beca: 'Nombre de Beca',
        
        // Prácticas
        total_practicas: 'Total Prácticas',
        horas_practicas: 'Horas Prácticas',
        promedio_practicas: 'Promedio Prácticas',
        
        // Incidentes
        total_incidentes: 'Total Incidentes',
        incidentes_activos: 'Incidentes Activos'
    };
    
    return camposArray.map(campo => ({
        key: campo,
        label: labels[campo] || campo
    }));
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX');
}


// ============================================
// FUNCIÓN AUXILIAR: OBTENER LABEL DE CAMPO
// ============================================

function obtenerLabelCampo(campoId) {
    const labels = {
        // Básicos
        matricula: { label: 'Matrícula', categoria: 'basicos' },
        nombre_completo: { label: 'Nombre Completo', categoria: 'basicos' },
        curp: { label: 'CURP', categoria: 'basicos' },
        fecha_nacimiento: { label: 'Fecha Nacimiento', categoria: 'basicos' },
        edad: { label: 'Edad', categoria: 'basicos' },
        correo_institucional: { label: 'Correo Institucional', categoria: 'basicos' },
        correo_personal: { label: 'Correo Personal', categoria: 'basicos' },
        celular: { label: 'Celular', categoria: 'basicos' },
        telefono_emergencia: { label: 'Tel. Emergencia', categoria: 'basicos' },
        estado_civil: { label: 'Estado Civil', categoria: 'basicos' },
        domicilio_completo: { label: 'Domicilio Completo', categoria: 'basicos' },
        municipio: { label: 'Municipio', categoria: 'basicos' },
        estado: { label: 'Estado', categoria: 'basicos' },
        
        // Académicos
        nombre_licenciatura: { label: 'Licenciatura', categoria: 'academicos' },
        semestre_actual: { label: 'Semestre', categoria: 'academicos' },
        generacion: { label: 'Generación', categoria: 'academicos' },
        status_alumno: { label: 'Status', categoria: 'academicos' },
        promedio_general: { label: 'Promedio', categoria: 'academicos' },
        situacion_academica: { label: 'Situación Académica', categoria: 'academicos' },
        escuela_procedencia: { label: 'Escuela Procedencia', categoria: 'academicos' },
        promedio_media_superior: { label: 'Promedio Nivel Medio', categoria: 'academicos' },
        
        // Salud
        tipo_sangre: { label: 'Tipo Sangre', categoria: 'salud' },
        afiliacion_seguro_medico: { label: 'Seguro Médico', categoria: 'salud' },
        numero_seguro_social: { label: 'NSS', categoria: 'salud' },
        alergias: { label: 'Alergias', categoria: 'salud' },
        tiene_enfermedad: { label: '¿Tiene Enfermedad?', categoria: 'salud' },
        nombre_enfermedad: { label: 'Enfermedad', categoria: 'salud' },
        
        // Socioeconómicos
        recursos_economicos: { label: 'Recursos Económicos', categoria: 'socioeconomicos' },
        dependencia_economica: { label: 'Dependencia Económica', categoria: 'socioeconomicos' },
        alguien_depende_ti: { label: '¿Alguien depende?', categoria: 'socioeconomicos' },
        trabaja: { label: '¿Trabaja?', categoria: 'socioeconomicos' },
        lugar_trabajo: { label: 'Lugar Trabajo', categoria: 'socioeconomicos' },
        horario_trabajo: { label: 'Horario Trabajo', categoria: 'socioeconomicos' },
        renta_fuera_domicilio: { label: '¿Renta?', categoria: 'socioeconomicos' },
        
        // Prácticas
        total_practicas: { label: 'Total Prácticas', categoria: 'practicas' },
        practica_actual_escuela: { label: 'Escuela Práctica', categoria: 'practicas' },
        practica_actual_cct: { label: 'CCT Práctica', categoria: 'practicas' },
        practica_actual_nivel: { label: 'Nivel Práctica', categoria: 'practicas' },
        practica_actual_situacion: { label: 'Situación Práctica', categoria: 'practicas' },
        horas_practicas_total: { label: 'Horas Prácticas', categoria: 'practicas' },
        
        // Incidentes
        total_incidentes: { label: 'Total Incidentes', categoria: 'incidentes' },
        incidentes_abiertos: { label: 'Incidentes Abiertos', categoria: 'incidentes' }
    };
    
    return labels[campoId] || { label: campoId, categoria: 'otros' };
}



// ============================================
// FUNCIÓN AUXILIAR: Obtener licenciaturas del docente
// ============================================
const obtenerLicenciaturasDocente = async (id_usuario) => {
    try {
        const [docentes] = await pool.execute(
            'SELECT id_docente FROM docentes WHERE id_usuario = ?',
            [id_usuario]
        );
        
        if (docentes.length === 0) {
            return [];
        }
        
        const [licenciaturas] = await pool.execute(
            'SELECT id_licenciatura FROM docente_licenciatura WHERE id_docente = ?',
            [docentes[0].id_docente]
        );
        
        return licenciaturas.map(l => l.id_licenciatura);
    } catch (error) {
        console.error('Error al obtener licenciaturas del docente:', error);
        return [];
    }
};


// ============================================
// FUNCIÓN AUXILIAR: Construir WHERE para licenciaturas
// ============================================
const construirFiltroLicenciaturas = async (req) => {
    let whereClause = '';
    const params = [];
    
    if (req.user.nombre_rol === 'Docente') {
        const licenciaturasDocente = await obtenerLicenciaturasDocente(req.user.id_usuario);
        
        if (licenciaturasDocente.length > 0) {
            const placeholders = licenciaturasDocente.map(() => '?').join(',');
            whereClause = ` AND a.id_licenciatura IN (${placeholders})`;
            params.push(...licenciaturasDocente);
        } else {
            whereClause = ' AND 1=0'; // No mostrar nada si no tiene licenciaturas
        }
    }
    // Si es Administrador, no agrega filtro (muestra todas)
    
    return { whereClause, params };
};


// ============================================
// EXPORTAR CONTROLADOR COMPLETO
// ============================================
module.exports = {
    // Funciones antiguas (mantener)
    procesarResultados,
    generarExpedientePDF,
    generarListaAlumnosExcel,
    generarListaAlumnosPDF,
    generarEstadisticasPDF,
    
    // Funciones nuevas (reportes personalizados)
    generarVistaPrevia,
    generarPersonalizadoExcel,
    generarPersonalizadoPDF,
    generarListaCompletaExcel,
    generarListaCompletaPDF,
    generarAlumnosRiesgoExcel,
    generarAlumnosRiesgoPDF,
    generarExpedientesIncompletosExcel,
    generarExpedientesIncompletosPDF
};