/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/views/mainViews.js
   Primary Center-Stage Views:
   1. Panorama HD View (Oil-painted location, interactive hotspots, NPCs, Bosses)
   2. Modo Caza (Real-time HTML5 Hunting & Resource Gathering Canvas)
   3. Combate Direccional de 3 Zonas + Super-Golpes + Cinturón Rápido
   4. Atlas Cartográfico de las 7 Regiones y Estancias Finales
   ========================================================================== */

window.GDL_MAIN_VIEWS = (function () {
  'use strict';

  const ART = window.GDL_ART;

  function renderLocationView(container, state, actions) {
    window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
    const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    const locCreatures = ART.CREATURES.filter((c) => c.loc === loc.id);
    const locNpcs = (loc.npcs || []).map((id) => ART.NPCS[id]).filter(Boolean);

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

        <!-- Lower Tactical Deck: NPCs, Creatures & Travel Gates -->
        <div class="location-lower-grid">
          <div class="loc-column-box">
            <div class="box-header-ornate">
              <span>🏛️ Maestres y Personajes en ${loc.name}</span>
              <span>${locNpcs.length}</span>
            </div>
            <div class="entities-scroll-list">
              ${npcsCardsHtml}
            </div>
          </div>

          <div class="loc-column-box">
            <div class="box-header-ornate">
              <span>⚔️ Criaturas y Jefes de Estancia</span>
              <span>${locCreatures.length}</span>
            </div>
            <div class="entities-scroll-list">
              ${creaturesCardsHtml}
            </div>
          </div>

          <div class="loc-column-box full-span">
            <div class="box-header-ornate">
              <span>🧭 Rutas y Portales hacia Otras Estancias</span>
              <span>Viaje Rápido</span>
            </div>
            <div class="travel-gates-grid">
              ${travelGatesHtml}
            </div>
          </div>
        </div>
      </div>
    `;

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

    // Bind travel gates
    container.querySelectorAll('[data-travel-loc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.travelTo(btn.getAttribute('data-travel-loc'));
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. REAL-TIME HUNTING MODE (MODO CAZA)
     ------------------------------------------------------------------------ */
  function renderHuntingView(container, state, actions) {
    const loc = ART.LOCATIONS.find((l) => l.id === state.world.currentLocation) || ART.LOCATIONS[0];
    container.innerHTML = `
      <div class="hunting-view-wrapper">
        <div class="hunting-top-bar">
          <div>
            <span class="scene-subtitle-pill">Exploración y Recolección en Tiempo Real</span>
            <h2 class="hunting-title">🏹 Coto de Caza: ${loc.name}</h2>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn-asteria" id="btn-respawn-hunting">🔄 Explorar Nuevos Rastros</button>
            <button class="btn-asteria gold" id="btn-exit-hunting">🏰 Volver a Estancia</button>
          </div>
        </div>

        <div class="hunting-canvas-frame">
          <canvas id="gdl-hunting-canvas" width="860" height="390"></canvas>
        </div>

        <div class="hunting-legend-bar">
          <span>💡 <strong>Instrucciones de Caza:</strong> Haz clic directamente sobre las <strong>Criaturas en movimiento</strong> para iniciar un embate táctico o sobre las <strong>Vetas, Hierbas y Cardúmenes brillantes</strong> para recolectar materiales de profesión.</span>
        </div>
      </div>
    `;

    document.getElementById('btn-exit-hunting').addEventListener('click', () => {
      actions.switchCenterView('location');
    });

    document.getElementById('btn-respawn-hunting').addEventListener('click', () => {
      window.GDL_HUNTING_CANVAS.spawnEntitiesForLocation(loc);
    });

    window.GDL_HUNTING_CANVAS.startHuntingCanvas('gdl-hunting-canvas', loc, {
      onAttackCreature: (creatureId) => {
        window.GDL_HUNTING_CANVAS.stopHuntingCanvas();
        actions.startCombat(creatureId);
      },
      onHarvestNode: (node) => {
        actions.harvestNode(node);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. DIRECTIONAL 3-ZONE TACTICAL COMBAT + SUPER-BLOWS
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
    const heroHpPct = Math.max(0, Math.round((h.hp / h.maxHp) * 100));
    const enemyHpPct = Math.max(0, Math.round((en.currentHp / en.maxHp) * 100));

    const zones = [
      { id: 'head', label: 'Cabeza y Yelmo', icon: '🪖' },
      { id: 'torso', label: 'Torso y Coraza', icon: '🥋' },
      { id: 'legs', label: 'Piernas y Guardia Baja', icon: '🥾' }
    ];

    const comboHistoryIcons = (combatState.comboChain || [])
      .map((z) => (z === 'head' ? '🪖 Cabeza' : z === 'torso' ? '🥋 Torso' : '🥾 Piernas'))
      .join(' → ');

    const superBlowsHtml = ART.SUPER_BLOWS.map((sb) => {
      const isReady = combatState.readySuperBlow && combatState.readySuperBlow.id === sb.id;
      return `
        <div class="superblow-chip ${isReady ? 'ready-glow' : ''}" title="${sb.desc}">
          <span>${sb.icon} <strong>${sb.name}</strong></span>
          <span class="sb-seq">${sb.seqLabels.join(' → ')}</span>
        </div>
      `;
    }).join('');

    const beltConsumables = ['elixir_vida_menor', 'elixir_vida_mayor', 'nectar_mana_astral', 'panacea_solar'];
    const beltHtml = beltConsumables
      .map((itemId) => {
        const it = ART.ARTIFACTS[itemId];
        const qty = actions.getItemQty(itemId);
        return `
          <button class="combat-potion-btn" data-combat-potion="${itemId}" ${qty <= 0 ? 'disabled' : ''} title="${it.name}: ${it.desc}">
            <span>${it.icon}</span>
            <span>${it.name.split(' ')[0]} (x${qty})</span>
          </button>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="combat-stage-wrapper">
        <!-- Top Combatants Vital Header -->
        <div class="combat-vitals-header">
          <div class="combatant-vital-box hero-side">
            <div class="cv-top">
              <span class="cv-name">⚜️ ${h.name} (Nv.${h.level})</span>
              <span class="cv-nums">${h.hp} / ${h.maxHp} HP</span>
            </div>
            <div class="asteria-bar-track"><div class="asteria-bar-fill hp" style="width:${heroHpPct}%"></div></div>
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

        <!-- Animated HTML5 Battle Canvas -->
        <div class="combat-canvas-box">
          <canvas id="gdl-battle-canvas" width="840" height="230"></canvas>
        </div>

        <!-- Super-Blows Sequence Tracker -->
        <div class="superblows-bar">
          <div class="sb-current-chain">
            <span>Secuencia Actual:</span>
            <strong>${comboHistoryIcons || 'Ejecuta golpes para encadenar un Super-Golpe'}</strong>
          </div>
          <div class="sb-recipes-row">
            ${superBlowsHtml}
          </div>
        </div>

        <!-- 3-Zone Directional Controls + Action Execution -->
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
            <div class="zone-panel-title">3. Ejecutar Turno y Cinturón</div>
            <button class="btn-asteria crimson lg-strike" id="btn-execute-turn">
              ⚔️ ¡EJECUTAR EMBATE SOLAR!
            </button>
            <div class="combat-potions-grid">
              ${beltHtml}
            </div>
            <button class="btn-asteria sm" id="btn-retreat-combat">🏳️ Retirarse a la Estancia</button>
          </div>
        </div>

        <!-- Turn-by-Turn Combat Log -->
        <div class="combat-log-box">
          ${(combatState.log || []).map((l) => `<div class="combat-log-line">${l}</div>`).join('')}
        </div>
      </div>
    `;

    window.GDL_COMBAT_CANVAS.renderBattleCanvas('gdl-battle-canvas', combatState, loc);

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
