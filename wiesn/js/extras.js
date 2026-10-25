'use strict';
// Erweiterungen: Oide-Wiesn-Attraktionen, Hau den Lukas, Dosenwerfen, Schiffschaukel,
// Einzug der Wiesnwirte, Zufallsereignisse, Roller-Rennen gegen Ferdl und Erfolge.

// =====================================================================
// Zusätzliches Wiesn-Wissen
// =====================================================================
G.FACTS.push(
  { id: 'tobmatte', title: 'Auf der Kokosmatte', text: 'Am Toboggan rutscht man auf Kokosmatten die Holzrutsche hinunter. Helfer tragen die Mattenstapel wieder nach oben – und reichen Kindern auf Wunsch die Hand.' },
  { id: 'zwoelf', title: 'Zwölf Böllerschüsse', text: 'Nach dem Anstich im Schottenhamel werden vor der Bavaria zwölf Böllerschüsse abgefeuert – das Signal an alle anderen Festzelte: Die Wiesn ist eröffnet!' },
  { id: 'kindl', title: 'Das Münchner Kindl', text: 'Beim Einzug der Wiesnwirte reitet das Münchner Kindl vorneweg. Direkt dahinter fährt der Oberbürgermeister in der Festkutsche der Wirtsfamilie Schottenhamel.' },
  { id: 'brauereien', title: 'Sechs Prachtgespanne', text: 'Beim Einzug fahren alle sechs Münchner Oktoberfest-Brauereien mit großen Prachtgespannen über die Wirtsbudenstraße auf die Wiesn.' },
  { id: 'lukas', title: 'Hau den Lukas', text: 'Beim „Hau den Lukas“ schlägt man mit einem Hammer auf einen Knopf – ein Metallkörper saust nach oben und im besten Fall klingelt die Glocke. Es gibt auch kleinere Versionen für Kinder.' },
  { id: 'kalb', title: 'Kettenflieger Kalb', text: 'Der Kettenflieger Kalb auf der Oidn Wiesn stammt aus dem Jahr 1919 – über 100 Jahre alt und dreht sich immer noch!' },
  { id: 'schaukel', title: 'Die Schiffschaukel', text: 'Auf der Oidn Wiesn gibt es noch die gute alte Schiffschaukel. Schwung holt man selbst – mit Ziehen und Gewicht verlagern.' },
  { id: 'museum', title: 'Das Museumszelt', text: 'Im Museumszelt der Oidn Wiesn erfährt man viel über die Geschichte des Oktoberfests. Dort steht auch ein Nachbau des Velodroms, auf dem Kinder Hochräder ausprobieren können.' },
  { id: 'dosen', title: 'Wurfbuden', text: 'An den Wurf- und Schießbuden wird mit Bällen, Luftgewehr oder Armbrust auf Ziele gezielt. Wer gut trifft, gewinnt einen kleinen Preis.' },
);
G.HEART_FACTS.push('tobmatte', 'kalb');
G.world.heartSpots.push([1100, 1080], [2830, 1650]);

// =====================================================================
// ERFOLGE
// =====================================================================
G.trophies = (function () {
  const LIST = [
    ['tob_clean', 'Profi am Förderband', 'Toboggan ohne einen einzigen Sturz geschafft'],
    ['tob_laugh', 'Publikumsliebling', 'Dreimal auf dem Toboggan-Förderband gepurzelt'],
    ['tr_win', 'Sitzfleisch', 'Das Teufelsrad gewonnen'],
    ['meister', 'Teufelsrad-Meister', 'Die Meisterrunde gewonnen'],
    ['lukas', 'Glockenschlag', 'Beim Hau den Lukas die Glocke geläutet'],
    ['dosen', 'Dosen-Abräumer', 'Alle Dosen auf einmal abgeräumt'],
    ['schaukel', 'Himmelsstürmer', 'Mit der Schiffschaukel ganz nach oben geschaukelt'],
    ['rennen', 'Roller-König', 'Das Roller-Rennen gegen Ferdl gewonnen'],
    ['kind', 'Schutzengel', 'Ein verlorenes Kind zum Servicezentrum gebracht'],
    ['ballon', 'Ballonfänger', 'Einen davonfliegenden Luftballon gefangen'],
    ['waldi', 'Hundeflüsterer', 'Dackel Waldi eingefangen'],
    ['schmankerl', 'Feinschmecker', 'Alle sechs Wiesn-Schmankerl probiert'],
    ['herzen', 'Herzensbrecher', 'Alle Lebkuchenherzen gefunden'],
    ['erwischt', 'Ups!', 'Von den Ordnern erwischt worden'],
    ['einzug', 'Zaungast', 'Den Einzug der Wiesnwirte gesehen'],
    ['riesenrad', 'Über den Dächern', 'Mit dem Riesenrad gefahren'],
    ['rundfahrt', 'Wiesn-Rundfahrt', 'Riesenrad, Wellenflug, Krinoline, Autoscooter, Kettenflieger und Schiffschaukel gefahren'],
    ['legende', 'Wiesn-Legende', 'Alle Story-Missionen geschafft'],
  ];
  const got = new Set();
  const rides = new Set();
  const food = new Set();
  function unlock(id) {
    if (got.has(id)) return;
    const t = LIST.find(x => x[0] === id); if (!t) return;
    got.add(id);
    G.audio.sfx.bell();
    G.ui.toast('🏆 ERFOLG: „' + t[1] + '“ – ' + t[2], 5);
    if (G.game) G.game.addGaudi(10);
    if (got.size === LIST.length - 0 && id !== 'alle') G.ui.toast('🏆 Alle Erfolge gesammelt! Du bist der Wahnsinn!', 6);
  }
  function ride(kind) { rides.add(kind); if (['riesenrad', 'wellenflug', 'krinoline', 'autoscooter', 'kalb', 'schaukel'].every(k => rides.has(k))) unlock('rundfahrt'); }
  function ate(kind) { food.add(kind); if (food.size >= 6) unlock('schmankerl'); }
  function drawList(ctx, x0, y, cw, H, scroll) {
    txt(ctx, 'Erfolge: ' + got.size + ' / ' + LIST.length, x0, y, 15, '#ffd84a', 'left', null);
    y += 30;
    for (const [id, title, desc] of LIST.slice(scroll || 0)) {
      const has = got.has(id);
      txt(ctx, (has ? '🏆 ' : '○ ') + title, x0, y, 16, has ? '#ffd84a' : '#777', 'left', null);
      txt(ctx, desc, x0 + 26, y + 19, 13, has ? '#eee' : '#666', 'left', null, 0, '700 ');
      y += 44;
      if (y > H - 70) break;
    }
    return y;
  }
  return {
    LIST, unlock, ride, ate, drawList,
    has: (id) => got.has(id),
    save() { return { got: [...got], rides: [...rides], food: [...food] }; },
    load(o) { got.clear(); rides.clear(); food.clear(); if (!o) return; (o.got || []).forEach(x => got.add(x)); (o.rides || []).forEach(x => rides.add(x)); (o.food || []).forEach(x => food.add(x)); },
  };
})();

