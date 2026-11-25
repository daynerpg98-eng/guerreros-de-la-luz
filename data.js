/* ==========================================================================
   GUERREROS DE LA LUZ: CRÓNICAS DE ASTERIA
   World Data, HD Procedural Backdrops, Estancias I-VIII, Items, Quests & Lore
   ========================================================================== */

window.GDL_DATA = (function () {
  'use strict';

  /* ------------------------------------------------------------------------
     HD SVG PANORAMIC ARTWORK GENERATOR FOR ALL 8 ESTANCIAS
     ------------------------------------------------------------------------ */
  const ROOM_ART = {
    bastion_alba: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a120b"/>
          <stop offset="55%" stop-color="#3d2814"/>
          <stop offset="100%" stop-color="#0d0a07"/>
        </linearGradient>
        <radialGradient id="sun1" cx="50%" cy="38%" r="45%">
          <stop offset="0%" stop-color="#ffdfa0" stop-opacity="0.75"/>
          <stop offset="45%" stop-color="#d4942a" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#140e08" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky1)"/>
      <circle cx="600" cy="160" r="240" fill="url(#sun1)"/>
      <!-- Distant mountains -->
      <polygon points="0,340 180,190 360,290 540,150 730,280 940,170 1200,320 1200,420 0,420" fill="#140f0a" opacity="0.85"/>
      <!-- Citadel Spires -->
      <g fill="#1c150e" stroke="#6e5223" stroke-width="1.5">
        <rect x="460" y="95" width="70" height="245"/>
        <polygon points="455,95 495,30 535,95" fill="#2e2112"/>
        <rect x="670" y="95" width="70" height="245"/>
        <polygon points="665,95 705,30 745,95" fill="#2e2112"/>
        <rect x="530" y="135" width="140" height="205"/>
        <polygon points="525,135 600,55 675,135" fill="#382815"/>
      </g>
      <!-- Glowing Archway -->
      <path d="M565,340 L565,235 A35,35 0 0,1 635,235 L635,340 Z" fill="#f4d068" opacity="0.85"/>
      <!-- Braziers -->
      <circle cx="495" cy="210" r="6" fill="#ff9d3b"/>
      <circle cx="705" cy="210" r="6" fill="#ff9d3b"/>
      <rect y="335" width="1200" height="85" fill="#090706"/>
    </svg>`,

    campamento_ceniza: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#121417"/>
          <stop offset="60%" stop-color="#291d17"/>
          <stop offset="100%" stop-color="#0a0807"/>
        </linearGradient>
        <radialGradient id="fire2" cx="55%" cy="72%" r="35%">
          <stop offset="0%" stop-color="#ff6b2b" stop-opacity="0.65"/>
          <stop offset="60%" stop-color="#9e2a0e" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky2)"/>
      <polygon points="0,310 240,180 450,275 720,160 960,260 1200,195 1200,420 0,420" fill="#13100d"/>
      <!-- Watchtowers & Palisades -->
      <g fill="#1b1510" stroke="#4d3924" stroke-width="1.5">
        <polygon points="260,330 330,220 400,330"/>
        <polygon points="760,330 840,210 920,330"/>
        <rect x="490" y="190" width="55" height="140"/>
        <polygon points="480,190 517,140 555,190"/>
      </g>
      <circle cx="650" cy="300" r="180" fill="url(#fire2)"/>
      <polygon points="635,330 650,285 665,330" fill="#ff8533"/>
      <rect y="330" width="1200" height="90" fill="#080706"/>
    </svg>`,

    bosque_espectral: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#091318"/>
          <stop offset="65%" stop-color="#11242b"/>
          <stop offset="100%" stop-color="#070b0d"/>
        </linearGradient>
        <radialGradient id="mist3" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stop-color="#48b8e8" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#070b0d" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky3)"/>
      <circle cx="600" cy="220" r="280" fill="url(#mist3)"/>
      <!-- Twisted Spectral Trees & Runestones -->
      <g fill="#0c1214" stroke="#264a57" stroke-width="1.5">
        <path d="M180,360 L195,120 L140,40 M195,180 L250,110"/>
        <path d="M390,360 L405,140 L355,60 M405,190 L460,130"/>
        <path d="M820,360 L805,130 L860,50 M805,180 L745,115"/>
        <path d="M1010,360 L995,140 L1045,70"/>
      </g>
      <!-- Glowing Monolith -->
      <polygon points="575,340 585,175 615,175 625,340" fill="#132229" stroke="#48b8e8" stroke-width="2"/>
      <circle cx="600" cy="235" r="10" fill="#6be0ff"/>
      <rect y="340" width="1200" height="80" fill="#060809"/>
    </svg>`,

    catacumbas_cristal: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cave4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0b0912"/>
          <stop offset="55%" stop-color="#1b1429"/>
          <stop offset="100%" stop-color="#07060a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#cave4)"/>
      <!-- Giant Mana & Amber Crystals -->
      <g stroke="#7be0ff" stroke-width="1.5" fill="#1b4d6e" opacity="0.85">
        <polygon points="220,350 250,180 285,350"/>
        <polygon points="270,350 315,215 340,350"/>
        <polygon points="860,350 895,170 935,350"/>
      </g>
      <g stroke="#f4d068" stroke-width="1.5" fill="#7d5614" opacity="0.88">
        <polygon points="555,345 600,145 645,345"/>
        <polygon points="520,345 550,220 580,345"/>
        <polygon points="620,345 655,215 685,345"/>
      </g>
      <rect y="340" width="1200" height="80" fill="#070609"/>
    </svg>`,

    forja_titanes: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lava5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#170907"/>
          <stop offset="60%" stop-color="#3d120a"/>
          <stop offset="100%" stop-color="#120503"/>
        </linearGradient>
        <radialGradient id="magma5" cx="50%" cy="75%" r="45%">
          <stop offset="0%" stop-color="#ff6a1a" stop-opacity="0.75"/>
          <stop offset="60%" stop-color="#b81d0b" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#lava5)"/>
      <circle cx="600" cy="310" r="280" fill="url(#magma5)"/>
      <!-- Colossal Anvil & Chains -->
      <g fill="#1c120e" stroke="#8c4f2b" stroke-width="2">
        <rect x="290" y="40" width="35" height="300"/>
        <rect x="875" y="40" width="35" height="300"/>
        <polygon points="490,340 520,250 680,250 710,340"/>
        <polygon points="450,250 750,250 715,210 485,210"/>
      </g>
      <rect y="340" width="1200" height="80" fill="#140604"/>
    </svg>`,

    claustro_sol_quebrado: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14111c"/>
          <stop offset="55%" stop-color="#2e2318"/>
          <stop offset="100%" stop-color="#0a0807"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky6)"/>
      <!-- Broken Solar Halo -->
      <circle cx="600" cy="155" r="85" fill="none" stroke="#f4d068" stroke-width="6" stroke-dasharray="35 18"/>
      <!-- Gothic Cathedral Ruins -->
      <g fill="#171310" stroke="#7d6131" stroke-width="1.5">
        <rect x="240" y="130" width="50" height="210"/>
        <rect x="370" y="100" width="50" height="240"/>
        <rect x="780" y="100" width="50" height="240"/>
        <rect x="910" y="130" width="50" height="210"/>
        <path d="M420,220 Q600,70 780,220" fill="none" stroke="#d4a843" stroke-width="3"/>
      </g>
      <rect y="340" width="1200" height="80" fill="#080706"/>
    </svg>`,

    muralla_eclipse: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a0808"/>
          <stop offset="55%" stop-color="#2e1111"/>
          <stop offset="100%" stop-color="#090505"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky7)"/>
      <!-- Eclipse Ring -->
      <circle cx="600" cy="135" r="72" fill="#050404" stroke="#e84c3d" stroke-width="5"/>
      <circle cx="600" cy="135" r="78" fill="none" stroke="#f4d068" stroke-width="1.5" opacity="0.7"/>
      <!-- Battlements & Dragon Towers -->
      <g fill="#140c0b" stroke="#6e2e26" stroke-width="1.5">
        <rect x="140" y="210" width="920" height="130"/>
        <rect x="220" y="140" width="95" height="200"/>
        <rect x="885" y="140" width="95" height="200"/>
        <polygon points="540,340 565,190 635,190 660,340" fill="#24100e" stroke="#d4a843"/>
      </g>
      <rect y="340" width="1200" height="80" fill="#070404"/>
    </svg>`,

    trono_abismo_solar: `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d0507"/>
          <stop offset="50%" stop-color="#290a0e"/>
          <stop offset="100%" stop-color="#050304"/>
        </linearGradient>
        <radialGradient id="abyssGlow" cx="50%" cy="35%" r="48%">
          <stop offset="0%" stop-color="#ff3b2f" stop-opacity="0.55"/>
          <stop offset="45%" stop-color="#d4a843" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#sky8)"/>
      <circle cx="600" cy="150" r="290" fill="url(#abyssGlow)"/>
      <!-- Total Solar Eclipse Crown -->
      <circle cx="600" cy="130" r="68" fill="#030202" stroke="#f4d068" stroke-width="4"/>
      <circle cx="600" cy="130" r="82" fill="none" stroke="#e04438" stroke-width="3" stroke-dasharray="18 10"/>
      <!-- Obsidian Pillars & Throne -->
      <g fill="#12090a" stroke="#d4a843" stroke-width="1.8">
        <polygon points="280,345 310,95 355,345"/>
        <polygon points="845,345 890,95 920,345"/>
        <polygon points="535,345 565,175 635,175 665,345" fill="#1f0c0e"/>
        <polygon points="575,175 600,115 625,175" fill="#e04438"/>
      </g>
      <rect y="340" width="1200" height="80" fill="#040203"/>
    </svg>`
  };

  /* ------------------------------------------------------------------------
     HERO ORDERS / CLASSES
     ------------------------------------------------------------------------ */
  const CLASSES = {
    paladin_alba: {
      id: 'paladin_alba',
      name: 'Paladín del Alba',
      title: 'Custodio de la Llama Solar',
      faction: 'Orden de Helion',
      bonuses: { str: 5, agi: 2, vit: 6, wis: 4, lck: 2 },
      desc: 'Guerrero acorazado que canaliza la Luz Primordial en escudos sagrados y mandobles ardientes.'
    },
    ejecutor_astral: {
      id: 'ejecutor_astral',
      name: 'Ejecutor Astral',
      title: 'Sombra de las Estrellas',
      faction: 'Cónclave del Crepúsculo',
      bonuses: { str: 4, agi: 7, vit: 3, wis: 2, lck: 5 },
      desc: 'Maestro de filos gemelos y golpes críticos devastadores que atraviesan cualquier guardia.'
    },
    arcanista_solar: {
      id: 'arcanista_solar',
      name: 'Arcanista del Sol',
      title: 'Tejedor de Runas de Fuego',
      faction: 'Círculo de Aethelgard',
      bonuses: { str: 2, agi: 3, vit: 3, wis: 8, lck: 4 },
      desc: 'Sabio que invoca tormentas de plasma solar y restaura su espíritu con cánticos antiguos.'
    }
  };

  /* ------------------------------------------------------------------------
     COMBAT SKILLS (ACTIVE ABILITIES)
     ------------------------------------------------------------------------ */
  const SKILLS = [
    {
      id: 'strike_basic',
      name: 'Tajo de Acero',
      mpCost: 0,
      mult: 1.0,
      type: 'attack',
      icon: '⚔️',
      desc: 'Ataque físico preciso dirigido a la zona seleccionada (+8 MP).'
    },
    {
      id: 'solar_verdict',
      name: 'Veredicto Solar',
      mpCost: 18,
      mult: 1.55,
      type: 'holy_strike',
      icon: '☀️',
      desc: 'Descarga un golpe imbuido en Luz Solar que inflige 155% de daño y quema la armadura.'
    },
    {
      id: 'aegis_light',
      name: 'Égida del Alba',
      mpCost: 22,
      mult: 0.9,
      type: 'shield_heal',
      icon: '🛡️',
      desc: 'Restaura 28% de Salud máxima, golpea al enemigo y refuerza tu bloqueo durante 2 rondas.'
    },
    {
      id: 'supernova_blade',
      name: 'Supernova de Helion',
      mpCost: 38,
      mult: 2.25,
      type: 'ultimate',
      icon: '🔥',
      desc: 'Técnica suprema de los Guerreros de la Luz: ignora el bloqueo enemigo e inflige 225% de daño.'
    }
  ];

  /* ------------------------------------------------------------------------
     ITEMS, EQUIPMENT, RELICS & CONSUMABLES DATABASE
     ------------------------------------------------------------------------ */
  const ITEMS = {
    // Starter & Tier 1
    espada_iniciado: {
      id: 'espada_iniciado',
      name: 'Mandoble de Bronce Solar',
      slot: 'weapon',
      rarity: 'common',
      icon: '🗡️',
      stats: { atk: 12, str: 3, crit: 2 },
      value: 45,
      desc: 'Forjado en los hornos del Bastión del Alba para los nuevos juramentados.'
    },
    escudo_vigia: {
      id: 'escudo_vigia',
      name: 'Escudo del Vigía de Aethel',
      slot: 'shield',
      rarity: 'common',
      icon: '🛡️',
      stats: { def: 10, vit: 3 },
      value: 40,
      desc: 'Escudo de roble ferrado con el emblema del sol naciente.'
    },
    yelmo_centinela: {
      id: 'yelmo_centinela',
      name: 'Yelmo de Centinela',
      slot: 'helm',
      rarity: 'uncommon',
      icon: '🪖',
      stats: { def: 9, vit: 4, wis: 2 },
      value: 85,
      desc: 'Protege la mente contra los susurros del Bosque Espectral.'
    },
    coraza_ceniza: {
      id: 'coraza_ceniza',
      name: 'Coraza Templada en Ceniza',
      slot: 'armor',
      rarity: 'uncommon',
      icon: '🥋',
      stats: { def: 18, vit: 6, str: 3 },
      value: 120,
      desc: 'Placas de acero oscuro reforzadas en la frontera de la Ceniza.'
    },
    grebas_viento: {
      id: 'grebas_viento',
      name: 'Grebas del Paso Astral',
      slot: 'boots',
      rarity: 'rare',
      icon: '🥾',
      stats: { def: 12, agi: 7, lck: 4 },
      value: 175,
      desc: 'Permiten esquivar emboscadas en las criptas profundas.'
    },
    amuleto_cristal: {
      id: 'amuleto_cristal',
      name: 'Talismán de Cuarzo Lumínico',
      slot: 'amulet',
      rarity: 'rare',
      icon: '📿',
      stats: { wis: 8, mp: 35, crit: 4 },
      value: 220,
      desc: 'Cristal resonante extraído de las Catacumbas de Cristal.'
    },
    anillo_ascua: {
      id: 'anillo_ascua',
      name: 'Sortija de Ascua Eterna',
      slot: 'ring',
      rarity: 'rare',
      icon: '💍',
      stats: { str: 6, atk: 14, crit: 5 },
      value: 240,
      desc: 'Conserva el calor inextinguible de la Forja de los Titanes.'
    },
    capa_penumbra: {
      id: 'capa_penumbra',
      name: 'Manto de Penumbra Dorada',
      slot: 'cloak',
      rarity: 'epic',
      icon: '🧥',
      stats: { def: 16, agi: 8, wis: 7, vit: 6 },
      value: 360,
      desc: 'Tejido con hilos de luz crepuscular por los monjes del Claustro.'
    },

    // High-Tier & Endgame Estancias Items
    hoja_ignis_titan: {
      id: 'hoja_ignis_titan',
      name: 'Hoja Runificada de Ignis-Val',
      slot: 'weapon',
      rarity: 'epic',
      icon: '⚔️',
      stats: { atk: 38, str: 12, crit: 8, wis: 5 },
      value: 520,
      desc: 'Arma maestra templada en magma vivo por el Titán Herrero.'
    },
    egida_sol_quebrado: {
      id: 'egida_sol_quebrado',
      name: 'Égida Real del Sol Quebrado',
      slot: 'shield',
      rarity: 'epic',
      icon: '⚜️',
      stats: { def: 34, vit: 14, wis: 8 },
      value: 540,
      desc: 'Reliquia sagrada recuperada del Claustro del Sol Quebrado.'
    },
    corona_helion: {
      id: 'corona_helion',
      name: 'Diadema Imperial de Helion',
      slot: 'helm',
      rarity: 'legendary',
      icon: '👑',
      stats: { def: 28, vit: 12, wis: 15, crit: 8 },
      value: 850,
      desc: 'Corona ancestral de los Reyes de la Luz en la Muralla del Eclipse.'
    },
    armadura_serafin: {
      id: 'armadura_serafin',
      name: 'Armadura de Placas del Serafín Solar',
      slot: 'armor',
      rarity: 'legendary',
      icon: '🛡️',
      stats: { def: 52, vit: 22, str: 14, wis: 10 },
      value: 1100,
      desc: 'Forjada con metal meteórico e inscripciones sagradas indestructibles.'
    },
    mandoble_luz_eterna: {
      id: 'mandoble_luz_eterna',
      name: 'Aethel-Valkyr, Mandoble de la Luz Eterna',
      slot: 'weapon',
      rarity: 'legendary',
      icon: '🌟',
      stats: { atk: 72, str: 24, crit: 15, wis: 14, lck: 10 },
      value: 2000,
      desc: 'La espada mítica capaz de partir el velo del Eclipse Abisal.'
    },
    sello_eclipse_abisal: {
      id: 'sello_eclipse_abisal',
      name: 'Sello Soberano de Malakor',
      slot: 'ring',
      rarity: 'legendary',
      icon: '🔮',
      stats: { atk: 28, str: 14, agi: 14, wis: 16, crit: 12 },
      value: 1800,
      desc: 'Trofeo supremo arrebatado al Emperador del Abismo Solar.'
    },

    // Consumables & Crafting Materials
    elixir_alba: {
      id: 'elixir_alba',
      name: 'Elixir Carmesí del Alba',
      slot: 'consumable',
      rarity: 'common',
      icon: '🧪',
      healHp: 120,
      value: 25,
      desc: 'Restaura 120 puntos de Salud instantáneamente.'
    },
    nectar_astral: {
      id: 'nectar_astral',
      name: 'Néctar de Éter Astral',
      slot: 'consumable',
      rarity: 'uncommon',
      icon: '⚗️',
      healMp: 75,
      value: 30,
      desc: 'Restaura 75 puntos de Maná Solar.'
    },
    panacea_helion: {
      id: 'panacea_helion',
      name: 'Panacea Real de Helion',
      slot: 'consumable',
      rarity: 'epic',
      icon: '🏺',
      healHp: 350,
      healMp: 140,
      value: 95,
      desc: 'Bálsamo sagrado para las estancias finales: restaura 350 HP y 140 MP.'
    },
    mineral_luminita: {
      id: 'mineral_luminita',
      name: 'Lingote de Luminita Pura',
      slot: 'material',
      rarity: 'rare',
      icon: '💎',
      value: 60,
      desc: 'Catalizador indispensable para mejorar armas y forjar reliquias solares.'
    },
    nucleo_eclipse: {
      id: 'nucleo_eclipse',
      name: 'Núcleo de Obsidiana Abisal',
      slot: 'material',
      rarity: 'legendary',
      icon: '🌑',
      value: 250,
      desc: 'Esencia condensada de los señores de la oscuridad en las estancias finales.'
    }
  };

  /* ------------------------------------------------------------------------
     THE 8 ESTANCIAS (LOCATIONS, NPCS, ENEMIES, HARVEST NODES & FINAL BOSSES)
     ------------------------------------------------------------------------ */
  const ESTANCIAS = [
    {
      id: 'bastion_alba',
      order: 1,
      name: 'Estancia I: Bastión del Alba',
      region: 'Ciudadela Capital de Helion',
      danger: 'Santuario Seguro (Nivel 1+)',
      minLevel: 1,
      artKey: 'bastion_alba',
      lore: 'Las torres doradas del Bastión del Alba resisten como el último faro de la humanidad frente a la marea del Eclipse. Aquí los herreros templan el acero sagrado y los maestres instruyen a los Guerreros de la Luz.',
      connections: ['campamento_ceniza', 'catacumbas_cristal'],
      sanctuaryHeal: true,
      npcs: [
        {
          id: 'comandante_valerius',
          name: 'Gran Comandante Valerius',
          role: 'Maestre de la Orden Solar',
          icon: '🦁',
          greeting: '«Guerrero, las sombras de Malakor se extienden desde la Muralla del Eclipse hasta nuestras fronteras. Completa tu juramento, purga las ocho estancias y devuelve el sol a Asteria.»',
          shop: ['elixir_alba', 'nectar_astral', 'espada_iniciado', 'escudo_vigia', 'yelmo_centinela']
        },
        {
          id: 'herrera_solaria',
          name: 'Maestra Forjadora Solaria',
          role: 'Artífice de Reliquias',
          icon: '⚒️',
          greeting: '«Trae Lingotes de Luminita y Núcleos de Obsidiana a mi yunque. Con ellos despertaremos el verdadero poder de tus armas hasta forjar a Aethel-Valkyr.»',
          opensForge: true
        }
      ],
      enemies: [
        {
          id: 'automata_entrenamiento',
          name: 'Gólem de Instrucción Rúnico',
          level: 1,
          hp: 95,
          atk: 14,
          def: 5,
          xp: 35,
          gold: 22,
          icon: '🗿',
          drops: [
            { itemId: 'elixir_alba', chance: 0.45 },
            { itemId: 'mineral_luminita', chance: 0.25 }
          ]
        }
      ]
    },
    {
      id: 'campamento_ceniza',
      order: 2,
      name: 'Estancia II: Frontera de la Ceniza',
      region: 'Tierras Quemadas del Este',
      danger: 'Riesgo Moderado (Nivel 2+)',
      minLevel: 1,
      artKey: 'campamento_ceniza',
      lore: 'Los campos calcinados que rodean la ciudadela humean con los restos de antiguos asedios. Merodeadores de la Sombra y sabuesos de brasa acechan las caravanas de suministros.',
      connections: ['bastion_alba', 'bosque_espectral'],
      npcs: [
        {
          id: 'exploradora_lyra',
          name: 'Exploradora Real Lyra',
          role: 'Vigía de Avanzada',
          icon: '🏹',
          greeting: '«Los Merodeadores de Ceniza han bloqueado el paso hacia el Bosque Espectral. Si abates a su capitán, te entregaré suministros de la guardia real.»',
          shop: ['elixir_alba', 'nectar_astral', 'coraza_ceniza']
        }
      ],
      enemies: [
        {
          id: 'sabueso_brasa',
          name: 'Sabueso de Brasa Oscura',
          level: 2,
          hp: 135,
          atk: 21,
          def: 8,
          xp: 55,
          gold: 36,
          icon: '🐺',
          drops: [
            { itemId: 'elixir_alba', chance: 0.4 },
            { itemId: 'mineral_luminita', chance: 0.35 }
          ]
        },
        {
          id: 'capitan_ceniza',
          name: 'Kaelgor, Capitán de la Ceniza',
          level: 3,
          hp: 190,
          atk: 27,
          def: 12,
          xp: 85,
          gold: 60,
          icon: '👹',
          isElite: true,
          drops: [
            { itemId: 'coraza_ceniza', chance: 0.45 },
            { itemId: 'mineral_luminita', chance: 0.5 }
          ]
        }
      ]
    },
    {
      id: 'bosque_espectral',
      order: 3,
      name: 'Estancia III: Bosque de los Ecos Espectrales',
      region: 'Arboleda de Niebla Astral',
      danger: 'Peligro Alto (Nivel 3+)',
      minLevel: 2,
      artKey: 'bosque_espectral',
      lore: 'Árboles petrificados se alzan entre una neblina azulada donde los espíritus de los antiguos caídos custodian monolitos rúnicos cargados de energía astral.',
      connections: ['campamento_ceniza', 'catacumbas_cristal', 'forja_titanes'],
      npcs: [
        {
          id: 'druida_aelion',
          name: 'Archidruida Aelion',
          role: 'Guardián del Monolito',
          icon: '🦌',
          greeting: '«La niebla corrompe a los espectros del bosque. Purifica a la Ánima del Crepúsculo y los senderos hacia las Catacumbas y la Forja se abrirán ante ti.»',
          shop: ['nectar_astral', 'grebas_viento', 'panacea_helion']
        }
      ],
      enemies: [
        {
          id: 'espectro_niebla',
          name: 'Acechador de Niebla Espectral',
          level: 3,
          hp: 180,
          atk: 29,
          def: 11,
          xp: 80,
          gold: 52,
          icon: '👻',
          drops: [
            { itemId: 'nectar_astral', chance: 0.45 },
            { itemId: 'grebas_viento', chance: 0.25 }
          ]
        },
        {
          id: 'anima_crepusculo',
          name: 'Sylvaris, Ánima del Crepúsculo',
          level: 4,
          hp: 250,
          atk: 35,
          def: 15,
          xp: 125,
          gold: 88,
          icon: '🦌',
          isElite: true,
          drops: [
            { itemId: 'grebas_viento', chance: 0.4 },
            { itemId: 'mineral_luminita', chance: 0.65 }
          ]
        }
      ]
    },
    {
      id: 'catacumbas_cristal',
      order: 4,
      name: 'Estancia IV: Catacumbas de Cristal',
      region: 'Subsuelo de Aethelgard',
      danger: 'Profundidades Arcanas (Nivel 4+)',
      minLevel: 3,
      artKey: 'catacumbas_cristal',
      lore: 'Bóvedas subterráneas iluminadas por colosales drusas de cuarzo solar y cristales de maná puro. Los devoradores cristalinos custodian las vetas de Luminita.',
      connections: ['bastion_alba', 'bosque_espectral', 'forja_titanes'],
      harvestNode: {
        name: 'Veta Real de Luminita Cristalina',
        rewardItem: 'mineral_luminita',
        rewardAstral: 12
      },
      npcs: [
        {
          id: 'erudito_orian',
          name: 'Arcanista Mayor Orian',
          role: 'Expedicionario del Cónclave',
          icon: '🧙‍♂️',
          greeting: '«Estos cristales almacenan la luz del primer amanecer. Extrae Luminita y derrota al Coloso de Cuarzo para asegurar nuestras reservas arcanas.»',
          shop: ['amuleto_cristal', 'panacea_helion', 'mineral_luminita']
        }
      ],
      enemies: [
        {
          id: 'escorpion_cuarzo',
          name: 'Escorpión de Cuarzo Astral',
          level: 4,
          hp: 235,
          atk: 36,
          def: 17,
          xp: 115,
          gold: 75,
          icon: '🦂',
          drops: [
            { itemId: 'mineral_luminita', chance: 0.6 },
            { itemId: 'amuleto_cristal', chance: 0.25 }
          ]
        },
        {
          id: 'coloso_cristal',
          name: 'Krystallos, Coloso de las Bóvedas',
          level: 5,
          hp: 320,
          atk: 44,
          def: 22,
          xp: 165,
          gold: 115,
          icon: '💎',
          isElite: true,
          drops: [
            { itemId: 'amuleto_cristal', chance: 0.5 },
            { itemId: 'mineral_luminita', chance: 0.85 }
          ]
        }
      ]
    },
    {
      id: 'forja_titanes',
      order: 5,
      name: 'Estancia V: Forja de los Titanes',
      region: 'Caldera Volcánica de Ignis-Val',
      danger: 'Calor Extremo (Nivel 5+)',
      minLevel: 4,
      artKey: 'forja_titanes',
      lore: 'Sobre ríos de magma incandescente cuelgan los yunques ciclópeos donde los antiguos Titanes forjaron las armas de los dioses solares. El Señor de la Caldera aún golpea el metal.',
      connections: ['bosque_espectral', 'catacumbas_cristal', 'claustro_sol_quebrado'],
      npcs: [
        {
          id: 'forjador_korgath',
          name: 'Korgath el Inextinguible',
          role: 'Herrero Titánico',
          icon: '🔨',
          greeting: '«Solo quien soporta el fuego de Ignis-Val merece empuñar acero de leyenda. Vence al Señor de la Caldera y templaré tu equipo para las estancias finales.»',
          opensForge: true,
          shop: ['anillo_ascua', 'hoja_ignis_titan', 'panacea_helion']
        }
      ],
      enemies: [
        {
          id: 'mirmidon_magma',
          name: 'Mirmidón de Magma Fundido',
          level: 5,
          hp: 300,
          atk: 46,
          def: 21,
          xp: 155,
          gold: 105,
          icon: '🔥',
          drops: [
            { itemId: 'anillo_ascua', chance: 0.3 },
            { itemId: 'mineral_luminita', chance: 0.65 }
          ]
        },
        {
          id: 'titan_ignis_val',
          name: 'Vulkarion, Señor de la Caldera',
          level: 6,
          hp: 410,
          atk: 54,
          def: 26,
          xp: 220,
          gold: 160,
          icon: '🌋',
          isBoss: true,
          drops: [
            { itemId: 'hoja_ignis_titan', chance: 0.55 },
            { itemId: 'nucleo_eclipse', chance: 0.45 }
          ]
        }
      ]
    },
    {
      id: 'claustro_sol_quebrado',
      order: 6,
      name: 'Estancia VI: Claustro del Sol Quebrado',
      region: 'Santuario Alto de las Nubes',
      danger: 'Estancia Final I (Nivel 6+)',
      minLevel: 5,
      artKey: 'claustro_sol_quebrado',
      lore: 'Catedral gótica suspendida entre riscos celestiales donde el disco solar fue fracturado durante la Primera Guerra del Eclipse. Los Inquisidores Caídos custodian el sello hacia la Muralla.',
      connections: ['forja_titanes', 'muralla_eclipse'],
      npcs: [
        {
          id: 'oraculo_seraphina',
          name: 'Oráculo Seraphina',
          role: 'Custodia del Sol Quebrado',
          icon: '✨',
          greeting: '«Has llegado a las Estancias Finales, Guerrero. El Inquisidor Vaelen sucumbió a la promesa del Eclipse. Derrótalo para recuperar la Égida Real y abrir el puente hacia la Muralla.»',
          shop: ['capa_penumbra', 'egida_sol_quebrado', 'panacea_helion']
        }
      ],
      enemies: [
        {
          id: 'custodio_quebrado',
          name: 'Templario del Eclipse Cenizo',
          level: 6,
          hp: 375,
          atk: 55,
          def: 25,
          xp: 205,
          gold: 145,
          icon: '⚔️',
          drops: [
            { itemId: 'capa_penumbra', chance: 0.35 },
            { itemId: 'panacea_helion', chance: 0.45 }
          ]
        },
        {
          id: 'inquisidor_vaelen',
          name: 'Archinquisidor Vaelen el Quebrado',
          level: 7,
          hp: 510,
          atk: 65,
          def: 30,
          xp: 295,
          gold: 220,
          icon: '⚜️',
          isBoss: true,
          drops: [
            { itemId: 'egida_sol_quebrado', chance: 0.65 },
            { itemId: 'nucleo_eclipse', chance: 0.65 }
          ]
        }
      ]
    },
    {
      id: 'muralla_eclipse',
      order: 7,
      name: 'Estancia VII: Muralla del Eclipse',
      region: 'Bastión Exterior del Abismo',
      danger: 'Estancia Final II (Nivel 7+)',
      minLevel: 6,
      artKey: 'muralla_eclipse',
      lore: 'Bajo un sol negro coronado de fuego carmesí se extiende la colosal Muralla del Eclipse. Dragones de obsidiana y la Guardia Imperial Oscura defienden la entrada al Trono Abisal.',
      connections: ['claustro_sol_quebrado', 'trono_abismo_solar'],
      npcs: [
        {
          id: 'general_auron',
          name: 'General Auron Espada-Solar',
          role: 'Líder de la Vanguardia Final',
          icon: '🦅',
          greeting: '«¡A un paso del Abismo Solar! El Dragón Vorathax bloquea el portón imperial. Si logras abatirlo, te entregaré las reliquias reales para el duelo contra Malakor.»',
          shop: ['corona_helion', 'armadura_serafin', 'panacea_helion']
        }
      ],
      enemies: [
        {
          id: 'caballero_abismo',
          name: 'Caballero Juramentado del Abismo',
          level: 7,
          hp: 460,
          atk: 66,
          def: 30,
          xp: 265,
          gold: 190,
          icon: '🛡️',
          drops: [
            { itemId: 'corona_helion', chance: 0.3 },
            { itemId: 'nucleo_eclipse', chance: 0.55 }
          ]
        },
        {
          id: 'dragon_vorathax',
          name: 'Vorathax, Dragón de la Corona Negra',
          level: 8,
          hp: 650,
          atk: 78,
          def: 35,
          xp: 410,
          gold: 320,
          icon: '🐉',
          isBoss: true,
          drops: [
            { itemId: 'armadura_serafin', chance: 0.65 },
            { itemId: 'corona_helion', chance: 0.5 },
            { itemId: 'nucleo_eclipse', chance: 0.85 }
          ]
        }
      ]
    },
    {
      id: 'trono_abismo_solar',
      order: 8,
      name: 'Estancia VIII: Santuario del Trono del Abismo Solar',
      region: 'Corazón del Eclipse Eterno (Estancia Suprema)',
      danger: 'Estancia Final Suprema (Nivel 8+)',
      minLevel: 7,
      artKey: 'trono_abismo_solar',
      lore: 'En el epicentro del vacío cósmico flota el Trono del Abismo Solar. Aquí aguarda el Emperador Malakor, Devorador de Soles, custodiando la Chispa Primordial de Asteria.',
      connections: ['muralla_eclipse', 'bastion_alba'],
      npcs: [
        {
          id: 'avatar_helion',
          name: 'Espíritu Primordial de Helion',
          role: 'Avatar de la Luz Eterna',
          icon: '☀️',
          greeting: '«Hijo de la Luz, todas las crónicas convergen en este instante. Si derribas a Malakor en el Trono del Abismo Solar, tu nombre quedará grabado para siempre como Soberano del Alba.»',
          shop: ['panacea_helion', 'mandoble_luz_eterna']
        }
      ],
      enemies: [
        {
          id: 'arconte_vacio',
          name: 'Arconte Real del Vacío Solar',
          level: 8,
          hp: 560,
          atk: 76,
          def: 34,
          xp: 350,
          gold: 260,
          icon: '👁️',
          drops: [
            { itemId: 'panacea_helion', chance: 0.65 },
            { itemId: 'nucleo_eclipse', chance: 0.75 }
          ]
        },
        {
          id: 'emperador_malakor',
          name: 'Malakor, Soberano del Eclipse Eterno',
          level: 10,
          hp: 920,
          atk: 94,
          def: 42,
          xp: 800,
          gold: 750,
          icon: '👑',
          isBoss: true,
          isFinalBoss: true,
          drops: [
            { itemId: 'mandoble_luz_eterna', chance: 1.0 },
            { itemId: 'sello_eclipse_abisal', chance: 1.0 }
          ]
        }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     MAIN CAMPAIGN QUESTS (SPANNING ALL 8 ESTANCIAS)
     ------------------------------------------------------------------------ */
  const QUESTS = [
    {
      id: 'q1_bautismo_luz',
      title: 'I. El Juramento del Alba',
      estancia: 'Estancia I-II',
      desc: 'Derrota al Gólem de Instrucción o a las bestias de la Frontera de la Ceniza para probar tu temple.',
      targetType: 'any_kills',
      targetCount: 2,
      rewardGold: 80,
      rewardXp: 90,
      rewardItem: 'yelmo_centinela'
    },
    {
      id: 'q2_capitan_ceniza',
      title: 'II. Purga en la Frontera de Ceniza',
      estancia: 'Estancia II',
      desc: 'Abate a Kaelgor, Capitán de la Ceniza, para liberar las rutas de suministro del Bastión.',
      targetType: 'enemy_id',
      targetId: 'capitan_ceniza',
      targetCount: 1,
      rewardGold: 130,
      rewardXp: 150,
      rewardItem: 'coraza_ceniza'
    },
    {
      id: 'q3_ecos_bosque',
      title: 'III. El Monolito de la Niebla',
      estancia: 'Estancia III',
      desc: 'Derrota a Sylvaris, Ánima del Crepúsculo, en el Bosque de los Ecos Espectrales.',
      targetType: 'enemy_id',
      targetId: 'anima_crepusculo',
      targetCount: 1,
      rewardGold: 180,
      rewardXp: 210,
      rewardItem: 'grebas_viento'
    },
    {
      id: 'q4_corazon_cristal',
      title: 'IV. Resonancia en las Catacumbas',
      estancia: 'Estancia IV',
      desc: 'Vence a Krystallos, Coloso de las Bóvedas, en las Catacumbas de Cristal.',
      targetType: 'enemy_id',
      targetId: 'coloso_cristal',
      targetCount: 1,
      rewardGold: 240,
      rewardXp: 280,
      rewardItem: 'amuleto_cristal'
    },
    {
      id: 'q5_yunque_titan',
      title: 'V. El Fuego de Ignis-Val',
      estancia: 'Estancia V',
      desc: 'Derrota a Vulkarion, Señor de la Caldera, en la Forja de los Titanes.',
      targetType: 'enemy_id',
      targetId: 'titan_ignis_val',
      targetCount: 1,
      rewardGold: 320,
      rewardXp: 380,
      rewardItem: 'hoja_ignis_titan'
    },
    {
      id: 'q6_sol_quebrado',
      title: 'VI. Redención del Claustro',
      estancia: 'Estancia VI (Final I)',
      desc: 'Vence al Archinquisidor Vaelen en el Claustro del Sol Quebrado.',
      targetType: 'enemy_id',
      targetId: 'inquisidor_vaelen',
      targetCount: 1,
      rewardGold: 450,
      rewardXp: 520,
      rewardItem: 'egida_sol_quebrado'
    },
    {
      id: 'q7_alas_eclipse',
      title: 'VII. El Dragón de la Muralla',
      estancia: 'Estancia VII (Final II)',
      desc: 'Abate a Vorathax, Dragón de la Corona Negra, en la Muralla del Eclipse.',
      targetType: 'enemy_id',
      targetId: 'dragon_vorathax',
      targetCount: 1,
      rewardGold: 650,
      rewardXp: 750,
      rewardItem: 'armadura_serafin'
    },
    {
      id: 'q8_amanecer_eterno',
      title: 'VIII. El Amanecer Eterno de Asteria',
      estancia: 'Estancia VIII (Suprema)',
      desc: 'Destrona a Malakor, Soberano del Eclipse Eterno, en el Trono del Abismo Solar.',
      targetType: 'enemy_id',
      targetId: 'emperador_malakor',
      targetCount: 1,
      rewardGold: 1500,
      rewardXp: 1500,
      rewardItem: 'mandoble_luz_eterna'
    }
  ];

  /* ------------------------------------------------------------------------
     FORGE RECIPES (CRAFTING & UPGRADING)
     ------------------------------------------------------------------------ */
  const FORGE_RECIPES = [
    {
      id: 'craft_hoja_ignis',
      resultItem: 'hoja_ignis_titan',
      goldCost: 220,
      materials: [{ itemId: 'mineral_luminita', count: 3 }]
    },
    {
      id: 'craft_corona_helion',
      resultItem: 'corona_helion',
      goldCost: 420,
      materials: [
        { itemId: 'mineral_luminita', count: 4 },
        { itemId: 'nucleo_eclipse', count: 1 }
      ]
    },
    {
      id: 'craft_armadura_serafin',
      resultItem: 'armadura_serafin',
      goldCost: 580,
      materials: [
        { itemId: 'mineral_luminita', count: 5 },
        { itemId: 'nucleo_eclipse', count: 2 }
      ]
    },
    {
      id: 'craft_mandoble_luz_eterna',
      resultItem: 'mandoble_luz_eterna',
      goldCost: 900,
      materials: [
        { itemId: 'mineral_luminita', count: 6 },
        { itemId: 'nucleo_eclipse', count: 3 }
      ]
    }
  ];

  return {
    ROOM_ART,
    CLASSES,
    SKILLS,
    ITEMS,
    ESTANCIAS,
    QUESTS,
    FORGE_RECIPES
  };
})();
