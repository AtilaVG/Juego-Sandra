// Escenarios de los niveles de plataformas: fondos, casillas y objetos.
import { lienzo, figura, rect, elipse, circulo, poligono, oscurecer, aclarar, azar } from '../motor/dibujo.js';
import { escribir, escribirCentrado } from '../motor/fuente.js';

const T = 16;

export const TEMAS = {
  piscina: {
    cielo: ['#70c0f8', '#d8f2ff'],
    suelo: { borde: '#f8f8f8', bordeOsc: '#3c88d8', relleno: '#a8d8f4', linea: '#88bce0' },
    bloque: { base: '#f4f8fc', borde: '#58a8f0', detalle: '#c8e4f8' },
    plataforma: { base: '#f86a8a', claro: '#ffb0c8', osc: '#c84a6a' },
    liquido: { base: '#3c98e8', claro: '#a8dcff', osc: '#2c78c8' },
  },
  lasertag: {
    cielo: ['#120a24', '#2c1a50'],
    suelo: { borde: '#40e0ff', bordeOsc: '#1890b0', relleno: '#2a2440', linea: '#3a3458' },
    bloque: { base: '#3a3050', borde: '#ff40c0', detalle: '#4a4064' },
    plataforma: { base: '#40e0ff', claro: '#c0f8ff', osc: '#1890b0' },
    liquido: null,
  },
  museo: {
    cielo: ['#8a3040', '#5a1a28'],
    suelo: { borde: '#f0e4d0', bordeOsc: '#c8b090', relleno: '#d8c8a8', linea: '#b8a480' },
    bloque: { base: '#f4f0ea', borde: '#c8c0b4', detalle: '#e0dad0' },
    plataforma: { base: '#d8a838', claro: '#f8d870', osc: '#a87818' },
    liquido: null,
  },
  salon: {
    cielo: ['#3a3a70', '#24244a'],
    suelo: { borde: '#b8784a', bordeOsc: '#8a5432', relleno: '#9a6440', linea: '#7a4a2a' },
    bloque: { base: '#e86a8a', borde: '#b84a6a', detalle: '#ff9ab0' },
    plataforma: { base: '#a8784a', claro: '#c8986a', osc: '#7a5432' },
    liquido: { base: '#f05828', claro: '#f8d040', osc: '#c03818' },
  },
  fiesta: {
    cielo: ['#ffd8e8', '#fff4c8'],
    suelo: { borde: '#d8a068', bordeOsc: '#a87040', relleno: '#c08850', linea: '#a87040' },
    bloque: { base: '#6a9af8', borde: '#3a6ac8', detalle: '#f8d030' },
    plataforma: { base: '#f8f8f8', claro: '#ffffff', osc: '#f070a0' },
    liquido: { base: '#f8f8f8', claro: '#f05060', osc: '#5a8af0', bolas: true },
  },
  comedor: {
    cielo: ['#f8ead4', '#f0d8b4'],
    suelo: { borde: '#d86a3a', bordeOsc: '#a84a2a', relleno: '#c85a30', linea: '#a84a28' },
    bloque: { base: '#a8784a', borde: '#7a5030', detalle: '#c0905a' },
    plataforma: { base: '#f8f8f8', claro: '#ffffff', osc: '#e04848', mantel: true },
    liquido: { base: '#e8a040', claro: '#f8d070', osc: '#c07820' },
  },
  uni: {
    cielo: ['#cfe0d0', '#e8f0e0'],
    suelo: { borde: '#b8bcc8', bordeOsc: '#8890a0', relleno: '#a0a4b4', linea: '#8a8ea0' },
    bloque: { base: '#c85a4a', borde: '#8a3a30', detalle: '#4a7ac8', libros: true },
    plataforma: { base: '#c8a070', claro: '#e0c090', osc: '#8a6a40' },
    liquido: { base: '#283040', claro: '#3a4458', osc: '#1a2030' },
  },
  cocina: {
    cielo: ['#f4f8fc', '#dce8f4'],
    suelo: { borde: '#f8f8f8', bordeOsc: '#303038', relleno: '#383840', linea: '#f0f0f0', ajedrez: true },
    bloque: { base: '#c89a60', borde: '#8a6a3a', detalle: '#e0b880' },
    plataforma: { base: '#e8e8f0', claro: '#ffffff', osc: '#a0a0b0' },
    liquido: { base: '#f0c030', claro: '#fff090', osc: '#c89010' },
  },
  madrid: {
    cielo: ['#6a5aa8', '#f8a070'],
    suelo: { borde: '#d8a070', bordeOsc: '#a06a40', relleno: '#b87a50', linea: '#9a6040' },
    bloque: { base: '#c86a4a', borde: '#8a4030', detalle: '#e08a60' },
    plataforma: { base: '#4a8a5a', claro: '#7ab88a', osc: '#2a5a3a', toldo: true },
    liquido: { base: '#3a2a5a', claro: '#5a4a7a', osc: '#2a1a40' },
  },
};

