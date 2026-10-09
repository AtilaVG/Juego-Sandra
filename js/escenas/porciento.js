// Comida con Begoña y David (1): el juego de mesa del 1%. Preguntas de lógica cada vez
// más difíciles, del 90% (casi todo el mundo la acierta) al 1%. Con B, Alex sopla una pista.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado, envolver } from '../motor/fuente.js';
import { caja, COL } from '../motor/ui.js';
import { sfx } from '../motor/audio.js';
import { rect } from '../motor/dibujo.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { Minijuego, marcador, dentro } from './minijuego.js';

// La primera respuesta es la buena (se barajan al jugar).
const PREGUNTAS = [
  { pct: 90, p: '¿Qué número sigue? 2, 4, 6, 8...', r: ['10', '9', '12', '16'], pista: 'Van de dos en dos.' },
  { pct: 80, p: 'Si hoy es lunes, ¿qué día será pasado mañana?', r: ['Miércoles', 'Martes', 'Jueves', 'Domingo'], pista: 'Mañana es martes. ¿Y pasado mañana?' },
  { pct: 60, p: '¿Cuánto es 3 + 3 × 3?', r: ['12', '18', '9', '15'], pista: 'Primero se multiplica y luego se suma.' },
  { pct: 40, p: '¿Cuántos meses del año tienen 28 días?', r: ['Todos', 'Uno', 'Dos', 'Ninguno'], pista: 'Ojo: ¿cuántos tienen AL MENOS 28 días?' },
  {
    pct: 25,
    p: 'Una pelota y un bate cuestan 1,10 euros. El bate cuesta 1 euro más que la pelota. ¿Cuánto cuesta la pelota?',
    r: ['5 céntimos', '10 céntimos', '1 euro', '1,05 euros'],
    pista: 'Si la pelota costara 10 céntimos, el bate costaría 1,10... y en total serían 1,20.',
  },
  {
    pct: 10,
    p: 'Si 5 gatos cazan 5 ratones en 5 minutos, ¿cuántos gatos hacen falta para cazar 100 ratones en 100 minutos?',
    r: ['5', '20', '100', '25'],
    pista: 'Cada gato caza un ratón cada 5 minutos. (Laila, ninguno.)',
  },
  {
    pct: 1,
    p: 'Un caracol está al fondo de un pozo de 10 metros. De día sube 3 metros y de noche resbala 2. ¿Cuántos días tarda en salir?',
    r: ['8 días', '10 días', '7 días', '5 días'],
    pista: 'El último día sube 3 metros y sale: ya no le da tiempo a resbalar.',
  },
];

export class EscenaUnoPorCiento extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.usaPistas = false;
    this.preguntas = PREGUNTAS.map((q) => {
      const opciones = q.r.map((texto, i) => ({ texto, buena: i === 0 }));
      opciones.sort(() => Math.random() - 0.5);
      return { ...q, opciones };
    });
    this.i = 0;
    this.sel = 0;
    this.aciertos = 0;
    this.respondida = null;
  }

  empezar() {
    this.feedback = { texto: 'Si te atascas, pulsa B (o toca aquí) y te soplo una pista.', color: '#a8c8ff' };
  }

  get actual() {
    return this.preguntas[this.i];
  }

  filas() {
    return this.actual.opciones.map((o, k) => ({ o, x: 12, y: 107 + k * 19, w: P.ancho - 24, h: 17 }));
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
    if (E.pulsado.arr) {
      this.sel = (this.sel + n - 1) % n;
      sfx.cursor();
    }
    if (E.pulsado.abj) {
      this.sel = (this.sel + 1) % n;
      sfx.cursor();
    }
    if (E.pulsado.b || (E.toque && dentro(E.toque, 8, 24, P.ancho - 16, 80))) {
      sfx.aceptar();
      this.feedback = { texto: 'Alex: ' + q.pista, color: '#a8c8ff' };
      return;
    }
    let elegida = null;
    if (E.toque) {
      const k = this.filas().findIndex((f) => dentro(E.toque, f.x, f.y, f.w, f.h));
      if (k >= 0) elegida = k;
    } else if (E.pulsado.a) elegida = this.sel;
    if (elegida === null) return;
    this.sel = elegida;
    this.respondida = elegida;
    if (q.opciones[elegida].buena) {
      this.aciertos++;
      sfx.vida();
      this.feedback = { texto: q.pct === 1 ? '¡Correcto! ¡Eres del 1%! David no se lo cree.' : '¡Correcto! ♥', color: '#78e090' };
    } else {
      sfx.dano();
      this.feedback = { texto: '¡Casi! Era: ' + q.opciones.find((o) => o.buena).texto, color: '#ff98a8' };
    }
  }

  terminar() {
    const n = this.preguntas.length;
    const fin = this.aciertos === n ? '¡Las has acertado TODAS! Ni Begoña llega a tanto.' : this.aciertos >= 5 ? '¡' + this.aciertos + ' de ' + n + '! Más que Alex, seguro.' : this.aciertos + ' de ' + n + '. Alex ha acertado... dos. Y con chuleta.';
    this.i = n - 1;
    this.respondida = null;
    this.feedback = null;
    this.decir([{ quien: 'Begoña', texto: fin }], () => this.ganar('¡Siguiente juego: Pictionary!'));
  }

  pintar(ctx) {
    dibujarCielo(ctx, 'comedor', P.ancho, P.alto);
    ctx.drawImage(capaFondo('comedor', 0), Math.round(P.ancho / 2 - 196), 0);
    rect(ctx, 0, 100, P.ancho, P.alto - 100, '#c88a58');
    for (let x = 0; x < P.ancho; x += 20) rect(ctx, x, 100, 1, P.alto - 100, '#b07848');

    // La tarjeta del juego, estilo concurso.
    const q = this.actual;
    caja(ctx, 8, 24, P.ancho - 16, 80, { fondo: '#2a2050', marco: '#f8c840', borde: '#141030' });
    escribir(ctx, 'PREGUNTA DEL ' + q.pct + '%', 18, 30, '#f8c840', '#141030');
    escribir(ctx, (this.i + 1) + '/' + this.preguntas.length, P.ancho - 38, 30, '#8878c0', null);
    envolver(q.p, P.ancho - 36).slice(0, 3).forEach((l, k) => escribir(ctx, l, 18, 43 + k * 12, '#ffffff', '#141030'));
    if (this.feedback) envolver(this.feedback.texto, P.ancho - 36).slice(0, 2).forEach((l, k) => escribir(ctx, l, 18, 80 + k * 11, this.feedback.color, '#141030'));

    this.filas().forEach((f, k) => {
      const marco = k === this.sel && this.respondida === null ? '#f8c840' : '#c0c8d8';
      let fondo = '#f8f8f8';
      if (this.respondida !== null) {
        if (f.o.buena) fondo = '#c8f0c8';
        else if (k === this.respondida) fondo = '#f8c8c8';
      }
      caja(ctx, f.x, f.y, f.w, f.h, { marco, fondo });
      escribir(ctx, 'ABCD'[k] + ') ' + f.o.texto, f.x + 10, f.y + 3, COL.texto);
    });

    marcador(ctx, 'Aciertos: ' + this.aciertos);
    if (this.respondida !== null && Math.floor(this.t / 20) % 2) escribirCentrado(ctx, 'Pulsa A para seguir', P.ancho / 2, 182, '#ffffff', '#383848');
  }
}
