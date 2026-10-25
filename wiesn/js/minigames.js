'use strict';
// Minispiele: Toboggan, Teufelsrad, Schichtl-Show, Riesenrad-/Bavaria-Aussicht
// Gezeichnet wird in einer virtuellen Auflösung von 960×540.
const VW = 960, VH = 540;

// Seitenansicht eines Kindes (für Toboggan); Füße bei (0,0)
function drawSideKid(ctx, x, y, rot, look, pose) {
  pose = pose || {};
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  const s = pose.scale || 1.6; ctx.scale(s, s);
  const legSw = pose.legSw || 0, arm = pose.arm || 0;
  // Beine
  ctx.strokeStyle = look.female ? look.skin : '#f2efe6'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-3 + legSw, 0); ctx.moveTo(0, -14); ctx.lineTo(3 - legSw, 0); ctx.stroke();
  ctx.fillStyle = '#3a2412'; ctx.fillRect(-6 + legSw, -2, 6, 3); ctx.fillRect(1 - legSw, -2, 6, 3);
  if (look.female) {
    ctx.fillStyle = look.dirndl; ctx.beginPath(); ctx.moveTo(-5, -26); ctx.lineTo(5, -26); ctx.lineTo(9, -10); ctx.lineTo(-9, -10); ctx.fill();
    ctx.fillStyle = look.apron; ctx.fillRect(1, -22, 6, 11);
    ctx.fillStyle = '#fff'; ctx.fillRect(-5, -32, 10, 6);
  } else {
    ctx.fillStyle = '#6a4022'; ctx.fillRect(-5, -18, 10, 6);
    ctx.fillStyle = look.shirt; ctx.fillRect(-5, -32, 10, 14);
    ctx.fillStyle = '#6a4022'; ctx.fillRect(-1, -32, 2, 14);
  }
  // Arme
  ctx.strokeStyle = look.female ? '#fff' : look.shirt; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(0, -29); ctx.lineTo(Math.cos(arm - 1) * 11, -29 + Math.sin(arm - 1) * 11);
  ctx.moveTo(0, -29); ctx.lineTo(Math.cos(-arm - 2.2) * 11, -29 + Math.sin(-arm - 2.2) * 11); ctx.stroke();
  ctx.lineCap = 'butt';
  circle(ctx, 0, -38, 7, look.skin);
  ctx.fillStyle = look.hair; ctx.beginPath(); ctx.arc(-1, -39, 7.3, Math.PI * 0.9, Math.PI * 2.05); ctx.fill();
  if (look.braids) ctx.fillRect(-8, -38, 3, 10);
  circle(ctx, 3.5, -38.5, 1.1, '#222');
  if (pose.mouth === 'o') circle(ctx, 4.5, -34.5, 1.6, '#7a2a1a');
  else { ctx.strokeStyle = '#7a2a1a'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(4, -35.5, 1.8, 0.2, Math.PI - 0.6); ctx.stroke(); }
  ctx.restore();
}

function drawSkyBg(ctx, top, bot) {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, top || '#5ab0f0'); g.addColorStop(1, bot || '#cfe9ff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

function drawCrowdRow(ctx, y, n, t, laugh, seed) {
  const rnd = mulberry32(seed || 3);
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * VW / n + (rnd() - 0.5) * 12;
    const hop = laugh > 0 ? Math.abs(Math.sin(t * 14 + i)) * 6 * laugh : Math.sin(t * 2 + i) * 1;
    const col = ['#2f6db5', '#c0392b', '#2f8a4a', '#8a5ad6', '#d97a2a', '#e86fb0'][Math.floor(rnd() * 6)];
    ctx.fillStyle = col; rrect(ctx, x - 14, y - 34 - hop, 28, 40, 9); ctx.fill();
    circle(ctx, x, y - 44 - hop, 11, ['#f1c9a5', '#e8b48a', '#c98e63', '#8d5a3b'][Math.floor(rnd() * 4)]);
    if (rnd() < 0.3) { ctx.fillStyle = '#2f5a2a'; ctx.fillRect(x - 9, y - 60 - hop, 18, 8); ellipse(ctx, x, y - 53 - hop, 14, 3, '#2f5a2a'); }
    if (laugh > 0.3) { ctx.fillStyle = '#5a1a0a'; ellipse(ctx, x, y - 40 - hop, 4, 3 * laugh, '#5a1a0a'); }
  }
}

