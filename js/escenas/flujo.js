// Encadena nivel → combate → medalla → pueblo (o el final).
import { juego } from '../juego.js';
import { EscenaPlataformas } from './plataformas.js';
import { EscenaCombate } from './combate.js';
import { EscenaMedalla } from './medalla.js';
import { EscenaFinal } from './final.js';
import { EscenaMundo } from './mundo.js';

export function jugarAventura(av, repetir) {
  juego.cambiar(
    new EscenaPlataformas(av, {
      alGanar: () =>
        juego.cambiar(
          new EscenaCombate(av.jefe, {
            alGanar: () => juego.cambiar(av.id === 'madrid' && !repetir ? new EscenaFinal() : new EscenaMedalla(av, { repetir })),
          }),
          { color: '#ffffff', rapido: true },
        ),
      alSalir: () => juego.cambiar(new EscenaMundo({ puerta: av.puerta })),
    }),
  );
}
