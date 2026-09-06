'use client';

/**
 * AquaEarth Tactile Haptic & Audio Chime Feedback Engine
 * Provides Apple-grade tactile feedback on mobile devices & audio cues on desktop.
 */

// Safe browser vibration wrapper
export function triggerHaptic(pattern: number | number[]): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignored if browser throttles or restricts background vibration
    }
  }
}

// Pre-defined haptic signatures
export const haptics = {
  // Crisp double-tap for task completion, approvals, and success states
  success: () => triggerHaptic([15, 60, 20]),
  
  // Physical punch-clock sensation for attendance check-in / check-out
  clockPunch: () => triggerHaptic([25, 50, 25, 50, 40]),
  
  // Firm single impact for modal opens, button presses, theme flips
  impact: () => triggerHaptic(35),
  
  // Multi-pulse warning for SLA expirations, blockers, rejection
  warning: () => triggerHaptic([40, 100, 40]),
  
  // Light selection tick for segmented controls and filter switches
  selection: () => triggerHaptic(10)
};

// Zero-dependency Web Audio API notification chime
export function playNotificationChime(type: 'push' | 'success' | 'punch' = 'push'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'push') {
      // Elegant Apple-style two-tone upward chime (F#5 -> C#6)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(740, now); // F#5
      osc1.frequency.exponentialRampToValueAtTime(1108.73, now + 0.12); // C#6
      
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } else if (type === 'punch') {
      // Deep mechanical punch sound for clock-in
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'success') {
      // Triple ascending harmony
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    }
  } catch (e) {
    // AudioContext blocked by user-gesture policy before first interaction
  }
}