// =====================================================================
// TOBOGGAN
// =====================================================================
G.toboggan = (function () {
  let st = null;
  const BELT_LEN = 8; // Meter – das berühmte Förderband
  const B0 = { x: 250, y: 455 }, B1 = { x: 610, y: 245 };
  const LAUGHS = ['HAHAHA!', 'Jetzt hat’s di!', 'Hoppala!', 'Nomoi!', 'Mei, is des schee!', 'Hihihi!', 'Purzelbaum!'];
  const TONI = ['Net aufgeben! Gewicht nach vorne!', 'Des Förderband is a Hund, gell?', 'Fast! Nomoi probieren!', 'Ganz ruhig – kleine Schritte!', 'Die Zuschauer lieben di!'];

  function start(opts, onEnd) {
    st = {
      opts: opts || {}, onEnd, phase: 'intro', t: 0, pt: 0,
      s: 0, th: 0, thv: 0, jerkT: 1, falls: 0, crawl: false, crawlUnlocked: false,
      laugh: 0, bubbles: [], fallAnim: 0, steps: 0, lastKey: null, hearts: 0, bonks: 0,
      slideY: 0, slideV: 260, px: 480, items: [], look: G.player.look, msg: '', msgT: 0, laughs: 0,
    };
    // Rutsche: Herzen verteilen
    for (let y = 600; y < 8600; y += 260) {
      const cx = laneX(y);
      st.items.push({ y, x: cx + rand(-60, 60), kind: Math.random() < 0.8 ? 'heart' : 'star', got: false });
    }
    G.audio.say('Willkommen am Toboggan! Rauf aufs Förderband!');
  }

  function laneX(y) { return 480 + Math.sin(y * 0.0036) * 170 + Math.sin(y * 0.0011 + 1) * 70; }
  const LANE_W = 190, SLIDE_LEN = 8800;

  function bubble(text, x, y, col) { st.bubbles.push({ text, x, y, t: 1.6, col: col || '#fff' }); }

  function beltPos(s) { const f = s / BELT_LEN; return { x: lerp(B0.x, B1.x, f), y: lerp(B0.y, B1.y, f) }; }

  function update(dt) {
    const I = G.input;
    st.t += dt; st.pt += dt;
    st.laugh = Math.max(0, st.laugh - dt * 0.6);
    for (const b of st.bubbles) { b.t -= dt; b.y -= dt * 30; }
    st.bubbles = st.bubbles.filter(b => b.t > 0);
    if (st.msgT > 0) st.msgT -= dt;

    if (st.phase === 'intro') {
      if (st.pt > 0.6 && (I.hit('act') || I.hit('space') || I.hit('right'))) { st.phase = 'belt'; st.pt = 0; }
      return;
    }
    if (st.phase === 'belt') {
      const easy = (st.falls >= 4 ? 0.75 : 1) * (st.helper ? 0.6 : 1) * (G.settings.easy ? 0.7 : 1);
      const vb = 1.15 * easy * (st.crawl ? 0.8 : 1);
      st.crawl = st.crawlUnlocked && I.down('down');
      // instabiles Gleichgewicht (umgedrehtes Pendel)
      const g = st.crawl ? 0.6 : 5.2;
      let u = 0;
      if (I.down('right') || I.down('up')) u += 1;
      if (I.down('left')) u -= 1;
      const ax = I.axis(); if (Math.abs(ax.x) > 0.2) u = clamp(ax.x * 1.4, -1, 1);
      st.jerkT -= dt;
      if (st.jerkT <= 0) {
        // das Band ruckelt
        st.jerkT = rand(0.5, 1.3) / easy;
        st.thv += (Math.random() < 0.75 ? -1 : 1) * rand(1.2, 2.6) * easy * (st.crawl ? 0.3 : 1);
      }
      const acc = g * Math.sin(st.th) - 0.9 * easy + u * 9.5 - 2.6 * st.thv;
      st.thv += acc * dt;
      st.th += st.thv * dt;
      if (st.crawl) st.th = clamp(st.th, -0.5, 0.5);
      st.s += vb * dt;
      if (Math.abs(st.th) > 1.05) {
        st.phase = 'fall'; st.pt = 0; st.falls++; st.fallDir = Math.sign(st.th);
        st.fallFrom = st.s; st.laugh = 1; st.laughs += randi(15, 40);
        G.audio.sfx.laugh(6); G.audio.sfx.boing();
        for (let k = 0; k < 4; k++) bubble(pick(LAUGHS), rand(80, 880), rand(380, 450), '#ffe46b');
        if (st.falls === 3) { st.helper = true; G.audio.say('Komm, i halt di an da Hand!'); }
        if (st.falls === 3) { st.msg = 'Ein Toboggan-Helfer hält dich jetzt an der Hand – so wie die echten Helfer bei Kindern!'; st.msgT = 5; }
        else if (st.falls === 2) { st.crawlUnlocked = true; st.msg = 'Tipp: Halte ↓ zum KRABBELN – so schaffen es viele!'; st.msgT = 5; }
        else { st.msg = 'Toboggan-Toni: „' + pick(TONI) + '“'; st.msgT = 3; }
        G.audio.say(pick(['Hoppala!', 'Jetzt hat’s di!', 'Nochmal!']));
      }
      if (st.s >= BELT_LEN) {
        st.phase = 'stairs'; st.pt = 0; st.steps = 0;
        G.audio.sfx.cheer();
        bubble(st.crawl ? 'Auf allen Vieren – zählt auch!' : 'BRAVO!', 640, 220, '#7fff7f');
        G.audio.say(st.crawl ? 'Auf allen Vieren! Des zählt aa!' : 'Bravo! Geschafft!');
      }
      return;
    }
    if (st.phase === 'fall') {
      // Purzeln zurück nach unten
      st.s = Math.max(0, st.fallFrom * (1 - smooth(Math.min(1, st.pt / 1.4))));
      if (st.pt > 2.0) { st.phase = 'belt'; st.pt = 0; st.s = 0; st.th = 0; st.thv = 0; st.jerkT = 1.2; }
      return;
    }
    if (st.phase === 'stairs') {
      // Wendeltreppe: abwechselnd links/rechts
      let k = null;
      if (I.hit('left')) k = 'L'; if (I.hit('right')) k = 'R';
      if (I.hit('act') || I.hit('space')) k = st.lastKey === 'L' ? 'R' : 'L';
      if (k && k !== st.lastKey) { st.steps++; st.lastKey = k; G.audio.sfx.step(); }
      if (st.steps >= 26) { st.phase = 'top'; st.pt = 0; G.audio.say('Oben! Jetzt auf die Kokosmatte und runter!'); G.game.unlockFact('tobmatte'); }
      return;
    }
    if (st.phase === 'top') {
      if (st.pt > 2.2) { st.phase = 'slide'; st.pt = 0; G.audio.sfx.whoosh(1.2); }
      return;
    }
    if (st.phase === 'slide') {
      const ax = I.axis();
      let u = ax.x; if (I.down('left')) u = -1; if (I.down('right')) u = 1;
      st.slideV = Math.min(640, st.slideV + dt * 28);
      st.slideY += st.slideV * dt;
      st.px += u * 380 * dt;
      const py = st.slideY + 380; // Weltposition des Spielers
      const cx = laneX(py);
      if (Math.abs(st.px - cx) > LANE_W / 2 - 18) {
        st.px = cx + Math.sign(st.px - cx) * (LANE_W / 2 - 18);
        if (!st.bonkT || st.t - st.bonkT > 0.4) { st.bonkT = st.t; st.bonks++; G.audio.sfx.bump(); st.slideV *= 0.9; }
      }
      for (const it of st.items) {
        if (it.got) continue;
        if (Math.abs(it.y - py) < 26 && Math.abs(it.x - st.px) < 30) {
          it.got = true; if (it.kind === 'heart') { st.hearts++; G.audio.sfx.coin(); } else { st.hearts += 3; G.audio.sfx.bell(); bubble('+3', st.px, 380, '#ffe46b'); }
        }
      }
      if (st.slideY > SLIDE_LEN) { st.phase = 'done'; st.pt = 0; G.audio.sfx.cheer(); G.audio.sfx.jingle(); G.audio.say('Bravo! A echter Toboggan-Profi!'); }
      return;
    }
    if (st.phase === 'done') {
      if (st.pt > 1.5 && (I.hit('act') || I.hit('space'))) {
        const reward = 12 + st.hearts + (st.falls === 0 ? 10 : 0);
        const cb = st.onEnd; const res = { win: true, falls: st.falls, hearts: st.hearts, reward, crawl: st.crawlUnlocked && st.crawl, laughs: st.laughs };
        st = null; cb(res);
      }
    }
  }

  function drawBg(ctx) {
    drawSkyBg(ctx, '#ff9a6a', '#ffe2b8');
    // Silhouetten im Hintergrund: Riesenrad & Zelte
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(150, 170, 110, 0, TAU); ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = st.t * 0.1 + i / 12 * TAU; ctx.beginPath(); ctx.moveTo(150, 170); ctx.lineTo(150 + Math.cos(a) * 110, 170 + Math.sin(a) * 110); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * 260 - 40, 400); ctx.quadraticCurveTo(i * 260 + 90, 320, i * 260 + 220, 400); ctx.fill(); }
    ctx.fillStyle = '#b8a888'; ctx.fillRect(0, 455, VW, 85);
  }

  function drawTower(ctx) {
    // Turm
    ctx.fillStyle = '#c99a5a'; ctx.fillRect(620, 40, 140, 420);
    ctx.fillStyle = '#a87a40'; for (let y = 50; y < 460; y += 22) ctx.fillRect(620, y, 140, 4);
    ctx.fillStyle = '#7a5428'; ctx.fillRect(620, 40, 8, 420); ctx.fillRect(752, 40, 8, 420);
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(600, 44); ctx.lineTo(690, -10); ctx.lineTo(780, 44); ctx.fill();
    ctx.fillStyle = '#1a2a5a'; rrect(ctx, 600, 60, 180, 40, 8); ctx.fill();
    txt(ctx, 'TOBOGGAN', 690, 80, 26, '#ffd84a', 'center', '#7a1a10', 5);
    // Rutsche außen
    ctx.strokeStyle = '#e0b070'; ctx.lineWidth = 22;
    ctx.beginPath(); ctx.moveTo(760, 130); ctx.quadraticCurveTo(900, 180, 760, 240); ctx.moveTo(760, 270); ctx.quadraticCurveTo(900, 320, 760, 380); ctx.moveTo(760, 400); ctx.quadraticCurveTo(900, 440, 820, 458); ctx.stroke();
    // Förderband
    ctx.save();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(B0.x, B0.y); ctx.lineTo(B1.x, B1.y); ctx.stroke();
    const len = Math.hypot(B1.x - B0.x, B1.y - B0.y), ux = (B1.x - B0.x) / len, uy = (B1.y - B0.y) / len;
    ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.lineCap = 'butt';
    const off = (st.t * 70) % 16;
    for (let d = off; d < len; d += 16) { const px = B0.x + ux * d, py = B0.y + uy * d; ctx.beginPath(); ctx.moveTo(px + uy * 11, py - ux * 11); ctx.lineTo(px - uy * 11, py + ux * 11); ctx.stroke(); }
    // Geländer
    ctx.strokeStyle = '#d0b070'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(B0.x + uy * 50, B0.y - ux * 50); ctx.lineTo(B1.x + uy * 50, B1.y - ux * 50); ctx.stroke();
    for (let d = 0; d <= len; d += len / 8) { const px = B0.x + ux * d, py = B0.y + uy * d; ctx.beginPath(); ctx.moveTo(px, py - 8); ctx.lineTo(px + uy * 50, py - ux * 50); ctx.stroke(); }
    ctx.restore();
    // Meter-Markierungen
    for (let m = 0; m <= BELT_LEN; m++) { const p = beltPos(m); txt(ctx, m + ' m', p.x + 16, p.y + 26, 12, '#fff', 'center', '#000', 3); }
  }

  function draw(ctx) {
    if (!st) return;
    const t = st.t;
    if (st.phase === 'slide' || (st.phase === 'done' && st.slideY > 0)) return drawSlide(ctx);
    if (st.phase === 'stairs' || st.phase === 'top') return drawStairs(ctx);
    drawBg(ctx);
    drawTower(ctx);
    // Spieler
    const p = beltPos(st.s);
    if (st.helper && st.phase !== 'fall') {
      const hp = beltPos(Math.max(0, st.s - 0.9));
      drawSideKid(ctx, hp.x, hp.y - 12, 0, { female: false, skin: '#e8b48a', hair: '#1a1a1a', shirt: '#2a2a2a' }, { scale: 1.9, arm: 0.9, legSw: Math.sin(t * 12) * 2.5 });
      ctx.strokeStyle = '#e8b48a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hp.x + 16, hp.y - 60); ctx.lineTo(p.x - 8, p.y - 62); ctx.stroke();
      txt(ctx, 'Helfer', hp.x, hp.y + 20, 11, '#fff', 'center', '#000', 3);
    }
    if (st.phase === 'fall') {
      const rot = st.pt * 9 * (st.fallDir || -1);
      drawSideKid(ctx, p.x, p.y - 14 - Math.sin(st.pt * 6) * 10, rot, st.look, { mouth: 'o', arm: Math.sin(st.pt * 20) * 1.5, legSw: 4 });
    } else if (st.crawl) {
      drawSideKid(ctx, p.x, p.y - 10, 1.25, st.look, { arm: 1.6 + Math.sin(t * 10) * 0.4, legSw: Math.sin(t * 10) * 3 });
    } else {
      const flail = clamp(Math.abs(st.thv) * 0.6 + Math.abs(st.th), 0, 2);
      drawSideKid(ctx, p.x, p.y - 12, st.th * 0.9, st.look, { arm: flail * Math.sin(t * 18) + 0.5, legSw: Math.sin(t * 12) * 2.5, mouth: Math.abs(st.th) > 0.6 ? 'o' : null });
    }
    // Zuschauer im Vordergrund
    drawCrowdRow(ctx, 560, 14, t, st.laugh, 7);
    for (const b of st.bubbles) { ctx.globalAlpha = clamp(b.t, 0, 1); txt(ctx, b.text, b.x, b.y, 22, b.col, 'center', '#000', 5); ctx.globalAlpha = 1; }
    // Anzeige: Gleichgewicht
    if (st.phase === 'belt' || st.phase === 'fall') {
      const mx = 160, my = 40, mw = 300;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, mx - 10, my - 18, mw + 20, 70, 10); ctx.fill();
      txt(ctx, 'GLEICHGEWICHT', mx + mw / 2, my - 4, 13, '#fff', 'center', null);
      const g = ctx.createLinearGradient(mx, 0, mx + mw, 0);
      g.addColorStop(0, '#e8203a'); g.addColorStop(0.3, '#f2d24a'); g.addColorStop(0.5, '#3ad46a'); g.addColorStop(0.7, '#f2d24a'); g.addColorStop(1, '#e8203a');
      ctx.fillStyle = g; rrect(ctx, mx, my + 6, mw, 16, 8); ctx.fill();
      const nx = mx + mw / 2 + clamp(st.th / 1.05, -1, 1) * mw / 2;
      ctx.fillStyle = '#fff'; ctx.fillRect(nx - 3, my + 2, 6, 24);
      txt(ctx, 'Förderband: ' + st.s.toFixed(1) + ' / 8 m   Stürze: ' + st.falls, mx + mw / 2, my + 38, 12, '#fff', 'center', null);
      txt(ctx, 'Lacher: ' + st.laughs, 820, 40, 18, '#ffe46b', 'center', '#000', 4);
    }
    if (st.phase === 'intro') introCard(ctx, 'DER TOBOGGAN', [
      'Das Förderband (8 Meter!) zieht dich nach oben – und die Füße weg.',
      'Halte mit ◀ ▶ das Gleichgewicht: Die Nadel muss im grünen Bereich bleiben!',
      'Oben geht’s die Wendeltreppe hinauf und dann auf der Matte die Holzrutsche hinunter.',
      'Keine Sorge: Wer hinfällt, bringt die Zuschauer zum Lachen. Das gehört dazu!',
    ], 'Los geht’s! [E / Leertaste]');
    if (st.msgT > 0) { ctx.globalAlpha = clamp(st.msgT, 0, 1); txt(ctx, st.msg, VW / 2, 130, 18, '#fff', 'center', '#000', 5); ctx.globalAlpha = 1; }
    G.ui.touchHint(ctx, st.crawlUnlocked ? ['◀', '▼', '▶'] : ['◀', '▶']);
  }

  function drawStairs(ctx) {
    const t = st.t;
    ctx.fillStyle = '#4a3420'; ctx.fillRect(0, 0, VW, VH);
    // Wendeltreppe im Turm
    const off = st.steps * 22;
    for (let i = -6; i < 30; i++) {
      const y = 470 - i * 22 + off;
      if (y < -30 || y > VH + 30) continue;
      const a = i * 0.55;
      const x = 480 + Math.sin(a) * 150;
      ctx.fillStyle = Math.cos(a) > 0 ? '#c99a5a' : '#8a6a3a';
      ctx.beginPath(); ctx.moveTo(480, y); ctx.lineTo(x - 50, y - 6); ctx.lineTo(x + 50, y + 6); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(470, 0, 20, VH);
    for (let y = (t * 0) % 40; y < VH; y += 40) { ctx.fillStyle = 'rgba(255,230,160,.08)'; ctx.fillRect(0, y, VW, 2); }
    const a = st.steps * 0.55;
    drawSideKid(ctx, 480 + Math.sin(a) * 110, 440, 0, st.look, { legSw: st.steps % 2 ? 4 : -4, arm: 0.6 });
    txt(ctx, 'WENDELTREPPE', VW / 2, 50, 30, '#ffd84a', 'center', '#000', 6);
    txt(ctx, 'Drücke abwechselnd ◀ ▶ (oder E/Leertaste)!', VW / 2, 90, 18, '#fff', 'center', '#000', 4);
    const pr = st.steps / 26;
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rrect(ctx, 330, 495, 300, 22, 11); ctx.fill();
    ctx.fillStyle = '#3ad46a'; rrect(ctx, 333, 498, 294 * pr, 16, 8); ctx.fill();
    txt(ctx, 'Stufe ' + st.steps + ' / 26', VW / 2, 470, 14, '#fff', 'center', '#000', 3);
    if (st.phase === 'top') {
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 0, VW, VH);
      txt(ctx, 'OBEN!', VW / 2, VH / 2 - 30, 64, '#ffd84a', 'center', '#000', 10);
      txt(ctx, 'Setz dich auf die Kokosmatte … und los!', VW / 2, VH / 2 + 30, 22, '#fff', 'center', '#000', 5);
    }
    G.ui.touchHint(ctx, ['◀', '▶']);
  }

  function drawSlide(ctx) {
    const t = st.t;
    ctx.fillStyle = '#6a8a4a'; ctx.fillRect(0, 0, VW, VH);
    // Zuschauer am Rand (Streifen)
    const camY = st.slideY;
    for (let sy = -((camY * 0.6) % 120); sy < VH; sy += 120) {
      for (const side of [0, 1]) { const x = side ? VW - 40 : 40; circle(ctx, x, sy + 30, 14, '#f1c9a5'); ctx.fillStyle = ['#2f6db5', '#c0392b'][side]; ctx.fillRect(x - 14, sy + 44, 28, 30); }
    }
    // Rutschbahn (Holz)
    ctx.beginPath();
    for (let y = -20; y <= VH + 20; y += 10) { const x = laneX(camY + y) - LANE_W / 2 - 14; if (y === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    for (let y = VH + 20; y >= -20; y -= 10) ctx.lineTo(laneX(camY + y) + LANE_W / 2 + 14, y);
    ctx.closePath(); ctx.fillStyle = '#7a4a26'; ctx.fill();
    ctx.beginPath();
    for (let y = -20; y <= VH + 20; y += 10) { const x = laneX(camY + y) - LANE_W / 2; if (y === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    for (let y = VH + 20; y >= -20; y -= 10) ctx.lineTo(laneX(camY + y) + LANE_W / 2, y);
    ctx.closePath(); ctx.fillStyle = '#e0b070'; ctx.fill();
    // Holzbretter
    ctx.strokeStyle = 'rgba(120,70,30,.35)'; ctx.lineWidth = 2;
    for (let y = -((camY) % 40); y < VH; y += 40) { const cx = laneX(camY + y); ctx.beginPath(); ctx.moveTo(cx - LANE_W / 2, y); ctx.lineTo(cx + LANE_W / 2, y); ctx.stroke(); }
    // Tempo-Streifen
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2;
    for (let k = 0; k < 10; k++) { const y = ((k * 97 + t * st.slideV) % VH); const x = laneX(camY + y) + ((k * 53) % LANE_W) - LANE_W / 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 30); ctx.stroke(); }
    // Herzen
    for (const it of st.items) {
      if (it.got) continue;
      const y = it.y - camY; if (y < -30 || y > VH + 30) continue;
      if (it.kind === 'heart') G.world.drawHeart(ctx, it.x, y + Math.sin(t * 5 + it.y) * 3, 14, '#e84d8a');
      else txt(ctx, '★', it.x, y, 34, '#ffe46b', 'center', '#a07000', 4);
    }
    // Spieler auf der Matte (von oben)
    const py = 380;
    ctx.save(); ctx.translate(st.px, py);
    ctx.fillStyle = '#c9b28a'; rrect(ctx, -18, -10, 36, 40, 6); ctx.fill();
    ctx.fillStyle = st.look.female ? st.look.dirndl : st.look.shirt; rrect(ctx, -12, -6, 24, 22, 8); ctx.fill();
    circle(ctx, 0, -12, 10, st.look.hair);
    ctx.strokeStyle = st.look.skin; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-22, -16 - Math.sin(t * 8) * 3); ctx.moveTo(10, 0); ctx.lineTo(22, -16 + Math.sin(t * 8) * 3); ctx.stroke();
    ctx.restore();
    // HUD
    txt(ctx, '♥ ' + st.hearts, 70, 40, 28, '#ff6b9a', 'center', '#000', 5);
    const pr = clamp(st.slideY / SLIDE_LEN, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rrect(ctx, VW - 50, 60, 20, 300, 10); ctx.fill();
    ctx.fillStyle = '#ffd84a'; rrect(ctx, VW - 47, 63, 14, 294 * pr, 7); ctx.fill();
    txt(ctx, Math.round(st.slideV / 10) + ' km/h', VW - 40, 380, 13, '#fff', 'center', '#000', 3);
    if (st.pt < 2.5 && st.phase === 'slide') txt(ctx, 'Lenke mit ◀ ▶ – sammle Lebkuchenherzen!', VW / 2, 60, 22, '#fff', 'center', '#000', 5);
    if (st.phase === 'done') {
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, VW, VH);
      txt(ctx, 'UNTEN ANGEKOMMEN!', VW / 2, 150, 46, '#ffd84a', 'center', '#000', 8);
      txt(ctx, 'Gesammelte Herzen: ' + st.hearts, VW / 2, 230, 24, '#fff', 'center', '#000', 5);
      txt(ctx, 'Stürze auf dem Förderband: ' + st.falls + (st.falls === 0 ? '  (Profi-Bonus +10!)' : ''), VW / 2, 270, 22, '#fff', 'center', '#000', 5);
      txt(ctx, 'Zuschauer-Lacher: ' + st.laughs, VW / 2, 310, 22, '#ffe46b', 'center', '#000', 5);
      if (st.pt > 1.5) txt(ctx, 'Weiter [E / Leertaste]', VW / 2, 400, 20, '#fff', 'center', '#000', 4);
    }
    G.ui.touchHint(ctx, ['◀', '▶']);
  }

  return { start, update, draw, get active() { return !!st; }, get _st() { return st; } };
})();

