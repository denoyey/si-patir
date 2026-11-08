import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { LenisScrollEngine } from '../services/scroll/LenisScrollEngine';

/**
 * MotionTransition Component
 * High-end Motion Graphics Page Transition powered by GSAP.
 * Features staggered kinetic shutters, HUD geometric telemetry, glowing laser sweep,
 * and seamless scroll normalization.
 */
export function MotionTransition() {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const laserRef = useRef<HTMLDivElement | null>(null);
  const [targetLabel, setTargetLabel] = useState<string>('BERANDA');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Hindari animasi pada initial page mount agar langsung render cepat
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentPath = location.pathname;
    const label = currentPath === '/dashboard' ? 'LIVE MONITORING DASHBOARD' : 'PORTAL BERANDA';
    setTargetLabel(label);
    setIsAnimating(true);

    const slices = slicesRef.current.filter(Boolean);
    const hud = hudRef.current;
    const laser = laserRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      },
    });

    // Reset posisi awal
    gsap.set(containerRef.current, { display: 'flex', pointerEvents: 'auto' });
    gsap.set(slices, { yPercent: -100 });
    gsap.set(hud, { opacity: 0, scale: 0.85, y: 15 });
    gsap.set(laser, { left: '-100%', opacity: 0 });

    // 1. Kinetic Curtain Slice Entrance (Staggered Cyber Shutter)
    tl.to(slices, {
      yPercent: 0,
      duration: 0.38,
      stagger: 0.05,
      ease: 'power4.inOut',
    })
      // 2. HUD Telemetry Entrance
      .to(
        hud,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.25,
          ease: 'back.out(1.7)',
        },
        '-=0.15'
      )
      // 3. Laser Sweep Across Screen
      .fromTo(
        laser,
        { left: '-50%', opacity: 1 },
        { left: '150%', opacity: 1, duration: 0.45, ease: 'power2.inOut' },
        '-=0.2'
      )
      // Scroll Reset tepat di balik curtain
      .add(() => {
        LenisScrollEngine.getInstance().resetToTop();
      })
      // 4. HUD Telemetry Exit
      .to(
        hud,
        {
          opacity: 0,
          scale: 1.08,
          y: -10,
          duration: 0.2,
          ease: 'power2.in',
        },
        '+=0.08'
      )
      // 5. Kinetic Curtain Slice Exit Downward
      .to(slices, {
        yPercent: 100,
        duration: 0.42,
        stagger: 0.05,
        ease: 'power4.inOut',
      })
      // 6. Sembunyikan container
      .set(containerRef.current, {
        display: 'none',
        pointerEvents: 'none',
      });

    return () => {
      tl.kill();
    };
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      style={{ display: 'none' }}
      className="fixed inset-0 z-[100] pointer-events-none flex flex-col overflow-hidden"
      aria-hidden={!isAnimating}
    >
      {/* 4 Staggered Kinetic Motion Slices */}
      <div className="absolute inset-0 flex flex-col w-full h-full">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            ref={(el) => { slicesRef.current[i] = el; }}
            className={`w-full flex-1 will-change-transform ${
              i % 2 === 0
                ? 'bg-gradient-to-r from-[#060911] via-[#0c1222] to-[#070b14]'
                : 'bg-gradient-to-r from-[#090e1c] via-[#0f172a] to-[#0a1020]'
            } border-b border-blue-500/10 shadow-2xl`}
          />
        ))}
      </div>

      {/* Laser Sweep Scanner Line */}
      <div
        ref={laserRef}
        className="absolute top-1/2 -translate-y-1/2 w-96 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] pointer-events-none z-10"
      />

      {/* Central Motion Graphics Telemetry HUD */}
      <div
        ref={hudRef}
        className="relative z-20 m-auto flex flex-col items-center justify-center p-6 text-center select-none"
      >
        {/* Animated Cyber Ring Icon */}
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-30" />
          <svg className="w-16 h-16 animate-spin text-blue-500" style={{ animationDuration: '4s' }} viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 6"
              className="opacity-40"
            />
            <circle
              cx="32"
              cy="32"
              r="22"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="25 60"
            />
          </svg>
          <div className="w-8 h-8 rounded-md bg-blue-600/30 border border-blue-400 text-white flex items-center justify-center font-mono font-black text-xs shadow-[0_0_12px_rgba(59,130,246,0.5)]">
            SP
          </div>
        </div>

        {/* Telemetry Typography */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-blue-400 font-bold">
            SI-PATIR // TRANSITION PROTOCOL
          </span>
        </div>

        <div className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans mt-0.5">
          {targetLabel}
        </div>

        {/* High-Tech Animated Equalizer / Progress Bar */}
        <div className="flex items-center gap-1 mt-3">
          {[40, 75, 50, 90, 60, 100, 45, 80, 55].map((h, idx) => (
            <div
              key={idx}
              className="w-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full animate-pulse"
              style={{
                height: `${h * 0.2}px`,
                animationDelay: `${idx * 0.08}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
