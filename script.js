'use strict';

/* ═══════════════════════════════════════════════════════════
   OC-1 STUDIO · landing — script (vanilla JS, sin dependencias)

   Mapa del archivo:
     1. Utilidades ....... selectores, debounce, toasts, JSON/localStorage
     2. Tarjetas ......... FEATURES (datos) → tarjetas-módulo en el DOM
     3. Secuenciador ..... 16 pasos × 3 pistas, WebAudio chip 8-bit
     4. Encoders ......... knobs giratorios (drag, rueda y teclado)
     5. Copiar ........... botones data-copy → portapapeles
     6. Navegación ....... link activo según la sección visible
     7. Inicio ........... init() arranca todo

   Única persistencia: el patrón del secuenciador en
   `oc1:landing:seq:v1`. El acento y el tamaño viven fijos en
   el CSS — nada de este archivo toca la identidad.
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════ 1 · Utilidades ═══════════════ */

/* $ → primer elemento que casa el selector · $$ → todos, como array */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* debounce: pospone fn hasta que dejan de llegar eventos ms seguidos.
   Lo usamos para no escribir en localStorage con cada clic del patrón. */
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* toast: aviso efímero abajo-centro. Crea el div, lo añade al body,
   muestra con .show en el siguiente frame (para que corra la
   transición CSS) y se autodestruye a los ~2.2 s. */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2200);
}

/* loadJson: lee y parsea una clave de localStorage sin lanzar
   si no existe o está corrupta — devuelve null y el llamador
   usa sus valores por defecto. */
function loadJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

/* ═══════════════ 2 · Tarjetas de características ═══════════════
   Datos puros, sin HTML: cardEl() los convierte en módulos.
   t = título de módulo · d = descripción · ex = comando de ejemplo. */
const FEATURES = [
  {
    t: 'tema · sistema',
    d: 'Claro y oscuro que siguen a la apariencia de tu sistema y se sondean cada 5 s. Cuatro acentos TE: naranja, azul, verde y blanco.',
    ex: 'appearance: auto   # sigue al sistema',
  },
  {
    t: 'ableton live',
    d: 'Puente Max for Live por UDP: tus notas a MIDI y un reloj de 16avos sincronizado con el transporte de Live.',
    ex: 'oc1 note 36 110  →  udp:7647',
  },
  {
    t: 'chiptune',
    d: 'Sonido de computadora vieja: pulsos al 25 %, ruido de 1 bit, reloj decimado a ~7 kHz y eco tipo Game Boy.',
    ex: '.coarse(8).crush(4)   # strudel',
  },
  {
    t: 'strudel',
    d: 'Tu demo se abre en strudel.cc ya cargado, o en un player local con editor y REPL en vivo.',
    ex: 'oc1studio strudel demo.py',
  },
  {
    t: 'demos · py',
    d: 'Cada canción es un archivo Python editable: lo lees, lo cambias, lo versionas. Sin formatos cerrados.',
    ex: 'Track(name="pulse",\n  pattern="e2 ~ e3 ~ …")',
  },
  {
    t: 'git integrado',
    d: 'init, clone, commit, push y pull desde la propia TUI, con auto-commit al guardar.',
    ex: 'oc1studio git push',
  },
];

/* cardEl: construye una tarjeta-módulo con DOM API (sin innerHTML).
   Cabecera = índice 01…06 (padStart rellena con ceros) + título;
   cuerpo = descripción y <pre> con el comando de ejemplo. */
function cardEl(card, i) {
  const art = document.createElement('article');
  art.className = 'card';

  const head = document.createElement('header');
  head.className = 'card-head';
  const num = document.createElement('span');
  num.className = 'card-num';
  num.textContent = String(i + 1).padStart(2, '0');
  const h4 = document.createElement('h4');
  h4.textContent = card.t;
  head.append(num, h4);

  const p = document.createElement('p');
  p.textContent = card.d;

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = card.ex;
  pre.append(code);

  art.append(head, p, pre);
  return art;
}

/* ═══════════════ 3 · Secuenciador (WebAudio · chip 8-bit) ═══════════════
   Estado del patrón en `state` (kick/pulse/hat, 16 pasos de 0|1),
   el DOM en `cellEls` y la persistencia en localStorage (debounced).
   El sonido se sintetiza al vuelo: cero muestras, solo osciladores,
   ruido blanco y envolventes — por eso suena a consola vieja. */
const SEQ_KEY = 'oc1:landing:seq:v1';   // clave de autoguardado del patrón

/* las 3 pistas: id (estado), nombre visible y color de LED */
const ROWS = [
  { id: 'kick',  name: 'kick',  dot: 'dot-orange' },
  { id: 'pulse', name: 'pulse', dot: 'dot-blue' },
  { id: 'hat',   name: 'hat',   dot: 'dot-green' },
];
/* patrones de fábrica (lecciones): cada uno es un preset completo.
   Los arrays son de 16 — un 1 por cada paso activo. */
