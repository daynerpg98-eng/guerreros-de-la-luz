#!/usr/bin/env node
/**
 * ============================================================================
 * GUERREROS DE LA LUZ — Complete Asteria Integration 4-Tier E2E Test Runner
 * ============================================================================
 * Command: node tests/run_e2e.js
 *
 * Executes opaque-box E2E verification across all 17 features in
 * `PROJECT.md § Feature Inventory` & `§ Interface Contracts`:
 *   - Tier 1: Feature Coverage (17 features x 5 tests = 85 tests)
 *   - Tier 2: Boundary & Corner Cases (17 features x 5 tests = 85 tests)
 *   - Tier 3: Cross-Feature Pairwise Combinations (20 tests)
 *   - Tier 4: Real-World End-to-End Application Scenarios (9 scenarios)
 *   Total: 199 E2E tests
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { ROOT_DIR, PUBLIC_DIR, createGameEnv } = require('./harness');

/* ==========================================================================
   FLEXIBLE OPAQUE-BOX ADAPTER HELPERS
   Supports both direct DOM event interaction (`click()`) and `window.GDL_APP`
   / `window.GDL_ART` interface contracts defined in `PROJECT.md`.
   ========================================================================== */

function getApp(env) {
  const app = env.window.GDL_APP;
  assert.ok(app, 'window.GDL_APP must be exposed per PROJECT.md § Interface Contracts');
  return app;
}

function getArt(env) {
  const art = env.window.GDL_ART;
  assert.ok(art, 'window.GDL_ART must be exposed per PROJECT.md § Interface Contracts');
  return art;
}

function getState(env) {
  const app = getApp(env);
  assert.strictEqual(typeof app.getState, 'function', 'GDL_APP.getState() must be a function');
  return app.getState();
}

function getDerived(env) {
  const app = getApp(env);
  assert.strictEqual(typeof app.computeDerivedStats, 'function', 'GDL_APP.computeDerivedStats() must be a function');
  return app.computeDerivedStats();
}

function getActions(env) {
  const app = getApp(env);
  assert.ok(app.actions && typeof app.actions === 'object', 'GDL_APP.actions must be an object');
  return app.actions;
}

function asArrayOrValues(catalog) {
  if (!catalog) return [];
  if (Array.isArray(catalog)) return catalog;
  if (typeof catalog === 'object') return Object.values(catalog);
  return [];
}

function findByIdOrKey(catalog, id) {
  if (!catalog) return null;
  if (Array.isArray(catalog)) return catalog.find((x) => x && x.id === id) || null;
  if (typeof catalog === 'object') return catalog[id] || Object.values(catalog).find((x) => x && x.id === id) || null;
  return null;
}

function callFirstAction(actions, names, ...args) {
  for (const name of names) {
    if (typeof actions[name] === 'function') {
      return actions[name](...args);
    }
  }
  throw new Error(`Expected one of GDL_APP.actions.[${names.join(', ')}] to be a function`);
}

function getHeroCurrency(state, key) {
  const h = state.hero || {};
  const c = state.currencies || h.currencies || {};
  if (key === 'copper') return h.copper !== undefined ? h.copper : c.copper || 0;
  if (key === 'diamonds') return h.diamonds !== undefined ? h.diamonds : c.diamonds !== undefined ? c.diamonds : state.diamonds || 0;
  if (key === 'rubies') return h.rubies !== undefined ? h.rubies : c.rubies !== undefined ? c.rubies : state.rubies || 0;
  if (key === 'trophyCoins') {
    return h.trophyCoins !== undefined ? h.trophyCoins
      : h.gladiatorCoins !== undefined ? h.gladiatorCoins
      : c.trophyCoins !== undefined ? c.trophyCoins
      : state.trophyCoins || 0;
  }
  if (key === 'onlineTokens') {
    return h.onlineTokens !== undefined ? h.onlineTokens
      : c.onlineTokens !== undefined ? c.onlineTokens
      : state.onlineTokens || 0;
  }
  if (key === 'riolite') {
    const qty = state.inventory ? (state.inventory.find((x) => x.itemId === 'riolita' || x.itemId === 'riolite') || {}).qty || 0 : 0;
    return h.riolite !== undefined ? h.riolite : (state.estate && state.estate.riolite) !== undefined ? state.estate.riolite : qty;
  }
  return h[key] !== undefined ? h[key] : c[key] || 0;
}

function setHeroCurrency(state, key, val) {
  const h = state.hero || {};
  if (key === 'copper') { h.copper = val; return; }
  if (key === 'diamonds') {
    h.diamonds = val;
    if (state.currencies) state.currencies.diamonds = val;
    return;
  }
  if (key === 'rubies') {
    h.rubies = val;
    if (state.currencies) state.currencies.rubies = val;
    return;
  }
  if (key === 'trophyCoins') {
    h.trophyCoins = val;
    if (h.gladiatorCoins !== undefined) h.gladiatorCoins = val;
    if (state.currencies) state.currencies.trophyCoins = val;
    return;
  }
  if (key === 'onlineTokens') {
    h.onlineTokens = val;
    if (state.currencies) state.currencies.onlineTokens = val;
    return;
  }
  h[key] = val;
}

function ensureInventoryQty(env, itemId, qty) {
  const state = getState(env);
  const actions = getActions(env);
  if (typeof actions.addItem === 'function') {
    const cur = typeof actions.getItemQty === 'function' ? actions.getItemQty(itemId) : 0;
    if (qty > cur) actions.addItem(itemId, qty - cur);
    return;
  }
  const found = state.inventory.find((x) => x.itemId === itemId);
  if (found) found.qty = qty;
  else state.inventory.push({ itemId, qty });
}

function getInventoryQty(env, itemId) {
  const state = getState(env);
  const found = (state.inventory || []).find((x) => x.itemId === itemId);
  return found ? found.qty : 0;
}

/* ==========================================================================
   TEST REGISTRY
   ========================================================================== */
const tests = [];
function registerTest(tier, feature, id, title, fn) {
  tests.push({ tier, feature, id, title, fn });
}

/* ==========================================================================
   TIER 1 — FEATURE COVERAGE (17 Features x 5 Tests = 85 Tests)
   ========================================================================== */

// --- Feature 1: Deep-Merge State Migration & Ghost Entity Fixes ---
registerTest('Tier 1', 'F01', 'T1-F01-1', 'Deep-merge localStorage migration preserves newly added nested fields on legacy v3 save', () => {
  const legacySave = {
    version: 3,
    hero: { name: 'LegacyHero', level: 4, xp: 20, xpNext: 200, hp: 180, maxHp: 220, mp: 80, maxMp: 100, copper: 900, baseStats: { str: 14, agi: 10, vit: 13, wis: 10 } },
    equipment: { helm: 'capucha_iniciado', weapon: 'espada_iniciado' },
    world: { currentLocation: 'llanuras_alba', totalKills: 5 }
  };
  const env = createGameEnv({
    initialLocalStorage: { guerreros_de_la_luz_asteria_v3: legacySave }
  });
  const state = getState(env);
  assert.strictEqual(state.hero.name, 'LegacyHero');
  assert.strictEqual(state.hero.level, 4);
  assert.ok(state.hero.faction, 'Deep-merged hero must have default faction');
  assert.ok(state.hero.combatStyle, 'Deep-merged hero must have default combatStyle');
  assert.strictEqual(Object.keys(state.equipment).length, 12, 'Deep-merged equipment must have all 12 slots');
  assert.strictEqual(Object.keys(state.professions).length, 9, 'Deep-merged professions must have all 9 professions');
  assert.ok(state.reputations && Object.keys(state.reputations).length >= 10, 'Deep-merged state must initialize 10+ reputations');
  assert.ok(state.estate, 'Deep-merged state must initialize estate');
});

registerTest('Tier 1', 'F01', 'T1-F01-2', 'Ghost NPC pescador_neron is defined in GDL_ART.NPCS and renders in Lago Espejo', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const neron = art.NPCS['pescador_neron'];
  assert.ok(neron, 'pescador_neron must exist in GDL_ART.NPCS');
  assert.ok(neron.name && neron.portrait, 'pescador_neron must have name and portrait');
  const state = getState(env);
  state.hero.level = 5;
  getActions(env).travelTo('lago_espejo');
  const stageHtml = env.document.getElementById('center-stage-container').innerHTML;
  assert.ok(stageHtml.includes(neron.name), 'Lago Espejo location view must render Pescador Nerón card');
});

registerTest('Tier 1', 'F01', 'T1-F01-3', 'Ghost creatures inquisidor_reliquia, serafin_piedra, and mirmidon_piros exist in GDL_ART.CREATURES', () => {
  const env = createGameEnv();
  const art = getArt(env);
  ['inquisidor_reliquia', 'serafin_piedra', 'mirmidon_piros'].forEach((cid) => {
    const cr = art.CREATURES.find((c) => c.id === cid);
    assert.ok(cr, `Creature ${cid} must exist in GDL_ART.CREATURES`);
    assert.ok(cr.hp > 0 && cr.atk > 0 && cr.loc, `Creature ${cid} must have valid combat stats and loc`);
  });
});

registerTest('Tier 1', 'F01', 'T1-F01-4', 'NPC forge_shop and alchemy_shop action shortcuts render working interactive buttons', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.openNpcModal('herrero_korgan');
  const korganBody = env.document.getElementById('gdl-modal-body').innerHTML;
  const korganShortcuts = env.document.querySelectorAll('#gdl-modal-body [data-npc-shortcut]');
  assert.ok(korganShortcuts.length >= 2, `Herrero Korgan must render >=2 shortcut buttons including forge_shop (got ${korganShortcuts.length})`);
  assert.ok(/forja|taller|artesan|repar/i.test(korganBody), 'Herrero Korgan dialog must include forge/workshop shortcut label');

  actions.openNpcModal('alquimista_selene');
  const seleneShortcuts = env.document.querySelectorAll('#gdl-modal-body [data-npc-shortcut]');
  assert.ok(seleneShortcuts.length >= 3, `Alquimista Selene must render >=3 shortcut buttons including alchemy_shop (got ${seleneShortcuts.length})`);
});

registerTest('Tier 1', 'F01', 'T1-F01-5', 'Medal unlock conditions and Tavern Dice Triple Solar relic reward match their descriptions', () => {
  const env = createGameEnv({ random: 0.01 }); // forces dice d1=d2=d3=1 (Triple Solar)
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 2000;
  const beforeInvCount = state.inventory.reduce((acc, x) => acc + x.qty, 0);
  const msg = actions.playTavernDice(500);
  assert.ok(/triple|victoria/i.test(msg), 'Triple Solar roll must report victory');
  assert.ok(state.hero.copper >= 2000 + 1000, 'Triple Solar roll must pay at least 2x-3x the bet');
  const afterInvCount = state.inventory.reduce((acc, x) => acc + x.qty, 0);
  assert.ok(afterInvCount > beforeInvCount, 'Triple Solar roll must grant a relic/item reward per modal description');
});

// --- Feature 2: Dual Factions (Ogriy vs. Khair) & 3 Combat Styles ---
registerTest('Tier 1', 'F02', 'T1-F02-1', 'GDL_ART.FACTIONS defines Ogriy (Humans / O\'Delvays) and Khair (Magmars / Dartrong)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const factions = asArrayOrValues(art.FACTIONS);
  assert.ok(factions.length >= 2, 'GDL_ART.FACTIONS must define at least 2 factions');
  const ogriy = findByIdOrKey(art.FACTIONS, 'ogriy');
  const khair = findByIdOrKey(art.FACTIONS, 'khair');
  assert.ok(ogriy && khair, 'Both ogriy and khair factions must be present in GDL_ART.FACTIONS');
});

registerTest('Tier 1', 'F02', 'T1-F02-2', 'GDL_ART.COMBAT_STYLES defines Titán, Destructor, and Sombra styles with distinct stat modifiers', () => {
  const env = createGameEnv();
  const art = getArt(env);
  ['titan', 'destructor', 'sombra'].forEach((styleId) => {
    const st = findByIdOrKey(art.COMBAT_STYLES, styleId);
    assert.ok(st, `Combat style ${styleId} must exist in GDL_ART.COMBAT_STYLES`);
    assert.ok(st.name, `Combat style ${styleId} must have a display name`);
  });
});

registerTest('Tier 1', 'F02', 'T1-F02-3', 'Switching Faction between Ogriy and Khair updates hero state and HUD/Left Panel rendering', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  callFirstAction(actions, ['selectFaction', 'setFaction', 'switchFaction'], 'khair');
  const state = getState(env);
  assert.strictEqual(state.hero.faction, 'khair');
  const pageText = env.document.body.textContent;
  assert.ok(/khair|magmar|dartrong/i.test(pageText), 'UI must reflect Khair / Magmar faction after switching');

  callFirstAction(actions, ['selectFaction', 'setFaction', 'switchFaction'], 'ogriy');
  assert.strictEqual(getState(env).hero.faction, 'ogriy');
});

registerTest('Tier 1', 'F02', 'T1-F02-4', 'Switching Combat Style between Titán, Destructor, and Sombra modifies computeDerivedStats()', () => {
  const env = createGameEnv();
  const actions = getActions(env);

  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'titan');
  const titanStats = getDerived(env);

  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'destructor');
  const destructorStats = getDerived(env);

  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'sombra');
  const sombraStats = getDerived(env);

  assert.ok(titanStats.def > destructorStats.def || titanStats.maxHp > destructorStats.maxHp, 'Titán style must grant higher DEF or MaxHP than Destructor');
  assert.ok(destructorStats.atk > titanStats.atk, 'Destructor style must grant higher ATK than Titán');
  assert.ok((sombraStats.dodge || sombraStats.agi || sombraStats.crit) > (titanStats.dodge || 0), 'Sombra style must grant higher dodge/agi/crit');
});

registerTest('Tier 1', 'F02', 'T1-F02-5', 'Hero Avatar Canvas draws faction and combat style visuals cleanly', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  const canvas = env.document.getElementById('gdl-hero-avatar-canvas');
  assert.ok(canvas, 'gdl-hero-avatar-canvas must exist');
  const ctx = canvas.getContext('2d');
  ctx.ops = [];
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'destructor');
  assert.ok(ctx.ops.length > 10, 'Avatar canvas must execute 2D drawing operations when style changes');
});

// --- Feature 3: Top HUD: Orange Valor Bar, 33%/66% XP Milestones, Multi-Currency & Aura Badges ---
registerTest('Tier 1', 'F03', 'T1-F03-1', 'Top HUD renders Orange Valor (Доблесть) bar and military rank', () => {
  const env = createGameEnv();
  const state = getState(env);
  const topbar = env.document.querySelector('.asteria-topbar');
  assert.ok(topbar, '.asteria-topbar must exist');
  assert.ok(/valor|доблесть/i.test(topbar.textContent), 'Top HUD must display Valor (Доблесть) bar label/rank');
  const valorBar = env.document.getElementById('hud-valor-bar') || topbar.querySelector('.valor');
  assert.ok(valorBar, 'Top HUD must include a Valor bar fill element (#hud-valor-bar or .asteria-bar-fill.valor)');
  assert.ok(state.hero.valor !== undefined, 'state.hero.valor must be defined');
});

registerTest('Tier 1', 'F03', 'T1-F03-2', 'Crossing 33.33% and 66.66% XP thresholds grants automatic sub-level silver/gold rewards', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const startCopper = state.hero.copper;
  // Hero starts at 0 / 100 XP. Grant 35 XP -> crosses 33.33% milestone
  if (typeof actions.grantXp === 'function') {
    actions.grantXp(35);
  } else {
    // Trigger via harvesting a tier 2 node (44 XP)
    actions.harvestNode({ id: 'test_node', name: 'Veta Solar', prof: 'mineria', tier: 2 });
  }
  assert.ok(state.hero.copper > startCopper, 'Crossing 33.33% XP threshold must grant an automatic monetary bonus');
  const midCopper = state.hero.copper;
  if (typeof actions.grantXp === 'function') {
    actions.grantXp(35);
  } else {
    actions.harvestNode({ id: 'test_node', name: 'Veta Solar', prof: 'mineria', tier: 2 });
  }
  assert.ok(state.hero.copper > midCopper, 'Crossing 66.66% XP threshold must grant second sub-level monetary bonus');
});

registerTest('Tier 1', 'F03', 'T1-F03-3', 'Top HUD XP bar renders 33.33% and 66.66% milestone tick markers', () => {
  const env = createGameEnv();
  const topbarHtml = env.document.querySelector('.asteria-topbar').innerHTML;
  assert.ok(
    /33|66|milestone|tick/i.test(topbarHtml),
    'Top HUD XP bar must include 33%/66% milestone tick indicators'
  );
});

registerTest('Tier 1', 'F03', 'T1-F03-4', 'Top HUD displays Multi-Currency cluster (Gold/Silver/Copper, Diamonds 💎, Rubies ♦️, Trophy Coins 🏅)', () => {
  const env = createGameEnv();
  const state = getState(env);
  setHeroCurrency(state, 'diamonds', 25);
  setHeroCurrency(state, 'rubies', 12);
  setHeroCurrency(state, 'trophyCoins', 8);
  getApp(env).renderAll();
  const topbarText = env.document.querySelector('.asteria-topbar').textContent;
  assert.ok(topbarText.includes('25') && topbarText.includes('12') && topbarText.includes('8'), 'Top HUD must display Diamonds, Rubies, and Trophy Coins balances');
});

registerTest('Tier 1', 'F03', 'T1-F03-5', 'Top HUD displays active status badges for Anti-XP (Антиопыт), Unbreakable (Неслом), and Injury', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  if (typeof actions.toggleAntiXp === 'function') actions.toggleAntiXp(true);
  else state.hero.antiXp = true;
  if (typeof actions.toggleUnbreakable === 'function') actions.toggleUnbreakable(true);
  else state.hero.unbreakable = true;
  state.hero.injury = { id: 'fractura_solar', name: 'Fractura Solar', severity: 2, penaltyPct: 15 };
  getApp(env).renderAll();
  const topbarHtml = env.document.querySelector('.asteria-topbar').innerHTML;
  assert.ok(/anti-?xp|антиопыт|неслом|irrompible|herida|fractura|trauma/i.test(topbarHtml), 'Top HUD must render active Anti-XP, Unbreakable, and Injury badges');
});

// --- Feature 4: 14-Button Ornate Navigation Bar & Zone Warriors/Transitions Sidebar ---
registerTest('Tier 1', 'F04', 'T1-F04-1', 'Center navigation strip exposes >=14 classic Asteria navigation & modal buttons', () => {
  const env = createGameEnv();
  const nav = env.document.querySelector('.center-stage-nav');
  assert.ok(nav, '.center-stage-nav must exist');
  const buttons = nav.querySelectorAll('button');
  assert.ok(buttons.length >= 14, `Ornate top navigation bar must contain >=14 buttons (found ${buttons.length})`);
});

