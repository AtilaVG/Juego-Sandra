// Ceremonia al conseguir una medalla (y el recuerdo de esa aventura).
import { P } from '../motor/pantalla.js';
import { escribirCentrado } from '../motor/fuente.js';
import { Guion, decir, esperar, mientras } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { rect, circulo } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { medalla } from '../arte/medallas.js';
import { polaroid } from '../arte/escenario.js';
import { AVENTURAS } from '../datos/aventuras.js';
import { MUSICA } from '../datos/musica.js';
import { juego } from '../juego.js';
import { EscenaMundo } from './mundo.js';

export function entregarMedalla(av) {
  if (!estado.medallas.includes(av.id)) estado.medallas.push(av.id);
  const i = AVENTURAS.indexOf(av);
  estado.nivelActual = Math.max(estado.nivelActual, i + 1);
  if (av.premio) for (const k in av.premio) estado.objetos[k] = (estado.objetos[k] || 0) + av.premio[k];
  guardar();
}

export class EscenaMedalla {
  constructor(av, { repetir = false } = {}) {
    this.av = av;
    this.repetir = repetir;
    this.t = 0;
    this.escala = 0;
    this.verFoto = false;
    this.guion = new Guion(this.secuencia());
  }

  entrar() {
    musica(MUSICA.medalla);
  }

  *secuencia() {
    const av = this.av;
    yield mientras(() => (this.escala = Math.min(1, this.escala + 0.04)) >= 1);
    if (!this.repetir) {
      entregarMedalla(av);
      yield decir('¡SANDRA ha conseguido la ' + av.medalla.toUpperCase() + '!');
    } else yield decir('¡Aventura completada otra vez! ' + av.medalla + ' brilla todavía más.');
    musica(MUSICA.victoria);
    if (estado.recuerdos.includes(av.id)) {
      this.verFoto = true;
      sfx.recuerdo();
      yield decir(['Recuerdo: "' + av.recuerdo.titulo + '"', av.recuerdo.texto]);
      this.verFoto = false;
    } else {
      yield decir('En esta aventura había un recuerdo escondido... ¡Puedes volver a buscarlo cuando quieras!');
    }
    if (!this.repetir && av.despues && av.despues.length) {
      yield decir(av.despues);
    }
    juego.cambiar(new EscenaMundo({ puerta: av.puerta }));
    yield esperar(9999);
  }

  actualizar() {
    this.t++;
    this.guion.actualizar();
  }

  dibujar(ctx) {
    const g = ctx.createRadialGradient(P.ancho / 2, 70, 10, P.ancho / 2, 70, 220);
    g.addColorStop(0, '#fff8d8');
    g.addColorStop(0.5, '#f8c8a0');
    g.addColorStop(1, '#c86a8a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.ancho, P.alto);
    const cx = P.ancho / 2;
    // Rayos girando.
    ctx.save();
    ctx.translate(cx, 70);
    ctx.rotate(this.t / 120);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -200);
      ctx.lineTo(10, -200);
      ctx.fill();
    }
    ctx.restore();

    if (this.verFoto) {
      const f = polaroid();
      ctx.drawImage(f, Math.round(cx - 28), 22, 56, 64);
    } else {
      const m = medalla(this.av.id);
      const k = Math.max(0.1, this.escala) * 3;
      const w = Math.round(24 * k);
      ctx.drawImage(m, Math.round(cx - w / 2), Math.round(70 - w / 2), w, w);
      if (this.t % 30 < 15) {
        rect(ctx, cx + 30, 46, 2, 6, '#ffffff');
        rect(ctx, cx + 28, 48, 6, 2, '#ffffff');
      }
      circulo(ctx, cx - 34, 92 + Math.sin(this.t / 10) * 3, 1.5, '#ffffff');
    }
    escribirCentrado(ctx, this.av.medalla.toUpperCase(), cx, 112, '#8a2a4a', '#fff4e8');
    this.guion.dibujar(ctx);
  }
}
