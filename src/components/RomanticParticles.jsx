import { useEffect, useRef } from 'react';

/*
 * Realistic firefly simulation
 *
 * Each firefly has:
 *  - Organic floating/bobbing motion via layered sine waves
 *  - A realistic glow pattern (slow brighten, quick dim)
 *  - Subtle positional jitter (wing buzz)
 *  - Warm bioluminescent colors (yellow-green → amber)
 *
 * Performance-aware:
 *  - Respects prefers-reduced-motion
 *  - Caps DPR at 2 to avoid overdraw on retina
 *  - Limits active fireflies to 28
 *  - No shadowBlur (use layered radial gradients instead — faster)
 */

const GLOW_COLORS = [
  { inner: 'rgba(232, 255, 128, 0.9)', mid: 'rgba(200, 240, 80, 0.3)', outer: 'rgba(180, 230, 60, 0)' },   // yellow-green
  { inner: 'rgba(255, 240, 140, 0.9)', mid: 'rgba(240, 210, 60, 0.3)', outer: 'rgba(220, 190, 40, 0)' },   // warm amber
  { inner: 'rgba(200, 255, 180, 0.85)', mid: 'rgba(160, 230, 120, 0.25)', outer: 'rgba(140, 210, 100, 0)' }, // soft green
  { inner: 'rgba(255, 220, 100, 0.85)', mid: 'rgba(240, 190, 50, 0.25)', outer: 'rgba(220, 170, 30, 0)' },  // golden
];

function createFirefly(w, h) {
  const orbitX = Math.random() * w;
  const orbitY = Math.random() * h;
  const radius = 30 + Math.random() * 120;        // orbit radius
  const angle = Math.random() * Math.PI * 2;
  const orbitSpeed = 0.0006 + Math.random() * 0.001;  // slow orbit
  const bobSpeed = 0.0008 + Math.random() * 0.0015;
  const bobAmp = 8 + Math.random() * 20;

  return {
    // Orbit center — fireflies drift their orbit center slowly
    centerX: orbitX,
    centerY: orbitY,
    centerDriftX: (Math.random() - 0.5) * 0.08,
    centerDriftY: (Math.random() - 0.5) * 0.06,

    // Orbital position
    radius,
    angle,
    orbitSpeed,

    // Vertical bobbing (like actual firefly hovering)
    bobPhase: Math.random() * Math.PI * 2,
    bobSpeed,
    bobAmp,

    // Jitter (simulates wing motion — tiny, fast)
    jitterPhase: Math.random() * Math.PI * 2,
    jitterSpeed: 0.08 + Math.random() * 0.06,
    jitterAmp: 0.3 + Math.random() * 0.4,

    // Size
    size: 2.5 + Math.random() * 2.5,
    bodySize: 1.2 + Math.random() * 0.6,

    // Glow pattern — fireflies glow in irregular pulses
    glowPhase: Math.random() * Math.PI * 2,
    glowDuration: 2000 + Math.random() * 3000,   // ms for full cycle
    glowOnRatio: 0.3 + Math.random() * 0.25,      // what fraction of cycle is "on" (actual bugs: ~0.3-0.5)
    glowIntensity: 0.4 + Math.random() * 0.6,      // max brightness multiplier

    // Palette
    palette: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
  };
}

