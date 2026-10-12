import { useState, useRef, useEffect } from 'react';
import type { PointerEvent, FC } from 'react';
import { motion } from 'framer-motion';
import type { ModeId } from '../types';

interface ModeDialProps {
  onSelectMode: (mode: ModeId) => void;
  selectedMode: ModeId | null;
  isZooming: boolean;
}

const MODES: ModeId[] = [
  'FINANCE',
  'RELATIONSHIP',
  'ACADEMICS',
  'FAMILY',
  'FUTURE',
  'LOST',
  'COMPANION',
  'GROWTH'
];

export const ModeDial: FC<ModeDialProps> = ({ onSelectMode, selectedMode, isZooming }) => {
  const [rotation, setRotation] = useState(0);
  const [flashingMode, setFlashingMode] = useState<ModeId | null>(null);
  const [isAssembled, setIsAssembled] = useState(false);

  const dialRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastSectorTickRef = useRef<number>(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);

  rotationRef.current = rotation;

  // Mechanical tick trigger (Haptic vibration + subtle mechanical click tone)
  const triggerTickFeedback = () => {
    // 1. Android / Hardware vibration micro-pulse
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe ignore if permission denied
      }
    }

    // 2. Web Audio micro-click synthesizer
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.015);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.015);
      }
    } catch {
      // Audio fallback silent fail
    }
  };

  // Check sector boundaries and trigger tick only on user action / flick
  const evaluateTick = (currentRot: number, isIntentional: boolean) => {
    if (!isIntentional) return;

    // Normalize rotation to 0-360 positive
    const normalized = ((currentRot % 360) + 360) % 360;
    const sectorIndex = Math.floor(normalized / 45);

    if (sectorIndex !== lastSectorTickRef.current) {
      lastSectorTickRef.current = sectorIndex;
      triggerTickFeedback();
    }
  };

  useEffect(() => {
    setIsAssembled(false);
    const timer = setTimeout(() => {
      setIsAssembled(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Master Physics & Ambient Animation Loop
  useEffect(() => {
    if (selectedMode !== null || isZooming || !isAssembled) return;

    const ambientSpeed = 0.021; // ~3.5 RPM
    const friction = 0.95;

    const loop = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min(now - lastTimeRef.current, 32);
      lastTimeRef.current = now;

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.03) {
          // Intentional flick coasting: triggers haptic ticks at high speed
          rotationRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(friction, dt / 16);
          evaluateTick(rotationRef.current, true);
        } else {
          // Passive ambient spin: NO haptic feedback
          velocityRef.current = 0;
          rotationRef.current += ambientSpeed * dt;
          // evaluateTick skipped here
        }
        setRotation(rotationRef.current % 360);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedMode, isZooming, isAssembled]);

  const getAngle = (e: PointerEvent): number => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (selectedMode || isZooming || !isAssembled) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    velocityRef.current = 0;
    lastAngleRef.current = getAngle(e);
    lastTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 1);
    const angle = getAngle(e);

    let delta = angle - lastAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    velocityRef.current = delta / dt;
    rotationRef.current += delta;
    setRotation(rotationRef.current % 360);

    // Intentional drag tick trigger
    evaluateTick(rotationRef.current, true);

    lastAngleRef.current = angle;
    lastTimeRef.current = now;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleSectorClick = (mode: ModeId) => {
    if (selectedMode || isZooming || !isAssembled || Math.abs(velocityRef.current) > 0.15) return;
    setFlashingMode(mode);

    // Click confirm vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 20]);
    }

    setTimeout(() => {
      setFlashingMode(null);
      onSelectMode(mode);
    }, 550);
  };

  const getWedgePath = (index: number, total: number, rInner: number, rOuter: number, gapDeg: number = 2.5) => {
    const angleStep = 360 / total;
    const startA = (index * angleStep - 90 + gapDeg / 2) * (Math.PI / 180);
    const endA = ((index + 1) * angleStep - 90 - gapDeg / 2) * (Math.PI / 180);

    const x1 = Math.cos(startA) * rOuter;
    const y1 = Math.sin(startA) * rOuter;
    const x2 = Math.cos(endA) * rOuter;
    const y2 = Math.sin(endA) * rOuter;

    const x3 = Math.cos(endA) * rInner;
    const y3 = Math.sin(endA) * rInner;
    const x4 = Math.cos(startA) * rInner;
    const y4 = Math.sin(startA) * rInner;

    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
  };

  const getTextArcPath = (index: number, total: number, rText: number, gapDeg: number = 2.5) => {
    const angleStep = 360 / total;
    const startA = (index * angleStep - 90 + gapDeg) * (Math.PI / 180);
    const endA = ((index + 1) * angleStep - 90 - gapDeg) * (Math.PI / 180);

    const x1 = Math.cos(startA) * rText;
    const y1 = Math.sin(startA) * rText;
    const x2 = Math.cos(endA) * rText;
    const y2 = Math.sin(endA) * rText;

    return `M ${x1} ${y1} A ${rText} ${rText} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div 
        ref={dialRef}
        onPointerDown={handlePointerDown}
        className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
      >
        <svg 
          viewBox="-220 -220 440 440" 
          className="w-full h-full overflow-visible"
        >
          <defs>
            {MODES.map((_, i) => (
              <path
                key={`arc-path-${i}`}
                id={`text-arc-${i}`}
                d={getTextArcPath(i, 8, 126, 2.5)}
              />
            ))}
          </defs>

          <g transform={`rotate(${rotation})`}>
            {MODES.map((mode, i) => {
              const isChosen = selectedMode === mode || flashingMode === mode;
              const isOther = (selectedMode !== null || flashingMode !== null) && !isChosen;

              const angleDeg = (i * 45 + 22.5);
              const rad = (angleDeg - 90) * (Math.PI / 180);
              const offsetDistance = 650;
              const offsetX = Math.cos(rad) * offsetDistance;
              const offsetY = Math.sin(rad) * offsetDistance;

              return (
                <motion.g
                  key={mode}
                  initial={{ x: offsetX, y: offsetY, opacity: 0, scale: 0.4 }}
                  animate={
                    isOther
                      ? { x: offsetX, y: offsetY, opacity: 0, scale: 0.4 }
                      : isChosen && isZooming
                      ? { x: 0, y: 0, scale: 8, opacity: [1, 0.4, 0] }
                      : isAssembled
                      ? { x: 0, y: 0, opacity: 1, scale: 1 }
                      : { x: offsetX, y: offsetY, opacity: 0, scale: 0.4 }
                  }
                  transition={{ 
                    duration: isZooming ? 0.7 : 0.65, 
                    ease: [0.16, 1, 0.3, 1],
                    delay: isAssembled && !selectedMode ? i * 0.03 : 0
                  }}
                >
                  <path
                    d={getWedgePath(i, 8, 85, 175, 2.5)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      flashingMode === mode ? 'flash-sector' : ''
                    }`}
                    style={{
                      fill: isChosen && flashingMode === mode 
                        ? '#8B0000' 
                        : 'var(--surface-dial)',
                      stroke: isChosen ? '#8B0000' : 'var(--border-dial)',
                      strokeWidth: isChosen ? 2.5 : 1.5,
                      backdropFilter: 'blur(8px)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSectorClick(mode);
                    }}
                  />

                  <text
                    fontSize="9.5"
                    fontWeight="700"
                    letterSpacing="0.16em"
                    className="pointer-events-none select-none tracking-widest uppercase font-mono"
                    fill={isChosen ? '#F5F5DC' : 'var(--text-app)'}
                    dy="3.5"
                  >
                    <textPath
                      href={`#text-arc-${i}`}
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      {mode}
                    </textPath>
                  </text>
                </motion.g>
              );
            })}
          </g>

          <motion.circle 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isAssembled ? 0.4 : 0, scale: isAssembled ? 1 : 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            r="80" 
            fill="none" 
            stroke="var(--border-dial)" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            className="pointer-events-none" 
          />
        </svg>
      </div>
    </div>
  );
};
