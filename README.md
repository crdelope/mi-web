# Mi web personal · Carlos Ruiz

Web personal de marca hecha con HTML, CSS y JavaScript puros, sin frameworks. Cuenta mi paso de la electrónica al desarrollo de software e incluye un mini-juego.

**Web publicada:** https://crdelope.github.io/mi-web/

## Qué incluye

- Intro animada de entrada con ilustraciones SVG propias: brazo robótico, engranajes, circuito y cinta transportadora.
- Cabecera con un titular que se escribe solo y un mini-juego: el chip CR se come bits y esquiva bugs. Se juega con el teclado o deslizando el dedo.
- Barra lateral de iconos que se abre al pasar el ratón. En el móvil se convierte en un menú de tres rayas.
- Secciones: quién soy, mi camino, aficiones, mi próximo nivel y contacto.
- Todas las animaciones respetan la preferencia del sistema de movimiento reducido.

## Estructura del proyecto

```
mi-web/
├── index.html          Estructura de la página
├── README.md           Este archivo
├── css/
│   ├── style.css       Estilos de toda la web
│   └── intro.css       Estilos y animaciones de la intro
├── js/
│   ├── script.js       Menú móvil, titular, secciones que aparecen, año del pie
│   ├── intro.js        Línea de tiempo de la intro
│   └── juego.js        Mini-juego del chip
└── images/
    ├── favicon.svg     Icono de la pestaña
    ├── favicon.png     Icono de la pestaña (versión PNG)
    └── og-imagen.png   Imagen al compartir el enlace
```

## Tecnologías

HTML5 semántico, CSS3 (variables, flexbox, grid y media queries), JavaScript sin librerías, SVG dibujado y animado por código, y Git con GitHub Pages para publicarla.

## Cómo ejecutarla en local

1. Descarga o clona el repositorio.
2. Abre la carpeta en VS Code.
3. Clic derecho sobre `index.html` → **Open with Live Server**. También vale abrir `index.html` directamente en el navegador.

## Decisiones de arquitectura

### 1. Sin frameworks ni librerías

Todo está hecho con HTML, CSS y JavaScript puros. Así entiendo qué hace cada línea y puedo explicarla, la web carga rápido porque no descarga nada de fuera, y cada archivo tiene una única responsabilidad: el HTML la estructura, el CSS el aspecto y el JavaScript el comportamiento.

### 2. El tablero del juego sale de un mapa de letras

El circuito del juego es una lista de textos donde `#` es una pared, `.` un bit, `P` el chip y `B` un bug. `juego.js` recorre esa lista y dibuja el tablero en SVG. Así no hay imágenes que descargar, el tablero se ve nítido en cualquier pantalla y puedo cambiar el nivel solo editando letras.

## Accesibilidad

- Enlace «Saltar al contenido» para quien navega con teclado.
- Menú móvil con `aria-expanded`, que se cierra con `Escape` o pulsando fuera.
- Mientras dura la intro, el resto de la web queda inactivo (`inert`) para que el teclado no se pierda.
- Animaciones desactivadas con `prefers-reduced-motion`.
- El juego se pausa solo al cambiar de pestaña o al salir de pantalla, y los mensajes se anuncian a los lectores de pantalla.

## Proceso de trabajo

Cada mejora se hizo en su propia rama y se fusionó con `main` mediante un pull request, con commits pequeños cuyo mensaje explica el cambio. He usado un asistente de IA (Claude) como guía: yo he aplicado, probado y subido cada cambio.

## Autor

Carlos Ruiz · 1.º DAM · IES Simarro · [github.com/crdelope](https://github.com/crdelope)