const PRESETS = [
  { name: '1 · chip_boy', kick: [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,0,0], pulse: [1,0,1,1, 0,1,0,1, 1,0,1,0, 0,1,0,1], hat: [1,1,1,0, 1,0,1,1, 1,0,1,1, 1,0,1,1] },
  { name: '2 · acid_808', kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,1,0], pulse: [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1], hat: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
  { name: '3 · vacío',    kick: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], pulse: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], hat: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
];

/* grid = contenedor del patrón · state = la música ·
   cellEls = referencias a los 48 <button> para pintar sin buscar */
const grid = $('#seq-grid');
const state = { kick: [], pulse: [], hat: [] };      // 1 = paso activo
const cellEls = { kick: [], pulse: [], hat: [] };    // caché de botones

/* buildGrid: genera las 3 filas × 16 botones y cuelga el listener
   de clic (activar/desactivar paso + repintar + autoguardar). */
function buildGrid() {
  ROWS.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seq-row';

    const name = document.createElement('span');
    name.className = 'seq-name';
    const dot = document.createElement('span');
    dot.className = 'dot ' + row.dot;
    name.append(dot, document.createTextNode(row.name));
    rowEl.appendChild(name);

    const cells = document.createElement('div');
    cells.className = 'seq-cells';
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cell ' + row.id;
      b.dataset.i = String(i);
      b.setAttribute('aria-label', row.name + ' paso ' + (i + 1));
      b.addEventListener('click', () => {
        state[row.id][i] = state[row.id][i] ? 0 : 1;
        paintCell(row.id, i);
        persistSeq();
      });
      cells.appendChild(b);
      cellEls[row.id].push(b);
    }
    rowEl.appendChild(cells);
    grid.appendChild(rowEl);
  });
}

/* paintCell: vuelca un paso del estado a su botón (.on + aria-pressed). */
function paintCell(id, i) {
  const b = cellEls[id][i];
  const on = !!state[id][i];
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', String(on));
}

function paintAll() {
  ROWS.forEach((r) => { for (let i = 0; i < 16; i++) paintCell(r.id, i); });
}

/* persistSeq: autoguardado del patrón (debounce de 400 ms:
   clicar rápido no escribe 10 veces, escribe 1). */
const persistSeq = debounce(() => {
  try {
    localStorage.setItem(SEQ_KEY, JSON.stringify({
      kick: state.kick, pulse: state.pulse, hat: state.hat, bpm: bpmInput.value,
    }));
  } catch { /* sin almacenamiento */ }
}, 400);

/* renderPresets: crea los chips 1·chip_boy 2·acid_808 3·vacío.
   Al pulsar uno copia sus arrays al estado, repinta y avisa. */
function renderPresets() {
  const box = $('#seq-presets');
  PRESETS.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = p.name;
    b.addEventListener('click', () => {
      box.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      b.classList.add('active');
      ROWS.forEach((r) => { state[r.id] = [...p[r.id]]; });
      paintAll();
      persistSeq();
      toast('patrón: ' + p.name.replace(/^\d · /, '') + ' //');
    });
    box.appendChild(b);
  });
  box.firstChild.classList.add('active');
}

/* loadSeq: al cargar la página recupera el patrón guardado
   (o el preset 1 si es la primera visita) y repinta todo. */
function loadSeq() {
  const saved = loadJson(SEQ_KEY);
  ROWS.forEach((r) => { state[r.id] = [...(saved && saved[r.id]) || [...PRESETS[0][r.id]]]; });
  if (saved && saved.bpm) bpmInput.value = saved.bpm;
  paintAll();
}

/* --- audio · motor WebAudio -----------------------------------
   ctx      = AudioContext (se crea en el primer gesto del usuario)
   master   = ganancia final que gobierna el knob VOL
   noiseBuf = búfer de ruido blanco reutilizado por el hi-hat
   playing / step / timer = estado del transporte                     */
let ctx = null, master = null, noiseBuf = null;
let playing = false, step = 0, timer = null;

/* ensureAudio: los navegadores bloquean el audio hasta que el
   usuario interactúa; aquí se crea el contexto (una sola vez)
   y se reanuda si estaba suspendido. */
function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = ((knobState.vol ?? 90) / 100) * 0.8;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function vKick(t) {   // pulso cuadrado cayendo · kick de consola 8-bit
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.16);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.25);
}
function vPulse(t) {  // onda cuadrada · alterna E3 / G3 por compás
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = step < 8 ? 164.81 : 196.0;
  g.gain.setValueAtTime(0.28, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.14);
}
function vHat(t) {    // ráfaga de ruido con highpass · muy corta
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  src.connect(hp); hp.connect(g); g.connect(master);
  src.start(t); src.stop(t + 0.05);
}

const bpmInput = $('#seq-bpm');
const stepLabel = $('#seq-step');
const playBtn = $('#seq-play');

/* paintStep: mueve el anillo del playhead al paso i. */
function paintStep(i) {
  $$('.cell.now').forEach((c) => c.classList.remove('now'));
  $$('.cell[data-i="' + i + '"]').forEach((c) => c.classList.add('now'));
}

/* playStep: el reloj del secuenciador. Dispara las voces activas
   del paso, actualiza contador y playhead, y se re-agenda con
   setTimeout a la duración de una semicorchea (60/bpm/4 s). */
