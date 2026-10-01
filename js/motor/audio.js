// Sintetizador chiptune con Web Audio: música (secuenciador) y efectos.

let ac = null;
let maestro, busMusica, busEfectos;
let ruido = null;
const ondas = {};
let silenciado = false;

const NOTAS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

export function midi(nombre) {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(nombre);
  if (!m) return null;
  return 12 * (+m[2] + 1) + NOTAS[m[1]];
}

const frec = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function iniciarAudio() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      maestro = ac.createGain();
      maestro.gain.value = silenciado ? 0 : 0.55;
      maestro.connect(ac.destination);
      busMusica = ac.createGain();
      busMusica.gain.value = 0.8;
      busMusica.connect(maestro);
      busEfectos = ac.createGain();
      busEfectos.gain.value = 1;
      busEfectos.connect(maestro);
      for (const duty of [0.125, 0.25, 0.5]) ondas[duty] = ondaPulso(duty);
      ruido = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // Sonido vacío para desbloquear iOS.
      const s = ac.createBufferSource();
      s.buffer = ac.createBuffer(1, 1, 22050);
      s.connect(ac.destination);
      s.start(0);
      setInterval(programar, 25);
    }
    if (ac.state === 'suspended') ac.resume();
    if (pendiente) {
      const p = pendiente;
      pendiente = null;
      musica(p);
    }
  } catch (e) {
    console.warn('Audio no disponible', e);
  }
}

function ondaPulso(duty) {
  const n = 48;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) {
    real[k] = Math.sin(2 * Math.PI * k * duty) / (Math.PI * k);
    imag[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (Math.PI * k);
  }
  return ac.createPeriodicWave(real, imag);
}

export function setSilencio(si) {
  silenciado = si;
  if (maestro) maestro.gain.setTargetAtTime(si ? 0 : 0.55, ac.currentTime, 0.02);
}

export function estaSilenciado() {
  return silenciado;
}

// ---------------------------------------------------------------- Música

let actual = null; // { id, cancion, canales, gain, nodos }
let pendiente = null;

// Convierte "C5:4 E5:2 r:2" en eventos {nota, dur} (dur en semicorcheas).
export function partitura(texto) {
  const evs = [];
  let dur = 2;
  for (const tok of texto.trim().split(/\s+/)) {
    if (!tok || tok === '|') continue;
    const [n, d] = tok.split(':');
    if (d) dur = +d;
    if (n === 'r' || n === '-') evs.push({ nota: null, dur });
    else if ('kshc'.includes(n) && n.length === 1) evs.push({ golpe: n, dur });
    else evs.push({ nota: midi(n), dur });
  }
  return evs;
}

export function musica(cancion) {
  if (!cancion) return pararMusica();
  if (!ac || ac.state !== 'running') {
    pendiente = cancion;
    if (!ac) return;
  }
  if (actual && actual.cancion === cancion) return;
  pararMusica();
  const gain = ac.createGain();
  gain.gain.value = cancion.volumen ?? 1;
  gain.connect(busMusica);
  const t0 = ac.currentTime + 0.06;
  actual = {
    cancion,
    gain,
    nodos: [],
    canales: cancion.canales.map((c) => ({ ...c, i: 0, t: t0, fin: false })),
  };
}

export function pararMusica() {
  pendiente = null;
  if (!actual) return;
  const viejo = actual;
  actual = null;
  const t = ac.currentTime;
  viejo.gain.gain.cancelScheduledValues(t);
  viejo.gain.gain.setValueAtTime(viejo.gain.gain.value, t);
  viejo.gain.gain.linearRampToValueAtTime(0, t + 0.08);
  for (const n of viejo.nodos) {
    try { n.stop(t + 0.1); } catch { /* ya parado */ }
  }
  setTimeout(() => viejo.gain.disconnect(), 300);
}

export function musicaTerminada() {
  return !actual || actual.canales.every((c) => c.fin);
}

function programar() {
  if (!actual || !ac || ac.state !== 'running') return;
  const { cancion } = actual;
  const seg16 = 60 / cancion.bpm / 4;
  const hasta = ac.currentTime + 0.18;
  // Si la pestaña estuvo dormida, no intentes "recuperar" todo lo perdido.
  for (const c of actual.canales) {
    if (c.t < ac.currentTime - 0.5) c.t = ac.currentTime + 0.05;
  }
  for (const c of actual.canales) {
    while (!c.fin && c.t < hasta) {
      const ev = c.eventos[c.i];
      const dur = ev.dur * seg16;
      if (ev.nota != null) tocarNota(c, ev.nota, c.t, dur);
      else if (ev.golpe) tocarGolpe(ev.golpe, c.t, c.vol ?? 0.5);
      c.t += dur;
      c.i++;
      if (c.i >= c.eventos.length) {
        if (cancion.bucle === false) c.fin = true;
        else c.i = 0;
      }
    }
  }
  actual.nodos = actual.nodos.filter((n) => n._fin > ac.currentTime);
}

