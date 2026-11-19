-- ============================================================
-- ESTRUCTURA LIMPIA DE LA BASE DE DATOS
-- Sistema de Gestión de Expedientes Estudiantiles
--
-- Contiene tablas, vistas, funciones y procedimientos, más los
-- catálogos mínimos para que el sistema funcione (roles, permisos,
-- rol_permiso, licenciaturas y un plantel de ejemplo).
-- No contiene datos de personas.
-- Compatible con MariaDB 11.x
-- ============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando estructura de base de datos para expedientes_estudiantiles
CREATE DATABASE IF NOT EXISTS `expedientes_estudiantiles` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `expedientes_estudiantiles`;

-- Volcando estructura para tabla expedientes_estudiantiles.alumnos
CREATE TABLE IF NOT EXISTS `alumnos` (
  `id_alumno` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_licenciatura` int(11) NOT NULL,
  `id_domicilio` int(11) DEFAULT NULL,
  `municipio_nacimiento` varchar(100) DEFAULT NULL,
  `estado_nacimiento` varchar(100) DEFAULT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `curp` varchar(18) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `correo_institucional` varchar(100) DEFAULT NULL,
  `correo_personal` varchar(100) DEFAULT NULL,
  `celular` varchar(15) DEFAULT NULL,
  `telefono_emergencia` varchar(15) DEFAULT NULL,
  `representativo_indigena` tinyint(1) DEFAULT 0,
  `habla_lengua_indigena` tinyint(1) DEFAULT 0,
  `lengua_indigena` varchar(50) DEFAULT NULL,
  `estado_civil` varchar(20) DEFAULT NULL,
  `tiene_hijos` tinyint(1) DEFAULT 0,
  `numero_hijos` int(11) DEFAULT 0,
  `edad_hijos` varchar(100) DEFAULT NULL,
  `embarazada` tinyint(1) DEFAULT 0,
  `meses_embarazo` int(11) DEFAULT NULL,
  `situacion_personal` text DEFAULT NULL,
  `semestre_actual` int(11) DEFAULT NULL,
  `generacion` int(11) NOT NULL DEFAULT 0,
  `fecha_ingreso` date DEFAULT NULL,
  `status_alumno` enum('Activo','Egresado','Baja temporal','Baja definitiva') DEFAULT 'Activo',
  `matricula` varchar(20) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_alumno`),
  UNIQUE KEY `curp` (`curp`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `correo_institucional` (`correo_institucional`),
  UNIQUE KEY `correo_personal` (`correo_personal`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_domicilio` (`id_domicilio`),
  KEY `idx_alumno_licenciatura` (`id_licenciatura`),
  KEY `idx_alumno_curp` (`curp`),
  KEY `idx_alumno_matricula` (`matricula`),
  KEY `idx_alumno_nombre` (`nombre_completo`),
  KEY `idx_alumno_generacion` (`generacion`),
  KEY `idx_alumno_licenciatura_generacion` (`id_licenciatura`,`generacion`),
  KEY `idx_alumno_status` (`status_alumno`),
  KEY `idx_generacion_status` (`generacion`,`status_alumno`),
  KEY `idx_licenciatura_generacion_status` (`id_licenciatura`,`generacion`,`status_alumno`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `alumnos_ibfk_2` FOREIGN KEY (`id_licenciatura`) REFERENCES `licenciaturas` (`id_licenciatura`),
  CONSTRAINT `alumnos_ibfk_3` FOREIGN KEY (`id_domicilio`) REFERENCES `domicilios` (`id_domicilio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.alumno_habilidad
CREATE TABLE IF NOT EXISTS `alumno_habilidad` (
  `id_alumno_habilidad` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `nombre_habilidad` varchar(100) NOT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `actitud_habilidad` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_alumno_habilidad`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `alumno_habilidad_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.becas
CREATE TABLE IF NOT EXISTS `becas` (
  `id_beca` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `nombre_beca` varchar(100) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_beca`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `becas_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.certificaciones
CREATE TABLE IF NOT EXISTS `certificaciones` (
  `id_certificacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `nombre_certificacion` varchar(100) NOT NULL,
  `fecha_obtencion` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `institucion_emisora` varchar(100) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_certificacion`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `certificaciones_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.completitud_expediente
CREATE TABLE IF NOT EXISTS `completitud_expediente` (
  `id_completitud` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `completitud_datos_personales` decimal(5,2) DEFAULT 0.00 COMMENT 'Campos básicos: CURP, fecha nac, correos, teléfonos, domicilio',
  `completitud_datos_salud` decimal(5,2) DEFAULT 0.00 COMMENT 'Información médica y de salud',
  `completitud_datos_academicos` decimal(5,2) DEFAULT 0.00 COMMENT 'Rendimiento académico y situación',
  `completitud_datos_socioeconomicos` decimal(5,2) DEFAULT 0.00 COMMENT 'Situación socioeconómica familiar',
  `completitud_familiares` decimal(5,2) DEFAULT 0.00 COMMENT 'Datos de familiares (mínimo 1, ideal 2+)',
  `completitud_documentos` decimal(5,2) DEFAULT 0.00 COMMENT 'Documentos oficiales (mínimo 3, ideal 5+)',
  `completitud_habilidades` decimal(5,2) DEFAULT 0.00 COMMENT 'Habilidades y competencias (mínimo 2, ideal 3+)',
  `completitud_practicas` decimal(5,2) DEFAULT NULL COMMENT 'Prácticas profesionales (opcional)',
  `completitud_certificaciones` decimal(5,2) DEFAULT NULL COMMENT 'Certificaciones adicionales (opcional)',
  `completitud_movilidad` decimal(5,2) DEFAULT NULL COMMENT 'Movilidad académica (opcional)',
  `completitud_becas` decimal(5,2) DEFAULT NULL COMMENT 'Becas obtenidas (opcional)',
  `porcentaje_total` decimal(5,2) DEFAULT 0.00 COMMENT 'Promedio de las 7 secciones obligatorias',
  `nivel_completitud` enum('Vacío','Iniciado','En Progreso','Casi Completo','Completo') DEFAULT 'Vacío' COMMENT 'Clasificación del nivel de completitud',
  `campos_faltantes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detalle JSON de qué campos específicos faltan' CHECK (json_valid(`campos_faltantes`)),
  `fecha_calculo` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Última vez que se calculó la completitud',
  PRIMARY KEY (`id_completitud`),
  UNIQUE KEY `id_alumno` (`id_alumno`),
  KEY `idx_nivel` (`nivel_completitud`),
  KEY `idx_porcentaje` (`porcentaje_total`),
  KEY `idx_fecha` (`fecha_calculo`),
  CONSTRAINT `completitud_expediente_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracking detallado de completitud de expedientes por alumno';

-- Volcando estructura para tabla expedientes_estudiantiles.datos_academicos
CREATE TABLE IF NOT EXISTS `datos_academicos` (
  `id_datos_academicos` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `escuela_procedencia` varchar(100) DEFAULT NULL,
  `promedio_media_superior` decimal(4,2) DEFAULT NULL,
  `situacion_academica` varchar(100) DEFAULT NULL,
  `cursos_irregulares` text DEFAULT NULL,
  `curso_mayor_dificultad` varchar(100) DEFAULT NULL,
  `motivo_dificultad` text DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_datos_academicos`),
  UNIQUE KEY `unique_alumno_academico` (`id_alumno`),
  CONSTRAINT `datos_academicos_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.datos_salud
CREATE TABLE IF NOT EXISTS `datos_salud` (
  `id_datos_salud` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `tipo_sangre` varchar(5) DEFAULT NULL,
  `afiliacion_seguro_medico` varchar(100) DEFAULT NULL,
  `numero_seguro_social` varchar(11) DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `tiene_enfermedad` tinyint(1) DEFAULT 0,
  `nombre_enfermedad` varchar(100) DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_datos_salud`),
  UNIQUE KEY `unique_alumno_salud` (`id_alumno`),
  KEY `idx_nss` (`numero_seguro_social`),
  CONSTRAINT `datos_salud_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.datos_socioeconomicos
CREATE TABLE IF NOT EXISTS `datos_socioeconomicos` (
  `id_datos_socioeconomicos` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `recursos_economicos` varchar(255) DEFAULT NULL,
  `dependencia_economica` varchar(255) DEFAULT NULL,
  `alguien_depende_ti` tinyint(1) DEFAULT 0,
  `trabaja` tinyint(1) DEFAULT 0,
  `lugar_trabajo` varchar(255) DEFAULT NULL,
  `horario_trabajo` varchar(100) DEFAULT NULL,
  `renta_fuera_domicilio` tinyint(1) DEFAULT 0,
  `id_domicilio_renta` int(11) DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_datos_socioeconomicos`),
  UNIQUE KEY `unique_alumno_socioeconomico` (`id_alumno`),
  KEY `id_domicilio_renta` (`id_domicilio_renta`),
  CONSTRAINT `datos_socioeconomicos_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE,
  CONSTRAINT `datos_socioeconomicos_ibfk_2` FOREIGN KEY (`id_domicilio_renta`) REFERENCES `domicilios` (`id_domicilio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.desempeno_academico
CREATE TABLE IF NOT EXISTS `desempeno_academico` (
  `id_desempeno_academico` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `club_inscrito` varchar(100) DEFAULT NULL,
  `eventos_participados` text DEFAULT NULL,
  `participo_como_ponente` tinyint(1) DEFAULT 0,
  `interes_intercambio` text DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_desempeno_academico`),
  UNIQUE KEY `unique_alumno_desempeno` (`id_alumno`),
  CONSTRAINT `desempeno_academico_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.docentes
CREATE TABLE IF NOT EXISTS `docentes` (
  `id_docente` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_plantel` int(11) DEFAULT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `area_asignada` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_docente`),
  UNIQUE KEY `unique_usuario_docente` (`id_usuario`),
  KEY `id_plantel` (`id_plantel`),
  CONSTRAINT `docentes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `docentes_ibfk_2` FOREIGN KEY (`id_plantel`) REFERENCES `planteles` (`id_plantel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.docente_licenciatura
CREATE TABLE IF NOT EXISTS `docente_licenciatura` (
  `id_docente_licenciatura` int(11) NOT NULL AUTO_INCREMENT,
  `id_docente` int(11) NOT NULL,
  `id_licenciatura` int(11) NOT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_docente_licenciatura`),
  UNIQUE KEY `unique_docente_licenciatura` (`id_docente`,`id_licenciatura`),
  KEY `id_licenciatura` (`id_licenciatura`),
  CONSTRAINT `docente_licenciatura_ibfk_1` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`) ON DELETE CASCADE,
  CONSTRAINT `docente_licenciatura_ibfk_2` FOREIGN KEY (`id_licenciatura`) REFERENCES `licenciaturas` (`id_licenciatura`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.documentos
CREATE TABLE IF NOT EXISTS `documentos` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `tipo_documento` varchar(100) DEFAULT NULL,
  `nombre_archivo` varchar(100) NOT NULL,
  `tipo_mime` varchar(50) DEFAULT NULL,
  `ruta_archivo` varchar(255) DEFAULT NULL,
  `tamano_mb` decimal(10,2) DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT current_timestamp(),
  `subido_por` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  KEY `subido_por` (`subido_por`),
  KEY `idx_documento_alumno` (`id_alumno`),
  KEY `idx_documento_fecha` (`fecha_subida`),
  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE,
  CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.domicilios
CREATE TABLE IF NOT EXISTS `domicilios` (
  `id_domicilio` int(11) NOT NULL AUTO_INCREMENT,
  `calle` varchar(100) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `colonia` varchar(100) NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_domicilio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.familiares
CREATE TABLE IF NOT EXISTS `familiares` (
  `id_familiar` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `tipo_familiar` varchar(50) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `es_tutor` tinyint(1) DEFAULT 0,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_familiar`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `familiares_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para función expedientes_estudiantiles.fn_calcular_edad
DELIMITER //
CREATE FUNCTION `fn_calcular_edad`(p_fecha_nacimiento DATE) RETURNS int(11)
    DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_fecha_nacimiento, CURDATE());
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_es_alumno_regular
DELIMITER //
CREATE FUNCTION `fn_es_alumno_regular`(p_id_alumno INT) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
    DECLARE v_situacion VARCHAR(100);
    DECLARE v_promedio DECIMAL(4,2);
    
    SELECT situacion_academica INTO v_situacion
    FROM datos_academicos
    WHERE id_alumno = p_id_alumno;
    
    SET v_promedio = fn_promedio_general(p_id_alumno);
    
    RETURN (v_situacion = 'Regular' AND v_promedio >= 7.0);
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_expediente_completo
DELIMITER //
CREATE FUNCTION `fn_expediente_completo`(p_id_alumno INT) RETURNS varchar(20) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    READS SQL DATA
BEGIN
    DECLARE v_tiene_salud INT;
    DECLARE v_tiene_academico INT;
    DECLARE v_tiene_socioeconomico INT;
    DECLARE v_tiene_practicas INT;
    DECLARE v_tiene_documentos INT;
    DECLARE v_tiene_familiares INT;
    
    SELECT COUNT(*) INTO v_tiene_salud 
    FROM datos_salud WHERE id_alumno = p_id_alumno;
    
    SELECT COUNT(*) INTO v_tiene_academico 
    FROM datos_academicos WHERE id_alumno = p_id_alumno;
    
    SELECT COUNT(*) INTO v_tiene_socioeconomico 
    FROM datos_socioeconomicos WHERE id_alumno = p_id_alumno;
    
    SELECT COUNT(*) INTO v_tiene_practicas 
    FROM practicas_profesionales WHERE id_alumno = p_id_alumno;
    
    SELECT COUNT(*) INTO v_tiene_documentos 
    FROM documentos WHERE id_alumno = p_id_alumno;
    
    SELECT COUNT(*) INTO v_tiene_familiares 
    FROM familiares WHERE id_alumno = p_id_alumno;
    
    IF v_tiene_salud > 0 AND v_tiene_academico > 0 AND 
       v_tiene_socioeconomico > 0 AND v_tiene_practicas > 0 AND
       v_tiene_documentos > 0 AND v_tiene_familiares > 0 THEN
        RETURN 'COMPLETO';
    ELSE
        RETURN 'INCOMPLETO';
    END IF;
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_generar_matricula
DELIMITER //
CREATE FUNCTION `fn_generar_matricula`(p_id_licenciatura INT, p_anio INT) RETURNS varchar(20) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    READS SQL DATA
BEGIN
    DECLARE v_consecutivo INT;
    DECLARE v_codigo_licenciatura VARCHAR(3);
    
    -- Códigos por licenciatura
    SET v_codigo_licenciatura = CASE p_id_licenciatura
        WHEN 1 THEN 'EPR' -- Educación Preescolar
        WHEN 2 THEN 'EPI' -- Educación Preescolar Intercultural
        WHEN 3 THEN 'EPM' -- Educación Primaria
        WHEN 4 THEN 'EAE' -- Enseñanza y Aprendizaje del Español
        ELSE 'GEN'
    END;
    
    -- Obtener el último consecutivo
    SELECT COUNT(*) + 1
    INTO v_consecutivo
    FROM alumnos
    WHERE id_licenciatura = p_id_licenciatura
    AND YEAR(fecha_registro) = p_anio;
    
    RETURN CONCAT(p_anio, v_codigo_licenciatura, LPAD(v_consecutivo, 4, '0'));
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_incidentes_activos
DELIMITER //
CREATE FUNCTION `fn_incidentes_activos`(p_id_alumno INT) RETURNS int(11)
    READS SQL DATA
BEGIN
    DECLARE v_total INT;
    
    SELECT COUNT(*) 
    INTO v_total
    FROM incidentes
    WHERE id_alumno = p_id_alumno 
    AND estado_incidente = 'Abierto';
    
    RETURN v_total;
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_porcentaje_completitud
DELIMITER //
CREATE FUNCTION `fn_porcentaje_completitud`(p_id_alumno INT) RETURNS decimal(5,2)
    READS SQL DATA
BEGIN
    DECLARE v_total_secciones INT DEFAULT 6;
    DECLARE v_secciones_completas INT DEFAULT 0;
    
    IF EXISTS(SELECT 1 FROM datos_salud WHERE id_alumno = p_id_alumno) THEN
        SET v_secciones_completas = v_secciones_completas + 1;
    END IF;
    
    IF EXISTS(SELECT 1 FROM datos_academicos WHERE id_alumno = p_id_alumno) THEN
        SET v_secciones_completas = v_secciones_completas + 1;
    END IF;
    
    IF EXISTS(SELECT 1 FROM datos_socioeconomicos WHERE id_alumno = p_id_alumno) THEN
        SET v_secciones_completas = v_secciones_completas + 1;
    END IF;
    
    IF EXISTS(SELECT 1 FROM practicas_profesionales WHERE id_alumno = p_id_alumno) THEN
        SET v_secciones_completas = v_secciones_completas + 1;
    END IF;
    
    IF EXISTS(SELECT 1 FROM documentos WHERE id_alumno = p_id_alumno) THEN
        SET v_secciones_completas = v_secciones_completas + 1;
    END IF;
    
    IF EXISTS(SELECT 1 FROM familiares WHERE id_alumno = p_id_alumno) THEN
        SET v_secciones_completas = v_secciones_completas + 1;
    END IF;
    
    RETURN (v_secciones_completas / v_total_secciones) * 100;
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_promedio_general
DELIMITER //
CREATE FUNCTION `fn_promedio_general`(p_id_alumno INT) RETURNS decimal(4,2)
    READS SQL DATA
BEGIN
    DECLARE v_promedio DECIMAL(4,2);
    
    SELECT AVG(promedio) 
    INTO v_promedio
    FROM semestre_promedio
    WHERE id_alumno = p_id_alumno;
    
    RETURN IFNULL(v_promedio, 0.00);
END//
DELIMITER ;

-- Volcando estructura para función expedientes_estudiantiles.fn_total_documentos
DELIMITER //
CREATE FUNCTION `fn_total_documentos`(p_id_alumno INT) RETURNS int(11)
    READS SQL DATA
BEGIN
    DECLARE v_total INT;
    
    SELECT COUNT(*) 
    INTO v_total
    FROM documentos
    WHERE id_alumno = p_id_alumno;
    
    RETURN v_total;
END//
DELIMITER ;

-- Volcando estructura para tabla expedientes_estudiantiles.historial_cambios
CREATE TABLE IF NOT EXISTS `historial_cambios` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `tabla_afectada` varchar(100) NOT NULL,
  `id_registro_afectado` int(11) NOT NULL,
  `tipo_operacion` varchar(50) NOT NULL,
  `datos_anteriores` text DEFAULT NULL,
  `datos_nuevos` text DEFAULT NULL,
  `fecha_cambio` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_historial`),
  KEY `idx_historial_usuario` (`id_usuario`),
  KEY `idx_historial_tabla` (`tabla_afectada`),
  KEY `idx_historial_fecha` (`fecha_cambio`),
  CONSTRAINT `historial_cambios_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.incidentes
CREATE TABLE IF NOT EXISTS `incidentes` (
  `id_incidente` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `id_docente` int(11) DEFAULT NULL,
  `tipo_incidente` varchar(100) DEFAULT NULL,
  `fecha_incidente` date NOT NULL,
  `descripcion` text NOT NULL,
  `estado_incidente` varchar(50) DEFAULT 'Abierto',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_incidente`),
  KEY `idx_incidente_alumno` (`id_alumno`),
  KEY `idx_incidente_docente` (`id_docente`),
  KEY `idx_incidente_fecha` (`fecha_incidente`),
  KEY `idx_incidente_estado` (`estado_incidente`),
  CONSTRAINT `incidentes_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE,
  CONSTRAINT `incidentes_ibfk_2` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.licenciaturas
CREATE TABLE IF NOT EXISTS `licenciaturas` (
  `id_licenciatura` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_licenciatura` varchar(100) NOT NULL,
  `numero_semestres` int(11) NOT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_licenciatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales del catálogo licenciaturas
INSERT INTO `licenciaturas` (`id_licenciatura`, `nombre_licenciatura`, `numero_semestres`, `activa`, `fecha_creacion`) VALUES
	(1, 'Licenciatura en Educación Preescolar', 8, 1, '2025-10-02 18:49:45'),
	(2, 'Licenciatura en Educación Preescolar Intercultural', 8, 1, '2025-10-02 18:49:45'),
	(3, 'Licenciatura en Educación Primaria', 8, 1, '2025-10-02 18:49:45'),
	(4, 'Licenciatura en Enseñanza y Aprendizaje del Español', 8, 1, '2025-10-02 18:49:45');

-- Volcando estructura para tabla expedientes_estudiantiles.movilidad_academica
CREATE TABLE IF NOT EXISTS `movilidad_academica` (
  `id_movilidad` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `nombre_programa` varchar(100) NOT NULL,
  `lugar` varchar(100) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `relato_experiencia` text DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_movilidad`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `movilidad_academica_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.permisos
CREATE TABLE IF NOT EXISTS `permisos` (
  `id_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_permiso` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `nombre_permiso` (`nombre_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales del catálogo permisos
INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`, `descripcion`, `fecha_creacion`) VALUES
	(1, 'VER_EXPEDIENTE', 'Permite ver expedientes estudiantiles', '2025-10-02 18:49:53'),
	(2, 'EDITAR_EXPEDIENTE', 'Permite editar expedientes estudiantiles', '2025-10-02 18:49:53'),
	(3, 'ELIMINAR_EXPEDIENTE', 'Permite eliminar expedientes estudiantiles', '2025-10-02 18:49:53'),
	(4, 'CREAR_EXPEDIENTE', 'Permite crear nuevos expedientes', '2025-10-02 18:49:53'),
	(5, 'VER_REPORTES', 'Permite ver y generar reportes', '2025-10-02 18:49:53'),
	(6, 'GESTIONAR_USUARIOS', 'Permite administrar usuarios del sistema', '2025-10-02 18:49:53'),
	(7, 'GESTIONAR_ROLES', 'Permite administrar roles y permisos', '2025-10-02 18:49:53'),
	(8, 'VER_HISTORIAL', 'Permite ver el historial de cambios', '2025-10-02 18:49:53');

-- Volcando estructura para tabla expedientes_estudiantiles.permisos_invitado
CREATE TABLE IF NOT EXISTS `permisos_invitado` (
  `id_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `licenciaturas_permitidas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de IDs de licenciaturas permitidas' CHECK (json_valid(`licenciaturas_permitidas`)),
  `secciones_permitidas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array de nombres de secciones permitidas (NULL = sin control de secciones aún)' CHECK (json_valid(`secciones_permitidas`)),
  `fecha_asignacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `unique_usuario` (`id_usuario`),
  KEY `idx_licenciaturas` (`licenciaturas_permitidas`(255)),
  KEY `idx_usuario` (`id_usuario`),
  CONSTRAINT `permisos_invitado_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para tabla expedientes_estudiantiles.planteles
CREATE TABLE IF NOT EXISTS `planteles` (
  `id_plantel` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_plantel` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_plantel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plantel de ejemplo (cámbialo por los datos de tu institución)
INSERT INTO `planteles` (`id_plantel`, `nombre_plantel`, `telefono`, `correo`, `fecha_creacion`) VALUES
	(1, 'Escuela de ejemplo', '0000000000', 'contacto@example.com', CURRENT_TIMESTAMP);

-- Volcando estructura para tabla expedientes_estudiantiles.practicas_profesionales
CREATE TABLE IF NOT EXISTS `practicas_profesionales` (
  `id_practica` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `periodo_escolar` varchar(20) NOT NULL COMMENT 'Formato: 2024-A, 2024-B, 2025-A',
  `semestre_cursado` int(11) NOT NULL COMMENT 'Semestre que cursaba el alumno',
  `nombre_escuela` varchar(200) NOT NULL COMMENT 'Nombre completo de la escuela',
  `cct_escuela` varchar(15) NOT NULL COMMENT 'Clave de Centro de Trabajo',
  `nivel_educativo` enum('Preescolar','Primaria','Secundaria','Otro') NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `horas_totales` int(11) DEFAULT NULL COMMENT 'Horas totales de práctica',
  `habilidades_desarrolladas` text DEFAULT NULL COMMENT 'Habilidades desarrolladas durante la práctica',
  `calificacion_obtenida` decimal(4,2) DEFAULT NULL COMMENT 'Calificación de 0 a 10',
  `sigue_orientacion_reglamento` tinyint(1) DEFAULT 1,
  `tutor_asignado` varchar(100) DEFAULT NULL COMMENT 'Nombre del tutor en la escuela',
  `tiene_incidentes` tinyint(1) DEFAULT 0,
  `relato_incidentes` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `situacion` enum('En curso','Completada','Cancelada') DEFAULT 'En curso',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_practica`),
  KEY `idx_alumno` (`id_alumno`),
  KEY `idx_periodo` (`periodo_escolar`),
  KEY `idx_cct` (`cct_escuela`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `practicas_profesionales_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Historial de prácticas profesionales por periodo escolar';

-- Volcando estructura para tabla expedientes_estudiantiles.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales del catálogo roles
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`, `fecha_creacion`) VALUES
	(1, 'Administrador', 'Acceso total al sistema', '2025-10-02 18:49:51'),
	(2, 'Docente', 'Acceso a expedientes de su área asignada', '2025-10-02 18:49:51'),
	(3, 'Alumno', 'Acceso limitado a su propio expediente', '2025-10-02 18:49:51'),
	(4, 'Invitado', 'Usuario con acceso de solo lectura a licenciaturas y secciones específicas', '2025-11-26 15:53:10');

-- Volcando estructura para tabla expedientes_estudiantiles.rol_permiso
CREATE TABLE IF NOT EXISTS `rol_permiso` (
  `id_rol_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_rol_permiso`),
  UNIQUE KEY `unique_rol_permiso` (`id_rol`,`id_permiso`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `rol_permiso_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `rol_permiso_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales del catálogo rol_permiso
INSERT INTO `rol_permiso` (`id_rol_permiso`, `id_rol`, `id_permiso`, `fecha_asignacion`) VALUES
	(3, 1, 3, '2025-10-02 18:50:03'),
	(4, 1, 7, '2025-10-02 18:50:03'),
	(5, 1, 6, '2025-10-02 18:50:03'),
	(6, 1, 1, '2025-10-02 18:50:03'),
	(7, 1, 8, '2025-10-02 18:50:03'),
	(8, 1, 5, '2025-10-02 18:50:03'),
	(16, 2, 1, '2025-10-02 18:50:06'),
	(17, 2, 2, '2025-10-02 18:50:06'),
	(18, 2, 4, '2025-10-02 18:50:06'),
	(19, 2, 5, '2025-10-02 18:50:06'),
	(20, 3, 1, '2025-10-02 18:50:12'),
	(21, 1, 4, '2025-10-10 18:17:20'),
	(23, 3, 2, '2025-10-10 19:24:20'),
	(25, 3, 4, '2025-10-10 19:24:27'),
	(26, 1, 2, '2025-10-12 19:50:34'),
	(29, 3, 3, '2025-10-21 17:56:04'),
	(30, 2, 3, '2025-10-21 19:38:48'),
	(31, 4, 1, '2025-11-26 22:05:00');

-- Volcando estructura para tabla expedientes_estudiantiles.semestre_promedio
CREATE TABLE IF NOT EXISTS `semestre_promedio` (
  `id_semestre_promedio` int(11) NOT NULL AUTO_INCREMENT,
  `id_alumno` int(11) NOT NULL,
  `numero_semestre` int(11) NOT NULL,
  `promedio` decimal(4,2) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_semestre_promedio`),
  UNIQUE KEY `unique_alumno_semestre` (`id_alumno`,`numero_semestre`),
  CONSTRAINT `semestre_promedio_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_alumnos_en_riesgo
DELIMITER //
CREATE PROCEDURE `sp_alumnos_en_riesgo`(IN p_id_licenciatura INT)
BEGIN
    SELECT 
        a.id_alumno,
        a.matricula,
        a.nombre_completo,
        a.semestre_actual,
        fn_promedio_general(a.id_alumno) AS promedio_general,
        da.situacion_academica,
        fn_incidentes_activos(a.id_alumno) AS incidentes_activos,
        CASE 
            WHEN fn_promedio_general(a.id_alumno) < 6.0 THEN 'CRÍTICO'
            WHEN fn_promedio_general(a.id_alumno) < 7.0 THEN 'ALTO'
            ELSE 'MEDIO'
        END AS nivel_riesgo
    FROM 
        alumnos a
        LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
    WHERE 
        a.id_licenciatura = p_id_licenciatura
        AND (
            fn_promedio_general(a.id_alumno) < 7.0
            OR da.situacion_academica = 'Irregular'
            OR fn_incidentes_activos(a.id_alumno) > 0
        )
    ORDER BY 
        fn_promedio_general(a.id_alumno) ASC;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_asignar_beca
DELIMITER //
CREATE PROCEDURE `sp_asignar_beca`(
    IN p_id_alumno INT,
    IN p_nombre_beca VARCHAR(100),
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE,
    OUT p_resultado VARCHAR(100)
)
BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    START TRANSACTION;
    
    -- Desactivar becas anteriores
    UPDATE becas
    SET activa = FALSE
    WHERE id_alumno = p_id_alumno AND activa = TRUE;
    
    -- Insertar nueva beca
    INSERT INTO becas (id_alumno, nombre_beca, fecha_inicio, fecha_fin, activa)
    VALUES (p_id_alumno, p_nombre_beca, p_fecha_inicio, p_fecha_fin, TRUE);
    
    IF v_error THEN
        ROLLBACK;
        SET p_resultado = 'ERROR: No se pudo asignar la beca';
    ELSE
        COMMIT;
        SET p_resultado = 'ÉXITO: Beca asignada correctamente';
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_avanzar_semestre_masivo
DELIMITER //
CREATE PROCEDURE `sp_avanzar_semestre_masivo`(
    IN p_id_licenciatura INT,
    OUT p_total_actualizados INT
)
BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    START TRANSACTION;
    
    UPDATE alumnos
    SET semestre_actual = semestre_actual + 1
    WHERE id_licenciatura = p_id_licenciatura
    AND semestre_actual < (
        SELECT numero_semestres 
        FROM licenciaturas 
        WHERE id_licenciatura = p_id_licenciatura
    );
    
    SET p_total_actualizados = ROW_COUNT();
    
    IF v_error THEN
        ROLLBACK;
        SET p_total_actualizados = 0;
    ELSE
        COMMIT;
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_calcular_completitud_expediente
DELIMITER //
CREATE PROCEDURE `sp_calcular_completitud_expediente`(IN p_id_alumno INT)
main_block: BEGIN
    -- Variables para cada sección
    DECLARE v_datos_personales DECIMAL(5,2);
    DECLARE v_datos_salud DECIMAL(5,2);
    DECLARE v_datos_academicos DECIMAL(5,2);
    DECLARE v_datos_socioeconomicos DECIMAL(5,2);
    DECLARE v_familiares DECIMAL(5,2);
    DECLARE v_documentos DECIMAL(5,2);
    DECLARE v_habilidades DECIMAL(5,2);
    DECLARE v_practicas DECIMAL(5,2);
    DECLARE v_certificaciones DECIMAL(5,2);
    DECLARE v_movilidad DECIMAL(5,2);
    DECLARE v_becas DECIMAL(5,2);
    DECLARE v_total DECIMAL(5,2);
    DECLARE v_nivel VARCHAR(50);
    

    SELECT (
        (CASE WHEN curp IS NOT NULL AND curp != '' THEN 12.5 ELSE 0 END) +
        (CASE WHEN fecha_nacimiento IS NOT NULL THEN 12.5 ELSE 0 END) +
        (CASE WHEN correo_institucional IS NOT NULL AND correo_institucional != '' THEN 12.5 ELSE 0 END) +
        (CASE WHEN celular IS NOT NULL AND celular != '' THEN 12.5 ELSE 0 END) +
        (CASE WHEN estado_civil IS NOT NULL AND estado_civil != '' THEN 12.5 ELSE 0 END) +
        (CASE WHEN id_domicilio IS NOT NULL THEN 12.5 ELSE 0 END) +
        (CASE WHEN correo_personal IS NOT NULL AND correo_personal != '' THEN 12.5 ELSE 0 END) +
        (CASE WHEN telefono_emergencia IS NOT NULL AND telefono_emergencia != '' THEN 12.5 ELSE 0 END)
    ) INTO v_datos_personales
    FROM alumnos WHERE id_alumno = p_id_alumno;
    
    -- Si el alumno no existe, salir
    IF v_datos_personales IS NULL THEN
        SELECT 'ERROR: Alumno no encontrado' AS mensaje;
        LEAVE main_block;
    END IF;
    
    -- 2. DATOS DE SALUD
    -- ==================================
    SET v_datos_salud = IF(
        EXISTS(SELECT 1 FROM datos_salud WHERE id_alumno = p_id_alumno),
        100,
        0
    );
    

    SET v_datos_academicos = IF(
        EXISTS(SELECT 1 FROM datos_academicos WHERE id_alumno = p_id_alumno),
        100,
        0
    );
    

    SET v_datos_socioeconomicos = IF(
        EXISTS(SELECT 1 FROM datos_socioeconomicos WHERE id_alumno = p_id_alumno),
        100,
        0
    );
    

    SELECT CASE 
        WHEN COUNT(*) >= 2 THEN 100
        WHEN COUNT(*) = 1 THEN 50
        ELSE 0
    END INTO v_familiares
    FROM familiares WHERE id_alumno = p_id_alumno;
    

    SELECT CASE 
        WHEN COUNT(*) >= 5 THEN 100
        WHEN COUNT(*) = 4 THEN 80
        WHEN COUNT(*) = 3 THEN 60
        WHEN COUNT(*) = 2 THEN 40
        WHEN COUNT(*) = 1 THEN 20
        ELSE 0
    END INTO v_documentos
    FROM documentos WHERE id_alumno = p_id_alumno;
    

    SELECT CASE 
        WHEN COUNT(*) >= 3 THEN 100
        WHEN COUNT(*) = 2 THEN 70
        WHEN COUNT(*) = 1 THEN 40
        ELSE 0
    END INTO v_habilidades
    FROM alumno_habilidad WHERE id_alumno = p_id_alumno;  -- ← CORREGIDO AQUÍ
    
    -- ==================================
    -- 8-11. SECCIONES OPCIONALES
    -- ==================================
    SET v_practicas = IF(
        EXISTS(SELECT 1 FROM practicas_profesionales WHERE id_alumno = p_id_alumno),
        100,
        NULL
    );
    
    SET v_certificaciones = IF(
        EXISTS(SELECT 1 FROM certificaciones WHERE id_alumno = p_id_alumno),
        100,
        NULL
    );
    
    SET v_movilidad = IF(
        EXISTS(SELECT 1 FROM movilidad_academica WHERE id_alumno = p_id_alumno),
        100,
        NULL
    );
    
    SET v_becas = IF(
        EXISTS(SELECT 1 FROM becas WHERE id_alumno = p_id_alumno),
        100,
        NULL
    );
    

    SET v_total = (
        v_datos_personales + 
        v_datos_salud + 
        v_datos_academicos + 
        v_datos_socioeconomicos + 
        v_familiares + 
        v_documentos + 
        v_habilidades
    ) / 7;
    

    SET v_nivel = CASE 
        WHEN v_total = 0 THEN 'Vacío'
        WHEN v_total < 25 THEN 'Iniciado'
        WHEN v_total < 60 THEN 'En Progreso'
        WHEN v_total < 100 THEN 'Casi Completo'
        ELSE 'Completo'
    END;
    

    INSERT INTO completitud_expediente (
        id_alumno,
        completitud_datos_personales,
        completitud_datos_salud,
        completitud_datos_academicos,
        completitud_datos_socioeconomicos,
        completitud_familiares,
        completitud_documentos,
        completitud_habilidades,
        completitud_practicas,
        completitud_certificaciones,
        completitud_movilidad,
        completitud_becas,
        porcentaje_total,
        nivel_completitud
    ) VALUES (
        p_id_alumno,
        v_datos_personales,
        v_datos_salud,
        v_datos_academicos,
        v_datos_socioeconomicos,
        v_familiares,
        v_documentos,
        v_habilidades,
        v_practicas,
        v_certificaciones,
        v_movilidad,
        v_becas,
        v_total,
        v_nivel
    ) ON DUPLICATE KEY UPDATE
        completitud_datos_personales = v_datos_personales,
        completitud_datos_salud = v_datos_salud,
        completitud_datos_academicos = v_datos_academicos,
        completitud_datos_socioeconomicos = v_datos_socioeconomicos,
        completitud_familiares = v_familiares,
        completitud_documentos = v_documentos,
        completitud_habilidades = v_habilidades,
        completitud_practicas = v_practicas,
        completitud_certificaciones = v_certificaciones,
        completitud_movilidad = v_movilidad,
        completitud_becas = v_becas,
        porcentaje_total = v_total,
        nivel_completitud = v_nivel;

    SELECT 
        a.id_alumno,
        a.matricula,
        a.nombre_completo,
        c.porcentaje_total,
        c.nivel_completitud,
        c.completitud_datos_personales,
        c.completitud_datos_salud,
        c.completitud_datos_academicos,
        c.completitud_datos_socioeconomicos,
        c.completitud_familiares,
        c.completitud_documentos,
        c.completitud_habilidades,
        c.completitud_practicas,
        c.completitud_certificaciones,
        c.completitud_movilidad,
        c.completitud_becas,
        c.fecha_calculo
    FROM alumnos a
    INNER JOIN completitud_expediente c ON a.id_alumno = c.id_alumno
    WHERE a.id_alumno = p_id_alumno;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_cambiar_status_alumno
DELIMITER //
CREATE PROCEDURE `sp_cambiar_status_alumno`(
    IN p_id_alumno INT,
    IN p_nuevo_status VARCHAR(50),
    IN p_id_usuario INT,
    OUT p_resultado VARCHAR(200)
)
BEGIN
    DECLARE v_status_anterior VARCHAR(50);
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    -- Validar que el status sea válido
    IF p_nuevo_status NOT IN ('Activo', 'Egresado', 'Baja temporal', 'Baja definitiva') THEN
        SET p_resultado = 'ERROR: Status no válido. Debe ser: Activo, Egresado, Baja temporal o Baja definitiva';
    ELSE
        START TRANSACTION;
        
        -- Obtener status anterior
        SELECT status_alumno INTO v_status_anterior
        FROM alumnos
        WHERE id_alumno = p_id_alumno;
        
        -- Actualizar status
        UPDATE alumnos
        SET status_alumno = p_nuevo_status
        WHERE id_alumno = p_id_alumno;
        
        -- Registrar en auditoría
        INSERT INTO historial_cambios (
            id_usuario,
            tabla_afectada,
            id_registro_afectado,
            tipo_operacion,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            p_id_usuario,
            'alumnos',
            p_id_alumno,
            'UPDATE',
            CONCAT('Status: ', v_status_anterior),
            CONCAT('Status: ', p_nuevo_status)
        );
        
        IF v_error THEN
            ROLLBACK;
            SET p_resultado = 'ERROR: No se pudo cambiar el status';
        ELSE
            COMMIT;
            SET p_resultado = CONCAT('ÉXITO: Status cambiado de "', v_status_anterior, '" a "', p_nuevo_status, '"');
        END IF;
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_cambiar_status_lote
DELIMITER //
CREATE PROCEDURE `sp_cambiar_status_lote`(
    IN p_id_licenciatura INT,
    IN p_generacion INT,
    IN p_semestre_actual INT,
    IN p_status_actual VARCHAR(50),
    IN p_nuevo_status VARCHAR(50),
    IN p_id_usuario INT,
    OUT p_total_afectados INT,
    OUT p_resultado VARCHAR(500)
)
main_block: BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    -- Validar que el nuevo status sea válido
    IF p_nuevo_status NOT IN ('Activo', 'Egresado', 'Baja temporal', 'Baja definitiva') THEN
        SET p_resultado = 'ERROR: Status no válido';
        SET p_total_afectados = 0;
        LEAVE main_block;
    END IF;
    
    START TRANSACTION;
    
    -- Actualizar status de los alumnos que cumplen criterios
    UPDATE alumnos
    SET status_alumno = p_nuevo_status
    WHERE (p_status_actual IS NULL OR status_alumno = p_status_actual)
        AND (p_id_licenciatura IS NULL OR id_licenciatura = p_id_licenciatura)
        AND (p_generacion IS NULL OR generacion = p_generacion)
        AND (p_semestre_actual IS NULL OR semestre_actual = p_semestre_actual);
    
    SET p_total_afectados = ROW_COUNT();
    
    -- Registrar en historial
    IF p_total_afectados > 0 THEN
        INSERT INTO historial_cambios 
        (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
        VALUES (
            p_id_usuario,
            'alumnos',
            0,
            'BULK_UPDATE',
            JSON_OBJECT(
                'operacion', 'cambiar_status',
                'licenciatura', p_id_licenciatura,
                'generacion', p_generacion,
                'semestre', p_semestre_actual,
                'status_anterior', p_status_actual,
                'status_nuevo', p_nuevo_status,
                'total_afectados', p_total_afectados
            )
        );
    END IF;
    
    IF v_error THEN
        ROLLBACK;
        SET p_resultado = 'ERROR: Ocurrió un error al cambiar status';
        SET p_total_afectados = 0;
    ELSE
        COMMIT;
        SET p_resultado = CONCAT('SUCCESS: ', p_total_afectados, ' alumno(s) actualizado(s) a status: ', p_nuevo_status);
    END IF;
END main_block//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_cerrar_incidente
DELIMITER //
CREATE PROCEDURE `sp_cerrar_incidente`(
    IN p_id_incidente INT,
    OUT p_resultado VARCHAR(100)
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    SELECT COUNT(*) INTO v_existe
    FROM incidentes
    WHERE id_incidente = p_id_incidente;
    
    IF v_existe = 0 THEN
        SET p_resultado = 'ERROR: Incidente no encontrado';
    ELSE
        START TRANSACTION;
        
        UPDATE incidentes
        SET estado_incidente = 'Cerrado'
        WHERE id_incidente = p_id_incidente;
        
        IF v_error THEN
            ROLLBACK;
            SET p_resultado = 'ERROR: No se pudo cerrar el incidente';
        ELSE
            COMMIT;
            SET p_resultado = 'ÉXITO: Incidente cerrado';
        END IF;
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_consultar_generacion
DELIMITER //
CREATE PROCEDURE `sp_consultar_generacion`(
    IN p_generacion INT,
    IN p_id_licenciatura INT,
    IN p_status VARCHAR(50)
)
BEGIN
    SELECT 
        a.id_alumno,
        a.matricula,
        a.nombre_completo,
        l.nombre_licenciatura,
        a.semestre_actual,
        a.generacion,
        a.status_alumno,
        ROUND((SELECT AVG(promedio) 
               FROM semestre_promedio sp 
               WHERE sp.id_alumno = a.id_alumno), 2) AS promedio_general,
        da.situacion_academica,
        a.correo_institucional,
        a.celular,
        a.fecha_ingreso
    FROM 
        alumnos a
        INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
        LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
    WHERE 
        (p_generacion IS NULL OR a.generacion = p_generacion)
        AND (p_id_licenciatura IS NULL OR a.id_licenciatura = p_id_licenciatura)
        AND (p_status IS NULL OR a.status_alumno = p_status)
    ORDER BY 
        l.nombre_licenciatura, a.nombre_completo;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_estadisticas_licenciatura
DELIMITER //
CREATE PROCEDURE `sp_estadisticas_licenciatura`(IN p_id_licenciatura INT)
BEGIN
    SELECT 
        l.nombre_licenciatura,
        COUNT(DISTINCT a.id_alumno) AS total_alumnos,
        COUNT(DISTINCT CASE WHEN fn_es_alumno_regular(a.id_alumno) = 1 THEN a.id_alumno END) AS alumnos_regulares,
        COUNT(DISTINCT CASE WHEN fn_es_alumno_regular(a.id_alumno) = 0 THEN a.id_alumno END) AS alumnos_irregulares,
        ROUND(AVG(fn_promedio_general(a.id_alumno)), 2) AS promedio_general,
        COUNT(DISTINCT CASE WHEN fn_expediente_completo(a.id_alumno) = 'COMPLETO' THEN a.id_alumno END) AS expedientes_completos,
        COUNT(DISTINCT CASE WHEN fn_expediente_completo(a.id_alumno) = 'INCOMPLETO' THEN a.id_alumno END) AS expedientes_incompletos,
        COUNT(DISTINCT i.id_incidente) AS total_incidentes,
        COUNT(DISTINCT CASE WHEN i.estado_incidente = 'Abierto' THEN i.id_incidente END) AS incidentes_abiertos
    FROM 
        licenciaturas l
        LEFT JOIN alumnos a ON l.id_licenciatura = a.id_licenciatura
        LEFT JOIN incidentes i ON a.id_alumno = i.id_alumno
    WHERE 
        l.id_licenciatura = p_id_licenciatura
    GROUP BY 
        l.id_licenciatura, l.nombre_licenciatura;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_graduar_generacion
DELIMITER //
CREATE PROCEDURE `sp_graduar_generacion`(
    IN p_id_licenciatura INT,
    IN p_generacion INT,
    IN p_id_usuario INT,
    OUT p_total_afectados INT,
    OUT p_resultado VARCHAR(500)
)
BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    START TRANSACTION;
    
    -- Cambiar a Egresado solo alumnos activos en semestre 8
    UPDATE alumnos
    SET status_alumno = 'Egresado'
    WHERE status_alumno = 'Activo'
        AND semestre_actual >= 8
        AND (p_id_licenciatura IS NULL OR id_licenciatura = p_id_licenciatura)
        AND (p_generacion IS NULL OR generacion = p_generacion);
    
    SET p_total_afectados = ROW_COUNT();
    
    -- Registrar en historial
    IF p_total_afectados > 0 THEN
        INSERT INTO historial_cambios 
        (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
        VALUES (
            p_id_usuario,
            'alumnos',
            0,
            'BULK_UPDATE',
            JSON_OBJECT(
                'operacion', 'graduar_generacion',
                'licenciatura', p_id_licenciatura,
                'generacion', p_generacion,
                'total_afectados', p_total_afectados
            )
        );
    END IF;
    
    IF v_error THEN
        ROLLBACK;
        SET p_resultado = 'ERROR: Ocurrió un error al graduar generación';
        SET p_total_afectados = 0;
    ELSE
        COMMIT;
        SET p_resultado = CONCAT('SUCCESS: ', p_total_afectados, ' alumno(s) graduado(s) exitosamente');
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_preview_operacion_lote
DELIMITER //
CREATE PROCEDURE `sp_preview_operacion_lote`(
    IN p_id_licenciatura INT,
    IN p_generacion INT,
    IN p_semestre_actual INT,
    IN p_status_actual VARCHAR(50)
)
BEGIN
    SELECT 
        COUNT(*) AS total_afectados,
        GROUP_CONCAT(DISTINCT l.nombre_licenciatura) AS licenciaturas,
        GROUP_CONCAT(DISTINCT a.generacion) AS generaciones,
        GROUP_CONCAT(DISTINCT a.semestre_actual) AS semestres,
        GROUP_CONCAT(DISTINCT a.status_alumno) AS status_actuales
    FROM alumnos a
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
    WHERE (p_id_licenciatura IS NULL OR a.id_licenciatura = p_id_licenciatura)
        AND (p_generacion IS NULL OR a.generacion = p_generacion)
        AND (p_semestre_actual IS NULL OR a.semestre_actual = p_semestre_actual)
        AND (p_status_actual IS NULL OR a.status_alumno = p_status_actual);
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_promover_generacion
DELIMITER //
CREATE PROCEDURE `sp_promover_generacion`(
    IN p_generacion INT,
    IN p_id_licenciatura INT,
    OUT p_total_promovidos INT,
    OUT p_resultado VARCHAR(200)
)
BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    DECLARE v_numero_semestres INT;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    START TRANSACTION;
    
    -- Obtener número de semestres de la licenciatura
    SELECT numero_semestres INTO v_numero_semestres
    FROM licenciaturas
    WHERE id_licenciatura = p_id_licenciatura;
    
    -- Promover alumnos que no han llegado al último semestre
    UPDATE alumnos
    SET semestre_actual = semestre_actual + 1
    WHERE generacion = p_generacion
    AND id_licenciatura = p_id_licenciatura
    AND status_alumno = 'Activo'
    AND semestre_actual < v_numero_semestres;
    
    SET p_total_promovidos = ROW_COUNT();
    
    -- Marcar como egresados a los que completaron todos los semestres
    UPDATE alumnos
    SET status_alumno = 'Egresado'
    WHERE generacion = p_generacion
    AND id_licenciatura = p_id_licenciatura
    AND semestre_actual >= v_numero_semestres
    AND status_alumno = 'Activo';
    
    IF v_error THEN
        ROLLBACK;
        SET p_total_promovidos = 0;
        SET p_resultado = 'ERROR: No se pudo promover la generación';
    ELSE
        COMMIT;
        SET p_resultado = CONCAT('ÉXITO: ', p_total_promovidos, ' alumnos promovidos');
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_promover_semestre_lote
DELIMITER //
CREATE PROCEDURE `sp_promover_semestre_lote`(
    IN p_id_licenciatura INT,
    IN p_generacion INT,
    IN p_semestre_actual INT,
    IN p_id_usuario INT,
    OUT p_total_afectados INT,
    OUT p_resultado VARCHAR(500)
)
main_block: BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    DECLARE v_nuevo_semestre INT;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    SET v_nuevo_semestre = p_semestre_actual + 1;
    
    -- Validar que el semestre no exceda el máximo (8)
    IF v_nuevo_semestre > 8 THEN
        SET p_resultado = 'ERROR: No se puede promover más allá del semestre 8';
        SET p_total_afectados = 0;
        LEAVE main_block;
    END IF;
    
    START TRANSACTION;
    
    -- Actualizar semestre de los alumnos que cumplen criterios
    UPDATE alumnos
    SET semestre_actual = v_nuevo_semestre
    WHERE status_alumno = 'Activo'
        AND (p_id_licenciatura IS NULL OR id_licenciatura = p_id_licenciatura)
        AND (p_generacion IS NULL OR generacion = p_generacion)
        AND (p_semestre_actual IS NULL OR semestre_actual = p_semestre_actual);
    
    SET p_total_afectados = ROW_COUNT();
    
    -- Registrar en historial
    IF p_total_afectados > 0 THEN
        INSERT INTO historial_cambios 
        (id_usuario, tabla_afectada, id_registro_afectado, tipo_operacion, datos_nuevos)
        VALUES (
            p_id_usuario,
            'alumnos',
            0,
            'BULK_UPDATE',
            JSON_OBJECT(
                'operacion', 'promover_semestre',
                'licenciatura', p_id_licenciatura,
                'generacion', p_generacion,
                'semestre_anterior', p_semestre_actual,
                'semestre_nuevo', v_nuevo_semestre,
                'total_afectados', p_total_afectados
            )
        );
    END IF;
    
    IF v_error THEN
        ROLLBACK;
        SET p_resultado = 'ERROR: Ocurrió un error al promover semestre';
        SET p_total_afectados = 0;
    ELSE
        COMMIT;
        SET p_resultado = CONCAT('SUCCESS: ', p_total_afectados, ' alumno(s) promovido(s) al semestre ', v_nuevo_semestre);
    END IF;
END main_block//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_recalcular_todas_completitudes
DELIMITER //
CREATE PROCEDURE `sp_recalcular_todas_completitudes`()
BEGIN
    DECLARE v_id_alumno INT;
    DECLARE v_total_procesados INT DEFAULT 0;
    DECLARE v_done INT DEFAULT FALSE;
    
    -- Cursor para recorrer todos los alumnos activos
    DECLARE cur_alumnos CURSOR FOR 
        SELECT id_alumno 
        FROM alumnos 
        WHERE status_alumno IN ('Activo', 'Regular', 'Irregular')
        ORDER BY id_alumno;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    -- Mensaje de inicio
    SELECT CONCAT('Iniciando recálculo para todos los alumnos...') AS mensaje;
    
    -- Abrir cursor
    OPEN cur_alumnos;
    
    read_loop: LOOP
        FETCH cur_alumnos INTO v_id_alumno;
        
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calcular completitud para este alumno
        CALL sp_calcular_completitud_expediente(v_id_alumno);
        
        SET v_total_procesados = v_total_procesados + 1;
    END LOOP;
    
    CLOSE cur_alumnos;
    
    -- Mensaje de finalización con resumen
    SELECT 
        'Recálculo completado exitosamente' AS status,
        v_total_procesados AS alumnos_procesados,
        NOW() AS fecha_proceso;
    
    -- Mostrar resumen por nivel
    SELECT 
        nivel_completitud,
        COUNT(*) AS cantidad,
        CONCAT(ROUND((COUNT(*) * 100.0 / v_total_procesados), 2), '%') AS porcentaje
    FROM completitud_expediente
    GROUP BY nivel_completitud
    ORDER BY 
        FIELD(nivel_completitud, 'Completo', 'Casi Completo', 'En Progreso', 'Iniciado', 'Vacío');
        
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_registrar_alumno
DELIMITER //
CREATE PROCEDURE `sp_registrar_alumno`(
    IN p_nombre_completo VARCHAR(100),
    IN p_curp VARCHAR(18),
    IN p_fecha_nacimiento DATE,
    IN p_correo_personal VARCHAR(100),
    IN p_id_licenciatura INT,
    IN p_generacion INT,  -- NUEVO PARÁMETRO
    OUT p_resultado VARCHAR(200),
    OUT p_id_alumno INT,
    OUT p_matricula VARCHAR(20)
)
BEGIN
    DECLARE v_id_usuario INT;
    DECLARE v_correo_institucional VARCHAR(100);
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    DECLARE v_fecha_ingreso DATE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    -- Si no se proporciona generación, usar el año actual
    IF p_generacion IS NULL OR p_generacion = 0 THEN
        SET p_generacion = YEAR(CURDATE());
    END IF;
    
    SET v_fecha_ingreso = CURDATE();
    
    START TRANSACTION;
    
    -- Generar correo institucional
    SET v_correo_institucional = CONCAT(
        LOWER(REPLACE(SUBSTRING_INDEX(p_nombre_completo, ' ', 1), ' ', '')),
        '.',
        LOWER(REPLACE(SUBSTRING_INDEX(p_nombre_completo, ' ', -1), ' ', '')),
        '@alumno.ensq.edu.mx'
    );
    
    -- Crear usuario
    INSERT INTO usuarios (id_rol, nombre_usuario, correo, contrasena, activo)
    VALUES (3, v_correo_institucional, v_correo_institucional, MD5('Temporal123'), TRUE);
    
    SET v_id_usuario = LAST_INSERT_ID();
    
    -- Generar matrícula (usando la generación proporcionada)
    SET p_matricula = fn_generar_matricula(p_id_licenciatura, p_generacion);
    
    -- Crear alumno con generación
    INSERT INTO alumnos (
        id_usuario,
        id_licenciatura,
        nombre_completo,
        curp,
        fecha_nacimiento,
        correo_institucional,
        correo_personal,
        matricula,
        semestre_actual,
        generacion,
        fecha_ingreso,
        status_alumno
    ) VALUES (
        v_id_usuario,
        p_id_licenciatura,
        p_nombre_completo,
        p_curp,
        p_fecha_nacimiento,
        v_correo_institucional,
        p_correo_personal,
        p_matricula,
        1,
        p_generacion,
        v_fecha_ingreso,
        'Activo'
    );
    
    SET p_id_alumno = LAST_INSERT_ID();
    
    IF v_error THEN
        ROLLBACK;
        SET p_resultado = 'ERROR: No se pudo registrar el alumno';
        SET p_id_alumno = NULL;
        SET p_matricula = NULL;
    ELSE
        COMMIT;
        SET p_resultado = CONCAT('ÉXITO: Alumno registrado correctamente. Generación: ', p_generacion);
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_registrar_auditoria
DELIMITER //
CREATE PROCEDURE `sp_registrar_auditoria`(
    IN p_id_usuario INT,
    IN p_tabla VARCHAR(100),
    IN p_id_registro INT,
    IN p_tipo_operacion VARCHAR(50),
    IN p_datos_anteriores TEXT,
    IN p_datos_nuevos TEXT
)
BEGIN
    INSERT INTO historial_cambios (
        id_usuario,
        tabla_afectada,
        id_registro_afectado,
        tipo_operacion,
        datos_anteriores,
        datos_nuevos
    ) VALUES (
        p_id_usuario,
        p_tabla,
        p_id_registro,
        p_tipo_operacion,
        p_datos_anteriores,
        p_datos_nuevos
    );
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_registrar_calificacion
DELIMITER //
CREATE PROCEDURE `sp_registrar_calificacion`(
    IN p_id_alumno INT,
    IN p_numero_semestre INT,
    IN p_promedio DECIMAL(4,2),
    OUT p_resultado VARCHAR(100)
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    -- Validar promedio
    IF p_promedio < 0 OR p_promedio > 10 THEN
        SET p_resultado = 'ERROR: El promedio debe estar entre 0 y 10';
    ELSE
        START TRANSACTION;
        
        -- Verificar si ya existe
        SELECT COUNT(*) INTO v_existe
        FROM semestre_promedio
        WHERE id_alumno = p_id_alumno AND numero_semestre = p_numero_semestre;
        
        IF v_existe > 0 THEN
            -- Actualizar
            UPDATE semestre_promedio
            SET promedio = p_promedio
            WHERE id_alumno = p_id_alumno AND numero_semestre = p_numero_semestre;
            
            SET p_resultado = 'ÉXITO: Promedio actualizado';
        ELSE
            -- Insertar
            INSERT INTO semestre_promedio (id_alumno, numero_semestre, promedio)
            VALUES (p_id_alumno, p_numero_semestre, p_promedio);
            
            SET p_resultado = 'ÉXITO: Promedio registrado';
        END IF;
        
        IF v_error THEN
            ROLLBACK;
            SET p_resultado = 'ERROR: No se pudo registrar el promedio';
        ELSE
            COMMIT;
        END IF;
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_registrar_incidente
DELIMITER //
CREATE PROCEDURE `sp_registrar_incidente`(
    IN p_id_alumno INT,
    IN p_id_docente INT,
    IN p_tipo_incidente VARCHAR(100),
    IN p_descripcion TEXT,
    OUT p_resultado VARCHAR(100),
    OUT p_id_incidente INT
)
BEGIN
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = TRUE;
    
    START TRANSACTION;
    
    INSERT INTO incidentes (
        id_alumno,
        id_docente,
        tipo_incidente,
        fecha_incidente,
        descripcion,
        estado_incidente
    ) VALUES (
        p_id_alumno,
        p_id_docente,
        p_tipo_incidente,
        CURDATE(),
        p_descripcion,
        'Abierto'
    );
    
    SET p_id_incidente = LAST_INSERT_ID();
    
    IF v_error THEN
        ROLLBACK;
        SET p_resultado = 'ERROR: No se pudo registrar el incidente';
        SET p_id_incidente = NULL;
    ELSE
        COMMIT;
        SET p_resultado = 'ÉXITO: Incidente registrado';
    END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento expedientes_estudiantiles.sp_reporte_completo_alumno
DELIMITER //
CREATE PROCEDURE `sp_reporte_completo_alumno`(IN p_id_alumno INT)
BEGIN
    SELECT 
        a.id_alumno,
        a.matricula,
        a.nombre_completo,
        a.curp,
        a.fecha_nacimiento,
        TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) AS edad,
        a.estado_civil,
        a.correo_institucional,
        a.correo_personal,
        a.celular,
        a.telefono_emergencia,
        a.semestre_actual,
        a.generacion,
        a.status_alumno,
        
        a.representativo_indigena,
        a.habla_lengua_indigena,
        a.lengua_indigena,
        a.tiene_hijos,
        a.numero_hijos,
        a.edad_hijos,
        a.embarazada,
        a.meses_embarazo,
        a.situacion_personal,
        
        a.municipio_nacimiento,
        a.estado_nacimiento,
        fn_expediente_completo(a.id_alumno) AS estado_expediente,
        fn_porcentaje_completitud(a.id_alumno) AS porcentaje_completitud,
        
        -- Licenciatura
        l.id_licenciatura,
        l.nombre_licenciatura,
        l.numero_semestres,
        
        d.id_domicilio,
        d.calle AS domicilio_calle,
        d.numero AS domicilio_numero,
        d.colonia AS domicilio_colonia,
        d.municipio AS domicilio_municipio,
        d.estado AS domicilio_estado,
        d.referencia AS domicilio_referencia,
        CONCAT_WS(', ', 
            d.calle, 
            d.numero, 
            d.colonia, 
            d.municipio, 
            d.estado
        ) AS domicilio_completo,
        
        -- Usuario
        u.nombre_usuario,
        u.correo AS correo_usuario,
        u.activo AS cuenta_activa,
        
        -- Fechas
        a.fecha_registro
        
    FROM 
        alumnos a
        INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
        INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
        LEFT JOIN domicilios d ON a.id_domicilio = d.id_domicilio  
    WHERE 
        a.id_alumno = p_id_alumno;
    
    -- ============================================
    -- RESULT SET 2: RENDIMIENTO ACADÉMICO
    -- ============================================
    SELECT 
        a.id_alumno,
        a.matricula,
        a.nombre_completo,
        -- Datos académicos
        da.escuela_procedencia,
        da.promedio_media_superior,
        da.situacion_academica,
        da.cursos_irregulares,
        da.curso_mayor_dificultad,
        da.motivo_dificultad,
        -- Promedio actual
        (SELECT AVG(promedio) 
         FROM semestre_promedio sp 
         WHERE sp.id_alumno = a.id_alumno) AS promedio_general_licenciatura,
        -- Último semestre
        (SELECT promedio 
         FROM semestre_promedio sp 
         WHERE sp.id_alumno = a.id_alumno
         ORDER BY numero_semestre DESC LIMIT 1) AS promedio_ultimo_semestre,
        -- Contadores
        (SELECT COUNT(*) 
         FROM semestre_promedio sp 
         WHERE sp.id_alumno = a.id_alumno) AS total_semestres_cursados
    FROM 
        alumnos a
        LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
    WHERE 
        a.id_alumno = p_id_alumno;
    
    -- ============================================
    -- RESULT SET 3: PROMEDIOS POR SEMESTRE
    -- ============================================
    SELECT 
        numero_semestre,
        promedio,
        fecha_registro
    FROM 
        semestre_promedio
    WHERE 
        id_alumno = p_id_alumno
    ORDER BY 
        numero_semestre ASC;
    
    -- ============================================
    -- RESULT SET 4: FAMILIARES
    -- ============================================
    SELECT 
        id_familiar,
        tipo_familiar,
        nombre_completo,
        telefono,
        ocupacion,
        es_tutor,
        fecha_registro
    FROM 
        familiares
    WHERE 
        id_alumno = p_id_alumno
    ORDER BY 
        es_tutor DESC, tipo_familiar ASC;
    
    -- ============================================
    -- RESULT SET 5: INCIDENTES
    -- ============================================
    SELECT 
        i.id_incidente,
        i.tipo_incidente,
        i.descripcion,
        i.fecha_incidente,
        i.estado_incidente,
        i.id_docente,
        d.nombre_completo AS docente_reporta,
        d.area_asignada AS area_docente,
        i.fecha_registro
    FROM 
        incidentes i
        LEFT JOIN docentes d ON i.id_docente = d.id_docente
    WHERE 
        i.id_alumno = p_id_alumno
    ORDER BY 
        i.fecha_incidente DESC;
        
END//
DELIMITER ;

-- Volcando estructura para tabla expedientes_estudiantiles.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando estructura para vista expedientes_estudiantiles.vista_alumnos_generacion
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_alumnos_generacion` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`curp` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_nacimiento` DATE NOT NULL,
	`edad` BIGINT(21) NULL,
	`correo_institucional` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`correo_personal` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`celular` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`generacion` INT(11) NOT NULL,
	`fecha_ingreso` DATE NULL,
	`status_alumno` ENUM('Activo','Egresado','Baja temporal','Baja definitiva') NULL COLLATE 'utf8mb4_unicode_ci',
	`promedio_general` DECIMAL(8,6) NULL,
	`situacion_academica` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`becas_activas` BIGINT(21) NULL,
	`incidentes_abiertos` BIGINT(21) NULL,
	`fecha_registro` TIMESTAMP NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_alumnos_por_semestre
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_alumnos_por_semestre` (
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`total_alumnos` BIGINT(21) NOT NULL,
	`con_hijos` BIGINT(21) NOT NULL,
	`trabajan` BIGINT(21) NOT NULL,
	`con_beca` BIGINT(21) NOT NULL,
	`promedio_semestre` DECIMAL(5,2) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_alumnos_riesgo
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_alumnos_riesgo` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`promedio_general` DECIMAL(5,2) NULL,
	`situacion_academica` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`incidentes_abiertos` BIGINT(21) NOT NULL,
	`tipos_incidentes` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_alumno_salud
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_alumno_salud` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`tipo_sangre` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`afiliacion_seguro_medico` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`numero_seguro_social` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`alergias` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`tiene_enfermedad` TINYINT(1) NULL,
	`nombre_enfermedad` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`telefono_emergencia` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_auditoria
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_auditoria` (
	`id_historial` INT(11) NOT NULL,
	`nombre_usuario` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`correo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_rol` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`tabla_afectada` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`id_registro_afectado` INT(11) NOT NULL,
	`tipo_operacion` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_cambio` TIMESTAMP NULL,
	`fecha_cambio_formato` VARCHAR(1) NULL COLLATE 'utf8mb4_uca1400_ai_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_certificaciones
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_certificaciones` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_certificacion` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`institucion_emisora` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_obtencion` DATE NULL,
	`fecha_vencimiento` DATE NULL,
	`estado_certificacion` VARCHAR(1) NULL COLLATE 'utf8mb4_uca1400_ai_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_datos_familiares
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_datos_familiares` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`tipo_familiar` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_familiar` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`telefono` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`ocupacion` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`es_tutor` TINYINT(1) NULL,
	`total_familiares_registrados` BIGINT(21) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_desempeno_actividades
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_desempeno_actividades` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`club_inscrito` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`eventos_participados` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`participo_como_ponente` TINYINT(1) NULL,
	`interes_intercambio` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`habilidades` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`numero_certificaciones` BIGINT(21) NULL,
	`numero_movilidades` BIGINT(21) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_docentes_licenciaturas
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_docentes_licenciaturas` (
	`id_docente` INT(11) NOT NULL,
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`area_asignada` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`activo` TINYINT(1) NULL,
	`nombre_plantel` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`licenciaturas_asignadas` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_usuario` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`correo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_documentos_alumno
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_documentos_alumno` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_archivo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`tipo_mime` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`tamano_mb` DECIMAL(10,2) NULL,
	`fecha_subida` TIMESTAMP NULL,
	`subido_por` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`total_documentos` BIGINT(21) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_estadisticas_generacion
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_estadisticas_generacion` (
	`generacion` INT(11) NOT NULL,
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_alumnos` BIGINT(21) NOT NULL,
	`alumnos_activos` BIGINT(21) NOT NULL,
	`alumnos_egresados` BIGINT(21) NOT NULL,
	`alumnos_baja` BIGINT(21) NOT NULL,
	`alumnos_regulares` BIGINT(21) NOT NULL,
	`alumnos_irregulares` BIGINT(21) NOT NULL,
	`promedio_general_generacion` DECIMAL(5,2) NULL,
	`semestre_minimo` INT(11) NULL,
	`semestre_maximo` INT(11) NULL,
	`semestre_promedio` DECIMAL(12,1) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_estadisticas_licenciatura
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_estadisticas_licenciatura` (
	`id_licenciatura` INT(11) NOT NULL,
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_alumnos` BIGINT(21) NOT NULL,
	`alumnos_regulares` BIGINT(21) NOT NULL,
	`alumnos_irregulares` BIGINT(21) NOT NULL,
	`promedio_general_licenciatura` DECIMAL(5,2) NULL,
	`docentes_asignados` BIGINT(21) NOT NULL,
	`total_incidentes` BIGINT(21) NOT NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_expedientes_incompletos
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_expedientes_incompletos` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`correo_institucional` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`datos_salud` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`datos_academicos` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`datos_socioeconomicos` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`practicas_profesionales` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`datos_familiares` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`documentos` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_expediente_academico
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_expediente_academico` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`escuela_procedencia` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`promedio_media_superior` DECIMAL(4,2) NULL,
	`situacion_academica` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`cursos_irregulares` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`curso_mayor_dificultad` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`motivo_dificultad` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`promedio_general_licenciatura` DECIMAL(8,6) NULL,
	`promedio_ultimo_semestre` DECIMAL(4,2) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_expediente_alumno
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_expediente_alumno` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`curp` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_nacimiento` DATE NOT NULL,
	`edad` BIGINT(21) NULL,
	`estado_civil` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`correo_institucional` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`correo_personal` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`celular` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`telefono_emergencia` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`domicilio_completo` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`municipio` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`estado` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`municipio_nacimiento` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`estado_nacimiento` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`representativo_indigena` TINYINT(1) NULL,
	`habla_lengua_indigena` TINYINT(1) NULL,
	`lengua_indigena` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`tiene_hijos` TINYINT(1) NULL,
	`numero_hijos` INT(11) NULL,
	`embarazada` TINYINT(1) NULL,
	`situacion_personal` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_usuario` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`correo_usuario` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`cuenta_activa` TINYINT(1) NULL,
	`fecha_registro` TIMESTAMP NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_expediente_salud
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_expediente_salud` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`tipo_sangre` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`afiliacion_seguro_medico` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`numero_seguro_social` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`alergias` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`tiene_enfermedad` TINYINT(1) NULL,
	`nombre_enfermedad` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`telefono_emergencia` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_generacion_activa
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_generacion_activa` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`generacion` INT(11) NOT NULL,
	`status_alumno` ENUM('Activo','Egresado','Baja temporal','Baja definitiva') NULL COLLATE 'utf8mb4_unicode_ci',
	`promedio_general` DECIMAL(8,6) NULL,
	`correo_institucional` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`celular` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_historial_promedios
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_historial_promedios` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`numero_semestre` INT(11) NOT NULL,
	`promedio` DECIMAL(4,2) NOT NULL,
	`fecha_registro` TIMESTAMP NULL,
	`promedio_acumulado` DECIMAL(8,6) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_incidentes_alumno
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_incidentes_alumno` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`tipo_incidente` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_incidente` DATE NOT NULL,
	`descripcion` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`estado_incidente` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`reportado_por_docente` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`area_docente` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_registro` TIMESTAMP NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_movilidad_academica
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_movilidad_academica` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_programa` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`lugar` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_inicio` DATE NULL,
	`fecha_fin` DATE NULL,
	`dias_duracion` INT(8) NULL,
	`relato_experiencia` TEXT NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_practicas_alumno
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_practicas_alumno` (
	`id_practica` INT(11) NOT NULL,
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`periodo_escolar` VARCHAR(1) NOT NULL COMMENT 'Formato: 2024-A, 2024-B, 2025-A' COLLATE 'utf8mb4_unicode_ci',
	`semestre_cursado` INT(11) NOT NULL COMMENT 'Semestre que cursaba el alumno',
	`nombre_escuela` VARCHAR(1) NOT NULL COMMENT 'Nombre completo de la escuela' COLLATE 'utf8mb4_unicode_ci',
	`cct_escuela` VARCHAR(1) NOT NULL COMMENT 'Clave de Centro de Trabajo' COLLATE 'utf8mb4_unicode_ci',
	`nivel_educativo` ENUM('Preescolar','Primaria','Secundaria','Otro') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`ubicacion` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_inicio` DATE NOT NULL,
	`fecha_fin` DATE NOT NULL,
	`dias_practica` INT(8) NULL,
	`horas_totales` INT(11) NULL COMMENT 'Horas totales de práctica',
	`habilidades_desarrolladas` TEXT NULL COMMENT 'Habilidades desarrolladas durante la práctica' COLLATE 'utf8mb4_unicode_ci',
	`calificacion_obtenida` DECIMAL(4,2) NULL COMMENT 'Calificación de 0 a 10',
	`tutor_asignado` VARCHAR(1) NULL COMMENT 'Nombre del tutor en la escuela' COLLATE 'utf8mb4_unicode_ci',
	`sigue_orientacion_reglamento` TINYINT(1) NULL,
	`tiene_incidentes` TINYINT(1) NULL,
	`situacion` ENUM('En curso','Completada','Cancelada') NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_registro` TIMESTAMP NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_practicas_profesionales
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_practicas_profesionales` (
	`id_practica` INT(11) NOT NULL,
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`periodo_escolar` VARCHAR(1) NOT NULL COMMENT 'Formato: 2024-A, 2024-B, 2025-A' COLLATE 'utf8mb4_unicode_ci',
	`semestre_cursado` INT(11) NOT NULL COMMENT 'Semestre que cursaba el alumno',
	`nombre_escuela` VARCHAR(1) NOT NULL COMMENT 'Nombre completo de la escuela' COLLATE 'utf8mb4_unicode_ci',
	`cct_escuela` VARCHAR(1) NOT NULL COMMENT 'Clave de Centro de Trabajo' COLLATE 'utf8mb4_unicode_ci',
	`nivel_educativo` ENUM('Preescolar','Primaria','Secundaria','Otro') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`ubicacion_escuela` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_inicio` DATE NOT NULL,
	`fecha_fin` DATE NOT NULL,
	`dias_practica` INT(8) NULL,
	`horas_totales` INT(11) NULL COMMENT 'Horas totales de práctica',
	`habilidades_desarrolladas` TEXT NULL COMMENT 'Habilidades desarrolladas durante la práctica' COLLATE 'utf8mb4_unicode_ci',
	`calificacion_obtenida` DECIMAL(4,2) NULL COMMENT 'Calificación de 0 a 10',
	`tutor_asignado` VARCHAR(1) NULL COMMENT 'Nombre del tutor en la escuela' COLLATE 'utf8mb4_unicode_ci',
	`sigue_orientacion_reglamento` TINYINT(1) NULL,
	`tiene_incidentes` TINYINT(1) NULL,
	`relato_incidentes` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`observaciones` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`situacion` ENUM('En curso','Completada','Cancelada') NULL COLLATE 'utf8mb4_unicode_ci',
	`fecha_registro` TIMESTAMP NULL,
	`fecha_actualizacion` TIMESTAMP NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_resumen_generaciones
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_resumen_generaciones` (
	`generacion` INT(11) NOT NULL,
	`total_alumnos` BIGINT(21) NOT NULL,
	`activos` BIGINT(21) NOT NULL,
	`egresados` BIGINT(21) NOT NULL,
	`licenciaturas_con_alumnos` BIGINT(21) NOT NULL,
	`fecha_inicio_generacion` DATE NULL,
	`fecha_fin_generacion` DATE NULL,
	`descripcion_generacion` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_resumen_practicas_alumno
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_resumen_practicas_alumno` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`total_practicas` BIGINT(21) NOT NULL,
	`practicas_completadas` BIGINT(21) NOT NULL,
	`practicas_en_curso` BIGINT(21) NOT NULL,
	`practicas_canceladas` BIGINT(21) NOT NULL,
	`horas_totales_acumuladas` DECIMAL(32,0) NULL,
	`promedio_calificaciones` DECIMAL(8,6) NULL,
	`practicas_con_incidentes` BIGINT(21) NOT NULL,
	`primera_practica_fecha` DATE NULL,
	`ultima_practica_fecha` DATE NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_seguimiento_completitud
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_seguimiento_completitud` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`generacion` INT(11) NOT NULL,
	`datos_personales` DECIMAL(5,2) NOT NULL,
	`datos_salud` DECIMAL(5,2) NOT NULL,
	`datos_academicos` DECIMAL(5,2) NOT NULL,
	`datos_socioeconomicos` DECIMAL(5,2) NOT NULL,
	`familiares` DECIMAL(5,2) NOT NULL,
	`documentos` DECIMAL(5,2) NOT NULL,
	`habilidades` DECIMAL(5,2) NOT NULL,
	`practicas` DECIMAL(5,2) NULL COMMENT 'Prácticas profesionales (opcional)',
	`certificaciones` DECIMAL(5,2) NULL COMMENT 'Certificaciones adicionales (opcional)',
	`movilidad` DECIMAL(5,2) NULL COMMENT 'Movilidad académica (opcional)',
	`becas` DECIMAL(5,2) NULL COMMENT 'Becas obtenidas (opcional)',
	`porcentaje_completitud` DECIMAL(5,2) NOT NULL,
	`nivel_completitud` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`prioridad` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`secciones_pendientes` INT(7) NOT NULL,
	`fecha_calculo` TIMESTAMP NULL COMMENT 'Última vez que se calculó la completitud'
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_situacion_socioeconomica
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_situacion_socioeconomica` (
	`id_alumno` INT(11) NOT NULL,
	`matricula` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_completo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_licenciatura` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`semestre_actual` INT(11) NULL,
	`recursos_economicos` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`dependencia_economica` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`alguien_depende_ti` TINYINT(1) NULL,
	`trabaja` TINYINT(1) NULL,
	`lugar_trabajo` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`horario_trabajo` VARCHAR(1) NULL COLLATE 'utf8mb4_unicode_ci',
	`renta_fuera_domicilio` TINYINT(1) NULL,
	`becas_activas` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`numero_becas_activas` BIGINT(21) NULL
);

-- Volcando estructura para vista expedientes_estudiantiles.vista_usuarios_permisos
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vista_usuarios_permisos` (
	`id_usuario` INT(11) NOT NULL,
	`nombre_usuario` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`correo` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`nombre_rol` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`activo` TINYINT(1) NULL,
	`fecha_registro` TIMESTAMP NULL,
	`permisos` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci'
);

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_alumnos_generacion`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_alumnos_generacion` AS SELECT 
    a.id_alumno,
    a.matricula,
    a.nombre_completo,
    a.curp,
    a.fecha_nacimiento,
    TIMESTAMPDIFF(YEAR, a.fecha_nacimiento, CURDATE()) AS edad,
    a.correo_institucional,
    a.correo_personal,
    a.celular,
    l.nombre_licenciatura,
    a.semestre_actual,
    a.generacion,
    a.fecha_ingreso,
    a.status_alumno,
    -- Promedio general
    (SELECT AVG(promedio) 
     FROM semestre_promedio sp 
     WHERE sp.id_alumno = a.id_alumno) AS promedio_general,
    -- Situación académica
    da.situacion_academica,
    -- Becas activas
    (SELECT COUNT(*) 
     FROM becas b 
     WHERE b.id_alumno = a.id_alumno 
     AND b.activa = TRUE) AS becas_activas,
    -- Incidentes abiertos
    (SELECT COUNT(*) 
     FROM incidentes i 
     WHERE i.id_alumno = a.id_alumno 
     AND i.estado_incidente = 'Abierto') AS incidentes_abiertos,
    a.fecha_registro
FROM 
    alumnos a
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
    LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_alumnos_por_semestre`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_alumnos_por_semestre` AS select `l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,count(0) AS `total_alumnos`,count(case when `a`.`tiene_hijos` = 1 then 1 end) AS `con_hijos`,count(case when `dse`.`trabaja` = 1 then 1 end) AS `trabajan`,count(case when `b`.`activa` = 1 then 1 end) AS `con_beca`,round(avg(`sp`.`promedio`),2) AS `promedio_semestre` from ((((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `datos_socioeconomicos` `dse` on(`a`.`id_alumno` = `dse`.`id_alumno`)) left join `becas` `b` on(`a`.`id_alumno` = `b`.`id_alumno` and `b`.`activa` = 1)) left join `semestre_promedio` `sp` on(`a`.`id_alumno` = `sp`.`id_alumno` and `sp`.`numero_semestre` = `a`.`semestre_actual`)) group by `l`.`nombre_licenciatura`,`a`.`semestre_actual` order by `l`.`nombre_licenciatura`,`a`.`semestre_actual` 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_alumnos_riesgo`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_alumnos_riesgo` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,round((select avg(`sp`.`promedio`) from `semestre_promedio` `sp` where `sp`.`id_alumno` = `a`.`id_alumno`),2) AS `promedio_general`,`da`.`situacion_academica` AS `situacion_academica`,count(distinct `i`.`id_incidente`) AS `incidentes_abiertos`,group_concat(distinct `i`.`tipo_incidente` separator ', ') AS `tipos_incidentes` from (((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `datos_academicos` `da` on(`a`.`id_alumno` = `da`.`id_alumno`)) left join `incidentes` `i` on(`a`.`id_alumno` = `i`.`id_alumno` and `i`.`estado_incidente` = 'Abierto')) where (select avg(`sp`.`promedio`) from `semestre_promedio` `sp` where `sp`.`id_alumno` = `a`.`id_alumno`) < 7.0 or `da`.`situacion_academica` = 'Irregular' or exists(select 1 from `incidentes` `i2` where `i2`.`id_alumno` = `a`.`id_alumno` and `i2`.`estado_incidente` = 'Abierto' limit 1) group by `a`.`id_alumno`,`a`.`matricula`,`a`.`nombre_completo`,`l`.`nombre_licenciatura`,`a`.`semestre_actual`,`da`.`situacion_academica` 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_alumno_salud`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_alumno_salud` AS SELECT 
    a.id_alumno,
    a.matricula,
    a.nombre_completo,
    l.nombre_licenciatura,
    a.semestre_actual,
    -- Datos de salud
    ds.tipo_sangre,
    ds.afiliacion_seguro_medico,
    ds.numero_seguro_social,
    ds.alergias,
    ds.tiene_enfermedad,
    ds.nombre_enfermedad,
    a.telefono_emergencia
FROM 
    alumnos a
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
    LEFT JOIN datos_salud ds ON a.id_alumno = ds.id_alumno 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_auditoria`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_auditoria` AS select `hc`.`id_historial` AS `id_historial`,`u`.`nombre_usuario` AS `nombre_usuario`,`u`.`correo` AS `correo`,`r`.`nombre_rol` AS `nombre_rol`,`hc`.`tabla_afectada` AS `tabla_afectada`,`hc`.`id_registro_afectado` AS `id_registro_afectado`,`hc`.`tipo_operacion` AS `tipo_operacion`,`hc`.`fecha_cambio` AS `fecha_cambio`,date_format(`hc`.`fecha_cambio`,'%d/%m/%Y %H:%i:%s') AS `fecha_cambio_formato` from ((`historial_cambios` `hc` join `usuarios` `u` on(`hc`.`id_usuario` = `u`.`id_usuario`)) join `roles` `r` on(`u`.`id_rol` = `r`.`id_rol`)) order by `hc`.`fecha_cambio` desc 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_certificaciones`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_certificaciones` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`c`.`nombre_certificacion` AS `nombre_certificacion`,`c`.`institucion_emisora` AS `institucion_emisora`,`c`.`fecha_obtencion` AS `fecha_obtencion`,`c`.`fecha_vencimiento` AS `fecha_vencimiento`,case when `c`.`fecha_vencimiento` is null then 'Sin vencimiento' when `c`.`fecha_vencimiento` < curdate() then 'Vencida' when `c`.`fecha_vencimiento` <= curdate() + interval 3 month then 'Por vencer' else 'Vigente' end AS `estado_certificacion` from ((`certificaciones` `c` join `alumnos` `a` on(`c`.`id_alumno` = `a`.`id_alumno`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_datos_familiares`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_datos_familiares` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`f`.`tipo_familiar` AS `tipo_familiar`,`f`.`nombre_completo` AS `nombre_familiar`,`f`.`telefono` AS `telefono`,`f`.`ocupacion` AS `ocupacion`,`f`.`es_tutor` AS `es_tutor`,(select count(0) from `familiares` `f2` where `f2`.`id_alumno` = `a`.`id_alumno`) AS `total_familiares_registrados` from (`alumnos` `a` left join `familiares` `f` on(`a`.`id_alumno` = `f`.`id_alumno`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_desempeno_actividades`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_desempeno_actividades` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,`da`.`club_inscrito` AS `club_inscrito`,`da`.`eventos_participados` AS `eventos_participados`,`da`.`participo_como_ponente` AS `participo_como_ponente`,`da`.`interes_intercambio` AS `interes_intercambio`,(select group_concat(concat(`ah`.`nombre_habilidad`,' (',`ah`.`nivel`,')') separator ', ') from `alumno_habilidad` `ah` where `ah`.`id_alumno` = `a`.`id_alumno`) AS `habilidades`,(select count(0) from `certificaciones` `c` where `c`.`id_alumno` = `a`.`id_alumno`) AS `numero_certificaciones`,(select count(0) from `movilidad_academica` `ma` where `ma`.`id_alumno` = `a`.`id_alumno`) AS `numero_movilidades` from ((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `desempeno_academico` `da` on(`a`.`id_alumno` = `da`.`id_alumno`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_docentes_licenciaturas`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_docentes_licenciaturas` AS select `d`.`id_docente` AS `id_docente`,`d`.`nombre_completo` AS `nombre_completo`,`d`.`area_asignada` AS `area_asignada`,`d`.`activo` AS `activo`,`p`.`nombre_plantel` AS `nombre_plantel`,group_concat(`l`.`nombre_licenciatura` separator ', ') AS `licenciaturas_asignadas`,`u`.`nombre_usuario` AS `nombre_usuario`,`u`.`correo` AS `correo` from ((((`docentes` `d` join `usuarios` `u` on(`d`.`id_usuario` = `u`.`id_usuario`)) left join `planteles` `p` on(`d`.`id_plantel` = `p`.`id_plantel`)) left join `docente_licenciatura` `dl` on(`d`.`id_docente` = `dl`.`id_docente`)) left join `licenciaturas` `l` on(`dl`.`id_licenciatura` = `l`.`id_licenciatura`)) group by `d`.`id_docente`,`d`.`nombre_completo`,`d`.`area_asignada`,`d`.`activo`,`p`.`nombre_plantel`,`u`.`nombre_usuario`,`u`.`correo` 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_documentos_alumno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_documentos_alumno` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`doc`.`nombre_archivo` AS `nombre_archivo`,`doc`.`tipo_mime` AS `tipo_mime`,`doc`.`tamano_mb` AS `tamano_mb`,`doc`.`fecha_subida` AS `fecha_subida`,`u`.`nombre_usuario` AS `subido_por`,(select count(0) from `documentos` `d2` where `d2`.`id_alumno` = `a`.`id_alumno`) AS `total_documentos` from (((`documentos` `doc` join `alumnos` `a` on(`doc`.`id_alumno` = `a`.`id_alumno`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `usuarios` `u` on(`doc`.`subido_por` = `u`.`id_usuario`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_estadisticas_generacion`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_estadisticas_generacion` AS SELECT 
    a.generacion,
    l.nombre_licenciatura,
    COUNT(DISTINCT a.id_alumno) AS total_alumnos,
    COUNT(DISTINCT CASE WHEN a.status_alumno = 'Activo' THEN a.id_alumno END) AS alumnos_activos,
    COUNT(DISTINCT CASE WHEN a.status_alumno = 'Egresado' THEN a.id_alumno END) AS alumnos_egresados,
    COUNT(DISTINCT CASE WHEN a.status_alumno IN ('Baja temporal', 'Baja definitiva') THEN a.id_alumno END) AS alumnos_baja,
    COUNT(DISTINCT CASE WHEN da.situacion_academica = 'Regular' THEN a.id_alumno END) AS alumnos_regulares,
    COUNT(DISTINCT CASE WHEN da.situacion_academica = 'Irregular' THEN a.id_alumno END) AS alumnos_irregulares,
    ROUND(AVG(sp.promedio), 2) AS promedio_general_generacion,
    MIN(a.semestre_actual) AS semestre_minimo,
    MAX(a.semestre_actual) AS semestre_maximo,
    ROUND(AVG(a.semestre_actual), 1) AS semestre_promedio
FROM 
    alumnos a
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
    LEFT JOIN datos_academicos da ON a.id_alumno = da.id_alumno
    LEFT JOIN semestre_promedio sp ON a.id_alumno = sp.id_alumno
GROUP BY 
    a.generacion, l.nombre_licenciatura
ORDER BY 
    a.generacion DESC, l.nombre_licenciatura 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_estadisticas_licenciatura`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_estadisticas_licenciatura` AS select `l`.`id_licenciatura` AS `id_licenciatura`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,count(distinct `a`.`id_alumno`) AS `total_alumnos`,count(distinct case when `da`.`situacion_academica` = 'Regular' then `a`.`id_alumno` end) AS `alumnos_regulares`,count(distinct case when `da`.`situacion_academica` = 'Irregular' then `a`.`id_alumno` end) AS `alumnos_irregulares`,round(avg(`sp`.`promedio`),2) AS `promedio_general_licenciatura`,count(distinct `d`.`id_docente`) AS `docentes_asignados`,count(distinct `i`.`id_incidente`) AS `total_incidentes` from ((((((`licenciaturas` `l` left join `alumnos` `a` on(`l`.`id_licenciatura` = `a`.`id_licenciatura`)) left join `datos_academicos` `da` on(`a`.`id_alumno` = `da`.`id_alumno`)) left join `semestre_promedio` `sp` on(`a`.`id_alumno` = `sp`.`id_alumno`)) left join `docente_licenciatura` `dl` on(`l`.`id_licenciatura` = `dl`.`id_licenciatura`)) left join `docentes` `d` on(`dl`.`id_docente` = `d`.`id_docente`)) left join `incidentes` `i` on(`a`.`id_alumno` = `i`.`id_alumno`)) group by `l`.`id_licenciatura`,`l`.`nombre_licenciatura` 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_expedientes_incompletos`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_expedientes_incompletos` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`correo_institucional` AS `correo_institucional`,case when `ds`.`id_datos_salud` is null then 'Falta' else 'Completo' end AS `datos_salud`,case when `da`.`id_datos_academicos` is null then 'Falta' else 'Completo' end AS `datos_academicos`,case when `dse`.`id_datos_socioeconomicos` is null then 'Falta' else 'Completo' end AS `datos_socioeconomicos`,case when exists(select 1 from `practicas_profesionales` `pp` where `pp`.`id_alumno` = `a`.`id_alumno` limit 1) then 'Completo' else 'Falta' end AS `practicas_profesionales`,case when exists(select 1 from `familiares` `f` where `f`.`id_alumno` = `a`.`id_alumno` limit 1) then 'Completo' else 'Falta' end AS `datos_familiares`,case when exists(select 1 from `documentos` `doc` where `doc`.`id_alumno` = `a`.`id_alumno` limit 1) then 'Completo' else 'Falta' end AS `documentos` from ((((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `datos_salud` `ds` on(`a`.`id_alumno` = `ds`.`id_alumno`)) left join `datos_academicos` `da` on(`a`.`id_alumno` = `da`.`id_alumno`)) left join `datos_socioeconomicos` `dse` on(`a`.`id_alumno` = `dse`.`id_alumno`)) where `ds`.`id_datos_salud` is null or `da`.`id_datos_academicos` is null or `dse`.`id_datos_socioeconomicos` is null or !exists(select 1 from `practicas_profesionales` `pp` where `pp`.`id_alumno` = `a`.`id_alumno` limit 1) or !exists(select 1 from `familiares` `f` where `f`.`id_alumno` = `a`.`id_alumno` limit 1) or !exists(select 1 from `documentos` `doc` where `doc`.`id_alumno` = `a`.`id_alumno` limit 1) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_expediente_academico`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_expediente_academico` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,`da`.`escuela_procedencia` AS `escuela_procedencia`,`da`.`promedio_media_superior` AS `promedio_media_superior`,`da`.`situacion_academica` AS `situacion_academica`,`da`.`cursos_irregulares` AS `cursos_irregulares`,`da`.`curso_mayor_dificultad` AS `curso_mayor_dificultad`,`da`.`motivo_dificultad` AS `motivo_dificultad`,(select avg(`sp`.`promedio`) from `semestre_promedio` `sp` where `sp`.`id_alumno` = `a`.`id_alumno`) AS `promedio_general_licenciatura`,(select `sp`.`promedio` from `semestre_promedio` `sp` where `sp`.`id_alumno` = `a`.`id_alumno` order by `sp`.`numero_semestre` desc limit 1) AS `promedio_ultimo_semestre` from ((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `datos_academicos` `da` on(`a`.`id_alumno` = `da`.`id_alumno`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_expediente_alumno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_expediente_alumno` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`a`.`curp` AS `curp`,`a`.`fecha_nacimiento` AS `fecha_nacimiento`,timestampdiff(YEAR,`a`.`fecha_nacimiento`,curdate()) AS `edad`,`a`.`estado_civil` AS `estado_civil`,`a`.`correo_institucional` AS `correo_institucional`,`a`.`correo_personal` AS `correo_personal`,`a`.`celular` AS `celular`,`a`.`telefono_emergencia` AS `telefono_emergencia`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,concat_ws(', ',`d`.`calle`,`d`.`numero`,`d`.`colonia`,`d`.`municipio`,`d`.`estado`) AS `domicilio_completo`,`d`.`municipio` AS `municipio`,`d`.`estado` AS `estado`,`a`.`municipio_nacimiento` AS `municipio_nacimiento`,`a`.`estado_nacimiento` AS `estado_nacimiento`,`a`.`representativo_indigena` AS `representativo_indigena`,`a`.`habla_lengua_indigena` AS `habla_lengua_indigena`,`a`.`lengua_indigena` AS `lengua_indigena`,`a`.`tiene_hijos` AS `tiene_hijos`,`a`.`numero_hijos` AS `numero_hijos`,`a`.`embarazada` AS `embarazada`,`a`.`situacion_personal` AS `situacion_personal`,`u`.`nombre_usuario` AS `nombre_usuario`,`u`.`correo` AS `correo_usuario`,`u`.`activo` AS `cuenta_activa`,`a`.`fecha_registro` AS `fecha_registro` from (((`alumnos` `a` join `usuarios` `u` on(`a`.`id_usuario` = `u`.`id_usuario`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `domicilios` `d` on(`a`.`id_domicilio` = `d`.`id_domicilio`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_expediente_salud`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_expediente_salud` AS SELECT 
    a.id_alumno,
    a.matricula,
    a.nombre_completo,
    l.nombre_licenciatura,
    a.semestre_actual,
    -- Datos de salud
    ds.tipo_sangre,
    ds.afiliacion_seguro_medico,
    ds.numero_seguro_social, 
    ds.alergias,
    ds.tiene_enfermedad,
    ds.nombre_enfermedad,
    a.telefono_emergencia
FROM 
    alumnos a
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
    LEFT JOIN datos_salud ds ON a.id_alumno = ds.id_alumno 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_generacion_activa`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_generacion_activa` AS SELECT 
    a.id_alumno,
    a.matricula,
    a.nombre_completo,
    l.nombre_licenciatura,
    a.semestre_actual,
    a.generacion,
    a.status_alumno,
    (SELECT AVG(promedio) 
     FROM semestre_promedio sp 
     WHERE sp.id_alumno = a.id_alumno) AS promedio_general,
    a.correo_institucional,
    a.celular
FROM 
    alumnos a
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
WHERE 
    a.generacion = (SELECT MAX(generacion) FROM alumnos)
    AND a.status_alumno = 'Activo'
ORDER BY 
    l.nombre_licenciatura, a.nombre_completo 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_historial_promedios`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_historial_promedios` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`sp`.`numero_semestre` AS `numero_semestre`,`sp`.`promedio` AS `promedio`,`sp`.`fecha_registro` AS `fecha_registro`,(select avg(`sp2`.`promedio`) from `semestre_promedio` `sp2` where `sp2`.`id_alumno` = `sp`.`id_alumno` and `sp2`.`numero_semestre` <= `sp`.`numero_semestre`) AS `promedio_acumulado` from ((`semestre_promedio` `sp` join `alumnos` `a` on(`sp`.`id_alumno` = `a`.`id_alumno`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) order by `a`.`nombre_completo`,`sp`.`numero_semestre` 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_incidentes_alumno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_incidentes_alumno` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,`i`.`tipo_incidente` AS `tipo_incidente`,`i`.`fecha_incidente` AS `fecha_incidente`,`i`.`descripcion` AS `descripcion`,`i`.`estado_incidente` AS `estado_incidente`,`d`.`nombre_completo` AS `reportado_por_docente`,`d`.`area_asignada` AS `area_docente`,`i`.`fecha_registro` AS `fecha_registro` from (((`incidentes` `i` join `alumnos` `a` on(`i`.`id_alumno` = `a`.`id_alumno`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `docentes` `d` on(`i`.`id_docente` = `d`.`id_docente`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_movilidad_academica`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_movilidad_academica` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`ma`.`nombre_programa` AS `nombre_programa`,`ma`.`lugar` AS `lugar`,`ma`.`fecha_inicio` AS `fecha_inicio`,`ma`.`fecha_fin` AS `fecha_fin`,to_days(`ma`.`fecha_fin`) - to_days(`ma`.`fecha_inicio`) AS `dias_duracion`,`ma`.`relato_experiencia` AS `relato_experiencia` from ((`movilidad_academica` `ma` join `alumnos` `a` on(`ma`.`id_alumno` = `a`.`id_alumno`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_practicas_alumno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_practicas_alumno` AS SELECT 
    p.id_practica,
    a.id_alumno,
    a.matricula,
    a.nombre_completo,
    l.nombre_licenciatura,
    p.periodo_escolar,
    p.semestre_cursado,
    p.nombre_escuela,
    p.cct_escuela,
    p.nivel_educativo,
    CONCAT(p.municipio, ', ', p.estado) as ubicacion,
    p.fecha_inicio,
    p.fecha_fin,
    DATEDIFF(p.fecha_fin, p.fecha_inicio) as dias_practica,
    p.horas_totales,
    p.habilidades_desarrolladas,
    p.calificacion_obtenida,
    p.tutor_asignado,
    p.sigue_orientacion_reglamento,
    p.tiene_incidentes,
    p.situacion,
    p.fecha_registro
FROM 
    practicas_profesionales p
    INNER JOIN alumnos a ON p.id_alumno = a.id_alumno
    INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
ORDER BY 
    p.fecha_inicio DESC 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_practicas_profesionales`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_practicas_profesionales` AS select `p`.`id_practica` AS `id_practica`,`a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,`p`.`periodo_escolar` AS `periodo_escolar`,`p`.`semestre_cursado` AS `semestre_cursado`,`p`.`nombre_escuela` AS `nombre_escuela`,`p`.`cct_escuela` AS `cct_escuela`,`p`.`nivel_educativo` AS `nivel_educativo`,concat(`p`.`municipio`,', ',`p`.`estado`) AS `ubicacion_escuela`,`p`.`fecha_inicio` AS `fecha_inicio`,`p`.`fecha_fin` AS `fecha_fin`,to_days(`p`.`fecha_fin`) - to_days(`p`.`fecha_inicio`) AS `dias_practica`,`p`.`horas_totales` AS `horas_totales`,`p`.`habilidades_desarrolladas` AS `habilidades_desarrolladas`,`p`.`calificacion_obtenida` AS `calificacion_obtenida`,`p`.`tutor_asignado` AS `tutor_asignado`,`p`.`sigue_orientacion_reglamento` AS `sigue_orientacion_reglamento`,`p`.`tiene_incidentes` AS `tiene_incidentes`,`p`.`relato_incidentes` AS `relato_incidentes`,`p`.`observaciones` AS `observaciones`,`p`.`situacion` AS `situacion`,`p`.`fecha_registro` AS `fecha_registro`,`p`.`fecha_actualizacion` AS `fecha_actualizacion` from ((`practicas_profesionales` `p` join `alumnos` `a` on(`p`.`id_alumno` = `a`.`id_alumno`)) join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) order by `a`.`nombre_completo`,`p`.`fecha_inicio` desc 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_resumen_generaciones`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_resumen_generaciones` AS SELECT 
    generacion,
    COUNT(DISTINCT id_alumno) AS total_alumnos,
    COUNT(DISTINCT CASE WHEN status_alumno = 'Activo' THEN id_alumno END) AS activos,
    COUNT(DISTINCT CASE WHEN status_alumno = 'Egresado' THEN id_alumno END) AS egresados,
    COUNT(DISTINCT id_licenciatura) AS licenciaturas_con_alumnos,
    MIN(fecha_ingreso) AS fecha_inicio_generacion,
    MAX(fecha_ingreso) AS fecha_fin_generacion,
    CASE 
        WHEN generacion = YEAR(CURDATE()) THEN 'Generación Actual'
        WHEN generacion = YEAR(CURDATE()) - 1 THEN 'Generación Anterior'
        ELSE CONCAT('Generación ', generacion)
    END AS descripcion_generacion
FROM 
    alumnos
GROUP BY 
    generacion
ORDER BY 
    generacion DESC 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_resumen_practicas_alumno`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_resumen_practicas_alumno` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,count(`p`.`id_practica`) AS `total_practicas`,count(case when `p`.`situacion` = 'Completada' then 1 end) AS `practicas_completadas`,count(case when `p`.`situacion` = 'En curso' then 1 end) AS `practicas_en_curso`,count(case when `p`.`situacion` = 'Cancelada' then 1 end) AS `practicas_canceladas`,sum(`p`.`horas_totales`) AS `horas_totales_acumuladas`,avg(`p`.`calificacion_obtenida`) AS `promedio_calificaciones`,count(case when `p`.`tiene_incidentes` = 1 then 1 end) AS `practicas_con_incidentes`,min(`p`.`fecha_inicio`) AS `primera_practica_fecha`,max(`p`.`fecha_fin`) AS `ultima_practica_fecha` from ((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `practicas_profesionales` `p` on(`a`.`id_alumno` = `p`.`id_alumno`)) group by `a`.`id_alumno`,`a`.`matricula`,`a`.`nombre_completo`,`l`.`nombre_licenciatura`,`a`.`semestre_actual` order by `a`.`nombre_completo` 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_seguimiento_completitud`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_seguimiento_completitud` AS SELECT 
    a.id_alumno,
    a.matricula,
    a.nombre_completo,
    l.nombre_licenciatura,
    a.semestre_actual,
    a.generacion,
    
    COALESCE(c.completitud_datos_personales, 0) AS datos_personales,
    COALESCE(c.completitud_datos_salud, 0) AS datos_salud,
    COALESCE(c.completitud_datos_academicos, 0) AS datos_academicos,
    COALESCE(c.completitud_datos_socioeconomicos, 0) AS datos_socioeconomicos,
    COALESCE(c.completitud_familiares, 0) AS familiares,
    COALESCE(c.completitud_documentos, 0) AS documentos,
    COALESCE(c.completitud_habilidades, 0) AS habilidades,
    c.completitud_practicas AS practicas,
    c.completitud_certificaciones AS certificaciones,
    c.completitud_movilidad AS movilidad,
    c.completitud_becas AS becas,
    
    COALESCE(c.porcentaje_total, 0) AS porcentaje_completitud,
    COALESCE(c.nivel_completitud, 'Vacío') COLLATE utf8mb4_unicode_ci AS nivel_completitud,
    
    CASE 
        WHEN COALESCE(c.porcentaje_total, 0) = 0 THEN 'Sin Iniciar'
        WHEN COALESCE(c.porcentaje_total, 0) < 60 THEN 'Urgente'
        WHEN COALESCE(c.porcentaje_total, 0) < 100 THEN 'Falta Poco'
        ELSE 'Completo'
    END COLLATE utf8mb4_unicode_ci AS prioridad,
    
    (
        (CASE WHEN COALESCE(c.completitud_datos_personales, 0) < 100 THEN 1 ELSE 0 END) +
        (CASE WHEN COALESCE(c.completitud_datos_salud, 0) < 100 THEN 1 ELSE 0 END) +
        (CASE WHEN COALESCE(c.completitud_datos_academicos, 0) < 100 THEN 1 ELSE 0 END) +
        (CASE WHEN COALESCE(c.completitud_datos_socioeconomicos, 0) < 100 THEN 1 ELSE 0 END) +
        (CASE WHEN COALESCE(c.completitud_familiares, 0) < 100 THEN 1 ELSE 0 END) +
        (CASE WHEN COALESCE(c.completitud_documentos, 0) < 100 THEN 1 ELSE 0 END) +
        (CASE WHEN COALESCE(c.completitud_habilidades, 0) < 100 THEN 1 ELSE 0 END)
    ) AS secciones_pendientes,
    
    c.fecha_calculo
    
FROM alumnos a
INNER JOIN licenciaturas l ON a.id_licenciatura = l.id_licenciatura
LEFT JOIN completitud_expediente c ON a.id_alumno = c.id_alumno
WHERE a.status_alumno IN ('Activo', 'Regular', 'Irregular')
ORDER BY 
    CASE 
        WHEN COALESCE(c.porcentaje_total, 0) < 60 THEN 1
        WHEN COALESCE(c.porcentaje_total, 0) < 100 THEN 2
        ELSE 3
    END,
    l.nombre_licenciatura,
    a.nombre_completo 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_situacion_socioeconomica`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_situacion_socioeconomica` AS select `a`.`id_alumno` AS `id_alumno`,`a`.`matricula` AS `matricula`,`a`.`nombre_completo` AS `nombre_completo`,`l`.`nombre_licenciatura` AS `nombre_licenciatura`,`a`.`semestre_actual` AS `semestre_actual`,`dse`.`recursos_economicos` AS `recursos_economicos`,`dse`.`dependencia_economica` AS `dependencia_economica`,`dse`.`alguien_depende_ti` AS `alguien_depende_ti`,`dse`.`trabaja` AS `trabaja`,`dse`.`lugar_trabajo` AS `lugar_trabajo`,`dse`.`horario_trabajo` AS `horario_trabajo`,`dse`.`renta_fuera_domicilio` AS `renta_fuera_domicilio`,(select group_concat(`b`.`nombre_beca` separator ', ') from `becas` `b` where `b`.`id_alumno` = `a`.`id_alumno` and `b`.`activa` = 1) AS `becas_activas`,(select count(0) from `becas` `b` where `b`.`id_alumno` = `a`.`id_alumno` and `b`.`activa` = 1) AS `numero_becas_activas` from ((`alumnos` `a` join `licenciaturas` `l` on(`a`.`id_licenciatura` = `l`.`id_licenciatura`)) left join `datos_socioeconomicos` `dse` on(`a`.`id_alumno` = `dse`.`id_alumno`)) 
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vista_usuarios_permisos`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vista_usuarios_permisos` AS select `u`.`id_usuario` AS `id_usuario`,`u`.`nombre_usuario` AS `nombre_usuario`,`u`.`correo` AS `correo`,`r`.`nombre_rol` AS `nombre_rol`,`u`.`activo` AS `activo`,`u`.`fecha_registro` AS `fecha_registro`,group_concat(`p`.`nombre_permiso` separator ', ') AS `permisos` from (((`usuarios` `u` join `roles` `r` on(`u`.`id_rol` = `r`.`id_rol`)) left join `rol_permiso` `rp` on(`r`.`id_rol` = `rp`.`id_rol`)) left join `permisos` `p` on(`rp`.`id_permiso` = `p`.`id_permiso`)) group by `u`.`id_usuario`,`u`.`nombre_usuario`,`u`.`correo`,`r`.`nombre_rol`,`u`.`activo`,`u`.`fecha_registro` 
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

