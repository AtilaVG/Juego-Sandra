// El final: atardecer en el Templo de Debod, pizza en el Vesubio,
// Salón de la Fama y la pista del regalo.
import { P } from '../motor/pantalla.js';
import { escribir, escribirCentrado } from '../motor/fuente.js';
import { Guion, decir, esperar, mientras, esperarBoton } from '../motor/ui.js';
import { musica, sfx } from '../motor/audio.js';
import { rect, circulo, elipse, mezclar } from '../motor/dibujo.js';
import { estado, guardar } from '../motor/guardado.js';
import { crearPersona } from '../arte/personas.js';
import { lailaMundo } from '../arte/bichos.js';
import { temploDebod, beso } from '../arte/escenario.js';
import { medalla } from '../arte/medallas.js';
import { AVENTURAS } from '../datos/aventuras.js';
import { CARTA_FINAL, PISTA_REGALO, FECHA } from '../datos/config.js';
import { MUSICA } from '../datos/musica.js';
import { juego } from '../juego.js';
import { entregarMedalla } from './medalla.js';
import { EscenaMundo } from './mundo.js';

const A = (texto) => ({ quien: 'Alex', texto });

export class EscenaFinal {
  constructor() {
    this.t = 0;
    this.fase = 'medalla';
    this.sol = 0; // 0..1 cuánto se ha puesto el sol
    this.fundido = 0;
    this.estrellas = Array.from({ length: 40 }, (_, i) => ({ x: (i * 73) % 400, y: (i * 37) % 90 }));
    this.guion = new Guion(this.secuencia());
  }

  entrar() {
    musica(MUSICA.medalla);
  }

  *transicion(siguiente) {
    yield mientras(() => (this.fundido = Math.min(1, this.fundido + 0.04)) >= 1);
    this.fase = siguiente;
    yield esperar(10);
    yield mientras(() => (this.fundido = Math.max(0, this.fundido - 0.04)) <= 0);
  }

  *secuencia() {
    const av = AVENTURAS.find((a) => a.id === 'madrid');
    entregarMedalla(av);
    yield esperar(30);
    yield decir('¡SANDRA ha conseguido la MEDALLA ATARDECER!');
    yield decir('¡Ya tienes las 9 medallas!');

    yield* this.transicion('debod');
    musica(MUSICA.atardecer);
    yield esperar(60);
    yield decir(['Y así, al atardecer, en el Templo de Debod...']);
    yield decir(CARTA_FINAL.map(A));
    yield mientras(() => (this.sol = Math.min(1, this.sol + 0.004)) >= 1);
    yield esperar(40);

    yield* this.transicion('vesubio');
    yield decir(['Más tarde... en la pizzería Vesubio.']);
    yield decir([A('Y para terminar el día perfecto... ¡pizza!'), A('Por todas las aventuras que nos quedan por vivir juntos.')]);
    sfx.campana();

    yield* this.transicion('fama');
    musica(MUSICA.titulo);
    sfx.subirNivel();
    yield esperar(60);
    yield decir(['¡ENHORABUENA!', 'SANDRA, ALEX y LAILA han entrado en el SALÓN DE LA FAMA.']);

    yield* this.transicion('regalo');
    musica(MUSICA.intro);
    yield esperar(30);
    yield decir([A('Una última cosa, bebe...'), ...PISTA_REGALO.map(A)]);

    yield* this.transicion('creditos');
    estado.finalVisto = true;
    guardar();
    yield esperar(120);
    yield esperarBoton();
    juego.cambiar(new EscenaMundo({ puerta: 'estacion' }));
    yield esperar(9999);
  }

  actualizar() {
    this.t++;
    this.guion.actualizar();
  }

