// ============================================
// CONFIGURACIÓN DE CONEXIÓN A MARIADB
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// ============================================
// CONFIGURACIÓN DEL POOL DE CONEXIONES
// ============================================
// Un pool mantiene múltiples conexiones abiertas y las reutiliza

// Variables obligatorias: no tienen valor por defecto para no dejar
// credenciales escritas en el código. Si falta alguna, el servidor no arranca.
const VARIABLES_REQUERIDAS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const faltantes = VARIABLES_REQUERIDAS.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}. Revisa el archivo .env`);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Configuración del pool
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 40, // Máximo de conexiones simultáneas
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 150, // 0 = sin límite de cola
    
    // Configuración de caracteres
    charset: 'utf8mb4',
    
    // Manejo de zonas horarias
    timezone: '-06:00', // Hora de México (CST/CDT)
    
    // Configuración adicional para mejor rendimiento
    waitForConnections: true, 
    enableKeepAlive: true, 
    keepAliveInitialDelay: 0
});

// ============================================
// FUNCIÓN PARA VERIFICAR LA CONEXIÓN
// ============================================
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión exitosa a la base de datos MariaDB');
        console.log(`Base de datos: ${process.env.DB_NAME}`);
        console.log(`  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        
        // Verificar versión de MariaDB
        const [rows] = await connection.query('SELECT VERSION() as version');
        console.log(`Versión de MariaDB: ${rows[0].version}`);
        
        connection.release(); // Liberar la conexión de vuelta al pool
        return true;
    } catch (error) {
        console.error('Error al conectar con la base de datos:');
        console.error(error.message);
        
        // Sugerencias de solución
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\nSugerencia: Verifica el usuario y contraseña en el archivo .env');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\nSugerencia: Asegúrate de que MariaDB esté corriendo en el puerto', process.env.DB_PORT);
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\nSugerencia: La base de datos', process.env.DB_NAME, 'no existe. Ejecuta los scripts SQL primero.');
        }
        
        return false;
    }
};

// ============================================
// FUNCIÓN AUXILIAR PARA EJECUTAR QUERIES
// ============================================

const query = async (sql, params = []) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en query:', error.message);
        throw error;
    }
};

// ============================================
// FUNCIÓN PARA TRANSACCIONES
// ============================================

const transaction = async (callback) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Ejecutar el callback con la conexión
        const result = await callback(connection);
        
        await connection.commit();
        connection.release();
        
        return result;
    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
};

// ============================================
// FUNCIÓN PARA CERRAR EL POOL (al apagar el servidor)
// ============================================
const closePool = async () => {
    try {
        await pool.end();
        console.log('Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('Error al cerrar el pool:', error.message);
    }
};

// ============================================
// MANEJADORES DE EVENTOS DEL POOL
// ============================================

// Solo se avisa cuando se agotan las conexiones del pool y una petición
// tiene que esperar (señal de saturación). Registrar cada conexión
// adquirida/liberada llenaba los logs con dos líneas por consulta.
pool.on('enqueue', () => {
    console.warn('Pool saturado: una petición espera una conexión disponible');
});

// ============================================
// EXPORTAR FUNCIONES Y POOL
// ============================================

module.exports = {
    pool,           // Pool de conexiones para uso directo
    query,          // Función simplificada para queries
    transaction,    // Función para transacciones
    testConnection, // Función para verificar conexión
    closePool       // Función para cerrar pool
};
