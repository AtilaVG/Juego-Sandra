// Mapa de Valdemoro (vista desde arriba, casillas de 16x16).
// Leyenda: '.' césped  ',' flores  ':' camino  '_' plaza  '~' agua
//          'F' valla  '=' vías  'T' árbol  'l' farola  'b' banco
//          's' cartel  'P' cabina de teléfono  'h' seto  'o' fuente
import { PERSONAJES } from './config.js';

export const ANCHO_MAPA = 40;
export const ALTO_MAPA = 30;

const m = Array.from({ length: ALTO_MAPA }, () => new Array(ANCHO_MAPA).fill('.'));

function rellenar(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (m[j] && i >= 0 && i < ANCHO_MAPA) m[j][i] = c;
}
function poner(x, y, c) {
  m[y][x] = c;
}

// Bordes de árboles.
rellenar(0, 0, 40, 2, 'T');
rellenar(0, 28, 40, 2, 'T');
rellenar(0, 0, 2, 30, 'T');
rellenar(38, 0, 2, 30, 'T');

// Calles.
rellenar(2, 9, 36, 2, ':'); // calle principal
rellenar(10, 4, 2, 21, ':'); // calle oeste
rellenar(28, 10, 2, 14, ':'); // calle este
rellenar(10, 23, 27, 2, ':'); // calle sur
rellenar(4, 16, 8, 1, ':'); // a casa de Sandra
rellenar(28, 16, 8, 1, ':'); // a casa de Alex
rellenar(6, 7, 1, 2, ':'); // a láser tag
rellenar(33, 7, 1, 2, ':'); // al curro
rellenar(14, 22, 1, 1, ':'); // a la piscina
rellenar(30, 23, 1, 1, ':'); // a la estación
rellenar(7, 22, 3, 1, ':'); // al bar

// Plaza de la Constitución.
rellenar(14, 6, 12, 5, '_');
rellenar(19, 7, 2, 2, 'o');

// Piscina municipal: zona vallada con agua.
rellenar(17, 18, 8, 5, 'F');
rellenar(18, 19, 6, 3, '~');

// Vías del tren.
rellenar(2, 25, 36, 1, 'F');
rellenar(2, 26, 36, 2, '=');

// Árboles, setos y flores de decoración.
const arboles = [
  [13, 3], [14, 3], [26, 3], [27, 3], [2, 11], [2, 12], [2, 13], [2, 14], [2, 15],
  [13, 12], [13, 13], [14, 14], [24, 12], [25, 12], [26, 15], [37, 11], [37, 12],
  [37, 13], [37, 14], [36, 18], [37, 18], [2, 18], [3, 18], [2, 19],
  [26, 18], [26, 19], [35, 21], [36, 21], [2, 2], [3, 2], [36, 2], [37, 2],
  [24, 3], [25, 4], [8, 12], [9, 12], [21, 13], [20, 14], [33, 19], [34, 19],
];
for (const [x, y] of arboles) poner(x, y, 'T');
rellenar(14, 11, 3, 1, 'h');
rellenar(23, 11, 3, 1, 'h');
for (const [x, y] of [[3, 7], [4, 7], [15, 13], [16, 13], [17, 13], [21, 16], [22, 16], [30, 7], [31, 7], [3, 21], [4, 21], [33, 17], [34, 17], [20, 17], [27, 17], [36, 16]]) poner(x, y, ',');

// Mobiliario urbano.
for (const [x, y] of [[13, 8], [26, 8], [12, 22], [26, 22], [9, 17], [30, 17]]) poner(x, y, 'l');
poner(15, 7, 'P');
for (const [x, y] of [[17, 6], [22, 6]]) poner(x, y, 'b');

