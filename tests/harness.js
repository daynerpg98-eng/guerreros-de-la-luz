/**
 * GUERREROS DE LA LUZ — Zero-Dependency Sandboxed DOM, Canvas & VM Harness
 * Loads `public/index.html` and executes all client JS modules inside an isolated
 * Node.js `vm` context so E2E tests can interact with the application both through
 * real DOM events/elements and through the `window.GDL_*` interface contracts.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

class MiniClassList {
  constructor(el) {
    this.el = el;
  }
  _getSet() {
    const raw = (this.el.attributes['class'] || '').trim();
    return new Set(raw ? raw.split(/\s+/) : []);
  }
  _saveSet(set) {
    this.el.attributes['class'] = Array.from(set).join(' ');
  }
  add(...tokens) {
    const s = this._getSet();
    tokens.forEach((t) => { if (t) s.add(t); });
    this._saveSet(s);
  }
  remove(...tokens) {
    const s = this._getSet();
    tokens.forEach((t) => s.delete(t));
    this._saveSet(s);
  }
  toggle(token, force) {
    const s = this._getSet();
    const has = s.has(token);
    const shouldHave = force !== undefined ? Boolean(force) : !has;
    if (shouldHave) s.add(token);
    else s.delete(token);
    this._saveSet(s);
    return shouldHave;
  }
  contains(token) {
    return this._getSet().has(token);
  }
}

class MiniCanvasContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ops = [];
    this.fillStyle = '#000';
    this.strokeStyle = '#000';
    this.lineWidth = 1;
    this.font = '12px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.shadowColor = 'rgba(0,0,0,0)';
    this.shadowBlur = 0;
    this.globalAlpha = 1;
  }
  clearRect(x, y, w, h) { this.ops.push({ op: 'clearRect', x, y, w, h }); }
  fillRect(x, y, w, h) { this.ops.push({ op: 'fillRect', x, y, w, h, fillStyle: this.fillStyle }); }
  strokeRect(x, y, w, h) { this.ops.push({ op: 'strokeRect', x, y, w, h, strokeStyle: this.strokeStyle }); }
  beginPath() { this.ops.push({ op: 'beginPath' }); }
  closePath() { this.ops.push({ op: 'closePath' }); }
  moveTo(x, y) { this.ops.push({ op: 'moveTo', x, y }); }
  lineTo(x, y) { this.ops.push({ op: 'lineTo', x, y }); }
  quadraticCurveTo(cpx, cpy, x, y) { this.ops.push({ op: 'quadraticCurveTo', cpx, cpy, x, y }); }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this.ops.push({ op: 'bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y }); }
  arc(x, y, r, sAngle, eAngle, ccw) { this.ops.push({ op: 'arc', x, y, r, sAngle, eAngle, ccw }); }
  ellipse(x, y, rx, ry, rot, sAngle, eAngle) { this.ops.push({ op: 'ellipse', x, y, rx, ry, rot, sAngle, eAngle }); }
  roundRect(x, y, w, h, r) { this.ops.push({ op: 'roundRect', x, y, w, h, r }); }
  rect(x, y, w, h) { this.ops.push({ op: 'rect', x, y, w, h }); }
  fill() { this.ops.push({ op: 'fill', fillStyle: this.fillStyle }); }
  stroke() { this.ops.push({ op: 'stroke', strokeStyle: this.strokeStyle, lineWidth: this.lineWidth }); }
  fillText(text, x, y) { this.ops.push({ op: 'fillText', text: String(text), x, y, fillStyle: this.fillStyle, font: this.font }); }
  strokeText(text, x, y) { this.ops.push({ op: 'strokeText', text: String(text), x, y }); }
  measureText(text) { return { width: String(text || '').length * 7 }; }
  drawImage(img, ...args) { this.ops.push({ op: 'drawImage', src: img && img.src, args }); }
  save() { this.ops.push({ op: 'save' }); }
  restore() { this.ops.push({ op: 'restore' }); }
  translate(x, y) { this.ops.push({ op: 'translate', x, y }); }
  rotate(angle) { this.ops.push({ op: 'rotate', angle }); }
  scale(x, y) { this.ops.push({ op: 'scale', x, y }); }
  setLineDash(segments) { this.ops.push({ op: 'setLineDash', segments }); }
  createLinearGradient(x0, y0, x1, y1) {
    return { kind: 'linearGradient', x0, y0, x1, y1, stops: [], addColorStop(offset, color) { this.stops.push({ offset, color }); } };
  }
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return { kind: 'radialGradient', x0, y0, r0, x1, y1, r1, stops: [], addColorStop(offset, color) { this.stops.push({ offset, color }); } };
  }
}

class MiniElement {
  constructor(tagName, ownerDocument) {
    this.tagName = String(tagName || 'DIV').toUpperCase();
    this.ownerDocument = ownerDocument;
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.listeners = {};
    this.classList = new MiniClassList(this);
    this._textContent = '';
    this._value = undefined;
    this.checked = false;
    this.onclick = null;
    this.onmousemove = null;
    this.onmouseleave = null;
    this.onchange = null;
    this.onkeydown = null;
    this._ctx2d = null;
  }

  get value() {
    if (this._value !== undefined) return this._value;
    if (this.tagName === 'TEXTAREA') return this.textContent;
    return this.attributes['value'] || '';
  }
  set value(v) {
    this._value = v === null || v === undefined ? '' : String(v);
  }

  get id() { return this.attributes['id'] || ''; }
  set id(v) { this.attributes['id'] = String(v); }

  get className() { return this.attributes['class'] || ''; }
  set className(v) { this.attributes['class'] = String(v); }

  get disabled() { return this.attributes['disabled'] !== undefined; }
  set disabled(v) {
    if (v) this.attributes['disabled'] = 'disabled';
    else delete this.attributes['disabled'];
  }

  get width() { return Number(this.attributes['width'] || 300); }
  set width(v) { this.attributes['width'] = String(v); }

  get height() { return Number(this.attributes['height'] || 150); }
  set height(v) { this.attributes['height'] = String(v); }

  get dataset() {
    const proxy = {};
    for (const [k, v] of Object.entries(this.attributes)) {
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        proxy[camel] = v;
      }
    }
    return proxy;
  }

  setAttribute(name, val) {
    const k = String(name).toLowerCase();
    this.attributes[k] = String(val);
    if (k === 'value') this.value = String(val);
    if (k === 'checked') this.checked = true;
  }

  getAttribute(name) {
    const k = String(name).toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null;
  }

  hasAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, String(name).toLowerCase());
  }

  removeAttribute(name) {
    delete this.attributes[String(name).toLowerCase()];
  }

  appendChild(child) {
    if (!child) return child;
    if (child.parentNode) {
      const idx = child.parentNode.children.indexOf(child);
      if (idx !== -1) child.parentNode.children.splice(idx, 1);
    }
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => c.textContent).join('');
  }

  set textContent(v) {
    this.children = [];
    this._textContent = v === null || v === undefined ? '' : String(v);
  }

  get innerHTML() {
    if (this.children.length === 0) return this._textContent;
    return this.children.map((c) => c.outerHTML).join('');
  }

  set innerHTML(html) {
    this.children = [];
    this._textContent = '';
    const str = html === null || html === undefined ? '' : String(html);
    if (!str) return;
    const parsedNodes = parseHtmlFragment(str, this.ownerDocument);
    parsedNodes.slice().forEach((n) => this.appendChild(n));
  }

  get outerHTML() {
    const tag = this.tagName.toLowerCase();
    if (tag === '#text') return this._textContent;
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
      .join(' ');
    const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
    if (SELF_CLOSING_TAGS.has(tag)) return open;
    return `${open}${this.innerHTML}</${tag}>`;
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((f) => f !== fn);
  }

  dispatchEvent(evt) {
    const e = Object.assign({
      type: 'click',
      target: this,
      currentTarget: this,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.propagationStopped = true; }
    }, evt || {});
    const list = this.listeners[e.type] || [];
    list.forEach((fn) => fn.call(this, e));
    if (e.type === 'click' && typeof this.onclick === 'function') this.onclick.call(this, e);
    if (e.type === 'mousemove' && typeof this.onmousemove === 'function') this.onmousemove.call(this, e);
    if (e.type === 'mouseleave' && typeof this.onmouseleave === 'function') this.onmouseleave.call(this, e);
    if (e.type === 'change' && typeof this.onchange === 'function') this.onchange.call(this, e);
    if (e.type === 'keydown' && typeof this.onkeydown === 'function') this.onkeydown.call(this, e);
    return !e.defaultPrevented;
  }

  click(extra = {}) {
    if (this.disabled) return;
    this.dispatchEvent(Object.assign({ type: 'click', clientX: 150, clientY: 150 }, extra));
  }

  focus() {}
  blur() {}

  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.width || 860, height: this.height || 390, right: this.width || 860, bottom: this.height || 390 };
  }

  getContext(type) {
    if (type === '2d') {
      if (!this._ctx2d) this._ctx2d = new MiniCanvasContext2D(this);
      return this._ctx2d;
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const selectors = String(selector).split(',').map((s) => s.trim()).filter(Boolean);
    const visit = (node) => {
      for (const child of node.children) {
        if (child.tagName !== '#TEXT') {
          if (selectors.some((sel) => matchesCompoundSelector(child, sel))) {
            results.push(child);
          }
          visit(child);
        }
      }
    };
    visit(this);
    return results;
  }

  closest(selector) {
    let cur = this;
    while (cur && cur.tagName !== '#DOCUMENT') {
      if (matchesCompoundSelector(cur, selector)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }
}

function matchesSimpleSelector(el, sel) {
  if (!el || el.tagName === '#TEXT' || !sel) return false;
  // Handle compound tokens like button.btn-asteria[data-foo="bar"]#my-id
  const attrRegex = /\[([a-zA-Z0-9_-]+)(?:=["']?([^"'\]]*)["']?)?\]/g;
  let remaining = sel;
  let m;
  while ((m = attrRegex.exec(sel)) !== null) {
    const attrName = m[1].toLowerCase();
    const attrVal = m[2];
    if (!el.hasAttribute(attrName)) return false;
    if (attrVal !== undefined && el.getAttribute(attrName) !== attrVal) return false;
  }
  remaining = remaining.replace(attrRegex, '');

  const idMatch = remaining.match(/#([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    if (el.id !== idMatch[1]) return false;
    remaining = remaining.replace(idMatch[0], '');
  }

  const classMatches = remaining.match(/\.([a-zA-Z0-9_-]+)/g);
  if (classMatches) {
    for (const cm of classMatches) {
      if (!el.classList.contains(cm.slice(1))) return false;
    }
    remaining = remaining.replace(/\.([a-zA-Z0-9_-]+)/g, '');
  }

  const tag = remaining.trim();
  if (tag && tag !== '*' && el.tagName !== tag.toUpperCase()) return false;
  return true;
}

function matchesCompoundSelector(el, selector) {
  const parts = selector.trim().split(/\s+/);
  if (parts.length === 1) return matchesSimpleSelector(el, parts[0]);
  if (!matchesSimpleSelector(el, parts[parts.length - 1])) return false;
  let cur = el.parentNode;
  for (let i = parts.length - 2; i >= 0; i--) {
    while (cur && !matchesSimpleSelector(cur, parts[i])) {
      cur = cur.parentNode;
    }
    if (!cur) return false;
    cur = cur.parentNode;
  }
  return true;
}

function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function parseAttributes(attrString, el) {
  if (!attrString) return;
  const regex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    const name = match[1].toLowerCase();
    const val = match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : '';
    el.setAttribute(name, decodeHtmlEntities(val));
  }
}

function parseHtmlFragment(html, ownerDocument) {
  const clean = String(html).replace(/<!--[\s\S]*?-->/g, '');
  const root = new MiniElement('#FRAGMENT', ownerDocument);
  const stack = [root];

  const tokenRegex = /<\/?([a-zA-Z0-9-]+)([^>]*)>|([^<]+)/g;
  let match;
  while ((match = tokenRegex.exec(clean)) !== null) {
    const full = match[0];
    if (match[3] !== undefined) {
      const txt = decodeHtmlEntities(match[3]);
      if (txt.trim().length > 0) {
        const current = stack[stack.length - 1];
        if (current.children.length === 0) {
          current._textContent += txt;
        } else {
          const textNode = new MiniElement('#TEXT', ownerDocument);
          textNode._textContent = txt;
          current.appendChild(textNode);
        }
      }
      continue;
    }

    const tagName = match[1].toLowerCase();
    const attrPart = match[2] || '';
    const isClosing = full.startsWith('</');
    const isSelfClosing = SELF_CLOSING_TAGS.has(tagName) || /\/\s*>$/.test(full);

    if (isClosing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName.toLowerCase() === tagName) {
          stack.length = i;
          break;
        }
      }
    } else {
      const el = new MiniElement(tagName, ownerDocument);
      parseAttributes(attrPart.replace(/\/\s*$/, ''), el);
      stack[stack.length - 1].appendChild(el);
      if (!isSelfClosing) {
        stack.push(el);
      }
    }
  }

  return root.children;
}

class MiniDocument {
  constructor(htmlString) {
    this.readyState = 'complete';
    this.documentElement = new MiniElement('html', this);
    this.body = new MiniElement('body', this);
    this.head = new MiniElement('head', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.listeners = {};

    const bodyMatch = String(htmlString).match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : htmlString;
    this.body.innerHTML = bodyContent;
  }

  createElement(tag) {
    return new MiniElement(tag, this);
  }

  getElementById(id) {
    return this.body.querySelector(`#${id}`) || this.head.querySelector(`#${id}`) || null;
  }

  querySelector(sel) {
    return this.body.querySelector(sel) || this.head.querySelector(sel) || null;
  }

  querySelectorAll(sel) {
    return [...this.head.querySelectorAll(sel), ...this.body.querySelectorAll(sel)];
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
}

/**
 * Creates a fresh isolated browser VM instance running Guerreros de la LUZ.
 * @param {Object} options
 * @param {Object} [options.initialLocalStorage] - Key/value map preloaded into localStorage before scripts boot
 * @param {number|function} [options.random] - Optional deterministic Math.random value or generator function
 * @param {string} [options.promptReturn] - Value returned by window.prompt()
 * @param {boolean} [options.useRootFiles] - Load from root `/` instead of `public/`
 */
