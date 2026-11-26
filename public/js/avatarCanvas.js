/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/avatarCanvas.js
   Dynamic Hero 12-Slot Paperdoll Canvas Renderer:
   Reflects Faction (Ogriy vs Khair), Combat Style (Titán, Destructor, Sombra),
   12 Equipment Slots (Helm, Pauldrons, Amulet, Weapon, Armor, Bracers,
   Shield, Cloak, Cuisses, Ring, Belt, Boots) & Active Mount Aura (Ignifer).
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

    const hero = (state && state.hero) || {};
    const faction = hero.faction || 'ogriy';
    const style = hero.combatStyle || 'titan';
    const eq = (state && state.equipment) || {};
    const activeMount = state && state.mounts && state.mounts.active;

    // 1. Faction-themed background vignette (Ogriy Solar Gold vs Khair Magma Crimson)
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.5, w * 0.75);
    if (faction === 'khair') {
      bgGrad.addColorStop(0, 'rgba(230, 72, 59, 0.28)');
      bgGrad.addColorStop(0.55, 'rgba(32, 16, 14, 0.94)');
      bgGrad.addColorStop(1, 'rgba(9, 6, 6, 1)');
    } else {
      bgGrad.addColorStop(0, 'rgba(212, 168, 67, 0.26)');
      bgGrad.addColorStop(0.55, 'rgba(28, 22, 16, 0.92)');
      bgGrad.addColorStop(1, 'rgba(9, 7, 6, 1)');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Mount Aura behind Hero
    if (activeMount) {
      const isIgnifer = activeMount === 'ignifer';
      const auraGrad = ctx.createRadialGradient(w * 0.5, h * 0.72, 8, w * 0.5, h * 0.72, 86);
      auraGrad.addColorStop(
        0,
        isIgnifer
          ? 'rgba(255, 94, 36, 0.58)'
          : faction === 'khair'
          ? 'rgba(230, 72, 59, 0.35)'
          : 'rgba(244, 208, 104, 0.34)'
      );
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.72, 86, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Faction & Style Halo Ring behind head
    ctx.save();
    ctx.strokeStyle =
      style === 'destructor'
        ? 'rgba(230, 72, 59, 0.72)'
        : style === 'sombra'
        ? 'rgba(78, 214, 121, 0.68)'
        : 'rgba(244, 208, 104, 0.68)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.28, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Cloak layer
    if (eq.cloak) {
      ctx.fillStyle = style === 'sombra' ? '#123624' : faction === 'khair' ? '#59120e' : '#4a1410';
      ctx.strokeStyle = style === 'sombra' ? '#4ed679' : '#d4a843';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.29, h * 0.33);
      ctx.lineTo(w * 0.15, h * 0.88);
      ctx.lineTo(w * 0.85, h * 0.88);
      ctx.lineTo(w * 0.71, h * 0.33);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 5. Cuisses (Quijotes) & Boots (Grebas)
    ctx.fillStyle = eq.cuisses ? '#3d3124' : '#251e16';
    ctx.strokeStyle = eq.cuisses ? '#d4a843' : '#5c4a32';
    ctx.lineWidth = 1.6;
    ctx.fillRect(w * 0.37, h * 0.6, 13, 25);
    ctx.strokeRect(w * 0.37, h * 0.6, 13, 25);
    ctx.fillRect(w * 0.52, h * 0.6, 13, 25);
    ctx.strokeRect(w * 0.52, h * 0.6, 13, 25);

    ctx.fillStyle = eq.boots ? '#4a3822' : '#211b14';
    ctx.strokeStyle = eq.boots ? '#f4d068' : '#5c4a32';
    ctx.fillRect(w * 0.36, h * 0.72, 15, 30);
    ctx.strokeRect(w * 0.36, h * 0.72, 15, 30);
    ctx.fillRect(w * 0.51, h * 0.72, 15, 30);
    ctx.strokeRect(w * 0.51, h * 0.72, 15, 30);

    // 6. Torso Cuirass
    const hasHighArmor =
      eq.armor &&
      (eq.armor.includes('imperial') || eq.armor.includes('templo') || eq.armor.includes('luminita'));
    ctx.fillStyle = hasHighArmor ? '#4a3819' : eq.armor ? '#2d2419' : '#1c1712';
    ctx.strokeStyle = hasHighArmor ? '#f4d068' : '#b88e35';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(w * 0.27, h * 0.34);
    ctx.quadraticCurveTo(w * 0.5, h * 0.28, w * 0.73, h * 0.34);
    ctx.lineTo(w * 0.65, h * 0.62);
    ctx.lineTo(w * 0.35, h * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 7. Pauldrons (Hombreras) & Bracers (Brazales) & Belt (Cinturón)
    if (eq.pauldrons) {
      ctx.fillStyle = '#57401c';
      ctx.strokeStyle = '#f4d068';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(w * 0.26, h * 0.36, 11, Math.PI * 0.8, Math.PI * 2.1);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.74, h * 0.36, 11, Math.PI * 0.9, Math.PI * 2.2);
      ctx.fill();
      ctx.stroke();
    }

    if (eq.belt) {
      ctx.fillStyle = '#3b2812';
      ctx.strokeStyle = '#f4d068';
      ctx.lineWidth = 1.5;
      ctx.fillRect(w * 0.34, h * 0.57, w * 0.32, 7);
      ctx.strokeRect(w * 0.34, h * 0.57, w * 0.32, 7);
    }

    if (eq.bracers) {
      ctx.fillStyle = '#473419';
      ctx.strokeStyle = '#d4a843';
      ctx.fillRect(w * 0.2, h * 0.45, 8, 16);
      ctx.fillRect(w * 0.72, h * 0.45, 8, 16);
    }

    // 8. Faction Crest & Amulet on Chestplate
    ctx.fillStyle = faction === 'khair' ? '#ff6859' : '#f4d068';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.45, 8, 0, Math.PI * 2);
    ctx.fill();
    if (eq.amulet) {
      ctx.strokeStyle = '#4ac0f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 9. Head & Helm
    ctx.fillStyle = eq.helm ? '#3a2e1f' : '#c9a37e';
    ctx.strokeStyle = '#f4d068';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.23, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Eye Visor
    ctx.fillStyle = faction === 'khair' ? '#ff7058' : style === 'sombra' ? '#4ed679' : '#58d5ff';
    ctx.fillRect(w * 0.43, h * 0.22, 6, 3);
    ctx.fillRect(w * 0.52, h * 0.22, 6, 3);

    // Crown crest if legendary helm
    if (eq.helm && (eq.helm.includes('corona') || eq.helm.includes('diadema'))) {
      ctx.fillStyle = '#f4d068';
      ctx.beginPath();
      ctx.moveTo(w * 0.41, h * 0.15);
      ctx.lineTo(w * 0.45, h * 0.08);
      ctx.lineTo(w * 0.5, h * 0.13);
      ctx.lineTo(w * 0.55, h * 0.08);
      ctx.lineTo(w * 0.59, h * 0.15);
      ctx.closePath();
      ctx.fill();
    }

    // 10. Weapon (Right Hand of Hero / Left side of viewer)
    if (eq.weapon) {
      const isMythicWeapon =
        eq.weapon.includes('aethel') || eq.weapon.includes('rayo') || eq.weapon.includes('prisma');
      ctx.save();
      ctx.translate(w * 0.21, h * 0.52);
      ctx.rotate(-0.22);
      ctx.fillStyle = isMythicWeapon ? '#fff5c0' : style === 'destructor' ? '#ffb4a8' : '#d6d2c4';
      ctx.strokeStyle = isMythicWeapon ? '#f4d068' : '#8c7647';
      ctx.lineWidth = 1.8;
      // Blade
      ctx.beginPath();
      ctx.moveTo(-4, 15);
      ctx.lineTo(style === 'destructor' ? -8 : -5, -52);
      ctx.lineTo(0, -65);
      ctx.lineTo(style === 'destructor' ? 8 : 5, -52);
      ctx.lineTo(4, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Crossguard
      ctx.fillStyle = '#d4a843';
      ctx.fillRect(-13, 12, 26, 5);
      ctx.restore();
    }

    // 11. Shield or Off-Hand Dual Dagger (Left Hand of Hero / Right side of viewer)
    if (eq.shield) {
      ctx.save();
      ctx.translate(w * 0.78, h * 0.5);
      ctx.fillStyle = style === 'titan' ? '#382a16' : '#2e2214';
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

      ctx.fillStyle = faction === 'khair' ? '#e6483b' : '#d4a843';
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 12. Bottom Faction & Combat Style Tag on Canvas
    ctx.save();
    ctx.fillStyle = 'rgba(10, 8, 6, 0.82)';
    ctx.fillRect(6, h - 20, w - 12, 15);
    ctx.strokeStyle = 'rgba(212, 168, 67, 0.45)';
    ctx.strokeRect(6, h - 20, w - 12, 15);
    ctx.fillStyle = '#f4d068';
    ctx.font = 'bold 9px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${faction === 'khair' ? '🌋 KHAIR' : '☀️ OGRIY'} • ${style.toUpperCase()}`,
      w * 0.5,
      h - 10
    );
    ctx.restore();
  }

  return {
    drawHeroAvatar
  };
})();
