// Valdemoro: el mapa del pueblo visto desde arriba (estilo Pokémon).
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, anchoTexto } from '../motor/fuente.js';
import { caja, Guion, decir, preguntar, esperar } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { elipse } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { crearPersona, vecino } from '../arte/personas.js';
import { lailaMundo } from '../arte/bichos.js';
import { crearSuelo, dibujarAgua, arbol, farola, cabina, cartel, banco, fuente, edificio, dibujarExclamacion } from '../arte/pueblo.js';
import { MAPA, ANCHO_MAPA, ALTO_MAPA, EDIFICIOS, PUERTAS, INICIO, VECINOS, CARTELES } from '../datos/mapa.js';
import { AVENTURAS, aventura } from '../datos/aventuras.js';
import { MUSICA } from '../datos/musica.js';
import { jugarAventura } from './flujo.js';
import { MenuPausa } from './menu.js';

const T = 16;
const VEL = 2; // píxeles por fotograma al andar
const A = (texto) => ({ quien: 'Alex', texto });
const DIRS = { arr: [0, -1], abj: [0, 1], izq: [-1, 0], der: [1, 0] };
const OPUESTA = { arr: 'abj', abj: 'arr', izq: 'der', der: 'izq' };
const SOLIDOS = 'T~F=lbsPho';

let suelo = null;
let ocupado = null;

function prepararMapa() {
  if (suelo) return;
  suelo = crearSuelo(MAPA);
  ocupado = MAPA.map((fila) => fila.split('').map((c) => SOLIDOS.includes(c)));
  for (const b of EDIFICIOS) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) ocupado[y][x] = true;
}

function siguienteAventura() {
  return AVENTURAS[estado.nivelActual] || null;
}

export class EscenaMundo {
  constructor({ puerta = null } = {}) {
    prepararMapa();
    this.t = 0;
    this.guion = null;
    this.menu = null;
    let inicio = estado.pos || INICIO;
    if (puerta) {
      const b = EDIFICIOS.find((e) => e.id === puerta);
      if (b) inicio = { x: b.puerta, y: b.y + b.h, dir: 'abj' };
    }
    this.jug = this.crearCuerpo(inicio.x, inicio.y, inicio.dir || 'abj');
    const ax = this.libre(inicio.x - 1, inicio.y) ? inicio.x - 1 : this.libre(inicio.x + 1, inicio.y) ? inicio.x + 1 : inicio.x;
    const ay = ax === inicio.x ? inicio.y + 1 : inicio.y;
    this.alex = this.crearCuerpo(ax, ay, 'abj');
    this.npcs = VECINOS.map((v) => ({
      ...v,
      ...this.crearCuerpo(v.x, v.y, v.dir || 'abj'),
      sprite: v.gato ? null : crearPersona(v.persona || vecino(v.vecino || 1)),
    }));
    this.giro = 0;
    this.ultimaDir = null;
  }

  crearCuerpo(x, y, dir) {
    return { tx: x, ty: y, px: x * T, py: y * T, dir, moviendo: false, desde: null, paso: 0 };
  }

  entrar() {
    musica(MUSICA.pueblo);
    this.guardarPos();
    if (!estado.bienvenidaVista) {
      estado.bienvenidaVista = true;
      guardar();
      const sig = siguienteAventura();
      this.guion = new Guion(
        (function* () {
          yield esperar(20);
          yield decir([
            A('¡Bienvenida a Valdemoro, bebe!'),
            A('Si no sabes a dónde ir, busca la señal amarilla con una "!" o mírame y pulsa A para que te dé una pista.'),
            A('Arriba a la izquierda verás siempre nuestro siguiente objetivo.'),
            A('Primera parada: ' + sig.objetivo.toLowerCase() + '. ' + sig.donde),
          ]);
        })(),
      );
    }
  }

  guardarPos() {
    estado.pos = { x: this.jug.tx, y: this.jug.ty, dir: this.jug.dir };
    guardar();
  }

  libre(x, y) {
    if (x < 0 || y < 0 || x >= ANCHO_MAPA || y >= ALTO_MAPA) return false;
    if (ocupado[y][x]) return false;
    return true;
  }

  hayNpc(x, y) {
    return this.npcs.find((n) => n.tx === x && n.ty === y);
  }

