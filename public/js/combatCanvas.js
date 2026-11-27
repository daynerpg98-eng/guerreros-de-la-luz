/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/combatCanvas.js
   60fps Animated HTML5 Tactical Battle Stage (DWAR / Diablo II / BG3 Style):
   - Full Illustrated Oil-Painted Hero & Creature Battle Portraits on Canvas
   - Composite Articulated Vector Knight (with Equipped Weapon/Shield/Armor)
     & Detailed Articulated Creature/Boss Anatomy alongside Painted Portraits
   - Dynamic Lunge, Recoil, Weapon Slash Arcs, Super-Blow Lightning Pillars &
     Arcane Spell Shockwaves
   - Live 3-Zone Anatomical Target Crosshair on Enemy (Cabeza, Torso, Piernas)
     and Shield Guard Indicator on Hero
   - Summoned Morok/Mount (Ignifer), Disciple (Ученик) & Red Pet Companions
   ========================================================================== */

window.GDL_COMBAT_CANVAS = (function () {
  'use strict';

  const imgCache = {};
  let floatingTexts = [];
  let flashEffect = null;
  let animFrameId = null;
  let activeCanvasId = null;
  let activeCombatState = null;
  let activeLocationObj = null;

  // Lunge & shake animation state
  let heroLungeOffset = 0;
  let enemyLungeOffset = 0;
  let enemyHitShake = 0;
  let heroHitShake = 0;

  const COMBAT_SPRITE_PATHS = {
    hero_ogriy: 'assets/combat/hero_paladin.jpg',
    hero_khair: 'assets/combat/hero_magmar.jpg',
    creature_beast: 'assets/combat/creature_beast.jpg',
    creature_colossus: 'assets/combat/creature_colossus.jpg',
    creature_inquisitor: 'assets/combat/creature_inquisitor.jpg',
    creature_dragon: 'assets/combat/creature_dragon.jpg'
  };

  function loadImg(src) {
    if (!src) return null;
    if (imgCache[src]) return imgCache[src];
    const img = new Image();
    img.src = src;
    imgCache[src] = img;
    return img;
  }

  function getCreaturePortraitPath(enemy) {
    if (!enemy) return COMBAT_SPRITE_PATHS.creature_beast;
    const id = String(enemy.id || '').toLowerCase();
    const type = String(enemy.type || '').toLowerCase();
    if (
      id.includes('vorathax') ||
      id.includes('malakor') ||
      id.includes('leviatan') ||
      id.includes('mirmidon') ||
      id.includes('caballero_ceniza') ||
      type.includes('dragón') ||
      type.includes('supremo') ||
      type.includes('magma')
    ) {
      return COMBAT_SPRITE_PATHS.creature_dragon;
    }
    if (
      id.includes('krystallos') ||
      id.includes('golem') ||
      id.includes('maniqui') ||
      id.includes('elemental') ||
      id.includes('serafin') ||
      id.includes('escorpion') ||
      id.includes('devorador') ||
      type.includes('constructo') ||
      type.includes('coloso')
    ) {
      return COMBAT_SPRITE_PATHS.creature_colossus;
    }
    if (
      id.includes('espectro') ||
      id.includes('sylvaris') ||
      id.includes('inquisidor') ||
      id.includes('vaelen') ||
      id.includes('sirena') ||
      id.includes('centinela') ||
      type.includes('espectro') ||
      type.includes('custodio') ||
      enemy.isPvp
    ) {
      return COMBAT_SPRITE_PATHS.creature_inquisitor;
    }
    return COMBAT_SPRITE_PATHS.creature_beast;
  }

  function triggerCombatEffect(type, dmgText, side = 'enemy', isCrit = false) {
    floatingTexts.push({
      text: dmgText,
      side,
      isCrit,
      alpha: 1.0,
      offsetY: 0,
      createdAt: performance.now()
    });
    flashEffect = {
      type,
      side,
      alpha: 0.95
    };
    if (side === 'enemy') {
      heroLungeOffset = 28;
      enemyHitShake = 14;
    } else {
      enemyLungeOffset = -24;
      heroHitShake = 12;
    }
  }

  /* ------------------------------------------------------------------------
     DRAW ARTICULATED HERO KNIGHT & PAINTED PORTRAIT MEDALLION
     ------------------------------------------------------------------------ */
  function drawHeroCombatant(ctx, x, y, bob, combatState, stanceColor) {
    const appState = window.GDL_APP && typeof window.GDL_APP.getState === 'function'
      ? window.GDL_APP.getState()
      : null;
    const hero = (appState && appState.hero) || { name: 'Aethelgard', faction: 'ogriy', combatStyle: 'titan', level: 1 };
    const eq = (appState && appState.equipment) || {};
    const isKhair = hero.faction === 'khair';
    const heroImg = loadImg(isKhair ? COMBAT_SPRITE_PATHS.hero_magmar : COMBAT_SPRITE_PATHS.hero_ogriy);

    ctx.save();
    ctx.translate(x, y);

    // 1. Tactical Runic Pedestal
    ctx.strokeStyle = stanceColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = isKhair ? 'rgba(230, 72, 59, 0.22)' : 'rgba(212, 168, 67, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 66, 76, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner glowing rune circle
    ctx.strokeStyle = 'rgba(244, 208, 104, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 66, 56, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. HD Painted Hero Card Frame (Left-back of pedestal)
    const cardW = 104;
    const cardH = 136;
    const cardX = -68;
    const cardY = -74 + bob * 0.5;

    ctx.fillStyle = '#120e0a';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    if (heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
      ctx.drawImage(heroImg, cardX + 2, cardY + 2, cardW - 4, cardH - 4);
    }
    ctx.strokeStyle = isKhair ? '#e6483b' : '#f4d068';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Corner bronze rivets on portrait frame
    ctx.fillStyle = '#f4d068';
    ctx.fillRect(cardX - 2, cardY - 2, 5, 5);
    ctx.fillRect(cardX + cardW - 3, cardY - 2, 5, 5);
    ctx.fillRect(cardX - 2, cardY + cardH - 3, 5, 5);
    ctx.fillRect(cardX + cardW - 3, cardY + cardH - 3, 5, 5);

    // 3. Full Articulated Armored Knight Sprite in Foreground (Right of Portrait)
    const kx = 18;
    const ky = 2 + bob;

    // Flowing Crimson / Obsidian Cloak
    ctx.fillStyle = isKhair ? '#4d0e0a' : '#5e140f';
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(kx - 14, ky - 34);
    ctx.lineTo(kx - 36, ky + 48);
    ctx.lineTo(kx + 8, ky + 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Armored Legs & Greaves
    ctx.fillStyle = isKhair ? '#2b1b17' : '#4a3822';
    ctx.strokeStyle = '#f4d068';
    ctx.lineWidth = 1.6;
    ctx.fillRect(kx - 13, ky + 16, 10, 36);
    ctx.strokeRect(kx - 13, ky + 16, 10, 36);
    ctx.fillRect(kx + 3, ky + 16, 10, 36);
    ctx.strokeRect(kx + 3, ky + 16, 10, 36);

    // Plate Cuirass (Torso)
    ctx.fillStyle = isKhair ? '#331712' : '#4f3b1d';
    ctx.strokeStyle = '#f4d068';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(kx - 18, ky - 30);
    ctx.lineTo(kx + 18, ky - 30);
    ctx.lineTo(kx + 14, ky + 18);
    ctx.lineTo(kx - 14, ky + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Solar / Magmar Chest Emblem
    ctx.fillStyle = isKhair ? '#ff594a' : '#ffe07d';
    ctx.beginPath();
    ctx.arc(kx, ky - 10, 6, 0, Math.PI * 2);
    ctx.fill();

    // Pauldrons (Shoulder Guards)
    ctx.fillStyle = isKhair ? '#4a1812' : '#6b4f23';
    ctx.beginPath();
    ctx.arc(kx - 19, ky - 26, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(kx + 19, ky - 26, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet & Glowing Visor
    ctx.fillStyle = isKhair ? '#2e1613' : '#574120';
    ctx.beginPath();
    ctx.arc(kx, ky - 45, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Visor Eyes
    ctx.fillStyle = isKhair ? '#ff6452' : '#58d5ff';
    ctx.fillRect(kx - 2, ky - 47, 10, 3);

    // Helmet Plume / Crest
    ctx.fillStyle = isKhair ? '#ff4f3d' : '#f4d068';
    ctx.beginPath();
    ctx.moveTo(kx - 8, ky - 56);
    ctx.lineTo(kx + 2, ky - 67);
    ctx.lineTo(kx + 10, ky - 55);
    ctx.closePath();
    ctx.fill();

    // Equipped Greatsword / Battleaxe (Raised toward Enemy)
    ctx.save();
    ctx.translate(kx + 24, ky - 8);
    ctx.rotate(heroLungeOffset > 2 ? 0.45 : -0.25);
    ctx.fillStyle = isKhair ? '#ff8b73' : '#fff5c2';
    ctx.strokeStyle = '#f4d068';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-3, 10);
    ctx.lineTo(-5, -52);
    ctx.lineTo(0, -66);
    ctx.lineTo(5, -52);
    ctx.lineTo(3, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Crossguard
    ctx.fillStyle = '#d4a843';
    ctx.fillRect(-11, 7, 22, 4);
    ctx.restore();

    // Equipped Lion Shield (Positioned at Defend Zone: Head / Torso / Legs)
    const defZone = combatState.defendZone || 'torso';
    const shieldOffsetY = defZone === 'head' ? -36 : defZone === 'legs' ? 20 : -8;
    ctx.save();
    ctx.translate(kx + 10, ky + shieldOffsetY);
    ctx.fillStyle = isKhair ? '#3d1410' : '#3b2b15';
    ctx.strokeStyle = '#4ed679';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(12, -16);
    ctx.lineTo(10, 5);
    ctx.lineTo(0, 18);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4ed679';
    ctx.font = 'bold 9px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡️', 0, -1);
    ctx.restore();

    // Nameplate under Hero Pedestal
    ctx.fillStyle = 'rgba(10, 8, 6, 0.9)';
    ctx.fillRect(-76, 56, 152, 18);
    ctx.strokeStyle = stanceColor;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-76, 56, 152, 18);
    ctx.fillStyle = '#fff5d6';
    ctx.font = 'bold 10px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚜️ ${hero.name} [GUARDIA: ${defZone.toUpperCase()}]`, 0, 65);

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     DRAW ARTICULATED ENEMY CREATURE / BOSS & 3-ZONE TARGET RETICLE
     ------------------------------------------------------------------------ */
  function drawEnemyCombatant(ctx, x, y, bob, combatState) {
    const en = combatState.enemy || { name: 'Criatura', level: 1, icon: '👹' };
    const portraitSrc = getCreaturePortraitPath(en);
    const enemyImg = loadImg(portraitSrc);
    const isBoss = Boolean(en.isBoss || en.isFinalBoss || en.isElite);
    const frameBorderColor = isBoss ? '#ff4b3e' : '#d4a843';

    ctx.save();
    ctx.translate(x, y);

    // 1. Enemy Runic Pedestal
    ctx.strokeStyle = frameBorderColor;
    ctx.lineWidth = isBoss ? 3 : 2;
    ctx.fillStyle = isBoss ? 'rgba(230, 72, 59, 0.28)' : 'rgba(180, 50, 40, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 66, 80, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. HD Painted Creature / Boss Card Frame (Right-back of pedestal)
    const cardW = isBoss ? 114 : 104;
    const cardH = isBoss ? 144 : 136;
    const cardX = -28;
    const cardY = (isBoss ? -82 : -74) - bob * 0.6;

    ctx.fillStyle = '#120b0a';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
      ctx.drawImage(enemyImg, cardX + 2, cardY + 2, cardW - 4, cardH - 4);
    }
    ctx.strokeStyle = frameBorderColor;
    ctx.lineWidth = isBoss ? 3 : 2.2;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Corner rivets
    ctx.fillStyle = frameBorderColor;
    ctx.fillRect(cardX - 2, cardY - 2, 5, 5);
    ctx.fillRect(cardX + cardW - 3, cardY - 2, 5, 5);
    ctx.fillRect(cardX - 2, cardY + cardH - 3, 5, 5);
    ctx.fillRect(cardX + cardW - 3, cardY + cardH - 3, 5, 5);

    // 3. Articulated Creature / Boss Silhouette in Foreground (Left of Portrait, facing Hero)
    const ex = -36;
    const ey = 2 - bob * 0.8;

    // Aura glow behind creature
    const auraGrad = ctx.createRadialGradient(ex, ey - 10, 6, ex, ey - 10, 48);
    auraGrad.addColorStop(0, isBoss ? 'rgba(255, 75, 62, 0.45)' : 'rgba(212, 168, 67, 0.28)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(ex, ey - 10, 48, 0, Math.PI * 2);
    ctx.fill();

    // Creature Armored Body & Limbs
    ctx.fillStyle = portraitSrc.includes('colossus')
      ? '#163d4a'
      : portraitSrc.includes('dragon')
      ? '#3d100c'
      : '#261d18';
    ctx.strokeStyle = portraitSrc.includes('colossus') ? '#4ac0f0' : frameBorderColor;
    ctx.lineWidth = 2;

    // Legs
    ctx.fillRect(ex - 14, ey + 16, 11, 35);
    ctx.strokeRect(ex - 14, ey + 16, 11, 35);
    ctx.fillRect(ex + 3, ey + 16, 11, 35);
    ctx.strokeRect(ex + 3, ey + 16, 11, 35);

    // Torso
    ctx.beginPath();
    ctx.moveTo(ex - 22, ey - 32);
    ctx.lineTo(ex + 20, ey - 32);
    ctx.lineTo(ex + 15, ey + 18);
    ctx.lineTo(ex - 15, ey + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head / Horned Crown
    ctx.beginPath();
    ctx.arc(ex, ey - 46, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horns
    ctx.beginPath();
    ctx.moveTo(ex - 10, ey - 54);
    ctx.lineTo(ex - 20, ey - 68);
    ctx.lineTo(ex - 4, ey - 58);
    ctx.moveTo(ex + 10, ey - 54);
    ctx.lineTo(ex + 20, ey - 68);
    ctx.lineTo(ex + 4, ey - 58);
    ctx.fill();
    ctx.stroke();

    // Glowing Creature Eyes
    ctx.fillStyle = portraitSrc.includes('colossus') ? '#58e8ff' : '#ff4b3e';
    ctx.fillRect(ex - 9, ey - 48, 5, 3);
    ctx.fillRect(ex - 1, ey - 48, 5, 3);

    // Creature Weapon / Claw pointing left toward Hero
    ctx.save();
    ctx.translate(ex - 24, ey - 8);
    ctx.rotate(enemyLungeOffset < -2 ? -0.45 : 0.25);
    ctx.fillStyle = portraitSrc.includes('colossus') ? '#6ee7ff' : '#ff6859';
    ctx.strokeStyle = '#f4d068';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-4, 12);
    ctx.lineTo(-6, -46);
    ctx.lineTo(0, -60);
    ctx.lineTo(6, -46);
    ctx.lineTo(4, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Live 3-Zone Target Crosshair on Enemy Body (Cabeza / Torso / Piernas)
    const atkZone = combatState.attackZone || 'head';
    const targetY = atkZone === 'head' ? ey - 46 : atkZone === 'legs' ? ey + 32 : ey - 8;
    ctx.save();
    ctx.strokeStyle = '#ff4b3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, targetY, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex - 21, targetY);
    ctx.lineTo(ex + 21, targetY);
    ctx.moveTo(ex, targetY - 21);
    ctx.lineTo(ex, targetY + 21);
    ctx.stroke();
    ctx.restore();

    // 5. Nameplate under Enemy Pedestal
    ctx.fillStyle = 'rgba(10, 8, 6, 0.92)';
    ctx.fillRect(-84, 56, 168, 18);
    ctx.strokeStyle = frameBorderColor;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-84, 56, 168, 18);
    ctx.fillStyle = '#ffd8d4';
    ctx.font = 'bold 10px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortEnemyName = String(en.name || 'Enemigo').split(',')[0].slice(0, 20);
    ctx.fillText(`🎯 ${shortEnemyName} [Nv.${en.level}]`, 0, 65);

    ctx.restore();
  }

  function drawFrame() {
    const canvas = activeCanvasId ? document.getElementById(activeCanvasId) : null;
    if (!canvas || !activeCombatState) {
      stopBattleLoop();
      return;
    }

    const combatState = activeCombatState;
    const locationObj = activeLocationObj;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const now = performance.now();
    const bob = Math.sin(now * 0.0045) * 3.5;

    // Decay lunge and hit-shake offsets smoothly
    heroLungeOffset *= 0.82;
    enemyLungeOffset *= 0.82;
    enemyHitShake *= 0.78;
    heroHitShake *= 0.78;

    const heroShakeX = heroHitShake > 0.5 ? (Math.random() - 0.5) * heroHitShake : 0;
    const enemyShakeX = enemyHitShake > 0.5 ? (Math.random() - 0.5) * enemyHitShake : 0;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw HD Oil-Painted Location Background
    const bgImg = locationObj ? loadImg(locationObj.img) : null;
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1f1710');
      grad.addColorStop(1, '#090706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Dark atmospheric battle vignette
    ctx.fillStyle = 'rgba(7, 5, 4, 0.54)';
    ctx.fillRect(0, 0, w, h);

    // Arena Stone Floor Shadow
    const floorGrad = ctx.createRadialGradient(w * 0.5, h * 0.84, 20, w * 0.5, h * 0.84, w * 0.46);
    floorGrad.addColorStop(0, 'rgba(212, 168, 67, 0.22)');
    floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.84, w * 0.44, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Hero Combatant (Left Side: Full Portrait + Articulated Armored Knight)
    const heroX = w * 0.23 + heroLungeOffset + heroShakeX;
    const heroY = h * 0.54;
    const stance = combatState.stance || 'guardia_solar';
    const stanceColor =
      stance === 'furia_dragon'
        ? '#e6483b'
        : stance === 'velo_sombra'
        ? '#4ed679'
        : '#4ac0f0';

    drawHeroCombatant(ctx, heroX, heroY, bob, combatState, stanceColor);

    // 2b. Summoned Morok / Mount & Disciple Companions alongside Hero
    if (combatState.summonedMorok && combatState.summonedMorok.hp > 0) {
      const m = combatState.summonedMorok;
      ctx.save();
      ctx.fillStyle = 'rgba(16, 12, 9, 0.88)';
      ctx.strokeStyle = '#ff8c24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(heroX + 94, heroY + 12 - bob * 0.7, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.icon || '🔥', heroX + 94, heroY + 12 - bob * 0.7);
      ctx.font = 'bold 9.5px Cinzel, serif';
      ctx.fillStyle = '#f4d068';
      ctx.fillText(`${m.name.split(' ')[0]} (${m.hp}HP)`, heroX + 94, heroY + 42);
      ctx.restore();
    }

    if (combatState.activeDiscipleIcon) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 12, 9, 0.88)';
      ctx.strokeStyle = '#4ac0f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(heroX - 96, heroY + 18, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(combatState.activeDiscipleIcon, heroX - 96, heroY + 18);
      ctx.restore();
    }

    // 3. Enemy Combatant (Right Side: Full Painted Creature Portrait + Articulated Creature + 3-Zone Reticle)
    const enemyX = w * 0.77 + enemyLungeOffset + enemyShakeX;
    const enemyY = h * 0.54;
    drawEnemyCombatant(ctx, enemyX, enemyY, bob, combatState);

    // 4. Center VS Turn Medallion & 3-Step Combo Chain Pips
    ctx.save();
    ctx.fillStyle = 'rgba(18, 14, 11, 0.92)';
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.22, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f4d068';
    ctx.font = 'bold 12px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`T${combatState.turn}`, w * 0.5, h * 0.22);

    // Draw 3 directional combo pips under the turn circle
    const chain = combatState.comboChain || [];
    for (let i = 0; i < 3; i++) {
      const px = w * 0.5 + (i - 1) * 22;
      const py = h * 0.39;
      const z = chain[i];
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = z ? 'rgba(212, 168, 67, 0.92)' : 'rgba(20, 16, 12, 0.85)';
      ctx.strokeStyle = '#f4d068';
      ctx.lineWidth = 1.4;
      ctx.fill();
      ctx.stroke();
      if (z) {
        ctx.fillStyle = '#120e0b';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(z === 'head' ? 'C' : z === 'torso' ? 'T' : 'P', px, py);
      }
    }
    ctx.restore();

    // 5. Dynamic Weapon Slash / Super-Blow Lightning Pillar / Spell Shockwave FX
    if (flashEffect && flashEffect.alpha > 0.03) {
      const targetX = flashEffect.side === 'enemy' ? enemyX - 24 : heroX + 18;
      const targetY = flashEffect.side === 'enemy' ? enemyY - 8 : heroY - 8;
      ctx.save();

      if (flashEffect.type === 'super') {
        // Golden Solar Pillar & Shockwave Ring
        const pillarGrad = ctx.createLinearGradient(targetX - 35, 0, targetX + 35, 0);
        pillarGrad.addColorStop(0, 'rgba(244, 208, 104, 0)');
        pillarGrad.addColorStop(0.5, `rgba(255, 235, 140, ${flashEffect.alpha * 0.85})`);
        pillarGrad.addColorStop(1, 'rgba(244, 208, 104, 0)');
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(targetX - 35, 0, 70, h);
      } else if (flashEffect.type === 'spell') {
        // Arcane Sapphire Shockwave Circle
        ctx.strokeStyle = `rgba(74, 192, 240, ${flashEffect.alpha})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(targetX, targetY, (1.1 - flashEffect.alpha) * 65 + 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle =
        flashEffect.type === 'super'
          ? `rgba(255, 232, 130, ${flashEffect.alpha})`
          : flashEffect.type === 'spell'
          ? `rgba(90, 215, 255, ${flashEffect.alpha})`
          : `rgba(255, 95, 75, ${flashEffect.alpha})`;
      ctx.lineWidth = flashEffect.type === 'super' ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(targetX - 46, targetY - 40);
      ctx.lineTo(targetX + 46, targetY + 40);
      ctx.moveTo(targetX + 46, targetY - 40);
      ctx.lineTo(targetX - 46, targetY + 40);
      ctx.stroke();
      ctx.restore();
      flashEffect.alpha *= 0.85;
    }

    // 6. Floating Damage Texts
    floatingTexts = floatingTexts.filter((ft) => ft.alpha > 0.04);
    floatingTexts.forEach((ft) => {
      const tx = ft.side === 'enemy' ? enemyX - 15 : heroX + 10;
      const ty = (ft.side === 'enemy' ? enemyY : heroY) - 54 - ft.offsetY;
      ctx.save();
      ctx.font = ft.isCrit ? 'bold 21px Cinzel, serif' : 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.isCrit
        ? `rgba(255, 224, 115, ${ft.alpha})`
        : ft.side === 'enemy'
        ? `rgba(255, 115, 100, ${ft.alpha})`
        : `rgba(110, 225, 255, ${ft.alpha})`;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, tx, ty);
      ctx.restore();
      ft.offsetY += 1.15;
      ft.alpha *= 0.94;
    });

    animFrameId = requestAnimationFrame(drawFrame);
  }

  function renderBattleCanvas(canvasId, combatState, locationObj) {
    activeCanvasId = canvasId;
    activeCombatState = combatState;
    activeLocationObj = locationObj;
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(drawFrame);
    }
  }

  function stopBattleLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    activeCombatState = null;
  }

  return {
    COMBAT_SPRITE_PATHS,
    getCreaturePortraitPath,
    triggerCombatEffect,
    renderBattleCanvas,
    stopBattleLoop
  };
})();
