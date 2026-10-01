// Generador de personajes "chibi" (16x24) en 4 direcciones con 3 fotogramas.
import { lienzo, contorno, espejo, oscurecer, aclarar } from '../motor/dibujo.js';
import { PERSONAJES } from '../datos/config.js';

const W = 16;
const H = 24;

function pintor(ctx) {
  return (x, y, w, h, col) => {
    if (!col) return;
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  };
}

function colorCamiseta(k, r, x, y, w, h) {
  if (k.camiseta === 'cuadros') {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) r(xx, yy, 1, 1, (xx + yy) % 2 ? '#f4f4f4' : '#26262c');
  } else r(x, y, w, h, k.camiseta);
}

function tonoCamiseta(k) {
  return k.camiseta === 'cuadros' ? '#5a5a62' : k.camiseta;
}

// ---------------------------------------------------------------- de frente

function frente(ctx, k, paso) {
  const r = pintor(ctx);
  const pelo = k.pelo;
  const piel = k.piel;
  const camisa = tonoCamiseta(k);

  // Pelo largo por detrás.
  if (k.estilo === 'largo') r(2, 6, 12, 10, pelo);
  if (k.estilo === 'media') r(2, 6, 12, 7, pelo);

  // Piernas y zapatos.
  const subeI = paso === 1 ? 1 : 0;
  const subeD = paso === 2 ? 1 : 0;
  r(5, 19, 2, 3 - subeI, k.pantalon);
  r(9, 19, 2, 3 - subeD, k.pantalon);
  r(4, 22 - subeI, 3, 1, k.zapatos);
  r(9, 22 - subeD, 3, 1, k.zapatos);

  // Cuerpo.
  colorCamiseta(k, r, 4, 13, 8, 6);
  r(4, 18, 8, 1, oscurecer(camisa, 0.8));
  if (k.tirantes) {
    r(4, 13, 1, 1, piel);
    r(11, 13, 1, 1, piel);
  }
  if (k.collar) {
    r(6, 13, 4, 1, piel);
    r(7, 14, 2, 1, k.collar);
  }

  // Brazos (balanceo al andar).
  const bI = paso === 2 ? 1 : 0;
  const bD = paso === 1 ? 1 : 0;
  const manga = k.tirantes ? piel : camisa;
  r(3, 13 + bI, 1, 3, manga);
  r(3, 16 + bI, 1, 1, piel);
  r(12, 13 + bD, 1, 3, manga);
  r(12, 16 + bD, 1, 1, piel);

  // Cabeza.
  r(4, 4, 8, 9, piel);
  r(3, 5, 10, 7, piel);

  // Pelo.
  r(4, 2, 8, 1, pelo);
  r(3, 3, 10, 2, pelo);
  r(2, 4, 12, 1, pelo);
  if (k.estilo === 'recogido' || k.estilo === 'coleta') {
    // Raya en medio y el pelo hacia atrás.
    r(3, 5, 2, 1, pelo);
    r(11, 5, 2, 1, pelo);
    r(2, 5, 1, 4, pelo);
    r(13, 5, 1, 4, pelo);
    r(7, 3, 2, 1, oscurecer(pelo, 0.7));
  } else if (k.estilo === 'largo' || k.estilo === 'media') {
    r(3, 5, 4, 1, pelo);
    r(9, 5, 4, 1, pelo);
    r(2, 5, 2, k.estilo === 'largo' ? 11 : 8, pelo);
    r(12, 5, 2, k.estilo === 'largo' ? 11 : 8, pelo);
  } else {
    // Corto con flequillo.
    r(3, 5, 10, 1, pelo);
    r(4, 6, 3, 1, pelo);
    r(9, 6, 2, 1, pelo);
    r(2, 5, 1, 3, pelo);
    r(13, 5, 1, 3, pelo);
  }

  // Cara.
  const ojos = k.ojos || '#2a2030';
  r(5, 8, 1, 2, ojos);
  r(10, 8, 1, 2, ojos);
  if (k.colorete) {
    r(4, 10, 1, 1, '#f0a0a0');
    r(11, 10, 1, 1, '#f0a0a0');
  }
  if (k.barbita) {
    const sombra = oscurecer(piel, 0.82);
    r(5, 11, 6, 1, sombra);
    r(6, 12, 4, 1, sombra);
  }
  if (k.gafas) {
    const g = k.gafas;
    r(4, 7, 3, 1, g);
    r(9, 7, 3, 1, g);
    r(4, 10, 3, 1, g);
    r(9, 10, 3, 1, g);
    r(4, 8, 1, 2, g);
    r(6, 8, 1, 2, g);
    r(9, 8, 1, 2, g);
    r(11, 8, 1, 2, g);
    r(7, 8, 2, 1, g);
    r(5, 8, 1, 2, ojos);
    r(10, 8, 1, 2, ojos);
  }
  if (k.gafasSol) {
    r(4, 7, 3, 3, '#2050c8');
    r(9, 7, 3, 3, '#2050c8');
    r(4, 7, 1, 1, '#8ab8ff');
    r(9, 7, 1, 1, '#8ab8ff');
    r(7, 8, 2, 1, '#1a1a1a');
  }

  // Lo que lleve en la cabeza.
  cabezaFrente(r, k);
}

