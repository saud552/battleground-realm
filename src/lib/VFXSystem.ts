// ============================================
// VFXSystem - Visual Effects: muzzle flash, hit markers, particles
// ============================================

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface MuzzleFlash {
  x: number;
  y: number;
  angle: number;
  life: number;
  size: number;
}

export interface HitMarker {
  x: number;
  y: number;
  life: number;
  isKill: boolean;
}

export class VFXSystem {
  particles: Particle[] = [];
  muzzleFlashes: MuzzleFlash[] = [];
  hitMarkers: HitMarker[] = [];

  addMuzzleFlash(x: number, y: number, angle: number, weaponType: string) {
    const sizeMap: Record<string, number> = {
      assault_rifle: 12,
      smg: 8,
      sniper: 20,
      shotgun: 18,
    };
    this.muzzleFlashes.push({
      x, y, angle,
      life: 0.12,
      size: sizeMap[weaponType] ?? 12,
    });

    // Spark particles
    const count = weaponType === 'shotgun' ? 8 : 4;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        life: 0.15 + Math.random() * 0.1,
        maxLife: 0.25,
        color: Math.random() > 0.5 ? '#ffcc00' : '#ff8800',
        size: 1.5 + Math.random() * 1.5,
      });
    }
  }

  addHitMarker(x: number, y: number, isKill: boolean = false) {
    this.hitMarkers.push({ x, y, life: isKill ? 0.6 : 0.35, isKill });

    // Blood/spark particles on hit
    const color = isKill ? '#ff0000' : '#ff4444';
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2 + Math.random() * 0.15,
        maxLife: 0.35,
        color,
        size: 1 + Math.random() * 2,
      });
    }
  }

  update(dt: number) {
    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= dt;
      return p.life > 0;
    });

    // Muzzle flashes
    this.muzzleFlashes = this.muzzleFlashes.filter(m => {
      m.life -= dt;
      return m.life > 0;
    });

    // Hit markers
    this.hitMarkers = this.hitMarkers.filter(h => {
      h.life -= dt;
      return h.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, halfW: number, halfH: number) {
    // Muzzle flashes
    this.muzzleFlashes.forEach(m => {
      const sx = m.x - cameraX + halfW;
      const sy = m.y - cameraY + halfH;
      const alpha = m.life / 0.12;
      const r = m.size * alpha;

      // Core flash
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      grad.addColorStop(0, `rgba(255, 255, 220, ${alpha})`);
      grad.addColorStop(0.4, `rgba(255, 200, 50, ${alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // Directional cone
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(m.angle);
      ctx.fillStyle = `rgba(255, 240, 180, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 1.5, -r * 0.3);
      ctx.lineTo(r * 1.5, r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Particles
    this.particles.forEach(p => {
      const sx = p.x - cameraX + halfW;
      const sy = p.y - cameraY + halfH;
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Hit markers (X shape)
    this.hitMarkers.forEach(h => {
      const sx = h.x - cameraX + halfW;
      const sy = h.y - cameraY + halfH;
      const alpha = h.life / (h.isKill ? 0.6 : 0.35);
      const size = h.isKill ? 14 : 10;

      ctx.strokeStyle = h.isKill ? `rgba(255, 50, 50, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = h.isKill ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(sx - size / 2, sy - size / 2);
      ctx.lineTo(sx + size / 2, sy + size / 2);
      ctx.moveTo(sx + size / 2, sy - size / 2);
      ctx.lineTo(sx - size / 2, sy + size / 2);
      ctx.stroke();

      if (h.isKill) {
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('KILL', sx, sy - size);
      }
    });
  }
}
