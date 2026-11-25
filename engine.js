/* ==========================================================================
   GUERREROS DE LA LUZ: CRÓNICAS DE ASTERIA
   Persistent Browser MMORPG Engine (localStorage + IndexedDB + WebAudio Synth)
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'guerreros_de_la_luz_save_v2';
  const IDB_NAME = 'GuerrerosDeLaLuzDB';
  const IDB_STORE = 'saves';

  const DATA = window.GDL_DATA;

  /* ------------------------------------------------------------------------
     WEB AUDIO API PROCEDURAL FANTASY SYNTHESIZER
     ------------------------------------------------------------------------ */
  const SoundFX = {
    ctx: null,
    muted: false,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    playTone(freq, type, duration, gainVal = 0.08, slideTo = null) {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
        }
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Ignore audio errors on restricted autoplay
      }
    },
    hit() {
      this.playTone(180, 'sawtooth', 0.14, 0.09, 65);
    },
    crit() {
      this.playTone(520, 'triangle', 0.18, 0.12, 880);
      setTimeout(() => this.playTone(240, 'sawtooth', 0.2, 0.1, 80), 60);
    },
    block() {
      this.playTone(320, 'square', 0.12, 0.07, 290);
    },
    heal() {
      this.playTone(440, 'sine', 0.22, 0.08, 660);
    },
    victory() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.28, 0.09), idx * 110);
      });
    }
  };

  /* ------------------------------------------------------------------------
     DEFAULT PERSISTENT STATE
     ------------------------------------------------------------------------ */
  function createDefaultState() {
    return {
      version: 2,
      savedAt: Date.now(),
      hero: {
        name: 'Aethelgard',
        classId: 'paladin_alba',
        level: 1,
        xp: 0,
        xpNext: 100,
        hp: 180,
        maxHp: 180,
        mp: 90,
        maxMp: 90,
        unspentPoints: 2,
        baseStats: {
          str: 10,
          agi: 7,
          vit: 11,
          wis: 8,
          lck: 6
        },
        gold: 160,
        astralCrystals: 25,
        solarValor: 10,
        reputation: {
          orden_helion: 120,
          custodios_alba: 80,
          cazadores_eclipse: 40
        }
      },
      equipment: {
        helm: 'yelmo_centinela',
        amulet: null,
        weapon: 'espada_iniciado',
        armor: 'coraza_ceniza',
        shield: 'escudo_vigia',
        cloak: null,
        ring: null,
        boots: null
      },
      upgrades: {
        espada_iniciado: 1,
        coraza_ceniza: 0,
        escudo_vigia: 0,
        yelmo_centinela: 0
      },
      inventory: [
        { itemId: 'elixir_alba', qty: 4 },
        { itemId: 'nectar_astral', qty: 2 },
        { itemId: 'mineral_luminita', qty: 2 }
      ],
      world: {
        currentEstancia: 'bastion_alba',
        visitedEstancias: ['bastion_alba'],
        clearedEstancias: [],
        bossesDefeated: {},
        killCounts: {},
        totalKills: 0,
        malakorDefeated: false
      },
      quests: {
        claimed: {}
      },
      ui: {
        centerTab: 'estancia', // 'estancia' | 'combat' | 'atlas'
        rightTab: 'inventory', // 'inventory' | 'quests' | 'forge' | 'codex'
        selectedBagItem: 'elixir_alba',
        attackZone: 'head',    // 'head' | 'torso' | 'legs'
        defendZone: 'torso'    // 'head' | 'torso' | 'legs'
      }
    };
  }

  let state = createDefaultState();
  let activeCombat = null;

  /* ------------------------------------------------------------------------
     PERSISTENT STORAGE ENGINE (localStorage + IndexedDB Mirror)
     ------------------------------------------------------------------------ */
  function saveToIndexedDB(serialized) {
    try {
      if (!window.indexedDB) return;
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = function (e) {
        const db = e.target.result;
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(serialized, STORAGE_KEY);
      };
    } catch (err) {
      // Fallback silently to localStorage
    }
  }

  function saveGame(showToast = false) {
    state.savedAt = Date.now();
    const raw = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
    saveToIndexedDB(raw);

    const ind = document.getElementById('save-status-text');
    if (ind) {
      const dateStr = new Date(state.savedAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      ind.textContent = `Motor Persistente Activo (${dateStr})`;
    }
    if (showToast) {
      addLog('Crónica guardada en el motor persistente del navegador.', 'quest');
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.hero && parsed.world) {
          state = Object.assign(createDefaultState(), parsed);
          recalcDerivedVitals(false);
          return true;
        }
      }
    } catch (e) {
      console.warn('Error cargando partida:', e);
    }
    state = createDefaultState();
    recalcDerivedVitals(true);
    return false;
  }

  /* ------------------------------------------------------------------------
     STAT & DERIVED COMBAT CALCULATIONS
     ------------------------------------------------------------------------ */
  function getTotalStats() {
    const cls = DATA.CLASSES[state.hero.classId] || DATA.CLASSES.paladin_alba;
    const totals = {
      str: state.hero.baseStats.str + (cls.bonuses.str || 0),
      agi: state.hero.baseStats.agi + (cls.bonuses.agi || 0),
      vit: state.hero.baseStats.vit + (cls.bonuses.vit || 0),
      wis: state.hero.baseStats.wis + (cls.bonuses.wis || 0),
      lck: state.hero.baseStats.lck + (cls.bonuses.lck || 0),
      atk: 8 + state.hero.level * 3,
      def: 4 + state.hero.level * 2,
      crit: 6
    };

    Object.keys(state.equipment).forEach((slot) => {
      const itemId = state.equipment[slot];
      if (!itemId) return;
      const item = DATA.ITEMS[itemId];
      if (!item || !item.stats) return;
      const upgLevel = state.upgrades[itemId] || 0;
      const upgMult = 1 + upgLevel * 0.16;

      Object.keys(item.stats).forEach((k) => {
        if (totals[k] !== undefined) {
          totals[k] += Math.round(item.stats[k] * upgMult);
        }
      });
    });

    totals.atk += Math.round(totals.str * 1.9);
    totals.def += Math.round(totals.vit * 1.35 + totals.agi * 0.4);
    totals.crit = Math.min(65, totals.crit + Math.round(totals.agi * 0.65 + totals.lck * 0.85));
    totals.maxHp = 110 + state.hero.level * 25 + totals.vit * 12;
    totals.maxMp = 55 + state.hero.level * 12 + totals.wis * 9;

    return totals;
  }

  function recalcDerivedVitals(healFull = false) {
    const totals = getTotalStats();
    state.hero.maxHp = totals.maxHp;
    state.hero.maxMp = totals.maxMp;
    if (healFull) {
      state.hero.hp = state.hero.maxHp;
      state.hero.mp = state.hero.maxMp;
    } else {
      state.hero.hp = Math.min(state.hero.hp, state.hero.maxHp);
      state.hero.mp = Math.min(state.hero.mp, state.hero.maxMp);
    }
  }

  /* ------------------------------------------------------------------------
     INVENTORY & ITEM MANAGEMENT
     ------------------------------------------------------------------------ */
  function getItemCount(itemId) {
    const entry = state.inventory.find((i) => i.itemId === itemId);
    return entry ? entry.qty : 0;
  }

  function addItem(itemId, qty = 1) {
    if (!DATA.ITEMS[itemId]) return;
    const existing = state.inventory.find((i) => i.itemId === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      state.inventory.push({ itemId, qty });
    }
  }

  function removeItem(itemId, qty = 1) {
    const idx = state.inventory.findIndex((i) => i.itemId === itemId);
    if (idx === -1) return false;
    if (state.inventory[idx].qty < qty) return false;
    state.inventory[idx].qty -= qty;
    if (state.inventory[idx].qty <= 0) {
      state.inventory.splice(idx, 1);
    }
    return true;
  }

  function equipOrUseItem(itemId) {
    const item = DATA.ITEMS[itemId];
    if (!item) return;

    if (item.slot === 'consumable') {
      if (!removeItem(itemId, 1)) {
        addLog(`No te quedan unidades de ${item.name}.`, 'combat-hit');
        return;
      }
      recalcDerivedVitals(false);
      if (item.healHp) {
        state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + item.healHp);
      }
      if (item.healMp) {
        state.hero.mp = Math.min(state.hero.maxMp, state.hero.mp + item.healMp);
      }
      SoundFX.heal();
      addLog(`Consumiste ${item.name} y restauraste tus fuerzas vitales.`, 'combat-win');
      if (activeCombat) {
        activeCombat.log.unshift(`✨ Usaste ${item.name} durante el duelo.`);
      }
      saveGame();
      renderAll();
      return;
    }

    if (item.slot === 'material') {
      addLog(`${item.name} es un material de la Forja Solar.`, 'lore');
      return;
    }

    // Equip gear
    const targetSlot = item.slot;
    if (state.equipment[targetSlot] === itemId) {
      addLog(`${item.name} ya está equipado.`, 'lore');
      return;
    }

    if (!removeItem(itemId, 1)) return;
    const prevEquipped = state.equipment[targetSlot];
    if (prevEquipped) {
      addItem(prevEquipped, 1);
    }
    state.equipment[targetSlot] = itemId;
    recalcDerivedVitals(false);
    SoundFX.block();
    addLog(`Equipaste ${item.name} en la ranura de ${targetSlot.toUpperCase()}.`, 'loot');
    saveGame();
    renderAll();
  }

  function upgradeItem(itemId) {
    const item = DATA.ITEMS[itemId];
    if (!item || item.slot === 'consumable' || item.slot === 'material') return;
    const currentLvl = state.upgrades[itemId] || 0;
    const goldCost = (currentLvl + 1) * 90;
    const luminitaCost = currentLvl + 1;

    if (state.hero.gold < goldCost || getItemCount('mineral_luminita') < luminitaCost) {
      addLog(`Necesitas ${goldCost} Oro y ${luminitaCost} Lingote(s) de Luminita para templar ${item.name}.`, 'combat-hit');
      return;
    }

    state.hero.gold -= goldCost;
    removeItem('mineral_luminita', luminitaCost);
    state.upgrades[itemId] = currentLvl + 1;
    recalcDerivedVitals(false);
    SoundFX.crit();
    addLog(`¡Forja Solar! ${item.name} ha sido templado a nivel +${state.upgrades[itemId]}.`, 'loot');
    saveGame();
    renderAll();
  }

  /* ------------------------------------------------------------------------
     CHRONICLE LOGGING
     ------------------------------------------------------------------------ */
  const logs = [
    {
      time: 'Alba',
      text: 'Bienvenido a Guerreros de la LUZ: Crónicas de Asteria. El motor persistente ha cargado tu progreso.',
      type: 'lore'
    }
  ];

  function addLog(text, type = 'normal') {
    const now = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    logs.unshift({ time: now, text, type });
    if (logs.length > 60) logs.pop();
    renderChronicle();
  }

  /* ------------------------------------------------------------------------
     PROGRESSION & LEVEL UP
     ------------------------------------------------------------------------ */
  function grantXp(amount) {
    state.hero.xp += amount;
    while (state.hero.xp >= state.hero.xpNext) {
      state.hero.xp -= state.hero.xpNext;
      state.hero.level += 1;
      state.hero.xpNext = Math.round(state.hero.xpNext * 1.42);
      state.hero.unspentPoints += 3;
      recalcDerivedVitals(true);
      SoundFX.victory();
      addLog(
        `¡ASCENSO SOLAR! Has alcanzado el Nivel ${state.hero.level}. Salud y Maná restaurados (+3 puntos de atributo).`,
        'loot'
      );
    }
  }

  /* ------------------------------------------------------------------------
     TACTICAL COMBAT ENGINE (HEAD / TORSO / LEGS STRIKE & BLOCK ZONES)
     ------------------------------------------------------------------------ */
  const ZONES = [
    { id: 'head', label: 'Cabeza y Yelmo', icon: '🪖' },
    { id: 'torso', label: 'Pecho y Coraza', icon: '🥋' },
    { id: 'legs', label: 'Guardia Baja', icon: '🥾' }
  ];

  function startCombat(enemyId) {
    const estancia = DATA.ESTANCIAS.find((e) => e.id === state.world.currentEstancia);
    if (!estancia) return;
    const template = estancia.enemies.find((en) => en.id === enemyId);
    if (!template) return;

    recalcDerivedVitals(false);
    if (state.hero.hp <= 15) {
      state.hero.hp = Math.round(state.hero.maxHp * 0.45);
      addLog('La Luz Primordial reanima tu espíritu antes del combate.', 'quest');
    }

    activeCombat = {
      round: 1,
      enemy: {
        ...template,
        maxHp: template.hp,
        currentHp: template.hp
      },
      shieldBuffRounds: 0,
      enemyBurnRounds: 0,
      log: [
        `⚔️ ¡Comienza el duelo en ${estancia.name} contra ${template.name} (Nv. ${template.level})!`,
        `Elige tu Zona de Ataque, tu Zona de Bloqueo y ejecuta una técnica solar.`
      ]
    };

    state.ui.centerTab = 'combat';
    SoundFX.block();
    addLog(`Has desafiado a ${template.name} en combate táctico.`, 'quest');
    renderAll();
  }

  function executeCombatRound(skillId) {
    if (!activeCombat) return;
    const skill = DATA.SKILLS.find((s) => s.id === skillId) || DATA.SKILLS[0];
    if (state.hero.mp < skill.mpCost) {
      addLog(`Maná insuficiente para ejecutar ${skill.name}.`, 'combat-hit');
      return;
    }

    const heroStats = getTotalStats();
    const enemy = activeCombat.enemy;

    // Spend or regenerate MP
    state.hero.mp = Math.max(0, state.hero.mp - skill.mpCost);
    if (skill.id === 'strike_basic') {
      state.hero.mp = Math.min(state.hero.maxMp, state.hero.mp + 8);
    }

    // AI picks attack & block zones
    const enemyAttackZone = ZONES[Math.floor(Math.random() * ZONES.length)].id;
    const enemyBlockZone = ZONES[Math.floor(Math.random() * ZONES.length)].id;

    const playerAttackZone = state.ui.attackZone || 'head';
    const playerDefendZone = state.ui.defendZone || 'torso';

    // 1. Player Turn Calculation
    let rawDmg = heroStats.atk * skill.mult - enemy.def * 0.55;
    rawDmg = Math.max(12, rawDmg);

    const enemyBlocked = enemyBlockZone === playerAttackZone && skill.type !== 'ultimate';
    if (enemyBlocked) {
      rawDmg *= 0.58;
    }

    const isCrit = Math.random() * 100 < heroStats.crit;
    if (isCrit) {
      rawDmg *= 1.65;
      SoundFX.crit();
    } else {
      SoundFX.hit();
    }

    const finalPlayerDmg = Math.round(rawDmg);
    enemy.currentHp = Math.max(0, enemy.currentHp - finalPlayerDmg);

    const zoneNameMap = { head: 'Cabeza', torso: 'Torso', legs: 'Piernas' };
    let pMsg = `Ronda ${activeCombat.round}: Usas [${skill.name}] hacia ${zoneNameMap[playerAttackZone]} → ${finalPlayerDmg} daño`;
    if (isCrit) pMsg += ' ¡CRÍTICO SOLAR!';
    if (enemyBlocked) pMsg += ' (Parcialmente bloqueado)';
    activeCombat.log.unshift(pMsg);

    // Special skill effects
    if (skill.type === 'holy_strike') {
      activeCombat.enemyBurnRounds = 2;
      activeCombat.log.unshift(`☀️ Llama Solar abrasa la armadura de ${enemy.name} por 2 rondas.`);
    } else if (skill.type === 'shield_heal') {
      const healAmt = Math.round(state.hero.maxHp * 0.28);
      state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + healAmt);
      activeCombat.shieldBuffRounds = 2;
      activeCombat.log.unshift(`🛡️ Égida del Alba restaura +${healAmt} HP y refuerza tu guardia.`);
    }

    // Ongoing solar burn damage on enemy
    if (activeCombat.enemyBurnRounds > 0 && enemy.currentHp > 0) {
      const burnDmg = Math.round(heroStats.wis * 1.4 + 10);
      enemy.currentHp = Math.max(0, enemy.currentHp - burnDmg);
      activeCombat.enemyBurnRounds -= 1;
      activeCombat.log.unshift(`🔥 Quemadura Solar inflige ${burnDmg} de daño adicional a ${enemy.name}.`);
    }

    // Check Enemy Defeat
    if (enemy.currentHp <= 0) {
      handleCombatVictory(enemy);
      return;
    }

    // 2. Enemy Counter-Attack
    let enemyRaw = enemy.atk - heroStats.def * 0.48;
    enemyRaw = Math.max(8, enemyRaw);

    const playerBlocked = playerDefendZone === enemyAttackZone;
    if (playerBlocked) {
      enemyRaw *= 0.42;
      SoundFX.block();
    }
    if (activeCombat.shieldBuffRounds > 0) {
      enemyRaw *= 0.68;
      activeCombat.shieldBuffRounds -= 1;
    }

    const finalEnemyDmg = Math.round(enemyRaw);
    state.hero.hp = Math.max(0, state.hero.hp - finalEnemyDmg);

    let eMsg = `${enemy.name} ataca a tu ${zoneNameMap[enemyAttackZone]} → ${finalEnemyDmg} daño`;
    if (playerBlocked) eMsg += ' ¡BLOQUEO PERFECTO!';
    activeCombat.log.unshift(eMsg);

    // Check Player Defeat
    if (state.hero.hp <= 0) {
      handleCombatDefeat(enemy);
      return;
    }

    activeCombat.round += 1;
    saveGame();
    renderAll();
  }

  function handleCombatVictory(enemy) {
    SoundFX.victory();
    const goldGain = enemy.gold;
    const xpGain = enemy.xp;
    state.hero.gold += goldGain;
    state.hero.solarValor += enemy.isBoss ? 15 : 4;
    state.hero.reputation.orden_helion += enemy.isBoss ? 35 : 10;
    state.hero.reputation.cazadores_eclipse += enemy.isBoss ? 40 : 12;

    state.world.totalKills = (state.world.totalKills || 0) + 1;
    state.world.killCounts[enemy.id] = (state.world.killCounts[enemy.id] || 0) + 1;

    if (enemy.isBoss || enemy.isElite) {
      state.world.bossesDefeated[enemy.id] = true;
      if (!state.world.clearedEstancias.includes(state.world.currentEstancia)) {
        state.world.clearedEstancias.push(state.world.currentEstancia);
      }
    }

    // Roll loot drops
    const droppedNames = [];
    if (enemy.drops) {
      enemy.drops.forEach((d) => {
        if (Math.random() <= d.chance) {
          addItem(d.itemId, 1);
          const it = DATA.ITEMS[d.itemId];
          if (it) droppedNames.push(it.name);
        }
      });
    }

    addLog(
      `¡VICTORIA! Abatiste a ${enemy.name} (+${xpGain} XP, +${goldGain} Oro${
        droppedNames.length ? ', Botín: ' + droppedNames.join(', ') : ''
      }).`,
      'combat-win'
    );

    grantXp(xpGain);

    const wasFinalBoss = Boolean(enemy.isFinalBoss);
    if (wasFinalBoss) {
      state.world.malakorDefeated = true;
    }

    activeCombat = null;
    state.ui.centerTab = 'estancia';
    saveGame();
    renderAll();

    if (wasFinalBoss) {
      openVictoryModal();
    }
  }

  function handleCombatDefeat(enemy) {
    addLog(
      `Caíste ante ${enemy.name}. Los Custodios del Alba te trasladan al santuario para sanar tus heridas.`,
      'combat-hit'
    );
    activeCombat = null;
    state.hero.hp = Math.round(state.hero.maxHp * 0.6);
    state.hero.mp = Math.round(state.hero.maxMp * 0.6);
    state.ui.centerTab = 'estancia';
    saveGame();
    renderAll();
  }

  /* ------------------------------------------------------------------------
     WORLD NAVIGATION & HARVESTING
     ------------------------------------------------------------------------ */
  function travelToEstancia(estanciaId) {
    const target = DATA.ESTANCIAS.find((e) => e.id === estanciaId);
    if (!target) return;

    if (state.hero.level < target.minLevel) {
      addLog(
        `Se requiere Nivel ${target.minLevel} para adentrarse en ${target.name}.`,
        'combat-hit'
      );
      return;
    }

    activeCombat = null;
    state.world.currentEstancia = target.id;
    if (!state.world.visitedEstancias.includes(target.id)) {
      state.world.visitedEstancias.push(target.id);
    }

    if (target.sanctuaryHeal) {
      recalcDerivedVitals(true);
      addLog(`Las llamas sagradas de ${target.name} restauran toda tu Salud y Maná.`, 'combat-win');
    } else {
      addLog(`Viajaste a ${target.name} (${target.region}).`, 'lore');
    }

    state.ui.centerTab = 'estancia';
    saveGame();
    renderAll();
  }

  function harvestRoomNode() {
    const estancia = DATA.ESTANCIAS.find((e) => e.id === state.world.currentEstancia);
    if (!estancia || !estancia.harvestNode) return;
    addItem(estancia.harvestNode.rewardItem, 1);
    state.hero.astralCrystals += estancia.harvestNode.rewardAstral;
    SoundFX.heal();
    addLog(
      `Extrajiste 1x Lingote de Luminita Pura y +${estancia.harvestNode.rewardAstral} Cristales Astrales de la veta.`,
      'loot'
    );
    saveGame();
    renderAll();
  }

  /* ------------------------------------------------------------------------
     QUEST PROGRESS & REWARDS
     ------------------------------------------------------------------------ */
  function getQuestProgress(q) {
    if (q.targetType === 'any_kills') {
      return Math.min(q.targetCount, state.world.totalKills || 0);
    }
    if (q.targetType === 'enemy_id') {
      return Math.min(q.targetCount, state.world.killCounts[q.targetId] || 0);
    }
    return 0;
  }

  function claimQuest(questId) {
    const q = DATA.QUESTS.find((x) => x.id === questId);
    if (!q || state.quests.claimed[questId]) return;
    const prog = getQuestProgress(q);
    if (prog < q.targetCount) return;

    state.quests.claimed[questId] = true;
    state.hero.gold += q.rewardGold;
    if (q.rewardItem) {
      addItem(q.rewardItem, 1);
    }
    grantXp(q.rewardXp);
    SoundFX.victory();
    addLog(
      `¡Misión Completada: ${q.title}! Recibes +${q.rewardGold} Oro, +${q.rewardXp} XP${
        q.rewardItem ? ' y ' + DATA.ITEMS[q.rewardItem].name : ''
      }.`,
      'quest'
    );
    saveGame();
    renderAll();
  }

  /* ------------------------------------------------------------------------
     FORGE CRAFTING
     ------------------------------------------------------------------------ */
  function craftRecipe(recipeId) {
    const rec = DATA.FORGE_RECIPES.find((r) => r.id === recipeId);
    if (!rec) return;
    if (state.hero.gold < rec.goldCost) {
      addLog('No tienes suficiente Oro Solar para esta forja.', 'combat-hit');
      return;
    }
    for (const mat of rec.materials) {
      if (getItemCount(mat.itemId) < mat.count) {
        addLog(`Te faltan materiales (${DATA.ITEMS[mat.itemId].name}) para completar la forja.`, 'combat-hit');
        return;
      }
    }

    state.hero.gold -= rec.goldCost;
    rec.materials.forEach((m) => removeItem(m.itemId, m.count));
    addItem(rec.resultItem, 1);
    SoundFX.victory();
    const created = DATA.ITEMS[rec.resultItem];
    addLog(`¡Has forjado la reliquia [${created.name}] en el Yunque Solar!`, 'loot');
    saveGame();
    renderAll();
  }

  /* ------------------------------------------------------------------------
     UI RENDERING FUNCTIONS
     ------------------------------------------------------------------------ */
  function renderTopBar() {
    recalcDerivedVitals(false);
    const h = state.hero;

    document.getElementById('top-hp-nums').textContent = `${h.hp} / ${h.maxHp}`;
    document.getElementById('top-mp-nums').textContent = `${h.mp} / ${h.maxMp}`;
    document.getElementById('top-xp-nums').textContent = `${h.xp} / ${h.xpNext}`;

    document.getElementById('top-hp-fill').style.width = `${Math.round((h.hp / h.maxHp) * 100)}%`;
    document.getElementById('top-mp-fill').style.width = `${Math.round((h.mp / h.maxMp) * 100)}%`;
    document.getElementById('top-xp-fill').style.width = `${Math.round((h.xp / h.xpNext) * 100)}%`;

    document.getElementById('currency-gold').textContent = h.gold;
    document.getElementById('currency-astral').textContent = h.astralCrystals;
    document.getElementById('currency-valor').textContent = h.solarValor;
  }

  function renderLeftHeroPanel() {
    const h = state.hero;
    const cls = DATA.CLASSES[h.classId] || DATA.CLASSES.paladin_alba;
    const totals = getTotalStats();

    document.getElementById('hero-display-name').textContent = h.name;
    document.getElementById('hero-display-class').textContent = `${cls.name} • ${cls.faction}`;
    document.getElementById('hero-display-level').textContent = h.level;
    document.getElementById('hero-faction-tag').textContent = cls.title;

    // Render 8 Ragdoll Equipment Slots
    const leftSlots = [
      { key: 'helm', label: 'Yelmo', fallback: '🪖' },
      { key: 'amulet', label: 'Amuleto', fallback: '📿' },
      { key: 'weapon', label: 'Arma', fallback: '🗡️' },
      { key: 'armor', label: 'Coraza', fallback: '🥋' }
    ];
    const rightSlots = [
      { key: 'shield', label: 'Égida', fallback: '🛡️' },
      { key: 'cloak', label: 'Manto', fallback: '🧥' },
      { key: 'ring', label: 'Sortija', fallback: '💍' },
      { key: 'boots', label: 'Grebas', fallback: '🥾' }
    ];

    const renderSlotCol = (slots) =>
      slots
        .map((s) => {
          const itemId = state.equipment[s.key];
          const item = itemId ? DATA.ITEMS[itemId] : null;
          const upg = itemId && state.upgrades[itemId] ? `+${state.upgrades[itemId]}` : '';
          const rarityClass = item ? `equipped rarity-${item.rarity}` : '';
          return `
            <div class="equip-slot ${rarityClass}" data-slot="${s.key}" title="${
            item ? item.name + ' ' + upg : s.label + ' (Vacío)'
          }">
              ${upg ? `<span class="bag-upgrade-tag">${upg}</span>` : ''}
              <span class="slot-icon">${item ? item.icon : s.fallback}</span>
              <span class="slot-label">${item ? item.name : s.label}</span>
            </div>
          `;
        })
        .join('');

    document.getElementById('paperdoll-left-col').innerHTML = renderSlotCol(leftSlots);
    document.getElementById('paperdoll-right-col').innerHTML = renderSlotCol(rightSlots);

    // Unspent attribute points badge
    const badge = document.getElementById('unspent-points-badge');
    if (h.unspentPoints > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = `+${h.unspentPoints} PTS`;
    } else {
      badge.style.display = 'none';
    }

    // Stats grid
    const statLabels = [
      { key: 'str', label: 'Fuerza' },
      { key: 'agi', label: 'Agilidad' },
      { key: 'vit', label: 'Vitalidad' },
      { key: 'wis', label: 'Sabiduría' },
      { key: 'lck', label: 'Fortuna' }
    ];

    const statsHtml = statLabels
      .map(
        (st) => `
        <div class="stat-row">
          <span class="stat-name">${st.label}</span>
          <div class="stat-val-group">
            <span class="stat-val">${totals[st.key]}</span>
            ${
              h.unspentPoints > 0
                ? `<button class="btn-stat-plus" data-alloc="${st.key}" title="Aumentar ${st.label}">+</button>`
                : ''
            }
          </div>
        </div>
      `
      )
      .join('');

    const derivedHtml = `
      <div class="stat-row">
        <span class="stat-name">Poder Ataque</span>
        <span class="stat-val" style="color:var(--gold-bright)">${totals.atk}</span>
      </div>
      <div class="stat-row">
        <span class="stat-name">Defensa Física</span>
        <span class="stat-val" style="color:var(--mana-bright)">${totals.def}</span>
      </div>
      <div class="stat-row">
        <span class="stat-name">Crítico Solar</span>
        <span class="stat-val" style="color:var(--xp-bright)">${totals.crit}%</span>
      </div>
    `;

    document.getElementById('hero-stats-grid').innerHTML = statsHtml + derivedHtml;

    // Bind stat allocation buttons
    document.querySelectorAll('[data-alloc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-alloc');
        if (state.hero.unspentPoints > 0 && state.hero.baseStats[key] !== undefined) {
          state.hero.baseStats[key] += 1;
          state.hero.unspentPoints -= 1;
          recalcDerivedVitals(false);
          SoundFX.heal();
          saveGame();
          renderAll();
        }
      });
    });

    // Bind clicking equipped item to inspect it
    document.querySelectorAll('.equip-slot[data-slot]').forEach((el) => {
      el.addEventListener('click', () => {
        const slot = el.getAttribute('data-slot');
        const eqId = state.equipment[slot];
        if (eqId) {
          state.ui.selectedBagItem = eqId;
          state.ui.rightTab = 'inventory';
          renderRightPanel();
        }
      });
    });
  }

  function renderCenterStage() {
    // Update active tab styling
    document.querySelectorAll('.stage-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-stage-tab') === state.ui.centerTab);
    });

    const viewport = document.getElementById('center-stage-viewport');
    if (state.ui.centerTab === 'combat' && activeCombat) {
      renderCombatArena(viewport);
    } else if (state.ui.centerTab === 'atlas') {
      renderWorldAtlas(viewport);
    } else {
      state.ui.centerTab = 'estancia';
      renderEstanciaView(viewport);
    }
  }

  function renderEstanciaView(container) {
    const estancia =
      DATA.ESTANCIAS.find((e) => e.id === state.world.currentEstancia) || DATA.ESTANCIAS[0];
    const svgBackdrop = DATA.ROOM_ART[estancia.artKey] || DATA.ROOM_ART.bastion_alba;

    const npcsHtml = (estancia.npcs || [])
      .map(
        (npc) => `
        <div class="entity-row">
          <div class="entity-info">
            <div class="entity-avatar">${npc.icon}</div>
            <div class="entity-meta">
              <span class="entity-title">${npc.name}</span>
              <span class="entity-sub">${npc.role}</span>
            </div>
          </div>
          <button class="btn-ornate" data-talk-npc="${npc.id}">Dialogar</button>
        </div>
      `
      )
      .join('');

    const harvestHtml = estancia.harvestNode
      ? `
        <div class="entity-row">
          <div class="entity-info">
            <div class="entity-avatar">💎</div>
            <div class="entity-meta">
              <span class="entity-title">${estancia.harvestNode.name}</span>
              <span class="entity-sub">Nodo de Extracción Arcana</span>
            </div>
          </div>
          <button class="btn-ornate gold-cta" id="btn-harvest-node">Extraer</button>
        </div>
      `
      : '';

    const enemiesHtml = (estancia.enemies || [])
      .map((en) => {
        const defeated = state.world.bossesDefeated[en.id];
        const badge = en.isFinalBoss
          ? '👑 JEFE SUPREMO'
          : en.isBoss
          ? '💀 JEFE DE ESTANCIA'
          : en.isElite
          ? '⚜️ ÉLITE'
          : `Nivel ${en.level}`;
        return `
          <div class="entity-row">
            <div class="entity-info">
              <div class="entity-avatar hostile ${en.isBoss ? 'boss' : ''}">${en.icon}</div>
              <div class="entity-meta">
                <span class="entity-title">${en.name} ${defeated ? '✓' : ''}</span>
                <span class="entity-sub">${badge} • ${en.hp} HP • Ataque ${en.atk}</span>
              </div>
            </div>
            <button class="btn-ornate crimson" data-fight-enemy="${en.id}">Combatir</button>
          </div>
        `;
      })
      .join('');

    const gatesHtml = (estancia.connections || [])
      .map((connId) => {
        const dest = DATA.ESTANCIAS.find((e) => e.id === connId);
        if (!dest) return '';
        const locked = state.hero.level < dest.minLevel;
        return `
          <button class="gate-pill ${locked ? 'locked' : ''}" data-travel-to="${dest.id}">
            <span>🧭 ${dest.name}</span>
            <span style="font-size:10px;color:var(--text-Secondary)">(Nv.${dest.minLevel}+)</span>
          </button>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="room-panorama">
        <div class="room-backdrop-svg">${svgBackdrop}</div>
        <div class="room-overlay-vignette"></div>
        <div class="room-top-bar">
          <div class="room-title-block">
            <span class="room-region-tag">${estancia.region}</span>
            <h1>${estancia.name}</h1>
          </div>
          <div class="room-danger-badge">${estancia.danger}</div>
        </div>
        <div class="room-lore-box">
          ${estancia.lore}
        </div>
      </div>

      <div class="room-content-grid">
        <div class="room-card-section">
          <div class="section-heading">
            <span>Personajes y Santuarios</span>
            <span>${(estancia.npcs || []).length} presentes</span>
          </div>
          <div class="entity-list">
            ${npcsHtml}
            ${harvestHtml}
          </div>
        </div>

        <div class="room-card-section">
          <div class="section-heading">
            <span>Amenazas y Guardianes</span>
            <span>Combate Táctico</span>
          </div>
          <div class="entity-list">
            ${enemiesHtml}
          </div>
        </div>

        <div class="travel-gates-bar">
          <div class="section-heading">
            <span>Portales y Rutas Conectadas</span>
            <span>Estancia ${estancia.order} de 8</span>
          </div>
          <div class="gates-flex">
            ${gatesHtml}
          </div>
        </div>
      </div>
    `;

    // Bind NPC dialogue buttons
    container.querySelectorAll('[data-talk-npc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const npcId = btn.getAttribute('data-talk-npc');
        openNpcModal(estancia, npcId);
      });
    });

    // Bind Harvest button
    const harvestBtn = container.querySelector('#btn-harvest-node');
    if (harvestBtn) {
      harvestBtn.addEventListener('click', harvestRoomNode);
    }

    // Bind Enemy fight buttons
    container.querySelectorAll('[data-fight-enemy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const enemyId = btn.getAttribute('data-fight-enemy');
        startCombat(enemyId);
      });
    });

    // Bind Travel gates
    container.querySelectorAll('[data-travel-to]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const destId = btn.getAttribute('data-travel-to');
        travelToEstancia(destId);
      });
    });
  }

  function renderCombatArena(container) {
    const c = activeCombat;
    const h = state.hero;
    const en = c.enemy;

    const heroHpPct = Math.round((h.hp / h.maxHp) * 100);
    const enemyHpPct = Math.round((en.currentHp / en.maxHp) * 100);

    const attackZonesHtml = ZONES.map(
      (z) => `
      <button class="zone-btn ${state.ui.attackZone === z.id ? 'selected-attack' : ''}" data-set-atk-zone="${z.id}">
        <span>⚔️ ${z.label}</span>
        <span>${state.ui.attackZone === z.id ? '●' : '○'}</span>
      </button>
    `
    ).join('');

    const defendZonesHtml = ZONES.map(
      (z) => `
      <button class="zone-btn ${state.ui.defendZone === z.id ? 'selected-defend' : ''}" data-set-def-zone="${z.id}">
        <span>🛡️ ${z.label}</span>
        <span>${state.ui.defendZone === z.id ? '●' : '○'}</span>
      </button>
    `
    ).join('');

    const skillsHtml = DATA.SKILLS.map((sk) => {
      const canAfford = h.mp >= sk.mpCost;
      return `
        <button class="skill-slot-btn" data-exec-skill="${sk.id}" ${
        canAfford ? '' : 'disabled'
      } title="${sk.desc}">
          <span class="skill-icon-box">${sk.icon}</span>
          <div class="skill-meta">
            <span class="skill-name">${sk.name}</span>
            <span class="skill-cost">${sk.mpCost > 0 ? sk.mpCost + ' MP' : '+8 MP'}</span>
          </div>
        </button>
      `;
    }).join('');

    const feedHtml = c.log
      .map((line) => `<div class="log-entry">${line}</div>`)
      .join('');

    container.innerHTML = `
      <div class="combat-arena-wrap">
        <div class="combat-versus-stage">
          <!-- Hero Combatant Card -->
          <div class="combatant-card">
            <div>
              <div class="combatant-header">
                <span class="combatant-name">${h.name} (Nv. ${h.level})</span>
                <span style="font-family:var(--font-mono);font-size:12px">${h.hp} / ${h.maxHp} HP</span>
              </div>
              <div class="vital-track">
                <div class="vital-fill hp" style="width:${heroHpPct}%"></div>
              </div>
            </div>

            <div class="combatant-art-box">
              <div style="font-size:58px;filter:drop-shadow(0 0 14px rgba(244,208,104,0.45))">⚜️</div>
            </div>

            <div class="buff-strip">
              <span class="buff-tag">Guardia: ${state.ui.defendZone.toUpperCase()}</span>
              ${
                c.shieldBuffRounds > 0
                  ? `<span class="buff-tag">Égida Solar (${c.shieldBuffRounds}r)</span>`
                  : ''
              }
            </div>
          </div>

          <!-- Center Tactical Zone Selector -->
          <div class="tactical-controls-center">
            <div class="zone-selector-group">
              <span class="zone-group-title">1. Apuntar Golpe</span>
              <div class="zone-options">
                ${attackZonesHtml}
              </div>
            </div>

            <div class="zone-selector-group">
              <span class="zone-group-title">2. Posición de Escudo</span>
              <div class="zone-options">
                ${defendZonesHtml}
              </div>
            </div>
          </div>

          <!-- Enemy Combatant Card -->
          <div class="combatant-card enemy">
            <div>
              <div class="combatant-header">
                <span class="combatant-name">${en.name} (Nv. ${en.level})</span>
                <span style="font-family:var(--font-mono);font-size:12px">${en.currentHp} / ${en.maxHp} HP</span>
              </div>
              <div class="vital-track">
                <div class="vital-fill hp" style="width:${enemyHpPct}%"></div>
              </div>
            </div>

            <div class="combatant-art-box">
              <div style="font-size:62px;filter:drop-shadow(0 0 16px rgba(224,68,56,0.55))">${en.icon}</div>
            </div>

            <div class="buff-strip">
              <span class="buff-tag debuff">Ataque: ${en.atk} • Def: ${en.def}</span>
              ${
                c.enemyBurnRounds > 0
                  ? `<span class="buff-tag debuff">Quemadura Solar (${c.enemyBurnRounds}r)</span>`
                  : ''
              }
            </div>
          </div>
        </div>

        <!-- Active Skills Execution Bar -->
        <div class="combat-skills-bar">
          <div class="skill-buttons-cluster">
            ${skillsHtml}
          </div>
          <button class="btn-ornate" id="btn-flee-combat">Retirarse al Santuario</button>
        </div>

        <!-- Round Exchange Log -->
        <div class="combat-round-feed">
          ${feedHtml}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-set-atk-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.attackZone = btn.getAttribute('data-set-atk-zone');
        renderCombatArena(container);
      });
    });

    container.querySelectorAll('[data-set-def-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.defendZone = btn.getAttribute('data-set-def-zone');
        renderCombatArena(container);
      });
    });

    container.querySelectorAll('[data-exec-skill]').forEach((btn) => {
      btn.addEventListener('click', () => {
        executeCombatRound(btn.getAttribute('data-exec-skill'));
      });
    });

    const fleeBtn = container.querySelector('#btn-flee-combat');
    if (fleeBtn) {
      fleeBtn.addEventListener('click', () => {
        addLog(`Te retiraste estratégicamente del duelo contra ${en.name}.`, 'lore');
        activeCombat = null;
        state.ui.centerTab = 'estancia';
        renderAll();
      });
    }
  }

  function renderWorldAtlas(container) {
    const cardsHtml = DATA.ESTANCIAS.map((est) => {
      const isCurrent = state.world.currentEstancia === est.id;
      const isCleared = state.world.clearedEstancias.includes(est.id);
      const locked = state.hero.level < est.minLevel;

      return `
        <div class="atlas-node-card ${isCurrent ? 'current' : ''} ${isCleared ? 'completed' : ''}">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--gold-bright)">
                ${est.name}
              </span>
              ${
                isCleared
                  ? '<span style="color:var(--xp-bright);font-size:11px">★ Purgada</span>'
                  : ''
              }
            </div>
            <div style="font-size:11px;color:var(--text-Secondary);margin-bottom:6px">${est.region}</div>
            <div style="font-size:11px;color:var(--amber-ember)">${est.danger}</div>
          </div>
          <button class="btn-ornate ${isCurrent ? 'gold-cta' : ''}" data-atlas-travel="${est.id}" ${
        locked ? 'disabled' : ''
      }>
            ${isCurrent ? 'Ubicación Actual' : locked ? `Requiere Nv. ${est.minLevel}` : 'Viajar a Estancia'}
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="atlas-container">
        <div class="section-heading">
          <span>Atlas Cartográfico de Asteria — Las Ocho Estancias</span>
          <span>Estancias Purgadas: ${state.world.clearedEstancias.length} / 8</span>
        </div>

        <div class="atlas-svg-wrapper">
          <svg viewBox="0 0 900 260" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Constellation Paths connecting the 8 Estancias -->
            <g stroke="#6e5223" stroke-width="2.5" stroke-dasharray="6 4" fill="none">
              <line x1="85" y1="140" x2="205" y2="95"/>
              <line x1="85" y1="140" x2="330" y2="185"/>
              <line x1="205" y1="95" x2="330" y2="85"/>
              <line x1="330" y1="85" x2="330" y2="185"/>
              <line x1="330" y1="85" x2="465" y2="135"/>
              <line x1="330" y1="185" x2="465" y2="135"/>
              <line x1="465" y1="135" x2="595" y2="90"/>
              <line x1="595" y1="90" x2="715" y2="145"/>
              <line x1="715" y1="145" x2="825" y2="115"/>
            </g>
            ${[
              { id: 'bastion_alba', x: 85, y: 140, label: 'I. Bastión' },
              { id: 'campamento_ceniza', x: 205, y: 95, label: 'II. Ceniza' },
              { id: 'bosque_espectral', x: 330, y: 85, label: 'III. Bosque' },
              { id: 'catacumbas_cristal', x: 330, y: 185, label: 'IV. Catacumbas' },
              { id: 'forja_titanes', x: 465, y: 135, label: 'V. Forja' },
              { id: 'claustro_sol_quebrado', x: 595, y: 90, label: 'VI. Claustro' },
              { id: 'muralla_eclipse', x: 715, y: 145, label: 'VII. Muralla' },
              { id: 'trono_abismo_solar', x: 825, y: 115, label: 'VIII. Trono Solar' }
            ]
              .map((node) => {
                const isCur = state.world.currentEstancia === node.id;
                const isClr = state.world.clearedEstancias.includes(node.id);
                const fill = isCur ? '#f4d068' : isClr ? '#52d17c' : '#261e14';
                const stroke = isCur ? '#ffffff' : '#d4a843';
                return `
                  <g style="cursor:pointer" data-svg-node="${node.id}">
                    <circle cx="${node.x}" cy="${node.y}" r="${isCur ? 18 : 14}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
                    <text x="${node.x}" y="${node.y + 32}" text-anchor="middle" fill="#ede3d2" font-family="Cinzel, serif" font-size="11">${node.label}</text>
                  </g>
                `;
              })
              .join('')}
          </svg>
        </div>

        <div class="atlas-grid-cards">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-atlas-travel], [data-svg-node]').forEach((el) => {
      el.addEventListener('click', () => {
        const targetId = el.getAttribute('data-atlas-travel') || el.getAttribute('data-svg-node');
        travelToEstancia(targetId);
      });
    });
  }

  /* ------------------------------------------------------------------------
     RIGHT PANEL: INVENTORY, QUESTS, FORGE, CODEX
     ------------------------------------------------------------------------ */
  function renderRightPanel() {
    document.querySelectorAll('.sub-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-right-tab') === state.ui.rightTab);
    });

    const body = document.getElementById('right-panel-body');
    if (state.ui.rightTab === 'quests') {
      renderQuestsTab(body);
    } else if (state.ui.rightTab === 'forge') {
      renderForgeTab(body);
    } else if (state.ui.rightTab === 'codex') {
      renderCodexTab(body);
    } else {
      renderInventoryTab(body);
    }
  }

  function renderInventoryTab(container) {
    const cells = [];
    const totalSlots = 16;

    for (let i = 0; i < totalSlots; i++) {
      const entry = state.inventory[i];
      if (entry && DATA.ITEMS[entry.itemId]) {
        const it = DATA.ITEMS[entry.itemId];
        const upg = state.upgrades[it.id] ? `+${state.upgrades[it.id]}` : '';
        const isSel = state.ui.selectedBagItem === it.id;
        cells.push(`
          <div class="bag-cell rarity-${it.rarity} ${isSel ? 'selected' : ''}" data-bag-item="${it.id}" title="${it.name}">
            ${upg ? `<span class="bag-upgrade-tag">${upg}</span>` : ''}
            <span style="font-size:24px">${it.icon}</span>
            <span class="bag-qty">x${entry.qty}</span>
          </div>
        `);
      } else {
        cells.push(`<div class="bag-cell" style="opacity:0.35"></div>`);
      }
    }

    const selId = state.ui.selectedBagItem || (state.inventory[0] && state.inventory[0].itemId);
    const selItem = selId ? DATA.ITEMS[selId] : null;
    let inspectorHtml = `<div class="item-inspector"><span style="color:var(--text-muted)">Selecciona un objeto de tu alforja o equipo para inspeccionarlo.</span></div>`;

    if (selItem) {
      const upgLvl = state.upgrades[selItem.id] || 0;
      const isEquipped = Object.values(state.equipment).includes(selItem.id);
      const inBagQty = getItemCount(selItem.id);
      const statPills = selItem.stats
        ? Object.entries(selItem.stats)
            .map(([k, v]) => `<span>+${Math.round(v * (1 + upgLvl * 0.16))} ${k.toUpperCase()}</span>`)
            .join(' • ')
        : selItem.healHp || selItem.healMp
        ? `<span>Restaura ${selItem.healHp ? selItem.healHp + ' HP ' : ''}${
            selItem.healMp ? selItem.healMp + ' MP' : ''
          }</span>`
        : '<span>Catalizador de Forja</span>';

      inspectorHtml = `
        <div class="item-inspector">
          <div class="inspector-header">
            <div>
              <div class="inspector-title" style="color:var(--gold-bright)">
                ${selItem.icon} ${selItem.name} ${upgLvl > 0 ? `+${upgLvl}` : ''}
              </div>
              <div style="font-size:11px;color:var(--text-Secondary);text-transform:uppercase">
                Rareza: ${selItem.rarity} • Ranura: ${selItem.slot}
              </div>
            </div>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--gold-bright)">${selItem.value} Oro</span>
          </div>
          <div class="inspector-stats">${statPills}</div>
          <div style="font-family:var(--font-body);font-size:13px;color:var(--text-Secondary)">${selItem.desc}</div>
          <div class="inspector-actions">
            ${
              inBagQty > 0 && selItem.slot !== 'material'
                ? `<button class="btn-ornate gold-cta" id="btn-use-selected">
                    ${selItem.slot === 'consumable' ? 'Consumir Ahora' : 'Equipar Objeto'}
                  </button>`
                : ''
            }
            ${
              selItem.slot !== 'consumable' && selItem.slot !== 'material'
                ? `<button class="btn-ornate" id="btn-upgrade-selected">
                    Templar +${upgLvl + 1} (${(upgLvl + 1) * 90} Oro, ${upgLvl + 1}💎)
                  </button>`
                : ''
            }
            ${
              isEquipped
                ? `<span style="font-size:11px;color:var(--xp-bright);align-self:center">✓ Equipado actualmente</span>`
                : ''
            }
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="stats-section-title">
        <span>Alforja de Campaña (${state.inventory.length}/${totalSlots})</span>
        <span>Luminita: ${getItemCount('mineral_luminita')} 💎</span>
      </div>
      <div class="inventory-bag-grid">
        ${cells.join('')}
      </div>
      ${inspectorHtml}
    `;

    container.querySelectorAll('[data-bag-item]').forEach((cell) => {
      cell.addEventListener('click', () => {
        state.ui.selectedBagItem = cell.getAttribute('data-bag-item');
        renderInventoryTab(container);
      });
      cell.addEventListener('dblclick', () => {
        equipOrUseItem(cell.getAttribute('data-bag-item'));
      });
    });

    const useBtn = container.querySelector('#btn-use-selected');
    if (useBtn && selItem) {
      useBtn.addEventListener('click', () => equipOrUseItem(selItem.id));
    }

    const upgBtn = container.querySelector('#btn-upgrade-selected');
    if (upgBtn && selItem) {
      upgBtn.addEventListener('click', () => upgradeItem(selItem.id));
    }
  }

  function renderQuestsTab(container) {
    const html = DATA.QUESTS.map((q) => {
      const prog = getQuestProgress(q);
      const claimed = Boolean(state.quests.claimed[q.id]);
      const ready = prog >= q.targetCount && !claimed;
      const pct = Math.round((prog / q.targetCount) * 100);
      const rewardItemName = q.rewardItem ? DATA.ITEMS[q.rewardItem].name : '';

      return `
        <div class="quest-card ${claimed ? 'completed' : ''} ${ready ? 'ready' : ''}">
          <div class="quest-title">
            <span>${q.title}</span>
            <span style="font-size:10px;color:var(--text-Secondary)">${q.estancia}</span>
          </div>
          <div class="quest-desc">${q.desc}</div>
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width:${pct}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px">
            <span style="font-family:var(--font-mono)">Progreso: ${prog} / ${q.targetCount}</span>
            <span style="color:var(--gold-bright)">+${q.rewardGold} Oro • +${q.rewardXp} XP</span>
          </div>
          ${
            rewardItemName
              ? `<div style="font-size:11px;color:var(--xp-bright)">Reliquia: ${rewardItemName}</div>`
              : ''
          }
          ${
            ready
              ? `<button class="btn-ornate gold-cta" data-claim-quest="${q.id}">Reclamar Recompensa Real</button>`
              : claimed
              ? `<span style="font-size:11px;color:var(--xp-bright)">✓ Juramento Cumplido</span>`
              : ''
          }
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="quest-list">${html}</div>`;

    container.querySelectorAll('[data-claim-quest]').forEach((btn) => {
      btn.addEventListener('click', () => claimQuest(btn.getAttribute('data-claim-quest')));
    });
  }

  function renderForgeTab(container) {
    const recipesHtml = DATA.FORGE_RECIPES.map((rec) => {
      const item = DATA.ITEMS[rec.resultItem];
      const matsText = rec.materials
        .map((m) => {
          const have = getItemCount(m.itemId);
          const it = DATA.ITEMS[m.itemId];
          return `${it.icon} ${it.name}: ${have}/${m.count}`;
        })
        .join(' • ');

      return `
        <div class="quest-card">
          <div class="quest-title">
            <span>${item.icon} ${item.name}</span>
            <span style="color:var(--gold-bright)">${rec.goldCost} Oro</span>
          </div>
          <div class="quest-desc">${item.desc}</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--mana-bright)">
            Requisitos: ${matsText}
          </div>
          <button class="btn-ornate gold-cta" data-craft-recipe="${rec.id}">Forjar Reliquia Solar</button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="stats-section-title">
        <span>Yunque de los Titanes Solares</span>
        <span>💎 ${getItemCount('mineral_luminita')} | 🌑 ${getItemCount('nucleo_eclipse')}</span>
      </div>
      <div class="quest-list">
        ${recipesHtml}
      </div>
    `;

    container.querySelectorAll('[data-craft-recipe]').forEach((btn) => {
      btn.addEventListener('click', () => craftRecipe(btn.getAttribute('data-craft-recipe')));
    });
  }

  function renderCodexTab(container) {
    const rep = state.hero.reputation;
    container.innerHTML = `
      <div class="stats-section-title">
        <span>Facciones de Asteria</span>
      </div>
      <div class="rep-list">
        <div class="rep-item">
          <div class="rep-item-head">
            <span>Orden Solar de Helion</span>
            <span style="font-family:var(--font-mono);color:var(--gold-bright)">${rep.orden_helion} pts</span>
          </div>
          <div class="rep-track"><div class="rep-fill" style="width:${Math.min(100, rep.orden_helion / 4)}%"></div></div>
        </div>
        <div class="rep-item">
          <div class="rep-item-head">
            <span>Custodios del Alba</span>
            <span style="font-family:var(--font-mono);color:var(--gold-bright)">${rep.custodios_alba} pts</span>
          </div>
          <div class="rep-track"><div class="rep-fill" style="width:${Math.min(100, rep.custodios_alba / 3)}%"></div></div>
        </div>
        <div class="rep-item">
          <div class="rep-item-head">
            <span>Cazadores del Eclipse</span>
            <span style="font-family:var(--font-mono);color:var(--gold-bright)">${rep.cazadores_eclipse} pts</span>
          </div>
          <div class="rep-track"><div class="rep-fill" style="width:${Math.min(100, rep.cazadores_eclipse / 4)}%"></div></div>
        </div>
      </div>

      <div class="stats-section-title" style="margin-top:14px">
        <span>Cambiar Orden de Combate</span>
      </div>
      <div class="quest-list">
        ${Object.values(DATA.CLASSES)
          .map(
            (c) => `
          <div class="quest-card ${state.hero.classId === c.id ? 'ready' : ''}">
            <div class="quest-title">
              <span>${c.name}</span>
              <span style="font-size:10px">${c.faction}</span>
            </div>
            <div class="quest-desc">${c.desc}</div>
            ${
              state.hero.classId === c.id
                ? `<span style="font-size:11px;color:var(--xp-bright)">✓ Orden Activa</span>`
                : `<button class="btn-ornate" data-switch-class="${c.id}">Jurar Lealtad</button>`
            }
          </div>
        `
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('[data-switch-class]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const newCls = btn.getAttribute('data-switch-class');
        state.hero.classId = newCls;
        recalcDerivedVitals(false);
        addLog(`Has adoptado la doctrina de ${DATA.CLASSES[newCls].name}.`, 'quest');
        saveGame();
        renderAll();
      });
    });
  }

  function renderChronicle() {
    const feed = document.getElementById('chronicle-feed');
    if (!feed) return;
    feed.innerHTML = logs
      .map(
        (l) => `
        <div class="log-entry ${l.type}">
          <span class="log-time">[${l.time}]</span>
          <span>${l.text}</span>
        </div>
      `
      )
      .join('');
  }

  function renderQuickBelt() {
    const beltItems = ['elixir_alba', 'nectar_astral', 'panacea_helion'];
    const html = beltItems
      .map((id, idx) => {
        const it = DATA.ITEMS[id];
        const qty = getItemCount(id);
        return `
          <div class="belt-slot" data-belt-use="${id}" title="Usar ${it.name} (Tecla ${idx + 1})">
            <span class="belt-hotkey">[${idx + 1}]</span>
            <span style="font-size:20px">${it.icon}</span>
            <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-Secondary)">x${qty}</span>
          </div>
        `;
      })
      .join('');

    const restSlot = `
      <div class="belt-slot" id="btn-quick-meditate" title="Meditación Solar: Restaura Salud y Maná fuera de combate">
        <span class="belt-hotkey">[4]</span>
        <span style="font-size:20px">☀️</span>
        <span style="font-family:var(--font-display);font-size:9px;color:var(--gold-bright)">Meditar</span>
      </div>
    `;

    const container = document.getElementById('belt-slots-row');
    if (container) {
      container.innerHTML = html + restSlot;
      container.querySelectorAll('[data-belt-use]').forEach((el) => {
        el.addEventListener('click', () => equipOrUseItem(el.getAttribute('data-belt-use')));
      });
      const medBtn = container.querySelector('#btn-quick-meditate');
      if (medBtn) {
        medBtn.addEventListener('click', () => {
          if (activeCombat) {
            addLog('No puedes meditar en medio de un duelo táctico.', 'combat-hit');
            return;
          }
          recalcDerivedVitals(true);
          SoundFX.heal();
          addLog('Meditas bajo el fulgor solar y restauras el 100% de tu Salud y Maná.', 'combat-win');
          saveGame();
          renderAll();
        });
      }
    }
  }

  /* ------------------------------------------------------------------------
     MODALS: NPC DIALOGUE & SHOP, VICTORY CINEMATIC, SAVE/EXPORT
     ------------------------------------------------------------------------ */
  function openNpcModal(estancia, npcId) {
    const npc = (estancia.npcs || []).find((n) => n.id === npcId);
    if (!npc) return;

    const modal = document.getElementById('modal-backdrop');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.textContent = `${npc.icon} ${npc.name} — ${npc.role}`;

    const shopHtml = (npc.shop || [])
      .map((itemId) => {
        const it = DATA.ITEMS[itemId];
        if (!it) return '';
        return `
          <div class="entity-row">
            <div class="entity-info">
              <div class="entity-avatar">${it.icon}</div>
              <div class="entity-meta">
                <span class="entity-title">${it.name}</span>
                <span class="entity-sub">${it.desc}</span>
              </div>
            </div>
            <button class="btn-ornate gold-cta" data-buy-item="${it.id}">
              Comprar (${it.value} Oro)
            </button>
          </div>
        `;
      })
      .join('');

    body.innerHTML = `
      <div class="npc-speech-box">${npc.greeting}</div>
      ${
        npc.opensForge
          ? `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-input);padding:10px;border:1px solid var(--gold-aged)">
              <span>⚒️ El Yunque de Forja Solar está listo para templar tus reliquias.</span>
              <button class="btn-ornate gold-cta" id="btn-modal-open-forge">Abrir Forja</button>
            </div>`
          : ''
      }
      ${
        shopHtml
          ? `<div class="section-heading"><span>Arsenal y Provisiones de la Orden</span><span>Tu Oro: ${state.hero.gold}</span></div>
             <div class="entity-list">${shopHtml}</div>`
          : ''
      }
    `;

    modal.classList.remove('hidden');

    body.querySelectorAll('[data-buy-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-buy-item');
        const it = DATA.ITEMS[itemId];
        if (!it) return;
        if (state.hero.gold < it.value) {
          addLog(`No tienes suficiente Oro Solar para adquirir ${it.name}.`, 'combat-hit');
          return;
        }
        state.hero.gold -= it.value;
        addItem(it.id, 1);
        SoundFX.heal();
        addLog(`Adquiriste ${it.name} de ${npc.name}.`, 'loot');
        saveGame();
        renderAll();
        openNpcModal(estancia, npcId);
      });
    });

    const forgeBtn = body.querySelector('#btn-modal-open-forge');
    if (forgeBtn) {
      forgeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        state.ui.rightTab = 'forge';
        renderRightPanel();
      });
    }
  }

  function openVictoryModal() {
    const modal = document.getElementById('modal-backdrop');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.textContent = '☀️ CRÓNICA SUPREMA: EL AMANECER ETERNO DE ASTERIA';
    body.innerHTML = `
      <div class="npc-speech-box" style="border-left-color:var(--gold-bright);font-size:17px">
        «Con un último tajo de Luz Primordial, la corona de obsidiana de Malakor se quiebra sobre el Trono del Abismo Solar. El anillo del eclipse se disipa y, por primera vez en tres siglos, los rayos dorados de Helion bañan las ocho estancias de Asteria.»
      </div>
      <div style="background:var(--bg-input);border:1px solid var(--gold-bright);padding:12px;display:flex;flex-direction:column;gap:6px">
        <div style="font-family:var(--font-display);color:var(--gold-bright);font-size:14px">
          Héroe Consagrado: ${state.hero.name} (${DATA.CLASSES[state.hero.classId].name} • Nivel ${state.hero.level})
        </div>
        <div style="font-size:13px;color:var(--text-Secondary)">
          Has conquistado las 8 Estancias, derrotado al Soberano del Eclipse Eterno y obtenido las reliquias míticas <strong>Aethel-Valkyr, Mandoble de la Luz Eterna</strong> y el <strong>Sello Soberano de Malakor</strong>. Tu partida sigue activa y persistente en el navegador para seguir perfeccionando tu leyenda.
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  }

  function openPersistenceModal() {
    const modal = document.getElementById('modal-backdrop');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    const encodedSave = btoa(unescape(encodeURIComponent(JSON.stringify(state))));

    title.textContent = '💾 MOTOR PERSISTENTE — GESTIÓN DE CRÓNICA';
    body.innerHTML = `
      <div style="font-size:13px;color:var(--text-Secondary)">
        El motor guarda automáticamente tu estado en <code>localStorage</code> e <code>IndexedDB</code> tras cada combate, viaje o forja. También puedes exportar o importar tu código de partida o descargar un archivo JSON.
      </div>
      <textarea id="save-export-box" rows="4" style="width:100%;background:#080706;border:1px solid var(--gold-aged);color:var(--gold-bright);font-family:var(--font-mono);font-size:11px;padding:8px">${encodedSave}</textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-ornate gold-cta" id="btn-download-save">Descargar Archivo .JSON</button>
        <button class="btn-ornate" id="btn-import-save">Importar Código Pegado</button>
        <button class="btn-ornate crimson" id="btn-reset-save">Reiniciar Crónica desde Cero</button>
      </div>
    `;
    modal.classList.remove('hidden');

    body.querySelector('#btn-download-save').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guerreros-de-la-luz-${state.hero.name.toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    body.querySelector('#btn-import-save').addEventListener('click', () => {
      const rawInput = body.querySelector('#save-export-box').value.trim();
      if (!rawInput) return;
      try {
        const decoded = rawInput.startsWith('{')
          ? rawInput
          : decodeURIComponent(escape(atob(rawInput)));
        const parsed = JSON.parse(decoded);
        if (parsed && parsed.hero && parsed.world) {
          state = Object.assign(createDefaultState(), parsed);
          saveGame(true);
          renderAll();
          modal.classList.add('hidden');
        }
      } catch (e) {
        addLog('El código de partida introducido no es válido.', 'combat-hit');
      }
    });

    body.querySelector('#btn-reset-save').addEventListener('click', () => {
      state = createDefaultState();
      activeCombat = null;
      recalcDerivedVitals(true);
      saveGame(true);
      renderAll();
      modal.classList.add('hidden');
      addLog('Se ha iniciado una nueva crónica en el Bastión del Alba.', 'lore');
    });
  }

  function renderAll() {
    renderTopBar();
    renderLeftHeroPanel();
    renderCenterStage();
    renderRightPanel();
    renderChronicle();
    renderQuickBelt();
  }

  /* ------------------------------------------------------------------------
     INITIALIZATION & EVENT LISTENERS
     ------------------------------------------------------------------------ */
  function initApp() {
    loadGame();

    // Center stage tabs
    document.querySelectorAll('.stage-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-stage-tab');
        if (tab === 'combat' && !activeCombat) {
          // Automatically challenge the first enemy in current room if user clicks Combat tab
          const est = DATA.ESTANCIAS.find((e) => e.id === state.world.currentEstancia);
          if (est && est.enemies && est.enemies.length > 0) {
            startCombat(est.enemies[0].id);
            return;
          }
        }
        state.ui.centerTab = tab;
        renderCenterStage();
      });
    });

    // Right column tabs
    document.querySelectorAll('.sub-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.rightTab = btn.getAttribute('data-right-tab');
        renderRightPanel();
      });
    });

    // Top bar buttons
    document.getElementById('btn-top-atlas').addEventListener('click', () => {
      state.ui.centerTab = 'atlas';
      renderCenterStage();
    });

    document.getElementById('btn-top-save').addEventListener('click', () => {
      saveGame(true);
      openPersistenceModal();
    });

    document.getElementById('btn-top-audio').addEventListener('click', (e) => {
      SoundFX.muted = !SoundFX.muted;
      e.currentTarget.textContent = SoundFX.muted ? '🔇 Audio' : '🔊 Audio';
    });

    // Rename Hero on clicking name
    document.getElementById('hero-display-name').addEventListener('click', () => {
      const newName = prompt('Introduce el nombre de tu Guerrero de la Luz:', state.hero.name);
      if (newName && newName.trim().length > 1) {
        state.hero.name = newName.trim().slice(0, 22);
        saveGame(true);
        renderAll();
      }
    });

    // Close Modal
    document.getElementById('btn-modal-close').addEventListener('click', () => {
      document.getElementById('modal-backdrop').classList.add('hidden');
    });
    document.getElementById('modal-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') {
        e.currentTarget.classList.add('hidden');
      }
    });

    // Keyboard Hotkeys 1-4 for Quick Belt
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') equipOrUseItem('elixir_alba');
      if (e.key === '2') equipOrUseItem('nectar_astral');
      if (e.key === '3') equipOrUseItem('panacea_helion');
      if (e.key === '4') {
        const med = document.getElementById('btn-quick-meditate');
        if (med) med.click();
      }
    });

    // Auto-save interval every 20 seconds
    setInterval(() => saveGame(false), 20000);

    saveGame(false);
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