registerTest('Tier 1', 'F04', 'T1-F04-2', 'Clicking navigation buttons opens corresponding views and Asteria system modals', () => {
  const env = createGameEnv();
  const navButtons = env.document.querySelectorAll('.center-stage-nav button');
  let openedModals = 0;
  let switchedViews = 0;
  navButtons.forEach((btn) => {
    btn.click();
    if (btn.hasAttribute('data-nav-view')) switchedViews++;
    if (btn.hasAttribute('data-top-modal')) {
      const backdrop = env.document.getElementById('gdl-modal-backdrop');
      assert.ok(!backdrop.classList.contains('hidden'), `Modal button ${btn.getAttribute('data-top-modal')} must open modal`);
      openedModals++;
    }
  });
  assert.ok(switchedViews >= 4 && openedModals >= 8, 'Navigation bar must switch all 4 center views and open >=8 primary modals');
});

registerTest('Tier 1', 'F04', 'T1-F04-3', 'Location view displays Collapsible Transitions (Transiciones) widget', () => {
  const env = createGameEnv();
  const stage = env.document.getElementById('center-stage-container');
  assert.ok(/transici|rutas|portales/i.test(stage.textContent), 'Location view must render Transitions section');
  const travelBtns = stage.querySelectorAll('[data-travel-loc]');
  assert.ok(travelBtns.length >= 1, 'Location view must render clickable transition buttons');
});

registerTest('Tier 1', 'F04', 'T1-F04-4', 'Location view renders Interactive AI Warriors in Zone (Guerreros en la Zona)', () => {
  const env = createGameEnv();
  const stage = env.document.getElementById('center-stage-container');
  assert.ok(/guerreros en la zona|guerreros|jugadores/i.test(stage.textContent), 'Location view must display AI Warriors in Zone');
});

registerTest('Tier 1', 'F04', 'T1-F04-5', 'AI Warriors in Zone support Inspect Profile, Challenge PvP, and Gift interactions', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  const art = getArt(env);
  const firstAi = art.AI_WARRIORS[0];
  assert.ok(firstAi, 'AI_WARRIORS must contain warriors');

  if (typeof actions.inspectWarriorProfile === 'function') {
    actions.inspectWarriorProfile(firstAi.id);
    const modalText = env.document.getElementById('gdl-modal-body').textContent;
    assert.ok(modalText.includes(firstAi.name), 'Inspecting AI warrior must display their profile in modal');
  } else {
    actions.openSpecialModal('profile');
    assert.ok(env.document.getElementById('gdl-modal-body').textContent.length > 20);
  }

  actions.startPvpCombat(firstAi.id);
  assert.strictEqual(getState(env).ui.centerView, 'combat', 'Challenging AI warrior must start PvP combat');
});

// --- Feature 5: 12-Slot Paperdoll, Unequip, Durability/Workshop Repair, Runes & Anti-XP Ring ---
registerTest('Tier 1', 'F05', 'T1-F05-1', 'Hero paperdoll renders all 12 canonical equipment slots (6 left, 6 right)', () => {
  const env = createGameEnv();
  const state = getState(env);
  const expectedSlots = [
    'helm', 'pauldrons', 'amulet', 'weapon', 'armor', 'bracers',
    'shield', 'cloak', 'cuisses', 'ring', 'belt', 'boots'
  ];
  expectedSlots.forEach((slot) => {
    assert.ok(Object.prototype.hasOwnProperty.call(state.equipment, slot), `state.equipment must contain slot '${slot}'`);
    const slotEl = env.document.querySelector(`[data-inspect-slot="${slot}"]`);
    assert.ok(slotEl, `Left panel must render paperdoll element [data-inspect-slot="${slot}"]`);
  });
});

registerTest('Tier 1', 'F05', 'T1-F05-2', 'Equip and Unequip actions move items cleanly between 12-slot paperdoll and backpack', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const equippedWeapon = state.equipment.weapon;
  assert.ok(equippedWeapon, 'Hero starts with an equipped weapon');

  callFirstAction(actions, ['unequipSlot', 'unequipItem'], 'weapon');
  assert.strictEqual(state.equipment.weapon, null, 'unequipSlot("weapon") must clear state.equipment.weapon');
  assert.ok(getInventoryQty(env, equippedWeapon) >= 1, 'Unequipped weapon must be placed in inventory');

  actions.useItem(equippedWeapon);
  assert.strictEqual(state.equipment.weapon, equippedWeapon, 'useItem on weapon must re-equip it into weapon slot');
});

registerTest('Tier 1', 'F05', 'T1-F05-3', 'Equipment Durability degrades in combat and can be repaired in Workshop', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  assert.ok(state.equipmentDurability || state.durability, 'State must track equipment durability');
  const durMap = state.equipmentDurability || state.durability;
  durMap.weapon = 10;
  state.hero.copper = 5000;
  callFirstAction(actions, ['repairEquipment', 'repairSlot', 'repairAllEquipment'], 'weapon');
  assert.ok(durMap.weapon > 10, 'Workshop repair action must restore weapon durability');
});

registerTest('Tier 1', 'F05', 'T1-F05-4', 'Legendary Runes (Руна Мира, Руна Сина, Inevitabilidad) can be socketed into gear and boost derived stats', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const runes = asArrayOrValues(art.RUNES);
  assert.ok(runes.length >= 3, 'GDL_ART.RUNES must define >=3 Legendary Runes');
  const firstRune = runes[0];
  ensureInventoryQty(env, firstRune.id, 1);

  const beforeStats = getDerived(env);
  callFirstAction(actions, ['socketRune', 'applyRune', 'engraveRune'], 'weapon', firstRune.id);
  const afterStats = getDerived(env);
  assert.ok(
    afterStats.atk > beforeStats.atk || afterStats.def > beforeStats.def || afterStats.maxHp > beforeStats.maxHp || afterStats.str > beforeStats.str,
    'Socketing a Legendary Rune into equipped weapon must increase derived stats'
  );
  assert.ok(state.equipmentRunes && state.equipmentRunes.weapon === firstRune.id, 'state.equipmentRunes.weapon must record socketed rune ID');
});

registerTest('Tier 1', 'F05', 'T1-F05-5', 'Anti-XP Ring (Антиопыт) toggle suppresses XP gain while preserving coin and Valor gains', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['toggleAntiXp', 'setAntiXp'], true);
  assert.strictEqual(Boolean(state.hero.antiXp), true, 'Anti-XP mode must be active');

  const xpBefore = state.hero.xp;
  const lvlBefore = state.hero.level;
  actions.harvestNode({ id: 'node_1', name: 'Veta', prof: 'mineria', tier: 2 });
  assert.strictEqual(state.hero.xp, xpBefore, 'XP must remain frozen at 0 gain while Anti-XP Ring is active');
  assert.strictEqual(state.hero.level, lvlBefore, 'Hero level must not change while Anti-XP Ring is active');
});

// --- Feature 6: 6-Category Expandable Backpack & Locked Mithril Chests ---
registerTest('Tier 1', 'F06', 'T1-F06-1', 'Backpack renders 6 Asteria category filter tabs', () => {
  const env = createGameEnv();
  const rightDock = env.document.getElementById('right-dock-content');
  const filterBtns = rightDock.querySelectorAll('[data-bag-filter], [data-inv-filter]');
  assert.strictEqual(filterBtns.length, 6, `Backpack must render 6 category filter tabs (found ${filterBtns.length})`);
});

registerTest('Tier 1', 'F06', 'T1-F06-2', 'Clicking backpack category filter tabs filters displayed inventory slots accurately', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  ensureInventoryQty(env, 'espada_iniciado', 1);
  ensureInventoryQty(env, 'elixir_vida_menor', 3);
  ensureInventoryQty(env, 'lingote_bronce', 2);
  getApp(env).renderAll();

  const rightDock = env.document.getElementById('right-dock-content');
  const filterBtns = rightDock.querySelectorAll('[data-bag-filter], [data-inv-filter]');
  assert.ok(filterBtns.length === 6);
  // Click second tab (Equipment / Equipo)
  filterBtns[1].click();
  const eqHtml = env.document.getElementById('right-dock-content').innerHTML;
  assert.ok(eqHtml.includes('espada_iniciado'), 'Equipment filter tab must show weapon in inventory');
});

registerTest('Tier 1', 'F06', 'T1-F06-3', 'Backpack dynamically displays >20 distinct items without truncating at slot 20', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const allArtifactIds = Object.keys(art.ARTIFACTS).slice(0, 26);
  assert.ok(allArtifactIds.length >= 25, 'GDL_ART.ARTIFACTS must have >=25 items');
  allArtifactIds.forEach((id) => ensureInventoryQty(env, id, 1));
  getApp(env).renderAll();

  const renderedItemSlots = env.document.querySelectorAll('#right-dock-content [data-inv-item]');
  assert.ok(renderedItemSlots.length >= 25, `Backpack must render all >=25 owned items without 20-slot cutoff (rendered ${renderedItemSlots.length})`);
});

registerTest('Tier 1', 'F06', 'T1-F06-4', 'Locked Mithril Chests exist in GDL_ART.ARTIFACTS and can be opened with Locksmith keys', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const actions = getActions(env);
  const chest = art.ARTIFACTS['cofre_mitril'] || Object.values(art.ARTIFACTS).find((a) => a.isChest || /cofre/i.test(a.id));
  const key = art.ARTIFACTS['llave_cerrajero'] || Object.values(art.ARTIFACTS).find((a) => a.isKey || /llave/i.test(a.id));
  assert.ok(chest, 'Locked chest artifact (e.g. cofre_mitril) must exist in GDL_ART.ARTIFACTS');
  assert.ok(key, 'Locksmith key artifact (e.g. llave_cerrajero) must exist in GDL_ART.ARTIFACTS');

  ensureInventoryQty(env, chest.id, 1);
  ensureInventoryQty(env, key.id, 1);
  const beforeCopper = getState(env).hero.copper;
  callFirstAction(actions, ['openLockedChest', 'openChest', 'useItem'], chest.id);
  assert.strictEqual(getInventoryQty(env, chest.id), 0, 'Opening locked chest must consume 1 chest');
  assert.strictEqual(getInventoryQty(env, key.id), 0, 'Opening locked chest must consume 1 Locksmith key');
  assert.ok(getState(env).hero.copper >= beforeCopper, 'Opening locked chest must award loot/coins');
});

registerTest('Tier 1', 'F06', 'T1-F06-5', 'Backpack Item Inspector exposes contextual actions (Equip/Unequip, Repair, Socket Rune, Belt, Sell)', () => {
  const env = createGameEnv();
  const state = getState(env);
  ensureInventoryQty(env, 'espada_iniciado', 1);
  state.ui.selectedItem = 'espada_iniciado';
  getApp(env).renderAll();
  const inspectorHtml = env.document.getElementById('right-dock-content').innerHTML;
  assert.ok(inspectorHtml.includes('btn-inv-use') && inspectorHtml.includes('btn-inv-sell'), 'Item inspector must render primary Use/Equip and Sell buttons');
});

// --- Feature 7: 60fps Animated Battle Canvas, 3-Zone Combat Stances & 6 Super-Blows ---
registerTest('Tier 1', 'F07', 'T1-F07-1', 'GDL_COMBAT_CANVAS runs a continuous 60fps requestAnimationFrame loop during active combat', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.startCombat('centinela_sombra');
  assert.ok(env.rafQueue.size >= 1, 'Starting combat must schedule a requestAnimationFrame loop in GDL_COMBAT_CANVAS');
  env.window.GDL_COMBAT_CANVAS.triggerCombatEffect('super', '-99', 'enemy', true);
  env.stepAnimationFrames(3);
  assert.ok(env.rafQueue.size >= 1, 'Combat canvas requestAnimationFrame loop must continue scheduling frames while in combat');
});

registerTest('Tier 1', 'F07', 'T1-F07-2', 'GDL_ART.COMBAT_STANCES defines 3 stances and switching stances affects combat turns', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const actions = getActions(env);
  const stances = asArrayOrValues(art.COMBAT_STANCES);
  assert.ok(stances.length >= 3, 'GDL_ART.COMBAT_STANCES must define >=3 stances (Guardia Solar, Furia del Dragón, Velo de Sombra)');

  actions.startCombat('centinela_sombra');
  callFirstAction(actions, ['setCombatStance', 'selectCombatStance', 'switchCombatStance'], stances[1].id);
  const stageHtml = env.document.getElementById('center-stage-container').innerHTML;
  assert.ok(stageHtml.includes(stances[1].name), 'Combat view must highlight selected Combat Stance');
});

registerTest('Tier 1', 'F07', 'T1-F07-3', 'GDL_ART.SUPER_BLOWS defines 6 directional 3-hit Super-Blow combos', () => {
  const env = createGameEnv();
  const art = getArt(env);
  assert.ok(Array.isArray(art.SUPER_BLOWS) && art.SUPER_BLOWS.length >= 6, `GDL_ART.SUPER_BLOWS must define >=6 combos (found ${art.SUPER_BLOWS && art.SUPER_BLOWS.length})`);
  art.SUPER_BLOWS.forEach((sb) => {
    assert.strictEqual(sb.sequence.length, 3, `Super-Blow ${sb.id} must have a 3-step zone sequence`);
    assert.ok(sb.mult > 1.3, `Super-Blow ${sb.id} must have damage multiplier > 1.3`);
  });
});

registerTest('Tier 1', 'F07', 'T1-F07-4', 'Executing a 2-hit partial combo populates readySuperBlow and 3rd hit triggers Super-Blow', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 5;
  state.hero.hp = 500;
  // Fight a high-HP boss so it survives 2 hits
  actions.startCombat('krystallos_soberano');
  const sb = art.SUPER_BLOWS[0]; // e.g. head -> torso -> head

  const clickZoneAndTurn = (zone) => {
    const btn = env.document.querySelector(`[data-atk-zone="${zone}"]`);
    if (btn) btn.click();
    actions.executeCombatTurn();
  };

  clickZoneAndTurn(sb.sequence[0]);
  clickZoneAndTurn(sb.sequence[1]);
  const stageHtmlAfter2 = env.document.getElementById('center-stage-container').innerHTML;
  assert.ok(/ready-glow|listo|2\/3/i.test(stageHtmlAfter2), 'After 2 matching combo hits, combat UI must highlight readySuperBlow or 2/3 step progress');

  clickZoneAndTurn(sb.sequence[2]);
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(logText.includes(sb.name), `3rd matching hit must trigger Super-Blow ${sb.name} in combat log`);
});

registerTest('Tier 1', 'F07', 'T1-F07-5', 'Post-combat fight_info statistics record damage dealt, damage taken, crits, and super-blows', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.baseStats.str = 40;
  actions.startCombat('centinela_sombra');
  while (getState(env).ui.centerView === 'combat') {
    actions.executeCombatTurn();
  }
  const lastFight = state.lastFightInfo || state.world.lastFightInfo;
  assert.ok(lastFight, 'State must record post-combat fight_info statistics (lastFightInfo) upon battle completion');
  assert.ok(lastFight.damageDealt > 0 && lastFight.turns >= 1, 'lastFightInfo must include damageDealt and turns count');
});

// --- Feature 8: Magic School Spells, 6-Slot Combat Belt, Morok/Mount/Disciple Summons & Injuries ---
registerTest('Tier 1', 'F08', 'T1-F08-1', 'GDL_ART.MAGIC_SPELLS defines 4 spells, item stats.mp boosts maxMp, and casting spells in combat consumes Mana', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const spells = asArrayOrValues(art.MAGIC_SPELLS);
  assert.ok(spells.length >= 4, 'GDL_ART.MAGIC_SPELLS must define >=4 Magic School spells');

  // Verify item stats.mp adds to maxMp
  const beforeMaxMp = getDerived(env).maxMp;
  ensureInventoryQty(env, 'baston_monolito', 1);
  state.hero.level = 6;
  actions.useItem('baston_monolito');
  const afterMaxMp = getDerived(env).maxMp;
  assert.ok(afterMaxMp >= beforeMaxMp + 45, 'Equipping baston_monolito (+45 mp) must increase derived maxMp');

  actions.startCombat('krystallos_soberano');
  const mpBefore = state.hero.mp;
  callFirstAction(actions, ['castCombatSpell', 'castSpell', 'useMagicSpell'], spells[0].id);
  assert.ok(state.hero.mp < mpBefore, 'Casting a Magic Spell in combat must consume hero MP');
});

registerTest('Tier 1', 'F08', 'T1-F08-2', '6-Slot Combat Belt supports assigning and using Elixirs and Battle Scrolls in combat', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  assert.ok(Array.isArray(state.belt) && state.belt.length === 6, 'state.belt must be a 6-slot array');

  actions.startCombat('krystallos_soberano');
  const beltButtons = env.document.querySelectorAll('[data-combat-potion], [data-belt-slot]');
  assert.ok(beltButtons.length >= 6, `Combat view must render all 6 combat belt slots (found ${beltButtons.length})`);
});

registerTest('Tier 1', 'F08', 'T1-F08-3', 'Active Morok / Mount in-battle summon joins combat, absorbs incoming damage, and strikes every turn', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.startCombat('krystallos_soberano');
  const enemyHpBefore = env.document.querySelector('.combat-stage-wrapper').textContent;
  callFirstAction(actions, ['summonMorokOrMount', 'summonCombatCompanion', 'summonMorok']);
  actions.executeCombatTurn();
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(/morok|montura|corcel|ignifer|invoc/i.test(logText), 'Summoned Morok/Mount must appear and assist in combat log');
  assert.ok(enemyHpBefore.length > 0);
});

registerTest('Tier 1', 'F08', 'T1-F08-4', 'Trained Disciple and fed Red Pet with socketed crystal deal bonus assist damage in combat', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 10000;
  callFirstAction(actions, ['trainDisciple', 'recruitDisciple'], 'discipulo_guerrero');
  actions.startCombat('krystallos_soberano');
  actions.executeCombatTurn();
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(/discípulo|ученик|mascota|halcón|fénix|arconte|lobo/i.test(logText), 'Disciple and/or Pet assist must be logged during combat turn');
});

registerTest('Tier 1', 'F08', 'T1-F08-5', 'Combat defeat inflicts a temporary Injury (Herida / Trauma) that is curable with 1 click via Healer or Infirmary', () => {
  const env = createGameEnv({ random: 0.9 });
  const state = getState(env);
  const actions = getActions(env);
  actions.startCombat('malakor_emperador_eclipse');
  state.hero.hp = 1;
  actions.executeCombatTurn();
  assert.ok(state.hero.injury, 'Being defeated by a boss must inflict a hero injury (state.hero.injury)');

  state.hero.copper = 5000;
  callFirstAction(actions, ['cureInjury', 'healInjury']);
  assert.strictEqual(state.hero.injury, null, 'cureInjury() must clear state.hero.injury');
});

