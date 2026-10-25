'use strict';
// Die Theresienwiese – Karte, Gebäude, Fahrgeschäfte und ihre Darstellung (3/4-Draufsicht)
G.world = (function () {
  const W = 3200, H = 2400;
  const FENCE = { x: 90, y: 90, w: 3020, h: 2220 };

  // Straßen (nur Optik + Wegenetz für die Besucher)
  const roads = [
    { x: 600, y: 100, w: 2260, h: 140, name: 'Wiesn-Eingang' },
    { x: 1300, y: 100, w: 160, h: 1800, name: 'Schaustellerstraße', v: true },
    { x: 2160, y: 60, w: 160, h: 1840, name: 'Wirtsbudenstraße', v: true },
    { x: 600, y: 100, w: 120, h: 1800, name: 'Zur Bavaria', v: true },
    { x: 2780, y: 100, w: 80, h: 1800, name: '', v: true },
    { x: 600, y: 425, w: 2260, h: 80, name: 'Straße 1' },
    { x: 600, y: 765, w: 2260, h: 80, name: 'Straße 2' },
    { x: 330, y: 1105, w: 2530, h: 80, name: 'Straße 3' },
    { x: 600, y: 1445, w: 2260, h: 80, name: 'Straße 4' },
    { x: 600, y: 1770, w: 2260, h: 80, name: 'Straße 5' },
    { x: 1340, y: 1850, w: 120, h: 130, name: '' },
  ];

  const solids = [];
  const objects = [];
  const lights = [];
  const places = {};

  function rectSolid(x, y, w, h) { solids.push({ t: 'r', x, y, w, h }); }
  function circSolid(x, y, r) { solids.push({ t: 'c', x, y, r }); }

  // ---------- Festzelte ----------
  const tents = [
    { id: 'armbrust', name: 'Armbrustschützen-Festzelt', x: 1560, y: 250, w: 500, h: 150, H: 70, roof: ['#3c8d3c', '#f4f1e6'], deco: 'armbrust' },
    { id: 'augustiner', name: 'Augustiner-Festhalle', x: 1560, y: 530, w: 500, h: 210, H: 80, roof: ['#7a4b2a', '#f2e6c8'], deco: 'fass' },
    { id: 'loewen', name: 'Löwenbräu-Festzelt', x: 1560, y: 870, w: 500, h: 210, H: 80, roof: ['#1f5fa8', '#f4f1e6'], deco: 'lion' },
    { id: 'schuetzen', name: 'Schützen-Festzelt', x: 1560, y: 1210, w: 500, h: 210, H: 75, roof: ['#2f7a4a', '#f4f1e6'], deco: 'scheibe' },
    { id: 'vroni', name: 'Fischer-Vroni', x: 1620, y: 1560, w: 400, h: 180, H: 65, roof: ['#2a6db5', '#ffffff'], deco: 'fish' },
    { id: 'schottenhamel', name: 'Schottenhamel', x: 2420, y: 250, w: 340, h: 150, H: 75, roof: ['#b8322a', '#f4f1e6'], deco: 'fass' },
    { id: 'hofbraeu', name: 'Hofbräu-Festzelt', x: 2420, y: 530, w: 340, h: 210, H: 80, roof: ['#1a7fd4', '#ffffff'], deco: 'rauten' },
    { id: 'hacker', name: 'Hacker-Festzelt', x: 2420, y: 870, w: 340, h: 210, H: 80, roof: ['#7fb6e6', '#ffffff'], deco: 'clouds' },
    { id: 'paulaner', name: 'Paulaner Festzelt', x: 2420, y: 1210, w: 340, h: 210, H: 80, roof: ['#1d3e7a', '#e8d9a8'], deco: 'tower' },
    { id: 'ochsen', name: 'Ochsenbraterei', x: 2420, y: 1560, w: 340, h: 180, H: 70, roof: ['#8b2b1f', '#f4f1e6'], deco: 'ox' },
    { id: 'herzkasperl', name: 'Herzkasperl-Zelt', x: 1640, y: 2030, w: 400, h: 170, H: 65, roof: ['#d14b7a', '#fff4f8'], deco: 'herz' },
  ];
  const TENT_INFO = {
    armbrust: 'Hier wird mit der Armbrust auf Scheiben geschossen – eine alte Wiesn-Tradition!',
    augustiner: 'In der Augustiner-Festhalle kommt das Bier noch aus Holzfässern.',
    loewen: 'Auf dem Turm vom Löwenbräu-Zelt sitzt ein großer Löwe, der ab und zu brüllt!',
    schuetzen: 'Das Schützen-Festzelt steht ganz nah bei der Bavaria.',
    vroni: 'Bei der Fischer-Vroni gibt’s Steckerlfisch – Fisch am Stecken, über Holzkohle gegrillt.',
    schottenhamel: 'Im Schottenhamel heißt es am ersten Wiesn-Samstag um 12 Uhr: „O’zapft is!“ – dann ist die Wiesn eröffnet.',
    hofbraeu: 'Das Hofbräu-Zelt ist blau-weiß geschmückt – wie der bayerische Himmel.',
    hacker: 'Das Hacker-Zelt nennt man auch „Himmel der Bayern“ – die Decke ist wie ein Himmel mit Wolken bemalt.',
    paulaner: 'Oben auf dem Turm vom Paulaner-Zelt dreht sich ein riesiger Maßkrug.',
    ochsen: 'An der Ochsenbraterei dreht sich vorne ein Ochse am Spieß – zum Glück nur als Figur!',
    herzkasperl: 'Das Herzkasperl-Zelt auf der Oidn Wiesn hat Volksmusik und bayerische Mundart-Bühne.',
  };
  for (const t of tents) {
    rectSolid(t.x, t.y, t.w, t.h);
    t.kind = 'tent'; t.baseY = t.y + t.h; t.info = TENT_INFO[t.id];
    t.door = { x: t.x + t.w / 2, y: t.y + t.h + 18 };
    objects.push(t);
    lights.push({ x: t.x + t.w / 2, y: t.y + t.h - t.H / 2, r: t.w * 0.55, c: 'rgba(255,200,120,' });
  }
  places.schottenhamel = tents.find(t => t.id === 'schottenhamel').door;

  // ---------- Servicezentrum ----------
  const service = { kind: 'service', x: 2880, y: 250, w: 180, h: 170, H: 70, baseY: 420, name: 'Servicezentrum' };
  rectSolid(service.x, service.y, service.w, service.h);
  objects.push(service);
  places.service = { x: 2970, y: 445 };

  // ---------- Buden ----------
  const stands = [
    { id: 'brezn', name: 'Brezn', x: 2070, y: 300, color: '#c98a3a', price: 2 },
    { id: 'mandeln', name: 'Gebrannte Mandeln', x: 2330, y: 560, color: '#d4433a', price: 3 },
    { id: 'lebkuchen', name: 'Lebkuchenherzen', x: 2070, y: 930, color: '#e84d8a', price: 4 },
    { id: 'zucker', name: 'Zuckerwatte', x: 1470, y: 600, color: '#ff8ad8', price: 3 },
    { id: 'schoko', name: 'Schokofrüchte', x: 1470, y: 1260, color: '#7a4a2a', price: 3 },
    { id: 'fisch', name: 'Steckerlfisch', x: 2070, y: 1600, color: '#2a6db5', price: 5 },
    { id: 'brezn2', name: 'Brezn', x: 1470, y: 1600, color: '#c98a3a', price: 2 },
    { id: 'mandeln2', name: 'Gebrannte Mandeln', x: 2330, y: 1260, color: '#d4433a', price: 3 },
  ];
  for (const s of stands) {
    s.w = 80; s.h = 46; s.H = 46; s.kind = 'stand'; s.baseY = s.y + s.h;
    s.front = { x: s.x + s.w / 2, y: s.y + s.h + 16 };
    rectSolid(s.x, s.y, s.w, s.h);
    objects.push(s);
    lights.push({ x: s.x + 40, y: s.y + 30, r: 70, c: 'rgba(255,220,140,' });
  }
  places.brezn = stands[0].front; places.lebkuchen = stands[2].front;

  // ---------- Fahrgeschäfte ----------
  const riesenrad = { kind: 'riesenrad', x: 1010, y: 330, baseY: 395, R: 165, hub: 205, name: 'Riesenrad' };
  circSolid(1010, 340, 58);
  objects.push(riesenrad);
  places.riesenrad = { x: 1010, y: 425 };

  const toboggan = { kind: 'toboggan', x: 1060, y: 560, w: 180, h: 160, H: 270, baseY: 720, name: 'Toboggan' };
  rectSolid(toboggan.x, toboggan.y, toboggan.w, toboggan.h);
  objects.push(toboggan);
  places.toboggan = { x: 1150, y: 748 };
  // Zuschauerbänke vor dem Toboggan
  objects.push({ kind: 'bench', x: 1080, y: 740, w: 50, baseY: 750 });
  objects.push({ kind: 'bench', x: 1180, y: 740, w: 50, baseY: 750 });

  const teufelsrad = { kind: 'teufelsrad', x: 760, y: 560, w: 240, h: 180, H: 95, baseY: 740, name: 'Teufelsrad' };
  rectSolid(teufelsrad.x, teufelsrad.y, teufelsrad.w, teufelsrad.h);
  objects.push(teufelsrad);
  places.teufelsrad = { x: 880, y: 770 };

  const wellenflug = { kind: 'wellenflug', x: 900, y: 960, baseY: 990, name: 'Wellenflug' };
  circSolid(900, 960, 60);
  objects.push(wellenflug);
  places.wellenflug = { x: 900, y: 1060 };

  const autoscooter = { kind: 'autoscooter', x: 760, y: 1215, w: 480, h: 195, baseY: 1212, name: 'Autoscooter' };
  rectSolid(autoscooter.x, autoscooter.y, autoscooter.w, autoscooter.h);
  objects.push(autoscooter);
  places.autoscooter = { x: 1000, y: 1432 };

  const schichtl = { kind: 'schichtl', x: 1060, y: 1560, w: 180, h: 170, H: 95, baseY: 1730, name: 'Schichtl' };
  rectSolid(schichtl.x, schichtl.y, schichtl.w, schichtl.h);
  objects.push(schichtl);
  places.schichtl = { x: 1150, y: 1755 };

  const looping = { kind: 'looping', x: 160, y: 1500, w: 440, h: 250, baseY: 1750, name: 'Olympia-Looping' };
  rectSolid(looping.x, looping.y, looping.w, looping.h);
  objects.push(looping);
  places.looping = { x: 520, y: 1780 };

  const krinoline = { kind: 'krinoline', x: 1050, y: 2120, baseY: 2160, name: 'Krinoline' };
  circSolid(1050, 2120, 78);
  objects.push(krinoline);
  places.krinoline = { x: 1050, y: 2225 };

  // Oide Wiesn – Zaun mit Tor
  rectSolid(740, 1950, 600, 14); rectSolid(1460, 1950, 840, 14);
  rectSolid(740, 1950, 14, 360); rectSolid(2286, 1950, 14, 360);
  objects.push({ kind: 'oidewiesn', baseY: 1964 });

  // Bavaria und Ruhmeshalle
  const ruhmeshalle = { kind: 'ruhmeshalle', x: 140, y: 720, w: 440, h: 70, H: 120, baseY: 790 };
  rectSolid(140, 720, 440, 70); rectSolid(140, 790, 60, 170); rectSolid(520, 790, 60, 170);
  objects.push(ruhmeshalle);
  objects.push({ kind: 'wing', x: 140, y: 790, w: 60, h: 170, H: 120, baseY: 960 });
  objects.push({ kind: 'wing', x: 520, y: 790, w: 60, h: 170, H: 120, baseY: 960 });
  const bavaria = { kind: 'bavaria', x: 360, y: 975, baseY: 1000, name: 'Bavaria' };
  rectSolid(325, 945, 70, 55);
  objects.push(bavaria);
  places.bavaria = { x: 360, y: 1030 };

  // Haupteingang
  objects.push({ kind: 'gate', x: 2240, y: 92, baseY: 96 });
  places.eingang = { x: 2240, y: 200 };
  places.vroni = { x: 1820, y: 1770 };
  places.hacker = { x: 2590, y: 1100 };

  // Bäume (Kastanien) am Bavaria-Hang und am Rand
  const trees = [];
  const trng = mulberry32(5);
  for (let i = 0; i < 26; i++) {
    const tx = 120 + trng() * 460, ty = 1020 + trng() * 440;
    if (tx > 290 && tx < 430) continue;
    trees.push({ kind: 'tree', x: tx, y: ty, baseY: ty, s: 0.8 + trng() * 0.5 });
  }
  for (let i = 0; i < 10; i++) trees.push({ kind: 'tree', x: 2900 + trng() * 180, y: 500 + i * 150 + trng() * 40, baseY: 0, s: 0.8 + trng() * 0.4 });
  for (const t of trees) { t.baseY = t.y; circSolid(t.x, t.y, 10); objects.push(t); }

  // Laternen
  for (let y = 300; y < 1850; y += 220) {
    for (const x of [1296, 1464, 2156, 2324]) {
      objects.push({ kind: 'lamp', x, y, baseY: y });
      lights.push({ x, y: y - 40, r: 90, c: 'rgba(255,230,160,' });
    }
  }

  // Sammel-Lebkuchenherzen (je eines schaltet Wiesn-Wissen frei)
  const heartSpots = [
    [700, 300], [1240, 470], [930, 860], [1350, 1000], [690, 1640], [480, 1160],
    [180, 1000], [2120, 820], [2380, 1000], [2830, 700], [3040, 1500], [2870, 1880],
    [2120, 1860], [1530, 1500], [1500, 2265], [2200, 2230], [1460, 2070], [1600, 160],
  ];

  // ---------- Kollision ----------
  function collide(e, r) {
    let hit = false;
    for (const s of solids) {
      if (s.t === 'r') {
        const cx = clamp(e.x, s.x, s.x + s.w), cy = clamp(e.y, s.y, s.y + s.h);
        const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
        if (d2 < r * r) {
          hit = true;
          if (d2 > 0.0001) { const d = Math.sqrt(d2), p = (r - d) / d; e.x += dx * p; e.y += dy * p; }
          else {
            const l = e.x - s.x, rr2 = s.x + s.w - e.x, t = e.y - s.y, b = s.y + s.h - e.y;
            const m = Math.min(l, rr2, t, b);
            if (m === l) e.x = s.x - r; else if (m === rr2) e.x = s.x + s.w + r; else if (m === t) e.y = s.y - r; else e.y = s.y + s.h + r;
          }
        }
      } else {
        const dx = e.x - s.x, dy = e.y - s.y, d = Math.hypot(dx, dy), m = s.r + r;
        if (d < m) { hit = true; if (d < 0.01) { e.x += m; } else { e.x = s.x + dx / d * m; e.y = s.y + dy / d * m; } }
      }
    }
    let edge = false;
    if (e.x < FENCE.x + r) { e.x = FENCE.x + r; edge = true; }
    if (e.x > FENCE.x + FENCE.w - r) { e.x = FENCE.x + FENCE.w - r; edge = true; }
    if (e.y < FENCE.y + r) { e.y = FENCE.y + r; edge = true; }
    if (e.y > FENCE.y + FENCE.h - r) { e.y = FENCE.y + FENCE.h - r; edge = true; }
    return { hit, edge };
  }

  function solidAt(x, y, r) {
    const e = { x, y };
    const res = collide(e, r || 8);
    return res.hit || res.edge;
  }

  // ---------- Wegenetz für Besucher ----------
  const NX = [660, 1380, 2240, 2820], NY = [170, 465, 805, 1145, 1485, 1810];
  const nodes = [];
  for (let j = 0; j < NY.length; j++) for (let i = 0; i < NX.length; i++) nodes.push({ x: NX[i], y: NY[j], i, j, nb: [] });
  const nodeAt = (i, j) => nodes[j * NX.length + i];
  for (const n of nodes) {
    if (n.i > 0) n.nb.push(nodeAt(n.i - 1, n.j));
    if (n.i < NX.length - 1) n.nb.push(nodeAt(n.i + 1, n.j));
    if (n.j > 0) n.nb.push(nodeAt(n.i, n.j - 1));
    if (n.j < NY.length - 1) n.nb.push(nodeAt(n.i, n.j + 1));
  }

  // ================= ZEICHNEN =================
  function drawOutside(ctx, vx, vy, vw, vh) {
    ctx.fillStyle = '#2f5a2a';
    ctx.fillRect(vx - 50, vy - 50, vw + 100, vh + 100);
    // Bäume und Häuser der Stadt rund um die Wiesn
    const x0 = Math.floor((vx - 100) / 90), x1 = Math.ceil((vx + vw + 100) / 90);
    const y0 = Math.floor((vy - 100) / 90), y1 = Math.ceil((vy + vh + 100) / 90);
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
      const px = gx * 90, py = gy * 90;
      if (px > FENCE.x - 60 && px < FENCE.x + FENCE.w + 60 && py > FENCE.y - 60 && py < FENCE.y + FENCE.h + 60) continue;
      const h = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;
      if (h < 0.35) {
        ctx.fillStyle = h < 0.17 ? '#d8c3a5' : '#e6d7b9';
        ctx.fillRect(px + 10, py - 30, 70, 70);
        ctx.fillStyle = '#a5402d'; ctx.fillRect(px + 10, py - 50, 70, 30);
        ctx.fillStyle = '#5a7fa8'; for (let k = 0; k < 3; k++) ctx.fillRect(px + 18 + k * 20, py - 14, 10, 14);
      } else {
        circle(ctx, px + 45, py + 30, 10, 'rgba(0,0,0,.25)');
        circle(ctx, px + 45, py + 5, 30, h < 0.7 ? '#3e7a35' : '#4a8a3c');
        circle(ctx, px + 35, py - 5, 16, 'rgba(255,255,255,.08)');
      }
    }
  }

  function drawGround(ctx, t, vx, vy, vw, vh) {
    drawOutside(ctx, vx, vy, vw, vh);
    // Festgelände
    ctx.fillStyle = '#bdb4a2';
    ctx.fillRect(FENCE.x, FENCE.y, FENCE.w, FENCE.h);
    // Bavaria-Hang (Wiese)
    const g = ctx.createLinearGradient(0, 700, 0, 1300);
    g.addColorStop(0, '#5f9a48'); g.addColorStop(1, '#78ad55');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(FENCE.x, 640); ctx.lineTo(600, 640); ctx.lineTo(600, 1100); ctx.lineTo(330, 1100); ctx.lineTo(330, 1190); ctx.lineTo(600, 1190); ctx.lineTo(600, 1470); ctx.lineTo(FENCE.x, 1470); ctx.closePath(); ctx.fill();
    // Gras am Ostrand
    ctx.fillStyle = '#6ea350'; ctx.fillRect(2870, 440, 240, 1460);
    // Oide Wiesn Boden (heller Kies)
    ctx.fillStyle = '#d1c29f'; ctx.fillRect(754, 1964, 1532, 346);
    for (let i = 0; i < 60; i++) { const px = 760 + ((i * 397) % 1520), py = 1970 + ((i * 173) % 330); circle(ctx, px, py, 2, 'rgba(120,100,70,.3)'); }
    // Straßen
    for (const r of roads) {
      ctx.fillStyle = '#9d978b'; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fillRect(r.x, r.y, r.w, 3);
    }
    // Pflaster-Muster in Blöcken
    ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 1;
    const gx0 = Math.max(FENCE.x, Math.floor(vx / 40) * 40), gx1 = Math.min(FENCE.x + FENCE.w, vx + vw);
    ctx.beginPath();
    for (let x = gx0; x < gx1; x += 40) { ctx.moveTo(x, Math.max(FENCE.y, vy)); ctx.lineTo(x, Math.min(FENCE.y + FENCE.h, vy + vh)); }
    ctx.stroke();
    // Treppe zur Bavaria
    for (let i = 0; i < 14; i++) {
      const sy = 1005 + i * 7.5;
      ctx.fillStyle = i % 2 ? '#d9d1bf' : '#c7bea9';
      ctx.fillRect(300 - i * 2, sy, 120 + i * 4, 7.5);
    }
    // Straßennamen
    ctx.save();
    for (const r of roads) {
      if (!r.name) continue;
      ctx.globalAlpha = 0.45;
      if (r.v) {
        for (let y = r.y + 260; y < r.y + r.h - 100; y += 680) {
          ctx.save(); ctx.translate(r.x + r.w / 2, y); ctx.rotate(-Math.PI / 2);
          txt(ctx, r.name.toUpperCase(), 0, 0, r.w > 130 ? 22 : 15, '#f4f0e6', 'center', null);
          ctx.restore();
        }
      } else {
        const ly = r.h > 100 ? r.y + 32 : r.y + r.h / 2;
        txt(ctx, r.name.toUpperCase(), r.x + 400, ly, 18, '#f4f0e6', 'center', null);
        txt(ctx, r.name.toUpperCase(), r.x + r.w - 260, ly, 18, '#f4f0e6', 'center', null);
      }
    }
    ctx.restore();
    // Zaun
    ctx.strokeStyle = '#f2f2f2'; ctx.lineWidth = 5; ctx.setLineDash([14, 8]);
    ctx.strokeRect(FENCE.x - 3, FENCE.y - 3, FENCE.w + 6, FENCE.h + 6);
    ctx.setLineDash([]);
    // Wimpelketten über die Straßen
    for (let y = 330; y < 1800; y += 340) {
      for (const [x0, x1] of [[1300, 1460], [2160, 2320]]) {
        ctx.strokeStyle = 'rgba(60,60,60,.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, y - 70); ctx.quadraticCurveTo((x0 + x1) / 2, y - 40, x1, y - 70); ctx.stroke();
        for (let k = 1; k < 8; k++) {
          const px = x0 + (x1 - x0) * k / 8, py = y - 70 + Math.sin(k / 8 * Math.PI) * 15;
          ctx.fillStyle = k % 2 ? '#1a7fd4' : '#ffffff';
          ctx.beginPath(); ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py); ctx.lineTo(px, py + 12); ctx.fill();
        }
      }
    }
  }

  // ----- Festzelt -----
  function drawTent(ctx, b, t) {
    const { x, y, w, h, H } = b;
    const rt = y - H;
    // Schatten
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 10, y + h - 6, w, 14);
    // Dach mit Bahnen
    const n = Math.max(6, Math.round(w / 34)), sw = w / n;
    for (let i = 0; i < n; i++) { ctx.fillStyle = b.roof[i % 2]; ctx.fillRect(x + i * sw, rt, sw + 0.5, h); }
    const gr = ctx.createLinearGradient(0, rt, 0, rt + h);
    gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(0.45, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.12)');
    ctx.fillStyle = gr; ctx.fillRect(x, rt, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, rt + h * 0.45, w, 3);
    // Vorderwand
    const wy = y + h - H;
    ctx.fillStyle = '#efe4cc'; ctx.fillRect(x, wy, w, H);
    ctx.fillStyle = '#8a5a32';
    for (let bx = x; bx <= x + w; bx += 40) ctx.fillRect(bx - 2, wy, 4, H);
    ctx.fillRect(x, wy, w, 5); ctx.fillRect(x, wy + H * 0.55, w, 3);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x, y + h - 10, w, 10);
    // Fenster mit warmem Licht
    for (let bx = x + 20; bx < x + w - 30; bx += 40) {
      if (Math.abs(bx + 10 - (x + w / 2)) < 50) continue;
      ctx.fillStyle = '#ffcf7a'; ctx.fillRect(bx, wy + H * 0.62, 20, H * 0.24);
      ctx.fillStyle = 'rgba(120,70,20,.5)'; ctx.fillRect(bx + 9, wy + H * 0.62, 2, H * 0.24);
    }
    // Eingangsbogen
    const dx = x + w / 2;
    ctx.fillStyle = '#5a3418';
    ctx.beginPath(); ctx.moveTo(dx - 34, y + h); ctx.lineTo(dx - 34, y + h - 34); ctx.quadraticCurveTo(dx, y + h - 62, dx + 34, y + h - 34); ctx.lineTo(dx + 34, y + h); ctx.fill();
    ctx.fillStyle = '#2a170a';
    ctx.beginPath(); ctx.moveTo(dx - 26, y + h); ctx.lineTo(dx - 26, y + h - 30); ctx.quadraticCurveTo(dx, y + h - 52, dx + 26, y + h - 30); ctx.lineTo(dx + 26, y + h); ctx.fill();
    // Girlande
    ctx.strokeStyle = '#3f7f2f'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(dx - 40, y + h - 38); ctx.quadraticCurveTo(dx, y + h - 20, dx + 40, y + h - 38); ctx.stroke();
    // Namensschild
    ctx.font = '900 15px ' + FONT;
    const tw = Math.min(w - 20, ctx.measureText(b.name).width + 24);
    ctx.fillStyle = '#fff8e6'; rrect(ctx, dx - tw / 2, wy + 9, tw, 22, 4); ctx.fill();
    ctx.strokeStyle = b.roof[0]; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(dx - tw / 2, wy + 9, tw, 22); ctx.clip();
    txt(ctx, b.name, dx, wy + 21, 14, b.roof[0] === '#ffffff' ? '#1a7fd4' : b.roof[0], 'center', null);
    ctx.restore();
    // Fahnen auf dem Dach
    for (let fx = x + 30; fx < x + w; fx += 110) flag(ctx, fx, rt + 6, 30, t);
    drawTentDeco(ctx, b, t);
  }

  function drawTentDeco(ctx, b, t) {
    const { x, y, w, h, H } = b;
    const cx = x + w / 2, top = y + h - H - 6;
    switch (b.deco) {
      case 'tower': {
        // Turm mit drehendem Maßkrug
        ctx.fillStyle = '#e8d9a8'; ctx.fillRect(cx - 18, top - 70, 36, 80);
        ctx.fillStyle = '#1d3e7a'; ctx.fillRect(cx - 22, top - 76, 44, 10);
        const sx = Math.cos(t * 1.2);
        ctx.save(); ctx.translate(cx, top - 100); ctx.scale(Math.abs(sx) * 0.6 + 0.4, 1);
        ctx.fillStyle = 'rgba(230,240,255,.9)'; ctx.fillRect(-14, -18, 28, 40);
        ctx.fillStyle = '#f2b632'; ctx.fillRect(-12, -8, 24, 28);
        ctx.fillStyle = '#fff'; ellipse(ctx, 0, -16, 16, 8, '#fff');
        ctx.strokeStyle = 'rgba(230,240,255,.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sx > 0 ? 16 : -16, 2, 10, -1.2, 1.2, sx < 0); ctx.stroke();
        ctx.restore();
        break;
      }
      case 'lion': {
        ctx.fillStyle = '#e8d9a8'; ctx.fillRect(cx - 20, top - 60, 40, 70);
        ctx.fillStyle = '#d9a53a';
        ellipse(ctx, cx, top - 74, 22, 14, '#d9a53a');
        circle(ctx, cx - 14, top - 86, 13, '#b8862a');
        circle(ctx, cx - 14, top - 86, 9, '#e8bd55');
        circle(ctx, cx - 18, top - 88, 1.6, '#000');
        const roar = (t % 9) < 1.2;
        if (roar) { ctx.fillStyle = '#7a1d1d'; ellipse(ctx, cx - 21, top - 82, 4, 3, '#7a1d1d'); txt(ctx, 'ROAAR!', cx - 50, top - 110, 14, '#fff'); }
        ctx.strokeStyle = '#b8862a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 20, top - 74); ctx.quadraticCurveTo(cx + 36, top - 90, cx + 30, top - 98); ctx.stroke();
        break;
      }
      case 'clouds': {
        for (let i = 0; i < 4; i++) {
          const ox = x + 50 + i * 80 + Math.sin(t * 0.4 + i) * 6, oy = y - H + 40 + (i % 2) * 40;
          circle(ctx, ox, oy, 16, 'rgba(255,255,255,.9)'); circle(ctx, ox + 16, oy + 4, 12, 'rgba(255,255,255,.9)'); circle(ctx, ox - 15, oy + 5, 11, 'rgba(255,255,255,.9)');
        }
        break;
      }
      case 'ox': {
        const wy = y + h - H;
        const rot = t * 1.5;
        ctx.fillStyle = '#555'; ctx.fillRect(x + 30, wy - 14, w - 60, 4);
        ctx.save(); ctx.translate(cx, wy - 12);
        ctx.scale(1, 0.75 + 0.25 * Math.cos(rot));
        ellipse(ctx, 0, 0, 40, 16, '#8a4a20');
        circle(ctx, -42, -4, 10, '#7a3e18');
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(-52, -16, 4, 8); ctx.fillRect(-38, -16, 4, 8);
        ctx.restore();
        break;
      }
      case 'fish': {
        for (let i = 0; i < 3; i++) {
          const fx = x + 60 + i * 140, fy = y - H + 30 + Math.sin(t * 2 + i) * 4;
          ellipse(ctx, fx, fy, 22, 9, '#e8f4ff');
          ctx.fillStyle = '#e8f4ff'; ctx.beginPath(); ctx.moveTo(fx + 18, fy); ctx.lineTo(fx + 32, fy - 9); ctx.lineTo(fx + 32, fy + 9); ctx.fill();
          circle(ctx, fx - 13, fy - 2, 2, '#123');
        }
        break;
      }
      case 'herz': {
        for (let i = 0; i < 4; i++) drawHeart(ctx, x + 60 + i * 95, y - H + 40 + Math.sin(t * 2 + i) * 3, 14, '#ff5a8a');
        break;
      }
      case 'rauten': {
        rauten(ctx, x + 10, y + h - H + 34, 60, 22, 8);
        rauten(ctx, x + w - 70, y + h - H + 34, 60, 22, 8);
        break;
      }
      case 'scheibe': case 'armbrust': {
        const sx = x + w - 60, sy = y + h - H + 40;
        circle(ctx, sx, sy, 16, '#fff'); circle(ctx, sx, sy, 11, '#c0392b'); circle(ctx, sx, sy, 6, '#fff'); circle(ctx, sx, sy, 2.5, '#000');
        break;
      }
      case 'fass': {
        const fx = x + 50, fy = y + h - 22;
        ctx.fillStyle = '#8a5a2e'; rrect(ctx, fx - 18, fy - 22, 36, 26, 8); ctx.fill();
        ctx.fillStyle = '#3a3a3a'; ctx.fillRect(fx - 18, fy - 16, 36, 3); ctx.fillRect(fx - 18, fy - 4, 36, 3);
        break;
      }
    }
  }

  function drawHeart(ctx, x, y, s, col, text) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.9);
    ctx.bezierCurveTo(-s * 1.4, -s * 0.1, -s * 0.8, -s * 1.1, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.8, -s * 1.1, s * 1.4, -s * 0.1, 0, s * 0.9);
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, s / 7); ctx.setLineDash([s / 5, s / 6]);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.68);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.05, -s * 0.65, -s * 0.85, 0, -s * 0.3);
    ctx.bezierCurveTo(s * 0.65, -s * 0.85, s * 1.1, -s * 0.05, 0, s * 0.68);
    ctx.stroke(); ctx.setLineDash([]);
    if (text) txt(ctx, text, 0, -s * 0.05, s * 0.32, '#fff6c8', 'center', '#8a2040', s * 0.08);
    ctx.restore();
  }

  function drawService(ctx, b) {
    const { x, y, w, h, H } = b;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 8, y + h - 6, w, 12);
    ctx.fillStyle = '#d8dde3'; ctx.fillRect(x, y - H, w, h);
    ctx.fillStyle = '#f7f9fb'; ctx.fillRect(x, y + h - H, w, H);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(x, y + h - H, w, 8);
    ctx.fillStyle = '#7fb3e0'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 12 + i * 42, y + h - H + 18, 28, 20);
    ctx.fillStyle = '#334'; ctx.fillRect(x + w / 2 - 16, y + h - 30, 32, 30);
    // Rotes Kreuz und Info
    ctx.fillStyle = '#fff'; ctx.fillRect(x + 20, y - H + 30, 44, 44);
    ctx.fillStyle = '#d42a2a'; ctx.fillRect(x + 37, y - H + 36, 10, 32); ctx.fillRect(x + 26, y - H + 47, 32, 10);
    circle(ctx, x + w - 42, y - H + 52, 22, '#1a7fd4'); txt(ctx, 'i', x + w - 42, y - H + 53, 26, '#fff', 'center', null);
    txt(ctx, 'SERVICEZENTRUM', x + w / 2, y + h - H - 8, 13, '#fff', 'center', '#333', 3);
    txt(ctx, 'Treffpunkt Kinder', x + w / 2, y + h - 40, 10, '#c0392b', 'center', null);
  }

  function drawStand(ctx, s, t) {
    const { x, y, w, h, H } = s;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x + 5, y + h - 4, w, 8);
    // Bude
    ctx.fillStyle = '#8a5a32'; ctx.fillRect(x, y - H + 10, w, h);
    ctx.fillStyle = '#f5ead2'; ctx.fillRect(x + 3, y + h - H, w - 6, H);
    ctx.fillStyle = '#2a1a0e'; ctx.fillRect(x + 8, y + h - H + 14, w - 16, 16);
    // Markise
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#fff' : s.color;
      ctx.beginPath();
      const ax = x - 4 + i * (w + 8) / 6;
      ctx.moveTo(ax, y + h - H - 2); ctx.lineTo(ax + (w + 8) / 6, y + h - H - 2); ctx.lineTo(ax + (w + 8) / 6, y + h - H + 10);
      ctx.arc(ax + (w + 8) / 12, y + h - H + 10, (w + 8) / 12, 0, Math.PI);
      ctx.fill();
    }
    // Theke
    ctx.fillStyle = '#a8703c'; ctx.fillRect(x, y + h - 14, w, 14);
    // Ware
    const cx = x + w / 2, cy = y + h - H + 24;
    switch (s.id.replace(/\d/, '')) {
      case 'brezn':
        for (let i = -1; i <= 1; i++) drawBrezn(ctx, cx + i * 22, cy, 8);
        break;
      case 'mandeln':
        for (let i = 0; i < 4; i++) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 14 + i * 17, cy - 6); ctx.lineTo(x + 24 + i * 17, cy - 6); ctx.lineTo(x + 19 + i * 17, cy + 6); ctx.fill(); circle(ctx, x + 19 + i * 17, cy - 5, 3, '#9a5a2a'); }
        break;
      case 'lebkuchen':
        for (let i = 0; i < 4; i++) { const sw = Math.sin(t * 2 + i) * 2; drawHeart(ctx, x + 14 + i * 17 + sw, cy + 2, 7, ['#e84d8a', '#d4433a', '#f2a03a', '#7a4ad4'][i]); }
        break;
      case 'zucker':
        for (let i = 0; i < 3; i++) { circle(ctx, x + 18 + i * 22, cy - 2, 9, i === 1 ? '#a8e0ff' : '#ffb3e6'); ctx.fillStyle = '#eee'; ctx.fillRect(x + 17 + i * 22, cy + 6, 2, 8); }
        break;
      case 'schoko':
        for (let i = 0; i < 4; i++) { circle(ctx, x + 16 + i * 16, cy - 2, 5, i % 2 ? '#e8203a' : '#3a8a2a'); ctx.fillStyle = '#4a2a14'; ctx.fillRect(x + 11 + i * 16, cy, 10, 6); }
        break;
      case 'fisch':
        for (let i = 0; i < 4; i++) { ctx.fillStyle = '#c9a26a'; ctx.fillRect(x + 15 + i * 16, cy - 10, 2, 22); ellipse(ctx, x + 16 + i * 16, cy - 2, 4, 8, '#b8743a'); }
        ctx.fillStyle = 'rgba(200,200,200,.4)'; circle(ctx, x + 40 + Math.sin(t) * 6, cy - 22 - (t * 20 % 20), 6, 'rgba(220,220,220,.35)');
        break;
    }
    // Schild
    ctx.font = '900 10px ' + FONT;
    const tw = ctx.measureText(s.name).width + 10;
    ctx.fillStyle = '#fff8e6'; rrect(ctx, cx - tw / 2, y - H - 4, tw, 14, 3); ctx.fill();
    txt(ctx, s.name, cx, y - H + 3, 10, '#5a2a10', 'center', null);
  }

  function drawBrezn(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = '#8a4a14'; ctx.lineWidth = s * 0.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.9);
    ctx.bezierCurveTo(-s * 1.6, s * 0.4, -s * 1.4, -s * 1, -s * 0.4, -s * 0.8);
    ctx.bezierCurveTo(0, -s * 0.6, 0, s * 0.2, s * 0.3, s * 0.6);
    ctx.moveTo(s * 0.2, s * 0.9);
    ctx.bezierCurveTo(s * 1.6, s * 0.4, s * 1.4, -s * 1, s * 0.4, -s * 0.8);
    ctx.bezierCurveTo(0, -s * 0.6, 0, s * 0.2, -s * 0.3, s * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(-s + i * s * 0.6, -s * 0.3 + (i % 2) * s * 0.4, 1.5, 1.5);
    ctx.restore();
  }

  // ----- Riesenrad -----
  function drawRiesenrad(ctx, o, t, dark) {
    const hx = o.x, hy = o.y - o.hub, R = o.R;
    // Stützen
    ctx.strokeStyle = '#e8e8ee'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(hx - 70, o.y + 40); ctx.lineTo(hx, hy); ctx.lineTo(hx + 70, o.y + 40); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx - 40, o.y - 50); ctx.lineTo(hx + 40, o.y - 50); ctx.stroke();
    const rot = t * 0.12;
    // Speichen
    ctx.strokeStyle = 'rgba(240,240,250,.85)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 24; i++) { const a = rot + i / 24 * TAU; ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * R, hy + Math.sin(a) * R); }
    ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = '#f0f0f5';
    ctx.beginPath(); ctx.arc(hx, hy, R, 0, TAU); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, R * 0.92, 0, TAU); ctx.stroke();
    // Lichter
    for (let i = 0; i < 48; i++) {
      const a = rot + i / 48 * TAU;
      const on = dark > 0.2 ? ((i + Math.floor(t * 4)) % 3 !== 0) : false;
      circle(ctx, hx + Math.cos(a) * R, hy + Math.sin(a) * R, on ? 2.6 : 1.6, on ? ['#ffe46b', '#ff6bd5', '#6bf0ff'][i % 3] : '#ddd');
    }
    // Gondeln
    const cols = ['#d62f3a', '#f2b632', '#2f8ad6', '#2fa85a', '#e86fb0', '#8a5ad6'];
    for (let i = 0; i < 16; i++) {
      const a = rot + i / 16 * TAU;
      const gx = hx + Math.cos(a) * R, gy = hy + Math.sin(a) * R;
      ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + 8); ctx.stroke();
      ctx.fillStyle = cols[i % cols.length];
      rrect(ctx, gx - 10, gy + 7, 20, 18, 4); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(gx - 7, gy + 10, 14, 6);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(gx - 10, gy + 21, 20, 4);
    }
    circle(ctx, hx, hy, 12, '#ccc'); circle(ctx, hx, hy, 6, '#888');
    // Kasse
    ctx.fillStyle = '#f7f1e3'; ctx.fillRect(hx - 40, o.y + 20, 80, 40);
    ctx.fillStyle = '#d62f3a'; ctx.fillRect(hx - 44, o.y + 14, 88, 10);
    txt(ctx, 'RIESENRAD', hx, o.y + 42, 13, '#d62f3a', 'center', null);
  }

  // ----- Toboggan -----
  function drawToboggan(ctx, o, t, dark) {
    const { x, y, w, h } = o;
    const base = y + h, cx = x + w / 2;
    const topY = base - o.H;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 6, base - 8, w, 14);
    // Plattform/Sockel (Dach)
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(x, y - 40, w, h - 10);
    // Turm hinten
    const tw = 70;
    ctx.fillStyle = '#c99a5a'; ctx.fillRect(cx - tw / 2, topY, tw, o.H - 40);
    ctx.fillStyle = '#a87a40';
    for (let yy = topY + 10; yy < base - 40; yy += 18) ctx.fillRect(cx - tw / 2, yy, tw, 3);
    ctx.fillStyle = '#7a5428'; ctx.fillRect(cx - tw / 2, topY, 5, o.H - 40); ctx.fillRect(cx + tw / 2 - 5, topY, 5, o.H - 40);
    // Rutsche: Spirale um den Turm (hinten dunkel, vorne hell)
    const turns = 3, top = topY + 40, bot = base - 30;
    const drawSpiral = (front) => {
      ctx.lineWidth = 16; ctx.lineCap = 'butt';
      for (let i = 0; i < 90; i++) {
        const a0 = i / 90 * turns * TAU, a1 = (i + 1) / 90 * turns * TAU;
        const isFront = Math.sin(a0) > 0;
        if (isFront !== front) continue;
        const p = (a) => [cx + Math.cos(a) * 78, lerp(top, bot, a / (turns * TAU)) + Math.sin(a) * 14];
        const [x0, y0] = p(a0), [x1, y1] = p(a1);
        ctx.strokeStyle = front ? '#e0b070' : '#9a6a38';
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = front ? '#8a5428' : '#5a3a18'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0, y0 + 7); ctx.lineTo(x1, y1 + 7); ctx.stroke();
        ctx.lineWidth = 16;
      }
      // Rutscher auf der Spirale
      for (let k = 0; k < 3; k++) {
        const s = ((t * 0.09 + k / 3) % 1);
        const a = s * turns * TAU;
        if ((Math.sin(a) > 0) !== front) continue;
        const px = cx + Math.cos(a) * 78, py = lerp(top, bot, s) + Math.sin(a) * 14;
        circle(ctx, px, py - 9, 5, '#f1c9a5');
        ctx.fillStyle = ['#c0392b', '#2f6db5', '#2f8a4a'][k]; ctx.fillRect(px - 5, py - 5, 10, 7);
      }
    };
    drawSpiral(false);
    // Turmdach
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(cx - 52, topY + 4); ctx.lineTo(cx, topY - 46); ctx.lineTo(cx + 52, topY + 4); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#f2d24a' : '#c0392b'; ctx.fillRect(cx - 50 + i * 20, topY + 4, 20, 10); }
    flag(ctx, cx, topY - 44, 26, t);
    // Schild mit Glühbirnen
    ctx.fillStyle = '#1a2a5a'; rrect(ctx, cx - 70, topY + 18, 140, 30, 6); ctx.fill();
    for (let i = 0; i < 18; i++) { const on = dark > 0.2 ? (i + Math.floor(t * 6)) % 2 === 0 : i % 2 === 0; circle(ctx, cx - 64 + i * 7.5, topY + 20, 1.8, on ? '#ffe46b' : '#aa9'); circle(ctx, cx - 64 + i * 7.5, topY + 46, 1.8, on ? '#aa9' : '#ffe46b'); }
    txt(ctx, 'TOBOGGAN', cx, topY + 33, 19, '#ffd84a', 'center', '#7a1a10', 4);
    // Vordere Spirale
    drawSpiral(true);
    // Unterbau vorne
    ctx.fillStyle = '#e8d2a8'; ctx.fillRect(x, base - 50, w, 50);
    ctx.fillStyle = '#a8703c'; for (let bx = x; bx <= x + w; bx += 30) ctx.fillRect(bx, base - 50, 3, 50);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(x, base - 54, w, 7);
    // Förderband (8 m) – diagonal nach oben in den Turm
    const bx0 = x + 18, by0 = base - 2, bx1 = cx - 10, by1 = base - 92;
    ctx.save();
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1, by1); ctx.stroke();
    // laufende Rillen
    const len = Math.hypot(bx1 - bx0, by1 - by0), ux = (bx1 - bx0) / len, uy = (by1 - by0) / len;
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
    const off = (t * 40) % 10;
    for (let d = off; d < len; d += 10) { const px = bx0 + ux * d, py = by0 + uy * d; ctx.beginPath(); ctx.moveTo(px - uy * 8, py + ux * 8); ctx.lineTo(px + uy * 8, py - ux * 8); ctx.stroke(); }
    ctx.strokeStyle = '#d0b070'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx0 - uy * 12, by0 + ux * 12 - 16); ctx.lineTo(bx1 - uy * 12, by1 + ux * 12 - 16); ctx.stroke();
    ctx.restore();
    // Jemand kämpft auf dem Förderband
    const ph = (t * 0.5) % 1;
    const px = lerp(bx0, bx1, ph * 0.8), py = lerp(by0, by1, ph * 0.8);
    const wob = Math.sin(t * 9) * 0.5;
    ctx.save(); ctx.translate(px, py - 4); ctx.rotate(wob);
    ctx.fillStyle = '#3b6fb5'; ctx.fillRect(-4, -18, 8, 14);
    circle(ctx, 0, -22, 5, '#f1c9a5');
    ctx.strokeStyle = '#f1c9a5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -15); ctx.lineTo(-12, -24); ctx.moveTo(4, -15); ctx.lineTo(12, -24); ctx.stroke();
    ctx.restore();
    // Ausgang der Rutsche: Auslauf
    ctx.fillStyle = '#e0b070'; ctx.fillRect(x + w - 70, base - 22, 70, 14);
    txt(ctx, 'seit 1933', x + w - 36, base - 36, 9, '#7a1a10', 'center', null);
  }

  // ----- Teufelsrad -----
  function drawTeufelsrad(ctx, o, t, dark) {
    const { x, y, w, h, H } = o;
    const base = y + h, cx = x + w / 2;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 6, base - 8, w, 14);
    // Kuppeldach
    ctx.fillStyle = '#8a1a1a';
    ctx.beginPath(); ctx.moveTo(x - 6, y + h - H); ctx.lineTo(x + 30, y - H - 10); ctx.lineTo(x + w - 30, y - H - 10); ctx.lineTo(x + w + 6, y + h - H); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#c0392b' : '#a01e1e'; ctx.beginPath(); const a = x - 6 + i * (w + 12) / 8, b2 = x + 30 + i * (w - 60) / 8; ctx.moveTo(a, y + h - H); ctx.lineTo(b2, y - H - 10); ctx.lineTo(b2 + (w - 60) / 8, y - H - 10); ctx.lineTo(a + (w + 12) / 8, y + h - H); ctx.fill(); }
    // Teufelshörner auf dem Dach
    ctx.fillStyle = '#e8203a';
    ctx.beginPath(); ctx.moveTo(cx - 40, y - H - 8); ctx.quadraticCurveTo(cx - 52, y - H - 40, cx - 30, y - H - 56); ctx.quadraticCurveTo(cx - 36, y - H - 30, cx - 22, y - H - 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 40, y - H - 8); ctx.quadraticCurveTo(cx + 52, y - H - 40, cx + 30, y - H - 56); ctx.quadraticCurveTo(cx + 36, y - H - 30, cx + 22, y - H - 8); ctx.fill();
    // Front
    const fy = base - H;
    ctx.fillStyle = '#2a1414'; ctx.fillRect(x, fy, w, H);
    ctx.fillStyle = '#f2d24a'; ctx.fillRect(x, fy, w, 6); ctx.fillRect(x, base - 6, w, 6);
    // Blick hinein: die drehende Scheibe
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 20, fy + 30, w - 40, H - 36); ctx.clip();
    ctx.fillStyle = '#4a2a1a'; ctx.fillRect(x + 20, fy + 30, w - 40, H - 36);
    const dcx = cx, dcy = base - 22;
    ellipse(ctx, dcx, dcy, 90, 20, '#c9935a');
    ctx.strokeStyle = 'rgba(90,50,20,.6)'; ctx.lineWidth = 1.5;
    const rot = t * 2.2;
    for (let i = 0; i < 12; i++) { const a = rot + i / 12 * TAU; ctx.beginPath(); ctx.moveTo(dcx, dcy); ctx.lineTo(dcx + Math.cos(a) * 90, dcy + Math.sin(a) * 20); ctx.stroke(); }
    // Leute auf der Scheibe
    for (let k = 0; k < 5; k++) {
      const a = rot * (k === 0 ? 1 : 1) + k * 1.3, r = k === 0 ? 4 : 30 + ((t * 8 + k * 17) % 60);
      const px = dcx + Math.cos(a) * r, py = dcy + Math.sin(a) * r * 0.22;
      circle(ctx, px, py - 14, 4.5, '#f1c9a5');
      ctx.fillStyle = ['#c0392b', '#2f6db5', '#2f8a4a', '#f2b632', '#8a5ad6'][k]; ctx.fillRect(px - 4, py - 10, 8, 9);
    }
    // Der Ball am Seil
    const bs = Math.sin(t * 1.3);
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, fy + 30); ctx.lineTo(cx + bs * 70, dcy - 30); ctx.stroke();
    circle(ctx, cx + bs * 70, dcy - 30, 9, '#e8203a'); circle(ctx, cx + bs * 70 - 3, dcy - 33, 3, 'rgba(255,255,255,.6)');
    ctx.restore();
    // Schild mit Teufelchen
    ctx.fillStyle = '#f2d24a'; rrect(ctx, cx - 82, fy + 6, 164, 26, 6); ctx.fill();
    txt(ctx, 'TEUFELSRAD', cx + 10, fy + 19, 18, '#a01e1e', 'center', null);
    drawDevil(ctx, x + 26, fy + 18, 13, t);
    // Lichterkette
    for (let i = 0; i < 16; i++) { const on = dark > 0.2 ? (i + Math.floor(t * 5)) % 2 : 1; circle(ctx, x + 8 + i * (w - 16) / 15, fy - 2, 2.2, on ? '#ffe46b' : '#776'); }
  }

  function drawDevil(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 3) * 1.5);
    ctx.fillStyle = '#e8203a';
    ctx.beginPath(); ctx.moveTo(-s * 0.7, -s * 0.5); ctx.lineTo(-s * 0.9, -s * 1.3); ctx.lineTo(-s * 0.2, -s * 0.8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 0.7, -s * 0.5); ctx.lineTo(s * 0.9, -s * 1.3); ctx.lineTo(s * 0.2, -s * 0.8); ctx.fill();
    circle(ctx, 0, 0, s, '#e8203a');
    circle(ctx, -s * 0.35, -s * 0.15, s * 0.2, '#fff'); circle(ctx, s * 0.35, -s * 0.15, s * 0.2, '#fff');
    circle(ctx, -s * 0.3, -s * 0.12, s * 0.1, '#000'); circle(ctx, s * 0.4, -s * 0.12, s * 0.1, '#000');
    ctx.strokeStyle = '#5a0a0a'; ctx.lineWidth = s * 0.12; ctx.beginPath(); ctx.arc(0, s * 0.15, s * 0.45, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.restore();
  }

  // ----- Wellenflug (Kettenkarussell) -----
  function drawWellenflug(ctx, o, t, dark) {
    const cx = o.x, cy = o.y;
    ellipse(ctx, cx, cy + 10, 100, 30, 'rgba(0,0,0,.18)');
    ellipse(ctx, cx, cy, 64, 20, '#c9b48a');
    const topY = cy - 150, rot = t * 1.4, tilt = Math.sin(t * 0.7) * 6;
    const seats = [];
    for (let i = 0; i < 16; i++) {
      const a = rot + i / 16 * TAU;
      const sx = cx + Math.cos(a) * 92, sy = cy - 70 + Math.sin(a) * 26 + Math.cos(a) * tilt;
      seats.push({ a, sx, sy, front: Math.sin(a) > 0, tx: cx + Math.cos(a) * 58, ty: topY + 26 + Math.sin(a) * 14 + Math.cos(a) * tilt });
    }
    const drawSeat = (s, i) => {
      ctx.strokeStyle = 'rgba(80,80,80,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.tx, s.ty); ctx.lineTo(s.sx, s.sy); ctx.stroke();
      ctx.fillStyle = ['#d62f3a', '#2f8ad6', '#f2b632', '#2fa85a'][i % 4];
      ctx.fillRect(s.sx - 5, s.sy, 10, 5);
      circle(ctx, s.sx, s.sy - 3, 3.5, '#f1c9a5');
    };
    seats.forEach((s, i) => { if (!s.front) drawSeat(s, i); });
    ctx.fillStyle = '#d8d8e0'; ctx.fillRect(cx - 7, topY + 20, 14, cy - topY - 20);
    // Dach (dreht sich)
    ellipse(ctx, cx, topY + 26 + tilt * 0.2, 62, 16, '#6a2a8a');
    for (let i = 0; i < 12; i++) {
      const a = rot + i / 12 * TAU, a2 = rot + (i + 1) / 12 * TAU;
      if (Math.sin(a) < -0.2) continue;
      ctx.fillStyle = i % 2 ? '#f2d24a' : '#8a3ab0';
      ctx.beginPath(); ctx.moveTo(cx, topY - 14); ctx.lineTo(cx + Math.cos(a) * 62, topY + 26 + Math.sin(a) * 16); ctx.lineTo(cx + Math.cos(a2) * 62, topY + 26 + Math.sin(a2) * 16); ctx.fill();
    }
    flag(ctx, cx, topY - 12, 24, t);
    seats.forEach((s, i) => { if (s.front) drawSeat(s, i); });
    txt(ctx, 'WELLENFLUG', cx, cy + 24, 12, '#fff', 'center', '#6a2a8a', 3);
    if (dark > 0.2) for (let i = 0; i < 12; i++) { const a = rot + i / 12 * TAU; circle(ctx, cx + Math.cos(a) * 62, topY + 26 + Math.sin(a) * 16, 2.4, i % 2 ? '#ffe46b' : '#ff6bd5'); }
  }

  // ----- Autoscooter -----
  const scooterCars = [];
  for (let i = 0; i < 6; i++) scooterCars.push({ x: 800 + i * 70, y: 1260 + (i % 2) * 80, a: rand(0, TAU), v: 80, col: ['#d62f3a', '#2f8ad6', '#f2b632', '#2fa85a', '#e86fb0', '#ff8a2a'][i] });
  function updateScooterCars(dt, player) {
    const a = autoscooter;
    for (const c of scooterCars) {
      c.a += Math.sin(G.time * 0.7 + c.x * 0.01) * dt * 1.5;
      c.x += Math.cos(c.a) * c.v * dt; c.y += Math.sin(c.a) * c.v * dt;
      if (c.x < a.x + 20 || c.x > a.x + a.w - 20) { c.a = Math.PI - c.a; c.x = clamp(c.x, a.x + 20, a.x + a.w - 20); }
      if (c.y < a.y + 20 || c.y > a.y + a.h - 20) { c.a = -c.a; c.y = clamp(c.y, a.y + 20, a.y + a.h - 20); }
      for (const d of scooterCars) {
        if (d === c) continue;
        const dd = dist(c.x, c.y, d.x, d.y);
        if (dd < 30 && dd > 0) { c.a = Math.atan2(c.y - d.y, c.x - d.x); c.x += (c.x - d.x) / dd * (30 - dd) / 2; c.y += (c.y - d.y) / dd * (30 - dd) / 2; }
      }
    }
  }
  function drawScooterCar(ctx, x, y, a, col, withDriver, skin) {
    ellipse(ctx, x, y + 4, 18, 9, 'rgba(0,0,0,.25)');
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#222'; ellipse(ctx, 0, 0, 18, 11, '#222');
    ctx.fillStyle = col; rrect(ctx, -15, -12, 30, 18, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-12, -10, 24, 3);
    ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(8, -46); ctx.stroke();
    circle(ctx, 8, -47, 2, '#ff0');
    if (withDriver !== false) { circle(ctx, -2, -16, 6, skin || '#f1c9a5'); ctx.fillStyle = '#333'; ctx.fillRect(-7, -12, 10, 6); }
    const dir = Math.cos(a) > 0 ? 1 : -1;
    circle(ctx, 14 * dir, -4, 2, '#fff');
    ctx.restore();
  }
  function drawAutoscooter(ctx, o, t, dark) {
    const { x, y, w, h } = o;
    ctx.fillStyle = '#3a3a48'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    for (let gx = x; gx < x + w; gx += 24) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); }
    // Bande
    ctx.fillStyle = '#f2d24a'; ctx.fillRect(x, y - 10, w, 10); ctx.fillRect(x, y + h - 10, w, 12);
    ctx.fillStyle = '#222'; for (let bx = x; bx < x + w; bx += 30) { ctx.fillRect(bx, y + h - 10, 15, 12); }
    for (const c of scooterCars) drawScooterCar(ctx, c.x, c.y, c.a, c.col);
    if (G.player && G.player.vehicle && G.player.vehicle.type === 'scooter') { /* wird separat gezeichnet */ }
    // Dachrahmen
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 4;
    for (const px of [x + 4, x + w - 4]) { ctx.beginPath(); ctx.moveTo(px, y + h); ctx.lineTo(px, y - 90); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x, y - 100, w, 18);
    ctx.fillStyle = '#e8203a'; ctx.fillRect(x, y - 104, w, 8);
    txt(ctx, 'AUTOSCOOTER', x + w / 2, y - 91, 18, '#fff', 'center', '#a01e1e', 4);
    for (let i = 0; i < 30; i++) { const on = dark > 0.2 ? (i + Math.floor(t * 8)) % 3 === 0 : false; circle(ctx, x + 8 + i * (w - 16) / 29, y - 80, 2, on ? '#6bf0ff' : '#bbb'); }
  }

  // ----- Schichtl -----
  function drawSchichtl(ctx, o, t, dark) {
    const { x, y, w, h, H } = o;
    const base = y + h, cx = x + w / 2, fy = base - H;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 6, base - 8, w, 14);
    ctx.fillStyle = '#5a1a3a'; ctx.fillRect(x, y - H, w, h);
    ctx.fillStyle = '#f2e6c8'; ctx.fillRect(x, fy, w, H);
    // Bühne (Parade vor dem Theater)
    ctx.fillStyle = '#8a1a2a'; ctx.fillRect(x + 10, fy + 26, w - 20, 46);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(x + 10, fy + 26); ctx.quadraticCurveTo(x + 30, fy + 50, x + 26, fy + 72); ctx.lineTo(x + 10, fy + 72); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w - 10, fy + 26); ctx.quadraticCurveTo(x + w - 30, fy + 50, x + w - 26, fy + 72); ctx.lineTo(x + w - 10, fy + 72); ctx.fill();
    // kleine Guillotine
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(cx + 26, fy + 32, 4, 38); ctx.fillRect(cx + 46, fy + 32, 4, 38); ctx.fillRect(cx + 24, fy + 30, 28, 4);
    const blade = (t % 6) < 0.3 ? 30 : 6;
    ctx.fillStyle = '#ccd'; ctx.fillRect(cx + 30, fy + 30 + blade, 16, 6);
    // Ausrufer mit Zylinder
    const bob = Math.sin(t * 4) * 2;
    ctx.fillStyle = '#222'; ctx.fillRect(cx - 30, fy + 50 + bob, 14, 20);
    circle(ctx, cx - 23, fy + 44 + bob, 6, '#f1c9a5');
    ctx.fillStyle = '#111'; ctx.fillRect(cx - 30, fy + 28 + bob, 14, 12); ctx.fillRect(cx - 33, fy + 38 + bob, 20, 3);
    ctx.fillStyle = '#e8d070'; ctx.beginPath(); ctx.moveTo(cx - 16, fy + 48 + bob); ctx.lineTo(cx - 2, fy + 42 + bob); ctx.lineTo(cx - 2, fy + 54 + bob); ctx.fill();
    ctx.fillStyle = '#f2d24a'; rrect(ctx, x + 8, fy + 2, w - 16, 22, 5); ctx.fill();
    txt(ctx, 'SCHICHTL', cx, fy + 13, 17, '#5a1a3a', 'center', null);
    txt(ctx, 'seit 1869', cx, y - H + 20, 11, '#f2d24a', 'center', null);
    if ((t % 10) < 3) { txt(ctx, 'Auf geht’s beim Schichtl!', cx, fy - 22, 13, '#fff', 'center', '#5a1a3a', 4); }
  }

  // ----- Olympia-Looping -----
  function drawLooping(ctx, o, t, dark) {
    const { x, y, w, h } = o;
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(x, y, w, h);
    const ringCols = ['#2f7ad6', '#f2c12e', '#222', '#2fa85a', '#e8203a'];
    const by = y + h - 30;
    // Stützen
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const rx = x + 50 + i * 85; ctx.beginPath(); ctx.moveTo(rx - 20, by); ctx.lineTo(rx, by - 130); ctx.lineTo(rx + 20, by); ctx.stroke(); }
    // Lifthügel
    ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x + 10, by); ctx.lineTo(x + 30, by - 230); ctx.quadraticCurveTo(x + 40, by - 250, x + 60, by - 210); ctx.lineTo(x + w - 20, by - 30); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#999';
    for (let k = 0; k < 12; k++) { const py = by - k * 19; ctx.beginPath(); ctx.moveTo(x + 10 + k * 1.7, py); ctx.lineTo(x + 30, py); ctx.stroke(); }
    // Fünf Loopings
    for (let i = 0; i < 5; i++) {
      const rx = x + 50 + i * 85, ry = by - 130 + (i % 2) * 20;
      ctx.strokeStyle = ringCols[i]; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(rx, ry, 44, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rx, ry, 40, Math.PI, TAU * 0.9); ctx.stroke();
    }
    // Zug fährt durch die Loopings
    const s = (t * 0.18) % 1;
    const li = Math.floor(s * 5), lf = (s * 5) % 1;
    const rx = x + 50 + li * 85, ry = by - 130 + (li % 2) * 20;
    const a = Math.PI / 2 - lf * TAU;
    for (let k = 0; k < 4; k++) {
      const aa = a + k * 0.28;
      const px = rx + Math.cos(aa) * 44, py = ry + Math.sin(aa) * 44;
      ctx.fillStyle = ['#e8203a', '#f2d24a', '#2f7ad6', '#2fa85a'][k];
      ctx.save(); ctx.translate(px, py); ctx.rotate(aa + Math.PI / 2); ctx.fillRect(-7, -5, 14, 10); ctx.restore();
    }
    // Station
    ctx.fillStyle = '#2a3a8a'; ctx.fillRect(x + w - 160, by - 10, 150, 40);
    txt(ctx, 'OLYMPIA-LOOPING', x + w - 85, by + 10, 12, '#fff', 'center', null);
    if (dark > 0.2) for (let i = 0; i < 5; i++) for (let k = 0; k < 10; k++) { const aa = k / 10 * TAU + t; circle(ctx, x + 50 + i * 85 + Math.cos(aa) * 44, by - 130 + (i % 2) * 20 + Math.sin(aa) * 44, 1.6, '#fff8c0'); }
  }

  // ----- Krinoline -----
  function drawKrinoline(ctx, o, t, dark) {
    const cx = o.x, cy = o.y;
    ellipse(ctx, cx, cy + 12, 96, 30, 'rgba(0,0,0,.2)');
    ellipse(ctx, cx, cy, 86, 26, '#b89a6a');
    const rot = t * 0.9;
    const sway = (a) => Math.sin(a * 3 + t * 2.5) * 8; // Krinoline schaukelt in Wellen
    const seats = [];
    for (let i = 0; i < 12; i++) { const a = rot + i / 12 * TAU; seats.push({ a, x: cx + Math.cos(a) * 70, y: cy - 10 + Math.sin(a) * 20 - sway(a), front: Math.sin(a) > 0, i }); }
    const drawSeat = (s) => {
      ctx.fillStyle = ['#d62f3a', '#2f8a4a', '#f2b632', '#2f6db5'][s.i % 4];
      rrect(ctx, s.x - 10, s.y - 12, 20, 14, 4); ctx.fill();
      circle(ctx, s.x, s.y - 16, 4, '#f1c9a5');
    };
    seats.forEach(s => { if (!s.front) drawSeat(s); });
    // Musikanten in der Mitte
    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 4, cy - 110, 8, 100);
    for (let k = 0; k < 3; k++) {
      const mx = cx - 22 + k * 22, my = cy - 14;
      ctx.fillStyle = '#2a4a2a'; ctx.fillRect(mx - 5, my - 12, 10, 12);
      circle(ctx, mx, my - 16, 4.5, '#f1c9a5');
      ctx.fillStyle = '#3a6a3a'; ctx.fillRect(mx - 6, my - 22, 12, 3);
      circle(ctx, mx + 7, my - 8 + Math.sin(t * 8 + k) * 1.5, 4, '#e8c040');
    }
    seats.forEach(s => { if (s.front) drawSeat(s); });
    // Reifrock-Dach
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU, a2 = (i + 1) / 16 * TAU;
      if (Math.sin(a) < -0.3 && Math.sin(a2) < -0.3) continue;
      ctx.fillStyle = i % 2 ? '#ffffff' : '#c0392b';
      ctx.beginPath(); ctx.moveTo(cx, cy - 140); ctx.lineTo(cx + Math.cos(a) * 92, cy - 70 + Math.sin(a) * 24); ctx.lineTo(cx + Math.cos(a2) * 92, cy - 70 + Math.sin(a2) * 24); ctx.fill();
    }
    ctx.strokeStyle = '#f2d24a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy - 70, 92, 24, 0, 0, Math.PI); ctx.stroke();
    flag(ctx, cx, cy - 138, 24, t);
    txt(ctx, 'KRINOLINE', cx, cy + 32, 13, '#fff', 'center', '#c0392b', 3);
    if (dark > 0.2) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; if (Math.sin(a) > -0.3) circle(ctx, cx + Math.cos(a) * 92, cy - 70 + Math.sin(a) * 24, 2.2, '#ffe46b'); }
    // Musiknoten
    for (let k = 0; k < 2; k++) { const p = (t * 0.6 + k * 0.5) % 1; txt(ctx, '♪', cx + 30 + k * 20 + Math.sin(p * 6) * 8, cy - 150 - p * 40, 16, 'rgba(255,255,255,' + (1 - p) + ')', 'center', null); }
  }

  // ----- Bavaria und Ruhmeshalle -----
  function drawRuhmeshalle(ctx, o, t) {
    const { x, y, w, h, H } = o;
    ctx.fillStyle = '#cfc6b0'; ctx.fillRect(x, y - H, w, h);
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x, y + h - H, w, H);
    ctx.fillStyle = '#d4caaf'; ctx.fillRect(x, y + h - H, w, 16);
    ctx.fillStyle = '#b8ae94'; ctx.fillRect(x, y + h - 10, w, 10);
    for (let cx = x + 14; cx < x + w; cx += 26) {
      ctx.fillStyle = '#f2ecdc'; ctx.fillRect(cx - 5, y + h - H + 16, 10, H - 26);
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(cx + 2, y + h - H + 16, 3, H - 26);
    }
    txt(ctx, 'RUHMESHALLE', x + w / 2, y + h - H + 8, 11, '#8a8068', 'center', null);
  }
  function drawWing(ctx, o) {
    const { x, y, w, h, H } = o;
    ctx.fillStyle = '#cfc6b0'; ctx.fillRect(x, y - H, w, h);
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x, y + h - H, w, H);
    for (let cx = x + 10; cx < x + w; cx += 20) { ctx.fillStyle = '#f2ecdc'; ctx.fillRect(cx - 4, y + h - H + 14, 8, H - 22); }
    ctx.fillStyle = '#d4caaf'; ctx.fillRect(x, y + h - H, w, 14);
  }
  function drawBavaria(ctx, o, t) {
    const x = o.x, base = o.baseY;
    // Sockel
    ctx.fillStyle = '#a89c80'; ctx.fillRect(x - 38, base - 70, 76, 70);
    ctx.fillStyle = '#c4b898'; ctx.fillRect(x - 42, base - 76, 84, 10); ctx.fillRect(x - 42, base - 6, 84, 6);
    txt(ctx, 'BAVARIA', x, base - 40, 10, '#6a6048', 'center', null);
    const b = base - 76;
    const bronze = ctx.createLinearGradient(x - 40, 0, x + 40, 0);
    bronze.addColorStop(0, '#4a3a20'); bronze.addColorStop(0.5, '#9a7a40'); bronze.addColorStop(1, '#3a2a14');
    // Löwe
    ctx.fillStyle = bronze;
    ellipse(ctx, x - 30, b - 16, 22, 14);
    ctx.fill();
    circle(ctx, x - 48, b - 30, 12); ctx.fill();
    ctx.fillRect(x - 48, b - 18, 6, 18); ctx.fillRect(x - 18, b - 12, 6, 12);
    // Gewand
    ctx.fillStyle = bronze;
    ctx.beginPath();
    ctx.moveTo(x - 26, b); ctx.lineTo(x - 16, b - 110); ctx.lineTo(x + 16, b - 110); ctx.lineTo(x + 28, b); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 14 + i * 9, b - 100); ctx.lineTo(x - 20 + i * 13, b); ctx.stroke(); }
    // Oberkörper & Kopf
    ctx.fillStyle = bronze; ctx.fillRect(x - 14, b - 150, 28, 44);
    circle(ctx, x, b - 162, 12); ctx.fill();
    ctx.fillStyle = '#5a4a28'; ctx.beginPath(); ctx.arc(x, b - 166, 12, Math.PI, TAU); ctx.fill();
    // Fenster im Kopf (Aussichtsplattform)
    ctx.fillStyle = 'rgba(255,230,150,.8)'; ctx.fillRect(x - 5, b - 166, 3, 3); ctx.fillRect(x + 2, b - 166, 3, 3);
    // erhobener Arm mit Eichenkranz
    ctx.strokeStyle = '#8a6a34'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 12, b - 146); ctx.lineTo(x - 30, b - 180); ctx.lineTo(x - 34, b - 206); ctx.stroke();
    ctx.strokeStyle = '#5a7a30'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x - 34, b - 220, 12, 0, TAU); ctx.stroke();
    // Schwert
    ctx.strokeStyle = '#6a5a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 12, b - 140); ctx.lineTo(x + 22, b - 110); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 22, b - 110); ctx.lineTo(x + 26, b - 50); ctx.stroke();
    ctx.lineCap = 'butt';
  }

  function drawGate(ctx, o, t) {
    const x = o.x, y = o.y;
    ctx.fillStyle = '#7a4a26'; ctx.fillRect(x - 110, y - 120, 18, 130); ctx.fillRect(x + 92, y - 120, 18, 130);
    ctx.fillStyle = '#3f7f2f';
    ctx.beginPath(); ctx.moveTo(x - 120, y - 110); ctx.quadraticCurveTo(x, y - 175, x + 120, y - 110); ctx.lineTo(x + 120, y - 92); ctx.quadraticCurveTo(x, y - 150, x - 120, y - 92); ctx.fill();
    ctx.fillStyle = '#fff8e6'; rrect(ctx, x - 100, y - 150, 200, 34, 8); ctx.fill();
    ctx.strokeStyle = '#1a7fd4'; ctx.lineWidth = 3; ctx.stroke();
    txt(ctx, 'WILLKOMMEN ZUR WIESN', x, y - 133, 15, '#1a5aa4', 'center', null);
    for (let i = 0; i < 9; i++) circle(ctx, x - 100 + i * 25, y - 108 - Math.sin(i / 8 * Math.PI) * 20, 6, ['#d62f3a', '#fff', '#1a7fd4'][i % 3]);
    flag(ctx, x - 101, y - 118, 30, t); flag(ctx, x + 101, y - 118, 30, t);
  }

  function drawOideWiesn(ctx, t) {
    // Zaun mit Torbogen
    ctx.fillStyle = '#8a5a32';
    ctx.fillRect(740, 1936, 600, 8); ctx.fillRect(1460, 1936, 840, 8);
    for (let x = 744; x < 2300; x += 24) { if (x > 1340 && x < 1460) continue; ctx.fillRect(x, 1928, 4, 30); }
    ctx.fillRect(1332, 1870, 12, 90); ctx.fillRect(1456, 1870, 12, 90);
    ctx.fillStyle = '#f2e6c8'; rrect(ctx, 1320, 1858, 160, 30, 6); ctx.fill();
    ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = 3; ctx.stroke();
    txt(ctx, 'OIDE WIESN', 1400, 1873, 15, '#8a3a1a', 'center', null);
  }

  function drawTree(ctx, o) {
    const s = o.s;
    ellipse(ctx, o.x + 6, o.y + 2, 22 * s, 8 * s, 'rgba(0,0,0,.25)');
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(o.x - 3, o.y - 30 * s, 6, 30 * s);
    circle(ctx, o.x, o.y - 48 * s, 26 * s, '#3e7a35');
    circle(ctx, o.x - 12 * s, o.y - 40 * s, 16 * s, '#4a8a3c');
    circle(ctx, o.x + 10 * s, o.y - 58 * s, 14 * s, '#5a9a48');
  }

  function drawLamp(ctx, o, t, dark) {
    ctx.fillStyle = '#333'; ctx.fillRect(o.x - 1.5, o.y - 44, 3, 44);
    circle(ctx, o.x, o.y - 46, 5, dark > 0.25 ? '#fff4c0' : '#ddd');
  }

  function drawBench(ctx, o) {
    ctx.fillStyle = '#8a5a32'; ctx.fillRect(o.x - o.w / 2, o.y - 10, o.w, 6); ctx.fillRect(o.x - o.w / 2, o.y - 18, o.w, 4);
    ctx.fillRect(o.x - o.w / 2 + 2, o.y - 6, 3, 8); ctx.fillRect(o.x + o.w / 2 - 5, o.y - 6, 3, 8);
    // Zuschauer
    for (let i = 0; i < 3; i++) {
      const px = o.x - o.w / 2 + 10 + i * 15, laugh = Math.sin(G.time * 7 + i + o.x) > 0.6 ? 2 : 0;
      ctx.fillStyle = ['#2f6db5', '#c0392b', '#2f8a4a'][i]; ctx.fillRect(px - 5, o.y - 26 - laugh, 10, 12);
      circle(ctx, px, o.y - 31 - laugh, 5, '#f1c9a5');
    }
  }

  function drawObject(ctx, o, t, dark) {
    if (o.draw) return o.draw(ctx, t, dark);
    switch (o.kind) {
      case 'tent': drawTent(ctx, o, t); break;
      case 'service': drawService(ctx, o); break;
      case 'stand': drawStand(ctx, o, t); break;
      case 'riesenrad': drawRiesenrad(ctx, o, t, dark); break;
      case 'toboggan': drawToboggan(ctx, o, t, dark); break;
      case 'teufelsrad': drawTeufelsrad(ctx, o, t, dark); break;
      case 'wellenflug': drawWellenflug(ctx, o, t, dark); break;
      case 'autoscooter': drawAutoscooter(ctx, o, t, dark); break;
      case 'schichtl': drawSchichtl(ctx, o, t, dark); break;
      case 'looping': drawLooping(ctx, o, t, dark); break;
      case 'krinoline': drawKrinoline(ctx, o, t, dark); break;
      case 'ruhmeshalle': drawRuhmeshalle(ctx, o, t); break;
      case 'wing': drawWing(ctx, o, t); break;
      case 'bavaria': drawBavaria(ctx, o, t); break;
      case 'gate': drawGate(ctx, o, t); break;
      case 'oidewiesn': drawOideWiesn(ctx, t); break;
      case 'tree': drawTree(ctx, o); break;
      case 'lamp': drawLamp(ctx, o, t, dark); break;
      case 'bench': drawBench(ctx, o); break;
    }
  }

  // Grobe Ausdehnung für das Culling
  function objBounds(o) {
    if (o.bounds) return o.bounds;
    switch (o.kind) {
      case 'riesenrad': return [o.x - 190, o.y - 400, 380, 480];
      case 'toboggan': return [o.x - 30, o.y - 320, o.w + 60, o.h + 330];
      case 'looping': return [o.x, o.y - 160, o.w, o.h + 170];
      case 'bavaria': return [o.x - 80, o.y - 320, 160, 340];
      case 'wellenflug': return [o.x - 110, o.y - 200, 220, 240];
      case 'krinoline': return [o.x - 100, o.y - 200, 200, 240];
      case 'oidewiesn': return [700, 1850, 1650, 120];
      case 'gate': return [o.x - 130, o.y - 190, 260, 200];
      case 'tree': return [o.x - 40, o.y - 90, 80, 100];
      case 'lamp': return [o.x - 10, o.y - 60, 20, 70];
      case 'bench': return [o.x - 40, o.y - 40, 80, 50];
      default: return [o.x - 20, o.y - (o.H || 60) - 140, (o.w || 40) + 40, (o.h || 40) + (o.H || 60) + 160];
    }
  }

  // Minikarte (vorgerendert)
  let miniCanvas = null;
  function getMiniMap() {
    if (miniCanvas) return miniCanvas;
    const s = 0.12;
    miniCanvas = document.createElement('canvas');
    miniCanvas.width = W * s; miniCanvas.height = H * s;
    const c = miniCanvas.getContext('2d');
    c.scale(s, s);
    c.fillStyle = '#3d6a35'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#8f8a7e'; c.fillRect(FENCE.x, FENCE.y, FENCE.w, FENCE.h);
    c.fillStyle = '#5f9a48'; c.fillRect(FENCE.x, 640, 510, 830);
    c.fillStyle = '#b7aa88'; c.fillRect(754, 1964, 1532, 346);
    c.fillStyle = '#c9c3b5'; for (const r of roads) c.fillRect(r.x, r.y, r.w, r.h);
    for (const t of tents) { c.fillStyle = t.roof[0] === '#ffffff' ? '#1a7fd4' : t.roof[0]; c.fillRect(t.x, t.y, t.w, t.h); }
    c.fillStyle = '#e8e8e8'; c.fillRect(service.x, service.y, service.w, service.h);
    c.fillStyle = '#f2d24a'; for (const s2 of stands) c.fillRect(s2.x, s2.y, s2.w, s2.h);
    c.fillStyle = '#d06a2a';
    c.fillRect(toboggan.x, toboggan.y, toboggan.w, toboggan.h);
    c.fillStyle = '#a01e1e'; c.fillRect(teufelsrad.x, teufelsrad.y, teufelsrad.w, teufelsrad.h);
    c.fillStyle = '#6a2a8a'; c.beginPath(); c.arc(900, 960, 70, 0, TAU); c.fill();
    c.fillStyle = '#3a3a48'; c.fillRect(autoscooter.x, autoscooter.y, autoscooter.w, autoscooter.h);
    c.fillStyle = '#5a1a3a'; c.fillRect(schichtl.x, schichtl.y, schichtl.w, schichtl.h);
    c.fillStyle = '#2a3a8a'; c.fillRect(looping.x, looping.y, looping.w, looping.h);
    c.fillStyle = '#c0392b'; c.beginPath(); c.arc(1050, 2120, 78, 0, TAU); c.fill();
    c.fillStyle = '#ddd'; c.beginPath(); c.arc(1010, 340, 70, 0, TAU); c.fill();
    c.fillStyle = '#cfc6b0'; c.fillRect(140, 720, 440, 70); c.fillRect(140, 790, 60, 170); c.fillRect(520, 790, 60, 170);
    c.fillStyle = '#9a7a40'; c.fillRect(325, 945, 70, 55);
    if (G.world.miniHook) G.world.miniHook(c);
    return miniCanvas;
  }

  return {
    W, H, FENCE, roads, solids, objects, lights, places, tents, stands, nodes, heartSpots,
    riesenrad, toboggan, teufelsrad, autoscooter, wellenflug, krinoline, schichtl, looping, bavaria, service,
    scooterCars, updateScooterCars, drawScooterCar,
    collide, solidAt, drawGround, drawObject, objBounds, drawHeart, drawBrezn, drawDevil, getMiniMap,
  };
})();
