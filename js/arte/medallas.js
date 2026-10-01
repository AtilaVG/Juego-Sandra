// Las medallas (una por aventura).
import { figura, rect, circulo, elipse, poligono, silueta } from '../motor/dibujo.js';

const cache = new Map();

const DIBUJOS = {
  piscina(c) {
    poligono(c, [12, 2, 20, 14, 4, 14], '#58a8f0');
    circulo(c, 12, 15, 8, '#58a8f0');
    circulo(c, 9, 13, 3, '#a8dcff');
  },
  lasertag(c) {
    poligono(c, [14, 1, 5, 13, 11, 13, 8, 23, 19, 9, 13, 9, 17, 1], '#c050f0');
    poligono(c, [14, 3, 8, 12, 12, 12], '#f0a8ff');
  },
  thyssen(c) {
    rect(c, 2, 4, 20, 16, '#d8a838');
    rect(c, 5, 7, 14, 10, '#88b8e8');
    rect(c, 5, 13, 14, 4, '#78b058');
    circulo(c, 15, 10, 1.6, '#f8e070');
  },
  series(c) {
    rect(c, 2, 5, 20, 14, '#3a3a48');
    rect(c, 4, 7, 16, 10, '#5a8af0');
    rect(c, 9, 19, 6, 3, '#3a3a48');
    rect(c, 6, 9, 4, 2, '#d8e8ff');
  },
  cumple(c) {
    rect(c, 3, 11, 18, 10, '#f8d0a0');
    rect(c, 3, 11, 18, 3, '#f890b8');
    rect(c, 11, 4, 2, 7, '#5a9af8');
    elipse(c, 12, 3, 2, 2.5, '#f8a020');
  },
  comida(c) {
    circulo(c, 8, 9, 5, '#f05070');
    circulo(c, 16, 9, 5, '#f05070');
    poligono(c, [3, 11, 21, 11, 12, 21], '#f05070');
    rect(c, 6, 7, 3, 2, '#ffb0c0');
  },
  maquillaje(c) {
    rect(c, 7, 12, 10, 10, '#d8a838');
    rect(c, 8, 13, 8, 8, '#f0c850');
    rect(c, 8, 6, 8, 7, '#d82040');
    poligono(c, [8, 6, 16, 2, 16, 6], '#e84060');
    rect(c, 9, 7, 2, 5, '#f87890');
  },
  uni(c) {
    poligono(c, [12, 4, 23, 9, 12, 14, 1, 9], '#383848');
    rect(c, 6, 11, 12, 6, '#383848');
    rect(c, 20, 9, 1, 8, '#f8d030');
    circulo(c, 20, 18, 1.5, '#f8d030');
  },
  cenas(c) {
    circulo(c, 7, 8, 5, '#ffffff');
    circulo(c, 12, 6, 6, '#ffffff');
    circulo(c, 17, 8, 5, '#ffffff');
    rect(c, 6, 11, 12, 9, '#ffffff');
    rect(c, 6, 17, 12, 2, '#d0d0d8');
  },
  rural(c) {
    poligono(c, [12, 2, 23, 21, 1, 21], '#7a8aa0');
    poligono(c, [12, 2, 16, 9, 8, 9], '#ffffff');
    poligono(c, [1, 21, 7, 14, 12, 21], '#4a8a48');
    poligono(c, [12, 21, 18, 15, 23, 21], '#4a8a48');
  },
  madrid(c) {
    circulo(c, 12, 12, 7, '#f8a030');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      circulo(c, 12 + Math.cos(a) * 10, 12 + Math.sin(a) * 10, 1.6, '#f8d030');
    }
    circulo(c, 10, 10, 2.5, '#ffd880');
  },
};

export function medalla(id, conseguida = true) {
  const k = id + conseguida;
  if (!cache.has(k)) {
    const m = figura(24, 24, (c) => DIBUJOS[id](c));
    cache.set(k, conseguida ? m : silueta(m, '#8890a0'));
  }
  return cache.get(k);
}
