// ============================================
// GameArena - Refactored with modular systems
// ============================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSquad } from '../context/SquadContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ArrowLeft } from 'lucide-react';
import { hapticImpact } from '../lib/telegram';
import { soundManager } from '../lib/soundManager';
import { WEAPONS, LootItem, LootType, LOOT_CONFIGS, AmmoType } from '../lib/weapons';
import { WeaponSystem, FiredBullet, FireResult } from '../lib/WeaponSystem';
import { VFXSystem } from '../lib/VFXSystem';
import { PlayerRenderer, PlayerRenderData } from '../lib/PlayerRenderer';

// Constants
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;
const PLAYER_RADIUS = PlayerRenderer.RADIUS;
const PLAYER_SPEED = 4;
const BULLET_SIZE = 4;
const GRID_SIZE = 50;
const GRID_COLOR = 'rgba(0, 166, 255, 0.15)';
const BROADCAST_INTERVAL = 50;
const REMOTE_TIMEOUT = 2000;
const ZONE_START_RADIUS = 800;
const ZONE_SHRINK_RATE = 50;
const ZONE_SHRINK_INTERVAL = 10000;
const ZONE_DAMAGE = 0.5;
const MIN_ZONE_RADIUS = 150;
const LOOT_SPAWN_COUNT = 30;

interface Vector2 { x: number; y: number }

interface RemotePlayer {
  userId: string; username: string;
  x: number; y: number;
  targetX: number; targetY: number;
  rotation: number; health: number;
  lastUpdate: number;
  team?: 'blue' | 'red';
  skin?: string;
  skinLevel?: number;
}

// Generate random loot items
function generateLoot(): LootItem[] {
  const types: LootType[] = ['ammo_556', 'ammo_9mm', 'ammo_300', 'ammo_12g', 'medkit', 'armor'];
  const weaponIds = Object.keys(WEAPONS);
  const items: LootItem[] = [];
  for (let i = 0; i < LOOT_SPAWN_COUNT; i++) {
    const isWeapon = Math.random() < 0.15;
    const type: LootType = isWeapon ? 'weapon' : types[Math.floor(Math.random() * types.length)];
    const config = LOOT_CONFIGS[type];
    items.push({
      id: `loot_${i}`,
      x: Math.random() * (MAP_WIDTH - 100) + 50,
      y: Math.random() * (MAP_HEIGHT - 100) + 50,
      type, amount: config.amount,
      weaponId: isWeapon ? weaponIds[Math.floor(Math.random() * weaponIds.length)] : undefined,
      radius: config.radius,
      emoji: isWeapon ? '🔫' : config.emoji,
    });
  }
  return items;
}

const WEAPON_LIST = Object.values(WEAPONS);

