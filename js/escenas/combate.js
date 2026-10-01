// Combates por turnos al estilo Pokémon, con Laila como "pokémon" de Sandra.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, anchoTexto } from '../motor/fuente.js';
import { caja, Guion, decir, esperar, mientras, Eleccion, COL } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { rect, elipse, circulo, oscurecer } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { jefe as spriteJefe, lailaEspalda, sandraEspalda } from '../arte/bichos.js';
import { corazon } from '../arte/escenario.js';
import { ATAQUES_LAILA, OBJETOS, JEFES } from '../datos/jefes.js';
import { MUSICA } from '../datos/musica.js';

const azar = (a, b) => a + Math.random() * (b - a);

function base(nivel) {
  return 6 + nivel * 0.9;
}

// Menú en rejilla de 2x2 (LUCHAR / MOCHILA... y los ataques).
class MenuRejilla {
  constructor(opciones, { x, y, w, h, cancelable = true, titulo = null }) {
    this.opciones = opciones;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cancelable = cancelable;
    this.titulo = titulo;
    this.sel = 0;
    this.resultado = null;
  }

  celda(i) {
    const cw = (this.w - 12) / 2;
    const ch = (this.h - 8) / 2;
    return { x: this.x + 6 + (i % 2) * cw, y: this.y + 4 + Math.floor(i / 2) * ch, w: cw, h: ch };
  }

  actualizar() {
    if (E.toque) {
      for (let i = 0; i < this.opciones.length; i++) {
        const c = this.celda(i);
        if (E.toque.x >= c.x && E.toque.x < c.x + c.w && E.toque.y >= c.y && E.toque.y < c.y + c.h) {
          sfx.aceptar();
          this.resultado = i;
          return true;
        }
      }
      return false;
    }
    const s = this.sel;
    if (E.pulsado.der && s % 2 === 0 && s + 1 < this.opciones.length) this.sel++;
    if (E.pulsado.izq && s % 2 === 1) this.sel--;
    if (E.pulsado.abj && s + 2 < this.opciones.length) this.sel += 2;
    if (E.pulsado.arr && s >= 2) this.sel -= 2;
    if (this.sel !== s) sfx.cursor();
    if (E.pulsado.a) {
      sfx.aceptar();
      this.resultado = this.sel;
      return true;
    }
    if (E.pulsado.b && this.cancelable) {
      sfx.cancelar();
      this.resultado = -1;
      return true;
    }
    return false;
  }

  dibujar(ctx) {
    if (this.titulo) {
      caja(ctx, 3, P.alto - 46, P.ancho - 6, 44);
      escribir(ctx, this.titulo, 14, P.alto - 32);
    }
    caja(ctx, this.x, this.y, this.w, this.h, { marco: '#e890a8' });
    this.opciones.forEach((o, i) => {
      const c = this.celda(i);
      const ty = c.y + Math.floor(c.h / 2) - 6;
      if (i === this.sel) escribir(ctx, '▶', c.x + 2, ty, '#e04860', COL.sombra);
      escribir(ctx, o, c.x + 12, ty);
    });
  }
}

export class EscenaCombate {
  constructor(jefeId, { alGanar } = {}) {
    this.id = jefeId;
    this.datos = JEFES[jefeId];
    this.alGanar = alGanar;
    this.t = 0;
    this.nivel = estado.lailaNivel;
    this.lailaMax = 20 + this.nivel * 2;
    this.lailaPs = this.lailaMax;
    this.lailaVis = this.lailaPs;
    this.enemigoMax = Math.round(base(this.nivel) * 4.3);
    this.enemigoPs = this.enemigoMax;
    this.enemigoVis = this.enemigoPs;
    this.ataqueMod = 1;
    this.turno = 0;
    this.desobedecio = false;
    // Animaciones.
    this.entrada = 0; // 0..1 deslizamiento inicial
    this.sandraX = 0; // 0 = en su sitio, 1 = fuera
    this.sandraLanza = false;
    this.lailaEscala = 0;
    this.enemigoBaja = 0;
    this.parpadeoEnemigo = 0;
    this.temblorLaila = 0;
    this.efecto = null;
    this.guion = new Guion(this.combate());
  }

