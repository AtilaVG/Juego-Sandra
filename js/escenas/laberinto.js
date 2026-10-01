// Thyssen: escapar del vigilante del museo recogiendo las postales.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { sfx } from '../motor/audio.js';
import { rect, elipse, hash } from '../motor/dibujo.js';
import { escribirCentrado } from '../motor/fuente.js';
import { crearPersona } from '../arte/personas.js';
import { polaroid } from '../arte/escenario.js';
import { Minijuego, marcador } from './minijuego.js';

const T = 16;
const A = (texto) => ({ quien: 'Alex', texto });

// '#' pared  '.' suelo  'S' salida de Sandra  'G' vigilante  '*' postal  'E' puerta de salida
export const MAPA_MUSEO = [
  '#########################',
  '#S....#.........#......*#',
  '#.##..#.###.###.#.####..#',
  '#.#*........#.......#.#.#',
  '#.#.###.###.#.#####.#.#.#',
  '#...#.....#...#.*...#...#',
  '###.#.###.#.###.###.###.#',
  '#.....#...........#.....#',
  '#.###.#.#####.###.#.###.#',
  '#.#*..#.......#.....#...#',
  '#.#.###.#####.#.#####.#.#',
  '#.......#...#.#.....#.#.#',
  '#.#####.#.#.#.#.###.#.#.#',
  '#.....*...#.G.....#....E#',
  '#########################',
];

const VIGILANTE = {
  piel: '#e8c0a0',
  pelo: '#8a8a8a',
  estilo: 'corto',
  camiseta: '#2a3a6a',
  pantalon: '#1a2040',
  zapatos: '#101010',
  cabeza: 'gorra',
  colCabeza: '#1a2448',
  logo: '#f8d030',
  barbita: true,
};

const DIRS = { arr: [0, -1], abj: [0, 1], izq: [-1, 0], der: [1, 0] };

function cuerpo(x, y, dir = 'abj') {
  return { tx: x, ty: y, px: x * T, py: y * T, dir, moviendo: false, paso: 0 };
}

