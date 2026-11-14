/* OC-1 STUDIO — landing · JS puro (sin librerías)
   1) tema auto→dark→light (persistente, sigue al sistema en auto)
   2) reveal on scroll
   3) botones COPIAR del terminal
   4) encoders giratorios (rueda, arrastre, teclado)
   5) secuenciador demo 16 pasos con WebAudio (chip 8-bit) */
"use strict";

/* ---------- 1) tema: auto → dark → light ---------- */
const CYCLE = ["auto", "dark", "light"];
const LABEL = { auto: "AUTO", dark: "DARK", light: "LIGHT" };
const DOT = { auto: "dot-green", dark: "dot-orange", light: "dot-blue" };
const themeBtn = document.getElementById("theme-btn");
const themeLabel = document.getElementById("theme-label");

const savedTheme = localStorage.getItem("oc1-theme");
if (savedTheme && CYCLE.includes(savedTheme)) {
  document.documentElement.dataset.theme = savedTheme;
}
function paintTheme() {
  const t = document.documentElement.dataset.theme || "auto";
  themeLabel.textContent = LABEL[t] || "AUTO";
  themeBtn.querySelector(".dot").className = "dot " + (DOT[t] || DOT.auto);
  themeBtn.title = t === "auto"
    ? "apariencia: sigue al sistema"
    : t === "dark" ? "apariencia: oscuro fijo" : "apariencia: claro fijo";
}
themeBtn.addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme || "auto";
  const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
  document.documentElement.dataset.theme = next;
  localStorage.setItem("oc1-theme", next);
  paintTheme();
});
paintTheme();
/* en AUTO el CSS ya reacciona solo a prefers-color-scheme — sin listeners */

/* ---------- 2) reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- 3) botones COPIAR ---------- */
document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const txt = btn.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      const ta = document.createElement("textarea");   // fallback viejo
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const prev = btn.textContent;
    btn.textContent = "✓ LISTO";
    btn.classList.add("done");
    setTimeout(() => { btn.textContent = prev; btn.classList.remove("done"); }, 1400);
  });
});

/* ---------- 4) encoders ---------- */
const knobState = {};   // { reverb: 18, delay: 22, drive: 15, vol: 90 }
let ctx = null, master = null, noiseBuf = null;   // WebAudio — se crea al dar PLAY
function setVolume(v) { if (master) master.gain.value = v; }

function setKnob(unit, raw) {
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  const knob = unit.querySelector(".knob");
  const out = unit.querySelector("output");
  knob.style.setProperty("--ang", (pct * 1.4 - 70) + "deg");
  knob.setAttribute("aria-valuenow", String(pct));
  out.textContent = pct + "%";
  knobState[unit.dataset.knob] = pct;
  if (unit.dataset.knob === "vol") setVolume((pct / 100) * 0.8);
  return pct;
}

document.querySelectorAll(".knob-unit").forEach((unit) => {
  const knob = unit.querySelector(".knob");
  let val = Number(knob.getAttribute("aria-valuenow")) || 0;
  val = setKnob(unit, val);

  let dragging = false, startY = 0, startV = 0;
  knob.addEventListener("pointerdown", (e) => {
    dragging = true; startY = e.clientY; startV = val;
    knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    val = setKnob(unit, startV + (startY - e.clientY) * 0.8);
  });
  knob.addEventListener("pointerup", () => { dragging = false; });
  knob.addEventListener("pointercancel", () => { dragging = false; });
  knob.addEventListener("wheel", (e) => {
    e.preventDefault();
    val = setKnob(unit, val + (e.deltaY < 0 ? 3 : -3));
  }, { passive: false });
  knob.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      val = setKnob(unit, val + 3); e.preventDefault();
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      val = setKnob(unit, val - 3); e.preventDefault();
    }
  });
});

