# Sandra · Edición Valdemoro

Un juego con el arte de Pokémon Blanco y Negro y niveles al estilo Super Mario,
hecho con las aventuras de Alex y Sandra.

- **Pueblo (Valdemoro):** vista desde arriba como en Pokémon. Alex te sigue y te da pistas.
- **11 aventuras**, cada una con su forma de jugar:
  - Plataformas tipo Mario: piscina, casa rural en Cuevas del Valle y Madrid al atardecer.
  - Láser tag: galería de tiro (¡a Bea no, que va en tu equipo!).
  - Thyssen: escapar del vigilante en un laberinto y hacer tartas de queso en Luna and Wanda.
  - Noche de series: encontrar el mando que Laila esconde debajo de los cojines (como los trileros).
  - Cumple: repetir el orden de las velas de la tarta y cantar el cumpleaños feliz.
  - Comida con Begoña y David: darle una patadita a Alex por debajo de la mesa cuando va a meter la pata.
  - Noche de maquillaje: maquillar a Alex con el dedo (la foto se guarda en el álbum).
  - La uni: examen tipo test sobre vosotros.
  - Cenas: atrapar al vuelo los ingredientes.
- **Combates:** al final de muchas aventuras, Laila lucha por turnos contra un jefe.
- **Final:** Templo de Debod, pizza en el Vesubio, Salón de la Fama y la pista del regalo.

## Cómo se juega

| Acción | iPad (táctil) | Teclado |
| --- | --- | --- |
| Moverse | Cruceta | Flechas o WASD |
| Saltar / hablar / aceptar | A | Espacio, Intro o Z |
| Volver / pista de Alex | B | X o Esc |
| Menú | MENÚ | M |

También se puede tocar la pantalla para pasar los textos y elegir opciones.
En el iPad, desde Safari: *Compartir → Añadir a pantalla de inicio* para abrirlo a pantalla completa.
La partida se guarda sola en el propio dispositivo.

## Personalizar

Casi todo lo personal está en `js/datos/config.js`:

- `CLAVE`: la pregunta del principio (por defecto "¿Cómo te llama Alex?" → BEBE).
- `PISTA_REGALO`: la pista del regalo que sale al final.
- `CARTA_FINAL`: el mensaje de Alex en el Templo de Debod.
- `PERSONAJES` y `LAILA`: colores y aspecto de cada personaje.

Los textos, mapas y fases de cada aventura están en `js/datos/aventuras.js`, los jefes en `js/datos/jefes.js`
y las preguntas del examen en `js/datos/examen.js`.

## Probarlo en el ordenador

No hace falta instalar nada: es HTML y JavaScript sin dependencias.

```sh
npx http-server .
```

Atajos para probar partes sueltas: `?prueba=mundo`, `?prueba=nivel:piscina`,
`?prueba=combate:flamenco`, `?prueba=aventura:thyssen`, `?prueba=mini:tartas-thyssen`, `?prueba=final`.

## Publicar con GitHub Pages

En el repositorio: *Settings → Pages → Build and deployment → Deploy from a branch*,
rama `main` y carpeta `/ (root)`. A los pocos minutos estará en
`https://atilavg.github.io/Juego-Sandra/`.
