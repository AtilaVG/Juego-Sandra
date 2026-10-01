// Resolución virtual: siempre 192 px de alto (como la pantalla de una DS)
// y el ancho se adapta a la proporción del dispositivo.
export const P = { ancho: 256, alto: 192, vertical: false };

let lienzo, ctxLienzo, buffer, ctx;
const oyentes = [];

export function iniciarPantalla(canvas) {
  lienzo = canvas;
  ctxLienzo = canvas.getContext('2d');
  buffer = document.createElement('canvas');
  ctx = buffer.getContext('2d');
  ajustar();
  addEventListener('resize', ajustar);
  addEventListener('orientationchange', () => setTimeout(ajustar, 250));
  return ctx;
}

export function alCambiarTamano(fn) {
  oyentes.push(fn);
}

// ¿Se ven los botones táctiles? (en un iPad sin teclado, sí)
function hayTactil() {
  const b = document.body.classList;
  return !b.contains('teclado') && !b.contains('sin-tactil');
}

export function ajustar() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vertical = vh > vw * 1.05;
  P.vertical = vertical;
  document.body.classList.toggle('vertical', vertical);

  // En horizontal con botones táctiles se dejan paneles a los lados
  // para que la cruceta y los botones no tapen el juego.
  const paneles = !vertical && hayTactil();
  const panel = paneles ? Math.round(Math.max(124, Math.min(190, vw * 0.145))) : 0;
  document.body.classList.toggle('paneles', paneles);
  document.documentElement.style.setProperty('--panel', panel + 'px');
  const util = vw - panel * 2;

  let ancho = vertical ? 256 : Math.round((P.alto * util) / vh);
  ancho = Math.max(256, Math.min(400, ancho));
  ancho -= ancho % 2;
  P.ancho = ancho;
  buffer.width = ancho;
  buffer.height = P.alto;
  ctx.imageSmoothingEnabled = false;

  const escala = vertical ? vw / ancho : Math.min(util / ancho, vh / P.alto);
  const cssW = Math.floor(ancho * escala);
  const cssH = Math.floor(P.alto * escala);
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  lienzo.style.width = cssW + 'px';
  lienzo.style.height = cssH + 'px';
  lienzo.width = Math.round(cssW * dpr);
  lienzo.height = Math.round(cssH * dpr);
  ctxLienzo.imageSmoothingEnabled = false;
  for (const fn of oyentes) fn();
}

export function presentar() {
  ctxLienzo.imageSmoothingEnabled = false;
  ctxLienzo.drawImage(buffer, 0, 0, lienzo.width, lienzo.height);
}

// Convierte coordenadas de la ventana a coordenadas del juego.
export function aVirtual(clientX, clientY) {
  const r = lienzo.getBoundingClientRect();
  return {
    x: ((clientX - r.left) / r.width) * P.ancho,
    y: ((clientY - r.top) / r.height) * P.alto,
  };
}

export function contexto() {
  return ctx;
}
