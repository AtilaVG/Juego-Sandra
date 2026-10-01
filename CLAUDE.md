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