  entrar() {
    musica(MUSICA.combate);
    sfx.golpeFuerte();
  }

  // ---------------------------------------------------------------- flujo

  *combate() {
    const d = this.datos;
    yield mientras(() => (this.entrada = Math.min(1, this.entrada + 0.025)) >= 1);
    yield decir(d.entrada);
    this.sandraLanza = true;
    yield decir('¡Adelante, LAILA!');
    sfx.miau();
    yield mientras(() => {
      this.sandraX = Math.min(1, this.sandraX + 0.06);
      this.lailaEscala = Math.min(1, this.lailaEscala + 0.05);
      return this.lailaEscala >= 1;
    });

    while (true) {
      const r = yield new MenuRejilla(['LUCHAR', 'MOCHILA', 'ALEX', 'HUIR'], {
        x: P.ancho - 132, y: P.alto - 46, w: 129, h: 44, cancelable: false, titulo: '¿Qué hará LAILA?',
      });
      let usoTurno = false;
      if (r === 0) {
        const m = yield new MenuRejilla(ATAQUES_LAILA.map((a) => a.nombre), { x: 3, y: P.alto - 46, w: P.ancho - 6, h: 44 });
        if (m < 0) continue;
        yield* this.turnoLaila(ATAQUES_LAILA[m]);
        usoTurno = true;
      } else if (r === 1) {
        const lista = Object.keys(OBJETOS).filter((k) => (estado.objetos[k] || 0) > 0);
        if (!lista.length) {
          yield decir('¡La mochila está vacía!');
          continue;
        }
        const opciones = lista.map((k) => OBJETOS[k].nombre + ' ×' + estado.objetos[k]).concat(['Volver']);
        const o = yield new Eleccion(opciones, { y: 20 });
        if (o < 0 || o >= lista.length) continue;
        if (this.lailaPs >= this.lailaMax) {
          yield decir('LAILA ya está como nueva. ¡Guárdalo para luego!');
          continue;
        }
        const obj = OBJETOS[lista[o]];
        estado.objetos[lista[o]]--;
        guardar();
        yield decir(obj.texto);
        yield* this.curarLaila(obj.cura);
        usoTurno = true;
      } else if (r === 2) {
        yield decir([{ quien: 'Alex', texto: d.pista }]);
        if (this.lailaPs < this.lailaMax) {
          yield decir('Alex le rasca detrás de las orejas a LAILA.');
          yield* this.curarLaila(0.3);
        } else yield decir('LAILA está a tope... ¡pero agradece los mimos!');
        usoTurno = true;
      } else {
        yield decir('¡No se puede huir de un recuerdo!');
      }
      if (!usoTurno) continue;
      this.turno++;
      if (this.enemigoPs <= 0) break;
      yield esperar(10);
      yield* this.turnoEnemigo();
      if (this.lailaPs <= 0) yield* this.rescate();
    }

    // Victoria.
    sfx.rendirse();
    yield mientras(() => (this.enemigoBaja = Math.min(1, this.enemigoBaja + 0.03)) >= 1);
    musica(MUSICA.victoria);
    yield decir(d.derrota);
    const exp = 50 + this.nivel * 12;
    yield decir('¡LAILA ha ganado ' + exp + ' puntos de experiencia!');
    estado.lailaNivel += 5;
    guardar();
    sfx.subirNivel();
    yield decir('¡LAILA ha subido al nivel ' + estado.lailaNivel + '!');
    if (this.alGanar) this.alGanar();
    yield esperar(9999);
  }

