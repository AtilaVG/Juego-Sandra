// Luna and Wanda: preparar una tarta de queso paso a paso (estilo Cooking Mama).
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado } from '../motor/fuente.js';
import { caja, COL } from '../motor/ui.js';
import { sfx } from '../motor/audio.js';
import { rect, elipse, circulo } from '../motor/dibujo.js';
import { Minijuego, barra, dentro } from './minijuego.js';

const RECETA = [
  { id: 'queso', nombre: 'Queso crema' },
  { id: 'azucar', nombre: 'Azúcar' },
  { id: 'huevos', nombre: 'Huevos' },
  { id: 'nata', nombre: 'Nata' },
];

const PASOS = {
  galletas: 'Machaca las galletas: pulsa A muy rápido (o toca la pantalla).',
  ingredientes: 'Echa los ingredientes en el orden de la receta.',
  mezclar: 'Bate la mezcla: izquierda, derecha, izquierda, derecha...',
  horno: 'Al horno: pulsa A cuando la aguja esté en la zona verde.',
};

function dibujarIngrediente(ctx, id, x, y) {
  if (id === 'queso') {
    rect(ctx, x - 9, y - 6, 18, 12, '#f8f8f0');
    rect(ctx, x - 9, y - 6, 18, 3, '#58a8f0');
    rect(ctx, x - 9, y + 5, 18, 1, '#c8c8c0');
  } else if (id === 'azucar') {
    rect(ctx, x - 7, y - 9, 14, 18, '#f0f0f8');
    rect(ctx, x - 7, y - 2, 14, 5, '#e85a7a');
    rect(ctx, x - 5, y - 11, 10, 3, '#d8d8e0');
  } else if (id === 'huevos') {
    elipse(ctx, x - 5, y + 1, 5, 6.5, '#f0dcc0');
    elipse(ctx, x + 5, y + 1, 5, 6.5, '#e8d0b0');
    rect(ctx, x - 7, y - 3, 2, 2, '#fff8f0');
  } else if (id === 'nata') {
    rect(ctx, x - 6, y - 7, 12, 16, '#f8f8f8');
    rect(ctx, x - 6, y - 10, 12, 3, '#5a8af0');
    rect(ctx, x - 4, y - 1, 8, 4, '#5a8af0');
  }
}

