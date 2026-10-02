// Noche de series: Laila esconde el mando debajo de un cojín, los cojines se mezclan
// y hay que adivinar dónde está (como los trileros).
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribirCentrado } from '../motor/fuente.js';
import { sfx } from '../motor/audio.js';
import { rect, elipse, circulo, figura } from '../motor/dibujo.js';
import { lailaMundo } from '../arte/bichos.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { Minijuego, marcador, dentro } from './minijuego.js';

const OBJETIVO = 3;
// Cada ronda: cojines, cambios y frames que dura cada cambio.
const RONDAS = [
  { n: 3, cambios: 3, dur: 34 },
  { n: 3, cambios: 5, dur: 26 },
  { n: 4, cambios: 6, dur: 22 },
];
const ASIENTO = 116; // altura del asiento del sofá
const COJIN_W = 40;
const COJIN_H = 22;

let cacheCojin = null;
function cojin() {
  if (!cacheCojin) {
    cacheCojin = figura(COJIN_W, COJIN_H, (c) => {
      elipse(c, 20, 11, 19.5, 10.5, '#e86a8a');
      elipse(c, 20, 9, 16, 6, '#ff9ab0');
      rect(c, 4, 15, 32, 2, '#c84a6a');
      circulo(c, 20, 11, 1.6, '#b84a6a');
    });
  }
  return cacheCojin;
}

let cacheMando = null;
function mando() {
  if (!cacheMando) {
    cacheMando = figura(8, 18, (c) => {
      rect(c, 0, 0, 8, 18, '#34343c');
      rect(c, 1, 1, 6, 16, '#44444e');
      circulo(c, 4, 3.5, 1.6, '#f04040');
      for (let i = 0; i < 3; i++) {
        rect(c, 1.5, 7 + i * 3, 2, 1.5, '#c8c8d0');
        rect(c, 4.5, 7 + i * 3, 2, 1.5, '#c8c8d0');
      }
    });
  }
  return cacheMando;
}