// =====================================================================
// NEUE ORTE IN DER WELT
// =====================================================================
(function () {
  const WD = G.world;
  const addRect = (x, y, w, h) => WD.solids.push({ t: 'r', x, y, w, h });
  const addCirc = (x, y, r) => WD.solids.push({ t: 'c', x, y, r });

  // Hau den Lukas (Schaustellerstraße)
  const lukas = {
    kind: 'lukas', x: 1225, y: 1000, baseY: 1015, bounds: [1180, 790, 90, 240],
    draw(ctx, t) {
      const x = this.x, y = this.y;
      ellipse(ctx, x, y + 10, 30, 8, 'rgba(0,0,0,.25)');
      ctx.fillStyle = '#7a4a26'; ctx.fillRect(x - 26, y - 4, 52, 16);
      ctx.fillStyle = '#c0392b'; ctx.fillRect(x - 8, y - 190, 16, 190);
      for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#f2d24a' : '#fff'; ctx.fillRect(x - 6, y - 180 + i * 19, 12, 9); }
      circle(ctx, x, y - 200, 13, '#e8c040'); circle(ctx, x - 4, y - 204, 4, '#fff6c0');
      const p = (Math.sin(t * 1.7) * 0.5 + 0.5) * ((t % 5) < 2.5 ? 1 : 0.4);
      ctx.fillStyle = '#333'; ctx.fillRect(x - 5, y - 20 - p * 160, 10, 8);
      ctx.fillStyle = '#222'; ctx.fillRect(x - 16, y - 2, 32, 6);
      ctx.fillStyle = '#fff8e6'; rrect(ctx, x - 50, y - 236, 100, 20, 4); ctx.fill();
      txt(ctx, 'HAU DEN LUKAS', x, y - 226, 11, '#c0392b', 'center', null);
      // Hammer
      ctx.save(); ctx.translate(x + 30, y + 4); ctx.rotate(-0.4);
      ctx.fillStyle = '#a87a40'; ctx.fillRect(-2, -34, 4, 34); ctx.fillStyle = '#555'; ctx.fillRect(-9, -40, 18, 10);
      ctx.restore();
    },
  };
  addRect(1195, 990, 60, 22);
  WD.objects.push(lukas);
  WD.places.lukas = { x: 1225, y: 1040 };

  // Dosenwerfen-Bude
  const dosen = {
    kind: 'dosenbude', x: 1030, y: 885, w: 130, h: 50, H: 60, baseY: 935, bounds: [1010, 790, 170, 160],
    draw(ctx, t) {
      const { x, y, w, h, H } = this;
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 6, y + h - 4, w, 8);
      ctx.fillStyle = '#2a6db5'; ctx.fillRect(x, y - H + 10, w, h);
      ctx.fillStyle = '#f5ead2'; ctx.fillRect(x + 3, y + h - H, w - 6, H);
      ctx.fillStyle = '#2a1a0e'; ctx.fillRect(x + 10, y + h - H + 14, w - 20, 26);
      // Dosenpyramide
      const cx = x + w / 2, by = y + h - H + 38;
      const cans = [[-12, 0], [0, 0], [12, 0], [-6, -9], [6, -9], [0, -18]];
      for (const [dx, dy] of cans) { ctx.fillStyle = '#c8ccd4'; ctx.fillRect(cx + dx - 5, by + dy - 9, 10, 9); ctx.fillStyle = '#d62f3a'; ctx.fillRect(cx + dx - 5, by + dy - 6, 10, 3); }
      for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#2a6db5'; ctx.fillRect(x - 4 + i * (w + 8) / 7, y + h - H - 4, (w + 8) / 7, 10); }
      // Kuscheltiere als Preise
      for (let i = 0; i < 3; i++) { const tx = x + 16 + i * 49, ty = y + h - H + 6; circle(ctx, tx, ty, 6, ['#b8743a', '#f2b6c8', '#7ad0ff'][i]); circle(ctx, tx - 5, ty - 5, 2.5, ['#b8743a', '#f2b6c8', '#7ad0ff'][i]); circle(ctx, tx + 5, ty - 5, 2.5, ['#b8743a', '#f2b6c8', '#7ad0ff'][i]); }
      ctx.fillStyle = '#a8703c'; ctx.fillRect(x, y + h - 14, w, 14);
      ctx.fillStyle = '#fff8e6'; rrect(ctx, x + w / 2 - 50, y - H - 4, 100, 15, 3); ctx.fill();
      txt(ctx, 'DOSENWERFEN', x + w / 2, y - H + 4, 11, '#2a6db5', 'center', null);
    },
  };
  addRect(dosen.x, dosen.y, dosen.w, dosen.h);
  WD.objects.push(dosen);
  WD.places.dosen = { x: 1095, y: 955 };

  // Oide Wiesn: Schiffschaukel
  const schaukel = {
    kind: 'schaukel', x: 1250, y: 2150, baseY: 2180, bounds: [1170, 1990, 170, 200],
    draw(ctx, t) {
      const x = this.x, y = this.y;
      ellipse(ctx, x, y + 26, 70, 12, 'rgba(0,0,0,.2)');
      ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(x - 60, y + 26); ctx.lineTo(x - 30, y - 110); ctx.lineTo(x + 30, y - 110); ctx.lineTo(x + 60, y + 26); ctx.stroke();
      ctx.fillStyle = '#f2d24a'; ctx.fillRect(x - 40, y - 118, 80, 10);
      for (let k = 0; k < 2; k++) {
        const a = Math.sin(t * 1.6 + k * 2) * 0.9, px = x - 14 + k * 28, py = y - 108;
        const bx = px + Math.sin(a) * 90, by = py + Math.cos(a) * 90;
        ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
        ctx.save(); ctx.translate(bx, by); ctx.rotate(-a);
        ctx.fillStyle = k ? '#2f6db5' : '#c0392b';
        ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(26, -8); ctx.quadraticCurveTo(20, 10, 0, 12); ctx.quadraticCurveTo(-20, 10, -26, -8); ctx.fill();
        circle(ctx, -10, -13, 4, '#f1c9a5'); circle(ctx, 10, -13, 4, '#f1c9a5');
        ctx.restore();
      }
      txt(ctx, 'SCHIFFSCHAUKEL', x, y + 40, 11, '#fff', 'center', '#7a4a26', 3);
    },
  };
  addRect(1195, 2130, 110, 50);
  WD.objects.push(schaukel);
  WD.places.schaukel = { x: 1250, y: 2205 };

  // Oide Wiesn: Kettenflieger Kalb (von 1919)
  const kalb = {
    kind: 'kalb', x: 2170, y: 2130, baseY: 2160, bounds: [2060, 1940, 230, 240],
    draw(ctx, t, dark) {
      const cx = this.x, cy = this.y;
      ellipse(ctx, cx, cy + 10, 80, 22, 'rgba(0,0,0,.18)');
      ellipse(ctx, cx, cy, 50, 15, '#a89070');
      const topY = cy - 130, rot = t * 1.1;
      ctx.fillStyle = '#e8e0cc'; ctx.fillRect(cx - 6, topY + 14, 12, cy - topY - 14);
      const seats = [];
      for (let i = 0; i < 12; i++) { const a = rot + i / 12 * TAU; seats.push({ a, sx: cx + Math.cos(a) * 74, sy: cy - 56 + Math.sin(a) * 20, tx: cx + Math.cos(a) * 46, ty: topY + 22 + Math.sin(a) * 12 }); }
      const seat = (s, i) => { ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.tx, s.ty); ctx.lineTo(s.sx, s.sy); ctx.stroke(); ctx.fillStyle = i % 2 ? '#2f8a4a' : '#c0392b'; ctx.fillRect(s.sx - 4, s.sy, 8, 4); circle(ctx, s.sx, s.sy - 3, 3, '#f1c9a5'); };
      seats.forEach((s, i) => { if (Math.sin(s.a) <= 0) seat(s, i); });
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, a2 = (i + 1) / 10 * TAU; if (Math.sin(a) < -0.3 && Math.sin(a2) < -0.3) continue; ctx.fillStyle = i % 2 ? '#2f8a4a' : '#f2e6c8'; ctx.beginPath(); ctx.moveTo(cx, topY - 10); ctx.lineTo(cx + Math.cos(a) * 52, topY + 22 + Math.sin(a) * 13); ctx.lineTo(cx + Math.cos(a2) * 52, topY + 22 + Math.sin(a2) * 13); ctx.fill(); }
      seats.forEach((s, i) => { if (Math.sin(s.a) > 0) seat(s, i); });
      flag(ctx, cx, topY - 8, 20, t);
      txt(ctx, 'KETTENFLIEGER · 1919', cx, cy + 24, 10, '#fff', 'center', '#2f8a4a', 3);
      if (dark > 0.2) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; if (Math.sin(a) > -0.3) circle(ctx, cx + Math.cos(a) * 52, topY + 22 + Math.sin(a) * 13, 2, '#ffe46b'); }
    },
  };
  addCirc(2170, 2130, 52);
  WD.objects.push(kalb);
  WD.places.kalb = { x: 2170, y: 2210 };

  // Oide Wiesn: Museumszelt
  const museum = {
    kind: 'museum', x: 790, y: 2170, w: 160, h: 110, H: 55, baseY: 2280, bounds: [770, 2080, 200, 210],
    draw(ctx, t) {
      const { x, y, w, h, H } = this;
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#f2e6c8' : '#8a5a32'; ctx.fillRect(x + i * w / 6, y - H, w / 6 + 0.5, h); }
      ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(x, y - H, w, h * 0.4);
      ctx.fillStyle = '#efe4cc'; ctx.fillRect(x, y + h - H, w, H);
      ctx.fillStyle = '#5a3418'; ctx.fillRect(x + w / 2 - 18, y + h - 34, 36, 34);
      ctx.fillStyle = '#fff8e6'; rrect(ctx, x + 10, y + h - H + 6, w - 20, 16, 3); ctx.fill();
      txt(ctx, 'MUSEUMSZELT', x + w / 2, y + h - H + 14, 11, '#8a5a32', 'center', null);
      // Hochrad vor dem Zelt
      const hx = x + w - 22, hy = y + h - 2;
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy - 18, 18, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(hx - 24, hy - 5, 5, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx, hy - 36); ctx.quadraticCurveTo(hx - 16, hy - 30, hx - 24, hy - 5); ctx.stroke();
    },
  };
  addRect(museum.x, museum.y, museum.w, museum.h);
  WD.objects.push(museum);
  WD.places.museum = { x: 870, y: 2300 };

  // Kleine Symbole auf der Minikarte
  WD.miniHook = function (c) {
    c.fillStyle = '#c0392b'; c.fillRect(1195, 960, 60, 60);
    c.fillStyle = '#2a6db5'; c.fillRect(dosen.x, dosen.y, dosen.w, dosen.h);
    c.fillStyle = '#7a4a26'; c.fillRect(1195, 2120, 110, 60);
    c.fillStyle = '#2f8a4a'; c.beginPath(); c.arc(2170, 2130, 60, 0, TAU); c.fill();
    c.fillStyle = '#8a5a32'; c.fillRect(museum.x, museum.y, museum.w, museum.h);
  };
})();

