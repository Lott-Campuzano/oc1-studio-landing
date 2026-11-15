'use strict';

/* ═══════════════ Utilidades ═══════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2200);
}

function loadJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

/* ═══════════════ Personalización ═══════════════ */
const SETTINGS_KEY = 'oc1:landing:v1';
const SETTINGS_DEFAULTS = { theme: 'auto', accent: '#ff5300', radius: 14, size: 16 };
let settings = { ...SETTINGS_DEFAULTS };

function loadSettings() {
  settings = { ...SETTINGS_DEFAULTS, ...(loadJson(SETTINGS_KEY) || {}) };
}

function persistSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* sin almacenamiento */ }
}

function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.style.setProperty('--accent', settings.accent);
  root.style.setProperty('--radius', settings.radius + 'px');
  root.style.setProperty('--size', settings.size + 'px');

  $$('#swatches .swatch[data-accent]').forEach((b) =>
    b.classList.toggle('active', b.dataset.accent.toLowerCase() === String(settings.accent).toLowerCase()));
  const accentInput = $('#accent-input');
  if (accentInput) accentInput.value = settings.accent;
  const rad = $('#radius-range');
  if (rad) { rad.value = settings.radius; $('#radius-out').textContent = settings.radius + 'px'; }
  const siz = $('#size-range');
  if (siz) { siz.value = settings.size; $('#size-out').textContent = settings.size + 'px'; }
  $$('#theme-seg button').forEach((b) =>
    b.classList.toggle('active', b.dataset.themeOpt === settings.theme));
}

function openSettings() { $('#settings').classList.add('open'); $('#overlay').hidden = false; }
function closeSettings() { $('#settings').classList.remove('open'); $('#overlay').hidden = true; }

function bindSettings() {
  $('#open-settings').addEventListener('click', openSettings);
  $('#settings-close').addEventListener('click', closeSettings);
  $('#overlay').addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettings(); });

  $$('#theme-seg button').forEach((b) => b.addEventListener('click', () => {
    settings.theme = b.dataset.themeOpt; persistSettings(); applySettings();
    toast(settings.theme === 'auto' ? 'tema: sigue a tu sistema ◐' :
          settings.theme === 'dark' ? 'tema: oscuro ●' : 'tema: claro ○');
  }));
  $$('#swatches .swatch[data-accent]').forEach((b) => b.addEventListener('click', () => {
    settings.accent = b.dataset.accent; persistSettings(); applySettings();
  }));
  $('#accent-input').addEventListener('input', (e) => {
    settings.accent = e.target.value; persistSettings(); applySettings();
  });
  $('#radius-range').addEventListener('input', (e) => {
    settings.radius = +e.target.value; persistSettings(); applySettings();
  });
  $('#size-range').addEventListener('input', (e) => {
    settings.size = +e.target.value; persistSettings(); applySettings();
  });
  $('#settings-reset').addEventListener('click', () => {
    settings = { ...SETTINGS_DEFAULTS }; persistSettings(); applySettings();
    toast('OC-1 restablecido //');
  });
}

/* ═══════════════ Audio (síntesis del navegador) ═══════════════ */
const synth = window.speechSynthesis || null;

function pickVoice() {
  if (!synth) return null;
  return synth.getVoices().find((v) => (v.lang || '').toLowerCase().startsWith('es')) || null;
}

function setSpeakingUI(on) { const b = $('#stop-audio'); if (b) b.hidden = !on; }

function speak(text) {
  if (!synth) { toast('Tu navegador no soporta audio de síntesis 😅'); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'es-ES'; }
  u.rate = 1.04; u.pitch = 1;
  u.onend = () => setSpeakingUI(false);
  u.onerror = () => setSpeakingUI(false);
  synth.speak(u);
  setSpeakingUI(true);
}

