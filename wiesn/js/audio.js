'use strict';
// Prozedurale Wiesn-Musik (Blasmusik), Geräusche und Sprachausgabe – alles mit WebAudio, ohne Dateien.
G.audio = (function () {
  let ac = null, master, musicGain, sfxGain, ambGain, ambFilter, noiseBuf = null;
  let stationIdx = 0, nextTime = 0, slot = 0, song = null, timer = null;
  let musicVol = 1, speechOn = true;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const STATIONS = [
    { name: 'Radio Blaskapelle', bpm: 122, meter: 2, key: 58, seed: 7 },
    { name: 'Wiesn-Welle 103,3 – Schunkel-Hits', bpm: 162, meter: 3, key: 53, seed: 23 },
    { name: 'Krinoline Live', bpm: 112, meter: 2, key: 51, seed: 42, march: true },
    { name: 'Radio aus', off: true },
  ];

  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  const deg2semi = (d) => Math.floor(d / 7) * 12 + MAJOR[((d % 7) + 7) % 7];
  const CHORDS = { I: [0, 2, 4], IV: [3, 5, 7], V: [4, 6, 8], ii: [1, 3, 5] };

  function buildSong(st) {
    const rnd = mulberry32(st.seed);
    const prog = st.meter === 3
      ? ['I', 'I', 'V', 'V', 'V', 'V', 'I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'V', 'I', 'I']
      : ['I', 'V', 'V', 'I', 'I', 'V', 'V', 'I', 'IV', 'IV', 'I', 'I', 'V', 'V', 'I', 'I'];
    const per = st.meter * 2; // Achtel pro Takt
    const phrase = [];
    let d = 7 + 2;
    for (let bar = 0; bar < 8; bar++) {
      const ch = CHORDS[prog[bar]];
      for (let s = 0; s < per; s++) {
        let note = null;
        const strong = s % 2 === 0;
        if (strong || rnd() < 0.55) {
          if (strong) {
            // Akkordton in der Nähe
            let best = d, bd = 99;
            for (const c of ch) for (const o of [7, 14]) { const cand = c + o; const dd = Math.abs(cand - d) + rnd() * 2; if (dd < bd) { bd = dd; best = cand; } }
            d = best;
          } else d += rnd() < 0.5 ? 1 : -1;
          d = clamp(d, 5, 16);
          note = d;
        }
        phrase.push(note);
      }
    }
    // Schluss auf dem Grundton
    phrase[phrase.length - per] = 7; for (let i = 1; i < per; i++) phrase[phrase.length - per + i] = null;
    const melody = phrase.concat(phrase.map((n, i) => (i > phrase.length / 2 && n !== null ? n + (rnd() < 0.3 ? 2 : 0) : n)));
    return { prog, melody, per };
  }

  function env(g, t, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function tone(freq, t, dur, type, peak, cutoff, dest, opt) {
    opt = opt || {};
    const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (opt.slide) o.frequency.exponentialRampToValueAtTime(freq * opt.slide, t + dur);
    const f = ac.createBiquadFilter(); f.type = opt.ftype || 'lowpass'; f.frequency.value = cutoff; if (opt.q) f.Q.value = opt.q;
    const g = ac.createGain();
    o.connect(f); f.connect(g); g.connect(dest || musicGain);
    env(g, t, opt.a || 0.01, peak, dur);
    if (opt.vib) {
      const l = ac.createOscillator(); l.frequency.value = 5.5; const lg = ac.createGain(); lg.gain.value = opt.vib;
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(t, dur, peak, cutoff, type, dest, q) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type || 'highpass'; f.frequency.value = cutoff; if (q) f.Q.value = q;
    const g = ac.createGain();
    s.connect(f); f.connect(g); g.connect(dest || musicGain);
    env(g, t, 0.005, peak, dur);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }

  function scheduleSlot(t) {
    const st = STATIONS[stationIdx];
    if (st.off || !song) return;
    const per = song.per;
    const bar = Math.floor(slot / per) % song.prog.length;
    const s = slot % per;
    const root = st.key - 12;
    const ch = CHORDS[song.prog[bar]];
    const eighth = 60 / st.bpm / 2;
    // Tuba: Grundton und Quinte
    if (s === 0) tone(mtof(root + deg2semi(ch[0]) - 12), t, eighth * 1.8, 'triangle', 0.5, 600);
    if (st.meter === 2 && s === 2) tone(mtof(root + deg2semi(ch[2]) - 12 - 12 * (ch[2] >= 7 ? 1 : 0)), t, eighth * 1.8, 'triangle', 0.45, 600);
    // „Pah“: Nachschlag-Akkord
    const pah = st.meter === 3 ? (s === 2 || s === 4) : (s === 1 || s === 3);
    if (pah) for (const c of ch) tone(mtof(root + 12 + deg2semi(c)), t, eighth * 0.8, 'square', 0.05, 1400);
    // Schlagwerk
    if (s === 0) tone(90, t, 0.18, 'sine', 0.5, 300, musicGain, { slide: 0.5 });
    if (pah && (st.meter === 2 ? s === 3 : s === 4)) noise(t, 0.12, 0.12, 2000);
    if (st.march && s === 3 && bar % 4 === 3) { noise(t + eighth * 0.5, 0.08, 0.08, 2500); }
    // Melodie (Trompete/Klarinette)
    const mi = slot % song.melody.length;
    const n = song.melody[mi];
    if (n !== null) {
      let len = 1; while (len < 3 && song.melody[(mi + len) % song.melody.length] === null) len++;
      const f = mtof(st.key + 12 + deg2semi(n));
      tone(f, t, eighth * len * 0.95, 'sawtooth', 0.11, st.march ? 2600 : 1900, musicGain, { vib: 4, a: 0.02 });
      tone(f * 2, t, eighth * len * 0.9, 'square', 0.025, 3000);
    }
  }

  function tick() {
    if (!ac) return;
    const st = STATIONS[stationIdx];
    if (st.off) { nextTime = ac.currentTime + 0.05; return; }
    const eighth = 60 / st.bpm / 2;
    while (nextTime < ac.currentTime + 0.15) {
      scheduleSlot(nextTime);
      nextTime += eighth;
      slot++;
    }
  }

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.8;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 6;
    master.connect(comp); comp.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.26; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = i % 2 ? w : last * 3.5; }
    // Stimmengewirr der Menge
    const amb = ac.createBufferSource(); amb.buffer = noiseBuf; amb.loop = true;
    ambFilter = ac.createBiquadFilter(); ambFilter.type = 'bandpass'; ambFilter.frequency.value = 480; ambFilter.Q.value = 0.8;
    ambGain = ac.createGain(); ambGain.gain.value = 0.05;
    amb.connect(ambFilter); ambFilter.connect(ambGain); ambGain.connect(master); amb.start();
    song = buildSong(STATIONS[stationIdx]);
    nextTime = ac.currentTime + 0.1;
    timer = setInterval(tick, 25);
  }

  function setStation(i) {
    stationIdx = ((i % STATIONS.length) + STATIONS.length) % STATIONS.length;
    const st = STATIONS[stationIdx];
    if (!st.off) song = buildSong(st);
    slot = 0;
    if (ac) nextTime = ac.currentTime + 0.1;
    return st.name;
  }

  const sfx = {
    blip(f) { if (!ac) return; tone(f || 880, ac.currentTime, 0.08, 'square', 0.15, 3000, sfxGain); },
    coin() { if (!ac) return; const t = ac.currentTime; tone(988, t, 0.08, 'square', 0.15, 4000, sfxGain); tone(1319, t + 0.08, 0.25, 'square', 0.15, 4000, sfxGain); },
    bump() { if (!ac) return; const t = ac.currentTime; tone(140, t, 0.2, 'sine', 0.6, 400, sfxGain, { slide: 0.5 }); noise(t, 0.08, 0.2, 800, 'lowpass', sfxGain); },
    boing() { if (!ac) return; tone(220, ac.currentTime, 0.4, 'triangle', 0.4, 2000, sfxGain, { slide: 3 }); },
    whoosh(d) { if (!ac) return; const t = ac.currentTime; const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3000, t + (d || 0.6)); const g = ac.createGain(); env(g, t, 0.1, 0.35, d || 0.6); s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + (d || 0.6) + 0.1); },
    laugh(n) {
      if (!ac) return; const t0 = ac.currentTime;
      const voices = n || 4;
      for (let v = 0; v < voices; v++) {
        const base = rand(170, 380), off = rand(0, 0.25), rate = rand(0.11, 0.16);
        for (let i = 0; i < 5; i++) {
          const t = t0 + off + i * rate;
          tone(base * (1 - i * 0.04), t, rate * 0.8, 'sawtooth', 0.22, rand(800, 1300), sfxGain, { ftype: 'bandpass', q: 2, a: 0.015 });
        }
      }
    },
    cheer() { if (!ac) return; const t = ac.currentTime; const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.6; const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 2); s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + 2.1); for (let i = 0; i < 6; i++) tone(rand(1500, 2600), t + rand(0, 0.8), 0.25, 'sine', 0.05, 5000, sfxGain, { slide: 1.2 }); },
    jingle() { if (!ac) return; const t = ac.currentTime; const notes = [67, 72, 76, 79, 84]; notes.forEach((n, i) => { tone(mtof(n), t + i * 0.11, 0.5, 'sawtooth', 0.12, 2500, sfxGain, { vib: 5 }); tone(mtof(n - 12), t + i * 0.11, 0.5, 'triangle', 0.15, 900, sfxGain); }); tone(mtof(48), t + 0.55, 1.2, 'triangle', 0.3, 700, sfxGain); [72, 76, 79].forEach(n => tone(mtof(n), t + 0.55, 1.2, 'sawtooth', 0.07, 2200, sfxGain, { vib: 6 })); },
    busted() { if (!ac) return; const t = ac.currentTime; [64, 61, 58, 52].forEach((n, i) => tone(mtof(n), t + i * 0.22, 0.4, 'sawtooth', 0.12, 1500, sfxGain, { vib: 3 })); },
    step() { if (!ac) return; noise(ac.currentTime, 0.04, 0.05, 1200, 'bandpass', sfxGain, 2); },
    boeller() { if (!ac) return; const t = ac.currentTime; noise(t, 1.2, 0.45, 300, 'lowpass', sfxGain); tone(60, t, 0.6, 'sine', 0.5, 200, sfxGain, { slide: 0.4 }); },
    bell() { if (!ac) return; const t = ac.currentTime; tone(1568, t, 0.6, 'sine', 0.15, 6000, sfxGain); tone(2093, t, 0.4, 'sine', 0.08, 6000, sfxGain); },
    honk() { if (!ac) return; const t = ac.currentTime; tone(440, t, 0.25, 'square', 0.08, 1200, sfxGain); tone(554, t, 0.25, 'square', 0.08, 1200, sfxGain); },
  };

  let voice = null;
  function pickVoice() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /de(-|_)?DE/i.test(v.lang)) || vs.find(v => /^de/i.test(v.lang)) || null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function say(text, pitch) {
    if (!speechOn || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[„“"]/g, ''));
      u.lang = 'de-DE'; if (voice) u.voice = voice;
      u.rate = 1.08; u.pitch = pitch || 0.9; u.volume = 0.9;
      speechSynthesis.speak(u);
    } catch (e) { /* Sprachausgabe nicht verfügbar */ }
  }

  return {
    init, sfx, say,
    get _ac() { return ac; }, get _master() { return master; },
    STATIONS,
    get station() { return stationIdx; },
    get stationName() { return STATIONS[stationIdx].name; },
    setStation,
    nextStation() { return setStation(stationIdx + 1); },
    setAmbience(v) { if (ambGain) ambGain.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    setMusicVolume(v) { musicVol = v; if (musicGain) musicGain.gain.setTargetAtTime(0.26 * v, ac.currentTime, 0.2); },
    get musicVolume() { return musicVol; },
    get speech() { return speechOn; },
    set speech(v) { speechOn = v; if (!v && window.speechSynthesis) speechSynthesis.cancel(); },
  };
})();