// Carteles (texto al leerlos).
export const CARTELES = {
  '12,11': ['VALDEMORO', 'Aquí empezó todo. ♥'],
  '8,7': ['LÁSER TAG', 'Prohibido picarse. (Nadie lo cumple.)'],
  '35,7': ['EL CURRO', 'Donde Alex y Sandra se conocieron.'],
  '3,16': ['Casa de Sandra', 'Hogar de Sandra, Begoña, David y Laila.'],
  '31,15': ['Casa de Alex', 'Cuidado: dentro vive un abuelete.'],
  '13,22': ['PISCINA MUNICIPAL', 'Abierta en verano. Prohibido hacer bombas. (Sí, a ti.)'],
  '34,22': ['ESTACIÓN DE VALDEMORO', 'Trenes a Madrid cada pocos minutos.'],
  '33,18': ['ESCAPADA RURAL', 'Destino: Cuevas del Valle (Ávila). ¡Todos al coche!'],
  '24,8': ['PLAZA DE LA CONSTITUCIÓN', 'El centro de Valdemoro.'],
};
for (const k in CARTELES) {
  const [x, y] = k.split(',').map(Number);
  poner(x, y, 's');
}

export const MAPA = m.map((fila) => fila.join(''));

// Edificios: casillas que ocupan, estilo y puerta (abajo en el centro salvo que se indique).
export const EDIFICIOS = [
  { id: 'lasertag', x: 3, y: 3, w: 6, h: 4, estilo: 'lasertag', rotulo: 'LÁSER TAG', puerta: 6 },
  { id: 'ayuntamiento', x: 16, y: 2, w: 8, h: 4, estilo: 'ayuntamiento', rotulo: 'AYUNTAMIENTO', puerta: 20 },
  { id: 'curro', x: 30, y: 3, w: 6, h: 4, estilo: 'oficina', rotulo: 'EL CURRO', puerta: 33 },
  { id: 'casaSandra', x: 3, y: 12, w: 5, h: 4, estilo: 'casa', techo: '#e0604a', rotulo: 'SANDRA', puerta: 5 },
  { id: 'casaAlex', x: 32, y: 12, w: 5, h: 4, estilo: 'casa', techo: '#4a78d0', rotulo: 'ALEX', puerta: 34 },
  { id: 'piscina', x: 12, y: 19, w: 5, h: 3, estilo: 'piscina', rotulo: 'PISCINA', puerta: 14 },
  { id: 'estacion', x: 27, y: 20, w: 7, h: 3, estilo: 'estacion', rotulo: 'ESTACIÓN', puerta: 30 },
  { id: 'casa1', x: 16, y: 14, w: 4, h: 3, estilo: 'casa', techo: '#5aa060', puerta: null },
  { id: 'casa2', x: 23, y: 13, w: 3, h: 3, estilo: 'casa', techo: '#c0884a', puerta: null },
  { id: 'bar', x: 5, y: 19, w: 4, h: 3, estilo: 'bar', rotulo: 'BAR', puerta: 7 },
  { id: 'coche', x: 31, y: 18, w: 2, h: 1, estilo: 'coche', puerta: 31 },
];

// Qué pasa al entrar por cada puerta. "niveles" en orden de la historia.
export const PUERTAS = {
  lasertag: { niveles: ['lasertag'] },
  casaSandra: { niveles: ['series', 'comida', 'maquillaje'] },
  casaAlex: { niveles: ['cumple', 'cenas'] },
  piscina: { niveles: ['piscina'] },
  estacion: { niveles: ['thyssen', 'uni', 'madrid'] },
  coche: { niveles: ['rural'] },
  ayuntamiento: { texto: ['El Ayuntamiento de Valdemoro.', 'Está cerrado. Pone: "Vuelva usted mañana".'] },
  curro: {
    texto: [
      'EL CURRO. Aquí fue donde os conocisteis.',
      { quien: 'Alex', texto: 'Quién nos iba a decir que de aquí saldría todo esto, ¿eh, bebe?' },
    ],
  },
  bar: { texto: ['El bar del barrio. Huele a tortilla recién hecha.', 'Hoy no hay tiempo para cañas: ¡hay aventuras pendientes!'] },
};

export const INICIO = { x: 5, y: 16, dir: 'abj' };

