// La uni: examen tipo test sobre vosotros. Con B, Alex te pasa una chuleta.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado, envolver } from '../motor/fuente.js';
import { caja, COL } from '../motor/ui.js';
import { sfx } from '../motor/audio.js';
import { rect } from '../motor/dibujo.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { PREGUNTAS } from '../datos/examen.js';
import { Minijuego, marcador, dentro } from './minijuego.js';

const CHULETAS = 3;

export class EscenaExamen extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.usaPistas = false;
    this.preguntas = PREGUNTAS.map((q) => {
      const opciones = q.r.map((texto, i) => ({ texto, buena: i === 0, tachada: false }));
      opciones.sort(() => Math.random() - 0.5);
      return { p: q.p, opciones };
    });
    this.i = 0;
    this.sel = 0;
    this.aciertos = 0;
    this.respondida = null;
    this.chuletas = CHULETAS;
  }

  empezar() {
    this.feedback = { texto: 'Si dudas, pulsa B: Alex te pasa una chuleta.', color: '#3060c0' };
  }

  get actual() {
    return this.preguntas[this.i];
  }

  filas() {
    const x = 12;
    const w = P.ancho - 24;
    return this.actual.opciones.map((o, k) => ({ o, x, y: 98 + k * 21, w, h: 19 }));
  }

  jugar() {
    const q = this.actual;
    if (this.respondida !== null) {
      if (E.pulsado.a || E.toque) {
        this.respondida = null;
        this.feedback = null;
        this.i++;
        this.sel = 0;
        if (this.i >= this.preguntas.length) this.terminar();
      }
      return;
    }
    const n = q.opciones.length;
    const mover = (d) => {
      do this.sel = (this.sel + d + n) % n;
      while (q.opciones[this.sel].tachada);
      sfx.cursor();
    };
    if (E.pulsado.arr) mover(-1);
    if (E.pulsado.abj) mover(1);
    if (E.pulsado.b || (E.toque && E.toque.x > P.ancho - 80 && E.toque.y < 24)) this.chuleta();
    let elegida = null;
    if (E.toque) {
      const k = this.filas().findIndex((f) => dentro(E.toque, f.x, f.y, f.w, f.h));
      if (k >= 0 && !q.opciones[k].tachada) elegida = k;
    } else if (E.pulsado.a) elegida = this.sel;
    if (elegida === null) return;
    this.sel = elegida;
    this.respondida = elegida;
    if (q.opciones[elegida].buena) {
      this.aciertos++;
      sfx.vida();
      this.feedback = { texto: '¡Correcto! ♥', color: '#20a040' };
    } else {
      sfx.dano();
      this.feedback = { texto: '¡Casi! Era: ' + q.opciones.find((o) => o.buena).texto, color: '#d03050' };
    }
  }

  chuleta() {
    const q = this.actual;
    if (this.chuletas <= 0) {
      this.feedback = { texto: 'Alex: ¡No me quedan chuletas! Confío en ti.', color: '#3060c0' };
      return;
    }
    const malas = q.opciones.filter((o) => !o.buena && !o.tachada);
    if (malas.length <= 1) return;
    this.chuletas--;
    sfx.aceptar();
    malas.sort(() => Math.random() - 0.5).slice(0, 2).forEach((o) => (o.tachada = true));
    if (q.opciones[this.sel].tachada) this.sel = q.opciones.findIndex((o) => !o.tachada);
    this.feedback = { texto: 'Alex: (Psst... ninguna de las tachadas.)', color: '#3060c0' };
  }

  terminar() {
    const n = this.preguntas.length;
    const nota = Math.round((this.aciertos / n) * 10);
    const comentario = nota >= 9 ? '¡Matrícula de honor!' : nota >= 7 ? '¡Notable! Nos conocemos bien.' : nota >= 5 ? '¡Aprobado!' : 'Aprobado... porque el profe se ha enamorado de ti.';
    this.i = n - 1;
    this.respondida = null;
    this.decir([{ quien: 'Profe', texto: 'Nota: ' + nota + ' sobre 10. ' + comentario }], () => this.ganar('¡Examen entregado!'));
  }

  pintar(ctx) {
    dibujarCielo(ctx, 'uni', P.ancho, P.alto);
    ctx.drawImage(capaFondo('uni', 0), -40, 0);
    rect(ctx, 0, 150, P.ancho, 42, '#a0a4b4');

    const q = this.actual;
    // Hoja del examen.
    caja(ctx, 8, 24, P.ancho - 16, 70, { marco: '#c8d0e0' });
    escribir(ctx, 'Pregunta ' + Math.min(this.i + 1, this.preguntas.length) + ' de ' + this.preguntas.length, 18, 30, '#d03050');
    envolver(q.p, P.ancho - 40).forEach((l, k) => escribir(ctx, l, 18, 46 + k * 13));
    if (this.feedback) escribir(ctx, this.feedback.texto, 18, 76, this.feedback.color);

    this.filas().forEach((f, k) => {
      let marco = k === this.sel && this.respondida === null ? '#e890a8' : '#c0c8d8';
      let fondo = '#f8f8f8';
      if (this.respondida !== null) {
        if (f.o.buena) fondo = '#c8f0c8';
        else if (k === this.respondida) fondo = '#f8c8c8';
      }
      if (f.o.tachada) fondo = '#e0e0e0';
      caja(ctx, f.x, f.y, f.w, f.h, { marco, fondo });
      const letra = 'ABCD'[k] + ') ';
      escribir(ctx, letra + f.o.texto, f.x + 10, f.y + 4, f.o.tachada ? '#a0a0a8' : COL.texto);
      if (f.o.tachada) rect(ctx, f.x + 8, f.y + 9, f.w - 16, 1, '#d03050');
    });

    marcador(ctx, 'Aciertos: ' + this.aciertos);
    escribir(ctx, 'Chuletas: ' + this.chuletas, P.ancho - 76, 8, '#383848', '#ffffff');
    if (this.respondida !== null && Math.floor(this.t / 20) % 2) escribirCentrado(ctx, 'Pulsa A para seguir', P.ancho / 2, 182, '#ffffff', '#383848');
  }
}
