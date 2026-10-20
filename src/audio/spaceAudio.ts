/**
 * Procedural Space Soundscape Synthesizer
 * Built entirely with Web Audio API (zero external sound files or 404s).
 * Creates a soothing, ambient cosmic drone with pulsar oscillations.
 */

class SpaceAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public play() {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    const t = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.18, t + 2.5);
    this.masterGain.connect(this.ctx.destination);

    // Warm Low-Pass Resonant Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(140, t);
    this.filter.Q.setValueAtTime(4.2, t);
    this.filter.connect(this.masterGain);

    // Fundamental Core Drone (F#1 ~ 46.25 Hz)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(46.25, t);

    // Harmonic Drone (C#2 ~ 69.3 Hz - perfect fifth)
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(69.3, t);

    // LFO for slow galactic swell (0.07 Hz)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.07, t);

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(70, t);

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);

    // Subtle cosmic dust noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.04;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(320, t);
    noiseFilter.Q.setValueAtTime(1.8, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, t);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);

    this.osc1.start(t);
    this.osc2.start(t);
    this.lfo.start(t);
    this.noiseNode.start(t);

    this.isPlaying = true;
  }

  public stop() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    setTimeout(() => {
      try {
        this.osc1?.stop();
        this.osc2?.stop();
        this.lfo?.stop();
        this.noiseNode?.stop();
        this.osc1?.disconnect();
        this.osc2?.disconnect();
        this.lfo?.disconnect();
        this.noiseNode?.disconnect();
        this.masterGain?.disconnect();
      } catch {
        // Ignored
      }
      this.isPlaying = false;
    }, 1250);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public active(): boolean {
    return this.isPlaying;
  }
}

export const spaceAudio = new SpaceAudioSynthesizer();