function createGameEnv(options = {}) {
  const baseDir = options.useRootFiles ? ROOT_DIR : PUBLIC_DIR;
  const htmlPath = path.join(baseDir, 'index.html');
  const htmlString = fs.readFileSync(htmlPath, 'utf8');
  const document = new MiniDocument(htmlString);

  const storageMap = new Map();
  if (options.initialLocalStorage) {
    for (const [k, v] of Object.entries(options.initialLocalStorage)) {
      storageMap.set(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
  }

  const localStorage = {
    getItem(k) { return storageMap.has(k) ? storageMap.get(k) : null; },
    setItem(k, v) { storageMap.set(k, String(v)); },
    removeItem(k) { storageMap.delete(k); },
    clear() { storageMap.clear(); },
    _dump() { return Object.fromEntries(storageMap.entries()); }
  };

  let rafNextId = 1;
  const rafQueue = new Map();
  function requestAnimationFrame(cb) {
    const id = rafNextId++;
    rafQueue.set(id, cb);
    return id;
  }
  function cancelAnimationFrame(id) {
    rafQueue.delete(id);
  }
  function stepAnimationFrames(count = 1) {
    for (let i = 0; i < count; i++) {
      const currentEntries = Array.from(rafQueue.entries());
      if (currentEntries.length === 0) break;
      for (const [id, cb] of currentEntries) {
        if (rafQueue.has(id)) {
          rafQueue.delete(id);
          cb(Date.now());
        }
      }
    }
  }

  const mathObj = Object.create(Math);
  if (typeof options.random === 'number') {
    mathObj.random = () => options.random;
  } else if (typeof options.random === 'function') {
    mathObj.random = options.random;
  }

  class MockImage {
    constructor() {
      this.src = '';
      this.complete = true;
      this.naturalWidth = 1280;
      this.naturalHeight = 720;
    }
  }

  class MockAudioContext {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.destination = {};
    }
    resume() { this.state = 'running'; }
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start() {},
        stop() {}
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      };
    }
  }

  let promptReturn = options.promptReturn !== undefined ? options.promptReturn : 'Valerius';
  const alerts = [];

  const sandbox = {
    console,
    Math: mathObj,
    Date,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
    Error,
    TypeError,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    escape,
    unescape,
    btoa: (str) => Buffer.from(String(str), 'binary').toString('base64'),
    atob: (b64) => Buffer.from(String(b64), 'base64').toString('binary'),
    performance: { now: () => Date.now() },
    localStorage,
    document,
    Image: MockImage,
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    requestAnimationFrame,
    cancelAnimationFrame,
    setTimeout: () => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    prompt: () => promptReturn,
    alert: (msg) => alerts.push(String(msg)),
    confirm: () => true,
    URL: {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: () => {}
    },
    Blob: class MockBlob {
      constructor(parts, opts) { this.parts = parts; this.opts = opts; }
    }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);

  // Extract script tags from index.html in exact load order
  const scriptRegex = /<script\s+src=["']([^"']+)["']\s*><\/script>/gi;
  const scripts = [];
  let sm;
  while ((sm = scriptRegex.exec(htmlString)) !== null) {
    scripts.push(sm[1]);
  }

  for (const relScript of scripts) {
    const absScript = path.join(baseDir, relScript);
    const code = fs.readFileSync(absScript, 'utf8');
    vm.runInContext(code, context, { filename: absScript });
  }

  return {
    window: sandbox,
    document,
    localStorage,
    rafQueue,
    stepAnimationFrames,
    setPromptReturn(val) { promptReturn = val; },
    setRandom(fnOrVal) {
      if (typeof fnOrVal === 'number') mathObj.random = () => fnOrVal;
      else if (typeof fnOrVal === 'function') mathObj.random = fnOrVal;
      else mathObj.random = Math.random;
    },
    alerts
  };
}

module.exports = {
  ROOT_DIR,
  PUBLIC_DIR,
  createGameEnv
};
