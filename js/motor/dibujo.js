// Utilidades para crear sprites de píxeles por código.

export const CONTORNO = '#282c3c';

export function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

// Quita el suavizado de los bordes: cada píxel es opaco o transparente.
export function nitidez(c) {
  const ctx = c.getContext('2d');
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 110 ? 255 : 0;
  ctx.putImageData(img, 0, 0);
  return c;
}

// Añade un contorno de 1 px alrededor de la figura (estilo Pokémon).
export function contorno(c, color = CONTORNO) {
  const ctx = c.getContext('2d');
  const w = c.width;
  const h = c.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const opaco = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) opaco[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  const [r, g, b] = rgb(color);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (opaco[i]) continue;
      const vecino =
        (x > 0 && opaco[i - 1]) ||
        (x < w - 1 && opaco[i + 1]) ||
        (y > 0 && opaco[i - w]) ||
        (y < h - 1 && opaco[i + w]);
      if (vecino) {
        d[i * 4] = r;
        d[i * 4 + 1] = g;
        d[i * 4 + 2] = b;
        d[i * 4 + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Dibuja con primitivas y lo convierte en pixel art con contorno.
export function figura(w, h, dibujar, { borde = CONTORNO, nitido = true } = {}) {
  const [c, ctx] = lienzo(w, h);
  dibujar(ctx);
  if (nitido) nitidez(c);
  if (borde) contorno(c, borde);
  return c;
}

export function espejo(c) {
  const [m, ctx] = lienzo(c.width, c.height);
  ctx.translate(c.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(c, 0, 0);
  return m;
}

export function escalar(c, k) {
  const [m, ctx] = lienzo(c.width * k, c.height * k);
  ctx.drawImage(c, 0, 0, c.width * k, c.height * k);
  return m;
}

// Versión en un solo color (para destellos y siluetas).
export function silueta(c, color) {
  const [m, ctx] = lienzo(c.width, c.height);
  ctx.drawImage(c, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return m;
}

export function rgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

export function oscurecer(color, f = 0.75) {
  const [r, g, b] = rgb(color);
  return hex(r * f, g * f, b * f);
}

export function aclarar(color, f = 0.35) {
  const [r, g, b] = rgb(color);
  return hex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

export function mezclar(a, b, t) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

// Atajos para dibujar.
export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function elipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.fill();
}

export function circulo(ctx, cx, cy, r, color) {
  elipse(ctx, cx, cy, r, r, color);
}

export function poligono(ctx, puntos, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(puntos[0], puntos[1]);
  for (let i = 2; i < puntos.length; i += 2) ctx.lineTo(puntos[i], puntos[i + 1]);
  ctx.closePath();
  ctx.fill();
}

export function linea(ctx, x1, y1, x2, y2, color, grosor = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = grosor;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Sprite a partir de un mapa de caracteres y una paleta.
export function pixeles(filas, paleta) {
  const h = filas.length;
  const w = Math.max(...filas.map((f) => f.length));
  const [c, ctx] = lienzo(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < filas[y].length; x++) {
      const col = paleta[filas[y][x]];
      if (col) rect(ctx, x, y, 1, 1, col);
    }
  }
  return c;
}

// Generador pseudoaleatorio con semilla (para que los decorados no cambien).
export function azar(semilla) {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
