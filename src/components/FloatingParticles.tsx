import React, { useEffect, useState } from 'react';

interface HeartParticle {
  id: number;
  x: number;
  size: number;
  speed: number;
  emoji: string;
  delay: number;
}

const CUTE_EMOJIS = ['♡', '🎀', '✨', '🌸', '🍓', '✧', '💖', '⭐'];

export const FloatingParticles: React.FC<{
  reducedMotion?: boolean;
  burstCount?: number;
}> = ({ reducedMotion = false, burstCount = 0 }) => {
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  // Ambient gentle floating particles
  useEffect(() => {
    if (reducedMotion) {
      setParticles([]);
      return;
    }

    const initial: HeartParticle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 95,
      size: 14 + Math.random() * 16,
      speed: 12 + Math.random() * 10,
      emoji: CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)],
      delay: Math.random() * 5,
    }));
    setParticles(initial);
  }, [reducedMotion]);

  // Burst effect when photo is captured
  useEffect(() => {
    if (burstCount <= 0 || reducedMotion) return;

    const newBursts = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 30,
      emoji: ['💖', '💕', '✨', '🎀', '♡', '🌸'][Math.floor(Math.random() * 6)],
    }));

    setBurstParticles(newBursts);
    const timer = setTimeout(() => {
      setBurstParticles([]);
    }, 1800);

    return () => clearTimeout(timer);
  }, [burstCount, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient drifting sparkles and hearts */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-pink-300/40 select-none transition-transform"
          style={{
            left: `${p.x}%`,
            bottom: '-40px',
            fontSize: `${p.size}px`,
            animation: `floatUpward ${p.speed}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Shutter burst particles */}
      {burstParticles.map((b) => (
        <div
          key={b.id}
          className="absolute select-none pointer-events-none text-2xl"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            animation: 'burstAnimation 1.6s ease-out forwards',
          }}
        >
          {b.emoji}
        </div>
      ))}

      <style>{`
        @keyframes floatUpward {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-105vh) rotate(45deg);
            opacity: 0;
          }
        }
        @keyframes burstAnimation {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 140}px, -${120 + Math.random() * 150}px) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