/* ---------- 5) secuenciador demo (WebAudio, chip 8-bit) ---------- */
const ROWS = [
  { id: "kick",  name: "KICK",  dot: "dot-orange" },
  { id: "pulse", name: "PULSE", dot: "dot-blue" },
  { id: "hat",   name: "HAT",   dot: "dot-green" },
];
/* patrón inicial = chip_boy */
const DEFAULT = {
  kick:  [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,0,0],
  pulse: [1,0,1,1, 0,1,0,1, 1,0,1,0, 0,1,0,1],
  hat:   [1,1,1,0, 1,0,1,1, 1,0,1,1, 1,0,1,1],
};

const grid = document.getElementById("seq-grid");
const state = {};   // { id: { on: [...], cells: [...] } }

ROWS.forEach((row) => {
  state[row.id] = { on: [...DEFAULT[row.id]], cells: [] };
  const rowEl = document.createElement("div");
  rowEl.className = "seq-row";

  const name = document.createElement("span");
  name.className = "seq-name";
  const dot = document.createElement("span");
  dot.className = "dot " + row.dot;
  name.appendChild(dot);
  name.appendChild(document.createTextNode(row.name));
  rowEl.appendChild(name);

  const cells = document.createElement("div");
  cells.className = "seq-cells";
  for (let i = 0; i < 16; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cell " + row.id;
    b.dataset.i = String(i);
    b.setAttribute("aria-label", row.name + " paso " + (i + 1));
    if (DEFAULT[row.id][i]) { b.classList.add("on"); b.setAttribute("aria-pressed", "true"); }
    else { b.setAttribute("aria-pressed", "false"); }
    b.addEventListener("click", () => {
      state[row.id].on[i] = state[row.id].on[i] ? 0 : 1;
      const on = !!state[row.id].on[i];
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    cells.appendChild(b);
    state[row.id].cells.push(b);
  }
  rowEl.appendChild(cells);
  grid.appendChild(rowEl);
});

/* --- audio --- */
let playing = false, step = 0, timer = null;

function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = ((knobState.vol ?? 90) / 100) * 0.8;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}

function vKick(t) {   // pulso cuadrado cayendo (kick de consola 8-bit)
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.16);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.25);
}
function vPulse(t) {  // onda cuadrada, alterna E3 / G3 por compás
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "square";
  o.frequency.value = step < 8 ? 164.81 : 196.0;
  g.gain.setValueAtTime(0.28, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.14);
}
function vHat(t) {    // ráfaga de ruido con highpass, muy corta
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  src.connect(hp); hp.connect(g); g.connect(master);
  src.start(t); src.stop(t + 0.05);
}

const bpmInput = document.getElementById("seq-bpm");
const stepLabel = document.getElementById("seq-step");
const playBtn = document.getElementById("seq-play");

function paintStep(i) {
  document.querySelectorAll(".cell.now").forEach((c) => c.classList.remove("now"));
  document.querySelectorAll('.cell[data-i="' + i + '"]').forEach((c) => c.classList.add("now"));
}

function playStep() {
  ensureAudio();
  const t = ctx.currentTime + 0.02;
  if (state.kick.on[step])  vKick(t);
  if (state.pulse.on[step]) vPulse(t);
  if (state.hat.on[step])   vHat(t);
  stepLabel.textContent = String(step + 1).padStart(2, "0") + "/16";
  paintStep(step);
  const bpm = Number(bpmInput.value) || 140;
  const spb = 60 / bpm / 4;   // semicorchea
  timer = setTimeout(() => { step = (step + 1) % 16; playStep(); }, spb * 1000);
}

function togglePlay() {
  if (playing) {
    playing = false;
    clearTimeout(timer); timer = null; step = 0;
    document.querySelectorAll(".cell.now").forEach((c) => c.classList.remove("now"));
    stepLabel.textContent = "--/16";
    playBtn.textContent = "▶ PLAY";
    playBtn.setAttribute("aria-pressed", "false");
  } else {
    playing = true;
    playBtn.textContent = "■ STOP";
    playBtn.setAttribute("aria-pressed", "true");
    playStep();
  }
}
playBtn.addEventListener("click", togglePlay);
