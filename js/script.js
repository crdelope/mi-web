
document.addEventListener("DOMContentLoaded", () => {

    // 1. MENÚ DE NAVEGACIÓN

    const botonMenu = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#menu");
    const navegacion = document.querySelector(".navegacion");

    if (botonMenu && menu && navegacion) {

        // Abrir y cerrar al pulsar el botón
        botonMenu.addEventListener("click", () => {
            const estaAbierto =
                botonMenu.getAttribute("aria-expanded") === "true";

            botonMenu.setAttribute(
                "aria-expanded",
                String(!estaAbierto)
            );

            botonMenu.setAttribute(
                "aria-label",
                estaAbierto
                    ? "Abrir menú de navegación"
                    : "Cerrar menú de navegación"
            );

            navegacion.classList.toggle(
                "menu-abierto",
                !estaAbierto
            );
        });

        // Cerrar al seleccionar una opción
        menu.querySelectorAll("a").forEach((enlace) => {
            enlace.addEventListener("click", () => {
                navegacion.classList.remove("menu-abierto");
                botonMenu.setAttribute("aria-expanded", "false");
                botonMenu.setAttribute(
                    "aria-label",
                    "Abrir menú de navegación"
                );
            });
        });

        // Cerrar con Escape
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                navegacion.classList.remove("menu-abierto");
                botonMenu.setAttribute("aria-expanded", "false");
                botonMenu.setAttribute(
                    "aria-label",
                    "Abrir menú de navegación"
                );
                botonMenu.focus();
            }
        });

        // Cerrar al pulsar fuera del menú
        document.addEventListener("click", (evento) => {
            if (!navegacion.contains(evento.target)) {
                navegacion.classList.remove("menu-abierto");
                botonMenu.setAttribute("aria-expanded", "false");
                botonMenu.setAttribute(
                    "aria-label",
                    "Abrir menú de navegación"
                );
            }
        });

        // Restablecer el menú al cambiar el tamaño de ventana
        window.addEventListener("resize", () => {
            if (window.innerWidth > 700) {
                navegacion.classList.remove("menu-abierto");
                botonMenu.setAttribute("aria-expanded", "false");
                botonMenu.setAttribute(
                    "aria-label",
                    "Abrir menú de navegación"
                );
            }
        });
    }
// 3. ANIMACIONES

    const reducirMovimiento =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 3.1 Frase principal que se escribe sola
   const titulo = document.querySelector(".frases-superiores h1");
    let frase = "";
    let escritura = null;

    // Paso 1: dejar el titular vacío (solo el cursor) en cuanto carga la página
    function prepararTitulo() {
        if (!titulo || reducirMovimiento) return;

        frase = titulo.textContent.trim();
        titulo.setAttribute("aria-label", frase);
        titulo.innerHTML =
            '<span class="escritura" aria-hidden="true"></span>' +
            '<span class="cursor" aria-hidden="true"></span>';
        escritura = titulo.querySelector(".escritura");
    }

    // Paso 2: escribir las letras una a una
    function escribirTitulo() {
        if (!escritura) return;

        let i = 0;
        const escribir = setInterval(() => {
            i++;
            escritura.textContent = frase.slice(0, i);
            if (i >= frase.length) clearInterval(escribir);
        }, 45);
    }

    // El titular se vacía ya, pero solo se escribe cuando termina la intro
    prepararTitulo();

    if (document.documentElement.classList.contains("con-intro")) {
        document.addEventListener("intro:fin", escribirTitulo, { once: true });
    } else {
        escribirTitulo();
    }

    // 3.2 Aparición al hacer scroll
    const elementos = document.querySelectorAll(
        ".sobre-texto, .ficha, .tarjeta, .aficion, .objetivo-grid > *"
    );

    if (!reducirMovimiento && "IntersectionObserver" in window) {
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.15 });

        elementos.forEach((el) => {
            const posicion = Array.from(el.parentElement.children).indexOf(el);
            el.style.setProperty("--retardo", Math.min(posicion, 3) * 0.12 + "s");
            el.classList.add("reveal");
            observador.observe(el);
        });
    }
    // 2. AÑO AUTOMÁTICO DEL PIE DE PÁGINA

    const anio = document.querySelector("#anio");

    if (anio) {
        anio.textContent = new Date().getFullYear();
    }

      // 4. MODO OSCURO (botón de la barra lateral)

    const botonTema = document.querySelector("#boton-tema");

    if (botonTema) {
        const raiz = document.documentElement;   // la etiqueta <html>

        // Marca el botón como "pulsado" si el modo oscuro está activado
        const marcarBoton = () => {
            const oscuro = raiz.dataset.tema === "oscuro";
            botonTema.setAttribute("aria-pressed", String(oscuro));
        };

        // Al cargar, refleja el tema que ya puso el script del <head>
        marcarBoton();

        botonTema.addEventListener("click", () => {
            // Si estaba oscuro pasa a claro, y al revés
            const nuevo = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
            raiz.dataset.tema = nuevo;
            marcarBoton();

            try {
                // La libretita del navegador: se acuerda aunque cierres todo
                localStorage.setItem("tema", nuevo);
            } catch (e) {
                // Si el navegador no deja guardar, el cambio vale solo para esta visita
            }
        });
    }
    // 5. FORMULARIO DE CONTACTO
const formulario = document.querySelector("#formulario");
if (formulario) {
    const estado = document.querySelector("#f-estado");
    const botonEnviar = document.querySelector("#f-enviar");

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();               // frena el envío normal
        botonEnviar.disabled = true;           // evita pulsar dos veces
        estado.className = "formulario-estado";
        estado.textContent = "Enviando…";

        try {
            const respuesta = await fetch(formulario.action, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: new FormData(formulario)
            });
            const datos = await respuesta.json();
            if (respuesta.ok && datos.success) {
                estado.textContent = "¡Enviado! Te contesto lo antes posible.";
                estado.classList.add("ok");
                formulario.reset();
            } else {
                throw new Error(datos.message);
            }
        } catch (error) {
            estado.textContent = "No se pudo enviar. Prueba de nuevo o escríbeme por e-mail.";
            estado.classList.add("error");
        } finally {
            botonEnviar.disabled = false;
        }
    });
}

});