export class EscenaTartas extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.paso = 'galletas';
    this.progreso = 0;
    this.siguienteIngrediente = 0;
    this.orden = [...RECETA].sort(() => Math.random() - 0.5);
    this.sel = 0;
    this.fallos = 0;
    this.ultimoLado = null;
    this.aguja = 0;
    this.intentos = 0;
    this.cayendo = null;
    this.temblor = 0;
    this.giro = 0;
    this.estrellas = 3;
  }

  empezar() {
    this.bocadillo = { texto: PASOS.galletas, t: 260 };
  }

  pasar(paso) {
    this.paso = paso;
    this.progreso = 0;
    sfx.vida();
    if (PASOS[paso]) this.bocadillo = { texto: PASOS[paso], t: 260 };
  }

  get cartas() {
    const n = this.orden.length;
    const w = 46;
    const x0 = P.ancho / 2 - (n * w) / 2;
    return this.orden.map((ing, i) => ({ ing, x: x0 + i * w, y: 138, w: w - 4, h: 40 }));
  }

  jugar() {
    if (this.temblor > 0) this.temblor--;
    this.giro += 0.05;

    if (this.paso === 'galletas') {
      if (E.pulsado.a || E.toque) {
        this.progreso += 0.075;
        sfx.cursor();
      }
      this.progreso = Math.max(0, this.progreso - 0.0012);
      if (this.progreso >= 1) this.pasar('ingredientes');
    } else if (this.paso === 'ingredientes') {
      this.actualizarIngredientes();
    } else if (this.paso === 'mezclar') {
      let lado = null;
      if (E.pulsado.izq || (E.toque && E.toque.x < P.ancho / 2)) lado = 'izq';
      if (E.pulsado.der || (E.toque && E.toque.x >= P.ancho / 2)) lado = 'der';
      if (lado && lado !== this.ultimoLado) {
        this.ultimoLado = lado;
        this.progreso += 0.07;
        this.giro += 0.6;
        sfx.cursor();
      }
      if (this.progreso >= 1) this.pasar('horno');
    } else if (this.paso === 'horno') {
      this.aguja += 0.028;
      if (E.pulsado.a || E.toque) {
        const pos = (Math.sin(this.aguja) + 1) / 2;
        this.intentos++;
        if (Math.abs(pos - 0.5) < 0.13 || this.intentos >= 4) {
          if (this.intentos > 1) this.estrellas--;
          if (this.fallos > 1) this.estrellas--;
          this.estrellas = Math.max(1, this.estrellas);
          sfx.recuerdo();
          this.paso = 'lista';
          this.ganar(['¡Tarta regulera... pero hecha con amor!', '¡Tarta de queso muy rica!', '¡Tarta de queso nivel Luna and Wanda!'][this.estrellas - 1]);
        } else {
          sfx.dano();
          this.temblor = 16;
          this.avisar(pos < 0.5 ? '¡Se queda cruda! Otra vez.' : '¡Se quema! Otra vez.', 90);
        }
      }
    }
  }

  actualizarIngredientes() {
    if (this.cayendo) {
      this.cayendo.t++;
      if (this.cayendo.t > 24) {
        this.cayendo = null;
        if (this.siguienteIngrediente >= RECETA.length) this.pasar('mezclar');
      }
      return;
    }
    const cartas = this.cartas;
    if (E.pulsado.izq) {
      this.sel = (this.sel + cartas.length - 1) % cartas.length;
      sfx.cursor();
    }
    if (E.pulsado.der) {
      this.sel = (this.sel + 1) % cartas.length;
      sfx.cursor();
    }
    let elegida = null;
    if (E.toque) {
      const i = cartas.findIndex((c) => dentro(E.toque, c.x, c.y, c.w, c.h));
      if (i >= 0) {
        this.sel = i;
        elegida = i;
      }
    } else if (E.pulsado.a) elegida = this.sel;
    if (elegida === null) return;
    const carta = cartas[elegida];
    if (carta.ing.id === RECETA[this.siguienteIngrediente].id) {
      sfx.aceptar();
      this.cayendo = { ing: carta.ing, x: carta.x + carta.w / 2, y: carta.y, t: 0 };
      this.orden = this.orden.filter((o) => o !== carta.ing);
      this.sel = 0;
      this.siguienteIngrediente++;
    } else {
      sfx.dano();
      this.fallos++;
      this.temblor = 16;
      this.avisar('¡Ese todavía no! Mira la receta.', 90);
    }
  }

  animarFin() {
    this.giro += 0.02;
  }

  // ---------------------------------------------------------------- dibujo

  pintar(ctx) {
    const W = P.ancho;
    // Pastelería: pared rosa, rótulo y mostrador.
    rect(ctx, 0, 0, W, P.alto, '#fbe0e8');
    for (let x = 0; x < W; x += 16) rect(ctx, x, 0, 8, 96, '#f8d0dc');
    rect(ctx, W / 2 - 64, 4, 128, 16, '#3a2a3a');
    escribirCentrado(ctx, 'LUNA AND WANDA', W / 2, 7, '#f8e0a0', null);
    rect(ctx, 0, 96, W, 96, '#c89060');
    rect(ctx, 0, 96, W, 4, '#e0b080');
    rect(ctx, 0, 100, W, 1, '#8a5a30');

    const temb = this.temblor ? Math.sin(this.temblor * 2) * 2 : 0;
    const bx = W / 2 + temb;
    const by = 92;

    if (this.paso === 'horno' || this.paso === 'lista') this.pintarHorno(ctx, bx, by + 36);
    else this.pintarBol(ctx, bx, by);

    // Receta a la izquierda.
    if (this.paso === 'ingredientes') {
      const ry = 60;
      caja(ctx, 4, ry, 92, 66);
      escribir(ctx, 'RECETA', 12, ry + 5, '#d03050');
      RECETA.forEach((r, i) => {
        const hecho = i < this.siguienteIngrediente;
        escribir(ctx, (i + 1) + '. ' + r.nombre, 12, ry + 19 + i * 12, hecho ? '#90a090' : COL.texto);
        if (hecho) rect(ctx, 12, ry + 24 + i * 12, 76, 1, '#90a090');
      });
      this.cartas.forEach((c, i) => {
        caja(ctx, c.x, c.y, c.w, c.h, { marco: i === this.sel ? '#e890a8' : '#c0c8d8' });
        dibujarIngrediente(ctx, c.ing.id, c.x + c.w / 2, c.y + 16);
        escribirCentrado(ctx, c.ing.nombre.split(' ')[0], c.x + c.w / 2, c.y + 27);
      });
      if (this.cayendo) {
        const k = this.cayendo.t / 24;
        dibujarIngrediente(ctx, this.cayendo.ing.id, this.cayendo.x + (bx - this.cayendo.x) * k, this.cayendo.y + (by - 10 - this.cayendo.y) * k - Math.sin(k * Math.PI) * 30);
      }
    }

    if (this.paso === 'galletas' || this.paso === 'mezclar') {
      barra(ctx, W / 2 - 60, 160, 120, 10, this.progreso, '#e890a8');
      escribirCentrado(ctx, this.paso === 'galletas' ? '¡Machaca!' : '¡Bate! < >', W / 2, 146, '#8a3a5a', '#fff0f4');
    }
  }

  pintarBol(ctx, x, y) {
    elipse(ctx, x, y + 26, 40, 8, '#a87040');
    // Contenido.
    if (this.paso === 'galletas') {
      const trozos = Math.round((1 - this.progreso) * 9);
      for (let i = 0; i < 9; i++) {
        const gx = x - 20 + (i % 5) * 10;
        const gy = y - 2 + Math.floor(i / 5) * 6;
        if (i < trozos) circulo(ctx, gx, gy, 4, '#c88840');
        else rect(ctx, gx - 2, gy + 2, 4, 2, '#b07830');
      }
      elipse(ctx, x, y + 6, 28 * this.progreso + 2, 4, '#b07830');
    } else {
      const lleno = this.paso === 'mezclar' ? 1 : this.siguienteIngrediente / RECETA.length;
      elipse(ctx, x, y + 2, 30, 6 + lleno * 2, lleno > 0 ? '#fff4d8' : '#b07830');
      if (this.paso === 'mezclar') {
        for (let i = 0; i < 3; i++) {
          const a = this.giro + (i * Math.PI * 2) / 3;
          rect(ctx, x + Math.cos(a) * 18, y + 2 + Math.sin(a) * 4, 4, 1, '#e8d8b0');
        }
        rect(ctx, x + Math.cos(this.giro) * 10, y - 26, 3, 28, '#a87848');
      }
    }
    // Bol.
    ctx.fillStyle = '#e8f0f8';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 36, 26, 0, 0, Math.PI);
    ctx.fill();
    rect(ctx, x - 36, y + 2, 72, 3, '#ffffff');
    rect(ctx, x - 20, y + 14, 40, 2, '#c8d8e8');
  }

  pintarHorno(ctx, x, y) {
    rect(ctx, x - 50, y - 70, 100, 92, '#505868');
    rect(ctx, x - 44, y - 58, 88, 60, '#202430');
    const lista = this.paso === 'lista';
    // Tarta dentro del horno.
    elipse(ctx, x, y - 8, 30, 8, lista ? '#c88830' : '#f8e8c0');
    rect(ctx, x - 30, y - 20, 60, 12, lista ? '#f0c060' : '#fff4d8');
    elipse(ctx, x, y - 20, 30, 7, lista ? '#d89838' : '#fff8e0');
    rect(ctx, x - 30, y - 10, 60, 3, '#b07830');
    if (!lista) {
      rect(ctx, x - 44, y - 58, 88, 60, 'rgba(255,140,40,0.18)');
      // Indicador de punto de horneado.
      const bx = x - 50;
      const bw = 100;
      const ty = y - 100;
      rect(ctx, bx, ty, bw, 12, '#404850');
      rect(ctx, bx + 1, ty + 1, bw * 0.37, 10, '#f8e8a0');
      rect(ctx, bx + bw * 0.37, ty + 1, bw * 0.26, 10, '#58c070');
      rect(ctx, bx + bw * 0.63, ty + 1, bw * 0.37 - 1, 10, '#e06040');
      const pos = (Math.sin(this.aguja) + 1) / 2;
      rect(ctx, bx + pos * (bw - 2), ty - 4, 2, 20, '#202020');
      escribirCentrado(ctx, 'cruda      perfecta      quemada', x, ty + 15, '#5a3a3a', null);
    } else {
      for (let i = 0; i < this.estrellas; i++) escribirCentrado(ctx, '♥', x - 20 + i * 20, y - 100, '#e8405e', '#ffffff', 2);
    }
  }
}
