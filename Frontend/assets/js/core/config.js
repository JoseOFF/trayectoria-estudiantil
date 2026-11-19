// ============================================
// CONFIGURACIÓN PÚBLICA DE LA INSTITUCIÓN
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================
//
// Los datos de la escuela (nombre, ubicación, correo, teléfono, horario)
// viven en el .env del Backend (INSTITUTION_*). GET /api los entrega y
// aquí se guardan UNA sola vez al iniciar la aplicación (main.js).
// Si un dato no está configurado llega como null y la vista no lo muestra.

const Config = (() => {
    let institucion = {
        nombre: null,
        ubicacion: null,
        correo: null,
        telefono: null,
        horario: null
    };

    /**
     * Pedir los datos al Backend. No necesita sesión.
     * Si falla, la aplicación sigue funcionando sin esos datos.
     */
    const cargar = async () => {
        try {
            // Misma dirección que usa api.js (localhost, red local o Cloudflare)
            const respuesta = await fetch(API.BASE_URL);
            const datos = await respuesta.json();
            if (datos && datos.institucion) {
                institucion = { ...institucion, ...datos.institucion };
            }
        } catch (error) {
            console.warn('No se pudieron cargar los datos de la institución');
        }
    };

    /** Copia de los datos para que nadie los modifique por accidente */
    const getInstitucion = () => ({ ...institucion });

    return {
        cargar,
        getInstitucion
    };
})();

window.Config = Config;
