// Láser tag: galería de tiro. Jaime, Rubén y los rivales asoman detrás de las cajas.
// ¡Cuidado con Bea, que va en tu equipo!
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado } from '../motor/fuente.js';
import { sfx } from '../motor/audio.js';
import { rect, lienzo, escalar } from '../motor/dibujo.js';
import { crearPersona, vecino } from '../arte/personas.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { PERSONAJES } from '../datos/config.js';
import { Minijuego, marcador } from './minijuego.js';

const OBJETIVO = 10;
const A = (texto) => ({ quien: 'Alex', texto });

const cache = new Map();
function jugador(quien, equipo, esc) {
  const k = quien + equipo + esc;
  if (cache.has(k)) return cache.get(k);
  const datos = PERSONAJES[quien] || vecino(quien);
  const base = crearPersona(datos).abajo[0];
  const [c, ctx] = lienzo(16, 24);
  ctx.drawImage(base, 0, 0);
  const luz = equipo === 'azul' ? '#40b0ff' : '#ff4060';
  rect(ctx, 4, 14, 8, 4, '#202028');
  rect(ctx, 5, 14, 2, 1, luz);
  rect(ctx, 9, 14, 2, 1, luz);
  rect(ctx, 7, 16, 2, 1, luz);
  const s = esc === 1 ? c : escalar(c, esc);
  cache.set(k, s);
  return s;
}

