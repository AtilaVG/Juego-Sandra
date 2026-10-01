// Base común de los minijuegos: introducción, pausa, pistas de Alex y final.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado, envolver, anchoTexto } from '../motor/fuente.js';
import { caja, Dialogo, Eleccion } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { estado, guardar } from '../motor/guardado.js';
import { MUSICA } from '../datos/musica.js';

export class Minijuego {
  constructor(av, { alGanar, alSalir, fase = {} } = {}) {
    this.av = av;
    this.alGanar = alGanar;
    this.alSalir = alSalir;
    this.fase = fase;
    this.t = 0;
    this.modo = 'intro'; // 'intro' | 'jugando' | 'fin'
    this.pausa = null;
    this.bocadillo = null;
    this.aviso = null;
    this.pistaActual = 0;
    this.usaPistas = true;
    this.musica = MUSICA.nivel;
    this.dialogo = new Dialogo(fase.intro || av.intro);
    this.alCerrar = null;
    this.yBocadillo = 22;
  }

  get pistas() {
    return this.fase.pistas || this.av.pistas;
  }

  entrar() {}

  // Lo implementa cada minijuego.
  empezar() {}
  jugar() {}
  pintar() {}

  decir(mensajes, alCerrar) {
    this.dialogo = new Dialogo(mensajes);
    this.alCerrar = alCerrar || null;
  }

  avisar(texto, t = 120) {
    this.aviso = { texto, t };
  }

  darPista() {
    const pistas = this.pistas;
    if (!pistas || !pistas.length) return;
    this.bocadillo = { texto: pistas[this.pistaActual % pistas.length], t: 300 };
    this.pistaActual++;
    sfx.aceptar();
  }

  // Termina el minijuego con éxito.
  ganar(mensaje = '¡Conseguido!') {
    if (this.modo === 'fin') return;
    this.modo = 'fin';
    this.timerFin = 170;
    musica(MUSICA.medalla);
    this.avisar(mensaje, 170);
    if (this.fase.recuerdo !== false && !estado.recuerdos.includes(this.av.id)) {
      estado.recuerdos.push(this.av.id);
      guardar();
    }
  }

  actualizar() {
    this.t++;
    if (this.bocadillo && --this.bocadillo.t <= 0) this.bocadillo = null;
    if (this.aviso && --this.aviso.t <= 0) this.aviso = null;

    if (this.dialogo) {
      if (this.dialogo.actualizar()) {
        this.dialogo = null;
        const f = this.alCerrar;
        this.alCerrar = null;
        if (this.modo === 'intro') {
          this.modo = 'jugando';
          if (this.musica) musica(this.musica);
          this.empezar();
        }
        if (f) f();
      }
      return;
    }

    if (this.pausa) {
      if (this.pausa.actualizar()) {
        const r = this.pausa.resultado;
        this.pausa = null;
        if (r === 1 && this.alSalir) this.alSalir();
      }
      return;
    }

    if (this.modo === 'jugando') {
      if (E.pulsado.menu) {
        sfx.aceptar();
        this.pausa = new Eleccion(['Seguir jugando', 'Volver al pueblo'], { x: P.ancho / 2 - 56, y: 70, ancho: 112 });
        return;
      }
      if (this.usaPistas && E.pulsado.b) this.darPista();
      this.jugar();
    } else if (this.modo === 'fin') {
      this.animarFin();
      if (--this.timerFin <= 0) {
        this.modo = 'terminado';
        if (this.alGanar) this.alGanar();
      }
    }
  }

  animarFin() {}

  dibujar(ctx) {
    this.pintar(ctx);
    dibujarBocadillo(ctx, this.bocadillo, this.yBocadillo);
    if (this.aviso) {
      const lineas = envolver(this.aviso.texto, P.ancho - 28);
      const w = Math.min(P.ancho - 8, Math.max(...lineas.map((l) => anchoTexto(l))) + 20);
      const h = 8 + lineas.length * 12;
      caja(ctx, P.ancho / 2 - w / 2, P.alto - h - 10, w, h, { marco: '#f8c040' });
      lineas.forEach((l, i) => escribirCentrado(ctx, l, P.ancho / 2, P.alto - h - 5 + i * 12));
    }
    if (this.pausa) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, P.ancho, P.alto);
      this.pausa.dibujar(ctx);
    }
    if (this.dialogo) this.dialogo.dibujar(ctx);
  }
}

export function dibujarBocadillo(ctx, bocadillo, y = 22) {
  if (!bocadillo) return;
  const x = 24;
  const w = P.ancho - 48;
  const lineas = envolver(bocadillo.texto, w - 52);
  const h = lineas.length * 12 + 12;
  caja(ctx, x, y, w, h, { marco: '#9ad8a8' });
  escribir(ctx, 'ALEX:', x + 8, y + 5, '#3060c0');
  lineas.forEach((l, i) => escribir(ctx, l, x + 42, y + 5 + i * 12));
}

// Barra de progreso con borde (para machacar, batir...).
export function barra(ctx, x, y, w, h, f, color = '#40c860') {
  ctx.fillStyle = '#404850';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, Math.round((w - 4) * Math.max(0, Math.min(1, f))), h - 4);
}

// Marcador pequeño arriba a la izquierda.
export function marcador(ctx, texto, x = 4, y = 4) {
  const w = anchoTexto(texto) + 14;
  caja(ctx, x, y, w, 18);
  escribir(ctx, texto, x + 7, y + 4);
}

export function dentro(p, x, y, w, h) {
  return p && p.x >= x && p.x < x + w && p.y >= y && p.y < y + h;
}
