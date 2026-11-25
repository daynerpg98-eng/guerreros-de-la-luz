# Guerreros de la LUZ — Crónicas de Asteria (Edición Completa HD)

**MMORPG Táctico Web en Español** inspirado en *Asteria / Legend: Legacy of the Dragons (Faeo)*, con escenarios panorámicos 16:9 y retratos 1:1 pintados al óleo en HD, motor autónomo persistente en el navegador (`localStorage`) y todas las estancias finales completadas.

🌐 **Jugar Ahora (GitHub Pages):** [https://daynerpg98-eng.github.io/guerreros-de-la-luz/](https://daynerpg98-eng.github.io/guerreros-de-la-luz/)

---

## Contenido Completo de la Versión Final

### 1. Las 7 Locaciones Panorámicas HD (`16:9` pintadas al óleo) y Estancias Finales
- **Ciudadela de la Luz** (`assets/locations/ciudadela_luz.jpg`) — *Bastión Capital de la Orden Solar*
- **Llanuras del Alba** (`assets/locations/llanuras_alba.jpg`) — *Campos de Batalla de los Antiguos Reyes*
- **Bosque de los Ecos** (`assets/locations/bosque_ecos.jpg`) — *Arboleda de los Monolitos Rúnicos (Jefe: Sylvaris)*
- **Lago del Espejo** (`assets/locations/lago_espejo.jpg`) — *Santuario Subterráneo de las Estrellas (Jefe: Astraios, Leviatán Estelar)*
- **Cuevas Cristalinas** (`assets/locations/cuevas_cristalinas.jpg`) — *Estancia Final I: Bóvedas de Luminita Profunda (Jefe: Krystallos, Soberano de Cuarzo)*
- **Templo Antiguo** (`assets/locations/templo_antiguo.jpg`) — *Estancia Final II: Santuario del Rayo Celestial (Jefe: Archinquisidor Vaelen)*
- **Frontera de Ceniza** (`assets/locations/frontera_ceniza.jpg`) — *Estancia Final Suprema: Ciudadela del Eclipse y del Dragón (Jefes: Dragón Vorathax y Emperador Malakor)*

### 2. Retratos HD `1:1` de NPCs y 11 Maestres Interactivos
- **Comandante Aurelius** (`assets/npcs/npc_comandante_aurelius.jpg`) — Misiones de la Orden, Medallas y Clanes
- **Herrero Korgan** (`assets/npcs/npc_herrero_korgan.jpg`) — Herrería, Armamento y las 6 Profesiones
- **Alquimista Selene** (`assets/npcs/npc_alquimista_selene.jpg`) — Elixires, Cubo Éltico y Espejo Mágico
- **Explorador Lyon** (`assets/npcs/npc_explorador_lyon.jpg`) — Modo Caza, Mascotas y Monturas (`Ignifer`)
- Además de *Tabernero Balthus*, *Archimago Valerion*, *Domador Real Varek*, *Archidruida Aelion*, *Oráculo Miriel*, *Arcanista Mayor Orian*, *Sumo Custodio Solaris* y *General Auron Espada-Solar*.

### 3. Sistemas Tácticos y Especiales (`public/js/`)
- **Combate Direccional de 3 Zonas y Super-Golpes (`combatCanvas.js` + `mainViews.js`)**: Apunta a *Cabeza*, *Torso* o *Piernas*, cubre tu guardia y encadena secuencias de 3 impactos para desatar *Quebrantasoles de Aurelius*, *Ejecución de Korgan* o *Tempestad del Eclipse*.
- **Modo Caza en Tiempo Real (`huntingCanvas.js`)**: Lienzo HTML5 interactivo con criaturas en movimiento y vetas/recursos recolectables.
- **Ragdoll Dinámico en Canvas (`avatarCanvas.js`)**: Renderizado en vivo del guerrero con su armadura, arma, escudo, yelmo, manto, halo solar y el aura ígnea de **Ignifer**.
- **Sistemas Especiales Ilustrados en HD (`specialModals.js`)**:
  - **Cubo Éltico**: Síntesis y transmutación de reliquias míticas (*Aethel-Valkyr*, *Hoja Prismática*, *Armadura del Templo*).
  - **6 Profesiones**: *Minería Rúnica*, *Herbolaria Solar*, *Pesca Astral*, *Herrería de Guerra*, *Alquimia Suprema* y *Joyería Arcana*.
  - **Monturas (`Ignifer`) y Mascotas de Combate**: Asistencia de daño automático en cada turno.
  - **Panteón de Medallas**, **Espejo Mágico de Solaria**, **Dados de Taberna** y **Coliseo de Arena PvP + Clanes** contra los **16 Guerreros IA en español**.