function introCard(ctx, title, lines, foot) {
  ctx.fillStyle = 'rgba(10,10,30,.78)'; rrect(ctx, 120, 90, 720, 360, 20); ctx.fill();
  ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 3; ctx.stroke();
  txt(ctx, title, VW / 2, 140, 40, '#ffd84a', 'center', '#000', 7);
  ctx.font = '700 18px ' + FONT;
  let y = 200;
  for (const l of lines) {
    const wl = wrapText(ctx, l, 640);
    for (const w of wl) { txt(ctx, w, VW / 2, y, 17, '#fff', 'center', null, 0, '700 '); y += 26; }
    y += 6;
  }
  txt(ctx, foot, VW / 2, 420, 20, '#7fff9a', 'center', '#000', 4);
}

// =====================================================================
// TEUFELSRAD
// =====================================================================
G.teufelsrad = (function () {
  let st = null;
  const CX = 480, CY = 300, R = 200, WALL = 250;
  const NAMES = ['Ferdl', 'Vroni', 'Sepperl', 'Lena', 'Korbi', 'Resi', 'Quirin', 'Fanny'];
  const OUT_LINES = ['Pfiat di, {n}!', 'Der {n} fliagt!', 'Servus, {n}!', 'Und weg is {n}!', '{n} hat’s erwischt!'];

  function start(opts, onEnd) {
    const hard = !!(opts && opts.hard);
    const assist = Math.min(4, (opts && opts.assist) || 0);
    st = {
      hard, onEnd, phase: 'intro', t: 0, pt: 0, phi: 0, w: 0, spinT: 0,
      riders: [], ball: null, ballT: hard ? 7 : 11, lasso: null, lassoT: hard ? 22 : 38,
      say: '', sayT: 0, popups: [], result: null, stamina: 100, crowdT: 0,
    };
    const look = G.player.look;
    const n = hard ? 6 : 5;
    const names = ['Ferdl'].concat(NAMES.slice(1).sort(() => Math.random() - 0.5)).slice(0, n);
    for (let i = 0; i <= n; i++) {
      const a = i / (n + 1) * TAU + 0.3;
      const isP = i === 0;
      const rl = isP ? look : G.ent.randomLook('kid');
      if (!isP && names[i - 1] === 'Ferdl') { rl.female = false; rl.shirt = '#d62f3a'; rl.hair = '#d8b060'; rl.hat = false; }
      st.riders.push({
        isP, name: isP ? G.player.name : names[i - 1], look: rl,
        x: Math.cos(a) * (WALL - 20), y: Math.sin(a) * (WALL - 20), vx: 0, vy: 0, out: false, outT: 0,
        sx: 0, sy: 0, svx: 0, svy: 0,
        force: isP ? 390 : (names[i - 1] === 'Ferdl' ? (hard ? 330 : 290) : rand(180, 265) + (hard ? 30 : 0)) - assist * 18,
        stamina: 100, pushing: false, lassoed: false, onDisc: false, dir: 0,
      });
    }
    announce(hard ? 'Und jetzt die Meisterrunde! Nur die Allerbesten aufs Teufelsrad!' : 'Es fahren alle Kinder zwischen acht und vierzehn Jahren!');
  }

  function announce(s) { st.say = s; st.sayT = 3.2; G.audio.say(s, 0.8); }
  function popup(text, x, y, col) { st.popups.push({ text, x, y, t: 1.8, col: col || '#fff' }); }

  // Scheiben- in Bildschirmkoordinaten
  function toScreen(x, y) { const c = Math.cos(st.phi), s = Math.sin(st.phi); return { x: CX + x * c - y * s, y: CY + (x * s + y * c) * 0.62 }; }

  function update(dt) {
    const I = G.input;
    st.t += dt; st.pt += dt;
    if (st.sayT > 0) st.sayT -= dt;
    for (const p of st.popups) { p.t -= dt; p.y -= 25 * dt; }
    st.popups = st.popups.filter(p => p.t > 0);
    const P = st.riders[0];

    if (st.phase === 'intro') {
      if (st.pt > 0.6 && (I.hit('act') || I.hit('space'))) { st.phase = 'rush'; st.pt = 0; announce('Auf geht’s! Rauf auf die Scheibe!'); }
      return;
    }
    if (st.phase === 'rush' || st.phase === 'spin') {
      if (st.phase === 'rush' && st.pt > 3.2) {
        st.phase = 'spin'; st.pt = 0; announce('Und jetzt dreht sich das Teufelsrad!'); G.audio.sfx.whoosh(1);
        // Nachzügler werden noch schnell auf den Rand der Scheibe gesetzt
        for (const r of st.riders) { const d = Math.hypot(r.x, r.y); if (d > R - 20) { r.x *= (R - 20) / d; r.y *= (R - 20) / d; } r.onDisc = true; }
      }
      if (st.phase === 'spin') {
        st.spinT += dt;
        const maxW = st.hard ? 2.55 : 2.15;
        const prevStage = Math.floor((st.w / maxW) * 4);
        st.w = Math.min(maxW, 0.35 + st.spinT * (st.hard ? 0.05 : 0.04));
        const stage = Math.floor((st.w / maxW) * 4);
        if (stage > prevStage && stage < 4) announce(pick(['A bisserl schneller!', 'Jetzt wird’s ernst!', 'Haltet’s euch fest!']));
        st.phi += st.w * dt;
      }
      const w = st.w;
      // Spielereingabe (Bildschirm -> Scheibenkoordinaten)
      const ax = I.axis();
      let ix = ax.x, iy = ax.y;
      const il = Math.hypot(ix, iy);
      if (il > 0.01) { iy /= 0.62; const l2 = Math.hypot(ix, iy); ix = ix / l2 * Math.min(1, il); iy = iy / l2 * Math.min(1, il); }
      // Bildschirm-y ist gestaucht (0.62) – zurückrechnen und gegen die Drehung
      const c = Math.cos(-st.phi), s = Math.sin(-st.phi);
      const dix = ix * c - iy * s, diy = ix * s + iy * c;
      for (const r of st.riders) {
        if (r.out) {
          r.outT += dt;
          r.sx += r.svx * dt; r.sy += r.svy * dt; r.svx *= 0.96; r.svy *= 0.96;
          const dx = r.sx - CX, dy = (r.sy - CY) / 0.62, d = Math.hypot(dx, dy);
          if (d > WALL + 15) { r.sx = CX + dx / d * (WALL + 15); r.sy = CY + dy / d * (WALL + 15) * 0.62; r.svx = 0; r.svy = 0; }
          continue;
        }
        let fx = 0, fy = 0;
        const rr = Math.hypot(r.x, r.y);
        if (r.isP) {
          r.pushing = il > 0.15;
          if (r.pushing) r.stamina = Math.max(0, r.stamina - dt * 11); else r.stamina = Math.min(100, r.stamina + dt * 16);
          const f = r.force * (r.stamina > 0 ? 1 : 0.45);
          fx = dix * f; fy = diy * f;
          // Lasso-Befreiung
          if (r.lassoed && (I.hit('space') || I.hit('act'))) { r.lassoHits = (r.lassoHits || 0) + 1; G.audio.sfx.blip(500 + r.lassoHits * 60); if (r.lassoHits >= 6) { r.lassoed = false; st.lasso = null; popup('Befreit!', 480, 120, '#7fff7f'); G.audio.say('Respekt!'); } }
        } else {
          // KI: zur Mitte, mit Kraft haushalten
          const want = rr > 22 && (r.stamina > 25 || rr > 70);
          r.pushing = want;
          if (want) r.stamina = Math.max(0, r.stamina - dt * 17); else r.stamina = Math.min(100, r.stamina + dt * 16);
          const f = r.force * (r.stamina > 0 ? 1 : 0.4);
          if (rr > 0.1) { fx = -r.x / rr * f; fy = -r.y / rr * f; }
          if (st.phase === 'rush') { fx *= 1.2; fy *= 1.2; }
          if (r.lassoed && r.lassoTime && st.t - r.lassoTime > 2.2 && Math.random() < dt * 0.6) { r.lassoed = false; st.lasso = null; }
        }
        // Kräfte im rotierenden System
        const grip = 90;
        let cf = w * w * rr;
        cf = Math.max(0, cf - grip);
        let ax2 = 0, ay2 = 0;
        if (rr > 0.1) { ax2 += r.x / rr * cf; ay2 += r.y / rr * cf; }
        ax2 += 2 * w * r.vy; ay2 += -2 * w * r.vx; // Coriolis
        ax2 += fx; ay2 += fy;
        if (r.lassoed && rr > 0.1) { const lp = r.isP ? 170 : 300; ax2 += r.x / rr * lp; ay2 += r.y / rr * lp; }
        ax2 -= r.vx * 2.6; ay2 -= r.vy * 2.6;
        r.vx += ax2 * dt; r.vy += ay2 * dt;
        r.x += r.vx * dt; r.y += r.vy * dt;
        // Während des Ansturms ist die Wand außen die Grenze
        const lim = st.phase === 'rush' ? WALL - 12 : R + 4;
        const nr = Math.hypot(r.x, r.y);
        if (st.phase === 'rush' && nr > lim) { r.x *= lim / nr; r.y *= lim / nr; }
        if (nr < R) r.onDisc = true;
        if (st.phase === 'spin' && nr > R + 4 && r.onDisc) {
          r.out = true; r.lassoed = false;
          if (st.lasso && st.lasso.r === r) st.lasso = null;
          const sp = toScreen(r.x, r.y);
          // Geschwindigkeit im Bildschirmsystem: v + ω × r
          const vx = r.vx - w * r.y, vy = r.vy + w * r.x;
          const cc = Math.cos(st.phi), ss = Math.sin(st.phi);
          r.sx = sp.x; r.sy = sp.y; r.svx = (vx * cc - vy * ss) * 1.2; r.svy = (vx * ss + vy * cc) * 0.62 * 1.2;
          G.audio.sfx.whoosh(0.4); G.audio.sfx.laugh(3);
          if (r.isP) { finish(false); return; }
          popup(r.name + ' fliegt!', sp.x, sp.y - 30, '#ffb0b0');
          announce(pick(OUT_LINES).replace('{n}', r.name));
        }
        r.dir = Math.atan2(r.vy, r.vx);
      }
      // Kollisionen zwischen Kindern
      const alive = st.riders.filter(r => !r.out);
      for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i], b = alive[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = 30;
        if (d < m && d > 0.01) {
          const nx = dx / d, ny = dy / d, ov = (m - d) / 2;
          a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) { const imp = -rv * 0.9; a.vx -= nx * imp * 0.5; a.vy -= ny * imp * 0.5; b.vx += nx * imp * 0.5; b.vy += ny * imp * 0.5; }
        }
      }
      if (st.phase === 'spin') {
        // Der Ball am Seil
        st.ballT -= dt;
        if (!st.ball && st.ballT <= 0 && alive.length > 1) {
          // Ziel: meist wer der Mitte am nächsten ist
          const npcs = alive.filter(r => !r.isP);
          const tgt = Math.random() < (st.hard ? 0.45 : 0.3) ? alive.find(r => r.isP) || alive[0] : (Math.random() < 0.6 ? npcs.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))[0] : pick(npcs));
          const tp = toScreen(tgt.x, tgt.y);
          const ang = rand(0, TAU);
          st.ball = { tx: tp.x, ty: tp.y, ang, t: 0, warn: st.hard ? 1.0 : 1.3, dur: 1.1, hit: new Set() };
          announce('Achtung, der Ball!');
          st.ballT = st.hard ? rand(5, 8) : rand(8, 12);
        }
        if (st.ball) {
          const b = st.ball; b.t += dt;
          if (b.t > b.warn) {
            const f = (b.t - b.warn) / b.dur;
            const L = 330;
            b.x = b.tx + Math.cos(b.ang) * lerp(-L, L, f); b.y = b.ty + Math.sin(b.ang) * lerp(-L, L, f) * 0.62;
            if (Math.abs(f - 0.5) < 0.05 && !b.swooshed) { b.swooshed = true; G.audio.sfx.whoosh(0.5); }
            for (const r of alive) {
              if (b.hit.has(r)) continue;
              const sp = toScreen(r.x, r.y);
              if (dist(sp.x, (sp.y - CY) / 0.62, b.x, (b.y - CY) / 0.62) < 40) {
                b.hit.add(r); G.audio.sfx.bump();
                // Stoß in Ballrichtung (in Scheibenkoordinaten)
                const c2 = Math.cos(-st.phi), s2 = Math.sin(-st.phi);
                const ix2 = Math.cos(b.ang), iy2 = Math.sin(b.ang);
                const imp = r.isP ? (st.hard ? 260 : 200) : 420;
                r.vx += (ix2 * c2 - iy2 * s2) * imp; r.vy += (ix2 * s2 + iy2 * c2) * imp;
                popup('BUMM!', sp.x, sp.y - 40, '#ffe46b');
              }
            }
            if (f >= 1) st.ball = null;
          }
        }
        // Das Lasso
        st.lassoT -= dt;
        if (!st.lasso && st.lassoT <= 0 && alive.length > 1) {
          const cand = alive.slice().sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
          const np = cand.filter(x => !x.isP);
          const r = Math.random() < (st.hard ? 0.4 : 0.25) ? cand.find(x => x.isP) : (np.length ? pick(np) : cand[0]);
          r.lassoed = true; r.lassoTime = st.t; r.lassoHits = 0;
          st.lasso = { r, from: rand(0, TAU) };
          announce(r.isP ? 'Jetzt kommt das Lasso! Wehr dich!' : 'Das Lasso für ' + r.name + '!');
          st.lassoT = st.hard ? rand(9, 13) : rand(13, 18);
        }
        // Gewonnen?
        const goal = st.hard ? 80 : 70;
        if (alive.length === 1 && alive[0].isP) { finish(true); return; }
        if (st.spinT > goal) { finish(true, true); return; }
      }
      st.stamina = P.stamina;
      return;
    }
    if (st.phase === 'end') {
      for (const r of st.riders) if (r.out) { r.sx += r.svx * dt; r.sy += r.svy * dt; r.svx *= 0.95; r.svy *= 0.95; }
      st.w *= 0.985; st.phi += st.w * dt;
      if (st.pt > 1.6 && (I.hit('act') || I.hit('space'))) {
        const res = st.result; const cb = st.onEnd; st = null; cb(res);
      } else if (st.pt > 1.6 && !st.result.win && I.hit('back')) {
        const cb = st.onEnd; const res = Object.assign({}, st.result, { quit: true }); st = null; cb(res);
      }
    }
  }

  function finish(win, timeUp) {
    st.phase = 'end'; st.pt = 0;
    const left = st.riders.filter(r => !r.out).length;
    st.result = { win, left, time: st.spinT, reward: win ? (st.hard ? 60 : 35) : 0 };
    if (win) {
      G.audio.sfx.cheer(); G.audio.sfx.jingle();
      announce(timeUp ? 'Die Zeit ist um! Bravo, du hast durchgehalten!' : 'Bravo! Wir haben einen Sieger!');
    } else {
      G.audio.sfx.busted();
      announce('Hoppala, des war nix! Nochmal?');
    }
  }

  function draw(ctx) {
    if (!st) return;
    const t = st.t;
    // Halle
    ctx.fillStyle = '#2a1414'; ctx.fillRect(0, 0, VW, VH);
    // Zuschauergalerie
    for (let row = 0; row < 3; row++) drawCrowdRow(ctx, 60 + row * 26, 22 - row, t + row, st.phase === 'end' ? 0.8 : (st.popups.length ? 0.6 : 0), 11 + row);
    // gepolsterte Bande
    ellipse(ctx, CX, CY + 18, WALL + 26, (WALL + 26) * 0.62, '#1a0a0a');
    ellipse(ctx, CX, CY, WALL + 22, (WALL + 22) * 0.62, '#a01e1e');
    ellipse(ctx, CX, CY, WALL + 6, (WALL + 6) * 0.62, '#5a3a2a');
    ellipse(ctx, CX, CY, WALL, WALL * 0.62, '#4a2e20');
    // Die Scheibe
    ellipse(ctx, CX, CY + 10, R, R * 0.62, '#6a4020');
    ellipse(ctx, CX, CY, R, R * 0.62, '#c9935a');
    ctx.save();
    ctx.beginPath(); ctx.ellipse(CX, CY, R, R * 0.62, 0, 0, TAU); ctx.clip();
    for (let i = 0; i < 16; i++) {
      const a = st.phi + i / 16 * TAU;
      ctx.strokeStyle = i % 2 ? 'rgba(90,50,20,.35)' : 'rgba(255,230,180,.25)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R * 0.62); ctx.stroke();
    }
    for (const rr of [60, 120, 180]) { ctx.strokeStyle = 'rgba(90,50,20,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(CX, CY, rr, rr * 0.62, 0, 0, TAU); ctx.stroke(); }
    G.world.drawDevil(ctx, CX + Math.cos(st.phi) * 120, CY + Math.sin(st.phi) * 120 * 0.62, 12, t);
    ctx.restore();
    circle(ctx, CX, CY, 8, '#8a5a2e');
    // Ball-Warnung
    if (st.ball) {
      const b = st.ball;
      if (b.t <= b.warn) {
        ctx.strokeStyle = 'rgba(255,60,60,' + (0.4 + 0.4 * Math.sin(t * 20)) + ')'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
        ctx.beginPath(); ctx.moveTo(b.tx - Math.cos(b.ang) * 330, b.ty - Math.sin(b.ang) * 330 * 0.62); ctx.lineTo(b.tx + Math.cos(b.ang) * 330, b.ty + Math.sin(b.ang) * 330 * 0.62); ctx.stroke(); ctx.setLineDash([]);
        txt(ctx, '!', b.tx, b.ty - 50, 40, '#ff4040', 'center', '#000', 6);
      }
    }
    // Kinder (sortiert nach Tiefe)
    const list = st.riders.map(r => {
      if (r.out) return { r, x: r.sx, y: r.sy };
      const p = toScreen(r.x, r.y); return { r, x: p.x, y: p.y };
    }).sort((a, b) => a.y - b.y);
    for (const it of list) {
      const r = it.r;
      const fake = { x: it.x, y: it.y + 12, dir: r.dir + st.phi, look: r.look, size: 1.3, moving: r.pushing && !r.out, walk: t * 14, happy: !r.out, lean: r.out ? Math.min(1.4, r.outT * 3) : 0, armsUp: r.out };
      G.ent.drawPerson(ctx, fake);
      if (r.isP) { ctx.fillStyle = '#ffe46b'; ctx.beginPath(); ctx.moveTo(it.x - 8, it.y - 58); ctx.lineTo(it.x + 8, it.y - 58); ctx.lineTo(it.x, it.y - 46); ctx.fill(); }
      if (r.isP || r.name === 'Ferdl' || r.out) txt(ctx, r.name, it.x, it.y + 26, 11, r.isP ? '#ffe46b' : '#fff', 'center', '#000', 3);
      if (r.lassoed) {
        const from = { x: CX + Math.cos(st.lasso ? st.lasso.from : 0) * (WALL + 20), y: CY + Math.sin(st.lasso ? st.lasso.from : 0) * (WALL + 20) * 0.62 };
        ctx.strokeStyle = '#d8b070'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo((from.x + it.x) / 2, (from.y + it.y) / 2 + 30, it.x, it.y - 20); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(it.x, it.y - 20, 18, 8, 0, 0, TAU); ctx.stroke();
      }
    }
    // Ball
    if (st.ball && st.ball.t > st.ball.warn) {
      const b = st.ball;
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX, -20); ctx.lineTo(b.x, b.y - 30); ctx.stroke();
      ellipse(ctx, b.x, b.y + 6, 26, 10, 'rgba(0,0,0,.35)');
      circle(ctx, b.x, b.y - 30, 28, '#e8203a'); circle(ctx, b.x - 9, b.y - 40, 9, 'rgba(255,255,255,.5)');
    }
    // Rekommandeur mit Mikrofon
    const rx = 70, ry = 470;
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(rx - 40, ry - 10, 80, 80);
    ctx.fillStyle = '#f2d24a'; ctx.fillRect(rx - 40, ry - 14, 80, 6);
    circle(ctx, rx, ry - 34, 14, '#f1c9a5'); ctx.fillStyle = '#2f5a2a'; ctx.fillRect(rx - 13, ry - 58, 26, 12); ellipse(ctx, rx, ry - 47, 20, 4, '#2f5a2a');
    ctx.fillStyle = '#ddd'; ctx.fillRect(rx - 2, ry - 52, 3, 8);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(rx - 14, ry - 20, 28, 12);
    ctx.fillStyle = '#222'; ctx.fillRect(rx + 12, ry - 34, 14, 4); circle(ctx, rx + 28, ry - 32, 4, '#444');
    if (st.sayT > 0) {
      ctx.font = '900 16px ' + FONT;
      const lines = wrapText(ctx, st.say, 380);
      const bh = lines.length * 22 + 16;
      ctx.fillStyle = '#fff'; rrect(ctx, rx + 30, ry - 60 - bh, 400, bh, 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(rx + 40, ry - 62); ctx.lineTo(rx + 20, ry - 40); ctx.lineTo(rx + 60, ry - 62); ctx.fill();
      lines.forEach((l, i) => txt(ctx, l, rx + 230, ry - 60 - bh + 19 + i * 22, 15, '#222', 'center', null));
    }
    // HUD
    if (st.phase === 'spin' || st.phase === 'rush') {
      const P = st.riders[0];
      ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, 700, 450, 240, 76, 10); ctx.fill();
      txt(ctx, 'KRAFT', 730, 470, 12, '#fff', 'left', null);
      ctx.fillStyle = '#333'; rrect(ctx, 780, 462, 145, 14, 7); ctx.fill();
      ctx.fillStyle = P.stamina > 30 ? '#3ad46a' : '#e8603a'; rrect(ctx, 780, 462, 145 * P.stamina / 100, 14, 7); ctx.fill();
      const goal = st.hard ? 80 : 70;
      txt(ctx, 'Zeit: ' + Math.max(0, goal - st.spinT).toFixed(0) + ' s', 730, 494, 14, '#fff', 'left', null);
      txt(ctx, 'Noch drauf: ' + st.riders.filter(r => !r.out).length, 830, 494, 14, '#ffe46b', 'left', null);
      txt(ctx, 'Tempo: ' + '●'.repeat(1 + Math.floor(st.w / (st.hard ? 2.55 : 2.15) * 4)), 730, 514, 12, '#ff9a6a', 'left', null);
      if (P.lassoed) txt(ctx, 'LASSO! Hämmere auf LEERTASTE / E! (' + (P.lassoHits || 0) + '/6)', VW / 2, 40, 22, '#ff6060', 'center', '#000', 5);
      else if (st.phase === 'rush') txt(ctx, 'Lauf schnell in die MITTE!', VW / 2, 40, 26, '#ffe46b', 'center', '#000', 5);
      else if (st.spinT < 6) txt(ctx, 'Steuere gegen die Fliehkraft zur Mitte – und spar dir Kraft!', VW / 2, 40, 18, '#fff', 'center', '#000', 4);
    }
    for (const p of st.popups) { ctx.globalAlpha = clamp(p.t, 0, 1); txt(ctx, p.text, p.x, p.y, 20, p.col, 'center', '#000', 4); ctx.globalAlpha = 1; }
    if (st.phase === 'intro') introCard(ctx, st.hard ? 'TEUFELSRAD – MEISTERRUNDE' : 'DAS TEUFELSRAD', [
      'Seit über 100 Jahren auf der Wiesn: Alle setzen sich auf die Holzscheibe – und die dreht sich immer schneller!',
      'Wer am längsten drauf bleibt, gewinnt. Tipp vom Profi: In der Mitte ist die Fliehkraft am kleinsten!',
      'Steuern: Pfeiltasten/WASD bzw. Joystick. Wer drückt, verbraucht KRAFT – also gut einteilen.',
      'Achtung vor dem Ball am Seil – und vor dem Lasso des Rekommandeurs!',
    ], 'Rauf auf die Scheibe! [E / Leertaste]');
    if (st.phase === 'end' && st.pt > 0.8) {
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 160, VW, 220);
      if (st.result.win) {
        txt(ctx, st.hard ? 'TEUFELSRAD-MEISTER!' : 'GEWONNEN!', VW / 2, 220, 52, '#ffd84a', 'center', '#000', 9);
        txt(ctx, 'Du hast ' + st.result.time.toFixed(0) + ' Sekunden durchgehalten!', VW / 2, 280, 22, '#fff', 'center', '#000', 5);
      } else {
        txt(ctx, 'RUNTERGEFLOGEN!', VW / 2, 220, 52, '#ff8a8a', 'center', '#000', 9);
        txt(ctx, 'Macht nix – genau dafür lachen hier alle. Nochmal?', VW / 2, 280, 22, '#fff', 'center', '#000', 5);
      }
      if (st.pt > 1.6) txt(ctx, st.result.win ? 'Weiter [E / Leertaste]' : 'Nochmal – diesmal etwas leichter [E]   ·   Aufhören [Esc]', VW / 2, 340, 18, '#7fff9a', 'center', '#000', 4);
    }
    G.ui.touchHint(ctx, ['stick', 'E']);
  }

  return { start, update, draw, get active() { return !!st; }, get _st() { return st; } };
})();