// =====================================================================
// HAU DEN LUKAS
// =====================================================================
G.lukas = (function () {
  let st = null;
  const LEVELS = ['Gummibärchen', 'Weißwurst', 'Brezn-Bäcker', 'Bierfass-Roller', 'Ochsen-Kraft', 'Wiesn-Held'];
  function start(opts, onEnd) { st = { onEnd, t: 0, pt: 0, phase: 'intro', tries: 3, best: 0, power: 0, acc: 0, needle: 0, puck: 0, puckV: 0, result: 0, rang: false, msg: '' }; }
  function update(dt) {
    const I = G.input, act = I.hit('act') || I.hit('space');
    st.t += dt; st.pt += dt;
    if (st.phase === 'intro') { if (st.pt > 0.5 && act) { st.phase = 'power'; st.pt = 0; } return; }
    if (st.phase === 'power') {
      st.needle = Math.abs(Math.sin(st.pt * 2.6));
      if (act) { st.power = st.needle; st.phase = 'aim'; st.pt = 0; G.audio.sfx.blip(500 + st.power * 400); }
      return;
    }
    if (st.phase === 'aim') {
      st.needle = Math.sin(st.pt * 3.4);
      if (act) {
        st.acc = 1 - Math.min(1, Math.abs(st.needle) * 1.15);
        st.result = clamp(st.power * (0.45 + 0.55 * st.acc) * 1.05, 0, 1);
        st.phase = 'swing'; st.pt = 0;
      }
      return;
    }
    if (st.phase === 'swing') {
      if (st.pt > 0.35 && !st.swung) { st.swung = true; G.audio.sfx.bump(); st.puckV = Math.sqrt(st.result) * 1.55; st.puck = 0; }
      if (st.swung) {
        st.puck += st.puckV * dt; st.puckV -= 1.2 * dt;
        if (st.puck >= 1) { st.puck = 1; st.puckV = -0.3; if (!st.rang) { st.rang = true; G.audio.sfx.bell(); G.audio.sfx.bell(); G.audio.sfx.cheer(); } }
        if (st.puck <= 0 && st.puckV < 0) {
          st.puck = 0; st.best = Math.max(st.best, st.result); st.tries--; st.swung = false;
          st.msg = LEVELS[Math.min(5, Math.floor(st.result * 5.99))] + (st.result >= 0.95 ? ' – DING!' : '');
          st.phase = st.tries > 0 ? 'power' : 'done'; st.pt = 0; st.rang = st.result >= 0.95 || st.rang;
        }
      }
      return;
    }
    if (st.phase === 'done' && st.pt > 1 && act) { const cb = st.onEnd; const r = { best: st.best, bell: st.best >= 0.95 }; st = null; cb(r); }
  }
  function draw(ctx) {
    if (!st) return;
    drawSkyBg(ctx, '#7fc4f0', '#e8f4ff');
    ctx.fillStyle = '#b8a888'; ctx.fillRect(0, 470, VW, 70);
    // Turm mit Skala
    const tx = 600, top = 60, bot = 450;
    ctx.fillStyle = '#c0392b'; ctx.fillRect(tx - 22, top, 44, bot - top);
    LEVELS.forEach((l, i) => {
      const y = lerp(bot, top + 30, (i + 0.5) / 6);
      ctx.fillStyle = i % 2 ? '#f2d24a' : '#fff'; ctx.fillRect(tx - 18, y - 30, 36, 60);
      txt(ctx, l, tx + 36, y, 15, '#fff', 'left', '#7a1a10', 4);
    });
    circle(ctx, tx, top - 10, 30, st.rang && Math.sin(st.t * 30) > 0 ? '#fff6a0' : '#e8c040');
    circle(ctx, tx - 8, top - 18, 8, 'rgba(255,255,255,.7)');
    if (st.rang) txt(ctx, 'DING! DING!', tx, top - 50, 26, '#ffd84a', 'center', '#000', 5);
    const py = lerp(bot - 10, top + 20, st.puck);
    ctx.fillStyle = '#333'; rrect(ctx, tx - 16, py - 12, 32, 24, 5); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(tx - 40, bot + 10, 80, 18);
    ctx.fillStyle = '#d62f3a'; ellipse(ctx, tx, bot + 8, 22, 7, '#d62f3a');
    // Kind mit Hammer
    const sw = st.phase === 'swing' ? Math.min(1, st.pt / 0.35) : 0;
    const look = G.player.look;
    drawSideKid(ctx, tx - 110, 470, 0, look, { scale: 2.6, arm: -1.2 + sw * 2.4 });
    ctx.save(); ctx.translate(tx - 104, 470 - 78); ctx.rotate(-2.2 + sw * 2.9);
    ctx.fillStyle = '#a87a40'; ctx.fillRect(-4, 0, 8, 90); ctx.fillStyle = '#555'; ctx.fillRect(-22, 80, 44, 26);
    ctx.restore();
    drawCrowdRow(ctx, 560, 12, st.t, st.rang ? 1 : 0, 21);
    // Anzeigen
    ctx.fillStyle = 'rgba(0,0,0,.6)'; rrect(ctx, 40, 40, 330, 150, 12); ctx.fill();
    txt(ctx, 'HAU DEN LUKAS – Kinderversion', 205, 62, 15, '#ffd84a', 'center', null);
    txt(ctx, 'Versuche: ' + st.tries + '   Bester Schlag: ' + Math.round(st.best * 100), 205, 88, 13, '#fff', 'center', null);
    if (st.phase === 'power' || st.phase === 'aim') {
      const lbl = st.phase === 'power' ? '1. KRAFT – drück E im Roten!' : '2. ZIELEN – drück E in der Mitte!';
      txt(ctx, lbl, 205, 114, 14, '#fff', 'center', null);
      const g = ctx.createLinearGradient(60, 0, 350, 0);
      if (st.phase === 'power') { g.addColorStop(0, '#3ad46a'); g.addColorStop(0.7, '#f2d24a'); g.addColorStop(1, '#e8203a'); }
      else { g.addColorStop(0, '#e8203a'); g.addColorStop(0.5, '#3ad46a'); g.addColorStop(1, '#e8203a'); }
      ctx.fillStyle = g; rrect(ctx, 60, 132, 290, 22, 11); ctx.fill();
      const nx = st.phase === 'power' ? 60 + st.needle * 290 : 205 + st.needle * 145;
      ctx.fillStyle = '#fff'; ctx.fillRect(nx - 3, 126, 6, 34);
    }
    if (st.msg && st.phase !== 'swing') txt(ctx, st.msg, 205, 175, 16, '#9cff7a', 'center', null);
    if (st.phase === 'intro') introCard(ctx, 'HAU DEN LUKAS', ['Mit dem Hammer auf den Knopf – und der Lukas saust nach oben!', 'Erst die KRAFT stoppen (je röter, desto stärker), dann genau in der MITTE treffen.', 'Klingelt die Glocke ganz oben, bist du ein Wiesn-Held!'], 'Hammer schnappen! [E]');
    if (st.phase === 'done') { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 200, VW, 140); txt(ctx, st.best >= 0.95 ? 'GLOCKE GELÄUTET!' : 'FERTIG!', VW / 2, 250, 44, '#ffd84a', 'center', '#000', 8); txt(ctx, 'Bester Schlag: ' + Math.round(st.best * 100) + ' von 100  [E]', VW / 2, 300, 20, '#fff', 'center', '#000', 5); }
    G.ui.touchHint(ctx, ['E']);
  }
  return { start, update, draw, get _st() { return st; } };
})();

