'use strict';
// Wiesn-Wissen (recherchierte Fakten) und die Story-Missionen
G.FACTS = [
  { id: 'f1810', title: 'Die erste Wiesn', text: 'Die erste Wiesn gab es 1810 – zur Hochzeit von Kronprinz Ludwig und Prinzessin Therese. Darum heißt die Festwiese „Theresienwiese“.' },
  { id: 'tob1933', title: 'Toboggan seit 1933', text: 'Der Toboggan steht seit 1933 auf dem Oktoberfest. Die Betreiberfamilie hat ihn schon 1920 gekauft – wahrscheinlich aus Nordamerika.' },
  { id: 'tobband', title: 'Das Förderband', text: 'Am Toboggan bringt dich ein rund 8 Meter langes Förderband nach oben. Genau dort verlieren die meisten das Gleichgewicht – und die Zuschauer lachen mit.' },
  { id: 'tobname', title: 'Was heißt „Toboggan“?', text: 'Das Wort kommt aus der Sprache der Algonkin in Kanada und bedeutet: leichter Holzschlitten ohne Kufen.' },
  { id: 'tobturm', title: 'Früher war er größer', text: 'Der Toboggan-Turm war früher etwa zehn Meter höher und hatte zwei Rutschen. Damit er leichter auf- und abzubauen ist, wurde er verkleinert.' },
  { id: 'tob1908', title: 'Drei Turmrutschen', text: 'Im Jahr 1908 gab es auf der Wiesn gleich drei Turmrutschen. Heute ist der Toboggan einzigartig in Deutschland.' },
  { id: 'tobaufbau', title: 'Zwei Wochen Aufbau', text: 'Der Aufbau des Toboggan dauert etwa zwei Wochen – und die Pflege des alten Holzturms ist viel Arbeit.' },
  { id: 'tr1908', title: 'Teufelsrad seit 1908', text: 'Der Schausteller Carl Gabriel brachte das Teufelsrad 1908 auf die Wiesn. Es gab Kopien – aber nur das Original hat überlebt.' },
  { id: 'trfeldl', title: 'Familie Feldl', text: 'Ende der 1940er-Jahre übernahm Rudolf Feldl das Teufelsrad. Er führte den Rekommandeur ein, der die Fahrten mit frechen Sprüchen begleitet. Seine Frau Betty führte es nach 1970 bis 2002 weiter.' },
  { id: 'trball', title: 'Ball und Lasso', text: 'Wer auf dem Teufelsrad zu lange sitzen bleibt, wird mit einem großen Ball am Seil oder mit dem Lasso heruntergeholt!' },
  { id: 'trruf', title: 'Wer darf fahren?', text: 'Der Rekommandeur ruft auf, wer fahren darf – zum Beispiel: „Es fahren alle Kinder zwischen 8 und 14 Jahren!“' },
  { id: 'trvalentin', title: 'Berühmte Fans', text: 'Die Münchner Komiker Karl Valentin und Liesl Karlstadt waren große Fans des Teufelsrads.' },
  { id: 'krino', title: 'Die Krinoline', text: 'Die Krinoline dreht seit über 100 Jahren ihre Runden – mit einer echten Blaskapelle in der Mitte. Ihr Name kommt vom Reifrock. Früher wurde sie von Hand angetrieben.' },
  { id: 'schichtl', title: 'Der Schichtl', text: 'Der Schichtl ist seit 1869 auf der Wiesn. Seit 1872 wird dort mit einer Guillotine „geköpft“ – natürlich nur ein Zaubertrick!' },
  { id: 'looping', title: 'Olympia-Looping', text: 'Der Olympia-Looping hat fünf Loopings wie die Olympischen Ringe und rund 1.250 Meter Strecke. Er ist die größte transportable Achterbahn der Welt – seit 1989 auf der Wiesn.' },
  { id: 'riesenrad', title: 'Das Riesenrad', text: 'Von oben aus dem Riesenrad (rund 50 Meter hoch) sieht man die ganze Theresienwiese und die Stadt München.' },
  { id: 'service', title: 'Verlaufen?', text: 'Wer seine Familie verliert: Treffpunkt ist das Servicezentrum hinter dem Schottenhamel-Festzelt.' },
  { id: '20uhr', title: 'Die 20-Uhr-Regel', text: 'Nach 20 Uhr dürfen Kinder und Jugendliche unter 16 nur mit Erwachsenen auf der Festwiese bleiben.' },
  { id: 'familie', title: 'Familientag', text: 'Am Familientag (dienstags) sind viele Fahrgeschäfte bis 19 Uhr günstiger. Den Rabatt bestimmt jeder Betrieb selbst.' },
  { id: 'oide', title: 'Die Oide Wiesn', text: 'Auf der Oidn Wiesn gibt es historische Fahrgeschäfte. Kinder und Jugendliche bis 14 Jahre haben dort freien Eintritt.' },
  { id: 'bavaria', title: 'Die Bavaria', text: 'Die Bavaria ist eine riesige Bronzestatue mit einem Löwen. Sie steht vor der Ruhmeshalle – und man kann innen bis in ihren Kopf hinaufsteigen!' },
  { id: 'einzug', title: 'Einzug der Wiesnwirte', text: 'Zur Eröffnung ziehen Wirte, Bedienungen, Schausteller und Brauereien mit prächtig geschmückten Pferdegespannen zur Theresienwiese – angeführt vom Münchner Kindl.' },
  { id: 'boeller', title: 'Böllerschießen', text: 'Zum Abschluss der Wiesn lassen die Böllerschützen vor der Bavaria die historischen Böller krachen.' },
  { id: 'ozapft', title: 'O’zapft is!', text: 'Am ersten Wiesn-Samstag um 12 Uhr zapft der Oberbürgermeister im Schottenhamel das erste Fass an und ruft: „O’zapft is!“' },
  { id: 'strassen', title: 'Die Straßen der Wiesn', text: 'Die Wirtsbudenstraße und die Schaustellerstraße führen von Norden nach Süden. Dazwischen liegen die nummerierten Querstraßen 1 bis 5.' },
  { id: 'schmankerl', title: 'Wiesn-Schmankerl', text: 'Typisch Wiesn: Brezn, Steckerlfisch, gebrannte Mandeln, Zuckerwatte, Schokofrüchte und Lebkuchenherzen mit bayerischen Sprüchen.' },
  { id: 'buden', title: 'Über 100 Attraktionen', text: 'Auf der Wiesn gibt es mehr als 100 Fahrgeschäfte und Buden. Der Eintritt aufs Festgelände ist kostenlos.' },
];
G.HEART_FACTS = ['f1810', 'strassen', 'tob1908', 'tobaufbau', 'looping', 'bavaria', 'boeller', 'einzug', 'familie', 'buden', 'service', '20uhr', 'schmankerl', 'ozapft', 'oide', 'krino', 'riesenrad', 'trvalentin'];

