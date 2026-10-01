// Niveles de plataformas al estilo Super Mario.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado, envolver, anchoTexto } from '../motor/fuente.js';
import { caja, Dialogo, Eleccion } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { rect } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { crearPersona } from '../arte/personas.js';
import { enemigo } from '../arte/bichos.js';
import {
  casillaSuelo, casillaBloque, casillaPlataforma, casillaRegalo, trampolin, meta,
  banderaAlex, beso, corazon, polaroid, dibujarLiquido, capaFondo, dibujarCielo, temploDebod,
} from '../arte/escenario.js';
import { MUSICA } from '../datos/musica.js';

const T = 16;
const FILAS = 12;

// Física (por fotograma a 60 fps).
const GRAVEDAD = 0.36;
const GRAVEDAD_SUBIENDO = 0.17; // con el botón de salto apretado
const SALTO = -4.8;
const REBOTE = -4.6;
const MUELLE = -8.2;
const VEL_MAX = 1.55;
const ACEL_SUELO = 0.14;
const ACEL_AIRE = 0.1;
const FRENO = 0.2;
const CAIDA_MAX = 5.5;
const MARGEN_SALTO = 7; // "coyote time"
const RECUERDO_SALTO = 8; // salto pulsado un poco antes de tocar suelo

const solida = (c) => c === '#' || c === 'B' || c === '?' || c === 'U';

export class EscenaPlataformas {
  constructor(aventura, { alGanar, alSalir } = {}) {
    this.av = aventura;
    this.tema = aventura.tema;
    this.alGanar = alGanar;
    this.alSalir = alSalir;
    this.t = 0;
    this.grid = aventura.mapa.map((f) => f.split(''));
    this.ancho = this.grid[0].length;
    this.enemigos = [];
    this.objetos = [];
    this.plataformas = [];
    this.trampolines = [];
    this.banderas = [];
    this.particulas = [];
    this.meta = null;
    this.totalBesos = 0;
    this.besos = 0;
    this.corazones = 3;
    this.pistaActual = 0;
    this.bocadillo = null;
    this.aviso = null;
    this.modo = 'intro';
    this.cam = 0;
    this.pausa = null;
    this.analizar();
    this.jug = { x: this.salida.x, y: this.salida.y, w: 10, h: 20, vx: 0, vy: 0, suelo: false, dir: 1, coyote: 0, buffer: 0, inv: 0, plat: null, anim: 0 };
    this.control = { ...this.salida };
    this.dialogo = new Dialogo(aventura.intro);
    this.cartel = 180;
  }

  analizar() {
    for (let y = 0; y < FILAS; y++) {
      for (let x = 0; x < this.ancho; x++) {
        const c = this.grid[y][x];
        const px = x * T;
        const py = y * T;
        if (c === 'S') this.salida = { x: px + 3, y: py + T - 20 };
        else if ('wfh'.includes(c)) this.crearEnemigo(c, px, py);
        else if (c === 'o') this.objetos.push({ tipo: 'beso', x: px + 2, y: py + 4, w: 12, h: 9 });
        else if (c === 'c') this.objetos.push({ tipo: 'corazon', x: px + 2, y: py + 2, w: 13, h: 12 });
        else if (c === 'R') this.objetos.push({ tipo: 'recuerdo', x: px + 1, y: py, w: 14, h: 16 });
        else if (c === 'C') this.banderas.push({ x: px, y: py, activa: false, i: this.banderas.length });
        else if (c === 'G') this.meta = { x: px, y: py };
        else if (c === 'T') this.trampolines.push({ x: px, y: py, comp: 0 });
        else if (c === '-' || c === '|') {
          const orig = this.av.mapa[y];
          if (x > 0 && orig[x - 1] === c) continue;
          let w = 1;
          while (orig[x + w] === c) w++;
          this.plataformas.push({ tipo: c === '-' ? 'h' : 'v', x0: px, y0: py, x: px, y: py, w: w * T, h: 6, dx: 0, dy: 0, fase: (x * 7) % 100 });
        }
        if (c === '?') this.totalBesos++;
        if (c === 'o') this.totalBesos++;
        if (!solida(c) && c !== '=' && c !== '~') this.grid[y][x] = c === '?' ? '?' : '.';
      }
    }
    // Las plataformas móviles se borran del mapa.
    for (let y = 0; y < FILAS; y++) for (let x = 0; x < this.ancho; x++) if ('-|'.includes(this.grid[y][x])) this.grid[y][x] = '.';
  }

