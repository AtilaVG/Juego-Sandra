import { aVirtual, ajustar } from './pantalla.js';

// Botones lógicos del juego.
const BOTONES = ['izq', 'der', 'arr', 'abj', 'a', 'b', 'menu'];

const TECLAS = {
  ArrowLeft: 'izq', KeyA: 'izq',
  ArrowRight: 'der', KeyD: 'der',
  ArrowUp: 'arr', KeyW: 'arr',
  ArrowDown: 'abj', KeyS: 'abj',
  KeyZ: 'a', Space: 'a', Enter: 'a', NumpadEnter: 'a', KeyJ: 'a',
  KeyX: 'b', Escape: 'b', Backspace: 'b', KeyK: 'b',
  KeyM: 'menu', KeyP: 'menu', Tab: 'menu',
};

// Estado público que leen las escenas en cada paso de actualización.
export const E = {
  pulsado: {},   // se ha pulsado en este paso
  mantenido: {}, // está apretado
  toque: null,   // toque en la pantalla (coordenadas virtuales) en este paso
  letra: null,   // letra escrita con el teclado físico en este paso
};

const teclasAbajo = new Set();
const cruceta = { izq: false, der: false, arr: false, abj: false };
const botonesTactiles = { a: new Set(), b: new Set(), menu: new Set() };
const enganche = {};
const colaToques = [];
const colaLetras = [];
const oyentesGesto = [];

for (const b of BOTONES) {
  E.pulsado[b] = false;
  E.mantenido[b] = false;
  enganche[b] = false;
}

function apretado(b) {
  for (const code of teclasAbajo) if (TECLAS[code] === b) return true;
  if (b in cruceta && cruceta[b]) return true;
  if (botonesTactiles[b] && botonesTactiles[b].size > 0) return true;
  return false;
}

function modoTeclado(si) {
  if (document.body.classList.contains('teclado') === si) return;
  document.body.classList.toggle('teclado', si);
  ajustar();
}

function avisarGesto() {
  for (const fn of oyentesGesto) fn();
}

// Para desbloquear el audio en iOS hay que hacerlo dentro de un gesto.
export function alPrimerGesto(fn) {
  oyentesGesto.push(fn);
}

export function iniciarEntrada(canvas) {
  const tactil = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!tactil) document.body.classList.add('sin-tactil');
  ajustar();

  addEventListener('keydown', (e) => {
    const b = TECLAS[e.code];
    if (e.key && e.key.length === 1 && !e.metaKey && !e.ctrlKey) colaLetras.push(e.key);
    if (e.code === 'Backspace') colaLetras.push('\b');
    if (!b) return;
    e.preventDefault();
    modoTeclado(true);
    avisarGesto();
    if (!e.repeat) {
      teclasAbajo.add(e.code);
      enganche[b] = true;
    }
  });
  addEventListener('keyup', (e) => {
    teclasAbajo.delete(e.code);
  });
  addEventListener('blur', soltarTodo);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) soltarTodo();
  });

  // Toques directamente sobre la pantalla del juego (menús, diálogos...).
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (e.pointerType !== 'mouse') modoTeclado(false);
    avisarGesto();
    colaToques.push(aVirtual(e.clientX, e.clientY));
  });

  // Cruceta: se decide la dirección por el ángulo respecto al centro.
  const elCruceta = document.getElementById('cruceta');
  const punterosCruceta = new Map();
  const actualizarCruceta = () => {
    const antes = { ...cruceta };
    cruceta.izq = cruceta.der = cruceta.arr = cruceta.abj = false;
    for (const d of punterosCruceta.values()) for (const k of d) cruceta[k] = true;
    for (const k in cruceta) {
      if (cruceta[k] && !antes[k]) enganche[k] = true;
      const flecha = elCruceta.querySelector('.' + k);
      if (flecha) flecha.classList.toggle('activa', cruceta[k]);
    }
  };
  const direccionDe = (e) => {
    const r = elCruceta.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * 0.1) return [];
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = derecha, 90 = abajo
    const dirs = [];
    if (ang > -67.5 && ang < 67.5) dirs.push('der');
    if (ang > 112.5 || ang < -112.5) dirs.push('izq');
    if (ang > 22.5 && ang < 157.5) dirs.push('abj');
    if (ang < -22.5 && ang > -157.5) dirs.push('arr');
    return dirs;
  };
  elCruceta.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    modoTeclado(false);
    avisarGesto();
    try { elCruceta.setPointerCapture(e.pointerId); } catch { /* nada */ }
    punterosCruceta.set(e.pointerId, direccionDe(e));
    actualizarCruceta();
  });
  elCruceta.addEventListener('pointermove', (e) => {
    if (!punterosCruceta.has(e.pointerId)) return;
    e.preventDefault();
    punterosCruceta.set(e.pointerId, direccionDe(e));
    actualizarCruceta();
  });
  const soltarCruceta = (e) => {
    punterosCruceta.delete(e.pointerId);
    actualizarCruceta();
  };
  elCruceta.addEventListener('pointerup', soltarCruceta);
  elCruceta.addEventListener('pointercancel', soltarCruceta);
  elCruceta.addEventListener('lostpointercapture', soltarCruceta);

  // Botones A, B y MENÚ.
  for (const el of document.querySelectorAll('[data-boton]')) {
    const b = el.dataset.boton;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      modoTeclado(false);
      avisarGesto();
      try { el.setPointerCapture(e.pointerId); } catch { /* nada */ }
      botonesTactiles[b].add(e.pointerId);
      enganche[b] = true;
      el.classList.add('activo');
    });
    const soltar = (e) => {
      botonesTactiles[b].delete(e.pointerId);
      if (botonesTactiles[b].size === 0) el.classList.remove('activo');
    };
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('lostpointercapture', soltar);
  }

  // Evita el zoom y el menú contextual de iOS.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

function soltarTodo() {
  teclasAbajo.clear();
  cruceta.izq = cruceta.der = cruceta.arr = cruceta.abj = false;
  for (const k in botonesTactiles) botonesTactiles[k].clear();
  document.querySelectorAll('.activa, .activo').forEach((el) => el.classList.remove('activa', 'activo'));
}

// Se llama al principio de cada paso de actualización.
export function pasoEntrada() {
  for (const b of BOTONES) {
    E.pulsado[b] = enganche[b];
    enganche[b] = false;
    E.mantenido[b] = apretado(b) || E.pulsado[b];
  }
  E.toque = colaToques.length ? colaToques.shift() : null;
  E.letra = colaLetras.length ? colaLetras.shift() : null;
}

// Útil cuando cambia de escena: que nada "se arrastre" a la siguiente.
export function vaciarEntrada() {
  for (const b of BOTONES) {
    enganche[b] = false;
    E.pulsado[b] = false;
  }
  colaToques.length = 0;
  colaLetras.length = 0;
  E.toque = null;
  E.letra = null;
}

// ¿Se ha pulsado "aceptar" de cualquier forma (A o tocar la pantalla)?
export function aceptar() {
  return E.pulsado.a || !!E.toque;
}