G.missions = (function () {
  const defs = {};
  const order = [];
  let active = null, step = 0, sd = {};
  const done = {};

  function def(id, o) { o.id = id; defs[id] = o; order.push(id); }

  // --- Schritt-Bausteine ---
  const dlg = (lines, after) => ({
    start(d) { G.ui.dialog(typeof lines === 'function' ? lines() : lines, () => { d.ok = true; if (after) after(d); }); },
    update(dt, d) { return d.ok; },
  });
  const goTo = (text, pos, r) => ({
    text, target: () => (typeof pos === 'function' ? pos() : pos),
    update() { const p = typeof pos === 'function' ? pos() : pos; return dist(G.player.x, G.player.y, p.x, p.y) < (r || 50); },
  });
  const cond = (text, fn, target) => ({ text, target, update: fn });
  const mini = (name, opts, onRes) => ({
    start(d) { d.res = null; d.tries = 0; G.game.startMinigame(name, Object.assign({ assist: 0 }, opts), (res) => { d.res = res; }); },
    update(dt, d) {
      if (!d.res) return false;
      if (d.res.win) { if (onRes) onRes(d.res); return true; }
      if (d.res.quit) return 'fail';
      // nochmal versuchen
      d.res = null; d.tries++;
      G.game.startMinigame(name, Object.assign({}, opts, { assist: d.tries }), (res) => { d.res = res; });
      return false;
    },
  });

  function giverLook(o) { const l = G.ent.randomLook('adult'); return Object.assign(l, o); }

  // ================= MISSIONEN =================
  def('servus', {
    title: 'Servus, Wiesn!', letter: 'O', color: '#ff6bd5',
    giver: { name: 'Oma Resi', x: 2200, y: 215, look: giverLook({ female: true, dirndl: '#6a2a4a', apron: '#f2d0e0', hair: '#c8c8c8', kind: 'oma', braids: false }) },
    req: () => true,
    steps: [
      dlg(() => [
        { who: 'Oma Resi', text: 'Servus, ' + G.player.name + '! Mei, schau dir des an – die Wiesn!' },
        { who: 'Oma Resi', text: 'Weißt du, die erste Wiesn war 1810. Da hat der Kronprinz Ludwig seine Therese geheiratet – drum heißt des hier Theresienwiese.' },
        { who: 'Oma Resi', text: 'Und wennst di verlierst: Treffpunkt is des Servicezentrum hinterm Schottenhamel. Merk dir des!' },
        { who: 'Oma Resi', text: 'Hier hast 20 Taler. Kauf dir erst amoi a Brezn – a Wiesn ohne Brezn geht gar ned!' },
      ], () => { G.game.addTaler(20); G.game.unlockFact('f1810'); G.game.unlockFact('service'); }),
      cond('Kauf dir eine Brezn am Brezn-Standl.', () => G.flags.brezn, () => G.world.places.brezn),
      dlg([{ who: 'Oma Resi', text: 'Guad, gell? So, und jetzt schnapp dir an Roller – damit bist schneller unterwegs. Zum Aufsteigen [E] drücken!' }]),
      cond('Schnapp dir einen Roller (Roller-Symbol auf der Karte) und steig mit [E] auf.', () => G.player.vehicle && G.player.vehicle.type === 'roller', () => G.game.nearestRoller()),
      goTo('Fahr zum TOBOGGAN an der Schaustellerstraße.', () => G.world.places.toboggan, 70),
      dlg(() => [
        { who: 'Toboggan-Toni', text: 'Ja servus! I bin da Toni vom Toboggan. Steig ab vom Roller und red mit mir, wennst magst – dann zeig i dir, wie ma da rauf kommt!' },
      ]),
    ],
    reward: { taler: 5, gaudi: 10 },
  });

  def('toboggan', {
    title: 'Der Toboggan', letter: 'T', color: '#ffb02e',
    giver: { name: 'Toboggan-Toni', x: 1100, y: 775, look: giverLook({ female: false, shirt: '#c0392b', hat: true, hair: '#3a2412' }) },
    req: () => done.servus,
    steps: [
      dlg(() => [
        { who: 'Toboggan-Toni', text: 'Den Toboggan gibt’s auf der Wiesn scho seit 1933! Meine Familie hat ihn scho 1920 kauft – wahrscheinlich aus Nordamerika.' },
        { who: 'Toboggan-Toni', text: '„Toboggan“ is a Wort von de Algonkin in Kanada. Des hoaßt: leichter Holzschlitten ohne Kufen.' },
        { who: 'Toboggan-Toni', text: 'Des Schwierigste is des Förderband – acht Meter lang! Do hat’s scho an jeden higlegt. Und d’Leit auf de Bankerl schaun zua und lacha si schief.' },
        { who: 'Ferdl', text: 'Pfff! Du kommst doch nie übers Band! I bin da Ferdl – i hab’s scho hundertmal gschafft!' },
        { who: 'Toboggan-Toni', text: 'Lass di ned ärgern. Gewicht nach vorn, kleine Schritt – und wennst fallst, is a ned schlimm. Auf geht’s!' },
      ], () => { G.game.unlockFact('tob1933'); G.game.unlockFact('tobname'); G.game.unlockFact('tobband'); }),
      mini('toboggan', {}, (res) => { sd.tobRes = res; }),
      dlg(() => [
        { who: 'Toboggan-Toni', text: sd.tobRes && sd.tobRes.falls === 0 ? 'Wahnsinn – ohne an einzigen Sturz! Des schaffen ned amoi die Großen!' : (sd.tobRes && sd.tobRes.crawl ? 'Auf allen Vieren übers Band – des zählt genauso! So machen’s viele.' : 'Bravo! Du bist a echter Toboggan-Profi!') },
        { who: 'Toboggan-Toni', text: 'Übrigens: Früher war mei Turm zehn Meter höher und hatte zwei Rutschen. Aber so is er leichter aufzubauen.' },
        { who: 'Ferdl', text: 'Hmpf. Glück ghabt. Aber am TEUFELSRAD, da hast du koa Chance gegen mi!' },
      ], () => G.game.unlockFact('tobturm')),
    ],
    reward: { taler: () => (sd.tobRes ? sd.tobRes.reward : 15), gaudi: 25 },
  });

  def('teufelsrad', {
    title: 'Das Teufelsrad', letter: 'R', color: '#ff4040',
    giver: { name: 'Rekommandeur Sepp', x: 830, y: 780, look: giverLook({ female: false, shirt: '#2f5a2a', hat: true, hair: '#6a4022' }) },
    req: () => done.toboggan,
    steps: [
      dlg(() => [
        { who: 'Rekommandeur Sepp', text: 'Grüß di! I bin da Rekommandeur vom Teufelsrad. I sag an, wer fahrn derf – und i mach de Sprüch!' },
        { who: 'Rekommandeur Sepp', text: 'Des Teufelsrad hat da Carl Gabriel 1908 auf d’Wiesn bracht. Es gab Kopien – aber nur des Original hat überlebt!' },
        { who: 'Rekommandeur Sepp', text: 'Ende der 1940er hat’s da Rudolf Feldl übernommen. Und sogar da Karl Valentin und d’Liesl Karlstadt waren große Fans!' },
        { who: 'Rekommandeur Sepp', text: 'De Regeln: Wer am längsten auf da Scheib’n sitzen bleibt, gewinnt. Und wer zu lang sitzt, kriagt an Ball – oder mei Lasso!' },
        { who: 'Ferdl', text: 'Jetzt zeig i dir, wer da Chef is am Teufelsrad!' },
      ], () => { G.game.unlockFact('tr1908'); G.game.unlockFact('trfeldl'); G.game.unlockFact('trball'); G.game.unlockFact('trruf'); }),
      mini('teufelsrad', { hard: false }),
      dlg([
        { who: 'Ferdl', text: 'Wos?! Du hast mi gschlagen? … Na guad. Respekt. Du bist gar ned so schlecht.' },
        { who: 'Rekommandeur Sepp', text: 'Bravo! So a Gaudi hab i scho lang nimmer g’habt!' },
      ]),
    ],
    reward: { taler: 35, gaudi: 30 },
  });

  def('kurier', {
    title: 'Lebkuchen-Kurier', letter: 'L', color: '#ff8ac0',
    giver: { name: 'Frau Zuckerl', x: 2110, y: 1000, look: giverLook({ female: true, dirndl: '#e84d8a', apron: '#fff4c0', hair: '#a05a2a' }) },
    req: () => done.servus,
    steps: [
      dlg([
        { who: 'Frau Zuckerl', text: 'Ach, guad dass du da bist! I muss drei Lebkuchenherzen ausliefern, aber i kann ned weg vom Standl.' },
        { who: 'Frau Zuckerl', text: 'Nimm an Roller, dann bist schneller. Du hast drei Minuten – auf geht’s!' },
      ], () => { G.player.carry = 'heart'; sd.timer = 180; sd.left = 3; G.game.unlockFact('schmankerl'); }),
      {
        text: 'Liefere die Lebkuchenherzen aus!', timer: true,
        targets: [
          { x: 400, y: 1150, name: 'Opa Hias an der Bavaria', heart: 'Für mein Spatzl', look: { female: false, hair: '#c8c8c8', hat: true, shirt: '#2f6db5' }, thanks: 'Mei, „Für mein Spatzl“ – des is für d’Oma! Vergelt’s Gott!' },
          { x: 2600, y: 1105, name: 'Bedienung Kathi am Hacker-Zelt', heart: 'Wiesn-Gaudi', look: { female: true, dirndl: '#1a3a5a', apron: '#fff' }, thanks: 'Für mi? Des häng i mir glei um! Merci!' },
          { x: 1080, y: 445, name: 'Herr Huber am Riesenrad', heart: 'I mog di', look: { female: false, hat: false, shirt: '#8a5ad6', hair: '#3a2412' }, thanks: '„I mog di“ – des schenk i meiner Frau oben im Riesenrad. Danke!' },
        ],
        start(d) { d.got = [false, false, false]; },
        target(d) { const s = this; const i = d.got.findIndex(g => !g); return i < 0 ? null : s.targets[i]; },
        update(dt, d) {
          sd.timer -= dt;
          if (sd.timer <= 0) return 'fail';
          for (let i = 0; i < 3; i++) {
            if (d.got[i]) continue;
            const tg = this.targets[i];
            if (dist(G.player.x, G.player.y, tg.x, tg.y) < 45) {
              d.got[i] = true; sd.left--; G.audio.sfx.coin();
              G.ui.toast(tg.name.split(' ').slice(0, 2).join(' ') + ': „' + tg.thanks + '“', 4);
            }
          }
          return d.got.every(Boolean);
        },
        anyTargets: true,
      },
      dlg([{ who: 'Frau Zuckerl', text: 'Alle drei ausgeliefert? Du bist a Schatz! Do, nimm a Herz für di selber – zum Umhängen!' }], () => { G.player.carry = null; G.player.wearsHeart = true; }),
    ],
    reward: { taler: 25, gaudi: 20 },
    onFail() { G.player.carry = null; },
  });

  def('dackel', {
    title: 'Waldi ist weg!', letter: 'W', color: '#7ad0ff',
    giver: { name: 'Frau Brandl', x: 1820, y: 1775, look: giverLook({ female: true, dirndl: '#2f8a4a', apron: '#ffffff', hair: '#d8b060', hat: false }) },
    req: () => done.toboggan,
    steps: [
      dlg([
        { who: 'Frau Brandl', text: 'Mei, mei, mei! Mein Dackel Waldi is ausbüxt! Er hat an Steckerlfisch g’rochen und is davon!' },
        { who: 'Frau Brandl', text: 'Bitte fang ihn ein! Aber Obacht – der is flink. Lauf mit [Shift] oder nimm an Roller!' },
      ], () => G.game.spawnDog()),
      cond('Fang den Dackel Waldi!', () => G.dog && G.dog.caught, () => G.dog),
      goTo('Bring Waldi zurück zu Frau Brandl bei der Fischer-Vroni.', { x: 1820, y: 1775 }, 50),
      dlg([{ who: 'Frau Brandl', text: 'Waldi! Da bist ja wieder! Tausend Dank – du bist a echter Held!' }], () => { G.dog = null; }),
    ],
    reward: { taler: 20, gaudi: 20 },
    onFail() { G.dog = null; },
  });

  def('finale', {
    title: 'Die Meisterrunde', letter: 'F', color: '#ffd84a',
    giver: { name: 'Ferdl', x: 930, y: 790, look: giverLook({ kind: 'kid', female: false, shirt: '#d62f3a', hair: '#d8b060', hat: false }), size: 0.78 },
    req: () => done.teufelsrad && done.kurier && done.dackel,
    steps: [
      dlg(() => [
        { who: 'Ferdl', text: 'Du, ' + G.player.name + ' … i hab’s ma überlegt. Du bist echt guad. Magst mit mir die MEISTERRUNDE am Teufelsrad fahrn?' },
        { who: 'Rekommandeur Sepp', text: 'Meisterrunde! Schneller, mehr Ball, mehr Lasso! Des is nur was für de ganz Harten!' },
      ]),
      mini('teufelsrad', { hard: true }),
      dlg([
        { who: 'Rekommandeur Sepp', text: 'Meine Damen und Herren – a neuer Teufelsrad-Meister! Applaus!' },
        { who: 'Ferdl', text: 'Wahnsinn! Kommst mit zum Riesenrad? D’Oma wartet scho – und gleich geht d’Sonn unter!' },
      ], () => { G.game.setClock(1140); }),
      goTo('Triff Oma und Ferdl am RIESENRAD.', () => G.world.places.riesenrad, 60),
      dlg(() => [
        { who: 'Oma Resi', text: 'Da bist ja, ' + G.player.name + '! I hab g’hört, du bist jetzt a Wiesn-Legende!' },
        { who: 'Oma Resi', text: 'Komm, mir fahrn no a Runde Riesenrad. Von oben schaut ma über die ganze Theresienwiese bis zu de Berg’!' },
      ]),
      { start(d) { d.ok = false; G.game.startCredits(() => { d.ok = true; }); }, update(dt, d) { return d.ok; } },
    ],
    reward: { taler: 60, gaudi: 50 },
  });

  // ================= Steuerung =================
  function available() { return order.filter(id => !done[id] && (!active || active.id !== id) && defs[id].req()); }

  function begin(id) {
    active = defs[id]; step = 0; sd = {};
    G.ui.missionTitle(active.title);
    enterStep();
  }
  function enterStep() {
    const s = active.steps[step];
    sd.d = {};
    if (s.start) s.start.call(s, sd.d);
    if (s.text) G.ui.objective(s.text);
  }
  function update(dt) {
    if (!active) return;
    const s = active.steps[step];
    const r = s.update ? s.update.call(s, dt, sd.d) : true;
    if (r === 'fail') return fail();
    if (r) {
      step++;
      if (step >= active.steps.length) return complete();
      enterStep();
    }
  }
  function complete() {
    const m = active; active = null;
    done[m.id] = true;
    const taler = typeof m.reward.taler === 'function' ? m.reward.taler() : m.reward.taler;
    G.game.addTaler(taler); G.game.addGaudi(m.reward.gaudi);
    G.ui.objective('');
    G.ui.missionPassed(m.title, taler, m.reward.gaudi);
    G.game.save();
    const next = available();
    if (next.length && m.id !== 'finale') setTimeout(() => G.ui.toast('Neue Aufgabe auf der Karte: ' + next.map(n => '„' + defs[n].title + '“').join(', '), 5), 4500);
  }
  function fail() {
    const m = active; active = null;
    if (m.onFail) m.onFail();
    G.ui.objective('');
    G.ui.missionFailed(m.title);
  }
  function currentTarget() {
    if (!active) return null;
    const s = active.steps[step];
    if (!s.target) return null;
    const t = typeof s.target === 'function' ? s.target.call(s, sd.d) : s.target;
    return t || null;
  }
  function currentStep() { return active ? active.steps[step] : null; }

  return {
    defs, order, done, available, begin, update, currentTarget, currentStep,
    get active() { return active; }, get sd() { return sd; },
    abort() { if (active) fail(); },
    reset() { for (const k in done) delete done[k]; active = null; },
  };
})();
