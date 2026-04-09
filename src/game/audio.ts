import type { PowerupType } from '../types/game';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private baseBpm = 128;
  private currentBpm = 128;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getMaster(): GainNode {
    this.getCtx();
    return this.masterGain!;
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainVal = 0.3,
    delay = 0,
    detune = 0,
  ): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  }

  playSlash(combo = 1): void {
    const base = 600 + combo * 80;
    this.playTone(base, 'sine', 0.08, 0.25);
    this.playTone(base * 1.5, 'sine', 0.05, 0.15, 0.03);
    if (combo >= 3) {
      this.playTone(base * 2, 'sine', 0.06, 0.2, 0.06);
    }
    const ctx = this.getCtx();
    const noise = ctx.createOscillator();
    const gain = ctx.createGain();
    noise.type = 'sawtooth';
    noise.frequency.value = 200 + Math.random() * 100;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    noise.connect(gain);
    gain.connect(this.getMaster());
    noise.start();
    noise.stop(ctx.currentTime + 0.05);
  }

  playMiss(): void {
    this.playTone(120, 'sawtooth', 0.3, 0.2);
    this.playTone(90, 'square', 0.25, 0.15, 0.05);
  }

  playProtectedHit(): void {
    this.playTone(80, 'sawtooth', 0.5, 0.35);
    this.playTone(55, 'square', 0.4, 0.3, 0.1);
    this.playTone(40, 'sawtooth', 0.3, 0.25, 0.2);
  }

  playCombo(combo: number): void {
    const notes = [523, 659, 784, 1047, 1319];
    const idx = Math.min(combo - 2, notes.length - 1);
    this.playTone(notes[idx], 'triangle', 0.15, 0.3);
    this.playTone(notes[idx] * 1.25, 'sine', 0.1, 0.2, 0.05);
  }

  playPowerup(type: PowerupType): void {
    const freqs: Record<PowerupType, number[]> = {
      extralife: [523, 659, 784, 1047],
      slowmo: [440, 330, 220, 165],
      doublepoints: [659, 784, 1047, 1319],
      shield: [392, 494, 587, 784],
      cleansweep: [523, 659, 784, 1047, 1319],
    };
    const notes = freqs[type];
    notes.forEach((f, i) => {
      this.playTone(f, 'sine', 0.12, 0.25, i * 0.07);
    });
  }

  playFrenzyStart(): void {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
      this.playTone(f, 'sawtooth', 0.15, 0.3, i * 0.04);
    });
  }

  playGameOver(): void {
    [440, 330, 220, 110].forEach((f, i) => {
      this.playTone(f, 'sawtooth', 0.4, 0.3, i * 0.15);
    });
  }

  playLevelUp(): void {
    [523, 659, 784, 1047].forEach((f, i) => {
      this.playTone(f, 'triangle', 0.15, 0.25, i * 0.06);
    });
  }

  setSlowMo(active: boolean): void {
    this.currentBpm = active ? Math.round(this.baseBpm * 0.6) : this.baseBpm;
    if (this.musicInterval !== null) {
      this.stopMusic();
      this.startMusic();
    }
  }

  startMusic(): void {
    if (this.musicInterval !== null) return;
    const stepMs = (60 / this.currentBpm / 4) * 1000;

    const bassPattern = [55, 0, 55, 0, 55, 0, 73, 0, 55, 0, 55, 0, 49, 0, 49, 0];
    const melodyPattern = [0, 0, 330, 0, 0, 0, 392, 0, 0, 0, 440, 0, 0, 0, 330, 0];

    this.musicStep = 0;
    this.musicInterval = setInterval(() => {
      const step = this.musicStep % 16;
      const bFreq = bassPattern[step];
      const mFreq = melodyPattern[step];

      if (bFreq > 0) this.playTone(bFreq, 'triangle', stepMs * 0.8 / 1000, 0.12);
      if (mFreq > 0) this.playTone(mFreq, 'sine', stepMs * 0.5 / 1000, 0.08);

      this.musicStep++;
    }, stepMs);
  }

  stopMusic(): void {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioManager();