// Personajes del pueblo. "dice" puede ser una lista o una función(estado).
export const VECINOS = [
  {
    id: 'laila', x: 8, y: 15, gato: true,
    dice: (e) =>
      e.finalVisto
        ? ['Laila se frota contra tus piernas.', '¡Hasta Laila está orgullosa de ti! ♥']
        : ['Laila te mira fijamente...', '...y se gira. Es algo suya.', 'Pero luego vuelve y se deja acariciar. Es maja. ♥'],
  },
  {
    id: 'begona', x: 8, y: 13, dir: 'abj', persona: PERSONAJES.begona,
    dice: (e) =>
      e.medallas.includes('comida')
        ? ['BEGOÑA: Alex es muy majo. Y come de todo, ¡eso me gusta!']
        : ['BEGOÑA: ¡Hola, cariño! ¿Otra aventura con Alex?', 'BEGOÑA: Cuando queráis venís a comer, que hago de sobra.'],
  },
  {
    id: 'david', x: 9, y: 13, dir: 'abj', persona: PERSONAJES.david,
    dice: (e) =>
      e.medallas.includes('comida')
        ? ['DAVID: El chaval aprobó el examen de la comida. Buena señal.']
        : ['DAVID: Si ves a Alex, dile que traiga postre.'],
  },
  {
    id: 'bea', x: 22, y: 8, dir: 'abj', persona: PERSONAJES.bea,
    dice: (e) =>
      e.finalVisto
        ? ['BEA: ¡Lo has conseguido! Ya sabía yo que eras la mejor.']
        : e.medallas.includes('rural')
          ? ['BEA: ¡Qué bien lo pasamos en la casa rural de Cuevas del Valle!', 'BEA: Tenemos que repetir. ¡Ya!']
          : ['BEA: ¡Tía! ¿Qué tal con Alex?', 'BEA: Se os ve tan bien juntos... ¡Me alegro un montón!'],
  },
  {
    id: 'jaime', x: 4, y: 8, dir: 'abj', persona: PERSONAJES.jaime,
    dice: (e) =>
      e.medallas.includes('rural')
        ? ['JAIME: Lo de Gredos fue épico. Las vistas del mirador... ¡y la cena!']
        : e.medallas.includes('lasertag')
        ? ['JAIME: Revancha en el láser tag cuando quieras. Esta vez gano yo.']
        : ['JAIME: ¿Vienes al láser tag? Rubén dice que es imbatible.', 'JAIME: (Spoiler: no lo es.)'],
  },
  {
    id: 'ruben', x: 5, y: 8, dir: 'abj', persona: PERSONAJES.ruben,
    dice: (e) =>
      e.medallas.includes('rural')
        ? ['RUBÉN: Sigo pensando en esa casa rural. Y en las cabras. Sobre todo en las cabras.']
        : e.medallas.includes('lasertag')
        ? ['RUBÉN: Nos ganaste bien... pero no se lo digas a nadie.']
        : ['RUBÉN: En el láser tag soy una leyenda.', 'RUBÉN: Bueno, eso dice mi madre.'],
  },
  {
    id: 'abuelo', x: 18, y: 10, dir: 'abj', vecino: 3,
    dice: ['¿Que a tu novio le llamas abuelete?', '¡Pues que venga a jugar a la petanca conmigo!'],
  },
  {
    id: 'socorrista', x: 21, y: 23, dir: 'arr', vecino: 7,
    dice: ['SOCORRISTA: ¡Nada de correr por el bordillo!', 'SOCORRISTA: ...ni de tirar a nadie al agua. Te estoy mirando.'],
  },
  {
    id: 'viajero', x: 33, y: 24, dir: 'izq', vecino: 12,
    dice: ['El Cercanías a Madrid tarda nada.', 'Dicen que los atardeceres en el Templo de Debod son preciosos...'],
  },
  {
    id: 'nina', x: 24, y: 9, dir: 'abj', vecino: 21,
    dice: ['¿Sabías que si tocas la pantalla también puedes hablar?', '¡Y con el botón B o la X le pides pistas a Alex en las aventuras!'],
  },
];
