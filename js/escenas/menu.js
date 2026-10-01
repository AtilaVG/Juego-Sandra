// Menú de pausa del pueblo: medallas, álbum de recuerdos, Laila, guardar...
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado, envolver } from '../motor/fuente.js';
import { caja, Eleccion, Dialogo } from '../motor/ui.js';
import { sfx, setSilencio } from '../motor/audio.js';
import { rect } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { medalla } from '../arte/medallas.js';
import { polaroid, beso } from '../arte/escenario.js';
import { fotoRecuerdo } from '../arte/fotos.js';
import { lailaFrente } from '../arte/bichos.js';
import { AVENTURAS } from '../datos/aventuras.js';
import { ATAQUES_LAILA, OBJETOS } from '../datos/jefes.js';
import { juego } from '../juego.js';
import { EscenaTitulo } from './titulo.js';

function fondoPantalla(ctx, a, b) {
  const g = ctx.createLinearGradient(0, 0, 0, P.alto);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, P.ancho, P.alto);
}

export class MenuPausa {
  constructor(mundo) {
    this.mundo = mundo;
    this.sub = null;
    this.mensaje = null;
    this.pagina = 0;
    this.crearLista();
  }

  crearLista(inicial = 0) {
    const sonido = estado.sonido ? 'SONIDO: SÍ' : 'SONIDO: NO';
    this.opciones = ['MEDALLAS', 'ÁLBUM', 'LAILA', 'MOCHILA', 'GUARDAR', sonido, 'SALIR', 'VOLVER'];
    this.lista = new Eleccion(this.opciones, { x: P.ancho - 104, y: 4, ancho: 100, inicial });
  }

  actualizar() {
    if (this.mensaje) {
      if (this.mensaje.actualizar()) {
        const fin = this.alCerrarMensaje;
        this.mensaje = null;
        this.alCerrarMensaje = null;
        if (fin) fin();
      }
      return false;
    }
    if (this.sub) {
      if (this.sub === 'album') {
        const n = AVENTURAS.length;
        if (E.pulsado.der || (E.toque && E.toque.x > P.ancho / 2) || E.pulsado.a) {
          this.pagina = (this.pagina + 1) % n;
          sfx.cursor();
        } else if (E.pulsado.izq || (E.toque && E.toque.x <= P.ancho / 2)) {
          this.pagina = (this.pagina + n - 1) % n;
          sfx.cursor();
        }
        if (E.pulsado.b || E.pulsado.menu) {
          sfx.cancelar();
          this.sub = null;
          this.crearLista(1);
        }
        return false;
      }
      if (E.pulsado.a || E.pulsado.b || E.pulsado.menu || E.toque) {
        sfx.cancelar();
        const i = ['medallas', 'album', 'laila', 'mochila'].indexOf(this.sub);
        this.sub = null;
        this.crearLista(i);
      }
      return false;
    }
    if (E.pulsado.menu) {
      sfx.cancelar();
      return true;
    }
    if (this.lista.actualizar()) {
      const r = this.lista.resultado;
      if (r < 0 || r === 7) return true;
      if (r === 0) this.sub = 'medallas';
      else if (r === 1) {
        this.sub = 'album';
        this.pagina = 0;
      } else if (r === 2) this.sub = 'laila';
      else if (r === 3) this.sub = 'mochila';
      else if (r === 4) {
        this.mundo.guardarPos();
        guardar();
        sfx.vida();
        this.mensaje = new Dialogo('Partida guardada. ¡Puedes cerrar el juego cuando quieras!');
        this.alCerrarMensaje = () => this.crearLista(4);
      } else if (r === 5) {
        estado.sonido = !estado.sonido;
        setSilencio(!estado.sonido);
        guardar();
        this.crearLista(5);
        sfx.aceptar();
      } else if (r === 6) {
        this.mundo.guardarPos();
        guardar();
        juego.cambiar(new EscenaTitulo());
        return true;
      }
    }
    return false;
  }

  dibujar(ctx) {
    if (this.sub === 'medallas') return this.dibujarMedallas(ctx);
    if (this.sub === 'album') return this.dibujarAlbum(ctx);
    if (this.sub === 'laila') return this.dibujarLaila(ctx);
    if (this.sub === 'mochila') return this.dibujarMochila(ctx);
    this.lista.dibujar(ctx);
    if (this.mensaje) this.mensaje.dibujar(ctx);
  }

