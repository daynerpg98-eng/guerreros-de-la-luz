/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/uiShell.js
   Top HUD Renderer (HP, MP, XP with 33/66% ticks, Orange Valor bar, Multi-
   Currency Diamonds/Rubies/Trophy Coins/Online Tokens, Faction & Aura Badges),
   Left Hero Panel (Faction & Combat Style switcher, 12-Slot Paperdoll with
   Unequip, Durability & Rune badges, Companions Strip, Attributes),
   Right Dock (6-Category Filterable Expandable Backpack, Item Inspector with
   Equip/Unequip/Socket Rune/Repair/Belt/Open Chest/Sell, Quests & Systems Hub)
   ========================================================================== */

window.GDL_UI = (function () {
  'use strict';

  const ART = window.GDL_ART;

  /* ------------------------------------------------------------------------
     OPTIONAL & MUTEABLE WEB AUDIO API FANTASY SYNTHESIZER
     ------------------------------------------------------------------------ */
  const AudioFX = {
    ctx: null,
    muted: false,
    ensure() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    tone(freq, type, dur, vol = 0.07, slide = null) {
      if (this.muted) return;
      try {
        this.ensure();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slide) osc.frequency.exponentialRampToValueAtTime(slide, now + dur);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + dur);
      } catch (e) {}
    },
    strike() {
      this.tone(190, 'sawtooth', 0.14, 0.08, 70);
    },
    superBlow() {
      this.tone(480, 'triangle', 0.2, 0.11, 920);
      setTimeout(() => this.tone(240, 'sawtooth', 0.22, 0.09, 95), 70);
    },
    coin() {
      this.tone(880, 'sine', 0.12, 0.06, 1320);
    },
    fanfare() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        setTimeout(() => this.tone(f, 'triangle', 0.26, 0.08), i * 100);
      });
    }
  };

  /* ------------------------------------------------------------------------
     RENDER TOP HEADER BAR (VITALS, 33/66% XP, ORANGE VALOR BAR, CURRENCIES)
     ------------------------------------------------------------------------ */
  function renderTopHeader(state) {
    const h = state.hero;
    const hpPct = Math.max(0, Math.min(100, Math.round((h.hp / Math.max(1, h.maxHp)) * 100)));
    const mpPct = Math.max(0, Math.min(100, Math.round((h.mp / Math.max(1, h.maxMp)) * 100)));
    const xpPct = Math.max(0, Math.min(100, Math.round((h.xp / Math.max(1, h.xpNext)) * 100)));

    const hpTextEl = document.getElementById('hud-hp-text');
    const mpTextEl = document.getElementById('hud-mp-text');
    const xpTextEl = document.getElementById('hud-xp-text');
    if (hpTextEl) hpTextEl.textContent = `${h.hp} / ${h.maxHp}`;
    if (mpTextEl) mpTextEl.textContent = `${h.mp} / ${h.maxMp}`;
    if (xpTextEl) xpTextEl.textContent = `${h.xp} / ${h.xpNext}`;

    const hpBarEl = document.getElementById('hud-hp-bar');
    const mpBarEl = document.getElementById('hud-mp-bar');
    const xpBarEl = document.getElementById('hud-xp-bar');
    if (hpBarEl) hpBarEl.style.width = `${hpPct}%`;
    if (mpBarEl) mpBarEl.style.width = `${mpPct}%`;
    if (xpBarEl) xpBarEl.style.width = `${xpPct}%`;

    // Orange Valor Bar & Military Rank
    const vInfo = ART.getValorRank(h.valor || 0);
    const valorRankEl = document.getElementById('hud-valor-rank');
    const valorTextEl = document.getElementById('hud-valor-text');
    const valorBarEl = document.getElementById('hud-valor-bar');
    if (valorRankEl) valorRankEl.textContent = vInfo.title;
    if (valorTextEl) valorTextEl.textContent = `${vInfo.valor} / ${vInfo.nextMin}`;
    if (valorBarEl) valorBarEl.style.width = `${vInfo.pct}%`;

    // Multi-currency strip
    const currEl = document.getElementById('hud-currency-box');
    const diaEl = document.getElementById('hud-diamonds-box');
    const rubEl = document.getElementById('hud-rubies-box');
    const troEl = document.getElementById('hud-trophies-box');
    const onlEl = document.getElementById('hud-online-box');
    if (currEl) currEl.innerHTML = ART.formatCurrencyBadge(h.copper);
    if (diaEl) diaEl.textContent = h.diamonds || 0;
    if (rubEl) rubEl.textContent = h.rubies || 0;
    if (troEl) troEl.textContent = h.trophyCoins || 0;
    if (onlEl) onlEl.textContent = h.onlineTokens || 0;

    // Faction & Aura Badges
    const fac = ART.FACTIONS[h.faction || 'ogriy'] || ART.FACTIONS.ogriy;
    const facCrestEl = document.getElementById('hud-faction-crest');
    const facSubEl = document.getElementById('hud-faction-subtitle');
    const facBadgeEl = document.getElementById('hud-faction-badge');
    if (facCrestEl) facCrestEl.innerHTML = `<span>${fac.icon}</span>`;
    if (facSubEl) facSubEl.textContent = `${fac.name} • ${fac.capital}`;
    if (facBadgeEl) {
      facBadgeEl.textContent = `${fac.icon} ${h.faction === 'khair' ? 'Khair' : 'Ogriy'}`;
      facBadgeEl.classList.toggle('active', true);
    }

    const antiXpActive = Boolean(
      h.antiXp || h.antiXpActive || (state.equipment && state.equipment.ring === 'anillo_anti_xp')
    );
    const antiXpEl = document.getElementById('hud-antixp-badge');
    if (antiXpEl) {
      antiXpEl.textContent = `💍 Антиопыт: ${antiXpActive ? 'ON' : 'OFF'}`;
      antiXpEl.classList.toggle('active', antiXpActive);
    }

    const unbreakActive = Boolean(h.unbreakable || h.unbreakableBuff);
    const unbreakEl = document.getElementById('hud-unbreakable-badge');
    if (unbreakEl) {
      unbreakEl.textContent = `🛡️ Неслом: ${unbreakActive ? 'ON' : 'OFF'}`;
      unbreakEl.classList.toggle('active', unbreakActive);
    }

    const injEl = document.getElementById('hud-injury-badge');
    if (injEl) {
      if (h.injury) {
        injEl.classList.remove('hidden');
        injEl.textContent = `🩸 ${h.injury.name} (Curar)`;
      } else {
        injEl.classList.add('hidden');
      }
    }
  }

  /* ------------------------------------------------------------------------
     RENDER LEFT HERO 12-SLOT PAPERDOLL, FACTION/STYLE & ATTRIBUTES PANEL
     ------------------------------------------------------------------------ */
  function renderHeroLeftPanel(state, derivedStats, actions) {
    const h = state.hero;
    const fac = ART.FACTIONS[h.faction || 'ogriy'] || ART.FACTIONS.ogriy;
    const style = ART.COMBAT_STYLES[h.combatStyle || 'titan'] || ART.COMBAT_STYLES.titan;

    const nameEl = document.getElementById('hero-name-title');
    const clanEl = document.getElementById('hero-clan-subtitle');
    const lvlEl = document.getElementById('hero-level-badge');
    const styleHeadEl = document.getElementById('hero-style-header-label');

    if (nameEl) nameEl.textContent = h.name;
    if (clanEl) clanEl.textContent = `Clan: ${h.clan} • ${fac.icon} ${fac.id.toUpperCase()}`;
    if (lvlEl) lvlEl.textContent = h.level;
    if (styleHeadEl) styleHeadEl.textContent = `${style.icon} ${style.shortName}`;

    // Faction & Combat Style Switcher
    const fsBar = document.getElementById('hero-faction-style-bar');
    if (fsBar) {
      fsBar.innerHTML = `
        <div class="fs-row">
          ${Object.values(ART.FACTIONS)
            .map(
              (f) => `
            <button class="fs-btn ${h.faction === f.id ? 'active' : ''}" data-set-faction="${f.id}" title="${f.desc}">
              ${f.icon} ${f.name.split(' ')[2] || f.name}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="fs-row">
          ${Object.values(ART.COMBAT_STYLES)
            .map(
              (st) => `
            <button class="fs-btn ${h.combatStyle === st.id ? 'active' : ''}" data-set-style="${st.id}" title="${st.desc}">
              ${st.icon} ${st.shortName}
            </button>
          `
            )
            .join('')}
        </div>
      `;

      fsBar.querySelectorAll('[data-set-faction]').forEach((btn) => {
        btn.addEventListener('click', () => actions.setFaction(btn.getAttribute('data-set-faction')));
      });
      fsBar.querySelectorAll('[data-set-style]').forEach((btn) => {
        btn.addEventListener('click', () => actions.setCombatStyle(btn.getAttribute('data-set-style')));
      });
    }

    // Draw dynamic HTML5 Canvas Avatar
    window.GDL_AVATAR.drawHeroAvatar('gdl-hero-avatar-canvas', state);

    // 12 Equipment Slots (6 Left, 6 Right)
    const leftSlots = [
      { slot: 'helm', label: 'Yelmo', icon: '🪖' },
      { slot: 'pauldrons', label: 'Hombreras', icon: '🛡️' },
      { slot: 'amulet', label: 'Amuleto', icon: '📿' },
      { slot: 'weapon', label: 'Arma', icon: '🗡️' },
      { slot: 'armor', label: 'Coraza', icon: '🥋' },
      { slot: 'bracers', label: 'Brazales', icon: '🧤' }
    ];
    const rightSlots = [
      { slot: 'shield', label: 'Escudo', icon: '🛡️' },
      { slot: 'cloak', label: 'Manto', icon: '🧥' },
      { slot: 'cuisses', label: 'Quijotes', icon: '👖' },
      { slot: 'ring', label: 'Sortija', icon: '💍' },
      { slot: 'belt', label: 'Cinturón', icon: '🎗️' },
      { slot: 'boots', label: 'Grebas', icon: '🥾' }
    ];

    const buildSlotsHtml = (slots) =>
      slots
        .map((s) => {
          const itemId = state.equipment[s.slot];
          const it = itemId ? ART.ARTIFACTS[itemId] : null;
          const rawDur = state.equipmentDurability && state.equipmentDurability[s.slot];
          const maxDur = (it && it.maxDurability) || 60;
          const durObj = it
            ? typeof rawDur === 'number'
              ? { cur: rawDur, max: maxDur }
              : rawDur && typeof rawDur.cur === 'number'
              ? rawDur
              : { cur: maxDur, max: maxDur }
            : null;
          const durPct = durObj ? Math.max(0, Math.min(100, Math.round((durObj.cur / Math.max(1, durObj.max)) * 100))) : 100;
          const runeId = state.equipmentRunes && state.equipmentRunes[s.slot];
          const runeObj = runeId ? ART.ARTIFACTS[runeId] : null;

          return `
            <div class="ragdoll-slot ${it ? 'equipped rarity-border-' + it.rarity : ''}" data-inspect-slot="${
            s.slot
          }" title="${
            it
              ? `${it.name} (Durabilidad: ${durObj.cur}/${durObj.max})${
                  runeObj ? ' • Runa: ' + runeObj.name : ''
                } — Clic: Inspeccionar / Doble clic: Desequipar`
              : s.label + ' (Vacío)'
          }">
              ${runeObj ? `<span class="rg-rune-dot" title="${runeObj.name}">${runeObj.icon}</span>` : ''}
              <span class="rg-icon">${it ? it.icon : s.icon}</span>
              <span class="rg-label">${it ? it.name : s.label}</span>
              ${
                it && durObj
                  ? `<div class="rg-dur-bar"><div class="rg-dur-fill" style="width:${durPct}%;background:${
                      durPct > 35 ? 'var(--xp-bright)' : 'var(--crimson-bright)'
                    }"></div></div>`
                  : ''
              }
            </div>
          `;
        })
        .join('');

    document.getElementById('ragdoll-left-slots').innerHTML = buildSlotsHtml(leftSlots);
    document.getElementById('ragdoll-right-slots').innerHTML = buildSlotsHtml(rightSlots);

    // Active Mount, Red Pet & Disciple Status Strip
    const activeMountObj = ART.MOUNTS.find((m) => m.id === state.mounts.active);
    const activePetObj = ART.PETS.find((p) => p.id === state.pets.active);
    const activeDiscObj = ART.DISCIPLES.find((d) => d.id === (state.disciples && state.disciples.active));

    document.getElementById('hero-companions-strip').innerHTML = `
      <span class="comp-chip" data-open-special="mounts" title="Montura Activa">
        ${activeMountObj ? `${activeMountObj.icon} ${activeMountObj.name.split(' ')[0]}` : '🐎 Sin Montura'}
      </span>
      <span class="comp-chip" data-open-special="mounts" title="Mascota Roja Activa (Saciada: ${
        (state.pets && state.pets.satiety) || 0
      })">
        ${activePetObj ? `${activePetObj.icon} ${activePetObj.name.split(' ')[0]}` : '🦅 Sin Mascota'}
      </span>
      <span class="comp-chip" data-open-special="mounts" style="grid-column:1 / -1" title="Academia de Discípulos (Ученики)">
        ${
          activeDiscObj
            ? `${activeDiscObj.icon} ${activeDiscObj.name} (Nv.${
                (state.disciples && state.disciples.levels && state.disciples.levels[activeDiscObj.id]) || 1
              })`
            : '🎓 Academia: Sin Discípulo Activo'
        }
      </span>
    `;

    // Attributes & Stat Allocation
    const unspentEl = document.getElementById('hero-unspent-pts');
    if (h.unspentPoints > 0) {
      unspentEl.style.display = 'inline-block';
      unspentEl.textContent = `+${h.unspentPoints} PTS`;
    } else {
      unspentEl.style.display = 'none';
    }

    const attrs = [
      { key: 'str', label: 'Fuerza' },
      { key: 'agi', label: 'Agilidad' },
      { key: 'vit', label: 'Vitalidad' },
      { key: 'wis', label: 'Sabiduría' }
    ];

    const attrsHtml = attrs
      .map(
        (a) => `
        <div class="attr-row">
          <span class="attr-label">${a.label}</span>
          <div class="attr-val-wrap">
            <span class="attr-val">${derivedStats[a.key]}</span>
            ${
              h.unspentPoints > 0
                ? `<button class="btn-plus-stat" data-add-stat="${a.key}">+</button>`
                : ''
            }
          </div>
        </div>
      `
      )
      .join('');

    const derivedHtml = `
      <div class="attr-row"><span class="attr-label">Ataque Total</span><span class="attr-val gold">${derivedStats.atk}</span></div>
      <div class="attr-row"><span class="attr-label">Defensa Total</span><span class="attr-val cyan">${derivedStats.def}</span></div>
      <div class="attr-row"><span class="attr-label">Crítico Solar</span><span class="attr-val green">${derivedStats.crit}%</span></div>
      <div class="attr-row"><span class="attr-label">Esquiva / Estilo</span><span class="attr-val gold">${derivedStats.dodge || 0}%</span></div>
    `;

    document.getElementById('hero-attributes-grid').innerHTML = attrsHtml + derivedHtml;

    // Bind stat buttons
    document.querySelectorAll('[data-add-stat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.allocateStat(btn.getAttribute('data-add-stat'));
      });
    });

    // Bind companion chips
    document.querySelectorAll('[data-open-special]').forEach((el) => {
      el.addEventListener('click', () => {
        actions.openSpecialModal(el.getAttribute('data-open-special'));
      });
    });

    // Bind inspecting & double-click unequipping equipped slots
    document.querySelectorAll('[data-inspect-slot]').forEach((el) => {
      el.addEventListener('click', () => {
        const slot = el.getAttribute('data-inspect-slot');
        const id = state.equipment[slot];
        if (id) {
          state.ui.selectedItem = id;
          state.ui.selectedSlot = slot;
          state.ui.rightTab = 'bag';
          renderRightDock(state, actions);
        }
      });
      el.addEventListener('dblclick', () => {
        const slot = el.getAttribute('data-inspect-slot');
        if (state.equipment[slot]) {
          actions.unequipSlot(slot);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     RENDER RIGHT DOCK: 6-CATEGORY BACKPACK, QUESTS & ASTERIA SYSTEMS HUB
     ------------------------------------------------------------------------ */
  function renderRightDock(state, actions) {
    document.querySelectorAll('[data-right-dock-tab]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-right-dock-tab') === state.ui.rightTab);
    });

    const container = document.getElementById('right-dock-content');
    if (!container) return;

    if (state.ui.rightTab === 'quests') {
      renderRightQuestsList(container, state, actions);
    } else if (state.ui.rightTab === 'specials') {
      renderRightSpecialsHub(container, state, actions);
    } else {
      renderRightInventoryBag(container, state, actions);
    }
  }

  function renderRightInventoryBag(container, state, actions) {
    const activeCat = (state.ui && state.ui.bagCategory) || 'all';
    const categories = [
      { id: 'all', label: '📦 Todos' },
      { id: 'gear', label: '⚔️ Equipo' },
      { id: 'elixirs', label: '🧪 Elixires' },
      { id: 'materials', label: '🧱 Materiales' },
      { id: 'cards_relics', label: '🧰 Reliquias/Cofres' },
      { id: 'runes_tools', label: '🔮 Runas/Taller' }
    ];

    const filteredInv = state.inventory.filter((entry) => {
      const it = ART.ARTIFACTS[entry.itemId];
      if (!it) return false;
      if (activeCat === 'all') return true;
      return it.category === activeCat;
    });

    // Dynamic slot count: never truncate! Show all matching items, minimum 20 cells
    const totalCells = Math.max(20, Math.ceil((filteredInv.length + 1) / 4) * 4);
    const cellsHtml = [];

    for (let i = 0; i < totalCells; i++) {
      const entry = filteredInv[i];
      const it = entry ? ART.ARTIFACTS[entry.itemId] : null;
      if (it) {
        const isSel = state.ui.selectedItem === it.id;
        cellsHtml.push(`
          <div class="inv-slot rarity-border-${it.rarity} ${isSel ? 'selected' : ''}" data-inv-item="${
          it.id
        }" title="${it.name} (x${entry.qty})">
            <span class="inv-icon">${it.icon}</span>
            <span class="inv-qty">x${entry.qty}</span>
          </div>
        `);
      } else {
        cellsHtml.push(`<div class="inv-slot empty"></div>`);
      }
    }

    const selId =
      state.ui.selectedItem ||
      (filteredInv[0] && filteredInv[0].itemId) ||
      (state.inventory[0] && state.inventory[0].itemId);
    const selItem = selId ? ART.ARTIFACTS[selId] : null;

    let inspectorHtml = `<div class="item-detail-card"><span style="color:var(--text-muted)">Selecciona un artefacto de tu mochila o de las 12 ranuras de armadura para equipar, desequipar, reparar o engastar runas.</span></div>`;

    if (selItem) {
      const qty = actions.getItemQty(selItem.id);
      const equippedSlot = Object.keys(state.equipment).find((sl) => state.equipment[sl] === selItem.id);
      const isEq = Boolean(equippedSlot);
      const rawDur =
        equippedSlot && state.equipmentDurability && state.equipmentDurability[equippedSlot] !== undefined
          ? state.equipmentDurability[equippedSlot]
          : null;
      const maxDur = selItem.maxDurability || 60;
      const durObj =
        rawDur !== null
          ? typeof rawDur === 'number'
            ? { cur: rawDur, max: maxDur }
            : rawDur
          : null;
      const runeId =
        equippedSlot && state.equipmentRunes && state.equipmentRunes[equippedSlot]
          ? state.equipmentRunes[equippedSlot]
          : null;
      const runeObj = runeId ? ART.ARTIFACTS[runeId] : null;

      const availableRunes = ['runa_mira', 'runa_sina', 'runa_inevitabilidad'].filter(
        (rId) => actions.getItemQty(rId) > 0
      );

      let statsLine = 'Material / Herramienta de Profesión';
      if (selItem.stats) {
        statsLine = Object.entries(selItem.stats)
          .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
          .join(' • ');
      } else if (selItem.runeStats) {
        statsLine =
          'Runa: ' +
          Object.entries(selItem.runeStats)
            .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
            .join(' • ');
      } else if (selItem.crystalStats) {
        statsLine =
          'Cristal Mascota: ' +
          Object.entries(selItem.crystalStats)
            .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
            .join(' • ');
      } else if (selItem.healHp || selItem.healMp || selItem.directEnemyDmg) {
        statsLine = `Salud/Maná: +${selItem.healHp || 0} HP / +${selItem.healMp || 0} MP${
          selItem.directEnemyDmg ? ` • Daño: ${selItem.directEnemyDmg}` : ''
        }`;
      }

      inspectorHtml = `
        <div class="item-detail-card rarity-border-${selItem.rarity}">
          <div class="idc-header">
            <span class="idc-title">${selItem.icon} ${selItem.name}</span>
            <span class="idc-price">${ART.formatCurrencyBadge(Math.floor(selItem.price * 0.5))}</span>
          </div>
          <div class="idc-stats">${statsLine}</div>
          ${
            durObj
              ? `<div style="font-size:11px;color:var(--gold-bright)">🔧 Durabilidad: <strong>${durObj.cur}/${durObj.max}</strong> ${
                  runeObj ? `• 🔮 Engaste: <strong>${runeObj.name}</strong>` : ''
                }</div>`
              : ''
          }
          <p class="idc-desc">${selItem.desc}</p>
          <div class="idc-actions" style="flex-wrap:wrap">
            ${
              qty > 0 && selItem.slot === 'chest'
                ? `<button class="btn-asteria sm gold" id="btn-inv-open-chest">🧰 Abrir Cofre</button>`
                : ''
            }
            ${
              qty > 0 && selItem.slot === 'rune'
                ? `<button class="btn-asteria sm gold" id="btn-inv-use-rune">🔮 Engastar en Arma/Coraza</button>`
                : ''
            }
            ${
              qty > 0 &&
              !['material', 'tool', 'key', 'chest', 'rune', 'crystal'].includes(selItem.slot)
                ? `<button class="btn-asteria sm gold" id="btn-inv-use">
                    ${selItem.slot === 'consumable' ? '🧪 Usar Elixir' : '⚔️ Equipar'}
                  </button>`
                : ''
            }
            ${
              isEq
                ? `<button class="btn-asteria sm crimson" id="btn-inv-unequip" data-unequip-slot="${equippedSlot}">📤 Desequipar</button>`
                : ''
            }
            ${
              isEq && availableRunes.length > 0
                ? `<button class="btn-asteria sm gold" id="btn-inv-socket-slot" data-socket-slot="${equippedSlot}" data-rune-id="${availableRunes[0]}">💎 Engastar ${ART.ARTIFACTS[availableRunes[0]].name.split(' ')[0]}</button>`
                : ''
            }
            ${
              qty > 0 && selItem.slot === 'consumable'
                ? `<button class="btn-asteria sm" id="btn-inv-assign-belt">🎗️ Al Cinturón</button>`
                : ''
            }
            ${
              qty > 0
                ? `<button class="btn-asteria sm" id="btn-inv-sell">🪙 Vender 1</button>`
                : ''
            }
            ${isEq ? `<span class="entity-badge">✓ Equipado (${equippedSlot})</span>` : ''}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="bag-filter-tabs">
        ${categories
          .map(
            (c) => `
          <button class="bag-cat-btn ${activeCat === c.id ? 'active' : ''}" data-bag-cat="${c.id}" data-bag-filter="${c.id}">
            ${c.label}
          </button>
        `
          )
          .join('')}
      </div>
      <div class="bag-toolbar-strip">
        <span>Objetos: <strong>${filteredInv.length}</strong> / ${state.inventory.length} tipos</span>
        <div style="display:flex;gap:4px">
          <button class="btn-asteria sm" id="btn-bag-repair-all" title="Reparar las 12 piezas equipadas al 100%">🔧 Reparar Todo</button>
          <button class="btn-asteria sm ${state.hero.antiXpActive ? 'gold' : ''}" id="btn-bag-toggle-antixp" title="Activar/Desactivar Anillo Anti-XP">💍 Anti-XP</button>
        </div>
      </div>
      <div class="inv-grid-expandable">
        ${cellsHtml.join('')}
      </div>
      ${inspectorHtml}
    `;

    // Category filter click
    container.querySelectorAll('[data-bag-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.bagCategory = btn.getAttribute('data-bag-cat');
        renderRightInventoryBag(container, state, actions);
      });
    });

    // Repair all button
    const repBtn = container.querySelector('#btn-bag-repair-all');
    if (repBtn) {
      repBtn.addEventListener('click', () => actions.repairAllEquipment());
    }

    // Anti-XP toggle button
    const axpBtn = container.querySelector('#btn-bag-toggle-antixp');
    if (axpBtn) {
      axpBtn.addEventListener('click', () => actions.toggleAntiXp());
    }

    // Inventory cell click / double-click
    container.querySelectorAll('[data-inv-item]').forEach((cell) => {
      cell.addEventListener('click', () => {
        state.ui.selectedItem = cell.getAttribute('data-inv-item');
        renderRightInventoryBag(container, state, actions);
      });
      cell.addEventListener('dblclick', () => {
        const itemId = cell.getAttribute('data-inv-item');
        const it = ART.ARTIFACTS[itemId];
        if (it && it.slot === 'chest') actions.openLockedChest(itemId);
        else actions.useItem(itemId);
      });
    });

    const useBtn = container.querySelector('#btn-inv-use');
    if (useBtn && selItem) {
      useBtn.addEventListener('click', () => actions.useItem(selItem.id));
    }

    const openChestBtn = container.querySelector('#btn-inv-open-chest');
    if (openChestBtn && selItem) {
      openChestBtn.addEventListener('click', () => actions.openLockedChest(selItem.id));
    }

    const useRuneBtn = container.querySelector('#btn-inv-use-rune');
    if (useRuneBtn && selItem) {
      useRuneBtn.addEventListener('click', () => {
        const targetSlot = state.ui.selectedSlot || (state.equipment.weapon ? 'weapon' : 'armor');
        actions.socketRune(targetSlot, selItem.id);
      });
    }

    const unequipBtn = container.querySelector('#btn-inv-unequip');
    if (unequipBtn) {
      unequipBtn.addEventListener('click', () => {
        actions.unequipSlot(unequipBtn.getAttribute('data-unequip-slot'));
      });
    }

    const socketSlotBtn = container.querySelector('#btn-inv-socket-slot');
    if (socketSlotBtn) {
      socketSlotBtn.addEventListener('click', () => {
        actions.socketRune(
          socketSlotBtn.getAttribute('data-socket-slot'),
          socketSlotBtn.getAttribute('data-rune-id')
        );
      });
    }

    const beltBtn = container.querySelector('#btn-inv-assign-belt');
    if (beltBtn && selItem) {
      beltBtn.addEventListener('click', () => actions.assignToBelt(selItem.id));
    }

    const sellBtn = container.querySelector('#btn-inv-sell');
    if (sellBtn && selItem) {
      sellBtn.addEventListener('click', () => actions.sellItem(selItem.id));
    }
  }

  function renderRightQuestsList(container, state, actions) {
    const html = ART.QUESTS.map((q) => {
      const prog = actions.getQuestProgress(q);
      const claimed = Boolean(state.quests.claimed[q.id]);
      const ready = prog >= q.targetCount && !claimed;
      const pct = Math.round((prog / q.targetCount) * 100);

      return `
        <div class="compact-quest-card ${claimed ? 'done' : ''} ${ready ? 'ready' : ''}">
          <div class="cq-head">
            <strong>${q.title}</strong>
            <span>${prog}/${q.targetCount}</span>
          </div>
          <p class="cq-desc">${q.desc}</p>
          <div class="asteria-bar-track"><div class="asteria-bar-fill xp" style="width:${pct}%"></div></div>
          <div class="cq-foot">
            <span>${ART.formatCurrencyBadge(q.rewardCopper)} • +${q.rewardXp} XP</span>
            ${
              ready
                ? `<button class="btn-asteria sm gold" data-quick-claim="${q.id}">Reclamar</button>`
                : claimed
                ? `<span style="color:var(--xp-bright);font-size:11px">✓ Cumplida</span>`
                : ''
            }
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="compact-quests-stack">${html}</div>`;
    container.querySelectorAll('[data-quick-claim]').forEach((btn) => {
      btn.addEventListener('click', () => actions.claimQuest(btn.getAttribute('data-quick-claim')));
    });
  }

  function renderRightSpecialsHub(container, state, actions) {
    const systems = [
      { id: 'battlefields', icon: '🚩', title: 'Campos de Batalla (Поля битв)', sub: 'Cuevas Cristalinas, Tallaar y Valor' },
      { id: 'instances', icon: '🕳️', title: 'La Gruta (ГРОТ) e Instancias', sub: '6 Mazmorras, Piedras y Diamantes' },
      { id: 'estate', icon: '🏛️', title: 'Hacienda (Поместье)', sub: '6 Edificios, Riolita y Enfermería' },
      { id: 'reputations', icon: '🎖️', title: '10+ Reputaciones y Culto', sub: 'Arkona, Tahúr (Катала) y Medallas' },
      { id: 'mounts', icon: '🔥', title: 'Academia, Ignifer y Mascotas', sub: 'Discípulos (Ученики) y Cristales' },
      { id: 'decks', icon: '🃏', title: 'Barajas de Cartas (Колоды)', sub: '6 Colecciones y Recursos Semanales' },
      { id: 'professions', icon: '⚒️', title: '9 Profesiones y Taller', sub: 'Herrería, Sanador, Cerrajero, Runas' },
      { id: 'fair', icon: '🎡', title: 'Feria, Rueda y Hazañas', sub: 'Ярмарка, Колесо фортуны y Online' },
      { id: 'bank', icon: '🏦', title: 'Banco Imperial y Subasta', sub: 'Счастливый вклад y Mercado IA' },
      { id: 'profile', icon: '👤', title: 'Perfil, Regalos y Promos', sub: '9LETASTERII, DLEO-3947-URHF-3846' },
      { id: 'library', icon: '📚', title: 'Biblioteca y Balagures', sub: 'Enciclopedia de Faeo y Acertijos' },
      { id: 'cube', icon: '🧊', title: 'Cubo Éltico', sub: 'Síntesis de Reliquias y Runas' },
      { id: 'tavern', icon: '🎲', title: 'Taberna: Dados y Cartas', sub: 'Triple Solar y Duelo Arcomage' },
      { id: 'mirror', icon: '🪞', title: 'Espejo Mágico de Solaria', sub: 'Bendiciones Permanentes' },
      { id: 'arena', icon: '⚔️', title: 'Coliseo PvP y Clanes', sub: '16 Guerreros IA y Talentos de Clan' },
      { id: 'save', icon: '💾', title: 'Exportar / Importar Crónica', sub: 'Respaldo Local y JSON' }
    ];

    container.innerHTML = `
      <div class="specials-hub-grid">
        ${systems
          .map(
            (s) => `
          <button class="special-hub-btn" data-hub-modal="${s.id}">
            <span class="sh-icon">${s.icon}</span>
            <div class="sh-meta">
              <strong>${s.title}</strong>
              <small>${s.sub}</small>
            </div>
          </button>
        `
          )
          .join('')}
      </div>
    `;

    container.querySelectorAll('[data-hub-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.openSpecialModal(btn.getAttribute('data-hub-modal'));
      });
    });
  }

  return {
    AudioFX,
    renderTopHeader,
    renderHeroLeftPanel,
    renderRightDock
  };
})();
