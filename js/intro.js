// =========================================
// INTRO DE ENTRADA (js/intro.js)
// =========================================
(function () {
    const html = document.documentElement;
    const intro = document.getElementById("intro");

    if (!intro) return;

    // Si ya la vio en esta visita (o falta el script del <head>), no se muestra
    if (!html.classList.contains("con-intro")) {
        intro.hidden = true;
        return;
    }

    const reducir =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fotos = Array.from(intro.querySelectorAll(".foto"));
    const zona = intro.querySelector(".arranque");
    const boton = intro.querySelector(".power");
    const mensaje = intro.querySelector("#intro-msg");

    // Mientras dura la intro, la web de detrás no recibe foco con el teclado
    const contenido = Array.from(document.body.children).filter(
        (el) => el !== intro && !["SCRIPT", "NOSCRIPT"].includes(el.tagName)
    );
    contenido.forEach((el) => el.setAttribute("inert", ""));

    let temporizadores = [];
    const esperar = (accion, ms) => {
        temporizadores.push(setTimeout(accion, ms));
    };

    // 1. Las fotos entran una encima de otra
    const paso = reducir ? 0 : 2200;

    fotos.forEach((foto, i) => {
        esperar(() => {
            if (i > 0) fotos[i - 1].classList.add("atras");
            foto.classList.add("entra");
        }, 600 + i * paso);
    });

    // 2. Aparece el botón de arranque
    esperar(() => {
        zona.classList.add("listo");
        boton.focus({ preventScroll: true });
    }, 600 + fotos.length * paso);

    // 3. Entrar a la web
    function entrar() {
        if (intro.classList.contains("salida")) return;

        temporizadores.forEach(clearTimeout);
        temporizadores = [];

        try {
            sessionStorage.setItem("introVista", "1");
        } catch (error) {
            // Si el navegador no deja guardar, no pasa nada
        }

        intro.classList.add("salida");

        setTimeout(() => {
            intro.hidden = true;
            html.classList.remove("con-intro");
            html.classList.add("sin-intro");
            contenido.forEach((el) => el.removeAttribute("inert"));
            window.scrollTo(0, 0);
            document.dispatchEvent(new Event("intro:fin"));
        }, reducir ? 0 : 900);
    }

    // Botón de arranque
    boton.addEventListener("click", () => {
        if (zona.classList.contains("on")) return;
        zona.classList.add("on");

        const lineas = [
            "Iniciando sistema…",
            "Cargando perfil…",
            "Acceso concedido"
        ];

        lineas.forEach((texto, i) => {
            esperar(() => {
                mensaje.textContent = texto;
            }, i * 750);
        });

        esperar(entrar, lineas.length * 750 + 400);
    });

    // Saltar la intro
    intro.querySelector(".saltar").addEventListener("click", entrar);

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") entrar();
    });
})();