function cabezaFrente(r, k) {
  const c = k.colCabeza;
  if (k.cabeza === 'sombrero') {
    r(4, 1, 8, 3, c);
    r(4, 3, 8, 1, '#5a3a2a');
    r(1, 4, 14, 1, c);
    r(2, 5, 1, 1, c);
    r(13, 5, 1, 1, c);
    r(5, 1, 6, 1, aclarar(c, 0.4));
  } else if (k.cabeza === 'gorra') {
    r(3, 2, 10, 3, c);
    r(4, 1, 8, 1, c);
    r(6, 2, 4, 2, k.logo || oscurecer(c));
    r(3, 5, 10, 1, oscurecer(c, 0.85));
  } else if (k.cabeza === 'pescador') {
    r(4, 1, 8, 3, c);
    r(2, 4, 12, 2, c);
    r(5, 1, 6, 1, aclarar(c, 0.25));
  }
}

// ---------------------------------------------------------------- de espaldas

function espaldas(ctx, k, paso) {
  const r = pintor(ctx);
  const pelo = k.pelo;
  const piel = k.piel;
  const camisa = tonoCamiseta(k);

  const subeI = paso === 1 ? 1 : 0;
  const subeD = paso === 2 ? 1 : 0;
  r(5, 19, 2, 3 - subeI, k.pantalon);
  r(9, 19, 2, 3 - subeD, k.pantalon);
  r(4, 22 - subeI, 3, 1, k.zapatos);
  r(9, 22 - subeD, 3, 1, k.zapatos);

  colorCamiseta(k, r, 4, 13, 8, 6);
  r(4, 18, 8, 1, oscurecer(camisa, 0.8));
  if (k.tirantes) {
    r(4, 13, 1, 1, piel);
    r(11, 13, 1, 1, piel);
    r(5, 13, 1, 5, camisa);
    r(10, 13, 1, 5, camisa);
  }
  const bI = paso === 1 ? 1 : 0;
  const bD = paso === 2 ? 1 : 0;
  const manga = k.tirantes ? piel : camisa;
  r(3, 13 + bI, 1, 3, manga);
  r(3, 16 + bI, 1, 1, piel);
  r(12, 13 + bD, 1, 3, manga);
  r(12, 16 + bD, 1, 1, piel);

  // Cabeza (todo pelo).
  r(4, 2, 8, 1, pelo);
  r(3, 3, 10, 9, pelo);
  r(2, 4, 12, 7, pelo);
  r(4, 12, 8, 1, pelo);
  if (k.estilo === 'corto') {
    r(2, 8, 1, 2, piel);
    r(13, 8, 1, 2, piel);
    r(5, 12, 6, 1, piel);
  }
  if (k.estilo === 'recogido') {
    r(6, 5, 4, 4, oscurecer(pelo, 0.75));
    r(7, 4, 2, 1, oscurecer(pelo, 0.75));
    r(7, 6, 2, 2, pelo);
  }
  if (k.estilo === 'coleta') {
    r(7, 9, 2, 8, pelo);
    r(7, 9, 2, 1, '#d04060');
  }
  if (k.estilo === 'largo') r(3, 12, 10, 4, pelo);
  if (k.estilo === 'media') r(3, 12, 10, 2, pelo);

  const c = k.colCabeza;
  if (k.cabeza === 'sombrero') {
    r(4, 1, 8, 3, c);
    r(4, 3, 8, 1, '#5a3a2a');
    r(1, 4, 14, 1, c);
  } else if (k.cabeza === 'gorra') {
    r(3, 2, 10, 4, c);
    r(4, 1, 8, 1, c);
    r(6, 5, 4, 1, oscurecer(c, 0.8));
  } else if (k.cabeza === 'pescador') {
    r(4, 1, 8, 3, c);
    r(2, 4, 12, 2, c);
  }
}

