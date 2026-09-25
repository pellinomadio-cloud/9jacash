// Lightweight Web Audio API synthesizer for authentic Casino and Aviator sound effects
// Does not rely on external audio files, works completely offline and instantly across all browsers and devices

class CasinoAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  
  // Harmonious multi-layered flight synth nodes
  private oscRoot: OscillatorNode | null = null;
  private oscFifth: OscillatorNode | null = null;
  private oscShimmer: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private masterFlightGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private lastClickTime: number = 0;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Universal button click sound across all of chix9ja app
  playButtonClick() {
    if (!this.enabled) return;
    const now = Date.now();
    // Debounce 30ms to prevent double-clicks on rapid event bubbles
    if (now - this.lastClickTime < 30) return;
    this.lastClickTime = now;

    try {
      this.init();
      if (!this.ctx) return;

      const audioNow = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Tactile luxury haptic click: crisp micro-pop (1100Hz dropping to 400Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1150, audioNow);
      osc.frequency.exponentialRampToValueAtTime(320, audioNow + 0.035);

      gain.gain.setValueAtTime(0.12, audioNow);
      gain.gain.exponentialRampToValueAtTime(0.001, audioNow + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(audioNow);
      osc.stop(audioNow + 0.045);
    } catch {
      // ignore audio context restrictions
    }
  }

  // Casino chip placed sound
  playChip() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  // Aviator countdown tick
  playTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  // Beautiful Harmonious Moving Plane Sound
  // A melodious, rich, celestial synth pad that gracefully ascends as the plane climbs!
  startEngine(basePitch: number = 220) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.stopEngine();

      const now = this.ctx.currentTime;

      // Master flight gain
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.08, now + 0.2); // Smooth fade-in

      // Low-pass warm filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(2.5, now);

      // Layer 1: Warm root tone (Sine wave)
      const root = this.ctx.createOscillator();
      root.type = 'sine';
      root.frequency.setValueAtTime(basePitch, now);

      // Layer 2: Perfect 5th harmonic (Mellow triangle wave, 1.5x root)
      const fifth = this.ctx.createOscillator();
      fifth.type = 'triangle';
      fifth.frequency.setValueAtTime(basePitch * 1.5, now);

      // Layer 3: Celestial Shimmer Octave (Soft sine wave, 2x root)
      const shimmer = this.ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(basePitch * 2, now);

      // LFO Tremolo: 4.2Hz gentle shimmer breathing effect
      const lfo = this.ctx.createOscillator();
      const lfoDepth = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.2, now);
      lfoDepth.gain.setValueAtTime(0.015, now);
      lfo.connect(lfoDepth);
      lfoDepth.connect(masterGain.gain);

      // Connect layers through filter to master gain
      root.connect(filter);
      fifth.connect(filter);
      shimmer.connect(filter);

      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      root.start(now);
      fifth.start(now);
      shimmer.start(now);
      lfo.start(now);

      this.oscRoot = root;
      this.oscFifth = fifth;
      this.oscShimmer = shimmer;
      this.filterNode = filter;
      this.masterFlightGain = masterGain;
      this.lfoOsc = lfo;
      this.lfoGain = lfoDepth;
    } catch {
      // ignore
    }
  }

  // Smoothly update harmonious pitch as the plane soars higher
  updateEnginePitch(multiplier: number) {
    if (!this.enabled || !this.ctx || !this.oscRoot || !this.oscFifth || !this.oscShimmer) return;
    try {
      const now = this.ctx.currentTime;
      // Beautiful harmonic curve from A3 (220Hz) up to E5 (~660Hz)
      const rootPitch = Math.min(680, 220 + Math.pow(Math.max(1, multiplier) - 1, 0.72) * 85);
      const fifthPitch = rootPitch * 1.5;
      const shimmerPitch = rootPitch * 2.0;

      // Smooth audio parameter transitions
      this.oscRoot.frequency.setTargetAtTime(rootPitch, now, 0.12);
      this.oscFifth.frequency.setTargetAtTime(fifthPitch, now, 0.12);
      this.oscShimmer.frequency.setTargetAtTime(shimmerPitch, now, 0.12);

      // Filter opens up slightly with higher multiplier for extra brilliance
      if (this.filterNode) {
        const filterCutoff = Math.min(2400, 950 + (multiplier - 1) * 220);
        this.filterNode.frequency.setTargetAtTime(filterCutoff, now, 0.15);
      }
    } catch {
      // ignore
    }
  }

  // Fade out and stop the flight synthesizer smoothly
  stopEngine() {
    try {
      if (this.masterFlightGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterFlightGain.gain.cancelScheduledValues(now);
        this.masterFlightGain.gain.setValueAtTime(this.masterFlightGain.gain.value, now);
        this.masterFlightGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      }

      const root = this.oscRoot;
      const fifth = this.oscFifth;
      const shimmer = this.oscShimmer;
      const lfo = this.lfoOsc;

      setTimeout(() => {
        try {
          root?.stop();
          fifth?.stop();
          shimmer?.stop();
          lfo?.stop();
          root?.disconnect();
          fifth?.disconnect();
          shimmer?.disconnect();
          lfo?.disconnect();
        } catch {}
      }, 150);

      this.oscRoot = null;
      this.oscFifth = null;
      this.oscShimmer = null;
      this.filterNode = null;
      this.masterFlightGain = null;
      this.lfoOsc = null;
      this.lfoGain = null;
    } catch {
      // ignore
    }
  }

  // Cashout / Win celebration chime (Ascending golden arpeggio)
  playCashout() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Rich golden chime arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), B5 (988Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch {
      // ignore
    }
  }

  // Authentic wheel peg flapper click
  playWheelPeg() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.022);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.028);
    } catch {
      // ignore
    }
  }

  // Major Jackpot fanfare celebration
  playJackpotWin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Grand triumphant chords: C5, G5, C6, E6, G6
      const fanfare = [
        { f: 523.25, d: 0.15, delay: 0 },
        { f: 659.25, d: 0.15, delay: 0.12 },
        { f: 783.99, d: 0.15, delay: 0.24 },
        { f: 1046.50, d: 0.4, delay: 0.38 },
        { f: 1318.51, d: 0.6, delay: 0.52 },
      ];
      fanfare.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.delay);

        gain.gain.setValueAtTime(0, now + note.delay);
        gain.gain.linearRampToValueAtTime(0.24, now + note.delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + note.delay);
        osc.stop(now + note.delay + note.d);
      });
    } catch {
      // ignore
    }
  }

  // Crash / Flew Away sound
  playCrash() {
    if (!this.enabled) return;
    this.stopEngine();
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.38);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // ignore
    }
  }

  // --- AUTHENTIC CASINO SOUND EFFECTS ---

  // 1. Classic Vegas Cash Register "Ka-Ching!"
  playKaChing() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Mechanical latch click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(350, now);
      clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.05);

      // Dual-tone crystalline bell ring
      const bellFreqs = [2093, 2489, 4186]; // C7, D#7, C8 high harmonic shimmer
      bellFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq, now + 0.02);

        bellGain.gain.setValueAtTime(0, now + 0.02);
        bellGain.gain.linearRampToValueAtTime(idx === 0 ? 0.28 : 0.16, now + 0.03);
        bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.75);

        bellOsc.connect(bellGain);
        bellGain.connect(this.ctx.destination);
        bellOsc.start(now + 0.02);
        bellOsc.stop(now + 0.8);
      });
    } catch {
      // ignore
    }
  }

  // 2. Cascade of Metallic Coins Poured into Jackpot Metal Tray
  playCoinShower(coinCount: number = 12) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const baseNow = this.ctx.currentTime;
      const coinPitches = [3135, 3520, 3951, 4186, 4698, 5274, 5587];

      for (let i = 0; i < coinCount; i++) {
        const coinTime = baseNow + i * (0.045 + Math.random() * 0.055);
        const pitch = coinPitches[Math.floor(Math.random() * coinPitches.length)];

        // Metallic ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, coinTime);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.95, coinTime + 0.07);

        gain.gain.setValueAtTime(0, coinTime);
        gain.gain.linearRampToValueAtTime(0.18, coinTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, coinTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(coinTime);
        osc.stop(coinTime + 0.14);
      }
    } catch {
      // ignore
    }
  }

  // 3. Single / Double Metallic Coin Drop
  playCoinDrop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [3729, 4434]; // High metallic clinks
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const delay = idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.22, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      });
    } catch {
      // ignore
    }
  }

  // 4. Coin Toss (Airborne spinning whir)
  playCoinToss() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      // Spinning modulation
      lfo.frequency.setValueAtTime(28, now); // 28 spins per sec
      lfo.frequency.exponentialRampToValueAtTime(14, now + 0.5);
      lfoGain.gain.setValueAtTime(0.12, now);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.5);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.52);
      lfo.stop(now + 0.52);
    } catch {
      // ignore
    }
  }

  // 5. Classic 777 Slot Machine Bell Dings
  playCasinoBell(dings: number = 3) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < dings; i++) {
        const time = now + i * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, time); // A6 bright ding
        gain.gain.setValueAtTime(0.24, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.25);
      }
    } catch {
      // ignore
    }
  }

  // 6. Roulette Ball Hopping / Rattle on Brass Frets
  playRouletteBall() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const hops = 16;
      let delay = 0;
      for (let i = 0; i < hops; i++) {
        // Interval slows down as ball loses velocity
        delay += 0.035 + (i * i * 0.004);
        const hopTime = now + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const pitch = 850 + Math.random() * 250;
        osc.frequency.setValueAtTime(pitch, hopTime);
        osc.frequency.exponentialRampToValueAtTime(220, hopTime + 0.02);

        const vol = Math.max(0.04, 0.2 - (i / hops) * 0.15);
        gain.gain.setValueAtTime(vol, hopTime);
        gain.gain.exponentialRampToValueAtTime(0.001, hopTime + 0.022);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(hopTime);
        osc.stop(hopTime + 0.025);
      }
    } catch {
      // ignore
    }
  }

  // 7. Stacking / Shuffling Heavy Clay Casino Chips
  playChipStack() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chips = [880, 1150, 1020, 1340];
      chips.forEach((pitch, idx) => {
        if (!this.ctx) return;
        const chipTime = now + idx * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, chipTime);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.3, chipTime + 0.035);

        gain.gain.setValueAtTime(0.18, chipTime);
        gain.gain.exponentialRampToValueAtTime(0.005, chipTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(chipTime);
        osc.stop(chipTime + 0.045);
      });
    } catch {
      // ignore
    }
  }

  // 8. Dice Roll Rattling & Tumbling on Craps Felt
  playDiceRoll() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bounces = 6;
      let cur = 0;
      for (let i = 0; i < bounces; i++) {
        cur += 0.04 + Math.random() * 0.05;
        const t = now + cur;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260 + Math.random() * 120, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.03);

        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch {
      // ignore
    }
  }

  // 9. Card Deal / Card Flip Swish
  playCardDeal() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Card snap frequency sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.025);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // ignore
    }
  }

  // 10. Mechanical Slot Machine Reel Spin Tick
  playSlotSpin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const ticks = 8;
      for (let i = 0; i < ticks; i++) {
        const t = now + i * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(650, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.018);
      }
    } catch {
      // ignore
    }
  }

  // 11. Mechanical Slot Reel Snap / Lock Stop
  playSlotStop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy clunk
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  // 12. Muted Classic Casino Loss / Whammy Descending Tone
  playLossWhammy() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Wah-wah-wah descending notes: D4 (293Hz), Db4 (277Hz), C4 (261Hz), B3 (246Hz)
      const notes = [293.66, 277.18, 261.63, 246.94];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.95, t + 0.11);

        gain.gain.setValueAtTime(idx === 3 ? 0.2 : 0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.35 : 0.11));

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + (idx === 3 ? 0.38 : 0.12));
      });
    } catch {
      // ignore
    }
  }

  // 13. High Stakes Card Deck Shuffle (Authentic Riffle)
  playCardShuffle() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const totalSnaps = 18;
      for (let i = 0; i < totalSnaps; i++) {
        const snapTime = now + (i * 0.022) + (Math.random() * 0.008);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startFreq = 1600 + Math.random() * 800;
        osc.frequency.setValueAtTime(startFreq, snapTime);
        osc.frequency.exponentialRampToValueAtTime(280, snapTime + 0.016);

        gain.gain.setValueAtTime(0, snapTime);
        gain.gain.linearRampToValueAtTime(0.14, snapTime + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(snapTime);
        osc.stop(snapTime + 0.022);
      }
    } catch {
      // ignore
    }
  }

  // 14. Heavy Mechanical Slot Machine Lever Pull
  playSlotLeverPull() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy clunk
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);

      // Spring ratchet release
      setTimeout(() => {
        this.playSlotSpin();
      }, 90);
    } catch {
      // ignore
    }
  }

  // 15. Celebratory Vegas Big Win Sirens & Flash
  playBigWinSirens() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const pulses = 6;
      for (let i = 0; i < pulses; i++) {
        const pulseTime = now + i * 0.18;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 1320, pulseTime);
        osc.frequency.exponentialRampToValueAtTime(i % 2 === 0 ? 1320 : 880, pulseTime + 0.16);

        gain.gain.setValueAtTime(0, pulseTime);
        gain.gain.linearRampToValueAtTime(0.2, pulseTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.17);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(pulseTime);
        osc.stop(pulseTime + 0.175);
      }
      // Followed by celebratory coin cascade
      setTimeout(() => {
        this.playCoinShower(16);
      }, 350);
    } catch {
      // ignore
    }
  }

  // 16. Sweeping Casino Chips Collection
  playChipsCollect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 7; i++) {
        const chipTime = now + i * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950 + i * 80, chipTime);
        osc.frequency.exponentialRampToValueAtTime(1400 + i * 50, chipTime + 0.035);

        gain.gain.setValueAtTime(0.18, chipTime);
        gain.gain.exponentialRampToValueAtTime(0.001, chipTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(chipTime);
        osc.stop(chipTime + 0.045);
      }
    } catch {
      // ignore
    }
  }

  // 17. High energy arcade level-up / bonus multiplier chime
  playLevelUpChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.32);
      });
    } catch {
      // ignore
    }
  }
}

export const casinoAudio = new CasinoAudioEngine();

// Global click sound initializer: Attaches listener so ANY button in the chix9ja app makes sound when clicked
let isGlobalSoundInitialized = false;

export function initGlobalButtonSound() {
  if (typeof window === 'undefined' || isGlobalSoundInitialized) return;
  isGlobalSoundInitialized = true;

  const handleClick = (e: MouseEvent | TouchEvent) => {
    try {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or its ancestor is a button or clickable interactive element
      const clickable = target.closest('button, [role="button"], a, input[type="button"], input[type="submit"], [data-clickable="true"]');
      if (clickable) {
        casinoAudio.playButtonClick();
      }
    } catch {
      // ignore
    }
  };

  // Attach using capture phase so it catches all clicks before propagation stops
  window.addEventListener('click', handleClick, true);
  window.addEventListener('touchstart', () => {
    casinoAudio.init();
  }, { passive: true, once: true });
}
