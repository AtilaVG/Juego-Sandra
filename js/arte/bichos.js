// Laila, enemigos de los niveles y jefes de los combates.
import { figura, rect, elipse, circulo, poligono, lienzo, contorno, escalar, oscurecer, aclarar } from '../motor/dibujo.js';
import { escribir } from '../motor/fuente.js';
import { crearPersona } from './personas.js';
import { LAILA, PERSONAJES } from '../datos/config.js';

const cache = new Map();
function memo(clave, fn) {
  if (!cache.has(clave)) cache.set(clave, fn());
  return cache.get(clave);
}

function trazo(c, puntos, color, grosor) {
  c.strokeStyle = color;
  c.lineWidth = grosor;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(puntos[0], puntos[1]);
  for (let i = 2; i < puntos.length; i += 4) {
    if (i + 3 < puntos.length) c.quadraticCurveTo(puntos[i], puntos[i + 1], puntos[i + 2], puntos[i + 3]);
    else c.lineTo(puntos[i], puntos[i + 1]);
  }
  c.stroke();
}

// Ojos enfadados genéricos.
function ojosEnfadados(c, x1, x2, y, r = 3) {
  for (const x of [x1, x2]) {
    circulo(c, x, y, r, '#ffffff');
    circulo(c, x + (x === x1 ? 0.8 : -0.8), y + 0.6, r * 0.5, '#202020');
  }
  const s = x1 < x2 ? 1 : -1;
  poligono(c, [x1 - r - 1, y - r - 1, x1 + r + 1, y - r + 2 * s, x1 + r + 1, y - r + 3.5, x1 - r - 1, y - r + 0.5], '#202020');
  poligono(c, [x2 + r + 1, y - r - 1, x2 - r - 1, y - r + 2 * s, x2 - r - 1, y - r + 3.5, x2 + r + 1, y - r + 0.5], '#202020');
}

// ====================================================================== LAILA

export function lailaMundo(f) {
  return memo('lailaMundo' + f, () =>
    figura(16, 16, (c) => {
      const k = LAILA;
      // cola
      if (f === 0) {
        rect(c, 12, 11, 2, 2, k.base);
        rect(c, 13, 8, 2, 4, k.base);
      } else {
        rect(c, 12, 12, 3, 2, k.base);
        rect(c, 14, 10, 1, 3, k.base);
      }
      elipse(c, 8, 12, 4.6, 3.2, k.base);
      elipse(c, 8, 12.5, 2, 2.2, k.pecho);
      poligono(c, [3, 6, 4, 1.5, 7, 4.5], k.base);
      poligono(c, [13, 6, 12, 1.5, 9, 4.5], k.base);
      elipse(c, 8, 7, 5, 3.8, k.base);
      rect(c, 7, 3, 2, 2, k.rayas);
      rect(c, 3, 7, 1, 1, k.rayas);
      rect(c, 12, 7, 1, 1, k.rayas);
      rect(c, 5, 7, 1, 2, '#283020');
      rect(c, 10, 7, 1, 2, '#283020');
      rect(c, 7, 9, 2, 1, k.nariz);
      rect(c, 6, 14, 1, 1, k.pecho);
      rect(c, 9, 14, 1, 1, k.pecho);
    }),
  );
}

export function lailaEspalda(f = 0) {
  return memo('lailaEspalda' + f, () =>
    figura(60, 60, (c) => {
      const k = LAILA;
      // cola
      const punta = f ? [54, 22] : [50, 18];
      trazo(c, [44, 50, 56, 44, punta[0], punta[1]], k.base, 7);
      trazo(c, [52, 30, punta[0], punta[1]], k.rayas, 7);
      trazo(c, [55, 36, 54, 32], k.base, 7);
      // cuerpo
      elipse(c, 29, 46, 20, 13, k.base);
      for (let i = 0; i < 4; i++) elipse(c, 15 + i * 9, 41 + (i % 2), 2, 6, k.rayas);
      // cabeza
      poligono(c, [13, 22, 16, 4, 26, 15], k.base);
      poligono(c, [45, 22, 42, 4, 32, 15], k.base);
      poligono(c, [16, 18, 17, 8, 23, 15], aclarar(k.nariz, 0.3));
      poligono(c, [42, 18, 41, 8, 35, 15], aclarar(k.nariz, 0.3));
      circulo(c, 29, 26, 14, k.base);
      elipse(c, 29, 16, 3, 4, k.rayas);
      elipse(c, 21, 19, 2, 4, k.rayas);
      elipse(c, 37, 19, 2, 4, k.rayas);
      elipse(c, 29, 33, 7, 3, aclarar(k.base, 0.15));
    }),
  );
}

