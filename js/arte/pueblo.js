// Gráficos del pueblo: suelo, árboles, mobiliario y edificios.
import { lienzo, contorno, rect, elipse, circulo, hash, oscurecer, aclarar, figura } from '../motor/dibujo.js';
import { escribirCentrado, anchoTexto, escribir } from '../motor/fuente.js';

const T = 16;
const C = {
  cesped: '#8ed46c',
  cespedOsc: '#6cb850',
  cespedClaro: '#b0e88c',
  camino: '#ecdcaa',
  caminoBorde: '#cdb47c',
  caminoPiedra: '#dcc894',
  plaza: '#dcdce4',
  plazaLinea: '#babac8',
  agua: '#58a8f0',
  aguaClaro: '#a8dcff',
  aguaOsc: '#3c88d8',
  valla: '#f4f4f4',
  vallaSombra: '#a8a8b8',
};

const esCamino = (c) => c === ':' || c === 'D';
const esPlaza = (c) => c === '_' || c === 'o' || c === 'P' || c === 'b';

function cesped(ctx, x, y, tx, ty, flores) {
  rect(ctx, x, y, T, T, C.cesped);
  const h = hash(tx, ty);
  for (let i = 0; i < 3; i++) {
    const px = x + ((h >> (i * 4)) & 15);
    const py = y + ((h >> (i * 4 + 12)) & 13);
    rect(ctx, px, py + 1, 1, 2, C.cespedOsc);
    rect(ctx, px + 1, py, 1, 2, C.cespedOsc);
    rect(ctx, px + 2, py + 1, 1, 2, C.cespedOsc);
  }
  if ((h & 7) === 0) rect(ctx, x + ((h >> 5) & 13), y + ((h >> 9) & 13), 2, 1, C.cespedClaro);
  if (flores) {
    const cols = ['#f05060', '#f8d040', '#ffffff', '#f080c0'];
    for (let i = 0; i < 4; i++) {
      const fx = x + 2 + (i % 2) * 7 + ((h >> i) & 1) * 2;
      const fy = y + 2 + Math.floor(i / 2) * 7;
      const col = cols[(h >> (i * 2)) & 3];
      rect(ctx, fx + 1, fy, 1, 1, col);
      rect(ctx, fx, fy + 1, 3, 1, col);
      rect(ctx, fx + 1, fy + 2, 1, 1, col);
      rect(ctx, fx + 1, fy + 1, 1, 1, '#f8e070');
      rect(ctx, fx + 1, fy + 3, 1, 2, C.cespedOsc);
    }
  }
}

function camino(ctx, x, y, tx, ty, vecino) {
  rect(ctx, x, y, T, T, C.camino);
  const h = hash(tx, ty);
  for (let i = 0; i < 3; i++) rect(ctx, x + ((h >> (i * 5)) & 14), y + ((h >> (i * 5 + 3)) & 14), 2, 1, C.caminoPiedra);
  const borde = (dx, dy) => {
    const v = vecino(tx + dx, ty + dy);
    return !esCamino(v) && !esPlaza(v);
  };
  if (borde(0, -1)) rect(ctx, x, y, T, 1, C.caminoBorde);
  if (borde(0, 1)) rect(ctx, x, y + T - 1, T, 1, C.caminoBorde);
  if (borde(-1, 0)) rect(ctx, x, y, 1, T, C.caminoBorde);
  if (borde(1, 0)) rect(ctx, x + T - 1, y, 1, T, C.caminoBorde);
}

function plaza(ctx, x, y, tx, ty) {
  rect(ctx, x, y, T, T, C.plaza);
  const desp = ty % 2 ? 8 : 0;
  rect(ctx, x, y + 7, T, 1, C.plazaLinea);
  rect(ctx, x, y + 15, T, 1, C.plazaLinea);
  rect(ctx, x + ((desp + 4) % 16), y, 1, 7, C.plazaLinea);
  rect(ctx, x + ((desp + 12) % 16), y + 8, 1, 7, C.plazaLinea);
  if ((tx + ty) % 5 === 0) rect(ctx, x + 2, y + 2, 3, 3, '#e8e8ee');
}