  dibujarMedallas(ctx) {
    fondoPantalla(ctx, '#4a3a7a', '#2a2050');
    escribirCentrado(ctx, 'ESTUCHE DE MEDALLAS', P.ancho / 2, 8, '#ffffff', '#1a1030');
    const cols = 4;
    const cw = 62;
    const x0 = P.ancho / 2 - (cols * cw) / 2;
    AVENTURAS.forEach((av, i) => {
      const fila = Math.floor(i / cols);
      const enFila = Math.min(cols, AVENTURAS.length - fila * cols);
      const x = x0 + ((cols - enFila) * cw) / 2 + (i % cols) * cw;
      const y = 22 + fila * 40;
      const tiene = estado.medallas.includes(av.id);
      caja(ctx, x + 2, y, cw - 4, 37, { marco: tiene ? '#f8c040' : '#a0a0b0' });
      ctx.drawImage(medalla(av.id, tiene), x + cw / 2 - 12, y + 3);
      const nombre = tiene ? av.medalla.replace('Medalla ', '') : '???';
      escribirCentrado(ctx, nombre, x + cw / 2, y + 25);
    });
    ctx.drawImage(beso(), 8, P.alto - 14);
    escribir(ctx, 'Besos recogidos: ' + estado.besos, 24, P.alto - 15, '#ffffff', '#1a1030');
  }

  dibujarAlbum(ctx) {
    fondoPantalla(ctx, '#f8e8d0', '#e8c8a8');
    const av = AVENTURAS[this.pagina];
    const tiene = estado.recuerdos.includes(av.id);
    escribirCentrado(ctx, 'ÁLBUM DE RECUERDOS  ' + (this.pagina + 1) + '/' + AVENTURAS.length, P.ancho / 2, 6, '#6a3a2a', '#f8f0e0');
    const cx = P.ancho / 2;
    if (tiene) {
      const foto = fotoRecuerdo(av.id);
      ctx.save();
      ctx.translate(cx, 58);
      ctx.rotate(-0.05);
      if (foto) {
        rect(ctx, -34, -36, 68, 76, '#ffffff');
        ctx.drawImage(foto, -28, -30, 56, 56);
      } else ctx.drawImage(polaroid(), -32, -36, 64, 72);
      ctx.restore();
      caja(ctx, 12, 104, P.ancho - 24, 72);
      escribirCentrado(ctx, av.recuerdo.titulo, cx, 110, '#d03050');
      envolver(av.recuerdo.texto, P.ancho - 44).forEach((l, i) => escribir(ctx, l, 22, 126 + i * 13));
    } else {
      rect(ctx, cx - 30, 24, 60, 68, '#d8c0a0');
      escribirCentrado(ctx, '?', cx, 52, '#a08060', null, 2);
      caja(ctx, 12, 104, P.ancho - 24, 50);
      escribirCentrado(ctx, 'Recuerdo sin encontrar', cx, 112, '#a08060');
      const vivida = estado.medallas.includes(av.id) || estado.nivelActual > AVENTURAS.indexOf(av);
      const pista = av.fases ? 'Se consigue al completar "' + av.nombre + '"' : 'Está escondido en "' + av.nombre + '"';
      escribirCentrado(ctx, vivida ? pista : 'Aventura todavía por vivir', cx, 128);
    }
    escribirCentrado(ctx, '< >  pasar página  ·  B: salir', cx, P.alto - 12, '#6a3a2a', null);
  }

  dibujarLaila(ctx) {
    fondoPantalla(ctx, '#d8f0e0', '#a8d8b8');
    caja(ctx, 8, 8, P.ancho - 16, P.alto - 16);
    ctx.drawImage(lailaFrente(), 20, 30, 80, 80);
    const x = 116;
    escribir(ctx, 'LAILA', x, 22, '#d03050');
    escribir(ctx, 'Nivel ' + estado.lailaNivel, x, 38);
    escribir(ctx, 'PS máx. ' + (20 + estado.lailaNivel * 2), x, 52);
    escribir(ctx, 'Carácter: algo suya,', x, 70);
    escribir(ctx, 'pero maja.', x, 82);
    escribir(ctx, 'ATAQUES', 22, 122, '#3060c0');
    ATAQUES_LAILA.forEach((a, i) => escribir(ctx, '· ' + a.nombre, 22 + (i % 2) * 100, 138 + Math.floor(i / 2) * 14));
  }

  dibujarMochila(ctx) {
    fondoPantalla(ctx, '#f0d8b0', '#d8b080');
    caja(ctx, 8, 8, P.ancho - 16, P.alto - 16);
    escribirCentrado(ctx, 'MOCHILA', P.ancho / 2, 16, '#8a4a2a');
    const lista = Object.keys(OBJETOS).filter((k) => (estado.objetos[k] || 0) > 0);
    if (!lista.length) escribirCentrado(ctx, 'Está vacía.', P.ancho / 2, 60);
    lista.forEach((k, i) => {
      escribir(ctx, OBJETOS[k].nombre, 24, 40 + i * 18);
      escribir(ctx, '×' + estado.objetos[k], P.ancho - 50, 40 + i * 18);
    });
    escribirCentrado(ctx, 'Se usan en los combates para curar a Laila.', P.ancho / 2, P.alto - 30, '#8a4a2a');
  }
}

