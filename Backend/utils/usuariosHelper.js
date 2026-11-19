// ============================================
// AYUDAS COMPARTIDAS PARA USUARIOS Y DOCENTES
// ============================================

// Única librería de cifrado del proyecto: bcryptjs (JavaScript puro, no
// necesita compilar nada al instalar). Lee los hashes de la librería
// "bcrypt" nativa que se usaba antes, así que las contraseñas viejas siguen sirviendo.
const bcrypt = require('bcryptjs');

// Costo del cifrado: BCRYPT_ROUNDS del .env (10 si no está definido)
const RONDAS_BCRYPT = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

/**
 * Cifra una contraseña para guardarla en usuarios.contrasena.
 * Es la única forma de cifrar en todo el Backend.
 */
const hashContrasena = (contrasena) => bcrypt.hash(String(contrasena), RONDAS_BCRYPT);

// Correo del usuario interno "Sistema". Se usa para reasignar el historial
// de cambios cuando se borra a una persona; no debe mostrarse en las listas.
// Se puede cambiar con SYSTEM_USER_EMAIL en el .env (por ejemplo, para conservar
// el usuario Sistema que ya existe en una instalación anterior).
const CORREO_SISTEMA = process.env.SYSTEM_USER_EMAIL || 'sistema@sistema.local';

// La columna usuarios.nombre_usuario es VARCHAR(50)
const LARGO_NOMBRE_USUARIO = 50;

// Mensaje para cada llave UNIQUE de la base de datos
const MENSAJES_DUPLICADO = {
    nombre_usuario: 'Ya existe un usuario con ese nombre',
    correo: 'El correo ya está registrado',
    curp: 'La CURP ya está registrada',
    matricula: 'La matrícula ya está registrada',
    correo_institucional: 'El correo institucional ya está registrado',
    correo_personal: 'El correo personal ya está registrado'
};

/**
 * Traduce un error ER_DUP_ENTRY de MariaDB al campo que se repitió.
 * El mensaje de MariaDB tiene la forma: Duplicate entry 'x' for key 'correo'
 */
const mensajeDuplicado = (error) => {
    const coincidencia = /for key '(?:[\w]+\.)?([\w]+)'/.exec(error.sqlMessage || error.message || '');
    const llave = coincidencia ? coincidencia[1] : null;
    return MENSAJES_DUPLICADO[llave] || 'Ya existe un registro con esos datos';
};

/**
 * Error con código HTTP 409 (conflicto) a partir de un ER_DUP_ENTRY,
 * para que el controlador sepa que no es un error del servidor.
 */
const errorDuplicado = (error) => {
    const nuevo = new Error(mensajeDuplicado(error));
    nuevo.status = 409;
    return nuevo;
};

/**
 * Nombre que se guarda en usuarios.nombre_usuario: sin espacios sobrantes
 * y cortado al largo de la columna.
 */
const nombreUsuarioDesde = (nombre) =>
    String(nombre || '').trim().slice(0, LARGO_NOMBRE_USUARIO);

module.exports = {
    hashContrasena,
    CORREO_SISTEMA,
    LARGO_NOMBRE_USUARIO,
    mensajeDuplicado,
    errorDuplicado,
    nombreUsuarioDesde
};
