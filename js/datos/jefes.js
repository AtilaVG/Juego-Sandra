// Datos de los combates: ataques de Laila, objetos y jefes.

export const ATAQUES_LAILA = [
  { id: 'aranazo', nombre: 'Arañazo', tipo: 'dano', poder: 1.0, efecto: 'zarpazo' },
  { id: 'bolaPelo', nombre: 'Bola de pelo', tipo: 'dano', poder: 1.2, efecto: 'bola' },
  { id: 'bufido', nombre: 'Bufido', tipo: 'bajar', poder: 1.0, efecto: 'bufido' },
  { id: 'ronroneo', nombre: 'Ronroneo', tipo: 'curar', poder: 1.0, efecto: 'corazones' },
];

export const OBJETOS = {
  chuche: { nombre: 'Chuche de gato', cura: 0.35, texto: 'Laila se zampa la chuche.' },
  tarta: { nombre: 'Tarta de queso', cura: 0.7, texto: 'Tarta de queso de Luna and Wanda. ¡Qué rica!' },
  palomitas: { nombre: 'Palomitas', cura: 0.45, texto: 'Laila pesca unas palomitas.' },
  bao: { nombre: 'Bao de Alex', cura: 0.55, texto: 'Un bao de chef Alex. ¡Delicioso!' },
};

