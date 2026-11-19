// ============================================
// CREAR USUARIO ADMINISTRADOR
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================
// Crea el primer Administrador después de instalar la base de datos limpia.
// Uso (desde la carpeta Backend):  npm run crear-admin
// Los datos se piden en la terminal; la contraseña no se muestra al escribirla.

require('dotenv').config();
const readline = require('readline');
const { pool, closePool } = require('../config/database');
const Usuario = require('../models/usuario.model');

const LONGITUD_MINIMA = 8;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pregunta normal (el texto se ve)
const preguntar = (rl, texto) => new Promise((resolve) => rl.question(texto, (r) => resolve(r.trim())));

// Pregunta oculta: muestra * en lugar de cada carácter
const preguntarOculto = (texto) => new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(texto);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let valor = '';
    const alTeclear = (bloque) => {
        // Un "bloque" puede traer varios caracteres (por ejemplo, al pegar)
        for (const caracter of bloque) {
            if (caracter === '\r' || caracter === '\n') {
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener('data', alTeclear);
                process.stdout.write('\n');
                return resolve(valor);
            }
            if (caracter === '\u0003') {               // Ctrl + C
                process.stdout.write('\nCancelado.\n');
                process.exit(1);
            }
            if (caracter === '\u0008' || caracter === '\u007f') {   // Retroceso
                if (valor.length > 0) {
                    valor = valor.slice(0, -1);
                    process.stdout.write('\b \b');
                }
                continue;
            }
            valor += caracter;
            process.stdout.write('*');
        }
    };
    stdin.on('data', alTeclear);
});

const main = async () => {
    console.log('\n=== Crear usuario Administrador ===\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const nombre = await preguntar(rl, 'Nombre de usuario: ');
    const correo = (await preguntar(rl, 'Correo: ')).toLowerCase();
    rl.close();

    if (!nombre) throw new Error('El nombre de usuario es obligatorio');
    if (!FORMATO_CORREO.test(correo)) throw new Error('El correo no tiene un formato válido');
    if (await Usuario.findByEmail(correo)) throw new Error('Ya existe un usuario con ese correo');

    const contrasena = await preguntarOculto(`Contraseña (mínimo ${LONGITUD_MINIMA} caracteres): `);
    if (contrasena.length < LONGITUD_MINIMA) {
        throw new Error(`La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres`);
    }
    const confirmacion = await preguntarOculto('Repite la contraseña: ');
    if (contrasena !== confirmacion) throw new Error('Las contraseñas no coinciden');

    // El id del rol se busca por nombre: no depende de que Administrador sea el 1
    const [roles] = await pool.execute(
        "SELECT id_rol FROM roles WHERE nombre_rol = 'Administrador'"
    );
    if (roles.length === 0) {
        throw new Error('No existe el rol Administrador. ¿Cargaste sql/estructura_limpia.sql?');
    }

    // Mismo método que usa el módulo de Usuarios (cifra la contraseña con bcrypt)
    const nuevo = await Usuario.create({
        id_rol: roles[0].id_rol,
        nombre_usuario: nombre,
        correo,
        contrasena
    });

    console.log(`\nAdministrador creado (id ${nuevo.id_usuario}): ${correo}`);
};

main()
    .catch((error) => {
        console.error(`\nNo se creó el usuario: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => closePool());
