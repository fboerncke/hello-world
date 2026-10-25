'use strict';
// Figuren: Spieler, Wiesn-Besucher, Bedienungen, Ordner, Blaskapelle, Pferdegespann, Roller, Dackel
G.ent = (function () {
  const SKINS = ['#f1c9a5', '#e8b48a', '#c98e63', '#8d5a3b', '#f6d8bd'];
  const HAIR = ['#3a2412', '#6a4022', '#d8b060', '#1a1a1a', '#a05a2a', '#c8c8c8'];
  const SHIRTS = ['#c0392b', '#2f6db5', '#2f8a4a', '#8a5ad6', '#d97a2a', '#e86fb0'];
  const DIRNDL = ['#2f6db5', '#c0392b', '#2f8a4a', '#6a2a6a', '#1a3a5a', '#d97a2a', '#e86fb0'];
  const APRON = ['#f2d0e0', '#fff4c0', '#d0e8ff', '#ffffff', '#f2b6c8', '#c8f0d0'];

  function randomLook(kind) {
    const female = Math.random() < 0.5;
    return {
      skin: pick(SKINS), hair: pick(HAIR), female,
      shirt: pick(SHIRTS), dirndl: pick(DIRNDL), apron: pick(APRON),
      hat: !female && Math.random() < 0.35, braids: female && Math.random() < 0.5,
      kind: kind || 'adult',
    };
  }

  // ---------- Personen zeichnen (3/4-Ansicht, Füße bei y=0) ----------
  function drawPerson(ctx, p, alpha) {
    const L = p.look;
    const s = p.size || 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ellipse(ctx, 0, 0, 10 * s, 4 * s, 'rgba(0,0,0,.25)');
    if (p.knock > 0) { ctx.rotate(Math.sin(p.knock * 20) * 0.4); }
    if (p.lean) ctx.rotate(p.lean);
    ctx.scale(s, s);
    const fx = Math.cos(p.dir || 0), fy = Math.sin(p.dir || 0);
    const back = fy < -0.55;
    const side = Math.abs(fx) > 0.6 ? Math.sign(fx) : 0;
    const sw = p.moving ? Math.sin(p.walk || 0) : 0;
    const bob = p.moving ? Math.abs(Math.cos(p.walk || 0)) * 1.2 : 0;
    ctx.translate(0, -bob);
    // Beine
    const legL = 12 - Math.max(0, sw) * 3, legR = 12 - Math.max(0, -sw) * 3;
    if (!L.female || L.kind === 'kid' && !L.female) {
      ctx.fillStyle = L.kind === 'ordner' ? '#2a2a3a' : '#f2efe6';
      ctx.fillRect(-5, -legL, 4, legL); ctx.fillRect(1, -legR, 4, legR);
      ctx.fillStyle = '#3a2412'; ctx.fillRect(-6, -2 - (12 - legL), 5, 3); ctx.fillRect(1, -2 - (12 - legR), 5, 3);
    } else {
      ctx.fillStyle = L.skin; ctx.fillRect(-4, -legL, 3, legL); ctx.fillRect(1, -legR, 3, legR);
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(-5, -2 - (12 - legL), 4, 3); ctx.fillRect(1, -2 - (12 - legR), 4, 3);
    }
    // Körper
    if (L.kind === 'ordner') {
      ctx.fillStyle = '#2a2a3a'; ctx.fillRect(-6, -14, 12, 4);
      ctx.fillStyle = '#f2e600'; ctx.fillRect(-7, -27, 14, 15);
      ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-7, -21, 14, 2);
      if (!back) { ctx.fillStyle = '#333'; ctx.font = '900 4px ' + FONT; ctx.textAlign = 'center'; ctx.fillText('ORDNER', 0, -16); }
    } else if (L.female) {
      // Dirndl: Rock, Schürze, Mieder, Bluse
      ctx.fillStyle = L.dirndl;
      ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(6, -22); ctx.lineTo(9, -7); ctx.lineTo(-9, -7); ctx.fill();
      if (!back) { ctx.fillStyle = L.apron; ctx.beginPath(); ctx.moveTo(-3.5, -18); ctx.lineTo(3.5, -18); ctx.lineTo(5, -8); ctx.lineTo(-5, -8); ctx.fill(); }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-6, -28, 12, 6);
      ctx.fillStyle = shade(L.dirndl, -0.3); ctx.fillRect(-5, -25, 10, 5);
      if (!back) { ctx.fillStyle = '#f2d24a'; ctx.fillRect(-1, -24, 2, 3); }
    } else {
      // Lederhose mit Hosenträgern und kariertem Hemd
      ctx.fillStyle = '#6a4022'; ctx.fillRect(-6, -15, 12, 5);
      ctx.fillStyle = L.shirt; ctx.fillRect(-6, -28, 12, 13);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fillRect(-6, -25, 12, 1.5); ctx.fillRect(-6, -20, 12, 1.5); ctx.fillRect(-3, -28, 1.5, 13); ctx.fillRect(2, -28, 1.5, 13);
      ctx.fillStyle = '#6a4022'; ctx.fillRect(-4.5, -28, 2, 13); ctx.fillRect(2.5, -28, 2, 13);
      if (!back) ctx.fillRect(-4.5, -23, 9, 2.5);
    }
    // Arme
    const armSw = sw * 3;
    ctx.fillStyle = L.kind === 'ordner' ? '#f2e600' : L.female ? '#fff' : L.shirt;
    if (p.carry !== 'mugs' && p.carry !== 'tuba' && p.carry !== 'trumpet' && !p.armsUp) {
      ctx.fillRect(-9, -27 + armSw, 3, 10); ctx.fillRect(6, -27 - armSw, 3, 10);
      ctx.fillStyle = L.skin; ctx.fillRect(-9, -18 + armSw, 3, 3); ctx.fillRect(6, -18 - armSw, 3, 3);
    } else if (p.armsUp) {
      ctx.fillRect(-10, -38, 3, 12); ctx.fillRect(7, -38, 3, 12);
      ctx.fillStyle = L.skin; ctx.fillRect(-10, -41, 3, 3); ctx.fillRect(7, -41, 3, 3);
    }
    // Kopf
    const hy = -34;
    circle(ctx, 0, hy, 7, L.skin);
    ctx.fillStyle = L.hair;
    if (back) { circle(ctx, 0, hy - 1, 7, L.hair); }
    else {
      ctx.beginPath(); ctx.arc(0, hy - 1, 7.2, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
      ctx.fillRect(-7, hy - 3, 2.5, 4); ctx.fillRect(4.5, hy - 3, 2.5, 4);
      // Gesicht
      const ex = side * 2;
      ctx.fillStyle = '#222';
      if (side >= 0) ctx.fillRect(1 + ex, hy - 1, 1.6, 2);
      if (side <= 0) ctx.fillRect(-2.6 + ex, hy - 1, 1.6, 2);
      ctx.fillStyle = 'rgba(220,80,80,.35)'; circle(ctx, -3.5 + ex, hy + 2, 1.5); ctx.fill(); circle(ctx, 3.5 + ex, hy + 2, 1.5); ctx.fill();
      if (p.happy) { ctx.strokeStyle = '#7a2a1a'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(ex, hy + 2, 2, 0.2, Math.PI - 0.2); ctx.stroke(); }
    }
    if (L.braids) { ctx.fillStyle = L.hair; ctx.fillRect(-8, hy, 2.5, 9); ctx.fillRect(5.5, hy, 2.5, 9); }
    if (L.hat) {
      ctx.fillStyle = '#2f5a2a'; ellipse(ctx, 0, hy - 5, 10, 3, '#2f5a2a'); ctx.fillRect(-5.5, hy - 12, 11, 7);
      ctx.fillStyle = '#8a5a32'; ctx.fillRect(-5.5, hy - 7, 11, 1.5);
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, hy - 10); ctx.quadraticCurveTo(10, hy - 18, 8, hy - 22); ctx.stroke();
    }
    if (L.kind === 'oma') {
      ctx.fillStyle = '#ddd'; circle(ctx, 0, hy - 7, 4, '#ddd');
      ctx.fillStyle = '#6a2a4a'; ctx.fillRect(-9, -27, 18, 3);
    }
    if (L.kind === 'ordner') { ctx.fillStyle = '#2a2a3a'; ctx.fillRect(-7, hy - 8, 14, 4); ctx.fillRect(-8, hy - 5, 16, 1.5); }
    // Tragegut
    if (p.carry === 'mugs') {
      ctx.fillStyle = L.skin; ctx.fillRect(-11, -24, 4, 3); ctx.fillRect(7, -24, 4, 3);
      for (let i = 0; i < 5; i++) {
        for (const sx of [-1, 1]) {
          const mx = sx * (9 + (i % 3) * 3), my = -30 + Math.floor(i / 3) * 7;
          ctx.fillStyle = 'rgba(230,240,255,.9)'; ctx.fillRect(mx - 2.5, my, 5, 7);
          ctx.fillStyle = '#f2b632'; ctx.fillRect(mx - 2, my + 2, 4, 4.5);
          ctx.fillStyle = '#fff'; ctx.fillRect(mx - 2.5, my, 5, 1.5);
        }
      }
    } else if (p.carry === 'tuba') {
      ctx.strokeStyle = '#e8c040'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2, -24, 7, 0, TAU); ctx.stroke();
      circle(ctx, 4, -36, 6, '#e8c040'); circle(ctx, 4, -36, 3.5, '#a8801a');
    } else if (p.carry === 'trumpet') {
      ctx.fillStyle = '#e8c040'; ctx.fillRect(side >= 0 ? 2 : -14, -32, 12, 2.5);
      circle(ctx, side >= 0 ? 15 : -15, -31, 3, '#e8c040');
    } else if (p.carry === 'heart') {
      G.world.drawHeart(ctx, 0, -19, 5, '#e84d8a');
    } else if (p.carry === 'brezn') {
      G.world.drawBrezn(ctx, side >= 0 ? 9 : -9, -18, 4);
    }
    if (p.wearsHeart) {
      ctx.strokeStyle = '#f2e6c8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(0, -21); ctx.lineTo(4, -28); ctx.stroke();
      if (!back) G.world.drawHeart(ctx, 0, -19, 4.5, '#e84d8a');
    }
    ctx.restore();
  }

  function drawDog(ctx, d) {
    ctx.save(); ctx.translate(d.x, d.y);
    ellipse(ctx, 0, 0, 12, 4, 'rgba(0,0,0,.25)');
    const dir = Math.cos(d.dir) >= 0 ? 1 : -1;
    ctx.scale(dir, 1);
    const run = d.moving ? Math.sin(d.walk * 1.5) * 2 : 0;
    ctx.fillStyle = '#8a4a1a';
    ctx.fillRect(-9 + run, -4, 2, 4); ctx.fillRect(6 - run, -4, 2, 4);
    rrect(ctx, -11, -10, 22, 7, 3.5); ctx.fill();
    circle(ctx, 12, -11, 4.5, '#8a4a1a');
    ctx.fillStyle = '#6a3410'; ellipse(ctx, 11, -8, 2.5, 4.5, '#6a3410');
    ellipse(ctx, 16, -10, 3, 2, '#8a4a1a');
    circle(ctx, 18.5, -10.5, 1.2, '#111'); circle(ctx, 13, -12.5, 1, '#111');
    ctx.strokeStyle = '#8a4a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, -9); ctx.lineTo(-15, -13 + Math.sin(G.time * 18) * 2); ctx.stroke();
    ctx.fillStyle = '#d62f3a'; ctx.fillRect(8, -9, 2, 3);
    ctx.restore();
  }

  // ---------- Fahrzeuge ----------
  function drawRoller(ctx, v, ridden) {
    ctx.save(); ctx.translate(v.x, v.y);
    ellipse(ctx, 0, 1, 14, 4, 'rgba(0,0,0,.25)');
    const dx = Math.cos(v.a), dy = Math.sin(v.a) * 0.5;
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-dx * 11, -dy * 11 - 2); ctx.lineTo(dx * 11, dy * 11 - 2); ctx.stroke();
    circle(ctx, -dx * 12, -dy * 12, 3, '#111'); circle(ctx, dx * 12, dy * 12, 3, '#111');
    ctx.strokeStyle = v.col; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(dx * 11, dy * 11 - 2); ctx.lineTo(dx * 9, dy * 9 - 24); ctx.stroke();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dx * 9 - dy * 6, dy * 9 - 24 - dx * 3); ctx.lineTo(dx * 9 + dy * 6, dy * 9 - 24 + dx * 3); ctx.stroke();
    ctx.lineCap = 'butt';
    if (!ridden) { ctx.fillStyle = v.col; ctx.font = '900 7px ' + FONT; ctx.textAlign = 'center'; ctx.fillText('ROLLER', 0, 10); }
    ctx.restore();
  }

  function drawCarriage(ctx, c) {
    ctx.save(); ctx.translate(c.x, c.y);
    const horiz = Math.abs(Math.cos(c.a)) > 0.5;
    const dir = Math.cos(c.a) >= 0 ? 1 : -1;
    ellipse(ctx, 0, 2, 70, 14, 'rgba(0,0,0,.25)');
    const step = Math.sin(G.time * 6);
    if (horiz) {
      ctx.scale(dir, 1);
      // Wagen mit Fässern
      ctx.fillStyle = '#5a3418'; ctx.fillRect(-60, -30, 56, 20);
      ctx.fillStyle = '#f2d24a'; ctx.fillRect(-60, -32, 56, 3);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#8a5a2e'; rrect(ctx, -56 + i * 18, -48, 16, 18, 5); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(-56 + i * 18, -43, 16, 2); ctx.fillRect(-56 + i * 18, -36, 16, 2); }
      for (const wx of [-52, -14]) { ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(wx, -8, 9, 0, TAU); ctx.stroke(); }
      // Kutscher
      circle(ctx, -10, -50, 5, '#f1c9a5'); ctx.fillStyle = '#2a4a2a'; ctx.fillRect(-15, -45, 10, 12); ctx.fillStyle = '#2f5a2a'; ctx.fillRect(-15, -58, 10, 5);
      // Pferde
      for (const hx of [14, 42]) {
        ctx.fillStyle = hx === 14 ? '#6a3a1a' : '#5a2a10';
        ellipse(ctx, hx, -24, 14, 8); ctx.fill();
        ctx.fillRect(hx - 11, -20, 3, 18 + step * 2); ctx.fillRect(hx + 8, -20, 3, 18 - step * 2);
        ctx.beginPath(); ctx.moveTo(hx + 10, -28); ctx.lineTo(hx + 20, -44); ctx.lineTo(hx + 26, -40); ctx.lineTo(hx + 16, -24); ctx.fill();
        ellipse(ctx, hx + 25, -42, 6, 4); ctx.fill();
        ctx.fillStyle = '#e8e0c8'; ctx.fillRect(hx - 12, -3 + step, 4, 3);
        ctx.fillStyle = '#1a7fd4'; ctx.fillRect(hx - 6, -30, 12, 4);
        ctx.fillStyle = '#d62f3a'; circle(ctx, hx + 20, -46, 2.5); ctx.fill();
      }
    } else {
      const up = Math.sin(c.a) < 0;
      const o = up ? -1 : 1;
      for (const hx of [-9, 9]) {
        ctx.fillStyle = '#6a3a1a';
        ellipse(ctx, hx, -22 + o * 30, 7, 13); ctx.fill();
        ctx.fillRect(hx - 4, -12 + o * 30, 3, 12 + step * 2); ctx.fillRect(hx + 1, -12 + o * 30, 3, 12 - step * 2);
        if (!up) { ellipse(ctx, hx, -36 + o * 30, 5, 7); ctx.fill(); }
      }
      ctx.fillStyle = '#5a3418'; ctx.fillRect(-18, -34 - o * 10, 36, 26);
      for (let i = 0; i < 2; i++) { ctx.fillStyle = '#8a5a2e'; rrect(ctx, -16 + i * 17, -52 - o * 10, 15, 18, 5); ctx.fill(); }
      circle(ctx, 0, -58 - o * 4, 5, '#f1c9a5');
    }
    ctx.restore();
  }

  // ---------- Besucher (KI) ----------
  const npcs = [];
  const SHOUTS = ['Obacht!', 'Ja spinnst du?', 'Hoppala!', 'Pass doch auf!', 'Heast, langsam!', 'Jessas!', 'Mei, Bua!', 'Nix für ungut!', 'Ui!'];
  const CHATTER = ['Servus!', 'Grüß Gott!', 'Schee is!', 'A Gaudi!', 'Prost!', 'Mei, is des voll!', 'Wo is des Riesenrad?', 'Gemma Toboggan?', 'I mog a Brezn!', 'Zefix, wo is mei Hut?', 'Oans, zwoa, g’suffa!', 'Habe die Ehre!'];

  function newNPC(kind) {
    const nodes = G.world.nodes;
    const n = pick(nodes);
    const look = randomLook(kind === 'kid' ? 'kid' : kind);
    const p = {
      x: n.x + rand(-40, 40), y: n.y + rand(-40, 40), dir: rand(0, TAU), walk: rand(0, 6), moving: true,
      look, size: kind === 'kid' ? 0.75 : rand(0.95, 1.08), kind: kind || 'adult',
      from: n, to: pick(n.nb), off: rand(-42, 42), speed: rand(38, 62), knock: 0, say: null, sayT: 0, wait: 0,
    };
    if (kind === 'bedienung') { look.female = true; look.dirndl = '#1a3a5a'; look.apron = '#ffffff'; p.carry = 'mugs'; p.speed = 75; }
    if (kind === 'ordner') { look.female = false; look.hat = false; look.kind = 'ordner'; p.speed = 45; }
    return p;
  }

  function spawnCrowd() {
    npcs.length = 0;
    for (let i = 0; i < 130; i++) npcs.push(newNPC(Math.random() < 0.18 ? 'kid' : 'adult'));
    for (let i = 0; i < 10; i++) npcs.push(newNPC('bedienung'));
    for (let i = 0; i < 4; i++) { const o = newNPC('ordner'); o.patrol = true; npcs.push(o); }
    // Grüppchen, die herumstehen (vor Buden und Zelten)
    for (const s of G.world.stands) for (let k = 0; k < 2; k++) {
      const p = newNPC(Math.random() < 0.3 ? 'kid' : 'adult');
      p.x = s.front.x + rand(-30, 30); p.y = s.front.y + rand(4, 20); p.idle = true; p.moving = false; p.dir = -Math.PI / 2;
      npcs.push(p);
    }
    for (const t of G.world.tents) {
      const p = newNPC('adult'); p.x = t.door.x + rand(-60, 60); p.y = t.door.y + rand(0, 20); p.idle = true; p.moving = false; npcs.push(p);
    }
    // Blaskapelle zieht über die Wiesn
    band.length = 0;
    const route = [[2240, 300], [2240, 1810], [1380, 1810], [1380, 170], [2240, 170]];
    for (let i = 0; i < 6; i++) {
      const look = randomLook('adult'); look.female = false; look.shirt = '#ffffff'; look.hat = true;
      band.push({ x: 2240 - (i % 2) * 22, y: 300 - Math.floor(i / 2) * 26, dir: Math.PI / 2, walk: i, moving: true, look, size: 1, carry: i < 2 ? 'tuba' : 'trumpet', route, ri: 1, off: { x: (i % 2) * 22 - 11, y: -Math.floor(i / 2) * 26 }, band: true });
    }
  }
  const band = [];

  function updateNPCs(dt, player) {
    for (const p of npcs) {
      if (p.sayT > 0) { p.sayT -= dt; if (p.sayT <= 0) p.say = null; }
      if (p.knock > 0) { p.knock -= dt; continue; }
      if (p.idle) {
        p.moving = false;
        if (Math.random() < dt * 0.02) { p.say = pick(CHATTER); p.sayT = 2.5; }
        if (dist(p.x, p.y, player.x, player.y) < 60) p.dir = Math.atan2(player.y - p.y, player.x - p.x);
      } else {
        if (p.wait > 0) { p.wait -= dt; p.moving = false; }
        else {
          // entlang des Wegenetzes laufen
          const horiz = p.from.y === p.to.y;
          const tx = p.to.x + (horiz ? 0 : p.off), ty = p.to.y + (horiz ? p.off : 0);
          const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
          if (d < 12) {
            const prev = p.from; p.from = p.to;
            const opts = p.from.nb.filter(n => n !== prev);
            p.to = pick(opts.length ? opts : p.from.nb);
            p.off = clamp(p.off + rand(-15, 15), p.from.i === 3 || p.to.i === 3 ? -22 : -55, p.from.i === 3 || p.to.i === 3 ? 22 : 55);
            if (Math.random() < 0.15) p.wait = rand(1, 4);
          } else {
            const sp = p.speed * (p.chased ? 2 : 1);
            p.x += dx / d * sp * dt; p.y += dy / d * sp * dt;
            p.dir = Math.atan2(dy, dx); p.moving = true; p.walk += dt * sp * 0.18;
          }
        }
        if (Math.random() < dt * 0.008) { p.say = pick(CHATTER); p.sayT = 2.2; }
      }
      // sanftes Ausweichen vor dem Spieler
      const pd = dist(p.x, p.y, player.x, player.y);
      if (pd < 18 && pd > 0.01) {
        const push = (18 - pd) / pd;
        p.x += (p.x - player.x) * push * 0.5; p.y += (p.y - player.y) * push * 0.5;
        const fast = player.speedNow > 200;
        if (fast && p.knock <= 0) {
          p.knock = 0.8; p.say = pick(SHOUTS); p.sayT = 1.8;
          G.audio.sfx.bump();
          G.game.addHeat(player.vehicle ? 1.6 : 1.0, p);
          p.x += (p.x - player.x) / pd * 14; p.y += (p.y - player.y) / pd * 14;
        }
      }
    }
    // Blaskapelle
    for (const b of band) {
      const [tx0, ty0] = b.route[b.ri];
      const tx = tx0 + b.off.x, ty = ty0;
      const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
      if (d < 6) b.ri = (b.ri + 1) % b.route.length;
      else { b.x += dx / d * 32 * dt; b.y += dy / d * 32 * dt; b.dir = Math.atan2(dy, dx); b.walk += dt * 6; }
    }
  }

  // ---------- Pferdegespann ----------
  const carriage = { x: 1380, y: 170, a: 0, route: [[2240, 170], [2240, 1810], [1380, 1810], [1380, 170]], ri: 0, speed: 55 };
  function updateCarriage(dt, player) {
    const [tx, ty] = carriage.route[carriage.ri];
    const dx = tx - carriage.x, dy = ty - carriage.y, d = Math.hypot(dx, dy);
    if (d < 4) carriage.ri = (carriage.ri + 1) % carriage.route.length;
    else { carriage.x += dx / d * carriage.speed * dt; carriage.y += dy / d * carriage.speed * dt; carriage.a = Math.atan2(dy, dx); }
    // Spieler wird sanft weggeschoben
    const horiz = Math.abs(Math.cos(carriage.a)) > 0.5;
    const hw = horiz ? 70 : 22, hh = horiz ? 16 : 50;
    const cx = carriage.x + (horiz ? 0 : 0), cy = carriage.y - (horiz ? 4 : 0);
    if (Math.abs(player.x - cx) < hw && Math.abs(player.y - cy) < hh) {
      if (!carriage.warned || G.time - carriage.warned > 3) { carriage.warned = G.time; G.ui.toast('Kutscher: „Obacht, die Rösser kommen!“'); G.audio.sfx.honk(); }
      const ox = player.x - cx, oy = player.y - cy;
      if (Math.abs(ox) / hw > Math.abs(oy) / hh) player.x = cx + Math.sign(ox || 1) * hw; else player.y = cy + Math.sign(oy || 1) * hh;
    }
  }

  // ---------- Roller ----------
  const rollers = [];
  function spawnRollers() {
    rollers.length = 0;
    const spots = [[2380, 200], [2400, 215], [1500, 200], [700, 1250], [2390, 1490], [1480, 1880], [700, 400], [2830, 1150], [1520, 1120]];
    const cols = ['#d62f3a', '#2f8ad6', '#2fa85a', '#f2b632', '#e86fb0', '#ff8a2a'];
    spots.forEach(([x, y], i) => rollers.push({ type: 'roller', x, y, a: 0, v: 0, col: cols[i % cols.length] }));
  }

  return { drawPerson, drawDog, drawRoller, drawCarriage, randomLook, npcs, band, rollers, carriage, spawnCrowd, spawnRollers, updateNPCs, updateCarriage, SHOUTS, CHATTER, newNPC };
})();
