# OC-1 STUDIO — landing

Landing page de promoción de [OC-1 STUDIO](https://github.com/Lott-Campuzano/oc1-studio),
el estudio de música que vive en la terminal con estética **Teenage Engineering
y Arturia** — minimalista industrial, con la filosofía de diseño de
[Lott Campuzano](https://lott-campuzano.vercel.app/) (véase
[`webasis`](https://github.com/Lott-Campuzano/webasis)).

**Solo HTML + CSS + JavaScript puro** — cero frameworks, cero build, cero
dependencias. Abre `index.html` y funciona.

## Diseño · la filosofía aplicada

* **Neutros fríos + un acento fijo**: blanco hueso frío (`#f2f2ef`) / negro
  carbón (`#101112`), y un solo color de acento **fijo como el hardware**:
  rojo carmesí `#dc143c`. Nada se personaliza — como en un sinte real.
* **Tipografía**: **una sola fuente en toda la página** — JetBrains Mono —
  inspirada en [arturia.com](https://www.arturia.com/) y
  [opencode.ai](https://opencode.ai/es), donde todo vive en el mismo
  monoespaciado. Titulares en peso 400 con tracking apretado (`-.03em`)
  y line-height compacto, como opencode.ai.
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
* **Temas**: el tema sigue a tu sistema con `prefers-color-scheme` —
  sin interruptores, como el hardware.
* **Responsive** (1080px contenedor; quiebres en 900px y 640px) y
  `prefers-reduced-motion` respetado por completo.

## Estructura

```
index.html          marcado (portada, secciones 01–04)
style.css           tokens, una sola fuente, estética TE/Arturia, responsive
script.js           tarjetas, secuenciador, encoders, toasts
assets/
  captura-tui.svg   captura real de la TUI exportada desde la app
```

Los tres archivos están **comentados fragmento a fragmento** —
léelos como documentación: qué hace cada bloque y por qué.

## Probar en local

```bash
python3 -m http.server 8000     # http://localhost:8000
```

(o simplemente abre `index.html` en el navegador)

## Publicar

GitHub Pages desde la rama `main`.

---

*Hecho con amor por **Lott Campuzano**, **GLM-5.3-Flash-Free** y **OpenCode** ♥*