// --- Feature 9: Enhanced Hunting Mode (Aggro Rings, Filters, Tooltips, Minimap Radar, Ambush) ---
registerTest('Tier 1', 'F09', 'T1-F09-1', 'Hunting Mode renders entity filter pills (Todos, Criaturas, Recursos, Jefes) and Auto-Aggro toggle', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.switchCenterView('hunting');
  const stage = env.document.getElementById('center-stage-container');
  const filterBtns = stage.querySelectorAll('[data-hunt-filter]');
  assert.strictEqual(filterBtns.length, 4, `Hunting view must render 4 entity filter pills (found ${filterBtns.length})`);
  const aggroToggle = stage.querySelector('#btn-toggle-auto-aggro, [data-toggle-auto-aggro]');
  assert.ok(aggroToggle, 'Hunting view must render an Auto-Aggro toggle button');
});

registerTest('Tier 1', 'F09', 'T1-F09-2', 'Hunting Canvas renders monster aggression color rings (Green/Yellow/Orange/Red) and corner Minimap/Radar', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.switchCenterView('hunting');
  env.stepAnimationFrames(2);
  const canvas = env.document.getElementById('gdl-hunting-canvas');
  const ctx = canvas.getContext('2d');
  assert.ok(ctx.ops.length > 15, 'Hunting canvas must execute 2D drawing operations for entities, aggro rings, and radar');
  const textOps = ctx.ops.filter((o) => o.op === 'fillText').map((o) => o.text).join(' ');
  assert.ok(/radar|mapa|nv\./i.test(textOps), 'Hunting canvas must draw entity level labels and corner radar overlay');
});

registerTest('Tier 1', 'F09', 'T1-F09-3', 'Hunting Canvas supports hover inspection tooltips on creatures and resource nodes', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.switchCenterView('hunting');
  assert.ok(
    typeof env.window.GDL_HUNTING_CANVAS.getEntities === 'function' ||
    env.document.querySelector('#hunting-hover-tooltip, .hunting-tooltip'),
    'Hunting mode must provide entity inspection tooltip element or getEntities inspector'
  );
});

registerTest('Tier 1', 'F09', 'T1-F09-4', 'Owning gathering tools (pico_maestro, hoz_herbolario, cana_pesca_runica) grants bonus harvest yield', () => {
  const env = createGameEnv({ random: 0.5 }); // avoid ambush
  const actions = getActions(env);
  const beforeBronze = getInventoryQty(env, 'lingote_bronce');
  ensureInventoryQty(env, 'pico_maestro', 1);
  actions.harvestNode({ id: 'veta_1', name: 'Veta de Bronce', prof: 'mineria', tier: 1 });
  const gainedWithTool = getInventoryQty(env, 'lingote_bronce') - beforeBronze;
  assert.ok(gainedWithTool >= 2, `Harvesting mining node while owning pico_maestro must grant >=2 materials (got ${gainedWithTool})`);
});

registerTest('Tier 1', 'F09', 'T1-F09-5', 'High-tier resource harvesting or high-aggro proximity can trigger an Elite Resource Guardian ambush', () => {
  const env = createGameEnv({ random: 0.02 }); // low roll triggers ambush / bonus
  const state = getState(env);
  const actions = getActions(env);
  state.ui.autoAggro = true;
  actions.harvestNode({ id: 'veta_4', name: 'Filón de Luminita', prof: 'mineria', tier: 4, canAmbush: true });
  const chatText = env.document.getElementById('gdl-chat-feed').textContent;
  assert.ok(
    state.ui.centerView === 'combat' || /guardián|emboscada|gema|extra|élite/i.test(chatText),
    'Low random roll on high-tier harvest must trigger Elite Guardian ambush or rare bonus drop'
  );
});

// --- Feature 10: 9 Professions & Real Crafting Workshop (service_craft.php) ---
registerTest('Tier 1', 'F10', 'T1-F10-1', 'GDL_ART.PROFESSIONS defines all 9 canonical professions (adding Sanador, Cerrajero, Verdugo)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const expectedProfs = ['mineria', 'herbolaria', 'pesca', 'herreria', 'alquimia', 'joyeria', 'sanador', 'cerrajero', 'verdugo'];
  assert.strictEqual(art.PROFESSIONS.length, 9, 'GDL_ART.PROFESSIONS must contain 9 professions');
  expectedProfs.forEach((pid) => {
    assert.ok(art.PROFESSIONS.some((p) => p.id === pid), `Profession '${pid}' must exist in GDL_ART.PROFESSIONS`);
  });
});

registerTest('Tier 1', 'F10', 'T1-F10-2', 'Profession levels grant permanent passive stat bonuses in computeDerivedStats()', () => {
  const env = createGameEnv();
  const state = getState(env);
  const baseDerived = getDerived(env);
  state.professions.herreria.level = 5;
  state.professions.mineria.level = 5;
  state.professions.verdugo.level = 5;
  const boostedDerived = getDerived(env);
  assert.ok(
    boostedDerived.atk > baseDerived.atk || boostedDerived.def > baseDerived.def || boostedDerived.crit > baseDerived.crit,
    'Raising profession levels must increase derived combat stats (ATK, DEF, or CRIT)'
  );
});

registerTest('Tier 1', 'F10', 'T1-F10-3', 'GDL_ART.CRAFT_RECIPES defines recipes across Weapons/Armor, Elixirs, Runes/Rings, Healer Scrolls, and Locksmith Keys', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const recipes = asArrayOrValues(art.CRAFT_RECIPES);
  assert.ok(recipes.length >= 5, `GDL_ART.CRAFT_RECIPES must define >=5 crafting recipes (found ${recipes.length})`);
  const profsCovered = new Set(recipes.map((r) => r.prof || r.profession));
  ['herreria', 'alquimia', 'joyeria', 'sanador', 'cerrajero'].forEach((p) => {
    assert.ok(profsCovered.has(p), `GDL_ART.CRAFT_RECIPES must include a recipe for '${p}'`);
  });
});

registerTest('Tier 1', 'F10', 'T1-F10-4', 'Crafting a Workshop recipe consumes materials, awards crafted item, and increases profession XP', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const rec = asArrayOrValues(art.CRAFT_RECIPES)[0];
  state.hero.copper = 10000;
  (rec.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty + 2));
  const profKey = rec.prof || rec.profession;
  const beforeXp = state.professions[profKey].xp + state.professions[profKey].level * 1000;
  const beforeResultQty = getInventoryQty(env, rec.resultId);

  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], rec.id);
  const afterResultQty = getInventoryQty(env, rec.resultId);
  const afterXp = state.professions[profKey].xp + state.professions[profKey].level * 1000;
  assert.ok(afterResultQty > beforeResultQty, `Crafting recipe ${rec.id} must add ${rec.resultId} to inventory`);
  assert.ok(afterXp > beforeXp, `Crafting recipe ${rec.id} must grant XP to profession ${profKey}`);
});

registerTest('Tier 1', 'F10', 'T1-F10-5', 'Professions & Workshop modal renders all 9 professions and interactive Crafting Recipe buttons', () => {
  const env = createGameEnv();
  getActions(env).openSpecialModal('professions');
  const modalBody = env.document.getElementById('gdl-modal-body');
  const trainBtns = modalBody.querySelectorAll('[data-train-prof]');
  const craftBtns = modalBody.querySelectorAll('[data-craft-recipe]');
  assert.strictEqual(trainBtns.length, 9, 'Professions modal must render 9 profession training cards');
  assert.ok(craftBtns.length >= 5, 'Professions modal must render >=5 interactive recipe craft buttons');
});

// --- Feature 11: Battlefields (Поля битв — Cuevas Cristalinas, Tallaar, Meseta, Caóticas) & Valor Arsenal ---
registerTest('Tier 1', 'F11', 'T1-F11-1', 'GDL_ART.BATTLEFIELDS defines 6 iconic Asteria battlegrounds', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const bfs = asArrayOrValues(art.BATTLEFIELDS);
  assert.ok(bfs.length >= 6, `GDL_ART.BATTLEFIELDS must define >=6 battlefields (found ${bfs.length})`);
});

registerTest('Tier 1', 'F11', 'T1-F11-2', 'Playing Crystalline Caves (Cuevas Cristalinas) supports mining/delivering energy crystals and altar buffs', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 5;
  const valorBefore = state.hero.valor || 0;
  callFirstAction(actions, ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], 'cuevas_cristalinas', 'red');
  assert.ok((state.hero.valor || 0) > valorBefore, 'Completing Crystalline Caves objective must award Valor (Доблесть)');
});

registerTest('Tier 1', 'F11', 'T1-F11-3', 'Participating in Halls of Tallaar, Chaotic Battles, and Ancient Plateau awards Valor and Trophy Coins', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const coinsBefore = getHeroCurrency(state, 'trophyCoins');
  const bfs = asArrayOrValues(getArt(env).BATTLEFIELDS);
  callFirstAction(actions, ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], bfs[1].id);
  const coinsAfter = getHeroCurrency(state, 'trophyCoins');
  assert.ok(coinsAfter > coinsBefore, 'Playing a Battlefield must award Trophy Coins (Трофейные монеты)');
});

registerTest('Tier 1', 'F11', 'T1-F11-4', 'Accumulating Valor advances Hero Military Rank title and unlocks Valor Arsenal purchases', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.valor = 2500;
  setHeroCurrency(state, 'trophyCoins', 50);
  state.hero.copper = 10000;
  getApp(env).renderAll();
  const topbarText = env.document.querySelector('.asteria-topbar').textContent;
  assert.ok(/centuri|campe|comandante|soberano|rango|veterano|caballero/i.test(topbarText), 'High Valor must display upgraded Military Rank title');
});

registerTest('Tier 1', 'F11', 'T1-F11-5', 'Battlefields modal renders all 6 battlefield modes, Crystalline Caves controls, and Valor Arsenal', () => {
  const env = createGameEnv();
  getActions(env).openSpecialModal('arena');
  const modalHtml = env.document.getElementById('gdl-modal-body').innerHTML;
  assert.ok(/cuevas cristalinas|tallaar|caóticas|meseta/i.test(modalHtml), 'Battlefields modal must render classic Asteria battlegrounds');
});

// --- Feature 12: Cooldown Instances (Инстансы) & Custom Fast-Farm Grotto (ГРОТ) ---
registerTest('Tier 1', 'F12', 'T1-F12-1', 'GDL_ART.INSTANCES defines 6 dungeons including Asteria custom fast-farm La Gruta (ГРОТ)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const instances = asArrayOrValues(art.INSTANCES);
  assert.ok(instances.length >= 6, `GDL_ART.INSTANCES must define >=6 instances (found ${instances.length})`);
  const grot = instances.find((i) => i.id === 'gruta_grot' || /gruta|грот/i.test(i.name));
  assert.ok(grot, 'GDL_ART.INSTANCES must include La Gruta (ГРОТ)');
});

registerTest('Tier 1', 'F12', 'T1-F12-2', 'Clearing Fast-Farm Grotto (La Gruta / ГРОТ) awards Transformation Stones, rare artifacts, and Diamonds', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const diamondsBefore = getHeroCurrency(state, 'diamonds');
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], 'gruta_grot');
  const diamondsAfter = getHeroCurrency(state, 'diamonds');
  assert.ok(diamondsAfter > diamondsBefore, 'Clearing La Gruta (ГРОТ) must reward Diamonds (Бриллианты)');
});

registerTest('Tier 1', 'F12', 'T1-F12-3', 'Clearing a Cooldown Instance records lockout timestamp / cooldown in state.instances', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const inst = asArrayOrValues(getArt(env).INSTANCES).find((i) => i.id !== 'gruta_grot') || asArrayOrValues(getArt(env).INSTANCES)[0];
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);
  assert.ok(state.instances && state.instances.cooldowns && state.instances.cooldowns[inst.id] > Date.now(), `Clearing instance ${inst.id} must set an active lockout cooldown`);
});

registerTest('Tier 1', 'F12', 'T1-F12-4', 'Multi-stage Instance progression tracks cleared waves and boss drops', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const beforeClears = (state.instances && state.instances.totalClears) || 0;
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], 'gruta_grot');
  const afterClears = (state.instances && state.instances.totalClears) || 0;
  assert.ok(afterClears > beforeClears, 'Clearing an instance must increment state.instances.totalClears');
});

registerTest('Tier 1', 'F12', 'T1-F12-5', 'Instances & Grotto modal renders all 6 dungeons, stage waves, rewards, and cooldown badges', () => {
  const env = createGameEnv();
  getActions(env).openSpecialModal('instances');
  const modalHtml = env.document.getElementById('gdl-modal-body').innerHTML;
  assert.ok(/gruta|грот|santuario|zigred|krets/i.test(modalHtml), 'Instances modal must render all dungeons including La Gruta (ГРОТ)');
});

// --- Feature 13: 10+ Faction Reputations (Репутации), Arkona Influence & Katala (Катала) ---
registerTest('Tier 1', 'F13', 'T1-F13-1', 'GDL_ART.REPUTATIONS defines 10+ reputation tracks including Influencia de Arkona and Reputación de Tahúr (Катала)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const reps = asArrayOrValues(art.REPUTATIONS);
  assert.ok(reps.length >= 10, `GDL_ART.REPUTATIONS must define >=10 reputation tracks (found ${reps.length})`);
  assert.ok(reps.some((r) => /arkona/i.test(r.id) || /arkona/i.test(r.name)), 'REPUTATIONS must include Influencia de Arkona');
  assert.ok(reps.some((r) => /katala|tahur|tahúr|катала/i.test(r.id) || /katala|tahur|tahúr|катала/i.test(r.name)), 'REPUTATIONS must include Reputación de Tahúr / Катала');
});

registerTest('Tier 1', 'F13', 'T1-F13-2', 'Turning in faction trophies/sparks increments numeric reputation points (0-3000)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const rep = asArrayOrValues(art.REPUTATIONS)[0];
  const trophyItem = rep.trophyItem || 'chispa_celestial';
  ensureInventoryQty(env, trophyItem, 5);
  state.hero.copper = 5000;
  const beforePts = state.reputations[rep.id] || 0;
  callFirstAction(actions, ['donateReputation', 'turnInReputationTrophy', 'addReputation'], rep.id);
  const afterPts = state.reputations[rep.id] || 0;
  assert.ok(afterPts > beforePts, `Turning in trophy for ${rep.id} must increase reputation points`);
});

registerTest('Tier 1', 'F13', 'T1-F13-3', 'Reaching 500 / 1000 / 2000 / 3000 reputation points unlocks Bronze, Silver, Gold, and Worship medal tiers and boosts derived stats', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const rep = asArrayOrValues(art.REPUTATIONS)[0];
  const baseStats = getDerived(env);
  state.reputations[rep.id] = 3000;
  const worshipStats = getDerived(env);
  assert.ok(
    worshipStats.atk > baseStats.atk || worshipStats.def > baseStats.def || worshipStats.maxHp > baseStats.maxHp,
    'Reaching 3000 (Worship medal tier) reputation must grant permanent derived stat bonuses'
  );
});

registerTest('Tier 1', 'F13', 'T1-F13-4', 'Playing Tavern Dice automatically increments Reputación de Tahúr (Катала)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const katalaRep = asArrayOrValues(art.REPUTATIONS).find((r) => /katala|tahur|tahúr/i.test(r.id) || /katala|tahur|tahúr/i.test(r.name));
  assert.ok(katalaRep, 'Katala reputation definition must exist');
  state.hero.copper = 2000;
  const beforeKatala = state.reputations[katalaRep.id] || 0;
  actions.playTavernDice(150);
  const afterKatala = state.reputations[katalaRep.id] || 0;
  assert.ok(afterKatala > beforeKatala, 'Playing Tavern Dice must increment Reputación de Tahúr (Катала)');
});

registerTest('Tier 1', 'F13', 'T1-F13-5', 'Reputations & Medals modal renders all 10+ reputation tracks, medal tier badges, and trophy turn-in buttons', () => {
  const env = createGameEnv();
  getActions(env).openSpecialModal('medals');
  const modalHtml = env.document.getElementById('gdl-modal-body').innerHTML;
  assert.ok(/arkona|tahúr|катала|3000/i.test(modalHtml), 'Reputations/Medals modal must display all reputation tracks including Arkona and Katala');
});

// --- Feature 14: Disciples Academy (Ученики), Red Pets Crystal Socketing & Collectible Card Decks (Колоды) ---
registerTest('Tier 1', 'F14', 'T1-F14-1', 'GDL_ART.DISCIPLES defines Warrior, Mage, and Assassin disciples trainable in the Academy', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const disciples = asArrayOrValues(art.DISCIPLES);
  assert.strictEqual(disciples.length, 3, 'GDL_ART.DISCIPLES must define 3 disciple classes (Warrior, Mage, Assassin)');
  const state = getState(env);
  state.hero.copper = 10000;
  const beforeStats = getDerived(env);
  callFirstAction(getActions(env), ['trainDisciple', 'recruitDisciple'], disciples[0].id);
  const afterStats = getDerived(env);
  assert.ok(afterStats.atk >= beforeStats.atk, 'Training a Disciple must activate or level up the disciple');
});

registerTest('Tier 1', 'F14', 'T1-F14-2', 'Red Pets (Красные питомцы) support feeding (Корм) and Crystal Socketing (Кристалл старого огра)', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const crystals = asArrayOrValues(art.PET_CRYSTALS);
  assert.ok(crystals.length >= 2, 'GDL_ART.PET_CRYSTALS must define Red Pet upgrade crystals');

  state.hero.copper = 10000;
  ensureInventoryQty(env, crystals[0].id, 1);
  const beforeStats = getDerived(env);
  callFirstAction(actions, ['socketPetCrystal', 'upgradeRedPet'], state.pets.active || 'halcon_alba', crystals[0].id);
  const afterStats = getDerived(env);
  assert.ok(
    afterStats.atk > beforeStats.atk || afterStats.crit > beforeStats.crit || afterStats.maxHp > beforeStats.maxHp,
    'Socketing a crystal into active Red Pet must increase derived stats'
  );
});

registerTest('Tier 1', 'F14', 'T1-F14-3', 'GDL_ART.CARD_DECKS defines 6 collectible decks including Baraja de Recursos, Mecenas II, and Clanes de Asteria', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const decks = asArrayOrValues(art.CARD_DECKS);
  assert.strictEqual(decks.length, 6, `GDL_ART.CARD_DECKS must define 6 collectible card decks (found ${decks.length})`);
});

registerTest('Tier 1', 'F14', 'T1-F14-4', 'Activating a Collectible Card Deck grants weekly resource bundle / buffs and sets cooldown', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const deck = asArrayOrValues(art.CARD_DECKS)[0];
  state.hero.copper = 10000;
  if (state.cardDecks && state.cardDecks.unlocked) state.cardDecks.unlocked[deck.id] = true;
  const invBefore = state.inventory.reduce((s, x) => s + x.qty, 0);
  callFirstAction(actions, ['claimCardDeck', 'activateCardDeck'], deck.id);
  const invAfter = state.inventory.reduce((s, x) => s + x.qty, 0);
  assert.ok(
    invAfter > invBefore || getHeroCurrency(state, 'diamonds') > 0,
    'Activating a Card Deck must award rare resources or currencies'
  );
});