function playStep() {
  ensureAudio();
  const t = ctx.currentTime + 0.02;
  if (state.kick[step])  vKick(t);
  if (state.pulse[step]) vPulse(t);
  if (state.hat[step])   vHat(t);
  stepLabel.textContent = String(step + 1).padStart(2, '0') + '/16';
  paintStep(step);
  const bpm = Number(bpmInput.value) || 140;
  const spb = 60 / bpm / 4;   // semicorchea
  timer = setTimeout(() => { step = (step + 1) % 16; playStep(); }, spb * 1000);
}

/* togglePlay: play/stop del botón ▶. Al parar limpia el timer,
   el playhead y resetea el paso a 0. */
function togglePlay() {
  if (playing) {
    playing = false;
    clearTimeout(timer); timer = null; step = 0;
    $$('.cell.now').forEach((c) => c.classList.remove('now'));
    stepLabel.textContent = '--/16';
    playBtn.textContent = '▶ Play';
    playBtn.setAttribute('aria-pressed', 'false');
  } else {
    playing = true;
    playBtn.textContent = '■ Stop';
    playBtn.setAttribute('aria-pressed', 'true');
    playStep();
  }
}

/* ═══════════════ 4 · Encoders ═══════════════
   Cuatro knobs: reverb, delay, drive y vol. Los tres primeros
   guardan su valor (la TUI los usa); VOL controla de verdad
   la ganancia del demo. La rotación vive en la variable CSS
   --ang: 0% → -70° · 100% → +70° (arco de 140°). */
const knobState = {};   // { reverb: 18, delay: 22, … } — valor de cada encoder
function setVolume(v) { if (master) master.gain.value = v; }   // vol → ganancia real del AudioContext

/* setKnob: fija un knob a un valor 0-100 — recorta, gira el tick
   vía --ang, actualiza el <output>, guarda estado y si es VOL
   aplica la ganancia al master en vivo. */
function setKnob(unit, raw) {
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  const knob = $('.knob', unit);
  const out = $('output', unit);
  knob.style.setProperty('--ang', (pct * 1.4 - 70) + 'deg');
  knob.setAttribute('aria-valuenow', String(pct));
  out.textContent = pct + '%';
  knobState[unit.dataset.knob] = pct;
  if (unit.dataset.knob === 'vol') setVolume((pct / 100) * 0.8);
  return pct;
}

/* bindKnobs: tres formas de girar cada encoder:
   · arrastre vertical (pointer events + capture: el drag sigue
     aunque el cursor salga del knob)
   · rueda del ratón (±3 por muesca, preventDefault para no
     hacer scroll de la página)
   · teclado ↑↓←→ (accesible, el knob tiene tabindex) */
function bindKnobs() {
  $$('.knob-unit').forEach((unit) => {
    const knob = $('.knob', unit);
    let val = Number(knob.getAttribute('aria-valuenow')) || 0;
    val = setKnob(unit, val);

    let dragging = false, startY = 0, startV = 0;
    knob.addEventListener('pointerdown', (e) => {
      dragging = true; startY = e.clientY; startV = val;
      knob.setPointerCapture(e.pointerId);
    });
    knob.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      val = setKnob(unit, startV + (startY - e.clientY) * 0.8);
    });
    knob.addEventListener('pointerup', () => { dragging = false; });
    knob.addEventListener('pointercancel', () => { dragging = false; });
    knob.addEventListener('wheel', (e) => {
      e.preventDefault();
      val = setKnob(unit, val + (e.deltaY < 0 ? 3 : -3));
    }, { passive: false });
    knob.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        val = setKnob(unit, val + 3); e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        val = setKnob(unit, val - 3); e.preventDefault();
      }
    });
  });
}

/* ═══════════════ 5 · Copiar ═══════════════
   Botones [data-copy] de la sección Instalar: copian el comando
   al portapapeles con la API async y confirman con toast. */
function bindCopy() {
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      toast('Copiado al portapapeles ⧉');
    } catch {
      toast('No pude copiar 🙈');
    }
  }));
}

/* ═══════════════ 6 · Navegación activa ═══════════════
   Un IntersectionObserver vigila las 4 secciones; cuando una
   cruza la franja central de la pantalla (rootMargin negativo),
   marca su link de la topbar como .active. */
function bindNav() {
  const links = $$('.nav a[data-section]');
  const map = {};
  links.forEach((l) => { map[l.dataset.section] = l; });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        const l = map[en.target.id];
        if (l) l.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((l) => {
    const s = document.getElementById(l.dataset.section);
    if (s) obs.observe(s);
  });
}

/* ═══════════════ 7 · Inicio ═══════════════
   El script carga con `defer`: el DOM ya está aquí al ejecutarse,
   por eso las const iniciales pueden buscar nodos sin esperar. */
function init() {
  FEATURES.forEach((c, i) => $('#cards').appendChild(cardEl(c, i)));

  buildGrid();
  renderPresets();
  loadSeq();
  playBtn.addEventListener('click', togglePlay);
  bpmInput.addEventListener('input', persistSeq);

  bindKnobs();
  bindCopy();
  bindNav();
}

init();