// =====================================================================
// DOSENWERFEN
// =====================================================================
G.dosen = (function () {
  let st = null;
  const TABLE_Y = 330, TABLE_X0 = 380, TABLE_X1 = 580, CW = 34, CH = 44;
  function start(opts, onEnd) {
    const cans = [];
    const rows = [[-1.5, -0.5, 0.5, 1.5], [-1, 0, 1], [-0.5, 0.5], [0]];
    rows.forEach((r, ri) => r.forEach(cx => cans.push({ x: 480 + cx * (CW + 2), y: TABLE_Y - CH * (ri + 1) + CH / 2, vx: 0, vy: 0, rot: 0, vr: 0, down: false, fall: false })));
    st = { onEnd, t: 0, pt: 0, phase: 'intro', balls: 3, aim: 0, power: 0, charging: false, ball: null, cans };
  }
  function update(dt) {
    const I = G.input;
    st.t += dt; st.pt += dt;
    if (st.phase === 'intro') { if (st.pt > 0.5 && (I.hit('act') || I.hit('space'))) { st.phase = 'aim'; st.pt = 0; } return; }
    // Physik der Dosen
    for (const c of st.cans) {
      if (!c.fall) continue;
      c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
      if (c.y > 520) { c.y = 520; c.vy *= -0.3; c.vx *= 0.6; c.vr *= 0.5; }
    }
    // Stützen prüfen: liegt eine Dose auf nichts mehr, fällt sie
    for (const c of st.cans) {
      if (c.fall) continue;
      const onTable = Math.abs(c.y + CH / 2 - TABLE_Y) < 2;
      if (onTable) continue;
      const support = st.cans.some(o => o !== c && !o.fall && Math.abs(o.y - (c.y + CH)) < 3 && Math.abs(o.x - c.x) < CW * 0.75);
      if (!support) { c.fall = true; c.vx = rand(-60, 60); c.vr = rand(-4, 4); }
    }
    if (st.phase === 'aim') {
      const ax = I.axis().x;
      st.aim = clamp(st.aim + ax * dt * 1.4, -1, 1);
      if (Math.abs(ax) < 0.1 && !G.input.usedTouch) st.aim = clamp(st.aim, -1, 1);
      const charge = I.down('act') || I.down('space');
      if (charge) { st.charging = true; st.power = (Math.sin(st.pt * 3) * 0.5 + 0.5); }
      else if (st.charging) {
        st.charging = false; st.balls--;
        const tx = 480 + st.aim * 160, ty = lerp(TABLE_Y + 10, TABLE_Y - CH * 4.6, st.power);
        st.ball = { t: 0, x0: 480, y0: 520, tx, ty, x: 480, y: 520, done: false };
        st.phase = 'throw'; G.audio.sfx.whoosh(0.3);
      } else st.pt = 0;
      return;
    }
    if (st.phase === 'throw') {
      const b = st.ball; b.t += dt * 2.2;
      const f = Math.min(1, b.t);
      b.x = lerp(b.x0, b.tx, f); b.y = lerp(b.y0, b.ty, f) - Math.sin(f * Math.PI) * 120; b.s = lerp(1.6, 0.7, f);
      if (f >= 1 && !b.done) {
        b.done = true;
        let hit = 0;
        for (const c of st.cans) {
          if (c.fall) continue;
          if (Math.abs(c.x - b.x) < CW * 0.85 && Math.abs(c.y - b.y) < CH * 0.75) { c.fall = true; c.vx = (c.x - b.x) * 6 + rand(-40, 120); c.vy = -rand(120, 260); c.vr = rand(-8, 8); hit++; }
        }
        // Treffer gibt Nachbarn einen Schubs
        if (hit) { for (const c of st.cans) if (!c.fall && Math.abs(c.x - b.x) < CW * 1.6 && Math.abs(c.y - b.y) < CH * 1.2 && Math.random() < 0.5) { c.fall = true; c.vx = (c.x - b.x) * 5; c.vy = -rand(60, 160); c.vr = rand(-6, 6); } G.audio.sfx.bump(); G.audio.sfx.step(); }
        st.phase = 'wait'; st.pt = 0;
      }
      return;
    }
    if (st.phase === 'wait') {
      if (st.pt > 1.1) {
        const left = st.cans.filter(c => !c.fall).length;
        if (left === 0) { st.phase = 'done'; st.win = true; st.pt = 0; G.audio.sfx.cheer(); G.audio.sfx.jingle(); G.audio.say('Alle abgeräumt! Such dir a Kuscheltier aus!'); }
        else if (st.balls <= 0) { st.phase = 'done'; st.win = false; st.pt = 0; G.audio.sfx.busted(); }
        else { st.phase = 'aim'; st.pt = 0; st.ball = null; }
      }
      return;
    }
    if (st.phase === 'done' && st.pt > 1 && (I.hit('act') || I.hit('space'))) { const cb = st.onEnd; const r = { win: st.win }; st = null; cb(r); }
  }
  function draw(ctx) {
    if (!st) return;
    ctx.fillStyle = '#2a6db5'; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#2a6db5'; ctx.fillRect(i * 80, 0, 80, 40); }
    ctx.fillStyle = '#2a1a0e'; ctx.fillRect(140, 60, 680, 380);
    // Preise
    for (let i = 0; i < 8; i++) {
      const x = 180 + i * 85, y = 100, c = ['#b8743a', '#f2b6c8', '#7ad0ff', '#f2d24a', '#9cff7a', '#e86fb0', '#c98e63', '#ffffff'][i];
      circle(ctx, x, y + 14, 16, c); circle(ctx, x, y - 6, 12, c); circle(ctx, x - 10, y - 16, 5, c); circle(ctx, x + 10, y - 16, 5, c);
      circle(ctx, x - 4, y - 8, 1.6, '#000'); circle(ctx, x + 4, y - 8, 1.6, '#000'); circle(ctx, x, y - 3, 2, '#5a2a10');
    }
    // Tisch
    ctx.fillStyle = '#a8703c'; ctx.fillRect(TABLE_X0, TABLE_Y, TABLE_X1 - TABLE_X0, 14);
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(TABLE_X0 + 20, TABLE_Y + 14, 12, 120); ctx.fillRect(TABLE_X1 - 32, TABLE_Y + 14, 12, 120);
    // Dosen
    for (const c of st.cans) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillStyle = '#c8ccd4'; ctx.fillRect(-CW / 2, -CH / 2, CW, CH);
      ctx.fillStyle = '#d62f3a'; ctx.fillRect(-CW / 2, -8, CW, 16);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-CW / 2 + 4, -CH / 2, 5, CH);
      ctx.restore();
    }
    // Theke vorne
    ctx.fillStyle = '#a8703c'; ctx.fillRect(0, 440, VW, 100);
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(0, 440, VW, 10);
    // Zielhilfe
    if (st.phase === 'aim') {
      const tx = 480 + st.aim * 160, ty = lerp(TABLE_Y + 10, TABLE_Y - CH * 4.6, st.charging ? st.power : 0.4);
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tx, ty, 18, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx - 26, ty); ctx.lineTo(tx + 26, ty); ctx.moveTo(tx, ty - 26); ctx.lineTo(tx, ty + 26); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.6)'; rrect(ctx, 830, 140, 34, 260, 10); ctx.fill();
      ctx.fillStyle = '#ffd84a'; rrect(ctx, 834, 396 - 252 * (st.charging ? st.power : 0), 26, 252 * (st.charging ? st.power : 0), 8); ctx.fill();
      txt(ctx, 'HÖHE', 847, 415, 11, '#fff', 'center', null);
    }
    if (st.ball && !st.ball.done) { circle(ctx, st.ball.x, st.ball.y, 14 * st.ball.s, '#f2f2f2'); ctx.strokeStyle = '#d62f3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(st.ball.x, st.ball.y, 14 * st.ball.s, 0.5, 2.5); ctx.stroke(); }
    for (let i = 0; i < st.balls; i++) circle(ctx, 80 + i * 40, 490, 15, '#f2f2f2');
    txt(ctx, 'Bälle: ' + st.balls, 120, 455, 14, '#fff', 'center', '#000', 3);
    if (st.phase === 'aim') txt(ctx, '◀ ▶ zielen · E GEDRÜCKT halten und im richtigen Moment LOSLASSEN', VW / 2, 500, 15, '#fff', 'center', '#000', 4);
    if (st.phase === 'intro') introCard(ctx, 'DOSENWERFEN', ['Drei Bälle, zehn Dosen. Räum alle vom Tisch, dann gibt es ein Kuscheltier!', 'Mit ◀ ▶ zielst du nach links und rechts.', 'Halte E gedrückt: Der Balken zeigt die Wurfhöhe. Lass im richtigen Moment los!'], 'Los geht’s! [E]');
    if (st.phase === 'done') {
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 180, VW, 150);
      txt(ctx, st.win ? 'ALLE ABGERÄUMT!' : 'KNAPP DANEBEN!', VW / 2, 230, 46, st.win ? '#ffd84a' : '#ff9a9a', 'center', '#000', 8);
      txt(ctx, st.win ? 'Du gewinnst ein Kuscheltier!  [E]' : 'Noch ' + st.cans.filter(c => !c.fall).length + ' Dosen stehen. Nochmal probieren?  [E]', VW / 2, 285, 20, '#fff', 'center', '#000', 5);
    }
    G.ui.touchHint(ctx, ['◀', '▶']);
  }
  return { start, update, draw, get _st() { return st; } };
})();

// =====================================================================
// SCHIFFSCHAUKEL
// =====================================================================
G.schaukel = (function () {
  let st = null;
  function start(opts, onEnd) { st = { onEnd, t: 0, pt: 0, phase: 'intro', th: 0.15, w: 0, max: 0, time: 30, good: 0, flash: 0, msg: '' }; }
  function update(dt) {
    const I = G.input, act = I.hit('act') || I.hit('space') || I.hit('up');
    st.t += dt; st.pt += dt; st.flash = Math.max(0, st.flash - dt);
    if (st.phase === 'intro') { if (st.pt > 0.5 && act) { st.phase = 'swing'; st.pt = 0; } return; }
    if (st.phase === 'swing' || st.phase === 'brake') {
      const brake = st.phase === 'brake';
      st.w += (-9.8 / 2.4 * Math.sin(st.th) - (brake ? 1.6 : 0.05) * st.w) * dt;
      st.th += st.w * dt;
      st.max = Math.max(st.max, Math.abs(st.th));
      if (!brake) {
        st.time -= dt;
        if (act) {
          // Schwung holen klappt nur unten im grünen Bereich
          if (Math.abs(st.th) < 0.28 && st.t - (st.lastPump || -9) > 0.45) { st.lastPump = st.t; st.w += Math.sign(st.w || 1) * 0.55; st.good++; st.flash = 0.3; G.audio.sfx.blip(700); st.msg = pick(['Super Timing!', 'Hui!', 'Höher!', 'Weiter so!']); }
          else { st.w *= 0.9; G.audio.sfx.blip(220); st.msg = 'Zu früh oder zu spät – drück unten im grünen Bereich!'; }
        }
        if (st.max > 1.45 || st.time <= 0) {
          st.phase = 'brake'; st.pt = 0;
          G.audio.say(st.max > 1.45 ? 'Bremsbrett! So hoch derf ma ned!' : 'Zeit is um!');
          st.msg = st.max > 1.45 ? 'Der Schausteller bremst – höher geht’s nicht!' : 'Die Zeit ist um.';
        }
      } else if (st.pt > 4) { st.phase = 'done'; st.pt = 0; if (st.max > 1.4) { G.audio.sfx.cheer(); G.audio.sfx.jingle(); } }
      return;
    }
    if (st.phase === 'done' && st.pt > 1 && act) { const cb = st.onEnd; const r = { max: st.max, top: st.max > 1.4 }; st = null; cb(r); }
  }
  function draw(ctx) {
    if (!st) return;
    drawSkyBg(ctx, '#ffb07a', '#fff0d0');
    ctx.fillStyle = '#c9b48a'; ctx.fillRect(0, 470, VW, 70);
    const px = VW / 2, py = 90, L = 300;
    ctx.strokeStyle = '#7a4a26'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(px - 220, 470); ctx.lineTo(px - 30, py); ctx.lineTo(px + 30, py); ctx.lineTo(px + 220, 470); ctx.stroke();
    circle(ctx, px, py, 12, '#555');
    // grüner Bereich unten
    ctx.strokeStyle = st.flash > 0 ? 'rgba(120,255,140,.9)' : 'rgba(80,220,110,.45)'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.arc(px, py, L, Math.PI / 2 - 0.28, Math.PI / 2 + 0.28); ctx.stroke();
    // Höhen-Markierung
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.arc(px, py, L, Math.PI / 2 - 1.45, Math.PI / 2 + 1.45); ctx.stroke(); ctx.setLineDash([]);
    // Bremsbrett
    if (st.phase === 'brake' || st.phase === 'done') { ctx.fillStyle = '#5a3418'; ctx.fillRect(px - 90, 430, 180, 16); }
    // Schaukel
    const bx = px + Math.sin(st.th) * L, by = py + Math.cos(st.th) * L;
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(px - 8, py); ctx.lineTo(bx - 8 * Math.cos(st.th), by); ctx.moveTo(px + 8, py); ctx.lineTo(bx + 8 * Math.cos(st.th), by); ctx.stroke();
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-st.th);
    drawSideKid(ctx, -30, -8, 0.1, G.player.look, { scale: 1.7, arm: -2 + Math.sin(st.t * 3) * 0.2 });
    drawSideKid(ctx, 30, -8, -0.1, { female: false, skin: '#f1c9a5', hair: '#d8b060', shirt: '#d62f3a' }, { scale: 1.7, arm: -2 });
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(-80, -30); ctx.lineTo(80, -30); ctx.quadraticCurveTo(70, 30, 0, 36); ctx.quadraticCurveTo(-70, 30, -80, -30); ctx.fill();
    ctx.fillStyle = '#f2d24a'; ctx.fillRect(-70, -26, 140, 6);
    ctx.restore();
    // HUD
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, 20, 20, 300, 96, 12); ctx.fill();
    txt(ctx, 'SCHIFFSCHAUKEL  (mit Ferdl)', 170, 40, 15, '#ffd84a', 'center', null);
    txt(ctx, 'Höhe: ' + Math.round(st.max / 1.45 * 100) + ' %   Zeit: ' + Math.max(0, Math.ceil(st.time)) + ' s', 170, 66, 15, '#fff', 'center', null);
    ctx.fillStyle = '#333'; rrect(ctx, 40, 84, 260, 14, 7); ctx.fill();
    ctx.fillStyle = '#ff6bd5'; rrect(ctx, 40, 84, 260 * clamp(st.max / 1.45, 0, 1), 14, 7); ctx.fill();
    if (st.msg && st.phase !== 'done') txt(ctx, st.msg, VW / 2, 510, 16, '#fff', 'center', '#000', 4);
    if (st.phase === 'intro') introCard(ctx, 'SCHIFFSCHAUKEL', ['Schwung holst du selbst: Drück E (oder ↑) genau dann, wenn die Schaukel unten durch den GRÜNEN Bereich saust.', 'Je besser dein Timing, desto höher geht’s – bis der Schausteller das Bremsbrett hochklappt!', '30 Sekunden Zeit. Ferdl schaukelt mit.'], 'Einsteigen! [E]');
    if (st.phase === 'done') { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 190, VW, 130); txt(ctx, st.max > 1.4 ? 'BIS IN DEN HIMMEL!' : 'SCHÖN GESCHAUKELT!', VW / 2, 240, 44, '#ffd84a', 'center', '#000', 8); txt(ctx, 'Höhe: ' + Math.round(st.max / 1.45 * 100) + ' %   [E]', VW / 2, 290, 20, '#fff', 'center', '#000', 5); }
    G.ui.touchHint(ctx, ['E']);
  }
  return { start, update, draw, get _st() { return st; } };
})();

