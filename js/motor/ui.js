// Cuadros de diálogo, menús de elección y "guiones" (escenas con pasos).
import { P } from './pantalla.js';
import { E } from './entrada.js';
import { escribir, envolver, anchoTexto, ALTO_LINEA } from './fuente.js';
import { sfx } from './audio.js';

export const COL = {
  texto: '#404048',
  sombra: '#d0d0c8',
  borde: '#384058',
  marco: '#88a8d8',
  fondo: '#f8f8f8',
};

// Caja redondeada estilo Pokémon B/N.
export function caja(ctx, x, y, w, h, { fondo = COL.fondo, borde = COL.borde, marco = COL.marco } = {}) {
  x = Math.round(x);
  y = Math.round(y);
  ctx.fillStyle = borde;
  ctx.fillRect(x + 2, y, w - 4, h);
  ctx.fillRect(x, y + 2, w, h - 4);
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = marco;
  ctx.fillRect(x + 2, y + 1, w - 4, h - 2);
  ctx.fillRect(x + 1, y + 2, w - 2, h - 4);
  ctx.fillStyle = fondo;
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
}

function dentro(t, x, y, w, h) {
  return t && t.x >= x && t.x < x + w && t.y >= y && t.y < y + h;
}

// ------------------------------------------------------------------ Diálogo

export class Dialogo {
  // mensajes: array de strings o {quien, texto}
  constructor(mensajes, { velocidad = 1.6, auto = 0 } = {}) {
    if (!Array.isArray(mensajes)) mensajes = [mensajes];
    this.paginas = [];
    this.velocidad = velocidad;
    this.auto = auto;
    this.mensajes = mensajes;
    this.anchoPrep = 0;
    this.prepararPaginas();
    this.i = 0;
    this.chars = 0;
    this.t = 0;
    this.listo = false;
    this.resultado = null;
  }

  prepararPaginas() {
    const max = P.ancho - 32;
    if (this.anchoPrep === max) return;
    this.anchoPrep = max;
    this.paginas = [];
    for (const m of this.mensajes) {
      const quien = typeof m === 'string' ? null : m.quien;
      const texto = typeof m === 'string' ? m : m.texto;
      const lineas = envolver(texto, max);
      for (let i = 0; i < lineas.length; i += 2) {
        this.paginas.push({ quien, lineas: lineas.slice(i, i + 2) });
      }
    }
  }

  get pagina() {
    return this.paginas[this.i];
  }

  totalChars() {
    return this.pagina.lineas.join('').length;
  }

  actualizar() {
    if (this.listo) return true;
    this.prepararPaginas();
    if (this.i >= this.paginas.length) this.i = this.paginas.length - 1;
    this.t++;
    const total = this.totalChars();
    const completa = this.chars >= total;
    if (!completa) this.chars = Math.min(total, this.chars + this.velocidad);
    const avanzar = E.pulsado.a || E.pulsado.b || !!E.toque || (this.auto && completa && this.t > this.auto);
    if (avanzar) {
      if (!completa) this.chars = total;
      else {
        if (!this.auto) sfx.texto();
        this.i++;
        this.chars = 0;
        this.t = 0;
        if (this.i >= this.paginas.length) {
          this.i = this.paginas.length - 1;
          this.chars = total;
          this.listo = true;
          return true;
        }
      }
    }
    return false;
  }

  completo() {
    return this.chars >= this.totalChars();
  }

  dibujar(ctx, flecha = true) {
    dibujarCajaTexto(ctx, this.pagina, Math.floor(this.chars), flecha && this.completo() && !this.listo);
  }
}

export function dibujarCajaTexto(ctx, pagina, chars = Infinity, flecha = false) {
  const h = 44;
  const y = P.alto - h - 2;
  const x = 3;
  const w = P.ancho - 6;
  if (pagina.quien) {
    const nw = anchoTexto(pagina.quien) + 14;
    caja(ctx, x + 4, y - 15, nw, 18, { marco: '#e890a8' });
    escribir(ctx, pagina.quien, x + 11, y - 11);
  }
  caja(ctx, x, y, w, h);
  let resto = chars;
  pagina.lineas.forEach((l, i) => {
    const visible = l.slice(0, Math.max(0, resto));
    resto -= l.length;
    escribir(ctx, visible, x + 12, y + 8 + i * (ALTO_LINEA + 3));
  });
  if (flecha && Math.floor(Date.now() / 300) % 2 === 0) {
    const fx = x + w - 16;
    const fy = y + h - 13;
    ctx.fillStyle = '#e04860';
    ctx.fillRect(fx, fy, 7, 1);
    ctx.fillRect(fx + 1, fy + 1, 5, 1);
    ctx.fillRect(fx + 2, fy + 2, 3, 1);
    ctx.fillRect(fx + 3, fy + 3, 1, 1);
  }
}