  puertaEn(x, y) {
    return EDIFICIOS.find((b) => b.puerta === x && b.y + b.h - 1 === y && b.puerta != null);
  }

  // ---------------------------------------------------------------- actualización

  actualizar() {
    this.t++;
    if (this.menu) {
      if (this.menu.actualizar()) this.menu = null;
      return;
    }
    if (this.guion) {
      if (this.guion.actualizar()) this.guion = null;
      this.moverCuerpo(this.jug);
      this.moverCuerpo(this.alex);
      return;
    }

    const j = this.jug;
    this.moverCuerpo(j);
    this.moverCuerpo(this.alex);
    if (j.moviendo) return;

    if (E.pulsado.menu) {
      sfx.aceptar();
      this.guardarPos();
      this.menu = new MenuPausa(this);
      return;
    }
    if (E.pulsado.a) {
      this.interactuar();
      return;
    }

    let dir = null;
    for (const d of ['arr', 'abj', 'izq', 'der']) if (E.mantenido[d]) dir = dir || d;
    if (!dir) {
      this.giro = 0;
      this.ultimaDir = null;
      return;
    }
    if (dir !== j.dir && this.ultimaDir !== dir) {
      // Primero se gira; si se mantiene, anda.
      j.dir = dir;
      this.giro = 5;
      this.ultimaDir = dir;
      return;
    }
    if (this.giro > 0) {
      this.giro--;
      return;
    }
    this.ultimaDir = dir;
    j.dir = dir;
    const [dx, dy] = DIRS[dir];
    const nx = j.tx + dx;
    const ny = j.ty + dy;
    const puerta = this.puertaEn(nx, ny);
    if (puerta && dir === 'arr') {
      this.entrarEdificio(puerta);
      return;
    }
    const alexAhi = this.alex.tx === nx && this.alex.ty === ny;
    if (this.libre(nx, ny) && !this.hayNpc(nx, ny)) {
      this.alex.dir = this.direccionHacia(this.alex, j.tx, j.ty);
      this.empezarMovimiento(this.alex, j.tx, j.ty);
      this.empezarMovimiento(j, nx, ny);
    } else if (alexAhi) {
      this.empezarMovimiento(this.alex, j.tx, j.ty);
      this.empezarMovimiento(j, nx, ny);
    } else if (this.t % 20 === 0) sfx.choque();
  }

  direccionHacia(c, x, y) {
    if (x > c.tx) return 'der';
    if (x < c.tx) return 'izq';
    if (y > c.ty) return 'abj';
    if (y < c.ty) return 'arr';
    return c.dir;
  }

  empezarMovimiento(c, x, y) {
    if (c.tx === x && c.ty === y) return;
    c.dir = this.direccionHacia(c, x, y);
    c.tx = x;
    c.ty = y;
    c.moviendo = true;
    c.paso = (c.paso + 1) % 2;
  }

  moverCuerpo(c) {
    if (!c.moviendo) return;
    const ox = c.tx * T;
    const oy = c.ty * T;
    c.px += Math.sign(ox - c.px) * Math.min(VEL, Math.abs(ox - c.px));
    c.py += Math.sign(oy - c.py) * Math.min(VEL, Math.abs(oy - c.py));
    if (c.px === ox && c.py === oy) {
      c.moviendo = false;
      if (c === this.jug && this.t % 4 === 0) this.guardarPos();
    }
  }

  interactuar() {
    const j = this.jug;
    const [dx, dy] = DIRS[j.dir];
    const x = j.tx + dx;
    const y = j.ty + dy;
    const c = MAPA[y] && MAPA[y][x];
    if (this.alex.tx === x && this.alex.ty === y) return this.hablarAlex();
    const npc = this.hayNpc(x, y);
    if (npc) return this.hablarNpc(npc);
    const puerta = this.puertaEn(x, y);
    if (puerta && j.dir === 'arr') return this.entrarEdificio(puerta);
    if (c === 's') {
      const txt = CARTELES[x + ',' + y];
      if (txt) return this.decir(txt);
    }
    if (c === 'P') return this.cabinaTelefono();
    if (c === 'o') return this.fuenteDeseos();
    if (c === '~') return this.decir(['El agua está fresquita...', 'Pero para bañarse hay que entrar por la puerta de la piscina.']);
    if (c === 'b') return this.decir(['Un banco. Perfecto para descansar un rato... o para ver pasar a la gente.']);
    if (c === '=') return this.decir(['Las vías del tren. ¡Mejor no acercarse!']);
  }

