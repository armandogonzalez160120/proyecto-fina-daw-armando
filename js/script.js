
/* Referencias a los elementos HTML */
const formularioBusqueda = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");
const contenedorObras = document.getElementById("obras");
const seccionResultados = document.getElementById("seccion-respuestas");

// La sección de resultados permanece oculta al cargar la página
seccionResultados.style.display = "none";

// Variable donde se guarda el contenido de las obras encontradas
let salida = "";

// Al enviar el formulario se ejecuta la función buscarObras
formularioBusqueda.addEventListener("submit", buscarObras);

// Función para realizar la búsqueda de obras de arte
async function buscarObras(evento) {

    // Evita que la página se recargue al presionar Buscar
    evento.preventDefault();

    // Guarda el texto escrito sin los espacios sobrantes
    const termino = campoBusqueda.value.trim();

    // Limpia cualquier mensaje de error anterior
    errorBusqueda.textContent = "";

    // Si el campo está vacío, aparece un mensaje y se detiene la búsqueda
    if (!termino) {
        errorBusqueda.textContent = "Proporciona la cadena de búsqueda.";
        campoBusqueda.focus();
        return;
    }

    // Identifica cuál de las opciones de búsqueda está seleccionada
    const opcionSeleccionada = formularioBusqueda.querySelector('input[name="criterio"]:checked');

    // Guarda el valor de la opción seleccionada
    const criterio = opcionSeleccionada.value;

    // La promesa permite manejar la respuesta de la API
    const promesaObras = new Promise(function (resolve, reject) {

        // Objeto utilizado para realizar la petición al servidor
        let solicitudObras = new XMLHttpRequest();

        // Dirección de la API donde se consultan las obras de arte
        let peticionObras = "https://www.promociones.pescaderiaelcharco.com/obras/";

        // Agrega a la dirección el tipo de búsqueda y el texto ingresado
        peticionObras = peticionObras + "?" + criterio + "=" + encodeURIComponent(termino);

        // Prepara la petición GET para consultar la información
        solicitudObras.open("GET", peticionObras);

        // Comprueba si la respuesta del servidor fue correcta
        solicitudObras.onload = function () {

            if (solicitudObras.status >= 200 && solicitudObras.status < 300) {

                try {
                    resolve(JSON.parse(solicitudObras.responseText));
                } catch (error) {
                    reject("La respuesta del servidor no es válida.");
                }

            } else {
                reject("Error al consultar la API.");
            }

        };

        // Si ocurre un problema de conexión, la promesa se rechaza
        solicitudObras.onerror = function () {
            reject("Error de conexión con el servidor.");
        };

        // Envía la petición al servidor
        solicitudObras.send();

    });

    // Espera hasta recibir la respuesta de la API
    try {

        const obras = await promesaObras;
        console.log(obras);

        // Limpia el contenido de la búsqueda anterior
        salida = "";

        // Comprueba si la API devolvió una lista con obras
        if (Array.isArray(obras) && obras.length > 0) {

            // Recorre cada una de las obras encontradas
            obras.forEach(function (obra) {

                // Forma la dirección completa de la imagen
                let imagenObra = "https://www.promociones.pescaderiaelcharco.com/obras" + obra.imagen;

                // Guarda una tarjeta con la información de cada obra
                salida += `
                    <div class="resultado-obra mb-4">
                        <div class="row">

                            <div class="col-12 col-md-6">
                                <img src="${imagenObra}"
                                     class="img-fluid w-100"
                                     alt="${obra.titulo}">
                            </div>

                            <div class="col-12 col-md-6">
                                <h3>${obra.titulo}</h3>

                                <p>${obra.descripcion}</p>

                                <p><strong>Artista:</strong> ${obra.artista || "Desconocido"}</p>

                                <p><strong>Año:</strong> ${obra.anio ?? "No disponible"}</p>

                                <p><strong>Tipo:</strong> ${obra.tipo || "No disponible"}</p>

                                <p><strong>Movimiento:</strong> ${obra.movimiento || "No disponible"}</p>
                            </div>

                        </div>
                    </div>
                `;

            });

        } else {

            // Si no hay coincidencias, aparece un mensaje en lugar de las tarjetas
            salida = "<p>No se encontraron obras que coincidan con la búsqueda.</p>";

        }

        // Coloca las tarjetas en la página y hace visible la sección
        contenedorObras.innerHTML = salida;
        seccionResultados.style.display = "block";

    } catch (error) {

        // Si falla la búsqueda, aparece un aviso y se eliminan los resultados anteriores
        console.log(error);
        salida = "";
        contenedorObras.innerHTML = salida;
        errorBusqueda.textContent = "No se pudo realizar la búsqueda. Revisa la conexión con el servidor.";
        seccionResultados.style.display = "none";

    }

}
