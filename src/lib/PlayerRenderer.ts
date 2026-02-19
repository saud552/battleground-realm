// ============================================
// PlayerRenderer - Body + Skin layer rendering
// Supports cosmetic skin levels 1-5 with visual-only effects
// ============================================

export interface PlayerRenderData {
  x: number;
  y: number;
  rotation: number;
  health: number;
  armor: number;
  team: 'blue' | 'red';
  username: string;
  skinId: string;
  skinLevel: number;
  isLocal: boolean;
  isDead: boolean;
}

// Skin color palettes keyed by skinId
const SKIN_COLORS: Record<string, { body: string; accent: string }> = {
  soldier: { body: '#556b2f', accent: '#8fbc8f' },
  medic: { body: '#4a7c5a', accent: '#90ee90' },
  sniper_skin: { body: '#2f4f4f', accent: '#708090' },
  commander: { body: '#b8860b', accent: '#ffd700' },
};

// Skin level visual enhancements (cosmetic only)
const LEVEL_EFFECTS: Record<number, { glowColor: string; glowRadius: number; hasTrail: boolean; hasRing: boolean; particleColor: string }> = {
  1: { glowColor: '', glowRadius: 0, hasTrail: false, hasRing: false, particleColor: '' },
  2: { glowColor: '#00ff88', glowRadius: 4, hasTrail: false, hasRing: false, particleColor: '' },
  3: { glowColor: '#00ccff', glowRadius: 8, hasTrail: true, hasRing: false, particleColor: '#00ccff' },
  4: { glowColor: '#ff8800', glowRadius: 12, hasTrail: true, hasRing: true, particleColor: '#ff8800' },
  5: { glowColor: '#ff00ff', glowRadius: 16, hasTrail: true, hasRing: true, particleColor: '#ff00ff' },
};

export class PlayerRenderer {
  static readonly RADIUS = 15;

  static render(
    ctx: CanvasRenderingContext2D,
    data: PlayerRenderData,
    screenX: number,
    screenY: number,
    timestamp: number,
  ) {
    const r = this.RADIUS;
    const skinColors = SKIN_COLORS[data.skinId] ?? SKIN_COLORS.soldier;
    const levelFx = LEVEL_EFFECTS[Math.min(5, Math.max(1, data.skinLevel))] ?? LEVEL_EFFECTS[1];
    const teamColor = data.team === 'blue' ? '#4d8fff' : '#ff4d4d';

    if (data.isDead) {
      ctx.globalAlpha = 0.3;
    }

    // === Level glow ring (levels 4-5) ===
    if (levelFx.hasRing && data.health > 0) {
      const pulse = Math.sin(timestamp / 400) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(screenX, screenY, r + 8, 0, Math.PI * 2);
      ctx.strokeStyle = levelFx.glowColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = data.isDead ? 0.1 : pulse * 0.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = data.isDead ? 0.3 : 1;
    }

    // === Teammate outline (local player) ===
    if (data.isLocal) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // === Skin level glow ===
    if (levelFx.glowRadius > 0 && data.health > 0) {
      ctx.shadowColor = levelFx.glowColor;
      ctx.shadowBlur = levelFx.glowRadius;
    }

    // === Body layer (team-colored base) ===
    ctx.beginPath();
    ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
    ctx.fillStyle = teamColor;
    ctx.fill();

    // === Skin overlay layer (inner ring) ===
    ctx.beginPath();
    ctx.arc(screenX, screenY, r - 3, 0, Math.PI * 2);
    ctx.fillStyle = skinColors.body;
    ctx.globalAlpha = data.isDead ? 0.2 : 0.6;
    ctx.fill();
    ctx.globalAlpha = data.isDead ? 0.3 : 1;

    // === Accent detail (shoulder patches) ===
    const patchAngle1 = data.rotation + Math.PI / 2;
    const patchAngle2 = data.rotation - Math.PI / 2;
    ctx.fillStyle = skinColors.accent;
    ctx.globalAlpha = data.isDead ? 0.15 : 0.8;
    ctx.beginPath();
    ctx.arc(
      screenX + Math.cos(patchAngle1) * (r - 4),
      screenY + Math.sin(patchAngle1) * (r - 4),
      3, 0, Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenX + Math.cos(patchAngle2) * (r - 4),
      screenY + Math.sin(patchAngle2) * (r - 4),
      3, 0, Math.PI * 2,
    );
    ctx.fill();
    ctx.globalAlpha = data.isDead ? 0.3 : 1;

    ctx.shadowBlur = 0;

    // === Direction indicator (weapon barrel) ===
    const tipDist = r + 6;
    const tipX = screenX + Math.cos(data.rotation) * tipDist;
    const tipY = screenY + Math.sin(data.rotation) * tipDist;
    const barrelWidth = 3;

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = barrelWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(
      screenX + Math.cos(data.rotation) * (r - 2),
      screenY + Math.sin(data.rotation) * (r - 2),
    );
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    // === Health bar ===
    if (data.health > 0 && data.health < 100) {
      const barW = r * 2;
      const barX = screenX - barW / 2;
      const barY = screenY - r - 12;
      ctx.fillStyle = '#222';
      ctx.fillRect(barX, barY, barW, 4);
      const hpColor = data.health > 50 ? '#00ff44' : data.health > 20 ? '#ffcc00' : '#ff3333';
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barW * (data.health / 100), 4);

      // Armor sub-bar
      if (data.armor > 0) {
        ctx.fillStyle = '#4488ff';
        ctx.fillRect(barX, barY + 5, barW * (data.armor / 100), 2);
      }
    }

    // === Username ===
    if (!data.isLocal) {
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(data.username, screenX, screenY - r - (data.health < 100 ? 16 : 6));
    }

    ctx.globalAlpha = 1;
  }
}
