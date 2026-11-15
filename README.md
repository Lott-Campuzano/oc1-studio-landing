# OC-1 STUDIO — landing

Landing page de promoción de [OC-1 STUDIO](https://github.com/Lott-Campuzano/oc1-studio),
el estudio de música que vive en la terminal con estética **Teenage Engineering
y Arturia** — minimalista industrial, con la filosofía de diseño de
[Lott Campuzano](https://lott-campuzano.vercel.app/) (véase
[`webasis`](https://github.com/Lott-Campuzano/webasis)).

**Solo HTML + CSS + JavaScript puro** — cero frameworks, cero build, cero
dependencias. Abre `index.html` y funciona.

## Diseño · la filosofía aplicada

* **Neutros fríos + un acento**: blanco hueso frío (`#f2f2ef`) / negro carbón
  (`#101112`), y un solo color de acento elegible con swatches con nombre
  (carmesí, TE naranja, papaya, cian, verde TE, humo) + selector
  personalizado — como en `webasis`.
* **Tipografía**: JetBrains Mono para todo el texto (cuerpo, etiquetas,
  botones, código) — la página vive en la terminal. Titulares y marca en
  **Baloo 2**, la redonda «cilíndrica» tipo Be Happy, con fallbacks
  redondos (Fredoka, Comfortaa, ui-rounded) si no hay red.
* **Las cuatro teclas del OP-1** como colores funcionales fijos de hardware:
  naranja = kick, azul = pulse, verde = hat, blanco = seq.
* **Industrial y plano**: cursor `>_` parpadeante en la marca, secciones
  numeradas `01 02 03 04`, retícula de puntos, etiquetas de archivo
  (`secuenciador · chip 8-bit`), encoders giratorios. Esquinas cuadradas
  en todos los componentes y superficies sin sombras.
* **Tarjetas-módulo**: paneles planos con borde duro, cabecera con índice
  numerado (`01…06`) y bloque de código enmarcado — como un rack de
  hardware. El knob circular es la única curva, como en el hardware.
* **Secuenciador demo funcional**: 16 pasos × 3 pistas con WebAudio (ondas
  cuadradas chiptune, cero muestras), presets tipo lecciones (`chip_boy`,
  `acid_808`, vacío) y **autoguardado del patrón** en `localStorage`.
* **Todo se guarda en tu navegador. Tu espacio, tus reglas.**: tema, acento
  y tamaño base persisten en `oc1:landing:v1`.
* **Temas**: `AUTO` sigue a tu sistema (`prefers-color-scheme`), más `DARK` y
  `LIGHT` fijos — como la TUI de OC-1.
* **Responsive** (1080px contenedor; quiebres en 900px y 640px) y
  `prefers-reduced-motion` respetado por completo.

## Estructura

```
index.html          marcado (portada, 01–04, panel de personalización)
style.css           tokens de tema, estética TE/Arturia, responsive
script.js           ajustes, tarjetas, secuenciador, encoders, toasts
assets/
  captura-tui.svg   captura real de la TUI exportada desde la app
```

## Probar en local

```bash
python3 -m http.server 8000     # http://localhost:8000
```

(o simplemente abre `index.html` en el navegador)

## Publicar

GitHub Pages desde la rama `main`.

---

*Hecho con amor por **Lott Campuzano**, **GLM-5.3-Flash-Free** y **OpenCode** ♥*
