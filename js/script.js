
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

    // 2. AÑO AUTOMÁTICO DEL PIE DE PÁGINA

    const anio = document.querySelector("#anio");

    if (anio) {
        anio.textContent = new Date().getFullYear();
    }

});
