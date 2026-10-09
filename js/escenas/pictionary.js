// Juegos de mesa con Begoña y David (2): Pictionary. Alex dibuja (fatal) y hay que adivinar qué es
// cuanto antes. Begoña y David también intentan adivinarlo... sin mucho éxito.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, anchoTexto, envolver } from '../motor/fuente.js';
import { caja, COL } from '../motor/ui.js';
import { sfx } from '../motor/audio.js';
import { rect, hash } from '../motor/dibujo.js';
import { crearPersona } from '../arte/personas.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { Minijuego, marcador, dentro } from './minijuego.js';

// ---------------------------------------------------------------- dibujos
// Coordenadas de 0 a 100 dentro del papel. Cada trazo: { p: [[x, y], ...], c: color }.
const NEGRO = '#2a2a38';
function redondel(cx, cy, rx, ry = rx, n = 14) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return p;
}
const t = (p, c = NEGRO) => ({ p, c });
// Temblor del pulso de Alex: entre -0,5 y 0,5, siempre igual para cada punto.
const pulso = (a, b) => (hash(a, b) % 1000) / 1000 - 0.5;

const DIBUJOS = [
  {
    buena: 'Laila',
    malas: ['Un cerdo', 'Un búho', 'Una patata'],
    acierto: '¡Sí! ¡Es Laila! Por las manchas, ¿no?',
    trazos: [
      t(redondel(50, 36, 17)),
      t([[37, 26], [35, 10], [46, 21]]),
      t([[54, 21], [65, 10], [63, 26]]),
      t(redondel(44, 34, 2.5, 2.5, 6), '#58a040'),
      t(redondel(56, 34, 2.5, 2.5, 6), '#58a040'),
      t([[47, 41], [50, 44], [53, 41]], '#e07080'),
      t([[28, 40], [42, 42]]),
      t([[28, 47], [42, 45]]),
      t([[58, 42], [72, 40]]),
      t([[58, 45], [72, 47]]),
      t(redondel(50, 72, 24, 17)),
      t([[73, 76], [86, 70], [90, 58], [85, 50]]),
      t(redondel(40, 68, 5, 4, 8), '#e08030'),
      t(redondel(61, 77, 6, 4, 8), '#5a4636'),
      t(redondel(58, 62, 4, 3, 8), '#e08030'),
      t([[40, 87], [40, 94]]),
      t([[58, 87], [58, 94]]),
    ],
  },
  {
    buena: 'Tarta de queso',
    malas: ['Un sombrero', 'Una cuña de queso', 'Un barco'],
    acierto: '¡Tarta de queso! Como las de Luna and Wanda.',
    trazos: [
      t([[16, 60], [52, 40], [84, 58], [16, 60]]),
      t([[16, 60], [16, 78], [84, 76], [84, 58]]),
      t([[16, 78], [16, 85], [84, 83], [84, 76]], '#c08040'),
      t(redondel(42, 52, 3, 3, 6), '#d03040'),
      t(redondel(55, 49, 3, 3, 6), '#d03040'),
      t(redondel(66, 54, 3, 3, 6), '#d03040'),
      t([[36, 66], [36, 69]]),
      t([[60, 66], [60, 69]]),
      t([[39, 72], [48, 75], [58, 72]]),
      t(redondel(50, 90, 44, 5, 16), '#7090c0'),
    ],
  },
  {
    buena: 'Pizza del Vesubio',
    malas: ['Un reloj', 'Una diana', 'Una galleta'],
    acierto: '¡La pizza del Vesubio! Qué hambre.',
    trazos: [
      t(redondel(50, 50, 38, 38, 18), '#c08040'),
      t([[50, 13], [50, 87]]),
      t([[13, 50], [87, 50]]),
      t([[24, 24], [76, 76]]),
      t([[76, 24], [24, 76]]),
      t(redondel(37, 36, 4, 4, 7), '#d03040'),
      t(redondel(64, 38, 4, 4, 7), '#d03040'),
      t(redondel(38, 64, 4, 4, 7), '#d03040'),
      t(redondel(65, 63, 4, 4, 7), '#d03040'),
      t(redondel(52, 30, 3, 3, 6), '#d03040'),
      t([[30, 50], [34, 46]], '#40a040'),
      t([[60, 52], [64, 48]], '#40a040'),
    ],
  },
  {
    buena: 'Templo de Debod',
    malas: ['Un Mercadona', 'Una tostadora', 'Un castillo'],
    acierto: '¡El Templo de Debod! Nuestro atardecer.',
    trazos: [
      t(redondel(84, 16, 8, 8, 10), '#f0a020'),
      t([[84, 3], [84, 0]], '#f0a020'),
      t([[70, 16], [66, 16]], '#f0a020'),
      t([[74, 6], [71, 3]], '#f0a020'),
      t([[30, 82], [30, 44], [70, 44], [70, 82], [30, 82]]),
      t([[25, 44], [75, 44], [72, 37], [28, 37], [25, 44]]),
      t([[45, 82], [45, 62], [55, 62], [55, 82]]),
      t([[5, 82], [5, 52], [17, 52], [17, 82]]),
      t([[5, 58], [17, 58]]),
      t([[83, 82], [83, 52], [95, 52], [95, 82]]),
      t([[83, 58], [95, 58]]),
      t([[2, 90], [12, 87], [22, 90], [32, 87], [42, 90], [52, 87], [62, 90], [72, 87], [82, 90], [92, 87], [98, 90]], '#4a8ad8'),
    ],
  },
  {
    buena: 'Sandra',
    malas: ['Un espantapájaros', 'Un cactus', 'Una farola'],
    acierto: '¡Eres tú! En persona eres más guapa.',
    trazos: [
      t(redondel(50, 30, 11)),
      t(redondel(50, 13, 6, 5, 10), '#5a3a22'),
      t(redondel(45, 30, 3.5, 3.5, 8), '#23615f'),
      t(redondel(55, 30, 3.5, 3.5, 8), '#23615f'),
      t([[48.5, 30], [51.5, 30]], '#23615f'),
      t([[45, 36], [50, 38], [55, 36]], '#e07080'),
      t([[50, 41], [50, 68]]),
      t([[50, 48], [34, 60]]),
      t([[50, 48], [66, 58]]),
      t([[50, 68], [40, 92]]),
      t([[50, 68], [60, 92]]),
      t([[80, 36], [73, 28], [73, 22], [77, 20], [80, 24], [83, 20], [87, 22], [87, 28], [80, 36]], '#e04060'),
    ],
  },
];

