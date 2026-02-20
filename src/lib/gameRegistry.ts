// ============================================
// Kilegram Alpha — Official Game Item Registry
// ============================================

// ---- CHARACTERS ----
export interface CharacterDef {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  currency: 'k_coins' | 'k_gems';
  colors: { primary: string; secondary: string; accent: string; emissive: string };
  armorStyle: 'heavy' | 'medium' | 'light' | 'digital';
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'ghost_riley',
    name: 'Ghost Riley',
    nameAr: 'غوست رايلي',
    description: 'Dark tactical operator with skull-motif visor and heavy armor plating.',
    rarity: 'legendary',
    price: 800,
    currency: 'k_gems',
    colors: { primary: '#1a1a2e', secondary: '#2d2d44', accent: '#c0c0c0', emissive: '#ff4444' },
    armorStyle: 'heavy',
  },
  {
    id: 'nova_prime',
    name: 'Nova Prime',
    nameAr: 'نوفا برايم',
    description: 'Sleek futuristic soldier with glowing cyan accents and streamlined armor.',
    rarity: 'epic',
    price: 500,
    currency: 'k_gems',
    colors: { primary: '#0a1628', secondary: '#1a3a5c', accent: '#00d4ff', emissive: '#00d4ff' },
    armorStyle: 'medium',
  },
  {
    id: 'viper_snake',
    name: 'Viper Snake',
    nameAr: 'فايبر سنيك',
    description: 'Agile stealth operative with green/dark camo tones and slim profile.',
    rarity: 'rare',
    price: 300,
    currency: 'k_coins',
    colors: { primary: '#1a2e1a', secondary: '#2d4422', accent: '#44ff44', emissive: '#22cc22' },
    armorStyle: 'light',
  },
  {
    id: 'shadow_exe',
    name: 'Shadow Exe',
    nameAr: 'شادو إكس',
    description: 'Digital warfare specialist with purple/neon highlights and angular armor.',
    rarity: 'epic',
    price: 500,
    currency: 'k_gems',
    colors: { primary: '#1a0a2e', secondary: '#2e1a4a', accent: '#bb44ff', emissive: '#9922ff' },
    armorStyle: 'digital',
  },
];

// ---- WEAPONS ----
export type AmmoType = '5.56mm' | '7.62mm' | '9mm' | '.300mag' | '12gauge';

export interface WeaponDef {
  id: string;
  name: string;
  nameAr: string;
  type: 'assault_rifle' | 'smg' | 'sniper' | 'shotgun';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  currency: 'k_coins' | 'k_gems';
  ammoType: AmmoType;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  bulletRange: number;
  magazineSize: number;
  reloadTime: number;
  spread: number;
  pelletsPerShot: number;
  description: string;
  colors: { body: string; accent: string; emissive: string };
}

export const WEAPON_CATALOG: WeaponDef[] = [
  {
    id: 'k416',
    name: 'K416',
    nameAr: 'K416',
    type: 'assault_rifle',
    rarity: 'common',
    price: 0,
    currency: 'k_coins',
    ammoType: '5.56mm',
    damage: 14,
    fireRate: 110,
    bulletSpeed: 11,
    bulletRange: 520,
    magazineSize: 30,
    reloadTime: 2000,
    spread: 0.04,
    pelletsPerShot: 1,
    description: 'Compact assault rifle with rail system, foregrip, and red-dot sight.',
    colors: { body: '#2a2a2a', accent: '#555555', emissive: '#ff2200' },
  },
  {
    id: 'ak_death',
    name: 'AK-Death',
    nameAr: 'AK-ديث',
    type: 'assault_rifle',
    rarity: 'rare',
    price: 400,
    currency: 'k_coins',
    ammoType: '7.62mm',
    damage: 18,
    fireRate: 140,
    bulletSpeed: 10,
    bulletRange: 480,
    magazineSize: 30,
    reloadTime: 2200,
    spread: 0.06,
    pelletsPerShot: 1,
    description: 'Heavy assault rifle with curved magazine, wooden/black finish, menacing profile.',
    colors: { body: '#1a1a1a', accent: '#6b3a1a', emissive: '#ff4400' },
  },
  {
    id: 'awm_x',
    name: 'AWM-X',
    nameAr: 'AWM-إكس',
    type: 'sniper',
    rarity: 'legendary',
    price: 800,
    currency: 'k_gems',
    ammoType: '.300mag',
    damage: 60,
    fireRate: 1500,
    bulletSpeed: 18,
    bulletRange: 950,
    magazineSize: 5,
    reloadTime: 3500,
    spread: 0.008,
    pelletsPerShot: 1,
    description: 'Long bolt-action sniper with scope, bipod, and heavy barrel.',
    colors: { body: '#1a1a1a', accent: '#333333', emissive: '#00ccff' },
  },
  {
    id: 'vector_neon',
    name: 'Vector-Neon',
    nameAr: 'فكتور-نيون',
    type: 'smg',
    rarity: 'rare',
    price: 350,
    currency: 'k_coins',
    ammoType: '9mm',
    damage: 9,
    fireRate: 70,
    bulletSpeed: 9,
    bulletRange: 320,
    magazineSize: 33,
    reloadTime: 1400,
    spread: 0.07,
    pelletsPerShot: 1,
    description: 'Compact SMG with neon-accented body and folding stock.',
    colors: { body: '#0a0a1a', accent: '#00ff88', emissive: '#00ff88' },
  },
  {
    id: 's12_breacher',
    name: 'S12-Breacher',
    nameAr: 'S12-بريتشر',
    type: 'shotgun',
    rarity: 'epic',
    price: 600,
    currency: 'k_gems',
    ammoType: '12gauge',
    damage: 16,
    fireRate: 750,
    bulletSpeed: 8,
    bulletRange: 180,
    magazineSize: 8,
    reloadTime: 2800,
    spread: 0.28,
    pelletsPerShot: 8,
    description: 'Bulky tactical shotgun with drum magazine and wide barrel.',
    colors: { body: '#2a1a1a', accent: '#cc3300', emissive: '#ff4400' },
  },
];

