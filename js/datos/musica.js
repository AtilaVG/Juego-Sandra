// Música original en estilo chiptune (melodía + armonía + bajo + batería).
import { partitura, midi } from '../motor/audio.js';

const NOMBRES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const nombre = (n) => NOMBRES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);

// "Am" -> notas MIDI del acorde (raíz en la octava indicada).
function acorde(simbolo, octava) {
  const m = /^([A-G][#b]?)(m|7|maj7|m7|dim|sus4)?$/.exec(simbolo);
  const raiz = midi(m[1] + octava);
  const tipo = m[2] || '';
  const intervalos = {
    '': [0, 4, 7],
    m: [0, 3, 7],
    7: [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    m7: [0, 3, 7, 10],
    dim: [0, 3, 6],
    sus4: [0, 5, 7],
  }[tipo];
  return intervalos.map((i) => raiz + i);
}

// "C:16 G:16" -> lista [{simbolo, dur}]
function progresion(texto) {
  return texto.trim().split(/\s+/).map((t) => {
    const [s, d] = t.split(':');
    return { s, d: +(d || 16) };
  });
}

function bajo(prog, estilo = 'saltarin', octava = 2) {
  const toks = [];
  for (const { s, d } of prog) {
    const [r, , q] = acorde(s, octava);
    if (estilo === 'suave') {
      for (let t = 0; t < d; t += 8) toks.push(nombre(t % 16 === 0 ? r : q) + ':' + Math.min(8, d - t));
    } else if (estilo === 'rapido') {
      for (let t = 0; t < d; t += 2) toks.push(nombre((t / 2) % 2 ? r + 12 : r) + ':2');
    } else {
      const patron = [r, r + 12, q, r + 12];
      for (let t = 0, i = 0; t < d; t += 2, i++) toks.push(nombre(patron[i % 4]) + ':2');
    }
  }
  return toks.join(' ');
}

function arpegio(prog, octava = 4, paso = 2) {
  const toks = [];
  for (const { s, d } of prog) {
    const ns = acorde(s, octava);
    const ciclo = [ns[0], ns[1], ns[2], ns[1] + 12 > ns[2] + 5 ? ns[1] : ns[0] + 12];
    for (let t = 0, i = 0; t < d; t += paso, i++) toks.push(nombre(ciclo[i % ciclo.length]) + ':' + paso);
  }
  return toks.join(' ');
}

function bloques(prog, octava = 4) {
  // Acordes largos repartidos en dos voces (para canciones lentas).
  return prog.map(({ s, d }) => nombre(acorde(s, octava)[1]) + ':' + d).join(' ');
}

function repetir(patron, veces) {
  return Array(veces).fill(patron).join(' ');
}

function cancion({ bpm, melodia, acordes, estiloBajo, bateria, compases, duty = 0.25, arp = true, bucle = true, volumen = 1, vibrato = false, octavaArp = 4 }) {
  const prog = progresion(acordes);
  const canales = [
    { eventos: partitura(melodia), duty, vol: 0.11, legato: 0.88, vibrato },
    { eventos: partitura(bajo(prog, estiloBajo)), onda: 'triangulo', vol: 0.32, legato: 0.8 },
  ];
  if (arp) canales.push({ eventos: partitura(arpegio(prog, octavaArp)), duty: 0.125, vol: 0.035, legato: 0.6 });
  else canales.push({ eventos: partitura(bloques(prog, octavaArp)), duty: 0.125, vol: 0.04, legato: 0.95, decae: true });
  if (bateria) canales.push({ eventos: partitura(repetir(bateria, compases)), vol: 0.35 });
  // Comprobación de que todas las pistas duran lo mismo.
  const dur = (c) => c.eventos.reduce((a, e) => a + e.dur, 0);
  const d0 = dur(canales[0]);
  for (const c of canales) if (dur(c) !== d0) console.warn('Pista descuadrada', dur(c), d0, melodia.slice(0, 20));
  return { bpm, canales, bucle, volumen };
}

// Cumpleaños feliz (melodía popular, de dominio público), por frases.
const CUMPLE = [
  { melodia: 'G4:3 G4:1 A4:4 G4:4 C5:4 B4:8', acordes: 'C:12 G:12' },
  { melodia: 'G4:3 G4:1 A4:4 G4:4 D5:4 C5:8', acordes: 'G:12 C:12' },
  { melodia: 'G4:3 G4:1 G5:4 E5:4 C5:4 B4:4 A4:4', acordes: 'C:12 F:12' },
  { melodia: 'F5:3 F5:1 E5:4 C5:4 D5:4 C5:12', acordes: 'F:4 G:12 C:12' },
];
const frasesCumple = (frases) =>
  cancion({
    bpm: 112,
    melodia: frases.map((f) => f.melodia).join(' '),
    acordes: frases.map((f) => f.acordes).join(' '),
    estiloBajo: 'suave',
    arp: false,
    duty: 0.5,
    bucle: false,
    vibrato: true,
  });

export const LETRA_CUMPLE = ['Cumpleaños feliz', 'cumpleaños feliz', 'te deseamos todos', 'cumpleaños feliz'];
export const CUMPLEANOS = { frases: CUMPLE.map((f) => frasesCumple([f])), entera: frasesCumple(CUMPLE) };

export const MUSICA = {
  titulo: cancion({
    bpm: 128,
    melodia:
      'C5:4 E5:2 G5:2 C6:6 B5:2 | A5:4 G5:4 D5:4 B4:4 | C5:4 E5:2 A5:2 G5:6 E5:2 | F5:4 E5:2 D5:2 C5:8 |' +
      'A4:2 C5:2 F5:4 E5:2 F5:2 A5:4 | G5:4 F5:2 E5:2 D5:4 B4:4 | C5:2 E5:2 G5:2 C6:2 B5:2 A5:2 G5:4 | A5:4 B5:4 C6:8',
    acordes: 'C G Am F F G C:8 Am:8 F:8 G:8',
    bateria: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2',
    compases: 8,
  }),

  pueblo: cancion({
    bpm: 112,
    melodia:
      'C5:2 F5:2 A5:4 G5:2 F5:2 E5:2 F5:2 | G5:6 E5:2 C5:8 | D5:2 F5:2 A5:4 C6:2 Bb5:2 A5:2 F5:2 | G5:8 r:4 F5:2 G5:2 |' +
      'A5:4 A5:2 Bb5:2 C6:4 A5:4 | G5:4 E5:2 F5:2 G5:4 C5:4 | D5:2 F5:2 Bb5:4 A5:2 G5:2 F5:2 D5:2 | E5:4 G5:4 F5:8',
    acordes: 'F C Dm Bb F C Bb C:8 F:8',
    estiloBajo: 'suave',
    bateria: 'k:4 h:4 s:4 h:4',
    compases: 8,
    duty: 0.5,
  }),

  nivel: cancion({
    bpm: 150,
    melodia:
      'G5:2 r:1 G5:1 B5:2 D6:2 r:2 B5:2 G5:4 | E5:2 G5:2 B5:2 E6:2 D6:4 B5:4 | C6:3 B5:1 A5:2 G5:2 E5:4 G5:4 | A5:2 B5:2 A5:2 F#5:2 D5:8 |' +
      'G5:2 B5:2 D6:2 G6:2 F#6:2 E6:2 D6:4 | E6:2 D6:2 B5:2 G5:2 E5:4 G5:4 | A5:2 C6:2 E6:4 D6:2 C6:2 B5:2 A5:2 | B5:4 A5:4 G5:8',
    acordes: 'G Em C D G Em C D:8 G:8',
    bateria: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2',
    compases: 8,
  }),

  combate: cancion({
    bpm: 168,
    melodia:
      'A5:2 A5:1 A5:1 E5:2 A5:2 C6:2 B5:2 A5:2 E5:2 | F5:2 A5:2 C6:4 B5:2 A5:2 F5:4 | G5:2 B5:2 D6:2 B5:2 G5:2 D5:2 G5:4 | G#5:4 B5:4 E6:4 D6:2 B5:2 |' +
      'C6:2 B5:2 A5:2 E5:2 A5:4 C6:4 | D6:2 C6:2 A5:2 F5:2 A5:4 C6:4 | B5:2 D6:2 G6:4 F6:2 D6:2 B5:4 | E6:4 D6:2 B5:2 G#5:4 E5:4',
    acordes: 'Am F G E Am F G E',
    estiloBajo: 'rapido',
    bateria: 'k:2 h:2 s:2 k:2 k:2 h:2 s:2 h:2',
    compases: 8,
  }),

  victoria: cancion({
    bpm: 140,
    melodia: 'C5:2 E5:2 G5:2 C6:6 G5:2 C6:2 | A5:4 F5:2 A5:2 C6:8 | B5:2 A5:2 G5:2 F5:2 D5:4 G5:4 | E5:4 G5:4 C6:8',
    acordes: 'C F G C',
    bateria: 'k:4 s:4 k:4 s:4',
    compases: 4,
    duty: 0.5,
  }),

  medalla: cancion({
    bpm: 132,
    melodia: 'C5:2 E5:2 G5:2 C6:4 r:2 A5:2 B5:2 C6:8 r:8',
    acordes: 'C:8 F:4 G:4 C:16',
    bateria: 'k:4 h:4 s:4 h:4 k:4 h:4 c:8',
    compases: 1,
    bucle: false,
    duty: 0.5,
  }),

  atardecer: cancion({
    bpm: 84,
    melodia:
      'F#5:4 A5:4 D6:6 C#6:2 | B5:4 A5:4 E5:8 | F#5:4 B5:4 A5:4 F#5:4 | G5:6 F#5:2 E5:4 D5:4 |' +
      'A5:4 D6:4 F#6:6 E6:2 | E6:4 C#6:4 A5:8 | B5:4 D6:4 G5:4 B5:4 | A5:6 G5:2 F#5:8',
    acordes: 'D A Bm G D A G A:8 D:8',
    estiloBajo: 'suave',
    arp: true,
    duty: 0.5,
    vibrato: true,
    volumen: 0.9,
  }),

  intro: cancion({
    bpm: 96,
    melodia:
      'E5:4 G5:2 C6:2 B5:4 G5:4 | A5:4 F5:2 A5:2 G5:8 | E5:4 G5:2 C6:2 D6:4 C6:4 | B5:4 A5:4 G5:8 |' +
      'A5:4 C6:2 A5:2 G5:4 E5:4 | F5:4 A5:2 F5:2 E5:4 C5:4 | D5:4 F5:2 A5:2 G5:4 B5:4 | C6:8 r:8',
    acordes: 'C F C G Am F Dm:8 G:8 C',
    estiloBajo: 'suave',
    duty: 0.5,
    vibrato: true,
  }),
};
