// Pantalla de título, pregunta de seguridad y menú inicial.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribir, escribirCentrado, anchoTexto } from '../motor/fuente.js';
import { caja, Dialogo, Eleccion, COL } from '../motor/ui.js';
import { musica, sfx, iniciarAudio } from '../motor/audio.js';
import { lienzo, contorno, rect, elipse, circulo } from '../motor/dibujo.js';
import { estado, guardar, hayPartida, cargar, nuevaPartida } from '../motor/guardado.js';
import { crearPersona } from '../arte/personas.js';
import { lailaMundo } from '../arte/bichos.js';
import { MUSICA } from '../datos/musica.js';
import { CLAVE } from '../datos/config.js';
import { juego } from '../juego.js';
import { EscenaIntro } from './intro.js';
import { EscenaMundo } from './mundo.js';

let logoCache = null;

function logo() {
  if (logoCache) return logoCache;
  const texto = 'SANDRA';
  const esc = 4;
  const w = anchoTexto(texto, esc) + 8;
  const h = 10 * esc + 8;
  const [c, ctx] = lienzo(w, h);
  escribir(ctx, texto, 4, 2, '#ffffff', null, esc);
  // Degradado dorado dentro de las letras.
  ctx.globalCompositeOperation = 'source-in';
  const g = ctx.createLinearGradient(0, 8, 0, h - 8);
  g.addColorStop(0, '#fff6c0');
  g.addColorStop(0.45, '#f8c840');
  g.addColorStop(0.55, '#e89a20');
  g.addColorStop(1, '#c86818');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  contorno(c, '#5a2a10');
  contorno(c, '#f8f0e0');
  contorno(c, '#282c3c');
  logoCache = c;
  return c;
}

function normalizar(s) {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-ZÑ]/g, '');
}

const FILAS_TECLADO = ['ABCDEFGHI', 'JKLMNÑOPQ', 'RSTUVWXYZ'];

export class EscenaTitulo {
  constructor() {
    this.t = 0;
    this.modo = 'pulsa';
    this.corazones = [];
    this.texto = '';
    this.cursor = { f: 0, c: 0 };
    this.fallos = 0;
    this.dialogo = null;
    this.menu = null;
    this.temblor = 0;
  }

  entrar() {
    musica(MUSICA.titulo);
  }

  actualizar() {
    this.t++;
    if (this.t % 18 === 0) {
      this.corazones.push({ x: Math.random() * P.ancho, y: P.alto + 6, v: 0.3 + Math.random() * 0.4, f: Math.random() * 6 });
    }
    for (const c of this.corazones) {
      c.y -= c.v;
      c.f += 0.05;
    }
    this.corazones = this.corazones.filter((c) => c.y > -10);
    if (this.temblor > 0) this.temblor--;

    if (this.dialogo) {
      if (this.dialogo.actualizar()) {
        const fin = this.alTerminarDialogo;
        this.dialogo = null;
        if (fin) fin();
      }
      return;
    }

    if (this.modo === 'pulsa') {
      if (this.t > 30 && (E.pulsado.a || E.toque || E.pulsado.menu)) {
        iniciarAudio();
        sfx.aceptar();
        this.alPulsar();
      }
    } else if (this.modo === 'menu') {
      if (this.menu.actualizar()) {
        const r = this.menu.resultado;
        if (r === 0) this.continuar();
        else if (r === 1) this.confirmarNueva();
        else this.menu.listo = false;
      }
    } else if (this.modo === 'confirmar') {
      if (this.menu.actualizar()) {
        if (this.menu.resultado === 0) {
          nuevaPartida();
          this.empezarNueva();
        } else this.mostrarMenu();
      }
    } else if (this.modo === 'clave') {
      this.actualizarTeclado();
    }
  }

  alPulsar() {
    if (hayPartida()) {
      cargar();
      this.mostrarMenu();
    } else this.empezarNueva();
  }

  mostrarMenu() {
    this.modo = 'menu';
    this.menu = new Eleccion(['CONTINUAR', 'NUEVA PARTIDA'], { cancelable: false, x: P.ancho / 2 - 50, y: 118, ancho: 100 });
  }

  confirmarNueva() {
    this.modo = 'confirmar';
    this.menu = new Eleccion(['Sí, empezar', 'No'], { cancelable: true, x: P.ancho / 2 - 50, y: 118, ancho: 100, inicial: 1 });
    this.dialogo = new Dialogo(['¿Empezar de nuevo? Se perderá la partida guardada.']);
    this.alTerminarDialogo = null;
  }

  continuar() {
    juego.cambiar(estado.introVista ? new EscenaMundo() : new EscenaIntro());
  }

  empezarNueva() {
    if (!estado.claveAcertada) {
      this.modo = 'clave';
      this.texto = '';
      this.dialogo = new Dialogo(['Antes de empezar, una pregunta de seguridad...', CLAVE.pregunta]);
      this.alTerminarDialogo = null;
    } else {
      juego.cambiar(new EscenaIntro());
    }
  }

