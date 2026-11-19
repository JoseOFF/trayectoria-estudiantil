// ============================================
// ACCIONES - DELEGACIÓN DE EVENTOS DE CLIC
// Sistema de Gestión de Expedientes Estudiantiles
// ============================================
// Reemplaza los onclick="..." escritos dentro del HTML. En lugar de código,
// los botones llevan atributos de datos que el navegador nunca ejecuta:
//
//   <button data-accion="ExpedienteView.eliminarBeca"
//           data-args="${Acciones.args(beca.id_beca)}">
//
// Un único listener en el documento lee esos atributos y llama a la función.
// Así la política de seguridad (CSP) puede prohibir todo JavaScript dentro
// del HTML: si alguien logra inyectar un onerror="...", no se ejecuta.

const Acciones = (() => {
    // Solo se pueden llamar funciones de estos objetos del sistema
    const OBJETOS_PERMITIDOS = [
        'Router',
        'PasswordManager',
        'AlumnoView',
        'CargaMasivaView',
        'DashboardView',
        'DocumentosView',
        'ExpedienteView',
        'InvitadosView',
        'PortalAlumnoView',
        'ReportesView',
        'SeguridadView',
        'UsuariosView'
    ];

    /**
     * Convierte los argumentos a JSON listo para ir dentro de un atributo HTML.
     * Uso en una plantilla: data-args="${Acciones.args(id, nombre)}"
     * Los textos con comillas, apóstrofos o < > ya no rompen el HTML.
     */
    const args = (...valores) => JSON.stringify(valores)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const alHacerClic = (evento) => {
        const elemento = evento.target.closest('[data-accion]');
        if (!elemento) return;

        const accion = elemento.dataset.accion;
        const [nombreObjeto, nombreMetodo, ...resto] = accion.split('.');

        if (resto.length > 0 || !OBJETOS_PERMITIDOS.includes(nombreObjeto)) {
            console.warn(`Acción no permitida: ${accion}`);
            return;
        }

        const objeto = window[nombreObjeto];
        const metodo = objeto && objeto[nombreMetodo];
        if (typeof metodo !== 'function') {
            console.warn(`Acción no encontrada: ${accion}`);
            return;
        }

        // En los enlaces, evitar que el navegador siga el href
        if (elemento.tagName === 'A') {
            evento.preventDefault();
        }

        let parametros = [];
        if (elemento.dataset.args) {
            try {
                parametros = JSON.parse(elemento.dataset.args);
            } catch (error) {
                console.error(`Argumentos inválidos en la acción ${accion}`, error);
                return;
            }
        }

        metodo.apply(objeto, parametros);
    };

    document.addEventListener('click', alHacerClic);

    return { args };
})();

window.Acciones = Acciones;
