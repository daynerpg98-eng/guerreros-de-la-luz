/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/views/mainViews.js
   Primary Center-Stage Views:
   1. Panorama HD View (Oil-painted location, interactive hotspots, NPCs,
      Creatures, Collapsible Transitions & Interactive Warriors in Zone widget)
   2. Modo Caza (Real-time HTML5 Hunting Canvas with Aggro Color Rings,
      Entity Filters, Auto-Aggro Toggle, Hover Tooltip, Tools & Radar Minimap)
   3. Combate Táctico de 3 Zonas + 3 Posturas + 6 Super-Golpes + 4 Hechizos
      de Magia + Invocación de Morok/Montura + Cinturón de 6 Ranuras +
      Estadísticas de Combate (fight_info.php)
   4. Atlas Cartográfico de las 7 Regiones y Estancias Finales
   ========================================================================== */

window.GDL_MAIN_VIEWS = (function () {
  'use strict';

  const ART = window.GDL_ART;

  /* ------------------------------------------------------------------------
     1. LOCATION PANORAMA VIEW (WITH COLLAPSIBLE TRANSITIONS & WARRIORS IN ZONE)
     ------------------------------------------------------------------------ */
  function renderLocationView(container, state, actions) {
    window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
    if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
      window.GDL_COMBAT_CANVAS.stopBattleLoop();
    }

    const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    const locCreatures = ART.CREATURES.filter((c) => c.loc === loc.id);
    const locNpcs = (loc.npcs || []).map((id) => ART.NPCS[id]).filter(Boolean);
    const zoneWarriors = ART.AI_WARRIORS.filter(
      (w) => w.locationId === loc.id || (loc.id === 'ciudadela_luz' && w.level <= 3)
    );
    const isCollapsed = Boolean(state.ui && state.ui.zonePanelCollapsed);

    const hotspotsHtml = (loc.hotspots || [])
      .map((hs) => {
        const cls =
          hs.type === 'boss'
            ? 'hs-pin boss'
            : hs.type === 'hunting'
            ? 'hs-pin hunting'
            : hs.type === 'special'
            ? 'hs-pin special'
            : 'hs-pin npc';
        const icon =
          hs.type === 'boss'
            ? '💀'
            : hs.type === 'hunting'
            ? '🏹'
            : hs.type === 'special'
            ? '✨'
            : '💬';
        return `
          <button class="${cls}" style="left:${hs.x}%;top:${hs.y}%" data-hs-type="${hs.type}" data-hs-target="${hs.target}" title="${hs.label}">
            <span class="hs-icon">${icon}</span>
            <span class="hs-text">${hs.label}</span>
          </button>
        `;
      })
      .join('');

    const npcsCardsHtml = locNpcs
      .map(
        (npc) => `
        <div class="gdl-entity-card npc-card" data-open-npc="${npc.id}">
          <img src="${npc.portrait}" alt="${npc.name}" class="npc-thumb-img" />
          <div class="entity-card-body">
            <span class="entity-badge">${npc.badge}</span>
            <h4 class="entity-name">${npc.name}</h4>
            <p class="entity-sub">${npc.title}</p>
          </div>
          <button class="btn-asteria sm gold">Hablar</button>
        </div>
      `
      )
      .join('');

    const creaturesCardsHtml = locCreatures
      .map((cr) => {
        const defeated = state.world.bossesDefeated && state.world.bossesDefeated[cr.id];
        const tag = cr.isFinalBoss
          ? '👑 JEFE SUPREMO'
          : cr.isBoss
          ? '💀 JEFE DE ESTANCIA'
          : cr.isElite
          ? '⚜️ ÉLITE'
          : `Nivel ${cr.level}`;
        return `
          <div class="gdl-entity-card creature-card ${cr.isBoss ? 'boss-border' : ''}">
            <div class="creature-icon-medal">${cr.icon}</div>
            <div class="entity-card-body">
              <span class="entity-badge ${cr.isBoss ? 'crimson' : ''}">${tag} ${
          defeated ? '• ✓ Vencido' : ''
        }</span>
              <h4 class="entity-name">${cr.name}</h4>
              <p class="entity-sub">❤️ ${cr.hp} HP • ⚔️ ${cr.atk} ATQ • 🛡️ ${cr.def} DEF</p>
            </div>
            <button class="btn-asteria sm crimson" data-attack-creature="${cr.id}">Atacar</button>
          </div>
        `;
      })
      .join('');

    const travelGatesHtml = (loc.connectedTo || [])
      .map((destId) => {
        const dest = ART.LOCATIONS.find((l) => l.id === destId);
        if (!dest) return '';
        const locked = state.hero.level < dest.minLevel;
        return `
          <button class="travel-gate-btn ${locked ? 'locked' : ''} ${
          dest.isEndgameEstancia ? 'endgame' : ''
        }" data-travel-loc="${dest.id}">
            <img src="${dest.img}" alt="${dest.name}" class="gate-mini-thumb" />
            <div class="gate-meta">
              <span class="gate-title">🧭 ${dest.name}</span>
              <span class="gate-req">${
                locked ? `Requiere Nivel ${dest.minLevel}` : dest.dangerLabel
              }</span>
            </div>
          </button>
        `;
      })
      .join('');

    const warriorsInZoneHtml = zoneWarriors
      .map(
        (w) => `
        <div class="gdl-entity-card" style="cursor:default">
          <div class="creature-icon-medal" style="width:34px;height:34px;font-size:16px">${
            w.faction === 'khair' ? '🌋' : '☀️'
          }</div>
          <div class="entity-card-body">
            <span class="entity-badge">${w.clan} • Nv.${w.level}</span>
            <h4 class="entity-name">${w.name}</h4>
            <p class="entity-sub">${w.title} • ⚔️ ${w.atk} ATQ • ❤️ ${w.hp} HP</p>
          </div>
          <div style="display:flex;gap:4px">
            <button class="btn-asteria sm" data-inspect-warrior="${w.id}" title="Inspeccionar Perfil (user_info.php)">👤 Perfil</button>
            <button class="btn-asteria sm gold" data-gift-warrior="${w.id}" title="Enviar Regalo (120c)">🎁 Regalar</button>
            <button class="btn-asteria sm crimson" data-duel-warrior="${w.id}" title="Retar a Duelo Táctico">⚔️ Retar</button>
          </div>
        </div>
      `
      )
      .join('');

    // Optional last fight statistics banner (fight_info.php)
    const lf = state.world && state.world.lastFightStats;
    const lastFightBannerHtml = lf
      ? `
      <div class="loc-column-box full-span" style="border-color:var(--gold-aged);background:rgba(28,22,15,0.95)">
        <div class="box-header-ornate">
          <span>📊 Resumen Crónica de Combate (fight_info.php): ${lf.enemyName} — ${lf.result}</span>
          <span>Turnos: ${lf.turns}</span>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--text-main)">
          <span>⚔️ Daño Infligido: <strong style="color:var(--gold-bright)">${lf.dmgDealt}</strong></span>
          <span>🛡️ Bloqueado/Esquivado: <strong style="color:var(--mana-bright)">${lf.dmgMitigated}</strong></span>
          <span>🌟 Super-Golpes: <strong>${lf.superBlowsUsed}</strong></span>
          <span>🪄 Hechizos: <strong>${lf.spellsCast}</strong></span>
          <span>🔥 Daño Compañeros: <strong style="color:var(--xp-bright)">${lf.companionDmg}</strong></span>
          <span>🏅 Valor Ganado: <strong style="color:#ff9d3b">+${lf.valorEarned || 0}</strong></span>
        </div>
      </div>
    `
      : '';

    container.innerHTML = `
      <div class="panorama-stage-wrapper">
        <!-- HD Oil-Painted 16:9 Scene with Interactive Hotspots -->
        <div class="hd-scene-banner" style="background-image: url('${loc.img}')">
          <div class="hd-scene-vignette"></div>

          <div class="scene-top-overlay">
            <div class="scene-title-cluster">
              <span class="scene-subtitle-pill">${loc.subtitle}</span>
              <h1 class="scene-main-title">${loc.name}</h1>
            </div>
            <div class="scene-right-pills">
              <span class="danger-pill ${loc.isEndgameEstancia ? 'endgame' : ''}">${loc.dangerLabel}</span>
              <button class="btn-asteria gold" id="btn-enter-hunting-mode">🏹 Modo Caza en Vivo</button>
            </div>
          </div>

          <!-- Interactive Hotspots Layer -->
          <div class="scene-hotspots-layer">
            ${hotspotsHtml}
          </div>

          <div class="scene-bottom-lore">
            <p>${loc.lore}</p>
          </div>
        </div>

        <!-- Lower Tactical Deck: Clean Sub-Tabs (No Simultaneous Clutter) -->
        <div class="location-lower-deck">
          ${lastFightBannerHtml}
          <div class="loc-deck-tabs" role="tablist">
            <button class="loc-deck-tab ${(state.ui.locDeckTab || 'npcs') === 'npcs' ? 'active' : ''}" data-loc-deck-tab="npcs">
              🏛️ Maestres y Personajes (${locNpcs.length})
            </button>
            <button class="loc-deck-tab ${state.ui.locDeckTab === 'creatures' ? 'active' : ''}" data-loc-deck-tab="creatures">
              ⚔️ Criaturas y Jefes (${locCreatures.length})
            </button>
            <button class="loc-deck-tab ${state.ui.locDeckTab === 'travel' ? 'active' : ''}" data-loc-deck-tab="travel">
              🧭 Rutas y Guerreros en la Zona (${zoneWarriors.length})
            </button>
          </div>

          <div class="loc-deck-pane ${(state.ui.locDeckTab || 'npcs') === 'npcs' ? '' : 'loc-pane-hidden'}" data-loc-deck-pane="npcs">
            <div class="entities-grid-2col">
              ${npcsCardsHtml}
            </div>
          </div>

          <div class="loc-deck-pane ${state.ui.locDeckTab === 'creatures' ? '' : 'loc-pane-hidden'}" data-loc-deck-pane="creatures">
            <div class="entities-grid-2col">
              ${creaturesCardsHtml}
            </div>
          </div>

          <div class="loc-deck-pane ${state.ui.locDeckTab === 'travel' ? '' : 'loc-pane-hidden'}" data-loc-deck-pane="travel" id="zone-warriors-transitions-panel">
            <div class="box-header-ornate" style="margin-bottom:8px">
              <span>🧭 Transiciones (Переходы) y 👥 Guerreros en ${loc.name}</span>
              <button class="btn-asteria sm" id="btn-toggle-zone-panel">${
                isCollapsed ? '▼ Expandir Panel' : '▲ Plegar Panel'
              }</button>
            </div>
            ${
              isCollapsed
                ? ''
                : `
              <div class="travel-gates-grid" style="margin-bottom:10px">
                ${travelGatesHtml}
              </div>
              <div class="entities-grid-2col">
                ${warriorsInZoneHtml}
              </div>
            `
            }
          </div>
        </div>
      </div>
    `;

    // Bind lower location sub-tabs
    container.querySelectorAll('[data-loc-deck-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const nextTab = tabBtn.getAttribute('data-loc-deck-tab');
        state.ui.locDeckTab = nextTab;
        container.querySelectorAll('[data-loc-deck-tab]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-loc-deck-tab') === nextTab);
        });
        container.querySelectorAll('[data-loc-deck-pane]').forEach((pane) => {
          pane.classList.toggle('loc-pane-hidden', pane.getAttribute('data-loc-deck-pane') !== nextTab);
        });
      });
    });

    // Bind hotspot pins
    container.querySelectorAll('[data-hs-type]').forEach((pin) => {
      pin.addEventListener('click', () => {
        const type = pin.getAttribute('data-hs-type');
        const target = pin.getAttribute('data-hs-target');
        if (type === 'npc') actions.openNpcModal(target);
        else if (type === 'boss') actions.startCombat(target);
        else if (type === 'hunting') actions.switchCenterView('hunting');
        else if (type === 'special') actions.openSpecialModal(target);
      });
    });

    // Bind NPC cards
    container.querySelectorAll('[data-open-npc]').forEach((card) => {
      card.addEventListener('click', () => {
        actions.openNpcModal(card.getAttribute('data-open-npc'));
      });
    });

    // Bind creature attack buttons
    container.querySelectorAll('[data-attack-creature]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.startCombat(btn.getAttribute('data-attack-creature'));
      });
    });

    // Bind hunting button
    const huntBtn = container.querySelector('#btn-enter-hunting-mode');
    if (huntBtn) {
      huntBtn.addEventListener('click', () => actions.switchCenterView('hunting'));
    }

    // Bind collapsible zone panel toggle
    const toggleZoneBtn = container.querySelector('#btn-toggle-zone-panel');
    if (toggleZoneBtn) {
      toggleZoneBtn.addEventListener('click', () => {
        state.ui.zonePanelCollapsed = !state.ui.zonePanelCollapsed;
        renderLocationView(container, state, actions);
      });
    }

    // Bind travel gates
    container.querySelectorAll('[data-travel-loc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.travelTo(btn.getAttribute('data-travel-loc'));
      });
    });

    // Bind Warriors in Zone actions
    container.querySelectorAll('[data-inspect-warrior]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.ui.inspectedWarriorId = btn.getAttribute('data-inspect-warrior');
        actions.openSpecialModal('profile');
      });
    });
    container.querySelectorAll('[data-duel-warrior]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.startPvpCombat(btn.getAttribute('data-duel-warrior'));
      });
    });
    container.querySelectorAll('[data-gift-warrior]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.sendGiftToWarrior(btn.getAttribute('data-gift-warrior'), 'gift_rosa_astral');
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. REAL-TIME HUNTING MODE (hunt.php — AGGRO RINGS, FILTERS, RADAR, TOOLTIPS)
     ------------------------------------------------------------------------ */
  function renderHuntingView(container, state, actions) {
    if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
      window.GDL_COMBAT_CANVAS.stopBattleLoop();
    }

    const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    const filter = (state.ui && state.ui.huntingFilter) || 'all';
    const autoAggro = Boolean(state.ui && state.ui.autoAggro);
    const hasPick = actions.getItemQty('pico_maestro') > 0;
    const hasSickle = actions.getItemQty('hoz_herbolario') > 0;
    const hasRod = actions.getItemQty('cana_pesca_runica') > 0;

    container.innerHTML = `
      <div class="hunting-view-wrapper">
        <div class="hunting-top-bar">
          <div>
            <span class="scene-subtitle-pill">Exploración, Radar y Recolección en Tiempo Real (hunt.php)</span>
            <h2 class="hunting-title">🏹 Coto de Caza: ${loc.name}</h2>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-asteria sm" id="btn-respawn-hunting">🔄 Nuevos Rastros</button>
            <button class="btn-asteria sm gold" id="btn-exit-hunting">🏰 Volver a Estancia</button>
          </div>
        </div>

        <div class="hunting-controls-strip">
          <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
            <span style="font-size:10px;color:var(--gold-bright);font-family:var(--font-display)">FILTRO:</span>
            <button class="btn-asteria sm ${filter === 'all' ? 'active' : ''}" data-hunt-filter="all">Todos</button>
            <button class="btn-asteria sm ${filter === 'creatures' ? 'active' : ''}" data-hunt-filter="creatures">Criaturas</button>
            <button class="btn-asteria sm ${filter === 'resources' ? 'active' : ''}" data-hunt-filter="resources">Recursos</button>
            <button class="btn-asteria sm ${filter === 'bosses' ? 'active' : ''}" data-hunt-filter="bosses">Jefes / Élite</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-asteria sm ${autoAggro ? 'crimson' : ''}" id="btn-toggle-auto-aggro">
              ⚡ Agresión Automática: ${autoAggro ? 'ACTIVA' : 'OFF'}
            </button>
            <span class="entity-badge" title="Herramientas de recolección en tu mochila (+1 recurso extra y +50% XP)">
              Herramientas: ${hasPick ? '⛏️✓' : '⛏️✗'} ${hasSickle ? '🌿✓' : '🌿✗'} ${hasRod ? '🎣✓' : '🎣✗'}
            </span>
          </div>
        </div>

        <div class="hunting-canvas-frame">
          <canvas id="gdl-hunting-canvas" width="860" height="390"></canvas>
          <div class="hunting-tooltip-box" id="hunting-hover-tooltip">
            🎯 Pasa el cursor sobre una criatura o nodo para inspeccionar su Nivel de Agresión, botín y profesión.
          </div>
        </div>

        <div class="hunting-legend-bar" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <span>💡 <strong>Anillos de Agresión:</strong> <strong style="color:#4ed679">● Verde</strong> Pacífico (0-10%) • <strong style="color:#f4d068">● Amarillo</strong> Moderado • <strong style="color:#ff8c24">● Naranja</strong> Agresivo • <strong style="color:#e6483b">● Rojo</strong> Jefe de Estancia</span>
          <span>🗺️ <strong>Radar Superior Derecho:</strong> Rojo = Criaturas • Celeste = Recursos</span>
        </div>
      </div>
    `;

    document.getElementById('btn-exit-hunting').addEventListener('click', () => {
      actions.switchCenterView('location');
    });

    document.getElementById('btn-respawn-hunting').addEventListener('click', () => {
      window.GDL_HUNTING_CANVAS.spawnEntitiesForLocation(loc);
    });

    container.querySelectorAll('[data-hunt-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.setHuntingFilter(btn.getAttribute('data-hunt-filter'));
      });
    });

    const aggroBtn = document.getElementById('btn-toggle-auto-aggro');
    if (aggroBtn) {
      aggroBtn.addEventListener('click', () => {
        actions.toggleAutoAggro();
      });
    }

    const tooltipEl = document.getElementById('hunting-hover-tooltip');

    window.GDL_HUNTING_CANVAS.startHuntingCanvas('gdl-hunting-canvas', loc, {
      filter,
      autoAggro,
      onAttackCreature: (creatureId) => {
        window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
        actions.startCombat(creatureId);
      },
      onHarvestNode: (node) => {
        actions.harvestNode(node);
      },
      onHoverEntity: (ent) => {
        if (!tooltipEl) return;
        if (!ent) {
          tooltipEl.innerHTML =
            '🎯 Pasa el cursor sobre una criatura o nodo para inspeccionar su Nivel de Agresión, botín y profesión.';
          return;
        }
        if (ent.kind === 'creature') {
          const dropNames = (ent.drops || [])
            .map((id) => (ART.ARTIFACTS[id] ? ART.ARTIFACTS[id].name : id))
            .join(', ');
          tooltipEl.innerHTML = `<strong>${ent.icon} ${ent.name} [Nv.${ent.level}]</strong> • ❤️ ${ent.hp} HP • ⚔️ ${ent.atk} ATQ • Agresión: <strong style="color:${ent.aggroRingColor}">${ent.aggroLabel} (${ent.aggroPct}%)</strong><br/>🎁 Botín posible: ${dropNames || 'Monedas'}`;
        } else {
          tooltipEl.innerHTML = `<strong>${ent.icon} ${ent.name} (Rango ${ent.tier})</strong> • Profesión: <strong>${ent.prof.toUpperCase()}</strong> • Clic para recolectar (+50% XP y +1 extra si posees herramienta).`;
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. DIRECTIONAL 3-ZONE TACTICAL COMBAT + STANCES + 6 SUPER-BLOWS + SPELLS
     ------------------------------------------------------------------------ */
  function renderCombatView(container, state, combatState, actions) {
    window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
    if (!combatState) {
      renderLocationView(container, state, actions);
      return;
    }

    const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    const h = state.hero;
    const en = combatState.enemy;
    const heroHpPct = Math.max(0, Math.min(100, Math.round((h.hp / Math.max(1, h.maxHp)) * 100)));
    const heroMpPct = Math.max(0, Math.min(100, Math.round((h.mp / Math.max(1, h.maxMp)) * 100)));
    const enemyHpPct = Math.max(0, Math.min(100, Math.round((en.currentHp / Math.max(1, en.maxHp)) * 100)));

    const zones = [
      { id: 'head', label: 'Cabeza y Yelmo', icon: '🪖' },
      { id: 'torso', label: 'Torso y Coraza', icon: '🥋' },
      { id: 'legs', label: 'Piernas y Guardia Baja', icon: '🥾' }
    ];

    const chain = combatState.comboChain || [];
    const comboHistoryIcons = chain
      .map((z) => (z === 'head' ? '🪖 Cabeza' : z === 'torso' ? '🥋 Torso' : '🥾 Piernas'))
      .join(' → ');

    const superBlowsHtml = ART.SUPER_BLOWS.map((sb) => {
      let matchedSteps = 0;
      if (chain.length === 2 && sb.sequence[0] === chain[0] && sb.sequence[1] === chain[1]) {
        matchedSteps = 2;
      } else if (chain.length === 1 && sb.sequence[0] === chain[0]) {
        matchedSteps = 1;
      } else if (chain.length === 2 && sb.sequence[0] === chain[1]) {
        matchedSteps = 1;
      }
      const isReady =
        matchedSteps === 2 || (combatState.readySuperBlow && combatState.readySuperBlow.id === sb.id);
      return `
        <div class="superblow-chip ${isReady ? 'ready-glow' : ''}" title="${sb.desc}">
          <span>${sb.icon} <strong>${sb.name}</strong> <small style="color:var(--gold-bright)">(${matchedSteps}/3)</small></span>
          <span class="sb-seq">${sb.seqLabels.join(' → ')} ${
        isReady ? '• ⚡ ¡SIGUIENTE: ' + sb.seqLabels[2].toUpperCase() + '!' : ''
      }</span>
        </div>
      `;
    }).join('');

    // 3 Combat Stances
    const curStance = combatState.stance || 'guardia_solar';
    const stancesHtml = ART.COMBAT_STANCES.map(
      (st) => `
      <button class="btn-asteria sm ${curStance === st.id ? 'gold active' : ''}" data-combat-stance="${st.id}" title="${st.desc}">
        ${st.icon} ${st.name}
      </button>
    `
    ).join('');

    // 4 Magic School Spells
    const spellsHtml = ART.MAGIC_SPELLS.map((sp) => {
      const canCast = h.mp >= sp.mpCost;
      return `
        <button class="btn-asteria sm ${canCast ? '' : ''}" data-cast-spell="${sp.id}" ${
        !canCast ? 'disabled' : ''
      } title="${sp.desc}">
          ${sp.icon} ${sp.name.split(' ')[0]} (${sp.mpCost} MP)
        </button>
      `;
    }).join('');

    // 6-Slot Combat Belt
    const beltItems =
      state.combatBelt && state.combatBelt.length === 6
        ? state.combatBelt
        : [
            'elixir_vida_menor',
            'elixir_vida_mayor',
            'nectar_mana_astral',
            'panacea_solar',
            'pocion_furia_titan',
            'pergamino_piel_piedra'
          ];

    const beltHtml = beltItems
      .map((itemId) => {
        const it = ART.ARTIFACTS[itemId] || ART.ARTIFACTS.elixir_vida_menor;
        const qty = actions.getItemQty(it.id);
        return `
          <button class="combat-potion-btn" data-combat-potion="${it.id}" ${
          qty <= 0 ? 'disabled' : ''
        } title="${it.name}: ${it.desc}">
            <span>${it.icon}</span>
            <span>${it.name.split(' ')[0]} (x${qty})</span>
          </button>
        `;
      })
      .join('');

    const st = combatState.stats || {
      dmgDealt: 0,
      dmgMitigated: 0,
      superBlowsUsed: 0,
      spellsCast: 0,
      companionDmg: 0
    };

    container.innerHTML = `
      <div class="combat-stage-wrapper">
        ${
          h.injury
            ? `<div style="background:rgba(158,31,23,0.35);border:1px solid var(--crimson-bright);padding:6px 10px;display:flex;justify-content:space-between;align-items:center">
                <span>🩸 <strong>Herida Activa: ${h.injury.name}</strong> (-${h.injury.penaltyPct}% ATQ/DEF). Cúrala al instante para combatir al 100%:</span>
                <button class="btn-asteria sm gold" id="btn-combat-cure-injury">🩹 Curar Herida Ahora</button>
              </div>`
            : ''
        }

        <!-- Top Combatants Vital Header -->
        <div class="combat-vitals-header">
          <div class="combatant-vital-box hero-side">
            <div class="cv-top">
              <span class="cv-name">⚜️ ${h.name} (Nv.${h.level})</span>
              <span class="cv-nums">❤️ ${h.hp}/${h.maxHp} • 💠 ${h.mp}/${h.maxMp} MP</span>
            </div>
            <div class="asteria-bar-track" style="margin-bottom:3px"><div class="asteria-bar-fill hp" style="width:${heroHpPct}%"></div></div>
            <div class="asteria-bar-track" style="height:6px"><div class="asteria-bar-fill mp" style="width:${heroMpPct}%"></div></div>
          </div>

          <div class="combat-vs-badge">DUELO TÁCTICO</div>

          <div class="combatant-vital-box enemy-side">
            <div class="cv-top">
              <span class="cv-name">${en.icon} ${en.name} (Nv.${en.level})</span>
              <span class="cv-nums">${en.currentHp} / ${en.maxHp} HP</span>
            </div>
            <div class="asteria-bar-track"><div class="asteria-bar-fill hp" style="width:${enemyHpPct}%"></div></div>
          </div>
        </div>

        <!-- Animated 60fps HTML5 Battle Canvas -->
        <div class="combat-canvas-box">
          <canvas id="gdl-battle-canvas" width="840" height="230"></canvas>
        </div>

        <!-- Combat Stances & Magic School Spells Bar -->
        <div class="combat-tactical-subbar">
          <div class="zone-panel">
            <div class="zone-panel-title">🛡️ Postura de Combate Activa</div>
            <div class="stance-pills-row">${stancesHtml}</div>
          </div>
          <div class="zone-panel">
            <div class="zone-panel-title">🪄 Escuela de Magia (Hechizos de Maná)</div>
            <div class="spells-pills-row">${spellsHtml}</div>
          </div>
        </div>

        <!-- 6 Super-Blows Sequence Tracker -->
        <div class="superblows-bar">
          <div class="sb-current-chain">
            <span>Secuencia Direccional Actual:</span>
            <strong>${comboHistoryIcons || 'Encadena 3 zonas para desatar uno de los 6 Super-Golpes'}</strong>
          </div>
          <div class="sb-recipes-row six-grid">
            ${superBlowsHtml}
          </div>
        </div>

        <!-- 3-Zone Directional Controls + Action Execution + 6-Slot Belt + Morok Summon -->
        <div class="tactical-zones-grid">
          <div class="zone-panel">
            <div class="zone-panel-title">1. Zona de Ataque (Objetivo)</div>
            <div class="zone-btn-list">
              ${zones
                .map(
                  (z) => `
                <button class="tactical-zone-btn ${
                  combatState.attackZone === z.id ? 'active-atk' : ''
                }" data-atk-zone="${z.id}">
                  <span>⚔️ ${z.label}</span>
                  <span>${combatState.attackZone === z.id ? 'OBJETIVO' : 'Elegir'}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="zone-panel">
            <div class="zone-panel-title">2. Zona de Bloqueo (Escudo)</div>
            <div class="zone-btn-list">
              ${zones
                .map(
                  (z) => `
                <button class="tactical-zone-btn ${
                  combatState.defendZone === z.id ? 'active-def' : ''
                }" data-def-zone="${z.id}">
                  <span>🛡️ ${z.label}</span>
                  <span>${combatState.defendZone === z.id ? 'GUARDIA' : 'Cubrir'}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="zone-panel execute-panel">
            <div class="zone-panel-title">3. Ejecutar Turno, Morok y Cinturón (6)</div>
            <div style="display:flex;gap:5px">
              <button class="btn-asteria crimson lg-strike" id="btn-execute-turn" style="flex:1">
                ⚔️ ¡EJECUTAR EMBATE!
              </button>
              <button class="btn-asteria gold sm" id="btn-summon-morok" ${
                combatState.summonedMorok ? 'disabled' : ''
              } title="Invoca tu Montura (Ignifer) o un Morok Solar para absorber 35% de daño y atacar cada turno">
                🔥 ${combatState.summonedMorok ? 'Morok Activo' : 'Invocar Morok'}
              </button>
            </div>
            <div class="combat-potions-grid belt-6">
              ${beltHtml}
            </div>
            <button class="btn-asteria sm" id="btn-retreat-combat">🏳️ Retirarse a la Estancia</button>
          </div>
        </div>

        <!-- Live Combat Statistics Strip (fight_info.php) -->
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:5px 10px;background:var(--bg-input);border:1px solid var(--bronze-subtle);font-size:11px">
          <span>📊 <strong>Estadísticas (fight_info.php):</strong></span>
          <span>⚔️ Daño: <strong style="color:var(--gold-bright)">${st.dmgDealt}</strong></span>
          <span>🛡️ Mitigado/Esquivado: <strong style="color:var(--mana-bright)">${st.dmgMitigated}</strong></span>
          <span>🌟 Super-Golpes: <strong>${st.superBlowsUsed}</strong></span>
          <span>🪄 Hechizos: <strong>${st.spellsCast}</strong></span>
          <span>🔥 Compañeros: <strong style="color:var(--xp-bright)">${st.companionDmg}</strong></span>
        </div>

        <!-- Turn-by-Turn Combat Log -->
        <div class="combat-log-box">
          ${(combatState.log || []).map((l) => `<div class="combat-log-line">${l}</div>`).join('')}
        </div>
      </div>
    `;

    window.GDL_COMBAT_CANVAS.renderBattleCanvas('gdl-battle-canvas', combatState, loc);

    const cureBtn = container.querySelector('#btn-combat-cure-injury');
    if (cureBtn) {
      cureBtn.addEventListener('click', () => actions.cureInjury());
    }

    container.querySelectorAll('[data-combat-stance]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.setCombatStance(btn.getAttribute('data-combat-stance'));
      });
    });

    container.querySelectorAll('[data-cast-spell]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.castCombatSpell(btn.getAttribute('data-cast-spell'));
      });
    });

    container.querySelectorAll('[data-atk-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        combatState.attackZone = btn.getAttribute('data-atk-zone');
        renderCombatView(container, state, combatState, actions);
      });
    });

    container.querySelectorAll('[data-def-zone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        combatState.defendZone = btn.getAttribute('data-def-zone');
        renderCombatView(container, state, combatState, actions);
      });
    });

    document.getElementById('btn-execute-turn').addEventListener('click', () => {
      actions.executeCombatTurn();
    });

    const morokBtn = document.getElementById('btn-summon-morok');
    if (morokBtn) {
      morokBtn.addEventListener('click', () => {
        actions.summonMorokInCombat();
      });
    }

    container.querySelectorAll('[data-combat-potion]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.useItem(btn.getAttribute('data-combat-potion'));
      });
    });

    document.getElementById('btn-retreat-combat').addEventListener('click', () => {
      actions.fleeCombat();
    });
  }

  /* ------------------------------------------------------------------------
     4. ATLAS CARTOGRÁFICO DE LAS 7 REGIONES Y ESTANCIAS FINALES
     ------------------------------------------------------------------------ */
  function renderAtlasView(container, state, actions) {
    window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
    if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
      window.GDL_COMBAT_CANVAS.stopBattleLoop();
    }

    const cardsHtml = ART.LOCATIONS.map((loc) => {
      const isCur = state.world.currentLocation === loc.id;
      const locked = state.hero.level < loc.minLevel;
      return `
        <div class="atlas-region-card ${isCur ? 'current' : ''} ${
        loc.isEndgameEstancia ? 'endgame-card' : ''
      }">
          <div class="atlas-card-thumb" style="background-image:url('${loc.img}')">
            <span class="atlas-danger-tag">${loc.dangerLabel}</span>
          </div>
          <div class="atlas-card-content">
            <h4>${loc.name}</h4>
            <p>${loc.subtitle}</p>
            <button class="btn-asteria ${isCur ? 'gold' : ''}" data-atlas-go="${loc.id}" ${
        locked ? 'disabled' : ''
      }>
              ${
                isCur
                  ? '📍 Ubicación Actual'
                  : locked
                  ? `🔒 Requiere Nivel ${loc.minLevel}`
                  : '🧭 Viajar a Región'
              }
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="atlas-view-wrapper">
        <div class="box-header-ornate">
          <span>🗺️ Atlas Imperial de Asteria — Las 7 Regiones y Estancias Finales</span>
          <span>Nivel de Héroe: ${state.hero.level}</span>
        </div>
        <div class="atlas-cards-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-atlas-go]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.travelTo(btn.getAttribute('data-atlas-go'));
      });
    });
  }

  return {
    renderLocationView,
    renderHuntingView,
    renderCombatView,
    renderAtlasView
  };
})();