// ataques: { nombre, tipo: 'dano' | 'nada' | 'curar', poder, texto }
export const JEFES = {
  flamenco: {
    nombre: 'FLAMENCO HINCHABLE',
    entrada: '¡Un FLAMENCO HINCHABLE salvaje apareció!',
    fondo: ['#8ad8f8', '#d8f4ff', '#58b8e8'],
    debil: 'aranazo',
    pista: '¡Es de plástico! Un buen Arañazo y se desinfla.',
    ataques: [
      { nombre: 'Salpicadura', tipo: 'dano', poder: 1, texto: '¡Laila ha acabado empapada!' },
      { nombre: 'Aleteo de plástico', tipo: 'dano', poder: 1.2 },
      { nombre: 'Flotar a la deriva', tipo: 'nada', texto: 'Se queda flotando sin hacer nada...' },
    ],
    derrota: '¡El FLAMENCO HINCHABLE se ha desinflado!',
  },
  jaimeRuben: {
    nombre: 'JAIME Y RUBÉN',
    entrada: '¡JAIME Y RUBÉN te desafían!',
    fondo: ['#2a1a4a', '#5a3a8a', '#3a2a6a'],
    debil: 'bolaPelo',
    pista: 'Se tapan con los chalecos... ¡pero una Bola de pelo no la esquiva nadie!',
    ataques: [
      { nombre: 'Ráfaga láser', tipo: 'dano', poder: 1.1, texto: '¡Piu piu piu!' },
      { nombre: 'Emboscada', tipo: 'dano', poder: 1.3 },
      { nombre: 'Discutir entre ellos', tipo: 'nada', texto: 'Se ponen a discutir quién tenía que cubrir a quién...' },
    ],
    derrota: '¡JAIME Y RUBÉN se rinden! "La próxima ganamos", dicen.',
  },
  marco: {
    nombre: 'MARCO ENCANTADO',
    entrada: '¡Un MARCO ENCANTADO cobra vida!',
    fondo: ['#7a2a3a', '#c86a5a', '#9a4a3a'],
    debil: 'aranazo',
    pista: 'Ese marco tiene mucho barniz... ¡a Arañazos se le quitan las ganas!',
    ataques: [
      { nombre: 'Mirada al óleo', tipo: 'dano', poder: 1 },
      { nombre: 'Barniz pegajoso', tipo: 'dano', poder: 1.2, texto: '¡Laila se ha quedado pegada!' },
      { nombre: 'Posar para la foto', tipo: 'nada', texto: 'Se queda quieto, muy artístico.' },
    ],
    derrota: '¡El MARCO ENCANTADO vuelve a colgarse en la pared!',
  },
  tele: {
    nombre: '¿SIGUES AHÍ?',
    entrada: '¡La tele pregunta: "¿SIGUES AHÍ?"!',
    fondo: ['#1a1a3a', '#3a3a6a', '#2a2a4a'],
    debil: 'aranazo',
    pista: '¡Hay que darle a "Seguir viendo"! Con un Arañazo al mando vale.',
    ataques: [
      { nombre: 'Spoiler', tipo: 'dano', poder: 1.2, texto: '¡Te ha contado el final de la serie!' },
      { nombre: 'Siguiente episodio en 5...', tipo: 'dano', poder: 1 },
      { nombre: 'Cargando...', tipo: 'nada', texto: 'Se queda cargando. Y cargando. Y cargando...' },
    ],
    derrota: '¡"¿SIGUES AHÍ?" se apaga! A dormir.',
  },
  tarta: {
    nombre: 'TARTA GIGANTE',
    entrada: '¡La TARTA GIGANTE quiere luchar!',
    fondo: ['#f8c8d8', '#fff0f4', '#f0a0c0'],
    debil: 'bolaPelo',
    pista: '¡Una Bola de pelo le apaga las velas de golpe! (Y luego nadie se la come.)',
    ataques: [
      { nombre: 'Velas que no se apagan', tipo: 'dano', poder: 1.1 },
      { nombre: 'Lluvia de nata', tipo: 'dano', poder: 1.2, texto: '¡Laila está llena de nata!' },
      { nombre: 'Cumpleaños feliz', tipo: 'nada', texto: 'Se pone a cantar cumpleaños feliz. Desafinando.' },
    ],
    derrota: '¡La TARTA GIGANTE se ha quedado sin velas! ¡Que pida un deseo!',
  },
  nervios: {
    nombre: 'NERVIOS DE ALEX',
    entrada: '¡Aparecen los NERVIOS DE ALEX!',
    fondo: ['#c8b8e8', '#f0e8ff', '#a898d8'],
    debil: 'ronroneo',
    pista: 'Uf, qué nervios... Un Ronroneo de Laila me calmaría muchísimo.',
    ataques: [
      { nombre: 'Sudor frío', tipo: 'dano', poder: 1 },
      { nombre: 'Tartamudeo', tipo: 'dano', poder: 1.1, texto: '"E-encantado de c-conocerles..."' },
      { nombre: 'Risa nerviosa', tipo: 'nada', texto: 'Se ríe sin motivo. Nadie sabe por qué.' },
    ],
    derrota: '¡Los NERVIOS DE ALEX se han calmado! Alex ya está a gusto.',
  },
  examen: {
    nombre: 'EXAMEN FINAL',
    entrada: '¡El EXAMEN FINAL te reta!',
    fondo: ['#d8e8f8', '#ffffff', '#b8d0e8'],
    debil: 'aranazo',
    pista: 'Tú te sabes las respuestas. ¡Arañazo y a tachar las preguntas!',
    ataques: [
      { nombre: 'Pregunta trampa', tipo: 'dano', poder: 1.2 },
      { nombre: 'Tiempo agotado', tipo: 'dano', poder: 1 },
      { nombre: 'Letra pequeña', tipo: 'nada', texto: 'Nadie consigue leer lo que pone.' },
    ],
    derrota: '¡EXAMEN FINAL aprobado con matrícula!',
  },
  aguacate: {
    nombre: 'AGUACATE DURO',
    entrada: '¡El AGUACATE DURO se niega a madurar!',
    fondo: ['#d8f0b8', '#f8fff0', '#a8d888'],
    debil: 'bolaPelo',
    pista: 'Está durísimo... ¡pero una Bola de pelo lo ablanda!',
    ataques: [
      { nombre: 'Hueso volador', tipo: 'dano', poder: 1.2 },
      { nombre: 'Guacamole', tipo: 'dano', poder: 1, texto: '¡Todo verde!' },
      { nombre: 'No madurar nunca', tipo: 'curar', poder: 0.15, texto: 'Se pone aún más duro...' },
    ],
    derrota: '¡El AGUACATE DURO por fin está en su punto!',
  },
  cabraMontes: {
    nombre: 'CABRA MONTÉS',
    entrada: '¡Una CABRA MONTÉS de Gredos te corta el paso!',
    fondo: ['#8ac0f8', '#e0f0ff', '#7aa050'],
    debil: 'bufido',
    pista: 'Las cabras se asustan con los bufidos... ¡Prueba el Bufido de Laila!',
    ataques: [
      { nombre: 'Cornada', tipo: 'dano', poder: 1.2 },
      { nombre: 'Balido', tipo: 'dano', poder: 1, texto: '¡Meeeeeeeh!' },
      { nombre: 'Posar en una roca', tipo: 'nada', texto: 'Se sube a una roca a posar. Muy fotogénica.' },
    ],
    derrota: '¡La CABRA MONTÉS se marcha monte arriba!',
  },
  alex: {
    nombre: 'CAMPEÓN ALEX',
    entrada: '¡El CAMPEÓN ALEX te desafía!',
    fondo: ['#f8a868', '#ffe0a8', '#e87858'],
    debil: 'bufido',
    pista: '¡Mi punto débil es el Bufido de Laila! Me da un miedo terrible.',
    ataques: [
      { nombre: 'Chiste malo', tipo: 'dano', poder: 1.1, texto: '¡Es tan malo que duele!' },
      { nombre: 'Quejarse de la espalda', tipo: 'nada', texto: '"Ay, mi espalda..." ¡No es muy eficaz! Abuelete...' },
      { nombre: 'Siesta de abuelete', tipo: 'curar', poder: 0.15, texto: 'Se echa una siestecita y recupera fuerzas.' },
      { nombre: 'Llamarte bebe', tipo: 'dano', poder: 1.2, texto: 'Sandra se sonroja... ¡y Laila se despista!' },
    ],
    derrota: '¡El CAMPEÓN ALEX se rinde! "Me has ganado... en todo", dice.',
  },
};