  crearEnemigo(c, x, y) {
    const tipo = this.av.enemigos[c];
    const rapido = tipo === 'patinete';
    this.enemigos.push({
      clase: c, tipo, x: x + 2, y: y + 4, w: 12, h: 12, x0: x + 2, y0: y + 4,
      vx: c === 'w' ? -(rapido ? 0.9 : 0.45) : 0, vy: 0, vivo: true, aplastado: 0, t: (x * 3) % 120, suelo: false,
    });
  }

  celda(tx, ty) {
    if (tx < 0 || tx >= this.ancho) return '#';
    if (ty < 0 || ty >= FILAS) return '.';
    return this.grid[ty][tx];
  }

  // ---------------------------------------------------------------- colisiones

  moverX(c, dx) {
    c.x += dx;
    const arriba = Math.floor(c.y / T);
    const abajo = Math.floor((c.y + c.h - 1) / T);
    if (dx > 0) {
      const tx = Math.floor((c.x + c.w - 1) / T);
      for (let ty = arriba; ty <= abajo; ty++)
        if (solida(this.celda(tx, ty))) {
          c.x = tx * T - c.w;
          return true;
        }
    } else if (dx < 0) {
      const tx = Math.floor(c.x / T);
      for (let ty = arriba; ty <= abajo; ty++)
        if (solida(this.celda(tx, ty))) {
          c.x = (tx + 1) * T;
          return true;
        }
    }
    return false;
  }

  moverY(c, dy) {
    const pieAntes = c.y + c.h;
    c.y += dy;
    c.suelo = false;
    const izq = Math.floor(c.x / T);
    const der = Math.floor((c.x + c.w - 1) / T);
    if (dy > 0) {
      const ty = Math.floor((c.y + c.h) / T);
      for (let tx = izq; tx <= der; tx++) {
        const cel = this.celda(tx, ty);
        if (solida(cel) || (cel === '=' && pieAntes <= ty * T + 0.5)) {
          c.y = ty * T - c.h;
          c.vy = 0;
          c.suelo = true;
          return null;
        }
      }
    } else if (dy < 0) {
      const ty = Math.floor(c.y / T);
      let golpe = null;
      for (let tx = izq; tx <= der; tx++) {
        if (solida(this.celda(tx, ty))) {
          const centro = Math.floor((c.x + c.w / 2) / T);
          if (!golpe || tx === centro) golpe = { tx, ty };
        }
      }
      if (golpe) {
        c.y = (golpe.ty + 1) * T;
        c.vy = 0;
        return golpe;
      }
    }
    return null;
  }

  // ---------------------------------------------------------------- actualización

