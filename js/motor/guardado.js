// Partida guardada en el propio iPad (localStorage).
const CLAVE = 'sandra-valdemoro-v1';

export function estadoInicial() {
  return {
    version: 1,
    claveAcertada: false,
    introVista: false,
    bienvenidaVista: false,
    nivelActual: 0, // índice de la siguiente aventura por jugar
    medallas: [], // ids de niveles completados
    recuerdos: [], // ids de recuerdos encontrados
    besos: 0,
    objetos: { chuche: 3 },
    lailaNivel: 5,
    pos: null, // posición en el pueblo {x, y, dir}
    finalVisto: false,
    sonido: true,
  };
}

export const estado = estadoInicial();

export function cargar() {
  try {
    const txt = localStorage.getItem(CLAVE);
    if (!txt) return false;
    const datos = JSON.parse(txt);
    Object.assign(estado, estadoInicial(), datos);
    return true;
  } catch {
    return false;
  }
}

export function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

export function hayPartida() {
  try {
    const txt = localStorage.getItem(CLAVE);
    if (!txt) return false;
    const d = JSON.parse(txt);
    return !!d.introVista;
  } catch {
    return false;
  }
}

export function nuevaPartida() {
  const sonido = estado.sonido;
  const clave = estado.claveAcertada;
  Object.assign(estado, estadoInicial(), { sonido, claveAcertada: clave });
  guardar();
}
