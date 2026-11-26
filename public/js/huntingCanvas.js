/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/huntingCanvas.js
   Enhanced Real-Time Hunting Mode (hunt.php) on HTML5 Canvas:
   - Color-coded Monster Aggression Rings (Green/Yellow/Orange/Red)
   - Entity Filter Toggles (Todos, Criaturas, Recursos, Jefes)
   - Auto-Aggro Toggle (Agresión Automática)
   - Hover Inspection Tooltip (Creature Level/HP/Aggro/Drops or Resource Info)
   - Corner Minimap / Radar Overlay
   ========================================================================== */

window.GDL_HUNTING_CANVAS = (function () {
  'use strict';

  const ART = window.GDL_ART;
  const imgCache = {};
  let animFrameId = null;
  let entities = [];
  let activeLocId = null;
  let activeFilter = 'all';
  let autoAggro = false;
  let hoveredEntity = null;
  let aggroFrameCounter = 0;

  let callbacks = {
    onAttackCreature: null,
    onHarvestNode: null,
    onHoverEntity: null
  };

  function getBgImage(src) {
    if (!src) return null;
    if (imgCache[src]) return imgCache[src];
    const img = new Image();
    img.src = src;
    imgCache[src] = img;
    return img;
  }

  function getAggroColors(cr) {
    if (cr.isBoss || cr.aggro === 'boss') {
      return { ring: '#e6483b', fill: 'rgba(180, 28, 22, 0.84)', label: 'Rojo (Jefe / Alta Agresión)' };
    }
    if (cr.aggro === 'aggressive' || cr.isElite) {
      return { ring: '#ff8c24', fill: 'rgba(120, 52, 12, 0.84)', label: 'Naranja (Agresivo)' };
    }
    if (cr.aggro === 'moderate') {
      return { ring: '#f4d068', fill: 'rgba(64, 50, 16, 0.84)', label: 'Amarillo (Moderado)' };
    }
    return { ring: '#4ed679', fill: 'rgba(18, 56, 28, 0.84)', label: 'Verde (Pacífico 0-10%)' };
  }

  function spawnEntitiesForLocation(locObj) {
    entities = [];
    if (!locObj) return;

    const locCreatures = ART.CREATURES.filter((c) => c.loc === locObj.id);
    locCreatures.forEach((cr, idx) => {
      const ag = getAggroColors(cr);
      entities.push({
        kind: 'creature',
        id: cr.id,
        name: cr.name,
        level: cr.level,
        hp: cr.hp,
        atk: cr.atk,
        def: cr.def,
        icon: cr.icon,
        aggro: cr.aggro || 'moderate',
        aggroPct: cr.aggroPct !== undefined ? cr.aggroPct : 25,
        aggroRingColor: ag.ring,
        aggroFillColor: ag.fill,
        aggroLabel: ag.label,
        drops: cr.drops || [],
        isBoss: Boolean(cr.isBoss),
        isElite: Boolean(cr.isElite),
        x: 130 + ((idx * 175) % 520),
        y: 120 + ((idx * 85) % 180),
        vx: (idx % 2 === 0 ? 1 : -1) * (0.28 + idx * 0.06),
        vy: (idx % 2 === 0 ? -1 : 1) * 0.16,
        radius: cr.isBoss ? 30 : 24
      });
    });

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

  function isEntityVisible(ent) {
    if (activeFilter === 'creatures') return ent.kind === 'creature';
    if (activeFilter === 'resources') return ent.kind === 'resource';
    if (activeFilter === 'bosses') return ent.kind === 'creature' && (ent.isBoss || ent.isElite);
    return true;
  }

  function setHuntingOptions(opts) {
    if (!opts) return;
    if (opts.filter !== undefined) activeFilter = opts.filter;
    if (opts.autoAggro !== undefined) autoAggro = Boolean(opts.autoAggro);
  }

  function startHuntingCanvas(canvasId, locObj, cbs) {
    stopHuntingCanvas();
    callbacks = Object.assign(callbacks, cbs || {});
    if (cbs && cbs.filter !== undefined) activeFilter = cbs.filter;
    if (cbs && cbs.autoAggro !== undefined) autoAggro = Boolean(cbs.autoAggro);

    const canvas = document.getElementById(canvasId);
    if (!canvas || !locObj) return;

    if (activeLocId !== locObj.id || entities.length === 0) {
      activeLocId = locObj.id;
      spawnEntitiesForLocation(locObj);
    }

    const ctx = canvas.getContext('2d');
    const bgImg = getBgImage(locObj.img);

    function getMouseCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        mx: (e.clientX - rect.left) * scaleX,
        my: (e.clientY - rect.top) * scaleY
      };
    }

    function handleCanvasClick(e) {
      const { mx, my } = getMouseCoords(e);
      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        if (!isEntityVisible(ent)) continue;
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

    function handleCanvasMove(e) {
      const { mx, my } = getMouseCoords(e);
      let found = null;
      for (let i = entities.length - 1; i >= 0; i--) {
        const ent = entities[i];
        if (!isEntityVisible(ent)) continue;
        if (Math.hypot(mx - ent.x, my - ent.y) <= ent.radius + 10) {
          found = ent;
          break;
        }
      }
      if (hoveredEntity !== found) {
        hoveredEntity = found;
        if (callbacks.onHoverEntity) callbacks.onHoverEntity(found);
      }
    }

    canvas.onclick = handleCanvasClick;
    canvas.onmousemove = handleCanvasMove;

    function loop() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw HD Oil Background
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#14100c';
        ctx.fillRect(0, 0, w, h);
      }

      // Vignette overlay
      ctx.fillStyle = 'rgba(7, 6, 5, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // Auto-aggro check if enabled
      if (autoAggro) {
        aggroFrameCounter += 1;
        if (aggroFrameCounter > 260) {
          aggroFrameCounter = 0;
          const agCr = entities.find((e) => e.kind === 'creature' && isEntityVisible(e) && e.aggroPct >= 40);
          if (agCr && callbacks.onAttackCreature) {
            callbacks.onAttackCreature(agCr.id);
            return;
          }
        }
      }

      // 2. Update & Draw Entities
      entities.forEach((ent) => {
        if (ent.kind === 'creature') {
          ent.x += ent.vx;
          ent.y += ent.vy;
          if (ent.x < 70 || ent.x > w - 70) ent.vx *= -1;
          if (ent.y < 85 || ent.y > h - 75) ent.vy *= -1;
        } else if (ent.cooldown > 0) {
          ent.cooldown -= 1;
        }

        if (!isEntityVisible(ent)) return;

        ctx.save();
        // Outer Aggro Radius Halo for creatures
        if (ent.kind === 'creature') {
          ctx.beginPath();
          ctx.arc(ent.x, ent.y, ent.radius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = ent.aggroRingColor;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Ground ring
        ctx.beginPath();
        ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
        if (ent.kind === 'creature') {
          ctx.fillStyle = ent.aggroFillColor;
          ctx.strokeStyle = ent.aggroRingColor;
        } else {
          ctx.fillStyle =
            ent.cooldown > 0 ? 'rgba(30, 30, 30, 0.6)' : 'rgba(16, 38, 48, 0.85)';
          ctx.strokeStyle = ent.cooldown > 0 ? '#555' : ent.color || '#48b8e8';
        }
        ctx.lineWidth = ent.isBoss ? 3 : 2.2;
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
        ctx.strokeStyle = ent.kind === 'creature' ? ent.aggroRingColor : 'rgba(212, 168, 67, 0.45)';
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

      // 3. Corner Minimap / Radar Overlay (Top-Right)
      const mapW = 128;
      const mapH = 68;
      const mapX = w - mapW - 10;
      const mapY = 10;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 7, 6, 0.86)';
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth = 1.5;
      ctx.fillRect(mapX, mapY, mapW, mapH);
      ctx.strokeRect(mapX, mapY, mapW, mapH);

      ctx.fillStyle = '#f4d068';
      ctx.font = 'bold 9px Cinzel, serif';
      ctx.fillText('RADAR DE CAZA', mapX + 8, mapY + 11);

      entities.forEach((ent) => {
        if (!isEntityVisible(ent)) return;
        const rx = mapX + 6 + (ent.x / w) * (mapW - 12);
        const ry = mapY + 16 + (ent.y / h) * (mapH - 22);
        ctx.beginPath();
        ctx.arc(rx, ry, ent.isBoss ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle =
          ent.kind === 'resource'
            ? '#4ac0f0'
            : ent.aggroRingColor || '#e6483b';
        ctx.fill();
      });
      ctx.restore();

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
    spawnEntitiesForLocation,
    setHuntingOptions,
    getEntities: () => entities
  };
})();
