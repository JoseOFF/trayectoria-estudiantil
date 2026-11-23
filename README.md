# Trayectoria Estudiantil: Sistema de Expedientes Estudiantiles

[![CI](https://github.com/JoseOFF/trayectoria-estudiantil/actions/workflows/ci.yml/badge.svg)](https://github.com/JoseOFF/trayectoria-estudiantil/actions/workflows/ci.yml)

Gestor web de expedientes para una escuela. Concentra en un solo lugar la información personal, académica, de salud, familiar y socioeconómica de cada alumno, junto con sus documentos, calificaciones, becas, movilidad, prácticas profesionales e incidentes. El acceso a cada expediente depende del rol de quien entra.

Los datos de la institución (nombre, ubicación, correo, teléfono y horario) se configuran en un archivo `.env`, así que el sistema se puede adaptar a cualquier escuela sin tocar el código.

## Funcionalidades

**Por rol**

| Rol | Qué puede hacer |
|---|---|
| Administrador | Todo: usuarios, docentes, alumnos, expedientes completos, documentos, reportes, completitud, roles y permisos, auditoría. |
| Docente | Ver y trabajar los expedientes de los alumnos de las licenciaturas que tiene asignadas. |
| Alumno | Consultar y completar su propio expediente desde su portal, y subir sus documentos. |
| Invitado | Solo lectura, limitada a las licenciaturas y secciones del expediente que se le asignen. |

**Módulos**

- **Expediente del alumno:** datos personales, domicilio, salud, familiares, datos académicos y socioeconómicos, desempeño, habilidades, certificaciones, calificaciones por semestre, becas, movilidad académica, prácticas profesionales e incidentes.
- **Documentos:** subida de PDF, imágenes, Word y Excel (10 MB por archivo por defecto), con vista previa y descarga.
- **Alta de alumnos:** individual o por **carga masiva** desde un Excel (con plantilla descargable). Genera matrícula y usuario automáticamente.
- **Reportes:** listas, alumnos en riesgo, expedientes incompletos, estadísticas y un **reporte personalizado** con los campos que elijas, en PDF y Excel. También genera el expediente individual en PDF.
- **Completitud:** porcentaje de llenado de cada expediente y qué secciones faltan.
- **Seguridad:** permisos por rol, historial de auditoría de cambios y gestión de contraseñas.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Backend | Node.js, Express 4, mysql2, JSON Web Tokens, bcryptjs, multer, helmet, express-rate-limit |
| Base de datos | MariaDB 11 |
| Frontend | HTML y JavaScript sin framework (SPA), Bootstrap 5, Bootstrap Icons, Chart.js, SweetAlert2 |
| Documentos | pdfkit (PDF), exceljs (Excel) |

El Backend también sirve el Frontend: con un solo servidor corriendo se usa todo el sistema.

## Estructura del proyecto

```
├── Backend/
│   ├── config/          Conexión a la base de datos y configuración de JWT
│   ├── controllers/     Lógica de cada módulo
│   ├── middleware/      Autenticación, permisos por alumno y subida de archivos
│   ├── models/          Consultas a la base de datos
│   ├── routes/          Rutas de la API (/api/...)
│   ├── scripts/         crear-admin.js (primer administrador)
│   ├── utils/           Generadores de PDF y Excel, ayudas compartidas
│   ├── uploads/         Archivos subidos (se crea solo; no se versiona)
│   ├── .env.example     Plantilla de configuración
│   └── server.js        Punto de entrada
├── Frontend/
│   ├── index.html
│   └── assets/          css/, js/ (core, components, views, utils)
└── sql/
    └── estructura_limpia.sql   Estructura completa de la base, sin datos de personas
```

## Requisitos

- **Node.js** 18 o superior (probado con Node.js 26) y npm.
- **MariaDB** 11 (probado con 11.8).
- Git, para clonar el repositorio.

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/JoseOFF/trayectoria-estudiantil.git
cd trayectoria-estudiantil
```

### 2. Crear la base de datos

El archivo `sql/estructura_limpia.sql` crea la base `expedientes_estudiantiles` con todas sus tablas, vistas, funciones y procedimientos. También carga los catálogos mínimos: roles, permisos, licenciaturas y un plantel de ejemplo. Ejecútalo con un usuario administrador de MariaDB:

```bash
mysql -u root -p < sql/estructura_limpia.sql
```

### 3. Crear un usuario de base de datos para el sistema

No conectes el sistema con `root`. Crea un usuario que solo pueda leer, escribir y ejecutar procedimientos:

```sql
CREATE USER 'app_expedientes'@'localhost' IDENTIFIED BY 'una_contraseña_segura';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON expedientes_estudiantiles.* TO 'app_expedientes'@'localhost';
FLUSH PRIVILEGES;
```

El nombre `app_expedientes` es solo un ejemplo; puedes usar el que quieras.

### 4. Configurar el `.env`

```bash
cd Backend
cp .env.example .env
```

Edita `Backend/.env` con tus valores. Como mínimo necesitas:

- `DB_USER` y `DB_PASSWORD`: el usuario del paso 3.
- `JWT_SECRET`: un valor largo y aleatorio. Puedes generarlo así:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `CORS_ORIGIN`: la dirección desde la que se abre el sistema (`http://localhost:3000` en local).

La tabla completa de variables está en [Variables de entorno](#variables-de-entorno).

### 5. Instalar las dependencias

```bash
npm ci
```

### 6. Crear el primer administrador

```bash
npm run crear-admin
```

El script pide nombre, correo y contraseña. La contraseña no se muestra mientras la escribes, se pide dos veces y debe tener al menos 8 caracteres.

### 7. Iniciar el servidor

```bash
npm run dev     # desarrollo: se reinicia solo al guardar cambios
npm start       # sin reinicio automático
```

Abre **http://localhost:3000** y entra con el administrador que creaste. Para comprobar que el servidor y la base responden, visita `http://localhost:3000/api/health`.

### Personalizar los catálogos

Las licenciaturas y el plantel que trae `estructura_limpia.sql` son de ejemplo. Edítalos directamente en las tablas `licenciaturas` y `planteles` para que coincidan con tu escuela.

## Variables de entorno

Todas están documentadas en [`Backend/.env.example`](Backend/.env.example).

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | | Puerto del servidor (por defecto 3000). |
| `NODE_ENV` | | `development` muestra el detalle de los errores; usa `production` en producción. |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Sí (`DB_PORT` no) | Conexión a MariaDB. |
| `DB_USER`, `DB_PASSWORD` | Sí | Usuario de la base (ver paso 3). |
| `DB_CONNECTION_LIMIT`, `DB_QUEUE_LIMIT` | | Tamaño del pool de conexiones. |
| `JWT_SECRET` | Sí | Secreto para firmar las sesiones. Sin él, el servidor no arranca. |
| `JWT_EXPIRE`, `JWT_REFRESH_EXPIRE` | | Duración de la sesión (24 h) y de la renovación (7 días). |
| `CORS_ORIGIN` | Sí | Orígenes permitidos, separados por coma. |
| `MAX_FILE_SIZE` | | Tamaño máximo por archivo en bytes (10 MB por defecto). |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | | Límite general de peticiones a la API. |
| `BCRYPT_ROUNDS` | | Costo del cifrado de contraseñas (10 por defecto). |
| `LOG_LEVEL` | | Formato de los registros de peticiones (`dev`, `combined`...). |
| `INSTITUTION_NAME` | | Nombre de la escuela: login, pie de página y PDF. |
| `INSTITUTION_LOCATION`, `INSTITUTION_EMAIL`, `INSTITUTION_PHONE`, `INSTITUTION_HOURS` | | Datos de contacto del pie de página y de los PDF. Si una queda vacía, esa línea no se muestra. |
| `SYSTEM_USER_EMAIL` | | Correo del usuario interno "Sistema", que recibe el historial de las personas eliminadas (`sistema@sistema.local` por defecto). |
| `BACKUP_SCRIPT` | | Ruta del script que ejecuta el botón de respaldo manual. Vacío = respaldo manual desactivado. |

## Scripts

Se ejecutan dentro de `Backend/`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor con nodemon (reinicio automático). |
| `npm start` | Inicia el servidor con Node. |
| `npm run crear-admin` | Crea un usuario administrador de forma interactiva. |

## Base de datos

`sql/estructura_limpia.sql` contiene **26 tablas, 27 vistas, 8 funciones y 19 procedimientos almacenados**, y ningún dato de personas.

| Grupo | Tablas |
|---|---|
| Usuarios y permisos | `usuarios`, `roles`, `permisos`, `rol_permiso`, `permisos_invitado`, `historial_cambios` |
| Expediente del alumno | `alumnos`, `domicilios`, `familiares`, `datos_salud`, `datos_socioeconomicos`, `datos_academicos`, `desempeno_academico`, `semestre_promedio`, `alumno_habilidad`, `certificaciones`, `becas`, `movilidad_academica`, `practicas_profesionales`, `incidentes`, `documentos`, `completitud_expediente` |
| Docentes y catálogos | `docentes`, `docente_licenciatura`, `licenciaturas`, `planteles` |

Cada usuario tiene un rol. Los alumnos y los docentes se ligan a su usuario por `id_usuario`, y los docentes ven solo las licenciaturas asignadas en `docente_licenciatura`. `historial_cambios` registra quién cambió qué y cuándo.

## Seguridad

- Contraseñas cifradas con bcrypt. El login limita los intentos fallidos por IP y correo (10 cada 15 minutos).
- Sesiones con JWT. En cada petición se revisa que el usuario siga existiendo y activo, con los datos de la base y no los del token.
- Control de acceso por alumno: cada expediente, documento y reporte valida que quien lo pide tenga derecho a ver a ese alumno.
- Cabeceras de seguridad con helmet y una Content Security Policy que no permite JavaScript dentro del HTML. Todo el texto que viene de la base se escapa antes de mostrarse.
- Archivos subidos: se aceptan solo tipos permitidos. La extensión se decide según el tipo real y nunca según el nombre que envía el usuario.
- En producción (`NODE_ENV=production`) los errores no exponen detalles internos.
- El `.env`, los archivos subidos y los respaldos están excluidos de Git.

Si encuentras una vulnerabilidad, repórtala de forma privada al autor en lugar de abrir un issue público.

## Despliegue en producción

El sistema puede desplegarse en un servidor **Linux** y publicarse en internet con **Cloudflare Tunnel**, sin abrir puertos del servidor. `server.js` ya confía en los rangos de IP de Cloudflare (`trust proxy`), así que la IP real de cada visitante llega bien al límite de intentos del login y a los registros.

Recomendaciones generales:

- `NODE_ENV=production` y un `JWT_SECRET` propio y distinto al de desarrollo.
- El usuario de base de datos con permisos mínimos (paso 3).
- `npm ci --omit=dev` para instalar sin las herramientas de desarrollo.
- Un administrador de procesos (por ejemplo systemd o pm2) para que el servidor se reinicie solo.
- `CORS_ORIGIN` con el dominio público del sistema.

## Limitaciones conocidas

- **Respaldo manual:** el botón de respaldo de la pantalla Seguridad ejecuta el script que indique `BACKUP_SCRIPT`. El script no forma parte de este repositorio: debes escribir el tuyo (por ejemplo, con `mysqldump` y una copia de `Backend/uploads/`). Mientras no esté configurado, el botón avisa que el respaldo manual no está disponible.
- Algunas vistas del Frontend son archivos muy grandes; está pendiente dividirlas.

## Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE).

## Autor

[JoseOFF](https://github.com/JoseOFF)
