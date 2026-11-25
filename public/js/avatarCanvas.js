/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/avatarCanvas.js
   Dynamic Hero Ragdoll Canvas Renderer (Armor, Weapon, Shield, Helm, Cloak,
   Mount Aura & Solar Halo rendered dynamically on HTML5 Canvas)
   ========================================================================== */

window.GDL_AVATAR = (function () {
  'use strict';

  function drawHeroAvatar(canvasId, state) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background gothic vignette
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.5, w * 0.72);
    bgGrad.addColorStop(0, 'rgba(212, 168, 67, 0.24)');
    bgGrad.addColorStop(0.55, 'rgba(28, 22, 16, 0.92)');
    bgGrad.addColorStop(1, 'rgba(9, 7, 6, 1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const eq = (state && state.equipment) || {};
    const activeMount = state && state.mounts && state.mounts.active;

    // If Ignifer or mount is active, draw flaming steed aura behind hero
    if (activeMount) {
      const isIgnifer = activeMount === 'ignifer';
      const auraGrad = ctx.createRadialGradient(w * 0.5, h * 0.72, 8, w * 0.5, h * 0.72, 85);
      auraGrad.addColorStop(0, isIgnifer ? 'rgba(255, 94, 36, 0.55)' : 'rgba(244, 208, 104, 0.32)');
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.72, 85, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rotating-style Solar Halo ring behind head
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 208, 104, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.3, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Cloak layer
    if (eq.cloak) {
      ctx.fillStyle = '#4a1410';
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.34);
      ctx.lineTo(w * 0.16, h * 0.88);
      ctx.lineTo(w * 0.84, h * 0.88);
      ctx.lineTo(w * 0.7, h * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Legs & Greaves
    ctx.fillStyle = eq.boots ? '#3b3022' : '#211b14';
    ctx.strokeStyle = eq.boots ? '#d4a843' : '#5c4a32';
    ctx.lineWidth = 1.8;
    ctx.fillRect(w * 0.37, h * 0.62, 13, 52);
    ctx.strokeRect(w * 0.37, h * 0.62, 13, 52);
    ctx.fillRect(w * 0.52, h * 0.62, 13, 52);
    ctx.strokeRect(w * 0.52, h * 0.62, 13, 52);

    // Torso Cuirass & Pauldrons
    const hasHighArmor =
      eq.armor &&
      (eq.armor.includes('imperial') || eq.armor.includes('templo') || eq.armor.includes('luminita'));
    ctx.fillStyle = hasHighArmor ? '#4a3819' : eq.armor ? '#2d2419' : '#1c1712';
    ctx.strokeStyle = hasHighArmor ? '#f4d068' : '#b88e35';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(w * 0.27, h * 0.34);
    ctx.quadraticCurveTo(w * 0.5, h * 0.28, w * 0.73, h * 0.34);
    ctx.lineTo(w * 0.65, h * 0.64);
    ctx.lineTo(w * 0.35, h * 0.64);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Solar Crest on Chestplate
    ctx.fillStyle = '#f4d068';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.46, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head & Helm
    ctx.fillStyle = eq.helm ? '#3a2e1f' : '#c9a37e';
    ctx.strokeStyle = '#f4d068';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.24, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Eye Visor
    ctx.fillStyle = '#58d5ff';
    ctx.fillRect(w * 0.43, h * 0.23, 6, 3);
    ctx.fillRect(w * 0.52, h * 0.23, 6, 3);

    // Crown crest if legendary helm
    if (eq.helm && (eq.helm.includes('corona') || eq.helm.includes('diadema'))) {
      ctx.fillStyle = '#f4d068';
      ctx.beginPath();
      ctx.moveTo(w * 0.41, h * 0.16);
      ctx.lineTo(w * 0.45, h * 0.09);
      ctx.lineTo(w * 0.5, h * 0.14);
      ctx.lineTo(w * 0.55, h * 0.09);
      ctx.lineTo(w * 0.59, h * 0.16);
      ctx.closePath();
      ctx.fill();
    }

    // Weapon (Right Hand of Hero / Left side of viewer)
    if (eq.weapon) {
      const isMythicWeapon =
        eq.weapon.includes('aethel') || eq.weapon.includes('rayo') || eq.weapon.includes('prisma');
      ctx.save();
      ctx.translate(w * 0.22, h * 0.52);
      ctx.rotate(-0.22);
      ctx.fillStyle = isMythicWeapon ? '#fff5c0' : '#d6d2c4';
      ctx.strokeStyle = isMythicWeapon ? '#f4d068' : '#8c7647';
      ctx.lineWidth = 1.8;
      // Blade
      ctx.beginPath();
      ctx.moveTo(-4, 15);
      ctx.lineTo(-5, -52);
      ctx.lineTo(0, -64);
      ctx.lineTo(5, -52);
      ctx.lineTo(4, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Crossguard
      ctx.fillStyle = '#d4a843';
      ctx.fillRect(-13, 12, 26, 5);
      ctx.restore();
    }

    // Shield (Left Hand of Hero / Right side of viewer)
    if (eq.shield) {
      ctx.save();
      ctx.translate(w * 0.77, h * 0.5);
      ctx.fillStyle = '#2e2214';
      ctx.strokeStyle = '#f4d068';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-16, -24);
      ctx.lineTo(16, -24);
      ctx.lineTo(14, 6);
      ctx.lineTo(0, 26);
      ctx.lineTo(-14, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d4a843';
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  return {
    drawHeroAvatar
  };
})();
