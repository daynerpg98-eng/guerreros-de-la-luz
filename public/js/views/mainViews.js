/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/views/mainViews.js
   Primary Center-Stage Views (Dark-Epic Skeuomorphic Fantasy UI):
   1. Panorama HD View (Oil-painted location, interactive hotspots, NPCs,
      Creatures, Collapsible Transitions & Interactive Warriors in Zone widget)
   2. Modo Caza (Real-time HTML5 Hunting Canvas with Aggro Color Rings,
      Entity Filters, Auto-Aggro Toggle, Hover Tooltip, Tools & Radar Minimap)
   3. Vista de Combate Táctico Estilo DWAR / BG3:
      - Columna izquierda con el Paperdoll completo del caballero (12 slots
        con marcos de rareza brillantes alrededor del avatar pintado) y
        barras de Vida, Maná y Furia.
      - Arena central enmarcada en bronce con barra de jefe monumental.
      - Consola táctica inferior con el Maniquí Anatómico Iluminado de 3 Zonas
        (Cabeza, Torso, Piernas) y selectores de postura de escudo con gemas
        indicadoras (Rojo/Verde/Oro), más la barra inferior de Super-Golpes
        rúnicos y frascos de pociones en cristal.
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
        <div class="gdl-entity-card skeuo-rel-card npc-card" data-open-npc="${npc.id}">
          <img src="${npc.portrait}" alt="${npc.name}" class="npc-thumb-img" />
          <div class="entity-card-body">
            <span class="entity-badge">${npc.badge}</span>
            <h4 class="entity-name">${npc.name}</h4>
            <p class="entity-sub">${npc.title}</p>
          </div>
          <button class="btn-asteria sm gold skeuo-wax-seal">Hablar</button>
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
          <div class="gdl-entity-card skeuo-rel-card creature-card ${cr.isBoss ? 'boss-border' : ''}">
            <div class="creature-icon-medal">${cr.icon}</div>
            <div class="entity-card-body">
              <span class="entity-badge ${cr.isBoss ? 'crimson' : ''}">${tag} ${
          defeated ? '• ✓ Vencido' : ''
        }</span>
              <h4 class="entity-name">${cr.name}</h4>
              <p class="entity-sub">❤️ ${cr.hp} HP • ⚔️ ${cr.atk} ATQ • 🛡️ ${cr.def} DEF</p>
            </div>
            <button class="btn-asteria sm crimson skeuo-wax-seal" data-attack-creature="${cr.id}">Atacar</button>
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
          <button class="travel-gate-btn skeuo-rel-card ${locked ? 'locked' : ''} ${
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
        <div class="gdl-entity-card skeuo-rel-card" style="cursor:default">
          <div class="creature-icon-medal" style="width:34px;height:34px;font-size:16px">${
            w.faction === 'khair' ? '🌋' : '☀️'
          }</div>
          <div class="entity-card-body">
            <span class="entity-badge">${w.clan} • Nv.${w.level}</span>
            <h4 class="entity-name">${w.name}</h4>
            <p class="entity-sub">${w.title} • ⚔️ ${w.atk} ATQ • ❤️ ${w.hp} HP</p>
          </div>
          <div style="display:flex;gap:4px">
            <button class="btn-asteria sm skeuo-wax-seal" data-inspect-warrior="${w.id}" title="Inspeccionar Perfil (user_info.php)">👤 Perfil</button>
            <button class="btn-asteria sm gold skeuo-wax-seal" data-gift-warrior="${w.id}" title="Enviar Regalo (120c)">🎁 Regalar</button>
            <button class="btn-asteria sm crimson skeuo-wax-seal" data-duel-warrior="${w.id}" title="Retar a Duelo Táctico">⚔️ Retar</button>
          </div>
        </div>
      `
      )
      .join('');

    // Optional last fight statistics banner (fight_info.php)
    const lf = state.world && state.world.lastFightStats;
    const lastFightBannerHtml = lf
      ? `
      <div class="loc-column-box full-span skeuo-aged-parchment-card" style="border-color:var(--gold-aged)">
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
        <div class="combat-log-box" style="max-height:54px;margin-top:4px">${(lf.log || []).map((l) => `<div class="combat-log-line">${l}</div>`).join('')}</div>
      </div>
    `
      : '';

    container.innerHTML = `
      <div class="panorama-stage-wrapper">
        <!-- HD Oil-Painted 16:9 Scene with Interactive Hotspots -->
        <div class="hd-scene-banner skeuo-bronze-framed-banner" style="background-image: url('${loc.img}')">
          <div class="hd-scene-vignette"></div>

          <div class="scene-top-overlay">
            <div class="scene-title-cluster">
              <span class="scene-subtitle-pill">${loc.subtitle}</span>
              <h1 class="scene-main-title">${loc.name}</h1>
            </div>
            <div class="scene-right-pills">
              <span class="danger-pill ${loc.isEndgameEstancia ? 'endgame' : ''}">${loc.dangerLabel}</span>
              <button class="btn-asteria gold skeuo-bronze-leather-plate" id="btn-enter-hunting-mode">🏹 Modo Caza en Vivo</button>
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

        <!-- Lower Tactical Deck: Clean Sub-Tabs (Wax Seals & Bronze Plates) -->
        <div class="location-lower-deck">
          ${lastFightBannerHtml}
          <div class="loc-deck-tabs" role="tablist">
            <button class="loc-deck-tab skeuo-wax-seal-tab ${(state.ui.locDeckTab || 'npcs') === 'npcs' ? 'active' : ''}" data-loc-deck-tab="npcs">
              🏛️ Maestres y Personajes (${locNpcs.length})
            </button>
            <button class="loc-deck-tab skeuo-wax-seal-tab ${state.ui.locDeckTab === 'creatures' ? 'active' : ''}" data-loc-deck-tab="creatures">
              ⚔️ Criaturas y Jefes (${locCreatures.length})
            </button>
            <button class="loc-deck-tab skeuo-wax-seal-tab ${state.ui.locDeckTab === 'travel' ? 'active' : ''}" data-loc-deck-tab="travel">
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
              <button class="btn-asteria sm skeuo-wax-seal" id="btn-toggle-zone-panel">${
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
            <button class="btn-asteria sm skeuo-wax-seal" id="btn-respawn-hunting">🔄 Nuevos Rastros</button>
            <button class="btn-asteria sm gold skeuo-bronze-leather-plate" id="btn-exit-hunting">🏰 Volver a Estancia</button>
          </div>
        </div>

        <div class="hunting-controls-strip">
          <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
            <span style="font-size:10px;color:var(--gold-bright);font-family:var(--font-display)">FILTRO:</span>
            <button class="btn-asteria sm skeuo-wax-seal ${filter === 'all' ? 'active' : ''}" data-hunt-filter="all">Todos</button>
            <button class="btn-asteria sm skeuo-wax-seal ${filter === 'creatures' ? 'active' : ''}" data-hunt-filter="creatures">Criaturas</button>
            <button class="btn-asteria sm skeuo-wax-seal ${filter === 'resources' ? 'active' : ''}" data-hunt-filter="resources">Recursos</button>
            <button class="btn-asteria sm skeuo-wax-seal ${filter === 'bosses' ? 'active' : ''}" data-hunt-filter="bosses">Jefes / Élite</button>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-asteria sm skeuo-wax-seal ${autoAggro ? 'crimson' : ''}" id="btn-toggle-auto-aggro">
              ⚡ Agresión Automática: ${autoAggro ? 'ACTIVA' : 'OFF'}
            </button>
            <span class="entity-badge" title="Herramientas de recolección en tu mochila (+1 recurso extra y +50% XP)">
              Herramientas: ${hasPick ? '⛏️✓' : '⛏️✗'} ${hasSickle ? '🌿✓' : '🌿✗'} ${hasRod ? '🎣✓' : '🎣✗'}
            </span>
          </div>
        </div>

        <div class="hunting-canvas-frame skeuo-bronze-arena-frame">
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
     3. VISTA DE COMBATE TÁCTICO ESTILO DWAR / BG3:
        - Columna izquierda: 12-Slot Knight Paperdoll + Barras de Vida, Maná y Furia
        - Arena central enmarcada en bronce con barra de jefe monumental
        - Consola táctica inferior con Maniquí Anatómico Iluminado de 3 Zonas
          (Cabeza, Torso, Piernas), selectores de postura de escudo con gemas
          indicadoras (Rojo/Verde/Oro), barra de Super-Golpes rúnicos y frascos
          de pociones en cristal.
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

    const chain = combatState.comboChain || [];
    // Fury percentage rises with combo steps & turn momentum
    const furyPct = Math.min(100, chain.length * 34 + (combatState.readySuperBlow ? 32 : 12));

    const heroPortraitSrc =
      h.faction === 'khair' ? 'assets/combat/hero_magmar.jpg' : 'assets/combat/hero_paladin.jpg';
    const enemyPortraitSrc =
      window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.getCreaturePortraitPath
        ? window.GDL_COMBAT_CANVAS.getCreaturePortraitPath(en)
        : 'assets/combat/creature_beast.jpg';

    const zones = [
      { id: 'head', label: 'Cabeza y Yelmo', short: 'CABEZA', icon: '🪖' },
      { id: 'torso', label: 'Torso y Coraza', short: 'TORSO', icon: '🥋' },
      { id: 'legs', label: 'Piernas y Guardia Baja', short: 'PIERNAS', icon: '🥾' }
    ];

    const comboHistoryIcons = chain
      .map((z) => (z === 'head' ? '🪖 Cabeza' : z === 'torso' ? '🥋 Torso' : '🥾 Piernas'))
      .join(' → ');

    // Interactive DWAR / BG3 Super-Blow Grimoire Cards (Clicking a card queues its next zone step!)
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
      const nextStepZone = sb.sequence[Math.min(2, matchedSteps)];
      const nextStepLabel = sb.seqLabels[Math.min(2, matchedSteps)];
      const multPct = Math.round((sb.mult || 1.5) * 100);

      const runesPips = sb.sequence
        .map((z, idx) => {
          const lit = idx < matchedSteps;
          const isNext = idx === matchedSteps;
          const letter = z === 'head' ? 'C' : z === 'torso' ? 'T' : 'P';
          return `<span class="sb-rune-pip ${lit ? 'lit' : ''} ${isNext ? 'next-step' : ''}" title="Paso ${
            idx + 1
          }: ${sb.seqLabels[idx]}">${letter}</span>`;
        })
        .join('<span class="sb-pip-arrow">▸</span>');

      return `
        <div class="superblow-chip skeuo-runic-sb-chip ${isReady ? 'ready-glow' : ''} ${
        matchedSteps === 1 ? 'partial-glow' : ''
      }" data-prime-superblow="${sb.id}" data-next-zone="${nextStepZone}" title="${
        sb.desc
      } — Haz clic para apuntar automáticamente al siguiente paso (${nextStepLabel})">
          <div class="sb-card-top">
            <span class="sb-icon-medallion">${sb.icon}</span>
            <div class="sb-title-col">
              <strong>${sb.name}</strong>
              <small style="color:var(--gold-bright)">(${matchedSteps}/3) • ${multPct}% Daño</small>
            </div>
            <div class="sb-pips-cluster">${runesPips}</div>
          </div>
          <div class="sb-seq">
            <span>${sb.seqLabels.join(' → ')}</span>
            <span class="sb-assist-cta">${
              isReady
                ? '⚡ ¡LISTO: GOLPEA ' + sb.seqLabels[2].toUpperCase() + '!'
                : '🎯 Apuntar: ' + nextStepLabel
            }</span>
          </div>
        </div>
      `;
    }).join('');

    // 3 Combat Stances with Red / Green / Gold Indicator Gems & Tactical Modifier Badges
    const curStance = combatState.stance || 'guardia_solar';
    const stanceGemMap = {
      guardia_solar: { gem: 'gem-gold', tag: '+25% DEF / Bloqueo' },
      furia_dragon: { gem: 'gem-red', tag: '+25% ATQ / +10% Crít' },
      velo_sombra: { gem: 'gem-green', tag: '22% Esquiva / Sangrado' }
    };
    const stancesHtml = ART.COMBAT_STANCES.map((st) => {
      const info = stanceGemMap[st.id] || { gem: 'gem-gold', tag: 'Equilibrado' };
      return `
        <button class="btn-asteria sm skeuo-stance-gem-btn ${curStance === st.id ? 'gold active' : ''}" data-combat-stance="${st.id}" title="${st.desc}">
          <div class="stance-btn-main">
            <span class="stance-indicator-gem ${info.gem}"></span>
            <span>${st.icon} ${st.name}</span>
          </div>
          <small class="stance-mod-tag">${info.tag}</small>
        </button>
      `;
    }).join('');

    // 4 Magic School Spells (BG3 / Diablo II Grimoire Spell Slots)
    const spellsHtml = ART.MAGIC_SPELLS.map((sp, idx) => {
      const canCast = h.mp >= sp.mpCost;
      const effectTag =
        sp.type === 'buff_heal'
          ? `+${Math.round((sp.healPct || 0.25) * 100)}% HP / +${sp.buffDef} DEF`
          : sp.type === 'lifesteal'
          ? `${Math.round((sp.mult || 1.35) * 100)}% ATQ + Robo Vida`
          : `${Math.round((sp.mult || 1.5) * 100)}% Daño Arcano`;
      return `
        <button class="btn-asteria sm skeuo-spell-grimoire-slot ${canCast ? 'spell-ready' : 'spell-oom'}" data-cast-spell="${sp.id}" ${
        !canCast ? 'disabled' : ''
      } title="${sp.name} (${sp.school}): ${sp.desc}">
          <span class="spell-hotkey-badge">F${idx + 1}</span>
          <span class="spell-slot-icon">${sp.icon}</span>
          <div class="spell-slot-meta">
            <strong>${sp.name.split(' ')[0]}</strong>
            <small class="spell-effect-tag">${effectTag}</small>
          </div>
          <span class="spell-mana-orb">${sp.mpCost} MP</span>
        </button>
      `;
    }).join('');

    // 6-Slot Crystal Flask Potions Belt
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
      .map((itemId, idx) => {
        const it = ART.ARTIFACTS[itemId] || ART.ARTIFACTS.elixir_vida_menor;
        const qty = actions.getItemQty(it.id);
        const flaskColor = it.healMp
          ? 'sapphire-flask'
          : it.healHp
          ? 'crimson-flask'
          : 'amber-flask';
        return `
          <button class="combat-potion-btn skeuo-crystal-flask ${flaskColor}" data-combat-potion="${it.id}" ${
          qty <= 0 ? 'disabled' : ''
        } title="${it.name}: ${it.desc}">
            <span class="flask-hotkey">${idx + 1}</span>
            <span class="flask-glass-orb">${it.icon}</span>
            <span class="flask-label">${it.name.split(' ')[0]} (x${qty})</span>
          </button>
        `;
      })
      .join('');

    // Build Left Combat Column 12-Slot Knight Paperdoll
    const UI = window.GDL_UI;
    const combatLeftSlotsHtml = UI && UI.buildPaperdollSlotsHtml
      ? UI.buildPaperdollSlotsHtml(UI.LEFT_SLOTS, state, false)
      : '';
    const combatRightSlotsHtml = UI && UI.buildPaperdollSlotsHtml
      ? UI.buildPaperdollSlotsHtml(UI.RIGHT_SLOTS, state, false)
      : '';

    const st = combatState.stats || {
      dmgDealt: 0,
      dmgMitigated: 0,
      superBlowsUsed: 0,
      spellsCast: 0,
      companionDmg: 0
    };

    const atkZ = combatState.attackZone || 'head';
    const defZ = combatState.defendZone || 'torso';

    container.innerHTML = `
      <div class="combat-stage-wrapper skeuo-dwar-combat-layout" data-testid="dwar-combat-view">
        ${
          h.injury
            ? `<div style="grid-column:1 / -1;background:rgba(158,31,23,0.35);border:1px solid var(--crimson-bright);padding:6px 10px;display:flex;justify-content:space-between;align-items:center">
                <span>🩸 <strong>Herida Activa: ${h.injury.name}</strong> (-${h.injury.penaltyPct}% ATQ/DEF). Cúrala al instante para combatir al 100%:</span>
                <button class="btn-asteria sm gold skeuo-wax-seal" id="btn-combat-cure-injury">🩹 Curar Herida Ahora</button>
              </div>`
            : ''
        }

        <!-- TOP DWAR / BG3 2-COLUMN BATTLE DECK: LEFT 12-SLOT PAPERDOLL + CENTER BRONZE ARENA -->
        <div class="dwar-combat-upper-grid">
          <!-- LEFT COLUMN: KNIGHT 12-SLOT PAPERDOLL + VIDA, MANÁ & FURIA BARS -->
          <aside class="dwar-combat-paperdoll-col skeuo-gothic-arch-alcove" data-testid="combat-knight-paperdoll">
            <div class="cv-top" style="margin-bottom:4px">
              <span class="cv-name">⚜️ ${h.name} (Nv.${h.level})</span>
              <span class="entity-badge">${(h.faction || 'ogriy').toUpperCase()}</span>
            </div>

            <!-- Vida, Maná & Furia Bars -->
            <div class="combat-knight-bars">
              <div class="ck-bar-row">
                <span>❤️ Vida</span>
                <strong>${h.hp}/${h.maxHp}</strong>
              </div>
              <div class="asteria-bar-track skeuo-beveled-track"><div class="asteria-bar-fill hp" style="width:${heroHpPct}%"></div></div>

              <div class="ck-bar-row" style="margin-top:3px">
                <span>💠 Maná</span>
                <strong>${h.mp}/${h.maxMp}</strong>
              </div>
              <div class="asteria-bar-track skeuo-beveled-track"><div class="asteria-bar-fill mp" style="width:${heroMpPct}%"></div></div>

              <div class="ck-bar-row" style="margin-top:3px">
                <span>🔥 Furia Rúnica</span>
                <strong>${furyPct}%</strong>
              </div>
              <div class="asteria-bar-track skeuo-beveled-track"><div class="asteria-bar-fill valor" style="width:${furyPct}%"></div></div>
            </div>

            <!-- 12-Slot Knight Paperdoll around Painted Avatar -->
            <div class="ragdoll-grid-stage combat-mini-paperdoll">
              <div class="ragdoll-col">${combatLeftSlotsHtml}</div>
              <div class="avatar-canvas-frame skeuo-cathedral-arch-frame combat-avatar-frame">
                <canvas id="gdl-combat-knight-canvas" width="124" height="184"></canvas>
              </div>
              <div class="ragdoll-col">${combatRightSlotsHtml}</div>
            </div>
          </aside>

          <!-- CENTER ARENA FRAMED IN FORGED BRONZE WITH MONUMENTAL BOSS BAR & VISIBLE HERO/CREATURE PORTRAITS -->
          <div class="dwar-combat-center-arena">
            <!-- Monumental Boss / Enemy Health Bar with Painted Hero & Creature Medallions -->
            <div class="combat-vitals-header skeuo-monumental-boss-bar" data-testid="monumental-boss-bar">
              <div class="combatant-vital-box hero-side combatant-with-portrait">
                <img src="${heroPortraitSrc}" alt="${h.name}" class="combat-header-portrait hero-portrait" />
                <div class="combatant-bars-col">
                  <div class="cv-top">
                    <span class="cv-name">⚜️ ${h.name}</span>
                    <span class="cv-nums">${h.hp}/${h.maxHp} HP</span>
                  </div>
                  <div class="asteria-bar-track skeuo-beveled-track"><div class="asteria-bar-fill hp" style="width:${heroHpPct}%"></div></div>
                </div>
              </div>

              <div class="combat-vs-badge skeuo-vs-medallion">⚔️ T${combatState.turn}</div>

              <div class="combatant-vital-box enemy-side monumental-enemy-side combatant-with-portrait">
                <div class="combatant-bars-col">
                  <div class="cv-top">
                    <span class="cv-name">${en.icon} ${en.name} (Nv.${en.level})</span>
                    <span class="cv-nums">${en.currentHp} / ${en.maxHp} HP</span>
                  </div>
                  <div class="asteria-bar-track skeuo-beveled-track monumental-hp-track">
                    <div class="asteria-bar-fill hp" style="width:${enemyHpPct}%"></div>
                  </div>
                  <div class="enemy-combat-tags">
                    <span>⚔️ ${en.atk} ATQ</span>
                    <span>🛡️ ${en.def} DEF</span>
                    ${combatState.enemyBleedTurns > 0 ? `<span class="debuff-tag">🩸 Sangrado (${combatState.enemyBleedTurns}t)</span>` : ''}
                    ${combatState.enemyStunned ? `<span class="debuff-tag">💫 Aturdido</span>` : ''}
                  </div>
                </div>
                <img src="${enemyPortraitSrc}" alt="${en.name}" class="combat-header-portrait enemy-portrait" />
              </div>
            </div>

            <!-- Animated 60fps HTML5 Battle Canvas in Forged Bronze Frame (Renders Hero & Creature Full Sprites) -->
            <div class="combat-canvas-box skeuo-bronze-arena-frame">
              <canvas id="gdl-battle-canvas" width="840" height="240"></canvas>
            </div>

            <!-- Redesigned Skills Deck: Postures + Grimoire Magic Spell Slots -->
            <div class="combat-tactical-subbar skeuo-grimoire-skills-bar">
              <div class="zone-panel skeuo-obsidian-subpanel">
                <div class="zone-panel-title">🛡️ Posturas de Combate (Gemas Tácticas)</div>
                <div class="stance-pills-row">${stancesHtml}</div>
              </div>
              <div class="zone-panel skeuo-obsidian-subpanel">
                <div class="zone-panel-title">📖 Grimorio de Hechizos Activos (${h.mp}/${h.maxMp} MP)</div>
                <div class="spells-pills-row grimoire-4grid">${spellsHtml}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- LOWER TACTICAL CONSOLE: 3-ZONE ILLUMINATED ANATOMICAL MANNEQUIN + SHIELD POSTURES + CRYSTAL POTIONS -->
        <div class="tactical-zones-grid skeuo-dwar-tactical-console" data-testid="anatomical-tactical-console">
          <!-- ILLUMINATED 3-ZONE ANATOMICAL MANNEQUIN (CABEZA, TORSO, PIERNAS) -->
          <div class="zone-panel skeuo-mannequin-panel">
            <div class="zone-panel-title">🎯 Maniquí Anatómico (3 Zonas)</div>
            <div class="anatomical-mannequin-stage">
              <svg viewBox="0 0 120 175" class="anatomical-mannequin-svg" role="img" aria-label="Maniquí Anatómico Iluminado de 3 Zonas">
                <!-- HEAD ZONE -->
                <g class="mannequin-zone ${atkZ === 'head' ? 'zone-atk-glow' : ''} ${defZ === 'head' ? 'zone-def-glow' : ''}" data-mannequin-zone="head">
                  <circle cx="60" cy="26" r="18"></circle>
                  <path d="M47 22 L73 22 M52 29 L68 29" stroke-width="1.5"></path>
                  <text x="60" y="29" text-anchor="middle" class="mannequin-zone-tag">C</text>
                </g>
                <!-- TORSO ZONE -->
                <g class="mannequin-zone ${atkZ === 'torso' ? 'zone-atk-glow' : ''} ${defZ === 'torso' ? 'zone-def-glow' : ''}" data-mannequin-zone="torso">
                  <polygon points="34,48 86,48 78,108 42,108"></polygon>
                  <line x1="60" y1="52" x2="60" y2="104" stroke-width="1.5"></line>
                  <text x="60" y="82" text-anchor="middle" class="mannequin-zone-tag">T</text>
                </g>
                <!-- LEGS ZONE -->
                <g class="mannequin-zone ${atkZ === 'legs' ? 'zone-atk-glow' : ''} ${defZ === 'legs' ? 'zone-def-glow' : ''}" data-mannequin-zone="legs">
                  <rect x="42" y="112" width="15" height="54" rx="4"></rect>
                  <rect x="63" y="112" width="15" height="54" rx="4"></rect>
                  <text x="60" y="142" text-anchor="middle" class="mannequin-zone-tag">P</text>
                </g>
              </svg>
              <div class="mannequin-legend">
                <span class="m-leg atk">🔴 Ataque: <strong>${atkZ.toUpperCase()}</strong></span>
                <span class="m-leg def">🟢 Escudo: <strong>${defZ.toUpperCase()}</strong></span>
              </div>
            </div>
          </div>

          <div class="zone-panel">
            <div class="zone-panel-title">1. Zona de Ataque (Objetivo)</div>
            <div class="zone-btn-list">
              ${zones
                .map(
                  (z) => `
                <button class="tactical-zone-btn ${
                  combatState.attackZone === z.id ? 'active-atk' : ''
                }" data-atk-zone="${z.id}">
                  <span><i class="stance-indicator-gem gem-red"></i> ⚔️ ${z.label}</span>
                  <span>${combatState.attackZone === z.id ? 'OBJETIVO' : 'Apuntar'}</span>
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
                  <span><i class="stance-indicator-gem gem-green"></i> 🛡️ ${z.label}</span>
                  <span>${combatState.defendZone === z.id ? 'GUARDIA' : 'Cubrir'}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="zone-panel execute-panel">
            <div class="zone-panel-title">3. Embate, Morok y Frascos de Cristal (6)</div>
            <div style="display:flex;gap:5px">
              <button class="btn-asteria crimson lg-strike skeuo-bronze-leather-plate" id="btn-execute-turn" style="flex:1">
                ⚔️ ¡EJECUTAR EMBATE!
              </button>
              <button class="btn-asteria gold sm skeuo-wax-seal" id="btn-summon-morok" ${
                combatState.summonedMorok ? 'disabled' : ''
              } title="Invoca tu Montura (Ignifer) o un Morok Solar para absorber 35% de daño y atacar cada turno">
                🔥 ${combatState.summonedMorok ? 'Morok Activo' : 'Invocar Morok'}
              </button>
            </div>
            <div class="combat-potions-grid belt-6">
              ${beltHtml}
            </div>
            <button class="btn-asteria sm skeuo-wax-seal" id="btn-retreat-combat">🏳️ Retirarse a la Estancia</button>
          </div>
        </div>

        <!-- 6 RUNIC SUPER-BLOWS SEQUENCE TRACKER BAR (1-CLICK COMBO ASSIST) -->
        <div class="superblows-bar skeuo-runic-superblows-bar">
          <div class="sb-current-chain">
            <span>⚡ Códice de 6 Super-Golpes Rúnicos (Haz clic en cualquiera para apuntar su siguiente golpe):</span>
            <strong>${comboHistoryIcons || '0/3 — Selecciona un Super-Golpe o una Zona de Ataque'}</strong>
          </div>
          <div class="sb-recipes-row six-grid">
            ${superBlowsHtml}
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

    // Render both the main 60fps battle canvas and the knight paperdoll avatar in combat
    if (window.GDL_AVATAR && window.GDL_AVATAR.drawHeroAvatar) {
      window.GDL_AVATAR.drawHeroAvatar('gdl-combat-knight-canvas', state);
    }
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

    // Clicking on a Super-Blow Card automatically queues its next required attack zone!
    container.querySelectorAll('[data-prime-superblow]').forEach((card) => {
      card.addEventListener('click', () => {
        const nextZone = card.getAttribute('data-next-zone');
        if (nextZone) {
          combatState.attackZone = nextZone;
          renderCombatView(container, state, combatState, actions);
        }
      });
    });

    // Clicking on the 3-Zone Anatomical Mannequin sets attack zone
    container.querySelectorAll('[data-mannequin-zone]').forEach((g) => {
      g.addEventListener('click', () => {
        combatState.attackZone = g.getAttribute('data-mannequin-zone');
        renderCombatView(container, state, combatState, actions);
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
     4. MAPA INTERACTIVO DE ZONAS DE ASTERIA (CONNECTED NODE MAP + REGIONS)
     ------------------------------------------------------------------------ */
  const MAP_NODE_COORDS = {
    ciudadela_luz:      { x: 130, y: 155, short: 'Ciudadela' },
    llanuras_alba:      { x: 295, y: 95,  short: 'Llanuras' },
    bosque_ecos:        { x: 315, y: 215, short: 'Bosque Ecos' },
    lago_espejo:        { x: 475, y: 235, short: 'Lago Espejo' },
    cuevas_cristalinas: { x: 525, y: 120, short: 'Cuevas Cristal' },
    templo_antiguo:     { x: 675, y: 195, short: 'Templo Antiguo' },
    frontera_ceniza:    { x: 785, y: 95,  short: 'Frontera Ceniza' }
  };

  function renderAtlasView(container, state, actions) {
    window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
    if (window.GDL_COMBAT_CANVAS && window.GDL_COMBAT_CANVAS.stopBattleLoop) {
      window.GDL_COMBAT_CANVAS.stopBattleLoop();
    }

    const curLoc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    const adjacentSet = new Set(curLoc.connectedTo || []);

    // Build deduplicated route lines between connected zones
    const drawnEdges = new Set();
    const edgesSvg = [];
    ART.LOCATIONS.forEach((loc) => {
      const from = MAP_NODE_COORDS[loc.id];
      if (!from) return;
      (loc.connectedTo || []).forEach((destId) => {
        const to = MAP_NODE_COORDS[destId];
        if (!to) return;
        const edgeKey = [loc.id, destId].sort().join('--');
        if (drawnEdges.has(edgeKey)) return;
        drawnEdges.add(edgeKey);
        const isActiveRoute = loc.id === curLoc.id || destId === curLoc.id;
        edgesSvg.push(
          `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" class="map-route-line ${
            isActiveRoute ? 'active-route' : ''
          }" />`
        );
      });
    });

    const nodesSvg = ART.LOCATIONS.map((loc) => {
      const pos = MAP_NODE_COORDS[loc.id];
      if (!pos) return '';
      const isCur = loc.id === curLoc.id;
      const isAdj = adjacentSet.has(loc.id);
      const locked = state.hero.level < loc.minLevel;
      const cls = isCur
        ? 'map-node current'
        : locked
        ? 'map-node locked'
        : isAdj
        ? 'map-node adjacent'
        : 'map-node';
      return `
        <g class="${cls}" data-atlas-go="${loc.id}" style="cursor:${locked ? 'not-allowed' : 'pointer'}">
          ${isCur ? `<circle cx="${pos.x}" cy="${pos.y}" r="25" class="map-node-pulse" />` : ''}
          <circle cx="${pos.x}" cy="${pos.y}" r="${isCur ? 18 : 14}" class="map-node-circle" />
          <text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" class="map-node-lvl">${
        isCur ? '★' : loc.minLevel
      }</text>
          <text x="${pos.x}" y="${pos.y + 33}" text-anchor="middle" class="map-node-label">${pos.short}</text>
        </g>
      `;
    }).join('');

    const cardsHtml = ART.LOCATIONS.map((loc) => {
      const isCur = state.world.currentLocation === loc.id;
      const isAdj = adjacentSet.has(loc.id);
      const locked = state.hero.level < loc.minLevel;
      return `
        <div class="atlas-region-card skeuo-rel-card ${isCur ? 'current' : ''} ${
        loc.isEndgameEstancia ? 'endgame-card' : ''
      }">
          <div class="atlas-card-thumb" style="background-image:url('${loc.img}')">
            <span class="atlas-danger-tag">${loc.dangerLabel}</span>
            ${isAdj && !locked ? '<span class="atlas-adj-badge">🧭 Ruta Directa</span>' : ''}
          </div>
          <div class="atlas-card-content">
            <h4>${loc.name}</h4>
            <p>${loc.subtitle}</p>
            <button class="btn-asteria skeuo-bronze-leather-plate ${isCur || isAdj ? 'gold' : ''}" data-atlas-go="${loc.id}" ${
        locked ? 'disabled' : ''
      }>
              ${
                isCur
                  ? '📍 Ubicación Actual'
                  : locked
                  ? `🔒 Requiere Nivel ${loc.minLevel}`
                  : isAdj
                  ? '🧭 Transición Directa'
                  : '🗺️ Viajar a Región'
              }
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="atlas-view-wrapper">
        <div class="box-header-ornate">
          <span>🗺️ Mapa Interactivo de Zonas de Asteria — Navegación por Rutas Conectadas</span>
          <span>Ubicación: ${curLoc.name} • Nivel ${state.hero.level}</span>
        </div>

        <div class="asteria-interactive-map-box skeuo-bronze-arena-frame">
          <svg viewBox="0 0 900 295" class="asteria-world-svg" role="img" aria-label="Mapa conectado de las 7 zonas de Asteria">
            <defs>
              <radialGradient id="mapBgGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stop-color="#231c13" />
                <stop offset="100%" stop-color="#0b0907" />
              </radialGradient>
            </defs>
            <rect width="900" height="295" fill="url(#mapBgGrad)" />
            <g class="map-routes-layer">${edgesSvg.join('')}</g>
            <g class="map-nodes-layer">${nodesSvg}</g>
          </svg>
          <div class="map-legend-strip">
            <span><i class="leg-dot cur"></i> Ubicación Actual</span>
            <span><i class="leg-dot adj"></i> Zona Adyacente (Transición Directa)</span>
            <span><i class="leg-dot lock"></i> Nivel Insuficiente</span>
          </div>
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

  /* ------------------------------------------------------------------------
     5. DEDICATED RIGHT ASTERIA SIDEBAR (Переходы + Персонажи в локации)
     ------------------------------------------------------------------------ */
  function renderZoneNavigationSidebar(state, actions) {
    const curLocEl = document.getElementById('asteria-sidebar-current-loc');
    const transEl = document.getElementById('asteria-sidebar-transitions');
    const warriorsEl = document.getElementById('asteria-sidebar-warriors');
    const countEl = document.getElementById('asteria-sidebar-warriors-count');
    if (!transEl || !warriorsEl) return;

    const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    if (curLocEl) {
      curLocEl.innerHTML = `<span class="cur-loc-pin">📍</span> <strong>${loc.name}</strong>`;
    }

    const transitionsHtml = (loc.connectedTo || [])
      .map((destId) => {
        const dest = ART.LOCATIONS.find((l) => l.id === destId);
        if (!dest) return '';
        const locked = state.hero.level < dest.minLevel;
        return `
          <button class="sidebar-trans-btn skeuo-bronze-leather-plate ${locked ? 'locked' : ''} ${
          dest.isEndgameEstancia ? 'endgame' : ''
        }" data-sidebar-travel="${dest.id}" title="${dest.subtitle}">
            <span class="trans-arrow">${locked ? '🔒' : '➤'}</span>
            <div class="trans-text">
              <span class="trans-name">${dest.name}</span>
              <small class="trans-lvl">Nivel ${dest.minLevel}+</small>
            </div>
          </button>
        `;
      })
      .join('');

    transEl.innerHTML = transitionsHtml;
    transEl.querySelectorAll('[data-sidebar-travel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.travelTo(btn.getAttribute('data-sidebar-travel'));
      });
    });

    const locIdx = Math.max(0, ART.LOCATIONS.findIndex((l) => l.id === loc.id));
    const zoneWarriors = (ART.AI_WARRIORS || []).filter((_, i) => i % ART.LOCATIONS.length === locIdx);
    if (countEl) countEl.textContent = String(zoneWarriors.length);

    warriorsEl.innerHTML = zoneWarriors
      .map(
        (w) => `
        <div class="sidebar-warrior-row">
          <div class="sw-info">
            <span class="sw-name">${w.faction === 'khair' ? '🔥' : '☀️'} ${w.name}</span>
            <small class="sw-meta">Nv.${w.level} • ${w.clan}</small>
          </div>
          <div class="sw-actions">
            <button class="sw-icon-btn" data-sw-inspect="${w.id}" title="Ver Perfil">👤</button>
            <button class="sw-icon-btn crimson" data-sw-pvp="${w.id}" title="Retar PvP">⚔️</button>
            <button class="sw-icon-btn" data-sw-gift="${w.id}" title="Enviar Regalo (50c)">🎁</button>
          </div>
        </div>
      `
      )
      .join('');

    warriorsEl.querySelectorAll('[data-sw-inspect]').forEach((btn) => {
      btn.addEventListener('click', () => actions.inspectAiWarrior(btn.getAttribute('data-sw-inspect')));
    });
    warriorsEl.querySelectorAll('[data-sw-pvp]').forEach((btn) => {
      btn.addEventListener('click', () => actions.startPvpCombat(btn.getAttribute('data-sw-pvp')));
    });
    warriorsEl.querySelectorAll('[data-sw-gift]').forEach((btn) => {
      btn.addEventListener('click', () => actions.sendGiftToWarrior(btn.getAttribute('data-sw-gift')));
    });
  }

  return {
    renderLocationView,
    renderHuntingView,
    renderCombatView,
    renderAtlasView,
    renderZoneNavigationSidebar
  };
})();