const cache = new Map();
function memo(k, fn) {
  if (!cache.has(k)) cache.set(k, fn());
  return cache.get(k);
}

// ------------------------------------------------------------------ casillas

export function casillaSuelo(tema, arriba) {
  return memo('suelo' + tema + arriba, () => {
    const s = TEMAS[tema].suelo;
    const [c, ctx] = lienzo(T, T);
    if (s.ajedrez) {
      for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) rect(ctx, x * 8, y * 8, 8, 8, (x + y) % 2 ? s.relleno : s.linea);
    } else {
      rect(ctx, 0, 0, T, T, s.relleno);
      rect(ctx, 0, 7, T, 1, s.linea);
      rect(ctx, 0, 15, T, 1, s.linea);
      rect(ctx, 5, 0, 1, 7, s.linea);
      rect(ctx, 12, 8, 1, 7, s.linea);
    }
    if (arriba) {
      rect(ctx, 0, 0, T, 4, s.borde);
      rect(ctx, 0, 4, T, 1, s.bordeOsc);
      rect(ctx, 0, 0, T, 1, aclarar(s.borde, 0.4));
    }
    return c;
  });
}

export function casillaBloque(tema) {
  return memo('bloque' + tema, () => {
    const b = TEMAS[tema].bloque;
    const [c, ctx] = lienzo(T, T);
    if (b.libros) {
      const cols = ['#c85a4a', '#4a7ac8', '#58a860', '#e8b040'];
      for (let i = 0; i < 4; i++) {
        rect(ctx, 0, i * 4, T, 4, cols[i]);
        rect(ctx, 0, i * 4 + 3, T, 1, oscurecer(cols[i], 0.7));
        rect(ctx, 13, i * 4, 2, 3, '#f8f0d8');
      }
      return c;
    }
    rect(ctx, 0, 0, T, T, b.borde);
    rect(ctx, 1, 1, T - 2, T - 2, b.base);
    rect(ctx, 2, 2, T - 4, 2, b.detalle);
    rect(ctx, 2, 2, 2, T - 4, b.detalle);
    rect(ctx, 1, T - 2, T - 2, 1, oscurecer(b.base, 0.85));
    if (tema === 'fiesta') {
      rect(ctx, 7, 1, 2, 14, b.detalle);
      rect(ctx, 1, 7, 14, 2, b.detalle);
    }
    if (tema === 'lasertag') {
      rect(ctx, 3, 7, 10, 2, '#ff40c0');
    }
    return c;
  });
}

export function casillaPlataforma(tema) {
  return memo('plat' + tema, () => {
    const p = TEMAS[tema].plataforma;
    const [c, ctx] = lienzo(T, T);
    if (p.mantel) {
      for (let x = 0; x < T; x += 4) rect(ctx, x, 0, 4, 6, (x / 4) % 2 ? p.osc : p.base);
      rect(ctx, 0, 6, T, 1, '#a03030');
      return c;
    }
    if (p.toldo) {
      for (let x = 0; x < T; x += 4) rect(ctx, x, 0, 4, 5, (x / 4) % 2 ? '#f8f0e0' : p.base);
      for (let x = 0; x < T; x += 4) rect(ctx, x + 1, 5, 2, 2, (x / 4) % 2 ? '#f8f0e0' : p.base);
      return c;
    }
    rect(ctx, 0, 0, T, 6, p.base);
    rect(ctx, 0, 0, T, 2, p.claro);
    rect(ctx, 0, 5, T, 1, p.osc);
    if (tema === 'museo') rect(ctx, 2, 2, 12, 1, '#a87818');
    return c;
  });
}

