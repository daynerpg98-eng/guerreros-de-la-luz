/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/huntingCanvas.js
   Interactive Real-Time Hunting Mode (Modo Caza) on HTML5 Canvas:
   HD Location Painting Background, Roaming Creatures & Glowing Resource Nodes
   ========================================================================== */

window.GDL_HUNTING_CANVAS = (function () {
  'use strict';

  const ART = window.GDL_ART;
  const imgCache = {};
  let animFrameId = null;
  let entities = [];
  let activeLocId = null;
  let callbacks = {
    onAttackCreature: null,
    onHarvestNode: null
  };

  function getBgImage(src) {
    if (!src) return null;
    if (imgCache[src]) return imgCache[src];
    const img = new Image();
    img.src = src;
    imgCache[src] = img;
    return img;
  }

  function spawnEntitiesForLocation(locObj) {
    entities = [];
    if (!locObj) return;

    // Spawn roaming creatures
    const locCreatures = ART.CREATURES.filter((c) => c.loc === locObj.id);
    locCreatures.forEach((cr, idx) => {
      entities.push({
        kind: 'creature',
        id: cr.id,
        name: cr.name,
        level: cr.level,
        icon: cr.icon,
        isBoss: Boolean(cr.isBoss),
        isElite: Boolean(cr.isElite),
        x: 130 + ((idx * 175) % 520),
        y: 120 + ((idx * 85) % 180),
        vx: (idx % 2 === 0 ? 1 : -1) * (0.28 + idx * 0.06),
        vy: (idx % 2 === 0 ? -1 : 1) * 0.16,
        radius: cr.isBoss ? 30 : 24
      });
    });

    // Spawn resource nodes
    (locObj.huntingNodes || []).forEach((node, idx) => {
      entities.push({
        kind: 'resource',
        id: node.id,
        name: node.name,
        prof: node.prof,
        tier: node.tier,
        icon: node.icon,
        color: node.color,
        x: 160 + idx * 280,
        y: 265 + (idx % 2) * 35,
        vx: 0,
        vy: 0,
        radius: 23,
        cooldown: 0
      });
    });
  }

  function startHuntingCanvas(canvasId, locObj, cbs) {
    stopHuntingCanvas();
    callbacks = Object.assign(callbacks, cbs || {});
    const canvas = document.getElementById(canvasId);
    if (!canvas || !locObj) return;

    if (activeLocId !== locObj.id || entities.length === 0) {
      activeLocId = locObj.id;
      spawnEntitiesForLocation(locObj);
    }

    const ctx = canvas.getContext('2d');
    const bgImg = getBgImage(locObj.img);

    function handleCanvasClick(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        const dist = Math.hypot(mx - ent.x, my - ent.y);
        if (dist <= ent.radius + 10) {
          if (ent.kind === 'creature' && callbacks.onAttackCreature) {
            callbacks.onAttackCreature(ent.id);
            return;
          }
          if (ent.kind === 'resource' && callbacks.onHarvestNode) {
            if (ent.cooldown <= 0) {
              ent.cooldown = 160;
              callbacks.onHarvestNode(ent);
            }
            return;
          }
        }
      }
    }

    canvas.onclick = handleCanvasClick;

    function loop() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw HD Oil Background
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#14100c';
        ctx.fillRect(0, 0, w, h);
      }

      // Vignette overlay
      ctx.fillStyle = 'rgba(7, 6, 5, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // Update & Draw Entities
      entities.forEach((ent) => {
        if (ent.kind === 'creature') {
          ent.x += ent.vx;
          ent.y += ent.vy;
          if (ent.x < 70 || ent.x > w - 70) ent.vx *= -1;
          if (ent.y < 85 || ent.y > h - 75) ent.vy *= -1;
        } else if (ent.cooldown > 0) {
          ent.cooldown -= 1;
        }

        ctx.save();
        // Ground ring
        ctx.beginPath();
        ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
        if (ent.kind === 'creature') {
          ctx.fillStyle = ent.isBoss
            ? 'rgba(180, 28, 22, 0.82)'
            : 'rgba(26, 20, 15, 0.82)';
          ctx.strokeStyle = ent.isBoss ? '#f4d068' : '#e04438';
        } else {
          ctx.fillStyle =
            ent.cooldown > 0 ? 'rgba(30, 30, 30, 0.6)' : 'rgba(16, 38, 48, 0.85)';
          ctx.strokeStyle = ent.cooldown > 0 ? '#555' : ent.color || '#48b8e8';
        }
        ctx.lineWidth = ent.isBoss ? 3 : 2;
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.font = ent.isBoss ? '27px serif' : '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ent.icon, ent.x, ent.y);

        // Nameplate
        ctx.font = 'bold 11px Cinzel, serif';
        const label =
          ent.kind === 'creature'
            ? `${ent.name} [Nv.${ent.level}]`
            : ent.cooldown > 0
            ? `${ent.name} (Regenerando...)`
            : `${ent.name}`;
        const textW = ctx.measureText(label).width + 12;
        ctx.fillStyle = 'rgba(10, 8, 6, 0.86)';
        ctx.fillRect(ent.x - textW / 2, ent.y + ent.radius + 4, textW, 17);
        ctx.strokeStyle = 'rgba(212, 168, 67, 0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ent.x - textW / 2, ent.y + ent.radius + 4, textW, 17);

        ctx.fillStyle = ent.isBoss
          ? '#f4d068'
          : ent.kind === 'resource'
          ? '#6ee2ff'
          : '#ede3d2';
        ctx.fillText(label, ent.x, ent.y + ent.radius + 13);
        ctx.restore();
      });

      animFrameId = requestAnimationFrame(loop);
    }

    animFrameId = requestAnimationFrame(loop);
  }

  function stopHuntingCanvas() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  return {
    startHuntingCanvas,
    stopHuntingCanvas,
    spawnEntitiesForLocation
  };
})();
