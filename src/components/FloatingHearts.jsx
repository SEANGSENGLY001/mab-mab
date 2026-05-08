import { useEffect, useRef } from 'react';

const HEART_SYMBOLS = ['♥', '♡', '💕', '💖', '💗', '💘', '❤️'];

export default function FloatingHearts() {
  const canvasRef = useRef(null);
  const heartsRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let active = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnInterval = setInterval(() => {
      if (!active || heartsRef.current.length > 10) return;
      heartsRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        size: Math.random() * 18 + 14,
        speed: Math.random() * 1 + 0.5,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.01,
        alpha: Math.random() * 0.25 + 0.15,
        symbol: HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)],
        color: Math.random() > 0.5 ? '#ff6b6b' : '#ff8fab',
      });
    }, 800);

    const animate = () => {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = heartsRef.current.length - 1; i >= 0; i--) {
        const h = heartsRef.current[i];
        h.y -= h.speed;
        h.x += Math.sin(h.phase) * 0.3;
        h.phase += h.swaySpeed;

        const fadeAlpha = Math.min(h.alpha, (canvas.height - h.y) / canvas.height * h.alpha * 3);

        ctx.save();
        ctx.globalAlpha = fadeAlpha;
        ctx.font = `${h.size}px serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = h.color;
        ctx.fillText(h.symbol, h.x, h.y);
        ctx.restore();

        if (h.y < -40) heartsRef.current.splice(i, 1);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      active = false;
      clearInterval(spawnInterval);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      heartsRef.current = [];
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