export function casillaRegalo(usado) {
  return memo('regalo' + usado, () =>
    figura(T, T, (ctx) => {
      if (usado) {
        rect(ctx, 0, 0, T, T, '#b8a088');
        rect(ctx, 1, 1, T - 2, T - 2, '#a08870');
        return;
      }
      rect(ctx, 0, 0, T, T, '#f8c030');
      rect(ctx, 1, 1, T - 2, 2, '#fff090');
      rect(ctx, 0, T - 2, T, 2, '#c88810');
      rect(ctx, 5, 4, 2, 2, '#e8405e');
      rect(ctx, 9, 4, 2, 2, '#e8405e');
      rect(ctx, 4, 5, 8, 3, '#e8405e');
      rect(ctx, 5, 8, 6, 2, '#e8405e');
      rect(ctx, 7, 10, 2, 1, '#e8405e');
    }, { borde: null }),
  );
}

export function trampolin(comprimido) {
  return memo('tramp' + comprimido, () =>
    figura(T, T, (ctx) => {
      const y = comprimido ? 9 : 5;
      rect(ctx, 1, y, 14, 3, '#e04050');
      rect(ctx, 1, y, 14, 1, '#ff8090');
      for (let x = 3; x < 14; x += 4) rect(ctx, x, y + 3, 2, 14 - y - 3, '#a0a0b0');
      rect(ctx, 0, 13, 16, 3, '#505060');
    }),
  );
}

export function meta(tema) {
  return memo('meta' + tema, () =>
    figura(24, 50, (ctx) => {
      rect(ctx, 3, 4, 2, 45, '#e8e8f0');
      rect(ctx, 3, 4, 1, 45, '#ffffff');
      circulo(ctx, 4, 3, 2.5, '#f8d030');
      // Bandera con corazón.
      poligono(ctx, [5, 6, 22, 9, 22, 22, 5, 24], '#e8405e');
      circulo(ctx, 11.5, 13, 2.5, '#ffffff');
      circulo(ctx, 15.5, 13, 2.5, '#ffffff');
      poligono(ctx, [9, 14, 18, 14, 13.5, 19], '#ffffff');
      rect(ctx, 0, 47, 8, 3, '#808090');
    }),
  );
}

export function banderaAlex(activa) {
  return memo('bandera' + activa, () =>
    figura(12, 30, (ctx) => {
      rect(ctx, 2, 3, 2, 26, '#a07040');
      if (activa) poligono(ctx, [4, 3, 11, 6, 4, 10], '#30c070');
      else poligono(ctx, [4, 3, 11, 6, 4, 10], '#b0b0b8');
      rect(ctx, 0, 27, 6, 2, '#707080');
    }),
  );
}

export function beso() {
  return memo('beso', () =>
    figura(12, 9, (ctx) => {
      elipse(ctx, 3.5, 3.5, 3, 2.3, '#e8305a');
      elipse(ctx, 8.5, 3.5, 3, 2.3, '#e8305a');
      elipse(ctx, 6, 6, 5, 2.5, '#d02048');
      rect(ctx, 2, 4, 8, 1, '#90103a');
      rect(ctx, 3, 2, 2, 1, '#ff90a8');
    }),
  );
}

export function corazon(k = 1) {
  return memo('corazon' + k, () =>
    figura(13, 12, (ctx) => {
      const col = k ? '#e8405e' : '#605868';
      circulo(ctx, 4, 4.5, 3.3, col);
      circulo(ctx, 9, 4.5, 3.3, col);
      poligono(ctx, [1, 5.5, 12, 5.5, 6.5, 11], col);
      if (k) rect(ctx, 3, 3, 2, 1, '#ffa8b8');
    }),
  );
}

export function polaroid() {
  return memo('polaroid', () =>
    figura(14, 16, (ctx) => {
      rect(ctx, 1, 1, 12, 14, '#ffffff');
      rect(ctx, 2, 2, 10, 9, '#ffb070');
      rect(ctx, 2, 7, 10, 4, '#58a8f0');
      circulo(ctx, 9, 5, 1.5, '#fff6b0');
      rect(ctx, 4, 6, 2, 3, '#383848');
      rect(ctx, 7, 6, 2, 3, '#383848');
    }),
  );
}

// ------------------------------------------------------------------ líquido

