# OC-1 STUDIO — landing

Landing page de promoción de [OC-1 STUDIO](https://github.com/Lott-Campuzano/oc1-studio),
el estudio de música que vive en la terminal con estética Teenage Engineering.

**Solo HTML + CSS + JavaScript puro** — cero frameworks, cero build, cero dependencias.
Ábrelo y funciona.

## Características de la página

* **Temas claro/oscuro que siguen al sistema** (`prefers-color-scheme`) con
  override manual en el botón de la esquina: `AUTO → DARK → LIGHT`,
  persistente en `localStorage`. En `AUTO` la página reacciona sola cuando
  cambias la apariencia de tu sistema — igual que la TUI de OC-1.
* **Estética Teenage Engineering**: monoespaciada, los 4 acentos del OP-1
  (naranja/azul/verde/blanco), puntos de color, teclas `syn/drum/tape/seq`,
  encoders giratorios y paneles con borde fino.
* **Secuenciador demo funcional**: 16 pasos × 3 pistas que suenan con WebAudio
  (ondas cuadradas estilo chiptune, cero muestras de audio). Toca las casillas,
  cambia el BPM y gira el encoder VOL — que controla el volumen de verdad.
* **Responsive**: móvil → escritorio con CSS grid y `clamp()`.
* Accesible: `role=slider` en los encoders, `aria-pressed` en las casillas,
  `prefers-reduced-motion` respetado.

## Estructura

```
index.html          marcado (una página, secciones ancla)
style.css           tokens de tema, estética TE, responsive
script.js           tema, reveal, copiar, encoders, secuenciador WebAudio
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

*Hecho con **GLM-5.3-Flash-Free** y **OpenCode** — la música la pones tú.* 🎛️