export class EscenaLaberinto extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.grid = MAPA_MUSEO.map((f) => f.split(''));
    this.postales = [];
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const c = this.grid[y][x];
        if (c === 'S') this.inicio = { x, y };
        if (c === 'G') this.puesto = { x, y };
        if (c === 'E') this.salida = { x, y };
        if (c === '*') this.postales.push({ x, y, cogida: false });
      }
    }
    this.pillado = 0;
    this.colocar();
  }

  colocar() {
    this.jug = cuerpo(this.inicio.x, this.inicio.y, 'der');
    this.alex = cuerpo(this.inicio.x, this.inicio.y + 1, 'arr');
    this.guardia = cuerpo(this.puesto.x, this.puesto.y);
    this.espera = 110;
  }

  empezar() {
    this.bocadillo = { texto: 'Coge las 5 postales y salid por la puerta verde. ¡Que no os pille el vigilante!', t: 260 };
  }

  libre(x, y) {
    return this.grid[y] && this.grid[y][x] !== undefined && this.grid[y][x] !== '#';
  }

  get recogidas() {
    return this.postales.filter((p) => p.cogida).length;
  }

  mover(c, vel) {
    if (!c.moviendo) return;
    const ox = c.tx * T;
    const oy = c.ty * T;
    c.px += Math.sign(ox - c.px) * Math.min(vel, Math.abs(ox - c.px));
    c.py += Math.sign(oy - c.py) * Math.min(vel, Math.abs(oy - c.py));
    if (c.px === ox && c.py === oy) c.moviendo = false;
  }

  ir(c, x, y) {
    c.dir = x > c.tx ? 'der' : x < c.tx ? 'izq' : y > c.ty ? 'abj' : 'arr';
    c.tx = x;
    c.ty = y;
    c.moviendo = true;
    c.paso = (c.paso + 1) % 2;
  }

  // Siguiente casilla del vigilante hacia Sandra (búsqueda en anchura).
  pasoHacia(desde, hasta) {
    const w = this.grid[0].length;
    const clave = (x, y) => y * w + x;
    const previo = new Map([[clave(desde.x, desde.y), null]]);
    const cola = [desde];
    while (cola.length) {
      const n = cola.shift();
      if (n.x === hasta.x && n.y === hasta.y) break;
      for (const [dx, dy] of Object.values(DIRS)) {
        const x = n.x + dx;
        const y = n.y + dy;
        if (!this.libre(x, y) || previo.has(clave(x, y))) continue;
        previo.set(clave(x, y), n);
        cola.push({ x, y });
      }
    }
    let n = { x: hasta.x, y: hasta.y };
    if (!previo.has(clave(n.x, n.y))) return null;
    while (previo.get(clave(n.x, n.y)) && !(previo.get(clave(n.x, n.y)).x === desde.x && previo.get(clave(n.x, n.y)).y === desde.y)) {
      n = previo.get(clave(n.x, n.y));
    }
    return n;
  }

  jugar() {
    const j = this.jug;
    this.mover(j, 2);
    this.mover(this.alex, 2);
    if (!j.moviendo) {
      this.recoger();
      let dir = null;
      for (const d of ['arr', 'abj', 'izq', 'der']) if (E.mantenido[d]) dir = dir || d;
      if (dir) {
        j.dir = dir;
        const [dx, dy] = DIRS[dir];
        if (this.libre(j.tx + dx, j.ty + dy)) {
          this.ir(this.alex, j.tx, j.ty);
          this.ir(j, j.tx + dx, j.ty + dy);
        }
      }
    }

    // Vigilante. Después de pillaros 3 veces se queda dormido (para no frustrarse).
    const g = this.guardia;
    if (this.pillado >= 3) {
      g.dormido = true;
    } else if (this.espera > 0) {
      this.espera--;
      if (this.espera === 1) sfx.campana();
    } else {
      // Patrulla y solo persigue si estás cerca. Cada vez que te pilla, va más despacio.
      // Si lleva un rato persiguiendo, se cansa y vuelve a patrullar.
      let cerca = Math.abs(g.tx - j.tx) + Math.abs(g.ty - j.ty) <= 5;
      g.cansancio = cerca ? (g.cansancio || 0) + 1 : Math.max(0, (g.cansancio || 0) - 2);
      if (g.cansancio > 240) {
        g.descanso = 180;
        g.cansancio = 0;
      }
      if (g.descanso > 0) {
        g.descanso--;
        cerca = false;
      }
      g.persigue = cerca;
      const lento = Math.max(0.7, 1 - this.pillado * 0.12);
      this.mover(g, (cerca ? 1.05 : 0.8) * lento);
      if (!g.moviendo) {
        let paso = cerca && Math.random() > 0.15 ? this.pasoHacia({ x: g.tx, y: g.ty }, { x: j.tx, y: j.ty }) : null;
        if (!paso) {
          const [vx, vy] = DIRS[g.dir];
          const recto = { x: g.tx + vx, y: g.ty + vy };
          const opciones = Object.values(DIRS)
            .map(([dx, dy]) => ({ x: g.tx + dx, y: g.ty + dy, atras: dx === -vx && dy === -vy }))
            .filter((q) => this.libre(q.x, q.y));
          const sinVolver = opciones.filter((q) => !q.atras);
          if (this.libre(recto.x, recto.y) && Math.random() < 0.7) paso = recto;
          else {
            const lista = sinVolver.length ? sinVolver : opciones;
            paso = lista[Math.floor(Math.random() * lista.length)];
          }
        }
        if (paso) this.ir(g, paso.x, paso.y);
      }
      if (Math.hypot(g.px - j.px, g.py - j.py) < 11) this.atrapado();
    }
  }

  recoger() {
    const j = this.jug;
    for (const p of this.postales) {
      if (!p.cogida && p.x === j.tx && p.y === j.ty) {
        p.cogida = true;
        sfx.beso();
        if (this.recogidas === this.postales.length) {
          sfx.vida();
          this.bocadillo = { texto: '¡Las tienes todas! Ahora, a la puerta verde de abajo a la derecha.', t: 240 };
        }
      }
    }
    if (j.tx === this.salida.x && j.ty === this.salida.y) {
      if (this.recogidas === this.postales.length) this.ganar('¡Habéis escapado del museo!');
      else if (!this.bocadillo) this.bocadillo = { texto: 'Aún faltan postales. ¡No nos vamos sin ellas!', t: 150 };
    }
  }

  atrapado() {
    sfx.dano();
    this.pillado++;
    this.decir(
      [{ quien: 'Vigilante', texto: '¡Eh, vosotros! ¡En el museo no se corre!' }, A('Uy... ¡Vuelta a la entrada! Las postales que tenemos nos las quedamos.')],
      () => {
        this.colocar();
        if (this.pillado >= 3) this.bocadillo = { texto: 'El vigilante se ha quedado dormido en su silla... ¡Aprovecha!', t: 240 };
      },
    );
  }

  // ---------------------------------------------------------------- dibujo

  camara() {
    const W = this.grid[0].length * T;
    const H = this.grid.length * T;
    const cx = this.jug.px + 8 - P.ancho / 2;
    const cy = this.jug.py + 8 - P.alto / 2;
    return {
      x: Math.round(W <= P.ancho ? (W - P.ancho) / 2 : Math.max(0, Math.min(W - P.ancho, cx))),
      y: Math.round(Math.max(-24, Math.min(H - P.alto + 4, cy))),
    };
  }

  sprite(c, s) {
    const nombre = { arr: 'arriba', abj: 'abajo', izq: 'izq', der: 'der' }[c.dir];
    let f = 0;
    if (c.moviendo) {
      const resto = (Math.abs(c.px - c.tx * T) + Math.abs(c.py - c.ty * T)) / T;
      if (resto > 0.25 && resto < 0.85) f = c.paso ? 1 : 2;
    }
    return s[nombre][f];
  }

  pintar(ctx) {
    const cam = this.camara();
    ctx.fillStyle = '#3a1018';
    ctx.fillRect(0, 0, P.ancho, P.alto);
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const px = x * T - cam.x;
        const py = y * T - cam.y;
        if (px < -T || px > P.ancho || py < -T || py > P.alto) continue;
        if (this.grid[y][x] === '#') this.pared(ctx, px, py, x, y);
        else this.suelo(ctx, px, py, x, y);
      }
    }
    // Puerta de salida.
    const abierta = this.recogidas === this.postales.length;
    const sx = this.salida.x * T - cam.x;
    const sy = this.salida.y * T - cam.y;
    rect(ctx, sx + 1, sy + 1, 14, 14, abierta ? '#40c060' : '#707880');
    rect(ctx, sx + 3, sy + 3, 10, 12, abierta ? '#60e080' : '#9098a0');
    if (abierta && Math.floor(this.t / 20) % 2) escribirCentrado(ctx, '!', sx + 8, sy - 10, '#f8d030', '#383838');

    for (const p of this.postales) {
      if (p.cogida) continue;
      const bob = Math.round(Math.sin(this.t / 12 + p.x) * 1.5);
      ctx.drawImage(polaroid(), p.x * T - cam.x + 1, p.y * T - cam.y + bob);
    }

    const figuras = [
      { c: this.alex, s: crearPersona('alex') },
      { c: this.jug, s: crearPersona('sandra') },
      { c: this.guardia, s: crearPersona(VIGILANTE) },
    ].sort((a, b) => a.c.py - b.c.py);
    for (const { c, s } of figuras) {
      const x = Math.round(c.px - cam.x);
      const y = Math.round(c.py - cam.y);
      elipse(ctx, x + 8, y + 15, 6, 2, 'rgba(0,0,0,0.25)');
      ctx.drawImage(this.sprite(c, s), x, y - 7);
    }
    const g = this.guardia;
    if (g.dormido) {
      escribirCentrado(ctx, Math.floor(this.t / 30) % 2 ? 'z' : 'Z', g.px - cam.x + 12, g.py - cam.y - 18 - (this.t % 30) / 6, '#ffffff', '#383838');
    } else if (this.espera > 0 || g.persigue) {
      escribirCentrado(ctx, this.espera > 0 ? '?' : '!', g.px - cam.x + 8, g.py - cam.y - 20, g.persigue ? '#ff4040' : '#f8d030', '#383838');
    }

    marcador(ctx, 'Postales: ' + this.recogidas + '/' + this.postales.length);
  }

  suelo(ctx, x, y, tx, ty) {
    rect(ctx, x, y, T, T, (tx + ty) % 2 ? '#c8945a' : '#c08a52');
    rect(ctx, x, y + 7, T, 1, '#a87440');
    rect(ctx, x + ((ty * 5) % 16), y, 1, 7, '#a87440');
    rect(ctx, x + ((ty * 5 + 8) % 16), y + 8, 1, 8, '#a87440');
  }

  pared(ctx, x, y, tx, ty) {
    const debajoLibre = this.libre(tx, ty + 1);
    if (!debajoLibre) {
      rect(ctx, x, y, T, T, '#5a1424');
      rect(ctx, x, y, T, 1, '#7a2a3a');
      return;
    }
    rect(ctx, x, y, T, 5, '#5a1424');
    rect(ctx, x, y + 5, T, 11, '#8a3040');
    rect(ctx, x, y + 13, T, 3, '#5a2a1a');
    if (hash(tx, ty) % 3 === 0) {
      rect(ctx, x + 3, y + 6, 10, 6, '#d8a838');
      rect(ctx, x + 4, y + 7, 8, 4, ['#88b8e8', '#e8c060', '#78b058', '#d86a6a'][hash(ty, tx) % 4]);
    }
  }
}