// =====================================================================
// EREIGNISSE: Einzug der Wiesnwirte, verlorenes Kind, Luftballon, Roller-Rennen
// =====================================================================
G.events = (function () {
  const WD = G.world, E = G.ent;
  let parade = [], paradeDay = 0, paradeSpawn = 0, paradeIdx = 0;
  let lostKid = null, balloon = null, nextEvent = 70;
  let race = null;
  let djT = 45, lastDayBoom = 0;
  const DJ = [
    () => 'Servus und griaß eich! Es is ' + fmtTime(G.game.clock) + ' Uhr auf da Theresienwiese.',
    () => 'Verkehrsmeldung: Auf da Wirtsbudenstraß’n san wieder Pferdegespanne unterwegs – bitte Obacht!',
    () => 'Das Wetter: weiß-blauer Himmel über da Wiesn. Perfekt für a Runde Riesenrad!',
    () => 'Am Toboggan purzeln heut wieder alle übers Förderband. Zuschaun lohnt sich!',
    () => 'Ein Tipp für alle Kinder: Wer seine Familie verliert, geht zum Servicezentrum hinterm Schottenhamel.',
    () => 'Und jetzt: Blasmusik, bis die Lederhos’n wackelt!',
    () => G.missions.done.dackel ? 'Grüße an Dackel Waldi – schön, dass du wieder da bist!' : 'Suchmeldung: A Dackel namens Waldi wurde bei da Fischer-Vroni gesehen!',
    () => 'Am Teufelsrad gilt: Wer in da Mitte sitzt, fliegt als Letzter. Ganz einfach – oder?',
  ];

  const PARADE = [
    { kind: 'kindl', label: 'Münchner Kindl' },
    { kind: 'kutsche', label: 'Festkutsche Schottenhamel', col: '#f2f2f2' },
    { kind: 'band', label: 'Blaskapelle' },
    { kind: 'gespann', label: 'Prachtgespann', col: '#2a6db5', n: 6 },
    { kind: 'gespann', label: 'Prachtgespann', col: '#7a4b2a', n: 6 },
    { kind: 'wagen', label: 'Festwirte & Bedienungen', col: '#3f7f2f' },
    { kind: 'gespann', label: 'Prachtgespann', col: '#c0392b', n: 4 },
    { kind: 'gespann', label: 'Prachtgespann', col: '#1d3e7a', n: 6 },
    { kind: 'band', label: 'Trachtenkapelle' },
    { kind: 'gespann', label: 'Prachtgespann', col: '#2f8a4a', n: 4 },
    { kind: 'wagen', label: 'Schausteller', col: '#e86fb0' },
    { kind: 'gespann', label: 'Prachtgespann', col: '#d4a020', n: 6 },
  ];

  function drawHorse(ctx, x, y, col, step) {
    ctx.fillStyle = col || '#5a2a10';
    ellipse(ctx, x, y - 16, 8, 12); ctx.fill();
    ctx.fillRect(x - 6, y - 8, 3, 9 + step); ctx.fillRect(x + 3, y - 8, 3, 9 - step);
    ellipse(ctx, x, y - 30, 5, 8); ctx.fill();
    ctx.fillStyle = '#1a7fd4'; ctx.fillRect(x - 6, y - 22, 12, 3);
    ctx.fillStyle = '#fff'; circle(ctx, x, y - 38, 3, '#fff');
  }
  function drawParadeUnit(ctx, u) {
    const x = u.x, y = u.y, step = Math.sin(G.time * 6 + u.y * 0.1) * 2;
    ellipse(ctx, x, y + 2, 40, 10, 'rgba(0,0,0,.2)');
    if (u.kind === 'kindl') {
      drawHorse(ctx, x, y + 4, '#f2f2f2', step);
      // Münchner Kindl: schwarz-gelbe Kutte
      ctx.fillStyle = '#111'; ctx.fillRect(x - 7, y - 40, 14, 18);
      ctx.fillStyle = '#f2d24a'; ctx.fillRect(x - 7, y - 30, 14, 3);
      circle(ctx, x, y - 46, 6, '#f1c9a5'); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y - 47, 7, Math.PI, TAU); ctx.fill();
      ctx.strokeStyle = '#f2d24a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 8, y - 34); ctx.lineTo(x + 14, y - 52); ctx.stroke();
    } else if (u.kind === 'band') {
      for (let i = 0; i < 6; i++) {
        const look = u.looks[i];
        E.drawPerson(ctx, { x: x - 24 + (i % 3) * 24, y: y - 20 + Math.floor(i / 3) * 22, dir: Math.PI / 2, look, moving: true, walk: G.time * 6 + i, carry: i % 3 === 1 ? 'tuba' : 'trumpet', size: 0.95 });
      }
    } else {
      const n = u.n || 2;
      for (let i = 0; i < n; i++) drawHorse(ctx, x - 9 + (i % 2) * 18, y + 6 - Math.floor(i / 2) * 22, i % 2 ? '#5a2a10' : '#6a3a1a', step * (i % 2 ? -1 : 1));
      const wy = y - Math.ceil(n / 2) * 22 - 6;
      ctx.fillStyle = u.kind === 'kutsche' ? '#f2f2f2' : '#5a3418';
      rrect(ctx, x - 24, wy - 40, 48, 36, 6); ctx.fill();
      ctx.fillStyle = u.col || '#c0392b'; ctx.fillRect(x - 24, wy - 14, 48, 6);
      if (u.kind === 'gespann') for (let i = 0; i < 3; i++) { ctx.fillStyle = '#8a5a2e'; rrect(ctx, x - 22 + i * 15, wy - 58, 14, 18, 5); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(x - 22 + i * 15, wy - 52, 14, 2); }
      else { for (let i = 0; i < 3; i++) { circle(ctx, x - 14 + i * 14, wy - 46, 5, '#f1c9a5'); ctx.fillStyle = u.kind === 'kutsche' && i === 1 ? '#333' : '#3f7f2f'; ctx.fillRect(x - 19 + i * 14, wy - 41, 10, 10); } }
      if (u.kind === 'kutsche') { ctx.strokeStyle = '#d4a020'; ctx.lineWidth = 2; ctx.strokeRect(x - 24, wy - 40, 48, 36); }
      ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x - 20, wy - 2, 7, 0, TAU); ctx.arc(x + 20, wy - 2, 7, 0, TAU); ctx.stroke();
      // Blumen-Girlande
      for (let i = 0; i < 6; i++) circle(ctx, x - 22 + i * 9, wy - 40, 3, ['#ff6b9a', '#fff', '#f2d24a'][i % 3]);
    }
    if (u.label) {
      ctx.font = '800 10px ' + FONT; const w = ctx.measureText(u.label).width + 10;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; rrect(ctx, x - w / 2, y - u.h - 18, w, 15, 5); ctx.fill();
      txt(ctx, u.label, x, y - u.h - 10, 10, '#fff', 'center', null);
    }
  }

  function updateParade(dt, P) {
    const g = G.game;
    if (g.day === 1 && g.clock >= 635 && g.clock < 715 && paradeDay !== g.day) {
      paradeDay = g.day; paradeIdx = 0; paradeSpawn = 0;
      G.ui.big('EINZUG DER WIESNWIRTE', 'Vorneweg reitet das Münchner Kindl, dahinter die Festkutsche und die Prachtgespanne – über die Wirtsbudenstraße!', 5);
      G.game.unlockFact('kindl'); G.game.unlockFact('brauereien');
      G.audio.sfx.honk();
    }
    if (paradeDay === g.day && paradeIdx < PARADE.length && g.clock < 760) {
      paradeSpawn -= dt;
      if (paradeSpawn <= 0) {
        const d = PARADE[paradeIdx++];
        const u = Object.assign({ x: 2240, y: 60, h: d.kind === 'kindl' ? 60 : d.kind === 'band' ? 40 : 30 + Math.ceil((d.n || 2) / 2) * 22 + 60 }, d);
        if (d.kind === 'band') { u.looks = []; for (let i = 0; i < 6; i++) { const l = E.randomLook('adult'); l.female = false; l.hat = true; l.shirt = '#fff'; u.looks.push(l); } }
        parade.push(u); paradeSpawn = 7;
      }
    }
    for (const u of parade) {
      u.y += 30 * dt;
      // Spieler zur Seite schieben
      const top = u.y - u.h, hw = 30;
      if (P.x > u.x - hw && P.x < u.x + hw && P.y > top && P.y < u.y + 10) {
        P.x = P.x < u.x ? u.x - hw : u.x + hw;
        if (!u.warned) { u.warned = true; G.ui.toast('Platz da – der Einzug kommt!', 2); }
      }
      if (dist(P.x, P.y, u.x, u.y) < 220 && !G.trophies.has('einzug')) G.trophies.unlock('einzug');
    }
    parade = parade.filter(u => u.y - u.h < 1860);
  }

  // ---------- Verlorenes Kind ----------
  function spawnLostKid(P) {
    const cand = WD.nodes.filter(n => { const d = dist(n.x, n.y, P.x, P.y); return d > 300 && d < 900 && dist(n.x, n.y, WD.places.service.x, WD.places.service.y) > 500; });
    if (!cand.length) return;
    const n = pick(cand);
    const look = E.randomLook('kid');
    lostKid = { x: n.x + rand(-30, 30), y: n.y + rand(-30, 30), look, size: 0.65, dir: Math.PI / 2, state: 'crying', t: 0, name: look.female ? pick(['Lisi', 'Emma', 'Mia', 'Leni']) : pick(['Luki', 'Benni', 'Toni', 'Paul']) };
    G.ui.toast('Irgendwo weint ein Kind … (blaues „?“ auf der Karte)', 4);
  }
  function updateLostKid(dt, P) {
    const k = lostKid; if (!k) return;
    k.t += dt;
    if (k.state === 'crying') {
      k.say = (k.t % 4) < 2 ? 'Mama? Papa? *schnief*' : null;
      k.dir = Math.atan2(P.y - k.y, P.x - k.x);
    } else if (k.state === 'follow') {
      const tx = P.x - Math.cos(P.dir) * 24, ty = P.y - Math.sin(P.dir) * 24;
      const d = dist(k.x, k.y, tx, ty);
      if (d > 5) { const s = Math.min(d * 5, 320); k.x += (tx - k.x) / d * s * dt; k.y += (ty - k.y) / d * s * dt; k.moving = true; k.walk = (k.walk || 0) + dt * 14; k.dir = Math.atan2(ty - k.y, tx - k.x); } else k.moving = false;
      k.say = (k.t % 6) < 1.5 ? pick(['Gehen wir zum Servicezentrum?', 'Danke, dass du mir hilfst!']) : null;
      if (dist(P.x, P.y, WD.places.service.x, WD.places.service.y) < 80) {
        k.state = 'done'; lostKid = null; G.ui.objective('');
        G.ui.dialog([
          { who: 'Mitarbeiterin vom Servicezentrum', text: 'Da ist ja ' + k.name + '! Die Eltern haben schon nach ' + (k.look.female ? 'ihr' : 'ihm') + ' gefragt. Hier hinterm Schottenhamel ist der Treffpunkt für verlorene Kinder.' },
          { who: 'Mitarbeiterin vom Servicezentrum', text: 'Das hast du super gemacht! Für dich: 10 Taler Finderlohn.' },
        ], () => { G.game.addTaler(10); G.game.addGaudi(15); G.trophies.unlock('kind'); });
      }
    }
  }

  // ---------- Luftballon ----------
  function spawnBalloon(P) {
    const a = rand(0, TAU), x = clamp(P.x + Math.cos(a) * 220, 150, 3050), y = clamp(P.y + Math.sin(a) * 160, 150, 2250);
    if (WD.solidAt(x, y, 14)) return;
    const look = E.randomLook('kid');
    balloon = { kx: x, ky: y, x: x + 10, y, h: 30, vx: rand(-40, 40) || 30, vy: rand(-30, 30), col: pick(['#e8203a', '#2f8ad6', '#f2d24a', '#e86fb0', '#2fa85a']), t: 0, look, state: 'fly' };
    G.ui.toast('„Mei Luftballon!“ – Schnell, fang ihn, bevor er zu hoch fliegt!', 3.5);
  }
  function updateBalloon(dt, P) {
    const b = balloon; if (!b) return;
    b.t += dt;
    if (b.state === 'fly') {
      b.x += (b.vx + Math.sin(b.t * 1.3) * 30) * dt; b.y += (b.vy + Math.cos(b.t) * 20) * dt;
      b.h += dt * 9;
      b.x = clamp(b.x, 120, 3080); b.y = clamp(b.y, 120, 2280);
      if (dist(P.x, P.y, b.x, b.y) < 28 && b.h < 150) { b.state = 'back'; G.audio.sfx.boing(); G.ui.toast('Hab ihn! Jetzt zurück zum Kind.', 3); }
      else if (b.h > 170) { G.ui.toast('Oh nein, der Ballon ist weg. Fliegt jetzt über die Bavaria …', 3); balloon = null; }
    } else {
      b.x = P.x + 8; b.y = P.y; b.h = 30;
      if (dist(P.x, P.y, b.kx, b.ky) < 40) {
        balloon = null; G.audio.sfx.coin(); G.game.addTaler(5); G.game.addGaudi(8); G.trophies.unlock('ballon');
        G.ui.toast('Kind: „Danke!!! Do hast 5 Taler aus meim Sparschwein!“', 4);
      }
    }
  }
  function drawBalloon(ctx, b) {
    // Kind
    E.drawPerson(ctx, { x: b.kx, y: b.ky, dir: Math.atan2(b.y - b.ky, b.x - b.kx), look: b.look, size: 0.65, armsUp: b.state === 'fly' });
    ellipse(ctx, b.x, b.y, 8 * Math.max(0.3, 1 - b.h / 200), 3, 'rgba(0,0,0,.25)');
    const by = b.y - b.h;
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(b.x, by + 14); ctx.quadraticCurveTo(b.x + 5, by + 30, b.x, by + 40); ctx.stroke();
    ellipse(ctx, b.x, by, 11, 14, b.col); ellipse(ctx, b.x - 4, by - 5, 3, 4, 'rgba(255,255,255,.5)');
    if (b.state === 'fly' && b.h > 110) txt(ctx, 'Schnell!', b.x, by - 24, 10, '#fff', 'center', '#000', 3);
  }

  // ---------- Roller-Rennen ----------
  const CPS = [[2240, 170], [2240, 805], [2820, 805], [2820, 1485], [2240, 1485], [2240, 1810], [1380, 1810], [660, 1810], [660, 465], [1380, 465], [1380, 170], [1660, 170]];
  function startRace(d) {
    const P = G.player;
    let r = P.vehicle;
    if (!r || r.type !== 'roller') { r = { type: 'roller', x: 1560, y: 165, a: 0, v: 0, col: '#ffe100' }; E.rollers.push(r); P.vehicle = r; }
    r.x = 1560; r.y = 160; r.a = 0; r.v = 0;
    const fl = { female: false, skin: '#f1c9a5', hair: '#d8b060', shirt: '#d62f3a', kind: 'kid' };
    race = { t: -3.5, idx: 0, fidx: 0, ferdl: { x: 1560, y: 195, a: 0, v: 0, look: fl, col: '#d62f3a', stumble: rand(10, 25) }, result: null, lastCount: 4 };
    G.ui.toast('Roller-Rennen! Fahr durch alle gelben Ringe. Wer zuerst zurück ist, gewinnt.', 4);
  }
  function updateRace(dt, P) {
    const r = race; if (!r || r.result) return;
    r.t += dt;
    const v = P.vehicle;
    if (r.t < 0) {
      if (v) { v.x = 1560; v.y = 160; v.v = 0; v.a = 0; P.x = v.x; P.y = v.y; }
      const c = Math.ceil(-r.t);
      if (c !== r.lastCount) { r.lastCount = c; G.audio.sfx.blip(c > 0 ? 600 : 1200); if (c > 0) G.ui.big(String(c), '', 0.9); }
      return;
    }
    if (r.lastCount !== 0) { r.lastCount = 0; G.ui.big('LOS!', '', 0.9, '#9cff7a'); G.audio.sfx.blip(1200); G.audio.say('Los!'); }
    if (!v || v.type !== 'roller') { r.result = 'fail'; G.ui.toast('Ohne Roller geht das Rennen nicht weiter!', 3); return; }
    const cp = CPS[r.idx];
    if (dist(P.x, P.y, cp[0], cp[1]) < 80) { r.idx++; G.audio.sfx.coin(); if (r.idx >= CPS.length) { r.result = 'win'; return; } }
    // Ferdl fährt die Ringe ab (mit Gummiband, damit es spannend bleibt)
    const f = r.ferdl, fc = CPS[r.fidx];
    const lead = (r.fidx - r.idx);
    let target = lead > 0 ? 250 : lead < -1 ? 340 : 300;
    r.ferdl.stumble -= dt;
    if (f.stumble < 0 && f.stumble > -1.5) { target = 60; if (!f.said) { f.said = true; f.say = 'Hoppla, a Dackel!'; } }
    else f.say = null;
    const dd = dist(f.x, f.y, fc[0], fc[1]);
    if (dd < 90) target *= 0.75;
    f.v += clamp(target - f.v, -500 * dt, 300 * dt);
    const ta = Math.atan2(fc[1] - f.y, fc[0] - f.x);
    f.a += clamp(angDiff(f.a, ta), -4 * dt, 4 * dt);
    f.x += Math.cos(f.a) * f.v * dt; f.y += Math.sin(f.a) * f.v * dt;
    if (dd < 45) { r.fidx++; if (r.fidx >= CPS.length) { r.result = 'fail'; G.audio.sfx.busted(); G.ui.toast('Ferdl: „Erster! Hehe – magst no amoi?“', 4); } }
  }
  function raceStatus() {
    const r = race; if (!r) return false;
    if (r.result === 'win') { race = null; G.trophies.unlock('rennen'); return true; }
    if (r.result === 'fail') { race = null; return 'fail'; }
    return false;
  }
  function drawRaceGround(ctx) {
    const r = race; if (!r) return;
    for (let k = 0; k < 2; k++) {
      const i = r.idx + k; if (i >= CPS.length) break;
      const [x, y] = CPS[i];
      ctx.globalAlpha = k ? 0.3 : 0.75;
      ctx.strokeStyle = i === CPS.length - 1 ? '#fff' : '#ffe100'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.ellipse(x, y, 70, 28, 0, 0, TAU); ctx.stroke();
      if (!k) { ctx.fillStyle = 'rgba(255,225,0,.18)'; ctx.fillRect(x - 6, y - 90, 12, 90); txt(ctx, i === CPS.length - 1 ? 'ZIEL' : String(i + 1), x, y - 100, 22, '#ffe100', 'center', '#000', 5); }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- Öffentliche Schnittstelle ----------
  function update(dt) {
    const P = G.player, g = G.game;
    updateParade(dt, P);
    updateLostKid(dt, P);
    updateBalloon(dt, P);
    updateRace(dt, P);
    // Radio-Moderator meldet sich ab und zu
    djT -= dt;
    if (djT <= 0) {
      djT = rand(150, 230);
      if (!G.ui.dialogOpen && !race && !G.audio.STATIONS[G.audio.station].off) {
        const line = pick(DJ)();
        G.ui.toast('📻 ' + G.audio.stationName.split(' – ')[0] + ': „' + line + '“', 6);
        G.audio.say(line, 1.05);
      }
    }
    // Letzter Wiesn-Tag: Böllerschießen an der Bavaria
    if (g.day % 16 === 0 && g.clock >= 720 && lastDayBoom !== g.day) {
      lastDayBoom = g.day;
      for (let i = 0; i < 20; i++) setTimeout(() => G.audio.sfx.boeller(), i * 350);
      G.ui.big('BÖLLERSCHIESSEN!', 'Letzter Wiesn-Tag: Vor der Bavaria lassen die Böllerschützen die historischen Böller krachen – Pfiat di, Wiesn!', 7);
      G.game.unlockFact('boeller');
    }
    if (!race && !lostKid && !balloon && !G.missions.active && g.clock < 1170) {
      nextEvent -= dt;
      if (nextEvent <= 0) { nextEvent = rand(80, 140); if (Math.random() < 0.55) spawnLostKid(P); else spawnBalloon(P); }
    }
  }
  function interactions() {
    const list = [];
    if (lostKid && lostKid.state === 'crying') list.push({ x: lostKid.x, y: lostKid.y, r: 40, label: () => 'Mit dem weinenden Kind reden', act: () => {
      G.ui.dialog([
        { who: lostKid.name, text: 'I … i find mei Mama nimmer! *schnief* Es san so vui Leit do!' },
        { who: G.player.name, text: 'Keine Angst! Ich weiß, wo der Treffpunkt ist: das Servicezentrum hinterm Schottenhamel. Komm mit!' },
      ], () => { if (lostKid) { lostKid.state = 'follow'; G.game.unlockFact('service'); G.ui.objective('Bring ' + lostKid.name + ' zum Servicezentrum hinter dem Schottenhamel.'); } });
    } });
    return list;
  }
  function drawables(inView) {
    const out = [];
    for (const u of parade) if (inView(u.x - 60, u.y - u.h - 30, 120, u.h + 40)) out.push({ y: u.y, draw: (ctx) => drawParadeUnit(ctx, u) });
    if (lostKid) out.push({ y: lostKid.y, draw: (ctx) => { E.drawPerson(ctx, lostKid); if (lostKid.say) speech(ctx, lostKid.x, lostKid.y - 34, lostKid.say); } });
    if (balloon) out.push({ y: Math.max(balloon.y, balloon.ky), draw: (ctx) => drawBalloon(ctx, balloon) });
    if (race) { const f = race.ferdl; out.push({ y: f.y, draw: (ctx) => { E.drawRoller(ctx, f, true); E.drawPerson(ctx, { x: f.x, y: f.y - 4, dir: f.a, look: f.look, size: 0.8, happy: true }); if (f.say) speech(ctx, f.x, f.y - 46, f.say); } }); }
    return out;
  }
  function speech(ctx, x, y, text) {
    ctx.font = '800 11px ' + FONT;
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = 'rgba(255,255,255,.92)'; rrect(ctx, x - w / 2, y - 18, w, 18, 6); ctx.fill();
    txt(ctx, text, x, y - 9, 11, '#222', 'center', null);
  }
  function blips() {
    const b = [];
    if (lostKid && lostKid.state === 'crying') b.push({ x: lostKid.x, y: lostKid.y, letter: '?', col: '#5ad0ff' });
    if (lostKid && lostKid.state === 'follow') b.push({ x: WD.places.service.x, y: WD.places.service.y, target: true });
    if (balloon) b.push(balloon.state === 'fly' ? { x: balloon.x, y: balloon.y, letter: '●', col: balloon.col } : { x: balloon.kx, y: balloon.ky, target: true });
    if (race && race.idx < CPS.length) b.push({ x: CPS[race.idx][0], y: CPS[race.idx][1], target: true });
    return b;
  }
  function drawHUD(ctx, W, H) {
    if (race && !race.result) {
      const pos = (race.idx > race.fidx || (race.idx === race.fidx && dist(G.player.x, G.player.y, CPS[race.idx][0], CPS[race.idx][1]) < dist(race.ferdl.x, race.ferdl.y, CPS[race.fidx][0], CPS[race.fidx][1]))) ? 1 : 2;
      txt(ctx, pos + '. PLATZ', W / 2, 70, 34, pos === 1 ? '#ffd84a' : '#ff9a9a', 'center', '#000', 6);
      txt(ctx, 'Ring ' + Math.min(race.idx + 1, CPS.length) + ' / ' + CPS.length + '   ·   ' + Math.max(0, race.t).toFixed(1) + ' s', W / 2, 104, 16, '#fff', 'center', '#000', 4);
    }
  }
  return {
    update, interactions, drawables, blips, drawHUD, drawRaceGround, startRace, raceStatus,
    get noHeat() { return !!race; },
    get busy() { return !!(race || (lostKid && lostKid.state === 'follow')); },
    raceTarget() { return race && race.idx < CPS.length ? { x: CPS[race.idx][0], y: CPS[race.idx][1] } : null; },
    reset() { parade = []; paradeDay = 0; lostKid = null; balloon = null; race = null; nextEvent = 70; },
    cancelRace() { race = null; },
    get lostKid() { return lostKid; }, get balloon() { return balloon; },
    debugSpawn(kind) { if (kind === 'kid') spawnLostKid(G.player); else spawnBalloon(G.player); },
  };
})();