  actualizar() {
    this.t++;
    if (this.cartel > 0) this.cartel--;
    if (this.bocadillo && --this.bocadillo.t <= 0) this.bocadillo = null;
    if (this.aviso && --this.aviso.t <= 0) this.aviso = null;
    this.actualizarParticulas();

    if (this.dialogo) {
      if (this.dialogo.actualizar()) {
        this.dialogo = null;
        if (this.modo === 'intro') {
          this.modo = 'jugando';
          musica(MUSICA.nivel);
        }
        if (this.alCerrarDialogo) {
          const f = this.alCerrarDialogo;
          this.alCerrarDialogo = null;
          f();
        }
      }
      return;
    }

    if (this.pausa) {
      if (this.pausa.actualizar()) {
        const r = this.pausa.resultado;
        this.pausa = null;
        if (r === 1) {
          if (this.alSalir) this.alSalir();
        }
      }
      return;
    }

    if (this.modo === 'jugando') {
      if (E.pulsado.menu) {
        sfx.aceptar();
        this.pausa = new Eleccion(['Seguir jugando', 'Volver al pueblo'], { x: P.ancho / 2 - 56, y: 70, ancho: 112 });
        return;
      }
      if (E.pulsado.b) this.darPista();
      this.actualizarPlataformas();
      this.actualizarJugadora();
      this.actualizarEnemigos();
      this.actualizarObjetos();
      this.comprobarBanderas();
      this.comprobarMeta();
    } else if (this.modo === 'caida') {
      this.timer--;
      if (this.timer <= 0) this.reaparecer();
    } else if (this.modo === 'meta') {
      this.timer--;
      const j = this.jug;
      j.vy = Math.min(j.vy + GRAVEDAD, CAIDA_MAX);
      this.moverY(j, j.vy);
      if (j.suelo && this.timer % 40 === 0 && this.timer > 60) j.vy = -3.5;
      this.actualizarPlataformas();
      if (this.timer <= 0) this.terminar();
    }
    this.actualizarCamara();
  }

  darPista() {
    const pistas = this.av.pistas;
    this.bocadillo = { texto: pistas[this.pistaActual % pistas.length], t: 300 };
    this.pistaActual++;
    sfx.aceptar();
  }

  actualizarPlataformas() {
    for (const p of this.plataformas) {
      const fase = ((this.t + p.fase * 3) / 200) * Math.PI * 2;
      const nx = p.tipo === 'h' ? p.x0 + Math.sin(fase) * 32 : p.x0;
      const ny = p.tipo === 'v' ? p.y0 + Math.sin(fase) * 32 : p.y0;
      p.dx = nx - p.x;
      p.dy = ny - p.y;
      p.x = nx;
      p.y = ny;
    }
  }

  actualizarJugadora() {
    const j = this.jug;
    const izq = E.mantenido.izq;
    const der = E.mantenido.der;

    // Llevada por una plataforma móvil.
    if (j.plat && j.vy >= 0) {
      const p = j.plat;
      if (j.x + j.w > p.x && j.x < p.x + p.w) {
        this.moverX(j, p.dx);
        j.y = p.y - j.h;
        j.suelo = true;
      } else j.plat = null;
    }

    const acel = j.suelo ? ACEL_SUELO : ACEL_AIRE;
    if (izq && !der) {
      j.vx = Math.max(-VEL_MAX, j.vx - acel);
      j.dir = -1;
    } else if (der && !izq) {
      j.vx = Math.min(VEL_MAX, j.vx + acel);
      j.dir = 1;
    } else {
      const freno = j.suelo ? FRENO : 0.04;
      if (Math.abs(j.vx) <= freno) j.vx = 0;
      else j.vx -= Math.sign(j.vx) * freno;
    }

    if (E.pulsado.a) j.buffer = RECUERDO_SALTO;
    else if (j.buffer > 0) j.buffer--;
    if (j.suelo) j.coyote = MARGEN_SALTO;
    else if (j.coyote > 0) j.coyote--;

    if (j.buffer > 0 && j.coyote > 0) {
      j.vy = SALTO;
      j.buffer = 0;
      j.coyote = 0;
      j.suelo = false;
      j.plat = null;
      sfx.salto();
    }

    const g = j.vy < 0 && E.mantenido.a ? GRAVEDAD_SUBIENDO : GRAVEDAD;
    j.vy = Math.min(j.vy + g, CAIDA_MAX);

    if (this.moverX(j, j.vx)) j.vx = 0;
    const pieAntes = j.y + j.h;
    const golpe = this.moverY(j, j.vy);
    if (golpe) this.golpearBloque(golpe.tx, golpe.ty);

    // Aterrizar en plataformas móviles.
    if (j.vy >= 0) {
      for (const p of this.plataformas) {
        const pie = j.y + j.h;
        if (j.x + j.w > p.x + 1 && j.x < p.x + p.w - 1 && pieAntes <= p.y - p.dy + 2 && pie >= p.y) {
          j.y = p.y - j.h;
          j.vy = 0;
          j.suelo = true;
          j.plat = p;
        }
      }
    }
    if (!j.suelo) j.plat = j.plat && j.vy >= 0 ? j.plat : null;

    // Trampolines.
    for (const tr of this.trampolines) {
      if (tr.comp > 0) tr.comp--;
      const top = tr.y + 6;
      if (j.vy >= 0 && j.x + j.w > tr.x + 1 && j.x < tr.x + T - 1 && pieAntes <= top + 4 && j.y + j.h >= top) {
        j.y = top - j.h;
        j.vy = MUELLE;
        j.suelo = false;
        tr.comp = 12;
        sfx.muelle();
      }
    }

    if (j.inv > 0) j.inv--;
    j.anim += Math.abs(j.vx) * 0.12;

    // ¿Se ha caído?
    if (j.y > FILAS * T + 24) this.caer();
    // ¿Ha tocado líquido?
    const pieY = Math.floor((j.y + j.h - 2) / T);
    const cx = Math.floor((j.x + j.w / 2) / T);
    if (this.celda(cx, pieY) === '~' && j.y + j.h > pieY * T + 6) this.caer();
  }

