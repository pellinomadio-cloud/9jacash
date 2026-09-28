// Lightweight Web Audio API synthesizer for app sound effects
// 100% zero-dependency, works on mobile, desktop, iOS Safari, Android Chrome

class AudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Universal button click sound across all of 9jacash app
  playButtonClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Cash register / kaching sound
  playKaChing() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Metallic chime
    [1200, 1800, 2400].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.25, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.35);
    });
  }

  // Coin shower effect
  playCoinShower(count: number = 8) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let i = 0; i < count; i++) {
      const delay = i * 0.065 + Math.random() * 0.02;
      const freq = 1600 + Math.random() * 1200;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 0.08);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    }
  }

  // Wheel peg click
  playWheelPeg() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.025);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // Jackpot win fanfare
  playJackpotWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    });
  }

  // Cashout fanfare
  playCashout() {
    this.playKaChing();
    setTimeout(() => this.playCoinShower(10), 100);
  }

  init() {
    try {
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    } catch {}
  }
}

export const appAudio = new AudioEngine();
export const casinoAudio = appAudio; // Alias for backward compatibility

export function initGlobalButtonSound() {
  if (typeof window === 'undefined') return;
  window.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('button, [role="button"], a');
    if (target) {
      appAudio.playButtonClick();
    }
  }, { passive: true });
}

if (typeof window !== 'undefined') {
  appAudio.init();
}
