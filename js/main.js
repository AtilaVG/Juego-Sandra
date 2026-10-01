// Arranque del juego y bucle principal (60 actualizaciones por segundo).
import { iniciarPantalla, presentar } from './motor/pantalla.js';
import { iniciarEntrada, pasoEntrada, alPrimerGesto } from './motor/entrada.js';
import { iniciarAudio, setSilencio } from './motor/audio.js';
import { cargar, estado } from './motor/guardado.js';
import { juego } from './juego.js';
import { EscenaTitulo } from './escenas/titulo.js';
import { EscenaMundo } from './escenas/mundo.js';
import { EscenaCombate } from './escenas/combate.js';
import { EscenaPlataformas } from './escenas/plataformas.js';
import { EscenaFinal } from './escenas/final.js';
import { EscenaMedalla } from './escenas/medalla.js';
import { EscenaIntro } from './escenas/intro.js';
import { aventura } from './datos/aventuras.js';

const canvas = document.getElementById('pantalla');
const ctx = iniciarPantalla(canvas);
iniciarEntrada(canvas);
cargar();
setSilencio(!estado.sonido);
alPrimerGesto(iniciarAudio);

// Atajos para probar escenas sueltas: ?prueba=nivel:piscina, combate:flamenco, mundo, final...
function escenaInicial() {
  const prueba = new URLSearchParams(location.search).get('prueba');
  if (!prueba) return new EscenaTitulo();
  const [tipo, arg] = prueba.split(':');
  if (tipo === 'nivel') return new EscenaPlataformas(aventura(arg), { alGanar: () => juego.cambiar(new EscenaMundo()) });
  if (tipo === 'combate') return new EscenaCombate(arg, { alGanar: () => juego.cambiar(new EscenaMundo()) });
  if (tipo === 'medalla') return new EscenaMedalla(aventura(arg));
  if (tipo === 'mundo') return new EscenaMundo();
  if (tipo === 'intro') return new EscenaIntro();
  if (tipo === 'final') return new EscenaFinal();
  return new EscenaTitulo();
}

juego.ponerYa(escenaInicial());

const PASO = 1000 / 60;
let acumulado = 0;
let anterior = performance.now();

function bucle(ahora) {
  acumulado += Math.min(250, ahora - anterior);
  anterior = ahora;
  let pasos = 0;
  while (acumulado >= PASO && pasos < 5) {
    pasoEntrada();
    juego.actualizar();
    acumulado -= PASO;
    pasos++;
  }
  if (pasos === 5) acumulado = 0;
  juego.dibujar(ctx);
  presentar();
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);

window.__juego = juego;
