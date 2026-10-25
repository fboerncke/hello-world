'use strict';
// Hauptprogramm: Szenen, Spieler, Kamera, Interaktionen, Ordner, Tageszeit, Speichern
(function () {
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
  }
  window.addEventListener('resize', resize); resize();

  G.time = 0; G.flags = {}; G.dog = null; G.frameClicks = [];
  const I = G.input, A = G.audio, WD = G.world, E = G.ent;
  const SAVE_KEY = 'gta-wiesn-save-v1';
  const DAYS = ['Samstag', 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

  // ---------- Spieler ----------
  const P = G.player = {
    x: 2240, y: 230, vx: 0, vy: 0, dir: Math.PI / 2, walk: 0, moving: false, size: 0.8,
    look: null, name: 'Maxi', female: false, vehicle: null, stamina: 100, energy: 100, speedNow: 0,
    boost: 0, boostKind: null, wearsHeart: false, carry: null, happy: true,
  };
  function makeLook(female) {
    return female
      ? { female: true, skin: '#f1c9a5', hair: '#7a4a22', dirndl: '#2f6db5', apron: '#f2d0e0', braids: true, hat: false, kind: 'kid' }
      : { female: false, skin: '#f1c9a5', hair: '#6a4022', shirt: '#c0392b', hat: false, kind: 'kid' };
  }

  // ---------- Spielzustand ----------
  const game = G.game = {
    scene: 'title', clock: 600, day: 1, taler: 0, gaudi: 0, heat: 0, stars: 0, lastBump: -99,
    chasers: [], hearts: [], facts: new Set(), showHeartsOnMap: false,
    paused: false, map: false, mini: null, view: null, ride: null, scooter: null, busted: null, credits: null, loading: null,
    titleSel: 0, charSel: 0, edgeT: -99, oideSeen: false, ozapft: false,
    addTaler(n) { game.taler = Math.max(0, game.taler + n); },
    addGaudi(n) { game.gaudi += n; },
    setClock(m) { game.clock = m; },
    unlockFact(id) {
      if (game.facts.has(id)) return;
      game.facts.add(id);
      const f = G.FACTS.find(x => x.id === id);
      if (f) G.ui.toast('♥ Neues Wiesn-Wissen: „' + f.title + '“ (Pause → Wiesn-Wissen)', 4);
    },
    addHeat(n) {
      if (game.scene !== 'world' || game.scooter || G.events.noHeat) return;
      game.heat = Math.min(15, game.heat + n); game.lastBump = G.time;
      const before = game.stars; updateStars();
      if (game.stars > before) {
        G.ui.toast(game.stars === 1 ? 'Ordner-Stern! Wer wild herumrempelt, kriegt Ärger mit den Ordnern.' : 'Noch mehr Ordner sind hinter dir her! Lauf weg oder sei brav!', 4);
        A.sfx.blip(300);
      }
    },
    nearestRoller() {
      let best = null, bd = 1e9;
      for (const r of E.rollers) { const d = dist(r.x, r.y, P.x, P.y); if (d < bd) { bd = d; best = r; } }
      return best;
    },
    spawnDog() { G.dog = { x: 1720, y: 1800, dir: 0, walk: 0, moving: false, caught: false, sniff: 0, nextSniff: 3, wa: rand(0, TAU) }; },
    startMinigame(name, opts, cb) {
      game.scene = 'mini'; game.mini = name;
      I.clear();
      const done = (res) => { game.scene = 'world'; game.mini = null; I.clear(); cb(res); };
      if (name === 'schichtl') G.schichtl.start(done); else G[name].start(opts, done);
    },
    startCredits(cb) { game.scene = 'credits'; game.credits = { t: 0, cb }; A.sfx.boeller(); setTimeout(() => A.sfx.boeller(), 900); setTimeout(() => A.sfx.boeller(), 1800); A.say('Servus, und bis zur nächsten Wiesn!'); },
    photo() { game.paused = false; game.photoPending = 2; },
    togglePause() { game.paused = !game.paused; G.ui.pause.sel = 0; if (game.paused && window.speechSynthesis) speechSynthesis.cancel(); },
    toTitle() { game.paused = false; game.scene = 'title'; game.titleSel = 0; },
    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          name: P.name, female: P.female, taler: game.taler, gaudi: game.gaudi, day: game.day, clock: game.clock,
          done: G.missions.done, hearts: game.hearts.map(h => h.got), facts: [...game.facts], wearsHeart: P.wearsHeart,
          x: P.x, y: P.y, speech: A.speech, easy: G.settings.easy, oideSeen: game.oideSeen, ozapft: game.ozapft, brezn: !!G.flags.brezn, trophies: G.trophies.save(), plush: !!P.plush,
        }));
      } catch (e) { /* Speichern nicht möglich */ }
    },
  };
  function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }

  function updateStars() { game.stars = game.heat >= 12 ? 3 : game.heat >= 7 ? 2 : game.heat >= 3 ? 1 : 0; }
  const isFamilyDay = () => DAYS[(game.day - 1) % 7] === 'Dienstag' && game.clock < 1140;
  const price = (p) => (isFamilyDay() ? Math.ceil(p / 2) : p);

  function resetWorld() {
    E.spawnCrowd(); E.spawnRollers();
    game.hearts = WD.heartSpots.map(([x, y], i) => ({ x, y, got: false, fact: G.HEART_FACTS[i % G.HEART_FACTS.length] }));
    game.chasers = []; game.heat = 0; game.stars = 0;
    P.vehicle = null; P.carry = null; G.dog = null;
  }

  function newGame(female) {
    G.missions.reset();
    resetWorld();
    P.female = female; P.look = makeLook(female); P.name = female ? 'Vroni' : 'Maxi';
    P.x = 2240; P.y = 240; P.energy = 100; P.stamina = 100; P.wearsHeart = false;
    game.taler = 0; game.gaudi = 0; game.day = 1; game.clock = 600; game.facts = new Set(); G.flags = {};
    game.oideSeen = false; game.ozapft = false;
    G.trophies.load(null); G.events.reset(); P.plush = false;
    startLoading(() => { startIntro(() => G.missions.begin('servus')); });
  }
  function continueGame(s) {
    G.missions.reset();
    resetWorld();
    P.female = s.female; P.look = makeLook(s.female); P.name = s.name;
    P.x = s.x || 2240; P.y = s.y || 240; P.wearsHeart = !!s.wearsHeart; P.energy = 100; P.stamina = 100;
    game.taler = s.taler; game.gaudi = s.gaudi; game.day = s.day; game.clock = s.clock;
    game.facts = new Set(s.facts || []);
    Object.assign(G.missions.done, s.done || {});
    (s.hearts || []).forEach((g, i) => { if (game.hearts[i]) game.hearts[i].got = g; });
    if (s.speech !== undefined) A.speech = s.speech;
    G.settings.easy = !!s.easy;
    game.oideSeen = !!s.oideSeen; game.ozapft = !!s.ozapft; G.flags.brezn = !!s.brezn;
    G.trophies.load(s.trophies); G.events.reset(); P.plush = !!s.plush;
    if (WD.solidAt(P.x, P.y, 9)) { P.x = 2240; P.y = 240; }
    startLoading(() => {
      game.scene = 'world';
      if (!G.missions.done.servus) G.missions.begin('servus');
      else G.ui.toast('Willkommen zurück auf der Wiesn, ' + P.name + '!', 3);
    });
  }
  function startLoading(cb) { game.scene = 'loading'; game.loading = { t: 0, cb, tip: pick(G.FACTS) }; }

  // ---------- Interaktionen ----------
  const interact = [];
  function buildInteractions() {
    for (const s of WD.stands) interact.push({ x: s.front.x, y: s.front.y, r: 42, label: () => s.name + ' kaufen (' + price(s.price) + ' Taler)', act: () => buy(s), foot: true });
    for (const t of WD.tents) interact.push({ x: t.door.x, y: t.door.y, r: 42, label: () => 'Brotzeit im ' + t.name.replace('-Festzelt', '-Zelt') + ' (5 Taler)', act: () => tent(t), foot: true });
    const R = (place, label, act, cond) => interact.push({ x: WD.places[place].x, y: WD.places[place].y, r: 46, label, act, cond, foot: true });
    R('toboggan', () => G.missions.done.toboggan ? 'Toboggan fahren (' + price(3) + ' Taler)' : 'Toboggan (sprich zuerst mit Toni)', () => {
      if (!G.missions.done.toboggan) return G.ui.toast('Toboggan-Toni steht gleich daneben – sprich ihn an (Symbol „T“)!');
      if (!pay(3)) return;
      game.startMinigame('toboggan', {}, (res) => { const t = Math.ceil(res.reward / 3); game.addTaler(t); game.addGaudi(5); G.ui.toast('Toboggan geschafft! +' + t + ' Taler', 3); });
    }, () => !G.missions.active || G.missions.active.id !== 'toboggan');
    R('teufelsrad', () => G.missions.done.teufelsrad ? 'Teufelsrad fahren (' + price(3) + ' Taler)' : 'Teufelsrad (erst nach dem Toboggan)', () => {
      if (!G.missions.done.teufelsrad) return G.ui.toast(G.missions.done.toboggan ? 'Rekommandeur Sepp wartet auf dich (Symbol „R“)!' : 'Erst den Toboggan schaffen – dann darfst du aufs Teufelsrad!');
      if (!pay(3)) return;
      const go = (assist) => game.startMinigame('teufelsrad', { hard: false, assist }, (res) => {
        if (res.win) { game.addTaler(10); game.addGaudi(5); G.ui.toast('Gewonnen! +10 Taler', 3); }
        else if (!res.quit) go(assist + 1);
      });
      go(0);
    }, () => !G.missions.active || !['teufelsrad', 'finale'].includes(G.missions.active.id));
    R('riesenrad', () => 'Riesenrad fahren (' + price(4) + ' Taler)', () => { if (!pay(4)) return; startView('riesenrad'); });
    R('wellenflug', () => 'Wellenflug fahren (' + price(3) + ' Taler)', () => { if (!pay(3)) return; startRide(WD.wellenflug, 'WELLENFLUG', 'Im Kettenkarussell fliegst du im Kreis – wie ein Vogel über der Wiesn!', 9); G.trophies.ride('wellenflug'); });
    R('krinoline', () => 'Krinoline fahren (' + price(2) + ' Taler)', () => { if (!pay(2)) return; startRide(WD.krinoline, 'KRINOLINE', 'Mit echter Blaskapelle in der Mitte – eines der ältesten Karussells der Wiesn!', 11, true); game.unlockFact('krino'); G.trophies.ride('krinoline'); });
    R('autoscooter', () => 'Autoscooter fahren (' + price(3) + ' Taler)', () => { if (!pay(3)) return; startScooter(); });
    R('schichtl', () => 'Zum Schichtl (' + price(3) + ' Taler)', () => { if (!pay(3)) return; game.unlockFact('schichtl'); game.startMinigame('schichtl', null, () => game.addGaudi(5)); });
    R('looping', () => 'Olympia-Looping', () => { game.unlockFact('looping'); G.ui.dialog([{ who: 'Kassiererin', text: 'Fünf Loopings, 1.250 Meter Strecke – die größte transportable Achterbahn der Welt! Aber du bist no a bisserl z’klein dafür. Komm in a paar Jahr wieder!' }]); });
    R('bavaria', () => 'In die Bavaria hinaufsteigen', () => { game.unlockFact('bavaria'); startView('bavaria'); });
    R('lukas', () => 'Hau den Lukas (' + price(2) + ' Taler)', () => {
      if (!pay(2)) return; game.unlockFact('lukas');
      game.startMinigame('lukas', {}, (res) => { if (res.bell) { G.trophies.unlock('lukas'); game.addTaler(5); G.ui.toast('DING! Die Glocke hat geläutet – +5 Taler', 3); } game.addGaudi(3); });
    });
    R('dosen', () => 'Dosenwerfen (' + price(3) + ' Taler)', () => {
      if (!pay(3)) return; game.unlockFact('dosen');
      game.startMinigame('dosen', {}, (res) => { if (res.win) { P.plush = true; G.trophies.unlock('dosen'); G.ui.toast('Du trägst jetzt einen Teddy unterm Arm!', 3); } game.addGaudi(3); });
    });
    R('schaukel', () => 'Schiffschaukel fahren (' + price(2) + ' Taler)', () => {
      if (!pay(2)) return; game.unlockFact('schaukel');
      game.startMinigame('schaukel', {}, (res) => { G.trophies.ride('schaukel'); if (res.top) G.trophies.unlock('schaukel'); game.addGaudi(4); });
    });
    R('kalb', () => 'Kettenflieger Kalb fahren (' + price(2) + ' Taler)', () => { if (!pay(2)) return; game.unlockFact('kalb'); startRide(WD.objects.find(o => o.kind === 'kalb'), 'KETTENFLIEGER KALB', 'Dieser Kettenflieger dreht sich schon seit 1919 – über 100 Jahre!', 9); G.trophies.ride('kalb'); });
    R('museum', () => 'Ins Museumszelt schauen', () => {
      game.unlockFact('museum');
      G.ui.dialog([
        { who: 'Museumsführerin', text: 'Grüß dich! Hier im Museumszelt der Oidn Wiesn zeigen wir, wie das Oktoberfest früher war.' },
        { who: 'Museumsführerin', text: 'Schau, das ist ein Nachbau vom Velodrom. Auf den Hochrädern dürfen Kinder sogar selbst eine Runde drehen!' },
        { who: 'Museumsführerin', text: 'Und weißt du, warum’s Wiesn heißt? Weil 1810 auf dieser Wiese die Hochzeit von Ludwig und Therese gefeiert wurde – mit einem Pferderennen!' },
      ]);
    });
    interact.push({ x: WD.places.service.x, y: WD.places.service.y, r: 46, foot: true, label: () => 'Oma besuchen (Wiesn-Quiz)', act: () => {
      const quiz = () => game.startMinigame('quiz', {}, (r) => { game.addTaler(r.score * 2); game.addGaudi(r.score * 2); if (r.score === 5) G.trophies.unlock('quiz'); });
      if (game.taler < 3) { game.addTaler(10); G.ui.dialog([{ who: 'Oma Resi', text: 'Na, is’s Geld scho alle? Do hast no a bisserl Taschengeld – 10 Taler. Aber ned alles für Zuckerwatte ausgeben!' }]); }
      else G.ui.dialog([{ who: 'Oma Resi', text: pick(['I sitz hier und rast mi a bisserl aus.', 'Hast scho de versteckten Lebkuchenherzen gfunden? Do steckt a Haufen Wiesn-Wissen drin!', 'Um 20 Uhr gehn mir hoam, gell?']) + ' Magst a Wiesn-Quiz mit mir machen? Für jede richtige Antwort gibt’s 2 Taler!' }], quiz);
      game.unlockFact('service');
    } });
  }

  function pay(p) {
    p = price(p);
    if (game.taler < p) { G.ui.toast('Nicht genug Taler! Im Servicezentrum gibt dir Oma Taschengeld.', 3); A.sfx.blip(200); return false; }
    game.taler -= p; A.sfx.coin();
    if (isFamilyDay()) G.ui.toast('Familientag: halber Preis bis 19 Uhr!', 2);
    return true;
  }

  const HEART_SAYINGS = ['I mog di', 'Wiesn-Spatzl', 'Servus Schatzi', 'Mei Herzerl', 'Gaudi-König', 'Oide Wiesn', 'Zuckerschnecke'];
  function buy(s) {
    if (!pay(s.price)) return;
    game.unlockFact('schmankerl');
    const kind = s.id.replace(/\d/, '');
    G.trophies.ate(kind);
    switch (kind) {
      case 'brezn': P.energy = Math.min(100, P.energy + 35); G.flags.brezn = true; G.ui.toast('Mmmh, a frische Brezn! (+Energie)'); break;
      case 'mandeln': P.boost = 25; P.boostKind = 'mandeln'; G.ui.toast('Gebrannte Mandeln – süß und knusprig! Du bist jetzt schneller.'); break;
      case 'zucker': P.boost = 12; P.boostKind = 'zucker'; P.energy = Math.min(100, P.energy + 15); G.ui.toast('ZUCKERSCHOCK! Super-schnell für ein paar Sekunden!'); break;
      case 'lebkuchen': P.wearsHeart = true; G.ui.toast('Dein Lebkuchenherz zum Umhängen: „' + pick(HEART_SAYINGS) + '“'); break;
      case 'schoko': P.energy = Math.min(100, P.energy + 30); G.ui.toast('Schokofrüchte – Erdbeeren mit Schokolade! (+Energie)'); break;
      case 'fisch': P.energy = 100; G.ui.toast('Steckerlfisch: Fisch am Stecken, über Holzkohle gegrillt. (Energie voll)'); break;
    }
  }
  function tent(t) {
    if (game.taler < 5) { G.ui.dialog([{ who: 'Bedienung', text: t.info + ' Für a Brotzeit brauchst 5 Taler.' }]); return; }
    game.taler -= 5; A.sfx.coin(); P.energy = 100;
    if (t.id === 'schottenhamel') game.unlockFact('ozapft');
    game.startMinigame('zelt', { tent: t }, () => { G.ui.toast('Energie voll – a halbe Hendl und a Spezi!', 3); });
  }

  // ---------- Fahrgeschäfte (in der Welt) ----------
  let savedStation = 0;
  function startRide(o, title, text, dur, music) {
    game.ride = { o, title, text, t: 0, dur, music };
    P.hidden = true;
    if (music) { savedStation = A.station; A.setStation(2); G.ui.showRadio(); }
    A.sfx.whoosh(1);
  }
  function endRide() {
    const r = game.ride; game.ride = null; P.hidden = false;
    if (r.music) { A.setStation(savedStation); }
    game.addGaudi(3);
  }
  function startScooter() {
    const a = WD.autoscooter;
    game.scooter = { t: 40, bumps: 0, v: { type: 'scooter', x: a.x + a.w / 2, y: a.y + a.h / 2, a: -Math.PI / 2, v: 0, col: '#ffe100' } };
    P.vehicle = game.scooter.v;
    G.trophies.ride('autoscooter');
    G.ui.toast('Autoscooter! Rempeln ist hier ausdrücklich erlaubt. [E] zum Aussteigen', 4);
  }
  function endScooter() {
    const s = game.scooter; game.scooter = null; P.vehicle = null;
    P.x = WD.places.autoscooter.x; P.y = WD.places.autoscooter.y + 10;
    game.addGaudi(Math.min(15, s.bumps));
    G.ui.toast('Rumms! ' + s.bumps + ' Rempler im Autoscooter. Gaudi +' + Math.min(15, s.bumps), 3);
  }
  function startView(kind) {
    const lines = kind === 'riesenrad'
      ? ['RIESENRAD', 'Rund 50 Meter über der Theresienwiese', 'Links die Schaustellerstraße, rechts die Wirtsbudenstraße mit den großen Festzelten.', 'Im Westen steht die Bavaria vor der Ruhmeshalle – und ganz im Süden die Oide Wiesn.']
      : ['DIE BAVARIA', 'Blick aus dem Kopf der Bronzestatue', 'Die Bavaria hält einen Eichenkranz hoch – neben ihr sitzt ein Löwe.', 'Am letzten Wiesn-Sonntag knallen hier die Böllerschützen zum Abschluss!'];
    game.scene = 'view'; game.view = { kind, t: 0, dur: 15, lines };
    if (kind === 'riesenrad') { game.unlockFact('riesenrad'); G.trophies.unlock('riesenrad'); G.trophies.ride('riesenrad'); } else game.unlockFact('boeller');
    A.sfx.whoosh(1.5);
  }

  // ---------- Update: Welt ----------
  function updatePlayer(dt) {
    const ax = I.axis();
    if (game.ride) { const r = game.ride; r.t += dt; P.x = r.o.x; P.y = r.o.y + 70; if (r.t > r.dur || (r.t > 2 && I.hit('act'))) { I.consume('act'); endRide(); } return; }
    let boostMul = P.boost > 0 ? (P.boostKind === 'zucker' ? 1.55 : 1.3) : 1;
    if (P.boost > 0) P.boost -= dt;
    if (P.vehicle) {
      const v = P.vehicle;
      const scooter = v.type === 'scooter';
      const maxV = (scooter ? 230 : 360) * (P.boost > 0 ? 1.15 : 1);
      const il = Math.hypot(ax.x, ax.y);
      if (il > 0.2) {
        const ta = Math.atan2(ax.y, ax.x), d = angDiff(v.a, ta);
        if (Math.abs(d) > 2.4 && v.v > 60) v.v = Math.max(0, v.v - 700 * dt);
        else { v.a += clamp(d, -3.6 * dt, 3.6 * dt); v.v = Math.min(maxV, v.v + 420 * dt * il); }
      } else v.v = Math.max(0, v.v - 260 * dt);
      v.x += Math.cos(v.a) * v.v * dt; v.y += Math.sin(v.a) * v.v * dt;
      if (scooter) {
        const a = WD.autoscooter;
        if (v.x < a.x + 20 || v.x > a.x + a.w - 20) { v.x = clamp(v.x, a.x + 20, a.x + a.w - 20); v.a = Math.PI - v.a; v.v *= 0.6; A.sfx.bump(); }
        if (v.y < a.y + 20 || v.y > a.y + a.h - 20) { v.y = clamp(v.y, a.y + 20, a.y + a.h - 20); v.a = -v.a; v.v *= 0.6; A.sfx.bump(); }
        for (const c of WD.scooterCars) {
          const d = dist(v.x, v.y, c.x, c.y);
          if (d < 32 && d > 0) {
            const nx = (v.x - c.x) / d, ny = (v.y - c.y) / d;
            v.x += nx * (32 - d); v.y += ny * (32 - d);
            c.a = Math.atan2(-ny, -nx);
            if (!c.bumpT || G.time - c.bumpT > 0.6) { c.bumpT = G.time; game.scooter.bumps++; A.sfx.bump(); G.ui.toast(pick(['RUMMS!', 'Bumm!', 'Ha, erwischt!', 'Rempler!']), 0.8); }
            v.v *= 0.5;
          }
        }
        game.scooter.t -= dt;
        if (game.scooter.t <= 0 || I.hit('act')) { I.consume('act'); endScooter(); return; }
      } else {
        const res = WD.collide(v, 12);
        if (res.hit && v.v > 140) { A.sfx.bump(); v.v *= 0.4; }
        if (res.edge) edgeMsg();
      }
      P.x = v.x; P.y = v.y; P.speedNow = v.v; P.dir = v.a; P.moving = false;
      if (!scooter && I.hit('act') && !nearInteraction()) { I.consume('act'); dismount(); }
      return;
    }
    // zu Fuß
    let sp = 150;
    const sprint = I.down('sprint') && P.stamina > 1;
    if (sprint) { sp = 240; P.stamina = Math.max(0, P.stamina - dt * 22); } else P.stamina = Math.min(100, P.stamina + dt * 14);
    if (P.energy <= 0) sp = Math.min(sp, 95);
    sp *= boostMul;
    const tvx = ax.x * sp, tvy = ax.y * sp;
    const k = Math.min(1, dt * 12);
    P.vx += (tvx - P.vx) * k; P.vy += (tvy - P.vy) * k;
    P.x += P.vx * dt; P.y += P.vy * dt;
    const res = WD.collide(P, 9);
    if (res.edge) edgeMsg();
    P.speedNow = Math.hypot(P.vx, P.vy);
    P.moving = P.speedNow > 15;
    if (P.moving) { P.dir = Math.atan2(P.vy, P.vx); P.walk += dt * P.speedNow * 0.16; }
    P.energy = Math.max(0, P.energy - dt * (sprint ? 0.9 : P.moving ? 0.3 : 0.08));
  }
  function dismount() {
    const v = P.vehicle; if (!v) return;
    P.vehicle = null; v.v = 0; P.vx = 0; P.vy = 0; P.y += 12; WD.collide(P, 9); A.sfx.blip(400);
  }
  function edgeMsg() {
    if (G.time - game.edgeT > 7) { game.edgeT = G.time; G.ui.toast('Hier ist die Wiesn zu Ende. Heute bleiben wir auf der Theresienwiese!', 3); }
  }

  let nearest = null;
  function nearInteraction() { return nearest; }
  function findInteraction() {
    nearest = null; let bd = 1e9; let label = null;
    if (game.ride || game.scooter) return null;
    for (const it of G.events.interactions()) { const d = dist(P.x, P.y, it.x, it.y); if (d < it.r && d < bd) { bd = d; nearest = it; } }
    if (nearest) return nearest;
    // Auftraggeber
    for (const id of G.missions.available()) {
      const m = G.missions.defs[id];
      const d = dist(P.x, P.y, m.giver.x, m.giver.y);
      if (d < 46 && d < bd) { bd = d; nearest = { act: () => G.missions.begin(id), label: () => 'Mit ' + m.giver.name + ' reden – „' + m.title + '“', foot: false }; }
    }
    if (!nearest) for (const it of interact) {
      if (it.cond && !it.cond()) continue;
      const d = dist(P.x, P.y, it.x, it.y);
      if (d < it.r && d < bd) { bd = d; nearest = it; }
    }
    if (!P.vehicle && !nearest) for (const r of E.rollers) {
      const d = dist(P.x, P.y, r.x, r.y);
      if (d < 30 && d < bd) { bd = d; nearest = { label: () => 'Auf den Roller steigen', act: () => { P.vehicle = r; r.v = 0; A.sfx.blip(800); }, foot: false }; }
    }
    if (nearest && P.vehicle && nearest.foot) { nearest = { label: () => 'Vom Roller absteigen', act: dismount, foot: false }; }
    return nearest;
  }

  function updateChasers(dt) {
    if (G.time - game.lastBump > 6 && game.heat > 0) { game.heat = Math.max(0, game.heat - dt * 0.55); updateStars(); }
    const want = game.stars + (game.stars >= 2 ? 1 : 0);
    if (game.chasers.length < want) {
      const cand = WD.nodes.filter(n => { const d = dist(n.x, n.y, P.x, P.y); return d > 450 && d < 950; });
      const n = cand.length ? pick(cand) : pick(WD.nodes);
      const o = E.newNPC('ordner'); o.x = n.x; o.y = n.y; o.chasing = true; o.size = 1.05;
      game.chasers.push(o);
      if (game.chasers.length === 1) A.say('Stehenbleiben!', 0.7);
    }
    if (game.stars === 0 && game.chasers.length) { game.chasers.length = 0; G.ui.toast('Die Ordner haben aufgegeben. Puh!', 2.5); }
    for (const o of game.chasers) {
      const dx = P.x - o.x, dy = P.y - o.y, d = Math.hypot(dx, dy);
      const sp = G.settings.easy ? 125 + game.stars * 20 : 150 + game.stars * 28;
      if (d > 1) { o.x += dx / d * sp * dt; o.y += dy / d * sp * dt; o.dir = Math.atan2(dy, dx); o.moving = true; o.walk += dt * 14; }
      WD.collide(o, 9);
      if (Math.random() < dt * 0.25) { o.say = pick(['Stehenbleiben!', 'Langsam, Freundchen!', 'Halt! Ordner!', 'Bleib stehn!']); o.sayT = 1.5; }
      if (o.sayT > 0) { o.sayT -= dt; if (o.sayT <= 0) o.say = null; }
      if (d < 20 && !game.busted && !P.vehicle) { startBusted(); return; }
      if (d < 26 && P.vehicle && P.vehicle.v < 60) { startBusted(); return; }
    }
  }
  function startBusted() {
    game.scene = 'busted'; game.busted = { t: 0 };
    A.sfx.busted(); A.say('Erwischt!', 0.8);
    G.trophies.unlock('erwischt');
  }
  function endBusted() {
    game.scene = 'world'; game.busted = null;
    game.chasers = []; game.heat = 0; game.stars = 0;
    if (P.vehicle) { P.vehicle.v = 0; P.vehicle = null; }
    P.x = WD.places.service.x; P.y = WD.places.service.y + 20;
    const lost = Math.min(3, game.taler); game.taler -= lost;
    G.ui.dialog([
      { who: 'Oma Resi', text: 'Da bist ja! Die Ordner ham di zum Servicezentrum hinterm Schottenhamel bracht – des is der Treffpunkt für Kinder.' },
      { who: 'Oma Resi', text: 'Auf da Wiesn rennt ma ned wild umanand und rempelt d’Leit um, gell?' + (lost ? ' Die ' + lost + ' Taler fürs Malheur zahl i vom Taschengeld.' : '') },
    ]);
    game.unlockFact('service');
  }

  function updateDog(dt) {
    const d0 = G.dog; if (!d0) return;
    const d = dist(d0.x, d0.y, P.x, P.y);
    if (d0.caught) {
      const tx = P.x - Math.cos(P.dir) * 26, ty = P.y - Math.sin(P.dir) * 26 + 4;
      const dd = dist(d0.x, d0.y, tx, ty);
      if (dd > 4) { const s = Math.min(dd * 6, 400); d0.x += (tx - d0.x) / dd * s * dt; d0.y += (ty - d0.y) / dd * s * dt; d0.moving = true; d0.dir = Math.atan2(ty - d0.y, tx - d0.x); d0.walk += dt * 20; } else d0.moving = false;
      return;
    }
    d0.nextSniff -= dt;
    if (d0.sniff > 0) { d0.sniff -= dt; d0.moving = false; }
    else {
      let sp = 70;
      if (d < 230) { const away = Math.atan2(d0.y - P.y, d0.x - P.x); d0.wa += angDiff(d0.wa, away + Math.sin(G.time * 3) * 0.6) * Math.min(1, dt * 6); sp = G.settings.easy ? 185 : 215; }
      else d0.wa += rand(-1, 1) * dt * 2;
      d0.x += Math.cos(d0.wa) * sp * dt; d0.y += Math.sin(d0.wa) * sp * dt;
      const res = WD.collide(d0, 8);
      if (res.hit || res.edge) d0.wa += Math.PI / 2 * (Math.random() < 0.5 ? 1 : -1);
      d0.moving = true; d0.dir = d0.wa; d0.walk += dt * sp * 0.15;
      if (d0.nextSniff <= 0) { d0.sniff = 1.3; d0.nextSniff = rand(3, 5); d0.say = pick(['*schnüffel*', 'Wuff!', '*schnupper*']); d0.sayT = 1.2; }
    }
    if (d0.sayT > 0) { d0.sayT -= dt; if (d0.sayT <= 0) d0.say = null; }
    if (d < 22) { d0.caught = true; A.sfx.boing(); G.trophies.unlock('waldi'); G.ui.toast(P.name + ': „Hab di, Waldi!“ – Wuff!', 3); }
  }

  function updateHearts() {
    for (const h of game.hearts) {
      if (h.got) continue;
      if (dist(P.x, P.y, h.x, h.y) < 28) {
        h.got = true; A.sfx.coin(); A.sfx.bell(); game.addGaudi(5);
        const f = G.FACTS.find(x => x.id === h.fact);
        const got = game.hearts.filter(x => x.got).length;
        game.facts.add(h.fact);
        G.ui.big('LEBKUCHENHERZ ' + got + '/' + game.hearts.length, f ? f.title + ': ' + f.text : '', 6, '#ff8ac0');
        if (got === game.hearts.length) setTimeout(() => { G.trophies.unlock('herzen'); G.ui.big('ALLE HERZEN GEFUNDEN!', 'Du bist ein echter Wiesn-Kenner! +50 Taler', 5); game.addTaler(50); }, 6500);
        game.save();
      }
    }
  }

  function updateClock(dt) {
    game.clock += dt * 0.5;
    if (!game.ozapft && game.day === 1 && game.clock >= 720) {
      game.ozapft = true;
      for (let i = 0; i < 12; i++) setTimeout(() => A.sfx.boeller(), 900 + i * 420);
      G.ui.big('O’ZAPFT IS!', '12 Uhr: Im Schottenhamel ist das erste Fass angezapft. Hörst du? Zwölf Böllerschüsse an der Bavaria – das Signal für alle Zelte!', 7);
      game.facts.add('ozapft'); game.facts.add('zwoelf');
    }
    if (game.clock >= 1200 && !G.ui.dialogOpen) {
      game.clock = 1200;
      if (G.missions.active && G.missions.active.id !== 'finale') G.missions.abort();
      if (P.vehicle) { P.vehicle.v = 0; P.vehicle = null; }
      game.unlockFact('20uhr');
      G.ui.dialog([
        { who: 'Oma Resi', text: 'Es is 20 Uhr! Ab jetzt dürfen Kinder unter 16 nur no mit Erwachsenen auf der Festwiese bleiben.' },
        { who: 'Oma Resi', text: 'Komm, mir gehn hoam. Morgen is wieder Wiesn!' },
      ], () => {
        game.day++; game.clock = 600; P.x = 2240; P.y = 240; P.energy = 100; game.heat = 0; game.stars = 0; game.chasers = [];
        const dn = DAYS[(game.day - 1) % 7];
        G.ui.big(dn.toUpperCase(), dn === 'Dienstag' ? 'Familientag! Alle Fahrgeschäfte und Buden bis 19 Uhr zum halben Preis.' : 'Ein neuer Wiesn-Tag beginnt!', 4);
        if (dn === 'Dienstag') game.unlockFact('familie');
        game.save();
      });
    }
  }

  function updateWorld(dt, dlgWasOpen) {
    const blocking = G.ui.dialogOpen || dlgWasOpen;
    if (!blocking) { updatePlayer(dt); G.events.update(dt); }
    else { P.moving = false; if (P.vehicle) P.vehicle.v *= 0.9; }
    E.updateNPCs(dt, P);
    E.updateCarriage(dt, P);
    WD.updateScooterCars(dt, P);
    if (!blocking) {
      updateChasers(dt);
      if (game.scene !== 'world') return;
      updateDog(dt); updateHearts(); updateClock(dt);
      G.missions.update(dt);
      const it = findInteraction();
      G.ui.prompt = it && !game.ride ? it.label() : null;
      if (it && it.act && I.hit('act')) { it.act(); G.ui.prompt = null; }
      if (I.hit('map')) game.map = true;
      if (I.hit('radio')) { A.nextStation(); G.ui.showRadio(); }
      if (I.hit('back') || I.hit('pause')) game.togglePause();
      // Oide Wiesn betreten
      if (!game.oideSeen && P.y > 1975 && P.x > 760 && P.x < 2290) { game.oideSeen = true; game.unlockFact('oide'); G.ui.big('OIDE WIESN', 'Historische Fahrgeschäfte und Blasmusik. Kinder bis 14 Jahre haben freien Eintritt!', 4.5); }
    } else G.ui.prompt = null;
    // Kamera
    const z = baseZoom() * (P.vehicle && P.vehicle.type === 'roller' ? 0.85 : 1) * (game.ride ? 1.1 : 1);
    const lx = P.vehicle ? Math.cos(P.vehicle.a) * P.vehicle.v * 0.35 : P.vx * 0.2;
    const ly = P.vehicle ? Math.sin(P.vehicle.a) * P.vehicle.v * 0.35 : P.vy * 0.2;
    const tx = game.ride ? game.ride.o.x : P.x + lx, ty = game.ride ? game.ride.o.y - 60 : P.y + ly - 20;
    cam.x += (tx - cam.x) * Math.min(1, dt * 5); cam.y += (ty - cam.y) * Math.min(1, dt * 5);
    cam.z += (z - cam.z) * Math.min(1, dt * 3);
  }
  const cam = { x: 2240, y: 240, z: 1 };
  const baseZoom = () => clamp(Math.min(W, H) / 640, 0.7, 2.0);

  // ---------- Rendern: Welt ----------
  function darkness() { return clamp((game.clock - 1050) / 140, 0, 1) * 0.62; }
  function tint() {
    const c = game.clock;
    if (c < 1000) return null;
    const f = clamp((c - 1000) / 200, 0, 1);
    // Abendsonne: Gold → Pink → Lila (Vice-City-Stimmung)
    const stops = [[255, 255, 255], [255, 205, 150], [255, 150, 170], [130, 100, 190]];
    const p = f * 3, i = Math.min(2, Math.floor(p)), k = p - i;
    const a = stops[i], b = stops[i + 1];
    return 'rgb(' + Math.round(lerp(a[0], b[0], k)) + ',' + Math.round(lerp(a[1], b[1], k)) + ',' + Math.round(lerp(a[2], b[2], k)) + ')';
  }

  function drawMarker(x, y, col) {
    const t = G.time;
    ctx.globalAlpha = 0.5;
    ellipse(ctx, x, y, 22 + Math.sin(t * 4) * 3, 9, col || '#ffe100');
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = col || '#ffe100'; ctx.fillRect(x - 18, y - 70, 36, 70);
    ctx.globalAlpha = 1;
    const by = y - 90 + Math.sin(t * 3) * 6;
    ctx.fillStyle = col || '#ffe100'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 12, by - 12); ctx.lineTo(x + 12, by - 12); ctx.lineTo(x, by + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  function drawGiver(m, t) {
    const g = m.giver;
    const p = { x: g.x, y: g.y, dir: Math.atan2(P.y - g.y, P.x - g.x), look: g.look, size: m.giver.size || (g.look.kind === 'oma' ? 0.95 : 1), moving: false, happy: true };
    E.drawPerson(ctx, p);
    const by = g.y - 62 + Math.sin(t * 3) * 4;
    circle(ctx, g.x, by, 15, '#000'); circle(ctx, g.x, by, 13, m.color);
    txt(ctx, m.letter, g.x, by + 1, 15, '#000', 'center', null);
  }

  function bubble(x, y, text) {
    ctx.font = '800 11px ' + FONT;
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = 'rgba(255,255,255,.92)'; rrect(ctx, x - w / 2, y - 18, w, 18, 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x + 4, y); ctx.fill();
    txt(ctx, text, x, y - 9, 11, '#222', 'center', null);
  }

  function renderWorld(c, zoomOverride) {
    const z = zoomOverride ? zoomOverride.z : cam.z, cx = zoomOverride ? zoomOverride.x : cam.x, cy = zoomOverride ? zoomOverride.y : cam.y;
    const t = G.time, dark = darkness();
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (W / 2 - cx * z), dpr * (H / 2 - cy * z));
    const vx = cx - W / 2 / z, vy = cy - H / 2 / z, vw = W / z, vh = H / z;
    WD.drawGround(ctx, t, vx, vy, vw, vh);
    // Missionsziel am Boden
    const tgt = G.missions.currentTarget();
    const inView = (x, y, w, h) => x + w > vx && x < vx + vw && y + h > vy && y < vy + vh;
    const items = [];
    for (const o of WD.objects) { const b = WD.objBounds(o); if (inView(b[0], b[1], b[2], b[3])) items.push({ y: o.baseY, k: 0, o }); }
    for (const p of E.npcs) if (inView(p.x - 20, p.y - 60, 40, 70)) items.push({ y: p.y, k: 1, o: p });
    for (const p of E.band) if (inView(p.x - 20, p.y - 60, 40, 70)) items.push({ y: p.y, k: 1, o: p });
    for (const p of game.chasers) items.push({ y: p.y, k: 1, o: p });
    const car = E.carriage; if (inView(car.x - 90, car.y - 80, 180, 100)) items.push({ y: car.y, k: 2, o: car });
    for (const r of E.rollers) if (r !== P.vehicle && inView(r.x - 20, r.y - 30, 40, 40)) items.push({ y: r.y, k: 3, o: r });
    for (const id of G.missions.available()) { const m = G.missions.defs[id]; items.push({ y: m.giver.y, k: 4, o: m }); }
    // Oma sitzt nach der ersten Mission vor dem Servicezentrum
    if (G.missions.done.servus) items.push({ y: WD.places.service.y - 6, k: 1, o: omaService });
    const st = G.missions.currentStep();
    if (st && st.targets) st.targets.forEach((tg, i) => { if (!G.missions.sd.d.got[i]) { if (!tg.p) tg.p = { x: tg.x, y: tg.y - 6, look: Object.assign(E.randomLook('adult'), tg.look), size: 1, dir: Math.PI / 2 }; tg.p.dir = Math.atan2(P.y - tg.y, P.x - tg.x); items.push({ y: tg.y, k: 1, o: tg.p }); } });
    if (G.dog) items.push({ y: G.dog.y, k: 5, o: G.dog });
    for (const h of game.hearts) if (!h.got && inView(h.x - 20, h.y - 50, 40, 60)) items.push({ y: h.y, k: 6, o: h });
    if (!P.hidden && game.scene !== 'credits') items.push({ y: P.y, k: 7, o: P });
    G.events.drawRaceGround(ctx);
    for (const d of G.events.drawables(inView)) items.push({ y: d.y, k: 8, o: d });
    items.sort((a, b) => a.y - b.y);
    if (tgt && !P.hidden) drawMarkerGround(tgt);
    for (const it of items) {
      switch (it.k) {
        case 0: WD.drawObject(ctx, it.o, t, dark); break;
        case 1: E.drawPerson(ctx, it.o); break;
        case 2: E.drawCarriage(ctx, it.o); break;
        case 3: E.drawRoller(ctx, it.o, false); break;
        case 4: drawGiver(it.o, t); break;
        case 5: E.drawDog(ctx, it.o); break;
        case 6: { const h = it.o; const b = Math.sin(t * 3 + h.x) * 4; ellipse(ctx, h.x, h.y, 10, 4, 'rgba(0,0,0,.25)'); circle(ctx, h.x, h.y - 22 + b, 18, 'rgba(255,150,200,.25)'); WD.drawHeart(ctx, h.x, h.y - 22 + b, 11, '#e84d8a'); break; }
        case 7: drawPlayer(); break;
        case 8: it.o.draw(ctx); break;
      }
    }
    if (tgt && !P.hidden) drawMarker(tgt.x, tgt.y);
    // Röntgenblick: Spieler hinter Gebäuden erkennbar
    if (!P.hidden && game.scene !== 'credits') { E.drawPerson(ctx, P, 0.28); }
    // Sprechblasen
    for (const p of E.npcs) if (p.say && inView(p.x - 60, p.y - 80, 120, 80)) bubble(p.x, p.y - 44 * (p.size || 1), p.say);
    for (const p of game.chasers) if (p.say) bubble(p.x, p.y - 46, p.say);
    if (G.dog && G.dog.say) bubble(G.dog.x, G.dog.y - 20, G.dog.say);
    // Licht & Abendstimmung
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const tn = tint();
    if (tn) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tn; ctx.fillRect(0, 0, W, H);
      if (dark > 0) { ctx.fillStyle = 'rgba(40,40,90,' + dark + ')'; ctx.fillRect(0, 0, W, H); }
      ctx.globalCompositeOperation = 'source-over';
    }
    if (dark > 0.05) {
      ctx.globalCompositeOperation = 'lighter';
      for (const l of WD.lights) {
        const sx = (l.x - cx) * z + W / 2, sy = (l.y - cy) * z + H / 2, r = l.r * z;
        if (sx < -r || sx > W + r || sy < -r || sy > H + r) continue;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, l.c + (dark * 0.55) + ')'); g.addColorStop(1, l.c + '0)');
        ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  const omaService = { x: 2930, y: 440, dir: Math.PI / 2, look: { female: true, skin: '#f1c9a5', hair: '#c8c8c8', dirndl: '#6a2a4a', apron: '#f2d0e0', kind: 'oma' }, size: 0.95, happy: true };

  function drawMarkerGround(tgt) {
    ctx.strokeStyle = 'rgba(255,225,0,.5)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(tgt.x, tgt.y); ctx.stroke(); ctx.setLineDash([]);
  }

  function drawPlayer() {
    if (P.vehicle && P.vehicle.type === 'roller') {
      E.drawRoller(ctx, P.vehicle, true);
      const fake = Object.assign({}, P, { y: P.y - 4, moving: false });
      E.drawPerson(ctx, fake);
    } else if (P.vehicle && P.vehicle.type === 'scooter') {
      WD.drawScooterCar(ctx, P.x, P.y, P.vehicle.a, '#ffe100', true, P.look.skin);
      circle(ctx, P.x - 2, P.y - 19, 5, P.look.hair);
    } else E.drawPerson(ctx, P);
    // Fahne über dem Kopf, damit man sich im Gewühl findet
    if (game.scene === 'world' && !game.ride) {
      const by = P.y - 46 + Math.sin(G.time * 4) * 1.5 - (P.vehicle ? 6 : 0);
      ctx.fillStyle = '#ffe46b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(P.x - 5, by - 6); ctx.lineTo(P.x + 5, by - 6); ctx.lineTo(P.x, by); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  // ---------- Wiesn-Postkarte ----------
  function makePostcard() {
    const pc = document.createElement('canvas'); pc.width = 1200; pc.height = 820;
    const c = pc.getContext('2d');
    c.fillStyle = '#fff8e6'; c.fillRect(0, 0, 1200, 820);
    const sw = cv.width, sh = cv.height, ar = 1100 / 600;
    let cw2 = sw, ch2 = sw / ar; if (ch2 > sh) { ch2 = sh; cw2 = sh * ar; }
    c.drawImage(cv, (sw - cw2) / 2, (sh - ch2) / 2, cw2, ch2, 50, 50, 1100, 600);
    c.strokeStyle = '#1a7fd4'; c.lineWidth = 6; c.strokeRect(50, 50, 1100, 600);
    rauten(c, 0, 0, 1200, 22, 12); rauten(c, 0, 798, 1200, 22, 12);
    G.ui.drawLogo(c, 140, 715, 0.42);
    txt(c, 'Servus von der Wiesn!', 690, 705, 46, '#d6336c', 'center', '#fff', 6);
    txt(c, P.name + ' · ' + DAYS[(game.day - 1) % 7] + ', Tag ' + game.day + ' · ' + fmtTime(game.clock) + ' Uhr · Theresienwiese', 690, 760, 20, '#5a3418', 'center', null);
    G.world.drawHeart(c, 1110, 720, 30, '#e84d8a', 'Wiesn');
    const a = document.createElement('a');
    a.download = 'wiesn-postkarte-tag' + game.day + '.png';
    a.href = pc.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
    A.sfx.whoosh(0.2); A.sfx.bell();
    G.ui.big('KLICK!', 'Deine Wiesn-Postkarte wurde gespeichert.', 2.5, '#fff');
    G.lastPostcard = a.href;
  }

  // ---------- Titel / Figurenwahl / Laden ----------
  function drawSunsetBg(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2a1a5a'); g.addColorStop(0.45, '#d84a8a'); g.addColorStop(0.75, '#ff9a4a'); g.addColorStop(1, '#ffd27a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    circle(ctx, W * 0.5, H * 0.72, Math.min(W, H) * 0.18, 'rgba(255,230,150,.85)');
    for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(216,74,138,.55)'; ctx.fillRect(W * 0.5 - Math.min(W, H) * 0.2, H * 0.66 + i * 14, Math.min(W, H) * 0.4, 5); }
    const gy = H * 0.86;
    ctx.fillStyle = '#1a0a2a';
    // Riesenrad
    const rx = W * 0.18, ry = gy - Math.min(H * 0.32, 230), rr = Math.min(H * 0.26, 180);
    ctx.strokeStyle = '#1a0a2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(rx, ry, rr, 0, TAU); ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const a = t * 0.1 + i / 16 * TAU; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(a) * rr, ry + Math.sin(a) * rr); ctx.stroke(); ctx.fillRect(rx + Math.cos(a) * rr - 8, ry + Math.sin(a) * rr, 16, 14); }
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(rx - rr * 0.5, gy); ctx.lineTo(rx, ry); ctx.lineTo(rx + rr * 0.5, gy); ctx.stroke();
    // Toboggan-Turm
    const tx = W * 0.78, th = Math.min(H * 0.42, 300);
    ctx.fillRect(tx - 30, gy - th, 60, th);
    ctx.beginPath(); ctx.moveTo(tx - 46, gy - th); ctx.lineTo(tx, gy - th - 50); ctx.lineTo(tx + 46, gy - th); ctx.fill();
    ctx.lineWidth = 12; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const a = i / 60 * 3 * TAU; const x = tx + Math.cos(a) * 60, y = gy - th + 30 + i / 60 * (th - 40) + Math.sin(a) * 10; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    // Bavaria
    const bx = W * 0.92;
    ctx.fillRect(bx - 16, gy - 120, 32, 120); ctx.beginPath(); ctx.moveTo(bx - 14, gy - 120); ctx.lineTo(bx - 6, gy - 190); ctx.lineTo(bx + 8, gy - 190); ctx.lineTo(bx + 16, gy - 120); ctx.fill(); circle(ctx, bx, gy - 200, 10, '#1a0a2a');
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - 6, gy - 185); ctx.lineTo(bx - 20, gy - 225); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx - 22, gy - 235, 8, 0, TAU); ctx.stroke();
    // Festzelte
    for (let i = 0; i < 5; i++) { const x0 = W * (0.3 + i * 0.1); ctx.beginPath(); ctx.moveTo(x0 - 60, gy); ctx.lineTo(x0 - 60, gy - 50); ctx.quadraticCurveTo(x0, gy - 95, x0 + 60, gy - 50); ctx.lineTo(x0 + 60, gy); ctx.fill(); ctx.fillRect(x0 - 4, gy - 120, 8, 40); }
    ctx.fillRect(0, gy, W, H - gy);
  }

  function drawTitle(t, clicks) {
    drawSunsetBg(t);
    const s = Math.min(1.1, W / 700, H / 620);
    G.ui.drawLogo(ctx, W / 2, H * 0.24, s);
    txt(ctx, 'GAUDI · TRUBEL · ABENTEUER', W / 2, H * 0.24 + 150 * s, 20 * s + 4, '#fff', 'center', '#1a0a2a', 5);
    txt(ctx, 'Ein Oktoberfest-Abenteuer für Kinder – auf der Theresienwiese', W / 2, H * 0.24 + 182 * s, 13 * s + 4, '#ffe2f2', 'center', '#1a0a2a', 4);
    const save = loadSave();
    const items = save ? ['Weiterspielen (' + save.name + ', Tag ' + save.day + ')', 'Neues Spiel'] : ['Neues Spiel'];
    if (I.hit('down')) game.titleSel = (game.titleSel + 1) % items.length;
    if (I.hit('up')) game.titleSel = (game.titleSel + items.length - 1) % items.length;
    let chosen = -1;
    items.forEach((it, i) => {
      const y = H * 0.62 + i * 56, w = Math.min(460, W - 40);
      const sel = game.titleSel === i;
      ctx.fillStyle = sel ? 'rgba(255,79,184,.85)' : 'rgba(26,10,42,.7)'; rrect(ctx, W / 2 - w / 2, y - 22, w, 44, 22); ctx.fill();
      txt(ctx, it, W / 2, y, 18, '#fff', 'center', null);
      for (const c of clicks) if (Math.abs(c.x - W / 2) < w / 2 && Math.abs(c.y - y) < 22) chosen = i;
    });
    if (I.hit('act') || I.hit('space')) chosen = game.titleSel;
    txt(ctx, 'Steuerung: Pfeiltasten/WASD · Shift rennen · E Aktion · M Karte · R Radio · Esc Pause  ·  Touch wird unterstützt', W / 2, H - 20, 12, 'rgba(255,255,255,.75)', 'center', null);
    if (chosen >= 0) {
      A.init(); A.sfx.bell();
      if (save && chosen === 0) continueGame(save);
      else { game.scene = 'char'; game.charSel = 0; }
    }
  }

  function drawChar(t, clicks) {
    drawSunsetBg(t);
    txt(ctx, 'WER BIST DU?', W / 2, H * 0.14, Math.min(48, W / 12), '#ffd84a', 'center', '#1a0a2a', 8);
    if (I.hit('left') || I.hit('right')) { game.charSel = 1 - game.charSel; A.sfx.blip(); }
    const opts = [{ name: 'Maxi', desc: 'mit Lederhose & kariertem Hemd', female: false }, { name: 'Vroni', desc: 'mit Dirndl & Zöpfen', female: true }];
    let chosen = -1;
    opts.forEach((o, i) => {
      const x = W / 2 + (i === 0 ? -1 : 1) * Math.min(170, W * 0.24), y = H * 0.56;
      const sel = game.charSel === i;
      ctx.fillStyle = sel ? 'rgba(255,79,184,.6)' : 'rgba(26,10,42,.55)'; rrect(ctx, x - 120, y - 190, 240, 300, 20); ctx.fill();
      if (sel) { ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 4; ctx.stroke(); }
      const p = { x: x, y: y + 40, dir: Math.PI / 2, look: makeLook(o.female), size: 4.2, moving: sel, walk: t * 8, happy: true };
      E.drawPerson(ctx, p);
      txt(ctx, o.name, x, y + 70, 30, '#fff', 'center', '#1a0a2a', 6);
      txt(ctx, o.desc, x, y + 98, 13, '#ffe2f2', 'center', null);
      for (const c of clicks) if (Math.abs(c.x - x) < 120 && c.y > y - 190 && c.y < y + 110) { if (game.charSel === i) chosen = i; else { game.charSel = i; A.sfx.blip(); } }
    });
    txt(ctx, '◀ ▶ wählen  ·  E / Enter bestätigen (oder nochmal antippen)', W / 2, H - 30, 14, '#fff', 'center', '#1a0a2a', 4);
    txt(ctx, 'Tipp für Jüngere: Im Pausenmenü (Optionen) gibt es den Modus „Kinderleicht“.', W / 2, H - 54, 12, '#ffe2f2', 'center', '#1a0a2a', 3);
    if (I.hit('act') || I.hit('space')) chosen = game.charSel;
    if (I.hit('back')) game.scene = 'title';
    if (chosen >= 0) { A.sfx.jingle(); newGame(opts[chosen].female); }
  }

  function drawLoading(dt) {
    const L = game.loading; L.t += dt;
    drawSunsetBg(G.time);
    ctx.fillStyle = 'rgba(10,5,25,.55)'; ctx.fillRect(0, 0, W, H);
    G.ui.drawLogo(ctx, W / 2, H * 0.22, Math.min(0.8, W / 900));
    const bw = Math.min(520, W - 60), bx = (W - bw) / 2, by = H * 0.5;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; rrect(ctx, bx, by, bw, 150, 16); ctx.fill();
    txt(ctx, 'WUSSTEST DU SCHON?', W / 2, by + 24, 16, '#ffd84a', 'center', null);
    txt(ctx, L.tip.title, W / 2, by + 52, 18, '#fff', 'center', null);
    ctx.font = '700 15px ' + FONT;
    wrapText(ctx, L.tip.text, bw - 40).slice(0, 4).forEach((l, i) => txt(ctx, l, W / 2, by + 80 + i * 20, 14, '#eee', 'center', null, 0, '700 '));
    const pr = clamp(L.t / 3.2, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; rrect(ctx, bx, H * 0.84, bw, 10, 5); ctx.fill();
    ctx.fillStyle = '#ff4fb8'; rrect(ctx, bx, H * 0.84, bw * pr, 10, 5); ctx.fill();
    txt(ctx, pr < 1 ? 'Die Wiesn wird aufgebaut …' : 'Bereit! [E] / Tippen', W / 2, H * 0.84 + 30, 14, '#fff', 'center', null);
    if (pr >= 1 && (I.hit('act') || I.hit('space') || G.frameClicks.length || L.t > 7)) { const cb = L.cb; game.loading = null; cb(); }
  }

  // ---------- Riesenrad-/Bavaria-Blick & Abspann ----------
  function startIntro(cb) {
    game.scene = 'view';
    game.view = { kind: 'intro', t: 0, dur: 14, cb, lines: [] };
    A.sfx.whoosh(2);
  }
  const INTRO_KF = [[0, 360, 1150, 0.85], [3.5, 900, 760, 1.0], [7, 1700, 600, 0.95], [10.5, 2240, 420, 1.1], [14, 2240, 240, 1.3]];
  const INTRO_TXT = [[0.5, 'MÜNCHEN', 'Theresienwiese'], [3.5, 'DAS OKTOBERFEST', 'Die Wiesn – seit 1810'], [7, 'FESTZELTE, BLASMUSIK, FAHRGESCHÄFTE', 'Toboggan · Teufelsrad · Riesenrad · Krinoline'], [10.5, 'UND MITTENDRIN:', 'DU.']];
  function drawIntro(v) {
    let i = 0; while (i < INTRO_KF.length - 2 && v.t > INTRO_KF[i + 1][0]) i++;
    const a = INTRO_KF[i], b = INTRO_KF[i + 1], f = smooth(clamp((v.t - a[0]) / (b[0] - a[0]), 0, 1));
    const zf = baseZoom() / 1.3;
    renderWorld(ctx, { x: lerp(a[1], b[1], f), y: lerp(a[2], b[2], f), z: lerp(a[3], b[3], f) * zf });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bar = Math.min(H * 0.12, 80) * (1 - smooth(clamp(v.t - v.dur + 1, 0, 1)));
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
    for (const [tt, l1, l2] of INTRO_TXT) {
      const al = clamp((v.t - tt) * 2, 0, 1) * clamp((tt + 3.2 - v.t) * 2, 0, 1);
      if (al <= 0) continue;
      ctx.globalAlpha = al;
      txt(ctx, l1, W * 0.08, H * 0.7, Math.min(46, W / 16), '#ffd84a', 'left', '#000', 7);
      txt(ctx, l2, W * 0.08, H * 0.7 + Math.min(46, W / 16), Math.min(24, W / 30), '#fff', 'left', '#000', 5);
      ctx.globalAlpha = 1;
    }
    txt(ctx, '[E] überspringen', W - 16, H - bar / 2, 12, 'rgba(255,255,255,.6)', 'right', null);
    if ((v.t > 1 && I.hit('act')) || v.t > v.dur) { game.scene = 'world'; game.view = null; const cb = v.cb; I.consume('act'); cb(); }
  }
  function drawView(dt) {
    const v = game.view; v.t += dt;
    if (v.kind === 'intro') return drawIntro(v);
    const fit = Math.min(W / 3100, H / 2300);
    const k = smooth(clamp(v.t / 3, 0, 1)) * (1 - smooth(clamp((v.t - v.dur + 2) / 2, 0, 1)));
    const from = v.kind === 'riesenrad' ? { x: 1010, y: 200 } : { x: 360, y: 800 };
    const zc = { x: lerp(from.x, 1620, k), y: lerp(from.y, 1180, k), z: lerp(baseZoom(), fit, k) };
    renderWorld(ctx, zc);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Rahmen: Gondel bzw. Fenster im Kopf der Bavaria
    if (v.kind === 'riesenrad') {
      ctx.strokeStyle = '#d62f3a'; ctx.lineWidth = 26; rrect(ctx, 13, 13, W - 26, H - 26, 40); ctx.stroke();
      ctx.fillStyle = '#d62f3a'; ctx.fillRect(0, H - 60, W, 60); ctx.fillRect(W / 2 - 8, 0, 16, 40);
      ctx.fillStyle = '#a01e2a'; ctx.fillRect(0, H - 64, W, 6);
    } else {
      ctx.fillStyle = '#3a2a14';
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.ellipse(W / 2, H / 2, W * 0.46, H * 0.42, 0, 0, TAU); ctx.fill('evenodd');
    }
    const lines = v.lines;
    const a = clamp(v.t - 1, 0, 1) * clamp(v.dur - v.t, 0, 1);
    ctx.globalAlpha = a;
    txt(ctx, lines[0], W / 2, 60, Math.min(44, W / 14), '#ffd84a', 'center', '#000', 7);
    txt(ctx, lines[1], W / 2, 102, Math.min(20, W / 34), '#fff', 'center', '#000', 5);
    const li = Math.min(lines.length - 1, 2 + Math.floor(v.t / 5));
    ctx.font = '700 17px ' + FONT;
    wrapText(ctx, lines[li], W - 80).forEach((l, i) => txt(ctx, l, W / 2, H - 100 + i * 24, Math.min(18, W / 36), '#fff', 'center', '#000', 5, '800 '));
    ctx.globalAlpha = 1;
    if ((v.t > 2 && I.hit('act')) || v.t > v.dur) { game.scene = 'world'; game.view = null; game.addGaudi(3); }
  }

  const CREDITS = ['GTA WIESN', 'Gaudi · Trubel · Abenteuer', '', 'Ein Tag auf der Theresienwiese', '', '— MIT DABEI —', 'Oma Resi', 'Toboggan-Toni', 'Rekommandeur Sepp', 'Ferdl (jetzt dein Freund)', 'Frau Zuckerl vom Lebkuchenstandl', 'Frau Brandl & Dackel Waldi', 'die Blaskapelle', 'und tausende Wiesn-Besucher', '', '— RECHERCHE —', 'muenchen.de · oktoberfest.de', 'muenchen.travel · stadt.muenchen.de', 'Wikipedia: Olympia Looping', '', 'Alle Figuren sind erfunden.', 'Die Wiesn-Fakten sind echt!', '', 'Servus – und bis zur nächsten Wiesn!'];
  function drawCredits(dt) {
    const c = game.credits; c.t += dt;
    const fit = Math.min(W / 3100, H / 2300);
    const k = smooth(clamp(c.t / 8, 0, 1));
    game.clock = Math.min(1195, 1140 + c.t * 2);
    renderWorld(ctx, { x: lerp(1010, 1620, k), y: lerp(160, 1180, k), z: lerp(baseZoom() * 1.2, fit * 1.1, k) });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = 'rgba(20,5,40,.35)'; ctx.fillRect(0, 0, W, H);
    // Oma, Ferdl und du in der Gondel
    const gy = H - 70;
    ctx.fillStyle = '#d62f3a'; rrect(ctx, W / 2 - 150, gy - 20, 300, 90, 16); ctx.fill();
    [[-80, { female: true, skin: '#f1c9a5', hair: '#c8c8c8', dirndl: '#6a2a4a', apron: '#f2d0e0', kind: 'oma' }, 1.6], [0, P.look, 1.4], [80, { female: false, skin: '#f1c9a5', hair: '#d8b060', shirt: '#d62f3a', kind: 'kid' }, 1.4]].forEach(([dx, look, s]) => {
      E.drawPerson(ctx, { x: W / 2 + dx, y: gy + 10, dir: -Math.PI / 2 + 0.01, look, size: s, armsUp: c.t % 4 < 2 && dx === 0, happy: true });
    });
    ctx.fillStyle = '#a01e2a'; ctx.fillRect(W / 2 - 150, gy + 4, 300, 70);
    const lh = 34, y0 = H + 20 - c.t * 42;
    CREDITS.forEach((l, i) => {
      const y = y0 + i * lh;
      if (y < -40 || y > H - 120) return;
      const big = i === 0;
      txt(ctx, l, W / 2, y, big ? 46 : (l.startsWith('—') ? 18 : 22), big ? '#ffd84a' : l.startsWith('—') ? '#ff9ad8' : '#fff', 'center', '#000', big ? 8 : 5);
    });
    if (c.t > 3) txt(ctx, '[E] überspringen', W - 20, 24, 12, 'rgba(255,255,255,.7)', 'right', null);
    if (y0 + CREDITS.length * lh < -40 || (c.t > 3 && I.hit('act'))) {
      game.scene = 'world'; game.credits = null; game.clock = 1150;
      G.trophies.unlock('legende');
      G.ui.big('WIESN-LEGENDE!', 'Du hast alle Missionen geschafft! Die Wiesn gehört dir – sammle noch alle Lebkuchenherzen!', 6);
      c.cb();
    }
  }

  function drawBusted(dt) {
    const b = game.busted; b.t += dt;
    renderWorld(ctx);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#888'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,' + clamp(b.t * 0.3, 0, 0.4) + ')'; ctx.fillRect(0, 0, W, H);
    const s = 1 + Math.max(0, 0.6 - b.t) * 2;
    txt(ctx, 'ERWISCHT!', W / 2, H / 2, Math.min(96, W / 7) * s, '#e8203a', 'center', '#000', 12);
    txt(ctx, 'Die Ordner bringen dich zum Servicezentrum …', W / 2, H / 2 + 70, Math.min(20, W / 30), '#fff', 'center', '#000', 5);
    if (b.t > 3.2) endBusted();
  }

  // ---------- Minispiel-Rahmen ----------
  function drawMini() {
    const s = Math.min(W / VW, H / VH), ox = (W - VW * s) / 2, oy = (H - VH * s) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();
    const m = game.mini === 'schichtl' ? G.schichtl : G[game.mini];
    m.draw(ctx);
    ctx.restore();
    if (game.mini === 'schichtl') G.ui.setTouchMode('tap');
  }

  // ---------- Hauptschleife ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    G.time += dt;
    G.frameClicks = I.takeClicks();
    const dlgWasOpen = G.ui.dialogOpen;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    try {
      switch (game.scene) {
        case 'title': G.ui.setTouchMode('tap'); drawTitle(G.time, G.frameClicks); break;
        case 'char': G.ui.setTouchMode('lr'); drawChar(G.time, G.frameClicks); break;
        case 'loading': G.ui.setTouchMode('tap'); drawLoading(dt); break;
        case 'world': {
          if (game.paused) {
            renderWorld(ctx); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            G.ui.setTouchMode('tap');
            G.ui.drawPause(ctx, W, H, G.frameClicks);
            if (I.hit('back') || I.hit('pause')) game.togglePause();
            break;
          }
          if (game.map) {
            renderWorld(ctx); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            G.ui.setTouchMode('tap');
            G.ui.drawBigMap(ctx, W, H);
            if (I.hit('map') || I.hit('back') || I.hit('act') || G.frameClicks.length) game.map = false;
            break;
          }
          G.ui.setTouchMode(G.ui.dialogOpen ? 'tap' : 'world');
          G.ui.updateUI(dt);
          updateWorld(dt, dlgWasOpen);
          if (game.scene !== 'world') break;
          renderWorld(ctx);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          if (game.photoPending && --game.photoPending === 0) makePostcard();
          if (game.ride) {
            txt(ctx, game.ride.title, W / 2, H * 0.18, Math.min(48, W / 12), '#ffd84a', 'center', '#000', 8);
            ctx.font = '700 18px ' + FONT;
            wrapText(ctx, game.ride.text, W - 80).forEach((l, i) => txt(ctx, l, W / 2, H * 0.18 + 46 + i * 24, 17, '#fff', 'center', '#000', 5, '800 '));
            txt(ctx, 'Wiiiieeee! ' + Math.ceil(game.ride.dur - game.ride.t) + ' s', W / 2, H * 0.82, 22, '#fff', 'center', '#000', 5);
          }
          if (game.scooter) txt(ctx, 'AUTOSCOOTER  ⏱ ' + Math.ceil(game.scooter.t) + ' s   Rempler: ' + game.scooter.bumps, W / 2, 70, 20, '#ffe100', 'center', '#000', 5);
          G.ui.drawHUD(ctx, W, H);
          G.events.drawHUD(ctx, W, H);
          G.ui.drawToasts(ctx, W, H);
          G.ui.drawCards(ctx, W, H);
          G.ui.drawDialog(ctx, W, H);
          break;
        }
        case 'mini': {
          const m = game.mini === 'schichtl' ? G.schichtl : G[game.mini];
          G.ui.updateUI(dt);
          m.update(dt);
          if (game.scene === 'mini') drawMini();
          else { renderWorld(ctx); }
          break;
        }
        case 'view': G.ui.setTouchMode('tap'); G.ui.updateUI(dt); drawView(dt); break;
        case 'credits': G.ui.setTouchMode('tap'); drawCredits(dt); break;
        case 'busted': G.ui.setTouchMode('tap'); drawBusted(dt); break;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (game.scene !== 'world' && game.scene !== 'mini') G.ui.drawCards(ctx, W, H);
      G.ui.drawTouch(ctx, W, H);
    } catch (e) {
      console.error(e);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      txt(ctx, 'Fehler: ' + e.message, W / 2, 30, 14, '#f66', 'center', '#000', 3);
    }
    I.endFrame();
    requestAnimationFrame(frame);
  }

  // Autospeichern
  setInterval(() => { if (game.scene === 'world') game.save(); }, 30000);

  buildInteractions();
  requestAnimationFrame(frame);
})();
