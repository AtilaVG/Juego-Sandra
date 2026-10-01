// Noche de maquillaje: Sandra maquilla a Alex pintando con el dedo (o con el teclado).
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado } from '../motor/fuente.js';
import { caja } from '../motor/ui.js';
import { sfx } from '../motor/audio.js';
import { rect, elipse, circulo, poligono, lienzo } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { PERSONAJES } from '../datos/config.js';
import { Minijuego, barra, dentro } from './minijuego.js';

const TAM = 112;
const A = (texto) => ({ quien: 'Alex', texto });

const HERRAMIENTAS = [
  { id: 'colorete', nombre: 'Colorete', color: '#f05a78' },
  { id: 'sombra', nombre: 'Sombra', color: '#e8b440' },
  { id: 'raya', nombre: 'Raya', color: '#1a1a1a' },
  { id: 'labios', nombre: 'Labios', color: '#d82040' },
  { id: 'pecas', nombre: 'Pecas', color: '#8a5030' },
  { id: 'besos', nombre: 'Besos', color: '#e83a5a' },
  { id: 'purpurina', nombre: 'Purpurina', color: '#f8d030' },
  { id: 'borrar', nombre: 'Borrar', color: '#a0a8b8' },
];

// Zonas que hay que maquillar en cada paso (coordenadas dentro de la cara).
const PASOS = [
  { herramienta: 'colorete', texto: 'Paso 1: colorete en las mejillas', zona: [['c', 36, 73, 9], ['c', 76, 73, 9]] },
  { herramienta: 'sombra', texto: 'Paso 2: sombra en los párpados', zona: [['e', 41, 51, 8, 3.5], ['e', 71, 51, 8, 3.5]] },
  { herramienta: 'labios', texto: 'Paso 3: pintalabios', zona: [['e', 56, 83, 9, 3.5]] },
];

function puntosZona(zona) {
  const pts = [];
  for (const z of zona) {
    const [tipo, cx, cy, rx, ry = rx] = z;
    for (let y = cy - ry; y <= cy + ry; y += 2)
      for (let x = cx - rx; x <= cx + rx; x += 2) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1 || (tipo === 'c' && Math.hypot(x - cx, y - cy) <= rx)) pts.push([x, y]);
      }
  }
  return pts;
}

// Cara de Alex con la diadema de orejitas (sin gafas, que se las ha quitado).
function dibujarCara(ctx, parpadeo, sonrisa) {
  const k = PERSONAJES.alex;
  const piel = k.piel;
  const sombraPiel = '#dcae88';
  // Camiseta y cuello.
  poligono(ctx, [10, 112, 22, 98, 90, 98, 102, 112], '#bcd8d0');
  rect(ctx, 46, 88, 20, 14, sombraPiel);
  // Orejas.
  elipse(ctx, 22, 62, 5, 9, piel);
  elipse(ctx, 90, 62, 5, 9, piel);
  elipse(ctx, 23, 62, 2, 5, sombraPiel);
  elipse(ctx, 89, 62, 2, 5, sombraPiel);
  // Cabeza.
  elipse(ctx, 56, 60, 33, 39, piel);
  // Pelo.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, TAM, 44);
  ctx.clip();
  elipse(ctx, 56, 36, 36, 26, k.pelo);
  ctx.restore();
  poligono(ctx, [26, 40, 40, 30, 46, 46, 52, 32, 60, 44, 66, 30, 74, 42, 86, 34, 86, 30, 26, 30], k.pelo);
  // Diadema blanca con orejitas.
  ctx.strokeStyle = '#f8f8f8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(56, 40, 35, 22, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  for (const [x, inc] of [[30, -1], [82, 1]]) {
    poligono(ctx, [x - 10, 26, x + inc * 2, 2, x + 10, 24], '#f8f8f8');
    poligono(ctx, [x - 5, 23, x + inc * 2, 9, x + 5, 22], '#f8b0c0');
  }
  // Cejas.
  rect(ctx, 33, 45, 15, 3, k.pelo);
  rect(ctx, 64, 45, 15, 3, k.pelo);
  // Ojos.
  for (const x of [41, 71]) {
    if (parpadeo) {
      rect(ctx, x - 6, 56, 12, 2, '#3a2a20');
    } else {
      elipse(ctx, x, 56, 7, 4, '#ffffff');
      circulo(ctx, x, 56, 3, '#5a3a22');
      circulo(ctx, x, 56, 1.4, '#101010');
      rect(ctx, x + 1, 54, 1, 1, '#ffffff');
    }
  }
  // Nariz.
  rect(ctx, 55, 60, 2, 10, sombraPiel);
  rect(ctx, 52, 70, 8, 2, sombraPiel);
  // Barbita.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI;
    rect(ctx, Math.round(56 + Math.cos(a) * 20), Math.round(86 + Math.sin(a) * 9), 1, 1, '#b08870');
  }
  // Boca.
  if (sonrisa) {
    ctx.fillStyle = '#c87878';
    ctx.beginPath();
    ctx.ellipse(56, 82, 9, 5, 0, 0, Math.PI);
    ctx.fill();
  } else {
    elipse(ctx, 56, 83, 8, 3, '#d89080');
    rect(ctx, 49, 83, 14, 1, '#b06a60');
  }
}