function bindAudio() {
  $('#stop-audio').addEventListener('click', () => { if (synth) synth.cancel(); });
  $$('[data-say]').forEach((b) => b.addEventListener('click', () => speak(b.dataset.say)));
  document.addEventListener('visibilitychange', () => { if (document.hidden && synth) synth.cancel(); });
}

/* ═══════════════ Tarjetas de características ═══════════════ */
const FEATURES = [
  {
    t: 'tema · sistema',
    d: 'Claro y oscuro que siguen a la apariencia de tu sistema y se sondean cada 5 s. Cuatro acentos TE: naranja, azul, verde y blanco.',
    ex: 'appearance: auto   # sigue al sistema',
    say: 'Los temas son dinámicos: la interfaz sigue al modo claro u oscuro de tu sistema y cambia sola cada cinco segundos. Cada acento tiene su variante clara y su variante oscura.',
  },
  {
    t: 'ableton live',
    d: 'Puente Max for Live por UDP: tus notas a MIDI y un reloj de 16avos sincronizado con el transporte de Live.',
    ex: 'oc1 note 36 110  →  udp:7647',
    say: 'El puente a Ableton convierte las notas del secuenciador en MIDI real y recibe el reloj de dieciseisavos sincronizado con el transporte de Live. Tú secuencias, tus instrumentos suenan.',
  },
  {
    t: 'chiptune',
    d: 'Sonido de computadora vieja: pulsos al 25 %, ruido de 1 bit, reloj decimado a ~7 kHz y eco tipo Game Boy.',
    ex: '.coarse(8).crush(4)   # strudel',
    say: 'El estilo chip suena a computadora vieja: pulsos cuadrados, ruido de un bit y un reloj decimado. La frase exacta para Strudel es punto coarse de ocho y punto crush de cuatro.',
  },
  {
    t: 'strudel',
    d: 'Tu demo se abre en strudel.cc ya cargado, o en un player local con editor y REPL en vivo.',
    ex: 'oc1studio strudel demo.py',
    say: 'Strudel es el live-coding en el navegador. Un comando abre tu demo cargado y listo para editar en vivo, sin instalar nada.',
  },
  {
    t: 'demos · py',
    d: 'Cada canción es un archivo Python editable: lo lees, lo cambias, lo versionas. Sin formatos cerrados.',
    ex: 'Track(name="pulse",\n  pattern="e2 ~ e3 ~ …")',
    say: 'Tus demos son archivos de Python: texto plano que puedes leer, editar y compartir. La pista se define con un nombre, un sonido y un patrón de dieciséis pasos.',
  },
  {
    t: 'git integrado',
    d: 'init, clone, commit, push y pull desde la propia TUI, con auto-commit al guardar.',
    ex: 'oc1studio git push',
    say: 'Git está integrado en la interfaz: inicializa, clona, guarda versiones y sube a GitHub sin salir del estudio. Tu backup es tu historial.',
  },
];

function cardEl(card) {
  const art = document.createElement('article');
  art.className = 'card';

  const head = document.createElement('header');
  head.className = 'card-head';
  const h4 = document.createElement('h4');
  h4.textContent = card.t;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'listen';
  btn.title = 'Escuchar explicación';
  btn.setAttribute('aria-label', 'Escuchar: ' + card.t);
  btn.textContent = '🔊';
  btn.addEventListener('click', () => speak(card.say));
  head.append(h4, btn);

  const p = document.createElement('p');
  p.textContent = card.d;

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = card.ex;
  pre.append(code);

  art.append(head, p, pre);
  return art;
}

/* ═══════════════ Secuenciador (WebAudio · chip 8-bit) ═══════════════ */
const SEQ_KEY = 'oc1:landing:seq:v1';
const ROWS = [
  { id: 'kick',  name: 'kick',  dot: 'dot-orange' },
  { id: 'pulse', name: 'pulse', dot: 'dot-blue' },
  { id: 'hat',   name: 'hat',   dot: 'dot-green' },
];
const PRESETS = [
  { name: '1 · chip_boy', kick: [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,0,0], pulse: [1,0,1,1, 0,1,0,1, 1,0,1,0, 0,1,0,1], hat: [1,1,1,0, 1,0,1,1, 1,0,1,1, 1,0,1,1] },
  { name: '2 · acid_808', kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,1,0], pulse: [1,0,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1], hat: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
  { name: '3 · vacío',    kick: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], pulse: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], hat: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] },
];