  golpearBloque(tx, ty) {
    if (this.grid[ty][tx] === '?') {
      this.grid[ty][tx] = 'U';
      this.besos++;
      sfx.bloque();
      sfx.beso();
      this.particulas.push({ tipo: 'beso', x: tx * T + 2, y: ty * T - 10, vy: -2.4, vida: 34 });
    } else sfx.choque();
  }

  hacerDano(desdeX) {
    const j = this.jug;
    if (j.inv > 0) return;
    this.corazones--;
    sfx.dano();
    j.inv = 100;
    j.vy = -3;
    j.vx = (j.x < desdeX ? -1 : 1) * 2;
    if (this.corazones <= 0) {
      this.modo = 'caida';
      this.timer = 70;
      this.mensajeCaida = '¡Ay! Alex te ayuda a levantarte...';
    }
  }

  caer() {
    if (this.modo !== 'jugando') return;
    sfx.caida();
    this.corazones--;
    this.modo = 'caida';
    this.timer = 60;
    this.mensajeCaida = this.corazones <= 0 ? '¡Ay! Alex te ayuda a levantarte...' : '¡Uy! Volvemos a intentarlo.';
  }

  reaparecer() {
    const j = this.jug;
    if (this.corazones <= 0) this.corazones = 3;
    j.x = this.control.x;
    j.y = this.control.y;
    j.vx = 0;
    j.vy = 0;
    j.inv = 90;
    j.plat = null;
    this.modo = 'jugando';
    this.cam = Math.max(0, j.x - P.ancho / 3);
  }

  actualizarEnemigos() {
    const j = this.jug;
    for (const e of this.enemigos) {
      if (!e.vivo) {
        if (e.aplastado > 0) e.aplastado--;
        continue;
      }
      if (Math.abs(e.x - (this.cam + P.ancho / 2)) > P.ancho) continue;
      e.t++;
      if (e.clase === 'f') {
        e.x = e.x0 + Math.sin(e.t / 90) * 22;
        e.y = e.y0 + Math.sin(e.t / 30) * 12;
      } else {
        e.vy = Math.min(e.vy + GRAVEDAD, CAIDA_MAX);
        if (e.clase === 'w') {
          if (this.moverX(e, e.vx)) e.vx = -e.vx;
          else if (e.suelo) {
            // Darse la vuelta en los bordes.
            const delante = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
            const debajo = this.celda(Math.floor(delante / T), Math.floor((e.y + e.h + 2) / T));
            if (!solida(debajo) && debajo !== '=') e.vx = -e.vx;
          }
        }
        this.moverY(e, e.vy);
        if (e.clase === 'h' && e.suelo && e.t % 80 === 0) e.vy = -4.2;
        if (e.y > FILAS * T + 30) e.vivo = false;
      }
      // Contacto con Sandra.
      if (this.modo === 'jugando' && j.x < e.x + e.w && j.x + j.w > e.x && j.y < e.y + e.h && j.y + j.h > e.y) {
        const pieAntes = j.y + j.h - j.vy;
        if (j.vy > 0 && pieAntes <= e.y + 7) {
          e.vivo = false;
          e.aplastado = 30;
          j.vy = E.mantenido.a ? SALTO : REBOTE;
          sfx.pisoton();
          for (let i = 0; i < 6; i++)
            this.particulas.push({ tipo: 'polvo', x: e.x + 6, y: e.y + 8, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2, vida: 20 });
        } else this.hacerDano(e.x + e.w / 2);
      }
    }
  }