// ---- HELMETS ----
export interface HelmetDef {
  id: string;
  name: string;
  nameAr: string;
  armor: number;
  rarity: 'common' | 'rare' | 'epic';
  price: number;
  currency: 'k_coins' | 'k_gems';
  description: string;
  color: string;
}

export const HELMETS: HelmetDef[] = [
  { id: 'recon_cap', name: 'Recon Cap', nameAr: 'قبعة الاستطلاع', armor: 15, rarity: 'common', price: 100, currency: 'k_coins', description: 'Light tactical cap with basic protection.', color: '#3a5a3a' },
  { id: 'tactical_ops', name: 'Tactical Ops', nameAr: 'خوذة تكتيكية', armor: 35, rarity: 'rare', price: 300, currency: 'k_coins', description: 'Mid-tier helmet with visor and comms integration.', color: '#2a2a3a' },
  { id: 'titanium_juggernaut', name: 'Titanium Juggernaut', nameAr: 'جاغرنوت تيتانيوم', armor: 60, rarity: 'epic', price: 200, currency: 'k_gems', description: 'Heavy-duty full-face helmet with maximum ballistic protection.', color: '#1a1a2e' },
];

// ---- BACKPACKS ----
export interface BackpackDef {
  id: string;
  name: string;
  nameAr: string;
  capacity: number;
  rarity: 'common' | 'rare' | 'epic';
  price: number;
  currency: 'k_coins' | 'k_gems';
  description: string;
  color: string;
}

export const BACKPACKS: BackpackDef[] = [
  { id: 'light_scout', name: 'Light Scout', nameAr: 'حقيبة كشاف', capacity: 100, rarity: 'common', price: 80, currency: 'k_coins', description: 'Compact sling pack for essentials.', color: '#3a4a3a' },
  { id: 'commando', name: 'Commando', nameAr: 'كوماندو', capacity: 200, rarity: 'rare', price: 250, currency: 'k_coins', description: 'Military-grade pack with MOLLE system.', color: '#2a3a2a' },
  { id: 'elite_expedition', name: 'Elite Expedition', nameAr: 'إليت إكسبيديشن', capacity: 350, rarity: 'epic', price: 150, currency: 'k_gems', description: 'Full-size expedition pack with max storage.', color: '#1a2a3a' },
];

// ---- RARITY STYLING ----
export const RARITY_COLORS: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  common: { text: 'text-muted-foreground', border: 'border-border', bg: 'bg-muted/30', glow: '' },
  rare: { text: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10', glow: 'shadow-[0_0_10px_hsl(var(--neon-green)/0.2)]' },
  epic: { text: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/10', glow: 'shadow-[0_0_14px_hsl(var(--kilegram-blue)/0.3)]' },
  legendary: { text: 'text-gold', border: 'border-gold/30', bg: 'bg-gold/10', glow: 'shadow-[0_0_18px_hsl(var(--gold)/0.35)]' },
};