  dibujar(ctx) {
    const f = this.fase;
    if (f === 'medalla') this.dibujarMedalla(ctx);
    else if (f === 'debod') this.dibujarDebod(ctx);
    else if (f === 'vesubio') this.dibujarVesubio(ctx);
    else if (f === 'fama') this.dibujarFama(ctx);
    else if (f === 'regalo') this.dibujarRegalo(ctx);
    else this.dibujarCreditos(ctx);
    if (this.fundido > 0) {
      ctx.globalAlpha = this.fundido;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, P.ancho, P.alto);
      ctx.globalAlpha = 1;
    }
    this.guion.dibujar(ctx);
  }

  dibujarMedalla(ctx) {
    ctx.fillStyle = '#f8c8a0';
    ctx.fillRect(0, 0, P.ancho, P.alto);
    const cx = P.ancho / 2;
    const m = medalla('madrid');
    ctx.drawImage(m, cx - 36, 30, 72, 72);
    escribirCentrado(ctx, 'MEDALLA ATARDECER', cx, 112, '#8a2a4a', '#fff4e8');
  }

  dibujarDebod(ctx) {
    const s = this.sol;
    const horizonte = 104;
    const arriba = mezclar('#6a5aa8', '#1a1a48', s);
    const medio = mezclar('#f87a68', '#6a3a78', s);
    const abajo = mezclar('#ffd090', '#c8607a', s);
    const g = ctx.createLinearGradient(0, 0, 0, horizonte);
    g.addColorStop(0, arriba);
    g.addColorStop(0.6, medio);
    g.addColorStop(1, abajo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.ancho, horizonte);
    if (s > 0.4) {
      ctx.globalAlpha = (s - 0.4) / 0.6;
      for (const e of this.estrellas) if (e.x < P.ancho) rect(ctx, e.x, e.y, 1, 1, '#ffffff');
      ctx.globalAlpha = 1;
    }
    const cx = P.ancho / 2;
    // Sol bajando hasta esconderse.
    const solY = 50 + s * 64;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, P.ancho, horizonte);
    ctx.clip();
    circulo(ctx, cx + 60, solY, 18, '#ffe8a0');
    circulo(ctx, cx + 60, solY, 14, '#fff6d0');
    ctx.restore();
    // Templo y estanque con reflejo.
    const d = temploDebod();
    const tx = Math.round(cx + 20 - d.width / 2);
    ctx.drawImage(d, tx, horizonte - d.height);
    ctx.fillStyle = mezclar('#c87a8a', '#3a2a5a', s);
    ctx.fillRect(0, horizonte, P.ancho, 40);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, horizonte, P.ancho, 40);
    ctx.clip();
    ctx.globalAlpha = 0.35;
    ctx.translate(0, horizonte * 2);
    ctx.scale(1, -1);
    ctx.drawImage(d, tx, horizonte - d.height);
    ctx.restore();
    for (let i = 0; i < 5; i++) rect(ctx, ((this.t / 2 + i * 70) % (P.ancho + 40)) - 20, horizonte + 6 + i * 7, 20, 1, 'rgba(255,255,255,0.3)');
    // Paseo en primer plano con Sandra y Alex de espaldas mirando el atardecer.
    ctx.fillStyle = mezclar('#c89868', '#4a3440', s);
    ctx.fillRect(0, horizonte + 38, P.ancho, P.alto);
    rect(ctx, 0, horizonte + 38, P.ancho, 2, mezclar('#e8c090', '#5a4450', s));
    const sa = crearPersona('sandra').arriba[0];
    const al = crearPersona('alex').arriba[0];
    const px = Math.round(cx - 100);
    ctx.drawImage(sa, px, 104, 24, 36);
    ctx.drawImage(al, px + 22, 104, 24, 36);
    if (Math.floor(this.t / 40) % 2 === 0) escribir(ctx, '♥', px + 19, 96, '#ff6a8a', null);
  }

  dibujarVesubio(ctx) {
    ctx.fillStyle = '#7a3a2a';
    ctx.fillRect(0, 0, P.ancho, P.alto);
    for (let x = 0; x < P.ancho; x += 16) for (let y = 0; y < 80; y += 16) rect(ctx, x + ((y / 16) % 2) * 8, y, 14, 14, '#8a4a32');
    rect(ctx, 0, 80, P.ancho, 4, '#f8d070');
    const cx = P.ancho / 2;
    escribirCentrado(ctx, 'PIZZERÍA VESUBIO', cx, 30, '#f8e0a0', '#3a1a10');
    // Mesa y pizza.
    elipse(ctx, cx, 150, 90, 30, '#f8f8f8');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rect(ctx, cx + Math.cos(a) * 82, 150 + Math.sin(a) * 26, 6, 3, '#e04848');
    }
    circulo(ctx, cx, 146, 26, '#e8b060');
    circulo(ctx, cx, 146, 22, '#e85838');
    for (const [dx, dy] of [[-10, -8], [8, -10], [12, 6], [-6, 10], [0, 0], [-14, 4]]) circulo(ctx, cx + dx, 146 + dy, 3, '#b83020');
    for (const [dx, dy] of [[-4, -12], [14, -2], [-12, 12], [6, 12]]) rect(ctx, cx + dx, 146 + dy, 3, 2, '#58a040');
    const sa = crearPersona('sandra').abajo[0];
    const al = crearPersona('alex').abajo[0];
    ctx.drawImage(sa, cx - 100, 86, 32, 48);
    ctx.drawImage(al, cx + 68, 86, 32, 48);
  }

  dibujarFama(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, P.alto);
    g.addColorStop(0, '#2a2060');
    g.addColorStop(1, '#8a4aa0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, P.ancho, P.alto);
    for (let i = 0; i < 20; i++) {
      const x = (i * 53 + this.t) % P.ancho;
      const y = (i * 29 + this.t * (1 + (i % 3))) % P.alto;
      rect(ctx, x, y, 2, 2, ['#f8d030', '#ff8ab0', '#8ad8ff'][i % 3]);
    }
    const cx = P.ancho / 2;
    escribirCentrado(ctx, 'SALÓN DE LA FAMA', cx, 8, '#f8d030', '#3a1a10', 2);
    elipse(ctx, cx, 112, 80, 12, '#c8a0e0');
    const salto = (k) => Math.abs(Math.sin(this.t / 12 + k)) * 6;
    ctx.drawImage(crearPersona('sandra').abajo[0], cx - 50, 64 - salto(0), 32, 48);
    ctx.drawImage(crearPersona('alex').abajo[0], cx - 10, 64 - salto(1), 32, 48);
    ctx.drawImage(lailaMundo(Math.floor(this.t / 20) % 2), cx + 26, 82 - salto(2), 28, 28);
    AVENTURAS.forEach((av, i) => ctx.drawImage(medalla(av.id), cx - (AVENTURAS.length * 26) / 2 + i * 26, 124));
  }

  dibujarRegalo(ctx) {
    ctx.fillStyle = '#fbe8f0';
    ctx.fillRect(0, 0, P.ancho, P.alto);
    const cx = P.ancho / 2;
    const bote = Math.abs(Math.sin(this.t / 15)) * 6;
    rect(ctx, cx - 24, 70 - bote, 48, 40, '#e8405e');
    rect(ctx, cx - 28, 60 - bote, 56, 12, '#f05a76');
    rect(ctx, cx - 4, 60 - bote, 8, 50, '#f8d030');
    circulo(ctx, cx - 9, 56 - bote, 7, '#f8d030');
    circulo(ctx, cx + 9, 56 - bote, 7, '#f8d030');
    escribirCentrado(ctx, 'TU REGALO', cx, 20, '#d03050', '#ffffff', 2);
  }

  dibujarCreditos(ctx) {
    ctx.fillStyle = '#101018';
    ctx.fillRect(0, 0, P.ancho, P.alto);
    const cx = P.ancho / 2;
    escribirCentrado(ctx, 'FIN', cx, 22, '#f8d030', null, 3);
    escribirCentrado(ctx, 'Hecho con muchísimo amor', cx, 70, '#ffffff', null);
    escribirCentrado(ctx, 'por Alex (tu abuelete)', cx, 84, '#ffffff', null);
    escribirCentrado(ctx, 'para Sandra (su bebe)', cx, 98, '#ff8ab0', null);
    escribirCentrado(ctx, FECHA + ' · feliz mesario ♥', cx, 122, '#f8d030', null);
    ctx.drawImage(beso(), cx - 6, 140);
    escribirCentrado(ctx, 'Besos recogidos: ' + estado.besos, cx, 154, '#a0a0b8', null);
    if (this.t % 60 < 40) escribirCentrado(ctx, 'Pulsa para volver a Valdemoro', cx, 174, '#606078', null);
  }
}

