/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/app.js
   Autonomous Persistent Browser MMORPG Engine (100% Standalone for GitHub Pages
   via localStorage + Hybrid Sync with Node Backend if available)
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'guerreros_de_la_luz_asteria_v3';
  const ART = window.GDL_ART;
  const UI = window.GDL_UI;
  const VIEWS = window.GDL_MAIN_VIEWS;
  const MODALS = window.GDL_SPECIAL_MODALS;
  const CHAT = window.GDL_CHAT;

  function createDefaultState() {
    return {
      version: 3,
      savedAt: Date.now(),
      hero: {
        name: 'Aethelgard',
        level: 1,
        xp: 0,
        xpNext: 100,
        hp: 210,
        maxHp: 210,
        mp: 100,
        maxMp: 100,
        copper: 650, // 6p 50c
        clan: 'Hijos del Alba',
        unspentPoints: 3,
        baseStats: {
          str: 11,
          agi: 9,
          vit: 12,
          wis: 9
        }
      },
      equipment: {
        helm: 'capucha_iniciado',
        amulet: 'amuleto_selene',
        weapon: 'espada_iniciado',
        armor: 'jubon_milicia',
        shield: 'rodela_madera',
        cloak: 'capa_explorador',
        ring: 'anillo_alquimico',
        boots: 'botas_viento_alba'
      },
      inventory: [
        { itemId: 'elixir_vida_menor', qty: 5 },
        { itemId: 'nectar_mana_astral', qty: 3 },
        { itemId: 'panacea_solar', qty: 1 },
        { itemId: 'lingote_bronce', qty: 2 },
        { itemId: 'hoja_solar', qty: 2 }
      ],
      professions: {
        mineria: { level: 1, xp: 10 },
        herbolaria: { level: 1, xp: 10 },
        pesca: { level: 1, xp: 5 },
        herreria: { level: 1, xp: 15 },
        alquimia: { level: 1, xp: 15 },
        joyeria: { level: 1, xp: 5 }
      },
      mounts: {
        owned: ['corcel_alba'],
        active: 'corcel_alba'
      },
      pets: {
        owned: ['halcon_alba'],
        active: 'halcon_alba'
      },
      quests: {
        claimed: {}
      },
      world: {
        currentLocation: 'ciudadela_luz',
        visitedLocations: ['ciudadela_luz'],
        totalKills: 0,
        harvestCount: 0,
        killsByLoc: {},
        killsByCreature: {},
        bossesDefeated: {},
        pvpWins: 0,
        pvpDefeated: {},
        mirrorUses: 0
      },
      ui: {
        centerView: 'location', // 'location' | 'hunting' | 'combat' | 'atlas'
        rightTab: 'bag',        // 'bag' | 'quests' | 'specials'
        selectedItem: 'elixir_vida_menor'
      }
    };
  }

  let state = createDefaultState();
  let combatState = null;

  /* ------------------------------------------------------------------------
     PERSISTENCE (LOCALSTORAGE + OPTIONAL BACKEND SYNC)
     ------------------------------------------------------------------------ */
  function saveState() {
    state.savedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
    const statusEl = document.getElementById('persist-status-indicator');
    if (statusEl) {
      const t = new Date(state.savedAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      statusEl.textContent = `Persistente (${t})`;
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.hero && parsed.world) {
          state = Object.assign(createDefaultState(), parsed);
          recalcVitals(false);
          return;
        }
      }
    } catch (e) {}
    state = createDefaultState();
    recalcVitals(true);
  }

  /* ------------------------------------------------------------------------
     DERIVED STATS ENGINE (GEAR + MOUNT + PET + MEDALS + PROFESSIONS)
     ------------------------------------------------------------------------ */
  function checkMedalUnlocked(medalId) {
    const w = state.world;
    const claimedCount = Object.keys(state.quests.claimed || {}).length;
    if (medalId === 'med_custodio_luz') return state.hero.level >= 3 || claimedCount >= 2;
    if (medalId === 'med_cazador_bestias') return (w.totalKills || 0) >= 6 || (w.harvestCount || 0) >= 5;
    if (medalId === 'med_domador_ignifer') return state.mounts.owned.includes('ignifer');
    if (medalId === 'med_campeon_arena') return (w.pvpWins || 0) >= 3;
    if (medalId === 'med_purgador_cristal') return Boolean(w.bossesDefeated && w.bossesDefeated.krystallos_soberano);
    if (medalId === 'med_soberano_alba') return Boolean(w.bossesDefeated && w.bossesDefeated.malakor_emperador_eclipse);
    return false;
  }

  function computeDerivedStats() {
    const h = state.hero;
    const s = {
      str: h.baseStats.str,
      agi: h.baseStats.agi,
      vit: h.baseStats.vit,
      wis: h.baseStats.wis,
      atk: 10 + h.level * 4,
      def: 6 + h.level * 2,
      crit: 6
    };

    // 1. Equipped Artifacts
    Object.values(state.equipment).forEach((itemId) => {
      if (!itemId) return;
      const it = ART.ARTIFACTS[itemId];
      if (!it || !it.stats) return;
      Object.entries(it.stats).forEach(([k, val]) => {
        if (s[k] !== undefined) s[k] += val;
      });
    });

    // 2. Active Mount
    if (state.mounts.active) {
      const m = ART.MOUNTS.find((x) => x.id === state.mounts.active);
      if (m && m.stats) {
        Object.entries(m.stats).forEach(([k, val]) => {
          if (s[k] !== undefined) s[k] += val;
        });
      }
    }

    // 3. Active Pet
    if (state.pets.active) {
      const p = ART.PETS.find((x) => x.id === state.pets.active);
      if (p) {
        s.atk += p.bonusAtk || 0;
        s.crit += p.bonusCrit || 0;
      }
    }

    // 4. Unlocked Medals
    ART.MEDALS.forEach((med) => {
      if (checkMedalUnlocked(med.id) && med.stats) {
        Object.entries(med.stats).forEach(([k, val]) => {
          if (s[k] !== undefined) s[k] += val;
        });
      }
    });

    s.atk += Math.round(s.str * 1.85);
    s.def += Math.round(s.vit * 1.35 + s.agi * 0.4);
    s.crit = Math.min(72, s.crit + Math.round(s.agi * 0.65));
    s.maxHp = 120 + h.level * 28 + s.vit * 11;
    s.maxMp = 60 + h.level * 14 + s.wis * 9;

    return s;
  }

  function recalcVitals(fullHeal = false) {
    const d = computeDerivedStats();
    state.hero.maxHp = d.maxHp;
    state.hero.maxMp = d.maxMp;
    if (fullHeal) {
      state.hero.hp = d.maxHp;
      state.hero.mp = d.maxMp;
    } else {
      state.hero.hp = Math.min(state.hero.hp, d.maxHp);
      state.hero.mp = Math.min(state.hero.mp, d.maxMp);
    }
  }

  /* ------------------------------------------------------------------------
     INVENTORY & ECONOMY ACTIONS
     ------------------------------------------------------------------------ */
  function getItemQty(itemId) {
    const found = state.inventory.find((x) => x.itemId === itemId);
    return found ? found.qty : 0;
  }

  function addItem(itemId, qty = 1) {
    if (!ART.ARTIFACTS[itemId]) return;
    const found = state.inventory.find((x) => x.itemId === itemId);
    if (found) found.qty += qty;
    else state.inventory.push({ itemId, qty });
  }

  function removeItem(itemId, qty = 1) {
    const idx = state.inventory.findIndex((x) => x.itemId === itemId);
    if (idx === -1 || state.inventory[idx].qty < qty) return false;
    state.inventory[idx].qty -= qty;
    if (state.inventory[idx].qty <= 0) state.inventory.splice(idx, 1);
    return true;
  }

  function grantXp(amount) {
    state.hero.xp += amount;
    while (state.hero.xp >= state.hero.xpNext) {
      state.hero.xp -= state.hero.xpNext;
      state.hero.level += 1;
      state.hero.xpNext = Math.round(state.hero.xpNext * 1.42);
      state.hero.unspentPoints += 3;
      recalcVitals(true);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `¡ASCENSO SOLAR! Has alcanzado el Nivel ${state.hero.level}. Salud y Maná restaurados al 100% (+3 puntos de atributo).`
      );
    }
  }

  /* ------------------------------------------------------------------------
     GAMEPLAY ACTIONS API
     ------------------------------------------------------------------------ */
  const actions = {
    getItemQty,
    checkMedalUnlocked,

    switchCenterView(viewName) {
      state.ui.centerView = viewName;
      renderAll();
    },

    travelTo(locationId) {
      const dest = ART.LOCATIONS.find((l) => l.id === locationId);
      if (!dest) return;
      if (state.hero.level < dest.minLevel) {
        CHAT.addSystemMessage(`Necesitas Nivel ${dest.minLevel} para viajar a ${dest.name}.`);
        return;
      }
      combatState = null;
      state.world.currentLocation = dest.id;
      if (!state.world.visitedLocations.includes(dest.id)) {
        state.world.visitedLocations.push(dest.id);
      }
      if (dest.isSafeZone) {
        recalcVitals(true);
        CHAT.addSystemMessage(`Regresaste al santuario de ${dest.name}. Tus fuerzas han sido restauradas.`);
      } else {
        CHAT.addSystemMessage(`Has viajado a ${dest.name} (${dest.subtitle}).`);
      }
      state.ui.centerView = 'location';
      UI.AudioFX.coin();
      saveState();
      renderAll();
    },

    openNpcModal(npcId) {
      MODALS.openNpcDialog(npcId, state, actions);
    },

    openSpecialModal(modalType) {
      MODALS.openSpecialModal(modalType, state, actions);
    },

    allocateStat(statKey) {
      if (state.hero.unspentPoints > 0 && state.hero.baseStats[statKey] !== undefined) {
        state.hero.baseStats[statKey] += 1;
        state.hero.unspentPoints -= 1;
        recalcVitals(false);
        UI.AudioFX.coin();
        saveState();
        renderAll();
      }
    },

    useItem(itemId) {
      const it = ART.ARTIFACTS[itemId];
      if (!it) return;

      if (it.slot === 'consumable') {
        if (!removeItem(itemId, 1)) return;
        recalcVitals(false);
        if (it.healHp) state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + it.healHp);
        if (it.healMp) state.hero.mp = Math.min(state.hero.maxMp, state.hero.mp + it.healMp);
        if (combatState) {
          if (it.buffAtk) combatState.buffAtk = (combatState.buffAtk || 0) + it.buffAtk;
          if (it.buffDef) combatState.buffDef = (combatState.buffDef || 0) + it.buffDef;
          combatState.log.unshift(`🧪 Consumiste ${it.name} en pleno combate.`);
        }
        UI.AudioFX.coin();
        CHAT.addSystemMessage(`Usaste ${it.name}.`);
        saveState();
        renderAll();
        return;
      }

      if (state.equipment[it.slot] !== undefined) {
        if (!removeItem(itemId, 1)) return;
        const prev = state.equipment[it.slot];
        if (prev) addItem(prev, 1);
        state.equipment[it.slot] = itemId;
        recalcVitals(false);
        UI.AudioFX.strike();
        CHAT.addSystemMessage(`Equipaste ${it.name}.`);
        saveState();
        renderAll();
      }
    },

    buyItem(itemId) {
      const it = ART.ARTIFACTS[itemId];
      if (!it) return;
      if (state.hero.copper < it.price) {
        CHAT.addSystemMessage(`Monedas insuficientes para adquirir ${it.name}.`);
        return;
      }
      state.hero.copper -= it.price;
      addItem(itemId, 1);
      UI.AudioFX.coin();
      CHAT.addSystemMessage(`Compraste ${it.name}.`);
      saveState();
      renderAll();
    },

    sellItem(itemId) {
      const it = ART.ARTIFACTS[itemId];
      if (!it || !removeItem(itemId, 1)) return;
      const val = Math.max(10, Math.floor(it.price * 0.5));
      state.hero.copper += val;
      UI.AudioFX.coin();
      CHAT.addSystemMessage(`Vendiste 1x ${it.name} por ${val} monedas de cobre.`);
      saveState();
      renderAll();
    },

    harvestNode(node) {
      state.world.harvestCount = (state.world.harvestCount || 0) + 1;
      const prof = state.professions[node.prof] || { level: 1, xp: 0 };
      prof.xp += 18;
      if (prof.xp >= prof.level * 50) {
        prof.xp -= prof.level * 50;
        prof.level += 1;
        CHAT.addSystemMessage(`¡Tu profesión de ${node.prof.toUpperCase()} ha subido a Nivel ${prof.level}!`);
      }
      state.professions[node.prof] = prof;

      const dropMap = {
        1: 'lingote_bronce',
        2: 'hoja_solar',
        3: 'cristal_luminita',
        4: 'runa_solar',
        5: 'nucleo_eclipse'
      };
      const rewardId = dropMap[node.tier] || 'hoja_solar';
      addItem(rewardId, 1);
      grantXp(22 * node.tier);
      UI.AudioFX.coin();
      CHAT.addSystemMessage(
        `🏹 Modo Caza: Recolectaste [${ART.ARTIFACTS[rewardId].name}] de ${node.name}.`
      );
      saveState();
      renderAll();
    },

    startCombat(creatureId) {
      const cr = ART.CREATURES.find((c) => c.id === creatureId);
      if (!cr) return;
      recalcVitals(false);
      if (state.hero.hp < 25) state.hero.hp = Math.round(state.hero.maxHp * 0.5);

      combatState = {
        isPvp: false,
        turn: 1,
        attackZone: 'head',
        defendZone: 'torso',
        comboChain: [],
        readySuperBlow: null,
        buffAtk: 0,
        buffDef: 0,
        enemyBleedTurns: 0,
        enemy: {
          ...cr,
          maxHp: cr.hp,
          currentHp: cr.hp
        },
        log: [
          `⚔️ ¡Emboscada táctica contra ${cr.name} (Nivel ${cr.level})!`,
          `Selecciona tu Zona de Ataque y Zona de Bloqueo. Encadena 3 golpes para desatar un Super-Golpe.`
        ]
      };
      state.ui.centerView = 'combat';
      UI.AudioFX.strike();
      renderAll();
    },

    startPvpCombat(aiId) {
      const w = ART.AI_WARRIORS.find((x) => x.id === aiId);
      if (!w) return;
      recalcVitals(false);
      if (state.hero.hp < 40) state.hero.hp = state.hero.maxHp;

      combatState = {
        isPvp: true,
        turn: 1,
        attackZone: 'head',
        defendZone: 'torso',
        comboChain: [],
        readySuperBlow: null,
        buffAtk: 0,
        buffDef: 0,
        enemyBleedTurns: 0,
        enemy: {
          id: w.id,
          name: `${w.name} (${w.clan})`,
          level: w.level,
          hp: w.hp,
          maxHp: w.hp,
          currentHp: w.hp,
          atk: w.atk,
          def: w.def,
          crit: w.crit,
          xp: w.level * 55,
          copper: w.level * 320,
          icon: '⚔️',
          isBoss: w.level >= 9,
          drops: ['fragmento_eltico', 'panacea_solar']
        },
        log: [
          `🏟️ ¡Duelo de Honor en el Coliseo PvP contra ${w.name} del Clan ${w.clan}!`
        ]
      };
      state.ui.centerView = 'combat';
      UI.AudioFX.superBlow();
      renderAll();
    },

    executeCombatTurn() {
      if (!combatState) return;
      const d = computeDerivedStats();
      const en = combatState.enemy;
      const zones = ['head', 'torso', 'legs'];
      const zoneNames = { head: 'Cabeza', torso: 'Torso', legs: 'Piernas' };

      const enemyAtkZone = zones[Math.floor(Math.random() * 3)];
      const enemyDefZone = zones[Math.floor(Math.random() * 3)];

      // Track 3-hit directional sequence for Super-Blows
      combatState.comboChain.push(combatState.attackZone);
      if (combatState.comboChain.length > 3) combatState.comboChain.shift();

      let activeSuper = null;
      if (combatState.comboChain.length === 3) {
        activeSuper = ART.SUPER_BLOWS.find(
          (sb) =>
            sb.sequence[0] === combatState.comboChain[0] &&
            sb.sequence[1] === combatState.comboChain[1] &&
            sb.sequence[2] === combatState.comboChain[2]
        );
      }

      let mult = activeSuper ? activeSuper.mult : 1.0;
      const heroAtk = d.atk + (combatState.buffAtk || 0);
      const effectiveEnemyDef =
        activeSuper && activeSuper.bonusEffect === 'armor_break' ? en.def * 0.25 : en.def * 0.52;

      let rawDmg = Math.max(14, heroAtk * mult - effectiveEnemyDef);

      const enemyBlocked =
        enemyDefZone === combatState.attackZone &&
        !(activeSuper && activeSuper.bonusEffect === 'armor_break');
      if (enemyBlocked) rawDmg *= 0.56;

      const isCrit = Math.random() * 100 < d.crit || Boolean(activeSuper);
      if (isCrit && !activeSuper) rawDmg *= 1.58;

      const finalDmg = Math.round(rawDmg);
      en.currentHp = Math.max(0, en.currentHp - finalDmg);

      if (activeSuper) {
        UI.AudioFX.superBlow();
        combatState.comboChain = [];
        window.GDL_COMBAT_CANVAS.triggerCombatEffect(
          'super',
          `⚡ ¡${activeSuper.name.toUpperCase()}! -${finalDmg}`,
          'enemy',
          true
        );
        combatState.log.unshift(
          `🌟 ¡SUPER-GOLPE [${activeSuper.name}] en ${zoneNames[combatState.attackZone]}! Infliges ${finalDmg} de daño devastador.`
        );
        if (activeSuper.bonusEffect === 'bleed') combatState.enemyBleedTurns = 2;
        if (activeSuper.bonusEffect === 'lifesteal') {
          const drain = Math.round(finalDmg * 0.35);
          state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + drain);
          combatState.log.unshift(`✨ Drenaje Astral restaura +${drain} HP.`);
        }
      } else {
        UI.AudioFX.strike();
        window.GDL_COMBAT_CANVAS.triggerCombatEffect(
          'slash',
          isCrit ? `💥 CRÍTICO -${finalDmg}` : `-${finalDmg}`,
          'enemy',
          isCrit
        );
        combatState.log.unshift(
          `Turno ${combatState.turn}: Atacas a ${zoneNames[combatState.attackZone]} → ${finalDmg} daño${
            isCrit ? ' (¡Crítico!)' : ''
          }${enemyBlocked ? ' [Bloqueado]' : ''}.`
        );
      }

      // Active Pet Assist Attack
      if (state.pets.active && en.currentHp > 0) {
        const pet = ART.PETS.find((p) => p.id === state.pets.active);
        if (pet) {
          en.currentHp = Math.max(0, en.currentHp - pet.assistDmg);
          combatState.log.unshift(
            `${pet.icon} Tu ${pet.name} asiste con un ataque de +${pet.assistDmg} daño.`
          );
        }
      }

      // Bleed DoT
      if (combatState.enemyBleedTurns > 0 && en.currentHp > 0) {
        const bleedDmg = 18 + state.hero.level * 4;
        en.currentHp = Math.max(0, en.currentHp - bleedDmg);
        combatState.enemyBleedTurns -= 1;
        combatState.log.unshift(`☀️ Hemorragia Luminosa abrasa a ${en.name} por ${bleedDmg} daño.`);
      }

      // Check Victory
      if (en.currentHp <= 0) {
        handleVictory(en, combatState.isPvp);
        return;
      }

      // Enemy Counter-Attack
      const heroDef = d.def + (combatState.buffDef || 0);
      let enemyRaw = Math.max(8, en.atk - heroDef * 0.48);
      const heroBlocked = combatState.defendZone === enemyAtkZone;
      if (heroBlocked) enemyRaw *= 0.44;

      const finalEnemyDmg = Math.round(enemyRaw);
      state.hero.hp = Math.max(0, state.hero.hp - finalEnemyDmg);

      window.GDL_COMBAT_CANVAS.triggerCombatEffect(
        'slash',
        heroBlocked ? `🛡️ -${finalEnemyDmg}` : `-${finalEnemyDmg}`,
        'hero',
        false
      );
      combatState.log.unshift(
        `${en.name} golpea tu ${zoneNames[enemyAtkZone]} → ${finalEnemyDmg} daño${
          heroBlocked ? ' (¡Bloqueo Perfecto!)' : ''
        }.`
      );

      if (state.hero.hp <= 0) {
        CHAT.addSystemMessage(
          `Has caído ante ${en.name}. Los sanadores de la Ciudadela de la Luz restauran tu vitalidad.`
        );
        combatState = null;
        recalcVitals(true);
        state.ui.centerView = 'location';
        saveState();
        renderAll();
        return;
      }

      combatState.turn += 1;
      saveState();
      renderAll();
    },

    fleeCombat() {
      combatState = null;
      state.ui.centerView = 'location';
      renderAll();
    },

    getQuestProgress(q) {
      const w = state.world;
      if (q.type === 'any_kills') return Math.min(q.targetCount, w.totalKills || 0);
      if (q.type === 'loc_kills') return Math.min(q.targetCount, (w.killsByLoc && w.killsByLoc[q.targetLoc]) || 0);
      if (q.type === 'creature_id') return Math.min(q.targetCount, (w.killsByCreature && w.killsByCreature[q.targetId]) || 0);
      return 0;
    },

    claimQuest(questId) {
      const q = ART.QUESTS.find((x) => x.id === questId);
      if (!q || state.quests.claimed[q.id]) return;
      if (actions.getQuestProgress(q) < q.targetCount) return;

      state.quests.claimed[q.id] = true;
      state.hero.copper += q.rewardCopper;
      if (q.rewardItem) addItem(q.rewardItem, 1);
      grantXp(q.rewardXp);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`📜 ¡Misión Cumplida: ${q.title}! Recibiste tu recompensa real.`);
      saveState();
      renderAll();
    },

    transmuteCube(recipeId) {
      const rec = ART.CUBE_RECIPES.find((r) => r.id === recipeId);
      if (!rec) return;
      if (state.hero.copper < rec.copperCost) {
        CHAT.addSystemMessage('No tienes suficientes monedas para activar el Cubo Éltico.');
        return;
      }
      for (const ing of rec.ingredients) {
        if (getItemQty(ing.itemId) < ing.qty) {
          CHAT.addSystemMessage('Te faltan ingredientes para esta transmutación en el Cubo Éltico.');
          return;
        }
      }
      state.hero.copper -= rec.copperCost;
      rec.ingredients.forEach((ing) => removeItem(ing.itemId, ing.qty));
      addItem(rec.resultId, rec.resultQty);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🧊 ¡Cubo Éltico! Has sintetizado ${rec.resultQty}x ${ART.ARTIFACTS[rec.resultId].name}.`
      );
      saveState();
      renderAll();
    },

    trainProfession(profId) {
      if (state.hero.copper < 120) {
        CHAT.addSystemMessage('Necesitas 1p 20c para financiar materiales de práctica.');
        return;
      }
      state.hero.copper -= 120;
      const p = state.professions[profId] || { level: 1, xp: 0 };
      p.xp += 25;
      if (p.xp >= p.level * 50) {
        p.xp -= p.level * 50;
        p.level += 1;
        UI.AudioFX.fanfare();
      } else {
        UI.AudioFX.coin();
      }
      state.professions[profId] = p;
      saveState();
      renderAll();
    },

    buyOrEquipMount(mountId) {
      const m = ART.MOUNTS.find((x) => x.id === mountId);
      if (!m) return;
      if (!state.mounts.owned.includes(mountId)) {
        if (state.hero.copper < m.price) {
          CHAT.addSystemMessage(`Monedas insuficientes para domar a ${m.name}.`);
          return;
        }
        state.hero.copper -= m.price;
        state.mounts.owned.push(mountId);
        state.mounts.active = mountId;
        UI.AudioFX.fanfare();
        CHAT.addSystemMessage(`🔥 ¡Has domado la montura [${m.name}]!`);
      } else {
        state.mounts.active = state.mounts.active === mountId ? null : mountId;
        UI.AudioFX.coin();
      }
      recalcVitals(false);
      saveState();
      renderAll();
    },

    buyOrEquipPet(petId) {
      const p = ART.PETS.find((x) => x.id === petId);
      if (!p) return;
      if (!state.pets.owned.includes(petId)) {
        if (state.hero.copper < p.price) {
          CHAT.addSystemMessage(`Monedas insuficientes para adoptar a ${p.name}.`);
          return;
        }
        state.hero.copper -= p.price;
        state.pets.owned.push(petId);
        state.pets.active = petId;
        UI.AudioFX.fanfare();
        CHAT.addSystemMessage(`🦅 ¡[${p.name}] se ha unido a ti como mascota de combate!`);
      } else {
        state.pets.active = state.pets.active === petId ? null : petId;
        UI.AudioFX.coin();
      }
      recalcVitals(false);
      saveState();
      renderAll();
    },

    invokeMagicMirror() {
      if (state.hero.copper < 250) {
        return 'Necesitas al menos 2p 50c para despertar al Espejo Mágico.';
      }
      state.hero.copper -= 250;
      state.world.mirrorUses = (state.world.mirrorUses || 0) + 1;
      const roll = Math.random();
      let msg = '';
      if (roll < 0.35) {
        state.hero.baseStats.str += 1;
        state.hero.baseStats.vit += 1;
        msg = '✨ ¡El Espejo de Solaria bendice tu cuerpo con +1 Fuerza y +1 Vitalidad permanentes!';
      } else if (roll < 0.7) {
        state.hero.baseStats.agi += 1;
        state.hero.baseStats.wis += 1;
        msg = '🌟 ¡Luz Estelar! Recibes +1 Agilidad y +1 Sabiduría permanentes.';
      } else {
        addItem('fragmento_eltico', 1);
        recalcVitals(true);
        msg = '💎 ¡El Espejo materializa 1x Fragmento del Cubo Éltico y restaura tu Salud al 100%!';
      }
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(msg);
      saveState();
      renderAll();
      return msg;
    },

    playTavernDice(betCopper) {
      if (state.hero.copper < betCopper) {
        return 'No tienes suficientes monedas en tu bolsa para cubrir esa apuesta.';
      }
      const d1 = 1 + Math.floor(Math.random() * 6);
      const d2 = 1 + Math.floor(Math.random() * 6);
      const d3 = 1 + Math.floor(Math.random() * 6);
      const b1 = 1 + Math.floor(Math.random() * 6);
      const b2 = 1 + Math.floor(Math.random() * 6);
      const b3 = 1 + Math.floor(Math.random() * 6);

      const pSum = d1 + d2 + d3;
      const bSum = b1 + b2 + b3;
      const isTriple = d1 === d2 && d2 === d3;

      if (isTriple || pSum > bSum) {
        const winAmt = isTriple ? betCopper * 2 : betCopper;
        state.hero.copper += winAmt;
        UI.AudioFX.fanfare();
        saveState();
        renderAll();
        return `🎲 Tus dados: [${d1}, ${d2}, ${d3}] = <strong>${pSum}</strong> vs Balthus: [${b1}, ${b2}, ${b3}] = <strong>${bSum}</strong>.<br/><span style="color:var(--xp-bright)">¡VICTORIA! Ganaste +${ART.formatCurrencyBadge(
          winAmt
        )}.</span>`;
      } else if (pSum === bSum) {
        UI.AudioFX.coin();
        return `🎲 Empate a <strong>${pSum}</strong> ([${d1},${d2},${d3}] vs [${b1},${b2},${b3}]). Conservas tu apuesta.`;
      } else {
        state.hero.copper -= betCopper;
        UI.AudioFX.strike();
        saveState();
        renderAll();
        return `🎲 Tus dados: [${d1}, ${d2}, ${d3}] = <strong>${pSum}</strong> vs Balthus: [${b1}, ${b2}, ${b3}] = <strong>${bSum}</strong>.<br/><span style="color:#ff8b82">Balthus gana la ronda (-${ART.formatCurrencyBadge(
          betCopper
        )}).</span>`;
      }
    },

    joinClan(clanName) {
      state.hero.clan = clanName;
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🛡️ Has jurado lealtad al Clan [${clanName}].`);
      saveState();
      renderAll();
    },

    importSaveString(raw) {
      if (!raw) return false;
      try {
        const jsonStr = raw.startsWith('{') ? raw : decodeURIComponent(escape(atob(raw)));
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.hero && parsed.world) {
          state = Object.assign(createDefaultState(), parsed);
          recalcVitals(false);
          saveState();
          renderAll();
          CHAT.addSystemMessage('Crónica importada correctamente en el motor persistente.');
          return true;
        }
      } catch (e) {}
      CHAT.addSystemMessage('El código de partida no es válido.');
      return false;
    },

    resetSave() {
      state = createDefaultState();
      combatState = null;
      recalcVitals(true);
      saveState();
      renderAll();
      CHAT.addSystemMessage('Nueva partida iniciada en la Ciudadela de la Luz.');
    }
  };

  function handleVictory(en, isPvp) {
    UI.AudioFX.fanfare();
    state.hero.copper += en.copper;
    state.world.totalKills = (state.world.totalKills || 0) + 1;

    if (isPvp) {
      state.world.pvpWins = (state.world.pvpWins || 0) + 1;
      state.world.pvpDefeated[en.id] = true;
    } else {
      const locId = en.loc || state.world.currentLocation;
      state.world.killsByLoc[locId] = (state.world.killsByLoc[locId] || 0) + 1;
      state.world.killsByCreature[en.id] = (state.world.killsByCreature[en.id] || 0) + 1;
      if (en.isBoss || en.isElite) {
        state.world.bossesDefeated[en.id] = true;
      }
    }

    const droppedNames = [];
    (en.drops || []).forEach((itemId) => {
      if (en.isBoss || Math.random() < 0.58) {
        addItem(itemId, 1);
        if (ART.ARTIFACTS[itemId]) droppedNames.push(ART.ARTIFACTS[itemId].name);
      }
    });

    CHAT.addSystemMessage(
      `🏆 ¡VICTORIA contra ${en.name}! +${en.xp} XP, +${en.copper}c${
        droppedNames.length ? ' • Botín: ' + droppedNames.join(', ') : ''
      }`
    );

    grantXp(en.xp);

    const defeatedMalakor = en.id === 'malakor_emperador_eclipse';
    combatState = null;
    state.ui.centerView = 'location';
    saveState();
    renderAll();

    if (defeatedMalakor) {
      MODALS.openSpecialModal('victory', state, actions);
    }
  }

  /* ------------------------------------------------------------------------
     MAIN RENDER ORCHESTRATOR
     ------------------------------------------------------------------------ */
  function renderAll() {
    recalcVitals(false);
    const derived = computeDerivedStats();
    UI.renderTopHeader(state);
    UI.renderHeroLeftPanel(state, derived, actions);

    // Update top navigation tabs
    document.querySelectorAll('[data-nav-view]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-nav-view') === state.ui.centerView);
    });

    const stageEl = document.getElementById('center-stage-container');
    if (state.ui.centerView === 'hunting') {
      VIEWS.renderHuntingView(stageEl, state, actions);
    } else if (state.ui.centerView === 'combat' && combatState) {
      VIEWS.renderCombatView(stageEl, state, combatState, actions);
    } else if (state.ui.centerView === 'atlas') {
      VIEWS.renderAtlasView(stageEl, state, actions);
    } else {
      state.ui.centerView = 'location';
      VIEWS.renderLocationView(stageEl, state, actions);
    }

    UI.renderRightDock(state, actions);
  }

  /* ------------------------------------------------------------------------
     BOOT APPLICATION
     ------------------------------------------------------------------------ */
  function boot() {
    loadState();

    // Navigation view buttons
    document.querySelectorAll('[data-nav-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-nav-view');
        if (v === 'combat' && !combatState) {
          const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
          const firstCr = ART.CREATURES.find((c) => c.loc === loc.id);
          if (firstCr) {
            actions.startCombat(firstCr.id);
            return;
          }
        }
        actions.switchCenterView(v);
      });
    });

    // Special modal top buttons
    document.querySelectorAll('[data-top-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.openSpecialModal(btn.getAttribute('data-top-modal'));
      });
    });

    // Right dock tabs
    document.querySelectorAll('[data-right-dock-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.rightTab = btn.getAttribute('data-right-dock-tab');
        UI.renderRightDock(state, actions);
      });
    });

    // Audio mute toggle
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        UI.AudioFX.muted = !UI.AudioFX.muted;
        audioBtn.textContent = UI.AudioFX.muted ? '🔇 Audio' : '🔊 Audio';
      });
    }

    // Rename Hero on click
    const heroNameEl = document.getElementById('hero-name-title');
    if (heroNameEl) {
      heroNameEl.addEventListener('click', () => {
        const n = prompt('Nombre de tu Guerrero de la Luz:', state.hero.name);
        if (n && n.trim().length > 1) {
          state.hero.name = n.trim().slice(0, 20);
          saveState();
          renderAll();
        }
      });
    }

    // Modal close button
    const closeBtn = document.getElementById('btn-close-gdl-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', MODALS.closeModalShell);
    }
    const backdrop = document.getElementById('gdl-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target.id === 'gdl-modal-backdrop') MODALS.closeModalShell();
      });
    }

    CHAT.initChatPanel(() => state.hero.name);
    setInterval(saveState, 15000);
    saveState();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
