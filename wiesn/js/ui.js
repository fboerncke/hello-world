'use strict';
// HUD, Minikarte, Dialoge, Einblendungen, Karte, Pausenmenü, Touch-Knöpfe
G.ui = (function () {
  const toasts = [];
  let dlgState = null;
  let card = null;
  let objectiveText = '', objectiveT = 0;
  let radioT = 0;
  let touchMode = 'world';
  let prompt = null;
  let bigText = null;

  function toast(text, dur) { toasts.push({ text, t: dur || 3.5 }); if (toasts.length > 4) toasts.shift(); }
  function dialog(lines, cb) { dlgState = { lines, i: 0, chars: 0, cb }; G.audio.sfx.blip(660); speak(lines[0]); }
  function speak(line) {
    if (!line) return;
    const pitch = /Oma/.test(line.who) ? 1.2 : /Ferdl|Kind/.test(line.who) ? 1.5 : /Frau|Bedienung|Vroni/.test(line.who) ? 1.25 : 0.85;
    G.audio.say(line.text, pitch);
  }
  function objective(t) { objectiveText = t; objectiveT = 8; }
  function missionTitle(t) { card = { kind: 'title', title: t, t: 0, dur: 3 }; G.audio.sfx.bell(); }
  function missionPassed(t, taler, gaudi) { card = { kind: 'passed', title: t, taler, gaudi, t: 0, dur: 4.5 }; G.audio.sfx.jingle(); }
  function missionFailed(t) { card = { kind: 'failed', title: t, t: 0, dur: 3.5 }; G.audio.sfx.busted(); }
  function showRadio() { radioT = 3; }
  function big(text, sub, dur, col) { bigText = { text, sub, t: 0, dur: dur || 3, col: col || '#ffd84a' }; }

  function updateUI(dt) {
    for (const t of toasts) t.t -= dt;
    while (toasts.length && toasts[0].t <= 0) toasts.shift();
    if (card) { card.t += dt; if (card.t > card.dur) card = null; }
    if (bigText && !card) { bigText.t += dt; if (bigText.t > bigText.dur) bigText = null; }
    if (objectiveT > 0) objectiveT -= dt;
    if (radioT > 0) radioT -= dt;
    if (dlgState) {
      const line = dlgState.lines[dlgState.i];
      dlgState.chars += dt * 55;
      const I = G.input;
      let adv = I.hit('act') || I.hit('space');
      if (G.frameClicks && G.frameClicks.length) adv = true;
      if (adv) {
        if (dlgState.chars < line.text.length) dlgState.chars = line.text.length;
        else {
          dlgState.i++; dlgState.chars = 0;
          G.audio.sfx.blip(560);
          if (dlgState.i >= dlgState.lines.length) { const cb = dlgState.cb; dlgState = null; if (window.speechSynthesis) speechSynthesis.cancel(); if (cb) cb(); }
          else speak(dlgState.lines[dlgState.i]);
        }
      }
    }
  }

  // ---------- Zeichnen (Bildschirmkoordinaten, CSS-Pixel) ----------
  function drawDialog(ctx, W, H) {
    if (!dlgState) return;
    const line = dlgState.lines[dlgState.i];
    const bw = Math.min(760, W - 30), bx = (W - bw) / 2, bh = 130, by = H - bh - (G.input.usedTouch ? 150 : 24);
    ctx.fillStyle = 'rgba(10,12,30,.86)'; rrect(ctx, bx, by, bw, bh, 14); ctx.fill();
    ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 2; ctx.stroke();
    // Porträt
    const pc = /Oma/.test(line.who) ? '#ff6bd5' : /Ferdl/.test(line.who) ? '#d62f3a' : /Toni/.test(line.who) ? '#ffb02e' : /Sepp/.test(line.who) ? '#ff4040' : '#7ad0ff';
    circle(ctx, bx + 52, by + 65, 38, pc);
    circle(ctx, bx + 52, by + 58, 22, '#f1c9a5');
    ctx.fillStyle = /Oma/.test(line.who) ? '#ccc' : /Ferdl/.test(line.who) ? '#d8b060' : '#5a3418';
    ctx.beginPath(); ctx.arc(bx + 52, by + 54, 23, Math.PI, TAU); ctx.fill();
    circle(ctx, bx + 45, by + 60, 2.5, '#222'); circle(ctx, bx + 59, by + 60, 2.5, '#222');
    ctx.strokeStyle = '#7a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx + 52, by + 66, 7, 0.2, Math.PI - 0.2); ctx.stroke();
    if (/Toni|Sepp|Opa/.test(line.who)) { ctx.fillStyle = '#2f5a2a'; ctx.fillRect(bx + 36, by + 22, 32, 14); ellipse(ctx, bx + 52, by + 36, 26, 5, '#2f5a2a'); }
    txt(ctx, line.who, bx + 106, by + 22, 17, pc, 'left', null);
    ctx.font = '700 17px ' + FONT;
    const shown = line.text.slice(0, Math.floor(dlgState.chars));
    const lines = wrapText(ctx, shown, bw - 130);
    lines.slice(0, 4).forEach((l, i) => txt(ctx, l, bx + 106, by + 50 + i * 22, 16, '#fff', 'left', null, 0, '700 '));
    if (dlgState.chars >= line.text.length && Math.sin(G.time * 6) > 0) txt(ctx, '▼ [E]', bx + bw - 40, by + bh - 16, 13, '#ffd84a', 'center', null);
  }

  function drawCards(ctx, W, H) {
    if (card) {
      const a = clamp(Math.min(card.t * 3, (card.dur - card.t) * 2), 0, 1);
      ctx.globalAlpha = a;
      if (card.kind === 'title') {
        txt(ctx, card.title.toUpperCase(), W / 2, H * 0.3, Math.min(56, W / 14), '#ffd84a', 'center', '#000', 8);
      } else if (card.kind === 'passed') {
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, H * 0.24, W, 150);
        txt(ctx, 'MISSION GESCHAFFT!', W / 2, H * 0.24 + 50, Math.min(58, W / 13), '#ffd84a', 'center', '#000', 9);
        txt(ctx, '„' + card.title + '“   +' + card.taler + ' Taler   ·   Gaudi +' + card.gaudi, W / 2, H * 0.24 + 108, Math.min(24, W / 30), '#9cff7a', 'center', '#000', 5);
      } else {
        txt(ctx, 'MISSION GESCHEITERT', W / 2, H * 0.3, Math.min(52, W / 14), '#ff6060', 'center', '#000', 8);
        txt(ctx, 'Kein Problem – sprich einfach nochmal mit dem Auftraggeber!', W / 2, H * 0.3 + 52, Math.min(20, W / 34), '#fff', 'center', '#000', 4);
      }
      ctx.globalAlpha = 1;
    }
    if (bigText && !card) {
      const a = clamp(Math.min(bigText.t * 3, (bigText.dur - bigText.t) * 2), 0, 1);
      ctx.globalAlpha = a;
      txt(ctx, bigText.text, W / 2, H * 0.48, Math.min(60, W / 12), bigText.col, 'center', '#000', 9);
      if (bigText.sub) {
        ctx.font = '700 20px ' + FONT;
        const ls = wrapText(ctx, bigText.sub, Math.min(W - 40, 800));
        ls.forEach((l, i) => txt(ctx, l, W / 2, H * 0.48 + 56 + i * 28, Math.min(22, W / 30), '#fff', 'center', '#000', 5));
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawToasts(ctx, W, H) {
    let y = 20;
    for (const t of toasts) {
      ctx.globalAlpha = clamp(t.t * 2, 0, 1);
      ctx.font = '700 15px ' + FONT;
      const lines = wrapText(ctx, t.text, Math.min(380, W * 0.5));
      const h = lines.length * 20 + 14;
      ctx.fillStyle = 'rgba(0,0,0,.72)'; rrect(ctx, 16, y, Math.min(400, W * 0.5 + 20), h, 8); ctx.fill();
      lines.forEach((l, i) => txt(ctx, l, 28, y + 17 + i * 20, 14, '#fff', 'left', null, 0, '700 '));
      y += h + 8;
      ctx.globalAlpha = 1;
    }
  }

  function drawStars(ctx, x, y, n) {
    for (let i = 0; i < 3; i++) {
      const on = i < n;
      const fl = on && Math.sin(G.time * 8) > 0;
      txt(ctx, '★', x - i * 30, y, 28, on ? (fl ? '#fff' : '#ffd84a') : 'rgba(255,255,255,.25)', 'center', on ? '#000' : null, 4);
    }
  }

  function drawHUD(ctx, W, H) {
    const p = G.player, g = G.game;
    const right = W - 20;
    // Uhrzeit, Taler, Sterne (wie im Original oben rechts)
    txt(ctx, fmtTime(g.clock), right, 34, 34, '#fff', 'right', '#000', 6);
    txt(ctx, 'Tag ' + g.day, right - 120, 34, 14, '#ddd', 'right', '#000', 3);
    txt(ctx, g.taler + ' Taler', right, 72, 28, '#7ddc5a', 'right', '#000', 6);
    txt(ctx, 'Gaudi ' + g.gaudi, right, 102, 16, '#ff9ad8', 'right', '#000', 4);
    drawStars(ctx, right - 12, 134, g.stars);
    // Energie & Puste
    const bx = right - 170, by = 156;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, bx, by, 170, 30, 6); ctx.fill();
    ctx.fillStyle = '#e84d4d'; ctx.fillRect(bx + 6, by + 6, 158 * p.energy / 100, 7);
    ctx.fillStyle = '#4ab0ff'; ctx.fillRect(bx + 6, by + 17, 158 * p.stamina / 100, 7);
    if (p.boost > 0) txt(ctx, (p.boostKind === 'zucker' ? 'Zuckerschock! ' : 'Mandel-Power! ') + Math.ceil(p.boost) + 's', right, by + 46, 14, '#ffe46b', 'right', '#000', 3);
    if (p.energy < 15) txt(ctx, 'Hunger! Hol dir was zu essen!', W / 2, 60, 20, '#ff8a8a', 'center', '#000', 4);
    // Radio
    if (radioT > 0) {
      ctx.globalAlpha = clamp(radioT, 0, 1);
      txt(ctx, '♪ ' + G.audio.stationName, W / 2, 30, 22, '#ffd84a', 'center', '#000', 5);
      ctx.globalAlpha = 1;
    }
    // Missionsziel
    if (objectiveText && (objectiveT > 0 || G.missions.active)) {
      ctx.font = '700 18px ' + FONT;
      const lines = wrapText(ctx, objectiveText, Math.min(W - 60, 720));
      const oy = H - (G.input.usedTouch ? 190 : 70) - (lines.length - 1) * 24;
      lines.forEach((l, i) => txt(ctx, l, W / 2, oy + i * 24, 19, '#fff', 'center', '#000', 5, '800 '));
    }
    const st = G.missions.currentStep();
    if (st && st.timer) txt(ctx, '⏱ ' + Math.max(0, Math.ceil(G.missions.sd.timer)) + ' s', W / 2, 96, 30, G.missions.sd.timer < 30 ? '#ff6060' : '#fff', 'center', '#000', 6);
    // Interaktions-Hinweis
    if (prompt && !dlgState) {
      ctx.font = '800 17px ' + FONT;
      const tw = ctx.measureText(prompt).width + 70;
      const py = H - (G.input.usedTouch ? 240 : 120);
      ctx.fillStyle = 'rgba(0,0,0,.72)'; rrect(ctx, W / 2 - tw / 2, py - 20, tw, 40, 10); ctx.fill();
      ctx.fillStyle = '#ffd84a'; rrect(ctx, W / 2 - tw / 2 + 8, py - 13, 30, 26, 6); ctx.fill();
      txt(ctx, 'E', W / 2 - tw / 2 + 23, py, 16, '#000', 'center', null);
      txt(ctx, prompt, W / 2 - tw / 2 + 48, py, 16, '#fff', 'left', null, 0, '800 ');
    }
    drawMinimap(ctx, W, H);
  }

  // ---------- Minikarte ----------
  function blipsFor() {
    const b = [];
    for (const id of G.missions.available()) { const m = G.missions.defs[id]; b.push({ x: m.giver.x, y: m.giver.y, letter: m.letter, col: m.color }); }
    const tgt = G.missions.currentTarget();
    if (tgt) b.push({ x: tgt.x, y: tgt.y, target: true });
    if (G.events) for (const e of G.events.blips()) b.push(e);
    return b;
  }
  function drawMinimap(ctx, W, H) {
    const touch = G.input.usedTouch;
    const r = Math.min(90, W * 0.12 + 30);
    const cx = touch ? r + 20 : r + 24, cy = touch ? r + 20 + 70 : H - r - 24;
    if (touch && toasts.length) return;
    const sc = 0.1;
    const mm = G.world.getMiniMap();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.closePath();
    ctx.fillStyle = '#223'; ctx.fill();
    ctx.clip();
    const p = G.player;
    const k = sc / 0.12;
    ctx.drawImage(mm, cx - p.x * sc, cy - p.y * sc, mm.width * k, mm.height * k);
    // Roller, Ordner
    for (const v of G.ent.rollers) if (v !== p.vehicle) circle(ctx, cx + (v.x - p.x) * sc, cy + (v.y - p.y) * sc, 2.5, '#5ad0ff');
    for (const o of G.game.chasers) circle(ctx, cx + (o.x - p.x) * sc, cy + (o.y - p.y) * sc, 4, Math.sin(G.time * 10) > 0 ? '#ff2020' : '#2040ff');
    if (G.dog && !G.dog.caught) circle(ctx, cx + (G.dog.x - p.x) * sc, cy + (G.dog.y - p.y) * sc, 4, '#c97a2a');
    ctx.restore();
    // Blips (am Rand festgeklemmt)
    for (const b of blipsFor()) {
      let dx = (b.x - p.x) * sc, dy = (b.y - p.y) * sc;
      const d = Math.hypot(dx, dy);
      if (d > r - 10) { dx *= (r - 10) / d; dy *= (r - 10) / d; }
      if (b.target) { circle(ctx, cx + dx, cy + dy, 7, '#000'); circle(ctx, cx + dx, cy + dy, 5.5, '#ffe100'); }
      else { circle(ctx, cx + dx, cy + dy, 9, '#000'); circle(ctx, cx + dx, cy + dy, 7.5, b.col); txt(ctx, b.letter, cx + dx, cy + dy + 1, 10, '#000', 'center', null); }
    }
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, TAU); ctx.stroke();
    txt(ctx, 'N', cx, cy - r + 12, 11, '#fff', 'center', '#000', 3);
    // Spieler-Pfeil
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((p.vehicle ? p.vehicle.a : p.dir) + Math.PI / 2);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, 6); ctx.lineTo(0, 3); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---------- Große Karte ----------
  function drawBigMap(ctx, W, H) {
    ctx.fillStyle = 'rgba(10,15,25,.92)'; ctx.fillRect(0, 0, W, H);
    const mm = G.world.getMiniMap();
    const s = Math.min((W - 40) / mm.width, (H - 100) / mm.height);
    const mw = mm.width * s, mh = mm.height * s, mx = (W - mw) / 2, my = 60;
    ctx.drawImage(mm, mx, my, mw, mh);
    const k = s * 0.12;
    const P = (x, y) => [mx + x * k, my + y * k];
    txt(ctx, 'LAGEPLAN THERESIENWIESE', W / 2, 30, Math.min(28, W / 22), '#ffd84a', 'center', '#000', 5);
    const labels = [
      ['Toboggan', 1150, 640], ['Teufelsrad', 880, 650], ['Riesenrad', 1010, 330], ['Wellenflug', 900, 960], ['Autoscooter', 1000, 1310], ['Schichtl', 1150, 1645],
      ['Olympia-Looping', 380, 1620], ['Bavaria', 360, 960], ['Ruhmeshalle', 360, 740], ['Oide Wiesn', 1400, 2080], ['Krinoline', 1050, 2120],
      ['Servicezentrum', 2970, 470], ['Haupteingang', 2240, 120], ['Wirtsbudenstraße', 2240, 1000], ['Schaustellerstraße', 1380, 1000],
    ];
    for (const t of G.world.tents) labels.push([t.name.replace('-Festzelt', '').replace('-Festhalle', ''), t.x + t.w / 2, t.y + t.h / 2]);
    for (const [n, x, y] of labels) { const [px, py] = P(x, y); txt(ctx, n, px, py, Math.max(9, Math.min(13, W / 90)), '#fff', 'center', '#000', 3); }
    for (const b of blipsFor()) {
      const [px, py] = P(b.x, b.y);
      if (b.target) { circle(ctx, px, py, 9, '#000'); circle(ctx, px, py, 7, '#ffe100'); }
      else { circle(ctx, px, py, 12, '#000'); circle(ctx, px, py, 10, b.col); txt(ctx, b.letter, px, py + 1, 12, '#000', 'center', null); }
    }
    G.game.hearts.forEach((h, i) => { if (!h.got && G.game.showHeartsOnMap) { const [px, py] = P(h.x, h.y); circle(ctx, px, py, 3, '#ff6b9a'); } });
    const [ppx, ppy] = P(G.player.x, G.player.y);
    circle(ctx, ppx, ppy, 8 + Math.sin(G.time * 6) * 2, '#fff'); circle(ctx, ppx, ppy, 5, '#1a7fd4');
    txt(ctx, 'Du', ppx, ppy - 16, 12, '#fff', 'center', '#000', 3);
    const got = G.game.hearts.filter(h => h.got).length;
    txt(ctx, 'Gefundene Lebkuchenherzen: ' + got + ' / ' + G.game.hearts.length + '     [M] schließen', W / 2, H - 22, 15, '#fff', 'center', '#000', 4);
  }

  // ---------- Pausenmenü ----------
  const pause = { tab: 0, sel: 0, scroll: 0 };
  const TABS = ['Missionen', 'Wiesn-Wissen', 'Erfolge', 'Steuerung', 'Optionen'];
  function drawPause(ctx, W, H, clicks) {
    ctx.fillStyle = 'rgba(10,10,30,.93)'; ctx.fillRect(0, 0, W, H);
    drawLogo(ctx, W / 2, 56, Math.min(1, W / 900) * 0.6);
    const tw = Math.min(170, (W - 40) / TABS.length);
    TABS.forEach((t, i) => {
      const x = W / 2 - tw * TABS.length / 2 + i * tw, y = 120;
      ctx.fillStyle = pause.tab === i ? '#ff6bd5' : 'rgba(255,255,255,.12)'; rrect(ctx, x + 4, y, tw - 8, 36, 8); ctx.fill();
      txt(ctx, t, x + tw / 2, y + 18, Math.min(15, tw / 9), '#fff', 'center', null);
      for (const c of clicks) if (c.x > x && c.x < x + tw && c.y > y && c.y < y + 36) { pause.tab = i; pause.scroll = 0; }
    });
    const I = G.input;
    if (I.hit('right')) { pause.tab = (pause.tab + 1) % TABS.length; pause.scroll = 0; }
    if (I.hit('left')) { pause.tab = (pause.tab + TABS.length - 1) % TABS.length; pause.scroll = 0; }
    if (I.hit('down')) pause.scroll++;
    if (I.hit('up')) pause.scroll = Math.max(0, pause.scroll - 1);
    const x0 = Math.max(20, W / 2 - 380), cw = Math.min(760, W - 40);
    let y = 190;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 170, W, H - 230); ctx.clip();
    if (pause.tab === 0) {
      for (const id of G.missions.order) {
        const m = G.missions.defs[id];
        const st = G.missions.done[id] ? '✔ geschafft' : (G.missions.active && G.missions.active.id === id) ? '▶ läuft gerade' : m.req() ? '● verfügbar – Symbol „' + m.letter + '“ auf der Karte' : '🔒 noch gesperrt';
        circle(ctx, x0 + 20, y + 4, 14, m.color); txt(ctx, m.letter, x0 + 20, y + 5, 14, '#000', 'center', null);
        txt(ctx, m.title, x0 + 46, y, 18, '#fff', 'left', null);
        txt(ctx, st + '   (' + m.giver.name + ')', x0 + 46, y + 22, 13, G.missions.done[id] ? '#9cff7a' : '#bbb', 'left', null, 0, '700 ');
        y += 56;
      }
      const got = G.game.hearts.filter(h => h.got).length;
      txt(ctx, 'Versteckte Lebkuchenherzen: ' + got + ' / ' + G.game.hearts.length + '  – jedes schaltet Wiesn-Wissen frei!', x0, y + 10, 14, '#ff9ad8', 'left', null, 0, '700 ');
    } else if (pause.tab === 1) {
      const un = G.FACTS.filter(f => G.game.facts.has(f.id));
      txt(ctx, 'Freigeschaltet: ' + un.length + ' / ' + G.FACTS.length, x0, y, 15, '#ffd84a', 'left', null);
      y += 28;
      ctx.font = '700 14px ' + FONT;
      const items = G.FACTS.slice(pause.scroll);
      for (const f of items) {
        const has = G.game.facts.has(f.id);
        txt(ctx, (has ? '♥ ' : '? ') + (has ? f.title : '???'), x0, y, 16, has ? '#ff9ad8' : '#666', 'left', null);
        y += 20;
        if (has) { for (const l of wrapText(ctx, f.text, cw - 20)) { txt(ctx, l, x0 + 20, y, 14, '#eee', 'left', null, 0, '700 '); y += 19; } }
        else { txt(ctx, 'Finde Lebkuchenherzen oder erledige Missionen!', x0 + 20, y, 13, '#666', 'left', null, 0, '700 '); y += 19; }
        y += 10;
        if (y > H - 60) break;
      }
      txt(ctx, '▲▼ blättern', W - 30, H - 70, 12, '#aaa', 'right', null);
    } else if (pause.tab === 2) {
      y = G.trophies.drawList(ctx, x0, y, cw, H, pause.scroll);
    } else if (pause.tab === 3) {
      const rows = [
        ['Laufen', 'Pfeiltasten / WASD  ·  Touch: linker Daumen'], ['Rennen', 'Shift halten (kostet Puste)'], ['Aktion', 'E / Enter – reden, kaufen, Roller, Fahrgeschäfte'],
        ['Karte', 'M'], ['Radio wechseln', 'R'], ['Pause', 'Esc / P'],
        ['Toboggan', '◀ ▶ Gleichgewicht halten, ▼ krabbeln (nach 2 Stürzen)'], ['Teufelsrad', 'Richtung = gegen die Fliehkraft drücken, Kraft einteilen; Leertaste gegen das Lasso'],
        ['Hau den Lukas', 'Erst Kraft stoppen, dann in der Mitte treffen (E)'], ['Dosenwerfen', '◀ ▶ zielen, E halten und loslassen'], ['Schiffschaukel', 'E drücken, wenn die Schaukel unten durch den grünen Bereich saust'],
        ['Ordner-Sterne', 'Wer wild herumrempelt, bekommt Ärger mit den Ordnern. Weglaufen oder brav sein – dann verschwinden die Sterne wieder.'],
      ];
      for (const [a, b] of rows) {
        txt(ctx, a, x0, y, 16, '#ffd84a', 'left', null);
        ctx.font = '700 14px ' + FONT;
        for (const l of wrapText(ctx, b, cw - 190)) { txt(ctx, l, x0 + 180, y, 14, '#fff', 'left', null, 0, '700 '); y += 20; }
        y += 10;
      }
    } else {
      const opts = [
        ['Musik: ' + (G.audio.musicVolume > 0 ? 'an' : 'aus'), () => G.audio.setMusicVolume(G.audio.musicVolume > 0 ? 0 : 1)],
        ['Sprachausgabe (Ansager): ' + (G.audio.speech ? 'an' : 'aus'), () => { G.audio.speech = !G.audio.speech; G.game.save(); }],
        ['Lebkuchenherzen auf der Karte zeigen: ' + (G.game.showHeartsOnMap ? 'ja' : 'nein'), () => { G.game.showHeartsOnMap = !G.game.showHeartsOnMap; }],
        ['Wiesn-Postkarte speichern (Foto)', () => { G.game.photo(); }],
        ['Spiel speichern', () => { G.game.save(); toast('Gespeichert!'); }],
        ['Zurück zum Titelbild', () => { G.game.save(); G.game.toTitle(); }],
      ];
      opts.forEach(([label, fn], i) => {
        const bx = x0, by = y + i * 52;
        ctx.fillStyle = pause.sel === i ? 'rgba(255,107,213,.5)' : 'rgba(255,255,255,.1)'; rrect(ctx, bx, by, Math.min(520, cw), 42, 8); ctx.fill();
        txt(ctx, label, bx + 16, by + 21, 16, '#fff', 'left', null);
        for (const c of clicks) if (c.x > bx && c.x < bx + 520 && c.y > by && c.y < by + 42) fn();
        if (pause.sel === i && (I.hit('act') || I.hit('space'))) fn();
      });
      if (I.hit('down')) pause.sel = Math.min(opts.length - 1, pause.sel + 1);
      if (I.hit('up')) pause.sel = Math.max(0, pause.sel - 1);
    }
    ctx.restore();
    txt(ctx, 'Weiterspielen: Esc / P   (oder hier tippen)', W / 2, H - 28, 15, '#7fff9a', 'center', '#000', 3);
    for (const c of clicks) if (c.y > H - 50) G.game.togglePause();
  }

  // ---------- Logo im GTA-VI-Stil ----------
  function drawLogo(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const g = ctx.createLinearGradient(-200, -80, 200, 80);
    g.addColorStop(0, '#ff4fb8'); g.addColorStop(0.45, '#ff8a3c'); g.addColorStop(1, '#ffd84a');
    ctx.font = '900 150px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#1a0a2a'; ctx.strokeText('GTA', 0, 0);
    ctx.fillStyle = g; ctx.fillText('GTA', 0, 0);
    ctx.font = 'italic 900 64px ' + FONT;
    ctx.lineWidth = 10; ctx.strokeText('WIESN', 0, 92);
    const g2 = ctx.createLinearGradient(0, 60, 0, 120); g2.addColorStop(0, '#ffffff'); g2.addColorStop(1, '#7fd0ff');
    ctx.fillStyle = g2; ctx.fillText('WIESN', 0, 92);
    ctx.restore();
  }

  // ---------- Touch-Knöpfe ----------
  function wantsJoystick() { return touchMode === 'world' || touchMode === 'stick'; }
  function setTouchMode(m) { touchMode = m; }
  function layoutButtons(W, H) {
    const b = [];
    const R = Math.min(42, W * 0.06 + 10, H * 0.085);
    if (touchMode === 'world') {
      b.push({ name: 'act', label: 'E', x: W - R - 24, y: H - R - 40, r: R * 1.2, col: '#ffd84a' });
      b.push({ name: 'sprint', label: '⚡', x: W - R * 3.4 - 24, y: H - R - 26, r: R, col: '#4ab0ff' });
      b.push({ name: 'map', label: 'M', x: W - R - 24, y: H - R * 3.6 - 40, r: R * 0.75, col: '#9cff7a' });
      b.push({ name: 'radio', label: '♪', x: W - R * 3.2 - 24, y: H - R * 3.4 - 26, r: R * 0.7, col: '#ff9ad8' });
      b.push({ name: 'pause', label: 'II', x: W / 2, y: 26, r: 22, col: '#fff' });
    } else if (touchMode === 'lr' || touchMode === 'lrd') {
      b.push({ name: 'left', label: '◀', x: R + 30, y: H - R - 40, r: R * 1.2, col: '#fff' });
      b.push({ name: 'right', label: '▶', x: R * 3.8 + 30, y: H - R - 40, r: R * 1.2, col: '#fff' });
      if (touchMode === 'lrd') b.push({ name: 'down', label: '▼', x: W - R * 3.6 - 30, y: H - R - 40, r: R, col: '#9cff7a' });
      b.push({ name: 'act', label: 'E', x: W - R - 30, y: H - R - 40, r: R * 1.2, col: '#ffd84a' });
    } else if (touchMode === 'stick') {
      b.push({ name: 'act', label: 'E', x: W - R - 30, y: H - R - 40, r: R * 1.3, col: '#ffd84a' });
      b.push({ name: 'back', label: '✕', x: W - 30, y: 30, r: 20, col: '#fff' });
    } else if (touchMode === 'tap') {
      b.push({ name: 'act', label: 'E', x: W - R - 30, y: H - R - 40, r: R * 1.2, col: '#ffd84a' });
    }
    G.input.setButtons(b);
    return b;
  }
  function drawTouch(ctx, W, H) {
    const b = layoutButtons(W, H);
    if (!G.input.usedTouch) return;
    for (const k of b) {
      const dn = G.input.down(k.name);
      circle(ctx, k.x, k.y, k.r, dn ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.35)');
      ctx.strokeStyle = k.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, TAU); ctx.stroke();
      txt(ctx, k.label, k.x, k.y + 1, k.r * 0.7, k.col, 'center', null);
    }
    const j = G.input.joy;
    if (wantsJoystick() && j.id !== null) {
      circle(ctx, j.ox, j.oy, 55, 'rgba(255,255,255,.12)');
      circle(ctx, j.ox + j.x * 55, j.oy + j.y * 55, 26, 'rgba(255,255,255,.4)');
    } else if (wantsJoystick()) {
      txt(ctx, 'Daumen hier = laufen', 110, H - 40, 13, 'rgba(255,255,255,.5)', 'center', null);
    }
  }
  // Minispiele melden, welche Touch-Knöpfe sie brauchen
  function touchHint(ctx, spec) {
    if (spec.length === 1 && spec[0] === 'E') touchMode = 'tap';
    else if (spec.includes('stick')) touchMode = 'stick';
    else if (spec.includes('▼')) touchMode = 'lrd';
    else touchMode = 'lr';
  }

  return {
    toast, dialog, objective, missionTitle, missionPassed, missionFailed, showRadio, big,
    updateUI, drawDialog, drawCards, drawToasts, drawHUD, drawBigMap, drawPause, drawLogo, drawTouch, touchHint,
    wantsJoystick, setTouchMode,
    get dialogOpen() { return !!dlgState; },
    get cardOpen() { return !!card; },
    set prompt(p) { prompt = p; },
    pause,
  };
})();