function tocarNota(c, nota, t, dur) {
  const o = ac.createOscillator();
  if (c.onda === 'triangulo') o.type = 'triangle';
  else if (c.onda === 'seno') o.type = 'sine';
  else o.setPeriodicWave(ondas[c.duty ?? 0.5]);
  o.frequency.value = frec(nota);
  const g = ac.createGain();
  const vol = c.vol ?? 0.1;
  const legato = c.legato ?? 0.85;
  const fin = t + Math.max(0.03, dur * legato);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  if (c.decae) g.gain.exponentialRampToValueAtTime(Math.max(vol * 0.35, 0.0001), t + Math.min(dur, 0.35));
  g.gain.setValueAtTime(c.decae ? Math.max(vol * 0.35, 0.0001) : vol, Math.max(t + 0.007, fin - 0.02));
  g.gain.linearRampToValueAtTime(0, fin);
  if (c.vibrato && dur > 0.3) {
    const lfo = ac.createOscillator();
    const lg = ac.createGain();
    lfo.frequency.value = 5.5;
    lg.gain.value = frec(nota) * 0.008;
    lfo.connect(lg).connect(o.frequency);
    lfo.start(t + 0.15);
    lfo.stop(fin);
  }
  o.connect(g).connect(actual.gain);
  o.start(t);
  o.stop(fin + 0.01);
  o._fin = fin + 0.02;
  actual.nodos.push(o);
}