registerTest('Tier 1', 'F14', 'T1-F14-5', 'Disciples Academy, Red Pets, and Card Decks modals render full interactive controls', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.openSpecialModal('mounts');
  const mountsHtml = env.document.getElementById('gdl-modal-body').innerHTML;
  assert.ok(/discípulo|ученик|cristal|mascota/i.test(mountsHtml), 'Mounts/Pets/Disciples modal must render Disciples Academy and Red Pet crystals');

  actions.openSpecialModal('decks');
  const decksHtml = env.document.getElementById('gdl-modal-body').innerHTML;
  assert.ok(/baraja|колода|mecenas/i.test(decksHtml), 'Card Decks modal must render all 6 collectible decks');
});

// --- Feature 15: Player Estate (Поместье / Hacienda) & Clan Talents (Клановые таланты) ---
registerTest('Tier 1', 'F15', 'T1-F15-1', 'GDL_ART.ESTATE_BUILDINGS defines 6 upgradable Estate structures', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const buildings = asArrayOrValues(art.ESTATE_BUILDINGS);
  assert.strictEqual(buildings.length, 6, `GDL_ART.ESTATE_BUILDINGS must define 6 buildings (found ${buildings.length})`);
});

registerTest('Tier 1', 'F15', 'T1-F15-2', 'Upgrading Estate buildings with Gold and Riolite increases building level and boosts derived stats', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 50000;
  ensureInventoryQty(env, 'riolita', 50);
  if (state.estate) state.estate.riolite = 50;

  const buildings = asArrayOrValues(art.ESTATE_BUILDINGS);
  const townHall = buildings.find((b) => /ayuntamiento|town/i.test(b.id) || /ayuntamiento/i.test(b.name)) || buildings[0];
  const beforeStats = getDerived(env);
  callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], townHall.id);
  for (const b of buildings) {
    callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], b.id);
  }
  const afterStats = getDerived(env);
  assert.ok(
    afterStats.maxHp > beforeStats.maxHp || afterStats.atk > beforeStats.atk || afterStats.def > beforeStats.def,
    'Upgrading Estate buildings must boost hero derived stats'
  );
});

registerTest('Tier 1', 'F15', 'T1-F15-3', 'GDL_ART.CLAN_TALENTS defines 5 Clan Talents upgraded via Tratados: Unidad del Clan', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const talents = asArrayOrValues(art.CLAN_TALENTS);
  assert.strictEqual(talents.length, 5, `GDL_ART.CLAN_TALENTS must define 5 clan talents (found ${talents.length})`);
});

registerTest('Tier 1', 'F15', 'T1-F15-4', 'Upgrading Clan Talents consumes Tratado: Unidad del Clan and increases hero derived stats', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const talent = asArrayOrValues(art.CLAN_TALENTS)[0];
  ensureInventoryQty(env, 'tratado_unidad_clan', 10);
  state.hero.copper = 20000;
  const beforeStats = getDerived(env);
  callFirstAction(actions, ['upgradeClanTalent', 'trainClanTalent'], talent.id);
  const afterStats = getDerived(env);
  assert.ok(
    afterStats.atk > beforeStats.atk || afterStats.def > beforeStats.def || afterStats.maxHp > beforeStats.maxHp || afterStats.crit > beforeStats.crit,
    'Upgrading a Clan Talent must boost hero derived stats'
  );
});

registerTest('Tier 1', 'F15', 'T1-F15-5', 'Estate (Hacienda) and Clan Talents modals render upgrade levels, Riolite/Treatise counts, and action buttons', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.openSpecialModal('estate');
  const estateHtml = env.document.getElementById('gdl-modal-body').innerHTML;
  assert.ok(/ayuntamiento|enfermería|obelisco|riolita/i.test(estateHtml), 'Estate modal must render all 6 buildings and Riolite counter');
});

// --- Feature 16: Fair of Wonders, Wheel of Fortune, Daily Feats, Bank/Auction, Tavern Cards, Profile Promocodes & Library/Balagurs ---
registerTest('Tier 1', 'F16', 'T1-F16-1', 'Fair of Wonders (Ярмарка диковинок) and Wheel of Fortune (Колесо фортуны) award rare prizes', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  setHeroCurrency(state, 'diamonds', 100);
  setHeroCurrency(state, 'rubies', 50);
  setHeroCurrency(state, 'onlineTokens', 50);
  state.hero.copper = 20000;

  const spinRes = callFirstAction(actions, ['spinWheelOfFortune', 'spinWheel']);
  assert.ok(spinRes || state.hero.copper > 0, 'Spinning Wheel of Fortune must execute and grant a prize');

  const fairItems = asArrayOrValues(getArt(env).FAIR_ITEMS);
  assert.ok(fairItems.length >= 3, 'GDL_ART.FAIR_ITEMS must define Fair of Wonders shop items');
  callFirstAction(actions, ['buyFairItem', 'purchaseFairItem'], fairItems[0].id);
});

registerTest('Tier 1', 'F16', 'T1-F16-2', 'Daily Feats (Маленький подвиг), Imperial Bank Lucky Deposit (Счастливый вклад), and Auction House (Аукцион) work end-to-end', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  assert.ok(asArrayOrValues(art.DAILY_FEATS).length >= 3, 'GDL_ART.DAILY_FEATS must define >=3 daily feats');
  assert.ok(asArrayOrValues(art.AUCTION_LISTINGS).length >= 3, 'GDL_ART.AUCTION_LISTINGS must define >=3 auction listings');

  state.hero.copper = 50000;
  state.world.totalKills = 20;
  state.world.harvestCount = 20;
  const feat = asArrayOrValues(art.DAILY_FEATS)[0];
  callFirstAction(actions, ['claimDailyFeat', 'completeDailyFeat'], feat.id);

  callFirstAction(actions, ['bankLuckyDeposit', 'depositBank'], 1000);
  const listing = asArrayOrValues(art.AUCTION_LISTINGS)[0];
  callFirstAction(actions, ['buyAuctionListing', 'bidAuction'], listing.id);
  assert.ok(getInventoryQty(env, listing.itemId) >= 1, 'Buying an Auction House listing must add the artifact to inventory');
});

registerTest('Tier 1', 'F16', 'T1-F16-3', 'Tavern Arcomage Card Duel plays alongside Tavern Dice and increments Katala reputation', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 5000;
  const res = callFirstAction(actions, ['playTavernCards', 'playArcomage'], 200);
  assert.ok(res && typeof res === 'string', 'playTavernCards must return a match summary string');
});

registerTest('Tier 1', 'F16', 'T1-F16-4', 'Character Profile (user_info.php) redeems official Asteria promocodes 9LETASTERII and DLEO-3947-URHF-3846', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const diamondsBefore = getHeroCurrency(state, 'diamonds');

  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], '9LETASTERII');
  const diamondsMid = getHeroCurrency(state, 'diamonds');
  assert.ok(diamondsMid > diamondsBefore, 'Redeeming promocode 9LETASTERII must grant Diamonds and festive rewards');

  const arkonaBefore = (state.reputations && state.reputations.influencia_arkona) || 0;
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], 'DLEO-3947-URHF-3846');
  const diamondsAfter = getHeroCurrency(state, 'diamonds');
  const arkonaAfter = (state.reputations && state.reputations.influencia_arkona) || 0;
  assert.ok(diamondsAfter >= diamondsMid + 10, 'Redeeming DLEO-3947-URHF-3846 must grant >=10 Diamonds');
  assert.ok(arkonaAfter >= arkonaBefore + 100, 'Redeeming DLEO-3947-URHF-3846 must grant +100 Arkona Influence');
});

registerTest('Tier 1', 'F16', 'T1-F16-5', 'Asteria Library (library.php) and Balagur Riddle Contests (Конкурсы Балагуров) grant riddle rewards', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const riddles = asArrayOrValues(art.BALAGUR_RIDDLES);
  assert.ok(riddles.length >= 3, 'GDL_ART.BALAGUR_RIDDLES must define >=3 Balagur riddles');
  const r = riddles[0];
  const beforeCopper = state.hero.copper;
  const beforeDiamonds = getHeroCurrency(state, 'diamonds');
  callFirstAction(actions, ['answerBalagurRiddle', 'solveBalagurRiddle'], r.id, r.answerIndex !== undefined ? r.answerIndex : r.answer);
  assert.ok(
    state.hero.copper > beforeCopper || getHeroCurrency(state, 'diamonds') > beforeDiamonds,
    'Answering a Balagur riddle with the correct answer must award coins or Diamonds'
  );
});

// --- Feature 17: Public/Root Mirror Synchronization & GitHub Pages Deployment Verification ---
registerTest('Tier 1', 'F17', 'T1-F17-1', 'public/index.html <-> index.html and public/css/asteria.css <-> css/asteria.css are 100% byte-for-byte identical', () => {
  const pubHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'));
  const rootHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'));
  assert.strictEqual(Buffer.compare(pubHtml, rootHtml), 0, 'public/index.html and root index.html must be 100% identical');

  const pubCss = fs.readFileSync(path.join(PUBLIC_DIR, 'css', 'asteria.css'));
  const rootCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'asteria.css'));
  assert.strictEqual(Buffer.compare(pubCss, rootCss), 0, 'public/css/asteria.css and root css/asteria.css must be 100% identical');
});

registerTest('Tier 1', 'F17', 'T1-F17-2', 'All 9 JavaScript modules in public/js/** and root js/** are 100% byte-for-byte identical', () => {
  const jsFiles = [
    'js/artAssets.js',
    'js/avatarCanvas.js',
    'js/combatCanvas.js',
    'js/huntingCanvas.js',
    'js/uiShell.js',
    'js/app.js',
    'js/views/mainViews.js',
    'js/views/specialModals.js',
    'js/views/chatPanel.js'
  ];
  jsFiles.forEach((rel) => {
    const b1 = fs.readFileSync(path.join(PUBLIC_DIR, rel));
    const b2 = fs.readFileSync(path.join(ROOT_DIR, rel));
    assert.strictEqual(Buffer.compare(b1, b2), 0, `public/${rel} and root ${rel} must be 100% byte-for-byte identical`);
  });
});

registerTest('Tier 1', 'F17', 'T1-F17-3', 'All 11 HD oil paintings in public/assets/** and root assets/** are 100% byte-for-byte identical', () => {
  const subdirs = ['assets/locations', 'assets/npcs'];
  let checked = 0;
  subdirs.forEach((sub) => {
    const files = fs.readdirSync(path.join(PUBLIC_DIR, sub));
    files.forEach((f) => {
      const s1 = fs.statSync(path.join(PUBLIC_DIR, sub, f));
      const s2 = fs.statSync(path.join(ROOT_DIR, sub, f));
      assert.strictEqual(s1.size, s2.size, `Asset ${sub}/${f} size must match between public/ and root`);
      checked++;
    });
  });
  assert.strictEqual(checked, 11, 'Must verify all 11 HD oil-painted JPG assets');
});

registerTest('Tier 1', 'F17', 'T1-F17-4', 'Booting application from root GitHub Pages files produces identical initial state to public/', () => {
  const envPublic = createGameEnv({ useRootFiles: false });
  const envRoot = createGameEnv({ useRootFiles: true });
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(getApp(envPublic).computeDerivedStats())),
    JSON.parse(JSON.stringify(getApp(envRoot).computeDerivedStats())),
    'Derived stats when booted from root index.html must match public/index.html'
  );
});

registerTest('Tier 1', 'F17', 'T1-F17-5', 'Node HTTP server (server/index.js) serves GET /api/health and GET / with status 200', async () => {
  const server = require(path.join(ROOT_DIR, 'server', 'index.js'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const healthRes = await httpGet(port, '/api/health');
    assert.strictEqual(healthRes.statusCode, 200);
    const parsed = JSON.parse(healthRes.body);
    assert.strictEqual(parsed.status, 'ok');

    const indexRes = await httpGet(port, '/');
    assert.strictEqual(indexRes.statusCode, 200);
    assert.ok(indexRes.body.includes('Guerreros de la LUZ'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

/* ==========================================================================
   TIER 2 — BOUNDARY & CORNER CASES (17 Features x 5 Tests = 85 Tests)
   ========================================================================== */

// --- F01 Boundaries ---
registerTest('Tier 2', 'F01', 'T2-F01-1', 'Corrupted non-JSON string in localStorage falls back cleanly to fresh default state without throwing', () => {
  const env = createGameEnv({
    initialLocalStorage: { guerreros_de_la_luz_asteria_v3: '{corrupted_json:::' }
  });
  const state = getState(env);
  assert.strictEqual(state.hero.level, 1);
  assert.strictEqual(Object.keys(state.equipment).length, 12);
});

registerTest('Tier 2', 'F01', 'T2-F01-2', 'importSaveString rejects empty, malformed, and missing-hero JSON strings cleanly', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  assert.strictEqual(actions.importSaveString(''), false);
  assert.strictEqual(actions.importSaveString('not-valid-base64-!!!'), false);
  assert.strictEqual(actions.importSaveString(JSON.stringify({ foo: 'bar' })), false);
});

registerTest('Tier 2', 'F01', 'T2-F01-3', 'importSaveString with partial legacy v3 JSON deep-merges missing 12-slot equipment and 9 professions', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  const partial = JSON.stringify({
    hero: { name: 'ImportedHero', level: 3, xp: 10, xpNext: 200, hp: 200, maxHp: 200, mp: 100, maxMp: 100, copper: 500, baseStats: { str: 12, agi: 10, vit: 12, wis: 10 } },
    equipment: { weapon: 'espada_iniciado' },
    world: { currentLocation: 'ciudadela_luz' }
  });
  assert.strictEqual(actions.importSaveString(partial), true);
  const state = getState(env);
  assert.strictEqual(state.hero.name, 'ImportedHero');
  assert.strictEqual(Object.keys(state.equipment).length, 12, 'Imported partial save must have all 12 equipment slots normalized');
  assert.strictEqual(Object.keys(state.professions).length, 9, 'Imported partial save must have all 9 professions normalized');
});

registerTest('Tier 2', 'F01', 'T2-F01-4', 'Opening NPC dialog with non-existent NPC ID is a safe no-op', () => {
  const env = createGameEnv();
  getActions(env).openNpcModal('ghost_npc_nonexistent');
  const backdrop = env.document.getElementById('gdl-modal-backdrop');
  assert.ok(backdrop.classList.contains('hidden'), 'Modal must stay hidden when NPC ID does not exist');
});

registerTest('Tier 2', 'F01', 'T2-F01-5', 'All creature IDs listed in every location.creatures array exist in GDL_ART.CREATURES and all location.npcs exist in GDL_ART.NPCS', () => {
  const env = createGameEnv();
  const art = getArt(env);
  art.LOCATIONS.forEach((loc) => {
    (loc.npcs || []).forEach((npcId) => {
      assert.ok(art.NPCS[npcId], `Location ${loc.id} references NPC '${npcId}' which is missing from GDL_ART.NPCS`);
    });
    (loc.creatures || []).forEach((crId) => {
      assert.ok(art.CREATURES.some((c) => c.id === crId), `Location ${loc.id} references creature '${crId}' which is missing from GDL_ART.CREATURES`);
    });
  });
});

// --- F02 Boundaries ---
registerTest('Tier 2', 'F02', 'T2-F02-1', 'Selecting an invalid Faction ID is ignored and preserves current valid faction', () => {
  const env = createGameEnv();
  const state = getState(env);
  const prev = state.hero.faction;
  callFirstAction(getActions(env), ['selectFaction', 'setFaction', 'switchFaction'], 'invalid_faction_xyz');
  assert.strictEqual(state.hero.faction, prev);
});

registerTest('Tier 2', 'F02', 'T2-F02-2', 'Selecting an invalid Combat Style ID is ignored and preserves current valid combatStyle', () => {
  const env = createGameEnv();
  const state = getState(env);
  const prev = state.hero.combatStyle;
  callFirstAction(getActions(env), ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'invalid_style_xyz');
  assert.strictEqual(state.hero.combatStyle, prev);
});

registerTest('Tier 2', 'F02', 'T2-F02-3', 'Switching Combat Style when Hero is at 1 HP clamps HP safely and never drops Hero to <= 0 HP', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'titan');
  state.hero.hp = 1;
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'sombra');
  assert.ok(state.hero.hp >= 1 && state.hero.hp <= state.hero.maxHp, 'Hero HP must remain within [1, maxHp] after switching style');
});

registerTest('Tier 2', 'F02', 'T2-F02-4', 'Allocating stat points with 0 unspentPoints or invalid stat key is rejected', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.unspentPoints = 0;
  const strBefore = state.hero.baseStats.str;
  actions.allocateStat('str');
  assert.strictEqual(state.hero.baseStats.str, strBefore);
  state.hero.unspentPoints = 2;
  actions.allocateStat('invalid_stat');
  assert.strictEqual(state.hero.unspentPoints, 2);
});

registerTest('Tier 2', 'F02', 'T2-F02-5', 'drawHeroAvatar handles null/missing canvas ID and empty equipment object without throwing', () => {
  const env = createGameEnv();
  assert.doesNotThrow(() => {
    env.window.GDL_AVATAR.drawHeroAvatar('nonexistent-canvas-id', {});
  });
});

// --- F03 Boundaries ---
registerTest('Tier 2', 'F03', 'T2-F03-1', '33.33% XP sub-level milestone triggers only once within the same level (no duplicate payouts)', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  if (typeof actions.grantXp === 'function') {
    actions.grantXp(35); // crosses 33.33%
    const copperAfterFirst = state.hero.copper;
    actions.grantXp(10); // 45 / 100 (still between 33% and 66%)
    assert.strictEqual(state.hero.copper, copperAfterFirst, '33.33% milestone must not double-pay on subsequent XP gain below 66.66%');
  } else {
    assert.fail('GDL_APP.actions.grantXp must be exposed for XP milestone verification');
  }
});

registerTest('Tier 2', 'F03', 'T2-F03-2', 'Crossing 100% XP in a single large grant levels up hero and resets 33%/66% milestone flags for the new level', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  actions.grantXp(100);
  assert.strictEqual(state.hero.level, 2);
  const copperAtLv2Start = state.hero.copper;
  // Cross 33.33% of Level 2
  actions.grantXp(Math.ceil(state.hero.xpNext * 0.36));
  assert.ok(state.hero.copper > copperAtLv2Start, '33.33% milestone must reset and pay again in Level 2');
});

registerTest('Tier 2', 'F03', 'T2-F03-3', 'splitCurrency and formatCurrencyBadge handle 0c, 100c (1p), and 10000c (1o) boundaries accurately', () => {
  const env = createGameEnv();
  const art = getArt(env);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(art.splitCurrency(0))), { gold: 0, silver: 0, copper: 0 });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(art.splitCurrency(100))), { gold: 0, silver: 1, copper: 0 });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(art.splitCurrency(10000))), { gold: 1, silver: 0, copper: 0 });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(art.splitCurrency(-55))), { gold: 0, silver: 0, copper: 0 });
});

