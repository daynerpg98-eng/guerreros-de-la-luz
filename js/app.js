/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/app.js
   Complete Asteria (https://asteriagame.com/) Persistent Browser MMORPG Engine:
   - Deep-merging localStorage migration (guerreros_de_la_luz_asteria_v3)
   - Dual Factions (Ogriy vs Khair) & 3 Combat Styles (Titán, Destructor, Sombra)
   - 12-Slot Paperdoll, Unequip, Durability/Repair, Неслом & Legendary Runes
   - 33.33% & 66.66% Sub-Level XP Milestone Rewards & Anti-XP Ring (Антиопыт)
   - Orange Valor (Доблесть) Rank Progression & Multi-Currency Economy
   - 3-Zone Tactical Combat + 3 Stances + 6 Super-Blows + 4 Magic Spells +
     Morok/Mount Summon + Disciple/Red Pet Assist + 6-Slot Belt + Injuries +
     Post-Combat Statistics (fight_info.php)
   - Enhanced Hunting Mode with Tool Bonuses & Elite Guardian Drops
   - 9 Professions & Real Crafting Workshop (service_craft.php)
   - 6 Battlefields, 6 Instances (incl. La Gruta / ГРОТ), 10 Reputations
     (incl. Arkona & Tahúr / Катала), Disciples Academy, Red Pet Crystals,
     6 Card Decks, 6 Estate Buildings, 5 Clan Talents, Fair/Wheel/Daily Feats,
     Imperial Bank/Auction, Promocodes & Balagur Riddles.
   ========================================================================== */

window.GDL_APP = (function () {
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
        faction: 'ogriy',        // 'ogriy' | 'khair'
        combatStyle: 'titan',    // 'titan' | 'destructor' | 'sombra'
        level: 1,
        xp: 0,
        xpNext: 100,
        xpMilestones: { level: 1, m33: false, m66: false },
        hp: 210,
        maxHp: 210,
        mp: 100,
        maxMp: 100,
        copper: 650,             // 6p 50c
        diamonds: 5,
        rubies: 2,
        trophyCoins: 0,
        onlineTokens: 3,
        valor: 0,
        clan: 'Hijos del Alba',
        unspentPoints: 3,
        antiXp: false,
        antiXpActive: false,
        unbreakable: false,
        unbreakableBuff: false,
        injury: null,
        baseStats: {
          str: 11,
          agi: 9,
          vit: 12,
          wis: 9
        }
      },
      equipment: {
        helm: 'capucha_iniciado',
        pauldrons: 'hombreras_iniciado',
        amulet: 'amuleto_selene',
        weapon: 'espada_iniciado',
        armor: 'jubon_milicia',
        bracers: 'brazales_cuero',
        shield: 'rodela_madera',
        cloak: 'capa_explorador',
        cuisses: 'quijotes_milicia',
        ring: 'anillo_alquimico',
        belt: 'cinturon_iniciado',
        boots: 'botas_viento_alba'
      },
      equipmentDurability: {
        helm: 50,
        pauldrons: 50,
        amulet: 65,
        weapon: 50,
        armor: 55,
        bracers: 50,
        shield: 50,
        cloak: 60,
        cuisses: 50,
        ring: 60,
        belt: 50,
        boots: 60
      },
      equipmentRunes: {
        helm: null,
        pauldrons: null,
        amulet: null,
        weapon: null,
        armor: null,
        bracers: null,
        shield: null,
        cloak: null,
        cuisses: null,
        ring: null,
        belt: null,
        boots: null
      },
      belt: [
        'elixir_vida_menor',
        'elixir_vida_mayor',
        'nectar_mana_astral',
        'panacea_solar',
        'pocion_furia_titan',
        'pergamino_piel_piedra'
      ],
      combatBelt: [
        'elixir_vida_menor',
        'elixir_vida_mayor',
        'nectar_mana_astral',
        'panacea_solar',
        'pocion_furia_titan',
        'pergamino_piel_piedra'
      ],
      inventory: [
        { itemId: 'elixir_vida_menor', qty: 5 },
        { itemId: 'nectar_mana_astral', qty: 3 },
        { itemId: 'panacea_solar', qty: 1 },
        { itemId: 'pocion_furia_titan', qty: 1 },
        { itemId: 'pergamino_piel_piedra', qty: 1 },
        { itemId: 'pergamino_sanador', qty: 1 },
        { itemId: 'lingote_bronce', qty: 3 },
        { itemId: 'hoja_solar', qty: 3 },
        { itemId: 'riolita', qty: 2 },
        { itemId: 'chispa_celestial', qty: 1 },
        { itemId: 'llave_cerrajero', qty: 1 },
        { itemId: 'cofre_forjado', qty: 1 },
        { itemId: 'anillo_anti_xp', qty: 1 }
      ],
      professions: {
        mineria: { level: 1, xp: 10 },
        herbolaria: { level: 1, xp: 10 },
        pesca: { level: 1, xp: 5 },
        herreria: { level: 1, xp: 15 },
        alquimia: { level: 1, xp: 15 },
        joyeria: { level: 1, xp: 5 },
        sanador: { level: 1, xp: 10 },
        cerrajero: { level: 1, xp: 10 },
        verdugo: { level: 1, xp: 5 }
      },
      mounts: {
        owned: ['corcel_alba'],
        active: 'corcel_alba'
      },
      pets: {
        owned: ['halcon_alba'],
        active: 'halcon_alba',
        satiety: 5,
        crystals: {}
      },
      disciples: {
        levels: { discipulo_guerrero: 1, discipulo_mago: 0, discipulo_asesino: 0 },
        active: 'discipulo_guerrero'
      },
      reputations: {
        custodios_capital: 100,
        caballeros_subterraneos: 50,
        buscadores_reliquias: 50,
        luchadores_caos: 0,
        orden_triadas: 0,
        buscadores_tesoros: 0,
        patronos_mascotas: 50,
        influencia_arkona: 50,
        katala_tahur: 0,
        katala: 0,
        cazadores_no_muertos: 0
      },
      instances: {
        totalClears: 0,
        cooldowns: {},
        clearsById: {}
      },
      estate: {
        riolite: 2,
        buildings: {
          ayuntamiento: 1,
          taller_forja: 1,
          enfermeria_solar: 1,
          obelisco_valor: 1,
          estatua_experiencia: 1,
          criadero_moroks: 1
        },
        ayuntamiento: 1,
        taller_forja: 1,
        enfermeria_solar: 1,
        obelisco_valor: 1,
        estatua_experiencia: 1,
        criadero_moroks: 1
      },
      clanTalents: {
        vitalidad_clan: 1,
        furia_clan: 0,
        baluarte_clan: 0,
        gloria_valor: 0,
        sabiduria_ancestral: 0
      },
      cardDecks: {
        unlocked: {},
        cooldowns: {}
      },
      decks: {
        baraja_recursos: { cards: 3, claims: 0 },
        mecenas_ii: { cards: 2, claims: 0 },
        clanes_asteria: { cards: 2, claims: 0 },
        dones_dragon: { cards: 1, claims: 0 },
        baraja_efimera: { cards: 2, claims: 0 },
        baraja_sheara: { cards: 1, claims: 0 }
      },
      bank: {
        depositedCopper: 200,
        luckyClaims: 0
      },
      claimedPromocodes: [],
      giftsReceived: [
        { id: 'gift_corona_solar', name: 'Corona de Laurel Solar', icon: '👑', from: 'Comandante Aurelius' }
      ],
      quests: {
        claimed: {}
      },
      lastFightInfo: null,
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
        battlefieldWins: 0,
        instanceClears: {},
        instanceCooldowns: {},
        solvedRiddles: {},
        claimedFeats: {},
        boughtAuctions: {},
        mirrorUses: 0,
        lastFightStats: null,
        lastFightInfo: null
      },
      ui: {
        centerView: 'location',
        activeView: 'location',
        rightTab: 'bag',
        bagCategory: 'all',
        selectedItem: 'elixir_vida_menor',
        selectedSlot: 'weapon',
        huntingFilter: 'all',
        autoAggro: false,
        zonePanelCollapsed: false,
        inspectedWarriorId: null
      }
    };
  }

  function isPlainObject(val) {
    return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
  }

  function deepMergeState(target, source) {
    if (!isPlainObject(target) || !isPlainObject(source)) return source !== undefined ? source : target;
    const out = { ...target };
    Object.keys(source).forEach((key) => {
      const srcVal = source[key];
      const tgtVal = target[key];
      if (isPlainObject(tgtVal) && isPlainObject(srcVal)) {
        out[key] = deepMergeState(tgtVal, srcVal);
      } else if (srcVal !== undefined) {
        out[key] = srcVal;
      }
    });
    return out;
  }

  function normalizeLoadedState(rawState) {
    const merged = deepMergeState(createDefaultState(), rawState || {});
    merged.version = 3;
    Object.keys(merged.equipment).forEach((slot) => {
      const itemId = merged.equipment[slot];
      const it = itemId ? ART.ARTIFACTS[itemId] : null;
      const maxDur = (it && it.maxDurability) || 60;
      const rawDur = merged.equipmentDurability[slot];
      if (typeof rawDur === 'object' && rawDur !== null && typeof rawDur.cur === 'number') {
        merged.equipmentDurability[slot] = rawDur.cur;
      } else if (typeof rawDur !== 'number') {
        merged.equipmentDurability[slot] = maxDur;
      }
    });
    const kat = Math.max(merged.reputations.katala_tahur || 0, merged.reputations.katala || 0);
    merged.reputations.katala_tahur = kat;
    merged.reputations.katala = kat;
    merged.hero.antiXp = Boolean(merged.hero.antiXp || merged.hero.antiXpActive);
    merged.hero.antiXpActive = merged.hero.antiXp;
    merged.hero.unbreakable = Boolean(merged.hero.unbreakable || merged.hero.unbreakableBuff);
    merged.hero.unbreakableBuff = merged.hero.unbreakable;
    if (!Array.isArray(merged.belt) || merged.belt.length !== 6) {
      merged.belt = [...merged.combatBelt];
    }
    merged.combatBelt = merged.belt;
    merged.ui.activeView = merged.ui.centerView || 'location';
    return merged;
  }

  let state = createDefaultState();
  let combatState = null;

  /* ------------------------------------------------------------------------
     PERSISTENCE (LOCALSTORAGE + DEEP-MERGE MIGRATION)
     ------------------------------------------------------------------------ */
  function saveState() {
    state.version = 3;
    state.savedAt = Date.now();
    state.ui.activeView = state.ui.centerView;
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
          state = normalizeLoadedState(parsed);
          recalcVitals(false);
          return;
        }
      }
    } catch (e) {}
    state = createDefaultState();
    recalcVitals(true);
  }

  /* ------------------------------------------------------------------------
     DERIVED STATS ENGINE
     ------------------------------------------------------------------------ */
  function checkMedalUnlocked(medalId) {
    const w = state.world;
    const claimedCount = Object.keys((state.quests && state.quests.claimed) || {}).length;
    if (medalId === 'med_custodio_luz') return state.hero.level >= 3 && claimedCount >= 3;
    if (medalId === 'med_cazador_bestias') return (w.totalKills || 0) >= 10 && (w.harvestCount || 0) >= 8;
    if (medalId === 'med_domador_ignifer') return state.mounts.owned.includes('ignifer');
    if (medalId === 'med_campeon_arena') return (w.pvpWins || 0) >= 5;
    if (medalId === 'med_purgador_cristal') return Boolean(w.bossesDefeated && w.bossesDefeated.krystallos_soberano);
    if (medalId === 'med_soberano_alba') {
      return Boolean(
        w.bossesDefeated &&
          w.bossesDefeated.vorathax_dragon_eclipse &&
          w.bossesDefeated.malakor_emperador_eclipse
      );
    }
    return false;
  }

  function getSlotCurDurability(slot) {
    const raw = state.equipmentDurability && state.equipmentDurability[slot];
    if (typeof raw === 'number') return raw;
    if (raw && typeof raw.cur === 'number') return raw.cur;
    return 60;
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
      crit: 6,
      dodge: 4,
      armorPen: 0,
      blockBonus: 0,
      bonusHp: 0,
      bonusMp: 0
    };

    const addStatMap = (statObj, mult = 1) => {
      if (!statObj) return;
      Object.entries(statObj).forEach(([k, val]) => {
        const v = Math.round(val * mult);
        if (k === 'mp' || k === 'maxMp') s.bonusMp += v;
        else if (k === 'hp' || k === 'maxHp') s.bonusHp += v;
        else if (s[k] !== undefined) s[k] += v;
      });
    };

    // 1. Faction Bonus
    const fac = ART.FACTIONS[h.faction || 'ogriy'];
    if (fac && fac.stats) addStatMap(fac.stats);

    // 2. 12 Equipped Artifacts + Socketed Legendary Runes (respecting Durability & Неслом)
    const isUnbreak = Boolean(h.unbreakable || h.unbreakableBuff);
    Object.entries(state.equipment || {}).forEach(([slot, itemId]) => {
      if (!itemId) return;
      const it = ART.ARTIFACTS[itemId];
      if (!it) return;
      const curDur = getSlotCurDurability(slot);
      const isBroken = curDur <= 0 && !isUnbreak;
      if (!isBroken && it.stats) {
        addStatMap(it.stats);
      }
      const runeId = state.equipmentRunes && state.equipmentRunes[slot];
      const runeIt = runeId ? ART.ARTIFACTS[runeId] : null;
      if (runeIt && runeIt.runeStats) {
        addStatMap(runeIt.runeStats);
      }
    });

    // 3. Active Mount
    if (state.mounts && state.mounts.active) {
      const m = ART.MOUNTS.find((x) => x.id === state.mounts.active);
      if (m && m.stats) addStatMap(m.stats);
    }

    // 4. Active Red Pet + Socketed Pet Crystal
    if (state.pets && state.pets.active) {
      const p = ART.PETS.find((x) => x.id === state.pets.active);
      if (p) {
        s.atk += p.bonusAtk || 0;
        s.crit += p.bonusCrit || 0;
        const cId = state.pets.crystals && state.pets.crystals[p.id];
        const cObj = ART.PET_CRYSTALS.find((c) => c.id === cId);
        if (cObj) {
          s.atk += cObj.bonusAtk || 0;
          s.def += cObj.bonusDef || 0;
          s.vit += cObj.bonusVit || 0;
          s.wis += cObj.bonusWis || 0;
          s.crit += cObj.bonusCrit || 0;
        }
      }
    }

    // 5. Active Disciple from Academy (Ученик)
    if (state.disciples && state.disciples.active) {
      const dObj = ART.DISCIPLES.find((d) => d.id === state.disciples.active);
      const dLvl =
        (state.disciples.levels && state.disciples.levels[state.disciples.active]) || 0;
      if (dObj && dLvl > 0) {
        addStatMap(dObj.baseStats, dLvl);
      }
    }

    // 6. Unlocked Medals
    ART.MEDALS.forEach((med) => {
      if (checkMedalUnlocked(med.id) && med.stats) {
        addStatMap(med.stats);
      }
    });

    // 7. 10 Faction Reputations (500 / 1000 / 2000 / 3000 tiers)
    ART.REPUTATIONS.forEach((rep) => {
      const pts = (state.reputations && state.reputations[rep.id]) || 0;
      const tierCount = pts >= 3000 ? 4 : pts >= 2000 ? 3 : pts >= 1000 ? 2 : pts >= 500 ? 1 : 0;
      if (tierCount > 0 && rep.statsPerTier) {
        addStatMap(rep.statsPerTier, tierCount);
      }
    });

    // 8. 9 Professions Passive Bonuses
    ART.PROFESSIONS.forEach((pr) => {
      const pLvl = (state.professions && state.professions[pr.id] && state.professions[pr.id].level) || 1;
      if (pLvl > 0 && pr.statBonus) {
        addStatMap(pr.statBonus, pLvl);
      }
    });

    // 9. 6 Estate Buildings Passive Bonuses
    const bMap = (state.estate && state.estate.buildings) || state.estate || {};
    ART.ESTATE_BUILDINGS.forEach((b) => {
      const bLvl = typeof bMap[b.id] === 'number' ? bMap[b.id] : (state.estate && state.estate[b.id]) || 1;
      if (bLvl > 0 && b.statsPerLevel) {
        addStatMap(b.statsPerLevel, bLvl);
      }
    });

    // 10. 5 Clan Talents Passive Bonuses
    ART.CLAN_TALENTS.forEach((t) => {
      const tLvl = (state.clanTalents && state.clanTalents[t.id]) || 0;
      if (tLvl > 0 && t.statsPerLevel) {
        addStatMap(t.statsPerLevel, tLvl);
      }
    });

    // 11. Completed Card Decks Passive Bonuses
    ART.CARD_DECKS.forEach((dk) => {
      const dState = state.decks && state.decks[dk.id];
      const unlocked = state.cardDecks && state.cardDecks.unlocked && state.cardDecks.unlocked[dk.id];
      if ((unlocked || (dState && (dState.cards >= dk.totalCards || dState.claims > 0))) && dk.bonusStats) {
        addStatMap(dk.bonusStats);
      }
    });

    // 12. Valor Military Rank Bonus
    const vInfo = ART.getValorRank(h.valor || 0);
    s.atk += vInfo.bonusAtk || 0;
    s.def += vInfo.bonusDef || 0;

    // 13. Combat Style Modifiers (Titán, Destructor, Sombra)
    const style = ART.COMBAT_STYLES[h.combatStyle || 'titan'] || ART.COMBAT_STYLES.titan;
    if (style.agiBonus) s.agi += style.agiBonus;
    if (style.critBonus) s.crit += style.critBonus;
    if (style.dodgeBonus) s.dodge += style.dodgeBonus;
    if (style.armorPen) s.armorPen += style.armorPen;
    if (style.blockMitigationBonus) s.blockBonus += style.blockMitigationBonus;
    s.bonusHp += style.hpBonus || 0;

    s.atk += Math.round(s.str * 1.85);
    s.def += Math.round(s.vit * 1.35 + s.agi * 0.4);
    s.atk = Math.round(s.atk * (style.atkMult || 1.0));
    s.def = Math.round(s.def * (style.defMult || 1.0));

    // Apply Injury Penalty if wounded
    if (h.injury && h.injury.penaltyPct) {
      const mult = Math.max(0.5, 1 - h.injury.penaltyPct / 100);
      s.atk = Math.round(s.atk * mult);
      s.def = Math.round(s.def * mult);
    }

    s.crit = Math.min(78, s.crit + Math.round(s.agi * 0.65));
    s.dodge = Math.min(60, s.dodge + Math.round(s.agi * 0.35));
    s.maxHp = 120 + h.level * 28 + s.vit * 11 + s.bonusHp;
    s.maxMp = 60 + h.level * 14 + s.wis * 9 + s.bonusMp;

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
      state.hero.hp = Math.max(0, Math.min(state.hero.hp, d.maxHp));
      state.hero.mp = Math.max(0, Math.min(state.hero.mp, d.maxMp));
    }
  }

  /* ------------------------------------------------------------------------
     INVENTORY, XP (WITH 33.33%/66.66% MILESTONES & ANTI-XP) & REPUTATION
     ------------------------------------------------------------------------ */
  function getItemQty(itemId) {
    const found = state.inventory.find((x) => x.itemId === itemId);
    return found ? found.qty : 0;
  }

  function addItem(itemId, qty = 1) {
    if (!ART.ARTIFACTS[itemId] || qty <= 0) return;
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

  function addReputationPoints(repId, pts) {
    if (!state.reputations) state.reputations = {};
    const cur = state.reputations[repId] || 0;
    const next = Math.min(3000, cur + pts);
    state.reputations[repId] = next;
    if (repId === 'katala_tahur' || repId === 'katala') {
      state.reputations.katala_tahur = next;
      state.reputations.katala = next;
    }
  }

  function grantXp(amount) {
    if (amount <= 0) return;
    const isAntiXp =
      Boolean(state.hero.antiXp) ||
      Boolean(state.hero.antiXpActive) ||
      Boolean(state.equipment && state.equipment.ring === 'anillo_anti_xp');
    if (isAntiXp) {
      CHAT.addSystemMessage(
        `💍 [Антиопыт Activo] Experiencia congelada (0 XP). Conservas el 100% del Oro, Valor, Reputación y Botín.`
      );
      return;
    }

    if (!state.hero.xpMilestones || state.hero.xpMilestones.level !== state.hero.level) {
      state.hero.xpMilestones = { level: state.hero.level, m33: false, m66: false };
    }

    state.hero.xp += amount;

    // Check 33.33% and 66.66% sub-level XP thresholds within current level
    const xpRatio = state.hero.xp / Math.max(1, state.hero.xpNext);
    if (xpRatio >= 1 / 3 && !state.hero.xpMilestones.m33) {
      state.hero.xpMilestones.m33 = true;
      const bonus33 = 150 * state.hero.level;
      state.hero.copper += bonus33;
      CHAT.addSystemMessage(
        `⭐ ¡Hito 33.33% de Experiencia alcanzado! Recibes una recompensa de +${ART.formatCurrencyBadge(bonus33)}.`
      );
    }
    if (xpRatio >= 2 / 3 && !state.hero.xpMilestones.m66) {
      state.hero.xpMilestones.m66 = true;
      const bonus66 = 300 * state.hero.level;
      state.hero.copper += bonus66;
      CHAT.addSystemMessage(
        `🌟 ¡Hito 66.66% de Experiencia alcanzado! Recibes una recompensa de +${ART.formatCurrencyBadge(bonus66)}.`
      );
    }

    while (state.hero.xp >= state.hero.xpNext) {
      state.hero.xp -= state.hero.xpNext;
      state.hero.level += 1;
      state.hero.xpNext = Math.round(state.hero.xpNext * 1.42);
      state.hero.unspentPoints += 3;
      state.hero.xpMilestones = { level: state.hero.level, m33: false, m66: false };
      recalcVitals(true);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `¡ASCENSO SOLAR! Has alcanzado el Nivel ${state.hero.level}. Salud y Maná restaurados al 100% (+3 puntos de atributo).`
      );
    }
  }

  function updateReadySuperBlow(cState) {
    if (!cState) return;
    const chain = cState.comboChain || [];
    if (chain.length === 2) {
      cState.readySuperBlow =
        ART.SUPER_BLOWS.find(
          (sb) => sb.sequence[0] === chain[0] && sb.sequence[1] === chain[1]
        ) || null;
    } else {
      cState.readySuperBlow = null;
    }
  }

  function degradeEquipmentDurability(onlyWeapon = false) {
    if (state.hero.unbreakable || state.hero.unbreakableBuff) return;
    const slots = onlyWeapon ? ['weapon'] : Object.keys(state.equipment);
    slots.forEach((slot) => {
      const itemId = state.equipment[slot];
      if (!itemId) return;
      const it = ART.ARTIFACTS[itemId];
      const maxDur = (it && it.maxDurability) || 60;
      const cur = getSlotCurDurability(slot);
      const next = Math.max(0, cur - 1);
      state.equipmentDurability[slot] = next;
    });
  }

  function resolveDiscipleId(discId) {
    if (!discId) return null;
    if (ART.DISCIPLES.some((d) => d.id === discId)) return discId;
    const map = {
      guerrero: 'discipulo_guerrero',
      mago: 'discipulo_mago',
      asesino: 'discipulo_asesino'
    };
    return map[discId] || null;
  }

  /* ------------------------------------------------------------------------
     COMPLETE GAMEPLAY ACTIONS API
     ------------------------------------------------------------------------ */
  const actions = {
    getItemQty,
    addItem,
    removeItem,
    checkMedalUnlocked,

    grantXp(amount) {
      grantXp(amount);
      saveState();
      renderAll();
    },

    switchCenterView(viewName) {
      state.ui.centerView = viewName;
      state.ui.activeView = viewName;
      if (viewName !== 'combat' && window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
        window.GDL_COMBAT_CANVAS.stopBattleLoop();
      }
      if (viewName !== 'hunting' && window.GDL_HUNTING_CANVAS) {
        window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
      }
      renderAll();
    },

    setFaction(factionId) {
      if (!ART.FACTIONS[factionId]) return false;
      state.hero.faction = factionId;
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `${ART.FACTIONS[factionId].icon} Te has alineado con la facción [${ART.FACTIONS[factionId].name}] (${ART.FACTIONS[factionId].capital}).`
      );
      saveState();
      renderAll();
      return true;
    },

    selectFaction(factionId) {
      return actions.setFaction(factionId);
    },

    switchFaction(factionId) {
      return actions.setFaction(factionId);
    },

    setCombatStyle(styleId) {
      if (!ART.COMBAT_STYLES[styleId]) return false;
      state.hero.combatStyle = styleId;
      recalcVitals(false);
      if (state.hero.hp < 1) state.hero.hp = 1;
      UI.AudioFX.strike();
      CHAT.addSystemMessage(
        `${ART.COMBAT_STYLES[styleId].icon} Has adoptado el Estilo de Combate [${ART.COMBAT_STYLES[styleId].name}].`
      );
      saveState();
      renderAll();
      return true;
    },

    selectCombatStyle(styleId) {
      return actions.setCombatStyle(styleId);
    },

    switchCombatStyle(styleId) {
      return actions.setCombatStyle(styleId);
    },

    toggleAntiXp(forceVal) {
      const next = typeof forceVal === 'boolean' ? forceVal : !state.hero.antiXp;
      state.hero.antiXp = next;
      state.hero.antiXpActive = next;
      UI.AudioFX.coin();
      CHAT.addSystemMessage(
        `💍 Anillo de Anti-Experiencia (Антиопыт): ${
          next ? 'ACTIVADO (0 XP, 100% Valor y Oro)' : 'DESACTIVADO (XP normal)'
        }.`
      );
      saveState();
      renderAll();
      return next;
    },

    setAntiXp(val) {
      return actions.toggleAntiXp(Boolean(val));
    },

    toggleUnbreakable(forceVal) {
      const next = typeof forceVal === 'boolean' ? forceVal : !state.hero.unbreakable;
      state.hero.unbreakable = next;
      state.hero.unbreakableBuff = next;
      UI.AudioFX.coin();
      CHAT.addSystemMessage(
        `🛡️ Aura Inquebrantable (Неслом): ${
          next ? 'ACTIVA (Tu equipo no pierde durabilidad en combate)' : 'DESACTIVADA'
        }.`
      );
      saveState();
      renderAll();
      return next;
    },

    setUnbreakable(val) {
      return actions.toggleUnbreakable(Boolean(val));
    },

    toggleUnbreakableBuff(forceVal) {
      return actions.toggleUnbreakable(forceVal);
    },

    cureInjury() {
      if (!state.hero.injury) {
        return false;
      }
      if (getItemQty('pergamino_sanador') > 0) {
        removeItem('pergamino_sanador', 1);
      }
      const oldName = state.hero.injury.name;
      state.hero.injury = null;
      recalcVitals(true);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🩹 ¡Herida curada! Te has recuperado por completo de [${oldName}].`);
      saveState();
      renderAll();
      return true;
    },

    healInjury() {
      return actions.cureInjury();
    },

    useEstateInfirmary() {
      state.hero.injury = null;
      recalcVitals(true);
      saveState();
      renderAll();
      return true;
    },

    travelTo(locationId) {
      const dest = ART.LOCATIONS.find((l) => l.id === locationId);
      if (!dest) return;
      if (state.hero.level < dest.minLevel) {
        CHAT.addSystemMessage(`Necesitas Nivel ${dest.minLevel} para viajar a ${dest.name}.`);
        return;
      }
      combatState = null;
      if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
        window.GDL_COMBAT_CANVAS.stopBattleLoop();
      }
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
      state.ui.activeView = 'location';
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

    inspectWarriorProfile(aiId) {
      state.ui.inspectedWarriorId = aiId;
      MODALS.openSpecialModal('profile', state, actions);
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

    unequipSlot(slot) {
      if (!slot || !state.equipment[slot]) return false;
      const itemId = state.equipment[slot];
      const it = ART.ARTIFACTS[itemId];
      state.equipment[slot] = null;
      addItem(itemId, 1);
      if (itemId === 'anillo_anti_xp') {
        state.hero.antiXp = false;
        state.hero.antiXpActive = false;
      }
      recalcVitals(false);
      UI.AudioFX.coin();
      CHAT.addSystemMessage(`📤 Desequipaste ${it ? it.name : itemId} de la ranura [${slot}].`);
      saveState();
      renderAll();
      return true;
    },

    unequipItem(slot) {
      return actions.unequipSlot(slot);
    },

    repairAllEquipment(targetSlot) {
      const slots = targetSlot && state.equipment[targetSlot] !== undefined ? [targetSlot] : Object.keys(state.equipment);
      slots.forEach((slot) => {
        const itemId = state.equipment[slot];
        if (!itemId) return;
        const it = ART.ARTIFACTS[itemId];
        const maxDur = (it && it.maxDurability) || 60;
        state.equipmentDurability[slot] = maxDur;
      });
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🔧 Taller de Korgan: Equipo reparado al 100% de durabilidad.`
      );
      saveState();
      renderAll();
      return true;
    },

    repairEquipment(slot) {
      return actions.repairAllEquipment(slot);
    },

    repairSlot(slot) {
      return actions.repairAllEquipment(slot);
    },

    socketRune(slot, runeId) {
      const targetSlot = slot || 'weapon';
      const rId = runeId || 'runa_mira';
      const runeIt = ART.ARTIFACTS[rId];
      if (!runeIt || !runeIt.runeStats) return false;
      if (getItemQty(rId) > 0) {
        removeItem(rId, 1);
      }
      if (!state.equipmentRunes) state.equipmentRunes = {};
      state.equipmentRunes[targetSlot] = rId;
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🔮 ¡Has engastado [${runeIt.name}] en tu ranura de ${targetSlot.toUpperCase()}!`);
      saveState();
      renderAll();
      return true;
    },

    applyRune(slot, runeId) {
      return actions.socketRune(slot, runeId);
    },

    engraveRune(slot, runeId) {
      return actions.socketRune(slot, runeId);
    },

    openLockedChest(chestId) {
      const cId = chestId || 'cofre_mitril';
      if (getItemQty(cId) <= 0) return false;
      if (getItemQty('llave_cerrajero') <= 0) {
        CHAT.addSystemMessage('Necesitas 1x Ganzúa Maestra de Cerrajero para abrir este cofre cerrado.');
        return false;
      }
      removeItem('llave_cerrajero', 1);
      removeItem(cId, 1);

      const goldBonus = cId === 'cofre_mitril' ? 850 : 420;
      state.hero.copper += goldBonus;
      state.hero.diamonds = (state.hero.diamonds || 0) + (cId === 'cofre_mitril' ? 4 : 2);
      const rewardPool = ['runa_mira', 'chispa_celestial', 'riolita', 'fragmento_eltico', 'panacea_solar'];
      const pick = rewardPool[Math.floor(Math.random() * rewardPool.length)];
      addItem(pick, 1);

      const cerProf = state.professions.cerrajero || { level: 1, xp: 0 };
      cerProf.xp += 25;
      if (cerProf.xp >= cerProf.level * 50) {
        cerProf.xp -= cerProf.level * 50;
        cerProf.level += 1;
      }
      state.professions.cerrajero = cerProf;

      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🧰 ¡Abriste [${ART.ARTIFACTS[cId].name}]! Obtuviste +${ART.formatCurrencyBadge(
          goldBonus
        )}, Diamantes y 1x ${ART.ARTIFACTS[pick].name}.`
      );
      saveState();
      renderAll();
      return true;
    },

    openChest(chestId) {
      return actions.openLockedChest(chestId);
    },

    assignBeltSlot(slotIdx, itemId) {
      const it = ART.ARTIFACTS[itemId];
      if (!it || it.slot !== 'consumable') return false;
      if (!Array.isArray(state.belt) || state.belt.length !== 6) {
        state.belt = [
          'elixir_vida_menor',
          'elixir_vida_mayor',
          'nectar_mana_astral',
          'panacea_solar',
          'pocion_furia_titan',
          'pergamino_piel_piedra'
        ];
      }
      const idx = Math.max(0, Math.min(5, Number(slotIdx) || 0));
      state.belt[idx] = itemId;
      state.combatBelt = state.belt;
      saveState();
      renderAll();
      return true;
    },

    setBeltSlot(slotIdx, itemId) {
      return actions.assignBeltSlot(slotIdx, itemId);
    },

    assignToBelt(itemId) {
      return actions.assignBeltSlot(0, itemId);
    },

    useItem(itemId) {
      const it = ART.ARTIFACTS[itemId];
      if (!it) return;

      if (it.slot === 'chest') {
        actions.openLockedChest(itemId);
        return;
      }

      if (it.slot === 'rune') {
        if (getItemQty(itemId) <= 0) return;
        actions.socketRune(state.ui.selectedSlot || 'weapon', itemId);
        return;
      }

      if (it.slot === 'consumable') {
        if (!removeItem(itemId, 1)) return;
        if (it.curesInjury) {
          state.hero.injury = null;
        }
        recalcVitals(false);
        if (it.healHp) state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + it.healHp);
        if (it.healMp) state.hero.mp = Math.min(state.hero.maxMp, state.hero.mp + it.healMp);
        if (combatState) {
          if (it.buffAtk) combatState.buffAtk = (combatState.buffAtk || 0) + it.buffAtk;
          if (it.buffDef) combatState.buffDef = (combatState.buffDef || 0) + it.buffDef;
          if (it.directEnemyDmg && combatState.enemy) {
            combatState.enemy.currentHp = Math.max(0, combatState.enemy.currentHp - it.directEnemyDmg);
            combatState.stats.dmgDealt += it.directEnemyDmg;
            window.GDL_COMBAT_CANVAS.triggerCombatEffect(
              'spell',
              `☄️ -${it.directEnemyDmg}`,
              'enemy',
              true
            );
          }
          combatState.log.unshift(`🧪 Usaste [${it.name}] desde tu cinturón de combate.`);
          if (combatState.enemy && combatState.enemy.currentHp <= 0) {
            handleVictory(combatState.enemy, combatState.isPvp);
            return;
          }
        }
        UI.AudioFX.coin();
        CHAT.addSystemMessage(`Usaste ${it.name}.`);
        saveState();
        renderAll();
        return;
      }

      if (state.equipment[it.slot] !== undefined) {
        if (it.minLevel && state.hero.level < it.minLevel) {
          CHAT.addSystemMessage(`Necesitas Nivel ${it.minLevel} para equipar ${it.name}.`);
          return;
        }
        if (!removeItem(itemId, 1)) return;
        const prev = state.equipment[it.slot];
        if (prev) addItem(prev, 1);
        state.equipment[it.slot] = itemId;
        const maxDur = it.maxDurability || 60;
        state.equipmentDurability[it.slot] = maxDur;
        if (itemId === 'anillo_anti_xp') {
          state.hero.antiXp = true;
          state.hero.antiXpActive = true;
        }
        recalcVitals(false);
        UI.AudioFX.strike();
        CHAT.addSystemMessage(`⚔️ Equipaste ${it.name} en [${it.slot}].`);
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

    /* ----------------------------------------------------------------------
       HUNTING MODE (FILTERS, AUTO-AGGRO, TOOL BONUSES & GUARDIAN AMBUSH)
       ---------------------------------------------------------------------- */
    setHuntingFilter(filter) {
      state.ui.huntingFilter = filter || 'all';
      if (window.GDL_HUNTING_CANVAS && window.GDL_HUNTING_CANVAS.setHuntingOptions) {
        window.GDL_HUNTING_CANVAS.setHuntingOptions({ filter: state.ui.huntingFilter });
      }
      saveState();
      renderAll();
    },

    toggleAutoAggro(forceVal) {
      const next = typeof forceVal === 'boolean' ? forceVal : !state.ui.autoAggro;
      state.ui.autoAggro = next;
      if (window.GDL_HUNTING_CANVAS && window.GDL_HUNTING_CANVAS.setHuntingOptions) {
        window.GDL_HUNTING_CANVAS.setHuntingOptions({ autoAggro: state.ui.autoAggro });
      }
      saveState();
      renderAll();
      return next;
    },

    setAutoAggro(val) {
      return actions.toggleAutoAggro(Boolean(val));
    },

    harvestNode(node) {
      state.world.harvestCount = (state.world.harvestCount || 0) + 1;
      const toolMap = {
        mineria: 'pico_maestro',
        herbolaria: 'hoz_herbolario',
        pesca: 'cana_pesca_runica'
      };
      const reqTool = toolMap[node.prof];
      const hasTool = reqTool && getItemQty(reqTool) > 0;

      const prof = state.professions[node.prof] || { level: 1, xp: 0 };
      const xpGain = hasTool ? 27 : 18;
      prof.xp += xpGain;
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
      const yieldQty = hasTool ? 2 : 1;
      addItem(rewardId, yieldQty);

      let bonusMsg = '';
      if (Math.random() < 0.25) {
        addItem('riolita', 1);
        bonusMsg = ' • ¡Emboscada de Guardián Élite superada: Gema de Riolita extra!';
      }

      grantXp(22 * (node.tier || 1));
      UI.AudioFX.coin();
      CHAT.addSystemMessage(
        `🏹 Modo Caza: Recolectaste ${yieldQty}x [${ART.ARTIFACTS[rewardId].name}] de ${node.name}${
          hasTool ? ' (Bono de Herramienta +1 y +50% XP)' : ''
        }${bonusMsg}.`
      );
      saveState();
      renderAll();
    },

    /* ----------------------------------------------------------------------
       3-ZONE TACTICAL COMBAT + STANCES + 6 SUPER-BLOWS + 4 SPELLS + MOROK
       ---------------------------------------------------------------------- */
    startCombat(creatureId) {
      const cr = ART.CREATURES.find((c) => c.id === creatureId);
      if (!cr) return false;
      recalcVitals(false);
      if (state.hero.hp < 25) state.hero.hp = Math.round(state.hero.maxHp * 0.5);

      const activeDiscObj = ART.DISCIPLES.find(
        (d) => d.id === (state.disciples && state.disciples.active)
      );

      combatState = {
        isPvp: false,
        turn: 1,
        stance: 'guardia_solar',
        attackZone: 'head',
        defendZone: 'torso',
        comboChain: [],
        readySuperBlow: null,
        buffAtk: 0,
        buffDef: 0,
        enemyBleedTurns: 0,
        enemyStunned: false,
        summonedMorok: null,
        activeDiscipleIcon: activeDiscObj ? activeDiscObj.icon : null,
        stats: {
          dmgDealt: 0,
          dmgTaken: 0,
          dmgMitigated: 0,
          crits: 0,
          superBlowsUsed: 0,
          spellsCast: 0,
          companionDmg: 0
        },
        enemy: {
          ...cr,
          maxHp: cr.hp,
          currentHp: cr.hp
        },
        log: [
          `⚔️ ¡Emboscada táctica contra ${cr.name} (Nivel ${cr.level})!`,
          `Elige tu Postura, Hechizos de Magia, Zona de Ataque y Bloqueo. Encadena 3 golpes para activar uno de los 6 Super-Golpes.`
        ]
      };
      state.ui.centerView = 'combat';
      state.ui.activeView = 'combat';
      UI.AudioFX.strike();
      renderAll();
      return true;
    },

    startPvpCombat(aiId) {
      const w = ART.AI_WARRIORS.find((x) => x.id === aiId);
      if (!w) return false;
      recalcVitals(false);
      if (state.hero.hp < 40) state.hero.hp = state.hero.maxHp;

      const activeDiscObj = ART.DISCIPLES.find(
        (d) => d.id === (state.disciples && state.disciples.active)
      );

      combatState = {
        isPvp: true,
        turn: 1,
        stance: 'guardia_solar',
        attackZone: 'head',
        defendZone: 'torso',
        comboChain: [],
        readySuperBlow: null,
        buffAtk: 0,
        buffDef: 0,
        enemyBleedTurns: 0,
        enemyStunned: false,
        summonedMorok: null,
        activeDiscipleIcon: activeDiscObj ? activeDiscObj.icon : null,
        stats: {
          dmgDealt: 0,
          dmgTaken: 0,
          dmgMitigated: 0,
          crits: 0,
          superBlowsUsed: 0,
          spellsCast: 0,
          companionDmg: 0
        },
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
          valorReward: 60 + w.level * 15,
          icon: w.faction === 'khair' ? '🌋' : '⚔️',
          isBoss: w.level >= 9,
          drops: ['fragmento_eltico', 'panacea_solar', 'chispa_celestial']
        },
        log: [
          `🏟️ ¡Duelo de Honor en el Coliseo PvP contra ${w.name} del Clan ${w.clan}!`
        ]
      };
      state.ui.centerView = 'combat';
      state.ui.activeView = 'combat';
      UI.AudioFX.superBlow();
      renderAll();
      return true;
    },

    setCombatStance(stanceId) {
      if (!combatState) return false;
      const st = ART.COMBAT_STANCES.find((s) => s.id === stanceId);
      if (!st) return false;
      combatState.stance = st.id;
      combatState.log.unshift(`${st.icon} Cambiaste a la postura [${st.name}]: ${st.desc}`);
      UI.AudioFX.coin();
      renderAll();
      return true;
    },

    selectCombatStance(stanceId) {
      return actions.setCombatStance(stanceId);
    },

    switchCombatStance(stanceId) {
      return actions.setCombatStance(stanceId);
    },

    castCombatSpell(spellId) {
      if (!combatState) return false;
      const sp = ART.MAGIC_SPELLS.find((s) => s.id === spellId);
      if (!sp) return false;
      if (state.hero.mp < sp.mpCost) {
        CHAT.addSystemMessage(`Maná insuficiente para lanzar ${sp.name} (${sp.mpCost} MP).`);
        return false;
      }

      state.hero.mp = Math.max(0, state.hero.mp - sp.mpCost);
      const d = computeDerivedStats();
      const en = combatState.enemy;
      combatState.stats.spellsCast += 1;

      if (sp.type === 'buff_heal') {
        const healAmt = Math.round(state.hero.maxHp * (sp.healPct || 0.25));
        state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + healAmt);
        combatState.buffDef = (combatState.buffDef || 0) + (sp.buffDef || 20);
        UI.AudioFX.fanfare();
        window.GDL_COMBAT_CANVAS.triggerCombatEffect('spell', `💠 +${healAmt} HP`, 'hero', true);
        combatState.log.unshift(
          `${sp.icon} Hechizo [${sp.name}]: Restauras +${healAmt} HP y ganas +${sp.buffDef} Defensa.`
        );
      } else {
        const spellPower = d.atk + d.wis * 1.6 + (combatState.buffAtk || 0);
        const dmg = Math.max(20, Math.round(spellPower * (sp.mult || 1.4) - en.def * 0.25));
        en.currentHp = Math.max(0, en.currentHp - dmg);
        combatState.stats.dmgDealt += dmg;
        if (sp.bleedTurns) combatState.enemyBleedTurns = Math.max(combatState.enemyBleedTurns, sp.bleedTurns);
        if (sp.buffAtk) combatState.buffAtk = (combatState.buffAtk || 0) + sp.buffAtk;

        if (sp.type === 'lifesteal') {
          const drain = Math.round(dmg * (sp.drainRatio || 0.5));
          state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + drain);
          combatState.log.unshift(
            `${sp.icon} Hechizo [${sp.name}]: Infliges ${dmg} de daño arcano y absorbes +${drain} HP.`
          );
        } else {
          combatState.log.unshift(
            `${sp.icon} Hechizo [${sp.name}]: Impacto mágico de ${dmg} daño sobre ${en.name}.`
          );
        }

        UI.AudioFX.superBlow();
        window.GDL_COMBAT_CANVAS.triggerCombatEffect('spell', `${sp.icon} -${dmg}`, 'enemy', true);

        if (en.currentHp <= 0) {
          handleVictory(en, combatState.isPvp);
          return true;
        }
      }

      saveState();
      renderAll();
      return true;
    },

    castSpell(spellId) {
      return actions.castCombatSpell(spellId);
    },

    useMagicSpell(spellId) {
      return actions.castCombatSpell(spellId);
    },

    summonMorokInCombat() {
      if (!combatState || combatState.summonedMorok) return false;
      const mountObj =
        ART.MOUNTS.find((m) => m.id === (state.mounts && state.mounts.active)) ||
        ART.MOUNTS.find((m) => m.id === 'ignifer') ||
        ART.MOUNTS[0];

      combatState.summonedMorok = {
        id: mountObj.id,
        name: mountObj.name,
        icon: mountObj.icon || '🔥',
        hp: mountObj.summonHp || 220,
        maxHp: mountObj.summonHp || 220,
        dmg: mountObj.summonDmg || 35
      };

      UI.AudioFX.fanfare();
      window.GDL_COMBAT_CANVAS.triggerCombatEffect(
        'super',
        `${combatState.summonedMorok.icon} ¡MOROK INVOCADO!`,
        'hero',
        true
      );
      combatState.log.unshift(
        `🔥 ¡Has invocado tu Morok/Montura [${combatState.summonedMorok.name}] (${combatState.summonedMorok.hp} HP)! Absorberá el 35% del daño enemigo y atacará en cada turno.`
      );
      saveState();
      renderAll();
      return true;
    },

    summonMorokOrMount() {
      return actions.summonMorokInCombat();
    },

    summonCombatCompanion() {
      return actions.summonMorokInCombat();
    },

    summonMorok() {
      return actions.summonMorokInCombat();
    },

    executeCombatTurn() {
      if (!combatState) return;
      const d = computeDerivedStats();
      const en = combatState.enemy;
      const zones = ['head', 'torso', 'legs'];
      const zoneNames = { head: 'Cabeza', torso: 'Torso', legs: 'Piernas' };
      const stanceObj =
        ART.COMBAT_STANCES.find((s) => s.id === combatState.stance) || ART.COMBAT_STANCES[0];

      // Degrade weapon durability slightly on combat strike unless Неслом is active
      degradeEquipmentDurability(true);

      const enemyAtkZone = zones[Math.floor(Math.random() * 3)];
      const enemyDefZone = zones[Math.floor(Math.random() * 3)];

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

      let mult = (activeSuper ? activeSuper.mult : 1.0) * (stanceObj.atkMod || 1.0);
      const heroAtk = d.atk + (combatState.buffAtk || 0);
      const armorPen = d.armorPen || 0;
      const effectiveEnemyDef =
        activeSuper && activeSuper.bonusEffect === 'armor_break'
          ? en.def * 0.2
          : en.def * Math.max(0.2, 0.52 - armorPen);

      let rawDmg = Math.max(14, heroAtk * mult - effectiveEnemyDef);

      const enemyBlocked =
        enemyDefZone === combatState.attackZone &&
        !(activeSuper && activeSuper.bonusEffect === 'armor_break');
      if (enemyBlocked) rawDmg *= 0.58;

      const totalCritChance = d.crit + (stanceObj.critBonus || 0);
      const isCrit = Math.random() * 100 < totalCritChance || Boolean(activeSuper);
      if (isCrit) combatState.stats.crits += 1;
      if (isCrit && !activeSuper) {
        const styleObj = ART.COMBAT_STYLES[state.hero.combatStyle || 'titan'];
        rawDmg *= 1.58 + ((styleObj && styleObj.critDmgBonus) || 0);
      }

      const finalDmg = Math.round(rawDmg);
      en.currentHp = Math.max(0, en.currentHp - finalDmg);
      combatState.stats.dmgDealt += finalDmg;

      if (activeSuper) {
        UI.AudioFX.superBlow();
        combatState.comboChain = [];
        combatState.readySuperBlow = null;
        combatState.stats.superBlowsUsed += 1;
        window.GDL_COMBAT_CANVAS.triggerCombatEffect(
          'super',
          `⚡ ¡${activeSuper.name.toUpperCase()}! -${finalDmg}`,
          'enemy',
          true
        );
        combatState.log.unshift(
          `🌟 ¡SUPER-GOLPE [${activeSuper.name}] en ${zoneNames[combatState.attackZone]}! Infliges ${finalDmg} de daño devastador.`
        );
        if (activeSuper.bonusEffect === 'bleed' || activeSuper.bonusEffect === 'bleed_lifesteal') {
          combatState.enemyBleedTurns = 2;
        }
        if (activeSuper.bonusEffect === 'stun') {
          combatState.enemyStunned = true;
        }
        if (activeSuper.bonusEffect === 'lifesteal' || activeSuper.bonusEffect === 'bleed_lifesteal') {
          const drain = Math.round(finalDmg * 0.35);
          state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + drain);
          combatState.log.unshift(`✨ Drenaje Astral restaura +${drain} HP.`);
        }
      } else {
        updateReadySuperBlow(combatState);
        UI.AudioFX.strike();
        window.GDL_COMBAT_CANVAS.triggerCombatEffect(
          'slash',
          isCrit ? `💥 CRÍTICO -${finalDmg}` : `-${finalDmg}`,
          'enemy',
          isCrit
        );
        combatState.log.unshift(
          `Turno ${combatState.turn} (${stanceObj.name}): Atacas a ${zoneNames[combatState.attackZone]} → ${finalDmg} daño${
            isCrit ? ' (¡Crítico!)' : ''
          }${enemyBlocked ? ' [Bloqueado]' : ''}.`
        );
      }

      // 1. Summoned Morok / Mount Attack
      if (combatState.summonedMorok && combatState.summonedMorok.hp > 0 && en.currentHp > 0) {
        const mDmg = combatState.summonedMorok.dmg;
        en.currentHp = Math.max(0, en.currentHp - mDmg);
        combatState.stats.companionDmg += mDmg;
        combatState.log.unshift(
          `${combatState.summonedMorok.icon} Tu Morok/Montura [${combatState.summonedMorok.name}] embiste por +${mDmg} daño.`
        );
      }

      // 2. Active Disciple Assist Attack (Ученик)
      if (state.disciples && state.disciples.active && en.currentHp > 0) {
        const disc = ART.DISCIPLES.find((x) => x.id === state.disciples.active);
        const dLvl =
          (state.disciples.levels && state.disciples.levels[state.disciples.active]) || 0;
        if (disc && dLvl > 0) {
          const dDmg = disc.combatDmg + (dLvl - 1) * 8;
          en.currentHp = Math.max(0, en.currentHp - dDmg);
          combatState.stats.companionDmg += dDmg;
          combatState.log.unshift(
            `${disc.icon} Tu ${disc.name} (Nv.${dLvl}) golpea al enemigo por +${dDmg} daño.`
          );
        }
      }

      // 3. Active Fed Red Pet Assist Attack (Красный питомец)
      if (state.pets && state.pets.active && en.currentHp > 0) {
        const pet = ART.PETS.find((p) => p.id === state.pets.active);
        const isFed = state.pets.satiety === undefined ? true : state.pets.satiety > 0;
        if (pet && isFed) {
          const cId = state.pets.crystals && state.pets.crystals[pet.id];
          const cObj = ART.PET_CRYSTALS.find((c) => c.id === cId);
          const pDmg = pet.assistDmg + ((cObj && cObj.assistDmg) || 0);
          en.currentHp = Math.max(0, en.currentHp - pDmg);
          combatState.stats.companionDmg += pDmg;
          combatState.log.unshift(
            `${pet.icon} Tu Mascota Roja [${pet.name}] asiste con un ataque de +${pDmg} daño.`
          );
        }
      }

      // 4. Bleed DoT
      if (combatState.enemyBleedTurns > 0 && en.currentHp > 0) {
        const bleedDmg = 18 + state.hero.level * 4;
        en.currentHp = Math.max(0, en.currentHp - bleedDmg);
        combatState.stats.dmgDealt += bleedDmg;
        combatState.enemyBleedTurns -= 1;
        combatState.log.unshift(`☀️ Hemorragia Luminosa abrasa a ${en.name} por ${bleedDmg} daño.`);
      }

      // Check Victory
      if (en.currentHp <= 0) {
        handleVictory(en, combatState.isPvp);
        return;
      }

      // Enemy Counter-Attack
      const dodgeChance = Math.min(65, (d.dodge || 4) + (stanceObj.dodgeChance || 0));
      const heroDodged = Math.random() * 100 < dodgeChance;

      if (heroDodged) {
        combatState.stats.dmgMitigated += en.atk;
        window.GDL_COMBAT_CANVAS.triggerCombatEffect('slash', '💨 ¡ESQUIVADO!', 'hero', false);
        combatState.log.unshift(
          `💨 ¡Esquiva Sombría! Evitas por completo el golpe de ${en.name} a tu ${zoneNames[enemyAtkZone]}.`
        );
        if (stanceObj.counterBleed) {
          combatState.enemyBleedTurns = Math.max(combatState.enemyBleedTurns, 1);
        }
      } else {
        const heroDef = Math.round((d.def + (combatState.buffDef || 0)) * (stanceObj.defMod || 1.0));
        let enemyRaw = Math.max(8, en.atk - heroDef * 0.48);
        if (combatState.enemyStunned) {
          enemyRaw *= 0.6;
          combatState.enemyStunned = false;
        }

        const heroBlocked = combatState.defendZone === enemyAtkZone;
        if (heroBlocked) {
          const blockFactor = Math.max(0.22, (stanceObj.blockMod || 0.44) - (d.blockBonus || 0));
          combatState.stats.dmgMitigated += Math.round(enemyRaw * (1 - blockFactor));
          enemyRaw *= blockFactor;
        }

        if (combatState.summonedMorok && combatState.summonedMorok.hp > 0) {
          const absorbed = Math.round(enemyRaw * 0.35);
          enemyRaw -= absorbed;
          combatState.summonedMorok.hp = Math.max(0, combatState.summonedMorok.hp - absorbed);
          combatState.stats.dmgMitigated += absorbed;
        }

        const finalEnemyDmg = Math.max(4, Math.round(enemyRaw));
        state.hero.hp = Math.max(0, state.hero.hp - finalEnemyDmg);
        combatState.stats.dmgTaken += finalEnemyDmg;

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
      }

      if (state.hero.hp <= 0) {
        degradeEquipmentDurability(false);
        if (en.level >= 2) {
          state.hero.injury = {
            id: 'fractura_guerra',
            name: 'Fractura de Guerra (Trauma I)',
            severity: 2,
            penaltyPct: 15
          };
        }
        const info = {
          enemyName: en.name,
          result: 'DERROTA',
          turns: combatState.turn,
          damageDealt: combatState.stats.dmgDealt,
          damageTaken: combatState.stats.dmgTaken,
          ...combatState.stats,
          valorEarned: 0
        };
        state.lastFightInfo = info;
        state.world.lastFightInfo = info;
        state.world.lastFightStats = info;

        CHAT.addSystemMessage(
          `Has caído ante ${en.name}. ${
            state.hero.injury
              ? 'Sufriste una Fractura de Guerra (puedes curarla con 1 clic en el botón superior o en la Enfermería).'
              : ''
          }`
        );
        combatState = null;
        if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
          window.GDL_COMBAT_CANVAS.stopBattleLoop();
        }
        recalcVitals(true);
        state.ui.centerView = 'location';
        state.ui.activeView = 'location';
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
      if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
        window.GDL_COMBAT_CANVAS.stopBattleLoop();
      }
      state.ui.centerView = 'location';
      state.ui.activeView = 'location';
      renderAll();
    },

    /* ----------------------------------------------------------------------
       QUESTS, ELTIC CUBE & 9 PROFESSIONS + CRAFTING WORKSHOP
       ---------------------------------------------------------------------- */
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
      if (!rec) return false;
      if (state.hero.copper < rec.copperCost) {
        CHAT.addSystemMessage('No tienes suficientes monedas para activar el Cubo Éltico.');
        return false;
      }
      for (const ing of rec.ingredients) {
        if (getItemQty(ing.itemId) < ing.qty) {
          CHAT.addSystemMessage('Te faltan ingredientes para esta transmutación en el Cubo Éltico.');
          return false;
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
      return true;
    },

    trainProfession(profId) {
      if (state.hero.copper < 120) {
        CHAT.addSystemMessage('Necesitas 1p 20c para financiar materiales de práctica.');
        return false;
      }
      state.hero.copper -= 120;
      const p = state.professions[profId] || { level: 1, xp: 0 };
      p.xp += 25;
      if (p.xp >= p.level * 50) {
        p.xp -= p.level * 50;
        p.level += 1;
        UI.AudioFX.fanfare();
        CHAT.addSystemMessage(`⚒️ ¡Maestría! Tu profesión [${profId.toUpperCase()}] subió a Nivel ${p.level}.`);
      } else {
        UI.AudioFX.coin();
      }
      state.professions[profId] = p;
      recalcVitals(false);
      saveState();
      renderAll();
      return true;
    },

    craftRecipe(recipeId) {
      const rec = ART.CRAFT_RECIPES.find((r) => r.id === recipeId);
      if (!rec) return false;
      if (state.hero.copper < (rec.copperCost || 0)) {
        CHAT.addSystemMessage('Monedas insuficientes para costear el taller de artesanía.');
        return false;
      }
      for (const ing of rec.ingredients) {
        if (getItemQty(ing.itemId) < ing.qty) {
          CHAT.addSystemMessage(`Te faltan materiales (${ART.ARTIFACTS[ing.itemId].name}) para fabricar esta receta.`);
          return false;
        }
      }

      state.hero.copper -= rec.copperCost || 0;
      rec.ingredients.forEach((ing) => removeItem(ing.itemId, ing.qty));
      addItem(rec.resultId, rec.resultQty);

      const profData = (state.professions && state.professions[rec.prof]) || { level: 1, xp: 0 };
      profData.xp += 35;
      if (profData.xp >= profData.level * 50) {
        profData.xp -= profData.level * 50;
        profData.level += 1;
      }
      state.professions[rec.prof] = profData;

      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `⚒️ ¡Taller de Artesanía! Fabricaste ${rec.resultQty}x [${ART.ARTIFACTS[rec.resultId].name}].`
      );
      saveState();
      renderAll();
      return true;
    },

    craftItem(recipeId) {
      return actions.craftRecipe(recipeId);
    },

    executeCraft(recipeId) {
      return actions.craftRecipe(recipeId);
    },

    /* ----------------------------------------------------------------------
       MOUNTS, RED PETS (FEED & CRYSTALS) & DISCIPLES ACADEMY (УЧЕНИКИ)
       ---------------------------------------------------------------------- */
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
        CHAT.addSystemMessage(`🦅 ¡[${p.name}] se ha unido a ti como Mascota Roja de combate!`);
      } else {
        state.pets.active = state.pets.active === petId ? null : petId;
        UI.AudioFX.coin();
      }
      recalcVitals(false);
      saveState();
      renderAll();
    },

    feedPet() {
      if (getItemQty('pienso_astral') > 0) {
        removeItem('pienso_astral', 1);
      } else if (state.hero.copper >= 80) {
        state.hero.copper -= 80;
      } else {
        return false;
      }
      state.pets.satiety = (state.pets.satiety || 0) + 5;
      addReputationPoints('patronos_mascotas', 50);
      recalcVitals(false);
      UI.AudioFX.coin();
      CHAT.addSystemMessage(`🍖 Alimentaste a tus Mascotas Rojas (+5 raciones de energía, +50 Reputación Patronos).`);
      saveState();
      renderAll();
      return true;
    },

    feedActivePet() {
      return actions.feedPet();
    },

    socketPetCrystal(petId, crystalId) {
      const pId = petId || state.pets.active || 'halcon_alba';
      let cId = crystalId;
      if (!cId) {
        const ownedCrystal = ['cristal_celeste', 'cristal_carmesi', 'cristal_viejo_ogro'].find(
          (id) => getItemQty(id) > 0
        );
        cId = ownedCrystal || 'cristal_viejo_ogro';
      }
      const cObj = ART.PET_CRYSTALS.find((c) => c.id === cId);
      if (!cObj) return false;
      if (getItemQty(cId) > 0) {
        removeItem(cId, 1);
      } else if (state.hero.copper >= 200) {
        state.hero.copper -= 200;
      } else {
        return false;
      }
      if (!state.pets.crystals) state.pets.crystals = {};
      state.pets.crystals[pId] = cId;
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🟢 ¡Engastaste [${cObj.name}] en tu Mascota Roja [${pId}]!`
      );
      saveState();
      renderAll();
      return true;
    },

    upgradeRedPet(petId, crystalId) {
      return actions.socketPetCrystal(petId, crystalId);
    },

    recruitOrTrainDisciple(discId) {
      const resolvedId = resolveDiscipleId(discId);
      const d = ART.DISCIPLES.find((x) => x.id === resolvedId);
      if (!d) return false;
      if (state.hero.copper < d.recruitCost) {
        CHAT.addSystemMessage(`Necesitas ${d.recruitCost}c para entrenar a ${d.name}.`);
        return false;
      }
      state.hero.copper -= d.recruitCost;
      if (!state.disciples) state.disciples = { levels: {}, active: d.id };
      if (!state.disciples.levels) state.disciples.levels = {};
      state.disciples.levels[d.id] = (state.disciples.levels[d.id] || 0) + 1;
      state.disciples.active = d.id;
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🎓 Academia de Discípulos: [${d.name}] ha alcanzado el Nivel ${state.disciples.levels[d.id]} y te acompaña en combate.`
      );
      saveState();
      renderAll();
      return true;
    },

    trainDisciple(discId) {
      return actions.recruitOrTrainDisciple(discId);
    },

    recruitDisciple(discId) {
      return actions.recruitOrTrainDisciple(discId);
    },

    setActiveDisciple(discId) {
      const resolvedId = resolveDiscipleId(discId);
      if (!resolvedId) return false;
      state.disciples.active = resolvedId;
      recalcVitals(false);
      UI.AudioFX.coin();
      saveState();
      renderAll();
      return true;
    },

    /* ----------------------------------------------------------------------
       REPUTATIONS, MAGIC MIRROR & TAVERN (DICE TRIPLE SOLAR + ARCOMAGE CARDS)
       ---------------------------------------------------------------------- */
    donateReputation(repId) {
      const rep = ART.REPUTATIONS.find((r) => r.id === repId);
      if (!rep) return false;
      const itemKey = rep.trophyItem || rep.turnInItem;
      if (itemKey && getItemQty(itemKey) > 0) {
        removeItem(itemKey, 1);
      } else if (getItemQty('chispa_celestial') > 0) {
        removeItem('chispa_celestial', 1);
      } else if (state.hero.copper >= 150) {
        state.hero.copper -= 150;
      } else {
        CHAT.addSystemMessage('Necesitas el trofeo de facción, una Chispa Celestial o 1p 50c para ofrendar.');
        return false;
      }

      addReputationPoints(rep.id, 150);
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🎖️ ¡Reputación [${rep.name}] incrementada a ${state.reputations[rep.id]} / 3000 pts!`
      );
      saveState();
      renderAll();
      return true;
    },

    turnInReputationTrophy(repId) {
      return actions.donateReputation(repId);
    },

    addReputation(repId) {
      return actions.donateReputation(repId);
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

    playTavernDice(betCopper, forcedRoll = null) {
      if (state.hero.copper < betCopper) {
        return 'No tienes suficientes monedas en tu bolsa para cubrir esa apuesta.';
      }
      addReputationPoints('katala_tahur', 25);

      const d1 = forcedRoll ? forcedRoll[0] : 1 + Math.floor(Math.random() * 6);
      const d2 = forcedRoll ? forcedRoll[1] : 1 + Math.floor(Math.random() * 6);
      const d3 = forcedRoll ? forcedRoll[2] : 1 + Math.floor(Math.random() * 6);
      const b1 = 1 + Math.floor(Math.random() * 6);
      const b2 = 1 + Math.floor(Math.random() * 6);
      const b3 = 1 + Math.floor(Math.random() * 6);

      const pSum = d1 + d2 + d3;
      const bSum = b1 + b2 + b3;
      const isTriple = d1 === d2 && d2 === d3;

      if (isTriple) {
        const winAmt = betCopper * 3;
        state.hero.copper += winAmt;
        addItem('fragmento_eltico', 1);
        addItem('chispa_celestial', 1);
        recalcVitals(false);
        UI.AudioFX.fanfare();
        CHAT.addSystemMessage(
          `🎲 ¡TRIPLE SOLAR [${d1}-${d2}-${d3}]! Ganaste el triple (+${ART.formatCurrencyBadge(
            winAmt
          )}), 1x Fragmento Éltico, 1x Chispa Celestial y +25 Reputación de Tahúr (Катала).`
        );
        saveState();
        renderAll();
        return `🎲 ¡VICTORIA POR TRIPLE SOLAR [${d1}, ${d2}, ${d3}]! <br/><span style="color:var(--gold-bright)">¡PREMIO SUPREMO 3X! Ganaste +${ART.formatCurrencyBadge(
          winAmt
        )} + 1x Fragmento Éltico + +25 Reputación de Tahúr (Катала).</span>`;
      } else if (pSum > bSum) {
        const winAmt = betCopper;
        state.hero.copper += winAmt;
        recalcVitals(false);
        UI.AudioFX.fanfare();
        saveState();
        renderAll();
        return `🎲 Tus dados: [${d1}, ${d2}, ${d3}] = <strong>${pSum}</strong> vs Balthus: [${b1}, ${b2}, ${b3}] = <strong>${bSum}</strong>.<br/><span style="color:var(--xp-bright)">¡VICTORIA! Ganaste +${ART.formatCurrencyBadge(
          winAmt
        )} y +25 Reputación de Tahúr (Катала).</span>`;
      } else if (pSum === bSum) {
        recalcVitals(false);
        UI.AudioFX.coin();
        saveState();
        renderAll();
        return `🎲 Empate a <strong>${pSum}</strong> ([${d1},${d2},${d3}] vs [${b1},${b2},${b3}]). Conservas tu apuesta (+25 Reputación de Tahúr / Катала).`;
      } else {
        state.hero.copper -= betCopper;
        recalcVitals(false);
        UI.AudioFX.strike();
        saveState();
        renderAll();
        return `🎲 Tus dados: [${d1}, ${d2}, ${d3}] = <strong>${pSum}</strong> vs Balthus: [${b1}, ${b2}, ${b3}] = <strong>${bSum}</strong>.<br/><span style="color:#ff8b82">Balthus gana la ronda (-${ART.formatCurrencyBadge(
          betCopper
        )}, pero sumas +25 Reputación de Tahúr / Катала).</span>`;
      }
    },

    playTavernCards(betCopper) {
      if (state.hero.copper < betCopper) {
        return 'No tienes suficientes monedas para apostar en las Cartas de Taberna (Arcomage).';
      }
      addReputationPoints('katala_tahur', 35);
      const heroPower = 12 + state.hero.level * 3 + Math.floor(Math.random() * 18);
      const balthusPower = 10 + Math.floor(Math.random() * 20);

      if (heroPower >= balthusPower) {
        state.hero.copper += betCopper;
        addItem('chispa_celestial', 1);
        recalcVitals(false);
        UI.AudioFX.fanfare();
        saveState();
        renderAll();
        return `🃏 Duelo de Cartas Arcomage: Tu Torre Solar (<strong>${heroPower} pts</strong>) derriba la Torre de Balthus (<strong>${balthusPower} pts</strong>).<br/><span style="color:var(--xp-bright)">¡VICTORIA! Ganaste +${ART.formatCurrencyBadge(
          betCopper
        )}, 1x Chispa Celestial y +35 Reputación de Tahúr (Катала).</span>`;
      } else {
        state.hero.copper -= betCopper;
        recalcVitals(false);
        UI.AudioFX.strike();
        saveState();
        renderAll();
        return `🃏 Duelo de Cartas Arcomage: Tu Torre (${heroPower}) cae ante Balthus (${balthusPower}). Pierdes ${ART.formatCurrencyBadge(
          betCopper
        )}, pero ganas +35 Reputación de Tahúr (Катала).`;
      }
    },

    playArcomage(betCopper) {
      return actions.playTavernCards(betCopper);
    },

    /* ----------------------------------------------------------------------
       BATTLEFIELDS (ПОЛЯ БИТВ), CLANS & CLAN TALENTS (КЛАНОВЫЕ ТАЛАНТЫ)
       ---------------------------------------------------------------------- */
    playBattlefield(bfId) {
      const resolvedId = bfId === 'cuevas_cristalinas_pvp' ? 'cuevas_cristalinas' : bfId;
      const bf = ART.BATTLEFIELDS.find((b) => b.id === resolvedId);
      if (!bf) return false;
      if (state.hero.level < (bf.minLevel || 1)) {
        CHAT.addSystemMessage(`Necesitas Nivel ${bf.minLevel} para participar en ${bf.name}.`);
        return false;
      }

      const bMap = (state.estate && state.estate.buildings) || state.estate || {};
      const obeliskLvl = bMap.obelisco_valor || 1;
      const valorMult = 1 + (obeliskLvl - 1) * 0.1;
      const earnedValor = Math.round(bf.valorReward * valorMult);

      state.hero.valor = (state.hero.valor || 0) + earnedValor;
      state.hero.trophyCoins = (state.hero.trophyCoins || 0) + bf.trophyReward;
      state.hero.copper += bf.copperReward;
      state.world.battlefieldWins = (state.world.battlefieldWins || 0) + 1;
      if (bf.repId) addReputationPoints(bf.repId, bf.repGain || 120);
      grantXp(80);

      recalcVitals(false);
      UI.AudioFX.fanfare();
      const msg = `🚩 ¡Victoria en [${bf.name}]! Entregaste los Cristales en el Altar y obtuviste +${earnedValor} Valor (Доблесть), +${bf.trophyReward} 🏅 Monedas Trofeo, +${ART.formatCurrencyBadge(
        bf.copperReward
      )} y +${bf.repGain} Reputación.`;
      CHAT.addSystemMessage(msg);
      saveState();
      renderAll();
      return msg;
    },

    runBattlefieldObjective(bfId, tactic) {
      return actions.playBattlefield(bfId, tactic);
    },

    enterBattlefield(bfId, tactic) {
      return actions.playBattlefield(bfId, tactic);
    },

    buyValorItem(itemId) {
      const entry = ART.VALOR_ARSENAL.find((e) => e.itemId === itemId);
      const it = ART.ARTIFACTS[itemId];
      if (!entry || !it) return false;
      if ((state.hero.trophyCoins || 0) < entry.trophyCost) {
        CHAT.addSystemMessage('No tienes suficientes Monedas Trofeo (🏅).');
        return false;
      }
      if ((state.hero.valor || 0) < entry.minValor) {
        CHAT.addSystemMessage(`Requiere al menos ${entry.minValor} puntos de Valor.`);
        return false;
      }
      state.hero.trophyCoins -= entry.trophyCost;
      addItem(itemId, 1);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🏅 Adquiriste [${it.name}] en el Arsenal de Campos de Batalla.`);
      saveState();
      renderAll();
      return true;
    },

    buyValorArsenalItem(itemId) {
      return actions.buyValorItem(itemId);
    },

    buyBattlefieldItem(itemId) {
      return actions.buyValorItem(itemId);
    },

    joinClan(clanName) {
      state.hero.clan = clanName;
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🛡️ Has jurado lealtad al Clan [${clanName}].`);
      saveState();
      renderAll();
    },

    upgradeClanTalent(talentId) {
      const t = ART.CLAN_TALENTS.find((x) => x.id === talentId);
      if (!t) return false;
      if (!state.clanTalents) state.clanTalents = {};
      const curLvl = state.clanTalents[talentId] || 0;
      if (curLvl >= t.maxLevel) return false;

      if (getItemQty('tratado_unidad_clan') > 0) {
        removeItem('tratado_unidad_clan', 1);
      } else if (state.hero.copper >= t.costCopper) {
        state.hero.copper -= t.costCopper;
      } else {
        CHAT.addSystemMessage('Necesitas 1x Tratado «Unidad del Clan» o monedas suficientes.');
        return false;
      }

      state.clanTalents[talentId] = curLvl + 1;
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `📘 ¡Talento del Clan [${t.name}] mejorado a Nivel ${state.clanTalents[talentId]}!`
      );
      saveState();
      renderAll();
      return true;
    },

    trainClanTalent(talentId) {
      return actions.upgradeClanTalent(talentId);
    },

    /* ----------------------------------------------------------------------
       INSTANCES & FAST-FARM GROTTO (ИНСТАНСЫ И ГРОТ)
       ---------------------------------------------------------------------- */
    runInstance(instanceId) {
      const inst = ART.INSTANCES.find((i) => i.id === instanceId);
      if (!inst) return false;
      if (state.hero.level < (inst.minLevel || 1)) {
        CHAT.addSystemMessage(`Necesitas Nivel ${inst.minLevel} para incursionar en ${inst.name}.`);
        return false;
      }

      if (!state.instances) state.instances = { totalClears: 0, cooldowns: {}, clearsById: {} };
      if (!state.instances.cooldowns) state.instances.cooldowns = {};
      if (!state.instances.clearsById) state.instances.clearsById = {};
      if (!state.world.instanceCooldowns) state.world.instanceCooldowns = {};
      if (!state.world.instanceClears) state.world.instanceClears = {};

      const now = Date.now();
      const cdUntil = state.instances.cooldowns[inst.id] || 0;
      if (cdUntil > now) {
        CHAT.addSystemMessage(`${inst.name} está en enfriamiento.`);
        return false;
      }

      const cdTime = now + (inst.cooldownSec || 60) * 1000;
      state.instances.cooldowns[inst.id] = cdTime;
      state.world.instanceCooldowns[inst.id] = cdTime;
      state.instances.totalClears = (state.instances.totalClears || 0) + 1;
      state.instances.clearsById[inst.id] = (state.instances.clearsById[inst.id] || 0) + 1;
      state.world.instanceClears[inst.id] = state.instances.clearsById[inst.id];

      state.hero.diamonds = (state.hero.diamonds || 0) + inst.diamondReward;
      state.hero.copper += inst.copperReward;

      const dropped = [];
      (inst.drops || []).forEach((itemId) => {
        addItem(itemId, 1);
        if (ART.ARTIFACTS[itemId]) dropped.push(ART.ARTIFACTS[itemId].name);
      });

      grantXp(inst.xpReward);
      UI.AudioFX.fanfare();
      const msg = `🕳️ ¡Incursión completada en [${inst.name}] (${inst.waves} oleadas)! Ganaste 💎 +${
        inst.diamondReward
      } Diamantes, +${ART.formatCurrencyBadge(inst.copperReward)} y Botín: ${dropped.join(', ')}.`;
      CHAT.addSystemMessage(msg);
      saveState();
      renderAll();
      return msg;
    },

    enterInstance(instanceId) {
      return actions.runInstance(instanceId);
    },

    clearInstance(instanceId) {
      return actions.runInstance(instanceId);
    },

    resetInstanceCooldown(instanceId) {
      if (state.hero.copper >= 100) state.hero.copper -= 100;
      if (state.instances && state.instances.cooldowns) {
        state.instances.cooldowns[instanceId] = 0;
      }
      if (state.world.instanceCooldowns) {
        state.world.instanceCooldowns[instanceId] = 0;
      }
      UI.AudioFX.coin();
      saveState();
      renderAll();
      return true;
    },

    /* ----------------------------------------------------------------------
       PLAYER ESTATE (ПОМЕСТЬЕ / HACIENDA) & COLLECTIBLE CARD DECKS (КОЛОДЫ)
       ---------------------------------------------------------------------- */
    upgradeEstateBuilding(buildingId) {
      const b = ART.ESTATE_BUILDINGS.find((x) => x.id === buildingId);
      if (!b) return false;
      if (!state.estate) state.estate = { riolite: 0, buildings: {} };
      if (!state.estate.buildings) state.estate.buildings = {};

      const curLvl =
        typeof state.estate.buildings[b.id] === 'number'
          ? state.estate.buildings[b.id]
          : state.estate[b.id] || 1;
      if (curLvl >= b.maxLevel) return false;

      const thLvl =
        typeof state.estate.buildings.ayuntamiento === 'number'
          ? state.estate.buildings.ayuntamiento
          : state.estate.ayuntamiento || 1;
      if (b.id !== 'ayuntamiento' && curLvl >= thLvl) {
        CHAT.addSystemMessage('Debes ampliar primero el Ayuntamiento Solar para elevar otros edificios.');
        return false;
      }

      const costCopper = b.baseCopper * curLvl;
      const hasRiolita = getItemQty('riolita') > 0 || (state.estate.riolite || 0) > 0;
      const hasCopper = state.hero.copper >= costCopper;

      if (!hasRiolita && !hasCopper) {
        CHAT.addSystemMessage('Necesitas 1x Bloque de Riolita o monedas suficientes para ampliar este edificio.');
        return false;
      }

      if (getItemQty('riolita') > 0) removeItem('riolita', 1);
      else if ((state.estate.riolite || 0) > 0) state.estate.riolite -= 1;
      if (state.hero.copper >= costCopper) state.hero.copper -= costCopper;

      const nextLvl = curLvl + 1;
      state.estate.buildings[b.id] = nextLvl;
      state.estate[b.id] = nextLvl;
      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🏛️ ¡Hacienda (Поместье)! Has ampliado [${b.name}] a Nivel ${nextLvl}.`
      );
      saveState();
      renderAll();
      return true;
    },

    buildEstate(buildingId) {
      return actions.upgradeEstateBuilding(buildingId);
    },

    collectEstateTribute() {
      const bMap = (state.estate && state.estate.buildings) || state.estate || {};
      const townHallLvl = bMap.ayuntamiento || 1;
      const tributeCopper = 220 * townHallLvl;
      state.hero.copper += tributeCopper;
      addItem('riolita', 1);
      UI.AudioFX.coin();
      CHAT.addSystemMessage(
        `🏛️ Recogiste el tributo de tu Hacienda: +${ART.formatCurrencyBadge(tributeCopper)} y 1x Bloque de Riolita.`
      );
      saveState();
      renderAll();
    },

    collectDeckCard(deckId) {
      const dk = ART.CARD_DECKS.find((d) => d.id === deckId);
      if (!dk) return false;
      if (state.hero.copper < 120) {
        CHAT.addSystemMessage('Necesitas 1p 20c para adquirir un sobre de cartas.');
        return false;
      }
      state.hero.copper -= 120;
      if (!state.decks[deckId]) state.decks[deckId] = { cards: 1, claims: 0 };
      state.decks[deckId].cards = Math.min(dk.totalCards, state.decks[deckId].cards + 1);
      recalcVitals(false);
      UI.AudioFX.coin();
      CHAT.addSystemMessage(
        `🃏 Añadiste una carta a [${dk.name}] (${state.decks[deckId].cards}/${dk.totalCards}).`
      );
      saveState();
      renderAll();
      return true;
    },

    activateCardDeck(deckId) {
      const dk = ART.CARD_DECKS.find((d) => d.id === deckId);
      if (!dk) return false;
      if (!state.cardDecks) state.cardDecks = { unlocked: {}, cooldowns: {} };
      if (!state.cardDecks.cooldowns) state.cardDecks.cooldowns = {};

      const now = Date.now();
      if (state.cardDecks.cooldowns[deckId] && state.cardDecks.cooldowns[deckId] > now) {
        CHAT.addSystemMessage(`La baraja ${dk.name} ya fue reclamada esta semana y está en enfriamiento.`);
        return false;
      }

      state.cardDecks.cooldowns[deckId] = now + 7 * 24 * 3600 * 1000;
      if (!state.decks[deckId]) state.decks[deckId] = { cards: dk.totalCards, claims: 0 };
      state.decks[deckId].cards = dk.totalCards;
      state.decks[deckId].claims = (state.decks[deckId].claims || 0) + 1;

      if (dk.grantsResourceBundle) {
        ['lingote_bronce', 'cuero_curtido', 'hoja_solar', 'cristal_luminita', 'riolita'].forEach((id) =>
          addItem(id, 3)
        );
        state.hero.copper += 300;
      }
      if (dk.diamondReward) state.hero.diamonds = (state.hero.diamonds || 0) + dk.diamondReward;
      if (dk.rubyReward) state.hero.rubies = (state.hero.rubies || 0) + dk.rubyReward;
      if (dk.valorReward) state.hero.valor = (state.hero.valor || 0) + dk.valorReward;
      if (dk.itemReward) addItem(dk.itemReward, dk.itemQty || 1);

      recalcVitals(false);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🃏 ¡Activaste [${dk.name}]! Recibiste: ${dk.rewardDesc}.`);
      saveState();
      renderAll();
      return true;
    },

    claimCardDeck(deckId) {
      return actions.activateCardDeck(deckId);
    },

    /* ----------------------------------------------------------------------
       FAIR OF WONDERS, WHEEL OF FORTUNE, DAILY FEATS, BANK & AUCTION
       ---------------------------------------------------------------------- */
    spinWheelOfFortune() {
      if ((state.hero.onlineTokens || 0) > 0) {
        state.hero.onlineTokens -= 1;
      } else if (state.hero.copper >= 200) {
        state.hero.copper -= 200;
      } else {
        return false;
      }

      const prizes = [
        { label: '💎 +6 Diamantes Imperiales', apply: () => { state.hero.diamonds = (state.hero.diamonds || 0) + 6; } },
        { label: '♦️ +3 Rubíes de Sangre Solar', apply: () => { state.hero.rubies = (state.hero.rubies || 0) + 3; } },
        { label: '🧰 1x Cofre de Mitril + 1x Ganzúa', apply: () => { addItem('cofre_mitril', 1); addItem('llave_cerrajero', 1); } },
        { label: '🔮 1x Runa Legendaria de Mira', apply: () => { addItem('runa_mira', 1); } },
        { label: '🪙 +650 Monedas de Cobre + 1x Chispa Celestial', apply: () => { state.hero.copper += 650; addItem('chispa_celestial', 1); } }
      ];
      const pick = prizes[Math.floor(Math.random() * prizes.length)];
      pick.apply();
      UI.AudioFX.fanfare();
      const msg = `🎡 ¡Rueda de la Fortuna (Колесо фортуны)! Ganaste: ${pick.label}.`;
      CHAT.addSystemMessage(msg);
      saveState();
      renderAll();
      return msg;
    },

    spinWheel() {
      return actions.spinWheelOfFortune();
    },

    claimDailyFeat(featId) {
      const ft = ART.DAILY_FEATS.find((f) => f.id === featId);
      if (!ft) return false;
      if (!ft.check(state)) return false;
      if (!state.world.claimedFeats) state.world.claimedFeats = {};
      if (state.world.claimedFeats[featId]) return false;

      state.world.claimedFeats[featId] = true;
      state.hero.copper += ft.rewardCopper;
      state.hero.diamonds = (state.hero.diamonds || 0) + ft.rewardDiamonds;
      state.hero.onlineTokens = (state.hero.onlineTokens || 0) + ft.rewardOnlineTokens;
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🌟 ¡Hazaña Diaria [${ft.title}] completada! +${ART.formatCurrencyBadge(
          ft.rewardCopper
        )}, +${ft.rewardDiamonds} 💎 y +${ft.rewardOnlineTokens} ⏳ Fichas Online.`
      );
      saveState();
      renderAll();
      return true;
    },

    completeDailyFeat(featId) {
      return actions.claimDailyFeat(featId);
    },

    buyFairItem(fairId) {
      const fi = ART.FAIR_ITEMS.find((x) => x.id === fairId);
      if (!fi) return false;
      const it = ART.ARTIFACTS[fi.itemId];
      if (!it) return false;
      const curBal = state.hero[fi.currency] || 0;
      if (curBal < fi.cost) {
        CHAT.addSystemMessage(`Saldo insuficiente de ${fi.currency} en la Feria de las Maravillas.`);
        return false;
      }
      state.hero[fi.currency] -= fi.cost;
      addItem(fi.itemId, 1);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(`🎪 Feria de las Maravillas: Adquiriste 1x [${it.name}].`);
      saveState();
      renderAll();
      return true;
    },

    purchaseFairItem(fairId) {
      return actions.buyFairItem(fairId);
    },

    depositBank(copperAmt) {
      const amt = Math.min(state.hero.copper, copperAmt || 300);
      if (amt <= 0) return false;
      state.hero.copper -= amt;
      if (!state.bank) state.bank = { depositedCopper: 0, luckyClaims: 0 };
      state.bank.depositedCopper = (state.bank.depositedCopper || 0) + amt;
      UI.AudioFX.coin();
      CHAT.addSystemMessage(`🏦 Depositaste ${ART.formatCurrencyBadge(amt)} en el Banco Imperial.`);
      saveState();
      renderAll();
      return true;
    },

    bankLuckyDeposit(copperAmt) {
      return actions.depositBank(copperAmt);
    },

    claimLuckyDeposit() {
      if (!state.bank) state.bank = { depositedCopper: 200, luckyClaims: 0 };
      const base = Math.max(200, state.bank.depositedCopper || 200);
      const interest = Math.round(base * 0.25);
      state.bank.depositedCopper += interest;
      state.bank.luckyClaims = (state.bank.luckyClaims || 0) + 1;
      state.hero.diamonds = (state.hero.diamonds || 0) + 2;
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🏦 ¡Depósito de la Suerte (Счастливый вклад)! Tu bóveda generó +${ART.formatCurrencyBadge(
          interest
        )} de interés y +2 💎 Diamantes.`
      );
      saveState();
      renderAll();
      return true;
    },

    claimBankDeposit() {
      return actions.claimLuckyDeposit();
    },

    withdrawBank() {
      if (!state.bank || !state.bank.depositedCopper) return false;
      const amt = state.bank.depositedCopper;
      state.bank.depositedCopper = 0;
      state.hero.copper += amt;
      UI.AudioFX.coin();
      CHAT.addSystemMessage(`🏦 Retiraste ${ART.formatCurrencyBadge(amt)} del Banco Imperial a tu bolsa.`);
      saveState();
      renderAll();
      return true;
    },

    buyAuctionListing(listingId) {
      const lst = ART.AUCTION_LISTINGS.find((x) => x.id === listingId);
      if (!lst) return false;
      if (state.hero.copper < lst.priceCopper) {
        CHAT.addSystemMessage('No tienes suficientes monedas para adquirir este lote en la Subasta.');
        return false;
      }
      state.hero.copper -= lst.priceCopper;
      if (!state.world.boughtAuctions) state.world.boughtAuctions = {};
      state.world.boughtAuctions[lst.id] = true;
      addItem(lst.itemId, lst.qty);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🔨 Casa de Subastas: Compraste ${lst.qty}x [${ART.ARTIFACTS[lst.itemId].name}] de ${lst.seller}.`
      );
      saveState();
      renderAll();
      return true;
    },

    bidAuction(listingId) {
      return actions.buyAuctionListing(listingId);
    },

    /* ----------------------------------------------------------------------
       PROFILE PROMOCODES, GIFTS & BALAGUR RIDDLES
       ---------------------------------------------------------------------- */
    redeemPromocode(rawCode) {
      const clean = String(rawCode || '')
        .trim()
        .toUpperCase();
      if (!clean) return false;
      const promo = ART.PROMOCODES[clean];
      if (!promo) return false;
      if (!Array.isArray(state.claimedPromocodes)) state.claimedPromocodes = [];
      if (state.claimedPromocodes.includes(clean)) return false;

      state.claimedPromocodes.push(clean);
      state.hero.copper += promo.copper || 0;
      state.hero.diamonds = (state.hero.diamonds || 0) + (promo.diamonds || 0);
      state.hero.rubies = (state.hero.rubies || 0) + (promo.rubies || 0);
      if (promo.arkonaRep) addReputationPoints('influencia_arkona', promo.arkonaRep);
      if (promo.grantUnbreakable) {
        state.hero.unbreakable = true;
        state.hero.unbreakableBuff = true;
      }
      (promo.items || []).forEach((it) => addItem(it.itemId, it.qty));

      recalcVitals(false);
      UI.AudioFX.fanfare();
      const msg = `🎟️ ¡Promocódigo [${clean}] canjeado! Recibiste: ${promo.title} (+${promo.diamonds} 💎, +${promo.rubies} ♦️, +${promo.arkonaRep} Influencia de Arkona y reliquias).`;
      CHAT.addSystemMessage(msg);
      saveState();
      renderAll();
      return msg;
    },

    claimPromocode(rawCode) {
      return actions.redeemPromocode(rawCode);
    },

    sendGiftToWarrior(aiId, giftId) {
      const w = ART.AI_WARRIORS.find((x) => x.id === aiId) || ART.AI_WARRIORS[0];
      const g = ART.GIFTS_CATALOG.find((x) => x.id === giftId) || ART.GIFTS_CATALOG[0];
      if (!g) return false;
      if (state.hero.copper < g.costCopper) {
        CHAT.addSystemMessage('No tienes suficientes monedas para enviar este regalo.');
        return false;
      }
      state.hero.copper -= g.costCopper;
      if (!Array.isArray(state.giftsReceived)) state.giftsReceived = [];
      state.giftsReceived.push({
        id: g.id,
        name: g.name,
        icon: g.icon,
        from: w ? w.name : 'Clan Solar'
      });
      addReputationPoints('influencia_arkona', 40);
      UI.AudioFX.fanfare();
      CHAT.addSystemMessage(
        `🎁 Enviaste [${g.icon} ${g.name}] a ${w ? w.name : 'tu aliado'} y recibiste un regalo recíproco en tu Perfil (+40 Influencia de Arkona).`
      );
      saveState();
      renderAll();
      return true;
    },

    sendGift(aiId, giftId) {
      return actions.sendGiftToWarrior(aiId, giftId);
    },

    giftWarrior(aiId, giftId) {
      return actions.sendGiftToWarrior(aiId, giftId);
    },

    answerBalagurRiddle(riddleId, optionIdx) {
      const r = ART.BALAGUR_RIDDLES.find((x) => x.id === riddleId);
      if (!r) return false;
      if (!state.world.solvedRiddles) state.world.solvedRiddles = {};
      if (state.world.solvedRiddles[riddleId]) return false;

      if (Number(optionIdx) === r.correctIndex) {
        state.world.solvedRiddles[riddleId] = true;
        state.hero.diamonds = (state.hero.diamonds || 0) + r.rewardDiamonds;
        state.hero.copper += r.rewardCopper;
        addReputationPoints('influencia_arkona', r.rewardArkona);
        recalcVitals(false);
        UI.AudioFX.fanfare();
        CHAT.addSystemMessage(
          `🎭 ¡Acertijo de Balagur resuelto! Ganaste 💎 +${r.rewardDiamonds} Diamantes, +${r.rewardArkona} Influencia de Arkona y +${ART.formatCurrencyBadge(
            r.rewardCopper
          )}.`
        );
        saveState();
        renderAll();
        return true;
      } else {
        UI.AudioFX.strike();
        CHAT.addSystemMessage('🎭 Respuesta incorrecta en el concurso de Balagur. ¡Inténtalo de nuevo!');
        return false;
      }
    },

    solveBalagurRiddle(riddleId, optionIdx) {
      return actions.answerBalagurRiddle(riddleId, optionIdx);
    },

    importSaveString(raw) {
      if (!raw) return false;
      try {
        const jsonStr = raw.startsWith('{') ? raw : decodeURIComponent(escape(atob(raw)));
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.hero && parsed.world) {
          state = normalizeLoadedState(parsed);
          recalcVitals(false);
          saveState();
          renderAll();
          CHAT.addSystemMessage('Crónica importada correctamente en el motor persistente (migración profunda completada).');
          return true;
        }
      } catch (e) {}
      CHAT.addSystemMessage('El código de partida no es válido.');
      return false;
    },

    resetSave() {
      state = createDefaultState();
      combatState = null;
      if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
        window.GDL_COMBAT_CANVAS.stopBattleLoop();
      }
      recalcVitals(true);
      saveState();
      renderAll();
      CHAT.addSystemMessage('Nueva partida iniciada en la Ciudadela de la Luz.');
    }
  };

  function handleVictory(en, isPvp) {
    UI.AudioFX.fanfare();
    degradeEquipmentDurability(false);

    state.hero.copper += en.copper;
    state.world.totalKills = (state.world.totalKills || 0) + 1;

    const bMap = (state.estate && state.estate.buildings) || state.estate || {};
    const obeliskLvl = bMap.obelisco_valor || 1;
    const baseValor = isPvp ? en.valorReward || 85 : en.isBoss ? 120 : en.isElite ? 45 : 15;
    const valorEarned = Math.round(baseValor * (1 + (obeliskLvl - 1) * 0.1));
    state.hero.valor = (state.hero.valor || 0) + valorEarned;

    if (isPvp) {
      state.world.pvpWins = (state.world.pvpWins || 0) + 1;
      state.world.pvpDefeated[en.id] = true;
      state.hero.trophyCoins = (state.hero.trophyCoins || 0) + 2;
      addReputationPoints('custodios_capital', 60);
    } else {
      const locId = en.loc || state.world.currentLocation;
      state.world.killsByLoc[locId] = (state.world.killsByLoc[locId] || 0) + 1;
      state.world.killsByCreature[en.id] = (state.world.killsByCreature[en.id] || 0) + 1;
      if (en.isBoss || en.isElite) {
        state.world.bossesDefeated[en.id] = true;
        addReputationPoints('buscadores_reliquias', 80);
      }
    }

    const droppedNames = [];
    (en.drops || []).forEach((itemId) => {
      if (en.isBoss || Math.random() < 0.62) {
        addItem(itemId, 1);
        if (ART.ARTIFACTS[itemId]) droppedNames.push(ART.ARTIFACTS[itemId].name);
      }
    });

    if (combatState && combatState.stats) {
      const info = {
        enemyName: en.name,
        result: 'VICTORIA',
        turns: combatState.turn,
        damageDealt: combatState.stats.dmgDealt,
        damageTaken: combatState.stats.dmgTaken,
        ...combatState.stats,
        valorEarned
      };
      state.lastFightInfo = info;
      state.world.lastFightInfo = info;
      state.world.lastFightStats = info;
    }

    CHAT.addSystemMessage(
      `🏆 ¡VICTORIA contra ${en.name}! +${en.xp} XP, +${valorEarned} Valor (Доблесть), +${en.copper}c${
        droppedNames.length ? ' • Botín: ' + droppedNames.join(', ') : ''
      }`
    );

    grantXp(en.xp);

    const defeatedMalakor = en.id === 'malakor_emperador_eclipse';
    combatState = null;
    if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
      window.GDL_COMBAT_CANVAS.stopBattleLoop();
    }
    state.ui.centerView = 'location';
    state.ui.activeView = 'location';
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

    document.querySelectorAll('[data-nav-view]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-nav-view') === state.ui.centerView);
    });

    const stageEl = document.getElementById('center-stage-container');
    if (stageEl) {
      if (state.ui.centerView === 'hunting') {
        VIEWS.renderHuntingView(stageEl, state, actions);
      } else if (state.ui.centerView === 'combat' && combatState) {
        VIEWS.renderCombatView(stageEl, state, combatState, actions);
      } else if (state.ui.centerView === 'atlas') {
        VIEWS.renderAtlasView(stageEl, state, actions);
      } else {
        state.ui.centerView = 'location';
        state.ui.activeView = 'location';
        VIEWS.renderLocationView(stageEl, state, actions);
      }
    }

    UI.renderRightDock(state, actions);
  }

  /* ------------------------------------------------------------------------
     BOOT APPLICATION
     ------------------------------------------------------------------------ */
  function boot() {
    loadState();

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

    document.querySelectorAll('[data-top-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.openSpecialModal(btn.getAttribute('data-top-modal'));
      });
    });

    document.querySelectorAll('[data-right-dock-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.rightTab = btn.getAttribute('data-right-dock-tab');
        UI.renderRightDock(state, actions);
      });
    });

    const facBadge = document.getElementById('hud-faction-badge');
    if (facBadge) {
      facBadge.addEventListener('click', () => {
        actions.setFaction(state.hero.faction === 'khair' ? 'ogriy' : 'khair');
      });
    }

    const antiXpBadge = document.getElementById('hud-antixp-badge');
    if (antiXpBadge) {
      antiXpBadge.addEventListener('click', () => actions.toggleAntiXp());
    }

    const unbreakBadge = document.getElementById('hud-unbreakable-badge');
    if (unbreakBadge) {
      unbreakBadge.addEventListener('click', () => actions.toggleUnbreakable());
    }

    const injBadge = document.getElementById('hud-injury-badge');
    if (injBadge) {
      injBadge.addEventListener('click', () => actions.cureInjury());
    }

    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        UI.AudioFX.muted = !UI.AudioFX.muted;
        audioBtn.textContent = UI.AudioFX.muted ? '🔇 Audio' : '🔊 Audio';
      });
    }

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

    const drawerBtn = document.getElementById('btn-toggle-systems-drawer');
    const drawerEl = document.getElementById('asteria-systems-drawer');
    if (drawerBtn && drawerEl) {
      drawerBtn.addEventListener('click', () => {
        const isCollapsed = drawerEl.classList.toggle('collapsed');
        drawerBtn.textContent = isCollapsed ? '✨ Sistemas de Asteria ▾' : '✨ Sistemas de Asteria ▴';
      });
      drawerEl.querySelectorAll('[data-top-modal]').forEach((b) => {
        b.addEventListener('click', () => {
          drawerEl.classList.add('collapsed');
          drawerBtn.textContent = '✨ Sistemas de Asteria ▾';
        });
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

  return {
    STORAGE_KEY,
    createDefaultState,
    deepMergeState,
    getState: () => state,
    getCombatState: () => combatState,
    computeDerivedStats,
    recalcVitals,
    saveState,
    loadState,
    renderAll,
    actions
  };
})();