  decir(mensajes) {
    sfx.aceptar();
    this.guion = new Guion(
      (function* () {
        yield decir(mensajes);
      })(),
    );
  }

  hablarAlex() {
    this.alex.dir = OPUESTA[this.jug.dir];
    const sig = siguienteAventura();
    const msgs = sig
      ? [A('Ahora toca: ' + sig.objetivo.toLowerCase() + '.'), A(sig.donde)]
      : [A('¡Lo has completado todo, bebe!'), A('Gracias por jugar. Te quiero muchísimo. ♥')];
    if (sig && Math.random() < 0.35) msgs.unshift(A(['Te sigo a donde vayas.', 'Qué bien se está contigo.', '¿Te he dicho hoy lo guapa que estás?'][Math.floor(Math.random() * 3)]));
    this.decir(msgs);
  }

  hablarNpc(n) {
    n.dir = OPUESTA[this.jug.dir];
    if (n.gato) sfx.miau();
    const msgs = typeof n.dice === 'function' ? n.dice(estado) : n.dice;
    this.decir(msgs);
  }

  cabinaTelefono() {
    sfx.telefono();
    this.decir([
      'Una cabina telefónica de las de antes.',
      'Te recuerda a cierta canción de Maroon 5 que te encanta... ♪',
      A('¿Que si te llamo desde una cabina? Mejor te la canto en persona. Desafinando, eso sí.'),
    ]);
  }

  fuenteDeseos() {
    const self = this;
    this.guion = new Guion(
      (function* () {
        const r = yield preguntar('La fuente de la plaza. ¿Pedimos un deseo?', ['Sí', 'No']);
        if (r === 0) {
          sfx.campana();
          yield decir(['Cierras los ojos y pides un deseo...', 'Deseo pedido. ♥ (Es secreto.)']);
        }
      })(),
    );
    return self;
  }

  entrarEdificio(b) {
    const info = PUERTAS[b.id];
    if (!info) return;
    if (info.texto) return this.decir(info.texto);
    const sig = siguienteAventura();
    const self = this;
    const aqui = info.niveles.map(aventura);
    const hechas = aqui.filter((a) => estado.medallas.includes(a.id));
    this.guion = new Guion(
      (function* () {
        if (sig && info.niveles.includes(sig.id)) {
          const r = yield preguntar('¿Empezar la aventura "' + sig.nombre + '"?', ['¡Vamos!', 'Ahora no']);
          if (r === 0) {
            sfx.puerta();
            self.guardarPos();
            jugarAventura(sig, false);
          }
          return;
        }
        if (hechas.length) {
          const ops = hechas.map((a) => a.nombre).concat(['Nada']);
          const r = yield preguntar('Aquí ya vivisteis buenos recuerdos. ¿Repetir alguno?', ops);
          if (r >= 0 && r < hechas.length) {
            sfx.puerta();
            self.guardarPos();
            jugarAventura(hechas[r], true);
          }
          return;
        }
        yield decir([A('Aquí vendremos más adelante.'), A(sig ? 'Ahora toca: ' + sig.objetivo.toLowerCase() + '. ' + sig.donde : '¡Ya lo has hecho todo!')]);
      })(),
    );
  }

  // ---------------------------------------------------------------- dibujo

  camara() {
    const j = this.jug;
    const cx = Math.round(j.px + 8 - P.ancho / 2);
    const cy = Math.round(j.py + 8 - P.alto / 2);
    return {
      x: Math.max(0, Math.min(ANCHO_MAPA * T - P.ancho, cx)),
      y: Math.max(0, Math.min(ALTO_MAPA * T - P.alto, cy)),
    };
  }

  spriteDe(c, sprite) {
    const nombre = { arr: 'arriba', abj: 'abajo', izq: 'izq', der: 'der' }[c.dir];
    let f = 0;
    if (c.moviendo) {
      const resto = (Math.abs(c.px - c.tx * T) + Math.abs(c.py - c.ty * T)) / T;
      if (resto > 0.25 && resto < 0.85) f = c.paso ? 1 : 2;
    }
    return sprite[nombre][f];
  }

