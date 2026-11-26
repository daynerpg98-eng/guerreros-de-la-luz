/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/artAssets.js
   Complete Asteria (https://asteriagame.com/ & Legend: Legacy of the Dragons)
   Static Database: Factions (Ogriy vs Khair), 3 Combat Styles, 7 HD Locations,
   12 NPCs, 27 Creatures, 90+ Artifacts across 12 Slots + Runes + Scrolls +
   Chests + Tools + Crystals, 6 Directional Super-Blows, 4 Magic Spells,
   9 Professions + Crafting Recipes, 10 Faction Reputations (incl. Katala &
   Arkona), 6 Battlefields, 6 Instances (incl. La Gruta / ГРОТ), Disciples
   Academy, Red Pet Crystals, 6 Card Decks, 6 Estate Buildings, 5 Clan Talents,
   Fair of Wonders, Wheel of Fortune, Daily Feats, Auction Listings,
   Promocodes & Balagur Riddles.
   ========================================================================== */

window.GDL_ART = (function () {
  'use strict';

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
     DUAL FACTIONS (OGRIY VS KHAIR — ASTERIA / FAEO)
     ------------------------------------------------------------------------ */
  const FACTIONS = {
    ogriy: {
      id: 'ogriy',
      name: 'Humanos de Ogriy',
      capital: "O'Delvays (Ciudadela de la Luz)",
      goddess: 'Sheara',
      icon: '☀️',
      color: '#f4d068',
      bannerBg: 'rgba(244, 208, 104, 0.16)',
      stats: { def: 6, wis: 3, maxHp: 25 },
      desc: 'El continente solar de Ogriy y su capital O\'Delvays defienden el orden bajo la luz dorada de la diosa Sheara.'
    },
    khair: {
      id: 'khair',
      name: 'Magmares de Khair',
      capital: 'Dartrong (Frontera de Ceniza)',
      goddess: 'Sheara',
      icon: '🌋',
      color: '#e6483b',
      bannerBg: 'rgba(230, 72, 59, 0.18)',
      stats: { atk: 7, str: 3, crit: 3 },
      desc: 'Forjados en magma y fuego volcánico en el continente de Khair y su capital Dartrong, los Magmares viven para la conquista.'
    }
  };

  /* ------------------------------------------------------------------------
     3 CANONICAL COMBAT STYLES (TITÁN, DESTRUCTOR, SOMBRA)
     ------------------------------------------------------------------------ */
  const COMBAT_STYLES = {
    titan: {
      id: 'titan',
      name: 'Titán (Guardián Pesado)',
      shortName: 'Titán',
      icon: '🛡️',
      color: '#4ac0f0',
      defMult: 1.18,
      atkMult: 1.0,
      hpBonus: 35,
      blockMitigationBonus: 0.15,
      critBonus: 0,
      dodgeBonus: 0,
      armorPen: 0,
      desc: '+18% Defensa Total, +15% Mitigación de Bloqueo y +35 Salud Máxima. Maestro del escudo pesado.'
    },
    destructor: {
      id: 'destructor',
      name: 'Destructor (Quebrantahuesos)',
      shortName: 'Destructor',
      icon: '🪓',
      color: '#e6483b',
      defMult: 1.0,
      atkMult: 1.18,
      hpBonus: 10,
      blockMitigationBonus: 0,
      critBonus: 10,
      dodgeBonus: 0,
      armorPen: 0.25,
      desc: '+18% Ataque Total, +10% Crítico Solar y +25% Penetración de Armadura. Especialista en mandobles y hachas.'
    },
    sombra: {
      id: 'sombra',
      name: 'Sombra (Esquivador)',
      shortName: 'Sombra',
      icon: '🗡️',
      color: '#4ed679',
      defMult: 1.0,
      atkMult: 1.08,
      hpBonus: 0,
      agiBonus: 8,
      blockMitigationBonus: 0,
      critBonus: 8,
      critDmgBonus: 0.18,
      dodgeBonus: 18,
      armorPen: 0.1,
      desc: '+18% Esquiva, +8 Agilidad, +8% Crítico y +18% Daño Crítico. Letal con dagas gemelas y arcos.'
    }
  };

  /* ------------------------------------------------------------------------
     3 TACTICAL COMBAT STANCES
     ------------------------------------------------------------------------ */
  const COMBAT_STANCES = [
    {
      id: 'guardia_solar',
      name: 'Guardia Solar',
      icon: '🛡️',
      atkMod: 1.0,
      defMod: 1.25,
      blockMod: 0.35,
      dodgeChance: 4,
      desc: '+25% Defensa y Bloqueo reforzado contra ataques enemigos.'
    },
    {
      id: 'furia_dragon',
      name: 'Furia del Dragón',
      icon: '🔥',
      atkMod: 1.25,
      defMod: 0.9,
      blockMod: 0.5,
      dodgeChance: 4,
      critBonus: 10,
      desc: '+25% Daño de Ataque y +10% Crítico a cambio de -10% Defensa.'
    },
    {
      id: 'velo_sombra',
      name: 'Velo de Sombra',
      icon: '🌑',
      atkMod: 1.08,
      defMod: 1.0,
      blockMod: 0.45,
      dodgeChance: 22,
      counterBleed: true,
      desc: '22% de probabilidad de Esquiva Total y contraataque sangrante.'
    }
  ];

  /* ------------------------------------------------------------------------
     7 PANORAMIC HD LOCATIONS (WITH ENDGAME ESTANCIAS)
     ------------------------------------------------------------------------ */
  const LOCATIONS = [
    {
      id: 'ciudadela_luz',
      name: 'Ciudadela de la Luz',
      subtitle: "Bastión Capital de Ogriy (O'Delvays)",
      minLevel: 1,
      dangerLabel: 'Santuario Imperial (Nivel 1+)',
      isSafeZone: true,
      img: LOCATION_IMAGES.ciudadela_luz,
      lore: 'Las agujas doradas de la Ciudadela de la Luz se alzan sobre el desfiladero de Aethelgard. Sus braseros eternos protegen la Gran Forja, la Taberna del Grifo Dorado, el Coliseo de Arena, la Hacienda y el Santuario del Cubo Éltico.',
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
      creatures: ['centinela_sombra', 'lobo_alba', 'saqueador_stepa', 'jabalí_acorazado', 'centauro_lancero'],
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
      subtitle: 'Estancia Final Suprema — Ciudadela de Khair y del Eclipse',
      minLevel: 6,
      dangerLabel: 'Estancia Suprema (Nivel 6–12)',
      isSafeZone: false,
      isEndgameEstancia: true,
      img: LOCATION_IMAGES.frontera_ceniza,
      lore: 'Ríos de lava incandescente rodean la fortaleza de obsidiana de Dartrong bajo un eclipse solar sangriento. En la cima de la torre alada rugen el Dragón Vorathax y el Emperador Malakor, Soberano del Eclipse Eterno.',
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
     12 ILLUSTRATED NPCS (INCLUDING PESCADOR NERON)
     ------------------------------------------------------------------------ */
  const NPCS = {
    comandante_aurelius: {
      id: 'comandante_aurelius',
      name: 'Comandante Aurelius',
      title: 'Gran Maestre de los Guerreros de la Luz',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Misiones & Campaña',
      greeting: '«Soldado de Faeo, las sombras de la Frontera de Ceniza amenazan con eclipsar nuestro sol. Cumple las misiones de la Orden, conquista los Campos de Batalla y tu nombre será inmortal en Asteria.»',
      actions: ['quests', 'medals', 'clans', 'battlefields'],
      shopItems: ['espada_sol_naciente', 'escudo_leon_dorado', 'coraza_aurelius', 'yelmo_paladin', 'hombreras_paladin', 'anillo_anti_xp']
    },
    herrero_korgan: {
      id: 'herrero_korgan',
      name: 'Herrero Korgan',
      title: 'Maestro Forjador de Runas y Acero',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.herrero_korgan,
      badge: 'Herrería & Taller',
      greeting: '«¡El acero no miente! Trae minerales de las Cuevas Cristalinas y Riolita a mi yunque. Repararemos tu armadura, engastaremos Runas Legendarias y forjaremos armas dignas de abatir dragones.»',
      actions: ['professions', 'forge_shop'],
      shopItems: ['mandoble_korgan', 'hacha_runica', 'martillo_titan', 'cota_escamas_bronce', 'grebas_forjador', 'brazales_forjador', 'quijotes_acero', 'pico_maestro', 'llave_cerrajero']
    },
    alquimista_selene: {
      id: 'alquimista_selene',
      name: 'Alquimista Selene',
      title: 'Archimaga de Elixires, Sanación y Transmutación',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.alquimista_selene,
      badge: 'Alquimia & Sanación',
      greeting: '«En cada gota de rocío solar y en cada cristal del Lago del Espejo reside un poder oculto. Abastece tu cinturón de 6 ranuras con elixires y pergaminos de sanador antes de entrar a La Gruta.»',
      actions: ['alchemy_shop', 'cube', 'mirror'],
      shopItems: ['elixir_vida_menor', 'elixir_vida_mayor', 'nectar_mana_astral', 'panacea_solar', 'pocion_furia_titan', 'balsamo_hierro', 'pergamino_sanador', 'pergamino_piel_piedra', 'amuleto_selene', 'anillo_alquimico']
    },
    explorador_lyon: {
      id: 'explorador_lyon',
      name: 'Explorador Lyon',
      title: 'Rastreador Real de los Bosques y Llanuras',
      locationId: 'llanuras_alba',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Caza & Mascotas',
      greeting: '«He seguido las huellas de las bestias desde las Llanuras del Alba hasta el Bosque de los Ecos. Activa tu radar de caza, equipa tus herramientas y entrena a tus Mascotas Rojas.»',
      actions: ['hunting', 'pets', 'mounts'],
      shopItems: ['arco_cazador_lyon', 'daga_sombra_bosque', 'capa_explorador', 'botas_viento_alba', 'cinturon_cazador', 'cana_pesca_runica', 'hoz_herbolario', 'pienso_astral']
    },
    tabernero_balthus: {
      id: 'tabernero_balthus',
      name: 'Tabernero Balthus',
      title: 'Anfitrión del Grifo Dorado y Maestro Tahúr (Катала)',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.herrero_korgan,
      badge: 'Dados, Cartas & Катала',
      greeting: '«¡Acércate al fuego, viajero! Cada ronda de Dados Solares o de Cartas Arcomage eleva tu Reputación de Tahúr (Катала). ¡Si sacas un Triple Solar ganarás el triple de oro y una reliquia!»',
      actions: ['tavern', 'reputations'],
      shopItems: ['hidromiel_grifo', 'asado_jabali', 'elixir_vida_mayor', 'cofre_forjado']
    },
    maestre_eltico: {
      id: 'maestre_eltico',
      name: 'Archimago Valerion',
      title: 'Custodio del Cubo Éltico y de las Barajas',
      locationId: 'ciudadela_luz',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Cubo Éltico & Barajas',
      greeting: '«El Cubo Éltico gira con las leyes del cosmos. Inserta fragmentos, chispas celestiales y piedras de transformación para sintetizar runas y reliquias.»',
      actions: ['cube', 'decks', 'library'],
      shopItems: ['fragmento_eltico', 'catalizador_astral', 'runa_solar', 'runa_mira', 'chispa_celestial']
    },
    domador_ignis: {
      id: 'domador_ignis',
      name: 'Domador Real Varek',
      title: 'Señor de Corceles, Mascotas Rojas y Academia',
      locationId: 'llanuras_alba',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Monturas & Discípulos',
      greeting: '«Desde el Destrero del Alba hasta el mítico corcel de fuego Ignifer, mis monturas pueden invocarse en pleno combate. No olvides engastar cristales en tus Mascotas Rojas.»',
      actions: ['mounts', 'pets'],
      shopItems: ['riendas_alba', 'espuelas_fuego', 'pienso_draconico', 'pienso_astral', 'cristal_viejo_ogro', 'cristal_carmesi']
    },
    druida_aelion: {
      id: 'druida_aelion',
      name: 'Archidruida Aelion',
      title: 'Voz de los Monolitos Rúnicos',
      locationId: 'bosque_ecos',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Bosque de los Ecos',
      greeting: '«Sylvaris fue mi hermano de orden antes de que la niebla oscura quebrara su espíritu. Libéralo en combate de honor o explora el Santuario Élfico.»',
      actions: ['quests', 'hunting', 'instances'],
      shopItems: ['baston_monolito', 'toga_ecos', 'anillo_druida', 'hombreras_druida', 'panacea_solar']
    },
    oraculo_miriel: {
      id: 'oraculo_miriel',
      name: 'Oráculo Miriel',
      title: 'Vidente del Lago del Espejo',
      locationId: 'lago_espejo',
      portrait: NPC_IMAGES.alquimista_selene,
      badge: 'Espejo Mágico & Feria',
      greeting: '«Quien contempla el Lago del Espejo ve su verdadero destino. Usa el Espejo Mágico para bendecir tus atributos y gira la Rueda de la Fortuna.»',
      actions: ['mirror', 'fair', 'quests'],
      shopItems: ['diadema_estelar', 'amuleto_lago_espejo', 'nectar_mana_astral', 'pergamino_purga_solar', 'panacea_solar']
    },
    pescador_neron: {
      id: 'pescador_neron',
      name: 'Maestro Pescador Nerón',
      title: 'Guardián de las Redes Estelares del Lago',
      locationId: 'lago_espejo',
      portrait: NPC_IMAGES.explorador_lyon,
      badge: 'Pesca Astral & Cofres',
      greeting: '«En las profundidades del Lago del Espejo no solo nadan carpas astrales; mis redes han sacado cofres de mitril sellados por antiguos cerrajeros de Faeo.»',
      actions: ['hunting', 'professions'],
      shopItems: ['cana_pesca_runica', 'perla_espejo', 'cofre_mitril', 'llave_cerrajero', 'asado_jabali']
    },
    arcanista_orian: {
      id: 'arcanista_orian',
      name: 'Arcanista Mayor Orian',
      title: 'Expedicionario de las Cuevas Cristalinas',
      locationId: 'cuevas_cristalinas',
      portrait: NPC_IMAGES.alquimista_selene,
      badge: 'Estancia I & Cristales',
      greeting: '«Las Cuevas Cristalinas vibran con poder arcano puro. Extrae cristales rojos y azules para los Caballeros Subterráneos o derrota a Krystallos.»',
      actions: ['quests', 'battlefields', 'cube'],
      shopItems: ['espada_prisma_cristal', 'coraza_luminita', 'escudo_cuarzo_astral', 'quijotes_luminita', 'panacea_solar']
    },
    sumo_custodio_solaris: {
      id: 'sumo_custodio_solaris',
      name: 'Sumo Custodio Solaris',
      title: 'Guardián del Altar del Rayo Celestial',
      locationId: 'templo_antiguo',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Estancia II & Reputaciones',
      greeting: '«El rayo sagrado del Templo Antiguo juzga el corazón de los héroes. Derrota a los Serafines de Piedra y al Archinquisidor Vaelen para alcanzar la Medalla de Culto.»',
      actions: ['quests', 'reputations', 'medals'],
      shopItems: ['mandoble_rayo_celeste', 'armadura_templo_solar', 'corona_serafin', 'cinturon_titan_solar', 'runa_sina']
    },
    general_auron: {
      id: 'general_auron',
      name: 'General Auron Espada-Solar',
      title: 'Comandante del Asedio en la Frontera de Ceniza',
      locationId: 'frontera_ceniza',
      portrait: NPC_IMAGES.comandante_aurelius,
      badge: 'Estancia Suprema & Gruta',
      greeting: '«¡Esta es la batalla final de nuestra era! Abate a los Mirmidones Piros, al Dragón Vorathax y destrona al Emperador Malakor.»',
      actions: ['quests', 'instances', 'battlefields'],
      shopItems: ['aethel_valkyr_mandoble', 'egida_eterna_helion', 'coraza_imperial_luz', 'hombreras_soberano', 'runa_inevitabilidad']
    }
  };

  /* ------------------------------------------------------------------------
     27 CREATURES & ENDGAME ESTANCIA BOSSES (WITH AGGRO LEVEL & COLOR RINGS)
     ------------------------------------------------------------------------ */
  const CREATURES = [
    // Ciudadela de la Luz (1-3)
    { id: 'maniqui_acero', name: 'Autómata de Instrucción Rúnico', level: 1, hp: 90, atk: 12, def: 4, agi: 5, crit: 4, xp: 30, copper: 140, loc: 'ciudadela_luz', icon: '🗿', type: 'Constructo', aggro: 'peaceful', aggroPct: 0, drops: ['elixir_vida_menor', 'lingote_bronce'] },
    { id: 'recluta_orden', name: 'Escudero de Práctica Solar', level: 1, hp: 115, atk: 15, def: 6, agi: 7, crit: 6, xp: 40, copper: 185, loc: 'ciudadela_luz', icon: '🛡️', type: 'Humanoide', aggro: 'peaceful', aggroPct: 5, drops: ['elixir_vida_menor', 'espada_iniciado'] },
    { id: 'gargola_bastion', name: 'Gárgola Despierta del Campanario', level: 2, hp: 145, atk: 19, def: 9, agi: 9, crit: 8, xp: 55, copper: 260, loc: 'ciudadela_luz', icon: '🦇', type: 'Gárgola', aggro: 'moderate', aggroPct: 20, drops: ['lingote_bronce', 'yelmo_vigia'] },

    // Llanuras del Alba (4-8)
    { id: 'centinela_sombra', name: 'Centinela de Sombra Errante', level: 1, hp: 95, atk: 14, def: 5, agi: 8, crit: 5, xp: 45, copper: 190, loc: 'llanuras_alba', icon: '👤', type: 'Sombra', aggro: 'moderate', aggroPct: 20, drops: ['elixir_vida_menor', 'cuero_curtido'] },
    { id: 'lobo_alba', name: 'Huargo Crin-Dorada', level: 2, hp: 140, atk: 20, def: 7, agi: 12, crit: 10, xp: 52, copper: 240, loc: 'llanuras_alba', icon: '🐺', type: 'Bestia', aggro: 'moderate', aggroPct: 25, drops: ['cuero_curtido', 'elixir_vida_menor'] },
    { id: 'saqueador_stepa', name: 'Saqueador de la Estepa Oscura', level: 2, hp: 165, atk: 23, def: 9, agi: 10, crit: 9, xp: 64, copper: 310, loc: 'llanuras_alba', icon: '🗡️', type: 'Humanoide', aggro: 'aggressive', aggroPct: 45, drops: ['daga_sombra_bosque', 'elixir_vida_menor'] },
    { id: 'jabalí_acorazado', name: 'Colmillo-Férreo de las Llanuras', level: 3, hp: 205, atk: 27, def: 13, agi: 8, crit: 8, xp: 82, copper: 390, loc: 'llanuras_alba', icon: '🐗', type: 'Bestia', aggro: 'moderate', aggroPct: 30, drops: ['cuero_curtido', 'coraza_cuero_alba'] },
    { id: 'centauro_lancero', name: 'Khargol, Centauro Lancero', level: 3, hp: 245, atk: 32, def: 14, agi: 14, crit: 12, xp: 105, copper: 520, loc: 'llanuras_alba', icon: '🏇', type: 'Élite', isElite: true, aggro: 'aggressive', aggroPct: 60, drops: ['lanza_alba', 'botas_viento_alba', 'fragmento_eltico'] },

    // Bosque de los Ecos (8-11)
    { id: 'acechador_musgo', name: 'Acechador de Raíces Vivientes', level: 3, hp: 215, atk: 29, def: 13, agi: 12, crit: 10, xp: 90, copper: 440, loc: 'bosque_ecos', icon: '🌿', type: 'Silvano', aggro: 'peaceful', aggroPct: 10, drops: ['hoja_solar', 'nectar_mana_astral'] },
    { id: 'oso_runico', name: 'Oso Guardián de los Monolitos', level: 4, hp: 275, atk: 35, def: 17, agi: 10, crit: 9, xp: 118, copper: 580, loc: 'bosque_ecos', icon: '🐻', type: 'Bestia', aggro: 'moderate', aggroPct: 35, drops: ['cuero_curtido', 'anillo_druida'] },
    { id: 'espectro_arboleda', name: 'Espectro Susurrante del Bosque', level: 4, hp: 255, atk: 38, def: 14, agi: 17, crit: 15, xp: 128, copper: 630, loc: 'bosque_ecos', icon: '👻', type: 'Espectro', aggro: 'aggressive', aggroPct: 55, drops: ['nectar_mana_astral', 'capa_explorador'] },
    { id: 'sylvaris_archidruida', name: 'Sylvaris, Señor de los Ecos Caídos', level: 5, hp: 360, atk: 45, def: 20, agi: 18, crit: 16, xp: 195, copper: 1150, loc: 'bosque_ecos', icon: '🦌', type: 'Jefe de Bosque', isBoss: true, aggro: 'boss', aggroPct: 80, drops: ['baston_monolito', 'toga_ecos', 'fragmento_eltico'] },

    // Lago del Espejo (12-15)
    { id: 'sirena_abismo', name: 'Náyade de las Aguas Nocturnas', level: 4, hp: 270, atk: 39, def: 16, agi: 18, crit: 14, xp: 135, copper: 670, loc: 'lago_espejo', icon: '🧜‍♀️', type: 'Acuático', aggro: 'moderate', aggroPct: 25, drops: ['perla_espejo', 'nectar_mana_astral'] },
    { id: 'serpiente_espejo', name: 'Serpiente Cristalina del Lago', level: 5, hp: 320, atk: 44, def: 19, agi: 19, crit: 15, xp: 160, copper: 810, loc: 'lago_espejo', icon: '🐍', type: 'Bestia', aggro: 'aggressive', aggroPct: 50, drops: ['perla_espejo', 'elixir_vida_mayor'] },
    { id: 'elemental_escarcha', name: 'Elemental de Reflejo Estelar', level: 5, hp: 345, atk: 47, def: 22, agi: 15, crit: 13, xp: 175, copper: 890, loc: 'lago_espejo', icon: '❄️', type: 'Elemental', aggro: 'moderate', aggroPct: 35, drops: ['cristal_luminita', 'amuleto_lago_espejo'] },
    { id: 'leviatan_estelar', name: 'Astraios, Leviatán del Lago del Espejo', level: 6, hp: 460, atk: 55, def: 25, agi: 20, crit: 18, xp: 265, copper: 1650, loc: 'lago_espejo', icon: '🐉', type: 'Jefe Acuático', isBoss: true, aggro: 'boss', aggroPct: 85, drops: ['diadema_estelar', 'tridente_espejo', 'catalizador_astral'] },

    // Cuevas Cristalinas — Estancia Final I (16-19)
    { id: 'escorpion_prisma', name: 'Escorpión de Cuarzo Lumínico', level: 5, hp: 350, atk: 48, def: 23, agi: 17, crit: 15, xp: 185, copper: 940, loc: 'cuevas_cristalinas', icon: '🦂', type: 'Arácnido', aggro: 'moderate', aggroPct: 40, drops: ['cristal_luminita', 'elixir_vida_mayor'] },
    { id: 'devorador_mana', name: 'Devorador de Vetas Astrales', level: 6, hp: 410, atk: 54, def: 25, agi: 19, crit: 16, xp: 220, copper: 1180, loc: 'cuevas_cristalinas', icon: '👾', type: 'Aberración', aggro: 'aggressive', aggroPct: 60, drops: ['cristal_luminita', 'escudo_cuarzo_astral'] },
    { id: 'golem_luminita', name: 'Coloso de Luminita Arcana', level: 7, hp: 490, atk: 60, def: 30, agi: 14, crit: 14, xp: 270, copper: 1480, loc: 'cuevas_cristalinas', icon: '💎', type: 'Constructo Élite', isElite: true, aggro: 'aggressive', aggroPct: 65, drops: ['coraza_luminita', 'catalizador_astral', 'riolita'] },
    { id: 'krystallos_soberano', name: 'Krystallos, Soberano de las Cuevas Cristalinas', level: 8, hp: 1200, atk: 70, def: 35, agi: 21, crit: 20, xp: 390, copper: 2600, loc: 'cuevas_cristalinas', icon: '👑', type: 'Jefe de Estancia Final I', isBoss: true, aggro: 'boss', aggroPct: 90, drops: ['espada_prisma_cristal', 'coraza_luminita', 'corazon_krystallos', 'riolita'] },

    // Templo Antiguo — Estancia Final II (20-23: includes inquisidor_reliquia & serafin_piedra)
    { id: 'centinela_alado', name: 'Gólem Alado del Santuario Solar', level: 7, hp: 510, atk: 64, def: 31, agi: 19, crit: 17, xp: 295, copper: 1680, loc: 'templo_antiguo', icon: '🦅', type: 'Celestial', aggro: 'moderate', aggroPct: 45, drops: ['runa_solar', 'panacea_solar'] },
    { id: 'inquisidor_reliquia', name: 'Inquisidor de la Reliquia Astral', level: 7, hp: 540, atk: 67, def: 33, agi: 20, crit: 18, xp: 320, copper: 1850, loc: 'templo_antiguo', icon: '⚖️', type: 'Custodio', aggro: 'aggressive', aggroPct: 60, drops: ['runa_solar', 'chispa_celestial', 'brazales_forjador'] },
    { id: 'serafin_piedra', name: 'Serafín de Piedra del Rayo', level: 8, hp: 610, atk: 73, def: 37, agi: 18, crit: 19, xp: 370, copper: 2200, loc: 'templo_antiguo', icon: '🗿', type: 'Coloso Élite', isElite: true, aggro: 'aggressive', aggroPct: 70, drops: ['corona_serafin', 'riolita', 'cofre_mitril'] },
    { id: 'archinquisidor_vaelen', name: 'Archinquisidor Vaelen del Rayo Celestial', level: 9, hp: 760, atk: 82, def: 39, agi: 24, crit: 22, xp: 520, copper: 3800, loc: 'templo_antiguo', icon: '⚜️', type: 'Jefe de Estancia Final II', isBoss: true, aggro: 'boss', aggroPct: 92, drops: ['mandoble_rayo_celeste', 'armadura_templo_solar', 'corona_serafin', 'sello_templo_antiguo'] },

    // Frontera de Ceniza — Estancia Final Suprema (24-27: includes mirmidon_piros)
    { id: 'mirmidon_piros', name: 'Mirmidón Piros de Obsidiana', level: 8, hp: 560, atk: 71, def: 34, agi: 22, crit: 18, xp: 340, copper: 1980, loc: 'frontera_ceniza', icon: '🔥', type: 'Legionario de Magma', aggro: 'aggressive', aggroPct: 65, drops: ['nucleo_eclipse', 'riolita', 'chispa_celestial'] },
    { id: 'caballero_ceniza', name: 'Caballero Juramentado del Eclipse', level: 8, hp: 590, atk: 74, def: 36, agi: 21, crit: 19, xp: 360, copper: 2150, loc: 'frontera_ceniza', icon: '⚔️', type: 'Guardia Abisal', isElite: true, aggro: 'aggressive', aggroPct: 75, drops: ['nucleo_eclipse', 'panacea_solar', 'cofre_mitril'] },
    { id: 'vorathax_dragon_eclipse', name: 'Vorathax, Dragón de la Fortaleza de Ceniza', level: 10, hp: 920, atk: 94, def: 44, agi: 26, crit: 24, xp: 750, copper: 5800, loc: 'frontera_ceniza', icon: '🐉', type: 'Jefe Dragón Imperial', isBoss: true, aggro: 'boss', aggroPct: 95, drops: ['egida_eterna_helion', 'coraza_imperial_luz', 'escama_vorathax'] },
    { id: 'malakor_emperador_eclipse', name: 'Malakor, Emperador del Eclipse Eterno', level: 12, hp: 1250, atk: 112, def: 52, agi: 30, crit: 28, xp: 1400, copper: 12000, loc: 'frontera_ceniza', icon: '🌑', type: 'Jefe Final Supremo', isBoss: true, isFinalBoss: true, aggro: 'boss', aggroPct: 100, drops: ['aethel_valkyr_mandoble', 'corona_soberano_luz', 'anillo_eclipse_eterno'] }
  ];

  /* ------------------------------------------------------------------------
     90+ ARTIFACTS ACROSS 12 EQUIPMENT SLOTS, RUNES, SCROLLS, CHESTS & TOOLS
     ------------------------------------------------------------------------ */
  const ARTIFACTS = {
    // 1. Weapons (15)
    espada_iniciado: { id: 'espada_iniciado', name: 'Espada Corta de Iniciado', slot: 'weapon', category: 'gear', rarity: 'common', icon: '🗡️', price: 180, minLevel: 1, maxDurability: 50, stats: { atk: 9, str: 2 }, desc: 'Hoja reglamentaria de los reclutas de la Ciudadela.' },
    espada_solar: { id: 'espada_solar', name: 'Espada Solar de la Guardia', slot: 'weapon', category: 'gear', rarity: 'uncommon', icon: '⚔️', price: 520, minLevel: 1, maxDurability: 60, stats: { atk: 15, str: 5, crit: 3 }, desc: 'Hoja templada al fuego solar de la Ciudadela.' },
    espada_sol_naciente: { id: 'espada_sol_naciente', name: 'Espada del Sol Naciente', slot: 'weapon', category: 'gear', rarity: 'uncommon', icon: '⚔️', price: 540, minLevel: 1, maxDurability: 60, stats: { atk: 16, str: 5, crit: 3 }, desc: 'Forjada con bronce bendecido por el Comandante Aurelius.' },
    daga_sombra_bosque: { id: 'daga_sombra_bosque', name: 'Daga Gemela de los Ecos', slot: 'weapon', category: 'gear', rarity: 'uncommon', icon: '🔪', price: 480, minLevel: 1, maxDurability: 55, stats: { atk: 14, agi: 6, crit: 6 }, desc: 'Ligera y letal para ataques veloces del estilo Sombra.' },
    lanza_alba: { id: 'lanza_alba', name: 'Lanza de Caballería del Alba', slot: 'weapon', category: 'gear', rarity: 'rare', icon: '🔱', price: 920, minLevel: 2, maxDurability: 65, stats: { atk: 24, str: 7, agi: 5 }, desc: 'Arma de asta arrebatada a los centauros de las llanuras.' },
    arco_cazador_lyon: { id: 'arco_cazador_lyon', name: 'Arco Largo Rúnico de Lyon', slot: 'weapon', category: 'gear', rarity: 'rare', icon: '🏹', price: 1150, minLevel: 2, maxDurability: 65, stats: { atk: 26, agi: 10, crit: 8 }, desc: 'Tallado en madera de monolito con cuerda de tendón astral.' },
    mandoble_korgan: { id: 'mandoble_korgan', name: 'Mandoble de Acero Templado', slot: 'weapon', category: 'gear', rarity: 'rare', icon: '🗡️', price: 1380, minLevel: 2, maxDurability: 70, stats: { atk: 31, str: 10, vit: 4 }, desc: 'Obra maestra del yunque del Herrero Korgan.' },
    hacha_runica: { id: 'hacha_runica', name: 'Hacha de Guerra Runificada', slot: 'weapon', category: 'gear', rarity: 'rare', icon: '🪓', price: 1450, minLevel: 3, maxDurability: 70, stats: { atk: 34, str: 12, crit: 5 }, desc: 'Parte escudos y corazas para los guerreros Destructores.' },
    baston_monolito: { id: 'baston_monolito', name: 'Bastón de los Ecos de Sylvaris', slot: 'weapon', category: 'gear', rarity: 'epic', icon: '🪄', price: 2100, minLevel: 3, maxDurability: 75, stats: { atk: 38, wis: 14, crit: 8, mp: 45 }, desc: 'Canaliza la energía ancestral y amplía el maná máximo (+45 MP).' },
    martillo_titan: { id: 'martillo_titan', name: 'Martillo de Trueno Titánico', slot: 'weapon', category: 'gear', rarity: 'epic', icon: '🔨', price: 2400, minLevel: 4, maxDurability: 80, stats: { atk: 44, str: 16, vit: 8 }, desc: 'Cada impacto resuena como un trueno en la caldera.' },
    tridente_espejo: { id: 'tridente_espejo', name: 'Tridente Astral del Leviatán', slot: 'weapon', category: 'gear', rarity: 'epic', icon: '🔱', price: 2900, minLevel: 4, maxDurability: 80, stats: { atk: 49, str: 14, agi: 12, crit: 10 }, desc: 'Reliquia abisal recuperada del fondo del Lago del Espejo.' },
    espada_prisma_cristal: { id: 'espada_prisma_cristal', name: 'Hoja Prismática de Krystallos', slot: 'weapon', category: 'gear', rarity: 'epic', icon: '💎', price: 3600, minLevel: 5, maxDurability: 85, stats: { atk: 58, str: 18, wis: 12, crit: 12 }, desc: 'Tallada en un único cristal de Luminita de las Cuevas Cristalinas.' },
    mandoble_rayo_celeste: { id: 'mandoble_rayo_celeste', name: 'Mandoble del Rayo Celestial', slot: 'weapon', category: 'gear', rarity: 'legendary', icon: '⚡', price: 5400, minLevel: 6, maxDurability: 95, stats: { atk: 74, str: 24, wis: 16, crit: 15 }, desc: 'Bendecido en el altar central del Templo Antiguo.' },
    aethel_valkyr_mandoble: { id: 'aethel_valkyr_mandoble', name: 'Aethel-Valkyr, Espada Suprema de la Luz', slot: 'weapon', category: 'gear', rarity: 'legendary', icon: '🌟', price: 9500, minLevel: 7, maxDurability: 120, stats: { atk: 98, str: 32, agi: 18, vit: 20, crit: 22 }, desc: 'El arma definitiva de los Guerreros de la Luz que disipa el Eclipse.' },
    espada_gladiador_valor: { id: 'espada_gladiador_valor', name: 'Hoja de Valor de Tallaar', slot: 'weapon', category: 'gear', rarity: 'legendary', icon: '⚔️', price: 4800, minLevel: 3, maxDurability: 100, stats: { atk: 66, str: 22, crit: 16 }, desc: 'Forjada en el Arsenal de Campos de Batalla para campeones de Valor.' },

    // 2. Shields / Offhand (6)
    rodela_madera: { id: 'rodela_madera', name: 'Rodela de Roble Ferrado', slot: 'shield', category: 'gear', rarity: 'common', icon: '🛡️', price: 150, minLevel: 1, maxDurability: 50, stats: { def: 7, vit: 2 }, desc: 'Escudo ligero para bloquear golpes básicos.' },
    escudo_leon_dorado: { id: 'escudo_leon_dorado', name: 'Escudo del León de Aurelius', slot: 'shield', category: 'gear', rarity: 'uncommon', icon: '🦁', price: 580, minLevel: 1, maxDurability: 60, stats: { def: 15, vit: 6, str: 3 }, desc: 'Ostenta el blasón dorado de la Ciudadela de la Luz.' },
    escudo_runico_bosque: { id: 'escudo_runico_bosque', name: 'Pavés de Corteza Rúnica', slot: 'shield', category: 'gear', rarity: 'rare', icon: '🛡️', price: 1200, minLevel: 2, maxDurability: 70, stats: { def: 24, vit: 10, wis: 5 }, desc: 'Absorbe impactos físicos y proyectiles arcanos.' },
    escudo_cuarzo_astral: { id: 'escudo_cuarzo_astral', name: 'Égida de Cuarzo de las Cuevas', slot: 'shield', category: 'gear', rarity: 'epic', icon: '💠', price: 3200, minLevel: 4, maxDurability: 85, stats: { def: 38, vit: 16, wis: 12 }, desc: 'Refleja la furia de las bestias subterráneas.' },
    egida_eterna_helion: { id: 'egida_eterna_helion', name: 'Égida Imperial de Helion', slot: 'shield', category: 'gear', rarity: 'legendary', icon: '☀️', price: 7200, minLevel: 6, maxDurability: 110, stats: { def: 58, vit: 26, str: 14, wis: 14 }, desc: 'Forjada con las escamas purificadas del Dragón Vorathax.' },

    // 3. Helms (6)
    capucha_iniciado: { id: 'capucha_iniciado', name: 'Capucha de Cuero de Vigía', slot: 'helm', category: 'gear', rarity: 'common', icon: '🪖', price: 140, minLevel: 1, maxDurability: 50, stats: { def: 5, agi: 2 }, desc: 'Protección ligera para exploradores.' },
    yelmo_vigia: { id: 'yelmo_vigia', name: 'Celada de Bronce del Bastión', slot: 'helm', category: 'gear', rarity: 'uncommon', icon: '🪖', price: 420, minLevel: 1, maxDurability: 60, stats: { def: 11, vit: 4 }, desc: 'Yelmo forjado para la guardia de las murallas.' },
    yelmo_paladin: { id: 'yelmo_paladin', name: 'Gran Yelmo de Paladín Solar', slot: 'helm', category: 'gear', rarity: 'rare', icon: '⚜️', price: 1100, minLevel: 2, maxDurability: 70, stats: { def: 20, vit: 8, str: 5 }, desc: 'Protege la cabeza frente a los golpes críticos más feroces.' },
    diadema_estelar: { id: 'diadema_estelar', name: 'Diadema del Lago del Espejo', slot: 'helm', category: 'gear', rarity: 'epic', icon: '👑', price: 2600, minLevel: 4, maxDurability: 80, stats: { def: 26, wis: 16, agi: 8, crit: 8, mp: 30 }, desc: 'Coronada con una perla astral que ilumina la mente (+30 MP).' },
    corona_serafin: { id: 'corona_serafin', name: 'Corona Áurea del Templo Antiguo', slot: 'helm', category: 'gear', rarity: 'legendary', icon: '👑', price: 4900, minLevel: 5, maxDurability: 95, stats: { def: 38, vit: 18, wis: 20, crit: 12, mp: 45 }, desc: 'Reliquia sagrada custodiada en el Altar del Rayo Celestial.' },
    corona_soberano_luz: { id: 'corona_soberano_luz', name: 'Corona Soberana del Amanecer Eterno', slot: 'helm', category: 'gear', rarity: 'legendary', icon: '☀️', price: 8800, minLevel: 7, maxDurability: 120, stats: { def: 48, str: 22, vit: 24, wis: 24, crit: 16, mp: 60 }, desc: 'Trofeo supremo de quien venció a Malakor en la Frontera de Ceniza.' },

    // 4. Armor / Cuirass (8)
    jubon_milicia: { id: 'jubon_milicia', name: 'Jubón Acolchado de Milicia', slot: 'armor', category: 'gear', rarity: 'common', icon: '🥋', price: 210, minLevel: 1, maxDurability: 55, stats: { def: 10, vit: 3 }, desc: 'Vestimenta básica de entrenamiento.' },
    coraza_cuero_alba: { id: 'coraza_cuero_alba', name: 'Coraza de Cuero de Huargo', slot: 'armor', category: 'gear', rarity: 'uncommon', icon: '🦺', price: 520, minLevel: 1, maxDurability: 60, stats: { def: 16, agi: 6, vit: 5 }, desc: 'Flexible y resistente para cazar en las llanuras.' },
    coraza_aurelius: { id: 'coraza_aurelius', name: 'Coraza de Placas de la Orden', slot: 'armor', category: 'gear', rarity: 'rare', icon: '🛡️', price: 1350, minLevel: 2, maxDurability: 75, stats: { def: 28, vit: 12, str: 6 }, desc: 'Acero bruñido con grabados del león solar.' },
    cota_escamas_bronce: { id: 'cota_escamas_bronce', name: 'Cota de Escamas de Korgan', slot: 'armor', category: 'gear', rarity: 'rare', icon: '🥋', price: 1550, minLevel: 3, maxDurability: 75, stats: { def: 32, str: 9, vit: 10 }, desc: 'Templada a martillo en los hornos de la Ciudadela.' },
    toga_ecos: { id: 'toga_ecos', name: 'Vestimenta Rúnica de los Ecos', slot: 'armor', category: 'gear', rarity: 'epic', icon: '🧥', price: 2350, minLevel: 3, maxDurability: 80, stats: { def: 34, wis: 15, agi: 10, vit: 10, mp: 35 }, desc: 'Tejida con fibras encantadas de los monolitos.' },
    coraza_luminita: { id: 'coraza_luminita', name: 'Armadura Cristalina de Luminita', slot: 'armor', category: 'gear', rarity: 'epic', icon: '💎', price: 3800, minLevel: 5, maxDurability: 90, stats: { def: 46, vit: 20, str: 12, wis: 12 }, desc: 'Placas de cuarzo indestructible de las Cuevas Cristalinas.' },
    armadura_templo_solar: { id: 'armadura_templo_solar', name: 'Armadura Sagrada del Templo Antiguo', slot: 'armor', category: 'gear', rarity: 'legendary', icon: '⚜️', price: 5800, minLevel: 6, maxDurability: 105, stats: { def: 60, vit: 26, str: 18, wis: 16 }, desc: 'Irradia un aura protectora que debilita las sombras.' },
    coraza_imperial_luz: { id: 'coraza_imperial_luz', name: 'Armadura Imperial del Dragón Solar', slot: 'armor', category: 'gear', rarity: 'legendary', icon: '🐉', price: 8500, minLevel: 7, maxDurability: 120, stats: { def: 78, vit: 34, str: 26, agi: 16 }, desc: 'La armadura más poderosa de Asteria, forjada tras conquistar la Frontera de Ceniza.' },

    // 5. NEW SLOT: Pauldrons / Hombreras (4)
    hombreras_iniciado: { id: 'hombreras_iniciado', name: 'Hombreras de Cuero Claveteado', slot: 'pauldrons', category: 'gear', rarity: 'common', icon: '🛡️', price: 160, minLevel: 1, maxDurability: 50, stats: { def: 6, str: 2 }, desc: 'Espaldares ligeros de recluta.' },
    hombreras_paladin: { id: 'hombreras_paladin', name: 'Hombreras de León Solar', slot: 'pauldrons', category: 'gear', rarity: 'rare', icon: '🦁', price: 960, minLevel: 2, maxDurability: 70, stats: { def: 16, str: 7, vit: 6 }, desc: 'Forjadas con cabezas de león dorado de O\'Delvays.' },
    hombreras_druida: { id: 'hombreras_druida', name: 'Hombreras Rúnicas de Sylvaris', slot: 'pauldrons', category: 'gear', rarity: 'epic', icon: '🌿', price: 2100, minLevel: 4, maxDurability: 80, stats: { def: 24, wis: 12, agi: 9, mp: 25 }, desc: 'Canalizan la brisa arcana del Bosque de los Ecos.' },
    hombreras_soberano: { id: 'hombreras_soberano', name: 'Hombreras Imperiales de Vorathax', slot: 'pauldrons', category: 'gear', rarity: 'legendary', icon: '🐉', price: 5200, minLevel: 6, maxDurability: 105, stats: { def: 38, str: 18, vit: 18, crit: 8 }, desc: 'Acorazadas con escamas ardientes del dragón del eclipse.' },

    // 6. NEW SLOT: Bracers / Brazales (3)
    brazales_cuero: { id: 'brazales_cuero', name: 'Brazales de Guardia Solar', slot: 'bracers', category: 'gear', rarity: 'common', icon: '🧤', price: 150, minLevel: 1, maxDurability: 50, stats: { def: 5, agi: 3 }, desc: 'Protegen los antebrazos al blandir espada o arco.' },
    brazales_forjador: { id: 'brazales_forjador', name: 'Brazales Rúnicos de Korgan', slot: 'bracers', category: 'gear', rarity: 'rare', icon: '⚒️', price: 890, minLevel: 2, maxDurability: 70, stats: { def: 14, str: 8, crit: 4 }, desc: 'Reforzados con runas de golpe maestro.' },
    brazales_celestes: { id: 'brazales_celestes', name: 'Brazales del Rayo Celestial', slot: 'bracers', category: 'gear', rarity: 'legendary', icon: '⚡', price: 4200, minLevel: 5, maxDurability: 95, stats: { def: 28, str: 15, agi: 14, crit: 10 }, desc: 'Aceleran cada estocada con electricidad astral.' },

    // 7. NEW SLOT: Cuisses / Quijotes (3)
    quijotes_milicia: { id: 'quijotes_milicia', name: 'Quijotes de Malla de Iniciado', slot: 'cuisses', category: 'gear', rarity: 'common', icon: '👖', price: 170, minLevel: 1, maxDurability: 50, stats: { def: 7, vit: 3 }, desc: 'Protección de muslos y guardia baja.' },
    quijotes_acero: { id: 'quijotes_acero', name: 'Quijotes Templados de Bastión', slot: 'cuisses', category: 'gear', rarity: 'rare', icon: '🛡️', price: 980, minLevel: 2, maxDurability: 70, stats: { def: 18, vit: 9, str: 5 }, desc: 'Placas articuladas que resisten barridos pesados.' },
    quijotes_luminita: { id: 'quijotes_luminita', name: 'Quijotes Prismáticos de Krystallos', slot: 'cuisses', category: 'gear', rarity: 'epic', icon: '💎', price: 2950, minLevel: 4, maxDurability: 85, stats: { def: 30, vit: 15, agi: 10, wis: 8 }, desc: 'Forjados con cristales puros de las Cuevas Cristalinas.' },

    // 8. NEW SLOT: Belt / Cinturón (3)
    cinturon_iniciado: { id: 'cinturon_iniciado', name: 'Cinturón Táctico de 6 Ranuras', slot: 'belt', category: 'gear', rarity: 'common', icon: 'ベルト', price: 145, minLevel: 1, maxDurability: 50, stats: { def: 4, vit: 3 }, desc: 'Habilita las 6 ranuras de elixires y pergaminos en combate.' },
    cinturon_cazador: { id: 'cinturon_cazador', name: 'Cinturón de Alquimia de Lyon', slot: 'belt', category: 'gear', rarity: 'rare', icon: '🎗️', price: 840, minLevel: 2, maxDurability: 70, stats: { def: 12, agi: 8, vit: 7, crit: 4 }, desc: 'Hebilla grabada con runas de velocidad y bolsas para pociones.' },
    cinturon_titan_solar: { id: 'cinturon_titan_solar', name: 'Faja Imperial de los Titanes', slot: 'belt', category: 'gear', rarity: 'legendary', icon: '☀️', price: 4100, minLevel: 5, maxDurability: 100, stats: { def: 26, str: 16, vit: 18, crit: 8 }, desc: 'Cinturón de guerra de los campeones del Templo Antiguo.' },

    // 9. Cloaks, Boots, Amulets & Rings (including Anti-XP Ring)
    capa_explorador: { id: 'capa_explorador', name: 'Manto de Guardabosques de Lyon', slot: 'cloak', category: 'gear', rarity: 'uncommon', icon: '🧥', price: 490, minLevel: 1, maxDurability: 60, stats: { def: 9, agi: 7, crit: 4 }, desc: 'Camufla al portador entre la niebla del bosque.' },
    manto_solar_real: { id: 'manto_solar_real', name: 'Capa Carmesí del León Solar', slot: 'cloak', category: 'gear', rarity: 'epic', icon: '🧣', price: 2200, minLevel: 3, maxDurability: 80, stats: { def: 22, str: 10, vit: 12, crit: 6 }, desc: 'Manto de los capitanes de la Ciudadela de la Luz.' },
    botas_viento_alba: { id: 'botas_viento_alba', name: 'Botas del Viento del Alba', slot: 'boots', category: 'gear', rarity: 'uncommon', icon: '🥾', price: 460, minLevel: 1, maxDurability: 60, stats: { def: 8, agi: 8 }, desc: 'Permiten moverse con rapidez en duelos y cacerías.' },
    grebas_forjador: { id: 'grebas_forjador', name: 'Grebas Acorazadas de Korgan', slot: 'boots', category: 'gear', rarity: 'rare', icon: '👢', price: 1120, minLevel: 2, maxDurability: 70, stats: { def: 18, vit: 8, str: 5 }, desc: 'Protegen la guardia baja contra barridos enemigos.' },
    grebas_aladas_templo: { id: 'grebas_aladas_templo', name: 'Grebas Aladas del Serafín', slot: 'boots', category: 'gear', rarity: 'legendary', icon: '🦅', price: 4400, minLevel: 5, maxDurability: 95, stats: { def: 32, agi: 20, vit: 14, crit: 10 }, desc: 'Conceden la velocidad del rayo celestial.' },
    amuleto_selene: { id: 'amuleto_selene', name: 'Talismán de Zafiro de Selene', slot: 'amulet', category: 'gear', rarity: 'rare', icon: '📿', price: 980, minLevel: 1, maxDurability: 65, stats: { wis: 10, vit: 6, crit: 5, mp: 20 }, desc: 'Aumenta la reserva de espíritu (+20 MP) y la precisión arcana.' },
    amuleto_lago_espejo: { id: 'amuleto_lago_espejo', name: 'Colgante de la Estrella Reflejada', slot: 'amulet', category: 'gear', rarity: 'epic', icon: '🌟', price: 2450, minLevel: 3, maxDurability: 80, stats: { wis: 16, agi: 10, vit: 10, crit: 8, mp: 35 }, desc: 'Forjado por el Oráculo Miriel con luz estelar condensada.' },
    corazon_krystallos: { id: 'corazon_krystallos', name: 'Corazón Prismático de Krystallos', slot: 'amulet', category: 'gear', rarity: 'legendary', icon: '💎', price: 5200, minLevel: 5, maxDurability: 100, stats: { str: 18, vit: 22, wis: 20, crit: 12, mp: 50 }, desc: 'Núcleo viviente del Soberano de las Cuevas Cristalinas.' },
    anillo_alquimico: { id: 'anillo_alquimico', name: 'Anillo de Oro Alquímico', slot: 'ring', category: 'gear', rarity: 'uncommon', icon: '💍', price: 450, minLevel: 1, maxDurability: 60, stats: { str: 4, wis: 5, crit: 4 }, desc: 'Aro grabado con símbolos de transmutación.' },
    anillo_druida: { id: 'anillo_druida', name: 'Sortija de Esmeralda Rúnica', slot: 'ring', category: 'gear', rarity: 'rare', icon: '💍', price: 1050, minLevel: 2, maxDurability: 70, stats: { agi: 8, vit: 8, crit: 6 }, desc: 'Pulsa con la vitalidad del Bosque de los Ecos.' },
    sello_templo_antiguo: { id: 'sello_templo_antiguo', name: 'Sello Real del Templo Antiguo', slot: 'ring', category: 'gear', rarity: 'legendary', icon: '⚜️', price: 4800, minLevel: 5, maxDurability: 95, stats: { atk: 24, str: 16, wis: 16, crit: 12 }, desc: 'Insignia de mando del Archinquisidor Vaelen.' },
    anillo_eclipse_eterno: { id: 'anillo_eclipse_eterno', name: 'Anillo Soberano del Eclipse Domesticado', slot: 'ring', category: 'gear', rarity: 'legendary', icon: '🌑', price: 8900, minLevel: 7, maxDurability: 120, stats: { atk: 38, str: 24, agi: 22, vit: 22, crit: 18 }, desc: 'El poder del Emperador Malakor subyugado por la Luz.' },
    anillo_anti_xp: { id: 'anillo_anti_xp', name: 'Anillo de Anti-Experiencia (Антиопыт)', slot: 'ring', category: 'gear', rarity: 'epic', icon: '💍', price: 250, minLevel: 1, maxDurability: 100, isAntiXp: true, stats: { def: 8, vit: 6, crit: 5 }, desc: 'Joya especial de Asteria: congela la ganancia de XP (0 XP) para dominar tu rango de Valor y Reputaciones sin subir de nivel.' },

    // 10. Profession Tools & Keys (runes_tools)
    pico_maestro: { id: 'pico_maestro', name: 'Pico Rúnico de Minero', slot: 'tool', category: 'runes_tools', rarity: 'uncommon', icon: '⛏️', price: 320, desc: 'Otorga +1 mineral extra y +50% XP de Minería en el Modo Caza.' },
    hoz_herbolario: { id: 'hoz_herbolario', name: 'Hoz de Plata de Herbolario', slot: 'tool', category: 'runes_tools', rarity: 'uncommon', icon: '🌿', price: 320, desc: 'Otorga +1 hierba extra y +50% XP de Herbolaria en el Modo Caza.' },
    cana_pesca_runica: { id: 'cana_pesca_runica', name: 'Caña Astral del Lago del Espejo', slot: 'tool', category: 'runes_tools', rarity: 'uncommon', icon: '🎣', price: 340, desc: 'Otorga +1 captura extra y +50% XP de Pesca en el Lago del Espejo.' },
    llave_cerrajero: { id: 'llave_cerrajero', name: 'Ganzúa Maestra de Cerrajero', slot: 'key', category: 'runes_tools', rarity: 'rare', icon: '🗝️', price: 280, desc: 'Herramienta de Cerrajero para abrir Cofres de Mitril y Cofres Forjados.' },

    // 11. Legendary Runes & Pet Crystals (runes_tools)
    runa_mira: { id: 'runa_mira', name: 'Runa Legendaria de Mira (Руна Мира)', slot: 'rune', category: 'runes_tools', rarity: 'legendary', icon: '🔮', price: 1400, runeStats: { def: 12, vit: 8 }, desc: 'Engaste de armadura: añade +12 Defensa y +8 Vitalidad permanentes a la pieza equipada.' },
    runa_sina: { id: 'runa_sina', name: 'Runa Legendaria de Sina (Руна Сина)', slot: 'rune', category: 'runes_tools', rarity: 'legendary', icon: '⚡', price: 1450, runeStats: { atk: 14, crit: 5 }, desc: 'Engaste ofensivo: añade +14 Ataque y +5% Crítico permanentes a la pieza equipada.' },
    runa_inevitabilidad: { id: 'runa_inevitabilidad', name: 'Runa de Inevitabilidad (Руна Неизбежности)', slot: 'rune', category: 'runes_tools', rarity: 'legendary', icon: '☀️', price: 2200, runeStats: { atk: 12, def: 10, str: 6, wis: 6 }, desc: 'Runa suprema de Asteria: añade +12 ATQ, +10 DEF, +6 FUE y +6 SAB a cualquier ranura.' },
    cristal_viejo_ogro: { id: 'cristal_viejo_ogro', name: 'Cristal del Viejo Ogro (Кристалл старого огра)', slot: 'crystal', category: 'runes_tools', rarity: 'epic', icon: '🟢', price: 750, crystalStats: { atk: 10, vit: 6, assistDmg: 14 }, desc: 'Cristal para Mascotas Rojas: incrementa su daño de asistencia (+14) y tu Fuerza/Vitalidad.' },
    cristal_carmesi: { id: 'cristal_carmesi', name: 'Cristal Carmesí de Furia', slot: 'crystal', category: 'runes_tools', rarity: 'epic', icon: '🔴', price: 950, crystalStats: { atk: 16, crit: 5, assistDmg: 20 }, desc: 'Cristal para Mascotas Rojas: potencia el ataque crítico y añade +20 al golpe de mascota.' },
    cristal_celeste: { id: 'cristal_celeste', name: 'Cristal Celeste de Sabiduría', slot: 'crystal', category: 'runes_tools', rarity: 'legendary', icon: '🔵', price: 1350, crystalStats: { def: 14, wis: 10, assistDmg: 26 }, desc: 'Cristal supremo para Mascotas Rojas: +14 Defensa, +10 Sabiduría y +26 daño de asistencia.' },

    // 12. Consumables, Elixirs & Battle Scrolls (elixirs)
    elixir_vida_menor: { id: 'elixir_vida_menor', name: 'Elixir Carmesí Menor', slot: 'consumable', category: 'elixirs', rarity: 'common', icon: '🧪', price: 85, healHp: 110, desc: 'Restaura 110 puntos de Salud en combate o exploración.' },
    elixir_vida_mayor: { id: 'elixir_vida_mayor', name: 'Gran Elixir de Sangre Solar', slot: 'consumable', category: 'elixirs', rarity: 'uncommon', icon: '🍷', price: 220, healHp: 260, desc: 'Restaura 260 puntos de Salud instantáneamente.' },
    nectar_mana_astral: { id: 'nectar_mana_astral', name: 'Néctar de Éter Astral', slot: 'consumable', category: 'elixirs', rarity: 'uncommon', icon: '⚗️', price: 180, healMp: 110, desc: 'Restaura 110 puntos de Energía/Maná para Hechizos y Super-Golpes.' },
    panacea_solar: { id: 'panacea_solar', name: 'Panacea Real de Helion', slot: 'consumable', category: 'elixirs', rarity: 'epic', icon: '🏺', price: 480, healHp: 480, healMp: 220, desc: 'Restaura 480 HP y 220 MP. Imprescindible en las estancias finales.' },
    pocion_furia_titan: { id: 'pocion_furia_titan', name: 'Elixir de Furia del Titán', slot: 'consumable', category: 'elixirs', rarity: 'rare', icon: '🔥', price: 340, buffAtk: 25, healHp: 150, desc: 'Otorga +25 de Ataque durante el combate actual y restaura 150 HP.' },
    balsamo_hierro: { id: 'balsamo_hierro', name: 'Bálsamo de Piel de Acero', slot: 'consumable', category: 'elixirs', rarity: 'rare', icon: '🛡️', price: 320, buffDef: 22, healHp: 150, desc: 'Otorga +22 de Defensa en combate y restaura 150 HP.' },
    hidromiel_grifo: { id: 'hidromiel_grifo', name: 'Hidromiel del Grifo Dorado', slot: 'consumable', category: 'elixirs', rarity: 'common', icon: '🍺', price: 95, healHp: 130, healMp: 45, desc: 'Bebida favorita de la taberna de la Ciudadela.' },
    asado_jabali: { id: 'asado_jabali', name: 'Banquete de Jabalí Acorazado', slot: 'consumable', category: 'elixirs', rarity: 'uncommon', icon: '🍖', price: 140, healHp: 200, desc: 'Ración caliente que recupera 200 puntos de Salud.' },
    pergamino_sanador: { id: 'pergamino_sanador', name: 'Pergamino de Sanador Real', slot: 'consumable', category: 'elixirs', rarity: 'rare', icon: '📜', price: 240, curesInjury: true, healHp: 250, desc: 'Cura instantáneamente cualquier Herida o Fractura de Guerra y restaura 250 HP.' },
    pergamino_piel_piedra: { id: 'pergamino_piel_piedra', name: 'Pergamino de Piel de Piedra', slot: 'consumable', category: 'elixirs', rarity: 'rare', icon: '🪨', price: 280, buffDef: 35, healHp: 120, desc: 'Pergamino de cinturón: otorga +35 Defensa en combate y +120 HP.' },
    pergamino_purga_solar: { id: 'pergamino_purga_solar', name: 'Pergamino de Purga Astral', slot: 'consumable', category: 'elixirs', rarity: 'epic', icon: '✨', price: 360, healHp: 220, healMp: 140, buffAtk: 18, desc: 'Purifica efectos adversos, restaura 220 HP / 140 MP y añade +18 ATQ.' },
    pergamino_fuego_celeste: { id: 'pergamino_fuego_celeste', name: 'Pergamino de Fuego Celeste', slot: 'consumable', category: 'elixirs', rarity: 'epic', icon: '☄️', price: 420, directEnemyDmg: 140, buffAtk: 20, desc: 'Abrasión inmediata: inflige 140 de daño solar directo al enemigo en combate y +20 ATQ.' },

    // 13. Locked Chests, Relics & Collectible Tokens (cards_relics)
    cofre_mitril: { id: 'cofre_mitril', name: 'Cofre de Mitril Sellado', slot: 'chest', category: 'cards_relics', rarity: 'epic', icon: '🧰', price: 650, desc: 'Cofre acorazado de Asteria. Ábrelo con una Ganzúa de Cerrajero para obtener Oro, Diamantes, Runas y Reliquias.' },
    cofre_forjado: { id: 'cofre_forjado', name: 'Cofre Forjado de los Antiguos', slot: 'chest', category: 'cards_relics', rarity: 'rare', icon: '📦', price: 420, desc: 'Cofre de hierro rúnico. Ábrelo en tu Mochila para descubrir elixires, chispas celestiales y materiales.' },
    chispa_celestial: { id: 'chispa_celestial', name: 'Chispa de Fuego Celestial', slot: 'material', category: 'cards_relics', rarity: 'rare', icon: '✨', price: 260, desc: 'Ofrenda sagrada para incrementar +150 puntos en cualquier Reputación de Faeo.' },
    tratado_unidad_clan: { id: 'tratado_unidad_clan', name: 'Tratado «Unidad del Clan»', slot: 'material', category: 'cards_relics', rarity: 'epic', icon: '📘', price: 520, desc: 'Documento imperial empleado para subir de nivel los Talentos del Clan.' },
    piedra_transformacion: { id: 'piedra_transformacion', name: 'Piedra de Transformación (ГРОТ)', slot: 'material', category: 'cards_relics', rarity: 'legendary', icon: '💠', price: 880, desc: 'Trofeo mítico de La Gruta (ГРОТ) empleado en el Cubo Éltico y mejoras supremas.' },

    // 14. Materials & Eltic Cube Reagents (materials)
    lingote_bronce: { id: 'lingote_bronce', name: 'Lingote de Bronce Solar', slot: 'material', category: 'materials', rarity: 'common', icon: '🧱', price: 70, desc: 'Metal base para la herrería de Korgan.' },
    cuero_curtido: { id: 'cuero_curtido', name: 'Piel Curtida de Huargo', slot: 'material', category: 'materials', rarity: 'common', icon: '🦌', price: 75, desc: 'Material resistente obtenido en las Llanuras del Alba.' },
    hoja_solar: { id: 'hoja_solar', name: 'Hoja de Rocío Solar', slot: 'material', category: 'materials', rarity: 'uncommon', icon: '🌿', price: 110, desc: 'Hierba alquímica empleada por Selene.' },
    perla_espejo: { id: 'perla_espejo', name: 'Perla Astral del Lago', slot: 'material', category: 'materials', rarity: 'rare', icon: '🔮', price: 240, desc: 'Gema acuática de alta resonancia mágica.' },
    cristal_luminita: { id: 'cristal_luminita', name: 'Cristal Puro de Luminita', slot: 'material', category: 'materials', rarity: 'rare', icon: '💎', price: 320, desc: 'Mineral arcano extraído de las Cuevas Cristalinas.' },
    riolita: { id: 'riolita', name: 'Bloque de Riolita Imperial', slot: 'material', category: 'materials', rarity: 'rare', icon: '🪨', price: 280, desc: 'Piedra energética indispensable para construir y mejorar edificios en tu Hacienda (Поместье).' },
    fragmento_eltico: { id: 'fragmento_eltico', name: 'Fragmento del Cubo Éltico', slot: 'material', category: 'cards_relics', rarity: 'rare', icon: '🧊', price: 380, desc: 'Pieza geométrica necesaria para transmutaciones en el Cubo Éltico.' },
    catalizador_astral: { id: 'catalizador_astral', name: 'Catalizador de Fuego Astral', slot: 'material', category: 'materials', rarity: 'epic', icon: '✨', price: 620, desc: 'Reagente superior para forjar y templar reliquias.' },
    runa_solar: { id: 'runa_solar', name: 'Runa Grabada del Templo Antiguo', slot: 'material', category: 'cards_relics', rarity: 'epic', icon: '☀️', price: 780, desc: 'Inscripción sagrada de los antiguos custodios.' },
    nucleo_eclipse: { id: 'nucleo_eclipse', name: 'Núcleo de Obsidiana Abisal', slot: 'material', category: 'materials', rarity: 'legendary', icon: '🌑', price: 1100, desc: 'Condensación de energía oscura de la Frontera de Ceniza.' },
    escama_vorathax: { id: 'escama_vorathax', name: 'Escama Ardiente de Vorathax', slot: 'material', category: 'materials', rarity: 'legendary', icon: '🐉', price: 1650, desc: 'Trofeo dracónico de dureza incomparable.' },
    riendas_alba: { id: 'riendas_alba', name: 'Riendas Reales de Doma', slot: 'material', category: 'materials', rarity: 'rare', icon: '🐎', price: 450, desc: 'Arreo para entrenar monturas de guerra.' },
    espuelas_fuego: { id: 'espuelas_fuego', name: 'Espuelas de Brasa para Ignifer', slot: 'material', category: 'materials', rarity: 'epic', icon: '🔥', price: 680, desc: 'Canalizan el galope ígneo de las monturas míticas.' },
    pienso_draconico: { id: 'pienso_draconico', name: 'Ración de Esencia Dracónica', slot: 'material', category: 'materials', rarity: 'rare', icon: '🥩', price: 290, desc: 'Alimento especial para invocar Moroks y Monturas en batalla.' },
    pienso_astral: { id: 'pienso_astral', name: 'Pienso Astral de Mascota Roja (Корм)', slot: 'material', category: 'materials', rarity: 'uncommon', icon: '🍖', price: 120, desc: 'Alimenta a tus Mascotas Rojas para activar su ataque y bonificación de cristales en combate.' }
  };

  // Normalize artifact metadata fields so all consumers have priceCopper, minLevel, maxDurability, category
  Object.values(ARTIFACTS).forEach((it) => {
    it.priceCopper = it.price;
    if (!it.minLevel) it.minLevel = 1;
    if (!it.maxDurability) it.maxDurability = 60;
    if (!it.category) {
      if (['helm', 'pauldrons', 'amulet', 'weapon', 'armor', 'bracers', 'shield', 'cloak', 'cuisses', 'ring', 'belt', 'boots'].includes(it.slot)) {
        it.category = 'gear';
      } else if (it.slot === 'consumable') {
        it.category = 'elixirs';
      } else if (['tool', 'rune', 'key', 'crystal'].includes(it.slot)) {
        it.category = 'runes_tools';
      } else if (it.slot === 'chest') {
        it.category = 'cards_relics';
      } else {
        it.category = 'materials';
      }
    }
  });

  /* ------------------------------------------------------------------------
     6 DIRECTIONAL SUPER-BLOWS (COMBOS DE 3 ZONAS — FAEO / ASTERIA)
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
      desc: 'Alta-Media-Alta: Inflige 185% de daño solar y provoca Hemorragia Luminosa por 2 turnos.'
    },
    {
      id: 'combo_barrido_titan',
      name: 'Ejecución de Korgan',
      sequence: ['legs', 'torso', 'head'],
      seqLabels: ['Piernas', 'Torso', 'Cabeza'],
      mult: 2.05,
      bonusEffect: 'armor_break',
      icon: '⚒️',
      desc: 'Ascendente: Inflige 205% de daño e ignora el 50% de la defensa y el bloqueo rival.'
    },
    {
      id: 'combo_tempestad_astral',
      name: 'Tempestad del Eclipse',
      sequence: ['torso', 'legs', 'torso'],
      seqLabels: ['Torso', 'Piernas', 'Torso'],
      mult: 1.75,
      bonusEffect: 'lifesteal',
      icon: '⚡',
      desc: 'Media-Baja-Media: Inflige 175% de daño y drena el 35% como Salud y Maná.'
    },
    {
      id: 'combo_furia_dragon',
      name: 'Furia del Dragón de Khair',
      sequence: ['head', 'head', 'torso'],
      seqLabels: ['Cabeza', 'Cabeza', 'Torso'],
      mult: 2.15,
      bonusEffect: 'stun',
      icon: '🐉',
      desc: 'Doble Alta-Media: Inflige 215% de daño dracónico y aturde al enemigo (reduce su ataque 40%).'
    },
    {
      id: 'combo_garra_pantera',
      name: 'Garra de la Pantera Sombría',
      sequence: ['legs', 'legs', 'head'],
      seqLabels: ['Piernas', 'Piernas', 'Cabeza'],
      mult: 1.9,
      bonusEffect: 'bleed_lifesteal',
      icon: '🐆',
      desc: 'Doble Baja-Alta: Inflige 190% de daño, aplica sangrado y restaura +45 HP.'
    },
    {
      id: 'combo_aplastamiento_gigante',
      name: 'Aplastamiento de Gigante',
      sequence: ['torso', 'torso', 'head'],
      seqLabels: ['Torso', 'Torso', 'Cabeza'],
      mult: 2.25,
      bonusEffect: 'armor_break',
      icon: '🔨',
      desc: 'Doble Media-Alta: Impacto colosal de 225% de daño que pulveriza cualquier bloqueo.'
    }
  ];

  /* ------------------------------------------------------------------------
     4 CASTABLE MAGIC SCHOOL SPELLS (CONSUMING MANA IN COMBAT)
     ------------------------------------------------------------------------ */
  const MAGIC_SPELLS = [
    {
      id: 'hechizo_lanza_solar',
      name: 'Lanza de Fuego Solar',
      school: 'Fuego / Luz',
      mpCost: 28,
      icon: '☀️',
      type: 'damage',
      mult: 1.45,
      bleedTurns: 1,
      desc: 'Dispara un haz solar que inflige 145% de daño mágico (basado en ATQ + SAB) e incendia al rival.'
    },
    {
      id: 'hechizo_escudo_prisma',
      name: 'Égida de Prisma Astral',
      school: 'Aire / Cuarzo',
      mpCost: 25,
      icon: '💠',
      type: 'buff_heal',
      healPct: 0.25,
      buffDef: 24,
      desc: 'Restaura 25% de tu Salud Máxima y otorga +24 de Defensa durante el combate.'
    },
    {
      id: 'hechizo_purga_astral',
      name: 'Drenaje de las Sombras',
      school: 'Sombra / Agua',
      mpCost: 32,
      icon: '🌑',
      type: 'lifesteal',
      mult: 1.35,
      drainRatio: 0.55,
      desc: 'Inflige 135% de daño arcano y absorbe el 55% del daño infligido como Salud.'
    },
    {
      id: 'hechizo_lluvia_meteoros',
      name: 'Tormenta de Meteoros de Sheara',
      school: 'Magma / Cosmos',
      mpCost: 45,
      icon: '☄️',
      type: 'ultimate',
      mult: 1.95,
      buffAtk: 15,
      desc: 'Cataclismo astral que inflige 195% de daño ignorando bloqueo y aumenta tu Ataque en +15.'
    }
  ];

  /* ------------------------------------------------------------------------
     9 CANONICAL PROFESSIONS (3 GATHERING, 3 CRAFTING, 3 SPECIAL)
     ------------------------------------------------------------------------ */
  const PROFESSIONS = [
    { id: 'mineria', name: 'Geólogo / Minería', type: 'Recolección', icon: '⛏️', statBonus: { def: 3, vit: 2 }, desc: 'Extracción de bronce, hierro astral, Riolita, Luminita y núcleos de obsidiana. Pasiva: +3 DEF, +2 VIT por nivel.' },
    { id: 'herbolaria', name: 'Herbolario Solar', type: 'Recolección', icon: '🌿', statBonus: { wis: 3, maxHp: 12 }, desc: 'Cosecha de flores solares, hongos y lotos estelares para alquimia. Pasiva: +3 SAB, +12 HP por nivel.' },
    { id: 'pesca', name: 'Pescador Astral', type: 'Recolección', icon: '🎣', statBonus: { agi: 3, crit: 1 }, desc: 'Captura de carpas estelares, perlas y cofres en el Lago del Espejo. Pasiva: +3 AGI, +1% Crítico por nivel.' },
    { id: 'herreria', name: 'Herrero de Guerra', type: 'Artesanía', icon: '⚒️', statBonus: { atk: 4, str: 2 }, desc: 'Forja de armas, armaduras de 12 ranuras y reparación de durabilidad. Pasiva: +4 ATQ, +2 FUE por nivel.' },
    { id: 'alquimia', name: 'Alquimista Supremo', type: 'Artesanía', icon: '⚗️', statBonus: { wis: 3, maxMp: 15 }, desc: 'Destilación de elixires de vida, maná, furia y panaceas reales. Pasiva: +3 SAB, +15 MP por nivel.' },
    { id: 'joyeria', name: 'Joyero de Runas', type: 'Artesanía', icon: '💎', statBonus: { crit: 2, atk: 3 }, desc: 'Tallado de Runas Legendarias (Mira, Sina, Inevitabilidad) y cristales de mascota. Pasiva: +2% Crítico, +3 ATQ por nivel.' },
    { id: 'sanador', name: 'Sanador (Целитель)', type: 'Especial', icon: '🩹', statBonus: { vit: 4, maxHp: 18 }, desc: 'Creación de pergaminos de curación y tratamiento de Heridas y Fracturas de guerra. Pasiva: +4 VIT, +18 HP por nivel.' },
    { id: 'cerrajero', name: 'Cerrajero (Взломщик)', type: 'Especial', icon: '🗝️', statBonus: { agi: 4, crit: 2 }, desc: 'Forja de ganzúas maestras y apertura de Cofres de Mitril y Cofres Forjados. Pasiva: +4 AGI, +2% Crítico por nivel.' },
    { id: 'verdugo', name: 'Verdugo (Палач)', type: 'Especial', icon: '🪓', statBonus: { atk: 5, str: 3 }, desc: 'Dominio del golpe letal en PvP y Campos de Batalla. Pasiva: +5 ATQ, +3 FUE por nivel.' }
  ];

  /* ------------------------------------------------------------------------
     12 INTERACTIVE CRAFTING RECIPES (TALLER DE ARTESANÍA — service_craft.php)
     ------------------------------------------------------------------------ */
  const CRAFT_RECIPES = [
    {
      id: 'craft_espada_sol',
      prof: 'herreria',
      minProfLevel: 1,
      name: 'Forjar Espada del Sol Naciente',
      resultId: 'espada_sol_naciente',
      resultQty: 1,
      copperCost: 160,
      ingredients: [{ itemId: 'lingote_bronce', qty: 2 }]
    },
    {
      id: 'craft_hombreras_paladin',
      prof: 'herreria',
      minProfLevel: 1,
      name: 'Forjar Hombreras de León Solar',
      resultId: 'hombreras_paladin',
      resultQty: 1,
      copperCost: 220,
      ingredients: [{ itemId: 'lingote_bronce', qty: 2 }, { itemId: 'cuero_curtido', qty: 1 }]
    },
    {
      id: 'craft_brazales_forjador',
      prof: 'herreria',
      minProfLevel: 2,
      name: 'Templar Brazales Rúnicos de Korgan',
      resultId: 'brazales_forjador',
      resultQty: 1,
      copperCost: 240,
      ingredients: [{ itemId: 'lingote_bronce', qty: 2 }, { itemId: 'cristal_luminita', qty: 1 }]
    },
    {
      id: 'craft_quijotes_acero',
      prof: 'herreria',
      minProfLevel: 2,
      name: 'Forjar Quijotes Templados de Bastión',
      resultId: 'quijotes_acero',
      resultQty: 1,
      copperCost: 260,
      ingredients: [{ itemId: 'lingote_bronce', qty: 3 }]
    },
    {
      id: 'craft_elixir_mayor',
      prof: 'alquimia',
      minProfLevel: 1,
      name: 'Destilar Gran Elixir de Sangre Solar (x2)',
      resultId: 'elixir_vida_mayor',
      resultQty: 2,
      copperCost: 110,
      ingredients: [{ itemId: 'hoja_solar', qty: 2 }]
    },
    {
      id: 'craft_furia_titan',
      prof: 'alquimia',
      minProfLevel: 1,
      name: 'Destilar Elixir de Furia del Titán (x2)',
      resultId: 'pocion_furia_titan',
      resultQty: 2,
      copperCost: 150,
      ingredients: [{ itemId: 'hoja_solar', qty: 2 }, { itemId: 'lingote_bronce', qty: 1 }]
    },
    {
      id: 'craft_runa_mira',
      prof: 'joyeria',
      minProfLevel: 1,
      name: 'Tallar Runa Legendaria de Mira (Руна Мира)',
      resultId: 'runa_mira',
      resultQty: 1,
      copperCost: 350,
      ingredients: [{ itemId: 'cristal_luminita', qty: 1 }, { itemId: 'lingote_bronce', qty: 1 }]
    },
    {
      id: 'craft_runa_sina',
      prof: 'joyeria',
      minProfLevel: 2,
      name: 'Tallar Runa Legendaria de Sina (Руна Сина)',
      resultId: 'runa_sina',
      resultQty: 1,
      copperCost: 380,
      ingredients: [{ itemId: 'cristal_luminita', qty: 1 }, { itemId: 'perla_espejo', qty: 1 }]
    },
    {
      id: 'craft_cristal_ogro',
      prof: 'joyeria',
      minProfLevel: 1,
      name: 'Pulir Cristal del Viejo Ogro (Mascota Roja)',
      resultId: 'cristal_viejo_ogro',
      resultQty: 1,
      copperCost: 250,
      ingredients: [{ itemId: 'hoja_solar', qty: 1 }, { itemId: 'lingote_bronce', qty: 1 }]
    },
    {
      id: 'craft_pergamino_sanador',
      prof: 'sanador',
      minProfLevel: 1,
      name: 'Inscribir Pergamino de Sanador Real (x2)',
      resultId: 'pergamino_sanador',
      resultQty: 2,
      copperCost: 120,
      ingredients: [{ itemId: 'hoja_solar', qty: 1 }]
    },
    {
      id: 'craft_pergamino_piedra',
      prof: 'sanador',
      minProfLevel: 1,
      name: 'Inscribir Pergamino de Piel de Piedra (x2)',
      resultId: 'pergamino_piel_piedra',
      resultQty: 2,
      copperCost: 150,
      ingredients: [{ itemId: 'hoja_solar', qty: 1 }, { itemId: 'lingote_bronce', qty: 1 }]
    },
    {
      id: 'craft_llave_cerrajero',
      prof: 'cerrajero',
      minProfLevel: 1,
      name: 'Forjar Ganzúa Maestra de Cerrajero (x2)',
      resultId: 'llave_cerrajero',
      resultQty: 2,
      copperCost: 130,
      ingredients: [{ itemId: 'lingote_bronce', qty: 1 }]
    }
  ];

  /* ------------------------------------------------------------------------
     PETS (MASCOTAS ROJAS), PET CRYSTALS, MOUNTS (IGNIFER) & DISCIPLES ACADEMY
     ------------------------------------------------------------------------ */
  const PETS = [
    { id: 'halcon_alba', name: 'Halcón Solar de Vigía (Красный)', icon: '🦅', rarity: 'uncommon', price: 850, bonusAtk: 8, bonusCrit: 4, assistDmg: 18, isRedPet: true, desc: 'Acompaña al guerrero desde el cielo y ataca a los ojos del enemigo en cada turno.' },
    { id: 'lobo_runico', name: 'Lobo Huargo de Escarcha (Красный)', icon: '🐺', rarity: 'rare', price: 1800, bonusAtk: 15, bonusCrit: 6, assistDmg: 32, isRedPet: true, desc: 'Feroz compañero de las llanuras que desgarra la guardia baja del adversario.' },
    { id: 'fenix_ascua', name: 'Draco-Fénix de Ascua (Красный)', icon: '🐦‍🔥', rarity: 'epic', price: 3600, bonusAtk: 24, bonusCrit: 10, assistDmg: 48, isRedPet: true, desc: 'Envuelve a tus enemigos en llamas solares y restaura la vitalidad de su señor.' },
    { id: 'arconte_cristal', name: 'Familiar de Luminita Astral (Красный)', icon: '💎', rarity: 'legendary', price: 6200, bonusAtk: 36, bonusCrit: 14, assistDmg: 72, isRedPet: true, desc: 'Entidad nacida en las Cuevas Cristalinas que dispara haces prismáticos devastadores.' }
  ];

  const PET_CRYSTALS = [
    { id: 'cristal_viejo_ogro', name: 'Cristal del Viejo Ogro', icon: '🟢', bonusAtk: 10, bonusVit: 6, assistDmg: 14 },
    { id: 'cristal_carmesi', name: 'Cristal Carmesí de Furia', icon: '🔴', bonusAtk: 16, bonusCrit: 5, assistDmg: 20 },
    { id: 'cristal_celeste', name: 'Cristal Celeste de Sabiduría', icon: '🔵', bonusDef: 14, bonusWis: 10, assistDmg: 26 }
  ];

  const MOUNTS = [
    { id: 'corcel_alba', name: 'Destrero Blanco del Alba', icon: '🐎', rarity: 'uncommon', price: 950, summonHp: 140, summonDmg: 22, stats: { vit: 8, agi: 6, def: 10 }, desc: 'Corcel de guerra entrenado en los establos de la Ciudadela de la Luz.' },
    { id: 'pantera_ecos', name: 'Acechador Sombrío de los Ecos', icon: '🐆', rarity: 'rare', price: 2200, summonHp: 210, summonDmg: 34, stats: { agi: 16, crit: 8, atk: 14 }, desc: 'Felino gigante silencioso como la niebla de los monolitos rúnicos.' },
    { id: 'grifo_imperial', name: 'Grifo Acorazado de Helion', icon: '🦅', rarity: 'epic', price: 4500, summonHp: 310, summonDmg: 48, stats: { str: 18, vit: 18, def: 24, crit: 8 }, desc: 'Majestuosa bestia alada de los comandantes de la Orden Solar.' },
    { id: 'ignifer', name: 'Ignifer, Corcel de Fuego Primordial', icon: '🔥', rarity: 'legendary', price: 7800, summonHp: 460, summonDmg: 74, stats: { str: 28, agi: 24, vit: 26, atk: 34, crit: 14 }, desc: 'La montura mítica de Asteria: sus cascos dejan un rastro de magma solar y puede invocarse en combate.' }
  ];

  const DISCIPLES = [
    {
      id: 'discipulo_guerrero',
      name: 'Discípulo Guerrero (Ученик-Воин)',
      icon: '⚔️',
      role: 'Vanguardia Pesada',
      recruitCost: 400,
      baseStats: { str: 5, def: 8, vit: 6 },
      combatDmg: 24,
      desc: 'Entrenado en la Academia de Asteria: golpea al enemigo en cada turno y refuerza tu Defensa y Fuerza.'
    },
    {
      id: 'discipulo_mago',
      name: 'Discípulo Mago (Ученик-Маг)',
      icon: '🪄',
      role: 'Arcanista Solar',
      recruitCost: 450,
      baseStats: { wis: 8, atk: 7, maxMp: 30 },
      combatDmg: 28,
      desc: 'Lanza proyectiles astrales cada turno en combate y amplía tu Sabiduría y Maná Máximo.'
    },
    {
      id: 'discipulo_asesino',
      name: 'Discípulo Asesino (Ученик-Ассасин)',
      icon: '🗡️',
      role: 'Ejecutor de Sombras',
      recruitCost: 500,
      baseStats: { agi: 8, crit: 4, atk: 8 },
      combatDmg: 32,
      desc: 'Ataca los puntos vitales del adversario en cada ronda y eleva tu Agilidad y Crítico Solar.'
    }
  ];

  /* ------------------------------------------------------------------------
     10 FACTION REPUTATIONS (0-3000 PTS, BRONZE/SILVER/GOLD/WORSHIP MEDALS)
     ------------------------------------------------------------------------ */
  const REPUTATIONS = [
    { id: 'custodios_capital', name: "Custodios de O'Delvays y Dartrong", icon: '🏰', max: 3000, turnInItem: 'chispa_celestial', trophyItem: 'chispa_celestial', statsPerTier: { def: 5, vit: 4 }, desc: 'Defensores supremos de las capitales de Ogriy y Khair.' },
    { id: 'caballeros_subterraneos', name: 'Caballeros Subterráneos (Подземные рыцари)', icon: '💎', max: 3000, turnInItem: 'cristal_luminita', trophyItem: 'cristal_luminita', statsPerTier: { atk: 6, def: 5 }, desc: 'Veteranos de las Cuevas Cristalinas y los Salones de Tallaar.' },
    { id: 'buscadores_reliquias', name: 'Buscadores de Reliquias (Искатели реликтов)', icon: '🏺', max: 3000, turnInItem: 'fragmento_eltico', trophyItem: 'fragmento_eltico', statsPerTier: { wis: 5, crit: 2 }, desc: 'Exploradores de ruinas y del Templo Antiguo.' },
    { id: 'luchadores_caos', name: 'Luchadores del Caos (Борцы с Хаосом)', icon: '🌋', max: 3000, turnInItem: 'nucleo_eclipse', trophyItem: 'nucleo_eclipse', statsPerTier: { atk: 7, str: 4 }, desc: 'Vanguardia que contiene las invasiones del Eclipse y del Caos.' },
    { id: 'orden_triadas', name: 'Orden de las Tríadas (Орден триад)', icon: '☯️', max: 3000, turnInItem: 'runa_solar', trophyItem: 'runa_solar', statsPerTier: { agi: 5, str: 4 }, desc: 'Hermandad mística de maestros de los tres estilos de combate.' },
    { id: 'buscadores_tesoros', name: 'Cazadores de Tesoros (Кладоискатели)', icon: '🧰', max: 3000, turnInItem: 'perla_espejo', trophyItem: 'perla_espejo', statsPerTier: { agi: 4, crit: 3 }, desc: 'Maestros cerrajeros y descubridores de cofres de mitril.' },
    { id: 'patronos_mascotas', name: 'Patronos de Mascotas (Покровители питомцев)', icon: '🦅', max: 3000, turnInItem: 'pienso_astral', trophyItem: 'pienso_astral', statsPerTier: { vit: 5, atk: 4 }, desc: 'Protectores de las Mascotas Rojas y corceles de guerra.' },
    { id: 'influencia_arkona', name: 'Esfera de Influencia de Arkona (Влияние Арконы)', icon: '👑', max: 3000, turnInItem: 'chispa_celestial', trophyItem: 'chispa_celestial', statsPerTier: { str: 5, wis: 5, crit: 2 }, desc: 'Prestigio imperial acumulado en eventos, acertijos de Balagur y promocódigos.' },
    { id: 'katala_tahur', name: 'Reputación de Tahúr (Репутация Каталы)', icon: '🎲', max: 3000, turnInItem: 'hidromiel_grifo', trophyItem: 'hidromiel_grifo', statsPerTier: { crit: 3, agi: 5 }, desc: 'Reputación exclusiva de Asteria: sube en cada partida de Dados Solares o Cartas de Taberna.' },
    { id: 'cazadores_no_muertos', name: 'Cazadores de Espectros (Охотники за нежитью)', icon: '💀', max: 3000, turnInItem: 'hoja_solar', trophyItem: 'hoja_solar', statsPerTier: { atk: 5, wis: 4 }, desc: 'Purificadores del Bosque de los Ecos y de la Casa Abandonada.' }
  ];

  /* ------------------------------------------------------------------------
     MEDALS OF HONOR (ALIGNED WITH DESCRIPTIONS)
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
     6 BATTLEFIELDS (ПОЛЯ БИТВ) & VALOR RANKS (ДОБЛЕСТЬ)
     ------------------------------------------------------------------------ */
  const VALOR_RANKS = [
    { rank: 1, title: 'Recluta', minValor: 0, bonusAtk: 0, bonusDef: 0 },
    { rank: 2, title: 'Soldado', minValor: 250, bonusAtk: 5, bonusDef: 4 },
    { rank: 3, title: 'Centurión', minValor: 750, bonusAtk: 12, bonusDef: 10 },
    { rank: 4, title: 'Campeón', minValor: 1800, bonusAtk: 22, bonusDef: 18 },
    { rank: 5, title: 'Soberano de Faeo', minValor: 3500, bonusAtk: 36, bonusDef: 30 }
  ];

  function getValorRank(valorPoints) {
    const v = Math.max(0, Math.floor(valorPoints || 0));
    let current = VALOR_RANKS[0];
    let next = VALOR_RANKS[1] || null;
    for (let i = 0; i < VALOR_RANKS.length; i++) {
      if (v >= VALOR_RANKS[i].minValor) {
        current = VALOR_RANKS[i];
        next = VALOR_RANKS[i + 1] || null;
      }
    }
    const prevMin = current.minValor;
    const nextMin = next ? next.minValor : current.minValor + 2000;
    const pct = Math.min(100, Math.round(((v - prevMin) / Math.max(1, nextMin - prevMin)) * 100));
    return { ...current, valor: v, nextMin, pct };
  }

  const BATTLEFIELDS = [
    {
      id: 'cuevas_cristalinas',
      name: 'Cuevas Cristalinas (Кристаллические пещеры)',
      icon: '💎',
      minLevel: 1,
      mode: 'Minería de Cristales Rojos/Azules y Altares',
      valorReward: 180,
      trophyReward: 3,
      copperReward: 480,
      repId: 'caballeros_subterraneos',
      repGain: 120,
      desc: 'Extrae Cristales Energéticos Rojos y Azules, activa el Altar del Rayo y entrégalos en la base aliada para alcanzar la victoria.'
    },
    {
      id: 'cuevas_temblor',
      name: 'Cuevas del Temblor (Пещеры трепета)',
      icon: '🌋',
      minLevel: 2,
      mode: 'Dominio de Cámaras Subterráneas',
      valorReward: 220,
      trophyReward: 4,
      copperReward: 620,
      repId: 'caballeros_subterraneos',
      repGain: 140,
      desc: 'Choque de escuadrones entre Ogriy y Khair por el control de los túneles de resonancia.'
    },
    {
      id: 'salones_tallaar',
      name: 'Salones de Tallaar (Залы Таллаара / Juegos del Hambre)',
      icon: '🏛️',
      minLevel: 2,
      mode: 'Supervivencia Todos contra Todos',
      valorReward: 260,
      trophyReward: 5,
      copperReward: 750,
      repId: 'luchadores_caos',
      repGain: 150,
      desc: 'Arena ancestral sin alianzas: recoge armamento rúnico y sobrevive en el centro del salón.'
    },
    {
      id: 'batalla_caotica',
      name: 'Batallas Caóticas (Хаотичные бои / Хаоты)',
      icon: '⚡',
      minLevel: 1,
      mode: 'Combate Equilibrado por Equipos Aleatorios',
      valorReward: 210,
      trophyReward: 4,
      copperReward: 550,
      repId: 'luchadores_caos',
      repGain: 130,
      desc: 'El clásico «Jaot» de Asteria: equipos balanceados al instante con gran recompensa de Valor y Monedas Trofeo.'
    },
    {
      id: 'meseta_antigua',
      name: 'Meseta Antigua (Древнее плато)',
      icon: '🚩',
      minLevel: 3,
      mode: 'Guerra de Continentes: Humanos vs Magmares',
      valorReward: 320,
      trophyReward: 6,
      copperReward: 920,
      repId: 'custodios_capital',
      repGain: 180,
      desc: 'Defiende el estandarte de tu facción en la Meseta Antigua y conquista los obeliscos solares.'
    },
    {
      id: 'gran_batalla_dragones',
      name: 'Gran Batalla de Dragones (Великая битва)',
      icon: '🐉',
      minLevel: 4,
      mode: 'Asedio Épico bajo el Vuelo de Sheara',
      valorReward: 450,
      trophyReward: 8,
      copperReward: 1400,
      repId: 'influencia_arkona',
      repGain: 220,
      desc: 'Los dragones de Ogriy y Khair chocan en el cielo. Otorga las mayores recompensas de Valor y Trofeos.'
    }
  ];

  const VALOR_ARSENAL = [
    { itemId: 'espada_gladiador_valor', trophyCost: 8, minValor: 250 },
    { itemId: 'hombreras_paladin', trophyCost: 4, minValor: 100 },
    { itemId: 'brazales_forjador', trophyCost: 4, minValor: 100 },
    { itemId: 'cinturon_titan_solar', trophyCost: 10, minValor: 500 },
    { itemId: 'runa_inevitabilidad', trophyCost: 7, minValor: 250 },
    { itemId: 'panacea_solar', trophyCost: 2, minValor: 0 }
  ];

  /* ------------------------------------------------------------------------
     6 COOLDOWN INSTANCES (ИНСТАНСЫ) & FAST-FARM GROTTO (ГРОТ)
     ------------------------------------------------------------------------ */
  const INSTANCES = [
    {
      id: 'gruta_grot',
      name: 'La Gruta (ГРОТ — Fast-Farm de Asteria)',
      icon: '🕳️',
      minLevel: 1,
      waves: 3,
      cooldownSec: 45,
      isFastFarm: true,
      diamondReward: 50,
      copperReward: 780,
      xpReward: 130,
      drops: ['piedra_transformacion', 'riolita', 'chispa_celestial', 'cofre_mitril'],
      desc: 'La estancia insignia de Asteria (ГРОТ): oleadas rápidas de guardianes con botín garantizado de Piedras de Transformación, Riolita y 50 Diamantes.'
    },
    {
      id: 'casa_abandonada',
      name: 'Casa Abandonada (Заброшенный дом)',
      icon: '🏚️',
      minLevel: 1,
      waves: 3,
      cooldownSec: 60,
      diamondReward: 5,
      copperReward: 520,
      xpReward: 95,
      drops: ['anillo_alquimico', 'fragmento_eltico', 'llave_cerrajero'],
      desc: 'Mansión maldita habitada por espectros y esqueletos antiguos.'
    },
    {
      id: 'santuario_elfico',
      name: 'Santuario Élfico (Эльфийское святилище)',
      icon: '🌿',
      minLevel: 2,
      waves: 3,
      cooldownSec: 75,
      diamondReward: 6,
      copperReward: 740,
      xpReward: 145,
      drops: ['hombreras_druida', 'hoja_solar', 'perla_espejo'],
      desc: 'Ruinas silvanas custodiadas por centinelas de raíces y espíritus ancestrales.'
    },
    {
      id: 'guarida_krets',
      name: 'Guarida de Krets (Логово крэтсов)',
      icon: '🐀',
      minLevel: 2,
      waves: 3,
      cooldownSec: 60,
      diamondReward: 5,
      copperReward: 640,
      xpReward: 120,
      drops: ['cuero_curtido', 'cofre_forjado', 'elixir_vida_mayor'],
      desc: 'Túneles infestados por el Rey Kret y su horda subterránea.'
    },
    {
      id: 'colmena_zigred',
      name: 'Colmena Zigred (Улей зигредов)',
      icon: '🐝',
      minLevel: 3,
      waves: 4,
      cooldownSec: 90,
      diamondReward: 8,
      copperReward: 980,
      xpReward: 210,
      drops: ['cristal_luminita', 'catalizador_astral', 'cristal_viejo_ogro'],
      desc: 'Caverna insectoide gobernada por la Reina Zigred Acorazada.'
    },
    {
      id: 'refugio_elemental',
      name: 'Refugio Elemental (Стихийное убежище)',
      icon: '❄️',
      minLevel: 4,
      waves: 4,
      cooldownSec: 120,
      diamondReward: 12,
      copperReward: 1550,
      xpReward: 320,
      drops: ['piedra_transformacion', 'runa_solar', 'brazales_celestes'],
      desc: 'Confluencia de fuego, hielo y éter donde habitan los Señores Elementales.'
    }
  ];

  /* ------------------------------------------------------------------------
     6 COLLECTIBLE CARD DECKS (КОЛОДЫ КАРТ)
     ------------------------------------------------------------------------ */
  const CARD_DECKS = [
    {
      id: 'baraja_recursos',
      name: 'Baraja de Recursos (Колода ресурсов)',
      icon: '📦',
      totalCards: 5,
      rewardDesc: 'Paquete Semanal: 3x de cada recurso raro (Bronce, Cuero, Hoja Solar, Luminita, Riolita) + 300c',
      bonusStats: { vit: 4, def: 4 },
      grantsResourceBundle: true
    },
    {
      id: 'mecenas_ii',
      name: 'Baraja Mecenas II (Меценаты II)',
      icon: '💎',
      totalCards: 5,
      rewardDesc: '+8 Diamantes, +2 Rubíes y Bendición de Riqueza Imperial',
      bonusStats: { atk: 6, crit: 3 },
      diamondReward: 8,
      rubyReward: 2
    },
    {
      id: 'clanes_asteria',
      name: 'Baraja Clanes de Asteria (Кланы Астерии)',
      icon: '🛡️',
      totalCards: 5,
      rewardDesc: '2x Tratados «Unidad del Clan» + 150 Valor',
      bonusStats: { str: 6, def: 6 },
      itemReward: 'tratado_unidad_clan',
      itemQty: 2,
      valorReward: 150
    },
    {
      id: 'dones_dragon',
      name: 'Baraja Dones del Dragón (Дар Дракона)',
      icon: '🐉',
      totalCards: 5,
      rewardDesc: '1x Escama de Vorathax + 1x Panacea Real + 200 Valor',
      bonusStats: { atk: 10, str: 5 },
      itemReward: 'escama_vorathax',
      itemQty: 1,
      valorReward: 200
    },
    {
      id: 'baraja_efimera',
      name: 'Baraja Efímera (Эфемерная колода)',
      icon: '✨',
      totalCards: 5,
      rewardDesc: '2x Chispas Celestiales + +120 Influencia de Arkona',
      bonusStats: { wis: 8, maxMp: 25 },
      itemReward: 'chispa_celestial',
      itemQty: 2
    },
    {
      id: 'baraja_sheara',
      name: 'Baraja de la Diosa Sheara (Колода Шеары)',
      icon: '☀️',
      totalCards: 5,
      rewardDesc: '+12 Diamantes, 1x Piedra de Transformación y Bendición Divina',
      bonusStats: { atk: 8, def: 8, crit: 4 },
      diamondReward: 12,
      itemReward: 'piedra_transformacion',
      itemQty: 1
    }
  ];

  /* ------------------------------------------------------------------------
     6 PLAYER ESTATE BUILDINGS (ПОМЕСТЬЕ / HACIENDA)
     ------------------------------------------------------------------------ */
  const ESTATE_BUILDINGS = [
    {
      id: 'ayuntamiento',
      name: 'Ayuntamiento Solar (Ратуша)',
      icon: '🏛️',
      maxLevel: 5,
      baseCopper: 300,
      baseRiolita: 1,
      statsPerLevel: { vit: 4, def: 4 },
      desc: 'Corazón de tu Hacienda. Genera tributo diario en monedas y determina el nivel máximo de los demás edificios.'
    },
    {
      id: 'taller_forja',
      name: 'Taller de Forja y Runas (Мастерская)',
      icon: '⚒️',
      maxLevel: 5,
      baseCopper: 260,
      baseRiolita: 1,
      statsPerLevel: { atk: 5, str: 3 },
      desc: 'Reduce el desgaste de las 12 piezas de armadura y otorga +5 Ataque y +3 Fuerza por nivel.'
    },
    {
      id: 'enfermeria_solar',
      name: 'Enfermería Solar (Лазарет)',
      icon: '🩹',
      maxLevel: 5,
      baseCopper: 240,
      baseRiolita: 1,
      statsPerLevel: { maxHp: 22, vit: 3 },
      desc: 'Permite curar Heridas y Fracturas con 1 clic de forma gratuita y añade +22 HP Máx por nivel.'
    },
    {
      id: 'obelisco_valor',
      name: 'Obelisco de Valor (Обелиск доблести)',
      icon: '⚔️',
      maxLevel: 5,
      baseCopper: 320,
      baseRiolita: 1,
      statsPerLevel: { atk: 4, crit: 2 },
      desc: 'Monumento a la gloria en Campos de Batalla. Otorga +4 ATQ, +2% Crítico y +10% Valor ganado por nivel.'
    },
    {
      id: 'estatua_experiencia',
      name: 'Estatua de Sabiduría (Статуя опыта)',
      icon: '🗽',
      maxLevel: 5,
      baseCopper: 280,
      baseRiolita: 1,
      statsPerLevel: { wis: 4, maxMp: 18 },
      desc: 'Canaliza la energía astral de Faeo (+4 SAB y +18 MP por nivel).'
    },
    {
      id: 'criadero_moroks',
      name: 'Criadero de Moroks y Mascotas (Вольер)',
      icon: '🔥',
      maxLevel: 5,
      baseCopper: 300,
      baseRiolita: 1,
      statsPerLevel: { agi: 4, atk: 4 },
      desc: 'Potencia a tus Moroks invocados, Monturas y Mascotas Rojas (+4 AGI y +4 ATQ por nivel).'
    }
  ];

  /* ------------------------------------------------------------------------
     5 CLAN TALENTS (КЛАНОВЫЕ ТАЛАНТЫ)
     ------------------------------------------------------------------------ */
  const CLAN_TALENTS = [
    { id: 'vitalidad_clan', name: 'Baluarte de Sangre Solar', icon: '❤️', maxLevel: 5, costCopper: 350, statsPerLevel: { maxHp: 25, vit: 4 }, desc: 'Aumenta la Salud Máxima (+25) y Vitalidad (+4) de todos los miembros del clan por nivel.' },
    { id: 'furia_clan', name: 'Filo Unido de Guerra', icon: '⚔️', maxLevel: 5, costCopper: 380, statsPerLevel: { atk: 7, str: 3 }, desc: 'Incrementa el Ataque Total (+7) y Fuerza (+3) por nivel gracias a los Tratados de Unidad.' },
    { id: 'baluarte_clan', name: 'Muro de Escudos Imperial', icon: '🛡️', maxLevel: 5, costCopper: 360, statsPerLevel: { def: 7, vit: 2 }, desc: 'Refuerza la Defensa Total (+7) en duelos, estancias y Campos de Batalla por nivel.' },
    { id: 'gloria_valor', name: 'Estandarte de Doble Valor', icon: '🚩', maxLevel: 5, costCopper: 400, statsPerLevel: { crit: 2, agi: 4 }, desc: 'Aumenta el Crítico Solar (+2%) y la Agilidad (+4) por nivel.' },
    { id: 'sabiduria_ancestral', name: 'Códice de los Arquitectos', icon: '📘', maxLevel: 5, costCopper: 360, statsPerLevel: { wis: 5, maxMp: 20 }, desc: 'Amplía la Sabiduría (+5) y la reserva de Maná (+20 MP) por nivel.' }
  ];

  /* ------------------------------------------------------------------------
     RUNES CATALOG LOOKUP
     ------------------------------------------------------------------------ */
  const RUNES = [
    ARTIFACTS.runa_mira,
    ARTIFACTS.runa_sina,
    ARTIFACTS.runa_inevitabilidad
  ];

  /* ------------------------------------------------------------------------
     FAIR OF WONDERS, ONLINE SHOP, WHEEL OF FORTUNE & DAILY FEATS
     ------------------------------------------------------------------------ */
  const FAIR_ITEMS = [
    { id: 'fair_cofre_mitril', itemId: 'cofre_mitril', currency: 'diamonds', cost: 4, badge: 'Feria de Diamantes' },
    { id: 'fair_runa_inevit', itemId: 'runa_inevitabilidad', currency: 'diamonds', cost: 8, badge: 'Feria de Diamantes' },
    { id: 'fair_cristal_celeste', itemId: 'cristal_celeste', currency: 'rubies', cost: 3, badge: 'Bazar de Rubíes' },
    { id: 'fair_anillo_antixp', itemId: 'anillo_anti_xp', currency: 'onlineTokens', cost: 3, badge: 'Tienda por Tiempo Online' },
    { id: 'fair_llave_cerrajero', itemId: 'llave_cerrajero', currency: 'onlineTokens', cost: 2, badge: 'Tienda por Tiempo Online' },
    { id: 'fair_chispa_celeste', itemId: 'chispa_celestial', currency: 'onlineTokens', cost: 2, badge: 'Tienda por Tiempo Online' },
    { id: 'fair_tratado_clan', itemId: 'tratado_unidad_clan', currency: 'diamonds', cost: 5, badge: 'Feria de las Maravillas' },
    { id: 'fair_piedra_grot', itemId: 'piedra_transformacion', currency: 'rubies', cost: 4, badge: 'Bazar de Rubíes' }
  ];

  const DAILY_FEATS = [
    { id: 'feat_caza', title: 'Cazador Incansable', desc: 'Abate al menos 1 criatura o recolecta 1 nodo en Modo Caza.', check: (s) => (s.world.totalKills || 0) >= 1 || (s.world.harvestCount || 0) >= 1, rewardCopper: 350, rewardDiamonds: 3, rewardOnlineTokens: 2 },
    { id: 'feat_taberna', title: 'Ronda del Tahúr (Катала)', desc: 'Juega una partida de Dados o Cartas en la Taberna del Grifo Dorado.', check: (s) => ((s.reputations && s.reputations.katala_tahur) || 0) > 0, rewardCopper: 400, rewardDiamonds: 3, rewardOnlineTokens: 2 },
    { id: 'feat_hacienda', title: 'Señor de la Hacienda', desc: 'Construye o mejora cualquier edificio en tu Hacienda (Поместье).', check: (s) => Object.values((s.estate && s.estate.buildings) || s.estate || {}).some((lvl) => typeof lvl === 'number' && lvl > 1), rewardCopper: 500, rewardDiamonds: 4, rewardOnlineTokens: 3 },
    { id: 'feat_campo_batalla', title: 'Héroe de los Campos de Batalla', desc: 'Acumula al menos 100 puntos de Valor (Доблесть).', check: (s) => (s.hero.valor || 0) >= 100, rewardCopper: 600, rewardDiamonds: 5, rewardOnlineTokens: 3 }
  ];

  /* ------------------------------------------------------------------------
     AUCTION HOUSE LISTINGS (CASA DE SUBASTAS — AI WARRIOR SELLERS)
     ------------------------------------------------------------------------ */
  const AUCTION_LISTINGS = [
    { id: 'auc_1', seller: 'Kaelen_Martillo', itemId: 'mandoble_korgan', qty: 1, priceCopper: 980 },
    { id: 'auc_2', seller: 'Seraphina_Luz', itemId: 'runa_mira', qty: 1, priceCopper: 950 },
    { id: 'auc_3', seller: 'Lyra_Flecha_Astral', itemId: 'cofre_mitril', qty: 1, priceCopper: 480 },
    { id: 'auc_4', seller: 'Casandra_Prisma', itemId: 'cristal_luminita', qty: 3, priceCopper: 620 },
    { id: 'auc_5', seller: 'Thorgar_Rompeescudos', itemId: 'hombreras_paladin', qty: 1, priceCopper: 720 },
    { id: 'auc_6', seller: 'Nerea_Del_Espejo', itemId: 'cristal_viejo_ogro', qty: 1, priceCopper: 540 },
    { id: 'auc_7', seller: 'Arthas_Leon_Solar', itemId: 'tratado_unidad_clan', qty: 2, priceCopper: 760 }
  ];

  /* ------------------------------------------------------------------------
     PROMOCODES (ПРОМОКОДЫ В АНКЕТЕ ПЕРСОНАЖА)
     ------------------------------------------------------------------------ */
  const PROMOCODES = {
    '9LETASTERII': {
      code: '9LETASTERII',
      title: '9 Años de Asteria (Праздничный промокод)',
      copper: 1500,
      diamonds: 15,
      rubies: 5,
      arkonaRep: 250,
      items: [{ itemId: 'cofre_mitril', qty: 1 }, { itemId: 'llave_cerrajero', qty: 1 }, { itemId: 'panacea_solar', qty: 2 }]
    },
    'DLEO-3947-URHF-3846': {
      code: 'DLEO-3947-URHF-3846',
      title: 'Tesoro de Arkona y Jors (Бриллианты и Влияние Арконы)',
      copper: 1200,
      diamonds: 10,
      rubies: 3,
      arkonaRep: 100,
      items: [{ itemId: 'chispa_celestial', qty: 2 }, { itemId: 'fragmento_eltico', qty: 2 }]
    },
    'ASTERIA2026': {
      code: 'ASTERIA2026',
      title: 'Suministros Imperiales 2026',
      copper: 2000,
      diamonds: 12,
      rubies: 4,
      arkonaRep: 150,
      items: [{ itemId: 'runa_mira', qty: 1 }, { itemId: 'riolita', qty: 3 }]
    },
    'SHEARA777': {
      code: 'SHEARA777',
      title: 'Bendición de la Diosa Sheara (+Неслом)',
      copper: 1800,
      diamonds: 20,
      rubies: 7,
      arkonaRep: 300,
      grantUnbreakable: true,
      items: [{ itemId: 'piedra_transformacion', qty: 1 }, { itemId: 'cristal_viejo_ogro', qty: 1 }]
    }
  };

  /* ------------------------------------------------------------------------
     BALAGUR RIDDLES & LIBRARY OF FAEO (КОНКУРСЫ БАЛАГУРОВ & БИБЛИОТЕКА)
     ------------------------------------------------------------------------ */
  const BALAGUR_RIDDLES = [
    {
      id: 'riddle_1',
      question: '¿Cuáles son los dos grandes continentes rivales del mundo de Faeo bajo la mirada de la diosa Sheara?',
      options: ['Ogriy (Humanos) y Khair (Magmares)', 'Atlantis y Lemuria', 'Valhalla y Niflheim'],
      correctIndex: 0,
      answerIndex: 0,
      answer: 0,
      rewardDiamonds: 5,
      rewardArkona: 120,
      rewardCopper: 400
    },
    {
      id: 'riddle_2',
      question: '¿Cómo se llama la instancia especial de farmeo rápido de Asteria donde se obtienen Piedras de Transformación?',
      options: ['El Laberinto Gris', 'La Gruta (ГРОТ)', 'La Torre de Cristal'],
      correctIndex: 1,
      answerIndex: 1,
      answer: 1,
      rewardDiamonds: 5,
      rewardArkona: 120,
      rewardCopper: 400
    },
    {
      id: 'riddle_3',
      question: '¿Qué joya especial de Asteria permite congelar la ganancia de XP para dominar tu rango de Valor (Доблесть)?',
      options: ['Anillo de Anti-Experiencia (Антиопыт)', 'Corona de Bronce', 'Talismán de Cobre'],
      correctIndex: 0,
      answerIndex: 0,
      answer: 0,
      rewardDiamonds: 5,
      rewardArkona: 150,
      rewardCopper: 500
    },
    {
      id: 'riddle_4',
      question: '¿Qué reputación sube automáticamente cada vez que juegas a los Dados o a las Cartas en la Taberna?',
      options: ['Reputación de Tahúr (Репутация Каталы)', 'Reputación de Pescador', 'Reputación de Minero'],
      correctIndex: 0,
      answerIndex: 0,
      answer: 0,
      rewardDiamonds: 6,
      rewardArkona: 160,
      rewardCopper: 600
    }
  ];

  const GIFTS_CATALOG = [
    { id: 'gift_corona_solar', name: 'Corona de Laurel Solar', icon: '👑', costCopper: 150 },
    { id: 'gift_caliz_grifo', name: 'Cáliz de Oro del Grifo', icon: '🏆', costCopper: 180 },
    { id: 'gift_rosa_astral', name: 'Loto Estelar Eterno', icon: '🪷', costCopper: 120 },
    { id: 'gift_espada_honor', name: 'Daga Ceremonial de Sheara', icon: '🗡️', costCopper: 220 }
  ];

  /* ------------------------------------------------------------------------
     16 SPANISH AI WARRIORS (ARENA PVP & WORLD PRESENCE ACROSS LOCATIONS)
     ------------------------------------------------------------------------ */
  const AI_WARRIORS = [
    { id: 'ai_1', name: 'Valerius_El_Justo', title: 'Paladín de la Ciudadela', level: 2, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'titan', clan: 'Hijos del Alba', locationId: 'ciudadela_luz', hp: 210, atk: 24, def: 14, crit: 8, weapon: 'Espada del Sol Naciente' },
    { id: 'ai_2', name: 'Lyra_Flecha_Astral', title: 'Cazadora de los Ecos', level: 2, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'sombra', clan: 'Centinelas Verdes', locationId: 'llanuras_alba', hp: 195, atk: 27, def: 11, crit: 14, weapon: 'Arco Largo Rúnico' },
    { id: 'ai_3', name: 'Kaelen_Martillo', title: 'Forjador de Hierro', level: 3, faction: 'khair', factionName: 'Magmares de Khair', style: 'destructor', clan: 'Yunque de Fuego', locationId: 'ciudadela_luz', hp: 260, atk: 31, def: 18, crit: 9, weapon: 'Mandoble de Acero' },
    { id: 'ai_4', name: 'Seraphina_Luz', title: 'Tejedora de Runas', level: 3, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'sombra', clan: 'Cónclave Astral', locationId: 'ciudadela_luz', hp: 240, atk: 35, def: 15, crit: 13, weapon: 'Bastón de los Ecos' },
    { id: 'ai_5', name: 'Darius_Colmillo', title: 'Domador de Huargos', level: 4, faction: 'khair', factionName: 'Magmares de Khair', style: 'destructor', clan: 'Manada Dorada', locationId: 'llanuras_alba', hp: 310, atk: 39, def: 20, crit: 12, weapon: 'Lanza de Caballería' },
    { id: 'ai_6', name: 'Nerea_Del_Espejo', title: 'Dama de las Estrellas', level: 4, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'sombra', clan: 'Cónclave Astral', locationId: 'lago_espejo', hp: 300, atk: 43, def: 19, crit: 16, weapon: 'Tridente Astral' },
    { id: 'ai_7', name: 'Thorgar_Rompeescudos', title: 'Veterano de la Muralla', level: 5, faction: 'khair', factionName: 'Magmares de Khair', style: 'titan', clan: 'Yunque de Fuego', locationId: 'bosque_ecos', hp: 380, atk: 48, def: 25, crit: 11, weapon: 'Hacha de Guerra Runificada' },
    { id: 'ai_8', name: 'Aeliana_Viento', title: 'Ejecutora Silenciosa', level: 5, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'sombra', clan: 'Centinelas Verdes', locationId: 'bosque_ecos', hp: 345, atk: 52, def: 21, crit: 20, weapon: 'Daga Gemela de los Ecos' },
    { id: 'ai_9', name: 'Rodrigo_Sol_Dorado', title: 'Capitán de Caballería', level: 6, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'titan', clan: 'Hijos del Alba', locationId: 'lago_espejo', hp: 440, atk: 58, def: 29, crit: 15, weapon: 'Martillo de Trueno Titánico' },
    { id: 'ai_10', name: 'Casandra_Prisma', title: 'Arcanista de Luminita', level: 6, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'destructor', clan: 'Cónclave Astral', locationId: 'cuevas_cristalinas', hp: 420, atk: 63, def: 27, crit: 18, weapon: 'Hoja Prismática de Krystallos' },
    { id: 'ai_11', name: 'Garrick_Ceniza', title: 'Expurgador de Fronteras', level: 7, faction: 'khair', factionName: 'Magmares de Khair', style: 'destructor', clan: 'Dragones de Helion', locationId: 'cuevas_cristalinas', hp: 510, atk: 69, def: 33, crit: 17, weapon: 'Hoja Prismática de Krystallos' },
    { id: 'ai_12', name: 'Helena_Serafin', title: 'Custodia del Templo', level: 8, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'titan', clan: 'Hijos del Alba', locationId: 'templo_antiguo', hp: 590, atk: 76, def: 38, crit: 19, weapon: 'Mandoble del Rayo Celestial' },
    { id: 'ai_13', name: 'Mordecai_Obsidiana', title: 'Cazador de Dragones', level: 8, faction: 'khair', factionName: 'Magmares de Khair', style: 'destructor', clan: 'Dragones de Helion', locationId: 'frontera_ceniza', hp: 620, atk: 81, def: 40, crit: 21, weapon: 'Mandoble del Rayo Celestial' },
    { id: 'ai_14', name: 'Isolda_Estrella_Alba', title: 'Paladina Imperial', level: 9, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'titan', clan: 'Hijos del Alba', locationId: 'templo_antiguo', hp: 700, atk: 88, def: 44, crit: 22, weapon: 'Mandoble del Rayo Celestial' },
    { id: 'ai_15', name: 'Arthas_Leon_Solar', title: 'Campeón del Coliseo', level: 10, faction: 'ogriy', factionName: 'Humanos de Ogriy', style: 'destructor', clan: 'Dragones de Helion', locationId: 'ciudadela_luz', hp: 820, atk: 96, def: 48, crit: 24, weapon: 'Aethel-Valkyr, Espada Suprema' },
    { id: 'ai_16', name: 'Soberano_Aethelgard', title: 'Leyenda Viviente de Asteria', level: 11, faction: 'khair', factionName: 'Magmares de Khair', style: 'titan', clan: 'Dragones de Helion', locationId: 'frontera_ceniza', hp: 960, atk: 106, def: 54, crit: 26, weapon: 'Aethel-Valkyr, Espada Suprema' }
  ];

  /* ------------------------------------------------------------------------
     MAIN CAMPAIGN QUESTS
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
      id: 'cube_runa_inevitabilidad',
      name: 'Sintetizar Runa de Inevitabilidad (Руна Неизбежности)',
      resultId: 'runa_inevitabilidad',
      resultQty: 1,
      copperCost: 850,
      ingredients: [
        { itemId: 'fragmento_eltico', qty: 1 },
        { itemId: 'hoja_solar', qty: 1 }
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
        { itemId: 'fragmento_eltico', qty: 1 }
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
    FACTIONS,
    COMBAT_STYLES,
    COMBAT_STANCES,
    LOCATIONS,
    NPCS,
    CREATURES,
    ARTIFACTS,
    SUPER_BLOWS,
    MAGIC_SPELLS,
    PROFESSIONS,
    CRAFT_RECIPES,
    PETS,
    PET_CRYSTALS,
    MOUNTS,
    DISCIPLES,
    REPUTATIONS,
    MEDALS,
    VALOR_RANKS,
    getValorRank,
    BATTLEFIELDS,
    VALOR_ARSENAL,
    INSTANCES,
    CARD_DECKS,
    ESTATE_BUILDINGS,
    CLAN_TALENTS,
    RUNES,
    FAIR_ITEMS,
    DAILY_FEATS,
    AUCTION_LISTINGS,
    PROMOCODES,
    BALAGUR_RIDDLES,
    GIFTS_CATALOG,
    AI_WARRIORS,
    QUESTS,
    CUBE_RECIPES,
    splitCurrency,
    formatCurrencyBadge
  };
})();
