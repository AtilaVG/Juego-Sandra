// Introducción al estilo "profesor Pokémon": Alex presenta el mundo.
import { P } from '../motor/pantalla.js';
import { Guion, decir, preguntar, esperar, mientras } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { elipse } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { crearPersona } from '../arte/personas.js';
import { lailaFrente } from '../arte/bichos.js';
import { MUSICA } from '../datos/musica.js';
import { AVENTURAS } from '../datos/aventuras.js';
import { juego } from '../juego.js';
import { EscenaMundo } from './mundo.js';

const A = (texto) => ({ quien: 'Alex', texto });

export class EscenaIntro {
  constructor() {
    this.t = 0;
    this.alex = { vis: 0, x: 0 };
    this.laila = { vis: 0 };
    this.sandra = { vis: 0, escala: 1 };
    this.guion = new Guion(this.historia());
  }

  entrar() {
    musica(MUSICA.intro);
  }

  *historia() {
    yield esperar(30);
    yield mientras(() => (this.alex.vis = Math.min(1, this.alex.vis + 0.04)) >= 1);
    yield decir([
      A('¡Hola, cariño! ¡Bienvenida al mundo de VALDEMORO!'),
      A('Me llamo ALEX... aunque tú me llamas ABUELETE.'),
      A('Este mundo está lleno de recuerdos: piscinas, láseres, tartas de queso, series en el sofá...'),
      A('Todo empezó currando juntos. Y aquí, en Valdemoro, empezamos a salir.'),
    ]);
    yield mientras(() => (this.alex.x = Math.min(1, this.alex.x + 0.05)) >= 1);
    sfx.miau();
    yield mientras(() => (this.laila.vis = Math.min(1, this.laila.vis + 0.05)) >= 1);
    yield decir([
      A('Esta es LAILA.'),
      A('Es algo suya... pero es maja. Te acompañará en los combates.'),
      A('Bueno, cuando le apetezca hacerte caso.'),
    ]);
    yield mientras(() => (this.laila.vis = Math.max(0, this.laila.vis - 0.06)) <= 0);
    yield mientras(() => (this.alex.x = Math.max(0, this.alex.x - 0.05)) <= 0);
    yield decir([
      A('Tu misión: revivir nuestras aventuras y conseguir las ' + AVENTURAS.length + ' MEDALLAS.'),
      A('En cada aventura te espera algo distinto: saltar, escapar, cocinar, maquillar... ¡y algún examen!'),
      A('Y en muchas, al final, hay un combate. ¡Ahí entra Laila!'),
      A('Yo iré siempre contigo. Si te atascas, pulsa B y te daré una pista.'),
    ]);
    let r;
    do {
      r = yield preguntar([A('¿Quieres que te explique los controles?')], ['Sí', 'No']);
      if (r === 0) {
        yield decir([
          A('En el iPad: la cruceta de la izquierda para moverte y el botón A para saltar o hablar.'),
          A('Con el teclado: las flechas para moverte, ESPACIO para saltar o aceptar y X para volver.'),
          A('El botón MENÚ (o la tecla M) abre el menú: medallas, álbum de recuerdos, guardar...'),
          A('Y también puedes tocar la pantalla para pasar los textos y elegir opciones.'),
        ]);
      }
    } while (r === 0 && (yield preguntar([A('¿Te lo repito?')], ['No, ya está', 'Sí'])) === 1);

    yield mientras(() => (this.sandra.vis = Math.min(1, this.sandra.vis + 0.04)) >= 1);
    yield decir([A('Y tú eres SANDRA. Mi cariño.'), A('¿Lista para la aventura?')]);
    let lista = yield preguntar([A('¿Empezamos?')], ['¡Sí!', 'Todavía no']);
    while (lista !== 0) {
      lista = yield preguntar([A('Venga, que no se diga... ¿Empezamos?')], ['¡Sí!', 'Que no']);
    }
    yield decir([A('¡Tu aventura en VALDEMORO está a punto de empezar!'), A('¡Vamos allá!')]);
    sfx.subir();
    yield mientras(() => (this.sandra.escala = Math.max(0.3, this.sandra.escala - 0.02)) <= 0.3);
    estado.introVista = true;
    guardar();
    juego.cambiar(new EscenaMundo(), { color: '#ffffff' });
    yield esperar(999);
  }

  actualizar() {
    this.t++;
    this.guion.actualizar();
  }

  dibujar(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, P.alto);
    g.addColorStop(0, '#fdf6ff');
    g.addColorStop(1, '#d8e4f8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.ancho, P.alto);
    const cx = P.ancho / 2;
    elipse(ctx, cx, 132, 70, 12, '#c0cce0');
    elipse(ctx, cx, 130, 62, 9, '#d8e2f0');

    if (this.sandra.vis > 0) {
      ctx.globalAlpha = this.sandra.vis;
      const s = crearPersona('sandra').abajo[0];
      const k = 3 * this.sandra.escala;
      ctx.drawImage(s, Math.round(cx - 8 * k), Math.round(130 - 23 * k), Math.round(16 * k), Math.round(24 * k));
      ctx.globalAlpha = 1;
    } else if (this.alex.vis > 0) {
      ctx.globalAlpha = this.alex.vis;
      const a = crearPersona('alex').abajo[0];
      const ax = cx - 24 - this.alex.x * 50;
      ctx.drawImage(a, Math.round(ax), 130 - 69, 48, 72);
      ctx.globalAlpha = 1;
    }
    if (this.laila.vis > 0) {
      ctx.globalAlpha = this.laila.vis;
      const l = lailaFrente();
      ctx.drawImage(l, Math.round(cx + 6), 130 - 52, 56, 56);
      ctx.globalAlpha = 1;
    }
    this.guion.dibujar(ctx);
  }
}
