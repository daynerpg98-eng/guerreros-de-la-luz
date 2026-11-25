/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/uiShell.js
   Hero Ragdoll Left Dock, Top Status Header, Right Inventory/Quests/Specials
   Dock & WebAudio Procedural Sound Engine
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
     RENDER TOP HEADER BAR
     ------------------------------------------------------------------------ */
  function renderTopHeader(state) {
    const h = state.hero;
    const hpPct = Math.max(0, Math.round((h.hp / h.maxHp) * 100));
    const mpPct = Math.max(0, Math.round((h.mp / h.maxMp) * 100));
    const xpPct = Math.max(0, Math.round((h.xp / h.xpNext) * 100));

    document.getElementById('hud-hp-text').textContent = `${h.hp} / ${h.maxHp}`;
    document.getElementById('hud-mp-text').textContent = `${h.mp} / ${h.maxMp}`;
    document.getElementById('hud-xp-text').textContent = `${h.xp} / ${h.xpNext}`;

    document.getElementById('hud-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('hud-mp-bar').style.width = `${mpPct}%`;
    document.getElementById('hud-xp-bar').style.width = `${xpPct}%`;

    document.getElementById('hud-currency-box').innerHTML = ART.formatCurrencyBadge(h.copper);
  }

  /* ------------------------------------------------------------------------
     RENDER LEFT HERO PAPERDOLL & ATTRIBUTES PANEL
     ------------------------------------------------------------------------ */
  function renderHeroLeftPanel(state, derivedStats, actions) {
    const h = state.hero;
    document.getElementById('hero-name-title').textContent = h.name;
    document.getElementById('hero-clan-subtitle').textContent = `Clan: ${h.clan}`;
    document.getElementById('hero-level-badge').textContent = h.level;

    // Draw dynamic HTML5 Canvas Avatar
    window.GDL_AVATAR.drawHeroAvatar('gdl-hero-avatar-canvas', state);

    const leftSlots = [
      { slot: 'helm', label: 'Yelmo', icon: '🪖' },
      { slot: 'amulet', label: 'Amuleto', icon: '📿' },
      { slot: 'weapon', label: 'Arma', icon: '🗡️' },
      { slot: 'armor', label: 'Coraza', icon: '🥋' }
    ];
    const rightSlots = [
      { slot: 'shield', label: 'Escudo', icon: '🛡️' },
      { slot: 'cloak', label: 'Manto', icon: '🧥' },
      { slot: 'ring', label: 'Sortija', icon: '💍' },
      { slot: 'boots', label: 'Grebas', icon: '🥾' }
    ];

    const buildSlotsHtml = (slots) =>
      slots
        .map((s) => {
          const itemId = state.equipment[s.slot];
          const it = itemId ? ART.ARTIFACTS[itemId] : null;
          return `
            <div class="ragdoll-slot ${it ? 'equipped rarity-border-' + it.rarity : ''}" data-inspect-slot="${
            s.slot
          }" title="${it ? it.name : s.label + ' (Vacío)'}">
              <span class="rg-icon">${it ? it.icon : s.icon}</span>
              <span class="rg-label">${it ? it.name : s.label}</span>
            </div>
          `;
        })
        .join('');

    document.getElementById('ragdoll-left-slots').innerHTML = buildSlotsHtml(leftSlots);
    document.getElementById('ragdoll-right-slots').innerHTML = buildSlotsHtml(rightSlots);

    // Active Mount & Pet Status Banner
    const activeMountObj = ART.MOUNTS.find((m) => m.id === state.mounts.active);
    const activePetObj = ART.PETS.find((p) => p.id === state.pets.active);
    document.getElementById('hero-companions-strip').innerHTML = `
      <span class="comp-chip" data-open-special="mounts" title="Montura Activa">
        ${activeMountObj ? `${activeMountObj.icon} ${activeMountObj.name}` : '🐎 Sin Montura'}
      </span>
      <span class="comp-chip" data-open-special="mounts" title="Mascota Activa">
        ${activePetObj ? `${activePetObj.icon} ${activePetObj.name}` : '🦅 Sin Mascota'}
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

    // Bind inspecting equipped slots
    document.querySelectorAll('[data-inspect-slot]').forEach((el) => {
      el.addEventListener('click', () => {
        const slot = el.getAttribute('data-inspect-slot');
        const id = state.equipment[slot];
        if (id) {
          state.ui.selectedItem = id;
          state.ui.rightTab = 'bag';
          renderRightDock(state, actions);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     RENDER RIGHT DOCK: INVENTORY BAG, ACTIVE QUESTS & SPECIAL SYSTEMS HUB
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
    const totalCells = 20;
    const cellsHtml = [];

    for (let i = 0; i < totalCells; i++) {
      const entry = state.inventory[i];
      const it = entry ? ART.ARTIFACTS[entry.itemId] : null;
      if (it) {
        const isSel = state.ui.selectedItem === it.id;
        cellsHtml.push(`
          <div class="inv-slot rarity-border-${it.rarity} ${isSel ? 'selected' : ''}" data-inv-item="${
          it.id
        }" title="${it.name}">
            <span class="inv-icon">${it.icon}</span>
            <span class="inv-qty">x${entry.qty}</span>
          </div>
        `);
      } else {
        cellsHtml.push(`<div class="inv-slot empty"></div>`);
      }
    }

    const selId = state.ui.selectedItem || (state.inventory[0] && state.inventory[0].itemId);
    const selItem = selId ? ART.ARTIFACTS[selId] : null;
    let inspectorHtml = `<div class="item-detail-card"><span style="color:var(--text-muted)">Selecciona un artefacto de tu mochila para equiparlo o usarlo.</span></div>`;

    if (selItem) {
      const qty = actions.getItemQty(selItem.id);
      const isEq = Object.values(state.equipment).includes(selItem.id);
      const statsLine = selItem.stats
        ? Object.entries(selItem.stats)
            .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
            .join(' • ')
        : selItem.healHp || selItem.healMp
        ? `Restaura +${selItem.healHp || 0} HP / +${selItem.healMp || 0} MP`
        : 'Material / Herramienta de Profesión';

      inspectorHtml = `
        <div class="item-detail-card rarity-border-${selItem.rarity}">
          <div class="idc-header">
            <span class="idc-title">${selItem.icon} ${selItem.name}</span>
            <span class="idc-price">${ART.formatCurrencyBadge(Math.floor(selItem.price * 0.5))}</span>
          </div>
          <div class="idc-stats">${statsLine}</div>
          <p class="idc-desc">${selItem.desc}</p>
          <div class="idc-actions">
            ${
              qty > 0 && selItem.slot !== 'material' && selItem.slot !== 'tool'
                ? `<button class="btn-asteria sm gold" id="btn-inv-use">
                    ${selItem.slot === 'consumable' ? '🧪 Usar Elixir' : '⚔️ Equipar'}
                  </button>`
                : ''
            }
            ${
              qty > 0
                ? `<button class="btn-asteria sm" id="btn-inv-sell">🪙 Vender 1</button>`
                : ''
            }
            ${isEq ? `<span class="entity-badge">✓ Equipado</span>` : ''}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="inv-grid-20">
        ${cellsHtml.join('')}
      </div>
      ${inspectorHtml}
    `;

    container.querySelectorAll('[data-inv-item]').forEach((cell) => {
      cell.addEventListener('click', () => {
        state.ui.selectedItem = cell.getAttribute('data-inv-item');
        renderRightInventoryBag(container, state, actions);
      });
      cell.addEventListener('dblclick', () => {
        actions.useItem(cell.getAttribute('data-inv-item'));
      });
    });

    const useBtn = container.querySelector('#btn-inv-use');
    if (useBtn && selItem) {
      useBtn.addEventListener('click', () => actions.useItem(selItem.id));
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
      { id: 'cube', icon: '🧊', title: 'Cubo Éltico', sub: 'Transmutación de Reliquias' },
      { id: 'professions', icon: '⚒️', title: '6 Profesiones', sub: 'Minería, Alquimia, Herrería...' },
      { id: 'mounts', icon: '🔥', title: 'Ignifer y Mascotas', sub: 'Monturas y Compañeros' },
      { id: 'medals', icon: '🎖️', title: 'Medallas de Honor', sub: 'Condecoraciones Permanentes' },
      { id: 'mirror', icon: '🪞', title: 'Espejo Mágico', sub: 'Bendiciones de Solaria' },
      { id: 'tavern', icon: '🎲', title: 'Dados de Taberna', sub: 'Apuestas del Grifo Dorado' },
      { id: 'arena', icon: '⚔️', title: 'Arena PvP y Clanes', sub: 'Retar a los 16 Guerreros IA' },
      { id: 'save', icon: '💾', title: 'Exportar / Importar', sub: 'Respaldo de Partida Local' }
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
