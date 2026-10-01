// Fotos guardadas durante el juego (por ejemplo, Alex maquillado) para el álbum.
import { estado } from '../motor/guardado.js';

const imagenes = new Map();

export function fotoRecuerdo(id) {
  const url = estado.fotos && estado.fotos[id];
  if (!url) return null;
  let img = imagenes.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    imagenes.set(url, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}