function valla(ctx, x, y, vecino, tx, ty) {
  const izq = vecino(tx - 1, ty) === 'F';
  const der = vecino(tx + 1, ty) === 'F';
  rect(ctx, x + 6, y + 2, 4, 12, C.valla);
  rect(ctx, x + 6, y + 13, 4, 1, C.vallaSombra);
  rect(ctx, x + 6, y + 2, 4, 1, '#ffffff');
  if (izq) {
    rect(ctx, x, y + 5, 7, 2, C.valla);
    rect(ctx, x, y + 10, 7, 2, C.valla);
  }
  if (der) {
    rect(ctx, x + 9, y + 5, 7, 2, C.valla);
    rect(ctx, x + 9, y + 10, 7, 2, C.valla);
  }
  rect(ctx, x + 5, y + 2, 1, 12, C.vallaSombra);
}

function vias(ctx, x, y, ty) {
  rect(ctx, x, y, T, T, '#a09888');
  for (let i = 0; i < 4; i++) rect(ctx, x + ((i * 5 + ty * 3) % 16), y + ((i * 7) % 16), 1, 1, '#887e70');
  if (ty === 26) {
    rect(ctx, x + 1, y + 6, 4, 10, '#6a4a34');
    rect(ctx, x + 9, y + 6, 4, 10, '#6a4a34');
    rect(ctx, x, y + 9, T, 2, '#c0c0cc');
  } else {
    rect(ctx, x + 1, y, 4, 8, '#6a4a34');
    rect(ctx, x + 9, y, 4, 8, '#6a4a34');
    rect(ctx, x, y + 3, T, 2, '#c0c0cc');
  }
}

function seto(ctx, x, y) {
  rect(ctx, x, y + 2, T, 13, '#3c8c44');
  rect(ctx, x, y + 2, T, 3, '#5aac58');
  for (let i = 0; i < 4; i++) rect(ctx, x + i * 4 + 1, y + 7 + (i % 2) * 3, 2, 2, '#2e7036');
  rect(ctx, x, y + 14, T, 1, '#24582a');
}

// Pinta todo el suelo fijo del mapa en un lienzo grande.
export function crearSuelo(mapa) {
  const alto = mapa.length;
  const ancho = mapa[0].length;
  const [c, ctx] = lienzo(ancho * T, alto * T);
  const vecino = (x, y) => (mapa[y] && mapa[y][x]) || 'T';
  for (let ty = 0; ty < alto; ty++) {
    for (let tx = 0; tx < ancho; tx++) {
      const ch = mapa[ty][tx];
      const x = tx * T;
      const y = ty * T;
      if (esPlaza(ch)) plaza(ctx, x, y, tx, ty);
      else if (ch === ':') camino(ctx, x, y, tx, ty, vecino);
      else if (ch === '=') vias(ctx, x, y, ty);
      else if (ch === '~') rect(ctx, x, y, T, T, C.agua);
      else cesped(ctx, x, y, tx, ty, ch === ',');
      if (ch === 'F') valla(ctx, x, y, vecino, tx, ty);
      if (ch === 'h') seto(ctx, x, y);
      // Bordillo de la piscina alrededor del agua.
      if (ch === 'F' && (vecino(tx, ty + 1) === '~' || vecino(tx, ty - 1) === '~' || vecino(tx - 1, ty) === '~' || vecino(tx + 1, ty) === '~')) {
        rect(ctx, x, y, T, T, '#e8f0f8');
        rect(ctx, x, y, T, 1, '#c8d4e4');
        valla(ctx, x, y, vecino, tx, ty);
      }
    }
  }
  return c;
}

// Agua animada (se pinta encima cada fotograma).
export function dibujarAgua(ctx, x, y, tx, ty, t, esquina) {
  rect(ctx, x, y, T, T, C.agua);
  const fase = Math.floor(t / 20 + tx * 3 + ty * 5) % 16;
  rect(ctx, x + fase, y + 4, 4, 1, C.aguaClaro);
  rect(ctx, x + ((fase + 8) % 16), y + 11, 3, 1, C.aguaClaro);
  if (ty === 20) rect(ctx, x, y + 7, T, 1, (tx + Math.floor(t / 30)) % 2 ? '#f04050' : '#ffffff');
  if (esquina) rect(ctx, x, y, T, 2, C.aguaOsc);
}

