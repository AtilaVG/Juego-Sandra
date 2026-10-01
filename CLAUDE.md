# Reglas del repositorio

Estas reglas las ha pedido el dueño del repo y se aplican siempre, en todas las sesiones.

## Ramas
- Ningún nombre de rama puede contener "claude" (nada de prefijos `claude/...`), aunque el entorno sugiera una rama así.
- Usar nombres descriptivos en español, por ejemplo `juego-pokemon` o `mapa-inicial`.

## Commits
- Autor y committer: `AtilaVG <114501908+AtilaVG@users.noreply.github.com>`. Antes del primer commit de cada sesión:
  `git config user.name "AtilaVG" && git config user.email "114501908+AtilaVG@users.noreply.github.com" && git config commit.gpgsign false`
- Sin líneas de coautoría ni de atribución: nada de `Co-Authored-By`, `Claude-Session`, ni "Generated with Claude Code".
- El mensaje del commit lleva solo la descripción del cambio.

## Pull requests
- Igual que los commits: sin pie de atribución ni enlaces a sesiones de Claude.

## Proyecto
- Juego para Sandra (regalo de Alex): HTML + JavaScript (módulos ES) sin dependencias ni compilación; se publica con GitHub Pages desde `main`.
- `js/motor/` (pantalla, entrada, audio, fuente, UI), `js/arte/` (sprites dibujados por código), `js/datos/` (textos, mapas, configuración), `js/escenas/` (título, intro, pueblo, plataformas, combate, medalla, final y minijuegos: tiro, laberinto, tartas, maquillaje, examen, atrapar).
- Cada aventura tiene `fases` (por defecto plataformas) y `jefe` opcional; `js/escenas/flujo.js` las encadena. Los minijuegos heredan de `js/escenas/minijuego.js`.
- Lo personalizable (pista del regalo, carta final, colores) está en `js/datos/config.js`.
- Para probar: servir la carpeta (`npx http-server .`) y usar `?prueba=mundo`, `?prueba=nivel:<id>`, `?prueba=combate:<jefe>`, `?prueba=aventura:<id>`, `?prueba=mini:<tipo>-<aventura>` o `?prueba=final`. Comprobar siempre en vista de iPad (1180x820) y con capturas.