export function dibujarLiquido(ctx, tema, x, y, t, superficie) {
  const l = TEMAS[tema].liquido;
  if (!l) return;
  if (l.bolas) {
    rect(ctx, x, y, T, T, '#f8f0f8');
    const cols = ['#f05060', '#5a8af0', '#f8d030', '#58c070'];
    for (let i = 0; i < 6; i++) {
      const bx = x + ((i * 7 + Math.floor(x / 3)) % 14);
      const by = y + ((i * 5 + (superficie ? 2 : 0)) % 13) + (superficie ? Math.sin(t / 15 + i) : 0);
      circulo(ctx, bx + 1, by + 2, 2.2, cols[i % 4]);
    }
    return;
  }
  rect(ctx, x, y, T, T, l.base);
  if (superficie) {
    const ola = Math.sin(t / 12 + x / 10) * 1.5;
    rect(ctx, x, y + 1 + ola, T, 2, l.claro);
    rect(ctx, x + ((Math.floor(t / 4) + x) % 16), y + 6, 4, 1, l.claro);
  } else {
    rect(ctx, x + ((Math.floor(t / 6) + x * 3) % 16), y + 8, 3, 1, l.osc);
  }
}

// ------------------------------------------------------------------ fondos

const ANCHO_FONDO = 512;

function fondoPiscina(ctx, capa, r) {
  if (capa === 0) {
    for (let i = 0; i < 6; i++) {
      const x = i * 90 + r() * 40;
      const y = 20 + r() * 40;
      elipse(ctx, x, y, 22, 7, '#ffffff');
      elipse(ctx, x + 12, y - 4, 14, 7, '#ffffff');
    }
    for (let x = 0; x < ANCHO_FONDO; x += 22) {
      const h = 20 + r() * 26;
      rect(ctx, x, 140 - h, 20, h + 20, '#b8d0e4');
      for (let wy = 140 - h + 4; wy < 138; wy += 8) rect(ctx, x + 4, wy, 4, 4, '#d0e4f4');
    }
  } else {
    rect(ctx, 0, 132, ANCHO_FONDO, 30, '#4a9a50');
    for (let x = 0; x < ANCHO_FONDO; x += 8) circulo(ctx, x + 4, 133, 5, '#5aac58');
    for (let i = 0; i < 4; i++) {
      const x = 40 + i * 128;
      rect(ctx, x, 104, 2, 40, '#e0e0e8');
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = k % 2 ? '#ffffff' : '#e8405e';
        ctx.beginPath();
        ctx.moveTo(x + 1, 98);
        ctx.arc(x + 1, 106, 20, Math.PI + (k * Math.PI) / 6, Math.PI + ((k + 1) * Math.PI) / 6);
        ctx.fill();
      }
      rect(ctx, x + 30, 138, 34, 4, '#f8f8f8');
      rect(ctx, x + 30, 134, 10, 4, '#f8f8f8');
    }
  }
}

function fondoLaser(ctx, capa, r) {
  if (capa === 0) {
    for (let i = 0; i < 60; i++) rect(ctx, r() * ANCHO_FONDO, r() * 120, 1, 1, r() > 0.5 ? '#40e0ff' : '#ff60d0');
    for (let y = 100; y < 192; y += 12) rect(ctx, 0, y, ANCHO_FONDO, 1, '#3a2a68');
    for (let x = 0; x < ANCHO_FONDO; x += 32) rect(ctx, x, 100, 1, 92, '#3a2a68');
  } else {
    for (let i = 0; i < 6; i++) {
      const x = i * 86 + r() * 20;
      const h = 50 + r() * 50;
      rect(ctx, x, 160 - h, 40, h, '#221a3a');
      rect(ctx, x, 160 - h, 40, 2, i % 2 ? '#ff40c0' : '#40e0ff');
      rect(ctx, x + 6, 170 - h, 28, 2, '#3a2a5a');
    }
    for (let i = 0; i < 4; i++) {
      const x = 30 + i * 128;
      poligono(ctx, [x, 60, x + 16, 60, x + 16, 54, x + 26, 64, x + 16, 74, x + 16, 68, x, 68], '#ffe040');
    }
  }
}