  *turnoLaila(ataque) {
    const d = this.datos;
    if (this.turno >= 1 && !this.desobedecio && Math.random() < 0.15) {
      this.desobedecio = true;
      const cosas = ['se pone a lamerse la pata.', 'se queda mirando una mosca.', 'se tumba panza arriba.', 'decide que ahora no le apetece.'];
      yield decir(['LAILA está a su bola...', 'LAILA ' + cosas[Math.floor(Math.random() * cosas.length)], '(Es algo suya, ya lo sabías.)']);
      return;
    }
    yield decir('¡LAILA usó ' + ataque.nombre + '!');
    const eficaz = d.debil === ataque.id;
    yield* this.animarEfecto(ataque.efecto);

    if (ataque.tipo === 'dano' || eficaz) {
      let dano = base(this.nivel) * ataque.poder * azar(0.85, 1);
      if (eficaz) dano *= 1.6;
      dano = Math.max(1, Math.round(dano));
      eficaz ? sfx.golpeFuerte() : sfx.golpe();
      this.enemigoPs = Math.max(0, this.enemigoPs - dano);
      yield mientras(() => {
        this.parpadeoEnemigo = 24;
        return true;
      });
      yield mientras(() => this.parpadeoEnemigo <= 0 && Math.abs(this.enemigoVis - this.enemigoPs) < 0.5);
      if (eficaz) yield decir('¡Es muy eficaz!');
    }
    if (ataque.tipo === 'bajar') {
      if (this.ataqueMod > 0.5) {
        this.ataqueMod *= 0.7;
        sfx.bajar();
        yield decir('¡El ataque de ' + d.nombre + ' ha bajado!');
      } else yield decir('El ataque de ' + d.nombre + ' no puede bajar más.');
    }
    if (ataque.tipo === 'curar') {
      if (this.lailaPs < this.lailaMax) yield* this.curarLaila(0.4);
      else if (!eficaz) yield decir('LAILA ronronea tan a gusto. ¡Qué paz!');
    }
  }

  *curarLaila(fraccion) {
    const antes = this.lailaPs;
    this.lailaPs = Math.min(this.lailaMax, this.lailaPs + Math.round(this.lailaMax * fraccion));
    sfx.curar();
    this.efecto = { tipo: 'corazones', t: 0, dur: 40 };
    yield mientras(() => Math.abs(this.lailaVis - this.lailaPs) < 0.5);
    yield decir('¡LAILA recupera ' + (this.lailaPs - antes) + ' PS!');
  }

  *turnoEnemigo() {
    const d = this.datos;
    let opciones = d.ataques;
    if (this.turno <= 1) opciones = opciones.filter((a) => a.tipo === 'dano');
    if (this.enemigoPs >= this.enemigoMax) opciones = opciones.filter((a) => a.tipo !== 'curar');
    const a = opciones[Math.floor(Math.random() * opciones.length)];
    yield decir('¡' + d.nombre + ' usó ' + a.nombre + '!');
    if (a.tipo === 'dano') {
      this.efecto = { tipo: 'impacto', t: 0, dur: 24 };
      sfx.golpe();
      this.temblorLaila = 24;
      const dano = Math.max(1, Math.round(this.lailaMax * 0.16 * a.poder * this.ataqueMod * azar(0.85, 1.15)));
      this.lailaPs = Math.max(0, this.lailaPs - dano);
      yield mientras(() => this.temblorLaila <= 0 && Math.abs(this.lailaVis - this.lailaPs) < 0.5);
      if (a.texto) yield decir(a.texto);
    } else if (a.tipo === 'curar') {
      if (a.texto) yield decir(a.texto);
      this.enemigoPs = Math.min(this.enemigoMax, this.enemigoPs + Math.round(this.enemigoMax * a.poder));
      sfx.curar();
      yield mientras(() => Math.abs(this.enemigoVis - this.enemigoPs) < 0.5);
    } else if (a.texto) yield decir(a.texto);
  }

  *rescate() {
    yield decir(['¡LAILA está agotada!', 'Alex le da mimos y una chuche extra...']);
    this.lailaPs = this.lailaMax;
    sfx.curar();
    this.efecto = { tipo: 'corazones', t: 0, dur: 40 };
    yield mientras(() => Math.abs(this.lailaVis - this.lailaPs) < 0.5);
    yield decir('¡LAILA recupera todas sus fuerzas! ¡A por ello!');
  }