// =====================================================================
// SCHICHTL-SHOW
// =====================================================================
G.schichtl = (function () {
  let st = null;
  function start(onEnd) { st = { t: 0, onEnd, played: {} }; G.audio.say('Auf geht’s beim Schichtl! Hereinspaziert, hereinspaziert!', 0.75); }
  function update(dt) {
    st.t += dt;
    const once = (k, f) => { if (!st.played[k]) { st.played[k] = 1; f(); } };
    if (st.t > 4.5) once('drum', () => { for (let i = 0; i < 12; i++) setTimeout(() => G.audio.sfx.step(), i * 90); });
    if (st.t > 6) once('chop', () => { G.audio.sfx.bump(); G.audio.sfx.whoosh(0.3); });
    if (st.t > 7.2) once('ta', () => { G.audio.sfx.cheer(); G.audio.sfx.jingle(); G.audio.say('Ta-daa! Alles nur Zauberei!'); });
    if (st.t > 3 && (G.input.hit('act') || G.input.hit('space')) && st.t > 9) { const cb = st.onEnd; st = null; cb(); }
    else if (st.t > 14) { const cb = st.onEnd; st = null; cb(); }
  }
  function draw(ctx) {
    if (!st) return;
    const t = st.t;
    ctx.fillStyle = '#1a0a14'; ctx.fillRect(0, 0, VW, VH);
    // Bühne
    ctx.fillStyle = '#5a2a1a'; ctx.fillRect(100, 380, 760, 40);
    ctx.fillStyle = '#3a1a10'; ctx.fillRect(100, 420, 760, 120);
    // Guillotine
    const gx = 560;
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(gx - 60, 120, 16, 260); ctx.fillRect(gx + 44, 120, 16, 260); ctx.fillRect(gx - 70, 110, 140, 18);
    const drop = t > 6 ? Math.min(1, (t - 6) / 0.15) : 0;
    ctx.fillStyle = '#c8ccd8'; ctx.beginPath(); ctx.moveTo(gx - 44, 140 + drop * 160); ctx.lineTo(gx + 44, 130 + drop * 160); ctx.lineTo(gx + 44, 180 + drop * 160); ctx.lineTo(gx - 44, 180 + drop * 160); ctx.fill();
    ctx.fillStyle = '#5a3418'; ctx.fillRect(gx - 50, 320, 100, 24);
    // Freiwilliger (der Spieler)
    const L = G.player.look;
    ctx.fillStyle = L.female ? L.dirndl : L.shirt; rrect(ctx, gx + 50, 300, 120, 50, 20); ctx.fill();
    if (t < 6 || t > 7) { circle(ctx, gx, 312, 26, L.skin); ctx.fillStyle = L.hair; ctx.beginPath(); ctx.arc(gx, 306, 27, Math.PI, TAU); ctx.fill(); circle(ctx, gx - 8, 312, 3, '#222'); circle(ctx, gx + 8, 312, 3, '#222'); ctx.strokeStyle = '#7a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, 320, 8, 0.2, Math.PI - 0.2); ctx.stroke(); }
    // Rauchwolke
    if (t > 6 && t < 7.5) { const k = (t - 6) / 1.5; for (let i = 0; i < 8; i++) circle(ctx, gx + Math.cos(i) * 60 * k, 300 + Math.sin(i * 1.7) * 40 * k, 30 * (1 - k * 0.5), 'rgba(240,240,250,' + (1 - k) + ')'); }
    // Herr Schichtl mit Zylinder
    const sx = 280, bob = Math.sin(t * 3) * 3;
    ctx.fillStyle = '#111'; rrect(ctx, sx - 30, 230 + bob, 60, 150, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(sx - 8, 236 + bob, 16, 40);
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(sx - 10, 240 + bob); ctx.lineTo(sx + 10, 240 + bob); ctx.lineTo(sx, 250 + bob); ctx.fill();
    circle(ctx, sx, 205 + bob, 26, '#f1c9a5');
    ctx.fillStyle = '#111'; ctx.fillRect(sx - 22, 140 + bob, 44, 50); ctx.fillRect(sx - 34, 184 + bob, 68, 8);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(sx - 22, 176 + bob, 44, 6);
    ctx.strokeStyle = '#4a2a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 16, 220 + bob); ctx.quadraticCurveTo(sx, 210 + bob, sx + 16, 220 + bob); ctx.stroke();
    circle(ctx, sx - 9, 200 + bob, 3, '#222'); circle(ctx, sx + 9, 200 + bob, 3, '#222');
    // Zauberstab
    ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx + 30, 270 + bob); ctx.lineTo(sx + 80, 220 + bob + Math.sin(t * 6) * 10); ctx.stroke();
    // Vorhang
    const open = clamp(t / 2, 0, 1);
    ctx.fillStyle = '#a01e2a';
    ctx.fillRect(0, 0, 100 + (1 - open) * 380, VH - 120); ctx.fillRect(VW - 100 - (1 - open) * 380, 0, 100 + (1 - open) * 380, VH - 120);
    ctx.fillStyle = '#7a1420'; for (let x = 0; x < 100 + (1 - open) * 380; x += 30) ctx.fillRect(x, 0, 8, VH - 120);
    ctx.fillStyle = '#f2d24a'; ctx.fillRect(0, 0, VW, 40);
    txt(ctx, 'SCHICHTL – SEIT 1869', VW / 2, 20, 24, '#5a1a3a', 'center', null);
    // Text
    const lines = [[0.5, 'Hereinspaziert! Hereinspaziert!'], [2.5, 'Heute: Die Enthauptung mittels Guillotine!'], [4.5, 'Trommelwirbel …'], [7.2, 'TA-DAA! Kopf noch dran – alles nur Zauberei!']];
    let cur = ''; for (const [tt, l] of lines) if (t > tt) cur = l;
    txt(ctx, cur, VW / 2, 490, 26, '#fff', 'center', '#000', 6);
    if (t > 9) txt(ctx, 'Seit 1872 wird beim Schichtl mit der Guillotine „geköpft“. [E]', VW / 2, 525, 14, '#f2d24a', 'center', '#000', 3);
  }
  return { start, update, draw, get active() { return !!st; }, get _st() { return st; } };
})();