// ------------------------------------------------------------------ Elección

export class Eleccion {
  constructor(opciones, { x = null, y = null, cancelable = true, inicial = 0, ancho = null } = {}) {
    this.opciones = opciones;
    this.cancelable = cancelable;
    this.sel = inicial;
    this.listo = false;
    this.resultado = null;
    this.px = x;
    this.py = y;
    this.anchoFijo = ancho;
  }

  geometria() {
    const w = this.anchoFijo || Math.max(...this.opciones.map((o) => anchoTexto(o))) + 30;
    const h = this.opciones.length * 15 + 12;
    const x = this.px ?? P.ancho - w - 4;
    const y = this.py ?? P.alto - 50 - h;
    return { x, y, w, h };
  }

  actualizar() {
    if (this.listo) return true;
    const n = this.opciones.length;
    if (E.pulsado.arr) {
      this.sel = (this.sel + n - 1) % n;
      sfx.cursor();
    }
    if (E.pulsado.abj) {
      this.sel = (this.sel + 1) % n;
      sfx.cursor();
    }
    if (E.toque) {
      const { x, y, w } = this.geometria();
      for (let i = 0; i < n; i++) {
        if (dentro(E.toque, x, y + 5 + i * 15, w, 15)) {
          this.sel = i;
          return this.elegir(i);
        }
      }
      return false;
    }
    if (E.pulsado.a) return this.elegir(this.sel);
    if (E.pulsado.b && this.cancelable) {
      sfx.cancelar();
      this.resultado = -1;
      this.listo = true;
      return true;
    }
    return false;
  }

  elegir(i) {
    sfx.aceptar();
    this.resultado = i;
    this.listo = true;
    return true;
  }

  dibujar(ctx) {
    const { x, y, w, h } = this.geometria();
    caja(ctx, x, y, w, h);
    this.opciones.forEach((o, i) => {
      const ty = y + 8 + i * 15;
      if (i === this.sel) escribir(ctx, '▶', x + 8, ty, '#e04860', COL.sombra);
      escribir(ctx, o, x + 18, ty);
    });
  }
}

// ------------------------------------------------------------------ Guiones
// Un guion es una función generadora que va "cediendo" tareas
// (diálogos, elecciones, esperas...) y recibe su resultado.

export class Guion {
  constructor(generador) {
    this.gen = generador;
    this.tarea = null;
    this.terminado = false;
    this.siguiente(undefined);
  }

  siguiente(valor) {
    let r;
    try {
      r = this.gen.next(valor);
    } catch (e) {
      console.error(e);
      this.terminado = true;
      this.tarea = null;
      return;
    }
    if (r.done) {
      this.terminado = true;
      this.tarea = null;
    } else {
      this.tarea = r.value;
    }
  }

  actualizar() {
    if (this.terminado) return true;
    if (!this.tarea) {
      this.siguiente(undefined);
      return this.terminado;
    }
    if (this.tarea.actualizar()) {
      const res = this.tarea.resultado;
      this.siguiente(res);
    }
    return this.terminado;
  }

  dibujar(ctx) {
    if (this.tarea && this.tarea.dibujar) this.tarea.dibujar(ctx);
  }
}

export function decir(mensajes, opciones) {
  return new Dialogo(mensajes, opciones);
}

export function elegir(opciones, conf) {
  return new Eleccion(opciones, conf);
}

// Pregunta: muestra el texto y, al terminar de escribirse, las opciones.
export function preguntar(texto, opciones = ['Sí', 'No'], conf = {}) {
  const d = new Dialogo(texto);
  const el = new Eleccion(opciones, { cancelable: true, ...conf });
  return {
    resultado: null,
    actualizar() {
      if (!d.completo() || d.i < d.paginas.length - 1) {
        d.actualizar();
        return false;
      }
      if (el.actualizar()) {
        this.resultado = el.resultado < 0 ? opciones.length - 1 : el.resultado;
        return true;
      }
      return false;
    },
    dibujar(ctx) {
      const opciones = d.completo() && d.i >= d.paginas.length - 1;
      d.dibujar(ctx, !opciones);
      if (opciones) el.dibujar(ctx);
    },
  };
}

export function esperar(frames) {
  let t = 0;
  return {
    actualizar: () => ++t >= frames,
  };
}

// Tarea que dura hasta que fn devuelva true (se llama una vez por paso).
export function mientras(fn, dibujar) {
  let t = 0;
  return {
    actualizar: () => !!fn(t++),
    dibujar,
  };
}

// Espera a que se pulse A o se toque la pantalla.
export function esperarBoton() {
  return {
    actualizar: () => E.pulsado.a || E.pulsado.b || !!E.toque,
  };
}