  *animarEfecto(tipo) {
    if (tipo === 'bufido') sfx.bufido();
    if (tipo === 'corazones') sfx.ronroneo();
    if (tipo === 'bola' || tipo === 'zarpazo') sfx.miau();
    this.efecto = { tipo, t: 0, dur: 36 };
    yield mientras(() => !this.efecto);
  }

  // ---------------------------------------------------------------- actualización

  actualizar() {
    this.t++;
    if (this.parpadeoEnemigo > 0) this.parpadeoEnemigo--;
    if (this.temblorLaila > 0) this.temblorLaila--;
    if (this.efecto && ++this.efecto.t >= this.efecto.dur) this.efecto = null;
    const acercar = (vis, real) => {
      const paso = Math.max(0.25, Math.abs(real - vis) / 20);
      if (Math.abs(real - vis) <= paso) return real;
      return vis + Math.sign(real - vis) * paso;
    };
    this.lailaVis = acercar(this.lailaVis, this.lailaPs);
    this.enemigoVis = acercar(this.enemigoVis, this.enemigoPs);
    this.guion.actualizar();
  }

  // ---------------------------------------------------------------- dibujo

  posiciones() {
    return {
      ex: Math.round(P.ancho * 0.7),
      ey: 96,
      px: Math.round(P.ancho * 0.27),
      py: 138,
    };
  }

  dibujar(ctx) {
    const [cielo, medio, suelo] = this.datos.fondo;
    const g = ctx.createLinearGradient(0, 0, 0, P.alto);
    g.addColorStop(0, cielo);
    g.addColorStop(0.55, medio);
    g.addColorStop(1, suelo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.ancho, P.alto);
    for (let i = 0; i < 6; i++) rect(ctx, 0, 30 + i * 22, P.ancho, 1, 'rgba(255,255,255,0.18)');

    const { ex, ey, px, py } = this.posiciones();
    const desl = (1 - this.entrada) * P.ancho;

    // Plataformas.
    elipse(ctx, ex + desl, ey, 50, 11, oscurecer(suelo, 0.8));
    elipse(ctx, ex + desl, ey - 1, 46, 9, suelo);
    elipse(ctx, px - desl, py, 56, 12, oscurecer(suelo, 0.8));
    elipse(ctx, px - desl, py - 1, 52, 10, suelo);

    // Enemigo.
    if (this.enemigoBaja < 1) {
      const spr = spriteJefe(this.id);
      const visible = this.parpadeoEnemigo === 0 || Math.floor(this.parpadeoEnemigo / 3) % 2 === 0;
      if (visible) {
        const bob = Math.round(Math.sin(this.t / 20) * 1.5);
        const baja = this.enemigoBaja * 50;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, P.ancho, ey + 4);
        ctx.clip();
        ctx.globalAlpha = 1 - this.enemigoBaja;
        const temb = this.parpadeoEnemigo > 0 ? Math.sin(this.parpadeoEnemigo) * 2 : 0;
        ctx.drawImage(spr, Math.round(ex - 32 + desl + temb), ey - 62 + bob + baja);
        ctx.restore();
      }
    }

    // Sandra lanzando y Laila.
    if (this.sandraX < 1) {
      const s = sandraEspalda(this.sandraLanza ? 1 : 0);
      ctx.drawImage(s, Math.round(px - 26 - desl - this.sandraX * 140), py - 58);
    }
    if (this.lailaEscala > 0) {
      const l = lailaEspalda(Math.floor(this.t / 30) % 2);
      const k = this.lailaEscala;
      const temb = this.temblorLaila > 0 ? Math.sin(this.temblorLaila * 1.5) * 3 : 0;
      const w = Math.round(60 * k);
      const visible = this.temblorLaila === 0 || Math.floor(this.temblorLaila / 3) % 2 === 0;
      if (visible) ctx.drawImage(l, Math.round(px - w / 2 + temb), Math.round(py - 4 - w), w, w);
    }