const FALLOS = ['¿¡Cómo que eso!?', '¡Pero si está clarísimo!', 'Vale... igual no está tan claro.', '¡Ya sé que dibujo fatal!'];
const DURACION = 330; // frames que tarda Alex en terminar cada dibujo

export class EscenaPictionary extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.ronda = 0;
    this.aLaPrimera = 0;
    this.sel = 0;
  }

  empezar() {
    this.nuevaRonda();
  }

  // El papel donde dibuja Alex.
  papel() {
    return { x: 6, y: 26, w: P.ancho - 96, h: 112 };
  }

  nuevaRonda() {
    const d = DIBUJOS[this.ronda];
    this.dibujo = d;
    this.opciones = [d.buena, ...d.malas].map((texto) => ({ texto, buena: texto === d.buena, tachada: false }));
    this.opciones.sort(() => Math.random() - 0.5);
    this.estado = 'dibujando';
    this.tEstado = 0;
    this.fallos = 0;
    this.sel = 0;
    this.dice = null;
    this.prepararTrazos(d);
  }

  // Pasa los trazos a píxeles con un temblor de pulso (Alex dibuja fatal) y mide su largo.
  prepararTrazos(d) {
    const pp = this.papel();
    const s = Math.min(pp.w - 16, pp.h - 16) / 100;
    const ox = pp.x + (pp.w - 100 * s) / 2;
    const oy = pp.y + (pp.h - 100 * s) / 2;
    this.total = 0;
    this.trazos = d.trazos.map((tr, i) => {
      const pts = tr.p.map(([x, y], k) => [ox + x * s + pulso(i * 31 + k, this.ronda) * 3, oy + y * s + pulso(k * 17 + i, this.ronda + 7) * 3]);
      let largo = 0;
      const tramos = [];
      for (let k = 1; k < pts.length; k++) {
        const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
        tramos.push(l);
        largo += l;
      }
      this.total += largo;
      return { pts, tramos, largo, c: tr.c };
    });
  }

  decirAlgo(quien, texto, t = 110) {
    this.dice = { quien, texto, t };
  }

  get progreso() {
    return this.estado === 'dibujando' ? Math.min(1, this.tEstado / DURACION) : 1;
  }

  jugar() {
    this.tEstado++;
    if (this.dice && --this.dice.t <= 0) this.dice = null;

    if (this.estado === 'dibujando') {
      if (this.tEstado % 9 === 0 && this.progreso < 1) sfx.texto();
      // Begoña y David también intentan adivinarlo.
      if (this.tEstado === Math.round(DURACION * 0.35) || this.tEstado === Math.round(DURACION * 0.7)) {
        const malas = this.opciones.filter((o) => !o.buena && !o.tachada);
        if (malas.length) {
          const quien = this.tEstado < DURACION / 2 ? 'David' : 'Begoña';
          this.decirAlgo(quien, '¿' + malas[Math.floor(Math.random() * malas.length)].texto + '?', 90);
        }
      }
      // Elegir respuesta: cruceta en una rejilla de 2x2, o tocar.
      if (E.pulsado.izq || E.pulsado.der) {
        this.sel ^= 1;
        sfx.cursor();
      }
      if (E.pulsado.arr || E.pulsado.abj) {
        this.sel ^= 2;
        sfx.cursor();
      }
      let k = null;
      if (E.toque) k = this.botones().findIndex((b) => dentro(E.toque, b.x, b.y, b.w, b.h));
      else if (E.pulsado.a) k = this.sel;
      if (k !== null && k >= 0 && !this.opciones[k].tachada) this.elegir(k);
    } else if (this.estado === 'acierto') {
      if (this.tEstado > 130 || (this.tEstado > 40 && (E.pulsado.a || E.toque))) {
        this.ronda++;
        if (this.ronda >= DIBUJOS.length) this.terminar();
        else this.nuevaRonda();
      }
    }
  }

  elegir(k) {
    this.sel = k;
    const o = this.opciones[k];
    if (o.buena) {
      if (this.fallos === 0) this.aLaPrimera++;
      this.estado = 'acierto';
      this.tEstado = 0;
      sfx.vida();
      this.decirAlgo('Alex', this.dibujo.acierto, 999);
    } else {
      o.tachada = true;
      this.fallos++;
      sfx.dano();
      this.decirAlgo('Alex', FALLOS[Math.floor(Math.random() * FALLOS.length)]);
    }
  }

  terminar() {
    this.estado = 'fin';
    this.dice = null;
    const n = DIBUJOS.length;
    this.decir(
      [
        { quien: 'David', texto: 'Alex, de verdad: dedícate a otra cosa.' },
        { quien: 'Begoña', texto: this.aLaPrimera >= 4 ? '¡Sandra lo ha adivinado casi todo a la primera! Eso es amor.' : 'Menos mal que Sandra lo adivina todo. (' + this.aLaPrimera + ' de ' + n + ' a la primera.)' },
      ],
      () => this.ganar('¡Fin del Pictionary! Alex sigue dibujando fatal.'),
    );
  }

  botones() {
    const w = Math.floor(P.ancho / 2) - 8;
    return this.opciones.map((o, k) => ({ o, x: k % 2 ? P.ancho / 2 + 2 : 6, y: 145 + Math.floor(k / 2) * 23, w, h: 21 }));
  }

  // Dibuja lo que lleve Alex dibujado y devuelve dónde está el rotulador.
  pintarDibujo(ctx) {
    let queda = this.progreso * this.total;
    let punta = null;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    for (const tr of this.trazos) {
      if (queda <= 0) break;
      ctx.strokeStyle = tr.c;
      ctx.beginPath();
      ctx.moveTo(tr.pts[0][0], tr.pts[0][1]);
      for (let k = 1; k < tr.pts.length; k++) {
        const l = tr.tramos[k - 1];
        const [x0, y0] = tr.pts[k - 1];
        const [x1, y1] = tr.pts[k];
        if (queda >= l) {
          ctx.lineTo(x1, y1);
          queda -= l;
          punta = [x1, y1];
        } else {
          const f = queda / l;
          punta = [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
          ctx.lineTo(punta[0], punta[1]);
          queda = 0;
          break;
        }
      }
      ctx.stroke();
    }
    return punta;
  }

  pintar(ctx) {
    dibujarCielo(ctx, 'comedor', P.ancho, P.alto);
    ctx.drawImage(capaFondo('comedor', 0), Math.round(P.ancho / 2 - 196), 0);
    rect(ctx, 0, 140, P.ancho, P.alto - 140, '#c88a58');

    // Papel y dibujo.
    const pp = this.papel();
    rect(ctx, pp.x + 2, pp.y + 2, pp.w, pp.h, 'rgba(0,0,0,0.2)');
    rect(ctx, pp.x, pp.y, pp.w, pp.h, '#fdfdf6');
    for (let y = pp.y + 10; y < pp.y + pp.h; y += 10) rect(ctx, pp.x + 2, y, pp.w - 4, 1, '#e4ecf4');
    const punta = this.dibujo ? this.pintarDibujo(ctx) : null;

    // Alex con el rotulador, y Begoña y David mirando.
    const alex = crearPersona('alex');
    const ax = P.ancho - 86;
    ctx.drawImage(alex.izq[this.estado === 'dibujando' && Math.floor(this.t / 12) % 2 ? 1 : 0], ax, 92, 32, 48);
    if (punta && this.estado === 'dibujando' && this.progreso < 1) {
      rect(ctx, Math.round(punta[0]), Math.round(punta[1]) - 9, 3, 9, '#3060c0');
      rect(ctx, Math.round(punta[0]), Math.round(punta[1]) - 1, 3, 2, NEGRO);
    }
    ctx.drawImage(crearPersona('begona').abajo[0], P.ancho - 46, 116);
    ctx.drawImage(crearPersona('david').abajo[0], P.ancho - 24, 116);

    // Respuestas.
    if (this.opciones && this.estado !== 'fin') {
      this.botones().forEach((b, k) => {
        let fondo = '#f8f8f8';
        if (b.o.tachada) fondo = '#e0e0e0';
        if (this.estado === 'acierto' && b.o.buena) fondo = '#c8f0c8';
        const marco = k === this.sel && this.estado === 'dibujando' ? '#f8c840' : '#c0c8d8';
        caja(ctx, b.x, b.y, b.w, b.h, { marco, fondo });
        escribir(ctx, b.o.texto, b.x + 8, b.y + 5, b.o.tachada ? '#a0a0a8' : COL.texto);
        if (b.o.tachada) rect(ctx, b.x + 6, b.y + 10, b.w - 12, 1, '#d03050');
      });
    }

    marcador(ctx, 'Dibujo ' + Math.min(this.ronda + 1, DIBUJOS.length) + '/' + DIBUJOS.length);
    if (this.dice) {
      // Lo que dicen: arriba a la derecha si cabe en una línea; si no, a lo ancho.
      const texto = this.dice.quien + ': ' + this.dice.texto;
      let x = 8 + anchoTexto('Dibujo 5/5') + 14;
      let y = 4;
      let w = P.ancho - x - 4;
      let lineas = [texto];
      if (anchoTexto(texto) + 14 > w) {
        x = 4;
        y = 24;
        w = P.ancho - 8;
        lineas = envolver(texto, w - 14);
      } else w = anchoTexto(texto) + 14;
      caja(ctx, x, y, w, 8 + lineas.length * 11, { marco: this.dice.quien === 'Alex' ? '#9ad8a8' : '#f8a0c0' });
      lineas.forEach((l, k) => escribir(ctx, l, x + 7, y + 4 + k * 11));
    }
  }
}
