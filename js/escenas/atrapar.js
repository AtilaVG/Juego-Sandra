// Cenas de chef Alex: atrapar al vuelo los ingredientes buenos con el bol.
import { P } from '../motor/pantalla.js';
import { E } from '../motor/entrada.js';
import { escribirCentrado } from '../motor/fuente.js';
import { sfx } from '../motor/audio.js';
import { rect, elipse, circulo, poligono, figura } from '../motor/dibujo.js';
import { crearPersona } from '../arte/personas.js';
import { capaFondo, dibujarCielo } from '../arte/escenario.js';
import { Minijuego, marcador } from './minijuego.js';

const OBJETIVO = 15;
const SUELO = 176;

const DIBUJOS = {
  salmon(c) {
    rect(c, 1, 4, 14, 8, '#f88a5a');
    for (let x = 3; x < 14; x += 3) rect(c, x, 5, 1, 6, '#ffd0b0');
  },
  aguacate(c) {
    elipse(c, 8, 8, 6, 7, '#3a6a2a');
    elipse(c, 8, 8.5, 4.5, 5.5, '#d8e890');
    circulo(c, 8, 10, 2.4, '#8a5a30');
  },
  bao(c) {
    elipse(c, 8, 8, 7, 5, '#f8f4ec');
    rect(c, 2, 8, 12, 1, '#d84a3a');
    rect(c, 3, 9, 10, 1, '#60b040');
  },
  pepino(c) {
    circulo(c, 8, 8, 6, '#3a8a3a');
    circulo(c, 8, 8, 4.6, '#c8f0a0');
    rect(c, 7, 7, 2, 2, '#f8fff0');
  },
  perrito(c) {
    elipse(c, 8, 9, 7, 4, '#e8b060');
    elipse(c, 8, 7.5, 6, 2, '#c84830');
    rect(c, 3, 6, 10, 1, '#f8d030');
  },
  guindilla(c) {
    poligono(c, [2, 5, 13, 7, 14, 10, 4, 9], '#2a2020');
    rect(c, 12, 4, 3, 2, '#3a5a2a');
  },
  calcetin(c) {
    rect(c, 5, 1, 6, 9, '#d0d0d8');
    rect(c, 5, 8, 10, 5, '#d0d0d8');
    rect(c, 5, 1, 6, 2, '#5a8af0');
  },
};
const BUENOS = ['salmon', 'aguacate', 'bao', 'pepino', 'perrito'];
const MALOS = ['guindilla', 'calcetin'];

const cache = new Map();
function icono(id) {
  if (!cache.has(id)) cache.set(id, figura(16, 16, (c) => DIBUJOS[id](c)));
  return cache.get(id);
}

export class EscenaAtrapar extends Minijuego {
  constructor(av, opciones) {
    super(av, opciones);
    this.x = P.ancho / 2;
    this.dir = 1;
    this.cosas = [];
    this.puntos = 0;
    this.siguiente = 30;
    this.textos = [];
  }

  empezar() {
    this.bocadillo = { texto: 'Atrapa con el bol todo lo bueno. ¡Lo quemado y mis calcetines, no!', t: 240 };
  }

  jugar() {
    const vel = 2.4;
    if (E.mantenido.izq) {
      this.x -= vel;
      this.dir = -1;
    }
    if (E.mantenido.der) {
      this.x += vel;
      this.dir = 1;
    }
    if (E.puntero.abajo) {
      const d = E.puntero.x - this.x;
      if (Math.abs(d) > 2) {
        this.x += Math.sign(d) * Math.min(vel * 1.2, Math.abs(d));
        this.dir = Math.sign(d);
      }
    }
    this.x = Math.max(12, Math.min(P.ancho - 12, this.x));

    if (--this.siguiente <= 0) {
      const malo = Math.random() < 0.22;
      const lista = malo ? MALOS : BUENOS;
      this.cosas.push({
        id: lista[Math.floor(Math.random() * lista.length)],
        malo,
        x: 12 + Math.random() * (P.ancho - 24),
        y: 18,
        vy: 0.7 + Math.min(0.8, this.puntos * 0.05) + Math.random() * 0.3,
        fase: Math.random() * 6,
      });
      this.siguiente = Math.max(26, 52 - this.puntos * 2);
    }

    const bolY = SUELO - 30;
    for (const c of this.cosas) {
      c.y += c.vy;
      c.fase += 0.08;
      if (!c.fuera && c.y + 8 >= bolY && c.y < bolY + 6 && Math.abs(c.x - this.x) < 15) {
        c.fuera = true;
        if (c.malo) {
          sfx.dano();
          this.puntos = Math.max(0, this.puntos - 1);
          this.textos.push({ x: this.x, y: bolY - 10, texto: c.id === 'calcetin' ? '¡Mi calcetín!' : '¡Puaj!', t: 50, color: '#d03050' });
        } else {
          sfx.beso();
          this.puntos++;
          this.textos.push({ x: this.x, y: bolY - 10, texto: '+1', t: 30, color: '#20a040' });
          if (this.puntos >= OBJETIVO) this.ganar('¡Cena lista! Chef Sandra y chef Alex.');
        }
      }
      if (c.y > SUELO + 10) c.fuera = true;
    }
    this.cosas = this.cosas.filter((c) => !c.fuera);
  }

  pintar(ctx) {
    dibujarCielo(ctx, 'cocina', P.ancho, P.alto);
    ctx.drawImage(capaFondo('cocina', 0), 0, 0);
    ctx.drawImage(capaFondo('cocina', 1), -20, 0);
    for (let x = 0; x < P.ancho; x += 16) {
      rect(ctx, x, SUELO, 8, 8, '#f0f0f0');
      rect(ctx, x + 8, SUELO, 8, 8, '#383840');
      rect(ctx, x, SUELO + 8, 8, 8, '#383840');
      rect(ctx, x + 8, SUELO + 8, 8, 8, '#f0f0f0');
    }

    // Alex cocinando y lanzando cosas.
    const alex = crearPersona('alex');
    ctx.drawImage(alex.izq[Math.floor(this.t / 20) % 2 ? 1 : 0], P.ancho - 22, SUELO - 23);
    rect(ctx, P.ancho - 34, SUELO - 12, 10, 2, '#303038');

    for (const c of this.cosas) ctx.drawImage(icono(c.id), Math.round(c.x - 8 + Math.sin(c.fase) * 2), Math.round(c.y));

    // Sandra con el bol encima de la cabeza.
    const s = crearPersona('sandra');
    const x = Math.round(this.x);
    elipse(ctx, x, SUELO - 1, 7, 2, 'rgba(0,0,0,0.2)');
    ctx.drawImage(s.abajo[Math.floor(this.t / 10) % 3 === 0 && (E.mantenido.izq || E.mantenido.der) ? 1 : 0], x - 8, SUELO - 23);
    const by = SUELO - 30;
    ctx.fillStyle = '#e8f0f8';
    ctx.beginPath();
    ctx.ellipse(x, by, 14, 8, 0, 0, Math.PI);
    ctx.fill();
    rect(ctx, x - 14, by - 1, 28, 2, '#ffffff');
    rect(ctx, x - 9, by + 5, 18, 1, '#c0d0e0');

    for (const t of this.textos) {
      t.t--;
      t.y -= 0.5;
      escribirCentrado(ctx, t.texto, t.x, t.y, t.color, '#ffffff');
    }
    this.textos = this.textos.filter((t) => t.t > 0);

    marcador(ctx, 'Ingredientes: ' + this.puntos + '/' + OBJETIVO);
  }
}
