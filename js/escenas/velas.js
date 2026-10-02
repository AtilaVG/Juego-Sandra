// El cumple de la madre de Alex: las velas de la tarta se encienden en un orden
// y hay que repetirlo (como el Simón). Cada ronda superada desbloquea una frase
// del cumpleaños feliz; al final se canta entero y se soplan las velas.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribirCentrado } from '../motor/fuente.js';
import { caja } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { rect, elipse, circulo, poligono } from '../motor/dibujo.js';
import { crearPersona } from '../arte/personas.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { CUMPLEANOS, LETRA_CUMPLE } from '../datos/musica.js';
import { Minijuego, marcador, dentro } from './minijuego.js';

const VELAS = [
  { color: '#f070a0', nota: 'C5' },
  { color: '#5a8af0', nota: 'E5' },
  { color: '#f8d030', nota: 'G5' },
  { color: '#58c070', nota: 'C6' },
];
const LARGOS = [3, 4, 5, 6]; // velas que hay que repetir en cada ronda
const MESA = 140;
const TARTA = 100; // parte de arriba de la tarta
const MADRE = { piel: '#f2cdb0', pelo: '#6a4028', estilo: 'media', camiseta: '#c868a8', pantalon: '#34384a', zapatos: '#2a2a2a' };

// Frames que dura una canción (para esperar a que termine aunque no suene).
function frames(cancion) {
  const u = cancion.canales[0].eventos.reduce((a, e) => a + e.dur, 0);
  return Math.ceil(u * (60 / cancion.bpm / 4) * 60) + 20;
}

