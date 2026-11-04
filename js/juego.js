// =========================================
// MINI-JUEGO DEL CHIP (js/juego.js)
// Paso 6: ganar, perder y volver a jugar
// =========================================
(function () {
    const tablero = document.getElementById("tablero");
    const boton = document.getElementById("juego-boton");
    const marcador = document.getElementById("marcador");
    const mensaje = document.getElementById("mensaje");
    const enlace = document.getElementById("juego-enlace");       // NUEVO
    if (!tablero || !boton || !marcador || !mensaje || !enlace) return;
    const panel = tablero.closest(".juego");                       // NUEVO

    // El mapa del circuito. Cada letra es una casilla:
    // #  pared      .  bit      P  inicio del chip      B  inicio de un bug
    const MAPA = [
        "###############",
        "#B...........B#",
        "#.##.#####.##.#",
        "#.............#",
        "#.#.##...##.#.#",
        "#.............#",
        "#.##.#...#.##.#",
        "#.............#",
        "#.#.#######.#.#",
        "#......P......#",
        "###############"
    ];

    const CELDA = 24;                 // lado de cada casilla en el dibujo
    const COLUMNAS = MAPA[0].length;  // 15
    const FILAS = MAPA.length;        // 11
    const NS = "http://www.w3.org/2000/svg";
    const VELOCIDAD = 160;            // milisegundos entre un paso y el siguiente
    const VIDAS_INICIO = 3;           // vidas al empezar

    // Qué tecla mueve hacia dónde (x: derecha o izquierda, y: abajo o arriba)
    const TECLAS = {
        arrowup:    { x: 0,  y: -1 },
        w:          { x: 0,  y: -1 },
        arrowdown:  { x: 0,  y: 1 },
        s:          { x: 0,  y: 1 },
        arrowleft:  { x: -1, y: 0 },
        a:          { x: -1, y: 0 },
        arrowright: { x: 1,  y: 0 },
        d:          { x: 1,  y: 0 }
    };

    // Las cuatro calles que puede tomar un bug en un cruce
    const DIRECCIONES = [
        { x: 0,  y: -1 },
        { x: 0,  y: 1 },
        { x: -1, y: 0 },
        { x: 1,  y: 0 }
    ];

    // El estado del juego: lo que va cambiando mientras juegas
    const chip = { x: 1, y: 1 };           // casilla donde está el chip
    const inicioChip = { x: 1, y: 1 };     // dónde empieza (para volver)
    let direccion = { x: 0, y: 0 };        // hacia dónde va ahora
    let siguiente = null;                  // giro que el jugador ha pedido
    let reloj = null;                      // el temporizador que da los pasos
    let jugando = false;
    let terminado = false;                 // NUEVO: ¿ha acabado la partida?
    let dibujoChip = null;                 // el dibujo del chip en el tablero
    const bits = {};                       // los bits que quedan, por casilla ("3,5")
    let total = 0;                         // cuántos bits hay en total
    let comidos = 0;                       // cuántos se ha comido ya
    let vidas = VIDAS_INICIO;              // vidas que le quedan
    let pasos = 0;                         // pasos que lleva la partida
    const bugs = [];                       // la lista de bugs

    // Busca dónde empiezan el chip (P) y los bugs (B)
    MAPA.forEach((fila, y) => {
        [...fila].forEach((letra, x) => {
            if (letra === "P") {
                chip.x = x;
                chip.y = y;
                inicioChip.x = x;
                inicioChip.y = y;
            } else if (letra === "B") {
                bugs.push({
                    x: x, y: y,                // dónde está ahora
                    inicioX: x, inicioY: y,    // dónde empezó
                    antesX: x, antesY: y,      // dónde estaba en el paso anterior
                    dx: 0, dy: 0,              // hacia dónde iba
                    dibujo: null
                });
            }
        });
    });

    // Crea una etiqueta SVG y le pone sus atributos
    function crear(nombre, atributos) {
        const elemento = document.createElementNS(NS, nombre);
        for (const clave in atributos) {
            elemento.setAttribute(clave, atributos[clave]);
        }
        return elemento;
    }

    // ¿Esa casilla es pared (o está fuera del tablero)?
    function esPared(x, y) {
        return MAPA[y] === undefined ||
               MAPA[y][x] === undefined ||
               MAPA[y][x] === "#";
    }

    // Pone un dibujo (el chip o un bug) en su casilla
    function colocar(dibujo, x, y) {
        dibujo.style.transform = `translate(${x * CELDA}px, ${y * CELDA}px)`;
    }

    // Escribe en el marcador cuántos bits y vidas lleva
    function actualizarMarcador() {
        marcador.textContent = `Bits: ${comidos} / ${total} · Vidas: ${vidas}`;
    }

    // Si en la casilla del chip hay un bit, se lo come
    function comer() {
        const clave = `${chip.x},${chip.y}`;
        const bit = bits[clave];
        if (bit) {
            bit.remove();          // quita el puntito del dibujo
            delete bits[clave];    // y lo borra de la lista
            comidos++;
            actualizarMarcador();

            if (comidos === total) {   // NUEVO: ¿se los ha comido todos?
                ganar();
            }
        }
    }

    // Dibuja un bug (cuerpo, antenas, patas y ojos)
    function dibujarBug(svg, bug) {
        const grupo = crear("g", { class: "bug" });
        grupo.appendChild(crear("path", {
            d: "M9 8 L7 4 M15 8 L17 4 M5 12 L2 11 M5 15 L2 17 M19 12 L22 11 M19 15 L22 17",
            class: "bug-patas"
        }));
        grupo.appendChild(crear("ellipse", {
            cx: 12, cy: 13, rx: 7, ry: 6,
            class: "bug-cuerpo"
        }));
        grupo.appendChild(crear("circle", { cx: 9.5, cy: 11, r: 1.5, class: "bug-ojo" }));
        grupo.appendChild(crear("circle", { cx: 14.5, cy: 11, r: 1.5, class: "bug-ojo" }));
        svg.appendChild(grupo);
        bug.dibujo = grupo;
    }

    function dibujarTablero() {
        const svg = crear("svg", {
            viewBox: `0 0 ${COLUMNAS * CELDA} ${FILAS * CELDA}`,
            class: "juego-svg",
            role: "img",
            "aria-label": "Tablero del juego: un circuito con bits para el chip"
        });

        // Recorre el mapa fila a fila y letra a letra
        MAPA.forEach((fila, y) => {
            [...fila].forEach((letra, x) => {
                if (letra === "#") {
                    svg.appendChild(crear("rect", {
                        x: x * CELDA + 1,
                        y: y * CELDA + 1,
                        width: CELDA - 2,
                        height: CELDA - 2,
                        rx: 5,
                        class: "pared"
                    }));
                } else if (letra === ".") {
                    const bit = crear("circle", {
                        cx: x * CELDA + CELDA / 2,
                        cy: y * CELDA + CELDA / 2,
                        r: 3,
                        class: "bit"
                    });
                    svg.appendChild(bit);
                    bits[`${x},${y}`] = bit;
                    total++;
                }
            });
        });

        // Los bugs (se dibujan antes que el chip, para que el chip quede encima)
        bugs.forEach((bug) => dibujarBug(svg, bug));

        // El chip: un cuadradito con las letras CR
        dibujoChip = crear("g", { class: "chip" });
        dibujoChip.appendChild(crear("rect", {
            x: 3,
            y: 3,
            width: CELDA - 6,
            height: CELDA - 6,
            rx: 4,
            class: "chip-cuerpo"
        }));
        const letras = crear("text", {
            x: CELDA / 2,
            y: CELDA / 2 + 3.5,
            "text-anchor": "middle",
            class: "chip-texto"
        });
        letras.textContent = "CR";
        dibujoChip.appendChild(letras);
        svg.appendChild(dibujoChip);

        tablero.appendChild(svg);

        colocar(dibujoChip, chip.x, chip.y);
        bugs.forEach((bug) => colocar(bug.dibujo, bug.x, bug.y));
        actualizarMarcador();
    }

    // Lo lejos que está una casilla del chip (contando casillas, sin diagonales)
    function distancia(x, y) {
        return Math.abs(x - chip.x) + Math.abs(y - chip.y);
    }

    // Un bug da un paso por el circuito
    function moverBug(bug) {
        // Las calles por las que puede ir (las que no tienen pared)
        const libres = DIRECCIONES.filter(
            (d) => !esPared(bug.x + d.x, bug.y + d.y)
        );

        // No da la vuelta, salvo que no tenga otra salida
        const sinVuelta = libres.filter(
            (d) => !(d.x === -bug.dx && d.y === -bug.dy)
        );
        const posibles = sinVuelta.length > 0 ? sinVuelta : libres;

        let elegida;
        if (Math.random() < 0.3) {
            // Tres de cada diez veces, elige la calle que más le acerca al chip
            elegida = posibles.reduce((mejor, d) =>
                distancia(bug.x + d.x, bug.y + d.y) <
                distancia(bug.x + mejor.x, bug.y + mejor.y) ? d : mejor
            );
        } else {
            // El resto de veces, tira por una calle al azar
            elegida = posibles[Math.floor(Math.random() * posibles.length)];
        }

        bug.dx = elegida.x;
        bug.dy = elegida.y;
        bug.x += elegida.x;
        bug.y += elegida.y;
    }

    // ¿Este bug ha tocado al chip? (misma casilla, o se han cruzado de frente)
    function chocan(bug, antes) {
        const mismaCasilla = bug.x === chip.x && bug.y === chip.y;
        const seCruzan =
            bug.x === antes.x && bug.y === antes.y &&
            bug.antesX === chip.x && bug.antesY === chip.y;
        return mismaCasilla || seCruzan;
    }

    // Todos a su casilla de salida
    function volverAlInicio() {
        chip.x = inicioChip.x;
        chip.y = inicioChip.y;
        direccion = { x: 0, y: 0 };
        siguiente = null;
        colocar(dibujoChip, chip.x, chip.y);

        bugs.forEach((bug) => {
            bug.x = bug.inicioX;
            bug.y = bug.inicioY;
            bug.antesX = bug.x;
            bug.antesY = bug.y;
            bug.dx = 0;
            bug.dy = 0;
            colocar(bug.dibujo, bug.x, bug.y);
        });
    }

    // Un bug ha pillado al chip
    function perderVida() {
        vidas--;
        actualizarMarcador();

        if (vidas === 0) {
            terminar("¡Los bugs ganan! Esta vez no ha compilado.", false);   // NUEVO: segundo dato
            return;
        }

        volverAlInicio();
        pausar();
        const quedan = vidas === 1 ? "1 vida" : `${vidas} vidas`;
        mensaje.textContent = `¡Un bug te ha pillado! Te quedan ${quedan}. Pulsa Seguir.`;
    }

    // NUEVO: el chip se ha comido todos los bits
    function ganar() {
        terminar(`¡Compilado sin errores! Te has comido los ${total} bits.`, true);
    }

    // Se acabó la partida (gano = true si has ganado)
    function terminar(texto, gano) {
        pausar();
        terminado = true;                          // NUEVO
        boton.textContent = "Jugar otra vez";      // NUEVO
        mensaje.textContent = texto;
        enlace.hidden = !gano;                     // NUEVO: el enlace solo si has ganado
        panel.classList.toggle("juego-ganado", gano);   // NUEVO: el panel brilla si ganas
    }

    // NUEVO: deja el juego como el primer día para empezar de cero
    function reiniciar() {
        tablero.innerHTML = "";                    // quita el dibujo viejo
        for (const clave in bits) {
            delete bits[clave];                    // vacía la lista de bits
        }
        total = 0;
        comidos = 0;
        vidas = VIDAS_INICIO;
        pasos = 0;
        terminado = false;

        dibujarTablero();                          // dibuja el tablero con todos los bits
        volverAlInicio();                          // chip y bugs a su sitio

        mensaje.textContent = "";
        enlace.hidden = true;
        panel.classList.remove("juego-ganado");
    }

    // Un paso del juego: se repite cada 160 milisegundos mientras juegas
    function paso() {
        const antes = { x: chip.x, y: chip.y };   // dónde estaba el chip

        // 1. Si el jugador pidió un giro y no hay pared, gira
        if (siguiente && !esPared(chip.x + siguiente.x, chip.y + siguiente.y)) {
            direccion = siguiente;
            siguiente = null;
        }

        // 2. Avanza una casilla si no hay pared delante
        const nuevoX = chip.x + direccion.x;
        const nuevoY = chip.y + direccion.y;
        if (!esPared(nuevoX, nuevoY)) {
            chip.x = nuevoX;
            chip.y = nuevoY;
            colocar(dibujoChip, chip.x, chip.y);
            comer();
        }

        // NUEVO: si al comer ha ganado, la partida ya terminó y no se sigue
        if (!jugando) return;

        // 3. Los bugs se mueven (van más lentos: se quedan quietos 1 de cada 3 pasos)
        pasos++;
        bugs.forEach((bug) => {
            bug.antesX = bug.x;
            bug.antesY = bug.y;
        });
        if (pasos % 3 !== 0) {
            bugs.forEach(moverBug);
        }
        bugs.forEach((bug) => colocar(bug.dibujo, bug.x, bug.y));

        // 4. ¿Algún bug ha tocado al chip?
        if (bugs.some((bug) => chocan(bug, antes))) {
            perderVida();
        }
    }

    function empezar() {
        jugando = true;
        reloj = setInterval(paso, VELOCIDAD);
        boton.textContent = "Pausa";
        mensaje.textContent = "";
    }

    function pausar() {
        jugando = false;
        clearInterval(reloj);
        reloj = null;
        boton.textContent = "Seguir";
    }

    boton.addEventListener("click", () => {
        if (terminado) {          // NUEVO: si acabó la partida, empieza otra
            reiniciar();
            empezar();
        } else if (jugando) {
            pausar();
        } else {
            empezar();
        }
    });

    // Teclado: solo cuenta mientras se está jugando
    document.addEventListener("keydown", (evento) => {
        if (!jugando) return;
        if (evento.ctrlKey || evento.metaKey || evento.altKey) return;

        if (evento.key === "Escape") {
            pausar();
            return;
        }

        const nueva = TECLAS[evento.key.toLowerCase()];
        if (!nueva) return;

        evento.preventDefault();   // que la página no baje al pulsar una flecha
        siguiente = nueva;
    });
        
     // Móvil: deslizar el dedo (o arrastrar con el ratón) sobre el tablero cambia la dirección
    let inicioToque = null;   // dónde empezó el deslizamiento

    tablero.addEventListener("pointerdown", (evento) => {
        inicioToque = { x: evento.clientX, y: evento.clientY };
        tablero.setPointerCapture(evento.pointerId);   // sigue el dedo aunque se salga del tablero
    });

    tablero.addEventListener("pointermove", (evento) => {
        if (!inicioToque || !jugando) return;

        const dx = evento.clientX - inicioToque.x;   // cuánto se ha movido hacia los lados
        const dy = evento.clientY - inicioToque.y;   // y hacia arriba o abajo

        // Si se ha movido muy poco, todavía no es un deslizamiento
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;

        // Gana el eje en el que más se ha movido
        if (Math.abs(dx) > Math.abs(dy)) {
            siguiente = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            siguiente = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }

        // Nuevo punto de partida: así se pueden encadenar giros sin levantar el dedo
        inicioToque = { x: evento.clientX, y: evento.clientY };
    });

    tablero.addEventListener("pointerup", () => { inicioToque = null; });
    tablero.addEventListener("pointercancel", () => { inicioToque = null; });

    // Pausa automática: si cambias de pestaña, el juego se para
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && jugando) {
            pausar();
        }
    });

    // Pausa automática: si el tablero sale de la pantalla, el juego se para
    if ("IntersectionObserver" in window) {
        const vigilante = new IntersectionObserver((entradas) => {
            if (!entradas[0].isIntersecting && jugando) {
                pausar();
            }
        }, { threshold: 0.3 });
        vigilante.observe(panel);
    }
    dibujarTablero();
})();