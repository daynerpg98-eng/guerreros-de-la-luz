/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/combatCanvas.js
   60fps Animated HTML5 Tactical Battle Stage (Continuous requestAnimationFrame
   loop while in combat view, Stance Aura, 3-Step Combo Chain Pips, Summoned
   Morok/Mount & Disciple Companions, Slash & Super-Blow FX, Floating Damage)
   ========================================================================== */

window.GDL_COMBAT_CANVAS = (function () {
  'use strict';

  const bgCache = {};
  let floatingTexts = [];
  let flashEffect = null;
  let animFrameId = null;
  let activeCanvasId = null;
  let activeCombatState = null;
  let activeLocationObj = null;

  function loadBgImage(src) {
    if (!src) return null;
    if (bgCache[src]) return bgCache[src];
    const img = new Image();
    img.src = src;
    bgCache[src] = img;
    return img;
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
      alpha: 0.85
    };
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
    const bob = Math.sin(now * 0.004) * 3;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw HD Oil-Painted Location Background
    const bgImg = locationObj ? loadBgImage(locationObj.img) : null;
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1f1710');
      grad.addColorStop(1, '#090706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Dark atmospheric battle overlay
    ctx.fillStyle = 'rgba(8, 6, 5, 0.58)';
    ctx.fillRect(0, 0, w, h);

    // Arena floor shadow
    const floorGrad = ctx.createRadialGradient(w * 0.5, h * 0.85, 20, w * 0.5, h * 0.85, w * 0.45);
    floorGrad.addColorStop(0, 'rgba(212, 168, 67, 0.24)');
    floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.76)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.84, w * 0.42, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Hero pedestal, Stance Aura & Silhouette (Left)
    const heroX = w * 0.23;
    const heroY = h * 0.62 + bob;
    const stance = combatState.stance || 'guardia_solar';
    const stanceColor =
      stance === 'furia_dragon'
        ? '#e6483b'
        : stance === 'velo_sombra'
        ? '#4ed679'
        : '#4ac0f0';

    ctx.save();
    ctx.strokeStyle = stanceColor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(212, 168, 67, 0.18)';
    ctx.beginPath();
    ctx.ellipse(heroX, h * 0.62 + 46, 56, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hero Figure
    ctx.font = '56px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = stanceColor;
    ctx.shadowBlur = 18;
    ctx.fillText('⚜️', heroX, heroY);
    ctx.restore();

    // 2b. Summoned Morok / Mount & Disciple Companions alongside Hero
    if (combatState.summonedMorok && combatState.summonedMorok.hp > 0) {
      const m = combatState.summonedMorok;
      ctx.save();
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.icon || '🔥', heroX + 78, heroY + 8 - bob * 0.7);
      ctx.font = 'bold 10px Cinzel, serif';
      ctx.fillStyle = '#f4d068';
      ctx.fillText(`${m.name.split(' ')[0]} (${m.hp}HP)`, heroX + 78, heroY + 34);
      ctx.restore();
    }

    if (combatState.activeDiscipleIcon) {
      ctx.save();
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText(combatState.activeDiscipleIcon, heroX - 66, heroY + 12);
      ctx.restore();
    }

    // 3. Enemy pedestal & figure (Right)
    const enemyX = w * 0.77;
    const enemyY = h * 0.62 - bob * 0.8;
    ctx.save();
    ctx.strokeStyle = '#e04438';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(224, 68, 56, 0.22)';
    ctx.beginPath();
    ctx.ellipse(enemyX, h * 0.62 + 46, 58, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = combatState.enemy.isBoss ? '68px serif' : '58px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(224, 68, 56, 0.9)';
    ctx.shadowBlur = 18;
    ctx.fillText(combatState.enemy.icon || '👹', enemyX, enemyY);
    ctx.restore();

    // 4. Center VS Crest & 3-Step Combo Chain Pips
    ctx.save();
    ctx.fillStyle = 'rgba(18, 14, 11, 0.9)';
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.24, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f4d068';
    ctx.font = 'bold 13px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`T${combatState.turn}`, w * 0.5, h * 0.24);

    // Draw 3 directional combo pips under the turn circle
    const chain = combatState.comboChain || [];
    for (let i = 0; i < 3; i++) {
      const px = w * 0.5 + (i - 1) * 22;
      const py = h * 0.42;
      const z = chain[i];
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = z ? 'rgba(212, 168, 67, 0.88)' : 'rgba(20, 16, 12, 0.8)';
      ctx.strokeStyle = '#f4d068';
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
      if (z) {
        ctx.fillStyle = '#120e0b';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(z === 'head' ? 'C' : z === 'torso' ? 'T' : 'P', px, py);
      }
    }
    ctx.restore();

    // 5. Flash / Slash effect
    if (flashEffect && flashEffect.alpha > 0.02) {
      const targetX = flashEffect.side === 'enemy' ? enemyX : heroX;
      const targetY = flashEffect.side === 'enemy' ? enemyY : heroY;
      ctx.save();
      ctx.strokeStyle =
        flashEffect.type === 'super'
          ? `rgba(244, 208, 104, ${flashEffect.alpha})`
          : flashEffect.type === 'spell'
          ? `rgba(74, 192, 240, ${flashEffect.alpha})`
          : `rgba(255, 95, 75, ${flashEffect.alpha})`;
      ctx.lineWidth = flashEffect.type === 'super' ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(targetX - 44, targetY - 38);
      ctx.lineTo(targetX + 44, targetY + 38);
      ctx.moveTo(targetX + 44, targetY - 38);
      ctx.lineTo(targetX - 44, targetY + 38);
      ctx.stroke();
      ctx.restore();
      flashEffect.alpha *= 0.86;
    }

    // 6. Floating Damage Texts
    floatingTexts = floatingTexts.filter((ft) => ft.alpha > 0.04);
    floatingTexts.forEach((ft) => {
      const tx = ft.side === 'enemy' ? enemyX : heroX;
      const ty = (ft.side === 'enemy' ? enemyY : heroY) - 45 - ft.offsetY;
      ctx.save();
      ctx.font = ft.isCrit ? 'bold 21px Cinzel, serif' : 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.isCrit
        ? `rgba(244, 208, 104, ${ft.alpha})`
        : ft.side === 'enemy'
        ? `rgba(255, 115, 100, ${ft.alpha})`
        : `rgba(110, 220, 255, ${ft.alpha})`;
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
    triggerCombatEffect,
    renderBattleCanvas,
    stopBattleLoop
  };
})();