  actualizarObjetos() {
    const j = this.jug;
    for (const o of this.objetos) {
      if (o.cogido) continue;
      const oy = o.y + Math.sin(this.t / 15 + o.x) * 1.5;
      if (j.x < o.x + o.w && j.x + j.w > o.x && j.y < oy + o.h && j.y + j.h > oy) {
        o.cogido = true;
        if (o.tipo === 'beso') {
          this.besos++;
          sfx.beso();
          for (let i = 0; i < 4; i++)
            this.particulas.push({ tipo: 'brillo', x: o.x + 6, y: o.y + 4, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, vida: 16 });
        } else if (o.tipo === 'corazon') {
          this.corazones = Math.min(3, this.corazones + 1);
          sfx.vida();
        } else if (o.tipo === 'recuerdo') {
          sfx.recuerdo();
          if (!estado.recuerdos.includes(this.av.id)) estado.recuerdos.push(this.av.id);
          guardar();
          this.aviso = { texto: '¡Recuerdo encontrado! "' + this.av.recuerdo.titulo + '"', t: 200 };
        }
      }
    }
  }

  comprobarBanderas() {
    const j = this.jug;
    for (const b of this.banderas) {
      if (!b.activa && j.x >= b.x - 4) {
        b.activa = true;
        this.control = { x: b.x + 3, y: b.y + T - 20 };
        sfx.campana();
        const pistas = this.av.pistas;
        this.bocadillo = { texto: pistas[(b.i + 1) % pistas.length], t: 280 };
        this.pistaActual = b.i + 2;
      }
    }
  }

  comprobarMeta() {
    const j = this.jug;
    if (this.meta && j.x + j.w > this.meta.x + 4) {
      this.modo = 'meta';
      this.timer = 200;
      j.vx = 0;
      musica(MUSICA.medalla);
      this.aviso = { texto: '¡Lo has conseguido! Besos: ' + this.besos + ' de ' + this.totalBesos, t: 200 };
    }
  }

  terminar() {
    estado.besos += this.besos;
    guardar();
    if (this.alGanar) this.alGanar({ besos: this.besos, total: this.totalBesos });
  }

  actualizarParticulas() {
    for (const p of this.particulas) {
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      if (p.tipo === 'polvo') p.vy += 0.15;
      if (p.tipo === 'beso') p.vy += 0.12;
      p.vida--;
    }
    this.particulas = this.particulas.filter((p) => p.vida > 0);
  }

  actualizarCamara() {
    const j = this.jug;
    const objetivo = j.x + j.w / 2 - P.ancho / 2 + j.dir * 24;
    this.cam += (objetivo - this.cam) * 0.1;
    this.cam = Math.max(0, Math.min(this.ancho * T - P.ancho, this.cam));
  }

  // ---------------------------------------------------------------- dibujo