const grid = $('#seq-grid');
const state = { kick: [], pulse: [], hat: [] };
const cellEls = { kick: [], pulse: [], hat: [] };

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

function paintCell(id, i) {
  const b = cellEls[id][i];
  const on = !!state[id][i];
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', String(on));
}

function paintAll() {
  ROWS.forEach((r) => { for (let i = 0; i < 16; i++) paintCell(r.id, i); });
}

const persistSeq = debounce(() => {
  try {
    localStorage.setItem(SEQ_KEY, JSON.stringify({
      kick: state.kick, pulse: state.pulse, hat: state.hat, bpm: bpmInput.value,
    }));
  } catch { /* sin almacenamiento */ }
}, 400);

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

function loadSeq() {
  const saved = loadJson(SEQ_KEY);
  ROWS.forEach((r) => { state[r.id] = [...(saved && saved[r.id]) || [...PRESETS[0][r.id]]]; });
  if (saved && saved.bpm) bpmInput.value = saved.bpm;
  paintAll();
}

/* --- audio --- */
let ctx = null, master = null, noiseBuf = null;
let playing = false, step = 0, timer = null;

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

function paintStep(i) {
  $$('.cell.now').forEach((c) => c.classList.remove('now'));
  $$('.cell[data-i="' + i + '"]').forEach((c) => c.classList.add('now'));
}

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

/* ═══════════════ Encoders ═══════════════ */
const knobState = {};
function setVolume(v) { if (master) master.gain.value = v; }

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

/* ═══════════════ Copiar ═══════════════ */
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

/* ═══════════════ Navegación activa ═══════════════ */
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

/* ═══════════════ Titular que se ensambla ═══════════════ */
function assembleHeadline() {
  const h1 = $('.hero h1');
  if (!h1) return;

  const out = [];
  Array.from(h1.childNodes).forEach((node) => {
    const isEm = node.nodeType === 1;
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { out.push(document.createTextNode(' ')); return; }
      let word;
      if (isEm) {
        const em = document.createElement('em');
        word = document.createElement('span');
        word.className = 'hero-word';
        word.textContent = part;
        em.appendChild(word);
        out.push(em);
      } else {
        word = document.createElement('span');
        word.className = 'hero-word';
        word.textContent = part;
        out.push(word);
      }
    });
  });
  h1.replaceChildren(...out);

  let i = 0;
  out.forEach((n) => {
    if (!(n.nodeType === 1 && n.classList.contains('hero-word'))) return;
    const big = !!n.closest('em');
    const spread = big ? 3 : 1;
    n.style.setProperty('--sx', Math.round((Math.random() * 2 - 1) * 70 * spread) + 'px');
    n.style.setProperty('--sy', Math.round((Math.random() * 2 - 1) * 60 * spread) + 'px');
    n.style.setProperty('--sr', Math.round((Math.random() * 2 - 1) * 16 * spread) + 'deg');
    n.style.animationDelay = (i * 70) + 'ms';
    i++;
  });
}

/* ═══════════════ Inicio ═══════════════ */
function init() {
  loadSettings();
  applySettings();
  bindSettings();
  bindAudio();

  FEATURES.forEach((c) => $('#cards').appendChild(cardEl(c)));

  buildGrid();
  renderPresets();
  loadSeq();
  playBtn.addEventListener('click', togglePlay);
  bpmInput.addEventListener('input', persistSeq);

  bindKnobs();
  bindCopy();
  bindNav();
  assembleHeadline();
}

init();
