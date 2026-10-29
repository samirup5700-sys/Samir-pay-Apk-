/**
 * Web Audio API synthesizer for native UPI transaction chimes and keypad feedback.
 * Works on all modern mobile and desktop browsers without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Authentic UPI success chime (bright, harmonic 3-note ascending melody)
  playSuccessChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },     // C5
      { freq: 659.25, time: 0.12, dur: 0.18 },  // E5
      { freq: 1046.50, time: 0.25, dur: 0.45 }, // C6 (crisp high tone)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Smooth attack and decay envelope
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });

    // Native haptic vibration if supported on phone
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 80]);
      } catch {
        // Ignore vibration errors
      }
    }
  }

  // Soft tactile tick for numeric keypad presses
  playKeypadTick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore
      }
    }
  }

  // Soundbox speech announcement (like Paytm/PhonePe smart speaker)
  announceReceivedAmount(amount: number, language: 'en' | 'hi' = 'en'): void {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const text = language === 'hi' 
        ? `समीर पे पर ${amount} रुपये प्राप्त हुए`
        : `Rupees ${amount} received on Samir Pay`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      // Try finding an Indian English or Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        language === 'hi' ? v.lang.includes('hi') : (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.includes('India'))
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech not supported or blocked
    }
  }
}

export const sound = new SoundEngine();