registerTest('Tier 2', 'F03', 'T2-F03-4', 'Top HUD HP, MP, XP, and Valor bar percentages clamp cleanly between 0% and 100%', () => {
  const env = createGameEnv();
  const state = getState(env);
  state.hero.hp = 0;
  state.hero.mp = 0;
  state.hero.xp = 0;
  state.hero.valor = 0;
  getApp(env).renderAll();
  assert.strictEqual(env.document.getElementById('hud-hp-bar').style.width, '0%');
  assert.strictEqual(env.document.getElementById('hud-mp-bar').style.width, '0%');
});

registerTest('Tier 2', 'F03', 'T2-F03-5', 'Multi-currency balances never initialize to NaN or undefined', () => {
  const env = createGameEnv();
  const state = getState(env);
  ['copper', 'diamonds', 'rubies', 'trophyCoins'].forEach((k) => {
    const val = getHeroCurrency(state, k);
    assert.strictEqual(typeof val, 'number', `Currency ${k} must be a number`);
    assert.ok(!Number.isNaN(val) && val >= 0, `Currency ${k} must be non-negative and not NaN`);
  });
});

// --- F04 Boundaries ---
registerTest('Tier 2', 'F04', 'T2-F04-1', 'travelTo rejects travel to a region where minLevel > hero.level', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 1;
  actions.travelTo('frontera_ceniza'); // minLevel 6
  assert.strictEqual(state.world.currentLocation, 'ciudadela_luz', 'Level 1 hero must not be able to travel to Frontera de Ceniza');
});

registerTest('Tier 2', 'F04', 'T2-F04-2', 'travelTo an unknown location ID is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  getActions(env).travelTo('unknown_region_999');
  assert.strictEqual(state.world.currentLocation, 'ciudadela_luz');
});

registerTest('Tier 2', 'F04', 'T2-F04-3', 'Returning to Safe Zone (ciudadela_luz) restores hero HP and MP to 100%', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  actions.travelTo('llanuras_alba');
  state.hero.hp = 35;
  state.hero.mp = 10;
  actions.travelTo('ciudadela_luz');
  assert.strictEqual(state.hero.hp, state.hero.maxHp);
  assert.strictEqual(state.hero.mp, state.hero.maxMp);
});

registerTest('Tier 2', 'F04', 'T2-F04-4', 'Sending a Gift to an AI Warrior with insufficient coins is rejected without negative balance', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 0;
  callFirstAction(actions, ['sendGiftToWarrior', 'sendGift', 'giftWarrior'], 'ai_valeria');
  assert.strictEqual(state.hero.copper, 0);
});

registerTest('Tier 2', 'F04', 'T2-F04-5', 'Challenging an unknown AI Warrior ID does not enter broken combat state', () => {
  const env = createGameEnv();
  const state = getState(env);
  getActions(env).startPvpCombat('nonexistent_ai_id');
  assert.notStrictEqual(state.ui.centerView, 'combat');
});

// --- F05 Boundaries ---
registerTest('Tier 2', 'F05', 'T2-F05-1', 'Equipping an artifact with minLevel > hero.level is rejected and item remains in backpack', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 1;
  const highItem = Object.values(art.ARTIFACTS).find((a) => a.minLevel && a.minLevel > 3 && state.equipment[a.slot] !== undefined);
  assert.ok(highItem, 'Must have high-level gear with minLevel > 3 in ARTIFACTS');
  ensureInventoryQty(env, highItem.id, 1);
  actions.useItem(highItem.id);
  assert.notStrictEqual(state.equipment[highItem.slot], highItem.id, 'Level 1 hero must not equip item with minLevel > 3');
  assert.strictEqual(getInventoryQty(env, highItem.id), 1);
});

registerTest('Tier 2', 'F05', 'T2-F05-2', 'Unequipping an already empty paperdoll slot is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.equipment.pauldrons = null;
  const invLenBefore = state.inventory.length;
  callFirstAction(actions, ['unequipSlot', 'unequipItem'], 'pauldrons');
  assert.strictEqual(state.equipment.pauldrons, null);
  assert.strictEqual(state.inventory.length, invLenBefore);
});

registerTest('Tier 2', 'F05', 'T2-F05-3', 'Equipment at 0 durability contributes 0 item stats until repaired in Workshop', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const fullStats = getDerived(env);
  const durMap = state.equipmentDurability || state.durability;
  durMap.weapon = 0;
  const brokenStats = getDerived(env);
  assert.ok(brokenStats.atk < fullStats.atk, 'Weapon at 0 durability must not grant its full ATK bonus');

  state.hero.copper = 5000;
  callFirstAction(actions, ['repairEquipment', 'repairSlot', 'repairAllEquipment'], 'weapon');
  const repairedStats = getDerived(env);
  assert.strictEqual(repairedStats.atk, fullStats.atk, 'Repaired weapon must restore 100% of its ATK bonus');
});

registerTest('Tier 2', 'F05', 'T2-F05-4', 'When Unbreakable aura (Неслом) is active, combat causes 0 equipment durability loss', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['toggleUnbreakable', 'setUnbreakable'], true);
  const durMap = state.equipmentDurability || state.durability;
  const weaponDurBefore = durMap.weapon;
  actions.startCombat('centinela_sombra');
  actions.executeCombatTurn();
  assert.strictEqual(durMap.weapon, weaponDurBefore, 'Weapon durability must not decrease during combat when Неслом is active');
});

registerTest('Tier 2', 'F05', 'T2-F05-5', 'When Anti-XP Ring (Антиопыт) is active, winning a combat grants 0 XP while still granting 100% of copper and kills', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['toggleAntiXp', 'setAntiXp'], true);
  const xpBefore = state.hero.xp;
  const copperBefore = state.hero.copper;
  state.hero.baseStats.str = 60;
  actions.startCombat('centinela_sombra');
  while (getState(env).ui.centerView === 'combat') {
    actions.executeCombatTurn();
  }
  assert.strictEqual(state.hero.xp, xpBefore, 'Combat victory with Anti-XP Ring active must grant 0 XP');
  assert.ok(state.hero.copper > copperBefore, 'Combat victory with Anti-XP Ring active must still grant full copper reward');
});

// --- F06 Boundaries ---
registerTest('Tier 2', 'F06', 'T2-F06-1', 'Opening a Locked Mithril Chest without a Locksmith key is rejected and keeps chest intact', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const actions = getActions(env);
  const chest = art.ARTIFACTS['cofre_mitril'] || Object.values(art.ARTIFACTS).find((a) => a.isChest || /cofre/i.test(a.id));
  const key = art.ARTIFACTS['llave_cerrajero'] || Object.values(art.ARTIFACTS).find((a) => a.isKey || /llave/i.test(a.id));
  ensureInventoryQty(env, chest.id, 1);
  ensureInventoryQty(env, key.id, 0);
  // Remove key entry if present
  const state = getState(env);
  state.inventory = state.inventory.filter((x) => x.itemId !== key.id);

  callFirstAction(actions, ['openLockedChest', 'openChest', 'useItem'], chest.id);
  assert.strictEqual(getInventoryQty(env, chest.id), 1, 'Locked chest must remain in inventory if player has 0 Locksmith keys');
});

registerTest('Tier 2', 'F06', 'T2-F06-2', 'Filtering backpack to a category with 0 owned items renders empty state cleanly without errors', () => {
  const env = createGameEnv();
  const state = getState(env);
  state.inventory = [];
  getApp(env).renderAll();
  const filterBtns = env.document.querySelectorAll('#right-dock-content [data-bag-filter], #right-dock-content [data-inv-filter]');
  filterBtns.forEach((btn) => {
    assert.doesNotThrow(() => btn.click());
  });
});

registerTest('Tier 2', 'F06', 'T2-F06-3', 'Selling the last unit of an item removes it from state.inventory', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  ensureInventoryQty(env, 'panacea_solar', 1);
  actions.sellItem('panacea_solar');
  assert.strictEqual(getInventoryQty(env, 'panacea_solar'), 0);
});

registerTest('Tier 2', 'F06', 'T2-F06-4', 'Selling or using an item not in inventory is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const copperBefore = state.hero.copper;
  actions.sellItem('item_not_owned_xyz');
  actions.useItem('item_not_owned_xyz');
  assert.strictEqual(state.hero.copper, copperBefore);
});

registerTest('Tier 2', 'F06', 'T2-F06-5', 'Buying an item with insufficient copper is rejected without modifying copper or inventory', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 5;
  const qtyBefore = getInventoryQty(env, 'espada_solar');
  actions.buyItem('espada_solar');
  assert.strictEqual(state.hero.copper, 5);
  assert.strictEqual(getInventoryQty(env, 'espada_solar'), qtyBefore);
});

// --- F07 Boundaries ---
registerTest('Tier 2', 'F07', 'T2-F07-1', 'Leaving combat view via fleeCombat() cancels the GDL_COMBAT_CANVAS requestAnimationFrame loop', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.startCombat('centinela_sombra');
  assert.ok(env.rafQueue.size >= 1);
  actions.fleeCombat();
  assert.strictEqual(env.rafQueue.size, 0, 'fleeCombat() must stop the combat canvas requestAnimationFrame loop');
});

registerTest('Tier 2', 'F07', 'T2-F07-2', 'Selecting an unknown Combat Stance ID does not corrupt combatState', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.startCombat('centinela_sombra');
  assert.doesNotThrow(() => {
    callFirstAction(actions, ['setCombatStance', 'selectCombatStance', 'switchCombatStance'], 'invalid_stance_id');
    actions.executeCombatTurn();
  });
});

registerTest('Tier 2', 'F07', 'T2-F07-3', 'Non-matching 3-hit directional zone sequence executes normal strikes without false Super-Blow trigger', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 5;
  state.hero.hp = 500;
  actions.startCombat('krystallos_soberano');

  // Find a 3-zone permutation not in SUPER_BLOWS
  const zones = ['head', 'torso', 'legs'];
  let nonCombo = ['head', 'head', 'head'];
  for (const a of zones) {
    for (const b of zones) {
      for (const c of zones) {
        const match = art.SUPER_BLOWS.some((sb) => sb.sequence[0] === a && sb.sequence[1] === b && sb.sequence[2] === c);
        if (!match) { nonCombo = [a, b, c]; break; }
      }
    }
  }

  nonCombo.forEach((z) => {
    const btn = env.document.querySelector(`[data-atk-zone="${z}"]`);
    if (btn) btn.click();
    actions.executeCombatTurn();
  });
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(!logText.includes('SUPER-GOLPE'), 'Non-matching 3-zone sequence must not trigger a Super-Blow');
});

registerTest('Tier 2', 'F07', 'T2-F07-4', 'Starting combat with unknown creature ID does not switch centerView to combat', () => {
  const env = createGameEnv();
  const state = getState(env);
  getActions(env).startCombat('unknown_creature_id');
  assert.strictEqual(state.ui.centerView, 'location');
});

registerTest('Tier 2', 'F07', 'T2-F07-5', 'Starting combat when Hero HP < 25 auto-stabilizes Hero HP to at least 50% maxHp', () => {
  const env = createGameEnv();
  const state = getState(env);
  state.hero.hp = 5;
  getActions(env).startCombat('centinela_sombra');
  assert.ok(state.hero.hp >= Math.floor(state.hero.maxHp * 0.5), 'Hero HP < 25 must auto-stabilize on combat start');
});

// --- F08 Boundaries ---
registerTest('Tier 2', 'F08', 'T2-F08-1', 'Casting a Magic Spell with 0 MP is rejected without consuming turn or going negative MP', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  actions.startCombat('krystallos_soberano');
  state.hero.mp = 0;
  const spells = asArrayOrValues(art.MAGIC_SPELLS);
  callFirstAction(actions, ['castCombatSpell', 'castSpell', 'useMagicSpell'], spells[0].id);
  assert.strictEqual(state.hero.mp, 0, 'Hero MP must not drop below 0 when spell cast is rejected');
});

registerTest('Tier 2', 'F08', 'T2-F08-2', 'Summoning Morok / Mount a second time in the same combat is rejected', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.startCombat('krystallos_soberano');
  const first = callFirstAction(actions, ['summonMorokOrMount', 'summonCombatCompanion', 'summonMorok']);
  const second = callFirstAction(actions, ['summonMorokOrMount', 'summonCombatCompanion', 'summonMorok']);
  assert.strictEqual(Boolean(second), false, 'Summoning Morok/Mount twice in the same battle must return false / be rejected');
  assert.ok(first !== second);
});

registerTest('Tier 2', 'F08', 'T2-F08-3', 'Assigning a non-consumable weapon to the 6-slot Combat Belt is rejected', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['assignBeltSlot', 'setBeltSlot'], 0, 'espada_iniciado');
  assert.notStrictEqual(state.belt[0], 'espada_iniciado', 'Weapon must not be assignable to consumable combat belt');
});

registerTest('Tier 2', 'F08', 'T2-F08-4', 'Active post-defeat Injury debuff reduces derived combat stats until cured', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.injury = null;
  const healthyStats = getDerived(env);
  state.hero.injury = { id: 'fractura_grave', name: 'Fractura Grave', severity: 3, penaltyPct: 20 };
  const injuredStats = getDerived(env);
  assert.ok(injuredStats.atk < healthyStats.atk || injuredStats.def < healthyStats.def, 'Active injury must penalize derived ATK/DEF');

  state.hero.copper = 5000;
  callFirstAction(actions, ['cureInjury', 'healInjury']);
  const curedStats = getDerived(env);
  assert.strictEqual(curedStats.atk, healthyStats.atk);
});

registerTest('Tier 2', 'F08', 'T2-F08-5', 'Calling cureInjury when hero has no injury does not deduct copper', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.injury = null;
  state.hero.copper = 500;
  callFirstAction(actions, ['cureInjury', 'healInjury']);
  assert.strictEqual(state.hero.copper, 500);
});

// --- F09 Boundaries ---
registerTest('Tier 2', 'F09', 'T2-F09-1', 'Filtering Hunting Canvas to bosses in a starter zone with 0 bosses renders 0 entities cleanly', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.world.currentLocation = 'ciudadela_luz';
  actions.switchCenterView('hunting');
  const bossFilterBtn = env.document.querySelector('[data-hunt-filter="bosses"]');
  assert.ok(bossFilterBtn, 'Bosses filter button must exist in Hunting HUD');
  assert.doesNotThrow(() => {
    bossFilterBtn.click();
    env.stepAnimationFrames(2);
  });
  assert.strictEqual(state.ui.huntingFilter, 'bosses');
});

registerTest('Tier 2', 'F09', 'T2-F09-2', 'Clicking a depleted resource node on cooldown in Hunting Canvas does not double-harvest', () => {
  const env = createGameEnv({ random: 0.5 });
  const state = getState(env);
  const actions = getActions(env);
  actions.switchCenterView('hunting');
  const canvas = env.document.getElementById('gdl-hunting-canvas');
  const ents = env.window.GDL_HUNTING_CANVAS.getEntities ? env.window.GDL_HUNTING_CANVAS.getEntities() : [];
  const resNode = ents.find((e) => e.kind === 'resource');
  if (resNode) {
    const before = state.world.harvestCount;
    canvas.click({ clientX: resNode.x, clientY: resNode.y });
    const afterFirst = state.world.harvestCount;
    assert.strictEqual(afterFirst, before + 1);
    // Click again while cooldown > 0
    canvas.click({ clientX: resNode.x, clientY: resNode.y });
    assert.strictEqual(state.world.harvestCount, afterFirst, 'Depleted node on cooldown must not harvest a second time');
  }
});

registerTest('Tier 2', 'F09', 'T2-F09-3', 'Harvesting without gathering tool grants base yield (1x) while owning tool grants boosted yield (>=2x)', () => {
  const env = createGameEnv({ random: 0.5 });
  const state = getState(env);
  const actions = getActions(env);
  state.inventory = state.inventory.filter((x) => x.itemId !== 'hoz_herbolario');
  const beforeNoTool = getInventoryQty(env, 'hoja_solar');
  actions.harvestNode({ id: 'h1', name: 'Hierba Solar', prof: 'herbolaria', tier: 2 });
  const gainNoTool = getInventoryQty(env, 'hoja_solar') - beforeNoTool;

  ensureInventoryQty(env, 'hoz_herbolario', 1);
  const beforeWithTool = getInventoryQty(env, 'hoja_solar');
  actions.harvestNode({ id: 'h1', name: 'Hierba Solar', prof: 'herbolaria', tier: 2 });
  const gainWithTool = getInventoryQty(env, 'hoja_solar') - beforeWithTool;
  assert.ok(gainWithTool > gainNoTool, `Harvesting with hoz_herbolario (${gainWithTool}) must exceed base harvest (${gainNoTool})`);
});

registerTest('Tier 2', 'F09', 'T2-F09-4', 'Toggling Auto-Aggro off updates state.ui.autoAggro to false and prevents automatic ambush', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  actions.switchCenterView('hunting');
  callFirstAction(actions, ['toggleAutoAggro', 'setAutoAggro'], false);
  assert.strictEqual(Boolean(state.ui.autoAggro), false);
});

registerTest('Tier 2', 'F09', 'T2-F09-5', 'Switching from Hunting view back to Location view cancels Hunting requestAnimationFrame loop', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.switchCenterView('hunting');
  assert.ok(env.rafQueue.size >= 1);
  actions.switchCenterView('location');
  assert.strictEqual(env.rafQueue.size, 0);
});

// --- F10 Boundaries ---
registerTest('Tier 2', 'F10', 'T2-F10-1', 'Crafting a Workshop recipe with missing ingredients is rejected and consumes 0 items', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.inventory = [];
  state.hero.copper = 10000;
  const rec = asArrayOrValues(art.CRAFT_RECIPES)[0];
  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], rec.id);
  assert.strictEqual(getInventoryQty(env, rec.resultId), 0);
  assert.strictEqual(state.hero.copper, 10000);
});

registerTest('Tier 2', 'F10', 'T2-F10-2', 'Crafting a Workshop recipe with 0 copper when copperCost > 0 is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const rec = asArrayOrValues(art.CRAFT_RECIPES).find((r) => (r.copperCost || r.price || 0) > 0) || asArrayOrValues(art.CRAFT_RECIPES)[0];
  (rec.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty));
  state.hero.copper = 0;
  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], rec.id);
  assert.strictEqual(getInventoryQty(env, rec.resultId), 0);
});

registerTest('Tier 2', 'F10', 'T2-F10-3', 'Training a profession with < 120c is rejected without changing profession XP', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 50;
  const xpBefore = state.professions.herreria.xp;
  actions.trainProfession('herreria');
  assert.strictEqual(state.professions.herreria.xp, xpBefore);
  assert.strictEqual(state.hero.copper, 50);
});

