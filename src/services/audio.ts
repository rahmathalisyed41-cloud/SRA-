/**
 * Audio service for SRA Goat for Sale Hyderabad
 * Generates an authentic, gentle short goat bleat using Web Audio API synthesis.
 * Plays only once per session as specified in requirement #35.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function playGoatBleatSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const duration = 0.45; // 450ms short authentic bleat

    // Base fundamental goat tone (~280Hz - 230Hz downward glissando)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + duration);

    // Tremolo/bleat vibrato LFO (fast goat bleating effect at 16Hz)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(16, now);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(35, now);
    lfo.connect(osc.frequency);

    // Nasal formant filter (simulating animal vocal tract)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(950, now);
    bandpass.Q.setValueAtTime(3.5, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay

    osc.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);

    lfo.stop(now + duration);
    osc.stop(now + duration);
  } catch (err) {
    console.warn('Audio playback fallback:', err);
  }
}

/**
 * Triggers bleat only once per browser session
 */
export function playBleatOnceOnSession(): void {
  if (typeof window === 'undefined') return;
  const KEY = 'sra_goat_bleat_played_v1';
  if (sessionStorage.getItem(KEY)) return;

  const handleFirstInteraction = () => {
    if (!sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, 'true');
      playGoatBleatSound();
    }
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
  };

  window.addEventListener('click', handleFirstInteraction, { once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { once: true });
}