export class EscenaMando extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.aciertos = 0;
    this.ronda = 0;
    this.fallos = 0;
    this.sel = 0;
    this.estado = 'espera';
  }

  empezar() {
    this.bocadillo = { texto: 'Laila esconde el mando. ¡Fíjate bien!', t: 150 };
    this.nuevaRonda();
  }

  get conf() {
    return RONDAS[Math.min(this.ronda, RONDAS.length - 1)];
  }

  // Centro x de cada hueco del sofá.
  xHueco(i, n = this.cojines.length) {
    const paso = n === 4 ? 44 : 50;
    return P.ancho / 2 + (i - (n - 1) / 2) * paso;
  }

  nuevaRonda() {
    const { n, cambios } = this.conf;
    this.cojines = Array.from({ length: n }, (_, i) => ({ hueco: i, mando: false, alto: 0 }));
    this.cojines[Math.floor(Math.random() * n)].mando = true;
    this.cambios = [];
    for (let k = 0; k < cambios; k++) {
      const a = Math.floor(Math.random() * n);
      let b = Math.floor(Math.random() * (n - 1));
      if (b >= a) b++;
      this.cambios.push([a, b]);
    }
    this.dur = this.conf.dur + Math.min(2, this.fallos) * 6;
    this.sel = Math.floor(n / 2);
    this.estado = 'esconder';
    this.tEstado = 0;
    this.elegido = null;
  }

  conMando() {
    return this.cojines.find((c) => c.mando);
  }

  jugar() {
    this.tEstado++;
    const t = this.tEstado;
    if (this.estado === 'esconder') {
      // El mando aparece encima, el cojín se levanta, el mando se mete debajo y el cojín baja.
      const c = this.conMando();
      c.alto = t < 30 ? 0 : t < 46 ? Math.min(16, (t - 30) * 1.5) : t < 64 ? 16 : Math.max(0, 16 - (t - 64) * 1.5);
      if (t === 2) sfx.miau();
      if (t === 76) sfx.bloque();
      if (t > 100) {
        this.estado = 'mezclar';
        this.tEstado = 0;
        this.paso = 0;
      }
    } else if (this.estado === 'mezclar') {
      if (t >= this.dur) {
        const [a, b] = this.cambios[this.paso];
        for (const c of this.cojines) {
          if (c.hueco === a) c.hueco = b;
          else if (c.hueco === b) c.hueco = a;
        }
        this.paso++;
        this.tEstado = 0;
        if (this.paso >= this.cambios.length) {
          this.estado = 'elegir';
          sfx.campana();
        } else sfx.cursor();
      }
    } else if (this.estado === 'elegir') {
      const n = this.cojines.length;
      if (E.pulsado.izq) {
        this.sel = (this.sel + n - 1) % n;
        sfx.cursor();
      }
      if (E.pulsado.der) {
        this.sel = (this.sel + 1) % n;
        sfx.cursor();
      }
      let hueco = null;
      if (E.toque) {
        for (let i = 0; i < n; i++) if (dentro(E.toque, this.xHueco(i) - 24, ASIENTO - 40, 48, 64)) hueco = i;
      } else if (E.pulsado.a) hueco = this.sel;
      if (hueco !== null) this.elegir(hueco);
    } else if (this.estado === 'revelar') {
      const elegido = this.cojines.find((c) => c.hueco === this.elegido);
      elegido.alto = Math.min(16, t * 1.5);
      if (!this.acierto && t > 40) this.conMando().alto = Math.min(16, (t - 40) * 1.5);
      if (t > (this.acierto ? 110 : 150) || (t > 50 && (E.pulsado.a || E.toque))) {
        if (this.aciertos >= OBJETIVO) {
          for (const c of this.cojines) c.alto = 16;
          this.ganar('¡Mando recuperado! Ahora sí: ¡a ver series!');
        } else this.nuevaRonda();
      }
    }
  }

  elegir(hueco) {
    this.sel = hueco;
    this.elegido = hueco;
    this.acierto = this.conMando().hueco === hueco;
    this.estado = 'revelar';
    this.tEstado = 0;
    if (this.acierto) {
      this.aciertos++;
      this.ronda++;
      this.fallos = 0;
      sfx.vida();
      this.avisar(this.aciertos >= OBJETIVO ? '¡Encontrado!' : '¡Encontrado! Laila no se rinde...', 100);
    } else {
      this.fallos++;
      sfx.dano();
      this.avisar('¡Ahí no está! Laila se ríe por dentro.', 140);
    }
  }

  // Posición de cada cojín (durante un cambio, los dos se cruzan en arco).
  posicion(c) {
    let x = this.xHueco(c.hueco);
    let y = ASIENTO - COJIN_H + 6 - c.alto;
    let encima = false;
    if (this.estado === 'mezclar' && this.paso < this.cambios.length) {
      const [a, b] = this.cambios[this.paso];
      const p = Math.min(1, this.tEstado / this.dur);
      const s = p * p * (3 - 2 * p);
      if (c.hueco === a || c.hueco === b) {
        const destino = c.hueco === a ? b : a;
        x = this.xHueco(c.hueco) + (this.xHueco(destino) - this.xHueco(c.hueco)) * s;
        encima = c.hueco === a;
        y -= Math.sin(p * Math.PI) * (encima ? 18 : 4);
      }
    }
    return { x, y, encima };
  }

  pintar(ctx) {
    dibujarCielo(ctx, 'salon', P.ancho, P.alto);
    ctx.drawImage(capaFondo('salon', 0), -60, 0);
    // Suelo de madera y alfombra.
    rect(ctx, 0, 150, P.ancho, 42, '#9a6440');
    for (let x = 0; x < P.ancho; x += 24) rect(ctx, x, 150, 1, 42, '#7a4a2a');
    elipse(ctx, P.ancho / 2, 170, 110, 14, '#c8a0d8');
    elipse(ctx, P.ancho / 2, 170, 100, 10, '#d8b8e4');

    // Sofá.
    const cx = P.ancho / 2;
    const n = this.cojines ? this.cojines.length : 3;
    const mitad = n === 4 ? 98 : 88;
    rect(ctx, cx - mitad, 72, mitad * 2, 46, '#5a7ab8');
    rect(ctx, cx - mitad, 72, mitad * 2, 4, '#7a9ad8');
    rect(ctx, cx - mitad - 14, 94, 18, 56, '#4a6aa8');
    rect(ctx, cx + mitad - 4, 94, 18, 56, '#4a6aa8');
    rect(ctx, cx - mitad - 14, 94, 18, 4, '#6a8ac8');
    rect(ctx, cx + mitad - 4, 94, 18, 4, '#6a8ac8');
    rect(ctx, cx - mitad, ASIENTO, mitad * 2, 30, '#4a6aa8');
    rect(ctx, cx - mitad, ASIENTO, mitad * 2, 3, '#6a8ac8');
    rect(ctx, cx - mitad - 10, 146, 6, 6, '#3a2a20');
    rect(ctx, cx + mitad + 4, 146, 6, 6, '#3a2a20');

    // Laila en el reposabrazos, muy orgullosa.
    ctx.drawImage(lailaMundo(Math.floor(this.t / 30) % 2), Math.round(cx + mitad - 12), 64, 32, 32);

    if (this.cojines) {
      // El mando (debajo de los cojines).
      const c = this.conMando();
      const m = this.posicion(c);
      let my = ASIENTO - 14;
      if (this.estado === 'esconder') {
        const t = this.tEstado;
        my = t < 46 ? 62 + Math.round(Math.sin(t / 5) * 2) : Math.min(ASIENTO - 14, 62 + (t - 46) * 2.5);
      }
      const visible = this.estado === 'esconder' || c.alto > 4 || this.modo === 'fin';
      if (visible) ctx.drawImage(mando(), Math.round(m.x - 4), Math.round(my));

      const orden = [...this.cojines].sort((a, b) => this.posicion(a).encima - this.posicion(b).encima);
      for (const k of orden) {
        const p = this.posicion(k);
        elipse(ctx, p.x, ASIENTO + 4, 16, 2, 'rgba(0,0,0,0.18)');
        ctx.drawImage(cojin(), Math.round(p.x - COJIN_W / 2), Math.round(p.y));
      }

      if (this.estado === 'elegir') {
        const x = Math.round(this.xHueco(this.sel));
        const y = ASIENTO - COJIN_H - 10 + (Math.floor(this.t / 12) % 2);
        rect(ctx, x - 3, y, 7, 2, '#f8d030');
        rect(ctx, x - 2, y + 2, 5, 2, '#f8d030');
        rect(ctx, x - 1, y + 4, 3, 2, '#f8d030');
        escribirCentrado(ctx, '¿Debajo de qué cojín está el mando?', P.ancho / 2, 156, '#ffffff', '#383848');
      } else if (this.estado === 'mezclar') {
        escribirCentrado(ctx, '¡No le quites ojo!', P.ancho / 2, 156, '#ffffff', '#383848');
      }
    }

    marcador(ctx, 'Mandos: ' + this.aciertos + '/' + OBJETIVO);
  }
}
