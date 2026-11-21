class CozyAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }

  _tone({ freq = 440, endFreq = null, type = 'sine', duration = 0.14, gain = 0.12, delay = 0 }) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this._tone({ freq: 520, endFreq: 680, type: 'triangle', duration: 0.07, gain: 0.08 });
  }

  playStep() {
    this._tone({ freq: 145 + Math.random() * 35, endFreq: 85, type: 'triangle', duration: 0.055, gain: 0.04 });
  }

  playSplash() {
    if (this.muted || !this.ctx) return;
    this._tone({ freq: 340, endFreq: 130, type: 'sine', duration: 0.16, gain: 0.1 });
    this._tone({ freq: 560, endFreq: 260, type: 'sine', duration: 0.12, gain: 0.06, delay: 0.05 });
  }

  playNibble() {
    this._tone({ freq: 440, endFreq: 310, type: 'sine', duration: 0.09, gain: 0.09 });
  }

  playBite() {
    this._tone({ freq: 720, endFreq: 980, type: 'triangle', duration: 0.11, gain: 0.15 });
    this._tone({ freq: 980, endFreq: 1320, type: 'triangle', duration: 0.14, gain: 0.14, delay: 0.08 });
    if (navigator.vibrate) {
      try { navigator.vibrate([45, 35, 60]); } catch (_) {}
    }
  }

  playNetSwing() {
    this._tone({ freq: 260, endFreq: 520, type: 'sine', duration: 0.12, gain: 0.09 });
  }

  playCatch(isRare = false) {
    const notes = isRare
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
      : [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this._tone({ freq: n, type: 'triangle', duration: 0.22, gain: 0.12, delay: i * 0.08 });
    });
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (_) {}
    }
  }

  playFail() {
    this._tone({ freq: 330, endFreq: 220, type: 'triangle', duration: 0.18, gain: 0.1 });
    this._tone({ freq: 220, endFreq: 165, type: 'triangle', duration: 0.22, gain: 0.09, delay: 0.12 });
  }

  playCoin() {
    this._tone({ freq: 987.77, type: 'sine', duration: 0.09, gain: 0.11 });
    this._tone({ freq: 1318.51, type: 'sine', duration: 0.18, gain: 0.11, delay: 0.07 });
  }

  playNpcChirp() {
    const base = 360 + Math.random() * 140;
    this._tone({ freq: base, endFreq: base * 1.24, type: 'triangle', duration: 0.08, gain: 0.08 });
    this._tone({ freq: base * 1.15, endFreq: base * 0.92, type: 'triangle', duration: 0.09, gain: 0.07, delay: 0.08 });
  }

  playBoatHorn() {
    this._tone({ freq: 260, endFreq: 250, type: 'triangle', duration: 0.28, gain: 0.1 });
    this._tone({ freq: 390, endFreq: 382, type: 'sine', duration: 0.28, gain: 0.06 });
  }
}

export const audio = new CozyAudio();