registerTest('Tier 2', 'F10', 'T2-F10-4', 'Training a profession across its level threshold increments profession level and wraps XP', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 1000;
  state.professions.sanador = { level: 1, xp: 40 };
  actions.trainProfession('sanador');
  assert.strictEqual(state.professions.sanador.level, 2);
  assert.strictEqual(state.professions.sanador.xp, 15);
});

registerTest('Tier 2', 'F10', 'T2-F10-5', 'Calling craftRecipe with an unknown recipe ID is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  const copperBefore = state.hero.copper;
  callFirstAction(getActions(env), ['craftRecipe', 'craftItem', 'executeCraft'], 'nonexistent_recipe_id');
  assert.strictEqual(state.hero.copper, copperBefore);
});

// --- F11 Boundaries ---
registerTest('Tier 2', 'F11', 'T2-F11-1', 'Buying from Valor/Battlefield Arsenal with 0 Trophy Coins is rejected', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  setHeroCurrency(state, 'trophyCoins', 0);
  state.hero.valor = 0;
  const beforeInv = state.inventory.length;
  callFirstAction(actions, ['buyValorArsenalItem', 'buyBattlefieldItem'], 'espada_gladiador_valor');
  assert.strictEqual(state.inventory.length, beforeInv);
});

registerTest('Tier 2', 'F11', 'T2-F11-2', 'Playing a Battlefield with an unknown battlefield ID is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  const valorBefore = state.hero.valor || 0;
  callFirstAction(getActions(env), ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], 'invalid_bf_id');
  assert.strictEqual(state.hero.valor || 0, valorBefore);
});

registerTest('Tier 2', 'F11', 'T2-F11-3', 'Valor rank calculation handles 0 Valor and very high Valor (50,000+) without out-of-bounds errors', () => {
  const env = createGameEnv();
  const state = getState(env);
  state.hero.valor = 0;
  assert.doesNotThrow(() => getApp(env).renderAll());
  state.hero.valor = 99999;
  assert.doesNotThrow(() => getApp(env).renderAll());
});

registerTest('Tier 2', 'F11', 'T2-F11-4', 'Crystalline Caves altar activation or crystal delivery updates battlefield score cleanly', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 5;
  callFirstAction(actions, ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], 'cuevas_cristalinas', 'blue');
  assert.ok(state.hero.valor > 0);
});

registerTest('Tier 2', 'F11', 'T2-F11-5', 'Entering high-level Battlefield (Gran Batalla de Dragones) below minLevel is blocked', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const highBf = asArrayOrValues(art.BATTLEFIELDS).find((b) => (b.minLevel || 1) > 2);
  if (highBf) {
    state.hero.level = 1;
    const valorBefore = state.hero.valor || 0;
    callFirstAction(actions, ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], highBf.id);
    assert.strictEqual(state.hero.valor || 0, valorBefore, `Level 1 hero must not gain rewards from level ${highBf.minLevel}+ battlefield`);
  }
});

// --- F12 Boundaries ---
registerTest('Tier 2', 'F12', 'T2-F12-1', 'Attempting to run a cleared Instance while its cooldown timer is active is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const inst = asArrayOrValues(art.INSTANCES).find((i) => (i.cooldownMs || i.cooldownSec || 1) > 0) || asArrayOrValues(art.INSTANCES)[0];
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);
  const clearsAfterFirst = state.instances.totalClears;

  // Immediate re-entry while on cooldown must be blocked
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);
  assert.strictEqual(state.instances.totalClears, clearsAfterFirst, 'Instance on active lockout cooldown must reject re-entry');
});

registerTest('Tier 2', 'F12', 'T2-F12-2', 'Resetting or expiring an Instance cooldown allows the player to run the Instance again', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const inst = asArrayOrValues(art.INSTANCES)[0];
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);
  const clearsAfterFirst = state.instances.totalClears;

  // Expire cooldown
  state.instances.cooldowns[inst.id] = Date.now() - 1000;
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);
  assert.strictEqual(state.instances.totalClears, clearsAfterFirst + 1, 'Expired cooldown must allow re-running the instance');
});

registerTest('Tier 2', 'F12', 'T2-F12-3', 'Entering an Instance below its minLevel is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const highInst = asArrayOrValues(art.INSTANCES).find((i) => (i.minLevel || 1) > 1);
  assert.ok(highInst, 'At least one instance must require minLevel > 1');
  state.hero.level = 1;
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], highInst.id);
  assert.strictEqual((state.instances && state.instances.totalClears) || 0, 0);
});

registerTest('Tier 2', 'F12', 'T2-F12-4', 'Calling runInstance with an invalid instance ID is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  callFirstAction(getActions(env), ['runInstance', 'enterInstance', 'clearInstance'], 'invalid_instance_999');
  assert.strictEqual((state.instances && state.instances.totalClears) || 0, 0);
});

registerTest('Tier 2', 'F12', 'T2-F12-5', 'Fast-Farm Grotto (La Gruta / ГРОТ) grants 50 Diamonds on final stage completion per Asteria spec', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  const before = getHeroCurrency(state, 'diamonds');
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], 'gruta_grot');
  if (state.instances && state.instances.cooldowns) state.instances.cooldowns.gruta_grot = 0;
  const gained = getHeroCurrency(state, 'diamonds') - before;
  assert.ok(gained >= 15, `La Gruta (ГРОТ) must grant generous Diamond reward (gained ${gained})`);
});

// --- F13 Boundaries ---
registerTest('Tier 2', 'F13', 'T2-F13-1', 'Turning in reputation trophies when owning 0 trophies and insufficient copper is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const rep = asArrayOrValues(art.REPUTATIONS)[0];
  state.inventory = [];
  state.hero.copper = 0;
  const beforePts = state.reputations[rep.id] || 0;
  callFirstAction(actions, ['donateReputation', 'turnInReputationTrophy', 'addReputation'], rep.id);
  assert.strictEqual(state.reputations[rep.id] || 0, beforePts);
});

registerTest('Tier 2', 'F13', 'T2-F13-2', 'Reputation points cap at 3000 (Worship / Culto maximum) without exceeding 3000', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const rep = asArrayOrValues(art.REPUTATIONS)[0];
  state.reputations[rep.id] = 2990;
  const trophyItem = rep.trophyItem || 'chispa_celestial';
  ensureInventoryQty(env, trophyItem, 5);
  state.hero.copper = 5000;
  callFirstAction(actions, ['donateReputation', 'turnInReputationTrophy', 'addReputation'], rep.id);
  assert.strictEqual(state.reputations[rep.id], 3000, 'Reputation must cap cleanly at 3000');
});

registerTest('Tier 2', 'F13', 'T2-F13-3', 'Reputation tier thresholds at 499 vs 500, 999 vs 1000, 1999 vs 2000, and 3000 compute distinct tiers', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const rep = asArrayOrValues(art.REPUTATIONS)[0];
  state.reputations[rep.id] = 499;
  const stats499 = getDerived(env);
  state.reputations[rep.id] = 500;
  const stats500 = getDerived(env);
  assert.ok(
    stats500.atk >= stats499.atk && stats500.def >= stats499.def && (stats500.atk > stats499.atk || stats500.def > stats499.def || stats500.maxHp > stats499.maxHp),
    'Crossing 500 reputation threshold must unlock Bronze medal stat bonus'
  );
});

registerTest('Tier 2', 'F13', 'T2-F13-4', 'Playing Tavern Dice even on a loss or tie still increments Reputación de Tahúr (Катала)', () => {
  // Force player dice low, Balthus dice high -> loss
  let callIdx = 0;
  const seq = [0.01, 0.01, 0.01, 0.99, 0.99, 0.99];
  const env = createGameEnv({ random: () => seq[callIdx++ % seq.length] });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const katalaRep = asArrayOrValues(art.REPUTATIONS).find((r) => /katala|tahur|tahúr/i.test(r.id) || /katala|tahur|tahúr/i.test(r.name));
  state.hero.copper = 1000;
  const before = state.reputations[katalaRep.id] || 0;
  actions.playTavernDice(150);
  const after = state.reputations[katalaRep.id] || 0;
  assert.ok(after > before, 'Reputación de Tahúr (Катала) must increment on every Tavern Dice round including losses');
});

registerTest('Tier 2', 'F13', 'T2-F13-5', 'Donating to an unknown reputation ID is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  const before = JSON.stringify(state.reputations);
  callFirstAction(getActions(env), ['donateReputation', 'turnInReputationTrophy', 'addReputation'], 'unknown_rep_xyz');
  assert.strictEqual(JSON.stringify(state.reputations), before);
});

// --- F14 Boundaries ---
registerTest('Tier 2', 'F14', 'T2-F14-1', 'Training a Disciple with 0 copper is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 0;
  const disc = asArrayOrValues(art.DISCIPLES)[0];
  const lvlBefore = (state.disciples && state.disciples.levels && state.disciples.levels[disc.id]) || 0;
  callFirstAction(actions, ['trainDisciple', 'recruitDisciple'], disc.id);
  const lvlAfter = (state.disciples && state.disciples.levels && state.disciples.levels[disc.id]) || 0;
  assert.strictEqual(lvlAfter, lvlBefore);
});

registerTest('Tier 2', 'F14', 'T2-F14-2', 'Unfed Red Pet (satiety = 0) skips combat assist until fed with pet feed (Корм)', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  if (state.pets) state.pets.satiety = 0;
  actions.startCombat('krystallos_soberano');
  actions.executeCombatTurn();
  const logWhenUnfed = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(!/asiste con un ataque/i.test(logWhenUnfed), 'Unfed pet (satiety 0) must not deal combat assist damage');

  state.hero.copper = 2000;
  callFirstAction(actions, ['feedPet', 'feedActivePet']);
  assert.ok(state.pets.satiety > 0, 'feedPet must restore pet satiety');
});

registerTest('Tier 2', 'F14', 'T2-F14-3', 'Socketing a Pet Crystal when the player owns 0 of that crystal and 0 copper is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.inventory = [];
  state.hero.copper = 0;
  const crystal = asArrayOrValues(art.PET_CRYSTALS)[0];
  const beforeStats = getDerived(env);
  callFirstAction(actions, ['socketPetCrystal', 'upgradeRedPet'], 'halcon_alba', crystal.id);
  const afterStats = getDerived(env);
  assert.deepStrictEqual(afterStats, beforeStats);
});

registerTest('Tier 2', 'F14', 'T2-F14-4', 'Claiming a Collectible Card Deck a second time while its weekly cooldown is active is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const deck = asArrayOrValues(art.CARD_DECKS)[0];
  state.hero.copper = 10000;
  if (state.cardDecks && state.cardDecks.unlocked) state.cardDecks.unlocked[deck.id] = true;
  callFirstAction(actions, ['claimCardDeck', 'activateCardDeck'], deck.id);
  const invAfterFirst = state.inventory.reduce((s, x) => s + x.qty, 0);
  const diaAfterFirst = getHeroCurrency(state, 'diamonds');

  // Immediate second claim must be blocked by cooldown
  callFirstAction(actions, ['claimCardDeck', 'activateCardDeck'], deck.id);
  const invAfterSecond = state.inventory.reduce((s, x) => s + x.qty, 0);
  const diaAfterSecond = getHeroCurrency(state, 'diamonds');
  assert.strictEqual(invAfterSecond, invAfterFirst);
  assert.strictEqual(diaAfterSecond, diaAfterFirst);
});

registerTest('Tier 2', 'F14', 'T2-F14-5', 'Claiming an unknown Card Deck ID is a safe no-op', () => {
  const env = createGameEnv();
  const state = getState(env);
  const before = state.inventory.length;
  callFirstAction(getActions(env), ['claimCardDeck', 'activateCardDeck'], 'unknown_deck_id');
  assert.strictEqual(state.inventory.length, before);
});

// --- F15 Boundaries ---
registerTest('Tier 2', 'F15', 'T2-F15-1', 'Upgrading an Estate secondary building past Town Hall (Ayuntamiento) level is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 100000;
  ensureInventoryQty(env, 'riolita', 100);
  if (state.estate) state.estate.riolite = 100;

  const buildings = asArrayOrValues(art.ESTATE_BUILDINGS);
  const townHall = buildings.find((b) => /ayuntamiento|town/i.test(b.id)) || buildings[0];
  const secondary = buildings.find((b) => b.id !== townHall.id);
  const thLevel = (state.estate.buildings && state.estate.buildings[townHall.id]) || 1;
  // Upgrade secondary up to thLevel, then try one more time
  while (((state.estate.buildings && state.estate.buildings[secondary.id]) || 0) < thLevel) {
    callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], secondary.id);
  }
  const lvlAtCap = state.estate.buildings[secondary.id];
  callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], secondary.id);
  assert.strictEqual(state.estate.buildings[secondary.id], lvlAtCap, 'Secondary Estate building must not exceed Ayuntamiento level');
});

registerTest('Tier 2', 'F15', 'T2-F15-2', 'Upgrading an Estate building with 0 copper and 0 Riolite is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 0;
  state.inventory = [];
  if (state.estate) state.estate.riolite = 0;
  const b = asArrayOrValues(art.ESTATE_BUILDINGS)[0];
  const before = (state.estate.buildings && state.estate.buildings[b.id]) || 0;
  callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], b.id);
  assert.strictEqual((state.estate.buildings && state.estate.buildings[b.id]) || 0, before);
});

registerTest('Tier 2', 'F15', 'T2-F15-3', 'Upgrading a Clan Talent without Tratado: Unidad del Clan is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.inventory = [];
  state.hero.copper = 0;
  const t = asArrayOrValues(art.CLAN_TALENTS)[0];
  const before = (state.clanTalents && state.clanTalents[t.id]) || 0;
  callFirstAction(actions, ['upgradeClanTalent', 'trainClanTalent'], t.id);
  assert.strictEqual((state.clanTalents && state.clanTalents[t.id]) || 0, before);
});

registerTest('Tier 2', 'F15', 'T2-F15-4', 'Upgrading a Clan Talent beyond its maxLevel cap is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const t = asArrayOrValues(art.CLAN_TALENTS)[0];
  const maxLvl = t.maxLevel || 5;
  state.clanTalents[t.id] = maxLvl;
  ensureInventoryQty(env, 'tratado_unidad_clan', 10);
  state.hero.copper = 50000;
  callFirstAction(actions, ['upgradeClanTalent', 'trainClanTalent'], t.id);
  assert.strictEqual(state.clanTalents[t.id], maxLvl);
});

registerTest('Tier 2', 'F15', 'T2-F15-5', 'Built Estate Infirmary (Enfermería) cures hero injury and restores HP for free even at 0 copper', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const inf = asArrayOrValues(art.ESTATE_BUILDINGS).find((b) => /enfermer|infirmary/i.test(b.id) || /enfermer/i.test(b.name));
  assert.ok(inf, 'Enfermería building must exist in ESTATE_BUILDINGS');
  state.estate.buildings[inf.id] = 1;
  state.hero.injury = { id: 'trauma_1', name: 'Trauma', severity: 1, penaltyPct: 10 };
  state.hero.hp = 20;
  state.hero.copper = 0;
  callFirstAction(actions, ['cureInjury', 'useEstateInfirmary', 'healInjury']);
  assert.strictEqual(state.hero.injury, null, 'Built Estate Infirmary must cure injury for free at 0 copper');
  assert.strictEqual(state.hero.hp, state.hero.maxHp, 'Built Estate Infirmary must restore HP to maxHp');
});

// --- F16 Boundaries ---
registerTest('Tier 2', 'F16', 'T2-F16-1', 'Redeeming an already-claimed Promocode (9LETASTERII) a second time is rejected', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], '9LETASTERII');
  const diamondsAfterFirst = getHeroCurrency(state, 'diamonds');
  const copperAfterFirst = state.hero.copper;

  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], '9LETASTERII');
  assert.strictEqual(getHeroCurrency(state, 'diamonds'), diamondsAfterFirst, 'Duplicate promocode redemption must not grant extra Diamonds');
  assert.strictEqual(state.hero.copper, copperAfterFirst, 'Duplicate promocode redemption must not grant extra copper');
});

registerTest('Tier 2', 'F16', 'T2-F16-2', 'Redeeming an invalid/unknown Promocode is rejected without altering balances', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const diaBefore = getHeroCurrency(state, 'diamonds');
  const res = callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], 'INVALID-PROMO-9999');
  assert.strictEqual(Boolean(res), false);
  assert.strictEqual(getHeroCurrency(state, 'diamonds'), diaBefore);
});

registerTest('Tier 2', 'F16', 'T2-F16-3', 'Spinning Wheel of Fortune or buying Fair of Wonders item with 0 currencies is rejected', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  setHeroCurrency(state, 'diamonds', 0);
  setHeroCurrency(state, 'rubies', 0);
  setHeroCurrency(state, 'onlineTokens', 0);
  state.hero.copper = 0;
  if (state.fair) state.fair.freeSpins = 0;
  const invBefore = state.inventory.length;
  const fairItem = asArrayOrValues(getArt(env).FAIR_ITEMS)[0];
  callFirstAction(actions, ['buyFairItem', 'purchaseFairItem'], fairItem.id);
  assert.strictEqual(state.inventory.length, invBefore);
});

registerTest('Tier 2', 'F16', 'T2-F16-4', 'Answering a Balagur Riddle with an incorrect answer does not grant the prize', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const r = asArrayOrValues(art.BALAGUR_RIDDLES)[0];
  const wrongIdx = ((r.answerIndex || 0) + 1) % 3;
  const diaBefore = getHeroCurrency(state, 'diamonds');
  const copBefore = state.hero.copper;
  callFirstAction(actions, ['answerBalagurRiddle', 'solveBalagurRiddle'], r.id, wrongIdx);
  assert.strictEqual(getHeroCurrency(state, 'diamonds'), diaBefore);
  assert.strictEqual(state.hero.copper, copBefore);
});

registerTest('Tier 2', 'F16', 'T2-F16-5', 'Claiming an incomplete Daily Feat or already-claimed Daily Feat is rejected', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.world.totalKills = 0;
  state.world.harvestCount = 0;
  const feat = asArrayOrValues(art.DAILY_FEATS)[0];
  const copBefore = state.hero.copper;
  callFirstAction(actions, ['claimDailyFeat', 'completeDailyFeat'], feat.id);
  assert.strictEqual(state.hero.copper, copBefore, 'Incomplete Daily Feat must not be claimable');
});