export function lailaFrente() {
  return memo('lailaFrente', () =>
    figura(48, 48, (c) => {
      const k = LAILA;
      trazo(c, [34, 42, 46, 40, 44, 26], k.base, 5);
      elipse(c, 24, 36, 13, 10, k.base);
      elipse(c, 24, 38, 7, 8, k.pecho);
      poligono(c, [10, 18, 12, 3, 20, 11], k.base);
      poligono(c, [38, 18, 36, 3, 28, 11], k.base);
      poligono(c, [12, 15, 13, 7, 18, 12], k.nariz);
      poligono(c, [36, 15, 35, 7, 30, 12], k.nariz);
      elipse(c, 24, 20, 13, 11, k.base);
      rect(c, 22, 9, 4, 5, k.rayas);
      rect(c, 11, 19, 3, 2, k.rayas);
      rect(c, 34, 19, 3, 2, k.rayas);
      elipse(c, 18, 19, 3.2, 3.6, k.ojos);
      elipse(c, 30, 19, 3.2, 3.6, k.ojos);
      rect(c, 17.5, 16, 1.5, 7, '#202020');
      rect(c, 29.5, 16, 1.5, 7, '#202020');
      rect(c, 17, 17, 1, 1, '#ffffff');
      rect(c, 29, 17, 1, 1, '#ffffff');
      poligono(c, [22, 24, 26, 24, 24, 26.5], k.nariz);
      rect(c, 23.5, 26, 1, 2, '#383838');
      rect(c, 21, 28, 3, 1, '#383838');
      rect(c, 24, 28, 3, 1, '#383838');
      elipse(c, 18, 45, 4, 2.5, k.pecho);
      elipse(c, 30, 45, 4, 2.5, k.pecho);
    }),
  );
}

// Sandra de espaldas para el principio de los combates (f=1: lanzando).
export function sandraEspalda(f = 0) {
  return memo('sandraEspalda' + f, () =>
    figura(52, 60, (c) => {
      const k = PERSONAJES.sandra;
      // torso con camiseta de tirantes
      poligono(c, [6, 60, 8, 44, 16, 38, 36, 38, 44, 44, 46, 60], k.piel);
      poligono(c, [12, 60, 14, 42, 38, 42, 40, 60], k.camiseta);
      rect(c, 16, 38, 4, 5, k.camiseta);
      rect(c, 32, 38, 4, 5, k.camiseta);
      // cuello
      rect(c, 21, 30, 10, 9, oscurecer(k.piel, 0.92));
      // brazo
      if (f === 1) {
        trazo(c, [42, 44, 49, 34, 48, 18], k.piel, 7);
        circulo(c, 48, 16, 4, k.piel);
      } else {
        trazo(c, [43, 44, 47, 52, 47, 59], k.piel, 7);
      }
      // cabeza (pelo recogido) y patillas de las gafas
      circulo(c, 26, 22, 13, k.pelo);
      elipse(c, 13, 23, 2, 3, k.piel);
      elipse(c, 39, 23, 2, 3, k.piel);
      rect(c, 11, 20, 4, 2, k.gafas);
      rect(c, 37, 20, 4, 2, k.gafas);
      circulo(c, 26, 11, 6, oscurecer(k.pelo, 0.75));
      circulo(c, 25, 10, 2.5, k.pelo);
      rect(c, 25, 9, 2, 12, oscurecer(k.pelo, 0.8));
    }),
  );
}

// ====================================================================== ENEMIGOS 16x16

