// ============================================
// نظام الأسلحة المتقدم - Kilegram Alpha
// Official Roster — synced with gameRegistry
// ============================================

export type AmmoType = '5.56mm' | '7.62mm' | '9mm' | '.300mag' | '12gauge' | '.50ae' | '.45acp';

export interface WeaponConfig {
  id: string;
  name: string;
  nameAr: string;
  type: 'assault_rifle' | 'smg' | 'sniper' | 'shotgun' | 'pistol';
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  bulletRange: number;
  magazineSize: number;
  reloadTime: number;
  ammoType: AmmoType;
  spread: number;
  pelletsPerShot: number;
  emoji: string;
  soundId: string;
}

export const WEAPONS: Record<string, WeaponConfig> = {
  k416: {
    id: 'k416',
    name: 'K416',
    nameAr: 'K416',
    type: 'assault_rifle',
    damage: 14,
    fireRate: 110,
    bulletSpeed: 11,
    bulletRange: 520,
    magazineSize: 30,
    reloadTime: 2000,
    ammoType: '5.56mm',
    spread: 0.04,
    pelletsPerShot: 1,
    emoji: '🔫',
    soundId: 'ar_fire',
  },
  ak_death: {
    id: 'ak_death',
    name: 'AK-Death',
    nameAr: 'AK-ديث',
    type: 'assault_rifle',
    damage: 18,
    fireRate: 140,
    bulletSpeed: 10,
    bulletRange: 480,
    magazineSize: 30,
    reloadTime: 2200,
    ammoType: '7.62mm',
    spread: 0.06,
    pelletsPerShot: 1,
    emoji: '🔫',
    soundId: 'ar_fire',
  },
  awm_x: {
    id: 'awm_x',
    name: 'AWM-X',
    nameAr: 'AWM-إكس',
    type: 'sniper',
    damage: 60,
    fireRate: 1500,
    bulletSpeed: 18,
    bulletRange: 950,
    magazineSize: 5,
    reloadTime: 3500,
    ammoType: '.300mag',
    spread: 0.008,
    pelletsPerShot: 1,
    emoji: '🔭',
    soundId: 'sniper_fire',
  },
  vector_neon: {
    id: 'vector_neon',
    name: 'Vector-Neon',
    nameAr: 'فكتور-نيون',
    type: 'smg',
    damage: 9,
    fireRate: 70,
    bulletSpeed: 9,
    bulletRange: 320,
    magazineSize: 33,
    reloadTime: 1400,
    ammoType: '9mm',
    spread: 0.07,
    pelletsPerShot: 1,
    emoji: '🔫',
    soundId: 'smg_fire',
  },
  s12_breacher: {
    id: 's12_breacher',
    name: 'S12-Breacher',
    nameAr: 'S12-بريتشر',
    type: 'shotgun',
    damage: 16,
    fireRate: 750,
    bulletSpeed: 8,
    bulletRange: 180,
    magazineSize: 8,
    reloadTime: 2800,
    ammoType: '12gauge',
    spread: 0.28,
    pelletsPerShot: 8,
    emoji: '🔫',
    soundId: 'shotgun_fire',
  },
};

export const DEFAULT_WEAPON = 'k416';

// Ammo display names
export const AMMO_NAMES: Record<AmmoType, string> = {
  '5.56mm': '5.56mm',
  '7.62mm': '7.62mm',
  '9mm': '9mm',
  '.300mag': '.300 Magnum',
  '12gauge': '12 Gauge',
  '.50ae': '.50 AE',
  '.45acp': '.45 ACP',
};

// Loot item types
export type LootType = 'ammo_556' | 'ammo_762' | 'ammo_9mm' | 'ammo_300' | 'ammo_12g' | 'medkit' | 'armor' | 'weapon';

export interface LootItem {
  id: string;
  x: number;
  y: number;
  type: LootType;
  amount: number;
  weaponId?: string;
  radius: number;
  emoji: string;
}

export const LOOT_CONFIGS: Record<LootType, { emoji: string; amount: number; radius: number }> = {
  ammo_556: { emoji: '📦', amount: 30, radius: 12 },
  ammo_762: { emoji: '📦', amount: 30, radius: 12 },
  ammo_9mm: { emoji: '📦', amount: 35, radius: 12 },
  ammo_300: { emoji: '📦', amount: 5, radius: 12 },
  ammo_12g: { emoji: '📦', amount: 12, radius: 12 },
  medkit: { emoji: '💊', amount: 25, radius: 14 },
  armor: { emoji: '🛡️', amount: 50, radius: 14 },
  weapon: { emoji: '🔫', amount: 1, radius: 16 },
};

// Weapon state for a player
export interface WeaponState {
  currentWeapon: WeaponConfig;
  ammoInMag: number;
  reserveAmmo: Record<AmmoType, number>;
  isReloading: boolean;
  reloadStartTime: number;
  lastShotTime: number;
  skinLevel: number;
}

export function createDefaultWeaponState(): WeaponState {
  return {
    currentWeapon: WEAPONS[DEFAULT_WEAPON],
    ammoInMag: WEAPONS[DEFAULT_WEAPON].magazineSize,
    reserveAmmo: {
      '5.56mm': 90,
      '7.62mm': 0,
      '9mm': 0,
      '.300mag': 0,
      '12gauge': 0,
      '.50ae': 0,
      '.45acp': 0,
    },
    isReloading: false,
    reloadStartTime: 0,
    lastShotTime: 0,
    skinLevel: 1,
  };
}

// XP calculation
export function calculateXP(kills: number, placement: number, survived: boolean): number {
  let xp = kills * 20;
  if (placement === 1) xp += 100;
  else if (placement <= 3) xp += 50;
  if (survived) xp += 10;
  return xp;
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}
