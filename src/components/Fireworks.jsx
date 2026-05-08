import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.006;
    this.size = Math.random() * 3.5 + 1.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.035;
    this.vx *= 0.985;
    this.vy *= 0.985;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Firework {
  constructor(canvasW, canvasH) {
    this.x = canvasW * 0.15 + Math.random() * canvasW * 0.7;
    this.y = canvasH;
    this.targetY = canvasH * 0.1 + Math.random() * canvasH * 0.35;
    this.speed = Math.random() * 3 + 4;
    this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.25;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.exploded = false;
    this.particles = [];
    this.hue = Math.floor(Math.random() * 360);
  }

  update() {
    if (!this.exploded) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y <= this.targetY || this.vy > 0) this.explode();
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].alpha <= 0) this.particles.splice(i, 1);
    }
  }

  explode() {
    this.exploded = true;
    const count = 60;
    const saturation = 100;
    const lightness = 60;
    for (let i = 0; i < count; i++) {
      const hue = this.hue + (Math.random() - 0.5) * 60;
      this.particles.push(
        new Particle(this.x, this.y, `hsl(${hue}, ${saturation}%, ${lightness + Math.random() * 15}%)`)
      );
    }
  }

  draw(ctx) {
    if (!this.exploded) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`;
      ctx.shadowBlur = 10;
      ctx.fillStyle = `hsl(${this.hue}, 100%, 80%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const p of this.particles) p.draw(ctx);
  }

  isDead() {
    return this.exploded && this.particles.length === 0;
  }
}

export default function Fireworks({ active, onToggle }) {
  const canvasRef = useRef(null);
  const fireworksRef = useRef([]);
  const animFrameRef = useRef(null);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fw = new Firework(canvas.width, canvas.height);
    fw.explode();
    fireworksRef.current.push(fw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (active) {
      const launchInterval = setInterval(() => {
        if (fireworksRef.current.length < 6) {
          const fw = new Firework(canvas.width, canvas.height);
          fireworksRef.current.push(fw);
        }
      }, 400);

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
          const fw = fireworksRef.current[i];
          fw.update();
          fw.draw(ctx);
          if (fw.isDead()) fireworksRef.current.splice(i, 1);
        }
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        clearInterval(launchInterval);
        cancelAnimationFrame(animFrameRef.current);
        fireworksRef.current = [];
      };
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active]);

  return (
    <>
      <div className="fireworks-canvas-container">
        <canvas ref={canvasRef} style={{ pointerEvents: 'none' }} />
      </div>
      <motion.button
        className="celebrate-btn"
        onClick={() => { if (onToggle) onToggle(); else launch(); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="icon">{active ? 'stop_circle' : 'celebration'}</span>
        {active ? 'ឈប់' : 'អបអរ'}
      </motion.button>
    </>
  );
}
