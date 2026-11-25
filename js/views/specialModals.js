/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/views/specialModals.js
   HD Illustrated Modal Systems matching mainViews.js visual quality:
   - NPC Illustrated Dialogues & Shops (with 1:1 HD Oil Portraits)
   - Eltic Cube (Cubo Éltico — Alchemical & Cosmic Transmutation)
   - 6 Professions & Master Crafting (Herrería, Alquimia, Joyería, Recolección)
   - Pets (Mascotas de Combate) & Mounts (Monturas e Ignifer)
   - Medals & Pantheon of Honor (Medallas)
   - Magic Mirror of Solaria (Espejo Mágico)
   - Tavern Dice Mini-Game (Dados de Taberna del Grifo Dorado)
   - Clans & PvP Arena vs 16 Spanish AI Warriors
   - Persistent Save Export/Import & Endgame Victory Cinematic
   ========================================================================== */

window.GDL_SPECIAL_MODALS = (function () {
  'use strict';

  const ART = window.GDL_ART;

  function openModalShell(titleHtml, bodyHtml) {
    const backdrop = document.getElementById('gdl-modal-backdrop');
    const titleEl = document.getElementById('gdl-modal-title');
    const bodyEl = document.getElementById('gdl-modal-body');
    if (!backdrop || !titleEl || !bodyEl) return null;

    titleEl.innerHTML = titleHtml;
    bodyEl.innerHTML = bodyHtml;
    backdrop.classList.remove('hidden');
    return bodyEl;
  }

  function closeModalShell() {
    const backdrop = document.getElementById('gdl-modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
  }

  /* ------------------------------------------------------------------------
     1. NPC HD ILLUSTRATED DIALOGUE, QUESTS & MERCHANT SHOP
     ------------------------------------------------------------------------ */
  function openNpcDialog(npcId, state, actions) {
    const npc = ART.NPCS[npcId];
    if (!npc) return;
    const loc = ART.LOCATIONS.find((l) => l.id === npc.locationId) || ART.LOCATIONS[0];

    const shopHtml = (npc.shopItems || [])
      .map((itemId) => {
        const it = ART.ARTIFACTS[itemId];
        if (!it) return '';
        const statBadges = it.stats
          ? Object.entries(it.stats)
              .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
              .join(' • ')
          : it.healHp || it.healMp
          ? `Salud/Maná: +${it.healHp || 0} HP / +${it.healMp || 0} MP`
          : 'Material / Herramienta';

        return `
          <div class="modal-shop-row rarity-border-${it.rarity}">
            <div class="shop-item-icon">${it.icon}</div>
            <div class="shop-item-info">
              <div class="shop-item-title">${it.name}</div>
              <div class="shop-item-stats">${statBadges}</div>
              <div class="shop-item-desc">${it.desc}</div>
            </div>
            <div class="shop-item-buy">
              <div class="price-tag">${ART.formatCurrencyBadge(it.price)}</div>
              <button class="btn-asteria sm gold" data-buy-artifact="${it.id}">Adquirir</button>
            </div>
          </div>
        `;
      })
      .join('');

    const specialShortcutsHtml = (npc.actions || [])
      .map((act) => {
        const map = {
          quests: { label: '📜 Misiones de la Orden', modal: 'quests' },
          medals: { label: '🎖️ Panteón de Medallas', modal: 'medals' },
          clans: { label: '🛡️ Clanes y Arena PvP', modal: 'arena' },
          professions: { label: '⚒️ 6 Profesiones y Forja', modal: 'professions' },
          cube: { label: '🧊 Abrir Cubo Éltico', modal: 'cube' },
          mirror: { label: '🪞 Espejo Mágico de Solaria', modal: 'mirror' },
          hunting: { label: '🏹 Ir al Modo Caza', view: 'hunting' },
          pets: { label: '🦅 Mascotas de Combate', modal: 'mounts' },
          mounts: { label: '🔥 Monturas e Ignifer', modal: 'mounts' },
          tavern: { label: '🎲 Dados de Taberna', modal: 'tavern' }
        };
        const m = map[act];
        if (!m) return '';
        return `<button class="btn-asteria gold" data-npc-shortcut="${m.modal || ''}" data-npc-view="${
          m.view || ''
        }">${m.label}</button>`;
      })
      .join('');

    const body = openModalShell(
      `<span>💬 ${npc.name} — <small style="color:var(--text-muted)">${npc.title}</small></span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${loc.img}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${npc.portrait}" alt="${npc.name}" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">${npc.badge} • ${loc.name}</span>
            <h3>${npc.name}</h3>
            <blockquote class="npc-quote-text">${npc.greeting}</blockquote>
            <div class="npc-shortcuts-bar">
              ${specialShortcutsHtml}
            </div>
          </div>
        </div>

        <div class="modal-section-header">
          <span>🛒 Arsenal y Suministros de ${npc.name}</span>
          <span>Tu Bolsa: ${ART.formatCurrencyBadge(state.hero.copper)}</span>
        </div>
        <div class="modal-shop-grid">
          ${shopHtml}
        </div>
      `
    );

    if (!body) return;

    body.querySelectorAll('[data-buy-artifact]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-buy-artifact');
        actions.buyItem(itemId);
        openNpcDialog(npcId, state, actions);
      });
    });

    body.querySelectorAll('[data-npc-shortcut]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalKey = btn.getAttribute('data-npc-shortcut');
        const viewKey = btn.getAttribute('data-npc-view');
        if (viewKey) {
          closeModalShell();
          actions.switchCenterView(viewKey);
        } else if (modalKey) {
          openSpecialModal(modalKey, state, actions);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. SPECIAL MODALS ROUTER
     ------------------------------------------------------------------------ */
  function openSpecialModal(modalType, state, actions) {
    if (modalType === 'cube') return renderElticCubeModal(state, actions);
    if (modalType === 'professions') return renderProfessionsModal(state, actions);
    if (modalType === 'mounts' || modalType === 'pets') return renderMountsAndPetsModal(state, actions);
    if (modalType === 'medals') return renderMedalsModal(state, actions);
    if (modalType === 'mirror') return renderMagicMirrorModal(state, actions);
    if (modalType === 'tavern') return renderTavernDiceModal(state, actions);
    if (modalType === 'arena' || modalType === 'clans') return renderArenaAndClansModal(state, actions);
    if (modalType === 'quests') return renderQuestsModal(state, actions);
    if (modalType === 'save') return renderSaveManagerModal(state, actions);
    if (modalType === 'victory') return renderVictoryCinematicModal(state);
  }

  /* ------------------------------------------------------------------------
     3. CUBO ÉLTICO (ELTIC CUBE TRANSMUTATION)
     ------------------------------------------------------------------------ */
  function renderElticCubeModal(state, actions) {
    const recipesHtml = ART.CUBE_RECIPES.map((rec) => {
      const resultItem = ART.ARTIFACTS[rec.resultId];
      const ingsHtml = rec.ingredients
        .map((ing) => {
          const it = ART.ARTIFACTS[ing.itemId];
          const have = actions.getItemQty(ing.itemId);
          const ok = have >= ing.qty;
          return `<span class="ing-pill ${ok ? 'ok' : 'missing'}">${it.icon} ${it.name} (${have}/${ing.qty})</span>`;
        })
        .join(' ');

      return `
        <div class="modal-shop-row rarity-border-${resultItem.rarity}">
          <div class="shop-item-icon">${resultItem.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${rec.name} (x${rec.resultQty})</div>
            <div class="shop-item-desc">${resultItem.desc}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${ingsHtml}</div>
          </div>
          <div class="shop-item-buy">
            <div class="price-tag">${ART.formatCurrencyBadge(rec.copperCost)}</div>
            <button class="btn-asteria sm gold" data-cube-transmute="${rec.id}">🧊 Transmutar</button>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🧊 El Cubo Éltico — Santuario de Síntesis Arcana</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.cuevas_cristalinas}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.alquimista_selene}" alt="Cubo Éltico" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Artefacto de los Antiguos Arquitectos</span>
            <h3>Transmutación en el Cubo Éltico</h3>
            <p class="npc-quote-text">Combina Fragmentos Élticos, Cristales de Luminita, Runas del Templo Antiguo y Núcleos de Obsidiana para sintetizar las armas y armaduras más poderosas de Asteria.</p>
          </div>
        </div>
        <div class="modal-shop-grid">
          ${recipesHtml}
        </div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-cube-transmute]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.transmuteCube(btn.getAttribute('data-cube-transmute'));
        renderElticCubeModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. 6 PROFESSIONS & FORGE UPGRADING
     ------------------------------------------------------------------------ */
  function renderProfessionsModal(state, actions) {
    const profsHtml = ART.PROFESSIONS.map((pr) => {
      const pData = (state.professions && state.professions[pr.id]) || { level: 1, xp: 0 };
      const pct = Math.min(100, Math.round((pData.xp / (pData.level * 50)) * 100));
      return `
        <div class="prof-card-box">
          <div class="prof-card-head">
            <span class="prof-icon-lg">${pr.icon}</span>
            <div>
              <h4>${pr.name}</h4>
              <span class="entity-badge">${pr.type} • Nivel ${pData.level}</span>
            </div>
          </div>
          <p class="shop-item-desc">${pr.desc}</p>
          <div class="asteria-bar-track"><div class="asteria-bar-fill xp" style="width:${pct}%"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px">
            <span>Dominio: ${pData.xp} / ${pData.level * 50} XP</span>
            <button class="btn-asteria sm gold" data-train-prof="${pr.id}">Practicar Oficio (120c)</button>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>⚒️ Gremio de las 6 Profesiones — Maestría y Artesanía</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.herrero_korgan}" alt="Herrero Korgan" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Maestres Korgan, Selene y Lyon</span>
            <h3>Las Seis Disciplinas de Asteria</h3>
            <p class="npc-quote-text">Recolecta recursos en el Modo Caza en tiempo real o entrena en los talleres de la Ciudadela para elevar el rango de tus 6 profesiones y desbloquear bonificaciones pasivas permanentes.</p>
          </div>
        </div>
        <div class="prof-grid-2col">
          ${profsHtml}
        </div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-train-prof]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.trainProfession(btn.getAttribute('data-train-prof'));
        renderProfessionsModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. PETS (MASCOTAS) & MOUNTS (MONTURAS + IGNIFER)
     ------------------------------------------------------------------------ */
  function renderMountsAndPetsModal(state, actions) {
    const mountsHtml = ART.MOUNTS.map((m) => {
      const owned = state.mounts.owned.includes(m.id);
      const isActive = state.mounts.active === m.id;
      const statsStr = Object.entries(m.stats)
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
        .join(' • ');
      return `
        <div class="modal-shop-row rarity-border-${m.rarity}">
          <div class="shop-item-icon">${m.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${m.name} ${isActive ? '• [MONTADA]' : ''}</div>
            <div class="shop-item-stats">${statsStr}</div>
            <div class="shop-item-desc">${m.desc}</div>
          </div>
          <div class="shop-item-buy">
            ${
              owned
                ? `<button class="btn-asteria sm ${isActive ? 'crimson' : 'gold'}" data-toggle-mount="${
                    m.id
                  }">${isActive ? 'Desmontar' : 'Montar'}</button>`
                : `<div class="price-tag">${ART.formatCurrencyBadge(m.price)}</div>
                   <button class="btn-asteria sm gold" data-buy-mount="${m.id}">Domar</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    const petsHtml = ART.PETS.map((p) => {
      const owned = state.pets.owned.includes(p.id);
      const isActive = state.pets.active === p.id;
      return `
        <div class="modal-shop-row rarity-border-${p.rarity}">
          <div class="shop-item-icon">${p.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${p.name} ${isActive ? '• [ACTIVA]' : ''}</div>
            <div class="shop-item-stats">+${p.bonusAtk} ATQ • +${p.bonusCrit}% CRÍT • Daño Asistencia: ${p.assistDmg}</div>
            <div class="shop-item-desc">${p.desc}</div>
          </div>
          <div class="shop-item-buy">
            ${
              owned
                ? `<button class="btn-asteria sm ${isActive ? 'crimson' : 'gold'}" data-toggle-pet="${
                    p.id
                  }">${isActive ? 'Descansar' : 'Invocar'}</button>`
                : `<div class="price-tag">${ART.formatCurrencyBadge(p.price)}</div>
                   <button class="btn-asteria sm gold" data-buy-pet="${p.id}">Adoptar</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🔥 Establos Reales de Ignifer y Compañeros de Guerra</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.llanuras_alba}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.explorador_lyon}" alt="Explorador Lyon" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Caballería de la Luz & Familiares</span>
            <h3>Monturas de Guerra (Ignifer) y Mascotas de Combate</h3>
            <p class="npc-quote-text">Tu montura activa suma sus atributos directamente a tu héroe, mientras que tu mascota invocada golpea automáticamente al enemigo en cada ronda de combate.</p>
          </div>
        </div>

        <div class="modal-section-header"><span>🐎 Monturas Reales y Corcel Mítico Ignifer</span></div>
        <div class="modal-shop-grid">${mountsHtml}</div>

        <div class="modal-section-header" style="margin-top:14px"><span>🦅 Mascotas de Combate (Asistencia por Turno)</span></div>
        <div class="modal-shop-grid">${petsHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-buy-mount]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyOrEquipMount(btn.getAttribute('data-buy-mount'));
        renderMountsAndPetsModal(state, actions);
      });
    });
    body.querySelectorAll('[data-toggle-mount]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyOrEquipMount(btn.getAttribute('data-toggle-mount'));
        renderMountsAndPetsModal(state, actions);
      });
    });
    body.querySelectorAll('[data-buy-pet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyOrEquipPet(btn.getAttribute('data-buy-pet'));
        renderMountsAndPetsModal(state, actions);
      });
    });
    body.querySelectorAll('[data-toggle-pet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyOrEquipPet(btn.getAttribute('data-toggle-pet'));
        renderMountsAndPetsModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. MEDALS OF HONOR (PANTEÓN DE MEDALLAS)
     ------------------------------------------------------------------------ */
  function renderMedalsModal(state, actions) {
    const medalsHtml = ART.MEDALS.map((med) => {
      const unlocked = actions.checkMedalUnlocked(med.id);
      return `
        <div class="modal-shop-row ${unlocked ? 'rarity-border-legendary' : ''}">
          <div class="shop-item-icon">${med.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${med.name}</div>
            <div class="shop-item-stats">${med.bonus}</div>
            <div class="shop-item-desc">Requisito: ${med.reqText}</div>
          </div>
          <div class="shop-item-buy">
            <span class="entity-badge ${unlocked ? 'gold' : ''}">${
        unlocked ? '★ CONSAGRADA' : 'En Progreso'
      }</span>
          </div>
        </div>
      `;
    }).join('');

    openModalShell(
      `<span>🎖️ Panteón de Medallas y Órdenes de Asteria</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.templo_antiguo}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Comandante Aurelius" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Honores Permanentes</span>
            <h3>Condecoraciones de los Guerreros de la Luz</h3>
            <p class="npc-quote-text">Cada Medalla consagrada otorga bonificaciones permanentes de Fuerza, Defensa, Vitalidad y Crítico que se suman automáticamente a tu perfil.</p>
          </div>
        </div>
        <div class="modal-shop-grid">${medalsHtml}</div>
      `
    );
  }

  /* ------------------------------------------------------------------------
     7. MAGIC MIRROR OF SOLARIA (ESPEJO MÁGICO)
     ------------------------------------------------------------------------ */
  function renderMagicMirrorModal(state, actions) {
    const body = openModalShell(
      `<span>🪞 El Espejo Mágico de Solaria — Bendición Astral</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.lago_espejo}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.alquimista_selene}" alt="Espejo Mágico" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Santuario del Lago del Espejo</span>
            <h3>Reflejo del Destino Solar</h3>
            <p class="npc-quote-text">Canaliza monedas en la superficie del Espejo Mágico para recibir una bendición aleatoria permanente (+Atributos, Restauración Total o Reliquias Rúnicas).</p>
            <div style="margin-top:10px;display:flex;gap:10px;align-items:center">
              <button class="btn-asteria gold" id="btn-invoke-mirror">✨ Invocar Reflejo Astral (250c)</button>
              <span>Bendiciones recibidas: <strong>${state.world.mirrorUses || 0}</strong></span>
            </div>
          </div>
        </div>
        <div id="mirror-result-banner" class="npc-quote-text" style="padding:14px;text-align:center">
          Contempla el espejo y desata su fulgor estelar...
        </div>
      `
    );

    if (!body) return;
    body.querySelector('#btn-invoke-mirror').addEventListener('click', () => {
      const msg = actions.invokeMagicMirror();
      const res = body.querySelector('#mirror-result-banner');
      if (res) res.innerHTML = `<strong style="color:var(--gold-bright)">${msg}</strong>`;
    });
  }

  /* ------------------------------------------------------------------------
     8. TAVERN DICE MINI-GAME (DADOS DE TABERNA DEL GRIFO DORADO)
     ------------------------------------------------------------------------ */
  function renderTavernDiceModal(state, actions) {
    const body = openModalShell(
      `<span>🎲 Taberna del Grifo Dorado — Dados de Fortuna Solar</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.herrero_korgan}" alt="Tabernero Balthus" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Juegos de Azar de la Ciudadela</span>
            <h3>Mesa de Dados de Balthus</h3>
            <p class="npc-quote-text">Lanza tres dados rúnicos contra el Tabernero Balthus. Si tu suma supera la suya, duplicas tu apuesta; si logras un Triple Solar, ganas el triple y una reliquia.</p>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn-asteria gold" data-play-dice="150">🎲 Apostar 1p 50c</button>
              <button class="btn-asteria gold" data-play-dice="500">🎲 Apostar 5p 00c</button>
              <button class="btn-asteria crimson" data-play-dice="1500">🎲 Apostar 15p 00c</button>
            </div>
          </div>
        </div>
        <div id="dice-table-output" class="npc-quote-text" style="padding:16px;text-align:center;font-size:16px">
          Tu bolsa actual: ${ART.formatCurrencyBadge(state.hero.copper)} — ¡Elige tu apuesta para lanzar los dados!
        </div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-play-dice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bet = parseInt(btn.getAttribute('data-play-dice'), 10);
        const outcome = actions.playTavernDice(bet);
        const outEl = body.querySelector('#dice-table-output');
        if (outEl) outEl.innerHTML = outcome;
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. CLANS & PVP COLISEUM VS 16 SPANISH AI WARRIORS
     ------------------------------------------------------------------------ */
  function renderArenaAndClansModal(state, actions) {
    const warriorsHtml = ART.AI_WARRIORS.map((w) => {
      const defeated = state.world.pvpDefeated && state.world.pvpDefeated[w.id];
      return `
        <div class="modal-shop-row ${defeated ? 'rarity-border-uncommon' : 'rarity-border-rare'}">
          <div class="shop-item-icon">⚔️</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${w.name} [Nv.${w.level}] ${defeated ? '• ✓ Vencido' : ''}</div>
            <div class="shop-item-stats">Clan: ${w.clan} • ❤️ ${w.hp} HP • ⚔️ ${w.atk} ATQ • 🛡️ ${w.def} DEF</div>
            <div class="shop-item-desc">${w.title} (${w.faction}) • Arma: ${w.weapon}</div>
          </div>
          <div class="shop-item-buy">
            <button class="btn-asteria sm crimson" data-challenge-ai="${w.id}">Retar en Arena</button>
          </div>
        </div>
      `;
    }).join('');

    const clansList = ['Hijos del Alba', 'Dragones de Helion', 'Cónclave Astral', 'Yunque de Fuego', 'Centinelas Verdes'];
    const clanBtns = clansList
      .map(
        (cName) => `
        <button class="btn-asteria sm ${state.hero.clan === cName ? 'gold' : ''}" data-join-clan="${cName}">
          🛡️ ${cName} ${state.hero.clan === cName ? '(Tu Clan)' : ''}
        </button>
      `
      )
      .join(' ');

    const body = openModalShell(
      `<span>⚔️ Coliseo de Arena PvP y Hermandad de Clanes</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.frontera_ceniza}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Coliseo PvP" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Victorias en Arena: ${state.world.pvpWins || 0} • Clan: ${
        state.hero.clan
      }</span>
            <h3>Los 16 Campeones de Asteria</h3>
            <p class="npc-quote-text">Jura lealtad a un Clan para recibir su estandarte y reta en combate táctico direccional a cualquiera de los 16 Guerreros IA en español.</p>
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${clanBtns}</div>
          </div>
        </div>
        <div class="modal-shop-grid">${warriorsHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-join-clan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.joinClan(btn.getAttribute('data-join-clan'));
        renderArenaAndClansModal(state, actions);
      });
    });

    body.querySelectorAll('[data-challenge-ai]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const aiId = btn.getAttribute('data-challenge-ai');
        closeModalShell();
        actions.startPvpCombat(aiId);
      });
    });
  }

  /* ------------------------------------------------------------------------
     10. CAMPAIGN QUESTS MODAL
     ------------------------------------------------------------------------ */
  function renderQuestsModal(state, actions) {
    const questsHtml = ART.QUESTS.map((q) => {
      const prog = actions.getQuestProgress(q);
      const claimed = Boolean(state.quests.claimed[q.id]);
      const ready = prog >= q.targetCount && !claimed;
      const rewardItem = q.rewardItem ? ART.ARTIFACTS[q.rewardItem] : null;

      return `
        <div class="modal-shop-row ${
          claimed ? 'rarity-border-uncommon' : ready ? 'rarity-border-legendary' : ''
        }">
          <div class="shop-item-icon">${claimed ? '✅' : ready ? '🌟' : '📜'}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${q.title} — <small>${q.giver}</small></div>
            <div class="shop-item-desc">${q.desc}</div>
            <div class="shop-item-stats">
              Progreso: ${prog} / ${q.targetCount} • Recompensa: ${ART.formatCurrencyBadge(
        q.rewardCopper
      )} • +${q.rewardXp} XP ${rewardItem ? `• ${rewardItem.icon} ${rewardItem.name}` : ''}
            </div>
          </div>
          <div class="shop-item-buy">
            ${
              ready
                ? `<button class="btn-asteria sm gold" data-claim-quest="${q.id}">Reclamar</button>`
                : claimed
                ? `<span class="entity-badge">Completada</span>`
                : `<span class="entity-badge">Activa</span>`
            }
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>📜 Códice de Misiones — Las Crónicas de la Luz</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Comandante Aurelius" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Campaña Principal e Hitos de Estancia</span>
            <h3>Juramentos de la Orden Solar</h3>
            <p class="npc-quote-text">Completa las siete grandes misiones desde la Ciudadela de la Luz hasta las estancias finales en las Cuevas Cristalinas, el Templo Antiguo y la Frontera de Ceniza.</p>
          </div>
        </div>
        <div class="modal-shop-grid">${questsHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-claim-quest]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.claimQuest(btn.getAttribute('data-claim-quest'));
        renderQuestsModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. SAVE EXPORT / IMPORT & PERSISTENT STORAGE MANAGER
     ------------------------------------------------------------------------ */
  function renderSaveManagerModal(state, actions) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    const body = openModalShell(
      `<span>💾 Motor Persistente Local — Guardar, Exportar o Importar Crónica</span>`,
      `
        <div style="display:flex;flex-direction:column;gap:12px">
          <p class="shop-item-desc">
            Tu progreso se guarda automáticamente en el navegador (<code>localStorage</code>) tras cada acción, funcionando al 100% en GitHub Pages sin requerir servidor externo. Copia tu código o descarga un respaldo JSON:
          </p>
          <textarea id="gdl-save-textarea" rows="5" class="save-code-textarea">${encoded}</textarea>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-asteria gold" id="btn-export-json-file">⬇️ Descargar Partida (.JSON)</button>
            <button class="btn-asteria" id="btn-import-code-box">⬆️ Importar Código Pegado</button>
            <button class="btn-asteria crimson" id="btn-hard-reset-game">⚠️ Reiniciar Partida de Cero</button>
          </div>
        </div>
      `
    );

    if (!body) return;
    body.querySelector('#btn-export-json-file').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guerreros_de_la_luz_${state.hero.name.toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    body.querySelector('#btn-import-code-box').addEventListener('click', () => {
      const raw = body.querySelector('#gdl-save-textarea').value.trim();
      if (actions.importSaveString(raw)) {
        closeModalShell();
      }
    });

    body.querySelector('#btn-hard-reset-game').addEventListener('click', () => {
      actions.resetSave();
      closeModalShell();
    });
  }

  /* ------------------------------------------------------------------------
     12. ENDGAME VICTORY CINEMATIC (MALAKOR DEFEATED IN FRONTERA DE CENIZA)
     ------------------------------------------------------------------------ */
  function renderVictoryCinematicModal(state) {
    openModalShell(
      `<span>☀️ TRIUNFO SUPREMO EN ASTERIA — EL AMANECER ETERNO</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.frontera_ceniza}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Comandante Aurelius" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Estancia Final Suprema Conquistada</span>
            <h3>¡Has Destronado al Emperador Malakor!</h3>
            <p class="npc-quote-text">
              «El anillo del eclipse se rompe sobre la Frontera de Ceniza y la luz dorada de la Ciudadela vuelve a brillar sobre los siete reinos. ${state.hero.name}, Soberano del Clan ${state.hero.clan}, tu leyenda vivirá por toda la eternidad.»
            </p>
          </div>
        </div>
      `
    );
  }

  return {
    openNpcDialog,
    openSpecialModal,
    closeModalShell
  };
})();
