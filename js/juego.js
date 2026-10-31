// =========================================
// MINI-JUEGO DEL CHIP (js/juego.js)
// Paso 4: comer bits y contador
// =========================================
(function () {
    const tablero = document.getElementById("tablero");
    const boton = document.getElementById("juego-boton");
    const marcador = document.getElementById("marcador");   // NUEVO
    if (!tablero || !boton || !marcador) return;

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

    // El estado del juego: lo que va cambiando mientras juegas
    const chip = { x: 1, y: 1 };       // casilla donde está el chip
    let direccion = { x: 0, y: 0 };    // hacia dónde va ahora
    let siguiente = null;              // giro que el jugador ha pedido
    let reloj = null;                  // el temporizador que da los pasos
    let jugando = false;
    let dibujoChip = null;             // el dibujo del chip en el tablero
    const bits = {};                   // NUEVO: los bits que quedan, por casilla ("3,5")
    let total = 0;                     // NUEVO: cuántos bits hay en total
    let comidos = 0;                   // NUEVO: cuántos se ha comido ya

    // Busca la P en el mapa para saber dónde empieza el chip
    MAPA.forEach((fila, y) => {
        const x = fila.indexOf("P");
        if (x !== -1) {
            chip.x = x;
            chip.y = y;
        }
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

    // Pone el dibujo del chip en su casilla
    function colocarChip() {
        dibujoChip.style.transform =
            `translate(${chip.x * CELDA}px, ${chip.y * CELDA}px)`;
    }

    // NUEVO: escribe en el marcador cuántos bits lleva
    function actualizarMarcador() {
        marcador.textContent = `Bits: ${comidos} / ${total}`;
    }

    // NUEVO: si en la casilla del chip hay un bit, se lo come
    function comer() {
        const clave = `${chip.x},${chip.y}`;
        const bit = bits[clave];
        if (bit) {
            bit.remove();          // quita el puntito del dibujo
            delete bits[clave];    // y lo borra de la lista
            comidos++;
            actualizarMarcador();
        }
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
                    bits[`${x},${y}`] = bit;   // NUEVO: lo apunta en la lista
                    total++;                   // NUEVO: y lo cuenta
                }
            });
        });

        // El chip: un cuadradito con las letras CR (se dibuja el último, encima de todo)
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
        colocarChip();
        actualizarMarcador();   // NUEVO: enseña 0 / 84 desde el principio
    }

    // Un paso del juego: se repite cada 160 milisegundos mientras juegas
    function paso() {
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
            colocarChip();
            comer();   // NUEVO: ¿hay un bit en la casilla nueva?
        }
    }

    function empezar() {
        jugando = true;
        reloj = setInterval(paso, VELOCIDAD);
        boton.textContent = "Pausa";
    }

    function pausar() {
        jugando = false;
        clearInterval(reloj);
        reloj = null;
        boton.textContent = "Seguir";
    }

    boton.addEventListener("click", () => {
        if (jugando) {
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

    dibujarTablero();
})();