  // ------------------------------------------------ teclado de letras

  geometriaTeclado() {
    const celda = 18;
    const w = 9 * celda + 16;
    const x0 = Math.round(P.ancho / 2 - w / 2);
    const y0 = 82;
    return { celda, x0, y0, w };
  }

  pulsarTecla(f, c) {
    if (f < 3) {
      if (this.texto.length < 8) {
        this.texto += FILAS_TECLADO[f][c];
        sfx.cursor();
      }
    } else if (c < 4) this.borrar();
    else this.comprobar();
  }

  borrar() {
    if (this.texto.length) {
      this.texto = this.texto.slice(0, -1);
      sfx.cancelar();
    }
  }

  comprobar() {
    if (!this.texto) return;
    const ok = CLAVE.respuestas.some((r) => normalizar(r) === normalizar(this.texto));
    if (ok) {
      sfx.vida();
      estado.claveAcertada = true;
      guardar();
      this.dialogo = new Dialogo(['¡Correcto! ♥', 'Bienvenida, Sandra. Este juego es solo para ti.']);
      this.alTerminarDialogo = () => juego.cambiar(new EscenaIntro());
    } else {
      sfx.dano();
      this.temblor = 20;
      this.fallos++;
      this.texto = '';
      const msgs = ['Mmm... esa no es. ¡Prueba otra vez!'];
      if (this.fallos >= 2) msgs.push(CLAVE.pista);
      this.dialogo = new Dialogo(msgs);
      this.alTerminarDialogo = null;
    }
  }

  actualizarTeclado() {
    // Letras desde un teclado físico.
    if (E.letra) {
      const l = E.letra.toUpperCase();
      if (l === '\b') this.borrar();
      else if (/^[A-ZÑ]$/.test(l) && this.texto.length < 8) {
        this.texto += l;
        sfx.cursor();
        // Así "Intro" confirma directamente.
        this.cursor = { f: 3, c: 5 };
      }
      return;
    }
    const { celda, x0, y0 } = this.geometriaTeclado();
    if (E.toque) {
      const tx = E.toque.x - x0 - 8;
      const ty = E.toque.y - y0 - 6;
      const f = Math.floor(ty / celda);
      if (f >= 0 && f < 3) {
        const c = Math.floor(tx / celda);
        if (c >= 0 && c < 9) {
          this.cursor = { f, c };
          this.pulsarTecla(f, c);
        }
      } else if (f === 3) {
        const c = tx < 4.5 * celda ? 0 : 5;
        this.cursor = { f: 3, c };
        this.pulsarTecla(3, c);
      }
      return;
    }
    const cur = this.cursor;
    const mover = (df, dc) => {
      cur.f = (cur.f + df + 4) % 4;
      if (cur.f === 3) cur.c = cur.c < 5 ? 0 : 5;
      else cur.c = (cur.c + dc + 9) % 9;
      sfx.cursor();
    };
    if (E.pulsado.arr) mover(-1, 0);
    if (E.pulsado.abj) mover(1, 0);
    if (E.pulsado.izq) {
      if (cur.f === 3) cur.c = cur.c === 0 ? 5 : 0;
      else mover(0, -1);
    }
    if (E.pulsado.der) {
      if (cur.f === 3) cur.c = cur.c === 0 ? 5 : 0;
      else mover(0, 1);
    }
    if (E.pulsado.a) this.pulsarTecla(cur.f, cur.c);
    if (E.pulsado.b) this.borrar();
    if (E.pulsado.menu) this.comprobar();
  }

  // ------------------------------------------------ dibujo