const ENEMIGOS = {
  mosquito(c, f) {
    elipse(c, 9, f ? 6 : 4, 3, 2, '#d8f0ff');
    elipse(c, 6, f ? 6 : 4.5, 2.5, 1.8, '#c0e4ff');
    elipse(c, 10, 9, 4, 2.4, '#6a5a50');
    rect(c, 9, 7, 1, 4, '#8a7a6a');
    rect(c, 11, 7, 1, 4, '#8a7a6a');
    circulo(c, 5, 8.5, 2.3, '#4a3a34');
    rect(c, 1, 9, 3, 1, '#2a2020');
    rect(c, 4, 7, 1, 1, '#ff3040');
    rect(c, 7, 11, 1, 3, '#4a3a34');
    rect(c, 11, 11, 1, 3, '#4a3a34');
  },
  patoGoma(c, f) {
    const y = f ? 1 : 0;
    elipse(c, 8.5, 11 + y, 6, 3.8, '#f8d838');
    elipse(c, 10, 10 + y, 3, 2, '#fff080');
    circulo(c, 5.5, 6 + y, 3.4, '#f8d838');
    poligono(c, [1, 6 + y, 3, 5 + y, 3, 8 + y, 1, 7.5 + y], '#f08020');
    rect(c, 5, 5 + y, 1, 1, '#202020');
    poligono(c, [13, 9 + y, 15, 7 + y, 14.5, 11 + y], '#f8d838');
  },
  pelota(c, f) {
    const cols = f ? ['#e83a3a', '#f8f8f8', '#3a70e8', '#f8d030'] : ['#f8d030', '#e83a3a', '#f8f8f8', '#3a70e8'];
    for (let i = 0; i < 4; i++) {
      c.fillStyle = cols[i];
      c.beginPath();
      c.moveTo(8, 8);
      c.arc(8, 8, 6.5, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
      c.closePath();
      c.fill();
    }
    circulo(c, 8, 8, 1.6, '#f8f8f8');
  },
  dron(c, f) {
    rect(c, 2, f ? 3 : 4, 5, 1, '#c0c0c8');
    rect(c, 9, f ? 4 : 3, 5, 1, '#c0c0c8');
    rect(c, 4, 4, 1, 3, '#606070');
    rect(c, 11, 4, 1, 3, '#606070');
    elipse(c, 8, 9, 5.5, 3.2, '#404050');
    elipse(c, 8, 8, 4, 1.5, '#606070');
    circulo(c, 8, 10, 1.8, f ? '#ff4060' : '#ff8090');
    rect(c, 4, 12, 1, 2, '#404050');
    rect(c, 11, 12, 1, 2, '#404050');
  },
  rival(c, f) {
    const y = f ? 1 : 0;
    rect(c, 5, 13 - y, 2, 2 + y, '#2a2a34');
    rect(c, 9, 13, 2, 2, '#2a2a34');
    rect(c, 4, 8, 8, 5, '#202028');
    rect(c, 5, 8, 6, 1, '#40ff80');
    rect(c, 5, 11, 6, 1, '#40ff80');
    circulo(c, 8, 5, 3.3, '#e8b890');
    rect(c, 5, 2, 6, 2, '#30303a');
    rect(c, 6, 5, 1, 1, '#202020');
    rect(c, 1, 9, 4, 2, '#505060');
    rect(c, 0, 9, 1, 1, '#40ff80');
  },
  mina(c, f) {
    circulo(c, 8, 9, 5.5, '#28283a');
    rect(c, 3, 9, 10, 1, f ? '#ff40c0' : '#40e0ff');
    circulo(c, 8, 9, 1.5, f ? '#ff40c0' : '#40e0ff');
    rect(c, 7, 2, 2, 2, '#505060');
  },
  turista(c, f) {
    const y = f ? 1 : 0;
    rect(c, 5, 13 - y, 2, 2 + y, '#e8c098');
    rect(c, 9, 13, 2, 2, '#e8c098');
    rect(c, 4, 8, 8, 5, '#f0a0c0');
    rect(c, 4, 8, 8, 1, '#e080a0');
    circulo(c, 8, 5, 3.3, '#f0c8a8');
    rect(c, 3, 2, 10, 2, '#f8f0d8');
    rect(c, 5, 1, 6, 1, '#f8f0d8');
    rect(c, 2, 8, 4, 3, '#303038');
    rect(c, 2, 8, 1, 1, f ? '#ffffff' : '#a0a0a8');
    rect(c, 6, 5, 1, 1, '#202020');
  },
  cuadro(c, f) {
    const y = f ? 1 : 0;
    poligono(c, [1, 6 + y, 4, 3 + y, 4, 8 + y], '#ffffff');
    poligono(c, [15, 6 + y, 12, 3 + y, 12, 8 + y], '#ffffff');
    rect(c, 3, 3, 10, 10, '#d8a838');
    rect(c, 5, 5, 6, 6, '#5080c0');
    rect(c, 5, 8, 6, 3, '#60a050');
    circulo(c, 9, 6.5, 1, '#f8e060');
  },
  busto(c, f) {
    const y = f ? 1 : 0;
    rect(c, 4, 12, 8, 3, '#b8b0a8');
    rect(c, 5, 9 + y, 6, 3, '#e8e4dc');
    circulo(c, 8, 6 + y, 3.6, '#f0ece4');
    rect(c, 5, 2 + y, 6, 2, '#d8d4cc');
    rect(c, 6, 6 + y, 1, 1, '#808080');
    rect(c, 9, 6 + y, 1, 1, '#808080');
  },
  palomitas(c, f) {
    const y = f ? 1 : 0;
    circulo(c, 5, 5 + y, 2.5, '#fff4d0');
    circulo(c, 8, 4 + y, 2.8, '#fff8e0');
    circulo(c, 11, 5 + y, 2.5, '#fff4d0');
    poligono(c, [3, 6 + y, 13, 6 + y, 12, 15, 4, 15], '#f8f8f8');
    rect(c, 5, 7 + y, 2, 8 - y, '#e83a3a');
    rect(c, 9, 7 + y, 2, 8 - y, '#e83a3a');
    rect(c, 6, 10, 1, 2, '#202020');
    rect(c, 9, 10, 1, 2, '#202020');
  },
  mando(c, f) {
    const y = f ? 1 : 0;
    rect(c, 5, 13 - y, 1, 2 + y, '#202020');
    rect(c, 10, 13, 1, 2, '#202020');
    rect(c, 4, 2, 8, 11, '#2a2a30');
    rect(c, 5, 3, 2, 1, '#e83a3a');
    rect(c, 9, 3, 2, 1, '#40c060');
    rect(c, 5, 9, 1, 1, '#a0a0a8');
    rect(c, 7, 9, 1, 1, '#a0a0a8');
    rect(c, 9, 9, 1, 1, '#a0a0a8');
    rect(c, 5, 11, 1, 1, '#a0a0a8');
    rect(c, 7, 11, 1, 1, '#a0a0a8');
    rect(c, 9, 11, 1, 1, '#a0a0a8');
    rect(c, 6, 5, 1, 2, '#ffffff');
    rect(c, 9, 5, 1, 2, '#ffffff');
  },
  spoiler(c, f) {
    const y = f ? 1 : 0;
    circulo(c, 8, 6 + y, 5.5, '#f0f0ff');
    rect(c, 2.5, 6 + y, 11, 6, '#f0f0ff');
    poligono(c, [2.5, 12 + y, 5, 15 + y, 7, 12 + y, 9, 15 + y, 11, 12 + y, 13.5, 15 + y, 13.5, 11 + y], '#f0f0ff');
    rect(c, 5, 5 + y, 2, 2, '#202040');
    rect(c, 9, 5 + y, 2, 2, '#202040');
    rect(c, 7, 9 + y, 2, 2, '#202040');
  },
  globo(c, f) {
    elipse(c, 8, 6, 5, 5.5, f ? '#e83a5a' : '#e8405e');
    elipse(c, 6, 4, 1.5, 2, '#ff9aaa');
    poligono(c, [7, 11.5, 9, 11.5, 8, 13], '#c02a48');
    rect(c, 8, 13, 1, 2, '#808080');
    rect(c, 6, 6, 1, 1, '#202020');
    rect(c, 9, 6, 1, 1, '#202020');
  },
  regalo(c, f) {
    const y = f ? 1 : 0;
    rect(c, 3, 6 + y, 10, 8 - y, '#5a8ae8');
    rect(c, 2, 5 + y, 12, 3, '#6a9af8');
    rect(c, 7, 5 + y, 2, 9 - y, '#f8d030');
    poligono(c, [8, 5 + y, 4, 2 + y, 5, 5 + y], '#f8d030');
    poligono(c, [8, 5 + y, 12, 2 + y, 11, 5 + y], '#f8d030');
    rect(c, 4, 10, 1, 2, '#202020');
    rect(c, 11, 10, 1, 2, '#202020');
  },
  gorrito(c, f) {
    const y = f ? 1 : 0;
    rect(c, 5, 13 - y, 1, 2 + y, '#202020');
    rect(c, 10, 13, 1, 2, '#202020');
    poligono(c, [8, 1, 13, 13, 3, 13], '#a050d8');
    rect(c, 6, 7, 1, 1, '#f8d030');
    rect(c, 9, 10, 1, 1, '#f8d030');
    rect(c, 8, 5, 1, 1, '#f8d030');
    circulo(c, 8, 1.5, 1.5, '#f8d030');
    rect(c, 3, 12, 10, 1, '#f86ab0');
  },
  croqueta(c, f) {
    const y = f ? 1 : 0;
    elipse(c, 8, 10 + y * 0.5, 6, 3.8, '#c88838');
    elipse(c, 8, 9, 4.5, 2, '#e0a850');
    rect(c, 5, 12, 1, 1, '#a06a28');
    rect(c, 10, 11, 1, 1, '#a06a28');
    rect(c, 6, 9, 1, 2, '#202020');
    rect(c, 9, 9, 1, 2, '#202020');
  },
  pregunta(c, f) {
    const y = f ? 1 : 0;
    c.strokeStyle = '#e8405e';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(8, 5 + y, 3.5, Math.PI, Math.PI * 2.4);
    c.stroke();
    rect(c, 7, 8 + y, 3, 3, '#e8405e');
    rect(c, 7, 12 + y, 3, 3, '#e8405e');
  },
  olla(c, f) {
    const y = f ? 1 : 0;
    rect(c, 3, 8, 10, 6, '#a0a8b8');
    rect(c, 1, 9, 2, 2, '#707888');
    rect(c, 13, 9, 2, 2, '#707888');
    rect(c, 3, 6 - y * 2, 10, 2, '#c0c8d8');
    rect(c, 7, 5 - y * 2, 2, 1, '#505868');
    rect(c, 5, 10, 1, 2, '#202020');
    rect(c, 10, 10, 1, 2, '#202020');
  },
  apunte(c, f) {
    const y = f ? 1 : 0;
    poligono(c, [2, 4 + y, 13, 2, 14, 13 - y, 3, 14], '#f8f8f8');
    rect(c, 4, 6, 8, 1, '#90b0e0');
    rect(c, 4, 8, 8, 1, '#90b0e0');
    rect(c, 4, 10, 6, 1, '#90b0e0');
    rect(c, 5, 4, 2, 1, '#e04050');
  },
  libro(c, f) {
    const y = f ? 1 : 0;
    rect(c, 5, 13 - y, 1, 2 + y, '#202020');
    rect(c, 10, 13, 1, 2, '#202020');
    rect(c, 3, 2, 10, 11, '#3a6ac8');
    rect(c, 3, 2, 2, 11, '#2a4a98');
    rect(c, 12, 3, 1, 9, '#f8f0d8');
    rect(c, 7, 5, 1, 2, '#ffffff');
    rect(c, 10, 5, 1, 2, '#ffffff');
    rect(c, 7, 9, 3, 1, '#ffffff');
  },
  cafe(c, f) {
    const y = f ? 1 : 0;
    rect(c, 6, 1 + y, 1, 3, '#e0e0e8');
    rect(c, 9, 0 + y, 1, 3, '#e0e0e8');
    rect(c, 3, 5, 9, 9, '#f8f8f8');
    rect(c, 12, 7, 2, 4, '#f8f8f8');
    rect(c, 3, 5, 9, 2, '#6a4028');
    rect(c, 3, 9, 9, 2, '#40a060');
    rect(c, 5, 8, 1, 1, '#202020');
    rect(c, 9, 8, 1, 1, '#202020');
  },
  aguacate(c, f) {
    const y = f ? 1 : 0;
    rect(c, 5, 13 - y, 1, 2 + y, '#2a4a1a');
    rect(c, 10, 13, 1, 2, '#2a4a1a');
    elipse(c, 8, 8, 5, 6, '#3a6a2a');
    elipse(c, 8, 8.5, 3.6, 4.6, '#d8e890');
    circulo(c, 8, 10, 2, '#8a5a30');
    rect(c, 6, 6, 1, 1, '#202020');
    rect(c, 9, 6, 1, 1, '#202020');
  },
  bao(c, f) {
    const y = f ? 1 : 0;
    elipse(c, 8, 10 + y * 0.5, 6.5, 4.5 - y * 0.5, '#f8f4ec');
    rect(c, 3, 9, 10, 1, '#e8d8c8');
    rect(c, 3, 10, 10, 1, '#d84a3a');
    rect(c, 4, 11, 8, 1, '#60b040');
    rect(c, 6, 7, 1, 1, '#202020');
    rect(c, 9, 7, 1, 1, '#202020');
  },
  gota(c, f) {
    const y = f ? 1 : 0;
    poligono(c, [8, 2 + y, 12, 9 + y, 4, 9 + y], '#f8d040');
    circulo(c, 8, 10 + y, 4, '#f8d040');
    circulo(c, 6.5, 9 + y, 1.2, '#fff8c0');
    rect(c, 7, 10 + y, 1, 1, '#202020');
    rect(c, 9, 10 + y, 1, 1, '#202020');
  },
  cabra(c, f) {
    const y = f ? 1 : 0;
    rect(c, 6, 12, 2, 3 - y, '#5a4a3a');
    rect(c, 11, 12, 2, 3 - (1 - y), '#5a4a3a');
    elipse(c, 9.5, 9.5, 5, 3.2, '#b89870');
    elipse(c, 9.5, 11, 3.5, 1.5, '#e0d0b8');
    rect(c, 14, 7, 1, 3, '#b89870');
    circulo(c, 4.5, 7, 2.6, '#a88860');
    rect(c, 1, 7, 2, 2, '#a88860');
    rect(c, 4, 3, 1, 3, '#6a5a48');
    rect(c, 5, 2, 2, 1, '#6a5a48');
    rect(c, 7, 3, 1, 1, '#6a5a48');
    rect(c, 3, 6, 1, 1, '#202020');
    rect(c, 2, 10, 1, 2, '#e0d0b8');
  },
  avispa(c, f) {
    elipse(c, 8, f ? 4 : 5, 3, 2, '#e0f4ff');
    elipse(c, 11, f ? 5 : 4, 2.5, 1.8, '#d0ecff');
    elipse(c, 10, 9, 4, 2.6, '#f8d030');
    rect(c, 9, 7, 1, 5, '#2a2a2a');
    rect(c, 11, 7, 1, 5, '#2a2a2a');
    poligono(c, [13.5, 9, 15.5, 9.5, 13.5, 10.5], '#2a2a2a');
    circulo(c, 5, 9, 2.2, '#2a2a2a');
    rect(c, 4, 8, 1, 1, '#f04040');
  },
  pina(c, f) {
    const y = f ? 1 : 0;
    elipse(c, 8, 9 + y * 0.5, 4.5, 5.8 - y * 0.5, '#8a5a30');
    for (let k = 0; k < 3; k++) {
      rect(c, 5, 6 + k * 3, 6, 1, '#6a4020');
      rect(c, 6 + (k % 2), 5 + k * 3, 1, 2, '#a87848');
      rect(c, 9 + (k % 2), 5 + k * 3, 1, 2, '#a87848');
    }
    rect(c, 7, 2, 2, 2, '#5a8a3a');
    rect(c, 6, 8, 1, 1, '#ffffff');
    rect(c, 9, 8, 1, 1, '#ffffff');
  },
  paloma(c, f) {
    elipse(c, 9, 10, 5, 3.5, '#9098a8');
    circulo(c, 4.5, 7, 2.6, '#7888a0');
    rect(c, 1, 7, 2, 1, '#e0a040');
    rect(c, 4, 6, 1, 1, '#ff6040');
    rect(c, 4, 9, 2, 1, '#60c080');
    if (f) poligono(c, [8, 9, 13, 2, 12, 9], '#b0b8c8');
    else poligono(c, [8, 9, 14, 12, 12, 8], '#b0b8c8');
    rect(c, 7, 13, 1, 2, '#e08060');
    rect(c, 10, 13, 1, 2, '#e08060');
  },
  patinete(c, f) {
    rect(c, 2, 12, 12, 1, '#303038');
    circulo(c, 3, 13.5, 1.5, f ? '#202020' : '#404040');
    circulo(c, 13, 13.5, 1.5, f ? '#404040' : '#202020');
    rect(c, 3, 2, 1, 10, '#505060');
    rect(c, 1, 2, 4, 1, '#505060');
    rect(c, 6, 9, 6, 3, '#40c0a0');
    circulo(c, 9, 5, 2.5, '#f0c8a8');
    rect(c, 7, 2, 5, 2, '#e04050');
  },
  churro(c, f) {
    const y = f ? 1 : 0;
    rect(c, 3, 3 + y, 4, 12 - y, '#e0a050');
    rect(c, 9, 3 + y, 4, 12 - y, '#e0a050');
    rect(c, 4, 3 + y, 1, 12 - y, '#c88030');
    rect(c, 10, 3 + y, 1, 12 - y, '#c88030');
    rect(c, 3, 2 + y, 10, 2, '#e0a050');
    rect(c, 5, 6, 1, 1, '#202020');
    rect(c, 10, 6, 1, 1, '#202020');
  },
};

export function enemigo(tipo, f) {
  return memo('enemigo' + tipo + f, () => figura(16, 16, (c) => ENEMIGOS[tipo](c, f)));
}

// ====================================================================== JEFES 64x64

function personaGrande(nombre, x, y, c) {
  const s = crearPersona(nombre);
  c.drawImage(escalar(s.abajo[0], 2), x, y);
}

const JEFES = {
  flamenco(c) {
    elipse(c, 32, 56, 27, 6, '#7ad0f0');
    elipse(c, 32, 55, 20, 3, '#b8ecff');
    elipse(c, 34, 44, 21, 12, '#f48ab0');
    elipse(c, 28, 39, 10, 4, '#ffc0d8');
    elipse(c, 40, 43, 10, 6, '#e86a98');
    rect(c, 50, 37, 4, 4, '#f0f0f0');
    trazo(c, [18, 42, 8, 26, 20, 13], '#f48ab0', 7);
    circulo(c, 21, 12, 7, '#f48ab0');
    poligono(c, [26, 10, 39, 15, 37, 20, 26, 15], '#f8f0e8');
    poligono(c, [34, 13, 39, 15, 37, 20, 33, 17], '#303030');
    circulo(c, 22, 10, 2, '#202020');
    poligono(c, [17, 5, 26, 7, 26, 9, 17, 7], '#202020');
  },
  jaimeRuben(c) {
    personaGrande('ruben', 0, 16, c);
    personaGrande('jaime', 32, 12, c);
    rect(c, 2, 46, 12, 4, '#3a3a48');
    rect(c, 0, 46, 3, 2, '#40ff80');
    rect(c, 50, 42, 12, 4, '#3a3a48');
    rect(c, 61, 42, 3, 2, '#40ff80');
  },
  marco(c) {
    rect(c, 5, 3, 54, 58, '#d8a838');
    rect(c, 8, 6, 48, 52, '#a87818');
    rect(c, 11, 9, 42, 46, '#88b8e8');
    rect(c, 11, 35, 42, 20, '#78b058');
    circulo(c, 44, 18, 4, '#f8e070');
    for (const [x, y] of [[5, 3], [55, 3], [5, 57], [55, 57]]) circulo(c, x + 2, y + 2, 4, '#f0c850');
    ojosEnfadados(c, 24, 40, 26, 4);
    poligono(c, [22, 44, 32, 39, 42, 44, 40, 46, 32, 42, 24, 46], '#402020');
  },
  tele(c) {
    rect(c, 18, 2, 2, 10, '#505060');
    rect(c, 44, 2, 2, 10, '#505060');
    circulo(c, 19, 2, 2, '#e04050');
    circulo(c, 45, 2, 2, '#e04050');
    rect(c, 4, 10, 56, 42, '#30303c');
    rect(c, 9, 15, 46, 32, '#2a3a8a');
    rect(c, 12, 54, 6, 6, '#30303c');
    rect(c, 46, 54, 6, 6, '#30303c');
    rect(c, 4, 50, 56, 4, '#40404c');
    circulo(c, 54, 51.5, 1, '#40ff60');
  },
  tarta(c) {
    elipse(c, 32, 58, 28, 4, '#e8e8f0');
    rect(c, 8, 40, 48, 17, '#f4d0a0');
    rect(c, 14, 27, 36, 14, '#f8e4c0');
    rect(c, 20, 17, 24, 11, '#f4d0a0');
    for (let x = 8; x <= 56; x += 6) circulo(c, x, 40, 3, '#f890b8');
    for (let x = 14; x <= 50; x += 6) circulo(c, x, 27, 3, '#ffffff');
    for (let x = 20; x <= 44; x += 6) circulo(c, x, 17, 3, '#f890b8');
    const velas = [[24, '#5a9af8'], [32, '#f8d030'], [40, '#60c060']];
    for (const [x, col] of velas) {
      rect(c, x - 1, 6, 3, 10, col);
      elipse(c, x + 0.5, 3.5, 2, 3, '#f8a020');
      elipse(c, x + 0.5, 4.5, 1, 1.5, '#fff080');
    }
    ojosEnfadados(c, 25, 39, 33, 3);
    rect(c, 26, 47, 12, 2, '#a05040');
    rect(c, 24, 46, 2, 2, '#a05040');
    rect(c, 38, 46, 2, 2, '#a05040');
  },
  nervios(c) {
    for (const [x, y, r] of [[18, 30, 12], [32, 22, 14], [46, 30, 12], [32, 36, 13], [24, 38, 9], [40, 38, 9]]) circulo(c, x, y, r, '#8a7ac8');
    circulo(c, 28, 18, 6, '#a898e0');
    poligono(c, [30, 46, 38, 46, 33, 53, 39, 53, 26, 63, 30, 55, 25, 55], '#f8d030');
    for (const [x, y] of [[6, 20], [58, 18], [8, 44], [57, 42]]) {
      poligono(c, [x, y - 4, x + 2.5, y, x - 2.5, y], '#60b8f8');
      circulo(c, x, y + 1, 2.5, '#60b8f8');
    }
    circulo(c, 24, 28, 5, '#ffffff');
    circulo(c, 40, 28, 5, '#ffffff');
    circulo(c, 25, 29, 1.5, '#202020');
    circulo(c, 39, 27, 1.5, '#202020');
    for (let i = 0; i < 5; i++) rect(c, 24 + i * 3, 38 + (i % 2) * 2, 3, 2, '#302848');
  },
  examen(c) {
    poligono(c, [10, 4, 46, 4, 54, 12, 54, 60, 10, 60], '#f8f8f8');
    poligono(c, [46, 4, 54, 12, 46, 12], '#d0d0d8');
    for (let y = 18; y < 58; y += 6) rect(c, 14, y, 36, 1, '#a8c0e8');
    rect(c, 14, 8, 20, 2, '#404048');
    ojosEnfadados(c, 24, 40, 26, 4);
    poligono(c, [24, 44, 32, 39, 40, 44, 38, 46, 32, 42, 26, 46], '#402020');
    poligono(c, [50, 30, 56, 26, 62, 52, 58, 55], '#f8c830');
    poligono(c, [58, 55, 62, 52, 61, 58], '#f0d0a0');
    poligono(c, [50, 30, 56, 26, 55, 23, 49, 27], '#f090a0');
  },
  aguacate(c) {
    elipse(c, 8, 38, 6, 8, '#3a6a2a');
    elipse(c, 56, 38, 6, 8, '#3a6a2a');
    circulo(c, 6, 28, 5, '#4a7a3a');
    circulo(c, 58, 28, 5, '#4a7a3a');
    elipse(c, 32, 34, 21, 27, '#2e5a22');
    elipse(c, 32, 36, 17, 22, '#c8e080');
    elipse(c, 32, 33, 12, 14, '#e4f0a8');
    circulo(c, 32, 45, 9, '#8a5a30');
    circulo(c, 29, 42, 3, '#b07848');
    ojosEnfadados(c, 25, 39, 26, 3.5);
  },
  cabraMontes(c) {
    elipse(c, 32, 58, 28, 6, '#9a9a90');
    elipse(c, 32, 56, 24, 4, '#b8b8b0');
    for (const x of [22, 28, 40, 46]) rect(c, x, 44, 4, 12, '#6a5040');
    elipse(c, 36, 38, 18, 10, '#a08060');
    elipse(c, 36, 42, 12, 5, '#d0c0a0');
    rect(c, 52, 32, 3, 6, '#a08060');
    poligono(c, [18, 30, 26, 34, 24, 22, 16, 18], '#a08060');
    circulo(c, 15, 20, 8, '#907050');
    rect(c, 6, 20, 4, 5, '#907050');
    trazo(c, [16, 14, 22, 2, 34, 8], '#5a4a38', 5);
    trazo(c, [12, 14, 14, 4, 24, 6], '#6a5a48', 4);
    poligono(c, [9, 25, 13, 25, 11, 32], '#e0d0b8');
    circulo(c, 13, 18, 1.6, '#202020');
    poligono(c, [9, 14, 17, 15, 17, 17, 9, 16], '#202020');
  },
  alex(c) {
    poligono(c, [14, 36, 50, 36, 58, 64, 6, 64], '#c83040');
    poligono(c, [14, 36, 50, 36, 52, 42, 12, 42], '#e85060');
    personaGrande('alex', 16, 14, c);
    rect(c, 54, 30, 3, 32, '#8a5a30');
    c.strokeStyle = '#8a5a30';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(51, 30, 4.5, Math.PI, 0);
    c.stroke();
    circulo(c, 32, 46, 3, '#f8d030');
  },
};

export function jefe(tipo) {
  return memo('jefe' + tipo, () => {
    const c = figura(64, 64, (ctx) => JEFES[tipo](ctx));
    if (tipo === 'tele') {
      const ctx = c.getContext('2d');
      escribir(ctx, '¿SIGUES', 12, 19, '#ffffff', null);
      escribir(ctx, 'AHÍ?', 21, 31, '#ffffff', null);
    }
    return c;
  });
}

// Sprites grandes de personas para los combates contra amigos.
export function personaEnCombate(nombre) {
  return memo('pc' + nombre, () => {
    const [c, ctx] = lienzo(64, 64);
    personaGrande(nombre, 16, 14, ctx);
    return contorno(c);
  });
}