export class EscenaMaquillaje extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.usaPistas = false;
    const capa = (alfa) => {
      const [c, ctx] = lienzo(TAM, TAM);
      return { lienzo: c, ctx, alfa };
    };
    this.capas = { colorete: capa(0.38), sombra: capa(0.6), labios: capa(0.85), detalles: capa(1) };
    this.yBocadillo = 130;
    this.herramienta = 0;
    this.paso = 0;
    this.cubiertos = PASOS.map(() => new Set());
    this.puntos = PASOS.map((p) => puntosZona(p.zona));
    this.cursor = { x: 56, y: 70 };
    this.anterior = null;
    this.sonrisa = false;
    this.flash = 0;
  }

  empezar() {
    this.herramienta = HERRAMIENTAS.findIndex((h) => h.id === PASOS[0].herramienta);
  }

  // Posiciones en pantalla.
  get cara() {
    return { x: 6, y: 26 };
  }

  botones() {
    const x0 = TAM + 14;
    const w = Math.min(64, (P.ancho - x0 - 6) / 2);
    const lista = HERRAMIENTAS.map((h, i) => ({ h, i, x: x0 + (i % 2) * (w + 2), y: 26 + Math.floor(i / 2) * 22, w, h2: 20 }));
    return lista;
  }

  botonListo() {
    const x0 = TAM + 14;
    return { x: x0, y: 118, w: P.ancho - x0 - 6, h: 22 };
  }

  get terminado() {
    return this.paso >= PASOS.length;
  }

  jugar() {
    // Elegir herramienta tocando la paleta.
    if (E.toque) {
      const b = this.botones().find((b) => dentro(E.toque, b.x, b.y, b.w, b.h2));
      if (b) {
        this.herramienta = b.i;
        sfx.cursor();
        return;
      }
      const l = this.botonListo();
      if (this.terminado && dentro(E.toque, l.x, l.y, l.w, l.h)) return this.acabar();
    }
    // B cambia de pintura; al final de la lista está LISTO (para jugar con teclado).
    if (E.pulsado.b) {
      const total = HERRAMIENTAS.length + (this.terminado ? 1 : 0);
      this.herramienta = (this.herramienta + 1) % total;
      sfx.cursor();
    }
    if (this.eligiendoListo) {
      if (E.pulsado.a) this.acabar();
      return;
    }

    if (this.cambioPendiente != null && !E.puntero.abajo && !E.mantenido.a) {
      this.herramienta = this.cambioPendiente;
      this.cambioPendiente = null;
    }

    // Pintar con el dedo.
    const cara = this.cara;
    if (E.puntero.abajo) {
      const lx = E.puntero.x - cara.x;
      const ly = E.puntero.y - cara.y;
      if (lx >= 0 && ly >= 0 && lx < TAM && ly < TAM) {
        this.trazo(lx, ly);
        this.cursor = { x: lx, y: ly };
      } else this.anterior = null;
    } else {
      // Con teclado: mover el pincel con las flechas y pintar con A.
      const v = 1.5;
      if (E.mantenido.izq) this.cursor.x -= v;
      if (E.mantenido.der) this.cursor.x += v;
      if (E.mantenido.arr) this.cursor.y -= v;
      if (E.mantenido.abj) this.cursor.y += v;
      this.cursor.x = Math.max(0, Math.min(TAM - 1, this.cursor.x));
      this.cursor.y = Math.max(0, Math.min(TAM - 1, this.cursor.y));
      if (E.mantenido.a) this.trazo(this.cursor.x, this.cursor.y, E.pulsado.a);
      else this.anterior = null;
    }
  }

  get eligiendoListo() {
    return this.herramienta >= HERRAMIENTAS.length;
  }

  // Un trazo continuo: rellena entre el punto anterior y el actual.
  trazo(x, y, nuevo = false) {
    const h = HERRAMIENTAS[this.herramienta];
    if (h.id === 'besos') {
      if (!this.anterior || nuevo || Math.hypot(x - this.anterior.x, y - this.anterior.y) > 14) {
        this.dab(h, x, y);
        this.anterior = { x, y };
      }
      return;
    }
    const a = this.anterior || { x, y };
    const d = Math.hypot(x - a.x, y - a.y);
    const n = Math.max(1, Math.ceil(d / 1.5));
    for (let i = 1; i <= n; i++) this.dab(h, a.x + ((x - a.x) * i) / n, a.y + ((y - a.y) * i) / n);
    this.anterior = { x, y };
  }

  dab(h, x, y) {
    let r = 4;
    const circ = (capa, radio, color) => {
      const c = this.capas[capa].ctx;
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, radio, 0, Math.PI * 2);
      c.fill();
    };
    const d = this.capas.detalles.ctx;
    if (h.id === 'colorete') {
      r = 7;
      const c = this.capas.colorete.ctx;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(240, 90, 120, 0.5)');
      g.addColorStop(1, 'rgba(240, 90, 120, 0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    } else if (h.id === 'sombra') {
      r = 4;
      circ('sombra', r, '#e8b440');
    } else if (h.id === 'labios') {
      r = 2.5;
      circ('labios', r, '#d82040');
    } else if (h.id === 'raya') {
      r = 1;
      d.fillStyle = '#1a1a1a';
      d.fillRect(Math.round(x), Math.round(y), 1, 1);
    } else if (h.id === 'pecas') {
      r = 5;
      if (Math.random() < 0.18) {
        d.fillStyle = '#8a5030';
        d.fillRect(Math.round(x + (Math.random() - 0.5) * 8), Math.round(y + (Math.random() - 0.5) * 8), 1, 1);
      }
    } else if (h.id === 'besos') {
      sfx.beso();
      d.fillStyle = '#e83a5a';
      d.beginPath();
      d.ellipse(x - 2.5, y - 1, 3, 2, -0.3, 0, Math.PI * 2);
      d.ellipse(x + 2.5, y - 1, 3, 2, 0.3, 0, Math.PI * 2);
      d.ellipse(x, y + 1.5, 4.5, 2, 0, 0, Math.PI * 2);
      d.fill();
      d.fillStyle = '#961432';
      d.fillRect(Math.round(x - 4), Math.round(y), 8, 1);
    } else if (h.id === 'purpurina') {
      r = 6;
      for (let i = 0; i < 2; i++) {
        d.fillStyle = Math.random() < 0.5 ? '#f8e070' : '#ffffff';
        d.fillRect(Math.round(x + (Math.random() - 0.5) * 12), Math.round(y + (Math.random() - 0.5) * 12), 1, 1);
      }
    } else if (h.id === 'borrar') {
      r = 6;
      for (const capa of Object.values(this.capas)) {
        capa.ctx.save();
        capa.ctx.globalCompositeOperation = 'destination-out';
        capa.ctx.beginPath();
        capa.ctx.arc(x, y, r, 0, Math.PI * 2);
        capa.ctx.fill();
        capa.ctx.restore();
      }
    }
    this.comprobarPaso(h, x, y, r);
  }

  // Pinta las capas de maquillaje encima de la cara, cada una con su transparencia.
  componer(ctx) {
    for (const capa of Object.values(this.capas)) {
      ctx.globalAlpha = capa.alfa;
      ctx.drawImage(capa.lienzo, 0, 0);
    }
    ctx.globalAlpha = 1;
  }

  comprobarPaso(h, x, y, r) {
    if (this.terminado) return;
    const paso = PASOS[this.paso];
    if (h.id !== paso.herramienta) return;
    const pts = this.puntos[this.paso];
    const cub = this.cubiertos[this.paso];
    pts.forEach(([px, py], i) => {
      if (Math.hypot(px - x, py - y) <= r + 1) cub.add(i);
    });
    if (cub.size / pts.length >= 0.6) {
      this.paso++;
      sfx.vida();
      if (this.terminado) {
        this.bocadillo = { texto: '¡Perfecto! Ahora ponme lo que quieras: raya, pecas, besos, purpurina... Y cuando acabes, LISTO.', t: 320 };
      } else {
        // Se cambia de pintura cuando levante el dedo, no a mitad de trazo.
        const sig = PASOS[this.paso];
        this.cambioPendiente = HERRAMIENTAS.findIndex((t) => t.id === sig.herramienta);
        this.bocadillo = { texto: ['¡Qué bien! Ahora la sombra dorada en los párpados.', '¡Me encanta! Y ahora... el pintalabios.'][this.paso - 1], t: 220 };
      }
    }
  }

  acabar() {
    sfx.recuerdo();
    this.flash = 20;
    this.sonrisa = true;
    // Foto para el álbum.
    try {
      const [f, fc] = lienzo(TAM / 2, TAM / 2);
      fc.fillStyle = '#f8e8f0';
      fc.fillRect(0, 0, TAM / 2, TAM / 2);
      const [g, gc] = lienzo(TAM, TAM);
      dibujarCara(gc, false, true);
      this.componer(gc);
      fc.drawImage(g, 0, 0, TAM / 2, TAM / 2);
      estado.fotos = estado.fotos || {};
      estado.fotos[this.av.id] = f.toDataURL('image/png');
      guardar();
    } catch {
      /* sin foto, no pasa nada */
    }
    this.decir(
      [A('A ver, a ver... ¿cómo he quedado?'), A('¡Pero qué guapo! Así voy a salir a la calle mañana.'), A('Y ahora... ¡foto con morritos!')],
      () => this.ganar('¡Alex está guapísimo!'),
    );
  }

  // ---------------------------------------------------------------- dibujo

  pintar(ctx) {
    // Habitación: pared cálida y luz de la mesilla.
    rect(ctx, 0, 0, P.ancho, P.alto, '#e8d4c4');
    for (let y = 0; y < P.alto; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < P.ancho; x += 12) rect(ctx, x, y, 2, 2, '#dcc4b0');
    rect(ctx, 0, 150, P.ancho, 42, '#b08a68');
    circulo(ctx, P.ancho - 20, 150, 26, 'rgba(255, 210, 140, 0.25)');

    const cara = this.cara;
    caja(ctx, cara.x - 2, cara.y - 2, TAM + 4, TAM + 4, { fondo: '#f6e8ee', marco: '#e8a0b8' });
    const [g, gc] = this.lienzoCara || (this.lienzoCara = lienzo(TAM, TAM));
    gc.clearRect(0, 0, TAM, TAM);
    dibujarCara(gc, this.t % 200 < 7, this.sonrisa);
    this.componer(gc);
    ctx.drawImage(g, cara.x, cara.y);

    // Zona a maquillar parpadeando.
    if (!this.terminado && this.modo === 'jugando' && Math.floor(this.t / 25) % 2) {
      for (const z of PASOS[this.paso].zona) {
        const [, cx, cy, rx, ry = rx] = z;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cara.x + cx, cara.y + cy, rx + 1, ry + 1, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Pincel.
    if (this.modo === 'jugando' && !this.eligiendoListo) {
      const h = HERRAMIENTAS[this.herramienta];
      const x = Math.round(cara.x + this.cursor.x);
      const y = Math.round(cara.y + this.cursor.y);
      rect(ctx, x - 4, y, 3, 1, '#ffffff');
      rect(ctx, x + 2, y, 3, 1, '#ffffff');
      rect(ctx, x, y - 4, 1, 3, '#ffffff');
      rect(ctx, x, y + 2, 1, 3, '#ffffff');
      rect(ctx, x, y, 1, 1, h.color);
    }

    // Paleta.
    this.botones().forEach((b) => {
      const sel = b.i === this.herramienta;
      caja(ctx, b.x, b.y, b.w, b.h2, { marco: sel ? '#e04878' : '#c8c0d0', fondo: sel ? '#fff0f4' : '#f8f8f8' });
      rect(ctx, b.x + 5, b.y + 6, 7, 7, b.h.color);
      escribir(ctx, b.h.nombre, b.x + 15, b.y + 5);
    });
    const l = this.botonListo();
    if (this.terminado) {
      const brilla = this.eligiendoListo || Math.floor(this.t / 20) % 2;
      caja(ctx, l.x, l.y, l.w, l.h, { marco: brilla ? '#40c060' : '#80e0a0', fondo: this.eligiendoListo ? '#c8f8d8' : '#f0fff4' });
      escribirCentrado(ctx, '¡LISTO!', l.x + l.w / 2, l.y + 6, '#208040');
    }

    // Paso actual.
    const ty = 142;
    if (!this.terminado) {
      const paso = PASOS[this.paso];
      escribir(ctx, paso.texto, 8, ty + 2, '#8a2a4a', '#fff4f8');
      const pts = this.puntos[this.paso].length;
      barra(ctx, 8, ty + 16, TAM, 8, this.cubiertos[this.paso].size / pts / 0.6, '#f07898');
    } else if (this.modo === 'jugando') {
      escribir(ctx, 'Toque final libre. Pulsa LISTO.', 8, ty + 2, '#208040', '#f0fff4');
    }
    escribir(ctx, 'B: cambiar pintura', 8, ty + 28, '#7a6a70', null);

    if (this.flash > 0) {
      this.flash--;
      ctx.globalAlpha = this.flash / 20;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, P.ancho, P.alto);
      ctx.globalAlpha = 1;
    }
  }
}

export { dibujarCara };