  dibujar(ctx) {
    const cam = this.camara();
    ctx.drawImage(suelo, cam.x, cam.y, P.ancho, P.alto, 0, 0, P.ancho, P.alto);

    const x0 = Math.floor(cam.x / T);
    const y0 = Math.floor(cam.y / T);
    const x1 = Math.min(ANCHO_MAPA - 1, x0 + Math.ceil(P.ancho / T) + 1);
    const y1 = Math.min(ALTO_MAPA - 1, y0 + Math.ceil(P.alto / T) + 2);
    const objs = [];
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const c = MAPA[ty][tx];
        const x = tx * T - cam.x;
        const y = ty * T - cam.y;
        if (c === '~') dibujarAgua(ctx, x, y, tx, ty, this.t, MAPA[ty - 1][tx] !== '~');
        else if (c === 'T') objs.push({ base: ty * T + T, img: arbol((tx + ty) % 2), x, y: y + T - 26 });
        else if (c === 'l') objs.push({ base: ty * T + T, img: farola(), x, y: y + T - 34 });
        else if (c === 'P') objs.push({ base: ty * T + T, img: cabina(), x, y: y + T - 30 });
        else if (c === 's') objs.push({ base: ty * T + T, img: cartel(), x, y: y + T - 18 });
        else if (c === 'b') objs.push({ base: ty * T + T, img: banco(), x, y });
        else if (c === 'o' && MAPA[ty][tx - 1] !== 'o' && MAPA[ty - 1][tx] !== 'o')
          objs.push({ base: ty * T + 2 * T, img: fuente(Math.floor(this.t / 15) % 2), x, y: y + 2 * T - 34 });
      }
    }
    for (const b of EDIFICIOS) {
      const img = edificio(b);
      const x = b.x * T - cam.x;
      const y = b.y * T - cam.y - 4;
      if (x > P.ancho || x + img.width < 0 || y > P.alto || y + img.height < 0) continue;
      objs.push({ base: (b.y + b.h) * T, img, x, y, edificio: b });
    }
    const personaje = (c, img, extra = 0) => ({ base: c.py + T + 0.5 + extra, img, x: Math.round(c.px - cam.x), y: Math.round(c.py - cam.y) - 7, sombra: true });
    for (const n of this.npcs) {
      if (n.gato) objs.push({ base: n.py + T + 0.5, img: lailaMundo(Math.floor(this.t / 40) % 2), x: n.px - cam.x, y: n.py - cam.y, sombra: 15 });
      else objs.push(personaje(n, this.spriteDe(n, n.sprite)));
    }
    objs.push(personaje(this.alex, this.spriteDe(this.alex, crearPersona('alex')), 0));
    objs.push(personaje(this.jug, this.spriteDe(this.jug, crearPersona('sandra')), 0.1));
    objs.sort((a, b) => a.base - b.base);
    for (const o of objs) {
      if (o.sombra) elipse(ctx, o.x + 8, o.y + (o.sombra === true ? 22 : o.sombra), 6, 2, 'rgba(0,0,0,0.18)');
      ctx.drawImage(o.img, o.x, o.y);
    }

    // Señal "!" sobre el siguiente destino.
    const sig = siguienteAventura();
    if (sig) {
      const b = EDIFICIOS.find((e) => e.id === sig.puerta);
      if (b) dibujarExclamacion(ctx, b.puerta * T + 8 - cam.x, (b.y + b.h - 1) * T - 30 - cam.y, this.t);
    }

    // Objetivo.
    const obj = sig ? sig.objetivo : '¡Todas las aventuras completadas! ♥';
    const texto = '▶ ' + obj;
    const w = Math.min(P.ancho - 70, anchoTexto(texto) + 14);
    caja(ctx, 3, 3, w, 18, { marco: '#f8c040' });
    ctx.save();
    ctx.beginPath();
    ctx.rect(6, 4, w - 8, 16);
    ctx.clip();
    escribir(ctx, texto, 9, 7);
    ctx.restore();

    if (this.guion) this.guion.dibujar(ctx);
    if (this.menu) this.menu.dibujar(ctx);
  }
}