const GameArena = () => {
  const navigate = useNavigate();
  const { currentSquad, loading } = useSquad();
  const { user, addCoins, addXP } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastBroadcastTime = useRef<number>(0);

  // Systems
  const weaponSystem = useRef(new WeaponSystem());
  const vfxSystem = useRef(new VFXSystem());

  // Player state
  const [playerPos, setPlayerPos] = useState<Vector2>({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const playerVel = useRef<Vector2>({ x: 0, y: 0 });
  const playerRotation = useRef<number>(0);
  const [localHealth, setLocalHealth] = useState(100);
  const [armor, setArmor] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const bullets = useRef<FiredBullet[]>([]);
  const [kills, setKills] = useState(0);

  // Weapon display
  const [weaponDisplay, setWeaponDisplay] = useState(weaponSystem.current.getDisplayState());

  // Loot
  const lootItems = useRef<LootItem[]>(generateLoot());

  // Remote players
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());
  const [, forceUpdate] = useState({});

  // Teams & Zone
  const [myTeam, setMyTeam] = useState<'blue' | 'red'>('blue');
  const [zoneCenter] = useState<Vector2>({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [zoneRadius, setZoneRadius] = useState(ZONE_START_RADIUS);

  // Controls
  const [joystickActive, setJoystickActive] = useState(false);
  const joystickVector = useRef<Vector2>({ x: 0, y: 0 });
  const [shooting, setShooting] = useState(false);
  const touchStartPos = useRef<Vector2 | null>(null);
  const joystickBasePos = useRef<Vector2>({ x: 100, y: 100 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Weapon selector
  const [showWeaponSelector, setShowWeaponSelector] = useState(false);

  // Redirect if no squad
  useEffect(() => {
    if (!loading && !currentSquad) navigate('/');
  }, [currentSquad, loading, navigate]);

  // Cleanup
  useEffect(() => {
    return () => { weaponSystem.current.destroy(); };
  }, []);

  // Realtime channel
  useEffect(() => {
    if (!currentSquad || !user) return;
    const channel = supabase.channel(`room_${currentSquad.squad_code}`, {
      config: { broadcast: { self: true } },
    });

    channel
      .on('broadcast', { event: 'player_update' }, ({ payload }) => {
        if (payload.userId === user.id) return;
        const remote = remotePlayersRef.current.get(payload.userId);
        const now = Date.now();
        if (remote) {
          remote.targetX = payload.x;
          remote.targetY = payload.y;
          remote.rotation = payload.rotation;
          remote.health = payload.health;
          remote.lastUpdate = now;
        } else {
          remotePlayersRef.current.set(payload.userId, {
            ...payload, targetX: payload.x, targetY: payload.y, lastUpdate: now,
          });
        }
        forceUpdate({});
      })
      .on('broadcast', { event: 'player_hit' }, ({ payload }) => {
        if (payload.targetUserId === user.id) {
          setLocalHealth(prev => {
            const absorbed = Math.min(armor, payload.damage * 0.5);
            const actualDamage = payload.damage - absorbed;
            if (absorbed > 0) setArmor(a => Math.max(0, a - absorbed));
            const newHealth = Math.max(0, prev - actualDamage);
            if (newHealth <= 0 && !isDead) {
              setIsDead(true);
              channel.send({
                type: 'broadcast', event: 'player_died',
                payload: { userId: user.id, killerId: payload.killerId },
              });
            }
            return newHealth;
          });
          soundManager.playHit();
        }
      })
      .on('broadcast', { event: 'player_died' }, ({ payload }) => {
        if (payload.killerId === user.id) {
          addCoins(10);
          addXP(20);
          setKills(prev => prev + 1);
          hapticImpact('heavy');
        }
      })
      .on('broadcast', { event: 'game_started' }, ({ payload }) => {
        const { teams } = payload;
        if (teams.blue.includes(user.id)) setMyTeam('blue');
        else setMyTeam('red');
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [currentSquad, user]);

  // Canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleReload = useCallback(() => {
    const started = weaponSystem.current.startReload(() => {
      setWeaponDisplay(weaponSystem.current.getDisplayState());
    });
    if (started) {
      soundManager.playReload();
      setWeaponDisplay(weaponSystem.current.getDisplayState());
    }
  }, []);

  const handleSwitchWeapon = useCallback((weaponId: string) => {
    weaponSystem.current.switchWeapon(weaponId);
    setWeaponDisplay(weaponSystem.current.getDisplayState());
    setShowWeaponSelector(false);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let lastTimestamp = 0;

    const gameLoop = (timestamp: number) => {
      const dt = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 1 / 60;
      lastTimestamp = timestamp;

      if (isDead) {
        vfxSystem.current.update(dt);
        render(ctx, timestamp);
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const ws = weaponSystem.current;

      // Movement
      if (joystickActive) {
        const joy = joystickVector.current;
        const len = Math.hypot(joy.x, joy.y);
        if (len > 0) {
          playerVel.current.x = (joy.x / len) * PLAYER_SPEED;
          playerVel.current.y = (joy.y / len) * PLAYER_SPEED;
          playerRotation.current = Math.atan2(joy.y, joy.x);
        }
      } else {
        playerVel.current.x *= 0.95;
        playerVel.current.y *= 0.95;
        if (Math.abs(playerVel.current.x) < 0.1) playerVel.current.x = 0;
        if (Math.abs(playerVel.current.y) < 0.1) playerVel.current.y = 0;
      }

      setPlayerPos(prev => ({
        x: Math.max(PLAYER_RADIUS, Math.min(MAP_WIDTH - PLAYER_RADIUS, prev.x + playerVel.current.x)),
        y: Math.max(PLAYER_RADIUS, Math.min(MAP_HEIGHT - PLAYER_RADIUS, prev.y + playerVel.current.y)),
      }));

      // Shooting via WeaponSystem
      if (shooting) {
        const result: FireResult | null = ws.tryFire(
          timestamp, playerPos.x, playerPos.y,
          playerRotation.current, PLAYER_RADIUS, user?.id ?? '',
        );
        if (result) {
          bullets.current.push(...result.bullets);
          soundManager.playGunshot(ws.weapon.soundId);
          hapticImpact('light');
          vfxSystem.current.addMuzzleFlash(
            result.muzzleX, result.muzzleY,
            result.muzzleAngle, ws.weapon.type,
          );
          setWeaponDisplay(ws.getDisplayState());
        }
      }

      // Update reload progress display
      if (ws.state.isReloading) {
        setWeaponDisplay(ws.getDisplayState());
      }

      // Update bullets & check collisions
      bullets.current = bullets.current
        .map(b => {
          b.x += b.vx;
          b.y += b.vy;
          b.life -= 1 / 60;

          for (const [id, remote] of remotePlayersRef.current.entries()) {
            if (remote.health <= 0 || remote.team === myTeam) continue;
            const dist = Math.hypot(b.x - remote.x, b.y - remote.y);
            if (dist < PLAYER_RADIUS + BULLET_SIZE / 2) {
              remote.health -= b.damage;
              const isKill = remote.health <= 0;

              vfxSystem.current.addHitMarker(remote.x, remote.y, isKill);

              channelRef.current?.send({
                type: 'broadcast', event: 'player_hit',
                payload: { targetUserId: id, damage: b.damage, killerId: user?.id },
              });
              if (isKill) {
                channelRef.current?.send({
                  type: 'broadcast', event: 'player_died',
                  payload: { userId: id, killerId: user?.id },
                });
              }
              return null;
            }
          }
          return b;
        })
        .filter(b => b !== null && b.life > 0 && b.x >= 0 && b.x <= MAP_WIDTH && b.y >= 0 && b.y <= MAP_HEIGHT) as FiredBullet[];

      // Loot pickup
      lootItems.current = lootItems.current.filter(loot => {
        const dist = Math.hypot(playerPos.x - loot.x, playerPos.y - loot.y);
        if (dist < PLAYER_RADIUS + loot.radius) {
          soundManager.playPickup();
          hapticImpact('light');

          if (loot.type === 'medkit') {
            setLocalHealth(h => Math.min(100, h + loot.amount));
          } else if (loot.type === 'armor') {
            setArmor(a => Math.min(100, a + loot.amount));
          } else if (loot.type === 'weapon' && loot.weaponId) {
            handleSwitchWeapon(loot.weaponId);
          } else {
            const ammoMap: Record<string, AmmoType> = {
              ammo_556: '5.56mm', ammo_9mm: '9mm', ammo_300: '.300mag', ammo_12g: '12gauge',
            };
            const ammoType = ammoMap[loot.type];
            if (ammoType) {
              ws.addAmmo(ammoType, loot.amount);
              setWeaponDisplay(ws.getDisplayState());
            }
          }
          return false;
        }
        return true;
      });

      // Remote player interpolation
      const now = Date.now();
      remotePlayersRef.current.forEach((remote, id) => {
        remote.x += (remote.targetX - remote.x) * 0.1;
        remote.y += (remote.targetY - remote.y) * 0.1;
        if (now - remote.lastUpdate > REMOTE_TIMEOUT) remotePlayersRef.current.delete(id);
      });

      // Zone damage
      const distFromCenter = Math.hypot(playerPos.x - zoneCenter.x, playerPos.y - zoneCenter.y);
      if (distFromCenter > zoneRadius) {
        setLocalHealth(prev => Math.max(0, prev - ZONE_DAMAGE));
      }

      // Broadcast position
      if (timestamp - lastBroadcastTime.current > BROADCAST_INTERVAL) {
        lastBroadcastTime.current = timestamp;
        channelRef.current?.send({
          type: 'broadcast', event: 'player_update',
          payload: {
            userId: user?.id, username: user?.username,
            x: playerPos.x, y: playerPos.y,
            rotation: playerRotation.current,
            health: localHealth, team: myTeam,
            skin: user?.selectedSkin,
            skinLevel: ws.state.skinLevel,
          },
        });
      }

      // Update VFX
      vfxSystem.current.update(dt);

      render(ctx, timestamp);
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [joystickActive, shooting, playerPos, localHealth, isDead, user, myTeam, zoneCenter, zoneRadius, armor, handleReload, handleSwitchWeapon]);

  // Zone shrinking
  useEffect(() => {
    if (!currentSquad || currentSquad.status !== 'in-game') return;
    const interval = setInterval(() => {
      setZoneRadius(prev => Math.max(MIN_ZONE_RADIUS, prev - ZONE_SHRINK_RATE));
    }, ZONE_SHRINK_INTERVAL);
    return () => clearInterval(interval);
  }, [currentSquad]);

  // Render function
  const render = (ctx: CanvasRenderingContext2D, timestamp: number) => {
    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;
    const halfW = width / 2;
    const halfH = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    // Grid
    const offsetX = playerPos.x % GRID_SIZE;
    const offsetY = playerPos.y % GRID_SIZE;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let x = -offsetX; x < width; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = -offsetY; y < height; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Zone circle
    const zsx = zoneCenter.x - playerPos.x + halfW;
    const zsy = zoneCenter.y - playerPos.y + halfH;
    ctx.beginPath();
    ctx.arc(zsx, zsy, zoneRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Danger zone overlay
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(zsx, zsy, zoneRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
    ctx.fill();
    ctx.restore();

    // Loot items with glow
    lootItems.current.forEach(loot => {
      const sx = loot.x - playerPos.x + halfW;
      const sy = loot.y - playerPos.y + halfH;
      if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) return;

      // Glow effect
      const pulse = Math.sin(timestamp / 300 + loot.x) * 0.2 + 0.8;
      const glowColor = loot.type === 'weapon' ? 'rgba(255, 200, 50, 0.3)'
        : loot.type === 'medkit' ? 'rgba(50, 255, 50, 0.3)'
        : loot.type === 'armor' ? 'rgba(50, 100, 255, 0.3)'
        : 'rgba(255, 255, 255, 0.15)';

      ctx.beginPath();
      ctx.arc(sx, sy, loot.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.globalAlpha = pulse;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(sx, sy, loot.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = `${loot.radius}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loot.emoji, sx, sy);
    });

    // Bullets with trails
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    bullets.current.forEach(b => {
      const sx = b.x - playerPos.x + halfW;
      const sy = b.y - playerPos.y + halfH;
      if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) return;

      // Trail
      const trailLen = 6;
      const tx = sx - (b.vx / Math.hypot(b.vx, b.vy)) * trailLen;
      const ty = sy - (b.vy / Math.hypot(b.vx, b.vy)) * trailLen;
      ctx.strokeStyle = `rgba(255, 200, 50, ${Math.min(1, b.life * 2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, BULLET_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 50, ${Math.min(1, b.life * 3)})`;
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Remote players via PlayerRenderer
    remotePlayersRef.current.forEach(remote => {
      const sx = remote.x - playerPos.x + halfW;
      const sy = remote.y - playerPos.y + halfH;
      if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) return;

      const renderData: PlayerRenderData = {
        x: remote.x, y: remote.y,
        rotation: remote.rotation,
        health: remote.health,
        armor: 0,
        team: (remote.team as 'blue' | 'red') ?? 'red',
        username: remote.username,
        skinId: remote.skin ?? 'soldier',
        skinLevel: remote.skinLevel ?? 1,
        isLocal: false,
        isDead: remote.health <= 0,
      };
      PlayerRenderer.render(ctx, renderData, sx, sy, timestamp);
    });

    // Local player via PlayerRenderer
    const localData: PlayerRenderData = {
      x: playerPos.x, y: playerPos.y,
      rotation: playerRotation.current,
      health: localHealth,
      armor,
      team: myTeam,
      username: user?.username ?? '',
      skinId: user?.selectedSkin ?? 'soldier',
      skinLevel: weaponSystem.current.state.skinLevel,
      isLocal: true,
      isDead,
    };
    PlayerRenderer.render(ctx, localData, halfW, halfH, timestamp);

    // VFX layer (muzzle flashes, hit markers, particles)
    vfxSystem.current.render(ctx, playerPos.x, playerPos.y, halfW, halfH);

    // Death overlay
    if (isDead) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#ff3b3b';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 20;
      ctx.fillText('ELIMINATED', width / 2, height / 2 - 20);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 0;
      ctx.fillText(`💀 ${kills} قتلى`, width / 2, height / 2 + 20);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDead) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;

    if (x < rect.width / 2) {
      setJoystickActive(true);
      const pos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      touchStartPos.current = pos;
      joystickBasePos.current = pos;
      joystickVector.current = { x: 0, y: 0 };
    } else {
      setShooting(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDead || !joystickActive || !touchStartPos.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - joystickBasePos.current.x;
    const dy = y - joystickBasePos.current.y;
    const distance = Math.hypot(dx, dy);
    const maxDistance = 50;
    if (distance > maxDistance) {
      joystickVector.current = { x: Math.cos(Math.atan2(dy, dx)), y: Math.sin(Math.atan2(dy, dx)) };
    } else {
      joystickVector.current = { x: dx / maxDistance, y: dy / maxDistance };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickActive(false);
    setShooting(false);
    joystickVector.current = { x: 0, y: 0 };
    touchStartPos.current = null;
  };

  const ws = weaponSystem.current;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Back button */}
      <button
        onClick={() => isDead ? navigate('/') : window.confirm('مغادرة اللعبة؟') && navigate('/')}
        className="absolute top-4 left-4 z-10 bg-card/80 p-2 rounded-full border border-border text-foreground"
      >
        <ArrowLeft size={20} />
      </button>

      {/* HUD - Top right: Kills */}
      <div className="absolute top-4 right-4 z-10 bg-card/80 px-3 py-1.5 rounded-lg border border-border text-foreground text-sm font-mono">
        💀 {kills}
      </div>

      {/* HUD - Health & Armor */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-48">
        <div className="bg-card/80 rounded-lg p-2 border border-border">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">❤️</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="bg-neon-green h-2 rounded-full transition-all" style={{ width: `${localHealth}%` }} />
            </div>
            <span className="text-xs text-foreground font-mono">{Math.round(localHealth)}</span>
          </div>
          {armor > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs">🛡️</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div className="bg-kilegram-blue h-2 rounded-full transition-all" style={{ width: `${armor}%` }} />
              </div>
              <span className="text-xs text-foreground font-mono">{Math.round(armor)}</span>
            </div>
          )}
        </div>
      </div>

      {/* HUD - Weapon info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-card/90 rounded-xl px-4 py-2 border border-primary/20 text-center">
          <button
            onClick={() => setShowWeaponSelector(!showWeaponSelector)}
            className="text-xs text-primary font-bold mb-1 flex items-center gap-1 mx-auto"
          >
            {weaponDisplay.name}
            <span className="text-muted-foreground text-[10px]">
              Lv.{weaponDisplay.skinLevel}
            </span>
            <span className="text-[10px]">▲</span>
          </button>
          <div className="flex items-center gap-2">
            {weaponDisplay.isReloading ? (
              <div className="w-24">
                <div className="bg-muted rounded-full h-2">
                  <div className="bg-gold h-2 rounded-full transition-all" style={{ width: `${weaponDisplay.reloadProgress * 100}%` }} />
                </div>
                <div className="text-xs text-gold mt-0.5">إعادة تذخير...</div>
              </div>
            ) : (
              <span className="text-foreground font-mono text-lg">
                {weaponDisplay.ammoInMag} <span className="text-muted-foreground text-sm">/ {weaponDisplay.reserveAmmo}</span>
              </span>
            )}
          </div>
        </div>

        {/* Weapon selector popup */}
        {showWeaponSelector && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card/95 border border-border rounded-xl p-2 min-w-[200px] backdrop-blur-sm">
            {WEAPON_LIST.map(w => {
              const hasAmmo = ws.state.reserveAmmo[w.ammoType] > 0 || w.id === ws.weapon.id;
              return (
                <button
                  key={w.id}
                  onClick={() => handleSwitchWeapon(w.id)}
                  disabled={!hasAmmo}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center transition ${
                    w.id === weaponDisplay.weaponId
                      ? 'bg-primary/20 text-primary'
                      : hasAmmo
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground opacity-50'
                  }`}
                >
                  <span>{w.emoji} {w.nameAr}</span>
                  <span className="text-xs text-muted-foreground">
                    {w.id === weaponDisplay.weaponId ? `${ws.state.ammoInMag}/${ws.state.reserveAmmo[w.ammoType]}` : ws.state.reserveAmmo[w.ammoType]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Reload button */}
      {!weaponDisplay.isReloading && weaponDisplay.ammoInMag < ws.weapon.magazineSize && (
        <button
          onClick={handleReload}
          className="absolute bottom-20 right-4 z-10 bg-gold/20 text-gold px-3 py-2 rounded-lg border border-gold/40 text-sm font-bold"
        >
          🔄 تذخير
        </button>
      )}

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default GameArena;
