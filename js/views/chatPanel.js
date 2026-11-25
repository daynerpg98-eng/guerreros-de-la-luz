/* ==========================================================================
   GUERREROS DE LA LUZ — public/js/views/chatPanel.js
   Live Chronicle Log + Multi-Channel Tavern & Clan Chat with the 16 Spanish
   AI Warriors of Asteria
   ========================================================================== */

window.GDL_CHAT = (function () {
  'use strict';

  const ART = window.GDL_ART;

  const AI_CHATTER_LINES = [
    { author: 'Valerius_El_Justo', channel: 'general', text: '¡Que la luz de la Ciudadela guíe vuestras espadas en las Llanuras del Alba!' },
    { author: 'Lyra_Flecha_Astral', channel: 'general', text: 'Acabo de recolectar 4 Flores de Rocío Solar en el Modo Caza del Bosque de los Ecos.' },
    { author: 'Kaelen_Martillo', channel: 'comercio', text: 'Compro Cristales de Luminita de las Cuevas Cristalinas. El Herrero Korgan paga bien.' },
    { author: 'Seraphina_Luz', channel: 'general', text: 'Recuerden encadenar Cabeza → Torso → Cabeza para activar el Super-Golpe Quebrantasoles.' },
    { author: 'Casandra_Prisma', channel: 'general', text: 'Krystallos es durísimo en las Cuevas Cristalinas, lleven Panacea Real de Selene.' },
    { author: 'Arthas_Leon_Solar', channel: 'clan', text: '¡Busco retadores dignos en el Coliseo de Arena PvP! Mi Aethel-Valkyr está lista.' },
    { author: 'Mordecai_Obsidiana', channel: 'general', text: 'El Dragón Vorathax sobrevuela la Frontera de Ceniza... solo los niveles altos sobrevivirán.' },
    { author: 'Nerea_Del_Espejo', channel: 'general', text: 'El Espejo Mágico del Lago del Espejo me acaba de bendecir con +3 de Sabiduría permanente.' }
  ];

  let messages = [
    {
      time: 'Alba',
      channel: 'sistema',
      author: 'Crónica de Asteria',
      text: 'Bienvenido a Guerreros de la LUZ. Motor autónomo persistente activo con las 7 regiones HD y las estancias finales.'
    },
    {
      time: 'Alba',
      channel: 'general',
      author: 'Comandante Aurelius',
      text: 'Guerrero, habla conmigo en la Ciudadela de la Luz o entra al Modo Caza para iniciar tu leyenda.'
    }
  ];

  let activeFilter = 'todos';

  function addSystemMessage(text, channel = 'sistema') {
    const time = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    messages.unshift({ time, channel, author: 'Crónica', text });
    if (messages.length > 70) messages.pop();
    renderChatFeed();
  }

  function addPlayerMessage(heroName, text) {
    if (!text || !text.trim()) return;
    const time = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const ch = activeFilter === 'todos' || activeFilter === 'sistema' ? 'general' : activeFilter;
    messages.unshift({ time, channel: ch, author: heroName, text: text.trim() });

    // Trigger contextual AI Warrior reply
    setTimeout(() => {
      const pick = AI_CHATTER_LINES[Math.floor(Math.random() * AI_CHATTER_LINES.length)];
      const rTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      messages.unshift({
        time: rTime,
        channel: pick.channel,
        author: pick.author,
        text: pick.text
      });
      renderChatFeed();
    }, 1200);

    renderChatFeed();
  }

  function triggerAmbientChatter() {
    const pick = AI_CHATTER_LINES[Math.floor(Math.random() * AI_CHATTER_LINES.length)];
    const time = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    messages.unshift({
      time,
      channel: pick.channel,
      author: pick.author,
      text: pick.text
    });
    if (messages.length > 70) messages.pop();
    renderChatFeed();
  }

  function renderChatFeed() {
    const feedEl = document.getElementById('gdl-chat-feed');
    if (!feedEl) return;

    const filtered =
      activeFilter === 'todos'
        ? messages
        : messages.filter((m) => m.channel === activeFilter);

    feedEl.innerHTML = filtered
      .map(
        (m) => `
        <div class="chat-msg-line ch-${m.channel}">
          <span class="chat-time">[${m.time}]</span>
          <span class="chat-tag">[${m.channel.toUpperCase()}]</span>
          <strong class="chat-author">${m.author}:</strong>
          <span class="chat-text">${m.text}</span>
        </div>
      `
      )
      .join('');
  }

  function initChatPanel(getHeroName) {
    document.querySelectorAll('[data-chat-ch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-chat-ch');
        document.querySelectorAll('[data-chat-ch]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-chat-ch') === activeFilter);
        });
        renderChatFeed();
      });
    });

    const input = document.getElementById('gdl-chat-input');
    const sendBtn = document.getElementById('gdl-chat-send');
    if (input && sendBtn) {
      const submit = () => {
        if (input.value.trim()) {
          addPlayerMessage(getHeroName(), input.value);
          input.value = '';
        }
      };
      sendBtn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
    }

    renderChatFeed();
    setInterval(triggerAmbientChatter, 28000);
  }

  return {
    addSystemMessage,
    addPlayerMessage,
    initChatPanel,
    renderChatFeed
  };
})();