// =====================================================================
// NEUE MISSION: Roller-Rennen gegen Ferdl
// =====================================================================
G.missions.add('rennen', {
  title: 'Ferdls Roller-Rennen', letter: 'V', color: '#9cff7a',
  giver: { name: 'Ferdl', x: 1600, y: 200, look: Object.assign(G.ent.randomLook('kid'), { kind: 'kid', female: false, shirt: '#d62f3a', hair: '#d8b060', hat: false }), size: 0.78 },
  req: () => G.missions.done.toboggan,
  steps: [
    { start(d) { G.ui.dialog([
      { who: 'Ferdl', text: 'Am Toboggan warst ja ganz guad. Aber auf’m Roller schlägst mi nie!' },
      { who: 'Ferdl', text: 'Rennen einmal rund um die Wiesn – durch alle gelben Ringe. Und Obacht auf d’Leit: Wer wen umfährt, verliert Zeit!' },
    ], () => { d.ok = true; }); }, update(dt, d) { return d.ok; } },
    {
      text: 'Roller-Rennen: Fahr durch alle gelben Ringe – schneller als Ferdl!',
      start(d) { G.events.startRace(d); },
      target() { return G.events.raceTarget(); },
      update() { return G.events.raceStatus(); },
    },
    { start(d) { G.ui.dialog([{ who: 'Ferdl', text: 'Wahnsinn, du bist ja schneller als da Föhn! Revanche gibt’s nächstes Jahr.' }], () => { d.ok = true; }); }, update(dt, d) { return d.ok; } },
  ],
  reward: { taler: 30, gaudi: 25 },
  onFail() { G.events.cancelRace(); },
});