export class EscenaVelas extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.musica = null;
    this.ronda = 0;
    this.fallos = 0;
    this.secuencia = [];
    this.encendida = VELAS.map(() => 0); // frames que le quedan encendida a cada vela
    this.sel = 0;
    this.estado = 'espera';
    this.letra = null;
    this.humo = [];
    this.confeti = [];
  }

  empezar() {
    this.alargar(LARGOS[0]);
    this.mostrar();
  }

  alargar(n) {
    while (this.secuencia.length < n) {
      let v;
      do v = Math.floor(Math.random() * VELAS.length);
      while (v === this.secuencia[this.secuencia.length - 1]);
      this.secuencia.push(v);
    }
  }

  mostrar() {
    this.estado = 'mostrar';
    this.tEstado = -40;
    this.paso = 0;
    this.encendida.fill(0);
    // Si cuesta, Alex las enciende más despacio.
    this.tOn = 28 + Math.min(2, this.fallos) * 10;
    this.tOff = 14 + Math.min(2, this.fallos) * 4;
  }

  encender(v, t) {
    this.encendida[v] = t;
    sfx.nota(VELAS[v].nota, t / 60);
  }

  xVela(i) {
    return P.ancho / 2 + (i - 1.5) * 28;
  }

  jugar() {
    this.tEstado++;
    for (let i = 0; i < VELAS.length; i++) if (this.encendida[i] > 0 && this.estado !== 'soplar' && this.estado !== 'cantar') this.encendida[i]--;

    if (this.estado === 'mostrar') {
      const ciclo = this.tOn + this.tOff;
      if (this.tEstado >= 0 && this.tEstado % ciclo === 0) {
        if (this.paso < this.secuencia.length) this.encender(this.secuencia[this.paso++], this.tOn);
        else {
          this.estado = 'turno';
          this.tEstado = 0;
          this.entrada = 0;
        }
      }
    } else if (this.estado === 'turno') {
      const n = VELAS.length;
      if (E.pulsado.izq) {
        this.sel = (this.sel + n - 1) % n;
        sfx.cursor();
      }
      if (E.pulsado.der) {
        this.sel = (this.sel + 1) % n;
        sfx.cursor();
      }
      let v = null;
      if (E.toque) {
        for (let i = 0; i < n; i++) if (dentro(E.toque, this.xVela(i) - 14, TARTA - 50, 28, 80)) v = i;
      } else if (E.pulsado.a) v = this.sel;
      if (v !== null) this.pulsar(v);
    } else if (this.estado === 'frase') {
      if (this.tEstado === 15) musica(CUMPLEANOS.frases[this.ronda]);
      if (this.tEstado > this.duracion) {
        this.letra = null;
        this.ronda++;
        if (this.ronda >= LARGOS.length) {
          this.estado = 'cantar';
          this.tEstado = 0;
          this.encendida.fill(1);
          this.duracion = frames(CUMPLEANOS.entera);
          musica(CUMPLEANOS.entera);
        } else {
          this.alargar(LARGOS[this.ronda]);
          this.mostrar();
        }
      }
    } else if (this.estado === 'cantar') {
      const k = Math.min(3, Math.floor((this.tEstado / this.duracion) * 4));
      this.letra = '♪ ' + LETRA_CUMPLE[k] + ' ♪';
      if (this.tEstado > this.duracion) {
        this.estado = 'soplar';
        this.tEstado = 0;
        this.letra = null;
        this.bocadillo = { texto: '¡Sopla las velas, bebe! Pulsa A o toca la tarta.', t: 9999 };
      }
    } else if (this.estado === 'soplar') {
      if (E.pulsado.a || (E.toque && dentro(E.toque, P.ancho / 2 - 80, TARTA - 50, 160, 100))) this.soplar();
    }
  }

  pulsar(v) {
    this.sel = v;
    this.encender(v, 16);
    if (v !== this.secuencia[this.entrada]) {
      sfx.dano();
      this.fallos++;
      this.avisar(this.fallos >= 2 ? 'Alex: Tranqui, te las enciendo más despacio.' : '¡Uy, esa no era! Mira otra vez.', 110);
      this.mostrar();
      this.tEstado = -70;
      return;
    }
    this.entrada++;
    if (this.entrada >= this.secuencia.length) {
      // Ronda superada: la familia canta la siguiente frase.
      this.fallos = 0;
      this.estado = 'frase';
      this.tEstado = 0;
      this.duracion = frames(CUMPLEANOS.frases[this.ronda]) + 15;
      this.letra = '♪ ' + LETRA_CUMPLE[this.ronda] + ' ♪';
    }
  }

  soplar() {
    sfx.soplido();
    this.encendida.fill(0);
    this.bocadillo = null;
    for (let i = 0; i < VELAS.length; i++) {
      for (let k = 0; k < 4; k++) this.humo.push({ x: this.xVela(i) + (Math.random() - 0.5) * 3, y: TARTA - 26, t: 50 + k * 12 });
    }
    for (let k = 0; k < 50; k++) {
      this.confeti.push({
        x: Math.random() * P.ancho,
        y: -Math.random() * 60,
        vy: 0.6 + Math.random() * 0.8,
        c: ['#f05060', '#5a8af0', '#f8d030', '#58c070', '#c060e0'][k % 5],
      });
    }
    this.estado = 'soplado';
    this.ganar('¡Feliz cumple! Toda la familia aplaude.');
  }

  animarFin() {
    for (const c of this.confeti) c.y += c.vy;
  }

  pintar(ctx) {
    const cx = P.ancho / 2;
    dibujarCielo(ctx, 'fiesta', P.ancho, P.alto);
    // Solo los banderines de arriba (el cartel quedaría detrás de las velas).
    ctx.drawImage(capaFondo('fiesta', 0), 0, 0, 512, 72, Math.round(cx - 225), -24, 512, 72);

    // La familia detrás de la mesa, con gorritos.
    const alex = crearPersona('alex').abajo[0];
    const madre = crearPersona(MADRE).abajo[0];
    const gente = [
      [alex, cx - 106],
      [madre, cx + 74],
    ];
    for (const [img, x] of gente) {
      ctx.drawImage(img, Math.round(x), MESA - 46, 32, 48);
      poligono(ctx, [x + 9, MESA - 42, x + 16, MESA - 60, x + 23, MESA - 42], '#f86ab0');
      rect(ctx, x + 12, MESA - 50, 8, 2, '#f8d030');
      circulo(ctx, x + 16, MESA - 60, 2, '#ffffff');
    }

    // Mesa con mantel.
    rect(ctx, 0, MESA, P.ancho, P.alto - MESA, '#f8f8f8');
    for (let x = 0; x < P.ancho; x += 12) rect(ctx, x, MESA, 6, P.alto - MESA, '#fbd8e4');
    rect(ctx, 0, MESA, P.ancho, 2, '#e0b8c8');

    // Tarta.
    elipse(ctx, cx, MESA, 78, 7, '#d8d8e4');
    rect(ctx, cx - 66, TARTA, 132, MESA - TARTA - 2, '#fff4e8');
    elipse(ctx, cx, MESA - 2, 66, 5, '#fff4e8');
    rect(ctx, cx - 66, TARTA + 18, 132, 4, '#f8c0d0');
    for (let k = 0; k < 9; k++) circulo(ctx, cx - 56 + k * 14, TARTA + 20, 3, '#e04050');
    elipse(ctx, cx, TARTA, 66, 7, '#ffb0c8');
    for (let k = 0; k < 8; k++) elipse(ctx, cx - 56 + k * 16, TARTA + 5, 4, 5 + (k % 3), '#ffb0c8');
    escribirCentrado(ctx, '¡Felicidades!', cx, TARTA + 26, '#d84a7a', '#fff4e8');

    // Velas.
    for (let i = 0; i < VELAS.length; i++) {
      const x = Math.round(this.xVela(i));
      const v = VELAS[i];
      rect(ctx, x - 3, TARTA - 22, 6, 24, v.color);
      for (let y = TARTA - 20; y < TARTA; y += 6) rect(ctx, x - 3, y, 6, 2, '#ffffff');
      rect(ctx, x, TARTA - 26, 1, 4, '#383838');
      if (this.encendida[i] > 0) {
        const tiembla = Math.sin(this.t / 3 + i) * 0.8;
        circulo(ctx, x + 0.5, TARTA - 32, 11, 'rgba(255,230,140,0.35)');
        elipse(ctx, x + 0.5 + tiembla, TARTA - 31, 4, 7, '#f8a020');
        elipse(ctx, x + 0.5 + tiembla, TARTA - 30, 2.4, 4.5, '#fff0a0');
      }
    }
    for (const h of this.humo) {
      h.t--;
      h.y -= 0.5;
      h.x += Math.sin(h.t / 6) * 0.3;
      if (h.t > 0 && h.t < 50) circulo(ctx, h.x, h.y, 2 + (50 - h.t) / 14, 'rgba(200,200,210,' + (h.t / 70) + ')');
    }
    this.humo = this.humo.filter((h) => h.t > 0);

    if (this.estado === 'turno') {
      const x = Math.round(this.xVela(this.sel));
      const y = TARTA - 52 + (Math.floor(this.t / 12) % 2);
      poligono(ctx, [x - 6, y - 1, x + 7, y - 1, x + 0.5, y + 8], '#383848');
      poligono(ctx, [x - 4, y, x + 5, y, x + 0.5, y + 6], '#f8d030');
    }

    // Lo que hay que hacer, abajo sobre el mantel.
    let texto = null;
    if (this.estado === 'mostrar') texto = 'Mira el orden de las velas...';
    else if (this.estado === 'turno') texto = '¡Tu turno! Enciéndelas igual.';
    if (texto && !this.aviso) escribirCentrado(ctx, texto, cx, 158, '#b03070', '#ffffff');
    if (this.estado === 'turno' && !this.aviso) {
      const n = this.secuencia.length;
      for (let k = 0; k < n; k++) circulo(ctx, cx - (n - 1) * 5 + k * 10, 178, 3, k < this.entrada ? '#f05080' : '#e8c8d4');
    }

    if (this.letra) {
      const w = Math.min(P.ancho - 16, this.letra.length * 6 + 24);
      caja(ctx, cx - w / 2, 24, w, 20, { marco: '#f8a0c0' });
      escribirCentrado(ctx, this.letra, cx, 29, '#b03070');
    }

    for (const c of this.confeti) rect(ctx, Math.round(c.x), Math.round(c.y), 2, 3, c.c);

    marcador(ctx, 'Ronda: ' + Math.min(this.ronda + 1, LARGOS.length) + '/' + LARGOS.length);
  }
}