function fondoMuseo(ctx, capa, r) {
  if (capa === 0) {
    for (let x = 0; x < ANCHO_FONDO; x += 64) {
      rect(ctx, x + 2, 0, 10, 192, '#6a2232');
      rect(ctx, x + 4, 0, 2, 192, '#9a4050');
    }
    rect(ctx, 0, 136, ANCHO_FONDO, 24, '#5a1a28');
    rect(ctx, 0, 136, ANCHO_FONDO, 2, '#b8884a');
  } else {
    const temas = [
      (x, y, w, h) => { rect(ctx, x, y, w, h, '#88b8e8'); rect(ctx, x, y + h * 0.6, w, h * 0.4, '#78a858'); circulo(ctx, x + w * 0.75, y + h * 0.3, 4, '#f8e070'); },
      (x, y, w, h) => { rect(ctx, x, y, w, h, '#383040'); elipse(ctx, x + w / 2, y + h * 0.45, w * 0.22, h * 0.25, '#e8c0a0'); rect(ctx, x + w * 0.25, y + h * 0.7, w * 0.5, h * 0.3, '#5a3a6a'); },
      (x, y, w, h) => { rect(ctx, x, y, w, h, '#f8f0e0'); rect(ctx, x + 3, y + 3, w * 0.4, h * 0.5, '#e04040'); rect(ctx, x + w * 0.5, y + h * 0.4, w * 0.4, h * 0.5, '#3060c0'); rect(ctx, x + 4, y + h * 0.7, w * 0.3, 3, '#f8d030'); },
      (x, y, w, h) => { rect(ctx, x, y, w, h, '#f8d8a0'); for (let i = 0; i < 5; i++) circulo(ctx, x + 6 + i * (w - 12) / 4, y + h / 2 + Math.sin(i) * 6, 3, '#e86a3a'); },
    ];
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * 128;
      const w = 50 + r() * 20;
      const h = 40 + r() * 20;
      const y = 60 - h / 2 + 20;
      rect(ctx, x - 4, y - 4, w + 8, h + 8, '#d8a838');
      rect(ctx, x - 2, y - 2, w + 4, h + 4, '#a87818');
      temas[i % 4](x, y, w, h);
      rect(ctx, x + w / 2 - 6, y + h + 10, 12, 4, '#f0e8d8');
    }
  }
}

function fondoSalon(ctx, capa, r) {
  if (capa === 0) {
    for (let y = 0; y < 192; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < ANCHO_FONDO; x += 16) rect(ctx, x + 6, y + 6, 2, 2, '#44447a');
    for (let i = 0; i < 2; i++) {
      const x = 80 + i * 256;
      rect(ctx, x, 30, 70, 60, '#101830');
      for (let k = 0; k < 10; k++) rect(ctx, x + r() * 66, 32 + r() * 50, 1, 1, '#ffffff');
      circulo(ctx, x + 50, 48, 9, '#f8f0c8');
      circulo(ctx, x + 54, 45, 8, '#101830');
      rect(ctx, x - 3, 30, 3, 60, '#a8784a');
      rect(ctx, x + 70, 30, 3, 60, '#a8784a');
      rect(ctx, x + 34, 30, 2, 60, '#a8784a');
      rect(ctx, x - 12, 24, 16, 74, '#c84a6a');
      rect(ctx, x + 66, 24, 16, 74, '#c84a6a');
    }
  } else {
    for (let i = 0; i < 2; i++) {
      const x = 10 + i * 256;
      rect(ctx, x, 70, 60, 90, '#6a4428');
      for (let k = 0; k < 4; k++) {
        rect(ctx, x + 2, 76 + k * 22, 56, 2, '#4a2e18');
        for (let b = 0; b < 8; b++) rect(ctx, x + 4 + b * 7, 80 + k * 22 - (b % 3), 5, 16 + (b % 3), ['#e05050', '#5070e0', '#50a050', '#e0b030'][(b + k) % 4]);
      }
      const lx = x + 150;
      rect(ctx, lx, 70, 2, 90, '#303040');
      poligono(ctx, [lx - 12, 70, lx + 14, 70, lx + 8, 52, lx - 6, 52], '#f8e0a0');
      circulo(ctx, lx + 1, 76, 18, 'rgba(255,240,180,0.12)');
    }
  }
}