  dibujar(ctx) {
    const cam = Math.round(this.cam);
    dibujarCielo(ctx, this.tema, P.ancho, P.alto);
    for (const [capa, factor] of [[0, 0.15], [1, 0.4]]) {
      const img = capaFondo(this.tema, capa);
      const desp = -((cam * factor) % img.width);
      for (let x = desp; x < P.ancho; x += img.width) ctx.drawImage(img, Math.floor(x), 0);
    }

    if (this.tema === 'madrid' && this.meta) {
      const d = temploDebod();
      ctx.drawImage(d, this.meta.x - 60 - cam, 160 - d.height);
    }
    if (this.av.amigos && this.meta) {
      // El mirador: barandilla y los amigos esperando para la foto.
      const bx = this.meta.x + 16 - cam;
      for (let x = 0; x < 72; x += 12) rect(ctx, bx + x, 140, 2, 20, '#7a4a30');
      rect(ctx, bx, 140, 74, 2, '#8a5a3a');
      rect(ctx, bx, 150, 74, 2, '#8a5a3a');
      this.av.amigos.forEach((nombre, i) => {
        const p = crearPersona(nombre);
        const salta = this.modo === 'meta' && Math.floor(this.t / 10 + i) % 2 ? 2 : 0;
        ctx.drawImage(p.izq[0], bx + 8 + i * 20, 160 - 23 - salta);
      });
    }

    // Casillas.
    const x0 = Math.max(0, Math.floor(cam / T));
    const x1 = Math.min(this.ancho - 1, Math.ceil((cam + P.ancho) / T));
    for (let ty = 0; ty < FILAS; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const c = this.grid[ty][tx];
        const x = tx * T - cam;
        const y = ty * T;
        if (c === '#') ctx.drawImage(casillaSuelo(this.tema, this.celda(tx, ty - 1) !== '#'), x, y);
        else if (c === 'B') ctx.drawImage(casillaBloque(this.tema), x, y);
        else if (c === '=') ctx.drawImage(casillaPlataforma(this.tema), x, y);
        else if (c === '?') ctx.drawImage(casillaRegalo(false), x, y);
        else if (c === 'U') ctx.drawImage(casillaRegalo(true), x, y);
        else if (c === '~') dibujarLiquido(ctx, this.tema, x, y, this.t, this.celda(tx, ty - 1) !== '~');
      }
    }

    for (const p of this.plataformas) {
      for (let x = 0; x < p.w; x += T) ctx.drawImage(casillaPlataforma(this.tema), Math.round(p.x + x - cam), Math.round(p.y));
    }
    for (const tr of this.trampolines) ctx.drawImage(trampolin(tr.comp > 0), tr.x - cam, tr.y);

    if (this.meta) {
      const m = meta(this.tema);
      ctx.drawImage(m, this.meta.x - cam, this.meta.y + T - m.height);
    }

    const alex = crearPersona('alex');
    for (const b of this.banderas) {
      const bx = b.x - cam;
      if (bx < -32 || bx > P.ancho + 32) continue;
      ctx.drawImage(banderaAlex(b.activa), bx + 10, b.y + T - 30);
      const saluda = b.activa && Math.floor(this.t / 15) % 2;
      const spr = b.activa ? (saluda ? alex.abajo[1] : alex.abajo[0]) : alex.izq[0];
      ctx.drawImage(spr, bx - 4, b.y + T - 23);
    }

    for (const o of this.objetos) {
      if (o.cogido) continue;
      const ox = o.x - cam;
      if (ox < -16 || ox > P.ancho + 16) continue;
      const oy = Math.round(o.y + Math.sin(this.t / 15 + o.x) * 1.5);
      if (o.tipo === 'beso') ctx.drawImage(beso(), ox, oy);
      else if (o.tipo === 'corazon') ctx.drawImage(corazon(1), ox, oy);
      else if (o.tipo === 'recuerdo') {
        ctx.drawImage(polaroid(), ox, oy);
        if (Math.floor(this.t / 8) % 3 === 0) rect(ctx, ox + 12, oy - 2, 2, 2, '#ffffff');
      }
    }