function tocarGolpe(tipo, t, vol) {
  const destino = actual.gain;
  if (tipo === 'k') {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(vol * 1.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(destino);
    o.start(t);
    o.stop(t + 0.16);
    o._fin = t + 0.17;
    actual.nodos.push(o);
    return;
  }
  const s = ac.createBufferSource();
  s.buffer = ruido;
  const f = ac.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = tipo === 's' ? 1200 : tipo === 'c' ? 5000 : 7000;
  const g = ac.createGain();
  const largo = tipo === 's' ? 0.14 : tipo === 'c' ? 0.4 : 0.04;
  g.gain.setValueAtTime(vol * (tipo === 's' ? 0.9 : 0.4), t);
  g.gain.exponentialRampToValueAtTime(0.001, t + largo);
  s.connect(f).connect(g).connect(destino);
  s.start(t, Math.random() * 0.5);
  s.stop(t + largo + 0.01);
  s._fin = t + largo + 0.02;
  actual.nodos.push(s);
}

// ---------------------------------------------------------------- Efectos

function tono({ onda = 0.5, desde, hasta = desde, dur = 0.1, vol = 0.15, t = 0, curva = 'exp' }) {
  if (!ac || ac.state !== 'running') return;
  const t0 = ac.currentTime + t;
  const o = ac.createOscillator();
  if (onda === 'tri') o.type = 'triangle';
  else if (onda === 'seno') o.type = 'sine';
  else o.setPeriodicWave(ondas[onda]);
  o.frequency.setValueAtTime(desde, t0);
  if (hasta !== desde) {
    if (curva === 'exp') o.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
    else o.frequency.linearRampToValueAtTime(hasta, t0 + dur);
  }
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g).connect(busEfectos);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function chasquido({ dur = 0.1, vol = 0.2, filtro = 2000, t = 0, tipo = 'highpass' }) {
  if (!ac || ac.state !== 'running') return;
  const t0 = ac.currentTime + t;
  const s = ac.createBufferSource();
  s.buffer = ruido;
  const f = ac.createBiquadFilter();
  f.type = tipo;
  f.frequency.value = filtro;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  s.connect(f).connect(g).connect(busEfectos);
  s.start(t0, Math.random() * 0.5);
  s.stop(t0 + dur + 0.02);
}

const notas = (lista, { onda = 0.25, paso = 0.07, dur = 0.09, vol = 0.12 } = {}) =>
  lista.forEach((n, i) => tono({ onda, desde: frec(midi(n)), dur, vol, t: i * paso }));

export const sfx = {
  cursor: () => tono({ onda: 0.25, desde: 1400, dur: 0.035, vol: 0.06 }),
  aceptar: () => notas(['E6', 'B6'], { paso: 0.045, dur: 0.06, vol: 0.08 }),
  cancelar: () => notas(['B5', 'E5'], { paso: 0.045, dur: 0.06, vol: 0.08 }),
  texto: () => tono({ onda: 0.5, desde: 880, dur: 0.03, vol: 0.03 }),
  salto: () => tono({ onda: 0.25, desde: 300, hasta: 720, dur: 0.16, vol: 0.09, curva: 'lin' }),
  beso: () => notas(['B5', 'E6'], { paso: 0.06, dur: 0.12, vol: 0.09 }),
  pisoton: () => {
    tono({ onda: 0.5, desde: 420, hasta: 120, dur: 0.12, vol: 0.13 });
    chasquido({ dur: 0.06, vol: 0.12, filtro: 800 });
  },
  dano: () => {
    tono({ onda: 0.5, desde: 600, hasta: 150, dur: 0.3, vol: 0.13, curva: 'lin' });
    chasquido({ dur: 0.12, vol: 0.1, filtro: 600 });
  },
  caida: () => tono({ onda: 0.5, desde: 700, hasta: 90, dur: 0.6, vol: 0.12 }),
  bloque: () => tono({ onda: 0.5, desde: 180, hasta: 90, dur: 0.08, vol: 0.15 }),
  muelle: () => tono({ onda: 0.25, desde: 200, hasta: 1100, dur: 0.25, vol: 0.1 }),
  vida: () => notas(['C6', 'E6', 'G6', 'C7'], { paso: 0.06, dur: 0.1 }),
  recuerdo: () => notas(['G5', 'C6', 'E6', 'G6', 'E6', 'G6', 'C7'], { paso: 0.07, dur: 0.12, vol: 0.1 }),
  puerta: () => {
    tono({ onda: 0.5, desde: 200, hasta: 140, dur: 0.07, vol: 0.12 });
    tono({ onda: 0.5, desde: 160, hasta: 110, dur: 0.07, vol: 0.12, t: 0.09 });
  },
  choque: () => tono({ onda: 0.5, desde: 120, hasta: 80, dur: 0.06, vol: 0.1 }),
  golpe: () => {
    chasquido({ dur: 0.18, vol: 0.25, filtro: 900 });
    tono({ onda: 0.5, desde: 260, hasta: 60, dur: 0.15, vol: 0.12 });
  },
  golpeFuerte: () => {
    chasquido({ dur: 0.3, vol: 0.3, filtro: 500 });
    tono({ onda: 0.5, desde: 200, hasta: 40, dur: 0.3, vol: 0.15 });
    chasquido({ dur: 0.2, vol: 0.2, filtro: 3000, t: 0.08 });
  },
  curar: () => notas(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], { onda: 0.125, paso: 0.05, dur: 0.12, vol: 0.09 }),
  bajar: () => tono({ onda: 0.25, desde: 900, hasta: 200, dur: 0.4, vol: 0.09, curva: 'lin' }),
  subir: () => tono({ onda: 0.25, desde: 200, hasta: 900, dur: 0.4, vol: 0.09, curva: 'lin' }),
  miau: () => {
    tono({ onda: 0.25, desde: 700, hasta: 1100, dur: 0.12, vol: 0.08, curva: 'lin' });
    tono({ onda: 0.25, desde: 1100, hasta: 600, dur: 0.25, vol: 0.08, t: 0.12, curva: 'lin' });
  },
  bufido: () => chasquido({ dur: 0.45, vol: 0.22, filtro: 2500 }),
  ronroneo: () => {
    for (let i = 0; i < 6; i++) tono({ onda: 'tri', desde: 70, hasta: 60, dur: 0.1, vol: 0.18, t: i * 0.11 });
  },
  rendirse: () => tono({ onda: 0.5, desde: 500, hasta: 60, dur: 0.7, vol: 0.12 }),
  subirNivel: () => notas(['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6'], { paso: 0.08, dur: 0.12, vol: 0.1 }),
  campana: () => notas(['E6', 'G6', 'E7'], { onda: 0.125, paso: 0.1, dur: 0.4, vol: 0.08 }),
  laser: () => tono({ onda: 0.25, desde: 1800, hasta: 300, dur: 0.18, vol: 0.08 }),
  telefono: () => {
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 8; j++) tono({ onda: 0.5, desde: j % 2 ? 1300 : 1100, dur: 0.04, vol: 0.05, t: i * 0.7 + j * 0.045 });
  },
};
