// Fuente de píxeles propia (estilo Pokémon) con tildes, ñ, ¿ y ¡.
// Cada glifo: filas separadas por "/", "#" = píxel. Un prefijo "N:" indica
// en qué fila empieza (0 = arriba de las mayúsculas, 7-8 = descendentes).
// Internamente hay una fila extra arriba para las tildes de las mayúsculas.

const ALTO_GLIFO = 10;
export const ALTO_LINEA = 13;

const DEF = {
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#',
  B: '####./#...#/#...#/####./#...#/#...#/####.',
  C: '.###./#...#/#..../#..../#..../#...#/.###.',
  D: '###../#..#./#...#/#...#/#...#/#..#./###..',
  E: '#####/#..../#..../####./#..../#..../#####',
  F: '#####/#..../#..../####./#..../#..../#....',
  G: '.###./#...#/#..../#.###/#...#/#...#/.###.',
  H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  I: '###/.#./.#./.#./.#./.#./###',
  J: '..##/...#/...#/...#/#..#/#..#/.##.',
  K: '#...#/#..#./#.#../##.../#.#../#..#./#...#',
  L: '#..../#..../#..../#..../#..../#..../#####',
  M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#',
  N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
  O: '.###./#...#/#...#/#...#/#...#/#...#/.###.',
  P: '####./#...#/#...#/####./#..../#..../#....',
  Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
  R: '####./#...#/#...#/####./#.#../#..#./#...#',
  S: '.###./#...#/#..../.###./....#/#...#/.###.',
  T: '#####/..#../..#../..#../..#../..#../..#..',
  U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
  V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#',
  X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..',
  Z: '#####/....#/...#./..#../.#.../#..../#####',
  a: '2:.###./....#/.####/#...#/.####',
  b: '#..../#..../####./#...#/#...#/#...#/####.',
  c: '2:.###/#.../#.../#.../.###',
  d: '....#/....#/.####/#...#/#...#/#...#/.####',
  e: '2:.###./#...#/#####/#..../.###.',
  f: '..##/.#../####/.#../.#../.#../.#..',
  g: '2:.####/#...#/#...#/#...#/.####/....#/.###.',
  h: '#..../#..../####./#...#/#...#/#...#/#...#',
  i: '#/./#/#/#/#/#',
  ı: '2:#/#/#/#/#',
  j: '..#/.../..#/..#/..#/..#/..#/#.#/.#.',
  k: '#.../#.../#..#/#.#./##../#.#./#..#',
  l: '#./#./#./#./#./#./.#',
  m: '2:##.#./#.#.#/#.#.#/#.#.#/#...#',
  n: '2:####./#...#/#...#/#...#/#...#',
  o: '2:.###./#...#/#...#/#...#/.###.',
  p: '2:####./#...#/#...#/#...#/####./#..../#....',
  q: '2:.####/#...#/#...#/#...#/.####/....#/....#',
  r: '2:#.##/##../#.../#.../#...',
  s: '2:.####/#..../.###./....#/####.',
  t: '.#../.#../####/.#../.#../.#../..##',
  u: '2:#...#/#...#/#...#/#...#/.####',
  v: '2:#...#/#...#/#...#/.#.#./..#..',
  w: '2:#...#/#...#/#.#.#/#.#.#/.#.#.',
  x: '2:#...#/.#.#./..#../.#.#./#...#',
  y: '2:#...#/#...#/#...#/#...#/.####/....#/.###.',
  z: '2:#####/...#./..#../.#.../#####',
  0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
  1: '.#./##./.#./.#./.#./.#./###',
  2: '.###./#...#/....#/...#./..#../.#.../#####',
  3: '#####/...#./..#../...#./....#/#...#/.###.',
  4: '...#./..##./.#.#./#..#./#####/...#./...#.',
  5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '..##./.#.../#..../####./#...#/#...#/.###.',
  7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.',
  9: '.###./#...#/#...#/.####/....#/...#./.##..',
  '.': '6:#',
  ',': '6:.#/#.',
  '!': '#/#/#/#/#/./#',
  '¡': '1:#/./#/#/#/#/#/#',
  '?': '.###./#...#/....#/...#./..#../...../..#..',
  '¿': '1:..#../...../..#../.#.../#..../#...#/.###.',
  ':': '2:#/./././#',
  ';': '2:.#/../../.#/#.',
  '-': '3:####',
  '+': '1:..#../..#../#####/..#../..#..',
  "'": '#/#',
  '"': '#.#/#.#',
  '(': '..#/.#./#../#../#../.#./..#',
  ')': '#../.#./..#/..#/..#/.#./#..',
  '/': '....#/....#/...#./..#../.#.../#..../#....',
  '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
  '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#',
  '*': '1:#.#.#/.###./#####/.###./#.#.#',
  '=': '2:####/..../####',
  '<': '...#/..#./.#../#.../.#../..#./...#',
  '>': '#.../.#../..#./...#/..#./.#../#...',
  '♥': '1:##.##/#####/#####/.###./..#..',
  '♪': '..##./..#.#/..#../..#../.##../###../.#...',
  '▶': '#.../##../###./####/###./##../#...',
  '…': '6:#.#.#',
  '_': '6:#####',
  '#': '1:.#.#./#####/.#.#./.#.#./#####/.#.#.',
  '·': '3:#',
  '×': '2:#...#/.#.#./..#../.#.#./#...#',
};

