// Gestor de escenas con fundidos entre ellas.
import { P } from './motor/pantalla.js';
import { vaciarEntrada } from './motor/entrada.js';

export const juego = {
  escena: null,
  siguiente: null,
  fase: null, // 'salida' | 'entrada' | null
  fundido: 0,
  vel: 0.06,
  color: '#000000',
  t: 0,

  cambiar(escena, { rapido = false, color = '#000000' } = {}) {
    if (this.fase === 'salida') return;
    this.siguiente = escena;
    this.fase = 'salida';
    this.vel = rapido ? 0.12 : 0.05;
    this.color = color;
  },

  ponerYa(escena) {
    if (this.escena && this.escena.salir) this.escena.salir();
    this.escena = escena;
    if (escena.entrar) escena.entrar();
  },

  actualizar() {
    this.t++;
    if (this.fase === 'salida') {
      vaciarEntrada();
      this.fundido = Math.min(1, this.fundido + this.vel);
      if (this.fundido >= 1) {
        this.ponerYa(this.siguiente);
        this.siguiente = null;
        this.fase = 'entrada';
      }
      return;
    }
    if (this.fase === 'entrada') {
      this.fundido = Math.max(0, this.fundido - this.vel);
      if (this.fundido <= 0) this.fase = null;
      vaciarEntrada();
    }
    if (this.escena) this.escena.actualizar();
  },

  dibujar(ctx) {
    if (this.escena) this.escena.dibujar(ctx);
    if (this.fundido > 0) {
      ctx.globalAlpha = this.fundido;
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, P.ancho, P.alto);
      ctx.globalAlpha = 1;
    }
  },
};