// Erfolge für Toboggan und Teufelsrad
(function () {
  const tob = G.toboggan.start;
  G.toboggan.start = (opts, cb) => tob(opts, (res) => {
    if (res.falls === 0) G.trophies.unlock('tob_clean');
    if (res.falls >= 3) G.trophies.unlock('tob_laugh');
    cb(res);
  });
  const tr = G.teufelsrad.start;
  G.teufelsrad.start = (opts, cb) => tr(opts, (res) => {
    if (res.win) G.trophies.unlock(opts && opts.hard ? 'meister' : 'tr_win');
    cb(res);
  });
})();

// =====================================================================
// IM FESTZELT: Brotzeit mit Blaskapelle und Schunkeln
// =====================================================================
G.zelt = (function () {
  let st = null;
  function start(opts, onEnd) {
    st = { onEnd, t: 0, tent: opts.tent, prevStation: G.audio.station, people: [] };
    const rnd = mulberry32(opts.tent.x | 0);
    for (let row = 0; row < 5; row++) {
      const n = 7 + row * 2;
      for (let i = 0; i < n; i++) for (const side of [0, 1]) {
        if (row === 4 && side === 1 && Math.abs(i - n / 2) < 1) continue;
        const l = G.ent.randomLook(rnd() < 0.15 ? 'kid' : 'adult');
        st.people.push({ row, i, n, side, look: l });
      }
    }
    if (G.audio.station !== 1) { G.audio.setStation(1); }
    G.audio.say('Mahlzeit! Griaß di im ' + opts.tent.name + '!', 1.2);
  }
  function update(dt) {
    st.t += dt;
    if (st.t > 6 && (G.input.hit('act') || G.input.hit('space'))) {
      G.audio.setStation(st.prevStation);
      const cb = st.onEnd; st = null; cb();
    }
  }
  const rowY = (r) => 230 + r * 62, rowS = (r) => 0.55 + r * 0.17;
  function draw(ctx) {
    if (!st) return;
    const t = st.t, T = st.tent;
    // Decke
    if (T.id === 'hacker') {
      const g = ctx.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, '#5aa8e8'); g.addColorStop(1, '#bfe0ff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, 220);
      for (let i = 0; i < 7; i++) { const x = (i * 160 + t * 8) % (VW + 120) - 60, y = 40 + (i % 3) * 45; circle(ctx, x, y, 26, '#fff'); circle(ctx, x + 28, y + 6, 20, '#fff'); circle(ctx, x - 26, y + 8, 18, '#fff'); }
    } else {
      for (let i = 0; i < 16; i++) { ctx.fillStyle = T.roof[i % 2]; ctx.beginPath(); ctx.moveTo(VW / 2, -200); ctx.lineTo(i * 64 - 32, 220); ctx.lineTo(i * 64 + 32, 220); ctx.fill(); }
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, VW, 220);
    }
    // Hopfengirlanden bzw. Rauten-Fahnen
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = '#3f7f2f'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 60 + k * 50); for (let x = 0; x <= VW; x += 120) ctx.quadraticCurveTo(x + 60, 90 + k * 50, x + 120, 60 + k * 50); ctx.stroke();
      if (T.deco === 'rauten') for (let x = 60; x < VW; x += 120) rauten(ctx, x - 12, 84 + k * 50, 24, 30, 6);
    }
    // Lichter
    for (let i = 0; i < 6; i++) { const x = 80 + i * 160; ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 130); ctx.stroke(); circle(ctx, x, 140, 16, '#ffe9a0'); circle(ctx, x, 140, 30, 'rgba(255,230,150,.2)'); }
    // Holzboden
    const fg = ctx.createLinearGradient(0, 220, 0, VH); fg.addColorStop(0, '#8a6038'); fg.addColorStop(1, '#5a3a1e');
    ctx.fillStyle = fg; ctx.fillRect(0, 220, VW, VH - 220);
    ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(VW / 2 + i * 30, 220); ctx.lineTo(VW / 2 + i * 140, VH); ctx.stroke(); }
    // Wand und Musikpodium
    ctx.fillStyle = '#c99a5a'; ctx.fillRect(0, 200, VW, 40);
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(330, 150, 300, 60);
    ctx.fillStyle = '#5a3418'; ctx.fillRect(330, 205, 300, 10);
    for (let i = 0; i < 7; i++) {
      const mx = 360 + i * 40, my = 196, bob = Math.sin(t * 5.2 + i) * 1.5;
      const look = { female: false, skin: '#f1c9a5', hair: '#3a2412', shirt: '#ffffff', hat: true, kind: 'adult' };
      G.ent.drawPerson(ctx, { x: mx, y: my + bob, dir: Math.PI / 2, look, size: 1.1, carry: i === 3 ? null : i % 2 ? 'tuba' : 'trumpet', armsUp: i === 3 && Math.sin(t * 5.2) > 0 });
    }
    txt(ctx, T.name.toUpperCase(), VW / 2, 166, 15, '#ffd84a', 'center', '#000', 4);
    // Tischreihen mit schunkelnden Gästen
    const sway = Math.sin(t * Math.PI * 162 / 60 / 3) * 0.28;
    for (let r = 0; r < 5; r++) {
      const y = rowY(r), s = rowS(r);
      const n = 7 + r * 2, w = VW * (0.5 + r * 0.13), x0 = VW / 2 - w / 2;
      for (const p of st.people) if (p.row === r && p.side === 0) G.ent.drawPerson(ctx, { x: x0 + (p.i + 0.5) * w / n, y: y - 2, dir: Math.PI / 2, look: p.look, size: s * 1.3, lean: sway, happy: true });
      ctx.fillStyle = '#b07a44'; ctx.fillRect(x0 - 10, y - 4, w + 20, 12 * s + 4);
      ctx.fillStyle = '#8a5a2e'; ctx.fillRect(x0 - 10, y + 12 * s, w + 20, 4);
      for (let i = 0; i < n; i += 2) { const mx = x0 + (i + 0.7) * w / n; ctx.fillStyle = 'rgba(230,240,255,.85)'; ctx.fillRect(mx, y - 14 * s, 8 * s, 12 * s); ctx.fillStyle = '#fff'; ctx.fillRect(mx, y - 14 * s, 8 * s, 3 * s); }
      for (const p of st.people) if (p.row === r && p.side === 1) G.ent.drawPerson(ctx, { x: x0 + (p.i + 0.5) * w / n, y: y + 26 * s, dir: -Math.PI / 2, look: p.look, size: s * 1.3, lean: sway });
    }
    // Du am vordersten Tisch (von hinten)
    G.ent.drawPerson(ctx, { x: VW / 2, y: 540, dir: -Math.PI / 2, look: G.player.look, size: 3.2, lean: sway * 0.8, plush: G.player.plush });
    // Bedienung bringt die Brotzeit
    const bt = clamp((t - 1.5) / 2.5, 0, 1);
    const bx = lerp(VW + 60, VW / 2 + 120, smooth(bt));
    const bLook = { female: true, skin: '#f1c9a5', hair: '#7a4a22', dirndl: '#1a3a5a', apron: '#ffffff', braids: true, kind: 'adult' };
    G.ent.drawPerson(ctx, { x: bx, y: 520, dir: Math.PI, look: bLook, size: 3, moving: bt < 1, walk: t * 10, happy: true });
    if (t > 4) {
      ellipse(ctx, VW / 2 + 40, 470, 60, 16, '#f2f2f2');
      ellipse(ctx, VW / 2 + 40, 462, 40, 20, '#c97a2a'); ellipse(ctx, VW / 2 + 30, 455, 14, 8, 'rgba(255,230,180,.6)');
      ctx.fillStyle = 'rgba(230,240,255,.9)'; ctx.fillRect(VW / 2 - 70, 420, 28, 46);
      ctx.fillStyle = '#c0501a'; ctx.fillRect(VW / 2 - 67, 428, 22, 35);
      txt(ctx, 'Spezi', VW / 2 - 56, 410, 11, '#fff', 'center', '#000', 3);
      G.world.drawBrezn(ctx, VW / 2 + 110, 470, 12);
    }
    const lines = [[0.3, 'Griaß di im ' + T.name + '!'], [2, T.info], [4.2, 'Bedienung: „A halbe Hendl und a Spezi – an Guadn!“'], [6, 'Alle schunkeln mit! (Energie voll)  [E] wieder raus']];
    let cur = ''; for (const [tt, l] of lines) if (t > tt) cur = l;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, VW, 46);
    ctx.font = '700 16px ' + FONT;
    wrapText(ctx, cur, VW - 40).slice(0, 2).forEach((l, i) => txt(ctx, l, VW / 2, 14 + i * 20, 15, '#fff', 'center', null, 0, '700 '));
    for (let k = 0; k < 3; k++) { const p = (t * 0.5 + k / 3) % 1; ctx.globalAlpha = 1 - p; txt(ctx, '♪', 380 + k * 100, 140 - p * 80, 22, '#ffe46b', 'center', null); ctx.globalAlpha = 1; }
    G.ui.touchHint(ctx, ['E']);
  }
  return { start, update, draw, get _st() { return st; } };
})();
