// Comida con Begoña y David: Alex está nervioso y suelta cosas. Si va a meter la pata,
// Sandra le da una patadita por debajo de la mesa antes de que acabe la frase.
// Si dice algo bonito, hay que dejarle terminar.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribirCentrado, envolver, escribir, anchoTexto } from '../motor/fuente.js';
import { caja } from '../motor/ui.js';
import { sfx } from '../motor/audio.js';
import { rect, elipse, circulo, poligono } from '../motor/dibujo.js';
import { crearPersona } from '../arte/personas.js';
import { lailaMundo } from '../arte/bichos.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { Minijuego, barra } from './minijuego.js';

// malo: hay que darle la patadita. arreglo: lo que dice Alex después del "¡AY!".
const FRASES = [
  { texto: 'Begoña, ¿estas croquetas son del Mercadona?', malo: true, arreglo: '...digo, ¡qué croquetas más caseras!' },
  { texto: 'Begoña, estas croquetas están de muerte.' },
  { texto: '¿Me pasáis el kétchup para echárselo a la paella?', malo: true, arreglo: '...digo, ¡la paella está perfecta así!' },
  { texto: 'Qué casa más bonita tenéis.' },
  { texto: '¿Os cuento lo que hizo Sandra la última vez que salimos de fiesta?', malo: true, arreglo: '...¡nada! No hizo nada. Muy formal todo.' },
  { texto: 'Sandra me ha hablado muy bien de vosotros.' },
  { texto: 'Uy, ¿y ese cuadro tan raro que tenéis ahí colgado?', malo: true, arreglo: '...¡qué cuadro más bonito!, quería decir.' },
  { texto: '¿Os ayudo luego a recoger la mesa?' },
  { texto: 'Yo es que la verdura, sinceramente, ni verla.', malo: true, arreglo: '...¡me encanta la verdura! ¿Me pongo más?' },
  { texto: 'David, ¿me pasas el pan, por favor?' },
  { texto: 'Sandra me llama abuelete porque a las diez ya estoy roncando.', malo: true, arreglo: '...¡súper activo! Siempre.' },
  { texto: 'Sandra es lo mejor que me ha pasado.' },
  { texto: 'Pues el otro día casi quemo la cocina haciendo la cena.', malo: true, arreglo: '...¡una cena riquísima! Sin fuego. Todo bien.' },
  { texto: 'Laila hoy está preciosa. Me ha bufado, pero con cariño.' },
];

// Baraja sin que salgan más de dos del mismo tipo seguidas.
function mezclar(lista) {
  const r = lista.slice().sort(() => Math.random() - 0.5);
  for (let i = 2; i < r.length; i++) {
    if (!!r[i].malo === !!r[i - 1].malo && !!r[i].malo === !!r[i - 2].malo) {
      const j = r.findIndex((f, k) => k > i && !!f.malo !== !!r[i].malo);
      if (j > 0) [r[i], r[j]] = [r[j], r[i]];
    }
  }
  return r;
}

const META = 100;
const SUBE = 15;
const BAJA = 10;
const MESA = 124;

