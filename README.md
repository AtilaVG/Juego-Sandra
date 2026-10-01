# Sandra · Edición Valdemoro

Un juego con el arte de Pokémon Blanco y Negro y niveles al estilo Super Mario,
hecho con las aventuras de Alex y Sandra.

- **Pueblo (Valdemoro):** vista desde arriba como en Pokémon. Alex te sigue y te da pistas.
- **10 aventuras:** niveles de plataformas (piscina, láser tag, Thyssen, series, cumple,
  comida con Begoña y David, la uni, las cenas, la casa rural en Cuevas del Valle y
  Madrid al atardecer).
- **Combates:** al final de cada aventura, Laila lucha por turnos contra un jefe.
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

Los textos y mapas de cada aventura están en `js/datos/aventuras.js`, y los jefes en `js/datos/jefes.js`.

## Probarlo en el ordenador

No hace falta instalar nada: es HTML y JavaScript sin dependencias.

```sh
npx http-server .
```

Atajos para probar partes sueltas: `?prueba=mundo`, `?prueba=nivel:piscina`,
`?prueba=combate:flamenco`, `?prueba=final`.

## Publicar con GitHub Pages

En el repositorio: *Settings → Pages → Build and deployment → Deploy from a branch*,
rama `main` y carpeta `/ (root)`. A los pocos minutos estará en
`https://atilavg.github.io/Juego-Sandra/`.
