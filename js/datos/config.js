// =====================================================================
//  COSAS PERSONALIZABLES DEL JUEGO
//  (lo que más probablemente quieras retocar está aquí)
// =====================================================================

// Pregunta del principio, para que solo Sandra pueda jugar.
export const CLAVE = {
  pregunta: '¿Cómo te llama Alex?',
  respuestas: ['BEBE'], // se comparan sin tildes y en mayúsculas
  pista: 'Pista: empieza por B y lo oyes muchas veces al día...',
};

// La pista del regalo que aparece al final del juego.
// TODO(Alex): cambia este texto por la pista de verdad.
export const PISTA_REGALO = [
  'Tu regalo de verdad no está en este juego...',
  'Busca donde guardamos las cosas importantes. ♥',
];

// Carta final de Alex (se muestra en el Templo de Debod, al atardecer).
export const CARTA_FINAL = [
  'Bebe, si has llegado hasta aquí es que te has pasado todas nuestras aventuras.',
  'Desde que nos conocimos currando, cada plan contigo se ha convertido en un recuerdo bonito.',
  'La piscina, el láser tag, el Thyssen, las tartas de queso, las series en el sofá, las cenas...',
  'Gracias por aguantar a este abuelete, por las risas y por hacer que todo sea mejor.',
  'Feliz mesario, Sandra. Te quiero muchísimo.',
];

export const FECHA = '8 de octubre';

// Aspecto de los personajes (sacado de las fotos).
// pelo: 'recogido' | 'corto' | 'largo' | 'coleta'
// cabeza: 'sombrero' | 'gorra' | 'pescador' | null
export const PERSONAJES = {
  sandra: {
    nombre: 'Sandra',
    piel: '#f2cdb0',
    pelo: '#3b2519',
    estilo: 'recogido',
    gafas: '#23615f',
    camiseta: '#26262e',
    tirantes: true,
    collar: '#e8b840',
    pantalon: '#4a5f8f',
    zapatos: '#f0f0f0',
    colorete: true,
  },
  alex: {
    nombre: 'Alex',
    piel: '#f0cba8',
    pelo: '#2a1c14',
    estilo: 'corto',
    gafas: '#1c1c22',
    camiseta: '#1ea2dc',
    pantalon: '#34384a',
    zapatos: '#e8e8e8',
    cabeza: 'sombrero',
    colCabeza: '#efd9a4',
    barbita: true,
  },
  bea: {
    nombre: 'Bea',
    piel: '#e2b08a',
    pelo: '#3a2416',
    estilo: 'coleta',
    camiseta: 'cuadros',
    pantalon: '#2c2c34',
    zapatos: '#f0f0f0',
    colorete: true,
  },
  jaime: {
    nombre: 'Jaime',
    piel: '#e9bc98',
    pelo: '#2a1c14',
    estilo: 'corto',
    camiseta: '#f2826e',
    pantalon: '#3a4256',
    zapatos: '#ffffff',
    cabeza: 'gorra',
    colCabeza: '#e2cfb8',
    logo: '#b0305a',
  },
  ruben: {
    nombre: 'Rubén',
    piel: '#d9a882',
    pelo: '#1e1610',
    estilo: 'corto',
    camiseta: '#f49a5a',
    pantalon: '#2e2e36',
    zapatos: '#202024',
    cabeza: 'pescador',
    colCabeza: '#1e1e24',
    gafasSol: true,
    barbita: true,
  },
  begona: {
    nombre: 'Begoña',
    piel: '#f0c8a8',
    pelo: '#6a4028',
    estilo: 'media',
    camiseta: '#9a5ab0',
    pantalon: '#3a3a4a',
    zapatos: '#5a3a2a',
  },
  david: {
    nombre: 'David',
    piel: '#ecc0a0',
    pelo: '#4a4a4a',
    estilo: 'corto',
    camiseta: '#4a8a5a',
    pantalon: '#4a4038',
    zapatos: '#2a2a2a',
    barbita: true,
  },
};

// Laila, la gata. TODO(Alex): ajusta los colores cuando me pases una foto.
export const LAILA = {
  base: '#8c8c94',
  rayas: '#5a5a62',
  pecho: '#e8e8ec',
  ojos: '#a8c840',
  nariz: '#e89aa8',
};