// ---------------------------------------------------------------- objetos

const cache = new Map();
function memo(k, fn) {
  if (!cache.has(k)) cache.set(k, fn());
  return cache.get(k);
}

export function arbol(variante = 0) {
  return memo('arbol' + variante, () =>
    figura(16, 26, (c) => {
      rect(c, 6, 18, 4, 7, '#8a5a3a');
      rect(c, 6, 18, 1, 7, '#a87850');
      const verde = variante ? '#3e9e50' : '#3a9448';
      elipse(c, 8, 11, 7.5, 7, '#2c7a3c');
      elipse(c, 8, 9, 7, 6.5, verde);
      elipse(c, 6, 7, 3.5, 3, '#5cbc5c');
      elipse(c, 5, 6, 1.5, 1.2, '#88dc80');
      rect(c, 10, 13, 2, 2, '#2c7a3c');
      rect(c, 3, 11, 2, 1, '#2c7a3c');
      elipse(c, 8, 25, 5, 1, '#2c7a3c');
    }),
  );
}

export function farola() {
  return memo('farola', () =>
    figura(16, 34, (c) => {
      rect(c, 7, 8, 2, 25, '#404858');
      rect(c, 6, 30, 4, 3, '#303846');
      rect(c, 4, 3, 8, 6, '#404858');
      rect(c, 5, 4, 6, 4, '#fff4b0');
      rect(c, 6, 1, 4, 2, '#404858');
    }),
  );
}

export function cabina() {
  return memo('cabina', () =>
    figura(16, 30, (c) => {
      rect(c, 2, 4, 12, 25, '#3a7ac8');
      rect(c, 4, 8, 8, 15, '#bfe0f8');
      rect(c, 6, 11, 4, 6, '#404850');
      rect(c, 7, 12, 2, 2, '#c0c8d0');
      rect(c, 2, 1, 12, 4, '#2a5a98');
      rect(c, 4, 2, 8, 2, '#f8f8f8');
      rect(c, 2, 27, 12, 2, '#2a5a98');
    }),
  );
}

export function cartel() {
  return memo('cartel', () =>
    figura(16, 18, (c) => {
      rect(c, 7, 9, 2, 8, '#7a5030');
      rect(c, 1, 2, 14, 9, '#c8945a');
      rect(c, 2, 3, 12, 7, '#e0b070');
      rect(c, 3, 5, 10, 1, '#a07040');
      rect(c, 3, 7, 7, 1, '#a07040');
    }),
  );
}

export function banco() {
  return memo('banco', () =>
    figura(16, 16, (c) => {
      rect(c, 1, 4, 14, 3, '#b07848');
      rect(c, 1, 8, 14, 3, '#c8905a');
      rect(c, 2, 11, 2, 4, '#404858');
      rect(c, 12, 11, 2, 4, '#404858');
    }),
  );
}

export function fuente(f) {
  return memo('fuente' + f, () =>
    figura(32, 34, (c) => {
      elipse(c, 16, 22, 15, 10, '#b8b8c8');
      elipse(c, 16, 21, 13, 8, '#58a8f0');
      elipse(c, 16, 21, 4, 3, '#a8a8b8');
      rect(c, 14, 10, 4, 11, '#b8b8c8');
      const alto = f ? 2 : 4;
      elipse(c, 16, 7 + alto / 2, 3, 4 + alto / 2, '#a8dcff');
      rect(c, 9 + f * 2, 17, 2, 2, '#ffffff');
      rect(c, 20 - f * 2, 23, 2, 1, '#ffffff');
    }),
  );
}

// ---------------------------------------------------------------- edificios

function ventana(ctx, x, y, w = 10, h = 9, cristal = '#88c8f0') {
  rect(ctx, x, y, w, h, '#f8f8f8');
  rect(ctx, x + 1, y + 1, w - 2, h - 2, cristal);
  rect(ctx, x + 1, y + 1, 3, 2, '#d8f0ff');
  rect(ctx, x + Math.floor(w / 2), y + 1, 1, h - 2, '#f8f8f8');
  rect(ctx, x - 1, y + h, w + 2, 1, '#909098');
}

