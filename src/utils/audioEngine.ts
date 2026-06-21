class AudioEngine {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private volumeMultiplier: number = 0.5; // Starts at 50% slider

  public toggle(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isPlaying;
    if (target === this.isPlaying) return this.isPlaying;

    if (target) {
      this.start();
    } else {
      this.stop();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volumeMultiplier;
  }

  public setVolume(vol: number) {
    this.volumeMultiplier = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.gainNode) {
      const targetGain = 0.12 * this.volumeMultiplier;
      this.gainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  private start() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.gainNode = this.ctx.createGain();
      // Gentle non-intrusive volume scaled by multiplier
      const initialGain = 0.12 * this.volumeMultiplier;
      this.gainNode.gain.setValueAtTime(initialGain, this.ctx.currentTime);

      filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.isPlaying = true;

      // Relaxing high-fantasy RPG modal progression: Am9 -> Cmaj9 -> Fmaj7 -> G6
      const progressions = [
        [110, 164.81, 196.00, 246.94, 293.66], // A minor 9
        [130.81, 196.00, 261.63, 329.63, 392.00], // C major 9
        [87.31, 174.61, 261.63, 329.63, 440.00], // F major 7/9
        [98.00, 196.00, 293.66, 392.00, 493.88], // G major 6/9
      ];

      let chordIdx = 0;

      const playChord = () => {
        if (!this.ctx || this.ctx.state === "suspended") {
          this.ctx?.resume();
        }

        const now = this.ctx!.currentTime;
        const notes = progressions[chordIdx];
        chordIdx = (chordIdx + 1) % progressions.length;

        // Clear active oscillators that have finished
        this.oscillators = this.oscillators.filter(osc => {
          try {
            osc.stop();
          } catch(e){}
          return false;
        });

        notes.forEach((freq, idx) => {
          if (!this.ctx || !this.gainNode) return;
          
          const osc = this.ctx.createOscillator();
          osc.type = idx % 2 === 0 ? "triangle" : "sine"; // soft warm tone combination
          osc.frequency.setValueAtTime(freq, now);

          const oscGain = this.ctx.createGain();
          oscGain.gain.setValueAtTime(0, now);
          // smooth fading swells
          oscGain.gain.linearRampToValueAtTime(0.18, now + 1.8 + idx * 0.2);
          oscGain.gain.setValueAtTime(0.18, now + 4.8);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 7.8);

          osc.connect(oscGain);
          oscGain.connect(filter);
          
          osc.start(now);
          osc.stop(now + 8.0);
          
          this.oscillators.push(osc);
        });
      };

      // Kick off the ambient loop
      playChord();
      
      this.intervalId = setInterval(() => {
        if (this.isPlaying) {
          playChord();
        }
      }, 7600);

    } catch (e) {
      console.error("Failed to start procedural game audio:", e);
      this.isPlaying = false;
    }
  }

  private stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.oscillators = [];
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }

  // --- PROCEDURAL SOUND EFFECTS ---
  // Plays instant sound effects synthesized on the fly so there are zero network dependency errors.
  
  private createSfxContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      return new AudioContextClass();
    }
    return null;
  }

  public playDrawSound() {
    const sfxCtx = this.createSfxContext();
    if (!sfxCtx) return;
    const now = sfxCtx.currentTime;
    const osc = sfxCtx.createOscillator();
    const gainNode = sfxCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.05 * this.volumeMultiplier, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(sfxCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playImpactSound(isHeavy: boolean = false) {
    const sfxCtx = this.createSfxContext();
    if (!sfxCtx) return;
    const now = sfxCtx.currentTime;
    const osc = sfxCtx.createOscillator();
    const gainNode = sfxCtx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(isHeavy ? 220 : 150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    
    gainNode.gain.setValueAtTime(0.15 * this.volumeMultiplier, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(sfxCtx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playHealSound() {
    const sfxCtx = this.createSfxContext();
    if (!sfxCtx) return;
    const now = sfxCtx.currentTime;
    
    const playChime = (delay: number, freq: number) => {
      const osc = sfxCtx.createOscillator();
      const gainNode = sfxCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.06 * this.volumeMultiplier, now + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);
      
      osc.connect(gainNode);
      gainNode.connect(sfxCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    };

    // Arpeggio chord swell for magic healing
    playChime(0, 329.63);      // E4
    playChime(0.08, 392.00);   // G4
    playChime(0.16, 523.25);   // C5
    playChime(0.24, 659.25);   // E5
  }

  public playBlockSound() {
    const sfxCtx = this.createSfxContext();
    if (!sfxCtx) return;
    const now = sfxCtx.currentTime;
    const osc = sfxCtx.createOscillator();
    const gainNode = sfxCtx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(293, now + 0.04);
    
    gainNode.gain.setValueAtTime(0.08 * this.volumeMultiplier, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.connect(gainNode);
    gainNode.connect(sfxCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playUpgradeSound() {
    const sfxCtx = this.createSfxContext();
    if (!sfxCtx) return;
    const now = sfxCtx.currentTime;
    
    const p1 = sfxCtx.createOscillator();
    const p2 = sfxCtx.createOscillator();
    const gain1 = sfxCtx.createGain();
    const gain2 = sfxCtx.createGain();
    
    p1.type = "sine";
    p1.frequency.setValueAtTime(293.66, now); // D4
    p1.frequency.exponentialRampToValueAtTime(587.33, now + 0.4);
    
    p2.type = "sine";
    p2.frequency.setValueAtTime(440, now); // A4
    p2.frequency.exponentialRampToValueAtTime(880, now + 0.45);
    
    gain1.gain.setValueAtTime(0.06 * this.volumeMultiplier, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    gain2.gain.setValueAtTime(0.04 * this.volumeMultiplier, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    p1.connect(gain1);
    gain1.connect(sfxCtx.destination);
    p2.connect(gain2);
    gain2.connect(sfxCtx.destination);
    
    p1.start(now);
    p2.start(now);
    p1.stop(now + 0.5);
    p2.stop(now + 0.5);
  }
}

export const gameAudio = new AudioEngine();