export class EscenaTiro extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.puntos = 0;
    this.tiempo = 60 * 60;
    this.mira = { x: P.ancho / 2, y: 100 };
    this.activos = [];
    this.rayo = 0;
    this.enfriar = 0;
    this.siguiente = 40;
    this.beaVista = false;
    this.textos = [];
  }

  huecos() {
    const W = P.ancho;
    return [
      { x: W * 0.2, y: 112, esc: 1 },
      { x: W * 0.5, y: 112, esc: 1 },
      { x: W * 0.8, y: 112, esc: 1 },
      { x: W * 0.13, y: 176, esc: 2 },
      { x: W * 0.38, y: 176, esc: 2 },
      { x: W * 0.62, y: 176, esc: 2 },
      { x: W * 0.87, y: 176, esc: 2 },
    ];
  }

  aparecer() {
    const ocupados = new Set(this.activos.map((a) => a.hueco));
    const libres = this.huecos().map((_, i) => i).filter((i) => !ocupados.has(i));
    if (!libres.length) return;
    const hueco = libres[Math.floor(Math.random() * libres.length)];
    const esBea = this.puntos > 1 && Math.random() < 0.2;
    const rivales = ['jaime', 'ruben', 4, 9, 14];
    const quien = esBea ? 'bea' : rivales[Math.floor(Math.random() * rivales.length)];
    const arriba = Math.max(55, 120 - this.puntos * 5);
    this.activos.push({ hueco, quien, equipo: esBea ? 'azul' : 'rojo', t: 0, arriba, subida: 0, tocado: 0 });
    if (esBea && !this.beaVista) {
      this.beaVista = true;
      this.bocadillo = { texto: '¡Cuidado! La del chaleco azul es Bea: va en tu equipo. ¡A ella no!', t: 240 };
    }
  }

  disparar() {
    if (this.enfriar > 0) return;
    this.enfriar = 10;
    this.rayo = 6;
    sfx.laser();
    const huecos = this.huecos();
    // Primero los de delante (más grandes).
    const orden = [...this.activos].sort((a, b) => huecos[b.hueco].esc - huecos[a.hueco].esc);
    for (const a of orden) {
      if (a.tocado || a.subida < 0.6) continue;
      const caja = this.cajaDe(a, huecos[a.hueco]);
      if (this.mira.x >= caja.x && this.mira.x < caja.x + caja.w && this.mira.y >= caja.y && this.mira.y < caja.y + caja.h) {
        a.tocado = 30;
        a.golpeado = true;
        if (a.equipo === 'azul') {
          sfx.dano();
          this.puntos = Math.max(0, this.puntos - 1);
          this.textos.push({ x: this.mira.x, y: this.mira.y, texto: '¡Eh, que soy Bea!', t: 60, color: '#40a0ff' });
        } else {
          sfx.golpe();
          this.puntos++;
          this.textos.push({ x: this.mira.x, y: this.mira.y, texto: '¡Tocado!', t: 40, color: '#ff5070' });
          if (this.puntos >= OBJETIVO) this.ganar('¡Ganaste la partida de láser tag!');
        }
        return;
      }
    }
  }

  cajaDe(a, h) {
    const sw = 16 * h.esc;
    const sh = 24 * h.esc;
    const tapa = h.y - 12 * h.esc;
    const y = tapa - sh * 0.85 * a.subida;
    return { x: h.x - sw / 2, y, w: sw, h: tapa - y };
  }

  jugar() {
    const m = this.mira;
    const vel = 2.6;
    if (E.mantenido.izq) m.x -= vel;
    if (E.mantenido.der) m.x += vel;
    if (E.mantenido.arr) m.y -= vel;
    if (E.mantenido.abj) m.y += vel;
    if (E.toque) {
      m.x = E.toque.x;
      m.y = E.toque.y;
      this.disparar();
    } else if (E.pulsado.a) this.disparar();
    m.x = Math.max(4, Math.min(P.ancho - 4, m.x));
    m.y = Math.max(24, Math.min(P.alto - 6, m.y));
    if (this.enfriar > 0) this.enfriar--;
    if (this.rayo > 0) this.rayo--;

    if (--this.siguiente <= 0 && this.activos.length < 3) {
      this.aparecer();
      this.siguiente = 35 + Math.random() * 40;
    }
    for (const a of this.activos) {
      a.t++;
      if (a.tocado) {
        a.tocado--;
        a.subida = Math.max(0, a.subida - 0.08);
      } else if (a.t < 12) a.subida = a.t / 12;
      else if (a.t > a.arriba) a.subida = Math.max(0, 1 - (a.t - a.arriba) / 12);
    }
    this.activos = this.activos.filter((a) => (a.golpeado ? a.tocado > 0 : a.t <= a.arriba + 12));

    if (--this.tiempo <= 0) {
      this.tiempo = 30 * 60;
      this.decir([A('¡Prórroga! Os doy 30 segundos más. ¡Tú puedes!')]);
    }
  }

  animarFin() {
    for (const a of this.activos) a.subida = Math.max(0, a.subida - 0.05);
  }

  pintar(ctx) {
    dibujarCielo(ctx, 'lasertag', P.ancho, P.alto);
    ctx.drawImage(capaFondo('lasertag', 0), 0, 0);
    ctx.drawImage(capaFondo('lasertag', 1), -60, -36);
    rect(ctx, 0, 120, P.ancho, 72, '#1a1430');
    for (let x = 0; x < P.ancho; x += 24) rect(ctx, x, 120, 1, 72, '#2a2250');
    for (let y = 130; y < P.alto; y += 14) rect(ctx, 0, y, P.ancho, 1, '#2a2250');
    rect(ctx, 0, 118, P.ancho, 2, '#40e0ff');

    const huecos = this.huecos();
    // Primero la fila de atrás, luego la de delante.
    const filas = [huecos.filter((h) => h.esc === 1), huecos.filter((h) => h.esc === 2)];
    for (const fila of filas) {
      for (const h of fila) {
        const i = huecos.indexOf(h);
        const a = this.activos.find((x) => x.hueco === i);
        const tapa = h.y - 12 * h.esc;
        if (a && a.subida > 0) {
          const spr = jugador(a.quien, a.equipo, h.esc);
          const y = tapa - spr.height * 0.85 * a.subida;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, P.ancho, tapa + 2);
          ctx.clip();
          if (!a.tocado || Math.floor(a.tocado / 3) % 2) ctx.drawImage(spr, Math.round(h.x - spr.width / 2), Math.round(y));
          ctx.restore();
        }
        // Caja de cobertura.
        const w = 24 * h.esc;
        rect(ctx, h.x - w / 2 - 1, tapa - 1, w + 2, 12 * h.esc + 2, '#101018');
        rect(ctx, h.x - w / 2, tapa, w, 12 * h.esc, '#3a3050');
        rect(ctx, h.x - w / 2, tapa, w, 2, '#ff40c0');
        rect(ctx, h.x - w / 2 + 3, tapa + 5 * h.esc, w - 6, 1, '#5a4a78');
      }
    }

    // Rayo y pistola.
    const gx = P.ancho / 2;
    const gy = P.alto - 4;
    if (this.rayo > 0) {
      ctx.strokeStyle = '#ff60d0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy - 14);
      ctx.lineTo(this.mira.x, this.mira.y);
      ctx.stroke();
      rect(ctx, this.mira.x - 3, this.mira.y - 3, 6, 6, '#ffd0f0');
    }
    rect(ctx, gx - 7, gy - 18, 14, 22, '#202028');
    rect(ctx, gx - 5, gy - 24, 10, 8, '#303040');
    rect(ctx, gx - 2, gy - 28, 4, 6, '#ff40c0');
    rect(ctx, gx - 10, gy - 6, 20, 6, '#f2cdb0');

    for (const tx of this.textos) {
      tx.t--;
      tx.y -= 0.4;
      escribirCentrado(ctx, tx.texto, tx.x, tx.y - 16, tx.color, '#101018');
    }
    this.textos = this.textos.filter((x) => x.t > 0);

    // Mira.
    if (this.modo === 'jugando') {
      const { x, y } = this.mira;
      const c = '#40ff80';
      rect(ctx, x - 8, y, 5, 1, c);
      rect(ctx, x + 4, y, 5, 1, c);
      rect(ctx, x, y - 8, 1, 5, c);
      rect(ctx, x, y + 4, 1, 5, c);
      rect(ctx, x - 1, y - 1, 3, 3, c);
    }

    marcador(ctx, 'Impactos: ' + this.puntos + '/' + OBJETIVO);
    const s = Math.ceil(this.tiempo / 60);
    const txt = 'Tiempo: ' + s;
    escribir(ctx, txt, P.ancho - 66, 8, '#ffffff', '#101018');
  }
}
