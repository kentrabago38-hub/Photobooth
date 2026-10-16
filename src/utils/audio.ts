/**
 * Cute procedural audio system using Web Audio API
 * Generates gentle romantic music box melodies and cute photobooth sound effects
 * Zero external audio dependencies = 100% reliable, offline-ready, no copyright issues!
 */

class CutieAudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private isMuted = false;
  private musicVolume = 0.35;
  private sfxVolume = 0.6;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a gentle music box bell tone
  private playBellTone(freq: number, duration: number, timeOffset = 0) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const startTime = this.ctx.currentTime + timeOffset;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Primary bell tone (sine)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle overtone (chime warmth)
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Bell envelope: sharp attack, gentle exponential decay
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  // Cute romantic music-box melody progression in C Major / G Major Pentatonic
  // A sweet dreamy melody that loops peacefully
  private readonly melodyNotes: { freq: number; dur: number; delay: number }[] = [
    // Phrase 1: Sweet gentle intro
    { freq: 523.25, dur: 1.2, delay: 0 },    // C5
    { freq: 659.25, dur: 1.2, delay: 0.5 },  // E5
    { freq: 783.99, dur: 1.5, delay: 1.0 },  // G5
    { freq: 880.00, dur: 1.4, delay: 1.7 },  // A5
    { freq: 783.99, dur: 1.6, delay: 2.3 },  // G5
    { freq: 659.25, dur: 1.4, delay: 3.0 },  // E5

    // Phrase 2: Sparkle descent
    { freq: 587.33, dur: 1.2, delay: 3.6 },  // D5
    { freq: 659.25, dur: 1.2, delay: 4.1 },  // E5
    { freq: 523.25, dur: 2.0, delay: 4.6 },  // C5
    { freq: 392.00, dur: 1.6, delay: 5.4 },  // G4

    // Phrase 3: Romantic ascent
    { freq: 440.00, dur: 1.2, delay: 6.2 },  // A4
    { freq: 523.25, dur: 1.2, delay: 6.7 },  // C5
    { freq: 659.25, dur: 1.3, delay: 7.2 },  // E5
    { freq: 880.00, dur: 1.5, delay: 7.8 },  // A5
    { freq: 1046.50, dur: 2.2, delay: 8.4 }, // C6 (high sweet sparkle)
    { freq: 783.99, dur: 1.8, delay: 9.3 },  // G5
    { freq: 659.25, dur: 1.6, delay: 10.0 }, // E5
    { freq: 587.33, dur: 2.4, delay: 10.7 }, // D5 (resolved gently)
  ];

  public toggleMusic(): boolean {
    this.initContext();
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const playLoop = () => {
      if (!this.isMusicPlaying) return;

      this.melodyNotes.forEach((note) => {
        this.playBellTone(note.freq, note.dur, note.delay);
      });

      // Total melody length is ~13.5 seconds, loop seamlessly
      this.musicTimer = window.setTimeout(playLoop, 13500);
    };

    playLoop();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain && this.ctx && !this.isMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.musicVolume;
  }

  // Camera shutter sound: snap + click
  public playShutterSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Part 1: Quick mechanical click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);

    // Part 2: Soft cute camera snap
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now + 0.03);
    filter.Q.setValueAtTime(3, now + 0.03);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now + 0.03);
    whiteNoise.stop(now + 0.13);
  }

  // Countdown beep for 3, 2, 1
  public playCountdownBeep(isFinal = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    if (isFinal) {
      // High celebratory chime
      osc.frequency.setValueAtTime(1046.5, now); // C6
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      // Gentle warning pip
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  }

  // Cute pop sound for clicking stickers or filters
  public playPopSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Sparkle chime for downloading, favoriting, or surprise me
  public playSparkleSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }
}

export const cutieAudio = new CutieAudioManager();