function fondoFiesta(ctx, capa, r) {
  if (capa === 0) {
    for (let k = 0; k < 2; k++) {
      const y0 = 20 + k * 30;
      for (let x = 0; x < ANCHO_FONDO; x += 14) {
        const y = y0 + Math.sin((x / ANCHO_FONDO) * Math.PI * 4) * 6;
        poligono(ctx, [x, y, x + 10, y, x + 5, y + 10], ['#f05060', '#5a8af0', '#f8d030', '#58c070', '#c060e0'][(x / 14 + k) % 5]);
      }
    }
    rect(ctx, 150, 76, 150, 18, '#f86ab0');
    escribirCentrado(ctx, '¡FELIZ CUMPLE!', 225, 80, '#ffffff', '#b03070');
  } else {
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 100 + r() * 30;
      for (let b = 0; b < 3; b++) {
        const bx = x + b * 10 - 10;
        const by = 70 + (b % 2) * 10;
        rect(ctx, bx, by + 9, 1, 50, '#a0a0a0');
        elipse(ctx, bx, by, 8, 10, ['#f05060', '#5a8af0', '#f8d030'][(b + i) % 3]);
      }
    }
  }
}

function fondoComedor(ctx, capa, r) {
  if (capa === 0) {
    for (let i = 0; i < 2; i++) {
      const x = 60 + i * 256;
      rect(ctx, x, 30, 80, 60, '#a8d8f8');
      rect(ctx, x, 70, 80, 20, '#88c070');
      rect(ctx, x - 3, 27, 86, 3, '#f8f8f8');
      rect(ctx, x - 3, 90, 86, 3, '#f8f8f8');
      rect(ctx, x + 39, 30, 2, 60, '#f8f8f8');
      for (let p = 0; p < 3; p++) {
        circulo(ctx, x + 130 + p * 22, 50, 8, '#f8f8f8');
        circulo(ctx, x + 130 + p * 22, 50, 5, ['#58a8f0', '#f0a040', '#58c070'][p]);
      }
    }
    rect(ctx, 0, 120, ANCHO_FONDO, 40, '#e8d0a8');
    rect(ctx, 0, 120, ANCHO_FONDO, 2, '#c8a878');
  } else {
    for (let i = 0; i < 3; i++) {
      const x = 20 + i * 170;
      rect(ctx, x, 80, 50, 80, '#8a5a34');
      rect(ctx, x + 4, 86, 42, 30, '#a8d0f0');
      rect(ctx, x + 24, 86, 2, 30, '#8a5a34');
      rect(ctx, x + 4, 122, 42, 34, '#7a4a28');
      rect(ctx, x + 100, 120, 10, 40, '#7a5030');
      circulo(ctx, x + 105, 110, 14, '#4a9a50');
    }
  }
}

function fondoUni(ctx, capa, r) {
  if (capa === 0) {
    for (let i = 0; i < 2; i++) {
      const x = 40 + i * 256;
      rect(ctx, x - 4, 26, 168, 78, '#a07a50');
      rect(ctx, x, 30, 160, 70, '#2a4a3a');
      escribir(ctx, '2 + 2 = 4', x + 12, 40, '#f0f0f0', null);
      escribir(ctx, 'Sandra ♥ Alex', x + 60, 62, '#f8c0d0', null);
      escribir(ctx, 'E = mc²'.replace('²', '2'), x + 20, 80, '#f0f0f0', null);
      circulo(ctx, x + 210, 40, 10, '#f8f8f8');
      rect(ctx, x + 210, 33, 1, 7, '#303030');
      rect(ctx, x + 210, 40, 5, 1, '#303030');
    }
  } else {
    for (let x = 0; x < ANCHO_FONDO; x += 24) {
      rect(ctx, x, 104, 22, 56, x % 48 ? '#5a8ac8' : '#4a7ab8');
      rect(ctx, x + 2, 108, 18, 2, '#3a6aa8');
      rect(ctx, x + 2, 112, 18, 2, '#3a6aa8');
      rect(ctx, x + 16, 130, 2, 6, '#d0d8e0');
    }
  }
}