export class EscenaPatadita extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.puntos = 30;
    this.cola = [];
    this.estado = 'espera';
    this.emotes = [];
    this.patada = 0;
    this.pam = 0;
  }

  empezar() {
    this.bocadillo = null;
    this.siguiente();
  }

  // Coge la siguiente frase (la primera siempre es la de las croquetas del Mercadona).
  siguiente() {
    if (!this.cola.length) this.cola = this.frase ? mezclar(FRASES) : [FRASES[0], ...mezclar(FRASES.slice(1))];
    this.frase = this.cola.shift();
    this.letras = 0;
    this.margen = 0;
    this.estado = 'hablar';
    this.tEstado = 0;
    this.arreglo = null;
    this.resultado = null;
    // Al principio habla despacio; luego un poco más rápido.
    this.velocidad = Math.min(0.4, 0.26 + this.puntos / 1000);
  }

  jugar() {
    this.tEstado++;
    if (this.patada > 0) this.patada--;
    if (this.pam > 0) this.pam--;
    const quiere = E.pulsado.a || !!E.toque;

    if (this.estado === 'hablar') {
      const total = this.frase.texto.length;
      const antes = Math.floor(this.letras);
      this.letras = Math.min(total, this.letras + this.velocidad);
      if (Math.floor(this.letras) !== antes && antes % 3 === 0) sfx.texto();
      if (quiere) return this.patadita();
      // Margen de medio segundo cuando acaba la frase.
      if (this.letras >= total && ++this.margen > 30) this.terminarFrase();
      if (this.letras < total) this.margen = 0;
    } else if (this.estado === 'resultado') {
      if (this.tEstado > 110 || (this.tEstado > 40 && quiere)) {
        if (this.puntos >= META) this.ganar('¡Begoña y David están encantados contigo! (Y conmigo.)');
        else this.siguiente();
      }
    }
  }

  patadita() {
    this.patada = 18;
    this.pam = 26;
    sfx.golpe();
    if (this.frase.malo) {
      this.arreglo = this.frase.arreglo;
      this.cambiar(SUBE, '¡Salvado por los pelos!', '#20a040');
      this.emote(1, '!');
      this.emote(2, '♥');
    } else {
      this.arreglo = '¡AY! ¿Y eso por qué, bebe?';
      this.cambiar(-BAJA, 'Eso era bonito... ¡pobre Alex!', '#d03050');
      this.emote(1, '?');
      this.emote(2, '?');
    }
    this.estado = 'resultado';
    this.tEstado = 0;
  }

  terminarFrase() {
    if (this.frase.malo) {
      this.cambiar(-BAJA, 'Uf... silencio incómodo.', '#d03050');
      this.emote(1, '...');
      this.emote(2, '...');
      sfx.dano();
    } else {
      this.cambiar(SUBE, '¡A Begoña y a David les ha gustado!', '#20a040');
      this.emote(1, '♥');
      this.emote(2, '♥');
      sfx.beso();
    }
    this.estado = 'resultado';
    this.tEstado = 0;
  }

  cambiar(n, texto, color) {
    this.puntos = Math.max(0, Math.min(META, this.puntos + n));
    this.resultado = { texto, color };
  }

  emote(quien, texto) {
    this.emotes.push({ quien, texto, t: 90 });
  }

  // Posiciones (x de la izquierda de cada sprite a tamaño doble).
  sitios() {
    const cx = P.ancho / 2;
    return { sandra: cx - 112, alex: cx - 76, begona: cx + 40, david: cx + 76 };
  }

  pintar(ctx) {
    const cx = P.ancho / 2;
    const s = this.sitios();
    dibujarCielo(ctx, 'comedor', P.ancho, P.alto);
    ctx.drawImage(capaFondo('comedor', 0), Math.round(cx - 196), 0);

    // Medio cuerpo por encima de la mesa.
    const alexSalta = this.patada > 10 ? -3 : 0;
    const gente = [
      [crearPersona('sandra').der[0], s.sandra, 0],
      [crearPersona('alex').der[0], s.alex, alexSalta],
      [crearPersona('begona').izq[0], s.begona, 0],
      [crearPersona('david').izq[0], s.david, 0],
    ];
    for (const [img, x, dy] of gente) ctx.drawImage(img, Math.round(x), MESA - 34 + dy, 32, 48);

    // Debajo de la mesa: piernas, Laila y la patadita.
    rect(ctx, 0, MESA + 14, P.ancho, P.alto - MESA - 14, '#e0c49a');
    rect(ctx, 0, 176, P.ancho, P.alto - 176, '#c85a30');
    rect(ctx, 0, 176, P.ancho, 2, '#a84a28');
    const pierna = (x, color, zapato, dx = 0) => {
      rect(ctx, x + 10, MESA + 14, 5, 34, color);
      rect(ctx, x + 17 + dx, MESA + 14, 5, 34, color);
      rect(ctx, x + 9, MESA + 46, 7, 4, zapato);
      rect(ctx, x + 16 + dx, MESA + 46, 7, 4, zapato);
    };
    const datos = (n) => crearPersona(n).datos;
    // Sandra: la pierna derecha sale disparada hacia Alex.
    const ks = datos('sandra');
    rect(ctx, s.sandra + 10, MESA + 14, 5, 34, ks.pantalon);
    rect(ctx, s.sandra + 9, MESA + 46, 7, 4, ks.zapatos);
    if (this.patada > 0) {
      rect(ctx, s.sandra + 17, MESA + 14, 5, 18, ks.pantalon);
      rect(ctx, s.sandra + 17, MESA + 28, 24, 5, ks.pantalon);
      rect(ctx, s.sandra + 40, MESA + 26, 5, 8, ks.zapatos);
    } else {
      rect(ctx, s.sandra + 17, MESA + 14, 5, 34, ks.pantalon);
      rect(ctx, s.sandra + 16, MESA + 46, 7, 4, ks.zapatos);
    }
    const ka = datos('alex');
    pierna(s.alex + (this.patada > 10 ? 1 : 0), ka.pantalon, ka.zapatos);
    pierna(s.begona, datos('begona').pantalon, datos('begona').zapatos);
    pierna(s.david, datos('david').pantalon, datos('david').zapatos);
    ctx.drawImage(lailaMundo(Math.floor(this.t / 40) % 2), Math.round(cx - 12), 154, 24, 24);
    if (this.pam > 0) {
      const px = s.alex + 12;
      const py = MESA + 30;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        poligono(ctx, [px, py, px + Math.cos(a - 0.2) * 12, py + Math.sin(a - 0.2) * 12, px + Math.cos(a + 0.2) * 12, py + Math.sin(a + 0.2) * 12], '#f8d030');
      }
      escribirCentrado(ctx, '¡PAM!', px, py - 4, '#d03050', '#ffffff');
    }

    // La mesa con mantel y la comida.
    rect(ctx, 0, MESA, P.ancho, 14, '#f8f8f8');
    for (let x = 0; x < P.ancho; x += 8) circulo(ctx, x + 4, MESA + 14, 4, '#f8f8f8');
    for (let x = 0; x < P.ancho; x += 16) rect(ctx, x, MESA + 2, 8, 2, '#e04848');
    for (const [x, comida] of [[s.sandra + 24, 'croquetas'], [s.alex + 30, 'croquetas'], [cx, 'paella'], [s.begona + 2, 'croquetas'], [s.david + 4, 'pan']]) {
      elipse(ctx, x, MESA, 11, 3, '#ffffff');
      elipse(ctx, x, MESA, 11, 3, 'rgba(0,0,0,0.06)');
      if (comida === 'paella') {
        elipse(ctx, x, MESA - 2, 16, 4, '#383838');
        elipse(ctx, x, MESA - 3, 14, 3, '#f0c040');
        for (let k = -2; k <= 2; k++) circulo(ctx, x + k * 5, MESA - 4, 1.4, k % 2 ? '#e05040' : '#58a040');
      } else if (comida === 'pan') {
        elipse(ctx, x, MESA - 3, 8, 3, '#d8a050');
      } else for (let k = -1; k <= 1; k++) elipse(ctx, x + k * 6, MESA - 2, 3, 2, '#b8702a');
    }

    // Reacciones de Begoña y David.
    for (const em of this.emotes) {
      em.t--;
      const x = (em.quien === 1 ? s.begona : s.david) + 16;
      const y = MESA - 46 - Math.min(6, (90 - em.t) / 3);
      const w = anchoTexto(em.texto) + 12;
      caja(ctx, x - w / 2, y, w, 16, { marco: em.texto === '♥' ? '#f8a0c0' : '#c0c8d8' });
      escribirCentrado(ctx, em.texto, x, y + 3, em.texto === '♥' ? '#e04070' : '#404048');
    }
    this.emotes = this.emotes.filter((e) => e.t > 0);

    // Lo que dice Alex.
    if (this.frase) {
      const ancho = P.ancho - 16;
      let texto = this.frase.texto.slice(0, Math.floor(this.letras));
      if (this.arreglo) texto = texto + (this.frase.malo ? '... ¡AY! ' : ' ') + this.arreglo;
      const lineas = envolver(texto, ancho - 20);
      const h = Math.max(2, lineas.length) * 12 + 12;
      const y = 25;
      caja(ctx, 8, y, ancho, h, { marco: '#9ad8a8' });
      poligono(ctx, [s.alex + 12, y + h - 1, s.alex + 22, y + h - 1, s.alex + 14, y + h + 7], '#384058');
      poligono(ctx, [s.alex + 14, y + h - 3, s.alex + 20, y + h - 3, s.alex + 15, y + h + 4], '#f8f8f8');
      lineas.forEach((l, i) => escribir(ctx, l, 18, y + 5 + i * 12));
    }

    let abajo = null;
    if (this.resultado && this.estado === 'resultado') abajo = this.resultado;
    else if (this.estado === 'hablar') abajo = { texto: '¿Patadita? Pulsa A o toca', color: '#6a3a2a' };
    if (abajo && this.modo === 'jugando') {
      const w = anchoTexto(abajo.texto) + 16;
      caja(ctx, cx - w / 2, P.alto - 19, w, 18);
      escribirCentrado(ctx, abajo.texto, cx, P.alto - 15, abajo.color);
    }

    // Suegrómetro.
    const wl = anchoTexto('Suegrómetro');
    caja(ctx, 4, 4, wl + 96, 18);
    escribir(ctx, 'Suegrómetro', 10, 8);
    barra(ctx, wl + 16, 9, 78, 8, this.puntos / META, '#f06090');
  }
}