function puerta(ctx, x, y, col = '#9a6038') {
  rect(ctx, x, y, 12, 16, oscurecer(col, 0.7));
  rect(ctx, x + 1, y + 1, 10, 15, col);
  rect(ctx, x + 3, y + 3, 6, 5, '#a8d8f8');
  rect(ctx, x + 8, y + 10, 2, 2, '#f8d040');
}

function rotulo(ctx, texto, cx, y, fondo = '#f8f0d8', letra = '#404048') {
  const w = anchoTexto(texto) + 8;
  rect(ctx, Math.round(cx - w / 2) - 1, y - 1, w + 2, 13, '#383838');
  rect(ctx, Math.round(cx - w / 2), y, w, 11, fondo);
  escribirCentrado(ctx, texto, cx, y + 1, letra, null);
}

function tejado(ctx, W, alto, color) {
  rect(ctx, 0, 0, W, alto, color);
  for (let y = 3; y < alto - 3; y += 4) rect(ctx, 0, y, W, 1, oscurecer(color, 0.85));
  rect(ctx, 0, 0, W, 2, aclarar(color, 0.3));
  rect(ctx, 0, alto - 3, W, 3, oscurecer(color, 0.65));
}

export function edificio(b) {
  return memo('edif' + b.id, () => {
    const W = b.w * T;
    const H = b.h * T + 4;
    const [c, ctx] = lienzo(W, H);
    const muroY = H - 36;
    const puertaX = b.puerta != null ? (b.puerta - b.x) * T + 2 : null;
    const ventanas = (y, cristal) => {
      for (let i = 0; i < b.w; i++) {
        const vx = i * T + 3;
        if (puertaX != null && Math.abs(vx - puertaX) < 12) continue;
        ventana(ctx, vx, y, 10, 9, cristal);
      }
    };

    if (b.estilo === 'casa') {
      tejado(ctx, W, muroY + 2, b.techo);
      rect(ctx, 0, muroY, W, 36, '#f8f0e0');
      rect(ctx, 0, muroY, W, 2, '#d8d0c0');
      rect(ctx, 0, H - 3, W, 3, '#b8b0a0');
      ventanas(muroY + 8);
      if (puertaX != null) puerta(ctx, puertaX, H - 17);
      if (b.rotulo) rotulo(ctx, b.rotulo, W / 2, muroY - 14);
    } else if (b.estilo === 'lasertag') {
      rect(ctx, 0, 0, W, H, '#2c2440');
      rect(ctx, 0, 0, W, 6, '#3c3458');
      for (let x = 4; x < W; x += 12) rect(ctx, x, 10, 6, muroY - 14, '#342c4c');
      rect(ctx, 0, muroY, W, 36, '#3a3050');
      rect(ctx, 0, muroY + 4, W, 2, '#ff40c0');
      rect(ctx, 0, H - 8, W, 2, '#40e0ff');
      puerta(ctx, puertaX, H - 17, '#505070');
      rect(ctx, W / 2 - 34, 12, 68, 15, '#151020');
      escribirCentrado(ctx, b.rotulo, W / 2, 14, '#ff60d0', '#7a2070');
    } else if (b.estilo === 'ayuntamiento') {
      tejado(ctx, W, muroY + 2, '#b85a3a');
      rect(ctx, W / 2 - 12, 0, 24, muroY, '#e8dcc0');
      circulo(ctx, W / 2, 10, 7, '#f8f8f8');
      circulo(ctx, W / 2, 10, 6, '#fffbe8');
      rect(ctx, W / 2, 5, 1, 5, '#303030');
      rect(ctx, W / 2, 10, 4, 1, '#303030');
      rect(ctx, 0, muroY, W, 36, '#e8dcc0');
      for (let i = 0; i < b.w; i++) {
        const ax = i * T + 2;
        if (Math.abs(ax - puertaX) < 8) continue;
        rect(ctx, ax, muroY + 12, 12, 21, '#8a7a60');
        circulo(ctx, ax + 6, muroY + 13, 6, '#8a7a60');
        rect(ctx, ax + 2, muroY + 12, 8, 21, '#5a4e40');
      }
      puerta(ctx, puertaX, H - 17, '#7a4a2a');
      rect(ctx, 6, 2, 1, muroY - 4, '#606060');
      rect(ctx, 7, 2, 10, 3, '#d83030');
      rect(ctx, 7, 5, 10, 3, '#f8d030');
      rect(ctx, 7, 8, 10, 2, '#d83030');
      rotulo(ctx, b.rotulo, W / 2, muroY + 1, '#f8f0d8');
    } else if (b.estilo === 'oficina') {
      rect(ctx, 0, 0, W, H, '#a8b0bc');
      rect(ctx, 0, 0, W, 4, '#c8d0dc');
      for (let y = 8; y < muroY; y += 13) ventanas(y, '#78b0e0');
      rect(ctx, 0, muroY, W, 36, '#98a0ac');
      ventanas(muroY + 8, '#78b0e0');
      puerta(ctx, puertaX, H - 17, '#5a6a80');
      rotulo(ctx, b.rotulo, W / 2, muroY - 2, '#f8f8f8');
    } else if (b.estilo === 'piscina') {
      rect(ctx, 0, 0, W, H, '#f4f8fc');
      rect(ctx, 0, 0, W, 4, '#58a8f0');
      rect(ctx, 0, H - 14, W, 2, '#58a8f0');
      ventanas(18, '#a8dcff');
      puerta(ctx, puertaX, H - 17, '#58a8f0');
      rotulo(ctx, b.rotulo, W / 2, 4, '#ffffff', '#3060c0');
    } else if (b.estilo === 'estacion') {
      tejado(ctx, W, muroY + 2, '#a83a3a');
      rect(ctx, 0, muroY, W, 36, '#f0e8d0');
      rect(ctx, 0, muroY, W, 3, '#e04040');
      ventanas(muroY + 9, '#88c8f0');
      puerta(ctx, puertaX, H - 17, '#a83a3a');
      circulo(ctx, 12, muroY - 8, 6, '#f8f8f8');
      rect(ctx, 12, muroY - 12, 1, 4, '#303030');
      rect(ctx, 12, muroY - 8, 3, 1, '#303030');
      rotulo(ctx, b.rotulo, W / 2, muroY - 13, '#ffffff', '#c03030');
    } else if (b.estilo === 'coche') {
      // Coche aparcado (visto desde arriba y un poco de lado).
      const [cc, cx] = lienzo(W, H);
      rect(cx, 2, 3, W - 4, 13, '#e04848');
      rect(cx, 1, 5, W - 2, 9, '#e04848');
      rect(cx, 8, 3, 14, 9, '#a8d8f8');
      rect(cx, 10, 4, 4, 3, '#e0f4ff');
      rect(cx, 2, 13, W - 4, 3, '#b83030');
      rect(cx, 4, 15, 6, 4, '#2a2a30');
      rect(cx, W - 10, 15, 6, 4, '#2a2a30');
      rect(cx, W - 3, 7, 2, 3, '#f8e880');
      rect(cx, 22, 6, 2, 1, '#f8f8f8');
      return contorno(cc);
    } else if (b.estilo === 'bar') {
      tejado(ctx, W, muroY + 2, '#6a8a3a');
      rect(ctx, 0, muroY, W, 36, '#f8e8c8');
      for (let x = 0; x < W; x += 8) rect(ctx, x, muroY, 4, 6, '#d84040');
      for (let x = 4; x < W; x += 8) rect(ctx, x, muroY, 4, 6, '#f8f8f8');
      ventanas(muroY + 10, '#f8d890');
      puerta(ctx, puertaX, H - 17, '#8a5a30');
      rotulo(ctx, b.rotulo, W / 2, muroY - 14, '#f8d040', '#5a3010');
    }
    return contorno(c);
  });
}

// Indicador "!" que salta encima del siguiente destino.
export function dibujarExclamacion(ctx, x, y, t) {
  const sy = y - Math.abs(Math.sin(t / 10)) * 4;
  rect(ctx, x - 5, sy - 1, 11, 16, '#383838');
  rect(ctx, x - 4, sy, 9, 14, '#f8d030');
  rect(ctx, x - 1, sy + 2, 3, 6, '#383838');
  rect(ctx, x - 1, sy + 10, 3, 2, '#383838');
}

export { escribir };