export default function RomanticParticles() {
  const canvasRef = useRef(null);
  const firefliesRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let active = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      // Still render static fireflies but don't animate
      firefliesRef.current = Array.from({ length: 14 }, () => createFirefly(w, h));
      for (const f of firefliesRef.current) {
        ctx.save();
        ctx.translate(f.centerX, f.centerY);

        // Draw body
        ctx.fillStyle = f.palette.inner;
        ctx.beginPath();
        ctx.arc(0, 0, f.bodySize, 0, Math.PI * 2);
        ctx.fill();

        // Dim glow
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, f.size * 5);
        grad.addColorStop(0, f.palette.inner.replace('0.9', '0.15'));
        grad.addColorStop(0.4, f.palette.mid);
        grad.addColorStop(1, f.palette.outer);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, f.size * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
      return;
    }

    // Spawn initial fireflies
    firefliesRef.current = Array.from({ length: 22 + Math.floor(Math.random() * 6) }, () => createFirefly(w, h));

    const animate = (time) => {
      if (!active) return;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < firefliesRef.current.length; i++) {
        const f = firefliesRef.current[i];

        // Slow drift of orbit center
        f.centerX += f.centerDriftX + Math.sin(time * 0.0001 + i) * 0.02;
        f.centerY += f.centerDriftY + Math.cos(time * 0.00008 + i * 1.3) * 0.015;

        // Wrap around edges smoothly
        const margin = 150;
        if (f.centerX < -margin) f.centerX = w + margin;
        if (f.centerX > w + margin) f.centerX = -margin;
        if (f.centerY < -margin) f.centerY = h + margin;
        if (f.centerY > h + margin) f.centerY = -margin;

        // Orbit around center
        f.angle += f.orbitSpeed;
        const ox = Math.cos(f.angle) * f.radius;
        const oy = Math.sin(f.angle * 0.7) * f.radius * 0.6;

        // Vertical bob
        f.bobPhase += f.bobSpeed;
        const by = Math.sin(f.bobPhase) * f.bobAmp;

        // Jitter
        f.jitterPhase += f.jitterSpeed;
        const jx = Math.sin(f.jitterPhase) * f.jitterAmp;
        const jy = Math.cos(f.jitterPhase * 1.3) * f.jitterAmp;

        const fx = f.centerX + ox + jx;
        const fy = f.centerY + oy + by + jy;

        // Glow pulse — realistic firefly pattern: slow fade up, faster fade down
        const cycleMs = f.glowDuration;
        const t = (time % cycleMs) / cycleMs;
        let glow;
        if (t < f.glowOnRatio) {
          // "On" phase — smooth raise + sustain
          const inPhase = t / f.glowOnRatio;
          if (inPhase < 0.2) {
            // Fade up (slow)
            glow = Math.sin(inPhase / 0.2 * Math.PI * 0.5) * f.glowIntensity;
          } else if (inPhase < 0.85) {
            // Sustain
            glow = f.glowIntensity;
          } else {
            // Fade down (quicker)
            const decay = (inPhase - 0.85) / 0.15;
            glow = f.glowIntensity * (1 - decay * decay);
          }
        } else {
          // "Off" phase — very dim ambient glow
          glow = 0.04 + Math.random() * 0.02;
        }

        // Clamp
        glow = Math.max(0.02, Math.min(1, glow));

        // ---- DRAW ----

        // 1. Outer glow (large, soft)
        const glowRadius = f.size * (3 + glow * 4);
        const gradOuter = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowRadius);
        const g = glow;
        gradOuter.addColorStop(0, `rgba(255, 250, 200, ${(g * 0.85).toFixed(3)})`);
        gradOuter.addColorStop(0.2, `rgba(220, 230, 120, ${(g * 0.35).toFixed(3)})`);
        gradOuter.addColorStop(0.6, `rgba(180, 200, 60, ${(g * 0.12).toFixed(3)})`);
        gradOuter.addColorStop(1, `rgba(180, 200, 60, 0)`);

        ctx.save();
        ctx.globalAlpha = Math.min(1, glow + 0.1);
        ctx.fillStyle = gradOuter;
        ctx.beginPath();
        ctx.arc(fx, fy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Inner glow (medium, brighter)
        if (glow > 0.1) {
          const innerGlowRadius = f.size * (1.5 + glow * 2);
          const gradInner = ctx.createRadialGradient(fx, fy, 0, fx, fy, innerGlowRadius);
          gradInner.addColorStop(0, `rgba(255, 250, 200, ${(g * 0.7).toFixed(3)})`);
          gradInner.addColorStop(0.5, `rgba(200, 220, 100, ${(g * 0.2).toFixed(3)})`);
          gradInner.addColorStop(1, `rgba(200, 220, 100, 0)`);

          ctx.save();
          ctx.globalAlpha = Math.min(1, glow * 0.9);
          ctx.fillStyle = gradInner;
          ctx.beginPath();
          ctx.arc(fx, fy, innerGlowRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 3. Bright core (the firefly "body")
        ctx.save();
        ctx.globalAlpha = 0.3 + glow * 0.7;
        ctx.fillStyle = `rgba(255, 250, 200, ${(0.5 + glow * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(fx, fy, f.bodySize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Hot center point
        if (glow > 0.3) {
          ctx.save();
          ctx.globalAlpha = glow * 0.6;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx, fy, f.bodySize * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      cancelAnimationFrame(frameRef.current);
      firefliesRef.current = [];
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}
