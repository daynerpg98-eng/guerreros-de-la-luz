/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/views/specialModals.js
   Complete Interactive Asteria (https://asteriagame.com/) Modal Suite:
   1. NPC Dialogs & Shops (fixing forge_shop & alchemy_shop)
   2. Eltic Cube (Cubo Éltico)
   3. 9 Professions & Real Crafting Workshop (Taller de Artesanía + Repair/Runes)
   4. Mounts (Ignifer), Red Pets Crystal Socketing & Disciples Academy (Ученики)
   5. 10+ Faction Reputations (Arkona & Katala) & Pantheon of Medals
   6. Magic Mirror of Solaria
   7. Tavern: Solar Dice (3x Triple Solar + Relic) & Arcomage Cards (Катала)
   8. Battlefields (Поля битв: Cuevas Cristalinas, Tallaar, Meseta, Caóticas) & Valor Arsenal
   9. Clans, 5 Clan Talents (Клановые таланты) & PvP Arena vs 16 AI Warriors
   10. Cooldown Instances (Инстансы) & Custom Fast-Farm Grotto (La Gruta / ГРОТ)
   11. Player Estate (Hacienda / Поместье — 6 Buildings, Riolita & Infirmary)
   12. Collectible Card Decks (Колоды карт — 6 Decks & Weekly Resource Bundles)
   13. Fair of Wonders, Online Shop, Wheel of Fortune & Daily Feats
   14. Imperial Bank (Счастливый вклад) & Auction House (Аукцион)
   15. Character Profile (user_info.php / Анкета), Gifts & Promocodes
   16. Library of Faeo (library.php) & Balagur Riddles (Конкурсы Балагуров)
   17. Quests Codex, Save Manager & Endgame Victory Cinematic
   ========================================================================== */

window.GDL_SPECIAL_MODALS = (function () {
  'use strict';

  const ART = window.GDL_ART;

  function openModalShell(titleHtml, bodyHtml) {
    const backdrop = document.getElementById('gdl-modal-backdrop');
    const titleEl = document.getElementById('gdl-modal-title');
    const bodyEl = document.getElementById('gdl-modal-body');
    if (!backdrop || !titleEl || !bodyEl) return null;

    titleEl.innerHTML = `<span class="skeuo-modal-crown-gem"></span> ${titleHtml}`;
    bodyEl.innerHTML = `<div class="skeuo-reliquary-modal-inner">${bodyHtml}</div>`;
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
          : it.runeStats
          ? 'Runa: ' +
            Object.entries(it.runeStats)
              .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
              .join(' • ')
          : it.crystalStats
          ? 'Cristal Mascota: ' +
            Object.entries(it.crystalStats)
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
          medals: { label: '🎖️ Medallas y Reputaciones', modal: 'reputations' },
          reputations: { label: '🎖️ 10+ Reputaciones de Faeo', modal: 'reputations' },
          clans: { label: '🛡️ Clanes y Arena PvP', modal: 'arena' },
          battlefields: { label: '🚩 Campos de Batalla', modal: 'battlefields' },
          instances: { label: '🕳️ La Gruta (ГРОТ) e Instancias', modal: 'instances' },
          professions: { label: '⚒️ 9 Profesiones y Taller', modal: 'professions' },
          forge_shop: { label: '🔧 Taller de Herrería y Runas', modal: 'professions' },
          alchemy_shop: { label: '⚗️ Taller de Alquimia y Sanador', modal: 'professions' },
          cube: { label: '🧊 Abrir Cubo Éltico', modal: 'cube' },
          mirror: { label: '🪞 Espejo Mágico de Solaria', modal: 'mirror' },
          hunting: { label: '🏹 Ir al Modo Caza', view: 'hunting' },
          pets: { label: '🦅 Mascotas Rojas y Academia', modal: 'mounts' },
          mounts: { label: '🔥 Monturas, Ignifer y Discípulos', modal: 'mounts' },
          tavern: { label: '🎲 Dados y Cartas de Taberna', modal: 'tavern' },
          decks: { label: '🃏 Barajas de Cartas', modal: 'decks' },
          fair: { label: '🎡 Feria y Rueda de la Fortuna', modal: 'fair' },
          library: { label: '📚 Biblioteca y Balagures', modal: 'library' }
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
    if (modalType === 'professions' || modalType === 'forge_shop' || modalType === 'alchemy_shop') {
      return renderProfessionsModal(state, actions);
    }
    if (modalType === 'mounts' || modalType === 'pets' || modalType === 'disciples') {
      return renderMountsAndPetsModal(state, actions);
    }
    if (modalType === 'reputations' || modalType === 'medals') {
      return renderReputationsAndMedalsModal(state, actions);
    }
    if (modalType === 'mirror') return renderMagicMirrorModal(state, actions);
    if (modalType === 'tavern') return renderTavernModal(state, actions);
    if (modalType === 'battlefields') return renderBattlefieldsModal(state, actions);
    if (modalType === 'arena' || modalType === 'clans') return renderArenaAndClansModal(state, actions);
    if (modalType === 'instances' || modalType === 'grot') return renderInstancesAndGrottoModal(state, actions);
    if (modalType === 'estate') return renderEstateModal(state, actions);
    if (modalType === 'decks') return renderCardDecksModal(state, actions);
    if (modalType === 'fair' || modalType === 'wheel') return renderFairAndWheelModal(state, actions);
    if (modalType === 'bank' || modalType === 'auction') return renderBankAndAuctionModal(state, actions);
    if (modalType === 'profile') return renderProfileAndPromosModal(state, actions);
    if (modalType === 'library') return renderLibraryAndBalagursModal(state, actions);
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
      `<span>🧊 El Cubo Éltico — Santuario de Síntesis Arcana (Эльтский куб)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.cuevas_cristalinas}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame skeuo-emerald-cube-frame">
            <img src="assets/ui/eltic_cube_3d.jpg" alt="Cubo Éltico 3D" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Artefacto de los Antiguos Arquitectos • Fulgor Esmeralda 3D</span>
            <h3>Transmutación en el Cubo Éltico</h3>
            <p class="npc-quote-text">Combina Fragmentos Élticos, Cristales de Luminita, Runas del Templo Antiguo y Núcleos de Obsidiana para sintetizar Runas de Inevitabilidad, Panaceas y armas míticas.</p>
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
     4. 9 PROFESSIONS & REAL CRAFTING WORKSHOP (service_craft.php)
     ------------------------------------------------------------------------ */
  function renderProfessionsModal(state, actions) {
    const profsHtml = ART.PROFESSIONS.map((pr) => {
      const pData = (state.professions && state.professions[pr.id]) || { level: 1, xp: 0 };
      const pct = Math.min(100, Math.round((pData.xp / (pData.level * 50)) * 100));
      const bonusStr = Object.entries(pr.statBonus || {})
        .map(([k, v]) => `+${v * pData.level} ${k.toUpperCase()}`)
        .join(' • ');

      return `
        <div class="prof-card-box">
          <div class="prof-card-head">
            <span class="prof-icon-lg">${pr.icon}</span>
            <div>
              <h4>${pr.name}</h4>
              <span class="entity-badge">${pr.type} • Nivel ${pData.level}</span>
            </div>
          </div>
          <div class="shop-item-stats">Pasiva Activa: ${bonusStr}</div>
          <p class="shop-item-desc">${pr.desc}</p>
          <div class="asteria-bar-track"><div class="asteria-bar-fill xp" style="width:${pct}%"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px">
            <span>Dominio: ${pData.xp} / ${pData.level * 50} XP</span>
            <button class="btn-asteria sm gold" data-train-prof="${pr.id}">Practicar Oficio (120c)</button>
          </div>
        </div>
      `;
    }).join('');

    const craftRecipesHtml = ART.CRAFT_RECIPES.map((rec) => {
      const resItem = ART.ARTIFACTS[rec.resultId];
      const profObj = ART.PROFESSIONS.find((p) => p.id === rec.prof);
      const userProfLvl = (state.professions && state.professions[rec.prof] && state.professions[rec.prof].level) || 1;
      const lvlOk = userProfLvl >= (rec.minProfLevel || 1);
      const ingsHtml = rec.ingredients
        .map((ing) => {
          const it = ART.ARTIFACTS[ing.itemId];
          const have = actions.getItemQty(ing.itemId);
          const ok = have >= ing.qty;
          return `<span class="ing-pill ${ok ? 'ok' : 'missing'}">${it.icon} ${it.name} (${have}/${ing.qty})</span>`;
        })
        .join(' ');

      return `
        <div class="modal-shop-row rarity-border-${resItem.rarity}">
          <div class="shop-item-icon">${resItem.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${rec.name} <span class="entity-badge">${profObj ? profObj.name : rec.prof} Nv.${rec.minProfLevel || 1}</span></div>
            <div class="shop-item-desc">${resItem.desc}</div>
            <div style="margin-top:4px;display:flex;gap:5px;flex-wrap:wrap">${ingsHtml}</div>
          </div>
          <div class="shop-item-buy">
            <div class="price-tag">${ART.formatCurrencyBadge(rec.copperCost)}</div>
            <button class="btn-asteria sm gold" data-craft-recipe="${rec.id}" ${
        !lvlOk ? 'disabled' : ''
      }>⚒️ Fabricar</button>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>⚒️ Gremio de las 9 Profesiones y Taller de Artesanía (service_craft.php)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.herrero_korgan}" alt="Herrero Korgan" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">3 de Recolección • 3 de Artesanía • 3 Especiales (Sanador, Cerrajero, Verdugo)</span>
            <h3>Las 9 Disciplinas y Taller de Forja, Runas y Reparación</h3>
            <p class="npc-quote-text">Cada nivel en tus 9 profesiones otorga bonificaciones pasivas permanentes a tus atributos de combate. Usa el Taller inferior para fabricar armas, elixires, runas, pergaminos de sanador y ganzúas de cerrajero.</p>
            <div class="npc-shortcuts-bar">
              <button class="btn-asteria sm gold" id="btn-modal-repair-all">🔧 Reparar las 12 Piezas de Equipo</button>
              <button class="btn-asteria sm" id="btn-modal-cure-injury">🩹 Curar Herida (Sanador)</button>
            </div>
          </div>
        </div>

        <div class="modal-section-header">
          <span>📜 Tus 9 Profesiones (Con Bonificaciones Pasivas Permanentes)</span>
          <span>Bolsa: ${ART.formatCurrencyBadge(state.hero.copper)}</span>
        </div>
        <div class="prof-grid-2col">
          ${profsHtml}
        </div>

        <div class="modal-section-header" style="margin-top:8px">
          <span>🔥 Taller de Artesanía — Recetas de Herrería, Alquimia, Joyería, Sanador y Cerrajero</span>
          <span>${ART.CRAFT_RECIPES.length} Recetas</span>
        </div>
        <div class="modal-shop-grid">
          ${craftRecipesHtml}
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

    body.querySelectorAll('[data-craft-recipe]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.craftRecipe(btn.getAttribute('data-craft-recipe'));
        renderProfessionsModal(state, actions);
      });
    });

    const repBtn = body.querySelector('#btn-modal-repair-all');
    if (repBtn) {
      repBtn.addEventListener('click', () => {
        actions.repairAllEquipment();
        renderProfessionsModal(state, actions);
      });
    }

    const cureBtn = body.querySelector('#btn-modal-cure-injury');
    if (cureBtn) {
      cureBtn.addEventListener('click', () => {
        actions.cureInjury();
        renderProfessionsModal(state, actions);
      });
    }
  }

  /* ------------------------------------------------------------------------
     5. MOUNTS (IGNIFER), RED PETS CRYSTAL SOCKETING & DISCIPLES ACADEMY
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
            <div class="shop-item-stats">${statsStr} • Invocación Morok: ${m.summonHp} HP / +${m.summonDmg} Daño</div>
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

    const satiety = (state.pets && state.pets.satiety) || 0;
    const petsHtml = ART.PETS.map((p) => {
      const owned = state.pets.owned.includes(p.id);
      const isActive = state.pets.active === p.id;
      const socketedCrystalId = state.pets && state.pets.crystals && state.pets.crystals[p.id];
      const crystalObj = ART.PET_CRYSTALS.find((c) => c.id === socketedCrystalId);

      return `
        <div class="modal-shop-row rarity-border-${p.rarity}">
          <div class="shop-item-icon">${p.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${p.name} ${isActive ? '• [ACTIVA]' : ''}</div>
            <div class="shop-item-stats">+${p.bonusAtk} ATQ • +${p.bonusCrit}% CRÍT • Daño Asistencia: ${p.assistDmg} ${
        crystalObj ? `• Cristal: ${crystalObj.icon} ${crystalObj.name} (+${crystalObj.assistDmg} Daño)` : ''
      }</div>
            <div class="shop-item-desc">${p.desc}</div>
          </div>
          <div class="shop-item-buy">
            ${
              owned
                ? `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
                    <button class="btn-asteria sm ${isActive ? 'crimson' : 'gold'}" data-toggle-pet="${p.id}">${
                    isActive ? 'Descansar' : 'Invocar'
                  }</button>
                    <button class="btn-asteria sm gold" data-socket-pet="${p.id}" title="Engastar Cristal del Viejo Ogro / Carmesí / Celeste">🟢 Engastar Cristal</button>
                  </div>`
                : `<div class="price-tag">${ART.formatCurrencyBadge(p.price)}</div>
                   <button class="btn-asteria sm gold" data-buy-pet="${p.id}">Adoptar</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    const disciplesHtml = ART.DISCIPLES.map((d) => {
      const lvl = (state.disciples && state.disciples.levels && state.disciples.levels[d.id]) || 0;
      const isAct = state.disciples && state.disciples.active === d.id;
      const statsStr = Object.entries(d.baseStats)
        .map(([k, v]) => `+${v * Math.max(1, lvl)} ${k.toUpperCase()}`)
        .join(' • ');

      return `
        <div class="modal-shop-row ${isAct ? 'rarity-border-legendary' : 'rarity-border-rare'}">
          <div class="shop-item-icon">${d.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${d.name} ${lvl > 0 ? `[Nivel ${lvl}]` : '[Sin Reclutar]'} ${
        isAct ? '• ★ EN GUARDIA' : ''
      }</div>
            <div class="shop-item-stats">${d.role} • ${statsStr} • Golpe por Turno: +${
        d.combatDmg + Math.max(0, lvl - 1) * 8
      }</div>
            <div class="shop-item-desc">${d.desc}</div>
          </div>
          <div class="shop-item-buy">
            <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
              <button class="btn-asteria sm gold" data-train-disciple="${d.id}">
                🎓 ${lvl === 0 ? `Reclutar (${d.recruitCost}c)` : `Entrenar (${d.recruitCost}c)`}
              </button>
              ${
                lvl > 0
                  ? `<button class="btn-asteria sm ${isAct ? 'crimson' : ''}" data-activate-disciple="${d.id}">${
                      isAct ? 'En Guardia' : 'Asignar'
                    }</button>`
                  : ''
              }
            </div>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🔥 Academia de Discípulos (Ученики), Ignifer y Mascotas Rojas (Красные питомцы)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.llanuras_alba}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.explorador_lyon}" alt="Explorador Lyon" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Compañeros de Combate de Asteria</span>
            <h3>Academia de Discípulos, Mascotas Rojas con Cristales y Corcel Ignifer</h3>
            <p class="npc-quote-text">Entrena Discípulos (Guerrero, Mago, Asesino) en la Academia, alimenta y engasta Cristales del Viejo Ogro en tus Mascotas Rojas, y monta a Ignifer para invocarlo en mitad del combate.</p>
            <div class="npc-shortcuts-bar">
              <button class="btn-asteria sm gold" id="btn-feed-red-pets">🍖 Alimentar Mascotas Rojas (+5 Raciones • Saciada: ${satiety})</button>
            </div>
          </div>
        </div>

        <div class="modal-section-header">
          <span>🎓 Academia de Discípulos (Академия Учеников — Asistencia en Combate)</span>
          <span>Bolsa: ${ART.formatCurrencyBadge(state.hero.copper)}</span>
        </div>
        <div class="modal-shop-grid">${disciplesHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>🦅 Mascotas Rojas (Красные питомцы) y Engaste de Cristales</span>
          <span>Raciones de Pienso Activas: ${satiety}</span>
        </div>
        <div class="modal-shop-grid">${petsHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>🐎 Monturas Reales y Corcel Mítico Ignifer (Invocables como Morok)</span>
        </div>
        <div class="modal-shop-grid">${mountsHtml}</div>
      `
    );

    if (!body) return;
    const feedBtn = body.querySelector('#btn-feed-red-pets');
    if (feedBtn) {
      feedBtn.addEventListener('click', () => {
        actions.feedPet();
        renderMountsAndPetsModal(state, actions);
      });
    }

    body.querySelectorAll('[data-train-disciple]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.recruitOrTrainDisciple(btn.getAttribute('data-train-disciple'));
        renderMountsAndPetsModal(state, actions);
      });
    });

    body.querySelectorAll('[data-activate-disciple]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.setActiveDisciple(btn.getAttribute('data-activate-disciple'));
        renderMountsAndPetsModal(state, actions);
      });
    });

    body.querySelectorAll('[data-buy-mount],[data-toggle-mount]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-buy-mount') || btn.getAttribute('data-toggle-mount');
        actions.buyOrEquipMount(id);
        renderMountsAndPetsModal(state, actions);
      });
    });

    body.querySelectorAll('[data-buy-pet],[data-toggle-pet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-buy-pet') || btn.getAttribute('data-toggle-pet');
        actions.buyOrEquipPet(id);
        renderMountsAndPetsModal(state, actions);
      });
    });

    body.querySelectorAll('[data-socket-pet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.socketPetCrystal(btn.getAttribute('data-socket-pet'));
        renderMountsAndPetsModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. 10+ FACTION REPUTATIONS (ARKONA & KATALA) & PANTHEON OF MEDALS
     ------------------------------------------------------------------------ */
  function renderReputationsAndMedalsModal(state, actions) {
    const repsHtml = ART.REPUTATIONS.map((rep) => {
      const pts = (state.reputations && state.reputations[rep.id]) || 0;
      const pct = Math.min(100, Math.round((pts / rep.max) * 100));
      const tier =
        pts >= 3000
          ? '👑 Medalla de Culto (3000)'
          : pts >= 2000
          ? '🥇 Medalla de Oro (2000)'
          : pts >= 1000
          ? '🥈 Medalla de Plata (1000)'
          : pts >= 500
          ? '🥉 Medalla de Bronce (500)'
          : 'Iniciado';
      const itemObj = ART.ARTIFACTS[rep.turnInItem];
      const haveQty = itemObj ? actions.getItemQty(itemObj.id) : 0;

      return `
        <div class="modal-shop-row ${pts >= 2000 ? 'rarity-border-legendary' : pts >= 500 ? 'rarity-border-rare' : ''}">
          <div class="shop-item-icon">${rep.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${rep.name} <span class="entity-badge">${tier}</span></div>
            <div class="shop-item-desc">${rep.desc}</div>
            <div class="asteria-bar-track" style="margin:5px 0"><div class="asteria-bar-fill xp" style="width:${pct}%"></div></div>
            <div class="shop-item-stats">Progreso: ${pts} / ${rep.max} pts • Ofrenda: ${
        itemObj ? `${itemObj.icon} ${itemObj.name} (Tienes: ${haveQty})` : 'Monedas'
      }</div>
          </div>
          <div class="shop-item-buy">
            <button class="btn-asteria sm gold" data-donate-rep="${rep.id}">✨ Ofrendar (+150 pts)</button>
          </div>
        </div>
      `;
    }).join('');

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

    const body = openModalShell(
      `<span>🎖️ 10 Reputaciones de Faeo (Репутации), Influencia de Arkona, Tahúr (Катала) y Medallas</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.templo_antiguo}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Comandante Aurelius" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Medallas de Bronce (500) • Plata (1000) • Oro (2000) • Culto (3000)</span>
            <h3>Matriz de Reputaciones y Panteón de Medallas de Asteria</h3>
            <p class="npc-quote-text">Cada umbral alcanzado (500 / 1000 / 2000 / 3000 puntos) desbloquea bonificaciones pasivas permanentes para tu héroe. Entrega Chispas Celestiales, reliquias o juega en la Taberna para subir tu Reputación de Tahúr (Катала).</p>
          </div>
        </div>

        <div class="modal-section-header">
          <span>🏛️ Las 10 Reputaciones de Faeo (0 — 3000 Puntos)</span>
          <span>Chispas Celestiales: ${actions.getItemQty('chispa_celestial')}</span>
        </div>
        <div class="modal-shop-grid">${repsHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>🎖️ Panteón de Medallas de Honor</span>
        </div>
        <div class="modal-shop-grid">${medalsHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-donate-rep]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.donateReputation(btn.getAttribute('data-donate-rep'));
        renderReputationsAndMedalsModal(state, actions);
      });
    });
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
     8. TAVERN: SOLAR DICE (3X TRIPLE SOLAR + RELIC) & ARCOMAGE CARDS (КАТАЛА)
     ------------------------------------------------------------------------ */
  function renderTavernModal(state, actions) {
    const katalaPts = (state.reputations && state.reputations.katala_tahur) || 0;
    const body = openModalShell(
      `<span>🎲 Taberna del Grifo Dorado — Dados Solares, Cartas Arcomage y Reputación de Tahúr (Катала)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.herrero_korgan}" alt="Tabernero Balthus" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Reputación de Tahúr (Катала): ${katalaPts} / 3000 pts</span>
            <h3>Mesa de Dados y Duelo de Cartas Arcomage de Balthus</h3>
            <p class="npc-quote-text">Cada partida jugada incrementa tu <strong>Reputación de Tahúr (Репутация Каталы)</strong> en +25 pts. En los Dados, si logras un <strong>Triple Solar</strong>, ganas el <strong>triple (3x)</strong> de tu apuesta y una <strong>Reliquia (Fragmento Éltico / Chispa Celestial)</strong>.</p>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn-asteria gold" data-play-dice="150">🎲 Dados 1p 50c</button>
              <button class="btn-asteria gold" data-play-dice="500">🎲 Dados 5p 00c</button>
              <button class="btn-asteria crimson" data-play-dice="1500">🎲 Dados 15p 00c</button>
              <button class="btn-asteria gold" data-play-cards="200">🃏 Cartas Arcomage (2p 00c)</button>
              <button class="btn-asteria crimson" data-play-cards="600">🃏 Cartas Arcomage Élite (6p 00c)</button>
            </div>
          </div>
        </div>
        <div id="dice-table-output" class="npc-quote-text" style="padding:16px;text-align:center;font-size:15px">
          Tu bolsa actual: ${ART.formatCurrencyBadge(state.hero.copper)} • Reputación Tahúr (Катала): <strong>${katalaPts} pts</strong> — ¡Elige Dados o Cartas Arcomage!
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

    body.querySelectorAll('[data-play-cards]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bet = parseInt(btn.getAttribute('data-play-cards'), 10);
        const outcome = actions.playTavernCards(bet);
        const outEl = body.querySelector('#dice-table-output');
        if (outEl) outEl.innerHTML = outcome;
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. BATTLEFIELDS (ПОЛЯ БИТВ) & VALOR ARSENAL
     ------------------------------------------------------------------------ */
  function renderBattlefieldsModal(state, actions) {
    const vInfo = ART.getValorRank(state.hero.valor || 0);
    const bfsHtml = ART.BATTLEFIELDS.map((bf) => {
      return `
        <div class="modal-shop-row rarity-border-epic">
          <div class="shop-item-icon">${bf.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${bf.name} <span class="entity-badge">${bf.mode}</span></div>
            <div class="shop-item-stats">Recompensa: +${bf.valorReward} Valor (Доблесть) • +${bf.trophyReward} 🏅 Monedas Trofeo • +${ART.formatCurrencyBadge(
        bf.copperReward
      )}</div>
            <div class="shop-item-desc">${bf.desc}</div>
          </div>
          <div class="shop-item-buy">
            <button class="btn-asteria sm crimson" data-play-battlefield="${bf.id}">🚩 Combatir</button>
          </div>
        </div>
      `;
    }).join('');

    const arsenalHtml = ART.VALOR_ARSENAL.map((entry) => {
      const it = ART.ARTIFACTS[entry.itemId];
      if (!it) return '';
      const canBuy =
        (state.hero.trophyCoins || 0) >= entry.trophyCost &&
        (state.hero.valor || 0) >= entry.minValor;
      return `
        <div class="modal-shop-row rarity-border-${it.rarity}">
          <div class="shop-item-icon">${it.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${it.name}</div>
            <div class="shop-item-stats">Requiere: ${entry.minValor} Valor • Coste: 🏅 ${entry.trophyCost} Monedas Trofeo</div>
            <div class="shop-item-desc">${it.desc}</div>
          </div>
          <div class="shop-item-buy">
            <button class="btn-asteria sm gold" data-buy-valor-item="${entry.itemId}" ${
        !canBuy ? 'disabled' : ''
      }>🏅 Canjear</button>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🚩 Campos de Batalla de Faeo (Поля битв) y Arsenal de Valor (Доблесть)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.cuevas_cristalinas}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Campos de Batalla" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Rango Militar: ${vInfo.title} • Valor: ${vInfo.valor} • 🏅 Trofeos: ${
        state.hero.trophyCoins || 0
      }</span>
            <h3>Cuevas Cristalinas, Tallaar, Batallas Caóticas y Meseta Antigua</h3>
            <p class="npc-quote-text">Participa en los 6 Campos de Batalla de Asteria: entrega cristales Rojos y Azules en las Cuevas Cristalinas, sobrevive en los Salones de Tallaar o lucha por tu facción (${
              state.hero.faction === 'khair' ? 'Magmares de Khair' : 'Humanos de Ogriy'
            }) en la Meseta Antigua.</p>
          </div>
        </div>

        <div id="bf-action-result" class="npc-quote-text" style="display:none;padding:10px;text-align:center"></div>

        <div class="modal-section-header">
          <span>⚔️ 6 Campos de Batalla Activos (Поля битв)</span>
          <span>Victorias en Campos: ${(state.world && state.world.battlefieldWins) || 0}</span>
        </div>
        <div class="modal-shop-grid">${bfsHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>🏅 Arsenal de Gladiadores y Campeones de Valor</span>
          <span>Tus Monedas Trofeo: 🏅 ${state.hero.trophyCoins || 0}</span>
        </div>
        <div class="modal-shop-grid">${arsenalHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-play-battlefield]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msg = actions.playBattlefield(btn.getAttribute('data-play-battlefield'));
        renderBattlefieldsModal(state, actions);
        const resEl = document.getElementById('bf-action-result');
        if (resEl && msg) {
          resEl.style.display = 'block';
          resEl.innerHTML = `<strong style="color:var(--gold-bright)">${msg}</strong>`;
        }
      });
    });

    body.querySelectorAll('[data-buy-valor-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyValorItem(btn.getAttribute('data-buy-valor-item'));
        renderBattlefieldsModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     10. CLANS, 5 CLAN TALENTS (КЛАНОВЫЕ ТАЛАНТЫ), BATTLEFIELDS & PVP COLISEUM
     ------------------------------------------------------------------------ */
  function renderArenaAndClansModal(state, actions) {
    const bfsCompactHtml = ART.BATTLEFIELDS.map(
      (bf) => `
      <div class="modal-shop-row rarity-border-epic">
        <div class="shop-item-icon">${bf.icon}</div>
        <div class="shop-item-info">
          <div class="shop-item-title">${bf.name} <span class="entity-badge">${bf.mode}</span></div>
          <div class="shop-item-stats">+${bf.valorReward} Valor (Доблесть) • +${bf.trophyReward} 🏅 Monedas Trofeo • +${ART.formatCurrencyBadge(
        bf.copperReward
      )}</div>
        </div>
        <div class="shop-item-buy">
          <button class="btn-asteria sm crimson" data-play-battlefield="${bf.id}">🚩 Combatir</button>
        </div>
      </div>
    `
    ).join('');

    const talentsHtml = ART.CLAN_TALENTS.map((t) => {
      const lvl = (state.clanTalents && state.clanTalents[t.id]) || 0;
      const statsStr = Object.entries(t.statsPerLevel)
        .map(([k, v]) => `+${v * Math.max(1, lvl)} ${k.toUpperCase()}`)
        .join(' • ');

      return `
        <div class="modal-shop-row ${lvl > 0 ? 'rarity-border-legendary' : 'rarity-border-rare'}">
          <div class="shop-item-icon">${t.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${t.name} [Nivel ${lvl}/${t.maxLevel}]</div>
            <div class="shop-item-stats">Bonificación de Clan: ${statsStr}</div>
            <div class="shop-item-desc">${t.desc}</div>
          </div>
          <div class="shop-item-buy">
            <button class="btn-asteria sm gold" data-upgrade-clan-talent="${t.id}" ${
        lvl >= t.maxLevel ? 'disabled' : ''
      }>
              📘 ${lvl >= t.maxLevel ? 'Máximo' : `Mejorar (${t.costCopper}c / Tratado)`}
            </button>
          </div>
        </div>
      `;
    }).join('');

    const warriorsHtml = ART.AI_WARRIORS.map((w) => {
      const defeated = state.world.pvpDefeated && state.world.pvpDefeated[w.id];
      return `
        <div class="modal-shop-row ${defeated ? 'rarity-border-uncommon' : 'rarity-border-rare'}">
          <div class="shop-item-icon">${w.faction === 'khair' ? '🌋' : '☀️'}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${w.name} [Nv.${w.level}] ${defeated ? '• ✓ Vencido' : ''}</div>
            <div class="shop-item-stats">Clan: ${w.clan} • ❤️ ${w.hp} HP • ⚔️ ${w.atk} ATQ • 🛡️ ${w.def} DEF</div>
            <div class="shop-item-desc">${w.title} (${w.factionName}) • Arma: ${w.weapon}</div>
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
      `<span>⚔️ Hermandad de Clanes, Campos de Batalla, Talentos del Clan y Coliseo PvP</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.frontera_ceniza}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Coliseo PvP" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Victorias en Arena: ${state.world.pvpWins || 0} • Clan: ${
        state.hero.clan
      } • Tratados: ${actions.getItemQty('tratado_unidad_clan')}</span>
            <h3>Campos de Batalla (Cuevas Cristalinas, Tallaar, Caóticas, Meseta), Talentos del Clan y Arena</h3>
            <p class="npc-quote-text">Mejora los 5 Talentos del Clan utilizando Tratados «Unidad del Clan», participa en los Campos de Batalla y reta a los 16 Guerreros IA.</p>
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${clanBtns}</div>
          </div>
        </div>

        <div class="modal-section-header">
          <span>🚩 Campos de Batalla de Faeo (Cuevas Cristalinas, Salones de Tallaar, Batallas Caóticas y Meseta Antigua)</span>
        </div>
        <div class="modal-shop-grid">${bfsCompactHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>📘 Talentos del Clan (Клановые таланты — Bonificaciones Pasivas)</span>
          <span>Tratados «Unidad del Clan»: ${actions.getItemQty('tratado_unidad_clan')}</span>
        </div>
        <div class="modal-shop-grid">${talentsHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>🏟️ Los 16 Guerreros IA del Coliseo PvP</span>
        </div>
        <div class="modal-shop-grid">${warriorsHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-play-battlefield]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.playBattlefield(btn.getAttribute('data-play-battlefield'));
        renderArenaAndClansModal(state, actions);
      });
    });

    body.querySelectorAll('[data-join-clan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.joinClan(btn.getAttribute('data-join-clan'));
        renderArenaAndClansModal(state, actions);
      });
    });

    body.querySelectorAll('[data-upgrade-clan-talent]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.upgradeClanTalent(btn.getAttribute('data-upgrade-clan-talent'));
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
     11. COOLDOWN INSTANCES (ИНСТАНСЫ) & FAST-FARM GROTTO (LA GRUTA / ГРОТ)
     ------------------------------------------------------------------------ */
  function renderInstancesAndGrottoModal(state, actions) {
    const now = Date.now();
    const instancesHtml = ART.INSTANCES.map((inst) => {
      const cdUntil =
        (state.instances && state.instances.cooldowns && state.instances.cooldowns[inst.id]) ||
        (state.world.instanceCooldowns && state.world.instanceCooldowns[inst.id]) ||
        0;
      const remSec = Math.max(0, Math.ceil((cdUntil - now) / 1000));
      const clears =
        (state.instances && state.instances.clearsById && state.instances.clearsById[inst.id]) ||
        (state.world.instanceClears && state.world.instanceClears[inst.id]) ||
        0;
      const dropsStr = inst.drops
        .map((id) => (ART.ARTIFACTS[id] ? `${ART.ARTIFACTS[id].icon} ${ART.ARTIFACTS[id].name}` : id))
        .join(' • ');

      return `
        <div class="modal-shop-row ${inst.isFastFarm ? 'rarity-border-legendary' : 'rarity-border-epic'}">
          <div class="shop-item-icon">${inst.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${inst.name} <span class="entity-badge">${inst.waves} Oleadas • Completada: ${clears}x</span></div>
            <div class="shop-item-stats">Recompensa: 💎 +${inst.diamondReward} Diamantes • +${ART.formatCurrencyBadge(
        inst.copperReward
      )} • +${inst.xpReward} XP</div>
            <div class="shop-item-desc">${inst.desc}<br/>🎁 Botín: ${dropsStr}</div>
          </div>
          <div class="shop-item-buy">
            ${
              remSec > 0
                ? `<span class="entity-badge crimson">⏳ Enfriamiento: ${remSec}s</span>
                   <button class="btn-asteria sm" data-reset-instance="${inst.id}">🔄 Reiniciar (100c)</button>`
                : `<button class="btn-asteria sm ${inst.isFastFarm ? 'gold' : 'crimson'}" data-run-instance="${inst.id}">
                    ⚔️ Incursionar
                   </button>`
            }
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🕳️ La Gruta (ГРОТ — Fast-Farm) e Instancias con Temporizador (Инстансы)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.cuevas_cristalinas}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.arcanista_orian || ART.NPC_IMAGES.alquimista_selene}" alt="La Gruta" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">💎 Diamantes: ${state.hero.diamonds || 0} • 💠 Piedras de Transformación: ${actions.getItemQty(
        'piedra_transformacion'
      )}</span>
            <h3>Incursiones PvE y La Gruta (ГРОТ) de Asteria</h3>
            <p class="npc-quote-text">Supera las oleadas de jefes en las 6 mazmorras de Faeo. <strong>La Gruta (ГРОТ)</strong> es la instancia especial de farmeo rápido de Asteria donde obtienes Piedras de Transformación, Riolita, Cofres de Mitril y 50 Diamantes.</p>
          </div>
        </div>
        <div id="instance-run-banner" class="npc-quote-text" style="display:none;padding:10px;text-align:center"></div>
        <div class="modal-shop-grid">${instancesHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-run-instance]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msg = actions.runInstance(btn.getAttribute('data-run-instance'));
        renderInstancesAndGrottoModal(state, actions);
        const bEl = document.getElementById('instance-run-banner');
        if (bEl && msg) {
          bEl.style.display = 'block';
          bEl.innerHTML = `<strong style="color:var(--gold-bright)">${msg}</strong>`;
        }
      });
    });

    body.querySelectorAll('[data-reset-instance]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.resetInstanceCooldown(btn.getAttribute('data-reset-instance'));
        renderInstancesAndGrottoModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     12. PLAYER ESTATE (ПОМЕСТЬЕ / HACIENDA — 6 BUILDINGS, RIOLITA & INFIRMARY)
     ------------------------------------------------------------------------ */
  function renderEstateModal(state, actions) {
    const riolitaQty = actions.getItemQty('riolita');
    const bMap = (state.estate && state.estate.buildings) || state.estate || {};
    const buildingsHtml = ART.ESTATE_BUILDINGS.map((b) => {
      const lvl = bMap[b.id] || 1;
      const costCopper = b.baseCopper * lvl;
      const statsStr = Object.entries(b.statsPerLevel)
        .map(([k, v]) => `+${v * lvl} ${k.toUpperCase()}`)
        .join(' • ');

      return `
        <div class="modal-shop-row ${lvl >= 3 ? 'rarity-border-legendary' : 'rarity-border-rare'}">
          <div class="shop-item-icon">${b.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${b.name} [Nivel ${lvl}/${b.maxLevel}]</div>
            <div class="shop-item-stats">Bonificación Activa: ${statsStr}</div>
            <div class="shop-item-desc">${b.desc}</div>
          </div>
          <div class="shop-item-buy">
            ${
              lvl >= b.maxLevel
                ? `<span class="entity-badge gold">★ Nivel Máximo</span>`
                : `<div class="price-tag">${ART.formatCurrencyBadge(costCopper)} o 1x Riolita</div>
                   <button class="btn-asteria sm gold" data-upgrade-estate="${b.id}">🏛️ Mejorar</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🏛️ Hacienda Personal (Поместье) — Bastión Solar y Enfermería</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Hacienda" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">🪨 Bloques de Riolita: ${riolitaQty} • Bolsa: ${ART.formatCurrencyBadge(
        state.hero.copper
      )}</span>
            <h3>Gestión de tu Hacienda Imperial (Поместье)</h3>
            <p class="npc-quote-text">Mejora los 6 edificios de tu Hacienda con Riolita y Oro para aumentar permanentemente tu Salud, Ataque, Defensa, Maná y ganancia de Valor. La Enfermería Solar cura cualquier Herida de Guerra al instante.</p>
            <div class="npc-shortcuts-bar">
              <button class="btn-asteria sm gold" id="btn-estate-collect">🪙 Recoger Tributo Diario de Hacienda</button>
              <button class="btn-asteria sm crimson" id="btn-estate-cure">🩹 Enfermería Solar: Curar Heridas y Salud 100%</button>
            </div>
          </div>
        </div>
        <div class="modal-shop-grid">${buildingsHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-upgrade-estate]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.upgradeEstateBuilding(btn.getAttribute('data-upgrade-estate'));
        renderEstateModal(state, actions);
      });
    });

    const colBtn = body.querySelector('#btn-estate-collect');
    if (colBtn) {
      colBtn.addEventListener('click', () => {
        actions.collectEstateTribute();
        renderEstateModal(state, actions);
      });
    }

    const cureBtn = body.querySelector('#btn-estate-cure');
    if (cureBtn) {
      cureBtn.addEventListener('click', () => {
        actions.cureInjury();
        renderEstateModal(state, actions);
      });
    }
  }

  /* ------------------------------------------------------------------------
     13. COLLECTIBLE CARD DECKS (КОЛОДЫ КАРТ — 6 DECKS & WEEKLY BUNDLES)
     ------------------------------------------------------------------------ */
  function renderCardDecksModal(state, actions) {
    const decksHtml = ART.CARD_DECKS.map((dk) => {
      const dState = (state.decks && state.decks[dk.id]) || { cards: 1, claims: 0 };
      const isComplete = dState.cards >= dk.totalCards;
      const statsStr = Object.entries(dk.bonusStats || {})
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
        .join(' • ');

      return `
        <div class="modal-shop-row ${isComplete ? 'rarity-border-legendary' : 'rarity-border-rare'}">
          <div class="shop-item-icon">${dk.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${dk.name} <span class="entity-badge">Cartas: ${dState.cards}/${dk.totalCards} • Activada: ${dState.claims || 0}x</span></div>
            <div class="shop-item-stats">Pasiva al Completar: ${statsStr}</div>
            <div class="shop-item-desc">Recompensa de Activación: ${dk.rewardDesc}</div>
          </div>
          <div class="shop-item-buy">
            <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">
              ${
                !isComplete
                  ? `<button class="btn-asteria sm" data-collect-card="${dk.id}">🃏 Obtener Carta (120c)</button>`
                  : ''
              }
              <button class="btn-asteria sm gold" data-activate-deck="${dk.id}">✨ Activar Baraja</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🃏 Barajas de Cartas Coleccionables de Asteria (Колоды карт)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.bosque_ecos}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.alquimista_selene}" alt="Barajas" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Baraja de Recursos • Mecenas II • Clanes de Asteria • Dragones • Sheara</span>
            <h3>Las Seis Barajas Estratégicas (Шесть колод)</h3>
            <p class="npc-quote-text">Colecciona las cartas de cada baraja y actívalas para recibir al instante el paquete semanal de 3x recursos raros de cada tipo (Baraja de Recursos), Diamantes, Tratados del Clan y bendiciones permanentes.</p>
          </div>
        </div>
        <div class="modal-shop-grid">${decksHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-collect-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.collectDeckCard(btn.getAttribute('data-collect-card'));
        renderCardDecksModal(state, actions);
      });
    });

    body.querySelectorAll('[data-activate-deck]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.activateCardDeck(btn.getAttribute('data-activate-deck'));
        renderCardDecksModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     14. FAIR OF WONDERS, ONLINE SHOP, WHEEL OF FORTUNE & DAILY FEATS
     ------------------------------------------------------------------------ */
  function renderFairAndWheelModal(state, actions) {
    const h = state.hero;
    const featsHtml = ART.DAILY_FEATS.map((ft) => {
      const done = ft.check(state);
      const claimed = state.world.claimedFeats && state.world.claimedFeats[ft.id];
      return `
        <div class="modal-shop-row ${claimed ? 'rarity-border-uncommon' : done ? 'rarity-border-legendary' : ''}">
          <div class="shop-item-icon">${claimed ? '✅' : '🌟'}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${ft.title}</div>
            <div class="shop-item-desc">${ft.desc}</div>
            <div class="shop-item-stats">Recompensa: +${ART.formatCurrencyBadge(ft.rewardCopper)} • 💎 +${
        ft.rewardDiamonds
      } • ⏳ +${ft.rewardOnlineTokens} Fichas Online</div>
          </div>
          <div class="shop-item-buy">
            <button class="btn-asteria sm gold" data-claim-feat="${ft.id}" ${
        claimed ? 'disabled' : ''
      }>${claimed ? 'Reclamada' : 'Reclamar Hazaña'}</button>
          </div>
        </div>
      `;
    }).join('');

    const fairHtml = ART.FAIR_ITEMS.map((fi) => {
      const it = ART.ARTIFACTS[fi.itemId];
      if (!it) return '';
      const currIcon =
        fi.currency === 'diamonds' ? '💎' : fi.currency === 'rubies' ? '♦️' : '⏳';
      const currName =
        fi.currency === 'diamonds'
          ? 'Diamantes'
          : fi.currency === 'rubies'
          ? 'Rubíes'
          : 'Fichas Online';

      return `
        <div class="modal-shop-row rarity-border-${it.rarity}">
          <div class="shop-item-icon">${it.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${it.name} <span class="entity-badge">${fi.badge}</span></div>
            <div class="shop-item-desc">${it.desc}</div>
          </div>
          <div class="shop-item-buy">
            <div class="price-tag">${currIcon} ${fi.cost} ${currName}</div>
            <button class="btn-asteria sm gold" data-buy-fair-item="${fi.id}">Adquirir</button>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🎡 Feria de las Maravillas (Ярмарка), Rueda de la Fortuna (Колесо фортуны) y Hazañas Diarias</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.lago_espejo}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.alquimista_selene}" alt="Feria y Rueda" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">💎 Diamantes: ${h.diamonds || 0} • ♦️ Rubíes: ${
        h.rubies || 0
      } • ⏳ Fichas Online: ${h.onlineTokens || 0}</span>
            <h3>Rueda de la Fortuna, Tienda por Tiempo Online y Hazañas Diarias</h3>
            <p class="npc-quote-text">Gira la Rueda de la Fortuna para ganar Diamantes, Rubíes, Cofres de Mitril o Runas Legendarias. Completa tu Pequeña Hazaña Cada Día (Маленький подвиг каждый день) y canjea tus Fichas Online.</p>
            <div class="npc-shortcuts-bar">
              <button class="btn-asteria gold" id="btn-spin-wheel">🎡 Girar Rueda de la Fortuna (200c o 1 Ficha)</button>
            </div>
          </div>
        </div>

        <div id="wheel-spin-result" class="npc-quote-text" style="padding:12px;text-align:center">
          ¡Pulsa «Girar Rueda de la Fortuna» para probar tu suerte imperial!
        </div>

        <div class="modal-section-header">
          <span>🌟 Pequeña Hazaña Cada Día (Маленький подвиг каждый день)</span>
        </div>
        <div class="modal-shop-grid">${featsHtml}</div>

        <div class="modal-section-header" style="margin-top:10px">
          <span>🎪 Feria de las Maravillas y Tienda por Tiempo Online (Товары за онлайн)</span>
        </div>
        <div class="modal-shop-grid">${fairHtml}</div>
      `
    );

    if (!body) return;
    const spinBtn = body.querySelector('#btn-spin-wheel');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        const msg = actions.spinWheelOfFortune();
        renderFairAndWheelModal(state, actions);
        const resEl = document.getElementById('wheel-spin-result');
        if (resEl) resEl.innerHTML = `<strong style="color:var(--gold-bright)">${msg}</strong>`;
      });
    }

    body.querySelectorAll('[data-claim-feat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.claimDailyFeat(btn.getAttribute('data-claim-feat'));
        renderFairAndWheelModal(state, actions);
      });
    });

    body.querySelectorAll('[data-buy-fair-item]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyFairItem(btn.getAttribute('data-buy-fair-item'));
        renderFairAndWheelModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     15. IMPERIAL BANK (СЧАСТЛИВЫЙ ВКЛАД) & AUCTION HOUSE (АУКЦИОН)
     ------------------------------------------------------------------------ */
  function renderBankAndAuctionModal(state, actions) {
    const bankDep = (state.bank && state.bank.depositedCopper) || 0;
    const auctionHtml = ART.AUCTION_LISTINGS.map((lst) => {
      const it = ART.ARTIFACTS[lst.itemId];
      if (!it) return '';
      const bought = state.world.boughtAuctions && state.world.boughtAuctions[lst.id];
      return `
        <div class="modal-shop-row rarity-border-${it.rarity}">
          <div class="shop-item-icon">${it.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${it.name} (x${lst.qty}) — <small>Vendedor: ${lst.seller}</small></div>
            <div class="shop-item-desc">${it.desc}</div>
          </div>
          <div class="shop-item-buy">
            <div class="price-tag">${ART.formatCurrencyBadge(lst.priceCopper)}</div>
            <button class="btn-asteria sm gold" data-buy-auction="${lst.id}" ${
        bought ? 'disabled' : ''
      }>${bought ? 'Adquirido' : '🔨 Comprar Lote'}</button>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>🏦 Banco Imperial (Счастливый вклад) y Casa de Subastas (Аукцион)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="Banco Imperial" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Bóveda Bancaria: ${ART.formatCurrencyBadge(bankDep)} • Bolsa: ${ART.formatCurrencyBadge(
        state.hero.copper
      )}</span>
            <h3>Depósito de la Suerte (Счастливый вклад) y Subasta de Guerreros</h3>
            <p class="npc-quote-text">Deposita monedas en la Bóveda Imperial y reclama dividendos del Depósito de la Suerte (+25% interés + Diamantes), o adquiere lotes raros publicados por los 16 Guerreros IA en la Casa de Subastas.</p>
            <div class="npc-shortcuts-bar">
              <button class="btn-asteria sm gold" id="btn-bank-deposit">📥 Depositar 3p 00c (300c)</button>
              <button class="btn-asteria sm gold" id="btn-bank-lucky-claim">✨ Reclamar dividendo «Depósito de la Suerte» (+25% + 2 💎)</button>
              <button class="btn-asteria sm" id="btn-bank-withdraw">📤 Retirar Todo a la Bolsa</button>
            </div>
          </div>
        </div>

        <div class="modal-section-header">
          <span>🔨 Casa de Subastas de Asteria (Аукцион — Lotes de los Guerreros IA)</span>
          <span>Tu Bolsa: ${ART.formatCurrencyBadge(state.hero.copper)}</span>
        </div>
        <div class="modal-shop-grid">${auctionHtml}</div>
      `
    );

    if (!body) return;
    body.querySelector('#btn-bank-deposit').addEventListener('click', () => {
      actions.depositBank(300);
      renderBankAndAuctionModal(state, actions);
    });
    body.querySelector('#btn-bank-lucky-claim').addEventListener('click', () => {
      actions.claimLuckyDeposit();
      renderBankAndAuctionModal(state, actions);
    });
    body.querySelector('#btn-bank-withdraw').addEventListener('click', () => {
      actions.withdrawBank();
      renderBankAndAuctionModal(state, actions);
    });

    body.querySelectorAll('[data-buy-auction]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.buyAuctionListing(btn.getAttribute('data-buy-auction'));
        renderBankAndAuctionModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     16. CHARACTER PROFILE (user_info.php / АНКЕТА), GIFTS & PROMOCODES
     ------------------------------------------------------------------------ */
  function renderProfileAndPromosModal(state, actions) {
    const h = state.hero;
    const fac = ART.FACTIONS[h.faction || 'ogriy'] || ART.FACTIONS.ogriy;
    const style = ART.COMBAT_STYLES[h.combatStyle || 'titan'] || ART.COMBAT_STYLES.titan;
    const vInfo = ART.getValorRank(h.valor || 0);
    const claimedCodes = state.claimedPromocodes || [];
    const gifts = state.giftsReceived || [];

    const equippedListHtml = Object.entries(state.equipment)
      .map(([slot, itemId]) => {
        const it = itemId ? ART.ARTIFACTS[itemId] : null;
        const runeId = state.equipmentRunes && state.equipmentRunes[slot];
        const runeObj = runeId ? ART.ARTIFACTS[runeId] : null;
        return `<span class="ing-pill ${it ? 'ok' : ''}">${slot.toUpperCase()}: ${
          it ? `${it.icon} ${it.name}` : 'Vacío'
        }${runeObj ? ` [${runeObj.icon}]` : ''}</span>`;
      })
      .join(' ');

    const giftsCatalogHtml = ART.GIFTS_CATALOG.map(
      (g) => `
      <button class="btn-asteria sm gold" data-send-gift="${g.id}">
        ${g.icon} Enviar/Recibir ${g.name} (${g.costCopper}c)
      </button>
    `
    ).join(' ');

    const inspectedAi =
      state.ui && state.ui.inspectedWarriorId
        ? ART.AI_WARRIORS.find((w) => w.id === state.ui.inspectedWarriorId)
        : null;

    const body = openModalShell(
      `<span>👤 Perfil de Personaje (user_info.php / Анкета), Regalos y Promocódigos</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.ciudadela_luz}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.comandante_aurelius}" alt="${h.name}" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">${fac.icon} ${fac.name} • ${style.icon} ${style.name} • Rango: ${vInfo.title}</span>
            <h3>${h.name} — Nivel ${h.level} (Clan: ${h.clan}) ${
        inspectedAi ? `• Inspeccionando: ${inspectedAi.name} [Nv.${inspectedAi.level}]` : ''
      }</h3>
            <p class="npc-quote-text">Victorias Totales: ${state.world.totalKills || 0} • Victorias PvP: ${
        state.world.pvpWins || 0
      } • Valor: ${h.valor || 0} • Promocódigos Canjeados: ${claimedCodes.length}</p>
            <div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap">
              ${equippedListHtml}
            </div>
          </div>
        </div>

        <!-- PROMOCODE REDEMPTION BOX (ПРОМОКОДЫ В АНКЕТЕ) -->
        <div class="modal-section-header">
          <span>🎁 Canjear Promocódigo Oficial de Asteria (Вводить в Анкете персонажа)</span>
          <span>Códigos: 9LETASTERII • DLEO-3947-URHF-3846 • ASTERIA2026 • SHEARA777</span>
        </div>
        <div class="prof-card-box">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <input type="text" id="input-promocode" class="chat-text-input" style="border:1px solid var(--gold-aged);flex:1" placeholder="Introduce promocódigo (ej. 9LETASTERII o DLEO-3947-URHF-3846)..." />
            <button class="btn-asteria gold" id="btn-redeem-promocode">✨ Canjear Promocódigo</button>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            ${Object.keys(ART.PROMOCODES)
              .map(
                (code) => `
              <button class="btn-asteria sm ${claimedCodes.includes(code) ? '' : 'gold'}" data-quick-promo="${code}">
                🎟️ ${code} ${claimedCodes.includes(code) ? '(✓ Canjeado)' : ''}
              </button>
            `
              )
              .join('')}
          </div>
          <div id="promo-result-msg" style="font-size:12px;color:var(--gold-bright);margin-top:4px"></div>
        </div>

        <!-- GIFTS GALLERY (ПОДАРКИ) -->
        <div class="modal-section-header">
          <span>🏆 Galería de Regalos y Trofeos en tu Perfil (Подарки: ${gifts.length})</span>
        </div>
        <div class="prof-card-box">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
            ${
              gifts.length
                ? gifts.map((g) => `<span class="ing-pill ok">${g.icon} ${g.name} (de ${g.from})</span>`).join(' ')
                : '<span style="color:var(--text-muted)">Aún no tienes regalos en tu vitrina. ¡Envía un regalo a tu clan para recibir uno de vuelta!</span>'
            }
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${giftsCatalogHtml}</div>
        </div>
      `
    );

    if (!body) return;
    const promoInput = body.querySelector('#input-promocode');
    const promoBtn = body.querySelector('#btn-redeem-promocode');
    const promoMsg = body.querySelector('#promo-result-msg');

    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const res = actions.redeemPromocode(promoInput.value);
        if (promoMsg) {
          promoMsg.textContent =
            typeof res === 'string'
              ? res
              : res && res.message
              ? res.message
              : 'Promocódigo inválido o ya canjeado.';
        }
      });
    }

    body.querySelectorAll('[data-quick-promo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-quick-promo');
        const res = actions.redeemPromocode(code);
        renderProfileAndPromosModal(state, actions);
        const msgEl = document.getElementById('promo-result-msg');
        if (msgEl) {
          msgEl.textContent =
            typeof res === 'string'
              ? res
              : res && res.message
              ? res.message
              : 'Promocódigo ya canjeado.';
        }
      });
    });

    body.querySelectorAll('[data-send-gift]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.sendGiftToWarrior('ai_1', btn.getAttribute('data-send-gift'));
        renderProfileAndPromosModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     17. LIBRARY OF FAEO (library.php) & BALAGUR RIDDLES (КОНКУРСЫ БАЛАГУРОВ)
     ------------------------------------------------------------------------ */
  function renderLibraryAndBalagursModal(state, actions) {
    const solved = (state.world && state.world.solvedRiddles) || {};
    const riddlesHtml = ART.BALAGUR_RIDDLES.map((r) => {
      const isSolved = Boolean(solved[r.id]);
      const optsHtml = r.options
        .map(
          (opt, idx) => `
        <button class="btn-asteria sm ${isSolved && idx === r.correctIndex ? 'gold' : ''}" data-riddle-id="${
            r.id
          }" data-riddle-opt="${idx}" ${isSolved ? 'disabled' : ''}>
          ${opt}
        </button>
      `
        )
        .join(' ');

      return `
        <div class="modal-shop-row ${isSolved ? 'rarity-border-legendary' : 'rarity-border-rare'}">
          <div class="shop-item-icon">${isSolved ? '✅' : '🎭'}</div>
          <div class="shop-item-info">
            <div class="shop-item-title">${r.question}</div>
            <div class="shop-item-stats">Premio Balagur: 💎 +${r.rewardDiamonds} Diamantes • 👑 +${
        r.rewardArkona
      } Influencia de Arkona • +${ART.formatCurrencyBadge(r.rewardCopper)}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${optsHtml}</div>
          </div>
        </div>
      `;
    }).join('');

    const body = openModalShell(
      `<span>📚 Biblioteca de Faeo (library.php) y Acertijos de Balagur (Конкурсы Балагуров)</span>`,
      `
        <div class="npc-hd-hero-banner" style="background-image:url('${ART.LOCATION_IMAGES.templo_antiguo}')">
          <div class="npc-hd-banner-overlay"></div>
          <div class="npc-hd-portrait-frame">
            <img src="${ART.NPC_IMAGES.alquimista_selene}" alt="Biblioteca de Faeo" />
          </div>
          <div class="npc-hd-dialogue-content">
            <span class="scene-subtitle-pill">Códices de Faeo • Mentores • Orden de los Balagures</span>
            <h3>Enciclopedia Imperial de Asteria y Concursos de Balagur</h3>
            <p class="npc-quote-text">Responde a los acertijos oficiales de los Balagures sobre la historia de Ogriy y Khair, La Gruta (ГРОТ), el Anillo Anti-XP y la Reputación de Tahúr para ganar Diamantes e Influencia de Arkona.</p>
          </div>
        </div>
        <div class="modal-shop-grid">${riddlesHtml}</div>
      `
    );

    if (!body) return;
    body.querySelectorAll('[data-riddle-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-riddle-id');
        const optIdx = parseInt(btn.getAttribute('data-riddle-opt'), 10);
        actions.answerBalagurRiddle(rId, optIdx);
        renderLibraryAndBalagursModal(state, actions);
      });
    });
  }

  /* ------------------------------------------------------------------------
     18. CAMPAIGN QUESTS MODAL
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
     19. SAVE EXPORT / IMPORT & PERSISTENT STORAGE MANAGER
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
     20. ENDGAME VICTORY CINEMATIC (MALAKOR DEFEATED IN FRONTERA DE CENIZA)
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