// ---------------------------------------------------------------- de lado (mirando a la izquierda)

function lado(ctx, k, paso, pose = 'normal') {
  const r = pintor(ctx);
  const pelo = k.pelo;
  const piel = k.piel;
  const camisa = tonoCamiseta(k);
  const manga = k.tirantes ? piel : camisa;

  // Pelo trasero largo.
  if (k.estilo === 'largo') r(8, 4, 5, 12, pelo);
  if (k.estilo === 'media') r(8, 4, 5, 9, pelo);

  // Piernas.
  if (pose === 'salto') {
    r(4, 18, 3, 2, k.pantalon);
    r(3, 20, 3, 1, k.zapatos);
    r(8, 19, 2, 3, k.pantalon);
    r(8, 22, 3, 1, k.zapatos);
  } else if (paso === 0) {
    r(6, 19, 4, 3, k.pantalon);
    r(5, 22, 5, 1, k.zapatos);
  } else if (paso === 1) {
    r(4, 19, 2, 3, k.pantalon);
    r(3, 22, 3, 1, k.zapatos);
    r(9, 19, 2, 2, k.pantalon);
    r(9, 21, 3, 1, k.zapatos);
  } else {
    r(5, 19, 2, 3, k.pantalon);
    r(4, 22, 3, 1, k.zapatos);
    r(8, 19, 2, 3, k.pantalon);
    r(8, 22, 3, 1, k.zapatos);
  }

  // Cuerpo.
  colorCamiseta(k, r, 5, 13, 6, 6);
  r(5, 18, 6, 1, oscurecer(camisa, 0.8));
  if (k.collar) r(5, 14, 1, 1, k.collar);

  // Brazo.
  if (pose === 'salto') {
    r(2, 13, 4, 2, manga);
    r(1, 13, 1, 2, piel);
  } else if (paso === 1) {
    r(5, 14, 2, 3, manga);
    r(4, 17, 2, 1, piel);
  } else if (paso === 2) {
    r(8, 14, 2, 3, manga);
    r(9, 17, 2, 1, piel);
  } else {
    r(7, 13, 2, 4, manga);
    r(7, 17, 2, 1, piel);
  }

  // Cabeza.
  r(4, 4, 8, 9, piel);
  r(3, 5, 9, 7, piel);
  r(2, 9, 1, 1, piel);

  // Pelo.
  r(4, 2, 8, 1, pelo);
  r(3, 3, 10, 2, pelo);
  r(8, 4, 5, 1, pelo);
  r(9, 5, 4, 5, pelo);
  r(3, 5, 3, 1, pelo);
  if (k.estilo === 'corto') {
    r(3, 6, 2, 1, pelo);
    r(9, 7, 1, 2, piel);
  }
  if (k.estilo === 'recogido') {
    r(12, 5, 2, 4, oscurecer(pelo, 0.8));
    r(13, 6, 1, 2, pelo);
  }
  if (k.estilo === 'coleta') {
    r(12, 6, 2, 7, pelo);
    r(12, 6, 2, 1, '#d04060');
  }

  // Ojo, mejillas y gafas.
  const ojos = k.ojos || '#2a2030';
  r(4, 8, 1, 2, ojos);
  if (k.colorete) r(5, 10, 1, 1, '#f0a0a0');
  if (k.barbita) {
    const sombra = oscurecer(piel, 0.82);
    r(3, 11, 6, 1, sombra);
    r(4, 12, 4, 1, sombra);
  }
  if (k.gafas) {
    r(3, 7, 4, 1, k.gafas);
    r(3, 10, 4, 1, k.gafas);
    r(3, 8, 1, 2, k.gafas);
    r(6, 8, 1, 2, k.gafas);
    r(7, 8, 3, 1, k.gafas);
  }
  if (k.gafasSol) {
    r(3, 7, 4, 3, '#2050c8');
    r(3, 7, 1, 1, '#8ab8ff');
    r(7, 8, 3, 1, '#1a1a1a');
  }

  const c = k.colCabeza;
  if (k.cabeza === 'sombrero') {
    r(4, 1, 8, 3, c);
    r(4, 3, 8, 1, '#5a3a2a');
    r(0, 4, 15, 1, c);
    r(5, 1, 6, 1, aclarar(c, 0.4));
  } else if (k.cabeza === 'gorra') {
    r(4, 1, 8, 1, c);
    r(3, 2, 10, 3, c);
    r(0, 4, 4, 1, oscurecer(c, 0.85));
    r(5, 2, 3, 2, k.logo || oscurecer(c));
  } else if (k.cabeza === 'pescador') {
    r(4, 1, 8, 3, c);
    r(1, 4, 13, 2, c);
  }
}

