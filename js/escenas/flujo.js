// Encadena las fases de una aventura → combate (si hay jefe) → medalla → pueblo (o el final).
import { juego } from '../juego.js';
import { EscenaPlataformas } from './plataformas.js';
import { EscenaCombate } from './combate.js';
import { EscenaMedalla } from './medalla.js';
import { EscenaFinal } from './final.js';
import { EscenaMundo } from './mundo.js';
import { EscenaTiro } from './tiro.js';
import { EscenaLaberinto } from './laberinto.js';
import { EscenaTartas } from './tartas.js';
import { EscenaExamen } from './examen.js';
import { EscenaAtrapar } from './atrapar.js';
import { EscenaMaquillaje } from './maquillaje.js';
import { EscenaMando } from './mando.js';
import { EscenaVelas } from './velas.js';
import { EscenaUnoPorCiento } from './porciento.js';
import { EscenaPictionary } from './pictionary.js';

export const ESCENAS = {
  plataformas: EscenaPlataformas,
  tiro: EscenaTiro,
  laberinto: EscenaLaberinto,
  tartas: EscenaTartas,
  examen: EscenaExamen,
  atrapar: EscenaAtrapar,
  maquillaje: EscenaMaquillaje,
  mando: EscenaMando,
  velas: EscenaVelas,
  porciento: EscenaUnoPorCiento,
  pictionary: EscenaPictionary,
};

export function fasesDe(av) {
  return (av.fases || [{ tipo: 'plataformas' }]).map((f) => (typeof f === 'string' ? { tipo: f } : f));
}

export function jugarAventura(av, repetir) {
  const fases = fasesDe(av);
  const volver = () => juego.cambiar(new EscenaMundo({ puerta: av.puerta }));
  const alFinal = () => juego.cambiar(av.id === 'madrid' && !repetir ? new EscenaFinal() : new EscenaMedalla(av, { repetir }));
  const despues = () => {
    if (av.jefe) juego.cambiar(new EscenaCombate(av.jefe, { alGanar: alFinal }), { color: '#ffffff', rapido: true });
    else alFinal();
  };
  const fase = (i) => {
    if (i >= fases.length) return despues();
    const Clase = ESCENAS[fases[i].tipo];
    juego.cambiar(new Clase(av, { alGanar: () => fase(i + 1), alSalir: volver, fase: fases[i] }));
  };
  fase(0);
}
