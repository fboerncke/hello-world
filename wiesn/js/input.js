'use strict';
// Tastatur, Maus und Touch (virtueller Joystick + Knöpfe)
G.input = (function () {
  const keys = new Set(), hits = new Set();
  const clicks = [];
  const MAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ShiftLeft: 'sprint', ShiftRight: 'sprint', KeyE: 'act', Enter: 'act', KeyF: 'act', Space: 'space',
    KeyM: 'map', Tab: 'map', Escape: 'back', KeyP: 'pause', KeyR: 'radio', KeyQ: 'back',
  };
  const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  let buttons = [];
  const touchBtn = new Map();
  let usedTouch = false;

  function press(n) { if (!keys.has(n)) hits.add(n); keys.add(n); }
  function release(n) { keys.delete(n); }

  window.addEventListener('keydown', (e) => {
    const n = MAP[e.code];
    if (n) { press(n); e.preventDefault(); }
    G.audio.init();
  });
  window.addEventListener('keyup', (e) => { const n = MAP[e.code]; if (n) release(n); });
  window.addEventListener('blur', () => keys.clear());

  const cv = () => document.getElementById('c');
  window.addEventListener('mousedown', (e) => { G.audio.init(); clicks.push({ x: e.clientX, y: e.clientY }); });

  function btnAt(x, y) {
    for (const b of buttons) if (Math.hypot(x - b.x, y - b.y) < b.r * 1.15) return b;
    return null;
  }
  window.addEventListener('touchstart', (e) => {
    usedTouch = true; G.audio.init();
    for (const t of e.changedTouches) {
      const b = btnAt(t.clientX, t.clientY);
      clicks.push({ x: t.clientX, y: t.clientY, touch: true });
      if (b) { touchBtn.set(t.identifier, b.name); press(b.name); }
      else if (t.clientX < window.innerWidth * 0.5 && joy.id === null && G.ui && G.ui.wantsJoystick()) { joy.id = t.identifier; joy.ox = t.clientX; joy.oy = t.clientY; joy.x = 0; joy.y = 0; }
    }
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === joy.id) {
        const dx = t.clientX - joy.ox, dy = t.clientY - joy.oy, d = Math.hypot(dx, dy), m = 55;
        joy.x = d > m ? dx / d : dx / m; joy.y = d > m ? dy / d : dy / m;
      }
    }
    e.preventDefault();
  }, { passive: false });
  const end = (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === joy.id) { joy.id = null; joy.x = 0; joy.y = 0; }
      const n = touchBtn.get(t.identifier);
      if (n) { touchBtn.delete(t.identifier); if (![...touchBtn.values()].includes(n)) release(n); }
    }
    e.preventDefault();
  };
  window.addEventListener('touchend', end, { passive: false });
  window.addEventListener('touchcancel', end, { passive: false });

  return {
    down: (n) => keys.has(n),
    hit: (n) => hits.has(n),
    axis() {
      let x = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
      let y = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
      x += joy.x; y += joy.y;
      const l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; }
      return { x, y };
    },
    takeClicks() { const c = clicks.splice(0); return c; },
    endFrame() { hits.clear(); },
    consume(n) { hits.delete(n); },
    setButtons(b) { buttons = b; },
    get buttons() { return buttons; },
    get joy() { return joy; },
    get usedTouch() { return usedTouch; },
    clear() { keys.clear(); hits.clear(); },
  };
})();