function fondoCocina(ctx, capa, r) {
  if (capa === 0) {
    for (let y = 0; y < 192; y += 12) rect(ctx, 0, y, ANCHO_FONDO, 1, '#c0d0e0');
    for (let x = 0; x < ANCHO_FONDO; x += 12) rect(ctx, x, 0, 1, 192, '#c0d0e0');
    rect(ctx, 0, 0, ANCHO_FONDO, 40, '#e8d8c0');
    for (let x = 0; x < ANCHO_FONDO; x += 64) {
      rect(ctx, x + 2, 2, 60, 34, '#d8c0a0');
      rect(ctx, x + 30, 16, 4, 6, '#a08060');
    }
  } else {
    for (let i = 0; i < 2; i++) {
      const x = 30 + i * 256;
      rect(ctx, x, 60, 46, 100, '#e8f0f8');
      rect(ctx, x, 100, 46, 2, '#b0c0d0');
      rect(ctx, x + 38, 70, 3, 20, '#a0b0c0');
      rect(ctx, x + 38, 110, 3, 20, '#a0b0c0');
      rect(ctx, x + 120, 110, 80, 50, '#505868');
      rect(ctx, x + 124, 104, 30, 8, '#303848');
      rect(ctx, x + 160, 100, 26, 12, '#c0c8d8');
      for (let k = 0; k < 4; k++) rect(ctx, x + 130 + k * 16, 70, 2, 24, '#808898');
    }
  }
}

function fondoMadrid(ctx, capa, r) {
  if (capa === 0) {
    circulo(ctx, 300, 120, 30, '#ffe0a0');
    circulo(ctx, 300, 120, 24, '#fff4c8');
    ctx.fillStyle = '#8a5a8a';
    for (let x = 0; x < ANCHO_FONDO; x += 18) {
      const h = 20 + r() * 40;
      ctx.fillRect(x, 150 - h, 16, h + 10);
    }
    // Cúpula estilo Gran Vía.
    rect(ctx, 100, 70, 30, 80, '#8a5a8a');
    circulo(ctx, 115, 70, 15, '#8a5a8a');
    rect(ctx, 114, 48, 2, 10, '#8a5a8a');
    // Torre alta.
    rect(ctx, 400, 50, 22, 100, '#8a5a8a');
    rect(ctx, 404, 40, 14, 12, '#8a5a8a');
  } else {
    for (let i = 0; i < 7; i++) {
      const x = i * 74 + r() * 20;
      const h = 40 + r() * 40;
      rect(ctx, x, 160 - h, 56, h, '#6a3a5a');
      for (let wy = 166 - h; wy < 150; wy += 10) for (let wx = x + 6; wx < x + 50; wx += 12) rect(ctx, wx, wy, 5, 5, r() > 0.4 ? '#f8d070' : '#4a2a40');
      rect(ctx, x - 2, 160 - h, 60, 3, '#5a2a4a');
    }
  }
}

const FONDOS = {
  piscina: fondoPiscina,
  lasertag: fondoLaser,
  museo: fondoMuseo,
  salon: fondoSalon,
  fiesta: fondoFiesta,
  comedor: fondoComedor,
  uni: fondoUni,
  cocina: fondoCocina,
  madrid: fondoMadrid,
};

export function capaFondo(tema, capa) {
  return memo('fondo' + tema + capa, () => {
    const [c, ctx] = lienzo(ANCHO_FONDO, 192);
    FONDOS[tema](ctx, capa, azar(tema.length * 97 + capa * 13));
    return c;
  });
}

export function dibujarCielo(ctx, tema, ancho, alto) {
  const [a, b] = TEMAS[tema].cielo;
  const g = ctx.createLinearGradient(0, 0, 0, alto);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ancho, alto);
}

// Templo de Debod (decorado al final del nivel de Madrid y en el final).
export function temploDebod() {
  return memo('debod', () =>
    figura(120, 80, (ctx) => {
      const piedra = '#e8c8a0';
      const sombra = '#c8a078';
      // Puertas.
      for (const x of [0, 40]) {
        rect(ctx, x + 2, 20, 8, 58, piedra);
        rect(ctx, x + 22, 20, 8, 58, piedra);
        rect(ctx, x, 14, 32, 8, piedra);
        rect(ctx, x, 20, 32, 2, sombra);
      }
      // Templo.
      poligono(ctx, [80, 78, 84, 30, 116, 30, 120, 78], piedra);
      rect(ctx, 82, 26, 36, 6, piedra);
      rect(ctx, 82, 32, 36, 2, sombra);
      rect(ctx, 96, 50, 8, 28, '#5a4030');
      rect(ctx, 86, 40, 4, 30, sombra);
      rect(ctx, 110, 40, 4, 30, sombra);
    }),
  );
}