// Tildes: [fila interna, patrón]. Fila 0 = encima de las mayúsculas.
const AGUDO_MIN = [[1, '...#.'], [2, '..#..']];
const ACENTOS = {
  á: ['a', AGUDO_MIN],
  é: ['e', AGUDO_MIN],
  ó: ['o', AGUDO_MIN],
  ú: ['u', AGUDO_MIN],
  í: ['ı', [[1, '.#'], [2, '#.']]],
  ü: ['u', [[1, '.#.#.']]],
  ñ: ['n', [[1, '.##.#'], [2, '#..#.']]],
  Á: ['A', [[0, '..##.']]],
  É: ['E', [[0, '..##.']]],
  Í: ['I', [[0, '.##']]],
  Ó: ['O', [[0, '..##.']]],
  Ú: ['U', [[0, '..##.']]],
  Ü: ['U', [[0, '.#.#.']]],
  Ñ: ['N', [[0, '.###.']]],
};

const glifos = {};

function analizar(spec) {
  let inicio = 0;
  const m = /^(\d+):(.*)$/.exec(spec);
  if (m) {
    inicio = +m[1];
    spec = m[2];
  }
  const filas = spec.split('/');
  const w = Math.max(...filas.map((f) => f.length));
  const rejilla = Array.from({ length: ALTO_GLIFO }, () => new Array(w).fill(0));
  filas.forEach((f, i) => {
    for (let x = 0; x < f.length; x++) if (f[x] === '#') rejilla[inicio + i + 1][x] = 1;
  });
  return { w, rejilla };
}

for (const k in DEF) glifos[k] = analizar(DEF[k]);
for (const k in ACENTOS) {
  const [base, marcas] = ACENTOS[k];
  const g = glifos[base];
  const rejilla = g.rejilla.map((f) => f.slice());
  for (const [fila, patron] of marcas) {
    for (let x = 0; x < patron.length && x < g.w; x++) if (patron[x] === '#') rejilla[fila][x] = 1;
  }
  glifos[k] = { w: g.w, rejilla };
}

const ANCHO_ESPACIO = 3;
const cache = new Map();

function glifoColor(ch, color) {
  let porColor = cache.get(color);
  if (!porColor) {
    porColor = new Map();
    cache.set(color, porColor);
  }
  let c = porColor.get(ch);
  if (c) return c;
  const g = glifos[ch] || glifos['?'];
  c = document.createElement('canvas');
  c.width = g.w;
  c.height = ALTO_GLIFO;
  const x = c.getContext('2d');
  x.fillStyle = color;
  for (let fy = 0; fy < ALTO_GLIFO; fy++)
    for (let fx = 0; fx < g.w; fx++) if (g.rejilla[fy][fx]) x.fillRect(fx, fy, 1, 1);
  porColor.set(ch, c);
  return c;
}

function anchoCar(ch) {
  if (ch === ' ') return ANCHO_ESPACIO;
  const g = glifos[ch] || glifos['?'];
  return g.w;
}

export function anchoTexto(s, escala = 1) {
  let w = 0;
  for (const ch of s) w += anchoCar(ch) + 1;
  return Math.max(0, w - 1) * escala;
}

function pintar(ctx, s, x, y, color, escala) {
  let cx = x;
  for (const ch of s) {
    if (ch !== ' ') {
      const c = glifoColor(ch, color);
      if (escala === 1) ctx.drawImage(c, Math.round(cx), Math.round(y));
      else ctx.drawImage(c, Math.round(cx), Math.round(y), c.width * escala, c.height * escala);
    }
    cx += (anchoCar(ch) + 1) * escala;
  }
}

// Escribe texto. "y" es la parte de arriba de la línea (incluye hueco para tildes).
export function escribir(ctx, s, x, y, color = '#404048', sombra = '#d0d0c8', escala = 1) {
  s = String(s);
  if (sombra) pintar(ctx, s, x + escala, y + escala, sombra, escala);
  pintar(ctx, s, x, y, color, escala);
  return anchoTexto(s, escala);
}

export function escribirCentrado(ctx, s, cx, y, color, sombra, escala = 1) {
  const w = anchoTexto(String(s), escala);
  escribir(ctx, s, Math.round(cx - w / 2), y, color, sombra, escala);
}

// Corta un texto en líneas que quepan en "max" píxeles.
export function envolver(s, max) {
  const lineas = [];
  for (const parrafo of String(s).split('\n')) {
    let actual = '';
    for (const palabra of parrafo.split(' ')) {
      const prueba = actual ? actual + ' ' + palabra : palabra;
      if (anchoTexto(prueba) <= max || !actual) actual = prueba;
      else {
        lineas.push(actual);
        actual = palabra;
      }
    }
    lineas.push(actual);
  }
  return lineas;
}