  dibujarFondo(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, P.alto);
    g.addColorStop(0, '#2a3a8a');
    g.addColorStop(0.55, '#e87a9a');
    g.addColorStop(1, '#f8c890');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.ancho, P.alto);
    // Estrellitas.
    for (let i = 0; i < 30; i++) {
      const x = (i * 97) % P.ancho;
      const y = (i * 53) % 70;
      if ((this.t / 20 + i) % 7 < 5) rect(ctx, x, y, 1, 1, '#ffffff');
    }
    // Sol poniéndose.
    circulo(ctx, P.ancho * 0.72, 128, 26, '#fff0b0');
    circulo(ctx, P.ancho * 0.72, 128, 22, '#ffd878');
    // Siluetas de Valdemoro.
    ctx.fillStyle = '#5a3a6a';
    const edif = [[0, 24], [18, 34], [34, 20], [50, 44], [60, 30], [78, 26], [96, 38], [112, 22], [128, 30], [150, 40], [166, 26], [184, 32], [200, 46], [214, 28], [232, 36], [250, 24], [268, 34], [286, 28], [304, 40], [322, 26], [340, 30], [358, 38], [376, 24], [394, 32]];
    for (const [x, h] of edif) ctx.fillRect(x, 150 - h, 18, h + 2);
    ctx.fillRect(P.ancho * 0.35, 92, 3, 20);
    ctx.fillRect(P.ancho * 0.35 - 6, 108, 15, 50);
    // Colina.
    elipse(ctx, P.ancho / 2, 205, P.ancho * 0.75, 60, '#3a7a4a');
    elipse(ctx, P.ancho / 2, 210, P.ancho * 0.7, 58, '#4a9a58');
    for (const c of this.corazones) {
      const x = c.x + Math.sin(c.f) * 6;
      escribir(ctx, '♥', x, c.y, '#ff8ab0', null);
    }
  }

  dibujar(ctx) {
    this.dibujarFondo(ctx);
    const cx = P.ancho / 2;
    const dx = this.temblor ? Math.sin(this.temblor) * 3 : 0;

    if (this.modo === 'clave') {
      this.dibujarTeclado(ctx, dx);
    } else {
      // Logo.
      const lg = logo();
      const ly = 16 + Math.round(Math.sin(this.t / 30) * 2);
      ctx.drawImage(lg, Math.round(cx - lg.width / 2), ly);
      // Cinta "Edición Valdemoro".
      const sub = 'EDICIÓN VALDEMORO';
      const sw = anchoTexto(sub) + 20;
      rect(ctx, cx - sw / 2, ly + lg.height + 2, sw, 14, '#282c3c');
      rect(ctx, cx - sw / 2 + 1, ly + lg.height + 3, sw - 2, 12, '#d83a5a');
      escribirCentrado(ctx, sub, cx, ly + lg.height + 4, '#ffffff', '#8a1a3a');

      // Sandra, Alex y Laila sobre la colina.
      const s = crearPersona('sandra');
      const a = crearPersona('alex');
      const paso = Math.floor(this.t / 40) % 2;
      ctx.drawImage(s.abajo[0], Math.round(cx - 34), 142, 32, 48);
      ctx.drawImage(a.abajo[0], Math.round(cx + 2), 142, 32, 48);
      ctx.drawImage(lailaMundo(paso), Math.round(cx + 36), 166, 24, 24);

      if (this.modo === 'pulsa' && Math.floor(this.t / 32) % 2 === 0) {
        const msg = 'Toca la pantalla para empezar';
        const mw = anchoTexto(msg) + 16;
        caja(ctx, cx - mw / 2, 120, mw, 18);
        escribirCentrado(ctx, msg, cx, 124);
      }
      if (this.menu && (this.modo === 'menu' || this.modo === 'confirmar')) this.menu.dibujar(ctx);
    }
    if (this.dialogo) this.dialogo.dibujar(ctx);
  }

  dibujarTeclado(ctx, dx) {
    const cx = P.ancho / 2;
    // Pregunta y casillas.
    caja(ctx, cx - 110 + dx, 8, 220, 66);
    escribirCentrado(ctx, CLAVE.pregunta, cx + dx, 16);
    const huecos = 8;
    const hw = 14;
    const x0 = Math.round(cx - (huecos * hw) / 2) + dx;
    for (let i = 0; i < huecos; i++) {
      const x = x0 + i * hw;
      rect(ctx, x + 2, 58, hw - 4, 1, '#8890a8');
      if (this.texto[i]) escribirCentrado(ctx, this.texto[i], x + hw / 2, 44, COL.texto, COL.sombra, 1);
      else if (i === this.texto.length && Math.floor(this.t / 20) % 2) rect(ctx, x + 2, 56, hw - 4, 2, '#e04860');
    }
    // Letras.
    const { celda, x0: kx, y0, w } = this.geometriaTeclado();
    caja(ctx, kx, y0, w, celda * 4 + 14);
    FILAS_TECLADO.forEach((fila, f) => {
      for (let c = 0; c < fila.length; c++) {
        const x = kx + 8 + c * celda;
        const y = y0 + 6 + f * celda;
        if (this.cursor.f === f && this.cursor.c === c) rect(ctx, x + 1, y + 1, celda - 2, celda - 2, '#f8d0dc');
        escribirCentrado(ctx, fila[c], x + celda / 2, y + 4);
      }
    });
    const yb = y0 + 6 + 3 * celda;
    const mitad = (w - 16) / 2;
    if (this.cursor.f === 3) rect(ctx, kx + 8 + (this.cursor.c === 0 ? 0 : mitad) + 1, yb + 1, mitad - 2, celda - 2, '#f8d0dc');
    escribirCentrado(ctx, 'BORRAR', kx + 8 + mitad / 2, yb + 4, '#3060c0');
    escribirCentrado(ctx, 'OK', kx + 8 + mitad * 1.5, yb + 4, '#d03050');
  }
}