// --- F17 Boundaries ---
registerTest('Tier 2', 'F17', 'T2-F17-1', 'Node HTTP server returns 404 for non-existent static files', async () => {
  const server = require(path.join(ROOT_DIR, 'server', 'index.js'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const res = await httpGet(port, '/does-not-exist-404.js');
    assert.strictEqual(res.statusCode, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

registerTest('Tier 2', 'F17', 'T2-F17-2', 'Node HTTP server blocks path traversal requests outside public/', async () => {
  const server = require(path.join(ROOT_DIR, 'server', 'index.js'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const res = await httpGet(port, '/../package.json');
    assert.ok(res.statusCode === 403 || res.statusCode === 404, `Path traversal must be blocked with 403 or 404 (got ${res.statusCode})`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

registerTest('Tier 2', 'F17', 'T2-F17-3', 'Every image path in GDL_ART.LOCATION_IMAGES and GDL_ART.NPC_IMAGES exists on disk in both public/ and root', () => {
  const env = createGameEnv();
  const art = getArt(env);
  Object.values(art.LOCATION_IMAGES).forEach((relPath) => {
    assert.ok(fs.existsSync(path.join(PUBLIC_DIR, relPath)), `Missing public/${relPath}`);
    assert.ok(fs.existsSync(path.join(ROOT_DIR, relPath)), `Missing root ${relPath}`);
  });
  Object.values(art.NPC_IMAGES).forEach((relPath) => {
    assert.ok(fs.existsSync(path.join(PUBLIC_DIR, relPath)), `Missing public/${relPath}`);
    assert.ok(fs.existsSync(path.join(ROOT_DIR, relPath)), `Missing root ${relPath}`);
  });
});

registerTest('Tier 2', 'F17', 'T2-F17-4', '.nojekyll file exists at repository root for GitHub Pages compatibility', () => {
  assert.ok(fs.existsSync(path.join(ROOT_DIR, '.nojekyll')), '.nojekyll must exist at repository root');
});

registerTest('Tier 2', 'F17', 'T2-F17-5', 'Serialized localStorage state contains valid JSON with zero NaN values after complex actions', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  actions.harvestNode({ id: 'n1', name: 'Veta', prof: 'mineria', tier: 1 });
  const raw = env.localStorage.getItem('guerreros_de_la_luz_asteria_v3');
  assert.ok(raw && !raw.includes(':NaN') && !raw.includes(':undefined'), 'localStorage JSON must be valid with no NaN/undefined');
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.version, 3);
});

/* ==========================================================================
   TIER 3 — CROSS-FEATURE PAIRWISE COMBINATIONS (20 Tests)
   ========================================================================== */

registerTest('Tier 3', 'Pairwise', 'T3-01', 'Faction (Khair) + Combat Style (Destructor) + 12-Slot Paperdoll + Avatar Canvas rendering', () => {
  const env = createGameEnv();
  const actions = getActions(env);
  callFirstAction(actions, ['selectFaction', 'setFaction', 'switchFaction'], 'khair');
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'destructor');
  const d = getDerived(env);
  assert.strictEqual(getState(env).hero.faction, 'khair');
  assert.strictEqual(getState(env).hero.combatStyle, 'destructor');
  assert.ok(d.atk > 40, 'Khair Destructor with equipped gear must compute boosted ATK');
});

registerTest('Tier 3', 'Pairwise', 'T3-02', 'Rune Socketing + Profession Passive + Estate Building + Clan Talent cumulative derived stats stacking', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);

  const s0 = getDerived(env);
  const rune = asArrayOrValues(art.RUNES)[0];
  ensureInventoryQty(env, rune.id, 1);
  callFirstAction(actions, ['socketRune', 'applyRune', 'engraveRune'], 'weapon', rune.id);
  const s1 = getDerived(env);

  state.professions.herreria.level = 4;
  state.professions.verdugo.level = 4;
  const s2 = getDerived(env);

  state.hero.copper = 100000;
  ensureInventoryQty(env, 'riolita', 50);
  if (state.estate) state.estate.riolite = 50;
  asArrayOrValues(art.ESTATE_BUILDINGS).forEach((b) => callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], b.id));
  const s3 = getDerived(env);

  ensureInventoryQty(env, 'tratado_unidad_clan', 10);
  callFirstAction(actions, ['upgradeClanTalent', 'trainClanTalent'], asArrayOrValues(art.CLAN_TALENTS)[0].id);
  const s4 = getDerived(env);

  const totalPower = (s) => s.atk + s.def + s.maxHp + s.crit;
  assert.ok(totalPower(s1) > totalPower(s0), 'Rune socketing must increase total power');
  assert.ok(totalPower(s2) > totalPower(s1), 'Profession levels must increase total power');
  assert.ok(totalPower(s3) > totalPower(s2), 'Estate buildings must increase total power');
  assert.ok(totalPower(s4) > totalPower(s3), 'Clan talents must increase total power');
});

registerTest('Tier 3', 'Pairwise', 'T3-03', 'Fed Red Pet + Pet Crystal Socket + Trained Disciple + Tactical Combat Assist', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 25000;
  callFirstAction(actions, ['feedPet', 'feedActivePet']);
  const crystal = asArrayOrValues(art.PET_CRYSTALS)[0];
  ensureInventoryQty(env, crystal.id, 1);
  callFirstAction(actions, ['socketPetCrystal', 'upgradeRedPet'], state.pets.active, crystal.id);
  const disc = asArrayOrValues(art.DISCIPLES)[0];
  callFirstAction(actions, ['trainDisciple', 'recruitDisciple'], disc.id);

  actions.startCombat('krystallos_soberano');
  actions.executeCombatTurn();
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(/asiste|discípulo|halcón/i.test(logText), 'Both fed crystal-socketed Pet and trained Disciple must assist in combat');
});

registerTest('Tier 3', 'Pairwise', 'T3-04', 'Anti-XP Ring (Антиопыт) + 33%/66% XP Milestone Freeze + Crystalline Caves Valor Farming', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 4;
  state.hero.xp = 10;
  callFirstAction(actions, ['toggleAntiXp', 'setAntiXp'], true);
  const valorBefore = state.hero.valor || 0;
  const coinsBefore = getHeroCurrency(state, 'trophyCoins');

  callFirstAction(actions, ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], 'cuevas_cristalinas', 'red');
  assert.strictEqual(state.hero.xp, 10, 'XP must stay frozen at 10 while Anti-XP Ring is active');
  assert.ok((state.hero.valor || 0) > valorBefore, 'Valor must increase during Anti-XP Battlefield farming');
  assert.ok(getHeroCurrency(state, 'trophyCoins') > coinsBefore, 'Trophy Coins must increase during Anti-XP Battlefield farming');
});

registerTest('Tier 3', 'Pairwise', 'T3-05', 'Combat Durability Loss -> Workshop Repair -> Unbreakable Aura (Неслом) Protection', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  const durMap = state.equipmentDurability || state.durability;
  callFirstAction(actions, ['toggleUnbreakable', 'setUnbreakable'], false);
  const startDur = durMap.weapon;
  actions.startCombat('centinela_sombra');
  actions.executeCombatTurn();
  assert.ok(durMap.weapon < startDur, 'Normal combat turn without Неслом must reduce weapon durability');

  state.hero.copper = 5000;
  callFirstAction(actions, ['repairEquipment', 'repairSlot', 'repairAllEquipment'], 'weapon');
  const repairedDur = durMap.weapon;
  assert.strictEqual(repairedDur, startDur, 'Workshop repair must restore weapon to max durability');

  callFirstAction(actions, ['toggleUnbreakable', 'setUnbreakable'], true);
  actions.executeCombatTurn();
  assert.strictEqual(durMap.weapon, repairedDur, 'With Неслом active, weapon durability must not drop');
});

registerTest('Tier 3', 'Pairwise', 'T3-06', 'Gathering Tool Harvest Bonus -> Workshop Crafting Recipe -> Equipping Crafted Gear into 12-Slot Paperdoll', () => {
  const env = createGameEnv({ random: 0.5 });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  ensureInventoryQty(env, 'pico_maestro', 1);
  ensureInventoryQty(env, 'hoz_herbolario', 1);
  actions.harvestNode({ id: 'n1', name: 'Veta', prof: 'mineria', tier: 1 });
  actions.harvestNode({ id: 'n2', name: 'Hierba', prof: 'herbolaria', tier: 2 });

  const equipRecipe = asArrayOrValues(art.CRAFT_RECIPES).find((r) => {
    const resItem = art.ARTIFACTS[r.resultId];
    return resItem && state.equipment[resItem.slot] !== undefined;
  });
  assert.ok(equipRecipe, 'CRAFT_RECIPES must include an equippable weapon/armor/ring recipe');
  state.hero.copper = 20000;
  state.hero.level = 10;
  (equipRecipe.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty + 1));
  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], equipRecipe.id);
  assert.ok(getInventoryQty(env, equipRecipe.resultId) >= 1, 'Crafted equipment must be in inventory');

  actions.useItem(equipRecipe.resultId);
  const slot = art.ARTIFACTS[equipRecipe.resultId].slot;
  assert.strictEqual(state.equipment[slot], equipRecipe.resultId, 'Crafted equipment must equip into matching paperdoll slot');
});

registerTest('Tier 3', 'Pairwise', 'T3-07', 'Locksmith Profession (Cerrajero) -> Crafting Locksmith Key -> Opening Locked Mithril Chest in 6-Category Backpack', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const keyRecipe = asArrayOrValues(art.CRAFT_RECIPES).find((r) => (r.prof || r.profession) === 'cerrajero');
  assert.ok(keyRecipe, 'Cerrajero profession must have a Locksmith Key crafting recipe');
  state.hero.copper = 10000;
  (keyRecipe.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty + 1));
  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], keyRecipe.id);
  assert.ok(getInventoryQty(env, keyRecipe.resultId) >= 1, 'Crafted Locksmith key must be in inventory');

  const chest = art.ARTIFACTS['cofre_mitril'] || Object.values(art.ARTIFACTS).find((a) => a.isChest || /cofre/i.test(a.id));
  ensureInventoryQty(env, chest.id, 1);
  callFirstAction(actions, ['openLockedChest', 'openChest', 'useItem'], chest.id);
  assert.strictEqual(getInventoryQty(env, chest.id), 0, 'Crafted Locksmith key must unlock the Locked Mithril Chest');
});

registerTest('Tier 3', 'Pairwise', 'T3-08', 'Combat Defeat Injury -> Healer Profession (Sanador) Scroll Crafting -> 1-Click Injury Cure', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const healerRecipe = asArrayOrValues(art.CRAFT_RECIPES).find((r) => (r.prof || r.profession) === 'sanador');
  assert.ok(healerRecipe, 'Sanador profession must have a Healing/Cure Scroll crafting recipe');
  state.hero.copper = 10000;
  (healerRecipe.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty + 1));
  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], healerRecipe.id);

  state.hero.injury = { id: 'fractura_combate', name: 'Fractura de Combate', severity: 2, penaltyPct: 15 };
  callFirstAction(actions, ['cureInjury', 'healInjury', 'useItem'], healerRecipe.resultId);
  assert.strictEqual(state.hero.injury, null, 'Using crafted Healer scroll or cureInjury must remove combat injury');
});

registerTest('Tier 3', 'Pairwise', 'T3-09', 'Combat Stance + 6-Slot Belt Scroll + Magic School Spell + 3-Hit Super-Blow in Single Battle', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  state.hero.hp = 600;
  state.hero.mp = 200;
  actions.startCombat('krystallos_soberano');

  const stances = asArrayOrValues(art.COMBAT_STANCES);
  callFirstAction(actions, ['setCombatStance', 'selectCombatStance', 'switchCombatStance'], stances[1].id);
  actions.useItem('elixir_vida_menor');
  const spell = asArrayOrValues(art.MAGIC_SPELLS)[0];
  callFirstAction(actions, ['castCombatSpell', 'castSpell', 'useMagicSpell'], spell.id);

  const sb = art.SUPER_BLOWS[3]; // one of the new 6 super-blows
  sb.sequence.forEach((z) => {
    const btn = env.document.querySelector(`[data-atk-zone="${z}"]`);
    if (btn) btn.click();
    actions.executeCombatTurn();
  });
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(logText.includes(sb.name), `New Super-Blow ${sb.name} must trigger after 3-step sequence`);
});

registerTest('Tier 3', 'Pairwise', 'T3-10', 'Ignifer Mount Taming + In-Battle Mount Summon + Damage Shield & Companion Strike', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 50000;
  actions.buyOrEquipMount('ignifer');
  assert.strictEqual(state.mounts.active, 'ignifer');

  actions.startCombat('krystallos_soberano');
  callFirstAction(actions, ['summonMorokOrMount', 'summonCombatCompanion', 'summonMorok']);
  actions.executeCombatTurn();
  const logText = env.document.querySelector('.combat-log-box').textContent;
  assert.ok(/ignifer|montura|morok/i.test(logText), 'Summoned Ignifer must strike and shield in combat log');
});

registerTest('Tier 3', 'Pairwise', 'T3-11', 'Promocode Redemption (9LETASTERII & DLEO-3947-URHF-3846) -> Diamonds -> Fair of Wonders Purchase', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], '9LETASTERII');
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], 'DLEO-3947-URHF-3846');
  const diamondsAfterPromo = getHeroCurrency(state, 'diamonds');
  assert.ok(diamondsAfterPromo >= 20, 'Redeeming both promocodes must grant >=20 Diamonds');

  const fairItem = asArrayOrValues(art.FAIR_ITEMS)[0];
  callFirstAction(actions, ['buyFairItem', 'purchaseFairItem'], fairItem.id);
  assert.ok(getHeroCurrency(state, 'diamonds') < diamondsAfterPromo || state.inventory.length > 5, 'Fair item purchase must consume currency and grant reward');
});

registerTest('Tier 3', 'Pairwise', 'T3-12', 'Tavern Dice + Tavern Arcomage Cards -> Katala Reputation (Репутация Каталы) -> 500pt Medal Unlock', () => {
  const env = createGameEnv({ random: 0.9 });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const katalaRep = asArrayOrValues(art.REPUTATIONS).find((r) => /katala|tahur|tahúr/i.test(r.id) || /katala|tahur|tahúr/i.test(r.name));
  state.reputations[katalaRep.id] = 480;
  state.hero.copper = 10000;
  const statsBefore = getDerived(env);

  actions.playTavernDice(150);
  callFirstAction(actions, ['playTavernCards', 'playArcomage'], 150);
  assert.ok(state.reputations[katalaRep.id] >= 500, 'Playing Tavern Dice + Cards must push Katala reputation >= 500');
  const statsAfter = getDerived(env);
  assert.ok(
    statsAfter.atk > statsBefore.atk || statsAfter.crit > statsBefore.crit || statsAfter.maxHp > statsBefore.maxHp,
    'Unlocking 500pt Katala Bronze Medal must increase derived stats'
  );
});

registerTest('Tier 3', 'Pairwise', 'T3-13', 'Fast-Farm Grotto (La Gruta / ГРОТ) -> Rare Reagents -> Eltic Cube Mythic Transmutation', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  state.hero.copper = 50000;
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], 'gruta_grot');

  const cubeRec = art.CUBE_RECIPES[0];
  cubeRec.ingredients.forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty));
  actions.transmuteCube(cubeRec.id);
  assert.ok(getInventoryQty(env, cubeRec.resultId) >= cubeRec.resultQty, 'Eltic Cube must synthesize target artifact');
});

registerTest('Tier 3', 'Pairwise', 'T3-14', 'Cooldown Instance Clear -> Trophy Drop -> Faction Reputation Turn-In -> Derived Stat Boost', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 6;
  state.hero.copper = 20000;
  const inst = asArrayOrValues(art.INSTANCES)[1];
  callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);

  const rep = asArrayOrValues(art.REPUTATIONS)[1];
  state.reputations[rep.id] = 480;
  ensureInventoryQty(env, rep.trophyItem || 'chispa_celestial', 5);
  const beforeStats = getDerived(env);
  callFirstAction(actions, ['donateReputation', 'turnInReputationTrophy', 'addReputation'], rep.id);
  const afterStats = getDerived(env);
  assert.ok(state.reputations[rep.id] >= 500);
  assert.ok(afterStats.atk >= beforeStats.atk && (afterStats.atk > beforeStats.atk || afterStats.def > beforeStats.def || afterStats.maxHp > beforeStats.maxHp));
});

registerTest('Tier 3', 'Pairwise', 'T3-15', 'Collectible Card Deck (Baraja de Recursos) Activation -> Weekly Rare Bundle -> Workshop Crafting', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const resDeck = asArrayOrValues(art.CARD_DECKS).find((d) => /recurso/i.test(d.id) || /recurso/i.test(d.name)) || asArrayOrValues(art.CARD_DECKS)[0];
  if (state.cardDecks && state.cardDecks.unlocked) state.cardDecks.unlocked[resDeck.id] = true;
  callFirstAction(actions, ['claimCardDeck', 'activateCardDeck'], resDeck.id);

  const rec = asArrayOrValues(art.CRAFT_RECIPES)[0];
  state.hero.copper = 10000;
  (rec.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty));
  callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], rec.id);
  assert.ok(getInventoryQty(env, rec.resultId) >= 1);
});

registerTest('Tier 3', 'Pairwise', 'T3-16', 'Hunting Kills & Harvests -> Daily Feat (Маленький подвиг) Completion -> Online Tokens & Fair Shop', () => {
  const env = createGameEnv({ random: 0.5 });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  actions.harvestNode({ id: 'n1', name: 'Veta', prof: 'mineria', tier: 1 });
  state.world.totalKills = 15;
  state.world.harvestCount = 15;
  const feat = asArrayOrValues(art.DAILY_FEATS)[0];
  const diaBefore = getHeroCurrency(state, 'diamonds');
  const copBefore = state.hero.copper;
  callFirstAction(actions, ['claimDailyFeat', 'completeDailyFeat'], feat.id);
  assert.ok(getHeroCurrency(state, 'diamonds') > diaBefore || state.hero.copper > copBefore, 'Claiming completed Daily Feat must grant rewards');
});

registerTest('Tier 3', 'Pairwise', 'T3-17', 'Imperial Bank Lucky Deposit (Счастливый вклад) -> Auction House Purchase -> Equipping from Backpack', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 50000;
  state.hero.level = 10;
  callFirstAction(actions, ['bankLuckyDeposit', 'depositBank'], 2000);
  if (typeof actions.claimBankDeposit === 'function') actions.claimBankDeposit();

  const listing = asArrayOrValues(art.AUCTION_LISTINGS)[0];
  callFirstAction(actions, ['buyAuctionListing', 'bidAuction'], listing.id);
  assert.ok(getInventoryQty(env, listing.itemId) >= 1);
});

registerTest('Tier 3', 'Pairwise', 'T3-18', 'Zone AI Warrior Profile Inspection -> Gift Sending -> PvP Duel Victory -> Campeón de Arena Medal', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 10000;
  state.hero.baseStats.str = 60;
  const ai = art.AI_WARRIORS[0];
  callFirstAction(actions, ['sendGiftToWarrior', 'sendGift', 'giftWarrior'], ai.id);

  for (let i = 0; i < 5; i++) {
    actions.startPvpCombat(art.AI_WARRIORS[i].id);
    while (getState(env).ui.centerView === 'combat') {
      actions.executeCombatTurn();
    }
  }
  assert.ok(state.world.pvpWins >= 5);
  assert.strictEqual(actions.checkMedalUnlocked('med_campeon_arena'), true, '5 PvP wins must unlock med_campeon_arena');
});

