// ============================================
// WeaponSystem - Standalone weapon management
// Handles firing, reloading, ammo, and skin levels
// ============================================

import {
  WEAPONS, WeaponConfig, WeaponState, AmmoType,
  createDefaultWeaponState,
} from './weapons';

export interface FiredBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
  ownerId: string;
  weaponType: WeaponConfig['type'];
}

export interface FireResult {
  bullets: FiredBullet[];
  muzzleX: number;
  muzzleY: number;
  muzzleAngle: number;
}

export class WeaponSystem {
  state: WeaponState;
  private onReloadComplete?: () => void;
  private reloadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(initialState?: WeaponState) {
    this.state = initialState ?? createDefaultWeaponState();
  }

  get weapon(): WeaponConfig {
    return this.state.currentWeapon;
  }

  get canFire(): boolean {
    return !this.state.isReloading && this.state.ammoInMag > 0;
  }

  get needsReload(): boolean {
    return this.state.ammoInMag === 0 && this.state.reserveAmmo[this.weapon.ammoType] > 0;
  }

  get reloadProgress(): number {
    if (!this.state.isReloading) return 0;
    const elapsed = performance.now() - this.state.reloadStartTime;
    return Math.min(1, elapsed / this.weapon.reloadTime);
  }

  /** Attempt to fire. Returns bullets if successful, null otherwise. */
  tryFire(
    timestamp: number,
    playerX: number,
    playerY: number,
    angle: number,
    playerRadius: number,
    ownerId: string,
  ): FireResult | null {
    if (this.state.isReloading) return null;

    if (this.state.ammoInMag <= 0) {
      this.startReload();
      return null;
    }

    if (timestamp - this.state.lastShotTime < this.weapon.fireRate) return null;

    this.state.lastShotTime = timestamp;
    this.state.ammoInMag--;

    const bullets: FiredBullet[] = [];
    const muzzleDist = playerRadius + 4;
    const muzzleX = playerX + Math.cos(angle) * muzzleDist;
    const muzzleY = playerY + Math.sin(angle) * muzzleDist;

    for (let p = 0; p < this.weapon.pelletsPerShot; p++) {
      const spreadAngle = angle + (Math.random() - 0.5) * this.weapon.spread;
      const dirX = Math.cos(spreadAngle);
      const dirY = Math.sin(spreadAngle);
      bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: dirX * this.weapon.bulletSpeed,
        vy: dirY * this.weapon.bulletSpeed,
        life: this.weapon.bulletRange / this.weapon.bulletSpeed / 60,
        damage: this.weapon.damage,
        ownerId,
        weaponType: this.weapon.type,
      });
    }

    return { bullets, muzzleX, muzzleY, muzzleAngle: angle };
  }

  startReload(onComplete?: () => void): boolean {
    if (this.state.isReloading) return false;
    const ammoType = this.weapon.ammoType;
    if (this.state.reserveAmmo[ammoType] <= 0) return false;
    if (this.state.ammoInMag >= this.weapon.magazineSize) return false;

    this.state.isReloading = true;
    this.state.reloadStartTime = performance.now();
    this.onReloadComplete = onComplete;

    this.reloadTimer = setTimeout(() => {
      this.completeReload();
    }, this.weapon.reloadTime);

    return true;
  }

  private completeReload() {
    const ammoType = this.weapon.ammoType;
    const needed = this.weapon.magazineSize - this.state.ammoInMag;
    const available = this.state.reserveAmmo[ammoType];
    const toLoad = Math.min(needed, available);

    this.state.ammoInMag += toLoad;
    this.state.reserveAmmo[ammoType] -= toLoad;
    this.state.isReloading = false;
    this.reloadTimer = null;
    this.onReloadComplete?.();
  }

  cancelReload() {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
      this.reloadTimer = null;
    }
    this.state.isReloading = false;
  }

  switchWeapon(weaponId: string): boolean {
    const weapon = WEAPONS[weaponId];
    if (!weapon) return false;
    this.cancelReload();
    this.state.currentWeapon = weapon;
    // Keep current ammo but cap to new mag size
    this.state.ammoInMag = Math.min(this.state.ammoInMag, weapon.magazineSize);
    return true;
  }

  addAmmo(ammoType: AmmoType, amount: number) {
    this.state.reserveAmmo[ammoType] += amount;
  }

  /** Get display-friendly state snapshot */
  getDisplayState() {
    return {
      name: this.weapon.nameAr,
      weaponId: this.weapon.id,
      type: this.weapon.type,
      ammoInMag: this.state.ammoInMag,
      magSize: this.weapon.magazineSize,
      reserveAmmo: this.state.reserveAmmo[this.weapon.ammoType],
      isReloading: this.state.isReloading,
      reloadProgress: this.reloadProgress,
      skinLevel: this.state.skinLevel,
    };
  }

  destroy() {
    this.cancelReload();
  }
}