// ---------------------------------------------------------------- creación

function sprite(dibujar) {
  const [c, ctx] = lienzo(W, H);
  dibujar(ctx);
  return contorno(c);
}

const cache = new Map();

export function crearPersona(k) {
  if (typeof k === 'string') k = PERSONAJES[k];
  if (cache.has(k)) return cache.get(k);
  const abajo = [0, 1, 2].map((p) => sprite((ctx) => frente(ctx, k, p)));
  const arriba = [0, 1, 2].map((p) => sprite((ctx) => espaldas(ctx, k, p)));
  const izq = [0, 1, 2].map((p) => sprite((ctx) => lado(ctx, k, p)));
  const der = izq.map(espejo);
  const saltoIzq = sprite((ctx) => lado(ctx, k, 0, 'salto'));
  const s = { abajo, arriba, izq, der, saltoIzq, saltoDer: espejo(saltoIzq), datos: k };
  cache.set(k, s);
  return s;
}

// Personaje genérico para los vecinos del pueblo.
export function vecino(semilla) {
  const pieles = ['#f2cdb0', '#e8b890', '#d4a07a', '#f6d8c0', '#c08860'];
  const pelos = ['#2a1c14', '#5a3a22', '#8a5a30', '#c8a060', '#909090', '#1a1a1a', '#a04030'];
  const camisetas = ['#e05050', '#50a050', '#5070e0', '#e0a030', '#a050c0', '#40b0b0', '#f080a0', '#707070'];
  const estilos = ['corto', 'largo', 'coleta', 'media', 'corto'];
  const h = (n) => Math.abs(Math.sin(semilla * 9.73 + n * 3.1) * 10000) % 1;
  return {
    piel: pieles[Math.floor(h(1) * pieles.length)],
    pelo: pelos[Math.floor(h(2) * pelos.length)],
    estilo: estilos[Math.floor(h(3) * estilos.length)],
    camiseta: camisetas[Math.floor(h(4) * camisetas.length)],
    pantalon: ['#34384a', '#4a5f8f', '#5a4a3a', '#2a2a2a'][Math.floor(h(5) * 4)],
    zapatos: ['#2a2a2a', '#f0f0f0', '#7a4a2a'][Math.floor(h(6) * 3)],
    gafas: h(7) > 0.75 ? '#303038' : null,
  };
}
