/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/artAssets.js
   HD Oil-Painted Assets, Procedural Portraits, Catalogs (7 Locations, 11 NPCs,
   24 Creatures/Bosses, 72+ Artifacts, 6 Professions, Pets, Mounts, Medals,
   Eltic Cube, Magic Mirror, Tavern Dice, Clans & 16 AI Warriors)
   ========================================================================== */

window.GDL_ART = (function () {
  'use strict';

  // Resolve asset path whether served from root (GitHub Pages) or /public/
  const LOCATION_IMAGES = {
    ciudadela_luz: 'assets/locations/ciudadela_luz.jpg',
    bosque_ecos: 'assets/locations/bosque_ecos.jpg',
    llanuras_alba: 'assets/locations/llanuras_alba.jpg',
    lago_espejo: 'assets/locations/lago_espejo.jpg',
    cuevas_cristalinas: 'assets/locations/cuevas_cristalinas.jpg',
    templo_antiguo: 'assets/locations/templo_antiguo.jpg',
    frontera_ceniza: 'assets/locations/frontera_ceniza.jpg'
  };

  const NPC_IMAGES = {
    comandante_aurelius: 'assets/npcs/npc_comandante_aurelius.jpg',
    herrero_korgan: 'assets/npcs/npc_herrero_korgan.jpg',
    alquimista_selene: 'assets/npcs/npc_alquimista_selene.jpg',
    explorador_lyon: 'assets/npcs/npc_explorador_lyon.jpg'
  };

  /* ------------------------------------------------------------------------
     7 PANORAMIC HD LOCATIONS (WITH ENDGAME ESTANCIAS)
     ------------------------------------------------------------------------ */
  const LOCATIONS = [
    {
      id: 'ciudadela_luz',
      name: 'Ciudadela de la Luz',
      subtitle: 'Bastión Capital de la Orden Solar',
      minLevel: 1,
      dangerLabel: 'Santuario Imperial (Nivel 1+)',
      isSafeZone: true,
      img: LOCATION_IMAGES.ciudadela_luz,
      lore: 'Las agujas doradas de la Ciudadela de la Luz se alzan sobre el desfiladero de Aethelgard. Sus braseros eternos protegen la Gran Forja, la Taberna del Grifo Dorado, el Coliseo de Arena y el Santuario del Cubo Éltico.',
      connectedTo: ['llanuras_alba', 'bosque_ecos', 'lago_espejo'],
      npcs: ['comandante_aurelius', 'herrero_korgan', 'alquimista_selene', 'tabernero_balthus', 'maestre_eltico'],
      creatures: ['maniqui_acero', 'recluta_orden', 'gargola_bastion'],
      huntingNodes: [
        { id: 'hierba_solar', name: 'Flor de Rocío Solar', prof: 'herbolaria', tier: 1, color: '#52d17c', icon: '🌿' },
        { id: 'veta_cobre', name: 'Filón de Bronce Real', prof: 'mineria', tier: 1, color: '#e88d2c', icon: '⛏️' }
      ],
      hotspots: [
        { id: 'hs_aurelius', label: 'Comandante Aurelius', x: 54, y: 46, type: 'npc', target: 'comandante_aurelius' },
        { id: 'hs_korgan', label: 'Forja de Korgan', x: 32, y: 62, type: 'npc', target: 'herrero_korgan' },
        { id: 'hs_selene', label: 'Torre de Selene', x: 72, y: 42, type: 'npc', target: 'alquimista_selene' },
        { id: 'hs_taberna', label: 'Taberna & Dados', x: 24, y: 76, type: 'special', target: 'tavern' },
        { id: 'hs_cubo', label: 'Cubo Éltico', x: 80, y: 68, type: 'special', target: 'cube' }
      ]
    },
    {
      id: 'llanuras_alba',
      name: 'Llanuras del Alba',
      subtitle: 'Campos de Batalla de los Antiguos Reyes',
      minLevel: 1,
      dangerLabel: 'Frontera Abierta (Nivel 1–3)',
      isSafeZone: false,
      img: LOCATION_IMAGES.llanuras_alba,
      lore: 'Bajo un cielo quebrado por rayos dorados se extienden las Llanuras del Alba. Entre estatuas derruidas y estandartes de guerra patrullan los batallones de la Luz y acechan manadas de lobos huargos y saqueadores.',
      connectedTo: ['ciudadela_luz', 'bosque_ecos', 'frontera_ceniza'],
      npcs: ['explorador_lyon', 'domador_ignis'],
      creatures: ['lobo_alba', 'saqueador_stepa', 'jabalí_acorazado', 'centauro_lancero'],
      huntingNodes: [
        { id: 'lino_dorado', name: 'Espiga de Lino Dorado', prof: 'herbolaria', tier: 1, color: '#f4d068', icon: '🌾' },
        { id: 'hierro_meteoro', name: 'Roca de Hierro Astral', prof: 'mineria', tier: 1, color: '#a8a298', icon: '🪨' }
      ],
      hotspots: [
        { id: 'hs_lyon', label: 'Explorador Lyon', x: 26, y: 58, type: 'npc', target: 'explorador_lyon' },
        { id: 'hs_caza_llanura', label: 'Coto de Caza', x: 64, y: 66, type: 'hunting', target: 'hunting' },
        { id: 'hs_monturas', label: 'Establos de Ignifer', x: 82, y: 52, type: 'special', target: 'mounts' }
      ]
    },
    {
      id: 'bosque_ecos',
      name: 'Bosque de los Ecos',
      subtitle: 'Arboleda de los Monolitos Rúnicos',
      minLevel: 2,
      dangerLabel: 'Territorio Místico (Nivel 2–5)',
      isSafeZone: false,
      img: LOCATION_IMAGES.bosque_ecos,
      lore: 'Árboles milenarios retorcidos envuelven monolitos grabados con runas celestes y áureas. Los espíritus del bosque susurran secretos antiguos mientras bestias sombrías y druidas caídos vigilan los senderos.',
      connectedTo: ['ciudadela_luz', 'llanuras_alba', 'lago_espejo', 'cuevas_cristalinas'],
      npcs: ['explorador_lyon', 'druida_aelion'],
      creatures: ['acechador_musgo', 'oso_runico', 'espectro_arboleda', 'sylvaris_archidruida'],
      huntingNodes: [
        { id: 'seta_lunar', name: 'Hongo Bioluminiscente', prof: 'herbolaria', tier: 2, color: '#48b8e8', icon: '🍄' },
        { id: 'madera_ancestral', name: 'Raíz de Roble Rúnico', prof: 'herbolaria', tier: 2, color: '#4cd46c', icon: '🪵' }
      ],
      hotspots: [
        { id: 'hs_monolito', label: 'Monolito de los Ecos', x: 60, y: 44, type: 'npc', target: 'druida_aelion' },
        { id: 'hs_caza_bosque', label: 'Sendero de Caza', x: 42, y: 72, type: 'hunting', target: 'hunting' },
        { id: 'hs_boss_sylvaris', label: 'Altar de Sylvaris', x: 84, y: 58, type: 'boss', target: 'sylvaris_archidruida' }
      ]
    },
    {
      id: 'lago_espejo',
      name: 'Lago del Espejo',
      subtitle: 'Santuario Subterráneo de las Estrellas',
      minLevel: 3,
      dangerLabel: 'Aguas Arcanas (Nivel 3–6)',
      isSafeZone: false,
      img: LOCATION_IMAGES.lago_espejo,
      lore: 'En una bóveda abierta al firmamento nocturno, las aguas inmóviles del Lago del Espejo reflejan constelaciones olvidadas y un templo élfico sumergido entre lirios luminosos y drusas de cuarzo.',
      connectedTo: ['ciudadela_luz', 'bosque_ecos', 'cuevas_cristalinas', 'templo_antiguo'],
      npcs: ['oraculo_miriel', 'pescador_neron'],
      creatures: ['sirena_abismo', 'serpiente_espejo', 'elemental_escarcha', 'leviatan_estelar'],
      huntingNodes: [
        { id: 'banco_peces_luz', name: 'Cardumen de Carpas Astrales', prof: 'pesca', tier: 2, color: '#48b8e8', icon: '🐟' },
        { id: 'loto_estelar', name: 'Loto del Espejo Nocturno', prof: 'herbolaria', tier: 2, color: '#c478ff', icon: '🪷' }
      ],
      hotspots: [
        { id: 'hs_espejo_magico', label: 'Espejo Mágico de Solaria', x: 30, y: 48, type: 'special', target: 'mirror' },
        { id: 'hs_pesca_lago', label: 'Orilla de Pesca & Caza', x: 62, y: 76, type: 'hunting', target: 'hunting' },
        { id: 'hs_boss_leviatan', label: 'Fosa del Leviatán', x: 78, y: 56, type: 'boss', target: 'leviatan_estelar' }
      ]
    },
    {
      id: 'cuevas_cristalinas',
      name: 'Cuevas Cristalinas',
      subtitle: 'Estancia Final I — Bóvedas de Luminita Profunda',
      minLevel: 4,
      dangerLabel: 'Estancia Élite I (Nivel 4–8)',
      isSafeZone: false,
      isEndgameEstancia: true,
      img: LOCATION_IMAGES.cuevas_cristalinas,
      lore: 'Puentes de piedra gótica cruzan abismos iluminados por gigantescos cristales de maná turquesa y ámbar solar. En la fortaleza interior de las Cuevas Cristalinas aguarda Krystallos, el Soberano de Cuarzo.',
      connectedTo: ['bosque_ecos', 'lago_espejo', 'templo_antiguo'],
      npcs: ['arcanista_orian'],
      creatures: ['escorpion_prisma', 'devorador_mana', 'golem_luminita', 'krystallos_soberano'],
      huntingNodes: [
        { id: 'veta_luminita', name: 'Drusa de Luminita Pura', prof: 'mineria', tier: 3, color: '#48b8e8', icon: '💎' },
        { id: 'cristal_ambar', name: 'Geoda de Ámbar Solar', prof: 'mineria', tier: 3, color: '#f4d068', icon: '🔶' }
      ],
      hotspots: [
        { id: 'hs_orian', label: 'Arcanista Orian', x: 64, y: 56, type: 'npc', target: 'arcanista_orian' },
        { id: 'hs_minas_cristal', label: 'Vetas de Luminita (Caza)', x: 28, y: 66, type: 'hunting', target: 'hunting' },
        { id: 'hs_boss_krystallos', label: 'Trono de Krystallos (Jefe)', x: 74, y: 38, type: 'boss', target: 'krystallos_soberano' }
      ]
    },
    {
      id: 'templo_antiguo',
      name: 'Templo Antiguo',
      subtitle: 'Estancia Final II — Santuario del Rayo Celestial',
      minLevel: 5,
      dangerLabel: 'Estancia Élite II (Nivel 5–9)',
      isSafeZone: false,
      isEndgameEstancia: true,
      img: LOCATION_IMAGES.templo_antiguo,
      lore: 'Una columna de fuego y luz astral desciende desde las nubes tormentosas sobre el altar rúnico del Templo Antiguo. Los colosos alados de piedra cobran vida para poner a prueba a los campeones de la Luz.',
      connectedTo: ['lago_espejo', 'cuevas_cristalinas', 'frontera_ceniza'],
      npcs: ['sumo_custodio_solaris'],
      creatures: ['centinela_alado', 'inquisidor_reliquia', 'serafin_piedra', 'archinquisidor_vaelen'],
      huntingNodes: [
        { id: 'reliquia_runica', name: 'Fragmento de Estela Solar', prof: 'mineria', tier: 4, color: '#f5cc4d', icon: '⚜️' },
        { id: 'incienso_celeste', name: 'Mirra del Altar Antiguo', prof: 'herbolaria', tier: 4, color: '#ff9d3b', icon: '🔥' }
      ],
      hotspots: [
        { id: 'hs_altar_solar', label: 'Altar del Rayo Celestial', x: 56, y: 64, type: 'npc', target: 'sumo_custodio_solaris' },
        { id: 'hs_medallas', label: 'Panteón de Medallas', x: 25, y: 54, type: 'special', target: 'medals' },
        { id: 'hs_boss_vaelen', label: 'Sancta Sanctorum (Vaelen)', x: 58, y: 36, type: 'boss', target: 'archinquisidor_vaelen' }
      ]
    },
    {
      id: 'frontera_ceniza',
      name: 'Frontera de Ceniza',
      subtitle: 'Estancia Final Suprema — Ciudadela del Eclipse y del Dragón',
      minLevel: 6,
      dangerLabel: 'Estancia Suprema (Nivel 6–12)',
      isSafeZone: false,
      isEndgameEstancia: true,
      img: LOCATION_IMAGES.frontera_ceniza,
      lore: 'Ríos de lava incandescente rodean la fortaleza de obsidiana bajo un eclipse solar sangriento. En la cima de la torre alada rugen el Dragón Vorathax y el Emperador Malakor, Soberano del Eclipse Eterno.',
      connectedTo: ['llanuras_alba', 'templo_antiguo', 'ciudadela_luz'],
      npcs: ['general_auron'],
      creatures: ['mirmidon_piros', 'caballero_ceniza', 'vorathax_dragon_eclipse', 'malakor_emperador_eclipse'],
      huntingNodes: [
        { id: 'nucleo_obsidiana', name: 'Núcleo de Magma Abisal', prof: 'mineria', tier: 5, color: '#e04438', icon: '🌋' },
        { id: 'escama_draconica', name: 'Ceniza de Escama Imperial', prof: 'mineria', tier: 5, color: '#f4d068', icon: '🐉' }
      ],
      hotspots: [
        { id: 'hs_auron', label: 'General Auron', x: 24, y: 74, type: 'npc', target: 'general_auron' },
        { id: 'hs_boss_vorathax', label: 'Torre del Dragón Vorathax', x: 74, y: 28, type: 'boss', target: 'vorathax_dragon_eclipse' },
        { id: 'hs_boss_malakor', label: 'Trono del Eclipse (Malakor)', x: 72, y: 44, type: 'boss', target: 'malakor_emperador_eclipse' }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     11 ILLUSTRATED NPCS (WITH HD OIL PORTRAITS & DIALOGUES)
     ------------------------------------------------------------------------ */
  const NPCS = {
    comandante_aurelius: {
      id: 'comandante_aurelius',
      name: 'Comandante Aurelius',
      title: 'Gran Maestre de los Guerreros de la Luz',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Misiones & Campaña',
      greeting: '«Soldado de la Luz, las sombras de la Frontera de Ceniza amenazan con eclipsar nuestro sol. Cumple las misiones de la Orden, purga las estancias finales y tu nombre será inmortal en Asteria.»',
      actions: ['quests', 'medals', 'clans'],
      shopItems: ['espada_sol_naciente', 'escudo_leon_dorado', 'coraza_aurelius', 'yelmo_paladin']
    },
    herrero_korgan: {
      id: 'herrero_korgan',
      name: 'Herrero Korgan',
      title: 'Maestro Forjador de Runas y Acero',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.herrero_korgan,
      badge: 'Herrería & Templado',
      greeting: '«¡El acero no miente! Trae minerales de las Cuevas Cristalinas y carbón de la Frontera de Ceniza a mi yunque. Forjaremos armas dignas de abatir dragones.»',
      actions: ['professions', 'forge_shop'],
      shopItems: ['mandoble_korgan', 'hacha_runica', 'martillo_titan', 'cota_escamas_bronce', 'grebas_forjador', 'pico_maestro']
    },
    alquimista_selene: {
      id: 'alquimista_selene',
      name: 'Alquimista Selene',
      title: 'Archimaga de Elixires y Transmutación',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.alquimista_selene,
      badge: 'Alquimia & Espejo',
      greeting: '«En cada gota de rocío solar y en cada cristal del Lago del Espejo reside un poder oculto. Abastece tu cinturón de combate con mis elixires antes de retar a los jefes de estancia.»',
      actions: ['alchemy_shop', 'cube', 'mirror'],
      shopItems: ['elixir_vida_menor', 'elixir_vida_mayor', 'nectar_mana_astral', 'panacea_solar', 'pocion_furia_titan', 'balsamo_hierro', 'amuleto_selene', 'anillo_alquimico']
    },
    explorador_lyon: {
      id: 'explorador_lyon',
      name: 'Explorador Lyon',
      title: 'Rastreador Real de los Bosques y Llanuras',
      locationId: 'llanuras_alba',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Caza & Mascotas',
      greeting: '«He seguido las huellas de las bestias desde las Llanuras del Alba hasta el Bosque de los Ecos. Aprende a cazar en tiempo real y doma compañeros leales para tus batallas.»',
      actions: ['hunting', 'pets', 'mounts'],
      shopItems: ['arco_cazador_lyon', 'daga_sombra_bosque', 'capa_explorador', 'botas_viento_alba', 'cana_pesca_runica', 'hoz_herbolario']
    },
    tabernero_balthus: {
      id: 'tabernero_balthus',
      name: 'Tabernero Balthus',
      title: 'Anfitrión del Grifo Dorado',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.herrero_korgan,
      badge: 'Dados & Rumores',
      greeting: '«¡Acércate al fuego, viajero! Una jarra de hidromiel solar y una partida de Dados de Taberna pueden doblar tu bolsa de oro o revelarte tesoros ocultos.»',
      actions: ['tavern'],
      shopItems: ['hidromiel_grifo', 'asado_jabali', 'elixir_vida_mayor']
    },
    maestre_eltico: {
      id: 'maestre_eltico',
      name: 'Archimago Valerion',
      title: 'Custodio del Cubo Éltico',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Cubo Éltico',
      greeting: '«El Cubo Éltico gira con las leyes del cosmos. Inserta fragmentos y reliquias para transmutarlos en artefactos legendarios.»',
      actions: ['cube'],
      shopItems: ['fragmento_eltico', 'catalizador_astral', 'runa_solar']
    },
    domador_ignis: {
      id: 'domador_ignis',
      name: 'Domador Real Varek',
      title: 'Señor de Corceles y de Ignifer',
      locationId: 'llanuras_alba',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Monturas & Ignifer',
      greeting: '«Ningún guerrero conquista las tierras lejanas a pie. Desde el Destrero del Alba hasta el mítico corcel de fuego Ignifer, mis monturas multiplicarán tu poder.»',
      actions: ['mounts', 'pets'],
      shopItems: ['riendas_alba', 'espuelas_fuego', 'pienso_draconico']
    },
    druida_aelion: {
      id: 'druida_aelion',
      name: 'Archidruida Aelion',
      title: 'Voz de los Monolitos Rúnicos',
      locationId: 'bosque_ecos',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Bosque de los Ecos',
      greeting: '«Sylvaris fue mi hermano de orden antes de que la niebla oscura quebrara su espíritu. Libéralo en combate de honor para restaurar la armonía del bosque.»',
      actions: ['quests', 'hunting'],
      shopItems: ['baston_monolito', 'toga_ecos', 'anillo_druida', 'panacea_solar']
    },
    oraculo_miriel: {
      id: 'oraculo_miriel',
      name: 'Oráculo Miriel',
      title: 'Vidente del Lago del Espejo',
      locationId: 'lago_espejo',
      portrait: NPC_IMAGES.alquimista_selene,
      badge: 'Espejo Mágico',
      greeting: '«Quien contempla el Lago del Espejo ve su verdadero destino. Usa el Espejo Mágico para bendecir tus atributos y enfrentarte al Leviatán Estelar.»',
      actions: ['mirror', 'quests'],
      shopItems: ['diadema_estelar', 'amuleto_lago_espejo', 'nectar_mana_astral', 'panacea_solar']
    },
    arcanista_orian: {
      id: 'arcanista_orian',
      name: 'Arcanista Mayor Orian',
      title: 'Expedicionario de las Cuevas Cristalinas',
      locationId: 'cuevas_cristalinas',
      portrait: NPC_IMAGES.alquimista_selene,
      badge: 'Estancia Final I',
      greeting: '«Las Cuevas Cristalinas vibran con poder arcano puro. Si logras quebrar la coraza de Krystallos, obtendrás el Corazón de Luminita para forjar armamento mítico.»',
      actions: ['quests', 'cube'],
      shopItems: ['espada_prisma_cristal', 'coraza_luminita', 'escudo_cuarzo_astral', 'panacea_solar']
    },
    sumo_custodio_solaris: {
      id: 'sumo_custodio_solaris',
      name: 'Sumo Custodio Solaris',
      title: 'Guardián del Altar del Rayo Celestial',
      locationId: 'templo_antiguo',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Estancia Final II',
      greeting: '«El rayo sagrado del Templo Antiguo juzga el corazón de los héroes. Derrota al Archinquisidor Vaelen y recibe la bendición de los Serafines Solares.»',
      actions: ['quests', 'medals'],
      shopItems: ['mandoble_rayo_celeste', 'armadura_templo_solar', 'corona_serafin', 'panacea_solar']
    },
    general_auron: {
      id: 'general_auron',
      name: 'General Auron Espada-Solar',
      title: 'Comandante del Asedio en la Frontera de Ceniza',
      locationId: 'frontera_ceniza',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Estancia Suprema',
      greeting: '«¡Esta es la batalla final de nuestra era! Primero abate al Dragón Vorathax en las almenas y luego asalta el Trono del Eclipse para destronar al Emperador Malakor.»',
      actions: ['quests', 'medals'],
      shopItems: ['aethel_valkyr_mandoble', 'egida_eterna_helion', 'coraza_imperial_luz', 'panacea_solar']
    }
  };

  /* ------------------------------------------------------------------------
     24 CREATURES & ENDGAME ESTANCIA BOSSES
     ------------------------------------------------------------------------ */
  const CREATURES = [
    // Ciudadela de la Luz (1-3)
    { id: 'maniqui_acero', name: 'Autómata de Instrucción Rúnico', level: 1, hp: 90, atk: 12, def: 4, agi: 5, crit: 4, xp: 30, copper: 140, loc: 'ciudadela_luz', icon: '🗿', type: 'Constructo', drops: ['elixir_vida_menor', 'lingote_bronce'] },
    { id: 'recluta_orden', name: 'Escudero de Práctica Solar', level: 1, hp: 115, atk: 15, def: 6, agi: 7, crit: 6, xp: 40, copper: 185, loc: 'ciudadela_luz', icon: '🛡️', type: 'Humanoide', drops: ['elixir_vida_menor', 'espada_iniciado'] },
    { id: 'gargola_bastion', name: 'Gárgola Despierta del Campanario', level: 2, hp: 145, atk: 19, def: 9, agi: 9, crit: 8, xp: 55, copper: 260, loc: 'ciudadela_luz', icon: '🦇', type: 'Gárgola', drops: ['lingote_bronce', 'yelmo_vigia'] },

    // Llanuras del Alba (4-7)
    { id: 'lobo_alba', name: 'Huargo Crin-Dorada', level: 2, hp: 140, atk: 20, def: 7, agi: 12, crit: 10, xp: 52, copper: 240, loc: 'llanuras_alba', icon: '🐺', type: 'Bestia', drops: ['cuero_curtido', 'elixir_vida_menor'] },
    { id: 'saqueador_stepa', name: 'Saqueador de la Estepa Oscura', level: 2, hp: 165, atk: 23, def: 9, agi: 10, crit: 9, xp: 64, copper: 310, loc: 'llanuras_alba', icon: '🗡️', type: 'Humanoide', drops: ['daga_sombra_bosque', 'elixir_vida_menor'] },
    { id: 'jabalí_acorazado', name: 'Colmillo-Férreo de las Llanuras', level: 3, hp: 205, atk: 27, def: 13, agi: 8, crit: 8, xp: 82, copper: 390, loc: 'llanuras_alba', icon: '🐗', type: 'Bestia', drops: ['cuero_curtido', 'coraza_cuero_alba'] },
    { id: 'centauro_lancero', name: 'Khargol, Centauro Lancero', level: 3, hp: 245, atk: 32, def: 14, agi: 14, crit: 12, xp: 105, copper: 520, loc: 'llanuras_alba', icon: '🏇', type: 'Élite', isElite: true, drops: ['lanza_alba', 'botas_viento_alba', 'fragmento_eltico'] },

    // Bosque de los Ecos (8-11)
    { id: 'acechador_musgo', name: 'Acechador de Raíces Vivientes', level: 3, hp: 215, atk: 29, def: 13, agi: 12, crit: 10, xp: 90, copper: 440, loc: 'bosque_ecos', icon: '🌿', type: 'Silvano', drops: ['hoja_solar', 'nectar_mana_astral'] },
    { id: 'oso_runico', name: 'Oso Guardián de los Monolitos', level: 4, hp: 275, atk: 35, def: 17, agi: 10, crit: 9, xp: 118, copper: 580, loc: 'bosque_ecos', icon: '🐻', type: 'Bestia', drops: ['cuero_curtido', 'anillo_druida'] },
    { id: 'espectro_arboleda', name: 'Espectro Susurrante del Bosque', level: 4, hp: 255, atk: 38, def: 14, agi: 17, crit: 15, xp: 128, copper: 630, loc: 'bosque_ecos', icon: '👻', type: 'Espectro', drops: ['nectar_mana_astral', 'capa_explorador'] },
    { id: 'sylvaris_archidruida', name: 'Sylvaris, Señor de los Ecos Caídos', level: 5, hp: 360, atk: 45, def: 20, agi: 18, crit: 16, xp: 195, copper: 1150, loc: 'bosque_ecos', icon: '🦌', type: 'Jefe de Bosque', isBoss: true, drops: ['baston_monolito', 'toga_ecos', 'fragmento_eltico'] },

    // Lago del Espejo (12-15)
    { id: 'sirena_abismo', name: 'Náyade de las Aguas Nocturnas', level: 4, hp: 270, atk: 39, def: 16, agi: 18, crit: 14, xp: 135, copper: 670, loc: 'lago_espejo', icon: '🧜‍♀️', type: 'Acuático', drops: ['perla_espejo', 'nectar_mana_astral'] },
    { id: 'serpiente_espejo', name: 'Serpiente Cristalina del Lago', level: 5, hp: 320, atk: 44, def: 19, agi: 19, crit: 15, xp: 160, copper: 810, loc: 'lago_espejo', icon: '🐍', type: 'Bestia', drops: ['perla_espejo', 'elixir_vida_mayor'] },
    { id: 'elemental_escarcha', name: 'Elemental de Reflejo Estelar', level: 5, hp: 345, atk: 47, def: 22, agi: 15, crit: 13, xp: 175, copper: 890, loc: 'lago_espejo', icon: '❄️', type: 'Elemental', drops: ['cristal_luminita', 'amuleto_lago_espejo'] },
    { id: 'leviatan_estelar', name: 'Astraios, Leviatán del Lago del Espejo', level: 6, hp: 460, atk: 55, def: 25, agi: 20, crit: 18, xp: 265, copper: 1650, loc: 'lago_espejo', icon: '🐉', type: 'Jefe Acuático', isBoss: true, drops: ['diadema_estelar', 'tridente_espejo', 'catalizador_astral'] },

    // Cuevas Cristalinas — Estancia Final I (16-19)
    { id: 'escorpion_prisma', name: 'Escorpión de Cuarzo Lumínico', level: 5, hp: 350, atk: 48, def: 23, agi: 17, crit: 15, xp: 185, copper: 940, loc: 'cuevas_cristalinas', icon: '🦂', type: 'Arácnido', drops: ['cristal_luminita', 'elixir_vida_mayor'] },
    { id: 'devorador_mana', name: 'Devorador de Vetas Astrales', level: 6, hp: 410, atk: 54, def: 25, agi: 19, crit: 16, xp: 220, copper: 1180, loc: 'cuevas_cristalinas', icon: '👾', type: 'Aberración', drops: ['cristal_luminita', 'escudo_cuarzo_astral'] },
    { id: 'golem_luminita', name: 'Coloso de Luminita Arcana', level: 7, hp: 490, atk: 60, def: 30, agi: 14, crit: 14, xp: 270, copper: 1480, loc: 'cuevas_cristalinas', icon: '💎', type: 'Constructo Élite', isElite: true, drops: ['coraza_luminita', 'catalizador_astral'] },
    { id: 'krystallos_soberano', name: 'Krystallos, Soberano de las Cuevas Cristalinas', level: 8, hp: 620, atk: 70, def: 35, agi: 21, crit: 20, xp: 390, copper: 2600, loc: 'cuevas_cristalinas', icon: '👑', type: 'Jefe de Estancia Final I', isBoss: true, drops: ['espada_prisma_cristal', 'coraza_luminita', 'corazon_krystallos'] },

    // Templo Antiguo — Estancia Final II (20-21)
    { id: 'centinela_alado', name: 'Gólem Alado del Santuario Solar', level: 7, hp: 510, atk: 64, def: 31, agi: 19, crit: 17, xp: 295, copper: 1680, loc: 'templo_antiguo', icon: '🦅', type: 'Celestial', drops: ['runa_solar', 'panacea_solar'] },
    { id: 'archinquisidor_vaelen', name: 'Archinquisidor Vaelen del Rayo Celestial', level: 9, hp: 760, atk: 82, def: 39, agi: 24, crit: 22, xp: 520, copper: 3800, loc: 'templo_antiguo', icon: '⚜️', type: 'Jefe de Estancia Final II', isBoss: true, drops: ['mandoble_rayo_celeste', 'armadura_templo_solar', 'corona_serafin', 'sello_templo_antiguo'] },

    // Frontera de Ceniza — Estancia Final Suprema (22-24)
    { id: 'caballero_ceniza', name: 'Caballero Juramentado del Eclipse', level: 8, hp: 590, atk: 74, def: 36, agi: 21, crit: 19, xp: 360, copper: 2150, loc: 'frontera_ceniza', icon: '⚔️', type: 'Guardia Abisal', isElite: true, drops: ['nucleo_eclipse', 'panacea_solar'] },
    { id: 'vorathax_dragon_eclipse', name: 'Vorathax, Dragón de la Fortaleza de Ceniza', level: 10, hp: 920, atk: 94, def: 44, agi: 26, crit: 24, xp: 750, copper: 5800, loc: 'frontera_ceniza', icon: '🐉', type: 'Jefe Dragón Imperial', isBoss: true, drops: ['egida_eterna_helion', 'coraza_imperial_luz', 'escama_vorathax'] },
    { id: 'malakor_emperador_eclipse', name: 'Malakor, Emperador del Eclipse Eterno', level: 12, hp: 1250, atk: 112, def: 52, agi: 30, crit: 28, xp: 1400, copper: 12000, loc: 'frontera_ceniza', icon: '🌑', type: 'Jefe Final Supremo', isBoss: true, isFinalBoss: true, drops: ['aethel_valkyr_mandoble', 'corona_soberano_luz', 'anillo_eclipse_eterno'] }
  ];

  /* ------------------------------------------------------------------------
     72+ ARTIFACTS, WEAPONS, ARMOR, TOOLS, CONSUMABLES & RELICS
     ------------------------------------------------------------------------ */
  const ARTIFACTS = {
    // Weapons (14)
    espada_iniciado: { id: 'espada_iniciado', name: 'Espada Corta de Iniciado', slot: 'weapon', rarity: 'common', icon: '🗡️', price: 180, stats: { atk: 9, str: 2 }, desc: 'Hoja reglamentaria de los reclutas de la Ciudadela.' },
    espada_sol_naciente: { id: 'espada_sol_naciente', name: 'Espada del Sol Naciente', slot: 'weapon', rarity: 'uncommon', icon: '⚔️', price: 540, stats: { atk: 16, str: 5, crit: 3 }, desc: 'Forjada con bronce bendecido por el Comandante Aurelius.' },
    daga_sombra_bosque: { id: 'daga_sombra_bosque', name: 'Daga Gemela de los Ecos', slot: 'weapon', rarity: 'uncommon', icon: '🔪', price: 480, stats: { atk: 14, agi: 6, crit: 6 }, desc: 'Ligera y letal para ataques veloces a puntos vitales.' },
    lanza_alba: { id: 'lanza_alba', name: 'Lanza de Caballería del Alba', slot: 'weapon', rarity: 'rare', icon: '🔱', price: 920, stats: { atk: 24, str: 7, agi: 5 }, desc: 'Arma de asta arrebatada a los centauros de las llanuras.' },
    arco_cazador_lyon: { id: 'arco_cazador_lyon', name: 'Arco Largo Rúnico de Lyon', slot: 'weapon', rarity: 'rare', icon: '🏹', price: 1150, stats: { atk: 26, agi: 10, crit: 8 }, desc: 'Tallado en madera de monolito con cuerda de tendón astral.' },
    mandoble_korgan: { id: 'mandoble_korgan', name: 'Mandoble de Acero Templado', slot: 'weapon', rarity: 'rare', icon: '🗡️', price: 1380, stats: { atk: 31, str: 10, vit: 4 }, desc: 'Obra maestra del yunque del Herrero Korgan.' },
    hacha_runica: { id: 'hacha_runica', name: 'Hacha de Guerra Runificada', slot: 'weapon', rarity: 'rare', icon: '🪓', price: 1450, stats: { atk: 34, str: 12, crit: 5 }, desc: 'Parte escudos y corazas con el peso de la montaña.' },
    baston_monolito: { id: 'baston_monolito', name: 'Bastón de los Ecos de Sylvaris', slot: 'weapon', rarity: 'epic', icon: '🪄', price: 2100, stats: { atk: 38, wis: 14, crit: 8, mp: 45 }, desc: 'Canaliza la energía ancestral del Bosque de los Ecos.' },
    martillo_titan: { id: 'martillo_titan', name: 'Martillo de Trueno Titánico', slot: 'weapon', rarity: 'epic', icon: '🔨', price: 2400, stats: { atk: 44, str: 16, vit: 8 }, desc: 'Cada impacto resuena como un trueno en la caldera.' },
    tridente_espejo: { id: 'tridente_espejo', name: 'Tridente Astral del Leviatán', slot: 'weapon', rarity: 'epic', icon: '🔱', price: 2900, stats: { atk: 49, str: 14, agi: 12, crit: 10 }, desc: 'Reliquia abisal recuperada del fondo del Lago del Espejo.' },
    espada_prisma_cristal: { id: 'espada_prisma_cristal', name: 'Hoja Prismática de Krystallos', slot: 'weapon', rarity: 'epic', icon: '💎', price: 3600, stats: { atk: 58, str: 18, wis: 12, crit: 12 }, desc: 'Tallada en un único cristal de Luminita de las Cuevas Cristalinas.' },
    mandoble_rayo_celeste: { id: 'mandoble_rayo_celeste', name: 'Mandoble del Rayo Celestial', slot: 'weapon', rarity: 'legendary', icon: '⚡', price: 5400, stats: { atk: 74, str: 24, wis: 16, crit: 15 }, desc: 'Bendecido en el altar central del Templo Antiguo.' },
    aethel_valkyr_mandoble: { id: 'aethel_valkyr_mandoble', name: 'Aethel-Valkyr, Espada Suprema de la Luz', slot: 'weapon', rarity: 'legendary', icon: '🌟', price: 9500, stats: { atk: 98, str: 32, agi: 18, vit: 20, crit: 22 }, desc: 'El arma definitiva de los Guerreros de la Luz que disipa el Eclipse.' },

    // Shields / Offhand (8)
    rodela_madera: { id: 'rodela_madera', name: 'Rodela de Roble Ferrado', slot: 'shield', rarity: 'common', icon: '🛡️', price: 150, stats: { def: 7, vit: 2 }, desc: 'Escudo ligero para bloquear golpes básicos.' },
    escudo_leon_dorado: { id: 'escudo_leon_dorado', name: 'Escudo del León de Aurelius', slot: 'shield', rarity: 'uncommon', icon: '🦁', price: 580, stats: { def: 15, vit: 6, str: 3 }, desc: 'Ostenta el blasón dorado de la Ciudadela de la Luz.' },
    escudo_runico_bosque: { id: 'escudo_runico_bosque', name: 'Pavés de Corteza Rúnica', slot: 'shield', rarity: 'rare', icon: '🛡️', price: 1200, stats: { def: 24, vit: 10, wis: 5 }, desc: 'Absorbe impactos físicos y proyectiles arcanos.' },
    escudo_cuarzo_astral: { id: 'escudo_cuarzo_astral', name: 'Égida de Cuarzo de las Cuevas', slot: 'shield', rarity: 'epic', icon: '💠', price: 3200, stats: { def: 38, vit: 16, wis: 12 }, desc: 'Refleja la furia de las bestias subterráneas.' },
    egida_eterna_helion: { id: 'egida_eterna_helion', name: 'Égida Imperial de Helion', slot: 'shield', rarity: 'legendary', icon: '☀️', price: 7200, stats: { def: 58, vit: 26, str: 14, wis: 14 }, desc: 'Forjada con las escamas purificadas del Dragón Vorathax.' },

    // Helms (8)
    capucha_iniciado: { id: 'capucha_iniciado', name: 'Capucha de Cuero de Vigía', slot: 'helm', rarity: 'common', icon: '🪖', price: 140, stats: { def: 5, agi: 2 }, desc: 'Protección ligera para exploradores.' },
    yelmo_vigia: { id: 'yelmo_vigia', name: 'Celada de Bronce del Bastión', slot: 'helm', rarity: 'uncommon', icon: '🪖', price: 420, stats: { def: 11, vit: 4 }, desc: 'Yelmo forjado para la guardia de las murallas.' },
    yelmo_paladin: { id: 'yelmo_paladin', name: 'Gran Yelmo de Paladín Solar', slot: 'helm', rarity: 'rare', icon: '⚜️', price: 1100, stats: { def: 20, vit: 8, str: 5 }, desc: 'Protege la cabeza frente a los golpes críticos más feroces.' },
    diadema_estelar: { id: 'diadema_estelar', name: 'Diadema del Lago del Espejo', slot: 'helm', rarity: 'epic', icon: '👑', price: 2600, stats: { def: 26, wis: 16, agi: 8, crit: 8 }, desc: 'Coronada con una perla astral que ilumina la mente.' },
    corona_serafin: { id: 'corona_serafin', name: 'Corona Áurea del Templo Antiguo', slot: 'helm', rarity: 'legendary', icon: '👑', price: 4900, stats: { def: 38, vit: 18, wis: 20, crit: 12 }, desc: 'Reliquia sagrada custodiada en el Altar del Rayo Celestial.' },
    corona_soberano_luz: { id: 'corona_soberano_luz', name: 'Corona Soberana del Amanecer Eterno', slot: 'helm', rarity: 'legendary', icon: '☀️', price: 8800, stats: { def: 48, str: 22, vit: 24, wis: 24, crit: 16 }, desc: 'Trofeo supremo de quien venció a Malakor en la Frontera de Ceniza.' },

    // Armor / Cuirass (8)
    jubon_milicia: { id: 'jubon_milicia', name: 'Jubón Acolchado de Milicia', slot: 'armor', rarity: 'common', icon: '🥋', price: 210, stats: { def: 10, vit: 3 }, desc: 'Vestimenta básica de entrenamiento.' },
    coraza_cuero_alba: { id: 'coraza_cuero_alba', name: 'Coraza de Cuero de Huargo', slot: 'armor', rarity: 'uncommon', icon: '🦺', price: 520, stats: { def: 16, agi: 6, vit: 5 }, desc: 'Flexible y resistente para cazar en las llanuras.' },
    coraza_aurelius: { id: 'coraza_aurelius', name: 'Coraza de Placas de la Orden', slot: 'armor', rarity: 'rare', icon: '🛡️', price: 1350, stats: { def: 28, vit: 12, str: 6 }, desc: 'Acero bruñido con grabados del león solar.' },
    cota_escamas_bronce: { id: 'cota_escamas_bronce', name: 'Cota de Escamas de Korgan', slot: 'armor', rarity: 'rare', icon: '🥋', price: 1550, stats: { def: 32, str: 9, vit: 10 }, desc: 'Templada a martillo en los hornos de la Ciudadela.' },
    toga_ecos: { id: 'toga_ecos', name: 'Vestimenta Rúnica de los Ecos', slot: 'armor', rarity: 'epic', icon: '🧥', price: 2350, stats: { def: 34, wis: 15, agi: 10, vit: 10 }, desc: 'Tejida con fibras encantadas de los monolitos.' },
    coraza_luminita: { id: 'coraza_luminita', name: 'Armadura Cristalina de Luminita', slot: 'armor', rarity: 'epic', icon: '💎', price: 3800, stats: { def: 46, vit: 20, str: 12, wis: 12 }, desc: 'Placas de cuarzo indestructible de las Cuevas Cristalinas.' },
    armadura_templo_solar: { id: 'armadura_templo_solar', name: 'Armadura Sagrada del Templo Antiguo', slot: 'armor', rarity: 'legendary', icon: '⚜️', price: 5800, stats: { def: 60, vit: 26, str: 18, wis: 16 }, desc: 'Irradia un aura protectora que debilita las sombras.' },
    coraza_imperial_luz: { id: 'coraza_imperial_luz', name: 'Armadura Imperial del Dragón Solar', slot: 'armor', rarity: 'legendary', icon: '🐉', price: 8500, stats: { def: 78, vit: 34, str: 26, agi: 16 }, desc: 'La armadura más poderosa de Asteria, forjada tras conquistar la Frontera de Ceniza.' },

    // Cloaks, Boots, Amulets & Rings (14)
    capa_explorador: { id: 'capa_explorador', name: 'Manto de Guardabosques de Lyon', slot: 'cloak', rarity: 'uncommon', icon: '🧥', price: 490, stats: { def: 9, agi: 7, crit: 4 }, desc: 'Camufla al portador entre la niebla del bosque.' },
    manto_solar_real: { id: 'manto_solar_real', name: 'Capa Carmesí del León Solar', slot: 'cloak', rarity: 'epic', icon: '🧣', price: 2200, stats: { def: 22, str: 10, vit: 12, crit: 6 }, desc: 'Manto de los capitanes de la Ciudadela de la Luz.' },
    botas_viento_alba: { id: 'botas_viento_alba', name: 'Botas del Viento del Alba', slot: 'boots', rarity: 'uncommon', icon: '🥾', price: 460, stats: { def: 8, agi: 8 }, desc: 'Permiten moverse con rapidez en duelos y cacerías.' },
    grebas_forjador: { id: 'grebas_forjador', name: 'Grebas Acorazadas de Korgan', slot: 'boots', rarity: 'rare', icon: '👢', price: 1120, stats: { def: 18, vit: 8, str: 5 }, desc: 'Protegen la guardia baja contra barridos enemigos.' },
    grebas_aladas_templo: { id: 'grebas_aladas_templo', name: 'Grebas Aladas del Serafín', slot: 'boots', rarity: 'legendary', icon: '🦅', price: 4400, stats: { def: 32, agi: 20, vit: 14, crit: 10 }, desc: 'Conceden la velocidad del rayo celestial.' },
    amuleto_selene: { id: 'amuleto_selene', name: 'Talismán de Zafiro de Selene', slot: 'amulet', rarity: 'rare', icon: '📿', price: 980, stats: { wis: 10, vit: 6, crit: 5 }, desc: 'Aumenta la reserva de espíritu y la precisión arcana.' },
    amuleto_lago_espejo: { id: 'amuleto_lago_espejo', name: 'Colgante de la Estrella Reflejada', slot: 'amulet', rarity: 'epic', icon: '🌟', price: 2450, stats: { wis: 16, agi: 10, vit: 10, crit: 8 }, desc: 'Forjado por el Oráculo Miriel con luz estelar condensada.' },
    corazon_krystallos: { id: 'corazon_krystallos', name: 'Corazón Prismático de Krystallos', slot: 'amulet', rarity: 'legendary', icon: '💎', price: 5200, stats: { str: 18, vit: 22, wis: 20, crit: 12 }, desc: 'Núcleo viviente del Soberano de las Cuevas Cristalinas.' },
    anillo_alquimico: { id: 'anillo_alquimico', name: 'Anillo de Oro Alquímico', slot: 'ring', rarity: 'uncommon', icon: '💍', price: 450, stats: { str: 4, wis: 5, crit: 4 }, desc: 'Aro grabado con símbolos de transmutación.' },
    anillo_druida: { id: 'anillo_druida', name: 'Sortija de Esmeralda Rúnica', slot: 'ring', rarity: 'rare', icon: '💍', price: 1050, stats: { agi: 8, vit: 8, crit: 6 }, desc: 'Pulsa con la vitalidad del Bosque de los Ecos.' },
    sello_templo_antiguo: { id: 'sello_templo_antiguo', name: 'Sello Real del Templo Antiguo', slot: 'ring', rarity: 'legendary', icon: '⚜️', price: 4800, stats: { atk: 24, str: 16, wis: 16, crit: 12 }, desc: 'Insignia de mando del Archinquisidor Vaelen.' },
    anillo_eclipse_eterno: { id: 'anillo_eclipse_eterno', name: 'Anillo Soberano del Eclipse Domesticado', slot: 'ring', rarity: 'legendary', icon: '🌑', price: 8900, stats: { atk: 38, str: 24, agi: 22, vit: 22, crit: 18 }, desc: 'El poder del Emperador Malakor subyugado por la Luz.' },

    // Profession Tools (4)
    pico_maestro: { id: 'pico_maestro', name: 'Pico Rúnico de Minero', slot: 'tool', rarity: 'uncommon', icon: '⛏️', price: 320, desc: 'Aumenta el rendimiento al extraer vetas en el Modo Caza.' },
    hoz_herbolario: { id: 'hoz_herbolario', name: 'Hoz de Plata de Herbolario', slot: 'tool', rarity: 'uncommon', icon: '🌿', price: 320, desc: 'Permite recolectar flores solares e ingredientes intactos.' },
    cana_pesca_runica: { id: 'cana_pesca_runica', name: 'Caña Astral del Lago del Espejo', slot: 'tool', rarity: 'uncommon', icon: '🎣', price: 340, desc: 'Ideal para capturar peces luminosos en el Lago del Espejo.' },

    // Consumables & Elixirs (10)
    elixir_vida_menor: { id: 'elixir_vida_menor', name: 'Elixir Carmesí Menor', slot: 'consumable', rarity: 'common', icon: '🧪', price: 85, healHp: 110, desc: 'Restaura 110 puntos de Salud en combate o exploración.' },
    elixir_vida_mayor: { id: 'elixir_vida_mayor', name: 'Gran Elixir de Sangre Solar', slot: 'consumable', rarity: 'uncommon', icon: '🍷', price: 220, healHp: 260, desc: 'Restaura 260 puntos de Salud instantáneamente.' },
    nectar_mana_astral: { id: 'nectar_mana_astral', name: 'Néctar de Éter Astral', slot: 'consumable', rarity: 'uncommon', icon: '⚗️', price: 180, healMp: 110, desc: 'Restaura 110 puntos de Energía/Maná para Super-Golpes.' },
    panacea_solar: { id: 'panacea_solar', name: 'Panacea Real de Helion', slot: 'consumable', rarity: 'epic', icon: '🏺', price: 480, healHp: 480, healMp: 220, desc: 'Restaura 480 HP y 220 MP. Imprescindible en las estancias finales.' },
    pocion_furia_titan: { id: 'pocion_furia_titan', name: 'Elixir de Furia del Titán', slot: 'consumable', rarity: 'rare', icon: '🔥', price: 340, buffAtk: 25, healHp: 150, desc: 'Otorga +25 de Ataque durante el combate actual y restaura 150 HP.' },
    balsamo_hierro: { id: 'balsamo_hierro', name: 'Bálsamo de Piel de Acero', slot: 'consumable', rarity: 'rare', icon: '🛡️', price: 320, buffDef: 22, healHp: 150, desc: 'Otorga +22 de Defensa en combate y restaura 150 HP.' },
    hidromiel_grifo: { id: 'hidromiel_grifo', name: 'Hidromiel del Grifo Dorado', slot: 'consumable', rarity: 'common', icon: '🍺', price: 95, healHp: 130, healMp: 45, desc: 'Bebida favorita de la taberna de la Ciudadela.' },
    asado_jabali: { id: 'asado_jabali', name: 'Banquete de Jabalí Acorazado', slot: 'consumable', rarity: 'uncommon', icon: '🍖', price: 140, healHp: 200, desc: 'Ración caliente que recupera 200 puntos de Salud.' },

    // Materials & Eltic Cube Reagents (12)
    lingote_bronce: { id: 'lingote_bronce', name: 'Lingote de Bronce Solar', slot: 'material', rarity: 'common', icon: '🧱', price: 70, desc: 'Metal base para la herrería de Korgan.' },
    cuero_curtido: { id: 'cuero_curtido', name: 'Piel Curtida de Huargo', slot: 'material', rarity: 'common', icon: '🦌', price: 75, desc: 'Material resistente obtenido en las Llanuras del Alba.' },
    hoja_solar: { id: 'hoja_solar', name: 'Hoja de Rocío Solar', slot: 'material', rarity: 'uncommon', icon: '🌿', price: 110, desc: 'Hierba alquímica empleada por Selene.' },
    perla_espejo: { id: 'perla_espejo', name: 'Perla Astral del Lago', slot: 'material', rarity: 'rare', icon: '🔮', price: 240, desc: 'Gema acuática de alta resonancia mágica.' },
    cristal_luminita: { id: 'cristal_luminita', name: 'Cristal Puro de Luminita', slot: 'material', rarity: 'rare', icon: '💎', price: 320, desc: 'Mineral arcano extraído de las Cuevas Cristalinas.' },
    fragmento_eltico: { id: 'fragmento_eltico', name: 'Fragmento del Cubo Éltico', slot: 'material', rarity: 'rare', icon: '🧊', price: 380, desc: 'Pieza geométrica necesaria para transmutaciones en el Cubo Éltico.' },
    catalizador_astral: { id: 'catalizador_astral', name: 'Catalizador de Fuego Astral', slot: 'material', rarity: 'epic', icon: '✨', price: 620, desc: 'Reagente superior para forjar y templar reliquias.' },
    runa_solar: { id: 'runa_solar', name: 'Runa Grabada del Templo Antiguo', slot: 'material', rarity: 'epic', icon: '☀️', price: 780, desc: 'Inscripción sagrada de los antiguos custodios.' },
    nucleo_eclipse: { id: 'nucleo_eclipse', name: 'Núcleo de Obsidiana Abisal', slot: 'material', rarity: 'legendary', icon: '🌑', price: 1100, desc: 'Condensación de energía oscura de la Frontera de Ceniza.' },
    escama_vorathax: { id: 'escama_vorathax', name: 'Escama Ardiente de Vorathax', slot: 'material', rarity: 'legendary', icon: '🐉', price: 1650, desc: 'Trofeo dracónico de dureza incomparable.' },
    riendas_alba: { id: 'riendas_alba', name: 'Riendas Reales de Doma', slot: 'material', rarity: 'rare', icon: '🐎', price: 450, desc: 'Arreo para entrenar monturas de guerra.' },
    espuelas_fuego: { id: 'espuelas_fuego', name: 'Espuelas de Brasa para Ignifer', slot: 'material', rarity: 'epic', icon: '🔥', price: 680, desc: 'Canalizan el galope ígneo de las monturas míticas.' },
    pienso_draconico: { id: 'pienso_draconico', name: 'Ración de Esencia Dracónica', slot: 'material', rarity: 'rare', icon: '🥩', price: 290, desc: 'Alimento especial para subir de nivel a tus mascotas de combate.' }
  };

  /* ------------------------------------------------------------------------
     SUPER-BLOWS (COMBOS DIRECCIONALES DE 3 ZONAS — ESTILO LEGEND / FAEO)
     ------------------------------------------------------------------------ */
  const SUPER_BLOWS = [
    {
      id: 'combo_quebrantasoles',
      name: 'Quebrantasoles de Aurelius',
      sequence: ['head', 'torso', 'head'],
      seqLabels: ['Cabeza', 'Torso', 'Cabeza'],
      mult: 1.85,
      bonusEffect: 'bleed',
      icon: '☀️',
      desc: 'Secuencia Alta-Media-Alta: Inflige 185% de daño solar y provoca Hemorragia Luminosa por 2 turnos.'
    },
    {
      id: 'combo_barrido_titan',
      name: 'Ejecución de Korgan',
      sequence: ['legs', 'torso', 'head'],
      seqLabels: ['Piernas', 'Torso', 'Cabeza'],
      mult: 2.05,
      bonusEffect: 'armor_break',
      icon: '⚒️',
      desc: 'Secuencia Ascendente: Inflige 205% de daño e ignora el 50% de la defensa y el bloqueo rival.'
    },
    {
      id: 'combo_tempestad_astral',
      name: 'Tempestad del Eclipse',
      sequence: ['torso', 'legs', 'torso'],
      seqLabels: ['Torso', 'Piernas', 'Torso'],
      mult: 1.75,
      bonusEffect: 'lifesteal',
      icon: '⚡',
      desc: 'Secuencia Media-Baja-Media: Inflige 175% de daño y drena el 35% como Salud y Maná para tu guerrero.'
    }
  ];

  /* ------------------------------------------------------------------------
     6 PROFESSIONS (GATHERING & CRAFTING)
     ------------------------------------------------------------------------ */
  const PROFESSIONS = [
    { id: 'mineria', name: 'Minería Rúnica', type: 'Recolección', icon: '⛏️', desc: 'Extracción de bronce, hierro astral, Luminita y núcleos de obsidiana en cuevas y fronteras.' },
    { id: 'herbolaria', name: 'Herbolaria Solar', type: 'Recolección', icon: '🌿', desc: 'Cosecha de flores solares, hongos bioluminiscentes y lotos estelares para alquimia.' },
    { id: 'pesca', name: 'Pesca Astral', type: 'Recolección', icon: '🎣', desc: 'Captura de carpas estelares y perlas arcanas en las aguas del Lago del Espejo.' },
    { id: 'herreria', name: 'Herrería de Guerra', type: 'Artesanía', icon: '⚒️', desc: 'Forja y templado de espadas, mandobles y corazas pesadas en el yunque de Korgan.' },
    { id: 'alquimia', name: 'Alquimia Suprema', type: 'Artesanía', icon: '⚗️', desc: 'Destilación de elixires de sangre solar, néctares de maná y panaceas reales.' },
    { id: 'joyeria', name: 'Joyería Arcana', type: 'Artesanía', icon: '💎', desc: 'Talla de amuletos, diademas estelares y sortijas rúnicas de alto poder crítico.' }
  ];

  /* ------------------------------------------------------------------------
     PETS (MASCOTAS DE COMBATE) & MOUNTS (MONTURAS INCLUYENDO IGNIFER)
     ------------------------------------------------------------------------ */
  const PETS = [
    { id: 'halcon_alba', name: 'Halcón Solar de Vigía', icon: '🦅', rarity: 'uncommon', price: 850, bonusAtk: 8, bonusCrit: 4, assistDmg: 18, desc: 'Acompaña al guerrero desde el cielo y ataca a los ojos del enemigo en cada turno.' },
    { id: 'lobo_runico', name: 'Lobo Huargo de Escarcha', icon: '🐺', rarity: 'rare', price: 1800, bonusAtk: 15, bonusCrit: 6, assistDmg: 32, desc: 'Feroz compañero de las llanuras que desgarra la guardia baja del adversario.' },
    { id: 'fenix_ascua', name: 'Draco-Fénix de Ascua', icon: '🐦‍🔥', rarity: 'epic', price: 3600, bonusAtk: 24, bonusCrit: 10, assistDmg: 48, desc: 'Envuelve a tus enemigos en llamas solares y restaura la vitalidad de su señor.' },
    { id: 'arconte_cristal', name: 'Familiar de Luminita Astral', icon: '💎', rarity: 'legendary', price: 6200, bonusAtk: 36, bonusCrit: 14, assistDmg: 72, desc: 'Entidad nacida en las Cuevas Cristalinas que dispara haces prismáticos devastadores.' }
  ];

  const MOUNTS = [
    { id: 'corcel_alba', name: 'Destrero Blanco del Alba', icon: '🐎', rarity: 'uncommon', price: 950, stats: { vit: 8, agi: 6, def: 10 }, desc: 'Corcel de guerra entrenado en los establos de la Ciudadela de la Luz.' },
    { id: 'pantera_ecos', name: 'Acechador Sombrío de los Ecos', icon: '🐆', rarity: 'rare', price: 2200, stats: { agi: 16, crit: 8, atk: 14 }, desc: 'Felino gigante silencioso como la niebla de los monolitos rúnicos.' },
    { id: 'grifo_imperial', name: 'Grifo Acorazado de Helion', icon: '🦅', rarity: 'epic', price: 4500, stats: { str: 18, vit: 18, def: 24, crit: 8 }, desc: 'Majestuosa bestia alada de los comandantes de la Orden Solar.' },
    { id: 'ignifer', name: 'Ignifer, Corcel de Fuego Primordial', icon: '🔥', rarity: 'legendary', price: 7800, stats: { str: 28, agi: 24, vit: 26, atk: 34, crit: 14 }, desc: 'La montura mítica de Asteria: sus cascos dejan un rastro de magma solar y su sola presencia aterroriza a las huestes del Eclipse.' }
  ];

  /* ------------------------------------------------------------------------
     MEDALS OF HONOR & REPUTATION ORDERS
     ------------------------------------------------------------------------ */
  const MEDALS = [
    { id: 'med_custodio_luz', name: 'Orden de los Custodios de la Luz', icon: '☀️', reqText: 'Alcanza Nivel 3 y completa 3 misiones de campaña', bonus: '+10 Fuerza, +12 Defensa', stats: { str: 10, def: 12 } },
    { id: 'med_cazador_bestias', name: 'Gran Cruz de Cazador de Asteria', icon: '🏹', reqText: 'Abate 10 criaturas y recolecta 8 recursos en Modo Caza', bonus: '+12 Agilidad, +8% Crítico', stats: { agi: 12, crit: 8 } },
    { id: 'med_domador_ignifer', name: 'Insignia de Jinete de Ignifer', icon: '🔥', reqText: 'Desbloquea o monta al corcel mítico Ignifer', bonus: '+15 Vitalidad, +18 Ataque', stats: { vit: 15, atk: 18 } },
    { id: 'med_campeon_arena', name: 'Laurel Sangriento del Coliseo', icon: '⚔️', reqText: 'Vence a 5 Guerreros IA en la Arena PvP', bonus: '+14 Fuerza, +10% Crítico', stats: { str: 14, crit: 10 } },
    { id: 'med_purgador_cristal', name: 'Estrella Prismática de Krystallos', icon: '💎', reqText: 'Derrota a Krystallos en las Cuevas Cristalinas', bonus: '+18 Sabiduría, +20 Defensa', stats: { wis: 18, def: 20 } },
    { id: 'med_soberano_alba', name: 'Gran Medalla Imperial del Amanecer Eterno', icon: '👑', reqText: 'Derrota a Vorathax y al Emperador Malakor en la Frontera de Ceniza', bonus: '+30 Ataque, +25 Vitalidad, +12% Crítico', stats: { atk: 30, vit: 25, crit: 12 } }
  ];

  /* ------------------------------------------------------------------------
     16 SPANISH AI WARRIORS (ARENA PVP & WORLD PRESENCE)
     ------------------------------------------------------------------------ */
  const AI_WARRIORS = [
    { id: 'ai_1', name: 'Valerius_El_Justo', title: 'Paladín de la Ciudadela', level: 2, faction: 'Orden Solar', clan: 'Hijos del Alba', hp: 210, atk: 24, def: 14, crit: 8, weapon: 'Espada del Sol Naciente' },
    { id: 'ai_2', name: 'Lyra_Flecha_Astral', title: 'Cazadora de los Ecos', level: 2, faction: 'Guardabosques', clan: 'Centinelas Verdes', hp: 195, atk: 27, def: 11, crit: 14, weapon: 'Arco Largo Rúnico' },
    { id: 'ai_3', name: 'Kaelen_Martillo', title: 'Forjador de Hierro', level: 3, faction: 'Gremio de Korgan', clan: 'Yunque de Fuego', hp: 260, atk: 31, def: 18, crit: 9, weapon: 'Mandoble de Acero' },
    { id: 'ai_4', name: 'Seraphina_Luz', title: 'Tejedora de Runas', level: 3, faction: 'Torre de Selene', clan: 'Cónclave Astral', hp: 240, atk: 35, def: 15, crit: 13, weapon: 'Bastón de los Ecos' },
    { id: 'ai_5', name: 'Darius_Colmillo', title: 'Domador de Huargos', level: 4, faction: 'Llanuras del Alba', clan: 'Manada Dorada', hp: 310, atk: 39, def: 20, crit: 12, weapon: 'Lanza de Caballería' },
    { id: 'ai_6', name: 'Nerea_Del_Espejo', title: 'Dama de las Estrellas', level: 4, faction: 'Lago del Espejo', clan: 'Cónclave Astral', hp: 300, atk: 43, def: 19, crit: 16, weapon: 'Tridente Astral' },
    { id: 'ai_7', name: 'Thorgar_Rompeescudos', title: 'Veterano de la Muralla', level: 5, faction: 'Orden Solar', clan: 'Yunque de Fuego', hp: 380, atk: 48, def: 25, crit: 11, weapon: 'Hacha de Guerra Runificada' },
    { id: 'ai_8', name: 'Aeliana_Viento', title: 'Ejecutora Silenciosa', level: 5, faction: 'Guardabosques', clan: 'Centinelas Verdes', hp: 345, atk: 52, def: 21, crit: 20, weapon: 'Daga Gemela de los Ecos' },
    { id: 'ai_9', name: 'Rodrigo_Sol_Dorado', title: 'Capitán de Caballería', level: 6, faction: 'Orden Solar', clan: 'Hijos del Alba', hp: 440, atk: 58, def: 29, crit: 15, weapon: 'Martillo de Trueno Titánico' },
    { id: 'ai_10', name: 'Casandra_Prisma', title: 'Arcanista de Luminita', level: 6, faction: 'Cuevas Cristalinas', clan: 'Cónclave Astral', hp: 420, atk: 63, def: 27, crit: 18, weapon: 'Hoja Prismática de Krystallos' },
    { id: 'ai_11', name: 'Garrick_Ceniza', title: 'Expurgador de Fronteras', level: 7, faction: 'Vanguardia', clan: 'Dragones de Helion', hp: 510, atk: 69, def: 33, crit: 17, weapon: 'Hoja Prismática de Krystallos' },
    { id: 'ai_12', name: 'Helena_Serafin', title: 'Custodia del Templo', level: 8, faction: 'Templo Antiguo', clan: 'Hijos del Alba', hp: 590, atk: 76, def: 38, crit: 19, weapon: 'Mandoble del Rayo Celestial' },
    { id: 'ai_13', name: 'Mordecai_Obsidiana', title: 'Cazador de Dragones', level: 8, faction: 'Frontera de Ceniza', clan: 'Dragones de Helion', hp: 620, atk: 81, def: 40, crit: 21, weapon: 'Mandoble del Rayo Celestial' },
    { id: 'ai_14', name: 'Isolda_Estrella_Alba', title: 'Paladina Imperial', level: 9, faction: 'Orden Solar', clan: 'Hijos del Alba', hp: 700, atk: 88, def: 44, crit: 22, weapon: 'Mandoble del Rayo Celestial' },
    { id: 'ai_15', name: 'Arthas_Leon_Solar', title: 'Campeón del Coliseo', level: 10, faction: 'Orden Solar', clan: 'Dragones de Helion', hp: 820, atk: 96, def: 48, crit: 24, weapon: 'Aethel-Valkyr, Espada Suprema' },
    { id: 'ai_16', name: 'Soberano_Aethelgard', title: 'Leyenda Viviente de Asteria', level: 11, faction: 'Trono de la Luz', clan: 'Dragones de Helion', hp: 960, atk: 106, def: 54, crit: 26, weapon: 'Aethel-Valkyr, Espada Suprema' }
  ];

  /* ------------------------------------------------------------------------
     MAIN CAMPAIGN QUESTS (SPANNING ALL 7 LOCATIONS & ENDGAME ESTANCIAS)
     ------------------------------------------------------------------------ */
  const QUESTS = [
    {
      id: 'q1_juramento_ciudadela',
      title: 'I. El Juramento de la Ciudadela de la Luz',
      giver: 'Comandante Aurelius',
      locationId: 'ciudadela_luz',
      desc: 'Entrena en el patio de armas de la Ciudadela de la Luz y derrota a 2 adversarios o autómatas para recibir tu equipo de campaña.',
      type: 'any_kills',
      targetCount: 2,
      rewardCopper: 450,
      rewardXp: 90,
      rewardItem: 'espada_sol_naciente'
    },
    {
      id: 'q2_caza_llanuras',
      title: 'II. Patrulla en las Llanuras del Alba',
      giver: 'Explorador Lyon',
      locationId: 'llanuras_alba',
      desc: 'Derrota al Centauro Lancero Khargol o abate criaturas en las Llanuras del Alba para asegurar el camino real.',
      type: 'loc_kills',
      targetLoc: 'llanuras_alba',
      targetCount: 2,
      rewardCopper: 850,
      rewardXp: 160,
      rewardItem: 'coraza_cuero_alba'
    },
    {
      id: 'q3_ecos_sylvaris',
      title: 'III. El Secreto del Bosque de los Ecos',
      giver: 'Archidruida Aelion',
      locationId: 'bosque_ecos',
      desc: 'Adéntrate entre los monolitos rúnicos del Bosque de los Ecos y libera a Sylvaris, Señor de los Ecos Caídos.',
      type: 'creature_id',
      targetId: 'sylvaris_archidruida',
      targetCount: 1,
      rewardCopper: 1500,
      rewardXp: 260,
      rewardItem: 'baston_monolito'
    },
    {
      id: 'q4_reflejo_leviatan',
      title: 'IV. Las Aguas del Lago del Espejo',
      giver: 'Oráculo Miriel',
      locationId: 'lago_espejo',
      desc: 'Derrota a Astraios, Leviatán del Lago del Espejo, para restaurar la claridad del santuario estelar.',
      type: 'creature_id',
      targetId: 'leviatan_estelar',
      targetCount: 1,
      rewardCopper: 2200,
      rewardXp: 380,
      rewardItem: 'diadema_estelar'
    },
    {
      id: 'q5_estancia_cristal',
      title: 'V. Estancia Final I: El Soberano de Cuarzo',
      giver: 'Arcanista Mayor Orian',
      locationId: 'cuevas_cristalinas',
      desc: 'Cruza los puentes subterráneos de las Cuevas Cristalinas y derrota al jefe Krystallos, Soberano de Cuarzo.',
      type: 'creature_id',
      targetId: 'krystallos_soberano',
      targetCount: 1,
      rewardCopper: 3600,
      rewardXp: 550,
      rewardItem: 'espada_prisma_cristal'
    },
    {
      id: 'q6_estancia_templo',
      title: 'VI. Estancia Final II: Juicio en el Templo Antiguo',
      giver: 'Sumo Custodio Solaris',
      locationId: 'templo_antiguo',
      desc: 'Enfréntate al Archinquisidor Vaelen bajo el haz de luz celestial del Templo Antiguo.',
      type: 'creature_id',
      targetId: 'archinquisidor_vaelen',
      targetCount: 1,
      rewardCopper: 5400,
      rewardXp: 820,
      rewardItem: 'mandoble_rayo_celeste'
    },
    {
      id: 'q7_estancia_ceniza',
      title: 'VII. Estancia Suprema: El Dragón y el Emperador del Eclipse',
      giver: 'General Auron Espada-Solar',
      locationId: 'frontera_ceniza',
      desc: 'Asalta la fortaleza volcánica en la Frontera de Ceniza y destrona al Emperador Malakor bajo el sol eclipsado.',
      type: 'creature_id',
      targetId: 'malakor_emperador_eclipse',
      targetCount: 1,
      rewardCopper: 15000,
      rewardXp: 1800,
      rewardItem: 'aethel_valkyr_mandoble'
    }
  ];

  /* ------------------------------------------------------------------------
     ELTIC CUBE TRANSMUTATION RECIPES
     ------------------------------------------------------------------------ */
  const CUBE_RECIPES = [
    {
      id: 'cube_panacea',
      name: 'Transmutar Panacea Real de Helion',
      resultId: 'panacea_solar',
      resultQty: 2,
      copperCost: 300,
      ingredients: [
        { itemId: 'hoja_solar', qty: 2 },
        { itemId: 'elixir_vida_menor', qty: 1 }
      ]
    },
    {
      id: 'cube_prisma_blade',
      name: 'Sintetizar Hoja Prismática de Krystallos',
      resultId: 'espada_prisma_cristal',
      resultQty: 1,
      copperCost: 1400,
      ingredients: [
        { itemId: 'cristal_luminita', qty: 3 },
        { itemId: 'fragmento_eltico', qty: 1 }
      ]
    },
    {
      id: 'cube_templo_armor',
      name: 'Consagrar Armadura Sagrada del Templo Antiguo',
      resultId: 'armadura_templo_solar',
      resultQty: 1,
      copperCost: 2400,
      ingredients: [
        { itemId: 'cristal_luminita', qty: 3 },
        { itemId: 'runa_solar', qty: 2 }
      ]
    },
    {
      id: 'cube_aethel_valkyr',
      name: 'Forja Cósmica: Aethel-Valkyr, Espada Suprema',
      resultId: 'aethel_valkyr_mandoble',
      resultQty: 1,
      copperCost: 4500,
      ingredients: [
        { itemId: 'runa_solar', qty: 2 },
        { itemId: 'nucleo_eclipse', qty: 2 },
        { itemId: 'catalizador_astral', qty: 1 }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     CURRENCY FORMATTER (100 Cobre = 1 Plata, 100 Plata = 1 Oro)
     ------------------------------------------------------------------------ */
  function splitCurrency(totalCopper) {
    const safe = Math.max(0, Math.floor(totalCopper || 0));
    const gold = Math.floor(safe / 10000);
    const silver = Math.floor((safe % 10000) / 100);
    const copper = safe % 100;
    return { gold, silver, copper };
  }

  function formatCurrencyBadge(totalCopper) {
    const c = splitCurrency(totalCopper);
    const parts = [];
    if (c.gold > 0) parts.push(`<span class="curr-g">${c.gold}o</span>`);
    if (c.silver > 0 || c.gold > 0) parts.push(`<span class="curr-s">${c.silver}p</span>`);
    parts.push(`<span class="curr-c">${c.copper}c</span>`);
    return parts.join(' ');
  }

  return {
    LOCATION_IMAGES,
    NPC_IMAGES,
    LOCATIONS,
    NPCS,
    CREATURES,
    ARTIFACTS,
    SUPER_BLOWS,
    PROFESSIONS,
    PETS,
    MOUNTS,
    MEDALS,
    AI_WARRIORS,
    QUESTS,
    CUBE_RECIPES,
    splitCurrency,
    formatCurrencyBadge
  };
})();