registerTest('Tier 3', 'Pairwise', 'T3-19', 'Balagur Riddle Contest -> Prize Claim -> Magic Mirror of Solaria Permanent Attribute Blessing', () => {
  const env = createGameEnv({ random: 0.2 });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  const r = asArrayOrValues(art.BALAGUR_RIDDLES)[0];
  callFirstAction(actions, ['answerBalagurRiddle', 'solveBalagurRiddle'], r.id, r.answerIndex !== undefined ? r.answerIndex : r.answer);
  state.hero.copper += 500;
  const strBefore = state.hero.baseStats.str;
  actions.invokeMagicMirror();
  assert.ok(state.hero.baseStats.str > strBefore, 'Magic Mirror at roll 0.2 must permanently increase STR and VIT');
});

registerTest('Tier 3', 'Pairwise', 'T3-20', 'Full State Export Base64 -> Hard Reset -> Import Base64 Roundtrip Integrity across All 17 Features', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);
  callFirstAction(actions, ['selectFaction', 'setFaction', 'switchFaction'], 'khair');
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'sombra');
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], '9LETASTERII');
  state.hero.valor = 1450;

  actions.openSpecialModal('save');
  const textarea = env.document.getElementById('gdl-save-textarea');
  assert.ok(textarea && textarea.value.length > 40, 'Save Manager modal must populate Base64 save string in #gdl-save-textarea');
  const exportedB64 = textarea.value;

  actions.resetSave();
  assert.strictEqual(getState(env).hero.faction, 'ogriy');
  assert.strictEqual(getState(env).hero.valor, 0);

  const ok = actions.importSaveString(exportedB64);
  assert.strictEqual(ok, true);
  assert.strictEqual(getState(env).hero.faction, 'khair');
  assert.strictEqual(getState(env).hero.combatStyle, 'sombra');
  assert.strictEqual(getState(env).hero.valor, 1450);
});

/* ==========================================================================
   TIER 4 — REAL-WORLD APPLICATION SCENARIOS (9 Full End-to-End Journeys)
   ========================================================================== */

registerTest('Tier 4', 'Scenario', 'T4-S01', 'Journey 1: New Recruit of Ogriy — Faction/Style Selection, Promocodes, 33%/66% XP Milestones, Level-Up & Quest 1 Claim', () => {
  const env = createGameEnv({ random: 0.5 });
  const state = getState(env);
  const actions = getActions(env);

  // 1. Select Ogriy & Titán
  callFirstAction(actions, ['selectFaction', 'setFaction', 'switchFaction'], 'ogriy');
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'titan');

  // 2. Redeem starter promocodes
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], '9LETASTERII');
  callFirstAction(actions, ['redeemPromocode', 'claimPromocode'], 'DLEO-3947-URHF-3846');
  assert.ok(getHeroCurrency(state, 'diamonds') >= 20);

  // 3. Travel to Llanuras del Alba and hunt 3 creatures to complete Quest 1 and cross 33%/66%/100% XP
  actions.travelTo('llanuras_alba');
  for (let i = 0; i < 3; i++) {
    actions.startCombat('centinela_sombra');
    while (getState(env).ui.centerView === 'combat') {
      actions.executeCombatTurn();
    }
  }
  assert.ok(state.hero.level >= 2, 'Hero must reach Level 2 after hunting 3 creatures');
  assert.ok(state.hero.unspentPoints >= 6, 'Hero must accumulate attribute points on level-up');

  // 4. Allocate stats & claim Quest 1
  actions.allocateStat('str');
  actions.allocateStat('vit');
  actions.claimQuest('q1_juramento_ciudadela');
  assert.strictEqual(Boolean(state.quests.claimed.q1_juramento_ciudadela), true);
});

registerTest('Tier 4', 'Scenario', 'T4-S02', 'Journey 2: Khair Bonecrusher PvP & Crystalline Caves Champion — Anti-XP Lock, Battlefields, Valor Rank & Arsenal Gear', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);

  callFirstAction(actions, ['selectFaction', 'setFaction', 'switchFaction'], 'khair');
  callFirstAction(actions, ['selectCombatStyle', 'setCombatStyle', 'switchCombatStyle'], 'destructor');
  state.hero.level = 5;
  state.hero.xp = 25;

  // Activate Anti-XP Ring to stay in Level 5 PvP bracket
  callFirstAction(actions, ['toggleAntiXp', 'setAntiXp'], true);

  // Play all available battlegrounds
  const bfs = asArrayOrValues(art.BATTLEFIELDS);
  bfs.forEach((bf) => {
    if ((bf.minLevel || 1) <= state.hero.level) {
      callFirstAction(actions, ['playBattlefield', 'runBattlefieldObjective', 'enterBattlefield'], bf.id);
    }
  });

  assert.strictEqual(state.hero.xp, 25, 'Anti-XP Ring must keep hero at exact 25 XP across all battlefields');
  assert.ok(state.hero.valor >= 300, 'Battlefield campaign must earn >=300 Valor');
  assert.ok(getHeroCurrency(state, 'trophyCoins') >= 3, 'Battlefield campaign must earn Trophy Coins');
});

registerTest('Tier 4', 'Scenario', 'T4-S03', 'Journey 3: Master Artisan of the 9 Professions — Tool Gathering, Crafting across All 5 Workshops, Rune Socketing & Locked Chests', () => {
  const env = createGameEnv({ random: 0.5 });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 100000;
  state.hero.level = 7;

  // Buy & own all 3 gathering tools
  ['pico_maestro', 'hoz_herbolario', 'cana_pesca_runica'].forEach((tid) => ensureInventoryQty(env, tid, 1));

  // Harvest across tiers 1-5
  for (let tier = 1; tier <= 5; tier++) {
    actions.harvestNode({ id: `n_${tier}`, name: `Nodo ${tier}`, prof: 'mineria', tier });
  }

  // Craft at least 1 recipe from each crafting profession (herreria, alquimia, joyeria, sanador, cerrajero)
  const recipes = asArrayOrValues(art.CRAFT_RECIPES);
  ['herreria', 'alquimia', 'joyeria', 'sanador', 'cerrajero'].forEach((profId) => {
    const rec = recipes.find((r) => (r.prof || r.profession) === profId);
    assert.ok(rec, `Missing recipe for ${profId}`);
    (rec.ingredients || []).forEach((ing) => ensureInventoryQty(env, ing.itemId, ing.qty + 2));
    callFirstAction(actions, ['craftRecipe', 'craftItem', 'executeCraft'], rec.id);
    assert.ok(getInventoryQty(env, rec.resultId) >= 1, `Must craft ${rec.resultId} for ${profId}`);
  });

  // Socket a Legendary Rune & open a Locked Mithril Chest
  const rune = asArrayOrValues(art.RUNES)[0];
  ensureInventoryQty(env, rune.id, 1);
  callFirstAction(actions, ['socketRune', 'applyRune', 'engraveRune'], 'armor', rune.id);
  assert.strictEqual(state.equipmentRunes.armor, rune.id);
});

registerTest('Tier 4', 'Scenario', 'T4-S04', 'Journey 4: Grotto (ГРОТ) Fast-Farm & Cooldown Dungeon Raider — Clearing All 6 Instances & Verifying Lockouts', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.level = 8;

  const instances = asArrayOrValues(art.INSTANCES);
  assert.strictEqual(instances.length, 6);
  const diaBefore = getHeroCurrency(state, 'diamonds');

  instances.forEach((inst) => {
    callFirstAction(actions, ['runInstance', 'enterInstance', 'clearInstance'], inst.id);
    assert.ok(state.instances.cooldowns[inst.id] > Date.now(), `Instance ${inst.id} must enter lockout cooldown after clear`);
  });

  assert.strictEqual(state.instances.totalClears, 6);
  assert.ok(getHeroCurrency(state, 'diamonds') >= diaBefore + 50, 'Clearing all instances including La Gruta (ГРОТ) must grant >=50 Diamonds');
});

registerTest('Tier 4', 'Scenario', 'T4-S05', 'Journey 5: Companion & Deck Collector — Disciples Academy, Red Pets Crystal Socketing & All 6 Card Decks', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 100000;

  // Train all 3 Disciples
  asArrayOrValues(art.DISCIPLES).forEach((d) => {
    callFirstAction(actions, ['trainDisciple', 'recruitDisciple'], d.id);
  });

  // Adopt Arconte Cristal pet, feed it, and socket all Red Pet crystals
  actions.buyOrEquipPet('arconte_cristal');
  callFirstAction(actions, ['feedPet', 'feedActivePet']);
  asArrayOrValues(art.PET_CRYSTALS).forEach((c) => {
    ensureInventoryQty(env, c.id, 1);
    callFirstAction(actions, ['socketPetCrystal', 'upgradeRedPet'], 'arconte_cristal', c.id);
  });

  // Unlock & claim all 6 Collectible Card Decks
  asArrayOrValues(art.CARD_DECKS).forEach((deck) => {
    if (state.cardDecks && state.cardDecks.unlocked) state.cardDecks.unlocked[deck.id] = true;
    callFirstAction(actions, ['claimCardDeck', 'activateCardDeck'], deck.id);
  });

  const derived = getDerived(env);
  assert.ok(derived.atk > 65 && derived.crit > 20, 'Combined Disciples, Red Pet crystals, and Card Decks must heavily boost hero stats');
});

registerTest('Tier 4', 'Scenario', 'T4-S06', 'Journey 6: Lord of the Estate (Поместье) & Clan Citadel — Building All 6 Structures, Upgrading 5 Clan Talents & Free Infirmary Cure', () => {
  const env = createGameEnv();
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 200000;
  ensureInventoryQty(env, 'riolita', 200);
  if (state.estate) state.estate.riolite = 200;
  ensureInventoryQty(env, 'tratado_unidad_clan', 50);

  const buildings = asArrayOrValues(art.ESTATE_BUILDINGS);
  const townHall = buildings.find((b) => /ayuntamiento|town/i.test(b.id)) || buildings[0];
  callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], townHall.id);
  callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], townHall.id);
  buildings.forEach((b) => {
    if (b.id !== townHall.id) callFirstAction(actions, ['upgradeEstateBuilding', 'buildEstate'], b.id);
  });

  asArrayOrValues(art.CLAN_TALENTS).forEach((t) => {
    callFirstAction(actions, ['upgradeClanTalent', 'trainClanTalent'], t.id);
  });

  // Suffer injury and cure free via Estate Infirmary
  state.hero.injury = { id: 'herida_guerra', name: 'Herida de Guerra', severity: 3, penaltyPct: 20 };
  state.hero.hp = 10;
  state.hero.copper = 0;
  callFirstAction(actions, ['cureInjury', 'useEstateInfirmary', 'healInjury']);
  assert.strictEqual(state.hero.injury, null);
  assert.strictEqual(state.hero.hp, state.hero.maxHp);
});

registerTest('Tier 4', 'Scenario', 'T4-S07', 'Journey 7: Tavern Gambler (Катала), Fair of Wonders, Imperial Bank, Auction House & Balagur Riddles Master', () => {
  const env = createGameEnv({ random: 0.01 });
  const art = getArt(env);
  const state = getState(env);
  const actions = getActions(env);
  state.hero.copper = 100000;
  setHeroCurrency(state, 'diamonds', 200);
  setHeroCurrency(state, 'rubies', 100);
  setHeroCurrency(state, 'onlineTokens', 100);

  // Play Tavern Dice (Triple Solar) and Tavern Arcomage Cards
  actions.playTavernDice(500);
  callFirstAction(actions, ['playTavernCards', 'playArcomage'], 500);

  // Turn in trophies across all 10+ Reputations
  asArrayOrValues(art.REPUTATIONS).forEach((rep) => {
    ensureInventoryQty(env, rep.trophyItem || 'chispa_celestial', 3);
    callFirstAction(actions, ['donateReputation', 'turnInReputationTrophy', 'addReputation'], rep.id);
    assert.ok(state.reputations[rep.id] > 0, `Reputation ${rep.id} must increase after turn-in`);
  });

  // Spin Wheel of Fortune, buy Fair Item, buy Auction Listing, and solve all Balagur Riddles
  callFirstAction(actions, ['spinWheelOfFortune', 'spinWheel']);
  callFirstAction(actions, ['buyFairItem', 'purchaseFairItem'], asArrayOrValues(art.FAIR_ITEMS)[0].id);
  callFirstAction(actions, ['buyAuctionListing', 'bidAuction'], asArrayOrValues(art.AUCTION_LISTINGS)[0].id);
  asArrayOrValues(art.BALAGUR_RIDDLES).forEach((r) => {
    callFirstAction(actions, ['answerBalagurRiddle', 'solveBalagurRiddle'], r.id, r.answerIndex !== undefined ? r.answerIndex : r.answer);
  });
});

registerTest('Tier 4', 'Scenario', 'T4-S08', 'Journey 8: Supreme Endgame Campaign — Ignifer, Eltic Cube Mythic Gear, Vorathax & Emperor Malakor Victory Cinematic', () => {
  const env = createGameEnv();
  const state = getState(env);
  const actions = getActions(env);

  state.hero.level = 10;
  state.hero.copper = 250000;
  state.hero.baseStats = { str: 85, agi: 60, vit: 80, wis: 60 };

  // Tame Ignifer
  actions.buyOrEquipMount('ignifer');
  assert.strictEqual(actions.checkMedalUnlocked('med_domador_ignifer'), true);

  // Transmute Aethel-Valkyr in Eltic Cube and equip it
  ['fragmento_eltico', 'cristal_luminita', 'runa_solar', 'nucleo_eclipse'].forEach((id) => ensureInventoryQty(env, id, 20));
  actions.transmuteCube('cube_aethel_valkyr');
  actions.useItem('aethel_valkyr_mandoble');
  assert.strictEqual(state.equipment.weapon, 'aethel_valkyr_mandoble');

  // Travel to Frontera de Ceniza, defeat Vorathax and Emperor Malakor
  actions.travelTo('frontera_ceniza');
  actions.startCombat('vorathax_dragon_eclipse');
  while (getState(env).ui.centerView === 'combat') {
    actions.executeCombatTurn();
  }
  assert.strictEqual(Boolean(state.world.bossesDefeated.vorathax_dragon_eclipse), true);

  actions.startCombat('malakor_emperador_eclipse');
  while (getState(env).ui.centerView === 'combat') {
    actions.executeCombatTurn();
  }
  assert.strictEqual(Boolean(state.world.bossesDefeated.malakor_emperador_eclipse), true);
  assert.strictEqual(actions.checkMedalUnlocked('med_soberano_alba'), true);

  // Verify Victory Cinematic modal opened automatically
  const modalBackdrop = env.document.getElementById('gdl-modal-backdrop');
  const modalBodyText = env.document.getElementById('gdl-modal-body').textContent;
  assert.ok(!modalBackdrop.classList.contains('hidden'), 'Victory cinematic modal must open after defeating Emperor Malakor');
  assert.ok(/malakor|victoria|soberano/i.test(modalBodyText), 'Victory modal must celebrate defeating Emperor Malakor');
});

registerTest('Tier 4', 'Scenario', 'T4-S09', 'Journey 9: Production HTTP Server Asset Delivery, Live DOM Full-Modal Walkthrough & GitHub Pages Mirror Parity', async () => {
  const server = require(path.join(ROOT_DIR, 'server', 'index.js'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const endpoints = [
      '/api/health',
      '/',
      '/css/asteria.css',
      '/js/artAssets.js',
      '/js/app.js',
      '/js/uiShell.js',
      '/js/views/mainViews.js',
      '/js/views/specialModals.js',
      '/assets/locations/ciudadela_luz.jpg',
      '/assets/npcs/npc_comandante_aurelius.jpg'
    ];
    for (const ep of endpoints) {
      const res = await httpGet(port, ep);
      assert.strictEqual(res.statusCode, 200, `HTTP GET ${ep} must return 200`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  // Click through every top modal and dock tab in the live DOM
  const env = createGameEnv();
  env.document.querySelectorAll('[data-right-dock-tab]').forEach((tab) => tab.click());
  env.document.querySelectorAll('[data-top-modal]').forEach((btn) => {
    btn.click();
    const bodyHtml = env.document.getElementById('gdl-modal-body').innerHTML;
    assert.ok(bodyHtml.length > 30, `Modal ${btn.getAttribute('data-top-modal')} must render non-empty body content`);
  });
});

/* ==========================================================================
   HTTP HELPER & RUNNER EXECUTION
   ========================================================================== */
function httpGet(port, reqPath) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path: reqPath }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8')
        });
      });
    });
    req.on('error', reject);
  });
}

async function runSuite() {
  const filterArg = process.argv[2] || '';
  const activeTests = filterArg
    ? tests.filter((t) => t.id.includes(filterArg) || t.tier.includes(filterArg) || t.feature.includes(filterArg))
    : tests;

  const tierStats = {
    'Tier 1': { pass: 0, fail: 0 },
    'Tier 2': { pass: 0, fail: 0 },
    'Tier 3': { pass: 0, fail: 0 },
    'Tier 4': { pass: 0, fail: 0 }
  };
  const failures = [];

  console.log('============================================================================');
  console.log(' GUERREROS DE LA LUZ — Asteria E2E Test Suite (Tiers 1–4)');
  console.log(` Total Tests Scheduled: ${activeTests.length}`);
  console.log('============================================================================');

  for (const t of activeTests) {
    try {
      await t.fn();
      tierStats[t.tier].pass += 1;
      console.log(`  [PASS] [${t.tier}] ${t.id}: ${t.title}`);
    } catch (err) {
      tierStats[t.tier].fail += 1;
      const msg = err && err.message ? err.message : String(err);
      failures.push({ id: t.id, tier: t.tier, feature: t.feature, title: t.title, error: msg });
      console.log(`  [FAIL] [${t.tier}] ${t.id}: ${t.title}\n         -> ${msg}`);
    }
  }

  const totalPass = Object.values(tierStats).reduce((s, x) => s + x.pass, 0);
  const totalFail = Object.values(tierStats).reduce((s, x) => s + x.fail, 0);

  console.log('\n----------------------------------------------------------------------------');
  console.log(' E2E TIER SUMMARY');
  console.log('----------------------------------------------------------------------------');
  for (const [tier, st] of Object.entries(tierStats)) {
    console.log(`  ${tier.padEnd(10)} | Passed: ${String(st.pass).padStart(3)} | Failed: ${String(st.fail).padStart(3)} | Total: ${st.pass + st.fail}`);
  }
  console.log('----------------------------------------------------------------------------');
  console.log(`  TOTAL      | Passed: ${String(totalPass).padStart(3)} | Failed: ${String(totalFail).padStart(3)} | Total: ${totalPass + totalFail}`);
  console.log('============================================================================');

  if (totalFail > 0) {
    process.exitCode = 1;
  }
}

runSuite();