    for (const e of this.enemigos) {
      const ex = Math.round(e.x - 2 - cam);
      if (ex < -20 || ex > P.ancho + 20) continue;
      if (!e.vivo) {
        if (e.aplastado > 0) {
          const spr = enemigo(e.tipo, 0);
          ctx.drawImage(spr, 0, 0, 16, 16, ex, Math.round(e.y + 8), 16, 8);
        }
        continue;
      }
      const f = Math.floor(e.t / 12) % 2;
      let spr = enemigo(e.tipo, f);
      if (e.vx > 0) {
        ctx.save();
        ctx.translate(ex + 16, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(spr, 0, Math.round(e.y - 4));
        ctx.restore();
      } else ctx.drawImage(spr, ex, Math.round(e.y - 4));
    }

    this.dibujarJugadora(ctx, cam);

    for (const p of this.particulas) {
      const px = Math.round(p.x - cam);
      const py = Math.round(p.y);
      if (p.tipo === 'beso') ctx.drawImage(beso(), px, py);
      else if (p.tipo === 'brillo') rect(ctx, px, py, 2, 2, '#fff4a0');
      else rect(ctx, px, py, 2, 2, '#e8e0d0');
    }

    this.dibujarHUD(ctx);
  }

  dibujarJugadora(ctx, cam) {
    const j = this.jug;
    if (j.inv > 0 && Math.floor(j.inv / 4) % 2 === 0 && this.modo === 'jugando') return;
    if (this.modo === 'caida' && this.timer < 40) return;
    const s = crearPersona('sandra');
    let spr;
    if (!j.suelo) spr = j.dir > 0 ? s.saltoDer : s.saltoIzq;
    else if (Math.abs(j.vx) > 0.2) {
      const f = [1, 0, 2, 0][Math.floor(j.anim) % 4];
      spr = (j.dir > 0 ? s.der : s.izq)[f];
    } else spr = (j.dir > 0 ? s.der : s.izq)[0];
    if (this.modo === 'meta' && j.suelo) spr = s.abajo[0];
    ctx.drawImage(spr, Math.round(j.x - 3 - cam), Math.round(j.y - 3));
  }

  dibujarHUD(ctx) {
    for (let i = 0; i < 3; i++) ctx.drawImage(corazon(i < this.corazones ? 1 : 0), 4 + i * 14, 4);
    ctx.drawImage(beso(), 50, 6);
    escribir(ctx, '× ' + this.besos, 64, 4, '#ffffff', '#383848');

    if (this.cartel > 0 && this.modo !== 'intro') {
      const titulo = this.av.nombre;
      const w = anchoTexto(titulo) + 24;
      caja(ctx, P.ancho / 2 - w / 2, 24, w, 20);
      escribirCentrado(ctx, titulo, P.ancho / 2, 29);
    }

    if (this.bocadillo) {
      const x = 24;
      const w = P.ancho - 48;
      const lineas = envolver(this.bocadillo.texto, w - 52);
      const h = lineas.length * 12 + 12;
      caja(ctx, x, 22, w, h, { marco: '#9ad8a8' });
      escribir(ctx, 'ALEX:', x + 8, 27, '#3060c0');
      lineas.forEach((l, i) => escribir(ctx, l, x + 42, 27 + i * 12));
    }

    if (this.aviso) {
      const w = anchoTexto(this.aviso.texto) + 20;
      caja(ctx, P.ancho / 2 - w / 2, P.alto - 30, w, 20, { marco: '#f8c040' });
      escribirCentrado(ctx, this.aviso.texto, P.ancho / 2, P.alto - 25);
    }

    if (this.modo === 'caida') {
      const msg = this.mensajeCaida;
      const w = anchoTexto(msg) + 20;
      caja(ctx, P.ancho / 2 - w / 2, 80, w, 20);
      escribirCentrado(ctx, msg, P.ancho / 2, 85);
      if (this.timer < 20) {
        ctx.globalAlpha = 1 - this.timer / 20;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, P.ancho, P.alto);
        ctx.globalAlpha = 1;
      }
    }

    if (this.pausa) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, P.ancho, P.alto);
      this.pausa.dibujar(ctx);
    }
    if (this.dialogo) this.dialogo.dibujar(ctx);
  }
}