    this.dibujarEfecto(ctx);

    if (this.entrada >= 1) {
      this.dibujarCajaEnemigo(ctx);
      if (this.lailaEscala >= 1) this.dibujarCajaLaila(ctx);
    }

    this.guion.dibujar(ctx);
  }

  barra(ctx, x, y, w, ps, max) {
    rect(ctx, x, y, w + 4, 6, '#404850');
    rect(ctx, x + 1, y + 1, w + 2, 4, '#f8f8f8');
    const f = Math.max(0, ps / max);
    const col = f > 0.5 ? '#40c860' : f > 0.2 ? '#f8c030' : '#f04848';
    rect(ctx, x + 2, y + 2, Math.round(w * f), 2, col);
  }

  dibujarCajaEnemigo(ctx) {
    const x = 6;
    const y = 8;
    caja(ctx, x, y, 124, 32);
    const nombre = this.datos.nombre;
    escribir(ctx, nombre, x + 8, y + 5);
    escribir(ctx, 'PS', x + 8, y + 18, '#e09030');
    this.barra(ctx, x + 22, y + 21, 92, this.enemigoVis, this.enemigoMax);
  }

  dibujarCajaLaila(ctx) {
    const w = 124;
    const x = P.ancho - w - 6;
    const y = 96;
    caja(ctx, x, y, w, 42);
    escribir(ctx, 'LAILA', x + 8, y + 5);
    escribir(ctx, 'Nv' + this.nivel, x + w - 34, y + 5);
    escribir(ctx, 'PS', x + 8, y + 18, '#e09030');
    this.barra(ctx, x + 22, y + 21, 92, this.lailaVis, this.lailaMax);
    const txt = Math.round(this.lailaVis) + '/' + this.lailaMax;
    escribir(ctx, txt, x + w - 10 - anchoTexto(txt), y + 28);
  }

  dibujarEfecto(ctx) {
    const ef = this.efecto;
    if (!ef) return;
    const { ex, ey, px, py } = this.posiciones();
    const k = ef.t / ef.dur;
    if (ef.tipo === 'zarpazo') {
      for (let i = 0; i < 3; i++) {
        const avance = Math.min(1, k * 2 - i * 0.2);
        if (avance <= 0) continue;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const x0 = ex - 20 + i * 10;
        ctx.moveTo(x0, ey - 56);
        ctx.lineTo(x0 + 16 * avance, ey - 56 + 40 * avance);
        ctx.stroke();
      }
    } else if (ef.tipo === 'bola') {
      const bx = px + (ex - px) * Math.min(1, k * 1.5);
      const by = py - 40 + (ey - 30 - (py - 40)) * Math.min(1, k * 1.5) - Math.sin(Math.min(1, k * 1.5) * Math.PI) * 30;
      circulo(ctx, bx, by, 7, '#8c8c94');
      circulo(ctx, bx - 2, by - 2, 3, '#b0b0b8');
    } else if (ef.tipo === 'bufido') {
      for (let i = 0; i < 3; i++) {
        const r = (k * 80 + i * 18) % 80;
        ctx.strokeStyle = 'rgba(255,255,255,' + (1 - r / 80) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py - 34, r, -1.2, 0.4);
        ctx.stroke();
      }
    } else if (ef.tipo === 'corazones') {
      for (let i = 0; i < 5; i++) {
        const hx = px - 30 + i * 15;
        const hy = py - 20 - k * 50 - (i % 2) * 10;
        ctx.globalAlpha = 1 - k;
        ctx.drawImage(corazon(1), Math.round(hx), Math.round(hy));
        ctx.globalAlpha = 1;
      }
    } else if (ef.tipo === 'impacto') {
      const r = 6 + k * 14;
      ctx.fillStyle = '#fff4a0';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        rect(ctx, px + Math.cos(a) * r, py - 34 + Math.sin(a) * r, 3, 3, '#fff4a0');
      }
    }
  }
}
